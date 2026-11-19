---
id: recipe-count-up
type: motion-recipe
taxonomy:
  trigger: in-view
  technique: rAF-loop
  property: [opacity, transform-scale]
  budget: compositor-safe
  m_type: functional
  purpose: [entrance, attention]
  timing_class: slow
  easing_family: ease-out
  loop_type: none
  complexity: atomic
  js_dependency: light
  personality_fit: [professional, subtle]
source: copperlane.lexdemos.com — Reveal.astro (data-settle +
  data-count, power2.out 1.4–1.6 s)
---

# count-up — settle-in + number reveal

The copperlane `Reveal` pair: a `data-settle` container eases in on
load (`opacity 0→1` + `scale 1.04→1`, 1.6 s — a zoom-OUT settle), and
`data-count` numbers count `0 → n` once at ~92% viewport, 1.4 s
power2-out, `Intl.NumberFormat` formatting, suffix-preserving.

## Parameters

| Token | Default | Notes |
|---|---|---|
| settle duration | 1.6 s | scale 1.04→1 only — never zoom-in |
| count duration | 1.4 s | `1-(1-p)²` power2-out |
| trigger | once at ~8% from bottom | IO `rootMargin:0 0 -8%` |
| formatting | `Intl.NumberFormat` | suffix (`%`, `k`) parsed off the end |

## When to use

Stat bands — "12,400 projects / 98% uptime" moments where the number IS
the claim. The settle wrap is optional; counts can fire standalone.

## Rules

- count once, unobserve — re-triggering counts reads as a bug
- `tabular-nums` on the number or the digits shuffle the layout
- keep digits in the DOM (no JS = the real number shows; count only
  *enhances* — set textContent from the parsed target, never to 0 first
  under reduce)
- reduced-motion: skip counting AND the settle transition — numbers
  show at final value
- ≤4 stats per band; a wall of counting numbers reads as a dashboard
