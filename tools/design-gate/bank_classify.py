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
    if '--test' in args:
        return  # handled by test_run() below
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


# -------------------------------------------------------------------
# --test mode — two-model classifier experiment (24 exemplars, lite
# vs flash). Writes tools/design-gate/classify_test/*.json + REPORT.
# -------------------------------------------------------------------

TEST_DIR = os.path.join(HERE, 'classify_test')
GENMENU = os.path.join(REPO, 'templates', 'skeletons', 'genmenu')
PREVIEW_CSS = os.path.join(GENMENU, 'bank-preview.css')
MODEL_LITE = 'google/gemini-2.5-flash-lite'
MODEL_FLASH = 'google/gemini-2.5-flash'
MODELS_URL = 'https://openrouter.ai/api/v1/models'

# Full working axis set for the test: the 24 GENES axes (vocab from
# genome.py) + the ~57 new axes the operator named, each with
# candidate alleles ("*" = free short snake-case label).
NEW_AXES = {
 'colour-scheme': ['light', 'dark', 'mixed'],
 'colour-temperature': ['neutral', 'warm', 'cool'],
 'saturation': ['muted', 'medium', 'vivid'],
 'accent-hue-family': ['blue', 'green', 'red', 'orange', 'yellow',
                       'purple', 'pink', 'neutral', 'multi'],
 'surface-tone': ['white', 'off-white', 'grey', 'tinted', 'dark'],
 'contrast-level': ['low', 'medium', 'high'],
 'gradient-use': ['none', 'subtle', 'feature', 'dominant'],
 'margin-generosity': ['tight', 'regular', 'generous', 'airy'],
 'card-padding': ['compact', 'regular', 'spacious'],
 'section-gap-rhythm': ['uniform', 'alternating', 'progressive'],
 'content-measure': ['narrow', 'medium', 'wide', 'full-bleed'],
 'alignment-grammar': ['left-grid', 'centered', 'mixed',
                       'asymmetric'],
 'type-mood': ['neo-grotesque', 'geometric', 'humanist',
               'serif-editorial', 'mono-technical', 'display'],
 'case-style': ['sentence', 'title', 'upper', 'mixed'],
 'letter-spacing': ['normal', 'tight', 'wide'],
 'weight-contrast': ['low', 'medium', 'high'],
 'text-scale-drama': ['subtle', 'moderate', 'extreme'],
 'border-treatment': ['none', 'hairline', 'prominent', 'double'],
 'elevation-style': ['flat', 'soft-shadow', 'hard-shadow',
                     'layered', 'glow'],
 'surface-texture': ['solid', 'gradient', 'glass', 'pattern',
                     'image'],
 'container-style': ['cards', 'bands', 'panels', 'frameless',
                     'bordered'],
 'divider-language': ['lines', 'spacing', 'ornament', 'none'],
 'image-framing': ['full-bleed', 'card-contained', 'masked',
                   'arched', 'cropped', 'none'],
 'icon-language': ['none', 'line', 'solid', 'duotone', 'emoji',
                   '3d'],
 'fx-classes-present': ['*multi'],
 'hover-behavior': ['none', 'subtle', 'lift', 'scale', 'color'],
 'transition-tempo': ['instant', 'fast', 'eased', 'slow'],
 'vibe-primary': ['professional', 'playful', 'premium', 'bold',
                  'technical', 'warm', 'editorial', 'minimal'],
 'brand-weight': ['generic', 'moderate', 'strong'],
 'copy-tone': ['formal', 'conversational', 'technical', 'marketing',
               'poetic'],
 'header-style': ['bar', 'split', 'centered', 'overlay', 'none'],
 'footer-style': ['simple', 'columns', 'mega', 'none'],
 'sticky-elements': ['none', 'header', 'cta', 'nav'],
 'overlay-language': ['modal', 'drawer', 'toast', 'none'],
 'breadcrumb-presence': ['yes', 'no'],
 'button-style': ['filled', 'outline', 'ghost', 'pill', 'mixed'],
 'button-size-presence': ['small', 'medium', 'large', 'mixed'],
 'input-style': ['boxed', 'underline', 'filled', 'none'],
 'control-density': ['sparse', 'regular', 'dense'],
 'ornament-level': ['none', 'minimal', 'moderate', 'heavy'],
 'badge-chip-usage': ['none', 'few', 'many'],
 'illustration-detail': ['none', 'simple', 'detailed'],
 '3d-depth': ['flat', 'subtle', 'prominent'],
 'symmetry': ['symmetric', 'asymmetric', 'mixed'],
 'visual-hierarchy-strength': ['weak', 'clear', 'strong'],
 'scroll-experience': ['static', 'snap', 'parallax', 'immersive'],
 'card-shape-variety': ['uniform', 'varied', 'none'],
 'polish-level': ['rough', 'production', 'polished'],
 'copy-density': ['sparse', 'balanced', 'dense'],
 'data-heaviness': ['none', 'light', 'moderate', 'heavy'],
 'social-proof-density': ['none', 'light', 'moderate', 'heavy'],
 'personalization-feel': ['generic', 'tailored', 'immersive'],
 'domain-vertical': ['saas', 'ecommerce', 'editorial', 'portfolio',
                     'agency', 'fintech', 'health', 'education',
                     'gaming', 'nonprofit', 'dev-tools', 'other'],
 'audience': ['consumer', 'b2b', 'developer', 'internal', 'mixed'],
 'device-feel': ['desktop', 'mobile-first', 'responsive'],
 'era-signature': ['retro', 'current-2025', 'emerging', 'timeless'],
}


def _axis_spec():
    spec = dict(NEW_AXES)
    try:
        import genome
        for name, vocab in genome.GENES:
            spec.setdefault(name, list(vocab))
    except Exception:
        pass
    return spec


def _test_prompt(spec):
    lines = []
    for name, vocab in spec.items():
        if vocab == ['*multi']:
            lines.append(f'"{name}": {{"alleles": [labels]}} '
                         f'(multi-tag)')
        else:
            lines.append(f'"{name}": {{"allele": one of '
                         f'{"|".join(vocab)}, "confidence": 0-1}}')
    return (
        'Classify this web-design exemplar (screenshot + markup). '
        'Return ONE JSON object, every key present, vocab values '
        'only, no prose:\n{\n' + ',\n'.join(lines) + '\n}')


def _render(fragment_path, out_png, pw):
    """Wrap a genmenu fragment in the bank preview page + shot."""
    frag = open(fragment_path).read()
    css = open(PREVIEW_CSS).read()
    html = ('<!doctype html><meta charset=utf-8><style>' + css +
            '</style><body style="margin:0">' + frag + '</body>')
    pg = pw.new_page(viewport={'width': 1280, 'height': 1100})
    pg.set_content(html, wait_until='load')
    pg.wait_for_timeout(400)
    pg.screenshot(path=out_png)
    pg.close()
    return out_png


def _test_call(key, model, img_path, mime, struct_text, prompt):
    data = base64.b64encode(open(img_path, 'rb').read()).decode()
    body = {
        'model': model,
        'messages': [{'role': 'user', 'content': [
            {'type': 'text',
             'text': prompt + '\n\nSTRUCTURE:\n' +
             struct_text[:3000]},
            {'type': 'image_url', 'image_url':
             {'url': f'data:{mime};base64,{data}'}}]}],
        'response_format': {'type': 'json_object'},
        'max_tokens': 4000,
    }
    req = urllib.request.Request(
        API, data=json.dumps(body).encode(),
        headers={'Authorization': f'Bearer {key}',
                 'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=90) as r:
        return json.loads(r.read())


def _test_items():
    """~24 exemplars: mixed genmenu families + mobbin site pages."""
    pick_g = [
        'auth-form', 'footer-mega', 'pricing-tiers', 'hero-split',
        'hero-centered', 'card-block', 'data-table', 'checkout',
        'empty-state', 'comparison-table', 'deco-quote', 'data-grid',
        'bg-gradient', 'nav-mega-panel', 'modal-dialog',
        'product-page', 'ui-badge', 'fx-reveal',
    ]
    pick_m = ['site-landing', 'site-dashboard', 'site-pricing',
              'site-article', 'site-checkout', 'site-portfolio']
    out = []
    for fam in pick_g:
        d = os.path.join(GENMENU, fam)
        if not os.path.isdir(d):
            continue
        f = sorted(x for x in os.listdir(d)
                   if x.endswith('.html'))[:1]
        if f:
            out.append({'id': 'gm-' + fam + '-' + f[0][:-5],
                        'kind': 'genmenu',
                        'path': os.path.join(d, f[0])})
    for fam in pick_m:
        d = os.path.join(MOBBIN, fam)
        if os.path.isdir(d):
            f = sorted(x for x in os.listdir(d)
                       if x.endswith('.webp'))[:1]
            if f:
                out.append({'id': 'mb-' + fam + '-' + f[0][:-5],
                            'kind': 'mobbin',
                            'path': os.path.join(d, f[0])})
    return out


def _prices(key):
    try:
        req = urllib.request.Request(
            MODELS_URL,
            headers={'Authorization': f'Bearer {key}'})
        with urllib.request.urlopen(req, timeout=30) as r:
            for m in json.loads(r.read())['data']:
                if m['id'] in (MODEL_LITE, MODEL_FLASH):
                    yield m['id'], m.get('pricing', {})
    except Exception:
        return


def _agreement(run):
    per_axis = {}
    ids = {v['id'] for v in run.values()}
    for i in ids:
        a = run.get(i + '|' + MODEL_LITE, {}).get('labels', {})
        b = run.get(i + '|' + MODEL_FLASH, {}).get('labels', {})
        for ax in set(a) | set(b):
            va = a.get(ax, {}).get('allele') or \
                tuple(a.get(ax, {}).get('alleles', []))
            vb = b.get(ax, {}).get('allele') or \
                tuple(b.get(ax, {}).get('alleles', []))
            if isinstance(va, list):
                va = tuple(sorted(va))
            if isinstance(vb, list):
                vb = tuple(sorted(vb))
            st = per_axis.setdefault(ax, {'agree': 0, 'dis': []})
            if va == vb:
                st['agree'] += 1
            else:
                st['dis'].append(
                    (i.split('-', 1)[-1][:18], va, vb))
    return per_axis


def test_run():
    key = os.environ.get('OPENROUTER_API_KEY')
    if not key:
        sys.exit('OPENROUTER_API_KEY not set')
    os.makedirs(TEST_DIR, exist_ok=True)
    os.makedirs(os.path.join(TEST_DIR, 'shots'), exist_ok=True)
    spec = _axis_spec()
    prompt = _test_prompt(spec)
    items = _test_items()
    print(f'{len(items)} exemplars x 2 models, {len(spec)} axes')
    from playwright.sync_api import sync_playwright
    pw_ctx = sync_playwright().start()
    pw = pw_ctx.chromium.launch()
    run = {}
    usage = {m: {'in': 0, 'out': 0, 'calls': 0}
             for m in (MODEL_LITE, MODEL_FLASH)}
    for it in items:
        if it['kind'] == 'genmenu':
            png = os.path.join(
                TEST_DIR, 'shots', it['id'] + '.png')
            _render(it['path'], png, pw)
            img, mime = png, 'image/png'
            struct = open(it['path']).read()
        else:
            img, mime = it['path'], 'image/webp'
            sp = it['path'].replace('.webp', '.topo.json')
            struct = open(sp).read() if os.path.exists(sp) else ''
        for model in (MODEL_LITE, MODEL_FLASH):
            fp = os.path.join(
                TEST_DIR,
                it['id'] + '.' + model.split('/')[-1] + '.json')
            if os.path.exists(fp):
                res = json.load(open(fp))
                run[it['id'] + '|' + model] = res
                usage[model]['in'] += res['usage']['in']
                usage[model]['out'] += res['usage']['out']
                usage[model]['calls'] += 1
                continue
            try:
                d = _test_call(key, model, img, mime, struct,
                               prompt)
                labels = json.loads(
                    d['choices'][0]['message']['content'])
            except Exception as e:
                labels = {'_error': str(e)}
                d = {'usage': {}}
            u = d.get('usage') or {}
            res = {'id': it['id'], 'kind': it['kind'],
                   'model': model, 'labels': labels,
                   'usage': {'in': u.get('prompt_tokens', 0),
                             'out': u.get('completion_tokens', 0)}}
            run[it['id'] + '|' + model] = res
            json.dump(res, open(fp, 'w'), indent=1)
            usage[model]['in'] += res['usage']['in']
            usage[model]['out'] += res['usage']['out']
            usage[model]['calls'] += 1
            print(f"{it['id']} {model.split('/')[-1]} "
                  f"in={res['usage']['in']} out={res['usage']['out']}"
                  + ('' if '_error' not in labels
                     else ' ERROR'))
    pw.close()
    pw_ctx.stop()
    prices = dict(_prices(key))
    cost = {}
    for m, u in usage.items():
        p = prices.get(m, {})
        cost[m] = round(
            u['in'] * float(p.get('prompt', 0) or 0) +
            u['out'] * float(p.get('completion', 0) or 0), 4)
    agree = _agreement(run)
    out = {
        'axes': sorted(spec), 'prices': prices, 'usage': usage,
        'cost_usd': cost,
        'per_axis_agreement': {
            k: {'agree': v['agree'], 'of': len(items),
                'disagree_examples': v['dis'][:5]}
            for k, v in sorted(agree.items())},
    }
    json.dump(out, open(os.path.join(TEST_DIR, 'RUN.json'), 'w'),
              indent=1)
    n = sum(1 for v in run.values() if '_error' in v['labels'])
    print(f"done: {usage[MODEL_LITE]['calls']}+{usage[MODEL_FLASH]['calls']} calls, "
          f"{n} errors, cost lite=${cost.get(MODEL_LITE)} "
          f"flash=${cost.get(MODEL_FLASH)}")


if '--test' in sys.argv:
    test_run()


# -------------------------------------------------------------------
# --test2 mode — FREE model lanes + embedding/rerank retrieval probes.
# Decisions API (pplx-decider-*:free), free vision chat models, and
# nvidia nemotron embed/rerank. Falls back to paid gemini per the
# operator's fallback directive; every fallback is logged.
# -------------------------------------------------------------------
DECIDER_FLASH = 'perplexity/pplx-decider-flash-v1.3:free'
DECIDER = 'perplexity/pplx-decider-v1.3:free'
FREE_VISION = ['google/gemma-4-31b-it:free',
               'nvidia/nemotron-3.5-super-vl:free',
               'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free']
EMBED_MODEL = 'nvidia/nemotron-3.5-embed-8b:free'
EMBED_FALLBACK = 'nvidia/nemotron-3.5-embed-1b:free'
RERANK_MODEL = 'nvidia/nemotron-3.5-rerank-8b:free'
DECISIONS_API = 'https://openrouter.ai/api/alpha/decisions'
EMBED_API = 'https://openrouter.ai/api/v1/embeddings'
RERANK_API = 'https://openrouter.ai/api/v1/rerank'
CREDITS_API = 'https://openrouter.ai/api/v1/credits'
PAID_FALLBACK = MODEL_LITE  # gemini-2.5-flash-lite per operator order

FALLBACKS = []  # logged {lane_model, reason, count, fell_back_to}


def _credits(key):
    try:
        req = urllib.request.Request(
            CREDITS_API, headers={'Authorization': f'Bearer {key}'})
        with urllib.request.urlopen(req, timeout=20) as r:
            d = json.loads(r.read())['data']
        return round(d['total_credits'] - d['total_usage'], 2)
    except Exception:
        return None


def _post(key, url, body, timeout=120):
    req = urllib.request.Request(
        url, data=json.dumps(body).encode(),
        headers={'Authorization': f'Bearer {key}',
                 'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read())


def _questions(spec):
    q = {}
    for name, vocab in spec.items():
        if name == 'fx-classes-present':
            vocab = ['none', 'animate', 'transition', 'hover-fx',
                     'mixed']
        q[name] = {
            'type': 'choice',
            'instructions':
                f'Pick the value of the design axis "{name}".',
            'criteria': {v: v.replace('-', ' ') for v in vocab}}
    return q


def _decider_call(key, model, img_b64, mime, struct_text, spec):
    body = {
        'model': model,
        'state': {
            'text': 'Web-design exemplar markup:\n' +
                    struct_text[:2500],
            'image_url': f'data:{mime};base64,{img_b64}'},
        'questions': _questions(spec)}
    return _post(key, DECISIONS_API, body)


def _decider_labels(answers):
    out = {}
    for ax, a in answers.items():
        if a.get('type') == 'choice':
            out[ax] = {'allele': a['choice'],
                       'confidence': round(a.get('confidence', 0), 3),
                       'p': {k: round(v, 3) for k, v in
                             a.get('probabilities', {}).items()}}
    return out


def _png_b64(path):
    """Any image → PNG bytes b64 (webp rejected upstream)."""
    from PIL import Image
    import io
    im = Image.open(path).convert('RGB')
    buf = io.BytesIO()
    im.save(buf, 'PNG')
    return base64.b64encode(buf.getvalue()).decode()


def test_run2():
    key = os.environ.get('OPENROUTER_API_KEY')
    if not key:
        sys.exit('OPENROUTER_API_KEY not set')
    os.makedirs(TEST_DIR, exist_ok=True)
    os.makedirs(os.path.join(TEST_DIR, 'shots'), exist_ok=True)
    spec = _axis_spec()
    prompt = _test_prompt(spec)
    items = _test_items()
    bal = _credits(key)
    print(f'balance: ${bal}')
    FALLBACKS.clear()

    # prep images once: genmenu → playwright PNG; mobbin → PIL PNG
    imgs = {}
    from playwright.sync_api import sync_playwright
    pw_ctx = sync_playwright().start()
    pw = pw_ctx.chromium.launch()
    for it in items:
        png = os.path.join(TEST_DIR, 'shots', it['id'] + '.png')
        if it['kind'] == 'genmenu' and not os.path.exists(png):
            _render(it['path'], png, pw)
        elif it['kind'] == 'mobbin':
            if not os.path.exists(png):
                open(png, 'wb').write(
                    base64.b64decode(_png_b64(it['path'])))
        imgs[it['id']] = png
    pw.close()
    pw_ctx.stop()

    def chat_lane(model):
        paid = False
        for it in items:
            fp = os.path.join(
                TEST_DIR, it['id'] + '.' +
                model.split('/')[-1].replace(':', '_') + '.json')
            if os.path.exists(fp):
                continue
            struct = open(it['path'], 'rb').read().decode(
                'utf-8', 'replace') if it['kind'] == 'genmenu' else \
                open(it['path'].replace('.webp', '.topo.json')
                     ).read() if os.path.exists(
                    it['path'].replace('.webp', '.topo.json')) else ''
            try:
                d = _test_call(key, model, imgs[it['id']],
                               'image/png', struct, prompt)
                labels = json.loads(
                    d['choices'][0]['message']['content'])
                u = d.get('usage') or {}
            except Exception as e:
                err = str(e)
                FALLBACKS.append({
                    'lane_model': model, 'reason': err[:120],
                    'count': 1, 'fell_back_to': PAID_FALLBACK})
                paid = True
                try:
                    d = _test_call(key, PAID_FALLBACK, imgs[it['id']],
                                   'image/png', struct, prompt)
                    labels = json.loads(
                        d['choices'][0]['message']['content'])
                    u = d.get('usage') or {}
                except Exception as e2:
                    labels, u = {'_error': str(e2)}, {}
            res = {'id': it['id'], 'kind': it['kind'],
                   'model': model,
                   'labels': labels,
                   'via_fallback': paid,
                   'usage': {'in': u.get('prompt_tokens', 0),
                             'out': u.get('completion_tokens', 0)}}
            json.dump(res, open(fp, 'w'), indent=1)
            print('chat', it['id'], model.split('/')[-1],
                  'fallback' if paid else 'ok')

    def decider_lane(model):
        for it in items:
            fp = os.path.join(
                TEST_DIR, it['id'] + '.' +
                model.split('/')[-1].replace(':', '_') + '.json')
            if os.path.exists(fp):
                continue
            struct = open(it['path'], 'rb').read().decode(
                'utf-8', 'replace') if it['kind'] == 'genmenu' else \
                open(it['path'].replace('.webp', '.topo.json')
                     ).read() if os.path.exists(
                    it['path'].replace('.webp', '.topo.json')) else ''
            b64 = base64.b64encode(
                open(imgs[it['id']], 'rb').read()).decode()
            try:
                d = _decider_call(key, model, b64, 'image/png',
                                  struct, spec)
                labels = _decider_labels(d.get('answers', {}))
                u = d.get('usage') or {}
            except Exception as e:
                FALLBACKS.append({
                    'lane_model': model, 'reason': str(e)[:120],
                    'count': 1, 'fell_back_to': PAID_FALLBACK})
                try:
                    d = _test_call(key, PAID_FALLBACK,
                                   imgs[it['id']], 'image/png',
                                   struct, prompt)
                    labels = json.loads(
                        d['choices'][0]['message']['content'])
                    u = d.get('usage') or {}
                except Exception as e2:
                    labels, u = {'_error': str(e2)}, {}
            res = {'id': it['id'], 'kind': it['kind'],
                   'model': model, 'labels': labels,
                   'usage': {'in': u.get('input_tokens',
                                         u.get('prompt_tokens', 0)),
                             'out': u.get('output_tokens',
                                          u.get('completion_tokens',
                                                0))}}
            json.dump(res, open(fp, 'w'), indent=1)
            print('decider', it['id'], model.split('/')[-1])

    decider_lane(DECIDER_FLASH)
    decider_lane(DECIDER)
    for m in FREE_VISION:
        b = _credits(key)
        if b is not None and b < 0.5:
            print('BUDGET STOP: balance', b)
            break
        chat_lane(m)

    json.dump(FALLBACKS,
              open(os.path.join(TEST_DIR, 'FALLBACKS.json'), 'w'),
              indent=1)
    print('balance end:', _credits(key),
          '| fallbacks:', len(FALLBACKS))


def test_embed():
    """Embedding NN probe + rerank stage-2 on ~10 exemplars."""
    key = os.environ.get('OPENROUTER_API_KEY')
    if not key:
        sys.exit('OPENROUTER_API_KEY not set')
    import math
    from playwright.sync_api import sync_playwright
    items = _test_items()[:10]
    queries = _test_items()[10:12]
    pw_ctx = sync_playwright().start()
    pw = pw_ctx.chromium.launch()

    def png_for(it):
        p = os.path.join(TEST_DIR, 'shots', it['id'] + '.png')
        if it['kind'] == 'genmenu' and not os.path.exists(p):
            _render(it['path'], p, pw)
        elif it['kind'] == 'mobbin' and not os.path.exists(p):
            open(p, 'wb').write(
                base64.b64decode(_png_b64(it['path'])))
        return p
    pw.close()
    pw_ctx.stop()
    # need browser before png_for — render first, then embed
    pw_ctx = sync_playwright().start()
    pw = pw_ctx.chromium.launch()
    bank = [png_for(it) for it in items]
    qpng = [png_for(it) for it in queries]
    pw.close()
    pw_ctx.stop()

    def embed(paths):
        model = EMBED_MODEL
        for attempt in (0, 1):
            try:
                body = {'model': model, 'input': [
                    'data:image/png;base64,' + base64.b64encode(
                        open(p, 'rb').read()).decode()
                    for p in paths]}
                d = _post(key, EMBED_API, body)
                return [x['embedding'] for x in d['data']], model
            except Exception as e:
                FALLBACKS.append({'lane_model': model,
                                  'reason': str(e)[:120],
                                  'count': 1,
                                  'fell_back_to': EMBED_FALLBACK})
                model = EMBED_FALLBACK
        return None, None
    vecs, emodel = embed(bank)
    qvecs, _ = embed(qpng)

    def cos(a, b):
        d = sum(x * y for x, y in zip(a, b))
        na = math.sqrt(sum(x * x for x in a))
        nb = math.sqrt(sum(x * x for x in b))
        return d / (na * nb) if na and nb else 0
    out = {'embed_model': emodel, 'bank': [it['id'] for it in items],
           'queries': []}
    for qi, qv in enumerate(qvecs):
        sims = sorted(
            ((cos(qv, v), items[i]['id']) for i, v in
             enumerate(vecs)), reverse=True)
        topk = sims[:5]
        # rerank stage: query png vs doc pngs
        docs = ['data:image/png;base64,' + base64.b64encode(
            open(bank[items.index(
                next(x for x in items if x['id'] == sid))],
                'rb').read()).decode() for sid, _ in
            ((s, i) for s, i in sims[:8])]
        try:
            rb = {'model': RERANK_MODEL,
                  'query': 'data:image/png;base64,' +
                  base64.b64encode(
                      open(qpng[qi], 'rb').read()).decode(),
                  'documents': docs}
            rd = _post(key, RERANK_API, rb)
            rorder = [rd['results'][j]['index']
                      for j in range(len(rd['results']))]
            rerr = None
        except Exception as e:
            rorder, rerr = None, str(e)[:120]
        out['queries'].append({
            'query': queries[qi]['id'],
            'cosine_top5': [[s, i] for s, i in topk],
            'rerank_order_top8': rorder, 'rerank_error': rerr})
    json.dump(out, open(os.path.join(TEST_DIR, 'EMBED.json'), 'w'),
              indent=1)
    print(json.dumps(out['queries'], indent=1)[:2000])


if '--test2' in sys.argv:
    test_run2()
if '--test-embed' in sys.argv:
    test_embed()
