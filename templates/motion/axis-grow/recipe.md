---
id: recipe-axis-grow
type: motion-recipe
taxonomy:
  trigger: loop
  technique: css-keyframes
  property: [transform-scale]
  budget: compositor-safe
  m_type: emotional
  purpose: [explanation, progress]
  timing_class: loop-short
  easing_family: ease-out
  loop_type: phased
  complexity: composite
  js_dependency: none
  personality_fit: [professional]
source: tamdoma.ai — .st bars icon (st-bar)
---

# axis-grow — staggered scaleX bars

Bars grow from a fixed edge along one axis — the `professional`
personality's signature (growth without overshoot). `--v` sets each
bar's target extent; `--o` staggers them.

## Parameters

| Token | Default | Notes |
|---|---|---|
| `--pass` | 6 s | loop period |
| `--v` | 1 | target scaleX per bar (data feel) |
| `--o` | 0.2 s stagger | per-bar offset |
| origin | left edge | `transform-origin:0 50%` + `fill-box` |

## When to use

Metric progress inside icons/diagrams, comparison bars, capacity
indicators. For real data, set `--v` from the value — the animation is
decorative emphasis, the bar length is information.

## Rules

- grow along ONE axis only (scaleX or scaleY); uniform scale reads
  `playful`
- reduced-motion: bars shown at final extent (`transform:none` per `--v`)
