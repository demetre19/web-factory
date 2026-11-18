#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# dependencies = ["pillow", "numpy"]
# ///
"""Split negative-corpus page tiles into SECTION crops using the same
block detector as the positives, so the contrast corpus is compared
like-for-like (section vs section, not page vs section).

  uv run split_negatives.py

Input  data/negatives/<slug>/tile-NN.png
Output data/negatives_sections/<slug>/sec-NN.png + meta.json
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.normpath(os.path.join(HERE, '..', 'data'))
NEG = os.path.join(DATA, 'negatives')
OUT = os.path.join(DATA, 'negatives_sections')

sys.path.insert(0, HERE)
from image_features import analyze  # noqa: E402

MIN_AREA = 0.07
PAD = 0.004


def main():
    from PIL import Image
    os.makedirs(OUT, exist_ok=True)
    n_sites = n_secs = 0
    for slug in sorted(os.listdir(NEG)):
        src = os.path.join(NEG, slug)
        mp = os.path.join(src, 'meta.json')
        if not os.path.isfile(mp):
            continue
        meta = json.load(open(mp))
        dst = os.path.join(OUT, slug)
        os.makedirs(dst, exist_ok=True)
        secs = []
        for t in meta.get('tiles', []):
            p = os.path.join(src, t)
            try:
                feat = analyze(p)
            except Exception:
                continue
            if 'error' in feat:
                continue
            im = Image.open(p)
            w, h = im.size
            for i, b in enumerate(feat['blocks']):
                if b['area'] < MIN_AREA:
                    continue
                y0 = max(0, int((b['y0'] - PAD) * h))
                y1 = min(h, int((b['y1'] + PAD) * h))
                if y1 - y0 < 60:
                    continue
                name = f"sec-{t.split('-')[-1].split('.')[0]}-{i:02d}.png"
                im.crop((0, y0, w, y1)).save(os.path.join(dst, name))
                secs.append({'file': name, 'role': b['role'],
                             'area': b['area']})
        if not secs:
            continue
        json.dump({'url': meta['url'], 'domain': meta['domain'],
                   'site_type': meta.get('site_type'),
                   'page_type': meta.get('page_type'),
                   'source': 'negative', 'sections': secs},
                  open(os.path.join(dst, 'meta.json'), 'w'), indent=1)
        n_sites += 1
        n_secs += len(secs)
    print(f'{n_sites} sites -> {n_secs} section crops')


if __name__ == '__main__':
    main()
