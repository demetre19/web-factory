#!/usr/bin/env python3
"""Cluster annotations into PATTERN / SIGNATURE / ANTI and write the
pattern library markdown.

Rules (TAXONOMY §5):
- PATTERN  = the modal genotype signature of a cell, present in >=60%
             of the cell's screens, n >= 10. Written as a positive
             imperative.
- SIGNATURE = an allele over-represented on Mobbin A/B screens vs the
             negative corpus (lift >= 1.6) but not part of the modal
             signature (<60%).
- ANTI     = an allele over-represented on negatives vs Mobbin
             (lift <= 0.55) — data only, `data/anti.json`.

Output:
  patterns/<site_type>/<section_type>/<pattern-id>.md
  data/anti.json, data/pattern-index.json

  python3 build_patterns.py
"""
import json
import os
import sys
import statistics
from collections import Counter, defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
PATTERNS = os.path.normpath(os.path.join(HERE, '..'))
DATA = os.path.join(PATTERNS, 'data')
ROOT = os.path.normpath(os.path.join(PATTERNS, '..', '..', '..', '..'))

# signature genes: the ones that define a section's look
SIG_GENES = ['layout-archetype', 'image-led-ratio', 'density-tier',
             'surface-rhythm', 'cta-restraint', 'proof-type',
             'disclosure-tier', 'heading-form', 'media-treatment',
             'whitespace-band']
CORE_GENES = ['layout-archetype', 'image-led-ratio', 'cta-restraint',
              'heading-form']

# SECTION-CATALOG §2 is the closed composition set. Annotations may
# carry a pixel-level description that is not a catalog slug; normalize
# here so every pattern's `links.composition` resolves.
CATALOG_COMPOSITIONS = {
    'split-media', 'stacked-hero', 'proof-band', 'editorial', 'cards-n',
    'sequence', 'faq', 'comparison', 'logo-wall', 'stat-band', 'full-bleed',
    'badge-center', 'media-gallery', 'form-panel', 'quote-grid',
    'map-finder', 'capture-form', 'text-index', 'app-band',
    'hero-act-merge', 'link-grid',
}
COMPOSITION_FIX = {'carousel': 'media-gallery'}
COMPOSITION_BY_SECTION = {
    'add-to-cart': 'form-panel', 'mini-cart': 'form-panel',
    'filters-sort': 'text-index', 'gallery': 'media-gallery',
    'pricing': 'cards-n', 'hero': 'stacked-hero', 'content': 'editorial',
}

GENE_CHECKS = {
    'layout-archetype': ['check_section_enums', 'check_wireframe_lock'],
    'page-macro-structure': ['check_vector_map', 'check_rhythm'],
    'density-tier': ['check_rhythm', 'check_spacing_scale'],
    'image-led-ratio': ['check_segment_media', 'check_section_enums'],
    'type-contrast': ['check_type_system'],
    'display-face': ['check_type_system'],
    'radius-personality': ['check_system_enums'],
    'surface-rhythm': ['check_rhythm', 'check_contrast'],
    'cta-restraint': ['check_emphasis', 'check_wireframe_tags'],
    'cta-rank': ['check_emphasis'],
    'disclosure-tier': ['check_section_enums'],
    'nav-pattern': ['check_wireframe_tags'],
    'motion-tier': ['check_motif'],
    'proof-type': ['check_speech_acts'],
    'media-treatment': ['check_segment_media'],
    'columns': ['check_content_width', 'check_breakpoints'],
    'heading-form': ['check_heading_verbatim', 'check_vector_map'],
    'whitespace-band': ['check_spacing_scale'],
    'gallery-mode': ['check_components_exist'],
    'form-presence': ['check_wireframe_tags'],
}

IMPERATIVE = {
    'split-media': 'Split the fold into text and one real image, text '
                   'carrying 45–60% of the width.',
    'stacked-center': 'Stack the promise as centred text with no media '
                      'column — reserve this for pages without a strong hero image.',
    'full-bleed-media': 'Run one edge-to-edge media plane with a single '
                        'centred statement over it.',
    'immersive-media': 'Make the fold a full-bleed photographic canvas; '
                       'the image is the argument, text rides on it.',
    'card-grid-2': 'Lay the content as two equal cards side by side.',
    'card-grid-3': 'Lay the content as three equal cards in one row.',
    'card-grid-4': 'Lay the content as a four-up card row.',
    'editorial-single': 'Set the content as one measure-constrained prose '
                        'column (≤65ch) — no cards.',
    'sequence-steps': 'Number the steps and run them as one ordered '
                      'sequence, numerals carrying the motif.',
    'accordion-list': 'Fold the questions into an accordion of real '
                      'questions, first one open.',
    'table-matrix': 'Compare in a table matrix — rows are options, '
                    'columns are attributes.',
    'horizontal-band': 'Compress the proof into one tight horizontal '
                       'band, not a full section.',
    'masonry-grid': 'Tile the media in a masonry grid with captions bound '
                    'to each item.',
    'split-form': 'Split the block into a form and its supporting copy, '
                  'form on the dominant side.',
    'carousel-track': 'Page the items on a horizontal track with visible '
                      'peek and controls.',
}

IMPERATIVE_BY_COMP = {
    'stacked-hero': 'Stack the promise as centred text with no media column.',
    'split-media': 'Split the fold into text and one real image.',
    'full-bleed': 'Run one edge-to-edge media plane with a single centred '
                  'statement over it.',
    'cards-n': 'Lay the content as uniform cards in one row.',
    'editorial': 'Set the content as one measure-constrained prose column.',
    'sequence': 'Number the steps and run them as one ordered sequence.',
    'faq': 'Fold the questions into an accordion of real questions.',
    'comparison': 'Compare in a two-column contrast or table matrix.',
    'quote-grid': 'Grid the real quotes two or three up.',
    'logo-wall': 'Run the real client marks as one row.',
    'badge-center': 'Centre the guarantee/certification badge with its claim.',
    'media-gallery': 'Tile the media in a grid with captions bound to items.',
    'carousel': 'Page the items on a horizontal track with visible peek.',
    'form-panel': 'Split the block into a form and its supporting copy.',
    'capture-form': 'Offer one field of capture with a supporting line.',
}

TONE = {
    'services': 'service buyers scanning for competence and a quote',
    'ecommerce': 'shoppers deciding whether this product is right',
    'saas': 'evaluators checking fit before a trial',
    'technology': 'developers checking the API surface',
    'portfolio': 'clients scanning craft in seconds',
    'agency-portfolio': 'clients judging capability from case work',
    'fashion': 'buyers reading brand codes',
    'luxury-goods': 'buyers reading restraint and heritage',
    'jewellery': 'buyers reading craft and provenance',
    'architecture': 'clients reading spatial judgement',
    'homes': 'buyers imagining the home',
    'healthcare': 'patients checking safety and credentials',
    'finance': 'customers checking trust and regulation',
    'education': 'learners checking outcomes',
    'hospitality': 'guests checking atmosphere',
    'real-estate': 'buyers scanning inventory',
    'automotive': 'buyers comparing specification',
    'legal': 'clients checking authority',
    'recruitment': 'candidates scanning roles',
    'community': 'members checking belonging',
    'personal-brand': 'clients checking point of view',
    'government': 'citizens finding a service',
    'nonprofit': 'donors checking impact',
    'media': 'readers deciding to read',
    'events': 'attendees checking programme and venue',
    'marketplace': 'buyers comparing listings',
}


def load(name):
    p = os.path.join(DATA, name)
    out = []
    with open(p) as f:
        for line in f:
            r = json.loads(line)
            if 'error' in r:
                continue
            out.append(r)
    return out


def genotypes():
    p = os.path.join(DATA, 'genotypes.jsonl')
    out = []
    with open(p) as f:
        for line in f:
            out.append(json.loads(line))
    return out


def slug(s):
    return ''.join(c if c.isalnum() else '-'
                   for c in str(s or 'x').lower()).strip('-')[:60]


def prevalence(recs, genes):
    """Share of records matching the modal allele on `genes`."""
    modal = {}
    for g in genes:
        c = Counter(r['genotype'].get(g) for r in recs)
        modal[g] = c.most_common(1)[0][0]
    hits = sum(1 for r in recs
               if all(r['genotype'].get(g) == a for g, a in modal.items()))
    return modal, hits / max(1, len(recs))


def best_signature(recs):
    """Largest gene subset (size 1..3) whose modal combination clears
    60%. Maximises information subject to the pattern threshold."""
    from itertools import combinations
    best = None
    for size in (3, 2, 1):
        for genes in combinations(SIG_GENES, size):
            modal, prev = prevalence(recs, list(genes))
            if prev >= 0.60:
                if best is None or len(genes) > len(best[0]):
                    best = (list(genes), modal, prev)
        if best:
            break
    if best is None:
        modal, prev = prevalence(recs, ['layout-archetype'])
        return ['layout-archetype'], modal, prev
    return best


def median(rs, key):
    vals = [r[key] for r in rs if isinstance(r.get(key), (int, float))]
    return round(statistics.median(vals), 3) if vals else None


def build():
    mob = load('annotations.jsonl')
    neg = load('annotations_negatives.jsonl')
    gen = {(g['image']): g for g in genotypes()}

    # ---- ANTI: attribute lift negatives vs mobbin --------------------
    # Measured on BOTH corpora identically: genotype alleles that are
    # pixel-derivable, plus PS pass/fail and page fragmentation.
    mob_g = [gen[r['image']] for r in mob if r['image'] in gen]
    neg_g = []
    for r in neg:
        gg = gen.get(r['image'])
        if gg:
            neg_g.append(gg)
    if not neg_g:
        import sys
        sys.path.insert(0, os.path.join(ROOT, 'tools', 'design-gate'))
        from genome import genotype as _geno  # noqa: E402
        for r in neg:
            g_, _ = _geno(r)
            neg_g.append({'genotype': g_, 'label': 0})

    def attrs(rec):
        g = rec['genotype']
        ps = rec.get('ps') or {}
        bc = rec.get('block_count')
        return {
            'density': g.get('density-tier'),
            'whitespace': g.get('whitespace-band'),
            'image-led': g.get('image-led-ratio'),
            'media': g.get('media-treatment'),
            'surface': g.get('surface-rhythm'),
            'ps_main_share': 'ok' if ps.get('main_content_share', 0) >= 0.8
                             else 'fail',
            'ps_edges': 'ok' if ps.get('boilerplate_at_edges', 0) >= 1
                        else 'fail',
            'ps_priority': 'ok' if ps.get('priority_order', 0) >= 1
                           else 'fail',
            'page_fragmentation': ('fragmented' if (bc or 0) >= 6
                                   else 'coherent') if bc is not None else None,
        }

    mob_a = [attrs(r) for r in mob_g]
    neg_a = [attrs(r) for r in neg_g]
    keys = ['density', 'whitespace', 'image-led', 'media', 'surface',
            'ps_main_share', 'ps_edges', 'ps_priority', 'page_fragmentation']
    anti, sigs = {}, {}
    for k in keys:
        cm = Counter(a.get(k) for a in mob_a if a.get(k))
        cn = Counter(a.get(k) for a in neg_a if a.get(k))
        tm, tn = sum(cm.values()) or 1, sum(cn.values()) or 1
        rows = []
        for allele in set(cm) | set(cn):
            pm, pn = cm.get(allele, 0) / tm, cn.get(allele, 0) / tn
            lift = (pm + 0.01) / (pn + 0.01)
            rows.append({'allele': allele, 'mobbin': round(pm, 3),
                         'negative': round(pn, 3), 'lift': round(lift, 2)})
        anti[k] = sorted([r for r in rows if r['lift'] <= 0.60],
                         key=lambda r: r['lift'])[:4]
        sigs[k] = sorted([r for r in rows if r['lift'] >= 1.6],
                         key=lambda r: -r['lift'])[:4]

    feats = section_feature_anti(mob, neg)

    with open(os.path.join(DATA, 'anti.json'), 'w') as f:
        json.dump({'source': 'measured attribute lift, negatives vs mobbin',
                   'n_mobbin': len(mob_g), 'n_negative': len(neg_g),
                   'anti': anti, 'over_represented': sigs,
                   'features': feats}, f, indent=1)

    # ---- cells -> patterns ------------------------------------------
    cells = defaultdict(list)
    for r in mob:
        g = gen.get(r['image'])
        if not g:
            continue
        key = (r['site_type'], r['page_type'], r['section_type'])
        cells[key].append({**g, **{k: r.get(k) for k in (
            'whitespace_share', 'media_ratio', 'columns',
            'heading_body_ratio', 'site_name', 'mobbin_url', 'mobbin_id',
            'image', 'composition')}})

    # remove stale pattern files so the tree matches the index exactly
    for root, _, names in os.walk(PATTERNS):
        if '/data' in root or '/index' in root or '/tools' in root:
            continue
        for n in names:
            if n.startswith('pattern-') and n.endswith('.md'):
                os.remove(os.path.join(root, n))

    index = []
    written = 0
    for (site, page, section), recs in sorted(cells.items()):
        if len(recs) < 10:
            continue
        genes, modal, prev = best_signature(recs)
        if prev < 0.60:
            continue
        n = len(recs)
        matched = [r for r in recs
                   if all(r['genotype'].get(g) == a for g, a in modal.items())]
        comp_mode = Counter(r.get('composition') for r in matched).most_common(1)
        comp_mode = comp_mode[0][0] if comp_mode else 'other'
        comp_mode = COMP_TO_CATALOG.get(
            comp_mode, COMPOSITION_BY_SECTION.get(section, 'text-index'))
        # page type is part of the cell key, so it must be part of the
        # id: (site, page, section) cells can share a composition.
        pid = (f'pattern-{slug(site)}-{slug(page)}-{slug(section)}-'
               f'{slug(comp_mode)}')
        # evidence: most representative first (matching every modal allele)
        def match_score(r):
            return sum(1 for g, a in modal.items() if r['genotype'].get(g) == a)
        ev = sorted(recs, key=lambda r: (-match_score(r), r.get('site_name') or ''))
        evidence = []
        seen_sites = set()
        seen_urls = set()
        for r in ev:
            if len(evidence) >= 10:
                break
            u = r.get('mobbin_url')
            if u and u in seen_urls:
                continue
            if u:
                seen_urls.add(u)
            evidence.append(r)
        ev_ids = [r.get('mobbin_id') for r in evidence if r.get('mobbin_id')]
        ev_urls = [r.get('mobbin_url') for r in evidence if r.get('mobbin_url')]
        implies = sorted({rid for g in genes for rid in
                          json.load(open(os.path.join(DATA, 'genome.json'))
                          )['rules'].get(g, [])})
        checks = sorted({c for g in genes for c in GENE_CHECKS.get(g, [])})
        measurements = {
            'median_whitespace_share': median(recs, 'whitespace_share'),
            'median_media_ratio': median(recs, 'media_ratio'),
            'median_columns': median(recs, 'columns'),
            'median_heading_body_ratio': median(recs, 'heading_body_ratio'),
        }
        # SIGNATURE: an over-represented allele inside this cell's own
        # distribution that is NOT in the modal signature
        sig = None
        for gene in ['display-face', 'radius-personality', 'motion-tier',
                     'gallery-mode', 'form-presence', 'type-contrast']:
            c = Counter(r['genotype'].get(gene) for r in recs)
            for allele, cnt in c.most_common(3):
                share = cnt / n
                if 0.20 <= share < 0.60 and allele not in modal.values():
                    for row in sigs.get(gene, []):
                        if row['allele'] == allele:
                            sig = (gene, allele, share, row['lift'])
                            break
                if sig:
                    break
            if sig:
                break

        outdir = os.path.join(PATTERNS, site, section)
        os.makedirs(outdir, exist_ok=True)
        path = os.path.join(outdir, f'{pid}.md')
        write_pattern(path, pid, site, page, section, modal, genes, prev, n,
                      ev_ids, ev_urls, implies, checks, measurements, sig,
                      recs, comp_mode)
        index.append({'id': pid, 'site_type': site, 'page_type': page,
                      'section_type': section,
                      'composition': comp_mode,
                      'prevalence': round(prev, 3),
                      'n': n, 'path': os.path.relpath(path, PATTERNS),
                      'enforced_by': ', '.join(checks) or '-',
                      'signature': bool(sig)})
        written += 1

    with open(os.path.join(DATA, 'pattern-index.json'), 'w') as f:
        json.dump({'n_patterns': written, 'patterns': index}, f, indent=1)
    write_index_table(index)
    print(f'{written} patterns from {len(cells)} cells; '
          f'{len(anti)} anti gene rows')


INDEX_BEGIN = '<!-- BEGIN GENERATED PATTERN TABLE -->'
INDEX_END = '<!-- END GENERATED PATTERN TABLE -->'


def write_index_table(index):
    """Rewrite the lookup table inside patterns/INDEX.md in place."""
    path = os.path.join(PATTERNS, 'INDEX.md')
    if not os.path.isfile(path):
        return
    doc = open(path).read()
    if INDEX_BEGIN not in doc or INDEX_END not in doc:
        return
    rows = []
    for p in sorted(index, key=lambda r: (r['site_type'], r['section_type'],
                                          r['page_type'])):
        rows.append(
            f"| `{p['id']}` | {p['site_type']}/{p['page_type']} | "
            f"{p['section_type']} | {p['composition']} | {p['n']} | "
            f"{p['prevalence']:.2f} | {p['enforced_by']} |")
    table = '\n'.join([INDEX_BEGIN,
                       '| Pattern | Site/page | Section | Composition | n '
                       '| Prevalence | Enforced by |',
                       '|---|---|---|---|---|---|---|'] + rows +
                      [INDEX_END])
    head, rest = doc.split(INDEX_BEGIN, 1)
    _, tail = rest.split(INDEX_END, 1)
    open(path, 'w').write(head + table + tail)


COMP_TO_CATALOG = {
    'split-media': 'split-media', 'stacked-hero': 'stacked-hero',
    'immersive-media': 'full-bleed', 'full-bleed': 'full-bleed',
    'cards-n': 'cards-n', 'card-grid-2': 'cards-n',
    'card-grid-3': 'cards-n', 'card-grid-4': 'cards-n',
    'editorial-single': 'editorial', 'editorial': 'editorial',
    'sequence': 'sequence', 'faq': 'faq', 'comparison': 'comparison',
    'table-matrix': 'comparison', 'quote-grid': 'quote-grid',
    'logo-wall': 'logo-wall', 'badge-center': 'badge-center',
    'media-gallery': 'media-gallery', 'carousel': 'media-gallery',
    'form-panel': 'form-panel', 'capture-form': 'capture-form',
    'hero-act-merge': 'hero-act-merge', 'text-index': 'text-index',
    'link-grid': 'link-grid', 'stat-band': 'stat-band',
    'proof-band': 'proof-band', 'map-finder': 'map-finder',
    'app-band': 'app-band',
}


# Continuous section features and the direction in which a value is
# *generic*. A row is only written when the two corpora actually differ:
# the negative rate must be at least 1.8x the mobbin rate and cover at
# least a third of the negative corpus. No threshold is invented.
ANTI_FEATURES = [
    ('s_row_regularity', 'high', [0.80, 0.85, 0.90, 0.95]),
    ('s_cta_presence', 'low', [0.50]),
    ('s_block_pace', 'low', [0.20, 0.40, 0.60]),
    ('s_prose_mass', 'high', [0.40, 0.60, 0.80]),
]


def section_feature_anti(mob_g, neg_g):
    sys.path.insert(0, os.path.join(ROOT, 'tools', 'design-gate'))
    from score import section_shape
    rows = []
    for feature, direction, cuts in ANTI_FEATURES:
        best = None
        for cut in cuts:
            def rate(recs):
                vals = [section_shape(r)[feature] for r in recs]
                hit = [v for v in vals if (v >= cut if direction == 'high'
                                           else v < cut)]
                return len(hit) / max(1, len(vals))
            pm, pn = rate(mob_g), rate(neg_g)
            lift = (pn + 0.01) / (pm + 0.01)
            if pn >= 0.33 and lift >= 1.8 and (best is None
                                               or lift > best['lift']):
                best = {'feature': feature, 'direction': direction,
                        'cut': cut, 'mobbin': round(pm, 3),
                        'negative': round(pn, 3), 'lift': round(lift, 2),
                        'penalty': round(min(0.25, (pn - pm) * 0.5), 3)}
        if best:
            rows.append(best)
    return sorted(rows, key=lambda r: -r['lift'])


def write_pattern(path, pid, site, page, section, modal, genes, prev, n,
                  ev_ids, ev_urls, implies, checks, meas, sig, recs,
                  comp_mode='other'):
    gen = json.load(open(os.path.join(DATA, 'genome.json')))
    act = {'hero': 'promise', 'testimonials': 'proof',
           'logo-sections': 'proof', 'trust-badges': 'proof',
           'reviews': 'proof', 'feature': 'how', 'how-it-works': 'how',
           'comparison': 'objection', 'pricing': 'objection', 'faq': 'objection',
           'call-to-action': 'act', 'contact': 'act', 'form': 'act',
           'donate': 'act', 'booking': 'act', 'add-to-cart': 'act'}
    speech = act.get(section, 'detail')
    comp = comp_mode

    lines = ['---', f'id: {pid}', 'type: pattern', f'site_types: [{site}]',
             f'page_types: [{page}]', f'section_type: {section}',
             f'speech_acts: [{speech}]', f'composition: {comp}',
             f'prevalence: {round(prev, 3)}', f'n: {n}',
             'evidence:']
    for u in ev_urls[:10]:
        lines.append(f'  - {u}')
    lines.append(f'implies_rules: [{", ".join(implies)}]')
    lines.append(f'enforced_by: [{", ".join(checks)}]')
    lines.append(f'consumes: [{", ".join("gene-" + g for g in genes)}]')
    lines.append('used_in: [w4, w5]')
    lines.append('genotype:')
    for g in ['layout-archetype', 'page-macro-structure', 'density-tier',
              'image-led-ratio', 'type-contrast', 'display-face',
              'radius-personality', 'surface-rhythm', 'cta-restraint',
              'cta-rank', 'disclosure-tier', 'nav-pattern', 'motion-tier',
              'proof-type', 'media-treatment', 'columns', 'heading-form',
              'whitespace-band', 'gallery-mode', 'form-presence']:
        if g in modal:
            lines.append(f'  {g}: {modal[g]}')
    lines += ['links:', '  index: patterns-index',
              f'  composition: section-catalog#{comp}',
              '  used_in: [w4, w5]', '---', '']
    lines.append(f'# {pid}')
    lines.append('')
    tone = TONE.get(site, 'the page’s reader')
    arch = modal.get('layout-archetype') or 'editorial-single'
    body = IMPERATIVE.get(arch, IMPERATIVE_BY_COMP.get(comp, 'Compose the '
                         'section from its catalog row.'))
    detail = []
    if modal.get('image-led-ratio'):
        detail.append(f"imagery at `{modal['image-led-ratio']}`")
    if modal.get('density-tier'):
        detail.append(f"`{modal['density-tier']}` vertical rhythm")
    if modal.get('cta-restraint'):
        detail.append(f"CTA restraint `{modal['cta-restraint']}`")
    if modal.get('heading-form'):
        detail.append(f"headings as `{modal['heading-form']}`s")
    if modal.get('proof-type') and modal['proof-type'] != 'none':
        detail.append(f"proof as `{modal['proof-type']}`")
    if modal.get('disclosure-tier'):
        detail.append(f"disclosure `{modal['disclosure-tier']}`")
    lines.append(
        f"{body} On {site} {section} sections built for {tone}, hold "
        f"{', '.join(detail) if detail else 'the catalog defaults'}. "
        f"This signature appears in {prev:.0%} of {n} annotated screens "
        f"({', '.join(genes)}), so it is the default, not a variation: "
        f"select it unless the brief gives a named reason to deviate, and "
        f"log that reason (P.8).")
    lines.append('')
    lines.append('## Key measurements')
    lines.append('')
    lines.append('| Measure | Median |')
    lines.append('|---|---|')
    for k, v in meas.items():
        if v is not None:
            lines.append(f'| `{k}` | {v} |')
    lines.append('')
    if sig:
        lines.append('## Signature move')
        lines.append('')
        lines.append(
            f"`{sig[0]}: {sig[1]}` appears in {sig[2]:.0%} of this cell's "
            f"screens and is {sig[3]:.1f}× more common on curated "
            f"screens than on the negative corpus — use it when the brief "
            f"asks for a distinctive take, not by default.")
        lines.append('')
    lines.append('## Evidence')
    lines.append('')
    lines.append(f'{n} annotated screens; {len(ev_ids)} Mobbin citations '
                 f'in the frontmatter.')
    lines.append('')
    with open(path, 'w') as f:
        f.write('\n'.join(lines))


if __name__ == '__main__':
    build()
