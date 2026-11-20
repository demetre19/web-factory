# Web Factory — Ideals

> DRAFT — init-repo drafted this ideal-state dossier from the same census that drafted the charter (decision 0138: this file is the declared what-should-be; `SOURCE-OF-TRUTH.md` is the enforced what-is). Rewrite freely — it is ratified with the charter by the `charter-approve-Web Factory` decision row; drift here is a finding, never a refusal.

## Vision

Web Factory is a javascript (4), typescript (3) codebase laid out as `.`, `audit`, `handoffs`, `plans`, `reports`. Its most-referenced symbol is `site`, which names the load-bearing surface. Entered through `templates/astro/.astro/content.d.ts` (top-ranked module) moving toward the test surface tracks the source surface and no single module carries the system.

## Ideal shape

1. The test surface tracks the source surface
2. No single module carries the system
3. The charter stays honest
4. Decisions are recorded, not remembered

## Gap from current → evidence

- **The test surface tracks the source surface** — 1 test file(s) vs 7 source file(s)
- **No single module carries the system** — `templates/astro/.astro/content.d.ts` tops the reference-graph rank (2 referencing file(s)) — hotspot concentration
- **The charter stays honest** — `## Current shape` drifts every commit it is not regenerated for
- **Decisions are recorded, not remembered** — 0 decision record(s) measured — policy rides the record

## Why each ideal is right

- **The test surface tracks the source surface** — a source tree that outruns its probes accumulates unverifiable behavior — the ratio is the early warning
- **No single module carries the system** — every change funnels through `templates/astro/.astro/content.d.ts` — splitting the seam keeps dispatch parallel and review local
- **The charter stays honest** — a stale charter misdirects dispatch — regeneration keeps the boss's map true
- **Decisions are recorded, not remembered** — unrecorded rulings evaporate — the record is what a later lane can appeal to

## How a worker measures progress

- **The test surface tracks the source surface** — the test/source file ratio trends up
- **No single module carries the system** — the top module's rank share trends down as seams split
- **The charter stays honest** — `crew init-repo --check` reports no charter-measured-drift
- **Decisions are recorded, not remembered** — every ruling lands a `docs/decisions/` entry
