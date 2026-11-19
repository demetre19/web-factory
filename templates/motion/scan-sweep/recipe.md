---
id: recipe-scan-sweep
type: motion-recipe
taxonomy:
  trigger: loop
  technique: css-keyframes
  property: [transform-translate, opacity]
  budget: compositor-safe
  m_type: emotional
  purpose: [explanation, attention]
  timing_class: loop-short
  easing_family: ease-out
  loop_type: infinite
  complexity: choreographed
  js_dependency: none
  personality_fit: [professional, elegant]
source: tamdoma.ai — .sico-strategy (scan + pick)
---

# scan-sweep — travelling scanner + pick flash

A scanner element follows a multi-stop translate path while a target
marker flashes inside a disjoint opacity window — the "scan then select"
story for strategy/analysis concepts.

## Parameters

| Token | Default | Notes |
|---|---|---|
| `--pass` | 9 s | slower tempo suits inspection metaphors |
| scan path | stops at 6–90% | grouped keyframes = waypoint travel |
| pick window | 60–90% | flash after the sweep arrives |

## When to use

"Analyse → choose" steps, audit/scan concepts, anything where attention
should travel across a static figure and land somewhere.

## Rules

- `ease-both` (`--ease-soft`) for on-screen travel per M.2 — the element
  is already in the viewport
- keep pick flash ≥30% of the pass so it registers
- reduced-motion: static frame
