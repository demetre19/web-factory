# EMIT-CHAIN-AUDIT REVIEW — adversarial verification

Method: every load-bearing claim re-derived from the working tree
(gate.py 11,850 ln), `git log`/`git show` for history claims, and
direct JSON inspection of the two banks. Audit line cites were
checked, not trusted. Verdicts: VERIFIED / REFUTED / PARTIAL.

## Per-claim verdicts

### Claim 1 — "Emit-to-.astro was NEVER implemented (only gen_fixtures.py writes .astro)"
**VERIFIED**, with two precision corrections the audit itself should
have made.

- Sweep for writers: `open(…,'w')`/`shutil`/template-copy hits across
  `tools/`, `patterns/tools/`, `docs/`, `skills/`, `tests/` show
  `.astro` writes in exactly three places —
  `tools/design-gate/gen_fixtures.py` (fixture tree + constants),
  `tools/design-gate/exemplars.py:338-346` (writes
  `templates/sections/<comp>/<Camel>.astro`, a repo template dir, not
  a pipeline), and `assemble.py:47-50` (`site/src/pages/<slug>.astro`
  + `PAGES/<slug>/SPEC.md` only — assemble.py:32-55). No producer
  anywhere writes `site/src/components/**/*.astro`.
- `git show ba8b94f9 --stat` confirms exactly three deleted files
  (`section_emit.py` 355 ln, `theme_vibes.py` 149 ln,
  `preview_sections.py` 116 ln) + comment-only retrieval.py edit +
  AGENTS.md; `design_gate.py`/`acss_base.py`/`vibe_emit.py`/`preview/`
  never existed (`git log --all --` empty).
- Deleted code verified as preview-HTML, not pipeline components:
  `section_emit.py` returns HTML strings with
  `py-[var(--section-py)]`/`bg-brand`-class var binding
  (`git show ba8b94f9^:…/section_emit.py` head); `preview_sections.py`
  wrote `preview/pages/<vibe>.html` standalone pages
  (`ba8b94f9^:preview_sections.py:40-65`). Nothing canonical died.
- CORRECTION: `sites/lavisha`/`sites/whistleclean` contain **zero**
  `.astro` files (`find sites -name '*.astro'` → none); lavisha
  TOKENS.json is `site-intake-tokens@1` (`{value,why,use,ban}` keys),
  confirmed incompatible. The audit's claim here is right, and
  `fixtures/` is genuinely the only gate-layout tree in the repo.
- CORRECTION (material): `assemble_page` output is a **bare fragment**
  (no document shell; see MISSED MACHINERY #1, a gap larger than
  anything in the audit's §4).

### Claim 2 — Retrieval orphaned; bank `composition` null in all rows
**PARTIAL — the conclusion stands, but three load-bearing facts are
wrong or understated.**

- VERIFIED: `retrieve_section` has **zero callers** — full-repo grep
  (all `.py`/`.md`/`.sh`, excluding venv) hits only
  `retrieval.py:438` (the def) and the audit doc itself. `SectionBank`
  is instantiated **nowhere**. Only `retrieval.retrieve` is called —
  `proof/run_proof10.py:531`, on the *other* bank class (`Bank`).
  Sharper still: at `ba8b94f9^`, `git grep retrieve_section` shows it
  had **no callers even before the deletion** — the deleted
  `preview_sections.py` built `retrieval.SectionBank()` but picked
  topologies by `section_emit.topologies()` rotation, not by
  `retrieve_section` (`ba8b94f9^:preview_sections.py:46-52,70`). The
  function was dead on arrival, not orphaned by ba8b94f9.
- REFUTED (fact): bank `composition` is null in all 12,175 rows —
  true at top level — **but every row carries
  `style_tags.composition` populated** (only 23/12,175 null) with a
  19-value vocab (`split-left-media` 3,727, `centered` 3,001,
  `grid-uniform` 1,396, `stacked` 1,263, `other` 1,010,
  `full-bleed` 719, `column-2` 301, `split-right-media` 201, …).
  The audit's "composition field null repo-wide" is literally right
  and materially misleading: a populated composition-ish tag exists;
  it's a different taxonomy that still doesn't map to the 23
  catalog slugs.
- REFUTED (fact): "`topo.topology_id` (18 ids)" — **19** distinct
  ids, and only **1,979/12,175 rows carry one** (10,196 rows have no
  `topology_id` at all). The bank is 84% topology-less — a much worse
  foundation for "retrieval picks structure" than the audit stated,
  and `retrieve_section` would return `topology_id: None` for most
  crops.
- VERIFIED: no `topology_id → composition` map exists anywhere
  (grep over tools/patterns/docs — nothing maps `split-50-50`,
  `grid-3col-uniform`, etc. to `split-media`, `cards-n`, …).
- VERIFIED: `patterns.py` index `meta.json` **does** carry
  catalog-vocab `composition` per pattern (78 patterns; vocab ⊆
  COMP_FOR_ACT keys: editorial, cards-n, stacked-hero, …). This is a
  *different* evidence layer (Mobbin-mined patterns) and the only
  live composition-vocab data source — the audit listed it but
  under-played it: the natural bridge is `pattern.composition`,
  not the section bank.

### Claim 3 — `dna_tokens.derive` ≠ gate's TOKENS.json shape
**VERIFIED, with one overstatement corrected.**

- `dna_tokens._finish` (dna_tokens.py:331-359) returns
  `{profile, genotype, knobs, vars, modes:{light,dark}, layout, …}`
  — top-level `modes`, **no `color` key**. The gate's TOKENS.json
  shape is `{knobs, color:{modes:{light:{roles:…},dark:{roles:…}},
  roles:…}}` (fixtures/_base/TOKENS.json). `check_tailwind_derivation`
  (gate.py:2116-2128) walks `tj.get('color') or tj.get('colors')` —
  derive's output supplies nothing; and `check_dna` (6917-6929) needs
  `knobs` ⊆ DNA map. So no TOKENS.json producer exists: VERIFIED.
- OVERSTATED: the audit implies `_modes` (7081-7113) requires
  TOKENS.json. It does not — it falls back to `dna_map(ctx).modes`
  (7092-7100), and `dna_tokens.dna_json` (404-415) **already emits
  exactly the DNA.json modes shape** (`{version, site,
  vertical_profile, genotype, knobs, modes, provenance}`). The
  contrast/dark-mode mode-data path is serviceable by existing code;
  the missing artifact is only the TOKENS.json *file* (needed by
  check_tailwind_derivation + check_dna knob audit), not the mode
  data itself.
- VERIFIED: nothing calls `dna_tokens` for a pipeline (callers:
  `proof/run_proof10.py`, `gen_fixtures.py`, self-test only).

### Claim 4 — `emit_tokens` lacks @layer components/.sec-band/[data-surface]/reduced-motion
**VERIFIED — and the audit under-counted what the starter can't
satisfy.**

- `emit()` (emit_tokens.py:93-184) emits exactly the five TK layers:
  `@theme` primitives → `:root` semantics → `.dark` → `@theme inline`
  → `@custom-variant dark`. No `@layer components`, `.sec-band`,
  `[data-surface]`, `prefers-reduced-motion`, `--text-wrap`,
  `--input-*`. Confirmed by reading the body.
- CORRECTION (audit missed): the **merge recipe exists — in fixtures
  only**: `gen_fixtures.py:1028-1036` (`_global_css`) calls
  `emit_tokens.emit()` and appends `GLOBAL_CSS_TAIL`
  (gen_fixtures.py:217+) carrying `.sec-band`, `.sec-inner`,
  `prefers-reduced-motion`, `.flow`, `--input-*`. The intended
  composition order is documented in code — as fixture scaffolding,
  not a pipeline command. "A merge/caller is absent" is right; "the
  step was never scripted" is one step too strong.
- MISSED BY AUDIT: starter `global.css` (templates/astro/…/global.css,
  208 ln) contains **none** of the five TK layers — no `@theme`, no
  `.dark`, no `@custom-variant` (grep confirms). So `check_token_layer`
  (TK.1, gate.py:2143-2153) fails on the raw scaffold, and the
  scaffold's component-layer half can't satisfy TK.1 either. The gap
  is bidirectional, not just "emit_tokens is partial".
- VERIFIED: `templates/astro/tailwind.config.mjs` has `colors:`/
  `fontSize:`/`borderRadius:`/`spacing:` keys but values are
  `var(--c-*)` references — `check_tailwind_derivation` (2117-2125)
  requires the TOKENS hexes verbatim → fails; no `darkMode:` key →
  `check_dark_mode` (7155-7158) fails; no `.dark{` in starter CSS →
  7160-7162 fails. The config's own header comment admits the S5 lane
  regenerates it. No config generator exists anywhere.

### Claim 5 — No Section.astro instantiation; ASSEMBLED.md dead
**VERIFIED.**

- `templates/astro/src/components/` = Footer, Header, JsonLd,
  MobileCTA, SEOHead, SocialLinks only. `assemble_page` emits
  `import Section from '../components/Section.astro'` unconditionally
  (gate.py:6405) → `astro build` fails on a real pipeline. Fixture
  evidence is the only Section.astro in a site/ tree
  (fixtures/_base/site/src/components/Section.astro).
- `ASSEMBLED.md`: only reference in the entire repo is
  `ARTIFACTS['w7']` (gate.py:8154) — no writer, no doc mention, no
  fixture file. Dead list entry: VERIFIED.

### Claim 6 — check_block_trace's data-recipe is unreachable
**VERIFIED — and it's one of two un-emittable contracts (the audit
found one; a sibling exists, see MISSED #4).**

- `check_block_trace` (10717-10803) reads only
  `site/dist/home/index.html` or `site/src/pages/home.astro`;
  every `<section|nav data-sec>` element must carry
  `data-recipe="<harvest id>"` resolving in `_skl_harvest_ids()`
  (templates/skeletons/**.json ids) + `data-seam`/`data-seam-shape-*`
  echoes, plus a `REVIEW.json blocks[]` row.
- `assemble_page` (6405-6419) passes props
  `sec/comp/wf-ref/ratio/disclosure/surface/density` — no recipe.
  `templates/sections/Section.astro` has no recipe/seam props and
  emits no such attrs. `check_assembly` byte-locks the page to
  assemble_page output (6426-6452), so a builder **cannot** add the
  attributes without failing SB.4. Unreachable under `home` slug:
  confirmed. (Vacuous for non-`home` slugs and zero data-sec tags.)
- Fixture evidence: dist/home/index.html `data-recipe` values
  (gen_fixtures.py:329-353) are hand-authored constants that could
  never come from building `fixtures/_base/src/pages/home.astro`
  (verbatim assemble_page output, no recipe attrs).
- Nuance: `check_prebuild_receipt` (J.3, 10660-10710) **does** let a
  `recipe_exception` bypass bank resolution — J.3 is escapable, J.4
  on the rendered block is not.

### Claim 7 — W6 builder step is agent-driven (audit got this right)
**VERIFIED — correctly treated as agent-by-design, not a miscounted
producer.**

- `stage-w6-components/CARD.md` job 2: "One builder per **section**…
  returns `src/components/sections/<Sec>.astro`";
  `SECTION-BUILD.md` §2/§4/§7 prescribes contract + CARD + tokens +
  exemplar per builder — few-shot by code, not script. `context_pack`
  (`per-section-build`/`per-component` budget classes) is the
  machinery that feeds that agent. "No canonical producer" is *by
  design*; what's genuinely missing is any verified precedent that an
  agent completed it outside fixtures.

## MISSED MACHINERY / MISSED GAPS

1. **The page document shell is un-producible — bigger than J.4.**
   `assemble_page` emits only `<Section>` fragments (gate.py:6413-6419)
   and `check_assembly` byte-locks the file. Nothing — not the shell
   component, not a layout — can add `<html><head>`: Section.astro
   emits `<section>` and a child can't own the document. Yet
   `check_dark_toggle` (7174-7197) requires an inline `<head>` script
   + `data-theme-toggle` + `prefers-color-scheme` on **every built
   page**; `check_viewport` (5770) requires `name="viewport"`;
   `check_meta`/`check_landmarks`/`check_seo_lint` read the same
   `page_htmls()`. `check_dark_toggle` even reads
   `site/src/layouts/BaseLayout.astro` (7183) as a localStorage
   fallback — evidence a layout was *intended* — but byte-lock
   forbids importing one. The fixture's dist/home/index.html `<head>`
   is a hand-authored constant unreachable by `npm run build` of the
   fixture's own src. **Every built-page check needing
   head/toggle/meta/viewport is unreachable, on any slug** — a
   release-blocker absent from the audit's §4.
2. **No producer for `preview/fine.html` (P.18, hard W4 block).**
   `check_fine_round` (4805-4830) fails if `preview/fine.html` is
   absent; `assemble.py` has no `--fine` flag; only gen_fixtures.py
   writes it. Listed in the "expected layout" but never numbered as a
   missing producer.
3. **`assemble_candidates` has no CLI caller.** Defined (3614-3688),
   called only by gen_fixtures.py:1533. `check_candidate_review`
   (3548-3612) hard-fails on pending CANDIDATES.json URLs without
   `preview/candidates.html` — conditional block the audit missed
   (it listed assemble_candidates as "exists" without checking
   command reachability).
4. **`data-skeleton` is a second un-emittable attr.** `check_skeleton`
   (SKL.1, 3691-3740) requires `data-skeleton="<harvest id>"` on
   rendered sections claiming skeleton provenance; Section.astro/
   assemble_page have no such prop — same byte-lock trap as J.4.
   Plan rows do carry `skeleton:` (context_pack.py:150) and
   `context_pack` ships the skeleton payload to builders — the
   *input* side is wired, the *output* side is not. The audit's GAP7
   sub-claim was right in spirit but attributed it to the wrong
   layer (topology map) rather than the missing prop/threading.
5. **Starter `.astro` components already violate the wave gates.**
   `check_no_stray_styles` (5581-5603) scans `site/src/**/*.astro`:
   `templates/astro/src/components/{Footer,Header,MobileCTA,
   SocialLinks}.astro`, `404.astro`, `layouts/BaseLayout.astro` all
   contain `<style>` blocks → P.2 fails on the freshly-copied
   scaffold; `rgb(0 0 0 / 0.08)` and `48px`/`44px` literals inside
   them trip the P.5 `rgba(`/`\d+px` arms. GAP11 flagged "drift
   candidates (unverified)" — it is verified-fails: **the scaffold
   cannot pass w6 as shipped.**
6. **Stale `templates/astro/dist/` ships a built index.html** —
   `cp -R` installs it; `page_htmls()` (483-514) reads
   `site/dist/<slug>.html` for any plan slug; a plan slug `index`
   gates against the template's prebuilt page. Latent contamination
   vector.
7. **`context_pack` is already the (untested) builder-feed
   machinery** — `assemble_pack` pulls CARD + rule subset + DNA
   surface + section profile + skeleton payload + STUB rows
   (context_pack.py:1-15,156-241). The audit lists it but
   under-weights it: the "builder agent" gap is narrower than "no
   machinery" — the packet exists; only the exemplar→instance
   adaptation is unproven.
8. **`gen_fixtures._global_css` documents the intended merge**
   (emit_tokens output + component-layer tail) — the recipe exists in
   code, unreachable for real pipelines (see Claim 4).
9. **`emit_tokens.py --check` self-verify exists** (main ~line 188)
   — unreferenced anywhere; corroborates the intended-but-unwired
   pattern.

## WRONG GAPS (claimed gaps that aren't, or are misclassified)

- **GAP 7 is two gaps; only one is real and it's different.** The
  topology→composition map absence is real, but it does **not** block
  the chain: composition comes from the plan row (operator layout
  pick, W3; pools hardcoded in `assemble_layouts` 2340-2345) →
  `check_exemplars`/`check_components_exist` run against it fine.
  "Chain cannot run end-to-end" over-classifies it: the chain runs
  without retrieval entirely (AGENTS.md's "vectors pick the
  structure" is aspirational doc, not a gate precondition). The real
  blocker inside GAP7 is the J.4 data-recipe/data-seam emit
  contract — correct diagnosis, wrong taxonomy.
- **GAP 3 sub-claim** ("check_dna and _modes read knobs +
  color.modes") overstates: `_modes` falls back to
  `DNA.json modes`, which `dna_tokens.dna_json` already produces.
  Only `check_tailwind_derivation` (hex walk) and the `check_dna`
  knob-audit arm actually require the TOKENS.json file.
- **GAP 10** is fair framing — but the plan-side artifacts are
  intentionally SOP/model-produced (same posture as the builder
  agent), not missing producers. Soft gap, correctly labelled
  "expected per AGENTS.md".
- **Audit §1 nit**: `check_dna_fresh` makes `structure_hash:`
  frontmatter **optional** (checked only if present,
  gate.py:6973-6976) — the audit's GAP1 says it's required. Only
  `dna_hash:` is mandatory (6966-6972).
- **Audit §2 nits**: "18 topology ids" → 19; bank path cited as
  `patterns/data/section-bank/index.json` is actually
  `docs/machinery/design/patterns/data/section-bank/index.json`.

## CONFIRMED GAPS (the subset that survives)

Chain-blocking (gate check provably fails or artifact un-emittable):
1. **Section instances** `src/components/sections/<Sec>.astro` — no
   producer; `check_section_shell` hard-fails (6241-6244). Agent-owned
   by design; no verified precedent. [GAP1]
2. **Composition components** `src/components/<comp>.astro` +
   `COMPONENTS.md` — `check_components_exist` (5493-5516) fails;
   exemplars exist, adapter does not. [GAP2]
3. **TOKENS.json file** — `check_tailwind_derivation` fails on
   missing file (2126-2127); no writer; `dna_json` produces DNA.json
   shape, not TOKENS. [GAP3, minus the _modes overstatement]
4. **tailwind.config theme + token-layer/component-layer merge** —
   starter config fails hex-subset + `darkMode`; starter CSS fails
   TK.1/`.dark`; merge recipe exists only inside gen_fixtures.
   [GAP4]
5. **Section.astro copy step** — no CARD names it; unconditional
   import at assemble_page:6405 → astro build fails. [GAP5]
6. **system tile** (`preview/system.html`/`system.astro`) — fails
   P.6 at w5 and tile-parity/toggle at w7; the `system-tile`
   exemplar carries no `data-theme-toggle` (check_dark_toggle fails
   on a faithful copy) and its README instructs `cp` to the stale
   `site/design-dna/` intake path — the exemplar is both
   wrong-surface and wrong-lane. [GAP6, plus two new defects]
7. **J.4 data-recipe + data-seam emit path** — un-emittable under
   `home` slug; byte-locked. [GAP7's real half]
8. **Orchestration** — run.py:139-182 invokes only `gate.py <wave>`;
   `contracts`/`section`/`assemble` interleave is doc-only
   (SECTION-BUILD.md §2); `check_section_contracts` fails at w3 with
   "run gate.py contracts" (6207). [GAP8, manual-by-design]

Newly identified (missed by the audit):
9. **Page document shell producer** (MISSED #1) — blocks every
   head/toggle/meta/viewport check at w7 on any slug; arguably the
   largest un-emittable artifact in the chain.
10. **`preview/fine.html` producer** (MISSED #2) — hard P.18 block
    at w4.
11. **`preview/candidates.html` CLI wiring** (MISSED #3) —
    `assemble_candidates` exists, unreachable; conditional block
    at w1.
12. **`data-skeleton` emit path** (MISSED #4) — same byte-lock trap
    as J.4; input side wired via plan `skeleton:` + context_pack,
    output side absent.
13. **Scaffold self-violation** (MISSED #5) — starter `<style>`
    blocks + px/rgb literals fail P.2/P.5 before a builder writes a
    line; starter `dist/` ships a stale index.html (MISSED #6).

Produces-but-fails (confirmed): GAP9 (ASSEMBLED.md dead entry),
GAP10 (plan-side artifacts SOP-only — intentional), GAP11
(starter/gate drift — now *verified* fails, not just candidates).

## Bottom line

The audit's core thesis — emit-to-.astro was never implemented, the
deleted files were un-gated preview HTML, and the produce side is
`contracts → agent-exemplar-adaptation → assemble.py` with the middle
step unproduced — **survives**. But the audit both under- and
over-claims: it **missed three real blockers** (page-shell fragment
un-producibility — the largest; `fine.html`/`candidates.html`
producers; the `data-skeleton` trap) and a **starter self-violation**
that fails w6 out of the box; while it **overclaimed** that all
12,175 bank rows carry topology_id (only 1,979 do), that
`composition` is "null repo-wide" (style_tags.composition is
populated, different vocab), and that `_modes` needs TOKENS.json
(DNA.json modes fallback exists). `retrieve_section` was dead before
ba8b94f9, not orphaned by it. A fix scoped from this audit should
re-rank: the page-shell producer and fine/candidates producers are
harder and earlier blocks than the topology map the audit ranked #7.
