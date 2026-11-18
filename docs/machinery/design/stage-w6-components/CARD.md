---
id: card-w6
type: card
wave: w6
links:
  uses: [rules-S, rules-I, rules-V, rules-R, rules-W, rules-M, rules-P, rules-SB, section-build]
  enforced_by: [check_components_exist, check_tile_is_system, check_class_subset, check_no_stray_styles, check_no_emoji, check_icon_discipline, check_section_shell, check_section_allowed, check_section_gates, check_exemplars, check_astro_build, check_checklist, check_dna, check_dna_fresh]
---

# W6 — Components (compositions → Astro components + layer)

**GOLDEN RULE: ASTRO is the goal; TAILWIND is non-negotiable.** Every
composition in the locked wireframe becomes exactly one
`src/components/<name>.astro`, styled ONLY by the shared config +
`@layer components` classes. (P.1, P.2, P.6)

**Read DNA map. Every decision traces to it.** The map (`DNA.json` + `DNA.md`) is the single source of coherence: every value used here must be traceable to it (`gate.py dna`).

## Job

**1. Composition components first.** For every distinct `composition`
in the plan, build the reusable `src/components/<comp>.astro`; extend
`global.css` `@layer components` with its classes; register each on
`src/pages/system.astro` (the tile is the catalogue — P.6).
`COMPONENTS.md` names which component each composition instantiates
(DESIGN-PLAN hard rule 8).

**2. Section instances.** One builder per **section**, not per
composition. Each builder gets only its contract
(`sections/<nn>-<sec>.contract.json`), this card, the tokens and the
components, and returns `src/components/sections/<Sec>.astro` —
content inside the `Section` shell, adapted from the gold exemplar
(SB.1–SB.5, `SECTION-BUILD.md`). An instance renders
`<Composition/>` — never re-implements it.

**3. Gate each instance** with `gate.py section <dir>` until PASS;
only then does the wave gate run.

## Rules that apply (by ID)

- **P.2** Component markup binds layer classes + Tailwind utilities
  from the generated config; NO `<style>` blocks inside components,
  no hex/px literals (values live in config/global.css `:root`).
- **P.5** Radii ∈ S.2 tokens (`rounded-*` names from the personality
  row); spacing ∈ G.1 utilities; type ∈ fluid `text-fluid-*` ranks;
  colours ∈ C.1 roles only.
- **P.6** Every component renders on the tile at its declared
  surfaces/densities — a component the tile doesn't show doesn't
  exist.
- **R.3/R.5** Collapse implemented with `min-width` utilities matching
  the row's `collapse` value; `stack: text-first` ordering real
  (`order-*`/`flex-col`), not described.
- **R.6** Interactive elements ≥44px via the `tap` token; +8px buffer
  between targets.
- **I.1–I.3** Icons = inline SVG, `currentColor`, token-sized,
  `aria-hidden`; emoji banned.
- **V.3/V.4** Media slots at declared `data-ratio` (`aspect-*` token);
  scrim classes where text overlays media.
- **W.2/W.4** CTA buttons + disclosure rows (`<details>`/accordion)
  are components — labels come from plan/system, never re-invented.
- **M.2/M.6** Transitions bound to duration/easing tokens;
  `motion-reduce:` variants present.
- **S.4** Concentric nesting: child radius = parent − padding step.

## Section-unit rules (by ID)

- **SB.2** Section components render content only — no `<section>`,
  no `py-*`/`px-*`/`mx-*`/`bg-*`/`max-w-*` on their root; the shell
  owns rhythm.
- **SB.3** Run `gate.py section <dir> --sec <name>` per section until
  it prints PASS; the record lands in `sections/<nn>-<sec>.gate.json`.
- **SB.5** Name the exemplar you adapted (`exemplar: <composition>`
  in frontmatter); every composition needs one in
  `templates/sections/`.

## Exit gate

```bash
python3 tools/design-gate/gate.py w6 <pipeline-dir>
```
Checks: every plan composition ↔ one `.astro` in `src/components/`
(+ declared chrome components); `COMPONENTS.md` maps all; every
`class=` name ⊆ layer-defined ∪ config utilities (unknown class =
fail); no `<style>`/hex/px in components; `system.astro` instantiates
every component; no emoji; icons inline SVG at closed sizes/stroke;
`astro build` exits 0. Operator approves.

## Done when

`GATES.json.w6.approved` is true and `CHECKLIST/w6.md` has no blank
evidence (P.9).
