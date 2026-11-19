---
id: recipe-menu-cascade
type: motion-recipe
taxonomy:
  trigger: active
  technique: css-keyframes
  property: [opacity, transform-translate, transform-rotate]
  budget: compositor-safe
  m_type: functional
  purpose: [navigation, state-change]
  timing_class: standard
  easing_family: ease-out
  loop_type: none
  complexity: composite
  js_dependency: none
  personality_fit: [professional, subtle]
source: tamdoma.ai — .sys-nav [data-open] (sys-in stagger --i*60ms+60ms)
---

# menu-cascade — staggered item entrance on open

Dropdown items cascade in on a `--i`-indexed keyframe
(`fade + translateX(-10px)`, `--i*60ms + 60ms`), while the panel itself
runs an opacity/transform transition and the chevron rotates 180°.
`visibility` delayed-transition closes the hit-area gap when closed.

## Parameters

| Token | Default | Notes |
|---|---|---|
| item stagger | 60ms+60ms base | tamdoma `--i*60ms+60ms` |
| panel | .25s fade / .35s rise | exits collapse faster (M.2) |
| chevron | 180° rotate .3s | `--ease-out` |

## When to use

Nav dropdowns, menus, accordions-lite. Items animate only while the
panel is open (`[data-open]` gate) — closed state carries no animation
cost.

## Rules

- `visibility 0s linear .35s` pattern: hidden elements must not be
  focusable/clickable
- `aria-expanded` mirrors `data-open` (the demo button does both)
- JS only for the toggle itself — all motion is CSS
- reduced-motion: instant open, no cascade
