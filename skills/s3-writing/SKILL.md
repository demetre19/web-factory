---
name: s3-writing
description: Web Factory stage S3 — parallel pi/WRITER-bound lanes, one per ## Writer batches entry (≤6 rows, money first), producing site/content/<slug>.md per owned row. One commit per page. Spec authority: research/WEB-FACTORY-S3-WRITING.md.
---

# Stage S3 — Content writing

## Role

`pi/WRITER`-bound lane — one lane per `## Writer batches` entry, slug
`web-writer-<site>-b<N>`. You write `site/content/<slug>.md` for every
row your batch owns. Parallelism is safe: rows are disjoint, no two
lanes write the same file.

## Spec authority

`research/WEB-FACTORY-S3-WRITING.md` — file schema, heading discipline,
money-vs-article posture, link-seed placement, voice binding, self-lint
checklist.

## Upstream contract consumed verbatim

- `site/content-plan.md` — your rows verbatim: `slug`, `path`, `type`,
  `primary_keyword`, `secondary_keywords`, `intent`, `word_target`,
  `heading_skeleton`, `link_seed`, `cta`. **Re-read at lane start,
  never trust a cached copy** — a re-minted lane on a stale plan is
  the named failure mode.
- `site/tone-profile.md` — read whole: frontmatter rules, lexical
  table, `## Banned`, CTA palette, trust vocabulary, before/after.
- `site/site-brief.md` — entity facts, bound hard. Facts absent from
  the brief are omitted or flagged, never fabricated.

Mint preconditions (the coordinator's gate, not yours): plan + tone
exist and parse; plan row count == sitemap row count; every row in
exactly one batch.

## Write set

- `site/content/<slug>.md` — one file per assigned row. Filename is
  `slug + .md`; the deployed URL is the row's `path`, never derived
  from the filename.

## File contract

Frontmatter: `title` (≤60), `description` (140–160), `slug`, `path`,
`type`, `primary_keyword`. Body: single H1 carrying the primary
keyword; skeleton H2s in order, no skipped heading levels; `word_target`
±15%; zero banned tokens; `cta` phrasing present on money pages; every
`link_seed` slug linked in canon notation `[anchor](<row.path>)` —
leading+trailing slash verbatim from the row (F2/F3 fix), never
`/{slug}` and never append a `/`. Money-page vs article-page posture
per spec §Money page vs article page. Every page's pitch ends on its
CTA; a `## Related` block may follow as navigation (F5 precedence:
CTA paragraph, then Related block, page end).

## Self-lint before every commit

Frontmatter parses; `title` ≤60; `description` 140–160; single H1;
skeleton H2s present in order; word count within ±15%; zero banned
tokens; CTA on money pages; every `link_seed` slug linked; every
linked slug exists in the plan.

## Acceptance / done criteria

Every assigned row has a non-empty `site/content/<slug>.md` passing
the self-lint. Stage gate (coordinator-verified before S4 mints):
every plan row has a file — no gaps, no extras; no banned tokens or
`TBD`-class markers; frontmatter `slug`/`path` match the row; every
`link_seed` across the plan is linked from its owning file.

## Named failure modes

- **Stale plan** — re-read `content-plan.md` at lane start; the batch
  section names rows, not versions.
- **Re-run partial batch** — a row with a non-empty file is skipped and
  noted; the stage gate checks row coverage, not per-lane coverage, so
  redrive is clean.
- **Weak seed placement** — a `link_seed` with no natural sentence:
  flag it in the `done` closing for S4 (it lands as `related`
  placement) rather than forcing the anchor.
- **One commit per page** — `site: content <slug>` — a crash loses at
  most the in-flight page.
