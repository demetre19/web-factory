#!/usr/bin/env python3
"""vectorise_html.py — deterministic spec->topo translation for
html-carrying bank exemplars that never got a .topo.json
(flowbite / preline / reui / shadcn / hyperui / vidstack families).

For each <kit>/<family>/<name>.html that has no sibling .topo.json:
  parse the DOM (stdlib html.parser — template braces tolerated)
    → flat node list {tag, classes, depth}
    → element_sig (bank vocab: h/p/a/img/icn/btn/form/ul/nav/
      aside/table/figure)
    → topology guess from structural features (nav, form, grid-cols-N
      tailwind classes, tables, repeated cards)
    → matched_topo = the guess + confidence (high: unambiguous
      signature element — nav/form/table; medium: layout classes;
      low: fallback)
    → write <name>.topo.json, add a row to
      topology-sources-index.json and tags.json.

Usage:
  vectorise_html.py --census            # thin-family report only
  vectorise_html.py [--family f ...]    # vectorise named families
  vectorise_html.py --all               # every missing family,
                                        # thinnest topo-count first
  vectorise_html.py --dry-run           # what WOULD be emitted
"""
import json
import os
import re
import sys
from collections import Counter
from html.parser import HTMLParser

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(HERE))
SKEL = os.path.join(REPO, 'templates', 'skeletons')
SOURCES_INDEX = os.path.join(SKEL, 'topology-sources-index.json')
MOBBIN_TAGS = os.path.join(SKEL, 'mobbin', 'tags.json')
KITS = ('flowbite', 'hyperui', 'preline', 'reui', 'shadcn', 'vidstack')

SKIP_TAGS = {'script', 'style', 'title', 'meta', 'link', 'head',
             'template', 'path', 'defs', 'g', 'rect', 'circle',
             'ellipse', 'line', 'polyline', 'polygon', 'use'}
SIG_MAP = {'h1': 'h', 'h2': 'h', 'h3': 'h', 'h4': 'h', 'h5': 'h',
           'h6': 'h', 'p': 'p', 'a': 'a', 'img': 'img', 'svg': 'icn',
           'button': 'btn', 'form': 'form', 'input': 'form',
           'select': 'form', 'textarea': 'form', 'ul': 'ul',
           'ol': 'ul', 'nav': 'nav', 'aside': 'aside',
           'table': 'table', 'figure': 'figure', 'dialog': 'dialog',
           'video': 'vid', 'iframe': 'vid'}

GRID_RX = re.compile(r'grid-cols-(\d+)')


class _DOM(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.nodes = []
        self._depth = -1

    def handle_starttag(self, tag, attrs):
        if tag in SKIP_TAGS:
            return
        self._depth += 1
        classes = [v for k, v in attrs if k == 'class']
        self.nodes.append({'tag': tag,
                           'classes': (classes[0].split()
                                       if classes else []),
                           'depth': self._depth,
                           'attrs': {k: v for k, v in attrs
                                     if k in ('href', 'type',
                                              'role', 'aria-label',
                                              'data-dropdown-toggle',
                                              'data-collapse-toggle')}})

    def handle_endtag(self, tag):
        if tag in SKIP_TAGS:
            return
        self._depth = max(-1, self._depth - 1)


def _element_sig(nodes):
    sig = Counter()
    for n in nodes:
        k = SIG_MAP.get(n['tag'])
        if k:
            sig[k] += 1
        elif n['tag'] == 'li':
            sig['li'] += 1
    return dict(sig)


def _grid_cols(nodes):
    best = 0
    for n in nodes:
        for c in n['classes']:
            m = GRID_RX.match(c)
            if m and int(m.group(1)) > best:
                best = int(m.group(1))
    return best


def _topology(nodes, sig):
    tags = {n['tag'] for n in nodes}
    all_cls = ' '.join(c for n in nodes for c in n['classes'])
    cols = _grid_cols(nodes)
    cards = sum(1 for n in nodes if n['tag'] == 'li')
    if 'nav' in tags:
        return 'nav-top-bar', 'high'
    if 'dialog' in tags or 'modal' in all_cls:
        return 'modal', 'high'
    if 'table' in tags:
        return 'table-cell', 'high'
    if 'form' in tags:
        return ('form-split' if 'img' in sig else 'form-centered',
                'high')
    if 'aside' in tags:
        return 'list-vertical-rows', 'medium'
    if cols >= 4:
        return 'grid-4col-uniform', 'medium'
    if cols == 3:
        return 'grid-3col-uniform', 'medium'
    if cols == 2:
        return 'split-50-50', 'medium'
    if 'footer' in tags:
        return 'footer-column', 'medium'
    if cards >= 3:
        return 'list-cards', 'low'
    if sig.get('h') and 'img' in sig:
        return 'hero-media-bg', 'low'
    if sig.get('h'):
        return 'content', 'low'
    return 'band-strip', 'low'


def _all_classes(nodes):
    out = set()
    for n in nodes:
        out.update(n['classes'])
    return sorted(out)


def vectorise_file(path, kit, family):
    src = open(path, errors='replace').read()
    dom = _DOM()
    try:
        dom.feed(src)
    except Exception:
        pass
    nodes = dom.nodes
    sig = _element_sig(nodes)
    topo, conf = _topology(nodes, sig)
    name = os.path.basename(path)[:-len('.html')]
    tree = [{'name': n['tag'], 'tag': n['tag'],
             'label': None, 'loop': False,
             'classes': n['classes'][:8], 'depth': n['depth']}
            for n in nodes[:120]]
    return {'label': f'{kit}/{family}/{name}',
            'source': kit,
            'sourceUrl': '',
            'version': '1',
            'topology_id': topo,
            'element_sig': sig,
            'tree': tree,
            'classes': _all_classes(nodes)[:60]}, topo, conf


def census():
    rows = json.load(open(
        os.path.join(SKEL, 'topology-html-index.json')))
    missing = Counter()
    for e in rows:
        f = str(e.get('file', ''))
        if not f.endswith('.html'):
            continue
        tp = f[:-len('.html')] + '.topo.json'
        if not os.path.exists(os.path.join(REPO, tp)):
            fam = f.split('/')[3] if f.count('/') >= 4 else '?'
            missing[fam] += 1
    return missing


def run(families, dry):
    index = json.load(open(SOURCES_INDEX))
    have = {str(e.get('file')) for e in index}
    tags = json.load(open(MOBBIN_TAGS)) \
        if os.path.exists(MOBBIN_TAGS) else {}
    done = skipped = 0
    for kit in KITS:
        kitdir = os.path.join(SKEL, kit)
        if not os.path.isdir(kitdir):
            continue
        for family in sorted(os.listdir(kitdir)):
            famdir = os.path.join(kitdir, family)
            if not os.path.isdir(famdir):
                continue
            if families and family not in families:
                continue
            for fn in sorted(os.listdir(famdir)):
                if not fn.endswith('.html'):
                    continue
                rel = f'{kit}/{family}/{fn}'
                tp_rel = rel[:-len('.html')] + '.topo.json'
                tp_abs = os.path.join(SKEL, tp_rel)
                if tp_rel in have or os.path.exists(tp_abs):
                    skipped += 1
                    continue
                topo, conf = vectorise_file(
                    os.path.join(famdir, fn), kit, family)[1:]
                if dry:
                    done += 1
                    continue
                out = vectorise_file(
                    os.path.join(famdir, fn), kit, family)[0]
                with open(tp_abs, 'w') as f:
                    json.dump(out, f, indent=1)
                index.append({
                    'source_id': f'{kit}-{fn[:-5]}',
                    'title': fn[:-5], 'framework': 'tailwind',
                    'type': 'component',
                    'topology_id': topo, 'nesting_depth': 4,
                    'direction_ratio': 0.0, 'edge_hints': {},
                    'seam_style': 'hairline', 'column_schedule': {},
                    'acss_tokens': [], 'acss_bends': [],
                    'on_baseline': True,
                    'semantic_labels': [kit, family, fn[:-5]],
                    'file': tp_rel})
                spec_p = os.path.join(
                    famdir, fn[:-5] + '.spec.json')
                spec = json.load(open(spec_p)) \
                    if os.path.exists(spec_p) else {}
                tags[f'{kit}-{fn[:-5]}'] = {
                    'file': rel[:-len('.html')],
                    'family': f'{kit}/{family}',
                    'site_name': spec.get('name', fn[:-5]),
                    'mobbin_url': spec.get('source_url', ''),
                    'section_class': family,
                    'topology_class': topo,
                    'topology_id': topo,
                    'style': [], 'category': [],
                    'mode': 'light', 'platform': 'web',
                    'matched_topo': {'topology_id': topo,
                                     'confidence': conf},
                    'is_new_topology': conf == 'low'}
                done += 1
    if not dry:
        json.dump(index, open(SOURCES_INDEX, 'w'), indent=1)
        json.dump(tags, open(MOBBIN_TAGS, 'w'), indent=1)
    print(f'{"would vectorise" if dry else "vectorised"} {done},'
          f' already done {skipped}')


def main():
    args = sys.argv[1:]
    if '--census' in args:
        for fam, n in census().most_common():
            print(f'{n:5d}  {fam}')
        return
    families = set()
    if '--family' in args:
        i = args.index('--family') + 1
        while i < len(args) and not args[i].startswith('--'):
            families.add(args[i]); i += 1
    run(families or None, '--dry-run' in args)


if __name__ == '__main__':
    main()
