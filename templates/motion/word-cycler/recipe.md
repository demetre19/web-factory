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
  easing_family: ease-out
  loop_type: handoff
  complexity: composite
  js_dependency: none
  personality_fit: [professional, elegant]
source: tamdoma.ai — .io-t io-need / io-result cycler
---

# word-cycler — handoff phrase rotation

N phrases share one grid cell and one `n × --pass` timeline. Each phrase
owns a window that overlaps the next by the exit/entry ramps (crossfade —
no dead-frame gap). Delay `--pass × --k` rotates the baton — the
"handoff" loop type, zero JS.

## Parameters

| Token | Default | Notes |
|---|---|---|
| `--pass` | 4 s | per-phrase visible time |
| n phrases | 5 | keyframe windows = `1/n` slices |
| travel | ±10px | enter up, exit up (continuous drift) |

## Keyframe math

For n phrases each slice is `100/n`% of the timeline. Within a slice:
~10% rise-in, hold to ~93% of the slice, drift-out extending ~3% past
the slice edge so it overlaps the next entry (crossfade — tamdoma and
this recipe's earlier `19.6%` cut left a ~0.7 s blank every pass,
MOT-16). The demo's `2%,18.6% / 20.6%` = a 20% slice (n=5).

## When to use

Rotating qualifiers in a headline ("we build ___"), input→output
contrasts (two cyclers in parallel, second at half-opacity until active —
tamdoma's `io-need`/`io-result`).

## Rules

- M.3 bans animating body text — a headline cycler is display type,
  keep it to one per page
- reduced-motion: unroll to a static list — every phrase stays visible
  and in the accessibility tree (hiding 4/5 phrases with display:none
  also removes them from assistive tech)
