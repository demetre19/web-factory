#!/usr/bin/env python3
"""run.py — design-gate orchestrator + operator approval.

  python3 run.py <wave> <pipeline-dir> [gate.py options]
  python3 run.py approve <wave> <pipeline-dir> [--nonce N] [--design D]
  python3 run.py nonce <wave> <pipeline-dir>
  python3 run.py migrate-approvals <pipeline-dir>
  python3 run.py sign-review <pipeline-dir>

A wave runs only when EVERY earlier wave passed, every approvable one is
operator-approved for the CURRENT inputs, and no recorded input changed
(ORDER / DM.6). Approvals are minted by approve_service.py — a one-time
nonce per render (picker "Approve" button POSTs; `run.py nonce` mints
one for a chat approval) — or by an interactive TTY confirm. Records are
HMAC-signed {wave, inputs, DNA slices, nonce} under
~/.web-factory/operator.key; the designer cannot produce one (P.8).
Approving w3/w4 locks DNA v1.
"""
import json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ORDER = ['w0', 'w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'w7', 'w8']


def approve(wave, pdir, G, nonce=None, design=None, chat=None):
    """Record an operator approval.

    Two legal channels (P.8 — a designer agent can use NEITHER):
    - interactive: a real TTY confirm (by=operator-tty), or
    - service: --nonce <one-time nonce> minted by approve_service.py —
      the picker's Approve button or the orchestrator recording an
      operator's chat approval (`run.py nonce` first).
    """
    if wave not in ORDER:
        print(f'run.py approve: unknown wave {wave}')
        return 2
    if wave not in G.APPROVABLE:
        print(f'run.py approve: {wave} is not an approval point '
              f'(approvable: {sorted(G.APPROVABLE)}) — its pass is '
              'mechanical')
        return 2
    tty = sys.stdin.isatty()
    if wave == 'w4' and not nonce:
        print('run.py approve w4 REFUSED: w4 is the DNA v1 lock — '
              'service-nonce channel only. Mint one: '
              'python3 run.py nonce w4 <dir> then approve with '
              '--nonce (THE lock point).')
        return 1
    if not tty and not nonce:
        print('run.py approve REFUSED: no interactive terminal and no '
              '--nonce. Mint one: python3 run.py nonce <wave> <dir> '
              '(orchestrator / picker service only).')
        return 1
    import approve_service as S
    if nonce:
        code, txt = S.record_approval(wave, pdir, nonce=nonce,
                                      design=design, chat=chat)
        print(txt)
        return code
    ctx = G.Ctx(pdir)
    ctx.wave = wave
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
    if tty:
        ans = input(f'type "APPROVE {wave}" to record operator '
                    'approval: ')
        if ans.strip() != f'APPROVE {wave}':
            print('not approved')
            return 1
    rec = G.write_approval(ctx, wave, by='operator-tty', design=design)
    print(f'approved {wave} · {rec["inputs"]} · {rec["dna"]}')
    return 0


def sign_review(pdir, G):
    """Bind REVIEW.json to the build it graded — reviewer-only, TTY."""
    if not sys.stdin.isatty():
        print('run.py sign-review REFUSED: review binding needs an '
              'interactive terminal (P.8)')
        return 1
    ctx = G.Ctx(pdir)
    ctx.wave = 'w7'
    rp = os.path.join(pdir, 'REVIEW.json')
    if not os.path.isfile(rp):
        print('REVIEW.json missing — the reviewer writes it first')
        return 1
    rv = json.load(open(rp))
    rv['dist_sha256'] = G._dist_sha(ctx)
    sl = G.dna_slices(G.dna_map(ctx) or {})
    import secrets, hmac, hashlib
    rv['nonce'] = secrets.token_hex(8)
    # The signature binds the WHOLE record (items, modes, models) —
    # nothing is rewritable after signing (F-07B).
    canon = json.dumps({k: v for k, v in rv.items() if k != 'sig'},
                       sort_keys=True)
    body = (f"{rv['nonce']}|{rv['dist_sha256']}|{sl.get('core')}|"
            f"{rv.get('reviewer_model')}|"
            + hashlib.sha256(canon.encode()).hexdigest()[:16])
    rv['sig'] = hmac.new(G.op_key(create=True), body.encode(),
                         hashlib.sha256).hexdigest()[:32]
    with open(rp, 'w') as fh:
        json.dump(rv, fh, indent=1, sort_keys=True)
    print(f'signed REVIEW.json · dist {rv["dist_sha256"]} · '
          f'look {sl.get("core")}')
    return 0


def main():
    a = sys.argv[1:]
    if len(a) >= 3 and a[0] == 'approve':
        sys.path.insert(0, HERE)
        import gate as G
        kw = {}
        for flag, key in (('--nonce', 'nonce'), ('--design', 'design'),
                          ('--chat', 'chat')):
            if flag in a:
                i = a.index(flag)
                kw[key] = a[i + 1] if i + 1 < len(a) else ''
        return approve(a[1], a[2], G, **kw)
    if len(a) >= 3 and a[0] == 'migrate-approvals':
        sys.path.insert(0, HERE)
        import gate as G
        ch, tot = G.migrate_approvals(G.Ctx(a[2]))
        print(f'migrated {ch}/{tot} approval record(s)')
        return 0
    if len(a) >= 3 and a[0] == 'nonce':
        sys.path.insert(0, HERE)
        import gate as G  # noqa: F401
        import approve_service as S
        nonce, rec = S.issue_nonce(a[2], a[1])
        if not nonce:
            print(f'nonce REFUSED: {rec}')
            return 1
        print(nonce)
        return 0
    if len(a) >= 2 and a[0] == 'sign-review':
        sys.path.insert(0, HERE)
        import gate as G
        return sign_review(a[1], G)
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
        kind = G.WAVE_DNA_KIND.get(w, 'core')
        kind = ('core' if kind == 'all' else kind)
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
