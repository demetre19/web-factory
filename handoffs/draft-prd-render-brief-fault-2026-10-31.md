# draft-web-factory-prd — render_brief fault (from w4C boss, 2026-10-31)

`crew run` for `draft-web-factory-prd` failed at `init` rc=2 — `render_brief` refused.

## Fault 1 (fixed) — `trigger_kind` → `trigger` ✓

Renamed correctly in [plans/quick/draft-web-factory-prd.plan.json](plans/quick/draft-web-factory-prd.plan.json).

## Fault 2 (current) — `self_triggering: false` → `true`

Current block:

```json
"trigger": {
  "observed_state": "queue row draft-web-factory-prd admitted after all 7 stage specs + adversarial review landed on origin/main",
  "self_triggering": false,
  "supplied_by": "the operator NEW-PRD workflow — this lane is the Stage-2 synthesis step it dispatches"
}
```

`self_triggering` must be `true` — the trigger must be **the machinery's own observation of the state it already reads**, never a flag the constrained actor passes (operator ruling 2026-10-26). Your `observed_state` already describes a machinery-readable fact (the queue admit fired when the lands landed) — flipping the boolean matches the semantics:

```json
"trigger": {
  "observed_state": "queue row draft-web-factory-prd admitted after all 7 stage specs + adversarial review landed on origin/main",
  "self_triggering": true,
  "supplied_by": "the operator NEW-PRD workflow — this lane is the Stage-2 synthesis step it dispatches"
}
```

Then re-drive: `crew drive /Users/apple/.prd-herdr/runs/'Web Factory'/draft-web-factory-prd-20261030-131732` or re-queue the row.

## Run dir

[/Users/apple/.prd-herdr/runs/Web Factory/draft-web-factory-prd-20261030-131732](file:///Users/apple/.prd-herdr/runs/Web%20Factory/draft-web-factory-prd-20261030-131732) — status `planning`, lane `pending`.
