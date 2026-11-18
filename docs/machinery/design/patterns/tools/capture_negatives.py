#!/usr/bin/env python3
"""Screenshot negative-corpus pages with headless Brave, tile into
viewport-height chunks for vision annotation.

Run with the patternenv python (has Pillow):
  /tmp/patternenv/bin/python capture_negatives.py [--limit N]
Outputs data/negatives/<domain>/meta.json + tile-NN.png.
"""
import json
import os
import re
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.normpath(os.path.join(HERE, '..', 'data'))
NEG = os.path.join(DATA, 'negatives')
URLS = os.path.join(DATA, 'negatives_urls.txt')
BRAVE = ('/Applications/Brave Browser.app/Contents/MacOS/Brave Browser')
WIDTH = 1440
TILE_H = 1600
MAX_H = 12000

EXTRA = [
    # the swe-2 pipeline preview + cards are scored as built pages,
    # not screenshotted — they enter via score.py directly.
]


def tile(png, outdir):
    from PIL import Image
    im = Image.open(png)
    w, h = im.size
    tiles = []
    for i, y in enumerate(range(0, h, TILE_H)):
        t = im.crop((0, y, w, min(y + TILE_H, h)))
        name = f'tile-{i:02d}.png'
        t.save(os.path.join(outdir, name))
        tiles.append(name)
    return tiles, w, h


def main():
    limit = None
    if '--limit' in sys.argv:
        limit = int(sys.argv[sys.argv.index('--limit') + 1])
    rows = []
    for line in open(URLS):
        line = line.strip()
        if not line or line.startswith('#'):
            continue
        url, st, pt = line.split('|')
        rows.append((url, st, pt))
    rows += EXTRA
    if limit:
        rows = rows[:limit]
    for url, st, pt in rows:
        dom = re.sub(r'[^a-z0-9.-]', '', url.split('//')[-1].split('/')[0])
        slug = re.sub(r'[^a-z0-9]+', '-', url.lower()).strip('-')[:80]
        outdir = os.path.join(NEG, slug)
        meta_p = os.path.join(outdir, 'meta.json')
        if os.path.exists(meta_p):
            print(f'skip {slug}')
            continue
        os.makedirs(outdir, exist_ok=True)
        raw = os.path.join(outdir, 'full.png')
        try:
            subprocess.run([BRAVE, '--headless', '--disable-gpu',
                            '--hide-scrollbars',
                            f'--window-size={WIDTH},{MAX_H}',
                            f'--screenshot={raw}', url],
                           check=True, capture_output=True, timeout=90)
            tiles, w, h = tile(raw, outdir)
            os.remove(raw)
            json.dump({'url': url, 'domain': dom, 'site_type': st,
                       'page_type': pt, 'width': w, 'height': h,
                       'tiles': tiles, 'source': 'negative'},
                      open(meta_p, 'w'), indent=1)
            print(f'{slug}: {w}x{h} -> {len(tiles)} tiles', flush=True)
        except Exception as e:
            print(f'{slug}: FAILED {e}', flush=True)


if __name__ == '__main__':
    main()
