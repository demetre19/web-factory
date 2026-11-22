#!/usr/bin/env python3
"""approve_service.py — the operator's pick surface (the ONLY
process that writes approval records).

Model (user decree): the human picks by pressing the picker's own
"Pick this layout" / "Pick this look" button (button.pick[data-d])
in the page this service serves — no terminal, no dialogs, no typed
confirmations. That click POSTs /approve with the page token + the
nonce minted when THAT page was served; the record is Ed25519-signed
by the service key and verifies offline (approval_key.verify_approval).
Card bodies, tabs and viewport-size buttons record nothing.

Picks: w3 = layout in preview/layouts.html; w4 = look in
preview/variants.html (or the fine round). The record binds
{wave, pipeline(realpath), design, inputs hash, dna, run token, ts};
a changed input or a different run token voids it at gate time
(`/confirm` re-signs the SAME pick to the new inputs/run).

Honest limits (§6.4): the signing seed is a same-uid file —
records are tamper-evident, not tamper-proof; the harness tool
fence is what denies agents this service and the key file. The
bindings below are what make records traceable to a rendered
click surface: every mutation requires the per-page token,
nonces are single-use ledger-bound, the design must be an option
in the served HTML, and the ledger records issue/consume.

Commands:
    approve_service.py serve [--port 4173]    the pick surface
    approve_service.py promote --site X --decision approved|rejected
                                              (candidate registry; TTY)

HTTP (127.0.0.1 only, X-WF-Page-Token on every mutation):
    GET  /health                     → {svc, version}
    GET  /picker?pipeline=..&wave=w3|w4[&kind=layouts|variants|fine]
                                   → the picker page + click JS
    GET  /page-token                 → {token}   (picker JS origin)
    POST /nonce   {wave, pipeline}   → {nonce}
    POST /approve {wave, pipeline, nonce, design, chat?}
                                   → {ok|error} — signs + writes
    POST /confirm {wave, pipeline}   → re-signs the existing pick
                                       against current inputs
                                       (post-projection rebind)
    POST /promote {site, decision, pipeline?} → {ok|error}
    GET  /app?pipeline=..           → the pick app shell
    GET  /app-data?pipeline=..      → boards + galleries + design file
    GET  /frame/<fam>/<abs-path>    → a built page bound under a
                                      vibe family's token bundle
                                      (var overrides, no rebuild)
    POST /element-pick {pipeline, element, variant}
                                   → signed ELEMENT-PICKS.json row
"""
import argparse, datetime, hashlib, hmac, json, os, re, secrets,     sys, threading
import urllib.parse

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import gate as G

ORDER = ['w0', 'w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'w7', 'w8']
VERSION = 'wf-approve-service-v2'
PORT = 4173
def _code_sha():
    """First 12 of this file's sha256 — the pick surface reports it in
    /health so the pipeline can tell a stale daemon (pre-edit code
    still bound to the port) from the current build."""
    return hashlib.sha256(
        open(os.path.abspath(__file__), 'rb').read()).hexdigest()[:12]


# captured ONCE at import — a per-request re-read of the file would
# report the NEW sha on a daemon still running the OLD code, hiding
# exactly the stale-build case the field exists to expose
_CODE_SHA = _code_sha()


# the file the picker page is rendered from, per wave/kind
_PICKER_FILES = {
    ('w1', 'candidates'): 'preview/candidates.html',
    ('w3', 'layouts'): 'preview/layouts.html',
    ('w4', 'variants'): 'preview/variants.html',
    ('w4', 'fine'): 'preview/fine.html',
}

# the last pipeline the picker served — root-absolute asset URLs
# inside /built pages (/_astro/…, /fonts/…, /media/…) resolve
# against its site/dist, so iframes render styled on this origin
_LAST_PD = None
_EMIT_LOCK = threading.Lock()


def _rewrite_assets(fp, txt):
    """A built page links its css/media by root-absolute (/_astro/*)
    or relative (../_astro/*) URLs — under /frame or /built those
    resolve against the service path and 404. Rewrite every asset
    URL to /built/<quoted-abs-path> so the file resolves by path,
    no _LAST_PD involved."""
    dist_root = fp.split('/site/', 1)[0] + '/site/dist'
    base_dir = os.path.dirname(fp)

    def map_url(url):
        if re.match(r'^(https?:|//|data:|#|/built/|/frame/|mailto:|'
                    r'tel:|javascript:)', url):
            return url
        tgt = (os.path.normpath(dist_root + url)
               if url.startswith('/') else
               os.path.normpath(os.path.join(base_dir, url)))
        if '/site/' not in tgt:
            return url
        if os.path.isdir(tgt):
            tgt = tgt.rstrip('/') + '/index.html'
        return '/built/' + urllib.parse.quote(tgt)

    def fix(m):
        url = m.group(2)
        mapped = map_url(url)
        if mapped == url:
            return m.group(0)
        return m.group(1) + mapped + m.group(3)

    txt = re.sub(r'(href="|src="|poster=")([^"#]+)(")', fix, txt)

    def fix_srcset(m):
        out = []
        for cand in m.group(2).split(','):
            cand = cand.strip()
            if not cand:
                continue
            u, _, desc = cand.partition(' ')
            out.append(map_url(u) + ((' ' + desc) if desc else ''))
        return m.group(1) + ', '.join(out) + m.group(3)

    return re.sub(r'(srcset=")([^"]+)(")', fix_srcset, txt)


def _ensure_preview(fp):
    """A preview doc under <pd>/site/dist/preview/ missing on disk —
    re-emit that pipeline's previews (app_data emits vibe + section
    + element + bank docs), then re-check. A wiped or pre-pull dist
    must self-heal instead of 404ing every frame."""
    if '/preview/' not in fp or '/site/' not in fp:
        return
    pd = fp.split('/site/', 1)[0]
    if not os.path.isdir(pd):
        return
    import picker_app
    with _EMIT_LOCK:
        if not os.path.isfile(fp):
            try:
                picker_app.app_data(pd)
            except Exception:
                pass


def _nonces_dir():
    return os.path.join(G.OPERATOR_HOME, 'nonces')


def _nonce_file(nonce):
    if not re.fullmatch(r'[0-9a-f]{32}', nonce or ''):
        return None
    return os.path.join(_nonces_dir(), nonce + '.json')


def issue_nonce(pipeline, wave):
    """Mint a single-use approval nonce bound to wave+pipeline+inputs."""
    if wave not in G.APPROVABLE:
        return None, f'{wave} is not an approval point'
    if not os.path.isdir(pipeline):
        return None, f'pipeline {pipeline} not found'
    ctx = G.Ctx(pipeline)
    # canonical (realpath) — gate's X.3 compares this against ctx.dir,
    # so a symlinked pipeline path (macOS /tmp) must not diverge
    pd = ctx.dir
    ih = G._h(G.input_hashes_for(ctx, wave))
    rec = {'wave': wave, 'pipeline': pd, 'inputs': ih, 'used': False,
           'ts': datetime.datetime.now().isoformat(timespec='seconds'),
           'expires': (datetime.datetime.now() +
                       datetime.timedelta(minutes=30)).isoformat(
                           timespec='seconds')}
    # the service signs what it issues — a nonce file the service did
    # not mint is forged and refused at consume time
    rec['sig'] = G._sig(rec, G.op_key(create=True))
    nonce = secrets.token_hex(16)
    os.makedirs(_nonces_dir(), exist_ok=True)
    _prune_nonces()
    p = _nonce_file(nonce)
    with open(p, 'w') as fh:
        json.dump(rec, fh)
    os.chmod(p, 0o600)
    # the ledger is the registry of truth — issued here, consumed at
    # spend; approvals verify events, not file contents (A5/A7)
    G.append_nonce_event(event='issued', nonce=nonce, wave=wave,
                         pipeline=pd, inputs=ih)
    return nonce, rec


def _prune_nonces():
    """Registry hygiene: used/expired nonce files are deleted at every
    issue so the registry never accumulates residue (F-28)."""
    d = _nonces_dir()
    if not os.path.isdir(d):
        return
    now = datetime.datetime.now()
    for fn in os.listdir(d):
        fp = os.path.join(d, fn)
        try:
            rec = json.load(open(fp))
            exp = rec.get('expires')
            dead = rec.get('used') or (
                exp and now > datetime.datetime.fromisoformat(exp))
            if dead:
                os.remove(fp)
        except Exception:
            os.remove(fp)


def consume_nonce(nonce):
    """Return the nonce record iff valid+unused. Consumption DELETES
    the nonce file and appends a signed 'consumed' event to the
    ledger — restoring used:false on the file replays nothing because
    the ledger already says spent, and a restored file never
    re-verifies (verify_consumed_nonce reads events only)."""
    p = _nonce_file(nonce)
    if not p or not os.path.isfile(p):
        return None, 'unknown nonce'
    try:
        rec = json.load(open(p))
    except Exception:
        return None, 'corrupt nonce'
    if rec.get('used'):
        return None, 'nonce already used'
    key = G.op_key()
    if not key or rec.get('sig') != G._sig(
            {k: v for k, v in rec.items() if k != 'sig'}, key):
        return None, ('nonce not service-issued (bad signature — the '
                      'registry only honours its own)')
    exp = rec.get('expires')
    if exp and datetime.datetime.now() > \
            datetime.datetime.fromisoformat(exp):
        return None, 'nonce expired (30 min) — mint a fresh one'
    # ledger check: a file consumed then restored (used flipped back)
    # is refused before it can spend again
    spent = [e for e in G.read_nonce_ledger()
             if e.get('nonce') == nonce
             and e.get('event') == 'consumed']
    if spent:
        return None, ('nonce already consumed (ledger says spent — '
                      'a restored file cannot replay)')
    os.remove(p)
    G.append_nonce_event(event='consumed', nonce=nonce,
                         wave=rec.get('wave'),
                         pipeline=rec.get('pipeline'))
    return rec, None


def _design_options(ctx, wave):
    """The design ids the wave's rendered pickers offer — a click can
    only bind to one of them (F-27)."""
    blocks = {}
    rels = (['preview/layouts.html'] if wave == 'w3'
            else ['preview/variants.html', 'preview/fine.html'])
    for rel in rels:
        cand = ctx.find(rel)
        if not cand:
            continue
        blocks.update(G._design_blocks(
            open(cand, encoding='utf-8', errors='replace').read()))
    return blocks


def record_approval(wave, pipeline, nonce=None, design=None,
                    chat=None):
    """Spend a picker nonce + record the operator's signed pick.
    ONLY the /approve handler calls this — a nonce (minted when the
    picker page was served) and a design from the served HTML are
    both required; there is no nonce-free path. Returns
    (exit_code, text)."""
    ctx = G.Ctx(pipeline)
    ctx.wave = wave
    if wave not in ORDER:
        return 2, f'unknown wave {wave}'
    if wave not in G.APPROVABLE:
        return 2, (f'{wave} is not an approval point '
                   f'(approvable: {sorted(G.APPROVABLE)})')
    if not nonce:
        return 1, ('approve REFUSED: no nonce — pick records come '
                   'only from a served picker page (the page\'s '
                   'click JS spends the nonce it was served with)')
    nrec, err = consume_nonce(nonce)
    if err:
        return 1, f'approve REFUSED: {err}'
    if ctx.dir != nrec['pipeline'] or nrec['wave'] != wave:
        return 1, 'approve REFUSED: nonce bound to a different ' \
                  'wave/pipeline'
    if nrec['inputs'] != G._h(G.input_hashes_for(ctx, wave)):
        return 1, 'approve REFUSED: inputs changed since the nonce ' \
                  'was minted — re-render the picker'
    # the picked design must be a real option in the rendered
    # picker — free text can never bind (F-27)
    if not design:
        return 1, ('approve REFUSED: no design — a pick is a card '
                   'click, not free text')
    if design not in _design_options(ctx, wave):
        return 1, (f'approve REFUSED: design "{design}" is not an '
                   'option in the rendered picker — the pick '
                   'binds to rendered output, not a name')
    fails = G.ancestry_fails(ctx) if wave != 'w0' else []
    if fails:
        return 1, 'approve REFUSED — earlier waves are not clean: ' \
                  + '; '.join(fails[:4])
    g = G.load_gates(ctx)
    if not (g.get(wave) or {}).get('pass'):
        return 1, f'approve REFUSED: {wave} has not passed'
    # the record binds this pipeline run (X.2/X.3) — an approval
    # captured inside one run cannot be replayed under another
    run_tok = None
    try:
        run_tok = json.load(open(os.path.join(
            ctx.dir, 'RUN.json'))).get('token_sig')
    except Exception:
        pass
    try:
        body = G.approval_body(ctx, wave, by='operator-service',
                               design=design, nonce=nonce, chat=chat,
                               run=run_tok)
    except (AttributeError, TypeError):
        body = _approval_body(ctx, wave, design=design, nonce=nonce,
                              chat=chat, run=run_tok)
    if wave == 'w4':
        # pin the signed pick's knob vector IN the signed record —
        # fine-round regens rebuild FINE-VARIANTS.json around the new
        # pick, so resolving the id at emit time could project a look
        # the operator never signed. The emit prefers this.
        deltas = G.look_deltas(ctx, design)
        if deltas is None:
            return 1, (f'approve REFUSED: design "{design}" has no '
                       'declared look vector — the pick binds '
                       'rendered output, not a name')
        body['look_deltas'] = deltas
    import approval_key as AK
    body['sig'] = AK.sign_body(body, _seed())
    # w4 locks the DNA map to v1 — the look lock, once, here, and
    # only for a signed pick
    if wave == 'w4' and G.lock_dna_map(ctx):
        pass
    rec = _write_approval(ctx, wave, body)
    locked = ' · DNA locked to v1' if wave == 'w4' else ''
    return 0, (f'approved {wave} · pick {design} · {rec["inputs"]} '
               f'· {rec["dna"]}{locked}')


def confirm_approval(wave, pipeline):
    """Re-sign an EXISTING verified pick against the wave's current
    inputs — the projection rebind (after layout_pick re-plans for
    the pick, the wave's recorded inputs legitimately changed and
    the SAME pick is re-signed; the design can never change here).
    /confirm spends page-token only — there is nothing new for an
    operator to decide."""
    ctx = G.Ctx(pipeline)
    ctx.wave = wave
    if wave not in G.APPROVABLE:
        return 2, f'{wave} is not an approval point'
    allr = G.read_approvals(ctx) or {}
    rec = allr.get(wave)
    import approval_key as AK
    ok, why = AK.verify_approval(rec or {})
    if not ok:
        return 1, (f'confirm REFUSED: no verified {wave} pick to '
                   f're-bind ({why}) — the pick is the operator\'s '
                   'click first')
    cur = G._h(G.input_hashes_for(ctx, wave))
    # the record must also be bound to THIS run (a re-run mints a new
    # token) — "same inputs" is not enough for X.3 to accept it
    try:
        run_tok = json.load(open(os.path.join(
            ctx.dir, 'RUN.json'))).get('token_sig')
    except Exception:
        run_tok = None
    if rec.get('inputs') == cur and \
            (not run_tok or str(rec.get('run')) == str(run_tok)):
        return 0, f'{wave} pick already bound to current inputs'
    body = dict(rec)
    body.pop('sig', None)
    body['inputs'] = cur
    sl = G.dna_slices(G.dna_map(ctx) or {})
    body['dna'] = {'core': sl.get('core'),
                   'structure': sl.get('structure')}
    body['ts'] = datetime.datetime.now().isoformat(
        timespec='seconds')
    try:
        body['run'] = json.load(open(os.path.join(
            ctx.dir, 'RUN.json'))).get('token_sig')
    except Exception:
        body.pop('run', None)
    body['sig'] = AK.sign_body(body, _seed())
    out = _write_approval(ctx, wave, body)
    return 0, (f'confirmed {wave} · pick {out.get("design")} re-bound '
               f'to {out["inputs"]}')


_SEED = None


def _seed():
    """The service's Ed25519 seed — auto-provisioned at startup.

    OS-user separation is NOT achievable inside this repo: this seed,
    the operator key (~/.web-factory/operator.key) and RUN.json are all
    readable by the same OS user the agent runs as, so nothing in-repo
    stops a local forger. True separation requires serving under a
    different OS user (or a remote service) — that boundary is
    deployment configuration, not code, and is deliberately not
    simulated here."""
    global _SEED
    if _SEED is None:
        import approval_key as AK
        _pub, _SEED = AK.ensure_signing_key()
    return _SEED


def _approval_body(ctx, wave, design=None, nonce=None, chat=None,
                   run=None):
    """Fallback body builder matching gate.approval_body — used only
    if an older gate.py lacks it. Field set is part of the X.3
    contract with approval_key.verify_approval."""
    sl = G.dna_slices(G.dna_map(ctx) or {})
    rec = {'wave': wave,
           'inputs': G._h(G.input_hashes_for(ctx, wave)),
           'dna': {'core': sl.get('core'),
                   'structure': sl.get('structure')},
           'by': 'operator-service',
           'ts': datetime.datetime.now().isoformat(
               timespec='seconds')}
    if design:
        rec['design'] = str(design)[:40]
    if nonce:
        rec['nonce'] = nonce
    if chat:
        rec['chat'] = str(chat)[:300]
    if run:
        rec['run'] = run
    return rec


def _write_approval(ctx, wave, rec):
    """Persist the signed record — the file write is machinery; the
    signature already in `rec` is the operator-pick authority."""
    import inspect
    if 'rec' in inspect.signature(G.write_approval).parameters:
        return G.write_approval(ctx, wave, rec=rec)
    p = G.approvals_path(ctx)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    allr = G.read_approvals(ctx)
    allr[wave] = rec
    with open(p, 'w') as fh:
        json.dump(allr, fh, indent=2, sort_keys=True)
    return rec


def _candidates_file(pipeline=None):
    if pipeline:
        p = os.path.join(os.path.abspath(pipeline), 'CANDIDATES.json')
        if os.path.isfile(p):
            return p
    return os.path.join(G.DESIGN_DIR, 'patterns', 'data', 'operator',
                        'candidates.json')


def record_candidate_decision(site, decision, pipeline=None):
    """Flip a candidate's status — approved joins the endorsed tier,
    rejected is excluded (contrast corpus only). The record is
    service-signed; a designer file edit is unverifiable."""
    if decision not in ('approved', 'rejected'):
        return 1, 'decision must be approved|rejected'
    p = _candidates_file(pipeline)
    if not os.path.isfile(p):
        return 1, f'no candidate registry at {p}'
    try:
        data = json.load(open(p))
    except Exception:
        return 1, 'candidate registry unparseable'
    rows = data if isinstance(data, list) else \
        data.get('candidates') or []
    hit = None
    for c in rows:
        if isinstance(c, dict) and str(
                c.get('url') or c.get('site') or c.get('id')) == site:
            hit = c
            break
    if hit is None and pipeline:
        # the registry emits only the picker's top slice — a decision
        # landing on a deeper bank candidate materializes its row on
        # demand instead of being refused (candidates_emit keeps the
        # full bank index out of CANDIDATES.json)
        import candidates_emit
        row = candidates_emit.materialize(
            candidates_emit._sources_root(), site)
        if row is not None:
            if isinstance(data, list):
                data.append(row)
            else:
                data.setdefault('candidates', []).append(row)
            hit = row
    if hit is None:
        return 1, f'{site} is not a registered candidate'
    if hit.get('status') not in (None, 'pending'):
        return 1, f'{site} already decided ({hit["status"]})'
    hit['status'] = decision
    hit['decided_ts'] = datetime.datetime.now().isoformat(
        timespec='seconds')
    body = {'site': site, 'decision': decision,
            'ts': hit['decided_ts']}
    hit['decision_sig'] = G._sig(body, G.op_key(create=True))
    with open(p, 'w') as fh:
        json.dump(data, fh, indent=1)
    return 0, (f'{site} → {decision} '
               f'({"endorsed tier" if decision == "approved" else "excluded — contrast corpus"})')


def _page_token():
    """The per-page secret picker JS sends on mutation calls —
    minted once per service run, served to same-origin callers at
    GET /page-token, required as X-WF-Page-Token on every POST."""
    global _TOKEN
    if _TOKEN is None:
        _TOKEN = secrets.token_hex(16)
    return _TOKEN


_TOKEN = None


def _picker_page(pipeline, wave, kind):
    """Serve the wave's rendered picker HTML with the click-to-pick
    script injected — the page gets a fresh nonce bound to
    wave+pipeline+current inputs, the page token, and a handler
    that POSTs /approve on a card click. Returns (code, bytes,
    error_text)."""
    global _LAST_PD
    ctx0 = G.Ctx(pipeline)
    pd = ctx0.dir
    _LAST_PD = pd
    rel = _PICKER_FILES.get((wave, kind))
    if not rel:
        return 404, b'', f'no {kind} picker for {wave}'
    ctx = G.Ctx(pd)
    fp = ctx.find(rel) or os.path.join(pd, rel)
    if not os.path.isfile(fp):
        return 404, b'', (f'{rel} not found — the pipeline renders '
                          f'the picker before it stops for a pick')
    html = open(fp, encoding='utf-8', errors='replace').read()
    if wave == 'w1':
        # candidate review: decisions POST /promote signed into the
        # row — not a wave pick, so no nonce; the injected script
        # carries just the page token + pipeline binding
        banner = (
            '<div id="wf-banner" style="position:fixed;left:0;right:0;'
            'bottom:0;z-index:99999;padding:10px 16px;background:'
            '#0e1513;color:#e8f2ee;font:14px/1.45 system-ui;'
            'box-shadow:0 -1px 6px #0004">approve or reject each '
            'candidate — decisions are signed into '
            'CANDIDATES.json</div>'
            '<style>body{padding-bottom:64px}</style>')
        meta = (f'<meta name="wf-promote" data-pipeline="{pd}" '
                f'data-token="{_page_token()}">')
        script = """
<script>
(function() {
  var meta = document.querySelector('meta[name="wf-promote"]');
  document.querySelectorAll('form[action="/promote"]').forEach(
    function(f) {
      f.addEventListener('submit', function(e) {
        e.preventDefault();
        var decision = e.submitter ? e.submitter.value : '';
        var site = f.querySelector('input[name="site"]').value;
        var stat = f.parentElement.querySelector('.pickstat');
        fetch('/promote', {
          method: 'POST',
          headers: {'Content-Type': 'application/json',
                    'X-WF-Page-Token': meta.dataset.token},
          body: JSON.stringify({site: site, decision: decision,
            pipeline: meta.dataset.pipeline})
        }).then(function(r) { return r.json(); }).then(function(j) {
          if (j.ok || j.message || j.error === undefined) {
            var card = f.closest('article');
            if (stat) stat.textContent = ' ' + decision;
            if (card) card.style.outline = '3px solid ' +
              (decision === 'approved' ? '#00B488' : '#7a1f1f');
            f.querySelectorAll('button').forEach(
              function(b) { b.disabled = true; });
          } else if (stat) {
            stat.textContent = ' ' + (j.error || 'refused');
          }
        }).catch(function() {
          if (stat) stat.textContent = ' request failed';
        });
      });
    });
})();
</script>"""
        inject = banner + meta + script
        m = re.search(r'</body\s*>', html, re.I)
        html = (html[:m.start()] + inject + html[m.start():]
                if m else html + inject)
        return 200, html.encode('utf-8'), ''
    nonce, err = issue_nonce(pd, wave)
    if not nonce:
        return 400, b'', f'cannot mint a pick nonce: {err}'
    # record which picker file the nonce's page served — /approve
    # re-derives the option set from disk anyway
    options = sorted(_design_options(ctx, wave))
    banner = (
        '<div id="wf-banner" style="position:fixed;left:0;right:0;'
        'bottom:0;z-index:99999;padding:10px 16px;background:#0e1513;'
        'color:#e8f2ee;font:14px/1.45 system-ui;box-shadow:0 -1px '
        '6px #0004">pick a card — press <b>Pick this layout</b> / '
        '<b>Pick this look</b> below the card you want. Your click '
        'is recorded and signed; the pipeline continues after it.</div>'
        '<style>body{padding-bottom:64px}</style>')
    meta = (f'<meta name="wf-pick" data-wave="{wave}" '
            f'data-pipeline="{pd}" data-nonce="{nonce}" '
            f'data-token="{_page_token()}">')
    script = f"""
<script>
(function() {{
  var meta = document.querySelector('meta[name="wf-pick"]');
  var OPTIONS = {json.dumps(options)};
  // the rendered picker's OWN pick control is button.pick[data-d]
  // ("Pick this layout" / "Pick this look"). Only that control (or,
  // on an old page with no pick row, the card's pick affordance)
  // records a pick — clicking a card body, a viewport-size button or
  // a tab must never approve anything.
  var HAS_CTRL = !!document.querySelector('.pick[data-d],[data-pick]');
  function pickOf(el) {{
    var ctl = el.closest('.pick[data-d],[data-pick]');
    var card = ctl ? ctl.closest('article[id],[data-pane],[data-variant],'
                                 + '[data-design]') : null;
    if (!ctl && !HAS_CTRL) {{
      // legacy page: the card itself is the pick target
      card = el.closest('article[id],[data-pane],[data-variant],'
                        + '[data-design]');
    }}
    if (!card) return null;
    var cand = (ctl && (ctl.getAttribute('data-d')
      || ctl.getAttribute('data-pick'))) || card.id
      || card.getAttribute('data-pane')
      || card.getAttribute('data-variant')
      || card.getAttribute('data-design');
    return OPTIONS.indexOf(cand) >= 0 ? {{id: cand, card: card}} : null;
  }}
  document.addEventListener('click', function(e) {{
    var hit = pickOf(e.target);
    if (!hit || hit.card.dataset.wfDone) return;
    fetch('/approve', {{
      method: 'POST',
      headers: {{'Content-Type': 'application/json',
                'X-WF-Page-Token': meta.dataset.token}},
      body: JSON.stringify({{wave: meta.dataset.wave,
        pipeline: meta.dataset.pipeline,
        nonce: meta.dataset.nonce, design: hit.id}})
    }}).then(function(r) {{ return r.json(); }}).then(function(j) {{
      var b = document.getElementById('wf-banner');
      if (j.ok) {{
        b.textContent = '\\u2713 pick ' + hit.id + ' recorded — '
          + 'return to the pipeline (or keep it running with --wait)';
        b.style.background = '#166F64';
        hit.card.dataset.wfDone = '1';
        hit.card.style.outline = '3px solid #00B488';
        document.querySelectorAll('.pick[data-d]').forEach(
          function(x) {{ if (!hit.card.contains(x)) {{
            x.disabled = true; x.style.opacity = '.35'; }} }});
      }} else {{
        b.textContent = '\\u2717 ' + (j.message || 'refused');
        b.style.background = '#7a1f1f';
      }}
    }}).catch(function(err) {{
      document.getElementById('wf-banner').textContent =
        'service error: ' + err;
    }});
  }});
}})();
</script>"""
    inject = banner + meta + script
    m = re.search(r'</body\s*>', html, re.I)
    html = (html[:m.start()] + inject + html[m.start():]
            if m else html + inject)
    # real-build pickers embed the astro-built pages in iframes whose
    # src is the on-disk relative path (../site/dist/preview/…) — the
    # service serves them back through /built/<pipeline-rel-path>.
    html = html.replace('src="../site/',
                        'src="/built/' +
                        urllib.parse.quote(os.path.join(
                            pd, 'site') + '/', safe=''))
    return 200, html.encode('utf-8'), ''


def _handler():
    from http.server import BaseHTTPRequestHandler

    class H(BaseHTTPRequestHandler):
        def _post(self):
            n = int(self.headers.get('Content-Length') or 0)
            try:
                body = json.loads(self.rfile.read(n) or b'{}')
            except Exception:
                body = {}
            return body

        def _send(self, code, obj):
            b = json.dumps(obj).encode()
            self.send_response(code)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', str(len(b)))
            self.end_headers()
            self.wfile.write(b)

        def _send_html(self, code, b):
            self.send_response(code)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Length', str(len(b)))
            self.send_header('Cache-Control', 'no-store')
            self.end_headers()
            self.wfile.write(b)

        def _loopback(self):
            host = (self.headers.get('Host') or '').split(':')[0]
            return host in ('127.0.0.1', 'localhost', '::1')

        def _guard(self):
            """A10 — a local, same-origin, JSON API: cross-origin
            browser POSTs are refused outright, and every mutation
            must carry the per-page token (served only to loopback
            callers at /page-token, where SOP keeps cross-origin
            reads away)."""
            if not self._loopback():
                self._send(403, {'error': 'host not loopback'})
                return False
            origin = self.headers.get('Origin')
            if origin is not None and origin != 'null' and \
                    not re.match(
                        r'https?://(127\.0\.0\.1|localhost|::1)(:\d+)?$',
                        origin):
                self._send(403, {'error': 'cross-origin refused'})
                return False
            if 'application/json' not in \
                    (self.headers.get('Content-Type') or ''):
                self._send(415, {'error': 'application/json only'})
                return False
            if self.headers.get('X-WF-Page-Token') != _page_token():
                self._send(403, {'error': 'missing/invalid page token '
                                 '(GET /page-token from the picker '
                                 'server origin first)'})
                return False
            return True

        def do_GET(self):
            if not self._loopback():
                self._send(404, {'error': 'not found'})
                return
            if self.path == '/health':
                # svc tag + source sha — a stale build still bound to
                # the port fails the sha check and gets restarted
                self._send(200, {'svc': VERSION, 'ok': True,
                                 'sha': _CODE_SHA})
                return
            if self.path == '/page-token':
                self._send(200, {'token': _page_token()})
                return
            q = urllib.parse.urlsplit(self.path)
            if q.path in ('/app', '/app-data'):
                import picker_app
                global _LAST_PD
                args = dict(urllib.parse.parse_qsl(q.query))
                if args.get('pipeline'):
                    _LAST_PD = G.Ctx(args['pipeline']).dir
                if q.path == '/app':
                    self._send_html(200, picker_app.app_shell())
                    return
                if _LAST_PD:
                    data, err = picker_app.app_data(_LAST_PD)
                    self._send(200 if data else 404,
                               data or {'error': err})
                else:
                    self._send(400, {'error': 'no pipeline'})
                return
            if q.path == '/picker':
                args = dict(urllib.parse.parse_qsl(q.query))
                wave = args.get('wave', 'w3')
                kind = args.get('kind') or (
                    'layouts' if wave == 'w3' else 'variants')
                code, html, err = _picker_page(
                    args.get('pipeline', ''), wave, kind)
                if html:
                    self._send_html(code, html)
                else:
                    self._send(code, {'error': err})
                return
            if q.path.startswith('/frame/'):
                # a built page bound under a vibe family's token
                # bundle — server-side var overrides, no rebuild
                import picker_app
                fam, _, qpath = q.path[len('/frame/'):].partition('/')
                fp = urllib.parse.unquote(qpath)
                fp = os.path.normpath('/' + fp.lstrip('/'))
                _fpd = fp.split('/site/', 1)[0] if '/site/' in fp \
                    else ''
                F = picker_app.VIBE_FAMILIES.get(fam) or \
                    picker_app.donor_family(_fpd, fam) or \
                    picker_app.remix_family(fam)
                if F and re.search(r'/site/', fp) and \
                        not os.path.isfile(fp):
                    _ensure_preview(fp)
                if not (F and os.path.isfile(fp) and
                        re.search(r'/site/', fp) and
                        fp.lower().endswith(('.html', '.htm'))):
                    self._send(404, {'error': 'not found'})
                    return
                txt = open(fp, encoding='utf-8',
                           errors='replace').read()
                css = picker_app._fam_css(F)
                if (F.get('theme') == 'dark' and
                        'theme=' not in q.query):
                    txt = re.sub(
                        r'<html\b', '<html data-theme="dark" '
                        'class="dark"', txt, count=1)
                txt = txt.replace(
                    '</head>',
                    '<style>' + css + '</style></head>', 1)
                txt = _rewrite_assets(fp, txt)
                self._send_html(200, txt.encode('utf-8'))
                return
            if q.path.startswith('/built/'):
                # serve the pipeline's built pages + assets to the
                # picker's iframes — path is the quoted absolute file
                # under the served pipeline's site tree
                fp = urllib.parse.unquote(q.path[len('/built/'):])
                fp = os.path.normpath('/' + fp.lstrip('/'))
                if re.search(r'/site/', fp) and \
                        not os.path.isfile(fp):
                    _ensure_preview(fp)
                if not (os.path.isfile(fp) and
                        re.search(r'/site/', fp)):
                    self._send(404, {'error': 'not found'})
                    return
                if fp.lower().endswith(('.html', '.htm')):
                    txt = open(fp, encoding='utf-8',
                               errors='replace').read()
                    self._send_html(200, _rewrite_assets(
                        fp, txt).encode('utf-8'))
                    return
                ext = os.path.splitext(fp)[1].lower()
                mime = {'.html': 'text/html; charset=utf-8',
                        '.css': 'text/css', '.js': 'text/javascript',
                        '.svg': 'image/svg+xml',
                        '.png': 'image/png', '.jpg': 'image/jpeg',
                        '.jpeg': 'image/jpeg', '.webp': 'image/webp',
                        '.woff': 'font/woff', '.woff2': 'font/woff2',
                        '.avif': 'image/avif'}.get(ext,
                                                  'application/octet-stream')
                body = open(fp, 'rb').read()
                self.send_response(200)
                self.send_header('Content-Type', mime)
                self.send_header('Content-Length', str(len(body)))
                self.send_header('Cache-Control', 'no-store')
                self.end_headers()
                self.wfile.write(body)
                return
            if _LAST_PD:
                # root-absolute asset URL inside a /built page —
                # resolve under that pipeline's site/dist
                fp = os.path.normpath(os.path.join(
                    _LAST_PD, 'site', 'dist',
                    q.path.lstrip('/')))
                dist = os.path.join(_LAST_PD, 'site', 'dist')
                if fp.startswith(dist + os.sep) and \
                        os.path.isfile(fp):
                    ext = os.path.splitext(fp)[1].lower()
                    mime = {'.html': 'text/html; charset=utf-8',
                            '.css': 'text/css',
                            '.js': 'text/javascript',
                            '.svg': 'image/svg+xml',
                            '.png': 'image/png',
                            '.jpg': 'image/jpeg',
                            '.jpeg': 'image/jpeg',
                            '.webp': 'image/webp',
                            '.woff': 'font/woff',
                            '.woff2': 'font/woff2',
                            '.avif': 'image/avif'}.get(
                                ext, 'application/octet-stream')
                    body = open(fp, 'rb').read()
                    self.send_response(200)
                    self.send_header('Content-Type', mime)
                    self.send_header('Content-Length',
                                     str(len(body)))
                    self.send_header('Cache-Control', 'no-store')
                    self.end_headers()
                    self.wfile.write(body)
                    return
            self._send(404, {'error': 'not found'})

        def do_POST(self):
            if not self._guard():
                return
            body = self._post()
            if self.path == '/promote':
                code, txt = record_candidate_decision(
                    body.get('site', ''), body.get('decision', ''),
                    pipeline=body.get('pipeline'))
                self._send(200 if code == 0 else 400,
                           {'ok': code == 0, 'message': txt})
            elif self.path == '/nonce':
                nonce, rec = issue_nonce(body.get('pipeline', ''),
                                         body.get('wave', ''))
                self._send(200 if nonce else 400,
                           {'nonce': nonce, 'error': None if nonce
                            else rec})
            elif self.path == '/approve':
                code, txt = record_approval(
                    body.get('wave', ''), body.get('pipeline', ''),
                    nonce=body.get('nonce'), design=body.get('design'),
                    chat=body.get('chat'))
                self._send(200 if code == 0 else 400,
                           {'ok': code == 0, 'message': txt})
            elif self.path == '/element-pick':
                import picker_app
                code, txt = picker_app.record_element_pick(
                    body.get('pipeline', ''), body.get('element', ''),
                    body.get('variant', ''), body.get('bundle'))
            elif self.path == '/vibe-resolve':
                import picker_app
                self._send(200, picker_app.vibe_resolve(
                    body.get('pipeline', ''),
                    body.get('genes') or {}))
                self._send(200 if code == 0 else 400,
                           {'ok': code == 0, 'message': txt})
            elif self.path == '/save-system':
                import picker_app
                code, txt, rec = picker_app.save_system(
                    body.get('pipeline', ''), body.get('name', ''),
                    body.get('mode'))
                self._send(200 if code == 0 else 400,
                           {'ok': code == 0, 'message': txt,
                            'system': rec if code == 0 else None})
            elif self.path == '/ingest':
                import picker_app
                res = picker_app.run_ingest(
                    body.get('pipeline', ''),
                    body.get('url', ''), body.get('html', ''),
                    body.get('css', ''))
                self._send(200, res)
            elif self.path == '/ingest-donor':
                import picker_app
                code, txt, rec = picker_app.ingest_donor(
                    body.get('pipeline', ''), body.get('name', ''),
                    body.get('data'))
                self._send(200 if code == 0 else 400,
                           {'ok': code == 0, 'message': txt,
                            'donor': rec if code == 0 else None})
            elif self.path == '/remix':
                import picker_app
                self._send(200, picker_app.remix(
                    body.get('pipeline', ''), body.get('spec') or {}))
            elif self.path == '/remix-save':
                import picker_app
                code, txt, rec = picker_app.remix_save(
                    body.get('pipeline', ''), body.get('name', ''),
                    body.get('spec') or {})
                self._send(200 if code == 0 else 400,
                           {'ok': code == 0, 'message': txt,
                            'remix': rec if code == 0 else None})
            elif self.path == '/confirm':
                code, txt = confirm_approval(body.get('wave', ''),
                                             body.get('pipeline', ''))
                self._send(200 if code == 0 else 400,
                           {'ok': code == 0, 'message': txt})
            else:
                self._send(404, {'error': 'unknown path'})

        def log_message(self, *a):
            pass
    return H


def serve(port):
    """Boot the pick surface: provision the signing key (first
    start only), publish its public half, then serve loopback."""
    from http.server import ThreadingHTTPServer
    import approval_key as AK
    pub, _ = AK.ensure_signing_key()
    print(f'approve_service on 127.0.0.1:{port} — pick surface '
          f'(key pub {pub[:16]}…)')
    # threaded — a held connection must not starve the app's
    # concurrent preview requests
    ThreadingHTTPServer(('127.0.0.1', port),
                        _handler()).serve_forever()


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=
                                 argparse.RawDescriptionHelpFormatter)
    ap.add_argument('cmd', choices=['serve', 'promote'])
    ap.add_argument('pipeline', nargs='?')
    ap.add_argument('--port', type=int, default=PORT)
    ap.add_argument('--site')
    ap.add_argument('--decision', choices=['approved', 'rejected'])
    a = ap.parse_args(argv)
    if a.cmd == 'serve':
        serve(a.port)
        return 0
    # candidate decisions stay operator-side interactive: the
    # picker flow never calls promote headless
    if not sys.stdin.isatty():
        print('promote REFUSED: interactive terminal or the picker '
              'service only')
        return 1
    code, txt = record_candidate_decision(a.site, a.decision,
                                          pipeline=a.pipeline)
    print(txt)
    return code


if __name__ == '__main__':
    sys.exit(main())
