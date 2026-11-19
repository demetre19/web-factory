#!/usr/bin/env python3
# /// script
# requires-python = ">=3.11"
# dependencies = ["torch", "open_clip_torch", "pillow", "numpy"]
# ///
"""CLIP embeddings of RENDERED designs (proof shots) — the visual layer
for visual_diff, looks-like retrieval, vibe measurement, and judgment
warm-start. Advisory only: similarity decides WHETHER to judge, never
the J.1 score itself.

  uv run --quiet embed_renders.py build           # embed missing shots
  uv run --quiet embed_renders.py query <img>     # NN renders
  uv run --quiet embed_renders.py diff <a> <b>    # cosine distance
  uv run --quiet embed_renders.py vibe <img> --refs <dir|pattern-dir>
  uv run --quiet embed_renders.py verdict <img>   # warm-start: nearest
                                                  # prior verdict + dist

Index: data/render_vectors/{vectors.bin,index.json}; index rows carry
{render_path, recipe_id, dna_id, viewport, layout, seam, ornament,
font, media_weight, verdict?}.
"""
import json
import os
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
PATTERNS = os.path.normpath(os.path.join(HERE, '..'))
REPO = os.path.normpath(os.path.join(PATTERNS, '..', '..', '..', '..'))
DATA = os.path.join(PATTERNS, 'data')
OUT = os.path.join(DATA, 'render_vectors')
sys.path.insert(0, HERE)
import embed_images as EI  # noqa: E402

SHOT_GLOBS = ['tools/design-gate/proof/out*/shots',
              'tools/design-gate/proof/out*/views',
              'tools/design-gate/proof/out*/thumbs',
              'docs/machinery/design/patterns/data/bank_shots']


def rel(p):
    return os.path.relpath(p, REPO).replace(os.sep, '/')


def shots():
    import glob as g
    for pat in SHOT_GLOBS:
        for d in sorted(g.glob(os.path.join(REPO, pat))):
            for dirpath, _, files in os.walk(d):
                for f in sorted(files):
                    if f.lower().endswith(EI.EXT):
                        yield os.path.join(dirpath, f)


def sidecar(png):
    js = os.path.splitext(png)[0] + '.json'
    if os.path.exists(js):
        try:
            return json.load(open(js))
        except Exception:
            return {}
    return {}


REVIEW_CACHE = {}


def review_for(outdir):
    if outdir in REVIEW_CACHE:
        return REVIEW_CACHE[outdir]
    rp = os.path.join(REPO, 'tools/design-gate/proof', outdir,
                      'REVIEW.json')
    rv = {}
    try:
        d = json.load(open(rp))
        for name, v in (d.get('vlm_per_option') or {}).items():
            parsed = v.get('parsed')
            rv.setdefault(name, {})['verdict'] = {
                'model': v.get('model'),
                'verdict': parsed.get('verdict') if isinstance(
                    parsed, dict) else None}
            if isinstance(parsed, dict):
                rv[name]['verdict_dims'] = parsed
        for b in d.get('blocks') or []:
            nm = str(b.get('block_id', '')).split(':')[-1]
            if b.get('recipe_id'):
                rv.setdefault(nm, {})['recipe_id'] = b['recipe_id']
        for name, dec in (d.get('declared') or {}).items():
            rv.setdefault(name, {})['declared'] = dec
        # GatedMachinery's quality[opt].vlm_parsed is the same dims
        # object — use as fallback + cross-check for stale harvests
        for name, q in (d.get('quality') or {}).items():
            if not isinstance(q, dict):
                continue
            parsed = q.get('vlm_parsed')
            if not isinstance(parsed, dict):
                continue
            cur = rv.setdefault(name, {})
            if 'verdict_dims' not in cur:
                cur['verdict_dims'] = parsed
                cur['verdict'] = {'model': q.get('vlm_model'),
                                  'verdict': parsed.get('verdict')}
            elif cur['verdict_dims'] != parsed:
                cur['harvest_mismatch'] = True
    except Exception:
        pass
    REVIEW_CACHE[outdir] = rv
    return rv


def row_meta(png):
    import hashlib
    sha16 = hashlib.sha256(open(png, 'rb').read()).hexdigest()[:16]
    sc = sidecar(png)
    name = os.path.splitext(os.path.basename(png))[0]
    outdir = os.path.basename(os.path.dirname(
        os.path.dirname(png)))
    vars_ = sc.get('vars') or {}
    rv = review_for(outdir).get(name, {})
    dna = hashlib.sha256(json.dumps(
        {k: vars_.get(k) for k in
         ('--bg', '--ink', '--accent', '--radius', '--f-display',
          '--pad-block')}, sort_keys=True).encode()).hexdigest()[:12] \
        if vars_ else None
    parts = png.split(os.sep)
    kit = parts[parts.index('bank_shots') + 1] \
        if 'bank_shots' in parts else None
    recipe = rv.get('recipe_id') or kit + '/' + name if kit else \
        ('-'.join(filter(
            None, (sc.get('layout'), sc.get('seam'),
                   sc.get('ornament')))) or name)
    return {
        'render_path': rel(png),
        'sha256': sha16,
        'shot': name,
        'out_dir': outdir,
        'kit': kit,
        'recipe_id': recipe,
        'dna_id': dna,
        'viewport': [sc.get('width'), sc.get('height')],
        'layout': sc.get('layout'),
        'seam': sc.get('seam'),
        'ornament': sc.get('ornament'),
        'font': sc.get('font'),
        'media_weight': sc.get('media_weight'),
        'verdict': rv.get('verdict') or sc.get('verdict'),
        'verdict_dims': rv.get('verdict_dims'),
        'declared': rv.get('declared'),
    }


def index_path():
    return os.path.join(OUT, 'index.json')


def load_index():
    if os.path.exists(index_path()):
        return json.load(open(index_path()))
    return {'rows': {}, 'order': []}


def save_index(meta):
    os.makedirs(OUT, exist_ok=True)
    json.dump(meta, open(index_path(), 'w'), indent=1)


def cmd_build():
    import numpy as np
    import torch
    model, preprocess, torch, dev = EI.load_model()
    os.makedirs(OUT, exist_ok=True)
    meta = load_index()
    rows = meta.setdefault('rows', {})
    pending = [p for p in shots() if rel(p) not in rows]
    print(f'{len(rows)} indexed, {len(pending)} to embed')
    vecs = []
    VBIN = os.path.join(OUT, 'vectors.bin')
    # rebuild the bin fully when adding (index keeps row order)
    order = [k for k in rows]
    batch = []
    done = 0
    for p in pending:
        try:
            from PIL import Image
            im = preprocess(Image.open(p).convert('RGB'))
            batch.append((p, im))
        except Exception as e:
            print(f'  skip {p}: {e}', file=sys.stderr)
        if len(batch) >= 24:
            done += flush(model, torch, dev, batch, rows, order)
            batch = []
    if batch:
        done += flush(model, torch, dev, batch, rows, order)
    mat = []
    # rows indexed before this run carry no in-memory vec — theirs
    # already live in vectors.bin, aligned to meta['order']
    prior = meta.get('order') or []
    if prior and os.path.exists(VBIN):
        mat.extend(np.fromfile(VBIN, dtype=np.float16)
                   .reshape(len(prior), EI.DIM))
    for k in order[len(prior):]:
        mat.append(np.array(rows[k]['vec'], dtype=np.float16))
    arr = np.array(mat, dtype=np.float16)
    with open(VBIN, 'wb') as f:
        arr.tofile(f)
    for k in order:
        rows[k].pop('vec', None)
    meta.update({'model': f'open_clip:{EI.MODEL}:{EI.PRETRAINED}',
                 'dim': EI.DIM, 'dtype': 'float16',
                 'normalized': True, 'count': len(order),
                 'generated': time.strftime('%Y-%m-%dT%H:%M:%SZ',
                                            time.gmtime()),
                 'order': order})
    save_index(meta)
    print(f'{done} new vectors, {len(order)} total -> {VBIN}')


def flush(model, torch, dev, batch, rows, order):
    import numpy as np
    xs = torch.stack([im for _, im in batch]).to(dev)
    with torch.no_grad():
        feats = model.encode_image(xs)
        feats = feats / feats.norm(dim=-1, keepdim=True)
    feats = feats.cpu().numpy().astype(np.float16)
    for (p, _), v in zip(batch, feats):
        m = row_meta(p)
        m['vec'] = v.tolist()
        rows[m['render_path']] = m
        order.append(m['render_path'])
    return len(batch)


def vectors():
    import numpy as np
    meta = load_index()
    VBIN = os.path.join(OUT, 'vectors.bin')
    raw = np.fromfile(VBIN, dtype=np.float16)
    return meta, raw.reshape(-1, meta['dim']).astype(np.float32)


def embed_one(img_path):
    import torch
    from PIL import Image
    model, preprocess, torch, dev = EI.load_model()
    im = preprocess(Image.open(img_path).convert('RGB'))
    with torch.no_grad():
        v = model.encode_image(im.unsqueeze(0).to(dev))
        v = v / v.norm(dim=-1, keepdim=True)
    return v.cpu().numpy()[0].astype('float32')


def cmd_query(img, k=8):
    import numpy as np
    meta, M = vectors()
    v = embed_one(img)
    ds = 1 - M @ v
    idx = np.argsort(ds)[:k]
    for i in idx:
        r = meta['rows'][meta['order'][i]]
        print(f"{ds[i]:.3f}  {r['render_path']}  "
              f"recipe={r['recipe_id']} verdict={r.get('verdict')}")


def cmd_diff(a, b):
    va, vb = embed_one(a), embed_one(b)
    d = 1 - float(va @ vb)
    print(f'{d:.3f} cosine distance')
    return d


def cmd_vibe(img, refs):
    import numpy as np
    meta, M = vectors()
    v = embed_one(img)
    ds = 1 - M @ v
    names = meta['order']
    if os.path.isdir(refs):
        pref = rel(refs) + '/'
        mask = [n.startswith(pref) for n in names]
    else:
        mask = [refs in n for n in names]
    if not any(mask):
        print('no reference vectors matched', refs)
        return
    dm = float(np.mean(ds[mask]))
    print(f'{dm:.3f} mean distance to {sum(mask)} refs '
          f'(0 = vibe delivered, ~0.4+ = off-vibe)')


def cmd_verdict(img, k=5):
    import numpy as np
    meta, M = vectors()
    v = embed_one(img)
    ds = 1 - M @ v
    idx = np.argsort(ds)[:k]
    for i in idx:
        r = meta['rows'][meta['order'][i]]
        print(f"{ds[i]:.3f}  {r['shot']}  "
              f"verdict={r.get('verdict')} "
              f"recipe={r['recipe_id']}")
    if ds[idx[0]] < 0.05:
        print('-> below 0.05: near-identical render, prior verdict '
              'may warm-start (advisory only)')


def main():
    args = sys.argv[1:]
    cmd = args[0] if args else 'build'
    if cmd == 'build':
        cmd_build()
    elif cmd == 'query':
        cmd_query(args[1])
    elif cmd == 'diff':
        cmd_diff(args[1], args[2])
    elif cmd == 'vibe':
        cmd_vibe(args[1], args[args.index('--refs') + 1])
    elif cmd == 'verdict':
        cmd_verdict(args[1])
    else:
        print(__doc__)
        sys.exit(1)


if __name__ == '__main__':
    main()
