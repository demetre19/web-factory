"""tech_ornament.py — parametric technical/blueprint ornament generator.

Produces sparse, thin-stroke "draftsman" SVG ornament layers for Web
Factory surfaces: construction marks, compass arcs, ruler ticks,
dimension lines, registration marks — the kind of low-contrast
geometric background layer seen on premium agency sites. Pure
stdlib, no external assets, no JS. Output is decorative inline SVG.

Public API
----------
generate(variant, seed=0, width=1440, height=760, accent=None,
         density=0.5, animate=False) -> str

Parameters
----------
variant : one of VARIANTS (below).
seed    : int — the ONLY source of randomness. Everything derives
          from random.Random(seed); no time, uuid, or ambient state.
width/height : viewBox + rendered size in px.
accent  : optional CSS colour. When omitted every stroke/fill is
          `currentColor` so the layer binds the surrounding semantic
          ink token (set `color:` on the parent). When passed, accent
          is applied to strokes; fills stay currentColor.
density : 0.0–1.0, clamped. Scales mark count/spacing. Each variant
          also has a hard element cap so density=1 can never produce
          visual noise.
animate : when True, embeds a <style> adding a slow CSS
          stroke-dashoffset drift to dashed elements only
          (tamdoma-compatible, pure CSS, honours
          prefers-reduced-motion: reduce).
logo    : logo-motif only. Motif name (fallback brand mark), raw SVG
          path data, path to an .svg file, or a spec dict —
          {d|motif|file, fragment, scale, rotation, placement,
          opacity, tint, centre}. The technique (Whistle Clean
          reference): one distinctive sub-path FRAGMENT of the client
          mark, scaled 4–10×, anchored to a corner or bled off an
          edge, ghosted at 0.04–0.10 opacity — recognisably branded,
          abstracted by crop + scale. Unset fields are seeded.

Variants
--------
crosshair-grid     sparse grid of + marks, positions jittered
dashed-arc         concentric dashed circles anchored to a random
                   edge/corner, mostly off-canvas (partial arcs)
tick-marks         ruler ticks along 1–2 edges, minor+major, with
                   occasional small muted dimension labels
dimension-lines    thin lines with perpendicular end-ticks and a
                   measurement label, placed in edge bands
registration-marks print-style corner brackets + centre target
compass            dashed circle, radial ticks (cardinals longer),
                   seeded needle line, N/E/S/W labels
logo-motif        ghosted FRAGMENT of the client's mark (sub-path
                   picked by `fragment` or seed) scaled 4–10×, bled
                   off a corner/edge at 0.04–0.10 opacity — the
                   Whistle Clean technique; falls back to a declared
                   brand motif (_MOTIFS) when no path is supplied
scatter            seed picks 2–4 of the above, each composed into
                   a non-overlapping clipped region

Determinism contract
--------------------
Same (variant, seed, width, height, accent, density, animate, logo) →
byte-identical SVG. Callers may cache output keyed on those args.

Output hygiene
--------------
<svg> carries role="img" + aria-hidden="true" and no <title>:
the layer is decorative. Intended usage is a positioned layer BELOW
content: `position:absolute; inset:0; z-index:0;
pointer-events:none;` — pointer-events none is left to the consumer
(the SVG itself is already aria-hidden).

CLI
---
  python3 tech_ornament.py --variant crosshair-grid --seed 42 \
      --width 1440 --height 760 --accent '#9ca3af' --density 0.6
      [--animate] [--logo squiggle --logo-fragment 0 \
      --logo-scale 7 --logo-placement bleed-right \
      --logo-opacity 0.06 --logo-tint '#0f766e']
prints the SVG to stdout.
"""
from __future__ import annotations

import argparse
import math
import random
import re
from xml.sax.saxutils import escape

VARIANTS = (
    "crosshair-grid",
    "dashed-arc",
    "tick-marks",
    "dimension-lines",
    "registration-marks",
    "compass",
    "logo-motif",
    "scatter",
)

_BASE_VARIANTS = VARIANTS[:-1]  # everything except "scatter"


_LOGO_PLACEMENTS = (
    "top-left", "top-right", "bottom-left", "bottom-right",
    "bleed-left", "bleed-right", "bleed-top", "bleed-bottom",
    "scattered",
)

# hard element-count ceilings per variant — density can never exceed these
_MAX_ELEMENTS = {
    "crosshair-grid": 320,
    "dashed-arc": 24,
    "tick-marks": 200,
    "dimension-lines": 12,
    "registration-marks": 40,
    "compass": 80,
    "logo-motif": 24,
    "scatter": 640,
}


# declared brand motifs — fallback shapes when no client logo path is
# available. Each entry: {"d": full mark, "frags": [sub-paths the
# fragment picker chooses from], "cx"/"cy": local anchor}. Drawn in a
# 0..100 box so the anchor defaults to 50,50.
_MOTIFS = {
    # whistle-clean style squiggle: each S-curve is its own fragment
    "squiggle": {
        "d": "M8 50 C20 12 34 88 50 50 C66 12 80 88 92 50",
        "frags": ["M8 50 C20 12 34 88 50 50",
                  "M50 50 C66 12 80 88 92 50"],
    },
    # lettermark A: outline stroke vs crossbar
    "letterform-a": {
        "d": "M22 80 L50 20 L78 80 M34 58 L66 58",
        "frags": ["M22 80 L50 20 L78 80",
                  "M34 58 L66 58"],
    },
    # droplet: whole drop or inner echo curve
    "droplet": {
        "d": ("M50 12 C58 26 78 40 78 58 C78 74 65 88 50 88"
              " C35 88 22 74 22 58 C22 40 42 26 50 12 Z"),
        "frags": ["M50 12 C58 26 78 40 78 58 C78 74 65 88 50 88"
                  " C35 88 22 74 22 58 C22 40 42 26 50 12 Z",
                  "M42 30 C48 44 62 50 62 62 C62 72 55 79 47 79"],
    },
    # chevron: outer vs inner stroke
    "chevron": {
        "d": "M20 70 L50 30 L80 70 M34 84 L50 64 L66 84",
        "frags": ["M20 70 L50 30 L80 70",
                  "M34 84 L50 64 L66 84"],
    },
}
_DEFAULT_MOTIF = "squiggle"



_ANIMATE_CSS = (
    ".orn .o-dash{animation:orn-drift 60s linear infinite}"
    "@keyframes orn-drift{to{stroke-dashoffset:-480}}"
    "@media (prefers-reduced-motion:reduce){.orn .o-dash{animation:none}}"
)


def _f(v: float) -> str:
    """Deterministic number formatting: ≤2dp, no trailing zeros."""
    s = f"{v:.2f}".rstrip("0").rstrip(".")
    return "0" if s in ("", "-0") else s


def _line(x1, y1, x2, y2, sw=0.75, dash=None, cls=None):
    a = f'<line x1="{_f(x1)}" y1="{_f(y1)}" x2="{_f(x2)}" y2="{_f(y2)}"'
    if sw != 0.75:
        a += f' stroke-width="{_f(sw)}"'
    if dash:
        a += f' stroke-dasharray="{dash}"'
    if cls:
        a += f' class="{cls}"'
    return a + "/>"


def _circle(cx, cy, r, sw=0.75, dash=None, cls=None, fill=None):
    a = f'<circle cx="{_f(cx)}" cy="{_f(cy)}" r="{_f(r)}"'
    if sw != 0.75:
        a += f' stroke-width="{_f(sw)}"'
    if dash:
        a += f' stroke-dasharray="{dash}"'
    if cls:
        a += f' class="{cls}"'
    if fill:
        a += f' fill="{fill}" stroke="none"'
    return a + "/>"


def _rect(x, y, w, h, sw=0.75, dash=None, cls=None):
    a = (f'<rect x="{_f(x)}" y="{_f(y)}" width="{_f(w)}"'
         f' height="{_f(h)}"')
    if sw != 0.75:
        a += f' stroke-width="{_f(sw)}"'
    if dash:
        a += f' stroke-dasharray="{dash}"'
    if cls:
        a += f' class="{cls}"'
    return a + "/>"


def _text(x, y, s, fill, size=9, rotate=None):
    t = f' transform="translate({_f(x)},{_f(y)}) rotate({rotate})"' \
        if rotate is not None else f' x="{_f(x)}" y="{_f(y)}"'
    body = (f'<text{t} font-family="ui-monospace,monospace"'
            f' font-size="{_f(size)}" fill="{fill}" stroke="none"'
            f' text-anchor="middle" class="o-txt">'
            f'{escape(s)}</text>')
    if rotate is not None:
        body = body.replace("text-anchor", 'x="0" y="0" text-anchor', 1)
    return body


def _cross(vx, vy, arm, sw=0.75):
    return [_line(vx - arm, vy, vx + arm, vy, sw),
            _line(vx, vy - arm, vx, vy + arm, sw)]


# ---------------------------------------------------------------- builders
# Each builder: (rng, w, h, density, fill_c) -> list[str] of elements in
# the local 0,0,w,h space. rng call ORDER is fixed per code path.

def _b_crosshair_grid(rng, w, h, density, fill_c):
    out = []
    spacing = max(56.0, 240.0 - density * 144.0)   # 240 → 96
    jit = spacing * 0.34
    arm = 6.0
    x = spacing * 0.5
    while x < w and len(out) < _MAX_ELEMENTS["crosshair-grid"]:
        y = spacing * 0.5
        while y < h and len(out) < _MAX_ELEMENTS["crosshair-grid"]:
            jx = x + rng.uniform(-jit, jit)
            jy = y + rng.uniform(-jit, jit)
            a = arm * (1.6 if rng.random() < 0.08 else 1.0)
            out += _cross(jx, jy, a)
            y += spacing
        x += spacing
    return out


def _b_dashed_arc(rng, w, h, density, fill_c):
    out = []
    anchors = [(0, 0), (w, 0), (0, h), (w, h),
               (w / 2, 0), (w / 2, h), (0, h / 2), (w, h / 2)]
    ax, ay = rng.choice(anchors)
    n = 2 + int(density * 2.999)                       # 2..4 circles
    base = min(w, h) * rng.uniform(0.30, 0.55)
    step = min(w, h) * rng.uniform(0.12, 0.22)
    for i in range(n):
        out.append(_circle(ax, ay, base + i * step,
                           sw=0.75 if i == 0 else 0.5,
                           dash=rng.choice(["6 10", "3 9", "10 14", "2 7"]),
                           cls="o-dash"))
    # radial ticks crossing the innermost circle
    spokes = 3 + int(density * 5)                      # 3..8
    for _ in range(spokes):
        ang = rng.uniform(0, math.tau)
        r1, r2 = base - 9, base + 9
        out.append(_line(ax + r1 * math.cos(ang), ay + r1 * math.sin(ang),
                         ax + r2 * math.cos(ang), ay + r2 * math.sin(ang),
                         sw=0.5))
    out += _cross(ax, ay, 9, sw=0.75)                  # anchor crosshair
    return out


def _b_tick_marks(rng, w, h, density, fill_c):
    out = []
    k = 1 if rng.random() < 0.55 else 2
    edges = rng.sample(["top", "bottom", "left", "right"], k)
    msp = max(30.0, 96.0 - density * 46.0)             # 96 → 50 px minors
    minor_len, major_len = 6.0, 14.0
    margin = 24.0
    for edge in edges:
        if edge in ("top", "bottom"):
            y = 0.0 if edge == "top" else h
            sgn = 1.0 if edge == "top" else -1.0
            i, x = 0, margin
            while x <= w - margin and len(out) < _MAX_ELEMENTS["tick-marks"]:
                major = (i % 5 == 0)
                ln = major_len if major else minor_len
                out.append(_line(x, y, x, y + sgn * ln,
                                 sw=0.75 if major else 0.5))
                if major and rng.random() < 0.45:
                    out.append(_text(x, y + sgn * (ln + 10),
                                     f"{x:.0f}", fill_c, size=8.5))
                i += 1
                x += msp
        else:
            x = 0.0 if edge == "left" else w
            sgn = 1.0 if edge == "left" else -1.0
            i, y = 0, margin
            while y <= h - margin and len(out) < _MAX_ELEMENTS["tick-marks"]:
                major = (i % 5 == 0)
                ln = major_len if major else minor_len
                out.append(_line(x, y, x + sgn * ln, y,
                                 sw=0.75 if major else 0.5))
                if major and rng.random() < 0.45:
                    out.append(_text(x + sgn * (ln + 14), y,
                                     f"{y:.0f}", fill_c, size=8.5,
                                     rotate=-90))
                i += 1
                y += msp
    return out


def _b_dimension_lines(rng, w, h, density, fill_c):
    out = []
    count = 1 + int(density * 2.4)                     # 1..3
    for _ in range(count):
        horiz = rng.random() < 0.6
        tick = 5.0
        if horiz:
            band = rng.choice([(0.08, 0.20), (0.80, 0.92)])
            y = h * rng.uniform(*band)
            x0 = w * rng.uniform(0.08, 0.30)
            x1 = w * rng.uniform(max(x0 / w + 0.25, 0.4), 0.92)
            out.append(_line(x0, y, x1, y, sw=0.5))
            out.append(_line(x0, y - tick, x0, y + tick, sw=0.75))
            out.append(_line(x1, y - tick, x1, y + tick, sw=0.75))
            out.append(_text((x0 + x1) / 2, y - 6,
                             f"{x1 - x0:.0f}", fill_c, size=9))
        else:
            band = rng.choice([(0.06, 0.18), (0.82, 0.94)])
            x = w * rng.uniform(*band)
            y0 = h * rng.uniform(0.10, 0.32)
            y1 = h * rng.uniform(max(y0 / h + 0.25, 0.4), 0.90)
            out.append(_line(x, y0, x, y1, sw=0.5))
            out.append(_line(x - tick, y0, x + tick, y0, sw=0.75))
            out.append(_line(x - tick, y1, x + tick, y1, sw=0.75))
            out.append(_text(x - 8, (y0 + y1) / 2,
                             f"{y1 - y0:.0f}", fill_c, size=9,
                             rotate=-90))
    return out


def _b_registration_marks(rng, w, h, density, fill_c):
    out = []
    m = rng.uniform(20, 34)
    L = rng.uniform(18, 28)
    for cx, cy, sx, sy in ((m, m, -1, -1), (w - m, m, 1, -1),
                           (m, h - m, -1, 1), (w - m, h - m, 1, 1)):
        out.append(_line(cx + sx * L, cy, cx, cy, sw=0.75))
        out.append(_line(cx, cy + sy * L, cx, cy, sw=0.75))
        out.append(_circle(cx + sx * (L + 6), cy + sy * (L + 6),
                           2.5, sw=0.5))
    # centre target: ring + crosshair + filled dot
    cx, cy = w / 2, h / 2
    out.append(_circle(cx, cy, 13, sw=0.75))
    out += _cross(cx, cy, 19, sw=0.5)
    out.append(_circle(cx, cy, 1.2, fill=fill_c))
    # tiny registration dots along edge midlines
    dots = 2 + int(density * 4)                        # 2..6
    for _ in range(dots):
        edge = rng.choice(["t", "b", "l", "r"])
        if edge in ("t", "b"):
            dx = rng.uniform(w * 0.2, w * 0.8)
            dy = m if edge == "t" else h - m
        else:
            dx = m if edge == "l" else w - m
            dy = rng.uniform(h * 0.2, h * 0.8)
        out += _cross(dx, dy, 4, sw=0.5)
    return out


def _b_compass(rng, w, h, density, fill_c):
    out = []
    cx = w * rng.uniform(0.40, 0.60)
    cy = h * rng.uniform(0.40, 0.60)
    R = min(w, h) * rng.uniform(0.28, 0.42)
    out.append(_circle(cx, cy, R, sw=0.75, dash="5 8", cls="o-dash"))
    out.append(_circle(cx, cy, R * 0.55, sw=0.5, dash="2 6",
                       cls="o-dash"))
    # radial ticks: every 15°, cardinals longer & heavier
    for deg in range(0, 360, 15):
        cardinal = deg % 90 == 0
        ln = 14.0 if cardinal else 6.0
        sw = 0.75 if cardinal else 0.5
        ang = math.radians(deg - 90)                   # 0° = north
        out.append(_line(cx + (R - ln) * math.cos(ang),
                         cy + (R - ln) * math.sin(ang),
                         cx + R * math.cos(ang),
                         cy + R * math.sin(ang), sw=sw))
    # seeded needle + short tail + hub dot
    na = rng.uniform(0, math.tau)
    out.append(_line(cx - 0.25 * R * math.cos(na),
                     cy - 0.25 * R * math.sin(na),
                     cx + 0.85 * R * math.cos(na),
                     cy + 0.85 * R * math.sin(na), sw=0.75))
    out.append(_circle(cx, cy, 1.4, fill=fill_c))
    for label, deg in (("N", 0), ("E", 90), ("S", 180), ("W", 270)):
        ang = math.radians(deg - 90)
        out.append(_text(cx + (R + 16) * math.cos(ang),
                         cy + (R + 16) * math.sin(ang) + 3,
                         label, fill_c, size=9))
    return out


def _regions(rng, w, h, k):
    """Non-overlapping rects for k scatter cells (with an inset gap)."""
    gap = 14.0
    cells = []
    if k == 2:
        if w >= h:
            cells = [(0, 0, w / 2, h), (w / 2, 0, w / 2, h)]
        else:
            cells = [(0, 0, w, h / 2), (0, h / 2, w, h / 2)]
    elif k == 3:
        if w >= h:
            t = w / 3
            cells = [(i * t, 0, t, h) for i in range(3)]
        else:
            t = h / 3
            cells = [(0, i * t, w, t) for i in range(3)]
    else:
        cells = [(0, 0, w / 2, h / 2), (w / 2, 0, w / 2, h / 2),
                 (0, h / 2, w / 2, h / 2), (w / 2, h / 2, w / 2, h / 2)]
    rng.shuffle(cells)  # seeded: which variant lands in which cell
    return [(x + gap, y + gap, rw - 2 * gap, rh - 2 * gap)
            for x, y, rw, rh in cells]


def _b_scatter(rng, w, h, density, fill_c):
    k = rng.randint(2, 4)
    picks = rng.sample(_BASE_VARIANTS, k)
    regions = _regions(rng, w, h, k)
    out = []
    for i, (v, (x, y, rw, rh)) in enumerate(zip(picks, regions)):
        cid = f"ornClip{i}"
        out.append(f'<clipPath id="{cid}">'
                   f'<rect x="0" y="0" width="{_f(rw)}"'
                   f' height="{_f(rh)}"/></clipPath>')
        out.append(f'<g transform="translate({_f(x)},{_f(y)})">'
                   f'<g clip-path="url(#{cid})">')
        out += _BUILDERS[v](rng, rw, rh, density, fill_c)
        out.append("</g></g>")
    return out


def _subpaths(d):
    """Split SVG path data into its M-start sub-paths."""
    parts = [("M" + p).strip()
             for p in re.split(r"(?i)\bM\s*", d.strip()) if p.strip()]
    return parts or [d.strip()]


def _logo_spec(logo, rng):
    """Normalise the `logo` argument into a motif spec dict.

    Technique (per the Whistle Clean reference): take a FRAGMENT of the
    client's mark — one distinctive sub-path/curve — scale it 4–10×,
    translate it so it bleeds off a corner or edge, ghost it at
    0.04–0.10 opacity. Recognisably branded, abstracted by crop+scale.

    Accepted forms for `logo`:
      None / motif name        → declared brand motif from _MOTIFS
                                 (fallback when no client path given)
      raw SVG path data "M..." → sub-paths become fragment candidates
      path to an .svg file     → all path `d`s concatenated
      dict                     → keys:
        d | motif | file       source of the mark
        fragment               int index into sub-paths (wraps), or
                               None → seeded pick
        scale                  4–10 (multiplier on the 0..100 box);
                               None → seeded
        rotation               deg, None → seeded
        placement              one of _LOGO_PLACEMENTS
        opacity                0.04–0.10 ghost (clamped 0.03–0.15)
        tint                   CSS colour override (brand accent);
                               None → inherits group stroke
        centre                 (cx, cy) local anchor; default (50, 50)
    Seed fills in anything unset — same seed+spec → same output.
    """
    spec = {}
    if isinstance(logo, dict):
        spec = dict(logo)
    elif isinstance(logo, str):
        if logo.lstrip().upper().startswith(("M", "L", "C", "Q", "A")):
            spec["d"] = logo.strip()
        elif logo in _MOTIFS:
            spec["motif"] = logo
        else:  # treat as path to an .svg file → all path d's
            try:
                src = open(logo, "r", encoding="utf-8").read()
                ds = re.findall(r'\bd="([^"]+)"', src)
                if ds:
                    spec["d"] = " ".join(ds)
            except OSError:
                pass

    if spec.get("file") and not spec.get("d"):
        try:
            src = open(spec["file"], "r", encoding="utf-8").read()
            ds = re.findall(r'\bd="([^"]+)"', src)
            if ds:
                spec["d"] = " ".join(ds)
        except OSError:
            pass

    if not spec.get("d"):
        m = _MOTIFS.get(spec.get("motif") or _DEFAULT_MOTIF,
                        _MOTIFS[_DEFAULT_MOTIF])
        spec["d"] = m["d"]
        spec["frags"] = list(m["frags"])
    else:
        spec["frags"] = _subpaths(spec["d"])

    frag = spec.get("fragment")
    if frag is None:
        spec["frag_d"] = rng.choice(spec["frags"]) if \
            len(spec["frags"]) > 1 else spec["frags"][0]
    else:
        spec["frag_d"] = spec["frags"][int(frag) % len(spec["frags"])]

    spec["scale"] = float(spec["scale"]) if spec.get("scale") \
        else round(rng.uniform(4.0, 8.0), 2)
    spec["scale"] = min(10.0, max(1.0, spec["scale"]))
    if spec.get("rotation") is None:
        spec["rotation"] = round(rng.uniform(-30, 30), 1)
    spec.setdefault("placement", "scattered")
    if spec["placement"] not in _LOGO_PLACEMENTS:
        spec["placement"] = "scattered"
    spec.setdefault("opacity", round(rng.uniform(0.04, 0.10), 3))
    spec["opacity"] = min(0.15, max(0.03, float(spec["opacity"])))
    spec.setdefault("tint", None)
    cx, cy = spec.get("centre", (50.0, 50.0))
    spec["centre"] = (float(cx), float(cy))
    return spec


def _motif_use(d, x, y, scale, rot, anchor):
    """One ghosted fragment instance anchored at local `anchor`."""
    t = f"translate({_f(x)},{_f(y)})"
    if rot:
        t += f" rotate({_f(rot)} {_f(anchor[0])} {_f(anchor[1])})"
    if scale != 1.0:
        t += f" scale({_f(scale)})"
    return (f'<path d="{escape(d)}" transform="{t}"'
            f' vector-effect="non-scaling-stroke" class="o-motif"/>')


def _b_logo_motif(rng, w, h, density, fill_c, spec=None):
    if spec is None:
        spec = _logo_spec(None, rng)
    out = []
    place = spec["placement"]
    anchor = spec["centre"]
    s = spec["scale"]
    rot = spec["rotation"]
    ext = 100.0 * s * 0.5                    # approx half-extent (px)

    if place == "scattered":
        # 1–3 ghost fragments, seeded anywhere incl. off-canvas bleed
        n = 1 + int(density * 2)
        for _ in range(n):
            x = rng.uniform(-ext * 0.3, w + ext * 0.3)
            y = rng.uniform(-ext * 0.3, h + ext * 0.3)
            out.append(_motif_use(spec["frag_d"], x, y, s,
                                  spec["rotation"], anchor))
    else:
        # corner/edge anchors: fragment centre sits just inside the
        # named corner or just past the named edge — giant scale does
        # the cropping
        if place == "top-left":
            x, y = w * 0.08, h * 0.08
        elif place == "top-right":
            x, y = w * 0.92, h * 0.08
        elif place == "bottom-left":
            x, y = w * 0.08, h * 0.92
        elif place == "bottom-right":
            x, y = w * 0.92, h * 0.92
        elif place == "bleed-left":
            x, y = -ext * rng.uniform(0.35, 0.55), h * 0.5
        elif place == "bleed-right":
            x, y = w + ext * rng.uniform(0.35, 0.55), h * 0.5
        elif place == "bleed-top":
            x, y = w * 0.5, -ext * rng.uniform(0.35, 0.55)
        else:  # bleed-bottom
            x, y = w * 0.5, h + ext * rng.uniform(0.35, 0.55)
        out.append(_motif_use(spec["frag_d"], x, y, s, rot, anchor))
        # a second smaller echo instance on the opposite side keeps
        # the ghost from feeling lopsided at higher densities
        if density >= 0.6 and place.startswith(("top", "bottom")):
            out.append(_motif_use(spec["frag_d"], w - x, h - y,
                                  s * 0.55, -rot, anchor))

    if spec.get("tint"):
        tint = escape(str(spec["tint"]), {'"': "&quot;"})
        return [f'<g stroke="{tint}">'] + out + ["</g>"]
    return out


_BUILDERS = {
    "crosshair-grid": _b_crosshair_grid,
    "dashed-arc": _b_dashed_arc,
    "tick-marks": _b_tick_marks,
    "dimension-lines": _b_dimension_lines,
    "registration-marks": _b_registration_marks,
    "compass": _b_compass,
    "logo-motif": _b_logo_motif,
    "scatter": _b_scatter,
}


# ------------------------------------------------------------------ public

def generate(variant, seed=0, width=1440, height=760,
             accent=None, density=0.5, animate=False, logo=None):
    """Return a deterministic decorative ornament SVG string.

    See module docstring for the full parameter/determinism contract.
    `logo` only affects variant="logo-motif" (see _logo_spec for the
    accepted forms).
    """
    if variant not in _BUILDERS:
        raise ValueError(
            f"unknown variant {variant!r}; expected one of {VARIANTS}")
    w, h = float(width), float(height)
    if w <= 0 or h <= 0:
        raise ValueError("width and height must be positive")
    density = min(1.0, max(0.0, float(density)))

    rng = random.Random(seed)
    stroke_c = escape(str(accent), {'"': "&quot;"}) \
        if accent else "currentColor"
    fill_c = "currentColor"

    spec = None
    if variant == "logo-motif":
        spec = _logo_spec(logo, rng)
        opacity = _f(spec["opacity"])            # ghost band 0.04–0.10
    else:
        opacity = _f(0.10 + rng.random() * 0.08)  # 0.10–0.18

    parts = [
        '<svg xmlns="http://www.w3.org/2000/svg"'
        f' class="orn orn--{variant}"'
        f' width="{_f(w)}" height="{_f(h)}"'
        f' viewBox="0 0 {_f(w)} {_f(h)}"'
        ' role="img" aria-hidden="true">'
    ]
    if animate:
        parts.append(f"<style>{_ANIMATE_CSS}</style>")
    parts.append(f'<g fill="none" stroke="{stroke_c}"'
                 f' stroke-width="0.75"'
                 f' stroke-linecap="square" opacity="{opacity}">')
    if spec is not None:
        parts += _b_logo_motif(rng, w, h, density, fill_c, spec)
    else:
        parts += _BUILDERS[variant](rng, w, h, density, fill_c)
    parts.append("</g></svg>")
    return "".join(parts)


def main(argv=None):
    p = argparse.ArgumentParser(
        description="Parametric technical ornament SVG generator "
                    "(decorative, aria-hidden, deterministic).")
    p.add_argument("--variant", required=True, choices=VARIANTS)
    p.add_argument("--seed", type=int, default=0)
    p.add_argument("--width", type=float, default=1440)
    p.add_argument("--height", type=float, default=760)
    p.add_argument("--accent", default=None,
                   help="CSS colour for strokes (default: currentColor)")
    p.add_argument("--density", type=float, default=0.5)
    p.add_argument("--animate", action="store_true",
                   help="embed CSS dash-drift animation "
                        "(prefers-reduced-motion aware)")
    p.add_argument("--logo", default=None,
                   help="logo-motif source: motif name "
                        f"({', '.join(sorted(_MOTIFS))}), raw SVG path "
                        "data, or path to an .svg file")
    p.add_argument("--logo-fragment", type=int, default=None,
                   help="sub-path index of the fragment to ghost")
    p.add_argument("--logo-scale", type=float, default=None,
                   help="fragment scale, 4-10 (seeded when omitted)")
    p.add_argument("--logo-rotation", type=float, default=None,
                   help="fragment rotation in degrees")
    p.add_argument("--logo-placement", default=None,
                   choices=_LOGO_PLACEMENTS)
    p.add_argument("--logo-opacity", type=float, default=None,
                   help="ghost opacity 0.04-0.10")
    p.add_argument("--logo-tint", default=None,
                   help="CSS colour override (brand accent)")
    a = p.parse_args(argv)
    logo = a.logo
    if a.variant == "logo-motif":
        # fold explicit CLI overrides into a spec dict
        overrides = {"fragment": a.logo_fragment,
                     "scale": a.logo_scale,
                     "rotation": a.logo_rotation,
                     "placement": a.logo_placement,
                     "opacity": a.logo_opacity,
                     "tint": a.logo_tint}
        overrides = {k: v for k, v in overrides.items()
                     if v is not None}
        if overrides:
            if logo is None:
                logo = {}
            elif isinstance(logo, str):
                if logo.lstrip().upper().startswith(
                        ("M", "L", "C", "Q", "A")):
                    logo = {"d": logo}
                elif logo in _MOTIFS:
                    logo = {"motif": logo}
                else:
                    logo = {"file": logo}
            logo.update(overrides)
    print(generate(a.variant, seed=a.seed, width=a.width,
                   height=a.height, accent=a.accent,
                   density=a.density, animate=a.animate, logo=logo))


if __name__ == "__main__":
    main()
