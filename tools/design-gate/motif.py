#!/usr/bin/env python3
"""motif.py — brand-motif extraction: decompose a logo SVG into a
geometric MOTIF KIT that propagates as the site's decorative
vocabulary (O-rules draw from it; check_motif binds decorations to
the kit).

  python3 motif.py logo.svg          # → kit JSON on stdout
  from motif import extract; kit = extract('logo.svg')

Kit: {primary_mark, curve_family, angle, geometric_seed,
      negative_shape, aspect, stroke_angle, primitives[]}.
Extraction is mechanical analysis of the SVG — counts and angles,
not AI interpretation."""

import hashlib
import json
import math
import re
import sys
import xml.etree.ElementTree as ET


def _nums(d):
    return [float(x) for x in re.findall(r'-?\d+(?:\.\d+)?', d)]


def _angles(paths):
    """Dominant segment angles (deg, mod 180) across all path data —
    the mark's stroke direction."""
    angs = []
    for d in paths:
        pts = _nums(d)
        for i in range(0, len(pts) - 3, 2):
            dx, dy = pts[i + 2] - pts[i], pts[i + 3] - pts[i + 1]
            if abs(dx) + abs(dy) < 0.5:
                continue
            a = math.degrees(math.atan2(dy, dx)) % 180
            angs.append(round(a))
    if not angs:
        return None
    # circular-ish mode over 12 buckets of 15°
    buckets = {}
    for a in angs:
        buckets[a // 15 * 15] = buckets.get(a // 15 * 15, 0) + 1
    return max(buckets, key=buckets.get)


def _bbox(paths):
    xs, ys = [], []
    for d in paths:
        pts = _nums(d)
        xs += pts[0::2]
        ys += pts[1::2]
    if not xs:
        return None
    return (min(xs), min(ys), max(xs), max(ys))


def extract(svg_path):
    """Logo SVG → motif kit dict."""
    raw = open(svg_path, encoding='utf-8').read()
    # strip namespace for a tolerant parse
    xml = re.sub(r'xmlns="[^"]+"', '', raw, count=1)
    root = ET.fromstring(xml)
    paths, curves, circles, rects, lines, polys = [], 0, 0, 0, 0, 0
    for el in root.iter():
        tag = el.tag.rsplit('}', 1)[-1]
        if tag == 'path':
            d = el.get('d', '')
            paths.append(d)
            curves += len(re.findall(r'[CcSsQqTtAa]', d))
        elif tag == 'circle' or tag == 'ellipse':
            circles += 1
        elif tag == 'rect':
            rects += 1
        elif tag == 'line':
            lines += 1
        elif tag in ('polygon', 'polyline'):
            polys += 1
    bb = _bbox(paths)
    aspect = None
    if bb and bb[2] > bb[0]:
        aspect = round((bb[3] - bb[1]) / (bb[2] - bb[0]), 2)
    if curves and curves >= len(paths):
        curve_family = 'arc-dominant'
    elif curves:
        curve_family = 'mixed'
    else:
        curve_family = 'linear'
    shape_counts = {'circle': circles, 'rect': rects,
                    'line': lines, 'polygon': polys,
                    'path': len(paths)}
    primary = max(shape_counts, key=shape_counts.get) or 'path'
    primitives = [s for s, c in shape_counts.items() if c]
    # negative shape: holes in filled geometry → 'counter'; else 'open'
    neg = 'counter' if re.search(r'fill-rule="evenodd"', raw) or \
        (curves and len(paths) > 2) else 'open'
    kit = {
        'primary_mark': f'{primary}-form',
        'curve_family': curve_family,
        'angle': _angles(paths),
        'geometric_seed': hashlib.sha256(
            ''.join(paths).encode()).hexdigest()[:10],
        'negative_shape': neg,
        'aspect': aspect,
        'primitives': primitives,
    }
    return kit


if __name__ == '__main__':
    print(json.dumps(extract(sys.argv[1]), indent=1))
