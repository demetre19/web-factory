---
id: rules-AC
type: rules
links:
  used_in: [w4, w7]
---

## AC. Automatic.css conformance (U.10)

### AC.1 ACSS naming — every size token speaks ACSS or carries a reason

Automatic.css is the guide for any CSS decision (U.10). Every
size/spacing/gap custom property the emitters write follows the ACSS
name families — `text-(xxl|xl|2xl|l|m|s|xs)`, `h1..h6`,
`space-(xs..xxl)`, `section-space-*`, `gutter`, `*-gap`,
`flow-spacing`, `radius*`, `btn-padding-*`, `width-*`,
`content-width*`, `border-width`, and the rest of the ACSS set.
A size-valued token outside that set is a divergence and is only
legal with a written reason at
`DNA.json provenance['fluid'].divergences['<name>']`.
