# system-tile — W5 system-sheet exemplar

`index.html` is the operator-approved `preview/system.html` from the
Whistle Clean end-of-lease run, kept as the worked example of what the
W5 system sheet must prove before any page is built.

## When it is used

- **DESIGN-PLAN.md fill-order step 6** — the W5 gate: the design
  *system* is verified on one tile before page pixels exist.
- DOX branch: copy the packet's `designs/design-system.html` instead.

## How to instantiate

```bash
cp templates/system-tile/index.html site/design-dna/preview/system.html
# rebind the :root token block verbatim from TOKENS.json; keep structure
open site/design-dna/preview/system.html
```

## What it must show

Every surface × density, every type rank (display → caption, incl.
the query-rank H1), buttons (primary + secondary), fields
(text/select/textarea), cards, badge, fold — and the **mandatory
colour-system section**: full C.1 role swatches labelled with hex +
contrast ratio. Every agent downstream reads roles from it. All
values bind `system.*` tokens — zero hardcoded px/hex.
