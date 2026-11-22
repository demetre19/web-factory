#!/usr/bin/env python3
"""candidates_emit.py — w1 producer: the candidate review registry +
picker. Replaces `assemble.py --candidates` as the pipeline step so the
registry itself (a w1 gate input) is tool-produced, not hand-copied.

  1. Seeds <pdir>/CANDIDATES.json from every tier:'candidate' source
     bank (docs/machinery/design/patterns/data/operator/_sources):
     scored entries first (score from *.scores.json), each 'pending'
     until the operator decides in the picker. Rows already decided in
     an existing registry keep their status/decision_sig — the file is
     the ledger, re-emitting never resets the operator's decisions.
  2. Renders preview/candidates.html through gate.assemble_candidates
     (the same emitter assemble.py --candidates uses), so every pending
     site shows screenshot + score + approve/reject controls that POST
     to the approval service.

  python3 candidates_emit.py <pipeline-dir> [--top N]
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import gate  # noqa: E402

TOOL = 'candidates_emit.py'
TOP = 60   # the picker renders every pending row — keep it reviewable


def _sources_root():
    return os.path.join(gate.DESIGN_DIR, 'patterns', 'data',
                        'operator', '_sources')


def _load(path):
    try:
        return json.load(open(path, encoding='utf-8'))
    except Exception:
        return None


def _score_map(root):
    """{url: (score, [reasons])} from each <src>.scores.json — the
    reasons join is lazy: only emitted rows pay for it."""
    out = {}
    if not os.path.isdir(root):
        return out
    for fn in sorted(os.listdir(root)):
        if not fn.endswith('.scores.json'):
            continue
        d = _load(os.path.join(root, fn)) or {}
        for c in d.get('sites') or d.get('candidates') or []:
            u = str(c.get('url') or c.get('site') or '').rstrip('/')
            if u:
                out[u] = (c.get('score'),
                          c.get('score_reasons') or [])
    return out


def _prior(path):
    """{url: row} decided rows from an existing registry — operator
    decisions survive re-emission."""
    d = _load(path)
    rows = (d if isinstance(d, list) else
            (d or {}).get('candidates') or [])
    out = {}
    for c in rows:
        if isinstance(c, dict) and \
                str(c.get('status') or 'pending') in ('approved',
                                                      'rejected'):
            u = str(c.get('url') or c.get('site') or
                    c.get('id') or '').rstrip('/')
            if u:
                out[u] = c
    return out


def _bank_index(root):
    """{url: name} — every tier:'candidate' source entry, minimal.
    Full row data (score reasons, shot path) is materialized only for
    the candidates the picker shows — several thousand rows are
    ranked, sixty emitted."""
    out = {}
    for fn in sorted(os.listdir(root)):
        if not fn.endswith('.json') or fn.endswith('.scores.json'):
            continue
        d = _load(os.path.join(root, fn)) or {}
        if 'candidate' not in str(d.get('tier') or '').lower():
            continue
        for c in d.get('sites') or d.get('candidates') or []:
            if not isinstance(c, dict):
                continue
            u = str(c.get('url') or c.get('site') or '').rstrip('/')
            if u:
                out[u] = str(c.get('name') or u)
    return out


def _row(u, name, scored):
    """The full registry row for one candidate."""
    sc, why = scored or (None, [])
    row = {'url': u, 'name': name or u,
           'status': 'pending', 'score': sc}
    if why:
        row['score_reasons'] = ' ; '.join(str(x) for x in why)
    row['shot'] = ('shots/' +
                   u.replace('://', '-').replace('/', '-') + '.webp')
    return row


def materialize(root, u):
    """Build a pending row for one bank candidate on demand — the
    registry only emits the picker's top slice, so a service decision
    landing on a deeper site resolves its row from the banks."""
    index = _bank_index(root)
    if u not in index:
        return None
    return _row(u, index[u], _score_map(root).get(u))


def seed(pdir, top=TOP):
    root = _sources_root()
    if not os.path.isdir(root):
        raise SystemExit(f'{TOOL}: no candidate source bank at {root}')
    scores = _score_map(root)
    index = _bank_index(root)
    ranked = sorted(index, key=lambda u: -(
        (scores.get(u) or (None,))[0] or 0))
    pending = [_row(u, index[u], scores.get(u))
               for u in (ranked[:top] if top else ranked)]
    out = _prior(os.path.join(pdir, 'CANDIDATES.json'))
    decided = [c for u, c in out.items()]
    doc = {'generated_by': TOOL,
           'source': 'tier:candidate banks (_sources)',
           'candidates': decided + pending}
    path = os.path.join(pdir, 'CANDIDATES.json')
    with open(path, 'w') as fh:
        json.dump(doc, fh, indent=1)
    return path, len(index), len(pending), len(decided)


def main(argv):
    a = [x for x in argv[1:] if not x.startswith('--')]
    top = TOP
    if '--top' in argv:
        top = int(argv[argv.index('--top') + 1])
    if len(a) != 1:
        print('usage: candidates_emit.py <pipeline-dir> [--top N]')
        return 2
    pdir = os.path.abspath(a[0])
    path, total, kept, decided = seed(pdir, top)
    print(f'{TOOL}: {kept}/{total} pending candidates '
          f'(+{decided} decided) → {path}')
    ctx = gate.Ctx(pdir)
    hp, txt, h = gate.assemble_candidates(ctx)
    os.makedirs(os.path.dirname(hp), exist_ok=True)
    with open(hp, 'w', encoding='utf-8') as fh:
        fh.write(txt)
    print(f'{TOOL}: picker → {hp} ({h})')
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv))
