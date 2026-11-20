---
id: rules-FL
type: rules
links:
  used_in: [w4, w7]
---

## FL. Fluid sizing (U.9)

### FL.1 One clamp per size — no bare literals

Every font-size / padding / margin / gap declaration in emitted CSS,
component `<style>` blocks and inline styles is built only of
`var(--…)`, `clamp()`, `calc()` over those, `0`, `auto`, `inherit`,
`em` values (em follows the fluid font), or `env()` — never a bare
`N(px|rem|vw|%…)` literal. Exemptions live in `clamp.EXEMPTIONS`
(≤2px borders, line-height/letter-spacing, breakpoints, sr-only clip,
`--tap`, `--radius`, width-ladder vars, `--btn-padding-*`).

Every `:root` `--text-*`, `--h[1-6]`, `--space-*`,
`--section-space-*`, `--gutter` definition is the `fluidClamp` output
for the TOKENS `fluid` settings — recomputed endpoints must match
within 0.05px at both 320 and the content width.
