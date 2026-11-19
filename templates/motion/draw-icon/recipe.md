---
id: recipe-draw-icon
type: motion-recipe
taxonomy:
  trigger: in-view
  technique: css-transition
  property: [stroke-dashoffset, opacity]
  budget: stroke-cheap
  m_type: structural
  purpose: [entrance, explanation]
  timing_class: slow
  easing_family: ease-out
  loop_type: none
  complexity: composite
  js_dependency: light
  personality_fit: [professional, elegant]
source: tamdoma.ai — .bd .draw / .bd.in pattern + st-draw idiom
---

# draw-icon — SVG line-draw entrance

Strokes "draw themselves" once when the element scrolls into view, then
stay drawn. The canonical trick: `pathLength="1"` on every drawable
shape so `stroke-dasharray:1` / `stroke-dashoffset` are unitless and
need no path measurement.

## Parameters

| Token | Default | Notes |
|---|---|---|
| `--ease-out` | `cubic-bezier(.19,1,.22,1)` | M.2 entering curve |
| draw duration | 0.8 s per path | keep each path ≤1.5 s |
| `--o` stagger | 0.15 s per path | parent-child offset ≈ M.4 100 ms |
| fill fade | 0.3 s after draws | decoupled opacity (M.4) |

## When to use

Diagram entrances, "how it works" steps, divider lines, signature
moments. One-shot only — looping draws belong in `draw-icon-loop`.

## Rules

- transition on `stroke-dashoffset`, never a loop (`loop_type:none`)
- fallback: reduced-motion = paths pre-drawn, no transition
- style via `.di :is(path,circle,line,rect,ellipse,polyline)` — a
  `path`-only selector leaves `fill:#000` on circles (the ring renders
  as a solid disc, MOT-05)
- IO unobserve after fire — it is an entrance, not a retrigger
