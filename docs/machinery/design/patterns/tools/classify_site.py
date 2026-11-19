#!/usr/bin/env python3
"""Re-classify operator metas -> site_type_v2 (closed vocab).

Reads docs/machinery/design/patterns/data/operator/<slug>/meta.json and
writes NEW fields only: site_type_v2, confidence, signals_used,
site_subtype, flagged_for_review. Original site_type untouched.

Signals: domain tokens, section heading/summary text, section_type
mix, source prior (details.so/siteinspire skew agency/portfolio).
saas only wins when no better signal clears threshold.

  python3 classify_site.py            # classify all, write metas
  python3 classify_site.py --dry      # report only, no writes
"""
import glob
import json
import os
import re
import sys
from collections import Counter

ROOT = os.path.dirname(os.path.abspath(__file__))
OPS = os.path.join(ROOT, '..', 'data', 'operator')
REVIEW_OUT = os.path.join(ROOT, '..', 'data',
                          'site-type-review.json')

VOCAB = {'med-spa', 'docs', 'nonprofit', 'automotive', 'hospitality',
         'ecommerce', 'technology', 'saas', 'agency-portfolio',
         'portfolio', 'other'}

# fold rules: original site_type -> v2
FOLD = {'medical-aesthetics/med-spa': 'med-spa',
        'med-spa': 'med-spa', 'docs': 'docs', 'nonprofit': 'nonprofit',
        'automotive': 'automotive', 'hospitality': 'hospitality',
        'ecommerce': 'ecommerce', 'technology': 'technology',
        'saas': 'saas', 'agency-portfolio': 'agency-portfolio',
        'portfolio': 'portfolio'}
# off-vocab originals preserved as site_subtype, v2 = 'other'
OFFVOCAB = {'media', 'services', 'fashion', 'finance', 'other'}

LEX = {
    'nonprofit': [
        'donat', 'charity', 'fundrai', 'volunteer', 'foundation',
        'impact report', 'our mission', 'nonprofit', 'non-profit',
        'crisis', 'campaign for', 'give today', 'registered charity',
        'marie curie', 'red cross', 'unicef'],
    'ecommerce': [
        'add to cart', 'add to bag', 'shop now', 'checkout', 'basket',
        'free shipping', 'size guide', 'buy now', 'in stock',
        'shopping bag', 'quick add', 'sold out', 'new arrivals',
        'cart', 'shop all'],
    'hospitality': [
        'book now', 'book a table', 'reservation', 'reservations',
        'rooms', 'suites', 'check-in', 'hotel', 'menu', 'restaurant',
        'our kitchen', 'wine list', 'stay with us', 'bed & breakfast',
        'boutique hotel'],
    'automotive': [
        'test drive', 'configure your', 'build yours', 'electric range',
        'horsepower', 'suv', 'sedan', 'coupe', 'vehicle', 'models',
        'porsche', 'ferrari', 'bmw', 'mercedes', 'dealership',
        'fuel economy', '0-60'],
    'med-spa': [
        'botox', 'filler', 'aesthetic', 'injectab', 'laser',
        'skin treatment', 'facial', 'dermaplan', 'microneedl',
        'coolsculpt', 'medspa', 'med spa', 'consultation',
        'before and after', 'anti-aging', 'rejuvenat', 'lip filler',
        'treatments'],
    'docs': [
        'documentation', 'api reference', 'api docs', 'get started',
        'quickstart', 'sdk', 'changelog', 'developer docs',
        'developers', 'guides and tutorials', 'endpoint', 'webhook'],
    'agency-portfolio': [
        'our work', 'case stud', 'we are a', 'design studio',
        'branding agency', 'clients', 'selected projects',
        'studio', 'agency', 'we craft', 'we design brands'],
    'portfolio': [
        "i'm a designer", 'i am a designer', 'freelance', 'my work',
        'selected work', 'personal portfolio', 'about me', 'resume',
        'portfolio of'],
    'technology': [
        'platform', 'infrastructure', 'api', 'cloud', 'ai-powered',
        'machine learning', 'open source', 'framework', 'database',
        'deploy', 'developer-first', 'serverless', 'kubernetes'],
    'saas': [
        'pricing', 'integrations', 'sign up', 'workflow', 'dashboard',
        'get started free', 'free trial', 'no credit card',
        'your team', 'automate', 'analytics for', 'scale your'],
}

DOMAIN_HINTS = {
    'nonprofit': ['charity', 'foundation', 'unicef', 'redcross',
                  'mariecurie', '.org', 'donate'],
    'ecommerce': ['shop', 'store', 'market'],
    'automotive': ['porsche', 'ferrari', 'bmw', 'audi', 'tesla',
                   'mercedes', 'honda', 'toyota', 'ford', 'rivian',
                   'lucid', 'jaguar', 'volvo', 'hyundai'],
    'hospitality': ['hotel', 'resort', 'inn', 'lodge', 'restaurant',
                    'eats', 'kitchen'],
    'med-spa': ['medspa', 'med-spa', 'aesthetic', 'clinic', 'skin',
                'derma', 'beauty'],
    'docs': ['docs.', 'developer.', 'dev.', 'api.'],
    'agency-portfolio': ['studio', 'agency', 'design'],
}

# source priors (weak: +1 score before margin check)
SOURCE_PRIOR = {
    'operator-endorsed (details.so)': 'agency-portfolio',
    'siteinspire (curated index)': 'agency-portfolio',
}

MIN_TOP = 3        # top score needed to label
MIN_MARGIN = 0.6   # top / (top + second + eps)


def corpus_text(m):
    bits = [m.get('domain') or '', m.get('url') or '',
            m.get('note') or '', m.get('page_type') or '']
    for s in m.get('sections') or []:
        bits.append(str(s.get('heading') or ''))
        bits.append(str(s.get('summary') or ''))
        bits.append(str(s.get('section_type') or ''))
        bits.append(str(s.get('locator') or ''))
    ua = m.get('ui_analysis_vlm') or {}
    if isinstance(ua, dict):
        bits.append(str(ua.get('site_type') or ''))
        bits.append(str(ua.get('summary') or ''))
        bits.append(str(ua.get('audience') or ''))
    for s in m.get('sections') or []:
        v = s.get('vlm')
        if isinstance(v, dict):
            for k in ('summary', 'text', 'description', 'content',
                      'site_type'):
                bits.append(str(v.get(k) or ''))
        elif isinstance(v, str):
            bits.append(v)
        ex = s.get('exemplar')
        if isinstance(ex, dict):
            bits.append(str(ex.get('tag') or ''))
            bits.append(str(ex.get('category') or ''))
    bits.append(str(m.get('exemplar') or ''))
    # tiles/cards text if present
    for t in m.get('tiles') or []:
        if isinstance(t, dict):
            bits.append(str(t.get('title') or ''))
            bits.append(str(t.get('text') or ''))
    return ' '.join(bits).lower()


def score(meta):
    text = corpus_text(meta)
    domain = (meta.get('domain') or meta.get('url') or '').lower()
    out = Counter()
    hits = {}
    for t, kws in LEX.items():
        h = [k for k in kws if k in text]
        if h:
            out[t] += sum(2 if len(k) > 8 else 1 for k in h)
            hits[t] = h[:6]
    for t, pats in DOMAIN_HINTS.items():
        h = [p for p in pats if p in domain]
        if h:
            out[t] += 2 * len(h)
            hits.setdefault(t, []).extend(['dom:' + p for p in h])
    # structure hints
    stypes = Counter(s.get('section_type') for s in
                     (meta.get('sections') or []))
    if stypes.get('form', 0) >= 2 or 'pricing' in stypes:
        out['saas'] += 1
        hits.setdefault('saas', []).append('structure')
    src = meta.get('source') or ''
    prior = SOURCE_PRIOR.get(src)
    if prior:
        out[prior] += 1
        hits.setdefault(prior, []).append('src:' + src.split('(')[1]
                                        .rstrip(')') if '(' in src
                                        else src)
    return out, hits


def classify(meta):
    orig = meta.get('site_type')
    if orig in FOLD and orig not in ('saas', 'other'):
        # already-correct non-default labels keep v2 = fold of itself
        v2 = FOLD[orig]
        return {'site_type_v2': v2, 'confidence': 1.0,
                'signals_used': ['site_type:' + str(orig)],
                'flagged_for_review': False}
    subtype = None
    if orig in OFFVOCAB and orig != 'other':
        subtype = orig
    out, hits = score(meta)
    if not out:
        return {'site_type_v2': 'saas',
                'confidence': 0.35,
                'signals_used': ['no keyword signal; default'],
                'site_subtype': subtype,
                'flagged_for_review': True}
    top, second = out.most_common(1)[0], (out.most_common(2) + [('', 0)])[1]
    margin = top[1] / (top[1] + second[1] + 1e-9)
    strong = top[1] >= MIN_TOP and margin >= MIN_MARGIN
    if strong:
        return {'site_type_v2': top[0],
                'confidence': round(min(0.98, 0.5 + margin * 0.5), 2),
                'signals_used': hits.get(top[0], []),
                'site_subtype': subtype,
                'flagged_for_review': False}
    # weak: saas if it scored at all (residual default), else flag
    if out.get('saas', 0) >= 1 and top[0] == 'saas':
        return {'site_type_v2': 'saas', 'confidence': 0.55,
                'signals_used': hits.get('saas', []) + ['weak margin'],
                'site_subtype': subtype,
                'flagged_for_review': margin < 0.5}
    return {'site_type_v2': None,
            'site_type_suggested': top[0],
            'confidence': round(margin, 2),
            'signals_used': [f'{top[0]}:{top[1]} vs {second[0]}:{second[1]}']
            + hits.get(top[0], [])[:4],
            'site_subtype': subtype,
            'flagged_for_review': True}


def main():
    dry = '--dry' in sys.argv
    metas = sorted(glob.glob(os.path.join(OPS, '*/meta.json')))
    metas = [m for m in metas if '_sources' not in m]
    review, dist, confs, wrote = [], Counter(), [], 0
    for f in metas:
        try:
            m = json.load(open(f))
        except Exception:
            continue
        if m.get('capture_status') != 'ok':
            continue
        r = classify(m)
        slug = os.path.basename(os.path.dirname(f))
        dist[r['site_type_v2']] += 1
        confs.append(r['confidence'])
        if r.get('flagged_for_review'):
            review.append({'slug': slug, 'url': m.get('url'),
                           'site_type': m.get('site_type'),
                           'site_type_v2': r['site_type_v2'],
                           'confidence': r['confidence'],
                           'signals_used': r['signals_used']})
        if not dry:
            m['site_type_v2'] = r['site_type_v2']
            if r.get('site_type_suggested'):
                m['site_type_suggested'] = r['site_type_suggested']
            else:
                m.pop('site_type_suggested', None)
            m['site_type_confidence'] = r['confidence']
            m['site_type_signals'] = r['signals_used']
            if r.get('site_subtype'):
                m['site_subtype'] = r['site_subtype']
            if r.get('flagged_for_review'):
                m['site_type_needs_review'] = True
            else:
                m.pop('site_type_needs_review', None)
            json.dump(m, open(f, 'w'), indent=1)
            wrote += 1
    n = len(confs)
    print(f'{n} classified, {wrote} written, '
          f'{len(review)} flagged for review')
    print('dist:', dist.most_common())
    if n:
        confs.sort()
        print(f'confidence p10={confs[n//10]:.2f} '
              f'median={confs[n//2]:.2f}')
    json.dump({'n': n, 'flagged': len(review),
               'review_queue': review}, open(REVIEW_OUT, 'w'),
              indent=1)
    print(f'review queue -> {REVIEW_OUT}')


if __name__ == '__main__':
    main()
