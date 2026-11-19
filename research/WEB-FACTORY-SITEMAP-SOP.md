# WEB-FACTORY-SITEMAP-SOP — S1 operating procedure: niche research → accept-able sitemap.md

Class: `web-factory-sop` — the executable recipe a `web-sitemap-<site>`
lane runs inside stage S1. It operationalises
`research/WEB-FACTORY-S1-SITEMAP.md` (prd-herdr checkout) — the stage
spec owns the *contract* (schema, tiers, M1–M9 decisions); this document
owns the *how* (exact fan-out grammar, competitor-sitemap mining method,
keyword-volume integration, degraded fallback order). Where the two
disagree, the stage spec wins and §10 records the delta.

Authority chain: `PRD-Web-Factory-2026-10-30.md` §5.2 (sitemap.md
schema of record) → `WEB-FACTORY-S1-SITEMAP.md` (11-step pipeline,
tiers, manifest) → this SOP (per-step mechanics). Sibling lane note:
location-page *modules* are a separate research lane's file — this SOP
specifies only the route-cap and suburb-selection rules S1 needs.

## Position in the stage

```
site-brief.md ──> Step 1 seeds ──> Step 2 fan-out ──> Step 3 SERP fetch
      │                                    │              │
      │                                    ▼              ▼
      │                            Step 4 cluster ◄── competitor set
      │                                    │
      │            Step 5 competitor sitemap mining (top-3 per cluster)
      │                                    │
      │            Step 6 volume tier (DataForSEO or degraded)
      │                                    ▼
      └──────────────> Step 7–9 row assembly, caps, manifest
                                       │
                                       ▼
                          Step 10 ACCEPT SITEMAP gate
```

Every step names its inputs, tools, and outputs. A lane executing this
SOP writes exactly the S1 write set: `sites/<slug>/sitemap.md`,
`sites/<slug>/brief.json`, plus scratch evidence under
`competitors/<slug>/`.

## Step 1 — Brief intake → seed keyword set

| | |
|---|---|
| **Inputs** | `site/site-brief.md` (PRD §5.1): `site_type`, `geo`, `gbp_primary_category`, `gbp_secondary_category`, `seed_topics`, `brand`, `competitors`, existing-site URL |
| **Tools** | none — parse + map |
| **Outputs** | `sites/<slug>/brief.json` (structured intake record — first commit) + `seeds[]` array |

Mapping rules:

1. **GBP categories → service seeds.** Each GBP category becomes one
   head service term verbatim: `gbp_primary_category: "Plumber"` →
   `plumber`; `"Hot water system supplier"` → `hot water system`.
   These own exactly one money route each (category→route contract).
2. **seed_topics → topic seeds.** Keep the operator's phrasing; do not
   reword into keywords. 3–8 seeds per the S1 spec.
3. **geo → modifier operands, not seeds.** `geo` never mints a seed; it
   parameterises the location bucket in Step 2 (`{primary_geo}` = city,
   `{suburb_list}` = suburbs, ranked by population/GBP proximity).
4. **competitors → competitor set seed.** Operator-named domains skip
   SERP discovery and go straight into the Step 5 mining pool.
5. **Canonical form.** Lowercase, singular-preferred
   (`plumber` not `plumbers` — plural variants ride the same kw_group),
   strip stopwords (`the`, `near me` is kept — it is an intent
   modifier, not a stopword).
6. Refuse `brief-intake-empty` when nothing above yields a seed —
   never invent (S1 Step 0, unchanged).

A typical `local` trade brief yields 3–6 seeds: 2 GBP categories +
1–4 seed topics. A `national` brief yields 3–8 with `geo` naming
state-level operands instead of suburbs.

## Step 2 — Query fan-out (seeds → query set)

| | |
|---|---|
| **Inputs** | `seeds[]`, `geo`, `site_type` |
| **Tools** | none — string grammar |
| **Outputs** | `queries[]` — `{query, seed_id, modifier_class, intent_label}` |

Each seed expands through a fixed modifier grammar. Count per seed:
**5 medium** (default), **8 broad** (seed is a head term for a
category-of-business), **3 narrow** (seed is already a long-tail
phrase ≥5 words) — the S1 spec's mode counts, applied deterministically
by seed length and class instead of a mode flag.

| Modifier class | Template | Intent label |
|---|---|---|
| `exact` | `{seed}` | commercial |
| `geo_head` | `{seed} {primary_geo}` | commercial (local) |
| `geo_suburb` | `{seed} {suburb}` × top-3 suburbs | local |
| `service_variant` | `{variant} {primary_geo}` — variants = the competing surface nouns in the niche (from Step 1 brief services or the first SERP pass: `emergency`, `24 hour`, `gas`, `blocked drain` for a plumber; `mobile`, `portable`, `pod`, `self` for storage) | commercial |
| `cost` | `{seed} cost {primary_geo}` / `{seed} call out fee` | transactional |
| `how` | `how much / how to / when to call {seed}` | informational |
| `best` | `best {seed} {primary_geo}` | comparison |
| `vs` | `{seed} vs {alt}` where `{alt}` is the category's natural alternative (`plumber vs handyman`; `mobile storage vs self storage`) | comparison |
| `near_me` | `{seed} near me` | local |
| `brand_generic` | `{competitor_name} alternatives` / `{seed} like {competitor}` — only when the brief names ≥1 competitor | comparison |

Per-seed order: `exact, geo_head, service_variant, cost, how, best,
vs, near_me, geo_suburb, brand_generic` — truncate at the mode count,
never skip `exact`/`geo_head`/`service_variant`.

**Dedup/canonicalise rules** (applied before fetching):

- lowercase; collapse whitespace; strip `?`/`!`;
- `{seed} {geo}` ≡ `{geo} {seed}` → keep geo-suffix form (it is the
  form title tags use — see evidence, e.g. gobox's `Mobile Storage
  Belair`, 24hour's `Plumber Coburg`);
- drop a query already produced by another seed **but record both
  parent seed_ids** — shared queries are cluster-merge evidence at
  Step 4;
- cap total queries at **8/seeds-broad, ≤64 per lane attempt** — the
  DDG rate-limit ceiling (SKILL.md named failure mode). Beyond 64,
  split by seed into `web-sitemap-<site>-<n>` sub-lanes and merge at
  the gate (S1 spec contested §2).

## Step 3 — SERP fetch + competitor set build

| | |
|---|---|
| **Inputs** | `queries[]` |
| **Tools** | DuckDuckGo HTML fetch (ported `DuckDuckGoFetcher`) primary; tinyfish `search` (args `query, location:"AU"`) escalation on throttle/empty; per-attempt result cache in the lane scratch dir |
| **Outputs** | `serp.jsonl` — `{query, position, url, domain, title, snippet}`; `competitors[]` — domain frequency table |

1. Fetch each query, top 10 organic. On 3 consecutive throttles or a
   <5-result response, switch the remaining queries to tinyfish and
   record `fetcher: tinyfish` (mixed fetchers are normal — record
   `fetcher: mixed` with per-query fetcher in `serp.jsonl`).
2. Apply `filter_competitor_urls` — drop social, video, forum,
   marketplace, Wikipedia, `.pdf`. **Real exception observed:**
   `localsearch.com.au`, `hipages`, `oneflare`, `yelp.com.au` are
   directory/aggregator domains — treat as `intent-evidence` (they
   confirm the query class) but never as mining candidates.
3. Build the domain frequency table: a domain's score = number of
   distinct queries it appears in. High-frequency domains are the
   mining pool. Facebook-group results (2 hits in the plumber demo)
   and Reddit are filtered — they are SERP features, not competitors.
4. **Per-cluster competitor set:** for each kw_group formed in Step 4,
   the mining pool is the top-3 domains by that cluster's query
   coverage — not necessarily the global top-3 (a cost-query cluster's
   winners are different sites than the money-query cluster's: in the
   plumber demo the cost SERP surfaced `jimsplumbing.com.au`,
   `mccarthyplumbinggroup.com.au`, `mozplumbing.com.au` — none of the
   money-cluster miners).

## Step 4 — Cluster SERP results → kw_groups

| | |
|---|---|
| **Inputs** | `serp.jsonl`, `queries[]` |
| **Tools** | word-overlap + Jaccard helpers (vendored); optional embeddings |
| **Outputs** | `kw_groups[]` — `{kg_id, members[], intent, owning_domains[], intent_label}` |

1. **SERP-overlap primary (M4).** Two keywords cluster when the Jaccard
   index of their queries' competitor-URL sets ≥ 0.3.
2. **Word-overlap fallback** for keywords with no SERP rows (autocomplete-only,
   GSC-only terms) — nearest scored neighbour at ≥0.3 token overlap.
3. **Seed-merge rule:** if two seeds' queries share ≥40% of cluster
   membership, merge the seeds into one kw_group and flag
   `cannibalization_candidate` — it becomes a Step 8 route-dedup input.
4. Number groups `kg-1…kg-n` order-stable: sort by cluster score
   (mean SERP frequency of members) before numbering — S2/S4 cite the
   id, so it must be reproducible.
5. Label each group's intent from the dominant `intent_label` of its
   member queries; ties break commercial > transactional > comparison
   > informational (revenue prior; the gate can flip it).

## Step 5 — Competitor sitemap mining (top-3 per cluster)

| | |
|---|---|
| **Inputs** | `competitors[]` per cluster (Step 3.4) + operator-named competitors (Step 1.4) |
| **Tools** | `tools/competitor_sitemap.py` (stub — §10.4) or manual: `curl` robots.txt + sitemap.xml, index-follow; tinyfish `fetch_content` escalation on anti-bot (auspods Cloudflare-blocked a plain page fetch — evidence §E2) |
| **Outputs** | per-competitor `{domain, sitemap_urls[], taxonomy, title_patterns[]}` under `competitors/<slug>/`; `candidates[]` route inventory |

The method, mechanically:

1. **Locate the map.** `GET /robots.txt` → `Sitemap:` lines; else try
   `/sitemap.xml` → `/sitemap_index.xml`. Follow the index one level
   (all seven demo competitors used Yoast/Wix/custom index files —
   sitemap.xml was *never* a flat URL list in this evidence run).
2. **Enumerate.** Record every `<loc>`; count per child sitemap.
   Fetch children in index order, cap 500 URLs/competitor (a bigger
   site gets a prefix histogram, not a full list — gobox's vic+sa
   sitemaps alone carry 238 suburb URLs).
3. **Classify the taxonomy.** Bucket every URL's path into the route
   classes by pattern:

   | Class | Pattern (from demo evidence) |
   |---|---|
   | money-service | `/services/<svc>`, `/plumbing/<svc>-melbourne`, flat `/<svc>-<geo>/` |
   | money-location | `/locations/plumber-<suburb>-vic`, `/locations/<suburb>/`, flat `/plumber-<suburb>/`, `/mobile-storage-<suburb>/`, state-partitioned `<st>-sitemap` |
   | article | `/blog*`, `/post-sitemap*` content, `/<date-slug>/` |
   | ancillary | `/about*`, `/contact`, `/privacy*`, `/terms*`, `/faq`, `/service-areas*`, `/get-a-quote`, `/book*`, `/my-account` |
   | product/ecom | `/product*`, `/product_cat*`, `/boxes`, `/cartons-packaging` |
   | noise | `/thank-you`, `/5111-2/` (numeric junk), `/copy-of-*`, `member-profiles_*` — record, never imitate |

4. **Count families.** The output is a histogram: `{route family,
   count, example slugs}`. This is the competitor coverage table the
   gate sees.
5. **Extract title/H1 formulas.** Fetch 2–4 pages per family (money +
   location minimum), regex `<title>` and first `<h1>`. Record the
   formula, e.g. gobox location: title `Mobile Storage {Suburb} from
   $240/Month | gobox`, H1 `Mobile Storage {Suburb}` — the title
   carries price-hook + brand; the H1 is bare service+geo (the exact
   split our `H1` vs `title_tag` columns model).
6. **Emit candidates.** Each observed family ⇒ candidate rows:
   `{pattern, count_observed, source_domain, class_guess}` — e.g.
   `plumber-<suburb> | 246 observed @24hourmelbourneplumbers | money-location`.
   Candidates are *evidence*, not rows — Step 8 caps decide what
   survives (24hour's 246-suburb flat sprawl is the pattern the ≥2-
   competitor rule and 10-per-cluster cap exist to filter).

Anti-bot rule: a fetch returning <500 chars or a Cloudflare/challenge
page escalates to tinyfish `fetch_content` (M3 hybrid, per-URL).

## Step 6 — Keyword volume tier (DataForSEO or degraded)

| | |
|---|---|
| **Inputs** | `kw_groups[].members` (all cluster keywords), `candidates[]` |
| **Tools** | `tools/kw_volume.py` (stub — §10.4) wrapping DataForSEO; env `DATAFORSEO_LOGIN` + `DATAFORSEO_PASSWORD` (name-presence only, S6 convention) |
| **Outputs** | `volumes.json` — `{keyword, search_volume, monthly_trend[], competition, cpc}`; manifest `dataforseo` block |

### 6.1 Prescribed endpoints (verified against docs.dataforseo.com, fetched 2026-11-02)

| Job | Endpoint | Key fields | Limits/cost |
|---|---|---|---|
| AU volume for the dedup'd keyword list | `POST https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live` | `keywords[]` ≤1000/request (each ≤80 chars, ≤10 words), `location_name:"Australia"` or `location_code`, `language_code:"en"`, `sort_by:"search_volume"` | 12 req/min; charged **per request regardless of keyword count** (1 or 1000 — same price) — batch everything; Google Ads API "Starting price $0.06 per task" (pricing page) |
| Suggestions from a competitor domain | `POST .../v3/keywords_data/google_ads/keywords_for_site/live` | `target` (domain or page), `target_type:"site"\|"page"`, location/language | ≤2000 suggestions/request; 12 req/min |
| Suggestions from seed terms | `POST .../v3/keywords_data/google_ads/keywords_for_keywords/live` | `keywords[]` ≤20/request | ≤20,000 suggestions; 12 req/min |
| Related-keyword expansion (SERPs-database, not Ads) | `POST .../v3/dataforseo_labs/google/related_keywords/live` | `keyword` (single), `depth` 0–4 (0→seed, 1→~8, 2→~72, 3→~584, 4→~4680), `include_seed_keyword`, `include_serp_info` | location+language **required**; 30 concurrent max; paid per request |
| Live Google rankings (SERP-tier upgrade / cluster verification) | `POST .../v3/serp/google/organic/live/advanced` | `keyword`, `location_name`/`location_code`, `depth` (default 10, max 200), `device` | billed per SERP-of-10 — depth>10 multiplies cost; `load_async_ai_overview` +$0.002 |
| Location/language code lookup (free) | `GET /v3/keywords_data/google_ads/locations`, `GET /v3/serp/google/locations` | optional `country:"au"` filter | uncharged ("Your account will not be charged") |

**Auth:** HTTP Basic — `Authorization: Basic base64(login:password)`,
credentials from `https://app.dataforseo.com/api-access` (auto-generated
API password ≠ account password; header-only, never URL params).
Env contract: `DATAFORSEO_LOGIN` + `DATAFORSEO_PASSWORD`, presence-checked
exactly once at Step 6 start, values never printed/committed — same
convention as S6's `needs_env` registry.

**Request shape** (canonical call):

```bash
curl -s "https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live" \
  -u "$DATAFORSEO_LOGIN:$DATAFORSEO_PASSWORD" \
  -H "Content-Type: application/json" \
  -d '[{"keywords": ["emergency plumber melbourne","plumber coburg", ...],
        "location_name": "Australia", "language_code": "en",
        "sort_by": "search_volume"}]'
```

Response: `tasks[].result[]` — `keyword`, `search_volume` (nullable),
`monthly_searches[]`, `competition` (LOW/MEDIUM/HIGH), `cpc`, `cost` field
per task (USD, real spend — the lane may log it).

### 6.2 How volume influences the map — tie-breaker, never a gate

- **Within a kw_group:** `target_keywords` ordering takes volume when
  present (highest first), then SERP frequency, then YAKE score.
- **Route existence:** a support topic still earns its own route only
  via the **≥2-competitor rule** (S1 Step 6) — volume *cannot* mint a
  route and absence of volume *cannot* kill one.
- **Pillar choice between tied clusters:** volume breaks the tie.
- **Record coverage:** manifest reports `keywords_with_volume /
  keywords_total` so the operator sees how thin the data was.

**The local-niche caveat (spec'd, evidence-grounded).** Google Ads
returns `search_volume: null` or grouped values for most hyper-local
terms — `"plumber coburg"`-class queries routinely show no per-term
volume even though Google autocomplete proves demand (10 localized
suggestions returned for `plumber coburg` incl. `emergency plumber
coburg`, `gas plumber coburg` — verified 2026-11-02 via
`suggestqueries.google.com/complete/search?client=firefox&gl=au`).
The docs also warn Google Ads "may return no data for certain groups of
keywords" and provides "combined search volume values for groups of
similar keywords". So: **for `local` site_types, expect ≤40% volume
coverage [INFERENCE — coverage share is a forecast, not measured]** —
when a keyword returns null volume the lane falls back, in order, to:
SERP presence (a real results page exists), PAA/autocomplete evidence,
≥1 competitor route covering it. Volume-deciding only applies to terms
that *return* volume.

## Step 7 — Degraded fallback order (no DataForSEO creds)

The tier table the lane walks top-down; first available tier runs,
manifest records the rest:

| Tier | Source | Yields | Credential |
|---|---|---|---|
| T1 | DataForSEO (Step 6) | volume + suggestions + SERP | `DATAFORSEO_LOGIN`/`PASSWORD` |
| T2 | Google autocomplete — `suggestqueries.google.com/complete/search?client=firefox&gl=au&q=<kw>` | demand-proven variants incl. suburb terms (verified live: 10 AU-localized suggestions per seed) | none — free, unauthenticated |
| T3 | PAA / related-searches — harvested from tinyfish `fetch_content` on a Google results page, or the `related_searches`/`people_also_ask` blocks | question-form keywords for article rows | none beyond tinyfish wallet |
| T4 | Competitor sitemap coverage alone (Step 5 output) | route-existence evidence per family; count histograms = demand proxy | none |
| T5 | GSC impressions — only for existing sites | real impression counts, strictly better than volume | `GSC_CREDENTIALS` (existing optional tier — *promoted* in the fallback chain when present) |

Rules: T2–T4 keep the SOP fully runnable SERP-only; they produce
*coverage*, not *volume*, so `target_keywords` ordering falls back to
SERP frequency. T5 preempts T2–T4 when creds exist. Every tier's
outcome lands in `research-inputs:` (Step 9) — a manifest row reads
`{ran: bool, reason}` per tier, never silently absent.

## Step 8 — Candidate → sitemap.md row assembly

| | |
|---|---|
| **Inputs** | `kw_groups[]`, `candidates[]`, `volumes.json`, brief.json |
| **Tools** | assembly rules below; `tools/sitemap_lint.py` (when it lands — OI-7) |
| **Outputs** | `## Topical map` + `## Route table` (PRD §5.2 shape) |

1. **kw_group assignment.** Every money/article row takes its cluster's
   `kg-<n>`; ancillary rows carry `null`.
2. **Intent.** Row inherits its kw_group's dominant label (Step 4.5).
3. **page_class.** Intent-derived default (M7): `commercial`,
   `transactional`, `local` → `money`; `informational`, `comparison` →
   `article`; ancillary matrix rows → `ancillary`. Site-type prior
   sanity-checks the split (local-service ≈ 60/40 money/article) —
   a >20pp deviation is flagged in the gate summary, not auto-fixed.
4. **Pillar/parent.** Broadest cluster per seed = pillar, `parent:
   (root)`; sub-intent clusters hang under their pillar route;
   standalone-question clusters (own-route only via ≥2-competitor
   rule) parent to their pillar. Article rows never parent to article
   rows — max depth 2, flat hub-spoke.
5. **Route/H1/title_tag lock.** Mint together (M6): `H1` = title-case
   service+geo phrase — use the *competitor-observed* formula
   (`<Service> <Geo>`: `Blocked Drains`, `Mobile Storage Belair`),
   `route` = `slugify(H1)` with leading+trailing slash, `title_tag` =
   `<H1> \| <Brand>` default. Where ≥2 competitors share a different
   live formula (e.g. `Plumber {Suburb} | Emergency Plumber {Suburb}`),
   record it as the row's `title_tag` override — the lock is
   consistency, not byte-equality (contested §4).
6. **Dedup/canonicalization conflicts.** Two seeds converging on one
   route (the `cannibalization_candidate` flag from Step 4.3):
   keep the route once, assign it to the *higher-scored* kw_group,
   merge the losing group's keywords into `target_keywords` (cap 8,
   volume-priority ordering), and list the merge in the gate summary.
   Never emit two rows whose routes differ only by
   singular/plural or word order.
7. **Cap rules.**
   - **Location cap (containment):** `<category>-<suburb>` rows only
     where ≥2 mined competitors run dedicated location pages for that
     pattern; ≤10 location rows per kw_group; suburbs drawn from the
     brief's `suburb_list` ranked by population — *not* enumerated to
     exhaustion (24hour runs 246 `plumber-<suburb>` pages — evidence
     §E1 — that is the scaled-content pattern this cap refuses, even
     though a real competitor ranks with it).
   - **Ancillary matrix:** site-type matrix verbatim (S1 Step 8 —
     `local-service`: about/contact/privacy/terms/service-areas/404).
     **Gap — matrix vs S0 site classes:** S0 asks `local | national |
     ecom`; S1's matrix keys are `local-service | ecommerce | …`. The
     lane maps `local→local-service`, `ecom→ecommerce`, and for
     `national` uses `local-service` minus `/service-areas/` —
     recorded as assumption A1 (§10).
   - **Row budget:** ≤80 rows per lane attempt; beyond, seed-split
     merge at gate.
8. **`status`:** every emitted row `planned`.

## Step 9 — `research-inputs:` manifest + lint

| | |
|---|---|

| **Inputs** | all step outputs |
| **Tools** | `tools/sitemap_lint.py` (prose checklist until OI-7 lands) |
| **Outputs** | front-matter block in `sitemap.md` |

```yaml
research-inputs:
  serp:           {ran: true, queries: 34, competitors: 22, fetcher: duckduckgo|tinyfish|mixed, date: 2026-11-02}
  dataforseo:     {ran: true, keywords: 96, with_volume: 41, calls: 1, cost_usd: 0.06}
  autocomplete:   {ran: true, suggestions: 58}
  paa:            {ran: false, reason: "tinyfish fetch returned no PAA blocks"}
  competitor-sitemaps: {ran: true, domains: 7, urls_seen: 1150}
  gsc:            {ran: false, reason: "no GSC credentials configured"}
  cora:           {ran: false, reason: "no Cora report supplied"}
  entities:       {ran: true, sources: [kg, wikipedia], count: 34}
  embeddings:     {ran: false, reason: "no OPENAI_API_KEY"}
  existing-site:  {ran: false, reason: "new site"}
```

New keys vs current S1: `dataforseo`, `autocomplete`, `paa`,
`competitor-sitemaps` (§10.2). `serp.ran: false` still refuses the
lane — unchanged.

## Step 10 — `ACCEPT SITEMAP` presentation

The lane presents, on one screen:

1. Route count by class (`N money / N article / N ancillary`) and the
   pillar list.
2. The `research-inputs` manifest rendered — including tier rows that
   ran:false with reasons, and the `dataforseo` coverage fraction.
3. The **competitor coverage table** — per domain, the taxonomy
   histogram (money/location/article counts) and the observed title
   formulas, so cluster/route disagreements are correctable in-place.
4. Dropped/redirected existing routes (existing-site runs only).
5. Merge/conflict report: cannibalization merges, cap-truncated
   location rows, operator-overridable `title_tag` formulas.

Edits are row edits on the markdown table; the map re-presents until
accepted. S2 never mints on a rejected map (unchanged).

## Named failure modes (added/refined by this SOP)

- **Volume-null avalanche (new).** Local niches return null volume for
  most terms; a lane that treats volume as a gate mints a near-empty
  map. Containment: the Step 6.2 fallback chain + coverage fraction in
  the manifest.
- **Sitemap-index format drift (new).** Yoast/Wix/custom index shapes
  differ (`sitemap_index.xml`, `sitemaps.xml`, `…-sitemap1.xml`,
  state-partitioned children). `competitor_sitemap.py` must follow one
  index level generically, not pattern-match filenames.
- **Anti-bot on page fetch (new).** auspods Cloudflare-blocked a plain
  curl on a location page — escalate to tinyfish on <500-char or
  challenge responses; never classify from headers alone.
- **Suburb-sprawl import (refined).** The ≥2-competitor rule has a
  failure edge: when the top-3 miners all run suburb sprawl
  (24hour + gobox both do), coverage says "mint hundreds". The 10-per-
  cluster cap is the hard stop; the coverage table at the gate is the
  operator's override surface.
- **Directory false-competitors (new).** `localsearch`/`hipages`/
  `yelp` rank for local terms but carry no mineable taxonomy — filter
  to intent-evidence only (Step 3.2).

## §10 Stage-impact deltas vs current S1 contract

### 10.1 New env vars

| Var | Purpose | Check |
|---|---|---|
| `DATAFORSEO_LOGIN` | API login from app.dataforseo.com/api-access | name-presence at Step 6, never printed |
| `DATAFORSEO_PASSWORD` | auto-generated API password | same |

### 10.2 New manifest fields (research-inputs)

`dataforseo` `{ran, keywords, with_volume, calls, cost_usd}` ·
`autocomplete` `{ran, suggestions}` · `paa` `{ran, reason|count}` ·
`competitor-sitemaps` `{ran, domains, urls_seen}` — recorded even when
`ran:false` with a reason.

### 10.3 Assumptions

| # | Assumption |
|---|---|
| A1 | `national` site_type maps to `local-service` ancillary matrix minus `/service-areas/` (matrix has no `national` row — spec gap) |
| A2 | AU Ads `location_name:"Australia"` resolves without an explicit `location_code` — codes are fetched free via `/v3/keywords_data/google_ads/locations?country=au` if a call needs one |
| A3 | ≤40% volume coverage on local terms is a forecast, not measured [INFERENCE] |

### 10.4 Tool stubs the factory needs

| Tool | Does | Used by |
|---|---|---|
| `tools/competitor_sitemap.py` | robots→sitemap-index→children fetch; URL classification histogram; `<title>`/`<h1>` extraction per family; anti-bot escalation flag | Step 5 |
| `tools/kw_volume.py` | batch `search_volume/live` calls (≤1000 kw/call, 12 rpm pacing), `keywords_for_site`/`keywords_for_keywords` suggestion pulls, writes `volumes.json`; exits 0 with `ran:false` output when env absent | Step 6 |
| `tools/sitemap_lint.py` | (existing OI-7 stub) — should gain lint rows for the new manifest keys and the location-cap warning | Steps 8–9 |

### 10.5 Changed/kept

Kept verbatim from S1: seed intake refusal, DDG→tinyfish escalation,
SERP-overlap clustering + word fallback, ≥2-competitor standalone
rule, ancillary matrix, URL=H1=title lock, manifest refusal, gate
shape. Added by this SOP: the explicit modifier grammar + per-seed
counts (S1 said 6–10 "by intent class" without the table), per-cluster
(not global) top-3 mining, the taxonomy classification table, the
title-formula extraction step, the volume tier + degraded order, the
site-class→matrix mapping assumption.

## Appendix E — evidence (fetched 2026-11-02, all AU)

### E1 — Niche A: emergency plumber Melbourne (local trade)

SERP `emergency plumber Melbourne` (tinyfish, location AU) — 10
results: racv.com.au, rightnowemergencyplumbersmelbourne.com.au,
smartplumbing.net.au, atcplumbing.com.au, localsearch.com.au
(directory), 24hourmelbourneplumbers.com.au, ezyplumb.com.au,
plumbmedic.com.au, facebook (group), oncallemergencyplumbers.com.au.

Fan-out check `plumber cost Melbourne call out fee` — different
competitor set entirely (whatsthedamage, jimsplumbing, reddit,
mccarthyplumbinggroup, responseplumbingmelbourne, mozplumbing):
per-cluster mining is justified — the cost cluster's authorities are
not the money cluster's.

| Domain | Sitemap shape | URLs seen | Taxonomy (real counts) |
|---|---|---|---|
| `smartplumbing.net.au` | Yoast index → post(3)+page(37)+category(1) = **41** | `/plumbing/<svc>-melbourne` money ×17, `/commercial-plumbers/*` ×4, `/emergency-plumbers`, ancillary (about/contact/faq/locations/book-quote/projects/rental-*) | clean service-prefix money taxonomy |
| `atcplumbing.com.au` | WIX index → blog(43)+pages(41)+member junk | `/services/<svc>` ×13, `/locations/plumber-<suburb>-vic` ×16, `/blog` 43 posts | two-level service+location |
| `24hourmelbourneplumbers.com.au` | Yoast index → post(65)+**page(497)** = 562 | flat: `plumber-<suburb>` **246**, `roof-repairs-<suburb>` ~35, `blocked-*` family 31 (incl. `blocked-drains-<suburb>` ~20), `gas-*` 24, `hot-water-*` 13… | location-page sprawl — the containment case |
| `plumbmedic.com.au` | Yoast index → page(42)+post(0)+jet-menu+e-landing | keyword-stuffed slugs e.g. `/emergency-plumber-melbourne-best-plumber-melbourne-burst-pipes-water-leaks-gas-plumbing-plumbers-near-me-hot-water-service-melbourne-…/`, `/locations/plumber-*` ×4, numeric junk `/5111-2/` | anti-pattern: slug keyword-stuffing |

Real title/H1 patterns (fetched pages):

- `smartplumbing.net.au/plumbing/blocked-drains-melbourne` →
  title `Blocked Drains - Smart Plumbing`, H1 `Blocked Drains`
- `atcplumbing.com.au/services/emergency-plumber` →
  title `Emergency Plumber Melbourne | 24 Hour Urgent Plumbing`
- `atcplumbing.com.au/locations/plumber-brighton-vic` →
  title `Brighton Plumber for Emergency, Blocked Drain, Gas & More`
- `24hourmelbourneplumbers.com.au/plumber-coburg/` →
  title `Plumber Coburg | Emergency Plumber Coburg`, H1 `Local Plumber Coburg`
- SERP titles: `Melbourne Emergency Plumber | $0 Callout Fee • 24/7
  Fast` (smartplumbing), `24/7 Emergency Plumber Melbourne | OnCall |
  Fast Callout`

Formula extracted: service pages title `<Service> - <Brand>` or
`<Service> <City> | <hook>`; location pages `<Suburb> Plumber…` or
`Plumber <Suburb> | <Service> <Suburb>`; H1s are bare service/geo
phrases — the title carries hook+brand, H1 stays clean.

### E2 — Niche B: mobile storage pods (national service)

SERP `mobile storage pods Australia` — auspods.com.au ×4,
australianmobilestorage.com.au, facebook, gobox.com.au,
mobistorage.com.au.

| Domain | Sitemap shape | URLs seen | Taxonomy |
|---|---|---|---|
| `auspods.com.au` | Yoast index → page(**147**)+post(82)+product(17)+product_cat/tag+author | `/locations/<suburb-or-city>` **81** (national coverage: artarmon, brookvale, ipswich, tweed-heads, richmond, south-melbourne…), `/storage/*` 14, `/moving/*` 9, `/business/*` 8 | national hub-and-suburb |
| `gobox.com.au` | custom index **state-partitioned**: post(33)+page(53)+sa(52)+vic(**186**)+product_cat+video | flat `/mobile-storage-<suburb>/` — 185 in vic sitemap alone, `/adelaide/`, `/melbourne/` city hubs | state-sharded suburb sprawl |
| `australianmobilestorage.com.au` | Yoast index → page(17)+post(9)+category+author | `/about/*` ×4, `/booking*`, `/how-it-work*`, `/faq`, `/cartons-packaging`, `/my-account` | single-city (Brisbane) minimal — 26 URLs total |

Real title/H1 patterns:

- `gobox.com.au/mobile-storage-belair/` →
  title `Storage Belair | Mobile Self Storage | gobox`, H1 `Mobile Storage Belair`
- `gobox.com.au/mobile-storage-unley/` →
  title `Mobile Storage Unley from $240/Month | gobox`, H1 `Mobile Storage Unley`
- `australianmobilestorage.com.au/` → title `Mobile Storage Brisbane
  | Moving Storage Pods Delivered to You`
- `auspods.com.au/locations/melbourne/` → Cloudflare block on plain
  fetch (anti-bot escalation case); SERP title `Self Storage Melbourne
  | PODS Australia`

Formula extracted: `<Service> <Suburb>` H1, title `<Service> <Suburb>
[from $X/Month] | <Brand>` — price-hook optional; city-level rows
`Self Storage <City> | <Brand>`.

### E3 — Free autocomplete fallback (verified live 2026-11-02)

`GET https://suggestqueries.google.com/complete/search?client=firefox&gl=au&q=…` — unauthenticated, returns JSON `[q, [suggestions]]`:

- `q=plumber coburg` → 10 suggestions incl. `plumber coburg north`,
  `plumbing coburg`, `emergency plumber coburg`, `gas plumber coburg`,
  `roof plumber coburg`, `service today plumber coburg` (brand competitor).
- `q=emergency plumber melbourne` → `emergency plumber melbourne cbd`,
  `…cranbourne`, `emergency plumber south melbourne`, `24 hour plumber
  melbourne`, `urgent plumber melbourne`.

Suburb-level demand signals without any paid key — this is why T2
keeps the lane runnable.

### E4 — DataForSEO pages fetched (citations for §6 claims)

- `docs.dataforseo.com/v3/auth/` — Basic auth, `Authorization: Basic
  base64(login:password)`, header-only, creds at app.dataforseo.com/api-access.
- `docs.dataforseo.com/v3/keywords_data/overview/` — Standard vs Live
  methods, 2000 calls/min account ceiling, Sandbox exists.
- `…/keywords_data/google_ads/search_volume/live/` — 1000 kw/request,
  per-request flat charge, 12 req/min, `location_name|code|coordinate`,
  `date_from/to`, `sort_by`, Ads caveat notes.
- `…/keywords_data/google_ads/keywords_for_site/live/` — `target` +
  `target_type: site|page`, ≤2000 suggestions.
- `…/keywords_data/google_ads/keywords_for_keywords/live/` — ≤20
  seeds/request, ≤20,000 suggestions.
- `…/dataforseo_labs/google/related_keywords/live/` — SERPs-database
  "Searches Related to", `depth` 0–4 (max 4680), location+language
  required.
- `…/serp/google/organic/live/advanced/` — `keyword`, `location_code`,
  `depth` ≤200 billed per SERP-of-10, `device`, ai_overview surcharge.
- `…/serp/google/locations/` — free GET, `country` filter, returns
  `location_code/name/parent/type` (94,933 locations in example).
- `dataforseo.com/pricing/keywords-data` — Google Ads API "Starting
  price $0.06 per task"; Clickstream "$0.012 per task + $0.00012 per
  item"; DataForSEO Trends "$0.0012 per task".
