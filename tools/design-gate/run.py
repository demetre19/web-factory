#!/usr/bin/env python3
"""run.py — design-gate orchestrator.

Refuses to run wave N unless GATES.json shows wave N-1 `pass: true`
AND `approved: true` for the CURRENT input hashes (P.8). Forwards
everything else to gate.py.

  python3 run.py <wave> <pipeline-dir> [--wireframe <f>] [--design <id>]
                 [--stub <f>]
"""
import json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ORDER = ['w0', 'w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'w7', 'w8']


def main():
    if len(sys.argv) < 3 or sys.argv[1] not in ORDER:
        print(__doc__)
        return 2
    wave, pdir = sys.argv[1], sys.argv[2]
    sys.path.insert(0, HERE)
    import gate as G

    if wave != 'w0':
        prev = ORDER[ORDER.index(wave) - 1]
        gp = os.path.join(pdir, 'GATES.json')
        g = json.load(open(gp)) if os.path.isfile(gp) else {}
        pe = g.get(prev, {})
        if not pe.get('pass'):
            print(f'run {wave} REFUSED: {prev} has not passed '
                  f'(GATES.json: {pe.get("failures", ["never run"])[:1]})')
            return 1
        if not pe.get('approved'):
            print(f'run {wave} REFUSED: {prev} passed but not '
                  'operator-approved — gate.py %s %s --approve'
                  % (prev, pdir))
            return 1
        # stale-input detection: recompute prev hashes, compare
        import argparse
        a = argparse.ArgumentParser()
        a.add_argument('--wireframe')
        a.add_argument('--design')
        a.add_argument('--stub')
        ns, _ = a.parse_known_args(sys.argv[3:])
        ctx = G.Ctx(pdir, ns)
        ctx.wave = prev
        cur = G.input_hashes(ctx)
        old = pe.get('inputs_sha256', {})
        stale = [k for k, v in cur.items() if old.get(k) != v]
        if stale:
            print(f'run {wave} REFUSED: {prev} inputs changed since '
                  f'its pass — re-gate {prev} first: {stale[:4]}')
            return 1
        # DM.6 — a changed DNA map invalidates every wave that ran
        # against the old hash. Rebuild from the earliest such wave.
        h = G.dna_hash(ctx)
        restart = None
        for w in ORDER[:ORDER.index(wave)]:
            rec = (g.get(w) or {}).get('dna')
            if rec and h and rec != h:
                restart = w
                break
        if restart:
            for w in ORDER[ORDER.index(restart):]:
                if w in g:
                    g[w].update({
                        'pass': False, 'approved': False,
                        'failures': [f'DNA map changed — rebuild from '
                                     f'{restart}']})
            with open(gp, 'w') as fh:
                json.dump(g, fh, indent=2, sort_keys=True)
            print(f'run {wave} REFUSED: DNA map changed since {restart} '
                  f'was gated — every downstream wave is stale; re-run '
                  f'from {restart} (GATES.json reset from {restart} on)')
            return 1
    r = subprocess.run([sys.executable,
                        os.path.join(HERE, 'gate.py')] + sys.argv[1:])
    return r.returncode


if __name__ == '__main__':
    sys.exit(main())
