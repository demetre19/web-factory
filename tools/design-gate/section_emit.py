#!/usr/bin/env python3
"""Canonical section emitter — structural variants keyed by the
section bank's topology_id vocabulary. Each emitter = a different
STRUCTURE (not a reskin); theme_sheet binds the style on top.

  emit(topology_or_type, dna, vibe_overrides) -> markup

Every visual value flows through TW4 semantic tokens + the DNA
spacing vars (--section-py, --gap, --space-container). No fixed
spacing classes, no hardcoded colours.
"""
import html as _html


def _e(s):
    return _html.escape(str(s or ''), quote=True)


SECTION_PY = 'py-[var(--section-py,5rem)]'
GAP = 'gap-[var(--gap,2rem)]'
CONT = 'mx-auto max-w-[var(--space-container,72rem)]'


# ------------------------------------------------------------ nav
def nav_top_bar(dna, v):
    links = (''.join(f'<a class="text-sm text-body hover:text-heading"'
                     f' href="#">{_e(t)}</a>'
                     for t in v.get('links', ('Work', 'About', 'Contact'))))
    return f'''<nav class="border-b border-default bg-neutral-primary">
  <div class="{CONT} flex items-center justify-between px-6 py-4">
    <a href="#" class="text-lg font-semibold text-heading">{_e(v.get('logo', 'Brand'))}</a>
    <div class="hidden {GAP} md:flex">{links}</div>
    <a href="#" class="rounded-base bg-brand px-4 py-2 text-sm font-medium text-white">{_e(dna['cta'])}</a>
  </div>
</nav>'''


def nav_sidebar_hint(dna, v):
    return f'''<header class="flex items-center justify-between border-b border-default bg-neutral-primary px-6 py-3">
  <div class="text-base font-semibold text-heading">{_e(v.get('logo', 'Brand'))}</div>
  <a href="#" class="text-sm text-fg-brand-strong">Menu →</a>
</header>'''


# ------------------------------------------------------------ hero
def hero_centered(dna, v):
    h, l = dna['copy']
    return f'''<section class="bg-neutral-primary px-6 text-center {SECTION_PY}">
  <div class="{CONT} max-w-3xl">
    <p class="mb-4 text-xs font-semibold uppercase tracking-widest text-fg-brand-strong">{_e(v.get('kicker', 'New'))}</p>
    <h1 class="text-5xl font-semibold tracking-tight text-heading">{_e(h)}</h1>
    <p class="mt-6 text-lg text-body">{_e(l)}</p>
    <div class="mt-10 flex items-center justify-center {GAP}">
      <a href="#" class="rounded-base bg-brand px-6 py-3 text-sm font-medium text-white">{_e(dna['cta'])}</a>
      <a href="#" class="text-sm font-medium text-heading underline underline-offset-4">{_e(v.get('secondary', 'Learn more'))}</a>
    </div>
  </div>
</section>'''


def hero_media_right(dna, v):
    h, l = dna['copy']
    return f'''<section class="bg-neutral-primary px-6 {SECTION_PY}">
  <div class="{CONT} grid items-center {GAP} md:grid-cols-2">
    <div>
      <h1 class="text-4xl font-semibold tracking-tight text-heading">{_e(h)}</h1>
      <p class="mt-5 text-base text-body">{_e(l)}</p>
      <a href="#" class="mt-8 inline-flex rounded-base bg-brand px-5 py-2.5 text-sm font-medium text-white">{_e(dna['cta'])}</a>
    </div>
    <div class="aspect-[4/3] rounded-lg bg-neutral-primary-soft"></div>
  </div>
</section>'''


def hero_media_bg(dna, v):
    h, l = dna['copy']
    return f'''<section class="relative overflow-hidden px-6 {SECTION_PY} bg-brand">
  <div class="absolute inset-0 bg-neutral-primary-soft opacity-30"></div>
  <div class="relative {CONT} max-w-2xl">
    <h1 class="text-5xl font-semibold tracking-tight text-white">{_e(h)}</h1>
    <p class="mt-5 text-lg text-white/85">{_e(l)}</p>
    <a href="#" class="mt-8 inline-flex rounded-base bg-white px-6 py-3 text-sm font-medium text-heading">{_e(dna['cta'])}</a>
  </div>
</section>'''


def hero_media_top(dna, v):
    h, l = dna['copy']
    return f'''<section class="bg-neutral-primary {SECTION_PY}">
  <div class="{CONT} px-6 text-center">
    <h1 class="text-4xl font-semibold tracking-tight text-heading">{_e(h)}</h1>
    <p class="mx-auto mt-4 max-w-xl text-base text-body">{_e(l)}</p>
    <a href="#" class="mt-6 inline-flex rounded-base bg-brand px-5 py-2.5 text-sm font-medium text-white">{_e(dna['cta'])}</a>
  </div>
  <div class="{CONT} mt-10 aspect-[16/7] rounded-lg bg-neutral-primary-soft"></div>
</section>'''


def hero_no_media(dna, v):
    h, l = dna['copy']
    return f'''<section class="bg-neutral-primary px-6 {SECTION_PY}">
  <div class="{CONT} max-w-2xl">
    <h1 class="text-4xl font-semibold tracking-tight text-heading">{_e(h)}</h1>
    <p class="mt-5 text-lg text-body">{_e(l)}</p>
    <a href="#" class="mt-8 inline-flex rounded-base bg-brand px-5 py-2.5 text-sm font-medium text-white">{_e(dna['cta'])}</a>
  </div>
</section>'''


# ------------------------------------------------------------ features
def grid_3col_uniform(dna, v):
    h, l = dna['copy']
    feats = v.get('features', (
        ('Structured, not decorated', 'Spacing is a token, not a taste.'),
        ('Retrieval over generation', 'Structure comes from the bank.'),
        ('Provenance on every knob', 'Each token reports its sample.')))
    cards = ''.join(
        f'''<div class="rounded-base border border-default bg-neutral-primary-soft p-6">
      <h3 class="text-base font-semibold text-heading">{_e(t)}</h3>
      <p class="mt-2 text-sm text-body">{_e(d)}</p></div>'''
        for t, d in feats)
    return f'''<section class="bg-neutral-primary px-6 {SECTION_PY}">
  <div class="{CONT}">
    <h2 class="text-3xl font-semibold tracking-tight text-heading">{_e(h)}</h2>
    <p class="mt-3 max-w-2xl text-base text-body">{_e(l)}</p>
    <div class="mt-12 grid {GAP} sm:grid-cols-2 lg:grid-cols-3">{cards}</div>
  </div>
</section>'''


def grid_2col_uniform(dna, v):
    h, l = dna['copy']
    feats = v.get('features', (
        ('Structured, not decorated', 'Spacing is a token.'),
        ('Retrieval over generation', 'Structure from the bank.')))
    cards = ''.join(
        f'''<div class="rounded-base border border-default bg-neutral-primary-soft p-8">
      <h3 class="text-lg font-semibold text-heading">{_e(t)}</h3>
      <p class="mt-3 text-sm text-body">{_e(d)}</p></div>'''
        for t, d in feats)
    return f'''<section class="bg-neutral-primary px-6 {SECTION_PY}">
  <div class="{CONT} max-w-4xl">
    <h2 class="text-3xl font-semibold tracking-tight text-heading">{_e(h)}</h2>
    <div class="mt-10 grid {GAP} sm:grid-cols-2">{cards}</div>
  </div>
</section>'''


def list_vertical_rows(dna, v):
    h, _ = dna['copy']
    rows = ''.join(
        f'''<div class="flex items-baseline justify-between border-b border-default py-5">
      <div><div class="text-base font-semibold text-heading">{_e(t)}</div>
      <div class="text-sm text-body">{_e(d)}</div></div>
      <span class="text-fg-brand-strong">→</span></div>'''
        for t, d in v.get('features', (
            ('Structured, not decorated', 'Spacing is a token.'),
            ('Retrieval over generation', 'Structure from the bank.'),
            ('Provenance on every knob', 'Token reports its sample.'))))
    return f'''<section class="bg-neutral-primary px-6 {SECTION_PY}">
  <div class="{CONT} max-w-3xl">
    <h2 class="text-3xl font-semibold tracking-tight text-heading">{_e(h)}</h2>
    <div class="mt-10">{rows}</div>
  </div>
</section>'''


def split_50_50(dna, v):
    h, l = dna['copy']
    return f'''<section class="bg-neutral-primary px-6 {SECTION_PY}">
  <div class="{CONT} grid items-center {GAP} md:grid-cols-2">
    <div class="aspect-square rounded-lg bg-neutral-primary-soft"></div>
    <div>
      <h2 class="text-3xl font-semibold tracking-tight text-heading">{_e(h)}</h2>
      <p class="mt-4 text-base text-body">{_e(l)}</p>
      <a href="#" class="mt-6 inline-flex rounded-base bg-brand px-5 py-2.5 text-sm font-medium text-white">{_e(dna['cta'])}</a>
    </div>
  </div>
</section>'''


# ------------------------------------------------------------ band / cta
def band_strip(dna, v):
    h, _ = dna['copy']
    return f'''<section class="bg-neutral-primary-soft px-6 {SECTION_PY}">
  <div class="{CONT} flex flex-wrap items-center justify-between {GAP}">
    <h2 class="text-2xl font-semibold tracking-tight text-heading">{_e(h)}</h2>
    <a href="#" class="rounded-base bg-brand px-6 py-3 text-sm font-medium text-white">{_e(dna['cta'])}</a>
  </div>
</section>'''


def cta_panel(dna, v):
    h, _ = dna['copy']
    return f'''<section class="bg-neutral-primary-soft px-6 {SECTION_PY}">
  <div class="{CONT} max-w-4xl rounded-lg bg-brand px-8 py-14 text-center">
    <h2 class="text-3xl font-semibold tracking-tight text-white">{_e(h)}</h2>
    <p class="mx-auto mt-4 max-w-xl text-base text-white/85">{_e(v.get('sub', 'Start now — it takes a minute.'))}</p>
    <a href="#" class="mt-8 inline-flex rounded-base bg-white px-6 py-3 text-sm font-medium text-heading">{_e(dna['cta'])}</a>
  </div>
</section>'''


def band_media(dna, v):
    h, _ = dna['copy']
    return f'''<section class="relative overflow-hidden {SECTION_PY} bg-brand">
  <div class="absolute inset-0 bg-neutral-primary-soft opacity-25"></div>
  <div class="relative {CONT} px-6 text-center">
    <h2 class="text-3xl font-semibold tracking-tight text-white">{_e(h)}</h2>
    <a href="#" class="mt-6 inline-flex rounded-base bg-white px-6 py-3 text-sm font-medium text-heading">{_e(dna['cta'])}</a>
  </div>
</section>'''


# ------------------------------------------------------------ pricing
def pricing_2(dna, v):
    h, l = dna['copy']
    tiers = ''.join(
        f'''<div class="rounded-base border border-default bg-neutral-primary-soft p-8">
      <h3 class="text-sm font-semibold uppercase text-fg-brand-strong">{_e(t)}</h3>
      <div class="mt-4 text-4xl font-semibold text-heading">{_e(p)}</div>
      <ul class="mt-6 space-y-2 text-sm text-body">
        {''.join(f'<li>{_e(x)}</li>' for x in feats)}</ul>
      <a href="#" class="mt-8 block rounded-base bg-brand px-4 py-2.5 text-center text-sm font-medium text-white">{_e(dna['cta'])}</a>
    </div>''' for t, p, feats in v.get('tiers', (
        ('Starter', '$0', ('One project', 'Community bank')),
        ('Pro', '$19', ('All kits', 'Priority classify')))))
    return f'''<section class="bg-neutral-primary px-6 {SECTION_PY}">
  <div class="{CONT} max-w-4xl text-center">
    <h2 class="text-3xl font-semibold tracking-tight text-heading">{_e(h)}</h2>
    <p class="mt-3 text-base text-body">{_e(l)}</p>
    <div class="mt-12 grid {GAP} sm:grid-cols-2">{tiers}</div>
  </div>
</section>'''


def pricing_3(dna, v):
    h, l = dna['copy']
    tiers = ''.join(
        f'''<div class="rounded-base border border-default bg-neutral-primary-soft p-6">
      <h3 class="text-sm font-semibold uppercase text-fg-brand-strong">{_e(t)}</h3>
      <div class="mt-3 text-3xl font-semibold text-heading">{_e(p)}</div>
      <a href="#" class="mt-6 block rounded-base border border-default px-4 py-2 text-center text-sm font-medium text-heading">{_e(dna['cta'])}</a>
    </div>''' for t, p in v.get('tiers_simple', (
        ('Solo', '$9'), ('Team', '$29'), ('Scale', '$79'))))
    return f'''<section class="bg-neutral-primary px-6 {SECTION_PY}">
  <div class="{CONT} max-w-5xl text-center">
    <h2 class="text-3xl font-semibold tracking-tight text-heading">{_e(h)}</h2>
    <div class="mt-10 grid {GAP} sm:grid-cols-3">{tiers}</div>
  </div>
</section>'''


# ------------------------------------------------------------ footer
def footer_simple(dna, v):
    return f'''<footer class="border-t border-default bg-neutral-primary-soft px-6 py-10">
  <div class="{CONT} flex flex-wrap items-center justify-between {GAP}">
    <div class="text-sm font-semibold text-heading">{_e(v.get('logo', 'Brand'))}</div>
    <div class="flex {GAP} text-sm text-body"><a href="#">Privacy</a><a href="#">Terms</a></div>
  </div>
</footer>'''


def footer_sitemap(dna, v):
    cols = ''.join(
        f'''<div><div class="text-xs font-semibold uppercase text-fg-brand-strong">{_e(t)}</div>
      <ul class="mt-3 space-y-2 text-sm text-body">
        {''.join(f'<li><a href="#">{_e(x)}</a></li>' for x in ls)}</ul></div>'''
        for t, ls in v.get('sitemap', (
            ('Product', ('Features', 'Pricing')), ('Company', ('About', 'Jobs')))))
    return f'''<footer class="border-t border-default bg-neutral-primary-soft px-6 {SECTION_PY}">
  <div class="{CONT} grid {GAP} sm:grid-cols-3">
    <div class="text-sm font-semibold text-heading">{_e(v.get('logo', 'Brand'))}</div>
    {cols}
  </div>
</footer>'''


# ------------------------------------------------------------ dispatch
# topology_id -> emitter. Section-type -> canonical default topo.
EMITTERS = {
    'nav-top-bar': nav_top_bar, 'nav-overlay': nav_top_bar,
    'nav-sidebar': nav_sidebar_hint,
    'hero-no-media': hero_no_media, 'hero': hero_centered,
    'hero-minimal': hero_no_media, 'hero-centered': hero_centered,
    'hero-media-right': hero_media_right, 'hero-split-reverse': hero_media_right,
    'hero-media-bg': hero_media_bg,
    'hero-media-top': hero_media_top,
    'grid-3col-uniform': grid_3col_uniform, 'feature-grid': grid_3col_uniform,
    'grids-and-cards': grid_3col_uniform,
    'grid-2col-uniform': grid_2col_uniform,
    'grid-4col-uniform': grid_3col_uniform,
    'list-vertical-rows': list_vertical_rows,
    'list-cards': list_vertical_rows,
    'split-50-50': split_50_50,
    'band-strip': band_strip, 'band-rows': band_strip,
    'band-media': band_media,
    'call-to-action': cta_panel, 'cta': cta_panel,
    'pricing': pricing_2, 'pricing-3': pricing_3,
    'footer': footer_simple, 'footer-sitemap': footer_sitemap,
    'form-centered': cta_panel,
    'testimonials': grid_2col_uniform,
    'content': list_vertical_rows,
}

DEFAULTS = {'nav': 'nav-top-bar', 'hero': 'hero-media-right',
            'feature-grid': 'grid-3col-uniform', 'pricing': 'pricing-2',
            'call-to-action': 'cta_panel', 'footer': 'footer-simple',
            'cta': 'cta_panel'}


def emit(topology_or_type, dna, vibe=None):
    """topology_id or section_type -> markup. Unknown topo falls
    back to its section-type default so something always emits."""
    v = vibe or {}
    key = topology_or_type or ''
    fn = EMITTERS.get(key)
    if fn is None and key in DEFAULTS:
        fn = EMITTERS.get(DEFAULTS[key])
    if fn is None:
        fn = EMITTERS['grid-3col-uniform']
    return fn(dna, v)


def topologies(section_type):
    """all emitters whose section_type this is — the structural
    variant menu for one type."""
    groups = {
        'nav': ('nav-top-bar', 'nav-overlay', 'nav-sidebar'),
        'hero': ('hero-no-media', 'hero-centered',
                 'hero-media-right', 'hero-media-bg',
                 'hero-media-top'),
        'feature-grid': ('grid-3col-uniform', 'grid-2col-uniform',
                         'list-vertical-rows'),
        'grids-and-cards': ('grid-3col-uniform', 'grid-2col-uniform',
                            'list-vertical-rows'),
        'call-to-action': ('band-strip', 'cta_panel', 'band-media'),
        'cta': ('band-strip', 'cta_panel', 'band-media'),
        'pricing': ('pricing-2', 'pricing-3'),
        'footer': ('footer', 'footer-sitemap'),
    }
    return groups.get(section_type, ('grid-3col-uniform',))


def types():
    return sorted(set(EMITTERS) | set(DEFAULTS))


if __name__ == '__main__':
    dna = {'copy': ('From first call to keys',
                    'Four to six months, one team.'),
           'cta': 'Download the guide'}
    for t in types():
        m = emit(t, dna)
        print(f'{t:22s} {len(m):5d}b')
