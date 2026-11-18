#!/usr/bin/env python3
# /// script
# dependencies = ["pillow", "numpy"]
# ///
"""Page-level validation: real reference sites vs generic pages.

The section-level study in VALIDATION.md cannot test the page-structure
checks, because a section crop has no page. This script does: it stacks
each site's full-page tiles into one image, runs the same pixel pass the
corpus used, and asks whether the shipped structural score ranks real
reference sites above generic ones.

    uv run --quiet validate_pages.py            # writes data/validation/pages.json

Corpora:
  positives  data/web/<slug>/      real reference sites (siteinspire/luxury)
  negatives  data/negatives/<slug>/  builder/template sites
"""
import json
import os
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.normpath(os.path.join(HERE, '..', 'data'))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..', '..', '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'design-gate'))

import score  # noqa: E402  (stdlib only)
import image_features  # noqa: E402  (pillow + numpy)

POSITIVE_SOURCES = {'siteinspire', 'luxury', 'high-quality', 'quality',
                    'reference'}
NEGATIVE_SOURCES = {'negative', 'builder', 'template'}

# The shipped weights, minus pattern_fit (a page has no section label, so
# no genotype cell to fit against).
STRUCT_KEYS = [k for k in score.DEFAULT_WEIGHTS if k != 'pattern_fit']


def stack(site_dir, meta):
    from PIL import Image
    tiles = [os.path.join(site_dir, t) for t in meta.get('tiles') or []]
    tiles = [t for t in tiles if os.path.isfile(t)]
    if not tiles:
        return None
    width = 900
    ims = []
    total_h = 0
    for t in tiles:
        im = Image.open(t).convert('RGB')
        h = max(1, int(round(im.size[1] * width / im.size[0])))
        im = im.resize((width, h), Image.BILINEAR)
        ims.append(im)
        total_h += h
    page = Image.new('RGB', (width, total_h), 'white')
    y = 0
    for im in ims:
        page.paste(im, (0, y))
        y += im.size[1]
    fd, path = tempfile.mkstemp(suffix='.png')
    os.close(fd)
    page.save(path)
    return path


def collect(root, sources, label):
    rows = []
    if not os.path.isdir(root):
        return rows
    for slug in sorted(os.listdir(root)):
        mp = os.path.join(root, slug, 'meta.json')
        if not os.path.isfile(mp):
            continue
        meta = json.load(open(mp))
        src = (meta.get('source') or '').lower()
        if sources and src not in sources:
            continue
        if not meta.get('tiles'):
            continue
        rows.append((os.path.join(root, slug), meta, label))
    return rows


def main():
    jobs = collect(os.path.join(DATA, 'web'), POSITIVE_SOURCES, 1) + \
        collect(os.path.join(DATA, 'negatives'), None, 0)
    if not jobs:
        print('nothing to measure')
        return 1
    out = []
    for i, (site_dir, meta, label) in enumerate(jobs, 1):
        path = stack(site_dir, meta)
        if not path:
            continue
        try:
            feat = image_features.analyze(path)
        finally:
            os.unlink(path)
        ps = feat.get('ps') or {}
        mm = 1.0 - min(1.0, abs(ps.get('main_content_share', 0.8) - 0.8)
                       / 0.35)
        comp = score.section_features(0.0, ps, mm, 1.0)
        wsum = sum(score.DEFAULT_WEIGHTS[k] for k in STRUCT_KEYS) or 1.0
        sc = 100 * sum(score.DEFAULT_WEIGHTS[k] * comp[k]
                       for k in STRUCT_KEYS) / wsum
        out.append({'domain': meta.get('domain'), 'label': label,
                    'score': round(sc, 2),
                    'source': meta.get('source'),
                    'site_type': meta.get('site_type'),
                    'features': {k: round(comp[k], 3) for k in STRUCT_KEYS}})
        if i % 25 == 0:
            print(f'  {i}/{len(jobs)}', flush=True)

    pairs = [(r['score'], r['label']) for r in out]
    a = score.auc(pairs)
    pos = [r['score'] for r in out if r['label'] == 1]
    neg = [r['score'] for r in out if r['label'] == 0]
    # which structural feature actually separates the two corpora
    corr = {}
    for k in STRUCT_KEYS:
        xs = [r['features'][k] for r in out]
        ys = [r['label'] for r in out]
        mx, my = sum(xs) / len(xs), sum(ys) / len(ys)
        num = sum((x - mx) * (y - my) for x, y in zip(xs, ys))
        dx = sum((x - mx) ** 2 for x in xs) ** 0.5 or 1
        dy = sum((y - my) ** 2 for y in ys) ** 0.5 or 1
        corr[k] = round(num / (dx * dy), 3)
    res = {
        'n_positive': len(pos), 'n_negative': len(neg),
        'auc': round(a, 4),
        'mean_positive': round(sum(pos) / max(1, len(pos)), 2),
        'mean_negative': round(sum(neg) / max(1, len(neg)), 2),
        'correlations': corr,
        'sites': out,
    }
    os.makedirs(os.path.join(DATA, 'validation'), exist_ok=True)
    json.dump(res, open(os.path.join(DATA, 'validation', 'pages.json'),
                        'w'), indent=1)
    print(json.dumps({k: res[k] for k in ('n_positive', 'n_negative', 'auc',
                                          'mean_positive', 'mean_negative',
                                          'correlations')}, indent=1))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
