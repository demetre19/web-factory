# lexdemos family — motion-component census (54 demos)

Aggregate audit across the Lexington Themes demo fleet, 2026-11-19.
Census source: `patterns/data/operator/_sources/lexington.json`
(`demo_components` + `demo_astro_assets` per demo). Per-demo deep dive:
`sources/lexdemos-astromaxsp/ANALYSIS.md`. Bundle captures in this dir.

## Census (from lexington.json)

| Component | Demos | What it is |
|---|---|---|
| SmoothScroll | 18 | vendored Lenis 1.3.27, same init everywhere |
| Motion.astro | 6 | GSAP+ScrollTrigger+Lenis mega-bundle (~133 KB) + `data-window` clip reveal |
| Marquee (CSS/attr) | 5 | scroll-driven or loop marquees |
| KeenSlider | 4–5 | vendored carousel runtime (testimonials, property cards) |
| Rise | 2 | build-time split masked word rise (astromaxsp, ottis) |
| Reveal.astro | 1 | settle-in + count-up (copperlane) |
| Parallax | 1 | data-lift-style scrub (astromaxsp) |
| Shader | 2–4 | raw WebGL fragment-shader ambient (kotei InkShader, navy GradientShader, gerstner+spaziobianco Shader) |
| Stage | 1 | WebGL-dissolve project theatre (flaco) |
| BaseLayout.js | all | shared wiring (~0.9 KB per site) |

Family signature: **attributes drive everything** — `data-*` marker +
one small script per component; GSAP/ScrollTrigger/Lenis vendored per
site; `gsap.matchMedia('(prefers-reduced-motion: no-preference)')` or a
plain `matchMedia` guard gates every animation.

## Components and their primitives

### Motion.astro (6 demos: brightlight, duckbutt, gerstner, jacobsen, profoliox, scarlet)

133 KB self-contained bundle (GSAP + ScrollTrigger + Lenis inlined).
Its one bespoke primitive:

- **`data-window` curtain reveal** — `[data-window]` parent (border-radius
  n) tracks scroll `0 → +=offsetHeight` while `data-window-view` child
  translates `y: +offsetHeight` and the parent's
  `clip-path: inset(0 0 0 0 round n) → inset(Hpx 0 0 0 round n)`.
  A "window" that sweeps away like a curtain as you scroll.
  min-width:1024px only.
  → recipe `window-clip` (clip-path = paint-bound; named wrapper
  timeline for transform, per the self-subject trap).

### Reveal.astro (copperlane)

590 B, two primitives:
- `data-settle` — load-time `autoAlpha 0→1, scale 1.04→1`, 1.6 s
  `power2.out` (a soft "settle" — zoom-out, not zoom-in)
- `data-count` — count-up on `top 92%` once, 1.4 s `power2.out`,
  `Intl.NumberFormat` formatting
  → recipe `count-up` ships both (settle is the `reveal-fade`
  partner-entrance: opacity+scale, no translate).

### KeenSlider (bastion testimonials, westend property cards; slider attr on 4–5)

Vendored `keen-slider` runtime (westend bundle 14.6 KB incl. runtime).
Init pattern: `new KeenSlider(el,{loop:true,slides:{origin:'center',
perView:1.5,spacing:8},breakpoints:{1024px:{perView:3.2}}})` +
prev/next buttons. The *pattern* — peeking centred slides, snap on
release — is fully native-able:
→ recipe `snap-carousel` (CSS `scroll-snap-type:x mandatory` + centred
peeks via `scroll-padding`; buttons `scrollBy`; progress dots synced on
`scroll` events — no library).

### Stage.astro (flaco)

Project theatre: SPA-ish hash navigation between `data-view`s, each
`data-project` gets a WebGL dissolve (custom `L.draw(progress, scaleR,
scaleN)`), a `data-progress` scaleX bar (7 s `ease:none` → auto-advance),
Ken Burns `scale 1.08→1 / 9 s` on the active project image, and
masked-line title swaps (`SplitText` lines yPercent ±140, stagger .1).
Primitives without the theatre:
→ `ken-burns` recipe (scale 1.08→1, ~9 s, per activation);
  progress-bar arm is inside `snap-carousel`; word-mask swap is the
  `rise-words` vocabulary applied to a text change (documented there).

### Shader family (kotei InkShader 5.6K, navy GradientShader 8.7K, gerstner/spaziobianco Shader ~4.8K)

Raw WebGL1 fragment shaders on a canvas — uniform-driven ambient
fields (ink diffusion, gradient flow). `IntersectionObserver` gates the
rAF loop to visibility (twice in some — in/out and a second observer);
`prefers-reduced-motion` gates startup. Not recipe material: needs a
canvas + shader context = `js_dependency:library`-adjacent weight
(~5 KB) for decorative-only output; documented as the family's ambient
ceiling. If a site needs an animated ambient field, prefer `blob-morph`
(paint-bound, zero JS) — shaders are the GSAP-justification-style case:
DESIGN-PLAN licence + written impossibility note.

### Already covered by recipes

SmoothScroll/Lenis (policy: not a recipe, `scroll-behavior` or justify
GSAP), Rise → `rise-words`, ink/lift/marquee scrubs → `scroll-scrub`,
simple marquees → `clip-conveyor`/`backdrop-loops` family.

## New recipes from this pass

`window-clip` · `count-up` · `ken-burns` · `snap-carousel`
(→ templates/motion/, all js:light or none; no library ports).
