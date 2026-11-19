#!/usr/bin/env python3
"""Fast urllib crawl of lexingtonthemes.com/templates ->
_sources/lexington.json (tier: operator-endorsed — all templates
approved). SSR pages; robots allows. Per template: name, description,
viewport URL -> demo iframe src (lexdemos), Astro asset names
(js/css), animation components (classes/data attrs/scripts).
"""
import json
import os
import re
import time
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from html import unescape

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
OUT = os.path.join(ROOT, 'docs', 'machinery', 'design', 'patterns',
                   'data', 'operator', '_sources', 'lexington.json')
BASE = 'https://lexingtonthemes.com'
UA = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
                    'AppleWebKit/537.36 (KHTML, like Gecko) '
                    'Chrome/131.0 Safari/537.36'}
WORKERS = 6
COLLECTION = re.compile(r'astro-(tailwind|emdash|sanity)[a-z-]*'
                        r'-templates$|astro-emdash-templates$')


def fetch(url):
    req = urllib.request.Request(url, headers=UA)
    return urllib.request.urlopen(req, timeout=30).read().decode(
        'utf-8', 'replace')


def parse_template(t):
    url = BASE + t
    html = fetch(url)
    rec = {'template': t, 'template_url': url}
    m = re.search(r'<h1[^>]*>([^<]{1,120})', html)
    if m:
        rec['name'] = unescape(m.group(1)).strip()
    m = re.search(r'meta name="description" content="([^"]{0,500})"',
                  html)
    if m:
        rec['description'] = unescape(m.group(1)).strip()
    # price / category hints
    m = re.search(r'\$\s?(\d+)', html)
    if m:
        rec['price_usd'] = int(m.group(1))
    vp = re.search(r'href="(/viewports/[a-z0-9-]+)"', html)
    if vp:
        rec['viewport_url'] = BASE + vp.group(1)
        vhtml = fetch(BASE + vp.group(1))
        f = re.search(r'iframe[^>]*src="([^"]+)"', vhtml)
        if f:
            rec['demo_url'] = f.group(1)
        rec['demo_embeds'] = re.findall(
            r'iframe[^>]*src="([^"]+)"', vhtml)
    assets = sorted(set(re.findall(r'_astro/([A-Za-z0-9._-]+\.'
                                   r'(?:js|css))', html)))
    rec['astro_assets'] = assets[:25]
    # component/animation names leaking through class + script src
    raw = ' '.join(re.findall(r'class="([^"]+)"', html)) + ' ' + \
        ' '.join(assets)
    comps = sorted(set(re.findall(
        r'(rise|smooth[-_]?scroll|marquee|lenis|splide|swiper|embla|'
        r'gsap|reveal|parallax|morph|cursor|drawer|toast|modal|'
        r'accordion|tabs|carousel|slider|lightbox|video-player|'
        r'counter|animate[-_]?[a-z-]*|aos)', raw.lower())))
    rec['components'] = comps[:30]
    scripts = re.findall(r'src="([^"]+\.js[^"]*)"', html)
    rec['scripts'] = [s for s in scripts if '/_astro/' in s][:10]
    return rec


def main():
    html = fetch(BASE + '/templates')
    links = sorted(set(re.findall(r'href="(/templates/[a-z0-9-]+)"',
                                  html)))
    tpls = [t for t in links if not COLLECTION.search(t)]
    cols = [t for t in links if COLLECTION.search(t)]
    print(f'{len(tpls)} real templates, {len(cols)} collections',
          flush=True)
    # collections: pull their template links too (dedup)
    for c in cols:
        try:
            h = fetch(BASE + c)
            more = set(re.findall(
                r'href="(/templates/[a-z0-9-]+)"', h))
            new = [t for t in more
                   if t not in tpls and not COLLECTION.search(t)]
            tpls.extend(new)
        except Exception as e:
            print(f'  {c}: {e}', flush=True)
        time.sleep(0.4)
    tpls = sorted(set(tpls))
    print(f'{len(tpls)} unique real templates total', flush=True)
    data = {'source_url': BASE + '/templates',
            'fetched': time.strftime('%Y-%m-%d'),
            'tier': 'operator-endorsed (lexington)',
            'sites': []}
    recs = []
    with ThreadPoolExecutor(max_workers=WORKERS) as ex:
        for i, r in enumerate(ex.map(lambda t: safe(t), tpls)):
            recs.append(r)
            if (i + 1) % 10 == 0 or i == len(tpls) - 1:
                print(f'{i+1}/{len(tpls)}', flush=True)
                data['sites'] = recs
                os.makedirs(os.path.dirname(OUT), exist_ok=True)
                json.dump(data, open(OUT, 'w'), indent=1)
    data['sites'] = recs
    json.dump(data, open(OUT, 'w'), indent=1)
    ok = sum(1 for r in recs if r.get('demo_url'))
    print(f'DONE {len(recs)} templates, {ok} with demo URLs',
          flush=True)


def safe(t):
    try:
        return parse_template(t)
    except Exception as e:
        return {'template': t, 'error': str(e)[:150]}


if __name__ == '__main__':
    main()
