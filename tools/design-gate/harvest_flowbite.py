#!/usr/bin/env python3
"""Harvest Flowbite FREE docs components from the public GitHub markdown
(themesberg/flowbite content/*.md). Each {{< example >}} block becomes
templates/skeletons/flowbite/<category>/<slug>.html + .spec.json.
Charts/datatables embed ApexCharts options in a javascript=`...` attribute;
that lands as <slug>.js and is flagged in the spec (needs the flowbite.js
bundle + ApexCharts — not standalone). Dark mode is class-based.
Polite: 1.5s between fetches. Idempotent overwrite.
"""
import json
import os
import re
import time
import urllib.request

UA = ('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
      'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36')
RAW = 'https://raw.githubusercontent.com/themesberg/flowbite/main/content/'
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.normpath(os.path.join(
    HERE, '..', '..', 'templates', 'skeletons', 'flowbite'))
RATE = 1.5

PRIORITY = [
    ('plugins', 'charts'), ('plugins', 'datatables'),
    ('forms', 'input-field'), ('forms', 'select'), ('forms', 'checkbox'),
    ('forms', 'radio'), ('forms', 'textarea'), ('forms', 'file-input'),
    ('forms', 'toggle'), ('forms', 'search-input'), ('forms', 'range'),
    ('forms', 'number-input'), ('forms', 'floating-label'),
    ('components', 'tables'), ('components', 'navbar'),
    ('components', 'sidebar'), ('components', 'drawer'),
    ('components', 'modal'), ('components', 'popover'),
    ('components', 'toast'), ('components', 'alerts'),
    ('components', 'badge'), ('components', 'avatar'),
    ('components', 'pagination'), ('components', 'breadcrumb'),
    ('components', 'tabs'), ('components', 'accordion'),
    ('components', 'timeline'), ('components', 'skeleton'),
    ('components', 'spinner'), ('components', 'speed-dial'),
    ('components', 'dropdowns'), ('components', 'progress'),
    ('components', 'banner'), ('components', 'stepper'),
    ('components', 'list-group'), ('components', 'mega-menu'),
    ('components', 'bottom-navigation'), ('components', 'indicators'),
    ('components', 'kbd'), ('components', 'rating'),
    ('components', 'clipboard'), ('components', 'chat-bubble'),
    ('components', 'card'), ('components', 'buttons'),
    ('components', 'button-group'), ('components', 'footer'),
    ('components', 'gallery'), ('components', 'carousel'),
    ('components', 'jumbotron'), ('forms', 'phone-input'),
    ('forms', 'timepicker'), ('plugins', 'datepicker'),
]
JS_BUNDLE = {'charts', 'datatables', 'datepicker', 'wysiwyg'}


def slugify(t):
    return re.sub(r'[^a-z0-9]+', '-', t.lower()).strip('-')[:70]


def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=45) as r:
        time.sleep(RATE)
        return r.read().decode('utf-8', 'replace')


def examples(md):
    """Yield (heading, html, show_dark, js). Opening tags span lines and
    embed a javascript=`...` block that itself contains '>'."""
    heading = 'example'
    pos = 0
    while True:
        start = md.find('{{< example', pos)
        if start < 0:
            break
        open_end = md.find('>}}', start)
        close = md.find('{{< /example', open_end if open_end > 0 else start)
        if open_end < 0 or close < 0:
            break
        heads = re.findall(r'^##\s+(.+)$', md[pos:start], re.M)
        if heads:
            heading = heads[-1].strip()
        tag = md[start:open_end]
        js = None
        jm = re.search(r'javascript=`(.*)`\s*$', tag, re.S)
        if jm:
            js = jm.group(1).strip()
        html = md[open_end + 3:close].strip()
        end = md.find('>}}', close)
        pos = (end + 3) if end > 0 else close + 12
        if html:
            yield heading, html, 'show_dark=true' in tag, js


def main():
    os.makedirs(OUT, exist_ok=True)
    n = 0
    for group, name in PRIORITY:
        url = f'{RAW}{group}/{name}.md'
        try:
            md = fetch(url)
        except Exception as ex:
            print(f'{group}/{name}: {ex}', flush=True)
            continue
        cdir = os.path.join(OUT, name)
        os.makedirs(cdir, exist_ok=True)
        seen = {}
        for heading, html, dark, js in examples(md):
            base = slugify(heading) or 'example'
            seen[base] = seen.get(base, 0) + 1
            slug = base if seen[base] == 1 else f'{base}-{seen[base]}'
            open(os.path.join(cdir, slug + '.html'), 'w').write(html + '\n')
            if js:
                open(os.path.join(cdir, slug + '.js'), 'w').write(js + '\n')
            dep = None
            if name in JS_BUNDLE:
                dep = ('flowbite.js + ApexCharts (charts) or Simple-DataTables '
                       '(datatables) — not standalone; markup is the shell, '
                       'options live in the sibling .js')
            json.dump({
                'name': heading, 'category': name, 'group': group,
                'source_url': f'https://flowbite.com/docs/{group}/{name}/',
                'source_md': url, 'format': 'html',
                'dark_mode': 'class-based (dark: variants)' if dark else 'none',
                'framework': 'tailwind', 'licence': 'MIT',
                'js_dependency': dep, 'has_js': bool(js)},
                open(os.path.join(cdir, slug + '.spec.json'), 'w'), indent=1)
            n += 1
        print(f'{group}/{name}: {sum(seen.values())} variants', flush=True)
    print(f'DONE {n} flowbite variants', flush=True)


if __name__ == '__main__':
    main()
