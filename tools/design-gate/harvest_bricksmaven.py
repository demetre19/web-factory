#!/usr/bin/env python3
"""harvest_bricksmaven.py — alpha-library ACSS-JSON harvest.

Mechanism (verified): logged-in cards carry the full
bricksCopiedElements payload inline in the Copy-ACSS button's
data-value attribute. No AJAX, no per-item calls — GET each
category page + _pagination pages, regex the payload out, unescape,
bank.

  login:  wp-login.php POST (SECRETS/Bricksmaven creds) → cookie jar
  fetch:  /alpha-library/?_section_filters=<slug>&_pagination=<n>
  out:    templates/skeletons/bricksmaven/<cat>/<label-slug>.json
          + index.json  (label, category, file, n_elements,
          n_globalClasses, root tag)

Usage: harvest_bricksmaven.py [categories...]   (default: all)
"""
import html
import json
import os
import re
import sys
import time
import urllib.request
import urllib.parse
import http.cookiejar

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(HERE))
OUT = os.path.join(REPO, 'templates', 'skeletons', 'bricksmaven')
JAR = os.path.join(HERE, '.bm-cookies.txt')
CREDS = os.path.join(REPO, '..', 'SECRETS', 'Bricksmaven',
                     'bricks maven logins.txt')

UA = ('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
      'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36')

# the 55 category slugs from the facet list
CATEGORIES = '''404-error author-page banner blog-archive blog-section
blog-single-page call-to-action career cart category-section checkout
coming-soon comparison contact content counter empty-cart event-section
event-single-page feature footer gallery grids-and-cards
header-page-sections headers hero how-it-works linktree login
logo-sections megamenu my-account-page newsletter off-canvas
order-receipt pay portfolio-section portfolio-single-page pricing
product-archive product-section product-single shop-footers
shop-headers shop-hero table table-of-content teams testimonials
thank-you-page timeline ui-elements'''.split()

DATA_RX = re.compile(r'data-value="((?:[^"\\]|\\.)*)"')
LABEL_RX = re.compile(r'[^a-z0-9]+')


def _slabel(label):
    return LABEL_RX.sub('-', str(label).lower()).strip('-') or 'item'


def _opener():
    cj = http.cookiejar.MozillaCookieJar(JAR)
    if os.path.exists(JAR):
        try:
            cj.load(ignore_discard=True, ignore_expires=True)
        except Exception:
            pass
    op = urllib.request.build_opener(
        urllib.request.HTTPCookieProcessor(cj))
    op.addheaders = [('User-Agent', UA)]
    return op, cj


def login(op, cj):
    creds = open(os.path.expanduser(CREDS)).read()
    user = re.search(r'(\S+@\S+)', creds).group(1)
    pwd = creds.split('pass')[1].strip()
    body = urllib.parse.urlencode({
        'log': user, 'pwd': pwd, 'wp-submit': 'Log In',
        'redirect_to': 'https://www.bricksmaven.com/alpha-library/',
        'testcookie': '1'}).encode()
    op.open(urllib.request.Request(
        'https://www.bricksmaven.com/wp-login.php', data=body),
        timeout=30).read()
    cj.save(ignore_discard=True, ignore_expires=True)
    return any('logged_in' in c.name for c in cj)


def fetch(op, cat, page, tries=4):
    q = f'_section_filters={cat}&_pagination={page}'
    url = f'https://www.bricksmaven.com/alpha-library/?{q}'
    for t in range(tries):
        try:
            return op.open(url, timeout=40).read() \
                .decode('utf-8', 'replace')
        except Exception as e:
            if t == tries - 1:
                raise
            time.sleep(2 + t * 3)
    return ''


def payloads(doc):
    out = []
    for v in DATA_RX.findall(doc):
        if len(v) < 1000:
            continue
        try:
            out.append(json.loads(html.unescape(v)))
        except Exception:
            continue
    return out


def harvest(cats):
    op, cj = _opener()
    if not any('logged_in' in c.name for c in cj):
        ok = login(op, cj)
        print('login:', 'ok' if ok else 'FAILED')
        if not ok:
            return
    idx = []
    seen = set()
    for cat in cats:
        catdir = os.path.join(OUT, cat)
        os.makedirs(catdir, exist_ok=True)
        # resume: banked files count as seen so a timed-out run
        # continues where it stopped instead of re-fetching.
        for fn0 in os.listdir(catdir):
            if fn0.endswith('.json') and fn0 != 'index.json':
                seen.add((cat, fn0[:-5]))
        n_cat = 0
        page = 1
        while page <= 10:                        # hard cap; cats ≤ ~3
            doc = fetch(op, cat, page)
            items = payloads(doc)
            if not items:
                break
            new = 0
            for d in items:
                root0 = (d.get('content') or [{}])[0]
                label = root0.get('label')
                # unlabelled roots all share 'item.json' and collide —
                # fall back to the element id so none are dropped.
                fn = f'{_slabel(label)}.json' if label \
                    else f'item-{root0.get("id") or "x"}.json'
                key = (cat, fn[:-5])
                if key in seen:
                    continue
                seen.add(key)
                _write(os.path.join(catdir, fn),
                       json.dumps(d, indent=1))
                idx.append({
                    'label': label, 'category': cat, 'file':
                    f'{cat}/{fn}',
                    'n_elements': len(d.get('content') or []),
                    'n_global_classes':
                        len(d.get('globalClasses') or []),
                    'root_tag': ((d.get('content') or [{}])[0]
                                 .get('name')),
                    'version': d.get('version')})
                new += 1
                n_cat += 1
            page += 1
            if new == 0:                         # dup page — done
                break
            time.sleep(0.3)
        print(f'{cat}: {n_cat} new '
              f'({sum(1 for s in seen if s[0] == cat)} banked)')
    # index = fresh scan of everything banked, not just this run
    idx = []
    for cat in sorted(os.listdir(OUT)):
        cd = os.path.join(OUT, cat)
        if not os.path.isdir(cd):
            continue
        for fn in sorted(os.listdir(cd)):
            if not fn.endswith('.json') or fn == 'index.json' \
                    or fn.endswith('.topo.json'):
                continue
            try:
                d = json.load(open(os.path.join(cd, fn)))
                idx.append({'label': (d.get('content') or [{}])[0]
                            .get('label'), 'category': cat,
                            'file': f'{cat}/{fn}',
                            'n_elements': len(d.get('content') or []),
                            'n_global_classes':
                                len(d.get('globalClasses') or []),
                            'root_tag': ((d.get('content') or [{}])[0]
                                         .get('name'))})
            except Exception:
                pass
    _write(os.path.join(OUT, 'index.json'), json.dumps(
        {'schema': 'bricksmaven-index@1', 'count': len(idx),
         'rows': idx}, indent=1))
    print(f'TOTAL {len(idx)} payloads → {OUT}')


def _write(path, text):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as fh:
        fh.write(text)


if __name__ == '__main__':
    cats = [a for a in sys.argv[1:] if not a.startswith('-')]
    harvest(cats or CATEGORIES)
