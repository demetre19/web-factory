#!/usr/bin/env python3
"""Mobbin miner for the design pattern library.

Fetches search_sections results (metadata + inline webp previews) for a
fixed query plan into patterns/data/screens/. Token refresh is handled
once per run (access token TTL 1h); refreshes again only on auth error.
Paced: ~2s between calls. Another agent also hits Mobbin — be nice.

Usage:
  python3 mine.py plan              # print query plan
  python3 mine.py fetch [cell ...]  # fetch all (or named) cells, resumable
  python3 mine.py stats             # counts per query/cell
"""
import base64
import json
import os
import subprocess
import sys
import time
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.normpath(os.path.join(HERE, '..', 'data'))
SCREENS = os.path.join(DATA, 'screens')
OAUTH = os.path.expanduser('~/.mobbin-oauth')
URL = 'https://api.mobbin.com/mcp'

TASK_INTENT = ('Building a reusable library of proven website section '
               'design patterns, tagged by site type and section role.')
OUT_DEST = 'reference_library'
LIMIT = 30
PACE_S = 2.0

# Query plan: (cell_id, intended site_type, intended page_type, query)
# actual page type from image + metadata.
PLAN = [
    # ---- priority 1: services / local-service ----
    ('svc_home_hero',      'services', 'home',           'local service business website hero section with headline and call to action'),
    ('svc_home_hero2',     'services', 'home',           'cleaning company website hero section with quote form'),
    ('svc_home_proof',     'services', 'home',           'local service business website trust badges and reviews section'),
    ('svc_home_features',  'services', 'home',           'local service business website services grid section'),
    ('svc_home_process',   'services', 'home',           'service business website how it works steps section'),
    ('svc_home_cta',       'services', 'home',           'service business website call to action quote section'),
    ('svc_detail_hero',    'services', 'service-detail', 'service detail page hero section for local business'),
    ('svc_detail_pricing', 'services', 'service-detail', 'service page pricing or quote section for local business'),
    ('svc_detail_faq',     'services', 'service-detail', 'service business website FAQ accordion section'),
    ('svc_detail_proof',   'services', 'service-detail', 'service business website testimonials reviews section'),
    ('svc_detail_gallery', 'services', 'service-detail', 'cleaning service website before and after gallery section'),
    ('svc_home_areas',     'services', 'service-detail', 'service business website service areas locations section'),
    # ---- priority 2: saas ----
    ('saas_home_hero',     'saas',     'home',           'SaaS product website hero section'),
    ('saas_home_logos',    'saas',     'home',           'SaaS website customer logos section'),
    ('saas_home_features', 'saas',     'home',           'SaaS website product features section'),
    ('saas_home_proof',    'saas',     'home',           'SaaS website testimonials social proof section'),
    ('saas_home_cta',      'saas',     'home',           'SaaS website call to action signup section'),
    ('saas_pricing_main',  'saas',     'pricing',        'SaaS pricing page pricing tiers section'),
    ('saas_pricing_faq',   'saas',     'pricing',        'SaaS pricing page FAQ section'),
    ('saas_pricing_cmp',   'saas',     'pricing',        'SaaS pricing comparison table section'),
    # ---- priority 3: technology / dev-tools ----
    ('dev_home_hero',      'technology', 'home',         'developer tool website hero section'),
    ('dev_home_code',      'technology', 'home',         'developer tool website code example section'),
    ('dev_home_features',  'technology', 'home',         'developer tool website features section'),
    ('dev_home_proof',     'technology', 'home',         'developer tool website logos and stats section'),
    ('dev_home_docs',      'technology', 'home',         'developer tool website documentation link section'),
    # ---- breadth (1 query per cell, lighter) ----
    ('ecom_home_hero',     'ecommerce', 'home',          'ecommerce website hero section'),
    ('ecom_home_products', 'ecommerce', 'home',          'ecommerce website featured products section'),
    ('health_home_hero',   'healthcare', 'home',         'healthcare clinic website hero section'),
    ('health_services',    'healthcare', 'service-detail', 'healthcare website services section'),
    ('fin_home_hero',      'finance',   'home',          'fintech website hero section'),
    ('fin_home_proof',     'finance',   'home',          'fintech website security trust section'),
    ('edu_home_hero',      'education', 'home',          'online course platform hero section'),
    ('edu_pricing',        'education', 'pricing',       'online course website pricing section'),
    ('hosp_home_hero',     'hospitality', 'home',        'hotel restaurant website hero section'),
    ('agency_home_hero',   'agency-portfolio', 'home',   'design agency portfolio hero section'),
    ('agency_work',        'agency-portfolio', 'home',   'agency website case study portfolio section'),
    ('mkt_home_hero',      'marketplace', 'home',        'marketplace website hero section with search'),
    ('npo_home_hero',      'nonprofit', 'home',          'nonprofit charity website hero section'),
    ('npo_donate',         'nonprofit', 'home',          'nonprofit website donation call to action section'),
    # ---- priority 1b: ecommerce (PDP + PLP + checkout first) ----
    ('ecom_pdp_main',      'ecommerce', 'product',       'ecommerce product page buy section with price and add to cart'),
    ('ecom_pdp_gallery',   'ecommerce', 'product',       'ecommerce product page image gallery section'),
    ('ecom_pdp_reviews',   'ecommerce', 'product',       'ecommerce product page reviews section'),
    ('ecom_pdp_crosssell', 'ecommerce', 'product',       'ecommerce product page related products cross sell section'),
    ('ecom_pdp_trust',     'ecommerce', 'product',       'ecommerce product page shipping returns trust badges section'),
    ('ecom_plp_grid',      'ecommerce', 'category',      'ecommerce category page product grid section'),
    ('ecom_plp_filters',   'ecommerce', 'category',      'ecommerce category page filters and sort section'),
    ('ecom_checkout_main', 'ecommerce', 'checkout',      'ecommerce checkout page section'),
    ('ecom_cart',          'ecommerce', 'cart',          'ecommerce shopping cart page section'),
    ('ecom_search_results','ecommerce', 'search-results','ecommerce website search results product grid'),
    ('ecom_collection',    'ecommerce', 'landing',       'ecommerce collection landing page hero section'),
    # ---- priority 2b: portfolio (mobbin + web supplement) ----
    ('pf_home_hero',       'portfolio', 'home',          'creative portfolio website hero section'),
    ('pf_work_index',      'portfolio', 'work-index',    'portfolio website work grid section'),
    ('pf_case_study',      'portfolio', 'case-study',    'portfolio case study page hero section'),
    ('pf_about',           'portfolio', 'about',         'portfolio about page section'),
    ('pf_contact',         'portfolio', 'contact',       'portfolio website contact section'),
    # ---- remaining site types: baseline home + one key page ----
    ('mkt_listing',        'marketplace', 'listing',     'marketplace website listing card section'),
    ('hosp_menu',          'hospitality', 'service-detail', 'restaurant website menu section'),
    ('re_home_hero',       'real-estate', 'home',        'real estate website hero section with property search'),
    ('re_listing',         'real-estate', 'listing',     'real estate property listing detail section'),
    ('media_home',         'media',       'home',        'newsletter website hero section'),
    ('media_article',      'media',       'blog',        'news media website article section'),
    ('event_home',         'events',      'home',        'conference website hero section'),
    ('event_schedule',     'events',      'schedule',    'conference website schedule agenda section'),
    ('auto_home',          'automotive',  'home',        'car dealership automotive website hero section'),
    ('auto_listing',       'automotive',  'listing',     'car dealership vehicle listing section'),
    ('legal_home',         'legal',       'home',        'law firm website hero section'),
    ('legal_services',     'legal',       'service-detail', 'law firm practice areas section'),
    ('recruit_home',       'recruitment', 'home',        'recruitment careers website hero section'),
    ('recruit_jobs',       'recruitment', 'listing',     'jobs board listing section'),
    ('community_home',     'community',   'home',        'online community website hero section'),
    ('community_features', 'community',   'home',        'community platform features section'),
    ('coach_home',         'personal-brand', 'home',     'personal brand coach website hero section'),
    ('coach_services',     'personal-brand', 'service-detail', 'coach creator website services offer section'),
    ('gov_home',           'government',  'home',        'government civic website hero section'),
    ('gov_services',       'government',  'service-detail', 'government services directory section'),
    # ---- priority 4: fashion / luxury / jewellery / architecture / homes ----
    ('fash_home_hero',     'fashion',     'home',         'fashion brand website hero section'),
    ('fash_collection',    'fashion',     'collection',   'fashion brand collection page editorial section'),
    ('fash_lookbook',      'fashion',     'lookbook',     'fashion brand lookbook image gallery section'),
    ('lux_home_hero',      'luxury-goods','home',         'luxury brand website hero section'),
    ('lux_brand_story',    'luxury-goods','brand-story',  'luxury brand heritage craftsmanship story section'),
    ('lux_product',        'luxury-goods','product',      'luxury goods product page detail section'),
    ('jew_home_hero',      'jewellery',   'home',         'jewellery brand website hero section'),
    ('jew_product',        'jewellery',   'product',      'jewellery product page detail section'),
    ('jew_collection',     'jewellery',   'collection',   'jewellery collection page grid section'),
    ('arch_home_hero',     'architecture', 'home',        'architecture studio website hero section'),
    ('arch_project_index', 'architecture', 'project-index','architecture studio projects grid section'),
    ('arch_project',       'architecture', 'project-case-study', 'architecture project detail page section'),
    ('homes_home_hero',    'homes',       'home',         'home builder website hero section'),
    ('homes_project',      'homes',       'project-case-study', 'home builder project gallery section'),
    ('homes_floorplans',   'homes',       'floor-plans',  'home builder floor plans section'),
]

_token_cache = [None]


def token():
    subprocess.run([os.path.join(OAUTH, 'refresh.sh')],
                   check=True, capture_output=True)
    _token_cache[0] = json.load(
        open(os.path.join(OAUTH, 'tokens.json')))['access_token']
    return _token_cache[0]


def rpc(at, method, params=None, _id=1):
    body = {'jsonrpc': '2.0', 'id': _id, 'method': method}
    if params is not None:
        body['params'] = params
    req = urllib.request.Request(URL, data=json.dumps(body).encode(),
        headers={'Authorization': f'Bearer {at}',
                 'Content-Type': 'application/json',
                 'Accept': 'application/json, text/event-stream'})
    with urllib.request.urlopen(req, timeout=180) as r:
        raw = r.read().decode()
    for line in raw.splitlines():
        if line.startswith('data:'):
            return json.loads(line[5:].strip())
    return json.loads(raw)


def fetch_query(qid, site_type, page_type, query):
    """One search_sections call (page 1, limit 30). Returns (items, n_saved)."""
    outdir = os.path.join(SCREENS, qid)
    meta_path = os.path.join(outdir, f'{qid}.json')
    if os.path.exists(meta_path):
        return json.load(open(meta_path)), 0
    os.makedirs(outdir, exist_ok=True)
    at = _token_cache[0] or token()
    mcp_inited = getattr(fetch_query, '_init', False)
    args = {'query': query, 'limit': LIMIT, 'page': 1,
            'image_format': 'webp', 'task_intent': TASK_INTENT,
            'output_destination': OUT_DEST}
    if not mcp_inited:
        rpc(at, 'initialize', {'protocolVersion': '2025-03-26',
                               'capabilities': {},
                               'clientInfo': {'name': 'wf', 'version': '0.1'}})
        fetch_query._init = True
    try:
        r = rpc(at, 'tools/call', {'name': 'search_sections', 'arguments': args})
    except urllib.error.HTTPError as e:
        if e.code in (401, 403):
            token()  # rotate + retry once
            rpc(_token_cache[0], 'initialize',
                {'protocolVersion': '2025-03-26', 'capabilities': {},
                 'clientInfo': {'name': 'wf', 'version': '0.1'}})
            r = rpc(_token_cache[0], 'tools/call',
                    {'name': 'search_sections', 'arguments': args})
        else:
            raise
    res = r.get('result') or {}
    items, imgs = [], []
    for c in res.get('content', []):
        if c.get('type') == 'text':
            try:
                d = json.loads(c['text'])
                items += (d.get('sections') or d.get('screens') or
                          d.get('results') or [])
            except Exception:
                pass
        elif c.get('type') == 'image':
            imgs.append(c.get('data', ''))
    if not items and res.get('structuredContent'):
        sc = res['structuredContent']
        items = (sc.get('sections') or sc.get('screens') or
                 sc.get('results') or [])
    saved = 0
    for i, it in enumerate(items):
        it['cell_query'] = qid
        it['intended_site_type'] = site_type
        it['intended_page_type'] = page_type
        if i < len(imgs) and imgs[i]:
            p = os.path.join(outdir, f'{qid}-{i:02d}.webp')
            with open(p, 'wb') as f:
                f.write(base64.b64decode(imgs[i]))
            it['thumb'] = os.path.relpath(p, DATA)
            saved += 1
    with open(meta_path, 'w') as f:
        json.dump(items, f, indent=1)
    return items, saved


def main():
    if len(sys.argv) < 2 or sys.argv[1] == 'plan':
        for q in PLAN:
            print(f'{q[0]:22s} {q[1]:16s} {q[2]:15s} {q[3]}')
        return
    if sys.argv[1] == 'fetch':
        only = set(sys.argv[2:])
        token()
        total = 0
        for qid, st, pt, q in PLAN:
            if only and qid not in only:
                continue
            try:
                items, saved = fetch_query(qid, st, pt, q)
                total += len(items)
                print(f'{qid:22s} {len(items):3d} sections ({saved} imgs)',
                      flush=True)
            except Exception as e:
                print(f'{qid:22s} FAILED {e}', flush=True)
            time.sleep(PACE_S)
        print('total:', total)
        return
    if sys.argv[1] == 'stats':
        for qid, *_ in PLAN:
            p = os.path.join(SCREENS, qid, f'{qid}.json')
            if os.path.exists(p):
                print(f'{qid:22s} {len(json.load(open(p)))}')
        return
    print(__doc__)


if __name__ == '__main__':
    main()
