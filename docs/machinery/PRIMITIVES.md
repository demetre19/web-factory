# PRIMITIVES — moved

The rulebook now lives split by section, staged and gated:

**→ `docs/machinery/design/INDEX.md`** — the stage map (W0 scaffold →
W7 review). An agent reads the INDEX plus only its wave's `CARD.md` and
the rule files the card names — never the whole rulebook.

| Section | File |
|---|---|
| T. Typography | `design/rules/T.md` |
| C. Colour | `design/rules/C.md` |
| L. Layout | `design/rules/L.md` |
| G. Gutters | `design/rules/G.md` |
| S. Shape | `design/rules/S.md` |
| I. Icons | `design/rules/I.md` |
| V. Visual media | `design/rules/V.md` |
| M. Motion | `design/rules/M.md` |
| R. Responsive | `design/rules/R.md` |
| W. Writing | `design/rules/W.md` |
| E. SEO headings | `design/rules/E.md` |
| P. Pipeline fabrication | `design/rules/P.md` |

Rule IDs are unchanged (T.6, C.4, L.7 …). Enforcement:
`design/ENFORCEMENT.md` + `design/enforcement.json` map every rule ID
to `script` / `reviewer` / `operator`; `tools/design-gate/` runs the
mechanical gates per wave.
