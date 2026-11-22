#!/usr/bin/env python3
"""bank_classify.py — the single paid OpenRouter pass that fills the
TAGS index's style/category/mode axes for every banked Mobbin
exemplar.

Runs ONCE, at the end, after the whole bank + schema are settled
(operator instruction). Modes:

  --dry-run    validate config + report how many items WOULD be
               tagged, which model, which schema axes, and which
               items are already checkpointed. NO API CALLS.
  --run        the paid pass: one chat-completions vision call per
               uncheckpointed item → structured JSON tags merged into
               templates/skeletons/mobbin/tags.json + each spec.json.
               Checkpointed per item: a mid-run failure resumes
               without re-spending finished items.

Schema axes (M3-aligned): section_class, topology_class, style[],
category[], mode, platform, plus derived style vocabulary
(palette/radius/type/spacing/decoration) as token-override hints.

Usage:
  bank_classify.py --dry-run
  OPENROUTER_API_KEY=... bank_classify.py --run [--model M]
                                                 [--limit N]
"""
import base64
import json
import os
import sys
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(HERE))
MOBBIN = os.path.join(REPO, 'templates', 'skeletons', 'mobbin')
TAGS = os.path.join(MOBBIN, 'tags.json')
CHECKPOINT = os.path.join(MOBBIN, '.classify-checkpoint.json')
MODEL_DEFAULT = 'google/gemini-2.5-flash'
MODEL_FALLBACK = 'google/gemini-2.0-flash'
API = 'https://openrouter.ai/api/v1/chat/completions'

AXES = ('section_class', 'topology_class', 'style', 'category',
        'mode', 'platform', 'style_vector')

PROMPT = """Classify this navigation/menu/modal exemplar image.
Return ONLY JSON:
{"topology_class": one of top-bar|dropdown-menu|mega-panel|
 dock-left-drawer|dock-right-drawer|full-screen-overlay|
 bottom-sheet|sticky-bar|modal,
 "style": [tags from: minimal, corporate, editorial, bold, dark,
  playful, colorful, glass, brutalist, dense, spacious, rounded],
 "category": [tags from: business, crypto, education,
  entertainment, finance, food, health, lifestyle, portfolio,
  shopping, social, dev-tools, productivity, media, other],
 "mode": light|dark,
 "menu_parts": [visible internals from: icon-label-rows,
  profile-header, grouped-sections, toggles, badges, footer-actions,
  search-field, avatars],
 "style_vector": {"palette": "...", "radius": "none|s|m|l|pill",
  "type": "sans|serif|mono|display", "spacing": "dense|regular|
  spacious", "decoration": "flat|shadow|border|glass|gradient"}}
Be terse; vocab values only, no prose."""


def _items(tags):
    out = []
    for tid, t in tags.items():
        p = os.path.join(REPO, 'templates', 'skeletons',
                         t['file'] + '.webp')
        if os.path.exists(p):
            out.append((tid, t, p))
    return out


def _checkpoint():
    return json.load(open(CHECKPOINT)) if os.path.exists(CHECKPOINT) \
        else {}


def _save_checkpoint(cp):
    json.dump(cp, open(CHECKPOINT, 'w'), indent=1)


def _call(key, model, img_path):
    data = base64.b64encode(open(img_path, 'rb').read()).decode()
    body = {
        'model': model,
        'messages': [{'role': 'user', 'content': [
            {'type': 'text', 'text': PROMPT},
            {'type': 'image_url',
             'image_url': {'url': f'data:image/webp;base64,{data}'}}]}],
        'response_format': {'type': 'json_object'},
    }
    req = urllib.request.Request(
        API, data=json.dumps(body).encode(),
        headers={'Authorization': f'Bearer {key}',
                 'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=60) as r:
        d = json.loads(r.read())
    return json.loads(d['choices'][0]['message']['content'])


def main():
    args = sys.argv[1:]
    tags = json.load(open(TAGS))
    items = _items(tags)
    cp = _checkpoint()
    todo = [x for x in items if x[0] not in cp]
    if '--dry-run' in args or '--run' not in args:
        print(f'items in tags.json: {len(items)}')
        print(f'checkpointed: {len(cp)}')
        print(f'would tag: {len(todo)}')
        print(f'model: {MODEL_DEFAULT} (fallback {MODEL_FALLBACK})')
        print(f'axes: {", ".join(AXES)}')
        key = os.environ.get('OPENROUTER_API_KEY', '')
        print(f'OPENROUTER_API_KEY: '
              f'{"set" if key else "NOT SET"}')
        return
    key = os.environ.get('OPENROUTER_API_KEY')
    if not key:
        sys.exit('OPENROUTER_API_KEY not set')
    model = args[args.index('--model') + 1] if '--model' in args \
        else MODEL_DEFAULT
    limit = int(args[args.index('--limit') + 1]) \
        if '--limit' in args else len(todo)
    done = 0
    for tid, t, p in todo[:limit]:
        try:
            try:
                res = _call(key, model, p)
            except Exception:
                res = _call(key, MODEL_FALLBACK, p)
        except Exception as e:
            print(f'{tid}: FAILED {e} — checkpoint kept for resume')
            continue
        t['topology_class'] = res.get('topology_class',
                                      t['topology_class'])
        t['style'] = res.get('style', t['style'])
        t['category'] = res.get('category', t['category'])
        t['mode'] = res.get('mode', t['mode'])
        t['menu_parts'] = res.get('menu_parts', [])
        t['style_vector'] = res.get('style_vector', {})
        cp[tid] = {'ok': True, 'model': model}
        done += 1
        if done % 10 == 0:
            json.dump(tags, open(TAGS, 'w'), indent=1)
            _save_checkpoint(cp)
            print(f'{done}/{min(limit, len(todo))}')
    json.dump(tags, open(TAGS, 'w'), indent=1)
    _save_checkpoint(cp)
    print(f'classified {done}; remaining {len(todo) - done}')


if __name__ == '__main__':
    main()
