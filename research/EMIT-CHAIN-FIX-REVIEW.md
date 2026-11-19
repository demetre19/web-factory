# EMIT-CHAIN FIX REVIEW

Adversarial review of the four emit-chain fix commits. Scope: correctness of
the producers against the judges they must satisfy; no builds were run (read-only
review). Everything below is anchored to the current tree at `d5f192fb` and was
recomputed independently rather than read off the commit messages.

- `38511cbc` — J4 contract courier + `_section_tag` + `assemble_page` BaseLayout wrap + `_style_profiles`/licence rows
- `9322f002` — `emit_global.py` + `templates/layouts/BaseLayout.astro` + `Section.astro` props
- `8a2b71ca` — `gen_fixtures.py` consumes `emit_global`
- `d5f192fb` — `pipeline_emit.py` + render-intent/h1 contract fields + exemplar fixes

Method: `git show <c> --stat` and full per-file hunks for all four; recomputed
`gate.build_contracts` on `tools/design-gate/fixtures/_base`; recomputed
`emit_global.global_css`/`tailwind_config` from the fixture `TOKENS.json` and
checked brace/comment balance, layer presence, `darkMode`, and hex coverage;
traced every emitted `data-*` attribute to its consumer check; grepped every
class the gold exemplars bind against the emitted theme.

## Verdict summary

| Commit | Verdict | One line |
|---|---|---|
| `38511cbc` | **PARTIAL** | Courier and shell wrap are real; the couriered J.4/SKL.1 values have no producer, so the pipe is empty. `_style_profiles` and licence rows are a genuine fix. |
| `9322f002` | **PARTIAL** | `emit_global` is valid five-layer CSS and hex-complete; the theme it emits makes DNA type/space/radius/fonts inert, and the layout it adds never imports the CSS. |
| `8a2b71ca` | **PARTIAL** | `home.astro`/`global.css` are canonical-producer output; components, instances and `dist` remain hand-authored parallel sources that pass checks the real chain fails. |
| `d5f192fb` | **REFUTED (as claimed)** | The T.7 fix, intent mapping, template-literal fix and `//` frontmatter are real; `P4-P6` is absent and the "zero emit defects / w7 fails only on wave-ancestry" claim is false (R.10, J.4, and the CSS-check family fail on real output). |

## 1. Per-commit verdicts

### 1.1 `38511cbc` — J4 data-props + `_style_profiles` — **PARTIAL**

**VERIFIED**

- `_surface_of`/`check_surface_rhythm` chrome exemption (`gate.py:4046-4082`).
  The final form (after the `d5f192fb` refinement) builds
  `'chrome:' + str(data-comp or data-sec)` for chrome blocks (`gate.py:4058`).
  `_is_chrome` is keyed on a closed literal set `CHROME_SECS = {'nav','header','footer','legal','cookie'}`
  plus `comp in ('nav-bar','footer-bar')` (`gate.py:5853-5858`). A content band
  can therefore never produce a `'chrome:…'` signature, and two content bands
  are still compared against each other with `_surface_of` (`gate.py:4060-4070`).
  Two adjacent same-comp chrome shells produce identical signatures and still
  flag. **Answer to the review question: the exemption never exempts two
  content bands.** (The first version in this commit used
  `if _is_chrome(prev) and _is_chrome(cur): continue`, which likewise only
  skipped chrome↔chrome; the refinement removed the chrome↔content comparison
  entirely, which is the documented narrowing discussed under GATE WEAKENINGS.)
- `build_contracts` J.4/SKL.1 courier (`gate.py:6157-6275`), `_section_tag`
  (`gate.py:6476-6500`), and `assemble_page` BaseLayout wrap
  (`gate.py:6503-6536`). Every new contract field is threaded to a prop, and
  every prop is consumed by a check: `data-intent` → PS.11/A.3/T.7/R.5,
  `data-content` → J.5, `data-cols` → G.8, `data-recipe` → J.4,
  `data-seam(-shape-*)` → J.4/J.8, `data-skeleton` → SKL.1,
  `data-surface`/`data-density` → L.14/L.7, `data-ratio`/`data-disclosure` → P.7.
  No silent drop on the consuming side.
- `_style_profiles` flat fallback (`gate.py:10236-10248`) and the
  `style-profiles.json` licence rows. This is a real fix: the data file is a
  flat `{name: profile}` map with no `clusters` key (verified), while the old
  helper read `.get('clusters') or {}` and returned nothing, so every
  `check_style_licence` lookup missed. The added rows (`neo-brutalist` waives
  S.5/S.7, `canon_flag` on `neumorphism`/`corporate-memphis`) are consistent
  with `STYLE.md`. `sop_adherence.py` writes the same flat shape.
- `check_rhythm_render` additions (`gate.py:11151-11187`): the `data-surface`
  read (`:11158-11164`) and `data-density` read (`:11168-11171`) are additive,
  not loosening — they add a second way to satisfy L.7. They are redundant now
  that `d5f192fb` fixed `Section.astro`'s quoted attribute, and they did paper
  over that producer bug at this commit; they do not change what a content page
  must satisfy.

**PARTIAL / REFUTED**

- The courier is empty. `build_contracts` reads `recipe`, `seam`,
  `seam_shape_*`, `skeleton` only from the plan row (`gate.py:6260-6273`);
  the plan rows in the fixture (and the documented W3 row shape) carry none of
  these. Recomputed on `fixtures/_base`:

  ```
  nav     | recipe=None | seam=None | skeleton=None
  hero    | recipe=None | seam=None | skeleton=None
  macro   | recipe=None | seam=None | skeleton=None
  end-act | recipe=None | seam=None | skeleton=None
  footer  | recipe=None | seam=None | skeleton=None
  ```

  `_recipe_topo_map()` fallbacks for `seam`/`seam_shape_*` are keyed on the same
  absent recipe, so they are also `None`. `data-recipe` is conditional in
  `Section.astro:45`; a real build therefore carries no `data-recipe` and
  `check_block_trace` (`gate.py:10832-10860`) fails every block on slug `home`.
  See finding F2.

### 1.2 `9322f002` — `emit_global.py` + BaseLayout + Section props — **PARTIAL**

**VERIFIED (the strongest part of the patch)**

- `GLOBAL_CSS_TAIL` (`emit_global.py:37-167`) is syntactically valid CSS:
  brace balance 47/47 in the tail, 51/51 in `global_css` output; comment
  balance 7/7; no unterminated string.
- Five TK layers are present in the emitted `global.css`: `@theme {`,
  `:root {`, `.dark {`, `@theme inline {`, `@custom-variant dark`
  (`emit_tokens.py:111-196`). `global_css` drops exactly the five header lines
  of `emit_tokens.emit()` and re-adds them (`emit_global.py:257-264`) — correct,
  not an off-by-one.
- Required anchors present: `@layer components` (`:114`), `.sec-band` (`:115`),
  `.surface-{base,muted,inverse,brand,media}` (`:143-147`),
  `.density-{compact,regular,spacious}` (`:148-150`),
  `[data-surface=…]`/`[data-density=…]` scopes (`:154-160`),
  `prefers-reduced-motion` (`:100`), `--text-wrap-heading`, `--input-border`.
- `tailwind_config` (`emit_global.py:217-255`): `darkMode: 'class'` (`:240`),
  `colors`/`fontSize`/`borderRadius`/`spacing` all present (`:243-251`), and all
  18 TOKENS hexes appear verbatim (case-insensitive walk of
  `color.modes.{light,dark}.roles`; 0 missing). TK.3 holds: the tail and the
  exemplars bind semantic/utility names, no literal hex in a colour property.
- `Section.astro` prop→attribute threading is complete and correct: every
  `data-*` is emitted from a prop with a presence guard (`Section.astro:37-52`),
  and `class={\`sec-band surface-${surface} density-${density}\`}` (`:37`) is a
  real template literal (the quoted-string version in this commit rendered the
  literal text `surface-{surface}`; `d5f192fb` fixed it).
- `BaseLayout.astro` satisfies P.16/PS.9/C.5: charset/viewport/title/meta
  description/OG/favicon, paint-first inline theme script + `data-theme-toggle`,
  skip-link, `<main id="main">`, `<footer>` (`:28-66`).

**PARTIAL / REFUTED**

- **The layout never imports the stylesheet.** `templates/layouts/BaseLayout.astro`
  has no `import '../styles/global.css';` in its frontmatter (`:1-26`), while the
  starter it replaces does (`templates/astro/src/layouts/BaseLayout.astro:2`).
  `pipeline_emit.py:236-237` copies the layout verbatim; `astro.config.mjs` sets
  `tailwind({ applyBaseStyles: false })` (`pipeline_emit.py:87-89`); no other
  emitted file imports `global.css` (grep over `assemble.py`, `gate.py`,
  `pipeline_emit.py`, `templates/layouts`, `templates/sections`). The built site
  ships with zero CSS, and the whole `dist_csss`-based check family
  (`gate.py:1749`, consumers at `:1780, :1996, :3238, :3924, :4233, :4323,
  :4633, :4983, :5814`) passes vacuously. No check asserts a stylesheet exists.
  See finding F3.
- **DNA-derived type/space/radius/fonts never reach the CSS.** The tail
  hard-codes `--fs--1 … --fs-5` (`emit_global.py:48-54`), `--space-*`
  (`:62-67`), `--section-space-*` (`:69-73`), `--r-card: 0.5rem` (`:80`),
  `--font-display`/`--font-body` as system stacks (`:82-84`). `emit_tokens`
  derives `--primitive-text-*` from `knobs['type.base'|'type.ratio']`,
  `--primitive-radius` from `knobs['radius.personality']`, and
  `--primitive-font-*` (`emit_tokens.py:127-133`) — but nothing consumes the
  primitives: `@theme inline` maps colours only (`UTILITY_MAP`,
  `emit_tokens.py:36-53`), and `tailwind_config` maps `fluid-N → var(--fs-N)`,
  `card → var(--r-card)` (`emit_global.py:244-250`). Every DNA therefore ships
  the same type scale, spacing, radius and fonts. See finding F6.
- `spacing: { tap: '44px' }` (`emit_global.py:251`) is the only spacing key, but
  the gold exemplars bind `mt-stack` (29×), `gap-fluid-s` (11×), `mt-fluid-s`
  (9×), `gap-stack` (9×), `gap-fluid-l` (5×), `p-fluid-s` (4×), `mt-fluid-l`
  (4×), `p-fluid-m` (3×), `gap-fluid-m` (2×). None exist in the emitted theme
  (Tailwind has no `stack`/`fluid-*` spacing key, and no `--spacing-*` is
  emitted), so all 67 collapse to no CSS. P.2 passes anyway because `TAIL_UTIL`
  is syntactic (`gap(-\w+)*`, `m[trblxyse]?-?\w*`, `gate.py:5560-5590`). See
  finding F5.

### 1.3 `8a2b71ca` — gen_fixtures consume canonical producers — **PARTIAL**

**VERIFIED**

- `gen_fixtures._global_css()` is exactly `emit_global.global_css(TOKENS)`
  (`gen_fixtures.py:958-961`), and `GLOBAL_CSS_TAIL` is the same object
  (`:220`). The fixture's `global.css` cannot drift from the pipeline's.
- `tailwind.config.js` in the fixture is built from `emit_global.tailwind_config`
  (the constant is bound after TOKENS; hex coverage re-verified 18/18).
- `site/src/pages/home.astro` is produced by `gate.assemble_page`
  (`gen_fixtures.py:1449-1451`), and contracts/section by `gate.cmd_contracts`/
  `gate.cmd_section` (`:1447-1448`). For that file the byte-lock is real.

**PARTIAL / REFUTED**

- The byte-lock stops at `home.astro`. The fixture's section instances are
  hand-written templates (`gen_fixtures.py:314-377`, then the prop-less
  `SECTIONS` re-assignment at `:399-406`), the composition bodies are
  hand-written constants (`:379-396`), and `dist/home/index.html` is the
  hand-authored `PAGE_HTML` constant (`:256-313`). `pipeline_emit._comp_copy`
  and `_instance` are never exercised by the selftest, so the fixture cannot
  catch a producer regression in either. See finding F4.
- The fixture dist carries `data-recipe`, `data-seam`, `data-cols`,
  `data-intent`, a CTA anchor, a `<picture>` and ornament markup
  (`gen_fixtures.py:266-300`) that the fixture's own contracts and components
  cannot produce (contracts recompute to `recipe=None`, no `cta`/`items`/`image`
  in `content`; `split-media` renders the CTA only when `cta` is truthy,
  `templates/sections/split-media/SplitMedia.astro:28`). This is the
  fixture-cheat: J.4/R.10 pass on the fixture and fail on real input.

### 1.4 `d5f192fb` — pipeline_emit + intent/vocab — **REFUTED (as claimed), VERIFIED in parts**

**VERIFIED**

- T.7 is a real fix, not silencing. Old: `min(subheads) <= top-1` (flagged a
  subhead *smaller* than display-1, i.e. every normal subhead); new:
  `max(subheads) >= top-1` (`gate.py:1599-1607`), which flags a subhead within
  one rank of the display. The failure direction is now correct.
- `_render_intent` (`gate.py:5144-5160`) + `build_contracts` (`gate.py:6252`)
  make the rendered `data-intent` the component profile's vocabulary, and A.3
  (`gate.py:5163-5202`) accepts it by substring. This closes the fixture
  evidence cases (`definition`→`proof` on cards-n, `cta`→`act` on form-panel)
  without loosening A.3: the old body was moved into `_comp_profiles` and the
  new `check_component_profile` is semantically identical (diffed against
  `d5f192fb^`).
- Frontmatter comment form is a real fix and still enforced: `_instance` writes
  `// dna_hash:`, `// structure_hash:`, `// exemplar:` (`pipeline_emit.py:148-152`),
  and the judges accept the optional `//` while still capturing and comparing the
  value (`check_dna_fresh`, `gate.py:7074-7085`; `check_exemplars`,
  `gate.py:6444-6450`; `check_section_shell` only substring-tests `exemplar:`,
  `gate.py:6360`). Necessary because bare `exemplar: split-media` is invalid JS
  in Astro frontmatter (label + undefined identifiers), so the previous form
  could never build. Values remain mandatory.
- `_comp_copy` copies the gold exemplar with `shutil.copyfile`
  (`pipeline_emit.py:112-123`) — verbatim, SB.5/P.6 preserved. `_instance`
  writes a *new* file (`:126-156`), so the skeleton is never mutated.
- The emitter does not reimplement the gate: it calls `gate.cmd_contracts`,
  `gate.cmd_section` and `assemble.py` (`pipeline_emit.py:247-266`) and uses
  `emit_global` as the only theme/token recipe. No parallel gate/emitter module
  was introduced.
- `Section.astro`'s class template literal (`:37`) and the exemplar fixes
  (h1 prop, `<picture>`, nav burger, footer chrome) are legitimate producer
  fixes, not gate-silencing.

**REFUTED**

- **`P4-P6` is absent.** `EMIT-CHAIN-PLAN.md:88-89` defines the P1-6 tail as
  `assemble.py --fine`, candidates CLI wiring, and the `ASSEMBLED.md` receipt,
  and the plan marks the fix done. `pipeline_emit.py` and `assemble.py` contain
  none of the three (`assemble.py:10-16` accepts only `--variants`/`--layouts`;
  grep for `fine|candidate|ASSEMBLED` finds only `defineConfig`). `preview/fine.html`
  remains a hard w4 artifact (`ARTIFACTS['w4']`, `gate.py:8261`, consumed by the
  fine round) with no producer, and `ASSEMBLED.md` is listed for w7
  (`gate.py:8263`) with no writer (`write_receipt` silently returns for a missing
  file, `gate.py:8268-8274`). See finding F7.
- **"zero emit defects / w7 fails only on wave-ancestry/operator" is false.**
  On a real `astro build` of the fixture-equivalent pipeline: R.10 fails
  (`check_hero_fold`, `gate.py:4130` — no CTA element in the hero), J.4 fails on
  slug `home` (`check_block_trace`, `gate.py:10832-10860` — no `data-recipe`),
  and the `dist_csss` family is vacuous because no stylesheet is emitted (F3).
  These are producer defects, not wave ancestry. The fixture masks them because
  its `dist` is hand-authored (F4).
- **The hero CTA has no source anywhere.** `_instance` reads `cta`/`items`/`image`
  from the plan *row* (`pipeline_emit.py:139-142`); the plan row schema
  (`gen_fixtures.py:210-215`, and the W3 row shape in
  `docs/machinery/design/stage-w3-layout/CARD.md`) carries none. The STUB's
  `## Content inventory` tables are parsed by `Ctx.stub_inventory()`
  (`gate.py:407-437`) and validated at W2 (`gate.py:1506-1525`), but
  `build_contracts` never calls it: `content` is only
  `heading/fs/body/h1/h1_text` (`gate.py:6215-6221`). The data exists and is
  dropped. See finding F1.
- `_instance`'s `h1` override is safe only because the STUB has an `**H1**` row
  (fixture: `gen_fixtures.py:170`); without it `page_h1=''`, no `h1={true}`, and
  E.1 fails. Worth asserting in the producer rather than relying on the stub.

## 2. GATE WEAKENINGS

1. **`check_surface_rhythm` chrome exemption — documented narrowing, not a
   hidden exemption.** `gate.py:4053-4070`. Content bands are never exempted
   (closed `CHROME_SECS` + comp keys, `gate.py:5853-5858`); adjacent same-comp
   chrome still flags. The refinement in `d5f192fb` stops comparing
   chrome↔content adjacency entirely (the first version still did). That is
   consistent with the new docstring ("L.14 judges content-band adjacency, not
   the boilerplate envelope") but **not** with the written rule
   `L.md:159-165` ("Adjacent sections never share a background"). Verdict:
   intentional and defensible, but the SOP text was not updated, so judge and
   SOP now disagree. Doc nit, not a correctness bug.
2. **`check_rhythm_render` `data-surface`/`data-density` reads — additive.**
   `gate.py:11158-11171`. It only adds satisfying conditions; L.7 still
   requires a contrast moment and ≥2 density signatures. It masked the
   quoted-attribute producer bug at `9322f002` but is not itself a loosening.
   Now redundant.
3. **T.7 — not a weakening; it is the fix.** `gate.py:1599-1607`. The old
   comparison flagged the wrong direction. Note the check is vacuous when the
   rendered `data-intent` is not `hero` (e.g. a `hero-act-merge` row renders
   `promise+act`), so it does not cover every hero-shaped section.
4. **Frontmatter `//` comment form — not a weakening.** `gate.py:6444-6450`,
   `:7074-7085`. Values are still captured and compared; the previous bare form
   could not build in Astro.
5. **`check_component_profile` rewrite — not a weakening.** `gate.py:5163-5202`
   is semantically identical to the pre-`d5f192fb` body; only the profile
   loader was extracted (`_comp_profiles`, `gate.py:5127-5142`).
6. **`_style_profiles` flat fallback — not a weakening.** `gate.py:10236-10248`.
   It restores the intended lookup; licence rows are data, and the rows added
   are consistent with `STYLE.md`.

No check was found to be silently disabled, early-returned, or broadened beyond
these.

## 3. CONTRACT VIOLATIONS

1. **J.4 BLOCK-TRACE is unreachable from the emit chain.** `build_contracts`
   reads `recipe` from the plan row only (`gate.py:6260`); no stage writes it;
   `PREBUILD.json`'s `recipe_id` (the documented source, `rules/J.md:82-86`) is
   read only by `check_prebuild_receipt` (`gate.py:10780-10810`) and
   `check_page_family` (`gate.py:11076`). `_section_tag` omits empty props
   (`gate.py:6497-6500`), so `data-recipe` never reaches the page. The fixture
   passes only because its `dist` is hand-authored with `data-recipe`
   (`gen_fixtures.py:266-300`). The gate now demands what the producer cannot
   supply — the definition of a broken chain.
2. **J.5 CONTENT-MAP is only partially bound.** Heading/FS/body are bound from
   the STUB; the STUB's proof/FAQ/media/CTA/contact inventory
   (`Ctx.stub_inventory`, `gate.py:407-437`) is validated at W2 and then
   discarded. Components that render `{cta && …}` / `{items.length && …}`
   therefore render nothing. Not a new SB.2/SB.3 break (the exemplars keep
   their skeletons, and `_comp_copy` is verbatim), but the content contract is
   not satisfied end-to-end.
3. **P.6 is preserved; SB.5 is preserved.** `_comp_copy` is a byte copy;
   `_instance` writes a separate instance. No violation found here.
4. **SB.2/SB.3 hold on the exemplars.** No exemplar emits `<section>` or outer
   padding/background (grep; `FooterBar.astro:22` uses `<footer>` inside the
   Section slot, which is the component's own landmark content, not outer
   rhythm). The tail defines every component class the exemplars bind
   (`wf-cta-button`, `ratio-portrait`, `sec-inner`, `sec-band`, …); the missing
   names are Tailwind *utility* keys, covered in F5, not SB.3.
5. **E.1 is satisfiable but fragile.** The page H1 comes from the STUB's
   `**H1**` row via `h1_text` → `heading` + `h1={true}`. It works for the
   fixture; it fails silently (no `<h1>`) if the stub omits the row.
6. **The emitted site has no stylesheet import** — a P.2/TK contract that the
   gate does not check at the page level (F3).

## 4. AD-HOC CREEP

1. **Two parallel fixture sources remain.** Hand-authored `COMPONENTS`,
   prop-less `SECTIONS`, and `PAGE_HTML` (`gen_fixtures.py:256-406`) coexist
   with the canonical producers. This is exactly the "parallel machinery"
   pattern the audit set out to delete, and it is what makes the fixture green
   where the pipeline is red. (F4)
2. **`pipeline_emit.PKG_DEPS` duplicates versions** from
   `templates/astro/package.json` (`pipeline_emit.py:45-50`). Values currently
   match (astro 5.18.2, @astrojs/tailwind 6.0.2, tailwindcss 3.4.19), so it is
   not a defect today, but it is a second source of truth for the toolchain.
   Prefer reading the starter manifest, or assert equality.
3. **`emit_global.tokens_json` invents a hex and overwrites DNA modes.**
   `modes = rec.get('modes') or modes` runs whenever knobs are missing
   (`emit_global.py:187`), even when the map already has both modes — contrary
   to its docstring ("derive when absent"). `_derive_tokens` passes
   `accent or '#0055AA'` (`:214`), a colour that `dna_tokens._finish`
   explicitly refuses to invent (`dna_tokens.py:338-341`). Low reachability
   (a gate-valid DNA has knobs and an accent), but it is a hard-coded brand
   value in the canonical producer. (F10)
4. **`tools/design-gate/exemplars.py` (350 lines) is imported by nothing**
   (`grep -rn "import exemplars"` → no hits) and carries a second set of
   exemplar HTML with `/media/placeholder.svg`. Pre-existing (commit
   `dd536cd5`), not introduced by this patch, but it is residue the one-machinery
   cutover left behind.
5. **No new parallel gate or theme dict was introduced.** `pipeline_emit`
   delegates to `gate`/`assemble`; `emit_global` is the single theme recipe and
   `gen_fixtures` imports it. This part of the cutover is clean.

## 5. CONFIRMED CLEAN

- `emit_global.GLOBAL_CSS_TAIL`: valid, brace/comment-balanced, all five TK
  layers, `.sec-band`, all five `.surface-*`/three `.density-*`, matching
  `[data-surface]`/`[data-density]` scopes, `prefers-reduced-motion`,
  `--text-wrap-*`, `--input-*`, `.flow`. No literal hex in a colour property
  outside the token layers.
- `emit_global.tailwind_config`: `darkMode: 'class'`, `colors`/`fontSize`/
  `borderRadius`/`spacing` keys present, all 18 TOKENS hexes inlined verbatim.
- `emit_tokens` TK.1/TK.2/TK.3 shape: five layers, `.dark` mirrors every
  semantic, semantic→utility map, `@custom-variant dark`; components bind
  semantic names only.
- `check_surface_rhythm` content safety: content bands never exempted; adjacent
  same-comp chrome still flags (see §2.1 for the doc divergence).
- `check_measurable` T.7: real fix, correct direction.
- `_style_profiles` flat fallback + `style-profiles.json` licence rows +
  `sop_adherence` flat writer: consistent, real fix.
- `Section.astro` prop→attribute threading: every `data-*` in the contract is
  emitted and has a consumer; `data-wf-ref` omission when undefined is correct.
- Frontmatter courier: `// dna_hash:`/`// structure_hash:`/`// exemplar:`
  emitted by `_instance`, accepted and value-checked by DM.2/SB.5.
- `_comp_copy` verbatim (`shutil.copyfile`) and `_instance` as a separate file:
  SB.5 and P.6 preserved.
- B1 byte-lock of `site/src/pages/home.astro` and of `global.css`: both are
  canonical-producer output (`gen_fixtures.py:1449-1451`, `:958-961`).
- S0 scaffold: `package.json`, `astro.config.mjs`, `public/favicon.svg`,
  empty `index.astro` written; `PKG_DEPS` matches the vendored toolchain.
- `_system` writes `data-theme-toggle`; `check_dark_mode` satisfied.
- A.3 intent mapping: rendered vocabulary is the profile's, and the profile
  check remains binding.
- `check_tile_page_parity`'s *stylesheet/layout* arm is intact; only its
  composition arm is vacuous (F9).

## 6. Findings, ranked

### F1 (P1) — Bind the STUB content inventory into contract content so the hero renders a CTA
`pipeline_emit.py:139-142` reads `cta`/`items`/`image` from the plan row; the
plan row has none, and `build_contracts` puts only `heading/fs/body/h1/h1_text`
in `content` (`gate.py:6215-6221`). `Ctx.stub_inventory()` already parses the
STUB's CTA/media/proof/FAQ/contact tables (`gate.py:407-437`) and W2 validates
them (`gate.py:1506-1525`), but the emit chain never consumes them. On a real
build the hero is `<h1>` + `<p>` only, and `check_hero_fold` fails
(`gate.py:4130`). The fixture hides it with a hand-authored `<a class="btn-primary">`
in `PAGE_HTML` (`gen_fixtures.py:272`). Also note the image fallback
`/media/placeholder.svg` (`split-media/SplitMedia.astro:30`) is not written by
the scaffold, so every unbound image 404s.
Fix: add `'cta'`, `'items'`, `'image'`, `'contact'` to `content` in
`build_contracts` from `ctx.stub_inventory()`, and have `_instance` read them
from `contract['content']` (not `row`).

### F2 (P1) — Give J.4 `data-recipe` a producer (plan row or PREBUILD)
`build_contracts` `'recipe': r.get('recipe')` (`gate.py:6260`) has no upstream
writer; PREBUILD's `recipe_id` never flows into contracts. `check_block_trace`
(`gate.py:10832-10860`) fails every block on slug `home` on real output, and is
vacuous for any other slug because the path is hardcoded (`:10839`).
Fix: resolve the recipe per section from PREBUILD (J.3 already validates it) or
add a documented `recipe:` plan-row field populated by W3, then courier it as
today. Also derive `seam`/`seam_shape_*` from the same topology entry.

### F3 (P1) — Import `global.css` in the emitted BaseLayout
`templates/layouts/BaseLayout.astro:1-26` lacks
`import '../styles/global.css';` (the starter has it at
`templates/astro/src/layouts/BaseLayout.astro:2`). With
`tailwind({applyBaseStyles:false})` (`pipeline_emit.py:87-89`) the build emits no
CSS, and ~8 `dist_csss` checks pass vacuously.
Fix: add the import as the first frontmatter line of the template; optionally
add a gate assertion that `dist/` contains ≥1 `.css` file.

### F4 (P2) — Make the fixtures consume `_comp_copy`/`_instance` instead of parallel constants
The selftest cannot catch producer regressions because `COMPONENTS`,
`SECTIONS` and `PAGE_HTML` are hand-authored (`gen_fixtures.py:256-406`), and
`dist/home/index.html` is not build output. This is the mechanism behind F1/F2's
false green.
Fix: have `gen_fixtures` invoke `pipeline_emit._comp_copy` and `_instance` (or
the shared functions they wrap) and assert the fixture `dist` is produced by a
build, or mark the hand-authored `dist` explicitly as a fixture-only shortcut.

### F5 (P2) — Define the spacing keys the gold exemplars bind
`tailwind_config` emits `spacing: { tap: '44px' }` only
(`emit_global.py:251`); the exemplars use `mt-stack`/`gap-stack`/`*-fluid-{s,m,l}`
67 times. P.2's `TAIL_UTIL` is syntactic (`gate.py:5560-5590`) so the gate
passes while the browser applies no spacing.
Fix: extend `spacing` with `stack`, `fluid-s`, `fluid-m`, `fluid-l` bound to
`var(--space-*)` (or rename the exemplar classes to existing utilities).

### F6 (P2) — Bind the DNA type/space/radius/font knobs into the emitted CSS
The tail hardcodes `--fs-*`/`--space-*`/`--r-card`/`--font-display`
(`emit_global.py:48-84`) while `emit_tokens` derives `--primitive-text-*`,
`--primitive-radius`, `--primitive-font-*` (`emit_tokens.py:127-133`) with no
consumer. Every DNA ships identical type, spacing, radius and fonts, so the
headless variance run cannot show type/space/radius diversity.
Fix: derive the `--fs-*`/`--space-*`/`--r-card`/`--font-*` values from the
TOKENS knobs in `global_css` (or make the tail reference the primitives), and
keep the gate's TK checks reading the same names.

### F7 (P2) — Implement or retract the claimed P4-P6 tail
`EMIT-CHAIN-PLAN.md:88-89` claims `assemble.py --fine`, candidates CLI, and
`ASSEMBLED.md`; none exist (`assemble.py:10-16`, grep). `preview/fine.html` is a
hard w4 artifact with no producer; `ASSEMBLED.md` is listed for w7 with no
writer.
Fix: add the three producers, or change the plan/commit claim and the ARTIFACTS
lists so a w4/w7 pass does not depend on files nothing writes.

### F8 (P3) — Restore the `density` prop type in Section.astro
`templates/sections/Section.astro:19` declares `surface` but not `density`;
`:31` destructures `density = 'regular'`, and `assemble_page` passes it
(`gate.py:6486`). `astro build` does not typecheck, so this is latent, but
`astro check`/editors fail.
Fix: add `density?: 'compact' | 'regular' | 'spacious';` to `Props`.

### F9 (P3) — Emit `data-comp` on the system tile specimens
`check_tile_page_parity`'s composition arm (`gate.py:5723-5747`) needs
`data-comp` on the tile; `pipeline_emit._system` (`:160-169`) and the fixture
`SYSTEM_ASTRO` (`gen_fixtures.py:302-312`) render bare `<Camel />`, so
`tile_comps` is empty and the arm never fires.
Fix: wrap each specimen as `<div data-comp={c}><Camel /></div>`.

### F10 (P3) — Stop inventing tokens in `tokens_json`
`emit_global.py:187` overwrites the DNA's modes whenever knobs are absent, and
`:214` passes `accent or '#0055AA'`. `dna_tokens._finish` raises rather than
invent a hex (`dna_tokens.py:338-341`).
Fix: only take derived modes when the map's modes are absent, and fail loud
(SystemExit) when `invariants.accent` is missing.

## 7. w7 claim

The plan's status line — "pipeline_emit --build exit 0 → real astro build; w7
fails only on wave-ancestry/operator gating (zero emit defects)" — is **not
supported**. `--build` exiting 0 only proves Astro accepted the sources; it does
not prove the built page satisfies the gate. On the real build the hero has no
CTA (R.10), slug `home` has no `data-recipe` (J.4), and no stylesheet is emitted
so the CSS-check family is vacuous. Those are producer defects. The fixture's w7
green is achieved with a hand-authored `dist` and hand-authored components, so
it cannot stand as evidence about the pipeline.

Verdict: **the patch is not merge-ready.** F1-F3 are correctness defects on the
primary path (hero CTA, J.4 trace, stylesheet import); F4 is the reason the
selftest does not see them; F5/F6 make the emitted design DNA-independent; F7 is
an unimplemented, claimed deliverable.
