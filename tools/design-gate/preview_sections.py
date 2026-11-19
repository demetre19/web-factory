#!/usr/bin/env python3
"""preview_sections.py — the ONE preview surface. Per-vibe FULL
PAGES (separate files, separate stylesheets — no scoped collisions)
plus a picker index linking out.

For each vibe: retrieve each section's topology from the section
bank -> emit the sequence -> bind the vibe's theme_sheet -> write
preview/pages/<vibe>.html (a standalone page with TW4 + kit CSS).

The picker (preview/sections.html) is machinery output too — one
card per vibe, frame shows the page scaled; click opens the page.

  python3 preview_sections.py [vibe ...]
"""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, HERE)
sys.path.insert(0, os.path.join(
    ROOT, 'docs', 'machinery', 'design', 'patterns', 'tools'))

import retrieval          # noqa: E402
import section_emit       # noqa: E402
import picker             # noqa: E402
from theme_vibes import theme_sheet, VIBES  # noqa: E402

OUT = os.path.join(HERE, 'preview')
PAGES = os.path.join(OUT, 'pages')

TW4 = ('<script src="https://cdn.jsdelivr.net/npm/'
       '@tailwindcss/browser@4"></script>'
       '<link href="https://cdn.jsdelivr.net/npm/flowbite@3.1.2/'
       'dist/flowbite.min.css" rel="stylesheet">')

SEQUENCE = ['nav', 'hero', 'feature-grid', 'pricing',
            'call-to-action', 'footer']


def page_for(vibe_name, dna, bank=None, vibe_idx=0):
    """deterministic structure assignment: each vibe gets a
    distinct topology per section_type (rotated by vibe index +
    section position) so pages differ STRUCTURALLY, not just in
    skin. Emit -> theme -> write standalone page."""
    v = VIBES[vibe_name]
    body = []
    meta = {}
    for pos, st in enumerate(SEQUENCE):
        options = section_emit.topologies(st)
        topo = options[(vibe_idx + pos) % len(options)]
        body.append(section_emit.emit(topo, dna,
                                      {'cta': dna['cta']}))
        meta[st] = topo
    css = theme_sheet(v, 'body')
    html = (
        '<!doctype html><html><head><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width">'
        + TW4 +
        '<style>' + css + '</style>'
        '<title>' + vibe_name + '</title></head>'
        '<body style="background:' + v['surface'] + '">'
        + '\n'.join(body) +
        '</body></html>')
    os.makedirs(PAGES, exist_ok=True)
    path = os.path.join(PAGES, vibe_name + '.html')
    open(path, 'w').write(html)
    return path, meta


def build(vibes=None, dna=None):
    vibes = vibes or sorted(VIBES)
    dna = dna or {'copy': ('From first call to keys',
                           'Four to six months, one team.'),
                  'cta': 'Download the guide', 'vertical': 'saas'}
    bank = retrieval.SectionBank()
    items = []
    for vi, v in enumerate(vibes):
        path, meta = page_for(v, dna, bank, vibe_idx=vi)
        rel = os.path.relpath(path, OUT)
        # picker card: the ACTUAL rendered page in a scaled iframe —
        # real sections, not swatches. Click-through opens full.
        topos = ' · '.join(f'{st}:{meta[st]}' for st in SEQUENCE)
        tile = (
            f'<a href="{rel}" target="_blank" class="pv-link">'
            f'<iframe src="{rel}" class="pv-frame" scrolling="no" '
            'tabindex="-1"></iframe>'
            f'<div class="pv-name">{v}</div>'
            f'<div class="pv-topos">{topos}</div></a>')
        items.append(picker.PickerItem(
            id=v, name=v, subtitle='open full page →',
            preview_html=tile, scope_vars={},
            section_type='page',
            dims={'file': rel}))
    os.makedirs(OUT, exist_ok=True)
    idx = os.path.join(OUT, 'sections.html')
    open(idx, 'w').write(picker.render_picker(
        items, title='Vibes — one page each',
        intro='each card opens a standalone themed page',
        extra_css=(
            '.pv-link{display:block;text-decoration:none;'
            'background:#0e0e0e}'
            '.pv-frame{width:1200px;height:760px;border:0;'
            'transform:scale(0.32);transform-origin:top left;'
            'pointer-events:none;display:block}'
            '.pv-name{padding:10px 16px 2px;color:#eee;font:600 '
            '15px system-ui;text-transform:capitalize}'
            '.pv-topos{padding:0 16px 12px;color:#888;font:11px '
            'monospace}')))
    return idx


if __name__ == '__main__':
    sel = sys.argv[1:] or None
    p = build(sel)
    print('wrote', p)
