#!/usr/bin/env python3
# /// script
# requires-python = ">=3.11"
# dependencies = ["torch", "open_clip_torch", "pillow", "numpy"]
# ///
"""SECTION BANK — every section crop across data/operator/** as a
first-class retrieval row, parallel to the render bank.

Row: {slug, site_type_v2, file, section_type, style_tags
{style,medium,mood}, topo, sha256}. Vectors: CLIP ViT-B/32 float16 in
data/section-bank/vectors.bin, aligned to index order.

  uv run --quiet section_bank.py build     # index rows + embed missing
  uv run --quiet section_bank.py query <img> [--site-type X] [--style Y]
                                           [--section-type Z]

Style tags come from the gemini lane (style_tags.py) when present;
else falls back to the crop's annotation fields (surface/media_type)
so rows are filterable today.
"""
import hashlib
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.normpath(os.path.join(HERE, '..', 'data'))
REPO = os.path.normpath(os.path.join(HERE, '..', '..', '..',
                                     '..', '..'))
OUT = os.path.join(DATA, 'section-bank')
ANN = os.path.join(DATA, 'annotations.jsonl')
OPS = os.path.join(DATA, 'operator')
sys.path.insert(0, HERE)
import embed_images as EI  # noqa: E402


def sha16(p):
    try:
        return hashlib.sha256(open(p, 'rb').read()).hexdigest()[:16]
    except OSError:
        return None


def metas():
    import glob
    out = {}
    for f in glob.glob(os.path.join(OPS, '*/meta.json')):
        if '_sources' in f:
            continue
        try:
            m = json.load(open(f))
        except Exception:
            continue
        out[os.path.basename(os.path.dirname(f))] = m
    return out


def rows():
    """operator sec crops + annotation join -> bank rows."""
    mt = metas()
    seen = {}
    for line in open(ANN):
        try:
            r = json.loads(line)
        except Exception:
            continue
        img = r.get('image') or ''
        if '/operator/' not in img:
            continue
        ap = os.path.normpath(img)
        if not os.path.exists(ap):
            continue
        parts = ap.split(os.sep)
        slug = parts[parts.index('operator') + 1]
        fname = os.path.basename(ap)
        key = f'{slug}/{fname}'
        meta = mt.get(slug, {})
        if key not in seen:
            seen[key] = {
                'slug': slug,
                'file': fname,
                'site_type_v2': meta.get('site_type_v2')
                or meta.get('site_type'),
                'site_type_confidence':
                    meta.get('site_type_confidence'),
                'site_type_method': meta.get('site_type_method'),
                'section_type': r.get('section_type'),
                'site': r.get('site_name'),
                'page_type': r.get('page_type'),
                'composition': r.get('composition'),
                'source': r.get('source'),
                'canon_tier': r.get('canon_tier'),
                'quality_tier': r.get('quality_tier'),
                'exemplar': r.get('exemplar'),
                'style_tags': {
                    'style': r.get('surface'),
                    'medium': r.get('media_type'),
                    'mood': None},
                'topo': r.get('topo'),
                'sha256': sha16(ap),
                'render_path': os.path.relpath(ap, REPO),
            }
        else:
            # first row wins; merge a topo if the first lacked one
            if not seen[key].get('topo') and r.get('topo'):
                seen[key]['topo'] = r['topo']
    return seen


def index_path():
    return os.path.join(OUT, 'index.json')


def load_index():
    if os.path.exists(index_path()):
        return json.load(open(index_path()))
    return {'rows': {}, 'order': []}


def cmd_build():
    import numpy as np
    import torch
    model, preprocess, torch, dev = EI.load_model()
    os.makedirs(OUT, exist_ok=True)
    meta = load_index()
    existing = meta.setdefault('rows', {})
    bank = rows()
    pending = []
    for key, row in bank.items():
        rp = row['render_path']
        if rp not in existing:
            pending.append((rp, key, row))
        elif row['sha256'] and \
                existing[rp].get('sha256') != row['sha256']:
            pending.append((rp, key, row))
    # keep rows for crops that vanished? leave them (gitignored data
    # may be pruned; index stays honest about what was banked)
    print(f'{len(existing)} indexed, {len(bank)} bank rows, '
          f'{len(pending)} to embed')
    order = list(meta.get('order') or [])
    batch = []
    done = 0
    VBIN = os.path.join(OUT, 'vectors.bin')
    for rp, key, row in pending:
        try:
            from PIL import Image
            im = preprocess(Image.open(
                os.path.join(REPO, rp)).convert('RGB'))
            batch.append((rp, row, im))
        except Exception as e:
            print(f'  skip {rp}: {e}', file=sys.stderr)
        if len(batch) >= 24:
            done += flush(model, torch, dev, batch, existing, order)
            batch = []
    if batch:
        done += flush(model, torch, dev, batch, existing, order)
    # merge vecs: prior bin + new
    prior = meta.get('order') or []
    old_bin = None
    if prior and os.path.exists(VBIN):
        old_bin = np.fromfile(VBIN, dtype=np.float16).reshape(
            len(prior), EI.DIM)
    pos_of = {k: i for i, k in enumerate(prior)}
    mat = []
    for k in order:
        r = existing[k]
        if 'vec' in r:
            mat.append(np.array(r['vec'], dtype=np.float16))
        elif old_bin is not None and k in pos_of:
            mat.append(old_bin[pos_of[k]])
        else:
            raise KeyError(f'no vector for {k}')
    arr = np.array(mat, dtype=np.float16)
    arr.tofile(VBIN)
    for k in order:
        existing[k].pop('vec', None)
    meta.update({'model': f'open_clip:{EI.MODEL}:{EI.PRETRAINED}',
                 'dim': EI.DIM, 'dtype': 'float16',
                 'normalized': True, 'count': len(order),
                 'kind': 'section-bank',
                 'generated': __import__('time').strftime(
                     '%Y-%m-%dT%H:%M:%SZ', __import__('time').gmtime()),
                 'order': order})
    json.dump(meta, open(index_path(), 'w'), indent=1)
    print(f'{done} new vectors, {len(order)} total -> {VBIN}')


def flush(model, torch, dev, batch, rows, order):
    import numpy as np
    xs = torch.stack([im for _, _, im in batch]).to(dev)
    with torch.no_grad():
        feats = model.encode_image(xs)
        feats = feats / feats.norm(dim=-1, keepdim=True)
    feats = feats.cpu().numpy().astype(np.float16)
    for (rp, row, _), v in zip(batch, feats):
        row['vec'] = v.tolist()
        rows[rp] = row
        if rp not in order:
            order.append(rp)
    return len(batch)


def vectors():
    import numpy as np
    meta = load_index()
    VBIN = os.path.join(OUT, 'vectors.bin')
    raw = np.fromfile(VBIN, dtype=np.float16)
    return meta, raw.reshape(-1, meta['dim']).astype(np.float32)


def cmd_query(img, args):
    import numpy as np
    import embed_renders as ER
    meta, M = vectors()
    v = ER.embed_one(img)
    ds = 1 - M @ v
    idx = np.argsort(ds)
    want_type = args[args.index('--site-type') + 1] \
        if '--site-type' in args else None
    want_style = args[args.index('--style') + 1] \
        if '--style' in args else None
    want_sec = args[args.index('--section-type') + 1] \
        if '--section-type' in args else None
    shown = 0
    for i in idx:
        r = meta['rows'][meta['order'][i]]
        st = r.get('style_tags') or {}
        if want_type and r.get('site_type_v2') != want_type:
            continue
        if want_style and st.get('style') != want_style:
            continue
        if want_sec and r.get('section_type') != want_sec:
            continue
        print(f"{ds[i]:.3f}  {r['slug']}/{r['file']}  "
              f"sec={r.get('section_type')} type={r.get('site_type_v2')} "
              f"style={st.get('style')}")
        shown += 1
        if shown >= 8:
            break


def main():
    args = sys.argv[1:]
    cmd = args[0] if args else 'build'
    if cmd == 'build':
        cmd_build()
    elif cmd == 'query':
        cmd_query(args[1], args)
    elif cmd == 'stats':
        meta = load_index()
        from collections import Counter
        rows = meta['rows'].values()
        print(len(rows), 'rows')
        print('site_type_v2:', Counter(
            r.get('site_type_v2') for r in rows).most_common())
        print('section_type:', Counter(
            r.get('section_type') for r in rows).most_common(12))
    else:
        print(__doc__)


if __name__ == '__main__':
    main()
