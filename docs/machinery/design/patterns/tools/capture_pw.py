#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# dependencies = ["playwright", "pillow", "numpy"]
# ///
"""Capture sites at REAL viewports — never a stretched window.

The old Brave path used one 6000px-tall window, so every `100vh` hero
and video rendered six times too tall (P0, basicagency.com). This
captures at actual viewport sizes:

  desktop  1440 x 900  (primary, tiles written)
  desktop2 1280 x 800  (probe only, sanity)
  mobile    390 x 844  (meta.mobile_tiles when --mobile)

Steps per page: block media autoplay → scroll top→bottom to trigger
lazy content → back to top → wait networkidle+fonts → dismiss cookie
banners → pause all <video> on a representative frame → fullPage
screenshot (captureBeyondViewport keeps layout at 900vh) → tile.

  uv run capture_pw.py capture <url> <site_type> <page_type> <source>
      [--slug S] [--out DIR] [--mobile]
  uv run capture_pw.py batch [--limit N] [--workers 4]

Output: data/web/canon/<slug>/meta.json + tile-NN.png (or
data/web/negatives/<slug>/ for source=negative).
"""
import json
import os
import re
import subprocess
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.normpath(os.path.join(HERE, '..', 'data'))
URLS = os.path.join(DATA, 'web_supplement_urls.txt')
WIDTH = 1440
VPH = 900
TILE_H = 1600
MOBILE = (390, 844)

DISMISS = [
    "button:has-text('Accept')", "button:has-text('Accept all')",
    "button:has-text('I agree')", "button:has-text('Got it')",
    "button:has-text('OK')", "button:has-text('Close')",
    "[class*='cookie'] button", "[id*='cookie'] button",
    "[class*='consent'] button",
]

SETUP_JS = """async () => {
  // pause every video on a representative frame; never autoplay
  for (const v of document.querySelectorAll('video')) {
    try { v.pause(); v.autoplay = false;
          if (v.readyState >= 2 && !v.poster) v.currentTime =
            Math.min(0.5, v.duration || 0); } catch (e) {}
    v.setAttribute('data-paused', '1');
  }
  // stop CSS/JS animation so repeated captures are stable
  const st = document.createElement('style');
  st.textContent = '*{animation-play-state:paused!important;' +
    'transition:none!important;caret-color:transparent!important}';
  document.head.appendChild(st);
}"""


def capture(page, url, out_dir, mobile=False):
    """One URL -> tiles + meta fragment. Returns (meta, error)."""
    try:
        page.goto(url, wait_until='domcontentloaded', timeout=45000)
    except Exception as e:
        return None, f'goto: {e}'
    try:
        page.wait_for_load_state('networkidle', timeout=15000)
    except Exception:
        pass
    # scroll once top->bottom: lazy images + infinite-scroll triggers
    page.evaluate("""async () => {
      const h = document.body.scrollHeight;
      for (let y = 0; y < h; y += 800) {
        window.scrollTo(0, y);
        await new Promise(r => setTimeout(r, 120));
      }
      window.scrollTo(0, 0);
      await new Promise(r => setTimeout(r, 300));
    }""")
    for sel in DISMISS:
        try:
            el = page.query_selector(sel)
            if el and el.is_visible():
                el.click(timeout=800)
        except Exception:
            pass
    try:
        page.evaluate(SETUP_JS)
    except Exception:
        pass
    try:
        page.wait_for_timeout(600)
    except Exception:
        pass
    os.makedirs(out_dir, exist_ok=True)
    raw = os.path.join(out_dir, 'full.png')
    page.screenshot(path=raw, full_page=True)
    return {'raw': raw}, None


def tile_it(d, raw, meta):
    from PIL import Image
    im = Image.open(raw)
    w, h = im.size
    tiles = []
    for i, y in enumerate(range(0, h, TILE_H)):
        t = im.crop((0, y, w, min(y + TILE_H, h)))
        name = f'tile-{i:02d}.png'
        t.save(os.path.join(d, name))
        tiles.append(name)
    os.remove(raw)
    meta['width'], meta['height'], meta['tiles'] = w, h, tiles


def slugify(url):
    return re.sub(r'[^a-z0-9]+', '-', url.lower()).strip('-')[:90]


def dest(source):
    return os.path.join(DATA, 'web',
                      'negatives' if source == 'negative' else 'canon')


def cmd_capture(args):
    from playwright.sync_api import sync_playwright
    import capture_ok
    url, st, pt, src = args[:4]
    slug = (args[args.index('--slug') + 1]
            if '--slug' in args else slugify(url))
    d = os.path.join(dest(src), slug)
    os.makedirs(d, exist_ok=True)
    with sync_playwright() as pw:
        try:
            br = pw.chromium.launch()
        except Exception:
            br = pw.chromium.launch(executable_path=(
                '/Applications/Brave Browser.app/Contents/MacOS/'
                'Brave Browser'))
        page = br.new_page(viewport={'width': WIDTH, 'height': VPH})
        res, err = capture(page, url, d)
        meta = {'url': url,
                'domain': url.split('//')[-1].split('/')[0],
                'site_type': st, 'page_type': pt, 'source': src,
                'approved': src == 'negative',  # contrast = canon
                'capture_engine': 'playwright2',
                'viewport': [WIDTH, VPH],
                'schema_version': '1.0'}
        if err:
            meta['capture_status'], meta['capture_reason'] = 'error', err
            json.dump(meta, open(os.path.join(d, 'meta.json'), 'w'),
                      indent=1)
            br.close()
            print(f'{slug}: FAILED {err}')
            return 1
        tile_it(d, res['raw'], meta)
        if '--mobile' in args:
            mp = br.new_page(viewport={'width': MOBILE[0],
                                       'height': MOBILE[1]})
            mres, _ = capture(mp, url, d)
            if mres:
                from PIL import Image
                im = Image.open(mres['raw'])
                im.save(os.path.join(d, 'mobile.png'))
                os.remove(mres['raw'])
                meta['mobile'] = {'viewport': list(MOBILE),
                                  'height': im.size[1]}
            mp.close()
        br.close()
    meta['probe'] = capture_ok.probe(url, use_cache=False)
    status, reason = capture_ok.decide(meta, d)
    meta['capture_status'] = status
    meta['capture_reason'] = reason
    json.dump(meta, open(os.path.join(d, 'meta.json'), 'w'), indent=1)
    print(f'{slug}: {meta["width"]}x{meta["height"]} '
          f'{len(meta["tiles"])} tiles [{status}'
          f'{": " + reason if reason else ""}]', flush=True)
    return 0 if status == 'ok' else 2


def cmd_batch(limit=None, workers=4):
    rows = []
    for line in open(URLS):
        line = line.strip()
        if not line or line.startswith('#'):
            continue
        parts = line.split('|')
        if len(parts) < 3:
            continue
        url, st, pt = parts[0], parts[1], parts[2]
        src = parts[3] if len(parts) > 3 else 'curated'
        slug = slugify(url)
        if os.path.exists(os.path.join(dest(src), slug, 'meta.json')):
            continue
        rows.append((url, st, pt, src))
    if limit:
        rows = rows[:limit]
    print(f'{len(rows)} to capture')
    from concurrent.futures import ThreadPoolExecutor
    def one(row):
        return subprocess.run(
            [sys.executable, __file__, 'capture', *row],
            capture_output=True, text=True, timeout=180)
    done = 0
    with ThreadPoolExecutor(max_workers=workers) as ex:
        for fut, out in zip(rows, ex.map(one, rows)):
            done += 1
            tail = (out.stdout or out.stderr).strip().splitlines()
            print(f'[{done}/{len(rows)}] ' + (tail[-1] if tail else '?'),
                  flush=True)


if __name__ == '__main__':
    args = sys.argv[1:]
    if args and args[0] == 'capture':
        pos = [a for a in args[1:] if not a.startswith('--')]
        pos += [a for a in args[1:] if a.startswith('--')]
        sys.exit(cmd_capture(pos))
    elif args and args[0] == 'batch':
        lim = int(args[args.index('--limit') + 1]) if '--limit' in args \
            else None
        w = int(args[args.index('--workers') + 1]) if '--workers' in args \
            else 4
        cmd_batch(lim, w)
    else:
        print(__doc__)
