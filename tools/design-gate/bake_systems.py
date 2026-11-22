#!/usr/bin/env python3
"""bake_systems.py — batch-emit every vibe in the vibe space as a
SAVED-SYSTEMS design-system bundle.

The picker lists only what SAVED-SYSTEMS holds — two hand-baked files
was never the design. This producer runs the same resolve→emit path a
manual save rides (vibe_atlas.resolve: gene bundle → DNA tokens →
light/dark css + shape + theme) once per vibe preset and per named
VIBE_FAMILIES family, and writes picker_app.save_system-shaped
records under <pdir>/SAVED-SYSTEMS/ so the board can group and filter
hundreds of systems by mood/family.

Each record carries its vibe name, cluster and full gene bundle —
that's the picker's grouping data.

  bake_systems.py <page-dir>
  outputs  <page>/SAVED-SYSTEMS/<slug>.json   one per vibe preset +
                                            per named family
"""

import datetime
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import gate as G          # noqa: E402
import vibe_atlas as VA   # noqa: E402
import picker_app as PA   # noqa: E402  (VIBE_FAMILIES — named families)

TOOL = 'bake_systems.py'


def _slug(s):
    return re.sub(r'[^a-z0-9-]+', '-', s.lower()).strip('-')[:48]


def _rec(name, slug, vibe, cluster, genes_map, resolved, extra=None):
    genes = [f'{ax}:{al}' for ax, al in sorted(genes_map.items())]
    rec = {'name': name,
           'slug': slug,
           'generated_by': TOOL,
           'vibe': vibe,
           'cluster': cluster,
           'genes': genes,
           'gene_map': dict(genes_map),
           'dna': {'genotype': dict(genes_map)},
           'default_mode': resolved.get('theme') or 'light',
           'theme': resolved.get('theme'),
           'css': resolved.get('css') or '',
           'css_dark': resolved.get('css_dark') or '',
           'shape': resolved.get('shape') or '',
           'tokens': resolved.get('tokens'),
           'picks': [],
           'created': datetime.datetime.now().isoformat(
               timespec='seconds')}
    if extra:
        rec.update(extra)
    rec['sig'] = G._sig(rec, G.op_key(create=True))
    return rec


def bake(pdir):
    """Write one SAVED-SYSTEMS bundle per vibe preset + per named
    family; returns the written slugs."""
    sdir = os.path.join(pdir, 'SAVED-SYSTEMS')
    os.makedirs(sdir, exist_ok=True)
    written = []
    # the named families — baseline + the hand-tuned families ride
    # their own css/css_dark, no gene sweep needed
    for fam, f in PA.VIBE_FAMILIES.items():
        rec = _rec(f.get('name') or fam, _slug('family-' + fam), fam,
                   fam, _genes_map(f), f,
                   extra={'desc': f.get('desc')})
        _write(sdir, rec)
        written.append(rec['slug'])
    # every deterministic preset in the vibe space — resolved through
    # the same resolve() the picker frames bind
    for pr in VA.PRESETS:
        r = VA.resolve(pr['genes'])
        rec = _rec(pr['name'], _slug(pr['id']), pr['cluster'],
                   pr['cluster'], pr['genes'], r)
        _write(sdir, rec)
        written.append(rec['slug'])
    return written


def _genes_map(fam):
    """Named families label their genes as strings ('dark-first') —
    split into an axis map where possible, else keep as tags."""
    out = {}
    for g in fam.get('genes') or []:
        ax, _, al = str(g).partition(':')
        if al:
            out[ax] = al
    return out


def _write(sdir, rec):
    fp = os.path.join(sdir, rec['slug'] + '.json')
    with open(fp, 'w', encoding='utf-8') as fh:
        json.dump(rec, fh, indent=1, sort_keys=True)


def main(argv):
    if len(argv) != 2:
        sys.exit('usage: bake_systems.py <page-dir>')
    pdir = os.path.abspath(argv[1])
    written = bake(pdir)
    print(f'bake_systems: {len(written)} systems → '
          f'{os.path.join(pdir, "SAVED-SYSTEMS")}')


if __name__ == '__main__':
    main(sys.argv)
