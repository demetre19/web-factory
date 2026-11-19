# AUDIT-LOCATION — adversarial audit: location-pages module + first live application (Dents Direct)

Lane: `AuditLocation`. Audited 2026-11-02. Two evidence planes:
(1) the module spec `research/WEB-FACTORY-LOCATION-PAGES.md` (342
lines, read in full); (2) the live implementation it drove — Dents
Direct on the mac mini (`http://100.84.74.100:4340`, Astro dev server),
leaves `/service-areas/ballina`, `/service-areas/lismore`, index
`/service-areas`, redirect stub `/areas/ballina`; source read over SSH
at `…/dents-direct-website/site/src/`. Live competitor re-fetches:
`gobox.com.au/mobile-storage-thebarton/` (200), `cleanpursuit.com.au
/brighton-cleaners/` (200).

## 1. Scope audited

- Spec: `research/WEB-FACTORY-LOCATION-PAGES.md` — module boundary =
  location-page cluster (index + leaves) from brief `service_area`
  through build gate: D1–D6 decisions, module template M1–M10, the
  §6 13-step `web-location-<site>` lane procedure, §7 stage-impact
  table.
- Live first application: `pages/service-areas/[suburb].astro` (leaf
  template), `pages/service-areas/index.astro`, `pages/areas/[suburb].astro`
  (migration stub), `data/suburbs.ts` (21 leaf rows), `data/site.ts`,
  `data/reviews.ts`, `astro.config.mjs` (sitemap filter).
- Cross-stage surface touched: S0 intake fields (prd-herdr
  `WEB-FACTORY-S1-SITEMAP.md` Step 0), S1 redirect rows (Step 1),
  S4 class-6 corpus check (`WEB-FACTORY-S4-INTERLINK.md:207-214`),
  S6 header/redirect config (`WEB-FACTORY-S6-INTEGRATIONS.md:247-308`),
  S7 SEO gate checklist (`WEB-FACTORY-S7-GATE-DEPLOY.md:200-222`).

## 2. Current contract

| In | From | Shape today |
|---|---|---|
| `service_area` | `site/site-brief.md` | suburb/LGA list; refused if absent (`service-area-missing`) — §6 Step 1, :233-237 |
| `site_type`, `competitors`, `depot_address`, `delivery_zone_km` | brief | Step 1; depot keys required "when a depot exists" (M3/M10) |
| SERP cluster evidence | §6 Step 2 | ≥2 dedicated leaves in top-10 on ≥3 `"<service> <suburb>"` samples; `cluster-evidence: n` recorded |
| Candidate leaf set | Step 4 | SERP suburbs ∪ `service_area`, demand-sorted |
| Fact test | Step 5 | ≥2 suburb-specific facts each; fail → index text entry |
| Leaf rows | Step 7 | `page_class: location`, `parent: /service-areas/`, URL=H1=title lock |
| Edges | Steps 8/11 | 1× `seed` leaf→pillar; `added` leaf→index + ≤8 same-`parent` siblings |
| Content | Steps 9-10 | M1–M10 skeleton; ≥300 suburb-unique words M2+M3; FAQ 4–10, ≥2 suburb-token, unique answers |
| Build | Steps 12-13 | breadcrumb per D4; crawlable index grid; no Maps iframe; S7 cluster lint + thin-leaf check |

**Cross-module finding before the tables:** no landed stage spec
contains the string `location`, `leaf`, or `service-areas` — grep
across `WEB-FACTORY-S2..S7` returns zero hits outside this module's
own file, and prd-herdr `WEB-FACTORY-S1-SITEMAP.md` has no
`service_area`/`depot_address` field. Every §7 row is an *amendment
proposal*, not a landed contract. The Dents Direct build was driven
by this spec alone, off-pipeline.

## 3. Discovery-question expansion

Questions this stage must be able to answer, by operator theme. Gaps
are named findings in §4.

**Source + authenticity.**
- Q: Where does `service_area` come from — operator assertion, GBP
  service-area field, or measured drive radius? → **F1**: required by
  Step 1 but absent from S0's intake field list (`S1-SITEMAP.md` Step 0,
  :36-40 names only `site_type`, `geo`, `seed_topics`, `brand`,
  `competitors`); the spec's own §7 flags this only as an "upstream
  assumption" (:329-331).
- Q: Where do per-leaf facts (distance, drive time, population,
  landmark) come from, and how is each *verified* — ABS/Map data vs
  hand estimate? → **F1/F5**: `suburbs.ts` was hand-written; its header
  cites ABS 2021 via citypopulation.de, but nothing in the factory
  produces, sources, or checks such a file. The spec's fact test says
  "available" (:206-207), not "verified" — unverifiable facts on a
  public page are the fabrication risk the pipeline exists to kill.
- Q: How many leaves does the competitor census justify, and of what
  class? → partially answered: SITEMAP-SOP Step 5's competitor-mining
  histogram already classifies `money-location` vs `ancillary`
  (`WEB-FACTORY-SITEMAP-SOP.md:190-194`); the location spec's Step 2
  adds the dedicated-leaf SERP count. The seam between "competitor
  taxonomy histogram" (S1) and "cluster gate" (location lane) is
  unspecified — who hands the census to whom (**F6**).

**Intent classification.** Query intent on suburb queries is assumed
`local`/`transactional` in the taxonomy; the spec never says how a
suburb query classified `navigational` (searches for a competitor's
branch name) or `informational` (postcode lookups) is excluded from
leaf evidence. The tier's `intent-evidence` class exists in the SOP
(`:132-134`) for aggregators but isn't referenced here → **F6**.

**Aim-high sizing.** Step 10's floor (300 unique words M2+M3) is
serif'd `[INFERENCE]` at :140-143 and the procedure contains **no
step that measures what winners actually run**. Live measurement this
audit: gobox Thebarton leaf = **2,633 words** body-minus-chrome,
**13 H2 modules**; cleanpursuit Brighton = **2,063 words**, 9 H2s.
Dents Direct Ballina leaf = **~1,072 words**, 6 H2s — under half the
SERF-winner mass. The module template enumerates M1–M10 (the *shape*
is right — gobox runs the same set) but nothing sizes page mass to
the measured winners → **F5**.

## 4. Gap findings

Severity: blocker = module cannot ship spec-correct pages; major =
ships non-compliant pages or dead machinery; minor = ambiguity/edge.

**F1 — no owner for the leaf data file (blocker).** `suburbs.ts`
carries `distanceKm`, `driveMin`, `postcode`, `areaNotes` per leaf —
the load-bearing substrate for M2/M3 prose, M5 sibling order, FAQ
answers, and the M3 facts block. In factory terms nothing produces
it: S0's intake fields exclude `service_area`/`depot_address`
(`S1-SITEMAP.md:36-40`); S1 emits `sitemap.md` route rows, not
per-leaf facts; S2 plans prose, not data. The Dents Direct file was
hand-written with a sourcing comment block — exactly the discipline a
factory must mechanise (verified ABS figures, distance source,
explicit exclusion rationale). Without a `site/locations.json`
artifact + producer lane, every §6 step that reads leaf facts (5, 9,
10, 11's sibling sort, 13's lints) reads from thin air. §5 proposes
the contract.

**F2 — FAQ uniqueness enforcement bypassed for template leaves
(blocker, conditional on the data-driven model surviving).** The
spec's doorway tell "FAQ answers duplicated across leaves"
(:218-220) maps to S4's class-6 identical-≥8-word-sentence check —
which runs on `content/*.md` writer files
(`S4-INTERLINK.md:207-214`). Dents Direct leaves are **generated in
the Astro template** (`[suburb].astro` `faqs[]` array, lines 30-58):
no `content/<slug>.md` exists, so S4's corpus check sees zero leaf
files. Live confirmation: FAQ4 "Will the paint stay original?" is
**byte-identical across all 21 leaves** (`suburb.name` appears only
in the answer's last clause, not at all — answer text has zero
suburb tokens); FAQ3/FAQ5 differ only by suburb-name interpolation
("Larger hail work in Ballina can be prioritised after storms" vs
"…in Lismore…"). A rendered-page check found 33 shared ≥8-word
sentences between Ballina and Lismore (most are nav/review/footer
chrome — legitimately shared; the FAQ/M2 templated sentences are the
violating class). Spec Step 13 says "FAQ uniqueness" is a gate check
(:315) but S7's landed checklist (`S7-GATE-DEPLOY.md:207-221`, 13
checks) contains no FAQ or unique-word check at all — the gate it
names does not exist. Resolution must name the check's home: S7
build-lint on rendered HTML for template leaves, or S4 on writer
files for drafted leaves.

**F3 — D1 contradicts itself; the live build followed the non-default
rule (major).** D1 says flat `/<primary-kw>-<suburb>/` is "the better
leaf default" for single-city `local` sites (:11-13, :149-151, :156-159);
Step 7 emits `route /service-areas/<suburb>/` (:269-276) and permits a
folder only "where the operator requires" it. Dents Direct built the
folder form (`/service-areas/ballina`) — i.e. the first live
application used the exception path as the default, contradicting the
spec's own verdict that flat beats folder on evidence (gobox 236,
cleanpursuit 23, lamontlaw all flat). Either D1 needs a stated reason
the folder form won (operator override recorded in `status` — Step 2's
`cluster-evidence` field is the natural carrier), or the spec text and
procedure must be reconciled to one rule. As written a lane can mint
either and both are "per spec".

**F4 — redirect ownership lands nowhere (major).** S1 Step 1 records
existing-site `redirect` rows with 301 targets
(`S1-SITEMAP.md:49-50`). Nothing downstream consumes them: S6's
header config emits ACME passthrough + http→https redirects
(`S6-INTEGRATIONS.md:236-241`) — path-level old→new 301s are not in
its capability list; S7 deploys and smokes `/` + one money route
(`S7-GATE-DEPLOY.md:166-172`) — no old-URL check. The Dents Direct
`/areas/<suburb>` → `/service-areas/<suburb>` migration ships a
meta-refresh + canonical + `noindex` + JS `location.replace` stub
(source comment: "Static output can't 301 … Server-side 301s should
replace them in the deploy layer") — correct for dev, wrong for
production: a 200-status stub carrying `noindex`+canonical is a
crawlable duplicate holding the old URL open. Spec-worthy **if and
only if** paired with: (a) a redirects artifact (`site/redirects.json`
or a sitemap row column) owned by S1's `redirect` classification;
(b) S6 emitting those rows into `.htaccess`/`_redirects`/nginx;
(c) S7 route-parity explicitly exempting stub pages (a stub is a
`dist/` route absent from `ROUTE-MANIFEST.json` — check 1 fails it
today); (d) S7 smoke-fetching each recorded old URL expecting 301.
None of the four exists.

**F5 — leaf mass undersized vs measured winners; fact provenance
unverified (major).** Step 10's 300-word floor is `[INFERENCE]`
(:141) and the live leaf measures **172 words across the M2+M3
segment** (Ballina; 174 for Lismore — the prose block plus facts
cell) — below even the spec's own floor, un-enforced. The unique
substrate is ~80 words of `areaNotes` + distance/drive numbers; the
rest is templated. Meanwhile measured SERP winners run 2–2.6k words.
Two repairs, both procedural: (a) a Step-2b sizing measure — record
word/module count of the top-3 dedicated leaves the cluster gate
samples; the leaf target = measured median, not a floor; (b)
`areaNotes`-class facts require a `source:` field per fact (the
`suburbs.ts` header already models this — ABS 2021 via
citypopulation.de; drive times cited "typical road values"). A
suburb leaf that can't cite its facts fails D2's fact test on
provenance, not just presence.

**F6 — cluster-gate inputs drift from S1's machinery (major).** Step
2 re-specifies a SERP sampling the SOP already operationalises
(`SITEMAP-SOP.md` Steps 2-3: fan-out grammar, `geo_suburb` modifier
class `:90`, `serp.jsonl` schema `:123`). The location spec re-asks
the question without binding to those artifacts: "dedicated location
leaf" has no classification rule (does an aggregator's suburb page
count? the SOP already says aggregators are `intent-evidence`, never
competitors, `:130-134`); `cluster-evidence: n` has no schema or
destination artifact named (recorded "in `status`", :244 — which
artifact's status?). The Dents Direct build skipped the gate entirely
— `suburbs.ts` header selects by "ABS Census 2021 population … 20
largest", i.e. **the exact top-N-by-population rule the spec replaces**
at :195. The live run is a proof that Step 2, un-wired to S1's
`serp.jsonl`, gets silently bypassed by the heuristic it deprecates.

**F7 — writer-model collision unacknowledged (major).** The §6
procedure's Phase D "writing (per leaf)" steps sit inside a pipeline
whose every stage (S2 plan rows → S3 writer batches → S4 graph/cleanup)
assumes one `content/<slug>.md` per sitemap row. The live leaf is
data-driven template output — no writer file, no S2 `link_seed`, no
S3 skeleton, no S4 pass. The spec never chooses. If template leaves
are blessed (correct at 25-leaf scale — 25×~300 words is a writer
batch nobody will hand-draft differently per suburb), then: leaf rows
need `page_class: location` to mark them *writer-exempt* in S2/S3;
the M1–M10 skeleton becomes an S5 template contract (module order,
slot names, per-slot data binding); the unique-prose floor and FAQ
uniqueness become *data-file* lints (`areaNotes` word count, FAQ
answer similarity matrix) + one rendered-page S7 check. If
writer-drafted leaves are required, 25 leaves = 5 writer batches and
S2 must emit per-leaf `heading_skeleton` — the spec doesn't pay that
cost anywhere. Pick one; "Steps 9-10" as written describe writer
behavior on an artifact that doesn't exist.

**F8 — S4 edge-cap collision (major).** S4's outbound budget is ≤3
`body` links + ≤4 `related` (`S4-INTERLINK.md:129` region, cited by
this spec at :182). A compliant leaf emits: 1 pillar `seed` (body) +
8 sibling `added` (body, M5) + 1 index `added` + M4 service-card links
— ~12 in-body links. The spec claims the sibling cap "keeps S4's
budgets intact" (:181-183) — arithmetically false unless sibling
edges get a placement class or cap exemption, which is flagged only
for index→leaf `grid` (`:302-303`, "S4 spec amendment needed",
`[INFERENCE]`). The same amendment must cover leaf→sibling edges and
the M5 block's link cap interplay.

**F9 — multi-city/national path is matrix-only (major).** D1's
multi-city rule (`/<city>/<suburb>/` nested, :152, :157-159) appears
in the decision matrix and §7's S1 delta, but §6's procedure is
single-city throughout: Step 2 samples `"<service> <suburb>"` (no
city operand), Step 3 mints one index, Step 4 builds one candidate
set, Step 6's cap of 25 is unqualified (per-city? total?), Step 11's
`same-`parent` siblings` implicitly assumes the parent partitions
cities — unwritten. Gotocourt/taxibox evidence is used to justify the
nested taxonomy but no step emits `/service-areas/<city>/` hub rows
or city money pages. Fix: split Phase B into a `city_mode`
branch (single | multi), or declare multi-city a separate procedure
file. A `national`-type site run through §6 as written mints
flat-format leaves against a spec that says nested is required —
silent wrong-URL generation.

**F10 — leaf title/meta formulas escape the lint budget (minor→major
in practice).** Step 7's `title_tag` = `<H1> | <Brand>` (:271-272)
produced `Auto Dent Removal Service Ballina — Dents Direct | Mobile
PDR 2478` = **66 chars** — S7 check 2 (≤60) fails it. Meta
description 152 chars ✓ on the leaf but **177 on the index** — check
3 (140–160) fails the index. The leaf title needs a niche-scaled
formula (e.g. `<Service> <Suburb> | <Brand>`), not the generic
URL=H1=title lock. Both fails were invisible until a built-page
gate exists — evidence for running S7's checklist mechanically on
`dist/` (it exists nowhere as a tool today).

**F11 — sibling "nearest" is radial, not geographic (minor).**
`[suburb].astro` sorts `near` by `|distanceKm − suburb.distanceKm|`
— proximity of *depot distances*, not suburbs. Ballina's "Also
servicing" list is right by accident (everything near Ballina shares
its radius); a far leaf (Grafton 120 km) links the next-furthest
suburbs radially, which happens to be correct north-south here but
produces wrong neighbours whenever two service arms diverge. The
data model needs `lat`/`lng` (or a curated `nearby[]` list — already
half-implied by `areaNotes` pairings like "bundled with Yamba/Grafton
runs") and the sibling computation needs to state which.

**F12 — canonical trailing-slash convention unwritten (minor).**
Leaf renders `canonical …/service-areas/ballina` (no trailing slash);
robots + sitemap output unreachable on dev (sitemap.xml 404s on dev —
artifact-only check). S7's check 4 says canonical = `url` + route
path but never fixes the slash grammar; Astro emits directory-index
pages where `/ballina` and `/ballina/` both resolve in production —
one page, two URLs, one canonical string the spec must pin. Same
class as the S3/S4 `/{slug}` vs `/<path>/` drift the cross-stage
review already logged (F2/F3 there).

**F13 — leaf page fetches remote Google Fonts (minor, cross-lane).**
Ballina leaf `<head>` carries `preconnect` + stylesheet loads to
`fonts.googleapis.com`/`fonts.gstatic.com` — violates S6's CSP
premise ("the site ships zero remote assets", `S6:257`) and S7 check
10 (`:218`). Site-wide issue (owned by the design lane's font
strategy — flag to `AuditDesign`), observed on the leaf and counted
here because it's a leaf-shipping defect at S7 time.

**F14 — breadcrumb/JSON-LD contract thin (minor).** Leaf carries
BreadcrumbList only. No FAQPage LD despite a compliant
`<details>`-based FAQ block (SERP-visible FAQ rich results are the
evidentiary purpose of M7); no LocalBusiness/Service LD despite a
real depot NAP in `site.ts`. The spec requires only BreadcrumbList
(:309) — under-spec'd vs the "SEO baked into everything" posture. M10
itself renders as address-inside-facts-cell (the depot address lives
in M3's facts list and one FAQ answer — compliant with "OPT" but
there is no standalone NAP block anywhere on the leaf; hours absent
from `site.ts` entirely).

## 5. Split / sub-module proposal

The module decomposes into **three** seams, matching the data→
template→check shape the live build proved:

**5a — `web-location-research` (new lane, sits after S1, consumes
S1's `serp.jsonl` + `competitors/` census).** Emits
`site/locations.json` — the artifact F1 names missing:

```json
{
  "cluster": {
    "city_mode": "single | multi",
    "index_route": "/service-areas/",
    "leaf_pattern": "/service-areas/<suburb> | /<kw>-<suburb> | /<city>/<suburb>/",
    "serp_evidence": [{"query": "dent removal ballina", "dedicated_leaves_top10": 3}],
    "cap": 25
  },
  "leaves": [{
    "slug": "ballina", "name": "Ballina", "postcode": "2478",
    "facts": [{"k": "distance_km", "v": 5, "source": "…"},
              {"k": "drive_min", "v": 10, "source": "…"},
              {"k": "pop", "v": 18532, "source": "ABS 2021 UC via citypopulation.de"}],
    "notes": "Home town — workshop in East Ballina on Hindmarsh St.",
    "nearby": ["west-ballina", "east-ballina", …],
    "sizing": {"competitor_median_words": 2100, "sampled": ["gobox/…", "…"]}
  }],
  "index_only": ["bangalow", "brunswick-heads"],
  "redirects": [{"from": "/areas/<suburb>", "to": "/service-areas/<suburb>"}]
}
```

`index_only` operationalises the fact-test losers (mobistorage
two-layer, :208); `redirects` feeds F4's S6 consumer; `sizing` feeds
F5. Producer lane does D2's gate (Step 2), fact test (Step 5), cap
(Step 6) — everything data; nothing prose.

**5b — Leaf template + data binding (S5b build lane).**
`page_class: location` rows are writer-exempt (F7): S5 binds the
M1–M10 skeleton as a component order, `locations.json` fills slots,
S2/S3 skip these rows. If the decision goes writer-drafted instead,
5b disappears into existing S3 batches and S4 regains uniqueness
enforcement — the choice is one line in the module spec, with
opposite downstream cost.

**5c — `tools/leaf_lint.py` (mechanical gate, run at S5b build +
S7).** Checklist in §6. This is where the §6.13 "S7 additions" live
once they exist.

## 6. Automation surface

| Tool (new `tools/*.py` stub) | Check / output | Mechanical? |
|---|---|---|
| `tools/serp_leaf_gate.py` | For each `"<service> <suburb>"` sample: count dedicated-leaf results in top-10 (dedicated = non-aggregator domain, page URL contains suburb token or location path class); emits `serp_evidence[]` rows | yes — reuses SOP Step 3 fetcher + `filter_competitor_urls` |
| `tools/suburb_facts.py` | Geocode/distance (depot→suburb road km/min via routing API or OSRM self-host), ABS/LGA population lookup, postcode; emits per-leaf `facts[]` with `source:` required | yes — provenance mandatory, value may degrade to `source: operator` |
| `tools/leaf_sizing.py` | Fetch top-3 dedicated leaves per cluster gate; record word count (body-minus-chrome) + H2 count → `sizing.competitor_median_words` | yes |
| `tools/leaf_lint.py` | On `dist/` leaf HTML: M2+M3 unique-words ≥ target (or spec floor 300); FAQ count 4–10, ≥2 suburb-token questions, FAQ answer pairwise-similarity across leaves < threshold (≥8-word-sentence overlap = the S4 class-6 grammar, applied to rendered pages); sibling links ≤8; outbound Maps link present + no Maps `<iframe>`; pillar `seed` link present; breadcrumb nav + BreadcrumbList LD present; title ≤60 / desc 140–160 / one H1 (S7 checks 2,3,5 pre-run); canonical grammar check | yes — every row machine-evaluable |
| `tools/redirect_emit.py` | Consume S1 `redirect` rows + `locations.json.redirects` → S6 header config block; emit stub `<meta refresh>` pages only as `static-only` host fallback | yes |
| lane judgment (never mechanical) | suburb selection edge cases (flood-rebuild demand, tourism-fleet calls the `suburbs.ts` notes already make); region-over-suburb call (D5); FAQ question phrasing per leaf; `areaNotes` editorial | no |

## 7. SOP skeleton — `web-location-<site>` lane

Extends §6's 13 steps with the missing moves; numbered in execution
order.

1. Load `site-brief.md`; require `service_area`, `site_type`,
   `competitors`, `depot_address`+`delivery_zone_km` where a depot
   exists. Missing `service_area` → `service-area-missing`. *(spec Step 1)*
2. Resolve `city_mode`: `local`+one primary geo → `single`; multi-city
   geo or `national` → `multi` (per-city loop over steps 3-9). *(new — F9)*
3. Cluster gate: ≥3 `"<service> <suburb>"` samples from S1's
   `serp.jsonl` (re-fetch if absent); ≥2 dedicated leaves in top-10 on
   ≥3 samples → mint; else index-only. Record `cluster-evidence` +
   `leaf_sizing` medians. *(spec Step 2 + new sizing — F5/F6)*
4. Emit `site/locations.json` skeleton: candidate set =
   SERP-observed suburbs ∪ `service_area`. *(spec Steps 3-4)*
5. Fact test per candidate: ≥2 *sourced* facts via
   `tools/suburb_facts.py`; fail → `index_only[]`. *(spec Step 5 + provenance — F5)*
6. Cap 25 per city-cluster; re-check `service_area`; overflow →
   `index_only[]` + `## Notes`. *(spec Step 6)*
7. Emit sitemap leaf rows: `page_class: location`, `parent`, URL
   pattern resolved per D1 `city_mode` + niche SERP slug convention —
   ONE rule, recorded in `cluster.leaf_pattern`; `writer_exempt:
   true` under the template model. *(spec Step 7 + F3/F7)*
8. Emit `redirects[]`: union of S1 existing-site `redirect` rows and
   D6 folder migrations; write stub pages only for `static-only`
   hosts; hand rows to S6's header config. *(new — F4)*
9. Fill `locations.json` leaf facts + `nearby[]` (lat/lng or curated
   list — F11). *(spec Steps 9-10 upstream half)*
10. S5b binds template: M1–M10 order, `nearby` chips, breadcrumb +
    BreadcrumbList LD, FAQPage LD, NAP block where `depot_address`.
    *(spec Step 12 + F14)*
11. S4 graph pass: `seed` leaf→pillar anchor `<service> <city>`;
    `added` leaf→index; `added` leaf→≤8 `nearby` siblings — under the
    F8 cap amendment. *(spec Step 11)*
12. `tools/leaf_lint.py` on `dist/`: unique-words, FAQ set, sibling
    cap, Maps link-not-iframe, pillar link, title/meta/canonical.
    *(spec Step 13, mechanised — F2/F5/F10)*
13. S7 gate adds: stub-page parity exemption, per-redirect 301 smoke
    fetch. *(new — F4)*

## 8. Cross-module contracts

| Owes | To | Conflict found |
|---|---|---|
| `locations.json` (5a) | S5b template, `leaf_lint`, S6 redirects | new artifact — no consumer spec mentions it |
| `page_class: location` rows, `writer_exempt` | S2 (skip in plan), S3 (skip in batches), S4 (skip class-6 corpus or lint rendered output instead) | F7 — S2-S4 have no `location` hook at all |
| `redirects[]` rows | S6 (emit into header config), S7 (smoke + parity exemption) | F4 — neither spec owns path-level redirects |
| `cluster-evidence`, `leaf_sizing` | S1 SOP (`serp.jsonl` producer), ACCEPT SITEMAP gate summary | F6 — recording artifact unnamed |
| Sibling `added` edges ≤8 + index `grid` | S4 outbound caps | F8 — spec's own cap claim is arithmetically wrong; amendment owed |
| Sibling-block anchor convention (`bare suburb name`, :176-177) | S4 anchor rules | S4's `added` anchor grammar never pinned for location edges |
| Leaf title formula (F10) | S7 check 2 (≤60) | spec Step 7's `H1 | Brand` formula produces 66-char titles on this niche — formula must be niche-scaled |
| FAQ answer uniqueness grammar | S4 class-6 wording (≥8-word identical) vs rendered-page lint | F2 — the rule exists in one place, the pages in another |
| `service_area`, `depot_address`, `delivery_zone_km` fields | S0 discovery question bank + `site-brief.md` schema | F1 — fields demanded, never produced; S0 spec lists no such questions |

## 9. Verdict — what must exist before this module's PRD can be written

1. **`site/locations.json` artifact + `web-location-research` lane
   contract** (F1/F5): schema per §5a, `source:` mandatory per fact,
   `index_only` losers list, `redirects` rows, `sizing` medians. The
   single highest-leverage landing — it converts the hand-written
   `suburbs.ts` into a factory product.
2. **The writer-vs-template decision** (F7): one line blessing
   data-driven leaves as writer-exempt (recommended — live proof it
   produces compliant structure; uniqueness moves to data lints + one
   rendered check), with S2/S3/S4 spec hooks for `page_class:
   location`.
3. **Redirect chain landed** (F4): S1 `redirect` row → S6 emit → S7
   parity-exempt stub + 301 smoke. The `/areas/` stub pattern is
   spec-worthy *as a dev/static fallback only*; production requires
   server 301s and today no stage emits them.
4. **D1 reconciled** (F3): flat-default vs live-folder contradiction
   resolved to one rule with an override recording field.
5. **S7 additions exist** (F2/F10): `leaf_lint` checks (unique words
   ≥ measured floor, FAQ uniqueness grammar on rendered pages,
   sibling cap, Maps link-not-iframe, breadcrumb+LD, canonical
   grammar) added to S7's 13-check list — plus stub parity exemption
   and redirect smoke.
6. **Multi-city branch** (F9): `city_mode` explicit in the procedure,
   or a separate procedure file; cap semantics per city.
7. **S4 cap amendment** (F8): sibling `added`/`body` edges +
   index `grid` placement formally exempted or re-classed.

**Live-implementation scorecard (M1–M10):** M1 ✓, M2 ⚠ (exists;
~80 unique words, thin vs the module's own spec and measured
winners), M3 ✓ (address block + two outbound Maps links, no iframe —
matches evidence consensus :57-59), M4 ✓, M5 ✓ (8 links, bare-suburb
anchors — but radial-sort caveat F11), M6 ✓ (verified real GBP
reviews, metro-scoped, do-not-invent comment), M7 ⚠ (5 questions, ≥2
token-bearing, but FAQ4 identical across all 21 leaves — live
doorway tell), M8 ✓, M9 ⚠ (index up-link ✓; pillar link exists but
anchor `mobile dent repair` ≠ `<service> <city>` convention), M10 ⚠
(address in facts cell; no standalone NAP/hours block — within "OPT"
but thin). Plus: title 66 ch ✗, index meta 177 ch ✗, BreadcrumbList
only (no FAQPage/LocalBusiness LD), remote font fetches, noindex
meta-refresh stubs where production needs 301s. The cluster is
structurally faithful to the module template and materially below
SERP-winner mass — exactly the gap the "aim high" expansion theme
exists to close.
