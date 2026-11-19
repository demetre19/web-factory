#!/usr/bin/env python3
"""HTML skeleton -> topology vector (flowbite / preline / generic).

Sister to brixies_topo.py: where bricks JSON carries structure in its
element tree, HTML skeletons carry it in Tailwind classes. Measures
the same vector: topology_id, nesting_depth (DOM depth), direction
(flex/grid row-vs-col), column_schedule (grid-cols-* + md:/lg: prefix
variants — the RC.* collapse schedule verbatim), edge/seam hints,
gap/pad tokens, js_dependency.

  python3 html_topo.py <file.html> [...]
  python3 html_topo.py --dir <dir>   # -> <dir>/../topology-html-index.json
"""
import json
import os
import re
import sys
from collections import Counter

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from brixies_topo import NAME_MAP  # noqa: E402

# dir/slug -> topology recipe, same vocabulary
TYPE_MAP = dict(NAME_MAP)

CLS = re.compile(r'class="([^"]*)"')
TAG = re.compile(r'<([a-zA-Z][a-zA-Z0-9]*)')
GRID_COLS = re.compile(
    r'(?:^| )(?:(\w+):)?grid-cols-(\d+|none|subgrid)')
FLEX_DIR = re.compile(r'(?:^| )(?:(\w+):)?flex-(col|row|col-reverse|'
                      r'row-reverse)')
GAP = re.compile(r'(?:^| )(?:(\w+):)?gap-([\d.]+|px)')
PAD = re.compile(r'(?:^| )p([xytrbl]?)-(?:\[([^\]]+)\]|([\d.]+|px))')
BORDER = re.compile(r'(?:^| )border(-[trblxyse])?(?:-\[| -| |")')
RADIUS = re.compile(r'(?:^| )rounded(?:-(none|sm|md|lg|xl|2xl|3xl|'
                    r'full|\[[^\]]+\]))?')
HIDDEN_BP = re.compile(r'(?:^| )(\w+):hidden|(?:^| )hidden')
RESP = re.compile(r'(?:^| )(sm|md|lg|xl|2xl):')


def dom_depth(html):
    """max tag nesting depth (cheap parse — tags only)."""
    depth = mx = 0
    for m in TAG.finditer(html):
        tag = m.group(1).lower()
        ctx = html[max(0, m.start() - 2):m.start()]
        if tag in ('meta', 'link', 'br', 'hr', 'img', 'input', 'path',
                   'svg', 'circle', 'line', 'rect', 'use'):
            continue
        if ctx.endswith('</'):
            depth = max(0, depth - 1)
        elif not html[m.end() - 2:m.end()].endswith('/'):
            depth += 1
            mx = max(mx, depth)
        else:
            depth = max(0, depth - 1)
    return mx


def convert_html(path, kit=None):
    html = open(path, encoding='utf-8', errors='replace').read()
    rel = os.path.basename(path)
    kit = kit or ''
    slug = os.path.splitext(rel)[0]
    rid = 'content'
    parts = path.split(os.sep)
    # the kit category dir is the strongest signal; fall back to slug
    cat = parts[-2] if len(parts) >= 2 else slug
    for part in [cat] + list(reversed(parts[1:-2])) + [slug]:
        for pat, t in NAME_MAP:
            if re.search(pat, part):
                rid = t
                break
        if rid != 'content':
            break
    classes = ' '.join(CLS.findall(html))
    # direction: flex-col vs row majority
    dirs = Counter(m.group(2) for m in FLEX_DIR.finditer(classes))
    rows = dirs['row'] + dirs['row-reverse']
    cols_ = dirs['col'] + dirs['col-reverse']
    tot = rows + cols_
    # collapse schedule: breakpoint-prefixed grid-cols
    sched = {}
    for m in GRID_COLS.finditer(classes):
        bp = m.group(1) or 'base'
        sched[bp] = m.group(2)
    for m in FLEX_DIR.finditer(classes):
        if m.group(1):
            sched.setdefault(m.group(1), 'dir')
    # edges/seam
    seam = 'whitespace'
    if BORDER.search(classes):
        seam = 'hairline'
    elif 'shadow' in classes:
        seam = 'shadow'
    rad = set(m.group(1) for m in RADIUS.finditer(classes)
              if m.group(1))
    js_dep = 'flowbite.js' if 'data-accordion' in html or \
        'data-drawer' in html or 'data-modal' in html or \
        'data-carousel' in html or 'data-dropdown' in html else None
    return {
        'file': os.path.relpath(path),
        'kit': kit,
        'title': slug,
        'topology_id': rid,
        'nesting_depth': dom_depth(html),
        'direction_ratio': round(rows / tot, 2) if tot else 0.0,
        'column_schedule': sched,
        'seam_style': seam,
        'radius_hints': sorted(rad),
        'gap_tokens': sorted({m.group(2)
                              for m in GAP.finditer(classes)})[:10],
        'pad_tokens': sorted({(m.group(1) or '') + m.group(3)
                              for m in PAD.finditer(classes)
                              if m.group(3)})[:12],
        'js_dependency': js_dep,
        'responsive_variants': sorted({m.group(1)
                                       for m in RESP.finditer(classes)}),
        'on_baseline': True,  # class-derived = the baseline itself
    }


def main():
    args = sys.argv[1:]
    if '--dir' in args:
        d = args[args.index('--dir') + 1]
        out = []
        for root, _, files in os.walk(d):
            for fn in sorted(files):
                if fn.endswith(('.html', '.htm')) and not \
                        fn.startswith('_'):
                    try:
                        out.append(convert_html(
                            os.path.join(root, fn),
                            kit=os.path.basename(
                                os.path.normpath(d))))
                    except Exception as e:
                        print(f'{fn}: {e}', file=sys.stderr)
        idx = os.path.join(d, '..', 'topology-html-index.json')
        kit_name = os.path.basename(os.path.normpath(d))
        merged = []
        if os.path.exists(idx):
            try:
                merged = [r for r in json.load(open(idx))
                          if r.get('kit') != kit_name]
            except Exception:
                pass
        merged += out
        json.dump(merged, open(idx, 'w'), indent=1)
        print(f'{len(out)} files (+{len(merged)-len(out)} kept) -> {idx}')
        return
    for f in args:
        print(json.dumps(convert_html(f), indent=1))


if __name__ == '__main__':
    main()
