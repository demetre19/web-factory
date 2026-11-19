# WEB-FACTORY-S2-TONE-PLAN — Stage S2: Tone fingerprint + content plan

Stage S2 turns the S1 sitemap plus the NEW-WEBSITE intake brief into
four reviewed artifacts: `tone-profile.md` (the voice fingerprint
every S3 writer lane is bound to), `customer-profile.md` (the
personas + pain points + CRO bank all page copy loops around),
`content-plan.md` (one row per page — the work queue S3 lanes
execute and S4 link-graph seeds from), and `company-description.md`
(the 100–200 word entity description the footer, `/about/` page, and
JSON-LD entity node all render).

This document is the stage spec. A NEW-WEBSITE run mints S2 from it; the
S2 lane writes the four artifacts, commits them, and stamps. S3 writer
lanes must not mint until all exist.

## Position in the factory

```
S0 intake brief ──> S1 sitemap.md ──> S2 tone-profile.md + customer-profile.md
                                       + content-plan.md + company-description.md
                                            │              │
                                            ▼              ▼
S4 link-graph <── content-final <── S3 writer lanes (row = one page)
S5 design-dna (reads tone-profile only as voice context)
```

- **Upstream contract:** S1 produces `sitemap.md` — the route-table
  authority (PRD §5.2). One row per route with columns `route`,
  `kw_group`, `intent`, `parent`, `page_class`
  (`money | article | ancillary` — the closed type set), `H1`,
  `title_tag`, `target_keywords`, `status`. The intake produces
  `site-brief.md` — niche,
  geography, entity, services, competitor/exemplar copy pointers.
- **Downstream contract:** S3 refuses to mint a writer lane for a page
  with no `content-plan.md` row; S4's link-graph seeds from each row's
  `link_seed` column. These existence checks live on the S3/S4 gates —
  S2's own gate only proves the artifacts exist and are non-empty.

Canonical templates for all four outputs ship beside this spec —
`research/tone-profile.md`, `research/content-plan.md`,
`research/company-description-prompt.md`, and
`research/customer-profile-prompt.md`. The S2 lane copies them into
the run's `site/` folder and fills every bracketed section; the
templates are the reviewed shapes, filling them is not freeform
authoring.

## Inputs

| Input | Source | Required |
|---|---|---|
| `sitemap.md` | S1 stage output | YES — abort S2 if absent |
| `site-brief.md` | NEW-WEBSITE intake | YES — abort if absent |
| Exemplar copy | paths/URLs named in `site-brief.md` under `## Reference copy` | NO — fall back to niche defaults (§Fingerprint sources) |

The S2 lane reads S1's artifact from the run's shared `site/` folder
(`site/sitemap.md`), not from its own worktree — same convention as
every cross-stage read: the run folder is the artifact of record.

## Output 1 — `site/tone-profile.md`

The voice fingerprint. Structured so a writer lane can paste its whole
relevant section into context and so a lint pass can check the hard
rules mechanically.

### Required sections, in order

1. **Frontmatter.** YAML, fenced:
   ```yaml
   ---
   dialect: en-GB | en-US | en-AU        # locks spelling, date/money formats
   person: first-plural                   # we/us speaking; "you" for reader
   reading_level: grade-8                 # target ceiling
   sentence_avg_max: 18                   # words
   emoji: false
   exclamations_per_page_max: 1
   ---
   ```
   Every field above is lint-able; a writer lane output may be checked
   against them before acceptance.
2. **Voice statement.** 3–5 sentences: who is speaking, to whom, with
   what posture (e.g. "a straight-talking local trade business quoting
   a neighbour, not a corporate brochure").
3. **Lexical table.** Two columns — `Say` / `Not`: the concrete word and
   phrase swaps that make the voice recognisable. Minimum 8 rows.
4. **Banned list.** Explicit AI-tell and cliché bans (`"in today's
   fast-paced world"`, `"delve"`, `"tapestry"`, `"unlock the power"`,
   `"look no further"`, adverb stacking). This list is the seed S4's
   cleanup pass enforces — keep it a single `## Banned` section, one
   token per bullet, so a regex scan can consume it.
5. **CTA palette.** 3–6 approved call-to-action phrasings with the
   situations each belongs to (quote request, phone call, email). CTA
   wording per page still sits in the plan; this is the vocabulary.
6. **Trust vocabulary.** How credentials, guarantees, reviews, and
   years-in-business are phrased (exact citation style, e.g. "fully
   insured — policy on request").
7. **Before/after example.** One paragraph of generic SEO copy rewritten
   in this voice. The single most informative section for a writer
   lane — always include it.

### Fingerprint sources, in precedence order

1. `## Reference copy` entries in `site-brief.md` (operator-approved
   exemplars — extract measurable traits: dialect, sentence length,
   person, banned/signature words).
2. Brand fields in `site-brief.md` (`voice:`, `audience:`,
   `differentiator:`).
3. Niche defaults: local-service-site voice (plain, commercial but
   warm, benefit-led, zero hype). Declaring which source was used is
   mandatory — a `**Source:**` line under the voice statement.

## Output 2 — `site/content-plan.md`

The work queue. One markdown table, one row per `sitemap.md` row, plus
a batch-assignment section.

### Row schema (exact column names, S3/S4 parse them)

| slug | path | type | primary_keyword | secondary_keywords | intent | word_target | heading_skeleton | link_seed | cta | media | faq | og_image | pain_point |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|

- `slug` — derived from `route`'s last path segment; `path` — `route`
  verbatim; `type` — `page_class` verbatim except the sitemap's
  `ancillary`, which renders as `utility` in the plan vocabulary (D10
  mapping, PRD §4.1 note). A row
  missing from the sitemap is out of scope; a sitemap row missing here
  is a defect.
- `primary_keyword` — head of the sitemap row's `target_keywords`.
- `secondary_keywords` — comma-separated, 0–3. Long-tail variants the
  writer may work into H2s; never required to rank.
- `intent` — copied verbatim from the sitemap row's `intent`
  (closed set: `commercial | comparison | informational |
  transactional | local | navigational`).
  Money pages default `commercial`; contact/quote pages
  `transactional`.
- `word_target` — integer. Defaults: money 800–1200, article
  1200–1800, ancillary/utility ≤400. Deviation needs a note in the row.
- `heading_skeleton` — `;`-separated H2 list in order. The writer lane
  may add H3s but must not drop or reorder these H2s. Includes the H1
  (first element, `H1: ...`).
- `link_seed` — `anchor text -> slug`, comma-separated, 1–3 entries.
  Candidate links this page should make. Articles seed links *to*
  money pages; money pages seed links to sibling money pages and the
  contact/quote page. S4 owns the final graph — seeds are
  obligations-of-record, not decorations. **The anchor names the
  target:** seed anchor text is the target page's H1 or its close
  variant (rule 11 — anchor = destination title); directional text
  (`click here`, `this page`, `learn more`, `read more`) is a banned
  anchor class, never a seed.
- `cta` — one phrasing from the tone-profile CTA palette.
- `media` — `;`-separated image slots the page needs, each
  `slot-id -> alt text seed` (e.g. `hero -> engineer repairing boiler
  in Cheltenham kitchen`). Alt text is copy: the writer drafts it at
  S3, S5 binds it to the `<img>`/`<source>` elements — a slot with no
  alt seed is a defect. `none` is a legal value.
- `faq` — `yes` when the skeleton carries an FAQ H2 whose children are
  `Q:`/`A:` pairs (S3 §File schema); `no` otherwise. `yes` marks the
  page for FAQPage JSON-LD eligibility at S5 — emitted when the
  module exists, never required, per the AEO-not-rich-results posture
  (AUDIT-S3 F7).
- `og_image` — optional override path/URL; `default` means the site's
  generated default OG image (S5). Every row carries one value.
- `pain_point` — `PP-<n> (<persona>)`: one pain-point ID from
  `site/customer-profile.md` plus its persona name. The row's
  audience anchor — the page is written *for* this persona against
  *this* pain (Rule of One: one customer, one idea, one CTA). An ID
  that doesn't exist in the profile is a defect; ancillary pages
  carry `PP-0 (site-wide)` where no single pain applies.

### Batch assignment section


- Batch size ≤ 6 pages per writer lane.
- `money` pages batch separately from `article` pages (different
  writer posture; plan title names it).
- Each batch names a proposed lane slug:
  `web-writer-<site>-b<N>`.
- Order: money batch first — it is the S3 gate's first consumer and
  the highest-value copy.

## Output 3 — `site/company-description.md`

The reviewed 100–200 word company description — the single source for
all concise business copy the site ships: the footer blurb (S5 renders
it site-wide), the `/about/` page body (S3 embeds it verbatim), and
the `description` field of the business-entity JSON-LD node (S5).
Contract of record: `research/company-description-prompt.md` — the
lane fills that prompt's `[SOURCE]` slot from `site-brief.md`'s
`## About source` block plus entity fields, generates the paragraph,
scans it against the blacklist, and appends the `## Provenance`
section. No `## About source` → `prd_step ask` for it; the
description fabricates nothing, same entity-facts rule as every stage.

## Output 4 — `site/customer-profile.md`

The audience + conversion-psychology document every page loops
around: ≥5 personas with ≥7 pain points each (stable `PP-<n>` IDs),
the CRO bank (headline directions, USP framings, subheads, trust
variations, emotional hooks, differentiators), and the four-question
fold contract restated for the business. Contract of record:
`research/customer-profile-prompt.md` — the lane fills `[SOURCE]`
from `site-brief.md` (entity + `audience:` + `differentiator:` +
`services:` + geography) and `sitemap.md`'s intent map, fills
`[SEED KEYWORDS]` from the plan's head terms, and generates after the
tone profile so the bank lands in voice. The plan's `pain_point`
column references this file's IDs — the profile exists *before* plan
rows are finalised, not after.

## Step-by-step (what the S2 lane does)

1. **Read inputs.** `site/sitemap.md`, `site/site-brief.md`. If either
   is absent → `prd_step ask` naming the missing file; do not invent a
   sitemap.
2. **Fingerprint.** Resolve the highest-precedence voice source
   (§Fingerprint sources). Extract measurable traits into the
   frontmatter values; draft sections 2–7 of `tone-profile.md`.
   Commit: `site: tone-profile draft`.
3. **Profile the customer.** Generate `site/customer-profile.md` per
   `research/customer-profile-prompt.md` — `[SOURCE]` from
   `site-brief.md` + `sitemap.md` intents, `[SEED KEYWORDS]` from the
   sitemap's head `target_keywords`. The bank writes in the
   fingerprinted voice; trust lines claim only what the brief
   supports.
4. **Plan rows.** For each sitemap row, fill every column. Rules:
   every money page's `link_seed` includes the contact/quote slug;
   every article seeds ≥1 link to a money page; `word_target` follows
   type defaults unless a note justifies otherwise; every row's
   `pain_point` names a `PP-<n>` that exists in the profile.
5. **Heading skeletons.** H1 carries the primary keyword naturally.
   H2s map to the intent: commercial → services/benefits/process/
   proof/CTA skeleton (the AIDA flow over the row's bound pain
   point); informational → question-answer H2s. A row with
   an empty skeleton is a defect. An FAQ skeleton H2 names `faq: yes`
   on the row and the page body carries the Q/A pairs for it.
6. **Describe the company.** Generate
   `site/company-description.md` per
   `research/company-description-prompt.md` — `[SOURCE]` filled from
   `site-brief.md` (`## About source` + entity fields); the word
   count, blacklist scan, and `## Provenance` block all land in the
   file. Missing `## About source` → `prd_step ask`; the description
   never fills itself from thin air.
7. **Batch the plan.** Write `## Writer batches` per §Batch
   assignment.
8. **Self-check.** Run the §Acceptance checks by hand (the artifact is
   prose; the lane verifies before the gate does).
9. **Commit + stamp.** `site: S2 tone-profile + customer-profile +
   content-plan + company-description`. Boss review happens on the
   committed artifacts — they are the review surface; nothing
   downstream mints until all four land.

## Acceptance (stage-internal)

A S2 lane stamps done only when:

- `site/tone-profile.md` exists, has all 7 required sections, and its
  frontmatter parses (all listed keys present, values in-range).
- `site/content-plan.md` exists; its table has exactly one row per
  sitemap row; no cell is empty; `intent` values come from the closed
  set; `word_target` is an integer; every `link_seed` target slug
  exists in the plan.
- `## Writer batches` exists and every plan row appears in exactly one
  batch.
- Neither file contains `TBD`, `TODO`, `FIXME`, or `XXX` tokens.
- `site/company-description.md` exists and satisfies
  `research/company-description-prompt.md`'s contract: 100–200 words,
  facts traceable to `site-brief.md` (`## About source` plus entity
  fields), blacklist-clean, `## Provenance` section present.
- `site/customer-profile.md` exists and satisfies
  `research/customer-profile-prompt.md`'s contract: ≥5 personas, ≥7
  `PP-<n>` pain points each, the six CRO bank sections, the four
  questions, `## Provenance` present; every plan row's `pain_point`
  ID resolves in the profile.

The plan-file gate (`test -s research/WEB-FACTORY-S2-TONE-PLAN.md`)
proves this spec exists; the artifact checks above are S2's own
done-criteria the coordinator verifies before minting S3.

## Orchestration

- **One lane, sequential.** Weight S. Splitting tone and plan into two
  lanes buys nothing: the plan's CTA and skeleton fields already depend
  on the fingerprint, so the dependency edge collapses the parallelism.
- **Hand-off.** S3's lane mint carries a precondition: `content-plan.md`
  exists and the row count matches `sitemap.md`. That check lives on the
  S3 gate matrix (S3 spec), not here.
- **Failure mode worth naming.** If `site-brief.md` carries no
  `## Reference copy` and no voice fields, the fingerprint is
  niche-default — flag it in the `**Source:**` line so the operator
  knows what to change in the ~10% tweak pass rather than discovering it
  at S7.

## Contested

- **Is a whole tone artifact justified for a 20-page local site?**
  Yes — the alternative (voice hints inline per writer brief) produces
  drift across parallel writer lanes and no single review surface. Cost
  is one artifact; the drift it prevents is unfixable cheaply at S4.
- **Should `link_seed` live in S4 instead?** Contested. Current split:
  S2 names obligations (intent-level), S4 computes the graph
  (structure-level). Moving seeds wholesale to S4 loses the intent
  context that makes an anchor sensible; keeping final graph ownership
  in S4 keeps a single source of truth for the injected links.
- **Keyword research depth.** This stage does intent classification,
  not real SERP/KD research — the factory assumes the operator's niche
  knowledge in `site-brief.md`. If a run needs SERP analysis, that is a
  stage between S1 and S2, not an S2 expansion.
