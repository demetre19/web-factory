#!/usr/bin/env python3
"""Re-ingest lexdemos sites via their lexingtonthemes.com/viewports/<slug>
iframe — lexdemos serves the real demo only to Sec-Fetch-Dest: iframe.
Loads viewport page, extracts demo frame, runs Section Scan + capture
on the FRAME context, stitches full-page shot, reuses ingest_good's
finish()/bank() so meta/report/receipt schema stays identical.
Multi-page: navigates the frame's own URL by appending path to the
demo origin via the same iframe (re-loads viewport with ?path is not
supported — instead we click through via frame.goto on the frame's
document using history.pushState? No — we re-point the iframe src).

Usage: reingest_lexdemos.py [--limit N] [--slugs slug,slug,...]
"""
import json
import os
import sys
import time
from urllib.parse import urlparse

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, HERE)
import ingest_good  # noqa: E402

OPERATOR = ingest_good.OPERATOR
LEX = json.load(open(os.path.join(
    OPERATOR, '_sources', 'lexington.json')))
LINK_JS = """() => Array.from(document.querySelectorAll('a[href]'))
  .map(a => a.href)"""

PAGE_PATTERNS = [
    (r'/(book|booking|schedule|appoint)', 'appointment'),
    (r'/(contact|get-in-touch|reach-us)', 'contact'),
    (r'/(pricing|price-list|membership|packages|plans)', 'pricing'),
    (r'/(about|our-story|team|staff|provider|meet|company|mission)',
     'about'),
    (r'/(service|treatment|procedure|inject|facial|laser|peel|'
     r'classes|exercise|wellness|menu)', 'service-detail'),
    (r'/(before-after|gallery|results|work|portfolio|case)',
     'work-index'),
    (r'/(blog|journal|news|learn|articles?|stories)', 'article'),
    (r'/(faq|insurance|first-visit)', 'article'),
]
MAX_PAGES = 4


def pick_pages(origin, links):
    import re
    pages = {}
    for h in links:
        u = urlparse(h.split('#')[0].split('?')[0])
        if u.netloc != urlparse(origin).netloc:
            continue
        path = u.path.rstrip('/').lower()
        if not path or path in ('/', '/index'):
            continue
        for pat, ptype in PAGE_PATTERNS:
            if re.search(pat, path):
                depth = path.count('/')
                if ptype not in pages or depth < pages[ptype][1]:
                    pages[ptype] = (u.geturl(), depth)
                break
    return {t: v[0] for t, v in sorted(pages.items())}

def capture_frame(page, frame, url, d):

    """Replicate ingest_url's per-viewport capture on the frame."""
    results = {}
    frame.wait_for_load_state('domcontentloaded')
    # hide the demo wrapper toolbar so it isn't scanned/shotted
    page.evaluate("""() => {
      for (const el of document.querySelectorAll(
        'header,nav,[class*=toolbar],[class*=Toolbar]'))
        el.style.display = 'none';
      const f = document.querySelector('iframe');
      if (f) { f.style.top = '0'; f.style.position = 'absolute';
               f.style.left = '0'; }
    }""")
    try:
        frame.wait_for_load_state('networkidle', timeout=12000)
    except Exception:
        pass
    frame.evaluate("""async () => {
      const h = document.body.scrollHeight;
      for (let y = 0; y < h; y += 800) {
        window.scrollTo(0, y);
        await new Promise(r => setTimeout(r, 120));
      }
      window.scrollTo(0, 0);
      await new Promise(r => setTimeout(r, 300));
    }""")
    frame.evaluate(ingest_good.SETUP_JS)
    frame.wait_for_timeout(500)
    # full-frame screenshot: clip to iframe viewport won't give full
    # doc — resize iframe element to doc height, shoot, restore.
    fh = frame.evaluate('document.body.scrollHeight')
    el = page.query_selector('iframe')
    box = el.bounding_box()
    page.evaluate("""(h) => {
      const f = document.querySelector('iframe');
      f.style.height = h + 'px';
      document.body.style.height = h + 'px';
      document.documentElement.style.height = 'auto';
      window.__restoreH = f.style.height;
    }""", fh + 80)
    frame.wait_for_timeout(300)
    raw = os.path.join(d, 'full-frame.png')
    page.screenshot(path=raw, full_page=True)
    secs = frame.evaluate(ingest_good.DETECT_JS,
                          ingest_good.MAX_SECTIONS)
    # band fallback for thin results
    if len(secs) < 3 and fh > 2400:
        from PIL import Image
        im = Image.open(raw)
        W, H = im.size
        edges = ingest_good.band_edges(im, W, H)
        secs = [{'tag': 'div', 'id': '', 'className': '',
                 'geometry': {'left': 0, 'top': y0, 'width': W,
                              'height': y1 - y0},
                 'bandFallback': True}
                for y0, y1 in zip(edges, edges[1:])
                if y1 - y0 >= 80]
    results = {'desktop': {'shot': raw, 'sections': secs,
                           'w': 1440, 'h': fh}}
    return results, box


def ingest_demo(page, tpl, demo_url, note, site_type, page_type):
    slug = ingest_good.slugify(demo_url)
    d = os.path.join(OPERATOR, slug)
    os.makedirs(d, exist_ok=True)
    meta = {'url': demo_url, 'domain': urlparse(demo_url).netloc,
            'site_type': site_type, 'page_type': page_type,
            'source': 'operator', 'approved': True, 'note': note,
            'capture_engine': 'ingest_good/frame-viewport',
            'schema_version': '1.0',
            'lexington_template': tpl['template']}
    page.goto('https://lexingtonthemes.com' + tpl['viewport_url']
              .replace('https://lexingtonthemes.com', ''),
              wait_until='domcontentloaded', timeout=45000)
    frame = None
    for _ in range(12):  # poll up to ~9s
        frame = next((f for f in page.frames
                      if 'lexdemos' in f.url), None)
        if frame:
            break
        page.wait_for_timeout(750)
    if not frame:
        meta['capture_status'] = 'error'
        meta['capture_reason'] = 'no demo frame'
        json.dump(meta, open(os.path.join(d, 'meta.json'), 'w'),
                  indent=1)
        return slug, meta, []
    # navigate frame to target path if not home
    path = urlparse(demo_url).path
    if path and path != '/':
        frame.evaluate("""(p) => location.href = p""", demo_url)
        frame.wait_for_load_state('domcontentloaded')
        frame.wait_for_timeout(1500)
    results, _ = capture_frame(page, frame, demo_url, d)
    if not results['desktop']['sections']:
        meta['capture_status'], meta['capture_reason'] = \
            'error', 'no sections detected'
        json.dump(meta, open(os.path.join(d, 'meta.json'), 'w'),
                  indent=1)
        return slug, meta, []
    # finish() expects results dict with per-viewport 'shot';
    # pass only desktop (tablet/mobile impossible via iframe).
    slug, meta, secs = ingest_good.finish(slug, d, meta, demo_url,
                                          results)
    # cleanup frame shot is handled by finish() (removes desk['shot'])
    n = ingest_good.bank(slug)
    print(f'  {page_type} {demo_url}: '
          f'{meta.get("capture_status")} {len(secs)} sections '
          f'{n} banked', flush=True)
    return slug, meta, secs


def main():
    from playwright.sync_api import sync_playwright
    tpls = [s for s in LEX['sites']
            if s.get('demo_url') and s.get('viewport_url')]
    if '--limit' in sys.argv:
        tpls = tpls[:int(sys.argv[sys.argv.index('--limit') + 1])]
    only = None
    if '--slugs' in sys.argv:
        want = set(sys.argv[sys.argv.index('--slugs') + 1].split(','))
        tpls = [s for s in tpls
                if s['template'].rsplit('/', 1)[-1] in want]
    cfg = {e['url'].split('#')[0]: e for e in
           json.load(open(os.path.join(HERE, 'lexington-sites.json')))}
    report = {}
    with sync_playwright() as pw:
        for tpl in tpls:
            demo = tpl['demo_url'].rstrip('/') + '/'
            e = cfg.get(demo) or {}
            st = e.get('site_type', 'other')
            name = tpl['template'].rsplit('/', 1)[-1]
            if name in ('astromaxsp',):  # known renderer-crashers
                report[name] = {'skipped': 'renderer crash'}
                continue
            try:
                br = pw.chromium.launch()
            except Exception:
                br = pw.chromium.launch(executable_path=(
                    '/Applications/Brave Browser.app/Contents/MacOS/'
                    'Brave Browser'))
            page = br.new_page(viewport={'width': 1440, 'height': 900})
            try:
                page.goto(tpl['viewport_url'],
                          wait_until='domcontentloaded',
                          timeout=45000)
                frame = None
                for _ in range(12):  # poll up to ~9s for demo frame
                    frame = next((f for f in page.frames
                                  if 'lexdemos' in f.url), None)
                    if frame:
                        break
                    page.wait_for_timeout(750)
                links = frame.evaluate(LINK_JS) if frame else []
            except Exception as ex:
                print(f'{name}: frame nav error {ex}', flush=True)
                links = []
            pages = pick_pages(demo, links)
            print(f'{name}: {len(links)} links '
                  f'pages={list(pages)}', flush=True)
            per = {}
            todo = ([] if '--skip-home' in sys.argv
                    else [('home', demo)])
            todo += list(sorted(pages.items()))[:MAX_PAGES - 1]
            for ptype, url in todo:
                try:
                    slug, meta, secs = ingest_demo(
                        page, tpl, url,
                        f'lexington {name} (page_type={ptype})',
                        st, ptype)
                    per[ptype] = {'slug': slug,
                                  'status': meta.get(
                                      'capture_status'),
                                  'sections': len(secs)}
                except Exception as ex:
                    per[ptype] = {'status': 'error',
                                  'reason': str(ex)[:120]}
                    print(f'  {ptype} {url}: ERROR {ex}',
                          flush=True)
                    if page.is_closed() or 'crash' in str(ex).lower():
                        try:
                            br.close()
                        except Exception:
                            pass
                        br = pw.chromium.launch()
                        page = br.new_page(
                            viewport={'width': 1440, 'height': 900})
                time.sleep(1.0)
            report[name] = per
            time.sleep(1.5)
            try:
                br.close()
            except Exception:
                pass
    print('\n=== REPORT ===')
    print(json.dumps(report, indent=1))


if __name__ == '__main__':
    main()
