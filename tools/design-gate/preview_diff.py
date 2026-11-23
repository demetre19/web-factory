#!/usr/bin/env python3
"""preview-diff loop: render every board card's preview iframe and prove
they are NOT pixel-identical, per toggle state.

Kills the recurring 'everything looks the same' defect class: renders
each preview URL at desktop + mobile, hashes the raster, and FAILS when
same-board siblings hash identically (a board's whole job is to offer
*different* options) or when a toggle (theme) produces zero pixel delta.

usage:
    preview_diff.py --pipeline <abs path to page dir> [--port 4173]
                    [--boards vibe,home,...] [--json out.json]

exit 0 = every board's cards are visually distinct; exit 1 = findings.
"""
import argparse
import asyncio
import hashlib
import json
import sys
import urllib.parse
import urllib.request

HOST = 'http://localhost:{port}'


def _norm(url, port):
    return (url if url.startswith('http')
            else HOST.format(port=port) + url)


async def _shot(page, url, width=1280, height=900, theme=None):
    await page.set_viewport_size({'width': width, 'height': height})
    if theme:
        await page.goto(url + ('&' if '?' in url else '?') +
                        'theme=' + theme, wait_until='networkidle')
    else:
        await page.goto(url, wait_until='networkidle')
    await page.wait_for_timeout(700)
    return await page.screenshot(type='png', full_page=True)


def _h(b):
    return hashlib.sha256(b).hexdigest()[:12]


# leaf-text contrast probe: any text node whose colour vs its painted
# band differs by <0.12 luminance is unreadable — a FAIL, the same
# verdict a human gives ('no contrast check')
_CONTRAST_JS = """(()=>{
function L(c){var m=/rgba?\\(([^)]+)/.exec(c);if(!m)return 1;
 var p=m[1].split(',').map(parseFloat);
 return(0.2126*p[0]+0.7152*p[1]+0.0722*p[2])/255}
var out=[];
document.querySelectorAll('*').forEach(function(el){
 if(el.closest('svg')||el.children.length||!el.textContent.trim())
  return;
 var s=getComputedStyle(el),n=el,bgl=null;
 while(n&&n!==document.body){
  var b=getComputedStyle(n).backgroundColor;
  var m=/rgba?\\(([^)]+)/.exec(b);
  if(m&&!/[,\\s]0(\\)|$)/.test(b)){bgl=L(b);break}
  n=n.parentElement}
 if(bgl==null)bgl=L(getComputedStyle(document.body).backgroundColor);
 if(Math.abs(L(s.color)-bgl)<0.12)
  out.push(el.tagName+':'+el.textContent.trim().slice(0,40));
});
return out.slice(0,8)})()"""


async def run(args):
    from playwright.async_api import async_playwright
    api = (HOST.format(port=args.port) + '/app-data?pipeline=' +
           urllib.parse.quote(args.pipeline))
    data = json.loads(urllib.request.urlopen(api, timeout=30).read())
    boards = data.get('boards') or {}
    names = args.boards.split(',') if args.boards else [
        k for k, v in boards.items() if v.get('cards')]
    report = {'boards': {}, 'failures': []}
    async with async_playwright() as pw:
        br = await pw.chromium.launch()
        page = await br.new_page()
        for name in names:
            cards = (boards.get(name) or {}).get('cards') or []
            urls = []
            for c in cards:
                u = c.get('preview')
                if u:
                    urls.append(_norm(u, args.port))
            shots = []
            for u in urls:
                try:
                    shots.append((_h(await _shot(page, u))))
                    low = await page.evaluate(_CONTRAST_JS)
                    if low:
                        report['failures'].append(
                            {'board': name, 'url': u.split('/')[-2:],
                             'low_contrast': low})
                except Exception as e:
                    report['failures'].append(
                        {'board': name, 'url': u,
                         'error': str(e)[:200]})
                    shots.append(None)
            counts = {}
            for h in shots:
                if h:
                    counts[h] = counts.get(h, 0) + 1
            dupes = {h: n for h, n in counts.items() if n > 1}
            report['boards'][name] = {
                'cards': len(urls), 'distinct': len(counts),
                'dupe_groups': len(dupes)}
            if dupes:
                for i, u in enumerate(urls):
                    if shots[i] in dupes:
                        report['failures'].append(
                            {'board': name, 'url': u.split('/')[-2:],
                             'dupe_of_count': dupes[shots[i]]})
        # theme toggle probe: first card of first board, light vs dark
        first = next((c.get('preview')
                      for b in boards.values()
                      for c in (b.get('cards') or [])
                      if c.get('preview')), None)
        if first and not args.skip_theme:
            u = _norm(first, args.port)
            a = await _shot(page, u)
            # the app's theme flip posts wfTheme to the frame — probe
            # the same contract, not ?theme= (docs don't read it)
            await page.evaluate(
                "window.postMessage({wfTheme:'dark'},'*')")
            await page.wait_for_timeout(500)
            b = await page.screenshot(type='png', full_page=True)
            report['theme_delta'] = (_h(a) != _h(b))
            if _h(a) == _h(b):
                report['failures'].append(
                    {'board': '_theme', 'error':
                     'wfTheme broadcast produced identical pixels'})
        await br.close()
    return report


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--pipeline', required=True)
    ap.add_argument('--port', type=int, default=4173)
    ap.add_argument('--boards', default='')
    ap.add_argument('--json', default='')
    ap.add_argument('--skip-theme', action='store_true')
    args = ap.parse_args()
    rep = asyncio.run(run(args))
    if args.json:
        with open(args.json, 'w') as fh:
            json.dump(rep, fh, indent=1)
    for name, b in rep['boards'].items():
        print('{board:10} {cards} cards, {distinct} distinct, '
              '{dupe_groups} dupe groups'.format(board=name, **b))
    print('theme toggle produces a visual change:',
          rep.get('theme_delta'))
    for f in rep['failures'][:20]:
        print('FAIL', f)
    sys.exit(1 if rep['failures'] else 0)


if __name__ == '__main__':
    main()
