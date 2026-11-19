---
id: comp-editorial
type: component-profile
links:
  index: design-index
  see_also: [section-catalog, BASE.ACSS, rules-REF]
  used_in: [w3, w5, w6, w7]
---

# editorial — component profile (ACSS baseline)

| Field | Value |
|---|---|
| heading | h2/h3, prose rank |
| body | prose <=60ch/65ch, measure-bound |
| padding | --section-space-m |
| gaps | --flow-spacing between blocks |
| radius | — |
| media | inline figures only |
| CTA | links inline; no buttons |
| width | <=65ch single column |
| states | — |
| mobile | same measure |
| intent | detail/tension |

Canon-cited where n>=10 (MOBBIN-REFS); guideline-derived otherwise.
Overrides happen by redefining `--card-*`/`--section-*` tokens -
never by literals (A.2).
