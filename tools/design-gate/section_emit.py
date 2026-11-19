#!/usr/bin/env python3
"""Canonical section emitter — prebuilt, semantic-class markup per
section_type. THE themeable primitive: fixed structure, every
color/space/radius bound to TW4 semantic tokens (--color-brand,
--color-heading, --radius-base…), so theme_sheet alone restyles.

Sections are the primitive. Each emits a complete <section> with
copy slots resolved from dna.copy/dna.cta and slots for media.

  emit(section_type, dna, vibe_label) -> markup string

Section types = canonical vocab (CLASSIFY-VOCAB.md). Start: hero,
cta, feature-grid, nav, footer, testimonials, pricing, faq, stats,
logo-strip, image-text-split. Extend by adding to SECTIONS.
"""
import html as _html


def _e(s):
    return _html.escape(str(s or ''), quote=True)


# Semantic token classes — every visual choice flows through vars.
# bg-neutral-primary-soft = muted surface, bg-brand = accent,
# text-heading = display color, rounded-base = radius var.

def _nav(dna, v):
    logo = _e(v.get('logo', 'Brand'))
    links = (''.join(f'<a class="text-sm font-medium text-body '
                     f'hover:text-heading" href="#">{_e(t)}</a>'
                     for t in v.get('links',
                                    ('Work', 'About', 'Contact'))))
    return f'''<nav class="bg-neutral-primary border-b border-default">
  <div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
    <a href="#" class="text-lg font-semibold tracking-tight text-heading">{logo}</a>
    <div class="hidden gap-8 md:flex">{links}</div>
    <a href="#" class="inline-flex items-center rounded-base bg-brand px-4 py-2 text-sm font-medium text-white shadow-xs">
      {_e(v.get('cta', 'Get started'))}</a>
  </div>
</nav>'''


def _hero(dna, v):
    head, lead = dna['copy']
    return f'''<section class="bg-neutral-primary px-6 py-24 text-center">
  <div class="mx-auto max-w-3xl">
    <p class="mb-4 text-xs font-semibold uppercase tracking-widest text-fg-brand-strong">
      {_e(v.get('kicker', 'New'))}</p>
    <h1 class="text-5xl font-semibold leading-tight tracking-tight text-heading">
      {_e(head)}</h1>
    <p class="mt-6 text-lg leading-relaxed text-body">{_e(lead)}</p>
    <div class="mt-10 flex flex-wrap items-center justify-center gap-4">
      <a href="#" class="inline-flex items-center rounded-base bg-brand px-6 py-3 text-sm font-medium text-white shadow-xs">
        {_e(dna['cta'])}</a>
      <a href="#" class="text-sm font-medium text-heading underline underline-offset-4">
        {_e(v.get('secondary', 'Learn more'))}</a>
    </div>
  </div>
</section>'''


def _hero_split(dna, v):
    head, lead = dna['copy']
    return f'''<section class="bg-neutral-primary px-6 py-20">
  <div class="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
    <div>
      <h1 class="text-4xl font-semibold leading-tight tracking-tight text-heading">
        {_e(head)}</h1>
      <p class="mt-5 text-base leading-relaxed text-body">{_e(lead)}</p>
      <a href="#" class="mt-8 inline-flex items-center rounded-base bg-brand px-5 py-2.5 text-sm font-medium text-white">
        {_e(dna['cta'])}</a>
    </div>
    <div class="aspect-[4/3] overflow-hidden rounded-lg bg-neutral-primary-soft"></div>
  </div>
</section>'''


def _feature_grid(dna, v):
    head, lead = dna['copy']
    cards = ''.join(
        f'''<div class="rounded-base border border-default bg-neutral-primary-soft p-6">
      <div class="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-sm bg-brand-softer text-fg-brand-strong">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path d="M12 2v20M2 12h20"/></svg></div>
      <h3 class="mb-2 text-base font-semibold text-heading">{_e(t)}</h3>
      <p class="text-sm leading-relaxed text-body">{_e(d)}</p>
    </div>'''
        for t, d in v.get('features', (
            ('Structured, not decorated', 'Layout is a contract — every spacing step is a token.'),
            ('Retrieval over generation', 'Structure comes from the bank; variables bind the vibe.'),
            ('Provenance on every knob', 'Each token reports profile, sample size, and allele.'))))
    return f'''<section class="bg-neutral-primary px-6 py-20">
  <div class="mx-auto max-w-6xl">
    <h2 class="text-3xl font-semibold tracking-tight text-heading">{_e(head)}</h2>
    <p class="mt-3 max-w-2xl text-base text-body">{_e(lead)}</p>
    <div class="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{cards}</div>
  </div>
</section>'''


def _cta(dna, v):
    head, _ = dna['copy']
    return f'''<section class="bg-neutral-primary-soft px-6 py-20">
  <div class="mx-auto max-w-4xl rounded-lg bg-brand px-8 py-14 text-center shadow-md">
    <h2 class="text-3xl font-semibold tracking-tight text-white">{_e(head)}</h2>
    <p class="mx-auto mt-4 max-w-xl text-base text-white/80">{_e(v.get('sub', 'Start now — it takes a minute.'))}</p>
    <a href="#" class="mt-8 inline-flex items-center rounded-base bg-white px-6 py-3 text-sm font-medium text-heading">
      {_e(dna['cta'])}</a>
  </div>
</section>'''


def _testimonials(dna, v):
    head, _ = dna['copy']
    quotes = ''.join(
        f'''<figure class="rounded-base border border-default bg-neutral-primary-soft p-6">
      <blockquote class="text-sm leading-relaxed text-heading">&ldquo;{_e(q)}&rdquo;</blockquote>
      <figcaption class="mt-4 flex items-center gap-3">
        <div class="h-8 w-8 rounded-full bg-brand-softer"></div>
        <div><div class="text-sm font-medium text-heading">{_e(n)}</div>
        <div class="text-xs text-body">{_e(r)}</div></div>
      </figcaption>
    </figure>'''
        for q, n, r in v.get('quotes', (
            ('The machinery decides; the picker only shows.', 'A. Reyes', 'Design Ops'),
            ('Sections arrive prebuilt — we choose, not generate.', 'M. Okafor', 'Engineer'))))
    return f'''<section class="bg-neutral-primary px-6 py-20">
  <div class="mx-auto max-w-6xl">
    <h2 class="text-3xl font-semibold tracking-tight text-heading">{_e(head)}</h2>
    <div class="mt-10 grid gap-6 md:grid-cols-2">{quotes}</div>
  </div>
</section>'''


def _pricing(dna, v):
    head, lead = dna['copy']
    tiers = ''.join(
        f'''<div class="rounded-base border border-default bg-neutral-primary-soft p-8">
      <h3 class="text-sm font-semibold uppercase tracking-wide text-fg-brand-strong">{_e(t)}</h3>
      <div class="mt-4 text-4xl font-semibold text-heading">{_e(p)}</div>
      <ul class="mt-6 space-y-3 text-sm text-body">
        {''.join(f'<li>{_e(f_)}</li>' for f_ in feats)}</ul>
      <a href="#" class="mt-8 block rounded-base bg-brand px-4 py-2.5 text-center text-sm font-medium text-white">
        {_e(dna['cta'])}</a>
    </div>'''
        for t, p, feats in v.get('tiers', (
            ('Starter', '$0', ('One project', 'Community bank')),
            ('Pro', '$19', ('All kits', 'Priority classify')))))
    return f'''<section class="bg-neutral-primary px-6 py-20">
  <div class="mx-auto max-w-5xl text-center">
    <h2 class="text-3xl font-semibold tracking-tight text-heading">{_e(head)}</h2>
    <p class="mt-3 text-base text-body">{_e(lead)}</p>
    <div class="mt-12 grid gap-6 sm:grid-cols-2">{tiers}</div>
  </div>
</section>'''


def _footer(dna, v):
    return f'''<footer class="border-t border-default bg-neutral-primary-soft px-6 py-12">
  <div class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6">
    <div class="text-sm font-semibold text-heading">{_e(v.get('logo', 'Brand'))}</div>
    <div class="flex gap-6 text-sm text-body">
      <a href="#">Privacy</a><a href="#">Terms</a><a href="#">Status</a></div>
    <div class="text-xs text-body">© 2026 — banked, not generated</div>
  </div>
</footer>'''


SECTIONS = {
    'nav': _nav,
    'hero': _hero,
    'hero-minimal': _hero,
    'hero-split-reverse': _hero_split,
    'feature-grid': _feature_grid,
    'grids-and-cards': _feature_grid,
    'call-to-action': _cta,
    'cta': _cta,
    'testimonials': _testimonials,
    'pricing': _pricing,
    'footer': _footer,
}


def emit(section_type, dna, vibe=None):
    """section_type → semantic markup. dna: {'copy':(h,l),'cta':s}.
    vibe: optional overrides dict (kicker/links/features/…).
    Unknown type falls back to feature-grid so a section always
    emits."""
    v = vibe or {}
    fn = SECTIONS.get(section_type, _feature_grid)
    return fn(dna, v)


def types():
    return sorted(SECTIONS)


if __name__ == '__main__':
    dna = {'copy': ('From first call to keys',
                    'Four to six months, one team beside you.'),
           'cta': 'Download the guide'}
    for t in types():
        m = emit(t, dna)
        print(t, len(m), 'bytes')
