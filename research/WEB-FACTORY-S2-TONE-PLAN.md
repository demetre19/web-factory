# WEB-FACTORY-S2-TONE-PLAN — Stage S2: Tone fingerprint + content plan

Stage S2 turns the S1 sitemap plus the NEW-WEBSITE intake brief into two
reviewed artifacts: `tone-profile.md` (the voice fingerprint every S3
writer lane is bound to) and `content-plan.md` (one row per page — the
work queue S3 lanes execute and S4 link-graph seeds from).

This document is the stage spec. A NEW-WEBSITE run mints S2 from it; the
S2 lane writes the two artifacts, commits them, and stamps. S3 writer
lanes must not mint until both exist.

## Position in the factory

```
S0 intake brief ──> S1 sitemap.md ──> S2 tone-profile.md + content-plan.md
                                            │              │
                                            ▼              ▼
S4 link-graph <── content-final <── S3 writer lanes (row = one page)
S5 design-dna (reads tone-profile only as voice context)
```

- **Upstream contract:** S1 produces `sitemap.md` — one row per URL
  with `slug`, `path`, `type` (money | article | utility), and
  `primary_keyword`. The intake produces `site-brief.md` — niche,
  geography, entity, services, competitor/exemplar copy pointers.
- **Downstream contract:** S3 refuses to mint a writer lane for a page
  with no `content-plan.md` row; S4's link-graph seeds from each row's
  `link_seed` column. These existence checks live on the S3/S4 gates —
  S2's own gate only proves the artifacts exist and are non-empty.

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

| slug | path | type | primary_keyword | secondary_keywords | intent | word_target | heading_skeleton | link_seed | cta |
|---|---|---|---|---|---|---|---|---|---|

- `slug`, `path`, `type` — copied verbatim from `sitemap.md`. A row
  missing from the sitemap is out of scope; a sitemap row missing here
  is a defect.
- `primary_keyword` — copied from the sitemap row.
- `secondary_keywords` — comma-separated, 0–3. Long-tail variants the
  writer may work into H2s; never required to rank.
- `intent` — one of `informational`, `commercial`, `transactional`.
  Money pages default `commercial`; contact/quote pages
  `transactional`.
- `word_target` — integer. Defaults: money 800–1200, article
  1200–1800, utility ≤400. Deviation needs a note in the row.
- `heading_skeleton` — `;`-separated H2 list in order. The writer lane
  may add H3s but must not drop or reorder these H2s. Includes the H1
  (first element, `H1: ...`).
- `link_seed` — `anchor text -> slug`, comma-separated, 1–3 entries.
  Candidate links this page should make. Articles seed links *to*
  money pages; money pages seed links to sibling money pages and the
  contact/quote page. S4 owns the final graph — seeds are
  obligations-of-record, not decorations.
- `cta` — one phrasing from the tone-profile CTA palette.

### Batch assignment section

`## Writer batches` — groups plan rows into S3 lane assignments:

- Batch size ≤ 6 pages per writer lane.
- `money` pages batch separately from `article` pages (different
  writer posture; plan title names it).
- Each batch names a proposed lane slug:
  `web-writer-<site>-b<N>`.
- Order: money batch first — it is the S3 gate's first consumer and
  the highest-value copy.

## Step-by-step (what the S2 lane does)

1. **Read inputs.** `site/sitemap.md`, `site/site-brief.md`. If either
   is absent → `prd_step ask` naming the missing file; do not invent a
   sitemap.
2. **Fingerprint.** Resolve the highest-precedence voice source
   (§Fingerprint sources). Extract measurable traits into the
   frontmatter values; draft sections 2–7 of `tone-profile.md`.
   Commit: `site: tone-profile draft`.
3. **Plan rows.** For each sitemap row, fill every column. Rules:
   every money page's `link_seed` includes the contact/quote slug;
   every article seeds ≥1 link to a money page; `word_target` follows
   type defaults unless a note justifies otherwise.
4. **Heading skeletons.** H1 carries the primary keyword naturally.
   H2s map to the intent: commercial → services/benefits/process/
   proof/CTA skeleton; informational → question-answer H2s. A row with
   an empty skeleton is a defect.
5. **Batch the plan.** Write `## Writer batches` per §Batch
   assignment.
6. **Self-check.** Run the §Acceptance checks by hand (the artifact is
   prose; the lane verifies before the gate does).
7. **Commit + stamp.** `site: S2 tone-profile + content-plan`. Boss
   review happens on the committed artifacts — they are the review
   surface; nothing downstream mints until both land.

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
