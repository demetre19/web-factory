#!/usr/bin/env python3
"""pipeline.py — the wave orchestrator (the ONLY entry point, U.5).

Site wave runs once per site folder; page waves run per page inside
<site>/pages/<slug>/. Every wave = producer tool steps in order, then a
receipted checklist, then the gate; a BLOCKED step or gate stops the
run (nonzero exit, nothing after it runs). The operator's ONLY
human acts are two picks: layout at w3, look at w4 — both made by
clicking a card in the picker page served by approve_service.py.
At those waves the run prints the picker URL and STOPS (or polls
with --wait); when the signed pick record exists, the next run
continues (layout_pick.py re-plans w3, then the same pick is
re-bound to the projected inputs via /confirm). w1/w2/w5–w8
advance automatically on a PASS. This script never approves,
never mints nonces, never signs a record itself.


Anti-bypass (X.2): at run start this writes RUN.json {token,
gate_sha256, rules_sha256, brief_sha256, tools_sha256,
templates_sha256, approval_pubkey_sha256} into the gated dirs and
exports PIPELINE_RUN to children — `run.py <wave>` refuses to gate
without the matching token, so waves cannot be invoked à la carte,
and gate.py's check_run_pin fails any producer file or template
that changed since run start (X.4 — the pin covers EVERY
tools/design-gate/*.py and the whole templates/ tree so a patched
producer cannot mint a byte-identical forgery).

Wave map (producer steps → gate → [pick]):
  s0  discovery.py → dna_from_discovery.py → gate (site dir; D.1)
  w0  copy_ingest.py → plan_from_copy.py → pipeline_emit --scaffold → gate
  w1  candidates_emit.py (CANDIDATES.json + picker) → gate
  w2  layouts picker → gate
  w3  layouts picker → gate → CLICK a card (signed pick) →
      layout_pick.py (plan_from_copy --option <pick>) → re-gate →
      /confirm re-bind
  w4  variants+fine pickers → gate → CLICK a card (look → DNA lock)
  w5  system sheet → gate
  w6  pipeline_emit --build → gate
  w7  assemble + evidence → gate → sign-review when REVIEW.json exists
  w8  repro.py → gate

  python3 pipeline.py <pipeline-dir> [--from s0|wN] [--to wN]
                       [--no-stop] [--wait] [--no-build]
"""
import datetime
import hashlib
import json
import os
import re
import secrets
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
PY = sys.executable
sys.path.insert(0, HERE)
import site_folder as SF  # noqa: E402
import gate as G  # noqa: E402

ORDER = ['w0', 'w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'w7', 'w8']
SITE_WAVE = 's0'
WAVES = [SITE_WAVE] + ORDER
APPROVABLE = {'w3', 'w4'}   # operator picks LAYOUT + LOOK only (decree)
# receipt manifests skip these — they are machinery state, not outputs
_SKIP_DIRS = {'node_modules', '.git', '__pycache__', '.receipts'}


def T(name):
    return os.path.join(HERE, name)


def _sha16(path):
    try:
        with open(path, 'rb') as fh:
            return hashlib.sha256(fh.read()).hexdigest()[:16]
    except OSError:
        return None


def _sha256(path):
    try:
        with open(path, 'rb') as fh:
            return hashlib.sha256(fh.read()).hexdigest()
    except OSError:
        return None


def _manifest(d):
    """{relpath: sha16} of every file under d — producer outputs are
    the files a step creates or changes."""
    m = {}
    for dp, dns, fns in os.walk(d):
        dns[:] = [x for x in dns if x not in _SKIP_DIRS]
        for fn in fns:
            p = os.path.join(dp, fn)
            rel = os.path.relpath(p, d).replace(os.sep, '/')
            m[rel] = _sha16(p)
    return m


def _record(d, wave, label, argv, inputs, writes, before, after, rc):
    """Append a producer receipt: what ran, what it read, what it wrote.
    Outputs = files the step created/changed ∪ its declared outputs —
    a producer that rewrote identical bytes is still receipted (the
    file's sha proves it went through the tool)."""
    inp = {}
    for p in inputs:
        rel = (os.path.relpath(p, d).replace(os.sep, '/')
               if not os.path.isabs(p) else p)
        inp[rel] = _sha16(p)
    outs = {rel: sha for rel, sha in after.items()
            if before.get(rel) != sha}
    for rel in writes or []:
        sha = _sha16(os.path.join(d, rel))
        if sha:
            outs.setdefault(rel, sha)
    recs_p = os.path.join(d, '.receipts', wave + '.json')
    try:
        recs = json.load(open(recs_p))
    except Exception:
        recs = {'steps': []}
    rec = {
        'label': label,
        'argv': [os.path.basename(x) if x.startswith(HERE) else x
                 for x in argv],
        'inputs': inp, 'outputs': outs, 'rc': rc,
        'ts': datetime.datetime.now().isoformat(timespec='seconds')}
    # a receipt step is provenance — sign it at write time with the
    # operator key (same _sig recipe P.17 artifacts carry); the
    # checklist verifier rejects unsigned steps, so a hand-written
    # .receipts row is not evidence
    key = G.op_key(create=True)
    if key:
        rec['sig'] = G._sig(rec, key)
    recs['steps'].append(rec)
    os.makedirs(os.path.dirname(recs_p), exist_ok=True)
    json.dump(recs, open(recs_p, 'w'), indent=1)


def _run_step(d, wave, step, env):
    """Run one producer step and record its receipt. Returns rc."""
    label, argv, inputs, writes = step
    before = _manifest(d)
    r = subprocess.run(argv, env=env)
    after = _manifest(d)
    _record(d, wave, label, argv, inputs, writes, before, after,
            r.returncode)
    return r.returncode

def _site_paths(pdir):
    """(site_dir, slug) — pdir may be the site dir itself (s0-only
    run) or a page dir inside it."""
    site, slug = SF.site_of(pdir)
    if site:
        return site, slug
    if os.path.isfile(os.path.join(pdir, 'BRIEF.yaml')):
        return os.path.abspath(pdir), None
    raise SystemExit(f'{pdir}: neither a site folder nor a page dir '
                     '(<site>/pages/<slug>)')


def dir_sha256(root, rel_root=None):
    """Single sha256 over a directory tree: hash of the sorted
    "rel:filesha256" lines (rel from rel_root, default = repo
    root). Shared recipe — gate.check_run_pin recomputes the same
    digest. A missing/empty tree pins the empty-string sha."""
    if rel_root is None:
        rel_root = os.path.dirname(os.path.dirname(HERE))
    lines = []
    for dp, dns, fns in os.walk(root):
        dns[:] = [x for x in dns if x != '__pycache__']
        for fn in sorted(fns):
            p = os.path.join(dp, fn)
            rel = os.path.relpath(p, rel_root).replace(os.sep, '/')
            lines.append(f'{rel}:{_sha256(p)}')
    return hashlib.sha256('\n'.join(sorted(lines)).encode()).hexdigest()


def _write_run(site_dir, pdir):
    """RUN.json — the run token + tool/rules pins (X.2/X.4). Written at
    run start into every dir a wave gates; PIPELINE_RUN carries the
    token to run.py children. tools_sha256 pins every producer in
    tools/design-gate, templates_sha256 the whole template tree,
    approval_pubkey_sha256 the pinned verification key — a mid-run
    edit to any of them fails check_run_pin."""
    token = secrets.token_hex(16)
    tools = {}
    for fn in sorted(os.listdir(HERE)):
        if fn.endswith('.py'):
            tools[fn] = _sha256(os.path.join(HERE, fn))
    pub = os.path.join(HERE, 'approval_pubkey.json')
    # the raw token never lands on disk: RUN.json stores only its
    # keyed digest (token_sig = HMAC(op_key, token)); consumers
    # verify PIPELINE_RUN against it. An approval's `run` field binds
    # to token_sig — it identifies the run without revealing the
    # token. (OS-user separation is NOT achievable in-repo: the
    # operator key lives under ~/.web-factory, readable by the same
    # OS user the agent runs as; true separation needs
    # approve_service under another user — documented in
    # approve_service.py, not faked here.)
    doc = {
        'token_sig': G.run_token_sig(token, G.op_key(create=True)),
        'gate_sha256': _sha256(T('gate.py')),
        'rules_sha256': _sha256(os.path.join(site_dir, 'RULES.md')),
        'brief_sha256': _sha256(os.path.join(site_dir, 'BRIEF.yaml')),
        'tools_sha256': tools,
        'templates_sha256': dir_sha256(
            os.path.join(os.path.dirname(os.path.dirname(HERE)),
                         'templates')),
        'approval_pubkey_sha256':
            _sha256(pub) if os.path.isfile(pub) else None,
        'pipeline': os.path.basename(pdir),
        'started': datetime.datetime.now().isoformat(
            timespec='seconds')}
    for d in {site_dir, pdir}:
        with open(os.path.join(d, 'RUN.json'), 'w') as fh:
            json.dump(doc, fh, indent=1)
    return token


def _steps(pdir, wave, build, site_dir):
    """Ordered producer steps — (label, argv, inputs, writes)."""
    asm = [PY, T('assemble.py'), pdir]
    if wave == SITE_WAVE:
        # site_dir gates; reuse prior DISCOVERY as the offline cache so
        # re-runs don't refetch the live site (fonts stay in assets/)
        had = os.path.isfile(os.path.join(site_dir, 'DISCOVERY.json'))
        off = ['--offline'] if had else []
        return [
            ('discovery', [PY, T('discovery.py'), site_dir] + off,
             [os.path.join(site_dir, 'BRIEF.yaml')],
             ['DISCOVERY.json', 'DISCOVERY.md']),
            ('dna from discovery',
             [PY, T('dna_from_discovery.py'), site_dir] + off,
             [os.path.join(site_dir, 'DISCOVERY.json'),
              os.path.join(site_dir, 'BRIEF.yaml')],
             ['DNA.json', 'TOKENS.json', 'DESIGN-SYSTEM.md'])]
    if wave == 'w0':
        stub, article = (None, None)
        try:
            stub, article = SF.sources(pdir)
        except SystemExit:
            pass
        return [
            ('copy ingest', [PY, T('copy_ingest.py'), pdir],
             [os.path.join(site_dir, 'BRIEF.yaml')] +
             [p for p in (stub, article) if p],
             ['COPY.json']),
            ('plan from copy', [PY, T('plan_from_copy.py'), pdir],
             [os.path.join(pdir, 'COPY.json'),
              os.path.join(site_dir, 'DNA.json'),
              os.path.join(site_dir, 'MOBBIN-REFS.md')],
             ['DESIGN-PLAN.md', 'STUB.md', 'LAYOUT-OPTIONS.json',
              'DNA.json', 'TOKENS.json']),
            ('site scaffold', [PY, T('pipeline_emit.py'), pdir,
                               '--scaffold'],
             [os.path.join(pdir, 'DESIGN-PLAN.md'),
              os.path.join(pdir, 'DNA.json')],
             ['TOKENS.json', 'site/package.json',
              'site/astro.config.mjs', 'site/tailwind.config.js',
              'site/src/styles/global.css',
              'site/src/_shared/inline.ts',
              'site/src/_shared/IconChip.astro'])]
    if wave == 'w1':
        return [('candidate registry + picker',
                 [PY, T('candidates_emit.py'), pdir], [],
                 ['CANDIDATES.json', 'preview/candidates.html'])]
    if wave == 'w2':
        return [('layouts picker', asm + ['--layouts'],
                 [os.path.join(pdir, 'STUB.md'),
                  os.path.join(pdir, 'DESIGN-PLAN.md'),
                  os.path.join(pdir, 'LAYOUT-OPTIONS.json'),
                  os.path.join(pdir, 'TOKENS.json'),
                  os.path.join(pdir, 'COPY.json')],
                 ['preview/layouts.html', 'site/dist/'])]
    if wave == 'w3':
        return [('layouts picker', asm + ['--layouts'],
                 [os.path.join(pdir, 'DESIGN-PLAN.md'),
                  os.path.join(pdir, 'LAYOUT-OPTIONS.json'),
                  os.path.join(pdir, 'TOKENS.json'),
                  os.path.join(pdir, 'COPY.json')],
                 ['preview/layouts.html', 'site/dist/']),
                ('section contracts',
                 [PY, T('gate.py'), 'contracts', pdir],
                 [os.path.join(pdir, 'DESIGN-PLAN.md')],
                 ['sections/'])]
    if wave == 'w4':
        return [('look options',
                 [PY, T('look_emit.py'), pdir],
                 [os.path.join(pdir, 'DNA.json'),
                  os.path.join(pdir, 'DESIGN-PLAN.md'),
                  os.path.join(pdir, 'LAYOUT-OPTIONS.json'),
                  os.path.join(pdir, 'TOKENS.json')],
                 ['VARIANT-GATES.json', 'PREBUILD.json']),
                ('variants picker', asm + ['--variants'],
                 [os.path.join(pdir, 'DESIGN-PLAN.md'),
                  os.path.join(pdir, 'VARIANT-GATES.json'),
                  os.path.join(pdir, 'TOKENS.json'),
                  os.path.join(pdir, 'COPY.json')],
                 ['preview/variants.html', 'site/dist/']),
                ('fine picker', asm + ['--fine'],
                 [os.path.join(pdir, 'DESIGN-PLAN.md'),
                  os.path.join(pdir, 'TOKENS.json'),
                  os.path.join(pdir, 'COPY.json')],
                 ['preview/fine.html', 'site/dist/'])]
    if wave == 'w5':
        return [('system sheet', asm + ['--system'],
                 [os.path.join(pdir, 'DESIGN-PLAN.md'),
                  os.path.join(pdir, 'TOKENS.json')],
                 ['preview/system.html', 'site/dist/']),
                ('corpus artifacts', [PY, T('corpus_publish.py'), pdir],
                 [os.path.join(pdir, 'DESIGN-PLAN.md')],
                 ['SOP-CONSTANTS.json', 'CANON-PADDING.json'])]
    if wave == 'w6':
        em = [PY, T('pipeline_emit.py'), pdir]
        if build:
            em.append('--build')
        return [('emit + build', em,
                 [os.path.join(pdir, 'DESIGN-PLAN.md'),
                  os.path.join(pdir, 'DNA.json')],
                 ['COMPONENTS.md', 'BUILD-PLAN.json',
                  'site/src/pages/system.astro'])]
    if wave == 'w7':
        return [('page assembly', asm,
                 [os.path.join(pdir, 'DESIGN-PLAN.md')],
                 ['SPEC.md', 'ASSEMBLED.md']),
                ('page evidence', [PY, T('evidence.py'), pdir], [],
                 [])]
    if wave == 'w8':
        return [('reproducibility', [PY, T('repro.py'), pdir],
                 [os.path.join(site_dir, 'BRIEF.yaml'),
                  os.path.join(pdir, 'COPY.json')],
                 [])]
    return []


def _checklist(d, wave, env):
    return subprocess.run(
        [PY, T('checklist_emit.py'), d, wave], env=env).returncode


def _gate(d, wave, design, env):
    argv = [PY, T('run.py'), wave, d]
    if design:
        argv += ['--design', design]
    return subprocess.run(argv, env=env).returncode


PICK_PORT = int(os.environ.get('WF_PICK_PORT', '4173'))


def _svc_state(port=PICK_PORT):
    """'current' | 'stale' | 'foreign' | 'down' — a same-tag service
    whose /health sha differs from the source file on disk is a
    STALE build: it answers, so nothing else can bind the port, but
    it serves pre-edit routes (this is how an old pick surface kept
    404ing /built iframes)."""
    import urllib.request
    try:
        d = json.load(urllib.request.urlopen(
            f'http://127.0.0.1:{port}/health', timeout=2))
    except Exception:
        return 'down'
    if not (d.get('ok') and d.get('svc') == 'wf-approve-service-v2'):
        return 'foreign'
    src = os.path.join(HERE, 'approve_service.py')
    cur = hashlib.sha256(open(src, 'rb').read()).hexdigest()[:12]
    return 'current' if d.get('sha') == cur else 'stale'


def _ensure_service(port=PICK_PORT):
    """Start approve_service detached if the pick surface is down or
    stale — the stale build is killed first or it holds the port."""
    st = _svc_state(port)
    if st == 'current':
        return True
    if st in ('stale', 'foreign'):
        try:                      # free the port for the real build
            pids = subprocess.run(
                ['lsof', '-t', f'-iTCP:{port}', '-sTCP:LISTEN'],
                capture_output=True, text=True, timeout=5).stdout
            for pid in pids.split():
                try:
                    os.kill(int(pid), 15)
                except (ValueError, ProcessLookupError,
                        PermissionError):
                    pass
            import time
            time.sleep(0.4)
        except Exception:
            return False
    subprocess.Popen(
        [PY, T('approve_service.py'), 'serve', '--port', str(port)],
        stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL, start_new_session=True)
    import time
    for _ in range(40):                 # ~4 s for the key + bind
        if _svc_state(port) == 'current':
            return True
        time.sleep(0.1)
    return False


def _picker_url(d, wave, port=PICK_PORT, kind=None):
    import urllib.parse
    kind = kind or ('layouts' if wave == 'w3' else 'variants')
    return (f'http://127.0.0.1:{port}/picker?pipeline='
            f'{urllib.parse.quote(d)}&wave={wave}&kind={kind}')


def _pick_gate(d, wave, wait, timeout=1800):
    """The operator's ONLY gate: a card click in the picker page.
    Returns 'ok' | 'paused' — 'ok' means a signed pick record for
    the CURRENT inputs already exists; 'paused' means the page is
    served and the run stops (re-run continues) or, with --wait,
    blocks until the pick lands."""
    import time
    if _current(d, wave):
        return 'ok'
    if not _ensure_service():
        print(f'  {wave} needs the pick surface and it did not '
              'start — run `approve_service.py serve --port '
              f'{PICK_PORT}` yourself and retry')
        return 'paused'
    print(f'  ┌ pick {wave} — click a card in the picker:')
    print(f'  │   {_picker_url(d, wave)}')
    if wave == 'w4':
        print(f'  │ fine round (after a variant pick): '
              f'{_picker_url(d, wave, kind="fine")}')
    print(f'  └ re-run this script after the click '
          f'(--wait polls for you)')
    if not wait:
        return 'paused'
    t0 = time.time()
    while time.time() - t0 < timeout:
        if _current(d, wave):
            print(f'  {wave} pick recorded — continuing')
            return 'ok'
        time.sleep(2)
    print(f'  {wave} pick wait timed out ({timeout}s)')
    return 'paused'


def _project_layout(d, wave, env):
    """Project the recorded w3 pick into the plan through the producer
    (layout_pick.py) — never by hand. Idempotent: a re-run re-projects
    the same pick. Contracts follow the projected plan — SB.1 reads
    sections/* live, so gate.py contracts rewrites them too."""
    rc = _run_step(d, wave,
                   ('layout projection',
                    [PY, T('layout_pick.py'), d],
                    [os.path.join(d, 'DESIGN-PLAN.md'),
                     os.path.join(d, 'LAYOUT-OPTIONS.json')],
                    ['DESIGN-PLAN.md', 'STUB.md',
                     'LAYOUT-OPTIONS.json']),
                   env)
    if rc != 0:
        return rc
    return _run_step(d, wave,
                     ('section contracts',
                      [PY, T('gate.py'), 'contracts', d],
                      [os.path.join(d, 'DESIGN-PLAN.md')],
                      ['sections/']),
                     env)


def _confirm(d, wave):
    """Re-bind a recorded pick to the projected inputs — POST
    /confirm on the pick surface (same pick, new input hashes).
    Returns True when the record is current afterwards."""
    import urllib.request
    tok = None
    try:
        d2 = json.load(urllib.request.urlopen(
            f'http://127.0.0.1:{PICK_PORT}/page-token', timeout=2))
        tok = d2.get('token')
    except Exception:
        return False
    req = urllib.request.Request(
        f'http://127.0.0.1:{PICK_PORT}/confirm',
        data=json.dumps({'wave': wave, 'pipeline': d}).encode(),
        headers={'Content-Type': 'application/json',
                 'X-WF-Page-Token': tok})
    try:
        r = json.load(urllib.request.urlopen(req, timeout=5))
        if r.get('ok'):
            print(f"  {r['message']}")
        return bool(r.get('ok'))
    except Exception:
        return False


def _approved(d, wave):
    ctx = G.Ctx(d)
    return G.approval_state(ctx, wave) == 'ok'


def _verified(d, wave):
    """True iff a record exists whose signature verifies — regardless
    of whether its inputs/run token are still current (a verified but
    stale pick is re-bound by /confirm; it is never re-chosen)."""
    rec = (G.read_approvals(G.Ctx(d)) or {}).get(wave)
    if not rec:
        return False
    sys.path.insert(0, HERE)
    import approval_key as AK
    return bool(AK.verify_approval(rec)[0])


def _pick(d, wave='w3'):
    """The recorded pick's design — only from a record whose signature
    verifies: an unsigned/forged record must never steer projection."""
    rec = (G.read_approvals(G.Ctx(d)) or {}).get(wave) or {}
    if not rec:
        return None
    return rec.get('design') if _verified(d, wave) else None


def _gate_fails_only_on_pick(d, wave):
    """True iff the wave's GATES.json failure list is X.3-only —
    every line is an approval-state miss (missing/stale/unsigned/
    channel). The pick is the missing input, so pausing at the
    picker is the right verdict; any OTHER failure must BLOCK."""
    try:
        rec = (json.load(open(os.path.join(d, 'GATES.json')))
               or {}).get(wave) or {}
    except Exception:
        return False
    fails = rec.get('failures') or []
    if not fails:
        return False                # nothing recorded → not a pick fail
    return all(re.match(r'X\.3\b', str(x)) for x in fails)


def _regate_drifted(pdir, site_dir, wave, env):
    """A wave's producers may legitimately rewrite an earlier wave's
    inputs — the w3 pick projects into DESIGN-PLAN.md (w0/w1/w3
    inputs) and the w4 look producer rewrites its options block. The
    ORDER check records each wave's input shas at gate time, so a
    downstream rewrite reads as drift. Re-gate the drifted ancestors
    in wave order BEFORE this wave gates (SOP: a wave is only passed
    when its verdict reflects the files on disk — a fresh PASS binds
    the projected bytes). Producers never re-run (they would clobber
    the projection); only the checklist (evidence must cite the new
    shas) and the gate do. Approvable ancestors keep their verified
    pick — /confirm re-binds it to the current inputs first. Returns
    a BLOCK message or None."""
    if wave not in ORDER:
        return None                 # the site wave has no ancestors
    prior = ORDER[:ORDER.index(wave)]
    drifted = []
    for w in prior:
        d = site_dir if w == SITE_WAVE else pdir
        ctx = G.Ctx(d)
        ctx.wave = w
        g = G.load_gates(ctx) or {}
        e = g.get(w)
        if not e or not e.get('pass'):
            continue
        rec = e.get('inputs_sha256')
        if rec and rec != G.input_hashes_for(ctx, w):
            drifted.append(w)
    if not drifted:
        return None
    print(f'  {wave}: earlier inputs drifted — re-gating '
          f'{", ".join(drifted)} (producers do not re-run)')
    for w in drifted:
        d = site_dir if w == SITE_WAVE else pdir
        if w in APPROVABLE and _verified(d, w) and \
                not _current(d, w):
            # the recorded pick stands; the service re-signs the SAME
            # pick to the projected inputs + this run (never re-chosen)
            if not _confirm(d, w):
                return (f'{w} pick not re-bound to the current '
                        'inputs; check the pick surface is up')
        _checklist(d, w, env)
        rc = _gate(d, w, _pick(d, w) if w in APPROVABLE else None, env)
        if rc != 0:
            return f'{w} re-gate failed (gate exit {rc})'
    return None

def _current(d, wave):
    """Approved AND bound to THIS run's token. approval_state checks
    inputs+dna only, so a record from a previous run still reads 'ok'
    — X.3 rejects it, so the rebind must not be skipped."""
    if not _approved(d, wave):
        return False
    rec = (G.read_approvals(G.Ctx(d)) or {}).get(wave) or {}
    try:
        run_tok = json.load(open(os.path.join(
            G.Ctx(d).dir, 'RUN.json'))).get('token_sig')
    except Exception:
        run_tok = None
    return not run_tok or str(rec.get('run')) == str(run_tok)


def run(pdir, frm=None, to=None, no_stop=False, wait=False,
        build=True):
    pdir = os.path.abspath(pdir)
    site_dir, slug = _site_paths(pdir)
    seq = WAVES[WAVES.index(frm):] if frm else WAVES
    if slug is None:                     # invoked on the site dir:
        seq = [SITE_WAVE]                # only the site wave applies
    if to:
        seq = seq[:seq.index(to) + 1]
    if APPROVABLE & set(seq):
        # the pick surface provisions the signing key + pinned pubkey
        # on first start — up BEFORE RUN.json pins approval_pubkey,
        # or the pin would see the key "appear mid-run" (X.2)
        _ensure_service()
    token = _write_run(site_dir, pdir)
    env = dict(os.environ, PIPELINE_RUN=token)
    for wave in seq:
        d = site_dir if wave == SITE_WAVE else pdir
        # the wave's receipts describe THIS run's producers; earlier
        # waves' receipts stay (checklist input provenance cites them)
        recs = os.path.join(d, '.receipts', wave + '.json')
        if os.path.isfile(recs):
            os.remove(recs)
        # this run re-gates `wave` and every wave after it — their
        # GATES.json records are stale verdicts from a prior run (or
        # none). Left in place, X.3 at an ancestor's drifted re-gate
        # demands an approval for a wave this run has not reached.
        # Ancestor records stay: _regate_drifted reads their
        # inputs_sha256 to detect legitimate downstream rewrites.
        try:
            later = ORDER[ORDER.index(wave):]
            gp = os.path.join(d, 'GATES.json')
            g = json.load(open(gp)) if os.path.isfile(gp) else {}
            if any(w in g for w in later):
                for w in later:
                    g.pop(w, None)
                    # a restarted run re-gates every later wave — its
                    # receipts are a prior run's signed provenance and
                    # must go with the gate record, or
                    # _checklist_receipt_fails rejects them before the
                    # wave can regenerate them
                    rp = os.path.join(d, '.receipts', w + '.json')
                    if os.path.isfile(rp):
                        os.remove(rp)
                json.dump(g, open(gp, 'w'), indent=2, sort_keys=True)
        except ValueError:
            pass                    # wave outside ORDER (site wave)
        print(f'=== {wave} ===')
        for step in _steps(d, wave, build, site_dir):
            rc = _run_step(d, wave, step, env)
            if rc != 0:
                print(f'{wave} BLOCKED — {step[0]} exited {rc}')
                if not no_stop:
                    return 1
        if _checklist(d, wave, env) != 0:
            print(f'{wave} BLOCKED — checklist producer failed')
            if not no_stop:
                return 1
        # w3: the pick must be projected into the plan BEFORE the gate
        # — L.3 compares LAYOUT-OPTIONS.pick against the approval, so
        # gating an unprojected pick can never pass. layout_pick is
        # idempotent: a re-run re-projects the SAME pick.
        projected = False
        if wave == 'w3' and _pick(d):
            rc = _project_layout(d, wave, env)
            if rc != 0:
                print(f'w3 BLOCKED — layout projection exited {rc}')
                if not no_stop:
                    return 1
                continue
            if not _current(d, wave) and not _confirm(d, wave):
                print('w3 BLOCKED — pick not re-bound to the '
                      'projected inputs; check the pick surface is up')
                if not no_stop:
                    return 1
                continue
            _checklist(d, wave, env)
            projected = True
        if wave == 'w4' and not _current(d, wave) and _verified(d, wave):
            # a verified look pick from an earlier run is re-signed to
            # THIS run — machinery rebind, never a new human choice.
            # BEFORE the gate: X.3 rejects a record bound to a dead run.
            _confirm(d, wave)
        blk = _regate_drifted(pdir, site_dir, wave, env)
        if blk:
            print(f'{wave} BLOCKED — {blk}')
            if not no_stop:
                return 1
            continue
        rc = _gate(d, wave, _pick(d, wave) if wave in APPROVABLE
                   else None, env)
        if rc != 0:
            # an approvable wave fails its first gate pass on X.3
            # alone: the pick is the missing input, so serve the
            # picker and pause — every other failure still BLOCKs
            if wave in APPROVABLE and not _pick(d, wave) \
                    and _gate_fails_only_on_pick(d, wave):
                if _pick_gate(d, wave, wait) == 'paused':
                    return 0
            print(f'{wave} BLOCKED — gate exited {rc}')
            if not no_stop:
                return 1
            continue
        if wave in APPROVABLE:
            # the human's only gate: a card click on the served
            # picker page (U.6). It runs BEFORE the wave's own gate —
            # X.3 needs a signed pick, so the gate can never pass
            # without one. The run pauses here until the pick lands.
            if _pick_gate(d, wave, wait) == 'paused':
                return 0
            if wave == 'w3' and not projected:
                # the pick landed — project it through the producer
                # (never by hand), re-bind the same pick to the
                # projected inputs, then gate against the new plan
                pick = _pick(d)
                if not pick:
                    print('w3 approved without a design — the record '
                          'needs a pick id')
                    if not no_stop:
                        return 1
                    continue
                rc = _project_layout(d, wave, env)
                if rc != 0:
                    print(f'w3 BLOCKED — layout projection exited {rc}')
                    if not no_stop:
                        return 1
                    continue
                if not _current(d, wave) and not _confirm(d, wave):
                    print('w3 BLOCKED — pick not re-bound to '
                          'the projected inputs; check the '
                          'pick surface is up')
                    if not no_stop:
                        return 1
                    continue
                _checklist(d, wave, env)
                projected = True
                # the projection rewrote earlier-wave inputs — re-gate
                # them in run order first (ORDER refuses w3 while
                # w0/w1/w2 records are stale; same call the normal
                # path makes before _gate)
                blk = _regate_drifted(pdir, site_dir, wave, env)
                if blk:
                    print(f'{wave} BLOCKED — {blk}')
                    if not no_stop:
                        return 1
                    continue
                rc = _gate(d, wave, pick, env)
                if rc != 0:
                    print(f'w3 BLOCKED — projected gate exited {rc}')
                    if not no_stop:
                        return 1
                    continue
                print(f'{wave} CLEAR')
                continue
        if wave == 'w7' and os.path.isfile(
                os.path.join(pdir, 'REVIEW.json')):
            # evidence.py re-bound the record and stripped its sig —
            # only run.py sign-review rebinds it (P.8, TTY-gated like
            # every human step); w8 refuses an unsigned review. The
            # sign runs as a receipted step: without its receipt the
            # w8 checklist cites the stale unsigned sha and P.9 reads
            # the signed file as post-receipt drift.
            rc = _run_step(d, wave, (
                'review sign',
                [PY, T('run.py'), 'sign-review', pdir],
                [os.path.join(pdir, 'REVIEW.json')],
                ['REVIEW.json']), env)
            if rc != 0:
                print('w7 BLOCKED — sign-review failed; the reviewer '
                      'must sign in an interactive terminal (P.8)')
                if not no_stop:
                    return 1
                continue
        print(f'{wave} CLEAR')
    print('=== PIPELINE COMPLETE — all waves CLEAR ===')
    return 0


def main():
    args = sys.argv[1:]
    if not args:
        print(__doc__)
        return 2
    pdir = args[0]
    kw = {}
    for flag, key in (('--from', 'frm'), ('--to', 'to')):
        if flag in args:
            i = args.index(flag)
            kw[key] = args[i + 1] if i + 1 < len(args) else None
    kw['no_stop'] = '--no-stop' in args
    kw['wait'] = '--wait' in args
    kw['build'] = '--no-build' not in args
    for w in (kw.get('frm'), kw.get('to')):
        if w and w not in WAVES:
            print(f'{w}: not a wave ({WAVES})')
            return 2
    return run(pdir, **kw)


if __name__ == '__main__':
    sys.exit(main())
