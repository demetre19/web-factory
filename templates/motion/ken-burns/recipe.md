---
id: recipe-ken-burns
type: motion-recipe
taxonomy:
  trigger: load
  technique: css-keyframes
  property: [transform-scale]
  budget: compositor-safe
  m_type: emotional
  purpose: [ambient, entrance]
  timing_class: slow
  easing_family: ease-out
  loop_type: none
  complexity: atomic
  js_dependency: none
  personality_fit: [elegant, subtle]
source: flaco.lexdemos.com — Stage.astro project backdrops
  (scale 1.08→1, ~9 s power1-2.out on activation)
---

# ken-burns — slow settle zoom on imagery

The Stage theatre's backdrop move: the active image starts ~8% oversized
and relaxes to `scale(1)` over ~9 s on a power ease-out — a one-shot
zoom-OUT that reads as breathing room, not a gallery effect.
`transform` only, compositor-safe, zero JS.

## Parameters

| Token | Default | Notes |
|---|---|---|
| scale | 1.08 → 1 | source also uses 1.2 for drama; stay ≤1.1 for calm |
| duration | ~9 s (`--kb-dur`) | slow enough to be ambient, not an entrance |
| origin | off-centre (`60% 40%`) | off-centre origin = the "wandering eye" feel |
| overscan | `inset:-8%` on the layer | edges never show during the settle |

## When to use

Hero/backdrop imagery on activation or page change (Stage re-fires it
per project). Pairs with `count-up`'s settle: same "relax into frame"
grammar.

## Rules

- zoom-OUT only — zoom-in reads as a stock-photo widget
- one-shot `animation-fill-mode:both`, never a loop — a looping
  breathing-scale is a different pattern (and reads as seasick)
- `transform-origin` off-centre; centre-origin zoom-out reads as a
  shrink, not a pan
- reduced-motion: `animation:none` + `transform:none` — the image sits
  at natural scale (this is why the overscan `inset:-8%` matters)
