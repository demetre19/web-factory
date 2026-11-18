---
id: card-w2
type: card
wave: w2
links:
  uses: [rules-C, rules-G, rules-S, rules-M, rules-T, rules-R, rules-V, rules-P, rules-DNA]
  enforced_by: [check_direction_axes, check_genotype_distinct]
---

# W2 — Look & feel directions (Astro tiles → operator pick)

**GOLDEN RULE: ASTRO is the goal; TAILWIND is non-negotiable.** Each
direction option renders as an Astro tile inside `site/`
(`src/pages/look-<n>.astro`) using the W0 config + layer — no
standalone HTML, no second style source. (P.1, P.2)

**Read DNA map. Every decision traces to it.** The map (`DNA.json` + `DNA.md`) is the single source of coherence: every value used here must be traceable to it (`gate.py dna`).

## Job

1. Produce **≥2 direction options**, each a complete **genotype
   vector** drawn from the W1 profile's alleles (D.3). Options that
   differ in no gene are one option. Record them in the plan's
   `options:` block with one line per gene.
2. Fill `DESIGN-PLAN.md` `direction:` — temperature (C.2), density
   (G.3), finish, type_contrast (T.3), shape (S.1), motion (M.1) —
   plus `refused`, the generic default this direction replaces.
3. Render each option as a greyscale Astro tile: one grey ramp, real
   headings at correct ranks, true 1:1 scale at 1280/768/360,
   mobile-first min-width, G.1 spacing stops only, X-box media at the
   declared V.3 ratios. Colour, accent and real fonts are judged at
   W3, never here.
4. Every composition the site will use cites its Mobbin reference
   from `MOBBIN-REFS.md` (P.14) on the option it appears in.
5. Operator picks one option; the pick is recorded with
   `--design <option-id>` and stored in `GATES.json`.

## Rules that apply

- **D.3** options are distinct genotype vectors from one profile.
- **C.2** temperature axis; **G.3** density axis; **S.1** shape
  personality; **M.1** motion personality; **T.3** type contrast.
- **P.3** every tile section carries `data-sec`, `data-comp`,
  `data-ratio`, `data-disclosure` — the W5 lock diffs these.

## Exit gate

```bash
python3 tools/design-gate/gate.py w2 <pipeline-dir> --design <option>
```

Checks: axes ∈ closed enums, `refused` named, ≥2 options with distinct
genotype vectors, tiles built by `astro build`, sections carry all four
`data-*` attrs. Then `--approve` records the pick.

## Done when

`GATES.json.w2.approved` is true, `design` names the picked option, and
`CHECKLIST/w2.md` has no blank evidence (P.9).
