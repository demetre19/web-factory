#!/usr/bin/env python3
"""Crawl siteinspire.com listing -> _sources/siteinspire.json.

Real browser (Cloudflare 429s plain fetch), real pagination
/websites/page/N newest-first, ~1 page per 2s. Per card: name, visit
URL (?ref=siteinspire stripped), detail path. Per detail page:
designer/studio credit, added-date, style/type/subject tag links.
usage: crawl_siteinspire.py [--max-pages N] [--out path]
"""
import json
import os
import re
import sys
import time
from urllib.parse import urlparse, urlunparse, parse_qsl, urlencode

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
OUT = os.path.join(ROOT, 'docs', 'machinery', 'design', 'patterns',
                   'data', 'operator', '_sources', 'siteinspire.json')
BASE = 'https://www.siteinspire.com'

CARD_JS = """() => Array.from(document.querySelectorAll(
  '[data-testid="website-card"]')).map(c => ({
    name: (c.querySelector('article')||{getAttribute:()=>''})
          .getAttribute('aria-label').replace('Website card for ',''),
    detail: (Array.from(c.querySelectorAll('a'))
             .map(a=>a.getAttribute('href'))
             .find(h=>h && h.startsWith('/website/')) || null),
    url: ((Array.from(c.querySelectorAll('a[aria-label^="Visit "]'))[0]
           ||{}).href || null),
    card_text: c.innerText.replace(/\\n+/g,' | ').slice(0,300),
  }))"""

DETAIL_JS = """() => {
  const links = Array.from(document.querySelectorAll('a'));
  const tag = (l, kind) => l.filter(a =>
    a.getAttribute('href') &&
    a.getAttribute('href').includes('/websites/category/' + kind));
  const text = document.body.innerText;
  return {
    title: document.title,
    h1: (document.querySelector('h1')||{textContent:''}).textContent,
    // 'Added X ago' or date line, plus credits
    text: text.slice(0, 1600),
    cats: links.map(a => ({h: a.getAttribute('href'),
                           t: a.textContent.trim()}))
      .filter(l => l.h && /\\/websites\\//.test(l.h)
                   && !/popular\\//.test(l.h))
      .slice(0, 25),
    visit: (document.querySelector('a[aria-label^="Visit "]')||{})
           .href || null,
    added: ((text.match(/[Aa]dded[^\\n]{0,80}/) || [])[0] || null),
    credits: ((text.match(/[Dd]esigned by[^\\n]{0,120}/) || [])[0] ||
              (text.match(/[Bb]y[^\\n]{0,120}/) || [])[0] || null),
    time_el: Array.from(document.querySelectorAll('time'))
      .map(t => t.getAttribute('datetime') || t.textContent),
  };
}"""


def strip_ref(url):
    if not url:
        return url
    p = urlparse(url)
    qs = [(k, v) for k, v in parse_qsl(p.query)
          if k != 'ref' and not k.startswith('utm_')]
    return urlunparse(p._replace(query=urlencode(qs)))


def main():
    from playwright.sync_api import sync_playwright
    max_pages = 4  # ~100 cards newest-first
    if '--max-pages' in sys.argv:
        max_pages = int(sys.argv[sys.argv.index('--max-pages') + 1])
    start_page = 1
    if '--start-page' in sys.argv:
        start_page = int(
            sys.argv[sys.argv.index('--start-page') + 1])
    out = OUT
    if '--out' in sys.argv:
        out = sys.argv[sys.argv.index('--out') + 1]
    data = {'source_url': BASE + '/websites',
            'fetched': time.strftime('%Y-%m-%d'),
            'tier': 'siteinspire (curated index)',
            'sites': []}
    if os.path.exists(out):
        data = json.load(open(out))
    seen = {s['detail_url'] for s in data['sites']}
    with sync_playwright() as pw:
        try:
            br = pw.chromium.launch()
        except Exception:
            br = pw.chromium.launch(executable_path=(
                '/Applications/Brave Browser.app/Contents/MacOS/'
                'Brave Browser'))
        page = br.new_page(viewport={'width': 1440, 'height': 900})
        new_cards = []
        for p in range(start_page, start_page + max_pages):
            url = BASE + ('/websites' if p == 1
                          else f'/websites/page/{p}')
            try:
                r = page.goto(url, wait_until='domcontentloaded',
                              timeout=45000)
                page.wait_for_timeout(1200)
                cards = page.evaluate(CARD_JS)
                cards = [c for c in cards if c['detail']]
                new_cards.extend(
                    c for c in cards
                    if BASE + c['detail'] not in seen)
                print(f'page {p}: {len(cards)} cards '
                      f'(status {r.status if r else "?"})', flush=True)
            except Exception as e:
                print(f'page {p}: ERROR {e}', flush=True)
                break
            time.sleep(2.0)
        print(f'{len(new_cards)} new cards -> detail pages',
              flush=True)
        for i, c in enumerate(new_cards):
            rec = {'name': c['name'],
                   'url': strip_ref(c['url']),
                   'detail_url': BASE + c['detail'],
                   'card_text': c['card_text']}
            try:
                page.goto(BASE + c['detail'],
                          wait_until='domcontentloaded',
                          timeout=45000)
                page.wait_for_timeout(900)
                d = page.evaluate(DETAIL_JS)
                rec['visit_url'] = strip_ref(d.get('visit'))
                if rec['visit_url']:
                    rec['url'] = rec['visit_url']
                rec['added'] = d.get('added')
                rec['date'] = (d['time_el'][0]
                               if d.get('time_el') else None)
                rec['credits'] = d.get('credits')
                rec['tags'] = [t['t'] for t in
                               d.get('cats') or []][:20]
                rec['tag_links'] = [t['h'] for t in
                                    d.get('cats') or []][:20]
            except Exception as e:
                rec['detail_error'] = str(e)[:150]
            data['sites'].append(rec)
            if (i + 1) % 10 == 0 or i == len(new_cards) - 1:
                json.dump(data, open(out, 'w'), indent=1)
                print(f'details {i+1}/{len(new_cards)}', flush=True)
            time.sleep(1.6)
        br.close()
    json.dump(data, open(out, 'w'), indent=1)
    print(f'DONE {len(data["sites"])} site records -> {out}',
          flush=True)


if __name__ == '__main__':
    main()
