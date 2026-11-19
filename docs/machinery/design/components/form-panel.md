---
id: comp-form-panel
type: component-profile
links:
  index: design-index
  see_also: [section-catalog, BASE.ACSS, rules-REF]
  used_in: [w3, w5, w6, w7]
---

# form-panel — component profile (ACSS baseline)

| Field | Value |
|---|---|
| heading | h2 + lead |
| body | helper text |
| padding | --section-space-m |
| gaps | --space-s fields/--space-l submit |
| radius | --radius-md panel |
| media | — |
| CTA | 1 primary submit |
| width | ≤65ch |
| states | label/helper/error/success + required |
| mobile | stacked |
| intent | act |

Canon-cited where n≥10 (MOBBIN-REFS); guideline-derived otherwise.
Overrides happen by redefining `--card-*`/`--section-*` tokens —
never by literals (A.2).
