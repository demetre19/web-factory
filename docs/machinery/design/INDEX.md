---
id: design-index
type: index
links:
  sequences: [w0, w1, w2, w3, w4, w5, w6, w7, w8]
  contains: [enforcement, section-catalog, primitives, patterns-index, design-genome]
  rules: [rules-T, rules-C, rules-L, rules-G, rules-S, rules-I, rules-V, rules-M, rules-R, rules-W, rules-E, rules-P, rules-PS, rules-DNA, rules-B, rules-SB]
  contains_also: [section-build]
  templates: [template-astro, template-wireframe-cards, template-system-tile]
  index: design-index
---

# DESIGN MACHINERY — stage map + rulebook index

**GOLDEN RULE: ASTRO is the goal; TAILWIND is non-negotiable.** Every
design artifact from W3 on is an Astro page/component in ONE project
scaffolded from `templates/astro/` at W0, themed by `tailwind.config`
generated from `TOKENS.json`. No standalone hand-rolled HTML after W2.
(P.1)

**First move in any wave:** look the rule up, don't re-read the book.

```bash
python3 tools/design-gate/rules.py T.6          # one rule: text + check
python3 tools/design-gate/rules.py measure      # keyword → rule IDs
python3 tools/design-gate/rules.py w5           # what wave 5 loads
python3 tools/design-gate/rules.py pattern-…    # a mined pattern node
```

All web design is boxes. `SECTION-CATALOG.md` composes sections; the
`rules/` files define the *primitive rules* sections are built from;
`dna/GENOME.md` closes the vocabulary a design may choose from. A site
picks from the closed sets; it never invents a value outside them —
freehand = refuse. Rule IDs are stable (T.6, C.4, D.1, PS.3 …); every
ID has exactly one enforcement mode in `enforcement.json` and one row
in `ENFORCEMENT.md` (P.8).

**How to work a wave:** read `stage-<wave>/CARD.md`, then only the rule
IDs it names (via `rules.py`), then this file's row for the wave. A
wave starts only when the previous wave's gate passed for the current
input hashes AND the operator approved its artifact (`run.py`
enforces). A wave ends when `gate.py <wave>` exits 0 **and** the
operator approves; `gate.py <wave> <dir> --approve` records it in
`GATES.json`. The designer model never writes `GATES.json` /
`REVIEW.json` — QA is never self-graded.

## The waves

| Wave | Stage dir | Produces | Rule files | Gate |
|---|---|---|---|---|
| **W0 scaffold** | `stage-w0-scaffold/` | `site/` Astro + Tailwind project from `templates/astro/`; `astro build` exits 0 | P | `gate.py w0` — scaffold, pins, build 0 |
| **W1 DNA + audit** | `stage-w1-dna/` | Mobbin refs, `DESIGN-PLAN.md` `site:`+`intent:`, `dna:` profile + genotype, Phase-0 `audit.md` | P D E V T C L G S I M R W | `gate.py w1` — Mobbin auth+refs, design_mode, intent, audit, genotype |
| **W2 look & feel** | `stage-w2-look/` | ≥2 direction options as Astro tiles = distinct genotype vectors; operator picks | C G S M T R V P D | `gate.py w2` — axes ∈ enums, refused, ≥2 distinct genotypes, `--design` |
| **W3 system** | `stage-w3-system/` | `TOKENS.json` → `tailwind.config` + `global.css` + `src/pages/system.astro` | T C G S I V M W R P | `gate.py w3` — enums, spacing/breakpoints, contrast computed, config derived, build 0 |
| **W4 content** | `stage-w4-content/` | STUB → content inventory: heading vector + body blocks + copy fields | E W R P | `gate.py w4` — inventory complete, verbatim headings, copy fields |
| **W5 page structure** | `stage-w5-wireframe/` | `sections[]` 1:1 from the picked card (`wf_ref`), ASCII critique, wireframe lock | L R E V W P D PS | `gate.py w5` — data-* 1:1, rhythm/motif/emphasis, vector 1:1, genotype alleles |
| **W6 components** | `stage-w6-components/` | `src/components/*.astro` + `@layer components` + tile catalogue | S I V R W M P | `gate.py w6` — every composition a component, classes ⊆ layer, no emoji, build 0 |
| **W7 page** | `stage-w7-page/` | `src/pages/<slug>.astro` from components; `dist/`; `PAGES/<slug>/SPEC.md` | R E W V M P PS | `gate.py w7` — data-* 1:1, verbatim headings, speed, mobile, PS.1–PS.6, rhythm |
| **W8 review** | `stage-w8-review/` | Independent `REVIEW.json` + screenshots 1280/768/360; `SCORECARD.json` | all CARDs (rubric) | `gate.py w8` — review complete, reviewer ≠ designer, every section ≥ 90 |

**Operator approval points (P.8):** after W0, W2 (option pick), W3
(tile), W4 (inventory), W5 (locked rows), W6 (components), W7 (built
page), W8 (verdict). The operator NEVER sees a preview unless every
earlier gate is green and `SCORECARD.json` has no section below 90.

## Rulebook files (load only what your CARD names)

| File | Closed set |
|---|---|
| `rules/T.md` | Typography — read order, pairing, directory, bounds, QA (T.0–T.11) |
| `rules/C.md` | Colour — 6-role map, temperature, neutrals, accent, dark, QA (C.1–C.7) |
| `rules/L.md` | Layout — axes, gutters, edges, negative space, collapse, S-M-L, anatomy (L.1–L.13) |
| `rules/G.md` | Gutters — closed spacing scale, proximity, density tiers, rules (G.1–G.4) |
| `rules/S.md` | Shape — personalities, radii, borders, elevation (S.1–S.8) |
| `rules/I.md` | Icons — style, stroke, sizes, pairing, governance (I.1–I.8) |
| `rules/V.md` | Visual media — words-first, matrix, ratios, scrim, authenticity (V.0–V.8) |
| `rules/M.md` | Motion — personalities, tokens, reduced motion, QA (M.1–M.8) |
| `rules/R.md` | Responsive — breakpoints, edge ramp, collapse, fold, touch (R.1–R.8) |
| `rules/W.md` | Writing — tone, CTA, headings, empty states, link scent (W.1–W.10) |
| `rules/E.md` | SEO headings — vector, classes, lint, QA (E.1–E.4) |
| `rules/P.md` | Pipeline — Astro/Tailwind golden rule, contract tags, gates, budgets (P.1–P.15) |
| `rules/PS.md` | Page segmentation — role blocks, boilerplate, 80/20 share (PS.1–PS.6) |
| `rules/DNA.md` | Design genome — genotype totality, vertical profile, option distinctness (D.1–D.4) |
| `rules/B.md` | Burstiness — tiers, burst 0–3, one wildcard, declared breaks, style rubric (B.1–B.6) |
| `rules/SB.md` | Section-unit build — contracts, shell, per-section gates, glue, exemplars (SB.1–SB.6) |

## Other machinery

| Path | What it is |
|---|---|
| `ENFORCEMENT.md` | Single validation table: every rule → mode → check/item → FAIL threshold → wave (generated: `gate.py enforcement`) |
| `enforcement.json` | Machine form of the same table + `checks` map (structural check → rule IDs) |
| `dna/GENOME.md` | 20 genes, closed allele sets, rule bindings (`## gene: <slug>` + `alleles: […]`) |
| `dna/<vertical>.md` | Vertical profile: `id: profile-<vertical>`, `links: {uses_genes: […], derives_from: [patterns-index]}` |
| `patterns/INDEX.md` | Mined composition library: pattern nodes with prevalence + evidence |
| `patterns/TAXONOMY.md` | Closed tag sets every pattern/annotation carries |
| `GRAPH.json` / `GRAPH.md` | Knowledge graph (nodes, edges, reachability) — `gate.py graph` regenerates and fails on dangling/orphan/unreachable |
| `../SECTION-CATALOG.md` | Section compositions (§2) and rhythm rules (§4) |
| `../PRIMITIVES.md` | Pointer to `rules/` (the split source) |
| `../DESIGN-PLAN.md` | The plan schema this machinery gates |
| `../DESIGN-INTAKE.md` | Intake constants (golden rule, absolute rules) |
| `templates/astro/` | The one project every artifact lives in |
| `templates/wireframe-cards/` | Plain-HTML wireframe cards with the P.3 `data-*` contract |
| `templates/system-tile/` | The system-tile reference (rendered as `src/pages/system.astro`) |
| `templates/sections/` | `Section.astro` shell + one gold exemplar per composition (`exemplars.py` regenerates) |
| `SECTION-BUILD.md` | Section-unit build architecture + Design Library study (node `section-build`) |

## Gate commands

```bash
python3 tools/design-gate/gate.py <w0..w8> <pipeline-dir> \
    [--wireframe <cards/index.html>] [--design <id>] [--stub <stub.md>] \
    [--approve]
python3 tools/design-gate/gate.py coverage     # 100% of rule IDs enforced
python3 tools/design-gate/gate.py consistency  # no duplicate/contradictory numbers, no dangling refs
python3 tools/design-gate/gate.py graph        # knowledge graph integrity
python3 tools/design-gate/gate.py selftest     # every check has pass+fail fixtures
python3 tools/design-gate/gate.py score <dir>  # SCORECARD.json/MD, every section ≥ 90
python3 tools/design-gate/gate.py segment <dir># PS.1–PS.6 on built HTML
python3 tools/design-gate/gate.py enforcement  # regenerate ENFORCEMENT.md
python3 tools/design-gate/gate.py contracts <dir>   # SB.1 write section contracts
python3 tools/design-gate/gate.py section <dir> --sec <name>  # SB.3 one section
python3 tools/design-gate/gate.py wildcard <dir>    # B.* burst/wildcard audit
python3 tools/design-gate/assemble.py <dir>         # SB.4 mechanical page glue
```

`run.py` runs the waves in order and refuses a wave whose predecessor
is not `pass` + `approved` for the current input hashes.
