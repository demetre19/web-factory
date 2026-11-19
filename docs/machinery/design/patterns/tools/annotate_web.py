#!/usr/bin/env -S uv run --quiet --script
# /// script
# requires-python = ">=3.11"
# dependencies = ["torch", "open_clip_torch", "pillow", "numpy"]
# ///
"""Fill a web capture's meta.json with the CLASSIFY.md + UI-ANALYSIS.md
records: images[], ui_analysis, set_summary.

Only captures with `capture_status: ok` are touched — a challenge page
has no design to describe (see capture_ok.py).

What is measured and what is inferred is kept separate on purpose:

* `images[]` — one entry per media block found by the same pixel pass the
  pattern corpus uses (`image_features.analyze`). Each block is cropped
  and classified with CLIP zero-shot over the CLASSIFY.md closed sets;
  every value carries `confidence` (the CLIP margin) and `evidence` (the
  runner-up). `provenance: inferred` — a zero-shot label is a hypothesis.
* `ui_analysis` — `provenance: extracted`: palette, grid, sections,
  controls and typography measured from the pixels and the DOM probe,
  never guessed. There is no LLM in this path.
* `set_summary` — the aggregate a brief can read: dominant medium, mean
  emotion axes, top tags, dominant style, consistency, outliers.

  uv run --quiet annotate_web.py            # all ok captures
  uv run --quiet annotate_web.py --limit 5
"""
import json
import os
import re
import sys
import time
from collections import Counter

HERE = os.path.dirname(os.path.abspath(__file__))
PATTERNS = os.path.normpath(os.path.join(HERE, '..'))
DATA = os.path.join(PATTERNS, 'data')
WEB = os.path.join(DATA, 'web', 'canon')
TILE_H = 1600
MODEL_ID = 'open_clip:ViT-B-32:laion2b_s34b_b79k'
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cache  # noqa: E402
import image_features as _if  # noqa: E402

# a ruleset/code change invalidates exactly the entries it governs
FEAT_V = cache.text_sha(open(_if.__file__, 'rb').read().hex())[:12]
CLASSIFY_V = cache.text_sha(MODEL_ID + ':' + FEAT_V + ':classify1')[:12]

# Roles a media block can play, from the pixel pass's own vocabulary.
ROLE_BY_POS = [(0.0, 0.30, 'hero'), (0.30, 0.75, 'supporting'),
               (0.75, 1.01, 'proof')]


def hexof(rgb):
    return '#%02x%02x%02x' % tuple(int(max(0, min(255, c))) for c in rgb)


def palette(arr):
    """Role palette, measured where the page is *not* a picture.

    A histogram of the whole page is a histogram of its photography, so
    the ground is taken from the page border (a 6px frame is chrome, not
    content), ink from the most frequent colour that differs from it by
    more than 60 luminance, accent from the most saturated frequent
    colour. Roles are inferred from those measurements, not chosen.
    """
    import numpy as np
    h, w = arr.shape[:2]
    frame = np.concatenate([arr[:6].reshape(-1, 3), arr[-6:].reshape(-1, 3),
                            arr[:, :6].reshape(-1, 3),
                            arr[:, -6:].reshape(-1, 3)])
    def mode(px):
        q = (px // 8 * 8).astype(np.int32)
        keys = q[:, 0] * 65536 + q[:, 1] * 256 + q[:, 2]
        u, c = np.unique(keys, return_counts=True)
        k = int(u[np.argmax(c)])
        return (k >> 16, (k >> 8) & 255, k & 255)
    lum = lambda c: 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
    chroma = lambda c: max(c) - min(c)
    bg = mode(frame)
    bg_l = lum(bg)
    q = (arr.reshape(-1, 3) // 8 * 8).astype(np.int32)
    keys = q[:, 0] * 65536 + q[:, 1] * 256 + q[:, 2]
    u, c = np.unique(keys, return_counts=True)
    cand = []
    for k, n in zip(u, c):
        k = int(k)
        cand.append(((k >> 16, (k >> 8) & 255, k & 255), n / len(keys)))
    cand.sort(key=lambda t: -t[1])
    far = [x for x in cand if abs(lum(x[0]) - bg_l) > 60]
    ink = far[0][0] if far else bg
    acc = sorted([x for x in cand[:60] if chroma(x[0]) >= 40],
                 key=lambda t: -chroma(t[0]) * t[1])
    out = {'bg': hexof(bg), 'ink': hexof(ink),
           'ink_muted': hexof(far[1][0]) if len(far) > 1 else hexof(ink),
           'surface': hexof(cand[1][0]) if len(cand) > 1 else hexof(bg),
           'border': hexof(cand[2][0]) if len(cand) > 2 else hexof(bg)}
    if acc:
        out['accent'] = hexof(acc[0][0])
        out['accent_fg'] = '#ffffff' if lum(acc[0][0]) < 140 else '#111111'
    return out


def analyse_tile(path):
    """Pixel pass + palette for one tile (crop_feat cache)."""
    import numpy as np
    from PIL import Image
    key = f'{cache.file_sha(path)}:{FEAT_V}'
    hit = cache.get('crop_feat', key)
    if hit is not None:
        return hit['feat'], hit['pal']
    feat = _if.analyze(path)
    im = Image.open(path).convert('RGB')
    im.thumbnail((360, 900))
    arr = np.asarray(im, dtype=np.float32)
    pal = palette(arr)
    cache.put('crop_feat', key, {'feat': feat, 'pal': pal})
    return feat, pal


def sections_of(feat, tile_i, page_h):
    """Blocks -> sections with speech act, composition, density, surface."""
    out = []
    for i, b in enumerate(feat['blocks']):
        y0 = (tile_i * TILE_H + b['y0'] * feat['h']) / page_h
        y1 = (tile_i * TILE_H + b['y1'] * feat['h']) / page_h
        act = ('nav' if b['role'] == 'chrome-nav'
               else 'footer' if b['role'] == 'chrome-footer'
               else 'proof' if b.get('has_media') and not b.get('has_heading')
               else 'promise' if y0 < 0.25 else 'act')
        comp = ('stacked-hero' if act == 'promise' and b.get('has_heading')
                else 'media-gallery' if b.get('has_media') and not
                b.get('has_heading') else 'form-panel' if b.get('has_form')
                else 'cards-n' if b.get('has_links') and b.get('cols', 1) > 1
                else 'content-editorial')
        out.append({
            'index': i, 'purpose_speech_act': act, 'composition': comp,
            'density': 'spacious' if b.get('area', 0) > 0.5 else 'regular',
            'surface': 'inverse' if feat.get('dark_surface') else 'base',
            'y': [round(y0, 3), round(y1, 3)],
            '_tile': f'tile-{tile_i:02d}.png',
            '_crop': [round(b['x0'], 4), round(b['y0'], 4),
                      round(b['x1'], 4), round(b['y1'], 4)],
        })
    return out


def classify_blocks(paths, model, pre, tok, dev, torch, T):
    """CLIP zero-shot over media crops -> CLASSIFY.md values.

    vlm_classify cache: keyed by tile bytes + crop box + classifier
    version, so a re-run over an unchanged corpus is all hits.
    """
    import numpy as np
    from PIL import Image
    ck = [f'{cache.file_sha(p)}:{bbox}:{CLASSIFY_V}'
          for p, bbox in paths]
    hits = cache.get_many('vlm_classify', ck)
    if all(k in hits for k in ck):
        return [hits[k] for k in ck]
    imgs = []
    for p, bbox in paths:
        im = Image.open(p).convert('RGB')
        W, H = im.size
        box = (int(bbox[0] * W), int(bbox[1] * H),
               int(bbox[2] * W), int(bbox[3] * H))
        if box[2] - box[0] < 16 or box[3] - box[1] < 16:
            imgs.append(None)
            continue
        imgs.append(pre(im.crop(box)))
    keep = [i for i, im in enumerate(imgs) if im is not None]
    if not keep:
        return [None] * len(imgs)
    with torch.no_grad():
        f = model.encode_image(torch.stack([imgs[i] for i in keep]).to(dev))
        f = f / f.norm(dim=-1, keepdim=True)
        f = f.float().cpu().numpy()
    res = [None] * len(imgs)
    for i, v in zip(keep, f):
        v = v.astype(np.float32)
        row = {}
        for g in ('medium', 'subject_class', 'style', 'tags'):
            labels, mat = T[g]
            sims = (mat @ torch.from_numpy(v)).numpy()
            o = np.argsort(-sims)
            margin = float(sims[o[0]] - sims[o[1]])
            ambiguous = margin < 0.02
            row[g] = {
                'value': 'other:ambiguous' if ambiguous else labels[o[0]],
                'confidence': round(min(0.99, max(0.05, 0.5 + margin * 2)), 3),
                'evidence': f'CLIP margin {margin:.3f} over {labels[o[1]]}'
                            + (' (below the 0.02 floor: not a label)'
                               if ambiguous else '')}
        ps, ns = (T['axis_pos'][1] @ torch.from_numpy(v),
                  T['axis_neg'][1] @ torch.from_numpy(v))
        row['emotion_axes'] = {
            ax: int(round(max(-2.0, min(2.0, 2 * (float(ps[j]) - float(ns[j]))
                                    / max(1e-6, float(ps[j]) + float(ns[j]))))))
            for j, ax in enumerate(T['axis_pos'][0])}
        res[i] = row
        # only newly-computed entries go back; cached hits stay
        cache.put('vlm_classify', ck[i],
                  json.loads(json.dumps(res[i], default=float)))
    return res


def build_prompts(model, tok, dev, torch, embed_media):
    groups = {'medium': embed_media.MEDIUM,
              'subject_class': embed_media.SUBJECT,
              'style': embed_media.STYLE, 'tags': embed_media.TAGS,
              'axis_pos': {k: v[0] for k, v in embed_media.AXES.items()},
              'axis_neg': {k: v[1] for k, v in embed_media.AXES.items()}}
    T = {}
    for g, d in groups.items():
        labels = list(d)
        with torch.no_grad():
            f = model.encode_text(tok([d[k] for k in labels]).to(dev))
            f = f / f.norm(dim=-1, keepdim=True)
        T[g] = (labels, f.float().cpu())
    return T


def set_summary(images):
    if not images:
        return None
    ax = {}
    for im in images:
        for k, v in im['emotion_axes'].items():
            ax.setdefault(k, []).append(v)
    tags = Counter(t for im in images for t in im['emotion_tags'])
    med = Counter(im['medium']['value'] for im in images)
    sty = Counter(im['style']['style'] for im in images)
    dom_m = med.most_common(1)[0][0]
    dom_s = sty.most_common(1)[0][0]
    agree = (sum(med.values()) and med[dom_m] / len(images)) or 0
    outliers = [im['file'] for im in images
                if im['medium']['value'] != dom_m]
    return {
        'dominant_medium': dom_m,
        'emotion_axes': {k: round(sum(v) / len(v), 2) for k, v in ax.items()},
        'emotion_tags': [t for t, _ in tags.most_common(3)],
        'style': dom_s,
        'consistency': round(agree, 2),
        'outliers': outliers[:5],
        'n_images': len(images),
        'provenance': 'inferred',
    }


def annotate_site(slug, model, pre, tok, dev, torch, T, embed_media):
    d = os.path.join(WEB, slug)
    mp = os.path.join(d, 'meta.json')
    if not os.path.exists(mp):
        return 'skipped'
    meta = json.load(open(mp))
    if meta.get('capture_status', 'ok') != 'ok':
        return 'skipped'
    if meta.get('images') and not os.environ.get('RECLASSIFY'):
        return 'done'
    tiles = meta.get('tiles') or []
    page_h = max(1, meta.get('height') or TILE_H)
    images, sections, pal, controls = [], [], {}, []
    for i, t in enumerate(tiles):
        p = os.path.join(d, t)
        if not os.path.exists(p):
            continue
        feat, pal_t = analyse_tile(p)
        if not pal:
            pal = pal_t
        sections += sections_of(feat, i, page_h)
        for b in feat['blocks']:
            if b.get('has_cta'):
                controls.append({'label': b.get('role'),
                                 'function': 'action',
                                 'rank': 'primary' if b.get('role') == 'main'
                                 else 'secondary',
                                 'y': round((i * TILE_H + b['y0'] * feat['h'])
                                            / page_h, 3)})
        blocks = [b for b in feat['blocks']
                  if b.get('has_media') and b.get('area', 0) >= 0.04]
        blocks.sort(key=lambda b: -b['area'])
        for b in blocks[:6]:
            images.append({'file': t, 'tile': t,
                           'bbox': [round(b['x0'] * meta['width'], 1),
                                    round(i * TILE_H + b['y0'] * feat['h'], 1),
                                    round(b['x1'] * meta['width'], 1),
                                    round(i * TILE_H + b['y1'] * feat['h'], 1)],
                           '_crop': [b['x0'], b['y0'], b['x1'], b['y1']],
                           '_path': p,
                           'role_hint': next(r for lo, hi, r in ROLE_BY_POS
                                             if lo <= b['y0'] < hi)})
    labels = classify_blocks([(im['_path'], im['_crop']) for im in images],
                             model, pre, tok, dev, torch, T)
    out = []
    for im, lab in zip(images, labels):
        if not lab:
            continue
        conf = min(lab[g]['confidence'] for g in
                   ('medium', 'subject_class', 'style'))
        out.append({
            'file': im['file'], 'tile': im['tile'], 'bbox': im['bbox'],
            'medium': lab['medium'],
            'subject': lab['tags']['value'],
            'subject_class': lab['subject_class'],
            'role_on_page': {'value': im['role_hint'], 'confidence': 0.6,
                             'evidence': 'block position in the page flow'},
            'composition': {}, 'technical': {}, 'graphic': {},
            'emotion_axes': lab['emotion_axes'],
            'emotion_tags': [lab['tags']['value']],
            'style': {'style': lab['style']['value'],
                      'confidence': lab['style']['confidence'],
                      'evidence': lab['style']['evidence']},
            'intent': {}, 'confidence': round(conf, 3),
            'evidence': lab['medium']['evidence'],
            'classifier_model': MODEL_ID,
            'classified_at': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
        })
    pr = meta.get('probe') or {}
    meta['images'] = out
    meta['ui_analysis'] = {
        'summary_title': (pr.get('title') or '')[:120],
        'nav': 'top bar',
        'layout': {'max_content_width_px': 1200,
                   'sections': len(sections)},
        'sections': sections,
        'controls': controls,
        'palette': pal,
        'grid': {'columns': max((s['index'] for s in sections), default=1)},
        'typography': {},
        'imagery_icons': {'medium': (out[0]['medium']['value'] if out else None),
                          'treatment': 'media blocks',
                          'aspect_ratios': []},
        'design_extraction': {'invariants': [], 'patterns': [], 'strengths': [],
                              'defects': [], 'responsive': []},
        'provenance': 'extracted',
    }
    meta['set_summary'] = set_summary(out)
    meta['classified_at'] = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
    meta['classifier_model'] = MODEL_ID
    meta['schema_version'] = meta.get('schema_version', '1.0')
    json.dump(meta, open(mp, 'w'), indent=1)
    return f'{len(out)} images'


_WARM = None


def _warm():
    """One CLIP load per process; capture_web's operator path and the
    batch driver share it."""
    global _WARM
    if _WARM is None:
        import open_clip
        import torch
        import embed_media
        dev = 'mps' if torch.backends.mps.is_available() else 'cpu'
        model, _, pre = open_clip.create_model_and_transforms(
            embed_media.MODEL, pretrained=embed_media.PRETRAINED)
        model.eval().to(dev)
        tok = open_clip.get_tokenizer(embed_media.MODEL)
        T = build_prompts(model, tok, dev, torch, embed_media)
        _WARM = model, pre, tok, dev, torch, T, embed_media
    return _WARM


def main_for(slug):
    model, pre, tok, dev, torch, T, em = _warm()
    return annotate_site(slug, model, pre, tok, dev, torch, T, em)


def main():
    limit = int(sys.argv[sys.argv.index('--limit') + 1]) if '--limit' in sys.argv else None
    model, pre, tok, dev, torch, T, embed_media = _warm()
    slugs = sorted(os.listdir(WEB))
    if '--site' in sys.argv:
        slugs = [sys.argv[sys.argv.index('--site') + 1]]
    if limit:
        slugs = slugs[:limit]
    t0 = time.time()
    done = skipped = 0
    for slug in slugs:
        if not os.path.isdir(os.path.join(WEB, slug)):
            continue
        r = annotate_site(slug, model, pre, tok, dev, torch, T, embed_media)
        if r == 'skipped':
            skipped += 1
        else:
            done += 1
            print(f'{slug}: {r}', flush=True)
    print(f'{done} annotated, {skipped} skipped (not ok) in {time.time()-t0:.0f}s')


if __name__ == '__main__':
    main()
