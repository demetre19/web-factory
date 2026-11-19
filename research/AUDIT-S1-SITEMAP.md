# AUDIT-S1-SITEMAP — adversarial audit of stage S1 (brief → accepted sitemap.md)

Lane: `AuditSitemap` · 2026-11-02 · class: `web-factory-module-audit`.
Sister document to `research/ADVERSARIAL-REVIEW.md`; same posture —
self-review sections read but not trusted, every claim line-cited or
marked `[INFERENCE]`. The S1 corpus is unusually well-evidenced
(Appendix E is all live AU fetches); the findings below are therefore
mostly *contract* defects, not evidence defects.

## 1. Scope audited

| File | Role |
|---|---|
| `research/WEB-FACTORY-SITEMAP-SOP.md` (SOP, 575 lines) | The 10-step executable recipe under audit |
| `skills/s1-sitemap/SKILL.md` | The lane-facing stage contract |
| `PRD-Web-Factory-2026-10-30.md` §5.2 (:121–137), §4.1 S0 row (:80–81) | `sitemap.md` schema of record; site_type vocabulary |
| `/Users/apple/Developer/prd-herdr/research/WEB-FACTORY-S1-SITEMAP.md` (S1 spec, 340 lines) | Stage spec — 11-step pipeline, M1–M9, matrix, Contested |
| `research/WEB-FACTORY-LOCATION-PAGES.md` §3–7 | Location-cluster deltas D1–D6, D2 gate, `page_class: location` |
| `research/WEB-FACTORY-S2-TONE-PLAN.md` :111–138 | `word_target` provenance check |

Module boundary: intake of `site-brief.md` → SERP/competitor/volume
research → `sites/<slug>/sitemap.md` + `brief.json` + `competitors/<slug>/`
scratch → `ACCEPT SITEMAP`. Everything after the gate (S2 plan) is out
of scope except the contracts S1 owes it.

Live verification this audit ran: `curl https://gobox.com.au/sitemap.xml`
→ 301 → `<sitemapindex>` with `post-sitemap1`, `page-sitemap1`,
`sa-sitemap1`, `vic-sitemap1`, `product_cat-sitemap1` children
(fetched 2026-11-02) — re-verifies SOP E2's state-partitioned index
and the census feasibility claim.

## 2. Current contract

| Direction | Artifact | Shape today |
|---|---|---|
| In | `site/site-brief.md` (S0) | `site_type`, `geo`, `gbp_primary/secondary_category`, `seed_topics`, `brand`, `competitors`, existing-site URL (SOP §Step 1 :44; PRD :119) |
| In | optional tiers | existing-site sitemap.xml, GSC, Cora, entities, embeddings, DataForSEO (SKILL.md tiers table :30–39; SOP Steps 6–7) |
| Out | `sites/<slug>/brief.json` | structured intake, first commit (S1 spec Step 0 :34) |
| Out | `sites/<slug>/sitemap.md` | YAML front-matter + `## Topical map` + `## Route table` (PRD §5.2 :123) |
| Out | `competitors/<slug>/` scratch | `serp.jsonl`, per-domain sitemap dumps, `competitor-N.txt`, `volumes.json`, `candidates[]` (SOP Steps 3–6) |
| Out | `research-inputs:` manifest | `{ran, reason}` per tier — gate-visible (SOP Step 9 :368–384) |
| Gate | `ACCEPT SITEMAP` | one-screen: route counts, manifest, coverage table, merges, drops (SOP Step 10 :388–402) |

## 3. Discovery-question expansion

The question bank the stage must be able to answer, by operator theme.
"Answering surface" = where the answer lands today, or **GAP**.

### Theme 1 — source & authenticity
| Question | Surface today |
|---|---|
| Where do seeds come from? | GBP categories verbatim + `seed_topics` unedited + geo as operands (SOP Step 1 :50–58). ✓ |
| How is fabrication prevented? | `brief-intake-empty` refusal (SOP :65–66, S1 spec :42); every row traces to kw_group←queries←SERP rows. ✓ structurally |
| Is the brief's `service_area` available? | **GAP — F3.** Location spec Phase A Step 1 requires `service_area`/`depot_address` from the brief; S0's field list (PRD :119) does not name it; SOP Step 1 doesn't read it. |

### Theme 2 — classification
| Question | Surface today |
|---|---|
| Intent taxonomy closed? | Query-level `intent_label` from modifier grammar (SOP :86–97) + row `intent` closed set (PRD :129). Both exist — **but the SERP-result-level classification (top-3 per query, classified by intent/page-type) does not exist — F1.** |
| Product vs service? | Ancillary matrix keys (`local-service`/`ecommerce`, S1 spec :122–129) imply it; site_type vocabulary itself is broken across three sources — **F5.** |
| Local vs national? | SOP Step 1 :69–70 parameterises geo operands per site_type; assumption A1 (:446) maps `national` — **contested by evidence, F6.** |
| Who ranks for each query class? | Per-cluster mining pool (SOP Step 3.4 :138–144) — ✓ this is real and evidence-backed (E1 cost-cluster divergence). |

### Theme 3 — competitor census
| Question | Surface today |
|---|---|
| Total page count per domain? | Step 5.2 enumerates + counts per child sitemap (:182–184). ✓ |
| Money/article/location/ancillary split? | Step 5.3 taxonomy table + 5.4 histogram (:186–200). Mechanically specced — **but only as a "gate table", never a structured evidence artifact — F2.** |
| What page formulas win? | Step 5.5 title/H1 extraction (:201–206). ✓ |
| How big are the winning pages? | **GAP — F4.** No word-count or module-count sampling anywhere in the corpus. |

### Theme 4 — SERP stats
| Question | Surface today |
|---|---|
| Demand/volume per keyword? | DataForSEO tier + T2–T5 degraded order (Steps 6–7). ✓ well-specced |
| Are location leaves SERP-proven? | D2 exists in the location spec (§5); SOP does not operationalise it — **F3.** |
| Freshness-sensitive intent? | S1 spec fans `+year` (spec :58); **SOP grammar silently dropped it — F7.** |

## 4. Gap findings

Ordered by severity. Deltas vs the location spec are consolidated under F3.

### F1 — blocker — SERP-result classification is absent; queries are labeled *a priori* by template, results never classified

Operator theme 2 requires: top-3 results per query classified by
intent; the cluster structure falls out of evidence. What the SOP does
instead: each query gets an `intent_label` **from its modifier
template** (SOP :86–97 — a query built by the `cost` template is
declared `transactional` before anything is fetched), then Step 4.5
labels clusters by majority vote of those *assigned* labels (:164–166).
`serp.jsonl` (:123) records `{query, position, url, domain, title,
snippet}` — no per-result `intent` or `page_type` field exists.

Consequences:
- The intent signal the gate and M7's money/article derivation rest on
  is the lane's own template assumption — circular evidence. A
  `best X` query whose SERP returns 10 money pages is labeled
  `comparison` because the template says so.
- M4's Jaccard-URL clustering (:154–156) is evidence-based, but the
  *semantic reading of the SERP* (is the winner a location leaf? a
  directory? an article?) is never recorded — so the "cluster
  structure falls out of evidence" goal is half-implemented: geometry
  yes, semantics no.
- The D2 location gate (F3) literally cannot run without it — it needs
  "dedicated leaves in top-10" counts, which is exactly per-result
  classification.

Fix surface: add `result_intent` + `result_page_type` to `serp.jsonl`,
define the closed classification taxonomy (see §6 `serp_classify.py`),
and make Step 4.5 vote on *observed* result intents, with
template-label as tie-break only.

### F2 — blocker — `page_class: location` collides with the closed set; three vocabularies disagree

- PRD §5.2 :131 — `page_class` closed set is **`money | article |
  ancillary`**. §5.2 is the schema of record; the S1 spec's own
  projection note (D10, PRD :39) makes `content-plan.md`'s `type`
  field consume it.
- Location spec §7 (:322) — **deltas the closed set to
  `money|article|ancillary|location`**; leaf rows `page_class:
  location`, `parent: /service-areas/` (Phase B Step 7 :270–272). Also
  makes location leaves "money-class in balance/orphan rules" at S4
  (§6 Step 11 :301).
- SKILL.md :49 — still emits the pre-delta closed set `money|article|
  ancillary` and never mentions `location`.
- The SOP's Step 8.3 intent→class map (:315–317) has no `location`
  branch — `local` intent → `money` under current rules, which would
  mint suburb leaves as *money* rows, the wrong class for the
  location-module contract.

This is F1-class (ADVERSARIAL-REVIEW's "consumers quote an unwritten
grammar") re-incarnated one column over: the schema of record, the
module spec, and the skill each assert a different closed set. Until
PRD §5.2 is amended, every `page_class: location` row fails the
sitemap_lint contract the PRD declares (:137).

Also broken by the same delta: PRD D10's `type = page_class` mapping
has no `location` → plan-`type` rule; S2's `type` vocabulary and S5's
`type`→template mapping silently exclude it (location spec §7 names
the S2/S5 deltas but the PRD-side conformance is unrecorded).

### F3 — major — the four location deltas are never reconciled into S1's contract (named deltas)

The location spec deltas (§7 :322) exist; neither SKILL.md, the SOP,
nor the S1 spec absorbed them. Each delta is independently
load-bearing:

- **D1 slug shape.** SKILL.md :52–54 says location pages = `<primary
  category> <suburb>` for ~20 suburbs "under `/service-areas/`"; PRD
  :81 repeats it. Location spec D1 (:156–159) says **`local` site →
  flat `/<kw>-<suburb>/` leaves + `/service-areas/` as the *index*
  row** (`page_class: ancillary` per Phase B Step 3 :249 — note:
  *index* is ancillary, *leaves* are location; the SOP must not conflate
  them). Folder-form leaves are legal only as
  `/service-areas/<suburb>/` (D6 :161–165). Current docs mint the
  wrong URL shape for single-city sites.
- **D2 gate.** SOP/S1/SKILL all use "≥2 competitors rank a dedicated
  location page" (SKILL.md :54, SOP :341–342, S1 spec Contested 5
  :330). Location spec §5 :196 sharpens to **≥2 dedicated leaves in
  top-10 on ≥3 sampled `"<service> <suburb>"` queries, recorded by the
  SERP tier**. The SOP never operationalises the sharpened form:
  `geo_suburb` queries exist in the fan-out grammar (:90) so the data
  *is* fetched — but no step counts dedicated leaves per SERP, and no
  field records `cluster-evidence` (which the location spec parks in
  `status` — itself a violation of the closed `status` enum, F8).
- **Suburb selection.** "~20 largest by population" (SKILL.md :53;
  SOP :343 ranks `suburb_list` by population) is **replaced** by D2's
  union rule — observed-location-SERP suburbs ∪ `service_area`, each
  passing a ≥2-fact test, capped at **25 leaves** (spec §5
  :199–213). SOP's "≤10 location rows per kw_group" (:341) is a
  *different* cap on a *different* axis (per-cluster vs
  per-location-cluster) — both can hold, but nobody says so.
- **D6 folder names.** `service-areas` (or niche term) is the only
  legal leaf folder; `areas`/`locations`/`suburbs` refused
  (:161–165). No SOP/SKILL text knows this rule — a lane following
  current docs could mint `/areas/…` and pass today's lint contract.

Resolution path: PRD §5.2 amendment lands `location` in the closed
set + a `## Location cluster` block in sitemap.md (index row +
leaf rows + `cluster-evidence` field); SKILL.md and SOP Step 8.7 are
replaced by D1/D2/D6 verbatim.

### F4 — major — winner-page sizing is entirely missing; `word_target` is a static default

Operator theme 3 ("match the call, not a floor"): no step in the SOP
or S1 spec samples SERP winners' **word counts, H2/H3 counts, or
module inventories**. Step 5.5 fetches 2–4 pages per family for
`<title>`/`<h1>` regex only (:201–206); Semantic Writer's body
extraction exists in the port plan (S1 spec Step 3 :67) but the
extracted text is mined for keywords/headings, never measured for
size. Downstream, `word_target` is a **static band** — money 800–1200,
article 1200–1800, ancillary ≤400 (`WEB-FACTORY-S2-TONE-PLAN.md:128–129`)
— with no input column from S1 to deviate against except a "note".
The factory as specced cannot answer "how long should this page be"
from evidence; it answers from a hardcoded floor — precisely the
anti-pattern the operator named.

Fix surface: extend the per-family fetch in Step 5.5 to record
`{word_count, h2_count, h3_count, module_signals[]}` per fetched
winner; emit a `site/serp-sizing.json` (or columns on the query-map —
§5 proposal); S2 consumes per `kw_group` to override `word_target`
with `median(winner words) × 1.0–1.2` `[INFERENCE — multiplier is a
design choice]`.

### F5 — major — `site_type` has three non-identical vocabularies; `national` is un-owned

- S0 (PRD :80, :119): `local | national | ecom`.
- S1 spec Step 0 (:36) + matrix (:122–129): `local-service |
  ecommerce | content-authority | portfolio | nonprofit | brochure`
  — six values, none named `national`.
- SOP A1 (:446): maps `national` → `local-service` minus
  `/service-areas/`, flagged as an assumption.

A1 is **evidence-wrong, not merely unmapped**: SOP E2 (:519–520) is a
national niche where winners run 81- and 236-leaf location clusters —
stripping `/service-areas/` and location leaves from `national` is
exactly backwards. The location spec independently declares
`/<city>/<suburb>/` nested as the `national`/multi-city default (D1
:152, :158–159). So `national` needs its own matrix row *and* its own
location-cluster contract; A1 should be promoted from assumption to
named delta and rewritten.

### F6 — major — the census is a gate ornament, not an evidence artifact

Step 5.4 emits "a histogram" (:198–200) and Step 10.3 renders a
"coverage table" at the gate (:394–396) — but no structured census
file is in the write set. The manifest records only
`{domains, urls_seen}` (:374). Operator theme 1's census (total pages,
split money/article/location/ancillary, *researched live not guessed*)
needs a durable, diffable, lint-consumable artifact — today the split
exists only in whatever prose the lane writes at the gate, so a
re-run can't verify it and downstream stages can't consume it.

Fix surface: `competitors/<slug>/census.json` — one row per
`{domain, child_sitemap, class, count}` + `totals` block + the
`title_patterns[]` per family; manifest records
`census: {ran, domains, urls_seen, rows}`.

### F7 — major — SOP modifier grammar silently replaces the S1 spec's fan-out classes

S1 spec Step 2.1 (:58) fans seeds by: exact, **+year** (freshness),
vs-alternative, best-of, modifier, **price, delivery/service-area,
use-case**. SOP :86–97 mints a different set: exact, geo_head,
geo_suburb, service_variant, cost, how, best, vs, near_me,
brand_generic. Silently dropped: **`+year`** (the freshness probe —
S1 spec M2 :185 explicitly cites it as the mechanism that catches
fresh intent), **use-case** (the module-shaping class — storage
niches' `moving`, `business` families in E2 came from use-case
intent), and **delivery/service-area** as a class (partially absorbed
by geo_*). `vs` survived but `brand_generic` is new. The SOP's own
§10.5 changelog (:463–467) claims it only "added the explicit
modifier grammar" — it does not disclose the class substitutions.
Either restore the dropped classes (the grammar is order-truncated,
so additions are cheap) or record the substitution as a §10 delta
with rationale.

### F8 — minor — `cluster-evidence` parked in `status` violates the closed enum

Location spec Phase A Step 2 (:243–244) records
`cluster-evidence: n competitors` **in `status`**; `status` is a
closed transition enum `planned → accepted → written → linked →
built → live` (PRD §5.2 :135). A `status` cell carrying evidence
breaks every stage's status-stamp logic. Put it in the manifest
(`research-inputs.location-gate: {samples, passes}`) or a `## Notes`
row — one line fixes it; currently it's a schema landmine.

### F9 — minor — T3 (PAA/related-searches) is in the fallback table but no step fetches it

Step 7's tier table (:290–296) lists T3 as harvesting PAA/related
blocks via tinyfish — but no pipeline step actually performs the
Google-results-page fetch needed to populate it (Step 3 fetches via
DDG/tinyfish *search API*, which doesn't return PAA blocks; the table
concedes this needs a separate `fetch_content` on a results page).
As specced, T3 will always report `ran: false` — a dead tier listed
as live machinery. Either spec the harvest step (per-seed one fetch —
cheap) or drop T3 to the Contested list.

### F10 — minor — the YAKE/PMI/heading/entity machinery is spec'd (S1 Steps 4–5) but SOP-silent

S1 spec Steps 4–5 (:70–89) define YAKE aggregation, PMI co-occurrence,
heading mining, KG/Wikipedia entities — all named in SKILL.md's tier
table — and the SOP never schedules them. The manifest block records
`entities`/`cora`/`embeddings` but no `yake`/`pmi`/`headings` rows.
The SOP's §10.5 "kept verbatim" list (:460–462) doesn't mention them,
so a lane running the SOP literally skips the entire content-extraction
research tier except title/H1 regexes. Either the SOP needs a Step
4b ("extraction tier — YAKE/PMI/headings/entities per S1 spec") or a
§10 delta saying they're folded into `serp.jsonl` processing.

## 5. Split / sub-module proposal

S1 stays one lane (the SOP is sequential and cache-dependent); the
split that pays is **artifact-level**, not lane-level:

1. **`site/query-map.md` — new first-class artifact (proposed).** The
   query network the SOP already builds but never publishes: every
   fan-out query with `{seed_id, modifier_class, intent_label,
   observed result intents, kg_id}` + the kw_group table + per-cluster
   owning domains + the census references. This *is* the
   Koray-style topical/semantic query network — currently it exists
   only as scratch (`serp.jsonl`, `kw_groups[]`) that evaporates
   post-gate. Consumers: S2 (heading skeletons from query classes,
   `word_target` from sizing), S3 (semantic-writing keyword context),
   S4 (sibling-edge evidence from shared-entity clusters), the gate
   (correctable cluster view). Cheap to emit — it's a rendering of
   Step 4 outputs, not new work. Add to write_paths.
2. **`competitors/<slug>/census.json`** (F6) — structured census rows.
3. **Census+extraction sub-skill** — Steps 3–5 are mechanically
   separable from Steps 6–9 (assembly judgment). If lanes ever split
   at >64 queries (:112–115), the seed-split seam should split at
   Step 5's end (each sub-lane emits query-map + census fragments;
   the merging lane assembles) rather than mid-assembly — the current
   "split by seed, merge at gate" (:115) doesn't say which artifact
   merges, and `query-map.md` is the natural merge unit.
4. **Sizing pass** — F4's extraction rides on the Step 5.5 fetch (no
   new fetch budget); make it a named sub-step so it isn't dropped.

## 6. Automation surface

Every automatable check, with proposed contracts. All read-only,
deterministic, exit 0/1/2 (ok / lint-fail / degraded).

### `tools/serp_classify.py` (new — closes F1)
- **In:** `serp.jsonl` path. **Out:** same file with `result_intent`
  + `result_page_type` appended per row.
- **Contract:** classify each result by (a) domain-class table —
  directory/aggregator/social/wiki list (SOP :131–133) →
  `intent-evidence` not `competitor`; (b) URL-path patterns (Step 5.3
  taxonomy table reused) → `money-service | money-location | article |
  ancillary | product`; (c) title/snippet intent lexicon (cost,
  vs, how, near me tokens) → `result_intent` in the closed set.
  Deterministic regex+table only — no LLM call; ambiguous rows get
  `result_intent: unknown` and count in the manifest.

### `tools/competitor_sitemap.py` (stub named at SOP :454)
- **In:** domain list + out dir. **Out:** per-domain
  `census.json` fragment + `sitemap_urls.txt`.
- **Contract:** robots.txt→`Sitemap:`→index-follow-one-level (generic,
  not filename-patterned — named failure mode :411–413); 500-URL cap
  with prefix-histogram overflow (:183–185); URL→class bucketing via
  the :186–196 taxonomy; optional `--titles N` mode fetching N pages
  per family for `<title>`/`<h1>`/word-count/H-count (absorbs F4);
  emits `anti_bot: true` flag on <500-char/challenge responses
  (:214–215) instead of classifying from headers.

### `tools/kw_volume.py` (stub named at :455)
- **In:** keyword list + `DATAFORSEO_LOGIN/PASSWORD` env.
  **Out:** `volumes.json` `{keyword, search_volume, monthly_searches[],
  competition, cpc, cost_usd}`.
- **Contract:** batch ≤1000 kw/call (`search_volume/live`), 12 rpm
  pacing; `--suggest-site <domain>` / `--suggest-kw` modes for the two
  suggestion endpoints; env absent → exit 0 writing
  `{ran: false, reason: "no credentials"}` so the manifest is honest;
  never prints key material; logs real `cost` per task.

### `tools/sitemap_lint.py` (OI-7 stub; contract extension)
- **In:** `sitemap.md` path (+ optional `query-map.md`,
  `site-brief.md`). **Out:** exit 0 / nonzero with line-level errors.
- **Contract (union of PRD §5.2 :137 + location deltas + new fields):**
  front-matter parses; `research-inputs` complete with `serp.ran:
  true`; header row exact; cells split on unescaped `|` only; closed
  sets enforced (`intent`, `page_class` **including `location`**,
  `status` enum — catches F8); `slugify(H1) == route` and
  `title_tag` head-phrase presence; `parent` resolves to a row or
  `(root)`; article→article parent refused (SOP :323–324);
  ancillary matrix satisfied per `site_type` (needs the F5 mapping
  resolved); **D6 folder check** — location leaf folders ∈
  `service-areas` or niche-declared term; **D2/leaf checks** — ≤25
  location leaves per cluster, every leaf `service_area`-bounded and
  index-linked, index row exists; title-tag ≤60 warn (S1 spec OQ3
  :338); ≥2-competitor evidence present per location row.
- Warn-vs-fail split: cap breaches and taxonomy unknowns warn;
  closed-set, lock, and parent violations fail.

## 7. SOP skeleton (revised 13-step recipe the `web-sitemap-<site>` lane runs)

1. **Intake.** Parse `site-brief.md` → `brief.json`. Require
   `service_area` for `local`/`national` (F3/F5); refuse
   `brief-intake-empty` / `service-area-missing`.
2. **Seeds.** GBP categories + `seed_topics` per SOP Step 1; geo →
   operands.
3. **Fan-out.** Modifier grammar per SOP Step 2 **plus restored
   `+year`, `use-case`, `delivery` classes** (F7); ≤64 queries/lane,
   seed-split beyond.
4. **SERP fetch + classify.** DDG→tinyfish escalation (Step 3);
   `serp_classify.py` annotates every result (F1) —
   directory/aggregator → `intent-evidence`.
5. **D2 suburb sampling.** Count dedicated leaves per `geo_suburb`
   SERP; record `location-gate` manifest block (F3/F8).
6. **Census.** `competitor_sitemap.py` per-cluster top-3 + operator
   domains → `census.json` + title/H1/**word+heading counts** per
   family (F4/F6).
7. **Extraction tier.** YAKE/PMI/headings/entities per S1 spec Steps
   4–5 (F10) — scratch artifacts under `competitors/<slug>/`.
8. **Volume tier.** `kw_volume.py` or T2–T5 degraded order; PAA
   harvest made real or dropped (F9).
9. **Cluster.** SERP-overlap Jaccard on *classified* URL sets; seed-merge
   rule; `kw_groups[]` order-stable.
10. **Emit `query-map.md`** — the query network + cluster table +
    sizing block (§5.1).
11. **Row assembly.** Steps 8 rules **with location deltas**: index
    row `ancillary`, leaf rows `page_class: location`, flat/nested per
    site_type (D1), cap 25, D6 folder names, D2 gate result honored.
12. **Manifest + lint.** `sitemap_lint.py` over sitemap + query-map;
    `research-inputs` including `location-gate`, `census`, `yake`
    rows.
13. **ACCEPT SITEMAP.** Existing presentation + census table +
    query-map link + location-cluster evidence.

## 8. Cross-module contracts

| Sibling | S1 owes | S1 expects | Conflict found |
|---|---|---|---|
| S0 | (consumes) | `service_area`, `depot_address` fields in brief | **F3/F5** — not in PRD :119's field list; location spec §7 :331 names the same dependency |
| S2 | `kw_group` ids stable; `word_target` evidence (F4); query-map for heading skeletons | row edits only at gate | `word_target` currently static (S2 :128); `type` mapping has no `location` (F2) |
| S3 | locked H1/route/title per row; `page_class` drives writer skeleton | row-count parity | location leaf skeleton (spec §7 :324) needs the `page_class` delta landed first |
| S4 | `parent` graph; sibling-entity signal; location leaves = money-class in balance rules | link-graph reads `parent` + `kw_group` | `parent: /service-areas/` rows and ≤8 sibling `added` edges are new graph cases (spec §4) |
| S5 | `page_class`→template mapping; BreadcrumbList keyed to `parent` | layouts per class | `location` class unmapped in S5's `type`→template (F2 knock-on) |
| S7 | parseable table; sitemap.xml generatable; D2/thin-leaf gate inputs | lock re-check in built HTML | `cluster lint`/`thin-leaf` checks (spec §7 :327) presume F3 fields exist |
| PRD §5.2 | schema conformance | schema of record stays stable | **F2/F5 need PRD amendment before lint can pass** |

## 9. Verdict

The SOP is the best-evidenced document in the corpus — Appendix E is
real fetched data, the DataForSEO contract is verified against live
docs, and the failure modes are honest. Its defects are at the
contract boundary: it operationalises the *S1 spec* faithfully but
predates the *location spec's* deltas, and it never implements the
operator themes' two hardest asks — SERP-result classification (F1)
and winner-page sizing (F4).

**Before this module's PRD can be written:**
1. PRD §5.2 amendment: `location` joins `page_class`; `status` stays a
   pure enum (F8); `site_type` gets one vocabulary with a real
   `national` row (F5).
2. `serp.jsonl` gains per-result classification fields + the closed
   taxonomy (F1) — without it D2 is unfakeable.
3. A named reconciliation of SKILL.md :52–54 and SOP Step 8.7 against
   location spec D1/D2/D6 (F3).
4. New write_paths declared: `site/query-map.md`,
   `competitors/<slug>/census.json`, `volumes.json` (F6, §5).
5. The sizing pass specced onto the Step 5.5 fetch and plumbed to S2's
   `word_target` (F4).
6. `sitemap_lint.py` contract ratified as in §6 — it is the only thing
   making F2/F3/F8 mechanically enforceable.

Cheapest wins: F8 (one field move), F7 (restore three grammar classes),
F9 (spec one fetch or drop the tier), F6 (emit the histogram as JSON —
the data already exists).
