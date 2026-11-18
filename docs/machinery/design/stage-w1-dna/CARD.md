---
id: card-w1
type: card
wave: w1
links:
  uses: [rules-P, rules-DNA, rules-DM, rules-T, rules-C, rules-L, rules-G, rules-S, rules-I, rules-V, rules-M, rules-R, rules-W, rules-E, dna-map, image-brief]
  enforced_by: [check_mobbin_auth, check_design_mode, check_intent, check_audit_artifacts, check_genotype, check_mobbin_refs, check_image_discovery, check_dna, check_dna_fresh]
---

# W1 — DNA + audit (intake, evidence, vertical profile)

**GOLDEN RULE: ASTRO is the goal; TAILWIND is non-negotiable** — W1
produces the evidence, genotype and **DNA v0 map** every later Astro
artifact binds. Discovery writes no map; it exits at W1. (P.1, LAW.DNA)

## Job

1. **Mobbin first.** `~/.mobbin-oauth/refresh.sh` → auth 200, then read
   references for the site's class. `MOBBIN-REFS.md` is a table
   `| id/url | kind | informs | wave |` with **≥3 general-style refs
   per planned page type** (per-composition cites come at W5, P.14).
2. `DESIGN-PLAN.md` `site:` block — slug, date, `design_mode` ∈
   DESIGN-INTAKE enum, `sources` provenance, `intent {who, one_action,
   worst_case}`. Discovery batch: operator likes/dislikes/comparison +
   example sites → DNA `constraints`.
3. **Image discovery.** Run `templates/image-brief/CLASSIFY.md` on every
   client/reference image (any medium incl. drawings, flat colour, 3D,
   UI screenshots); `UI-ANALYSIS.md` on reference screenshots. Write one
   `discovery/<domain>/meta.json` per analysed site to
   `patterns/data/web/meta.schema.json` — `capture_status` first:
   **blocked/blank/error/parked captures are dropped, never classified**
   (WAF challenge, HTTP ≥400, near-uniform tiles, parked domains).
4. `dna.profile` = `profile-<vertical>` from `dna/`; genotype = one
   allele/gene from that profile's `uses_genes` → plan `dna:` (D.1, D.2).
5. On `audit-remodel`/`refs-existing`: `audit.md` defect table against
   the QA sections (T.8…E.4, PS.1–6) + T1 keep-list (V.6).
6. **DNA v0 at exit** (`gate.py dna`): invariants verbatim
   (`extracted`); likes/dislikes → `constraints` (`chosen`); vertical
   profile + genotype/knob medians from nearest proven genotypes
   (`patterns.py search`; range = IQR clipped to SOP bounds; provenance
   `{tag, patterns, n}`); `vector_targets` 0–10 from rating gaps;
   `inferred.image_set` = the discovery set-summary (dominant medium,
   emotion axes/tags, style, consistency) — **inferred until the
   operator confirms at W1 exit**.

## Rules that apply

P.14 Mobbin evidence · D.1/D.2 genotype+profile · E.1 STUB vector ·
V.6 keep-list verbatim · references promote into the pattern corpus
via the same meta schema.

## Exit gate

```bash
python3 tools/design-gate/run.py w1 <pipeline-dir> --stub <stub.md>
```

W1 fails when images exist without classification, a meta.json misses
`capture_status: ok`, MOBBIN-REFS rows <3/page-type, genotype/profile
invalid, or the discovery is not operator-approved
(`run.py approve w1`).

## Done when

`GATES.json.w1.pass` + operator approval (W1 is decision point 1) and
`CHECKLIST/w1.md` has no blank evidence (P.9).
