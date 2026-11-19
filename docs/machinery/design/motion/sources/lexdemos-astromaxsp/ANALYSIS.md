# astromaxsp.lexdemos.com — Lexington Astro theme motion audit

Captured 2026-11-19 (static fetches; a JS kernel was unavailable so the
built bundles — which contain the whole story — were analysed
statically. Counts below are exact, from the files in this directory.)
**Policy note (operator, 2026-11-19):** this audit stays analysis-only —
the GSAP/Lenis patterns were ported as native equivalents
(`rise-words`, `scroll-scrub`; `js_dependency` none/light). GSAP is the
only licensed animation library and only with a DESIGN-PLAN licence +
impossibility justification; Lenis/wheel-inertia is NOT a sanctioned
exception (scroll smoothing = `scroll-behavior`/rAF, or justify GSAP).

| Artifact | Size | What it carries |
|---|---|---|
| `page.html` | 30.8 KB | full homepage markup, pre-split `.rise-word` spans |
| `Rise.DgCFXQTh.css` | 48 KB | Tailwind utilities + the Rise component + `@view-transition` |
| `BaseLayout.js` | 897 B | the site's whole animation wiring (GSAP + ScrollTrigger) |
| `SmoothScroll.js` | 18.9 KB | vendored Lenis 1.3.27 + init |
| `Studio.js` | 447 B | one horizontal-scroll marquee |

## Stack

Astro + Tailwind (`--tw-*`, `text-mega`, `tracking-mega` utilities),
**GSAP + ScrollTrigger** and **Lenis** — all vendored into `_astro/`
bundles. `@view-transition{navigation:auto}` is declared, with
`.5s cubic-bezier(.4,0,.2,1)` on the root old/new pseudo-elements —
the site uses real cross-page view transitions, not an MPA reload feel.
Every custom motion attribute is `data-*`; every script scopes on
`gsap.matchMedia('(prefers-reduced-motion: no-preference)')` — reduced
motion gets zero animation by construction, not by override.

## The motion vocabulary (6 primitives)

### 1. `Rise` — per-word masked rise (the component)

Pre-split at **build time**: the h1 ships
`<span class="rise-word"><span style="--i:N">word</span></span>` — no
split library, no JS for the split. CSS only:

- `.rise-word` — `display:inline-block; overflow:clip;
  overflow-clip-margin:.2em` (descender bleed room)
- `.rise-word > span` — `animation: .9s cubic-bezier(.2,.8,.2,1) both
  rise; animation-delay: calc(var(--i) * 40ms + .1s)`
- `@keyframes rise` — `0%{transform:translateY(130%)}` only; `both`
  fill holds the pre-state until the delay elapses
- `[data-rise-scroll]:not(.is-in) .rise-word > span` — `animation-play-state:paused` — scroll-triggered words sit masked until released (no flicker, no double-render)

`BaseLayout.js`: ScrollTrigger per `[data-rise-scroll]`,
`start:"top 85%"`, `once:true`, `onEnter → classList.add("is-in")` —
adding `.is-in` simply unpauses the already-set CSS animation.

**Ports as:** `rise-words` recipe — the CSS is self-contained; only the
is-in trigger needs JS (IntersectionObserver, once). `animation-delay`
per `--i` replaces any stagger API.

### 2. `data-ink` — scroll-scrubbed word reveal

Body text split at **runtime** (`textContent.split(/\s+/)` → per-word
spans), then GSAP `fromTo opacity .15→1, stagger:.1` scrubbed
`top 85% → bottom 55%`. Text "inks in" as you read — the site's
signature editorial move.

**Ports as:** part of `scroll-scrub` recipe (word-opacity scrub).

### 3. `data-lift` — parallax lift

`gsap.from(el, {yPercent: data-lift || 40, scrub})` on the parent's
`top bottom → bottom bottom` window. One attribute = one float amount.

**Ports as:** part of `scroll-scrub` recipe (parallax arm).

### 4. `data-marquee` — scroll-driven horizontal track

`data-track` translated `+15vw → -(scrollWidth - 85vw)`, scrub `.6`,
`invalidateOnRefresh` — scroll position scrubs a horizontal gallery.

**Ports as:** `scroll-scrub` recipe (the `.6` smoothing is worth
keeping — it reads as inertia, not lag).

### 5. Lenis `SmoothScroll`

Vendored `lenis@1.3.27` (the full class is in the bundle). Init is 3
lines guarded by `matchMedia('(prefers-reduced-motion: reduce)')`:
`new Lenis({anchors:{offset:-80}})`, `lenis.on('scroll',
ScrollTrigger.update)`, `gsap.ticker.add(t => lenis.raf(t*1000))` +
`lagSmoothing(0)` — Lenis runs on GSAP's ticker, not its own rAF, and
ScrollTrigger sees every Lenis-scroll event. The markup carries
`data-lenis-prevent(-horizontal/-vertical/-wheel/-touch)` on the snap-x
work strip — inner scrollable regions are exempted per-attribute.

**Not a recipe** — a runtime, `js_dependency:library`. Documented for
completeness; our recipes must remain correct whether or not a scroller
is present (scroll-driven recipes measure real scroll, Lenis just
changes how it feels).

### 6. `data-active` showcase + `data-counter`/`data-fit`/`data-clock`

`data-active` flips a Tailwind transition set
(`translate-y-6 opacity-0 → data-active:translate-y-0 opacity-100`,
`duration-700`, `motion-reduce:transition-none` — Tailwind emits the
reduce override inline). 21 `data-active` nodes = the work showcase's
active-card pattern; `data-clock`/`data-counter`/`data-fit` are DOM
utilities (live clocks, count-ups, fit-text), outside motion scope.

## Classification notes (taxonomy)

| Record | technique | property | budget | easing | timing |
|---|---|---|---|---|---|
| rise-words | css-keyframes | transform-translate | compositor-safe | custom:cubic-bezier(.2,.8,.2,1) → ease-out | standard (.9s + stagger) |
| ink scrub | rAF-loop (gsap scrub) | opacity | compositor-safe | linear (scrub) | scroll-linked |
| lift | rAF-loop | transform-translate | compositor-safe | linear | scroll-linked |
| marquee | rAF-loop | transform-translate | compositor-safe | linear + .6 smoothing | scroll-linked |
| data-active | css-transition | opacity, transform-translate | compositor-safe | ease-out | structural (700ms) |
| view-transition | view-transition | (UA snapshots) | — | custom:.4s | standard |

JS total for the whole site animation layer: `BaseLayout.js` 897B +
`Studio.js` 447B = **1.3 KB** excluding the vendored Lenis/GSAP
runtimes. `Rise` needs 0 JS beyond an `.is-in` toggle.

## Deviations worth noting

- `--i` inline custom-property stagger is build-time — elegant for
  static content; a WordPress-style runtime version would need a split
  utility (they avoided one deliberately).
- `rise` has no `to` frame — relies on `both` + natural end state;
  safe only because the animation never loops.
- ScrollTrigger `once:true` + `play-state:paused` is a nicer gate than
  our IO `.in` pattern for pre-armed CSS — the same trick ports.
