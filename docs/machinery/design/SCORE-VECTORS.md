---
id: score-vectors
type: doc
links:
  used_in: [w8]
  enforced_by: [check_scorecard, check_dna]
  depends_on: [enforcement, dna-map]
---
# SCORE VECTORS — the scorecard's axes

A scorecard is not "how good does it look". It is 13 measured axes plus
an overall, and every axis is an aggregate over rules the machinery
already enforces — never a vibe. `score-vectors.json` is the machine
form; this file explains it.

**DNA link.** `DNA.json` carries `vector_targets` with exactly these
ids (0.0–1.0 each), set at W1 exit from the current site's rating gaps
and the vertical norms. `gate.py dna` fails when a target is missing,
unknown or out of range. The reviewer's SCORECARD reports the same ids,
so target and result are directly comparable (LAW.DNA).

**How a vector scores.** `gate.py score` computes each rule's 0–1
result (script check → failures; reviewer → REVIEW.json item; operator
→ approval), then averages the rules in the vector's families, and
weights the vectors into `overall`. Weights are normalised; the family
and check lists live in `score-vectors.json` and are the only place to
edit them.

| Vector | Families | What is measured |
|---|---|---|
| `ease_of_use` | R.6, W.7, W.2, I.4 | tap targets, nav links, form presence, duplicate nav, sticky chrome |
| `clarity` | W, E.2 | 5-s elements, h1+subhead reading level, heading grammar |
| `layout` | L, PS | container width, dead regions, chrome position, PS.1–PS.6 |
| `typography` | T, I | font stack, ramp, body ≥16px, leading ≥1.5, heading misuse |
| `colour` | C | role map, pairwise contrast in both modes, accent area |
| `rhythm` | G, L.4, L.7 | gap distribution, density-tier variance, trapped whitespace |
| `imagery` | V | alt/srcset/lazy/dims, icon family, oversized images |
| `trust` | V.6, W.5 | logo wall, testimonials, schema, review badges |
| `conversion` | R.5, W.2 | CTA cadence ≤2 viewports, fold elements, terminal CTA |
| `seo` | E | title length/repeat, h1 count, heading vector, link-farm density |
| `mobile` | R, P.13 | hscroll 360/768, tap targets, collapse, page-height budget |
| `speed` | P.12, V.7 | static budgets: JS weight, image dims/format/hints, fonts, third parties (Lighthouse is an operator check, not a gate) |
| `a11y` | C.7, I.4, R.6, E.1 | axe, alt, landmarks, link names, focus-visible |
| `overall` | — | weighted mean of the 13 |

A vector is not a new rule: it never fails on its own. It aggregates
rules that already have a tier, a check and a wave in
`enforcement.json`, so nothing here can bypass a gate.
