#!/usr/bin/env python3
"""Score candidate-tier sources (astro-showcase) with score.py.

Fetches each URL's rendered HTML via Playwright (cookie banners
dismissed; blocked/timeout marked), writes tmp HTML, runs
score.py score --json, merges into <src>.scores.json keyed by URL.
usage: score_candidates.py <src.json> [--workers N] [--limit N]
"""
import json
import os
import re
import subprocess
import sys
import time
from concurrent.futures import ThreadPoolExecutor

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
TOOLS = HERE
HTML_DIR = os.path.join(ROOT, 'docs', 'machinery', 'design',
                        'patterns', 'data', 'operator', '_sources',
                        '.candidate-html')
DISMISS = [
    "button:has-text('Accept all')", "button:has-text('Accept')",
    "button:has-text('I agree')", "button:has-text('OK')",
    "button:has-text('Got it')",
    "[class*='cookie'] button", "[id*='cookie'] button",
    "[class*='consent'] button",
]
# thread-local playwright
_tls = {}


def browser():
    from playwright.sync_api import sync_playwright
    import threading
    t = threading.current_thread().name
    if t not in _tls:
        pw = sync_playwright().start()
        try:
            br = pw.chromium.launch()
        except Exception:
            br = pw.chromium.launch(executable_path=(
                '/Applications/Brave Browser.app/Contents/MacOS/'
                'Brave Browser'))
        _tls[t] = (pw, br, br.new_page(
            viewport={'width': 1440, 'height': 900}))
    return _tls[t][2]


def fetch_html(page, url):
    r = page.goto(url, wait_until='domcontentloaded', timeout=30000)
    try:
        page.wait_for_load_state('networkidle', timeout=8000)
    except Exception:
        pass
    for sel in DISMISS:
        try:
            el = page.query_selector(sel)
            if el and el.is_visible():
                el.click(timeout=600)
        except Exception:
            pass
    page.wait_for_timeout(400)
    return r.status if r else None, page.content()


def score_html(path, site_type='other', page_type='home'):
    out = subprocess.run(
        [sys.executable, os.path.join(TOOLS, 'score.py'), 'score',
         path, '--site-type', site_type, '--page-type', page_type,
         '--json'],
        capture_output=True, text=True, timeout=120, cwd=HERE)
    if out.returncode != 0:
        return None, out.stderr.strip()[:160] or 'score failed'
    try:
        return json.loads(out.stdout), None
    except Exception as e:
        return None, f'score parse: {e}'


def one(entry):
    url = entry.get('url')
    if not url:
        return entry, {'score_error': 'no url'}
    try:
        page = browser()
        status, html = fetch_html(page, url)
        if status and status >= 400:
            return entry, {'score_status': f'http_{status}'}
        slug = re.sub(r'[^a-z0-9]+', '-', url.lower()).strip('-')[:80]
        os.makedirs(HTML_DIR, exist_ok=True)
        path = os.path.join(HTML_DIR, slug + '.html')
        open(path, 'w').write(html)
        res, err = score_html(path)
        if err:
            return entry, {'score_error': err}
        opt = (res.get('options') or [{}])[0]
        return entry, {
            'score': opt.get('score'),
            'score_sections': [s.get('score') for s in
                               opt.get('sections', [])][:20],
            'score_reasons': opt.get('reasons')[:8]}
    except Exception as e:
        return entry, {'score_error': str(e)[:150]}


def main():
    src = sys.argv[1]
    data = json.load(open(src))
    out = src.replace('.json', '.scores.json')
    if os.path.exists(out):
        merged = {s['url']: s for s in
                  json.load(open(out))['sites']}
    else:
        merged = {}
    todo = [s for s in data['sites']
            if s.get('url') and 'score' not in merged.get(
                s['url'], {})]
    if '--limit' in sys.argv:
        todo = todo[:int(sys.argv[sys.argv.index('--limit') + 1])]
    workers = 4
    if '--workers' in sys.argv:
        workers = int(sys.argv[sys.argv.index('--workers') + 1])
    print(f'{len(todo)} candidates to score (workers={workers})',
          flush=True)
    done = 0
    with ThreadPoolExecutor(max_workers=workers) as ex:
        for entry, extra in ex.map(one, todo):
            rec = dict(entry)
            rec.update(extra)
            merged[rec['url']] = rec
            done += 1
            if done % 20 == 0 or done == len(todo):
                print(f'{done}/{len(todo)} scored', flush=True)
                json.dump(
                    {'source_url': data.get('source_url'),
                     'fetched': time.strftime('%Y-%m-%d'),
                     'tier': data.get('tier'),
                     'sites': list(merged.values())},
                    open(out, 'w'), indent=1)
    json.dump(
        {'source_url': data.get('source_url'),
         'fetched': time.strftime('%Y-%m-%d'),
         'tier': data.get('tier'),
         'sites': list(merged.values())},
        open(out, 'w'), indent=1)
    scored = sum(1 for s in merged.values()
                 if s.get('score') is not None)
    print(f'DONE {scored}/{len(merged)} scored -> {out}', flush=True)


if __name__ == '__main__':
    main()
