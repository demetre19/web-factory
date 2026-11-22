#!/usr/bin/env python3
"""recraft.py — mood-matched placeholder image client (F).

Call shape (operator-provided):

    POST https://openrouter.ai/api/v1/images
    Authorization: Bearer $OPENROUTER_API_KEY
    {"model": "recraft/recraft-v4.1-flash-v2:free",
     "prompt": "..."}
    → result.data[i].b64_json → PNG bytes

Where emitted previews/fragments lack imagery (broken <img>, empty
media slots, boards/vibes with no image) a slot gets a generated
placeholder whose prompt matches the vibe family / section type —
see MOOD_PROMPT. Files cache under the pipeline assets dir keyed by
sha256(slot+mood) so a re-emit reuses the same PNG (one generation
per slot, deterministic filename). The key is the org secret
OPENROUTER_API_KEY — never log it; when unset the client stubs and
callers keep their placeholder."""

import base64
import hashlib
import json
import os
import sys
import urllib.request
import urllib.error

API = 'https://openrouter.ai/api/v1/images'
MODEL = 'recraft/recraft-v4.1-flash-v2:free'
ENV_KEY = 'OPENROUTER_API_KEY'

# vibe family / section type → prompt suffix. The object stays
# generic enough to sit in any layout slot; the mood carries the
# family's read so boards no longer show identical stock.
MOOD_PROMPT = {
    'baseline': 'clean minimal product photograph, soft daylight, '
                'neutral surface',
    'paper': 'soft editorial still life, printed-paper texture, '
             'muted tones, generous whitespace',
    'noir': 'moody dark technology still life, low-key lighting, '
            'single accent colour, black surface',
    'gloss': 'vivid glossy 3d render, reflective materials, bright '
             'studio light',
    'brutalist': 'raw concrete and bold geometric forms, harsh '
                 'flash photography, stark contrast',
    'editorial': 'magazine-style product editorial, warm colour '
                 'cast, shallow depth of field',
    'default': 'clean studio product photograph on a neutral '
               'background',
}

# comp → subject for cutout slots: the stage wants an object that
# survives background removal, not a framed scene.
CUTOUT_SUBJECT = 'a single piece of professional equipment on a '\
    'plain light-grey background, whole object visible, '\
    'isolated product shot'


def configured(env=None):
    return bool((env or os.environ).get(ENV_KEY))


def cache_name(slot, mood):
    return hashlib.sha256(f'{slot}|{mood}'.encode()).hexdigest()[:16] \
        + '.png'


def fill(slot, mood, out_dir, env=None, timeout=180):
    """Generate (or reuse) a placeholder PNG for `slot` in `mood`.
    Returns the absolute path, or None when OPENROUTER_API_KEY is
    unset — the caller keeps its existing placeholder."""
    env = env or os.environ
    key = env.get(ENV_KEY)
    if not key:
        return None
    os.makedirs(out_dir, exist_ok=True)
    path = os.path.join(out_dir, cache_name(slot, mood))
    if os.path.isfile(path) and os.path.getsize(path) > 0:
        return path
    prompt = (CUTOUT_SUBJECT if mood == 'cutout'
              else MOOD_PROMPT.get(mood, MOOD_PROMPT['default']))
    body = json.dumps({'model': MODEL, 'prompt': prompt}).encode()
    req = urllib.request.Request(
        API, data=body, method='POST',
        headers={'Authorization': f'Bearer {key}',
                 'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            payload = json.loads(r.read())
    except urllib.error.HTTPError as e:
        raise SystemExit(f'recraft: HTTP {e.code}: '
                         f'{e.read()[:300]!r}')
    try:
        b64 = payload['data'][0]['b64_json']
    except (KeyError, IndexError):
        raise SystemExit(f'recraft: no b64_json in result '
                         f'{str(payload)[:300]!r}')
    open(path, 'wb').write(base64.b64decode(b64))
    return path


if __name__ == '__main__':
    if len(sys.argv) < 3:
        sys.exit('usage: recraft.py <slot-id> <mood> [out_dir]\n'
                 f'env: {ENV_KEY} (unset → stub)\n'
                 f'moods: {", ".join(sorted(MOOD_PROMPT))}')
    out = fill(sys.argv[1], sys.argv[2],
               sys.argv[3] if len(sys.argv) > 3 else '.')
    print(out if out else f'stub: {ENV_KEY} unset')
