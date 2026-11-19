#!/usr/bin/env python3
"""OpenRouter Gemini site-type pass — replaces the local mlx queue.

  .venv/bin/python vlm_gemini_site_type.py --compare 100
  .venv/bin/python vlm_gemini_site_type.py --run [--limit N]

compare: classify N slugs that already carry site_type_method=='vlm'
(local Qwen) and write data/gemini-vs-local-compare.json — labels,
confidence, agreement. Does NOT touch meta.json.

run: classify the review queue, write site_type_v2 +
site_type_method='gemini-2.5-flash-lite' + vlm_evidence into each
meta.json. Skips 'done' unless --reclassify.

Same image set + same prompt as vlm_site_type.py so the comparison
isolates model, not input. 4 workers, retry-429, key from env
OPENROUTER_API_KEY or ../SECRETS/OR-API.txt.
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
CORPUS = os.path.join(DATA, 'operator')
REVIEW = os.path.join(DATA, 'site-type-review.json')
COMPARE_OUT = os.path.join(DATA, 'gemini-vs-local-compare.json')
sys.path.insert(0, HERE)
from vlm_site_type import SITE_PROMPT, crops_for  # noqa: E402

MODEL = 'google/gemini-2.5-flash-lite'
URL = 'https://openrouter.ai/api/v1/chat/completions'
KEY_FILE = os.path.normpath(os.path.join(
    HERE, '..', '..', '..', '..', '..', 'SECRETS', 'OR-API.txt'))


def api_key():
    k = os.environ.get('OPENROUTER_API_KEY', '').strip()
    if k:
        return k
    return open(KEY_FILE).read().strip()


def _img_block(path):
    ext = os.path.splitext(path)[1].lstrip('.').replace('jpg', 'jpeg')
    b64 = base64.b64encode(open(path, 'rb').read()).decode()
    return {'type': 'image_url',
            'image_url': {'url': f'data:image/{ext};base64,{b64}'}}


def classify(slug, crops):
    content = [{'type': 'text', 'text': SITE_PROMPT}]
    content += [_img_block(p) for p in crops]
    body = json.dumps({
        'model': MODEL,
        'messages': [{'role': 'user', 'content': content}],
        'max_tokens': 200,
        'temperature': 0}).encode()
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
def _img_block(path):
    """Base64 the crop; downscale anything >500KB — OpenRouter 400s
    on payloads the model can't decode or oversized images."""
    raw = open(path, 'rb').read()
    if len(raw) > 500_000:
        from PIL import Image
        import io
        im = Image.open(io.BytesIO(raw)).convert('RGB')
        w, h = im.size
        if w > 1100:
            im = im.resize((1100, int(h * 1100 / w)),
                           Image.LANCZOS)
        buf = io.BytesIO()
        im.save(buf, 'JPEG', quality=72)
        raw = buf.getvalue()
        ext = 'jpeg'
    else:
        ext = os.path.splitext(path)[1].lstrip('.').replace(
            'jpg', 'jpeg')
    b64 = base64.b64encode(raw).decode()
    return {'type': 'image_url',
            'image_url': {'url': f'data:image/{ext};base64,{b64}'}}

    compare_n = run = limit = reclassify = 0
    args = sys.argv[1:]
    if '--compare' in args:
        compare_n = int(args[args.index('--compare') + 1])
    if '--run' in args:
        run = 1
    if '--limit' in args:
        limit = int(args[args.index('--limit') + 1])
    if '--reclassify' in args:
        reclassify = 1

    jobs = []
    for slug in queue:
        mp = os.path.join(CORPUS, slug, 'meta.json')
        if not os.path.exists(mp):
            continue
        meta = json.load(open(mp))
        local_done = meta.get('site_type_method') == 'vlm'
        if compare_n:
            if local_done:
                jobs.append((slug, meta, mp))
            if len(jobs) >= compare_n:
                break
        elif run:
            method = meta.get('site_type_method', '')
            if method.startswith('gemini') and not reclassify:
                continue
            crops = crops_for(meta, os.path.join(CORPUS, slug))
            if crops:
                jobs.append((slug, meta, mp))
            if limit and len(jobs) >= limit:
                break

    mode = 'compare' if compare_n else 'run'
    print(f'{mode}: {len(jobs)} sites via {MODEL}', flush=True)
    out, done = {}, 0
    with ThreadPoolExecutor(max_workers=4) as pool:
        futs = {pool.submit(classify, slug,
                            crops_for(meta, os.path.join(CORPUS, slug))
                            ): (slug, meta, mp) for slug, meta, mp in jobs}
        for fut in as_completed(futs):
            slug, meta, mp = futs[fut]
            res, err = fut.result()
            done += 1
            if res is None:
                print(f'[{done}/{len(jobs)}] {slug[:36]}: ERR {err}',
                      flush=True)
                continue
            if compare_n:
                out[slug] = {
                    'local': meta.get('site_type_v2'),
                    'local_conf': meta.get('site_type_v2_confidence'),
                    'gemini': res.get('site_type'),
                    'gemini_conf': res.get('confidence'),
                    'evidence': res.get('evidence')}
                print(f'[{done}/{len(jobs)}] {slug[:30]}: '
                      f"{meta.get('site_type_v2')} -> "
                      f"{res.get('site_type')}", flush=True)
            else:
                meta['site_type_v2'] = res.get('site_type')
                meta['site_type_v2_confidence'] = res.get('confidence')
                meta['site_type_method'] = MODEL
                meta['vlm_evidence'] = res.get('evidence')
                json.dump(meta, open(mp, 'w'), indent=1)
                print(f'[{done}/{len(jobs)}] {slug[:36]}: '
                      f"{res.get('site_type')}", flush=True)
    if compare_n:
        agree = sum(1 for v in out.values()
                    if v['local'] == v['gemini'])
        json.dump({'model': MODEL, 'n': len(out),
                   'agreement': agree,
                   'labels': out},
                  open(COMPARE_OUT, 'w'), indent=1)
        print(f'agreement {agree}/{len(out)} -> {COMPARE_OUT}',
              flush=True)


if __name__ == '__main__':
    main()
