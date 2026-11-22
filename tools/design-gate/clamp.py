#!/usr/bin/env python3
"""clamp.py — the ONE fluid-size calculator, ACSS-exact.

Automatic.css `fluidClamp(min, max)` / `fluidClampStop(stop, min, max)`
as the sole size machine (docs/machinery/ACSS-FLUID-REFERENCE.md §1-3):

    slope      = (max - min) / (vp_max - vp_min)      # px value / px vp
    intercept  = min - slope * vp_min                 # px
    output     = clamp(MINrem, calc(SLOPEvw + INTERCEPTrem), MAXrem)

  - min = exact value at vp_min (mobile), max = exact value at the
    content width and beyond. 320px → 1280px is ACSS's own range.
  - TWO scales: every size is computed twice — a mobile value with the
    mobile base/ratio and a desktop value with the desktop base/ratio —
    then one clamp joins them.
  - fluidClampStop floors a small size at `stop`: when BOTH computed
    endpoints are at/below the stop ACSS emits it flat
    (live: --text-s 1.2rem, --h5 1.2rem, --h6 1.1rem are all flat);
    otherwise the stop sits inside the clamp's own endpoints.
  - ONE viewport unit for the whole system: vw (ACSS's own; the
    container-free interpolation axis every rung shares).
  - Viewport unit for the preferred term is always `vw`; the earlier
    vi/cqi experiments are gone — a clamp whose axis is the container
    could not serve the root document, and ACSS never uses it.

CLI (the calculator):

  clamp.py 16 24                     → clamp for 16px@320 → 24px@1280
  clamp.py 1.6 2.4 --unit rem        → same with rem inputs/output
  clamp.py 16 24 --stop 12           → fluidClampStop
  clamp.py --check 'clamp(1.6rem, calc(0.2083vw + 1.5333rem), 1.8rem)'

`--check` parses a clamp()/max(stop, clamp()) and reports the computed
size at vp_min / 768 / vp_max. Options: --unit rem|px (default px),
--root PCT (100 = 16px root, 62.5 = 10px root), --vp-min, --vp-max.

Library:

  s = settings(...)         → the fluid settings record (also the
                              `fluid` block inside DNA/TOKENS.json)
  t = sizes(s)              → {name: css-string} for every ACSS size
                              token: text-xs..xxl, h1..h6,
                              space-xs..xxl, section-space-xs..xxl,
                              gutter
  aliases(s, radius_rem)    → grid/content/container-gap var()s,
                              btn-padding-* em, radius rem
  px_at(css, vw_px, s)      → evaluate a clamp string at a viewport
  table(s)                  → [(name, clamp, @vp_min, @768, @vp_max)]
  back_solve(vars, root)    → settings from a live ACSS file's vars
  FS_MAP                    → --fs-N utility alias → ACSS token

# -------------------------------------------------------------------
# DOCUMENTED EXEMPTIONS — the only non-clamp() size values that may
# appear in emitted CSS (FL.1/AC.1 read this list):
#
#   line-height / letter-spacing unitless or em  (scales with the
#       font size that is already fluid — --lh-*, --tracking-*)
#   border / outline / rule widths ≤2px          (device strokes)
#   aspect-ratio, fr tracks, % width/height, ch  (relative by nature)
#   media-query breakpoints (30rem/48rem)        (thresholds, not
#       page sizes)
#   --content-width, --width-*, --measure, --grid-min, --sec-inner
#       (measure/width ladder: caps computed FROM the clamped
#       gutter; ACSS keeps --content-width a fixed rung too)
#   --radius (fixed rem like ACSS --radius; value = DNA radius.personality)
#   --btn-padding-*  (em — fluid via the fluid font size, ACSS way)
#   --tap 2.75rem                                (a11y hit-area floor)
#   z-index, opacity, ms/s durations, env(safe-area-inset-*), 1px
#       sr-only clip, ::after inset %
#   text-wrap, object-position offsets           (not sizes)
# Everything else — font-size, margin, padding, gap, row-gap,
# column-gap — is a var() bound to a clamp() token or a clamp().
# -------------------------------------------------------------------
"""
import argparse
import re
import sys

# ---- ACSS system constants -------------------------------------------
VP_MIN_PX = 320.0                     # ACSS min site width
VP_MAX_PX = 1280.0                    # content width = max viewport
REPORT_VWS = (320, 768, 1280)         # the px table's check viewports

# documented exemptions (the FL.1/AC.1 allow-list, per family):
EXEMPTIONS = {
    'line-height': 'unitless — follows the fluid font-size',
    'letter-spacing': 'em — follows the fluid font-size',
    'border-width/outline-width ≤2px': 'device stroke, not rhythm',
    'aspect-ratio': 'unitless ratio',
    'width/height %, fr, ch': 'relative to container or font size',
    'media-query breakpoints': 'thresholds, not page sizes',
    'measure/width ladder (--content-width, --measure, --width-*, '
        '--grid-min, --sec-inner)': 'caps computed from the clamped '
        'gutter; ACSS keeps --content-width fixed too',
    '--radius': 'fixed rem like ACSS --radius; value is the DNA '
        'radius.personality knob (live radius snapped into it)',
    '--btn-padding-block/inline': 'em — fluid via the fluid font '
        'size, the ACSS way',
    '--tap': '2.75rem a11y hit-area floor',
    'element heights / max-widths (--logo-h, .bar-min, .media-panel, '
        '.media-hero)': 'object dimensions, not rhythm',
    'list indent / input padding in em': 'em — follows the fluid '
        'font size',
    'ornament background-size, off-screen -9999px skip-link':
        'decoration / a11y offset, not a size',
    'z-index/opacity/durations/env()/sr-only clip': 'not sizes',
}

# ---- settings (DNA/TOKENS.json `fluid` block shape) -------------------
# Every field names its DNA provenance in dna_from_discovery; these are
# the ACSS dashboard defaults from the reference §2-3.
DEFAULTS = {
    'root_pct': 100.0,        # 100 = 16px root; 62.5 = 10px (ACSS)
    'vp_min': VP_MIN_PX,
    'vp_max': VP_MAX_PX,
    'text_base_mob': 16.0,    # px
    'text_base_desk': 18.0,
    'text_scale_mob': 1.2,
    'text_scale_desk': 1.333,
    'heading_base_mob': 16.0,   # defaults to the text bases
    'heading_base_desk': 18.0,
    'heading_scale_mob': 1.2,
    'heading_scale_desk': 1.333,  # heading scale = text scale unless set
    'space_base_mob': 24.0,     # px — ACSS base-space-min/base-space
    'space_base_desk': 30.0,
    'space_scale_mob': 1.333,
    'space_scale_desk': 1.5,
    'section_adjust_mob': 3.0,
    'section_adjust_desk': 4.0,
    'gutter_min': 24.0,         # ACSS section-padding-x fluidClamp(24,30)
    'gutter_max': 30.0,
    # ACSS stops: XS/S text and h5/h6 never fall below their floor.
    'stop_text_xs': 12.0,
    'stop_text_s': 12.0,
    'stop_h6': 11.0,
    'stop_h5': 12.0,
    # pinned sizes extracted from a live ACSS file — the operator's own
    # choices the formula cannot reproduce win (provenance: extracted;
    # Whistle Clean pins text-s flat at 12px).
    'pinned': {},
    # ACSS aliases + em/fixed members of the family (reference §3):
    'grid_gap': 'space-m',          # --grid-gap: var(--space-m)
    'content_gap': 'space-m',       # --content-gap: var(--space-m)
    'elements_gap': 'space-m',      # --elements-gap: var(--space-m)
    'container_gap': 'space-xl',    # --container-gap: var(--space-xl)
    'list_item_spacing': 'space-s', # --list-item-spacing: var(--space-s)
    'btn_padding_block': 0.75,      # em
    'btn_padding_inline': 1.5,      # em
    'source': 'defaults (ACSS dashboard)',
}

_TEXT_STEPS = {'xs': -2, 's': -1, 'm': 0, 'l': 1, 'xl': 2, 'xxl': 3}
_HEAD_STEPS = {'h6': -2, 'h5': -1, 'h4': 0, 'h3': 1, 'h2': 2, 'h1': 3}
_SPACE_ORDER = {'xs': -2, 's': -1, 'm': 0, 'l': 1, 'xl': 2, 'xxl': 3}

# the component utility layer (--fs-N / .text-fluid-N) binds ACSS names
# so the emitted CSS speaks ACSS (U.10): fs-N is a pure alias, never a
# second scale. Templates use fs-0 body, fs-1 lede, fs-2 editorial
# head, fs-3 section head, fs-4/5 hero head.
FS_MAP = {'-1': 'text-s', '0': 'text-m', '1': 'text-l', '2': 'h3',
          '3': 'h2', '4': 'h1', '5': 'h1'}

# non-ACSS custom properties the emitter keeps, each with its reason —
# dna_from_discovery writes these into DNA provenance.fluid.divergences
# (U.10: divergence only with a written reason; AC.1 reads them).
_FS_WHY = ('component utility alias (.text-fluid-N / Tailwind fluid-N) '
           '— pure var() of the ACSS token in clamp.FS_MAP, no own value')
_LH_WHY = ('unitless line-height paired with the fs-N step; ACSS sets '
           'line-height per element, the exemplar vocabulary binds it '
           'by step')
DIVERGENCES = dict(
    {f'fs-{n}': _FS_WHY for n in FS_MAP},
    **{f'lh-{n}': _LH_WHY for n in FS_MAP},
    **{'motion-distance': 'M.4 travel distance for motion.level — a '
                          'transform length the motion knob sets, not a '
                          'layout rung (ACSS has no motion family)',
       'grid-min': 'G.5 card-floor width rung from width.inner_rung — a '
                   'measure, not rhythm (ACSS grid uses fixed column '
                   'counts instead)',
       'grid-floor': 'per-grid local of --grid-min (data-cols cap)',
       'measure': 'reading measure in ch (ACSS --content-width is the '
                  'page cap; prose needs a ch cap too)',
       'tap': 'a11y 44px hit-area floor — ACSS has no touch-target token',
       'r-card': 'component alias of --radius (TK layer: components '
                 'bind semantic names)',
       'input-py': 'form-field padding in em — ACSS forms module is a '
                   'separate product; em follows the fluid font',
       'input-px': 'see input-py',
       'input-radius': 'alias of --r-card for form fields',
       'logo-h': 'logo mark height — object dimension, not rhythm',
       'sec-pad': "section shell local: binds the density's "
                  '--section-space-* rung (DENSITY-RUNGS)',
       'tracking-display': 'display letter-spacing in em from DNA '
                           'type.tracking_display'})


def settings(overrides=None):
    """Fluid settings record — ACSS defaults + `overrides` (the
    extracted live values ride in `pinned`, never mutate the formula)."""
    s = dict(DEFAULTS)
    for k, v in (overrides or {}).items():
        s[k] = dict(s.get('pinned', {}), **v) if k == 'pinned' else v
    return s


def _root(s):
    return 16.0 * float(s.get('root_pct') or 100.0) / 100.0


def _r4(x):
    return float(round(x + 0.0, 4))


def _fmt(x, digits=4):
    """ACSS trims noise but keeps the slope precise — 4 decimals."""
    v = f'{_r4(x):.{digits}f}'.rstrip('0').rstrip('.')
    return v if v else '0'


def fluid_clamp(min_px, max_px, vp_min=None, vp_max=None, root=16.0):
    """ACSS fluidClamp(min,max) — px pair → the clamp() string.
    `min_px` is the size AT vp_min, `max_px` the size AT vp_max. When
    min > max (negative slope) the same line is used, but CSS clamp()
    resolves to its first arg when MIN > MAX — so the bounds are
    written low→high (what live ACSS emits for its space-xs)."""
    vmin = VP_MIN_PX if vp_min is None else float(vp_min)
    vmax = VP_MAX_PX if vp_max is None else float(vp_max)
    if vmax == vmin:
        raise ValueError('vp_min == vp_max — no interpolation range')
    min_px, max_px = float(min_px), float(max_px)
    slope = (max_px - min_px) / (vmax - vmin)
    inter = min_px - slope * vmin
    r = float(root)
    sgn = '+' if inter >= 0 else '-'
    lo, hi = sorted((min_px, max_px))
    return (f'clamp({_fmt(lo / r)}rem, calc({_fmt(slope * 100)}vw '
            f'{sgn} {_fmt(abs(inter) / r)}rem), {_fmt(hi / r)}rem)')


def fluid_clamp_stop(stop_px, min_px, max_px, vp_min=None, vp_max=None,
                     root=16.0):
    """ACSS fluidClampStop(stop,min,max): the size never falls below
    `stop`. Live ACSS emits the stop FLAT when the computed max sits
    at/below it (h5/h6/text-xs on Whistle Clean are flat) — between it
    and the computed max, the stop replaces the computed min."""
    stop_px, min_px, max_px = (float(stop_px), float(min_px),
                             float(max_px))
    if max_px <= stop_px:
        return fluid_clamp(stop_px, stop_px, vp_min, vp_max, root)
    if min_px < stop_px:
        return fluid_clamp(stop_px, max_px, vp_min, vp_max, root)
    return fluid_clamp(min_px, max_px, vp_min, vp_max, root)


def _stepped(base, ratio, n):
    return base * (ratio ** n)


def _space_pair(s, n):
    """space rung n (−2..3) → (min px, max px). Up-steps multiply each
    end by its own ratio, down-steps divide each end by its own ratio
    (live ACSS: space-s = 24/1.333 → 30/1.5)."""
    bm, bd = float(s['space_base_mob']), float(s['space_base_desk'])
    rm, rd = float(s['space_scale_mob']), float(s['space_scale_desk'])
    return _stepped(bm, rm, n), _stepped(bd, rd, n)


def sizes(s=None):
    """settings → {token_name: css-string} — the whole ACSS size family,
    all through fluidClamp/fluidClampStop. Keys are ACSS names.
    `pinned[name]` (a px number = flat, or [min, max]) is an extracted
    live value that the formula cannot reproduce — it wins."""
    s = s or settings()
    root = _root(s)
    vm, vx = float(s['vp_min']), float(s['vp_max'])
    pinned = s.get('pinned') or {}
    args = (vm, vx, root)
    out = {}

    def put(name, mn, mx, stop=None):
        p = pinned.get(name)
        if p is not None:
            lo, hi = (p, p) if isinstance(p, (int, float)) else p
            out[name] = fluid_clamp(lo, hi, *args)
        elif stop:
            out[name] = fluid_clamp_stop(stop, mn, mx, *args)
        else:
            out[name] = fluid_clamp(mn, mx, *args)

    # --- text scale (two ratios)
    for name, n in _TEXT_STEPS.items():
        put('text-' + name,
            _stepped(float(s['text_base_mob']),
                     float(s['text_scale_mob']), n),
            _stepped(float(s['text_base_desk']),
                     float(s['text_scale_desk']), n),
            s.get('stop_text_' + name))
    # --- heading scale (own ratios; h4 is the heading base)
    for name, n in _HEAD_STEPS.items():
        put(name,
            _stepped(float(s['heading_base_mob']),
                     float(s['heading_scale_mob']), n),
            _stepped(float(s['heading_base_desk']),
                     float(s['heading_scale_desk']), n),
            s.get('stop_' + name))
    # --- space rungs + section-space-N = space-N × section adjust
    for rung, n in _SPACE_ORDER.items():
        mn, mx = _space_pair(s, n)
        put('space-' + rung, mn, mx)
    # --- smart-spacing "-to-" variants: each adjacent rung pair emits
    # --space-<hi>-to-<lo> — the hi rung on wide, relaxing to the lo
    # rung on narrow (live ACSS's contextual pairs)
    ordered = sorted(_SPACE_ORDER.items(), key=lambda kv: kv[1])
    for (hi_r, hi_n), (lo_r, lo_n) in zip(ordered[1:], ordered):
        hi_mn, hi_mx = _space_pair(s, hi_n)
        lo_mn, lo_mx = _space_pair(s, lo_n)
        put(f'space-{hi_r}-to-{lo_r}', lo_mn, hi_mx)
    for rung, n in _SPACE_ORDER.items():
        mn, mx = _space_pair(s, n)
        put('section-space-' + rung,
            mn * float(s['section_adjust_mob']),
            mx * float(s['section_adjust_desk']))
    # --- gutter (section-padding-x): its own pair
    put('gutter', float(s['gutter_min']), float(s['gutter_max']))
    return out


def aliases(s=None, radius_rem=None):
    """settings → {name: css} for the ACSS members that are NOT their
    own clamp: gap aliases bind a space rung, button padding is em
    (fluid through the fluid font), radius is a fixed rem (live ACSS
    --radius: 1rem). `radius_rem` is the DNA radius.personality value
    (emit_tokens._radius_map) — the ONE radius source; a live ACSS
    radius reaches it only via dna_from_discovery's knob snap."""
    s = s or settings()
    out = {'grid-gap': f"var(--{s['grid_gap']})",
           'content-gap': f"var(--{s['content_gap']})",
           'elements-gap': f"var(--{s['elements_gap']})",
           'container-gap': f"var(--{s['container_gap']})",
           'list-item-spacing': f"var(--{s['list_item_spacing']})",
           'btn-padding-block': f"{_fmt(s['btn_padding_block'])}em",
           'btn-padding-inline': f"{_fmt(s['btn_padding_inline'])}em"}
    if radius_rem is not None:
        out['radius'] = f'{_fmt(radius_rem * 16.0 / _root(s))}rem'
    return out


def endpoints(css, s=None):
    """clamp string → (px @vp_min, px @vp_max) — what FL.1 compares."""
    s = s or settings()
    return (px_at(css, float(s['vp_min']), s),
            px_at(css, float(s['vp_max']), s))


# ---- parsing / evaluation -------------------------------------------
_NUM = r'(-?\d+(?:\.\d+)?)\s*(rem|px|vw|vi|cqi|em|%)?'
_CLAMP_RE = re.compile(
    r'clamp\(\s*' + _NUM + r'\s*,\s*(?:calc\()?\s*' + _NUM +
    r'\s*([+\-])\s*' + _NUM + r'\s*\)?\s*,\s*' + _NUM + r'\s*\)')
_MAX_RE = re.compile(r'max\(\s*' + _NUM + r'\s*,\s*(clamp\(.*\))\s*\)')


def _to_px(v, u, root, vw_px):
    if u in ('rem', 'em'):
        return v * root
    if u == 'vw' or u == 'vi':
        return v * vw_px / 100.0
    if u == 'cqi':
        return v * vw_px / 100.0   # container ≈ viewport for the check
    if u == '%':
        return v * root / 100.0
    return v                      # px


def parse_clamp(css):
    """clamp()/max(stop,clamp()) → {stop, min, slope_vw, intercept, max}
    all in px; accepts `Arem + Bvw` and `calc(Bvw + Arem)` orders."""
    css = (css or '').strip()
    stop = None
    m = _MAX_RE.match(css)
    inner = css
    if m:
        stop = float(m.group(1)) * (16.0 if m.group(2) == 'rem' else 1)
        inner = m.group(3)
    cm = _CLAMP_RE.search(inner)
    if not cm:
        raise ValueError(f'not a clamp(): {css!r}')
    g = cm.groups()
    v1, u1, v2, u2, sign, v3, u3, v4, u4 = g
    a = {'v': float(v2), 'u': u2 or 'rem'}
    b = {'v': float(v3) * (1 if sign == '+' else -1), 'u': u3 or 'rem'}
    term = [a, b]
    slope = next(t['v'] for t in term if t['u'] in ('vw', 'vi', 'cqi'))
    other = next(t for t in term if t['u'] not in ('vw', 'vi', 'cqi'))
    return {'stop': stop,
            'min': float(v1), 'min_u': u1 or 'px',
            'slope_vw': slope,
            'inter': other['v'], 'inter_u': other['u'],
            'max': float(v4), 'max_u': u4 or 'px'}


def px_at(css, vw_px, s=None):
    """Evaluate one clamp()/max(stop,clamp()) string at a viewport
    width (px). Root comes from the settings (default 100%)."""
    s = s or settings()
    root = _root(s)
    p = parse_clamp(css)
    lo = _to_px(p['min'], p['min_u'], root, vw_px)
    hi = _to_px(p['max'], p['max_u'], root, vw_px)
    mid = _to_px(p['inter'], p['inter_u'], root, vw_px) + \
        p['slope_vw'] * vw_px / 100.0
    val = max(lo, min(mid, hi))
    if p['stop'] is not None:
        val = max(p['stop'], val)
    return val


def table(s=None):
    """settings → [(name, clamp, px@320, px@768, px@vpmax)] for the
    TOKENS.json sizes block and DESIGN-SYSTEM.md."""
    s = s or settings()
    vws = (float(s['vp_min']), 768.0, float(s['vp_max']))
    out = []
    for name, css in sizes(s).items():
        out.append((name, css) + tuple(
            round(px_at(css, w, s), 2) for w in vws))
    return out


# ---- back-solving (dna_from_discovery uses this on live.acss) --------
def back_solve(acss_vars, root_pct):
    """live.acss {name: 'clamp(...)'|value} → settings overrides.
    Bases/ratios/adjusts/vp come from the anchor tokens (text-m/l,
    h4/h3, space-m/l, section-space-m, gutter); flat small sizes become
    the stops. Then every extracted token is recomputed through
    sizes(): any the formula cannot reproduce (±0.05px) is pinned to
    its live [min, max] pair, so the system equals the live file."""
    r = 16.0 * float(root_pct) / 100.0
    parsed = {}
    for k, v in (acss_vars or {}).items():
        try:
            parsed[k] = parse_clamp(v)
        except ValueError:
            continue

    # viewport range from the first positive-slope anchor's own args:
    # preferred(vw) = slope*vw + ic hits MIN at vp_min, MAX at vp_max
    vp_min, vp_max = VP_MIN_PX, VP_MAX_PX
    for k in ('text-m', 'h4', 'space-m', 'section-space-m'):
        p = parsed.get(k)
        if p and p['slope_vw'] > 0:
            sl = p['slope_vw'] / 100.0
            ic = _to_px(p['inter'], p['inter_u'], r, 0)
            vp_min = round((_to_px(p['min'], p['min_u'], r, 0) - ic) / sl)
            vp_max = round((_to_px(p['max'], p['max_u'], r, 0) - ic) / sl)
            break
    sv = settings({'root_pct': root_pct, 'vp_min': vp_min,
                   'vp_max': vp_max})

    def pair(k):
        # the size AT each viewport end — a negative-slope clamp lists
        # its bounds low→high, so the raw args are not min@vp_min
        if k not in parsed:
            return None
        return (px_at(acss_vars[k], vp_min, sv),
                px_at(acss_vars[k], vp_max, sv))

    def sloped(k):
        p = pair(k)
        return p if p and abs(p[1] - p[0]) > 1e-9 else None

    out = {'vp_min': vp_min, 'vp_max': vp_max, 'root_pct': root_pct}

    def base_ratio(b, u, kb_m, kb_d, kr_m, kr_d):
        pb, pu = sloped(b) or pair(b), sloped(u) or pair(u)
        if pb:
            out[kb_m], out[kb_d] = round(pb[0], 4), round(pb[1], 4)
        if pb and pu:
            out[kr_m] = round(pu[0] / pb[0], 4)
            out[kr_d] = round(pu[1] / pb[1], 4)
    base_ratio('text-m', 'text-l', 'text_base_mob', 'text_base_desk',
               'text_scale_mob', 'text_scale_desk')
    base_ratio('h4', 'h3', 'heading_base_mob', 'heading_base_desk',
               'heading_scale_mob', 'heading_scale_desk')
    base_ratio('space-m', 'space-l', 'space_base_mob',
               'space_base_desk', 'space_scale_mob', 'space_scale_desk')
    sm, ssm = pair('space-m'), pair('section-space-m')
    if sm and ssm:
        out['section_adjust_mob'] = round(ssm[0] / sm[0], 4)
        out['section_adjust_desk'] = round(ssm[1] / sm[1], 4)
    g = pair('gutter')
    if g:
        out['gutter_min'], out['gutter_max'] = round(g[0], 4), \
            round(g[1], 4)
    # a flat small size IS its stop (fluidClampStop floor)
    for tok, key in (('text-xs', 'stop_text_xs'), ('text-s', 'stop_text_s'),
                     ('h5', 'stop_h5'), ('h6', 'stop_h6')):
        p = pair(tok)
        if p and abs(p[1] - p[0]) <= 1e-9:
            out[key] = round(p[0], 4)
    # the alias members: gap → space rung, button padding em (radius
    # is NOT a fluid setting — dna_from_discovery snaps it to the DNA
    # radius.personality knob)
    for tok, key in (('grid-gap', 'grid_gap'), ('content-gap',
                     'content_gap'), ('container-gap', 'container_gap')):
        m = re.fullmatch(r'\s*var\(--(space-\w+)\)\s*',
                         str((acss_vars or {}).get(tok, '')))
        if m:
            out[key] = m.group(1)
    for tok, key in (('btn-padding-block', 'btn_padding_block'),
                     ('btn-padding-inline', 'btn_padding_inline')):
        m = re.fullmatch(r'\s*(\d+(?:\.\d+)?)em\s*',
                         str((acss_vars or {}).get(tok, '')))
        if m:
            out[key] = float(m.group(1))
    # pin whatever the formula still cannot reproduce
    s = settings(out)
    got = sizes(s)
    pinned = {}
    for k in parsed:
        if k not in got:
            continue
        live = pair(k)
        mine = endpoints(got[k], s)
        if abs(live[0] - mine[0]) > 0.05 or abs(live[1] - mine[1]) > 0.05:
            pinned[k] = (round(live[0], 4) if abs(live[1] - live[0])
                         <= 1e-9 else [round(live[0], 4),
                                       round(live[1], 4)])
    if pinned:
        out['pinned'] = pinned
    return out


def _cli(argv):
    ap = argparse.ArgumentParser(
        description='ACSS fluidClamp calculator')
    ap.add_argument('min', nargs='?')
    ap.add_argument('max', nargs='?')
    ap.add_argument('--unit', choices=('px', 'rem'), default='px')
    ap.add_argument('--root', type=float, default=100.0,
                    help='root font pct: 100 = 16px, 62.5 = 10px')
    ap.add_argument('--vp-min', type=float, default=VP_MIN_PX)
    ap.add_argument('--vp-max', type=float, default=VP_MAX_PX)
    ap.add_argument('--stop', type=float)
    ap.add_argument('--check', metavar='CLAMP')
    a = ap.parse_args(argv[1:])
    root = 16.0 * a.root / 100.0
    if a.check:
        p = parse_clamp(a.check)
        s = settings({'vp_min': a.vp_min, 'vp_max': a.vp_max,
                      'root_pct': a.root})
        print(f'min {_fmt(px_at(a.check, a.vp_min, s), 2)}px · '
              f'@768 {_fmt(px_at(a.check, 768, s), 2)}px · '
              f'max {_fmt(px_at(a.check, a.vp_max, s), 2)}px'
              + (f' · stop {p["stop"]}px' if p.get('stop') else ''))
        return 0
    if a.min is None or a.max is None:
        ap.error('need MIN MAX (or --check CLAMP)')
    lo, hi = float(a.min), float(a.max)
    if a.unit == 'rem':
        lo, hi = lo * root, hi * root
    stp = a.stop * root if (a.stop and a.unit == 'rem') else a.stop
    if stp:
        print(fluid_clamp_stop(stp, lo, hi, a.vp_min, a.vp_max, root))
    else:
        print(fluid_clamp(lo, hi, a.vp_min, a.vp_max, root))
    return 0


if __name__ == '__main__':
    sys.exit(_cli(sys.argv))
