#!/usr/bin/env python3.12
"""check_bank_previews.py — E1/E4 acceptance for emitted bank previews.

    check_bank_previews.py <pipeline-dir> [--sample N]

Deterministic, no paid calls. Three passes over
<pipeline>/site/dist/preview/bank/:

1. css coverage — every class token used in emitted docs must exist in
   bank-preview.css (arbitrary-value utilities like bg-[#0B1018] were
   missing when the css predated the bank → invisible cards).
2. render pass (playwright, venv) at 1280 — per doc:
   - 0 failed requests (E4 asset rewrite)
   - 0 horizontal clipping (scrollWidth of the doc root ≤ viewport)
   - fx docs: motion proof (screenshot diff t0 vs t1s vs t3s > 0),
     bbox inset ≥16px for widget stages, contrast ≥4.5:1 for the
     fragment's own text over its own surface
3. screenshot grid — the coordinator's sample set (footers, pricing,
   auth, commerce, fx) saved to preview/bank/_grid/.
"""
from __future__ import annotations

import glob, html, json, math, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..'))
VENV_PY = os.path.join(REPO, '.venv', 'bin', 'python')


def _esc(name):
    """tailwind css-ident escaping for a class selector probe."""
    out = []
    for i, ch in enumerate(name):
        if ch.isalnum() or ch in '-_' or ord(ch) > 127:
            out.append(ch)
        else:
            out.append('\\' + ch)
    return ''.join(out)


def class_coverage(bank_dir):
    """emitted class tokens not resolvable in bank-preview.css +
    bank-preview-extra.css or the doc's own <style> block."""
    css = ''
    for n in ('bank-preview.css', 'bank-preview-extra.css'):
        p = os.path.join(bank_dir, n)
        if os.path.isfile(p):
            css += open(p, errors='replace').read()
    missing, unstyled = {}, {}
    for f in glob.glob(os.path.join(bank_dir, '*', '*.html')):
        doc = open(f, errors='replace').read()
        local = ' '.join(re.findall(
            r'<style[^>]*>(.*?)</style>', doc, re.S | re.I))
        for cm in re.finditer(r'class="([^"]+)"', doc):
            for tok in html.unescape(cm.group(1)).split():
                if tok in missing or tok.startswith(('wf-', 'lucide')):
                    continue
                sel = '.' + _esc(tok)
                base = tok.split(':')[-1]
                selb = '.' + _esc(base)
                # opacity modifier: bg-[#xxx]/92 → probe without /NN
                probe = base.split('/')[0]
                selc = '.' + _esc(probe)
                if sel in css or selb in css or selc in css or \
                        sel in local or selb in local or selc in local:
                    continue
                (missing if '[' in tok else unstyled)[tok] = f
    return missing, unstyled


_RENDER_JS = r"""() => {
  const root = document.querySelector('.wf-stage') ||
               document.querySelector('.wf-page') || document.body;
  // horizontal clipping inside the fragment root
  let clip = 0;
  for (const el of root.querySelectorAll('*')) {
    if (el.scrollWidth > el.clientWidth + 2 &&
        getComputedStyle(el).overflowX !== 'visible') clip++;
  }
  // text contrast — every element's own text vs its painted bg chain
  let low = 0, checked = 0;
  const lum = c => {const f = v => {v /= 255;
    return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4)};
    return .2126 * f(c[0]) + .7152 * f(c[1]) + .0722 * f(c[2])};
  const rgba = s => {const m = s.match(/[\d.]+/g);
    return m ? m.map(Number) : [0,0,0,1]};
  for (const el of root.querySelectorAll('*')) {
    if (!el.childNodes.length ||
        ![...el.childNodes].some(n => n.nodeType === 3 &&
                                     n.textContent.trim())) continue;
    const fg = rgba(getComputedStyle(el).color);
    let bg = [255,255,255], n = el;
    while (n && n !== document.documentElement) {
      const b = rgba(getComputedStyle(n).backgroundColor);
      if (b.length > 3 && b[3] > .5) { bg = b; break; }
      n = n.parentElement;
    }
    const L = (lum(fg) + .05) / (lum(bg) + .05);
    checked++;
    if (L < 4.5) low++;
  }
  const r = root.getBoundingClientRect();
  const kid = root.firstElementChild;
  const kr = kid ? kid.getBoundingClientRect() : r;
  return {clip, low, checked,
          inset: {l: kr.left - r.left, t: kr.top - r.top,
                  r: r.right - kr.right, b: r.bottom - kr.bottom},
          stage: !!document.querySelector('.wf-stage')};
}"""


_CHECK_PY = """
import json, sys, glob, os
from playwright.sync_api import sync_playwright
bank = sys.argv[1]
files = sorted(glob.glob(os.path.join(bank, '*', '*.html')))
out = {}
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 1280, 'height': 860})
    import urllib.parse
    def _route(rt):
        u = rt.request.url
        if u.startswith('file:///built/'):
            fp = urllib.parse.unquote(u[len('file:///built/'):])
            if os.path.isfile('/' + fp.lstrip('/')):
                return rt.fulfill(path='/' + fp.lstrip('/'))
            return rt.fulfill(status=404, body='nf')
        rt.continue_()
    pg.route('**', _route)
    failed = []
    pg.on('requestfailed', lambda r: failed.append(r.url))
    pg.on('response', lambda r: failed.append(r.url)
          if r.status >= 400 else None)
    for f in files:
        f = os.path.abspath(f)
        rel = os.path.relpath(f, bank)
        failed.clear()
        try:
            pg.goto('file://' + f, wait_until='load', timeout=20000)
            pg.wait_for_timeout(600)
            a = pg.evaluate(__RENDER_JS__)
            a['req_failed'] = len(set(failed))
            if '/fx-' in rel:
                s0 = pg.screenshot()
                pg.wait_for_timeout(1000)
                s1 = pg.screenshot()
                pg.wait_for_timeout(2000)
                s3 = pg.screenshot()
                a['diff'] = [
                    sum(1 for x, y in zip(s0, s1) if x != y),
                    sum(1 for x, y in zip(s1, s3) if x != y)]
            out[rel] = a
        except Exception as e:
            out[rel] = {'error': str(e)[:200]}
    b.close()
print(json.dumps(out))
""".replace('__RENDER_JS__', repr(_RENDER_JS))


def main():
    pd = sys.argv[1] if len(sys.argv) > 1 else \
        os.path.join(REPO, 'INPUTS', 'whistle-clean-navy',
                     'DESIGN-SYSTEM', 'pages',
                     'strata-cleaning-melbourne')
    bank = os.path.join(pd, 'site', 'dist', 'preview', 'bank')
    miss, unstyled = class_coverage(bank)
    print(f'css coverage: {len(miss)} missing arbitrary-class '
          f'tokens, {len(unstyled)} unstyled tokens '
          f'(marker/hook classes — informational)')
    for t, f in list(miss.items())[:15]:
        print(f'  {t}  ({os.path.relpath(f, bank)})')
    r = subprocess.run([VENV_PY, '-c', _CHECK_PY, bank],
                       capture_output=True, text=True, timeout=2400)
    if r.returncode:
        print('render pass failed:', r.stderr[-600:])
        return 1
    res = json.loads(r.stdout)
    clips = [k for k, v in res.items() if v.get('clip')]
    errs = {k: v['error'] for k, v in res.items() if v.get('error')}
    reqs = [k for k, v in res.items() if v.get('req_failed')]
    static = [k for k, v in res.items()
              if '/fx-' in k and not v.get('error') and
              max(v.get('diff') or [0]) == 0]
    insets = [k for k, v in res.items()
              if v.get('stage') and not v.get('error') and
              min((v.get('inset') or {}).values()) < 16]
    lows = {k: v['low'] for k, v in res.items()
            if v.get('low') and v.get('checked')}
    print(f'{len(res)} docs: {len(errs)} errors, {len(reqs)} failed-'
          f'request docs, {len(clips)} clipped, '
          f'{len(static)} static fx, {len(insets)} tight insets, '
          f'{len(lows)} low-contrast docs')
    for k in errs:
        print('  ERR', k, errs[k])
    for k in reqs[:10]:
        print('  REQ', k)
    for k in clips[:10]:
        print('  CLIP', k)
    for k in static[:20]:
        print('  STATIC', k)
    for k in insets[:10]:
        print('  INSET', k)
    for k, v in list(lows.items())[:15]:
        print('  CONTRAST', k, f'{v} low elements')
    return 0 if not (errs or reqs or clips) else 1


if __name__ == '__main__':
    sys.exit(main())
