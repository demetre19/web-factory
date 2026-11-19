---
id: recipe-slide-entrance
type: motion-recipe
taxonomy:
  trigger: in-view
  technique: css-keyframes
  property: [opacity, transform-translate, transform-scale]
  budget: compositor-safe
  m_type: structural
  purpose: [entrance]
  timing_class: structural
  easing_family: ease-out
  loop_type: none
  complexity: composite
  js_dependency: light
  personality_fit: [professional, subtle]
source: drvaesthetics.com + jcsignatureaesthetics.com — Bricks
  data-interactions (enterView → startAnimation → brx-animate-*,
  vendored animate.css keyframes)
---

# slide-entrance — enterView animation system

The WordPress/Bricks idiom: elements declare an entrance effect with a
marker attribute (`data-se`, `data-se="zoom|left|fade"`, `--d` for
stagger); one ~14-line IntersectionObserver adds `.in` once at 15%
visibility and a parameterized keyframe animation plays it. Both
med-spa WP sites run the same system — a vendored animate.css keyframe
set (`brx-animate-*`) fired by `enterView → startAnimation`.

## Parameters

| Token | Default | Notes |
|---|---|---|
| `data-se` | rise | `""`=rise, `zoom`, `left`, `fade` — extend the set |
| duration | 0.7 s | animate.css `animate__fast` zone; ≤1 s |
| `--d` | 0 s | per-element stagger (120 ms steps read as cascade) |
| threshold | 0.15 | fire when 15% visible |

## When to use

Section entrances on content-heavy sites — every card/heading animates
itself on scroll-in. This is the WP-native equivalent of `reveal-fade`
(one effect, transitions) — use this when the section needs multiple
effects or per-element stagger from markup, no JS changes.

## Rules

- `.in` once + `io.unobserve` — entrances never retrigger
- `forwards` fill so the final state sticks; initial `opacity:0` lives
  in `[data-se]` so pre-IO content is never half-visible
- reduced-motion: `[data-se]{opacity:1}` and skip observing — content
  renders statically (JS branch mirrors the CSS branch, never conflicts)
- keep the effect set small (4) — Bricks' animate.css dumps 70+
  effects and most read as theme-default noise
