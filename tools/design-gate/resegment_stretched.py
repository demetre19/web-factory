"""Re-segment operator captures that passed as ok but are stretched.

The DOM detector sometimes takes a page wrapper as one section (e.g. a
single 8372px "section"). capture_ok only inspects pixel blocks in
tile-00, so those metas leaked into canon as capture_status=ok.

No network: the stitched desktop tiles (tile-NN.png, 1600px crops written
by ingest_good.finish) are the full screenshot. An oversized section
(> max(1350px, 0.6 page), nav-typed wrappers included) is dropped when
other sections cover >=50% of it, else split into luminance bands
(ingest_good.band_edges). If a section is still oversized afterwards the
capture is quarantined (capture_status=stretched). Rebanks via
ingest_good.bank(), which replaces the slug's annotation rows.

usage: resegment_stretched.py [--dry-run] [--slugs a,b]
"""
import glob
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import ingest_good  # noqa: E402
from ingest_good import OPERATOR, capture_ok, image_features  # noqa: E402

MIN_RUN = 48    # px of flat background that may separate two sections
MIN_BAND = 400  # px; no fallback section shorter than this
FINE = (20, 240)  # fallback when a coarse band stays oversized
OUT = os.path.join(OPERATOR, '_sources', 'resegment-stretched.json')
FEAT_KEYS = ('ink_density', 'whitespace_share', 'media_ratio', 'columns',
             'dark_surface')


def candidates(want=None):
    for f in sorted(glob.glob(os.path.join(OPERATOR, '*', 'meta.json'))):
        d = os.path.dirname(f)
        slug = os.path.basename(d)
        if want and slug not in want:
            continue
        m = json.load(open(f))
        resplit = (m.get('capture_engine') or '').endswith('+reseg')
        st = m.get('capture_status')
        if st != 'ok' and not (resplit and st == 'stretched'):
            continue
        if 'lexdemos' in (m.get('domain') or m.get('url') or ''):
            continue  # re-captured by reingest_lexdemos --deep
        H = m.get('height') or 0
        if resplit or (H > 2400 and oversized(m.get('sections') or [], H)):
            yield slug, d, m


def stitch(d, m):
    from PIL import Image
    tiles = m.get('tiles') or sorted(
        os.path.basename(p) for p in glob.glob(os.path.join(d, 'tile-*.png')))
    paths = [os.path.join(d, t) for t in tiles]
    if not paths or not all(os.path.exists(p) for p in paths):
        return None
    ims = [Image.open(p).convert('RGB') for p in paths]
    W = ims[0].width
    full = Image.new('RGB', (W, sum(i.height for i in ims)))
    y = 0
    for im in ims:
        full.paste(im, (0, y))
        y += im.height
    return full


def flat_runs(im, W, H):
    """(y0, y1) runs of flat, uniform rows: section-separating gaps.
    Stricter than ingest_good.band_edges (row variance too), which splits
    at every card-row gutter."""
    import numpy as np
    a = np.asarray(im.resize((256, max(1, int(H * 256 / W)))),
                   dtype=np.float32)
    L = 0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2]
    flat = (np.abs(np.diff(L.mean(axis=1))) < 1.0) & (L.std(axis=1)[1:] < 6)
    sc = H / a.shape[0]
    out, y = [], 0
    while y < len(flat):
        if flat[y]:
            s0 = y
            while y < len(flat) and flat[y]:
                y += 1
            out.append((int(s0 * sc), int(y * sc)))
        else:
            y += 1
    return out


def split(full, g, W, lim):
    """Cut one region at its widest gaps first, keeping every band
    >= min_band; retry with the fine pass when a band stays > lim."""
    y0, y1 = max(0, g['top']), min(full.height, g['top'] + g['height'])
    h = y1 - y0
    runs = flat_runs(full.crop((0, y0, W, y1)), W, h)
    for min_run, min_band in ((MIN_RUN, MIN_BAND), FINE):
        cuts = [0, h]
        for a, b in sorted(runs, key=lambda r: r[0] - r[1]):
            c = (a + b) // 2
            if b - a >= min_run and \
                    all(abs(c - x) >= min_band for x in cuts):
                cuts.append(c)
        cuts.sort()
        if max(b - a for a, b in zip(cuts, cuts[1:])) <= lim:
            break
    return [(y0 + a, y0 + b) for a, b in zip(cuts, cuts[1:])]


def coalesce(secs):
    """Merge contiguous earlier fallback bands back into one region so a
    re-run re-splits it from scratch (idempotent)."""
    out = []
    for s in secs:
        if s.get('bandFallback') and out and out[-1].get('bandFallback'):
            p = out[-1]['geometry']
            g = s['geometry']
            end = max(p['top'] + p['height'], g['top'] + g['height'])
            out[-1] = {'bandFallback': True, 'section_type': 'other',
                       'geometry': dict(p, height=end - p['top'])}
        else:
            out.append(s)
    return out


def oversized(secs, page_h):
    """Any section (nav included: a nav-typed page wrapper happens) taller
    than max(1350, 0.6 * page height)."""
    lim = max(1350, 0.6 * page_h)
    return [s for s in secs if s['geometry']['height'] > lim]


def covered(g, others):
    """Share of g's vertical range covered by the other sections."""
    a, b = g['top'], g['top'] + g['height']
    iv = sorted((max(a, o['top']), min(b, o['top'] + o['height']))
                for o in others)
    tot, cur = 0, a
    for s, e in iv:
        s = max(s, cur)
        if e > s:
            tot += e - s
            cur = e
    return tot / max(1, b - a)


def resegment(slug, d, m):
    full = stitch(d, m)
    if full is None:
        return 'needs_recapture'
    W, H = full.size
    page_h = m.get('height') or H
    old = coalesce(m.get('sections') or [])
    big = [id(s) for s in oversized(old, page_h)] + \
        [id(s) for s in old if s.get('bandFallback')]
    small = [s['geometry'] for s in old if id(s) not in big]
    plan = []  # (geometry, source section or None)
    for s in old:
        g = s['geometry']
        if id(s) not in big:
            plan.append((g, s))
        elif not s.get('bandFallback') and covered(g, small) >= 0.5:
            continue  # wrapper around real sections: drop it
        else:
            for a, b in split(full, g, W, max(1350, 0.6 * page_h)):
                plan.append(({'left': 0, 'top': a, 'width': W,
                              'height': b - a}, None))
    plan.sort(key=lambda p: p[0]['top'])
    for p in glob.glob(os.path.join(d, 'sec-*.png')):
        os.remove(p)
    secs = []
    for i, (g, src) in enumerate(plan):
        x0, y0 = max(0, g['left']), max(0, g['top'])
        x1 = min(W, g['left'] + g['width'])
        y1 = min(H, g['top'] + g['height'])
        if y1 - y0 < 40 or x1 - x0 < 240:
            continue
        name = f'sec-{i:02d}.png'
        sp = os.path.join(d, name)
        full.crop((x0, y0, x1, y1)).save(sp)
        feat = image_features.analyze(sp)
        if src is not None:
            s = dict(src, index=i, file=name)
        else:
            s = {'index': i, 'file': name, 'geometry': g,
                 'section_type': 'other', 'confidence': 0.4,
                 'heading': None, 'bandFallback': True}
        s['features'] = {k: feat[k] for k in FEAT_KEYS}
        s['ps'] = feat.get('ps')
        s['blocks'] = feat.get('blocks')
        secs.append(s)
    m['sections'] = secs
    if isinstance(m.get('ui_analysis'), dict):
        m['ui_analysis']['sections'] = secs
    eng = m.get('capture_engine') or 'ingest_good'
    if not eng.endswith('+reseg'):
        m['capture_engine'] = eng + '+reseg'
    if oversized(secs, page_h):
        status, reason = 'stretched', 'section >0.6 page after reseg'
    else:
        status, reason = capture_ok.decide(m, d)
    m['capture_status'], m['capture_reason'] = status, reason
    json.dump(m, open(os.path.join(d, 'meta.json'), 'w'), indent=1)
    ingest_good.write_report(slug, d, m)
    ingest_good.bank(slug)
    return status


def main():
    dry = '--dry-run' in sys.argv
    want = None
    if '--slugs' in sys.argv:
        want = set(sys.argv[sys.argv.index('--slugs') + 1].split(','))
    state = json.load(open(OUT)) if os.path.exists(OUT) else {}
    slugs = set(state.get('slugs', []))
    recap = set(state.get('needs_recapture', []))
    quar = set(state.get('quarantined', []))
    n = 0
    for slug, d, m in candidates(want):
        n += 1
        if dry:
            has = all(os.path.exists(os.path.join(d, t))
                      for t in m.get('tiles') or ['missing'])
            print(slug, m.get('height'), 'tiles' if has else 'NO-TILES')
            continue
        r = resegment(slug, d, m)
        print(slug, r, len(m.get('sections') or []), flush=True)
        if r == 'needs_recapture':
            recap.add(slug)
            continue
        slugs.add(slug)
        if r == 'ok':
            quar.discard(slug)
        else:
            quar.add(slug)
    print('candidates', n)
    if not dry:
        json.dump({'slugs': sorted(slugs),
                   'needs_recapture': sorted(recap),
                   'quarantined': sorted(quar)},
                  open(OUT, 'w'), indent=1)


if __name__ == '__main__':
    main()
