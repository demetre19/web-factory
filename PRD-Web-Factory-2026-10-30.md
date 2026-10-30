# PRD — Web Factory

**Date:** 2026-10-30
**Status:** Draft for `APPROVE PRD` typed decision
**Owner:** operator (boss workspace w57)
**Deliverable class:** Stage-2 deliverable of the NEW-PRD flow — every stage spec below already exists and is landed; this document is the synthesis, not new stage design.

---

## 1. Problem statement

Operators produce lead-generation and brochure sites by hand: research the niche, plan the sitemap, write copy, interlink, design, integrate a contact form, harden, deploy. Every stage exists commercially in isolation — prompt-to-site builders (Relume, Framer AI, Durable, 10Web) generate pages without SEO depth; topical-map tools (Topical Map AI, Surfer) stop at a spreadsheet; AI writers mass-produce copy nobody interlinks or de-slops; interlinkers bolt onto WordPress after the fact. **No external product runs the whole sequence as a gated pipeline that emits a real, owner-controlled codebase** (DISCOVERY-RESEARCH §0).

The Web Factory is the integration: a prd-herdr-driven stage pipeline that turns a `NEW-WEBSITE` trigger into a launch-ready Astro static site — an owned artifact, not a rented canvas.

**Build-new verdict (from `DISCOVERY-RESEARCH-web-factory.md` §5):** build it. The market validates each stage individually and leaves the integration empty. Discovery risks the PRD must carry:

- **R1 — Scaled-content penalty.** Template-fill page farms are the exact pattern Google penalizes. Answered by: per-page semantic depth (S1 entity/keyword research per route, S3 heading discipline, S4 corpus-wide cleanup), the location-page cap (S1 Step 8 / Contested 5), and the human `ACCEPT SITEMAP` gate.
- **R2 — GEO/AEO shift.** Search moves toward AI answer surfaces. Answered by: entity enrichment at S1, answer-first informational headings at S3.
- **R3 — Humanizer arms race.** Answered by: S4 cleanup targets quality classes (invisible chars, disclosure residue, banned tokens, rhythm tells), never detector scores.
- **R4 — Lock-in pressure.** Answered by: every intermediate artifact is platform-neutral markdown/JSON in the run folder; the only emitted product is a self-contained Astro static export.

---

## 2. Locked architecture decisions (D1–D9 — restated, not re-opened)

| # | Decision |
|---|---|
| D1 | prd-herdr owns **only** the `NEW-WEBSITE`/`NEW WEBSITE` trigger row in `TRIGGER_ROUTES` plus a thin `prd-website` skill pointer. The Web Factory repo owns everything else: stage specs, `skills/`, `templates/astro/`, `sites/<slug>/`, `keys/` manifests, `docs/machinery/WEB-FACTORY.md`. |
| D2 | Pipeline order: **S0 discovery → S1 sitemap → S2 tone/plan → S3 write → S4 interlink+cleanup → S5 design→Astro → S6 integrations → S7 gate+deploy.** |
| D3 | Two typed human gates only: `ACCEPT SITEMAP` (post-S1) and `APPROVE SITE` (post-S5/S6, discharged at the S7 operator loop). |
| D4 | `pi/WRITER` role binds content lanes (S3). Never a model literal. |
| D5 | Vendored `templates/astro/` starter is the build base; Design-library Website Build DOX packets are an optional S5 input. |
| D6 | Deploy = rsync to the operator-configured host; rollback = previous `dist` snapshot (symlink-flip release dirs). |
| D7 | SEO: SERP checks mandatory; GSC and Cora are optional research tiers, degradation-safe. |
| D8 | Per-site `RATIONALE.md` records every design/content decision. |
| D9 | Adversarial review of each stage spec is a required artifact (`research/ADVERSARIAL-REVIEW.md` is the cross-stage instance; each spec's `## Contested` is the per-stage instance). |

**D10 — schema reconciliation (this PRD adds; resolves F1):** `sitemap.md` is the route-table authority and is emitted under the S1 schema (§4.1). `content-plan.md` is a *projection* of it: S2 emits `slug` (derives from `route`'s last path segment), `path` (= `route` verbatim), `type` (= `page_class`; S1's `ancillary` renders as `utility` in the plan vocabulary), `primary_keyword` (= head of `target_keywords`). The closed page-type set is `money | article | ancillary` — `utility` in S2–S5 vocabulary is the `ancillary` alias. Conformance patch to the S2–S5 specs is OI-3 below.

---

## 3. Stage map

```
NEW-WEBSITE trigger (prd-herdr TRIGGER_ROUTES)
        │
        ▼
S0 discovery ──> site-brief.md, brief.json
        │
        ▼
S1 sitemap ──> sitemap.md          [typed gate: ACCEPT SITEMAP]
        │
        ▼
S2 tone+plan ──> tone-profile.md, content-plan.md
        │
        ▼
S3 writing ──> content/<slug>.md   (parallel pi/WRITER lanes, ≤6 rows/batch)
        │
        ▼
S4 interlink+cleanup ──> link-graph.md, content-final/, cleanup-report.md
        │
        ▼
S5 design→Astro ──> design-dna/, sites/<slug>/ (+ dist/ proof)
        │
        ▼
S6 integrations ──> integrations.json, form.php, headers, INTEGRATIONS.md
        │
        ▼
S7 gate+deploy ──> seo-gate-report.md, deploy-report.md, live site
        │          [typed gate: APPROVE SITE, inside the ~10% tweak loop]
        ▼
      seal — the factory's done
```

All cross-stage I/O rides the run's shared `site/` folder — the run folder is the artifact of record (§5, F6). Per-stage contract summaries:

| Stage | Spec | Contract in one paragraph |
|---|---|---|
| S0 Discovery | intake (prd-herdr side) | Structured Q&A producing `site-brief.md`. First question is **site class** (`local` \| `national` \| `ecom`). For `local`/`national` the brief must carry `gbp_primary_category` + `gbp_secondary_category`, discovered via the GMB extractor / SEO Time Machine method: search the niche's core keywords on Maps, open top-ranked listings, read their Top Categories, pick the category closest to what the business actually does. Also collects entity facts, geography, competitor names, reference copy, `## Deploy` target (`host_alias`, `user`, `docroot`, `url`), and contact destinations (`contact_email`, `contact_phone`, `notify_phone`). |
| S1 Sitemap | `WEB-FACTORY-S1-SITEMAP.md` (prd-herdr `research/`) | Turns the brief into `sitemap.md`: topical map (pillar → cluster → support), route table with the URL=H1=title-tag lock minted per row, ancillary-page matrix per `site_type`, and a `research-inputs` degradation manifest. Research tiers: SERP always (a `serp.ran: false` lane refuses), GSC/Cora/entities/embeddings optional and recorded. Ends at the `ACCEPT SITEMAP` human gate — nothing downstream mints until the operator accepts the map. Category→route contract: homepage H1 = **brand**; each GBP category owns exactly one money route whose URL+H1+title carry the category phrase; location pages are `<primary category> <suburb>` for the ~20 largest suburbs; nav labels are shortened forms — the lock binds URL/H1/title, never the label. |
| S2 Tone+plan | `research/WEB-FACTORY-S2-TONE-PLAN.md` | One lane, sequential. Produces `tone-profile.md` (frontmatter lint bounds, voice statement, lexical table, banned list, CTA palette, trust vocabulary, before/after) and `content-plan.md` (one row per sitemap row + `## Writer batches`, money batches first, ≤6 rows per batch). Downstream refuses to mint on a stale or missing pair — S3/S4 re-check row-count parity at mint. |
| S3 Writing | `research/WEB-FACTORY-S3-WRITING.md` | Parallel `pi/WRITER`-bound lanes, one per `## Writer batches` entry, producing `content/<slug>.md` per owned row: frontmatter (`title` ≤60, `description` 140–160, `slug`, `path`, `type`, `primary_keyword`), skeleton-H2 discipline, money/article posture split, link seeds placed as `[anchor](<row.path>)` (canon link notation — F2/F3 fix landed), tone profile and `site-brief.md` facts bound hard. One commit per page. |
| S4 Interlink+cleanup | `research/WEB-FACTORY-S4-INTERLINK.md` | Two lanes, strictly ordered. Graph lane computes `link-graph.md` — every plan `link_seed` an edge, orphans fixed, ≤3 body outbound, `## Notes` audit — *before* any page file changes. Apply lane injects edges (idempotent `present` short-circuit, `body` first-occurrence wrap, `related` demotion), then runs the corpus-wide cleanup pass emitting `content-final/` + `cleanup-report.md` (7 removal classes; frontmatter, link targets, entity facts, heading skeleton never touched). |
| S5 Design→Astro | `research/WEB-FACTORY-S5-DESIGN-DNA.md` | Two lanes, strictly ordered. Distill lane normalizes both design sources (DOX packet verified by checksum; operator HTML/screenshot refs read as observation only, never executed) into `site/design-dna/` — `TOKENS.json`, `CLASS-SYSTEM.md`, `COMPONENTS.md`, `ROUTE-MANIFEST.json`, `PAGES/*/SPEC.md`, `DESIGN-DNA.md`. Build lane scaffolds `sites/<slug>/` from vendored `templates/astro/` (never `npm create`), binds `content-final/` to routes on `path`, enforces **fluid typography** (utopia-style `clamp()` scale site-wide — no breakpoint-stepped sizes), a real functional mobile menu (hamburger → focus-trapped panel), a complete footer (site map + NAP), and shortened nav labels. `astro build` must exit 0 with one `dist/` page per route. |
| S6 Integrations | `research/WEB-FACTORY-S6-INTEGRATIONS.md` | One wiring lane per site. `site/integrations.json` is the single capability registry (`form_delivery`, `sms_notify`, `ssl`, `security_headers`), resolved once against the operator environment; every capability degrades rather than blocks except SSL. Emits `public/form.php` (PHP — the one runtime the SSH-host contract implies; Resend → SMTP → mailto degrade chain; honeypot + timestamp anti-bot), `.htaccess`/nginx snippet + `public/_headers`, `.env.sample` (key names only — no secret ever commits), and `INTEGRATIONS.md` (the audit artifact). |
| S7 Gate+deploy | `research/WEB-FACTORY-S7-GATE-DEPLOY.md` | One deploy lane per site: clean `astro build` → 13-check SEO gate against `dist/` (route parity, titles, canonicals, OG, sitemap.xml, robots, internal links, self-containment, alts, CTA endpoints, heading levels) → atomic rsync deploy (`releases/<ts>/` + `current` symlink flip, ≤5 releases retained) → HTTP smoke → operator ~10% tweak loop (rebuild → re-gate → re-deploy → re-smoke per iteration) → operator sign-off = `APPROVE SITE` = seal in `deploy-report.md`. `dist/` never commits. |

---

## 4. Gate model

Two typed human gates; everything else is machinery mint preconditions and stage done-criteria.

### 4.1 Typed human gates (D3)

| Gate | Position | Mechanism | What the operator sees |
|---|---|---|---|
| `ACCEPT SITEMAP` | post-S1, pre-S2 | `crew answer`-class decision row; stage machinery parks S2 minting until `accepted` | `sitemap.md` link + one-screen summary: route count by class, pillars, research-inputs manifest, dropped/redirected existing routes. Edits apply as row edits, then re-present. |
| `APPROVE SITE` | S7 operator loop, post-deploy | operator sign-off recorded in `deploy-report.md` `## Seal` | the live deployed `<url>` + `seo-gate-report.md` + `deploy-report.md` — the real site, not a diff. |

### 4.2 Machinery gates (per stage)

Every stage carries two gate classes:

1. **Spec-existence gate** — `test -s research/WEB-FACTORY-S<stage>-*.md` proves the spec the lane runs from.
2. **Mint preconditions + done-criteria** — the consuming stage's mint gate re-checks the producing stage's acceptance: row-count parity (`sitemap` ↔ `content-plan` ↔ `content/` ↔ `content-final/` ↔ `ROUTE-MANIFEST.json` ↔ `dist/` — the same invariant re-checked at every seam), frontmatter parse + `slug`/`path` match, banned-token/invisible-char zero, edge-target resolution, `astro build` exit 0. The lint tools (`tools/sitemap_lint.py`, a future `seo-gate` binary) plug into the same checklists without changing the contract — the corpus's stated posture is prose lints the lane self-executes until the tools land.

Defense-in-depth principle (from the adversarial verdict): the re-checks verify *existence and count*; the PRD adds *shape and version* — §4.1's canonical schema is the shape authority, and F10's plan digest is the version fix.

---

## 5. Data and schema contracts

All run-scoped artifacts live in the run's shared **`site/` folder**. **F6 resolution — `site/` semantics (decided here):** `site/` is git-tracked inside the lane worktrees on the run's site branch — it is a review surface like every other artifact, not an out-of-band blackboard. Visibility rule: a sibling lane sees a writer's file after the writer's per-page commit *and* the coordinator's collection point — stage mint preconditions (not push events) are the visibility contract. Shared-file collisions are prevented by disjoint `write_paths` per lane; the two genuinely shared artifacts (`link-graph.md`, `cleanup-report.md`) are each written by exactly one S4 lane, so no multi-writer file exists in the pipeline.

### 5.1 `site-brief.md` — intake artifact (owner: S0)

Carries every entity fact the factory binds: brand, offering, audience, `site_type` (`local | national | ecom`), geo(s), `gbp_primary_category` + `gbp_secondary_category` (required for `local`/`national`), voice fields, `## Reference copy`, competitors, services, contact destinations (`contact_email`, `contact_phone`, `notify_phone`), and `## Deploy` (`host_alias`, `user`, `docroot`, `url`). Writers and cleanup quote it verbatim; a fact the brief does not carry is omitted or flagged, never fabricated.

### 5.2 `sitemap.md` — route-table authority (owner: S1; schema of record)

Home: `sites/<slug>/sitemap.md`. YAML front-matter + `## Topical map` + `## Route table` (first table after the heading, exact header row; cells split on unescaped pipes only — `title_tag` embeds `\|`).

| Column | Rule |
|---|---|
| `route` | URL path slug derived from H1, leading+trailing slash — e.g. `/auto-dent-removal-service/` |
| `kw_group` | stable cluster id `kg-<n>`; `null` on ancillary rows |
| `intent` | `commercial \| comparison \| informational \| transactional \| local \| navigational` (closed set) |
| `parent` | pillar/cluster `route`, or `(root)` — the interlink skeleton |
| `page_class` | **`money \| article \| ancillary` — the closed type set** |
| `H1` | locked H1 text — `slugify(H1) == route` |
| `title_tag` | `<H1> \| <Brand>` default; consistency lock, not byte-equality |
| `target_keywords` | 3–8 priority-ordered keywords from the row's `kw_group` |
| `status` | `planned → accepted → written → linked → built → live` — stamped per stage |

This schema is the F1 fix: one owner, named columns, closed sets, a lint gate (`tools/sitemap_lint.py`) enforcing lock consistency, parent resolution, ancillary-matrix satisfaction, and `serp.ran: true`.

### 5.3 `tone-profile.md` (owner: S2)

Canonical template: `research/tone-profile.md`. Frontmatter bounds (`dialect`, `person`, `reading_level`, `sentence_avg_max`, `emoji`, `exclamations_per_page_max`), voice statement with mandatory `**Source:**`, lexical table (≥8 rows), `## Banned` (one token per bullet — literal substring, word-bounded matching per F8), CTA palette, trust vocabulary, before/after.

### 5.4 `content-plan.md` (owner: S2)

Canonical template: `research/content-plan.md`. Columns (parse contract — S3/S4 consume verbatim):

`slug | path | type | primary_keyword | secondary_keywords | intent | word_target | heading_skeleton | link_seed | cta`

Projection of `sitemap.md` per D10. `## Writer batches` assigns every row to exactly one `web-writer-<site>-b<N>` lane, money first, ≤6 rows. Per F7: cell values may not contain `|`, `;`, `->`, `,` except as the documented separators — declared grammar, enforced by the S2 lint.

### 5.5 `link-graph.md` (owner: S4 graph lane)

Canonical template: `research/link-graph.md`. Columns: `source_slug | target_slug | anchor | kind | placement`; `kind ∈ {seed, added}`, `placement ∈ {body, related}`; `## Notes` carries orphans, added-edge reasons, demotions, dropped edges, and (per F9) any anchor the cleanup pass rewrote.

### 5.6 Supporting contracts

- `site/integrations.json` — capability registry (`web-factory-integrations/v1` schema; key *names*, never values).
- `site/link-graph.md`, `site/cleanup-report.md`, `site/design-dna/DESIGN-DNA.md`, `site/INTEGRATIONS.md`, `site/seo-gate-report.md`, `site/deploy-report.md` — the per-stage review artifacts.
- `site/design-dna/ROUTE-MANIFEST.json` — the build-side route list; route count is always `sitemap.md`'s authority.
- `sites/<slug>/sitemap.md` vs `site/sitemap.md`: per the F1/F4 resolution note recorded at spec time, **S0/S1 artifacts land under the consuming run's repo** — the factory repo holds the specs, the run's repo (or the run's `site/` folder inside the factory checkout for single-repo runs) holds the artifacts. The S1 spec writes `sites/<slug>/sitemap.md`; the S2–S7 specs read `site/sitemap.md`. These are the same file under the run-folder convention: `site/` is the run-scoped alias for the site's artifact tree. Where they physically differ (S1 lane writing `sites/<slug>/`), the coordinator's collection point copies it into `site/` before S2 mints — recorded as OI-2.

---

## 6. Adversarial-review fold — F1–F11 dispositions

Source: `research/ADVERSARIAL-REVIEW.md` (independent cross-stage review; S6/S7 were ABSENT at review time, both since landed).

| # | Finding | Disposition |
|---|---|---|
| F1 | `sitemap.md` schema had no owner — 4 stages quoting an unwritten grammar | **Closed by this PRD** — §5.2 declares the schema of record (columns, closed `type` set, intent set, status transitions). S1 spec landed in prd-herdr `research/`. Residual: S2–S5 column-name/closed-set drift (`type` vs `page_class`, `utility` vs `ancillary`) → conformance patch is OI-3, tracked below. |
| F2 | S3 wrote `/{slug}` links; S4/S5 are `path`-canon — double-injection or broken links | **Fixed on main** — canon link notation `[anchor](<row.path>)` (leading+trailing slash, verbatim from the row); S3 spec patched, S4 `present` check and injection both use it. |
| F3 | S4 injection href form ambiguous (`/<path>/` + already-slashed paths) | **Fixed on main** — same canon: inject `[anchor](<row.path>)`, never append a `/`; paths always carry leading+trailing slash by the S1 lock. |
| F4 | S6/S7 absent — factory could not finish | **Fixed** — both specs landed (`WEB-FACTORY-S6-INTEGRATIONS.md`, `WEB-FACTORY-S7-GATE-DEPLOY.md`). "Done" is now defined: the seal. |
| F5 | `## Related` after the CTA contradicts S3's "every page ends on its `cta`" | **Decided:** the pitch ends on the CTA; a `## Related` navigation block may follow it — S4's placement stands (navigation, not pitch), S3's contract reads "ends on the CTA" of the *pitch*. Precedence: CTA paragraph, then Related block, page end. Patch S3's wording in the same conformance pass as OI-3. |
| F6 | `site/` shared-folder semantics undefined | **Closed by this PRD** — §5's git-tracked/visibility rule is the decision: tracked on the site branch, mint preconditions are the visibility contract, no file has two writers. |
| F7 | `content-plan.md` cells can't quote `|`/`;`/`->`/`,` | **Accepted grammar + lint** — banned-as-content separator rule declared in §5.4; moving the two list columns to fenced blocks deferred (OI-4) if real anchors hit it. |
| F8 | Banned-token class collides with entity facts; no match grammar | **Decided:** tokens match as literal substrings, word-bounded, case-insensitive; a collision inside a verbatim entity fact → flag in `cleanup-report.md` `## Flags` and leave the fact — flags block S5 mint until the operator or boss resolves (flags are review-blocking by contract, not silent). |
| F9 | Rewritten anchors diverge from graph-of-record | **Accepted-risk + one-line fix:** rewritten anchors land in `cleanup-report.md` **and** the graph's `## Notes` (S4 spec patch, same conformance pass). |
| F10 | Stale-row blindness — coverage counts files, not row freshness | **Decided — plan digest:** S2 stamps a `plan_digest` (content hash over the table rows) into `content-plan.md` front-matter; each `content/<slug>.md` records the digest it was written against; S4's mint gate compares per-file digests to the plan's — stale copy refuses the mint instead of shipping under a green count. The DOX packet's `routePlanChecksum` is the same mechanism — one pattern, two consumers. Spec patches: S2 (emit digest), S3 (record digest), S4 (compare) — OI-5. |
| F11 | `dist/` ownership unpinned | **Fixed by S7 spec** — `dist/` is disposable-until-S7: `.gitignore`d, S7 rebuilds unconditionally, reports name the build's HEAD+timestamp. |

P3 observations carried forward: lints are prose checklists self-executed by lanes until `sitemap_lint.py`/`seo-gate` tools land (stated factory posture); `## Related` needs a row cap (add to the S4 conformance patch); duplicated row-count re-checks are intentional defense — F10's digest turns them into version checks.

---

## 7. Rollout — the prd-herdr change surface

Per D1, prd-herdr touches exactly one row and one pointer:

1. **`TRIGGER_ROUTES` row** in `extension/gated.js` (prd-herdr): `NEW-WEBSITE` / `NEW WEBSITE` → the web-factory intake flow; single-line change surface.
2. **`prd-website` skill pointer** — a thin skill that resolves the trigger to this repo's `docs/machinery/WEB-FACTORY.md` runbook (to be authored — OI-6) and the stage specs under `research/`.

Everything else — stage specs (`research/`), canonical templates (`research/{sitemap,tone-profile,content-plan,link-graph}.md`), `skills/` (per-stage lane skills, to be created), `templates/astro/` (vendored starter, to be created), `sites/<slug>/`, `keys/` manifests, `docs/machinery/WEB-FACTORY.md` — lives in this repository.

### Open items carried by the PRD (tracked, not blocking approval)

| # | Item | Owner |
|---|---|---|
| OI-1 | `templates/astro/` vendored starter does not exist yet — first S5 run cannot scaffold without it | factory repo |
| OI-2 | Coordinator collection point: S1 emits `sites/<slug>/sitemap.md`, S2–S7 read `site/sitemap.md` — the copy-into-`site/` seam needs its one line in `docs/machinery/WEB-FACTORY.md` | factory repo |
| OI-3 | Conformance patch across S2–S5 specs: `type`/`page_class` naming, `utility`→`ancillary` set, F5 CTA/Related precedence wording, F9 graph-notes line, `## Related` row cap | factory repo |
| OI-4 | F7 upgrade path: move `heading_skeleton`/`link_seed` to per-row fenced blocks if real content hits separator limits | deferred |
| OI-5 | F10 plan digest implementation (S2 emit, S3 record, S4 compare) | factory repo |
| OI-6 | `docs/machinery/WEB-FACTORY.md` runbook + `skills/` per-stage lane skills | factory repo |
| OI-7 | `tools/sitemap_lint.py` + `seo-gate` mechanical checkers (the specs' lint posture is prose-until-tooled) | factory repo |
| OI-8 | S1 spec's two vendored deterministic modules (YAKE/PMI analysis half, semantic scorer) under `lib/` | factory repo |

---

## 8. Falsifier

This PRD is dead if a cheaper existing primitive produces launch-ready, owner-controlled, SEO-verified Astro sites through the same gated handoffs — i.e. if a prompt-to-site builder or a pSEO pipeline exists that (a) emits a self-contained static codebase the operator owns, (b) derives interlinking from the topical map at build time, (c) runs de-slop and hardening as gates, and (d) costs less than this eight-stage lane choreography. DISCOVERY §0's scan found none as of 2026-10-30; the first incumbent that does all four kills the integration rationale, and the factory should instead wrap that primitive.

---

## 9. Scope census

Repo paths this PRD covers (real paths, verified at draft time):

- `research/` — the seven stage specs (S2–S7 landed here; S1 + DISCOVERY in prd-herdr `research/`), canonical templates (`content-plan.md`, `tone-profile.md`, `link-graph.md`), `ADVERSARIAL-REVIEW.md`.
- `skills/` — per-stage lane skills — **to be created** (OI-6).
- `templates/astro/` — vendored Astro starter — **to be created** (OI-1).
- `sites/<slug>/`, `keys/` — per-site build trees and env manifests — created per run.
- `docs/machinery/WEB-FACTORY.md` — runbook — **to be created** (OI-6).
- prd-herdr side: `extension/gated.js` `TRIGGER_ROUTES` (one row) + the `prd-website` skill pointer (D1); `research/WEB-FACTORY-S1-SITEMAP.md` + `research/DISCOVERY-RESEARCH-web-factory.md` (inputs, already landed).

---

## 10. Approval

This document is ready for an **`APPROVE PRD`** typed decision.

- **Approve** → OI-1/OI-6 (starter + runbook) become the first build lanes; the `TRIGGER_ROUTES` row + skill pointer land in prd-herdr.
- **Edits** → row-edit this document and re-present.
- **Reject** → state the falsifier or defect; the queue row drops.
