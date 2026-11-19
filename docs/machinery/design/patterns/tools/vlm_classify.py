#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# dependencies = ["pillow"]
# ///
"""Real VLM pass over the canon web corpus: qwen2.5vl via ollama.

The CLIP zero-shot layer (`annotate_web.py`, `classifier_model:
open_clip:ViT-B-32`) labels media blocks from fixed prompts; this pass
asks an actual vision-language model the CLASSIFY.md questions and the
UI-ANALYSIS question. VLM output is merged into each site's meta.json
*alongside* the CLIP labels — never silently over it — with
`classifier_model`/`provenance` marking which engine said what.

  uv run vlm_classify.py [--site SLUG] [--limit N] [--media-per-site 4]

Per image: `vlm` block = CLASSIFY.md fields (medium, subject_class,
style, emotion_axes, intent) + confidence. Per site:
`ui_analysis_vlm` = the UI-ANALYSIS prompt's structured answer. Both are
content-cached (`vlm_classify`/`vlm_ui`) on image sha + model + prompt
sha, so a re-run costs only what changed. A site/image the VLM cannot
answer keeps its CLIP labels and gains `vlm_error` — CLIP is the
fallback, the VLM is never silently absent.
"""
import base64
import io
import json
import os
import re
import sys
import time
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.normpath(os.path.join(HERE, '..', 'data'))
WEB = os.path.join(DATA, 'web', 'canon')
ROOT = os.path.normpath(os.path.join(HERE, '..', '..', '..', '..', '..'))
OLLAMA = 'http://localhost:11434'
MODEL = 'qwen2.5vl:3b'

sys.path.insert(0, HERE)
import cache  # noqa: E402

CLASSIFY_MD = os.path.join(ROOT, 'templates', 'image-brief', 'CLASSIFY.md')
UI_MD = os.path.join(ROOT, 'templates', 'image-brief', 'UI-ANALYSIS.md')

CLASSIFY_PROMPT = """You are classifying an image cropped from a web page.
Reply with ONLY a JSON object, no prose, no markdown fence:
{"medium": one of [photograph, illustration, hand-drawn sketch, painting, vector graphic, flat colour design, 3D render, isometric, pixel art, collage, pattern/texture, typography-only, UI screenshot, infographic/chart, mixed media, AI-generated],
 "subject": "free text, role-level only, no identities",
 "subject_class": one of [people, product, place/architecture, interior, vehicle, food, nature/landscape, animal, abstract, object still-life, document/screen, text/lettering],
 "style": one of [minimal, maximal, editorial, documentary, lifestyle, corporate, luxury/fashion, street, brutalist, retro, flat design, scientific/technical, cartoon, vintage print],
 "emotion_tags": [1-3 of joy, excitement, calm, serenity, awe, trust, confidence, warmth/belonging, curiosity, determination, urgency, mystery, care],
 "emotion_axes": {"calm_energetic": int -2..2, "accessible_luxurious": int -2..2, "serious_playful": int -2..2},
 "confidence": 0..1}"""

UI_PROMPT = """Analyze this web page screenshot. Reply with ONLY a JSON object:
{"summary_title": "concise description of page purpose and site vertical",
 "nav": "navigation pattern you see",
 "layout": {"max_content_width_px": int or null, "sections": int},
 "sections": [{"purpose_speech_act": "promise|explain|prove|act|nav|footer|other", "composition": "short label", "surface": "base|inverse|media"}],
 "colors": {"bg": "#hex", "ink": "#hex", "accent": "#hex"},
 "grid": {"columns": int},
 "typography": {"display_style": "serif|sans|mono|mixed", "rank_count": int},
 "imagery": {"medium": "dominant medium", "mood": "one phrase"},
 "strengths": ["..."], "defects": ["..."]}"""

# prompt version rides every key: edit a prompt -> old entries orphan
PROMPT_V = cache.text_sha(CLASSIFY_PROMPT + '|' + UI_PROMPT)[:12]


def img_b64(crop, max_side=1024):
    from PIL import Image
    im = Image.open(crop).convert('RGB')
    if max(im.size) > max_side:
        im.thumbnail((max_side, max_side))
    buf = io.BytesIO()
    im.save(buf, format='JPEG', quality=85)
    return base64.b64encode(buf.getvalue()).decode()


def ask(image_path, prompt, key, timeout=120):
    """One VLM call, content-cached. None on failure (caller falls back)."""
    hit = cache.get(key[0], key[1])
    if hit is not None:
        return hit
    try:
        req = urllib.request.Request(
            OLLAMA + '/api/generate',
            data=json.dumps({'model': MODEL, 'prompt': prompt,
                             'images': [img_b64(image_path)],
                             'stream': False, 'format': 'json',
                             'options': {'num_predict': 900,
                                         'temperature': 0.1}}).encode(),
            headers={'Content-Type': 'application/json'})
        with urllib.request.urlopen(req, timeout=timeout) as r:
            d = json.loads(r.read())
        out = json.loads(d['response'])
        cache.put(key[0], key[1], out, meta={'model': MODEL})
        return out
    except Exception:
        return None


def classify_block(site_dir, im):
    """VLM label for one media block crop."""
    from PIL import Image
    tp = os.path.join(site_dir, im['tile'])
    if not os.path.exists(tp):
        return None, 'missing tile'
    im_pil = Image.open(tp).convert('RGB')
    W, H = im_pil.size
    c = im.get('_crop')
    if c:
        box = (int(c[0] * W), int(c[1] * H), int(c[2] * W), int(c[3] * H))
    else:  # bbox is absolute pixels
        b = im['bbox']
        box = (int(b[0]), 0, int(b[2]), H)
    if box[2] - box[0] < 24 or box[3] - box[1] < 24:
        return None, 'crop too small'
    crop = im_pil.crop(box)
    tmp = os.path.join(site_dir, '.vlm_tmp.jpg')
    crop.save(tmp)
    sha = cache.file_sha(tmp)
    out = ask(tmp, CLASSIFY_PROMPT,
              ('vlm_classify', f'{sha}:{MODEL}:{PROMPT_V}'))
    os.remove(tmp)
    return out, None if out else 'no parse'


def site_ui(site_dir, meta):
    """UI-ANALYSIS over the first (hero) tile."""
    tiles = meta.get('tiles') or []
    if not tiles:
        return None
    tp = os.path.join(site_dir, tiles[0])
    if not os.path.exists(tp):
        return None
    sha = cache.file_sha(tp)
    return ask(tp, UI_PROMPT, ('vlm_ui', f'{sha}:{MODEL}:{PROMPT_V}'))


def process(slug, media_per_site=4):
    d = os.path.join(WEB, slug)
    mp = os.path.join(d, 'meta.json')
    if not os.path.exists(mp):
        return None
    meta = json.load(open(mp))
    if meta.get('capture_status', 'ok') != 'ok':
        return None
    t0 = time.time()
    n_img = n_ok = 0
    for im in (meta.get('images') or [])[:media_per_site]:
        if im.get('vlm') and not os.environ.get('VLM_REFRESH'):
            continue
        n_img += 1
        lab, err = classify_block(d, im)
        if lab:
            # provenance is explicit: CLIP fields stay, VLM adds `vlm`
            im['vlm'] = lab
            im['vlm_model'] = MODEL
            n_ok += 1
        else:
            im['vlm_error'] = err or 'unanswered'
    ui = site_ui(d, meta)
    if ui:
        meta['ui_analysis_vlm'] = ui
        meta['ui_analysis_vlm_model'] = MODEL
    meta['vlm_pass_at'] = time.strftime('%Y-%m-%dT%H:%M:%SZ',
                                        time.gmtime())
    json.dump(meta, open(mp, 'w'), indent=1)
    return n_img, n_ok, bool(ui), time.time() - t0


def main():
    limit = int(sys.argv[sys.argv.index('--limit') + 1]) \
        if '--limit' in sys.argv else None
    mps = int(sys.argv[sys.argv.index('--media-per-site') + 1]) \
        if '--media-per-site' in sys.argv else 4
    slugs = sorted(s for s in os.listdir(WEB)
                   if os.path.isdir(os.path.join(WEB, s)))
    if '--site' in sys.argv:
        slugs = [sys.argv[sys.argv.index('--site') + 1]]
    if limit:
        slugs = slugs[:limit]
    n = tot_i = tot_ok = tot_ui = 0
    t0 = time.time()
    for slug in slugs:
        r = process(slug, mps)
        if not r:
            continue
        n += 1
        ni, nok, ui, secs = r
        tot_i += ni
        tot_ok += nok
        tot_ui += ui
        print(f'{slug}: {nok}/{ni} images, ui={"y" if ui else "n"} '
              f'{secs:.0f}s', flush=True)
    dt = time.time() - t0
    print(f'--- {n} sites, {tot_ok}/{tot_i} media labelled, '
          f'{tot_ui} ui_analysis, {dt:.0f}s '
          f'({dt / max(1, tot_i):.1f}s/image) ---')


if __name__ == '__main__':
    main()
