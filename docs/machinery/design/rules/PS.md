---
id: rules-PS
type: rules
links:
  used_in: [w7]
  depends_on: [rules-E, rules-P]
---

## PS. Page segmentation — the blocks a machine reads

Google reads a page as role-typed blocks, not pixels
(`research/DESIGN-TECH-EXTERNAL.md`: US9069855B2 page segmentation —
a page is partitioned into semantic regions and ranked by region;
US12393768B2 / arXiv 2104.08405 visual semantics — block importance
correlates with position and visual weight; US10824630B2 — boilerplate
detection demotes supplementary regions). Koray's macro/micro 80/20
law (video 9; WR-16) is the same geometry stated for copy: the main
content must dominate the page's mass. These rules make the
segmentation machine-checkable on `astro build` output.

### PS.1 One role, one heading per block

Every rendered block (`<section>`/`<nav>`) carries exactly one role —
its `data-sec` + plan `speech_act` — and at most one heading that
binds to it. A block with two competing headings, or a heading
floating outside any block, is a segmentation defect: the parser
can't assign the role. FAIL: section without `data-sec`, or >1
h1/h2 inside one section.

### PS.2 Boilerplate at the edges only

Chrome blocks (nav, footer, legal — `speech_act: chrome`) render only
at the top and bottom of the document. A chrome or supplementary
block sandwiched between main-content blocks confuses the main-vs-
supplementary partition (US10824630B2). FAIL: chrome `data-sec` block
not in first/last position.

### PS.3 Main-content share ≥80%

Main content occupies the centre and the majority of the visual mass:
non-chrome blocks carry ≥80% of the non-chrome-annotated content share
(text mass + media slots), matching the WR-16 macro band. A page
where supplementary/boilerplate mass approaches the main content reads
as undecided. FAIL: main-content share <80%.

### PS.4 Media never floats context-free

Every image/media slot sits inside a block that also carries its
caption, heading, or alt-bound context — the segmentation parser
associates media with the nearest text; context-free media weakens
the block's role signal (visual-semantics binding). FAIL: `<img>`/
`<picture>` without alt, or no heading/caption/`figcaption`/
`aria-label` text within its section.

### PS.5 Footer is boilerplate, nothing else

The footer carries only boilerplate — links, NAP, legal. It makes no
main-content claims: no article headings, no prose arguments, no CTAs
that argue the page's thesis (the end-act owns those). FAIL: h1/
claim-class heading or a prose paragraph inside the footer block.

### PS.6 Priority order — main before supplementary

No main-content block renders after or visually smaller than a
supplementary block that precedes it — reading order is the priority
signal: once the page moves to boilerplate it doesn't resume the
argument. FAIL: a main block following a chrome block, or an
`aside`/`sidebar` preceding the first main section.

## Enforcement

Generated from `enforcement.json` (`gate.py enforcement`) — edit the JSON, never this table.

| Rule | Tier | Mode | Check / rubric | FAILs when | Wave |
|---|---|---|---|---|---|
| PS.1 | invariant | script | `check_segment_roles` | section w/o data-sec or >1 h1/h2 per block | w7 |
| PS.2 | invariant | script | `check_segment_region` | chrome block outside top/bottom | w7 |
| PS.3 | invariant | script | `check_segment_share` | main-content share <80% | w7 |
| PS.4 | invariant | script | `check_segment_media` | img w/o alt or context text in block | w7 |
| PS.5 | invariant | script | `check_segment_footer` | h1/prose paragraph inside footer | w7 |
| PS.6 | invariant | script | `check_segment_priority` | main after chrome / aside before main | w7 |
