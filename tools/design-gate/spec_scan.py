#!/usr/bin/env python3.12
"""spec_scan.py — forensic spec for banked genmenu exemplars.

For each `<slug>.html` fragment under templates/skeletons/genmenu/ this
writes `<slug>.forensic.json` — a deterministic, words-alone-rebuildable
description of the fragment's structure. No paid calls, no LLM.

forensic.json schema:

  slug          exemplar id (<dir>-<file>)
  topology_id   from the sibling .topo.json when present
  wrapper       {tag, classes} of the single root element (null when the
                fragment has several roots)
  regions[]     ordered top-level layout regions — the root element's
                element children (or the roots themselves when there is
                no single wrapper):
      tag          element tag
      role         'header'|'nav'|'hero'|'form'|'grid'|'media'|'list'|
                   'proof'|'footer'|'sidebar'|'content' — aria-label wins,
                   else inferred from tag + dominant content
      aria         aria-label / role attr when present
      cols         column count of the region's own layout (grid-cols-N,
                   number of flex children), 1 when stacked
      span_map     [{child_index, tag, span}] — col-span-N/row-span-N and
                   width fractions (w-1/2, lg:w-1/3 → 0.5/0.33)
      gap          'gap-N'|'space-x-N'|'space-y-N' estimate string
      align        items-*/justify-*/text-{left,center,right} hints
      tone         {bg, text} first bg-*/text-* colour token found
      slots[]      ordered semantic slots:
          {kind, tag, text}  kind: headline|subhead|cta|media|list|
              form|field|footnote|nav-links|disclosure|link|icon
          text truncated to 80 chars; lists carry 'items' count,
          forms 'fields' count, nav-links 'links' count
      elements     descendant element count (visual weight numerator)
      text_len     subtree text length
      has_media    img/svg (non-icon-size) present
  grid_anatomy  {grids: [{cols, rows, spans[]}], flex_wraps: n}
                every grid-cols-N / grid-rows-N / col|row-span-N in the
                fragment
  visual_weight [{region_index, role, element_share, text_share}]
                element_share/text_share are fractions of the fragment
  states        {aria: [...], data: [...], pseudo_classes: {hover n,
                focus n, ...}, details_summary: bool}
  decoration_hooks  deduped fx-*/animate-*/transition-*/duration-*/
                ease-*/shadow-*/rounded-*/blur|backdrop-*/transform
                classes present
  copy_slots    [{kind, tag, text}] — every headline/button/link/label
                text in document order (headline|cta|link|label)

Usage:
  spec_scan.py <dir|file.html> ...   scan specific exemplars
  spec_scan.py --all                 scan the whole genmenu tree
  spec_scan.py --in-memory           internal: scan() API for spec_diff
"""
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(HERE))
GENMENU = os.path.join(REPO, 'templates', 'skeletons', 'genmenu')
sys.path.insert(0, HERE)
from genmenu_bank import Tree  # noqa: E402

CONTAINERS = {'div', 'section', 'main', 'article', 'header', 'footer',
              'aside', 'nav', 'form', 'ul', 'ol', 'li', 'figure',
              'dialog', 'fieldset', 'table', 'tbody', 'thead', 'tr'}
SKIP_TEXT = {'script', 'style', 'defs', 'pattern', 'symbol'}
GRID_RX = re.compile(r'(?:^|:)(grid-cols|grid-rows)-(\d+)$')
SPAN_RX = re.compile(r'(?:^|:)(col|row)-span-(\d+)$')
WIDTH_RX = re.compile(r'(?:^|:)w-(\d)/(\d)$')
GAP_RX = re.compile(r'(?:^|:)(gap-[xy]?-\[?[^\s\]]+\]?|'
                    r'space-[xy]-\[?[^\s\]]+\]?)$')
ALIGN_RX = re.compile(
    r'(?:^|:)(items-\S+|justify-\S+|content-\S+|self-\S+|'
    r'text-(?:left|center|right|end|start))$')
DECO_RX = re.compile(
    r'^(?:fx-|animate-|transition|duration-|ease-|delay-|transform|'
    r'scale-|rotate-|translate-|opacity-|shadow-|rounded-|blur\b|'
    r'backdrop-|ring-|border-[trblxy]?-\d|outline-)')
STATE_PSEUDO = ('hover:', 'focus:', 'focus-visible:', 'focus-within:',
                'active:', 'disabled:', 'group-hover:', 'peer-checked:',
                'data-[', 'aria-[')


class ScanTree(Tree):
    """genmenu Tree, but keeps full attrs/classes + direct text."""

    def handle_starttag(self, tag, attrs):
        parent = self.stack[-1] if self.stack else None
        super().handle_starttag(tag, attrs)
        if self.stack and self.stack[-1] is not parent:
            new = self.stack[-1]          # non-void: pushed
        elif parent is not None:
            new = parent['children'][-1]  # void: appended to parent
        else:
            new = self.roots[-1]          # void root
        a = dict(attrs)
        new['attrs'] = a
        new['classes'] = a.get('class', '').split()
        new['text'] = ''
        new['states'] = {k: v for k, v in a.items()
                         if k.startswith(('aria-', 'data-'))}

    def handle_data(self, data):
        super().handle_data(data)
        if self.stack:
            self.stack[-1]['text'] = (
                self.stack[-1].get('text', '') + ' ' + data.strip())


def _cls(node):
    return node.get('classes') or node.get('attrs', {}).get(
        'class', '').split()


def _sub_text(node):
    out = []
    stack = [node]
    while stack:
        n = stack.pop()
        if n['tag'] in SKIP_TEXT:
            continue
        if n.get('text'):
            out.append(n['text'])
        stack.extend(reversed(n['children']))
    return ' '.join(out).strip()


def _walk(node):
    yield node
    for ch in node['children']:
        yield from _walk(ch)


def _count_el(node):
    return sum(1 for _ in _walk(node))


def _slot_kind(node, sub):
    tag, cls = node['tag'], ' '.join(_cls(node))
    if tag in ('h1', 'h2'):
        return 'headline'
    if tag in ('h3', 'h4'):
        return 'subhead' if 'text-sm' in cls or 'text-xs' in cls \
            else 'headline'
    if tag == 'button':
        return 'cta'
    if tag == 'a':
        return 'cta' if re.search(
            r'(bg-(?!transparent)\w|rounded.*(px|py)|btn)', cls) \
            else 'link'
    if tag == 'img':
        return 'media'
    if tag == 'svg':
        w = re.sub(r'[^0-9.]', '',
                   node.get('attrs', {}).get('width', '') or '')
        return 'icon' if w and float(w) <= 48 \
            else 'media' if not w or float(w) > 96 else 'icon'
    if tag in ('ul', 'ol'):
        return 'list'
    if tag == 'form':
        return 'form'
    if tag == 'input':
        return 'field'
    if tag in ('footer', 'small'):
        return 'footnote'
    if tag in ('details', 'summary'):
        return 'disclosure'
    if tag == 'nav':
        return 'nav-links'
    if tag == 'blockquote':
        return 'proof'
    if tag == 'p':
        return 'subhead'
    if tag == 'label':
        return 'label'
    return None


def _slots(region):
    """Ordered semantic slots inside a region (first meaningful level)."""
    out = []
    seen_depth = {}

    def rec(n, depth):
        tag = n['tag']
        kind = _slot_kind(n, '')
        if kind and kind != 'icon':
            ent = {'kind': kind, 'tag': tag,
                   'text': _sub_text(n)[:80]}
            if kind == 'list':
                ent['items'] = sum(
                    1 for c in n['children'] if c['tag'] == 'li')
            elif kind == 'form':
                ent['fields'] = sum(
                    1 for c in _walk(n)
                    if c['tag'] in ('input', 'select', 'textarea'))
            elif kind == 'nav-links':
                ent['links'] = sum(
                    1 for c in _walk(n) if c['tag'] == 'a')
            out.append(ent)
            return  # don't descend into a named slot
        for ch in n['children']:
            if ch['tag'] not in SKIP_TEXT:
                rec(ch, depth + 1)

    for ch in region['children']:
        rec(ch, 0)
    return out


def _region_role(node, slots, sub):
    a = node.get('attrs', {})
    label = (a.get('aria-label') or '').lower()
    tag = node['tag']
    kinds = {s['kind'] for s in slots}
    if tag == 'header' or 'header' in label:
        return 'header'
    if tag == 'nav' or 'nav' in label or 'nav-links' in kinds:
        return 'nav'
    if tag == 'footer' or 'footer' in label:
        return 'footer'
    if tag == 'aside' or 'sidebar' in label:
        return 'sidebar'
    if tag == 'form' or 'form' in kinds or 'field' in kinds:
        return 'form'
    if 'proof' in kinds or 'testimonial' in label:
        return 'proof'
    if 'list' in kinds and 'media' in kinds:
        return 'grid'
    if 'media' in kinds and 'headline' not in kinds:
        return 'media'
    if 'headline' in kinds and ('cta' in kinds or 'media' in kinds):
        return 'hero'
    if 'list' in kinds:
        return 'list'
    return 'content'


def _tone(node):
    for c in _cls(node):
        m = re.match(r'^(?:[a-z-]+:)?(bg|text)-([\w\[\]#./-]+)$', c)
        if m and not m.group(2).startswith((
                'xs', 'sm', 'base', 'lg', 'xl', '2x', '3x', '4x',
                'left', 'center', 'right')):
            yield m.group(1), m.group(2)


def _region(n, total_el, total_txt):
    sub = _sub_text(n)
    slots = _slots(n)
    role = _region_role(n, slots, sub)
    kids = [c for c in n['children']]
    cls = _cls(n)
    cols = 1
    for c in cls:
        m = GRID_RX.search(c)
        if m and m.group(1) == 'grid-cols':
            cols = int(m.group(2))
            break
    if cols == 1 and any('flex' == c or c.endswith(':flex')
                         for c in cls):
        cols = len([k for k in kids if k['tag'] not in SKIP_TEXT])
    spans = []
    for i, k in enumerate(kids):
        s = {}
        for c in _cls(k):
            m = SPAN_RX.search(c)
            if m:
                s[m.group(1) + '_span'] = int(m.group(2))
            m = WIDTH_RX.search(c)
            if m:
                s['width'] = round(int(m.group(1)) / int(m.group(2)), 3)
        if s:
            s.update({'child_index': i, 'tag': k['tag']})
            spans.append(s)
    gaps = [c for c in cls if GAP_RX.search(c)]
    aligns = [ALIGN_RX.search(c).group(1) for c in cls
              if ALIGN_RX.search(c)]
    tone = {}
    for t in _tone(n):
        tone.setdefault(t[0], t[1])
    media = any(k['tag'] == 'img' or
                (k['tag'] == 'svg' and _slot_kind(k, '') == 'media')
                for k in _walk(n))
    els = _count_el(n)
    return {
        'tag': tag if (tag := n['tag']) else '',
        'role': role,
        'aria': n.get('attrs', {}).get('aria-label', '') or
                n.get('attrs', {}).get('role', ''),
        'cols': cols, 'span_map': spans,
        'gap': ' '.join(gaps[:2]), 'align': ' '.join(aligns[:3]),
        'tone': tone, 'slots': slots,
        'elements': els, 'text_len': len(sub), 'has_media': media,
    }


def _grid_anatomy(all_nodes):
    grids, spans, wraps = [], [], 0
    for n in all_nodes:
        cls = _cls(n)
        g = {}
        for c in cls:
            m = GRID_RX.search(c)
            if m:
                g[m.group(1)[5:]] = int(m.group(2))
            m = SPAN_RX.search(c)
            if m:
                spans.append({'tag': n['tag'], 'axis': m.group(1),
                              'span': int(m.group(2))})
            if c == 'flex-wrap':
                wraps += 1
        if g:
            grids.append(g)
    return {'grids': grids, 'spans': spans, 'flex_wraps': wraps}


def _states(all_nodes):
    aria, data, pseudo = set(), set(), {}
    details = False
    for n in all_nodes:
        for k in n.get('states', {}):
            (aria if k.startswith('aria-') else data).add(
                k + '=' + str(n['states'][k])[:40])
        for c in _cls(n):
            for p in STATE_PSEUDO:
                if p in c:
                    pseudo[p.rstrip(':[')] = \
                        pseudo.get(p.rstrip(':['), 0) + 1
        for k in n.get('attrs', {}):
            if k in ('disabled', 'checked', 'selected', 'open'):
                aria.add(k)
        if n['tag'] in ('details', 'summary'):
            details = True
    return {'aria': sorted(aria), 'data': sorted(data),
            'pseudo_classes': pseudo, 'details_summary': details}


def _copy_slots(all_nodes):
    out = []
    for n in all_nodes:
        tag = n['tag']
        if tag in ('h1', 'h2', 'h3', 'h4'):
            kind = 'headline'
        elif tag == 'button':
            kind = 'cta'
        elif tag == 'a':
            kind = 'link'
        elif tag == 'label':
            kind = 'label'
        elif tag == 'legend':
            kind = 'headline'
        else:
            continue
        t = _sub_text(n)[:80]
        if t:
            out.append({'kind': kind, 'tag': tag, 'text': t})
    return out


def scan(html_text, slug='', topology_id=''):
    t = ScanTree()
    t.feed(html_text)
    roots = [r for r in t.roots if r['tag'] not in SKIP_TEXT]
    wrapper = None
    if len(roots) == 1:
        wrapper = {'tag': roots[0]['tag'],
                   'classes': _cls(roots[0])}
        region_nodes = [c for c in roots[0]['children']
                        if c['tag'] not in SKIP_TEXT] or roots
    else:
        region_nodes = roots
    all_nodes = [n for r in roots for n in _walk(r)]
    total_el = len(all_nodes) or 1
    total_txt = sum(len(_sub_text(r)) for r in region_nodes) or 1
    regions = [_region(n, total_el, total_txt) for n in region_nodes]
    deco = sorted({c for n in all_nodes for c in _cls(n)
                   if DECO_RX.match(c)})
    return {
        'slug': slug, 'topology_id': topology_id,
        'wrapper': wrapper,
        'regions': regions,
        'grid_anatomy': _grid_anatomy(all_nodes),
        'visual_weight': [{
            'region_index': i, 'role': r['role'],
            'element_share': round(r['elements'] / total_el, 3),
            'text_share': round(r['text_len'] / total_txt, 3),
        } for i, r in enumerate(regions)],
        'states': _states(all_nodes),
        'decoration_hooks': deco,
        'copy_slots': _copy_slots(all_nodes),
    }


def scan_file(html_path):
    slug = os.path.basename(html_path)[:-5]
    tp = html_path[:-5] + '.topo.json'
    topo = json.load(open(tp)) if os.path.exists(tp) else {}
    return scan(open(html_path).read(), slug,
                topo.get('topology_id', ''))


def main():
    args = sys.argv[1:]
    if '--all' in args:
        files = []
        for root, _d, fns in os.walk(GENMENU):
            files += [os.path.join(root, f) for f in fns
                      if f.endswith('.html')]
    else:
        files = [a for a in args if not a.startswith('--')]
        files = [os.path.join(a, f)
                 if os.path.isdir(a)
                 else a for a in files
                 for f in (sorted(os.listdir(a))
                          if os.path.isdir(a) else [''])]
        files = [f for f in files if f.endswith('.html')]
    for p in sorted(files):
        fx = scan_file(p)
        out = p[:-5] + '.forensic.json'
        json.dump(fx, open(out, 'w'), indent=1)
    print(f'scanned {len(files)} exemplars')


if __name__ == '__main__':
    main()
