---
id: recipe-draw-icon-loop
type: motion-recipe
taxonomy:
  trigger: loop
  technique: css-keyframes
  property: [stroke-dashoffset, stroke, opacity]
  budget: stroke-cheap
  m_type: emotional
  purpose: [explanation, ambient]
  timing_class: loop-short
  easing_family: ease-out
  loop_type: phased
  complexity: composite
  js_dependency: none
  personality_fit: [professional, elegant]
source: tamdoma.ai — .st step icons (st-house/st-draw, --pass timeline)
---

# draw-icon-loop — looping line-draw cycle

A drawn figure writes itself in, holds, then erases — an infinite loop
sharing one `--pass` timeline across all elements. Elements stagger via
`--o` inside `animation-delay`, the "phased" loop idiom.

## Parameters

| Token | Default | Notes |
|---|---|---|
| `--pass` | 6 s | loop period; share across a set of icons |
| act window | 8–44% | draw in + hold |
| reset window | 56–100% | erase + rest |
| `--o` | 0.16 s stagger | per-element offset |

## When to use

Multi-step "how it works" icons, process loops. Keep ≥4 s per pass and
max one such icon per viewport if other motion exists (M.4).

## Rules

- `stroke-dashoffset` animation is SVG-cheap but **not** a transition —
  this is a licensed loop, use `emotional`/`explanation` purpose only
- reduced-motion: `animation:none` + `stroke-dashoffset:0` (pre-drawn)
