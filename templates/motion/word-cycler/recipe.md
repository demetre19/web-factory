---
id: recipe-word-cycler
type: motion-recipe
taxonomy:
  trigger: loop
  technique: css-keyframes
  property: [opacity, transform-translate]
  budget: compositor-safe
  m_type: emotional
  purpose: [word-cycle, explanation]
  timing_class: loop-short
  easing_family: ease-both
  loop_type: handoff
  complexity: composite
  js_dependency: none
  personality_fit: [professional, elegant]
source: tamdoma.ai — .io-t io-need / io-result cycler
---

# word-cycler — handoff phrase rotation

N phrases share one grid cell and one `n × --pass` timeline. Each phrase
owns a disjoint window: rise in (+10px), hold, exit (−10px). Delay
`--pass × --k` rotates the baton — the "handoff" loop type, zero JS.

## Parameters

| Token | Default | Notes |
|---|---|---|
| `--pass` | 4 s | per-phrase visible time |
| n phrases | 5 | keyframe windows = `1/n` slices |
| travel | ±10px | enter up, exit up (continuous drift) |

## Keyframe math

For n phrases each slice is `100/n`% of the timeline. Within a slice:
~10% rise-in, hold to ~93% of the slice, ~10% drift-out. The demo's
`2%,18.6% / 19.6%` = a 20% slice (n=5).

## When to use

Rotating qualifiers in a headline ("we build ___"), input→output
contrasts (two cyclers in parallel, second at half-opacity until active —
tamdoma's `io-need`/`io-result`).

## Rules

- M.3 bans animating body text — a headline cycler is display type,
  keep it to one per page
- reduced-motion: first phrase static, rest hidden (no rotation)
