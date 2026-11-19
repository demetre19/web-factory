#!/usr/bin/env python3
"""Render banked skeletons to PNG for the CLIP render-embed pass.

HTML kits (preline/flowbite/hyperui): wrapped in a Tailwind-CDN shell,
shot at 1440x900.
SVG ornaments (shapes/gallery): rasterised on a neutral page.

  uv run --quiet --with playwright python3 render_bank.py [--kit NAME]
      [--limit N]

Outputs -> ../data/bank_shots/<kit>/<relpath>.png  (skip-cached by
file sha in cache.sqlite kind='bank_shot').
TSX files are NOT rendered here (no bundler step; spec-only per
SiteScanner contract).
"""
import hashlib
import json
import os
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.normpath(os.path.join(HERE, '..', 'data'))
BANK = os.path.normpath(os.path.join(HERE, '..', '..', '..', '..',
                                     '..', 'templates', 'skeletons'))
OUT = os.path.join(DATA, 'bank_shots')
sys.path.insert(0, HERE)
import cache  # noqa: E402

HTML_KITS = ('preline', 'flowbite', 'hyperui')
SVG_KITS = ('shapes', 'icons')

# shell v2: kits use Tailwind v4 semantic tokens (text-body,
# bg-neutral-primary, rounded-base, fg-brand) — the v3 CDN build
# doesn't emit them, which is why v1 renders all read 'minimal'.
SHELL_V = 'v2'

TW4 = ('<script src="https://cdn.jsdelivr.net/npm/'
       '@tailwindcss/browser@4"></script>')
KIT_ASSETS = {
    'flowbite': TW4 +
        '<link href="https://cdn.jsdelivr.net/npm/flowbite@3.1.2/'
        'dist/flowbite.min.css" rel="stylesheet">'
        '<script src="https://cdn.jsdelivr.net/npm/flowbite@3.1.2/'
        'dist/flowbite.min.js"></script>',
    'preline': TW4 +
        '<script src="https://cdn.jsdelivr.net/npm/preline@3.2.3/'
        'dist/preline.js"></script>',
    'hyperui': TW4,  # markup-only kit, no vendored CSS
}

SHELL = """<!doctype html><html><head><meta charset="utf-8">
__ASSETS__
<style>body{margin:0;background:#fff}</style>
</head><body style="padding:24px;display:flex;align-items:center;
justify-content:center;min-height:100vh">
__BODY__
</body></html>"""


def jobs(kit):
    root = os.path.join(BANK, kit)
    for dirpath, _, files in os.walk(root):
        for f in sorted(files):
            if kit in SVG_KITS and f.endswith('.svg'):
                yield os.path.join(dirpath, f), 'svg'
            elif kit in HTML_KITS and f.endswith(('.html', '.htm')) \
                    and not f.startswith('_'):
                yield os.path.join(dirpath, f), 'html'


def sha(p):
    return hashlib.sha256(open(p, 'rb').read()).hexdigest()[:16]


def out_path(src, kit):
    rel = os.path.relpath(src, os.path.join(BANK, kit))
    return os.path.join(OUT, kit,
                        os.path.splitext(rel)[0] + '.png')


def render(kit_filter=None, limit=10**9):
    from playwright.sync_api import sync_playwright
    todo = []
    for kit in sorted(HTML_KITS + SVG_KITS):
        if kit_filter and kit != kit_filter:
            continue
        for src, kind in jobs(kit):
            key = sha(src) + ':' + SHELL_V
            if cache.get('bank_shot', key):
                continue
            todo.append((kit, src, kind, key))
        if len(todo) >= limit:
            break
    print(f'{len(todo)} to render')
    done = 0
    with sync_playwright() as p:
        br = p.chromium.launch()
        pg = br.new_page(viewport={'width': 1440, 'height': 900})
        for kit, src, kind, key in todo[:limit]:
            try:
                if kind == 'svg':
                    body = open(src, encoding='utf-8',
                                errors='replace').read()
                else:
                    body = open(src, encoding='utf-8',
                                errors='replace').read()
                shell = SHELL.replace('__ASSETS__', KIT_ASSETS.get(
                    kit, TW4)).replace('__BODY__', body)
                pg.set_content(shell, wait_until='load')
                pg.wait_for_timeout(600)
                op = out_path(src, kit)
                os.makedirs(os.path.dirname(op), exist_ok=True)
                pg.screenshot(path=op)
                cache.put('bank_shot', key, {'shot': op})
                done += 1
            except Exception as e:
                print(f'  {src}: {e}', file=sys.stderr)
            if done % 50 == 0 and done:
                print(f'  {done}/{len(todo)}', flush=True)
        br.close()
    print(f'DONE {done} rendered -> {OUT}')


def main():
    args = sys.argv[1:]
    kit = args[args.index('--kit') + 1] if '--kit' in args else None
    lim = int(args[args.index('--limit') + 1]) if '--limit' in args \
        else 10**9
    render(kit, lim)


if __name__ == '__main__':
    main()
