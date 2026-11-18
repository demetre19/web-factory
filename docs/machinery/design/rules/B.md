---
id: rules-B
type: rules
links:
  used_in: [w2, w5, w8]
  depends_on: [rules-P, rules-DNA, rules-E]
  index: design-index
---

## B. Burst — structure, and one creative licence to break it

Every rule carries a **tier**. A design is compliant by construction;
burst is the single, declared, bounded exception: one option may break
one to two *structural* rules on purpose, judged for style, never for
compliance. Burst is a licence, not a loophole — an undeclared
violation is still a plain FAIL.

### B.1 Every rule has exactly one tier

`enforcement.json` carries `tier` on every rule:

- **invariant** — never breakable: golden rule (Astro + Tailwind, one
  project, tokens compile), no emoji, WCAG contrast floors, touch
  targets ≥ 44 px, the SEO heading vector / H1, speed and mobile
  budgets, the copy contract, PS.1–PS.6 segmentation, and the gate
  mechanics themselves.
- **structural** — breakable only through a declared break (B.4):
  section order, wireframe lock, data-* contract, composition choice,
  component catalogue, page assembly, measure bounds, rhythm laws.
- **stylistic** — freely mutable inside its closed set: type pairing,
  colour temperature, radii, icon style, media treatment, motion
  personality, density, tone.

FAIL: a rule with no tier, or an unknown tier value.

### B.2 One burst toggle, closed range

The plan carries `burst: 0 | 1 | 2 | 3` (default 0 = off). Range is
closed; an out-of-range or missing value at W4 fails.

| `burst` | Licence |
|---|---|
| 0 | no wildcard option, no declared breaks |
| 1 | wildcard mutates 1–2 **stylistic** genes to low-prevalence but allowed alleles (genome mutation inside the closed sets) |
| 2 | burst 1 + **one** declared break of a `structural` rule |
| 3 | burst 1 + up to **two** declared breaks of `structural` rules |

### B.3 Exactly one wildcard option

At W3 (layout round, ≥5 options) and W4 (look round, exactly 3) one —
and only one — of the options is labelled `wildcard: true`. It carries the same
genotype vector shape as the others plus `mutates:` naming the genes
it moved. The operator sees it labelled **WILDCARD** with its breaks
listed; it is never presented as the safe default. FAIL: zero or two
wildcards when `burst > 0`, or any wildcard when `burst: 0`.

### B.4 Declared break contract

Every break is one `decisions[]` row:

```yaml
- {rule_id: L.3, what: "<the rule text it departs from>",
   why: "<the intent the break serves>",
   where: <section slug>, compensating: "<the move that keeps the page legible>"}
```

Rules: `rule_id` must exist and be `structural` — a declared break of
an `invariant` is a FAIL, never a licence; `where` names a real
section; at most **one break per section**; every other rule in the
page still passes 100 %. An undeclared violation is a normal FAIL.

### B.5 Judged for style, not compliance

Gates skip exactly the declared rule(s) for the option that carries
them; every other check runs unchanged. The scorecard reports skipped
rules as `broken-by-intent`, not as passes. The W8 reviewer scores the
wildcard on the STYLE rubric — intent legible, coherence with the
system, focal payoff, restraint (once, not everywhere), still on-brand
versus the vertical profile — and a novelty bound (B.6) keeps the
result inside the brand's orbit. If the wildcard is chosen, its breaks
become the site's sanctioned `site.motif.break`.

### B.6 Novelty stays inside the profile's orbit

The chosen genotype's distance from its vertical profile centroid
(`NOVELTY.json`: `{distance, bound}`, computed by
`tools/design-gate/genome.py`) must stay within `bound`. Burst buys
surprise, not a different business. FAIL: `distance > bound`, or a
wildcard chosen with no `NOVELTY.json`.

## Enforcement

Generated from `enforcement.json` (`gate.py enforcement`) — edit the JSON, never this table.

| Rule | Tier | Mode | Check / rubric | FAILs when | Wave |
|---|---|---|---|---|---|
| B.1 | invariant | script | `check_tiers` | rule without tier / unknown tier | w1 |
| B.2 | invariant | script | `check_burst` | burst missing or outside {0,1,2,3} | w3 |
| B.3 | stylistic | script | `check_burst` | 0 or 2 wildcards when burst>0; wildcard when burst=0 | w3 |
| B.4 | invariant | script | `check_declared_breaks` | bad rule_id / invariant break / 2 breaks in one section / missing field | w3 |
| B.5 | invariant | script | `check_style_review` | wildcard chosen without STYLE items in REVIEW.json | w8 |
| B.6 | invariant | script | `check_novelty` | distance > bound, or no NOVELTY.json | w8 |
