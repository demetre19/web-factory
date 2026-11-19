#!/usr/bin/env python3
"""bricksCopiedElements JSON -> topology vector.

Converts a Brixies REST payload
  {id,title,framework,type,block_name,json:{content[],globalClasses[]}}
into the topology record the skeleton library indexes on:

  {topology_id, nesting_depth, direction_ratio, seam_style,
   edge_hints, column_schedule, acss_tokens, acss_bends,
   semantic_labels, collapse_schedule}

ACSS global-class settings map straight onto deviation axes:
var(--brxw-*/var(--section-space-*) on a spacing field = on-baseline;
calc() or a literal px where a token is expected = a measured bend.
perPage/column settings per breakpoint = the RC.* collapse schedule,
verbatim.

  python3 brixies_topo.py <payload.json> [...]
  python3 brixies_topo.py --dir <dir>   # batch -> topology-sources-index.json
"""
import json
import os
import re
import sys
from collections import Counter

VAR_RE = re.compile(r'var\(--(brxw-[\w-]+|section-space-[\w-]+|'
                    r'content-[\w-]+|radius-[\w-]+|space-[\w-]+)\)')
CALC_RE = re.compile(r'calc\(')
PX_RE = re.compile(r'\d+(?:\.\d+)?px')

# element name/label -> topology recipe (same vocab as topology.py)
NAME_MAP = [
    (r'accordion|faq', 'list-vertical-rows'),
    (r'hero|banner', 'hero-media-bg'),
    (r'nav|header|menu', 'nav-top-bar'),
    (r'footer', 'footer-column'),
    (r'card|pricing|feature|grid|team', 'grid-3col-uniform'),
    (r'table', 'table-cell'),
    (r'testimonial|review|quote', 'list-cards'),
    (r'form|contact|newsletter|cta|signup|subscribe', 'form-centered'),
    (r'slider|carousel|marquee', 'band-strip'),
    (r'gallery|image|portfolio', 'grid-4col-uniform'),
    (r'steps|process|timeline', 'list-vertical-rows'),
    (r'logo', 'band-strip'),
    (r'split|promo|media-text', 'split-50-50'),
    (r'tab', 'tab'),
    (r'modal|popup|dialog', 'modal'),
    (r'toggle|switch', 'checkbox-radio-row'),
    (r'button', 'button-primary'),
    (r'input|field', 'input'),
    (r'stat|counter|number', 'band-strip'),
    (r'blog|post|article', 'grid-3col-uniform'),
]


def recipe_id(payload):
    text = ' '.join(str(payload.get(k) or '') for k in
                    ('title', 'block_name', 'type')).lower()
    for pat, rid in NAME_MAP:
        if re.search(pat, text):
            return rid
    return 'content'


def flatten(content):
    by_id = {}
    for el in content or []:
        by_id[el.get('id')] = el
    return by_id


def depth_of(by_id, el):
    d = 1
    pid = el.get('parent')
    while pid and pid in by_id:
        d += 1
        pid = by_id[pid].get('parent')
    return d


def tokens_in(obj, acc):
    """Every --brxw-*/ACSS var mentioned, plus calc()/px bends."""
    if isinstance(obj, str):
        for m in VAR_RE.finditer(obj):
            acc['tokens'].add(m.group(0))
        if CALC_RE.search(obj):
            acc['bends'].append(f'calc: {obj[:60]}')
        elif PX_RE.search(obj) and 'var(' not in obj:
            acc['bends'].append(f'literal-px: {obj[:60]}')
    elif isinstance(obj, dict):
        for v in obj.values():
            tokens_in(v, acc)
    elif isinstance(obj, list):
        for v in obj:
            tokens_in(v, acc)


def axis_hints(settings):
    """flex/grid/border/gap settings -> direction, seam, edge."""
    out = {}
    s = json.dumps(settings or {})
    def g(k):
        v = settings.get(k)
        if isinstance(v, dict):
            return json.dumps(v)
        return str(v) if v is not None else ''
    fd = g('_flexDirection') or g('_direction')
    if fd:
        out['direction'] = 'column' if 'column' in fd else 'row'
    disp = g('_display')
    if disp:
        out['display'] = disp.strip('"')
    gap = g('_gap') or g('_columnGap') or g('_rowGap')
    if gap:
        out['gap'] = 'token' if 'var(' in gap else \
            'calc' if 'calc(' in gap else 'literal'
    border = settings.get('_border')
    if isinstance(border, dict):
        w = border.get('width') or {}
        if any(str(v) not in ('0', '0px', '') for v in w.values()):
            out['edge'] = 'hairline'
    if '_boxShadow' in settings:
        out['edge'] = 'shadow'
    bg = settings.get('_background')
    if bg:
        out['seam'] = 'tonal'
    # collapse schedule: any perPage/columns keys
    for k, v in (settings or {}).items():
        kl = k.lower()
        if ('perpage' in kl or 'columns' in kl or
                'per_page' in kl) and v:
            out.setdefault('column_schedule', {})[
                k.lstrip('_')] = v
    return out


def convert(payload):
    j = payload.get('json') or payload
    content = j.get('content') or []
    gclasses = {c.get('id'): c for c in j.get('globalClasses') or []}
    by_id = flatten(content)
    acc = {'tokens': set(), 'bends': []}
    tokens_in(j, acc)
    depths = [depth_of(by_id, e) for e in content if e.get('id')]
    rows = cols = 0
    edges = Counter()
    schedules = {}
    labels = [payload.get('title'), payload.get('block_name')]
    for e in content:
        labels.append(e.get('label'))
        st = e.get('settings') or {}
        # merge global-class settings the element references
        for gid in st.get('_cssGlobalClasses') or []:
            gc = gclasses.get(gid)
            if gc:
                hints = axis_hints(gc.get('settings') or {})
                if hints.get('direction') == 'row':
                    rows += 1
                elif hints.get('direction') == 'column':
                    cols += 1
                if hints.get('edge'):
                    edges[hints['edge']] += 1
                if hints.get('seam'):
                    edges[hints['seam']] += 1
                if hints.get('column_schedule'):
                    schedules.update(hints['column_schedule'])
        hints = axis_hints(st)
        if hints.get('direction') == 'row':
            rows += 1
        elif hints.get('direction') == 'column':
            cols += 1
        if hints.get('column_schedule'):
            schedules.update(hints['column_schedule'])
    tot = rows + cols
    vec = {
        'source_id': payload.get('id'),
        'title': payload.get('title'),
        'framework': payload.get('framework'),
        'type': payload.get('type'),
        'topology_id': recipe_id(payload),
        'nesting_depth': max(depths) if depths else 1,
        'direction_ratio': round(rows / tot, 2) if tot else 0.0,
        'edge_hints': dict(edges),
        'seam_style': ('hairline' if edges.get('hairline') else
                       'tonal' if edges.get('tonal') else
                       'whitespace'),
        'column_schedule': schedules,
        'acss_tokens': sorted(acc['tokens']),
        'acss_bends': acc['bends'][:20],
        'on_baseline': not acc['bends'],
        'semantic_labels': sorted({l for l in labels if l}),
    }
    return vec


def spec_card(payload, vec):
    """<name>.spec.json companion: the browsable card next to the
    topology vector."""
    j = payload.get('json') or payload
    content = j.get('content') or []
    els = sorted({e.get('label') for e in content
                  if e.get('label')})
    return {
        'id': payload.get('id'),
        'title': payload.get('title'),
        'type': payload.get('type'),
        'framework': payload.get('framework'),
        'category': payload.get('category'),
        'topology': {
            'topology_id': vec['topology_id'],
            'nesting_depth': vec['nesting_depth'],
            'direction_ratio': vec['direction_ratio'],
            'seam_style': vec['seam_style'],
            'column_schedule': vec['column_schedule'],
        },
        'elements': els,
        'acss': {'tokens': vec['acss_tokens'],
                 'bends': vec['acss_bends'],
                 'on_baseline': vec['on_baseline']},
        'labels': vec['semantic_labels'],
    }


def main():
    args = sys.argv[1:]
    if '--dir' in args:
        d = args[args.index('--dir') + 1]
        out = []
        for root, _, files in os.walk(d):
            for fn in sorted(files):
                if not fn.endswith('.json') or \
                        fn.endswith('.spec.json'):
                    continue
                try:
                    pl = json.load(open(os.path.join(root, fn)))
                    v = convert(pl)
                    v['file'] = os.path.relpath(
                        os.path.join(root, fn), d)
                    out.append(v)
                    # refresh the spec card alongside the payload
                    card = spec_card(pl, v)
                    sp = os.path.join(root, fn.replace(
                        '.json', '.topo.json'))
                    json.dump(card, open(sp, 'w'), indent=1)
                except Exception as e:
                    print(f'{fn}: {e}', file=sys.stderr)
        idx = os.path.join(d, '..', 'topology-sources-index.json')
        json.dump(out, open(idx, 'w'), indent=1)
        print(f'{len(out)} payloads -> {idx}')
        return
    for f in args:
        print(json.dumps(convert(json.load(open(f))), indent=1))


if __name__ == '__main__':
    main()
