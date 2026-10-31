# WEB-FACTORY — operator runbook

The Web Factory is a prd-herdr-driven stage pipeline that turns a typed
`NEW-WEBSITE` trigger into a launch-ready, owner-controlled Astro static
site. This document is the runbook: how a human and the trigger
understand the factory. It is the landing document the
`prd-website` skill pointer resolves to (PRD decision D1). Per-stage
mechanics live in the stage specs — this file cites them, it does not
copy them.

Authority: `PRD-Web-Factory-2026-10-30.md` (approved 2026-10-30,
decisions D1–D10, findings F1–F11). Stage specs: S1 + DISCOVERY live in
the prd-herdr checkout at `research/DISCOVERY-RESEARCH-web-factory.md`
and `research/WEB-FACTORY-S1-SITEMAP.md`; S2–S7 live in this repo at
`research/WEB-FACTORY-S<stage>-*.md`. Lane skills (what each lane's pane
loads at spawn): `skills/s<N>-<name>/SKILL.md`.

## Pipeline map S0 → S7

| Stage | Spec | Lane(s) | Reads | Emits |
|---|---|---|---|---|
| S0 Discovery | prd-herdr `research/DISCOVERY-RESEARCH-web-factory.md`; intake fields defined by `WEB-FACTORY-S1-SITEMAP.md` §Step 0 + PRD §5.1 | operator Q&A (boss-driven) | operator answers, Maps/GBP category lookups | `site/site-brief.md` |
| S1 Sitemap | prd-herdr `research/WEB-FACTORY-S1-SITEMAP.md` | one lane | `site-brief.md`, SERP (mandatory), GSC/Cora/entities/embeddings (degradable tiers) | `sites/<slug>/sitemap.md` (route-table authority) + `sites/<slug>/brief.json` |
| S2 Tone+plan | `research/WEB-FACTORY-S2-TONE-PLAN.md` | one lane | `site/sitemap.md`, `site/site-brief.md` | `site/tone-profile.md`, `site/content-plan.md` (+ `## Writer batches`) |
| S3 Writing | `research/WEB-FACTORY-S3-WRITING.md` | one `pi/WRITER`-bound lane per batch (`web-writer-<site>-b<N>`, ≤6 rows, money first) | `site/content-plan.md`, `site/tone-profile.md`, `site/site-brief.md` | `site/content/<slug>.md` — one file per plan row, one commit per page |
| S4 Interlink+cleanup | `research/WEB-FACTORY-S4-INTERLINK.md` | two lanes, strictly ordered: `web-link-graph-<site>` then `web-interlink-<site>` | `site/content/`, `site/content-plan.md`, `site/tone-profile.md` | `site/link-graph.md`, injected `site/content/*.md`, `site/content-final/`, `site/cleanup-report.md` |
| S5 Design→Astro | `research/WEB-FACTORY-S5-DESIGN-DNA.md` | two lanes, strictly ordered: `design-dna-<site>` then `web-build-<site>` | `site/content-final/`, `site/sitemap.md`, `site/site-brief.md`, `site/design/` (DOX ZIP) or `site/design/refs/`, `templates/astro/` | `site/design-dna/` (distill), `sites/<slug>/` Astro project (build, `astro build` exit 0) |
| S6 Integrations | `research/WEB-FACTORY-S6-INTEGRATIONS.md` | one lane `web-integrations-<site>` | `sites/<slug>/`, `site/site-brief.md`, `site/sitemap.md`, operator env (presence only) | `site/integrations.json`, `public/form.php`, `.htaccess`/nginx snippet + `public/_headers`, `.env.sample`, `site/INTEGRATIONS.md` |
| S7 Gate+deploy | `research/WEB-FACTORY-S7-GATE-DEPLOY.md` | one lane `web-deploy-<site>` (tweak loop inside it) | `sites/<slug>/`, `site/sitemap.md`, `site/site-brief.md` `## Deploy`, `site/design-dna/ROUTE-MANIFEST.json` | `dist/` (never committed), `site/seo-gate-report.md`, `site/deploy-report.md` + `## Seal`, live site |

## How `NEW-WEBSITE` lands

1. **Trigger.** The operator types `NEW-WEBSITE <site intent>` (spaced
   spelling `NEW WEBSITE` also routes). Per D1, prd-herdr owns exactly
   one `TRIGGER_ROUTES` row in `extension/gated.js` pointing the token
   at the web-factory intake flow, plus a thin `prd-website` skill
   pointer that resolves here. Everything else lives in this repo.
2. **S0 intake — structured Q&A.** The first question is **site class**
   (`local` | `national` | `ecom`). For `local`/`national` the brief
   must carry `gbp_primary_category` + `gbp_secondary_category`,
   discovered via the GMB extractor / SEO Time Machine method: search
   the niche's core keywords on Maps in the service area, open the
   top-ranked competitor listings, read their Top Categories, and pick
   the category closest to what the business actually does (these
   categories own one money route each — S1's category→route contract).
   The Q&A also collects entity facts, geography, competitor names,
   reference copy, contact destinations (`contact_email`,
   `contact_phone`, `notify_phone`), and the `## Deploy` target
   (`host_alias`, `user`, `docroot`, `url`). Output: `site/site-brief.md`
   — every fact downstream stages bind lives here; a fact the brief
   does not carry is omitted or flagged, never fabricated.
3. **S1 mints on the brief.** SERP research is mandatory — a lane whose
   manifest records `serp.ran: false` refuses. GSC/Cora/entities/
   embeddings are prompted-optional and degrade by name, recorded in
   the `research-inputs:` front-matter. Emits the `sitemap.md` route
   table: URL=H1=title-tag lock per row, closed `intent` and
   `page_class` sets, ancillary matrix per `site_type`.
4. **`ACCEPT SITEMAP` gate** (typed gate 1 of 2 — below). Nothing
   downstream mints until the operator accepts the map.
5. **S2 → S7 run the stages in order.** Every stage mint is
   precondition-gated on the producing stage's acceptance — row-count
   parity (`sitemap` ↔ `content-plan` ↔ `content/` ↔ `content-final/` ↔
   `ROUTE-MANIFEST.json` ↔ `dist/`) is the same invariant re-checked at
   every seam.
6. **`APPROVE SITE` gate** inside the S7 operator tweak loop (below).
   The seal in `deploy-report.md` is the factory's done.

## Typed human gates

Two, and only two (D3). Everything else is machinery.

| Gate | Position | Pauses | Operator sees | Mechanism |
|---|---|---|---|---|
| `ACCEPT SITEMAP` | post-S1, pre-S2 | S2 minting and everything downstream | `sitemap.md` + one-screen summary: route count by class, pillars, `research-inputs` manifest, dropped/redirected routes | `crew answer`-class decision row; edits apply as row edits and the map re-presents |
| `APPROVE SITE` | S7 operator loop, post-deploy | the seal | the live deployed `<url>` + `seo-gate-report.md` + `deploy-report.md` — the real site, not a diff | operator sign-off recorded in `deploy-report.md` `## Seal`; flips the lane to done |

## The `site/` shared-folder convention

All run-scoped artifacts ride the run's shared `site/` folder — the
artifact of record. Per PRD §5/F6: `site/` is **git-tracked** inside the
lane worktrees on the run's site branch — a review surface, not an
out-of-band blackboard. Visibility rule: a sibling lane sees a writer's
file after the writer's per-page commit *and* the coordinator's
collection point — **stage mint preconditions, not push events, are the
visibility contract**. No file has two writers: `write_paths` are
disjoint per lane, and the two genuinely shared artifacts
(`link-graph.md`, `cleanup-report.md`) are each owned by exactly one S4
lane.

**The OI-2 seam — `sites/<slug>/` vs `site/`.** S0/S1 artifacts land
under the site's own tree: the S1 spec writes
`sites/<slug>/sitemap.md` (+ `sites/<slug>/brief.json`), while S2–S7
read `site/sitemap.md`. These are the same file under the run-folder
convention — `site/` is the run-scoped alias for the site's artifact
tree. Where they physically differ (an S1 lane writing `sites/<slug>/`),
the **coordinator's collection point copies it into `site/` before S2
mints** — the copy is part of the `ACCEPT SITEMAP` → S2 mint
precondition path, not a convenience step. A lane that reads
`site/sitemap.md` and finds it absent is a collection-point failure:
escalate, never re-derive.

## Deploy contract

The deploy target is declared, never discovered. `site-brief.md`
carries a `## Deploy` section (S0 collects it):

```yaml
host_alias: <saved ssh alias>   # connect via `ProxyJump jump`
user: <site user>               # never root, never sudo-to-root
docroot: <absolute path>        # releases/ + current live here
url: https://<canonical origin> # canonical base for sitemap/OG/smoke
```

Deploy mechanics (S7, `research/WEB-FACTORY-S7-GATE-DEPLOY.md` §Steps
6–7): `rsync -az --delete --delay-updates` into a fresh
`releases/<UTC ts>/` directory, then `ln -sfn releases/<ts>
<docroot>/current` — atomic symlink flip; rollback is `ln -sfn` back to
the previous release. The lane prunes to the last 5 releases per deploy.
`dist/` is a build artifact, never source: `sites/<slug>/.gitignore`
carries `/dist/`, S7 rebuilds from a clean `dist/` unconditionally, and
both reports record the build's HEAD + timestamp so deployed bytes tie
to committed source.

## Failure / recovery — which stage re-mints on which failure class

| Failure class | Where it surfaces | Recovery |
|---|---|---|
| Brief has no extractable seed topics | S0→S1 boundary | S1 refuses `brief-intake-empty`; re-run the S0 Q&A — seeds are never invented |
| SERP tier did not run | S1 manifest | `serp.ran: false` refuses the S1 acceptance; re-mint S1 with the SERP fetch working |
| Operator edits requested | `ACCEPT SITEMAP` | edits apply as row edits; map re-presents until accepted — S2 never mints on a rejected map |
| Missing upstream artifact (`sitemap.md`, `site-brief.md`) | S2 lane start | `prd_step ask` naming the file; coordinator collection point (OI-2) owns the copy fix |
| Stale plan after an S2 fix | S3/S4 lane start | F10 plan-digest compare refuses the mint; S2 re-mints, then consumers re-mint and re-read the plan at lane start (never a cached copy) |
| Partial writer batch (lane crash) | S3 | re-mint the lane — written rows skip by non-empty-file check; stage gate checks row coverage, not per-lane coverage |
| S4 apply lane crash / double run | S4 | apply is idempotent (`present` short-circuit, `content-final/` rebuilt wholesale, strip→inject order fixed); re-run cleanly |
| DOX packet `target` ≠ `astro` or checksum mismatch | S5 mint | refuse at mint — re-export from Design-library; never retarget downstream |
| `integrations.json` row already `live` | S6 mint | refuse — re-wiring is a repair lane keyed on the same registry, not a re-mint |
| `astro build` non-zero | S7 step 3 | refuse; a red build goes back to the owning upstream stage as a defect — S7 never edits source to force a pass |
| SEO gate fail (13-check) | S7 step 4 | deploy does not run; findings row into `seo-gate-report.md`; fix lands via the tweak loop or upstream re-mint |
| Smoke fail after symlink flip | S7 step 7 | `ln -sfn` rollback to the previous release in the same step, then refuse — the host never sits on a broken `current` |
| Missing `## Deploy` section | S7 mint precondition | `prd_step ask` for the section; the lane never guesses a host |
| Tweak list grows into structure (new routes, replanned copy) | S7 operator loop | escalated back to the owning stage — S7 is a ~10% calibration loop, not a second writing stage |

## Open items this document tracks

| # | Item |
|---|---|
| OI-1 | `templates/astro/` vendored starter — required before any S5 run |
| OI-3 | Conformance patch S2–S5 (`type`/`page_class`, `utility`→`ancillary`, F5 CTA/Related wording, F9 graph-notes, `## Related` cap) |
| OI-5 | F10 plan digest (S2 emit, S3 record, S4 compare) |
| OI-7 | `tools/sitemap_lint.py` + `seo-gate` mechanical checkers — lints are prose checklists self-executed by lanes until the tools land |
| OI-8 | S1's two vendored deterministic modules under `lib/` |
