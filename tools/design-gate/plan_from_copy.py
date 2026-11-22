#!/usr/bin/env python3
"""plan_from_copy.py — w0 producer: COPY.json + site DNA → the page plan.

The plan is MACHINE output (U.2): section order, compositions, surfaces,
densities, refs and recipes all come from rules in this file applied to
the copy's shape and the site DNA. Nothing here is hand-written per page.

  inputs   <page>/COPY.json                     copy_ingest.py output
           <site>/DNA.json, BRIEF.yaml          dna_from_discovery.py
           <site>/MOBBIN-REFS.md                research bank
  outputs  <page>/LAYOUT-OPTIONS.json   every copy-fit layout option
                                        (d1..dN), its rows' compositions
                                        and its computed score inputs
           <page>/DESIGN-PLAN.md        the plan for ONE option
           <page>/STUB.md               heading vector + inventory, from
                                        the copy (the gate's contract)
           <page>/DNA.json              site DNA + this page's rhythm
           <page>/TOKENS.json           site TOKENS (copied byte-exact)

  python3 plan_from_copy.py <page-dir> [--option dN]

Without --option the tool projects the operator's recorded w3 pick
(APPROVALS) when one exists, else d1 — so re-running after the pick IS
the projection (layout_pick).
"""
import hashlib
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import site_folder as SF  # noqa: E402
import gate  # noqa: E402

TOOL = 'plan_from_copy.py'

# composition → bank recipe (fixed table; ids exist in templates/skeletons)
# bricksmaven first — its ACSS payloads are the best-structured bank
# (P6 resolves bricksmaven/<cat>/<stem> to the translated skeleton);
# other banks fill the gaps bricksmaven has no topology for.
# Canonical table lives in gate.RECIPE_FOR_COMP so the preview build
# resolves option overrides through the same map.
RECIPE = gate.RECIPE_FOR_COMP
HERO_COMP = gate.HERO_COMP

# composition → (speech act, emphasis, align, collapse)
# acts stay inside COMP_FOR_ACT (gate §2): stat-band/proof-band can
# only argue 'proof'; comparison only 'objection'/'detail'.
ROLE = {
    'editorial': ('detail', 'answer', 'col-1-edge', 'stacked'),
    'cards-n': ('detail', 'items', 'col-1-edge', '1-col'),
    'text-index': ('detail', 'index', 'col-1-edge', '1-col'),
    'sequence': ('how', 'steps', 'col-1-edge', 'stacked'),
    'faq': ('objection', 'reassurance', 'col-1-edge', '1-col'),
    'split-media': ('detail', 'media', 'col-1-edge', 'stacked'),
    'link-grid': ('detail', 'links', 'col-1-edge', '1-col'),
    'comparison': ('detail', 'items', 'col-1-edge', '1-col'),
    'stat-band': ('proof', 'items', 'col-1-edge', '1-col'),
    'proof-band': ('proof', 'proof', 'col-1-edge', '1-col'),
    'quote-grid': ('proof', 'items', 'col-1-edge', '1-col'),
}

# prose-only block → intent-fit compositions (§3 rhythm: a run of
# >2 'editorial' rows is a scan-fail, so a prose block's allowed set
# diversifies by what it argues — a cost answer compares, a cadence
# numbers, a coverage indexes, a proof quotes).
INTENT_COMP = {
    'cost': ['comparison', 'stat-band', 'text-index'],
    'duration': ['stat-band', 'text-index'],
    'coverage': ['link-grid', 'cards-n', 'text-index'],
    'proof': ['proof-band', 'quote-grid', 'text-index'],
}

# comps whose layout is item-driven: without ≥2 renderable items they
# are an empty grid or a lone orphan card (L.15) — the honest render
# is the prose column the copy actually carries.
ITEM_COMPS = {'cards-n', 'text-index', 'stat-band', 'link-grid',
              'comparison', 'sequence', 'proof-band', 'quote-grid'}
# comps that accept a term-projected item list (ordered-step and
# quote shapes need their own slots, not terms)
PROJ_COMPS = {'cards-n', 'text-index', 'stat-band', 'link-grid',
              'comparison'}

# CONTENT/<collection>/<slug>.md → PS page type (J.6 picks the layout
# family from it). A services stub is a service page on the
# conversion family; a guides stub stays a guide.
COLL_TYPE = {
    'cleaning-services': 'service-page', 'services': 'service-page',
    'service-pages': 'service-page', 'near-me': 'near-me',
    'locations': 'near-me', 'guides': 'guide', 'guide': 'guide',
    'articles': 'guide', 'hubs': 'hub', 'hub': 'hub',
}


def page_type_of(copy):
    src = str(((copy.get('source') or {}).get('stub') or {})
              .get('path') or '')
    m = re.search(r'/CONTENT/([^/]+)/', src)
    coll = (m.group(1).lower() if m else '')
    if coll in COLL_TYPE:
        return COLL_TYPE[coll]
    if coll:
        sys.exit(f'plan_from_copy: CONTENT collection "{coll}" has no '
                 'page-type mapping — extend COLL_TYPE (BLOCKED)')
    return 'guide'

# stub answer type (tail after '·') → PS.11 closed section intent.
# An ordered list is a process whatever its answer type says.
# Tails are free-text in stubs ("what · attribute", "how · mechanism",
# "when / boundary + redirect") — keyword-scan the tail to the nearest
# PS.11 intent ({definition, scope, audience, process, cost, duration,
# compliance, coverage, related, faq, proof, cta}); earlier groups win.
INTENT_SCAN = [
    ('cta',        ('next step', 'cta')),
    ('faq',        ('faq', 'question')),
    ('cost',       ('cost', 'price', 'measure', 'how much',
                    'definition + price')),
    ('duration',   ('duration', 'frequency', 'cadence', 'schedule',
                    'when', 'how long')),
    ('process',    ('process', 'mechanism', 'method', 'steps', 'fix',
                    'skill', 'handling', 'correction', 'dilution',
                    'how')),
    ('compliance', ('compliance', 'provenance', 'accountability',
                    'responsibility', 'requirements', 'procurement',
                    'source', 'qualification', 'eligibility')),
    ('audience',   ('audience', 'who', 'team', 'access')),
    ('coverage',   ('coverage', 'where')),
    ('related',    ('related', 'bridge', 'navigation', 'routing',
                    'guidance', 'diy', 'alternative', 'option',
                    'selection', 'decision', 'mapping')),
    ('proof',      ('proof', 'attribute', 'outcome', 'judgment',
                    'claim', 'why', 'confirmation', 'cause',
                    'ranking', 'priority', 'boolean', 'yes/no',
                    'value')),
    ('scope',      ('scope', 'enumeration', 'boundary', 'limits',
                    'exclusion', 'list', 'factors', 'checklist',
                    'uses', 'role', 'threshold', 'risk', 'myth',
                    'conditions', 'materials', 'which', 'what happens',
                    'consequence', 'comparison')),
    ('definition', ('definition', 'name', 'entity', 'distinction',
                    'classification', 'what', 'is', 'does', 'can',
                    'context')),
]


def intent_of(b):
    if b.get('list_ordered'):
        return 'process'
    tail = ' '.join(b['answer_type'].split('·')[-1].lower().split())
    intent = None
    for i2, keys in INTENT_SCAN:
        if any(k in tail for k in keys):
            intent = i2
            break
    if intent is None:
        sys.exit(f'plan_from_copy: block {b["id"]} answer type '
                 f'"{b["answer_type"]}" has no PS.11 intent mapping — '
                 'extend INTENT_SCAN (BLOCKED)')
    # a heading that asks price/cost argues cost whatever mechanism
    # tail the stub chose ("How is X priced?" → cost, not process).
    if intent in ('process', 'definition', 'scope') and re.search(
            r'\b(priced?|costs?|rates?|fares?|fees?|charges?|quotes?)\b',
            b['h2'], re.I):
        return 'cost'
    return intent


HERO_FOR_ARCH = {'stacked-center': 'stacked-hero',
                 'split-media': 'split-media',
                 'editorial-single': 'editorial'}


# ------------------------------------------------------------- copy shape

def strip_md(s):
    s = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', s)
    return s.replace('**', '').strip()


def _term_items(b):
    """Stub-declared **Terms:** found inside the block's prose →
    {term, text} pairs (I.4: a card/index row on real items, never a
    re-cut paragraph). term = the declared term; text = the verbatim
    clause tail AFTER the term's first case-insensitive hit — the card
    elaborates, the paragraph (which still renders) keeps the lead-in.
    Returns [] when nothing projectable."""
    terms = b.get('terms') or []
    if not terms or (b.get('items') or b.get('qa') or b.get('links')):
        return []
    prose = strip_md(' '.join((b.get('before') or []) +
                              (b.get('after') or [])))
    if not prose:
        return []
    clauses = [c.strip(' \t–—-') for c in
               re.split(r'[;.]\s+|\s+–\s+|\s+—\s+|,\s+|\s+and\s+',
                        prose) if c.strip()]
    out, used = [], set()
    # longest term first so 'visit frequency' beats 'frequency'
    for t in sorted(terms, key=len, reverse=True):
        tl = t.lower()
        for c in clauses:
            if c in used:
                continue
            m = re.search(r'\b' + re.escape(tl) + r'\b', c, re.I)
            if not m:
                continue
            rest = c[m.end():].strip(' \t–—-:,').strip()
            if not rest or len(rest) < 8:
                continue           # a bare term is no card
            used.add(c)
            it = {'term': t[:1].upper() + t[1:], 'text': rest}
            try:
                import copy_ingest as CI  # same icon table — one map
                # a grid of markers must be a system (I.4): an item
                # whose keyword has no icon still gets the neutral
                # utility tick, never a bare gap beside icon cards
                it['icon'] = CI._icon(t, rest) or 'check'
            except Exception:
                pass
            out.append(it)
            break
        if len(out) >= 4:
            break                  # a band, not a wall
    return out


def shape(b, has_media):
    """Copy shape → [default composition, allowed alternates…] (I.4).
    The rule reads only the block's own copy."""
    n_items, n_qa, n_links = len(b['items']), len(b['qa']), len(b['links'])
    prose = len(b['before']) + len(b['after'])
    if n_qa >= 3:
        return ['faq']
    if n_links and not n_items:
        return (['split-media', 'link-grid'] if has_media
                else ['link-grid'])
    if n_items >= 3 and (b.get('list_ordered')
                         or re.search(r'\bsteps?\b', b['h2'], re.I)):
        return ['sequence', 'cards-n']
    if n_items >= 4:
        return ['cards-n', 'editorial', 'text-index']
    if n_items:
        return ['editorial', 'cards-n']
    # prose-only answer — the default comp is intent-fit, 'editorial'
    # stays the always-safe alternate (I.4); declared terms still give
    # honest item alternates (the term list is copy, not invention):
    # a run of prose columns on a service page diversifies to
    # index/cards, never a third identical column (rhythm gate)
    out = list(dict.fromkeys(
        INTENT_COMP.get(intent_of(b), ['editorial']) + ['editorial']))
    n_terms = len(_term_items(b))
    if n_terms >= 3:
        out += ['cards-n', 'text-index']
    elif n_terms >= 2:
        out.append('text-index')
    if has_media and 'split-media' not in out and prose > 1:
        out.append('split-media')
    return out


def cols_for(n):
    """Grid columns that leave no orphan row (L.2 input)."""
    return 3 if n % 3 == 0 else 2


# ---------------------------------------------------------------- options

def option_vectors(blocks, n_media):
    """Every copy-fit option: d1 = each block's default; then one option
    per alternate family, so options differ structurally (L.1).
    split-media spends the BRIEF media budget: blocks whose default is
    split-media are served first, then document order; no block gets a
    split-media row without a real image."""
    allowed = {b['id']: shape(b, n_media > 0) for b in blocks}
    bmap = {b['id']: b for b in blocks}

    def repair(v):
        # the option card must already show only comps that can
        # render — a repair after the pick would contradict it (L.3)
        return {k: eff_comp(bmap[k], c, allowed[k], n_media)
                for k, c in v.items()}

    base = {k: v[0] for k, v in allowed.items()}
    opts = [('d1', 'copy default',
             repair(cap_share(budget(dict(base), allowed, n_media),
                              allowed)))]
    themes = [('d2', 'index-led', 'text-index'),
              ('d3', 'prose-led', 'editorial'),
              ('d4', 'grid-led', 'cards-n'),
              ('d5', 'media-led', 'split-media')]
    seen = {json.dumps(opts[0][2], sort_keys=True)}
    for name, label, comp in themes:
        v = repair(cap_share(budget(
            {k: (comp if comp in allowed[k] else base[k])
             for k in base}, allowed, n_media), allowed))
        key = json.dumps(v, sort_keys=True)
        if key in seen:
            continue
        seen.add(key)
        opts.append((name, label, v))
    return opts, allowed


def cap_share(v, allowed):
    """J.1 quality floor per option: no composition may hold more
    than ~40% of a page's rows — a theme biases, it may not blanket.
    Surplus rows take their own next allowed comp, deterministic."""
    n = len(v)
    cap = max(2, -(-n * 2 // 5))
    counts = {}
    for c in v.values():
        counts[c] = counts.get(c, 0) + 1
    for k in v:
        c = v[k]
        while counts.get(c, 0) > cap:
            alt = next((a for a in allowed[k]
                        if a != c and counts.get(a, 0) < cap), None)
            if not alt:
                break
            counts[c] -= 1
            counts[alt] = counts.get(alt, 0) + 1
            c = v[k] = alt
    return v


def budget(v, allowed, n_media):
    """Keep at most n_media split-media rows; defaults first. Overflow
    falls back to the block's next non-split alternate."""
    order = sorted((k for k, c in v.items() if c == 'split-media'),
                   key=lambda k: (allowed[k][0] != 'split-media', k))
    for k in order[n_media:]:
        v[k] = next(c for c in allowed[k] + ['editorial']
                    if c != 'split-media')
    return v


def eff_comp(b, comp, allowed_for_b, n_media):
    """The picked comp repaired against the copy that must render:
    a media row with no asset is a dead split, and an item comp with
    <2 projectable items is an empty grid — both fall to the block's
    next honest alternate (L.15). The pick stays the intent; the
    repair only fires where the pick can't render."""
    if comp == 'split-media' and n_media <= 0:
        return next((c for c in allowed_for_b if c != 'split-media'),
                    'editorial')
    if comp in ITEM_COMPS and not (b['items'] or b['links'] or b['qa']) \
            and len(_term_items(b)) < 2:
        return 'editorial'
    return comp


def repair_rhythm(seq, allowed, zone_of):
    """No run of >2 same compositions: switch the third to its next
    allowed non-media alternate (deterministic). A run made wholly of
    micro answers stays — it is one 'micro-answers' organism."""
    out = list(seq)
    for i in range(2, len(out)):
        bid, comp = out[i]
        if comp != out[i - 1][1] or comp != out[i - 2][1]:
            continue
        if all(zone_of[out[j][0]] == 'micro' for j in (i - 2, i - 1, i)):
            continue
        alts = [c for c in allowed[bid] if c not in (comp, 'split-media')]
        if alts:
            out[i] = (bid, alts[0])
    return out


SCORE_BASE = 0.85


def score(rows_comp, blocks_by):
    """Copy-fit score (L.2) — inputs recorded beside the result."""
    orphan = 0
    long_cards = 0
    monotony = 0
    for i, (bid, comp) in enumerate(rows_comp):
        b = blocks_by[bid]
        n = len(b['items'])
        if comp == 'cards-n' and n:
            c = cols_for(n)
            orphan += (n % c != 0)
            long_cards += sum(1 for it in b['items']
                              if len(strip_md(it['text'])) > 160)
        if i and comp == rows_comp[i - 1][1]:
            monotony += 1
    inputs = {'orphan_rows': orphan, 'long_card_texts': long_cards,
              'adjacent_same_composition': monotony,
              'distinct_compositions': len({c for _, c in rows_comp})}
    s = SCORE_BASE - 0.1 * orphan - 0.05 * long_cards - 0.04 * monotony \
        + 0.02 * inputs['distinct_compositions']
    return round(max(0.0, min(1.0, s)), 3), inputs


# ------------------------------------------------------------------ refs

def refs_by_comp(site_dir):
    p = os.path.join(site_dir, 'MOBBIN-REFS.md')
    out = {}
    if not os.path.isfile(p):
        return out
    for ln in open(p, encoding='utf-8').read().splitlines():
        cells = [c.strip() for c in ln.strip().strip('|').split('|')]
        if len(cells) < 3 or not cells[0].startswith('mobbin-'):
            continue
        parts = [x.strip() for x in cells[2].split('·')]
        if len(parts) > 1:
            out.setdefault(parts[1], []).append(cells[0])
    return out


# ----------------------------------------------------------------- yaml

def y(v):
    if isinstance(v, dict):
        return '{' + ', '.join(f'{k}: {y(x)}' for k, x in v.items()) + '}'
    if isinstance(v, (list, tuple)):
        return '[' + ', '.join(y(x) for x in v) + ']'
    if isinstance(v, bool):
        return 'true' if v else 'false'
    if isinstance(v, (int, float)):
        return str(v)
    return json.dumps(str(v), ensure_ascii=False)


# ----------------------------------------------------------- readability

def fk_grade(text):
    words = re.findall(r"[A-Za-z][A-Za-z'-]*", text)
    sents = max(1, len(re.findall(r'[.!?](\s|$)', text)))
    syl = 0
    for w in words:
        g = re.findall(r'[aeiouy]+', w.lower())
        n = len(g) - (1 if w.lower().endswith('e') and len(g) > 1 else 0)
        syl += max(1, n)
    if not words:
        return 0
    return round(0.39 * len(words) / sents + 11.8 * syl / len(words)
                 - 15.59)


def temperature(hexv):
    r, g, b = (int(hexv[i:i + 2], 16) for i in (1, 3, 5))
    return 'cool' if b > r + 4 else 'warm' if r > b + 4 else 'neutral'


# ------------------------------------------------------------------ build

def recorded_pick(pdir):
    try:
        ctx = gate.Ctx(pdir)
        rec = gate.read_approvals(ctx).get('w3') or {}
        return rec.get('design')
    except Exception:
        return None


def build(pdir, option=None):
    site_dir, slug = SF.site_of(pdir)
    _, brief, page = SF.brief(pdir)
    copy_p = os.path.join(pdir, 'COPY.json')
    copy = json.load(open(copy_p, encoding='utf-8'))
    dna_p = os.path.join(site_dir, 'DNA.json')
    dna = json.load(open(dna_p, encoding='utf-8'))
    geno = dna['genotype']
    brand = brief.get('brand') or {}
    media = list(brief.get('media') or [])
    blocks = copy['blocks']
    by = {b['id']: b for b in blocks}
    names = [w.strip().lower().rstrip('.') for w in
             re.split(r'→', copy.get('vector_order') or '')]
    if len(names) != len(blocks):
        names = [b['id'] for b in blocks]
    names = [re.sub(r'[^a-z0-9-]+', '-', n).strip('-') for n in names]
    name_of = {b['id']: n for b, n in zip(blocks, names)}

    # the hero spends the first media asset (V.1) — the rows'
    # budget and allowed comps are computed on what remains
    opts, allowed = option_vectors(blocks, max(0, len(media) - 1))
    zone_of = {b['id']: b['zone'] for b in blocks}
    table = []
    row_media = max(0, len(media) - 1)
    for oid, label, v in opts:
        seq = repair_rhythm([(b['id'], v[b['id']]) for b in blocks],
                            allowed, zone_of)
        seq = [(bid, eff_comp(by[bid], c, allowed[bid], row_media))
               for bid, c in seq]
        s, inputs = score(seq, by)
        table.append({'id': oid, 'label': label,
                      'compositions': {bid: c for bid, c in seq},
                      'score': s, 'score_inputs': inputs})
    pick = option or recorded_pick(pdir) or 'd1'
    chosen = next((o for o in table if o['id'] == pick), None)
    if chosen is None:
        raise SystemExit(f'{TOOL}: option {pick!r} not among '
                         f'{[o["id"] for o in table]}')
    refs = refs_by_comp(site_dir)
    # a page with first-party photography earns the authored
    # media-backed hero (image behind the copy, scrim-bound) —
    # but only where the archetype admits the merge comp (J.10);
    # a text-led DNA keeps the archetype's contained hero
    _media_hero = ('hero-act-merge'
                   if 'hero-act-merge' in
                   HERO_COMP.get(geno['layout-archetype'], ())
                   else None)
    hero_comp = (_media_hero if media and _media_hero else
                 HERO_FOR_ARCH.get(geno['layout-archetype'],
                                   'stacked-hero'))

    def base_row(name, comp, **kw):
        r = {'name': name, 'wf_ref': f'preview/layouts.html#{pick}:{name}'}
        if comp in RECIPE:
            r['recipe'] = RECIPE[comp]
        r.update(kw)
        r['composition'] = comp
        r['refs'] = refs.get(comp, [])[:2]
        return r

    rows = []
    phone = brand.get('phone') or ''
    tel = 'tel:' + re.sub(r'[^\d+]', '', phone)
    hub = next((l for l in copy['links_out'] if 'hub' in l.get('zone', '')),
               None)
    nav_items = ([{'label': hub['anchor'], 'href': hub['href']}]
                 if hub else [])
    for l in copy['links_out']:
        # the nav menu leads with the hub then the first out-links —
        # a one-item menu is no menu (PS.7: the links are sourced
        # chrome, never invented)
        if l is hub or len(nav_items) >= 4:
            continue
        nav_items.append({'label': l['anchor'], 'href': l['href']})
    hero_cta = (copy.get('closing') or {}).get('cta')
    rows.append(base_row(
        'nav', 'flyout-nav', speech_act=['chrome'], category='headers',
        surface='base', density='compact', emphasis='nav',
        align='center-axis', stack='text-first', collapse='burger',
        media_ratio='none', disclosure='open', intent='chrome',
        items=nav_items,
        cta={'label': phone, 'href': tel}))
    rows.append(base_row(
        'hero', hero_comp, speech_act=['promise'], category='hero',
        surface='media' if hero_comp == 'hero-act-merge' else 'base',
        density='regular', emphasis='headline',
        align='center-axis', stack='text-first', collapse='stacked',
        media_ratio='none', disclosure='open', intent='hero',
        content_ids=['c-h1'], copy_ref='lede',
        vector=[{'heading': copy['h1'], 'fs': strip_md(copy['lede'])}],
        **({'cta': hero_cta} if hero_cta else {})))
    comps = chosen['compositions']
    seq = [(b['id'], comps[b['id']]) for b in blocks]
    surfaces = ['muted', 'base']
    media_left = list(media)
    # V.1 — a real service's promise row carries the first-party
    # photo; the hero spends the media budget before any detail row
    if media_left:
        hm = media_left.pop(0)
        rows[-1]['image'] = {'src': hm['src'], 'alt': hm['alt'],
                             'ratio': '4:3'}
        # a media-backed hero covers its band — the photo's own
        # aspect is the ratio; a contained hero keeps 4:3
        rows[-1]['media_ratio'] = (
            'none' if hero_comp == 'hero-act-merge' else '4:3')
    for i, (bid, comp) in enumerate(seq):
        b = by[bid]
        comp = eff_comp(b, comp, allowed[bid], len(media_left))
        act, emph, align, collapse = ROLE[comp]
        prev = seq[i - 1][1] if i else None
        nxt = seq[i + 1][1] if i + 1 < len(seq) else None
        prose = len(b['before']) + len(b['after'])
        dens = 'compact' if (comp == 'editorial' and prose <= 1) \
            else 'regular'
        if prev == comp and rows[-1].get('density') == dens:
            dens = 'regular' if dens == 'compact' else 'compact'
        row = base_row(
            name_of[bid], comp, speech_act=[act], category='content',
            surface=surfaces[i % 2], density=dens, emphasis=emph,
            align=align, stack='text-first', collapse=collapse,
            media_ratio='none', disclosure='open',
            intent=intent_of(b),
            zone=b['zone'], content_ids=[f'c-{bid}'], copy_ref=bid,
            vector=[{'heading': b['h2'], 'fs': strip_md(b['answer'])}])
        if comp in PROJ_COMPS:
            # a term-derived items row (shape() allowed it) — project
            # declared terms → items when the block has none of its own
            proj = _term_items(b) if not b['items'] else []
            if proj:
                row['items'] = proj
                row['columns'] = cols_for(len(proj))
            elif comp == 'cards-n':
                row['columns'] = cols_for(len(b['items']))
        if comp == 'split-media' and media_left:
            m = media_left.pop(0)
            row['image'] = {'src': m['src'], 'alt': m['alt']}
            row['media_ratio'] = '4:3'
        # a run of >2 short micro answers is one organism (the reader
        # meets a family of quick answers, not three unrelated rows)
        run3 = (prev == comp == nxt) or (
            i >= 2 and seq[i - 2][1] == prev == comp) or (
            nxt == comp and i + 2 < len(seq) and seq[i + 2][1] == comp)
        if run3 and b['zone'] == 'micro':
            row['organism'] = 'micro-answers'
        rows.append(row)
    clo = copy.get('closing') or {}
    if clo:
        # a folded disclosure-tier ends the page on a trigger, not a
        # form: the end-act is a modal-form (.flyout dialog the CTA
        # opens — N.flyout) instead of an open form-panel
        folded = geno.get('disclosure-tier') == 'folded'
        rows.append(base_row(
            'end-act', 'modal-form' if folded else 'form-panel',
            speech_act=['act'],
            category='contact', surface='brand', density='spacious',
            emphasis='action', align='col-1-edge', stack='text-first',
            collapse='stacked', media_ratio='none',
            disclosure='collapsed' if folded else 'open',
            intent='cta', content_ids=['c-close'], copy_ref='closing',
            cta=clo['cta']))
    rows.append(base_row(
        'footer', 'footer-bar', speech_act=['chrome'], category='footer',
        surface='base', density='compact', emphasis='links',
        align='center-axis', stack='text-first', collapse='1-col',
        media_ratio='none', disclosure='open', intent='chrome',
        items=[{'label': l['anchor'], 'href': l['href']}
               for l in copy['links_out']]
        + ([{'label': phone, 'href': tel}] if phone else [])))

    rhetoric = []
    for r in rows:
        for a in r['speech_act']:
            if a != 'chrome' and a not in rhetoric:
                rhetoric.append(a)
    light = dna['modes']['light']
    fonts = dna['invariants']['fonts']
    body_text = ' '.join(strip_md(x) for b in blocks for x in
                         [b['answer']] + b['before'] + b['after']
                         + [i['text'] for i in b['items']])
    has_seq = any(c == 'sequence' for _, c in seq)
    motif_at = [name_of[b] for b, c in seq if c == 'sequence'] or \
        [name_of[seq[0][0]]]
    site = {
        'slug': slug, 'name': brand.get('name'), 'logo': brand.get('logo'),
        'brand': brand.get('name'), 'description': copy.get('meta'),
        'design_mode': 'variants', 'vertical': dna['vertical_profile']
        .replace('profile-', ''),
        'attributes': list(dna['constraints'].get('likes') or [])[:2],
        'intent_choices': [
            {'choice': 'imagery', 'allele': geno['image-led-ratio']},
            {'choice': 'image_style', 'allele': geno['image-style']}],
        'sources': ['copy-contract: STUB.md',
                    f'wireframe: preview/layouts.html#{pick}'],
        'canon_sites': [(brief.get('site') or {}).get('url')],
        'intent': {
            'who': 'business manager',
            'one_action': clo.get('cta', {}).get('label', ''),
            'worst_case': 'a complaint or inspection with no answer'},
        'direction': {
            'temperature': temperature(light['surface']),
            'density': geno['density-tier'],
            'finish': 'flat', 'type_contrast':
            'single-family-weight-contrast',
            'shape': dna['knobs']['radius.personality'],
            'motion': geno['motion-tier'],
            'refused': 'OS-following dark first paint; unsourced proof'},
        'system': {
            'type': {'fonts': {'display': fonts['display'],
                               'body': fonts['body']},
                     'ranks': {'body': {'step': 0, 'weight': 400}}},
            'space': {'unit': '4px', 'scale': sorted(gate.G1),
                      'section_densities': {
                          'compact': {'py': 'space-4'},
                          'regular': {'py': 'space-6'},
                          'spacious': {'py': 'space-9'}},
                      'group_gap_vs_section_gap': '≥2×'},
            'grid': {'measure': f"{dna['knobs']['width.inner_rung']}ch",
                     'content_width': '80rem',
                     'edge_padding': [16, 24, 32, 40, 48],
                     'breakpoints': sorted(gate.BREAKPOINTS),
                     'stack_order': 'text-first'},
            'color': {'roles': {k: {'value': light[k]} for k in
                                ('bg', 'surface', 'ink', 'ink_muted',
                                 'accent', 'accent_foreground',
                                 'inverse')}},
            'contrast_axes': {'heading_vs_body': 'size'},
            'icons': {'family': 'lucide', 'style': 'outline',
                      'stroke_class': 'regular'},
            'media': {'treatment': 'natural',
                      'authenticity': 't1-first-party'},
            'copy': {'cta_person': 'second',
                     'reading_level': f'grade-{fk_grade(body_text)}'}},
        'motif': {'device': 'hairline-numeral' if has_seq else 'hairline',
                  'recurs_at': motif_at,
                  'break': {'where': 'end-act', 'how': 'brand'}},
    }
    plan_doc = {
        'site': site, 'burst': 0,
        'dna': {'profile': dna['vertical_profile'], 'genotype': geno},
        'options': [{'name': o['id'], 'wildcard': False,
                     'temperature': site['direction']['temperature'],
                     'shape': site['direction']['shape'],
                     'label': o['label'], 'score': o['score']}
                    for o in table],
        'pages': {slug: {
            'page_class': 'info', 'page_type': (pt := page_type_of(copy)),
            'type': pt, 'layout_family': gate.PAGE_FAMILIES.get(pt,
                                                              'editorial'),
            'rhetoric': rhetoric, 'sections': rows}},
    }
    copy_sha = SF.sha(copy_p)
    dna_sha = SF.sha(dna_p)
    stamp = (f'<!-- GENERATED by {TOOL} from COPY.json sha256:{copy_sha} '
             f'DNA.json sha256:{dna_sha} option:{pick} — do not edit -->')
    _write(os.path.join(pdir, 'DESIGN-PLAN.md'),
           stamp + '\n' + render_plan(plan_doc, brand))
    _write(os.path.join(pdir, 'STUB.md'),
           stamp + '\n' + render_stub(copy, blocks, name_of, rows,
                                      brand, media))
    lay = {'generated_by': TOOL, 'copy_sha256': copy_sha, 'pick': pick,
           'allowed': allowed, 'options': table,
           'score_formula': f'{SCORE_BASE} - 0.1*orphan_rows '
                            '- 0.05*long_card_texts '
                            '- 0.04*adjacent_same_composition '
                            '+ 0.02*distinct_compositions, clamp 0..1'}
    _write(os.path.join(pdir, 'LAYOUT-OPTIONS.json'),
           json.dumps(lay, indent=1, ensure_ascii=False) + '\n')
    page_dna = dict(dna)
    page_dna['rhythm'] = [{'section': r['name'], 'surface': r['surface'],
                           'density': r['density']} for r in rows]
    page_dna['site_dna_sha256'] = dna_sha
    # the W4 look lock writes DNA.json version:1 — layout projection
    # re-runs this producer, so a previously locked map keeps its lock
    # (the lock belongs to the page, not to this rewrite).
    try:
        old_ver = json.load(open(os.path.join(pdir, 'DNA.json'))) \
            .get('version')
    except Exception:
        old_ver = None
    if isinstance(old_ver, int):
        page_dna['version'] = max(int(page_dna.get('version') or 0),
                                  old_ver)
    page_dna['hashes'] = gate.dna_slices(page_dna)
    _write(os.path.join(pdir, 'DNA.json'),
           json.dumps(page_dna, indent=1, ensure_ascii=False) + '\n')
    tok = open(os.path.join(site_dir, 'TOKENS.json'), 'rb').read()
    with open(os.path.join(pdir, 'TOKENS.json'), 'wb') as fh:
        fh.write(tok)
    return pick, table, rows


def render_plan(doc, brand):
    L = [f"# DESIGN-PLAN — {brand.get('name')}", '', '```yaml', 'site:']
    for k, v in doc['site'].items():
        if isinstance(v, dict) and k in ('direction', 'system'):
            L.append(f'  {k}:')
            for k2, v2 in v.items():
                L.append(f'    {k2}: {y(v2)}')
        elif isinstance(v, list) and k in ('intent_choices', 'sources'):
            L.append(f'  {k}:')
            for it in v:
                L.append('    - ' + (y(it) if isinstance(it, dict)
                                     else str(it)))
        else:
            L.append(f'  {k}: {y(v)}')
    L.append(f"burst: {doc['burst']}")
    L.append('dna:')
    L.append(f"  profile: {doc['dna']['profile']}")
    L.append(f"  genotype: {y(doc['dna']['genotype'])}")
    L.append('options:')
    for o in doc['options']:
        L.append(f'  - {y(o)}')
    L.append('pages:')
    for slug, p in doc['pages'].items():
        L.append(f'  {slug}:')
        for k, v in p.items():
            if k == 'sections':
                continue
            L.append(f'    {k}: {y(v)}')
        L.append('    sections:')
        for r in p['sections']:
            L.append(f'      - {y(r)}')
    L.append('```')
    return '\n'.join(L) + '\n'


def render_stub(copy, blocks, name_of, rows, brand, media):
    def cell(s):
        return strip_md(s).replace('|', '/')
    L = [f"# STUB — {copy['url']}", '', '| Field | Value |', '|---|---|',
         f"| **H1** | {copy['h1']} |",
         f"| **Source stub** | {copy['source']['stub']['path']} · "
         f"{copy['source']['stub']['sha256'][:16]} |",
         f"| **Source article** | {copy['source']['article']['path']} · "
         f"{copy['source']['article']['sha256'][:16]} |", '',
         '## Heading vector', '',
         '| Zone | Heading | First sentence / FS (write this) | cid |',
         '|---|---|---|---|',
         f"| hero | H1 {copy['h1']} | \"{cell(copy['lede'])}\" | c-h1 |"]
    for b in blocks:
        L.append(f"| {name_of[b['id']]} | H2 {b['h2']} | "
                 f"\"{cell(b['answer'])}\" | c-{b['id']} |")
    L += ['', '## Content inventory', '',
          '### Proof items (term lists, verbatim)', '',
          '| Item | Type | cid |', '|---|---|---|']
    for b in blocks:
        for it in b['items']:
            t = (f"{it['term']} – " if it['term'] else '') + it['text']
            L.append(f"| \"{cell(t)}\" | "
                     f"{'step' if re.search('step', b['h2'], re.I) else 'card'}"
                     f" | c-{b['id']} |")
    L += ['', '### FAQ Q&A pairs', '', '| Q | A | cid |', '|---|---|---|']
    for b in blocks:
        for qa in b['qa']:
            L.append(f"| {cell(qa['q'])} | {cell(qa['a'])} | c-{b['id']} |")
    L += ['', '### Media inventory', '', '| Section | Asset | Ratio |',
          '|---|---|---|']
    used = [r for r in rows if r.get('image')]
    for r in used:
        L.append(f"| {r['name']} | {r['image']['src']} | "
                 f"{r['media_ratio']} |")
    if not used:
        L.append('| hero | none | — |')
    clo = copy.get('closing') or {}
    L += ['', '### CTAs', '', '| Label | Target | cid |', '|---|---|---|']
    if clo:
        L.append(f"| {clo['cta']['label']} | {clo['cta']['href']} | "
                 'c-close |')
        if clo.get('phone'):
            L.append(f"| {clo['phone']} | tel:"
                     f"{re.sub(r'[^0-9+]', '', clo['phone'])} | c-close |")
    L += ['', '### Contact facts', '', '| Field | Value |', '|---|---|',
          f"| phone | {brand.get('phone')} |", '']
    if clo:
        L += ['### Closing (end-act copy, verbatim)', '',
              '| Text | cid |', '|---|---|',
              f"| {cell(clo['text'])} | c-close |", '']
    return '\n'.join(L)


def _write(p, txt):
    with open(p, 'w', encoding='utf-8') as fh:
        fh.write(txt)


def main():
    a = sys.argv[1:]
    if not a or a[0].startswith('-'):
        print(__doc__)
        return 2
    opt = a[a.index('--option') + 1] if '--option' in a else None
    pick, table, rows = build(os.path.abspath(a[0]), opt)
    print(f'{TOOL}: option {pick} · {len(rows)} rows · options '
          + ', '.join(f"{o['id']}={o['score']}" for o in table))
    for r in rows:
        print(f"  {r['name']:16} {r['composition']:13} {r['surface']:6} "
              f"{r['density']:8} {r.get('organism', '')}")
    return 0


if __name__ == '__main__':
    sys.exit(main())
