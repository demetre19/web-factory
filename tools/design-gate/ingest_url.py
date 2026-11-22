#!/usr/bin/env python3.12
"""ingest_url.py — slice a live page (or pasted HTML) into section
fragments, vectorise each through the SHARED bank machinery
(genmenu_bank.Tree + sniff_topology — never a second parser),
rank the top-3 bank exemplars by weighted element_sig overlap, and
draft a DNA-shaped style guess from computed CSS / inline styles.

    ingest_url.py --url https://site/          (renders headless)
    ingest_url.py --html page.html             (paste mode, no browser)
    ingest_url.py --url X --out result.json

Deterministic, no paid calls. URL mode renders through the repo's
vendored playwright/chromium at .venv — never installs anything.
"""
from __future__ import annotations

import json, os, re, subprocess, sys
from collections import Counter
from html.parser import HTMLParser

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, HERE)
from genmenu_bank import Tree, sniff_topology  # noqa: E402

BANK = os.path.join(REPO, 'templates', 'skeletons', 'genmenu')
VENV_PY = os.path.join(REPO, '.venv', 'bin', 'python')

# semantic-kind → sniff_topology baselines to try (first match wins
# by confidence order high>medium>low)
_KIND_BASELINES = {
    'nav': ['nav-dropdown-menu', 'nav-modal', 'nav-dock-left-drawer',
            'nav-sheet'],
    'footer': ['footer-columns'],
    'hero': ['hero-section'],
    'table': ['data-display', 'data-table', 'comparison-table'],
    'form': ['commerce-flow', 'modal-dialog'],
    'section': ['data-display', 'hero-section', 'proof-testimonial',
                'pricing-tiers'],
}

# tag weights for the overlap score — semantic landmarks dominate,
# containers barely count (explainable: the score IS shared structure)
_TAG_W = {'nav': 8, 'footer': 8, 'form': 8, 'dialog': 7, 'table': 7,
          'main': 6, 'aside': 6, 'header': 6, 'h1': 5, 'h2': 4, 'h3': 3,
          'h4': 2, 'ul': 3, 'ol': 3, 'li': 1.5, 'a': 1.5, 'button': 3,
          'input': 4, 'select': 4, 'img': 2.5, 'icn': 1, 'p': 0.5,
          'section': 4, 'article': 3, 'blockquote': 4, 'label': 2,
          'details': 3, 'summary': 2, 'span': 0.2, 'div': 0.1,
          'strong': 0.5, 'em': 0.5, 'small': 0.5, 'figure': 2,
          'figcaption': 1, 'video': 3, 'picture': 2, 'iframe': 2,
          'textarea': 3}
_CONF_RANK = {'high': 3, 'medium': 2, 'low': 1, '': 0}


# ------------------------------------------------------------------
# slicing — records outerHTML spans of candidate section elements.
# This is region detection only; the fragment's signature still
# comes from Tree (the shared vectoriser).
# ------------------------------------------------------------------
def _slice_regions(doc: str):
    """Return [(tag, html_fragment)] top-level section candidates,
    deduped to non-nested regions, each capped for vectorising."""
    # position tracking needs raw-text scanning — HTMLParser gives no
    # offsets, so regions are paired by a regex open/close stack
    regions = []
    tag_re = re.compile(
        r'<(header|nav|footer|section|aside|main|article|dialog)\b',
        re.I)
    opens = [(m.start(), m.group(1).lower()) for m in
             tag_re.finditer(doc)]
    if not opens:
        return []
    # pair each open with its close via a tag stack
    close_re = re.compile(
        r'</(header|nav|footer|section|aside|main|article|dialog)\s*>',
        re.I)
    events = sorted(
        [(m.start(), 1, m.group(1).lower()) for m in
         tag_re.finditer(doc)] +
        [(m.start(), -1, m.group(1).lower()) for m in
         close_re.finditer(doc)])
    stack = []
    for pos, kind, tag in events:
        if kind == 1:
            stack.append((tag, pos, len(stack)))
        else:
            # pop until matching tag (lenient — pages misnest)
            for i in range(len(stack) - 1, -1, -1):
                if stack[i][0] == tag:
                    start_tag, start, depth = stack.pop(i)
                    parent = stack[-1][0] if stack else None
                    if depth == 0 or parent == 'main':
                        regions.append(
                            (start_tag, doc[start:pos + len(
                                '</' + tag + '>')]))
                    break
    if not regions and opens:
        pos, tag = opens[0]
        regions = [(tag, doc[pos:pos + 20000])]
    # drop nested duplicates already covered by a parent
    out, seen = [], set()
    for tag, frag in regions:
        if len(frag) < 40:
            continue
        key = frag[:160]
        if key in seen:
            continue
        seen.add(key)
        out.append((tag, frag[:60000]))
    return out[:24]


def _kind(tag: str, frag: str, t: 'Tree'):
    if tag in ('header', 'nav'):
        return 'nav'
    if tag == 'footer':
        return 'footer'
    if 'form' in t.sig and (t.sig.get('input', 0) +
                            t.sig.get('textarea', 0)) >= 2:
        return 'form'
    if t.sig.get('table'):
        return 'table'
    if t.sig.get('dialog'):
        return 'form'
    if re.search(r'hero|banner|jumbotron|masthead', frag, re.I):
        return 'hero'
    return 'section'


def _topo_guess(kind: str, frag: str):
    for base in _KIND_BASELINES.get(kind, ['data-display']):
        topo, conf = sniff_topology(frag, base)
        if _CONF_RANK.get(conf, 0) >= 2:
            return topo, conf, base
    base = _KIND_BASELINES.get(kind, ['data-display'])[0]
    topo, conf = sniff_topology(frag, base)
    return topo, conf, base


# ------------------------------------------------------------------
# bank index — every vectorised exemplar's sig + topology + tags,
# built once per process
# ------------------------------------------------------------------
_IDX = None


def bank_index():
    global _IDX
    if _IDX is not None:
        return _IDX
    idx = []
    tags = {}
    tj = os.path.join(BANK, 'tags.json')
    if os.path.isfile(tj):
        try:
            for r in json.load(open(tj)).get('rows') or []:
                tags[r.get('path')] = r
        except Exception:
            pass
    for root, _dn, fns in os.walk(BANK):
        for fn in fns:
            if not fn.endswith('.topo.json'):
                continue
            try:
                t = json.load(open(os.path.join(root, fn)))
            except Exception:
                continue
            sig = t.get('element_sig') or {}
            if not sig:
                continue
            cls = os.path.basename(root)
            slug = fn[:-10]
            row = tags.get(cls + '/' + slug) or {}
            idx.append({'cls': cls, 'slug': slug, 'sig': sig,
                        'topo': t.get('topology_id') or '',
                        'tags': row})
    _IDX = idx
    return idx


# ingest kind → the spec's section_class values
_KIND_SC = {'nav': 'navigation', 'footer': 'footer',
            'hero': 'section', 'table': 'data', 'form': 'commerce',
            'section': 'section'}


def match_bank(sig: dict, topo_guess: str, kind_of: str = '', n: int = 3):
    """Ranked weighted overlap — score = Σ min(sig_f[t], sig_b[t])·w(t)
    normalised by the fragment's own weighted mass, plus a topology-
    agreement bonus. Returns [{cls, slug, score, why[]}] top-n."""
    frag_mass = sum(v * _TAG_W.get(k, 0.5) for k, v in sig.items()) or 1
    scored = []
    for e in bank_index():
        bank_mass = sum(v * _TAG_W.get(k, 0.5)
                        for k, v in e['sig'].items()) or 1
        shared, why, pts = [], [], 0.0
        for t, c in sig.items():
            w = _TAG_W.get(t, 0.5)
            m = min(c, e['sig'].get(t, 0))
            if m > 0:
                pts += m * w
                if w >= 1.5 and t not in ('div', 'span'):
                    shared.append(t)
        score = 2 * pts / (frag_mass + bank_mass)
        if e['topo'] and e['topo'] == topo_guess:
            score += 0.12
            why.append('topology agrees: ' + topo_guess)
        elif e['cls'] == topo_guess:
            score += 0.12
            why.append('topology agrees: ' + topo_guess)
        sc = (e['tags'].get('section_class') or '')
        if sc and sc == _KIND_SC.get(kind_of):
            score += 0.15
            why.append('section class agrees: ' + sc)
        why = (['shared: ' + ', '.join(
            sorted(set(shared))[:6])] if shared else []) + why
        scored.append((round(score, 3), e, why))
    scored.sort(key=lambda x: -x[0])
    return [{'cls': e['cls'], 'slug': e['slug'], 'score': sc,
             'topo': e['topo'], 'why': why}
            for sc, e, why in scored[:n]]


# ------------------------------------------------------------------
# style extraction
# ------------------------------------------------------------------
_HEX = re.compile(r'#[0-9a-fA-F]{3,8}\b')
_RGB = re.compile(r'rgba?\(([^)]+)\)')
_FONT = re.compile(r'font-family:\s*([^;}]+)')
_RADIUS = re.compile(r'border-radius:\s*([0-9.]+)(px|rem|em|%)')
_PX = re.compile(r'(?:padding|margin|gap)[^;:]*:\s*([0-9.]+)px')


def _lum(rgb):
    r, g, b = [x / 255 for x in rgb]
    f = lambda c: c / 12.92 if c <= 0.04045 else \
        ((c + 0.055) / 1.055) ** 2.4
    r, g, b = f(r), f(g), f(b)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def _rgb_tuple(s):
    if s.startswith('#'):
        h = s.lstrip('#')
        if len(h) == 3:
            h = ''.join(c * 2 for c in h)
        if len(h) >= 6:
            return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))
    m = re.match(r'rgba?\(\s*([0-9.]+)[,\s]+([0-9.]+)[,\s]+'
                 r'([0-9.]+)', s)
    if m:
        return tuple(float(x) for x in m.groups())
    return None


def _norm_colors(vals):
    c = Counter()
    for v in vals:
        t = _rgb_tuple(v)
        if t:
            c['#%02x%02x%02x' % tuple(int(x) for x in t[:3])] += 1
    return c


def style_from_styles(css_text: str):
    """paste mode — extract what we can from <style> + style attrs +
    tailwind color tokens."""
    colors = _norm_colors(_HEX.findall(css_text) +
                          ['rgb(' + m + ')' for m in _RGB.findall(
                              css_text)])
    fonts = [f.strip().strip('"\'') for f in _FONT.findall(css_text)]
    radii = [float(m[0]) for m in
             [x for x in _RADIUS.findall(css_text) if x[1] == 'px']]
    spacing = [float(x) for x in _PX.findall(css_text)]
    return _dna_draft(colors, fonts, radii, spacing)


def style_from_computed(comp: dict):
    """URL mode — playwright-evaluated computed-style summary."""
    colors = _norm_colors(comp.get('colors') or [])
    fonts = comp.get('fonts') or []
    radii = [float(x) for x in comp.get('radii') or []
             if str(x).replace('.', '').isdigit()]
    spacing = [float(x) for x in comp.get('spacing') or []
               if str(x).replace('.', '').isdigit()]
    return _dna_draft(colors, fonts, radii, spacing,
                      comp.get('body') or {})


def _dna_draft(colors, fonts, radii, spacing, body=None):
    body = body or {}
    palette = [h for h, _n in colors.most_common(8)]
    lums = [(h, _lum(_rgb_tuple(h))) for h in palette]
    dark = [h for h, l in lums if l < 0.18]
    light = [h for h, l in lums if l > 0.82]
    mid = [(h, l) for h, l in lums if 0.18 <= l <= 0.82]
    def _sat(h):
        r, g, b = [x / 255 for x in _rgb_tuple(h)]
        mx, mn = max(r, g, b), min(r, g, b)
        return 0 if mx == 0 else (mx - mn) / mx
    accent = max(mid, key=lambda hl: _sat(hl[0]))[0] if mid else (
        palette[-1] if palette else '')
    radii_s = sorted(radii)
    radius = (radii_s[len(radii_s) // 2] if radii_s else 0)
    space_s = sorted(set(spacing))
    density = ('tight' if (space_s and
               sum(1 for x in space_s if x >= 24) <
               len(space_s) / 2) else 'regular')
    # ink/surface take the page's own computed roles first — the
    # top colour buckets mix text and fills, so dark[0] was often
    # the background and light[0] was empty on dark sites; a
    # transparent body paint is no role at all
    def _solid(v):
        v = (v or '').strip()
        if not v or v == 'transparent':
            return ''
        m = re.match(r'rgba\(([^)]+)\)', v)
        if m:
            try:
                if float(m.group(1).split(',')[-1].strip()) == 0:
                    return ''
            except ValueError:
                return ''
        return v
    return {'palette': palette,
            'ink': _solid(body.get('color')) or
                   (dark[0] if dark else ''),
            'surface': _solid(body.get('bg')) or
                       (light[0] if light else ''),
            'accent_guess': accent,
            'radius_px_median': radius,
            'density_guess': density,
            'type': {'families': fonts[:4],
                     'base_px': body.get('fontSize') or '',
                     'color_counts': dict(colors.most_common(12))}}


# ------------------------------------------------------------------
# render (URL mode) — the repo venv's playwright/chromium
# ------------------------------------------------------------------
_RENDER_JS = r"""() => {
  const cs = getComputedStyle(document.body);
  const colors = [], fonts = new Set(), radii = [], spacing = [];
  const seen = new Set();
  for (const el of document.querySelectorAll('body,header,nav,footer,' +
      'section,h1,h2,h3,button,a.btn,[class*=btn],[class*=card]')) {
    if (seen.size > 400) break;
    const s = getComputedStyle(el);
    colors.push(s.color, s.backgroundColor);
    radii.push(s.borderRadius.replace('px',''));
    for (const p of ['paddingTop','paddingBottom','marginTop',
                     'columnGap','rowGap'])
      spacing.push(s[p].replace('px',''));
    fonts.add(s.fontFamily);
    seen.add(el);
  }
  return {colors: colors.filter(c => c && !c.startsWith('rgba(0, 0, 0, 0)')),
          fonts: [...fonts], radii: radii.filter(x => +x > 0),
          spacing: spacing.filter(x => +x > 0),
          body: {bg: cs.backgroundColor, color: cs.color,
                 fontSize: cs.fontSize}};
}"""

_RENDER_PY = """
import json, sys
from playwright.sync_api import sync_playwright
url = sys.argv[1]
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 1440, 'height': 900})
    pg.goto(url, wait_until='domcontentloaded', timeout=45000)
    pg.wait_for_timeout(2500)
    html = pg.content()
    comp = pg.evaluate(""" + repr(_RENDER_JS) + """)
    b.close()
print(json.dumps({'html': html, 'computed': comp}))
"""


def _render_pythons():
    """candidates that can run playwright — the repo venv first,
    then the ambient python (blueprint installs playwright there)."""
    cands = []
    if os.path.isfile(VENV_PY):
        cands.append(VENV_PY)
    if sys.executable not in cands:
        cands.append(sys.executable)
    return cands


def fetch_rendered(url: str):
    saw_module, render_errs = False, []
    for py in _render_pythons():
        chk = subprocess.run(
            [py, '-c', 'import playwright'], capture_output=True,
            text=True, timeout=30)
        if chk.returncode:
            continue
        saw_module = True
        try:
            r = subprocess.run([py, '-c', _RENDER_PY, url],
                               capture_output=True, text=True,
                               timeout=120)
        except subprocess.TimeoutExpired:
            render_errs.append('render timed out')
            continue
        if r.returncode:
            # one line of the render failure — never a raw traceback
            tail = [l for l in (r.stderr or '').splitlines()
                    if l.strip()]
            render_errs.append((tail[-1] if tail else
                                'render failed')[:180])
            continue
        return json.loads(r.stdout)
    if not saw_module:
        raise RuntimeError('NO_PLAYWRIGHT')
    raise RuntimeError('RENDER_FAILED: ' +
                       ' | '.join(render_errs)[-280:])


# ------------------------------------------------------------------
# the ingest pass
# ------------------------------------------------------------------
def ingest(url=None, html=None, css_text=''):
    computed = {}
    if url:
        rendered = fetch_rendered(url)
        html = rendered.get('html') or ''
        computed = rendered.get('computed') or {}
    html = html or ''
    if '<' not in html:
        return {'error': 'nothing to ingest — need a URL or HTML'}
    style_tags = css_text + ' '.join(
        re.findall(r'<style[^>]*>(.*?)</style>', html, re.S | re.I)) + \
        ' '.join(re.findall(r'style="([^"]+)"', html, re.I))
    regions = _slice_regions(html)
    fragments = []
    for i, (tag, frag) in enumerate(regions):
        t = Tree()
        try:
            t.feed(frag)
        except Exception:
            continue
        kind = _kind(tag, frag, t)
        topo, conf, base = _topo_guess(kind, frag)
        matches = match_bank(t.sig, topo, kind)
        fragments.append({
            'i': i, 'tag': tag, 'kind': kind,
            'sig': dict(sorted(t.sig.items(),
                               key=lambda kv: -kv[1])[:24]),
            'topo_guess': topo, 'confidence': conf,
            'baseline': base,
            'text_hints': (t.text_hints or [])[:6],
            'matches': matches,
            'html_len': len(frag)})
    dna = (style_from_computed(computed) if computed else
           style_from_styles(style_tags))
    return {'url': url, 'fragments': fragments, 'dna_draft': dna}


def main():
    import argparse
    ap = argparse.ArgumentParser()
    ap.add_argument('--url')
    ap.add_argument('--html')
    ap.add_argument('--css', default='')
    ap.add_argument('--out')
    args = ap.parse_args()
    doc = ''
    if args.html:
        doc = open(args.html, encoding='utf-8').read()
    res = ingest(url=args.url, html=doc or None,
                 css_text=open(args.css).read() if args.css and
                 os.path.isfile(args.css) else (args.css or ''))
    js = json.dumps(res, indent=1, default=str)
    if args.out:
        open(args.out, 'w').write(js)
        print('wrote', args.out)
    else:
        print(js[:20000])


if __name__ == '__main__':
    main()
