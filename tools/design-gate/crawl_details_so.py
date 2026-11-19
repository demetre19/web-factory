#!/usr/bin/env python3
"""Crawl details.so/inspo -> _sources/details-so.json.

Strategy (listing grid is Pro-gated beyond 8 cards; detail pages are
open and enumerated in the sitemap):
1. sitemap-0.xml + video-sitemap.xml -> all /inspo/<slug>-<hash> detail
   URLs (+ title, description, big/small mp4 from video sitemap).
2. All /inspo/category/<cat> SSR pages -> free card mapping
   (detail link -> category).
3. Threaded fetch of every detail page (robots allows; /api/ untouched):
   a.visit href (full path, tracking params stripped), tag chips
   (primary section tag first), site slug, h1, date.
4. Merge -> details-so.json. Entries keyed by detail page.
"""
import json
import os
import re
import sys
import time
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from urllib.parse import urlparse, urlunparse, parse_qsl, urlencode

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
OUT = os.path.join(ROOT, 'docs', 'machinery', 'design', 'patterns',
                   'data', 'operator', '_sources', 'details-so.json')
CACHE = os.path.join(ROOT, 'docs', 'machinery', 'design', 'patterns',
                     'data', 'operator', '_sources', '.details-cache')
BASE = 'https://www.details.so'
UA = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
                    'AppleWebKit/537.36 (KHTML, like Gecko) '
                    'Chrome/131.0 Safari/537.36'}
WORKERS = 8


def fetch(url, timeout=30):
    req = urllib.request.Request(url, headers=UA)
    return urllib.request.urlopen(req, timeout=timeout).read().decode(
        'utf-8', 'replace')


def strip_tracking(url):
    p = urlparse(url)
    qs = [(k, v) for k, v in parse_qsl(p.query)
          if not (k == 'ref' or k.startswith('utm_'))]
    return urlunparse(p._replace(query=urlencode(qs)))


def sitemap_detail_urls():
    x = fetch(BASE + '/sitemap-0.xml')
    urls = [u for u in re.findall(r'<loc>([^<]+)</loc>', x)
            if re.search(r'/inspo/[a-z0-9-]+-[a-z0-9]{6}$', u)]
    return sorted(set(urls))


def video_sitemap():
    x = fetch(BASE + '/video-sitemap.xml')
    out = {}
    for m in re.finditer(r'<url>(.*?)</url>', x, re.S):
        e = m.group(1)
        loc = re.search(r'<loc>([^<]+)</loc>', e)
        if not loc:
            continue
        r = {'detail_url': loc.group(1)}
        for tag, key in [('video:title', 'name'),
                         ('video:description', 'video_description'),
                         ('video:publication_date', 'published')]:
            t = re.search(r'<%s>([^<]*)' % tag, e)
            if t:
                r[key] = re.sub(r'&apos;', "'", t.group(1)).strip()
        t = re.search(r'<video:content_loc>([^<]+)', e)
        if t:
            r['video'] = t.group(1)
        t = re.search(r'<video:thumbnail_loc>([^<]+)', e)
        if t:
            r['thumbnail'] = t.group(1)
        out[loc.group(1)] = r
    return out


def category_map():
    cats = sorted(set(re.findall(r'/inspo/category/([a-z0-9-]+)',
                                 fetch(BASE + '/inspo'))))
    print(f'{len(cats)} categories', flush=True)
    m = {}  # detail path -> set(cats)
    for ci, cat in enumerate(cats):
        try:
            html = fetch(f'{BASE}/inspo/category/{cat}')
            for h in re.findall(r'href="(/inspo/[a-z0-9-]+-[a-z0-9]{6})"',
                                html):
                m.setdefault(h, set()).add(cat)
        except Exception as e:
            print(f'  {cat}: ERROR {e}', flush=True)
        if ci % 10 == 0:
            print(f'  cats {ci+1}/{len(cats)}', flush=True)
        time.sleep(0.3)
    return m


def parse_detail(url, html):
    r = {'detail_url': url}
    m = re.search(r'class="visit"[^>]*href="([^"]+)"', html) or \
        re.search(r'href="([^"]+)"[^>]*class="visit"', html) or \
        re.search(r'href="(https?://[^"]+)"[^>]*>\s*Visit', html)
    if m:
        r['url'] = strip_tracking(m.group(1).replace('&amp;', '&'))
    i = html.find('data-inspo-tags-scroller')
    if i >= 0:
        seg = html[i:i + 2500]
        r['tags'] = [t for t in
                     re.findall(r'/inspo/category/([a-z0-9-]+)', seg)]
        if r['tags']:
            r['primary_tag'] = r['tags'][0]
    m = re.search(r'<h1[^>]*>([^<]{1,200})', html)
    if m:
        r['name'] = m.group(1).strip()
    m = re.search(r'/inspo/site/([a-z0-9-]+)', html)
    if m:
        r['site_slug'] = m.group(1)
    m = re.search(r'datetime="([^"]+)"', html)
    if m:
        r['date'] = m.group(1)
    vids = re.findall(
        r'(https://inspiration-library\.b-cdn\.net/inspo-video/'
        r'(?:big|small)-[^"\']+\.mp4)', html)
    if vids:
        r.setdefault('video',
                     next((v for v in vids if '/big-' in v), vids[0]))
    return r


def crawl_detail(url):
    slug = url.rsplit('/', 1)[-1]
    cp = os.path.join(CACHE, slug + '.html')
    try:
        if os.path.exists(cp):
            html = open(cp).read()
        else:
            html = fetch(url)
            open(cp, 'w').write(html)
            time.sleep(0.15)
        return parse_detail(url, html)
    except Exception as e:
        return {'detail_url': url, 'url_error': str(e)[:200]}


def main():
    os.makedirs(CACHE, exist_ok=True)
    det = sitemap_detail_urls()
    vs = video_sitemap()
    det = sorted(set(det) | set(vs))
    print(f'{len(det)} detail pages '
          f'({len(vs)} with video-sitemap rows)', flush=True)
    cmap = category_map()
    print(f'{len(cmap)} detail pages seen in free category cards',
          flush=True)

    recs = []
    with ThreadPoolExecutor(max_workers=WORKERS) as ex:
        for i, r in enumerate(ex.map(crawl_detail, det)):
            v = vs.get(r['detail_url'])
            if v:
                for k in ('name', 'video_description', 'published',
                          'video', 'thumbnail'):
                    r.setdefault(k, v.get(k))
            path = urlparse(r['detail_url']).path
            if path in cmap:
                r['categories'] = sorted(cmap[path])
            recs.append(r)
            if (i + 1) % 200 == 0 or i == len(det) - 1:
                print(f'{i+1}/{len(det)} fetched', flush=True)
                save(recs)
    save(recs)
    ok = sum(1 for r in recs if r.get('url'))
    print(f'DONE {len(recs)} entries, {ok} with site URL', flush=True)


def save(recs):
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    json.dump({
        'source_url': BASE + '/inspo',
        'fetched': time.strftime('%Y-%m-%d'),
        'tier': 'operator-endorsed (details.so)',
        'note': 'one record per featured SECTION entry (detail page); '
                'url = featured page via a.visit (full path kept); '
                'primary_tag = section exemplar label; '
                'video = details.so-captured interaction clip',
        'sites': recs}, open(OUT, 'w'), indent=1)


if __name__ == '__main__':
    main()
