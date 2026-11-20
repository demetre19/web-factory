#!/usr/bin/env python3
"""shot_render.py — rasterise a design option to PNG for VLM
judgment. Deterministic: the DNA knob vector + copy is the whole
input — same inputs, same pixels. Runs inside .venv-vlm (PIL).

  python3 shot_render.py spec.json out.png

spec: {width, height, copy: [headline, lead],
      vars: {--bg, --ink, --accent, --accent-ink, --muted, --radius,
             --f-display, --f-body, --pad-block, --line, --track},
      element: 'text|image|avatar|icon|logo+number|icon+image|avatar+image',
      font: '/System/Library/Fonts/Helvetica.ttc',
      tracking: 0.0,               # letter-spacing em fraction
      layout: 'center|split|left',
      seam: 'hairline|diagonal|arc|double|none',
      ornament: 'none|ticks|grid|dimension',
      media_weight: 'none|thumb|hero'}
"""

import json
import os
import re
import sys

from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, os.path.dirname(os.path.dirname(
    os.path.abspath(__file__))))
import clamp  # noqa: E402  (stdlib-only; the ACSS calculator)

FONT = '/System/Library/Fonts/Helvetica.ttc'


def _clamp_px(v, default):
    m = re.search(r'([\d.]+)rem', str(v))
    if m:
        return float(m.group(1)) * 16
    m = re.search(r'([\d.]+)px', str(v))
    if m:
        return float(m.group(1))
    m = re.search(r'([\d.]+)', str(v))
    return float(m.group(1)) * 16 if m else default


def _cqi(val, W, default):
    """Evaluate a CSS clamp at render width W — mobile-first: at 375
    the min bound wins, at 1280 the fluid term. The emitted ACSS form
    `clamp(MIN, calc(Avw + Brem), MAX)` (and max(stop, clamp(…)))
    goes through clamp.px_at; legacy proof fixtures carry
    `clamp(min, [off +] Ncqi, max)`, evaluated with the container ≈ W.
    Without this the mobile shot is a scaled-down desktop and every
    mobile judgment is fiction."""
    try:
        return clamp.px_at(str(val), float(W))
    except ValueError:
        pass
    m = re.search(
        r'clamp\(\s*([\d.]+)(rem|px)\s*,\s*'
        r'(?:([\d.]+)(rem|px)\s*\+\s*)?([\d.]+)cqi\s*,\s*'
        r'([\d.]+)(rem|px)\s*\)', str(val))
    if m:
        u = {'rem': 16, 'px': 1}
        lo = float(m.group(1)) * u[m.group(2)]
        off = (float(m.group(3)) * u[m.group(4)]
               if m.group(3) else 0.0)
        mid = off + float(m.group(5)) * W / 100
        hi = float(m.group(6)) * u[m.group(7)]
        return max(lo, min(mid, hi))
    return _clamp_px(val, default)


def _font(spec, px):
    p = spec.get('font') or FONT
    try:
        return ImageFont.truetype(p, int(px))
    except (OSError, IOError):
        return ImageFont.truetype(FONT, int(px))


def _blend(a, b, t):
    """a over b at alpha t → hex (PIL has no alpha line draw)."""
    import re as _re
    def rgb(h):
        h = (h or '#000').lstrip('#')
        if len(h) == 3:
            h = ''.join(c * 2 for c in h)
        return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))
    ra, rb = rgb(a), rgb(b)
    out = [round(rb[i] + (ra[i] - rb[i]) * t) for i in range(3)]
    return '#%02x%02x%02x' % tuple(out)


def _ornament(d, spec, W, H):
    v = spec['vars']
    kind = spec.get('ornament', 'none')
    if kind == 'none':
        return
    # ghost intensity: ink blended into the page at 18% — a hairline
    # token alone is below perceptual threshold at page scale
    line = _blend(v.get('--ink', '#000'), v.get('--bg', '#fff'),
                  0.18)
    if kind == 'ticks':
        for x in range(0, W, 40):
            d.line([x, 12, x, 20], fill=line, width=1)
            d.line([x, H - 20, x, H - 12], fill=line, width=1)
    elif kind == 'grid':
        step = int(W * 0.08)
        for x in range(step, W, step):
            d.line([x, 0, x, H], fill=line, width=1)
        for y in range(step, H, step):
            d.line([0, y, W, y], fill=line, width=1)
    elif kind == 'dimension':
        for x in range(0, W, 80):
            d.line([x, 0, x, 6], fill=line, width=1)
            d.line([x, H - 6, x, H], fill=line, width=1)
            if x:
                d.line([x - 80, 3, x, 3], fill=line, width=1)
                d.line([x - 80, H - 3, x, H - 3], fill=line, width=1)


def _seam(d, spec, W, H):
    v = spec['vars']
    kind = spec.get('seam', 'hairline')
    if kind == 'none':
        return
    line = v.get('--line', '#ddd')
    if kind == 'hairline':
        d.line([0, H - 1, W, H - 1], fill=line, width=1)
    elif kind == 'double':
        d.line([0, H - 3, W, H - 3], fill=line, width=1)
        d.line([0, H - 6, W, H - 6], fill=line, width=1)
    elif kind == 'diagonal':
        d.line([0, H - 1, W, int(H * 0.9)], fill=line, width=2)
    elif kind == 'arc':
        d.arc([int(W * 0.1), int(H * 0.86), int(W * 0.9), int(H * 1.3)],
              start=180, end=360, fill=line, width=2)


def _element(d, spec, W, H, cx, ey):
    """Draw the signature element centred at ey; returns the
    bottom-most y it occupied so the headline never overlaps."""
    v = spec['vars']
    r = int(_clamp_px(v.get('--radius'), 6))
    ink = v.get('--ink', '#000')
    ft = spec['ft']
    mw = spec.get('media_weight', 'none')
    box_w = int(W * (0.22 if mw != 'hero' else 0.34))
    box_h = int(H * (0.12 if mw != 'hero' else 0.2))
    # clamp the media box into the content column — on left/split
    # layouts an unclamped centre can bleed off the page edge
    col_l, col_r = int(W * 0.12), int(W * 0.88)
    box_w = min(box_w, (col_r - col_l) // 2)
    cx = max(col_l + box_w, min(cx, col_r - box_w))
    bottom = ey
    for el in spec.get('element', 'text').split('+'):
        if el == 'text' or el == 'none':
            continue
        if el == 'image' and mw != 'none':
            d.rounded_rectangle(
                [cx - box_w, ey - box_h, cx + box_w, ey + box_h],
                radius=r, outline=v.get('--line', '#ccc'), width=2)
            d.text((cx, ey), '[ hero media ]', font=ft,
                   fill=v.get('--muted', '#888'), anchor='mm')
            bottom = max(bottom, ey + box_h)
        elif el == 'avatar':
            for dx in (-70, 0, 70):
                d.ellipse([cx + dx - 26, ey - 26, cx + dx + 26,
                           ey + 26], outline=v.get('--accent', '#333'),
                          width=3)
                d.ellipse([cx + dx - 8, ey - 8, cx + dx + 8, ey + 8],
                          fill=v.get('--muted', '#999'))
            bottom = max(bottom, ey + 26)
        elif el == 'icon':
            d.line([cx - 18, ey, cx - 2, ey + 16, cx + 22, ey - 14],
                   fill=v.get('--accent', '#333'), width=5)
            bottom = max(bottom, ey + 16)
        elif el == 'logo':
            d.rectangle([cx - 60, ey - 20, cx - 16, ey + 20],
                        outline=v.get('--accent', '#333'), width=2)
            bottom = max(bottom, ey + 20)
        elif el == 'number':
            d.text((cx + 24, ey), '01', font=ft, fill=ink,
                   anchor='mm')
            bottom = max(bottom, ey + 14)
    return bottom


def _tracked(d, xy, text, font, fill, track_px, anchor, draw):
    """Letter-spaced text: per-char advance when track_px != 0."""
    if not track_px:
        draw.text(xy, text, font=font, fill=fill, anchor=anchor)
        return
    x, y = xy
    total = sum(d.textlength(c, font=font) for c in text) + \
        track_px * (len(text) - 1)
    sx = x - total / 2 if anchor.startswith('m') else x
    for c in text:
        draw.text((sx, y), c, font=font, fill=fill, anchor='la')
        sx += d.textlength(c, font=font) + track_px


def render(spec, out):
    v = spec['vars']
    W, H = spec['width'], spec['height']
    img = Image.new('RGB', (W, H), v.get('--bg', '#ffffff'))
    d = ImageDraw.Draw(img)
    fs = max(20, int(_cqi(v.get('--f-display'), W, 48)))
    fb = max(16, int(_cqi(v.get('--f-body'), W, 17)))
    fh = _font(spec, fs)
    ft = _font(spec, fb)
    layout = spec.get('layout', 'center')
    track = float(spec.get('tracking', 0)) * fs
    pad = int(W * 0.12)
    pb_px = _cqi(v.get('--pad-block'), W, 64)
    gap_px = _cqi(v.get('--gap'), W, 24)
    y = int(H * 0.10 + pb_px * 0.8)
    cx = W // 2
    # surface panel — makes radius + density real visual axes, not
    # invisible token values (a card on the page background)
    r0 = int(_clamp_px(v.get('--radius'), 6))
    surf = v.get('--surface') or v.get('--bg')
    if surf and surf.lower() != v.get('--bg', '').lower():
        inset = int(W * 0.045)
        d.rounded_rectangle([inset, int(H * 0.06),
                             W - inset, int(H * 0.94)],
                            radius=r0, fill=surf,
                            outline=v.get('--line', '#ddd'), width=1)
    # ornament sits ON the surface, behind content — drawing it after
    # the opaque panel is what makes it visible at all
    _ornament(d, spec, W, H)
    if layout == 'split':
        cx = int(W * 0.35)
    elif layout == 'left':
        cx = pad + int((W - 2 * pad) / 4)
    anchor = 'ma' if layout == 'center' else 'la'
    # signature element above the headline — its block is reserved
    # so text never overlaps the artwork
    spec['ft'] = ft
    el = spec.get('element', 'text')
    if el not in ('text', 'none'):
        ey = int(H * 0.24)
        y = _element(d, spec, W, H, cx, ey) + int(gap_px * 1.2)
    h = spec['copy'][0]
    for line in _wrap(h, fh, W - 2 * pad, d):
        _tracked(d, (cx if anchor == 'ma' else pad, y), line,
                 fh, v.get('--ink', '#000'), track, anchor, d)
        y += int(fs * 1.15)
    y += int(H * 0.02 + gap_px * 0.5)
    for line in _wrap(spec['copy'][1], ft, W - 2 * pad, d):
        d.text((cx if anchor == 'ma' else pad, y), line, font=ft,
               fill=v.get('--muted', '#555'), anchor=anchor)
        y += int(fb * 1.6)
    y += int(H * 0.02 + gap_px * 0.9)
    r = int(_clamp_px(v.get('--radius'), 6))
    bw, bh = int(W * 0.16), int(H * 0.09)
    # the label must fit: widen the button before clipping the copy
    bw = max(bw, int(d.textlength(spec.get('cta', 'Get a quote'),
                                  font=ft)) + int(fb * 1.2))
    bw = min(bw, W - 2 * pad)
    bx = cx - bw // 2 if anchor == 'ma' else pad
    d.rounded_rectangle([bx, y, bx + bw, y + bh],
                        radius=r, fill=v.get('--accent', '#2563eb'))
    d.text((bx + bw // 2, y + bh // 2), spec.get('cta', 'Get a quote'),
           font=ft, fill=v.get('--accent-ink', '#fff'), anchor='mm')
    _seam(d, spec, W, H)
    img.save(out)


def _wrap(text, font, maxw, d):
    words, lines, cur = text.split(), [], ''
    for w in words:
        t = (cur + ' ' + w).strip()
        if d.textlength(t, font=font) <= maxw:
            cur = t
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines or ['']


if __name__ == '__main__':
    render(json.load(open(sys.argv[1])), sys.argv[2])
