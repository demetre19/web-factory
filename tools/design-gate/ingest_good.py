#!/usr/bin/env python3
"""Good-design ingest — operator-supplied sites are TOP canon (above
Mobbin). Port of the Design Library Section Scan
(PRD-Section-Scan-2026-08-24, src/server/capture/sections.ts).

  python3 tools/design-gate/ingest_good.py <url>... [--note "why good"]
  python3 tools/design-gate/ingest_good.py --image <file> [--note ...]

Pipeline per URL: real viewports (1440x900 desktop tiles +
768x1024/390x844 probes), scroll once for lazy content, videos paused,
cookie banners dismissed, capture_ok gate, DOM Section Scan (landmarks +
geometry/heading/background evidence + computed-style snapshots),
whole-section crops from the single full-page image (never re-captured
per section, so sticky headers don't stamp), measurements (features +
component classification), nomic+CLIP embeddings via cache, storage
under patterns/data/operator/<slug>/, then banked into annotations with
source=operator. A contact sheet + receipt per site is written for the
operator's confirm/untick pass.

--image handles Dribbble-style stills: the shot image is segmented into
bands (luminance-gutter detection) and each band becomes a section.
"""
import json
import os
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
TOOLS = os.path.join(ROOT, 'docs', 'machinery', 'design', 'patterns',
                     'tools')
DATA = os.path.join(TOOLS, '..', 'data')
OPERATOR = os.path.join(DATA, 'operator')
sys.path.insert(0, TOOLS)
sys.path.insert(0, HERE)
import cache  # noqa: E402
import capture_ok  # noqa: E402
import image_features  # noqa: E402

VIEWPORTS = [('desktop', 1440, 900), ('tablet', 768, 1024),
             ('mobile', 390, 844)]
MAX_SECTIONS = 32

# -- DOM Section Scan (verbatim port of sections.ts) -------------------
DETECT_JS = """(maximumSections) => {
  const normalize = (v, m) => (v ?? "")
    .replace(/[\\u0000-\\u001f\\u007f]/g, " ")
    .replace(/\\s+/g, " ").trim().slice(0, m);
  const visible = (el) => {
    const s = getComputedStyle(el), r = el.getBoundingClientRect();
    return s.display !== "none" && s.visibility !== "hidden"
      && Number.parseFloat(s.opacity || "1") > 0
      && r.width >= Math.max(240, window.innerWidth * 0.55)
      && r.height >= 40;
  };
  const describe = (el) => {
    const p = el.parentElement;
    const sib = p ? [...p.children].filter(i => i.tagName === el.tagName) : [];
    const o = sib.indexOf(el) + 1;
    const pn = p?.tagName.toLowerCase() ?? "document";
    const id = el.id ? `#${normalize(el.id, 80)}` : "";
    return id || `${pn} > ${el.tagName.toLowerCase()}:nth-of-type(${Math.max(1, o)})`;
  };
  const props = ["color","background-color","background-image",
    "font-family","font-size","font-weight","line-height",
    "letter-spacing","text-align","text-transform","display","position",
    "grid-template-columns","flex-direction","flex-wrap",
    "justify-content","align-items","gap","row-gap","column-gap",
    "padding-top","padding-right","padding-bottom","padding-left",
    "border-top-width","border-right-width","border-bottom-width",
    "border-left-width","border-top-color","border-right-color",
    "border-bottom-color","border-left-color","border-radius",
    "box-shadow","width","max-width","min-height","object-fit"];
  const cse = (el) => {
    const s = getComputedStyle(el), out = {};
    for (const p of props) {
      const v = normalize(s.getPropertyValue(p)
        .replace(/url\\([^)]*\\)/gi, "url([omitted])"), 240);
      if (v) out[p] = v;
    }
    const cp = {};
    for (let i = 0; i < s.length && Object.keys(cp).length < 24; i++) {
      const p = s.item(i);
      if (!p.startsWith("--")) continue;
      cp[p] = normalize(s.getPropertyValue(p)
        .replace(/url\\([^)]*\\)/gi, "url([omitted])"), 160);
    }
    return { styles: out, customProperties: cp };
  };
  const reps = (sec) => {
    const out = [], seen = new Set();
    const sel = [
      { role: "section", sels: [null] },
      { role: "heading", sels: ["h1,h2,h3"] },
      { role: "copy", sels: ["p"] },
      { role: "action", sels: [
        "a[class*='btn'],a[class*='button'],a[class*='cta'],button,[role='button']",
        "[class*='actions'] a,[class*='cta'] a", "a[href]"] },
      { role: "media", sels: ["img,picture,video"] },
      { role: "card", sels: ["article,li,[class*='card'],[class*='panel']"] },
    ];
    for (const { role, sels } of sel) {
      let cand = null;
      for (const q of sels) {
        const cur = q ? sec.querySelector(q) : sec;
        if (!cur || seen.has(cur)) continue;
        const r = cur.getBoundingClientRect(), st = getComputedStyle(cur);
        if (r.width < 1 || r.height < 1 || st.display === "none"
            || st.visibility === "hidden") continue;
        cand = cur; break;
      }
      if (!cand) continue;
      seen.add(cand);
      out.push({ role, tag: cand.tagName.toLowerCase(),
                 text: normalize(cand.textContent, 160), ...cse(cand) });
    }
    return out;
  };
  const overlays = [...document.querySelectorAll("body *")].filter(el => {
    const s = getComputedStyle(el);
    if (s.position !== "fixed" && s.position !== "sticky") return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && s.display !== "none"
      && s.visibility !== "hidden";
  });
  const main = document.querySelector("main");
  let mainChildren = main ? [...main.children] : [];
  if (mainChildren.length === 1) {
    const nested = [...mainChildren[0].children];
    if (nested.filter(e => /^(SECTION|ARTICLE|HEADER|FOOTER)$/.test(e.tagName)).length >= 2)
      mainChildren = nested;
  }
  // no <main> (common on div-soup marketing sites): fall back to
  // top-level body blocks that look like sections. Faithful to the
  // Section Scan intent — full-width, semantic or heading-bearing.
  if (!main || mainChildren.length === 0) {
    mainChildren = [...document.body.children].filter(el =>
      ["DIV","SECTION","ARTICLE","ASIDE","MAIN"].includes(el.tagName));
    if (mainChildren.length === 1) {
      const nested = [...mainChildren[0].children];
      if (nested.length >= 3) mainChildren = nested;
    }
  }
  const bodyLandmarks = [...document.body.children].filter(el => {
    if (/^(HEADER|NAV|FOOTER)$/.test(el.tagName)) return true;
    if (el === main || ["SCRIPT","STYLE","LINK","NOSCRIPT","SVG"].includes(el.tagName)) return false;
    return Boolean(el.querySelector(":scope > nav, :scope > header, nav"))
      && el.getBoundingClientRect().top <= window.innerHeight;
  });
  const cands = [...bodyLandmarks, ...mainChildren];
  const uniq = [];
  for (const el of cands) {
    if (uniq.includes(el) || !visible(el)) continue;
    const tag = el.tagName;
    const semantic = /^(HEADER|NAV|SECTION|ARTICLE|ASIDE|FOOTER)$/.test(tag);
    const hasHeading = Boolean(el.querySelector("h1,h2,h3"));
    const hasHint = el.hasAttribute("data-section");
    const containsNav = Boolean(el.matches("nav") || el.querySelector("nav"));
    if (!semantic && !hasHeading && !hasHint && !containsNav) continue;
    uniq.push(el);
  }
  const ordered = uniq.sort((a, b) => {
    const at = a.getBoundingClientRect().top + window.scrollY;
    const bt = b.getBoundingClientRect().top + window.scrollY;
    const anav = !main?.contains(a) && (/^(HEADER|NAV)$/.test(a.tagName)
      || (a.tagName !== "FOOTER" && at < window.innerHeight
          && Boolean(a.querySelector("nav"))));
    const bnav = !main?.contains(b) && (/^(HEADER|NAV)$/.test(b.tagName)
      || (b.tagName !== "FOOTER" && bt < window.innerHeight
          && Boolean(b.querySelector("nav"))));
    if (anav !== bnav) return Number(bnav) - Number(anav);
    return at - bt;
  }).slice(0, maximumSections);
  return ordered.map((el, sourceIndex) => {
    const r = el.getBoundingClientRect();
    const g = {
      left: Math.max(0, Math.round(r.left + window.scrollX)),
      top: Math.max(0, Math.round(r.top + window.scrollY)),
      width: Math.max(1, Math.round(r.width)),
      height: Math.max(1, Math.round(r.height)),
    };
    const inter = overlays.filter(o => {
      if (o === el || el.contains(o)) return false;
      const or = o.getBoundingClientRect();
      const l = or.left + window.scrollX, t = or.top + window.scrollY;
      return l < g.left + g.width && l + or.width > g.left
        && t < g.top + g.height && t + or.height > g.top;
    }).map(describe).slice(0, 12);
    return {
      sourceIndex,
      tag: el.tagName.toLowerCase(),
      id: normalize(el.id, 120),
      className: normalize(typeof el.className === "string" ? el.className : "", 300),
      role: normalize(el.getAttribute("role"), 80),
      explicitHint: normalize(el.getAttribute("data-section"), 120) || null,
      heading: normalize(el.querySelector("h1,h2,h3")?.textContent, 240),
      summary: normalize(el.textContent, 800),
      hasH1: Boolean(el.querySelector("h1")),
      containsNav: Boolean(el.matches("nav") || el.querySelector("nav")),
      geometry: g,
      overlays: inter,
      representativeStyles: reps(el),
    };
  });
}"""


def classify_section(c):
    """Port of classifySection, mapped to the corpus section_type
    vocabulary (annotations.jsonl measured labels)."""
    hint = (c.get('explicitHint') or '').lower()
    signal = f"{hint} {c.get('id','')} {c.get('className','')} " \
             f"{c.get('role','')} {c.get('heading','')}".lower()
    tag = c.get('tag')
    if tag == 'footer' or 'footer' in hint:
        return 'footer', 0.99
    if tag in ('header', 'nav') or c.get('containsNav') or any(
            w in signal for w in ('nav', 'navbar', 'navigation',
                                  'site-header')):
        return 'nav', 0.98
    if hint in ('hero', 'hero-image', 'shop-hero', 'marketing-hero') \
            or 'hero' in f"{c.get('id','')} {c.get('className','')}".lower() \
            or (c.get('hasH1') and c.get('sourceIndex', 9) <= 1):
        return 'hero', 0.94
    if any(w in signal for w in ('cta', 'call-to-action', 'get a quote',
                                 'request a quote', 'book now',
                                 'get started', 'contact us',
                                 'free consultation', 'schedule')):
        return 'call-to-action', 0.9
    if any(w in signal for w in ('testimonial', 'testimonials', 'review',
                                 'reviews', 'clients say',
                                 'customer stories')):
        return 'testimonials', 0.9
    if any(w in signal for w in ('gallery', 'portfolio',
                                 'before and after', 'real results',
                                 'our work', 'photos')):
        return 'gallery', 0.88
    if any(w in signal for w in ('meet the', 'our team', 'the owner',
                                 'founder', 'leadership')):
        return 'teams', 0.88
    if any(w in signal for w in ('services', 'industries', 'grid',
                                 'cards', 'solutions', 'what we do')):
        return 'grids-and-cards', 0.86
    if any(w in signal for w in ('why choose', 'benefits', 'advantages',
                                 'features')):
        return 'feature', 0.84
    if any(w in signal for w in ('pricing', 'plans', 'packages')):
        return 'pricing', 0.86
    if any(w in signal for w in ('faq', 'frequently asked',
                                 'questions and answers')):
        return 'faq', 0.84
    if any(w in signal for w in ('contact', 'address', 'phone',
                                 'email')):
        return 'contact', 0.78
    if any(w in signal for w in ('case study', 'case-study',
                                 'client story')):
        return 'case-study', 0.8
    if any(w in signal for w in ('logo', 'clients', 'partners')):
        return 'logo-sections', 0.8
    return 'content', 0.7 if hint else 0.55


DISMISS = [
    "button:has-text('Accept')", "button:has-text('Accept all')",
    "button:has-text('I agree')", "button:has-text('Got it')",
    "button:has-text('OK')", "button:has-text('Close')",
    "[class*='cookie'] button", "[id*='cookie'] button",
    "[class*='consent'] button",
]

SETUP_JS = """async () => {
  for (const v of document.querySelectorAll('video')) {
    try { v.pause(); v.autoplay = false;
          if (v.readyState >= 2 && !v.poster)
            v.currentTime = Math.min(0.5, v.duration || 0); } catch(e){}
  }
  const st = document.createElement('style');
  st.textContent = '*{animation-play-state:paused!important;' +
    'transition:none!important;caret-color:transparent!important}';
  document.head.appendChild(st);
}"""


def slugify(url):
    import re
    return re.sub(r'[^a-z0-9]+', '-', url.lower()).strip('-')[:90]


def ingest_url(url, note='', site_type='general', page_type='home',
               source='operator'):
    from playwright.sync_api import sync_playwright
    slug = slugify(url)
    d = os.path.join(OPERATOR, slug)
    os.makedirs(d, exist_ok=True)
    meta = {'url': url, 'domain': url.split('//')[-1].split('/')[0],
            'site_type': site_type, 'page_type': page_type,
            'source': source, 'approved': True, 'note': note,
            'capture_engine': 'ingest_good/section-scan',
            'schema_version': '1.0'}
    with sync_playwright() as pw:
        try:
            br = pw.chromium.launch()
        except Exception:
            br = pw.chromium.launch(executable_path=(
                '/Applications/Brave Browser.app/Contents/MacOS/'
                'Brave Browser'))
        results = {}
        for kind, w, h in VIEWPORTS:
            page = br.new_page(viewport={'width': w, 'height': h})
            try:
                page.goto(url, wait_until='domcontentloaded',
                          timeout=45000)
                try:
                    page.wait_for_load_state('networkidle',
                                             timeout=15000)
                except Exception:
                    pass
                page.evaluate("""async () => {
                  const h = document.body.scrollHeight;
                  for (let y = 0; y < h; y += 800) {
                    window.scrollTo(0, y);
                    await new Promise(r => setTimeout(r, 120));
                  }
                  window.scrollTo(0, 0);
                  await new Promise(r => setTimeout(r, 300));
                }""")
                for sel in DISMISS:
                    try:
                        el = page.query_selector(sel)
                        if el and el.is_visible():
                            el.click(timeout=800)
                    except Exception:
                        pass
                page.evaluate(SETUP_JS)
                page.wait_for_timeout(500)
                raw = os.path.join(d, f'full-{kind}.png')
                page.screenshot(path=raw, full_page=True)
                secs = page.evaluate(DETECT_JS, MAX_SECTIONS)
                results[kind] = {'shot': raw, 'sections': secs,
                                 'w': w, 'h': h}
            except Exception as e:
                results[kind] = {'error': str(e)}
            page.close()
        br.close()
    desk = results.get('desktop', {})
    if 'error' not in desk and desk.get('shot'):
        # immersive / video-hero pages often expose no landmark DOM; a
        # >2400px page with <3 detected sections is almost always the
        # landmark pass missing non-semantic layout, not a real
        # 2-section page. Fall back to luminance bands.
        from PIL import Image
        W = H = 0
        try:
            im = Image.open(desk['shot'])
            W, H = im.size
        except Exception as e:
            desk['error'] = f'shot unreadable: {e}'
        few = len(desk.get('sections') or []) < 3 and H > 2400
        if W and (not desk.get('sections') or few):
            desk['sections'] = [
                {'tag': 'div', 'id': '', 'className': '',
                 'geometry': {'left': 0, 'top': y0,
                              'width': W, 'height': y1 - y0},
                 'bandFallback': True}
                for edges in [band_edges(im, W, H)]
                for y0, y1 in zip(edges, edges[1:])
                if y1 - y0 >= 80]
            if desk['sections']:
                meta['capture_engine'] = 'ingest_good/band-fallback'
    if 'error' in desk or not desk.get('sections'):
        meta['capture_status'], meta['capture_reason'] = 'error', \
            desk.get('error', 'no sections detected')
        json.dump(meta, open(os.path.join(d, 'meta.json'), 'w'), indent=1)
        return slug, meta, []
    return finish(slug, d, meta, url, results)


def finish(slug, d, meta, url, results):
    from PIL import Image
    desk = results['desktop']
    full = Image.open(desk['shot'])
    W, H = full.size
    meta['width'], meta['height'] = W, H
    meta['viewport'] = [1440, 900]
    # tiles for the capture_ok pixel gate (it measures tile luminance)
    tiles = []
    for i, y in enumerate(range(0, H, 1600)):
        name = f'tile-{i:02d}.png'
        full.crop((0, y, W, min(y + 1600, H))).save(
            os.path.join(d, name))
        tiles.append(name)
    meta['tiles'] = tiles
    meta['viewports'] = {k: {'width': v['w'], 'height': v['h'],
                             'sections': len(v.get('sections', []))}
                         for k, v in results.items() if 'error' not in v}
    # crop each DOM section from the ONE desktop screenshot
    sections = []
    for i, c in enumerate(desk['sections']):
        g = c['geometry']
        x0, y0 = max(0, g['left']), max(0, g['top'])
        x1, y1 = min(W, g['left'] + g['width']), \
            min(H, g['top'] + g['height'])
        if y1 - y0 < 40 or x1 - x0 < 240:
            continue
        name = f'sec-{i:02d}.png'
        sp = os.path.join(d, name)
        full.crop((x0, y0, x1, y1)).save(sp)
        cat, conf = classify_section(c)
        feat = image_features.analyze(sp)
        sections.append({
            'index': i, 'file': name, 'geometry': g,
            'section_type': cat, 'confidence': conf,
            'heading': c.get('heading'), 'locator': (
                f"#{c['id']}" if c.get('id') else c.get('tag')),
            'explicit_hint': c.get('explicitHint'),
            'summary': (c.get('summary') or '')[:240],
            'features': {k: feat[k] for k in
                         ('ink_density', 'whitespace_share',
                          'media_ratio', 'columns', 'dark_surface')},
            'ps': feat.get('ps'),
            'blocks': feat.get('blocks'),
            'representative_styles': c.get('representativeStyles'),
            'overlays_suppressed': c.get('overlays') or [],
        })
    meta['sections'] = sections
    meta['ui_analysis'] = {
        'detector': 'structural-landmarks-v1 (Section Scan port)',
        'sections': sections,
        'viewports': meta['viewports'],
    }
    meta['probe'] = capture_ok.probe(url, use_cache=False)
    status, reason = capture_ok.decide(meta, d)
    meta['capture_status'] = status
    meta['capture_reason'] = reason
    meta['captured_at'] = time.strftime('%Y-%m-%dT%H:%M:%SZ',
                                        time.gmtime())
    json.dump(meta, open(os.path.join(d, 'meta.json'), 'w'), indent=1)
    if os.path.exists(desk['shot']):
        os.remove(desk['shot'])
    for k, v in results.items():
        if k != 'desktop' and v.get('shot') and \
                os.path.exists(v['shot']):
            os.remove(v['shot'])
    write_report(slug, d, meta)
    return slug, meta, sections


def write_report(slug, d, meta):
    """per-site report + contact sheet + receipt (operator review path)."""
    rep = {'slug': slug, 'url': meta['url'], 'source': 'operator',
           'status': meta.get('capture_status'),
           'viewport': meta.get('viewport'),
           'viewports': meta.get('viewports'),
           'n_sections': len(meta.get('sections') or []),
           'sections': [{'index': s['index'], 'type': s['section_type'],
                         'confidence': s['confidence'],
                         'heading': s['heading'], 'file': s['file'],
                         'geometry': s['geometry']}
                        for s in meta.get('sections') or []]}
    json.dump(rep, open(os.path.join(d, 'report.json'), 'w'), indent=1)
    # contact sheet: confirm/untick per section
    cards = ''.join(
        f"<div class=card><img src='{s['file']}'>"
        f"<label><input type=checkbox checked "
        f"data-sec='{s['index']}'> keep</label>"
        f"<b>{s['section_type']}</b> ({s['confidence']:.2f}) "
        f"{(s['heading'] or '')[:80]}</div>"
        for s in meta.get('sections') or [])
    html = f"""<!doctype html><meta charset=utf-8>
<title>review {slug}</title><style>
body{{font:14px system-ui;margin:24px;background:#111;color:#eee}}
.grid{{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}}
.card{{background:#1c1c1c;padding:8px}}.card img{{width:100%;display:block}}
label{{margin-right:12px}}</style>
<h1>{slug} — {meta.get('capture_status')} —
{len(meta.get('sections') or [])} sections</h1>
<p>{meta['url']} · {meta.get('viewport')} ·
{meta.get('captured_at')}</p>
<div class=grid>{cards}</div>
<script>/* operator review: untick to exclude from canon;
receipt written by gate after review */</script>"""
    open(os.path.join(d, 'review.html'), 'w').write(html)
    receipt = {'gate': 'section-review',
               'site': slug, 'sections_total': len(rep['sections']),
               'sections_kept': len(rep['sections']),
               'kept': [s['index'] for s in rep['sections']],
               'receipt': 'pending-operator-review',
               'generated': time.strftime('%Y-%m-%dT%H:%M:%SZ',
                                          time.gmtime())}
    json.dump(receipt, open(os.path.join(d, 'review-receipt.json'), 'w'),
              indent=1)


def band_edges(im, W, H):
    """Luminance-flat-row boundaries -> section edges (image-based
    sites and immersive pages with no landmark DOM)."""
    import numpy as np
    a = np.asarray(im.resize((256, max(1, int(H * 256 / W)))),
                   dtype=np.float32)
    L = 0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2]
    row_lum = L.mean(axis=1)
    flat = np.abs(np.diff(row_lum)) < 1.0
    bands, y = [], 0
    while y < len(flat):
        if flat[y]:
            s0 = y
            while y < len(flat) and flat[y]:
                y += 1
            if y - s0 >= 4:
                bands.append((s0, y))
        else:
            y += 1
    scale = H / a.shape[0]
    return [0] + [int((b[0] + b[1]) / 2 * scale) for b in bands] + [H]


def ingest_image(path, note=''):
    """Dribbble shot: segment a still into bands -> sections."""
    from PIL import Image
    slug = slugify(os.path.splitext(os.path.basename(path))[0])
    d = os.path.join(OPERATOR, slug)
    os.makedirs(d, exist_ok=True)
    im = Image.open(path).convert('RGB')
    W, H = im.size
    edges = band_edges(im, W, H)
    sections = []
    for i, (y0, y1) in enumerate(zip(edges, edges[1:])):
        if y1 - y0 < 60:
            continue
        name = f'sec-{i:02d}.png'
        sp = os.path.join(d, name)
        im.crop((0, y0, W, y1)).save(sp)
        feat = image_features.analyze(sp)
        sections.append({'index': i, 'file': name,
                         'geometry': {'left': 0, 'top': y0,
                                      'width': W,
                                      'height': y1 - y0},
                         'section_type': 'other',
                         'confidence': 0.4,
                         'heading': None,
                         'features': {k: feat[k] for k in
                                      ('ink_density', 'whitespace_share',
                                       'media_ratio', 'columns',
                                       'dark_surface')},
                         'ps': feat.get('ps'),
                         'blocks': feat.get('blocks')})
    meta = {'url': 'file://' + path,
            'domain': slug, 'site_type': 'general',
            'page_type': 'shot', 'source': 'operator',
            'approved': True, 'note': note,
            'capture_status': 'ok' if sections else 'error',
            'capture_reason': '' if sections else 'no bands',
            'width': W, 'height': H, 'viewport': [W, H],
            'capture_engine': 'ingest_good/image-bands',
            'sections': sections,
            'schema_version': '1.0'}
    json.dump(meta, open(os.path.join(d, 'meta.json'), 'w'), indent=1)
    write_report(slug, d, meta)
    return slug, meta, sections


def bank(slug):
    """operator meta -> annotations.jsonl records (source=operator)."""
    d = os.path.join(OPERATOR, slug)
    meta = json.load(open(os.path.join(d, 'meta.json')))
    if meta.get('capture_status') != 'ok':
        return 0
    recs = []
    for s in meta.get('sections') or []:
        sp = os.path.join(d, s['file'])
        if not os.path.exists(sp):
            continue
        recs.append({
            'site_name': meta['domain'],
            'image': sp,
            'site_type': meta.get('site_type') or 'general',
            'page_type': meta.get('page_type') or 'home',
            'section_type': s['section_type'],
            'speech_act': None,
            'composition': None,
            'density': None,
            'surface': 'inverse' if s['features'].get('dark_surface')
            else 'base',
            'columns': s['features'].get('columns'),
            'ink_density': s['features'].get('ink_density'),
            'whitespace_share': s['features'].get('whitespace_share'),
            'media_ratio': s['features'].get('media_ratio'),
            'ps': s.get('ps'),
            'blocks': s.get('blocks'),
            'exemplar': s.get('exemplar'),
            'source_note': s.get('source_note'),
            'cta_count': sum(1 for b in (s.get('blocks') or [])
                             if b.get('has_cta')),
            'heading_text': s.get('heading'),
            'confidence': s.get('confidence'),
            'quality_tier': 'operator',
            'source': meta.get('source') or 'operator',
            'canon_tier': ('operator' if meta.get('source') == 'operator'
                           else 'operator-endorsed'),
            'label': slug,
            'annotator': 'ingest_good/section-scan',
            'y': [round(s['geometry']['top'] /
                        max(1, meta['height']), 3),
                  round((s['geometry']['top'] +
                         s['geometry']['height']) /
                        max(1, meta['height']), 3)],
        })
    if not recs:
        return 0
    out = os.path.join(DATA, 'annotations.jsonl')
    with open(out, 'a') as f:
        for r in recs:
            f.write(json.dumps(r) + '\n')
    return len(recs)


# (url, site_type) — operator-supplied canon, top rank above Mobbin
SEEDS = [
    ('https://aacckc.com', 'saas'),
    ('https://atelier-ko-topaz.vercel.app', 'portfolio'),
    ('https://fyrre-seven.vercel.app', 'media'),
    ('https://kobbe.io', 'saas'),
    ('https://longisland-officecleaning.com', 'services'),
    ('https://ombra-lemon.vercel.app', 'fashion'),
    ('https://swissfolio.netlify.app', 'portfolio'),
    ('https://www.exoape.com', 'agency-portfolio'),
    ('https://supabird.io/new-landing-x', 'saas'),
    ('https://resend.com/', 'saas'),
    ('https://www.revolut.com/en-AU', 'finance'),
    # image-based (og:image fetched, band-segmented):
    ('https://dribbble.com/shots/26049108-Premium-Apartment-Rent-Website',
     'real-estate'),
    ('https://dribbble.com/shots/18436959-Apartment-Booking-Website',
     'real-estate'),
]


def main():
    args = sys.argv[1:]
    note = args[args.index('--note') + 1] if '--note' in args else ''
    urls = [a for a in args
            if not a.startswith('--') and a != note and a != 'ingest']
    if '--list' in args:
        src = json.load(open(args[args.index('--list') + 1]))
        tier = src['tier']
        for s_ in src['sites']:
            if not s_.get('url'):
                print(f"{s_['name']}: no URL in source")
                continue
            note = (s_.get('rationale') or '')[:400]
            if 'dribbble.com' in s_['url']:
                continue
            slug = slugify(s_['url'])
            mp = os.path.join(OPERATOR, slug, 'meta.json')
            if os.path.exists(mp):
                m = json.load(open(mp))
                # dedupe: keep both rationales
                notes = m.get('notes') or [m.get('note')]
                if note not in notes:
                    m['notes'] = [n for n in notes + [note] if n]
                    m['source'] = f'{m["source"]}+{tier}'
                    json.dump(m, open(mp, 'w'), indent=1)
                print(f'{slug}: already ingested '
                      f'(rationale merged)')
                continue
            slug, meta, secs = ingest_url(
                s_['url'], note, site_type='saas',
                page_type='home', source=tier)
            n = bank(slug)
            print(f'{slug}: {len(secs)} sections, {n} banked '
                  f'[{meta.get("capture_status")}'
                  f'{": " + meta.get("capture_reason", "") if meta.get("capture_reason") else ""}]',
                  flush=True)
        return
    if '--image' in args:
        slug, meta, secs = ingest_image(args[args.index('--image') + 1],
                                        note)
        n = bank(slug)
        print(f'{slug}: {len(secs)} bands, {n} banked '
              f'[{meta.get("capture_status")}]')
        return
    if not urls:
        urls = [u for u, _ in SEEDS]
    st_map = dict(SEEDS)
    for url in urls:
        if 'dribbble.com/shots/' in url:
            # fetch the shot image (og:image), then band-segment it
            import urllib.request, re
            html = urllib.request.urlopen(
                urllib.request.Request(
                    url, headers={'User-Agent': 'Mozilla/5.0'}),
                timeout=30).read().decode('utf-8', 'replace')
            m = re.search(r'property="og:image" content="([^"]+)"', html)
            if not m:
                print(f'{url}: no og:image')
                continue
            img_url = m.group(1).replace('&amp;', '&')
            path = os.path.join(OPERATOR,
                                slugify(url) + '.jpg')
            urllib.request.urlretrieve(img_url, path)
            slug, meta, secs = ingest_image(path, note or url)
        else:
            slug, meta, secs = ingest_url(
                url, note, site_type=st_map.get(url, 'general'),
                page_type='home')
        n = bank(slug)
        print(f'{slug}: {len(secs)} sections, {n} banked '
              f'[{meta.get("capture_status")}'
              f'{": " + meta.get("capture_reason", "") if meta.get("capture_reason") else ""}]',
              flush=True)


if __name__ == '__main__':
    main()
