#!/usr/bin/env python3
"""gen_fixtures.py — regenerate tools/design-gate/fixtures/.

Every script check gets fixtures/<check>/{pass,fail}/ — a minimal
pipeline dir that MUST pass / MUST fail that check. `gate.py selftest`
runs each check against both. Deterministic: delete fixtures/, rerun.

Layout: fixtures/_base/ is the shared good pipeline. Each fail/ dir is
_base with one seeded violation; each pass/ dir symlinks to _base
unless the check needs extra files (OVERRIDES).
"""
import hashlib, hmac, json, os, re, shutil, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
FX = os.path.join(HERE, 'fixtures')
REPO_DIR = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE)
import gate  # noqa: E402  (hash helpers for the fixture DNA)
import ornament  # noqa: E402  (O.1 — ornaments render generate() output)
import pipeline_emit  # noqa: E402  (the real emit chain — no drift)
import preview_build  # noqa: E402  (pickers = real built pages)


def _ornament(seed=7, density=0.4, w=320, h=240,
              variants='crosshair-grid+registration-marks',
              layer='technical', target='hero.bg',
              intensity='ghost', motion='static'):
    """The rendered ornament layer: generate() geometry + the
    placement-vector wrapper the gate binds (O.1–O.7)."""
    svg = ornament.generate(seed=seed, density=density, bounds=(w, h),
                            variants=tuple(variants.split('+')))
    opacity = {'ghost': 0.05, 'accent': 0.12,
               'statement': 0.25, 'bold': 0.40}[intensity]
    return svg.replace('<svg ',
        f'<svg data-ornament data-layer="behind" '
        f'data-ornament-layer="{layer}" '
        f'data-ornament-target="{target}" '
        f'data-ornament-intensity="{intensity}" '
        f'data-ornament-motion="{motion}" '
        f'opacity="{opacity}" '
        f'data-ornament-seed="{seed}" '
        f'data-ornament-density="{density}" '
        f'data-ornament-bounds="{w}x{h}" '
        f'data-ornament-variant="{variants}" ', 1)


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
  vertical: services
  attributes: [reliability, care]
  intent_choices:
    - {choice: imagery, allele: image-led}
    - {choice: image_style, allele: editorial, declared_deviation: {chosen: editorial, expected: ["other:ambiguous", corporate], reason: "brief asks for editorial warmth", copy_cite: "like an editorial feature, not a brochure"}}
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
      content_width: 80rem
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
  genotype: {layout-archetype: split-media, page-macro-structure: promise-proof-how-act, density-tier: regular, image-led-ratio: balanced, type-contrast: medium, display-face: sans, radius-personality: soft, surface-rhythm: one-contrast-moment, cta-restraint: single-primary, cta-rank: hero, disclosure-tier: open, nav-pattern: bar-cta, motion-tier: subtle, proof-type: logos, media-treatment: photo, columns: "3", heading-form: claim, whitespace-band: medium, gallery-mode: grid, form-presence: inline, mood-energy: calm, mood-register: approachable, image-style: minimal, trend: none, seam-shape: flat, ornament: technical}
ornament_placements:
  - {target: "hero.bg", layer: "technical", variant: "crosshair-grid+registration-marks", intensity: "ghost", motion: "static"}
options:
  - {name: d1, wildcard: false, temperature: warm, shape: p3}
  - {name: d2, wildcard: false, temperature: cool, shape: p2}
  - {name: d3, wildcard: true, temperature: warm, shape: p4, mutates: [radius-personality, motion-tier]}
decisions:
  - {rule_id: L.3, what: hero runs edge-to-edge, why: one memorable fold, where: hero, compensating: inner measure kept at 62ch}
pages:
  home:
    page_class: money
    page_type: service-page
    layout_family: conversion
    rhetoric: [promise, proof, how, act]
    sections:
      - {name: nav, wf_ref: "cards/index.html#d1:nav", recipe: "bricksmaven/headers/header-21", speech_act: [chrome], category: headers, surface: base, density: compact, composition: flyout-nav, emphasis: nav, align: center-axis, stack: text-first, collapse: burger, media_ratio: none, disclosure: open, intent: chrome, items: [{label: "Service", href: "/service"}], cta: {label: "Book now", href: "/book"}, refs: [mobbin-abc123]}
      - {name: hero, wf_ref: "cards/index.html#d1:hero", recipe: "brixies/banner-section/banner-1.topo", speech_act: [promise, act], category: hero, surface: base, density: spacious, composition: split-media, emphasis: headline, align: col-1-edge, stack: text-first, collapse: stacked, media_ratio: "16:9", disclosure: open, intent: hero, copy_ref: lede, cta: {label: "Book now", href: "/book"}, refs: [mobbin-abc124, mobbin-abc125], content_ids: [c-h1], vector: [{heading: "Testing Site", fs: "Testing is the thing."}]}
      - {name: services, wf_ref: "cards/index.html#d1:services", recipe: "hyperui/marketing/feature-grids/1", speech_act: [detail], category: content, surface: muted, density: regular, composition: cards-n, emphasis: answer, align: col-1-edge, stack: text-first, collapse: "2-col", media_ratio: none, disclosure: open, intent: definition, copy_ref: b01, refs: [mobbin-def456, mobbin-def457], content_ids: [c-def], vector: [{heading: "What is testing?", fs: "Testing is the thing."}]}
      - {name: proof, wf_ref: "cards/index.html#d1:proof", recipe: "hyperui/marketing/testimonials/1", speech_act: [proof], category: content, surface: base, density: regular, composition: quote-grid, emphasis: voices, align: col-1-edge, stack: text-first, collapse: "3-col", media_ratio: none, disclosure: open, intent: proof, copy_ref: b02, refs: [mobbin-def458], content_ids: [c-proof], vector: [{heading: "What clients say", fs: "Twelve thousand cleans, and counting."}]}
      - {name: how, wf_ref: "cards/index.html#d1:how", recipe: "hyperui/application/steps/1", speech_act: [how], category: content, surface: muted, density: regular, composition: sequence, emphasis: steps, align: col-1-edge, stack: text-first, collapse: stacked, media_ratio: none, disclosure: open, intent: process, copy_ref: b03, refs: [mobbin-ghi789], content_ids: [c-how], vector: [{heading: "How it works", fs: "Book, test, report — done in a day."}]}
      - {name: end-act, wf_ref: "cards/index.html#d1:end-act", recipe: "brixies/cta-sections/cta-1.topo", speech_act: [act], category: contact, surface: inverse, density: spacious, composition: form-panel, emphasis: form, align: col-1-edge, stack: text-first, collapse: stacked, media_ratio: none, disclosure: open, intent: cta, copy_ref: closing, cta: {label: "Book now", href: "/book"}, refs: [mobbin-abc123], content_ids: [c-cta, c-faq]}
      - {name: footer, wf_ref: "cards/index.html#d1:footer", recipe: "hyperui/marketing/footers/1", speech_act: [chrome], category: footer, surface: base, density: compact, composition: footer-bar, emphasis: columns, align: center-axis, stack: text-first, collapse: "1-col", media_ratio: none, disclosure: open, intent: chrome, refs: [mobbin-def456]}
```
'''


STUB = '''# STUB — /fixture/

| Field | Value |
|---|---|
| **H1** | Testing Site |

## Heading vector

| Zone | Heading | First sentence / FS (write this) | Link slot |
|---|---|---|---|
| hero | H1 Testing Site | "Testing is the thing." | c-h1 |
| services | H2 What is testing? | "Testing is the thing." | — | c-def |
| proof | H2 What clients say | "Twelve thousand cleans, and counting." | c-proof |
| how | H2 How it works | "Book, test, report — done in a day." | c-how |

## Content inventory

### Proof items
| Item | Type |
|---|---|
| "12,000 cleans done" | stat | c-proof |

### FAQ Q&A pairs
| Q | A |
|---|---|
| Do you test? | Yes. | c-faq |
| How fast is a test? | Same day. | c-how |

### Media inventory
| Section | Asset | Ratio |
|---|---|---|
| hero | hero.webp | 16:9 |

### CTAs
| Label | Target |
|---|---|
| Book now | /book | c-cta |

### Contact facts
| Field | Value |
|---|---|
| phone | 555-0100 |

## Per-section semantic map
'''

# tailwind.config.js / global.css are emitted by pipeline_emit during
# the _base build (emit_global producers, TOKENS.json bound above) —
# no inline copies.

KNOBS = {
    "type.ratio": 1.25, "type.base": 16, "type.display_weight": 700,
    "type.tracking_display": -0.02, "space.density_scale": "space-m",
    "space.section_py": {"compact": "section-space-s", "regular": "section-space-m", "spacious": "section-space-l"},
    "grid.gutter": "space-m", "radius.personality": "p3",
    "color.surface_contrast": 0.05, "color.accent_usage": "cta+motif",
    "color.neutral_tint": 0.03, "elevation.level": 1,
    "motion.level": "subtle", "image.treatment": "natural",
    "motion.engine": "css", "btn.padding_ratio": 2.0, "btn.size": "m",
    "width.inner_rung": 60,
}

LIGHT = {"bg": "#FDFCFA", "surface": "#F1EFEC", "surface_elevated": "#EBE7E1",
         "border": "#D8D3CC", "ink": "#221F1B", "ink_muted": "#6F665D",
         "accent": "#0055AA", "accent_foreground": "#FFFFFF",
         "inverse": "#1D2325"}
DARK = {"bg": "#14181A", "surface": "#1C2224", "surface_elevated": "#232A2C",
        "border": "#2C3437", "ink": "#EDEBE7", "ink_muted": "#A8A49D",
        "accent": "#4C93D6", "accent_foreground": "#0E1416",
        "inverse": "#F4F2EE"}

def _fluid_settings():
    """ACSS fluid settings record for the fixture DNA/TOKENS — the
    dashboard defaults clamp.py computes the emitted scale from."""
    import clamp
    return clamp.settings({})


def _fluid_sizes():
    import clamp
    s = _fluid_settings()
    return {name: {'clamp': css}
            for name, css in clamp.sizes(s).items()}
TOKENS = json.dumps({
    "knobs": KNOBS,
    "color": {
        "modes": {"light": {"roles": LIGHT}, "dark": {"roles": DARK}},
        "roles": LIGHT,
    },
    "fluid": _fluid_settings(),
    "sizes": _fluid_sizes(),
}, indent=1)

MOTIF_SVG = ('<svg data-motif="hairline-numeral" data-motif-slot="marker" '
             'width="24" height="24" viewBox="0 0 24 24" '
             'stroke="currentColor" stroke-width="1.5" fill="none" '
             'aria-hidden="true"><path d="M4 20L12 4l8 16"/></svg>')
# Components, section instances, system tile, pages, contracts and the
# rendered dist are emitted by the REAL producers (pipeline_emit →
# gold exemplars, _instance, _system, assemble.py, astro build) inside
# fixtures/_base at build time — never hand-authored in this file.

MOBBIN = '''# MOBBIN-REFS — consulted before direction (W1) and per composition (W5)

| id / url | kind | informs | wave |
|---|---|---|---|
| mobbin-abc123 | screen | home · split-media · hero layout | w1 |
| mobbin-abc124 | screen | home · split-media · media ratio | w1 |
| mobbin-abc125 | section | home · split-media · CTA restraint | w1 |
| mobbin-def456 | section | home · cards-n · card density | w1 |
| mobbin-def457 | section | home · cards-n · card radius | w1 |
| https://lexingtonthemes.com | site | operator-suggested · whole-site feel | w1 |
| mobbin-xyz999 | screen | home · split-media · ignored — wrong vertical | w1 |
| https://mobbin.com/screens/def458 | screen | home · cards-n · three-up grid | w1 |
| mobbin-def458 | section | home · quote-grid · voice density | w1 |
| mobbin-ghi789 | section | home · sequence · step rhythm | w1 |
| https://mobbin.com/screens/ghi789 | screen | home · form-panel · field stack | w1 |
| https://mobbin.com/screens/ghi790 | screen | home · form-panel · label placement | w1 |
| https://mobbin.com/screens/ghi791 | section | home · form-panel · submit emphasis | w1 |
| https://mobbin.com/screens/jkl012 | screen | home · flyout-nav · sticky bar | w1 |
| https://mobbin.com/screens/jkl013 | screen | home · flyout-nav · nav CTA | w1 |
| https://mobbin.com/screens/jkl014 | section | home · flyout-nav · logo scale | w1 |
| https://mobbin.com/screens/mno345 | screen | home · footer-bar · footer density | w1 |
| https://mobbin.com/screens/mno346 | section | home · footer-bar · legal row | w1 |
| https://mobbin.com/screens/mno347 | screen | home · footer-bar · contact block | w1 |
'''

REVIEW = '''{
"modes": {"light": {"pass": true}, "dark": {"pass": true}},
"reviewer_model": "pi-default-vlm",
"designer_model": "swe-2",
"vlm_calls": 1,
"viewports": [1280, 768, 360],
"per_design": [{"design": "d3", "pass": true,
 "fails": []}],
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

_REPO = os.path.dirname(os.path.dirname(HERE))

BRIEF = '''# fixture brief — site scope
site:
  slug: fixture
  url: https://fixture.example
  blueprint: /blueprints/fixture
brand:
  name: Testing Site
  phone: "555-0100"
  logo: /logo.svg
theme:
  default: light
  canvas: "#FDFCFA"
  follow_os: false
  dark_toggle: true
media:
  - {file: hero.webp, alt: "a Victorian plumber testing", role: hero}
'''

_SRC_STUB = '''# Source stub — Testing Site

H1: Testing Site
CTA: Book now
'''

_SRC_ARTICLE = '''# Testing Site

Testing is the thing.

## What is testing?

Testing is the thing.

## What clients say

Twelve thousand cleans, and counting.

## How it works

Book, test, report — done in a day.
'''


def _sh(s):
    return hashlib.sha256(
        s.encode() if isinstance(s, str) else s).hexdigest()


DISCOVERY = json.dumps({
    "generated_by": "discovery.py",
    "brief_sha256": _sh(BRIEF),
    "palette": [{"hex": "#FDFCFA", "role": "canvas",
                 "source": "brief.theme.canvas"},
                {"hex": "#F1EFEC", "role": "surface",
                 "source": "brief.palette"},
                {"hex": "#EBE7E1", "role": "surface_elevated",
                 "source": "brief.palette"},
                {"hex": "#D8D3CC", "role": "border",
                 "source": "brief.palette"},
                {"hex": "#221F1B", "role": "ink",
                 "source": "brief.palette"},
                {"hex": "#6F665D", "role": "ink_muted",
                 "source": "brief.palette"},
                {"hex": "#0055AA", "role": "accent",
                 "source": "brief.palette"},
                {"hex": "#FFFFFF", "role": "accent_foreground",
                 "source": "brief.palette"},
                {"hex": "#1D2325", "role": "inverse",
                 "source": "brief.palette"}],
    "fonts": {"display": "Inter", "body": "Inter"},
}, indent=1) + '\n'

_COPY = {
    "generated_by": "copy_ingest.py",
    "source": {
        "stub": {"path": "SOURCES/stub.md", "sha256": _sh(_SRC_STUB)},
        "article": {"path": "SOURCES/article.md",
                    "sha256": _sh(_SRC_ARTICLE)}},
    "url": "/fixture/", "title": "Testing Site",
    "meta": {"description": "Testing is the thing."},
    "h1": "Testing Site", "stub_h1": "Testing Site",
    "answer_datatype": "definition",
    "lede": "Testing is the thing.",
    "stub_vector": [
        {"zone": "hero", "tag": "h1", "heading": "Testing Site",
         "fs": "Testing is the thing."},
        {"zone": "services", "tag": "h2", "heading": "What is testing?",
         "fs": "Testing is the thing."},
        {"zone": "proof", "tag": "h2", "heading": "What clients say",
         "fs": "Twelve thousand cleans, and counting."},
        {"zone": "how", "tag": "h2", "heading": "How it works",
         "fs": "Book, test, report — done in a day."}],
    "blocks": [
        {"id": "b01", "h2": "What is testing?", "zone": "macro",
         "stub_fs": "Testing is the thing.",
         "answer_type": "what · definition",
         "terms": ["testing", "bond"],
         "answer": "Testing is the thing.",
         "before": [], "after": [], "list_ordered": False,
         "items": [
             {"term": "Licensed Victorian plumber",
              "text": "Fixed price agreed on site · 7 days"}],
         "qa": [], "links": []},
        {"id": "b02", "h2": "What clients say", "zone": "macro",
         "stub_fs": "Twelve thousand cleans, and counting.",
         "answer_type": "proof",
         "terms": ["cleans"],
         "answer": "Twelve thousand cleans, and counting.",
         "before": [], "after": [], "list_ordered": False,
         "items": [], "qa": [], "links": []},
        {"id": "b03", "h2": "How it works", "zone": "macro",
         "stub_fs": "Book, test, report — done in a day.",
         "answer_type": "process",
         "terms": ["book", "test", "report"],
         "answer": "Book, test, report — done in a day.",
         "before": [], "after": [], "list_ordered": False,
         "items": [], "qa": [], "links": []}],
    "closing": {
        "text": "Ready when you are — Book now.",
        "cta": {"label": "Book now", "href": "/book"},
        "phone": "555-0100"},
    "links_out": [{"href": "/book", "anchor": "Book now",
                   "zone": "closing"}],
}
COPY_TXT = json.dumps(_COPY, indent=1, ensure_ascii=False) + '\n'
_COPY_SHA = _sh(COPY_TXT)

_ALLOWED = {
    "b01": ["cards-n", "editorial", "text-index", "quote-grid"],
    "b02": ["quote-grid", "editorial", "cards-n", "text-index"],
    "b03": ["sequence", "cards-n", "text-index", "editorial"],
}


def _option(oid, label, comps):
    seq = sorted(comps.items())
    blocks_by = {b["id"]: b for b in _COPY["blocks"]}
    import plan_from_copy as _PF
    s, inputs = _PF.score(seq, blocks_by)
    return {"id": oid, "label": label, "compositions": dict(comps),
            "score": s, "score_inputs": inputs}


LAYOUT_OPTIONS = json.dumps({
    "generated_by": "plan_from_copy.py",
    "copy_sha256": _COPY_SHA,
    "pick": "d1",
    "allowed": _ALLOWED,
    "options": [
        _option("d1", "copy default",
                {"b01": "cards-n", "b02": "quote-grid",
                 "b03": "sequence"}),
        _option("d2", "index-led",
                {"b01": "editorial", "b02": "cards-n",
                 "b03": "text-index"}),
        _option("d3", "prose-led",
                {"b01": "text-index", "b02": "editorial",
                 "b03": "cards-n"}),
        _option("d4", "grid-led",
                {"b01": "quote-grid", "b02": "text-index",
                 "b03": "editorial"}),
        _option("d5", "mixed",
                {"b01": "editorial", "b02": "quote-grid",
                 "b03": "editorial"}),
    ],
    "score_formula": "0.85 - 0.1*orphan_rows - 0.05*long_card_texts "
                     "- 0.04*adjacent_same_composition "
                     "+ 0.02*distinct_compositions, clamp 0..1",
}, indent=1, ensure_ascii=False) + '\n'







def dna_doc():
    import clamp
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
            "image-style": "minimal", "trend": "none",
            "seam-shape": "flat",
            "ornament": "technical",
        },
        "ornament_placements": [
            {"target": "hero.bg", "layer": "technical",
             "variant": "crosshair-grid+registration-marks",
             "intensity": "ghost", "motion": "static"}],
        "brand_motif": {"motif_source": "declared",
            "motif_family": ["hairline-numeral", "counter"],
            "usage": ["accent", "marker", "divider"]},
        "knobs": KNOBS,
        "theme": {"default": "light", "canvas": "#FDFCFA",
                  "follow_os": False, "dark_toggle": True},

        "modes": {"light": LIGHT, "dark": DARK},
        "invariants": {"accent": "#0055AA", "logo": "wordmark",
                       "fonts": {"display": "Inter", "body": "Inter"},
                       "fluid": _fluid_settings()},
        "constraints": {"likes": ["calm editorial spacing"],
                        "dislikes": ["gradient meshes"],
                        "references": ["mobbin:app/linear"]},
        "rhythm": [
            {"section": "nav", "surface": "base", "density": "compact"},
            {"section": "hero", "surface": "base", "density": "spacious"},
            {"section": "services", "surface": "muted",
             "density": "regular"},
            {"section": "proof", "surface": "base",
             "density": "regular"},
            {"section": "how", "surface": "muted",
             "density": "regular"},
            {"section": "end-act", "surface": "inverse",
             "density": "spacious"},
            {"section": "footer", "surface": "base", "density": "compact"},
        ],
        "variants": [
            {"id": "v1", "vector": "best-predicted", "baseline": True,
             "deltas": {}, "predicted_score": 84,
             "wildcard_breaks": []},
            {"id": "v2", "vector": "typography-led",
             "deltas": {"type.ratio": 1.3625, "type.display_weight": 800,
                        "type.tracking_display": -0.035,
                        "color.neutral_tint": 0.06},
             "predicted_score": 81, "wildcard_breaks": []},
            # the wildcard must differ from every sibling in ≥3 knobs
            # the token emit actually renders (ROUND2 consumed-diff on
            # the real build) — radius/type.ratio/btn.padding_ratio
            # all project through preview_build._semantic_scope;
            # elevation rides along as the declared break
            {"id": "v3", "vector": "wildcard",
             "deltas": {"radius.personality": "p4",
                        "type.ratio": 1.2,
                        "btn.padding_ratio": 2.5,
                        "elevation.level": 3},
             "predicted_score": 78,
             "wildcard_seed": 424242,
             "wildcard_genes": ["radius.personality", "type.ratio",
                                "btn.padding_ratio", "elevation.level"],
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
            "fonts": {"tag": "extracted",
                      "source": "DISCOVERY.fonts (live site)"},
            **{f"color.{role}": {"tag": "briefed",
                                 "source": "BRIEF.theme.canvas · "
                                           "palette swatches"}
               for role in LIGHT},
            **{f"color.dark.{role}": {"tag": "derived",
                                      "source": "BRIEF.theme · "
                                                "DISCOVERY.dark ramp"}
               for role in DARK},
            "color.dark": {"tag": "derived",
                           "source": "BRIEF.theme.dark_toggle"},
            **{k: {"tag": "chosen", "reason": "fixture baseline"}
               for k in KNOBS
               if k not in ("type.ratio", "type.base",
                            "space.section_py", "grid.gutter")},
            # U.10 — written divergence reasons for the non-ACSS
            # size tokens the emit layer still carries
            "fluid": {
                "tag": "extracted",
                "source": "ACSS dashboard defaults (clamp.DEFAULTS)",
                "divergences": {
                    **clamp.DIVERGENCES,
                    **{f"fs-{n}": "component alias → ACSS text scale"
                       for n in ('-1', '0', '1', '2', '3', '4', '5')},
                    **{f"lh-{n}": "leading ladder follows text scale"
                       for n in ('-1', '0', '1', '2', '3', '4', '5')},
                    "space-4": "legacy alias → --space-m",
                    "r-card": "card radius → --radius",
                    "grid-min": "auto-grid floor (ACSS exemption)",
                    "grid-floor": "auto-grid floor (ACSS exemption)",
                    "measure": "ch measure (ACSS exemption)",
                    "logo-h": "logo box height — no ACSS analogue",
                    "tap": "a11y hit-area floor (ACSS exemption)",
                    "input-px": "form field pad — btn-padding analogue",
                    "input-py": "form field pad — btn-padding analogue",
                    "input-radius": "form field radius → --radius",
                    "sec-pad": "density dial → section-space-*",
                    "tracking-display": "display tracking — "
                                        "letter-spacing is em-exempt",
                },
            },
        },
        "inputs": {"BRIEF.yaml": _sh(BRIEF),
                   "DISCOVERY.json": _sh(DISCOVERY)},
    }
    doc["hashes"] = gate.dna_slices(doc)
    return doc


def _wild_hist():
    import hashlib as _h
    e = {'round': 1,
         'genes': ['color.accent_usage', 'image.treatment'],
         'seed': 117, 'prev': 'genesis'}
    rec = {'round': e['round'], 'genes': sorted(e['genes']),
           'seed': e['seed'], 'prev': e['prev']}
    e['hash'] = _h.sha256(json.dumps(
        rec, sort_keys=True, separators=(',', ':')).encode()).hexdigest()
    # B.7 requires every entry to HMAC-sign over its own record
    # (hash included) with the operator key — fixtures sign with the
    # fixture key cmd_selftest provisions
    e['sig'] = _fx_sig(e)
    return json.dumps([e])




def _fx_sig(rec):
    """Fixture decision signature — same HMAC the service writes."""
    return gate._sig(rec, b'fixture-key')


_DNA_TXT = json.dumps(dna_doc(), indent=1) + '\n'
_STAMP = (f'<!-- GENERATED by plan_from_copy.py from COPY.json '
          f'sha256:{_COPY_SHA} DNA.json sha256:{_sh(_DNA_TXT)} '
          f'option:d1 — do not edit -->')

BASE = {
    'DNA.json': _DNA_TXT,
    'DESIGN-PLAN.md': _STAMP + '\n' + PLAN,
    'STUB.md': _STAMP + '\n' + STUB,

    'BRIEF.yaml': BRIEF,
    'DISCOVERY.json': DISCOVERY,
    'COPY.json': COPY_TXT,
    'LAYOUT-OPTIONS.json': LAYOUT_OPTIONS,
    'SOURCES/stub.md': _SRC_STUB,
    'SOURCES/article.md': _SRC_ARTICLE,
    'SOURCES/.seal-manifest.sha256': (
        '# sha256 manifest — written by tools, verified by '
        'the gate. Do not hand-edit.\n'
        f'{_sh(_SRC_ARTICLE)}  article.md\n'
        f'{_sh(_SRC_STUB)}  stub.md\n'),

    'TOKENS.json': TOKENS,

    'MOBBIN-REFS.md': MOBBIN,
    'PREBUILD.json': json.dumps({'options': {**{
        f'd{i}': {'recipe_id': f'brixies/banner-section/banner-{i}',
                  'element_variant': gate._element_variant_name(
                      gate._recipe_element_sig(
                          f'brixies/banner-section/banner-{i}')),
                  'plan_fit': True, 'refs_resolve': True,
                  'tokens_resolve': True, 'plan_vector_dist': 0.5}
        for i in range(1, 6)}, **{
        f'v{i}': {'recipe_id': f'hyperui/marketing/feature-grids/{i}',
                  'element_variant': gate._element_variant_name(
                      gate._recipe_element_sig(
                          f'hyperui/marketing/feature-grids/{i}')),
                  'plan_fit': True, 'refs_resolve': True,
                  'tokens_resolve': True, 'plan_vector_dist': 0.4}
        for i in range(1, 4)}}}, indent=1),
    'REVIEW.json': REVIEW.replace('"vlm_calls": 1,',
        '"vlm_calls": 1,\n"vlm_evidence": {'
        '"model": "pi-default-vlm", "command": '
        '"mlx_vlm.generate --model pi-default-vlm", '
        '"image_sha256": {"shots/1280-light-home.png": "'
        + hashlib.sha256(
            SHOTS['shots/1280-light-home.png']).hexdigest()[:16]
        + '"}, "prompt_sha256": "fixtureprompt", '
        '"output_sha256": "fixtureout"},'),
    'NOVELTY.json': '{"distance": 0.21, "bound": 0.35}',
    'CHECKLIST/w2.md': CHECKLIST_W2,
    'CHECKLIST/w5.md': CHECKLIST_W5,
    'audit.md': '# audit\n## Defect table\n- E.1 missing macro H2\n'
                '## keep-list\n- logo.svg\n',

    'CHECKLIST/w3.md': '| Rule | Evidence |\n|---|---|\n'
                       '| T.1 font directory | Inter + Ionicons listed |\n',
    '.wave': 'w3',
    'NOVELTY.json': '{"distance": 0.44, "bound": 0.55}\n',
    # site/dist/** is the real `astro build` of the emitted site —
    # ingested in main() below (F4: rendered output the w7 checks
    # read is producer output, not a hand-written page).
    'GATES.json': json.dumps({'artifacts': {}}),
    'WILDCARD-HISTORY.json': _wild_hist(),
    'CANDIDATES.json': json.dumps({'source': 'astro-showcase',
        'candidates': [
            {'url': 'https://pending-candidate.example.com',
             'status': 'pending', 'score': 0.71,
             'shot': 'shots/pending.webp'},
            {'url': 'https://approved-candidate.example.com',
             'status': 'approved', 'score': 0.88,
             'decided_ts': '2026-11-19T10:00:00',
             'decision_sig': _fx_sig({
                 'site': 'https://approved-candidate.example.com',
                 'decision': 'approved',
                 'ts': '2026-11-19T10:00:00'})},
            {'url': 'https://rejected-candidate.example.com',
             'status': 'rejected', 'score': 0.42,
             'decided_ts': '2026-11-19T10:00:00',
             'decision_sig': _fx_sig({
                 'site': 'https://rejected-candidate.example.com',
                 'decision': 'rejected',
                 'ts': '2026-11-19T10:00:00'})}]}),
    # preview/candidates.html is generated by gate.assemble_candidates
    # below — no static copy here
    'CANON-PADDING.json': json.dumps({'components': {
        'split-media': {'vh_iqr': [0.8, 1.6], 'block_inline': [1.0, 2.0]},
        'cards-n': {'vh_iqr': [0.5, 1.2]},
        'form-panel': {'vh_iqr': [0.6, 1.4]},
        'nav-bar': {'vh_iqr': [0.2, 0.8]},
        'flyout-nav': {'vh_iqr': [0.2, 0.8]},
        'footer-bar': {'vh_iqr': [0.5, 1.2]}}}),
    'SOP-CONSTANTS.json': json.dumps({
        'dataset': 'sop-adherence.json',
        'verdicts': {rid: gate.sop_verdict(rid)
                     for rid in sorted(gate._sop_adherence())}}),
    **SHOTS,
}

# check -> mutator(files dict). 'DEL x' deletes, 'APPEND x y' appends,
# 'REPLGLOB prefix a b' replaces inside every key under prefix (hashed
# dist assets like site/dist/_astro/*.css have no stable name).
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
            elif kind == 'REPLGLOB':
                for k in [k for k in files if k.startswith(op[1])]:
                    files[k] = files[k].replace(op[2], op[3])
            elif kind == 'DELGLOB':
                for k in [k for k in files if k.startswith(op[1])]:
                    files.pop(k, None)
            elif kind == 'COPY':
                files[op[1]] = files[op[2]]
        return files
    return f

def _clone_card(files, oid):
    """Rewrite option <oid>'s BUILT page (site/dist/preview/lo-<oid>/
    index.html) so its section comps equal option d1's — two
    identical options (VG.4/ROUND1). The thin shell only iframes the
    built render, so the clone lives there, never in the picker."""
    d1 = files['site/dist/preview/lo-d1/index.html']
    d1_comps = re.findall(r'data-comp="([^"]+)"', d1)
    idx = [0]

    def sub(c):
        v = d1_comps[idx[0]] if idx[0] < len(d1_comps) else c.group(1)
        idx[0] += 1
        return f'data-comp="{v}"'

    key = f'site/dist/preview/lo-{oid}/index.html'
    files[key] = re.sub(r'data-comp="([^"]+)"', sub, files[key])


MUT = {
 'check_design_mode': mut(('REPL','DESIGN-PLAN.md','design_mode: variants','design_mode: bogus')),
 'check_intent': mut(('REPL','DESIGN-PLAN.md','who: tenants','who: ""')),
 'check_audit_artifacts': mut(('REPL','DESIGN-PLAN.md','design_mode: variants','design_mode: audit-remodel'),('DEL','audit.md')),
 'check_canon_trace': mut(
     ('REPL','DESIGN-PLAN.md',
      'refs: [mobbin-abc123]',
      'refs: []'),
     ('REPL','MOBBIN-REFS.md','| mobbin-def456 |',
      '| data/web/https-gucci-com |'),
     ('REPL','MOBBIN-REFS.md','| mobbin-xyz999 |',
      '| negative_sections/def999 |')),
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
 'check_layout_distinct': (lambda files: (
     _clone_card(files, 'd2'), files)[1]),
 'check_mobile_cta': mut(
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
 'check_measured_evidence': mut(
     ('DEL','shots/1280-light-home.png')),
 'check_judged_verdict': mut(
     ('REPL','JUDGE.json','"verdict": "pass"','"verdict": "fail"')),
 'check_tile_page_parity': mut(
     ('REPL','site/dist/home/index.html',
      'class="sec-band surface-base density-spacious"',
      'class="sec-band surface-base density-spacious drift-class"')),
 'check_direction_axes': mut(('REPL','DESIGN-PLAN.md','temperature: warm','temperature: hot')),
 'check_wireframe_tags': (lambda files: files.update({
     'site/dist/preview/lo-d1/index.html': re.sub(
         r'data-ratio="[^"]+"', 'data-ratio="bogus"',
         files['site/dist/preview/lo-d1/index.html'], count=1)})),
 'check_spacing_scale': mut(('REPL','DESIGN-PLAN.md','16, 24, 32','16, 20, 32')),
 'check_breakpoints': mut(('REPL','DESIGN-PLAN.md','640, 768','640, 999')),
 'check_content_width': mut(('REPL','DESIGN-PLAN.md','content_width: 80rem','content_width: 95rem')),
 'check_contrast': mut(('REPL','TOKENS.json','"ink": "#221F1B"','"ink": "#8A8A8A"')),
 'check_type_system': mut(('REPL','DESIGN-PLAN.md','body: "Inter"','body: "SerifX"'),('APPEND','DESIGN-PLAN.md','\n  extra: {fonts: {c: "Third"}}')),
 'check_system_enums': mut(('REPL','DESIGN-PLAN.md','family: lucide','family: wingdings')),
 'check_tailwind_derivation': mut(('REPL','TOKENS.json','#0055AA','#ABCDEF')),
 'check_look_tells': mut(('REPL','TOKENS.json','"ink": "#221F1B"','"ink": "#6366F1"')),
 'check_type_bounds': mut(('REPL','TOKENS.json','"type.ratio": 1.25','"type.ratio": 1.12')),
 'check_token_layer': mut(('SET','site/src/components/AdLib.astro',
    '<div style="color:#123456">x</div>')),
 'check_grid_tracks': mut(('REPL','site/dist/home/index.html',
     'data-cols="3"','data-cols="4"')),
 'check_js_cost': mut(('SET','site/dist/_astro/map.js',
     'import L from "leaflet"; L.map("m");')),
 'check_frozen_inputs': mut(('REPL','STUB.md',
     '## Content inventory','## Content inventory — edited')),
 'check_seal': mut(('SET','refs/ref-1.txt','harvested evidence'),),
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
 'check_design_system': mut(
     ('DEL','site/dist/design-system/index.html')),
 'check_tile_is_system': (lambda files: files.update({
     'site/dist/preview/system/index.html': re.sub(
         r'<div data-comp="split-media">.*?</div>', '',
         files['site/dist/preview/system/index.html'],
         count=1, flags=re.S)})),
 'check_class_subset': mut(('REPL','site/dist/home/index.html',
    'class="sec-bar surface-base density-compact" data-sec="nav"',
    'class="bogus-class" data-sec="nav"')),
 'check_no_stray_styles': mut(('REPL','site/dist/home/index.html','</head>','<style>a{color:#123456}</style></head>')),
 'check_page_data_attrs': mut(('REPL','site/dist/home/index.html','data-sec="hero"','data-x="hero"')),
 'check_heading_verbatim': mut(('REPL','site/dist/home/index.html','What is testing?','Something else?')),
 'check_viewport': mut(('REPL','site/dist/home/index.html','<meta name="viewport" content="width=device-width, initial-scale=1">','')),
 'check_tap_size': mut(('APPEND','site/dist/home/index.html','<style>a.x{min-height:20px}</style>')),
 'check_speed_budget': mut(('REPL','site/dist/home/index.html','src="/media/placeholder.svg"','src="hero.jpg"'),('APPEND','site/dist/home/index.html','<script src="https://tracker.example.com/x.js"></script>')),
 'check_mobile_budget': mut(('APPEND','site/dist/home/index.html','<style>.w{width:1200px}</style>')),
 'check_no_emoji': mut(('APPEND','site/dist/home/index.html','<p>Done \U0001F389</p>')),
 'check_context_budget': mut(('APPEND','STUB.md',
    '| pad | ' + 'x' * 500_000)),
 'check_icon_discipline': mut(('REPL','site/dist/home/index.html','width="24" height="24" viewBox="0 0 24 24"','width="13" height="13"')),
 'check_lucide': mut(('SET','site/src/components/raw-icon.astro',
     '<svg viewBox="0 0 24 24"><path d="M0 0h24"/></svg>'),),
 'check_ornament': mut(('REPL','site/dist/home/index.html',
     'data-ornament-variant="crosshair-grid+registration-marks"',
     'data-ornament-variant="compass"'),),
 'check_brand_motif': mut(('REPL','site/dist/home/index.html',
     'data-motif="hairline-numeral"','data-motif="swirl-blob"'),),
 'check_review_completeness': mut(('REPL','REVIEW.json','"pi-default-vlm"','"swe-2"')),
 'check_parallel_build': mut(('SET','BUILD-PLAN.json',
    '{"lanes":[{"id":"sec-macro","kind":"section",'
    '"model_lane":"coordinated"}]}')),
 'check_bounded_review': mut(('REPL','REVIEW.json',
    '"pi-default-vlm"','"opus-4"')),
 'check_section_program': mut(('REPL','DESIGN-PLAN.md',
    'speech_act: [proof], category: content',
    'speech_act: [detail], category: content')),
 'check_hero_composition': mut(('REPL','DESIGN-PLAN.md',
    'composition: split-media','composition: cards-n')),
 'check_vlm_evidence': mut(('REPL','REVIEW.json',
     '"vlm_evidence"','"vlm_evidence_off"'),),
 'check_serial_build_warn': mut(('SET','BUILD-PLAN.json',
    '{"lanes":[{"id":"orchestrate","kind":"orchestrator",'
    '"model_lane":"coordinated"}]}')),
 'check_hero_fold': mut(('REPL','site/dist/home/index.html',
     'class="sec-band surface-base density-spacious"',
     'class="sec-band surface-base density-spacious min-h-screen"'),
     ('REPL','site/dist/home/index.html',
     '<a class="wf-cta-button mt-stack" href="#">Book now</a>','')),
 'check_canon_padding': mut(('SET','CANON-PADDING.json',
     '{"components":{}}'),
     ('REPL','site/dist/home/index.html','data-disclosure="open"',
      'data-disclosure="open" style="padding:96px 48px"')),
 'check_sop_constants': mut(('SET','SOP-CONSTANTS.json',
     '{"dataset":"sop-adherence.json","verdicts":{"S.2":"relax"}}'),),
 'check_three_layers': mut(('APPEND','preview/variants.html',
     '<div data-tl-layer="ornament"><div data-candidate="c1" '
     'data-dna-fit="42"></div><div data-candidate="c2" '
     'data-dna-fit="80"></div><input type="radio"></div>'),),
 'check_primary_cta': mut(('REPL','site/dist/home/index.html',
     '<a class="wf-cta-button cta-large" href="#">Book now</a>',
     '<a class="btn-primary" href="/x">One</a>'
     '<a class="btn-primary" href="/y">Two</a>')),
 'check_interaction_states': mut(('REPL','site/src/styles/global.css',
     ':focus-visible',':focus'),('REPL','site/src/styles/global.css',
     '.btn-primary:hover',''),
     ('REPLGLOB','site/dist/_astro/',':focus-visible',':focus'),
     ('REPLGLOB','site/dist/_astro/','.btn-primary:hover','')),
 'check_forms': mut(('REPL','site/dist/home/index.html',
     '</main>','<form><input type="email" required></form></main>')),
 'check_heading_pattern': mut(('REPL','site/dist/home/index.html',
     '</main>',
     '<section data-sec="stray" data-comp="editorial"><p>Stray '
     'copy first, no heading, no lead.</p></section></main>')),
 'check_equal_cards': mut(('REPL','site/dist/home/index.html',
     '<svg data-motif','<div class="card"></div><div class="cardx feature"></div><svg data-motif')),
 'check_dark_media': mut(('REPL','site/src/styles/global.css',
     '[data-theme=dark] img { filter: brightness(.85) contrast(.92); }',
     ''),
     ('REPLGLOB','site/dist/_astro/',
      '[data-theme=dark] img{filter:brightness(.85) contrast(.92)}',''),
     ('REPL','site/dist/home/index.html',
      '</main>','<img src="/x.png" alt="a"></main>')),
 'check_logo': mut(('REPL','site/dist/home/index.html',
     'class="logo brand-mark"','class="logo"')),
 'check_accent_surfaces': mut(('REPL','site/dist/home/index.html',
     'surface-muted','surface-inverse')),
 'check_landmarks': mut(('REPL','site/dist/home/index.html',
     '<main id="main">','<div id="main">')),
 'check_sticky_offset': mut(('REPL','site/dist/home/index.html',
     'class="sec-band surface-base density-spacious"',
     'class="sec-band surface-base density-spacious sticky"')),
 'check_footer_structure': mut(('REPL','site/dist/home/index.html',
     '<div class="legal"> <span>Copyright 2026 Brand</span>','')),
 'check_meta': mut(('REPL','site/dist/home/index.html',
     '<meta name="description" content>','')),
 'check_intent_deviation': mut(('REPL','DESIGN-PLAN.md',
     'reason: "brief asks for editorial warmth"','reason: ""')),
 'check_wildcard_random': mut(('REPL','DNA.json',
     '"wildcard_seed": 424242','"wildcard_seed": null')),
 'check_auto_grid': (lambda files: files.update({
    k: re.sub(r'\[data-cols=.2.\]\s*\.grid-auto\s*\{[^}]*\}',
              '.fixed-grid{display:grid;grid-template-columns:'
              'repeat(3,1fr)}\\g<0>', files[k], count=1)
    for k in list(files)
    if k == 'site/src/styles/global.css' or
    k.startswith('site/dist/_astro/')})),
 'check_surface_rhythm': mut(('REPL','site/dist/home/index.html',
     'surface-muted','surface-base'),
     ('REPL','site/dist/home/index.html',
      'data-surface="muted"','data-surface="base"')),
 'check_intent_sections': mut(
     ('APPEND','site/dist/home/index.html',
      '<section data-sec="how" data-comp="sequence" '
      'data-intent="process"><h2 data-intent="process">How it works'
      '</h2><h2 data-intent="cost">What it costs</h2></section>'),
     ('REPL','DESIGN-PLAN.md',
     'intent: definition,','intent: process, group: g1,'),
     ('REPL','DESIGN-PLAN.md','intent: cta,','intent: cost, group: g1,'),
     ('REPL','site/dist/home/index.html','data-intent="proof"',
      'data-x="proof"')),
 'check_breathing': mut(
     ('REPL','site/dist/home/index.html',
      'sec-band surface-muted density-regular','density-regular py-2')),
 'check_candidate_review': mut(('DEL','preview/candidates.html')),
 'check_tailwind_preview': mut(
     ('REPL','preview/layouts.html',
      'cdn.tailwindcss.com','cdn.invalid.invalid')),
 'check_picker_ux': mut(
     ('REPL','preview/layouts.html',
      '<details class="variant-data"><summary>Design ',
      '<h2 class="variant-label">Design ')),
 'check_quality_floor': mut(
     ('REPL','REVIEW.json','"hero_clarity": 73',
      '"hero_clarity": 20')),
 'check_present_order': mut(
     ('REPL','REVIEW.json','"judgment_pass_hash": "',
      '"judgment_pass_hash": "tampered-')),
 'check_prebuild_receipt': mut(
    ('DEL','PREBUILD.json')),
 'check_block_trace': mut(
     ('REPL','REVIEW.json',
      '"recipe_id": "brixies/banner-section/banner-1.topo"',
      '"recipe_id": "brixies/made-up/thing-9"')),
 'check_receipts': mut(('SET','GATES.json','{"artifacts":{}}')),
 'check_fine_round': mut(('COPY','preview/fine.html',
     'preview/variants.html'),
     ('COPY','site/dist/preview/look-fv1/index.html',
      'site/dist/preview/look-v1/index.html'),
     ('COPY','site/dist/preview/look-fv2/index.html',
      'site/dist/preview/look-v2/index.html'),
     ('COPY','site/dist/preview/look-fv3/index.html',
      'site/dist/preview/look-v3/index.html')),
 'check_round_gated': (lambda files: (
     _clone_card(files, 'd2'), files)[1]),
 # dead-var attack: v2 renders v1's page verbatim and "differs" only
 # in three vars nothing consumes — ROUND2 must count 0 consumed
 'check_round_gated_look': mut(
     ('COPY','site/dist/preview/look-v2/index.html',
      'site/dist/preview/look-v1/index.html'),
     ('REPL','site/dist/preview/look-v2/index.html',
      'data-variant-scope="v1" style="',
      'data-variant-scope="v2" style="--zz-a:1;--zz-b:2;--zz-c:3;')),
 'check_acss_conventions': mut(('APPEND','site/src/styles/global.css',
     '\n.x { color: rgba(0,0,0,.5); }')),
 'check_motion_recipes': mut(('APPEND',
     'site/dist/home/style.css',
     '@keyframes unregistered-spin { from { transform: rotate(0); '
     'width: 10px; } to { transform: rotate(1turn); width: 20px; } } '
     '.spin { animation: unregistered-spin 2s infinite; }')),
 'check_content_map': mut(
     ('REPL','DESIGN-PLAN.md','content_ids: [c-cta, c-faq]',
      'content_ids: [c-cta, c-faq, c-invented]')),
 'check_skeleton': mut(
     ('APPEND','site/dist/home/index.html',
      '<section data-sec="proof" data-comp="logo-wall" '
      'data-intent="proof" data-skeleton="hyperui/marketing/'
      'logo-clouds/1" class="sec-band grid grid-cols-2 '
      'bg-blue-50 text-lg">'
      '<h3>Trusted</h3><svg viewBox="0 0 24 24"/></section>'),
     ('REPL','MOBBIN-REFS.md','| mobbin-def456 |',
      '| hyperui/marketing/faqs/1 |')),
 'check_page_family': mut(
     ('REPL','DESIGN-PLAN.md','layout_family: conversion',
      'layout_family: editorial')),
 'check_motion_js_budget': mut(('SET','site/dist/_astro/mo.js',
     'gsap.to(".x",{y:9});' + 'x'*5000)),
 'check_card_contract': mut(('REPL','site/dist/home/index.html',
     '<h2 class="text-fluid-3">What is testing?</h2>',
     '<a class="card" href="/x"><h2 class="text-fluid-3">What is testing?</h2></a>')),
 'check_trend_vocab': mut(('REPL','DNA.json',
     '"variants": [',
     '"trend": [{"trend": "retro-max", "confidence": 0.9, '
     '"evidence": "x"}], "variants": [')),
 'check_component_profile': mut(('REPL','site/dist/home/index.html',
     'data-comp="cards-n"','data-comp="bogus-comp"')),
 'check_dead_columns': mut(('APPEND','site/dist/home/index.html',
     '<section data-comp="split-media" data-sec="dead"><img src="/x.png" alt="a"><div></div></section>')),
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
    'temperature: cool, shape: p2','temperature: warm, shape: p3'),
    ('REPL','DESIGN-PLAN.md',
     'temperature: warm, shape: p4, mutates: [radius-personality, motion-tier]',
     'temperature: warm, shape: p3')),
 'check_content_inventory': mut(('DEL','STUB.md')),
 'check_neutral_tint': mut(('REPL','DESIGN-PLAN.md',
    'surface: {value: "#F1EFEC"}','surface: {value: "#8A8A8A"}')),
 'check_proximity': mut(('REPL','DESIGN-PLAN.md',
    'group_gap_vs_section_gap: "≥2×"','group_gap_vs_section_gap: "≥1.2×"')),
 'check_border_widths': mut(('REPL','site/src/styles/global.css',
    'border-top: 1px solid var(--c-line);','border-top: 3px solid var(--c-line);'),
    ('REPLGLOB','site/dist/_astro/','border-top:1px solid var(--c-line)','border-top:3px solid var(--c-line)')),
 'check_reduced_motion': mut(('REPL','site/src/styles/global.css',
    '@media (prefers-reduced-motion: reduce)','@media (min-width: 9999px)')),
 'check_copy_density': mut(('REPL','site/dist/home/index.html',
    '>Testing is the thing.</p>',
    '>' + 'long copy sentence ' * 20 + '</p>')),
 'check_seo_lint': mut(('REPL','site/dist/home/index.html',
    '<h2 class="text-fluid-3">What is testing?',
    '<h4 class="text-fluid-3">What is testing?')),
 'check_section_contracts': mut(('DEL','sections/01-hero.contract.json')),
 'check_dna': mut(('REPL','DNA.json','"type.ratio": 1.25','"type.ratio": 9.9')),
 'check_dna_fresh': mut(('REPL','site/src/components/sections/Hero.astro',
    'dna_hash: ','dna_hash: deadbeef')),
 'check_dark_mode': mut(('REPL','site/tailwind.config.js',
    "darkMode: 'class',","")),
 'check_dark_toggle': mut(('REPL','site/dist/home/index.html',
    'data-theme-toggle','data-nope'),
    ('REPL','site/dist/home/index.html','<head>',
     '<head><script>var __os=window.matchMedia('
     '"(prefers-color-scheme: dark)");</script>')),
 'check_variants': mut(('REPL','DNA.json','"id": "v3"','"id": "v9"')),
 'check_review_modes': mut(
     ('DEL','shots/1280-dark-home.png'),
     ('DEL','shots/768-dark-home.png'),
     ('DEL','shots/360-dark-home.png')),
 'check_section_shell': mut(('APPEND','site/src/components/sections/Hero.astro',
    '<style>.x{color:#111}</style>')),
 'check_section_allowed': mut(('REPL','site/src/components/cards-n.astro',
    'text-fluid-3','text-[42px]')),
 'check_section_gates': mut(('SET','sections/01-hero.gate.json',
    '{"section": "hero", "pass": false, "failures": ["seeded"]}')),
 'check_exemplars': mut(('REPL','site/src/components/sections/Nav.astro',
    'exemplar: flyout-nav','exemplar: bogus')),
 'check_assembly': mut(('REPL','site/src/pages/home.astro',
    '<Hero />','<Hero2 />')),
 'check_rhythm_render': mut(('REPL','site/dist/home/index.html','surface-inverse','surface-base'),
    ('REPL','site/dist/home/index.html','data-surface="inverse"','data-surface="base"')),
 'check_style_review': mut(('SET','GATES.json','{"w5": {"design": "d3"}}'),
    ('REPL','REVIEW.json','"style": [','"style_off": [')),
 'check_style_licence': mut(('REPL','DESIGN-PLAN.md',
    'decisions:\n  - {rule_id: L.3',
    'style_licences:\n  - {cluster: made-up-style, where: ""}\n'
    'decisions:\n  - {rule_id: L.3')),
 'check_segment_roles': mut(('REPL','site/dist/home/index.html',
    'data-sec="hero"','data-x="hero"')),
 'check_segment_region': mut(('REPL','site/dist/home/index.html',
    'data-sec="how"','data-sec="legal"')),
 'check_segment_share': mut(('APPEND','site/dist/home/index.html',
    '<nav data-sec="nav">' + '<p>x</p>' * 15
    + '</nav><footer></footer>')),
 'check_segment_media': mut(('APPEND','site/dist/home/index.html',
    '<section data-sec="media-block"><img src="/x.png"></section>'
    '<footer></footer>')),
 'check_segment_footer': mut(('REPL','site/dist/home/index.html',
    '</footer>','<h2>Fixture Co</h2></footer>')),
 'check_segment_priority': mut(('REPL','site/dist/home/index.html',
    '<body>','<body><aside class="sidebar">ads</aside>')),
 'check_checklist': mut(('SET','CHECKLIST/w3.md',
    '| Rule | Evidence |\n|---|---|\n| T.1 font directory | |\n')),
 'check_novelty': mut(('SET','GATES.json',
    '{"w5": {"design": "d3"}}'),
    ('REPL','NOVELTY.json','"distance": 0.44','"distance": 0.90')),
 'check_faq_collapsed': mut(
     ('APPEND','site/dist/home/index.html',
      '<details class="faq-item" open><summary>q</summary></details>')),
 'check_card_hierarchy': mut(
     ('APPEND','site/dist/home/index.html',
      '<div class="card"><p>bare text, no heading</p></div>')),
 'check_icon_ring': mut(
     ('APPEND','site/dist/home/index.html',
      '<div class="card"><h3>t</h3><svg viewBox="0 0 24 24"></svg></div>')),
 'check_gap_floor': (lambda files: files.update({
     k: files[k] + '\n.zgap-stack{display:flex}' for k in list(files)
     if k == 'site/src/styles/global.css' or
     k.startswith('site/dist/_astro/') and k.endswith('.css')})),
 'check_type_scale_min': (lambda files: files.update({
     k: files[k] + '\n:root{--h2:clamp(1rem,1rem,1rem);'
     '--h3:clamp(1rem,1rem,1rem)}' for k in list(files)
     if k == 'site/src/styles/global.css' or
     k.startswith('site/dist/_astro/') and k.endswith('.css')})),
 'check_contrast_pairs': (lambda files: files.update({
     k: files[k] + '\n.lowc{color:#777777;background:#888888}'
     for k in list(files)
     if k == 'site/src/styles/global.css' or
     k.startswith('site/dist/_astro/') and k.endswith('.css')})),
 # ---- plan §5 machinery checks -------------------------------------
 'check_source_bind': mut(('APPEND','SOURCES/article.md',
    '\n\none more paragraph\n')),
 'check_copy_coverage': mut(('REPL','DESIGN-PLAN.md',
    'copy_ref: b02','copy_ref: b01')),
 'check_plan_provenance': (lambda files: files.update({
     'DESIGN-PLAN.md': re.sub(
         r'(COPY\.json sha256:)([0-9a-f])',
         r'\g<1>0', files['DESIGN-PLAN.md'], count=1)})),
 'check_copy_shape_fit': mut(('REPL','DESIGN-PLAN.md',
    'copy_ref: b03, refs: [mobbin-ghi789], content_ids: [c-how]',
    'composition: bogus-grid, copy_ref: b03, '
    'refs: [mobbin-ghi789], content_ids: [c-how]'),
    ('REPL','DESIGN-PLAN.md',
     'composition: sequence, emphasis: steps',
     'emphasis: steps')),
 'check_light_canvas': mut(('REPL','BRIEF.yaml',
    'canvas: "#FDFCFA"','canvas: "#ABC0EF"')),
 'check_discovery_provenance': mut(('REPL','DNA.json',
    '"source": "BRIEF.theme.canvas',
    '"source": "agent guess on'),
    ('REPL','DNA.json',
    '"bg": "#FDFCFA"',
    '"bg": "#123456"')),
 'check_brief_hash': mut(('REPL','DISCOVERY.json',
    f'"brief_sha256": "{_sh(BRIEF)}"',
    '"brief_sha256": "deadbeef"')),
 'check_run_pin': mut(('SET','RUN.json',
    json.dumps({"token_sig": gate.run_token_sig("bad-token",
                                              b'fixture-key'),
                "gate_sha256": "deadbeef",
                "rules_sha256": "deadbeef",
                "brief_sha256": "deadbeef"}))),
 'check_operator_approvals': mut(
    ('SET','RUN.json', json.dumps(
        {"token_sig": gate.run_token_sig("fixture-run",
                                        b'fixture-key')})),
    ('SET','APPROVALS.json', json.dumps({
        "w3": {"wave": "w3", "inputs": "x", "dna": {},
               "by": "agent", "ts": "2026-11-19T00:00:00",
               "sig": "unsigned"}}))),
 'check_layout_options': mut(('REPL','LAYOUT-OPTIONS.json',
    '"b02": "editorial"','"b02": "bogus-comp"')),
 'check_layout_scores': (lambda files: files.update({
    'preview/layouts.html': re.sub(
        r'(<article[^>]*id="d2"[^>]*data-score=")0\.91',
        r'\g<1>0.11',
        files['preview/layouts.html'], count=1)})),
 'check_layout_pick': mut(('REPL','LAYOUT-OPTIONS.json',
    '"pick": "d1"','"pick": "d2"'),
    ('REPL','DESIGN-PLAN.md',
     'option:d1 — do not edit -->','option:d2 — do not edit -->'),
    ('REPL','STUB.md',
     'option:d1 — do not edit -->','option:d2 — do not edit -->')),
 'check_copy_fidelity': mut(('REPL','site/dist/home/index.html',
    '</main>',
    '<section data-sec="fake" data-comp="editorial"><p>Invented praise '
    'nobody ever wrote anywhere.</p></section>'
    '<div data-comp="nav-bar" aria-label="bogus invented nav label">'
    '<svg><text>svg chrome nobody wrote</text></svg></div></main>')),
 'check_unsourced_quotes': mut(('REPL','site/dist/home/index.html',
    '</main>',
    '<section data-sec="fake" data-comp="quote-grid"><blockquote>'
    'An invented praise quote that never happened.</blockquote>'
    '</section></main>')),
 'check_light_paint': mut(('REPL','site/dist/home/index.html',
    '<html lang="en" dir="ltr">',
    '<html lang="en" dir="ltr" class="dark">'),
    ('REPL','site/dist/home/index.html',
    '</main>',
    '<script>var __os=window.matchMedia("(prefers-color-scheme: dark)"'
    ');</script></main>')),
 'check_acss_tokens': mut(('APPEND','site/src/styles/global.css',
    ':root { --pad-x: clamp(1rem, 2vw, 2rem); }')),
 'check_fluid_sizes': (lambda files: files.update({
    'site/src/styles/global.css': re.sub(
        r'--space-m:\s*clamp\([^;]+\)',
        '--space-m: min(18px, 3vw)',
        files['site/src/styles/global.css'], count=1)
    + '.sub-h { font-size: 1.25rem; gap: 1.5em; '
    'color: var(--bogus-tok); }'})),
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
    # F4 — every gated artifact is REAL producer output, emitted into
    # _base and ingested back into BASE. pipeline_emit.main runs the
    # exact pipeline chain: S0 scaffold (package.json/astro.config),
    # P2 tailwind config, P3 global.css, S2/S4 shell+layout, P6 gold
    # exemplars → src/components/, W6 instances (dna_hash/structure_
    # hash/exemplar echoes), VG.1 system tile + COMPONENTS.md,
    # gate.contracts + gate.section, assemble.py (home.astro, SPEC.md,
    # PAGES/*/SPEC.md, ASSEMBLED.md).
    base_dir = os.path.join(FX, '_base')
    rc = pipeline_emit.main(['pipeline_emit.py', base_dir,
                             '--with-toolchain'])
    if rc:
        raise SystemExit(f'pipeline_emit failed ({rc}) — fixture '
                         'sources are broken, not a fixture bug')
    # Ornaments/motifs have no inject-producer yet (the O/BM gates read
    # rendered markup but no emitter writes them): the fixture injects
    # machinery-generated svg — ornament.generate() geometry + declared
    # placements, the motif kit mark — into the emitted instances, so
    # the O/BM pass arms exercise real rendered output, not vacuity.
    hp = os.path.join(base_dir, 'site/src/components/sections',
                      'Hero.astro')
    with open(hp, 'a', encoding='utf-8') as fh:
        fh.write(_ornament() + '\n')
    mp = os.path.join(base_dir, 'site/src/components/sections',
                      'Services.astro')
    with open(mp, 'a', encoding='utf-8') as fh:
        fh.write(MOTIF_SVG + '\n')
    # The w7 dist is `astro build` output of that emitted site —
    # minified/hashed is fine; the checks read real markup.
    r = subprocess.run(['npm', 'run', 'build'],
                       cwd=os.path.join(base_dir, 'site'),
                       capture_output=True, text=True, timeout=300,
                       env=gate.node_env())
    if r.returncode:
        tail = '\n'.join((r.stdout + r.stderr).split('\n')[-8:])
        raise SystemExit(f'astro build failed in _base: {tail}')
    # The w3/w4/w5 pickers are REAL producer output: preview_build
    # emits src/pages/preview/*.astro, astro-builds them, then writes
    # the thin shells into preview/ (each card iframes its built
    # page). Never canned mock markup — the gates read the render.
    bctx = gate.Ctx(base_dir)
    lp, ltxt, _ = preview_build.emit_layouts(bctx)
    os.makedirs(os.path.dirname(lp), exist_ok=True)
    with open(lp, 'w', encoding='utf-8') as fh:
        fh.write(ltxt)
    vp, vtxt, _ = preview_build.emit_variants(bctx)
    os.makedirs(os.path.dirname(vp), exist_ok=True)
    with open(vp, 'w', encoding='utf-8') as fh:
        fh.write(vtxt)
    tp, ttxt, _ = preview_build.emit_system(bctx)
    os.makedirs(os.path.dirname(tp), exist_ok=True)
    with open(tp, 'w', encoding='utf-8') as fh:
        fh.write(ttxt)
    cp, ctxt_, _ = gate.assemble_candidates(bctx)
    os.makedirs(os.path.dirname(cp), exist_ok=True)
    with open(cp, 'w', encoding='utf-8') as fh:
        fh.write(ctxt_)
    # fine.html comes from the real producer (P.18): assemble_fine emits
    # three ±1-step stylistic nudges of the w4-approved pick. Seed the
    # approval first — same sequence a real pipeline takes.
    bctx = gate.Ctx(base_dir)
    pick_id = next((vid for vid, (e, f_) in
                    gate._variant_entries(bctx).items() if not f_), None)
    gate.write_approval(bctx, 'w4', design=pick_id,
                        evidence='fixture pick')
    fp2, ftxt, _ = gate.assemble_fine(bctx)
    with open(fp2, 'w', encoding='utf-8') as fh:
        fh.write(ftxt)
    # Ingest every produced artifact into BASE: components, instances,
    # pages, contracts/gates, previews, SPEC.md/ASSEMBLED.md and the
    # real dist (hashed _astro/*.css included). node_modules and the
    # .astro build cache stay on disk only — not fixture content.
    _skip = {'site/node_modules', 'site/.astro'}
    for dp, dns, fns in os.walk(base_dir):
        dns[:] = [d for d in dns
                  if os.path.relpath(os.path.join(dp, d), base_dir)
                  not in _skip]
        for fn in fns:
            rel = os.path.relpath(os.path.join(dp, fn),
                                  base_dir).replace(os.sep, '/')
            full = os.path.join(dp, fn)
            try:
                BASE[rel] = open(full, encoding='utf-8').read()
            except (UnicodeDecodeError, ValueError):
                BASE[rel] = open(full, 'rb').read()
    # the toolchain clone is emit machinery, not fixture content —
    # _base must not carry it (selftest copies _base per pass dir and
    # dangling clonefile links break shutil.copytree)
    for _gone in _skip:
        shutil.rmtree(os.path.join(base_dir, _gone),
                      ignore_errors=True)
    # MEASURE.json / JUDGE.json — emitted through the real tool
    # doc-builders (measure.doc + judge.judge_doc) so the fixture can
    # never drift from the producer schema; only the per-viewport
    # numbers are seeded, all clear of the J.12 floors.
    import measure as _meas
    import judge as _judge
    _mctx = gate.Ctx(base_dir)
    _mctx.wave = 'w7'
    _vp = {w: {'page_height_px': 9200, 'viewport_px': 1100,
               'media_area_px': 1200000, 'image_coverage': 0.14,
               'media_kinds': {'img': 1100000, 'svg': 100000},
               'section_count': 9,
               'contrast_min_ratio': 7.2, 'contrast_min_context': 'p',
               'tap_target_min_px': 28.0, 'tap_target_context': 'a nav',
               'cta_count': 4, 'proof_surfaces': 2,
               'proof_context': ['proof'],
               'dead_space': {'max_run_px': 220,
                              'max_run_viewports': 0.2,
                              'ratio': 0.024, 'at_y_px': 3200},
               'hierarchy_violations': []}
           for w in ('1280', '768', '360')}
    _pages = {'home': {'viewports': _vp,
                       'contrast_dark': {'ratio': 7.1,
                                         'context': 'p'},
                       'pixel': {}}}
    _m = _meas.doc(_mctx, _pages)
    BASE['MEASURE.json'] = json.dumps(_m, indent=1, sort_keys=True)
    _j = _judge.judge_doc(_m, _mctx)
    _j['measure_sha256'] = hashlib.sha256(
        BASE['MEASURE.json'].encode()).hexdigest()[:16]
    BASE['JUDGE.json'] = json.dumps(_j, indent=1, sort_keys=True)
    for _rel in ('MEASURE.json', 'JUDGE.json'):
        with open(os.path.join(base_dir, _rel), 'w') as _fh:
            _fh.write(BASE[_rel])
    _g = json.loads(BASE.get('GATES.json', '{"artifacts":{}}'))
    _g.setdefault('artifacts', {})
    _g.setdefault('w3', {'pass': True})
    _g.setdefault('w4', {'pass': True})
    _g.setdefault('w1', {'pass': True})
    _g.setdefault('w7', {'pass': True})
    # the fixture key lives in the temp operator home: sign receipts
    # with gate.op_key() so selftest's key verifies them (P.17).
    import tempfile as _tf
    _th = _tf.mkdtemp()
    os.makedirs(os.path.join(_th, '.web-factory'))
    with open(os.path.join(_th, '.web-factory', 'operator.key'),
              'w') as _fh:
        _fh.write('fixture-key')
    _saved_home = gate.OPERATOR_HOME
    gate.OPERATOR_HOME = os.path.join(_th, '.web-factory')
    # P.17 — every artifact a wave produced binds a signed receipt to
    # the LAST wave ARTIFACTS claims it (check_receipts' wanted map)
    _due = {}
    for _wv in gate.WAVE_SEQ:
        for _rel in gate.ARTIFACTS.get(_wv, []):
            _due[_rel] = _wv
    for rel, wv in _due.items():
        if rel in BASE:
            rec = {'wave': wv,
                   'sha256': hashlib.sha256(
                       BASE[rel].encode()).hexdigest(),
                   'gate_pass': True}
            rec['sig'] = gate._sig(rec, gate.op_key())
            _g['artifacts'][rel] = rec
    gate.OPERATOR_HOME = _saved_home
    # frozen-input hashes — the w2 wave sealed STUB.md (P.22: an
    # input a gate consumed is frozen once that wave passed)
    _g['w2'] = {'pass': True,
                'inputs_sha256': {
                    'STUB.md': hashlib.sha256(
                        BASE['STUB.md'].encode()).hexdigest()[:16]}}
    BASE['GATES.json'] = json.dumps(_g, indent=1)
    with open(os.path.join(base_dir, 'GATES.json'), 'w') as fh:
        fh.write(BASE['GATES.json'])
    # bind the review artifact to the build it graded (P.8) — inside a
    # temp operator home, never the real ~/.web-factory
    tmp_home = tempfile.mkdtemp()
    os.makedirs(os.path.join(tmp_home, '.web-factory'))
    with open(os.path.join(tmp_home, '.web-factory', 'operator.key'),
              'w') as fh:
        fh.write('fixture-key')
    gate.OPERATOR_HOME = os.path.join(tmp_home, '.web-factory')
    ctx_b = gate.Ctx(base_dir)
    ctx_b.wave = 'w7'
    rv = json.loads(BASE['REVIEW.json'])
    rv['dist_sha256'] = gate._dist_sha(ctx_b)
    # J.* — quality rows per picker option, block-trace rows per
    # rendered block, hash equality across the rules/judgment gates
    _pg = dict(re.findall(r'data-sec="([\w-]+)"[^>]*data-recipe='
                          r'"([^"]+)"',
                          BASE['site/dist/home/index.html']))
    rv['quality'] = {**{
        f'd{i}': {'hero_clarity': 72 + i, 'layout_craft': 70,
                  'media_fit': 66, 'mobile': 74,
                  'distinctness': 68, 'topology_dist': 0.5,
                  'visual_diff': 70, 'composite': 66 + i,
                  'judged_by': 'pi-default-vlm'}
        for i in range(1, 6)}, **{
        f'v{i}': {'hero_clarity': 75, 'layout_craft': 72,
                  'media_fit': 70, 'mobile': 76,
                  'distinctness': 65, 'topology_dist': 0.4,
                  'visual_diff': 68, 'composite': 70 + i,
                  'judged_by': 'pi-default-vlm'}
        for i in range(1, 4)}, **{
        f'fv{i}': {'hero_clarity': 76, 'layout_craft': 71,
                   'media_fit': 72, 'mobile': 75,
                   'distinctness': 66, 'topology_dist': 0.4,
                   'visual_diff': 67, 'composite': 71 + i,
                   'judged_by': 'pi-default-vlm'}
        for i in range(1, 4)}}
    rv['blocks'] = [{
        'block_id': f'home:{sec}',
        'dna_knobs_used': ['radius-personality', 'type-base-px',
                           'space-density-step'],
        'plan_slot': sec, 'recipe_id': rid,
        'vector_deviation': 'none'}
        for sec, rid in _pg.items()]
    rv['rules_pass_hash'] = rv['dist_sha256']
    rv['judgment_pass_hash'] = rv['dist_sha256']
    sl = gate.dna_slices(gate.dna_map(ctx_b))
    canon = json.dumps({k: v for k, v in rv.items() if k != 'sig'},
                       sort_keys=True)
    body = (f"{rv['nonce']}|{rv['dist_sha256']}|{sl.get('core')}|"
            f"{rv.get('reviewer_model')}|"
            + hashlib.sha256(canon.encode()).hexdigest()[:16])
    rv['sig'] = hmac.new(gate.op_key(create=True), body.encode(),
                         hashlib.sha256).hexdigest()[:32]
    BASE['REVIEW.json'] = json.dumps(rv, indent=1)
    with open(os.path.join(base_dir, 'REVIEW.json'), 'w') as fh:
        fh.write(BASE['REVIEW.json'])
    _g = json.loads(BASE['GATES.json'])
    _g.setdefault('w8', {'pass': True})
    _rrec = {'wave': 'w8',
             'sha256': hashlib.sha256(
                 BASE['REVIEW.json'].encode()).hexdigest(),
             'gate_pass': True}
    _rrec['sig'] = gate._sig(_rrec, b'fixture-key')
    _g['artifacts']['REVIEW.json'] = _rrec
    BASE['GATES.json'] = json.dumps(_g, indent=1)
    with open(os.path.join(base_dir, 'GATES.json'), 'w') as fh:
        fh.write(BASE['GATES.json'])
    # APPROVALS.json — the signed operator records (X.3): the human
    # only picks w3 (layout) and w4 (look); w1/w8 advance on gate
    # pass alone. Signed with the deterministic fixture Ed25519 key;
    # ctx.read_approvals finds the dir-local file.
    gate.OPERATOR_HOME = os.path.join(tmp_home, '.web-factory')
    ctx_a = gate.Ctx(base_dir)
    pick_id = next((vid for vid, (e, f_) in
                    gate._variant_entries(ctx_a).items()
                    if not f_), None)
    _appr = {}
    # X.3 — records must Ed25519-verify against the pinned pubkey.
    # The fixture keypair is deterministic (fixed seed) and its
    # pubkey lives at fixtures/.fixture-pub.json; the selftest
    # monkeypatches approval_key.PUBKEY_PATH + ANCHOR_OVERRIDE to it.
    import approval_key as AK
    _fseed = hashlib.sha256(b'web-factory fixture key').digest()
    _fpub = AK._publickey(_fseed).hex()
    with open(os.path.join(FX, '.fixture-pub.json'), 'w') as fh:
        json.dump({'ed25519_public_key': _fpub}, fh, indent=1)
    for wv in sorted(gate.APPROVABLE):
        rec = gate.approval_body(
            ctx_a, wv, by='operator-service',
            design=pick_id if wv == 'w4' else
            ('d1' if wv == 'w3' else None),
            nonce=hashlib.sha256(
                f'fixture-nonce-{wv}'.encode()).hexdigest()[:32],
            evidence='fixture approval')
        rec['sig'] = AK.ed25519_sign(
            _fseed, json.dumps(
                {k: v for k, v in rec.items() if k != 'sig'},
                sort_keys=True).encode())
        _appr[wv] = rec
        gate.write_approval(ctx_a, wv, rec=rec)
    BASE['APPROVALS.json'] = json.dumps(_appr, indent=1, sort_keys=True)
    gate.OPERATOR_HOME = _saved_home
    with open(os.path.join(base_dir, 'APPROVALS.json'), 'w') as fh:
        fh.write(BASE['APPROVALS.json'])
    # X.2 — RUN.json pins the tools tree, templates tree and pubkey
    # AS THEY ARE AT GEN TIME. Regenerate after any tool edit; the
    # pin is what makes mid-run tool edits a gate failure.
    _run = json.loads(BASE.get('RUN.json') or '{}')
    _run['tools_sha256'] = {
        fn: hashlib.sha256(
            open(os.path.join(HERE, fn), 'rb').read()).hexdigest()
        for fn in sorted(os.listdir(HERE)) if fn.endswith('.py')}
    _run['templates_sha256'] = gate._dir_sha256(
        os.path.join(REPO_DIR, 'templates'))
    _pub_p = os.path.join(HERE, 'approval_pubkey.json')
    _run['approval_pubkey_sha256'] = (
        hashlib.sha256(open(_pub_p, 'rb').read()).hexdigest()
        if os.path.isfile(_pub_p) else None)
    _run.setdefault('gate_sha256', _run['tools_sha256']['gate.py'])
    _run['token_sig'] = gate.run_token_sig('fixture-run',
                                          b'fixture-key')
    _brf = os.path.join(base_dir, 'BRIEF.yaml')
    if os.path.isfile(_brf):
        _run['brief_sha256'] = hashlib.sha256(
            open(_brf, 'rb').read()).hexdigest()
    _rl = os.path.join(base_dir, 'RULES.md')
    if os.path.isfile(_rl):
        _run['rules_sha256'] = hashlib.sha256(
            open(_rl, 'rb').read()).hexdigest()
    BASE['RUN.json'] = json.dumps(_run, indent=1, sort_keys=True)
    with open(os.path.join(base_dir, 'RUN.json'), 'w') as fh:
        fh.write(BASE['RUN.json'])
    # P.9 — producer receipts + machine-emitted checklists: the gate
    # cross-verifies each input row's sha against .receipts and disk.
    _recs = {}
    for _wv in gate.WAVE_SEQ:
        outs = {}
        for rel in gate.ARTIFACTS.get(_wv, []):
            fp = os.path.join(base_dir, rel)
            if os.path.isfile(fp):
                outs[rel] = hashlib.sha256(
                    open(fp, 'rb').read()).hexdigest()[:16]
        if outs:
            _recs[_wv] = outs
    for _wv, _outs in _recs.items():
        rp = os.path.join(base_dir, '.receipts', _wv + '.json')
        os.makedirs(os.path.dirname(rp), exist_ok=True)
        _step = {'label': f'fixture {_wv} producers',
                 'argv': ['pipeline_emit.py'],
                 'inputs': {}, 'outputs': _outs, 'rc': 0,
                 'ts': 'fixture'}
        _step['sig'] = _fx_sig(_step)
        _rec = {'steps': [_step]}
        with open(rp, 'w') as fh:
            json.dump(_rec, fh, indent=1)
        BASE[f'.receipts/{_wv}.json'] = json.dumps(_rec, indent=1)
    import checklist_emit as CE
    for _wv in ('w2', 'w3', 'w5'):
        _p, _t = CE.emit(base_dir, _wv)
        BASE[f'CHECKLIST/{_wv}.md'] = _t
    # check_board_render — fail: a built board option whose header
    # wraps onto two rows with 9px links, with no h1 and a 900px band
    # that overflows 390px (pass: _base has no boards dist)
    MUT['check_board_render'] = mut(('SET',
        'boards/site/dist/preview/lo-home-01/index.html',
        '<!doctype html><html><body style="margin:0">'
        '<header data-sec="header" data-comp="hdr-x"><a href="/">Brand</a>'
        '<div style="margin-top:60px"><a href="/a" style="font-size:9px">'
        'Area</a></div></header><section data-sec="hero" '
        'data-comp="hero-x"><h2>No h1</h2><div style="width:900px">'
        'wide</div></section></body></html>'))
    # check_board_roles — fail: a blog option with only a hero (no
    # featured/listing/categories/newsletter sections)
    MUT['check_board_roles'] = mut(('SET',
        'boards/site/dist/preview/lo-blog-01/index.html',
        '<!doctype html><html><body><section data-sec="hero" '
        'data-comp="hero-x"><h1>Guides</h1></section></body></html>'))
    # check_board_pools — fail: two boards opening on the same hero
    # recipes (one pool at two rotations)
    _hs = [{'hero': {'recipe': f'bricksmaven/hero/hero-{i}'}}
           for i in range(1, 6)]
    MUT['check_board_pools'] = mut(('SET', 'PAGE-BOARDS.json',
        json.dumps({'boards': {'home': {'options': _hs},
                               'service': {'options': _hs[2:] + _hs[:2]}}})))
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

    # check_site_dna — X.5 needs a REAL site shape (pages/<slug> under
    # a site root): _site/pass and _site/fail are two site dirs, each
    # holding a full _base copy at pages/home. pass' page DNA stamps
    # the site DNA sha; fail edits the site DNA after the page copied
    # it. ctx.site_dir resolves because the parent dir is 'pages'.
    for sub, mutate in (('pass', False), ('fail', True)):
        sroot = os.path.join(FX, '_site', sub)
        pdir = os.path.join(sroot, 'pages', 'home')
        for rel, content in BASE.items():
            p = os.path.join(pdir, rel)
            os.makedirs(os.path.dirname(p), exist_ok=True)
            mode = 'wb' if isinstance(content, bytes) else 'w'
            with open(p, mode) as fh:
                fh.write(content)
        for rel, content in (
                ('BRIEF.yaml', BASE['BRIEF.yaml']),
                ('DISCOVERY.json', BASE['DISCOVERY.json']),
                ('MOBBIN-REFS.md', BASE['MOBBIN-REFS.md']),
                ('DNA.json', BASE['DNA.json']),
                ('TOKENS.json', BASE['TOKENS.json'])):
            with open(os.path.join(sroot, rel), 'w') as fh:
                fh.write(content)
        if mutate:
            sdna = open(os.path.join(sroot, 'DNA.json')).read()
            with open(os.path.join(sroot, 'DNA.json'), 'w') as fh:
                fh.write(sdna.replace('"#0055AA"', '"#AA5500"', 1))
        # restamp the page DNA with the (possibly mutated) site sha
        pdna = json.load(open(os.path.join(pdir, 'DNA.json')))
        pdna['site_dna_sha256'] = _sh(
            open(os.path.join(sroot, 'DNA.json'), 'rb').read())
        pdna['hashes'] = gate.dna_slices(pdna)
        with open(os.path.join(pdir, 'DNA.json'), 'w') as fh:
            json.dump(pdna, fh, indent=1)
        tdir = os.path.join(FX, 'check_site_dna', sub)
        os.makedirs(os.path.dirname(tdir), exist_ok=True)
        if os.path.lexists(tdir):
            os.remove(tdir)
        os.symlink(os.path.relpath(pdir, os.path.dirname(tdir)), tdir)

    # check_tiers pass fixture (global rule → pass only, no fail dir)
    pd = os.path.join(FX, 'check_tiers', 'pass')
    os.makedirs(pd, exist_ok=True)
    for rel in ('DESIGN-PLAN.md', 'DNA.json'):
        src = os.path.relpath(os.path.join(FX, '_base', rel), pd)
        if not os.path.lexists(os.path.join(pd, rel)):
            os.symlink(src, os.path.join(pd, rel))
    # check_genotype/pass: extra rows (logo-wall proof, faq answers,
    # sequence how, faq objections) ahead of the end-act so D.4's
    # catalog->archetype map is exercised end to end, not just on
    # the 7-row base page.
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
