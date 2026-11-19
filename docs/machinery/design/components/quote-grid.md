---
id: comp-quote-grid
type: component-profile
links:
  index: design-index
  see_also: [section-catalog, BASE.ACSS, rules-REF]
  used_in: [w3, w5, w6, w7]
---

# quote-grid — component profile (ACSS baseline)

| Field | Value |
|---|---|
| heading | h2 or quote h3 |
| body | quote 15–35w + attr |
| padding | --section-space-m |
| gaps | --grid-gap |
| radius | --radius-md card |
| media | avatar ≤48px |
| CTA | none |
| width | auto-fit |
| states | — |
| mobile | 1-col |
| intent | proof |

Canon-cited where n≥10 (MOBBIN-REFS); guideline-derived otherwise.
Overrides happen by redefining `--card-*`/`--section-*` tokens —
never by literals (A.2).
