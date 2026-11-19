#!/usr/bin/env python3
"""gen_fixtures.py — regenerate tools/design-gate/fixtures/.

Every script check gets fixtures/<check>/{pass,fail}/ — a minimal
pipeline dir that MUST pass / MUST fail that check. `gate.py selftest`
runs each check against both. Deterministic: delete fixtures/, rerun.

Layout: fixtures/_base/ is the shared good pipeline. Each fail/ dir is
_base with one seeded violation; each pass/ dir symlinks to _base
unless the check needs extra files (OVERRIDES).
"""
import hashlib, hmac, json, os, shutil, sys

HERE = os.path.dirname(os.path.abspath(__file__))
FX = os.path.join(HERE, 'fixtures')
sys.path.insert(0, HERE)
import gate  # noqa: E402  (hash helpers for the fixture DNA)


def _png(w, h):
    """A real PNG of (w,h) ≥2KB so screenshot checks see dimensions."""
    import struct, zlib
    def chunk(t, d):
        c = t + d
        return struct.pack('>I', len(d)) + c + struct.pack('>I', zlib.crc32(c) & 0xffffffff)
    ihdr = struct.pack('>IIBBBBB', w, h, 8, 2, 0, 0, 0)
    raw = b''.join(b'\x00' + b'\x11\x22\x33' * w for _ in range(h))
    pad = b'x' * 2048
    return (b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', ihdr)
            + chunk(b'IDAT', zlib.compress(raw))
            + chunk(b'tEXt', pad) + chunk(b'IEND', b''))


SHOTS = {}
for _w in (1280, 768, 360):
    for _mode in ('light', 'dark'):
        SHOTS[f'shots/{_w}-{_mode}-home.png'] = _png(_w, 320)
SHOTS['shots/vs-wireframe.png'] = _png(1280, 320)
SHOTS['shots/vs-tile.png'] = _png(1280, 320)

PLAN = '''# DESIGN-PLAN — fixture site

```yaml
site:
  slug: fixture
  date: 2026-11-19
  design_mode: variants
  sources:
    - copy-contract: STUB.md
    - wireframe: cards/index.html#d1
  intent: {who: tenants, one_action: book, worst_case: lost bond}
  direction:
    temperature: warm
    density: regular
    finish: flat
    type_contrast: single-family-weight-contrast
    shape: p3
    motion: subtle
    refused: the generic default
  system:
    type:
      fonts: {display: "Inter", body: "Inter"}
      ranks: {body: {step: 0, weight: 400}}
    space:
      unit: 4px
      scale: [4, 8, 12, 16, 24, 32, 48, 64, 96, 128]
      section_densities: {compact: {py: space-4}, regular: {py: space-6}, spacious: {py: space-9}}
      group_gap_vs_section_gap: "≥2×"
    grid:
      measure: 62ch
      content_width: 72rem
      edge_padding: [16, 24, 32, 40, 48]
      breakpoints: [360, 640, 768, 1024, 1280, 1440, 1920]
      stack_order: text-first
    color:
      roles:
        bg: {value: "#FDFCFA"}
        surface: {value: "#F1EFEC"}
        ink: {value: "#221F1B"}
        ink_muted: {value: "#6F665D"}
        accent: {value: "#0055AA"}
        accent_foreground: {value: "#FFFFFF"}
        inverse: {value: "#1D2325"}
    contrast_axes: {heading_vs_body: size}
    icons: {family: lucide, style: outline, stroke_class: regular}
    media: {treatment: natural, authenticity: t1-first-party}
    copy: {cta_person: second, reading_level: "grade-8"}
  motif: {device: hairline-numeral, recurs_at: [steps], break: {where: end-act, how: inverse}}
burst: 2
dna:
  profile: profile-services
  genotype: {layout-archetype: split-media, page-macro-structure: promise-proof-how-act, density-tier: regular, image-led-ratio: balanced, type-contrast: medium, display-face: sans, radius-personality: soft, surface-rhythm: one-contrast-moment, cta-restraint: single-primary, cta-rank: hero, disclosure-tier: open, nav-pattern: bar-cta, motion-tier: subtle, proof-type: logos, media-treatment: photo, columns: "3", heading-form: claim, whitespace-band: medium, gallery-mode: grid, form-presence: inline, mood-energy: calm, mood-register: approachable, image-style: minimal}
options:
  - {name: d1, wildcard: false, temperature: warm, shape: p3-friendly}
  - {name: d2, wildcard: false, temperature: cool, shape: p2-subtle}
  - {name: d3, wildcard: true, temperature: warm, shape: p4, mutates: [radius-personality, motion-tier]}
decisions:
  - {rule_id: L.3, what: hero runs edge-to-edge, why: one memorable fold, where: hero, compensating: inner measure kept at 62ch}
pages:
  home:
    page_class: money
    idea: A fixture page that proves the gates.
    rhetoric: [promise, proof, how, act]
    sections:
      - {name: nav, wf_ref: "cards/index.html#d1:nav", speech_act: [chrome], category: headers, surface: base, density: compact, composition: nav-bar, emphasis: nav, align: center-axis, stack: text-first, collapse: burger, media_ratio: none, disclosure: open}
      - {name: hero, wf_ref: "cards/index.html#d1:hero", speech_act: [promise, act], category: hero, surface: base, density: spacious, composition: split-media, emphasis: headline, align: col-1-edge, stack: text-first, collapse: stacked, media_ratio: "16:9", disclosure: open}
      - {name: macro, wf_ref: "cards/index.html#d1:macro", speech_act: [detail], category: content, surface: muted, density: regular, composition: cards-n, emphasis: answer, align: col-1-edge, stack: text-first, collapse: "2-col", media_ratio: none, disclosure: open, vector: [{heading: "What is testing?", fs: "Testing is the thing."}]}
      - {name: end-act, wf_ref: "cards/index.html#d1:end-act", speech_act: [act], category: contact, surface: inverse, density: spacious, composition: form-panel, emphasis: form, align: col-1-edge, stack: text-first, collapse: stacked, media_ratio: none, disclosure: open}
      - {name: footer, wf_ref: "cards/index.html#d1:footer", speech_act: [chrome], category: footer, surface: base, density: compact, composition: footer-bar, emphasis: columns, align: center-axis, stack: text-first, collapse: "1-col", media_ratio: none, disclosure: open}
```
'''

WIREFRAME = '''<!doctype html><html><head><meta name="viewport" content="width=device-width"></head><body>
<div class="card" id="d1">
<nav class="nav" data-sec="nav" data-comp="nav-bar" data-ratio="none" data-disclosure="open"></nav>
<section class="sec hero" data-sec="hero" data-comp="split-media" data-ratio="16:9" data-disclosure="open"></section>
<section class="sec" data-sec="macro" data-comp="cards-n" data-ratio="none" data-disclosure="open"></section>
<section class="sec" data-sec="end-act" data-comp="form-panel" data-ratio="none" data-disclosure="open"></section>
<section class="sec" data-sec="footer" data-comp="footer-bar" data-ratio="none" data-disclosure="open"></section>
</div>
<div class="card" id="d2">
<nav class="nav" data-sec="nav" data-comp="nav-bar" data-ratio="none" data-disclosure="open"></nav>
<section class="sec hero" data-sec="hero" data-comp="stacked-hero" data-ratio="21:9" data-disclosure="open"></section>
<section class="sec" data-sec="macro" data-comp="comparison" data-ratio="none" data-disclosure="open"></section>
<section class="sec" data-sec="end-act" data-comp="full-bleed" data-ratio="none" data-disclosure="open"></section>
<section class="sec" data-sec="footer" data-comp="footer-bar" data-ratio="none" data-disclosure="open"></section>
</div>
</body></html>'''

STUB = '''# STUB — /fixture/

| Field | Value |
|---|---|
| **H1** | Testing Site |

## Heading vector

| Zone | Heading | First sentence / FS (write this) | Link slot |
|---|---|---|---|
| macro | H2 What is testing? | "Testing is the thing." | — |

## Per-section semantic map
'''

SPEC = '''# SPEC — /fixture/

```yaml
page: home
sections:
  - {name: nav, wf_ref: "cards/index.html#d1:nav", speech_act: [chrome], category: headers, surface: base, density: compact, composition: nav-bar, emphasis: nav, align: center-axis, stack: text-first, collapse: burger, media_ratio: none, disclosure: open}
  - {name: hero, wf_ref: "cards/index.html#d1:hero", speech_act: [promise, act], category: hero, surface: base, density: spacious, composition: split-media, emphasis: headline, align: col-1-edge, stack: text-first, collapse: stacked, media_ratio: "16:9", disclosure: open}
  - {name: macro, wf_ref: "cards/index.html#d1:macro", speech_act: [detail], category: content, surface: muted, density: regular, composition: cards-n, emphasis: answer, align: col-1-edge, stack: text-first, collapse: "2-col", media_ratio: none, disclosure: open, vector: [{heading: "What is testing?", fs: "Testing is the thing."}]}
  - {name: end-act, wf_ref: "cards/index.html#d1:end-act", speech_act: [act], category: contact, surface: inverse, density: spacious, composition: form-panel, emphasis: form, align: col-1-edge, stack: text-first, collapse: stacked, media_ratio: none, disclosure: open}
  - {name: footer, wf_ref: "cards/index.html#d1:footer", speech_act: [chrome], category: footer, surface: base, density: compact, composition: footer-bar, emphasis: columns, align: center-axis, stack: text-first, collapse: "1-col", media_ratio: none, disclosure: open}
```
'''

GLOBAL_CSS = '''@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --c-ink: #111111;
  --c-paper: #ffffff;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 150ms !important;
    transition: opacity 150ms linear !important;
    transform: none !important;
  }
}

.dark {
  --c-ink: #EDEBE7;
  --c-paper: #14181A;
}

@layer components {
  .sec-band { padding-block: var(--py); }
  .sec-inner { max-width: 72rem; margin-inline: auto; }
  .ratio-portrait { aspect-ratio: 3 / 4; }
  .variant-stage { container-type: inline-size; }
  .variant-switcher { position: sticky; top: 0; }
  .btn-primary { min-height: var(--tap); }
  .burger { display: none; }
  .inverse { background: var(--c-ink); color: var(--c-paper); }
  .fold-row { border-top: 1px solid var(--c-line); }
  .card-grid { display: grid; gap: var(--space-4); }
}
'''

TAILWIND_CFG = '''/** generated from TOKENS.json — fixture */
export default {
  darkMode: 'class',
  content: ['./src/**/*.{astro,html}'],
  theme: { extend: {
    colors: { ink: '#221f1b', paper: '#fdfcfa', accent: '#0055aa',
      surface: '#f1efec', border: '#d8d3cc', inverse: '#1d2325',
      darkbg: '#14181a', darksurface: '#1c2224', darkink: '#edebe7',
      darkborder: '#2c3437', darkinverse: '#f4f2ee',
      darkelev: '#232a2c', darkaccent: '#4c93d6', darkaccentfg: '#0e1416',
      muted: '#6f665d', darkmuted: '#a8a49d', elev: '#ebe7e1',
      white: '#ffffff' },
    fontSize: { 'fluid-0': 'var(--fs-0)' },
    borderRadius: { card: 'var(--r-card)' },
    spacing: { tap: '44px' },
  } },
}
'''

KNOBS = {
    "type.ratio": 1.25, "type.base": 16, "type.display_weight": 700,
    "type.tracking_display": -0.02, "space.density_scale": 0,
    "space.section_py": {"compact": 48, "regular": 64, "spacious": 96},
    "grid.gutter": 24, "radius.personality": "p3",
    "color.surface_contrast": 0.05, "color.accent_usage": "cta+motif",
    "color.neutral_tint": 0.03, "elevation.level": 1,
    "motion.level": "subtle", "image.treatment": "natural",
}

LIGHT = {"bg": "#FDFCFA", "surface": "#F1EFEC", "surface_elevated": "#EBE7E1",
         "border": "#D8D3CC", "ink": "#221F1B", "ink_muted": "#6F665D",
         "accent": "#0055AA", "accent_foreground": "#FFFFFF",
         "inverse": "#1D2325"}
DARK = {"bg": "#14181A", "surface": "#1C2224", "surface_elevated": "#232A2C",
        "border": "#2C3437", "ink": "#EDEBE7", "ink_muted": "#A8A49D",
        "accent": "#4C93D6", "accent_foreground": "#0E1416",
        "inverse": "#F4F2EE"}

TOKENS = json.dumps({
    "knobs": KNOBS,
    "color": {
        "modes": {"light": {"roles": LIGHT}, "dark": {"roles": DARK}},
        "roles": LIGHT,
    },
}, indent=1)

PAGE_HTML = '''<!doctype html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<script>(function(){var s=localStorage.getItem('theme');var m=s||(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.dataset.theme=m;})();</script>
</head><body>
<button data-theme-toggle aria-label="Light or dark">Light/Dark</button>
<nav data-sec="nav" data-comp="nav-bar" data-ratio="none" data-disclosure="open"
     class="flex items-center gap-4">
  <button class="burger btn-primary" aria-label="Menu">Menu</button>
</nav>
<section data-sec="hero" data-comp="split-media" data-ratio="16:9" data-disclosure="open" class="sec-band py-24">
  <h1 class="text-fluid-0">Testing Site</h1>
  <p>Testing is the thing.</p>
  <img src="hero.webp" width="800" height="600" loading="eager" fetchpriority="high" alt="hero">
</section>
<section data-sec="macro" data-comp="cards-n" data-ratio="none" data-disclosure="open" class="card-grid">
  <h2 class="text-fluid-0">What is testing?</h2>
  <p>Testing is the thing.</p>
  <svg width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14"/></svg>
</section>
<section data-sec="end-act" data-comp="form-panel" data-ratio="none" data-disclosure="open" class="sec-band inverse">
  <p class="text-fluid-0">Book now</p>
  <form><button class="btn-primary">Book now</button></form>
</section>
<section data-sec="footer" data-comp="footer-bar" data-ratio="none" data-disclosure="open" class="sec-band">
  <p>Fixture Co, 1 Test St</p>
</section>
</body></html>'''

SYSTEM_ASTRO = '''---
import NavBar from '../components/nav-bar.astro';
import SplitMedia from '../components/split-media.astro';
import CardsN from '../components/cards-n.astro';
import FormPanel from '../components/form-panel.astro';
import FooterBar from '../components/footer-bar.astro';
---
<button data-theme-toggle aria-label="Light or dark">Light/Dark</button>
<NavBar /><SplitMedia /><CardsN /><FormPanel /><FooterBar />
'''

COMP_ASTRO = '<div class="sec-band"><slot /></div>\n'


SECTIONS = {
    'Nav.astro': '''---
exemplar: nav-bar
---
<nav class="flex items-center justify-between gap-fluid-s" aria-label="Primary">
  <a class="text-fluid-0 font-bold" href="/">Fixture Co</a>
  <a class="btn-primary" href="#book">Book</a>
</nav>
''',
    'Hero.astro': '''---
exemplar: split-media
---
<div class="grid gap-stack md:grid-cols-2">
  <div class="max-w-prose">
    <h1 class="text-fluid-4">Fixture Co</h1>
    <p class="mt-stack text-fluid-0">Testing is the thing.</p>
  </div>
  <figure class="ratio-portrait overflow-hidden rounded-card">
    <img class="h-full w-full object-cover" src="/media/hero.svg" alt="hero"
         width="900" height="1200" />
  </figure>
</div>
''',
    'Macro.astro': '''---
exemplar: cards-n
---
<div>
  <h2 class="text-fluid-2">What is testing?</h2>
  <p class="mt-stack text-fluid-0">Testing is the thing.</p>
  <ul class="card-grid mt-fluid-l">
    <li class="rounded-card border border-muted p-fluid-m">One</li>
  </ul>
</div>
''',
    'EndAct.astro': '''---
exemplar: form-panel
---
<div class="grid gap-fluid-l md:grid-cols-2">
  <div class="max-w-prose">
    <h2 class="text-fluid-3">Book now</h2>
    <p class="mt-stack text-fluid-0">One action.</p>
  </div>
  <form class="grid gap-fluid-s" novalidate>
    <label class="grid gap-fluid-s text-fluid--1">
      <span>Email</span>
      <input class="rounded-card border border-muted p-fluid-s text-fluid-0"
             type="email" name="email" />
    </label>
    <button class="btn-primary" type="submit">Book now</button>
  </form>
</div>
''',
    'Footer.astro': '''---
exemplar: footer-bar
---
<footer class="grid gap-stack text-fluid--1 md:grid-cols-2">
  <p>Fixture Co, 1 Test St</p>
  <ul class="flex flex-wrap gap-fluid-m">
    <li><a class="underline" href="/terms">Terms</a></li>
  </ul>
</footer>
''',
}
# The composition component owns the skeleton (P.6); the section instance
# binds the plan row's content and renders it (SB.2) — one implementation.
COMPONENTS = {}
for _fn, _src in SECTIONS.items():
    _fm, _body = _src.split('---', 2)[1], _src.split('---', 2)[2]
    _comp = _fm.strip().split('exemplar:')[1].strip()
    COMPONENTS[_comp] = _body.lstrip('\n')
SECTIONS = {
    _fn: ('---\nexemplar: ' + _comp + '\nimport '
          + ''.join(w.capitalize() for w in _comp.split('-'))
          + " from '../" + _comp + ".astro';\n---\n<"
          + ''.join(w.capitalize() for w in _comp.split('-')) + ' />\n')
    for _fn, _comp in (('Nav.astro', 'nav-bar'), ('Hero.astro', 'split-media'),
                       ('Macro.astro', 'cards-n'),
                       ('EndAct.astro', 'form-panel'),
                       ('Footer.astro', 'footer-bar'))
}


COMPONENTS_MD = '''# COMPONENTS
nav-bar → nav-bar.astro
split-media → split-media.astro
cards-n → cards-n.astro
form-panel → form-panel.astro
footer-bar → footer-bar.astro
'''

MOBBIN = '''# MOBBIN-REFS — consulted before direction (W1) and per composition (W5)

| id / url | kind | informs | wave |
|---|---|---|---|
| https://mobbin.com/screens/abc123 | screen | home · split-media · hero layout | w1 |
| https://mobbin.com/screens/abc124 | screen | home · split-media · media ratio | w1 |
| https://mobbin.com/screens/abc125 | section | home · split-media · CTA restraint | w1 |
| https://mobbin.com/screens/def456 | section | home · cards-n · card density | w1 |
| https://mobbin.com/screens/def457 | section | home · cards-n · card radius | w1 |
| https://mobbin.com/screens/def458 | screen | home · cards-n · three-up grid | w1 |
| https://mobbin.com/screens/ghi789 | screen | home · form-panel · field stack | w1 |
| https://mobbin.com/screens/ghi790 | screen | home · form-panel · label placement | w1 |
| https://mobbin.com/screens/ghi791 | section | home · form-panel · submit emphasis | w1 |
| https://mobbin.com/screens/jkl012 | screen | home · nav-bar · sticky bar | w1 |
| https://mobbin.com/screens/jkl013 | screen | home · nav-bar · nav CTA | w1 |
| https://mobbin.com/screens/jkl014 | section | home · nav-bar · logo scale | w1 |
| https://mobbin.com/screens/mno345 | screen | home · footer-bar · footer density | w1 |
| https://mobbin.com/screens/mno346 | section | home · footer-bar · legal row | w1 |
| https://mobbin.com/screens/mno347 | screen | home · footer-bar · contact block | w1 |
'''

REVIEW = '''{
"modes": {"light": {"pass": true}, "dark": {"pass": true}},
"reviewer_model": "opus-4",
"designer_model": "swe-2",
"nonce": "fixture-nonce",
"items": [
{
"rule": "C.3",
"rubric": "neutral-tint",
"pass": true,
"evidence": "shots/1280-light-home.png",
"note": ""
},
{
"rule": "C.4",
"rubric": "accent-harmony",
"pass": true,
"evidence": "shots/1280-light-home.png",
"note": ""
},
{
"rule": "C.6",
"rubric": "derivation-order",
"pass": true,
"evidence": "shots/1280-light-home.png",
"note": ""
},
{
"rule": "E.3",
"rubric": "seo-lint",
"pass": true,
"evidence": "shots/1280-light-home.png",
"note": ""
},
{
"rule": "G.2",
"rubric": "proximity-law",
"pass": true,
"evidence": "shots/1280-light-home.png",
"note": ""
},
{
"rule": "G.4",
"rubric": "gutter-devices",
"pass": true,
"evidence": "shots/1280-light-home.png",
"note": ""
},
{
"rule": "I.4",
"rubric": "icon-text-pairing",
"pass": true,
"evidence": "shots/1280-light-home.png",
"note": ""
},
{
"rule": "I.6",
"rubric": "icon-literal",
"pass": true,
"evidence": "shots/1280-light-home.png",
"note": ""
},
{
"rule": "I.7",
"rubric": "icon-states",
"pass": true,
"evidence": "shots/1280-light-home.png",
"note": ""
},
{
"rule": "L.3",
"rubric": "edge-insets",
"pass": true,
"evidence": "shots/1280-light-home.png",
"note": ""
},
{
"rule": "L.4",
"rubric": "negative-space-gestalt",
"pass": true,
"evidence": "shots/1280-light-home.png",
"note": ""
},
{
"rule": "L.5",
"rubric": "collapse-integrity",
"pass": true,
"evidence": "shots/1280-light-home.png",
"note": ""
},
{
"rule": "L.6",
"rubric": "negative-space-gestalt",
"pass": true,
"evidence": "shots/1280-light-home.png",
"note": ""
},
{
"rule": "L.9",
"rubric": "asymmetry-desktop",
"pass": true,
"evidence": "shots/1280-light-home.png",
"note": ""
},
{
"rule": "M.2",
"rubric": "motion-tokens",
"pass": true,
"evidence": "shots/1280-light-home.png",
"note": ""
},
{
"rule": "M.3",
"rubric": "motion-element-class",
"pass": true,
"evidence": "shots/1280-light-home.png",
"note": ""
},
{
"rule": "M.4",
"rubric": "motion-personality",
"pass": true,
"evidence": "shots/1280-light-home.png",
"note": ""
},
{
"rule": "M.5",
"rubric": "parallax-license",
"pass": true,
"evidence": "shots/1280-light-home.png",
"note": ""
},
{
"rule": "M.6",
"rubric": "reduced-motion",
"pass": true,
"evidence": "shots/1280-light-home.png",
"note": ""
},
{
"rule": "M.8",
"rubric": "motion-personality",
"pass": true,
"evidence": "shots/1280-light-home.png",
"note": ""
},
{
"rule": "R.4",
"rubric": "copy-density",
"pass": true,
"evidence": "shots/1280-light-home.png",
"note": ""
},
{
"rule": "R.5",
"rubric": "above-fold-360",
"pass": true,
"evidence": "shots/1280-light-home.png",
"note": ""
},
{
"rule": "R.7",
"rubric": "sizing-modes",
"pass": true,
"evidence": "shots/1280-light-home.png",
"note": ""
},
{
"rule": "S.3",
"rubric": "component-radius",
"pass": true,
"evidence": "shots/1280-light-home.png",
"note": ""
},
{
"rule": "S.4",
"rubric": "concentric-radius",
"pass": true,
"evidence": "shots/1280-light-home.png",
"note": ""
},
{
"rule": "S.5",
"rubric": "border-widths",
"pass": true,
"evidence": "shots/1280-light-home.png",
"note": ""
},
{
"rule": "S.6",
"rubric": "shape-permissions",
"pass": true,
"evidence": "shots/1280-light-home.png",
"note": ""
},
{
"rule": "S.7",
"rubric": "elevation-radius",
"pass": true,
"evidence": "shots/1280-light-home.png",
"note": ""
},
{
"rule": "S.8",
"rubric": "one-personality",
"pass": true,
"evidence": "shots/1280-light-home.png",
"note": ""
},
{
"rule": "T.0",
"rubric": "type-restraint",
"pass": true,
"evidence": "shots/1280-light-home.png",
"note": ""
},
{
"rule": "T.1",
"rubric": "three-tier-read-order",
"pass": true,
"evidence": "shots/1280-light-home.png",
"note": ""
},
{
"rule": "T.5",
"rubric": "composition-inset",
"pass": true,
"evidence": "shots/1280-light-home.png",
"note": ""
},
{
"rule": "T.7",
"rubric": "section-type-application",
"pass": true,
"evidence": "shots/1280-light-home.png",
"note": ""
},
{
"rule": "T.9",
"rubric": "reading-path",
"pass": true,
"evidence": "shots/1280-light-home.png",
"note": ""
},
{
"rule": "T.10",
"rubric": "composition-inset",
"pass": true,
"evidence": "shots/1280-light-home.png",
"note": ""
},
{
"rule": "T.11",
"rubric": "type-refusals",
"pass": true,
"evidence": "shots/1280-light-home.png",
"note": ""
},
{
"rule": "V.0",
"rubric": "media-words-first",
"pass": true,
"evidence": "shots/1280-light-home.png",
"note": ""
},
{
"rule": "V.1",
"rubric": "media-matrix",
"pass": true,
"evidence": "shots/1280-light-home.png",
"note": ""
},
{
"rule": "V.4",
"rubric": "scrim-contrast",
"pass": true,
"evidence": "shots/1280-light-home.png",
"note": ""
},
{
"rule": "V.5",
"rubric": "bg-density",
"pass": true,
"evidence": "shots/1280-light-home.png",
"note": ""
},
{
"rule": "V.7",
"rubric": "art-direction",
"pass": true,
"evidence": "shots/1280-light-home.png",
"note": ""
},
{
"rule": "V.8",
"rubric": "media-qa",
"pass": true,
"evidence": "shots/1280-light-home.png",
"note": ""
},
{
"rule": "W.1",
"rubric": "tone-errors",
"pass": true,
"evidence": "shots/1280-light-home.png",
"note": ""
},
{
"rule": "W.3",
"rubric": "heading-labels",
"pass": true,
"evidence": "shots/1280-light-home.png",
"note": ""
},
{
"rule": "W.5",
"rubric": "tone-errors",
"pass": true,
"evidence": "shots/1280-light-home.png",
"note": ""
},
{
"rule": "W.6",
"rubric": "empty-states",
"pass": true,
"evidence": "shots/1280-light-home.png",
"note": ""
},
{
"rule": "W.7",
"rubric": "link-scent",
"pass": true,
"evidence": "shots/1280-light-home.png",
"note": ""
},
{
"rule": "W.9",
"rubric": "i18n-copy",
"pass": true,
"evidence": "shots/1280-light-home.png",
"note": ""
},
{
"rule": "W.10",
"rubric": "writing-qa",
"pass": true,
"evidence": "shots/1280-light-home.png",
"note": ""
}
],
"style": [
{
"item": "intent-legible",
"pass": true,
"note": "deliberate"
},
{
"item": "coherence",
"pass": true,
"note": "same tokens"
},
{
"item": "focal-payoff",
"pass": true,
"note": "fold is the moment"
},
{
"item": "restraint",
"pass": true,
"note": "once only"
},
{
"item": "on-brand",
"pass": true,
"note": "within profile"
}
]
}'''

CHECKLIST_W2 = '''# W2 checklist

| Rule | Evidence |
|---|---|
| D.3 options distinct | DESIGN-PLAN.md options block, 3 rows |
| C.2 temperature | DESIGN-PLAN.md direction.temperature |
| B.3 wildcard labelled | DESIGN-PLAN.md options d3 |
'''

CHECKLIST_W5 = '''# W5 checklist

| Rule | Evidence |
|---|---|
| P.4 rows 1:1 | DESIGN-PLAN.md pages.home.sections |
| D.4 compositions | DESIGN-PLAN.md sections[].composition |
| PS.1 one role per row | DESIGN-PLAN.md sections[].speech_act |
'''

SECTION_ASTRO = '''---
interface Props {
  sec: string;
  comp: string;
  'wf-ref'?: string;
  ratio?: string;
  disclosure?: string;
  surface?: string;
  density?: string;
}
const { sec, comp, 'wf-ref': wfRef, ratio = 'none', disclosure = 'open',
        surface = 'base', density = 'regular' } = Astro.props;
---
<section class="sec-band" data-sec={sec} data-comp={comp} data-ratio={ratio}
         data-disclosure={disclosure} data-surface={surface}
         data-density={density} data-wf-ref={wfRef}>
  <div class="sec-inner"><slot /></div>
</section>
'''

def dna_doc():
    doc = {
        "version": 1,
        "site": "fixture",
        "vertical_profile": "profile-services",
        "genotype": {
            "layout-archetype": "split-media",
            "page-macro-structure": "promise-proof-how-act",
            "density-tier": "regular", "image-led-ratio": "balanced",
            "type-contrast": "medium", "display-face": "sans",
            "radius-personality": "soft",
            "surface-rhythm": "one-contrast-moment",
            "cta-restraint": "single-primary", "cta-rank": "hero",
            "disclosure-tier": "open", "nav-pattern": "bar-cta",
            "motion-tier": "subtle", "proof-type": "logos",
            "media-treatment": "photo", "columns": "3",
            "heading-form": "claim", "whitespace-band": "medium",
            "gallery-mode": "grid", "form-presence": "inline",
            "mood-energy": "calm", "mood-register": "approachable",
            "image-style": "minimal",
        },
        "knobs": KNOBS,
        "modes": {"light": LIGHT, "dark": DARK},
        "invariants": {"accent": "#0055AA", "logo": "wordmark",
                       "fonts": {"display": "Inter", "body": "Inter"}},
        "constraints": {"likes": ["calm editorial spacing"],
                        "dislikes": ["gradient meshes"],
                        "references": ["mobbin:app/linear"]},
        "rhythm": [
            {"section": "nav", "surface": "base", "density": "compact"},
            {"section": "hero", "surface": "base", "density": "spacious"},
            {"section": "macro", "surface": "muted", "density": "regular"},
            {"section": "end-act", "surface": "inverse",
             "density": "spacious"},
            {"section": "footer", "surface": "base", "density": "compact"},
        ],
        "variants": [
            {"id": "v1", "vector": "best-predicted", "baseline": True,
             "deltas": {}, "sheet_pass": {"light": True, "dark": True},
             "pass": True, "score": 84, "wildcard_breaks": []},
            {"id": "v2", "vector": "typography-led",
             "deltas": {"type.ratio": 1.3625, "type.display_weight": 800,
                        "type.tracking_display": -0.035,
                        "color.neutral_tint": 0.06},
             "sheet_pass": {"light": True, "dark": True},
             "pass": True, "score": 81, "wildcard_breaks": []},
            {"id": "v3", "vector": "wildcard",
             "deltas": {"radius.personality": "p4",
                        "motion.level": "playful",
                        "elevation.level": 3,
                        "image.treatment": "duotone"},
             "sheet_pass": {"light": True, "dark": True},
             "pass": True, "score": 78,
             "wildcard_breaks": ["S.1"]},
        ],
        "vector_targets": {
            "ease_of_use": 7, "clarity": 8, "layout": 6,
            "typography": 7, "colour": 6, "rhythm": 6,
            "imagery": 5, "trust": 8, "conversion": 9,
            "seo": 8, "mobile": 8, "speed": 9, "a11y": 8,
        },
        "provenance": {
            "type.ratio": {"tag": "snapped",
                           "patterns": ["pattern-hero-split"], "n": 24},
            "type.base": {"tag": "snapped",
                          "patterns": ["pattern-hero-split"], "n": 24},
            "space.section_py": {"tag": "snapped",
                                 "patterns": ["pattern-cards-n"], "n": 18},
            "grid.gutter": {"tag": "snapped",
                            "patterns": ["pattern-nav-bar"], "n": 21},
            **{k: {"tag": "chosen", "reason": "fixture baseline"}
               for k in KNOBS
               if k not in ("type.ratio", "type.base",
                            "space.section_py", "grid.gutter")},
        },
    }
    doc["hashes"] = gate.dna_slices(doc)
    return doc


BASE = {
    'DNA.json': json.dumps(dna_doc(), indent=1) + '\n',
    'DESIGN-PLAN.md': PLAN,
    'cards/index.html': WIREFRAME,
    'STUB.md': STUB,
    'PAGES/home/SPEC.md': SPEC,
    'TOKENS.json': TOKENS,
    'COMPONENTS.md': COMPONENTS_MD,
    'MOBBIN-REFS.md': MOBBIN,
    'REVIEW.json': REVIEW,
    'NOVELTY.json': '{"distance": 0.21, "bound": 0.35}',
    'CHECKLIST/w2.md': CHECKLIST_W2,
    'CHECKLIST/w5.md': CHECKLIST_W5,
    'audit.md': '# audit\n## Defect table\n- E.1 missing macro H2\n'
                '## keep-list\n- logo.svg\n',
    'site/package.json': '{"name":"fixture","scripts":{"build":"true"}}',
    'site/astro.config.mjs': 'export default {};\n',
    'site/tailwind.config.js': TAILWIND_CFG,
    'site/src/styles/global.css': GLOBAL_CSS,
    'site/src/pages/system.astro': SYSTEM_ASTRO,
    'site/src/pages/index.astro': '',
    **{f'site/src/components/{k}.astro': v
       for k, v in COMPONENTS.items()},
    'site/src/components/Section.astro': SECTION_ASTRO,
    'site/src/components/sections/Nav.astro': SECTIONS['Nav.astro'],
    'site/src/components/sections/Hero.astro': SECTIONS['Hero.astro'],
    'site/src/components/sections/Macro.astro': SECTIONS['Macro.astro'],
    'site/src/components/sections/EndAct.astro': SECTIONS['EndAct.astro'],
    'site/src/components/sections/Footer.astro': SECTIONS['Footer.astro'],
    'CHECKLIST/w3.md': '| Rule | Evidence |\n|---|---|\n'
                       '| T.1 font directory | Inter + Ionicons listed |\n',
    '.wave': 'w3',
    'NOVELTY.json': '{"distance": 0.44, "bound": 0.55}\n',
    'site/dist/home/index.html': PAGE_HTML,
    **SHOTS,
}

# check -> mutator(files dict). 'DEL x' deletes, 'APPEND x y' appends.
def mut(*ops):
    def f(files):
        for op in ops:
            kind = op[0]
            if kind == 'DEL':
                files.pop(op[1], None)
            elif kind == 'APPEND':
                files[op[1]] = files.get(op[1], '') + op[2]
            elif kind == 'SET':
                files[op[1]] = op[2]
            elif kind == 'REPL':
                files[op[1]] = files[op[1]].replace(op[2], op[3])
        return files
    return f

MUT = {
 'check_design_mode': mut(('REPL','DESIGN-PLAN.md','design_mode: variants','design_mode: bogus')),
 'check_intent': mut(('REPL','DESIGN-PLAN.md','who: tenants','who: ""')),
 'check_audit_artifacts': mut(('REPL','DESIGN-PLAN.md','design_mode: variants','design_mode: audit-remodel'),('DEL','audit.md')),
 'check_mobbin_refs': mut(('DEL','MOBBIN-REFS.md'),
                          ('SET','MOBBIN-REFS.md',
                           '# MOBBIN-REFS\n- https://mobbin.com/screens/x\n')),
 'check_image_discovery': mut(
     ('SET','discovery/ref.example/meta.json', json.dumps({
         'url': 'https://ref.example', 'domain': 'ref.example',
         'site_type': 'saas', 'page_type': 'home', 'source': 'reference',
         'schema_version': 'web-meta/1', 'width': 1440, 'height': 4800,
         'tiles': ['tile-00.png'],
         'capture_status': 'blocked',
         'capture_reason': "blocked:cloudflare_just_a_moment "
                           "(title='Just a moment...')",
         'probe': {'status': 403, 'title': 'Just a moment...',
                   'final_url': 'https://ref.example/',
                   'text_sample': 'Verify you are human',
                   'fetched_at': '2026-11-19'},
         'images': [{'file': 'hero.jpg',
                     'medium': {'value': 'photograph', 'confidence': 0.9,
                                'evidence': 'rgb histogram'},
                     'subject_class': {'value': 'people',
                                       'confidence': 0.8},
                     'role_on_page': {'value': 'hero', 'confidence': 0.9},
                     'confidence': 0.8, 'evidence': 'fixture'}]},
         indent=1)),
     ('SET','discovery/ref.example/hero.jpg', '\x89PNG\r\n')),
 'check_layout_distinct': mut(
     ('REPL','preview/layouts.html',
      'data-comp="sequence"', 'data-comp="cards-n"'))
 , 'check_mobile_cta': mut(
     ('APPEND','site/dist/home/index.html',
      '<a class="cta">Act</a><style>@media(max-width:768px)'
      '{.cta{padding:8px}}</style>')),
 'check_scorecard': mut(
     ('DEL','REVIEW.json')),
 'check_measurable': mut(
     ('APPEND','site/dist/home/index.html',
      '<style>p{text-align:justify}.x{transition-duration:600ms}'
      'h2{text-transform:uppercase}</style><h2>A BOLD ALL CAPS TITLE '
      'HEADING</h2>')),
 'check_tile_page_parity': mut(
     ('REPL','site/dist/home/index.html','class="sec-band py-24"',
      'class="sec-band py-24 drift-class"')),
 'check_direction_axes': mut(('REPL','DESIGN-PLAN.md','temperature: warm','temperature: hot')),
 'check_wireframe_tags': mut(('REPL','preview/layouts.html',
    'data-ratio="none" data-disclosure','data-ratio="bogus" data-disclosure')),
 'check_spacing_scale': mut(('REPL','DESIGN-PLAN.md','16, 24, 32','16, 20, 32')),
 'check_breakpoints': mut(('REPL','DESIGN-PLAN.md','640, 768','640, 999')),
 'check_content_width': mut(('REPL','DESIGN-PLAN.md','content_width: 72rem','content_width: 95rem')),
 'check_contrast': mut(('REPL','TOKENS.json','"ink": "#221F1B"','"ink": "#8A8A8A"')),
 'check_type_system': mut(('REPL','DESIGN-PLAN.md','body: "Inter"','body: "SerifX"'),('APPEND','DESIGN-PLAN.md','\n  extra: {fonts: {c: "Third"}}')),
 'check_system_enums': mut(('REPL','DESIGN-PLAN.md','family: lucide','family: wingdings')),
 'check_tailwind_derivation': mut(('REPL','TOKENS.json','#0055AA','#ABCDEF')),
 'check_wireframe_lock': mut(('REPL','DESIGN-PLAN.md','wf_ref: "cards/index.html#d1:hero"','wf_ref: "cards/index.html#d9:nope"'),('REPL','DESIGN-PLAN.md','name: hero','name: hero-x')),
 'check_section_enums': mut(('REPL','DESIGN-PLAN.md','composition: cards-n','composition: bogus-grid')),
 'check_speech_acts': mut(('REPL','DESIGN-PLAN.md','rhetoric: [promise, proof, how, act]','rhetoric: [proof, how]')),
 'check_emphasis': mut(('REPL','DESIGN-PLAN.md','emphasis: headline','emphasis: ""')),
 'check_motif': mut(('REPL','DESIGN-PLAN.md','break: {where: end-act, how: inverse}','break: {}')),
 'check_rhythm': mut(
     ('REPL','DESIGN-PLAN.md','composition: cards-n',
      'composition: split-media'),
     ('REPL','DESIGN-PLAN.md','density: regular',
      'density: spacious'),
     ('REPL','DESIGN-PLAN.md','media_ratio: "16:9"',
      'media_ratio: "1:1"'),
     ('REPL','DESIGN-PLAN.md','surface: muted, density: regular',
      'surface: inverse, density: regular')),
 'check_vector_map': mut(('REPL','DESIGN-PLAN.md','What is testing?','What is invented?')),
 'check_schema_fields': mut(('REPL','DESIGN-PLAN.md',', align: col-1-edge','')),
 'check_spec_verbatim': mut(('REPL','PAGES/home/SPEC.md','composition: cards-n','composition: editorial')),
 'check_components_exist': mut(('DEL','site/src/components/split-media.astro')),
 'check_tile_is_system': mut(('REPL','site/src/pages/system.astro','<SplitMedia />','')),
 'check_class_subset': mut(('REPL','site/dist/home/index.html','class="sec-band"','class="bogus-class"')),
 'check_no_stray_styles': mut(('REPL','site/dist/home/index.html','</head>','<style>a{color:#123456}</style></head>')),
 'check_page_data_attrs': mut(('REPL','site/dist/home/index.html','data-sec="hero"','data-x="hero"')),
 'check_heading_verbatim': mut(('REPL','site/dist/home/index.html','What is testing?','Something else?')),
 'check_viewport': mut(('REPL','site/dist/home/index.html','<meta name="viewport" content="width=device-width, initial-scale=1">','')),
 'check_tap_size': mut(('APPEND','site/dist/home/index.html','<style>a.x{min-height:20px}</style>')),
 'check_speed_budget': mut(('REPL','site/dist/home/index.html','src="hero.webp"','src="hero.jpg"'),('APPEND','site/dist/home/index.html','<script src="https://tracker.example.com/x.js"></script>')),
 'check_mobile_budget': mut(('APPEND','site/dist/home/index.html','<style>.w{width:1200px}</style>')),
 'check_no_emoji': mut(('APPEND','site/dist/home/index.html','<p>Done \U0001F389</p>')),
 'check_icon_discipline': mut(('REPL','site/dist/home/index.html','width="24" height="24" viewBox="0 0 24 24"','width="13" height="13"')),
 'check_review_completeness': mut(('REPL','REVIEW.json','"opus-4"','"swe-2"')),
 'check_scaffold': mut(('DEL','site/src/styles/global.css')),
 'check_burst': mut(('REPL','DESIGN-PLAN.md',
    'name: d2, wildcard: false','name: d2, wildcard: true')),
 'check_declared_breaks': mut(('REPL','DESIGN-PLAN.md',
    'rule_id: L.3','rule_id: P.1')),
 'check_wildcard': mut(('REPL','DESIGN-PLAN.md',
    'composition: cards-n','composition: bogus-grid')),
 'check_genotype': mut(('REPL','DESIGN-PLAN.md',
    'layout-archetype: split-media','layout-archetype: nope')),
 'check_genotype_distinct': mut(('REPL','DESIGN-PLAN.md',
    'temperature: cool, shape: p2-subtle','temperature: warm, shape: p3-friendly'),
    ('REPL','DESIGN-PLAN.md',
     'temperature: warm, shape: p4, mutates: [radius-personality, motion-tier]',
     'temperature: warm, shape: p3-friendly')),
 'check_content_inventory': mut(('DEL','STUB.md')),
 'check_neutral_tint': mut(('REPL','DESIGN-PLAN.md',
    'surface: {value: "#F1EFEC"}','surface: {value: "#8A8A8A"}')),
 'check_proximity': mut(('REPL','DESIGN-PLAN.md',
    'group_gap_vs_section_gap: "≥2×"','group_gap_vs_section_gap: "≥1.2×"')),
 'check_border_widths': mut(('REPL','site/src/styles/global.css',
    'border-top: 1px solid var(--c-line);','border-top: 3px solid var(--c-line);')),
 'check_reduced_motion': mut(('REPL','site/src/styles/global.css',
    '@media (prefers-reduced-motion: reduce)','@media (min-width: 9999px)')),
 'check_copy_density': mut(('REPL','site/dist/home/index.html',
    '<p class="text-fluid-0">Book now</p>',
    '<p class="text-fluid-0">' + 'long copy sentence ' * 20 + '</p>')),
 'check_seo_lint': mut(('REPL','site/dist/home/index.html',
    '<h2 class="text-fluid-0">What is testing?</h2>',
    '<h4 class="text-fluid-0">What is testing?</h4>')),
 'check_section_contracts': mut(('DEL','sections/01-hero.contract.json')),
 'check_dna': mut(('REPL','DNA.json','"type.ratio": 1.25','"type.ratio": 9.9')),
 'check_dna_fresh': mut(('REPL','site/src/components/sections/Hero.astro',
    'dna_hash: ','dna_hash: deadbeef')),
 'check_dark_mode': mut(('REPL','site/tailwind.config.js',
    "darkMode: 'class',","")),
 'check_dark_toggle': mut(('REPL','site/dist/home/index.html',
    'data-theme-toggle','data-nope')),
 'check_variants': mut(('REPL','DNA.json','"id": "v3"','"id": "v9"')),
 'check_review_modes': mut(
     ('DEL','shots/1280-dark-home.png'),
     ('DEL','shots/768-dark-home.png'),
     ('DEL','shots/360-dark-home.png')),
 'check_section_shell': mut(('REPL','site/src/components/split-media.astro',
    'class="grid gap-stack md:grid-cols-2"','class="py-24 grid gap-stack md:grid-cols-2"')),
 'check_section_allowed': mut(('REPL','site/src/components/cards-n.astro',
    'text-fluid-2','text-[42px]')),
 'check_section_gates': mut(('SET','sections/01-hero.gate.json',
    '{"section": "hero", "pass": false, "failures": ["seeded"]}')),
 'check_exemplars': mut(('REPL','site/src/components/sections/Nav.astro',
    'exemplar: nav-bar','exemplar: bogus')),
 'check_assembly': mut(('REPL','site/src/pages/home.astro',
    '<Hero />','<Hero2 />')),
 'check_rhythm_render': mut(('REPL','site/dist/home/index.html','sec-band inverse','sec-band')),
 'check_style_review': mut(('SET','GATES.json','{"w5": {"design": "d3"}}'),
    ('REPL','REVIEW.json','"style": [','"style_off": [')),
 'check_segment_roles': mut(('REPL','site/dist/home/index.html',
    'data-sec="macro"','data-x="macro"')),
 'check_segment_region': mut(('REPL','site/dist/home/index.html',
    '<section data-sec="macro"','<nav data-sec="nav" data-comp="nav-bar" data-ratio="none" data-disclosure="open"></nav>\n<section data-sec="macro"')),
 'check_segment_share': mut(('REPL','site/dist/home/index.html',
    '<p>Fixture Co, 1 Test St</p>',
    '<p>Fixture Co, 1 Test St</p>' + '<p>footer boilerplate</p>' * 20)),
 'check_segment_media': mut(('REPL','site/dist/home/index.html',
    ' alt="hero"','')),
 'check_segment_footer': mut(('REPL','site/dist/home/index.html',
    '<p>Fixture Co, 1 Test St</p>','<h1>Fixture Co</h1>')),
 'check_segment_priority': mut(('REPL','site/dist/home/index.html',
    '<body>','<body><aside class="sidebar">ads</aside>')),
 'check_checklist': mut(('SET','CHECKLIST/w3.md',
    '| Rule | Evidence |\n|---|---|\n| T.1 font directory | |\n')),
 'check_novelty': mut(('SET','GATES.json',
    '{"w5": {"design": "d3"}}'),
    ('REPL','NOVELTY.json','"distance": 0.44','"distance": 0.90')),
}

ENV_EXEMPT = {'check_astro_build', 'check_mobbin_auth'}

def main():
    if os.path.isdir(FX):
        shutil.rmtree(FX)
    base = os.path.join(FX, '_base')
    for rel, content in BASE.items():
        p = os.path.join(base, rel)
        os.makedirs(os.path.dirname(p), exist_ok=True)
        mode = 'wb' if isinstance(content, bytes) else 'w'
        with open(p, mode) as fh:
            fh.write(content)
    # section-build artefacts: contracts, per-section gates, assembled page
    base_dir = os.path.join(FX, '_base')
    # builders echo the DNA hash they built against (DM.2)
    sl = gate.dna_slices(gate.dna_map(gate.Ctx(base_dir)))
    h, sh = sl['core'], sl['structure']
    for name in list(SECTIONS):
        rel = f'site/src/components/sections/{name}'
        body = BASE[rel].replace(
            '---\nexemplar:',
            f'---\ndna_hash: {h}\nstructure_hash: {sh}\nexemplar:', 1)
        BASE[rel] = body
        with open(os.path.join(base_dir, rel), 'w', encoding='utf-8') as fh:
            fh.write(body)
    gate.cmd_contracts(base_dir)
    gate.cmd_section(base_dir, None)
    p, txt, _ = gate.assemble_page(gate.Ctx(base_dir))
    with open(p, 'w', encoding='utf-8') as fh:
        fh.write(txt)
    vp, vtxt, _ = gate.assemble_variants(gate.Ctx(base_dir))
    os.makedirs(os.path.dirname(vp), exist_ok=True)
    with open(vp, 'w', encoding='utf-8') as fh:
        fh.write(vtxt)
    lp, ltxt, _ = gate.assemble_layouts(gate.Ctx(base_dir))
    os.makedirs(os.path.dirname(lp), exist_ok=True)
    with open(lp, 'w', encoding='utf-8') as fh:
        fh.write(ltxt)
    for rel in ('sections', 'site/src/pages/home.astro',
                'preview/variants.html', 'preview/layouts.html'):
        full = os.path.join(base_dir, rel)
        if os.path.isdir(full):
            for fn in sorted(os.listdir(full)):
                r = os.path.join(rel, fn)
                BASE[r] = open(os.path.join(base_dir, r),
                               encoding='utf-8').read()
        elif os.path.isfile(full):
            BASE[rel] = open(full, encoding='utf-8').read()

    # bind the review artifact to the build it graded (P.8)
    os.environ.setdefault('DESIGN_GATE_OPERATOR_KEY', 'fixture-key')
    ctx_b = gate.Ctx(base_dir)
    ctx_b.wave = 'w7'
    rv = json.loads(BASE['REVIEW.json'])
    rv['dist_sha256'] = gate._dist_sha(ctx_b)
    sl = gate.dna_slices(gate.dna_map(ctx_b))
    body = (f"{rv['nonce']}|{rv['dist_sha256']}|{sl.get('core')}|"
            f"{rv.get('reviewer_model')}")
    rv['sig'] = hmac.new(gate.op_key(create=True), body.encode(),
                         hashlib.sha256).hexdigest()[:32]
    BASE['REVIEW.json'] = json.dumps(rv, indent=1)
    with open(os.path.join(base_dir, 'REVIEW.json'), 'w') as fh:
        fh.write(BASE['REVIEW.json'])
    for name, fn in MUT.items():
        for want, sub in ((BASE, 'fail'),):
            files = dict(BASE)
            fn(files)
            d = os.path.join(FX, name, sub)
            for rel, content in files.items():
                p = os.path.join(d, rel)
                os.makedirs(os.path.dirname(p), exist_ok=True)
                mode = 'wb' if isinstance(content, bytes) else 'w'
                with open(p, mode) as fh:
                    fh.write(content)
        pd = os.path.join(FX, name, 'pass')
        os.makedirs(pd, exist_ok=True)
        # pass fixture = symlinked base entries (deterministic)
        for rel in BASE:
            dst = os.path.join(pd, rel)
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            if not os.path.lexists(dst):
                src = os.path.relpath(
                    os.path.join(FX, '_base', rel), os.path.dirname(dst))
                os.symlink(src, dst)
        # approvals are keyed by abspath: sign every pass dir so the
        # operator rules and the scorecard see a real signed record
        ctx_p = gate.Ctx(pd)
        for wv in sorted(gate.APPROVABLE):
            gate.write_approval(ctx_p, wv, evidence='fixture approval')
    # SPEC.md is generated, never hand-written (A F27)
    for slug in gate.Ctx(base_dir).pages():
        sp = os.path.join(base_dir, 'PAGES', slug, 'SPEC.md')
        os.makedirs(os.path.dirname(sp), exist_ok=True)
        spec = gate.assemble_spec(gate.Ctx(base_dir), slug)
        with open(sp, 'w') as fh:
            fh.write(spec)
        BASE[f'PAGES/{slug}/SPEC.md'] = spec
    # check_tiers pass fixture (global rule → pass only, no fail dir)
    pd = os.path.join(FX, 'check_tiers', 'pass')
    os.makedirs(pd, exist_ok=True)
    for rel in ('DESIGN-PLAN.md', 'DNA.json'):
        src = os.path.relpath(os.path.join(FX, '_base', rel), pd)
        if not os.path.lexists(os.path.join(pd, rel)):
            os.symlink(src, os.path.join(pd, rel))
    # check_genotype/pass: a real 9-row page (nav, hero, cards, logo-wall,
    # faq, sequence, faq, form, footer) so D.4's catalog->archetype map is
    # exercised end to end, not just on the 5-row base page.
    gp = os.path.join(FX, 'check_genotype', 'pass', 'DESIGN-PLAN.md')
    if os.path.lexists(gp):
        os.remove(gp)
    rows = ''
    for name, act, comp, cat, surf, dens in (
            ('proof', 'proof', 'logo-wall', 'logo-sections', 'base',
             'compact'),
            ('answers', 'objection', 'faq', 'content', 'base', 'regular'),
            ('how', 'how', 'sequence', 'how-it-works', 'muted', 'regular'),
            ('objections', 'objection', 'faq', 'content', 'base',
             'regular')):
        rows += (f'      - {{name: {name}, wf_ref: "cards/index.html#d1:'
                 f'{name}", speech_act: [{act}], category: {cat}, '
                 f'surface: {surf}, density: {dens}, composition: {comp}, '
                 'emphasis: headline, align: col-1-edge, stack: text-first, '
                 'collapse: stacked, media_ratio: none, disclosure: open}\n')
    plan = BASE['DESIGN-PLAN.md']
    anchor = '      - {name: end-act,'
    plan = plan.replace(anchor, rows + anchor, 1)
    with open(gp, 'w', encoding='utf-8') as fh:
        fh.write(plan)
    # check_novelty only bites with a chosen wildcard; no other fixture may
    # carry a w5 design pick (the wireframe cards only hold d1/d2).
    for sub in ('pass', 'fail'):
        gp = os.path.join(FX, 'check_novelty', sub, 'GATES.json')
        if os.path.lexists(gp):
            os.remove(gp)
        with open(gp, 'w') as fh:
            fh.write('{"w5": {"design": "d3"}}\n')
    print(f'fixtures written: {len(MUT)} checks x pass/fail + _base')

if __name__ == '__main__':
    main()
