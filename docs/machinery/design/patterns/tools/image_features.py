#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# dependencies = ["pillow", "numpy"]
# ///
"""Deterministic pixel features for section screenshots.

Produces the vision-side half of the PS.* contract in
tools/design-gate/ps_features.py (identical feature names), plus the
measurable design fields the annotator needs. No model, no network.

  uv run image_features.py <img> [<img> ...]     # JSON lines
  uv run image_features.py --dir <screens-dir>

Method
- Base surface = modal colour of the whole crop (page paper), refined
  from the border ring when the crop is not full-bleed.
- Blocks = horizontal bands separated by rows whose ink share is ~0.
- A block is MEDIA when <55% of its pixels match the base surface and
  its colour spread is high (photo/video), not when it is text.
- whitespace_share = base-surface pixels outside media / total.
- columns = interior vertical gaps (>=4% width, empty over >=55% of
  block height) between filled column bands.
"""
import json
import os
import sys

import numpy as np
from PIL import Image

WORK_W = 420
INK_TOL = 30        # luminance distance from base = ink
GAP_INK = 0.012     # row ink share below this = separator
MIN_BLOCK_H = 0.012
MEDIA_BG_MAX = 0.55  # base-match share below this = media candidate


def load(path):
    im = Image.open(path).convert('RGB')
    w, h = im.size
    scale = WORK_W / w
    im = im.resize((WORK_W, max(1, int(round(h * scale)))), Image.BILINEAR)
    return np.asarray(im, dtype=np.float32)


def base_color(arr):
    q = (arr // 8).astype(np.int32)
    key = q[..., 0] * 4096 + q[..., 1] * 64 + q[..., 2]
    vals, counts = np.unique(key.ravel(), return_counts=True)
    top = vals[np.argmax(counts)]
    mask = key == top
    return arr[mask].mean(axis=0)


def lum(a):
    return 0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2]


def analyze(path):
    arr = load(path)
    h, w, _ = arr.shape
    base = base_color(arr)
    base_l = float(lum(base))
    L = lum(arr)
    dist = np.abs(L - base_l)
    # colour distance too, so a same-luminance photo is not "background"
    cdist = np.abs(arr - base).max(axis=2)
    is_base = (dist <= INK_TOL) & (cdist <= 26)
    ink = ~is_base
    row_ink = ink.mean(axis=1)
    chroma = arr.max(axis=2) - arr.min(axis=2)

    # ---- blocks ------------------------------------------------------
    spans, y = [], 0
    while y < h:
        if row_ink[y] < GAP_INK:
            y += 1
            continue
        y0 = y
        while y < h and row_ink[y] >= GAP_INK:
            y += 1
        if (y - y0) / h >= MIN_BLOCK_H:
            spans.append((y0, y))
    if not spans:
        spans = [(0, h)]

    blocks = []
    for i, (y0, y1) in enumerate(spans):
        bh = y1 - y0
        area = bh / h
        b_ink = ink[y0:y1]
        bg_frac = float(is_base[y0:y1].mean())
        chroma_mean = float(chroma[y0:y1].mean())
        # horizontal transitions per row → text-likeness
        trans = np.abs(np.diff(b_ink.astype(np.int8), axis=1)).sum(axis=1)
        run_avg = float(trans.mean()) / 2.0
        cl = float(chroma[y0:y1, :w // 2].mean())
        cr = float(chroma[y0:y1, w // 2:].mean())
        is_media = (bg_frac < MEDIA_BG_MAX and chroma_mean > 14
                    and bh / h > 0.05) or (
            run_avg < 6 and chroma_mean > 12 and bh / h > 0.10)
        if is_media:
            if cl > cr * 1.5 and cl > 18:
                side = 'left'
            elif cr > cl * 1.5 and cr > 18:
                side = 'right'
            else:
                side = 'both'
        else:
            side = 'none'
        # columns: interior gaps empty over most of the block height
        col_ink = b_ink.mean(axis=0)
        filled = col_ink > 0.03
        gaps = 0
        run = 0
        first_fill = np.argmax(filled) if filled.any() else w
        last_fill = (w - 1 - np.argmax(filled[::-1])) if filled.any() else 0
        for x in range(int(first_fill), int(last_fill) + 1):
            if not filled[x]:
                run += 1
            else:
                if run >= max(8, int(0.045 * w)):
                    gaps += 1
                run = 0
        cols = max(1, min(4, gaps + 1)) if b_ink.mean() > 0.02 else 1
        if i == 0 and area < 0.18 and run_avg > 6:
            role = 'chrome-nav'
        elif i == len(spans) - 1 and area < 0.30:
            role = 'chrome-footer'
        else:
            role = 'main'
        blocks.append({
            'role': role, 'y0': round(y0 / h, 4), 'y1': round(y1 / h, 4),
            'x0': 0.0, 'x1': 1.0,
            'has_heading': bool(run_avg > 2 and bg_frac > 0.5),
            'has_cta': bool(run_avg > 2 and bg_frac < 0.9 and area < 0.25),
            'has_media': is_media,
            'has_form': False,
            'has_links': bool(run_avg > 12),
            'prose_mass': round(min(1.0, max(0.0, (0.9 - bg_frac)) * 1.4), 3)
                          if not is_media else 0.0,
            'area': round(area, 4), 'cols': cols,
            'run_avg': round(run_avg, 1), 'bg_frac': round(bg_frac, 3),
            'chroma': round(chroma_mean, 1), 'media_side': side,
        })

    chrome = [b for b in blocks if b['role'].startswith('chrome')]
    main_blocks = [b for b in blocks if b['role'] == 'main']
    non_chrome = 1 - sum(b['area'] for b in chrome)
    main_share = sum(b['area'] for b in main_blocks) / max(1e-6, non_chrome)
    edges_ok = all(
        (b['role'] != 'chrome-nav' or b['y0'] <= 0.15) and
        (b['role'] != 'chrome-footer' or b['y1'] >= 0.85) for b in chrome)
    idx = [i for i, b in enumerate(blocks) if b['role'] == 'main']
    contiguous = bool(idx) and idx == list(range(idx[0], idx[-1] + 1))
    media_blocks = [b for b in blocks if b['has_media']]
    media_bound = all(b['prose_mass'] > 0.05 or b['has_links'] or
                      b['has_heading'] for b in media_blocks) if media_blocks else True
    footer = [b for b in blocks if b['role'] == 'chrome-footer']
    footer_boiler = all(b['prose_mass'] < 0.3 for b in footer) if footer else True

    ps = {
        'block_role_uniqueness': 1.0 if all(b['role'] for b in blocks) else 0.0,
        'boilerplate_at_edges': 1.0 if edges_ok else 0.0,
        'main_content_share': round(min(1.0, max(0.0, main_share)), 4),
        'media_context_binding': 1.0 if media_bound else 0.0,
        'footer_is_boilerplate': 1.0 if footer_boiler else 0.0,
        'priority_order': 1.0 if contiguous else 0.0,
    }

    media_area = sum(b['area'] for b in media_blocks)
    ws = float(is_base.sum() / (h * w))
    cols = max(b['cols'] for b in main_blocks) if main_blocks else 1
    sides = [b['media_side'] for b in media_blocks if b['media_side'] != 'none']
    media_side = 'both' if 'both' in sides else (
        'left' if 'left' in sides else 'right' if 'right' in sides else 'none')
    dark = base_l < 110
    return {
        'file': path, 'w': int(w), 'h': int(h),
        'bg_lum': round(base_l, 1), 'dark_surface': bool(dark),
        'whitespace_share': round(min(1.0, max(0.0, ws)), 3),
        'ink_density': round(min(1.0, max(0.0, 1.0 - ws)), 3),
        'media_ratio': round(min(1.0, media_area), 3),
        'columns': int(cols),
        'media_side': media_side,
        'block_count': len(blocks),
        'ps': ps,
        'blocks': blocks,
    }


def main():
    args = sys.argv[1:]
    if not args:
        print(__doc__)
        return
    if args[0] == '--dir':
        files = []
        for root, _, names in os.walk(args[1]):
            for n in sorted(names):
                if n.lower().endswith(('.webp', '.png', '.jpg', '.jpeg')):
                    files.append(os.path.join(root, n))
    else:
        files = args
    for f in files:
        try:
            print(json.dumps(analyze(f)))
        except Exception as e:
            print(json.dumps({'file': f, 'error': str(e)}))


if __name__ == '__main__':
    main()
