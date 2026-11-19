---
file: SC.md
see: [S.md, TK.md]
---

# SC — SOP constants: the corpus consults the rules

PatternMiner mines the corpus into `patterns/data/sop-adherence.json`
({rule: {baseline, n_sites, adherence, bent}}). The design rules
consume it through a recorded verdict table — constants are
evidence-backed, not asserted: confirm (corpus adheres ≥0.9),
tighten (0.5–0.9), relax (<0.5), insufficient (n<30 keeps the
current constant).

### SC.1 The verdict table exists and covers the corpus

`SOP-CONSTANTS.json` names the dataset and records
`{rule: verdict}` for every rule the dataset measures — the
consultation is auditable, not implied.

### SC.2 Verdicts recompute, never drift

Every recorded verdict equals the derived verdict (the rule's
adherence against the corpus at gate time). A hand-edited or stale
recorded verdict FAILs — the corpus is the source of truth.

## Enforcement

Generated from `enforcement.json` (`gate.py enforcement`) — edit the JSON, never this table.

| Rule | Tier | Mode | Check / rubric | FAILs when | Wave |
|---|---|---|---|---|---|
| SC.1 | invariant | script | `check_sop_constants` | SOP-CONSTANTS.json missing, wrong dataset, or a measured rule unrecorded | w5 |
| SC.2 | invariant | script | `check_sop_constants` | recorded verdict != derived verdict | w5 |
