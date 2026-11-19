---
id: recipe-progress-rig
type: motion-recipe
taxonomy:
  trigger: loop
  technique: css-keyframes
  property: [custom-property, transform-scale, opacity]
  budget: compositor-safe
  m_type: functional
  purpose: [progress, explanation]
  timing_class: loop-short
  easing_family: linear
  loop_type: infinite
  complexity: composite
  js_dependency: light
  personality_fit: [professional]
source: tamdoma.ai — .rig rig-p / track-fill / token (@property --p)
---

# progress-rig — @property-driven progress track

`@property --p` registers a custom property as `<number>` so it can be
keyframed. One `rig-p` animation interpolates `--p` 0→1; the fill reads
`scaleX(var(--p))` and the token reads `left:calc(var(--p)*100%)` — a
whole assembly driven by a single animated number.

## Parameters

| Token | Default | Notes |
|---|---|---|
| `--pass` | 6 s | loop period |
| fill window | 0–60% travel, 60–100% hold | token fades at 62% |
| fill fade | 90–100% | reset dissolve |

## When to use

Pipeline progress inside diagrams, "machine working" rigs, loading
metaphors with a visible cursor. For real progress, set `--p` from JS —
the CSS loop is the demo/idling state.

## Fallback

`@supports` cannot test at-rules — detect `@property` with
`if (!CSS.registerProperty)` (1 line) adding `.no-prop`, which swaps in
direct `transform`/`left` keyframes. `@property` needs Chrome 85+,
Safari 16.4+, FF 128+.

## Rules

- `left` on the token animates compositor-cheaply only via `calc(var(--p))`
  inside transform-free positioning — acceptable because the token is
  12px; the *bar* stays `scaleX`
- reduced-motion: full bar, no animation
