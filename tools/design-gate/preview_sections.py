#!/usr/bin/env python3
"""preview_sections.py — the ONE preview surface. Drives the real
pipeline end to end into picker.py's canonical chrome:

  DNA -> retrieve_section(section_type) -> topology_id
      -> section_emit.emit(topology_id, dna)
      -> theme_sheet(vibe)   -> PickerItem(preview_html)
      -> render_picker -> preview/picker.html

No ad-hoc pages. Every section preview goes through this file so
the machinery + the display stay in sync.
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

# The TW4 + Flowbite shell every semantic section needs to render
# its classes — same kit the render harness uses.
TW4 = ('<script src="https://cdn.jsdelivr.net/npm/'
       '@tailwindcss/browser@4"></script>'
       '<link href="https://cdn.jsdelivr.net/npm/flowbite@3.1.2/'
       'dist/flowbite.min.css" rel="stylesheet">')


def preview_for(section_type, dna, vibe_name):
    """retrieve -> emit -> bind. Returns (picker_preview_html,
    topology_id, clip_score). The markup shown in the card IS the
    emitted section framed in the page shell."""
    out = retrieval.retrieve_section(
        section_type, dna=dna, k=6)
    topo = out.get('topology_id')
    score = out['ranked'][0][0] if out.get('ranked') else 0
    markup = section_emit.emit(topo or section_type, dna)
    vibe = VIBES.get(vibe_name, VIBES['corporate'])
    # page-framed: the emitted section inside its theme scope;
    # TW4 lives in the item so it loads wherever the card lands.
    scoped = (TW4 +
        '<style>' + theme_sheet(
        vibe, f'[data-vibe={vibe_name}]') + '</style>'
        f'<div data-vibe={vibe_name} class="pk-sec">'
        + markup + '</div>')
    return scoped, topo, score


def build(section_types=None, vibes=None, dna=None):
    section_types = section_types or ['hero', 'call-to-action',
                                      'feature-grid', 'pricing']
    vibes = vibes or list(VIBES)
    dna = dna or {'copy': ('From first call to keys',
                           'Four to six months, one team.'),
                  'cta': 'Download the guide', 'vertical': 'saas'}
    items = []
    for st in section_types:
        for v in vibes:
            html, topo, score = preview_for(st, dna, v)
            items.append(picker.PickerItem(
                id=f'{st}-{v}', name=v,
                subtitle=f'{st} · {topo or st}',
                preview_html=html,
                scope_vars={}, scope=f'data-vibe={v}',
                section_type=st, score=round(score, 3),
                dims={'topology': topo or 'default'}))
    os.makedirs(OUT, exist_ok=True)
    path = os.path.join(OUT, 'sections.html')
    open(path, 'w').write(picker.render_picker(
        items, title='Sections — retrieve · emit · bind',
        intro='each card = retrieved topology × vibe vars',
        extra_css='.pk-sec{padding:0}'))
    return path


if __name__ == '__main__':
    p = build()
    print('wrote', p)
