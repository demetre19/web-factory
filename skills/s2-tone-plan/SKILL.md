---
name: s2-tone-plan
description: Web Factory stage S2 — one sequential lane producing site/tone-profile.md (the voice fingerprint every writer binds) and site/content-plan.md (one row per sitemap row, plus ## Writer batches). Canonical templates ship in research/. Spec authority: research/WEB-FACTORY-S2-TONE-PLAN.md.
---

# Stage S2 — Tone fingerprint + content plan

## Role

One lane, sequential (`tone+plan` — no split; the plan's CTA and
skeleton fields depend on the fingerprint). You produce the two
artifacts every S3 writer lane binds to and S4 seeds its link graph
from.

## Spec authority

`research/WEB-FACTORY-S2-TONE-PLAN.md`. Canonical templates:
`research/tone-profile.md` and `research/content-plan.md` — copy them
into `site/` and fill every bracketed section; filling is not freeform
authoring.

## Upstream contract consumed verbatim

- `site/sitemap.md` — one content-plan row **per route-table row**;
  `kw_group` binds plan row → sitemap row.
- `site/site-brief.md` — niche, geography, entity, services,
  competitor/exemplar copy pointers.

Either file absent → `prd_step ask` naming it; never invent a sitemap.

## Write set

- `site/tone-profile.md` — frontmatter bounds (`dialect`, `person`,
  `reading_level`, `sentence_avg_max`, `emoji`,
  `exclamations_per_page_max`), voice statement with mandatory
  `**Source:**`, lexical table (≥8 rows), `## Banned` (one token per
  bullet, word-bounded substring matching per F8), CTA palette, trust
  vocabulary, before/after.
- `site/content-plan.md` — columns exactly `slug | path | type |
  primary_keyword | secondary_keywords | intent | word_target |
  heading_skeleton | link_seed | cta` (S3/S4 parse verbatim; cells may
  not contain `|`/`;`/`->`/`,` except as documented separators — F7).
  `type` is the plan vocabulary's `money | article | utility` —
  `utility` is the `ancillary` alias per PRD D10 (the OI-3 conformance
  patch reconciles naming across S2–S5),
  plus `## Writer batches` (money first, ≤6 rows per batch, slugs
  `web-writer-<site>-b<N>`, every row in exactly one batch).

Row rules: every money page's `link_seed` includes the contact/quote
slug; every article seeds ≥1 link to a money page; `word_target`
follows type defaults unless a note justifies; empty `heading_skeleton`
is a defect. H1 carries the primary keyword; H2s map to `intent`.

## Acceptance / done criteria

- `tone-profile.md`: all 7 required sections, frontmatter parses with
  every listed key in-range.
- `content-plan.md`: exactly one row per sitemap row, no empty cell,
  `intent` from the closed set, `word_target` an integer, every
  `link_seed` target slug exists in the plan.
- `## Writer batches` covers every row exactly once.
- Neither file contains `TBD`/`TODO`/`FIXME`/`XXX`.
- Commit + stamp: `site: S2 tone-profile + content-plan` — the
  committed artifacts are the boss's review surface; nothing
  downstream mints until both land.

## Named failure modes

- **Niche-default fingerprint** — a `site-brief.md` with no
  `## Reference copy` and no voice fields produces a niche-default
  profile; flag it in the `**Source:**` line so the operator knows
  what to change at the ~10% tweak pass rather than at S7.
- **Stale plan re-point** — seeds name slugs, not versions; a plan
  edited after S3 minted silently re-points writers. The F10
  `plan_digest` (when OI-5 lands) is the version fix; until then
  consumers re-read at lane start.
- **Batch drift** — a row in two batches or none is a S3-mint refuse,
  not a warning.
