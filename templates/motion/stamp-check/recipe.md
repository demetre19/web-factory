---
id: recipe-stamp-check
type: motion-recipe
taxonomy:
  trigger: loop
  technique: css-keyframes
  property: [fill-opacity, stroke-dashoffset, transform-scale]
  budget: stroke-cheap
  m_type: emotional
  purpose: [state-change, feedback, explanation]
  timing_class: loop-short
  easing_family: ease-out
  loop_type: infinite
  complexity: choreographed
  js_dependency: none
  personality_fit: [professional]
source: tamdoma.ai — .st done icon (st-tint + st-draw check) + .sico stamp
---

# stamp-check — confirm sequence (tint → draw → stamp)

A three-act confirmation loop: container tints with accent, a check draws
itself, a badge pops. Each element rides the same `--pass` timeline with
disjoint percentage windows — the "choreographed" complexity tier.

## Parameters

| Token | Default | Notes |
|---|---|---|
| `--pass` | 6 s | loop period |
| tint window | 8–44% | fill-opacity 0→.18 |
| draw window | 10–44% | dashoffset 1→0 |
| stamp window | 16–44% | scale 0→1, +0.3 s delay |

## When to use

Completion/approval states in diagrams, "done" steps, success badges.
For one-shot real confirmations (form submit), retime to ≤400 ms and
run once (milestone: cap 1.5 s, M.2/M.6).

## Rules

- scale pop without overshoot stays `professional`; elastic variants are
  `playful` and milestone-only
- reduced-motion: static "confirmed" frame
