#!/usr/bin/env -S uv run --quiet --script
# /// script
# requires-python = ">=3.11"
# dependencies = ["torch", "open_clip_torch", "pillow", "numpy"]
# ///
"""CLIP image vectors for the pattern corpus.

Text embeddings (nomic-embed-text, 768d) answer "what does this section
say"; they cannot answer "what does it look like". This embeds every
crop we hold with a local vision model so retrieval can also score the
picture, and so a text query can be matched against images.

Model: ViT-B/32, laion2b_s34b_b79k (151M params, ~600MB weights, MIT
data terms). Small enough to install without asking; anything larger is
a decision for the operator.

Output (committed; the crops themselves are gitignored):
  data/image_vectors/vectors.bin   float16, concatenated, 512 dims each
  data/image_vectors/index.json    key -> row, plus model + preprocessing

Keys are corpus-relative paths, e.g. "screens/saas_pricing_hero/….webp".

Usage
  uv run --quiet embed_images.py build          # embed everything missing
  uv run --quiet embed_images.py query "dark editorial hero"
  uv run --quiet embed_images.py means          # per-pattern mean vectors
"""
import hashlib
import json
import os
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
PATTERNS = os.path.normpath(os.path.join(HERE, '..'))
DATA = os.path.join(PATTERNS, 'data')
OUT = os.path.join(DATA, 'image_vectors')
MODEL = 'ViT-B-32'
PRETRAINED = 'laion2b_s34b_b79k'
DIM = 512
EXT = ('.png', '.jpg', '.jpeg', '.webp')
CORPORA = ('screens', 'negatives_sections', 'web')
BATCH = 32


def rel(p):
    return os.path.relpath(p, DATA).replace(os.sep, '/')


def walk():
    for corpus in CORPORA:
        root = os.path.join(DATA, corpus)
        if not os.path.isdir(root):
            continue
        for dirpath, dirnames, files in os.walk(root):
            dirnames.sort()
            for f in sorted(files):
                if f.lower().endswith(EXT):
                    yield os.path.join(dirpath, f)


def load_model():
    import open_clip
    import torch
    dev = 'mps' if torch.backends.mps.is_available() else 'cpu'
    model, _, preprocess = open_clip.create_model_and_transforms(
        MODEL, pretrained=PRETRAINED)
    model.eval().to(dev)
    return model, preprocess, torch, dev


def write_index(rows, extra=None):
    """rows: list of (key, list[float16 bytes])"""
    os.makedirs(OUT, exist_ok=True)
    with open(os.path.join(OUT, 'vectors.bin'), 'wb') as f:
        for _, buf in rows:
            f.write(buf)
    keys = {}
    for i, (key, _) in enumerate(rows):
        keys[key] = i
    meta = {
        'model': f'open_clip:{MODEL}:{PRETRAINED}',
        'dim': DIM,
        'dtype': 'float16',
        'normalized': True,
        'count': len(rows),
        'generated': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
        'corpora': list(CORPORA),
        'keys': keys,
    }
    if extra:
        meta.update(extra)
    with open(os.path.join(OUT, 'index.json'), 'w') as f:
        json.dump(meta, f, indent=0)


def read_vectors():
    import numpy as np
    meta = json.load(open(os.path.join(OUT, 'index.json')))
    raw = np.fromfile(os.path.join(OUT, 'vectors.bin'), dtype=np.float16)
    return meta, raw.reshape(-1, meta['dim'])


def cmd_build():
    import numpy as np
    from PIL import Image
    model, preprocess, torch, dev = load_model()

    have = {}
    if os.path.exists(os.path.join(OUT, 'index.json')):
        meta, arr = read_vectors()
        have = {k: np.asarray(arr[i], dtype=np.float16)
                for k, i in meta['keys'].items()}
        print(f'{len(have)} vectors already on disk')
        rows = [(k, have[k].tobytes()) for k in
                sorted(have, key=lambda k: meta['keys'][k])]
    else:
        rows = []

    todo = [p for p in walk() if rel(p) not in have]
    print(f'{len(todo)} crops to embed with {MODEL}/{PRETRAINED} on {dev}')
    t0 = time.time()
    done = 0
    for i in range(0, len(todo), BATCH):
        chunk = todo[i:i + BATCH]
        imgs = []
        for p in chunk:
            try:
                imgs.append((p, preprocess(Image.open(p).convert('RGB'))))
            except Exception as e:  # unreadable crop: skip, count it
                print(f'  skip {rel(p)}: {e}')
        if not imgs:
            continue
        with torch.no_grad():
            batch = torch.stack([im for _, im in imgs]).to(dev)
            feats = model.encode_image(batch)
            feats = feats / feats.norm(dim=-1, keepdim=True)
            feats = feats.float().cpu().numpy().astype(np.float16)
        for (p, _), v in zip(imgs, feats):
            rows.append((rel(p), v.tobytes()))
        done += len(imgs)
        if done % 320 < BATCH:
            print(f'  {done}/{len(todo)}  {time.time()-t0:.0f}s')
    write_index(rows)
    print(f'wrote {len(rows)} vectors ({len(rows)*DIM*2/1e6:.1f} MB) '
          f'in {time.time()-t0:.0f}s')


def cmd_query(text):
    model, _, torch, dev = load_model()
    import open_clip
    tok = open_clip.get_tokenizer(MODEL)
    with torch.no_grad():
        f = model.encode_text(tok([text]).to(dev))
        f = f / f.norm(dim=-1, keepdim=True)
    print(json.dumps([round(float(x), 6) for x in f[0].float().cpu()]))


def cmd_means():
    """Mean image vector per pattern, from its evidence screens."""
    import numpy as np
    meta, arr = read_vectors()
    pidx = json.load(open(os.path.join(DATA, 'pattern-index.json')))
    cells = {}
    with open(os.path.join(DATA, 'annotations.jsonl')) as f:
        for line in f:
            r = json.loads(line)
            if 'error' in r:
                continue
            cell = (r['site_type'], r['page_type'], r['section_type'])
            cells.setdefault(cell, []).append(rel(r['image']))
    out, missing = {}, 0
    for pat in pidx['patterns']:
        cell = (pat['site_type'], pat['page_type'], pat['section_type'])
        vecs = []
        for key in cells.get(cell, []):
            row = meta['keys'].get(key)
            if row is None:
                missing += 1
                continue
            vecs.append(np.asarray(arr[row], dtype=np.float32))
        if not vecs:
            continue
        m = np.mean(vecs, axis=0)
        m /= (np.linalg.norm(m) or 1.0)
        out[pat['id']] = [round(float(x), 4)
                          for x in m.astype(np.float16)]
    path = os.path.join(OUT, 'pattern_means.json')
    with open(path, 'w') as f:
        json.dump({'model': meta['model'], 'dim': meta['dim'],
                   'means': out}, f)
    print(f'{len(out)} pattern means, {missing} crops without a vector '
          f'-> {os.path.relpath(path, PATTERNS)}')


if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'build'
    if cmd == 'build':
        cmd_build()
    elif cmd == 'query':
        cmd_query(' '.join(sys.argv[2:]))
    elif cmd == 'means':
        cmd_means()
    else:
        raise SystemExit(__doc__)
