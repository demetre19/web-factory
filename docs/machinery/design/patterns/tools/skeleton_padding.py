#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# ///
"""PRINCIPLES-layer padding from skeletons (HyperUI + shadcn).

Measures inner padding directly from the class strings (Tailwind
spacing scale, 0.25rem units) — deterministic, no render. Every row is
tagged `source_pool: skeleton:<kit>` so principles stats can say where
the number came from.

Type mapping: skeleton dir/file name -> component vocabulary (same
slugs pad_ratios.py uses so the pools merge).

  uv run skeleton_padding.py      # prints JSON rows
"""
import json
import os
import re
import sys
from collections import defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..', '..', '..'))
SKEL = os.path.join(ROOT, '..', 'templates', 'skeletons')

REM = 16.0
# tailwind spacing scale (px @1rem=16px); fractions + arbitrary values
UNIT = {'px': 1.0, '0': 0.0, '0.5': 2.0, '1': 4.0, '1.5': 6.0, '2': 8.0,
        '2.5': 10.0, '3': 12.0, '3.5': 14.0, '4': 16.0, '5': 20.0,
        '6': 24.0, '7': 28.0, '8': 32.0, '9': 36.0, '10': 40.0,
        '11': 44.0, '12': 48.0, '14': 56.0, '16': 64.0, '20': 80.0,
        '24': 96.0, '28': 112.0, '32': 128.0, '36': 144.0, '40': 160.0,
        '44': 176.0, '48': 192.0, '52': 208.0, '56': 224.0,
        '60': 240.0, '64': 256.0, '72': 288.0, '80': 320.0,
        '96': 384.0}

PAD_RE = re.compile(
    r'p([xytrbl]?)-(?:\[([\d.]+)px\]|([\d.]+|px))')
H_RE = re.compile(r'\bh-(\d+(?:\.\d+)?|px)\b')
W_RE = re.compile(r'\bw-(\d+(?:\.\d+)?|px|full|fit)\b')

# dir/filename slug -> component vocab slug (aligns with pad_ratios)
TYPE_MAP = {
    'button': 'button-primary', 'buttons': 'button-primary',
    'input': 'input', 'inputs': 'input',
    'select': 'select', 'native-select': 'select',
    'textarea': 'textarea', 'checkbox': 'checkbox-radio-row',
    'checkboxes': 'checkbox-radio-row', 'radio': 'checkbox-radio-row',
    'card': 'card', 'cards': 'card', 'pricing-cards': 'pricing',
    'badge': 'chip', 'badges': 'chip', 'kbd': 'chip', 'tags': 'chip',
    'chip': 'chip', 'alert': 'toast', 'alerts': 'toast',
    'toast': 'toast', 'modal': 'modal', 'dialog': 'modal',
    'alert-dialog': 'modal', 'drawer': 'modal', 'popover': 'dropdown',
    'dropdown': 'dropdown', 'dropdowns': 'dropdown',
    'menu': 'dropdown', 'navigation-menu': 'nav-item',
    'navbar': 'nav-item', 'header': 'nav-item', 'headers': 'nav-item',
    'footer': 'footer-column', 'footers': 'footer-column',
    'tabs': 'tab', 'accordion': 'accordion-row',
    'accordions': 'accordion-row', 'table': 'table-cell',
    'tables': 'table-cell', 'pagination': 'nav-item',
    'breadcrumb': 'nav-item', 'breadcrumbs': 'nav-item',
    'form': 'form-panel', 'forms': 'form-panel',
    'login-form': 'form-panel', 'toggle': 'checkbox-radio-row',
    'switch': 'checkbox-radio-row', 'slider': 'input',
    'sidebar': 'nav-item', 'calendar': 'card',
    'empty': 'section', 'progress': 'chip',
    'ctas': 'call-to-action', 'hero': 'hero-block', 'heroes': 'hero-block',
    'banners': 'banner', 'sections': 'section', 'faqs': 'faq',
    'testimonials': 'testimonial-card', 'stats': 'stat-block',
    'features': 'feature-tile', 'grid': 'card-grid',
    'steps': 'sequence-steps', 'timeline': 'sequence-steps',
    'blog-cards': 'card', 'product-cards': 'card',
    'newsletter': 'form-panel', 'sign-in': 'form-panel',
    'sign-up': 'form-panel', 'contact': 'form-panel',
}


def cls_type(rel, kit):
    parts = rel.replace('.dark.html', '').replace('.html', '').split(os.sep)
    for part in reversed(parts):
        for key, t in TYPE_MAP.items():
            if key in part:
                return t
    return 'section'


def pads_of(cls):
    """tailwind class string -> (pad_x_px, pad_y_px) or None."""
    pv = ph = None
    for m in PAD_RE.finditer(cls):
        axis, arb, num = m.groups()
        val = float(arb) if arb else UNIT.get(num)
        if val is None:
            continue
        if axis == 'x':
            ph = val
        elif axis == 'y':
            pv = val
        elif axis == 't' or axis == 'b':
            pv = max(pv or 0, val)
        elif axis == 'l' or axis == 'r':
            ph = max(ph or 0, val)
        else:
            ph = pv = val
    if ph is None and pv is None:
        return None
    return (ph or 0.0), (pv or 0.0)


def scan():
    rows = []
    for root, _, files in os.walk(SKEL):
        for fn in files:
            if not fn.endswith('.html') or fn.endswith('.dark.html'):
                continue
            kit = 'shadcn' if 'shadcn' in root else 'hyperui'
            rel = os.path.relpath(os.path.join(root, fn), SKEL)
            ctype = cls_type(rel, kit)
            html = open(os.path.join(root, fn)).read()
            for m in re.finditer(r'class="([^"]+)"', html):
                cls = m.group(1)
                pads = pads_of(cls)
                if not pads or not pads[0]:
                    continue
                rows.append({'type': ctype,
                             'pad_h': round(pads[0], 1),
                             'pad_v': round(pads[1], 1),
                             'src': f'skeleton:{rel}',
                             'source_pool': f'skeleton:{kit}'})
    return rows


if __name__ == '__main__':
    json.dump(scan(), sys.stdout, indent=1)
