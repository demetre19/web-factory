---
id: recipe-pop-scan
type: motion-recipe
taxonomy:
  trigger: loop
  technique: css-keyframes
  property: [transform-scale, transform-translate]
  budget: compositor-safe
  m_type: emotional
  purpose: [explanation, attention]
  timing_class: loop-short
  easing_family: ease-out
  loop_type: infinite
  complexity: composite
  js_dependency: none
  personality_fit: [professional, elegant]
source: tamdoma.ai — .st scan icon (st-pop, st-lens)
---

# pop-scan — scale-pop marker + gliding lens

A cluster of faint dots; one pops to accent colour while a magnifier
glides in to inspect it. Pure transform animation; the essential trick is
`transform-box:fill-box; transform-origin:50% 50%` so scale centres on
the shape itself rather than the viewBox.

## Parameters

| Token | Default | Notes |
|---|---|---|
| `--pass` | 6 s | share with sibling icons |
| pop window | 14–44% | scale 0→1, hold |
| lens glide | 12–44% | translate (−18,−14) → 0 |

## When to use

"Search / find / inspect" steps, highlight-one-of-many states. Scale pop
is allowed outside `playful` because there is no overshoot — the curve
stays `ease-out` (professional).

## Rules

- never scale SVG without `transform-box:fill-box` + explicit origin
- reduced-motion: `animation:none`, static composed frame
