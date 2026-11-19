#!/usr/bin/env python3
"""Site-level STRUCTURE + VIBE layer over the section primitive.

STRUCTURE (mechanical, free): ordered section_type sequence from
meta.sections → meta['structure'] + meta['structure_hash'].
VIBE (gemini-2.5-flash-lite, 20 workers): one call per site tile-00 →
{style, mood, palette_family, whitespace_band, type_personality,
confidence} → meta['vibe'] + meta['vibe_method'].

  python3 structure_vibe.py structure     # pass 1 only (free)
  python3 structure_vibe.py vibe [--limit N]
"""
import base64
import glob
import hashlib
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
OPS = os.path.join(DATA, 'operator')
MODEL = 'google/gemini-2.5-flash-lite'
URL = 'https://openrouter.ai/api/v1/chat/completions'
KEY_FILE = os.path.normpath(os.path.join(
    HERE, '..', '..', '..', '..', '..', '..', 'SECRETS', 'OR-API.txt'))

VIBE_PROMPT = """Look at this full web page tile. Reply with ONLY a JSON object:
{"style": zero or more of [minimal, editorial, luxury, playful, technical, brutalist, retro, corporate, artisanal, futuristic, organic, geometric, swiss, magazine, neo-brutalist, bento, glassmorphism, skeuomorphic, maximalist, avant-garde, traditional, japanese, scandinavian, memphis, y2k, grunge, deco, colonial, botanical, cosmic, western, industrial, rustic, gothic, cyber, vaporwave],
 "mood": zero or more of [calm, warm, moody, energetic, solemn, confident, playful, dramatic, serene, bold, clinical, cozy, edgy, mysterious, joyful, luxurious, aggressive, contemplative, rebellious, reassuring],
 "tone": one of [light, dark, mixed, high-contrast, inverted-sections],
 "palette_family": zero or more of [warm, cool, neutral, monochrome, pastel, earth, neon, jewel, muted, duotone, grayscale, sepia, vivid-multi, accent-on-neutral],
 "whitespace_band": one of [tight, balanced, airy, extreme-airy, extreme-tight],
 "type_personality": one of [serif-led, sans-led, display-heavy, mono-touch, humanist-sans, geometric-sans, neo-grotesque, slab-serif, script-accent, mixed-serif-sans, condensed-headline, variable-font, stencil],
 "formality": one of [playful, casual, professional, strict, luxurious, ceremonial, academic, streetwear],
 "ornament_density": one of [bare, subtle, moderate, heavy, layered-maximal],
 "ornament_kind": zero or more of [grain, noise, gradient-mesh, lines, grid-pattern, dots, duotone-media, borders, shadows-hard, shadows-soft, glow, blur-glass, texture-photo, illustration-overlays, stickers, badges, 3d-elements, chrome-effects],
 "imagery_type": zero or more of [photograph, photograph-people, photograph-product, illustration, 3d-render, vector-icon, typography-only, video-frames, ai-generated, map, data-viz, mockup-device, collage, screenshot],
 "grid_discipline": one of [strict-baseline, strict-column, asymmetric, broken-grid, overlap-layered, single-column, modular],
 "motion_feel": one of [static, subtle-hover, animated-accents, kinetic, scroll-driven, parallax-feel],
 "layout_rhythm": one of [regular, alternating-splits, hero-heavy, dense-scroll, z-pattern, modular-blocks, editorial-flow],
 "nav_style": one of [fixed-thin, fixed-solid, centered-logo, left-logo-heavy, minimal, mega-menu, sidebar, none-single-page],
 "cta_voice": one of [command, soft-invite, consultative, urgent, luxury-understated],
 "confidence": 0..1,
 "evidence": "comma-separated visual cues justifying the labels"}
Judge visual treatment, not content. Unknown -> "other" + low
confidence; never invent labels."""


def api_key():
    k = os.environ.get('OPENROUTER_API_KEY', '').strip()
    return k or open(KEY_FILE).read().strip()


def img_block(path):
    b64 = base64.b64encode(open(path, 'rb').read()).decode()
    return {'type': 'image_url',
            'image_url': {'url': f'data:image/jpeg;base64,{b64}'}}


def metas():
    for f in sorted(glob.glob(os.path.join(OPS, '*/meta.json'))):
        if '_sources' in f:
            continue
        yield f


def pass_structure():
    n = 0
    seq_lens = Counter()
    for f in metas():
        try:
            m = json.load(open(f))
        except Exception:
            continue
        seq = [s.get('section_type') or 'other'
               for s in (m.get('sections') or [])]
        if not seq:
            continue
        m['structure'] = seq
        m['structure_hash'] = hashlib.sha256(
            json.dumps(seq).encode()).hexdigest()[:10]
        json.dump(m, open(f, 'w'), indent=1)
        n += 1
        seq_lens[len(seq)] += 1
    print(f'{n} sites structured; seq-len dist: '
          f'{seq_lens.most_common(8)}')


def vibe_call(tile):
    body = json.dumps({
        'model': MODEL,
        'messages': [{'role': 'user', 'content':
                      [{'type': 'text', 'text': VIBE_PROMPT},
                       img_block(tile)]}],
        'max_tokens': 140, 'temperature': 0}).encode()
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


def pass_vibe(limit):
    jobs = []
    for f in metas():
        try:
            m = json.load(open(f))
        except Exception:
            continue
        v = m.get('vibe') or {}
        # canonical schema v3: older rows lack the full fieldset
        if m.get('vibe_method') == MODEL and 'nav_style' in v \
                and 'ornament_kind' in v and 'grid_discipline' in v:
            continue
        d = os.path.dirname(f)
        tiles = m.get('tiles') or []
        tp = None
        for t in tiles:
            cand = os.path.join(d, t if isinstance(t, str)
                                else t.get('file', ''))
            if os.path.exists(cand):
                tp = cand
                break
        if not tp:
            # fall back to first section crop
            for s in m.get('sections') or []:
                cand = os.path.join(d, s.get('file') or '')
                if os.path.exists(cand):
                    tp = cand
                    break
        if tp:
            jobs.append((f, m, tp))
        if len(jobs) >= limit:
            break
    print(f'{len(jobs)} sites to vibe via {MODEL}', flush=True)
    done = errs = 0
    with ThreadPoolExecutor(max_workers=20) as pool:
        futs = {pool.submit(vibe_call, tp): (f, m)
                for f, m, tp in jobs}
        for fut in as_completed(futs):
            f, m = futs[fut]
            res, err = fut.result()
            done += 1
            if res is None:
                errs += 1
                if errs < 6:
                    print(f'  ERR {f}: {err}', flush=True)
                continue
            m['vibe'] = res
            m['vibe_method'] = MODEL
            json.dump(m, open(f, 'w'), indent=1)
            if done % 100 == 0:
                print(f'  {done}/{len(jobs)}', flush=True)
    styles = Counter()
    for f in metas():
        try:
            m = json.load(open(f))
        except Exception:
            continue
        v = m.get('vibe')
        if v:
            styles[v.get('style')] += 1
    print(f'DONE {done} vibed, {errs} errs. '
          f'corpus style dist: {styles.most_common()}')


def main():
    args = sys.argv[1:]
    if not args or 'structure' in args:
        pass_structure()
    if 'vibe' in args:
        lim = int(args[args.index('--limit') + 1]) \
            if '--limit' in args else 10**9
        pass_vibe(lim)


if __name__ == '__main__':
    main()
