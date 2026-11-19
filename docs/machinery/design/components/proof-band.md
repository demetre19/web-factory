---
id: comp-proof-band
type: component-profile
links:
  index: design-index
  see_also: [section-catalog, BASE.ACSS, rules-REF]
  used_in: [w3, w5, w6, w7]
---

# proof-band — component profile (ACSS baseline)

| Field | Value |
|---|---|
| heading | no section heading (band) |
| body | rating + short quote <=20w |
| padding | --section-space-s |
| gaps | --space-m between parts |
| radius | --radius-pill badge |
| media | avatar/stars <=32px |
| CTA | 1 link max (case study) |
| width | full-bleed band directly after hero |
| states | link hover |
| mobile | stacked tight |
| intent | proof |

Canon-cited where n>=10 (MOBBIN-REFS); guideline-derived otherwise.
Overrides happen by redefining `--card-*`/`--section-*` tokens -
never by literals (A.2).
