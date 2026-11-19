---
id: rules-SKL
type: rulebook
links:
  index: design-index
  see_also: [rules-REF, section-catalog, BASE.ACSS]
  used_in: [w7]
---

# SKL — Skeleton sources (structure-only tier)

Skeletons (`templates/skeletons/**`, first: `skeleton-hyperui`,
MIT-licensed HyperUI harvest) sit in a **structure-only source tier
below canon**. They may supply markup structure — semantic elements,
a11y attributes, responsive grid/flex shapes — and nothing else.

- Skeletons are **never canon refs**: canon (operator > endorsed >
  Mobbin) decides visuals; a skeleton id in `refs:` / `data-refs` /
  MOBBIN-REFS / canon trace FAILs (SKL.2).
- `composition` stays SECTION-CATALOG's — a skeleton family suggests a
  composition, never decides it.
- Skeleton provenance is recorded as `data-skeleton="<harvest id>"` on
  the rendered section or `skeleton:` on the plan row.
- Sources: `skeleton-hyperui` (MIT harvest), `skeleton-shadcn`
  (component-reference tier, SKL.3), `skeleton-brixies` (brixies.co
  harvest — structure-only; harvest id
  `brixies/<category>/<block_name>`, e.g.
  `brixies/accordions/accordion-1`).

### SKL.1 Structure-only adoption — no raw visual utilities

A `data-skeleton` section carries structure classes only (grid/flex
geometry, order, col/row spans, sr-only, group, peer, breakpoint
prefixes wrapping allowed classes, ACSS token classes). Raw Tailwind
visual values — colours, spacing utilities, type size/weight, radius,
shadow, arbitrary `[…]` values — FAIL: visuals come from Section.astro
surfaces + ACSS tokens, identical to freehand hex.

### SKL.3 Component-tier endorsement (component-reference sources)

A `component-reference` source (first: `skeleton-shadcn`, operator
endorsement) may inform **component-level** visual values — heights,
paddings, font sizes, focus ring, aria-invalid treatment, radius
ladder — when the DNA component profile leaves the value open; the
DNA/profile always wins. Its classes are CSS-var tokens by design
(`bg-primary` → `var(--primary)`) and count as token indirection
under SKL.1, not raw utilities. Section-level layout/rhythm/look
citations stay SKL.2 defects — component endorsement never reaches
the page canon tiers.

### SKL.2 Never cited as canon

`skeleton*`, `hyperui/*`, `templates/skeletons/*` tokens in refs,
canon_trace, or MOBBIN-REFS FAIL — structure sources are not evidence
for visual decisions.

## Enforcement

| Rule | Tier | Mode | Check | FAILs when | Wave |
|---|---|---|---|---|---|
| SKL.1 | structural | script | `check_skeleton` | raw visual utility on a data-skeleton section | w7 |
| SKL.2 | structural | script | `check_skeleton` | skeleton id cited as a canon ref | w7 |
| SKL.3 | stylistic | script | `check_skeleton` | component-reference visuals applied where the DNA profile is closed, or section-level cites | w7 |
