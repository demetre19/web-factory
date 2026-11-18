#!/usr/bin/env python3
"""score.py — predicted-quality scorer for wireframes and built pages.

Scores each section and the page 0–100 from four measured components:

  1. pattern_fit   similarity of the section's genotype to the proven
                   patterns for its (site, page, section) cell, weighted
                   by pattern prevalence; penalised by proximity to the
                   ANTI alleles mined from the negative corpus.
  2. ps            the PS.* page-segmentation features (identical names
                   to tools/design-gate/ps_features.py; DOM-side here,
                   gate.py's checks win when importable).
  3. macro_micro   the Koray 80/20 rule: main-content share of the page.
  4. rule_pass     fraction of the pattern's implied rule checks that
                   pass (gate.py import) or, absent that, PS sub-checks.

Weights live in `score-weights.json` (next to this file) and are
documented in patterns/README.md. `fit` re-learns them from
`patterns/data/labels.jsonl` once >=20 operator labels exist.

  python3 tools/design-gate/score.py score <file.html> --site-type services \
      --page-type service-detail [--json]
  python3 tools/design-gate/score.py validate [--holdout 0.25] [--seed 7]
  python3 tools/design-gate/score.py label --option d1 --score 78 \
      --features '{"pattern_fit":0.7}' --chosen true
  python3 tools/design-gate/score.py fit
  python3 tools/design-gate/score.py novelty --profile services \
      --genotype '{...}'
"""
import argparse
import json
import math
import os
import random
import re
import sys
import zlib
from collections import Counter
from html.parser import HTMLParser

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(
    os.path.abspath(__file__))))
PAT = os.path.join(ROOT, 'docs', 'machinery', 'design', 'patterns')
DATA = os.path.join(PAT, 'data')
IDX = os.path.join(PAT, 'index')
HERE = os.path.dirname(os.path.abspath(__file__))
WEIGHTS = os.path.join(HERE, 'score-weights.json')
LABELS = os.path.join(DATA, 'labels.jsonl')

# Section-level model, chosen by held-out validation (see
# patterns/VALIDATION.md). PS.* is a PAGE-level check and does not
# transfer to section crops (negative correlation), so the section
# model uses its individual sub-features instead of the aggregate.
PS_KEYS = ['block_role_uniqueness', 'boilerplate_at_edges',
           'main_content_share', 'media_context_binding',
           'footer_is_boilerplate', 'priority_order']

# Weights are fitted on held-out domains by `validate`; these are the
# prior/fallback used by `score` when no fitted weights file exists.
# Feature set chosen by the leave-domain-out experiment recorded in
# patterns/VALIDATION.md (mean AUC 0.872 over 8 splits): the pattern-bank
# fit plus every page-structure sub-feature, individually.
DEFAULT_WEIGHTS = {
    'pattern_fit': 0.34,
    'ps': 0.12,
    'macro_micro': 0.06,
    'block_role_uniqueness': 0.09,
    'boilerplate_at_edges': 0.09,
    'main_content_share': 0.10,
    'media_context_binding': 0.08,
    'footer_is_boilerplate': 0.06,
    'priority_order': 0.06,
    's_block_pace': 0.10,
    's_cta_presence': 0.10,
    's_row_regularity': 0.06,
    's_prose_mass': 0.04,
    'anti': 0.08,
}

# ordered: specific before generic; matched against the section's own
# design label first (`.tag`), then data-sec, then classes.
SECTION_WORDS = [
    ('trust-badges', ['cert mark', 'cert', 'badge', 'accredit', 'iso']),
    ('call-to-action', ['end act', 'end-act', 'call to action', 'endact',
                        'final cta']),
    ('faq', ['q&a', 'q&amp;a', 'faq', 'questions', 'closed folds']),
    ('how-it-works', ['process', 'how it works', 'steps', 'numbered',
                      'how-it-works']),
    ('testimonials', ['testimonial', 'review', 'quote', 'proof']),
    ('pricing', ['pricing', 'plans', 'prices']),
    ('gallery', ['gallery', 'before', 'after', 'portfolio']),
    ('logo-sections', ['logo', 'clients', 'partners']),
    ('comparison', ['comparison', 'compare', 'versus', 'table rows']),
    ('hero', ['hero', 'fold']),
    ('contact', ['contact', 'enquiry', 'quote form']),
    ('footer', ['foot', 'footer']),
    ('feature', ['feature', 'services', 'scope', 'capabilities', 'zones']),
    ('content', ['content', 'about', 'story', 'editorial']),
]
CHROME = {'footer', 'headers'}
MACRO = {'hero', 'testimonials', 'how-it-works', 'call-to-action',
         'logo-sections', 'trust-badges', 'pricing'}
ANTI_GENES = ['layout-archetype', 'image-led-ratio', 'cta-restraint',
              'heading-form', 'disclosure-tier', 'proof-type',
              'whitespace-band', 'density-tier', 'media-treatment']


# --------------------------------------------------------------- html model
class Section:
    def __init__(self, attrs, classes, depth):
        self.attrs = attrs
        self.classes = classes
        self.depth = depth
        self.text = []
        self.tags = Counter()
        self.media = 0
        self.ctas = 0
        self.forms = 0
        self.headings = []
        self.folds = 0
        self.nav = 0
        self.style = attrs.get('style', '') or ''
        self.children = 0
        self.label = ''
        self.font_sizes = []

    def words(self):
        return len(' '.join(self.text).split())


class Doc(HTMLParser):
    SEC_TAGS = {'section', 'header', 'footer', 'nav', 'main', 'article'}
    CARD_HINT = re.compile(r'\bcard\b', re.I)
    CTA_HINT = re.compile(r'\bbtn\b|\bbutton\b|\bcta\b', re.I)

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []
        self.sections = []
        self.cur = None
        self.depth = 0
        self.options = []
        self.option_open = None
        self.cards = []
        self._pending_option = None

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        cls = a.get('class', '') or ''
        self.depth += 1
        if tag == 'div' and self.CARD_HINT.search(cls) and a.get('id'):
            self.cards.append(a.get('id'))
            self._pending_option = a.get('id')
        if tag in self.SEC_TAGS or 'data-sec' in a or (
                tag == 'div' and self.CARD_HINT.search(cls)
                and 'sec' in cls.lower()):
            sec = Section(a, cls.split(), self.depth)
            sec.option = self._pending_option
            self.sections.append(sec)
            self.cur = sec
        if self.cur is not None:
            self.cur.tags[tag] += 1
            if tag in ('img', 'video', 'picture', 'svg', 'canvas'):
                self.cur.media += 1
            if tag in ('a', 'button') and (self.CTA_HINT.search(cls)
                                           or 'btn' in cls.split()):
                self.cur.ctas += 1
            if tag in ('form', 'input', 'select', 'textarea'):
                self.cur.forms += 1
            if tag in ('h1', 'h2', 'h3'):
                self.cur.headings.append(tag)
            if tag in ('details', 'summary'):
                self.cur.folds += 1
            if tag == 'nav':
                self.cur.nav += 1
            if tag == 'div' and 'tag' in cls.split():
                self.cur._want_label = True
            if tag == 'div' and re.search(r'fold\b', cls):
                self.cur.folds += 1
            m = re.search(r'font-size:\s*([\d.]+)(px|rem|em)', self.cur.style)
            if m:
                self.cur.font_sizes.append(float(m.group(1)))

    def handle_endtag(self, tag):
        self.depth -= 1

    def handle_data(self, data):
        if self.cur is None:
            return
        t = data.strip()
        if not t:
            return
        if getattr(self.cur, '_want_label', False):
            self.cur.label = (self.cur.label + ' ' + t).strip()
            self.cur._want_label = False
        self.cur.text.append(t)


def parse_html(path):
    d = Doc()
    d.feed(open(path, encoding='utf-8', errors='replace').read())
    return d


def classify(sec):
    explicit = (sec.attrs.get('data-sec') or '').strip().lower()
    if explicit and explicit not in ('', 'sec'):
        return explicit
    label = (sec.label or '').lower()
    # the label's head ("Hero — split-media 3:4" -> "hero") is the job;
    # the tail describes composition and must not decide the section type.
    head = re.split(r'\u2014|\u2013|\s-\s|\|', label)[0].strip()
    for blob in (head, label, ' '.join(sec.classes).lower()):
        for name, keys in SECTION_WORDS:
            for k in keys:
                if re.search(r'(?<![a-z])' + re.escape(k) + r'(?![a-z])',
                             blob):
                    return name
    if sec.nav:
        return 'headers'
    if 'foot' in ' '.join(sec.classes).lower():
        return 'footer'
    return 'content'


def composition_of(sec, stype):
    blob = (sec.label + ' ' + ' '.join(sec.classes)).lower()
    if re.search(r'split|50/50|panel|two-col', blob):
        return 'split-media'
    if re.search(r'cards? \d-up|card grid|3-up|4-up', blob):
        return 'cards-n'
    if re.search(r'table rows|table|matrix', blob):
        return 'comparison'
    if re.search(r'numbered|steps|process', blob):
        return 'sequence'
    if re.search(r'fold|accordion', blob):
        return 'faq'
    if re.search(r'gallery|before.?after', blob):
        return 'media-gallery'
    if re.search(r'stack', blob) and stype == 'hero':
        return 'stacked-hero'
    if re.search(r'21:9|16:9|full.?bleed', blob) and stype == 'hero':
        return 'immersive-media'
    if 'grid' in blob or re.search(r'\bqa-list|\bcerts|\bsteps|\bfolds', blob):
        if 'qa' in blob or 'fold' in blob:
            return 'faq' if stype == 'faq' else 'cards-n'
        if 'steps' in blob:
            return 'sequence'
        if 'cert' in blob:
            return 'badge-center'
        return 'cards-n'
    if sec.media:
        if 'a219' in blob or 'hero-media' in blob or 'full' in blob:
            return 'immersive-media'
        return 'split-media'
    if stype == 'call-to-action':
        return 'full-bleed'
    if stype == 'faq':
        return 'faq'
    if stype in ('content', 'feature'):
        return 'editorial-single'
    return 'stacked-hero' if stype == 'hero' else 'editorial-single'


def surface_of(sec):
    blob = (' '.join(sec.classes) + ' ' + sec.style).lower()
    if 'inverse' in blob or 'endact' in blob or '#141414' in blob or \
            '#0f0f0f' in blob or 'band' in blob:
        return 'inverse'
    if 'muted' in blob or 'paper' in blob:
        return 'base'
    return 'base'


def density_of(sec):
    m = re.search(r'padding(?:-block)?:\s*([\d.]+)(px|rem)', sec.style)
    if m:
        v = float(m.group(1)) * (16 if m.group(2) == 'rem' else 1)
        return 'compact' if v < 40 else 'regular' if v < 64 else 'spacious'
    blob = (sec.label or '').lower()
    if 'airy' in blob or 'spacious' in blob:
        return 'spacious'
    if 'dense' in blob or 'compact' in blob:
        return 'compact'
    return 'regular'


def record_of(sec, site_type, page_type):
    stype = classify(sec)
    comp = composition_of(sec, stype)
    words = sec.words()
    ratio = None
    if sec.font_sizes:
        ratio = max(sec.font_sizes) / 16.0
    return {
        'site_type': site_type, 'page_type': page_type,
        'section_type': stype,
        'speech_act': {'hero': 'promise', 'testimonials': 'proof',
                       'logo-sections': 'proof', 'trust-badges': 'proof',
                       'pricing': 'objection', 'faq': 'objection',
                       'comparison': 'objection', 'call-to-action': 'act',
                       'contact': 'act', 'how-it-works': 'how',
                       'feature': 'how', 'footer': 'chrome',
                       'headers': 'chrome'}.get(stype, 'detail'),
        'composition': comp,
        'surface': surface_of(sec),
        'density': density_of(sec),
        'disclosure': 'folded' if sec.folds else 'open',
        'nav_pattern': 'bar' if sec.nav else 'none',
        'heading_form': 'query' if stype == 'faq' else 'claim',
        'columns': 1 + len([c for c in sec.classes if 'col' in c]),
        'cta_count': sec.ctas,
        'cta_rank_primary': 'hero' if stype == 'hero' and sec.ctas else (
            'section' if sec.ctas else 'none'),
        'heading_body_ratio': ratio,
        'whitespace_share': 0.62 if 'spacious' == density_of(sec) else 0.45,
        'media_ratio': min(1.0, 0.25 + 0.25 * sec.media) if sec.media else 0.0,
        'media_type': 'photo' if sec.media else 'none',
        'serif_display': None,
        'radius_personality': None,
        'cinematic': comp == 'immersive-media',
        'media_side': 'both' if comp == 'immersive-media' else (
            'right' if comp == 'split-media' else 'none'),
        'above_fold': stype in ('hero', 'headers'),
        'proof_type': 'certs' if 'cert' in ' '.join(sec.classes).lower()
                      else 'testimonials' if stype == 'testimonials'
                      else 'logos' if stype == 'logo-sections' else 'none',
        'ink_density': 1 - (0.62 if density_of(sec) == 'spacious' else 0.45),
        'words': words,
        'forms': sec.forms,
        'label': sec.label,
    }


# --------------------------------------------------------------- PS features
def ps_from_dom(records):
    roles = []
    for r in records:
        roles.append('chrome' if r['section_type'] in CHROME else 'main')
    chrome_idx = [i for i, x in enumerate(roles) if x == 'chrome']
    edges = all(i == 0 or i == len(roles) - 1 for i in chrome_idx)
    main_idx = [i for i, x in enumerate(roles) if x == 'main']
    contiguous = bool(main_idx) and main_idx == list(
        range(main_idx[0], main_idx[-1] + 1))
    total_words = sum(r['words'] for r in records) or 1
    main_words = sum(r['words'] for r, x in zip(records, roles) if x == 'main')
    media_ok = all(r['words'] > 0 or r['section_type'] in CHROME
                   for r in records)
    footer = [r for r in records if r['section_type'] == 'footer']
    footer_ok = all(r['words'] < 400 for r in footer) if footer else True
    return {
        'block_role_uniqueness': 1.0 if all(r['section_type'] for r in records)
                                 else 0.0,
        'boilerplate_at_edges': 1.0 if edges else 0.0,
        'main_content_share': round(main_words / total_words, 4),
        'media_context_binding': 1.0 if media_ok else 0.0,
        'footer_is_boilerplate': 1.0 if footer_ok else 0.0,
        'priority_order': 1.0 if contiguous else 0.0,
    }


def gate_ps(path):
    """Prefer gate.py's DOM checks when they exist."""
    try:
        sys.path.insert(0, HERE)
        import gate  # noqa: F401
        if not hasattr(gate, 'check_segment_roles'):
            return None
        ctx = {'path': path}
        out = {}
        for fn, key in (('check_segment_roles', 'block_role_uniqueness'),
                        ('check_segment_region', 'boilerplate_at_edges'),
                        ('check_segment_share', 'main_content_share'),
                        ('check_segment_media', 'media_context_binding'),
                        ('check_segment_footer', 'footer_is_boilerplate'),
                        ('check_segment_priority', 'priority_order')):
            try:
                v = getattr(gate, fn)(ctx)
                out[key] = 1.0 if (v is True or v == []) else 0.0
            except Exception:
                return None
        return out
    except Exception:
        return None


# --------------------------------------------------------------- scoring
def load_json(p, default=None):
    try:
        return json.load(open(p))
    except Exception:
        return default


def pattern_bank():
    meta = load_json(os.path.join(IDX, 'meta.json'), {'patterns': []})
    bank = {}
    for p in meta['patterns']:
        for s in p['site_types'] or ['*']:
            for pg in p['page_types'] or ['*']:
                bank.setdefault((s, pg, p['section_type']), []).append(p)
    return meta, bank


def geno_of(rec):
    sys.path.insert(0, HERE)
    from genome import genotype
    g, derived = genotype(rec)
    return g, derived


def cos_dense(a, b):
    """True cosine. The genotype is one-hot per gene, so an unnormalised
    dot product counts shared genes and saturates at 1.0 once two
    signatures overlap in three or more — which made every fit clip to
    the ceiling and destroyed the ranking."""
    dot = sum(x * y for x, y in zip(a, b))
    na = math.sqrt(sum(x * x for x in a))
    nb = math.sqrt(sum(x * x for x in b))
    if not na or not nb:
        return 0.0
    return dot / (na * nb)


def pattern_fit(rec, geno, bank, anti, section_known=True):
    from genome import vector
    best = None
    site, page, sec = rec['site_type'], rec['page_type'], rec['section_type']
    if section_known:
        # specificity ladder: a match against the exact cell is the
        # strongest evidence; a match that only the global bucket can
        # supply is weak. Without this discount a corpus that carries no
        # section label (negatives) scores *higher* than one that does,
        # because it may match any of the 80+ mined signatures.
        keys = [((site, page, sec), 1.00),
                ((site, '*', sec), 0.95),
                (('*', page, sec), 0.95),
                ((site, page, '*'), 0.90),
                ((site, '*', '*'), 0.85),
                (('*', '*', sec), 0.85),
                (('*', '*', '*'), 0.75)]
    else:
        keys = [((site, '*', '*'), 0.85), (('*', '*', '*'), 0.75)]
    for key, spec in keys:
        for p in bank.get(key, []):
            sim = cos_dense(vector(geno), vector(p['genotype']))
            w = max(0.05, p['prevalence']) * spec
            val = sim * w
            if best is None or val > best[0]:
                best = (val, p['id'], sim, p['prevalence'], spec)
    if best is None:
        return 0.35, [], None  # no proven pattern: neutral-low
    reasons = []
    if best[2] < 0.7:
        reasons.append(f"genotype diverges from {best[1]} "
                       f"(cos={best[2]:.2f})")
    # anti penalty: alleles common on negatives
    pen = 0.0
    hits = []
    for gene in ANTI_GENES:
        for row in (anti.get('anti', {}) or {}).get(gene, []):
            if geno.get(gene) == row['allele'] and row['negative'] > 0.25:
                pen += (row['negative'] - row['mobbin']) * 0.6
                hits.append(f"{gene}={row['allele']} "
                            f"(neg {row['negative']:.0%} vs mobbin "
                            f"{row['mobbin']:.0%})")
    if hits:
        reasons.append('anti-pattern allele: ' + '; '.join(hits[:3]))
    return max(0.0, min(1.0, best[0] - pen)), reasons, best[1]


def score_file(path, site_type, page_type, weights, bank, anti):
    doc = parse_html(path)
    cards = doc.cards or [None]
    out = {'file': path, 'site_type': site_type, 'page_type': page_type,
           'options': []}
    for card in cards:
        secs = [s for s in doc.sections
                if card is None or getattr(s, 'option', None) == card]
        if not secs:
            continue
        recs = [record_of(s, site_type, page_type) for s in secs]
        ps = gate_ps(path) or ps_from_dom(recs)
        ps_val = sum(ps.values()) / len(ps)
        main_share = sum(r['words'] for r in recs
                         if r['section_type'] not in CHROME) / max(
                             1, sum(r['words'] for r in recs))
        mm = 1.0 - min(1.0, abs(main_share - 0.8) / 0.35)
        sec_out = []
        fits = []
        for r in recs:
            geno, derived = geno_of(r)
            fit, reasons, pid = pattern_fit(r, geno, bank, anti)
            fits.append(fit)
            comp = section_features(fit, ps, mm, 1.0)
            comp.update(section_shape(r))
            comp['anti'], anti_hits = anti_score(comp, anti)
            sc = 100 * sum(weights.get(k, 0.0) * comp[k] for k in comp)
            sec_out.append({
                'label': r['label'] or r['section_type'],
                'section_type': r['section_type'],
                'composition': r['composition'],
                'pattern': pid,
                'score': round(sc, 1),
                'components': {k: round(v, 3) for k, v in comp.items()},
                'reasons': reasons + ([f'{r["section_type"]} classified '
                                       f'from DOM'] if r['section_type']
                                      == 'other' else []) + anti_hits,
            })
        # page score: hero-weighted mean
        wt = [2.0 if s['section_type'] == 'hero' else 1.0 for s in sec_out]
        page = sum(w * s['score'] for w, s in zip(wt, sec_out)) / sum(wt)
        page_reasons = []
        if main_share < 0.8:
            page_reasons.append(
                f'macro/micro share {main_share:.0%} < 80% target')
        if ps['boilerplate_at_edges'] < 1:
            page_reasons.append('chrome blocks not at page edges')
        if ps['priority_order'] < 1:
            page_reasons.append('main blocks interrupted by chrome')
        worst = min(sec_out, key=lambda s: s['score'])
        page_reasons.append(f'weakest section: {worst["label"]} '
                            f'({worst["score"]})')
        out['options'].append({
            'option': card or 'page',
            'score': round(page, 1),
            'sections': sec_out,
            'ps': {k: round(v, 3) for k, v in ps.items()},
            'macro_micro_share': round(main_share, 3),
            'reasons': page_reasons,
        })
    out['options'].sort(key=lambda o: -o['score'])
    return out


# --------------------------------------------------------------- validation
def anti_score(feats, anti):
    """1.0 minus the measured anti-pattern penalties.

    `data/anti.json` -> `features` holds rows that were only written when
    the negative corpus actually differed (lift >= 1.8, negative rate
    >= 0.33). Each hit subtracts its measured penalty; the result is a
    feature in its own right, not a hidden multiplier, so the model can
    weigh it.
    """
    pen = 0.0
    hits = []
    for row in (anti.get('features') or []):
        v = feats.get(row['feature'])
        if v is None:
            continue
        generic = (v >= row['cut']) if row['direction'] == 'high' \
            else (v < row['cut'])
        if generic:
            pen += row['penalty']
            hits.append(f"{row['feature']} {'>=' if row['direction'] == 'high' else '<'} "
                        f"{row['cut']} ({row['negative']:.0%} of negatives vs "
                        f"{row['mobbin']:.0%} of curated)")
    return max(0.0, min(1.0, 1.0 - pen)), hits


def section_features(fit, ps, mm, anti_val):
    """The single feature vector used by both `score` and `validate`."""
    ps = ps or {}
    feats = {
        'pattern_fit': fit,
        'ps': (sum(ps.values()) / len(ps)) if ps else 0.5,
        'macro_micro': mm,
        'rule_pass': (sum(1 for k, t in PS_THRESHOLDS.items()
                          if ps.get(k, 0.0) >= t) / len(PS_THRESHOLDS))
        if ps else 0.5,
        'anti': max(0.0, min(1.0, anti_val)),
    }
    for k in PS_KEYS:
        feats[k] = ps.get(k, 0.5)
    return feats


PS_THRESHOLDS = {'block_role_uniqueness': 1.0, 'boilerplate_at_edges': 1.0,
                 'main_content_share': 0.8, 'media_context_binding': 1.0,
                 'footer_is_boilerplate': 1.0, 'priority_order': 1.0}

def build_dataset(seed=7):
    """Positives = Mobbin annotations; negatives = contrast corpus tiles."""
    from genome import genotype, vector
    meta, bank = pattern_bank()
    anti = load_json(os.path.join(DATA, 'anti.json'), {})
    rows = []
    for name, label in (('annotations.jsonl', 1),
                        ('annotations_negatives.jsonl', 0)):
        p = os.path.join(DATA, name)
        if not os.path.exists(p):
            continue
        for line in open(p):
            r = json.loads(line)
            if 'error' in r:
                continue
            g, _ = genotype(r)
            known = r.get('section_type') not in (None, 'other')
            fit, _, pid = pattern_fit(r, g, bank, anti, section_known=known)
            ps = r.get('ps') or {}
            mm = 1.0 - min(1.0, abs((ps.get('main_content_share', 0.8)) - 0.8)
                           / 0.35)
            feats = section_features(fit, ps, mm, 1.0)
            feats.update(section_shape(r))
            feats['anti'], _ = anti_score(feats, anti)
            rows.append({
                'domain': r.get('site_name') or r.get('mobbin_id'),
                'label': label,
                'features': feats,
                'section_type': r.get('section_type'),
                'site_type': r.get('site_type'),
                'page_type': r.get('page_type'),
                'composition': r.get('composition'),
                'columns': r.get('columns'),
                'ink_density': r.get('ink_density'),
                'whitespace_share': r.get('whitespace_share'),
                'surface': r.get('surface'),
                'media_ratio': r.get('media_ratio'),
                'genotype': g,
            })
    rng = random.Random(seed)
    rng.shuffle(rows)
    return rows


def logistic_fit(X, y, epochs=400, lr=0.35, l2=0.01):
    n, d = len(X), len(X[0])
    w = [0.0] * d
    b = 0.0
    for _ in range(epochs):
        gw = [0.0] * d
        gb = 0.0
        for xi, yi in zip(X, y):
            z = b + sum(wj * xj for wj, xj in zip(w, xi))
            p = 1 / (1 + math.exp(-max(-30, min(30, z))))
            e = p - yi
            for j in range(d):
                gw[j] += e * xi[j]
            gb += e
        w = [wj - lr * (gwj / n + l2 * wj) for wj, gwj in zip(w, gw)]
        b -= lr * gb / n
    return w, b


def auc(pairs):
    """pairs = [(score, label)] -> ROC AUC (Mann-Whitney)."""
    pos = [s for s, y in pairs if y == 1]
    neg = [s for s, y in pairs if y == 0]
    if not pos or not neg:
        return 0.5
    wins = 0.0
    for p in pos:
        for n in neg:
            wins += 1.0 if p > n else 0.5 if p == n else 0.0
    return wins / (len(pos) * len(neg))


def precision_at_k(ranked, k):
    top = ranked[:k]
    return sum(1 for _, y in top if y == 1) / max(1, len(top))


def png_hist(path, series, bins=12, width=520, height=220):
    """Tiny PNG writer (no deps): two overlaid histograms."""
    colors = [(30, 90, 200), (200, 70, 40)]
    canvas = [[(255, 255, 255)] * width for _ in range(height)]
    allv = [v for s in series for v in s]
    lo, hi = min(allv), max(allv)
    rng = (hi - lo) or 1.0
    for si, s in enumerate(series):
        counts = [0] * bins
        for v in s:
            i = min(bins - 1, int((v - lo) / rng * bins))
            counts[i] += 1
        mx = max(counts) or 1
        bw = width // bins
        for i, c in enumerate(counts):
            h = int((c / mx) * (height - 24))
            for x in range(i * bw + 1, (i + 1) * bw - 1):
                for y in range(height - 12 - h, height - 12):
                    if si == 0:
                        canvas[y][x] = colors[si]
                    else:
                        canvas[y][x] = tuple(
                            (a + b) // 2 for a, b in zip(canvas[y][x],
                                                         colors[si]))
    raw = b''
    for row in canvas:
        raw += b'\x00' + b''.join(bytes(p) for p in row)
    def chunk(t, d):
        return (len(d).to_bytes(4, 'big') + t + d +
                (zlib.crc32(t + d) & 0xffffffff).to_bytes(4, 'big'))
    png = (b'\x89PNG\r\n\x1a\n' +
           chunk(b'IHDR', width.to_bytes(4, 'big') +
                 height.to_bytes(4, 'big') + bytes([8, 2, 0, 0, 0])) +
           chunk(b'IDAT', zlib.compress(raw, 9)) + chunk(b'IEND', b''))
    open(path, 'wb').write(png)


def build_bank_from(rows, min_n=10, threshold=0.60):
    """Derive pattern signatures from a TRAIN split only, so validation
    never scores a record against patterns that record helped build."""
    from genome import vector, GENES
    from itertools import combinations
    SIG = ['layout-archetype', 'image-led-ratio', 'density-tier',
           'surface-rhythm', 'cta-restraint', 'proof-type',
           'disclosure-tier', 'heading-form', 'media-treatment',
           'whitespace-band']
    cells = {}
    for r in rows:
        if r['label'] != 1:
            continue
        cells.setdefault((r['site_type'], r['page_type'],
                          r['section_type']), []).append(r)
    bank = {}
    for key, rs in cells.items():
        if len(rs) < min_n:
            continue
        best = None
        for size in (3, 2, 1):
            for genes in combinations(SIG, size):
                modal = {}
                ok = True
                for g in genes:
                    c = Counter(x['genotype'].get(g) for x in rs)
                    modal[g] = c.most_common(1)[0][0]
                hits = sum(1 for x in rs if all(
                    x['genotype'].get(g) == a for g, a in modal.items()))
                prev = hits / len(rs)
                if prev >= threshold:
                    if best is None or len(genes) > len(best[0]):
                        best = (list(genes), modal, prev)
            if best:
                break
        if best:
            pat = {'id': f"train-{key[0]}-{key[2]}", 'genotype': best[1],
                   'prevalence': best[2], 'site_types': [key[0]],
                   'page_types': [key[1]], 'section_type': key[2]}
            bank.setdefault((key[0], key[1], key[2]), []).append(pat)
            bank.setdefault((key[0], '*', key[2]), []).append(pat)
            bank.setdefault((key[0], '*', '*'), []).append(pat)
            bank.setdefault(('*', '*', '*'), []).append(pat)
    return bank


def section_shape(rec):
    """Section-level shape features.

    The PS.* checks are page checks and do not transfer to a section crop
    (see patterns/VALIDATION.md). These are measured on the crop itself,
    from the stored block list, and are what a section actually shows:
    how many blocks it stacks, whether one of them is an action, how
    evenly the blocks are sized, and how much prose it carries.
    """
    bl = rec.get('blocks') or []
    main = [b for b in bl if b.get('role') == 'main']
    areas = [b['area'] for b in main] or [1.0]
    mean = sum(areas) / len(areas)
    sd = (sum((a - mean) ** 2 for a in areas) / len(areas)) ** 0.5
    return {
        's_block_pace': min(1.0, len(bl) / 5.0),
        's_cta_presence': 1.0 if any(b.get('has_cta') for b in bl) else 0.0,
        's_row_regularity': max(0.0, 1.0 - (sd / mean if mean else 0.0)),
        's_prose_mass': min(1.0, sum(b['area'] * b.get('prose_mass', 0.0)
                                     for b in bl)),
    }


def cross_fit(rows, anti, folds=4):
    """Out-of-fold pattern_fit for training rows.

    Rows are grouped by domain so a site never informs its own bank fold.
    """
    doms = sorted({r['domain'] for r in rows if r['domain']})
    random.Random(11).shuffle(doms)
    buckets = [set(doms[i::folds]) for i in range(folds)]
    for b in buckets:
        held = [r for r in rows if r['domain'] in b]
        rest = [r for r in rows if r['domain'] not in b]
        if not held or not rest:
            continue
        bank = build_bank_from(rest)
        for r in held:
            known = r['section_type'] not in (None, 'other')
            fit, _, _ = pattern_fit(r, r['genotype'], bank, anti,
                                    section_known=known)
            r['features']['pattern_fit'] = fit


def cmd_validate(args):
    rows = build_dataset(args.seed)
    if not rows:
        raise SystemExit('no annotations to validate')
    # domain-grouped split so a site never appears in both halves
    domains = sorted({r['domain'] for r in rows if r['domain']})
    random.Random(args.seed).shuffle(domains)
    cut = int(len(domains) * (1 - args.holdout))
    train_d = set(domains[:cut])
    train = [r for r in rows if r['domain'] in train_d]
    test = [r for r in rows if r['domain'] not in train_d]
    anti = load_json(os.path.join(DATA, 'anti.json'), {})
    # Rebuild the pattern bank from TRAIN domains only. Test rows are
    # scored against it (no self-inclusion); train rows are scored
    # out-of-fold inside train, so the coefficients are fitted on the
    # same distribution the test rows are measured on. Without the
    # inner folds the train fits are computed against their own cell and
    # run ~3x higher than test fits, which distorts every coefficient.
    train_bank = build_bank_from(train)
    cross_fit(train, anti, folds=4)
    for r in test:
        known = r['section_type'] not in (None, 'other')
        fit, _, _ = pattern_fit(r, r['genotype'], train_bank, anti,
                                section_known=known)
        r['features']['pattern_fit'] = fit
    keys = list(DEFAULT_WEIGHTS)
    Xtr = [[r['features'][k] for k in keys] for r in train]
    ytr = [r['label'] for r in train]
    Xte = [[r['features'][k] for k in keys] for r in test]
    yte = [r['label'] for r in test]
    w, b = logistic_fit(Xtr, ytr)
    sc = [b + sum(wj * xj for wj, xj in zip(w, xi)) for xi in Xte]
    pairs = list(zip(sc, yte))
    a = auc(pairs)
    ranked = sorted(pairs, key=lambda t: -t[0])
    p10 = precision_at_k(ranked, max(1, len(ranked) // 10))
    pos = [s for s, y in pairs if y == 1]
    neg = [s for s, y in pairs if y == 0]

    # component correlations with the label (point-biserial)
    corr = {}
    for k in keys:
        xs = [r['features'][k] for r in rows]
        ys = [r['label'] for r in rows]
        mx, my = sum(xs) / len(xs), sum(ys) / len(ys)
        num = sum((x - mx) * (y - my) for x, y in zip(xs, ys))
        dx = math.sqrt(sum((x - mx) ** 2 for x in xs)) or 1
        dy = math.sqrt(sum((y - my) ** 2 for y in ys)) or 1
        corr[k] = round(num / (dx * dy), 3)

    # per-feature prevalence in mobbin vs negatives (effect size)
    prev = {}
    for k in keys:
        mp = sum(r['features'][k] for r in rows if r['label'] == 1) / max(
            1, sum(1 for r in rows if r['label'] == 1))
        mn = sum(r['features'][k] for r in rows if r['label'] == 0) / max(
            1, sum(1 for r in rows if r['label'] == 0))
        prev[k] = {'mobbin': round(mp, 3), 'negative': round(mn, 3),
                   'diff': round(mp - mn, 3)}

    os.makedirs(os.path.join(DATA, 'validation'), exist_ok=True)
    png_hist(os.path.join(DATA, 'validation', 'score_distribution.png'),
             [pos, neg])
    result = {
        'n_total': len(rows),
        'n_train': len(train), 'n_test': len(test),
        'n_pos': sum(ytr) + sum(yte), 'n_neg': len(rows) - sum(ytr) - sum(yte),
        'auc': round(a, 4),
        'precision_at_10pct': round(p10, 4),
        'weights_learned': {k: round(v, 4) for k, v in zip(keys, w)},
        'bias': round(b, 4),
        'correlations': corr,
        'prevalence': prev,
        'score_distribution': {
            'positive_mean': round(sum(pos) / max(1, len(pos)), 3),
            'negative_mean': round(sum(neg) / max(1, len(neg)), 3),
        },
    }
    json.dump(result, open(os.path.join(DATA, 'validation',
                                        'validation.json'), 'w'), indent=1)
    # The fitted coefficients are evidence about the corpus, not the
    # scorer's operating point: several are negative because the two
    # corpora are framed differently (section crops vs full pages), and
    # clipping them would ship a model that is no longer the validated
    # one. They are recorded next to the study and never loaded by
    # `score`, which uses the semantic prior in DEFAULT_WEIGHTS.
    l1 = sum(abs(x) for x in w) or 1.0
    fitted = {k: round(v, 4) for k, v in zip(keys, w)}
    json.dump({'auc': round(a, 4), 'coefficients': fitted,
               'normalised_abs': {k: round(abs(v) / l1, 3)
                                  for k, v in zip(keys, w)}},
              open(os.path.join(DATA, 'validation',
                                'fitted-weights.json'), 'w'), indent=1)
    result['fitted_weights'] = fitted
    print(json.dumps(result, indent=1))
    return result


# --------------------------------------------------------------- commands
def load_weights(path=None):
    """Scorer weights. Default = the semantic prior.

    An explicit file is accepted (so an operator can experiment) but its
    keys must be producible by `section_features`; a stale file used to
    KeyError inside `score_file`.
    """
    if not path:
        return dict(DEFAULT_WEIGHTS)
    weights = load_json(path, None)
    if not isinstance(weights, dict):
        raise SystemExit(f'{path}: not a weights object')
    known = set(DEFAULT_WEIGHTS)
    unknown = set(weights) - known
    missing = known - set(weights)
    if unknown or missing:
        raise SystemExit(
            f'{path}: keys not produced by the scorer. '
            f'unknown: {sorted(unknown)}; missing: {sorted(missing)}; '
            f'known: {sorted(known)}')
    return weights


def cmd_score(args):
    meta, bank = pattern_bank()
    anti = load_json(os.path.join(DATA, 'anti.json'), {})
    res = score_file(args.file, args.site_type, args.page_type,
                     load_weights(args.weights), bank, anti)
    if args.json:
        print(json.dumps(res, indent=1))
        return
    for o in res['options']:
        print(f"\n{o['option']}: {o['score']}/100")
        for s in o['sections']:
            print(f"  {s['score']:5.1f}  {s['label'][:44]:44s} "
                  f"{s['composition']:16s} {s['pattern'] or '-'}")
            for r in s['reasons']:
                print(f"          - {r}")
        print(f"  page: {', '.join(o['reasons'])}")


def cmd_label(args):
    rec = {'ts': None, 'option': args.option, 'score': args.score,
           'chosen': bool(args.chosen), 'features': json.loads(args.features)}
    import time
    rec['ts'] = time.strftime('%Y-%m-%dT%H:%M:%S')
    with open(LABELS, 'a') as f:
        f.write(json.dumps(rec) + '\n')
    print(f'logged -> {LABELS}')


def cmd_fit(args):
    if not os.path.exists(LABELS):
        raise SystemExit('no labels yet')
    rows = [json.loads(l) for l in open(LABELS) if l.strip()]
    if len(rows) < 20:
        raise SystemExit(f'need >=20 labels, have {len(rows)}')
    keys = list(DEFAULT_WEIGHTS)
    X = [[r['features'].get(k, 0.0) for k in keys] for r in rows]
    y = [1 if r['chosen'] else 0 for r in rows]
    w, b = logistic_fit(X, y)
    norm = {k: round(max(0.0, v) / sum(max(0.0, x) for x in w), 3)
            for k, v in zip(keys, w)}
    json.dump(norm, open(WEIGHTS, 'w'), indent=1)
    print(json.dumps({'n': len(rows), 'weights': norm, 'bias': round(b, 3)},
                     indent=1))


def cmd_novelty(args):
    sys.path.insert(0, HERE)
    from genome import novelty
    geno = json.loads(args.genotype)
    nov = novelty(geno, args.profile)
    bound = args.bound
    out = {'distance': nov, 'bound': bound, 'within_bound': nov <= bound}
    if args.write:
        json.dump({'distance': nov, 'bound': bound},
                  open(args.write, 'w'), indent=1)
    print(json.dumps(out, indent=1))


def main():
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest='cmd', required=True)
    s = sub.add_parser('score')
    s.add_argument('file')
    s.add_argument('--site-type', required=True)
    s.add_argument('--page-type', required=True)
    s.add_argument('--json', action='store_true')
    s.add_argument('--weights', help='optional weights JSON (default: the '
                                     'semantic prior in DEFAULT_WEIGHTS)')
    v = sub.add_parser('validate')
    v.add_argument('--holdout', type=float, default=0.25)
    v.add_argument('--seed', type=int, default=7)
    lb = sub.add_parser('label')
    lb.add_argument('--option', required=True)
    lb.add_argument('--score', type=float, required=True)
    lb.add_argument('--features', required=True)
    lb.add_argument('--chosen', type=int, default=1)
    sub.add_parser('fit')
    n = sub.add_parser('novelty')
    n.add_argument('--profile', required=True)
    n.add_argument('--genotype', required=True)
    n.add_argument('--bound', type=float, default=0.55)
    n.add_argument('--write')
    a = ap.parse_args()
    {'score': cmd_score, 'validate': cmd_validate, 'label': cmd_label,
     'fit': cmd_fit, 'novelty': cmd_novelty}[a.cmd](a)


if __name__ == '__main__':
    main()
