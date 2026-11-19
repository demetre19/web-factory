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
Mobbin screens, operator-suggested sites, and the banked reference set
are the highest design authority after the copy contract and brand
invariants. Canon overrides generated defaults — including the ACSS
baseline (`ACSS-BASELINE.md`) — wherever they conflict; ACSS fills only
what canon does not specify.

### REF.1 Every choice traces to canon

Every composition, hero archetype, section rhythm and look-knob choice
carries ≥1 canon reference — a Mobbin screen id, an operator site URL,
or a `pattern-*` id — recorded in the plan row (`refs:`) and in the
picker option's `data-refs` metadata. Untraced choices FAIL.

Retrieval is mandatory and complete: for each section type query the
full canon set (Mobbin via MCP + `patterns.py` over the bank + operator
sites) and record every retrieved ref in `MOBBIN-REFS.md`. A retrieved
high-similarity ref that was not used is logged as **ignored** with a
reason — refs are never silently dropped.

Operator-suggested sites are auto-captured and banked, then weighted
above Mobbin in retrieval ranking.
