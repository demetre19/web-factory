#!/usr/bin/env python3
"""imgdiff.py — how much two renders differ *visibly*. Runs inside
.venv-vlm (PIL).

  python3 imgdiff.py a.png b.png   → "0.1234 0.0876"
                                       raw-fraction  block-fraction

raw    — share of pixels whose luminance moved >16 (thin lines count
         only for their own pixels, so distributed hairlines score
         low here).
block  — share of 8×8 cells whose mean luminance moved >2. A
         hairline crossing many cells moves every cell it touches,
         so this tracks "how much of the page reads differently"
         rather than how many single pixels changed.
"""
import sys

from PIL import Image


def main():
    a = Image.open(sys.argv[1]).convert('L')
    b = Image.open(sys.argv[2]).convert('L')
    if a.size != b.size:
        b = b.resize(a.size)
    W, H = a.size
    pa, pb = a.tobytes(), b.tobytes()
    raw = sum(1 for i in range(len(pa))
              if abs(pa[i] - pb[i]) > 16) / len(pa)
    step = 8
    moved = cells = 0
    for y0 in range(0, H - step + 1, step):
        for x0 in range(0, W - step + 1, step):
            sa = sb = 0
            for yy in range(y0, y0 + step):
                row = yy * W
                sa += sum(pa[row + x0:row + x0 + step])
                sb += sum(pb[row + x0:row + x0 + step])
            cells += 1
            if abs(sa - sb) / (step * step) > 2:
                moved += 1
    print(f'{raw:.4f} {moved / max(1, cells):.4f}')


if __name__ == '__main__':
    main()
