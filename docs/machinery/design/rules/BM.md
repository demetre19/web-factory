---
file: BM.md
see: [O.md, I.md]
---

# BM — Brand motif: the derived decorative vocabulary

The client logo decomposes into geometric primitives
(`tools/design-gate/motif.py` → motif kit: `{primary_mark,
curve_family, angle, geometric_seed, negative_shape, aspect,
primitives}`), and that kit is the site's decorative vocabulary —
ghost backgrounds, accent marks, icon frames, dividers, list
markers, corner treatments, quote-marks. One mark drives every
decoration (the apiarydigital model); the site reads as authored
from one brand system, never assembled from stock shapes. The DNA
carries `brand_motif: {motif_source, motif_family, usage}`.

### BM.1 The kit is declared and real

`dna.brand_motif` is a map with `motif_source` ∈
{logo-extracted, declared, none}, `motif_family` (list of kit
primitives), `usage` (slots or `all`). A `logo-extracted`/`declared`
source with an empty family FAILs — extraction produces the kit
before anything draws from it.

### BM.2 Decorations trace to the kit

Every decoration (`data-motif="X"` / `motif-X` class) names a
motif_family primitive or a neutral primitive
({hairline, dot-grid, keyline, divider, underline, rule}).
A shape unrelated to the kit is a coherence fail — "suits the
brand" is mechanical, not taste. `ornament=logo-motif` with an
empty kit FAILs: extract the mark before injecting it.

### BM.3 Usage stays in declared slots

`data-motif-slot` values stay inside the declared `usage` set
(unless `usage: all`) and inside the known slot vocabulary
{background, accent, frame, divider, marker, quote, corner} —
the kit propagates where the plan says, not wherever a decorator
felt like it.

## Enforcement

Generated from `enforcement.json` (`gate.py enforcement`) — edit the JSON, never this table.

| Rule | Tier | Mode | Check / rubric | FAILs when | Wave |
|---|---|---|---|---|---|
| BM.1 | structural | script | `check_brand_motif` | bad motif_source, or extracted/declared source with empty motif_family | w7 |
| BM.2 | stylistic | script | `check_brand_motif` | decoration outside the kit and neutral primitives; logo-motif with empty kit | w7 |
| BM.3 | stylistic | script | `check_brand_motif` | motif slot ∉ declared usage / unknown slot | w7 |
