---
id: recipe-snap-carousel
type: motion-recipe
taxonomy:
  trigger: active
  technique: css-transition
  property: [transform-scale, opacity]
  budget: compositor-safe
  m_type: functional
  purpose: [navigation, state-change]
  timing_class: standard
  easing_family: ease-out
  loop_type: none
  complexity: composite
  js_dependency: light
  personality_fit: [professional]
source: bastion.lexdemos.com KeenSliderTestimonials +
  westend.lexdemos.com PropertyCarouselCardKeenSlider — KeenSlider
  pattern ported to native scroll-snap
---

# snap-carousel — CSS scroll-snap carousel (KeenSlider without KeenSlider)

The Lexington slider pattern — centred slides peeking at the edges,
snap on release, prev/next + dots + a progress bar — built entirely on
`overflow-x:auto` + `scroll-snap-type:x mandatory`. The library version
weighs ~15 KB vendored; this is zero runtime + ~30 lines for the
controls (all optional — the rail scrolls natively with none).

## Parameters

| Token | Default | Notes |
|---|---|---|
| slide | `flex:0 0 280px`, `scroll-snap-align:center` | peek width = `scroll-padding-inline:calc(50% - slide/2)` |
| active slide | `.is-active` opacity/scale | dimmed siblings via `scroll`-event sync (or `:has()`/view-timeline) |
| progress bar | `scaleX(i/(n-1))` | Stage's `data-progress` pattern, .25s ease |
| auto-advance | 7 s interval, paused on hover/hidden | reduce: no interval, no bar |

## When to use

Testimonials, project cards, logo strips — anywhere the family used
KeenSlider. The `scroll-snap` feel on trackpads/iOS is identical to the
library because it IS the same scroll physics.
## Rules

- never hide `overflow` without snap — unbounded carousels strand slides
- buttons use computed `scrollTo` (snap centre =
  `offsetLeft - (clientWidth - offsetWidth)/2`), not transforms — native
  scroll keeps momentum + accessibility (arrow keys work free). NOTE:
  `scrollIntoView({inline:'center'})` silently no-ops under
  `x mandatory` snap in Chromium — always `scrollTo`
- active-slide emphasis ≤ `.55` opacity dim + `.97` scale — the rail
  stays legible
- auto-advance pauses on `:hover` and `document.hidden`, and is
  omitted under reduce (no surprise motion)
- touch users get it free — `scroll-snap-type` IS the touch carousel
