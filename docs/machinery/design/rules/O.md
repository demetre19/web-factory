---
file: O.md
see: [M.md, I.md, TK.md, BM.md]
---

# O — Ornaments: the injectable decorative layer

Ornament is a free-agent layer — brand motif, technical, or
decorative — injected at declared targets, never an always-on site
attribute. The `tech-ornament` recipe family
(`tools/design-gate/ornament.py`) renders parametric inline SVG from
`{seed, density, bounds, variants}`; `ornament=none` is always a
valid option. At W4 the layer is a look axis (options show the page
with vs without treatment); post-pick it bakes into foundations via
`ornament_placements` — `{target, layer, variant, intensity, motion}`
per injection point.

### O.1 Ornaments are deterministic output, never drawn

Every ornament carries its generation params
(`data-ornament-seed`, `data-ornament-variant`,
`data-ornament-density`, `data-ornament-bounds`) and its geometry
recomputes byte-equal to `ornament.generate()`. Undocumented or
hand/AI-drawn geometry FAILs — noisy malformed paths are the failure
mode the generator exists to prevent.

### O.2 The layer is DNA-coherent

`data-ornament-layer` equals the genotype `ornament` allele
(`logo-motif|technical|decorative`) and ornaments render only when
the allele is not `none`. A layer the DNA didn't declare is a
coherence defect, not flair.

### O.3 Ornaments bind theme tokens

Strokes are `currentColor`/`var(--…)`/none — recoloured by the
semantic ink-* tokens — never literal colour. Stroke-width is a
construction hairline, 0.5–1px.

### O.4 Ornaments stay decoration

`aria-hidden="true"` + `data-layer="behind"` — invisible to assistive
tech, under the content layer, never carrying information.

### O.5 Injection is targeted and sparse

Every rendered ornament carries `data-ornament-target` matching a
declared `ornament_placements` entry (DNA or plan). Undeclared
targets FAIL, >4 ornaments on one page FAILs — the layer is
intentional, never blanket-sprinkled. An allele ≠ none with an
empty placements list FAILs (declared but never injected = stale
DNA).

### O.6 Intensity is a band axis

`data-ornament-intensity` ∈ {ghost, accent, statement, bold};
the rendered `opacity` sits inside the band (ghost 0.04–0.07,
accent 0.10–0.15, statement 0.20–0.30, bold 0.35+). Intensity is
part of the look choice — whisper-ghost backgrounds vs a visible
brand pattern are different vibes.

### O.7 Motion is a tamdoma axis

`data-ornament-motion` ∈ {static, drift, rotate, dash-draw, pulse,
reveal} — pure CSS (stroke-dashoffset drift, keyframe rotate, draw-on
-intersection), never a library. Non-static motion requires
`.ornament-*` CSS in global.css AND a `prefers-reduced-motion` block
disabling it — accessibility is not optional.

### O.8 The DNA filters the option set

Ornament axes are DNA-derived, not free choices. `_ornament_budget()`
maps the genotype + vertical profile to allowed
{layers, intensities, motions}: technical/precision DNAs get the
technical layer with hairline accent + dash-draw; luxury DNAs get
ghost outline-echo only; clean/minimal DNAs get whisper-ghost +
static; expressive DNAs get the full palette. A declared placement
outside the budget FAILs — the look round never offers a choice the
DNA already ruled incoherent.

## Enforcement

Generated from `enforcement.json` (`gate.py enforcement`) — edit the JSON, never this table.

| Rule | Tier | Mode | Check / rubric | FAILs when | Wave |
|---|---|---|---|---|---|
| O.1 | invariant | script | `check_ornament` | missing params or geometry != generate() output | w7 |
| O.2 | stylistic | script | `check_ornament` | layer != genotype allele, or ornament with allele none | w7 |
| O.3 | stylistic | script | `check_ornament` | literal-colour stroke or width outside 0.5–1px | w7 |
| O.4 | invariant | script | `check_ornament` | missing aria-hidden / data-layer="behind" | w7 |
| O.5 | invariant | script | `check_ornament` | undeclared/missing target, >4 per page, allele≠none with empty placements | w7 |
| O.6 | stylistic | script | `check_ornament` | intensity ∉ band set or opacity outside the band | w7 |
| O.7 | invariant | script | `check_ornament` | motion ∉ closed set; non-static motion without .ornament-* CSS or reduced-motion disable | w7 |
| O.8 | structural | script | `check_ornament` | declared placement outside the DNA's layer/intensity/motion budget | w7 |
