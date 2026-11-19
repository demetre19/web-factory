#!/usr/bin/env python3
"""ornament.py — the tech-ornament recipe family: parametric,
deterministic inline-SVG for draftsman/blueprint decoration.

Never AI-generated geometry: same seed + params → byte-identical SVG.
Style binds to theme tokens (stroke="currentColor" on the root —
components recolour via ink-* / muted classes), stroke-width 0.5–1px,
always aria-hidden decorative behind content.

  from ornament import generate
  generate(seed=7, density=0.4, bounds=(320, 240),
           variants=('crosshair-grid', 'registration-marks'))
"""

# placement vector axes — O.5/O.6/O.7
INTENSITY_BANDS = {'ghost': (0.02, 0.08), 'accent': (0.08, 0.17),
                   'statement': (0.17, 0.32), 'bold': (0.30, 0.60)}
MOTIONS = ('static', 'drift', 'rotate', 'dash-draw', 'pulse',
           'reveal')
LAYERS = ('technical', 'logo-motif', 'decorative')
MAX_PER_PAGE = 4  # intentional, sparse — blanket sprinkle fails
import hashlib
import random

# the closed variant vocabulary — O.1. Organic/decorative variants
# join this table when the family grows (same parametric contract).
VARIANTS = ('dashed-arc', 'crosshair-grid', 'tick-marks',
            'dimension-lines', 'registration-marks', 'compass')


def _fmt(x):
    s = f'{x:.1f}'.rstrip('0').rstrip('.')
    return s if s else '0'


def _cross(rng, w, h, density):
    # crosshair-grid: crosses on a jittered lattice
    n = max(1, int(4 + density * 8))
    parts = []
    for i in range(n):
        x = w * (0.08 + 0.84 * (i % int(n ** 0.5 + 0.99) + 0.5) /
                 (int(n ** 0.5 + 0.99) or 1))
        y = h * (0.12 + 0.76 * (i // int(n ** 0.5 + 0.99) + 0.5) /
                 (n // int(n ** 0.5 + 0.99) + 1))
        r = 4 + rng.random() * 3
        parts.append(f'<path d="M{_fmt(x - r)} {_fmt(y)}H{_fmt(x + r)}'
                     f'M{_fmt(x)} {_fmt(y - r)}V{_fmt(y + r)}"/>')
    return parts


def _ticks(rng, w, h, density):
    # tick-marks: short perpendicular ticks along the top+bottom edges
    n = max(2, int(6 + density * 14))
    step = w / n
    parts = []
    for i in range(n):
        x = _fmt(step * (i + 0.5))
        long = i % 4 == 0
        ln = 8 if long else 4
        parts.append(f'<path d="M{x} 0V{ln}M{x} {_fmt(h)}V{_fmt(h - ln)}"/>')
    return parts


def _dimlines(rng, w, h, density):
    # dimension-lines: a witness line with end ticks + centre gap
    y = h * (0.5 + (rng.random() - 0.5) * 0.2)
    x0, x1 = w * 0.15, w * 0.85
    gap = w * 0.06
    cx = (x0 + x1) / 2
    return [
        f'<path d="M{_fmt(x0)} {_fmt(y)}H{_fmt(cx - gap)}'
        f'M{_fmt(cx + gap)} {_fmt(y)}H{_fmt(x1)}"/>',
        f'<path d="M{_fmt(x0)} {_fmt(y - 4)}V{_fmt(y + 4)}'
        f'M{_fmt(x1)} {_fmt(y - 4)}V{_fmt(y + 4)}"/>']


def _regmarks(rng, w, h, density):
    # registration-marks: corner circles with crosses
    parts = []
    for cx, cy in ((0.08, 0.12), (0.92, 0.12), (0.08, 0.88),
                   (0.92, 0.88)):
        x, y = w * cx, h * cy
        r = 5
        parts.append(f'<circle cx="{_fmt(x)}" cy="{_fmt(y)}" r="{r}"/>')
        parts.append(f'<path d="M{_fmt(x - r - 3)} {_fmt(y)}'
                     f'H{_fmt(x + r + 3)}M{_fmt(x)} {_fmt(y - r - 3)}'
                     f'V{_fmt(y + r + 3)}"/>')
    return parts


def _dasharc(rng, w, h, density):
    # dashed-arc: quarter arc, CSS dash rhythm (stroke-dashoffset
    # drift animates it — tamdoma, no JS)
    cx, cy = w * (0.2 + rng.random() * 0.6), h * (0.2 + rng.random() * 0.6)
    r = min(w, h) * (0.2 + density * 0.25)
    x0, y0 = cx + r, cy
    x1, y1 = cx, cy + r
    return [f'<path d="M{_fmt(x0)} {_fmt(y0)}'
            f'A{_fmt(r)} {_fmt(r)} 0 0 1 {_fmt(x1)} {_fmt(y1)}"'
            ' stroke-dasharray="4 4" class="ornament-drift"/>']


def _compass(rng, w, h, density):
    # compass: outer circle + cardinal ticks + needle
    cx, cy = w / 2, h / 2
    r = min(w, h) * 0.3
    parts = [f'<circle cx="{_fmt(cx)}" cy="{_fmt(cy)}" r="{_fmt(r)}"'
             ' stroke-dasharray="2 3" class="ornament-drift"/>']
    for dx, dy in ((0, -1), (0, 1), (-1, 0), (1, 0)):
        parts.append(
            f'<path d="M{_fmt(cx + dx * (r - 6))} {_fmt(cy + dy * (r - 6))}'
            f'L{_fmt(cx + dx * (r + 4))} {_fmt(cy + dy * (r + 4))}"/>')
    parts.append(f'<path d="M{_fmt(cx)} {_fmt(cy + r * 0.5)}'
                 f'L{_fmt(cx)} {_fmt(cy - r * 0.5)}"/>')
    return parts


_FNS = {'dashed-arc': _dasharc, 'crosshair-grid': _cross,
        'tick-marks': _ticks, 'dimension-lines': _dimlines,
        'registration-marks': _regmarks, 'compass': _compass}


def generate(seed=0, density=0.5, bounds=(200, 200), accent=None,
             variants=('crosshair-grid',)):
    """Canonical ornament SVG string — deterministic: same arguments
    always produce the same bytes."""
    for v in variants:
        if v not in _FNS:
            raise ValueError(f'variant {v!r} not in {VARIANTS}')
    density = min(1.0, max(0.0, density))
    w, h = bounds
    rng = random.Random(seed)
    parts = []
    for v in variants:
        parts += _FNS[v](rng, w, h, density)
    return ('<svg xmlns="http://www.w3.org/2000/svg" '
            f'viewBox="0 0 {int(w)} {int(h)}" fill="none" '
            'stroke="currentColor" stroke-width="0.5" '
            'aria-hidden="true">' + ''.join(parts) + '</svg>')


def ornament_hash(svg):
    return hashlib.sha256(svg.encode()).hexdigest()[:12]


def canonical(svg):
    """Whitespace-canonical form for rendered-vs-generated compare
    (data-* attributes stripped — they're renderer metadata)."""
    import re as _re
    t = _re.sub(r'\s+', ' ', svg).strip()
    t = _re.sub(r'>\s+<', '><', t)
    t = _re.sub(r'\s+data-ornament[a-z-]*="[^"]*"', '', t)
    t = _re.sub(r'\s*/>', '/>', t)
    return t


if __name__ == '__main__':
    import sys
    seed = int(sys.argv[1]) if len(sys.argv) > 1 else 7
    print(generate(seed=seed, density=0.4, bounds=(320, 240),
                   variants=('crosshair-grid', 'registration-marks')))
