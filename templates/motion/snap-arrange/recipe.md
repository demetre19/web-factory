---
id: recipe-snap-arrange
type: motion-recipe
taxonomy:
  trigger: loop
  technique: css-keyframes
  property: [transform-translate, transform-rotate]
  budget: compositor-safe
  m_type: emotional
  purpose: [explanation]
  timing_class: loop-short
  easing_family: ease-out
  loop_type: infinite
  complexity: composite
  js_dependency: none
  personality_fit: [professional, elegant]
source: tamdoma.ai — .sico-design (snap keyframes, --sx/--sy/--sr)
---

# snap-arrange — scatter-to-grid loop

Tiles carry a scattered pose in custom properties (`--sx --sy --sr`) and
one shared keyframe pulls them to identity (the grid), holds, and
scatters again — "order emerges from chaos", the design/layout metaphor.

## Parameters

| Token | Default | Notes |
|---|---|---|
| `--pass` | 8 s | loop period |
| hold window | 24–86% | arranged pose must dominate |
| `--o` | 0.25 s | per-tile cascade |
| scatter | ≤16px, ≤18° | beyond that reads as mess, not order |

## When to use

Design-system/layout/composition concepts. Also works as a one-shot
entrance: run the 0→24% slice once on in-view (retime, `forwards`).

## Rules

- `--ease-soft` (easeOutCubic) — ease-out reads as a settle, not a launch
- rotate ≤18° keeps it `professional`; bigger spins + overshoot = `playful`
- reduced-motion: tiles at grid pose
