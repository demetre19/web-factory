---
id: comp-modal-form
type: component-profile
links:
  index: design-index
  see_also: [section-catalog, BASE.ACSS, rules-REF, comp-form-panel]
  used_in: [w3, w5, w6, w7]
---

# modal-form — component profile (ACSS baseline)

| Field | Value |
|---|---|
| heading | h3 inside the dialog |
| body | form fields, one per label |
| padding | --space-m inside `.flyout` |
| gaps | --space-m dialog stack |
| radius | --r-card on the dialog |
| media | — |
| CTA | `.flyout-open` trigger (primary) + submit inside |
| width | min(28rem, 92vw) centred |
| states | open (scrim) / close (`.flyout-close`, scrim click, Escape) |
| mobile | dialog stays centred, full-width minus gutter |
| intent | act |

The folded end-act: binds when the DNA's `disclosure-tier` is
`folded` (N.flyout). Canon-cited where n≥10 (MOBBIN-REFS);
guideline-derived otherwise. Overrides happen by redefining
`--card-*`/`--section-*` tokens — never by literals (A.2).
