# templates/motion — micro-animation recipe library

Self-contained animation recipes for the Web Factory. Each recipe dir:

- `index.html` — self-contained demo (light/dark toggle,
  `prefers-reduced-motion` fallback, no build, no deps)
- `recipe.md` — taxonomy tags, parameters (duration/easing/colour
  tokens), rules, when-to-use

`index.html` at this root is the **catalogue** (embeds every demo).

## Rules every recipe obeys

- animate `transform`, `opacity`, `stroke-dash*`, `fill-opacity` only —
  M.7 compositor budget (the single flagged exception:
  `blur-reveal`, documented)
- `prefers-reduced-motion`: spatial movement → instant or ≤150ms
  opacity crossfade; loops freeze on a representative frame
- no animation libraries; JS only where the trigger needs it
  (IntersectionObserver / scroll progress — `js_dependency:light`)
- durations/easing pick from M.2 tokens; personality tag guides which
  sites may ship them
- one focal animation per viewport (M.4) — recipes compose, they don't
  compete

## Recipe index

| Recipe | Pattern | Trigger | JS |
|---|---|---|---|
| draw-icon | line-draw entrance, once | in-view | light |
| draw-icon-loop | line-draw write/erase cycle | loop | none |
| pop-scan | scale-pop + gliding lens | loop | none |
| axis-grow | staggered scaleX bars | loop | none |
| stamp-check | tint → draw → stamp | loop | none |
| clip-conveyor | clip-windowed item stream | loop | none |
| scan-sweep | travelling scanner + pick | loop | none |
| radar-pulse | expanding rings + converge | loop | none |
| module-stack | drop-in module assembly | loop | none |
| snap-arrange | scatter → grid | loop | none |
| write-lines | text-line write + stamp | loop | none |
| dash-ticker | pulse sweep on path | loop | none |
| word-cycler | phrase handoff rotation | loop | none |
| progress-rig | @property track fill | loop | none |
| backdrop-loops | ambient dial/dash-flow | loop | none |
| reveal-fade | fade + rise entrance | in-view | light |
| line-mask-entrance | masked headline rise | load | light |
| blur-reveal | photo focus pull (⚠ filter) | in-view | light |
| menu-cascade | dropdown item cascade | active | none |
| scroll-draw | scroll-linked line + steps | scroll-linked | light |

All patterns above originate from the tamdoma.ai study —
`docs/machinery/design/motion/sources/tamdoma-ai/ANALYSIS.md`.
