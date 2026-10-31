---
name: s0-discovery
description: Web Factory stage S0 — intake Q&A that produces site-brief.md. Site class is asked first (local | national | ecom); local/national briefs must carry GBP primary/secondary categories discovered via the GMB extractor method. The brief also collects entity facts, geography, competitors, reference copy, contact destinations, and the ## Deploy target. Spec authority: PRD §5.1 + research/WEB-FACTORY-S1-SITEMAP.md §Step 0 (prd-herdr checkout).
---

# Stage S0 — Discovery / intake

## Role

Intake lane — the factory's only human-facing collection stage. This
lane produces the one file every later stage binds:
`site/site-brief.md` (plus the machine record
`sites/<slug>/brief.json` at S1 Step 0). You do not invent facts: a
fact the brief does not carry is omitted or flagged, never fabricated
(PRD §5.1).

## Spec authority

- `PRD-Web-Factory-2026-10-30.md` §3 stage table + §5.1 (the
  `site-brief.md` field contract).
- `research/WEB-FACTORY-S1-SITEMAP.md` §Step 0 (prd-herdr checkout) —
  the intake-record fields and the category→route contract the GBP
  categories feed.
- `research/DISCOVERY-RESEARCH-web-factory.md` (prd-herdr checkout) —
  why the stage exists.

## Upstream contract consumed verbatim

`NEW-WEBSITE <site intent>` — the trigger line the operator typed. The
intent text is the seed for the Q&A, not the brief itself.

## Required intake order

1. **Site class first** — `local` | `national` | `ecom`. It decides
   the ancillary matrix, the money/article prior, and whether the GBP
   arm applies.
2. **GBP categories (local/national only)** — `gbp_primary_category` +
   `gbp_secondary_category` via the GMB extractor / SEO Time Machine
   method: search the niche's core keywords on Maps in the service
   area, open top-ranked competitor listings, read their Top
   Categories, pick the category closest to what the business actually
   does. These are page authorities: each category owns exactly one
   money route at S1.
3. **Entity facts** — brand name, offering, audience, geo(s),
   services, voice fields, `## Reference copy`, competitor names,
   existing-site URL (or none).
4. **Contact destinations** — `contact_email`, `contact_phone`,
   `notify_phone`. A brief with neither email nor phone is undeployable
   at S6 — collect at least one.
5. **`## Deploy` target** — `host_alias` (saved SSH alias, `ProxyJump
   jump`), `user` (never root), `docroot` (absolute path), `url`
   (canonical origin). Absent `## Deploy` blocks S7 at mint.

## Write set

- `site/site-brief.md` — the intake artifact of record.

## Acceptance / done criteria

- `site/site-brief.md` carries every PRD §5.1 field; for
  `local`/`national` both GBP categories are present and named.
- `## Deploy` carries all four keys — `host_alias`, `user`, `docroot`,
  `url`.
- At least one contact destination (`contact_email` or
  `contact_phone`).
- No fabricated facts — every field traces to an operator answer or is
  flagged open.

## Named failure modes

- **`brief-intake-empty`** — no extractable seed topics: S1 refuses
  with this code; the fix is a re-run of this Q&A, never invented
  seeds.
- **Category drift** — a GBP category that names what the business
  *lists*, not what it *does*, produces a wrong money route the whole
  pipeline builds around. Closest-match beats most-listed.
- **Missing deploy section** — discovered at S7 mint, three days late.
  Collect it here.
