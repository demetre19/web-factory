---
id: card-w7
type: card
wave: w7
links:
  uses: [rules-R, rules-E, rules-W, rules-V, rules-M, rules-P, rules-PS, rules-SB, section-build]
  enforced_by: [check_assembly, check_spec_verbatim, check_page_data_attrs, check_heading_verbatim, check_class_subset, check_no_stray_styles, check_no_emoji, check_icon_discipline, check_speed_budget, check_mobile_budget, check_viewport, check_tap_size, check_rhythm_render, check_segment_roles, check_segment_region, check_segment_share, check_segment_media, check_segment_footer, check_segment_priority, check_astro_build]
---

# W7 — Page assembly (components → page → dist)

**GOLDEN RULE: ASTRO is the goal; TAILWIND is non-negotiable.** The page
is `src/pages/<slug>.astro` assembled ONLY from W6 components —
catalogue order, no new styles. Preview = `dist/` build output. (P.1,
P.7)

**Read DNA map. Every decision traces to it.** The map (`DNA.json` + `DNA.md`) is the single source of coherence: every value used here must be traceable to it (`gate.py dna`).

## Job

Run the glue — never write the page:

```bash
python3 tools/design-gate/assemble.py <pipeline-dir>
python3 tools/design-gate/gate.py w7 <pipeline-dir>
```

`assemble.py` writes `src/pages/<slug>.astro` from plan order: imports
every section, wraps it in `<Section>` with the row's surface, density,
`wf-ref`, ratio and disclosure, and stamps a marker hash over the
contracts (SB.4). Then `astro build`; the emitted `dist/` page is what
the gate and the reviewer read. A page-level failure traces to a plan
row or a section — fix that unit and re-run the glue (SB.6).

## Rules that apply (by ID)

- **P.7** Page = component instances in plan order. No structural
  markup outside components; no page-level `<style>`; no class outside
  the shared layer + config utilities — unknown class = fail.
- **P.3/P.4** Every rendered `<section>` carries `data-sec data-comp
  data-ratio data-disclosure` matching its plan row, 1:1 in order.
- **P.6** Every component on the page appears on `system.astro` —
  nothing ships that the tile didn't show.
- **E.1** Headings render the STUB vector verbatim: H1 = STUB H1,
  every H2/fold label + its `fs` first sentence verbatim, vector
  order; no invented headings, none dropped.
- **E.2** `heading_class` honoured: query = small/muted rank, claim =
  full display rank; macro `disclosure: open` only.
- **W** CTA labels verb-first 2–4 words from `system.copy`; links
  front-loaded (W.7); ≤1 link per section zone rules (E.3).
- **R.1/R.6** viewport meta present; breakpoints min-width; touch
  targets ≥44px where sizes declared.
- **V.3/V.6** Media at `data-ratio` via `aspect-*`; alt text real;
  no placeholder/stock — keep-list assets only.
- **M.6** `prefers-reduced-motion` honoured in built CSS.
- **Chrome** nav/footer are components too; burger collapse real
  (R.3); complete footer (site map + NAP).
- SPEC `sections[]` == plan rows verbatim (verbatim diff); a SPEC that
  contradicts the plan is a refuse.
- **P.10/P.11** No emoji anywhere in emitted HTML; icons inline SVG,
  `currentColor`, sizes ∈ {16,20,24,32,48}, stroke ∈ {1.5,2,2.5,3}.
- **Scope** Every page check reads the plan's own pages only
  (`dist/<slug>/index.html` / `dist/<slug>.html`). `system`,
  `variants`, `404`, `500` are excluded and gated by their own checks.
- **P.12** Speed budget on `dist/`, static only: JS ≤ ~50 KB, images
  via `<Image>`/`<Picture>` with dimensions, lazy below fold, hero
  `fetchpriority`, fonts self-hosted + swap + preload, no
  render-blocking third party. Lighthouse is an operator post-build
  check, never a gate.
- **P.13** Mobile budget: 360 render folds per R.5, no horizontal
  scroll at 360, every target ≥ 44 px (R.6).
- **PS.1–PS.6** Segmentation on the rendered DOM: one role + one
  heading per block, chrome at the edges only, main-content share
  ≥ 80 %, media blocks carry alt + context text, no h1/prose in the
  footer, main before chrome in DOM order.
- **L.7/§4 rendered rhythm:** a contrast-moment surface renders, S-M-L
  density steps render, no composition runs longer than two.

## Exit gate

```bash
python3 tools/design-gate/gate.py w7 <pipeline-dir> --stub <stub.md>
```
Checks: `astro build` 0; dist `<section>` `data-*` == plan rows;
headings + fs verbatim vs STUB; page classes ⊆ layer ∪ utilities; no
`<style>`/hex/px outside config+`:root`; components-used ⊆
tile-components; viewport meta; 44px declared targets; SPEC verbatim;
no emoji; icon sizes/stroke; speed + mobile budgets; PS.1–PS.6;
rendered rhythm. Operator approves the built page.

## Done when

`GATES.json.w7.approved` is true and `CHECKLIST/w7.md` has no blank
evidence (P.9). `gate.py score <pipeline-dir>` then writes
`SCORECARD.json`/`SCORECARD.md` — every SOP section ≥ 90.
