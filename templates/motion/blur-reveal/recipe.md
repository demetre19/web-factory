---
id: recipe-blur-reveal
type: motion-recipe
taxonomy:
  trigger: in-view
  technique: css-transition
  property: [filter, transform-scale, opacity]
  budget: paint-bound
  m_type: emotional
  purpose: [entrance]
  timing_class: slow
  easing_family: ease-out
  loop_type: none
  complexity: atomic
  js_dependency: light
  personality_fit: [elegant]
source: tamdoma.ai — .focus-reveal.in img
budget_note: animates filter:blur — paint-bound, outside the M.7
  compositor-safe budget. Keep for ONE emotional moment per page,
  or swap for opacity+scale only.
---

# blur-reveal — photo "focus" reveal

A photograph starts desaturated + blurred + slightly zoomed
(`saturate(.3) blur(14px) contrast(1)` + `scale(1.08)`) and pulls into
focus on in-view — the founder/people "we're real humans" moment.
1.6 s `--ease-out`.

## Parameters

| Token | Default | Notes |
|---|---|---|
| duration | 1.6 s | longest allowed entrance |
| blur | 14px → 0 | paint-cost property — flagged |
| zoom | scale(1.08) → 1 | pairs with blur to hide edge bleed |

## Budget warning

`filter` animation is `paint-bound` under the taxonomy budget (M.7
repaint-cost — legal on ambient/singular elements only). Tamdoma ships
it once, on the founder photo. Policy:

- allowed: exactly one `emotional` photo moment per page
- not allowed: cards, grids, repeated imagery
- cheaper variant (drop the flag): opacity + scale(1.08→1) only

## Rules

- wrap the trigger in the same IO as `reveal-fade` (`.in` class)
- reduced-motion: no filter/transition — image renders final state
- never combine with other loops in the same viewport (M.4)
