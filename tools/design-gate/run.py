#!/usr/bin/env python3
"""run.py — design-gate orchestrator + operator approval.

  python3 run.py <wave> <pipeline-dir> [gate.py options]
  python3 run.py approve <wave> <pipeline-dir>

A wave runs only when EVERY earlier wave passed, every approvable one is
operator-approved for the CURRENT inputs, and no recorded input changed
(ORDER / DM.6). `approve` needs an interactive terminal and HMAC-signs
{wave, input hash, DNA slices} with ~/.web-factory/operator.key — the
designer's pipeline dir cannot produce an approval (P.8). Approving w3
locks DNA v1.
"""
import json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ORDER = ['w0', 'w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'w7', 'w8']


def lock_dna(ctx, G):
    """W3 approval is the look lock: the map becomes v1 (DNA LAW)."""
    m = G.dna_map(ctx)
    if m is None:
        return False
    if isinstance(m.get('version'), int) and m['version'] >= 1:
        return False
    m['version'] = 1
    m['hashes'] = G.dna_slices(m)
    with open(os.path.join(ctx.dir, 'DNA.json'), 'w') as fh:
        json.dump(m, fh, indent=1, sort_keys=True)
    with open(os.path.join(ctx.dir, 'DNA.md'), 'w', encoding='utf-8') as fh:
        fh.write(G.render_dna_md(m))
    return True


def approve(wave, pdir, G):
    if wave not in ORDER:
        print(f'run.py approve: unknown wave {wave}')
        return 2
    if wave not in G.APPROVABLE:
        print(f'run.py approve: {wave} is not an approval point '
              f'(approvable: {sorted(G.APPROVABLE)}) — its pass is '
              'mechanical')
        return 2
    if not sys.stdin.isatty():
        print('run.py approve REFUSED: approval needs an interactive '
              'terminal (P.8). The designer process cannot approve its '
              'own work; ask the operator to run this command.')
        return 1
    ctx = G.Ctx(pdir)
    fails = G.ancestry_fails(ctx) if wave != 'w0' else []
    if fails:
        print(f'run.py approve {wave} REFUSED — earlier waves are not '
              'clean:')
        for x in fails[:6]:
            print('  -', x)
        return 1
    g = G.load_gates(ctx)
    if not (g.get(wave) or {}).get('pass'):
        print(f'run.py approve {wave} REFUSED: {wave} has not passed')
        return 1
    sl = G.dna_slices(G.dna_map(ctx) or {})
    print(f'wave      {wave}')
    print(f'inputs    {G._h(G.input_hashes_for(ctx, wave))}')
    print(f'dna       look {sl.get("core")} · structure '
          f'{sl.get("structure")}')
    ans = input(f'type "APPROVE {wave}" to record operator approval: ')
    if ans.strip() != f'APPROVE {wave}':
        print('not approved')
        return 1
    if wave == 'w3' and lock_dna(ctx, G):
        print('DNA map locked to v1 (look lock)')
        sl = G.dna_slices(G.dna_map(ctx) or {})
    rec = G.write_approval(ctx, wave)
    print(f'approved {wave} · {rec["inputs"]} · {rec["dna"]}')
    return 0


def main():
    a = sys.argv[1:]
    if len(a) >= 3 and a[0] == 'approve':
        sys.path.insert(0, HERE)
        import gate as G
        return approve(a[1], a[2], G)
    if len(a) < 2 or a[0] not in ORDER:
        print(__doc__)
        return 2
    wave, pdir = a[0], a[1]
    sys.path.insert(0, HERE)
    import gate as G

    ctx = G.Ctx(pdir)
    ctx.wave = wave
    fails = G.ancestry_fails(ctx)
    if fails:
        print(f'run {wave} REFUSED:')
        for x in fails[:8]:
            print('  -', x)
        return 1
    # DM.6 — a changed DNA slice invalidates only the waves that consume
    # it: core (look) from w1, structure from w5.
    gp = os.path.join(pdir, 'GATES.json')
    g = json.load(open(gp)) if os.path.isfile(gp) else {}
    sl = G.dna_slices(G.dna_map(ctx) or {})
    restart = None
    for w in ORDER[:ORDER.index(wave)]:
        rec = (g.get(w) or {}).get('dna') or {}
        if not isinstance(rec, dict):
            continue
        kind = 'structure' if ORDER.index(w) >= ORDER.index('w5') else 'core'
        if rec.get(kind) and sl.get(kind) and rec[kind] != sl[kind]:
            restart = w
            break
    if restart:
        for w in ORDER[ORDER.index(restart):]:
            if w in g:
                g[w].update({'pass': False, 'approved': False,
                             'failures': [f'DNA {kind} changed — rebuild '
                                          f'from {restart}']})
        with open(gp, 'w') as fh:
            json.dump(g, fh, indent=2, sort_keys=True)
        print(f'run {wave} REFUSED: DNA map changed since {restart} was '
              f'gated — every downstream wave is stale; re-run from '
              f'{restart} (GATES.json reset from {restart} on)')
        return 1
    r = subprocess.run([sys.executable, os.path.join(HERE, 'gate.py')] + a)
    return r.returncode


if __name__ == '__main__':
    sys.exit(main())
