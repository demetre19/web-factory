#!/usr/bin/env python3
"""patterns.py — retrieve proven compositions from the mined library.

Two search spaces over the same pattern nodes:

1. TEXT (default) — embeddings of each pattern's imperative description +
   tags + genotype. Backend order:
     a. ollama `nomic-embed-text` (local, 768-dim) when the daemon is up;
     b. else TF-IDF/BM25 hybrid built from the corpus (stdlib only).
   `--backend` forces one; `index/vectors.json` records which was used.

2. GENOME (`--genotype`) — the pattern's allele vector; rank by cosine
   similarity in genome space (99 dims, one-hot). This is the operator's
   "retrieve nearest proven genotypes" path.

CLI:
  python3 tools/design-gate/patterns.py index
  python3 tools/design-gate/patterns.py search "commercial cleaning
      service detail page hero" [--site-type services] [--page-type
      service-detail] [--section hero] [--k 8] [--exact] [--genotype]
  python3 tools/design-gate/patterns.py show <pattern-id>
  python3 tools/design-gate/patterns.py lookup --section hero --site-type saas

Filters are hard when supplied (`--exact` is the default behaviour for
any filter given); without filters the whole library ranks.
"""
import argparse
import json
import math
import os
import re
import sys
import urllib.request
from collections import Counter

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(
    os.path.abspath(__file__))))
PAT = os.path.join(ROOT, 'docs', 'machinery', 'design', 'patterns')
INDEX = os.path.join(PAT, 'index')
OLLAMA = 'http://localhost:11434'
EMB_MODEL = 'nomic-embed-text'


# ---------------------------------------------------------------- frontmatter
def parse_fm(text):
    if not text.startswith('---'):
        return {}, text
    end = text.find('\n---', 3)
    if end < 0:
        return {}, text
    raw = text[3:end].strip('\n')
    body = text[end + 4:].lstrip('\n')
    fm, key, nested = {}, None, None
    for line in raw.splitlines():
        if not line.strip() or line.lstrip().startswith('#'):
            continue
        indent = len(line) - len(line.lstrip())
        s = line.strip()
        if indent == 0 and ':' in s:
            k, v = s.split(':', 1)
            k, v = k.strip(), v.strip()
            if v == '':
                fm[k] = []
                key = k
            elif v.startswith('[') and v.endswith(']'):
                fm[k] = [x.strip().strip('"\'') for x in v[1:-1].split(',')
                         if x.strip()]
                key = None
            else:
                fm[k] = v.strip('"\'')
                key = None
        elif indent > 0 and key:
            if s.startswith('- '):
                fm[key].append(s[2:].strip().strip('"\''))
            elif ':' in s:
                k2, v2 = s.split(':', 1)
                if isinstance(fm.get(key), list) and not fm[key]:
                    fm[key] = {}
                if isinstance(fm.get(key), dict):
                    fm[key][k2.strip()] = v2.strip().strip('"\'')
    return fm, body


def load_patterns():
    out = []
    for root, _, names in os.walk(PAT):
        if '/data' in root or '/index' in root or '/tools' in root:
            continue
        for n in sorted(names):
            if not (n.startswith('pattern-') and n.endswith('.md')):
                continue
            p = os.path.join(root, n)
            fm, body = parse_fm(open(p).read())
            geno = fm.get('genotype') or {}
            out.append({
                'id': fm.get('id') or n[:-3],
                'path': os.path.relpath(p, ROOT),
                'site_types': fm.get('site_types') or [],
                'page_types': fm.get('page_types') or [],
                'section_type': fm.get('section_type') or '',
                'speech_acts': fm.get('speech_acts') or [],
                'composition': fm.get('composition') or '',
                'prevalence': float(fm.get('prevalence') or 0),
                'n': int(float(fm.get('n') or 0)),
                'evidence': fm.get('evidence') or [],
                'implies_rules': fm.get('implies_rules') or [],
                'enforced_by': fm.get('enforced_by') or [],
                'genotype': geno if isinstance(geno, dict) else {},
                'text': ' '.join(body.split())[:1200],
            })
    return out


SYNONYMS = {
    'services': 'local service business commercial cleaning plumber trades '
                'home services quote service area emergency callout',
    'ecommerce': 'online store shop product category cart checkout shipping '
                 'returns reviews add to cart collection dropshipping',
    'portfolio': 'personal portfolio designer photographer architect '
                 'developer artist illustrator writer creative individual',
    'agency-portfolio': 'studio agency case study client work showcase',
    'saas': 'software product subscription trial plans seats integrations '
            'dashboard workspace',
    'technology': 'developer tool api sdk cli open source infrastructure '
                  'docs latency deploy',
    'fashion': 'luxury house collection lookbook editorial streetwear '
               'runway apparel',
    'luxury-goods': 'watches leather goods fragrance furniture interiors '
                    'heritage craftsmanship maison',
    'jewellery': 'fine jewellery bridal engagement artisan diamond gold',
    'architecture': 'architecture firm interior design studio landscape '
                    'projects practice awards',
    'homes': 'home builder developer off-plan house and land display homes '
             'renovation design-build',
    'healthcare': 'clinic medical dental telehealth patient appointment '
                  'wellness practitioner',
    'finance': 'fintech banking insurance security compliance regulation '
               'accounts loans',
    'education': 'course online learning school curriculum enrolment '
                 'certification',
    'hospitality': 'hotel restaurant venue menu booking travel stay',
    'real-estate': 'property listing brokerage buy rent inspection '
                   'suburb market',
    'automotive': 'car dealership manufacturer vehicle configurator test '
                  'drive electric',
    'legal': 'law firm practice areas solicitor litigation consultation',
    'recruitment': 'jobs board careers roles hiring agency candidate',
    'community': 'forum membership community platform discussions',
    'personal-brand': 'coach creator consultant personal brand offers',
    'government': 'civic government services directory council public',
    'nonprofit': 'charity donation impact volunteers cause advocacy',
    'media': 'news publication newsletter article editorial subscription',
    'events': 'conference festival schedule agenda speakers tickets venue',
    'marketplace': 'marketplace listings sellers buyers directory compare',
}


def pattern_text(p):
    tags = ' '.join(p['site_types'] + p['page_types'] +
                    [p['section_type']] + p['speech_acts'] +
                    [p['composition']] + list(p['genotype'].values()))
    syn = ' '.join(SYNONYMS.get(s, '') for s in p['site_types'])
    return f"{p['id'].replace('-', ' ')}. {p['text']} tags: {tags} {syn}"


# ---------------------------------------------------------------- embeddings
def ollama_up():
    for t in (5, 8):
        try:
            urllib.request.urlopen(f'{OLLAMA}/api/tags', timeout=t).read()
            return True
        except Exception:
            continue
    return False


def _unit(v):
    n = math.sqrt(sum(x * x for x in v)) or 1.0
    return [x / n for x in v]


def embed(texts, model=EMB_MODEL, kind='document', timeout=90):
    """nomic-embed-text via /api/embed (batch). Prefixes per the nomic
    convention: search_document: for corpus, search_query: for requests."""
    pref = 'search_document: ' if kind == 'document' else 'search_query: '
    body = json.dumps({'model': model,
                       'input': [pref + t for t in texts]}).encode()
    req = urllib.request.Request(f'{OLLAMA}/api/embed', data=body,
                                 headers={'Content-Type':
                                          'application/json'})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        out = json.loads(r.read())
    return [_unit(v) for v in out['embeddings']]


# ---------------------------------------------------------------- tf-idf
def tok(s):
    return re.findall(r'[a-z][a-z0-9+#.-]{1,}', s.lower())


def build_tfidf(docs):
    df = Counter()
    for d in docs:
        for t in set(tok(d)):
            df[t] += 1
    N = len(docs)
    idf = {t: math.log((N + 1) / (c + 0.5)) for t, c in df.items()}
    vecs = []
    for d in docs:
        c = Counter(tok(d))
        v = {t: (1 + math.log(n)) * idf.get(t, 0) for t, n in c.items()}
        norm = math.sqrt(sum(x * x for x in v.values())) or 1.0
        vecs.append({t: x / norm for t, x in v.items()})
    return idf, vecs


def tfidf_query(q, idf):
    c = Counter(tok(q))
    v = {t: (1 + math.log(n)) * idf.get(t, 0) for t, n in c.items()}
    norm = math.sqrt(sum(x * x for x in v.values())) or 1.0
    return {t: x / norm for t, x in v.items()}


def sparse_dot(a, b):
    if len(a) > len(b):
        a, b = b, a
    return sum(x * b.get(t, 0.0) for t, x in a.items())


def dense_dot(a, b):
    return sum(x * y for x, y in zip(a, b))


# ---------------------------------------------------------------- index
def cmd_index(args):
    pats = load_patterns()
    if not pats:
        raise SystemExit('no pattern files found')
    os.makedirs(INDEX, exist_ok=True)
    texts = [pattern_text(p) for p in pats]
    backend = 'tfidf'
    vectors = None
    if args.backend != 'tfidf' and ollama_up():
        try:
            vectors = embed(texts)
            backend = f'ollama:{EMB_MODEL}'
        except Exception as e:
            print(f'ollama embedding failed ({e}); falling back', file=sys.stderr)
    idf, tfvecs = build_tfidf(texts)
    json.dump(idf, open(os.path.join(INDEX, 'tfidf_idf.json'), 'w'))
    json.dump({'backend': 'tfidf', 'vectors': tfvecs},
              open(os.path.join(INDEX, 'vectors_tfidf.json'), 'w'))
    if vectors is None:
        vectors = tfvecs
    meta = {
        'backend': backend,
        'n': len(pats),
        'built_from': 'docs/machinery/design/patterns/**/pattern-*.md',
        'patterns': [{k: p[k] for k in (
            'id', 'path', 'site_types', 'page_types', 'section_type',
            'speech_acts', 'composition', 'prevalence', 'n', 'evidence',
            'implies_rules', 'enforced_by', 'genotype')} for p in pats],
    }
    json.dump({'backend': backend, 'vectors': vectors},
              open(os.path.join(INDEX, 'vectors.json'), 'w'))
    json.dump(meta, open(os.path.join(INDEX, 'meta.json'), 'w'), indent=1)
    print(f'indexed {len(pats)} patterns via {backend} -> {INDEX}')


def load_index():
    mp = os.path.join(INDEX, 'meta.json')
    vp = os.path.join(INDEX, 'vectors.json')
    if not (os.path.exists(mp) and os.path.exists(vp)):
        raise SystemExit('no index; run `patterns.py index` first')
    return json.load(open(mp)), json.load(open(vp))


SECTION_HINTS = {
    'hero': ['hero', 'fold', 'headline', 'above the fold', 'banner'],
    'pricing': ['pricing', 'plans', 'tiers', 'price'],
    'testimonials': ['testimonial', 'review', 'quote', 'social proof'],
    'logo-sections': ['logo', 'client logos', 'partners'],
    'trust-badges': ['trust', 'badge', 'cert', 'accredit', 'guarantee'],
    'faq': ['faq', 'questions', 'q&a'],
    'call-to-action': ['call to action', 'cta', 'signup', 'sign up', 'donate'],
    'how-it-works': ['process', 'how it works', 'steps'],
    'feature': ['feature', 'capabilities', 'services'],
    'gallery': ['gallery', 'photos', 'before and after'],
    'comparison': ['comparison', 'compare', 'versus'],
    'product-grid': ['product grid', 'plp', 'category page', 'listing grid'],
    'add-to-cart': ['add to cart', 'buy box', 'product page', 'pdp'],
    'content': ['about', 'story', 'editorial', 'article'],
    'work-grid': ['work index', 'case studies', 'portfolio grid'],
}
SITE_HINTS = {
    'services': ['cleaning', 'plumber', 'trades', 'local service',
                 'contractor', 'service business', 'electrician'],
    'ecommerce': ['ecommerce', 'shop', 'store', 'product', 'cart',
                  'checkout', 'dtc'],
    'saas': ['saas', 'software', 'subscription', 'b2b', 'trial'],
    'technology': ['developer', 'api', 'dev tool', 'sdk', 'open source'],
    'portfolio': ['portfolio', 'photographer', 'designer', 'artist'],
    'agency-portfolio': ['agency', 'studio'],
    'fashion': ['fashion', 'lookbook', 'apparel'],
    'luxury-goods': ['luxury', 'watches', 'fragrance'],
    'jewellery': ['jewellery', 'jewelry', 'engagement ring'],
    'architecture': ['architecture', 'interior design'],
    'homes': ['home builder', 'house and land', 'off-plan'],
    'healthcare': ['clinic', 'medical', 'dental', 'patient'],
    'finance': ['fintech', 'bank', 'insurance'],
    'education': ['course', 'learning', 'school'],
    'hospitality': ['hotel', 'restaurant', 'menu'],
    'real-estate': ['real estate', 'property', 'listing'],
    'automotive': ['car', 'vehicle', 'dealership', 'ev'],
    'legal': ['law firm', 'legal', 'solicitor'],
    'nonprofit': ['charity', 'donation', 'nonprofit'],
    'media': ['news', 'newsletter', 'publication'],
    'marketplace': ['marketplace', 'directory'],
    'events': ['conference', 'festival', 'agenda'],
    'personal-brand': ['coach', 'creator', 'consultant'],
    'government': ['government', 'council', 'civic'],
}


def infer_intent(q):
    ql = q.lower()
    sec = [s for s, keys in SECTION_HINTS.items()
           if any(k in ql for k in keys)]
    site = [s for s, keys in SITE_HINTS.items()
            if any(k in ql for k in keys)]
    return sec, site


def filters(meta, args):
    keep = []
    for i, p in enumerate(meta['patterns']):
        if args.site_type and args.site_type not in p['site_types']:
            continue
        if args.page_type and args.page_type not in p['page_types']:
            continue
        if args.section and p['section_type'] != args.section:
            continue
        if args.composition and p['composition'] != args.composition:
            continue
        keep.append(i)
    return keep


def cmd_search(args):
    meta, idx = load_index()
    keep = filters(meta, args)
    if not keep:
        print(json.dumps({'query': args.query, 'results': [],
                          'note': 'no pattern matches the filters'}))
        return
    if args.genotype:
        # genome-space: query is a JSON genotype
        q = json.loads(args.query)
        vec = genome_vector(q)
        scores = [(i, dense_dot(vec, genome_vector(
            meta['patterns'][i]['genotype']))) for i in keep]
        backend = 'genome'
    else:
        backend = idx['backend']
        if backend.startswith('ollama'):
            try:
                qv = embed([args.query], kind='query', timeout=45)[0]
                scores = [(i, dense_dot(qv, idx['vectors'][i]))
                          for i in keep]
            except Exception as e:
                print(f'embedder unavailable ({type(e).__name__}); '
                      f'using tf-idf for this query', file=sys.stderr)
                idf = json.load(open(os.path.join(INDEX, 'tfidf_idf.json')))
                qv = tfidf_query(args.query, idf)
                scores = [(i, sparse_dot(qv, idx['vectors'][i]))
                          for i in keep]
                backend = 'tfidf(fallback)' 
        else:
            idf = json.load(open(os.path.join(INDEX, 'tfidf_idf.json')))
            qv = tfidf_query(args.query, idf)
            scores = [(i, sparse_dot(qv, idx['vectors'][i])) for i in keep]
    # intent boost: a request that names the section/site should not be
    # out-ranked by a pattern that merely shares words. Weights:
    # text cosine 1.0, section match 0.35, site match 0.25.
    sec_hint, site_hint = infer_intent(args.query)
    if not args.no_boost and not args.genotype:
        boosted = []
        for i, sc in scores:
            p = meta['patterns'][i]
            if p['section_type'] in sec_hint:
                sc += 0.35
            if any(s in site_hint for s in p['site_types']):
                sc += 0.25
            boosted.append((i, sc))
        scores = boosted
    scores.sort(key=lambda t: -t[1])
    results = []
    for i, s in scores[:args.k]:
        p = meta['patterns'][i]
        results.append({
            'id': p['id'], 'score': round(s, 4),
            'site_types': p['site_types'], 'page_types': p['page_types'],
            'section_type': p['section_type'],
            'composition': p['composition'],
            'prevalence': p['prevalence'], 'n': p['n'],
            'evidence': p['evidence'][:3],
            'path': p['path'],
        })
    if getattr(args, 'json', False):
        print(json.dumps({'query': args.query, 'backend': backend,
                          'filters': {'site_type': args.site_type,
                                      'page_type': args.page_type,
                                      'section': args.section},
                          'results': results}, indent=1))
        return
    print(f'# {args.query}  [{backend}]')
    for r in results:
        print(f"{r['score']:.3f}  {r['id']}  ({r['section_type']}/"
              f"{r['composition']}, prev={r['prevalence']:.2f}, n={r['n']})")


def genome_vector(geno):
    sys.path.insert(0, os.path.join(ROOT, 'tools', 'design-gate'))
    from genome import vector
    return vector(geno)


def cmd_show(args):
    meta, _ = load_index()
    for p in meta['patterns']:
        if p['id'] == args.pattern_id:
            print(json.dumps(p, indent=1))
            return
    raise SystemExit(f'no pattern {args.pattern_id}')


def cmd_lookup(args):
    meta, _ = load_index()
    rows = [p for p in meta['patterns']
            if (not args.section or p['section_type'] == args.section)
            and (not args.site_type or args.site_type in p['site_types'])]
    for p in sorted(rows, key=lambda p: -p['prevalence']):
        print(f"{p['id']:55s} {p['composition']:16s} "
              f"prev={p['prevalence']:.2f} n={p['n']}")


def main():
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest='cmd', required=True)
    i = sub.add_parser('index')
    i.add_argument('--backend', default='auto',
                   choices=['auto', 'ollama', 'tfidf'])
    s = sub.add_parser('search')
    s.add_argument('query')
    s.add_argument('--site-type')
    s.add_argument('--page-type')
    s.add_argument('--section')
    s.add_argument('--composition')
    s.add_argument('--k', type=int, default=8)
    s.add_argument('--exact', action='store_true',
                   help='filters are already hard; kept for CLI symmetry')
    s.add_argument('--genotype', action='store_true',
                   help='query is a JSON genotype; rank in genome space')
    s.add_argument('--no-boost', action='store_true')
    s.add_argument('--json', action='store_true',
                   help='machine-readable results (default: one line each)')
    sh = sub.add_parser('show')
    sh.add_argument('pattern_id')
    lk = sub.add_parser('lookup')
    lk.add_argument('--section')
    lk.add_argument('--site-type')
    a = ap.parse_args()
    {'index': cmd_index, 'search': cmd_search, 'show': cmd_show,
     'lookup': cmd_lookup}[a.cmd](a)


if __name__ == '__main__':
    main()
