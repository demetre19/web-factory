---
id: recipe-window-clip
type: motion-recipe
taxonomy:
  trigger: scroll-linked
  technique: css-scroll-timeline
  property: [clip-path, transform-translate]
  budget: paint-bound
  m_type: structural
  purpose: [entrance, scroll-progress]
  timing_class: structural
  easing_family: linear
  loop_type: none
  complexity: composite
  js_dependency: light
  personality_fit: [professional, elegant]
source: lexdemos Motion.astro — [data-window] curtain (brightlight,
  duckbutt, gerstner, jacobsen, profoliox, scarlet demos)
---

# window-clip — scroll curtain reveal

A rounded frame clips its own content top-down (`clip-path:
inset(0 round 24px) → inset(70vh 0 0 0 round 24px)`) while the inner
view translates the same distance — the panel rises out through a
"window" as the section traverses the viewport. Lexington's
Motion-bundle signature; desktop-only there (`min-width:1024px`).

## Parameters

| Token | Default | Notes |
|---|---|---|
| frame | `border-radius:24px`, `overflow:hidden` | radius must match the `round` arg |
| reveal range | element traversal (`view()` on the WRAPPER) | fallback measures `top+bottom` window |
| view offset | `translateY` = clip inset | identical value, opposite directions |

## Progressive technique

`view-timeline-name:--win` on the static `[data-window]` frame —
self-subject `view()` would freeze (the transform-feedback trap, see
scroll-scrub/recipe.md) — consumed by both the frame's clip animation
and the view's translate. rAF fallback writes both values from one
section progress per frame.

## When to use

One hero panel reveal per site — Lexington gates it to ≥1024px.
`paint-bound`: clip-path repaints the frame each frame; legal because
it's a single full-bleed moment, never a list of them.

## Rules

- the `round` keyword must mirror `border-radius` — mismatch shows
  square corners mid-sweep
- same numeric inset + translate or the curtain detaches from the view
- `js_dependency:light` covers only the support check + fallback
- reduced-motion: no clip, no translate — the panel is simply visible
