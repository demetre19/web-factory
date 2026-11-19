#!/usr/bin/env python3
"""RC.* collapse + BO.* breakout measurement on operator canon.

Probes each ok site at 1440 / 768 / 360 with Playwright, collects per-
section computed geometry + page facts, and derives:

  RC signature: n_bands (cols), dom_order_ok, stack_text_first,
                content_loss_n, h_scroll, sticky_rent, pad_ratio,
                gap_ratio, hamburger_threshold
  BO signature: width_ladder histogram, unlicensed widths,
                scrollWidth violations, bleed_adjacency,
                inner_containment, edge_crop_n

Output: per-site meta['collapse'] + meta['breakout']; site vectors into
data/style-space.json under rc.* / bo.* axes.

  python3 collapse_probe.py [--site SLUG] [--limit N]

Run:  uv run --with playwright --with numpy python3 collapse_probe.py
"""
import json
import math
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.normpath(os.path.join(HERE, '..', 'data'))
OP = os.path.join(DATA, 'operator')
ROOT = os.path.normpath(os.path.join(HERE, '..', '..', '..', '..', '..'))

sys.path.insert(0, HERE)
import cache  # noqa: E402

VIEWPORTS = [(1440, 900), (768, 1024), (360, 844)]

JS = r"""
() => {
  const vw = innerWidth, vh = innerHeight;
  const sw = document.documentElement.scrollWidth;
  const out = {vw, vh, sw, hscroll: sw > vw + 2,
               hamburger: false, sticky_h: 0, sections: [],
               elements: []};
  for (const el of document.querySelectorAll(
      'header, nav, [role=navigation]')) {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    if (cs.position === 'fixed' || cs.position === 'sticky')
      out.sticky_h = Math.max(out.sticky_h, r.height);
    if (el.querySelector('[aria-label*=menu],button[class*=burger],'
      + '[class*=hamburger],[aria-expanded]'))
      out.hamburger = true;
  }
  const secs = document.querySelectorAll(
      'main section, main > div, body > section, body > div, main');
  let i = 0;
  for (const s of secs) {
    if (i++ > 40) break;
    const r = s.getBoundingClientRect();
    if (r.height < 40) continue;
    const cs = getComputedStyle(s);
    const kids = [];
    for (const k of s.children) {
      const kr = k.getBoundingClientRect();
      const ks = getComputedStyle(k);
      if (kr.height < 8 || kr.width < 8) continue;
      kids.push({top: Math.round(kr.top - r.top),
                 left: Math.round(kr.left),
                 w: Math.round(kr.width), h: Math.round(kr.height),
                 txt: (k.innerText || '').length > 0,
                 img: k.tagName === 'IMG' || k.tagName === 'PICTURE'
                      || !!k.querySelector('img,picture,video')});
    }
    out.sections.push({
      top: Math.round(r.top + scrollY),
      w: Math.round(r.width), h: Math.round(r.height),
      pad_t: parseFloat(cs.paddingTop),
      pad_b: parseFloat(cs.paddingBottom),
      bg: cs.backgroundColor, kids,
      dom_idx: Array.prototype.indexOf.call(s.parentNode.children, s)});
  }
  // width-ladder sweep: elements that render wider than the content
  // column (licence check happens in python)
  const ladder = [];
  for (const el of document.querySelectorAll(
      'section, main > *, header, footer, [class*=bleed], img, video')) {
    const r = el.getBoundingClientRect();
    if (r.width < vw * 0.6 || r.height < 30) continue;
    ladder.push({tag: el.tagName.toLowerCase(),
                 cls: (el.className + '').slice(0, 60),
                 w: Math.round(r.width), bleed: r.width >= vw * 0.98});
  }
  out.elements = ladder.slice(0, 120);
  return out;
}
"""


def probe(url):
    from playwright.sync_api import sync_playwright
    rows = {}
    with sync_playwright() as pw:
        for exe in (pw.chromium,):
            br = exe.launch(headless=True)
            try:
                for w, h in VIEWPORTS:
                    page = br.new_page()
                    page.set_viewport_size({'width': w, 'height': h})
                    page.goto(url, wait_until='domcontentloaded',
                              timeout=30_000)
                    page.wait_for_timeout(2500)
                    page.evaluate("""
                        () => { for (const v of
                          document.querySelectorAll('video'))
                          v.pause(); }""")
                    rows[w] = page.evaluate(JS)
                    page.close()
            finally:
                br.close()
            break
    return rows


def signature(rows):
    """RC + BO vectors from the three viewport snapshots."""
    desk, tab, mob = rows.get(1440), rows.get(768), rows.get(360)
    if not (desk and tab and mob):
        return None
    sig = {'viewports': {str(w): {'hscroll': rows[w]['hscroll'],
                                 'sticky_h': rows[w]['sticky_h'],
                                 'hamburger': rows[w]['hamburger'],
                                 'n_sections': len(rows[w]['sections'])}
                         for w in rows}}
    # RC.7 content loss: desktop sections that vanish at 360
    n_d = len(desk['sections'])
    n_m = len(mob['sections'])
    sig['rc7_content_loss'] = max(0, n_d - n_m)
    # RC.8/BO.4 horizontal scroll
    sig['rc8_hscroll'] = {str(w): rows[w]['hscroll'] for w in rows}
    sig['rc8_violation'] = any(rows[w]['hscroll'] for w in rows)
    # RC.13 padding collapse ratio (median over matched sections)
    prs = []
    for i, s in enumerate(mob['sections']):
        if i < len(desk['sections']):
            d_pad = (desk['sections'][i]['pad_t'] or 0) + \
                (desk['sections'][i]['pad_b'] or 0)
            m_pad = (s['pad_t'] or 0) + (s['pad_b'] or 0)
            if d_pad > 0:
                prs.append(m_pad / d_pad)
    sig['rc13_pad_collapse'] = round(
        float(sorted(prs)[len(prs) // 2]) if prs else 1.0, 3)
    # RC.17 sticky rent at 360
    sig['rc17_sticky_rent'] = round(
        mob['sticky_h'] / mob['vh'], 3)
    # RC.6 hamburger present at 360
    sig['rc6_hamburger_360'] = mob['hamburger']
    # RC.2/RC.3 column collapse: median kids-per-band desktop vs mobile
    def bands(sec):
        tops = sorted({k['top'] for k in sec['kids']})
        rows_ = 0
        for t in tops:
            same = [k for k in sec['kids'] if k['top'] == t]
            rows_ = max(rows_, len(same))
        return rows_
    d_cols = [bands(s) for s in desk['sections'] if s['kids']]
    m_cols = [bands(s) for s in mob['sections'] if s['kids']]
    sig['rc2_cols_desk'] = round(
        float(sorted(d_cols)[len(d_cols) // 2]) if d_cols else 1, 1)
    sig['rc2_cols_mob'] = round(
        float(sorted(m_cols)[len(m_cols) // 2]) if m_cols else 1, 1)
    # RC.3 stack order: at 360, is the first kid text or media?
    sf = 0
    for s in mob['sections'][:6]:
        if not s['kids']:
            continue
        first = sorted(s['kids'], key=lambda k: k['top'])[0]
        sf += 1 if first['txt'] else 0
    sig['rc3_text_first_share'] = round(sf / 6, 2)
    # BO: width ladder at 1440
    vw = desk['vw']
    ladder = {'prose': 0, 'content': 0, 'wide': 0, 'bleed': 0,
              'crop': 0, 'unlicensed': 0}
    widths = [e['w'] for e in desk['elements']]
    content_w = int(vw * 0.9)  # inner column estimate
    for e in desk['elements']:
        w = e['w']
        if w >= vw * 0.98:
            ladder['bleed' if w <= vw else 'crop'] += 1
        elif w >= vw * 0.86:
            ladder['wide'] += 1
        elif w >= content_w * 0.85:
            ladder['content'] += 1
        elif w >= content_w * 0.5:
            ladder['prose'] += 1
        else:
            continue
    odd = [e['w'] for e in desk['elements']
           if 0.72 * vw < e['w'] < 0.98 * vw
           and abs(e['w'] - vw * 0.86) > 40]
    ladder['unlicensed'] = len(set(odd))
    sig['bo_ladder'] = ladder
    sig['bo_widest'] = max(widths) if widths else vw
    # BO.5 bleed adjacency: two consecutive full-bleed sections
    bleed_runs = 0
    prev = False
    for e in desk['elements']:
        if e['bleed'] and prev:
            bleed_runs += 1
        prev = e['bleed']
    sig['bo5_bleed_adjacency'] = bleed_runs
    sig['bo9_mobile_wide'] = sum(
        1 for e in mob['elements']
        if e['w'] > mob['vw'] * 0.98 and e['w'] <= mob['vw'])
    return sig


def to_vector(sig):
    """RC/BO axes -> normalized deviation (baseline = 0)."""
    v = {}
    v['rc.content_loss'] = min(3.0, sig['rc7_content_loss'] / 2)
    v['rc.hscroll'] = 1.0 if sig['rc8_violation'] else 0.0
    v['rc.pad_collapse'] = round(sig['rc13_pad_collapse'] - 0.5, 3)
    v['rc.sticky_rent'] = round(sig['rc17_sticky_rent'] / 0.2, 3)
    v['rc.cols_collapsed'] = round(
        sig['rc2_cols_desk'] - sig['rc2_cols_mob'], 2)
    v['rc.text_first'] = round(sig['rc3_text_first_share'], 2)
    v['bo.bleed_count'] = round(sig['bo_ladder']['bleed'] / 4, 2)
    v['bo.unlicensed'] = float(sig['bo_ladder']['unlicensed'])
    v['bo.bleed_adjacency'] = float(sig['bo5_bleed_adjacency'])
    v['bo.widest_vw'] = round(
        sig['bo_widest'] / 1440 - 1.0, 3)
    return v


def process(slug):
    d = os.path.join(OP, slug)
    mp = os.path.join(d, 'meta.json')
    meta = json.load(open(mp))
    if meta.get('capture_status', 'ok') != 'ok':
        return 'skipped'
    key = cache.text_sha(meta['url'] + ':' +
                         open(__file__, 'rb').read().hex())[:16]
    sig = cache.get('capture', f'collapse:{key}')
    if sig is None:
        rows = probe(meta['url'])
        sig = signature(rows)
        if sig:
            cache.put('capture', f'collapse:{key}', sig)
    if not sig:
        meta['collapse'] = {'error': 'probe failed'}
        json.dump(meta, open(mp, 'w'), indent=1)
        return 'probe-failed'
    meta['collapse'] = sig
    meta['breakout'] = {k: v for k, v in sig.items()
                        if k.startswith('bo') or k == 'bo_ladder'}
    json.dump(meta, open(mp, 'w'), indent=1)
    return to_vector(sig)


def main():
    args = sys.argv[1:]
    site = args[args.index('--site') + 1] if '--site' in args else None
    limit = int(args[args.index('--limit') + 1]) if '--limit' in args \
        else 1_000
    if site:
        slugs = [site]
    else:
        slugs = sorted(s for s in os.listdir(OP)
                       if os.path.isdir(os.path.join(OP, s))
                       and s != '_sources')[:limit]
    vecs = {}
    for sl in slugs:
        try:
            v = process(sl)
            if isinstance(v, dict):
                vecs[sl] = v
                print(f'{sl}: measured')
            else:
                print(f'{sl}: {v}')
        except Exception as e:
            print(f'{sl}: {type(e).__name__}: {e}')
    # merge into style-space.json
    ssp = os.path.join(DATA, 'style-space.json')
    ss = json.load(open(ssp)) if os.path.exists(ssp) else {
        'rules': [], 'clusters': {}, 'sites': []}
    for row in ss.get('sites', []):
        if row['site'] in vecs:
            row['vector'].update(vecs[row['site']])
    json.dump(ss, open(ssp, 'w'), indent=1)
    print(f'{len(vecs)} sites merged into style-space.json')


if __name__ == '__main__':
    main()
