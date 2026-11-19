#!/usr/bin/env -S uv run --quiet --script
# /// script
# requires-python = ">=3.11"
# dependencies = ["pillow", "numpy"]
# ///
"""Does intent-conditioned scoring beat plain structural scoring?

The intent layer claims: a page whose copy names brand attributes, whose
choices match its vertical, and whose audience is coherent is more likely
to be a real reference site than a template. That is testable on the web
corpus, where both classes exist — 82 curated/reference captures vs 45
small-business templates, all passing the capture gate.

It is **not** testable on Mobbin vs negatives: Mobbin screens carry no
copy, so no attribute or audience can be measured for them. Saying so is
part of the result.

  uv run --quiet validate_intent.py
"""
import json
import os
import random
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
PATTERNS = os.path.normpath(os.path.join(HERE, '..'))
DATA = os.path.join(PATTERNS, 'data')
ROOT = os.path.normpath(os.path.join(PATTERNS, '..', '..', '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'design-gate'))
sys.path.insert(0, HERE)

import score  # noqa: E402  stdlib only
import image_features  # noqa: E402

POSITIVE = {'luxury', 'curated', 'siteinspire', 'awwwards', 'reference'}
STRUCT = [k for k in score.DEFAULT_WEIGHTS if k != 'pattern_fit']


def stack(site_dir, meta):
    from PIL import Image
    tiles = [os.path.join(site_dir, t) for t in meta.get('tiles') or []]
    tiles = [t for t in tiles if os.path.isfile(t)]
    if not tiles:
        return None
    width = 900
    ims, total = [], 0
    for t in tiles:
        im = Image.open(t).convert('RGB')
        h = max(1, int(round(im.size[1] * width / im.size[0])))
        im = im.resize((width, h), Image.BILINEAR)
        ims.append(im)
        total += h
    page = Image.new('RGB', (width, total), 'white')
    y = 0
    for im in ims:
        page.paste(im, (0, y))
        y += im.size[1]
    fd, path = tempfile.mkstemp(suffix='.png')
    os.close(fd)
    page.save(path)
    return path


def intent_features(meta, model):
    it = meta.get('intent') or {}
    ch = meta.get('choices') or {}
    ss = meta.get('set_summary') or {}
    ui = meta.get('ui_analysis') or {}
    pv = model['p_choice_given_vertical']
    vert = it.get('vertical') or 'other'
    ps = [pv.get(dim, {}).get(vert, {}).get(a) for dim, a in ch.items()]
    ps = [p for p in ps if p is not None]
    text = meta.get('page_text') or ''
    return {
        'n_attributes': min(6, len(it.get('brand_attributes') or [])) / 6,
        'n_audience': min(3, len(it.get('audience') or [])) / 3,
        'n_cta_vocab': min(5, len(it.get('cta_vocabulary') or [])) / 5,
        'text_len': min(1.0, len(text) / 6000),
        'choice_consistency': round(sum(ps) / len(ps), 3) if ps else 0.0,
        'image_consistency': ss.get('consistency') or 0.0,
        'n_images': min(8, len(meta.get('images') or [])) / 8,
        'n_sections': min(12, len(ui.get('sections') or [])) / 12,
    }


def main():
    model = json.load(open(os.path.join(DATA, 'intent-model.json')))
    rows = []
    web = os.path.join(DATA, 'web', 'canon')
    for slug in sorted(os.listdir(web)):
        d = os.path.join(web, slug)
        mp = os.path.join(d, 'meta.json')
        if not os.path.isfile(mp):
            continue
        meta = json.load(open(mp))
        if meta.get('capture_status', 'ok') != 'ok':
            continue
        if not meta.get('intent') or not meta.get('page_text'):
            continue
        src = (meta.get('source') or '').lower()
        label = 1 if src in POSITIVE else 0
        path = stack(d, meta)
        if not path:
            continue
        try:
            feat = image_features.analyze(path)
        finally:
            os.unlink(path)
        ps = feat.get('ps') or {}
        mm = 1.0 - min(1.0, abs(ps.get('main_content_share', 0.8) - 0.8) / 0.35)
        comp = score.section_features(0.0, ps, mm, 1.0)
        comp.update(score.section_shape(feat))
        f = {k: comp[k] for k in STRUCT}
        f.update(intent_features(meta, model))
        rows.append({'domain': meta.get('domain') or slug, 'label': label,
                     'source': src, 'features': f})
    if len(rows) < 40:
        raise SystemExit(f'only {len(rows)} usable captures — need >=40')
    pos = sum(r['label'] for r in rows)
    print(f'{len(rows)} captures: {pos} reference / {len(rows)-pos} template')

    keys = list(rows[0]['features'])
    struct = [k for k in keys if k in STRUCT]
    intent = [k for k in keys if k not in STRUCT]

    def cv_auc(ks, folds=5, seed=7):
        idx = list(range(len(rows)))
        random.Random(seed).shuffle(idx)
        aucs = []
        for f in range(folds):
            te = set(idx[f::folds])
            tr = [rows[i] for i in idx if i not in te]
            tt = [rows[i] for i in idx if i in te]
            X = [[r['features'][k] for k in ks] for r in tr]
            y = [r['label'] for r in tr]
            w, b = score.logistic_fit(X, y)
            preds = [(b + sum(wj * r['features'][k]
                              for wj, k in zip(w, ks)), r['label']) for r in tt]
            aucs.append(score.auc(preds))
        return sum(aucs) / len(aucs), min(aucs), max(aucs)

    out = {}
    for name, ks in (('structural only', struct),
                     ('intent only', intent),
                     ('structural + intent', struct + intent)):
        m, lo, hi = cv_auc(ks)
        out[name] = {'auc_mean': round(m, 4), 'min': round(lo, 4),
                     'max': round(hi, 4), 'n_features': len(ks)}
        print(f'{name:22s} AUC {m:.4f}  (min {lo:.3f}, max {hi:.3f})')
    corr = {}
    for k in keys:
        xs = [r['features'][k] for r in rows]
        ys = [r['label'] for r in rows]
        mx, my = sum(xs) / len(xs), sum(ys) / len(ys)
        num = sum((x - mx) * (y - my) for x, y in zip(xs, ys))
        dx = sum((x - mx) ** 2 for x in xs) ** 0.5 or 1
        dy = sum((y - my) ** 2 for y in ys) ** 0.5 or 1
        corr[k] = round(num / (dx * dy), 3)
    out['correlations'] = corr
    out['n'] = len(rows)
    out['note'] = ('Mobbin vs negatives cannot test this: Mobbin screens '
                   'carry no copy, so no attribute or audience is '
                   'measurable. The web corpus has both classes.')
    path = os.path.join(DATA, 'validation', 'intent.json')
    json.dump(out, open(path, 'w'), indent=1)
    print('correlations:', json.dumps({k: v for k, v in sorted(
        corr.items(), key=lambda t: -abs(t[1]))[:8]}))
    print('->', os.path.relpath(path, PATTERNS))


if __name__ == '__main__':
    main()
