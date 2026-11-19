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

- **Upstream contract:** S2 produces all four artifacts.
  `content-plan.md` rows carry `slug`, `path`, `type`,
  `primary_keyword`, `secondary_keywords`, `intent`, `word_target`,
  `heading_skeleton`, `link_seed`, `cta`, `media`, `faq`, `og_image`,
  `pain_point`. `## Writer batches` groups rows into named lane
  assignments with money batches first. `site/customer-profile.md`
  supplies the personas, pain-point texts, CRO bank (headline
  directions, USP framings, subheads, trust variations, emotional
  hooks, differentiators), and the four-question fold contract —
  writers lift from the bank in voice, never extend it with facts the
  brief lacks.
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
| `site/company-description.md` | S2 stage output | YES when the plan carries an `/about/` row — the writer embeds it verbatim |
| `site/customer-profile.md` | S2 stage output | YES — the row's `pain_point` persona is the page's audience; the bank is the hook/trust vocabulary |

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
5. `site/company-description.md` exists when the plan carries an
   `/about/` row — S3 cannot write the about page without it.
6. `site/customer-profile.md` exists — no lane writes copy with no
   audience document, and every row's `pain_point` ID must resolve.

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
type: money | article | utility     # utility = sitemap `page_class: ancillary` alias (PRD D10)
primary_keyword: <verbatim from plan row>
faq: yes | no                        # verbatim from plan row
og_image: default | <site-relative path or absolute URL>
images:                              # one line per `media` slot; `none` → omit block
  <slot-id>: <final alt text — the writer's deliverable, not the plan's seed>
pain_point: <verbatim from plan row — `PP-<n> (<persona>)`>
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
- **Featured-snippet posture.** Every H2 section opens with a 40–60
  word paragraph that directly answers the heading's implicit
  question *before* any elaboration — the answer block is what AI
  answer surfaces and snippet extraction pull (PRD R2). Question-
  format H2s answer in the first sentence; the elaboration follows.
  Money pages keep this posture on informational subsections ("How
  much does it cost?" gets the price shape up front, then the
  qualifiers).
- **FAQ module.** A `faq: yes` row carries an FAQ H2 whose questions
  are `### ` sub-headings phrased as the user asks them, each
  followed by one direct answer paragraph (≤80 words, answer first).
  S5 renders these as `<details>` and generates FAQPage JSON-LD from
  the same markup — the Q/A pairs must therefore be parseable: one
  H3 = one question, the paragraph(s) beneath it = the answer, no
  interleaved content.
- **Outline coherence.** The heading vector reads as a nested
  outline: every H3 is a sub-part of the H2 above it, every H4 a
  sub-part of its H3 — never a new topic bolted under an unrelated
  parent. The skeleton's ordering already encodes the parent/child
  intent; a writer's appended heading must declare which parent it
  extends by position.

### Conversion contract — Rule of One, AIDA, the fold quad

Every page is written *for* the persona its `pain_point` names:

- **Rule of One.** One customer, one idea, one call to action per
  page. The page's single idea is the persona's bound pain mapped to
  the offer; secondary pains may appear as list items, never as
  competing ideas. One `cta` phrasing per page, repeated — never two
  different CTAs competing on one page.
- **AIDA spine (money pages).** Section order follows Attention
  (hero + the pain) → Interest (what the service does) → Desire
  (proof, outcomes, differentiators) → Action (the CTA close). The
  skeleton's commercial H2 order already encodes it — the writer
  fills, never restructures. Articles keep their question-answer
  skeleton; AIDA is the money-page posture.
- **The fold quad — four answers above the fold.** Every page's
  opening block (H1 + the first paragraph + the hero's CTA + the
  trust line) answers, in the reader's first screen:
  1. *Am I in the right place?* — H1 says what + who.
  2. *Can you solve my problem?* — the opening paragraph names the
     bound pain → offer (this doubles as the featured-snippet
     answer-first block).
  3. *Can I trust you?* — one trust line lifted or adapted from the
     profile's trust bank (credentials only what `site-brief.md`
     supports; no invented reviews/numbers — the `review_source`
     gate applies here too).
  4. *What do I do next?* — the hero CTA, phrased per the row's `cta`.
  S5 renders these four as the hero module's parts; S7 check 22
  verifies them in the DOM. Ancillary pages relax 3–4 to whatever
  the type warrants.
- **Bank usage.** Hook sentences, USP framings, subheadings, trust
  variations, and differentiators may be lifted from
  `customer-profile.md`'s CRO bank verbatim or adapted in voice —
  the bank exists to be spent. Adaptations keep the sentence-level
  contract (14 rules) and never import facts the brief lacks.

### Sentence contract — the 14 writing rules

Every page's prose satisfies this sentence-level contract (the
operator's bound checklist; rules 9 and 12 are already the
featured-snippet posture above — the rest add to it). S4's cleanup
re-checks classes it can detect mechanically; the writer's self-lint
owns the judgment classes.

| # | Rule | Bound statement |
|---|---|---|
| 1 | Word sequence | lead with the entity + key attribute before secondary detail — "PDR is a paintless repair method…" not background-first |
| 2 | Certainty | declaratives only; no "should/will/might" hedging about facts — state outcomes or omit them |
| 3 | No fluff | every word carries meaning; remove fillers, pleonasms, throat-clearing |
| 4 | Numeric values | prefer counts over vague quantifiers — "5 symptoms" not "several" |
| 5 | Qualified instances | qualify enumerations with descriptors — "5 severe symptoms", not bare "symptoms" |
| 6 | Verb context | verbs match the entity's domain — improve/increase for outcomes, develop for skills |
| 7 | Examples after plural nouns | follow plural nouns with concrete named examples |
| 8 | Uniform list grammar | every list keeps one part-of-speech pattern per item |
| 9 | Subordinate first sentence | every H2's first sentence answers the heading directly |
| 10 | "If" second | conditions trail the claim — "X happens, if Y" not "If Y, X" |
| 11 | Anchor = target title | link anchor text names the destination page's H1 or its close variant — never directional text ("click here", "this page", "learn more") and never a paraphrase that misdescribes the target |
| 12 | No delayed answer | the answer arrives inside the opening block — never after a paragraph of preamble |
| 13 | Bold the answer, not the term | `**` wraps the answer string (the entity/definition/detail that resolves the query), not the keyword |
| 14 | Entity + semantic vocabulary | domain terms and related entities come from `site-brief.md` + `secondary_keywords` — invented synonyms for core terms are a voice violation |

### Money page vs article page

The `type` column selects the writer posture:

| Aspect | `money` page | `article` page |
|---|---|---|
| Job | Convert — rank for the service term, push to the CTA | Inform — rank long-tail, route authority to money pages |
| Intent | `commercial` / `transactional` | `informational` |
| Word target | 800–1200 default | 1200–1800 default |
| CTA | Every page's pitch ends on the row's `cta`; at least one mid-page CTA after the first proof section. A `## Related` navigation block may follow the closing CTA (S4 `related` placement, F5 precedence: CTA paragraph, then Related block, page end) | One closing CTA, low-pressure; never mid-body sales interruption |
| Trust vocabulary | Mandatory — credentials/guarantees/review cites per tone-profile §Trust vocabulary | Optional, brief |
| Link posture | Seeds to sibling money pages + the contact/quote slug | Seeds ≥1 link *to* a money page |
| Tone register | Direct benefit-led, second person | Plain explainer, benefit after clarity |

`utility` rows (sitemap `page_class: ancillary` under the plan alias)
follow money-page heading rules with `word_target ≤400`
and no proof requirement.

The `/about/` row is special-cased: its body embeds
`site/company-description.md`'s paragraph **verbatim** (the
`## Provenance` block does not ship), then extends it with the
supporting copy the plan's `heading_skeleton` names (team,
credentials, service area, reviews). The description is a reviewed
artifact — the writer wraps it, never paraphrases it.

### Media slots — alt text is copy

Every `media` slot on a row (`slot-id -> alt seed`) produces one
`images:` frontmatter entry: `<slot-id>: <final alt text>`. The final
alt is written, not copied — the plan's seed is a reminder, the file
carries the real string the `<img alt>` renders. Alt rules: describes
the image for a reader who can't see it (subject + context, no
keyword stuffing), ≤140 chars, no "image of"/"picture of" openers.
Decorative slots (`alt=""`) are named `decorative` in the seed — S5
renders an empty alt, never a guessed description.

### Link seeds — anchors without a graph

Each row's `link_seed` (`anchor text -> slug`) is an obligation, not a
suggestion. The writer:

1. Places each seed's `anchor text` on a natural sentence in the body
   and wraps it as a markdown link to `(<path>)` — the href is the
   row's `path` verbatim (leading + trailing slash, the same form S4
   injects and S5 routes on; the seed names the target's `slug`, the
   writer resolves it to `path` through the plan row).
2. May place the anchor on a *better* sentence than a mechanical
   insertion would find — the obligation is that the link exists, the
   anchor text appears, and it reads naturally.
3. If no natural placement exists for a seed, puts it in a closing
   `## Related` block (the same block name S4 appends to — one name
   keeps the apply lane's extension rule working) rather than forcing
   a bad sentence — and flags the row in the lane's done notes so S4 knows
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
   before/after. Read `site-brief.md` for facts and
   `site/company-description.md` when the batch owns the `/about/` row.
3. **Draft each row in batch order.** Build the frontmatter, the H1,
   the skeleton H2s in order, then fill sections. Keep to
   `word_target` ±15%.
4. **Place link seeds** per §Link seeds.
5. **Self-lint each file** before commit:
   - frontmatter parses; `title` ≤60, `description` 140–160;
   - `faq`, `og_image`, `images` fields copied verbatim from the row
     (`images` entries written for every `media` slot);
   - `pain_point` copied verbatim from the row and its ID resolves in
     `site/customer-profile.md`; the copy loops around that pain —
     one customer, one idea, one CTA;
   - the opening block answers the fold quad: H1 says what/who, the
     first paragraph names pain→offer, a brief-supported trust line
     is present, and the hero CTA matches the row's `cta`;
   - single H1 carrying the primary keyword;
   - every skeleton H2 present in order, no skipped heading levels,
     and the heading vector reads as a nested outline (each sub-heading
     extends the parent above it);
   - each H2's opening paragraph answers before elaborating
     (featured-snippet posture);
   - the 14-rule sentence contract holds — mechanical classes:
     no directional-text anchors (rule 11), `**` wraps answers not
     keywords (rule 13), no opinion-hedged facts (rule 2);
   - `faq: yes` rows carry parseable `### Question` + answer pairs;
   - word count inside ±15% of `word_target`;
   - zero banned tokens; `cta` phrasing present on money pages;
   - the `/about/` row embeds `company-description.md` verbatim;
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
