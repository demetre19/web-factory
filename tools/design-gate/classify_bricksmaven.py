#!/usr/bin/env python3
"""classify_bricksmaven.py — extract EVERY structural fact from a
harvested ACSS-JSON payload into a .topo sidecar + enriched index.

For each bricksmaven/<cat>/<item>.json:
  content[]  → element tree (names, tags, children, hasLoop, labels)
  per-class  → every style prop classified:
    spacing   padding/margin rungs (var(--space-*) / calc() / raw)
    gaps      row/column/container/grid/content gaps
    layout    display, direction, grid template, position, order
    sizing    width/height/aspect/max-w
    typo      font-size/weight/rungs (var(--h*)/var(--text-*))
    colour    bg/border/color raw tokens
    radius    per-corner
    behavior  _cssCustom (hover, sticky side-effects, transitions)
  whole      → topology_id guess (dominant grid/split/loop shape),
               element_sig (h/p/img/cta/list/form/icon counts)

Usage: classify_bricksmaven.py [<cat>...]   (default: all dirs)
"""
import json
import os
import re
import sys
from collections import Counter

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(HERE))
ROOT = os.path.join(REPO, 'templates', 'skeletons', 'bricksmaven')

SPACE_RX = re.compile(r'var\(--(space|grid-gap|content-gap|container-'
                      r'gap|gutter|row-gap|column-gap)[a-z0-9-]*\)')
TYPO_RX = re.compile(r'var\(--(h[1-6]|text-[a-z]+)\)')
CALC_RX = re.compile(r'calc\(([^)]*)\)')
TOKEN_RX = re.compile(r'var\(--([a-z0-9-]+)\)')

SPACING_KEYS = ('_padding', '_margin', '_rowGap', '_columnGap',
                '_gridGap', '_gap', '_top', '_bottom', '_left',
                '_right', '_inset')
LAYOUT_KEYS = ('_display', '_direction', '_gridTemplateColumns',
               '_gridTemplateRows', '_justifyContent', '_alignItems',
               '_flexWrap', '_position', '_order', '_gridColumn',
               '_gridRow', '_gridAutoFlow', '_zIndex')
SIZING_KEYS = ('_width', '_height', '_minHeight', '_maxWidth',
               '_aspectRatio', '_objectFit', '_overflow')
TYPO_KEYS = ('_typography',)
COLOUR_KEYS = ('_background', '_color', '_fill')
BORDER_KEYS = ('_border', '_boxShadow', '_textShadow')
SKIP_PROPS = ('_cssGlobalClasses', '_attributes', 'tag', 'customTag',
              'text', 'link', 'image', 'icon', 'hasLoop', 'query',
              'iconSize', 'useDynamicData')


def _tokens(v):
    """Every var(--*) in a setting value."""
    return TOKEN_RX.findall(v if isinstance(v, str)
                            else json.dumps(v))


def _classify_settings(settings):
    out = {'spacing': {}, 'layout': {}, 'sizing': {},
           'typography': {}, 'colour': {}, 'radius': {},
           'custom_css': None, 'tokens': set()}
    for k, v in (settings or {}).items():
        if k in SKIP_PROPS:
            continue
        toks = _tokens(v)
        out['tokens'].update(toks)
        if k in SPACING_KEYS:
            out['spacing'][k] = v
        elif k in LAYOUT_KEYS or k.startswith('_gridTemplate'):
            out['layout'][k] = v
        elif k in SIZING_KEYS:
            out['sizing'][k] = v
        elif k == '_typography':
            out['typography'] = v
        elif k in COLOUR_KEYS:
            out['colour'][k] = v
        elif k in BORDER_KEYS:
            if isinstance(v, dict) and 'radius' in v:
                out['radius'] = v['radius']
            else:
                out['layout'][k] = v
        elif k == '_cssCustom':
            out['custom_css'] = v
            out['tokens'].update(TOKEN_RX.findall(v or ''))
        else:
            out['layout'][k] = v
    out['tokens'] = sorted(out['tokens'])
    return out


def _tree(nodes, by_id, depth=0):
    el = by_id.get(nodes)
    if el is None:
        return []
    return [{'name': el.get('name'), 'tag': (el.get('settings') or {})
             .get('tag') or (el.get('settings') or {})
             .get('customTag') or el.get('name'),
             'label': el.get('label'),
             'loop': bool((el.get('settings') or {}).get('hasLoop')),
             'classes': [c for c in (el.get('settings') or {})
                         .get('_cssGlobalClasses', [])],
             'depth': depth}] \
        + [x for c in (el.get('children') or [])
           for x in _tree(c, by_id, depth + 1)]


def _element_sig(tree):
    sig = Counter()
    for t in tree:
        n = t['name']
        key = {'heading': 'h', 'text-basic': 'p', 'text-link': 'a',
               'image': 'img', 'icon': 'icn', 'form': 'form',
               'button': 'btn', 'video': 'vid', 'list': 'ul'}.get(n)
        if key is None and t['tag'] in ('ul', 'ol', 'li', 'form',
                                        'aside', 'figure', 'nav',
                                        'h1', 'h2', 'h3'):
            key = t['tag']
        if key:
            sig[key] += 1
    return dict(sig)


def _topology(tree, classes):
    """Guess the bank topology vocab from structure — scan ALL grid
    templates (a section can nest several), then fall through by the
    dominant composition shape."""
    names = {t['name'] for t in tree}
    tpls = ' '.join(str(c['layout'].get('_gridTemplateColumns'))
                    for c in classes.values()
                    if c['layout'].get('_display') == 'grid')
    has_aside = any(t['tag'] == 'aside' for t in tree)
    has_nav = 'nav' in names or any(t['tag'] == 'nav' for t in tree)
    has_form = 'form' in names
    has_fig = 'image' in names or any(t['tag'] == 'figure'
                                      for t in tree)
    sticky = any('sticky' in str(c['layout'].get('_position'))
                 for c in classes.values())
    loops = sum(1 for t in tree if t['loop'])
    has_h1 = any(t['tag'] == 'h1' for t in tree)
    has_h2 = any(t['tag'] in ('h2', 'h3') for t in tree)
    if has_nav:
        return 'nav-top-bar'
    if has_form and has_fig:
        return 'form-split'
    if has_form:
        return 'form-centered'
    # unequal 2-col or a sticky sidebar → a split layout
    if re.search(r'(\d+)-(\d+)', tpls):
        a, b = re.search(r'(\d+)-(\d+)', tpls).groups()
        return 'split-50-50' if (a == b or has_aside or sticky) \
            else 'split-50-50'
    m = re.search(r'auto-(\d+)', tpls) or \
        re.search(r'grid-(\d)', tpls)
    if m and loops:
        return f'grid-{m.group(1)}col-uniform'
    if m:
        return f'grid-{m.group(1)}col-uniform'
    if loops:
        return 'list-vertical-rows'
    if has_fig and has_h1:
        return 'hero-media-right'
    if has_fig:
        return 'band-media'
    if has_h1:
        return 'hero-no-media'
    if has_h2:
        return 'list-vertical-rows'
    return 'band-strip'


def classify(path):
    d = json.load(open(path))
    content = d.get('content') or []
    gcls = d.get('globalClasses') or []
    by_id = {e['id']: e for e in content}
    root = content[0] if content else {}
    tree = _tree(root['id'], by_id)
    cls_map = {g['id']: _classify_settings(g.get('settings'))
               for g in gcls}
    cls_named = {(g['id'], g.get('name')): cls_map[g['id']]
                 for g in gcls}
    return {
        'label': root.get('label'),
        'source': d.get('source'), 'sourceUrl': d.get('sourceUrl'),
        'version': d.get('version'),
        'topology_id': _topology(tree, cls_map),
        'element_sig': _element_sig(tree),
        'tree': tree,
        'classes': {name: s for (_id, name), s in cls_named.items()},
        'tokens_all': sorted({t for s in cls_map.values()
                              for t in s['tokens']}),
    }


def main():
    cats = [a for a in sys.argv[1:] if not a.startswith('-')] \
        or sorted(d for d in os.listdir(ROOT)
                  if os.path.isdir(os.path.join(ROOT, d)))
    all_rows = []
    for cat in cats:
        catdir = os.path.join(ROOT, cat)
        if not os.path.isdir(catdir):
            continue
        for fn in sorted(os.listdir(catdir)):
            if not fn.endswith('.json') or fn == 'index.json' \
                    or '.topo.' in fn or '.classify.' in fn:
                continue          # sidecars, not payloads
            # Bricks builder scaffolding stems are not sections
            if re.search(r'remove-this|take-out|remove-contents'
                         r'|delete-me', fn[:-5]):
                continue
            p = os.path.join(catdir, fn)
            topo = classify(p)
            tp = p[:-5] + '.topo.json'
            with open(tp, 'w') as fh:
                json.dump(topo, fh, indent=1)
            all_rows.append({'category': cat, 'file': fn,
                             'topo': topo['topology_id'],
                             'sig': topo['element_sig'],
                             'n_classes': len(topo['classes'])})
    with open(os.path.join(ROOT, 'topo-index.json'), 'w') as fh:
        json.dump({'schema': 'bm-topo-index@1', 'rows': all_rows},
                  fh, indent=1)
    sig = Counter(r['topo'] for r in all_rows)
    print(f'{len(all_rows)} classified → topo-index.json')
    for k, v in sig.most_common():
        print(f'  {k:24} {v}')


if __name__ == '__main__':
    main()
