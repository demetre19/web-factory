#!/usr/bin/env python3
"""Crawl astro.build/showcase -> _sources/astro-showcase.json
(tier: candidate — NOT canon). Paginated /showcase/N/.
Per entry: name, URL, category (if shown).
"""
import json
import os
import re
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
OUT = os.path.join(ROOT, 'docs', 'machinery', 'design', 'patterns',
                   'data', 'operator', '_sources',
                   'astro-showcase.json')
BASE = 'https://astro.build'
CARD_JS = """() => {
  const main = document.querySelector('main#main')
              || document.querySelector('main') || document.body;
  return Array.from(main.querySelectorAll('a[href^="http"]'))
    .filter(a => !/astro.build|github.com.withastro|x.com|linkedin|reddit|youtube|webtoo|opencollective/.test(a.href))
    .map(a => {
      const img = a.querySelector('img');
      const txt = (a.querySelector('h2,h3,figcaption,[class*=title]')
                   ||{}).textContent || img && img.alt ||
                  a.textContent;
      const card = a.closest('article,li') || a;
      const cat = Array.from(card.querySelectorAll(
        '[class*=tag],[class*=badge],[class*=cat]'))
        .map(e=>e.textContent.trim()).filter(Boolean).slice(0,4);
      return {url: a.href, name: txt.trim().slice(0,120),
              categories: cat};
    }).filter(c => c.name);
}"""

GENERIC_JS = """() => ({
  links: Array.from(document.querySelectorAll('a'))
    .map(a => ({h: a.getAttribute('href'),
                t: a.textContent.trim().slice(0, 80)}))
    .filter(l => l.h && !l.h.startsWith('#')),
  body: document.body.innerText.slice(0, 500)})"""


def main():
    from playwright.sync_api import sync_playwright
    max_pages = 40
    if '--max-pages' in sys.argv:
        max_pages = int(sys.argv[sys.argv.index('--max-pages') + 1])
    start_page = 1
    if '--start-page' in sys.argv:
        start_page = int(
            sys.argv[sys.argv.index('--start-page') + 1])
    data = {'source_url': BASE + '/showcase/',
            'fetched': time.strftime('%Y-%m-%d'),
            'tier': 'candidate', 'sites': []}
    if os.path.exists(OUT):
        data = json.load(open(OUT))
    seen = {s['url'] for s in data['sites'] if s.get('url')}
    with sync_playwright() as pw:
        try:
            br = pw.chromium.launch()
        except Exception:
            br = pw.chromium.launch(executable_path=(
                '/Applications/Brave Browser.app/Contents/MacOS/'
                'Brave Browser'))
        page = br.new_page(viewport={'width': 1440, 'height': 900})
        for p in range(start_page, start_page + max_pages):
            url = BASE + ('/showcase/' if p == 1
                          else f'/showcase/{p}/')
            try:
                r = page.goto(url, wait_until='domcontentloaded',
                              timeout=45000)
                page.wait_for_timeout(1500)
                cards = page.evaluate(CARD_JS)
                new = [c for c in cards
                       if c['url'] not in seen]
                for c in new:
                    data['sites'].append(
                        {'name': c['name'], 'url': c['url'],
                         'categories': c.get('categories') or [],
                         'page': p})
                    seen.add(c['url'])
                print(f'page {p}: {len(cards)} cards, '
                      f'{len(new)} new (status '
                      f'{r.status if r else "?"})', flush=True)
                if len(cards) == 0 or r is None or r.status >= 400:
                    break
                if len(new) == 0 and p > 1:
                    break
            except Exception as e:
                print(f'page {p}: ERROR {e}', flush=True)
                break
            json.dump(data, open(OUT, 'w'), indent=1)
            time.sleep(2.0)
        br.close()
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    json.dump(data, open(OUT, 'w'), indent=1)
    print(f'DONE {len(data["sites"])} showcase entries', flush=True)


if __name__ == '__main__':
    main()
