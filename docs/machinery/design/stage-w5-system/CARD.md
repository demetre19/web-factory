---
id: card-w5
type: card
wave: w5
links:
  uses: [rules-T, rules-C, rules-G, rules-S, rules-I, rules-V, rules-M, rules-W, rules-R, rules-P]
  enforced_by: [check_system_enums, check_spacing_scale, check_breakpoints, check_content_width, check_contrast, check_type_system, check_tailwind_derivation, check_tile_is_system, check_no_emoji, check_neutral_tint, check_proximity, check_border_widths, check_reduced_motion, check_dark_mode, check_dark_toggle, check_checklist, check_dna, check_dna_fresh]
---

# W5 — Design system (tokens → Tailwind → style tile)

**GOLDEN RULE: ASTRO is the goal; TAILWIND is non-negotiable.** The
system is `TOKENS.json` compiled into `tailwind.config` + `global.css`,
rendered on `preview/system.html` — self-contained preview HTML
(P.1); the Astro `src/pages/system.astro` tile joins at W6.

**Read DNA map. Every decision traces to it.** The map (`DNA.json` + `DNA.md`) is the single source of coherence: every value used here must be traceable to it (`gate.py dna`).

## Job

Fill `DESIGN-PLAN.md` `system:` — every number bound, every value a
token or a member of a closed set; nothing downstream invents a number.
Then compile: `TOKENS.json` → `tailwind.config` theme (P.5) →
`src/styles/global.css` `:root` + `@layer components` → system tile
showing every surface × density × type rank × buttons/fields/cards.

## Rules that apply (by ID)

- **Type (T):** fonts ∈ T.4 directory, ≤2 families, no same-class
  pairing (T.3); `clamp()` Utopia ramp; ranks as step/weight/tracking
  tuples; measure ≤65ch (T.6); query H1 stays small (E.2).
- **Colour (C):** roles ∈ C.1 map; temperature matches direction
  (C.2); chromatic neutrals 2–6%S (C.3); accent by harmony or extracted
  brand (C.4); dark surfaces tinted, never #000 (C.5); computed
  contrast: ink≥7:1 vs bg/surface, accent_fg≥4.5:1 vs accent,
  ink_muted≥4.5:1 vs bg (C.7); accent budget ≤10% (C.7).
- **Space (G):** `space.scale` ∈ G.1 exactly; section_densities ∈ G.3
  tiers; group:section gap ≥2× (G.2).
- **Grid (R):** breakpoints ⊆ R.1 closed set {360,640,768,1024,1280,
  1440,1920}, min-width only; edge_padding ∈ R.2 ramp; content_width ≤
  L.11 1440 ceiling; stack_order text-first default (R.3).
- **Shape (S):** one S.1 personality; radius tokens ∈ S.2 row only;
  borders {0,1,2}px (S.5); elevation↔radius coupled (S.7).
- **Icons (I):** family ∈ I.1 closed set; style + stroke_class uniform
  (I.2); touch/icon sizes ∈ I.3.
- **Media (V):** treatment ∈ V.2 (one, ≥80%); authenticity tier ∈ V.6.
- **Motion (M):** personality ∈ M.1; durations/easing ∈ M.2 tokens;
  reduced-motion fallback (M.6).
- **Copy (W):** cta_person first|second, one per flow (W.2);
  reading_level ≤grade-8 (W.8).
- **P.2 shared source:** tile consumes the SAME config+layer the page
  will; no tile-only stylesheet.
- Every field carries provenance (`extracted|snapped|inferred|chosen`);
  `inferred` unresolved ⇒ decisions[] open item.

## Exit gate

```bash
python3 tools/design-gate/run.py w5 <pipeline-dir>
```
Checks: enums + non-empty fields; spacing ⊆ G.1; breakpoints ⊆ R.1;
WCAG ratios computed from `system.color.roles` hexes; TOKENS.json +
config + global.css + preview/system.html exist; config derived from tokens;
tile instantiates surfaces/densities/ranks; `astro build` exits 0.
Operator approves the rendered sheet in chat → `run.py nonce w5 <dir>` → `run.py approve w5 <dir> --nonce N`.

- LAW.REF (REF.1): system choices cite canon; spacing is a G.1 step or an ACSS tier name — never invented px.

## Done when## Done when

`GATES.json.w5.pass` for current input hashes and
`CHECKLIST/w5.md` has no blank evidence
(P.9).
