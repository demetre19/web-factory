# templates/motion — micro-animation recipe library

Self-contained animation recipes for the Web Factory. Each recipe dir:

- `index.html` — self-contained demo (light/dark toggle,
  `prefers-reduced-motion` fallback, no build, no deps)
- `recipe.md` — taxonomy tags, parameters (duration/easing/colour
  tokens), rules, when-to-use

`index.html` at this root is the **catalogue** (embeds every demo).

## Rules every recipe obeys

- animate `transform`, `opacity`, `stroke-dash*`, `fill-opacity` only —
  M.7 compositor budget. Two bounded exceptions: `blur-reveal` animates
  `filter` (documented), and colour-only `color`/`background`/
  `border-color` transitions ≤200 ms are permitted on interactive
  chrome (menu-cascade); both carry their `property` tags.
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
| axis-grow | staggered scaleX bars | loop | none |
| backdrop-loops | ambient rotate + dash-flow | loop | none |
| blob-morph | ambient border-radius blobs | loop | none |
| blur-reveal | photo "focus" reveal | in-view | light |
| clip-conveyor | windowed translate loop + dash ticker | loop | none |
| dash-ticker | pulse line sweep | loop | none |
| draw-icon-loop | looping line-draw cycle | loop | none |
| draw-icon | SVG line-draw entrance | in-view | light |
| leaf-sway | ambient botanical sway | loop | none |
| line-mask-entrance | masked headline rise | load | light |
| menu-cascade | staggered item entrance on open | active | light |
| module-stack | staggered drop-in assembly | loop | none |
| pop-scan | scale-pop marker + gliding lens | loop | none |
| progress-rig | @property-driven progress track | loop | light |
| radar-pulse | expanding rings + converging signals | loop | none |
| reveal-fade | in-view fade + rise | in-view | light |
| scan-sweep | travelling scanner + pick flash | loop | none |
| scroll-draw | scroll-linked line + quantised steps | scroll-linked | light |
| slide-entrance | enterView animation system | in-view | light |
| snap-arrange | scatter-to-grid loop | loop | none |
| stamp-check | confirm sequence (tint → draw → stamp) | loop | none |
| story-vine | zigzag process illustration | loop | none |
| word-cycler | handoff phrase rotation | loop | none |
| write-lines | staggered text-write + stamp | loop | none |

All patterns above originate from the tamdoma.ai study —
`docs/machinery/design/motion/sources/tamdoma-ai/ANALYSIS.md`.
