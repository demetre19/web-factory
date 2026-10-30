# Brief — web-factory-runbook-skills

## Goal

Author `docs/machinery/WEB-FACTORY.md` (the operator/runbook surface —
D1 names it the trigger's landing document) and `skills/<stage>/SKILL.md`
per-stage lane skills — OI-6. The runbook is how a human and the
prd-herdr trigger understand the factory; the skills are what each
lane's pane loads at spawn.

## Write paths

- `docs/machinery/WEB-FACTORY.md`
- `skills/s0-discovery/SKILL.md`, `skills/s1-sitemap/SKILL.md`,
  `skills/s2-tone-plan/SKILL.md`, `skills/s3-writing/SKILL.md`,
  `skills/s4-interlink/SKILL.md`, `skills/s5-design-dna/SKILL.md`,
  `skills/s6-integrations/SKILL.md`, `skills/s7-gate-deploy/SKILL.md`

## Runbook required content

- Pipeline map S0→S7 with each stage's inputs/outputs/owner spec —
  cite `research/WEB-FACTORY-*.md`, never copy them.
- How `NEW-WEBSITE` lands: trigger → S0 discovery Q&A (site class first;
  GBP categories for local/national) → the two typed gates
  (`ACCEPT SITEMAP`, `APPROVE SITE`) and exactly when each pauses the
  pipeline and what the operator sees.
- The `site/` shared-folder convention (git-tracked, mint-precondition
  visibility — PRD §5 F6) INCLUDING the coordinator collection point:
  S1 emits `sites/<slug>/sitemap.md`, S2–S7 read `site/sitemap.md` —
  the copy-into-`site/` seam (OI-2, one explicit paragraph).
- Deploy contract: `## Deploy` brief fields (`host_alias`, `user`,
  `docroot`, `url`), rsync + `releases/<ts>/` + `current` symlink,
  `dist/` never commits.
- Failure/recovery table: which stage re-mints on which failure class.

## Skills required content

Each `SKILL.md`: role (e.g. `pi/WRITER` for s3), upstream contract it
consumes verbatim, its write set, its acceptance/done criteria, and its
named failure modes — a pointer into the stage spec, not a copy.

## Done contract

Runbook exists and resolves OI-2; all 8 skill files exist, each
self-contained enough that a lane spawned cold knows its contract.

elegance: {"rung": 2, "lower_rungs_rejected": {"r0": "the NEW-WEBSITE trigger has no landing document and lanes have no skills — the factory cannot be invoked without them", "r1": "folding all docs into one giant README buries the per-stage contract boundaries the lanes scope-enforce"}, "trigger": {"supplied_by": "the admit pass reading the repo", "self_triggering": true, "observed_state": "docs/machinery/WEB-FACTORY.md and skills/ absent while the PRD marks them the trigger's landing surface"}, "follow": {"obliged_actor": "the boss session in workspace w57", "refusal": "prd-herdr's TRIGGER_ROUTES row must point at a document that exists — landing the trigger first would 404 the entry point", "bypass": [{"path": "docs/machinery/WEB-FACTORY.md is D1's named landing document", "closed_by": "the runbook existing"}]}, "census": {"searched": ["docs/", "skills/", "research/WEB-FACTORY-*.md"], "candidates_found": 0}}
