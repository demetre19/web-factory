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
Canon positives are **Mobbin screens/sections and operator-supplied
sites only** — the web corpus, the negatives/anti layer, and banked
site captures are removed from canon (operator ruling). Canon is the
highest design authority after the copy contract and brand
invariants. Canon overrides generated defaults — including the ACSS
baseline (`ACSS-BASELINE.md`) — wherever they conflict; ACSS fills only
what canon does not specify.

### REF.1 Every choice traces to canon

Every composition, hero archetype, section rhythm and look-knob choice
carries ≥1 canon reference — a **Mobbin screen/section id or URL**
(`mobbin-*`, `mobbin.com/...`) or an **operator site URL**
(`http(s)://`) — recorded in the plan row (`refs:`) and in the
picker option's `data-refs` metadata. Any ref into `data/web`,
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
