---
id: recipe-backdrop-loops
type: motion-recipe
taxonomy:
  trigger: loop
  technique: css-keyframes
  property: [transform-rotate, stroke-dashoffset]
  budget: stroke-cheap
  m_type: emotional
  purpose: [ambient]
  timing_class: loop-ambient
  easing_family: linear
  loop_type: infinite
  complexity: atomic
  js_dependency: none
  personality_fit: [elegant, professional]
source: tamdoma.ai — .bd backdrops (bd-turn 60–360s, bd-flow 24s, spin 180s)
---

# backdrop-loops — ambient rotate + dash-flow

Two licensed ambient-loop patterns for full-bleed background SVGs
(`preserveAspectRatio="xMidYMid slice"`, `aria-hidden`):

- **dial**: whole-group rotate around an explicit `transform-origin`
  (`transform-box:view-box` — fill-box would orbit the wrong centre).
  Counter-rotate a second group for depth (60 s / 240 s reverse).
- **dash-flow**: marching dashes along lanes — `stroke-dashoffset`
  animated to a multiple of `dasharray`'s period so the wrap is seamless.

## Parameters

| Token | Default | Notes |
|---|---|---|
| rotate period | ≥60 s | calm reads as premium; ≤10 s reads as machinery |
| dash period | 6+14=20 → offset −160 | offset = k×period |
| opacity | low contrast (`.4–.6`, muted strokes) | stays behind content |

## When to use

Section background texture on `money` pages. Ambient = `emotional`
purpose: licensed flourishes, never information.

## Rules

- one ambient backdrop per viewport (M.4 focal budget counts it)
- `linear` is correct here (constant drift), and it's why the period
  must be long
- reduced-motion: `animation:none` — backdrops freeze, never remove them
