---
id: rules-A
type: rulebook
links:
  index: design-index
  see_also: [rules-G, rules-REF, BASE.ACSS, section-catalog]
  used_in: [w5, w6, w7]
---

# A — ACSS conventions (baseline mechanics)

**GOLDEN RULE: ACSS is the baseline.** Canon refs (REF.1) and
brand/copy invariants outrank it; everything else fills from
`ACSS-BASELINE.md`. DIFFERS resolved in ACSS's favour: fluid
section-space/space-* tiers over a closed px scale, 80rem/1280px +
60ch prose over 1440, auto-fit grids, `--radius` family. We keep:
class-based light/dark (both modes ship, C.5), mobile-first
breakpoints alongside container queries, the 6-role palette mapped
onto ACSS colour roles.

### A.1 Mechanical conventions

No `rgba()` literals — transparency is `color-mix(in oklch, role X%,
transparent)`. No `min-height` sections (declared hero comps only);
whitespace comes from `--section-space-*`. Every interactive element
has an accessible name (`.sr-only` or aria-label); icon-only controls
without one FAIL. External links carry `rel="noopener"` + a visual/SR
cue; internal links never open new tabs; `:has(>img,figure,svg)`
excluded from link styling.

### A.2 The card contract

Cards are `position:relative` containers: the heading `<a>` +
`::before { inset: 0 }` makes the hit area — never wrap the whole
card. `:focus-within` rings the card. Multiple links ban the pseudo
expansion. Cards override via `--card-*` token redefinition, never
literals; `__content` carries padding while `__media` may bleed.

### A.3 Every type has a profile

`components/<data-comp>.md` holds the full rule profile per
component type (heading rank/token/lines, body token/measure,
padding ratio, part gaps, radius, border/elevation, icon size,
media ratios, CTA count/rank, grid width bounds, states, mobile
variant). A rendered `data-comp` without a profile FAILs; values
outside the profile FAIL per the type's own thresholds.
