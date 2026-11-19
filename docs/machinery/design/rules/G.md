---
id: rules-G
type: rules
links:
  used_in: [w3, w5, w8]
---

## G. Gutters — the spacing primitives

Source: operator SOP §2 (gutters/margins/negative space) + §4
(proximity/rules/containers) + existing token v2 density tiers.

### G.1 The closed set

One unit: **4px**. One scale:
`{4, 8, 12, 16, 24, 32, 48, 64, 96, 128}`. Every padding, gap, and
inset is a member — never `13px`, never `space-between` without a
declared step. This is what `system.space.scale` in DESIGN-PLAN
serializes.

### G.2 The proximity law

Between-group gap ≥ **2×** within-group gap — Gestalt as arithmetic.
Related blocks sit close; new sections are separated by expanding the
gap, not by adding borders. `system.space.group_gap_vs_section_gap:
"≥2×"` is the plan-time commitment.

### G.3 Density is a named tier

`compact | regular | spacious` — three named py-tokens per surface,
not a vibe. `spacious` is *spent* at promise + act + ≤1 interior
section (the two rests); `regular` is the default; `compact` is for
proof bands and chrome. Uniform `regular` everywhere is the
"undecided rhythm" defect.

### G.4 Rules and containers as gutter devices

- **Hairline rule** (1–2px): binds related blocks (headline+subhead)
  or separates disparate ones — the motif device.
- **Container inset**: card/panel content sits ≥10–15% in from the
  panel edge; a card with edge-to-edge text is a defect.
- **Section gap**: the largest gap on the page is always *between*
  sections; a gap inside a section that exceeds the section gap is
  trapped whitespace (L.4).

---

### G.5 Self-organising grids — auto-fit only

Card/feature/step collections use
`repeat(auto-fit, minmax(min(var(--grid-min,28rem),100%),1fr))` with
`gap: var(--grid-gap)`. No `repeat(N, …)` on collections. Horizontal
scroll rails are banned unless deliberately full-bleed and declared —
a rail narrower than the viewport that scrolls = FAIL.

### G.6 Canon padding ratios — per component type

Every component type carries its own padding-ratio band from
`CANON-PADDING.json` (PatternMiner's canon measurements, per type and
size tier — never one global median). A rendered component whose
type is unclassified, or whose block:inline ratio sits outside its
band, FAILs.

### G.7 Equal-height cards

Cards in one row share a single shell class/grid track; mixed shells
in a grid = FAIL.

### G.8 Track count is the `columns` allele

A grid section renders the track count the genotype chose: every
grid component (`cards-n`, feature/media/service/comparison grids)
carries `data-cols` ∈ the `columns` allele set {1,2,3,4}, and a
plan row declaring `columns` binds its block exactly. A card grid
that ships 4 tracks under `columns: 3` restyled the wrong section.

## Enforcement

Generated from `enforcement.json` (`gate.py enforcement`) — edit the JSON, never this table.

| Rule | Tier | Mode | Check / rubric | FAILs when | Wave |
|---|---|---|---|---|---|
| G.1 | stylistic | script | `check_spacing_scale` | any spacing value ∉ {4,8,12,16,24,32,48,64,96,128} | w5 |
| G.2 | structural | script | `check_proximity` | group gap vs section gap ≥2× | w5 |
| G.3 | stylistic | script | `check_section_enums` | density ∈ {compact,regular,spacious} | w3 |
| G.4 | stylistic | reviewer | `gutter-devices` | rules/containers as gutter devices | w8 |
