# WEB-FACTORY-S3-WRITING — Stage S3: Content writing

Stage S3 turns `site/content-plan.md` into finished page copy: parallel
`pi/WRITER`-bound lanes, one lane per `## Writer batches` entry, each
producing `site/content/<slug>.md` for every row it owns. S4 consumes
these files (link-graph injection + AI-artifact cleanup); S5 consumes
them as page content during the Astro build.

This document is the stage spec. A NEW-WEBSITE run mints S3 writer
lanes from it; each lane writes its rows, commits them, and stamps.
S4 must not mint until every plan row has a non-empty file.

## Position in the factory

```
S1 sitemap.md ──> S2 tone-profile.md + content-plan.md
                         │               │
                         │               ▼
                         │        S3 writer lanes (batch = ≤6 rows)
                         │               │  web-writer-<site>-b<N>
                         │               ▼
                         └──voice──> site/content/<slug>.md
                                            │
                                            ▼
                              S4 link-graph → content-final/
                              S5 design-dna (Astro build consumes copy)
```

- **Upstream contract:** S2 produces both artifacts. `content-plan.md`
  rows carry `slug`, `path`, `type`, `primary_keyword`,
  `secondary_keywords`, `intent`, `word_target`, `heading_skeleton`,
  `link_seed`, `cta`. `## Writer batches` groups rows into named lane
  assignments with money batches first.
- **Downstream contract:** S4 resolves each `link_seed` anchor against
  the plan, injects final links into `content/*.md`, and emits
  `content-final/`. S5 maps each `content/<slug>.md` to its `path` in
  the built site. Both read this stage's files verbatim — the writer
  lane never post-processes after stamp.

## Inputs

| Input | Source | Required |
|---|---|---|
| `site/content-plan.md` | S2 stage output | YES — no writer lane mints without it |
| `site/tone-profile.md` | S2 stage output | YES — no writer lane mints without it |
| `site/sitemap.md` | S1 stage output | YES — row-count precondition |
| `site/site-brief.md` | NEW-WEBSITE intake | YES — entity, geography, service facts writers must not invent |

The writer lane reads all inputs from the run's shared `site/` folder —
the run folder is the artifact of record, same convention as S2's read
of `sitemap.md`.

### Mint preconditions (the S3 gate's job, not the writer's)

The run refuses to mint any writer lane until:

1. `site/content-plan.md` and `site/tone-profile.md` exist and parse.
2. Plan row count equals sitemap row count (S2 acceptance, re-checked
   at mint time — a stale plan silently shrinks the site otherwise).
3. Every plan row appears in exactly one `## Writer batches` batch.
4. Each batch carries a proposed lane slug `web-writer-<site>-b<N>`.

## Output — `site/content/<slug>.md`

One file per plan row. The filename is the row's `slug` + `.md`; the
deployed URL is the row's `path` (never derived from the filename).

### File schema

```markdown
---
title: <page title, ≤60 chars, primary keyword in first half>
description: <meta description, 140–160 chars>
slug: <plan row slug>
path: <plan row path>
type: money | article | utility
primary_keyword: <verbatim from plan row>
---

# <H1 — primary keyword carried naturally>

<body copy: H2 sections per heading_skeleton, H3s optional>
```

Every field above is lint-able; S4's cleanup pass and the S3 stage gate
both consume them.

### Heading discipline (SEO-first, mechanical)

- **H1 exactly once**, first heading in the file, carries the primary
  keyword verbatim or with ≤2 filler words.
- **H2s follow `heading_skeleton`.** Every skeleton H2 appears, in
  order. The writer may add H3s under any H2 and may *append* H2s after
  the skeleton ends — it must not drop, reorder, or insert between
  skeleton H2s.
- **H2 wording is editable.** The skeleton is structure, not copy;
  the writer rewrites each skeleton H2 into final wording that keeps
  its role (benefit, process, proof, question) and may carry a
  `secondary_keywords` entry naturally.
- **No skipped levels.** H2→H4 without an intervening H3 is a lint
  failure.
- **Intent shapes the H2 pattern:**
  - `informational` (articles) — question-format H2s where the skeleton
    allows ("How much does X cost?", "Is X worth it?"), answer-first
    paragraphs.
  - `commercial`/`transactional` (money pages) — benefit / process /
    proof / service-detail H2s; never disguised-article form.

### Money page vs article page

The `type` column selects the writer posture:

| Aspect | `money` page | `article` page |
|---|---|---|
| Job | Convert — rank for the service term, push to the CTA | Inform — rank long-tail, route authority to money pages |
| Intent | `commercial` / `transactional` | `informational` |
| Word target | 800–1200 default | 1200–1800 default |
| CTA | Every page ends on the row's `cta`; at least one mid-page CTA after the first proof section | One closing CTA, low-pressure; never mid-body sales interruption |
| Trust vocabulary | Mandatory — credentials/guarantees/review cites per tone-profile §Trust vocabulary | Optional, brief |
| Link posture | Seeds to sibling money pages + the contact/quote slug | Seeds ≥1 link *to* a money page |
| Tone register | Direct benefit-led, second person | Plain explainer, benefit after clarity |

`utility` rows follow money-page heading rules with `word_target ≤400`
and no proof requirement.

### Link seeds — anchors without a graph

Each row's `link_seed` (`anchor text -> slug`) is an obligation, not a
suggestion. The writer:

1. Places each seed's `anchor text` on a natural sentence in the body
   and wraps it as a markdown link to `/{slug}` (relative root path —
   S4 retargets anchors it reorganises).
2. May place the anchor on a *better* sentence than a mechanical
   insertion would find — the obligation is that the link exists, the
   anchor text appears, and it reads naturally.
3. If no natural placement exists for a seed, puts it in a closing
   `## Related`/`## Next step` block rather than forcing a bad
   sentence — and flags the row in the lane's done notes so S4 knows
   the graph had a weak seed.

A file missing any of its row's `link_seed` slugs fails lint.

### Voice binding

The writer lane's brief embeds the full `tone-profile.md`. Hard rules
are the frontmatter fields and `## Banned` list — a file containing a
banned token, exceeding `sentence_avg_max` by more than a third, or
breaking `dialect`/`person` fails lint. Soft rules (lexical swaps, CTA
palette, trust vocabulary) are judgment the writer applies; the
before/after example is the calibration target.

Writers do not invent facts: entity name, service list, service area,
qualifications, and phone/CTA destination come verbatim from
`site-brief.md`. A fact the brief does not carry is omitted or flagged
— never fabricated.

## Step-by-step (what one writer lane does)

1. **Read the row set.** Parse `content-plan.md`, take exactly the rows
   its batch assigns. A row outside its batch is out of scope; a batch
   row already having a non-empty `site/content/<slug>.md` is skipped
   and noted (re-run safety).
2. **Load the voice.** Read `tone-profile.md` whole — frontmatter
   rules, lexical table, banned list, CTA palette, trust vocabulary,
   before/after. Read `site-brief.md` for facts.
3. **Draft each row in batch order.** Build the frontmatter, the H1,
   the skeleton H2s in order, then fill sections. Keep to
   `word_target` ±15%.
4. **Place link seeds** per §Link seeds.
5. **Self-lint each file** before commit:
   - frontmatter parses; `title` ≤60, `description` 140–160;
   - single H1 carrying the primary keyword;
   - every skeleton H2 present in order, no skipped heading levels;
   - word count inside ±15% of `word_target`;
   - zero banned tokens; `cta` phrasing present on money pages;
   - every `link_seed` slug linked; every linked slug exists in the plan.
6. **Commit per page.** `site: content <slug>` — one commit per file
   keeps the review surface granular and a lane crash loses at most the
   in-flight page.
7. **Done.** `prd_step done` — the lane's closing names its batch, the
   rows written, and any flagged weak seeds for S4.

## Acceptance (stage-internal)

A writer lane stamps done only when every assigned row has
`site/content/<slug>.md` and every file passes the self-lint checklist
(§Step-by-step item 5). The stage-level gate the coordinator runs
before minting S4:

- Every plan row has a non-empty `site/content/<slug>.md` — no gaps,
  no extras.
- No file contains a banned token or `TBD`/`TODO`/`FIXME`/`XXX`.
- Every file's frontmatter parses and its `slug`/`path` match its row.
- Every `link_seed` slug across the plan is linked from its owning file.

The spec-existence gate (`test -s research/WEB-FACTORY-S3-WRITING.md`)
proves this document; the checks above are S3's done-criteria, verified
before S4 mints.

## Orchestration

- **Parallel lanes, one per batch.** The coordinator mints one
  `pi/WRITER`-bound lane per `## Writer batches` entry — slugs
  `web-writer-<site>-b<N>`. Parallelism is safe because rows are
  disjoint: each lane owns exactly its batch's
  `site/content/<slug>.md` write_paths; no two lanes write the same
  file.
- **Money batch first.** Batches mint in plan order — money batch
  first because it is the highest-value copy and the first S4 consumer.
  Other batches may run concurrently after; nothing in a writer lane
  blocks another.
- **Batch cap.** ≤6 pages per lane (S2 enforces at batch time). A
  larger site splits into more lanes — context per lane stays small
  enough to hold the full tone profile plus facts.
- **Re-run safety.** A re-minted or retired-and-resumed lane skips
  rows already written; the stage gate checks row coverage, not
  per-lane coverage, so partial batches redrive cleanly.
- **Hand-off.** S4's lane mint carries the precondition that every
  plan row has a non-empty file — the same existence check pattern as
  S2→S3.
- **Failure mode worth naming.** A writer lane bound to a stale plan
  copy (re-minted after an S2 fix) must re-read `content-plan.md` at
  lane start, not trust a cached copy — the batch section names rows,
  not versions, so a plan change silently re-points a lane.

## Contested

- **Why parallel writers instead of one sequential pass?** One writer
  across 20 pages drifts voice more than four writers on four pages
  each do — the tone-profile + banned-lint + before/after calibration
  binds parallel drift harder than serial fatigue binds a single lane.
  Cost: the lint gate must be strict, because inconsistency now shows
  as *cross-file* differences only the mechanical checks catch.
- **AI-tell removal split.** The banned list lints the worst AI tells
  at S3, but rhythm-level tells (uniform paragraph length, template
  transitions) are S4's cleanup pass — detecting them needs
  cross-file comparison the single-page writer cannot do. Keep the
  split: S3 prevents, S4 polishes.
- **Links by seed at S3 vs. fully by S4.** Writers place seed anchors
  because the anchor must sit in a natural sentence — choosing that
  sentence is writing, not graphing. S4 owns the final graph and may
  retarget/add links in `content-final/`; it does not move anchors a
  writer placed well.
- **Should writers write markdown frontmatter, or should S5 inject
  it?** Frontmatter rides the copy file: `title`/`description` are
  writing decisions (they carry the keyword and the pitch), and
  keeping them with the body gives S4/S5 one file per page. S5 copies
  fields, never rewrites them.
