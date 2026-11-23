#!/usr/bin/env python3
"""measure.py — the w7 measured-evidence producer (run_pipeline step).

Computes the hard render metrics J.11/J.12 judge on: image coverage,
section count, min contrast, min tap target, CTA count, proof
surfaces, dead-space run and heading-hierarchy violations — read off
the BUILT page (site/dist served over http, live layout via
Playwright) plus a pixel dead-space check decoded from the evidence
screenshots in shots/. Nothing here trusts a declared score:
judge.py turns this file into the verdict w8 consumes.

    measure.py <pipeline-dir>

Writes MEASURE.json into the pipeline dir.
"""
import hashlib
import http.server
import json
import os
import subprocess
import sys
import threading

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import gate          # noqa: E402

PLAYWRIGHT = os.path.join(os.path.dirname(os.path.dirname(HERE)),
                          '.venv', 'bin', 'python')

MEASURE_WIDTHS = gate.SHOT_WIDTHS        # (1280, 768, 360)

# DOM metrics — one page.evaluate per viewport. Every number is a
# rendered-layout measurement: rects, computed styles, geometry.
_JS = r"""
() => {
  const out = {};
  const doc = document.documentElement;
  const dh = doc.scrollHeight;
  const dw = doc.clientWidth;
  const vh = window.innerHeight;
  out.page_height_px = dh;
  out.viewport_px = vh;
  const vis = el => {
    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return null;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden'
        || parseFloat(cs.opacity) === 0) return null;
    return r;
  };
  // ---- image coverage: img/svg/canvas/video rendered px / page px
  let mediaArea = 0, mediaKinds = {};
  for (const el of document.querySelectorAll(
        'main img, main svg, main canvas, main video, main picture')) {
    const r = vis(el); if (!r) continue;
    const a = r.width * r.height; mediaArea += a;
    const k = el.tagName.toLowerCase();
    mediaKinds[k] = (mediaKinds[k] || 0) + a;
  }
  out.media_area_px = Math.round(mediaArea);
  out.image_coverage = dw * dh
      ? +(mediaArea / (dw * dh)).toFixed(4) : 0;
  out.media_kinds = Object.fromEntries(
      Object.entries(mediaKinds).map(([k, v]) => [k, Math.round(v)]));
  // ---- sections
  out.section_count = document.querySelectorAll('main [data-sec]').length
      || document.querySelectorAll('[data-sec]').length;
  // ---- contrast: every element with own non-whitespace text
  const rgba = s => { const m = s.match(/rgba?\(([^)]+)\)/);
    return m ? m[1].split(',').slice(0, 4).map(Number) : null; };
  const lum = c => {
    const f = v => { v /= 255;
      return v <= 0.03928 ? v / 12.92
                          : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
  };
  let worst = {ratio: 99, context: ''};
  for (const el of document.querySelectorAll('main *')) {
    if (!vis(el)) continue;
    let hasText = false;
    for (const n of el.childNodes)
      if (n.nodeType === 3 && n.textContent.trim()) { hasText = true; break; }
    if (!hasText) continue;
    const cs = getComputedStyle(el);
    const fg = rgba(cs.color); if (!fg) continue;
    let bg = null, p = el;
    while (p) {
      const b = rgba(getComputedStyle(p).backgroundColor);
      if (b && (b.length < 4 || b[3] > 0.1)) { bg = b; break; }
      p = p.parentElement;
    }
    if (!bg) bg = [255, 255, 255];
    const L1 = lum(fg), L2 = lum(bg.slice(0, 3));
    const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
    if (ratio < worst.ratio) worst = {
      ratio: +ratio.toFixed(2),
      context: `${el.tagName.toLowerCase()} "${el.textContent.trim()
        .slice(0, 60)}" fg ${cs.color}`,
    };
  }
  out.contrast_min_ratio = worst.ratio === 99 ? null : worst.ratio;
  out.contrast_min_context = worst.context;
  // ---- tap targets: every interactive element's smaller edge
  let tmin = {px: Infinity, context: ''};
  for (const el of document.querySelectorAll(
        'main a[href], main button, main [role=button], main input,'
        + ' main select, main textarea, main summary, nav a[href],'
        + ' footer a[href]')) {
    const r = vis(el); if (!r) continue;
    const m = Math.min(r.width, r.height);
    if (m < tmin.px) tmin = {px: +m.toFixed(1),
      context: `${el.tagName.toLowerCase()} "${(el.textContent || '')
        .trim().slice(0, 60)}"`};
  }
  out.tap_target_min_px = tmin.px === Infinity ? null : tmin.px;
  out.tap_target_context = tmin.context;
  // ---- CTAs
  const ctas = new Set();
  for (const el of document.querySelectorAll(
        '.wf-cta-button, a[href^="tel:"], a[href^="mailto:"],'
        + ' a[href*="/contact"], [data-cta]')) {
    if (vis(el)) ctas.add(el);
  }
  out.cta_count = ctas.size;
  // ---- proof surfaces: sections/elements whose role is testimony
  const proofs = new Set();
  for (const el of document.querySelectorAll('[data-sec],[data-intent]')) {
    const v = `${el.dataset.sec || ''} ${el.dataset.intent || ''}`;
    if (/proof|testimonial|review|rating|trust|logo/i.test(v))
      proofs.add(el);
  }
  for (const el of document.querySelectorAll(
        '[class*="testimonial"],[class*="rating"],[class*="logo-wall"],'
        + '[class*="proof"],[class*="stars"],[id*="testimonial"]')) {
    if (vis(el)) proofs.add(el);
  }
  for (const h of document.querySelectorAll('main h2, main h3')) {
    if (/review|testimonial|clients say|trusted by|rated/i
          .test(h.textContent)) proofs.add(h.closest('[data-sec]') || h);
  }
  out.proof_surfaces = proofs.size;
  out.proof_context = [...proofs].slice(0, 6).map(e =>
      (e.dataset && (e.dataset.sec || e.dataset.intent))
      || e.tagName.toLowerCase());
  // ---- dead space: largest vertical run of the page with no
  // rendered content element at any x.
  const iv = [];
  for (const el of document.querySelectorAll(
        'main h1,main h2,main h3,main h4,main h5,main h6,main p,main li,'
        + 'main a,main button,main img,main svg,main video,main canvas,'
        + 'main input,main select,main textarea,main td,main th,'
        + 'main label,main summary,main blockquote,main figcaption,'
        + 'nav *,footer *')) {
    const r = vis(el); if (!r) continue;
    iv.push([r.top + scrollY, r.bottom + scrollY]);
  }
  iv.sort((a, b) => a[0] - b[0]);
  const merged = [];
  for (const [a, b] of iv) {
    const last = merged[merged.length - 1];
    if (last && a <= last[1] + 1) last[1] = Math.max(last[1], b);
    else merged.push([a, b]);
  }
  let maxRun = 0, runAt = 0, prev = 0;
  for (const [a, b] of merged) {
    if (a - prev > maxRun) { maxRun = a - prev; runAt = prev; }
    prev = Math.max(prev, b);
  }
  if (dh - prev > maxRun) { maxRun = dh - prev; runAt = prev; }
  out.dead_space = {
    max_run_px: Math.round(maxRun),
    max_run_viewports: vh ? +(maxRun / vh).toFixed(3) : 0,
    ratio: dh ? +(maxRun / dh).toFixed(4) : 0,
    at_y_px: Math.round(runAt),
  };
  // ---- hierarchy: inside each [data-sec] block the first heading
  // must be h1/h2 and no heading may skip a level under it.
  const viol = [];
  const blocks = document.querySelectorAll('[data-sec]');
  const scope = blocks.length ? [...blocks] : [document.body];
  for (const b of scope) {
    const hs = [...b.querySelectorAll('h1,h2,h3,h4,h5,h6')];
    let prevL = 0;
    hs.forEach((h, i) => {
      const l = +h.tagName[1];
      const sec = b.dataset ? b.dataset.sec : 'body';
      if (i === 0 && l > 2)
        viol.push({block: sec, tag: h.tagName,
                   text: h.textContent.trim().slice(0, 50),
                   note: 'first heading in block is below h2'});
      else if (prevL && l > prevL + 1)
        viol.push({block: sec, tag: h.tagName,
                   text: h.textContent.trim().slice(0, 50),
                   note: `h${l} under h${prevL} — skipped level`});
      prevL = l;
    });
  }
  out.hierarchy_violations = viol;
  // ---- rendered line length: running-text elements whose lines
  // run >80 chars. Lines counted from height/line-height; an
  // element only counts once it wraps (≥2 rendered lines).
  const ll = [];
  for (const el of document.querySelectorAll(
        'main p, main blockquote, main li')) {
    const r = vis(el); if (!r) continue;
    const lh = parseFloat(getComputedStyle(el).lineHeight);
    if (!isFinite(lh) || lh <= 0) continue;
    const lines = Math.round(r.height / lh);
    if (lines < 2) continue;
    const cpl = el.textContent.trim().length / lines;
    ll.push({cpl: +cpl.toFixed(1), lines,
             context: `${el.tagName.toLowerCase()} "${
               el.textContent.trim().slice(0, 50)}"`});
  }
  ll.sort((a, b) => b.cpl - a.cpl);
  out.line_length = ll.slice(0, 8);
  // ---- heading rhythm: the rendered gap above a heading must
  // exceed the gap below — measured off box edges inside each
  // [data-sec] block, so margin AND parent gap both count.
  const hrv = [];
  for (const b of scope) {
    const boxes = [...b.querySelectorAll(
        'h1,h2,h3,h4,h5,h6,p,li,blockquote,figure,img,table,ul,ol,'
        + 'dl,pre,form,a[href],button,[data-comp] > div')]
      .map(e => ({e, r: vis(e)})).filter(x => x.r);
    for (const {e: h, r: hr} of boxes) {
      if (!/^H[1-6]$/.test(h.tagName)) continue;
      let top = -1, bot = Infinity;
      for (const {e, r: er} of boxes) {
        if (e === h || e.contains(h) || h.contains(e)) continue;
        if (er.bottom <= hr.top + 1 && er.bottom > top)
          top = er.bottom;
        if (er.top >= hr.bottom - 1 && er.top < bot)
          bot = er.top;
      }
      if (top < 0 || bot === Infinity) continue;
      const a = hr.top - top, bb = bot - hr.bottom;
      if (a + 0.5 <= bb)
        hrv.push({tag: h.tagName,
                  text: h.textContent.trim().slice(0, 50),
                  above_px: +a.toFixed(1), below_px: +bb.toFixed(1)});
    }
  }
  out.heading_rhythm_violations = hrv;
  // ---- load-verify + rendered-only slop checks (R.*) — measured
  // AFTER the scroll pass that runs reveal handlers.
  // non-content nodes (assistive-only text, aria-hidden decor) never
  // count as page copy in any probe below
  const skip = el => el.closest(
      '[aria-hidden="true"],.sr-only,[hidden]');
  // broken images: empty/missing src or failed decode
  const badImgs = [];
  for (const el of document.querySelectorAll('img')) {
    const src = el.getAttribute('src');
    if (!src || !src.trim() || (el.complete && el.naturalWidth === 0))
      badImgs.push((src || '(empty src)').slice(0, 80));
  }
  out.broken_images = badImgs;
  // text hidden at rest: share of own-text chars still opacity~0 /
  // visibility-hidden / display:none after the reveal pass ran
  let hidCh = 0, totCh = 0;
  // a hidden ancestor buries every descendant — computed style on
  // the child alone still reports it visible. Visibility resolves
  // per-element (a child can override `visible` inside a hidden
  // parent); display:none flattens the whole subtree (no painted
  // rect); only opacity needs the ancestor walk — it cannot be
  // overridden downward.
  const buried = el => {
    if (getComputedStyle(el).visibility === 'hidden') return true;
    if (!el.getClientRects().length) return true;
    for (let q = el; q && q !== document.documentElement;
         q = q.parentElement) {
      if (parseFloat(getComputedStyle(q).opacity) < 0.05) return true;
    }
    return false;
  };
  for (const el of document.querySelectorAll('main *')) {
    if (skip(el)) continue;
    let own = '';
    for (const n of el.childNodes)
      if (n.nodeType === 3) own += n.textContent;
    const t = own.trim(); if (!t) continue;
    totCh += t.length;
    if (buried(el)) hidCh += t.length;
  }
  out.hidden_text = {hidden_chars: hidCh, total_chars: totCh,
      share: totCh ? +(hidCh / totCh).toFixed(3) : 0};
  // text-overflow: visible text clipped by its own box
  const tov = [];
  for (const el of document.querySelectorAll(
        'h1,h2,h3,h4,h5,h6,p,li,a,span,button,td,th,label,summary')) {
    const r = vis(el);
    if (!r || skip(el) || !el.textContent.trim()) continue;
    if (el.scrollWidth - el.clientWidth > 2
        && getComputedStyle(el).overflowX !== 'visible')
      tov.push(`${el.tagName.toLowerCase()} "${el.textContent.trim()
        .slice(0, 50)}" +${el.scrollWidth - el.clientWidth}px`);
  }
  out.text_overflow = tov.slice(0, 10);
  // text-occlusion: a visible text element's centre is covered by a
  // later, non-ancestor element with opaque paint
  const occ = [];
  for (const el of document.querySelectorAll(
        'main h1,main h2,main h3,main p,main a,main li')) {
    const r = vis(el);
    if (!r || skip(el) || !el.textContent.trim()) continue;
    if (r.top < 0 || r.top > vh) continue;
    const cx = Math.min(Math.max(r.left + r.width / 2, 0), dw - 1);
    const cy = Math.min(Math.max(r.top + r.height / 2, 0), vh - 1);
    const top = document.elementFromPoint(cx, cy);
    if (!top || top === el || el.contains(top) || top.contains(el))
      continue;
    const tcs = getComputedStyle(top);
    const tb = rgba(tcs.backgroundColor);
    const opaque = parseFloat(tcs.opacity) > 0.9
        && (!tb || tb.length < 4 || tb[3] > 0.9)
        // fixed/sticky chrome (call bars, nav) passes over content
        // transiently — scrolling clears it, not occlusion
        && tcs.position !== 'fixed' && tcs.position !== 'sticky';
    if (opaque) {
      let anc = false;
      for (let q = el.parentElement; q; q = q.parentElement)
        if (q === top) { anc = true; break; }
      if (!anc) occ.push(`${el.tagName.toLowerCase()} "${
        el.textContent.trim().slice(0, 40)}" under ${
        top.tagName.toLowerCase()}.${top.className ?
          String(top.className).split(' ')[0] : ''}`);
    }
  }
  out.text_occlusion = occ.slice(0, 10);
  // body text at the viewport edge: paragraphs/list items with an
  // edge inside 16px of the viewport
  const edge = [];
  for (const el of document.querySelectorAll(
        'main p, main li, main blockquote, main figcaption')) {
    const r = vis(el);
    if (!r || skip(el) || !el.textContent.trim()) continue;
    if (r.left < 16 || r.right > dw - 16)
      edge.push(`${el.tagName.toLowerCase()} "${el.textContent.trim()
        .slice(0, 40)}" edge ${Math.min(r.left,
          dw - r.right).toFixed(0)}px`);
  }
  out.edge_text = edge.slice(0, 10);
  // cramped padding: block text whose own box hugs the nearest
  // painted ancestor's edge (< 2px breathing room)
  const cram = [];
  for (const el of document.querySelectorAll(
        'main p, main h1,main h2,main h3,main li')) {
    const r = vis(el);
    if (!r || skip(el) || !el.textContent.trim()) continue;
    for (let q = el.parentElement; q; q = q.parentElement) {
      const qcs = getComputedStyle(q);
      const qb = rgba(qcs.backgroundColor);
      const bw = parseFloat(qcs.borderLeftWidth) || 0;
      const painted = (qb && qb.length >= 4 && qb[3] > 0.05) || bw > 0;
      if (!painted) continue;
      const qr = q.getBoundingClientRect();
      const gap = Math.min(r.left - qr.left, qr.right - r.right);
      if (gap < 2) {
        cram.push(`${el.tagName.toLowerCase()} "${
          el.textContent.trim().slice(0, 40)}" gap ${
          gap.toFixed(1)}px`);
      }
      break;
    }
  }
  out.cramped_padding = cram.slice(0, 10);
  return out;
}
"""

# Pixel dead space — decoded from the evidence screenshots measure.py
# serves at /__shots__/: a 4px row band is blank when its sampled
# pixels are near-uniform (stddev < 3 luminance). Same quantity as the
# DOM union above, computed from ink instead of boxes.
_PIXEL_JS = r"""
async shotUrl => {
  const img = new Image();
  img.src = shotUrl;
  try { await img.decode(); } catch (e) { return null; }
  const c = document.createElement('canvas');
  c.width = img.naturalWidth; c.height = img.naturalHeight;
  const cx = c.getContext('2d', {willReadFrequently: true});
  cx.drawImage(img, 0, 0);
  const blank = [];
  for (let y = 0; y + 4 <= c.height; y += 4) {
    const row = cx.getImageData(0, y, c.width, 1).data;
    let n = 0, s = 0, s2 = 0;
    for (let x = 0; x < c.width; x += 8) {
      const i = x * 4;
      const l = 0.2126 * row[i] + 0.7152 * row[i + 1]
                + 0.0722 * row[i + 2];
      n++; s += l; s2 += l * l;
    }
    if (!n) { blank.push(true); continue; }
    const mean = s / n, sd = Math.sqrt(Math.max(0, s2 / n - mean * mean));
    blank.push(sd < 3);
  }
  let maxRun = 0, run = 0, runAt = 0;
  blank.forEach((b, i) => {
    run = b ? run + 1 : 0;
    if (run > maxRun) { maxRun = run; runAt = i - run + 1; }
  });
  return {blank_run_px: maxRun * 4,
          blank_ratio: +(maxRun * 4 / c.height).toFixed(4),
          at_y_px: runAt * 4, width: c.width, height: c.height};
}
"""


def _serve(dist, shots_root):
    """One server, two mounts: / → dist, /__shots__/ → shots/."""
    class H(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *a, **kw):
            super().__init__(*a, directory=dist, **kw)

        def translate_path(self, path):
            if path.startswith('/__shots__/'):
                self.directory = shots_root
                path = path[len('/__shots__'):]
            return super().translate_path(path)

        def log_message(self, *a):
            pass
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), H)
    t = threading.Thread(target=srv.serve_forever, daemon=True)
    t.start()
    return srv, srv.server_address[1]


def _pw(ctx):
    """Playwright-measured metrics for every plan page."""
    site = os.path.join(ctx.dir, 'site')
    # HTML mode: serve site/ so the artifact's ../dist/* refs resolve
    # — the standalone site/html/<slug>.html IS the page now; a
    # dist-only dir keeps the old dist-root behavior.
    html_mode = os.path.isdir(os.path.join(site, 'html'))
    dist = os.path.join(site, 'dist')
    if not html_mode and not os.path.isdir(dist):
        return None, 'site/html and site/dist missing — run w6 first'
    shots = os.path.join(ctx.dir, 'shots')
    if not os.path.isdir(shots):
        os.makedirs(shots, exist_ok=True)
    slugs = sorted(ctx.pages() or {'index': {}})
    srv, port = _serve(site if html_mode else dist, shots)
    try:
        script = f'''
import json
import sys
from playwright.sync_api import sync_playwright
slugs = {slugs!r}
widths = {list(MEASURE_WIDTHS)!r}
METRICS_JS = {_JS!r}
PIXEL_JS = {_PIXEL_JS!r}
out = {{}}
with sync_playwright() as p:
    b = p.chromium.launch()
    for slug in slugs:
        url = "http://127.0.0.1:{port}" + (
            "/html/%s.html" % slug if {html_mode!r} else
            "/" + ("" if slug == "index" else slug + "/"))
        page = {{"viewports": {{}}}}
        for w in widths:
            pg = b.new_page(viewport={{"width": w, "height": 1100}})
            errs, failed = [], []
            pg.on("pageerror", lambda e, l=errs:
                  l.append(str(e)[:200]))
            pg.on("requestfailed", lambda rq, l=failed:
                  l.append(rq.url[:160]))
            def _resp(r, l=failed):
                if r.status >= 400 and r.request.resource_type in (
                        "image", "stylesheet", "script", "font"):
                    l.append("%d %s" % (r.status, r.url[:150]))
            pg.on("response", _resp)
            pg.goto(url, wait_until="networkidle")
            # run reveal handlers before measuring: scroll the full
            # page, then return to rest
            pg.evaluate("""async () => {{
                const vh = innerHeight;
                const h = document.documentElement.scrollHeight;
                for (let y = 0; y < h; y += vh) {{
                    scrollTo(0, y);
                    await new Promise(r => setTimeout(r, 110));
                }}
                scrollTo(0, 0);
            }}""")
            pg.wait_for_timeout(250)
            rec = pg.evaluate(METRICS_JS)
            rec["load"] = {{"script_errors": errs,
                            "failed_requests": failed}}
            page["viewports"][str(w)] = rec
            pg.close()
        # dark-mode contrast floor at the primary width
        pg = b.new_page(viewport={{"width": widths[0], "height": 1100}})
        pg.goto(url, wait_until="networkidle")
        pg.evaluate(
            "document.documentElement.dataset.theme='dark';"
            "document.documentElement.classList.add('dark')")
        pg.wait_for_timeout(250)
        dark = pg.evaluate(METRICS_JS)
        page["contrast_dark"] = {{
            "ratio": dark["contrast_min_ratio"],
            "context": dark["contrast_min_context"],
        }}
        # pixel dead space from the evidence shots, light + dark
        pixel = {{}}
        for w in widths:
            for mode in ("light", "dark"):
                shot = "/__shots__/%d-%s-%s.png" % (w, mode, slug)
                r = pg.evaluate(PIXEL_JS, shot)
                if r is not None:
                    pixel["%d-%s" % (w, mode)] = r
        page["pixel"] = pixel
        pg.close()
        out[slug] = page
    b.close()
print(json.dumps(out))
'''
        tmp = os.path.join(ctx.dir, '.measure.py')
        with open(tmp, 'w') as fh:
            fh.write(script)
        pw = PLAYWRIGHT if os.path.exists(PLAYWRIGHT) else sys.executable
        r = subprocess.run([pw, tmp], capture_output=True, text=True)
        os.remove(tmp)
        if r.returncode != 0:
            return None, 'playwright failed\n' + r.stderr[-600:]
        return json.loads(r.stdout), None
    finally:
        srv.shutdown()


def _shots_sha(ctx):
    """sha over the evidence shots measure verified against — a drift
    check the w8 gate re-verifies (J.11)."""
    h = hashlib.sha256()
    shots = os.path.join(ctx.dir, 'shots')
    if not os.path.isdir(shots):
        return None
    for fn in sorted(os.listdir(shots)):
        if fn.endswith('.png'):
            h.update(fn.encode())
            h.update(open(os.path.join(shots, fn), 'rb').read())
    return h.hexdigest()[:16]


def doc(ctx, pages):
    """MEASURE.json body — assembled identically in pipeline dirs and
    fixtures so the schema cannot drift between them."""
    return {
        'tool': 'measure.py',
        'version': 2,
        'dist_sha256': gate._dist_sha(ctx),
        'shots_sha256': _shots_sha(ctx),
        'pages': pages,
    }


def main(argv):
    if len(argv) < 2:
        print(__doc__)
        return 2
    ctx = gate.Ctx(os.path.abspath(argv[1]))
    pages, err = _pw(ctx)
    if err:
        print('measure: ' + err)
        return 1
    m = doc(ctx, pages)
    fp = os.path.join(ctx.dir, 'MEASURE.json')
    with open(fp, 'w') as fh:
        json.dump(m, fh, indent=1, sort_keys=True)
    print(f'measure: {len(pages)} page(s) → MEASURE.json')
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv))
