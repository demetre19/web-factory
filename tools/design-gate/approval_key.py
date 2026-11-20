#!/usr/bin/env python3
"""approval_key.py — operator pick signing (U.6, automated model).

The human's only authority acts are two CLICKS in the served
picker page (layout w3, look w4). The approve service signs those
records with an Ed25519 key it owns:

    signing seed : ~/.config/web-factory/approval-signing.key
                   (32-byte hex, mode 0600, auto-created on first
                   service start — no keygen step for the operator)
    public key   : pinned in this repo at approval_pubkey.json
                   (PUBKEY_PATH) AND mirrored by the service at
                   ~/.config/web-factory/approval-public.key so
                   sandboxed test environments can verify too.

verify_approval(rec) accepts a signature under EITHER public key —
the repo pin is the production anchor (RUN.json pins its sha256
mid-run); the HOME-resident mirror exists so subprocesses under a
fixture HOME can verify a provisioned pair.

Honest limits (documented in MACHINERY-FIX-PLAN §6.4): the seed
file is same-uid readable, so a record an agent produces with it
is indistinguishable to verify_approval — records are
tamper-evident, not tamper-proof. The REAL boundary is the
harness tool fence: agents must not read the seed file nor POST
to the service's /approve. The service additionally binds each
record to a single-use nonce minted when the picker page is
served (page-token + options-bound), so a record always traces to
a rendered click surface.

Functions Gates calls:
    verify_approval(rec) -> (ok: bool, reason: str)
    ed25519_verify(pub_hex, sig_hex, msg: bytes) -> bool

Functions only the approve service uses:
    ensure_signing_key()  -> (pub_hex, seed)  (auto-provision)
    sign_body(rec, seed)  -> sig_hex
    generate()            -> (seed, pub_hex)  (fixtures/tests)

Ed25519: pure-Python RFC 8032 reference implementation (the
`cryptography` package is not installed; formulas follow
ed25519.py in RFC 8032 §6). ~0.1 s/op — fine for single picks.
"""
import hashlib
import json
import os
import secrets

HERE = os.path.dirname(os.path.abspath(__file__))

# The pinned public verification key in this repo. RUN.json pins
# its sha256 (approval_pubkey_sha256) so a mid-run swap fails
# check_run_pin. The selftest monkeypatches this attr — never an
# env var (env overrides were the F-03 bypass class).
PUBKEY_PATH = os.path.join(HERE, 'approval_pubkey.json')

_CONFIG_DIR = os.path.join('~', '.config', 'web-factory')


def signing_key_path():
    return os.path.expanduser(
        os.path.join(_CONFIG_DIR, 'approval-signing.key'))


def public_key_path():
    return os.path.expanduser(
        os.path.join(_CONFIG_DIR, 'approval-public.key'))


# ----------------------------------------------------------------
# Ed25519 — RFC 8032 §6 reference formulas
# ----------------------------------------------------------------
_B = 256
_q = 2 ** 255 - 19
_l = 2 ** 252 + 27742317777372353535851937790883648493
_d = -121665 * pow(121666, _q - 2, _q) % _q
_I = pow(2, (_q - 1) // 4, _q)


def _h(data):
    return hashlib.sha512(data).digest()


def _inv(x):
    return pow(x, _q - 2, _q)


def _xrecover(y):
    xx = (y * y - 1) * _inv(_d * y * y + 1)
    x = pow(xx, (_q + 3) // 8, _q)
    if (x * x - xx) % _q != 0:
        x = (x * _I) % _q
    if x % 2 != 0:
        x = _q - x
    return x


_By = 4 * _inv(5)
_Bx = _xrecover(_By)
_BPT = (_Bx % _q, _By % _q, 1, (_Bx * _By) % _q)


def _edwards_add(P, Q):
    x1, y1, z1, t1 = P
    x2, y2, z2, t2 = Q
    a = (y1 - x1) * (y2 - x2) % _q
    b = (y1 + x1) * (y2 + x2) % _q
    c = 2 * _d * t1 * t2 % _q
    dd = 2 * z1 * z2 % _q
    e = b - a
    f = dd - c
    g = dd + c
    h = b + a
    return (e * f % _q, g * h % _q, f * g % _q, e * h % _q)


def _scalarmult(P, e):
    if e == 0:
        return (0, 1, 1, 0)
    Q = _scalarmult(P, e >> 1)
    Q = _edwards_add(Q, Q)
    if e & 1:
        Q = _edwards_add(Q, P)
    return Q


def _encodeint(y):
    return y.to_bytes(_B // 8, 'little')


def _encodepoint(P):
    x, y, z, t = P
    zi = _inv(z)
    x = x * zi % _q
    y = y * zi % _q
    bits = [(y >> i) & 1 for i in range(_B - 1)] + [x & 1]
    v = 0
    for i, b in enumerate(bits):
        v |= b << i
    return _encodeint(v)


def _decodeint(s):
    return int.from_bytes(s, 'little')


def _bit(h, i):
    return (h[i >> 3] >> (i & 7)) & 1


def _isoncurve(P):
    x, y, z, t = P
    return (z % _q != 0
            and x * y % _q == z * t % _q
            and (y * y - x * x - z * z - _d * t * t) % _q == 0)


def _decodepoint(s):
    y = int.from_bytes(s, 'little') & ((1 << (_B - 1)) - 1)
    x = _xrecover(y)
    if x & 1 != _bit(s, _B - 1):
        x = _q - x
    P = (x, y, 1, (x * y) % _q)
    if not _isoncurve(P):
        raise ValueError('decoding point that is not on curve')
    return P


def _hint(m):
    return int.from_bytes(_h(m), 'little')


def _publickey(seed):
    h = _h(seed)
    a = 2 ** (_B - 2) + sum(2 ** i * _bit(h, i) for i in range(3, _B - 2))
    return _encodepoint(_scalarmult(_BPT, a))


def _signature(msg, seed, pk):
    h = _h(seed)
    a = 2 ** (_B - 2) + sum(2 ** i * _bit(h, i) for i in range(3, _B - 2))
    r = _hint(h[_B // 8:] + msg)
    R = _scalarmult(_BPT, r)
    S = (r + _hint(_encodepoint(R) + pk + msg) * a) % _l
    return _encodepoint(R) + _encodeint(S)


def _checkvalid(sig, msg, pk):
    if len(sig) != _B // 4:
        raise ValueError('bad signature length')
    if len(pk) != _B // 8:
        raise ValueError('bad public-key length')
    R = _decodepoint(sig[:_B // 8])
    A = _decodepoint(pk)
    S = _decodeint(sig[_B // 8:])
    h = _hint(_encodepoint(R) + pk + msg)
    (x1, y1, z1, t1) = _scalarmult(_BPT, S)
    (x2, y2, z2, t2) = _edwards_add(R, _scalarmult(A, h))
    if (not _isoncurve((x1, y1, z1, t1))
            or not _isoncurve((x2, y2, z2, t2))
            or (x1 * z2 - x2 * z1) % _q != 0
            or (y1 * z2 - y2 * z1) % _q != 0):
        raise ValueError('signature does not pass verification')


# ----------------------------------------------------------------
# public API
# ----------------------------------------------------------------
def generate():
    """(seed: bytes, pub_hex: str) — a fresh keypair. Fixture/test
    use: provision it under a sandbox HOME (signing_key_path /
    public_key_path) or monkeypatch PUBKEY_PATH in-process."""
    seed = secrets.token_bytes(32)
    return seed, _publickey(seed).hex()


def ed25519_sign(seed, msg):
    """seed: 32 bytes; msg: bytes → signature hex (128 chars)."""
    if isinstance(msg, str):
        msg = msg.encode()
    pk = _publickey(seed)
    return _signature(msg, seed, pk).hex()


def ed25519_verify(pub_hex, sig_hex, msg):
    """True iff sig_hex is a valid Ed25519 signature of msg under
    pub_hex. Never raises — a malformed/forged record is just False."""
    try:
        if isinstance(msg, str):
            msg = msg.encode()
        _checkvalid(bytes.fromhex(sig_hex or ''),
                    msg, bytes.fromhex(pub_hex or ''))
        return True
    except Exception:
        return False


def _pinned_pubkey():
    try:
        d = json.load(open(PUBKEY_PATH))
        pk = d.get('ed25519_public_key')
        return pk if isinstance(pk, str) and len(pk) == 64 else None
    except Exception:
        return None


def _mirror_pubkey():
    try:
        pk = open(public_key_path()).read().strip()
        return pk if len(pk) == 64 else None
    except Exception:
        return None


def pubkeys():
    """The public keys a record may verify under: the repo-pinned
    key first, then the HOME-resident service mirror. The pinned
    one is the production anchor; the mirror lets a fixture pair
    provisioned under a sandbox HOME verify in subprocesses."""
    return [p for p in (_pinned_pubkey(), _mirror_pubkey()) if p]


def verify_approval(rec):
    """(ok, reason). The record's `sig` is an Ed25519 signature over
    json.dumps(rec-minus-'sig', sort_keys=True) made by the approve
    service when a picker card was clicked. An unsigned, forged or
    tampered record fails here; the service is the only path that
    produces a passing record (page token + consumed nonce +
    design bound to the rendered options)."""
    if not isinstance(rec, dict):
        return False, 'not a record'
    sig = rec.get('sig')
    if not sig:
        return False, 'record carries no signature'
    keys = pubkeys()
    if not keys:
        return False, ('no approval public key — the approve '
                       'service publishes it on first start')
    body = json.dumps({k: v for k, v in rec.items() if k != 'sig'},
                      sort_keys=True).encode()
    if any(ed25519_verify(pk, sig, body) for pk in keys):
        return True, 'ok'
    return False, ('signature does not verify against a known '
                   'approval key — forged or tampered')


# ----------------------------------------------------------------
# service-side key handling (approve_service only)
# ----------------------------------------------------------------
def ensure_signing_key():
    """Return (pub_hex, seed: bytes). Auto-provisions the seed file
    on first call (0600) and mirrors the public key to
    approval-public.key. The repo-pinned approval_pubkey.json is
    written only when ABSENT (first provisioning) — a service under
    another HOME never clobbers the production pin; its records
    verify via that HOME's mirror. Service startup only."""
    kp = signing_key_path()
    os.makedirs(os.path.dirname(kp), exist_ok=True)
    try:
        seed = bytes.fromhex(open(kp).read().strip())
        if len(seed) != 32:
            raise ValueError
    except Exception:
        seed = secrets.token_bytes(32)
        with open(kp, 'w') as fh:
            fh.write(seed.hex() + '\n')
        os.chmod(kp, 0o600)
    pub = _publickey(seed).hex()
    mp = public_key_path()
    if _mirror_pubkey() != pub:
        with open(mp, 'w') as fh:
            fh.write(pub + '\n')
        os.chmod(mp, 0o600)
    if _pinned_pubkey() is None and not os.path.exists(PUBKEY_PATH):
        write_pubkey(pub)
    return pub, seed


def sign_body(rec, seed):
    """Ed25519-sign the canonical record body (json sort_keys,
    minus 'sig'). Called ONLY by the service's /approve handler —
    importing this is not a forgeable authority: without the
    consumed nonce + page token the record never lands, and the
    signature still has to verify against the pinned key."""
    body = {k: v for k, v in rec.items() if k != 'sig'}
    return ed25519_sign(
        seed, json.dumps(body, sort_keys=True).encode())


def write_pubkey(pub_hex):
    """Write the pinned public key file next to this module."""
    doc = {'ed25519_public_key': pub_hex,
           'created_by': 'approve_service.py serve (first start)',
           'note': 'public half of the service signing key; '
                   'verify_approval also accepts the HOME-resident '
                   'mirror at ~/.config/web-factory/'}
    with open(PUBKEY_PATH, 'w') as fh:
        json.dump(doc, fh, indent=1, sort_keys=True)
        fh.write('\n')
    os.chmod(PUBKEY_PATH, 0o644)
    return PUBKEY_PATH
