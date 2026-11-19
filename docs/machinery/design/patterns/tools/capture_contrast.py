#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# dependencies = ["playwright", "pillow", "numpy"]
# ///
"""Contrast corpus = OUR OWN generated/failed designs.

Operator law: scorer validation is Mobbin (held-out) vs designs the
factory produced and the gate rejected — never scraped negatives. This
captures every rendered HTML under `sites/*/site/design/refs/` plus the
design-dna previews at a real 1440×900 viewport, segments each page into
section bands (same detector as Mobbin annotation), and writes
`data/annotations_contrast.jsonl`.

  uv run capture_contrast.py            # capture + split + annotate
"""
import glob
import json
import os
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.normpath(os.path.join(HERE, '..', 'data'))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..', '..', '..', '..'))
OUT = os.path.join(DATA, 'contrast')
ANN = os.path.join(DATA, 'annotations_contrast.jsonl')
WIDTH, VPH, TILE_H = 1440, 900, 1600

sys.path.insert(0, HERE)
import cache  # noqa: E402
import image_features  # noqa: E402


def html_sources():
    pats = [
        os.path.join(ROOT, 'sites', '*', 'site', 'design', 'refs',
                     '*.html'),
        os.path.join(ROOT, 'sites', '*', 'site', 'design-dna', 'preview',
                     '*.html'),
    ]
    out = []
    for p in pats:
        out += glob.glob(p)
    return sorted(out)


def capture(path, slug):
    from playwright.sync_api import sync_playwright
    d = os.path.join(OUT, slug)
    os.makedirs(d, exist_ok=True)
    raw = os.path.join(d, 'full.png')
    with sync_playwright() as pw:
        br = pw.chromium.launch()
        page = br.new_page(viewport={'width': WIDTH, 'height': VPH})
        page.goto('file://' + path, wait_until='load', timeout=30000)
        page.wait_for_timeout(800)
        page.screenshot(path=raw, full_page=True)
        br.close()
    from PIL import Image
    im = Image.open(raw)
    w, h = im.size
    tiles = []
    for i, y in enumerate(range(0, h, TILE_H)):
        t = im.crop((0, y, w, min(y + TILE_H, h)))
        name = f'tile-{i:02d}.png'
        t.save(os.path.join(d, name))
        tiles.append(name)
    os.remove(raw)
    meta = {'url': 'file://' + os.path.relpath(path, ROOT),
            'domain': slug, 'site_type': 'generated',
            'page_type': 'generated', 'source': 'factory',
            'width': w, 'height': h, 'tiles': tiles,
            'capture_engine': 'playwright2', 'viewport': [WIDTH, VPH],
            'schema_version': '1.0'}
    json.dump(meta, open(os.path.join(d, 'meta.json'), 'w'), indent=1)
    return meta


def split(d, meta):
    """tile -> section bands (same detector as the Mobbin pass)."""
    from PIL import Image
    feats = []
    for i, t in enumerate(meta['tiles']):
        p = os.path.join(d, t)
        f = image_features.analyze(p)
        feats.append((p, f))
    secs = []
    for ti, (p, f) in enumerate(feats):
        for b in f['blocks']:
            if b['role'] != 'main' or b['area'] < 0.06:
                continue
            secs.append({'tile': ti, 'path': p, 'feat': f, 'block': b})
    return secs


def main():
    from PIL import Image
    records = []
    srcs = html_sources()
    print(f'{len(srcs)} generated pages')
    for i, path in enumerate(srcs):
        slug = os.path.relpath(path, ROOT).replace('/', '_')[:-5]
        d = os.path.join(OUT, slug)
        if not os.path.exists(os.path.join(d, 'meta.json')):
            try:
                meta = capture(path, slug)
            except Exception as e:
                print(f'{slug}: capture failed {e}')
                continue
        else:
            meta = json.load(open(os.path.join(d, 'meta.json')))
        for j, sec in enumerate(split(d, meta)):
            f = sec['feat']
            b = sec['block']
            W, H = Image.open(sec['path']).size
            name = f'sec-{j:02d}.png'
            sp = os.path.join(d, name)
            if not os.path.exists(sp):
                Image.open(sec['path']).convert('RGB').crop(
                    (int(b['x0'] * W), int(b['y0'] * f['h']),
                     int(b['x1'] * W), int(b['y1'] * f['h']))).save(sp)
            fa = image_features.analyze(sp)
            records.append({
                'site_name': slug,
                'image': sp,
                'site_type': 'generated',
                'page_type': 'generated',
                'section_type': 'other',
                'composition': None,
                'density': 'spacious' if b['area'] > 0.5 else 'regular',
                'columns': fa['columns'],
                'media_side': fa.get('media_side'),
                'ink_density': fa['ink_density'],
                'whitespace_share': fa['whitespace_share'],
                'media_ratio': fa['media_ratio'],
                'ps': fa['ps'],
                'blocks': fa['blocks'],
                'cta_count': sum(1 for x in fa['blocks']
                                 if x.get('has_cta')),
                'source': 'factory-generated',
                'label': slug,
                'annotator': 'capture_contrast.py',
            })
        print(f'{slug}: {len(records)} records so far', flush=True)
    with open(ANN, 'w') as f:
        for r in records:
            f.write(json.dumps(r) + '\n')
    print(f'{len(records)} contrast records -> {ANN}')


if __name__ == '__main__':
    main()
