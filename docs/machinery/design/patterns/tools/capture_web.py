#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# dependencies = ["pillow"]
# ///
"""Screenshot the curated web-supplement corpus (galleries + luxury +
negative ecommerce) with headless Brave and tile it.

  uv run capture_web.py [--limit N] [--max-h 6000]

Input: data/web_supplement_urls.txt  url|site_type|page_type|source
Output: data/web/<slug>/meta.json + tile-NN.png
"""
import json
import os
import re
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.normpath(os.path.join(HERE, '..', 'data'))
OUT = os.path.join(DATA, 'web')
URLS = os.path.join(DATA, 'web_supplement_urls.txt')
BRAVE = '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser'
WIDTH = 1440
TILE_H = 1600


def main():
    limit = None
    max_h = 6000
    if '--limit' in sys.argv:
        limit = int(sys.argv[sys.argv.index('--limit') + 1])
    if '--max-h' in sys.argv:
        max_h = int(sys.argv[sys.argv.index('--max-h') + 1])
    rows = []
    for line in open(URLS):
        line = line.strip()
        if not line or line.startswith('#'):
            continue
        parts = line.split('|')
        if len(parts) < 3:
            continue
        url, st, pt = parts[0], parts[1], parts[2]
        src = parts[3] if len(parts) > 3 else 'web'
        rows.append((url, st, pt, src))
    if limit:
        rows = rows[:limit]
    from PIL import Image
    ok = fail = 0
    for url, st, pt, src in rows:
        slug = re.sub(r'[^a-z0-9]+', '-', url.lower()).strip('-')[:90]
        d = os.path.join(OUT, slug)
        mp = os.path.join(d, 'meta.json')
        if os.path.exists(mp):
            continue
        os.makedirs(d, exist_ok=True)
        raw = os.path.join(d, 'full.png')
        try:
            subprocess.run([BRAVE, '--headless', '--disable-gpu',
                            '--hide-scrollbars',
                            f'--window-size={WIDTH},{max_h}',
                            f'--screenshot={raw}', url],
                           check=True, capture_output=True, timeout=75)
            im = Image.open(raw)
            w, h = im.size
            tiles = []
            for i, y in enumerate(range(0, h, TILE_H)):
                t = im.crop((0, y, w, min(y + TILE_H, h)))
                name = f'tile-{i:02d}.png'
                t.save(os.path.join(d, name))
                tiles.append(name)
            os.remove(raw)
            json.dump({'url': url, 'domain': url.split('//')[-1].split('/')[0],
                       'site_type': st, 'page_type': pt, 'source': src,
                       'width': w, 'height': h, 'tiles': tiles}, open(mp, 'w'),
                      indent=1)
            ok += 1
            print(f'{slug}: {w}x{h} {len(tiles)} tiles', flush=True)
        except Exception as e:
            fail += 1
            print(f'{slug}: FAILED {type(e).__name__}', flush=True)
    print(f'done ok={ok} fail={fail}')


if __name__ == '__main__':
    main()
