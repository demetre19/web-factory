---
id: motion-taxonomy
type: taxonomy
links:
  used_in: [w7, w8]
  feeds: [motion-classifier]
---

# Motion taxonomy — closed vocabularies for micro-animations

Every animation found on a scanned site is classified against the closed
sets below (`taxonomy.json` is the machine-readable twin). A value not in
these sets is either `other:<reason>` (recorded, low-confidence) or a
signal that the taxonomy needs a new release — never invent ad-hoc labels
in canon data.

## `trigger` — what starts the animation

| Value | Detection signature |
|---|---|
| `load` | animation/transition active at `DOMContentLoaded`, no observer |
| `in-view` | `IntersectionObserver` callback toggles a class; or CSS `animation-timeline: view()` |
| `loop` | `animation-iteration-count: infinite`, self-starting (may still begin on `in-view` — then record `trigger: in-view` + `loop_type`) |
| `hover` | `:hover` rule / JS pointer events |
| `focus` | `:focus`, `:focus-visible`, `:focus-within` |
| `active` | `:active`, `:checked`, `[data-open]`/`aria-expanded` toggles (menus, accordions) |
| `scroll-linked` | progress bound to scroll: rAF scroll handler, `animation-timeline: scroll()`, sticky quantisation |
| `click` | explicit click handler starts a one-shot (success stamps, ripples) |
| `media` | media/player state (playing, buffering) |
| `none` | element never visibly animates (dead animation — see `status`) |

## `technique` — the rendering mechanism

| Value | Detection signature |
|---|---|
| `css-keyframes` | `animation-name` ≠ none on element |
| `css-transition` | `transition-*` with duration > 0, driven by class/state |
| `smil` | `<animate>/<animateTransform>/<animateMotion>/<set>` |
| `waapi` | `element.animate()` / `el.getAnimations()` returns non-CSS animations |
| `rAF-loop` | requestAnimationFrame writes style/attributes per frame |
| `lottie` | `lottie`, `dotlottie`, `<lottie-player>`, `bodymovin` |
| `rive` | `rive` runtime / `.riv` assets / `<canvas>` + rive |
| `gsap` | `gsap`/`Timeline`/`ScrollTrigger` globals, `gsap-` markers |
| `anime-js` | `anime` global / `animejs` script |
| `css-scroll-timeline` | `animation-timeline: scroll()/view()` |
| `svg-sprite-loop` | sprite swapping / `steps()` timing |
| `video-gif` | motion baked into raster media (record, don't extract) |

## `property` — what actually changes (may be multi-valued)

`transform-translate`, `transform-scale`, `transform-rotate`,
`transform-skew`, `opacity`, `stroke-dashoffset`, `stroke-dasharray`,
`stroke` (colour), `fill-opacity`, `fill`, `path-d` (morph),
`clip-path`/`mask`, `filter` (blur/saturate), `custom-property`
(`@property` interpolation), `color`/`background`, `visibility`
(technique detail, never listed alone).

Budget flags derived from `property` (M.7):

- `compositor-safe`: transform + opacity only.
- `stroke-cheap`: + `stroke-dash*`, `fill-opacity` — SVG-legal, cheap.
- `layout-risk`: `filter`, `clip-path` animation, or any layout property
  (`width/height/top/left/margin`) → flagged defect under M.7.

## `purpose` — M-type + job (record both)

M types (from M.md): `conversational`, `functional`, `structural`,
`emotional`. Job detail vocabulary:

`entrance`, `exit`, `state-change`, `feedback`, `loading`, `progress`,
`attention` (idle nudge), `explanation` (diagram story), `navigation`
(menus/accordions), `ambient` (decorative loop — only licensed under
`emotional`/idle budget), `scroll-progress`, `word-cycle`.

## `timing_class` — maps to M.2 duration tokens

| Value | Range | Notes |
|---|---|---|
| `micro` | 100–300 ms | hovers, small moves |
| `standard` | 300–400 ms | modals, expands |
| `structural` | 500–700 ms | containers, staggered drawers |
| `slow` | 0.7–1.6 s | reveals, milestone ≤1.5 s |
| `loop-short` | 1.5–10 s | icon loops, cyclers |
| `loop-ambient` | >10 s | backdrop loops (tamdoma: 14–360 s) |

## `easing_family`

`linear` (banned on spatial moves — flag), `ease-out` (entry),
`ease-in` (exit), `ease-both` (on-screen travel),
`overshoot`/`elastic`/`bounce` (playful/milestone only), `steps`,
`custom:<cubic-bezier>`.

## `loop_type`

`none` | `infinite` | `n-times` | `palindrome`
(`direction:alternate`) | `phased` (same keyframes, per-element
`--k`/negative-delay offsets — tamdoma's idiom) | `handoff` (elements
share one period, disjoint opacity windows — word cyclers).

## `complexity`

| Value | Criterion |
|---|---|
| `atomic` | 1 element, 1 property |
| `composite` | ≤4 elements or ≤2 properties |
| `choreographed` | >4 elements or keyed percentage windows (multi-act loop) |
| `system` | spans multiple components or drives a timeline (`.split` rig, `--pass` machine) |

## `js_dependency`

`none` (pure CSS/SMIL) | `light` (one small script — IO toggle, scroll
progress; ≤ ~2 KB) | `library` (GSAP/anime/lottie/rive/…).

## `status`

`live` | `paused` (`animation-play-state`) | `dead` (animation-name set
but `@keyframes` never defined — e.g. tamdoma `drift`).

## `personality` — mapping to M.1 personalities

Derive from the **site's** dominant timing/easing/displacement, per
animation record `personality_fit`:

| Personality | Signature |
|---|---|
| `subtle` | micro only, <4px offsets, opacity-led |
| `elegant` | slow ease-out reveals, no scale distortion |
| `professional` | axis growth (scaleX/Y, draws), no overshoot |
| `playful` | overshoot/elastic, scale pop |
| `none` | static |

tamdoma.ai reads **professional**: axis-growth and line-draw dominant,
`--ease-soft`/`--ease-out` only, no overshoot anywhere; ambient loops are
long-period (≥14 s) and low-contrast.

## Site-level rollup (`motion-tier` genome gene)

Map the site's animation density onto `genome.json` `motion-tier`:

| Tier | Heuristic |
|---|---|
| `static` | no animations, or reduced-motion-only |
| `subtle` | transitions/reveals only; ≤1 loop per page |
| `expressive` | looping iconography, staggered reveals, word cyclers — tamdoma sits here |
| `cinematic` | scroll-jacking, full-scene choreography, canvas/video motion |
