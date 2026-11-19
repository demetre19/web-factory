#!/usr/bin/env -S uv run --quiet --script
# /// script
# requires-python = ">=3.10"
# dependencies = ["pillow", "numpy"]
# ///
"""Capture-validity gate.

A screenshot of a Cloudflare challenge, a 404, a cookie wall or a blank
render is not a design. If it enters the corpus it is counted as
evidence, embedded, and trained on, and every number downstream is
quietly wrong. This gate decides, from evidence, whether a capture is a
page at all, and records the verdict in the site's meta.json:

  capture_status: ok | blocked | error | blank | parked
  capture_reason: machine code + the evidence it rests on

Evidence, in order of strength:
  1. HTTP probe (realistic UA, no CAPTCHA solving, no JS): status,
     final URL, <title>, visible text. Challenge/WAF pages say so.
  2. Pixels: near-uniform tiles (blank/black), tiny ink, no chroma.
  3. Meta: missing tiles, impossible dimensions.

It never tries to get past a challenge. A blocked site is reported, not
defeated.

  uv run capture_ok.py probe        # HTTP evidence -> meta.probe
  uv run capture_ok.py verdict      # status+reason -> meta, + quarantine
  uv run capture_ok.py report       # counts by status/source
"""
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.normpath(os.path.join(HERE, '..', 'data'))
CORPORA = ('web/canon', 'web/negatives', 'web/quarantine')
QUARANTINE = os.path.join(DATA, 'quarantine.json')
UA = ('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
      'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36')

# A challenge page tells you it is one. Match on the visible text, not on
# the presence of a vendor script: many good sites ship Cloudflare.
BLOCKED = [
    (r'just a moment', 'cloudflare_just_a_moment'),
    (r'performing security verification', 'cloudflare_security_verification'),
    (r'verif(y|ying) (that )?you are (a )?human', 'human_verification'),
    (r'checking (your|the) browser', 'browser_check'),
    (r'enable javascript and cookies to continue', 'js_cookie_wall'),
    (r'attention required', 'cloudflare_attention_required'),
    (r'access denied', 'access_denied'),
    (r'you have been blocked', 'blocked'),
    (r'request (was )?blocked', 'request_blocked'),
    (r'ddos protection', 'ddos_protection'),
    (r'are you a robot', 'captcha'),
    (r'pardon our interruption', 'interruption'),
    (r'unusual traffic', 'unusual_traffic'),
    (r'press (and|&) hold', 'press_and_hold'),
    (r'incapsula|perimeterx|datadome|_pxcaptcha', 'waf_vendor'),
]
ERRORS = [
    (r'\b404\b|page not found|this page could not be found', 'http_404'),
    (r'\b500\b|internal server error', 'http_500'),
    (r'\b403\b|forbidden', 'http_403'),
    (r'\b502\b|bad gateway', 'http_502'),
    (r'site not found|no such host|dns (error|failure)', 'dns'),
    (r'something went wrong|error occurred', 'error_page'),
]
# Strong parked signals: only a registrar/parking service writes these.
PARKED_STRONG = [
    (r'domain (is|may be) for sale', 'domain_for_sale'),
    (r'buy this domain|this domain is parked', 'parked_domain'),
    (r'godaddy.*parked|sedo\.com|afternic|hugedomains', 'parking_service'),
    (r'expired domain', 'expired'),
]
# Weak signals need a tiny page AND the phrase in the *title* — a real
# marketing page says "36 projects under construction" all the time.
PARKED_WEAK = r'^(coming soon|under construction|we are (being )?built|launching soon|parking page)$'

COOKIE = [(r'we value your privacy|we use cookies|accept (all )?cookies',
           'cookie_wall')]

sys.path.insert(0, HERE)
import cache  # noqa: E402

RULESET_V = cache.text_sha(repr(
    (BLOCKED, ERRORS, PARKED_STRONG, PARKED_WEAK)))[:12]

TITLE_RE = re.compile(r'<title[^>]*>(.*?)</title>', re.S | re.I)
TAG_RE = re.compile(r'<(script|style|noscript|svg)[^>]*>.*?</\1>', re.S | re.I)
TEXT_RE = re.compile(r'<[^>]+>')


def sites(corpus):
    root = os.path.join(DATA, corpus)
    if not os.path.isdir(root):
        return
    for name in sorted(os.listdir(root)):
        d = os.path.join(root, name)
        mp = os.path.join(d, 'meta.json')
        if os.path.isdir(d) and os.path.exists(mp):
            yield name, d, mp


def visible_text(html, limit=4000):
    html = TAG_RE.sub(' ', html)
    txt = TEXT_RE.sub(' ', html)
    txt = re.sub(r'&nbsp;|&#160;', ' ', txt)
    txt = re.sub(r'\s+', ' ', txt).strip()
    return txt[:limit]


def probe(url, timeout=25, use_cache=True):
    if use_cache:
        hit = cache.get('capture', f'{cache.text_sha(url)}:probe:v1')
        if hit is not None:
            return hit
    req = urllib.request.Request(url, headers={
        'User-Agent': UA,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-AU,en;q=0.9',
    })
    t0 = time.time()
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            raw = r.read(400_000)
            enc = r.headers.get_content_charset() or 'utf-8'
            html = raw.decode(enc, 'replace')
            m = TITLE_RE.search(html)
            pr = {'status': r.status, 'final_url': r.geturl(),
                  'title': (m.group(1).strip()[:200] if m else ''),
                  'text_sample': visible_text(html)[:1200],
                  'bytes': len(raw), 'seconds': round(time.time() - t0, 2),
                  'fetched_at': time.strftime('%Y-%m-%dT%H:%M:%SZ',
                                              time.gmtime())}
            cache.put('capture', f'{cache.text_sha(url)}:probe:v1', pr)
            return pr
    except urllib.error.HTTPError as e:
        body = ''
        try:
            body = visible_text(e.read(200_000).decode('utf-8', 'replace'))[:600]
        except Exception:
            pass
        return {'status': e.code, 'final_url': url, 'title': '', 'error': str(e),
                'text_sample': body, 'seconds': round(time.time() - t0, 2),
                'fetched_at': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())}
    except Exception as e:
        return {'status': 0, 'final_url': url, 'title': '', 'error': str(e),
                'text_sample': '', 'seconds': round(time.time() - t0, 2),
                'fetched_at': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())}


def text_verdict(pr):
    hay = f"{pr.get('title','')} {pr.get('text_sample','')}".lower()
    if not hay.strip():
        return None
    for pat, code in BLOCKED:
        if re.search(pat, hay):
            return 'blocked', code
    for pat, code in ERRORS:
        if re.search(pat, hay):
            return 'error', code
    for pat, code in PARKED_STRONG:
        if re.search(pat, hay):
            return 'parked', code
    title = (pr.get('title') or '').strip().lower()
    if re.match(PARKED_WEAK, title) and len(hay) < 350:
        return 'parked', 'placeholder_title'
    return None


def pixel_verdict(d, probe_res=None):
    """Uniform renders are not pages — but a short page is not a failure.

    Measured as luminance variance, not ink: a black-on-black luxury page
    has almost no "ink" but plenty of variance, while a failed screenshot
    is a single flat colour. Trailing flat tiles are what a page shorter
    than the capture window looks like, so they are trimmed, not failed;
    a flat *first* tile with content below it is a capture glitch.
    """
    from PIL import Image
    import numpy as np
    tiles = sorted(f for f in os.listdir(d) if f.startswith('tile-'))
    if not tiles:
        return 'blank', 'no_tiles'
    stds = []
    for t in tiles:
        im = Image.open(os.path.join(d, t)).convert('RGB')
        im.thumbnail((240, 400))
        a = np.asarray(im, dtype=np.float32)
        stds.append(float(a.mean(axis=2).std()))
    flat = [x < 2.0 for x in stds]
    content = [i for i, f in enumerate(flat) if not f]
    if not content:
        return 'blank', f'near_uniform_tiles(std_max={max(stds):.2f})'
    if flat[0]:
        return 'blank', f'first_tile_flat(std={stds[0]:.2f})'
    return None


def tile_fingerprint(d):
    """cheap content proxy: tile names+sizes. Byte hashing every tile of
    every site costs minutes; a tile that changes size changes its hash."""
    parts = []
    for f in sorted(os.listdir(d)):
        if f.startswith('tile-'):
            parts.append(f'{f}:{os.path.getsize(os.path.join(d, f))}')
    return cache.text_sha('|'.join(parts))[:16]


def stretched_verdict(meta, d):
    """A hero/media block taller than ~1.2 viewports is a capture
    artefact: the old 6000px window turned every 100vh section into a
    giant tablet. Playwright captures at 900px viewport so the block
    itself is the page's real height — this only fires on legacy or
    broken captures."""
    vh = (meta.get('viewport') or [1440, 900])[1]
    # DOM geometry check first: a single non-nav section taller than
    # both 1.5 viewports and 60% of the page means segmentation saw one
    # detector wrapper, not real sections (174-site leak: tiles look
    # fine, DOM is one 8-11k px block).
    secs = meta.get('sections') or []
    if secs:
        geoms = [s.get('geometry') or {} for s in secs]
        H = (max(g.get('top', 0) + g.get('height', 0) for g in geoms)
             - min(g.get('top', 0) for g in geoms)) if geoms else 0
        for s in secs:
            g = s.get('geometry') or {}
            h = g.get('height', 0)
            loc = str(s.get('locator') or '')
            # section_type lies on wrapper bugs (classifier labels the
            # giant #__next block 'nav'); a root wrapper covering the
            # page is a capture artefact regardless of the label.
            wrapper = loc.lstrip('#').lower() in (
                '__next', 'root', 'app', '___gatsby', 'main-content')
            st = str(s.get('section_type') or '').lower()
            if H and h > max(1.5 * vh, 0.6 * H) and (
                    wrapper or st not in ('nav', 'footer')):
                return 'stretched', (
                    f'dom section {h:.0f}px ({h / vh:.1f}vh, '
                    f'{h / H:.0%} of page) — wrapper not segments')
    tiles = sorted(f for f in os.listdir(d) if f.startswith('tile-'))
    if not tiles:
        return None
    try:
        import image_features
        feat = image_features.analyze(os.path.join(d, tiles[0]))
    except Exception:
        return None
    for b in feat.get('blocks') or []:
        h = (b['y1'] - b['y0']) * feat['h']
        if h > 1.5 * vh and (b.get('has_media') or
                             b.get('role') == 'main'):
            return 'stretched', (f'block {h / vh:.1f}vh at top of page '
                                 f'(viewport {vh}px)')
    return None


def decide(meta, d):
    """(capture_status, reason) for one site directory.

    The single decision function: the batch verdict pass, the capture
    scripts and any future discovery writer all call this.
    """
    key = (f"{cache.text_sha(meta.get('url') or d)}:"
           f"{RULESET_V}:{tile_fingerprint(d)}")
    hit = cache.get('capture', key + ':verdict')
    if hit is not None:
        return hit['status'], hit['reason']
    v = _decide(meta, d)
    cache.put('capture', key + ':verdict',
              {'status': v[0], 'reason': v[1]})
    return v


def _decide(meta, d):
    pr = meta.get('probe') or {}
    if pr:
        v = text_verdict(pr)
        if v:
            return v
        if pr.get('status') == 0:
            return 'error', f'no_response({pr.get("error", "")[:60]})'
        if pr.get('status', 0) >= 400:
            return 'error', f'http_{pr["status"]}'
    sv = stretched_verdict(meta, d)
    if sv:
        return sv
    pv = pixel_verdict(d, pr)
    if pv:
        return pv
    return 'ok', ''


def cmd_probe():
    n = 0
    for corpus in CORPORA:
        for name, d, mp in sites(corpus):
            meta = json.load(open(mp))
            if meta.get('probe') and not os.environ.get('PROBE_REFRESH'):
                continue
            pr = probe(meta['url'], use_cache=not os.environ.get('PROBE_REFRESH'))
            meta['probe'] = pr
            json.dump(meta, open(mp, 'w'), indent=1)
            n += 1
            print(f'{corpus}/{name}: {pr["status"]} {pr["title"][:60]!r} '
                  f'{pr["seconds"]}s', flush=True)
    print(f'probed {n} sites')


def content_tiles(d):
    """Number of leading tiles that are not flat (the page's real extent)."""
    from PIL import Image
    import numpy as np
    tiles = sorted(f for f in os.listdir(d) if f.startswith('tile-'))
    n = 0
    for t in tiles:
        im = Image.open(os.path.join(d, t)).convert('RGB')
        im.thumbnail((240, 400))
        if float(np.asarray(im, dtype=np.float32).mean(axis=2).std()) >= 2.0:
            n += 1
        else:
            break
    return n


def cmd_verdict():
    q = {}
    counts = {}
    for corpus in CORPORA:
        for name, d, mp in sites(corpus):
            meta = json.load(open(mp))
            status, reason = decide(meta, d)
            meta['capture_status'] = status
            meta['capture_reason'] = reason
            meta['content_tiles'] = content_tiles(d)
            meta['schema_version'] = meta.get('schema_version', '1.0')
            json.dump(meta, open(mp, 'w'), indent=1)
            counts[(corpus, status)] = counts.get((corpus, status), 0) + 1
            if status != 'ok':
                q[f'{corpus}/{name}'] = {'status': status, 'reason': reason,
                                         'url': meta.get('url')}
    json.dump({'generated': time.strftime('%Y-%m-%dT%H:%M:%SZ',
                                          time.gmtime()),
               'rule': 'capture_ok: blocked|error|blank|parked are '
                       'excluded from annotations, patterns, embeddings, '
                       'search and training',
               'sites': q}, open(QUARANTINE, 'w'), indent=1)
    for k in sorted(counts):
        print(f'{k[0]:10s} {k[1]:8s} {counts[k]}')
    print(f'quarantined {len(q)} sites -> {os.path.relpath(QUARANTINE, DATA)}')


def cmd_report():
    q = json.load(open(QUARANTINE))['sites']
    for corpus in CORPORA:
        tot = sum(1 for _ in sites(corpus))
        bad = sum(1 for k in q if k.startswith(corpus + '/'))
        print(f'{corpus}: {tot} sites, {bad} quarantined ({bad/max(1,tot):.0%})')
    from collections import Counter
    c = Counter(v['status'] for v in q.values())
    r = Counter(v['reason'].split('(')[0] for v in q.values())
    print('status', dict(c))
    print('reasons', dict(r.most_common(12)))


if __name__ == '__main__':
    {'probe': cmd_probe, 'verdict': cmd_verdict,
     'report': cmd_report}[sys.argv[1] if len(sys.argv) > 1 else 'report']()
