#!/usr/bin/env python3
"""assemble.py — mechanical glue (SB.4).

Writes site/src/pages/<slug>.astro from DESIGN-PLAN section order:
imports every section component, wraps each in <Section> with the plan's
surface, density, wf_ref, media ratio and disclosure. Deterministic: the
page is never hand-edited; `gate.py w7` compares the file to this output.

Usage: python3 tools/design-gate/assemble.py <pipeline-dir> [--variants | --layouts]

--variants regenerates the picker (preview/variants.html): full
responsive page mockups per knob vector — actual designs, not style
sheets. It is the ONLY legal producer of the picker (VG.1).
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import gate


def main(argv):
    args = [a for a in argv[1:] if not a.startswith('--')]
    flags = {a for a in argv[1:] if a.startswith('--')}
    if not args or flags - {'--variants', '--layouts'}:
        print('usage: assemble.py <pipeline-dir> [--variants]')
        return 2
    ctx = gate.Ctx(args[0])
    if '--layouts' in flags:
        path, txt, h = gate.assemble_layouts(ctx)
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, 'w', encoding='utf-8') as fh:
            fh.write(txt)
        print(f'assembled layout picker → '
              f'{os.path.relpath(path, ctx.dir)} (marker {h})')
        return 0
    if '--variants' in flags:
        path, txt, h = gate.assemble_variants(ctx)
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, 'w', encoding='utf-8') as fh:
            fh.write(txt)
        print(f'assembled picker → {os.path.relpath(path, ctx.dir)} '
              f'(marker {h})')
        return 0
    path, txt, h = gate.assemble_page(ctx)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as fh:
        fh.write(txt)
    print(f'assembled {len(gate.build_contracts(ctx))} sections '
          f'→ {os.path.relpath(path, ctx.dir)} (marker {h})')
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv))
