---
id: checklist-s0
type: checklist
wave: s0
links:
  index: design-index
  card: card-s0
---

# S0 checklist — discovery evidence

Copy into `<site-dir>/CHECKLIST/s0.md`. Blank cell = fail (P.9).
Evidence is a location (`file:line`, command output line), never an
assertion.

| Rule | Evidence |
|---|---|
| D.1 every DNA colour/font cites DISCOVERY or BRIEF | DNA.json provenance.* entries |
| X.4 DISCOVERY.json brief_sha256 == sha256(BRIEF.yaml) | `sha256sum BRIEF.yaml` vs DISCOVERY.json |
| T.1 site DNA modes.light.bg == BRIEF theme.canvas | DNA.json modes.light.bg vs BRIEF.yaml theme.canvas |
| P.5 TOKENS.json derived from DNA | TOKENS.json color.modes |
