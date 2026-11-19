#!/usr/bin/env python3
"""Harvest ReUI free registry blocks for the categories we are weakest on.
Registry: https://reui.io/r/styles/base-nova/<name>.json (TSX).
templates/skeletons/reui/<category>/<slug>.tsx + .spec.json.
Priority categories only — not the full 1352. Polite 1.2s. Idempotent.
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
    HERE, '..', '..', 'templates', 'skeletons', 'reui'))
RATE = 1.2
PRIORITY = [
    'input', 'select', 'checkbox', 'radio-group', 'combobox', 'switch',
    'textarea', 'input-group', 'autocomplete', 'file-upload',
    'breadcrumb', 'pagination', 'tabs', 'stepper', 'dropdown-menu',
    'navigation-menu', 'sidebar',
    'alert', 'sonner', 'badge', 'empty', 'tooltip', 'progress', 'skeleton',
    'table', 'chart', 'avatar', 'card', 'data-grid', 'accordion',
    'alert-dialog', 'dialog', 'drawer', 'sheet', 'popover',
    'timeline', 'pricing', 'testimonial',
]


def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=45) as r:
        time.sleep(RATE)
        return r.read().decode('utf-8', 'replace')


def main():
    os.makedirs(OUT, exist_ok=True)
    sm = fetch('https://reui.io/sitemap.xml')
    n = 0
    for cat in PRIORITY:
        names = sorted(set(re.findall(
            rf'https://reui.io/components/{cat}/(c-{cat}-[0-9]+)', sm)))
        if not names:
            print(f'{cat}: no variants in sitemap', flush=True)
            continue
        cdir = os.path.join(OUT, cat)
        os.makedirs(cdir, exist_ok=True)
        got = 0
        for name in names:
            dest = os.path.join(cdir, name + '.tsx')
            if os.path.exists(dest):
                got += 1
                continue
            url = f'https://reui.io/r/styles/base-nova/{name}.json'
            try:
                doc = json.loads(fetch(url))
            except Exception as ex:
                print(f'  {name}: {ex}', flush=True)
                continue
            files = doc.get('files') or []
            if not files or not files[0].get('content'):
                continue
            open(dest, 'w').write(files[0]['content'])
            json.dump({
                'name': name, 'category': cat,
                'source_url': f'https://reui.io/components/{cat}/{name}',
                'registry_url': url, 'format': 'tsx',
                'framework': 'react',
                'dependencies': doc.get('dependencies'),
                'licence': 'free-registry'},
                open(os.path.join(cdir, name + '.spec.json'), 'w'), indent=1)
            got += 1
            n += 1
        print(f'{cat}: {got} variants', flush=True)
    print(f'DONE {n} new reui variants', flush=True)


if __name__ == '__main__':
    main()
