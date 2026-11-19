#!/usr/bin/env python3
"""Build a prioritized ingest list from details-so.json for
`ingest_good.py --list`. Dedupes by visit URL; entries keep all their
exemplar tags + mp4 (motion evidence) in 'rationale'/'tags'.
Usage: build_details_ingest.py [out.json] [--limit N] [--priority-only]
"""
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
OP = os.path.join(ROOT, 'docs', 'machinery', 'design', 'patterns',
                  'data', 'operator')
SRC = os.path.join(OP, '_sources', 'details-so.json')
OUT = os.path.join(OP, '_sources', 'details-so-ingest.json')

# operator priority order (lower = earlier)
PRIORITY = {
    'hero': 0, 'navigation': 1, 'drawer': 1, 'dropdown': 1,
    'fullscreen': 1, 'footer': 2, 'saas': 3, 'features': 4,
    'services': 4, 'about': 5, 'cta': 6, 'newsletter': 6,
    'pricing': 7,
}
MOTION = {
    'scroll-animations', 'parallax', 'pinned-scroll', 'stacked-scroll',
    'horizontal-scroll', 'hover-animations', 'morphing',
    'cursor-interaction', 'page-transition', 'section-transition',
    'contextual-transition', 'organic', '3d',
}


def rank(entries):
    """Min priority across all tags of the URL's entries."""
    r = 50
    for e in entries:
        for t in e.get('tags') or []:
            r = min(r, PRIORITY.get(t, 50 if t not in MOTION else 30))
    return r


def main():
    src = json.load(open(SRC))
    by_url = {}
    for e in src['sites']:
        if e.get('url'):
            by_url.setdefault(e['url'], []).append(e)
    groups = sorted(by_url.items(), key=lambda kv: rank(kv[1]))
    sites = []
    for url, es in groups:
        if '--priority-only' in sys.argv and rank(es) > 30:
            continue
        tags = sorted({t for e in es for t in (e.get('tags') or [])})
        names = sorted({e['name'] for e in es if e.get('name')})
        sites.append({
            'name': names[0] if names else url,
            'url': url,
            'rationale': ('details.so featured section(s): ' +
                          '; '.join(f"{t} ({e['detail_url']})"
                                    for e in es
                                    for t in [e.get('primary_tag')]
                                    if t)[:350]),
            'details_tags': tags,
            'details_entries': [e['detail_url'] for e in es],
            'details_videos': [e['video'] for e in es
                               if e.get('video')],
        })
    out = {'tier': 'operator-endorsed (details.so)',
           'source_url': 'https://www.details.so/inspo',
           'sites': sites}
    dst = (sys.argv[1] if len(sys.argv) > 1
           and not sys.argv[1].startswith('--') else OUT)
    if '--limit' in sys.argv:
        n = int(sys.argv[sys.argv.index('--limit') + 1])
        out['sites'] = out['sites'][:n]
    json.dump(out, open(dst, 'w'), indent=1)
    print(f'{len(out["sites"])} unique sites -> {dst} '
          f'(of {len(by_url)} urls, {len(src["sites"])} entries)')


if __name__ == '__main__':
    main()
