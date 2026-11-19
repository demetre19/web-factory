#!/usr/bin/env python3
"""Vision-annotate Mobbin section crops + page screenshots with GPT-4o.

Emits one JSONL record per image to data/annotations.jsonl (Mobbin) and
data/annotations_contrast.jsonl (negatives). The blocks[] vocabulary is
shared with tools/design-gate/ps_features.py so vision-derived and
DOM-derived PS.* features have identical names.

Usage:
  python3 annotate.py mobbin [--limit N] [--workers 8]
  python3 annotate.py negatives [--limit N]
  python3 annotate.py stats
"""
import base64
import json
import os
import sys
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.normpath(os.path.join(HERE, '..', 'data'))
SCREENS = os.path.join(DATA, 'screens')
CONTRAST = os.path.join(DATA, 'contrast')
MODEL = 'gpt-4o'

PROMPT = """You are a design-pattern annotator for a website pattern library.
Look at this website section screenshot and return ONE JSON object, no prose.

Field rules (closed sets — pick exactly one unless noted):
- site_type: services|saas|technology|ecommerce|fashion|luxury-goods|jewellery|architecture|homes|healthcare|finance|education|hospitality|agency-portfolio|marketplace|nonprofit|real-estate|media|events|automotive|legal|recruitment|community|personal-brand|government|portfolio|other
- page_type: home|service-detail|pricing|about|contact|landing|blog|product|category|collection|cart|checkout|search-results|work-index|case-study|listing|schedule|article|configurator|lookbook|store-locator|appointment|brand-story|project-index|project-case-study|floor-plans|enquiry|other
- section_type: hero|proof-band|testimonials|logo-sections|counter|feature|how-it-works|timeline|comparison|pricing|faq|call-to-action|contact|form|gallery|grids-and-cards|content|footer|headers|banner|newsletter|teams|table|product-grid|product-card|add-to-cart|price-variant|reviews|trust-badges|shipping-returns|cross-sell|filters-sort|mini-cart|work-grid|case-study|schedule|donate|search-bar|lookbook-spread|configurator-panel|store-locator|booking|floor-plan|project-grid|lightbox-gallery|awards|other
- speech_act: promise|proof|tension|how|objection|act|detail|chrome
- composition: split-media|stacked-hero|proof-band|editorial|cards-n|sequence|faq|comparison|logo-wall|stat-band|full-bleed|badge-center|media-gallery|form-panel|quote-grid|map-finder|capture-form|text-index|app-band|hero-act-merge|link-grid|carousel|other
- surface: base|muted|inverse|brand|media
- density: compact|regular|spacious
- disclosure: open|folded|tabbed|carousel|none
- nav_pattern (if this block contains nav, else "none"): bar|bar-cta|mega|hamburger-only|side|none
- heading_form (of the section's main heading, if any): claim|query|label|none
- mobile_evidence: true if the screenshot is clearly a mobile viewport
- quality_tier: A (top-tier product/design craft) | B (competent) | C (generic/dated)

Measurable fields (numbers, estimate visually):
- columns: int (main text/content columns, 1-4)
- cta_count: int; cta_rank_primary: hero|section|none (where the visually strongest CTA sits)
- heading_body_ratio: float, heading font size / body font size (e.g. 3.5)
- whitespace_share: float 0-1, share of block area that is empty space
- media_ratio: float 0-1, share of block area that is image/video/screenshot/illustration
- media_type: photo|screenshot|illustration|3d-render|video-still|none
- serif_display: true if the display/heading typeface is a serif
- radius_personality: sharp|soft|pill|mixed (corner treatment of cards/buttons/containers)
- cinematic: true if the section is clearly built around a full-bleed photo/video canvas (motion proxy)
- above_fold: true if this plausibly sits above the fold (hero/nav/proof-band)

blocks[] — segment the screenshot into visual regions (y-sorted, top to bottom).
Each block: {"role","y0","y1","x0","x1","has_heading","has_cta","has_media",
"has_form","has_links","prose_mass"} — roles: chrome-nav|chrome-footer|
legal|cookie|main|supplementary; coords 0.0-1.0 fractions; prose_mass =
float 0-1 share of the block that is paragraph text. A main block is
primary content; supplementary is side/supporting content; chrome-* and
legal/cookie are boilerplate.
- proof_type: none|logos|ratings|testimonials|certs|stats|case-study|mixed
- notable: short string — the one distinctive design move, or "" 
- signature_move: same as notable but only when quality_tier=A

Return ONLY the JSON object."""

SCHEMA_KEYS = ['site_type', 'page_type', 'section_type', 'speech_act',
               'composition', 'surface', 'density', 'disclosure',
               'nav_pattern', 'heading_form', 'mobile_evidence',
               'quality_tier', 'columns', 'cta_count', 'cta_rank_primary',
               'heading_body_ratio', 'whitespace_share', 'media_ratio',
               'media_type', 'serif_display', 'radius_personality',
               'cinematic', 'above_fold', 'blocks', 'proof_type', 'notable',
               'signature_move']


def call_vision_openai(img_path, hint):
    key = os.environ.get('OPENAI_API_KEY')
    if not key:
        raise RuntimeError('OPENAI_API_KEY not set')
    with open(img_path, 'rb') as f:
        b64 = base64.b64encode(f.read()).decode()
    ext = 'jpeg' if img_path.lower().endswith(('.jpg', '.jpeg')) else 'webp'
    if img_path.lower().endswith('.png'):
        ext = 'png'
    body = {
        'model': 'gpt-4o',
        'messages': [{'role': 'user', 'content': [
            {'type': 'text', 'text': PROMPT + hint},
            {'type': 'image_url',
             'image_url': {'url': f'data:image/{ext};base64,{b64}',
                           'detail': 'low'}}]}],
        'max_tokens': 1200,
        'temperature': 0,
    }
    req = urllib.request.Request(
        'https://api.openai.com/v1/chat/completions',
        data=json.dumps(body).encode(),
        headers={'Authorization': 'Bearer ' + key,
                 'Content-Type': 'application/json'})
    for attempt in range(5):
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                out = json.loads(r.read())
            txt = out['choices'][0]['message']['content'].strip()
            txt = txt.removeprefix('```json').removeprefix('```').strip()
            return json.loads(txt)
        except json.JSONDecodeError:
            if attempt == 4:
                raise
        except urllib.error.HTTPError as e:
            import time, random
            if e.code == 429:
                ra = e.headers.get('Retry-After')
                wait = float(ra) if ra else 20 * (attempt + 1) + random.random() * 5
                time.sleep(min(wait, 90))
                continue
            if e.code in (500, 502, 503) and attempt < 4:
                time.sleep(5 * (attempt + 1))
                continue
            raise
    return None


def call_vision_ollama(img_path, hint):
    """Local VLM via ollama /api/chat. Model: ANNOTATE_MODEL env or
    qwen3-vl:4b. No rate limits; slower per-image."""
    model = os.environ.get('ANNOTATE_MODEL', 'qwen3-vl:4b')
    with open(img_path, 'rb') as f:
        b64 = base64.b64encode(f.read()).decode()
    body = {
        'model': model, 'stream': False,
        'messages': [{'role': 'user', 'content': PROMPT + hint,
                      'images': [b64]}],
        'options': {'temperature': 0, 'num_predict': 1200},
        'format': 'json',
    }
    req = urllib.request.Request(
        'http://localhost:11434/api/chat',
        data=json.dumps(body).encode(),
        headers={'Content-Type': 'application/json'})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=300) as r:
                out = json.loads(r.read())
            txt = (out.get('message') or {}).get('content', '').strip()
            txt = txt.removeprefix('```json').removeprefix('```').strip()
            return json.loads(txt)
        except json.JSONDecodeError:
            if attempt == 2:
                raise
        except urllib.error.URLError as e:
            import time
            if attempt < 2:
                time.sleep(5)
                continue
            raise
    return None


ENGINE = os.environ.get('ANNOTATE_ENGINE', 'ollama')


def call_vision(img_path, site_hint=None, page_hint=None):
    hint = ''
    if site_hint or page_hint:
        hint = (f'\nHint from the search that found this: site_type may be '
                f'"{site_hint}", page_type may be "{page_hint}". '
                f'Correct it if the image disagrees.')
    if ENGINE == 'openai' and os.environ.get('OPENAI_API_KEY'):
        return call_vision_openai(img_path, hint)
    return call_vision_ollama(img_path, hint)


def annotate_one(rec):
    img, meta = rec['image'], rec
    try:
        ann = call_vision(img, meta.get('intended_site_type'),
                          meta.get('intended_page_type'))
        if not ann:
            return None
        out = {k: ann.get(k) for k in SCHEMA_KEYS}
        out.update({'image': meta['image'], 'mobbin_id': meta.get('mobbin_id'),
                    'mobbin_url': meta.get('mobbin_url'),
                    'site_name': meta.get('site_name'),
                    'cell_query': meta.get('cell_query'),
                    'source': meta.get('source', 'mobbin'),
                    'label': meta.get('label', 1)})
        return out
    except Exception as e:
        return {'image': img, 'error': str(e),
                'mobbin_id': meta.get('mobbin_id'),
                'cell_query': meta.get('cell_query')}


def mobbin_worklist(limit=None):
    work = []
    for qid in sorted(os.listdir(SCREENS)):
        qdir = os.path.join(SCREENS, qid)
        meta = os.path.join(qdir, f'{qid}.json')
        if not os.path.isfile(meta):
            continue
        for it in json.load(open(meta)):
            thumb = it.get('thumb')
            if not thumb:
                continue
            work.append({
                'image': os.path.join(DATA, thumb),
                'mobbin_id': it.get('id') or it.get('section_id'),
                'mobbin_url': it.get('mobbin_url'),
                'site_name': it.get('site_name') or it.get('app_name'),
                'cell_query': qid,
                'intended_site_type': it.get('intended_site_type'),
                'intended_page_type': it.get('intended_page_type'),
                'source': 'mobbin', 'label': 1})
    if limit:
        work = work[:limit]
    return work


def contrast_worklist(limit=None):
    work = []
    if not os.path.isdir(CONTRAST):
        return work
    for qdir in sorted(os.listdir(CONTRAST)):
        d = os.path.join(CONTRAST, qdir)
        meta = os.path.join(d, 'meta.json')
        if not os.path.isfile(meta):
            continue
        m = json.load(open(meta))
        for i, t in enumerate(m.get('tiles', [])):
            work.append({
                'image': os.path.join(d, t),
                'mobbin_id': f'neg-{qdir}-t{i}',
                'mobbin_url': m.get('url'),
                'site_name': m.get('domain'),
                'cell_query': f'neg-{m.get("site_type","other")}',
                'intended_site_type': m.get('site_type'),
                'intended_page_type': m.get('page_type'),
                'source': 'negative', 'label': 0,
                'tile_index': i})
    if limit:
        work = work[:limit]
    return work


def run(work, out_path, workers=8):
    done = set()
    if os.path.exists(out_path):
        for line in open(out_path):
            try:
                r = json.loads(line)
                if not r.get('error'):
                    done.add(r.get('image'))
            except Exception:
                pass
    todo = [w for w in work if w['image'] not in done]
    print(f'{len(done)} done, {len(todo)} to annotate', flush=True)
    n_ok = n_err = 0
    with open(out_path, 'a') as f, \
         ThreadPoolExecutor(max_workers=workers) as ex:
        futs = {ex.submit(annotate_one, w): w for w in todo}
        for fut in as_completed(futs):
            r = fut.result()
            if r is None:
                continue
            f.write(json.dumps(r) + '\n')
            f.flush()
            if r.get('error'):
                n_err += 1
            else:
                n_ok += 1
            if (n_ok + n_err) % 25 == 0:
                print(f'  {n_ok} ok / {n_err} err', flush=True)
    print(f'done: {n_ok} ok / {n_err} err', flush=True)


def main():
    args = sys.argv[1:]
    if not args or args[0] == 'stats':
        for name in ('annotations', 'annotations_contrast'):
            p = os.path.join(DATA, f'{name}.jsonl')
            if os.path.exists(p):
                lines = open(p).read().strip().split('\n')
                ok = sum(1 for l in lines if '"error"' not in l)
                print(f'{name}: {len(lines)} records, {ok} ok')
        return
    mode = args[0]
    limit = workers = None
    if '--limit' in args:
        limit = int(args[args.index('--limit') + 1])
    if '--workers' in args:
        workers = int(args[args.index('--workers') + 1])
    workers = workers or 8
    if mode == 'mobbin':
        run(mobbin_worklist(limit),
            os.path.join(DATA, 'annotations.jsonl'), workers)
    elif mode == 'contrast':
        run(contrast_worklist(limit),
            os.path.join(DATA, 'annotations_contrast.jsonl'), workers)
    else:
        print(__doc__)


if __name__ == '__main__':
    main()
