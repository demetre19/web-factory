#!/usr/bin/env python3
"""Med-spa vertical operator ingest — home + key page-type exemplars
(service/treatment, about, contact/booking, pricing) per site,
site_type=med-spa, + Astro fingerprint on each meta.
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

SITES = [
    'https://mdconsultingny.com/',
    'https://www.drvaesthetics.com/',
    'https://facemedstore.com/',
    'https://jcsignatureaesthetics.com/',
    'https://newbeautycompany.com/',
]

# path keyword -> page_type (first match wins)
PAGE_PATTERNS = [
    (r'/(book|booking|schedule|appoint)', 'appointment'),
    (r'/(contact|get-in-touch|reach-us)', 'contact'),
    (r'/(pricing|price-list|membership|packages|plans)', 'pricing'),
    (r'/(about|our-story|team|staff|provider|meet|doctor)', 'about'),
    (r'/(service|treatment|procedure|inject|facial|laser|peel|'
     r'botox|filler|skin|body|wellness|menu)', 'service-detail'),
    (r'/(before-after|gallery|results)', 'work-index'),
    (r'/(blog|journal|news|learn)', 'article'),
]
MAX_PAGES_PER_SITE = 5

LINK_JS = """() => Array.from(document.querySelectorAll('a[href]'))
  .map(a => a.href)
  .filter(h => h && !h.startsWith('mailto:') && !h.startsWith('tel:'))
"""

FINGERPRINT_JS = """() => ({
  astro_cid: document.querySelectorAll('[data-astro-cid]').length,
  astro_islands: document.querySelectorAll('astro-island').length,
  astro_scripts: Array.from(document.scripts).filter(s =>
    s.src && s.src.includes('_astro')).map(s => s.src).slice(0, 10),
  astro_static: !!document.querySelector('meta[name="generator"]')
    && /astro/i.test(document.querySelector(
        'meta[name="generator"]').content),
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


def pick_pages(home, links):
    host = urlparse(home).netloc.replace('www.', '')
    pages = {}
    for h in links:
        u = urlparse(h.split('#')[0].split('?')[0])
        if u.netloc.replace('www.', '') != host:
            continue
        path = u.path.rstrip('/').lower()
        if not path or path in ('/', '/index', ''):
            continue
        for pat, ptype in PAGE_PATTERNS:
            if re.search(pat, path):
                depth = path.count('/')
                # prefer shallower canonical page over deep subpages
                if ptype not in pages or depth < pages[ptype][1]:
                    pages[ptype] = (u.geturl(), depth)
                break
    return {t: v[0] for t, v in sorted(pages.items())}


def fingerprint(home, mp_map):
    """Open home once, gather internal links + astro fingerprint;
    write fingerprint onto each meta.json we produced."""
    from playwright.sync_api import sync_playwright
    with sync_playwright() as pw:
        try:
            br = pw.chromium.launch()
        except Exception:
            br = pw.chromium.launch(executable_path=(
                '/Applications/Brave Browser.app/Contents/MacOS/'
                'Brave Browser'))
        page = br.new_page(viewport={'width': 1440, 'height': 900})
        try:
            page.goto(home, wait_until='domcontentloaded',
                      timeout=45000)
            try:
                page.wait_for_load_state('networkidle',
                                         timeout=10000)
            except Exception:
                pass
            links = page.evaluate(LINK_JS)
            fp = page.evaluate(FINGERPRINT_JS)
        except Exception as e:
            print(f'{home}: fingerprint nav error {e}', flush=True)
            br.close()
            return {}, {}
        br.close()
    for mp in mp_map:
        try:
            meta = json.load(open(mp))
            meta['stack_fingerprint'] = fp
            json.dump(meta, open(mp, 'w'), indent=1)
        except Exception:
            pass
    return links, fp


def main():
    report = {}
    for site in SITES:
        home = site.rstrip('/') + '/'
        per_site = {}
        # discover pages + fingerprint BEFORE ingest (meta files
        # written after) — collect meta paths to annotate.
        links, fp = fingerprint(home, [])
        pages = pick_pages(home, links)
        print(f'{home}: {len(links)} links, pages={list(pages)}',
              flush=True)
        meta_paths = []
        todo = [('home', home)] + list(
            sorted(pages.items()))[:MAX_PAGES_PER_SITE - 1]
        for ptype, url in todo:
            slug = ingest_good.slugify(url)
            mp = os.path.join(OPERATOR, slug, 'meta.json')
            if os.path.exists(mp):
                m = json.load(open(mp))
                if m.get('capture_status') == 'ok':
                    print(f'  {ptype} {url}: cached ok', flush=True)
                    per_site[ptype] = {
                        'slug': slug, 'status': 'ok',
                        'sections': len(m.get('sections') or []),
                        'cached': True}
                    meta_paths.append(mp)
                    continue
            s, meta, secs = ingest_good.ingest_url(
                url,
                note='med-spa vertical operator canon '
                     f'(page_type={ptype})',
                site_type='med-spa',
                page_type=ptype, source='operator')
            n = ingest_good.bank(s)
            per_site[ptype] = {
                'slug': s, 'status': meta.get('capture_status'),
                'reason': meta.get('capture_reason'),
                'sections': len(secs), 'banked': n}
            meta_paths.append(mp)
            print(f'  {ptype} {url}: {meta.get("capture_status")} '
                  f'{len(secs)} sections', flush=True)
        # annotate fingerprint on all metas we own
        for mp in meta_paths:
            try:
                meta = json.load(open(mp))
                meta['stack_fingerprint'] = fp
                json.dump(meta, open(mp, 'w'), indent=1)
            except Exception:
                pass
        report[home] = {
            'site_type': 'med-spa',
            'pages': per_site,
            'astro': {
                'islands': fp.get('astro_islands'),
                'cid_count': fp.get('astro_cid'),
                'generator': fp.get('generator')}}
        print(f'{home}: DONE {json.dumps(per_site)}', flush=True)
        time.sleep(2.0)
    print('\n=== REPORT ===')
    print(json.dumps(report, indent=1))


if __name__ == '__main__':
    main()
