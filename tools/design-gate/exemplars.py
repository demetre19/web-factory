#!/usr/bin/env python3
"""Write the gold section exemplars — one per SECTION-CATALOG composition.

Each file is a real, minimal, token-only Astro section component: content
inside the Section shell (no <section>, no outer spacing/background),
Tailwind utilities from the project's token-derived scale, Lucide-style
inline SVG with currentColor, no hex, no arbitrary values.

Run: python3 tools/design-gate/exemplars.py   (idempotent, overwrites)
"""
import os

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(REPO, 'templates', 'sections')

HEAD = '''---
/**
 * {comp} — gold exemplar (SB.5). Adapt copy, tokens and rhythm to the
 * contract; keep the skeleton. Renders inside Section.astro: no
 * <section>, no outer padding/background/max-width (SB.2).
 */
interface Props {{
  heading?: string;
  fs?: string;
  body?: string;
  cta?: {{ label: string; href: string }};
  items?: {{ title?: string; text?: string; value?: string;
             label?: string; href?: string; quote?: string }}[];
  image?: {{ src: string; alt: string }};
}}
const {{
  heading = 'Section heading', fs = 'The first sentence a reader needs.',
  body = '', cta, items = [], image,
}} = Astro.props;
---
'''

EX = {}

EX['split-media'] = '''
<div class="grid gap-stack items-center md:grid-cols-2">
  <div class="max-w-prose">
    <h2 class="text-fluid-3">{heading}</h2>
    <p class="mt-stack text-fluid-0">{fs}</p>
    {body && <p class="mt-stack text-fluid--1">{body}</p>}
    {cta && <a class="wf-cta-button mt-stack" href={cta.href}>{cta.label}</a>}
  </div>
  <figure class="ratio-portrait overflow-hidden rounded-card">
    <img class="h-full w-full object-cover" src={image?.src ?? '/media/placeholder.svg'}
         alt={image?.alt ?? ''} width="900" height="1200" loading="lazy" />
  </figure>
</div>
'''

EX['stacked-hero'] = '''
<div class="max-w-prose text-center">
  <h1 class="text-fluid-4">{heading}</h1>
  <p class="mt-stack text-fluid-1">{fs}</p>
  {body && <p class="mt-stack text-fluid-0">{body}</p>}
  {cta && <a class="wf-cta-button mt-stack" href={cta.href}>{cta.label}</a>}
</div>
'''

EX['proof-band'] = '''
<div class="flex flex-wrap items-center justify-between gap-stack">
  <p class="text-fluid-1" aria-label="Rating">
    <span class="font-bold">{items[0]?.value ?? '4.9'}</span>
    <span class="text-fluid--1">/ 5 · {items[0]?.label ?? 'average rating'}</span>
  </p>
  <blockquote class="max-w-prose text-fluid-0">“{items[1]?.quote ?? fs}”</blockquote>
  <a class="text-fluid-0 underline" href={cta?.href ?? '#'}>{cta?.label ?? 'Read the reviews'}</a>
</div>
'''

EX['editorial'] = '''
<div class="max-w-prose">
  <h2 class="text-fluid-2">{heading}</h2>
  <p class="mt-stack text-fluid-0">{fs}</p>
  {body && <p class="mt-stack text-fluid-0">{body}</p>}
</div>
'''

EX['cards-n'] = '''
<div>
  <h2 class="text-fluid-2">{heading}</h2>
  <p class="mt-stack max-w-prose text-fluid-0">{fs}</p>
  <ul class="mt-fluid-l grid gap-stack sm:grid-cols-2 lg:grid-cols-3">
    {items.map((it) => (
      <li class="rounded-card border border-muted p-fluid-m">
        <h3 class="text-fluid-1">{it.title}</h3>
        <p class="mt-fluid-s text-fluid-0">{it.text}</p>
      </li>
    ))}
  </ul>
</div>
'''

EX['sequence'] = '''
<div>
  <h2 class="text-fluid-2">{heading}</h2>
  <p class="mt-stack max-w-prose text-fluid-0">{fs}</p>
  <ol class="mt-fluid-l grid gap-stack">
    {items.map((it, i) => (
      <li class="flex gap-stack border-t border-muted pt-fluid-m">
        <span class="w-12 shrink-0 text-fluid-2 font-bold" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
        <div>
          <h3 class="text-fluid-1">{it.title}</h3>
          <p class="mt-fluid-s text-fluid-0">{it.text}</p>
        </div>
      </li>
    ))}
  </ol>
</div>
'''

EX['faq'] = '''
<div class="max-w-prose">
  <h2 class="text-fluid-2">{heading}</h2>
  <div class="mt-stack grid gap-fluid-s">
    {items.map((it) => (
      <details class="border-b border-muted pb-fluid-s">
        <summary class="cursor-pointer text-fluid-0 font-semibold">{it.title}</summary>
        <p class="mt-fluid-s text-fluid-0">{it.text}</p>
      </details>
    ))}
  </div>
</div>
'''

EX['comparison'] = '''
<div>
  <h2 class="text-fluid-2">{heading}</h2>
  <p class="mt-stack max-w-prose text-fluid-0">{fs}</p>
  <div class="mt-fluid-l grid gap-stack md:grid-cols-2">
    {items.slice(0, 2).map((it) => (
      <div class="rounded-card border border-muted p-fluid-m">
        <h3 class="text-fluid-1">{it.title}</h3>
        <p class="mt-fluid-s text-fluid-0">{it.text}</p>
      </div>
    ))}
  </div>
</div>
'''

EX['logo-wall'] = '''
<div>
  <h2 class="text-fluid-1">{heading}</h2>
  <ul class="mt-stack flex flex-wrap items-center gap-fluid-l">
    {items.map((it) => (
      <li class="text-fluid-0 opacity-80">{it.label}</li>
    ))}
  </ul>
</div>
'''

EX['stat-band'] = '''
<div>
  <h2 class="text-fluid-1">{heading}</h2>
  <dl class="mt-stack grid grid-cols-2 gap-stack md:grid-cols-4">
    {items.map((it) => (
      <div>
        <dd class="text-fluid-4 font-bold">{it.value}</dd>
        <dt class="mt-fluid-s text-fluid--1">{it.label}</dt>
      </div>
    ))}
  </dl>
</div>
'''

EX['full-bleed'] = '''
<div class="text-center">
  <h2 class="text-fluid-4">{heading}</h2>
  <p class="mx-auto mt-stack max-w-prose text-fluid-1">{fs}</p>
  {cta && <a class="wf-cta-button mt-fluid-l" href={cta.href}>{cta.label}</a>}
</div>
'''

EX['media-gallery'] = '''
<div>
  <h2 class="text-fluid-2">{heading}</h2>
  <ul class="mt-stack grid grid-cols-2 gap-fluid-s md:grid-cols-3">
    {items.map((it) => (
      <li class="aspect-square overflow-hidden rounded-card">
        <img class="h-full w-full object-cover" src={it.href ?? '/media/placeholder.svg'}
             alt={it.label ?? ''} width="800" height="800" loading="lazy" />
      </li>
    ))}
  </ul>
</div>
'''

EX['form-panel'] = '''
<div class="grid gap-fluid-l md:grid-cols-2">
  <div class="max-w-prose">
    <h2 class="text-fluid-3">{heading}</h2>
    <p class="mt-stack text-fluid-0">{fs}</p>
  </div>
  <form class="grid gap-fluid-s" novalidate>
    <label class="grid gap-fluid-s text-fluid--1">
      <span>Name</span>
      <input class="rounded-card border border-muted p-fluid-s text-fluid-0" type="text" name="name" autocomplete="name" />
    </label>
    <label class="grid gap-fluid-s text-fluid--1">
      <span>Email</span>
      <input class="rounded-card border border-muted p-fluid-s text-fluid-0" type="email" name="email" autocomplete="email" />
    </label>
    <button class="wf-cta-button" type="submit">{cta?.label ?? 'Send'}</button>
  </form>
</div>
'''

EX['quote-grid'] = '''
<div>
  <h2 class="text-fluid-2">{heading}</h2>
  <ul class="mt-stack grid gap-stack md:grid-cols-3">
    {items.map((it) => (
      <li class="rounded-card border border-muted p-fluid-m">
        <blockquote class="text-fluid-0">“{it.quote}”</blockquote>
        <p class="mt-fluid-s text-fluid--1">{it.label}</p>
      </li>
    ))}
  </ul>
</div>
'''

EX['text-index'] = '''
<div class="max-w-prose">
  <h2 class="text-fluid-2">{heading}</h2>
  <p class="mt-stack text-fluid-0">{fs}</p>
  <ul class="mt-stack grid grid-cols-2 gap-fluid-s text-fluid-0 sm:grid-cols-3">
    {items.map((it) => (
      <li><a class="underline" href={it.href ?? '#'}>{it.label}</a></li>
    ))}
  </ul>
</div>
'''

EX['link-grid'] = '''
<div>
  <h2 class="text-fluid-2">{heading}</h2>
  <p class="mt-stack max-w-prose text-fluid-0">{fs}</p>
  <ul class="mt-stack grid grid-cols-2 gap-fluid-s text-fluid-0 sm:grid-cols-4">
    {items.map((it) => (
      <li><a class="underline" href={it.href ?? '#'}>{it.label}</a></li>
    ))}
  </ul>
</div>
'''

EX['badge-center'] = '''
<div class="text-center">
  <svg class="mx-auto" width="32" height="32" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" stroke-width="2" aria-hidden="true">
    <path d="M20 6 9 17l-5-5" />
  </svg>
  <h2 class="mt-fluid-s text-fluid-1">{heading}</h2>
  <p class="mt-fluid-s text-fluid-0">{fs}</p>
</div>
'''

EX['capture-form'] = '''
<div class="mx-auto max-w-prose text-center">
  <h2 class="text-fluid-2">{heading}</h2>
  <p class="mt-stack text-fluid-0">{fs}</p>
  <form class="mt-stack flex flex-wrap justify-center gap-fluid-s" novalidate>
    <label class="sr-only" for="capture-email">Email</label>
    <input id="capture-email" class="rounded-card border border-muted p-fluid-s text-fluid-0"
           type="email" name="email" placeholder="you@example.com" autocomplete="email" />
    <button class="wf-cta-button" type="submit">{cta?.label ?? 'Notify me'}</button>
  </form>
</div>
'''

EX['map-finder'] = '''
<div class="grid gap-fluid-l md:grid-cols-2">
  <div class="max-w-prose">
    <h2 class="text-fluid-2">{heading}</h2>
    <p class="mt-stack text-fluid-0">{fs}</p>
    <ul class="mt-stack grid grid-cols-2 gap-fluid-s text-fluid-0">
      {items.map((it) => (
        <li><a class="underline" href={it.href ?? '#'}>{it.label}</a></li>
      ))}
    </ul>
  </div>
  <div class="aspect-square rounded-card border border-muted"></div>
</div>
'''

EX['app-band'] = '''
<div class="grid items-center gap-fluid-l md:grid-cols-2">
  <div class="max-w-prose">
    <h2 class="text-fluid-2">{heading}</h2>
    <p class="mt-stack text-fluid-0">{fs}</p>
    {cta && <a class="wf-cta-button mt-stack" href={cta.href}>{cta.label}</a>}
  </div>
  <div class="ratio-phone mx-auto w-48 rounded-card border border-muted"></div>
</div>
'''

EX['hero-act-merge'] = '''
<div class="grid gap-fluid-l md:grid-cols-2 md:items-center">
  <div class="max-w-prose">
    <h1 class="text-fluid-4">{heading}</h1>
    <p class="mt-stack text-fluid-1">{fs}</p>
  </div>
  <form class="flex flex-wrap gap-fluid-s" novalidate>
    <label class="sr-only" for="hero-zip">Postcode</label>
    <input id="hero-zip" class="rounded-card border border-muted p-fluid-s text-fluid-0"
           type="text" name="zip" placeholder="Your postcode" autocomplete="postal-code" />
    <button class="wf-cta-button" type="submit">{cta?.label ?? 'Check availability'}</button>
  </form>
</div>
'''

EX['nav-bar'] = '''
<nav class="flex items-center justify-between gap-fluid-s" aria-label="Primary">
  <a class="text-fluid-0 font-bold" href="/">{heading}</a>
  <ul class="hidden items-center gap-fluid-m text-fluid-0 md:flex">
    {items.map((it) => (
      <li><a class="underline" href={it.href ?? '#'}>{it.label}</a></li>
    ))}
  </ul>
  {cta && <a class="wf-cta-button" href={cta.href}>{cta.label}</a>}
</nav>
'''

EX['footer-bar'] = '''
<footer class="grid gap-stack text-fluid--1 md:grid-cols-2">
  <p>{heading}</p>
  <ul class="flex flex-wrap gap-fluid-m">
    {items.map((it) => (
      <li><a class="underline" href={it.href ?? '#'}>{it.label}</a></li>
    ))}
  </ul>
</footer>
'''

def main():
    os.makedirs(OUT, exist_ok=True)
    for comp, markup in EX.items():
        name = ''.join(p.capitalize() for p in comp.split('-')) + '.astro'
        d = os.path.join(OUT, comp)
        os.makedirs(d, exist_ok=True)
        with open(os.path.join(d, name), 'w', encoding='utf-8') as fh:
            fh.write(HEAD.format(comp=comp) + markup)
    print(f'exemplars written: {len(EX)} → {os.path.relpath(OUT, REPO)}/')


if __name__ == '__main__':
    main()
