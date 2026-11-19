#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# dependencies = ["pillow", "numpy"]
# ///
"""SOP ADHERENCE — measure how often canon sites hold the SOP baselines.

Rules are RULES: the SOP constants (V scrim floors, I stroke set,
S radius ladder, R breakpoints/width, L spacing/measure, T type
ratios) stay FIXED. What we measure is per-site adherence:
on_rule | off_by_<delta> | freeform, plus a corpus adherence % per
rule and a per-site discipline score across the families the pixel
pass can see.

Pixel-measurable families only — icon stroke widths and the
breakpoint set are declared `unmeasurable-from-stills` (honest
no-data, not a guess). Canon only: look-layer = Mobbin + operator;
candidates inform nothing here.

  uv run sop_adherence.py            # data/sop-adherence.json
  uv run sop_adherence.py --md       # + research/SOP-ADHERENCE.md
"""
import json
import os
import sys
from collections import defaultdict

import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.normpath(os.path.join(HERE, '..', 'data'))
PATTERNS = os.path.normpath(os.path.join(HERE, '..'))
ROOT = os.path.normpath(os.path.join(PATTERNS, '..', '..', '..', '..'))
OUT_JSON = os.path.join(DATA, 'sop-adherence.json')
OUT_MD = os.path.join(ROOT, 'research', 'SOP-ADHERENCE.md')

sys.path.insert(0, HERE)
import cache  # noqa: E402
import re  # noqa: E402

SOP_V = cache.text_sha(open(__file__, 'rb').read().hex())[:12]
TW = 720

# --- the SOP baselines (fixed; never rewritten by measurements) ---
SOP = {
    'S.2': {'what': 'radius ladder {0,2,4,6,8,12,16,24,9999}',
            'ladder': [0, 2, 4, 6, 8, 12, 16, 24, 9999]},
    'T.1': {'what': 'primary type contrast 3-6x body',
            'lo': 3.0, 'hi': 6.0},
    'T.6': {'what': 'measure <= 65ch; body >= 16px', 'measure_ch': 65},
    'R.1': {'what': 'content width <= 1440 (ceiling 1280-1440 band)',
            'band': (1200, 1440)},
    'L.4': {'what': 'whitespace share >= canon P25 for the type',
            'p25': 0.35},
    'V.4': {'what': 'text-on-image: text-zone luminance <=20% or '
                    '>=85% with scrim', 'lo': 0.20, 'hi': 0.85},
}


def canon():
    sys.path.insert(0, os.path.normpath(os.path.join(
        PATTERNS, '..', '..', '..', '..', 'tools', 'design-gate')))
    from corpus_filter import keep
    recs = []
    for line in open(os.path.join(DATA, 'annotations.jsonl')):
        r = json.loads(line)
        if 'error' not in r and keep(r) and \
                os.path.exists(r.get('image') or ''):
            recs.append(r)
    return recs


def measure(path, rec):
    """Per-crop adherence signals, content-cached."""
    key = f'{cache.file_sha(path)}:{SOP_V}'
    hit = cache.get('sop', key)
    if hit is not None:
        return hit
    try:
        im = Image.open(path).convert('RGB')
    except Exception:
        return None
    im.thumbnail((TW, 10_000))
    a = np.asarray(im, dtype=np.float32)
    L = 0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2]
    C = a.max(axis=2) - a.min(axis=2)
    ink = L < 128
    out = {}
    # T.1 proxy: heading:body ratio carried by the annotation itself
    hbr = rec.get('heading_body_ratio')
    if hbr:
        out['T.1'] = 'on_rule' if 3 <= hbr <= 6 else \
            f'off_by_{abs(hbr - (3 if hbr < 3 else 6)):.1f}x'
    # T.6 measure: widest ink row vs image width in ch (body ~0.022W)
    rows = ink.any(axis=1)
    if rows.any():
        ymid = np.where(rows)[0]
        widths = [(lambda xs: xs.max()-xs.min())(np.where(ink[y])[0]) for y in
                  ymid[::max(1, len(ymid) // 24)]]
        wpx = np.median(widths)
        char_px = rec.get('image') and 0.022 * TW or 16
        out['T.6'] = ('on_rule' if wpx / max(1, char_px) <= 65
                      else f'off_by_{wpx / char_px - 65:.0f}ch')
    # L.4 whitespace floor
    ws = rec.get('whitespace_share')
    if ws is not None:
        out['L.4'] = ('on_rule' if ws >= SOP['L.4']['p25']
                      else f'off_by_{SOP["L.4"]["p25"] - ws:.2f}')
    # V.4 text-on-image: dark text zone on a bright media field, or
    # the inverse, counts as on-rule only when the zone reads clean
    media = rec.get('media_ratio') or 0
    if media > 0.4:
        top = L[:L.shape[0] // 3]
        zl = float(np.percentile(top, 75)) / 255
        out['V.4'] = ('on_rule' if zl <= 0.20 or zl >= 0.85
                      else f'off_by_zone_{zl:.2f}')
    cache.put('sop', key, out)
    return out


def _work(rr):
    return measure(rr['image'], rr)


def site_measure(d):
    """Per-SITE signals from operator meta.json (radius + width are
    DOM-precise where representative_styles were captured)."""
    mp = os.path.join(d, 'meta.json')
    if not os.path.exists(mp):
        return {}
    meta = json.load(open(mp))
    out = {}
    radii, widths, fsizes = [], [], []
    PX = re.compile(r'([\d.]+)px')
    for s in meta.get('sections') or []:
        for el in s.get('representative_styles') or []:
            st = el.get('styles') or {}
            br = st.get('border-radius')
            if br:
                if '9999' in str(br):
                    radii.append(9999.0)
                for m in PX.finditer(str(br)):
                    radii.append(float(m.group(1)))
            mw = st.get('max-width')
            if mw:
                m = PX.search(str(mw))
                if m and float(m.group(1)) > 300:
                    widths.append(float(m.group(1)))
            fs = st.get('font-size')
            if fs:
                m = PX.search(str(fs))
                if m and float(m.group(1)) >= 8:
                    fsizes.append(float(m.group(1)))
    if radii:
        lad = SOP['S.2']['ladder']
        off = sum(1 for r in radii if r not in lad)
        share = off / len(radii)
        out['S.2'] = {'measured': round(share, 3),
                      'verdict': 'on_rule' if share <= 0.2 else
                      f'freeform_{off}/{len(radii)}_off_ladder'}
    if widths:
        w = float(np.median(widths))
        lo, hi = SOP['R.1']['band']
        out['R.1'] = {'measured': round(w, 0),
                      'verdict': 'on_rule' if lo <= w <= hi else
                      f'off_by_{w - (lo if w < lo else hi):.0f}px'}
    if fsizes:
        fsizes.sort()
        body = fsizes[len(fsizes) // 2]
        hi_f = fsizes[-1]
        ratio = hi_f / max(1, body)
        out['T.1'] = {'measured': round(ratio, 2),
                      'verdict': 'on_rule' if 3 <= ratio <= 6 else
                      f'off_by_{abs(ratio - (3 if ratio < 3 else 6)):.1f}x'}
    return out


def cluster(pts, names, dims, k=None):
    """k-means on deviation vectors; name emergent clusters by their
    dominant bends; coherence = cosine to own centroid (consistent
    direction = intentional style, isolated bend = sloppy)."""
    import random
    import math
    X = np.array(pts, dtype=np.float64)
    k = k or min(4, max(2, len(pts) // 40))
    rng = random.Random(7)
    C = X[rng.sample(range(len(X)), k)]
    for _ in range(30):
        d = np.linalg.norm(X[:, None] - C[None], axis=2)
        lab = d.argmin(axis=1)
        for j in range(k):
            if (lab == j).any():
                C[j] = X[lab == j].mean(axis=0)
    out = {}
    NAMER = {
        ('T.1', '+'): 'display-led',
        ('T.1', '-'): 'quiet-type',
        ('L.4', '+'): 'airy/editorial',
        ('L.4', '-'): 'dense',
        ('R.1', '+'): 'contained',
        ('R.1', '-'): 'wide-bleed',
        ('T.6', '+'): 'long-measure',
        ('T.6', '-'): 'short-measure',
        ('S.2', '+'): 'freeform-radius',
        ('S.2', '-'): 'sharp-edge',
        ('V.4', '+'): 'mid-zone-contrast',
        ('V.4', '-'): 'high-contrast',
    }
    for j in range(k):
        idx = np.where(lab == j)[0]
        if not len(idx):
            continue
        cent = C[j]
        top = sorted(zip(dims, cent), key=lambda t: -abs(t[1]))[:2]
        if abs(cent).max() < 0.35:
            cname = 'baseline-disciplined'
        else:
            cname = '+'.join(NAMER.get((d, '+' if v > 0 else '-'),
                                       f'{d}{v:+.1f}')
                             for d, v in top if abs(v) >= 0.25)                 or 'baseline-disciplined'
        coh = {}
        for i in idx:
            v = X[i]
            num = float(np.dot(v, cent))
            den = (np.linalg.norm(v) * np.linalg.norm(cent)) or 1
            coh[names[i]] = round(num / den, 3)
        # operator-meaningful label from the bend signature
        cv = {d: float(v) for d, v in zip(dims, cent)}
        if cname == 'baseline-disciplined':
            label = 'baseline'
        elif cv.get('T.1', 0) > 3 and cv.get('R.1', 0) < -0.8:
            label = 'artsy-editorial'     # huge display + full-bleed
        elif cv.get('T.1', 0) > 1.5:
            label = 'expressive-display'
        elif cv.get('T.1', 0) < -0.8:
            label = 'quiet-saas'
        elif cv.get('R.1', 0) < -2.0 and cv.get('T.1', 0) < 0:
            label = 'bleed-minimal'
        elif cv.get('R.1', 0) < -2.0:
            label = 'bleed-led'
        else:
            label = cname
        out[cname] = {
            'name': cname,
            'label': label,
            'centroid': {d: round(float(v), 3)
                         for d, v in zip(dims, cent)},
            'members': [names[i] for i in idx],
            'coherence': coh,
            'n': len(idx)}
    return out


def main():
    recs = canon()
    per_site = defaultdict(dict)
    import multiprocessing as mp
    with mp.Pool(max(2, min(8, mp.cpu_count() - 2))) as pool:
        for r, m in zip(recs, pool.imap(
                _work, recs, chunksize=16)):
            site = r.get('site_name') or r.get('label') or 'mobbin'
            if m:
                for k, v in m.items():
                    per_site[site][k] = v
    # DOM-precise site rows
    op = os.path.join(DATA, 'operator')
    if os.path.isdir(op):
        for slug in os.listdir(op):
            d = os.path.join(op, slug)
            if os.path.isdir(d):
                for k, v in site_measure(d).items():
                    per_site[slug][k] = v
    # verdicts -> adherence; measured -> normalized deviation vector
    TOL = {'S.2': 0.2, 'T.1': 1.5, 'T.6': 15.0, 'R.1': 240.0,
           'L.4': 0.15, 'V.4': 0.15}
    REF = {'S.2': 0.0, 'T.1': 4.5, 'T.6': 65.0, 'R.1': 1320.0,
           'L.4': SOP['L.4']['p25'], 'V.4': 0.5}
    # direction of the baseline for signed dev: L.4 low=violation,
    # V.4 mid-band=violation (dev = distance into band)
    def dev(rid, val):
        if rid == 'S.2':
            return round(min(3.0, val / TOL[rid]), 3)
        if rid == 'T.1':
            return round((val - REF[rid]) / TOL[rid], 3)
        if rid == 'T.6':
            return round((val - REF[rid]) / TOL[rid], 3)
        if rid == 'R.1':
            return round((val - REF[rid]) / TOL[rid], 3)
        if rid == 'L.4':
            return round((val - REF[rid]) / TOL[rid], 3)
        if rid == 'V.4':
            lo, hi = 0.20, 0.85
            if val <= lo or val >= hi:
                return 0.0
            return round(min(val - lo, hi - val) / TOL[rid], 3)
        return 0.0

    vectors = {}
    for site, s in per_site.items():
        v = {}
        for rid in SOP:
            rec = s.get(rid)
            if isinstance(rec, dict) and 'measured' in rec:
                v[rid] = dev(rid, rec['measured'])
        if len(v) >= 2:
            vectors[site] = v

    # corpus adherence per rule
    rules = {}
    for rid in SOP:
        vals = [s[rid] for s in per_site.values() if rid in s]
        on = sum(1 for v in vals
                 if (v.get('verdict') if isinstance(v, dict)
                     else v) == 'on_rule')
        rules[rid] = {
            'baseline': SOP[rid]['what'],
            'unit': TOL.get(rid),
            'n_sites': len(vals),
            'adherence': round(on / len(vals), 3) if vals else None,
            'on_rule': on,
            'bent': [(v.get('verdict') if isinstance(v, dict) else v)
                     for v in vals
                     if (v.get('verdict') if isinstance(v, dict)
                         else v) != 'on_rule'][:10],
        }
    rules['I.2'] = {'baseline': 'icon stroke {1.5,2,2.5,3}px',
                    'unmeasurable': 'stroke width not resolvable in '
                                    '720px section crops — DOM/icon '
                                    'inspection needed'}
    rules['R.1-bp'] = {'baseline': 'breakpoints {360,640,768,1024,1280,'
                                   '1440,1920} min-width',
                       'unmeasurable': 'not derivable from a still'}
    # discipline score: share of measurable rules a site holds
    fams = [r for r in SOP]
    sites = {}
    for site, s in per_site.items():
        held = seen = 0
        for f in fams:
            rec = s.get(f)
            verdict = rec.get('verdict') if isinstance(rec, dict) \
                else rec
            if verdict is None:
                continue
            seen += 1
            held += verdict == 'on_rule'
        if seen:
            sites[site] = {'held': held, 'measured': seen,
                           'discipline': round(held / seen, 3)}

    # ---- deviation-space clustering ----
    dims = fams
    pts, names = [], []
    for site, v in vectors.items():
        pts.append([v.get(d, 0.0) for d in dims])
        names.append(site)
    clusters = cluster(pts, names, dims) if len(pts) >= 6 else {}
    for c in clusters.values():
        for m in c['members']:
            sites.setdefault(m, {}).update(
                {'cluster': c['name'], 'coherence': c['coherence'].get(
                    m)})
    res = {'version': SOP_V, 'n_records': len(recs),
           'n_sites': len(sites), 'rules': rules,
           'sites': dict(sorted(sites.items(),
                                key=lambda kv: -kv[1]['discipline']))}
    res['style_space'] = {
        'rules': [{'id': r, 'baseline': SOP[r]['what'],
                   'unit': TOL[r]} for r in fams],
        'clusters': clusters,
        'sites': [{'site': n, 'vector': vectors[n],
                   'cluster': sites.get(n, {}).get('cluster'),
                   'coherence': sites.get(n, {}).get('coherence')}
                  for n in names]}
    json.dump(res, open(OUT_JSON, 'w'), indent=1)
    # style-space.json + style-profiles.json (knob directions)
    json.dump(res['style_space'], open(os.path.join(
        DATA, 'style-space.json'), 'w'), indent=1)
    profs = {name: {'label': c.get('label'), 'name': name,
                    'centroid': c['centroid'], 'n': c['n'],
                    'knob_direction': {
                        d: ('increase' if v > 0 else 'decrease')
                        for d, v in c['centroid'].items()
                        if abs(v) >= 0.25}}
             for name, c in clusters.items()}
    # curated licence rows (waives/conflicts/canon_flag — STYLE.md)
    # survive regeneration: they are hand-authored, never recomputed
    _sp = os.path.join(DATA, 'style-profiles.json')
    try:
        for _k, _v in json.load(open(_sp)).items():
            if isinstance(_v, dict) and 'waives' in _v \
                    and _k not in profs:
                profs[_k] = _v
    except Exception:
        pass
    json.dump(profs, open(_sp, 'w'), indent=1)
    print(f"{len(sites)} sites, {len(recs)} records -> {OUT_JSON}")
    for rid, v in rules.items():
        print(f"  {rid}: adherence {v.get('adherence')} "
              f"(n={v.get('n_sites')})")
    if '--md' in sys.argv:
        lines = ['# SOP adherence — canon sites vs the fixed baselines',
                 '',
                 'Rules are RULES: the SOP constants are the fixed '
                 'baseline of good. This table measures how often canon '
                 'sites actually hold each baseline (on_rule | bent by '
                 'measured delta | freeform) — it informs knob ranges '
                 'and scorer weight, it never rewrites the rule.', '',
                 '| rule | baseline | adherence | n sites |',
                 '|---|---|---|---|']
        for rid, v in rules.items():
            if v.get('unmeasurable'):
                lines.append(f"| {rid} | {v['baseline']} | "
                             f"unmeasurable-from-stills | — |")
            else:
                lines.append(f"| {rid} | {v['baseline']} | "
                             f"{(f'{v["adherence"]:.0%}' if v.get('adherence') is not None else 'no-data')} "
                             f"| {v.get('n_sites') or '—'} |")
        lines += ['', '## Per-site discipline', '',
                  'Share of the measurable families each canon site '
                  'holds (top 30):', '',
                  '| site | discipline | held/measured |',
                  '|---|---|---|']
        for site, v in list(sites.items())[:30]:
            lines.append(f"| {site} | {v['discipline']:.0%} | "
                         f"{v['held']}/{v['measured']} |")
        open(OUT_MD, 'w').write('\n'.join(lines))
        print(OUT_MD)


if __name__ == '__main__':
    main()
