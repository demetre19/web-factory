---
id: recipe-scroll-scrub
type: motion-recipe
taxonomy:
  trigger: scroll-linked
  technique: css-scroll-timeline
  property: [opacity, transform-translate]
  budget: compositor-safe
  m_type: structural
  purpose: [scroll-progress, attention]
  timing_class: structural
  easing_family: linear
  loop_type: none
  complexity: system
  js_dependency: light
  personality_fit: [professional, elegant]
source: astromaxsp.lexdemos.com — BaseLayout.js [data-ink]/[data-lift] +
  Studio.js [data-marquee] (GSAP ScrollTrigger scrubs; ported to CSS
  scroll-timeline + rAF fallback)
---

# scroll-scrub — ink words + parallax + horizontal track

Lexington's three-arm scrub vocabulary, one `data-*` attribute each —
scroll position is the timeline:

- **`data-ink`**: body text splits to per-word spans; each fades
  `.15 → 1` as it traverses the viewport (the site's editorial signature)
- **`data-lift`**: `translateY(N%→0)` parallax inside an
  `overflow:clip` frame — `--lift`/`data-lift` sets the amount
- **`data-marquee`**: a `data-track` slides `+15vw → -(scrollWidth−85vw)`
  across the section's traversal — a scroll-driven work strip

## Parameters

| Token | Default | Notes |
|---|---|---|
| ink window | entry 15% → cover 35% (`view()`) | per-word scrub; JS path staggers 85%→50% viewport |
| lift amount | `data-lift` (%) | oversize the panel (`height:130%`) so edges never gap |
| marquee range | +15vw → `85vw − track.scrollWidth` | `--sw` set once + on resize |

## Progressive technique

`CSS.supports('animation-timeline','view()')` → `html.native-tl` hands
all three arms to CSS scroll-timeline (zero per-frame JS). Otherwise a
~25-line rAF loop writes `opacity`/`transform` directly — the same
numbers the source's GSAP `scrub` tweens produce. Either way the
fallback is `js_dependency: light` (the JS does split + `--sw` + the
driver only when needed).

## The Chromium `view()` self-subject trap

`animation-timeline:view()` on an element whose own animation moves it
(`transform`) freezes in Chromium — the timeline keeps measuring the
transformed rect → circular → stuck at load-time progress. Verified:
opacity on self-subject tracks fine; transform does not. **Pattern:**
`view-timeline-name:--x` on the static wrapper, `animation-timeline:--x`
on the animated child. Words animating `opacity` keep self `view()`.

## When to use

Editorial reads (`data-ink`), image reveals (`data-lift`), horizontal
galleries (`data-marquee`) — all three compose on one page; Lexington
runs them together.

## Rules

- `ease:none`/linear everywhere — scrub easing lives in the window
  bounds, not the curve
- measure real scroll — correct under Lenis/SmoothScroll hosts (the
  source runs Lenis; scrubs don't care how scroll moves)
- ink: `.15` floor, not `0` — text stays present under fast-scroll and
  short windows
- reduced-motion: end-state CSS (`opacity:1`, no transforms) and skip
  the driver entirely
- M.4: scrubs are `scroll-progress`/`attention`, not loops — they don't
  spend the focal-animation budget
