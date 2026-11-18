#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# dependencies = ["pillow", "numpy"]
# ///
"""Deterministic annotation pass: pixel features + query priors →
annotation records in the TAXONOMY schema.

This runs over every screenshot (fast, no model). A later VLM pass may
enrich semantic fields (quality_tier, serif, composition refinement) —
records are keyed by `image`, VLM output wins on conflict.

  uv run annotate_det.py mobbin      # data/annotations.jsonl
  uv run annotate_det.py negatives   # data/annotations_negatives.jsonl
"""
import json
import os
import sys
from concurrent.futures import ProcessPoolExecutor

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.normpath(os.path.join(HERE, '..', 'data'))
SCREENS = os.path.join(DATA, 'screens')
NEG = os.path.join(DATA, 'negatives')

# cell_query → (section_type, page_type) prior. The annotator trusts the
# query that retrieved the crop; pixel geometry refines composition.
CELL_MAP = {
    'svc_home_hero': ('hero', 'home'),
    'svc_home_hero2': ('hero', 'home'),
    'svc_home_proof': ('testimonials', 'home'),
    'svc_home_features': ('feature', 'home'),
    'svc_home_process': ('how-it-works', 'home'),
    'svc_home_cta': ('call-to-action', 'home'),
    'svc_detail_hero': ('hero', 'service-detail'),
    'svc_detail_pricing': ('pricing', 'service-detail'),
    'svc_detail_faq': ('faq', 'service-detail'),
    'svc_detail_proof': ('testimonials', 'service-detail'),
    'svc_detail_gallery': ('gallery', 'service-detail'),
    'svc_home_areas': ('content', 'service-detail'),
    'saas_home_hero': ('hero', 'home'),
    'saas_home_logos': ('logo-sections', 'home'),
    'saas_home_features': ('feature', 'home'),
    'saas_home_proof': ('testimonials', 'home'),
    'saas_home_cta': ('call-to-action', 'home'),
    'saas_pricing_main': ('pricing', 'pricing'),
    'saas_pricing_faq': ('faq', 'pricing'),
    'saas_pricing_cmp': ('comparison', 'pricing'),
    'dev_home_hero': ('hero', 'home'),
    'dev_home_code': ('feature', 'home'),
    'dev_home_features': ('feature', 'home'),
    'dev_home_proof': ('logo-sections', 'home'),
    'dev_home_docs': ('content', 'home'),
    'ecom_home_hero': ('hero', 'home'),
    'ecom_home_products': ('product-grid', 'home'),
    'health_home_hero': ('hero', 'home'),
    'health_services': ('feature', 'service-detail'),
    'fin_home_hero': ('hero', 'home'),
    'fin_home_proof': ('trust-badges', 'home'),
    'edu_home_hero': ('hero', 'home'),
    'edu_pricing': ('pricing', 'pricing'),
    'hosp_home_hero': ('hero', 'home'),
    'agency_home_hero': ('hero', 'home'),
    'agency_work': ('work-grid', 'home'),
    'mkt_home_hero': ('hero', 'home'),
    'npo_home_hero': ('hero', 'home'),
    'npo_donate': ('call-to-action', 'home'),
    'ecom_pdp_main': ('add-to-cart', 'product'),
    'ecom_pdp_gallery': ('gallery', 'product'),
    'ecom_pdp_reviews': ('reviews', 'product'),
    'ecom_pdp_crosssell': ('cross-sell', 'product'),
    'ecom_pdp_trust': ('trust-badges', 'product'),
    'ecom_plp_grid': ('product-grid', 'category'),
    'ecom_plp_filters': ('filters-sort', 'category'),
    'ecom_checkout_main': ('form', 'checkout'),
    'ecom_cart': ('mini-cart', 'cart'),
    'ecom_search_results': ('product-grid', 'search-results'),
    'ecom_collection': ('hero', 'collection'),
    'pf_home_hero': ('hero', 'home'),
    'pf_work_index': ('work-grid', 'work-index'),
    'pf_case_study': ('case-study', 'case-study'),
    'pf_about': ('content', 'about'),
    'pf_contact': ('contact', 'contact'),
    'mkt_listing': ('grids-and-cards', 'listing'),
    'hosp_menu': ('content', 'service-detail'),
    're_home_hero': ('hero', 'home'),
    're_listing': ('listing', 'listing'),
    'media_home': ('hero', 'home'),
    'media_article': ('content', 'blog'),
    'event_home': ('hero', 'home'),
    'event_schedule': ('schedule', 'schedule'),
    'auto_home': ('hero', 'home'),
    'auto_listing': ('listing', 'listing'),
    'legal_home': ('hero', 'home'),
    'legal_services': ('feature', 'service-detail'),
    'recruit_home': ('hero', 'home'),
    'recruit_jobs': ('listing', 'listing'),
    'community_home': ('hero', 'home'),
    'community_features': ('feature', 'home'),
    'coach_home': ('hero', 'home'),
    'coach_services': ('feature', 'service-detail'),
    'gov_home': ('hero', 'home'),
    'gov_services': ('grids-and-cards', 'service-detail'),
    # fashion / luxury / jewellery / architecture / homes
    'fash_home_hero': ('hero', 'home'),
    'fash_collection': ('content', 'collection'),
    'fash_lookbook': ('gallery', 'lookbook'),
    'lux_home_hero': ('hero', 'home'),
    'lux_brand_story': ('content', 'brand-story'),
    'lux_product': ('add-to-cart', 'product'),
    'jew_home_hero': ('hero', 'home'),
    'jew_product': ('add-to-cart', 'product'),
    'jew_collection': ('product-grid', 'collection'),
    'arch_home_hero': ('hero', 'home'),
    'arch_project_index': ('work-grid', 'project-index'),
    'arch_project': ('case-study', 'project-case-study'),
    'homes_home_hero': ('hero', 'home'),
    'homes_project': ('gallery', 'project-case-study'),
    'homes_floorplans': ('grids-and-cards', 'floor-plans'),
}

# SECTION-CATALOG §1 mapping
ACT = {
    'hero': 'promise', 'testimonials': 'proof', 'logo-sections': 'proof',
    'counter': 'proof', 'trust-badges': 'proof', 'reviews': 'proof',
    'feature': 'how', 'how-it-works': 'how', 'timeline': 'how',
    'comparison': 'objection', 'pricing': 'objection', 'faq': 'objection',
    'call-to-action': 'act', 'contact': 'act', 'form': 'act',
    'newsletter': 'act', 'donate': 'act', 'booking': 'act',
    'gallery': 'detail', 'grids-and-cards': 'detail', 'content': 'detail',
    'table': 'detail', 'product-grid': 'detail', 'product-card': 'detail',
    'cross-sell': 'detail', 'work-grid': 'detail', 'case-study': 'detail',
    'listing': 'detail', 'schedule': 'detail', 'floor-plan': 'detail',
    'project-grid': 'detail', 'lightbox-gallery': 'detail',
    'lookbook-spread': 'detail', 'awards': 'detail', 'search-bar': 'chrome',
    'headers': 'chrome', 'footer': 'chrome', 'mini-cart': 'chrome',
    'filters-sort': 'chrome', 'store-locator': 'detail',
    'configurator-panel': 'detail', 'price-variant': 'objection',
    'add-to-cart': 'act', 'shipping-returns': 'objection',
    'banner': 'promise', 'teams': 'detail',
}


def composition_from(feat, section):
    mr, cols, nb = feat['media_ratio'], feat['columns'], feat['block_count']
    if section in ('faq',):
        return 'faq'
    if section in ('pricing',):
        return 'cards-n' if cols >= 3 else 'table-matrix'
    if section in ('comparison',):
        return 'comparison'
    if section in ('logo-sections', 'trust-badges'):
        return 'logo-wall' if section == 'logo-sections' else 'badge-center'
    if section in ('testimonials', 'reviews'):
        return 'quote-grid' if cols >= 2 else 'proof-band'
    if section in ('how-it-works',):
        return 'sequence'
    if section in ('call-to-action', 'donate'):
        return 'full-bleed'
    if section in ('contact', 'form'):
        return 'form-panel'
    if section in ('newsletter',):
        return 'capture-form'
    if section in ('product-grid', 'work-grid', 'grids-and-cards',
                   'cross-sell', 'listing', 'project-grid'):
        return {1: 'cards-n', 2: 'card-grid-2', 3: 'card-grid-3',
                4: 'card-grid-4'}.get(cols, 'cards-n')
    if section in ('gallery', 'lightbox-gallery', 'lookbook-spread'):
        return 'media-gallery' if mr > 0.5 else 'carousel'
    if section in ('hero',):
        side = feat.get('media_side') or 'none'
        if mr > 0.72 and side == 'both':
            return 'immersive-media'
        if side in ('left', 'right') and mr > 0.15:
            return 'split-media'
        if mr > 0.45:
            return 'immersive-media'
        return 'stacked-hero'
    if section in ('feature',):
        if mr > 0.45:
            return 'split-media'
        return 'card-grid-2' if cols == 2 else 'editorial-single'
    if section in ('content', 'case-study'):
        return 'editorial-single'
    if section in ('schedule', 'table'):
        return 'table-matrix'
    return 'other'


def disclosure_from(section):
    return {'faq': 'folded', 'gallery': 'carousel',
            'lightbox-gallery': 'folded', 'lookbook-spread': 'carousel',
            'pricing': 'open', 'comparison': 'tabbed'}.get(section, 'open')


def heading_form_from(section):
    return {'faq': 'query'}.get(section, 'claim')


def proof_from(section, feat):
    if section in ('logo-sections',):
        return 'logos'
    if section in ('testimonials', 'reviews'):
        return 'testimonials'
    if section in ('trust-badges',):
        return 'certs'
    if section in ('counter',):
        return 'stats'
    if section in ('case-study', 'work-grid'):
        return 'case-study'
    return 'none'


def _work(item):
    path, meta = item
    sys.path.insert(0, HERE)
    from image_features import analyze
    try:
        feat = analyze(path)
    except Exception as e:
        return {'image': path, 'error': str(e),
                'cell_query': meta.get('cell_query')}
    if 'error' in feat:
        return {'image': path, 'error': feat['error'],
                'cell_query': meta.get('cell_query')}
    cq = meta.get('cell_query') or ''
    if cq.startswith('neg-'):
        section = meta.get('section_type') or 'other'
        page_type = meta.get('page_type') or 'other'
        site_type = meta.get('site_type') or 'other'
        label = 0
    else:
        section, page_type = CELL_MAP.get(cq, ('other', 'home'))
        site_type = meta.get('site_type') or 'other'
        label = 1
    return {
        'image': path,
        'mobbin_id': meta.get('mobbin_id'),
        'mobbin_url': meta.get('mobbin_url'),
        'site_name': meta.get('site_name'),
        'cell_query': cq,
        'source': meta.get('source', 'mobbin'),
        'label': label,
        'site_type': site_type,
        'page_type': page_type,
        'section_type': section,
        'speech_act': ACT.get(section, 'detail'),
        'composition': composition_from(feat, section),
        'surface': 'inverse' if feat['dark_surface'] else 'base',
        'density': 'regular',  # calibrated to corpus terciles by genome.py
        'ink_density': feat['ink_density'],
        'disclosure': disclosure_from(section),
        'nav_pattern': 'bar' if any(b['role'] == 'chrome-nav'
                                    for b in feat['blocks']) else 'none',
        'heading_form': heading_form_from(section),
        'mobile_evidence': feat['w'] < 500,
        'quality_tier': None,
        'columns': feat['columns'],
        'cta_count': 0,
        'cta_rank_primary': 'none',
        'heading_body_ratio': None,
        'whitespace_share': feat['whitespace_share'],
        'media_ratio': feat['media_ratio'],
        'media_type': 'photo' if feat['media_ratio'] > 0.1 else 'none',
        'serif_display': None,
        'radius_personality': None,
        'cinematic': feat['media_ratio'] > 0.8 and feat.get('media_side') == 'both',
        'media_side': feat.get('media_side', 'none'),
        'above_fold': section in ('hero', 'headers', 'search-bar'),
        'blocks': feat['blocks'],
        'ps': feat['ps'],
        'proof_type': proof_from(section, feat),
        'notable': '',
        'signature_move': '',
        'annotator': 'pixel-v1',
    }


def collect(mode):
    work = []
    if mode == 'mobbin':
        for qid in sorted(os.listdir(SCREENS)):
            mp = os.path.join(SCREENS, qid, f'{qid}.json')
            if not os.path.isfile(mp):
                continue
            for it in json.load(open(mp)):
                t = it.get('thumb')
                if not t:
                    continue
                work.append((os.path.join(DATA, t), {
                    'mobbin_id': it.get('id'),
                    'mobbin_url': it.get('mobbin_url'),
                    'site_name': it.get('site_name'),
                    'cell_query': qid,
                    'site_type': it.get('intended_site_type'),
                    'source': 'mobbin'}))
        return work, os.path.join(DATA, 'annotations.jsonl')
    # prefer the section-split negative corpus (like-for-like crops)
    neg_dir = os.path.join(DATA, 'negatives_sections')
    if not os.path.isdir(neg_dir):
        neg_dir = NEG
    if not os.path.isdir(neg_dir):
        return [], None
    for qdir in sorted(os.listdir(neg_dir)):
        mp = os.path.join(neg_dir, qdir, 'meta.json')
        if not os.path.isfile(mp):
            continue
        m = json.load(open(mp))
        if m.get('capture_status', 'ok') != 'ok':
            continue
        items = m.get('sections') or [
            {'file': t, 'role': 'main'} for t in m.get('tiles', [])]
        for i, it in enumerate(items):
            f = it['file'] if isinstance(it, dict) else it
            work.append((os.path.join(neg_dir, qdir, f), {
                'mobbin_id': f'neg-{qdir}-{i}',
                'mobbin_url': m.get('url'),
                'site_name': m.get('domain'),
                'cell_query': f'neg-{m.get("site_type", "other")}',
                'site_type': m.get('site_type'),
                'page_type': m.get('page_type'),
                'section_type': 'other',
                'source': 'negative'}))
    return work, os.path.join(DATA, 'annotations_negatives.jsonl')


def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else 'mobbin'
    work, out = collect(mode)
    if not out:
        print('nothing to do')
        return
    print(f'{len(work)} images', flush=True)
    import multiprocessing as mp
    n = 0
    tmp = out + '.tmp'
    with open(tmp, 'w') as f, \
         ProcessPoolExecutor(max_workers=8,
                             mp_context=mp.get_context('fork')) as ex:
        for r in ex.map(_work, work, chunksize=8):
            f.write(json.dumps(r) + '\n')
            n += 1
            if n % 200 == 0:
                print(f'  {n}', flush=True)
    os.replace(tmp, out)
    print(f'wrote {n} -> {out}')


if __name__ == '__main__':
    main()
