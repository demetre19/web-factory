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

## Enforcement

| Rule | Mode | Check / rubric | Threshold that FAILs | Wave |
|---|---|---|---|---|
| G.1 | script | `check_spacing_scale` | values ⊆ {4,8,12,16,24,32,48,64,96,128} | w3 |
| G.2 | reviewer | `proximity-law` | group gap ≥2× tighter than section gap | w8 |
| G.3 | script | `check_section_enums` | density ∈ {compact,regular,spacious} | w5 |
| G.4 | reviewer | `gutter-devices` | rules/containers as gutter devices | w8 |

## Links

- G.1 → R.2 (spacing scale ↔ edge ramp — distinct scales)
- G.3 → L.7 (density tiers ↔ S-M-L rhythm)
