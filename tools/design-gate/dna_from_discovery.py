#!/usr/bin/env python3
"""dna_from_discovery.py — site wave s0, step 2: discovery → design DNA.

  inputs   <site>/BRIEF.yaml        operator facts (accent, canvas, logo)
           <site>/DISCOVERY.json    discovery.py output (type, vibe,
                                    live palette, live fonts)
           docs/machinery/design/dna/<type>.json   vertical genome profile
  outputs  <site>/DNA.json          the single source of truth (v0 until
                                    the operator locks the look at w4)
           <site>/TOKENS.json       emit_global.tokens_json(DNA)
           <site>/DESIGN-SYSTEM.md  human-readable system, generated
           <site>/assets/fonts/*    self-hosted discovered font files

Every colour, font and gene names its source in DNA.provenance. Rules:
  genotype     profile dominants (dna_tokens.derive, burst 0 = no
               wildcard) + vibe genes from DISCOVERY
  canvas       BRIEF theme.canvas, light first paint (follow_os false)
  surface/ink  live site (DISCOVERY.palette), kept only when contrast
               holds (ink ≥ 7:1 on canvas, ≥ 4.5:1 on surface)
  neutrals     mixed from the discovered ink + surface, never invented
  accent       BRIEF brand.accent; dark mode uses the brand secondary
               when the accent fails 4.5:1 on the dark canvas
  fonts        the live site family when an open licensed source serves
               it (FONT_SOURCES); else the profile stack

  python3 dna_from_discovery.py <site-dir> [--offline]
"""
import json
import os
import re
import sys
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import site_folder as SF  # noqa: E402
import dna_tokens as T  # noqa: E402
import gate  # noqa: E402
import emit_global  # noqa: E402
import clamp  # noqa: E402

# open-licence sources the machinery may self-host from:
# name → (CSS api, licence, weights the family ships)
FONT_SOURCES = {
    'satoshi': ('https://api.fontshare.com/v2/css?f[]=satoshi@{w}'
                '&display=swap', 'Fontshare · ITF Free Font License',
                (300, 400, 500, 700, 900)),
}
BODY_WEIGHT = 400  # P.12: body + display = two weights of one family

# B2B services norms (no rating-gap data for a new build): conversion,
# trust, clarity and a11y lead. Recorded as a chosen rule.
VECTOR_TARGETS = {'ease_of_use': 8, 'clarity': 9, 'layout': 8,
                  'typography': 8, 'colour': 8, 'rhythm': 8, 'imagery': 7,
                  'trust': 9, 'conversion': 9, 'seo': 9, 'mobile': 9,
                  'speed': 9, 'a11y': 9}


def _rgb(h):
    return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))


def mix(a, b, t):
    """a→b by t (0..1), sRGB channel mix."""
    ra, rb = _rgb(a), _rgb(b)
    return '#' + ''.join(f'{round(x + (y - x) * t):02X}'
                         for x, y in zip(ra, rb))


def _oklch_to_rgb(L, C, H):
    """OKLCh → sRGB (inverse of gate._oklch_lch)."""
    import math
    h = math.radians(H)
    a, bb = C * math.cos(h), C * math.sin(h)
    l = L + 0.3963377774 * a + 0.2158037573 * bb
    m = L - 0.1055613458 * a - 0.0638541728 * bb
    s = L - 0.0894841775 * a - 1.2914855480 * bb
    l, m, s = l ** 3, m ** 3, s ** 3
    r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
    g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
    b = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s

    def gam(c):
        c = min(1.0, max(0.0, c))
        return 12.92 * c if c <= 0.0031308 else \
            1.055 * (c ** (1 / 2.4)) - 0.055
    return (gam(r), gam(g), gam(b))


# C.3 neutral-tint bands (gate.check_neutral_tint): (floor, cap) OKLCH C
# per role — neutrals carry the brand hue, never dead grey.
_NEUTRAL_BANDS = {'surface': (0.0015, 0.035),
                  'surface_elevated': (0.002, 0.040),
                  'border': (0.002, 0.045), 'ink_muted': (0.002, 0.060),
                  'ink': (0.002, 0.050), 'inverse': (0.002, 0.040)}


def tint_neutral(role, hexv, hue):
    """Clamp the neutral's OKLCH C into its C.3 band, hue taken from the
    brand accent (tint, never re-colour)."""
    band = _NEUTRAL_BANDS.get(role)
    lch = gate._oklch_lch(hexv)
    if band is None or lch is None or hue is None:
        return hexv
    lo, hi = band
    L, C, _ = lch
    if lo <= C <= hi:
        return hexv
    # aim mid-band — sRGB quantization can shave ~0.001 off C, which
    # would drop a floor-clamped value back under the C.3 floor
    C = (lo + hi) / 2 if not (lo <= C <= hi) else C
    r, g, b = _oklch_to_rgb(L, C, hue)
    return '#' + ''.join(f'{round(c * 255):02X}' for c in (r, g, b))


def contrast(a, b):
    return gate.contrast(a, b)


def fetch_font(site_dir, family, weights, offline):
    """→ (faces[{weight, file}], source) or ([], reason)."""
    key = family.lower()
    if key not in FONT_SOURCES:
        return [], f'no open-licence source for {family!r}'
    api, lic, _ = FONT_SOURCES[key]
    out_dir = os.path.join(site_dir, 'assets', 'fonts')
    os.makedirs(out_dir, exist_ok=True)
    faces = []
    for w in weights:
        fn = f'{key}-{w}.woff2'
        path = os.path.join(out_dir, fn)
        if not os.path.isfile(path):
            if offline:
                return [], f'{fn} not captured and --offline'
            css = urllib.request.urlopen(api.format(w=w), timeout=20) \
                .read().decode()
            m = re.search(r"url\('([^']+\.woff2)'\)", css)
            if not m:
                return [], f'{lic}: no woff2 for weight {w}'
            url = 'https:' + m.group(1) if m.group(1).startswith('//') \
                else m.group(1)
            with open(path, 'wb') as fh:
                fh.write(urllib.request.urlopen(url, timeout=30).read())
        faces.append({'weight': w, 'file': f'/fonts/{fn}',
                      'sha256': SF.sha(path)})
    return faces, lic


def light_roles(disc, brief, prov):
    theme = brief.get('theme') or {}
    pal = disc.get('palette') or {}
    canvas = theme.get('canvas') or '#FFFFFF'
    prov['color.bg'] = {'tag': 'chosen', 'source': 'BRIEF theme.canvas'}
    surface = (pal.get('surface') or {}).get('value')
    if not surface or contrast(surface, canvas) > 1.25:
        surface = mix(canvas, '#000000', 0.04)
        prov['color.surface'] = {'tag': 'chosen',
                                 'source': 'mix(canvas, black, 4%) — no '
                                 'usable live surface'}
    else:
        prov['color.surface'] = {'tag': 'extracted',
                                 'source': 'DISCOVERY.palette.surface · '
                                 + pal['surface']['source']}
    ink = (pal.get('ink') or {}).get('value')
    if ink and contrast(ink, canvas) >= 7 and contrast(ink, surface) >= 4.5:
        prov['color.ink'] = {'tag': 'extracted',
                             'source': 'DISCOVERY.palette.ink · '
                             + pal['ink']['source']}
    else:
        ink = T.NEUTRAL_LIGHT['ink']
        prov['color.ink'] = {'tag': 'chosen',
                             'source': 'dna_tokens.NEUTRAL_LIGHT.ink — '
                             'live ink missing or under 7:1'}
    # muted ink: the lightest ink→canvas mix that still reads 4.5:1 on
    # the surface (the harder of the two backgrounds)
    muted = ink
    for t in [x / 100 for x in range(5, 60, 5)]:
        c = mix(ink, canvas, t)
        if contrast(c, surface) >= 4.6:
            muted = c
    accent = (brief.get('brand') or {}).get('accent')
    fg = canvas if contrast(accent, canvas) >= 4.5 else ink
    roles = {
        'bg': canvas, 'surface': surface,
        'surface_elevated': mix(surface, ink, 0.04),
        'border': mix(surface, ink, 0.14),
        'ink': ink, 'ink_muted': muted,
        'inverse': mix(accent, '#000000', 0.55),
        'accent': accent, 'accent_foreground': fg}
    # C.3 — neutrals carry the brand hue, never dead grey: clamp each
    # neutral's OKLCH chroma into its band with the accent hue (bg is
    # the brief canvas itself and exempt via U.3).
    a_lch = gate._oklch_lch(accent)
    a_hue = a_lch[2] if a_lch else None
    for r in ('surface', 'surface_elevated', 'border', 'ink_muted',
              'ink', 'inverse'):
        tinted = tint_neutral(r, roles[r], a_hue)
        if tinted != roles[r]:
            roles[r] = tinted
            prov[f'color.{r}'] = {'tag': 'chosen', 'source':
                                  'C.3 tint: accent-hue OKLCH chroma '
                                  'clamped to the neutral band '
                                  '(dna_from_discovery.light_roles)'}
    for r in ('surface_elevated', 'border', 'ink_muted', 'inverse'):
        prov.setdefault(f'color.{r}', {'tag': 'chosen', 'source':
                              'mixed from discovered ink/surface/accent '
                              '(dna_from_discovery.light_roles)'})
    prov['color.accent'] = {'tag': 'chosen', 'source': 'BRIEF brand.accent'}
    return roles


def dark_roles(brief, light, prov):
    d = dict(T.NEUTRAL_DARK)
    brand = brief.get('brand') or {}
    acc = brand.get('accent')
    if contrast(acc, d['bg']) < 4.5 and brand.get('secondary') and \
            contrast(brand['secondary'], d['bg']) >= 4.5:
        acc = brand['secondary']
        prov['color.dark.accent'] = {
            'tag': 'chosen', 'source': 'BRIEF brand.secondary — accent '
            'under 4.5:1 on the dark canvas'}
    d['accent'] = acc
    d['accent_foreground'] = d['bg'] if contrast(d['bg'], acc) >= 4.5 \
        else d['ink']
    prov['color.dark'] = {'tag': 'chosen', 'source':
                          'dna_tokens.NEUTRAL_DARK (toggle only; first '
                          'paint is light per BRIEF)'}
    return d


def build(site_dir, offline=False):
    brief = SF.load_yaml(os.path.join(site_dir, 'BRIEF.yaml'))
    disc_p = os.path.join(site_dir, 'DISCOVERY.json')
    disc = json.load(open(disc_p, encoding='utf-8'))
    stype = disc['site_type']['value']
    brand = brief.get('brand') or {}
    vibe = disc.get('vibe') or {}
    # the seed is the site's own identity: same inputs → same DNA
    # (X.1 replay), different sites → different wildcard genes —
    # otherwise every vertical collapses to the dominant-allele DNA
    # and "a different design" is only ever a palette swap.
    import hashlib
    slug = (brief.get('site') or {}).get('slug') or \
        os.path.basename(site_dir)
    seed = int.from_bytes(hashlib.sha256(slug.encode()).digest()[:4],
                          'big')
    # design.variance — operator dial for how far the genotype may
    # wander from the vertical's dominant alleles: 'low' nudges two
    # stylistic genes, 'high' re-samples nearly every gene (see
    # below), so a variant site is a different DESIGN, not a
    # palette swap.
    variance = str((brief.get('design') or {}).get('variance')
                   or 'low').lower()
    # at 'high' the pool widens past stylistic genes to every gene
    # except the vibe-pinned mood pair — layout-archetype,
    # page-macro-structure, columns, nav-pattern, surface-rhythm et al
    # re-sample too, so the page SHAPE differs, not only its styling
    pool = None
    if variance == 'high':
        pool = [g for g in T.genome.GENE_NAMES
                if g not in ('mood-register', 'mood-energy')]
        burst = len(pool)
    else:
        burst = {'none': 0, 'low': 2, 'medium': 6}.get(variance, 2)
    rec = T.derive(stype, seed=seed, burst=burst, pool=pool,
                   declared={'accent': brand['accent']})
    prof = T.profile(stype)
    geno = dict(rec['genotype'])
    gprov = {}
    for g in ('mood-register', 'mood-energy'):
        if vibe.get(g) and vibe[g] in gate.genome_genes().get(g, [vibe[g]]):
            geno[g] = vibe[g]
            gprov[g] = f"DISCOVERY.vibe (matched “{vibe.get('evidence')}”)"
    for g, alleles in (prof.get('genes') or {}).items():
        if g not in geno:
            geno[g] = max(alleles, key=alleles.get)
            gprov[g] = f"{prof.get('id')} dominant (not sampled by derive)"
    rec = T.from_genotype(geno, stype, {'accent': brand['accent']},
                          seed=seed)
    knobs = {k: v for k, v in rec['knobs'].items()
             if k in gate.knob_set()}
    pid = rec.get('profile') or f'profile-{stype}'
    n = prof.get('n', 0)
    prov = {k: {'tag': 'inferred', 'patterns': [pid], 'n': n}
            for k in knobs}
    light = light_roles(disc, brief, prov)
    dark = dark_roles(brief, light, prov)

    fam = (disc.get('fonts') or {}).get('display') or ''
    src = FONT_SOURCES.get(fam.lower())
    if src:
        # the display weight must be a face the family ships; snap to
        # the nearest (heavier on a tie) and record the move
        want = knobs['type.display_weight']
        have = min(src[2], key=lambda w: (abs(w - want), -w))
        if have != want:
            knobs['type.display_weight'] = have
            prov['type.display_weight'] = {
                'tag': 'chosen', 'source': f'profile {want} snapped to '
                f'{have}: {fam} ships {list(src[2])}'}
    faces, why = (fetch_font(site_dir, fam, sorted({BODY_WEIGHT,
                  knobs['type.display_weight']}), offline)
                  if fam else ([], ''))
    stack = rec['knobs'].get('type.font_body')
    if faces:
        fonts = {'display': fam, 'body': fam, 'faces': faces,
                 'stack': f'"{fam}", {stack}', 'licence': why}
        prov['fonts'] = {'tag': 'extracted', 'source':
                         f'DISCOVERY.fonts (live site) · files: {why}'}
    else:
        fonts = {'display': 'system', 'body': 'system', 'faces': [],
                 'stack': stack}
        prov['fonts'] = {'tag': 'chosen', 'source':
                         f'profile stack — {why or "no live font"}'}
    fluid, prov['fluid'] = fluid_settings(disc, knobs)
    radius_knob(disc, knobs, geno, prov, gprov)
    # the CSS vars the system page lists ride the SAME fluid record
    rec['vars'] = T.css_vars(knobs, geno, brand['accent'], light, fluid)
    prov['genotype'] = {'tag': 'inferred', 'patterns': [pid], 'n': n,
                        'overrides': gprov}
    prov['vector_targets'] = {'tag': 'chosen', 'source':
                              'B2B services norms — no rating gaps for a '
                              'new build'}
    prov['site_type'] = {'tag': 'extracted', 'source':
                         'DISCOVERY.site_type “'
                         + disc['site_type']['evidence'] + '”'}
    theme = brief.get('theme') or {}
    doc = {
        'version': 0,
        'site': (brief.get('site') or {}).get('slug'),
        'vertical_profile': pid,
        'genotype': geno,
        'knobs': knobs,
        'modes': {'light': light, 'dark': dark},
        'theme': {'default': theme.get('default', 'light'),
                  'follow_os': _theme_flag(theme, 'follow_os'),
                  'dark_toggle': _theme_flag(theme, 'dark_toggle')},
        'invariants': {'accent': brand.get('accent'),
                       'secondary': brand.get('secondary'),
                       'logo': brand.get('logo'),
                       'phone': brand.get('phone'),
                       'fonts': fonts,
                       'fluid': fluid},
        'constraints': {'likes': list(vibe.get('words') or []),
                        'dislikes': [], 'references': []},
        'vector_targets': VECTOR_TARGETS,
        'provenance': prov,
        'inputs': {'BRIEF.yaml': SF.sha(os.path.join(site_dir,
                                                     'BRIEF.yaml')),
                   'DISCOVERY.json': SF.sha(disc_p)},
        'generated_by': 'dna_from_discovery.py',
    }
    doc['hashes'] = gate.dna_slices(doc)
    tok = emit_global.tokens_json(doc)
    _dump(os.path.join(site_dir, 'DNA.json'), doc)
    _dump(os.path.join(site_dir, 'TOKENS.json'), tok)
    with open(os.path.join(site_dir, 'DESIGN-SYSTEM.md'), 'w') as fh:
        fh.write(render_system(doc, disc, rec))
    return doc


def _theme_flag(theme, key):
    """BRIEF theme.<key> as typed by site_folder.load_yaml — a real
    bool or nothing. bool('false') is True, so a string here is a
    BRIEF/loader defect, never coerced."""
    v = theme.get(key)
    if not isinstance(v, bool):
        sys.exit(f'dna_from_discovery: BRIEF theme.{key} is {v!r} '
                 f'({type(v).__name__}), not a boolean — write '
                 f'`{key}: true|false` in BRIEF.yaml (BLOCKED)')
    return v


def _dump(p, obj):
    with open(p, 'w') as fh:
        json.dump(obj, fh, indent=1, ensure_ascii=False)
        fh.write('\n')


def fluid_settings(disc, knobs):
    """The ACSS fluid settings → (settings, provenance). A live site
    running Automatic.css (DISCOVERY live.acss) is back-solved by
    clamp.back_solve — bases, two ratios, section adjust, vp range,
    stops, gaps, button padding — tag `extracted`. Otherwise
    the DNA knobs map onto ACSS defaults (dna_tokens.fluid_settings),
    tag `inferred`."""
    acss = (disc.get('live') or {}).get('acss') or {}
    av = acss.get('vars') or {}
    if not av:
        s = T.fluid_settings(knobs)
        return s, {'tag': 'inferred', 'source': s['source'],
                   'divergences': dict(clamp.DIVERGENCES)}
    rp = str(av.get('root-font-size') or '100%').strip()
    live_root = float(rp.rstrip('%')) if rp.endswith('%') else 100.0
    solved = clamp.back_solve(av, live_root)
    # every px value is the live one; only the rem the emitter prints
    # is re-based — the build runs Tailwind v3, whose rem utilities
    # assume a 16px root, so html stays 100% (px identical at every vw)
    s = clamp.settings(dict(
        solved, root_pct=100.0, live_root_pct=live_root,
        source=f"extracted: {acss.get('source')}"))
    return s, {
        'tag': 'extracted', 'source': f"DISCOVERY live.acss "
        f"({acss.get('source')}) back-solved by clamp.back_solve",
        'pinned': sorted((s.get('pinned') or {}).keys()),
        'divergences': dict(clamp.DIVERGENCES, **{'root-font-size': (
            f'live ACSS root {rp}; emitted at 100% because the Tailwind '
            'v3 build sizes its utilities in 16px rem — every token '
            'keeps the live px value at every viewport')})}


def radius_knob(disc, knobs, geno, prov, gprov):
    """Live ACSS --radius → DNA radius.personality, the ONE radius
    source (emit_tokens._radius_map turns the knob into --radius).
    U.10: an extracted live radius keeps its EXACT px ('10px'), it is
    never snapped to a p-rung — gate.check_dna accepts a '<n>px'
    literal only under tag `extracted`. The gene stays the profile's:
    no p-rung can state the live 10px, and snapping the gene would
    silently change the look."""
    av = ((disc.get('live') or {}).get('acss') or {}).get('vars') or {}
    m = re.fullmatch(r'\s*(\d+(?:\.\d+)?)(rem|px)\s*',
                     str(av.get('radius') or ''))
    if not m:
        return
    rp = str(av.get('root-font-size') or '100%').strip()
    root_px = 16.0 * (float(rp.rstrip('%')) if rp.endswith('%')
                      else 100.0) / 100.0
    live_px = round(float(m.group(1)) * (root_px if m.group(2) == 'rem'
                                         else 1.0), 4)
    val = f'{live_px:g}px'
    knobs['radius.personality'] = val
    prov['radius.personality'] = {
        'tag': 'extracted', 'live_px': live_px,
        'source': f"DISCOVERY live.acss --radius {m.group(0).strip()} "
                  f"@ root {rp} = {live_px:g}px; kept exact — U.10 "
                  "never snaps a live radius to the p1–p4 vocabulary"}




def fluid_md(s, pv, radius_rem=None):
    """DESIGN-SYSTEM.md fluid section: the ACSS settings (mobile vs
    desktop) and every size token as clamp + px at vp_min/768/vp_max."""
    vm, vx = f"{s['vp_min']:g}", f"{s['vp_max']:g}"
    out = ['## Fluid sizes (Automatic.css fluidClamp — clamp.py)', '',
           f"Provenance **{pv.get('tag', '?')}** — {pv.get('source', '')}."
           f" Viewport {vm}px → {vx}px, emitted root "
           f"{s['root_pct']:g}%"
           + (f" (live ACSS root {s['live_root_pct']:g}%)"
              if s.get('live_root_pct') else '') + '.', '',
           '| Setting | Mobile (min @' + vm + ') | Desktop (max @'
           + vx + ') |', '|---|---|---|']
    for label, a, b, unit in (
            ('Text base', 'text_base_mob', 'text_base_desk', 'px'),
            ('Text ratio', 'text_scale_mob', 'text_scale_desk', ''),
            ('Heading base (h4)', 'heading_base_mob',
             'heading_base_desk', 'px'),
            ('Heading ratio', 'heading_scale_mob', 'heading_scale_desk',
             ''),
            ('Space base (space-m)', 'space_base_mob', 'space_base_desk',
             'px'),
            ('Space ratio', 'space_scale_mob', 'space_scale_desk', ''),
            ('Section adjust (× space-N)', 'section_adjust_mob',
             'section_adjust_desk', ''),
            ('Gutter', 'gutter_min', 'gutter_max', 'px')):
        out.append(f"| {label} | {float(s[a]):g}{unit} | "
                   f"{float(s[b]):g}{unit} |")
    out += ['', f"Stops: text-xs {s['stop_text_xs']:g}px · text-s "
            f"{s['stop_text_s']:g}px · h5 {s['stop_h5']:g}px · h6 "
            f"{s['stop_h6']:g}px. Pinned live values: "
            + (', '.join(f'{k} {v}' for k, v in
                         (s.get('pinned') or {}).items()) or 'none')
            + '. Aliases: ' + ', '.join(
                f'`--{k}: {v}`' for k, v in
                clamp.aliases(s, radius_rem).items()),
            '', f'| Token | clamp | @{vm} | @768 | @{vx} |',
            '|---|---|---|---|---|']
    for name, css, a, b, c in clamp.table(s):
        out.append(f'| `--{name}` | `{css}` | {a:g}px | {b:g}px | '
                   f'{c:g}px |')
    return out


def render_system(doc, disc, rec):
    k, L_, D_ = doc['knobs'], doc['modes']['light'], doc['modes']['dark']
    f = doc['invariants']['fonts']
    pv = doc['provenance']
    out = ['<!-- GENERATED by dna_from_discovery.py from DNA.json — do not '
           'edit; change BRIEF.yaml or the rules and re-run -->',
           f"# Design system — {disc['brand'].get('name')}", '',
           f"Site type **{disc['site_type']['value']}** · vibe "
           f"**{doc['genotype']['mood-register']} / "
           f"{doc['genotype']['mood-energy']}** "
           f"({', '.join(doc['constraints']['likes'])}) · first paint "
           f"**{doc['theme']['default']}**, follows OS: "
           f"**{doc['theme']['follow_os']}**, dark toggle: "
           f"**{doc['theme']['dark_toggle']}**", '',
           f"DNA hashes: look `{doc['hashes']['core'][:12]}` · structure "
           f"`{doc['hashes']['structure'][:12]}` · status "
           f"**v{doc['version']} (unlocked until the operator approves "
           'the look at w4)**', '',
           '## Colour — light (default)', '',
           '| Role | Hex | Contrast on canvas | Source |',
           '|---|---|---|---|']
    for role, hx in L_.items():
        src = (pv.get(f'color.{role}') or {}).get('source', '')
        out.append(f'| {role} | `{hx}` | {contrast(hx, L_["bg"]):.2f}:1 '
                   f'| {src} |')
    out += ['', '## Colour — dark (toggle only)', '',
            '| Role | Hex | Contrast on dark canvas |', '|---|---|---|']
    for role, hx in D_.items():
        out.append(f'| {role} | `{hx}` | {contrast(hx, D_["bg"]):.2f}:1 |')
    out += ['', '## Typography', '',
            f"- Family: **{f['display']}** (display + body) — "
            f"{pv['fonts']['source']}",
            f"- Stack: `{f['stack']}`",
            f"- Weights: {', '.join(str(x['weight']) for x in f['faces']) or 'system'}"
            f" · display weight {k['type.display_weight']} · tracking "
            f"{k['type.tracking_display']}em",
            '']
    out += fluid_md(doc['invariants']['fluid'], pv.get('fluid') or {},
                    emit_global.emit_tokens._radius_map(
                        doc['knobs']['radius.personality']))
    out += ['', '## Space, shape, motion', '',
            '| Knob | Value |', '|---|---|']
    for key in ('space.density_scale', 'space.section_py', 'grid.gutter',
                'width.inner_rung', 'radius.personality', 'elevation.level',
                'motion.level', 'motion.engine', 'btn.size',
                'btn.padding_ratio', 'color.accent_usage',
                'image.treatment'):
        v = k.get(key)
        if isinstance(v, dict):
            v = ', '.join(f'{a}→{b}' for a, b in v.items())
        out.append(f'| {key} | {v} |')
    out += ['', '| CSS var | Value |', '|---|---|']
    for var in ('--radius', '--gap', '--pad-block', '--f-display',
                '--f-body', '--shadow', '--btn-pad'):
        out.append(f"| `{var}` | `{rec['vars'].get(var)}` |")
    g = doc['genotype']
    out += ['', '## Genotype (structure + look genes)', '',
            '| Gene | Allele | Source |', '|---|---|---|']
    ov = pv['genotype'].get('overrides') or {}
    for gene, a in g.items():
        out.append(f"| {gene} | {a} | {ov.get(gene, doc['vertical_profile'] + ' sample')} |")
    out += ['', '## Components (what the genotype allows)', '',
            f"- Nav: `{g['nav-pattern']}` · CTA: `{g['cta-restraint']}` "
            f"(one primary action) · accent use: `{k['color.accent_usage']}`",
            f"- Hero archetype: `{g['layout-archetype']}` · page macro: "
            f"`{g['page-macro-structure']}` · image ratio: "
            f"`{g['image-led-ratio']}`",
            f"- Surfaces: `{g['surface-rhythm']}` — one brand/inverse "
            'moment per page, the rest alternate canvas/surface',
            f"- Proof: `{g['proof-type']}` (no logos, quotes or stats "
            'unless the copy sources them)',
            f"- Disclosure: `{g['disclosure-tier']}` · forms: "
            f"`{g['form-presence']}` · radius: `{g['radius-personality']}`",
            '']
    return '\n'.join(out)


def main():
    a = [x for x in sys.argv[1:] if not x.startswith('--')]
    if len(a) != 1:
        print(__doc__)
        return 2
    doc = build(os.path.abspath(a[0]), offline='--offline' in sys.argv)
    lt = doc['modes']['light']
    print(f"DNA: {doc['vertical_profile']} v{doc['version']} "
          f"bg={lt['bg']} surface={lt['surface']} ink={lt['ink']} "
          f"accent={lt['accent']} font={doc['invariants']['fonts']['display']}"
          f" core={doc['hashes']['core'][:12]}")
    return 0


if __name__ == '__main__':
    sys.exit(main())
