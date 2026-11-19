---
id: parallel-build
type: contract
links:
  index: design-index
  see_also: [rules-P, rules-SB, card-w7]
  used_in: [w3, w4, w7]
---

# PARALLEL-BUILD — lane contract for concurrent builds

Page builds complete in minutes because no two lanes block each
other. This is the contract StunningLoop's fan-out runs against.

## Lanes

Every unit of build work is a lane in `BUILD-PLAN.json`:

```json
{"lanes": [
  {"id": "sec-macro", "kind": "section", "section": "macro",
   "model_lane": "cheap"},
  {"id": "opt-d1",    "kind": "option",  "design": "d1",
   "model_lane": "cheap"},
  {"id": "orchestrate", "kind": "orchestrator",
   "model_lane": "coordinated"},
  {"id": "coherence",   "kind": "coherence",
   "model_lane": "coherence"}
]}
```

- `kind`: `section` | `option` | `probe` | `worker` |
  `orchestrator` | `coherence`.
- `model_lane` chooses the spawn pool:
  - `cheap` — the unlimited pool (`pi/default`, operator-swappable
    successor e.g. muse spark contributor). Every fan-out worker —
    per-section builders, per-option builders, probes — runs here.
  - `coordinated` — swe-2-class, capped ≈10 concurrent subagents.
    Reserved for the orchestrator and coordinated lanes; fan-out
    MUST NOT consume these slots. A page needing >10 workers never
    touches this pool.
  - `coherence` — single-call coherence passes stay on the stronger
    model; never demoted to the cheap pool.

Violations are hard defects (`check_parallel_build`, P.20): a
`section`/`option`/`probe`/`worker` lane on `coordinated`, a
`coherence` lane on `cheap`, >10 coordinated lanes, or an
unparseable BUILD-PLAN.

## What a builder receives — the context pack unit

Each fan-out worker receives exactly one bounded packet from
`context_pack.py assemble_pack(pdir, step, section)`:

```
CARD (the wave's) + rule rows the CARD names (enforcement wave ≤
step, never the full file) + DNA decision surface (knobs, genotype,
modes, rhythm — never variant history) + the section's plan row +
that section's skeleton payload + its STUB copy rows + only the
canon refs it cites.
```

Nothing else. Budgets: 100K tokens per section/component worker,
250K for the layout-round creative lanes (P.19).

## Assembly is mechanical

Builders never fit a page together. Each lane emits its section
markup inside the `Section.astro` shell contract (SB.2/SB.3);
`assemble.py` writes the page from plan order (SB.4). There is no
agent-fit step, no negotiation between lanes.

## Receipts cover the assembled page, not workers

`GATES.json` receipts bind the wave's artifact (the assembled page),
not each worker. Worker output is pre-receipt input; the wave gate
is what binds it.

## Blocking is per-chain — never global

- **Within a round**: design options build concurrently — one
  workpool lane per option (`model_lane: cheap`). A rejected option
  retires; it never blocks sibling options. One pick proceeds.
- **Across pipelines/pages**: every pipeline has an independent
  receipt chain (`pipeline:<id>` in the findings ledger). Page A's
  open findings never gate page B. Findings may be scoped
  `pipeline:<id>:option:<opt>` for lane-local defects — a lane
  finding blocks only that lane.
- **Machinery findings** (`scope: machinery`) gate the machinery
  commands only — they never refuse a site pipeline's round or
  receipt.
- Only `scope: global` rows block everything (reserved for
  machinery-integrity breaches).

`gate.py round`/`receipt` scope every finding check to the pipeline
dir + option being validated; `open_findings(scope=…)` filters to
the caller's chain (`scope`, `global`, or `scope` inside a
parent chain).

## Serial builds

A page with ≥4 independent (non-chrome) sections and no section
lanes gets an advisory `P.20` warning at w7 — fan it out, don't
serialize it.
