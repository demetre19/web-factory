#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# dependencies = ["pillow", "numpy", "scipy"]
# ///
"""Trend tagging — multi-label, confidence + evidence, year-stamped.

Closed vocab from `data/trends.json` (Vistaprint 2026 classification
source). Each canon record (Mobbin + operator) gets `trend`: a list of
{trend, confidence, evidence} entries plus `trend_year`. Also emits
`dated` when era markers say old-web rather than Y2K revival.

  uv run trend_detect.py            # tag annotations.jsonl in place
  uv run trend_detect.py --report   # distribution only
"""
import json
import os
import sys

import numpy as np
from PIL import Image
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.normpath(os.path.join(HERE, '..', 'data'))
PATTERNS = os.path.normpath(os.path.join(HERE, '..'))
ANN = os.path.join(DATA, 'annotations.jsonl')
TRENDS = json.load(open(os.path.join(DATA, 'trends.json')))
YEAR = TRENDS['year']

sys.path.insert(0, HERE)
import cache  # noqa: E402
import image_features  # noqa: E402

TD_V = cache.text_sha(
    json.dumps(TRENDS, sort_keys=True) + ':detect5')[:12]


def lum(a):
    return 0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2]


def chroma(a):
    return a.max(axis=2) - a.min(axis=2)


def detect(path, feat):
    """One crop -> trend labels + evidence."""
    key = f'{cache.file_sha(path)}:{TD_V}'
    hit = cache.get('trend', key)
    if hit is not None:
        return hit
    im = Image.open(path).convert('RGB')
    im.thumbnail((480, 4800))
    a = np.asarray(im, dtype=np.float32)
    L, C = lum(a), chroma(a)
    # measured signals
    ws = feat.get('whitespace_share', 1 - (feat.get('ink_density') or 0))
    ink = feat.get('ink_density') or 0
    pastel = ((C < 60) & (L > 170)).mean()
    neon = (C > 120).mean()
    grad = float(np.abs(np.gradient(L.mean(axis=1))).mean())
    chr_var = float(C.var())
    dens = 'compact' if (feat.get('block_count') or 0) >= 6 else 'open'
    # soft shadow proxy: mid-lum edge ring around darker objects
    edge = ndimage.sobel(L)
    shadowy = float(((edge > 8) & (edge < 40)).mean())
    scores = {}
    # Thresholds calibrated on the corpus (n=250 sample): a marker must
    # sit in the top-decile band — corpus median is already "good
    # design", so a trend label means *notably* this, not "above median".
    cm = float(C.mean())
    # cute-alism: neon accent + dense ink (kawaii pop on stark box)
    s = (0.5 if neon > 0.10 else 0) + (0.3 if ink > 0.30 else 0) + \
        (0.2 if chr_var > 1900 else 0)
    scores['cute-alism'] = min(1.0, s)
    # dial-up: extreme chroma variance + strong gradient + dense
    s = (0.4 if chr_var > 1900 else 0) + (0.3 if grad > 4.3 else 0) + \
        (0.3 if dens == 'compact' and cm > 40 else 0)
    scores['dial-up-delight'] = min(1.0, s)
    # resonant-stark: extreme whitespace + sparse ink + flat chroma
    s = (0.4 if ws >= 0.86 else 0) + (0.3 if ink <= 0.08 else 0) + \
        (0.3 if cm < 9 else 0)
    scores['resonant-stark'] = min(1.0, s)
    # frosted-touch: deep pastel field + soft edge blur + low chroma
    s = (0.4 if pastel > 0.88 else 0) + (0.3 if shadowy > 0.05 else 0) + \
        (0.3 if cm < 40 else 0)
    scores['frosted-touch'] = min(1.0, s)
    # light-skeuo: strong soft-shadow (p99) + delicate gradient;
    # generic UI edges already read ~0.03 shadow, so require the
    # extreme band to mean "embossed", not "has a border".
    s = (0.45 if shadowy > 0.14 else 0) + \
        (0.3 if 2.0 < grad < 4.5 else 0) + \
        (0.25 if pastel > 0.5 else 0) \
        if shadowy > 0.14 else 0  # embossing is the definition
    scores['light-skeuomorphism'] = min(1.0, s)
    # snug-simple: pastel-dominant + very low chroma + open layout
    s = (0.5 if pastel > 0.88 else 0) + \
        (0.3 if cm < 19 else 0) + \
        (0.2 if dens == 'open' else 0)
    scores['snug-simple'] = min(1.0, s)
    # ai-personalisation: insufficient by definition — stills cannot
    # see adaptive behaviour; guideline row, no auto-label.
    # human-scribble needs the media medium (CLIP label) — caller adds.
    out = []
    for t, sc in scores.items():
        if sc >= 0.55:
            ev = []
            if t == 'resonant-stark':
                ev = [f'whitespace {ws:.0%}', f'ink {ink:.0%}']
            elif t == 'dial-up-delight':
                ev = [f'chroma_var {chr_var:.0f}',
                      f'gradient {grad:.2f}']
            elif t == 'snug-simple':
                ev = [f'pastel {pastel:.0%}']
            elif t == 'frosted-touch':
                ev = [f'pastel {pastel:.0%}',
                      f'soft_edges {shadowy:.2f}']
            elif t == 'light-skeuomorphism':
                ev = [f'soft_edges {shadowy:.2f}',
                      f'gradient {grad:.2f}']
            elif t == 'cute-alism':
                ev = [f'neon {neon:.1%}', f'ink {ink:.0%}']
            out.append({'trend': t, 'confidence': round(sc, 2),
                        'evidence': '; '.join(ev)})
    # dated flag: dial-up markers + dense bordered blocks = old-web,
    # not revival (the revival keeps generous whitespace)
    if scores.get('dial-up-delight', 0) >= 0.55 and \
            dens == 'compact' and ws < 0.35:
        out.append({'trend': 'dated', 'confidence': 0.6,
                    'evidence': 'dense 90s markers without the '
                                'revival\'s whitespace'})
    out.sort(key=lambda x: -x['confidence'])
    cache.put('trend', key, out)
    return out


def main():
    if '--report' in sys.argv:
        from collections import Counter
        c = Counter()
        for line in open(ANN):
            for t in json.loads(line).get('trend') or []:
                c[t['trend']] += 1
        print(dict(c.most_common()))
        return
    rows = []
    n_tagged = 0
    for line in open(ANN):
        r = json.loads(line)
        p = r.get('image')
        if p and os.path.exists(p):
            feat = {'ink_density': r.get('ink_density'),
                    'whitespace_share': r.get('whitespace_share'),
                    'media_ratio': r.get('media_ratio'),
                    'columns': r.get('columns'),
                    'block_count': len(r.get('blocks') or [])}
            tr = detect(p, feat)
            if tr:
                r['trend'] = tr
                r['trend_year'] = YEAR
                n_tagged += 1
            else:
                r.pop('trend', None)
                r.pop('trend_year', None)
        rows.append(r)
    with open(ANN, 'w') as f:
        for r in rows:
            f.write(json.dumps(r) + '\n')
    print(f'{n_tagged}/{len(rows)} records trend-tagged')


if __name__ == '__main__':
    main()
