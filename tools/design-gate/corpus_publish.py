#!/usr/bin/env python3
"""corpus_publish.py — publish the mined-corpus artifacts a page's
later gates consult (SC.1, G.6) into the pipeline dir:

  inputs   patterns/data/sop-adherence.json   mined verdict inputs
           patterns/data/CANON-PADDING.json   canon padding ratios
  outputs  <page>/SOP-CONSTANTS.json   {dataset, verdicts:{rule: verdict}}
           <page>/CANON-PADDING.json   verbatim copy of the canon table

  python3 corpus_publish.py <page-dir>
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import site_folder as SF  # noqa: E402
import gate  # noqa: E402

TOOL = 'corpus_publish.py'


def main():
    a = sys.argv[1:]
    if not a or a[0].startswith('-'):
        print(__doc__)
        return 2
    pdir = os.path.abspath(a[0])
    site_dir, _ = SF.site_of(pdir)
    # SC.1/SC.2 — the recorded verdict table the rules consult; each
    # verdict recomputes from the corpus (gate.sop_verdict).
    data = gate._sop_adherence()
    consts = {'dataset': 'sop-adherence.json',
              'verdicts': {rid: gate.sop_verdict(rid)
                           for rid in sorted(data)}}
    with open(os.path.join(pdir, 'SOP-CONSTANTS.json'), 'w') as fh:
        json.dump(consts, fh, indent=1, sort_keys=True)
        fh.write('\n')
    # G.6 — PatternMiner's canon padding table, verbatim.
    src = os.path.join(gate.PATTERNS_DIR, 'data', 'CANON-PADDING.json')
    if os.path.isfile(src):
        with open(src, 'rb') as fi:
            blob = fi.read()
        with open(os.path.join(pdir, 'CANON-PADDING.json'), 'wb') as fo:
            fo.write(blob)
        n = len(data)
        print(f'{TOOL}: SOP-CONSTANTS.json ({n} verdicts) + '
              f'CANON-PADDING.json → {pdir}')
    else:
        print(f'{TOOL}: SOP-CONSTANTS.json ({len(data)} verdicts); '
              f'WARNING no {src} — G.6 will fail at w7')
    return 0


if __name__ == '__main__':
    sys.exit(main())
