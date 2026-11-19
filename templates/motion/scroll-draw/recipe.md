---
id: recipe-scroll-draw
type: motion-recipe
taxonomy:
  trigger: scroll-linked
  technique: rAF-loop
  property: [stroke-dashoffset, opacity, transform-translate]
  budget: stroke-cheap
  m_type: structural
  purpose: [scroll-progress, explanation]
  timing_class: standard
  easing_family: ease-soft
  loop_type: none
  complexity: system
  js_dependency: light
  personality_fit: [professional, elegant]
source: tamdoma.ai — .split divider (#divider-path) + .pair quantisation
---

# scroll-draw — scroll-linked line + quantised steps

A tall track wraps a sticky stage. One rAF-throttled scroll handler:
(a) writes `stroke-dashoffset` on a `pathLength`-normalised line so it
draws down with scroll progress; (b) quantises progress to a step index
and toggles `is-active / is-prev / is-next` — all step motion stays in
CSS transitions (`opacity` + `translateY(±36px)`).

## Parameters

| Token | Default | Notes |
|---|---|---|
| track height | `n × 55vh + 100vh` | scroll length per step |
| step fade | 0.55 s `--ease-soft` | `visibility` delay prevents hit-tests |
| cell shift | ±36px | prev up, next down — direction tells travel |
| rail | `stroke-dasharray:1000`, viewBox `0 0 2 1000` | unit math |

## When to use

Paired before/after comparisons, "old way vs our way" arguments,
scroll-told sequences. Money pages only (M.5 parallax license spirit —
scroll-binding is banned on utility surfaces).

## Rules

- **no scroll-jacking** — scroll position drives progress; never snap
  or steal the wheel
- `visibility` transition delayed by the fade so hidden steps can't be
  tabbed to
- reduced-motion: kill sticky + rail entirely, render steps statically
- on narrow viewports, flatten to a stacked list (tamdoma: ≤840px)
