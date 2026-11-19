---
id: comp-cards-n
type: component-profile
links:
  index: design-index
  see_also: [section-catalog, BASE.ACSS, rules-REF]
  used_in: [w3, w5, w6, w7]
---

# cards-n — component profile (ACSS baseline)

| Field | Value |
|---|---|
| heading | h2 + eyebrow/lead |
| body | card desc 15–30w |
| padding | --section-space-m |
| gaps | --grid-gap (≥--space-m) |
| radius | --radius-md card |
| media | optional thumb V.3 |
| CTA | link or none; 0 primary |
| width | --grid-min 28rem auto-fit |
| states | card hover/focus-parent |
| mobile | 1-col |
| intent | proof/detail |

Canon-cited where n≥10 (MOBBIN-REFS); guideline-derived otherwise.
Overrides happen by redefining `--card-*`/`--section-*` tokens —
never by literals (A.2).
