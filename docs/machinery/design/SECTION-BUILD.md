---
id: section-build
type: spec
links:
  index: design-index
  uses: [rules-SB, rules-P, rules-G, rules-V, rules-PS, design-genome]
  used_in: [w5, w6, w7, w8]
---

# SECTION-BUILD — section-unit build and mechanical glue

**GOLDEN RULE: ASTRO is the goal; TAILWIND is non-negotiable.** This
file is the architecture W5–W8 run on. Rules: `rules/SB.md`
(SB.1–SB.6). Exemplars: `templates/sections/`.

## 1. Why (the failure this replaces)

The swe-2 run was given one 1,660-line PRIMITIVES file and a chosen
wireframe, then asked to produce a whole page. It ignored the
wireframe, most design rules, and self-graded its QA. One context, one
writer, one page, no unit of failure small enough to check.

The fix is the same one the SEO SOPs project uses: **one unit, one
contract, one gate.** A page is not written; it is assembled from
sections that each passed their own gate.

## 2. The chain

```
DESIGN-PLAN row                      (W5, operator-locked wireframe)
  ↓ gate.py contracts                SB.1 — sections/<nn>-<sec>.contract.json
contract + card + tokens + exemplar  (W6 — one builder per section)
  ↓ gate.py section --sec <name>     SB.3 — sections/<nn>-<sec>.gate.json
src/components/<composition>.astro   P.6 — the skeleton, once (tile shows it)
src/components/sections/<Sec>.astro  SB.2 — the instance: binds the row's
                                     verbatim content, renders <Composition />
  ↓ assemble.py                      SB.4 — site/src/pages/<slug>.astro
<Section sec comp wf-ref ratio disclosure surface density>
  ↓ gate.py w7 / w8                  SB.6 — rhythm, PS.*, scorecard, speed
```

Nothing in this chain is written by a model except the composition
component body and the section instance's content (which comes verbatim
from the STUB). The plan, the contracts, the glue and the page file are
generated. Per-section gates read the instance *and* every component it
imports, so one implementation is checked once.

**Page scoping.** `page_htmls()` returns only the plan's own pages
(`dist/<slug>/index.html` or `dist/<slug>.html`). `system`,
`variants`, `404` and `500` are never in the page suite — they are
gated by `check_tile_is_system`, `check_variants` and C.5 instead.

## 3. The shell owns rhythm (SB.2)

`templates/sections/Section.astro` is the only component that sets
band padding, background, content max-width and gutters. It takes
`sec`, `comp`, `wf-ref`, `ratio`, `disclosure`, `surface`, `density`
and emits the `data-*` contract the W7 gate checks (P.3, P.7).

Surface and density are **attribute scopes** in the shared layer
(`.sec-band`, `.sec-inner`, `[data-surface=…]`, `[data-density=…]` in
`templates/astro/src/styles/global.css`). A section restyles by
changing one attribute on the shell — never by adding `bg-*`/`py-*` to
its own markup. Spacing between sections is then impossible to get
wrong, because no section component can express it.

## 4. The contract (SB.1)

`sections/<nn>-<sec>.contract.json` carries exactly what one builder
needs, and nothing else:

| Field | Source | Why the builder needs it |
|---|---|---|
| `section`, `index`, `file`, `component` | plan row | identity and output path |
| `wf_ref` | plan row (P.4) | the wireframe block this section must match |
| `composition`, `archetype` | plan row + genome map | which exemplar to adapt |
| `speech_act`, `category` | plan row | rhetorical job (SECTION-CATALOG) |
| `surface`, `density` | plan row | context only — the shell sets them |
| `emphasis`, `align`, `stack`, `collapse`, `media_ratio`, `disclosure` | plan row | the layout decision the row already made |
| `content.heading`, `fs`, `body`, `h1` | STUB (verbatim) | copy is a contract, not a suggestion |
| `neighbours.prev/next` | plan rows ±1 | surface/composition adjacency without seeing the page |
| `allowed.classes`, `allowed.utilities`, `allowed.attributes` | layer + tokens | the closed vocabulary (P.2, P.8) |
| `rules` | enforcement.json | the rule IDs that bind this section |
| `patterns` | patterns index | the Mobbin pattern this composition came from |
| `exemplar` | templates/sections | the gold reference to adapt (SB.5) |

A builder agent receives this file, its CARD, the tokens and the
components. Not the plan, not the other sections, not the page.

## 5. Per-section gate (SB.3)

`python3 tools/design-gate/gate.py section <pipeline-dir> --sec <name>`
checks the component alone: classes ⊆ layer + token utilities, no
hex/rgb/oklch literals, no arbitrary `[...]` values, no emoji (P.10),
Lucide inline SVG with `currentColor` (P.11), `<img>` has `alt` (V.2),
the contract's heading appears verbatim (E.1), the media ratio is
applied (V.1), and the component does not set `data-surface` itself.
It writes `sections/<nn>-<sec>.gate.json`; W6 fails until every record
is `pass: true`.

## 6. Mechanical glue (SB.4)

`python3 tools/design-gate/assemble.py <pipeline-dir>` writes
`site/src/pages/<slug>.astro` from plan order and stamps a
`// assembled: <hash>` marker over the contracts. W7 re-runs the same
function and compares: a hand-edited page, or a page assembled before
the contracts last changed, fails. The model never touches the glue,
so section order and surface/density can't drift from the plan.

## 7. Gold exemplars (SB.5)

`templates/sections/<composition>/<Composition>.astro` — one approved
reference per SECTION-CATALOG composition (23 written:
`python3 tools/design-gate/exemplars.py` regenerates them). Each is a
real, minimal, token-only component: content inside the shell, scale
utilities only, Lucide SVG, no literals. A builder **adapts** the
exemplar to its contract; `check_exemplars` requires every used
composition to have one and every section component to name it in
frontmatter (`exemplar: <composition>`). Few-shot by code, not by
prose.

## 8. Page-level gates (SB.6)

After the glue, W7/W8 run the whole-page gates — rhythm render
(S-M-L, contrast moment, adjacency, motif break), the six PS.*
segmentation checks, speed/mobile budgets, the scorecard and the
independent reviewer at 1280/768/360. A page-level failure names its
plan row or its section; the fix re-runs that unit, its gate and the
glue — never the whole page.

## 9. Design Library study — what we adopt, what we change

Read: `UNCLUTTER-NEW/CLAUDE-DEV/Design library` —
`DOX/01-CONTRACTS.md` (token scopes §1.2, evidence pack §3, Package A
§4, design-manifest §5, validation §7), `component-seed-pack/blocks/`.

**Adopted:**

1. **Attribute scopes for surface/density** (§1.2) — the same
   utilities render on every surface; a section restyles by one
   attribute. We implement this in `global.css` + `Section.astro`.
2. **A per-section contract/manifest row** (§5 `routes[].sections[]`:
   id, component, surface, density, contentKeys, imageSlots) — our
   `contract.json` is the same idea, generated rather than declared.
3. **Blocking vs finding split** (§7.1/§7.2) — blocking rules reject
   the unit; findings surface in review. Our gate exits non-zero on
   blocking rules and the scorecard carries the graded ones.
4. **Seed blocks as exemplars** (`component-seed-pack/blocks/`) —
   proven, small, adaptable components instead of prose instructions.
5. **Marker-based validation** (`MARKER_MISSING`, `MANIFEST_ROUTE_DRIFT`)
   — we validate `data-sec`/`data-comp`/`data-ratio`/`data-disclosure`
   against plan rows, and the assembled-page marker hash.

**Changed, and why:**

1. **JSON contract per section, not a global manifest** — the Design
   Library's manifest is written by the designer; ours is generated
   from the plan, so it cannot drift from the operator's decision.
2. **Astro components, not HTML files** — the goal is an Astro site
   (P.1); the Design Library's `designs/*.html` are handoff artefacts.
   We keep its validation spirit, not its file format.
3. **Glue generated by a script** — the Design Library expects the
   designer to author page HTML; we forbid it (SB.4), because the
   swe-2 failure was exactly a model improvising page structure.
4. **No `<style>` blocks, no `style=""` except motion vars** — the
   Design Library allows a motion stylesheet; we keep styles in the
   shared layer only (P.2) so class-subset checking stays exact.
5. **Contract carries rule IDs** — the Design Library's rules are a
   fixed checker list; ours are the SOP rule IDs, so a section gate
   failure names the rule that failed and links back to `rules/*.md`.

## Links

- `rules/SB.md` — SB.1–SB.6 with thresholds.
- `rules/P.md` P.3/P.4/P.7 — wireframe lock, plan rows, data-* contract.
- `rules/PS.md` — segmentation of each block.
- `dna/GENOME.md` — `layout-archetype` is the composition gene.
- `stage-w5-wireframe/`, `stage-w6-components/`, `stage-w7-page/`,
  `stage-w8-review/` — the cards that run this.
