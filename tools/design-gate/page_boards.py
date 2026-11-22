#!/usr/bin/env python3
"""page_boards.py — per-page-type layout options for the /app boards.

The picker's Layout boards (Home / Service / Location / Contact / Blog)
each preview a page TYPE, not the one emitted article. This producer:

  1. section plan — per board type, the role program (act + bank
     archetype categories) extending gate.SECTION_PROGRAM, whose acts
     every program must cover;
  2. content binding — each role binds ONLY content that belongs to it:
     the real COPY.json prose binds solely on the board whose type
     matches plan_from_copy.page_type_of(COPY); every other board binds
     site facts the plan carries (brand, phone, CTA, nav/footer links,
     guide links, coverage suburbs, brief media). A slot with no
     role-appropriate source gets lorem ipsum (sized per slot) — never
     another page's copy. Every slot records its source;
  3. options — candidates per role retrieved from the bricksmaven bank
     (+ catalog gold exemplars), ranked by tag-vector cosine between the
     recipe's classify labels and the resolved vibe genes (DNA genotype
     overlaid by the signed vibe pick), top-k per role, then diversified:
     heroes round-robin across topology_ids, sections by least-used
     (MMR), and no two options sharing a hero topology_id may share
     more than half their section compositions.

  page_boards.py <pdir> [--emit]
  inputs   <page>/COPY.json  DESIGN-PLAN.md  DNA.json  ELEMENT-PICKS.json
           templates/skeletons/bricksmaven/<cat>/*.{astro,topo,classify}.json
  outputs  <page>/PAGE-BOARDS.json
           (--emit) <page>/boards/site/dist/preview/lo-<board>-<nn>/
"""
import glob
import hashlib
import json
import math
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import gate  # noqa: E402
import board_copy  # noqa: E402
import plan_from_copy as PC  # noqa: E402

TOOL = 'page_boards.py'
REPO = os.path.normpath(os.path.join(HERE, '..', '..'))
BANK = os.path.join(REPO, 'templates', 'skeletons', 'bricksmaven')
CATALOG = os.path.join(REPO, 'templates', 'sections')

N_OPTIONS = 30          # per board — inside the 20..40 band
TOP_K = 10              # retrieved candidates per section role
MAX_SHARED = 0.5        # same hero topology ⇒ ≤ half the sections shared
MAX_SHARED_ANY = 0.75   # any two options — best effort on thin pools

# board id → PS page type (picker_app.PAGE_BOARDS ids)
BOARD_TYPE = dict(board_copy.BOARD_TYPE, home='home')

# hero gold exemplars → the bank topology vocabulary (retrieval's
# topo-map, reversed; cutout has no bank id of its own)
_HERO_CATALOG_TOPO = {'stacked-hero': 'hero-media-top',
                      'full-bleed': 'hero-media-bg',
                      'hero-act-merge': 'hero-no-media',
                      'cutout-hero-split': 'hero-cutout'}

# header gold exemplars with their own markup (nav-h* are verbatim
# copies of the translated bank headers, so the bank rows cover them)
_NAV_CATALOG = ['nav-bar', 'flyout-nav', 'nav-offcanvas'] + \
    [f'nav-mega-{i}' for i in range(1, 8)]


def _nav_family(c):
    """header diversity key — each gold nav its own family, mega
    menus one family, bank headers by topology_id."""
    comp = c['comp']
    if comp.startswith('nav-mega-'):
        return 'nav-mega'
    return comp if not comp.startswith('bm-') else \
        'bm:' + c['topology_id']


# role program per board: (role, act, bank categories, catalog comps).
# Acts extend gate.SECTION_PROGRAM (asserted in _program); categories
# are the bank archetype dirs whose recipes may carry the role.
PROGRAM = {
    'home': [
        ('header', 'chrome', ['headers'], _NAV_CATALOG),
        ('hero', 'promise', ['hero'], list(_HERO_CATALOG_TOPO)),
        ('services', 'detail', ['feature', 'grids-and-cards'],
         ['cards-n', 'feature-grid']),
        ('process', 'how', ['how-it-works'], ['sequence', 'how-steps']),
        ('proof', 'proof', ['testimonials', 'logo-sections'],
         ['proof-band', 'quote-grid']),
        ('stats', 'proof', ['counter'], ['stat-band']),
        ('cta', 'act', ['call-to-action'], ['banner-cta']),
        ('footer', 'chrome', ['footer'], ['footer-bar']),
    ],
    'service': [
        ('header', 'chrome', ['headers'], _NAV_CATALOG),
        ('hero', 'promise', ['hero'], list(_HERO_CATALOG_TOPO)),
        ('benefits', 'detail', ['feature'], ['split-media']),
        ('process', 'how', ['how-it-works'], ['sequence', 'how-steps']),
        ('scope', 'detail', ['grids-and-cards', 'content'],
         ['cards-n', 'text-index']),
        ('pricing', 'detail', ['pricing'],
         ['comparison', 'pricing-table']),
        ('proof', 'proof', ['testimonials'], ['proof-band',
                                              'quote-grid']),
        ('faq', 'objection', [], ['faq']),
        ('cta', 'act', ['call-to-action'], ['banner-cta',
                                            'form-panel']),
        ('footer', 'chrome', ['footer'], ['footer-bar']),
    ],
    'location': [
        ('header', 'chrome', ['headers'], _NAV_CATALOG),
        ('hero', 'promise', ['header-page-sections', 'hero'],
         list(_HERO_CATALOG_TOPO)),
        ('coverage', 'detail', ['category-section', 'grids-and-cards'],
         ['link-grid', 'map-finder']),
        ('proof', 'proof', ['testimonials'], ['proof-band']),
        ('services', 'how', ['feature'], ['cards-n']),
        ('faq', 'objection', [], ['faq']),
        ('contact', 'act', ['contact'], ['contact-panel']),
        ('footer', 'chrome', ['footer'], ['footer-bar']),
    ],
    'contact': [
        ('header', 'chrome', ['headers'], _NAV_CATALOG),
        ('hero', 'promise', ['header-page-sections', 'hero'],
         list(_HERO_CATALOG_TOPO)),
        ('form', 'act', ['contact'], ['contact-panel', 'form-panel']),
        ('map', 'detail', [], ['map-finder', 'link-grid']),
        ('hours', 'detail', ['counter'], ['stat-band', 'text-index']),
        ('faq', 'objection', [], ['faq']),
        ('footer', 'chrome', ['footer'], ['footer-bar']),
    ],
    'blog': [
        ('header', 'chrome', ['headers'], _NAV_CATALOG),
        ('hero', 'promise', ['header-page-sections', 'hero'],
         list(_HERO_CATALOG_TOPO)),
        ('featured', 'detail', ['blog-section'], ['split-media']),
        ('listing', 'how', ['blog-archive'], ['cards-n']),
        ('categories', 'detail', ['category-section'], ['link-grid']),
        ('newsletter', 'act', ['newsletter'], ['newsletter-band']),
        ('footer', 'chrome', ['footer'], ['footer-bar']),
    ],
}
CHROME = ('header', 'footer')

# which plan intents a role binds when the board IS the input's type
# (the real COPY.json prose rides only there)
ROLE_INTENTS = {
    'benefits': ('definition',), 'scope': ('scope',),
    'process': ('process',), 'pricing': ('cost',),
    'proof': ('proof',), 'faq': ('faq',), 'stats': ('duration',),
    'coverage': ('coverage',), 'services': ('scope',),
}

_LOREM = ('lorem ipsum dolor sit amet consectetur adipiscing elit sed do '
          'eiusmod tempor incididunt ut labore et dolore magna aliqua ut '
          'enim ad minim veniam quis nostrud exercitation ullamco laboris '
          'nisi aliquip ex ea commodo consequat duis aute irure in '
          'reprehenderit voluptate velit esse cillum fugiat nulla '
          'pariatur excepteur sint occaecat cupidatat non proident sunt '
          'culpa qui officia deserunt mollit anim id est laborum').split()

# slot → lorem length in words (sensible per slot)
_LOREM_WORDS = {'heading': 5, 'fs': 22, 'term': 2, 'text': 12,
                'q': 7, 'a': 18}


def _lorem(seed, slot):
    n = _LOREM_WORDS.get(slot, 10)
    h = int(hashlib.sha256(seed.encode()).hexdigest(), 16)
    start = h % len(_LOREM)
    words = [_LOREM[(start + i * 7) % len(_LOREM)] for i in range(n)]
    txt = ' '.join(words)
    if slot in ('heading', 'term', 'q'):
        txt = txt.capitalize() + ('?' if slot == 'q' else '')
    else:
        txt = txt.capitalize() + '.'
    return txt


def _sha(path):
    try:
        return hashlib.sha256(open(path, 'rb').read()).hexdigest()[:16]
    except OSError:
        return ''


# ------------------------------------------------------------ program
def _program(board):
    """The role program for a board — its acts must cover the type's
    gate.SECTION_PROGRAM acts where the gate declares one."""
    prog = PROGRAM[board]
    want = (gate.SECTION_PROGRAM.get(BOARD_TYPE[board]) or {}) \
        .get('acts') or set()
    have = {a for _r, a, _c, _k in prog}
    missing = set(want) - have
    if missing:
        raise SystemExit(f'{TOOL}: {board} program misses acts '
                         f'{sorted(missing)} (J.9 SECTION_PROGRAM)')
    return prog


# --------------------------------------------------------- vibe genes
def resolved_genes(pd):
    """DNA genotype overlaid by the signed vibe pick (bundle genes or
    the vibe_atlas preset the pick names)."""
    dna = _json(os.path.join(pd, 'DNA.json')) or \
        _json(os.path.join(os.path.dirname(pd), 'DNA.json')) or {}
    genes = {k: str(v) for k, v in (dna.get('genotype') or {}).items()}
    picks = (_json(os.path.join(pd, 'ELEMENT-PICKS.json')) or {}) \
        .get('picks') or []
    vp = next((p for p in picks if p.get('element') == 'vibe'), None)
    if vp:
        bg = (vp.get('bundle') or {}).get('genes')
        if isinstance(bg, dict):
            genes.update({k: str(v) for k, v in bg.items() if v})
        else:
            try:
                import vibe_atlas
                pr = next((p for p in vibe_atlas.PRESETS
                           if p['id'] == vp.get('variant')), None)
                if pr:
                    genes.update({k: str(v) for k, v in
                                  pr['genes'].items()})
            except Exception:
                pass
    return genes


def _json(p):
    try:
        return json.load(open(p, encoding='utf-8'))
    except Exception:
        return None


_LABELS = {}


def _labels(recipe):
    """bricksmaven/<cat>/<stem> → {gene: (allele, confidence)}."""
    if recipe not in _LABELS:
        _p, cat, stem = recipe.split('/')
        d = _json(os.path.join(BANK, cat, stem + '.classify.json')) or {}
        _LABELS[recipe] = {k: (str(v.get('allele')),
                               float(v.get('confidence') or 0))
                           for k, v in (d.get('labels') or {}).items()
                           if isinstance(v, dict)}
    return _LABELS[recipe]


def vibe_fit(recipe, genes):
    """Tag-vector cosine: the recipe's confidence-weighted one-hot
    label vector vs the one-hot resolved-gene query vector."""
    if not recipe or not recipe.startswith('bricksmaven/') or not genes:
        return 0.0
    lab = _labels(recipe)
    dims = [g for g in genes if g in lab]
    if not dims:
        return 0.0
    dot = sum(lab[g][1] for g in dims if lab[g][0] == genes[g])
    norm = math.sqrt(sum(lab[g][1] ** 2 for g in dims)) * \
        math.sqrt(len(dims))
    return round(dot / norm, 4) if norm else 0.0


def _topo(recipe):
    _p, cat, stem = recipe.split('/')
    return (_json(os.path.join(BANK, cat, stem + '.topo.json')) or {}) \
        .get('topology_id') or 'unknown'


def _candidates(role, cats, catalog, genes, exclude=()):
    """[{comp, recipe, topology_id, fit}] for a role — bank recipes in
    the role's archetype categories + catalog gold exemplars, ranked
    by vibe fit (stable on id)."""
    out = []
    for cat in cats:
        d = os.path.join(BANK, cat)
        if not os.path.isdir(d):
            continue
        for fn in sorted(os.listdir(d)):
            if not fn.endswith('.astro'):
                continue
            stem = fn[:-6]
            rec = f'bricksmaven/{cat}/{stem}'
            if f'bm-{cat}-{stem}' in exclude:
                continue
            out.append({'comp': f'bm-{cat}-{stem}', 'recipe': rec,
                        'topology_id': _topo(rec),
                        'fit': vibe_fit(rec, genes)})
    for comp in catalog:
        if comp in exclude:
            continue
        if not os.path.isfile(os.path.join(CATALOG, comp,
                                           gate.camel(comp) + '.astro')):
            continue
        rec = gate.RECIPE_FOR_COMP.get(comp) or ''
        out.append({'comp': comp, 'recipe': rec,
                    'topology_id': _HERO_CATALOG_TOPO.get(comp) or (
                        _topo(rec) if rec.startswith('bricksmaven/')
                        else comp),
                    'fit': vibe_fit(rec, genes)})
    out.sort(key=lambda c: (-c['fit'], c['comp']))
    return out


def _hero_order(cands, key=lambda c: c['topology_id'], shift=0):
    """Round-robin across topology_ids (groups ordered by best fit) so
    the first screens of consecutive options differ."""
    groups = {}
    for c in cands:
        groups.setdefault(key(c), []).append(c)
    order = sorted(groups, key=lambda t: (-groups[t][0]['fit'], t))
    # each board leads with a different topology — option NN on two
    # boards must not open on the same first screen
    if order:
        k = shift % len(order)
        order = order[k:] + order[:k]
    seq, r = [], 0
    while len(seq) < len(cands):
        for t in order:
            if r < len(groups[t]):
                seq.append(groups[t][r])
        r += 1
    return seq


def _overlap(a, b, roles):
    if not roles:
        return 0.0
    return sum(1 for r in roles if a.get(r) == b.get(r)) / len(roles)


def generate(board, genes, n=N_OPTIONS, exclude=()):
    prog = _program(board)
    pools = {}
    for role, _act, cats, catalog in prog:
        c = _candidates(role, cats, catalog, genes, exclude)
        pools[role] = c if role in ('hero', 'header', 'footer') \
            else c[:TOP_K]
    shift = list(PROGRAM).index(board)
    heroes = _hero_order(pools['hero'], shift=shift * 3)
    pools['header'] = _hero_order(pools['header'], _nav_family,
                                  shift=shift)
    n = max(1, min(n, len(heroes)))
    sec_roles = [r for r, *_ in prog if r not in CHROME + ('hero',)]
    used = {r: {} for r, *_ in prog}
    opts = []
    for i in range(n):
        hero = heroes[i]
        comp = {'hero': hero['comp']}
        pick = {'hero': hero}
        for role in ('header', 'footer'):
            pool = pools[role]
            if pool:
                pick[role] = pool[i % len(pool)]
                comp[role] = pick[role]['comp']
        for role in sec_roles:
            pool = pools[role]
            if not pool:
                continue
            # MMR: least-used first, vibe fit breaks ties
            best = min(pool, key=lambda c: (used[role].get(c['comp'], 0),
                                            -c['fit'], c['comp']))
            pick[role] = best
            comp[role] = best['comp']
        # diversity repair: same hero topology ⇒ ≤ MAX_SHARED shared
        for _try in range(len(sec_roles) * 4):
            clash = next((o for o in opts
                          if _overlap(o['compositions'], comp, sec_roles)
                          > (MAX_SHARED if o['hero']['topology_id'] ==
                             hero['topology_id'] else MAX_SHARED_ANY)),
                         None)
            if not clash:
                break
            shared = [r for r in sec_roles
                      if comp.get(r) == clash['compositions'].get(r)
                      and len(pools[r]) > 1]
            if not shared:
                break
            shared.sort(key=lambda r: -len(pools[r]))
            r = shared[_try % len(shared)]
            alts = [c for c in pools[r] if c['comp'] != comp[r]]

            def _worst(c, r=r):
                trial = dict(comp, **{r: c['comp']})
                return max((_overlap(o['compositions'], trial, sec_roles)
                            for o in opts), default=0.0)
            alt = min(alts, key=lambda c: (
                _worst(c),
                sum(1 for o in opts if o['compositions'].get(r) ==
                    c['comp']), -c['fit'], c['comp']))
            pick[r] = alt
            comp[r] = alt['comp']
        for role, c in pick.items():
            used.setdefault(role, {})
            used[role][c['comp']] = used[role].get(c['comp'], 0) + 1
        fit = sum(c['fit'] for c in pick.values()) / max(1, len(pick))
        opts.append({
            'id': f'{board}-{i + 1:02d}',
            'label': f"{hero['topology_id']} · "
                     f"{hero['recipe'].split('/')[-1] or hero['comp']}",
            'hero': {k: hero[k] for k in ('comp', 'recipe',
                                          'topology_id', 'fit')},
            'header': comp.get('header'),
            'compositions': comp,
            'recipes': {r: c['recipe'] for r, c in pick.items()},
            'fit': round(fit, 4)})
    return prog, pools, opts


# ------------------------------------------------------------ content
def _facts(ctx, copy):
    """Site-scope facts the plan carries — role-appropriate on every
    board (they are not any one page's prose)."""
    site = ctx.site_block() or {}
    slug = gate.page_path(ctx)[1]
    rows = {r.get('name'): r for _, r in ctx.rows(slug)}
    nav = next((r for r in rows.values()
                if r.get('category') == 'headers'), {}) or {}
    foot = next((r for r in rows.values()
                 if r.get('category') == 'footer'), {}) or {}
    cov = next((r for r in rows.values()
                if r.get('intent') == 'coverage'), {}) or {}
    closing = (copy or {}).get('closing') or {}
    links = (copy or {}).get('links_out') or []
    one = (site.get('intent') or {}).get('one_action')
    cta = closing.get('cta') or nav.get('cta')
    phone = closing.get('phone') or ''
    tel = next((it for it in foot.get('items') or []
                if str(it.get('href', '')).startswith('tel:')), None)
    colls = []
    for l in links:
        m = re.match(r'/([^/]+)/', str(l.get('href') or ''))
        if m and m.group(1) not in colls:
            colls.append(m.group(1))
    try:
        media = list((gate._brief(ctx).get('media') or []))
    except Exception:
        media = []
    return {
        'plan.site.brand': site.get('brand') or site.get('name'),
        'plan.cta': ({'label': one or cta.get('label'),
                      'href': cta.get('href')} if cta else None),
        'plan.phone': ({'label': phone or tel.get('label'),
                        'href': tel.get('href')} if (phone or tel)
                       else None),
        'plan.nav.items': nav.get('items') or [],
        'plan.footer.items': foot.get('items') or [],
        'plan.services': [{'term': l['anchor'], 'href': l['href']}
                          for l in links
                          if '/guides/' not in str(l.get('href'))
                          and l.get('anchor')],
        'plan.guides': [{'term': l['anchor'], 'href': l['href']}
                        for l in links
                        if '/guides/' in str(l.get('href'))],
        'plan.collections': [{'term': c.replace('-', ' ').capitalize(),
                              'href': f'/{c}/'} for c in colls],
        'plan.suburbs': [{'term': it.get('term'), 'icon': 'map-pin'}
                         for it in cov.get('items') or []
                         if it.get('term')],
        'brief.media': media,
    }


# per (board, role) → slot → fact key (None = lorem unless real copy)
FACT_SLOTS = {
    ('home', 'hero'): {'heading': 'plan.site.brand', 'cta': 'plan.cta'},
    ('home', 'services'): {'items': 'plan.services'},
    ('home', 'cta'): {'cta': 'plan.cta'},
    ('service', 'hero'): {'cta': 'plan.cta'},
    ('service', 'cta'): {'cta': 'plan.cta'},
    ('location', 'hero'): {'cta': 'plan.cta'},
    ('location', 'coverage'): {'items': 'plan.suburbs'},
    ('location', 'services'): {'items': 'plan.services'},
    ('location', 'contact'): {'cta': 'plan.phone'},
    ('contact', 'hero'): {'cta': 'plan.phone'},
    ('contact', 'form'): {'cta': 'plan.cta', 'phone': 'plan.phone'},
    ('contact', 'map'): {'items': 'plan.suburbs'},
    ('blog', 'featured'): {'items': 'plan.guides'},
    ('blog', 'listing'): {'items': 'plan.guides'},
    ('blog', 'categories'): {'items': 'plan.collections'},
}
_ITEM_ROLES = {'services', 'process', 'proof', 'stats', 'scope',
               'pricing', 'coverage', 'listing', 'featured',
               'categories', 'hours', 'map', 'benefits'}


def _real_block(copy, rows, role, taken):
    """The COPY.json block a role binds on the real-type board — by the
    plan row intent that cites it."""
    want = ROLE_INTENTS.get(role) or ()
    for r in rows:
        ref = str(r.get('copy_ref') or '')
        if r.get('intent') in want and re.fullmatch(r'b\d+', ref) \
                and ref not in taken:
            blk = next((b for b in copy.get('blocks') or []
                        if b.get('id') == ref), None)
            if blk:
                taken.add(ref)
                return blk, r
    return None, None


def bind(ctx, board, prog, copy):
    """{role: {'block': copy-block, 'row': row-extras, 'sources':
    {slot: source}}} — role-bound content, lorem where nothing
    role-appropriate exists. Real COPY prose only on the real board."""
    facts = _facts(ctx, copy)
    # home is the emitted page itself; any other board binds COPY prose
    # only when the copy's page type is that board's type
    real = bool(copy) and (board == 'home' or
                           PC.page_type_of(copy) == BOARD_TYPE[board])
    slug = gate.page_path(ctx)[1]
    rows = [r for _, r in ctx.rows(slug)]
    taken, out = set(), {}
    for role, _act, _cats, _cat in prog:
        src, seed = {}, f'{board}:{role}'
        blk = {'id': f'pb-{role}', 'h2': '', 'answer': '', 'before': [],
               'items': [], 'list_ordered': False, 'qa': [],
               'links': [], 'after': []}
        extra = {}
        if role in CHROME:
            key = 'plan.nav.items' if role == 'header' \
                else 'plan.footer.items'
            extra['items'] = facts[key]
            src['items'] = key
            if role == 'header' and facts['plan.phone']:
                extra['cta'] = facts['plan.phone']
                src['cta'] = 'plan.phone'
            out[role] = {'block': None, 'row': extra, 'sources': src}
            continue
        if real and role == 'hero':
            blk['h2'], blk['answer'] = copy.get('h1') or '', \
                copy.get('lede') or ''
            src['heading'], src['fs'] = 'COPY.json#h1', 'COPY.json#lede'
        elif real and role == 'cta' and (copy.get('closing') or {}) \
                .get('text'):
            blk['answer'] = copy['closing']['text']
            src['fs'] = 'COPY.json#closing'
        elif real and role in ROLE_INTENTS:
            rb, rr = _real_block(copy, rows, role, taken)
            if rb:
                for k in ('h2', 'answer', 'before', 'items',
                          'list_ordered', 'qa', 'links', 'after'):
                    if rb.get(k) is not None:
                        blk[k] = rb[k]
                ref = rb.get('id')
                src['heading'] = src['fs'] = f'COPY.json#{ref}'
                if rr.get('items') and not blk['items']:
                    blk['items'] = rr['items']
                if blk['items']:
                    src['items'] = f'COPY.json#{ref}'
                elif blk['before']:
                    # a prose block's terms are its card titles (the
                    # §4.3 mechanical fill pipeline_emit applies)
                    terms = rb.get('terms') or []
                    if terms:
                        blk['items'] = [{'term': t} for t in terms]
                        src['items'] = f'COPY.json#{ref}.terms'
                if blk['qa']:
                    src['qa'] = f'COPY.json#{ref}'
        for slot, key in (FACT_SLOTS.get((board, role)) or {}).items():
            val = facts.get(key)
            if not val or str(src.get(slot, '')).startswith('COPY.json'):
                continue
            if slot == 'heading':
                blk['h2'] = val
            elif slot == 'items':
                blk['items'] = list(val)
            elif slot == 'cta':
                extra['cta'] = val
            elif slot == 'phone':
                blk['items'] = [{'term': 'Phone', 'text': val['label'],
                                 'href': val['href']}] + blk['items']
            src[slot] = key
        # lorem — every role slot still unbound
        if not blk['h2']:
            blk['h2'] = _lorem(seed + ':h', 'heading')
            src['heading'] = 'lorem'
        if not blk['answer']:
            blk['answer'] = _lorem(seed + ':fs', 'fs')
            src['fs'] = 'lorem'
        if role in _ITEM_ROLES and not blk['items']:
            blk['items'] = [{'term': _lorem(f'{seed}:t{i}', 'term'),
                             'text': _lorem(f'{seed}:x{i}', 'text')}
                            for i in range(4)]
            src['items'] = 'lorem'
        elif blk['items'] and 'items' in src and src['items'] != 'lorem':
            # fact items carry a title only — their description slot
            # has no role content: lorem, recorded
            if not any(it.get('text') for it in blk['items']):
                for i, it in enumerate(blk['items']):
                    it = dict(it)
                    it['text'] = _lorem(f'{seed}:x{i}', 'text')
                    blk['items'][i] = it
                src['items.text'] = 'lorem'
        if role == 'faq' and not blk['qa']:
            blk['qa'] = [{'q': _lorem(f'{seed}:q{i}', 'q'),
                          'a': _lorem(f'{seed}:a{i}', 'a')}
                         for i in range(4)]
            blk['items'] = [{'title': q['q'], 'text': q['a']}
                            for q in blk['qa']]
            src['qa'] = 'lorem'
        if role in ('cta', 'contact', 'form', 'newsletter', 'hero') \
                and 'cta' not in extra:
            extra['cta'] = {'label': _lorem(seed + ':c', 'term'),
                            'href': '#'}
            src['cta'] = 'lorem'
        out[role] = {'block': blk, 'row': extra, 'sources': src}
    return out, real


# ------------------------------------------------------------- build
def _inputs_sha(ctx):
    pd = ctx.dir
    h = hashlib.sha256()
    for fn in ('COPY.json', 'DESIGN-PLAN.md', 'DNA.json',
               'ELEMENT-PICKS.json'):
        h.update(_sha(os.path.join(pd, fn)).encode())
    h.update(_sha(os.path.abspath(__file__)).encode())
    return h.hexdigest()[:16]


def render_sha(ctx, doc):
    """The built boards' cache key: the plan inputs plus everything the
    build copies or imports — brief media, tokens, the page site's
    shared src, the contracts cloned per section, the emitter and the
    option recipes' skeleton files."""
    h = hashlib.sha256((doc.get('inputs_sha') or '').encode())
    try:
        media = gate._brief(ctx).get('media') or []
    except Exception:
        media = []
    h.update(json.dumps(media, sort_keys=True, default=str).encode())
    files = [os.path.join(ctx.dir, 'TOKENS.json'),
             os.path.join(HERE, 'preview_build.py')]
    for sub in ('layouts', 'styles', '_shared', 'assets'):
        for root, _d, fns in os.walk(os.path.join(ctx.site, 'src', sub)):
            files += [os.path.join(root, f) for f in fns]
    sec = os.path.join(ctx.dir, 'sections')
    if os.path.isdir(sec):
        files += [os.path.join(sec, f) for f in os.listdir(sec)]
    recipes = {r for b in (doc.get('boards') or {}).values()
               for o in b.get('options') or []
               for r in (o.get('recipes') or {}).values() if r}
    for r in sorted(recipes):
        files += glob.glob(os.path.join(REPO, 'templates', 'skeletons',
                                        r + '.*'))
    for f in sorted(set(files)):
        h.update(f.encode())
        h.update(_sha(f).encode())
    return h.hexdigest()[:16]


def build(pd, excluded=None):
    excluded = dict(excluded or {})
    ctx = gate.Ctx(pd)
    copy = _json(os.path.join(ctx.dir, 'COPY.json'))
    genes = resolved_genes(ctx.dir)
    doc = {'generated_by': TOOL, 'inputs_sha': _inputs_sha(ctx),
           'genes': genes, 'excluded': excluded, 'boards': {}}
    for board in PROGRAM:
        prog, pools, opts = generate(board, genes, exclude=excluded)
        bound, real = bind(ctx, board, prog, copy)
        lorem_n = sum(1 for b in bound.values()
                      for s in b['sources'].values() if s == 'lorem')
        doc['boards'][board] = {
            'page_type': BOARD_TYPE[board],
            'real_copy': real,
            'plan': [{'role': r, 'act': a, 'categories': c,
                      'catalog': k,
                      'candidates': [x['comp'] for x in pools[r]]}
                     for r, a, c, k in prog],
            'content': bound,
            'lorem_slots': lorem_n,
            'options': opts}
    return doc


def ensure(pd, force=False, exclude=None):
    """PAGE-BOARDS.json, regenerated when any input moved. `exclude`
    {comp: reason} adds compositions the boards build could not render
    (kept across regenerations — a skeleton's render failure does not
    depend on the plan)."""
    ctx = gate.Ctx(pd)
    p = os.path.join(ctx.dir, 'PAGE-BOARDS.json')
    cur = _json(p)
    excluded = dict((cur or {}).get('excluded') or {})
    excluded.update(exclude or {})
    if not force and not exclude and cur and \
            cur.get('inputs_sha') == _inputs_sha(ctx):
        return cur
    doc = build(ctx.dir, excluded)
    with open(p, 'w', encoding='utf-8') as fh:
        fh.write(json.dumps(doc, indent=1, ensure_ascii=False) + '\n')
    return doc


def report(doc):
    """Acceptance lines per board: option count, distinct hero
    topology_ids, max pairwise section overlap (all / same-topology),
    lorem slots, slot→source map."""
    lines = []
    for board, b in doc['boards'].items():
        opts = b['options']
        roles = [p['role'] for p in b['plan']
                 if p['role'] not in CHROME + ('hero',)]
        topos = {o['hero']['topology_id'] for o in opts}
        mx = mx_same = 0.0
        for i, a in enumerate(opts):
            for c in opts[i + 1:]:
                ov = _overlap(a['compositions'], c['compositions'], roles)
                mx = max(mx, ov)
                if a['hero']['topology_id'] == c['hero']['topology_id']:
                    mx_same = max(mx_same, ov)
        heads = {o['header'] for o in opts}
        lines.append(f'{board:9s} options={len(opts)} '
                     f'hero_topologies={len(topos)} '
                     f'headers={len(heads)} '
                     f'max_overlap={mx:.2f} '
                     f'max_overlap_same_topology={mx_same:.2f} '
                     f'lorem_slots={b["lorem_slots"]} '
                     f'real_copy={b["real_copy"]}')
        for role, c in b['content'].items():
            lines.append(f'    {role:11s} ' + ', '.join(
                f'{k}←{v}' for k, v in sorted(c['sources'].items())))
    return '\n'.join(lines)


def main(argv):
    args = [a for a in argv[1:] if not a.startswith('--')]
    if len(args) != 1:
        sys.exit('usage: page_boards.py <page-dir> [--emit] [--force]')
    doc = ensure(os.path.abspath(args[0]), force='--force' in argv)
    print(report(doc))
    if '--emit' in argv:
        import preview_build
        print(preview_build.emit_page_boards(gate.Ctx(args[0])))


if __name__ == '__main__':
    main(sys.argv)
