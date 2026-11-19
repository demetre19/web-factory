#!/usr/bin/env python3
"""Add the shadcn/ui chart family to templates/skeletons/shadcn/charts/.
Registry items are React/TSX on Recharts. spec.json notes the dependency
and that SVG render is possible but not a static markup path.
"""
import json
import os
import re
import time
import urllib.request

UA = ('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
      'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36')
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.normpath(os.path.join(
    HERE, '..', '..', 'templates', 'skeletons', 'shadcn', 'charts'))
RATE = 1.2
FAMILIES = ['area', 'bar', 'line', 'pie', 'radar', 'radial', 'tooltip']


def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=45) as r:
        time.sleep(RATE)
        return r.read().decode('utf-8', 'replace')


def main():
    os.makedirs(OUT, exist_ok=True)
    names = set()
    for fam in FAMILIES:
        page = fetch(f'https://ui.shadcn.com/charts/{fam}')
        found = set(re.findall(r'chart-' + fam + r'(?:-[a-z0-9]+)*', page))
        names |= found
        print(f'{fam}: {len(found)} names', flush=True)
    n = 0
    for name in sorted(names):
        url = f'https://ui.shadcn.com/r/styles/new-york/{name}.json'
        try:
            doc = json.loads(fetch(url))
        except Exception as ex:
            print(f'{name}: {ex}', flush=True)
            continue
        files = doc.get('files') or []
        if not files:
            continue
        tsx = files[0].get('content') or ''
        open(os.path.join(OUT, name + '.tsx'), 'w').write(tsx)
        json.dump({
            'name': name, 'category': 'charts',
            'source_url': f'https://ui.shadcn.com/charts',
            'registry_url': url, 'format': 'tsx',
            'framework': 'react',
            'dependencies': doc.get('dependencies'),
            'js_dependency': 'recharts@2.15.4 + the chart.tsx primitive',
            'renderable_to_svg': True,
            'static_note': ('Recharts renders to SVG at runtime. Not a static '
                            'markup path; converting to static SVG needs a '
                            'render step, not an HTML parser.'),
            'licence': 'MIT'},
            open(os.path.join(OUT, name + '.spec.json'), 'w'), indent=1)
        n += 1
    print(f'DONE {n} shadcn charts', flush=True)


if __name__ == '__main__':
    main()
