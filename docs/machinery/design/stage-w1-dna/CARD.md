---
id: card-w1
type: card
wave: w1
links:
  uses: [rules-P, rules-DNA, rules-T, rules-C, rules-L, rules-G, rules-S, rules-I, rules-V, rules-M, rules-R, rules-W, rules-E]
  enforced_by: [check_mobbin_auth, check_design_mode, check_intent, check_audit_artifacts, check_genotype]
---

# W1 — DNA + audit (intake, evidence, vertical profile)

**GOLDEN RULE: ASTRO is the goal; TAILWIND is non-negotiable** — W1
decides nothing about markup; it produces the evidence and the
genotype every later Astro artifact binds. (P.1)

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
