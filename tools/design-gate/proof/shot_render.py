#!/usr/bin/env python3
"""shot_render.py — rasterise a design option to PNG for VLM
judgment. Deterministic: the DNA knob vector + copy is the whole
input — same inputs, same pixels. Runs inside .venv-vlm (PIL).

  python3 shot_render.py spec.json out.png
spec: {width, height, vars: {--bg, --ink, --accent, --accent-ink,
      --muted, --radius, --f-display, --f-body, --pad-block,
      --line}, copy: [headline, lead]}
"""

import json
import re
import sys

from PIL import Image, ImageDraw, ImageFont

FONT = '/System/Library/Fonts/Helvetica.ttc'


def _clamp_px(v, default):
    m = re.search(r'([\d.]+)rem', str(v))
    if m:
        return float(m.group(1)) * 16
    m = re.search(r'(\d+)px', str(v))
    return float(m.group(1)) if m else default


def render(spec, out):
    v = spec['vars']
    W, H = spec['width'], spec['height']
    img = Image.new('RGB', (W, H), v.get('--bg', '#ffffff'))
    d = ImageDraw.Draw(img)
    fs = max(28, int(_clamp_px(v.get('--f-display'), 48) * W / 1280))
    fb = max(16, int(_clamp_px(v.get('--f-body'), 17) * W / 1280))
    fh = ImageFont.truetype(FONT, fs)
    ft = ImageFont.truetype(FONT, fb)
    cx = W // 2
    pad = int(W * 0.12)
    y = int(H * 0.28)
    h = spec['copy'][0]
    for line in _wrap(h, fh, W - 2 * pad, d):
        d.text((cx, y), line, font=fh, fill=v.get('--ink', '#000'),
               anchor='ma')
        y += int(fs * 1.15)
    y += int(H * 0.04)
    for line in _wrap(spec['copy'][1], ft, W - 2 * pad, d):
        d.text((cx, y), line, font=ft, fill=v.get('--muted', '#555'),
               anchor='ma')
        y += int(fb * 1.6)
    y += int(H * 0.06)
    r = int(_clamp_px(v.get('--radius'), 6))
    # J.7 element-variant — the signature element above the headline
    el = spec.get('element', 'text')
    ink = v.get('--ink', '#000')
    if el != 'text':
        ey = y - int(H * 0.14)
        if el == 'image':
            d.rounded_rectangle(
                [cx - int(W * 0.22), ey - int(H * 0.12),
                 cx + int(W * 0.22), ey + int(H * 0.12)],
                radius=r, outline=v.get('--line', '#ccc'), width=2)
            d.text((cx, ey), '[ hero media ]', font=ft,
                   fill=v.get('--muted', '#888'), anchor='mm')
        elif el == 'avatar':
            for i, dx in enumerate((-70, 0, 70)):
                d.ellipse([cx + dx - 26, ey - 26, cx + dx + 26,
                           ey + 26], outline=v.get('--accent', '#333'),
                          width=3)
                d.ellipse([cx + dx - 8, ey - 8, cx + dx + 8, ey + 8],
                          fill=v.get('--muted', '#999'))
        elif el == 'icon':
            d.line([cx - 18, ey, cx - 2, ey + 16, cx + 22, ey - 14],
                   fill=v.get('--accent', '#333'), width=5)
        elif el == 'logo+number':
            d.rectangle([cx - 60, ey - 20, cx - 16, ey + 20],
                        outline=v.get('--accent', '#333'), width=2)
            d.text((cx + 24, ey), '01', font=ft,
                   fill=ink, anchor='mm')
    bw, bh = int(W * 0.16), int(H * 0.09)
    d.rounded_rectangle([cx - bw // 2, y, cx + bw // 2, y + bh],
                        radius=r, fill=v.get('--accent', '#2563eb'))
    d.text((cx, y + bh // 2), 'Get a quote', font=ft,
           fill=v.get('--accent-ink', '#fff'), anchor='mm')
    # hairline bottom rule — the seam cue
    d.line([pad, H - 1, W - pad, H - 1],
           fill=v.get('--line', '#ddd'), width=1)
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
