---
id: LAW.DNA
type: law
tier: invariant
links:
  enforced_by: [gate.dna]
  used_in: [W1, W2, W3, W4, W5, W6, W7, W8]
  depends_on: [GENOME, TOKENS, rules/C, rules/T, rules/G, rules/S, rules/M]
---
# LAW — The DNA map

**The design system is the primitive. Variations tweak its parts.**
One DNA map per site run is the single source of coherence. Every wave,
every section builder, every variant and every reviewer reads it first;
no design value may exist that does not trace to it.

## Where it slots into the waves

| Wave | DNA map state | What happens |
|---|---|---|
| W0 scaffold | — | Astro + Tailwind project exists. No DNA map yet |
| W1 discovery | — (inputs only) | Operator likes/dislikes of the current site; comparison sites; example/reference sites; Mobbin refs; audit + keep-list. Extract INVARIANTS: accent colour, logo, brand fonts (when present), photography, tone. **No DNA map is written during discovery** |
| W1 exit → DNA v0 | **created (starting point)** | Built only from discovery outputs + the PATTERN LIBRARY + VECTORS: invariants bind verbatim (`extracted`); likes/dislikes become constraints; the vertical DNA profile is pulled from `dna/<vertical>` (genome statistics); genotype + baseline knobs = nearest proven genotypes from `patterns.py search` (genome + text + image similarity), each cited by pattern ID; vector targets (ease of use, clarity, layout, typography, colour, rhythm, imagery, trust, conversion, SEO, mobile, speed, a11y) set from the current-site rating gaps + vertical norms. Gate: every invariant present, every field provenance-tagged, every genotype/knob value cites ≥1 pattern ID or a logged reason |
| W2 content | read | Content inventory checked against the locked map (nothing in content may require an off-map value) |
| W3 layout round | read + rhythm plan | Page rhythm (surfaces, densities, contrast moment, motif) written INTO the map; ≥5 layout options; layout pick locks page structure (`structure_hash`) |
| W4 look round | **baseline chosen** | Look options = distinct knob vectors derived from DNA v0 (invariants fixed across all options); operator pick → baseline knobs |
| W5 design system | **locked v1** | Baseline renders as the system sheet (light + dark); sheet passes gates → map locked, hash issued |
| W6 components | read | Components bind only to map tokens/knobs |
| W7 page | read | Sections carry the map hash; mechanical glue |
| W8 review + variants | read + deltas | Variants = baseline + knob deltas; each variant renders its own system sheet first, then the page |

**Pattern-derived numbers.** At DNA v0 every sizing knob is seeded from the
pattern library's measured statistics for the vertical, not guessed:
type scale (`type.ratio`, `type.base`, display size, heading weight,
tracking), gaps (`grid.gutter`, in-section gap vs section gap),
section padding per density tier (`space.section_py`), container width,
radius, image-led ratio, CTA count. Baseline = the median of the nearest
proven genotypes; allowed range = their interquartile range, clipped to
the SOP rule bounds (T.6, G.1, R.2…). Each seeded value records its
source pattern IDs + sample size in `provenance`.

Any edit to a locked map bumps its version → hash changes → every
downstream artifact is stale → `run.py` rebuilds from the earliest wave the
edit touches.

## Shape (`<pipeline>/DNA.json`)

```json
{
  "version": 1,
  "hash": "<sha256 of canonical JSON minus this field>",
  "site": "whistleclean",
  "vertical_profile": "profile-services/local-service",
  "genotype": { "<gene>": "<allele>" },
  "knobs": {
    "type.ratio": 1.25, "type.base": 17, "type.display_weight": 700,
    "type.tracking_display": -0.02, "space.density_scale": 1.0,
    "space.section_py": { "compact": 48, "regular": 64, "spacious": 96 },
    "grid.gutter": 24, "radius.personality": "p3", "color.surface_contrast": 0.06,
    "color.accent_usage": "cta+motif", "color.neutral_tint": 0.06,
    "elevation.level": 1, "motion.level": "subtle", "image.treatment": "natural"
  },
  "modes": { "light": { "<role>": "<token>" }, "dark": { "<role>": "<token>" } },
  "invariants": { "accent": "#00B488", "accent_deep": "#166F64", "logo": "<asset path>", "fonts": ["<brand font if extracted>"] },
  "constraints": { "likes": ["credentials block", "4-step booking"], "dislikes": ["wall of text", "weak hero voice"], "references": ["<comparison/example site URLs>"] },
  "patterns": ["<pattern IDs the genotype/knobs were derived from>"],
  "vector_targets": { "ease_of_use": 8, "clarity": 9, "layout": 8, "typography": 9, "colour": 8, "rhythm": 8, "imagery": 8, "trust": 9, "conversion": 9, "seo": 9, "mobile": 9, "speed": 9, "a11y": 9 },
  "rhythm": [ { "section": "hero", "surface": "base", "density": "spacious" } ],
  "variants": [ { "id": "v2", "vector": "typography-led", "deltas": { "type.ratio": 1.333 } } ],
  "provenance": { "<field>": "extracted|snapped|inferred|chosen" }
}
```

Every knob has a closed range and step in `GENOME`/TOKENS; a variant is
`baseline + deltas` and nothing else. Theme-only variants never touch
components, which is why gluing stays coherent.

## Enforcement (`gate.dna`, runs inside every wave gate)

FAIL if:
1. DNA map missing, incomplete, or not locked by W5 exit.
2. Any artifact's recorded DNA hash ≠ current map hash.
3. Any token, knob, allele or colour used that is not in the map.
4. A variant's knobs are not `baseline + declared deltas`, or a delta is out of range (wildcard may exceed stylistic knobs only, per rules/B.md).
5. A variant page exists without its own passing system sheet.
6. A section deviates from the map's rhythm plan.
7. Light or dark mode missing for any role.

## Knob table (machine form of the ranges above)

`knobs.json` — closed set, one row per knob: `token`, `kind`
(`number|enum|map`), `range`/`allowed`/`per`, `step`, `tier` (B.1) and
the rule IDs it serves. `gate.dna` reads ranges from it; `DNA.json`
carries the chosen value per knob; a variant is `baseline + deltas`
(DM.4, VG.2). It is the machine rendering of the GENOME/TOKENS knob
ranges this law references — the law owns the intent, the table owns the
arithmetic.

See also: `rules/DM.md` (DM.1–DM.6), `rules/VG.md` (the picker),
`knobs.json`, `dna/GENOME.md`.
