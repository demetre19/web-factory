#!/usr/bin/env python3
"""lexington_index.py — summary index over the Lexington Themes
viewport-preview harvest banked under
docs/machinery/design/patterns/data/operator/https-<slug>-lexdemos-com*.

Reads only banked data (meta.json per captured page, the section-bank
canonical tag vectors, pattern-index.json, and the crawl source lists)
and emits:

  docs/machinery/design/patterns/data/lexington/index.json
  docs/machinery/design/patterns/data/lexington/INDEX.md

Contents: theme count, per-theme page inventory + page-type coverage
matrix, section-type coverage vs the mined pattern table (novel cells),
vibe distribution, system-page inventory, and capture/quarantine stats
from lexdemos-deep.json. Re-run after any new lexdemos ingest; never
edit the outputs by hand.
"""
import glob
import json
import os
from collections import Counter, defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
DATA = os.path.join(ROOT, 'docs', 'machinery', 'design', 'patterns',
                    'data')
OPERATOR = os.path.join(DATA, 'operator')
OUT = os.path.join(DATA, 'lexington')

LEX_GLOB = os.path.join(OPERATOR, 'https-*-lexdemos-com*', 'meta.json')
SEC_BANK = os.path.join(DATA, 'section-bank')
PATTERN_INDEX = os.path.join(DATA, 'pattern-index.json')
DEEP_SRC = os.path.join(OPERATOR, '_sources', 'lexdemos-deep.json')
LEX_SITES = os.path.join(HERE, 'lexington-sites.json')


def load_meta():
    themes = defaultdict(lambda: {
        'pages': [], 'page_types': Counter(), 'section_types': Counter(),
        'site_type': None, 'site_type_v2': None, 'vibe': Counter(),
        'template': None})
    for path in sorted(glob.glob(LEX_GLOB)):
        try:
            d = json.load(open(path))
        except Exception:
            continue
        slug = d.get('domain', '').split('.')[0]
        t = themes[slug]
        t['pages'].append({'url': d.get('url'),
                           'page_type': d.get('page_type'),
                           'slug': os.path.basename(os.path.dirname(path)),
                           'capture_status': d.get('capture_status'),
                           'n_sections': len(d.get('sections', []))})
        t['page_types'][d.get('page_type') or 'other'] += 1
        t['site_type'] = d.get('site_type')
        t['site_type_v2'] = d.get('site_type_v2')
        t['template'] = d.get('lexington_template')
        for k, v in (d.get('vibe') or {}).items():
            if k in ('confidence', 'evidence'):
                continue
            for val in (v if isinstance(v, list) else [v]):
                if val:
                    t['vibe'][f'{k}:{val}'] += 1
        for s in d.get('sections', []):
            t['section_types'][s.get('section_type') or '?'] += 1
    return themes


def load_bank_tags():
    """Return (lex_counts, rest_counts) Counters over canonical tags."""
    idx_path = os.path.join(SEC_BANK, 'index.json')
    vec_path = os.path.join(SEC_BANK, 'tag_vectors.bin')
    if not (os.path.exists(idx_path) and os.path.exists(vec_path)):
        return None, None
    try:
        import numpy as np
    except ImportError:
        return None, None
    idx = json.load(open(idx_path))
    cols, order, n, td = (idx['tag_cols'], idx['order'], idx['count'],
                        idx['tag_dim'])
    a = np.fromfile(vec_path, dtype=idx.get('dtype', 'float16'))
    a = a.reshape(n, td)
    lex_counts, rest_counts = Counter(), Counter()
    for i, p in enumerate(order):
        tgt = lex_counts if 'lexdemos' in p else rest_counts
        for j in np.nonzero(a[i] > 0.5)[0]:
            tgt[cols[j]] += 1
    return lex_counts, rest_counts


def load_pattern_cells():
    """(section_type, composition) cells already proven as patterns."""
    if not os.path.exists(PATTERN_INDEX):
        return set(), Counter()
    d = json.load(open(PATTERN_INDEX))
    cells = {(p['section_type'], p['composition']) for p in d['patterns']}
    comps = Counter(p['composition'] for p in d['patterns'])
    secs = Counter(p['section_type'] for p in d['patterns'])
    return cells, {'compositions': comps, 'section_types': secs}


def main():
    themes = load_meta()
    lex_tags, rest_tags = load_bank_tags()
    pattern_cells, pat_stats = load_pattern_cells()

    page_types = Counter()
    sec_types = Counter()
    matrix = defaultdict(Counter)  # theme -> page_type -> count
    system_pages = []
    captured = seen = quarantined = 0
    if os.path.exists(DEEP_SRC):
        deep = json.load(open(DEEP_SRC))
        for s in deep.get('sites', {}).values():
            seen += s.get('seen', 0)
            captured += s.get('captured', 0)
            quarantined += s.get('skipped', 0) + s.get('errors', 0)

    for slug, t in themes.items():
        page_types.update(t['page_types'])
        sec_types.update(t['section_types'])
        matrix[slug] = t['page_types']
        for p in t['pages']:
            if '/system/' in (p['url'] or ''):
                system_pages.append(p['url'])

    # canonical tag deltas: what the lexington corpus carries that the
    # rest of the bank does not, and which mined pattern cells it lands
    # on.
    novelty = {'section_types_only_in_lexington': {},
               'compositions_only_in_lexington': {},
               'styles_only_in_lexington': {},
               'cells_with_no_pattern_row': {}}
    canonical = {'section_types': {}, 'compositions': {}, 'styles': {}}
    if lex_tags is not None:
        def by(prefix, c):
            return {t.split(':', 1)[1]: n for t, n in c.items()
                    if t.startswith(prefix)}
        st_lex = by('section_type:', lex_tags)
        st_rest = by('section_type:', rest_tags)
        canonical['section_types'] = dict(
            sorted(st_lex.items(), key=lambda x: -x[1]))
        novelty['section_types_only_in_lexington'] = {
            k: v for k, v in st_lex.items() if k not in st_rest}
        comp_lex = by('composition:', lex_tags)
        comp_rest = by('composition:', rest_tags)
        canonical['compositions'] = dict(
            sorted(comp_lex.items(), key=lambda x: -x[1]))
        novelty['compositions_only_in_lexington'] = {
            k: v for k, v in comp_lex.items() if k not in comp_rest}
        sty_lex = by('style:', lex_tags)
        sty_rest = by('style:', rest_tags)
        canonical['styles'] = dict(
            sorted(sty_lex.items(), key=lambda x: -x[1]))
        novelty['styles_only_in_lexington'] = {
            k: v for k, v in sty_lex.items() if k not in sty_rest}
        # canonical section types with no mined pattern row. The mined
        # vocabulary is coarser ('feature', 'hero', 'testimonials'), so
        # a canonical type counts as uncovered only when neither it nor
        # its base stem (before the first '-') has a pattern row.
        proven_secs = set(pat_stats['section_types']) if pat_stats else set()
        novelty['cells_with_no_pattern_row'] = {
            k: v for k, v in st_lex.items()
            if k not in proven_secs
            and k.split('-')[0] not in proven_secs}

    vibe_dist = Counter()
    for t in themes.values():
        vibe_dist.update(t['vibe'])

    lex_sites = []
    if os.path.exists(LEX_SITES):
        lex_sites = json.load(open(LEX_SITES))

    index = {
        'kind': 'lexington-harvest-index',
        'generated': __import__('time').strftime('%Y-%m-%dT%H:%M:%SZ',
                                                __import__('time')
                                                .gmtime()),
        'source': 'https://lexingtonthemes.com/sitemap.xml + '
                  '/viewports/<theme> iframe previews (public)',
        'n_themes': len(themes),
        'n_pages_captured': sum(len(t['pages']) for t in themes.values()),
        'crawl_stats': {'seen': seen, 'captured': captured,
                        'quarantined_or_error': quarantined},
        'page_type_coverage': dict(page_types.most_common()),
        'section_type_coverage': dict(sec_types.most_common()),
        'system_pages': sorted(system_pages),
        'n_system_pages': len(system_pages),
        'vibe_distribution': dict(vibe_dist.most_common()),
        'canonical': canonical,
        'novelty': novelty,
        'themes': {slug: {
            'template': t['template'],
            'site_type': t['site_type'],
            'site_type_v2': t['site_type_v2'],
            'page_types': dict(t['page_types'].most_common()),
            'section_types': dict(t['section_types'].most_common()),
            'pages': sorted(t['pages'], key=lambda p: p['url'] or ''),
        } for slug, t in sorted(themes.items())},
        'template_index': {s.get('lexington_template'): s
                           for s in lex_sites},
    }

    os.makedirs(OUT, exist_ok=True)
    json.dump(index, open(os.path.join(OUT, 'index.json'), 'w'),
              indent=1, sort_keys=True)

    md = ['---', 'id: lexington-harvest-index', 'type: index',
          'links:', '  index: patterns-index', '---', '',
          '# LEXINGTON HARVEST INDEX — viewport preview pattern bank', '',
          f"- themes harvested: **{index['n_themes']}**",
          f"- pages captured: **{index['n_pages_captured']}** "
          f"(seen {seen}, quarantined/error {quarantined})",
          f"- system pages: **{len(system_pages)}** "
          "(colours / typography / buttons / links / shaders)", '',
          '## Page-type coverage', '',
          '| page_type | pages |', '|---|---|']
    for pt, n in page_types.most_common():
        md.append(f'| {pt} | {n} |')
    md += ['', '## Section-type coverage (capture-time scan)', '',
           '| section_type | sections |', '|---|---|']
    for st_, n in sec_types.most_common():
        md.append(f'| {st_} | {n} |')
    if canonical['section_types']:
        md += ['', '## Canonical section types (banked tags)', '',
               '| section_type | sections |', '|---|---|']
        for st_, n in list(canonical['section_types'].items())[:40]:
            md.append(f'| {st_} | {n} |')
        md += ['', '## Canonical compositions', '',
               '| composition | sections |', '|---|---|']
        for c, n in canonical['compositions'].items():
            md.append(f'| {c} | {n} |')
    md += ['', '## Novelty vs mined pattern table', '',
           'Section types present in the Lexington corpus but absent '
           'from the rest of the bank:']
    for k, v in sorted(novelty['section_types_only_in_lexington'].items(),
                       key=lambda x: -x[1]):
        md.append(f'- `{k}` ({v})')
    md += ['', 'Lexington section types with **no proven pattern row** '
           'in `pattern-index.json`:']
    for k, v in sorted(novelty['cells_with_no_pattern_row'].items(),
                       key=lambda x: -x[1]):
        md.append(f'- `{k}` ({v})')
    md += ['', '## Themes', '',
           '| theme | site_type | pages | page types |',
           '|---|---|---|---|']
    for slug, t in sorted(themes.items()):
        pts = ', '.join(f'{k}×{v}' for k, v in t['page_types']
                        .most_common())
        md.append(f"| {slug} | {t['site_type_v2'] or t['site_type']} "
                  f"| {len(t['pages'])} | {pts} |")
    md.append('')
    open(os.path.join(OUT, 'INDEX.md'), 'w').write('\n'.join(md))
    print(f"index: {index['n_themes']} themes, "
          f"{index['n_pages_captured']} pages -> {OUT}")


if __name__ == '__main__':
    main()
