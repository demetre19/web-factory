---
id: recipe-line-mask-entrance
type: motion-recipe
taxonomy:
  trigger: load
  technique: css-transition
  property: [transform-translate]
  budget: compositor-safe
  m_type: emotional
  purpose: [entrance]
  timing_class: slow
  easing_family: ease-out
  loop_type: none
  complexity: composite
  js_dependency: light
  personality_fit: [elegant, professional]
source: tamdoma.ai — #h1 .line-mask / .lines-in
---

# line-mask-entrance — masked headline rise

Each headline line wraps in an `overflow:hidden` mask; inner spans start
at `translateY(115%)` and slide up into the slot. `--d` staggers lines —
the hero's one licensed flourish (emotional type).

## Parameters

| Token | Default | Notes |
|---|---|---|
| duration | 1.1 s `--ease-out` | M.2 slow band |
| per-line `--d` | 120 ms | M.4 parent-child offset |
| rise | 115% of line box | always mask-overflowing |

## When to use

Hero display headings on `money` pages only — one per page, display
type ≥1.5rem equivalent. Body text is M.3-banned from motion.

## Rules

- add `.lines-in` inside `requestAnimationFrame`, not inline at
  DOMContentLoaded — the transition needs a painted first frame
- `padding-bottom:.08em / margin-bottom:-.08em` compensates descender
  clipping in the mask
- reduced-motion: spans pre-translated to `none` — headline just renders
