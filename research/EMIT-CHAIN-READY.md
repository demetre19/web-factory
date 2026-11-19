# EMIT-CHAIN — READY TO TRY

The emit chain produces real, gate-clean, DNA-distinct `.astro` sites
through the ONE machinery — no ad-hoc path.

## Operator commands

```bash
cd "/Users/apple/Documents/DEV-WORK/Web Factory"

# 1. the chain itself (selftest, 267 fixtures / 134 checks)
python3 tools/design-gate/gate.py selftest

# 2. emit a site from a pipeline dir (DESIGN-PLAN.md + DNA.json)
python3 tools/design-gate/pipeline_emit.py <pipeline-dir> --build
#   → site/package.json, tailwind.config.js, src/styles/global.css,
#     src/components/*.astro (gold-exemplar copies), src/components/
#     sections/<Sec>.astro (instances), src/pages/*.astro (assembled),
#     sections/*.contract.json + *.gate.json, dist/ (real build)

# 3. the judge (w7 = built-page wave; needs w0–w6 history + CHECKLIST)
python3 tools/design-gate/gate.py w7 <pipeline-dir>

# 4. the variance proof (3 DNAs, same plan)
python3 tools/design-gate/variance_run.py
```

## What a working run looks like

`pipeline_emit --build` on a clone of the verified fixture pipeline:

```
  TOKENS.json written (knobs from DNA)
  scaffold: package.json, astro.config.mjs, favicon, index
  tailwind.config.js
  src/styles/global.css
  Section.astro + BaseLayout.astro
  5 components + 5 instances
  system.astro + COMPONENTS.md
  gate.py contracts …   5 written
  gate.py section …     nav/hero/macro/end-act/footer PASS
  assemble.py …         site/src/pages/home.astro
  astro build exit 0    3 pages
```

## Proof artifacts (already produced)

`gate.py w7 /tmp/variance/spacious-serif-editorial` → **zero emit
defects**. Every non-order failure is resolved; only ORDER (w0–w6 run
via `run.py` first + operator approvals) and P.9 (operator-filled
`CHECKLIST/w7.md`) remain, both by design.

| Check | Before fix | Now |
|---|---|---|
| F3 CSS shipped | `BaseLayout` never imported `global.css` → **0 CSS in dist**, CSS checks vacuous | `import '../styles/global.css'` in layout + system.astro → real stylesheet |
| F1 hero CTA | stub `### CTAs` parsed at W2, discarded → no `cta` prop, `R.10` fail | stub_inventory → contract `content.cta` → `<SplitMedia cta={…}>` renders |
| F2 `data-recipe` | recomputed contracts had `recipe=None` → no `data-recipe`, `J.4` fail | plan rows carry `recipe` → `data-recipe` on all 5 `<Section>` |
| F5 fluid utils | `mt-stack`/`text-fluid-*`/`gap-fluid-*` used 67×, never emitted → `P.2` vacuous | defined in `@layer components` bound to rungs |
| F6 DNA→CSS | `--fs-*`/`--r-card`/`--font-*`/`--gutter` hardcoded → DNA inert | every one binds `var(--primitive-*)` derived from knobs |
| config | `tailwind.config.js` colors had no commas → invalid JS, sucrase fail | comma-joined, parses |
| G.5 | any `repeat(N)` flagged → media-gated splits (`md:grid-cols-2`) wrongly failed | `_strip_media` → only un-gated `repeat(N)` flags; collections use `.grid-auto` |
| P.13 | `@media(min-width:640px)` misread as `width:640px` | `(?<![a-z-])width` lookbehind |

## Variance report (3 DNAs, same plan)

```
css var keys differing across DNAs: 32/129
  --primitive-gutter     L | xs | s
  --primitive-radius     0.25rem | 0 | 0.75rem
  --primitive-text-3xl   4.735rem | 1.886rem | 2.488rem
  --primitive-grid-min   (via width.inner_rung 70|50|60)
  --sec-pad              section-space-xl | m | xl
  --font-display         sans | sans | sans (serif stack proven:
                         'ui-serif, Georgia…' when genotype says serif)
  accent/hex set         distinct per variant

contract rows differing (surface/density): 3/5
  hero    muted/spacious | base/compact    | base/spacious
  macro   base/regular   | muted/regular   | muted/regular
  end-act inverse/spacious | brand/compact | brand/spacious
```

Different designs, not reskins: padding rungs, gap rungs, radius,
type scale, fonts, surface/density rhythm, accent all vary per DNA.

## Commits

- `61edcb59` bricksmaven corpus (881 classified sections)
- `c413edc9` density rungs from `knobs.space.section_py` + `variance_run.py`
- `9e237829` F1–F6 (css import, cta courier, recipe, fluid utils,
  primitive bindings, config commas, fixtures regen)
- `9af34032` G.5/P.13 + collections → `.grid-auto`

## Not yet done (in EMIT-CHAIN-PLAN.md)

- **F4** fixture components/instances/`dist` still hand-authored —
  the `assemble`/contract side is byte-locked and real, the component
  side isn't exercised by the fixture. Next fix: emit fixture
  components via `_comp_copy`/`_instance`.
- **F7** `assemble.py --fine` (preview/fine.html), candidates CLI,
  `ASSEMBLED.md` receipt — planned tail, not built.
- F8–F10 minor (Section Props doc line, tile `data-comp`,
  `tokens_json` hex-invent guard).
