---
id: rules-STYLE
type: rulebook
links:
  index: design-index
  see_also: [rules-S, rules-DM, section-catalog]
  used_in: [w5]
---

# STYLE — Declared-style licences (lint waivers)

A declared design style (neubrutalism, neumorphism, corporate
Memphis, glassmorphism, …) legitimately bends closed-set lints —
a neo-brutal site ships 4px borders (S.5) and hard offsets (S.7)
*on purpose*. The waiver must be a recorded licence, never a silent
deviation:

- The operator declares `style_licences: [{cluster, where}]` in
  DESIGN-PLAN. `cluster` names a row in
  `patterns/data/style-profiles.json`; `where` scopes the waiver
  (empty = whole site).
- The cluster's `waives` list enumerates exactly which stylistic /
  structural rule ids it may bend — licence expansion happens inside
  `skipped_rules`, so waived failures disappear from the wildcard
  sweep the same way declared breaks do.
- **Invariant rules can never be waived.** A licence that names an
  invariant-tier rule, an unknown cluster, or a cluster whose
  `conflicts`/`canon_flag` the design doesn't satisfy FAILs outright.
- `canon_flag: true` clusters (e.g. neumorphism, corporate Memphis)
  contradict unwaivable canon — the licence itself is a hard FAIL,
  not a warning.

### ST.1 — licence integrity

Every licensed cluster resolves to a `style-profiles.json` row; its
`waives` contain only stylistic/structural ids; its `conflicts` don't
intersect the design's declared canon.

### ST.2 — licences are part of the design record

Every licensed cluster is recorded in `DNA.md` / `DNA.json`
`style_licences` — a licence is a design decision and must appear in
the record, not only in the plan.

## Enforcement

| Rule | Tier | Mode | Check | FAILs when | Wave |
|---|---|---|---|---|---|
| ST.1 | invariant | script | `check_style_licence` | unknown cluster / canon_flag / invariant-waive / contradiction | w5 |
| ST.2 | invariant | script | `check_style_licence` | licensed cluster absent from DNA record | w5 |
