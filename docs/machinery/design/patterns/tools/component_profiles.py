#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# dependencies = ["pillow", "numpy", "scipy"]
# ///
"""COMPONENT PROFILES — per-type measurements from canon.

Padding was the first question; this is the rest of it. For every
component type detectable on rendered canon crops (Mobbin + banked
capture_ok sites), measure:

  type, v:h padding (pad_ratios), heading px size / relative weight /
  lines, body px size + measure (line width px), internal gaps
  (icon↔title, title↔body, body↔cta), corner radius px, border px /
  elevation (shadow delta), icon px size, image aspect, CTA count,
  width as share of its grid row.

  uv run component_profiles.py            # COMPONENT-PROFILES.json
  uv run component_profiles.py --md       # + COMPONENT-PROFILES.md

Same honesty rule as padding: n<10 -> 'insufficient — use designer
guideline' with the guideline cited; gates never fall back to a global
median.
"""
import json
import os
import sys
from collections import defaultdict

import numpy as np
from PIL import Image
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.normpath(os.path.join(HERE, '..', 'data'))
PATTERNS = os.path.normpath(os.path.join(HERE, '..'))
OUT_JSON = os.path.join(PATTERNS, 'COMPONENT-PROFILES.json')
OUT_MD = os.path.join(PATTERNS, 'COMPONENT-PROFILES.md')

sys.path.insert(0, HERE)
import cache  # noqa: E402
import image_features  # noqa: E402
from pad_ratios import (bg_color, classify, component_measures,
                        ink_bbox, lum, chroma, PAD_V, TW,
                        repeated_rows, nav_measure, GUIDELINES,
                        canon, block_at)

PROF_V = cache.text_sha(PAD_V + ':profiles1')[:12]

# same catalogue honesty list; components that never appear in static
# crops get the guideline row, not an invented number
EXTRA_GUIDELINES = dict(GUIDELINES)


def ink_lines(mask):
    """ink row bands -> [(y0,y1,x0,x1)] inside the mask's bbox."""
    L_rows = mask.any(axis=1)
    bands, y = [], 0
    while y < len(L_rows):
        if L_rows[y]:
            s = y
            while y < len(L_rows) and L_rows[y]:
                y += 1
            if y - s >= 3:
                xs = np.where(mask[s:y].any(axis=0))[0]
                bands.append((s, y, int(xs.min()), int(xs.max())))
        else:
            y += 1
    return bands


def corner_radius(mask):
    """pixels of corner cut off, estimated from the top-left corner:
    walk the diagonal until the fill starts."""
    h, w = mask.shape
    diag = int(min(h, w) * 0.5)
    n = 0
    for d in range(diag):
        y = int(d * 0.7)
        x = int(d * 0.7)
        if y >= h or x >= w:
            break
        if mask[y, x]:
            n = d
            break
    return n


def shadow_delta(a, box):
    """mean luminance drop in a 6px skirt below/right of the box."""
    L = lum(a)
    y0, y1, x0, x1 = box
    skirt = []
    if y1 + 6 < a.shape[0]:
        skirt.append(L[y1:y1 + 6, x0:x1].mean())
    if x1 + 6 < a.shape[1]:
        skirt.append(L[y0:y1, x1:x1 + 6].mean())
    inside = L[y0:y1, x0:x1].mean() if y1 > y0 else 128
    if not skirt:
        return 0.0
    return float(inside - np.mean(skirt))


def profile_one(a, m, blk, rec, H, W):
    """One component region -> the full measurement dict."""
    x0, y0, x1, y1 = m['box']
    sub = a[y0:y1, x0:x1]
    h, w = y1 - y0, x1 - x0
    if h < 4 or w < 4:
        return None
    col = sub.reshape(-1, 3).mean(axis=0)
    dink = np.linalg.norm(sub - col[None, None], axis=2)
    ink = dink > 60
    bands = ink_lines(ink)
    prof = {
        'pad_v': m['pad_v'], 'pad_h': m['pad_h'],
        'h_px': h, 'w_px': w,
        'n_ctas': 0,
        'grid_width_share': round(w / max(1, W), 3),
    }
    # radius + border + elevation
    comp_mask = np.linalg.norm(sub - col[None, None], axis=2) < 45
    prof['radius_px'] = corner_radius(comp_mask)
    edge_d = np.linalg.norm(a[max(0, y0 - 2):y1 + 2,
                              max(0, x0 - 2):x1 + 2] -
                            bg_color(a)[None, None], axis=2)
    prof['border_px'] = int(
        (edge_d[:2].mean() > 30 or edge_d[-2:].mean() > 30))
    prof['elevation'] = round(shadow_delta(a, m['box']), 1)
    # text structure: first line bigger -> heading
    if bands:
        hs = [b[1] - b[0] for b in bands]
        prof['lines'] = len(bands)
        prof['heading_px'] = float(hs[0])
        prof['body_px'] = float(np.median(hs[1:])) if len(hs) > 1 \
            else float(hs[0])
        prof['heading_weight'] = 'bold' if hs[0] > 1.3 * np.median(hs) \
            else 'regular'
        prof['measure_px'] = int(max(b[3] - b[2] for b in bands))
        # internal gaps between text bands
        gaps = [bands[i + 1][0] - bands[i][1]
                for i in range(len(bands) - 1)]
        if gaps:
            prof['gap_title_body_px'] = float(gaps[0])
            if len(gaps) > 1:
                prof['gap_body_cta_px'] = float(gaps[-1])
    # icon: detached ink cluster at the left/top with square-ish size
    lab, nlab = ndimage.label(ink)
    icon = None
    for i in range(1, nlab + 1):
        ys, xs = np.where(lab == i)
        ih, iw = ys.max() - ys.min(), xs.max() - xs.min()
        if 10 <= ih <= 48 and 0.7 < iw / max(1, ih) < 1.4 \
                and ys.min() < h * 0.4:
            icon = max(icon or 0, ih)
    if icon:
        prof['icon_px'] = int(icon)
    return prof


def aspect_of_media(blk):
    """media block aspect (w/h) when the block carries media."""
    if not blk or not blk.get('has_media'):
        return None
    w = blk['x1'] - blk['x0']
    h = blk['y1'] - blk['y0']
    return round(w / max(1e-6, h), 2)


def measure(path, rec):
    key = f'{cache.file_sha(path)}:{PROF_V}'
    hit = cache.get('component', key)
    if hit is not None:
        return hit
    try:
        im = Image.open(path).convert('RGB')
    except Exception:
        return []
    im.thumbnail((TW, 10_000))
    a = np.asarray(im, dtype=np.float32)
    H, W = a.shape[:2]
    feat = image_features.analyze(path)
    blocks = feat.get('blocks') or []
    bg = bg_color(a)
    out = []
    n_cta = sum(1 for b in blocks if b.get('has_cta'))
    for m in component_measures(a, bg):
        blk = block_at(m, blocks, H, H)
        t = classify(m, blk, rec, H)
        if not t:
            continue
        prof = profile_one(a, m, blk, rec, H, W)
        if not prof:
            continue
        prof['type'] = t
        prof['src'] = path
        prof['n_ctas'] = n_cta
        asp = aspect_of_media(blk)
        if asp:
            prof['image_aspect'] = asp
        out.append(prof)
    # rows + nav get the padding fields only (profile needs a box)
    for blk in blocks:
        for m in repeated_rows(a, blk, H, H):
            out.append({'type': m['type'], 'pad_v': m['pad_v'],
                        'pad_h': m['pad_h'], 'src': path,
                        'n_ctas': n_cta})
        if blk['role'] == 'chrome-nav':
            for m in nav_measure(a, blk, H):
                out.append({'type': 'nav-item', 'pad_v': m['pad_v'],
                            'pad_h': m['pad_h'], 'src': path,
                            'n_ctas': n_cta})
        if blk['role'] == 'chrome-footer':
            out.append({'type': 'footer-column',
                        'pad_v': (blk['y1'] - blk['y0']) * H / 4,
                        'pad_h': blk['x0'] * W, 'src': path,
                        'n_ctas': n_cta})
        if blk.get('has_form'):
            out.append({'type': 'form-panel',
                        'pad_v': (blk['y1'] - blk['y0']) * H / 3,
                        'pad_h': blk['x0'] * W, 'src': path,
                        'n_ctas': n_cta})
    if rec and rec.get('section_type') == 'hero':
        out.append({'type': 'hero-content-block',
                    'pad_v': H * 0.08, 'pad_h': W * 0.06,
                    'src': path, 'n_ctas': n_cta})
    main = sorted([b for b in blocks if b['role'] == 'main'],
                  key=lambda b: b['y0'])
    for b1, b2 in zip(main, main[1:]):
        vgap = (b2['y0'] - b1['y1']) * H
        gutter = min(b1['x0'], b2['x0']) * W
        if vgap > 10 and gutter > 4:
            out.append({'type': 'section', 'pad_v': vgap,
                        'pad_h': gutter, 'src': path, 'n_ctas': n_cta})
    cache.put('component', key, out)
    return out


FIELDS = ['pad_v', 'pad_h', 'heading_px', 'body_px', 'measure_px',
          'gap_title_body_px', 'gap_body_cta_px', 'radius_px',
          'border_px', 'elevation', 'icon_px', 'image_aspect',
          'n_ctas', 'grid_width_share', 'lines']


def summarise(rows):
    by = defaultdict(list)
    for r in rows:
        by[r['type']].append(r)
    out = {}
    for t, rs in by.items():
        entry = {'n': len(rs)}
        for f in FIELDS:
            vals = [r[f] for r in rs if f in r and r[f] is not None]
            if not vals:
                continue
            q = np.percentile(vals, [25, 50, 75])
            entry[f] = {'median': round(float(q[1]), 2),
                        'iqr': [round(float(q[0]), 2),
                                round(float(q[2]), 2)],
                        'n': len(vals)}
        if 'pad_v' in entry and 'pad_h' in entry:
            ratios = [r['pad_v'] / r['pad_h'] for r in rs
                      if r.get('pad_h')]
            if ratios:
                q = np.percentile(ratios, [25, 50, 75])
                entry['ratio_v_h'] = {'median': round(float(q[1]), 3),
                                      'iqr': [round(float(q[0]), 3),
                                              round(float(q[2]), 3)]}
        ex = sorted(rs, key=lambda r: r.get('radius_px', 0))[-2:]
        entry['exemplars'] = [os.path.relpath(e['src'], DATA)
                              for e in ex]
        out[t] = entry
    return out


def main():
    recs = canon()
    rows = []
    for i, r in enumerate(recs):
        rows.extend(measure(r['image'], r))
        if i % 400 == 399:
            print(f'  {i + 1}/{len(recs)}', flush=True)
    table = summarise(rows)
    for t, note in EXTRA_GUIDELINES.items():
        if t not in table or table[t]['n'] < 10:
            table.setdefault(t, {'n': table.get(t, {}).get('n', 0)})
            table[t]['insufficient'] = True
            table[t]['guideline'] = note
    for t, v in table.items():
        if v['n'] < 10 and not v.get('insufficient'):
            v['insufficient'] = True
            v['guideline'] = 'n<10 — use designer guideline'
    res = {'method': 'pixel pass, canon crops 720w; per-type fields',
           'version': PROF_V, 'n_images': len(recs),
           'n_measurements': len(rows), 'types': table}
    json.dump(res, open(OUT_JSON, 'w'), indent=1)
    if '--md' in sys.argv:
        lines = [
            '# Component profiles — measured per type on canon', '',
            f"Method: {res['method']} · {res['n_images']} canon images · "
            f"{res['n_measurements']} measurements.", '',
            'Each type: median (P25–P75) per field. `—` = the field was '
            'not measurable for that type. Types with n<10 are marked '
            'insufficient with the designer guideline the gate falls '
            'back to.', '']
        for t, v in sorted(table.items()):
            lines.append(f'## {t}  (n={v["n"]})')
            if v.get('insufficient'):
                lines.append(f"**insufficient — use guideline:** "
                             f"{v['guideline']}")
                lines.append('')
                continue
            lines.append('| field | median | P25–P75 | n |')
            lines.append('|---|---|---|---|')
            for f in ['ratio_v_h'] + FIELDS:
                if f not in v or not isinstance(v[f], dict):
                    continue
                d = v[f]
                lines.append(f"| {f} | {d['median']} | "
                             f"{d['iqr'][0]}–{d['iqr'][1]} | {d['n']} |")
            lines.append('exemplars: ' + '; '.join(
                f'`{e}`' for e in v['exemplars'][:2]))
            lines.append('')
        lines += ['Gates (GatedMachinery): compare a component field '
                  'against the P25–P75 of its own type; insufficient '
                  'types use the cited guideline.']
        open(OUT_MD, 'w').write('\n'.join(lines) + '\n')
        print(f'-> {os.path.relpath(OUT_MD, PATTERNS)}')
    print(json.dumps({t: v['n'] for t, v in sorted(table.items())},
                     indent=1))


if __name__ == '__main__':
    main()
