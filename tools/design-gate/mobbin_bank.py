#!/usr/bin/env python3
"""mobbin_bank.py — bank mined Mobbin exemplars as skeleton corpus.

Input: a classification manifest JSON (list of dicts with id, site_name,
mobbin_url, image_url, topology_class, mode, style, queries, image) plus
the downloaded images directory. Emits per item under
templates/skeletons/mobbin/<family>/<id-prefix>-<slug>/ :

  <name>.topo.json   — structure vector (label/topology_id/element_sig/
                       tree) — topology classed by eye, M3 slot names
  <name>.spec.json   — brixies-shaped spec + provenance + TAGS block
                       (section_class, topology_class, style[], mode,
                       platform, matched_topo/confidence)
  <name>.webp        — the exemplar image (image URLs expire in 30d —
                       the file in the bank is the durable artifact)

Also maintains:
  templates/skeletons/mobbin/tags.json        — id → tag axes
  templates/skeletons/mobbin/MANIFEST.json    — full mining manifest
  docs/machinery/design/MOBBIN-NAV-INDEX.md   — human index
  topology-sources-index.json                 — .topo.json rows

matched_topo maps each topology_class onto the closest existing bank
topology_id (fuzzy structure match); confidence 'high' means the bank
already models this structure, 'new' means the exemplar IS a new
topology (emitted .topo.json is the first bank vector for it).

Usage: mobbin_bank.py <manifest.json> <images-dir> [--limit N]
       mobbin_bank.py --retag     (re-emit index/tags from spec.jsons)
"""
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(HERE))
MOBBIN = os.path.join(REPO, 'templates', 'skeletons', 'mobbin')
SOURCES_INDEX = os.path.join(REPO, 'templates', 'skeletons',
                             'topology-sources-index.json')
NAV_INDEX_MD = os.path.join(REPO, 'docs', 'machinery', 'design',
                            'MOBBIN-NAV-INDEX.md')
SECTIONS_INDEX_MD = os.path.join(REPO, 'docs', 'machinery', 'design',
                                 'MOBBIN-SECTIONS-INDEX.md')

FAMILY_FOR = {
    'top-bar': 'nav-top-bar',
    'dropdown-menu': 'nav-dropdown',
    'mega-panel': 'nav-mega-panel',
    'dock-left-drawer': 'nav-drawer-left',
    'dock-right-drawer': 'nav-drawer-right',
    'full-screen-overlay': 'nav-overlay',
    'modal': 'nav-modal',
    'bottom-sheet': 'nav-bottom-sheet',
    'sticky-bar': 'nav-sticky-bar',
    # web section classes
    'footer-columns': 'footer', 'faq-accordion': 'faq',
    'pricing-tiers': 'pricing', 'testimonial-cards': 'testimonials',
    'cta-band': 'cta', 'hero-split': 'hero',
    'feature-grid': 'features', 'about-editorial': 'about',
    'contact-form': 'contact', 'comparison-table': 'comparison',
    'app-download': 'downloads', 'article-grid': 'blog',
    'error-page': 'error-404', 'gallery-grid': 'gallery',
    'steps': 'how-it-works', 'logo-cloud': 'logos',
    'stats-row': 'stats', 'timeline': 'timeline',
    'newsletter-band': 'newsletter',
}

# topology_class → (closest existing bank topology_id, confidence)
MATCHED_TOPO = {
    'top-bar': ('nav-top-bar', 'high'),
    'dropdown-menu': ('nav-top-bar', 'medium'),
    'mega-panel': ('grid-3col-uniform', 'medium'),
    'modal': ('modal', 'high'),
    'dock-left-drawer': ('list-vertical-rows', 'medium'),
    'dock-right-drawer': ('list-vertical-rows', 'medium'),
    'full-screen-overlay': ('list-vertical-rows', 'low'),
    'bottom-sheet': ('list-vertical-rows', 'low'),
    'sticky-bar': ('nav-top-bar', 'medium'),
    # web section classes
    'footer-columns': ('footer-column', 'high'),
    'faq-accordion': ('list-vertical-rows', 'high'),
    'pricing-tiers': ('grid-3col-uniform', 'high'),
    'testimonial-cards': ('list-cards', 'high'),
    'cta-band': ('band-strip', 'high'),
    'hero-split': ('hero-media-bg', 'medium'),
    'feature-grid': ('grid-3col-uniform', 'high'),
    'about-editorial': ('split-50-50', 'medium'),
    'contact-form': ('form-centered', 'high'),
    'comparison-table': ('table-cell', 'high'),
    'app-download': ('split-50-50', 'high'),
    'article-grid': ('grid-3col-uniform', 'high'),
    'error-page': ('content', 'high'),
    'gallery-grid': ('grid-4col-uniform', 'high'),
    'steps': ('list-vertical-rows', 'medium'),
    'logo-cloud': ('grid-4col-uniform', 'high'),
    'stats-row': ('grid-4col-uniform', 'medium'),
    'timeline': ('list-vertical-rows', 'high'),
    'newsletter-band': ('form-centered', 'high'),
}

ELEMENT_SIG = {
    'top-bar': {'nav': 1, 'ul': 1, 'a': 6, 'btn': 1},
    'dropdown-menu': {'nav': 1, 'ul': 2, 'a': 9, 'btn': 1},
    'mega-panel': {'nav': 1, 'ul': 4, 'a': 14, 'btn': 1},
    'modal': {'h': 1, 'p': 1, 'btn': 2},
    'dock-left-drawer': {'aside': 1, 'ul': 2, 'a': 8, 'icn': 6},
    'dock-right-drawer': {'aside': 1, 'ul': 2, 'a': 8, 'icn': 6},
    'full-screen-overlay': {'nav': 1, 'ul': 3, 'a': 10},
    'bottom-sheet': {'ul': 2, 'a': 6, 'icn': 4},
    'sticky-bar': {'nav': 1, 'ul': 1, 'a': 5, 'icn': 2},
    # web section classes
    'footer-columns': {'ul': 4, 'a': 14, 'h': 4, 'btn': 1},
    'faq-accordion': {'h': 1, 'ul': 1, 'li': 6, 'btn': 6},
    'pricing-tiers': {'h': 1, 'card': 3, 'ul': 3, 'btn': 3},
    'testimonial-cards': {'h': 1, 'card': 3, 'p': 3, 'img': 3},
    'cta-band': {'h': 1, 'p': 1, 'btn': 2},
    'hero-split': {'h': 1, 'p': 1, 'btn': 2, 'img': 1},
    'feature-grid': {'h': 1, 'card': 6, 'icn': 6},
    'about-editorial': {'h': 1, 'p': 2, 'img': 1},
    'contact-form': {'h': 1, 'input': 4, 'btn': 1},
    'comparison-table': {'h': 1, 'table': 1, 'th': 4, 'td': 8},
    'app-download': {'h': 1, 'p': 1, 'btn': 2, 'img': 1},
    'article-grid': {'h': 1, 'card': 4, 'img': 4, 'a': 4},
    'error-page': {'h': 1, 'p': 1, 'btn': 1},
    'gallery-grid': {'h': 1, 'img': 8},
    'steps': {'h': 1, 'ul': 1, 'li': 4, 'icn': 4},
    'logo-cloud': {'img': 8, 'a': 8},
    'stats-row': {'h': 1, 'stat': 4},
    'timeline': {'ul': 1, 'li': 5, 'h': 5, 'p': 5},
    'newsletter-band': {'h': 1, 'p': 1, 'input': 1, 'btn': 1},
}


def _node(name, tag, label, depth):
    return {'name': name, 'tag': tag, 'label': label,
            'loop': False, 'classes': [], 'depth': depth}


def _tree(topology_class):
    """Minimal M3-shaped structure vector for the topology class."""
    if topology_class == 'top-bar':
        return [_node('section', 'section', 'Nav bar', 0),
                _node('container', 'container', None, 1),
                _node('block', 'block', 'Brand', 2),
                _node('logo', 'logo', None, 3),
                _node('nav-nested', 'nav', 'Nav', 2),
                _node('block', 'ul', 'Nav items', 3),
                _node('text-link', 'a', 'Nav link', 4),
                _node('button', 'btn', 'CTA', 2)]
    if topology_class == 'dropdown-menu':
        return [_node('section', 'section', 'Nav bar', 0),
                _node('nav-nested', 'nav', 'Nav', 1),
                _node('dropdown', 'dropdown', 'Menu trigger', 2),
                _node('block', 'ul', 'Menu items', 3),
                _node('text-link', 'a', 'Menu item', 4)]
    if topology_class == 'mega-panel':
        return [_node('section', 'section', 'Nav bar', 0),
                _node('nav-nested', 'nav', 'Nav', 1),
                _node('dropdown', 'dropdown', 'Mega panel', 2),
                _node('block', 'grid', 'Link columns', 3),
                _node('block', 'ul', 'Column', 4),
                _node('text-link', 'a', 'Link', 5),
                _node('image', 'img', 'Feature card', 4)]
    if topology_class in ('dock-left-drawer', 'dock-right-drawer'):
        side = 'left' if 'left' in topology_class else 'right'
        return [_node('section', 'aside', f'{side.title()} drawer', 0),
                _node('block', 'header', 'Profile header', 1),
                _node('nav-nested', 'nav', 'Nav', 1),
                _node('block', 'ul', 'Grouped links', 2),
                _node('icon', 'icn', 'Row icon', 3),
                _node('text-link', 'a', 'Icon+label row', 3),
                _node('block', 'footer', 'Footer actions', 1)]
    if topology_class == 'full-screen-overlay':
        return [_node('section', 'section', 'Overlay', 0),
                _node('block', 'grid', 'Menu columns', 1),
                _node('block', 'ul', 'Link group', 2),
                _node('text-link', 'a', 'Link', 3)]
    if topology_class == 'modal':
        return [_node('section', 'dialog', 'Dialog', 0),
                _node('block', 'card', 'Card', 1),
                _node('heading', 'h2', 'Title', 2),
                _node('text-basic', 'p', 'Body', 2),
                _node('button', 'btn', 'Actions', 2)]
    if topology_class == 'bottom-sheet':
        return [_node('section', 'nav', 'Bottom sheet', 0),
                _node('block', 'ul', 'Items', 1),
                _node('icon', 'icn', 'Row icon', 2),
                _node('text-link', 'a', 'Row', 2)]
    # generic section tree derived from the element signature
    sig = ELEMENT_SIG.get(topology_class, {})
    tree = [_node('section', 'section', topology_class, 0)]
    for el, count in sig.items():
        for i in range(min(count, 4)):
            tree.append(_node(
                {'h': 'heading', 'p': 'text-basic', 'img': 'image',
                 'btn': 'button', 'a': 'text-link', 'icn': 'icon',
                 'card': 'block', 'li': 'block', 'input': 'input',
                 'table': 'table', 'th': 'block', 'td': 'block',
                 'ul': 'block', 'stat': 'block'}.get(el, 'block'),
                el, None, 1 + (i > 0)))
    return tree


def _slug(s):
    return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-') or 'site'


def bank_item(c, img_dir):
    """Emit one exemplar's bank files; returns its index row."""
    fam = FAMILY_FOR.get(c['topology_class'], 'nav-misc')
    name = f"{c['id'][:8]}-{_slug(c['site_name'])[:24]}"
    d = os.path.join(MOBBIN, fam)
    os.makedirs(d, exist_ok=True)
    src = os.path.join(img_dir, c['image'])
    dst = os.path.join(d, f'{name}.webp')
    if not os.path.exists(dst) and os.path.exists(src):
        with open(src, 'rb') as f, open(dst, 'wb') as g:
            g.write(f.read())
    matched, conf = MATCHED_TOPO.get(
        c['topology_class'], ('content', 'low'))
    section_class = c.get('section_class', 'navigation')
    nav_like = c['topology_class'] in MATCHED_TOPO and \
        section_class == 'navigation'
    is_new = conf in ('low', 'medium') and c['topology_class'] \
        not in ('top-bar', 'modal') and nav_like
    topo_id = (matched if conf == 'high'
               else (f"nav-{c['topology_class']}" if nav_like
                     else matched))
    topo = {
        'label': f"{c['site_name']} — {c['topology_class']}",
        'source': 'mobbin',
        'sourceUrl': c['mobbin_url'],
        'version': '1',
        'topology_id': topo_id,
        'element_sig': ELEMENT_SIG.get(c['topology_class'], {}),
        'tree': _tree(c['topology_class']),
    }
    with open(os.path.join(d, f'{name}.topo.json'), 'w') as f:
        json.dump(topo, f, indent=1)
    spec = {
        'id': c['id'],
        'title': f"{c['site_name']} {c['topology_class']}",
        'type': 'section',
        'category': [section_class],
        'elements': list(ELEMENT_SIG.get(
            c['topology_class'], {}).keys()),
        'style_tags': [c['style'], c['mode']],
        'use_case': c['topology_class'],
        'framework': 'ACSS',
        'complexity': 'Simple',
        'plugins': [],
        'mobbin_id': c['id'],
        'mobbin_url': c['mobbin_url'],
        'site_name': c['site_name'],
        'platform': 'web',
        'featured_image': f'{name}.webp',
        'matched_topo': {'topology_id': matched, 'confidence': conf},
        'is_new_topology': is_new,
        'tags': {
            'section_class': section_class,
            'topology_class': c['topology_class'],
            'style': [c['style']],
            'category': [],
            'mode': c['mode'],
            'platform': 'web',
        },
        'queries': c['queries'],
        'short_description': '',
    }
    with open(os.path.join(d, f'{name}.spec.json'), 'w') as f:
        json.dump(spec, f, indent=1)
    return {'file': f'mobbin/{fam}/{name}.topo.json',
            'topology_id': topo_id, 'name': name, 'family': fam,
            'c': c, 'spec': spec, 'is_new': is_new}


def index_row(r):
    return {'source_id': r['c']['id'], 'title': r['name'],
            'framework': 'ACSS', 'type': 'section',
            'topology_id': r['topology_id'], 'nesting_depth': 4,
            'direction_ratio': 0.0, 'edge_hints': {},
            'seam_style': 'whitespace', 'column_schedule': {},
            'acss_tokens': [], 'acss_bends': [], 'on_baseline': True,
            'semantic_labels': [r['c']['site_name'],
                                r['c']['topology_class']],
            'file': r['file']}


def main():
    if len(sys.argv) > 1 and sys.argv[1] == '--retag':
        rows = []
        for root, _dirs, files in os.walk(MOBBIN):
            for fn in files:
                if fn.endswith('.spec.json') and root != MOBBIN:
                    p = os.path.join(root, fn)
                    s = json.load(open(p))
                    if 'site_name' not in s:
                        continue
                    fam = os.path.relpath(root, MOBBIN)
                    name = fn[:-len('.spec.json')]
                    tp = os.path.join(root, f'{name}.topo.json')
                    topo = json.load(open(tp)) \
                        if os.path.exists(tp) else {}
                    rows.append({
                        'file': f'mobbin/{fam}/{name}.topo.json',
                        'topology_id': topo.get('topology_id', ''),
                        'name': name, 'family': fam,
                        'c': s, 'spec': s,
                        'is_new': s.get('is_new_topology', False)})
        mp = os.path.join(MOBBIN, 'MANIFEST.json')
        merged = {}
        if os.path.exists(mp):
            for e in json.load(open(mp)):
                merged[e.get('mobbin_id', e.get('id'))] = e
        for r in rows:
            s = r['spec']
            merged[s.get('mobbin_id', s['id'])] = {
                'id': s.get('mobbin_id', s['id']),
                'site_name': s.get('site_name', ''),
                'mobbin_url': s.get('mobbin_url', ''),
                'section_class': (s.get('tags') or {}).get(
                    'section_class', 'navigation'),
                'topology_class': (s.get('tags') or {}).get(
                    'topology_class', ''),
                'mode': (s.get('tags') or {}).get('mode', ''),
                'queries': s.get('queries', [])}
        json.dump(list(merged.values()), open(mp, 'w'), indent=1)
        _write_indexes(rows)
        print(f'retagged {len(rows)} exemplars')
        return
    manifest_p, img_dir = sys.argv[1], sys.argv[2]
    limit = int(sys.argv[sys.argv.index('--limit') + 1]) \
        if '--limit' in sys.argv else None
    classes = json.load(open(manifest_p))[:limit]
    rows = [bank_item(c, img_dir) for c in classes]
    _write_specs(rows)
    _write_indexes(rows)
    print(f'banked {len(rows)} exemplars')


def _write_specs(rows):
    mp = os.path.join(MOBBIN, 'MANIFEST.json')
    merged = {}
    if os.path.exists(mp):
        for e in json.load(open(mp)):
            merged[e.get('mobbin_id', e.get('id'))] = e
    for r in rows:
        merged[r['c'].get('mobbin_id', r['c']['id'])] = r['c']
    json.dump(list(merged.values()), open(mp, 'w'), indent=1)


def _write_indexes(rows):
    # tags.json: id → tag axes (the AND-filter facet schema)
    tags = {}
    for r in rows:
        s = r.get('spec') or r['c']
        t = s.get('tags', {})
        tags[s.get('mobbin_id', s['id'])] = {
            'file': r['file'].replace('.topo.json', ''),
            'family': r['family'],
            'site_name': s.get('site_name', ''),
            'mobbin_url': s.get('mobbin_url', ''),
            'section_class': t.get('section_class', 'navigation'),
            'topology_class': t.get('topology_class',
                                    s.get('use_case', '')),
            'topology_id': r.get('topology_id', ''),
            'style': t.get('style', []),
            'category': t.get('category', []),
            'mode': t.get('mode', 'light'),
            'platform': t.get('platform', 'web'),
            'matched_topo': s.get('matched_topo', {}),
            'is_new_topology': s.get('is_new_topology', False),
        }
    tp = os.path.join(MOBBIN, 'tags.json')
    existing = json.load(open(tp)) if os.path.exists(tp) else {}
    existing.update(tags)
    json.dump(existing, open(tp, 'w'), indent=1)

    idx = json.load(open(SOURCES_INDEX))
    have = {e.get('file') for e in idx}
    for r in rows:
        if r['file'] not in have:
            idx.append(index_row(r))
    json.dump(idx, open(SOURCES_INDEX, 'w'), indent=1)

    os.makedirs(os.path.dirname(NAV_INDEX_MD), exist_ok=True)
    nav_rows = [r for r in rows
                if r['family'].startswith('nav-')]
    sec_rows = [r for r in rows
                if not r['family'].startswith('nav-')]
    for path, title, group in (
            (NAV_INDEX_MD, 'MOBBIN NAV/MENU/MODAL INDEX', nav_rows),
            (SECTIONS_INDEX_MD, 'MOBBIN WEB SECTIONS INDEX',
             sec_rows)):
        if not group:
            continue
        lines = [f'# {title}', '',
                 'Web-platform exemplars banked from Mobbin '
                 '(screenshots licensed reference-only, not '
                 'redistributable assets).', '',
                 '| # | site | family | topology_class | topology_id '
                 '| mode | style | new topo | mobbin |',
                 '|---|---|---|---|---|---|---|---|---|']
        for i, r in enumerate(group):
            c = r['c'] if 'c' in r else r.get('spec', {})
            t = (c.get('tags') or {})
            lines.append(
                f"| {i} | {c.get('site_name','')} | {r['family']} | "
                f"{t.get('topology_class', c.get('topology_class',''))} | "
                f"{r.get('topology_id','')} | {t.get('mode','')} | "
                f"{','.join(t.get('style', []))} | "
                f"{'YES' if r.get('is_new', c.get('is_new_topology')) else ''} | "
                f"[link]({c.get('mobbin_url','').split('?')[0]}) |")
        with open(path, 'w') as f:
            f.write('\n'.join(lines) + '\n')


if __name__ == '__main__':
    main()
