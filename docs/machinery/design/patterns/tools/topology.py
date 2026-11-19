#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# dependencies = ["pillow", "numpy"]
# ///
"""Layout topology — the finite recipe axis.

Every canon section is a box-tree: which recipe it is + how its edges
are treated. Measured on the block list each annotation already
carries (image_features.py) plus the crop itself — no extra rendering.

Per record: `topo` = {
  topology_id, nesting_depth, direction_ratio, edge_visibility,
  column_span_hist, centering_bias, contained_share, bento,
  seam_style, containment}

  uv run topology.py            # tag annotations.jsonl in place
  uv run topology.py --report   # recipe distribution
"""
import json
import os
import sys
from collections import Counter, defaultdict

import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.normpath(os.path.join(HERE, '..', 'data'))
ANN = os.path.join(DATA, 'annotations.jsonl')

sys.path.insert(0, HERE)
import cache  # noqa: E402

TOPO_V = cache.text_sha(open(__file__, 'rb').read().hex())[:12]
TW = 640


def lum(a):
    return 0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2]


def classify(rec, feat):
    """One crop -> topo dict."""
    blocks = rec.get('blocks') or []
    st = rec.get('section_type') or 'content'
    mr = rec.get('media_ratio') or 0
    cols = rec.get('columns') or 1
    out = {}
    # --- topology_id: section recipe from structure ---
    if st in ('nav', 'headers'):
        tid = 'nav-top-bar' if cols <= 2 else 'nav-overlay'
    elif st == 'footer':
        tid = 'nav-sidebar' if cols > 3 else 'band-rows'
    elif st == 'hero':
        pos = feat.get('media_pos') or 'bg'
        if mr > 0.7:
            tid = 'hero-media-bg'
        elif mr > 0.25 and cols >= 2:
            tid = 'hero-media-right'
        elif mr > 0.25:
            tid = 'hero-media-top'
        else:
            tid = 'hero-no-media'
    elif cols >= 4:
        tid = f'grid-{cols}col-uniform'
    elif cols == 3:
        tid = 'grid-3col-uniform'
    elif cols == 2 and mr > 0.2:
        tid = 'split-50-50'
    elif st in ('pricing', 'grids-and-cards', 'feature',
                'product-grid', 'work-grid'):
        tid = f'grid-{max(2, cols)}col-uniform'
    elif st in ('testimonials', 'reviews'):
        tid = 'list-cards' if cols > 1 else 'list-vertical-rows'
    elif st in ('logo-sections', 'trust-badges', 'counter'):
        tid = 'band-strip'
    elif st in ('form', 'contact', 'newsletter', 'call-to-action'):
        tid = 'form-split' if cols >= 2 else 'form-centered'
    elif st in ('faq',):
        tid = 'list-vertical-rows'
    elif mr > 0.5:
        tid = 'band-media'
    else:
        tid = 'list-vertical-rows' if cols == 1 else \
            f'grid-{cols}col-uniform'
    out['topology_id'] = tid
    # --- nesting depth + direction ratio from blocks ---
    depths = [b.get('depth', 1) for b in blocks]
    out['nesting_depth'] = max(depths) if depths else 1
    h_kids = v_kids = 0
    for b in blocks:
        (h_kids := h_kids + 1) if (b.get('w') or 0) < 0.8 else \
            (v_kids := v_kids + 1)
    tot = h_kids + v_kids
    out['direction_ratio'] = round(h_kids / tot, 2) if tot else 0.0
    # --- column span histogram ---
    spans = Counter()
    for b in blocks:
        w = b.get('w') or 1.0
        spans[f'{int(round(w * cols))}of{cols}'] += 1
    out['column_span_hist'] = dict(spans.most_common(6))
    # --- centering bias: mean x-center of text blocks ---
    xs = [b.get('x', 0.0) + (b.get('w') or 0) / 2
          for b in blocks if b.get('has_text')]
    if xs:
        m = float(np.mean(xs))
        out['centering_bias'] = ('centered' if 0.45 <= m <= 0.55
                                 else 'left' if m < 0.45 else 'right')
    else:
        out['centering_bias'] = 'na'
    # --- contained vs bleed: block width vs content column ---
    bleed = sum(1 for b in blocks if (b.get('w') or 0) >= 0.97)
    out['contained_share'] = round(
        1 - bleed / len(blocks), 2) if blocks else 1.0
    # --- bento: are sibling widths non-uniform? ---
    ws = sorted({round(b.get('w') or 0, 2) for b in blocks})
    out['bento'] = len([w for w in ws if w not in (0, 1.0)]) > 1
    # --- edge visibility + seam style from the pixels ---
    im = Image.open(rec['image']).convert('RGB')
    im.thumbnail((TW, 10_000))
    a = np.asarray(im, dtype=np.float32)
    L = lum(a)
    rows_l = L.mean(axis=1)
    grad = np.abs(np.gradient(rows_l))
    # seams = rows whose luminance jumps (edge) vs stays (whitespace)
    seam_jumps = (grad > 12).sum()
    seam_soft = ((grad > 3) & (grad <= 12)).sum()
    hair = (a.max(axis=2) - a.min(axis=2) < 14) & (L < 235) & (L > 60)
    hair_rows = hair.mean(axis=1) > 0.6
    out['edge_visibility'] = (
        'hairline' if hair_rows.sum() > 4 else
        'overlap' if seam_jumps > 30 else 'whitespace')
    out['seam_style'] = (
        'solid' if hair_rows.sum() > 6 else
        'torn' if seam_jumps > 40 else
        'tonal' if seam_soft > 20 else 'whitespace')
    out['containment'] = min(4, out['nesting_depth'])
    return out


def measure(rec):
    p = rec.get('image')
    if not p or not os.path.exists(p):
        return None
    key = f'{cache.file_sha(p)}:{TOPO_V}'
    hit = cache.get('topo', key)
    if hit is not None:
        return hit
    try:
        import image_features
        feat = {'media_pos': None}
        out = classify(rec, feat)
    except Exception:
        return None
    cache.put('topo', key, out)
    return out


def _work(r):
    return measure(r)


def main():
    if '--report' in sys.argv:
        c = Counter()
        for line in open(ANN):
            t = (json.loads(line).get('topo') or {}).get('topology_id')
            if t:
                c[t] += 1
        for k, v in c.most_common(30):
            print(f'{v:5d}  {k}')
        return
    recs = [json.loads(l) for l in open(ANN)]
    import multiprocessing as mp
    with mp.Pool(max(2, min(8, mp.cpu_count() - 2))) as pool:
        n = 0
        for r, t in zip(recs, pool.imap(_work, recs, chunksize=16)):
            if t:
                r['topo'] = t
                n += 1
    with open(ANN, 'w') as f:
        for r in recs:
            f.write(json.dumps(r) + '\n')
    print(f'{n}/{len(recs)} topology-tagged')


if __name__ == '__main__':
    main()
