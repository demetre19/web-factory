---
id: rules-DM
type: rules
links:
  index: design-index
  see_also: [rules-DNA, rules-C, rules-B, rules-SB, rules-VG, dna-map, design-knobs]
  used_in: [w0, w1, w2, w3, w4, w5, w6, w7, w8]
---

# DM — The DNA map

**Invariant, alongside the golden rule.** One file per site/run is the
single source of coherence: `<pipeline>/DNA.json` (machine) and
`<pipeline>/DNA.md` (rendered, same content). It carries the vertical
DNA profile, the genotype (one allele per gene), the system knob vector,
the token references, the rhythm plan (surfaces, densities, contrast
moment, motif) and both colour modes.

Every wave, every section builder, every variant and every reviewer
reads the DNA map **first** and conforms to it. Nothing may define a
design value that is not traceable to it.

### DM.1 The map is complete and total

`DNA.json` exists and carries every field below; a blank field is a
FAIL, not a default.

```json
{
  "schema": "design-dna-map/v1",
  "version": 0,
  "site": "<slug>",
  "vertical_profile": "profile-<vertical>   # from dna/<vertical>",
  "genotype": { "<gene>": "<allele>", "…": "every gene in dna/GENOME.md" },
  "knobs": { "<knob id from knobs.json>": "<value in range>", "…": "all" },
  "tokens": { "type.ratio": "var(--type-ratio)", "…": "knob → CSS token" },
  "rhythm": { "surfaces": ["base", "muted", "inverse", "…"],
              "densities": ["compact", "regular", "spacious", "…"],
              "contrast_moment": "<section>",
              "motif": "<device>", "motif_break": "<section>" },
  "modes": { "light": {"bg": "#…", "…": "every C.5 role"},
             "dark":  {"bg": "#…", "…": "every C.5 role"} },
  "modes_required": ["light", "dark"],
  "vector_targets": { "<vector>": 0 },
  "invariants": { "…": "verbatim extracted values, provenance: extracted" },
  "constraints": { "…": "dislikes, refuses — provenance: stated" },
  "provenance": { "<field>": "extracted|inferred|chosen|patterns" },
  "hashes": { "core": "<12hex>", "structure": "<12hex>",
              "variants": "<12hex>" },
  "burst": 0,
  "wildcard": []
}
```

`vector_targets` values are 0–10 whole points. `hashes` is recomputed
by the gate: **core** = everything minus the four structure genes;
**structure** = the structure genotype + rhythm + pages (see DNA-MAP).

**Enforcement** — script `check_dna` in every wave (and
`gate.py dna <dir>`). Threshold: every field present; every genotype
gene ∈ GENOME's closed allele set; every knob ∈ `knobs.json` and inside
its range on its step.

### DM.2 Every artifact traces to the map

The map is hashed as three slices (`hashes.{core, structure,
variants}`, first 12 hex of each canonical slice). A section contract
embeds `dna_hash` (core) plus `structure_hash`; a section component
echoes both in its frontmatter (`dna_hash:`, `structure_hash:`); a
variant record carries `dna_hash` plus its knob diff against the
map's baseline. W3 locks the structure slice, W4 the core, W5 issues
map v1.

**Enforcement** — script `check_dna`. Threshold: every
`sections/*.contract.json` and every `components/sections/*.astro` hash
equals the current map hash. A stale hash is a FAIL — the artifact was
built against a different map.

### DM.3 No untraceable values

A token, knob, allele or rhythm value used by any artifact must appear
in the DNA map. Freehand values (a hex not in `modes`, a knob id not in
`knobs.json`, an allele outside `genotype`, a surface not in
`rhythm.surfaces`) are refused exactly as a freehand hex always was.

**Enforcement** — script `check_dna`. Threshold: zero untraceable
values across `TOKENS.json`, `DESIGN-PLAN.md`, section contracts and
`VARIANT-GATES.json`.

### DM.4 Variants derive from the baseline

A variant is a **partial knob diff** over the map's knob vector
(`{"type.ratio": 1.333}`), never a new map. Its diff may only touch
knobs the map allows and must stay in range — except a declared wildcard
(B.4), which may exceed a **stylistic** knob by at most two steps and
never an invariant or structural one.

**Enforcement** — script `check_dna` + `check_variants`. Threshold:
every variant's changed knob ids ⊆ `knobs.json`, values in range (or the
wildcard extension), and every unchanged knob equals the map's value.

### DM.5 The rhythm plan is binding

`rhythm.surfaces` / `rhythm.densities` / `contrast_moment` / `motif` are
the plan the page must render. A section whose surface or density is not
in the map, or a page missing the declared contrast moment, is a FAIL —
not a taste call.

**Enforcement** — script `check_dna` (plan rows ⊆ map) and
`check_rhythm_render` (rendered page shows the contrast moment and the
S-M-L order).

### DM.6 A changed map invalidates everything downstream

`run.py` records the map hash with each gate. If the hash differs from
the recorded one, every wave from the earliest recorded wave is
invalidated and re-run — the build restarts at the first wave that
consumed the old map. Silent reuse of stale artifacts is the failure
this rule exists to prevent.

**Enforcement** — script `run.py` + `check_dna` (per-artifact hash) +
`check_dna_fresh` @ every wave (GATES.json recorded hash == current).

## Links

- `DNA-MAP.md` — the architecture and the schema narrative.
- `knobs.json` — the closed knob set every map value comes from.
- `dna/GENOME.md` — the genes and closed allele sets.
- `rules/C.md` C.5 — both modes live in the map.
