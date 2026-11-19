# AUDIT-S0-DISCOVERY — adversarial audit of the intake stage

Scope: S0 intake → `site/site-brief.md`. Audit date 2026-11-02. This is
the factory's only human-facing stage — every fact every downstream
stage binds originates here or nowhere. The audit therefore asks two
questions harder than the spec does: (1) does the Q&A collect what the
operator's discovery themes require, and (2) does the brief carry
fields every module that reads it actually demands?

## 1. Scope audited

Files read:

| File | Role |
|---|---|
| `skills/s0-discovery/SKILL.md` | the entire S0 spec surface that exists in this repo |
| `PRD-Web-Factory-2026-10-30.md` §3, §5.1 | the `site-brief.md` field contract |
| `docs/machinery/WEB-FACTORY.md` §Pipeline S0 row, §Deploy contract | runbook's intake description |
| prd-herdr `research/DISCOVERY-RESEARCH-web-factory.md` | why the stage exists (landscape scan, not an S0 spec) |
| prd-herdr `research/WEB-FACTORY-S1-SITEMAP.md` §Step 0, §Step 8 | the intake-record fields S1 parses; the ancillary-matrix site types |
| `research/WEB-FACTORY-SITEMAP-SOP.md` §Step 1 | the brief fields the S1 SOP consumes (`service_area`-adjacent: `geo`, `suburb_list`) |
| `research/WEB-FACTORY-LOCATION-PAGES.md` §6 Step 1, §7 | the module that **refuses** without `service_area` |
| `research/WEB-FACTORY-S2-TONE-PLAN.md` §Fingerprint sources, :27-28, :98-99, :203-205 | voice fields, `## Reference copy` |
| `research/WEB-FACTORY-S5-DESIGN-DNA.md` §Inputs, :71-73, :159 | entity facts, CTA destinations, DOX/refs design intake |
| `research/WEB-FACTORY-S6-INTEGRATIONS.md` :36-40, :80, :89-91 | `contact_*`, `notify_phone`, **`host`** block |
| `research/WEB-FACTORY-S7-GATE-DEPLOY.md` :73-100, :138-142 | `## Deploy` four keys, pre-deploy probe |

Module boundary: everything between the operator typing
`NEW-WEBSITE <intent>` and S1 Step 0's `brief.json` parse. The
competitor-census and query fan-out machinery is *evaluated* for
placement (S0 sub-step vs S1) but its mechanics belong to the S1 audit.

**The specification itself is thin.** There is no S0 engineering spec —
no `WEB-FACTORY-S0-*.md`, no `research/site-brief.md` canonical
template. What exists: one 78-line `SKILL.md`, one paragraph at PRD
§5.1, one row in the runbook table, and the intake-record field list at
S1 Step 0 (which is an S1 document about what S1 *parses*, not an S0
document about what S0 *collects*). DISCOVERY-RESEARCH is a landscape
scan — it justifies the stage's existence, it does not spec the Q&A.
This audit is adversarial partly because there is almost nothing to
break against.

## 2. Current contract

| Item | As specced today | Source |
|---|---|---|
| Trigger | `NEW-WEBSITE <site intent>` consumed verbatim as the Q&A seed | `skills/s0-discovery/SKILL.md:29-30` |
| Input | Operator answers; Maps/GBP category lookups | `docs/machinery/WEB-FACTORY.md:22` |
| Q1 — site class | `local \| national \| ecom`, asked first | `SKILL.md:34-36`; `WEB-FACTORY.md:39` |
| Q2 — GBP categories | `gbp_primary_category` + `gbp_secondary_category`, local/national only, GMB-extractor method | `SKILL.md:37-43` |
| Q3 — entity facts | brand, offering, audience, geo(s), services, voice fields, `## Reference copy`, competitor names, existing-site URL | `SKILL.md:44-46` |
| Q4 — contacts | `contact_email`, `contact_phone`, `notify_phone`; ≥1 of email/phone required | `SKILL.md:47-49` |
| Q5 — deploy | `## Deploy`: `host_alias`, `user`, `docroot`, `url` | `SKILL.md:50-52` |
| Output | `site/site-brief.md` (markdown); `sites/<slug>/brief.json` is written by **S1**, not S0 | `SKILL.md:56`; `WEB-FACTORY.md:23` |
| Authenticity rule | "a fact the brief does not carry is omitted or flagged, never fabricated" | `SKILL.md:13-15`; PRD §5.1 |
| Named failure modes | `brief-intake-empty`, category drift, missing deploy section | `SKILL.md:71-78` |

Field inventory the brief is declared to carry (union of PRD §5.1 +
SKILL.md): `brand`, `offering`, `audience`, `site_type`, `geo(s)`,
`gbp_primary_category`, `gbp_secondary_category`, voice fields,
`## Reference copy`, `competitors`, `services`, `contact_email`,
`contact_phone`, `notify_phone`, `host_alias`, `user`, `docroot`,
`url`, existing-site URL. Seventeen-ish — and no schema file defines
any of their grammars.

## 3. Discovery-question expansion

The question bank S0 must be able to answer, grouped by the operator's
themes. **Bold = the stage cannot answer today.**

### 3.1 Source & authenticity (where does each input come from?)

- Which facts are operator-asserted vs verifiable? **Today: all are
  operator-asserted.** The skill says "you do not invent facts" but
  nothing verifies the operator's claims either — an operator who says
  "we're licensed electricians" produces a licensed-electrician site
  with no check.
- **ABN/entity verification** — AU-trade sites are the target niche;
  `abr.business.gov.au` exists as a free public lookup
  [INFERENCE — standard AU practice, not fetched]. No S0 step asks for
  or checks an ABN/ACN.
- **GBP listing status** — S0 reads *competitors'* GBP categories to
  mint routes but never asks: does the business have a GBP listing?
  Its categories? Verified/suspended? The category extraction method
  itself is documented as page-source scraping of Maps listings
  (`localsearchforum.com/threads/how-to-find-all-competitor-categories-in-google-my-business.55573/`,
  `daltonluka.com/blog/google-my-business-categories` — tinyfish
  search, 2026-11-02), and Google's own `categories.list` API exists
  (`developers.google.com/.../rest/v1alpha/categories/list`). S0 names
  neither the tooling nor the client's own GBP state.
- **Address verification** — `depot_address`/NAP is consumed verbatim
  by M3/M10 location modules and the footer NAP block (S5
  `WEB-FACTORY-S5-DESIGN-DNA.md:248-251`). Wrong address = wrong NAP
  across every page. No verification step exists.
- `## Reference copy` — collected, good; S2's fingerprint precedence
  makes it load-bearing (`WEB-FACTORY-S2-TONE-PLAN.md:95-102`).

### 3.2 Classification (what kind of site is this?)

- Product vs service: **partially covered** — `ecom` vs `local`/
  `national` implies it, but a service business that also sells
  products (the storage niche literally does — `auspods` runs
  `/product*` and `/cartons-packaging`, SITEMAP-SOP §E2) has no way to
  say "service-led with product ancillary."
- **Local vs national: the `site_type` closed set contradicts the
  downstream matrix.** S0 offers 3 classes; S1 Step 0 consumes 6
  (`local-service | ecommerce | content-authority | portfolio |
  nonprofit | brochure`, `WEB-FACTORY-S1-SITEMAP.md:36`). `brochure`,
  `content-authority`, `portfolio`, `nonprofit` are unreachable. The
  SOP already found this and patched it with assumption A1
  (`WEB-FACTORY-SITEMAP-SOP.md:446`) — the patch exists *because* the
  contract is wrong at S0.
- Query intent classification: not an S0 question and correctly not —
  it is S1's evidence job (SOP Step 2's `intent_label` per query,
  `WEB-FACTORY-SITEMAP-SOP.md:86-97`). S0's contribution is only that
  `site_type` seeds the money/article prior (S1 M7,
  `WEB-FACTORY-S1-SITEMAP.md:216-218`).

### 3.3 Competition census

- S0 collects `competitors` as **names** (`SKILL.md:45`) but S1 Step 0
  needs **domains** (`WEB-FACTORY-S1-SITEMAP.md:41`: "operator-named
  competitors appended to whatever SERP discovery finds") and the SOP
  puts operator-named domains straight into the Step 5 mining pool
  (`WEB-FACTORY-SITEMAP-SOP.md:59-60`). Name→domain resolution is
  currently a free-text inference at S1 — a plumber named "Jim's"
  resolves to which of jimsplumbing/jimscleaning?
- The census itself (sitemap page counts, money/article/location
  split, title formulas) is S1 SOP Step 5 and is SERP-informed — see
  §5 for the placement decision.

### 3.4 SERP stats / page sizing

- Not S0's job by design (evidence falls out of S1's fetch). **But the
  brief should carry the inputs sizing depends on and doesn't:**
  existing-site URL is collected; whether GSC access exists for it is
  not (S1 prompts for it mid-lane, `WEB-FACTORY-S1-SITEMAP.md:228-230`
  — an operator interaction S0 could front-load).

## 4. Gap findings

### F1 — No `site-brief.md` canonical template or schema file (blocker)

PRD §5.1 describes the brief in one prose paragraph; the grammar lives
nowhere. Every other shared artifact has a canonical template in
`research/` (`content-plan.md`, `tone-profile.md`, `link-graph.md` —
PRD §5.3–5.5) and the adversarial review already recommended
`research/site-brief.md` land as one (`ADVERSARIAL-REVIEW.md:288-289,
304-305`). It still does not exist — `templates/` holds only
`STARTER.md` + `astro/` (verified 2026-11-02). Consequence: "carries
every PRD §5.1 field" (`SKILL.md:60`) is unlintable; S1's parse is
prose-extraction; a field renamed anywhere breaks silently. This is
the F1 class the cross-stage review named: consumers hardened around
an unspecced producer.

### F2 — `service_area`, `depot_address`, `delivery_zone_km` uncollected → the location module refuses at mint (blocker)

`WEB-FACTORY-LOCATION-PAGES.md:232-237` — Step 1 "Requires
`service_area` (explicit suburb/LGA list) … `depot_address` +
`delivery_zone_km` when a depot exists. Missing `service_area` →
refuse `service-area-missing`." And `:329-331` states the assumption
flatly: "S0 must collect `service_area` + `depot_address`; without
them D2 cannot run." S0's SKILL.md collects neither — `geo(s)` is a
free-text geography answer, not an enumerated suburb/LGA list. The
SITEMAP-SOP's location cap likewise reads "the brief's `suburb_list`
ranked by population" (`WEB-FACTORY-SITEMAP-SOP.md:343-344`) — a field
that appears nowhere in S0's write set or PRD §5.1. Two downstream
specs bind fields S0 never asks for; the refusal surfaces stages late
exactly like the named "missing deploy section" failure mode S0
already knows about.

### F3 — `site_type` closed-set contradiction between S0 and S1 (blocker)

S0: `local | national | ecom` (`SKILL.md:34`). S1 Step 0:
`local-service | ecommerce | content-authority | portfolio |
nonprofit | brochure` (`WEB-FACTORY-S1-SITEMAP.md:36`), and the
ancillary matrix keys on the *latter* set (`:122-129`). The SOP's A1
mapping (`WEB-FACTORY-SITEMAP-SOP.md:350-354,446`) is a lane-level
guess — `national`→`local-service` minus `/service-areas/` — which
fails for `content-authority`-shaped national sites (a national
content site gets a local service matrix) and leaves `national`
brands *with* service areas no way to keep `/service-areas/`. Two
closed sets naming the same axis, neither a subset of the other, no
declared mapping — the F1 "silent drift across prose documents"
pattern verbatim.

### F4 — `host` block (S6's input) is not collected (major)

`WEB-FACTORY-S6-INTEGRATIONS.md:37-38,80` requires the brief to carry
`host` — `type: apache|nginx|static-only`, SSH alias. S0's `## Deploy`
collects `host_alias` (the alias) but no `type`. A missing field is "a
flag, not a refuse" so this degrades rather than blocks — but the
degrade path (PHP endpoint vs `_forms`/`_redirects` platform swap,
`:167-173`) is decided on a fact nobody collects. Also missing:
mail-provider hint (`SMTP_*` vs Resend availability) — the one S0
question that turns S6's env probe from blind to targeted
[INFERENCE — the env names are S6's; only the *presence* question is
S0's job].

### F5 — `seed_topics` never collected; S1 *extracts* them (major)

S1 Step 0 requires `seed_topics` 3–8 "extracted from the offering
description" (`WEB-FACTORY-S1-SITEMAP.md:38`); the SOP consumes
`seed_topics` verbatim ("Keep the operator's phrasing",
`WEB-FACTORY-SITEMAP-SOP.md:54-55`). S0's intake order never asks for
seeds — "offering" is the closest field. So the field S1 consumes as
*the operator's phrasing* is actually an S1-lane inference over a
free-text paragraph, and `brief-intake-empty` fires not because the
operator gave nothing but because extraction found nothing.
Collecting 3–8 seed topics is a one-line question and is the input
the entire query fan-out stands on.

### F6 — No entity-authenticity verification lane (major)

Theme 1 requires authenticated facts. Today's only authenticity rule
is negative (don't fabricate, `SKILL.md:13-15`). Positive
verification is absent on every checkable fact: ABN/ACN (abr lookup),
address/NAP vs the GBP listing's stated address, GBP listing
existence and claimed state, phone number format/live-ness, existing
domain actually resolving. Verification primitives exist and are
free-ish: Maps page-source category extraction (documented method,
per localsearchforum/daltonluka, fetched 2026-11-02), Google
`categories.list` API, `curl` on the existing domain, ABN lookup web
service. A wrong operator answer today propagates verbatim into NAP
blocks, E-E-A-T claims and title tags with no checkpoint.

### F7 — Competitors collected as names; S1 needs domains (major)

`SKILL.md:45` "competitor names" vs `WEB-FACTORY-SITEMAP-SOP.md:59-60`
"Operator-named domains skip SERP discovery and go straight into the
Step 5 mining pool." A name is not a domain; the mining pool consumes
domains. Collect `competitors[]` as `{name, domain}` pairs — and while
there, ask *which of these the operator considers the SERP leader* (it
biases the gate's coverage table reading).

### F8 — Site classification is one question where the operator's themes need four (major)

Single `site_type` answer collapses: business model (service /
product / hybrid), market scope (single-city / multi-city / national
/ ecom-shipping), YMYL-ishness (law/medical/finance niche — the
location-pages evidence shows venue-vs-suburb page shapes differ in
legal, `WEB-FACTORY-LOCATION-PAGES.md:97-105`), and content posture
(brochure vs authority). These four decide: ancillary matrix row,
location-cluster eligibility, page_class priors, and whether the
`ecom` arm even applies. One three-way answer cannot carry four axes
— proven empirically by the A1 hack it already forced (F3).

### F9 — Deploy section collected but unverifiable; jump-server facts thin (minor)

`host_alias` is a *saved* alias "used via `ProxyJump jump`"
(`WEB-FACTORY-S7-GATE-DEPLOY.md:79-87`) — the operator types an alias
string; nothing at intake confirms the alias resolves, the user is
non-root, or the docroot is writable. S7's step-2 probe (`:138-142`)
is the check of record, three days and five stages late — the exact
"discovered at S7 mint" failure S0's own skill names as a failure
mode (`SKILL.md:77-78`) while doing nothing to prevent it. An intake
probe (`ssh <alias> 'test -d <docroot> && test -w <docroot>'` — the
same command S7 runs) belongs inside S0's verification pass or as a
recorded-degraded flag. Host `type` (F4) and ACME/mail provider hints
join the same question.

### F10 — No design-intake question (minor)

S5's mint precondition: ≥1 design source — DOX ZIP under
`site/design/` or `site/design/refs/` (`WEB-FACTORY-S5-DESIGN-DNA.md:
72-74,81-83`). S0 never asks "do you have a design packet, brand kit,
or reference sites?" — the operator learns this is needed when S5
mints (or stalls) four stages later. S0 is the only human-facing
stage; "design source?" is an intake question. Same class: brand
assets (logo, photos) — no field asks for them; S5's `public/assets/`
has nothing to draw from if the operator was never asked.

### F11 — Credential-availability questions scattered downstream (minor)

GSC credentials are "prompted-optional" *inside* the S1 lane
(`WEB-FACTORY-S1-SITEMAP.md:228-230`); `DATAFORSEO_*` presence is
checked at SOP Step 6 (`WEB-FACTORY-SITEMAP-SOP.md:430-433`);
`ACME_EMAIL`, `TWILIO_*`, `RESEND_*` at S6 wiring. S0 could ask one
"credentials available?" checklist — it is the only time the operator
is guaranteed present. Each downstream prompt is a lane pause waiting
on a human that was already in the room at intake.

### F12 — `page_class: location` not in the closed set (minor, cross-module)

Location spec emits `page_class: location`
(`WEB-FACTORY-LOCATION-PAGES.md:270-271,322`) against S1/PRD's closed
`money|article|ancillary` (PRD §5.2, `WEB-FACTORY-S1-SITEMAP.md:110`).
Not S0's own defect, but S0's `site_type` answer is what *decides*
whether location rows exist — flagging because the brief's class
vocabulary and the sitemap's class vocabulary are both moving targets
this stage must pin against. Owned by the S1 audit; cross-listed so
the S0 PRD doesn't inherit it blind.

### F13 — Voice/differentiator fields are "collected" with no field list (minor)

S2 fingerprint source 2 reads `voice:`, `audience:`, `differentiator:`
from the brief (`WEB-FACTORY-S2-TONE-PLAN.md:98-99`). PRD §5.1 says
"voice fields"; SKILL.md:44-46 lists "voice fields" inside entity
facts. Nobody names which voice fields exist. The niche-default
fallback (`WEB-FACTORY-S2-TONE-PLAN.md:203-207`) absorbs it, but the
field list is the difference between the operator's voice and a
generic local-service voice shipped at S7.

## 5. Split/sub-module proposal

S0 today is one boss-driven Q&A. The evidence says it should be three
sequential sub-lanes plus an optional fourth, with S1 inheriting the
evidence work it actually owns:

```
S0a intake (operator Q&A, the only human step)
      │
      ▼
S0b verification (machine lane — no operator)
      │  ABN/address/GBP/domain/phone checks; deploy-alias probe;
      │  competitor name→domain resolution + liveness check
      ▼
S0c brief assembly (machine — writes site/site-brief.md against
      │  the canonical template; flags every unverified/absent field)
      ▼
[S0d design+asset intake — OPTIONAL, runs only if S0a answers
       "yes, design refs exist": drops DOX ZIP / captures into
       site/design/ so S5's precondition is already satisfied]
```

**Competitor census: stays in S1, formalised as an S1 sub-lane — not
an S0 sub-step.** Reasons:

1. The census is SERP-derived, not operator-derived. SOP Step 3 builds
   the mining pool from domain-frequency across fan-out queries
   (`WEB-FACTORY-SITEMAP-SOP.md:117-144`); per-cluster top-3 winners
   differ from global winners (the plumber cost-cluster evidence,
   `:140-144`). An S0 census could only mine operator-named domains —
   a subset, and in weak operator answers an empty set. Putting the
   census in S0 makes the map rest on the operator's competitor list;
   keeping it in S1 makes it rest on evidence.
2. S1's own spec already orders it: Step 2 SERP fetch → Step 3
   competitor sitemap+content extraction (`WEB-FACTORY-S1-SITEMAP.md:
   55-68`). The SOP sharpens it to per-cluster top-3 (Step 5,
   `WEB-FACTORY-SITEMAP-SOP.md:168-215`). The machinery is written;
   what is missing is a *named sub-lane boundary*.
3. **What S0 should contribute:** competitor `{name, domain}` pairs +
   the operator's nominated leader (F7), and the `service_area`/
   `suburb_list` enumeration the census's location-family histogram
   cross-checks against (F2). Operator answers seed the pool; the
   census is run on evidence.

The S1-side formalisation the S0 PRD should name (to be picked up by
the S1 PRD): split S1 into `web-sitemap-research-<site>` (Steps 1–5:
seeds → fan-out → SERP → cluster → census, emitting `serp.jsonl` +
`competitors/<slug>/` + `site/competitor-census.md`) and
`web-sitemap-map-<site>` (Steps 6–10: volume tiers → rows → manifest →
gate). The census artifact becomes gate-visible (it already is —
coverage table at Step 10, `:386-399`) and reusable by the
location-pages lane, which currently re-samples suburb SERPs
independently (`WEB-FACTORY-LOCATION-PAGES.md:240-244`) instead of
reading the census the S1 lane already produced.

## 6. Automation surface

Everything in S0b is mechanical. Named automatable checks:

| Tool stub | Does | Consumed by |
|---|---|---|
| `tools/brief_lint.py` | Parses `site/site-brief.md` against the canonical template; every required field present, `## Deploy` all four keys, ≥1 contact destination, `site_type` in the *reconciled* closed set, `service_area` present for `local`; exits non-zero on `brief-intake-empty`-class empties | S0c done-gate; S1 mint precondition |
| `tools/gbp_categories.py` | Maps page-source category extraction (documented method — localsearchforum page-source technique; `categories.list` API where creds exist); returns top-category candidates per competitor domain | S0a GBP step; the "closest-match beats most-listed" judgment stays human |
| `tools/entity_verify.py` | ABN/ACN lookup (AU), address-vs-GBP NAP comparison, `curl` existing-domain liveness, phone E.164 sanity; emits `verification:` block for the brief front-matter — `verified | flagged` per fact | S0b |
| `tools/deploy_probe.py` | `ssh <host_alias> 'test -d <docroot> && test -w <docroot>'` via `ProxyJump jump` — S7 step-2's exact probe, run at intake; records `probe: pass|fail|skipped` in the brief | S0b; deletes the S7-late-discovery failure mode |
| `tools/competitor_resolve.py` | name→domain resolution (search + operator confirm), domain liveness, `/sitemap.xml` presence flag | S0b; seeds S1's mining pool |

Lane judgment that stays human: the site-class answer itself, the GBP
closest-match call (`SKILL.md:74-76` — "names what the business
*lists*, not what it *does*" is judgment by definition), `## Reference
copy` selection, and every `flagged` fact the verification pass could
not resolve — flags surface in the brief for the operator's
`ACCEPT SITEMAP`-time correction.

## 7. SOP skeleton — `web-discovery-<site>` lane

After the PRD lands, the lane executes:

1. **Seed.** Read `NEW-WEBSITE <intent>` verbatim; draft a question
   plan (site-class first, then conditional arms).
2. **Ask site class** on the *reconciled* four-axis model (F8):
   business model × market scope × niche risk × posture → maps onto
   the S1 six-way `site_type` set with a declared table, not A1
   guessing.
3. **GBP arm** (service classes): collect the niche keywords + service
   area; run `gbp_categories.py` over top Maps listings; operator
   confirms closest-match primary + secondary. Ask the client's own
   GBP state (exists/categories/verified).
4. **Entity facts.** brand, offering (3–8 explicit `seed_topics` — ask
   them, don't extract), audience, geo(s) *as `service_area` +
   `suburb_list` enumerations for `local`*, services,
   `depot_address` + `delivery_zone_km` when a depot exists, voice
   fields (named list), `## Reference copy`, competitor
   `{name, domain}` pairs + nominated leader, existing-site URL.
5. **Verification pass.** `entity_verify.py` over every checkable
   fact; `deploy_probe.py` on the `## Deploy` block; unresolved
   facts land as `flagged:` entries, never silent.
6. **Contacts + deploy.** `contact_email`, `contact_phone`,
   `notify_phone` (≥1 email/phone); `## Deploy` all four keys +
   `host.type` + mail-provider/ACME hints (F4/F9).
7. **Design intake (S0d, conditional).** "DOX packet / brand kit /
   reference sites?" — yes → place under `site/design/`; record the
   source kind for S5's mint precondition.
8. **Assemble.** Write `site/site-brief.md` against
   `research/site-brief.md` canonical template; every field either an
   operator answer, a `verified`/`flagged` verification result, or
   explicit `open:` marker.
9. **Lint + done.** `brief_lint.py` exit 0; refuse `brief-intake-empty`
   when no seed topics; commit `site: brief`.

## 8. Cross-module contracts

What S0 owes (→) and expects (←):

| Sibling | S0 owes | Conflict found |
|---|---|---|
| S1 sitemap | `site_type` (reconciled set), `geo`, `gbp_*_category`, `seed_topics` (explicit, 3–8), `brand`, `competitors[]` as domains, existing-site URL | F3 set mismatch; F5 seeds uncollected; F7 names-vs-domains |
| S1 location arm (module spec) | `service_area` suburb/LGA list (refuse-level), `depot_address`, `delivery_zone_km`, `suburb_list` | F2 — none collected; module refuses at mint |
| S2 tone+plan | `## Reference copy`, named voice fields (`voice`, `audience`, `differentiator`) | F13 — fields unnamed upstream of the read |
| S3 writing | entity facts verbatim-quotable: services, qualifications, phone, CTA destination | covered by F6 (verification) — S3 binds hard, so wrong facts are *durable* wrong facts |
| S4 cleanup | verbatim fact strings to preserve | same as S3 — F8's collision class lands here |
| S5 design | entity facts, CTA destinations, `<slug>` site key; **design sources placed under `site/design/`** | F10 — S5's ≥1-design-source precondition has no S0 collection arm |
| S6 integrations | `contact_email`, `contact_phone`, `notify_phone`, `host.type` | F4 — `host.type` uncollected |
| S7 deploy | `## Deploy` four keys; probe evidence | F9 — collect-and-probe beats collect-and-hope |
| prd-herdr | `brief.json` writer is **S1**, not S0 (`WEB-FACTORY-S1-SITEMAP.md:34` vs skill's parenthetical, `SKILL.md:12-13`) — boundary is consistent but worth stating: S0 emits markdown only | none — noted for the PRD |

## 9. Verdict

S0 cannot be PRD'd into machinery yet. Before its PRD is writable,
four prerequisites must exist:

1. **`research/site-brief.md` canonical template** (F1) — the field
   grammar every finding above lands on. Blocks: lint tooling, the
   verification-block shape, the flagged-fact convention. This is the
   template-file landing ADVERSARIAL-REVIEW already recommended.
2. **A reconciled `site_type` taxonomy** (F3/F8) — one closed set,
   S0's question axes mapping onto S1's six classes with a declared
   table; kills assumption A1 and makes `page_class` priors
   honest. This is a PRD-§5.1-level decision, not a spec patch.
3. **The missing-field amendment** (F2/F4/F5/F7) — `service_area`,
   `depot_address`, `delivery_zone_km`, `suburb_list`, `seed_topics`,
   `host.type`, competitor domains added to the field contract so the
   S1/location/S6 consumers stop refusing or guessing downstream.
4. **The sub-lane split** (§5) — intake → verification → assembly (+ optional
   design intake) so the authenticity theme has a home, and the
   competitor census stays where the evidence is (S1) but as a named
   sub-lane emitting `competitor-census.md`.

Once those land, S0 decomposes cleanly: one human step, three
machine passes, five tool stubs, and a lint gate — the smallest stage
in the factory and the one every other stage's correctness silently
depends on.
