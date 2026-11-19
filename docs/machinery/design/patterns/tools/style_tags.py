#!/usr/bin/env python3
"""Style-tag every CLIP row via OpenRouter gemini-2.5-flash-lite.

Inputs: every render_path in data/render_vectors/index.json (bank_shots
renders + proof shots). Output written IN PLACE on each index row:
  style_tags = {section_type, style, medium, mood, confidence}
plus data/bank-style-index.json — the style-filter lookup layer:
{"card in editorial" vs "card in brutalist" = metadata filter}.

  .venv/bin/python style_tags.py [--limit N] [--reclass]

Closed vocab: CLASSIFY.md section types + style/medium/mood subsets.
4 workers, retry-429, key OPENROUTER_API_KEY or SECRETS/OR-API.txt.
"""
import base64
import json
import os
import sys
import time
import urllib.request
import urllib.error
from collections import Counter
from concurrent.futures import ThreadPoolExecutor, as_completed

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.normpath(os.path.join(HERE, '..', 'data'))
REPO = os.path.normpath(os.path.join(HERE, '..', '..', '..',
                                     '..', '..'))
IDX = os.path.join(DATA, 'render_vectors', 'index.json')
STYLE_OUT = os.path.join(DATA, 'bank-style-index.json')
MODEL = 'google/gemini-2.5-flash-lite'
URL = 'https://openrouter.ai/api/v1/chat/completions'
KEY_FILE = os.path.normpath(os.path.join(
    HERE, '..', '..', '..', '..', '..', '..', 'SECRETS', 'OR-API.txt'))

PROMPT = """Look at this rendered UI/section image. Reply with ONLY a JSON object:
{"section_type": one of [hero, nav, feature, how-it-works, testimonials, logo-sections, pricing, faq, call-to-action, contact, form, gallery, work-grid, product-grid, footer, table, tabs, card, list, modal, input, navigation, ornament, other],
 "style": one of [minimal, editorial, luxury, playful, technical, brutalist, retro, corporate, organic, utility],
 "medium": one of [photograph, illustration, 3d-render, vector-graphic, typography-only, ui-screenshot, wireframe, mixed],
 "mood": one of [calm, bold, warm, clinical, dramatic, friendly, stark, elegant],
 "confidence": 0..1}
Judge the VISUAL treatment, not the content words."""


def api_key():
    k = os.environ.get('OPENROUTER_API_KEY', '').strip()
    return k or open(KEY_FILE).read().strip()


def img_block(path):
    import io
    from PIL import Image
    im = Image.open(path)
    w, h = im.size
    if w > 900:
        im = im.resize((900, int(h * 900 / w)))
    buf = io.BytesIO()
    im.convert('RGB').save(buf, 'JPEG', quality=72)
    b64 = base64.b64encode(buf.getvalue()).decode()
    return {'type': 'image_url',
            'image_url': {'url': f'data:image/jpeg;base64,{b64}'}}



def tag(path):
    body = json.dumps({
        'model': MODEL,
        'messages': [{'role': 'user', 'content':
                      [{'type': 'text', 'text': PROMPT},
                       img_block(path)]}],
        'max_tokens': 160, 'temperature': 0}).encode()
    for attempt in range(4):
        try:
            req = urllib.request.Request(URL, data=body, headers={
                'Authorization': f'Bearer {api_key()}',
                'Content-Type': 'application/json'})
            with urllib.request.urlopen(req, timeout=90) as r:
                txt = json.loads(r.read())['choices'][0][
                    'message']['content']
            s, e = txt.find('{'), txt.rfind('}')
            return json.loads(txt[s:e + 1]), None
        except urllib.error.HTTPError as ex:
            if ex.code == 429:
                time.sleep(5 * (attempt + 1))
                continue
            return None, f'http {ex.code}'
        except Exception as ex:  # noqa: BLE001
            return None, str(ex)[:120]
    return None, '429 exhausted'


def main():
    args = sys.argv[1:]
    limit = int(args[args.index('--limit') + 1]) if '--limit' in args \
        else 10**9
    reclass = '--reclass' in args
    idx = json.load(open(IDX))
    rows = idx['rows']
    jobs = []
    for rp, row in rows.items():
        st = row.get('style_tags')
        if st and not reclass:
            # keep tags only if they were made on the same pixels
            if st.get('sha256') == row.get('sha256'):
                continue
        p = os.path.join(REPO, rp)
        if os.path.exists(p):
            jobs.append((rp, p))
        if len(jobs) >= limit:
            break
    print(f'{len(jobs)} rows to tag via {MODEL}', flush=True)
    done = errs = 0
    style_idx = {}
    with ThreadPoolExecutor(max_workers=100) as pool:
        futs = {pool.submit(tag, p): rp for rp, p in jobs}
        for fut in as_completed(futs):
            rp = futs[fut]
            res, err = fut.result()
            done += 1
            if res is None:
                errs += 1
                if errs < 8:
                    print(f'  ERR {rp}: {err}', flush=True)
                continue
            row = rows[rp]
            row['style_tags'] = {
                'section_type': res.get('section_type'),
                'style': res.get('style'),
                'medium': res.get('medium'),
                'mood': res.get('mood'),
                'confidence': res.get('confidence'),
                'sha256': row.get('sha256'),
                'model': MODEL}
            style_idx[rp] = row['style_tags']
            if done % 100 == 0:
                print(f'  {done}/{len(jobs)}', flush=True)
    json.dump(idx, open(IDX, 'w'), indent=1)
    # full style index (all rows that carry tags, incl. prior runs)
    full = {rp: r['style_tags'] for rp, r in rows.items()
            if r.get('style_tags')}
    json.dump({'model': MODEL, 'n': len(full),
               'generated': time.strftime('%Y-%m-%dT%H:%M:%SZ',
                                          time.gmtime()),
               'rows': full},
              open(STYLE_OUT, 'w'), indent=1)
    dist = Counter(t['style'] for t in full.values())
    print(f'DONE {done} tagged, {errs} errs -> {STYLE_OUT}')
    print('style dist:', dist.most_common())


if __name__ == '__main__':
    main()
