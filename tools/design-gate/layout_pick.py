#!/usr/bin/env python3
"""layout_pick.py — w3 projection step (runs AFTER operator approval).

Reads the operator's recorded w3 layout pick from the signed pick
record (gate.read_approvals → 'w3' → 'design' — written when a card
is clicked in the served picker page) and re-projects the plan
through the producer: `plan_from_copy.py --option <pick>`. The pick
is never chosen here — this tool BLOCKS when no signed pick exists.

  python3 layout_pick.py <page-pipeline-dir>
"""
import json
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import gate  # noqa: E402

TOOL = 'layout_pick.py'


def pick(pdir):
    ctx = gate.Ctx(pdir)
    rec = (gate.read_approvals(ctx) or {}).get('w3') or {}
    d = rec.get('design')
    if not d:
        raise SystemExit(
            f'{TOOL}: BLOCKED — no signed w3 pick on record. The '
            'operator picks by clicking a card in the picker page '
            '(the pipeline prints the URL and waits): '
            f'`pipeline.py {pdir} --from w3`')
    # the recorded pick must be a real option the producer offered —
    # a forged/renamed design id is refused here, not inside
    # plan_from_copy mid-pipeline (P3)
    lo_path = os.path.join(pdir, 'LAYOUT-OPTIONS.json')
    try:
        lo = json.load(open(lo_path))
        ids = {str(o.get('id')) for o in lo.get('options') or []}
    except Exception as e:
        raise SystemExit(
            f'{TOOL}: BLOCKED — cannot read LAYOUT-OPTIONS.json '
            f'({e}); re-run plan_from_copy.py to regenerate it')
    if str(d) not in ids:
        raise SystemExit(
            f'{TOOL}: BLOCKED — recorded pick "{d}" is not an option '
            f'in LAYOUT-OPTIONS.json (options: '
            f'{", ".join(sorted(ids)) or "none"}). The pick record '
            'is forged or the options were regenerated — the '
            'operator must pick again from the CURRENT picker page '
            '(the pipeline serves the URL at w3)')
    return str(d)


def project(pdir, design):
    argv = [sys.executable, os.path.join(HERE, 'plan_from_copy.py'),
            pdir, '--option', design]
    r = subprocess.run(argv)
    return r.returncode


def main(argv):
    a = [x for x in argv[1:] if not x.startswith('--')]
    if len(a) != 1:
        print('usage: layout_pick.py <page-pipeline-dir>')
        return 2
    pdir = os.path.abspath(a[0])
    design = pick(pdir)
    print(f'{TOOL}: projecting approved pick {design} — '
          f'plan_from_copy.py --option {design}')
    rc = project(pdir, design)
    if rc:
        print(f'{TOOL}: plan_from_copy.py exited {rc}')
    return rc


if __name__ == '__main__':
    sys.exit(main(sys.argv))
