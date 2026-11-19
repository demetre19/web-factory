---
id: rules-TL
type: rules
links:
  index: design-index
  see_also: [rules-O, rules-BM, rules-I, rules-VG]
  used_in: [w4, w5]
---

# TL — Three-layer ornamental selection contract

Ornamental identity splits into exactly three layers, each generated
by a different mechanism and picked independently:

| Layer | What it is | Generator |
|---|---|---|
| `ornament` | parametric pattern **field** — no identity | `ornament.py` seeded variants |
| `motif` | mark **deconstruction** — the logo pulled apart | `motif.py` kit ops |
| `icon` | **meaning** mark — Lucide / gesture shapes | `lucide-astro` + I-rules |

The layers compose but never substitute for each other: a pattern
field is not a logo crop is not an icon.

### TL.1 The taxonomy is closed

Every selection surface declares its layer as `data-tl-layer` ∈
{ornament, motif, icon}. A fourth invented layer FAILs — new
ornamental capability joins an existing layer or does not ship.

### TL.2 Candidates are scored on DNA-FIT; the floor is 50

Every candidate carries `data-dna-fit` — a 0–100 score against the
site DNA vector: **strong ≥80, works 50–79, loose <50**. The picker
renders ≥50 only; loose-fit options are generated (they feed
'more like this' branching) but never shown. A rendered candidate
below the floor FAILs — showing weak options wastes the operator's
judgment and invites drift.

### TL.3 Every candidate carries its seed chain

Generation keys are **word-seed chains**: brand → domain-verb →
essence-noun → geometry-family (`mulching → cut → slash`,
`mulching → rotation → arcs`). `chains.py` enumerates multiple
chains per brand — each seed opens a different direction; the engine
never collapses to one association. Every emitted candidate records
its chain as provenance: `data-seed-chain` on the card, `seed_chain`
in the trace. **'More like this'** = sibling generation: the same
family re-branched through `chains.siblings(chain)` — seeded,
deterministic, each sibling independently selectable.

### TL.4 Layers multi-select; a pick is per-layer

A layer block with ≥2 candidates uses **checkbox** semantics — the
operator may want ghost pattern AND accent ticks, or none. Radio
(single-select) inside a multi-candidate layer block FAILs.
Cross-layer selections are independent: picking a motif does not
consume the ornament slot.

## Enforcement

Generated from `enforcement.json` (`gate.py enforcement`) — edit the JSON, never this table.

| Rule | Tier | Mode | Check / rubric | FAILs when | Wave |
|---|---|---|---|---|---|
| TL.1 | invariant | script | `check_three_layers` | data-tl-layer outside {ornament, motif, icon} | w5 |
| TL.2 | invariant | script | `check_three_layers` | dna-fit outside 0–100 or rendered below 50 | w5 |
| TL.3 | invariant | script | `check_three_layers` | candidate without data-seed-chain provenance | w5 |
| TL.4 | invariant | script | `check_three_layers` | multi-candidate layer using radio, not checkbox | w5 |

## Links

- `rules/O.md` — the ornament field layer (params, intensity, motion).
- `rules/BM.md` — motif kit extraction from the logo.
- `rules/I.md` — icon discipline (Lucide).
- `rules/VG.md` — the picker surfaces candidates land on.
