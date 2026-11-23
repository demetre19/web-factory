#!/usr/bin/env python3.12
"""vibe_images.py — generate one hero image per _VIBE_SPECS archetype
through OpenRouter's image models (recraft flash, free tier by
default) and cache them under assets/vibe/spec-<k>.webp.

The images ship with the repo: emit_vibe_specs copies them into each
pipeline's site/public/media/vibe/ and binds them onto the specimen
hero rows, so every vibe preview shows photography that matches its
archetype instead of text-only comps. Generation is one-shot and
cached — rerun only to refresh; --force regenerates.

Env: OPENROUTER_API_KEY (required), VIBE_IMAGE_MODEL (optional,
default the free recraft flash model).
"""

import base64
import json
import os
import re
import subprocess
import sys
import urllib.request

REPO = os.path.dirname(os.path.dirname(os.path.dirname(
    os.path.abspath(__file__))))
OUT = os.path.join(REPO, 'assets', 'vibe')
MODEL = os.environ.get('VIBE_IMAGE_MODEL',
                       'recraft/recraft-v4.1-flash-v2:free')

# one prompt per _VIBE_SPECS index — keep aligned with
# preview_build._VIBE_SPECS (brand + mood).
PROMPTS = [
    # 0 premium clinical — Meridian Dental
    'Serene modern dental studio interior, soft daylight through '
    'frosted glass, minimal clinical luxury, muted warm neutrals, '
    'architectural editorial photography, no people, no text',
    # 1 warm craft — Fieldstone Roasters
    'Small-batch coffee roastery interior, copper roaster drum, '
    'burlap sacks of green beans, warm amber light, editorial '
    'photography, no people, no text',
    # 2 editorial serif — Hale & Mercer
    'Boutique law firm library, dark walnut shelves, brass lamp, '
    'natural window light across a marble table, refined editorial '
    'photography, no people, no text',
    # 3 bold energy — Pulse Athletics
    'Modern strength gym interior at dusk, dramatic shafts of '
    'light, lifting platforms and a pool edge, athletic editorial '
    'photography, no people, no text',
    # 4 technical industrial — Atlas Freight
    'Container yard at dawn, stacked shipping containers and a '
    'gantry crane, cool industrial documentary photography, '
    'no people, no text',
    # 5 playful studio — Bloom Workshop
    'Colourful creative design studio, bold screen-print posters, '
    'plants and painted furniture, playful interior editorial '
    'photography, no people, no text',
    # 6 product saas — Northline
    'Bright minimal office desk with a laptop showing a clean '
    'abstract revenue dashboard, soft nordic daylight, product '
    'photography, no people',
    # 7 quiet luxury — Casa Verde
    'Boutique villa terrace above a vineyard valley at golden '
    'hour, still infinity pool, quiet luxury architectural '
    'photography, no people, no text',
]


def _gen(prompt, key):
    req = urllib.request.Request(
        'https://openrouter.ai/api/v1/images/generations',
        data=json.dumps({
            'model': MODEL,
            'prompt': prompt,
        }).encode(),
        headers={'Authorization': 'Bearer ' + key,
                 'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=180) as r:
        data = json.loads(r.read())['data']
    if data and data[0].get('b64_json'):
        return base64.b64decode(data[0]['b64_json'])
    url = (data[0].get('url') or '') if data else ''
    if url.startswith('data:'):
        return base64.b64decode(url.split(',', 1)[1])
    if url:
        with urllib.request.urlopen(url, timeout=120) as r:
            return r.read()
    raise RuntimeError('no image in response: '
                       + json.dumps(data)[:400])


def main():
    force = '--force' in sys.argv
    key = os.environ.get('OPENROUTER_API_KEY')
    only = [int(a) for a in sys.argv[1:] if a.isdigit()]
    os.makedirs(OUT, exist_ok=True)
    todo = [k for k in range(len(PROMPTS))
            if (not only or k in only)
            and (force or not os.path.isfile(
                os.path.join(OUT, f'spec-{k}.webp')))]
    if not todo:
        print('vibe images: all cached')
        return
    if not key:
        raise SystemExit('OPENROUTER_API_KEY required for '
                         f'{len(todo)} missing image(s)')
    for k in todo:
        raw = _gen(PROMPTS[k], key)
        tmp = os.path.join(OUT, f'.spec-{k}.png')
        dst = os.path.join(OUT, f'spec-{k}.webp')
        with open(tmp, 'wb') as f:
            f.write(raw)
        # 1600w webp ~q72 — big enough for a full-bleed hero, small
        # enough that a board of iframes stays light
        subprocess.run(
            ['ffmpeg', '-y', '-loglevel', 'error', '-i', tmp,
             '-vf', 'scale=1600:-2', '-quality', '72', dst],
            check=True)
        os.remove(tmp)
        print(f'  spec-{k}: {os.path.getsize(dst) // 1024}KB '
              f'({MODEL})')
    print(f'vibe images: {len(todo)} generated -> {OUT}')


if __name__ == '__main__':
    main()
