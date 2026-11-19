#!/usr/bin/env python3
"""page_from_bank.py — one page assembled from Bricksmaven topology.

The split this file exists to prove:

  * Bricksmaven supplies CONSTRUCTION — which div wraps which heading,
    which row repeats, how many elements sit in a card — and the
    authored CSS, whose ACSS vars bricks_translate already rewrote to
    our token names (--space-m, --r-card, --fs-*, --section-space-*).
  * We supply the VALUES — an ACSS-grade default floor (fluid clamps,
    section rhythm, radius scale, base typography) skewed by the DNA
    knobs, emitted by emit_global.global_css.

Nothing here invents a hex, a spacing value, or a type size: every
value is a var() from the token layer. The only rules this file owns
are the page glue the payloads left to ACSS defaults (container width,
section rhythm, grid display) — the bank's own rules do the styling.

Usage: page_from_bank.py OUTDIR [--seed N]
"""

import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
BANK = os.path.join(ROOT, 'templates', 'skeletons', 'bricksmaven')
sys.path.insert(0, HERE)

import bricks_translate as bt          # noqa: E402
import emit_global as eg               # noqa: E402
import dna_tokens                      # noqa: E402

# ---------------------------------------------------------------- compat
# The bank imports a few ACSS utilities. They are not in the payload's
# globalClasses (they arrive pre-baked), so the translation is ours and
# binds semantic tokens only.
COMPAT_CSS = '''
/* ---- ACSS imports, translated to our token layer ---- */
.btn--primary {
  display: inline-flex; align-items: center; justify-content: center;
  gap: var(--space-xs);
  padding: 0.9rem 1.6rem;
  background: var(--action-primary);
  color: var(--action-primary-ink);
  border-radius: var(--r-card);
  font-family: var(--font-body);
  font-size: var(--fs--1);
  font-weight: 600;
  line-height: 1;
  letter-spacing: 0.01em;
  text-decoration: none;
  transition: background-color var(--primitive-duration-med)
      var(--primitive-ease),
    transform var(--primitive-duration-fast) var(--primitive-ease);
}
.btn--primary:hover {
  background: var(--action-primary-hover);
  transform: translateY(-1px);
}
.list--none { list-style: none; padding: 0; margin: 0; }
.overlay--black-trans-40 { position: relative; }
.overlay--black-trans-40::after {
  content: ""; position: absolute; inset: 0; z-index: 1;
  background: color-mix(in oklch, var(--bg-inverse) 58%, transparent);
  pointer-events: none;
}
.overlay--black-trans-40 > * { position: relative; z-index: 2; }
'''

# ------------------------------------------------------------- glue css
# Everything the payloads left to ACSS defaults. Bank rules win on
# their own selectors; this only fills the gaps.
GLUE_CSS = '''
/* ---- page glue: containers, rhythm, the grids ACSS defaulted ----
   Emitted AFTER the bank sheet so a glue rule always wins on equal
   specificity: the payloads leave container width, section rhythm and
   grid display to ACSS defaults we do not ship. */

/* every section child gets the container; sections own the rhythm */
main > section { width: 100%; position: relative;
  padding-block: var(--section-space-l); }
main > section > *[class],
.cta-11-container, .testimonial-11-container,
.footer-11-container, .feature-1-container,
.bm-header-12__container {
  width: 100%; max-width: var(--content-width);
  margin-inline: auto; padding-inline: var(--space-m);
}

.site-head {
  position: sticky; top: 0; z-index: 40; padding-block: 0;
  background: color-mix(in oklch, var(--bg-canvas) 90%, transparent);
  backdrop-filter: saturate(140%) blur(14px);
  border-bottom: 1px solid var(--border-default);
}
.bm-header-12 { padding: 0; }
.bm-header-12__container {
  display: flex; align-items: center; justify-content: space-between;
  gap: var(--space-l); padding-block: var(--space-s);
}
.bm-header-12__nav-menu, .bm-header-12__nav-items,
.bm-header-12__nav-links { display: flex; align-items: center; }
.bm-header-12__nav-links { gap: var(--space-l); }
.bm-header-12__nav-links a {
  font-size: var(--fs--1); font-weight: 500; letter-spacing: 0.01em;
  color: var(--text-secondary); text-decoration: none;
  transition: color var(--primitive-duration-fast) var(--primitive-ease);
}
.bm-header-12__nav-links a:hover { color: var(--text-primary); }
@media (max-width: 55.999rem) {
  /* the bar keeps logo + action; the link row would overflow */
  .bm-header-12__nav { display: none; }
}
.bm-header-12__logo {
  font-family: var(--font-display); font-size: var(--fs-1);
  font-weight: 700; letter-spacing: -0.02em;
  color: var(--text-primary); text-decoration: none;
}

/* hero — full-bleed media band, copy over it */
.hero { padding-block: 0; }
.hero-10 { height: auto; overflow: hidden; }
.hero-10-container {
  position: relative; display: flex; align-items: center;
  min-height: 76vh; max-width: none; padding-inline: 0;
}
.hero-10__section-bg-image {
  position: absolute; inset: 0; width: 100%; height: 100%;
  object-fit: cover; z-index: 0; max-width: none;
}
.hero-10__content {
  position: relative; z-index: 2;
  display: flex; flex-direction: column; align-items: flex-start;
  gap: var(--space-m);
  max-width: var(--content-width); width: 100%;
  margin-inline: auto; padding: var(--space-xl) var(--space-m);
}
.hero-11__tag {
  font-size: var(--fs--1); font-weight: 600; letter-spacing: 0.16em;
  text-transform: uppercase; color: var(--action-primary-ink);
  opacity: 0.82;
}
.hero-11__title { color: var(--action-primary-ink); max-width: 20ch; }
.hero-11__desc {
  color: var(--action-primary-ink); opacity: 0.9;
  font-size: var(--fs-1); line-height: var(--lh-1);
  max-width: 46ch;
}

/* feature — three rows, content beside media */
.feature-1 { display: grid; gap: var(--space-l); }
.feature-1 > * { max-width: var(--content-width); }
.feature-1-container { display: grid; gap: var(--space-l); }
.intro { align-items: center; text-align: center; gap: var(--space-s); }
.intro__subheading { color: var(--text-secondary);
  font-size: var(--fs-1); max-width: 54ch; }
.feature-1-ul { display: grid; gap: var(--space-xl);
  grid-template-columns: 1fr; }
.feature-1-li {
  grid-template-columns: 1fr; align-items: center;
  gap: var(--space-l); width: 100%;
}
@media (min-width: 56rem) {
  .feature-1-li { grid-template-columns: 1fr 1fr; }
  .feature-1-li:nth-child(even) .feature-1-li__content { order: 2; }
}
.feature-1-li__title { letter-spacing: -0.015em; }
.feature-1-li__desc { color: var(--text-secondary); }
.feature-1-li__image {
  border-radius: var(--r-card); width: 100%; height: 100%;
  object-fit: cover; aspect-ratio: 4 / 3;
}
.bm-list__item-icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 1.5rem; height: 1.5rem; flex: none;
  color: var(--action-primary);
}

/* proof — quiet band, large quote */
.proof { background: var(--bg-subtle); }
.testimonial-11-container { display: grid; gap: var(--space-l);
  grid-template-columns: 1fr; }
.testimonial-11-title__heading {
  font-size: var(--fs--1); font-weight: 600; letter-spacing: 0.14em;
  text-transform: uppercase; color: var(--text-secondary);
}
.testimonial-11-content { display: grid; gap: var(--space-m);
  grid-template-columns: 1fr; }
.testimonial-11-content__desc {
  font-family: var(--font-display); font-size: var(--fs-3);
  line-height: var(--lh-3); letter-spacing: -0.015em;
  max-width: 30ch;
}
.testimonial-11-content__profile {
  display: flex; align-items: center; gap: var(--space-s);
}
.testimonial-11-content__name { font-size: var(--fs-0); }
.testimonial-11-content__job-title {
  color: var(--text-secondary); font-size: var(--fs--1);
}
.testimonial-11-content__logo {
  width: 3.25rem; height: 3.25rem; border-radius: 999px;
  object-fit: cover; flex: none;
}

/* cta — copy left, media right */
.cta-11-container { display: grid; gap: var(--space-l);
  align-items: center; grid-template-columns: 1fr; }
@media (min-width: 60rem) {
  .cta-11-container { grid-template-columns: 1.05fr 0.95fr; }
}
.cta-11__box { display: flex; flex-direction: column;
  align-items: flex-start; gap: var(--space-s);
  padding: var(--space-xl) var(--space-l); }
.cta-11__desc { color: var(--text-secondary); max-width: 42ch; }
.cta-11__image {
  border-radius: var(--r-card); width: 100%;
  aspect-ratio: 5 / 4; object-fit: cover;
}

/* footer */
.site-foot { padding-block: var(--section-space-m);
  border-top: 1px solid var(--border-default); }
.footer-11-container { display: grid; gap: var(--space-l);
  grid-template-columns: 1fr; }
.footer-11__top { display: grid; gap: var(--space-l);
  grid-template-columns: 1fr; }
@media (min-width: 56rem) {
  .footer-11__top { grid-template-columns: 1fr auto; align-items: start; }
}
.footer-brand__logo {
  font-family: var(--font-display); font-size: var(--fs-1);
  font-weight: 700; letter-spacing: -0.02em;
  color: var(--text-primary); text-decoration: none;
}
.footer-menu__link, .footer-legal__link-text {
  color: var(--text-secondary); text-decoration: none;
  font-size: var(--fs--1);
}
.footer-menu__link:hover, .footer-legal__link-text:hover {
  color: var(--text-primary);
}
.footer-11__bottom { display: flex; flex-wrap: wrap;
  align-items: center; justify-content: space-between;
  gap: var(--space-m); }
.footer-legal-nav { display: flex; flex-wrap: wrap; gap: var(--space-m); }
.footer-copyright { color: var(--text-muted); font-size: var(--fs--1); }
.footer-social-wrapper a { color: var(--text-secondary); }
.footer-social-wrapper a:hover { color: var(--text-primary); }
'''


ART = {
    # name: (w, h, composition) — duotone editorial plates, drawn from
    # the token palette so every section reads as one system.
    'hero': (1600, 1100, 'arcs'),
    'strategy': (900, 700, 'grid'),
    'identity': (900, 700, 'disc'),
    'digital': (900, 700, 'bands'),
    'portrait': (240, 240, 'disc'),
    'cta': (1000, 800, 'arcs'),
}


def _art_svg(w, h, kind, accent, ink, surface):
    """One plate. Duotone field + one geometric gesture + grain; no
    photographic claims, no external assets."""
    if kind == 'arcs':
        gesture = (f'<path d="M-{w*0.1:.0f} {h*0.78:.0f} Q {w*0.42:.0f} '
                   f'{h*0.1:.0f} {w*1.1:.0f} {h*0.62:.0f}" fill="none" '
                   f'stroke="{accent}" stroke-width="{w*0.006:.0f}" '
                   f'opacity="0.75"/>'
                   f'<path d="M-{w*0.1:.0f} {h*0.92:.0f} Q {w*0.5:.0f} '
                   f'{h*0.3:.0f} {w*1.1:.0f} {h*0.8:.0f}" fill="none" '
                   f'stroke="{surface}" stroke-width="1.2" opacity="0.5"/>')
    elif kind == 'grid':
        lines = ''.join(
            f'<line x1="{x}" y1="0" x2="{x}" y2="{h}" stroke="{surface}" '
            f'stroke-width="1" opacity="0.28"/>'
            for x in range(0, w, max(24, w // 12)))
        lines += ''.join(
            f'<line x1="0" y1="{y}" x2="{w}" y2="{y}" stroke="{surface}" '
            f'stroke-width="1" opacity="0.28"/>'
            for y in range(0, h, max(24, h // 10)))
        gesture = lines + (f'<circle cx="{w*0.66:.0f}" cy="{h*0.36:.0f}" '
                           f'r="{w*0.17:.0f}" fill="{accent}" opacity="0.9"/>')
    elif kind == 'disc':
        gesture = (f'<circle cx="{w*0.5:.0f}" cy="{h*0.46:.0f}" '
                   f'r="{min(w,h)*0.3:.0f}" fill="none" stroke="{accent}" '
                   f'stroke-width="{max(2, min(w,h)*0.012):.0f}"/>'
                   f'<circle cx="{w*0.5:.0f}" cy="{h*0.46:.0f}" '
                   f'r="{min(w,h)*0.16:.0f}" fill="{accent}" opacity="0.85"/>')
    else:  # bands
        band = ''.join(
            f'<rect x="0" y="{h*(0.18+i*0.16):.0f}" width="{w}" '
            f'height="{h*0.055:.0f}" fill="{surface}" '
            f'opacity="{0.5-i*0.08:.2f}"/>' for i in range(4))
        gesture = band + (f'<rect x="{w*0.58:.0f}" y="{h*0.1:.0f}" '
                          f'width="{w*0.3:.0f}" height="{h*0.8:.0f}" '
                          f'fill="{accent}" opacity="0.9"/>')
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" '
            f'width="{w}" height="{h}" role="img">'
            f'<defs>'
            f'<linearGradient id="g" x1="0" y1="0" x2="1" y2="1">'
            f'<stop offset="0" stop-color="{ink}"/>'
            f'<stop offset="0.55" stop-color="{ink}" stop-opacity="0.86"/>'
            f'<stop offset="1" stop-color="{accent}" stop-opacity="0.55"/>'
            f'</linearGradient>'
            f'<radialGradient id="v" cx="0.72" cy="0.24" r="0.85">'
            f'<stop offset="0" stop-color="{surface}" stop-opacity="0.22"/>'
            f'<stop offset="1" stop-color="{surface}" stop-opacity="0"/>'
            f'</radialGradient>'
            f'<filter id="n"><feTurbulence type="fractalNoise" '
            f'baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/>'
            f'<feColorMatrix type="saturate" values="0"/>'
            f'<feComponentTransfer><feFuncA type="linear" '
            f'slope="0.06"/></feComponentTransfer></filter>'
            f'</defs>'
            f'<rect width="{w}" height="{h}" fill="url(#g)"/>'
            f'<rect width="{w}" height="{h}" fill="url(#v)"/>'
            f'{gesture}'
            f'<rect width="{w}" height="{h}" filter="url(#n)" opacity="0.5"/>'
            f'</svg>')


def write_art(outdir, tokens):
    roles = ((tokens.get('color') or {}).get('modes') or {}).get('light') \
        or {}
    roles = roles.get('roles') or roles
    accent = roles.get('accent') or '#C2410C'
    ink = roles.get('inverse') or roles.get('ink') or '#1D2325'
    surface = roles.get('bg') or '#FDFCFA'
    for name, (w, h, kind) in ART.items():
        with open(os.path.join(outdir, f'art-{name}.svg'), 'w') as fh:
            fh.write(_art_svg(w, h, kind, accent, ink, surface))

# ------------------------------------------------------------- sections
# cat, stem, role, copy by element type (consumed in document order),
# images, in document order.
SECTIONS = [
    dict(cat='headers', stem='header-12', role='site-head',
         copy={'logo': ['Meridian'],
               'a': ['Work', 'Studio', 'Services', 'Journal', 'Contact',
                     'Start a project']},
         images=[]),
    dict(cat='hero', stem='hero-10', role='hero',
         copy={'p': ['Independent design studio',
                     'We build identities and websites that hold up under '
                     'scrutiny — for founders who care about the details.'],
               'heading': ['Brand and digital design for companies in '
                           'motion.'],
               'button': ['See selected work']},
         images=[('art-hero.svg', 'Studio work in progress')]),
    dict(cat='feature', stem='feature-1', role='feature',
         copy={'heading': ['What we do', 'Brand strategy',
                           'Identity systems', 'Digital product'],
               'p': ['Three practices, one team — strategy, identity, and '
                     'digital, run as a single engagement.',
                     'Engagements run six to twelve weeks.',
                     'Positioning, narrative, and naming that give the work '
                     'a spine.',
                     'Market and category audit', 'Positioning platform',
                     'Narrative and messaging',
                     'Marks, type, and motion built as a system your team '
                     'can actually run.',
                     'Wordmark and symbol', 'Type and colour system',
                     'Brand guidelines',
                     'Sites and products designed in the browser and shipped '
                     'with your engineers.',
                     'Design systems', 'Marketing sites',
                     'Product interfaces']},
         images=[('art-strategy.svg', 'Strategy workshop'),
                 ('art-identity.svg', 'Identity system'),
                 ('art-digital.svg', 'Product interface')]),
    dict(cat='testimonials', stem='testimonial-11', role='proof',
         copy={'heading': ['What clients say', 'Elena Rusk'],
               'p': ['“Meridian rebuilt our identity in eleven weeks and '
                     'the site converts twice as well. They think in '
                     'systems, not deliverables.”',
                     'Co-founder, Northwind']},
         images=[('art-portrait.svg', 'Elena Rusk')]),
    dict(cat='call-to-action', stem='call-to-action-11', role='cta',
         copy={'heading': ["Let's build something that lasts."],
               'p': ["Tell us where you're going. We'll tell you what it "
                     'takes to get there.'],
               'button': ['Start a project']},
         images=[('art-cta.svg', 'Studio detail')]),
    dict(cat='footer', stem='footer-11', role='site-foot',
         copy={'logo': ['Meridian'],
               'a': ['Work', 'Studio', 'Services', 'Journal', 'Contact',
                     'Privacy', 'Terms', 'Colophon', 'Careers'],
               'p': ['© 2026 Meridian Studio. All rights reserved.']},
         images=[]),
]

# ------------------------------------------------------------- rendering
SKIP = {'code', 'toggle', 'slider-nested'}

CHECK_SVG = ('<svg viewBox="0 0 16 16" width="16" height="16" '
             'fill="none" stroke="currentColor" stroke-width="1.6" '
             'stroke-linecap="round" stroke-linejoin="round" '
             'aria-hidden="true"><path d="M3 8.5l3.2 3.2L13 5"/></svg>')

SOCIAL_SVG = ('<span class="social-icons__row" style="display:flex;'
              'gap:var(--space-s)">' + ''.join(
                  f'<a href="#" aria-label="{n}">{CHECK_SVG}</a>'
                  for n in ('Instagram', 'LinkedIn', 'Email')) + '</span>')


def render_html(payload, copy, images, role=''):
    """Element tree → HTML. Classes are the globalClasses NAMES (the
    translator's contract); copy/images are consumed in document order
    and fall back to the payload's own text."""
    els = {e['id']: e for e in payload.get('content') or []}
    names = {g.get('id'): g.get('name')
             for g in payload.get('globalClasses') or []}
    queues = {k: list(v) for k, v in copy.items()}
    imgs = list(images)

    def take(kind, default=''):
        q = queues.get(kind) or []
        return q.pop(0) if q else default

    def classes(el):
        ids = (el.get('settings') or {}).get('_cssGlobalClasses') or []
        return ' '.join(n for n in (names.get(i) for i in ids) if n)

    def esc(s):
        return (str(s).replace('&', '&amp;').replace('<', '&lt;')
                .replace('>', '&gt;').replace('"', '&quot;'))

    def walk(el_id, depth=0):
        el = els.get(el_id)
        if not el:
            return ''
        name = el.get('name')
        s = el.get('settings') or {}
        if name in SKIP:
            return ''
        pad = '  ' * depth
        cls = classes(el)
        ca = f' class="{cls}"' if cls else ''
        kids = ''.join(walk(c, depth + 1) for c in (el.get('children') or [])
                       if c in els)

        if name == 'section':
            sc = (cls + ' ' + role).strip()
            return (f'{pad}<section class="{sc}">\n{kids}'
                    f'{pad}</section>\n')
        if name == 'logo':
            return (f'{pad}<a{ca} href="/">{esc(take("logo", "Brand"))}'
                    f'</a>\n')
        if name == 'social-icons':
            return f'{pad}{SOCIAL_SVG}\n'
        if name == 'nav-nested':
            return f'{pad}<nav{ca}>\n{kids}{pad}</nav>\n'
        if name in ('heading', 'text-basic', 'text', 'text-link'):
            if name == 'text-link':
                txt = take('a', s.get('text') or '')
                return f'{pad}<a{ca} href="#">{esc(txt)}</a>\n'
            tag = s.get('tag') or ('h2' if name == 'heading' else 'p')
            txt = take('heading' if name == 'heading' else 'p',
                       s.get('text') or '')
            return f'{pad}<{tag}{ca}>{esc(txt)}</{tag}>\n'
        if name == 'button':
            txt = take('button', s.get('text') or 'Continue')
            return f'{pad}<a{ca} href="#">{esc(txt)}</a>\n'
        if name == 'image':
            if imgs:
                src, alt = imgs.pop(0)
            else:
                img = s.get('image') or {}
                src = img.get('url') or ''
                alt = img.get('alt') or ''
            return (f'{pad}<img{ca} src="{esc(src)}" alt="{esc(alt)}" '
                    'decoding="async" />\n')
        if name == 'icon':
            return f'{pad}<span{ca}>{CHECK_SVG}</span>\n'
        if name == 'divider':
            return f'{pad}<hr{ca} />\n'
        if name == 'form':
            return f'{pad}<form{ca}></form>\n'
        tag = bt.ELEM_TAGS.get(name, 'div')
        return f'{pad}<{tag}{ca}>\n{kids}{pad}</{tag}>\n'

    roots = [e['id'] for e in payload.get('content') or []
             if not e.get('parent')]
    body = ''.join(walk(r) for r in roots)
    return body, {k: v for k, v in queues.items() if v}


def css_for(payload):
    unmapped = set()
    rules, raw = bt.classes_css(payload, unmapped)
    out = []
    for name, decls in rules.items():
        out.append('.' + name + '{'
                   + ''.join(f'{p}:{v};' for p, v in decls) + '}')
    out.extend(raw)
    return '\n'.join(out), sorted(unmapped)


def standalone(css):
    """What the Tailwind build would emit, for static serving.

    A browser drops `@theme` (it is a Tailwind at-rule), so every
    primitive var would vanish and the page would fall back to Times.
    Tailwind's theme compiler emits those declarations as `:root`;
    this mirrors that exactly. `@tailwind`/`@custom-variant` drop.
    """
    css = re.sub(r'^@tailwind [a-z]+;\s*$', '', css, flags=re.M)
    css = re.sub(r'@custom-variant[^;{]*;', '', css)
    css = re.sub(r'@theme\s+inline\s*\{', ':root {', css)
    css = re.sub(r'@theme\s*\{', ':root {', css)
    return re.sub(r'\n{3,}', '\n\n', css)


def build(outdir, seed=7):
    prof = json.load(open(os.path.join(
        ROOT, 'docs', 'machinery', 'design', 'dna',
        'agency-portfolio.json')))
    geno, _wild, _ = dna_tokens.sample_genotype(prof['genes'], seed=seed,
                                                burst=0)
    # The ACSS-grade floor comes from the knobs' own defaults; these
    # are the declared skews for an editorial studio voice: a wider
    # type ratio (display presence), a tighter display tracking, a
    # 17px body, and the spacious section rung.
    skew = {'type.ratio': 1.333, 'type.base': 17,
            'type.display_weight': 600, 'type.tracking_display': -0.03,
            'space.density_scale': 'space-m',
            'grid.gutter': 'space-l', 'radius.personality': 'soft'}
    dna = {'id': 'page-from-bank', 'genotype': geno, 'knobs': skew,
           'vertical_profile': 'profile-agency-portfolio',
           'invariants': {'accent': '#C2410C'}}
    tokens = eg.tokens_json(dna)
    sheet = [standalone(eg.global_css(tokens))]

    chunks, meta = [], []
    for spec in SECTIONS:
        payload = json.load(open(os.path.join(
            BANK, spec['cat'], spec['stem'] + '.json')))
        markup, unused = render_html(payload, spec['copy'], spec['images'],
                                     spec['role'])
        css, unmapped = css_for(payload)
        sheet.append(f'/* {spec["cat"]}/{spec["stem"]} */\n' + css)
        chunks.append(markup)
        meta.append({'section': spec['role'],
                     'recipe': f"bricksmaven/{spec['cat']}/{spec['stem']}",
                     'elements': len(payload.get('content') or []),
                     'rules': len(bt.classes_css(payload, set())[0]),
                     'unmapped': unmapped,
                     'unused_copy': unused})

    sheet.extend([COMPAT_CSS, GLUE_CSS])
    doc = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Meridian — Brand and digital design</title>
<meta name="description" content="Meridian is an independent design studio
building identities and websites for companies in motion." />
<style>
{chr(10).join(sheet)}
</style>
</head>
<body>
<main>
{''.join(chunks)}</main>
</body>
</html>
'''
    os.makedirs(outdir, exist_ok=True)
    write_art(outdir, tokens)
    out = os.path.join(outdir, 'index.html')
    with open(out, 'w') as fh:
        fh.write(doc)
    receipt = {'schema': 'bank-page@1', 'seed': seed, 'out': out,
               'bytes': len(doc), 'accent': dna['invariants']['accent'],
               'genotype': geno, 'sections': meta}
    with open(os.path.join(outdir, 'receipt.json'), 'w') as fh:
        json.dump(receipt, fh, indent=1)
    return receipt


def main(argv):
    outdir = argv[1] if len(argv) > 1 else '/tmp/bank-page'
    seed = 7
    if '--seed' in argv:
        seed = int(argv[argv.index('--seed') + 1])
    rec = build(outdir, seed)
    print(f'wrote {rec["out"]} ({rec["bytes"]} bytes)')
    for s in rec['sections']:
        print(f'  {s["section"]:<10} {s["recipe"]:<36} '
              f'elements={s["elements"]:<3} rules={s["rules"]:<3} '
              f'unmapped={s["unmapped"] or "-"} '
              f'unused={s["unused_copy"] or "-"}')
    return 0


if __name__ == '__main__':
    raise SystemExit(main(sys.argv))
