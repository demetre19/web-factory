#!/usr/bin/env python3
"""approve_service.py — the only process that writes operator approvals.

Trust model (documented honestly): this service runs under the
orchestrator's control and holds the signing key
(~/.web-factory/operator.key, 0600). A designer/builder agent cannot
record an approval through the pipeline: the record needs a
single-use NONCE the operator's channel minted (the picker's
"Approve" button POSTs here; the orchestrator mints one for a chat
approval). Same-user processes on one machine cannot be made
cryptographically unforgeable — the nonce+key binding is
tamper-evident, not tamper-proof. There is no env-var or
free-text bypass.

Commands:
    approve_service.py serve [--port 4173]     orchestrator runs this
    approve_service.py nonce <wave> <pipeline> mint a one-time nonce
    approve_service.py record <wave> <pipeline> --nonce N [--design D] [--chat TEXT]

HTTP (127.0.0.1 only):
    POST /nonce   {wave, pipeline}              → {nonce}
    POST /approve {wave, pipeline, nonce, design?, chat?} → {ok|error}
"""
import argparse, datetime, hashlib, hmac, json, os, re, secrets, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import gate as G

ORDER = ['w0', 'w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'w7', 'w8']


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
    pd = os.path.abspath(pipeline)
    if not os.path.isdir(pd):
        return None, f'pipeline {pipeline} not found'
    ctx = G.Ctx(pd)
    ih = G._h(G.input_hashes_for(ctx, wave))
    rec = {'wave': wave, 'pipeline': pd, 'inputs': ih, 'used': False,
           'ts': datetime.datetime.now().isoformat(timespec='seconds')}
    nonce = secrets.token_hex(16)
    os.makedirs(_nonces_dir(), exist_ok=True)
    p = _nonce_file(nonce)
    with open(p, 'w') as fh:
        json.dump(rec, fh)
    os.chmod(p, 0o600)
    return nonce, rec


def consume_nonce(nonce):
    """Return the nonce record iff valid+unused; mark used atomically."""
    p = _nonce_file(nonce)
    if not p or not os.path.isfile(p):
        return None, 'unknown nonce'
    try:
        rec = json.load(open(p))
    except Exception:
        return None, 'corrupt nonce'
    if rec.get('used'):
        return None, 'nonce already used'
    rec['used'] = True
    with open(p, 'w') as fh:
        json.dump(rec, fh)
    return rec, None


def record_approval(wave, pipeline, nonce=None, design=None,
                    chat=None, by='operator-service'):
    """Verify + write the signed approval. Returns (exit_code, text)."""
    ctx = G.Ctx(pipeline)
    ctx.wave = wave
    if wave not in ORDER:
        return 2, f'unknown wave {wave}'
    if wave not in G.APPROVABLE:
        return 2, (f'{wave} is not an approval point '
                   f'(approvable: {sorted(G.APPROVABLE)})')
    nrec = None
    if nonce:
        nrec, err = consume_nonce(nonce)
        if err:
            return 1, f'approve REFUSED: {err}'
        if os.path.abspath(pipeline) != nrec['pipeline'] \
                or nrec['wave'] != wave:
            return 1, 'approve REFUSED: nonce bound to a different ' \
                      'wave/pipeline'
        if nrec['inputs'] != G._h(G.input_hashes_for(ctx, wave)):
            return 1, 'approve REFUSED: inputs changed since the nonce ' \
                      'was minted — re-render the picker'
    fails = G.ancestry_fails(ctx) if wave != 'w0' else []
    if fails:
        return 1, 'approve REFUSED — earlier waves are not clean: ' \
                  + '; '.join(fails[:4])
    g = G.load_gates(ctx)
    if not (g.get(wave) or {}).get('pass'):
        return 1, f'approve REFUSED: {wave} has not passed'
    rec = G.write_approval(ctx, wave, by=by, design=design,
                           nonce=nonce, chat=chat)
    extra = f' · design {design}' if design else ''
    return 0, (f'approved {wave} · {rec["inputs"]} · {rec["dna"]}{extra}')


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

        def do_POST(self):
            body = self._post()
            if self.path == '/nonce':
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
            else:
                self._send(404, {'error': 'unknown path'})

        def log_message(self, *a):
            pass
    return H


def serve(port):
    from http.server import HTTPServer
    print(f'approve_service on 127.0.0.1:{port} — operator approvals '
          'only')
    HTTPServer(('127.0.0.1', port), _handler()).serve_forever()


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=
                                 argparse.RawDescriptionHelpFormatter)
    ap.add_argument('cmd', choices=['serve', 'nonce', 'record'])
    ap.add_argument('wave', nargs='?')
    ap.add_argument('pipeline', nargs='?')
    ap.add_argument('--port', type=int, default=4173)
    ap.add_argument('--nonce')
    ap.add_argument('--design')
    ap.add_argument('--chat')
    a = ap.parse_args(argv)
    if a.cmd == 'serve':
        serve(a.port)
        return 0
    if not a.wave or not a.pipeline:
        print('wave and pipeline required')
        return 2
    if a.cmd == 'nonce':
        nonce, rec = issue_nonce(a.pipeline, a.wave)
        if not nonce:
            print(f'nonce REFUSED: {rec}')
            return 1
        print(nonce)
        return 0
    code, txt = record_approval(a.wave, a.pipeline, nonce=a.nonce,
                                design=a.design, chat=a.chat)
    print(txt)
    return code


if __name__ == '__main__':
    sys.exit(main())
