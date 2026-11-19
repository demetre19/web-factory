---
id: recipe-module-stack
type: motion-recipe
taxonomy:
  trigger: loop
  technique: css-keyframes
  property: [opacity, transform-translate]
  budget: compositor-safe
  m_type: emotional
  purpose: [explanation]
  timing_class: loop-short
  easing_family: ease-out
  loop_type: phased
  complexity: composite
  js_dependency: none
  personality_fit: [professional]
source: tamdoma.ai — .sico-development (stack keyframes, --k*.5s)
---

# module-stack — staggered drop-in assembly

UI modules drop into a frame one by one and hold, then clear — the
build/development metaphor. `--k × 0.5s` phased delays on one timeline;
`backwards` fill-mode hides each module before its turn.

## Parameters

| Token | Default | Notes |
|---|---|---|
| `--pass` | 8 s | loop period |
| `--k` | 0…n | order index; delay `--k*0.5s` |
| drop | 10px from above | small, professional |
| hold | 10–80% | assembled state dominates |

## When to use

Component assembly, "we build it" steps, modular-system concepts.

## Rules

- `animation-fill-mode:backwards` is required or pre-delay modules flash
- exits fade, don't slide out (exits faster + cheaper, M.2)
- reduced-motion: assembled frame
