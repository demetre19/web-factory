---
id: recipe-write-lines
type: motion-recipe
taxonomy:
  trigger: loop
  technique: css-keyframes
  property: [stroke-dashoffset, transform-scale, opacity]
  budget: stroke-cheap
  m_type: emotional
  purpose: [explanation]
  timing_class: loop-short
  easing_family: ease-both
  loop_type: infinite
  complexity: composite
  js_dependency: none
  personality_fit: [professional, elegant]
source: tamdoma.ai — .sico-content (write + stamp)
---

# write-lines — staggered text-write + stamp

`<line>` elements with a fixed `stroke-dasharray:32` write left-to-right
like typing; `nth-child` delays stagger the paragraphs; a check stamps
when the draft completes — the content/copywriting metaphor.

## Parameters

| Token | Default | Notes |
|---|---|---|
| `--pass` | 7 s | loop period |
| dasharray | 32 | covers the longest line |
| stagger | 0.3 s per line | nth-child delays |
| stamp window | 40–85% | scale+fade pop |

## When to use

Content production, drafting, "we write it" steps, document-completion
states.

## Rules

- fixed dasharray (32) suits uniform `<line>` elements; for varied
  `<path>` lengths prefer `pathLength="1"` + `dasharray:1`
- reduced-motion: lines drawn, stamp shown — static "done" frame
