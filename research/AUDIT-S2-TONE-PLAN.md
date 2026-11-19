# AUDIT-S2-TONE-PLAN — adversarial audit of stage S2 (tone fingerprint + content plan)

Lane audit, one of 12. Module boundary: `research/WEB-FACTORY-S2-TONE-PLAN.md`
+ `skills/s2-tone-plan/SKILL.md` + canonical templates
`research/tone-profile.md` / `research/content-plan.md`. Sibling specs were read
for contract surface only: S1 (prd-herdr `research/WEB-FACTORY-S1-SITEMAP.md`),
S3/S4/S5, `WEB-FACTORY-LOCATION-PAGES.md`, `WEB-FACTORY-SITEMAP-SOP.md`, the PRD,
and the runbook. Every claim cites file:line; unverifiable claims are marked
`[INFERENCE]`. Live SERP evidence fetched 2026-11-02 (tinyfish, AU) is in §4 F2.

## 1. Scope audited

| File | Role |
|---|---|
| `research/WEB-FACTORY-S2-TONE-PLAN.md` (223 ll) | stage spec — the contract audited |
| `skills/s2-tone-plan/SKILL.md` (78 ll) | lane spawn brief — must restate the contract |
| `research/tone-profile.md` | output-1 canonical template |
| `research/content-plan.md` | output-2 canonical template |

What S2 is *for*: the only stage that touches voice, per-page sizing, per-page
structure, per-page link obligations, and writer-lane decomposition. Under the
operator's expansion themes it is also the natural home for SERP-measured
sizing and per-page module skeletons — which is exactly where the current
contract is thinnest.

## 2. Current contract

| Contract | As specced today | Evidence |
|---|---|---|
| Inputs | `site/sitemap.md` (required), `site/site-brief.md` (required), `## Reference copy` exemplars (optional — niche-default fallback) | spec :40-46 |
| Output 1 | `site/tone-profile.md` — frontmatter bounds, voice statement + `**Source:**`, lexical table ≥8, `## Banned`, CTA palette, trust vocab, before/after | spec :52-103, template |
| Output 2 | `site/content-plan.md` — one row per sitemap row: `slug \| path \| type \| primary_keyword \| secondary_keywords \| intent \| word_target \| heading_skeleton \| link_seed \| cta` + `## Writer batches` | spec :109-149, template :9 |
| `type` vocabulary | `money \| article \| utility` — `utility` = sitemap `ancillary` (D10) | spec :115-117, SKILL :43-45, PRD :39 |
| `word_target` | integer; fixed type bands: money 800–1200, article 1200–1800, ancillary/utility ≤400; deviation needs "a note" | spec :128-129 |
| `heading_skeleton` | `;`-separated H2 list, H1 first; intent→skeleton mapping (commercial→services/benefits/process/proof/CTA; informational→Q&A) | spec :130-132, :165-168 |
| `link_seed` | `anchor -> slug`, 1–3; money→siblings+contact, article→≥1 money | spec :133-137, :161-164 |
| Batches | ≤6 rows/lane, money separate from article, money first, `web-writer-<site>-b<N>` | spec :140-149 |
| Lane shape | one lane, sequential; fingerprint before plan (CTA/skeleton depend on it) | spec :197-199 |
| Lint posture | all checks are prose self-lints + coordinator re-check; no tool exists | spec :171-175, PRD :182 |
| Anti-scope | "intent classification, not real SERP/KD research" — SERP analysis is "a stage between S1 and S2, not an S2 expansion" | spec :220-222 |

## 3. Discovery-question expansion — what S2 must answer

Grouped by operator theme. **[GAP n]** marks questions S2 cannot answer today.

### Source & authenticity
- Which reference copy does the voice fingerprint rest on — operator exemplars,
  brand fields, or niche default? *(answered — `**Source:**` line mandatory, spec :101-102)*
- How are exemplar traits *measured* rather than eyeballed — dialect, sentence
  length, person? **[GAP 1]** — spec :95-98 says "extract measurable traits" but
  no measurement procedure or tool exists; a lane can assert `en-AU` and
  `sentence_avg_max: 18` on vibes.
- Where do per-row facts the writer may *not* fabricate come from? *(answered
  upstream — `site-brief.md` verbatim facts, S3 :157-160; S2's job is only to
  not contradict them)*

### Classification
- Is each row's intent carried faithfully from S1? *(answered — `intent` copied
  verbatim, spec :123-125)*
- Does every `intent` value have a writer posture? **[GAP 2]** — `local` is in
  the closed set (spec :125) but S3's posture table maps only
  commercial/transactional→money and informational→article (S3 :103-121). S2
  copies `local` verbatim and nobody owns its posture.
- Product-vs-service, local-vs-national — S2 inherits these from `site_type` +
  `page_class`; fine **except** `location` (F1).

### Competition census / SERP stats
- What word count and module count does the SERP winner run for *this row's*
  query? **[GAP 3]** — spec has no SERP input at all (:42-46); `word_target` is
  a type-wide floor, not a measured call. Directly contradicts operator theme 3.
- Which H2s do the top-3 ranking pages share for this cluster (the heading
  vector)? **[GAP 4]** — S1 *mines* heading patterns (`analyze_headings`, S1
  spec :76, "cluster's H2 candidates") but persists nothing S2 can read;
  `competitor-N.txt` lives in the lane scratch dir, capped at 10k chars (S1 :67).
  The evidence exists upstream and is thrown away.
- How many modules/sections does a winner's page carry (hero, CTA, reviews,
  comparison table, FAQ, NAP)? **[GAP 5]** — no per-row module expectation
  exists anywhere in the plan schema.

### Fan-out / query networks
- Does the plan know which fan-out queries (S1 `kw_group` members) belong to a
  row so H2s can absorb secondary intents? *(partially — `secondary_keywords`
  0–3, spec :122; no mechanism feeds the *rest* of the kw_group to the row, and
  3 is a hard cap no evidence justifies [INFERENCE])*

### Design/build feed
- What content volume and section count does each row promise S5b? **[GAP 6]**
- What images/icons/media does each page need? **[GAP 7]** — no column.
- What does the voice fingerprint tell the design system (formality → type
  scale, warmth → accent, niche pairing)? **[GAP 8]** — interface undefined (F7).

## 4. Gap findings

### F1 — `page_class: location` is invisible to S2's type vocabulary — **blocker**

`WEB-FACTORY-LOCATION-PAGES.md:270-271` mints leaf rows as
`page_class: location` and its delta table (:322-323) declares "**S2 — no new
columns; location-row convention: pillar up-link as `link_seed`…**". But S2's
closed set is `money | article | utility` (spec :115-117; SKILL :43-45; PRD
:39), the PRD's own schema of record closes `page_class` at
`money|article|ancillary` (PRD :131), and no document states what a `location`
row renders as in the plan. Two paths, both broken:

- `type: location` emitted verbatim → S3's posture table (money/article/
  utility only, S3 :111-125), S5's template-kind mapping (:146-150), and every
  closed-set lint hit an unrecognized value.
- `location` collapsed into `money` → the money `link_seed` rules fire (spec
  :161-164: contact/quote slug + sibling money seeds) and **directly
  contradict** the location edge convention "exactly 1× pillar up-link —
  siblings/index are graph-computed `added`, never writer-seeded"
  (`LOCATION-PAGES.md:280-282`, :299-300). The location spec promised S2 needs
  "no new columns" — it needs a new *value* and a rule switch, which is a
  schema change wearing a no-change label.

### F2 — `word_target` is a fixed floor, not a SERP-measured call — **blocker**

Spec :128-129 sets `word_target` by type band (money 800–1200, article
1200–1800, ≤400 ancillary). Inputs table (:42-46) admits no SERP evidence.
Contested :220-222 explicitly bans SERP research from S2 — written before the
operator's aim-high theme existed; the resolution is now obsolete. Live
evidence (tinyfish fetch, 2026-11-02, AU SERP winners):

| Page | Class | Extracted words | H2/module count | S2 band |
|---|---|---|---|---|
| `gobox.com.au/adelaide/` (mobile storage Adelaide, #4-class city money page) | money | ≈2,000 incl. reviews | 13 H2s + hero + quote CTA + suburb module + NAP | 800–1200 — **~40% under** |
| `gobox.com.au/mobile-storage-gepps-cross/` | location leaf | ≈1,600+ | 12 modules (M-set: hero, local copy, delivery facts, use-cases, reviews, comparison, sizing, how-it-works, suburb list, NAP, FAQ×10, CTA) | would map to money 800–1200 — **under** |
| `cleanpursuit.com.au/brighton-cleaners/` | location leaf | ≈1,500+ | stats block + reviews + process + 8-service grid + 10-FAQ | under |
| `lamontlaw.com.au/parramatta-drink-driving-lawyers/` | location leaf | ≈950 | 9 H2s | within band — floors aren't *always* wrong |

The winners in the exemplar corpus run 1.5–2.5× the money band ceiling. A
per-row `word_target` must be measured (median of top-3 organic word counts for
the row's primary query), with the type band retained as a *floor*, and the
measurement recorded for review — currently neither the measurement step nor a
column to record it exists. `[INFERENCE]` on the ~40% figure — extracted text
includes review/repeat boilerplate; the gap direction is unambiguous.

### F3 — `heading_skeleton` grammar can't express featured-snippet sections, H3 structure, or module ids — **blocker**

The grammar is `;`-separated `H1:`/`H2:` labels (spec :130-132; template :11).
Three structural demands land nowhere:

- **Snippet-shaped sections** (mini-heading + ~200-word cluster): needs a
  per-section word budget + question-form flag — the cell carries only a label.
- **H3/control level**: S3 :95 lets writers append H2s and add H3s freely; a
  plan that wants a required question-H3 under a skeleton H2 (e.g. a PAA
  question that must exist) cannot express it — gobox's FAQ module is *10
  required H3s* (LOCATION-PAGES :41-42), not an optional flourish.
- **Module ids**: location rows' skeleton is module ids M1–M10 (LOCATION-PAGES
  :127-137), of which only ~4 are prose headings — `heading_skeleton` as
  H2-list cannot hold the module contract the S3 writer needs.

Additionally spec :129's "deviation needs a note in the row" names a note that
no column can hold — the row has ten parse-contract columns (template :6-7
bans adding columns) and `## Notes` conventions exist only in other artifacts.
The spec mandates a cell it never allocated. Minimal fix: extend the skeleton
grammar with bracketed per-entry hints (`H2: What it costs [~200w,snippet]` +
`M`-id entries for module rows) **and** add a `notes`/`evidence` column or a
per-row `## Notes` block — grammar-level, and a parse-contract bump S3/S4 must
co-land.

### F4 — Batch schema has no rule for `utility`/`location` rows — **major**

§Batch assignment (spec :142-149) partitions "money separately from article"
and requires every row in exactly one batch (:187). It never says where
`utility` rows go (≤400 words — burying them in a money lane wastes posture) or
`location` rows. A 25-leaf cluster (LOCATION-PAGES :213) = 4–5 full batches of
template-driven near-identical pages; folded into `money` batches they drag the
pillar lanes' posture and blow the ≤6 cap with filler; folded into `article`
they invert the intent mapping. Batch class needs to be a declared field
(`money|article|location|utility` partitions), and location leaves likely want
their own posture note (template discipline, not fresh copy — LOCATION-PAGES
:324 already promises "page_class-conditional writer requirement").

### F5 — `link_seed` rules collide with location edge conventions — **major**

Spec :161-163: every money page's `link_seed` includes the contact/quote slug;
money seeds to sibling money. LOCATION-PAGES :280-282: leaf `link_seed` is
*exactly* one pillar up-link; sibling/index edges are `added`-class and never
writer-seeded. If location renders as money → two incompatible obligations. If
location renders as location → **no** seed rule mentions it, and the article
rule "every article seeds ≥1 link *to a money page*" (:163) silently decides
whether leaves count as money targets. S4's balance sanity (S4 :133-136)
similarly assumes money/article only; LOCATION-PAGES :301 amends it
("location leaves = money-class") on one line with the rest of S2 left
unamended. One authority — PRD §5.2 + the plan row rules — must state the
location class's seed contract.

### F6 — No per-row content-volume or media contract for the S5 design/build split — **major**

Operator theme 4 wants S5b "driven by content volume from S3". Today's only
volume signal is `word_target` (integer). `heading_skeleton` gives section
*names* but nothing about per-page **media needs** (hero image? gallery? icon
set? animated-SVG inventory — operator's image/icon demand) or **module count**
S5b must lay out. S5's spec binds `content-final/<slug>.md` to routes (S5
:266-270) and lays out `PAGES/<slug>/SPEC.md` section skeletons from *design
sources*, not from the plan — content volume is rediscovered at build time
instead of promised at plan time. Proposed columns (see §5): `media_needs` and
skeleton-annotation — the plan already promises the structure; it should
promise the payload.

### F7 — Tone → design-token interface is undefined; both specs hand-wave it — **major**

S2's pipeline diagram says S5 "reads tone-profile only as voice context" (spec
:19) but S5's own Inputs table (:67-74) **omits `tone-profile` entirely** —
cross-spec drift on whether the file is even consumed. Owner question: is
voice→visual mapping (formality→type scale, warmth→accent, niche→font pairing)
S5a's job from prose, or does S2 emit a structured field? Options:

- **S5a owns it** — voice statement stays prose; design lane interprets. Needs
  only the Inputs table fixed. Simplest.
- **S2 emits** a `visual notes`/`brand temperament` section — makes voice
  machine-adjacent but risks S2 asserting design decisions outside its charter.

Either is defensible; today neither is decided, so S5a would silently guess.
Recommend S5a-owns + one explicit S2 deliverable: voice statement *must* name
formality + register (it already does implicitly — "corporate brochure vs
neighbour"), and S5's Inputs table adds `site/tone-profile.md` to match the
diagram.

### F8 — `content-plan.md` has no front-matter — F10 `plan_digest` has nowhere to land — **minor**

PRD :179 (F10/OI-5) requires S2 to stamp a `plan_digest` into plan
front-matter; the template (`research/content-plan.md`) is a bare markdown
table — no YAML block exists. The lint tools (OI-7) also need a header
contract: `site`, `generated`, `sitemap_digest` (detect stale sitemap→plan
mismatch — adjacent invariant to plan_digest), `row_count`. This is a
template+spec change, not machinery — it should land with the schema
amendments, not wait for OI-5.

### F9 — S1 mined heading/module evidence is discarded before S2 can use it — **minor**

S1 Step 4 mines competitor heading patterns into "the cluster's H2 candidates"
(S1 :76-78); the SOP extracts title/H1 formulas per family (SITEMAP-SOP
:201-207). Neither lands in `sitemap.md` or a sibling artifact S2 reads —
`research-inputs:` records only tier metadata (S1 :133-147). S2 then re-derives
skeletons from `intent` heuristics alone (:165-168) — the worst case of the
F2/F3 class: the evidence the expansion themes need is produced one stage
earlier and thrown away. Fix path: S1 emits
`sites/<slug>/competitor-headings.json` (or the S2 lane runs the same
measurement — see §6, `serp_measure.py`; one of the two must be decided).

### F10 — `intent: local` has no writer posture anywhere — **minor**

`local` is in the intent closed set (spec :125) and is the canonical intent for
location rows (LOCATION-PAGES :249, :270). S3's posture table maps
commercial/transactional→money, informational→article (:103-121); `local` is
unmapped — S3 would fall to `type`, which under F1 is itself unresolved. The
posture decision belongs at S3, but S2's row fields (word band, seed rules,
batch class) all key off the same missing mapping — one named decision fixes
all four.

## 5. Split / sub-module proposal

S2 stays **one lane, sequential** — the dependency the spec names (:197-199)
still holds and the added work doesn't parallelize (measurement feeds rows;
fingerprint feeds CTA/skeleton). What changes is the *shape inside the lane*:

```
site-brief.md ──┐
sitemap.md ─────┤
                ▼
Phase A — measurement (NEW)
  A1 fingerprint measure: tone_measure on ## Reference copy → candidate
     front-matter values (dialect, sentence_avg_max, person) — else niche
     default + Source flag (spec :93-102, unchanged rule, now evidence-backed)
  A2 SERP measure: per money/article/location row, fetch top-3 organic for
     primary_keyword → words, H2 list, module inventory → site/serp-stats.json
     (new artifact — reviewable like link-graph.md before it)
                ▼
Phase B — artifacts (existing shape, wider schema)
  B1 tone-profile.md — as spec'd
  B2 content-plan.md — extended row grammar below
                ▼
Phase C — digest + lint
  C1 plan_lint + tone_lint self-check (tools, §6)
  C2 plan_digest stamped into plan front-matter (F10/OI-5)
```

**Row schema proposal** (parse-contract bump — S3/S4 co-land required):

`slug | path | type | primary_keyword | secondary_keywords | intent | word_target | heading_skeleton | media_needs | link_seed | cta | notes`

- `type` → closed set `money | article | location | utility` (F1 decision).
- `word_target` → integer, sourced from `serp-stats.json` median winner count;
  type band retained as floor; `notes` carries deviation ≥20% (gives :129's
  mandated note a home).
- `heading_skeleton` → extended grammar: `H1: …; H2: … [~200w,snippet]; H3: …
  [required]; M1–M10 ids on location rows` (F3).
- `media_needs` → NEW: `hero | gallery:<n> | icons:<set> | map-card | none`,
  comma-sep — S5b's content payload contract (F6).
- `notes` → NEW: free text, no separators — deviation notes, weak-SERP flags,
  cannibalization warnings (F3's missing cell).
- `intent: local` → money posture, location batch (F10/F4 decisions recorded in
  spec).

**Batch schema:** batch lines gain a class token —
`web-writer-<site>-b<N> (money|article|location|utility): slugs` — partition
rule: every class batches separately; location leaves batch only with location
leaves (template posture, up to 6/batch → a 25-leaf cluster = 4–5 lanes);
utility rows ride the smallest article batch or one `utility` batch.

**`site/serp-stats.json` is the seam artifact**: measured evidence committed
before the plan — a reviewer can audit "why is this row 1,800 words" without
re-fetching SERPs, same review-surface argument S4 uses for link-graph.md.

## 6. Automation surface

| Tool (`tools/*.py` stub) | Does | Kills which gap |
|---|---|---|
| `tools/serp_measure.py` | For each plan row: resolve top-3 organic URLs for `primary_keyword` (reuse S1's fetcher/cache convention), extract body word count + H2 list + module inventory (FAQ/table/review/NAP heuristics); emit `site/serp-stats.json`; propose `target = median(words)` rounded to 50, floor = type band | F2, F9 |
| `tools/plan_lint.py` | Row-count parity vs sitemap; closed-set values (`type`, `intent`); cell metachar bans (F7 grammar); `link_seed` target existence + per-class seed rules incl. location's 1×-pillar; batch coverage/exclusivity/class tokens; skeleton grammar parse (H1 first, ≥1 H2 or M-ids on location, balanced `[]`); `word_target` int + in-band-or-noted | F1, F3, F4, F5, F7-separator |
| `tools/plan_digest.py` | Normalize table rows → sha256 → `--stamp` into front-matter `plan_digest`; `--verify <content-file>` compares the file's recorded digest (F10/OI-5) | F8 |
| `tools/tone_lint.py` | Front-matter keys present + in-range; ≥8 lexical rows; `## Banned` non-empty, one token/bullet, word-bounded literals (F8-PRD grammar); `**Source:**` line present; CTA palette 3–6 | — |
| `tools/tone_measure.py` | Read `## Reference copy` files → candidate `dialect` (spelling heuristics), mean sentence length, person markers, banned/signature candidates → propose front-matter values the lane confirms | GAP 1 |
| `tools/skeleton_lint.py` (optional, fold into plan_lint) | Heading-vector check: skeleton H2s vs `serp-stats.json` winner H2s — coverage report (not a refusal; missing shared-entity H2s get flagged in `notes`) | GAP 4 |

**Stays lane judgment:** voice statement, lexical table, banned-list site
additions, CTA phrasing, before/after rewrite, skeleton wording (tool proposes
the winner heading vector; lane orders + words it), `word_target` final
decision (tool proposes median; lane may overrule with a `notes` entry), batch
composition, anchor text, `media_needs` enumeration, niche-default-vs-exemplar
source declaration.

## 7. SOP skeleton — `web-tone-plan-<site>` lane

1. **Load + verify inputs.** `site/sitemap.md`, `site/site-brief.md`; absent →
   `prd_step ask` naming the file (spec :154-156, unchanged). Parse sitemap
   rows; record `page_class` histogram — if `location` rows exist, the
   location edge conventions bind (F1/F5 decisions must be landed first).
2. **Fingerprint measure.** Run `tone_measure` over `## Reference copy`
   entries; absent → niche-default path with `**Source:**` flag (spec :93-102).
   Draft front-matter + sections 2–7 of `tone-profile.md`; commit
   `site: tone-profile draft`.
3. **SERP measurement pass.** `serp_measure` per `money|article|location` row
   on `primary_keyword` (+ `secondary_keywords[0]` on thin SERPs) →
   `site/serp-stats.json`. Utility rows skip (band default, ≤400). Commit
   `site: serp-stats` — the evidence artifact.
4. **Plan rows.** One row per sitemap row — all 12 columns (§5 schema):
   `word_target` = measured median (floor type band; `notes` the deviation);
   `media_needs` from module inventory + niche exemplars; `cta` from palette;
   `link_seed` per class rules — money→siblings+contact, article→≥1 money,
   location→exactly 1× pillar up-link, utility→none required.
5. **Skeletons.** H1 = locked sitemap H1 verbatim (spec's own rule: H1 carries
   primary keyword — the sitemap row's `H1` is already locked, use it);
   H2 set = intent pattern ∪ shared winner H2s from `serp-stats`; mark
   `[~200w,snippet]` entries on answer-shaped sections; location rows emit
   `M1;M2;…;M9` module list instead (F3).
6. **Batches.** Partition by class token; ≤6/batch; money first, location
   batches last (dependent on nothing, lowest value density); name
   `web-writer-<site>-b<N>`.
7. **Digest + self-lint.** `plan_lint` (all row rules) + `tone_lint`
   (profile shape) + `plan_digest --stamp` into plan front-matter.
8. **Commit + stamp.** `site: S2 tone-profile + content-plan` — artifacts +
   `serp-stats.json` are the review surface; nothing downstream mints until
   all three land.

## 8. Cross-module contracts

| S2 owes | To | Contract | Conflict found |
|---|---|---|---|
| Parseable row schema (12 cols, closed sets, separator bans) | S3 writer, S4 graph | column names are the parse contract | F3 grammar bump needs S3's H2 matcher to strip `[…]` annotations |
| Batch lines with class tokens | S3 mint | one lane per batch, ≤6 | F4 — class partition currently undefined for utility/location |
| `link_seed` obligations per class | S4 graph → `seed` edges | seeds are obligations-of-record | F5 — location's 1×-pillar vs money contact rule |
| `word_target` + section budgets | S3 ±15% lint, S4 cleanup floor | sizing promise | F2 — currently unmeasured floor |
| `media_needs` + module/volume expectation | S5b build lane | content-driven layout | F6 — contract absent today |
| Voice profile (+ formality hints) | S5a design-system lane | voice→visual priors | F7 — S5 Inputs table omits the file |
| `plan_digest` + sitemap digest ref | S3 record, S4 compare | version parity (F10) | F8 — no front-matter to hold it |

| S2 expects | From | Contract | Conflict found |
|---|---|---|---|
| `page_class` closed set incl. `location` | S1 + PRD §5.2 | rows S2 can classify | F1 — PRD closes at 3 values; location spec unilaterally added a 4th |
| Heading/module evidence per cluster | S1 mined competitor data | `competitor-headings.json` or equivalent | F9 — mined then discarded |
| `## Reference copy` paths | S0 brief | fingerprint precedence source 1 | none — exists |
| `service_area`, `site_type` | S0 brief | location row semantics | none — exists |
| `serp-stats` *or* permission to measure | S1 artifact vs S2 step | who owns measurement | Contested :220-222 bans it — must be reversed/decided |

## 9. Verdict

**S2's skeleton is sound; its schema is two expansions behind the operator's
brief.** The one-lane/sequential shape survives. What blocks the PRD:

1. **Decide `location`'s plan vocabulary** (F1/F5/F10): new `type` value +
   location seed/batch/posture rules — PRD §5.2 and the S2 spec must say the
   same closed set. *Blocker — everything downstream keys off it.*
2. **Reverse the anti-SERP Contested note** (:220-222) and own the measurement
   seam: either S1 emits competitor stats or S2 gains `serp_measure` +
   `serp-stats.json`. Word counts and heading vectors are unplan-ble without it
   (F2/F3/F9). *Blocker — operator theme 3.*
3. **Schema amendment landing together**: front-matter block (`plan_digest`,
   `sitemap_digest`, `row_count`), `media_needs` + `notes` columns, skeleton
   grammar extension (`[~200w,snippet]`, `[required]` H3s, `M`-ids), batch
   class tokens. S3/S4 co-land the parse bump. *Blocker — template change.*
4. **Decide voice→visual ownership** (F7): recommend S5a-owns + S5 Inputs table
   gains `tone-profile.md`. *Major — one line each side.*
5. **Tool stubs named**: `serp_measure`, `plan_lint`, `plan_digest`,
   `tone_lint`, `tone_measure` — the OI-7 family grows; S2 is where the
   plan-digest/tooling investment pays for itself (it is the schema owner for
   the busiest parse contract in the pipeline).

When 1–3 land, the S2 PRD writes itself: the lane becomes
measure→fingerprint→plan→digest, four phases with three committed artifacts
(`tone-profile.md`, `serp-stats.json`, `content-plan.md`) and a lint surface
that is mechanical except for the parts that should never be mechanical —
voice, anchors, and judgment calls.
