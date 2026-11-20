# EMIT-CHAIN AUDIT — what the gate reads, what the machinery writes, what died with ba8b94f9

Scope: `tools/design-gate/gate.py` (11,850 lines), its producers, and the
W5→W8 artifact chain. Every claim cites `file:line`. `gate.py` line
numbers are from the working tree at commit ba8b94f9.

Correction to the audit premise: `git show ba8b94f9 --stat` removed
**three** files — `tools/design-gate/section_emit.py` (355 ln),
`docs/machinery/design/patterns/tools/theme_vibes.py` (149 ln),
`tools/design-gate/preview_sections.py` (116 ln) — plus a comment-only
edit to `retrieval.py`. `design_gate.py`, `acss_base.py`, `vibe_emit.py`,
and a `preview/` dir **never existed** (`git log --all -- <path>` empty;
no name match in `grep -rl` over tools/docs/research).

---

## 1. WHAT gate.py CONSUMES at w5/w6/w7

Pipeline root = `<pipeline-dir>` (`Ctx.__init__`, gate.py:308-316);
`ctx.site` = `<pipeline>/site`; `ctx.dir` = `<pipeline>`.

### W5 check set (gate.py:11745-11752)

`check_system_enums, check_spacing_scale, check_breakpoints,
check_content_width, check_contrast, check_type_system,
check_tailwind_derivation, check_tile_is_system, check_no_emoji,
check_neutral_tint, check_proximity, check_border_widths,
check_reduced_motion, check_dark_mode, check_dark_toggle,
check_canon_trace, check_trend_vocab, check_style_licence,
check_token_layer, check_sop_constants, check_three_layers`
+ always-appended `check_context_budget, check_checklist, check_dna,
check_dna_fresh` (gate.py:11791-11793, 11837-11840).
Recorded inputs: `DESIGN-PLAN.md, TOKENS.json, preview/system.html,
site/src/styles/global.css` (gate.py:11830-11831).

| Check | Reads |
|---|---|
| `check_system_enums` (1882) | `DESIGN-PLAN.md` `site.system.{type,space,grid,color,contrast_axes,icons,media,copy}` — required non-empty (1886-1891); icon/media/copy enums (1893-1917) |
| `check_spacing_scale` (1921) | `site.system.space.scale` ⊆ G.1 `{4..128}` or ACSS tier names (39, 1923-1943); `edge_padding` ⊆ `{16,24,32,40,48}` |
| `check_breakpoints` (1951) | `system.grid.breakpoints` ⊆ `{360..1920}`; regex `@media[^{]*max-width` banned in `site/src/styles/global.css` (1960-1962) |
| `check_content_width` (1974) | `system.grid.content_width` 1200–1280px |
| `check_contrast` (2018) | `_modes()` (7081) → `TOKENS.json color.modes.<mode>.roles` (7092-7099), fallback DNA map `modes`, fallback `system.color.roles`; floors ink≥7, accent_fg≥4.5, ink_muted≥4.5, accent≥3 (2033-2037) |
| `check_type_system` (2075) | `system.type.fonts` ≤2 families vs `rules/T.md` T.4 directory (2050-2068); measure ≤65ch |
| `check_tailwind_derivation` (2096) | `site/tailwind.config.{js,mjs,cjs}` must contain `colors:`, `fontSize:`, `borderRadius:`, `spacing:` (2099-2108); every hex in `TOKENS.json color|colors` must appear in the config (2109-2129) |
| `check_tile_is_system` (2203) | `preview/system.html` preferred; else `site/src/pages/system.astro` (2211-2217); HTML tile needs `data-comp="..."`/`data-cell="..."` specimens for every `src/components/*.astro` minus `Section` (2218-2245); Astro tile needs imports + `<Comp>` renders (2246-2257) |
| `check_neutral_tint` (7667) | `system.color.roles.{name}.value` OKLCH-C bands (7680-7702) |
| `check_proximity` (7706) | `system.space.group_gap_vs_section_gap` ≥2× (7709-7734) |
| `check_border_widths` (7738) | all `site/src/**/*.{astro,css,html}` — border widths ∈ {0,1,2}px |
| `check_reduced_motion` (7756) | `prefers-reduced-motion` somewhere in `site/src/**/*.css` |
| `check_dark_mode` (7127) | modes light+dark, MODE_ROLES parity (6565, 7138-7142), dark bg L≤0.24 (7149-7152); `tailwind.config` `darkMode:'class'|'selector'` (7155-7158); `.dark{` or `[data-theme="dark"]{` in `global.css` (7160-7162); `data-theme-toggle` in `site/src/pages/system.astro` + built pages (7163-7170) |
| `check_dark_toggle` (7174) | every built page + `preview/system.html`/`variants.html`: `data-theme-toggle`, inline head script, `prefers-color-scheme`, `localStorage` (7185-7197) |
| `check_token_layer` (2132) | `global.css` must contain all five: `@theme {`, `:root {`, `.dark {`, `@theme inline {`, `@custom-variant dark` (2143-2153); every `--bg-*|text-*|border-*|action-*|shadow-*` in `:root` mirrored in `.dark` (2156-2167); no literal hex in color props, no `--primitive-` in `site/src/{components,pages,dist}` (2170-2200) |
| `check_sop_constants` (9966) | `SOP-CONSTANTS.json` {dataset: 'sop-adherence.json', verdicts{…}} (9974-10000) vs `patterns/data/sop-adherence.json` (9945) |
| `check_three_layers` (10008) | `preview/variants.html` `data-tl-layer`/`data-dna-fit`/`data-candidate`/`data-seed-chain` attrs (10020-10051) |
| `check_dna` (6765) | `DNA.json` required fields `version,site,vertical_profile,genotype,knobs,provenance,vector_targets,invariants` + `modes,variants` ≥w4 + `rhythm` ≥w5 (6779-6790); `hashes.{core,structure,variants}` == recomputed slices (6791-6800); every `knobs.json` key present + provenance-tagged + in-range (6831-6864); `TOKENS.json knobs` ⊆ DNA knobs (6917-6929) |
| `check_dna_fresh` (6933) | contracts `dna_hash`==core, `structure_hash`==structure (6949-6963); section frontmatter `dna_hash:` required ≥w6 (6966-6972), `structure_hash:` (6973-6976); GATES.json recorded slices (6977-6993) |
| `check_checklist` (541) | `CHECKLIST/<wave>.md` exists, no blank evidence cells (526-539) |
| `check_context_budget` (10359) | `context_pack.assemble_pack` token count ≤ budget |

### W6 check set (gate.py:11753-11759)

`check_components_exist, check_tile_is_system, check_class_subset,
check_no_stray_styles, check_no_emoji, check_icon_discipline,
check_lucide, check_section_shell, check_acss_conventions,
check_content_width, check_section_allowed, check_section_gates,
check_exemplars, check_astro_build, check_token_layer` + appends.
Recorded inputs: `DESIGN-PLAN.md, COMPONENTS.md,
site/src/pages/system.astro` (11832-11833).

| Check | Reads |
|---|---|
| `check_components_exist` (5493) | `site/src/components/*.astro` non-empty; every plan `composition` has `<comp>.astro` (variants `-`/`_`/none) (5499-5508); `COMPONENTS.md` exists and names each composition (5509-5516) |
| `check_section_shell` (6238) | `site/src/components/sections/*.astro` must exist (6241-6244); per file: no `class:list`/`class={`, no `<section>`, no `<style>` (6251-6260); every element (instance) or root element (imported comp) — no class matching `OUTER_SPACING`/`OUTER_EXACT` (`^(m\|p\|space-)\|bg-\|max-w-\|mx-auto\|container\|min-h-screen`, 6092-6095, 6266-6278); frontmatter `exemplar:` required (6279-6281); the instance must render `<Camel(comp) />` for each `+`-joined plan `composition` when `site/src/components/<comp>.astro` exists (6284-6299) |
| `check_section_allowed` (6303) | every `class="…"` in sections ⊆ `@layer components` classes (5519-5523) ∪ `TAIL_UTIL` regex (5525-5558); no raw hex, `rgb|hsl|oklch|lab(`, `class="…[…"` (6306-6317) |
| `check_section_gates` (6321) | `sections/<nn>-<sec>.gate.json` exists per contract; `section_failures()` recomputed clean; recorded `pass:true` (6324-6346) |
| `check_exemplars` (6350) | `templates/sections/<comp>/` dir with ≥1 `.astro` for every used composition (6353-6360); every section's `exemplar:` frontmatter ∈ used compositions (6361-6368) |
| `check_acss_conventions` (4891) | all `site/src/**/*.css`: `text-wrap` + `--text-wrap-*` tokens (4913-4919), margin reset on h/p/list (4922-4927), `* + *`/`.flow` sibling rule (4928-4931), `--input-*` if inputs styled (4933-4936), `object-fit` (4938-4942), no `rgba(`/`rgb(…/…)`/`#xxxxxxxx` (4951-4956), no `min-height` except hero/btn/touch (4957-4966) |
| `check_class_subset` (5571) | every class on built pages ⊆ layer ∪ TAIL_UTIL |
| `check_no_stray_styles` (5581) | `site/src/**/*.{astro,html}` — no `<style`, no `#[0-9a-f]{3,8}`, no `\d+px`, no `style=""` except aspect-ratio (5591-5603); built pages: no `<style>`, no `style=""`, no `#hex6` outside `:root` (5606-5623) |
| `check_astro_build` (680) | `npm run build` exit 0 in `site/` (685-690) |
| `check_icon_discipline`/`check_lucide` (772, 841) | icon class/size/stroke closed sets in sources+pages |

### W7 check set (gate.py:11760-11798 + 11811-11819)

Core: `check_assembly, check_spec_verbatim, check_page_data_attrs,
check_heading_verbatim` + ~45 page/dist/segment checks.
`ctx.page_htmls()` (483-514): reads `site/dist/**/<slug>.html` or
`preview/` — only plan slugs (`system|variants|404|500` excluded).
So W7 requires `astro build` to have produced `site/dist/`.

| Check | Reads |
|---|---|
| `check_assembly` (6426) | `site/src/pages/<slug>.astro` must byte-equal `assemble_page()` output incl. `// assembled: <sha256(contracts)[:12]>` marker (6395-6452) |
| `check_spec_verbatim` (5456) | `PAGES/<slug>/SPEC.md` yaml `sections:` block must json-normalize equal to plan rows (5459-5490) |
| `check_page_data_attrs` (5626) | built page `<section>` `data-sec/comp/ratio/disclosure` == chosen card's locked sections, 1:1 in order (5644-5669) |
| `check_heading_verbatim` (5724) | STUB `## Heading vector` table headings + `fs` rendered verbatim in order (5727-5767) |
| `check_tile_page_parity` (5673) | every class on built pages ⊆ classes named on `system.astro`/`Section.astro`/`global.css`; every `data-comp` on page has a `data-comp` on tile (5678-5714) |
| `check_rhythm_render` (11036) | rendered contrast-moment class, ≥2 density classes, ≤2 consecutive same `data-comp` |
| `check_block_trace` (10717) | `site/dist/home/index.html` or `src/pages/home.astro` only: every `data-sec` element carries `data-recipe="<harvest id>"` resolving in the skeleton topo index + `data-seam`/`data-seam-shape-*` echoing the recipe's topo (10732-10836); REVIEW.json `blocks[]` |
| `check_skeleton` (3691) | plan rows citing `skeleton:` must name harvest ids |
| SEGMENT_ALL (5800-5933) | built pages: block roles, chrome edges, ≥80% main share, media alt, footer rules, main-before-chrome |

### The SB.1 contract schema (gate.py:6122-6194)

`build_contracts(ctx)` emits `schema:'section-contract/v1'` (6089) with
fields: `dna_hash, structure_hash, dna{profile,genotype,knobs,rhythm},
page, index, section, file, component, wf_ref, composition, archetype
(COMP_ARCHETYPE 6075-6088), speech_act, category, surface, density,
emphasis, align, stack, collapse, media_ratio, disclosure,
content{heading,fs,body,h1} (STUB-sourced via `_stub_for` 6111),
neighbours{prev,next}, allowed{classes, classes_snapshot,
utilities, attributes}, rules (≤8 enforcement ids w5-w7, 6187-6189),
patterns, exemplar` (`templates/sections/<comp>/<Camel>.astro`, 6191).

`check_section_contracts` (6197-6227) verifies presence+scalar equality
of `section,index,wf_ref,composition,surface,density,media_ratio,
disclosure,content,neighbours,allowed,rules,exemplar` — `dna_hash`,
`structure_hash`, `dna`, `archetype`, `patterns`, `component` are
written but **not** verified (freshness of the two hashes is covered
by `check_dna_fresh` 6949-6963 instead). `content.heading` is checked
against the STUB separately (6223-6226).

Producer: `cmd_contracts` (6515-6527) — `gate.py contracts <dir>`
writes `sections/<nn>-<sec>.contract.json`.
Fixture: `tools/design-gate/fixtures/_base/sections/01-hero.contract.json`
(full generated example, written by `gate.cmd_contracts` at
gen_fixtures.py:1520).

### Expected file layout (as evidenced by fixtures/_base)

```
<pipeline>/
  DESIGN-PLAN.md  STUB.md  DNA.json  DNA.md  TOKENS.json
  COMPONENTS.md   CANDIDATES.json  MOBBIN-REFS.md  GATES.json
  SOP-CONSTANTS.json  PREBUILD.json  REVIEW.json
  sections/<nn>-<sec>.contract.json + .gate.json
  CHECKLIST/w<n>.md
  PAGES/<slug>/SPEC.md
  preview/{candidates,layouts,variants,fine,system}.html
  cards/index.html            (wireframe option cards)
  site/{package.json, astro.config.mjs, tailwind.config.*}
    src/styles/global.css     (5 token layers + @layer components)
    src/components/Section.astro          (shell)
    src/components/<comp>.astro           (composition skeleton)
    src/components/sections/<Sec>.astro   (instance)
    src/pages/<slug>.astro + system.astro
    dist/<slug>/index.html
```

Shell contract (`templates/sections/Section.astro`): props
`sec,comp,wf-ref,ratio,disclosure,surface,density`; emits
`<section class="sec-band" data-sec data-comp data-ratio data-disclosure
data-surface data-density data-wf-ref><div class="sec-inner"><slot/>`.
`assemble_page` invokes it identically (gate.py:6413-6419).
`.sec-band`/`.sec-inner`/`[data-surface]`/`[data-density]` live in
`templates/astro/src/styles/global.css:151-182` — the starter already
ships them, but the starter has **no `Section.astro`**
(`templates/astro/src/components/` = Footer, Header, JsonLd, MobileCTA,
SEOHead, SocialLinks only).

---

## 2. WHAT the machinery PRODUCES today

| Artifact | Producer | Status |
|---|---|---|
| `sections/*.contract.json` | `gate.py contracts` → `cmd_contracts` (6515) | **exists** |
| `sections/*.gate.json` | `gate.py section` → `cmd_section` (6530-6555) | **exists** |
| `preview/layouts.html` | `assemble.py --layouts` → `gate.assemble_layouts` (2329-2424) — composition **rotation pools hardcoded at 2340-2345**, bank not consulted | exists |
| `preview/variants.html` | `assemble.py --variants` → `gate.assemble_variants` (7411-7636) — mock sections from contracts + knob vars | exists |
| `preview/candidates.html` | `gate.assemble_candidates` (3614-3688) | exists |
| `site/src/pages/<slug>.astro` | `assemble.py` → `gate.assemble_page` (6395-6423) + `PAGES/<slug>/SPEC.md` (assemble.py:52-55, `assemble_spec` 6377) | exists |
| `DNA.md` | `gate.py dna` (7044-7051) | exists |
| `DNA.json` hashes update | `gate.lock_dna_map` (8024-8037), `migrate_approvals`, selftest | exists (writer of the file itself is W1 SOP/model per stage-w1 CARD + DNA-MAP.md table) |
| `GATES.json`, receipts, approvals | `gate.write_gate` (8250), `write_receipt` (8159), `run.py approve`/`approve_service.py` | exists |
| `ENFORCEMENT.md` | `gate.py enforcement` (11678-11711) | exists |
| `SCORECARD.{json,md}` | `gate.py score` (11200-11222) | exists |
| `templates/sections/<comp>/<Camel>.astro` gold exemplars | `exemplars.py` (338-346) — 23 dirs, one per `COMP_FOR_ACT` key; e.g. `templates/sections/split-media/SplitMedia.astro` | exists |
| Astro starter | `cp -R templates/astro <pipeline>/site` — W0 CARD line 30 | exists (manual `cp`, no script) |
| `preview/system.html` exemplar | `templates/system-tile/index.html` (`cp` + rebind, per its README) | exemplar only |
| `.contract.json`, `.gate.json`, `index.astro`, `.astro` components, `dist/` | `gen_fixtures.py` BASE constants + `gate.cmd_contracts/cmd_section/assemble_page` (gen_fixtures.py:1500-1536) | **fixtures only** |

### Emit-to-.astro does NOT exist

No file outside `gen_fixtures.py` writes `.astro` into a pipeline:
`grep "open(.*'w'"` over gate.py shows writes only for contracts,
gate.json, DNA.{json,md}, GATES.json, approvals, receipts, scorecard,
enforcement, findings, ENFORCEMENT.md, selftest dirs (6521-11710
list, §above). `assemble.py` writes only `src/pages/*.astro` +
`PAGES/*/SPEC.md` + preview HTML. The W6 CARD
(stage-w6-components/CARD.md:31-44) assigns both `.astro` layers to a
**builder agent** ("one builder per section… returns
`src/components/sections/<Sec>.astro`"), so the gap is by design an
agent task — but there is **no canonical producer, no exemplar-adapter
script, and no verified precedent** that an agent ever completed it:
the only pipeline-shaped tree in the repo is
`tools/design-gate/fixtures/`, generated by `gen_fixtures.py:1498-1536`.
`sites/lavisha`/`sites/whistleclean` are the **older intake lane**
(`site/design-dna/` shape per `docs/machinery/DESIGN-INTAKE.md:234`);
their `TOKENS.json` is the `site-intake-tokens@1`
`{value,why,use,ban}` schema, not the gate's `{knobs, color:{modes}}`
— they cannot feed the gate chain.

### TOKENS.json producer — partially exists, wrong shape

- `dna_tokens.derive()` (dna_tokens.py:380-401) returns
  `{profile, genotype, knobs, vars, modes{light,dark}, layout, seam,
  copy, cta…}` — `modes` roles match `MODE_ROLES`, but the record is
  `{knobs, vars, modes}`, **not** the gate's `TOKENS.json` shape
  `{knobs, color:{modes:{light:{roles},dark:{roles}},roles}}` evidenced
  by `fixtures/_base/TOKENS.json` (written as a constant at
  gen_fixtures.py:302-313). Nothing calls `dna_tokens` for a pipeline
  (only proof/run_proof10.py:155,459).
- `emit_tokens.py` (93-184): `TOKENS.json → stdout` emits the five TK
  layers — `@theme` primitives → `:root` semantics → `.dark` →
  `@theme inline` → `@custom-variant dark`. It emits **no
  `@layer components` block, no `.sec-band`, no `[data-surface]`, no
  `prefers-reduced-motion`, no `--text-wrap`, no `--input-*`** — i.e.
  it cannot replace `global.css` whole; a merge/caller is absent.
- `tailwind.config.*` producer: **none** (only the constant inside
  gen_fixtures.py:270). `check_tailwind_derivation` (2096) requires
  `colors/fontSize/borderRadius/spacing` + all TOKENS hexes.

### Retrieval → composition: disconnected

`retrieval.retrieve_section()` (438-476) returns `topology_id` from the
12,175-row section bank (`patterns/data/section-bank/index.json`;
row fields: `section_type, style_tags, topo.topology_id, vibe`).
Bank `composition` is `null` in **every** row (verified over
index.json). Bank `topology_id` vocab = 18 values
(`nav-top-bar`, `hero-media-right`, `grid-3col-uniform`, `split-50-50`,
`list-vertical-rows`, `band-media`, …) — **no mapping to the 23
catalog compositions exists anywhere** (the deleted `EMITTERS` dict
was the only consumer of this vocab). `retrieve_section` has **zero
callers** after ba8b94f9. Bank `section_type` vocab
(`content, nav, hero, footer, grids-and-cards, call-to-action…`)
also doesn't match the catalog `category` slugs 1:1.

`adapt.adapt()` (adapt.py:162-225) binds a dna record onto a
**render-vectors skeleton payload** (`templates/skeletons/<kit>`,
`row.render_path`/`recipe_id`) and returns `preview_html` for the
proof picker — it produces HTML snippets for `proof/run_proof10.py`,
never `.astro`, and consumes `retrieval.Bank`, not `SectionBank`.

---

## 3. What the DELETED path did

`git show ba8b94f9^:<file>`:

- **`tools/design-gate/section_emit.py`** — ~30 emitter functions,
  `EMITTERS: {topology_id → fn}` (~35 keys incl. aliases), `DEFAULTS`
  section_type→topo, `emit(topology_or_type, dna, vibe)` → **HTML
  string**. Var-bound via TW4 semantic classes (`bg-brand`,
  `text-heading`, `border-default`, `rounded-base`,
  `bg-neutral-primary(-soft)`) + `py-[var(--section-py)]`,
  `gap-[var(--gap)]`, `max-w-[var(--space-container)]` arbitrary-value
  classes — the shape SB.3/OUTER_SPACING now rejects.
- **`patterns/tools/theme_vibes.py`** — `theme_sheet(vibe, scope)` →
  CSS var overrides (`--color-brand`, `--color-heading`,
  `--radius-*`, `--font-*`, `--section-py`, `--gap`,
  `--space-container`) scoped per band; 8 hardcoded `VIBES` dicts.
- **`tools/design-gate/preview_sections.py`** — per-vibe standalone
  pages: fixed `SEQUENCE = [nav, hero, feature-grid, pricing,
  call-to-action, footer]`, topology rotated per vibe
  (`section_emit.topologies`), `emit` + `theme_sheet` +
  `picker.render_picker` → `preview/pages/<vibe>.html` +
  `preview/sections.html`.

Responsibility map vs canonical home:

| Deleted responsibility | Canonical status |
|---|---|
| topology_id → structure | **Died.** Nothing maps bank `topo.topology_id` to catalog composition or to `templates/sections/<comp>/`. AGENTS.md:25-28 says retrieval+adapt pick structure; the wiring is absent (see GAP 7) |
| DNA vars → semantic classes | **Replaced, partially.** `dna_tokens.css_vars` (264-310) → `emit_tokens` five layers (93-184) bind DNA→CSS vars; components bind semantic names — but the emit output is a partial file (GAP 4) |
| var binding onto retrieved markup | `adapt.adapt` (162-186) survives, but only emits `preview_html` for the proof picker; no `.astro` path |
| copy injection (h/p/a slots) | `adapt.inject_copy` (86-122) survives — HTML-only, unused by the gate chain |
| preview pages per vibe | `assemble_variants` (7411) replaces it (mock sections, knob-scoped vars) — canonical |
| vibe vocabulary | Replaced by genotype/knobs (`knobs.json`, `dna/*`) — the `VIBES` dict is exactly the "bespoke theme dict" AGENTS.md:44 forbids |
| section ordering | `assemble_page` from plan rows — canonical |

---

## 4. GAPS (numbered, ranked)

**Chain cannot run end-to-end** (blocks `gate.py w6`/`w7` outright):

1. **No `.astro` producer for `src/components/sections/<Sec>.astro`.**
   `check_section_shell` (6241-6244) hard-fails
   "no site/src/components/sections/*.astro". Required shape:
   frontmatter `dna_hash:` (6966-6972), `structure_hash:` (6973-6976),
   `exemplar: <comp>` (6279-6281, 6361-6368); body renders
   `<CamelComp />`, no `<section>`/`<style>`/outer classes.
   Owner per SOP: W6 builder agent
   (stage-w6-components/CARD.md:38-47) — no script/spec exists that
   adapts `templates/sections/<comp>/<Camel>.astro` → instance.
   Fixture evidence: `fixtures/_base/site/src/components/sections/
   Hero.astro` (`dna_hash/structure_hash/exemplar` + `<SplitMedia />`).

2. **No `.astro` producer for `src/components/<comp>.astro`
   (composition skeleton).** `check_components_exist` (5493-5508)
   fails without it; `check_tile_is_system` (2218-2257) needs it
   rendered on the tile. Same owner (W6 CARD job 1, lines 31-36);
   `COMPONENTS.md` map also unproduced (5509-5516).

3. **No TOKENS.json emitter at pipeline root.** `check_dna`
   (6917-6929) and `_modes` (7086-7100) read `knobs` +
   `color.modes.{light,dark}.roles`; `dna_tokens.derive` output is a
   different record (`vars`/`modes`, no `color.modes` nesting).
   Candidate owner: `dna_tokens.py` + a `TOKENS.json` writer
   (`dna_tokens.dna_json` 404-415 emits DNA.json shape, not TOKENS).

4. **No tailwind.config generator and `emit_tokens` output is a
   partial global.css.** `check_tailwind_derivation` (2099-2129)
   needs `site/tailwind.config.*` with theme keys + every TOKENS hex;
   `check_token_layer` needs the five layers **and**
   `check_acss_conventions`/`check_scaffold`/`_layer_classes` need
   `@layer components`, `.sec-band`, `[data-surface]`,
   `prefers-reduced-motion`, `--text-wrap`, `--input-*`,
   `object-fit`, `*+*`/`.flow` — all present in
   `templates/astro/src/styles/global.css` but absent from
   `emit_tokens.emit()` (93-184). Missing: a merge step
   (token layers ↔ component layer) + config emitter.
   Evidence the step was intended but never scripted:
   `templates/astro/tailwind.config.mjs` header comment — "The S5
   build lane REGENERATES this file's theme from … TOKENS.json" —
   and the starter config has no `darkMode` key (`check_dark_mode`
   7155-7158 fails) and its colors are `var(--c-*)` references while
   `check_tailwind_derivation` (2117-2125) requires the TOKENS hexes
   themselves. Exemplar classes `mt-stack`, `gap-stack`,
   `btn-primary`, `card-grid`, `skip-link`, `burger` are likewise
   absent from the starter layer — W6 CARD:33 "extend `global.css`
   `@layer components` with its classes" is the named owner, i.e.
   builder/agent work with no fixture-free precedent.
   Candidate owner: extend `emit_tokens.py` or a new sibling script.

5. **No `Section.astro` instantiation step.** The starter
   (`templates/astro/src/components/`) lacks it;
   `templates/sections/Section.astro` is the exemplar;
   `assemble_page` emits `<Section …>` unconditionally (6405).
   `check_astro_build` fails on the missing import. Owner: W0
   scaffold or W5/W6 copy step (none names it —
   stage-w0-scaffold/CARD.md:30-41, stage-w6 CARD).

6. **`preview/system.html` / `site/src/pages/system.astro`
   producer.** `check_tile_is_system` (2211-2217) fails W5 without
   either; `check_tile_page_parity` (5678-5681) fails W7 without
   `system.astro`; `check_dark_mode` needs `data-theme-toggle` on it
   (7163-7170). `templates/system-tile/index.html` is a copy-and-rebind
   exemplar; per CARDs this is designer/agent work — no generator.

7. **`topology_id`/`composition` → exemplar mapping missing — the
   retrieval layer is orphaned.** `retrieve_section` (438-476)
   returns bank `topology_id`; `SectionBank` docs (369-373, edited at
   ba8b94f9) promise "the winning topology_id selects the exemplar
   composition" — no such map exists (bank `composition` field is
   null repo-wide; `EMITTERS` deleted). Where it must land:
   `patterns[]` in the contract (6190 writes `pattern-<comp>`),
   plan rows' `refs`, and `check_block_trace`'s `data-recipe`
   (10744-10753) which requires skeleton-harvest ids
   (`brixies/…/*.topo`) on rendered sections. `assemble_page`
   doesn't emit `data-recipe`/`data-seam` (6413-6419) and
   `Section.astro` has no such props — so J.4 is unreachable even if
   components are built.

8. **Orchestration step order.** `run.py` (139-182) invokes only
   `gate.py <wave>`; nothing runs `gate.py contracts` /
   `gate.py section` / `assemble.py` between waves. `check_section_
   contracts` runs at **w3** (11733) and fails
   "`run gate.py contracts`" (6207) — so the operator/agent must
   interleave producer commands; no runner encodes the sequence.

**Produces-but-fails** (chain would run, gate would reject):

9. **`ASSEMBLED.md` receipt entry has no producer** — `ARTIFACTS['w7']`
   (8154) lists `SPEC.md, ASSEMBLED.md`; nothing writes it (it only
   matters if the file exists — dead list entry, evidence of an
   intended artifact).

10. **Plan-side producers are SOP/model-only**: `DESIGN-PLAN.md`,
    `STUB.md`, `MOBBIN-REFS.md`, `CANDIDATES.json`,
    `SOP-CONSTANTS.json`, `PREBUILD.json`, `REVIEW.json`,
    `CHECKLIST/*.md` are consumed (§1) but generated by no script —
    expected per AGENTS.md (SOPs first), but unautomated.

11. **Starter/gate drift candidates**: `check_dark_mode` requires
    `darkMode:'class'|'selector'` in tailwind.config (7155-7158) and
    `.dark{` in global.css (7160-7162); `check_no_stray_styles` bans
    `\d+px` anywhere in `site/src` (5597) — `templates/astro` starter
    must be audited against these before first real run (unverified
    here beyond the files cited).

## 5. WHAT EXISTS

- `gate.py` w0–w8 + subcommands `contracts|section|dna|score|segment|
  wildcard|enforcement|receipt|findings|redteam|round` (main 9646-9708).
- `run.py` orchestrator: ORDER enforcement, DM.6 DNA-slice staleness
  reset, nonce/approve/sign-review (run.py:99-182).
- Producers: `cmd_contracts` (6515), `cmd_section` (6530),
  `assemble_page/spec/layouts/variants/candidates` (6377/2329/7411/3614),
  `cmd_dna`→`DNA.md` (7044), `exemplars.py`→23 gold exemplars,
  `emit_tokens.py`→five-layer CSS on stdout, `dna_tokens.py`→derived
  DNA record (genotype→knobs→vars→modes) + `dna_json`,
  `patterns.py search/lookup` (pattern ids w/ `composition` field —
  the *catalog*-vocab evidence layer, patterns.py:566-577),
  `retrieval.{Bank,SectionBank}` + `retrieve`/`retrieve_section`,
  `adapt.adapt`/`inject_copy`/`adapt_sheet` (proof-picker HTML only),
  `context_pack.assemble_pack` (bounded builder packet),
  `approve_service` (nonce ledger + picker endpoints),
  `gen_fixtures.py` (the only end-to-end proof the chain assembles —
  fixture-only).
- Gate-verified contracts: `fixtures/_base` is a complete passing
  example of the target layout (contracts, gates, sections, comp
  components, assembled page, system tile, dist).
- Section bank: 12,175 CLIP rows w/ `section_type`, `topo.topology_id`
  (18 ids), `style_tags`, `vibe` — retrieval-ready, unwired.

**Bottom line:** the emit-to-`.astro` step was **never implemented** —
the deleted emitters produced ad-hoc preview HTML (un-gated, wrong
shape for SB.2/SB.3), not pipeline components. The canonical chain's
produce side is `gate.py contracts` → builder-agent adaptation of gold
exemplars → `assemble.py`; the middle step has a contract, a gate,
exemplars, and a bounded-context packet, but no producer and no
`topology_id → composition` bridge to make retrieval the structure
picker AGENTS.md claims it is.
