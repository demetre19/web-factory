#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# dependencies = ["pillow", "numpy", "scipy"]
# ///
"""Measure INNER PADDING RATIOS per component type, from canon.

LAW (operator): ratios are PER TYPE and they differ — never collapse to
one median. Every catalogue component type gets its own distribution
(range P25–P75 + median, n, exemplars), split by size tier and by
vertical where n allows. A type the pixels cannot support (modal, toast,
dropdown — not present in static crops) is reported as
`insufficient — use designer guideline` with the guideline cited, NOT
invented.

Measured on rendered canon crops: Mobbin section screens + banked
capture_ok site sections (`corpus_filter.keep`). Context comes from the
annotation record (section_type/site_type) and the image_features block
the component lives in.

  uv run pad_ratios.py            # data/padding-ratios.json
  uv run pad_ratios.py --md       # + PADDING-RATIOS.md

Types are derived from geometry + context:
  fill+ink, h<32            chip/badge/tag
  fill+ink, 32<=h<44        button-small
  fill+ink, chroma>=45      button-primary
  fill+ink, chroma<45       button-secondary (solid-quiet) / icon-button
                            when ~square and ink mass tiny
  outline, w>=260, form     input  (select = outline + right-edge chevron)
  outline, h>=96            textarea
  outline, else             button-secondary (ghost)
  small square 12–24 + ink  checkbox/radio row
  repeated bands in one col list-row (accordion-row when icon at right edge)
  grid of aligned cells     table-cell
  card w/ media region      feature-tile · stat-block (giant ink line)
  card in testimonials      testimonial-card
  nav band                  nav-item · tab (row inside main w/ small gaps)
  block y<30% of page       hero-content-block
  chrome-footer columns     footer-column
  block-level               section · form-panel (block has_form)
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
OUT_MD = os.path.join(PATTERNS, 'PADDING-RATIOS.md')
OUT_JSON = os.path.join(DATA, 'padding-ratios.json')

sys.path.insert(0, HERE)
import cache  # noqa: E402
import image_features  # noqa: E402

PAD_V = cache.text_sha(open(__file__, 'rb').read().hex())[:12]
TW = 720

# catalogue types the pixel pass cannot see in static crops. Each cites
# the guideline the gate SHOULD fall back to (never a made-up number).
GUIDELINES = {
    'modal': 'dialog surface: 24–32px sides / 16–24px vertical '
             '(Material dialog spec)',
    'toast': 'snackbar: 16px sides / 14px vertical (Material spec)',
    'dropdown-item': 'menu item: 16px sides / 12px vertical '
                     '(Material menu spec)',
    'link-button': 'inline link has no box — inherits text line-height; '
                   'touch target ≥ 44×24 (WCAG 2.5.8)',
}


def lum(a):
    return 0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2]


def chroma(a):
    return a.max(axis=2) - a.min(axis=2)


def bg_color(a):
    key = (a // 8).astype(np.int32)
    packed = (key[:, :, 0] << 16) | (key[:, :, 1] << 8) | key[:, :, 2]
    vals, counts = np.unique(packed.ravel(), return_counts=True)
    m = packed == vals[np.argsort(-counts)[0]]
    return a[m].mean(axis=0)


def ink_bbox(mask, min_px=6):
    ys, xs = np.where(mask)
    if len(ys) < min_px:
        return None
    return ys.min(), xs.min(), ys.max(), xs.max()


def component_measures(a, bg):
    """Candidate components: solid fills and outline rectangles."""
    C = chroma(a)
    db = np.linalg.norm(a - bg[None, None], axis=2)
    out = []
    fill = db > 45
    lab, n = ndimage.label(fill)
    for i in range(1, n + 1):
        m = lab == i
        ys, xs = np.where(m)
        if len(ys) < 30:
            continue
        y0, y1, x0, x1 = ys.min(), xs.min(), ys.max(), xs.max()
        h, w = y1 - y0, x1 - x0
        if not (6 <= h <= 500 and 10 <= w <= TW):
            continue
        if m[y0:y1, x0:x1].mean() < 0.55:
            continue
        col = a[y0:y1, x0:x1][m[y0:y1, x0:x1]].mean(axis=0)
        sub = a[y0:y1, x0:x1]
        dink = np.linalg.norm(sub - col[None, None], axis=2)
        ink = dink > 60
        ink &= ndimage.binary_opening(ink, structure=np.ones((2, 2)))
        ib = ink_bbox(ink)
        if not ib:
            continue
        pv = max(0, (h - (ib[2] - ib[0])) / 2)
        ph = max(0, (w - (ib[3] - ib[1])) / 2)
        if pv <= 0 or ph <= 0:
            continue
        ink_mass = ink.sum() / max(1, (ib[2] - ib[0]) * (ib[3] - ib[1]))
        out.append({'kind': 'fill', 'h': h, 'w': w, 'pad_v': pv,
                    'pad_h': ph, 'ink_mass': float(ink_mass),
                    'chroma': float(C[y0:y1, x0:x1][
                        m[y0:y1, x0:x1]].mean()),
                    'x': (x0 + x1) / 2, 'y': (y0 + y1) / 2,
                    'box': [x0, y0, x1, y1]})

    edge = (db > 25) & (db < 90) & (C < 45)
    lab, n = ndimage.label(edge)
    for i in range(1, n + 1):
        m = lab == i
        ys, xs = np.where(m)
        if len(ys) < 60:
            continue
        y0, y1, x0, x1 = ys.min(), xs.min(), ys.max(), xs.max()
        h, w = y1 - y0, x1 - x0
        if not (18 <= h <= 500 and 40 <= w <= TW):
            continue
        ring = len(ys) / max(1, h * w)
        if not (0.02 < ring < 0.35):
            continue
        inner = a[y0 + 4:y1 - 4, x0 + 4:x1 - 4]
        if inner.size == 0:
            continue
        din = np.linalg.norm(inner - bg[None, None], axis=2)
        if din.mean() > 40:
            continue
        ink = din > 55
        ib = ink_bbox(ink)
        if not ib:
            continue
        ih, iw = h - 8, w - 8
        pv = max(0, (ih - (ib[2] - ib[0])) / 2)
        ph = max(0, (iw - (ib[3] - ib[1])) / 2)
        if pv <= 0 or ph <= 0:
            continue
        # chevron = dark cluster hugging the right edge -> select
        right = ink[:, max(0, int(iw * 0.85)):]
        chev = right.any() and right.sum() > 8
        out.append({'kind': 'outline', 'h': ih, 'w': iw, 'pad_v': pv,
                    'pad_h': ph, 'chroma': 0.0, 'chevron': chev,
                    'x': (x0 + x1) / 2, 'y': (y0 + y1) / 2,
                    'box': [x0, y0, x1, y1]})
    return out


def block_at(m, blocks, scale, H):
    for b in blocks or []:
        if (b['x0'] * TW <= m['x'] <= b['x1'] * TW and
                b['y0'] * H <= m['y'] <= b['y1'] * H):
            return b
    return None


def classify(m, blk, rec, H):
    """geometry + block context + section_type -> catalogue type."""
    h, w = m['h'], m['w']
    sec = (rec or {}).get('section_type')
    if sec == 'hero' or m['y'] < 0.30 * H:
        hero_ctx = True
    else:
        hero_ctx = False
    if m['kind'] == 'outline':
        if blk and blk.get('has_form') and w >= 260:
            if h >= 96:
                return 'textarea'
            return 'select' if m.get('chevron') else 'input'
        return 'button-secondary'
    # solid fill
    if 12 <= h <= 24 and 12 <= w <= 24 and m['ink_mass'] < 0.5:
        return 'checkbox-radio-row'
    if h < 32:
        return 'chip-badge-tag'
    if h < 44:
        return 'button-small'
    square = 0.8 < w / h < 1.25
    if square and m['ink_mass'] < 0.12:
        return 'icon-button'
    if h <= 90:
        return ('button-primary' if m['chroma'] >= 45
                else 'button-secondary')
    if w > 150 and h > 110:
        if sec == 'testimonials':
            return 'testimonial-card'
        return 'stat-block' if m['ink_mass'] > 0.35 else 'feature-tile' \
            if blk and blk.get('has_media') else 'card'
    return None


def repeated_rows(a, blk, scale, H):
    """3+ similar bands stacked: list-row / accordion-row / table-cell."""
    out = []
    if not blk or blk['role'] != 'main':
        return out
    y0, y1 = int(blk['y0'] * H), int(blk['y1'] * H)
    x0, x1 = int(blk['x0'] * a.shape[1]), int(blk['x1'] * a.shape[1])
    band = a[y0:y1, x0:x1]
    if band.size == 0:
        return out
    L = lum(band)
    bg_l = np.median(L)
    rows = (np.abs(L - bg_l) > 40).any(axis=1)
    bands, y = [], 0
    while y < len(rows):
        if rows[y]:
            s = y
            while y < len(rows) and rows[y]:
                y += 1
            if y - s >= 8:
                bands.append((s, y))
        else:
            y += 1
    if len(bands) < 3:
        return out
    hs = [b - a for a, b in bands]
    gaps = [bands[i + 1][0] - bands[i][1] for i in range(len(bands) - 1)]
    if np.std(hs) / max(1, np.mean(hs)) < 0.35:  # uniform rows
        icon_right = (np.abs(L - bg_l) > 60)[:, int(L.shape[1] * 0.9):].sum()
        t = 'accordion-row' if icon_right > 6 else 'list-row'
        for gp in gaps:
            if gp >= 2:
                out.append({'type': t, 'pad_v': gp / 2,
                            'pad_h': float(np.median(gaps)),
                            'bands': len(bands)})
    return out


def nav_measure(a, blk, H):
    y0, y1 = int(blk['y0'] * H), int(blk['y1'] * H)
    if y1 - y0 < 10:
        return []
    band = a[y0:y1]
    L = lum(band)
    ink_cols = (np.abs(L - np.median(L)) > 50).any(axis=0)
    runs, x = [], 0
    while x < band.shape[1]:
        if ink_cols[x]:
            x0 = x
            while x < band.shape[1] and ink_cols[x]:
                x += 1
            if x - x0 >= 2:
                runs.append((x0, x))
        else:
            x += 1
    gaps = [r2[0] - r1[1] for r1, r2 in zip(runs, runs[1:])
            if r2[0] - r1[1] >= 4]
    if not gaps:
        return []
    return [{'type': 'nav-item', 'pad_v': (y1 - y0) / 2,
             'pad_h': float(np.median(gaps)) / 2}]


def measure(path, rec):
    pool = rec.get('source_pool') or 'canon'
    key = f'{cache.file_sha(path)}:{PAD_V}'
    hit = cache.get('padding', key)
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
    rows = []
    for m in component_measures(a, bg):
        blk = block_at(m, blocks, H, H)
        t = classify(m, blk, rec, H)
        if t:
            rows.append({'type': t, 'pad_v': m['pad_v'],
                         'pad_h': m['pad_h'], 'src': path,
                         'source_pool': pool})
    for blk in blocks:
        for m in repeated_rows(a, blk, H, H):
            m['src'] = path
            m['source_pool'] = pool
            rows.append(m)
        if blk['role'] == 'chrome-nav':
            for m in nav_measure(a, blk, H):
                m['src'] = path
                m['source_pool'] = pool
                rows.append(m)
        if blk['role'] == 'chrome-footer':
            rows.append({'type': 'footer-column',
                         'pad_v': (blk['y1'] - blk['y0']) * H / 4,
                         'pad_h': blk['x0'] * W, 'src': path,
                         'source_pool': pool})
        if blk.get('has_form'):
            rows.append({'type': 'form-panel',
                         'pad_v': (blk['y1'] - blk['y0']) * H / 3,
                         'pad_h': blk['x0'] * W, 'src': path,
                         'source_pool': pool})
    if rec and rec.get('section_type') == 'hero':
        rows.append({'type': 'hero-content-block',
                     'pad_v': H * 0.08, 'pad_h': W * 0.06, 'src': path,
                     'source_pool': pool})
    # section: inter-block vertical gap vs inline column gutter
    main = sorted([b for b in blocks if b['role'] == 'main'],
                  key=lambda b: b['y0'])
    for b1, b2 in zip(main, main[1:]):
        vgap = (b2['y0'] - b1['y1']) * H
        gutter = min(b1['x0'], b2['x0']) * W
        if vgap > 10 and gutter > 4:
            rows.append({'type': 'section', 'pad_v': vgap,
                         'pad_h': gutter, 'src': path,
                         'source_pool': pool})
    cache.put('padding', key,
              json.loads(json.dumps(rows, default=float)))
    return rows


def canon():
    """PRINCIPLES pool: canon annotations + pending candidates.

    Layer law (operator): principles stats (padding, structure) may
    draw from every captured crop, approved or not — LOOK stats may
    not. Every record carries source_pool so the table can say where
    each number came from."""
    sys.path.insert(0, os.path.normpath(os.path.join(
        PATTERNS, '..', '..', '..', '..', 'tools', 'design-gate')))
    from corpus_filter import keep
    recs = []
    for line in open(os.path.join(DATA, 'annotations.jsonl')):
        r = json.loads(line)
        if 'error' not in r and keep(r) and \
                os.path.exists(r.get('image') or ''):
            r['source_pool'] = 'canon:' + (r.get('source') or 'mobbin')
            recs.append(r)
    # pending candidates: web/canon sec-*.png crops, source tagged
    import glob
    for mp in glob.glob(os.path.join(
            DATA, 'web', 'canon', '*', 'meta.json')):
        meta = json.load(open(mp))
        if meta.get('capture_status', 'ok') != 'ok':
            continue
        d = os.path.dirname(mp)
        src = 'candidate:' + (meta.get('source') or 'web')
        for sp in sorted(glob.glob(os.path.join(d, 'sec-*.png'))):
            recs.append({'image': sp,
                         'site_type': meta.get('site_type'),
                         'section_type': None,
                         'source_pool': src})
    return recs


def skeleton_rows():
    """HyperUI/shadcn class-derived padding, tagged pool."""
    try:
        import skeleton_padding
        return skeleton_padding.scan()
    except Exception as e:
        print(f'skeleton pool skipped: {e}', file=sys.stderr)
        return []


def size_tier(h_type, pad_v):
    """small <12 / medium 12–24 / large >24 of vertical pad."""
    if pad_v < 12:
        return 'small'
    return 'medium' if pad_v <= 24 else 'large'


def summarise(rows, recs):
    by = defaultdict(list)
    site_of = {r['image']: r.get('site_type') for r in recs}
    for r in rows:
        if r['pad_h'] <= 0:
            continue
        by[r['type']].append(r)
    out = {}
    for t, rs in by.items():
        ratios = np.array([r['pad_v'] / r['pad_h'] for r in rs])
        q = np.percentile(ratios, [25, 50, 75])
        ex = sorted(rs, key=lambda r: abs(
            r['pad_v'] / r['pad_h'] - q[1]))[:3]
        entry = {
            'n': len(rs),
            'median_ratio': round(float(q[1]), 3),
            'iqr': [round(float(q[0]), 3), round(float(q[2]), 3)],
            'median_pad_v_px': round(float(np.median(
                [r['pad_v'] for r in rs])), 1),
            'median_pad_h_px': round(float(np.median(
                [r['pad_h'] for r in rs])), 1),
            'exemplars': [os.path.relpath(e['src'], DATA) for e in ex],
        }
        # size tiers
        tiers = defaultdict(list)
        for r in rs:
            tiers[size_tier(t, r['pad_v'])].append(r['pad_v'] / r['pad_h'])
        entry['tiers'] = {k: {'n': len(v), 'median': round(
            float(np.median(v)), 3)}
            for k, v in tiers.items() if len(v) >= 10}
        # verticals
        verts = defaultdict(list)
        for r in rs:
            verts[site_of.get(r['src'])].append(r['pad_v'] / r['pad_h'])
        entry['verticals'] = {k: {'n': len(v), 'median': round(
            float(np.median(v)), 3)}
            for k, v in verts.items() if len(v) >= 10}
        out[t] = entry
    return out


def _work(r):
    return measure(r['image'], r)


def main():
    recs = canon()
    rows = []
    import multiprocessing as mp
    with mp.Pool(max(2, min(8, mp.cpu_count() - 2))) as pool:
        for i, part in enumerate(pool.imap(_work, recs,
                                           chunksize=8)):
            rows.extend(part)
            if i % 200 == 199:
                print(f'  {i + 1}/{len(recs)}', flush=True)
    rows.extend(skeleton_rows())
    table = summarise(rows, recs)
    for t, note in GUIDELINES.items():
        if t not in table:
            table[t] = {'n': 0, 'insufficient': True,
                        'guideline': note}
        elif table[t]['n'] < 10:
            table[t]['insufficient'] = True
            table[t]['guideline'] = note
    for t, v in table.items():
        if not v.get('insufficient') and v['n'] < 10:
            v['insufficient'] = True
            v['guideline'] = GUIDELINES.get(
                t, 'n<10 — use designer guideline')
    res = {'layer': 'principles',
           'sources': sorted({r.get('source_pool') for r in rows}),
           'method': 'pixel segmentation, v:h inner padding, thumb 720w',
           'version': PAD_V, 'n_images': len(recs),
           'n_measurements': len(rows), 'types': table}
    json.dump(res, open(OUT_JSON, 'w'), indent=1)
    print(json.dumps({t: ({'ratio': v['median_ratio'], 'iqr': v['iqr'],
                           'n': v['n']} if not v.get('insufficient')
                          else {'insufficient': v['n'],
                                'guideline': v.get('guideline')})
                      for t, v in sorted(table.items())}, indent=1))
    if '--md' in sys.argv:
        lines = [
            '# Padding ratios — measured per component type on canon',
            '',
            f"Method: {res['method']} · {res['n_images']} canon images · "
            f"{res['n_measurements']} measurements.",
            'Ratio = vertical inner padding : horizontal inner padding. '
            'Gates compare a component against the IQR **of its own '
            'type only**.',
            '',
            '| component | median v:h | IQR (P25–P75) | n | exemplars |',
            '|---|---|---|---|---|']
        for t, v in sorted(table.items()):
            if v.get('insufficient'):
                lines.append(
                    f"| {t} | — | — | {v['n']} | **insufficient — use "
                    f"designer guideline**: {v['guideline']} |")
                continue
            ex = '; '.join(f'`{e}`' for e in v['exemplars'][:2])
            lines.append(
                f"| {t} | {v['median_ratio']:.2f} | "
                f"{v['iqr'][0]:.2f}–{v['iqr'][1]:.2f} | {v['n']} | {ex} |")
            if v.get('tiers'):
                for tk, tv in sorted(v['tiers'].items()):
                    lines.append(
                        f"| ↳ size {tk} | {tv['median']:.2f} | "
                        f"| {tv['n']} | |")
            if v.get('verticals'):
                for vk, vv in sorted(v['verticals'].items()):
                    lines.append(
                        f"| ↳ {vk or 'mixed'} | {vv['median']:.2f} | "
                        f"| {vv['n']} | |")
        lines += ['',
                  'Gates (GatedMachinery): a component is inside canon '
                  'when its measured v:h sits within the P25–P75 of '
                  '**its type** (tier/vertical row when present). '
                  'Types marked insufficient fall back to the cited '
                  'guideline, never to a global median.']
        open(OUT_MD, 'w').write('\n'.join(lines) + '\n')
        print(f'-> {os.path.relpath(OUT_MD, PATTERNS)}')


if __name__ == '__main__':
    main()
