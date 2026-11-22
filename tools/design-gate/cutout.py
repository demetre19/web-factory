#!/usr/bin/env python3
"""cutout.py — background-removal client for the cutout-media
sections (G). Same call shape as the gmb-extractor worker's
handleBgRem:

    POST {WORKER_URL}/api/bgrem
    Authorization: Bearer {WORKER_TOKEN}
    Content-Type: image/*
    <raw image bytes>
    → 200: transparent PNG body

inside the worker it is `env.IMAGES.input(body).transform(
{segment:'foreground'}).output({format:'image/png'})` — Cloudflare
Images binding, ~5k unique transforms/month free account-wide.

Interface mirrors the recraft image stage: WORKER_URL + WORKER_TOKEN
env vars; when either is missing the client stubs — callers get
None and emit the section's .cutout-ph placeholder instead. Output
is cached per content hash so re-emits never re-transform."""

import base64
import hashlib
import json
import os
import sys
import urllib.request
import urllib.error

ENV_URL = 'WORKER_URL'
ENV_TOKEN = 'WORKER_TOKEN'


def configured(env=None):
    env = env or os.environ
    return bool(env.get(ENV_URL)) and bool(env.get(ENV_TOKEN))


def cutout(image_path, out_path=None, env=None, timeout=120):
    """image_path → transparent PNG at out_path (default: same dir,
    <stem>.cutout.png). Returns the output path, or None when the
    worker isn't configured (WORKER_URL/WORKER_TOKEN unset) — the
    caller then keeps the placeholder. Cached on the input's sha256
    so a re-emit of the same source never re-spends a transform."""
    env = env or os.environ
    url = (env.get(ENV_URL) or '').rstrip('/')
    token = env.get(ENV_TOKEN) or ''
    if not url or not token:
        return None
    data = open(image_path, 'rb').read()
    if out_path is None:
        out_path = (os.path.splitext(image_path)[0] + '.cutout.png')
    cache = out_path + '.sha256'
    dig = hashlib.sha256(data).hexdigest()
    if os.path.isfile(out_path) and os.path.isfile(cache) \
            and open(cache).read().strip() == dig:
        return out_path
    mime = {'jpg': 'image/jpeg', 'jpeg': 'image/jpeg',
            'png': 'image/png', 'webp': 'image/webp'}.get(
        image_path.rsplit('.', 1)[-1].lower(), 'application/octet-stream')
    req = urllib.request.Request(
        url + '/api/bgrem', data=data, method='POST',
        headers={'Authorization': f'Bearer {token}',
                 'Content-Type': mime})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            png = r.read()
    except urllib.error.HTTPError as e:
        raise SystemExit(
            f'cutout: {url}/api/bgrem → HTTP {e.code}: '
            f'{e.read()[:300]!r}')
    if not png.startswith(b'\x89PNG'):
        raise SystemExit('cutout: worker returned non-PNG '
                         f'({png[:24]!r})')
    open(out_path, 'wb').write(png)
    open(cache, 'w').write(dig + '\n')
    return out_path


if __name__ == '__main__':
    if len(sys.argv) < 2:
        sys.exit('usage: cutout.py <image> [out.png]\n'
                 f'env: {ENV_URL}, {ENV_TOKEN} (unset → stub)')
    out = cutout(sys.argv[1], sys.argv[2] if len(sys.argv) > 2
                 else None)
    print(out if out else 'stub: WORKER_URL/WORKER_TOKEN unset — '
                         'placeholder kept')
