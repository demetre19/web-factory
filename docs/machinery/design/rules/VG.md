---
id: rules-VG
type: rules
links:
  index: design-index
  see_also: [rules-C, rules-DNA, rules-B, rules-SB, section-build]
  used_in: [w2, w8]
---

# VG — Hi-fi variant picker

The wireframe switcher proved the operator picks better from
side-by-side than from prose. VG is the same instrument at **hi-fi**:
3 real designs of the same page on one screen, switching variant,
viewport and mode in place, each labelled with what it is optimising
for and what it breaks.

**GOLDEN RULE: ASTRO is for the final product (W6–W8); the picker is
self-contained HTML** (`preview/variants.html`, compiled from
TOKENS/DNA). The operator chooses between **ACTUAL page designs** —
full responsive page mockups with real copy and imagery, every value
driven by the DNA knob vector. Style/system sheets are *implicit*:
generated and gated, never the choosing surface.

### VG.1 One page, exactly 3 variants, mechanical build

`preview/variants.html` exists and renders **3 (default) to 5** full
responsive pages — one real design per variant. It is generated —
`assemble.py --variants` writes it from DNA + plan; a hand-written
picker drifts from the designs it claims to show.

**Enforcement** — script `check_variants` @ w2 and w8. Threshold: file
exists, `data-variant` count is exactly 3 (look round), every rendered id is a computed
pass, and `data-pane="page"` holds a full responsive page mock.

### VG.2 A variant is a vector, not a mood

Every variant names the **vector** it optimises and the genome alleles
that realise it: `best-predicted`, `typography-led`, `imagery-led`,
`density-led` / `rhythm-led`, or `wildcard`. Variants share content and
structure (same plan rows, same components); only token themes and
composition alleles differ. A variant that changes copy or section order
is not a variant — it is another page.

**Enforcement** — script `check_variants`. Threshold: every
`VARIANT-GATES.json` entry carries `vector` ∈ the closed list and a
non-empty `alleles` diff against the base genotype.

### VG.3 Only passing variants appear

A tile is shown only when that variant passes **every** gate that
applies to it — mode, contrast, class subset, segmentation, section
gates, speed/mobile where rendered. A failing variant is removed from
the picker, never shown greyed out as an option.

**Enforcement** — script `check_variants`. Threshold:
`VARIANT-GATES.json` entries all `pass: true`, and the page renders no
id that is absent from it.

### VG.4 The switcher is sticky and complete

One sticky bar: **Variant 1…N · Desktop/Tablet/Mobile · Light/Dark**.
Frames render at 1:1 with container queries, so a tablet frame is a
tablet layout, not a scaled desktop; the mock itself is fluid (clamp
type incl. h2/lead, `min-width:0`, `overflow-x` guard) so nothing
overflows at 375/768/1280 in either mode. Switching is instant and
client-side; the chosen variant, viewport and mode persist across
reloads.

**Enforcement** — script `check_variants`. Threshold: the page carries
`data-switch="variant"`, `data-switch="viewport"`, `data-switch="mode"`,
a sticky container, and container-query (`@container` / `cqw`) frames.

### VG.5 The wildcard is present when burst > 0

When the plan declares `burst > 0`, at least one shown variant is the
wildcard: its `VARIANT-GATES.json` entry lists the genes it mutated and
the declared breaks it carries (B.2–B.5). With `burst: 0` no variant may
claim a wildcard.

**Enforcement** — script `check_variants`. Threshold: `burst > 0` ⇒
exactly one wildcard variant with a non-empty `wildcard_breaks`; `burst:
0` ⇒ none.

### VG.6 Each tile states its case

Every tile shows its **predicted score**, the **vector** it improves and
its **wildcard breaks** (rule IDs) — the operator chooses with the same
evidence the gates used. "More like this" re-generates N neighbours in
genome space around the picked variant for the next round; it never
edits the picked design in place.

**Enforcement** — script `check_variants` (score + vector + breaks
present per entry) and the W8 reviewer (`variant-tiles` rubric item:
the label matches what the tile actually does).

## Enforcement

Generated from `enforcement.json` (`gate.py enforcement`) — edit the JSON, never this table.

| Rule | Tier | Mode | Check / rubric | FAILs when | Wave |
|---|---|---|---|---|---|
| VG.1 | invariant | script | `check_variants` | variant not expressed as a knob vector over knobs.json | w4 |
| VG.2 | invariant | script | `check_variants` | page variant without its own passing system sheet | w4 |
| VG.3 | invariant | script | `check_variants` | fewer than 3 or more than 5 variants, or a failing variant shown | w4 |
| VG.4 | structural | script | `check_variants` | switcher missing variant/viewport/mode, or frames not container-query driven | w4 |
| VG.5 | invariant | script | `check_variants` | burst>0 and no wildcard variant, or wildcard breaks an invariant | w8 |
| VG.6 | stylistic | script | `check_variants` | tile without predicted score, vector or declared breaks | w8 |

## Links

- `rules/C.md` C.5 — both modes on every variant (invariant).
- `rules/B.md` — burst and the declared break contract the wildcard
  tile must honour.
- `SECTION-BUILD.md` — variants reuse the same section components.
