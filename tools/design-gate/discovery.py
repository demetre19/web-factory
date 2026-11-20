#!/usr/bin/env python3
"""discovery.py — site wave s0, step 1: what kind of website is this?

Reads ONLY declared sources and writes DISCOVERY.json + DISCOVERY.md
into the site design folder. Every fact carries the source line it
came from, so the DNA built on it is traceable (gate D.1).

  sources
    BRIEF.yaml                      brand, theme, site url, blueprint
    <blueprint>/blueprint.md        business, source context, buyers,
                                    conversion points, central entity
    <site url> homepage + its CSS   live colours (frequency-ranked)
                                    and font families

  outputs
    site_type      → vertical profile (docs/machinery/design/dna/*.json)
    palette        live colours: brand hexes confirmed against BRIEF,
                   the live light surface, neutrals
    fonts          live font families
    vibe           register/energy from the buyer + business frame
    theme          BRIEF theme (operator) — never overridden

  python3 discovery.py <site-dir> [--offline]
"""
import json
import os
import re
import sys
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import site_folder as SF  # noqa: E402

PROFILES = os.path.join(HERE, '..', '..', 'docs', 'machinery', 'design',
                        'dna')

# business words → vertical profile. First match wins; the matched
# word is recorded as evidence. Order: specific before generic.
SITE_TYPE_RULES = [
    (r'\bdental|dentist', 'healthcare'),
    (r'\bclinic|medical practice|health\b', 'healthcare'),
    (r'\bschool|college|university|education provider', 'education'),
    (r'\blaw firm|lawyer|solicitor', 'legal'),
    (r'\breal estate|property agent', 'real-estate'),
    (r'\brestaurant|cafe|hotel|hospitality', 'hospitality'),
    (r'\bjewell', 'jewellery'),
    (r'\bsaas|software|platform\b', 'saas'),
    (r'\bcleaning|cleaner|contractor|trade|plumb|electric|landscap|'
     r'mulch|services?\b', 'services'),
]

# buyer frame → vibe. B2B contract buyers read calm/approachable, a
# consumer-luxury frame reads premium, etc. Each rule cites its match.
VIBE_RULES = [
    (r'\bB2B|contract|facility|business manager|manager', {
        'mood-register': 'approachable', 'mood-energy': 'calm',
        'words': ['dependable', 'orderly', 'plain-spoken']}),
    (r'\bluxury|premium|bespoke', {
        'mood-register': 'premium', 'mood-energy': 'still',
        'words': ['refined', 'quiet', 'exact']}),
]


def _get(url, timeout=20):
    req = urllib.request.Request(url, headers={'User-Agent':
                                                'web-factory-discovery'})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read().decode('utf-8', 'replace')


# the Automatic.css size/spacing tokens discovery extracts verbatim —
# dna_from_discovery back-solves the dashboard settings from these
# clamps (docs/machinery/ACSS-FLUID-REFERENCE.md §4-5)
ACSS_VARS = (
    '--root-font-size', '--content-width', '--gutter',
    '--text-xs', '--text-s', '--text-m', '--text-l', '--text-xl',
    '--text-xxl',
    '--h1', '--h2', '--h3', '--h4', '--h5', '--h6',
    '--space-xs', '--space-s', '--space-m', '--space-l', '--space-xl',
    '--space-xxl',
    '--section-space-xs', '--section-space-s', '--section-space-m',
    '--section-space-l', '--section-space-xl', '--section-space-xxl',
    '--content-gap', '--container-gap', '--grid-gap',
    '--btn-padding-block', '--btn-padding-inline', '--radius',
)
_ACSS_DECL = re.compile(
    r'(--[\w-]+)\s*:\s*(clamp\([^;]+\)|max\([^;]+clamp[^;]+\)|'
    r'var\(--[\w-]+\)|[\d.]+%|[\d.]+rem|[\d.]+em|[\d.]+px)\s*;')


def acss_capture(site_url, html, fetched_css, offline=False,
                 site_dir=''):
    """→ live.acss record or None. The site's automatic.css is the
    operator's existing ACSS settings made CSS: extract the size
    tokens verbatim. Sources in order: an uploads/automatic-css URL
    seen in the page/CSS already fetched, the standard uploads path
    on the site host (when online), then a snapshot a prior online
    run left in assets/automatic.css (so --offline replays it
    byte-identically)."""
    acss_text = ''
    url = ''
    if not offline:
        m = re.search(r'https?:[^"\'\s>]*uploads/automatic-css/'
                      r'automatic(?:-variables)?\.css[^"\'\s>]*',
                      html + fetched_css)
        cands = ([m.group(0)] if m else [])
        host = re.match(r'(https?://[^/]+)', site_url or '')
        if host:
            cands.append(host.group(1) +
                         '/wp-content/uploads/automatic-css/'
                         'automatic.css')
        for u in cands:
            try:
                acss_text = _get(u)
                url = u
            except Exception:
                acss_text = ''
            if acss_text:
                break
    if not acss_text and site_dir:
        snap = os.path.join(site_dir, 'assets', 'automatic.css')
        if os.path.isfile(snap):
            acss_text = open(snap, encoding='utf-8',
                             errors='replace').read()
            url = 'snapshot assets/automatic.css'
    if not acss_text:
        return None
    decls = dict(_ACSS_DECL.findall(acss_text))
    found = {v.lstrip('-'): decls[v] for v in ACSS_VARS if v in decls}
    if not any(k.startswith('text') or k.startswith('h')
               for k in found):
        return None
    if site_dir and url.startswith('http'):
        # keep the operator's ACSS file so an offline replay captures
        # the same tokens byte-identically
        snap = os.path.join(site_dir, 'assets', 'automatic.css')
        try:
            prev = open(snap, encoding='utf-8',
                        errors='replace').read() \
                if os.path.isfile(snap) else ''
            if prev != acss_text:
                open(snap, 'w', encoding='utf-8').write(acss_text)
        except OSError:
            pass
    return {'source': url, 'vars': found}


def _table_value(md, field):
    m = re.search(r'^\|\s*' + re.escape(field) + r'\s*\|\s*(.+?)\s*\|\s*$',
                  md, re.M)
    return m.group(1).strip() if m else ''


def blueprint_frame(bp_dir):
    p = os.path.join(bp_dir, 'blueprint.md')
    md = open(p, encoding='utf-8').read()
    biz = re.search(r'^\*\*Business:\*\*\s*(.+)$', md, re.M)
    return {
        'path': p,
        'business': biz.group(1).strip() if biz else '',
        'source_context': _table_value(md, 'Source context'),
        'central_entity': _table_value(md, 'Central entity'),
        'conversion_points': _table_value(md, 'Conversion points'),
    }


def live_site(url, offline=False, site_dir=''):
    if offline or not url:
        # offline: the only live evidence is a snapshot a previous
        # online run stored — still replay it byte-identically
        return {'url': url, 'fetched': False,
                'acss': acss_capture(url, '', '', offline=True,
                                     site_dir=site_dir)}
    html = _get(url)
    css_urls = re.findall(r'href="([^"]+\.css[^"]*)"', html)[:3]
    css = ''
    for u in css_urls:
        u = 'https:' + u if u.startswith('//') else u
        try:
            css += _get(u)
        except Exception:
            pass
    blob = html + css
    # framework preset palettes (WordPress core, Bricks builder) are
    # not the brand's colours — drop every hex they declare.
    preset = {h.upper() for h in re.findall(
        r'--(?:wp--preset--color|bricks)-[\w-]*:\s*(#[0-9a-fA-F]{6})\b',
        blob)}
    hexes = {}
    for h in re.findall(r'#[0-9a-fA-F]{6}\b', blob):
        h = h.upper()
        if h in preset:
            continue
        hexes[h] = hexes.get(h, 0) + 1
    body = re.search(r'\bbody\s*\{[^}]*?[;{\s]color:\s*(#[0-9a-fA-F]{3,6})',
                     blob)
    body_ink = body.group(1).upper() if body else ''
    if len(body_ink) == 4:
        body_ink = '#' + ''.join(c * 2 for c in body_ink[1:])
    fonts = {}
    for f in re.findall(r'font-family:\s*([^;}]+)', blob):
        name = f.split(',')[0].strip().strip('"\'')
        if name.lower() in ('inherit', 'monospace', 'sans-serif', 'serif',
                            'initial') or 'icon' in name.lower() \
                or 'awesome' in name.lower() or 'themify' in name.lower() \
                or name.startswith('var('):
            continue
        name = name[:1].upper() + name[1:]
        key = next((k for k in fonts if k.lower() == name.lower()), name)
        fonts[key] = fonts.get(key, 0) + 1
    for m in re.findall(r'text-font-family:\s*([\w -]+)', blob):
        n = m.strip()
        key = next((k for k in fonts if k.lower() == n.lower()), n.title())
        fonts[key] = fonts.get(key, 0) + 1
    return {'url': url, 'fetched': True, 'css': css_urls,
            'preset_hexes_dropped': sorted(preset),
            'body_ink': body_ink,
            'acss': acss_capture(url, html, css, site_dir=site_dir),
            'hex_freq': dict(sorted(hexes.items(), key=lambda kv: -kv[1])
                             [:20]),
            'font_freq': dict(sorted(fonts.items(), key=lambda kv: -kv[1])
                              [:6])}


def _lum(h):
    r, g, b = (int(h[i:i + 2], 16) / 255 for i in (1, 3, 5))
    f = (lambda c: c / 12.92 if c <= 0.03928 else ((c + .055) / 1.055)
         ** 2.4)
    return .2126 * f(r) + .7152 * f(g) + .0722 * f(b)


def palette(brief, live):
    brand = brief.get('brand') or {}
    freq = live.get('hex_freq') or {}
    out = {'accent': {'value': brand.get('accent'), 'source': 'BRIEF',
                      'live_count': freq.get(str(brand.get('accent')
                                                 or '').upper(), 0)},
           'secondary': {'value': brand.get('secondary'),
                         'source': 'BRIEF',
                         'live_count': freq.get(str(brand.get('secondary')
                                                    or '').upper(), 0)}}
    # the live light surface: the most frequent near-white that is not
    # pure white (pure white is the canvas, declared by BRIEF)
    lights = [(h, n) for h, n in freq.items()
              if _lum(h) > 0.85 and h != '#FFFFFF' and n >= 3]
    if lights:
        out['surface'] = {'value': lights[0][0], 'source':
                          f'live site ({lights[0][1]} uses)'}
    if live.get('body_ink'):
        out['ink'] = {'value': live['body_ink'],
                      'source': 'live site body { color }'}
    return out


def site_type(frame):
    # what the business IS: the bold head of the source context (its
    # own noun phrase), then the business line. Customer nouns later
    # in the sentence (schools, clinics) are buyers, not the site type.
    head = re.search(r'\*\*(.+?)\*\*', frame['source_context'])
    text = head.group(1) if head else frame['business']
    for rx, prof in SITE_TYPE_RULES:
        m = re.search(rx, text, re.I)
        if m and os.path.isfile(os.path.join(PROFILES, prof + '.json')):
            return {'value': prof, 'evidence': m.group(0),
                    'source': frame['path']}
    return {'value': 'services', 'evidence': '(no rule matched)',
            'source': 'default'}


def vibe(frame):
    text = ' '.join([frame['business'], frame['source_context']])
    for rx, v in VIBE_RULES:
        m = re.search(rx, text, re.I)
        if m:
            return dict(v, evidence=m.group(0), source=frame['path'])
    return {'mood-register': 'approachable', 'mood-energy': 'balanced',
            'words': [], 'evidence': '(no rule matched)',
            'source': 'default'}


def render_md(d):
    L = ['<!-- GENERATED by discovery.py — do not edit; re-run it -->',
         f"# DISCOVERY — {d['brand'].get('name')}", '',
         '## What kind of website', '',
         '| Fact | Value | Source |', '|---|---|---|',
         f"| Business | {d['frame']['business']} | blueprint.md |",
         f"| Source context | {d['frame']['source_context']} | blueprint.md |",
         f"| Central entity | {d['frame']['central_entity']} | blueprint.md |",
         f"| Conversion points | {d['frame']['conversion_points']} | "
         'blueprint.md |',
         f"| Site type → profile | **{d['site_type']['value']}** (matched "
         f"“{d['site_type']['evidence']}”) | rule table in discovery.py |",
         '', '## Colour scheme', '',
         '| Role | Hex | Source |', '|---|---|---|',
         f"| canvas | `{d['theme'].get('canvas')}` | BRIEF theme "
         f"(default {d['theme'].get('default')}, follow OS "
         f"{d['theme'].get('follow_os')}) |"]
    for role, v in d['palette'].items():
        extra = (f" · {v['live_count']} uses on live site"
                 if 'live_count' in v else '')
        L.append(f"| {role} | `{v['value']}` | {v['source']}{extra} |")
    L += ['', '## Typography (live site)', '',
          '| Family | Uses |', '|---|---|']
    for f, n in (d['live'].get('font_freq') or {}).items():
        L.append(f'| {f} | {n} |')
    if (d['live'].get('acss') or {}).get('vars'):
        av = d['live']['acss']
        L += ['', '## Automatic.css on the live site (extracted)', '',
              '| Token | Live value |', '|---|---|']
        for k, v in av['vars'].items():
            L.append(f'| --{k} | `{v}` |')
        L += ['', f"· source: {av.get('source')}"]
    L += ['', '## Vibe', '',
          f"- register: **{d['vibe']['mood-register']}**, energy: "
          f"**{d['vibe']['mood-energy']}** (matched "
          f"“{d['vibe']['evidence']}”)",
          f"- words: {', '.join(d['vibe']['words'])}", '']
    return '\n'.join(L)


def discover(site_dir, offline=False):
    b = SF.load_yaml(os.path.join(site_dir, 'BRIEF.yaml'))
    s = b.get('site') or {}
    frame = blueprint_frame(s.get('blueprint') or '')
    prev = os.path.join(site_dir, 'DISCOVERY.json')
    if offline and os.path.isfile(prev):
        # replay: the live capture is research already on disk; the
        # rest is recomputed so a rule change still shows (X.1)
        live = json.load(open(prev, encoding='utf-8')).get('live') or {}
        if not live.get('acss'):
            live['acss'] = acss_capture(s.get('url'), '', '',
                                        offline=True,
                                        site_dir=site_dir)
    else:
        live = live_site(s.get('url'), offline=offline,
                         site_dir=site_dir)
    d = {'generated_by': 'discovery.py',
         'brief_sha256': SF.sha(os.path.join(site_dir, 'BRIEF.yaml')),
         'brand': b.get('brand') or {}, 'theme': b.get('theme') or {},
         'frame': frame, 'live': live,
         'site_type': site_type(frame), 'vibe': vibe(frame),
         'palette': palette(b, live)}
    fonts = list((live.get('font_freq') or {}).keys())
    d['fonts'] = {'display': fonts[0] if fonts else '',
                  'body': fonts[0] if fonts else '',
                  'source': 'live site' if fonts else 'none found'}
    with open(os.path.join(site_dir, 'DISCOVERY.json'), 'w') as fh:
        json.dump(d, fh, indent=1, ensure_ascii=False)
        fh.write('\n')
    with open(os.path.join(site_dir, 'DISCOVERY.md'), 'w') as fh:
        fh.write(render_md(d))
    return d


def main():
    a = [x for x in sys.argv[1:] if not x.startswith('--')]
    if len(a) != 1:
        print(__doc__)
        return 2
    d = discover(os.path.abspath(a[0]), offline='--offline' in sys.argv)
    print(f"DISCOVERY: type={d['site_type']['value']} "
          f"vibe={d['vibe']['mood-register']}/{d['vibe']['mood-energy']} "
          f"fonts={d['fonts']['display'] or '-'} "
          f"palette={ {k: v['value'] for k, v in d['palette'].items()} }")
    return 0


if __name__ == '__main__':
    sys.exit(main())
