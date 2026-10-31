---
name: s4-interlink
description: Web Factory stage S4 — two strictly ordered lanes. Graph lane web-link-graph-<site> computes site/link-graph.md (the reviewable edge artifact) before any page changes. Apply lane web-interlink-<site> injects edges into site/content/ then runs the corpus-wide cleanup pass emitting site/content-final/ + site/cleanup-report.md. Spec authority: research/WEB-FACTORY-S4-INTERLINK.md.
---

# Stage S4 — Interlink + AI-artifact cleanup

## Roles

Two lanes, strictly ordered — never concurrent (the graph must be
final before a page file changes):

- **Graph lane** `web-link-graph-<site>` — computes `site/link-graph.md`.
- **Apply lane** `web-interlink-<site>` — injects edges into
  `site/content/*.md`, then runs the corpus-wide cleanup pass
  emitting `site/content-final/` + `site/cleanup-report.md`.

## Spec authority

`research/WEB-FACTORY-S4-INTERLINK.md` — graph rules, injection order
(strip → inject), the 7 cleanup classes, never-touch list, report
schema.

## Upstream contract consumed verbatim

- `site/content/*.md` — S3 output, file schema unchanged.
- `site/content-plan.md` — node list + obligation table (`link_seed`
  entries). **Re-read at lane start** — same stale-plan failure as S3.
- `site/tone-profile.md` `## Banned` — the cleanup seed list.
- `site/sitemap.md` — route-count parity check at lane start; a
  mismatch refuses then, not mid-graph.

Mint preconditions (coordinator's gate): plan parses with row parity;
every plan row has a non-empty `content/<slug>.md`; frontmatter
`slug`/`path` match per file; `## Banned` non-empty.

## Write set

- Graph lane: `site/link-graph.md` — columns `source_slug |
  target_slug | anchor | kind | placement`; `kind ∈ {seed, added}`;
  `placement ∈ {body, related}`; `## Notes` carries orphans,
  added-edge reasons, demotions, dropped edges, and any anchor the
  cleanup pass rewrote (F9).
- Apply lane: `site/content/*.md` (injection mutations), then
  `site/content-final/<slug>.md` per row + `site/cleanup-report.md`.

## Graph rules the lane enforces

1. Every plan `link_seed` becomes exactly one `seed` edge — flagged,
  never silently dropped.
2. No orphan nodes: zero-inbound pages get ≥1 `added` edge from a
  topically related page, except the nav-linked utility page.
3. ≤3 body outbound links per page; surplus goes to `related`.
4. No self-links, no duplicate (source, target) pairs.
5. Balance: articles → money; money → sibling money + contact/quote.
  Skew is reported, not refused.
6. Every `target_slug` resolves to a plan row — never invent a target.

## Injection + cleanup rules (apply lane)

Order is fixed: **strip → inject**. `present` short-circuits placed
links (canon `[anchor](<row.path>)`); `body` wraps the first natural
occurrence; a `body` edge whose anchor never occurs demotes to
`related`. Cleanup removes the 7 classes (invisible chars, disclosure
residue, banned tokens, rhythm tells et al. per spec §What gets
removed) and never touches frontmatter, link targets, entity facts, or
the heading skeleton. `cleanup-report.md` carries a row per judgment
rewrite, a word-delta column, and `## Flags` (empty is fine, absent is
not; a flagged entity-fact collision blocks S5 mint — F8).

## Acceptance / done criteria

- `link-graph.md` parses; every plan `link_seed` has an edge.
- `content-final/` has exactly one non-empty `<slug>.md` per plan row.
- Frontmatter + link-count parity `content/` ↔ `content-final/`; every
  linked path resolves.
- Zero banned tokens, zero invisible chars across `content-final/`.
- `cleanup-report.md` exists with per-rewrite rows + `## Flags`.

## Named failure modes

- **Stale plan** — re-read at lane start; seeds name slugs, not
  versions.
- **Double injection** — `present` check before stripping, or a second
  `## Related` block; the fixed order and block-extension rule are
  why. Idempotent by construction — re-runs are clean.
- **Demoted-seed wave** — many `body`→`related` demotions = S3 copy
  dropped its seed anchors; the report surfaces it as a writer-quality
  signal.
- **Cleanup eating the page** — a rewrite cutting >10% of a file's
  words is a `## Flags` entry, never silent.
- **Invisible-char anchor misses** — a zero-width inside anchor text
  makes `present` miss and double-inject; strip first.
- **Cleanup split per-batch** — never; rhythm tells are only detectable
  corpus-wide.
