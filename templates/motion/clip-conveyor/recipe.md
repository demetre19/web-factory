---
id: recipe-clip-conveyor
type: motion-recipe
taxonomy:
  trigger: loop
  technique: css-keyframes
  property: [transform-translate, stroke-dashoffset]
  budget: stroke-cheap
  m_type: emotional
  purpose: [explanation, ambient]
  timing_class: loop-short
  easing_family: linear
  loop_type: phased
  complexity: composite
  js_dependency: none
  personality_fit: [professional]
source: tamdoma.ai — .sico-automation (belt + blip, clipPath windows, --k negative delays)
---

# clip-conveyor — windowed translate loop + dash ticker

Copies of an item stream through a `<clipPath>` window on a fixed
translate; `animation-delay:calc(var(--k)*-T/n)` phases them so the
stream never gaps. A dashed "signal" path ticks alongside via
`stroke-dashoffset` marching — the SVG equivalent of animated ants.

## Parameters

| Token | Default | Notes |
|---|---|---|
| period | 7.5 s | full traverse through the window |
| `--k` | 0…n-1 | phase index; delay `=-period/n` |
| dash tick | 2.5 s, dasharray 24 | independent faster tempo |

## When to use

Pipelines, throughput, automation/queue concepts. The `linear` easing is
legitimate here: constant conveyor speed is the metaphor (M.2 bans
linear only on *spatial transitions* between states — ambient travel
loops are exempt by intent, flag it in review if contested).

## Rules

- travel distance should equal window width so items fully exit before
  wrap
- reduced-motion: freeze a mid-stream frame (`animation:none`)
