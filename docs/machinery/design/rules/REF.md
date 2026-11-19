---
id: rules-REF
type: rulebook
links:
  index: design-index
  see_also: [rules-DNA, rules-G, rules-L, BASE.ACSS]
  used_in: [w1, w3, w4, w5, w7]
---

# REF — Canon references (LAW.REF)

**GOLDEN RULE: every design decision traces to a canon reference.**
Canon positives, in ranking order:
1. **Operator-supplied sites** — highest authority
2. **Operator-endorsed lists** — sites recorded by PatternMiner under
   `patterns/data/operator/_sources/` (first list: eleken.co
   best-website-design-examples)
3. **Mobbin screens/sections**

A **candidate tier** (first source: astro-showcase) sits below canon:
sites scanned and scored but never citable until the operator promotes
them in the pipeline's `preview/candidates.html` picker (receipt-bound;
decisions POST to the approval service). Approved → endorsed tier;
rejected → excluded, usable only as scorer contrast.

**Two layers.** Every source declares `contributes: [principles] |
[principles, look]`:
- **Principles** (structure/measurement — spacing, padding ratios,
  type-scale, hierarchy, rhythm, CTA cadence, grid, content width, a11y,
  collapse): canon + skeleton sources + pending candidates all feed it.
- **Look** (visual identity — palette, imagery, type pairing, mood,
  trend, visual-similarity retrieval): canon + *approved* candidates
  only; `canon_trace` rejects principle-only sources on look-level
  rows.

The web corpus, the negatives/anti layer, and banked site captures are
removed from canon (operator ruling). Canon is the highest design
authority after the copy contract and brand invariants. Canon overrides generated defaults — including the ACSS
baseline (`ACSS-BASELINE.md`) — wherever they conflict; ACSS fills only
what canon does not specify.

### REF.1 Every choice traces to canon

Every composition, hero archetype, section rhythm and look-knob choice
carries ≥1 canon reference — an **operator site URL**, a site or
domain **recorded in an endorsed `_sources` list**, or a **Mobbin
screen/section id or URL** (`mobbin-*`, `mobbin.com/...`) — recorded
in the plan row (`refs:`) and in the picker option's `data-refs`
metadata. Any ref into `data/web`,
`validation-negatives`, the quarantine, or the removed anti layer, and
any non-canonical id (`pattern-*`, `web-*`, `https-<slug>` bank slugs),
FAILS.

Retrieval is mandatory and complete: for each section type query the
canon set (Mobbin via MCP + operator-supplied sites) and record every
retrieved ref in `MOBBIN-REFS.md`. A retrieved
high-similarity ref that was not used is logged as **ignored** with a
reason — refs are never silently dropped.

Operator-suggested sites are auto-captured and banked, then weighted
above Mobbin in retrieval ranking.

### REF.2 Candidate sources — operator promotion only

Scanned-and-scored sources (first: astro-showcase) are **candidates**:
they may feed the principles layer (statistics, ratios, profiles) but
are never canon for look choices until promoted. Pending candidates
render in `preview/candidates.html` (screenshot + score +
approve/reject controls POSTing to the approval service;
receipt-bound). `approved` joins the endorsed tier; `rejected` is
excluded from canon — usable only as scorer contrast. Citing a pending
or rejected candidate for a look-level choice FAILs.

### REF.3 Layered canon — principles vs look

Sources declare `contributes: [principles] | [principles, look]`. A
MOBBIN-REFS row whose `informs` targets the look layer (palette,
imagery treatment, type pairing, mood, style/trend, visual feel) must
cite a look source: operator sites, endorsed lists, Mobbin, or an
approved candidate. Principle-level rows (spacing, ratios, hierarchy,
rhythm, cadence, grid, width, a11y, collapse) may cite any
principle-contributing source — canon, pending candidates, skeleton
sources — because solid design principles exist regardless of taste.
