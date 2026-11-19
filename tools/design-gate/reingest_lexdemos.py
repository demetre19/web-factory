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
       reingest_lexdemos.py --deep [--slugs ...]   # crawl ALL pages
"""
import json
import os
import re
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

def stretched(secs, page_h):
    """Any non-nav section taller than 1.5 viewports AND most of the page
    — the capture_ok 'stretched' rule; means the detector took a
    wrapper, not real sections."""
    lim = max(1350, 0.6 * page_h)
    return any(s['geometry']['height'] > lim for s in secs
               if s.get('section_type') != 'nav')


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
    # band fallback for thin OR stretched results: an outer wrapper
    # <section> spanning the whole doc is one "section" to the detector
    if fh > 2400 and (len(secs) < 3 or stretched(secs, fh)):
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


def open_frame(page, tpl, url):
    """Load the template's viewport wrapper and point its demo iframe at
    `url`. Returns the frame, or None if the demo frame never appeared."""
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
        return None
    path = urlparse(url).path
    if path and path != '/':
        frame.evaluate("""(p) => location.href = p""", url)
        frame.wait_for_load_state('domcontentloaded')
        frame.wait_for_timeout(1500)
    return frame


def frame_links(frame):
    try:
        return frame.evaluate(LINK_JS)
    except Exception:
        return []


def ingest_demo(page, tpl, demo_url, note, site_type, page_type,
                do_bank=True, fresh=False):
    """Capture one demo page. Returns (slug, meta, sections, links).
    fresh=True clears stale crops/tiles from an earlier capture of the
    same slug so a re-capture never mixes old and new section files."""
    slug = ingest_good.slugify(demo_url)
    d = os.path.join(OPERATOR, slug)
    os.makedirs(d, exist_ok=True)
    if fresh:
        for f in os.listdir(d):
            if f.startswith(('sec-', 'tile-', 'full-')) and \
                    f.endswith('.png'):
                os.remove(os.path.join(d, f))
    meta = {'url': demo_url, 'domain': urlparse(demo_url).netloc,
            'site_type': site_type, 'page_type': page_type,
            'source': 'operator', 'approved': True, 'note': note,
            'capture_engine': 'ingest_good/frame-viewport',
            'schema_version': '1.0',
            'lexington_template': tpl['template']}
    frame = open_frame(page, tpl, demo_url)
    if not frame:
        meta['capture_status'] = 'error'
        meta['capture_reason'] = 'no demo frame'
        json.dump(meta, open(os.path.join(d, 'meta.json'), 'w'),
                  indent=1)
        return slug, meta, [], []
    results, _ = capture_frame(page, frame, demo_url, d)
    links = frame_links(frame)
    if not results['desktop']['sections']:
        meta['capture_status'], meta['capture_reason'] = \
            'error', 'no sections detected'
        json.dump(meta, open(os.path.join(d, 'meta.json'), 'w'),
                  indent=1)
        return slug, meta, [], links
    if any(s.get('bandFallback') for s in results['desktop']['sections']):
        meta['capture_engine'] = 'ingest_good/frame-band-fallback'
    # finish() expects results dict with per-viewport 'shot';
    # pass only desktop (tablet/mobile impossible via iframe).
    slug, meta, secs = ingest_good.finish(slug, d, meta, demo_url,
                                          results)
    # cleanup frame shot is handled by finish() (removes desk['shot'])
    n = ingest_good.bank(slug) if do_bank else 0
    print(f'  {page_type} {demo_url}: '
          f'{meta.get("capture_status")} {len(secs)} sections'
          + (f' {n} banked' if do_bank else ''), flush=True)
    return slug, meta, secs, links


BRAVE = '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser'


def launch(pw):
    """New-headless Chromium first: Playwright's default headless-shell
    renderer crashes outright on several lexdemos pages (sandstone
    /projects, /studio; astromaxsp). Shell and Brave are fallbacks."""
    for kw in ({'channel': 'chromium'}, {}, {'executable_path': BRAVE}):
        try:
            br = pw.chromium.launch(**kw)
            break
        except Exception:
            continue
    return br, br.new_page(viewport={'width': 1440, 'height': 900})


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
            br, page = launch(pw)
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
            # skip dirs already ingested (resume-safe)
            todo = [(pt, u) for pt, u in todo if not os.path.exists(
                os.path.join(OPERATOR, ingest_good.slugify(u),
                             'meta.json'))]
            for ptype, url in todo:
                try:
                    slug, meta, secs, _ = ingest_demo(
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
                        br, page = launch(pw)
                time.sleep(1.0)
            report[name] = per
            time.sleep(1.5)
            try:
                br.close()
            except Exception:
                pass
    print('\n=== REPORT ===')
    print(json.dumps(report, indent=1))


DEEP_MAX = 25   # pages per demo site (politeness + diminishing returns)
COLL_MAX = 3    # detail pages kept per collection, e.g. /blog/<post>
SKIP_EXT = ('.pdf', '.xml', '.jpg', '.jpeg', '.png', '.gif', '.svg',
            '.webp', '.avif', '.zip', '.mp4', '.txt', '.json', '.rss',
            '.ico', '.css', '.js')
# pagination / taxonomy archives / legal boilerplate: near-duplicates
SKIP_RE = re.compile(r'/(tags?|author|categories)/|/page/\d+$|'
                     r'^/(privacy|terms|legal|cookies?|imprint|'
                     r'disclaimer)(/|$)|/(cdn-cgi|_astro|feed|rss)(/|$)')
COLL = r'(blog|journal|news|articles?|posts?|stories|insights|resources)'
WORK = r'(work|portfolio|projects|case-studies|cases|showcase)'
SHOP = r'(shop|store|products?|collections?)'
DEEP_TYPES = [
    (rf'^/{COLL}$', 'blog'), (rf'^/{COLL}/.+', 'article'),
    (rf'^/{WORK}$', 'work-index'), (rf'^/{WORK}/.+', 'case-study'),
    (rf'^/{SHOP}$', 'category'), (rf'^/{SHOP}/.+', 'product'),
    (r'^/(careers|jobs)(/|$)', 'listing'),
    (r'^/(events?|schedule|calendar)(/|$)', 'schedule'),
]
LINKS_P = os.path.join(OPERATOR, '_sources', 'lexdemos-links.json')
DEEP_P = os.path.join(OPERATOR, '_sources', 'lexdemos-deep.json')


def deep_norm(href, host):
    u = urlparse(href.split('#')[0])
    if u.scheme not in ('http', 'https') or u.netloc != host:
        return None
    path = re.sub(r'/+$', '', u.path) or '/'
    low = path.lower()
    if low.endswith(SKIP_EXT) or SKIP_RE.search(low):
        return None
    return f'https://{host}{path}' if path != '/' else f'https://{host}/'


def deep_type(url):
    path = urlparse(url).path.rstrip('/').lower() or '/'
    if path == '/':
        return 'home'
    for pat, ptype in DEEP_TYPES:
        if re.search(pat, path):
            return ptype
    for pat, ptype in PAGE_PATTERNS:
        if re.search(pat, path):
            return ptype
    return 'other'


def needs_capture(url):
    """Resume rule: skip pages whose meta is ok, has every section crop on
    disk and is not stretched; never retry a page the deep pass already
    handled (errors stay recorded instead of looping)."""
    d = os.path.join(OPERATOR, ingest_good.slugify(url))
    mp = os.path.join(d, 'meta.json')
    if not os.path.exists(mp):
        return True
    m = json.load(open(mp))
    if m.get('deep_pass'):
        return False
    if m.get('capture_status') != 'ok':
        return True
    secs = m.get('sections') or []
    if not secs or not all(os.path.exists(os.path.join(d, s['file']))
                           for s in secs):
        return True
    return (m.get('height') or 0) > 2400 and \
        (len(secs) < 3 or stretched(secs, m['height']))


def site_priority(demo):
    """0 = thin/stretched or classification-flagged home, 1 = the rest."""
    mp = os.path.join(OPERATOR, ingest_good.slugify(demo), 'meta.json')
    if not os.path.exists(mp):
        return 0
    m = json.load(open(mp))
    secs = m.get('sections') or []
    thin = len(secs) <= 2 or stretched(secs, m.get('height') or 0)
    return 0 if thin or m.get('site_type_needs_review') else 1


def deep_main():
    """Crawl every same-domain page of each lexdemos site (nav, footer and
    index-page links, BFS), capture pages that need it into their site
    dirs. Does NOT bank: annotations.jsonl is rebuilt by the index pass
    from `slugs_to_index` in lexdemos-deep.json (bank() appends without
    dedupe, so re-captures would duplicate rows)."""
    from playwright.sync_api import sync_playwright
    tpls = [s for s in LEX['sites']
            if s.get('demo_url') and s.get('viewport_url')]
    if '--slugs' in sys.argv:
        want = set(sys.argv[sys.argv.index('--slugs') + 1].split(','))
        tpls = [s for s in tpls
                if s['template'].rsplit('/', 1)[-1] in want]
    tpls.sort(key=lambda s: site_priority(s['demo_url'].rstrip('/') + '/'))
    cfg = {e['url'].split('#')[0]: e for e in
           json.load(open(os.path.join(HERE, 'lexington-sites.json')))}
    cache = json.load(open(LINKS_P)) if os.path.exists(LINKS_P) else {}
    state = (json.load(open(DEEP_P)) if os.path.exists(DEEP_P)
             else {'slugs_to_index': [], 'sites': {}})
    to_index = set(state['slugs_to_index'])

    def save():
        json.dump(cache, open(LINKS_P, 'w'), indent=1)
        state['slugs_to_index'] = sorted(to_index)
        json.dump(state, open(DEEP_P, 'w'), indent=1)

    with sync_playwright() as pw:
        for tpl in tpls:
            demo = tpl['demo_url'].rstrip('/') + '/'
            host = urlparse(demo).netloc
            name = tpl['template'].rsplit('/', 1)[-1]
            st = (cfg.get(demo) or {}).get('site_type', 'other')
            br, page = launch(pw)
            queue, seen, coll = [demo], {demo}, {}
            stat = {'seen': 0, 'captured': 0, 'ok': 0, 'skipped': 0,
                    'errors': 0, 'priority': site_priority(demo)}
            print(f'{name}: priority {stat["priority"]}', flush=True)
            while queue:
                url = queue.pop(0)
                stat['seen'] += 1
                ptype = deep_type(url)
                links = None
                try:
                    if needs_capture(url):
                        slug, meta, secs, links = ingest_demo(
                            page, tpl, url,
                            f'lexington {name} deep (page_type={ptype})',
                            st, ptype, do_bank=False, fresh=True)
                        meta['deep_pass'] = time.strftime('%Y-%m-%d')
                        json.dump(meta, open(os.path.join(
                            OPERATOR, slug, 'meta.json'), 'w'), indent=1)
                        stat['captured'] += 1
                        if meta.get('capture_status') == 'ok':
                            stat['ok'] += 1
                            to_index.add(slug)
                    else:
                        stat['skipped'] += 1
                        links = cache.get(url)
                        if links is None:
                            frame = open_frame(page, tpl, url)
                            links = frame_links(frame) if frame else []
                except Exception as ex:
                    stat['errors'] += 1
                    print(f'  {ptype} {url}: ERROR {str(ex)[:120]}',
                          flush=True)
                    if page.is_closed() or 'crash' in str(ex).lower() \
                            or 'closed' in str(ex).lower():
                        try:
                            br.close()
                        except Exception:
                            pass
                        br, page = launch(pw)
                if links is not None:
                    cache[url] = links
                for h in links or []:
                    n = deep_norm(h, host)
                    if not n or n in seen or len(seen) >= DEEP_MAX:
                        continue
                    segs = urlparse(n).path.strip('/').split('/')
                    if len(segs) >= 2:
                        if coll.get(segs[0], 0) >= COLL_MAX:
                            continue
                        coll[segs[0]] = coll.get(segs[0], 0) + 1
                    seen.add(n)
                    queue.append(n)
                save()
                time.sleep(1.0)
            state['sites'][name] = stat
            save()
            print(f'{name}: {stat}', flush=True)
            try:
                br.close()
            except Exception:
                pass
            time.sleep(1.5)
    print(f'DONE deep: {len(to_index)} slugs to index -> {DEEP_P}',
          flush=True)


if __name__ == '__main__':
    deep_main() if '--deep' in sys.argv else main()
