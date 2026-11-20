---
id: card-s0
type: card
wave: s0
links:
  uses: [rules-P]
  enforced_by: [check_discovery_provenance, check_checklist, check_dna, check_dna_fresh]
---

# S0 — Site discovery + DNA seed (once per site)

**GOLDEN RULE: every colour and font cites a source.** The site DNA is
written by producers (`discovery.py` → `dna_from_discovery.py`) from
BRIEF.yaml and the harvested DISCOVERY.json — never freehand. (D.1)

## Context budget

This step runs on a bounded context packet (`context_pack.py`) — this
CARD, BRIEF.yaml, DISCOVERY.json, the DNA surface, nothing else. The
count is recorded on the wave receipt (P.19).

## Job

1. `discovery.py <site-dir>` harvests the brief + reference corpus →
   `DISCOVERY.json`, pinned to `brief_sha256`.
2. `dna_from_discovery.py <site-dir>` writes the site `DNA.json`,
   `TOKENS.json`, `DESIGN-SYSTEM.md` — every modes.<mode>.<role>
   colour and invariants.fonts entry carries a `provenance` record
   whose source cites DISCOVERY or BRIEF (D.1).
3. `MOBBIN-REFS.md` records the consulted canon before direction (w1
   re-checks it).

## Hard rules

- Theme defaults are brief-bound: `theme.canvas` is the light canvas;
  `follow_os` is false — first paint never follows
  prefers-color-scheme (T.1/U.3).
- DNA pins its inputs (`inputs.{BRIEF.yaml,DISCOVERY.json}` shas) so a
  changed brief re-gates (X.4).
