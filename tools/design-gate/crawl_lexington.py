"""Crawl lexingtonthemes.com/templates -> _sources/lexington.json
(tier: operator-endorsed — all Lexington templates approved by
default; contributes principles + look). Each template page has a
(/viewports/<slug>) embedding a live demo (lexdemos.com). Resolve the
demo URL, record name/category/description + Astro asset/component
names leaked via script/style filenames.
"""
import json
import os
import re
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
OUT = os.path.join(ROOT, 'docs', 'machinery', 'design', 'patterns',
                   'data', 'operator', '_sources', 'lexington.json')
BASE = 'https://lexingtonthemes.com'

TPL_JS = """() => Array.from(
  document.querySelectorAll('a[href*="/templates/"]'))
  .map(a => a.getAttribute('href'))
  .filter(h => /\\/templates\\/[a-z0-9-]+\\/?$/.test(h)
               && !/\\/$/.test(h.split('?')[0]) || true)
"""

CARD_JS = """() => Array.from(new Set(
  Array.from(document.querySelectorAll('a[href*="/templates/"]'))
    .map(a => a.getAttribute('href'))
    .filter(h => /^\\/templates\\/[a-z0-9-]+$/.test(h))))"""

TPL_PAGE_JS = """() => {
  const h1 = (document.querySelector('h1')||{textContent:''})
    .textContent.trim();
  const desc = ((document.querySelector(
    'meta[name="description"]')||{}).content || '') ||
    document.body.innerText.slice(0, 300);
  const vp = Array.from(document.querySelectorAll('a[href]'))
    .map(a => a.getAttribute('href'))
    .find(h => h && /\\/viewports\\//.test(h));
  const scripts = Array.from(document.scripts)
    .map(s => s.src).filter(s => s.includes('/_astro/'));
  const styles = Array.from(
    document.querySelectorAll('link[rel=stylesheet]'))
    .map(l => l.href).filter(h => h.includes('/_astro/'));
  const comps = Array.from(new Set(
    Array.from(document.querySelectorAll('*')).flatMap(el =>
      Array.from(el.attributes || [])
        .map(at => at.name)
        .filter(n => /rise|scroll|anim|reveal|marquee|smooth|motion/
          .test(n))))).slice(0, 30);
  return {h1, desc: desc.slice(0, 400), viewport: vp,
          astro_scripts: scripts.slice(0, 20),
          astro_styles: styles.slice(0, 20), components: comps};
}"""

IFRAME_JS = """() => Array.from(
  document.querySelectorAll('iframe')).map(f => f.src)"""


def main():
    from playwright.sync_api import sync_playwright
    data = {'source_url': BASE + '/templates',
            'fetched': time.strftime('%Y-%m-%d'),
            'tier': 'operator-endorsed (lexington)', 'sites': []}
    if os.path.exists(OUT):
        data = json.load(open(OUT))
    seen = {s['template'] for s in data['sites'] if s.get('template')}
    with sync_playwright() as pw:
        try:
            br = pw.chromium.launch()
        except Exception:
            br = pw.chromium.launch(executable_path=(
                '/Applications/Brave Browser.app/Contents/MacOS/'
                'Brave Browser'))
        page = br.new_page(viewport={'width': 1440, 'height': 900})
        page.goto(BASE + '/templates', wait_until='domcontentloaded',
                  timeout=45000)
        page.wait_for_timeout(2000)
        tpls = page.evaluate(CARD_JS)
        print(f'{len(tpls)} template links', flush=True)
        for i, t in enumerate(tpls):
            if t in seen:
                continue
            rec = {'template': t,
                   'template_url': BASE + t}
            try:
                page.goto(BASE + t, wait_until='domcontentloaded',
                          timeout=45000)
                page.wait_for_timeout(1200)
                d = page.evaluate(TPL_PAGE_JS)
                rec.update({'name': d['h1'],
                            'description': d['desc'],
                            'viewport': d['viewport'],
                            'astro_scripts': d['astro_scripts'],
                            'astro_styles': d['astro_styles'],
                            'components': d['components']})
                if d['viewport']:
                    vp = d['viewport']
                    vp = vp if vp.startswith('http') else BASE + vp
                    page.goto(vp, wait_until='domcontentloaded',
                              timeout=45000)
                    page.wait_for_timeout(1500)
                    fr = page.evaluate(IFRAME_JS)
                    ext = [u for u in fr + [page.url]
                           if 'lexdemos' in (u or '')
                           or ('details.so' not in (u or '')
                               and 'lexingtonthemes' not in (u or ''))]
                    rec['demo_url'] = next(
                        (u for u in fr if u), None) or page.url
                    rec['frames'] = fr
            except Exception as e:
                rec['error'] = str(e)[:150]
            data['sites'].append(rec)
            seen.add(t)
            print(f'[{i+1}/{len(tpls)}] {t}: '
                  f'demo={rec.get("demo_url")}', flush=True)
            json.dump(data, open(OUT, 'w'), indent=1)
            time.sleep(2.0)
        br.close()
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    json.dump(data, open(OUT, 'w'), indent=1)
    print(f'DONE {len(data["sites"])} templates', flush=True)


if __name__ == '__main__':
    main()
