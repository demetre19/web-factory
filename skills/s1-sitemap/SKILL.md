---
name: s1-sitemap
description: Web Factory stage S1 — research + topical map → sitemap.md, the route-table authority for the whole run. SERP research is mandatory (serp.ran: false refuses); GSC/Cora/entities/embeddings are named optional tiers. Emits the URL=H1=title-locked route table and ends at the ACCEPT SITEMAP human gate. Spec authority: research/WEB-FACTORY-S1-SITEMAP.md (prd-herdr checkout).
---

# Stage S1 — Sitemap

## Role

Research lane → route-table authority. One lane per site run. You
produce `sites/<slug>/sitemap.md` — the schema of record (PRD §5.2)
that S2–S7 all parse. You also write `sites/<slug>/brief.json`, the
structured intake record.

## Spec authority

`research/WEB-FACTORY-S1-SITEMAP.md` (prd-herdr checkout) — the 11-step
pipeline, mechanism decisions M1–M9, lane queue-row shape, and the
route-table schema. The schema of record is restated in
`PRD-Web-Factory-2026-10-30.md` §5.2.

## Upstream contract consumed verbatim

`site/site-brief.md` from S0 — `site_type`, `geo`, `gbp_primary/
secondary_category`, `seed_topics`, `brand`, `competitors`. A brief
with no extractable seed topic → refuse `brief-intake-empty`.

## Research tiers

| Tier | Required | Source |
|---|---|---|
| SERP fan-out | **always** — `serp.ran: false` refuses the lane | DuckDuckGo HTML or tinyfish search |
| Competitor sitemap + content extraction | always (SERP tier) | fetch + trafilatura-class extract |
| Existing-site sitemap | only when the brief names an existing site | tinyfish fetch |
| GSC queries | optional | `GSC_CREDENTIALS` presence |
| Cora report | optional | `cora/*.xlsx` export |
| Entities (KG + Wikipedia) | optional, free | no key for Wikipedia |
| Embeddings | optional | `OPENAI_API_KEY` |

Credentials are name-presence checked, never printed. Every tier's
outcome lands in the `research-inputs:` front-matter manifest — the
operator sees which ran at the acceptance gate.

## Route-table contract (what you emit)

Columns: `route | kw_group | intent | parent | page_class | H1 |
title_tag | target_keywords | status`. Closed sets: `intent` ∈
commercial|comparison|informational|transactional|local|navigational;
`page_class` ∈ **money|article|ancillary**. The URL=H1=title lock:
`slugify(H1) == route`, `title_tag` defaults to `<H1> | <Brand>`.
Category→route contract: homepage H1 = brand; each GBP category owns
exactly one money route; location pages = `<primary category>
<suburb>` for the ~20 largest suburbs under `/service-areas/`, capped —
location routes only where ≥2 competitors rank a dedicated location
page. Cells split on unescaped pipes only — `title_tag` embeds `\|`.

## Write set

- `sites/<slug>/sitemap.md`
- `sites/<slug>/brief.json`
- competitor extraction artifacts under `competitors/<slug>/`

## Acceptance / done criteria

- Route table parses; every money/article row has `kw_group`, `intent`,
  `parent`; H1/route/title lock consistent; ancillary matrix satisfied
  for the declared `site_type`.
- `research-inputs` manifest complete with `serp.ran: true`.
- Presented at the `ACCEPT SITEMAP` gate with route count by class,
  pillars, and dropped/redirected existing routes. **Nothing
  downstream mints until the operator accepts.**

## Named failure modes

- **SERP-only map quality** — DDG clusters diverge from Google's for
  competitive niches; the manifest + gate exist so the operator
  corrects clusters at accept time. Draft-quality maps for hard niches
  are honest, not bugs.
- **DDG rate limits at scale** — 40-route sites fan out 64+ queries;
  tinyfish is the escalation path, per-attempt cache prevents refetch.
  100+ pages → split by seed topic, merge at the gate.
- **Location-page explosion** — the scaled-content penalty class; the
  10-per-cluster cap and the ≥2-competitor rule are the containment.
- **Table-vs-machine fragility** — the markdown table is the contract
  because the human gate edits it; lint (when `tools/sitemap_lint.py`
  lands) makes parse failures loud at S1, not silent at S7.
