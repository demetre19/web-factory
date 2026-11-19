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
RATE = 8.0  # ~450/hr, rides just under the measured ~434 ceiling



def slugify(t):
    return re.sub(r'[^a-z0-9]+', '-', t.lower()).strip('-')[:80]


class KeyRevoked(Exception):
    pass


def get(path, params=None, tries=30):
    """Sequential fetch, paced under the 300 req/hour account cap.
    401 aborts the run (dead key — never hammer). 429 waits minutes
    and retries; the cap resets on a rolling hour."""
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
                # rolling-hour cap: 180s x 30 = up to 90min, outlasts the window
                wait = 180 if e.code == 429 else 4 * (a + 1)
                print(f'  HTTP {e.code}, retry {a + 1}/{tries} in {wait}s',
                      flush=True)
                time.sleep(wait)
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


PRIORITY = ['Feature Sections', 'Cards', 'Hero Sections',
            'Content Sections', 'FAQ Sections', 'Testimonial Sections',
            'Pricing Sections', 'Contact Sections', 'Gallery Sections',
            'Process Sections', 'Timeline Sections', 'Team Sections',
            'Logo Sections', 'Forms', 'Headers', 'Footers', 'Sliders',
            'Tables', 'Counters', 'Social Proofs']


def main():
    os.makedirs(OUT, exist_ok=True)
    try:
        cats = get('/categories')
    except KeyRevoked:
        print('ABORT: key 401 on /categories — not hammering', flush=True)
        return
    if not cats:
        print('ABORT: /categories returned nothing', flush=True)
        return
    # priority categories first, then the remainder
    ordered = [c for c in PRIORITY if c in cats]
    ordered += [c for c in cats if c not in ordered]
    print(f'{len(cats)} categories, priority-ordered', flush=True)
    # harvest-direct: paginate search, pull /json for each id at once
    n_new = 0
    catalog = {}
    try:
        for cat in ordered:
            cdir = os.path.join(OUT, slugify(cat))
            os.makedirs(cdir, exist_ok=True)
            got, page = 0, 1
            while True:
                d = get('/search', {'framework': 'ACSS',
                                    'category': cat, 'page': page})
                if not d or not d.get('items'):
                    break
                for it in d['items']:
                    if it.get('framework') != 'ACSS':
                        continue
                    slug = slugify(it.get('block_name') or it['title'])
                    raw_p = os.path.join(cdir, slug + '.json')
                    if os.path.exists(raw_p):
                        got += 1
                        continue
                    doc = get('/json/' + str(it['id']))
                    if not doc:
                        continue
                    json.dump(doc, open(raw_p, 'w'), indent=1)
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
                    got += 1
                if page >= d.get('pages', 1):
                    break
                page += 1
            catalog[cat] = got
            print(f'{cat}: {got} items ({n_new} new total)', flush=True)
    except KeyRevoked as e:
        print(f'ABORT: key 401 ({e}); {n_new} saved, resume-safe',
              flush=True)
    json.dump({'fetched_at': time.strftime('%Y-%m-%dT%H:%M:%SZ',
                                           time.gmtime()),
               'framework': 'ACSS', 'categories': catalog},
              open(os.path.join(OUT, 'index.json'), 'w'), indent=1)
    print(f'DONE {n_new} new this run', flush=True)


if __name__ == '__main__':
    main()
