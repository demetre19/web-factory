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
     role-appropriate source gets role-shaped placeholder copy built
     from the brand and topic (post titles, hours rows) — never
     another page's copy. Every slot records its source;
  3. options — candidates per role retrieved from the bricksmaven bank
     (+ catalog gold exemplars), ranked by retrieval.vibe_fit — the
     section bank ranked for the resolved vibe genes (DNA genotype
     overlaid by the signed vibe pick); a candidate scores its
     topology_id's best ranked row — top-k per role, then diversified:
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
# copies of the translated bank headers, so the bank rows cover them).
# nav-offcanvas / nav-mega-* are overlay PANELS (a drawer body with no
# brand bar or desktop link row), not headers — they never rotate
# into the header slot
_NAV_CATALOG = ['nav-bar', 'flyout-nav']


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
         ['link-grid']),
        ('map', 'detail', [], ['map-finder']),
        ('proof', 'proof', ['testimonials'], []),
        ('services', 'how', ['feature'], ['cards-n']),
        ('faq', 'objection', [], ['faq']),
        ('contact', 'act', ['contact'], ['contact-panel']),
        ('footer', 'chrome', ['footer'], ['footer-bar']),
    ],
    'contact': [
        ('header', 'chrome', ['headers'], _NAV_CATALOG),
        # a contact page opens on a page header or a form-led band
        ('hero', 'promise', ['header-page-sections', 'contact'], []),
        ('form', 'act', ['contact'], []),
        ('map', 'detail', [], ['map-finder']),
        ('hours', 'detail', ['counter'], ['text-index']),
        ('faq', 'objection', [], ['faq']),
        ('footer', 'chrome', ['footer'], ['footer-bar']),
    ],
    'blog': [
        ('header', 'chrome', ['headers'], _NAV_CATALOG),
        # a blog opens on a page header / article intro — never a
        # home-style media hero
        # (or opens straight on the post index: an archive intro + its
        # first post cards — the h1 is the blog's own title)
        ('hero', 'promise', ['header-page-sections', 'blog-archive'],
         ['hero-act-merge']),
        ('featured', 'detail', ['blog-section'], ['split-media']),
        # a post index pages: only listings whose query loop paginates
        ('listing', 'how', ['blog-archive', 'blog-section'], []),
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

# role-shaped placeholder copy — a slot with no role-appropriate plan
# content renders words shaped like the role (post titles, hours rows,
# attributions) built from the site's brand and topic; never another
# page's prose. Every such slot records source 'placeholder'.
_PH_HEAD = {
    ('home', 'hero'): '{topic}',
    ('home', 'services'): 'What {brand} looks after',
    ('home', 'process'): 'How a {brand} contract runs',
    ('home', 'proof'): 'What building managers say',
    ('home', 'stats'): '{brand} at a glance',
    ('home', 'cta'): 'Get a quote from {brand}',
    ('service', 'hero'): '{topic}',
    ('service', 'benefits'): 'Why committees choose {brand}',
    ('service', 'process'): 'How the service runs',
    ('service', 'scope'): "What's included",
    ('service', 'pricing'): 'Pricing and quotes',
    ('service', 'proof'): 'Results on recent buildings',
    ('service', 'faq'): '{topic} questions',
    ('service', 'cta'): 'Book a site walk-through',
    ('location', 'hero'): '{brand} across {area}',
    ('location', 'coverage'): 'Suburbs we cover',
    ('location', 'map'): 'Our service area',
    ('location', 'proof'): 'Trusted by local building managers',
    ('location', 'services'): 'Services in {area}',
    ('location', 'faq'): 'Questions from {area} buildings',
    ('location', 'contact'): 'Talk to the {area} team',
    ('contact', 'hero'): 'Contact {brand}',
    ('contact', 'form'): 'Request a quote',
    ('contact', 'map'): 'Where we work',
    ('contact', 'hours'): 'Office hours',
    ('contact', 'faq'): 'Before you get in touch',
    ('blog', 'hero'): '{topic} guides and news',
    ('blog', 'featured'): 'Featured guide',
    ('blog', 'listing'): 'Latest articles',
    ('blog', 'categories'): 'Browse by topic',
    ('blog', 'newsletter'): 'Cleaning tips from {brand}, monthly',
}
_PH_FS = {
    'hero': '{brand}: scheduled visits, one coordinator and a report '
            'after every visit.',
    'services': 'Every area on one scope, cleaned on the schedule your '
                'committee signs off.',
    'benefits': 'One contact, one schedule and a visit report your '
                'committee can check.',
    'process': 'From the first walk-through to the monthly report, '
               'each step is written down.',
    'scope': 'The areas and tasks every scheduled visit covers.',
    'pricing': 'Every quote follows a free site walk-through — no '
               'surprises on the invoice.',
    'proof': 'What building managers say after the first months.',
    'stats': 'The numbers behind a {brand} contract.',
    'cta': 'Tell us about the building and we will book a '
           'walk-through.',
    'coverage': '{brand} crews work across {area} every week.',
    'contact': 'Call or send the form — a local coordinator replies '
               'the same business day.',
    'form': 'Tell us about the building — we reply within one business '
            'day.',
    'map': 'Crews based across {area}, scheduled by suburb.',
    'hours': 'Phones and email are answered during these hours.',
    'faq': 'Straight answers to what committees ask before they sign.',
    'featured': 'The guide committees read before they change '
                'cleaners.',
    'listing': 'Practical articles from the {brand} team.',
    'categories': 'Find articles by the question you are trying to '
                  'answer.',
    'newsletter': 'One email a month with checklists and schedule '
                  'tips. No spam.',
}
_PH_POSTS = ('How often should common areas be cleaned?',
             'A cleaning checklist for committees',
             'Choosing a cleaning contractor',
             'What a cleaning quote should include',
             'Common-area hygiene between visits',
             'Preparing the building for an inspection',
             'Carpark and bin-room cleaning explained',
             'Reading a cleaning visit report')
_PH_TAGS = ('Guides', 'Checklists', 'Compliance', 'News')
_PH_ITEMS = {
    'process': [('Site walk-through', 'We inspect every common area '
                 'with the building manager.'),
                ('Fixed scope and quote', 'Areas, tasks and frequency '
                 'agreed in writing.'),
                ('Scheduled visits', 'The same crew on the same days '
                 'each week.'),
                ('Visit report', 'Photos and notes after every visit.')],
    'scope': [('Foyers and lobbies', 'Floors, glass, letterboxes and '
               'touch points.'),
              ('Lifts', 'Doors, panels, mirrors and tracks.'),
              ('Carparks', 'Sweeping, spot cleaning and bin areas.'),
              ('Amenities', 'Bathrooms, gyms and shared rooms.')],
    'pricing': [('Weekly contract', 'Scheduled visits with a monthly '
                 'report.', 'Quote after walk-through'),
                ('Periodic deep clean', 'Carpet, pressure washing and '
                 'high areas.', 'Quarterly or yearly'),
                ('One-off clean', 'Move-ins, events and inspections.',
                 'Fixed price')],
    'proof': [('Building manager · {suburb0}', '"Complaints stopped within the '
               'first month."', '{suburb0}'),
              ('Strata committee chair · {suburb1}', '"The visit reports make our '
               'meetings shorter."', '{suburb1}'),
              ('Facility manager · {suburb2}', '"Same crew every week — they know '
               'the building."', '{suburb2}')],
    'stats': [('Weekly', 'scheduled visits'),
              ('1 report', 'after every visit'),
              ('Eco', 'cleaning products'),
              ('Audited', 'visit quality')],
    'hours': [('Monday – Friday', '7:00 am – 6:00 pm'),
              ('Saturday', '8:00 am – 1:00 pm'),
              ('Sunday', 'Closed'),
              ('After-hours', 'Emergency line for contracted '
               'buildings')],
    'benefits': [('One point of contact', 'A coordinator who knows '
                  'your building.'),
                 ('Fixed schedule', 'Visits on agreed days, never '
                  'skipped.'),
                 ('Proof of work', 'A report after every visit.')],
}
_PH_QA = [('How often should common areas be cleaned?',
           'Most buildings need weekly visits; busy foyers and bin '
           'rooms may need more.'),
          ('Do you work after hours?',
           'Yes — visits can be scheduled early, late or on weekends.'),
          ('What does a quote include?',
           'Every area, task and frequency, agreed after a free '
           'walk-through.'),
          ('How do we raise a complaint?',
           'Call or email your coordinator — issues are fixed on the '
           'next visit or sooner.')]


def _ph_vars(facts, _copy=None):
    brand = facts.get('plan.site.brand') or 'The team'
    topic = (facts.get('plan.topic') or brand).strip()
    subs = [s['term'] for s in facts.get('plan.suburbs') or []]
    area = facts.get('plan.area') or (' & '.join(subs[:2]) if subs
                                       else 'your area')
    ph = facts.get('plan.phone') or {}
    return {'brand': brand, 'topic': topic, 'topic_l': topic.lower(),
            'area': area, 'suburbs': subs,
            'email': facts.get('plan.email') or 'hello@' + (
                facts.get('plan.site.domain') or 'example.com'),
            'phone': ph.get('label') or '(03) 0000 0000'}


def _ph(tpl, v, i=0):
    subs = v['suburbs'] or [v['area']]
    return tpl.format(brand=v['brand'], topic=v['topic'],
                      topic_l=v['topic_l'], area=v['area'],
                      suburb0=subs[0 % len(subs)],
                      suburb1=subs[1 % len(subs)],
                      suburb2=subs[2 % len(subs)])


def _ph_posts(v, titles=None, n=6):
    """post cards: title, excerpt, author · date · read time, tag."""
    titles = list(titles or []) + [_ph(t, v) for t in _PH_POSTS]
    out = []
    for i, t in enumerate(titles[:n]):
        out.append({'term': t[:1].upper() + t[1:],
                    'text': _ph(_PH_FS['listing'], v),
                    'meta': f"{v['brand']} team · {2 + i * 3} "
                            f"{('Mar', 'Feb', 'Jan')[i % 3]} 2026 · "
                            f'{4 + i % 4} min read',
                    'tag': _PH_TAGS[i % len(_PH_TAGS)]})
    return out


def _ph_items(board, role, v, facts):
    if role in ('listing', 'featured'):
        return _ph_posts(v, n=1 if role == 'featured' else 6)
    if role == 'categories':
        return [{'term': t, 'text': f'{3 + i * 2} articles'}
                for i, t in enumerate(_PH_TAGS)]
    if role in ('coverage', 'map'):
        return [{'term': s, 'icon': 'map-pin'}
                for s in (v['suburbs'] or [v['area']])]
    if role == 'services':
        return [{'term': t, 'text': x} for t, x in _PH_ITEMS['scope']]
    rows = _PH_ITEMS.get(role) or _PH_ITEMS['benefits']
    if role == 'hours':
        # the contact board's details: hours + how to reach the office
        rows = rows + [('Email', v['email']), ('Phone', v['phone'])]
    out = []
    for r in rows:
        it = {'term': _ph(r[0], v), 'text': _ph(r[1], v)}
        if len(r) > 2:
            it['tag'] = _ph(r[2], v)
        if role == 'stats':
            it['stat'] = it['term']
        out.append(it)
    return out


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


# bricksmaven category → section-bank family vibe_fit ranks inside
_SECTION_TYPE = {'headers': 'nav', 'hero': 'hero',
                 'header-page-sections': 'hero', 'footer': 'footer',
                 'call-to-action': 'call-to-action',
                 'testimonials': 'testimonials', 'faq': 'faq',
                 'pricing': 'pricing', 'contact': 'contact',
                 'feature': 'feature', 'grids-and-cards': 'grids-and-cards',
                 'gallery': 'gallery', 'teams': 'teams',
                 'logo-sections': 'logo-sections'}
_TAG_COMP = {
    'grid-1col-uniform': 'stacked', 'grid-2col-uniform': 'column-2',
    'grid-3col-uniform': 'column-3', 'grid-4col-uniform': 'column-4+',
    'grid-5col-uniform': 'column-4+', 'grid-6col-uniform': 'column-4+',
    'split-50-50': 'column-2', 'band-media': 'full-bleed',
    'band-strip': 'centered', 'list-vertical-rows': 'stacked',
    'list-cards': 'grid-uniform', 'hero-media-right': 'split-right-media',
    'hero-media-left': 'split-left-media', 'hero-media-bg': 'full-bleed',
    'hero-media-top': 'stacked', 'hero-no-media': 'centered'}


def _cand_tags(topology_id, sig):
    """A bank skeleton's style_tags, read off its own topo sidecar
    (topology_id + element signature) in the vector bank's tag
    vocabulary — so retrieval scores it on the same axes it scores
    bank rows."""
    img, btn = sig.get('img', 0), sig.get('btn', 0)
    comp = _TAG_COMP.get(topology_id, 'centered')
    n = sum(v for v in sig.values() if isinstance(v, int))
    return {
        'composition': comp,
        'media_role': ('background-photo' if img and comp == 'full-bleed'
                       else 'photo-collage' if img >= 3
                       else 'hero-image' if img else 'none'),
        'height_band': ('short-under-300' if n <= 4 else
                        'standard-300-700' if n <= 12 else
                        'tall-700-1400'),
        'text_role': ('headline-subhead-cta' if btn and sig.get('p')
                      else 'list-led' if sig.get('h', 0) >= 4
                      else 'headline-only' if not sig.get('p')
                      else 'headline-subhead'),
    }


def _fit(cats, topology_id, genes, rec=''):
    """retrieval's vibe meta score of one candidate — its own tags
    (_cand_tags) against the genes and the topology they ask for."""
    if not genes:
        return 0.0
    import retrieval
    st = next((_SECTION_TYPE[c] for c in cats if c in _SECTION_TYPE),
              'content')
    sig = {}
    if rec.startswith('bricksmaven/'):
        _p, cat, stem = rec.split('/')
        sig = (_json(os.path.join(BANK, cat, stem + '.topo.json')) or {}) \
            .get('element_sig') or {}
    row = {'render_path': rec or topology_id,
           'topo': {'topology_id': topology_id},
           'style_tags': _cand_tags(topology_id, sig)}
    return round(retrieval._meta_score(
        genes, row, retrieval.vibe_topology(genes, st), st), 4)


def _topo(recipe):
    _p, cat, stem = recipe.split('/')
    return (_json(os.path.join(BANK, cat, stem + '.topo.json')) or {}) \
        .get('topology_id') or 'unknown'


# the controls a role's skeleton must already carry (gate BRR.1 checks
# the same in the build): a post index pages and its cards read
# author · date · read time + tag, a contact form asks
# phone + message and submits
# Bricks builder scaffolding ("remove this div") is not a section
_SCAFFOLD = re.compile(r'remove-this|take-out|remove-contents')
_ROLE_NEEDS = {'listing': ('aria-label="Pagination"', '.meta', '.tag'),
               'form': ('type="email"', 'type="tel"', '<textarea',
                        'type="submit"')}


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
            if _SCAFFOLD.search(stem):
                continue
            src = open(os.path.join(d, fn), encoding='utf-8').read()
            if '<form' in src and not re.search(r'<input|<textarea', src):
                continue   # a form with no controls asks nothing
            need = _ROLE_NEEDS.get(role)
            if need and not all(n in src for n in need):
                continue
            topo = _topo(rec)
            out.append({'comp': f'bm-{cat}-{stem}', 'recipe': rec,
                        'topology_id': topo,
                        'fit': _fit([cat], topo, genes, rec)})
    for comp in catalog:
        if comp in exclude:
            continue
        if not os.path.isfile(os.path.join(CATALOG, comp,
                                           gate.camel(comp) + '.astro')):
            continue
        rec = gate.RECIPE_FOR_COMP.get(comp) or ''
        topo = _HERO_CATALOG_TOPO.get(comp) or (
            _topo(rec) if rec.startswith('bricksmaven/') else comp)
        out.append({'comp': comp, 'recipe': rec, 'topology_id': topo,
                    'fit': _fit(cats, topo, genes, rec)})
    out.sort(key=lambda c: (-c['fit'], c['comp']))
    return out


# what makes a hero belong to a page type, read off the skeleton's own
# element signature: home promises + acts (buttons, no list); service
# lists its scope (ul/icons); location links its area (links / a
# quote form); contact asks (contact category / a form); blog opens
# an index (archive / page header). Catalog heroes are home's.
_HERO_CUE = {
    'home': lambda s, cat: not cat or (bool(s.get('btn'))
                                       and not s.get('ul')),
    'service': lambda s, cat: bool(s.get('ul') or s.get('icn')),
    'location': lambda s, cat: bool(s.get('a') or s.get('form')),
    'contact': lambda s, cat: cat == 'contact' or bool(s.get('form')),
    'blog': lambda s, cat: cat in ('blog-archive',
                                   'header-page-sections'),
}
_POOLS = {}


def _sig(rec):
    if not rec.startswith('bricksmaven/'):
        return {}, ''
    _p, cat, stem = rec.split('/')
    return ((_json(os.path.join(BANK, cat, stem + '.topo.json')) or {})
            .get('element_sig') or {}), cat


def hero_pools(genes, exclude=()):
    """{board: [hero candidate]} — disjoint per page type. Every board
    drafts in turn from its own hero candidates (its program's hero
    categories): role-cue match first, then the topology it has least
    of, then vibe fit. A skeleton one board drafted is gone for the
    rest, so no two boards open on the same pool or rotation."""
    key = (json.dumps(genes or {}, sort_keys=True), tuple(sorted(exclude)))
    if key in _POOLS:
        return _POOLS[key]
    cands = {}
    for b in PROGRAM:
        role, _a, cats, catalog = next(r for r in _program(b)
                                       if r[0] == 'hero')
        cands[b] = _candidates(role, cats, catalog, genes, exclude)
    pools, taken = {b: [] for b in PROGRAM}, set()
    for _round in range(N_OPTIONS):
        for b in PROGRAM:
            left = [c for c in cands[b] if (c['recipe'] or c['comp'])
                    not in taken]
            if not left:
                continue
            topo = {}
            for c in pools[b]:
                topo[c['topology_id']] = topo.get(c['topology_id'], 0) + 1

            def _rank(c, b=b, topo=topo):
                sg, cat = _sig(c['recipe'])
                return (not _HERO_CUE[b](sg, cat),
                        topo.get(c['topology_id'], 0), -c['fit'],
                        c['comp'])
            best = min(left, key=_rank)
            pools[b].append(best)
            taken.add(best['recipe'] or best['comp'])
    _POOLS[key] = pools
    return pools


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


def signed_chrome(pd):
    """{role: comp} — the header / footer the operator signed in
    ELEMENT-PICKS.json (the emitted page's BaseLayout chrome). Page
    boards wear it on every option; header variety is its own board."""
    picks = (_json(os.path.join(pd, 'ELEMENT-PICKS.json')) or {}) \
        .get('picks') or []
    out = {}
    for p in picks:
        role = p.get('element')
        if role in CHROME and p.get('variant') and os.path.isfile(
                os.path.join(CATALOG, p['variant'],
                             gate.camel(p['variant']) + '.astro')):
            out[role] = p['variant']
    return out


def generate(board, genes, n=N_OPTIONS, exclude=(), chrome=None):
    prog = _program(board)
    pools = {}
    for role, _act, cats, catalog in prog:
        if role in (chrome or {}):
            comp = chrome[role]
            pools[role] = [{'comp': comp,
                            'recipe': gate.RECIPE_FOR_COMP.get(comp) or '',
                            'topology_id': comp, 'fit': 0.0}]
            continue
        c = _candidates(role, cats, catalog, genes, exclude)
        pools[role] = c if role in ('hero', 'header', 'footer') \
            else c[:TOP_K]
    pools['hero'] = hero_pools(genes, exclude)[board]
    shift = list(PROGRAM).index(board)
    heroes = _hero_order(pools['hero'])
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
            # a skeleton already carrying the hero never repeats below
            pool = [c for c in pool if c['comp'] != hero['comp']] or pool
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
        brief = gate._brief(ctx) or {}
    except Exception:
        brief = {}
    media = list(brief.get('media') or [])
    return {
        'plan.site.brand': site.get('brand') or site.get('name'),
        # the site's service topic (its primary query) names what every
        # board is about — a fact, not any one page's prose
        'plan.topic': (copy or {}).get('h1') or site.get('name'),
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
        'plan.email': (brief.get('brand') or {}).get('email')
        if isinstance(brief.get('brand'), dict) else None,
        'plan.site.domain': re.sub(r'^https?://(www\.)?', '', str(
            (brief.get('site') or {}).get('url') or '')).strip('/'),
    }


# per (board, role) → slot → fact key (else placeholder unless real copy)
FACT_SLOTS = {
    ('home', 'hero'): {'heading': 'plan.site.brand', 'cta': 'plan.cta'},
    ('home', 'services'): {'items': 'plan.services'},
    ('home', 'cta'): {'cta': 'plan.cta'},
    ('service', 'hero'): {'cta': 'plan.cta'},
    ('service', 'cta'): {'cta': 'plan.cta'},
    ('location', 'hero'): {'cta': 'plan.cta'},
    ('location', 'coverage'): {'items': 'plan.suburbs'},
    ('location', 'map'): {'items': 'plan.suburbs'},
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
    {slot: source}}} — role-bound content, role-shaped placeholder
    where nothing role-appropriate exists. Real COPY prose only on the real board."""
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
        # role-shaped placeholder — every role slot still unbound
        v = _ph_vars(facts, None)
        if not blk['h2']:
            blk['h2'] = _ph(_PH_HEAD.get((board, role))
                            or role.replace('-', ' ').capitalize(), v)
            src['heading'] = 'placeholder'
        if not blk['answer']:
            blk['answer'] = _ph(_PH_FS.get(role) or _PH_FS['hero'], v)
            src['fs'] = 'placeholder'
        if board == 'blog' and role == 'hero' and not blk['items']:
            # a post-index first screen lists the newest posts
            guides = [it.get('term') for it in facts['plan.guides']]
            blk['items'] = _ph_posts(v, guides, n=3)
            src['items'] = 'plan.guides+placeholder' if guides \
                else 'placeholder'
        if role in _ITEM_ROLES and not blk['items']:
            blk['items'] = _ph_items(board, role, v, facts)
            src['items'] = 'placeholder'
        elif blk['items'] and src.get('items') not in (None, 'placeholder'):
            # fact items carry a title only — posts get excerpt + meta
            # + tag, other rows a role-shaped description
            if not any(it.get('text') for it in blk['items']):
                if role in ('listing', 'featured'):
                    blk['items'] = _ph_posts(
                        v, [it.get('term') for it in blk['items']],
                        n=1 if role == 'featured' else
                        max(3, len(blk['items'])))
                else:
                    blk['items'] = [dict(it, text=_ph(
                        _PH_FS.get(role) or _PH_FS['services'], v))
                        for it in blk['items']]
                src['items.text'] = 'placeholder'
        if role == 'faq' and not blk['qa']:
            blk['qa'] = [{'q': q, 'a': a} for q, a in _PH_QA]
            blk['items'] = [{'title': q['q'], 'text': q['a']}
                            for q in blk['qa']]
            src['qa'] = 'placeholder'
        if role in ('cta', 'contact', 'form', 'newsletter', 'hero') \
                and 'cta' not in extra:
            extra['cta'] = {'label': {'newsletter': 'Subscribe',
                                      'hero': 'Read the latest'}
                            .get(role, 'Get a quote'), 'href': '#'}
            src['cta'] = 'placeholder'
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
             os.path.join(ctx.dir, 'LAYOUT-OPTIONS.json'),
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
    # the Header·Footer board's lo-chrome-<comp> pages copy each
    # allowed nav/footer class's gold exemplar
    allowed = (_json(os.path.join(ctx.dir, 'LAYOUT-OPTIONS.json'))
               or {}).get('allowed') or {}
    for comp in set((allowed.get('nav') or [])
                    + (allowed.get('footer') or [])):
        files += glob.glob(os.path.join(REPO, 'templates', 'sections',
                                        comp, '*.astro'))
    for f in sorted(set(files)):
        h.update(f.encode())
        h.update(_sha(f).encode())
    return h.hexdigest()[:16]


def build(pd, excluded=None):
    excluded = dict(excluded or {})
    ctx = gate.Ctx(pd)
    copy = _json(os.path.join(ctx.dir, 'COPY.json'))
    genes = resolved_genes(ctx.dir)
    chrome = signed_chrome(ctx.dir)
    doc = {'generated_by': TOOL, 'inputs_sha': _inputs_sha(ctx),
           'genes': genes, 'excluded': excluded, 'boards': {}}
    for board in PROGRAM:
        prog, pools, opts = generate(board, genes, exclude=excluded,
                                     chrome=chrome)
        bound, real = bind(ctx, board, prog, copy)
        ph_n = sum(1 for b in bound.values()
                   for s in b['sources'].values() if s == 'placeholder')
        doc['boards'][board] = {
            'page_type': BOARD_TYPE[board],
            'real_copy': real,
            'plan': [{'role': r, 'act': a, 'categories': c,
                      'catalog': k,
                      'candidates': [x['comp'] for x in pools[r]]}
                     for r, a, c, k in prog],
            'content': bound,
            'placeholder_slots': ph_n,
            'options': opts}
    return doc


# exclusion reasons the retired boards render probe recorded
PROBE_REASONS = ('navprobe@', 'overflows 390px', 'renders no h1',
                 'mints a second h1')


def ensure(pd, force=False, exclude=None):
    """PAGE-BOARDS.json, regenerated when any input moved. `exclude`
    {comp: reason} adds compositions the boards build could not render
    (kept across regenerations — a skeleton's render failure does not
    depend on the plan)."""
    ctx = gate.Ctx(pd)
    p = os.path.join(ctx.dir, 'PAGE-BOARDS.json')
    cur = _json(p)
    excluded = dict((cur or {}).get('excluded') or {})
    if not force and not exclude and cur and \
            cur.get('inputs_sha') == _inputs_sha(ctx):
        return cur
    # render verdicts are gate.py's (BR.*), never a producer filter —
    # scrub any probe exclusion an older build recorded
    excluded = {c: w for c, w in excluded.items()
                if not w.startswith(PROBE_REASONS)}
    excluded.update(exclude or {})
    doc = build(ctx.dir, excluded)
    with open(p, 'w', encoding='utf-8') as fh:
        fh.write(json.dumps(doc, indent=1, ensure_ascii=False) + '\n')
    return doc


def report(doc):
    """Acceptance lines per board: option count, distinct hero
    topology_ids, max pairwise section overlap (all / same-topology),
    placeholder slots, slot→source map."""
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
                     f'placeholder_slots={b["placeholder_slots"]} '
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
