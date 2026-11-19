#!/usr/bin/env python3
"""Enrich bank rows with precomputed attrs — scale, element_sig,
themeable — so filter_rows costs nothing at query time. Writes
data/render_vectors/row_attrs.json keyed by render_path.

scale:     page|section|component — derived from markup structure.
           page = multi-region (nav+footer or 3+ top sections or
           full <html> doc); component = small fragment; else section.
element_sig: canonical media classes (image/icon/number/avatar/
           logo/video/chart) from markup tokens — same vocabulary as
           gate.MEDIA_CLASS_RX, source-agnostic (HTML or brixies JSON).
themeable: 0..1 — fraction of color-ish classes that resolve via
           semantic tokens (bg-brand, text-heading, bg-neutral-*)
           vs hardcoded palette (bg-slate-*, text-gray-*, hex).
           Hardcoded-heavy rows can't be rethemed by vars.
"""
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
PATTERNS = os.path.join(ROOT, 'docs', 'machinery', 'design', 'patterns')
DATA = os.path.join(PATTERNS, 'data')
VECTORS = os.path.join(DATA, 'render_vectors')
SKELETONS = os.path.join(ROOT, 'templates', 'skeletons')

sys.path.insert(0, HERE)
import adapt  # noqa: E402

MEDIA_RX = {
    'image': re.compile(r'image|photo|background|figure|picture'
                        r'|\bimg\b', re.I),
    'icon': re.compile(r'\bicon', re.I),
    'number': re.compile(r'number|numeral|counter|stat\b|score',
                         re.I),
    'avatar': re.compile(r'avatar|author|person|team', re.I),
    'logo': re.compile(r'\blogo|brand|partner', re.I),
    'video': re.compile(r'video', re.I),
    'chart': re.compile(r'chart|graph\b|diagram|illustration',
                        re.I),
}

# semantic (themeable) vs hardcoded palette classes
SEM_RX = re.compile(
    r'\b(?:bg|text|border|ring|fill|stroke)-(?:'
    r'brand[a-z\-]*|heading|body|fg[a-z\-]*|neutral[a-z\-]*|'
    r'primary[a-z\-]*|secondary[a-z\-]*|surface[a-z\-]*|'
    r'accent[a-z\-]*|muted[a-z\-]*|default|subtle|softer|strong'
    r')\b')
HARD_RX = re.compile(
    r'\b(?:bg|text|border|ring|fill|stroke)-(?:'
    r'slate|gray|zinc|neutral(?!\w)|stone|red|orange|amber|yellow|'
    r'lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|'
    r'fuchsia|pink|rose|white|black|transparent'
    r')(?:-\d{2,3})?\b')
STYLE_HEX = re.compile(r'#[0-9a-fA-F]{3,8}\b')


def classify_scale(markup):
    """page|section|component from structure, not filename."""
    if re.search(r'<html\b', markup, re.I):
        return 'page'
    nav = len(re.findall(r'<nav\b', markup, re.I))
    foot = len(re.findall(r'<footer\b', markup, re.I))
    secs = len(re.findall(r'<section\b', markup, re.I))
    if (nav and foot) or secs >= 3:
        return 'page'
    if secs >= 2:
        return 'page'
    if secs == 1 or re.search(
            r'<header\b|<main\b|<footer\b|<nav\b', markup, re.I):
        return 'section'
    tags = len(re.findall(r'<[a-zA-Z][\w-]*\b', markup))
    return 'component' if tags < 40 else 'section'


def element_sig(markup):
    s = markup.lower()
    return sorted(k for k, rx in MEDIA_RX.items()
                  if rx.search(s))


def themeable(markup):
    """semantic-class share of color-ish classes; hex styles count
    as hardcoded."""
    sem = len(SEM_RX.findall(markup))
    hard = len(HARD_RX.findall(markup)) + \
        len(STYLE_HEX.findall(markup))
    if sem + hard == 0:
        return 1.0          # no color classes → neutral, themeable
    return round(sem / (sem + hard), 2)


def main():
    meta = json.load(open(os.path.join(VECTORS, 'index.json')))
    rows = meta['rows']
    out = {}
    n_done = n_skip = 0
    for rp, row in rows.items():
        p = adapt.payload_path(row)
        if not p or not os.path.exists(p):
            n_skip += 1
            continue
        try:
            if p.endswith('.html'):
                markup = open(p, errors='replace').read()
            elif p.endswith('.json'):
                markup = json.dumps(json.load(open(p)))
            else:
                n_skip += 1
                continue
        except Exception:
            n_skip += 1
            continue
        out[rp] = {
            'scale': classify_scale(markup),
            'element_sig': element_sig(markup),
            'themeable': themeable(markup)}
        n_done += 1
    dest = os.path.join(VECTORS, 'row_attrs.json')
    json.dump(out, open(dest, 'w'))
    print(f'wrote {n_done} attrs ({n_skip} skipped) -> {dest}')
    from collections import Counter
    print(Counter(v['scale'] for v in out.values()))
    print('themeable mean:',
          round(sum(v['themeable'] for v in out.values()) /
                max(len(out), 1), 2))


if __name__ == '__main__':
    main()
