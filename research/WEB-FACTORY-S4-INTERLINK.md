# WEB-FACTORY-S4-INTERLINK — Stage S4: Interlinking + AI-artifact cleanup

Stage S4 turns `site/content/` into `site/content-final/` in three
ordered moves: a link-graph lane computes `site/link-graph.md` — the
reviewable graph artifact — then an apply lane injects those edges
into `site/content/*.md` and runs the watermark/AI-tell cleanup pass
that emits `site/content-final/*.md`. S5 consumes `content-final/`
verbatim during the Astro build.

This document is the stage spec. A NEW-WEBSITE run mints two S4 lanes
from it: the **graph lane** (`web-link-graph-<site>`) produces
`site/link-graph.md`; the **apply lane** (`web-interlink-<site>`)
injects links and produces `site/content-final/` plus
`site/cleanup-report.md`. S5 must not mint until every plan row has a
non-empty `site/content-final/<slug>.md`.

## Position in the factory

```
S2 content-plan.md ──link_seed──┐
                                ▼
S3 writer lanes ──> site/content/*.md ──> S4a graph ──> site/link-graph.md
                                                              │
                                                              ▼
                                         S4b apply: inject into content/*.md
                                         then cleanup pass ──> site/content-final/*.md
                                                              │
                                                              ▼
                                   S5 distill + build (Astro consumes copy)
```

- **Upstream contract:** S3 emits one `site/content/<slug>.md` per
  `content-plan.md` row with the file schema in
  `research/WEB-FACTORY-S3-WRITING.md` §File schema — frontmatter
  (`title`, `description`, `slug`, `path`, `type`, `primary_keyword`)
  plus body. Writers have already placed each row's `link_seed`
  anchors; S3's done notes flag rows where a seed had no natural
  placement. `site/tone-profile.md` `## Banned` is the seed list for
  the cleanup pass; `site/content-plan.md` is the node list and
  obligation table.
- **Downstream contract:** S5 binds each
  `site/content-final/<slug>.md` to a route on `path` and copies
  frontmatter fields, never rewriting them. `site/content/` is not
  S5's input — the intermediate with links but pre-cleanup prose.

## The one-decision architecture

Three artifacts, two lanes, strictly ordered. S4's only architectural
move is that **the link graph is a file before it is a diff** —
`site/link-graph.md` is computed, committed, and reviewable before any
page file changes. Injection executes the graph; it never computes it.
Cleanup is a separate in/out transform (`content/` → `content-final/`)
so injected links and cleaned prose are independent review surfaces:

```
content-plan.md ──┐
                  ├──> S4a graph ──> site/link-graph.md ──> S4b inject ──> content/*.md
content/*.md ─────┘                                                   │
                  ┌───────────────────────────────────────────────────┘
                  ▼
              cleanup pass ──> content-final/*.md + cleanup-report.md
```

## Inputs

| Input | Source | Required |
|---|---|---|
| `site/content-plan.md` | S2 stage output | YES — node list, `link_seed` obligations, `type`/`path` per slug |
| `site/content/<slug>.md` | S3 stage output | YES — every plan row, non-empty |
| `site/tone-profile.md` | S2 stage output | YES — `## Banned` tokens, `dialect`, `person`, `sentence_avg_max`, CTA palette |
| `site/site-brief.md` | NEW-WEBSITE intake | YES — entity facts cleanup must preserve verbatim |
| `site/sitemap.md` | S1 stage output | YES — row-count precondition |

### Mint preconditions (the S4 gate's job, not the lanes')

1. `site/content-plan.md` parses and its row count equals the sitemap
   row count (same re-check S3 mints on — a stale plan silently
   re-points the graph).
2. Every plan row has a non-empty `site/content/<slug>.md` — the S3
   done criteria, re-checked here.
3. Every file's frontmatter parses and its `slug`/`path` match its
   row — a mismatched frontmatter makes the graph target the wrong
   node.
4. `site/tone-profile.md` parses and its `## Banned` list is non-empty
   — an empty ban list means S2 shipped a template, not a profile.

## Output 1 — `site/link-graph.md` (graph lane)

One file, one table, one row per edge:

```markdown
# link-graph.md — <site> — N nodes, M edges

| source_slug | target_slug | anchor | kind | placement |
|---|---|---|---|---|
| boiler-repair-cost | boiler-repair | our repair service | seed | body |
| boiler-repair-cost | prices | boiler repair prices | added | related |
```

- `source_slug`, `target_slug` — plan slugs; the target resolves to
  the row's `path` at injection time (targets are slugs, never URLs —
  the plan owns the path mapping).
- `anchor` — the exact anchor text to inject. For `seed` rows it is
  the `link_seed`'s declared anchor text verbatim.
- `kind` — `seed` (the plan obligated it) or `added` (the graph lane
  computed it — orphan fix, balance). `seed` is the audit trail back
  to the plan row.
- `placement` — `body` (anchor wrapped inside an existing sentence) or
  `related` (row appended to a closing `## Related` block). S3-flagged
  weak seeds are always `related` — a writer who could not place it
  naturally is the evidence no body sentence exists.
- The header counts (`N nodes`, `M edges`) are the review summary; the
  lane also lists every orphan it found and every added edge's reason
  in a `## Notes` section under the table.

### Graph rules (what the graph lane enforces)

1. **Obligation parity.** Every `link_seed` entry across the plan
   becomes exactly one `seed` edge. S3 already links them — the graph
   records them; a plan seed with no edge is a defect the graph lane
   flags, never silently drops.
2. **No orphan nodes.** A page with zero inbound edges gets ≥1
   `added` inbound edge from a topically related page, unless it is
   the nav-linked utility page (contact/quote) the site links
   everywhere. Orphans the lane cannot place get flagged in `## Notes`
   — flagged, not invented.
3. **Outbound cap.** ≤3 body links per page (S2's 1–3 seed budget is
   the scale); `added` edges never push a source past it. A source at
   cap that still needs the edge goes to `related` placement.
4. **No self-links, no duplicates.** One edge per (source, target)
   pair; a second seed to the same target collapses to one edge and
   the surplus anchor is dropped in `## Notes`.
5. **Balance sanity.** Articles point to money pages; money pages
   point to sibling money + contact/quote (S2's posture rule). The
   graph lane reports pages whose inbound/outbound skew violates this
   posture — a report, not a refusal; link equity judgment stays
   reviewable in the artifact.
6. **Targets exist.** Every `target_slug` resolves to a plan row. A
   seed targeting a slug the plan does not carry is a defect: flag in
   `## Notes`, drop the edge — never invent a target.
7. **Related cap.** The `## Related` block carries ≤4 rows per page —
   it is an overflow valve, not a sump (demoted seeds, capped sources,
   orphan fixes all land there). An edge pushed past the cap is
   re-placed as `body` where an anchor exists, or flagged in `## Notes`
   for operator review — never silently dropped.

8. **Anchors name the target.** Every edge's anchor text is the
   target page's H1 or a close variant of it (rule 11 — anchor =
   destination title). Directional text (`click here`, `this page`,
   `learn more`, `read more`) is banned anchor class wherever it
   appears — seed or body copy — and is rewritten to the target's
   title form at injection, noted in `## Notes`. An `added` edge's
   anchor comes from the target's `primary_keyword` family (§Contested
   — the same rule, applied to computed edges).

## Output 2 — `site/content/*.md` mutated (apply lane, injection phase)

Injection executes `link-graph.md` against the corpus:

- **`present` short-circuit.** A `body` edge whose anchor text is
  already a link to the target's `path` in the source file is marked
  done — S3 placed it. The apply lane never wraps a second link around
  an existing one; idempotence is what makes the pass re-runnable.
- **Placement `body` — edge not yet present.** Find the anchor text
  verbatim in the body; wrap the first natural occurrence as
  `[anchor](<row.path>)` — the target row's `path` verbatim (paths
  already carry leading + trailing slashes; never append another `/`).
  First occurrence, never every occurrence —
  spam-pattern the cap exists to kill. If the anchor text does not
  occur verbatim, demote the edge to `related` and note it in
  `cleanup-report.md` — a body placement with no anchor text is an
  S3 defect surfacing late, not a reason to rewrite a sentence.
- **Placement `related`.** Append (or extend) a closing
  `## Related` block on the source page: `- [anchor](<row.path>)`.
  One block per page; all its `related` edges land inside it. The
  block goes last, after the CTA paragraph — it is navigation, not
  pitch (F5 precedence: CTA paragraph, then Related block, page end).
  Rows per block are capped at 4 (graph rule 7).
- **Frontmatter is untouched.** Injection changes body text only;
  `slug`/`path`/`title` are identity fields S5 binds on.
- **Zero-width first.** Before any link verification, strip invisible
  characters (below) — a zero-width inside an anchor makes the
  `present` check miss and double-injects.

## Output 3 — `site/content-final/*.md` + `site/cleanup-report.md` (apply lane, cleanup phase)

The cleanup pass is a corpus-wide transform: it reads every injected
`site/content/<slug>.md` and writes `site/content-final/<slug>.md`.
One input file maps to exactly one output file; `content-final/` is
built wholesale, never incrementally — a clean directory is the
contract S5 counts against.

### What gets removed (the classes)

1. **Character watermarks.** Zero-width and invisible Unicode —
   `U+200B`, `U+200C`, `U+200D`, `U+FEFF`, `U+00AD` (soft hyphen),
   `U+2060` — stripped everywhere in the body. They carry no meaning,
   fingerprint machine output, and break anchor matching.
2. **Whitespace artifacts.** Non-breaking spaces (`U+00A0`) → normal
   spaces; `  +` line ends and mid-sentence double spaces collapse.
   Body only — frontmatter untouched.
3. **AI-disclosure residue.** Phrases where a model names itself or
   its process: `as an AI`, `as a language model`, `I cannot browse`,
   `note: this is a draft`, `here is the rewritten`, `certainly`,
   `I hope this helps` — deleted with their sentence.
4. **Banned tokens.** Every `tone-profile.md` `## Banned` bullet is a
   case-insensitive match — the list is the per-site seed S2 minted
   for this pass. A banned token inside a *linked anchor* is the one
   case where the anchor text is rewritten rather than the sentence
   deleted (deleting would break the graph edge).
5. **Structural tells.** `In conclusion,`/`Overall,`/`In summary,`
   openers; `It's worth noting`, `needless to say`, `importantly,`;
   `Furthermore,`/`Moreover,` paragraph openers used more than once
   per page. Deleted or reworded to plain connective — the paragraph
   keeps its content, loses its template.
6. **Rhythm tells (corpus-level — why cleanup is one pass).**
   Uniform paragraph length across a file (every paragraph within
   ±10% of the mean), the same sentence opener across ≥3 files, and
   identical ≥8-word sentences appearing in ≥2 files (boilerplate a
   writer lane leaked corpus-wide). These need cross-file comparison
   no single-page pass can do (the S3 §Contested split). The fix is
   variance: split or merge paragraphs, vary the opener — judgment,
   logged per rewrite.
7. **Filler hedging.** `it's important to remember`, `when it comes
   to`, `in the world of`, `whether you're a homeowner or` throat-
   clearing openers — reworded to the claim itself.

### What cleanup never touches

- **Frontmatter fields** — `title`, `description`, `slug`, `path`,
  `type`, `primary_keyword`, `faq`, `og_image`, `images`,
  `pain_point` are copied byte-for-byte. They are
  writing decisions S3 owns and S5 binds on.
- **Link targets.** Every injected `[anchor](<row.path>)` keeps its
  path. Edge count between `content/` and `content-final/` is
  invariant — cleanup may reword an anchor (rule 4) but never adds,
  drops, or retargets a link.
- **Entity facts.** Name, service list, area, phone, credentials,
  social profile URLs, and the `/about/` page's embedded
  `company-description.md` paragraph —
  `site-brief.md` verbatim strings survive; cleanup flags a sentence
  it cannot de-tell without altering a fact rather than touching it.
- **Heading skeleton.** No H2 added, dropped, or reordered — S3's
  skeleton contract survives to the built page.
- **Voice bounds.** `dialect`/`person` hold; `sentence_avg_max` is a
  lint bound, not a rewrite target — cleanup fixes violations it
  finds, never mass-rewrites toward the bound.

### `site/cleanup-report.md` — the review artifact

One row per non-mechanical change:

```markdown
| file | class | before | after |
|---|---|---|---|
| boiler-repair.md | structural | "In conclusion, choose a Gas Safe engineer…" | "Choose a Gas Safe engineer…" |
```

Character watermarks and whitespace collapse mechanically — counted
per file in the header (`N files, M chars stripped`), not rowed.
Every class 3–7 rewrite gets a row; every flagged-but-untouched item
gets a `## Flags` entry. A reviewer audits the pass without diffing
the corpus — same contract `DESIGN-DNA.md` gives S5's distill lane.

Rewritten anchors (class 4) get a second record: the apply lane
appends one `## Notes` line per rewrite to `site/link-graph.md`
(`file | old anchor | new anchor`) so the graph stays the audit chain
— the `anchor` column holds the plan's wording, `## Notes` carries
the shipped wording (F9). This append is the sanctioned exception to
the one-writer rule on `link-graph.md`; the apply lane adds Notes
lines only, never edits the edge table.

## Step-by-step — graph lane (`web-link-graph-<site>`)

1. **Parse the plan.** Read `content-plan.md`; every row is a node
   (`slug`, `path`, `type`, `link_seed`). Row count must equal
   sitemap count — a mismatch refuses at lane start, not mid-graph.
2. **Load the corpus.** Read every `site/content/<slug>.md`; build
   the edge set from `link_seed` entries. Record which seed links S3
   already placed (anchor is a link to the target path) vs. which
   exist only as obligation.
3. **Apply the graph rules** (§Graph rules): obligation parity,
   orphan pass, outbound cap, dedup, balance report, target
   existence. `added` edges carry a one-line reason in `## Notes`.
4. **Write `site/link-graph.md`** — header counts, edge table,
   `## Notes` (orphans found, added-edge reasons, demoted seeds,
   balance skews, dropped edges).
5. **Self-lint:** every plan seed has an edge; every target slug
   resolves; no (source, target) pair twice; no self-edge; outbound
   body count per source ≤3.
6. **Commit.** `site: link-graph` — one commit; the graph is
   reviewable as a unit before any page file changes.
7. **Done.** `prd_step done` — closing names edge counts, orphans
   fixed, and flagged items the apply lane must see.

## Step-by-step — apply lane (`web-interlink-<site>`)

1. **Verify inputs.** `site/link-graph.md` parses; every edge's
   source and target file exists. The graph is the authority — the
   lane executes it, never recomputes it.
2. **Strip character watermarks in `content/`** (class 1–2) — before
   link verification, because invisible chars break the `present`
   check.
3. **Inject edges** per §Output 2: `present` short-circuit, `body`
   wrap-first-occurrence, `related` block append, demotions noted.
   Frontmatter untouched.
4. **Commit.** `site: inject links` — the link diff is reviewable
   alone, before cleanup mixes into it.
5. **Cleanup pass.** Read every injected file; apply classes 1–7;
   write `site/content-final/<slug>.md`. One input → one output.
6. **Write `site/cleanup-report.md`** — header counts, rewrite table,
   `## Flags` — and append any anchor rewrites to `link-graph.md`
   `## Notes` (per rewritten anchor, one line).
7. **Self-lint (the output contract):**
   - `content-final/` file count equals plan row count — no gaps, no
     extras;
   - every output's frontmatter equals its input's frontmatter
     byte-for-byte;
   - link count per file: `content-final/` == `content/` (edges
     invariant);
   - every linked path resolves to a plan row's `path` (no broken
     targets);
   - zero banned tokens, zero invisible chars, zero `TBD`/`TODO`;
   - word count within plan `word_target` ±15% and never cut below
     the skeleton's ability to carry it — a >10% body-word drop gets
     a `## Flags` entry, not silence;
   - no skipped heading levels; skeleton H2s still present in order.
8. **Commit.** `site: content-final` — output directory + report in
   one commit; they are one review unit.
9. **Done.** `prd_step done` — closing names files emitted, edges
   injected vs. already-present, rewrite counts by class, flags.

## Acceptance (stage-internal)

The S4 done-criteria the coordinator checks before minting S5:

- `site/link-graph.md` exists, parses, and every plan `link_seed` has
  an edge.
- `site/content-final/` carries exactly one non-empty `<slug>.md` per
  plan row.
- Frontmatter parity `content/` ↔ `content-final/` per file; link
  count parity per file; every linked path resolves.
- Zero banned tokens and zero invisible characters across
  `content-final/`.
- `site/cleanup-report.md` exists with a row per judgment rewrite and
  a `## Flags` section (empty is fine — absent is not).

The spec-existence gate (`test -s research/WEB-FACTORY-S4-INTERLINK.md`)
proves this document; the checks above are S4's done-criteria,
verified before S5 mints.

## Orchestration

- **Two lanes, strictly ordered.** Graph then apply — the apply
  lane's mint precondition is a non-empty, parseable
  `site/link-graph.md`. They never run concurrently: the graph must
  be final before a page file changes, same seam discipline as S5's
  distill→build.
- **Per-site fan-out.** One S4 lane pair per site in the run; sites
  are disjoint (`site/content-final/` vs a sibling run's — no shared
  write paths).
- **One corpus pass for cleanup.** Cleanup is never split per-batch —
  rhythm-tell classes (identical sentences across files, repeated
  openers) are only detectable corpus-wide. A per-page cleanup lane
  deletes the defect class's detection surface.
- **Re-run safety.** A re-minted graph lane recomputes
  `link-graph.md` wholesale (the corpus is the state; the file is a
  projection). A re-minted apply lane is idempotent by construction:
  `present` short-circuits placed links and `content-final/` is
  rebuilt wholesale — a partial apply re-runs cleanly without a
  resume protocol.
- **Failure modes worth naming:**
  - *Stale plan* — a graph lane re-minted after an S2 fix re-reads
    `content-plan.md` at lane start; seeds name slugs, not versions,
    so a cached plan silently re-points the graph. Same failure S3
    names, same fix.
  - *Double injection* — applying the graph twice duplicates `body`
    wraps if the `present` check runs before watermark stripping, or
    appends a second `## Related` block. Order is fixed (strip →
    inject) and `related` appends extend the existing block.
  - *Demoted seeds* — a `body` edge whose anchor text never occurs
    demotes to `related`; a wave of demotions means S3 wrote copy
    that dropped its seed anchors — the report names it so the
    operator sees a writer-quality signal, not a graph defect.
  - *Cleanup eating the page* — a rewrite wave that cuts >10% of a
    file's words is a flag, never silent; the report's word-delta
    column is the tripwire.
  - *Invisible-char anchor misses* — a zero-width inside anchor text
    makes `present` miss and double-injects; stripping first is the
    fix, which is why the order is a rule and not a suggestion.

## Contested

- **Why a graph artifact before injection?** The alternative —
  computing and injecting in one pass — buries the graph inside a
  20-file diff: edge decisions (which anchor, which placement, why
  this source) become unreviewable except file-by-file. One table is
  the same review-surface argument `design-dna/` makes for S5; cost
  is one file. Rejected rung-1 alternative: seeds inline in each
  writer brief (S3's current posture) carry intent but not the
  corpus-level obligations — orphan detection and outbound caps are
  undefined without a node list.
- **Why inject into `content/` then cleanup into `content-final/`,
  instead of one transform?** Charter order. Links completing writer
  files are an edit to S3's output; cleaned prose is a new artifact.
  Two review surfaces: the link diff (did the graph execute
  correctly?) stays separable from the prose diff (did cleanup
  preserve voice?). It also keeps re-runs honest — cleanup re-runs
  never recompute links.
- **Why two lanes, not one?** The seam is the reviewable artifact —
  the graph must exist in final form before injection, and a lane
  boundary is what forces the ordering (concurrent graph+inject is
  two writers on `content/`). Same argument S5 uses for
  distill→build.
- **Anchor text: verbatim seeds vs. rewritten.** `seed` edges keep
  the plan's anchor verbatim — S2 chose it with intent context;
  rewriting it at S4 loses that. `added` edges get an anchor the
  graph lane writes from the target's `primary_keyword` family —
  declared in `## Notes`, never invisible.
- **Statistical watermarks out of scope.** Token-bias watermarks are
  undetectable without the generator's key — S4 removes what is
  observable: invisible characters, disclosure residue, banned
  tokens, template transitions, rhythm tells. Naming the boundary is
  better than pretending a stronger claim.
