#!/usr/bin/env python3
"""Harvest Preline FREE docs components. Markup lives in hidden
textareas id='*-html-markup' on https://preline.co/docs/components/*.html
(sitemap). templates/skeletons/preline/<component>/<slug>.html + .spec.json.
Docs components are the free tier; pro templates are not in this path.
Polite: 1.5s between pages. Idempotent overwrite.
"""
import json
import os
import re
import time
import urllib.request
from html import unescape

UA = ('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
      'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36')
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.normpath(os.path.join(
    HERE, '..', '..', 'templates', 'skeletons', 'preline'))
RATE = 1.5


def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=45) as r:
        time.sleep(RATE)
        return r.read().decode('utf-8', 'replace')


def variants(html):
    for m in re.finditer(
            r'<textarea id="([a-z0-9-]+)-html-markup"[^>]*>\s*(.*?)\s*</textarea>',
            html, re.S):
        slug = m.group(1)
        slug = re.sub(r'-tab$', '', slug)
        body = unescape(m.group(2)).strip()
        if body and '<div' in body or '<button' in body or '<input' in body:
            yield slug, body


def main():
    os.makedirs(OUT, exist_ok=True)
    sm = fetch('https://preline.co/sitemap.xml')
    urls = sorted(set(re.findall(
        r'https://preline.co/docs/components/[a-z0-9-]+\.html', sm)))
    print(f'{len(urls)} component pages', flush=True)
    n = 0
    for url in urls:
        name = url.rsplit('/', 1)[-1].replace('.html', '')
        try:
            page = fetch(url)
        except Exception as ex:
            print(f'{name}: {ex}', flush=True)
            continue
        found = list(variants(page))
        if not found:
            print(f'{name}: no markup (pro-gated or empty)', flush=True)
            continue
        cdir = os.path.join(OUT, name)
        os.makedirs(cdir, exist_ok=True)
        for slug, body in found:
            open(os.path.join(cdir, slug + '.html'), 'w').write(body + '\n')
            json.dump({
                'name': slug, 'category': name,
                'source_url': url, 'format': 'html',
                'framework': 'tailwind', 'licence': 'free-docs',
                'js_dependency': 'preline.js for interactive variants',
                'dark_mode': 'class-based (dark: variants) where present'},
                open(os.path.join(cdir, slug + '.spec.json'), 'w'), indent=1)
            n += 1
        print(f'{name}: {len(found)} variants', flush=True)
    print(f'DONE {n} preline variants', flush=True)


if __name__ == '__main__':
    main()
