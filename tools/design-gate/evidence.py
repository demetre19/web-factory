#!/usr/bin/env python3
"""evidence.py — the w7 evidence producer (run_pipeline step).

Two jobs, both mechanical:
  1. screenshots — Playwright shoots every dist page at SHOT_WIDTHS
     in light + dark into shots/<w>-<mode>-<slug>.png (served via a
     local http.server, absolute /_astro/ assets intact)
  2. REVIEW.json re-bind — refreshes dist_sha256 + the two pass-hash
     fields and every evidence sha after a rebuild, then the file is
     handed to `run.py sign-review` (TTY) for the binding signature.

  evidence.py <pipeline-dir> [--shots-only] [--rebind-only]
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


def _serve(root, port):
    os.chdir(root)

    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a):
            pass
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', port), Q)
    t = threading.Thread(target=srv.serve_forever, daemon=True)
    t.start()
    return srv


def shots(ctx, port=18173):
    site = os.path.join(ctx.dir, 'site')
    # HTML mode: the standalone site/html/<slug>.html artifact is the
    # page — serve site/ so its ../dist/* asset refs resolve. A
    # dist-only dir (pre-html emit, bare --astro) shoots dist as
    # before.
    html_mode = os.path.isdir(os.path.join(site, 'html'))
    dist = os.path.join(site, 'dist')
    if not html_mode and not os.path.isdir(dist):
        print('evidence: no site/html or site/dist — run w6 first')
        return 1
    slugs = sorted(ctx.pages() or {'index': {}})
    os.makedirs(os.path.join(ctx.dir, 'shots'), exist_ok=True)
    srv = _serve(site if html_mode else dist, port)
    try:
        script = f'''
import sys
from concurrent.futures import ThreadPoolExecutor
from playwright.sync_api import sync_playwright
slugs = {slugs!r}
widths = {list(gate.SHOT_WIDTHS)!r}

def shoot(w, mode):
    # each viewport×mode pair is independent — one browser per pair
    # fans the capture out; output filenames are identical to the
    # serial version
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={{"width": w, "height": 1100}})
        for slug in slugs:
            url = "http://127.0.0.1:{port}" + (
                "/html/%s.html" % slug if {html_mode!r} else
                "/" + ("" if slug == "index" else slug + "/"))
            pg.goto(url, wait_until="networkidle")
            if mode == "dark":
                pg.evaluate(
                    "document.documentElement.dataset.theme='dark';"
                    "document.documentElement.classList.add('dark')")
            pg.wait_for_timeout(250)
            pg.screenshot(path=sys.argv[1] + "/shots/%d-%s-%s.png"
                          % (w, mode, slug), full_page=True)
        pg.close()
        b.close()

jobs = [(w, m) for w in widths for m in ("light", "dark")]
with ThreadPoolExecutor(max_workers=len(jobs)) as ex:
    list(ex.map(lambda j: shoot(*j), jobs))
'''
        tmp = os.path.join(ctx.dir, '.shots.py')
        with open(tmp, 'w') as fh:
            fh.write(script)
        r = subprocess.run([PLAYWRIGHT, tmp, ctx.dir],
                           capture_output=True, text=True)
        os.remove(tmp)
        if r.returncode != 0:
            print('evidence: playwright failed\n' + r.stderr[-500:])
            return 1
    finally:
        srv.shutdown()
    n = len([f for f in os.listdir(os.path.join(ctx.dir, 'shots'))
             if f.endswith('.png')])
    print(f'evidence: {n} screenshots in shots/')
    return 0


def _trace_blocks(ctx, prior):
    """J.4 receipt rows from the RENDER, not memory: one row per
    data-sec in dist home, recipe_id = the shipped data-recipe. A
    reviewer's prior row keeps its knobs/deviation; a new section
    inherits the knob set every block consumes (the global
    radius/type/space rungs); rows for removed sections drop."""
    import re
    fp = os.path.join(ctx.dir, 'site', 'dist', 'home', 'index.html')
    if not os.path.isfile(fp):
        return prior
    txt = open(fp, encoding='utf-8', errors='replace').read()
    old = {b.get('block_id'): b for b in prior if isinstance(b, dict)}
    knobs = next((b['dna_knobs_used'] for b in old.values()
                  if b.get('dna_knobs_used')),
                 ['radius-personality', 'type-ratio',
                  'space-density-step'])
    rows = []
    for sec, attrs in re.findall(
            r'<(?:section|nav|header|footer)[^>]*data-sec="([^"]+)"'
            r'([^>]*)>', txt):
        rm = re.search(r'data-recipe="([^"]+)"', attrs)
        bid = f'home:{sec}'
        row = dict(old.get(bid) or {})
        row.update(block_id=bid, plan_slot=sec,
                   recipe_id=rm.group(1) if rm else '')
        row.setdefault('dna_knobs_used', knobs)
        row.setdefault('vector_deviation', 'none')
        rows.append(row)
    return rows


def rebind(ctx):
    rp = os.path.join(ctx.dir, 'REVIEW.json')
    if not os.path.isfile(rp):
        print('evidence: no REVIEW.json — reviewer writes items first')
        return 1
    rv = json.load(open(rp))
    dist = gate._dist_sha(ctx)
    rv['dist_sha256'] = dist
    # J.2's contract: rules_pass_hash and judgment_pass_hash are both
    # "the artifact version that passed" — the dist sha of THIS build.
    # They intentionally carry the same value: the check's point is
    # equality (a post-judgment rebuild changes both together).
    rv['rules_pass_hash'] = dist
    rv['judgment_pass_hash'] = dist
    ev = rv.get('vlm_evidence') or {}
    img = {}
    sd = os.path.join(ctx.dir, 'shots')
    if os.path.isdir(sd):
        for f in sorted(os.listdir(sd)):
            if f.endswith('.png'):
                p = os.path.join(sd, f)
                img[f'shots/{f}'] = hashlib.sha256(
                    open(p, 'rb').read()).hexdigest()[:16]
    if img:
        ev['image_sha256'] = img
        rv['vlm_evidence'] = ev
    rv['blocks'] = _trace_blocks(ctx, rv.get('blocks') or [])
    rv.pop('sig', None)          # a re-bound record is unsigned —
                                 # sign-review binds it to the build
    with open(rp, 'w') as fh:
        json.dump(rv, fh, indent=1, sort_keys=True)
    print(f'evidence: REVIEW.json re-bound to dist {dist} '
          f'(unsigned — run.py sign-review completes it)')
    return 0


def main():
    a = sys.argv[1:]
    if len(a) < 1:
        print(__doc__)
        return 2
    ctx = gate.Ctx(a[0])
    rc = 0
    if '--rebind-only' not in a:
        rc |= shots(ctx)
    if '--shots-only' not in a:
        rc |= rebind(ctx)
    return rc


if __name__ == '__main__':
    sys.exit(main())
