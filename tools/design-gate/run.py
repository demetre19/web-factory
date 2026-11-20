#!/usr/bin/env python3
"""run.py — design-gate orchestrator.

  python3 run.py <wave> <pipeline-dir> [gate.py options]
  python3 run.py migrate-approvals <pipeline-dir>
  python3 run.py sign-review <pipeline-dir>
  python3 run.py reset <pipeline-dir> <from-wave>   (clears state)

A wave runs only when EVERY earlier wave passed, every approvable one
(w3 layout pick, w4 look pick) is operator-approved for the CURRENT
inputs, and no recorded input changed (ORDER / DM.6). Gate invocations
are orchestrator-only: `run.py <wave>` refuses unless PIPELINE_RUN
matches the token pipeline.py wrote into RUN.json at run start
(X.2 — waves cannot be invoked à la carte).

There is NO terminal approval path: the operator picks by pressing
the picker's own "Pick this layout" / "Pick this look" button in the
page served by `approve_service.py serve` (the pipeline prints the
URL and waits). Approving w4 — and only w4 — locks DNA v1.
`approve` / `keygen` / `nonce` / `nonce-batch` were REMOVED; they
print that message and exit 1.
"""
import json, os, shutil, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ORDER = ['s0', 'w0', 'w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'w7', 'w8']


def _run_token_ok(pdir):
    """X.2 — a wave gate may only be invoked inside a pipeline run:
    PIPELINE_RUN (exported by pipeline.py) must match the token in
    RUN.json written at run start. Operator commands (reset)
    are exempt — they never pass a wave."""
    try:
        run = json.load(open(os.path.join(pdir, 'RUN.json')))
    except Exception:
        run = {}
    tok = run.get('token')
    env = os.environ.get('PIPELINE_RUN')
    return bool(tok) and env == tok


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
    if len(a) >= 2 and a[0] in ('approve', 'keygen', 'nonce',
                                'nonce-batch'):
        print(f'{a[0]}: REMOVED — operator picks happen by clicking '
              'a card in the picker page. Run the pipeline; it '
              'prints the picker URL and waits '
              '(approve_service.py serve --port 4173).')
        return 1
    if len(a) >= 3 and a[0] == 'migrate-approvals':
        sys.path.insert(0, HERE)
        import gate as G
        ch, tot = G.migrate_approvals(G.Ctx(a[2]))
        print(f'migrated {ch}/{tot} approval record(s)')
        return 0
    if len(a) >= 3 and a[0] == 'reset':
        sys.path.insert(0, HERE)
        import gate as G
        pdir, frm = a[1], a[2]
        if frm not in ORDER:
            print(f'reset: {frm} is not a wave ({ORDER})')
            return 2
        gp = os.path.join(pdir, 'GATES.json')
        g = json.load(open(gp)) if os.path.isfile(gp) else {}
        drop = {w for w in ORDER if ORDER.index(w) >= ORDER.index(frm)}
        for w in drop:
            g.pop(w, None)
        arts = g.get('artifacts') or {}
        # receipts: gate.ARTIFACTS is the one wave→artifact map; a
        # receipt surviving its wave's reset fails P.17 on re-run
        for w in drop:
            for rel in G.ARTIFACTS.get(w, []):
                arts.pop(rel, None)
        # files: only regenerable outputs are deleted — REVIEW.json is
        # the reviewer's record, re-bound by evidence.py, never removed
        regen = {'w3': ['preview/layouts.html'],
                 'w4': ['preview/variants.html', 'preview/fine.html'],
                 'w5': ['preview/system.html'],
                 'w6': ['site/dist']}
        for w in drop:
            for rel in regen.get(w, []):
                fp = os.path.join(pdir, rel)
                if os.path.isdir(fp):
                    shutil.rmtree(fp)
                elif os.path.isfile(fp):
                    os.remove(fp)
        g['artifacts'] = arts
        json.dump(g, open(gp, 'w'), indent=1, sort_keys=True)
        print(f'reset: cleared wave state ≥ {frm} '
              '(approvals auto-stale via input hash)')
        return 0
    if len(a) >= 2 and a[0] == 'sign-review':
        sys.path.insert(0, HERE)
        import gate as G
        return sign_review(a[1], G)
    if len(a) < 2 or a[0] not in ORDER:
        print(__doc__)
        return 2
    wave, pdir = a[0], a[1]
    if not _run_token_ok(pdir):
        print(f'run {wave} REFUSED: waves run inside the orchestrator '
              'only — no RUN.json token matching PIPELINE_RUN '
              f'(X.2). Use `pipeline.py {pdir} --from {wave}`.')
        return 1
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
