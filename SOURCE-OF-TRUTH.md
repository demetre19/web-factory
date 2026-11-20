# Web Factory — Source of Truth

> DRAFT — init-repo drafted this charter from the repo census. Approve the `charter-approve-Web Factory` fleet decision row to publish `.prd/profile.json` `source_of_truth` and ratify `IDEALS.md`; `deny` settles both absent.

## Purpose

Web Factory is a javascript (4), typescript (3) codebase laid out as `.`, `audit`, `handoffs`, `plans`, `reports`. Its most-referenced symbol is `site`, which names the load-bearing surface. Entered through `templates/astro/.astro/content.d.ts` (top-ranked module).

<!-- charter-measured:begin -->

## Current shape

<!-- measured by init-repo's repo census; `crew init-repo --apply` regenerates this block — hand edits inside the markers are lost. -->

- Files: 99 (7 source, 30 symbol definitions across 2 file(s))
- Languages: javascript 4, typescript 3
- Tests: 1 file(s) under `tests/`
- Docs: 46 markdown file(s), 0 decision record(s)
- Top-level dirs: `.` 3, `audit` 11, `handoffs` 2, `plans` 16, `reports` 1, `research` 26, `skills` 8, `templates` 26, `tests` 1

Top modules (reference-graph PageRank):

- `templates/astro/.astro/content.d.ts` — rank 0.421026, 2 referencing file(s)
- `templates/astro/src/site.ts` — rank 0.274251, 2 referencing file(s)
- `templates/astro/.astro/types.d.ts` — rank 0.101574, 0 referencing file(s)
- `templates/astro/astro.config.mjs` — rank 0.101574, 0 referencing file(s)
- `templates/astro/tailwind.config.mjs` — rank 0.101574, 0 referencing file(s)

Most-referenced symbols:

- `templates/astro/src/site.ts:37` `site` — 2 referencing file(s)
- `templates/astro/.astro/content.d.ts:140` `reference` — 1 referencing file(s)
- `templates/astro/.astro/content.d.ts:136` `render` — 1 referencing file(s)

<!-- charter-measured:end -->

## Invariants

1. `tests/` is the test surface (1 file(s) measured) — new behavior lands with a probe there, not untested code
2. the test gate argv is `python3 -c import json, pathlib; json.loads(pathlib.Path('.prd/profile.json').read_text())` (measured: `.prd/profile.json` argv `test`) — a change is green only against that probe
3. the generated layer `docs/machinery/` is derived output — it regenerates, never hand-edits

## Authority & Escalation

- This file is the enforced charter: `.prd/profile.json` `source_of_truth` pins the operator-approved sha; mint gates refuse work that contradicts it, and after publish the content is append-only through verified lands (`Source-Of-Truth:` trailer).
- `## Current shape` is measured, never ratified by hand — `crew init-repo --apply` regenerates it and `--check` reports `charter-measured-drift` when it disagrees with the tree.
- The ideal-state dossier `IDEALS.md` is declared, not enforced — it changes by operator edit or a decision row.
- Operator rulings are recorded under `docs/decisions/`; the `charter-approve-*` decision row is the record for this file.

## Ideal direction

The test surface tracks the source surface — today, 1 test file(s) vs 7 source file(s). No single module carries the system — today, `templates/astro/.astro/content.d.ts` tops the reference-graph rank (2 referencing file(s)) — hotspot concentration. The charter stays honest — today, `## Current shape` drifts every commit it is not regenerated for.


## Out of Scope

This charter does not cover: not a policy venue — no decision records measured; not a javascript, typescript framework — the tree carries application code, not tooling.


## The ideal

The direction this project moves toward lives in `IDEALS.md` — the declared ideal state (decision 0138). That file is a direction, not a law: a land may move the repo toward it; the enforced half is this file.

## Open questions

- Confirm the top-module ranking reads right — the PageRank order in `## Current shape` is what the boss will assume is load-bearing.
