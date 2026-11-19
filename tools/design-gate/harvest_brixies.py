#!/usr/bin/env python3
"""Brixies REST harvest (topology tier, like HyperUI).
Enumerates categories -> search?framework=ACSS&category=X (paginated)
-> /json/{id} per item -> templates/skeletons/brixies/<cat>/<slug>.json
(raw /json payload incl. bricksCopiedElements content tree) + spec.json
{item meta}. Also writes templates/skeletons/brixies/index.json.
Polite: ~1 req / 0.8s, retries 429/5xx, UA required (LiteSpeed 403s curl).
"""
import json
import os
import re
import sys
import time
import urllib.request
import urllib.parse
import urllib.error

BASE = 'https://brixies.co/wp-json/brixies/v1'
KEY = os.environ['BRIXIES_KEY']  # never hardcode; revoked keys 401
UA = ('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
      'AppleWebKit/537.36 (KHTML, like Gecko) '
      'Chrome/131.0.0.0 Safari/537.36')
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
OUT = os.path.join(ROOT, 'templates', 'skeletons', 'brixies')
RATE = 0.8


def slugify(t):
    return re.sub(r'[^a-z0-9]+', '-', t.lower()).strip('-')[:80]


class KeyRevoked(Exception):
    pass


def get(path, params=None, tries=4):
    """Sequential fetch. 401 aborts the whole run (dead key — never
    hammer). 429/5xx retry with backoff."""
    url = BASE + path
    if params:
        url += '?' + urllib.parse.urlencode(params)
    for a in range(tries):
        try:
            req = urllib.request.Request(url, headers={
                'X-Brixies-Key': KEY, 'User-Agent': UA})
            with urllib.request.urlopen(req, timeout=45) as r:
                time.sleep(RATE)
                return json.loads(r.read())
        except urllib.error.HTTPError as e:
            if e.code == 401:
                raise KeyRevoked(url)
            if e.code == 429 or e.code >= 500:
                time.sleep(4 * (a + 1))
                continue
            print(f'  HTTP {e.code} {url}', flush=True)
            return None
        except Exception as ex:
            print(f'  err {ex} {url}', flush=True)
            time.sleep(2)
    return None


BATCH = 8             # serialised: small batches, pause between
BATCH_PAUSE = 6.0     # seconds between batches


def fetch_batch(jobs):
    """Run up to BATCH fetches, then pause. jobs: [(path, params)]."""
    out = []
    for i in range(0, len(jobs), BATCH):
        chunk = jobs[i:i + BATCH]
        for path, params in chunk:
            out.append(get(path, params))
        if i + BATCH < len(jobs):
            print(f'  batch {i // BATCH + 1} done, pausing', flush=True)
            time.sleep(BATCH_PAUSE)
    return out


def main():
    os.makedirs(OUT, exist_ok=True)
    try:
        cats = get('/categories')
    except KeyRevoked:
        print('ABORT: key 401 on /categories — not hammering', flush=True)
        return
    print(f'{len(cats)} categories', flush=True)
    # pass 1: count (search pages only, no /json pulls)
    catalog = {}
    try:
        for cat in cats:
            items, page = [], 1
            while True:
                d = get('/search', {'framework': 'ACSS',
                                    'category': cat, 'page': page})
                if not d or not d.get('items'):
                    break
                items += [it for it in d['items']
                          if it['framework'] == 'ACSS']
                if page >= d.get('pages', 1):
                    break
                page += 1
            catalog[cat] = items
            print(f'  count {cat}: {len(items)}', flush=True)
    except KeyRevoked as e:
        print(f'ABORT: key 401 during count ({e})', flush=True)
        return
    total = sum(len(v) for v in catalog.values())
    print(f'COUNT total {total} ACSS items across {len(cats)} cats',
          flush=True)
    # pass 2: pull /json in batches, skip files already on disk
    n_new = 0
    try:
        for cat, items in catalog.items():
            cdir = os.path.join(OUT, slugify(cat))
            os.makedirs(cdir, exist_ok=True)
            pending = []
            for it in items:
                slug = slugify(it.get('block_name') or it['title'])
                if os.path.exists(os.path.join(cdir, slug + '.json')):
                    continue
                pending.append(it)
            for i in range(0, len(pending), BATCH):
                for it in pending[i:i + BATCH]:
                    slug = slugify(it.get('block_name') or it['title'])
                    doc = get('/json/' + str(it['id']))
                    if not doc:
                        continue
                    json.dump(doc, open(os.path.join(
                        cdir, slug + '.json'), 'w'), indent=1)
                    json.dump({
                        'id': it['id'], 'title': it['title'],
                        'type': it.get('type'),
                        'category': it.get('category'),
                        'elements': it.get('elements'),
                        'style_tags': it.get('visual_style'),
                        'use_case': it.get('use_cases'),
                        'framework': it.get('framework'),
                        'complexity': it.get('complexity'),
                        'plugins': it.get('plugins'),
                        'brixies_url': it.get('brixies_url'),
                        'featured_image': it.get('featured_image'),
                        'short_description': it.get('short_description')},
                        open(os.path.join(cdir, slug + '.spec.json'), 'w'),
                        indent=1)
                    n_new += 1
                if i + BATCH < len(pending):
                    time.sleep(BATCH_PAUSE)
            print(f'{cat}: {len(items)} items, {len(pending)} fetched',
                  flush=True)
    except KeyRevoked as e:
        print(f'ABORT: key 401 mid-pull ({e}); {n_new} saved, '
              f'resume-safe', flush=True)
    index = {c: sorted({it['id'] for it in v})
             for c, v in catalog.items()}
    json.dump({'fetched_at': time.strftime('%Y-%m-%dT%H:%M:%SZ',
                                           time.gmtime()),
               'framework': 'ACSS', 'total_items': total,
               'categories': index},
              open(os.path.join(OUT, 'index.json'), 'w'), indent=1)
    print(f'DONE {n_new} new, {total} catalogued', flush=True)


if __name__ == '__main__':
    main()
