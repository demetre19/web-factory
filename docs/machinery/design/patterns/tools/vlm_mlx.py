#!/usr/bin/env python3
"""MLX VLM pass over the operator canon (Apple silicon backend).

Ollama's qwen2.5vl:3b vision path times out (>280 s/image); the same
model family through mlx-vlm answers in seconds. Run INSIDE .venv-vlm:

  ../../.venv-vlm/bin/python vlm_mlx.py [--site SLUG] [--limit N] [--per-site 3]

Per section crop: `vlm` block (CLASSIFY.md fields + section_type guess
+ trend guess) on meta.json's sections entry — alongside the
Section-Scan label, never over it. Per site: `ui_analysis_vlm`.
Content-cached in cache.sqlite (image sha + model + prompt sha), so
re-runs cost only what changed. Downscale to <=640px on the client
side; the model keeps full context on UI crops.
"""
import json
import os
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.normpath(os.path.join(HERE, '..', 'data'))
CORPUS = os.path.join(DATA, 'operator')
ROOT = os.path.normpath(os.path.join(HERE, '..', '..', '..', '..', '..'))
VENV = os.path.join(ROOT, '.venv-vlm', 'bin', 'python')
MODEL = 'mlx-community/Qwen2.5-VL-3B-Instruct-4bit'

sys.path.insert(0, HERE)
import cache  # noqa: E402

SEC_PROMPT = """Look at this UI section crop. Reply with ONLY a JSON object:
{"section_type": one of [hero, nav, feature, how-it-works, testimonials, logo-sections, pricing, faq, call-to-action, contact, form, gallery, work-grid, product-grid, footer, content, other],
 "medium": one of [photograph, illustration, 3D render, vector graphic, typography-only, UI screenshot, mixed],
 "style": one of [minimal, editorial, luxury, playful, technical, brutalist, retro, corporate],
 "summary": "one sentence: what this section is doing",
 "trend_guess": one of [none, cute-alism, dial-up-delight, resonant-stark, frosted-touch, light-skeuomorphism, snug-simple, human-scribble, dated],
 "confidence": 0..1}"""

UI_PROMPT = """Analyze this full web page screenshot. Reply with ONLY a JSON object:
{"summary_title": "one line: purpose + vertical",
 "nav": "nav pattern seen",
 "layout": {"max_content_width_px": int or null, "sections": int},
 "colors": {"bg": "#hex", "ink": "#hex", "accent": "#hex"},
 "typography": {"display_style": "serif|sans|mono|mixed"},
 "strengths": ["..."], "defects": ["..."]}"""

PROMPT_V = cache.text_sha(SEC_PROMPT + '|' + UI_PROMPT)[:12]


def _model():
    global M, P
    if 'M' not in globals():
        os.environ.setdefault('HF_HUB_OFFLINE', '1')
        from mlx_vlm import load
        M, P = load(MODEL)
    return M, P


def _prep(path, tmpdir, max_side=640):
    from PIL import Image
    im = Image.open(path).convert('RGB')
    if max(im.size) > max_side:
        im.thumbnail((max_side, max_side))
    tmp = os.path.join(tmpdir, '.vlm_tmp.jpg')
    im.save(tmp, quality=85)
    return tmp


def ask(image_path, prompt, kind, tmpdir):
    sha = cache.file_sha(image_path)
    key = f'{sha}:mlx-qwen25vl:{PROMPT_V}'
    hit = cache.get(kind, key)
    if hit is not None:
        return hit
    m, p = _model()
    from mlx_vlm import generate
    from mlx_vlm.prompt_utils import apply_chat_template
    small = _prep(image_path, tmpdir)
    prm = apply_chat_template(m, m.config, prompt)
    try:
        out = generate(m, p, prompt=prm, image=[small],
                       max_tokens=260, verbose=False)
        txt = out.text if hasattr(out, 'text') else str(out)
        st = txt.find('{')
        # model sometimes echoes a second object; decode the first only
        res, _ = json.JSONDecoder().raw_decode(txt[st:])
        res['classifier_model'] = 'mlx/qwen2.5-vl-3b-4bit'
        cache.put(kind, key, res, meta={'model': 'mlx-qwen25vl'})
        return res
    except Exception as e:
        print(f'  vlm error {os.path.basename(image_path)}: {e}',
              file=sys.stderr)
        return None
    finally:
        if os.path.exists(small):
            os.remove(small)


def process(slug, per_site):
    d = os.path.join(CORPUS, slug)
    mp = os.path.join(d, 'meta.json')
    if not os.path.exists(mp):
        return None
    meta = json.load(open(mp))
    if meta.get('capture_status', 'ok') != 'ok':
        return 'skipped-not-ok'
    done = 0
    for s in meta.get('sections') or []:
        if s.get('vlm') and not os.environ.get('VLM_REFRESH'):
            continue
        if done >= per_site:
            break
        sp = os.path.join(d, s['file'])
        if not os.path.exists(sp):
            continue
        lab = ask(sp, SEC_PROMPT, 'vlm_classify', d)
        if lab:
            s['vlm'] = lab
            done += 1
    tiles = meta.get('tiles') or []
    if tiles and not meta.get('ui_analysis_vlm'):
        tp = os.path.join(d, tiles[0])
        if os.path.exists(tp):
            ua = ask(tp, UI_PROMPT, 'vlm_ui', d)
            if ua:
                meta['ui_analysis_vlm'] = ua
    json.dump(meta, open(mp, 'w'), indent=1)
    return f'{done} sections + ui'


def main():
    args = sys.argv[1:]
    site = args[args.index('--site') + 1] if '--site' in args else None
    limit = int(args[args.index('--limit') + 1]) if '--limit' in args \
        else 1_000
    per = int(args[args.index('--per-site') + 1]) \
        if '--per-site' in args else 3
    if site:
        slugs = [site]
    else:
        slugs = sorted(s for s in os.listdir(CORPUS)
                       if os.path.isdir(os.path.join(CORPUS, s))
                       and s != '_sources')[:limit]
    t0 = time.time()
    n = 0
    for sl in slugs:
        r = process(sl, per)
        if r and r != 'skipped-not-ok':
            n += 1
            print(f'{sl}: {r} ({time.time() - t0:.0f}s)', flush=True)
    print(f'{n}/{len(slugs)} sites classified in {time.time() - t0:.0f}s')


if __name__ == '__main__':
    main()
