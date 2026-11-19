---
id: comp-split-media
type: component-profile
links:
  index: design-index
  see_also: [section-catalog, BASE.ACSS, rules-REF]
  used_in: [w3, w5, w6, w7]
---

# split-media — component profile (ACSS baseline)

| Field | Value |
|---|---|
| heading | h1/h2, display rank, ≤3 lines |
| body | lead, ≤60ch |
| padding | --section-space-m (hero ≤-s per R.10) |
| gaps | --space-l head→body |
| radius | --radius-lg media |
| media | V.3 ratio, object-fit:cover |
| CTA | 1 primary |
| width | 50–75vw split |
| states | — |
| mobile | stacked text-first |
| intent | hero/promise |

Canon-cited where n≥10 (MOBBIN-REFS); guideline-derived otherwise.
Overrides happen by redefining `--card-*`/`--section-*` tokens —
never by literals (A.2).
