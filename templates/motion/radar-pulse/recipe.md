---
id: recipe-radar-pulse
type: motion-recipe
taxonomy:
  trigger: loop
  technique: css-keyframes
  property: [transform-scale, transform-translate, opacity]
  budget: compositor-safe
  m_type: emotional
  purpose: [attention, explanation]
  timing_class: loop-short
  easing_family: ease-out
  loop_type: phased
  complexity: composite
  js_dependency: none
  personality_fit: [professional, playful]
source: tamdoma.ai — .sico-marketing (wave rings + b1–b3 converging dots)
---

# radar-pulse — expanding rings + converging signals

Broadcast/sonar rings expand from a centre (`scale + fade`) while small
signal dots drift inward on staggered loops — the "reach / marketing /
emit-and-receive" pattern.

## Parameters

| Token | Default | Notes |
|---|---|---|
| wave period | 1.8 s | short tempo is fine for rings |
| `--k` | 0…2 | ring phase (`-period/n` via delay) |
| expansion | scale .4→1.6 (~2.6×) | keep opacity end at 0 |
| drift `--dx/--dy` | converge paths | per-signal targets |

## When to use

Emit/broadcast/reach concepts, live-status beacons, "signal found"
moments. Rings alone (drop `.sig`) = the standard status pulse.

## Rules

- rings must fade to 0 before reset or they pop
- ≤3 rings; more reads as noise (M.4 focal budget)
- reduced-motion: `animation:none`, keep the static core
