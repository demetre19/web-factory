---
id: rules-TK
type: rulebook
links:
  index: design-index
  see_also: [rules-C, rules-T, rules-DM]
  used_in: [w5, w6]
---

# TK — the token layer (Tailwind v4 shape)

`TOKENS.json` → `global.css` is a machine emission, not authored
CSS. The emitted file has exactly five layers, in this order:

1. `@theme { … }` — PRIMITIVES: colour ramps (neutral incl. the
   brand tint, semantic states), spacing rungs, radius, font
   families/sizes/leading, easing + durations, z-index.
2. `:root { … }` — SEMANTICS: `bg-canvas|surface|elevated|subtle|
   inverse`, `text-primary|secondary|muted|inverse`,
   `border-default|strong|focus`, `action-*`, `shadow-*`. This is
   the only layer components consume.
3. `.dark { … }` — every semantic var overridden.
4. `@theme inline { … }` — semantic names → Tailwind utilities
   (`color-canvas`, `ink-primary`, `line-default`,
   `action-primary`, `shadow-*`).
5. `@custom-variant dark (…)` — the variant dark utilities hang
   off.

ACSS/knob values feed the PRIMITIVES; the semantic layer is the
contract components bind. An emission that skips a layer is a
half-built token stack — components would consume primitives
directly and the dark mode would be fiction.

### TK.1 The five layers exist, in order

`site/src/styles/global.css` carries `@theme {`, `:root {`,
`.dark {`, `@theme inline {`, `@custom-variant dark`. Any missing
layer FAILs.

### TK.2 Semantic parity — light and dark carry every token

Every semantic var declared in `:root` (`--bg-*`, `--text-*`,
`--border-*`, `--action-*`, `--shadow-*`) is overridden in `.dark`
— directly or by re-declaring its derived formula so it resolves
against the dark bases. A semantic without a dark override is half
a token.

### TK.3 Components bind semantics, never values

A component source (`site/src/components|pages|dist`) referencing
a raw hex in a colour property, or a `--primitive-*` var directly,
FAILs — primitives feed semantics; components consume the semantic
layer only.

### TK.4 Contrast rides the semantic pairs in both modes

C.2 contrast runs on the semantic role pairs of each mode — the
parity guarantee (TK.2) is what makes both-mode contrast checkable
at all.

## Enforcement

Generated from `enforcement.json` (`gate.py enforcement`) — edit the JSON, never this table.

| Rule | Tier | Mode | Check / rubric | FAILs when | Wave |
|---|---|---|---|---|---|
| TK.1 | invariant | script | `check_token_layer` | missing @theme/:root/.dark/@theme inline/@custom-variant layer | w5 |
| TK.2 | invariant | script | `check_token_layer` | semantic var in :root with no .dark override | w5 |
| TK.3 | invariant | script | `check_token_layer` | raw hex in component colour prop, or --primitive-* referenced by a component | w6 |
