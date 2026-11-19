#!/usr/bin/env python3
"""seal.py — checksum-verified saves for pipeline evidence files
(ported from the SEO SOPs substrate).

The failure this prevents: a relayed corpus harvest lands subtly
altered. Don't ask a model to copy carefully — make a bad copy
unsavable.

  1. SEALED SAVE — save relayed content through this tool:
       echo '<content>' | seal.py save --sha <expected> <path>
     Recomputes sha256 and REFUSES to write on mismatch.

  2. MANIFEST — tools that write evidence files call `seal.file()`
     (or `seal.py stamp <path>`): the file's hash lands in
     <dir>/.seal-manifest.sha256. `gate.py` seal checks run
     `verify <dir>`: every evidence file must be in the manifest AND
     recompute-match.

usage:
  seal.py save --sha <hex> <path>          # stdin body → verified write
  seal.py stamp <path> [<path>...]         # record hash(es)
  seal.py verify <dir>                     # check every file vs manifest
  seal.py adopt <dir>                      # seal every file as-is
"""
import hashlib
import os
import sys

MANIFEST = '.seal-manifest.sha256'


def _hash(data):
    return hashlib.sha256(data).hexdigest()


def _manifest_path(d):
    return os.path.join(d, MANIFEST)


def _load(d):
    m = {}
    mp = _manifest_path(d)
    if os.path.exists(mp):
        for ln in open(mp):
            ln = ln.rstrip('\n')
            if not ln or ln.startswith('#'):
                continue
            h, name = ln.split('  ', 1) if '  ' in ln else \
                ln.split(' ', 1)
            m[name.strip()] = h.strip()
    return m


def _write_manifest(d, m):
    with open(_manifest_path(d), 'w') as f:
        f.write('# sha256 manifest — written by tools, verified by '
                'the gate. Do not hand-edit.\n')
        for name in sorted(m):
            f.write(f'{m[name]}  {name}\n')


def seal_file(path):
    """Record a file's hash in its directory's manifest. Idempotent."""
    d = os.path.dirname(path) or '.'
    name = os.path.basename(path)
    h = _hash(open(path, 'rb').read())
    m = _load(d)
    if m.get(name) != h:
        m[name] = h
        _write_manifest(d, m)
    return h


def verify_dir(d):
    """(altered, unsealed) — files vs manifest for one dir."""
    m = _load(d)
    altered, unsealed = [], []
    for fn in sorted(os.listdir(d)):
        if fn == MANIFEST or fn.startswith('.'):
            continue
        p = os.path.join(d, fn)
        if not os.path.isfile(p):
            continue
        h = _hash(open(p, 'rb').read())
        if fn not in m:
            unsealed.append(fn)
        elif m[fn] != h:
            altered.append(fn)
    return altered, unsealed


def adopt_dir(d):
    """Seal every file in d as-is (grandfather legacy evidence —
    marks it verified-at-this-byte-state, not authentic)."""
    n = 0
    for fn in sorted(os.listdir(d)):
        p = os.path.join(d, fn)
        if os.path.isfile(p) and fn != MANIFEST and \
                not fn.startswith('.'):
            seal_file(p)
            n += 1
    return n


def main(argv):
    if len(argv) < 3:
        print(__doc__)
        return 64
    cmd = argv[1]
    if cmd == 'save':
        try:
            sha_idx = argv.index('--sha')
            want, path = argv[sha_idx + 1], argv[-1]
        except (ValueError, IndexError):
            print('usage: seal.py save --sha <hex> <path>')
            return 64
        data = sys.stdin.buffer.read()
        got = _hash(data)
        if got != want:
            print(f'seal REFUSE {path}: sha {got[:12]} != '
                  f'{want[:12]} — content altered in transit')
            return 2
        os.makedirs(os.path.dirname(path) or '.', exist_ok=True)
        open(path, 'wb').write(data)
        seal_file(path)
        print(f'sealed {path}')
        return 0
    if cmd == 'stamp':
        for p in argv[2:]:
            print(seal_file(p)[:12], p)
        return 0
    if cmd == 'verify':
        altered, unsealed = verify_dir(argv[2])
        for x in altered:
            print(f'ALTERED {x} — hash != manifest')
        for x in unsealed:
            print(f'UNSEALED {x} — not in manifest')
        return 2 if (altered or unsealed) else 0
    if cmd == 'adopt':
        n = adopt_dir(argv[2])
        print(f'{n} files sealed in {argv[2]}')
        return 0
    print(__doc__)
    return 64


if __name__ == '__main__':
    sys.exit(main(sys.argv))
