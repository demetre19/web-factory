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
| W0 scaffold | — | Astro + Tailwind project exists; DNA map file created empty |
| W1 brand DNA + audit + Mobbin | **draft** | Extracted assets (accent, fonts, imagery, tone) + inferred vertical profile + candidate genotype written, each value provenance-tagged |
| W2 look | **baseline chosen** | Look options = distinct knob vectors from the draft; operator pick → baseline knobs |
| W3 design system | **locked v1** | Baseline renders as the system sheet (light + dark); sheet passes gates → map locked, hash issued |
| W4 content | read | Content inventory checked against the locked map (nothing in content may require an off-map value) |
| W5 structure | read + rhythm plan | Page rhythm (surfaces, densities, contrast moment, motif) written INTO the map; wireframe lock |
| W6 components | read | Components bind only to map tokens/knobs |
| W7 page | read | Sections carry the map hash; mechanical glue |
| W8 review + variants | read + deltas | Variants = baseline + knob deltas; each variant renders its own system sheet first, then the page |

Any edit to a locked map bumps its version → hash changes → every
downstream artifact is stale → `run.py` rebuilds from the earliest wave the
edit touches.

## Shape (`<pipeline>/DNA.json`)

```json
{
  "version": 1,
  "hash": "<sha256 of canonical JSON minus this field>",
  "site": "whistleclean",
  "vertical_profile": "services/local-service",
  "genotype": { "<gene>": "<allele>" },
  "knobs": {
    "type.ratio": 1.25, "type.base": 17, "type.display_weight": 700,
    "type.tracking_display": -0.02, "space.density_scale": 1.0,
    "space.section_py": { "compact": 48, "regular": 72, "spacious": 112 },
    "grid.gutter": 24, "radius.personality": "p3", "color.surface_contrast": 0.06,
    "color.accent_usage": "cta+motif", "color.neutral_tint": 0.06,
    "elevation.level": 1, "motion.level": "subtle", "image.treatment": "natural"
  },
  "modes": { "light": { "<role>": "<token>" }, "dark": { "<role>": "<token>" } },
  "extracted": { "accent": "#00B488", "accent_deep": "#166F64" },
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
1. DNA map missing, incomplete, or not locked by W3 exit.
2. Any artifact's recorded DNA hash ≠ current map hash.
3. Any token, knob, allele or colour used that is not in the map.
4. A variant's knobs are not `baseline + declared deltas`, or a delta is out of range (wildcard may exceed stylistic knobs only, per BX rules).
5. A variant page exists without its own passing system sheet.
6. A section deviates from the map's rhythm plan.
7. Light or dark mode missing for any role.
