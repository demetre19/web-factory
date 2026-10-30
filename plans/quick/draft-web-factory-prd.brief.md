# Brief — draft-web-factory-prd

## Goal

Author `PRD-Web-Factory-2026-10-30.md` at the Web Factory repo root — the
product-requirements document for the Web Factory: a prd-herdr-driven
stage pipeline that turns a `NEW-WEBSITE` trigger into a launch-ready
Astro static site. This PRD is the Stage-2 deliverable of the NEW-PRD
flow; every stage spec already exists and is landed — your job is the
synthesis, not new stage design.

## Write paths

- `PRD-Web-Factory-2026-10-30.md` (repo root, the sole deliverable)

## Inputs — read all of these first (repo: /Users/apple/Documents/DEV-WORK/Web Factory)

- `research/ADVERSARIAL-REVIEW.md` — cross-stage system review: P1
  findings F1–F5, P2 F6–F11, verdict + dispatchable actions. Fold
  surviving findings into the PRD's risk/open-items sections; F2/F3 are
  already patched on main (link-notation canon `(<row.path>)`).
- `research/WEB-FACTORY-S2-TONE-PLAN.md` — Stage S2 spec + `## Contested`.
- `research/WEB-FACTORY-S3-WRITING.md` — Stage S3 spec.
- `research/WEB-FACTORY-S4-INTERLINK.md` — Stage S4 spec + `research/link-graph.md` exemplar.
- `research/WEB-FACTORY-S5-DESIGN-DNA.md` — Stage S5 spec.
- `research/WEB-FACTORY-S6-INTEGRATIONS.md` — Stage S6 spec (just landed).
- `research/WEB-FACTORY-S7-GATE-DEPLOY.md` — Stage S7 spec (just landed).
- `research/content-plan.md`, `research/tone-profile.md` — schema exemplars.
- `RATIONALE.md` — per-stage plan rationales (why each spec exists).
- prd-herdr repo (/Users/apple/Developer/prd-herdr): `research/DISCOVERY-RESEARCH-web-factory.md`
  (build-new verdict + risks R1–R4) and `research/WEB-FACTORY-S1-SITEMAP.md`
  (S1 spec — lives in prd-herdr research/, cite it; the PRD must record
  that S0/S1 artifacts land under the *consuming run's* repo, not the
  factory repo — this is the F1/F4 resolution note).

## Locked architecture decisions (D1–D9 — the PRD restates these, do not re-open)

- D1: prd-herdr owns ONLY the `NEW-WEBSITE`/`NEW WEBSITE` trigger row in
  TRIGGER_ROUTES + a thin `prd-website` skill pointer; the web-factory
  repo owns everything else (stage specs, skills/, templates/astro/,
  sites/<slug>/, keys/ manifests, docs/machinery/WEB-FACTORY.md).
- D2: Pipeline is S0 discovery → S1 sitemap → S2 tone/plan → S3 write →
  S4 interlink+cleanup → S5 design→Astro → S6 integrations → S7 gate+deploy.
- D3: Two typed human gates only: `APPROVE SITE` (post-S5/S6) and
  `ACCEPT SITEMAP` (post-S1).
- D4: `pi/WRITER` role for content lanes (S3); never a model literal.
- D5: Vendored `templates/astro/` starter is the build base; DOX packets
  from the Design-library project are an optional input to S5.
- D6: Deploy = rsync to operator-configured host; rollback = previous
  dist snapshot.
- D7: SEO: SERP checks mandatory, GSC/Cora optional-integrations.
- D8: Per-site `RATIONALE.md` records every design/content decision.
- D9: Adversarial review of each stage spec is a required artifact.

## PRD required content

- Problem statement + build-new verdict summary (cite DISCOVERY R1–R4).
- The stage map above with per-stage one-paragraph contract summaries
  pulled from each spec's upstream/downstream contract sections.
- Gate model: the two typed gates + machinery gates per stage.
- Data/schema contracts: sitemap.md (owner: S1 — name the columns and
  closed `type` set so F1's missing-authority defect is closed by the
  PRD), content-plan.md, link-graph.md, site-brief.md.
- Adversarial-review fold: list F1–F11 with disposition (fixed on main /
  accepted-risk / deferred), incl. F5 precedence decision, F6 site/
  blackboard semantics decision, F10 plan-digest decision.
- Rollout: what the trigger row + skill pointer in prd-herdr must
  contain (single-line change surface).
- ## Falsifier — the sentence that, if true, kills this PRD
  (e.g. a cheaper existing primitive produces launch-ready sites).
- ## Scope census — enumerate ≥2 real repo paths this PRD covers:
  `research/`, `skills/` (to be created), `templates/astro/` (to be created),
  plus `extension/gated.js` TRIGGER_ROUTES in prd-herdr.

## Operator directives (2026-10-30, received post-spec — the PRD MUST carry these)

1. **Site-class intake** (local | national | ecom) is the FIRST discovery
   question; for local/national the brief requires `gbp_primary_category`
   + `gbp_secondary_category` discovered via the GMB extractor / SEO Time
   Machine method (search niche keywords on Maps, read top listings' Top
   Categories, pick closest-to-actual-business).
2. **Category→page contract**: homepage H1 = brand; each GBP category
   owns one money page (URL + H1 carry the category phrase); location
   pages = `<primary category> <suburb>` for the ~20 largest suburbs.
   Nav labels are shortened forms. Fluid typography (utopia-style
   clamp() scale) is mandatory site-wide — no breakpoint-stepped sizes;
   functional sexy mobile menu + full footer required.
3. These were patched into `research/WEB-FACTORY-S1-SITEMAP.md` (prd-herdr
   side, intake + matrix + category→route contract) and
   `research/WEB-FACTORY-S5-DESIGN-DNA.md` (fluid type + mobile menu/footer +
   label shortening) this turn — the PRD's stage summaries and the
   site-brief schema must reflect them, and the data-schema section must
   own the `gbp_*` brief fields and the `national` site_type.


## Done contract
elegance: {"rung": 3, "lower_rungs_rejected": {"r0": "no document exists to decline writing — rung 0 is 'do nothing', which fails the operator's APPROVE PRD gate outright", "r1": "hand-copying specs into the PRD duplicates them — the PRD must cite and synthesize, not fork", "r2": "a checklist-only PRD without the adversarial fold leaves known defects unrecorded at approval time"}, "trigger_kind": {"kind": "event", "predicate": "no PRD-Web-Factory draft exists for the operator to APPROVE PRD", "acted_by": "this lane"}}
`PRD-Web-Factory-2026-10-30.md` exists at repo root, covers every input
above, and ends ready for an `APPROVE PRD` typed decision.
