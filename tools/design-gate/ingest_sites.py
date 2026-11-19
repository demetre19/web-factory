#!/usr/bin/env python3
"""Generalized operator vertical ingest: per-site home + key page types
discovered from internal links, site_type tag, Astro fingerprint on
every meta. Config: JSON list of {"url","site_type","keywords":{...}}.
usage: ingest_sites.py <config.json> [--max-pages N]
"""
import json
import os
import re
import sys
import time
from urllib.parse import urljoin, urlparse

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, HERE)
import ingest_good  # noqa: E402

OPERATOR = ingest_good.OPERATOR

DEFAULT_PATTERNS = [   # closed page_type vocab (TAXONOMY §2)
    (r'/(book|booking|schedule|appoint|demo|trial|signup|sign-up)',
     'appointment'),
    (r'/(contact|get-in-touch|reach-us)', 'contact'),
    (r'/(pricing|price-list|membership|packages|plans|enterprise)',
     'pricing'),
    (r'/(about|our-story|team|staff|provider|meet|company|mission)',
     'about'),
    (r'/(service|treatment|procedure|inject|facial|laser|peel|'
     r'botox|filler|skin|body|wellness|menu)', 'service-detail'),
    (r'/(before-after|gallery|results|work|portfolio|case)',
     'work-index'),
    (r'/(blog|journal|news|learn|article|stories)', 'article'),
    (r'/(product|shop|item|p/|category|c/)', 'product'),
    (r'/(feature|features|platform|solution|why)', 'landing'),
    (r'/(doc|docs|documentation|reference|guide|api|get-started)',
     'article'),
]
MAX_PAGES_PER_SITE = 4

LINK_JS = """() => Array.from(document.querySelectorAll('a[href]'))
  .map(a => a.href)
  .filter(h => h && !h.startsWith('mailto:') && !h.startsWith('tel:'))
"""

FINGERPRINT_JS = """() => ({
  astro_cid: document.querySelectorAll('[data-astro-cid]').length,
  astro_islands: document.querySelectorAll('astro-island').length,
  astro_scripts: Array.from(document.scripts).filter(s =>
    s.src && s.src.includes('_astro')).map(s => s.src).slice(0, 10),
  generator: ((document.querySelector('meta[name="generator"]')||{})
    .content || null),
  data_attrs: Array.from(new Set(
    Array.from(document.querySelectorAll('*')).flatMap(el =>
      Array.from(el.attributes || [])
        .map(at => at.name)
        .filter(n => /anim|gsap|scroll|aos|framer|motion|lottie|reveal|parallax|marquee|splide|swiper|embla/.test(n))))).slice(0, 40),
  anim_scripts: Array.from(document.scripts)
    .map(s => s.src || '')
    .filter(src => /gsap|aos|framer|lottie|three|splide|swiper|embla|marquee|lenis|locomotive|animate/.test(src))
    .slice(0, 15),
})"""

DISMISS = [
    "button:has-text('Accept all')", "button:has-text('Accept')",
    "button:has-text('I agree')", "button:has-text('OK')",
    "button:has-text('Got it')",
    "[class*='cookie'] button", "[id*='cookie'] button",
    "[class*='consent'] button",
]


def pick_pages(home, links, patterns):
    host = urlparse(home).netloc.replace('www.', '')
    pages = {}
    for h in links:
        u = urlparse(h.split('#')[0].split('?')[0])
        if u.netloc.replace('www.', '') != host:
            continue
        path = u.path.rstrip('/').lower()
        if not path or path in ('/', '/index'):
            continue
        for pat, ptype in patterns:
            if re.search(pat, path):
                depth = path.count('/')
                if ptype not in pages or depth < pages[ptype][1]:
                    pages[ptype] = (u.geturl(), depth)
                break
    return {t: v[0] for t, v in sorted(pages.items())}


def home_probe(home):
    from playwright.sync_api import sync_playwright
    with sync_playwright() as pw:
        try:
            br = pw.chromium.launch()
        except Exception:
            br = pw.chromium.launch(executable_path=(
                '/Applications/Brave Browser.app/Contents/MacOS/'
                'Brave Browser'))
        page = br.new_page(viewport={'width': 1440, 'height': 900})
        links, fp, blocked = [], {}, None
        try:
            r = page.goto(home, wait_until='domcontentloaded',
                          timeout=45000)
            try:
                page.wait_for_load_state('networkidle',
                                         timeout=10000)
            except Exception:
                pass
            if r and r.status in (403, 429, 503):
                blocked = f'http_{r.status}'
            for sel in DISMISS:
                try:
                    el = page.query_selector(sel)
                    if el and el.is_visible():
                        el.click(timeout=800)
                except Exception:
                    pass
            links = page.evaluate(LINK_JS)
            fp = page.evaluate(FINGERPRINT_JS)
        except Exception as e:
            blocked = str(e)[:120]
        br.close()
    return links, fp, blocked


def main():
    cfg = json.load(open(sys.argv[1]))
    max_pages = MAX_PAGES_PER_SITE
    if '--max-pages' in sys.argv:
        max_pages = int(sys.argv[sys.argv.index('--max-pages') + 1])
    report = {}
    for ent in cfg:
        home = ent['url'].rstrip('/') + '/'
        st = ent['site_type']
        pats = ([(re.compile(p).pattern, t)
                 for p, t in (ent.get('patterns') or [])]
                + DEFAULT_PATTERNS)
        links, fp, blocked = home_probe(home)
        pages = pick_pages(home, links, pats)
        print(f'{home}: {len(links)} links pages={list(pages)} '
              f'blocked={blocked}', flush=True)
        meta_paths = []
        per_site = {}
        todo = [('home', home)]
        # explicit page urls override discovery
        todo += [(t, ent['pages'][t]) for t in
                 (ent.get('pages') or {}) if ent['pages'][t]]
        have = {t for t, _ in todo}
        for t, u in sorted(pages.items()):
            if t not in have and len(todo) < max_pages:
                todo.append((t, u))
        for ptype, url in todo:
            slug = ingest_good.slugify(url)
            mp = os.path.join(OPERATOR, slug, 'meta.json')
            if os.path.exists(mp):
                m = json.load(open(mp))
                if m.get('capture_status') == 'ok':
                    per_site[ptype] = {'slug': slug, 'status': 'ok',
                                       'sections': len(
                                           m.get('sections') or []),
                                       'cached': True}
                    meta_paths.append(mp)
                    print(f'  {ptype} {url}: cached ok', flush=True)
                    continue
            s, meta, secs = ingest_good.ingest_url(
                url, note=f'operator canon {st} (page_type={ptype})',
                site_type=st, page_type=ptype, source='operator')
            n = ingest_good.bank(s)
            per_site[ptype] = {'slug': s,
                               'status': meta.get('capture_status'),
                               'reason': meta.get('capture_reason'),
                               'sections': len(secs), 'banked': n}
            meta_paths.append(mp)
            print(f'  {ptype} {url}: {meta.get("capture_status")} '
                  f'{len(secs)} sections', flush=True)
        for mp in meta_paths:
            try:
                meta = json.load(open(mp))
                meta['stack_fingerprint'] = fp
                json.dump(meta, open(mp, 'w'), indent=1)
            except Exception:
                pass
        report[home] = {'site_type': st, 'pages': per_site,
                        'blocked': blocked,
                        'astro': {'islands': fp.get('astro_islands'),
                                  'cid': fp.get('astro_cid'),
                                  'generator': fp.get('generator')}}
        print(f'{home}: DONE', flush=True)
        time.sleep(2.0)
    print('\n=== REPORT ===')
    print(json.dumps(report, indent=1))


if __name__ == '__main__':
    main()
