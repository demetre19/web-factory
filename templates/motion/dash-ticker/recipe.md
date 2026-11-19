---
id: recipe-dash-ticker
type: motion-recipe
taxonomy:
  trigger: loop
  technique: css-keyframes
  property: [stroke-dashoffset]
  budget: stroke-cheap
  m_type: functional
  purpose: [feedback, ambient]
  timing_class: loop-short
  easing_family: linear
  loop_type: infinite
  complexity: atomic
  js_dependency: none
  personality_fit: [professional, subtle]
source: tamdoma.ai — .sico-automation .blip (dashoffset 48→0, dasharray 24)
---

# dash-ticker — pulse line sweep

A bright dash segment sweeps along a path on repeat — the
heartbeat/activity/monitor pattern. `stroke-dasharray` shorter than the
path + a `dashoffset` sweep; the sweep distance must be ≥ path length
covered per dash cycle to avoid a visible jump (24 dash / 48 sweep).

## Parameters

| Token | Default | Notes |
|---|---|---|
| period | 2.5 s | fast enough to read as "alive" |
| dash | 24 | visible segment length |
| sweep | 48 → 0 | 2× dash for a clean restart |

## When to use

Live-status monitors, "machine is running" indicators, ECG/telemetry
flavour, activity strips inside icons. Atomic — pairs under larger
compositions (see `clip-conveyor`).

## Rules

- `linear` is correct — constant velocity is the signal
- keep the base path a quieter tone so the sweep is the accent
- reduced-motion: static fully-drawn accent line
