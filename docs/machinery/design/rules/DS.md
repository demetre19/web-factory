---
id: rules-DS
type: rules
links:
  index: design-index
  see_also: [rules-P, rules-TK, rules-C, rules-VG, section-build]
  used_in: [w6, w7]
---

# DS — Design-system sheet

Every design ships a RENDERED design-system page after the styling
choice has been made — NOT NEGOTIABLE. TOKENS.json is the source of
truth; the sheet is the tokens made visible so every agent binds the
same conventions: typography, colours, style, buttons, links, card
styles, plus the section conventions (density→section-space rungs,
gutter, measure, content width, surfaces). Reference shape:
lexingtonthemes.com viewports each ship /system pages (colours,
shaders, typography, buttons, links) kept out of the public nav.

`pipeline_emit._design_system` emits `src/pages/design-system.astro`
at W6 — after the W4 look pick locks the DNA — and the astro build
lands it at `site/dist/design-system/index.html`. It is emitted
machinery; no agent ever hand-authors it. Every specimen carries
`data-ds-kind`/`data-ds-name`/`data-ds-var`/`data-ds-class`/
`data-ds-value` so the gate can prove the sheet, the token layer and
TOKENS.json never drift.

### DS.1 The sheet exists and renders

`site/dist/design-system/index.html` must exist, sit under the shared
BaseLayout chrome, and carry a theme toggle — the sheet renders both
modes (C.5). A sheet with no `data-ds-name` specimens is not a sheet.

### DS.2 Every rung renders, and declared values match TOKENS.json

Every ACSS size rung (text-*/h*/space-*/section-space-*/gutter) has a
specimen whose `data-ds-value` equals TOKENS.json's clamp, whose
`--<name>` decl in global.css equals the same clamp, and whose
specimen class (`ds-tx-*`/`ds-sp-*`, emitted by
`emit_global._ds_specs` into the shared component layer) binds
`var(--<name>)`. Every colour role in both modes renders a swatch
bound to the tailwind utility components use, and the role hex equals
TOKENS.json and `tailwind.config.js`. Buttons (all variants), links,
cards, icon chips, form fields (when the plan carries a form),
density, radius/elevation/motion and the knob table are all present.
Drift — a component, emitter or page diverging from the bound
tokens — fails here.

### DS.3 Machinery chrome stays out of the public nav

No plan page links to `/design-system`. It is factory chrome, like
the system tile — rendered proof for operators and agents, not site
content.
