#!/usr/bin/env python3
"""genome.py — design-genome engine for the pattern library.

Reads patterns/data/annotations*.jsonl, encodes every screen as a
genotype (one allele per gene, closed sets from
docs/machinery/design/dna/GENOME.md), then:

  build        cells -> layout clusters, prevalence, saturation curves
  profiles     per site_type allele distributions -> dna/<vertical>.{md,json}
  mutate       wildcard genotype by moving 1-2 stylistic genes into the
               profile tail (temperature sampling)
  novelty      distance of a genotype from its profile centroid
  vector       print the one-hot genotype vector
  saturate     print saturation verdicts per cell

Stdlib only. Deterministic given a seed.

  python3 tools/design-gate/genome.py build
  python3 tools/design-gate/genome.py profiles
  python3 tools/design-gate/genome.py mutate --profile services --burst 2 --seed 7
"""
import argparse
import json
import math
import os
import random
import statistics
from collections import Counter, defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(
    os.path.abspath(__file__))))
DATA = os.path.join(ROOT, 'docs', 'machinery', 'design', 'patterns', 'data')
DNA = os.path.join(ROOT, 'docs', 'machinery', 'design', 'dna')

GENES = [
    ('layout-archetype', ['split-media', 'stacked-center', 'full-bleed-media',
                          'card-grid-2', 'card-grid-3', 'card-grid-4',
                          'editorial-single', 'sequence-steps',
                          'accordion-list', 'table-matrix', 'horizontal-band',
                          'immersive-media', 'asymmetric-offset',
                          'masonry-grid', 'split-form', 'carousel-track']),
    ('page-macro-structure', ['promise-proof-how-act', 'promise-detail-act',
                              'editorial-longform', 'catalog-first',
                              'conversion-short', 'immersive-narrative',
                              'index-grid-first']),
    ('density-tier', ['compact', 'regular', 'spacious']),
    ('image-led-ratio', ['text-led', 'balanced', 'image-led', 'media-first']),
    ('type-contrast', ['low', 'medium', 'high', 'extreme']),
    ('display-face', ['serif', 'sans', 'mono', 'mixed']),
    ('radius-personality', ['sharp', 'soft', 'pill', 'mixed']),
    ('surface-rhythm', ['single-surface', 'alternating',
                        'one-contrast-moment', 'dark-dominant',
                        'media-interleaved']),
    ('cta-restraint', ['single-primary', 'dual', 'multi', 'none']),
    ('cta-rank', ['hero', 'section', 'none']),
    ('disclosure-tier', ['open', 'folded', 'tabbed', 'carousel']),
    ('nav-pattern', ['bar', 'bar-cta', 'mega', 'hamburger-only', 'side']),
    ('motion-tier', ['static', 'subtle', 'expressive', 'cinematic']),
    ('proof-type', ['none', 'logos', 'ratings', 'testimonials', 'certs',
                    'stats', 'case-study', 'mixed']),
    ('media-treatment', ['none', 'photo', 'screenshot', 'illustration',
                         '3d-render', 'video']),
    ('columns', ['1', '2', '3', '4']),
    ('heading-form', ['claim', 'query', 'label']),
    ('whitespace-band', ['tight', 'medium', 'airy']),
    ('gallery-mode', ['single-hero', 'grid', 'lightbox', 'carousel',
                      'before-after']),
    ('form-presence', ['none', 'inline', 'panel']),
]
GENE_NAMES = [g for g, _ in GENES]
ALLELES = dict(GENES)
OFFSETS = {}
_o = 0
for _g, _a in GENES:
    OFFSETS[_g] = _o
    _o += len(_a)
DIMS = _o

# Which genes may be burst (stylistic tier). Structural/invariant genes
# are never randomised.
STYLISTIC = {'display-face', 'radius-personality', 'motion-tier',
             'density-tier', 'whitespace-band', 'image-led-ratio',
             'type-contrast', 'media-treatment', 'gallery-mode',
             'proof-type', 'form-presence', 'heading-form'}
RULES = {
    'layout-archetype': ['L.1', 'L.5', 'L.10'],
    'page-macro-structure': ['E.1', 'L.7'],
    'density-tier': ['G.3', 'L.7'],
    'image-led-ratio': ['V.1', 'V.3'],
    'type-contrast': ['T.1', 'T.4'],
    'display-face': ['T.2', 'T.6'],
    'radius-personality': ['S.1', 'S.3'],
    'surface-rhythm': ['C.1', 'C.6'],
    'cta-restraint': ['W.2', 'W.3'],
    'cta-rank': ['W.2', 'L.2'],
    'disclosure-tier': ['E.2', 'W.6'],
    'nav-pattern': ['L.9', 'R.5'],
    'motion-tier': ['M.1', 'M.3'],
    'proof-type': ['W.5'],
    'media-treatment': ['V.1', 'V.4'],
    'columns': ['L.1', 'T.7'],
    'heading-form': ['E.2', 'W.4'],
    'whitespace-band': ['L.4', 'G.2'],
    'gallery-mode': ['V.5', 'L.10'],
    'form-presence': ['W.7'],
}

COMPOSITION_TO_ARCHETYPE = {
    'split-media': 'split-media', 'stacked-hero': 'stacked-center',
    'immersive-media': 'immersive-media', 'full-bleed': 'full-bleed-media',
    'cards-n': 'card-grid-3', 'card-grid-2': 'card-grid-2',
    'card-grid-3': 'card-grid-3', 'card-grid-4': 'card-grid-4',
    'editorial': 'editorial-single', 'editorial-single': 'editorial-single',
    'sequence': 'sequence-steps', 'faq': 'accordion-list',
    'comparison': 'table-matrix', 'table-matrix': 'table-matrix',
    'logo-wall': 'horizontal-band', 'badge-center': 'horizontal-band',
    'stat-band': 'horizontal-band', 'proof-band': 'horizontal-band',
    'quote-grid': 'card-grid-3', 'media-gallery': 'masonry-grid',
    'form-panel': 'split-form', 'capture-form': 'split-form',
    'carousel': 'carousel-track', 'other': 'stacked-center',
}

PAGE_MACRO = {
    'home': 'promise-proof-how-act', 'service-detail': 'promise-detail-act',
    'pricing': 'conversion-short', 'product': 'conversion-short',
    'category': 'catalog-first', 'collection': 'catalog-first',
    'search-results': 'catalog-first', 'work-index': 'index-grid-first',
    'project-index': 'index-grid-first', 'case-study': 'editorial-longform',
    'project-case-study': 'editorial-longform', 'blog': 'editorial-longform',
    'article': 'editorial-longform', 'about': 'editorial-longform',
    'lookbook': 'immersive-narrative', 'brand-story': 'immersive-narrative',
    'listing': 'catalog-first', 'checkout': 'conversion-short',
    'cart': 'conversion-short', 'contact': 'conversion-short',
    'schedule': 'catalog-first',
}


def band(x, cuts):
    if x is None:
        return None
    for i, c in enumerate(cuts):
        if x < c:
            return i
    return len(cuts)


def genotype(rec, density_cuts=(0.12, 0.24)):
    """Annotation record -> allele per gene. Unmeasured fields fall back
    to a composition prior (documented: `derived` list in output)."""
    derived = []
    comp = rec.get('composition') or 'other'
    arch = COMPOSITION_TO_ARCHETYPE.get(comp, 'stacked-center')
    mr = rec.get('media_ratio')
    mr = 0.0 if mr is None else mr
    if arch in ('stacked-center', 'split-media') and mr > 0.85:
        arch = 'immersive-media'
    cols = str(rec.get('columns') or 1)
    if cols not in ALLELES['columns']:
        cols = '1'

    ink = rec.get('ink_density')
    if ink is None:
        dens = rec.get('density') or 'regular'
        derived.append('density-tier')
    else:
        i = band(ink, density_cuts)
        dens = ['spacious', 'regular', 'compact'][min(2, i)]
    dens = dens if dens in ALLELES['density-tier'] else 'regular'

    img = ('text-led' if mr < 0.25 else 'balanced' if mr < 0.55
           else 'image-led' if mr < 0.80 else 'media-first')

    ws = rec.get('whitespace_share')
    wsb = ('tight' if (ws or 0) < 0.35 else 'medium' if (ws or 0) < 0.55
           else 'airy')

    hbr = rec.get('heading_body_ratio')
    if hbr is None:
        derived.append('type-contrast')
        tc = {'hero': 'high', 'editorial-single': 'high',
              'stacked-center': 'high'}.get(arch, 'medium')
    else:
        tc = ('low' if hbr < 2 else 'medium' if hbr < 3.5
              else 'high' if hbr < 6 else 'extreme')

    serif = rec.get('serif_display')
    if serif is None:
        derived.append('display-face')
        face = 'serif' if rec.get('site_type') in (
            'luxury-goods', 'jewellery', 'fashion', 'architecture',
            'hospitality', 'portfolio') else 'sans'
    else:
        face = 'serif' if serif else 'sans'

    radius = rec.get('radius_personality')
    if radius is None:
        derived.append('radius-personality')
        radius = 'soft'
    if radius not in ALLELES['radius-personality']:
        radius = 'soft'

    cta = rec.get('cta_count')
    if not cta:
        derived.append('cta-restraint')
        cta = 2 if comp in ('hero-act-merge', 'split-media') else 1
    cta_allele = ('none' if cta == 0 else 'single-primary' if cta == 1
                  else 'dual' if cta == 2 else 'multi')

    rank = rec.get('cta_rank_primary')
    if rank not in ALLELES['cta-rank']:
        rank = 'hero' if rec.get('section_type') == 'hero' else (
            'section' if rec.get('speech_act') == 'act' else 'none')

    nav = rec.get('nav_pattern')
    if nav not in ALLELES['nav-pattern']:
        nav = 'bar'

    mot = 'cinematic' if rec.get('cinematic') else 'subtle'
    proof = rec.get('proof_type')
    if proof not in ALLELES['proof-type']:
        proof = 'none'
    mt = rec.get('media_type')
    if mt not in ALLELES['media-treatment']:
        mt = 'photo' if mr > 0.1 else 'none'
    if mt == 'video-still':
        mt = 'video'
    hf = rec.get('heading_form')
    if hf not in ALLELES['heading-form']:
        hf = 'claim'

    section = rec.get('section_type')
    gallery = ('single-hero' if arch in ('immersive-media', 'full-bleed-media')
               else 'grid' if section in ('gallery', 'product-grid',
                                          'work-grid') else 'single-hero')
    form = ('panel' if section in ('form', 'contact')
            else 'inline' if section in ('newsletter', 'search-bar')
            else 'none')
    surface = rec.get('surface') or 'base'
    rhythm = ('dark-dominant' if surface == 'inverse'
              else 'one-contrast-moment')
    macro = PAGE_MACRO.get(rec.get('page_type'), 'promise-detail-act')

    return {
        'layout-archetype': arch,
        'page-macro-structure': macro,
        'density-tier': dens,
        'image-led-ratio': img,
        'type-contrast': tc,
        'display-face': face,
        'radius-personality': radius,
        'surface-rhythm': rhythm,
        'cta-restraint': cta_allele,
        'cta-rank': rank,
        'disclosure-tier': (rec.get('disclosure')
                            if rec.get('disclosure') in
                            ALLELES['disclosure-tier'] else 'open'),
        'nav-pattern': nav,
        'motion-tier': mot,
        'proof-type': proof,
        'media-treatment': mt,
        'columns': cols,
        'heading-form': hf,
        'whitespace-band': wsb,
        'gallery-mode': gallery,
        'form-presence': form,
    }, derived


def vector(geno):
    v = [0.0] * DIMS
    for g in GENE_NAMES:
        a = geno.get(g)
        if a in ALLELES[g]:
            v[OFFSETS[g] + ALLELES[g].index(a)] = 1.0
    return v


def cosine(a, b):
    na = math.sqrt(sum(x * x for x in a))
    nb = math.sqrt(sum(x * x for x in b))
    if not na or not nb:
        return 0.0
    return sum(x * y for x, y in zip(a, b)) / (na * nb)


def load(mode='mobbin'):
    p = os.path.join(DATA, 'annotations.jsonl' if mode == 'mobbin'
                     else 'annotations_negatives.jsonl')
    out = []
    with open(p) as f:
        for line in f:
            r = json.loads(line)
            if 'error' in r:
                continue
            out.append(r)
    return out


def density_cuts(recs):
    vals = sorted(r['ink_density'] for r in recs if r.get('ink_density')
                  is not None)
    if len(vals) < 30:
        return (0.12, 0.24)
    return (vals[len(vals) // 3], vals[2 * len(vals) // 3])


def cmd_build(args):
    recs = load('mobbin')
    cuts = density_cuts(recs)
    cells = defaultdict(list)
    for r in recs:
        g, d = genotype(r, cuts)
        r['_geno'] = g
        r['_derived'] = d
        key = f"{r['site_type']}/{r['page_type']}/{r['section_type']}"
        cells[key].append(r)

    out_cells = {}
    sat = {}
    for key, rs in cells.items():
        n = len(rs)
        arch = Counter(r['_geno']['layout-archetype'] for r in rs)
        geno = Counter(tuple(sorted(r['_geno'].items())) for r in rs)
        top = arch.most_common()
        out_cells[key] = {
            'n': n,
            'sites': len({r.get('site_name') for r in rs}),
            'archetypes': [{'allele': a, 'n': c, 'share': round(c / n, 3)}
                           for a, c in top],
            'genotypes': [{'n': c, 'share': round(c / n, 3)}
                          for _, c in geno.most_common(6)],
            'dominant': top[0][0] if top else None,
            'dominant_share': round(top[0][1] / n, 3) if top else 0.0,
        }
        # saturation: new-archetype discovery vs screens sampled
        seen, curve = set(), []
        for i, r in enumerate(rs, 1):
            a = r['_geno']['layout-archetype']
            if a not in seen:
                seen.add(a)
                curve.append((i, len(seen)))
        late_new = sum(1 for i, _ in curve if i > 0.8 * n)
        gain = late_new / max(1, len(seen))
        sat[key] = {'n': n, 'clusters': len(seen),
                    'curve': curve, 'late_gain': round(gain, 3),
                    'saturated': bool(n >= 30 and gain < 0.05)}

    # per-site allele distributions
    per_site = defaultdict(lambda: defaultdict(Counter))
    for r in recs:
        for g, a in r['_geno'].items():
            per_site[r['site_type']][g][a] += 1

    payload = {
        'genes': {g: a for g, a in GENES},
        'rules': RULES,
        'stylistic': sorted(STYLISTIC),
        'density_cuts': [round(c, 4) for c in cuts],
        'n_records': len(recs),
        'cells': out_cells,
        'saturation': sat,
        'site_alleles': {s: {g: dict(c) for g, c in d.items()}
                         for s, d in per_site.items()},
    }
    os.makedirs(DATA, exist_ok=True)
    with open(os.path.join(DATA, 'genome.json'), 'w') as f:
        json.dump(payload, f, indent=1)
    # per-screen genotypes for scoring
    with open(os.path.join(DATA, 'genotypes.jsonl'), 'w') as f:
        for r in recs:
            f.write(json.dumps({
                'image': r['image'], 'mobbin_id': r.get('mobbin_id'),
                'site_type': r['site_type'], 'page_type': r['page_type'],
                'section_type': r['section_type'],
                'label': r.get('label', 1), 'genotype': r['_geno'],
                'derived': r['_derived']}) + '\n')
    sat_cells = sum(1 for v in sat.values() if v['saturated'])
    print(f'cells={len(out_cells)} records={len(recs)} '
          f'saturated={sat_cells}/{len(sat)} dims={DIMS}')


def cmd_profiles(args):
    with open(os.path.join(DATA, 'genome.json')) as f:
        g = json.load(f)
    os.makedirs(DNA, exist_ok=True)
    written = []
    for site, genes in g['site_alleles'].items():
        if site in ('other', None):
            continue
        n = sum(sum(c.values()) for c in genes.values())
        prof = {}
        for gene, counts in genes.items():
            tot = sum(counts.values()) or 1
            prof[gene] = {a: round(c / tot, 4)
                          for a, c in sorted(counts.items(),
                                             key=lambda kv: -kv[1])}
        obj = {'id': f'profile-{site}', 'site_type': site, 'n': n,
               'genes': prof}
        with open(os.path.join(DNA, f'{site}.json'), 'w') as f:
            json.dump(obj, f, indent=1)
        lines = [f'---', f'id: profile-{site}', f'type: profile',
                 f'site_type: {site}', f'n: {n}', 'links:',
                 f'  derives_from: [patterns-index]',
                 f'  uses_genes: [{", ".join("gene-" + x for x in GENE_NAMES)}]',
                 '---', '', f'# DNA — {site}', '',
                 f'Distribution over alleles for {n} annotated screens '
                 f'(source: Mobbin + web supplement).', '']
        lines.append('| Gene | Dominant allele | Share | Runner-up |')
        lines.append('|---|---|---|---|')
        for gene in GENE_NAMES:
            dist = prof.get(gene) or {}
            if not dist:
                continue
            items = list(dist.items())
            lines.append(f"| `{gene}` | `{items[0][0]}` | "
                         f"{items[0][1]:.0%} | "
                         f"{items[1][0] if len(items) > 1 else '—'} |")
        lines += ['', '## Profile centroid', '',
                  'The centroid is the allele distribution above; '
                  '`genome.py novelty` measures distance from it.', '']
        with open(os.path.join(DNA, f'{site}.md'), 'w') as f:
            f.write('\n'.join(lines))
        written.append(site)
    print('profiles:', ', '.join(sorted(written)))


def profile_dist(site):
    p = os.path.join(DNA, f'{site}.json')
    if not os.path.exists(p):
        raise SystemExit(f'no profile {site}; run `genome.py profiles`')
    with open(p) as f:
        return json.load(f)['genes']


def centroid(site):
    genes = profile_dist(site)
    v = [0.0] * DIMS
    for g in GENE_NAMES:
        for a, p in (genes.get(g) or {}).items():
            if a in ALLELES[g]:
                v[OFFSETS[g] + ALLELES[g].index(a)] = p
    return v


def novelty(geno, site):
    c = centroid(site)
    return round(1.0 - cosine(vector(geno), c), 4)


def cmd_mutate(args):
    genes = profile_dist(args.profile)
    base = {}
    for g in GENE_NAMES:
        dist = genes.get(g) or {}
        base[g] = next(iter(dist), ALLELES[g][0])
    burst = max(1, min(2, args.burst))
    rng = random.Random(args.seed)
    wild = []
    candidates = [g for g in GENE_NAMES if g in STYLISTIC]
    for g in rng.sample(candidates, burst):
        dist = genes.get(g) or {}
        ranked = sorted(dist.items(), key=lambda kv: kv[1])
        tail = [a for a, p in ranked if p <= max(0.05, 1.0 / len(ranked))]
        if not tail:
            tail = [a for a in ALLELES[g] if a != base[g]]
        # temperature: lower temp favours the least probable allele
        w = [math.exp(-args.temp * i) for i in range(len(tail))]
        a = rng.choices(tail, weights=w, k=1)[0]
        base[g] = a
        wild.append(g)
    nov = novelty(base, args.profile)
    out = {'profile': f'profile-{args.profile}', 'genotype': base,
           'wildcard': wild, 'novelty': nov,
           'within_bound': nov <= args.max_novelty}
    print(json.dumps(out, indent=1))


def cmd_novelty(args):
    geno = json.loads(args.genotype)
    print(json.dumps({'profile': args.profile,
                      'novelty': novelty(geno, args.profile)}))


def cmd_saturate(args):
    with open(os.path.join(DATA, 'genome.json')) as f:
        g = json.load(f)
    for key, s in sorted(g['saturation'].items(),
                         key=lambda kv: -kv[1]['n']):
        print(f"{key:55s} n={s['n']:3d} clusters={s['clusters']:2d} "
              f"late_gain={s['late_gain']:.3f} "
              f"{'SATURATED' if s['saturated'] else 'mining'}")


def cmd_vector(args):
    geno = json.loads(args.genotype)
    print(json.dumps({'dims': DIMS, 'vector': vector(geno)}))


def main():
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest='cmd', required=True)
    sub.add_parser('build')
    sub.add_parser('profiles')
    sub.add_parser('saturate')
    m = sub.add_parser('mutate')
    m.add_argument('--profile', required=True)
    m.add_argument('--burst', type=int, default=1)
    m.add_argument('--seed', type=int, default=0)
    m.add_argument('--temp', type=float, default=1.0)
    m.add_argument('--max-novelty', type=float, default=0.55)
    n = sub.add_parser('novelty')
    n.add_argument('--profile', required=True)
    n.add_argument('--genotype', required=True)
    v = sub.add_parser('vector')
    v.add_argument('--genotype', required=True)
    a = ap.parse_args()
    {'build': cmd_build, 'profiles': cmd_profiles,
     'saturate': cmd_saturate, 'mutate': cmd_mutate,
     'novelty': cmd_novelty, 'vector': cmd_vector}[a.cmd](a)


if __name__ == '__main__':
    main()
