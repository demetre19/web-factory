#!/usr/bin/env python3
# /// script
# requires-python = ">=3.11"
# dependencies = ["numpy", "requests"]
# ///
"""Text vectors per section-bank row (nomic-embed-text via local
ollama — free). Text = annotation copy: heading_text, site_name,
section_type, speech_act, composition, exemplar tag. Stored in
data/section-bank/text_vectors.bin (768d f16), aligned to index order.

  uv run --quiet section_text_embed.py build
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.normpath(os.path.join(HERE, '..', 'data'))
ANN = os.path.join(DATA, 'annotations.jsonl')
IDX = os.path.join(DATA, 'section-bank', 'index.json')
OUT = os.path.join(DATA, 'section-bank', 'text_vectors.bin')
OLLAMA = 'http://localhost:11434/api/embeddings'
MODEL = 'nomic-embed-text'
DIM = 768


def texts():
    """image rel path -> text blob from annotation rows."""
    out = {}
    for line in open(ANN):
        try:
            r = json.loads(line)
        except Exception:
            continue
        img = r.get('image') or ''
        if '/operator/' not in img:
            continue
        parts = img.replace('\\', '/').split('/')
        slug = parts[parts.index('operator') + 1]
        fname = parts[-1]
        key = 'docs/machinery/design/patterns/data/operator/' \
            + slug + '/' + fname
        bits = [r.get('heading_text'), r.get('site_name'),
                r.get('section_type'), r.get('speech_act'),
                r.get('composition'), r.get('exemplar')]
        blob = ' | '.join(str(b) for b in bits if b)
        if blob and blob not in out.get(key, ''):
            out[key] = (out.get(key, '') + ' ' + blob).strip()
    return out


def embed(text):
    import requests
    import time as _t
    for a in range(6):
        try:
            r = requests.post(OLLAMA, json={'model': MODEL,
                                            'prompt': text},
                              timeout=45)
            return r.json()['embedding']
        except Exception:
            _t.sleep(8 * (a + 1))
    raise RuntimeError('ollama unreachable after retries')


def main():
    import numpy as np
    meta = json.load(open(IDX))
    order = meta['order']
    rows = meta['rows']
    txt = texts()
    existing = {}
    if os.path.exists(OUT):
        raw = np.fromfile(OUT, dtype=np.float16)
        n = len(raw) // DIM
        for i, k in enumerate((meta.get('text_order') or [])[:n]):
            existing[k] = raw[i * DIM:(i + 1) * DIM]
    pending = [(k, txt.get(k)) for k in order
               if k in txt and k not in existing]
    print(f'{len(existing)} text vectors, {len(pending)} to embed')
    new = {}
    for i, (k, t) in enumerate(pending):
        try:
            new[k] = np.array(embed(t), dtype=np.float16)
        except Exception as e:
            print(f'  {k}: {e}', file=sys.stderr)
            import time as _t2
            _t2.sleep(30)
            # keep going — ollama restarts externally under load
        if (i + 1) % 200 == 0:
            print(f'  {i + 1}/{len(pending)}', flush=True)
    existing.update(new)
    allk = [k for k in order if k in existing]
    arr = np.stack([existing[k] for k in allk]).astype(np.float16) \
        if allk else np.zeros((0, DIM), dtype=np.float16)
    arr.tofile(OUT)
    meta['text_order'] = allk
    meta['text_model'] = MODEL
    meta['text_dim'] = DIM
    json.dump(meta, open(IDX, 'w'), indent=1)
    print(f'{len(new)} new -> {OUT} ({len(allk)} total)')


if __name__ == '__main__':
    main()
