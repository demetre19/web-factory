---
id: card-w1
type: card
wave: w1
links:
  uses: [rules-P, rules-DNA, rules-DM, rules-T, rules-C, rules-L, rules-G, rules-S, rules-I, rules-V, rules-M, rules-R, rules-W, rules-E, dna-map]
  enforced_by: [check_mobbin_auth, check_design_mode, check_intent, check_audit_artifacts, check_genotype, check_dna, check_dna_fresh]
---

# W1 — DNA + audit (intake, evidence, vertical profile)

**GOLDEN RULE: ASTRO is the goal; TAILWIND is non-negotiable** — W1
decides nothing about markup; it produces the evidence, the genotype
and the **DNA v0 map** every later Astro artifact binds. (P.1, LAW.DNA)

**Read DNA map. Every decision traces to it.** Discovery writes **no**
map; the map is created at W1 **exit** from what discovery found.

## Job

1. **Mobbin first.** Run `~/.mobbin-oauth/refresh.sh`, confirm the
   Mobbin MCP `initialize` returns 200, then read references for the
   site's class. Record every reference in `MOBBIN-REFS.md` (≥1 row
   per composition the site will use, P.14). Reference reading happens
   here, not after the design is drawn.
2. Write `DESIGN-PLAN.md` `site:` block — `slug`, `date`,
   `design_mode` (∈ DESIGN-INTAKE enum), `sources` with provenance
   (`live:` URL, `copy-contract:` STUB, `wireframe:` card file,
   `refs/` rows), and `intent {who, one_action, worst_case}`. `who` is
   a noun phrase for the reader, `one_action` one verb.
3. **Infer the vertical DNA profile.** Pick `dna.profile` =
   `profile-<vertical>` from `dna/` (`services`, `saas`, …), then
   derive the site's genotype: one allele per gene in
   `dna/GENOME.md`, every allele drawn from that profile's
   `uses_genes` set. Write it to the plan's `dna:` block (D.1, D.2).
4. On `audit-remodel` / `refs-existing`, run Phase 0: defect table
   against the QA sections (T.8, C.7, L.13, S.8, I.8, V.8, M.8, R.8,
   W.10, E.4, PS.1–PS.6) with a citation per defect, plus the
   keep-list of T1 assets (V.6) — `audit.md`.
5. Collect the rhetoric order (8-act enum, SECTION-CATALOG §1) and the
   operator's `disclosure` density pick. Ordering happens at W5.
6. **Create DNA v0 at W1 exit** (`DNA.json`, `version: 0`, rendered
   `DNA.md` — `gate.py dna`). It is built from discovery outputs only:
   - **invariants bind verbatim** (accent, logo, brand fonts,
     photography, tone) with `provenance.tag: extracted`;
   - **likes/dislikes become constraints** (`provenance.tag: chosen` +
     reason);
   - **vertical profile** pulled from `dna/<vertical>` (genome
     statistics);
   - **genotype + baseline knobs seeded from the pattern library** —
     `patterns.py search` for the nearest proven genotypes; baseline =
     their **median**, allowed range = their **IQR clipped to the SOP
     bounds** (T.6, G.1, R.2); every seeded value records its source
     `patterns: [ids]` and `n` in `provenance`;
   - **vector_targets** set from the current-site rating gaps +
     vertical norms (ease of use, clarity, layout, typography, colour,
     rhythm, imagery, trust, conversion, SEO, mobile, speed, a11y).

   Every field is provenance-tagged; every genotype/knob value cites ≥1
   pattern ID or a logged reason. A guessed number at W1 exit is a
   FAIL (DM.1).

## Rules that apply

- **P.14** Mobbin evidence — authenticated, cited, ≥1 reference per
  composition, recorded in `MOBBIN-REFS.md`.
- **D.1** genotype total; **D.2** profile names and covers the
  genotype.
- **E.1** the STUB heading vector is the section list — audit against
  it, never rewrite it.
- **V.6** keep-list assets are reused verbatim downstream.

## Exit gate

```bash
python3 tools/design-gate/gate.py w1 <pipeline-dir> --stub <stub.md>
```

Checks: Mobbin auth + `MOBBIN-REFS.md`; `design_mode` ∈ enum; `intent`
fields non-empty; `audit.md` with defect table + keep-list on redesign
modes; genotype complete and profile-valid. Then `--approve`.

## Done when

`GATES.json.w1.pass` for current input hashes and
`CHECKLIST/w1.md` has no blank evidence (P.9).
