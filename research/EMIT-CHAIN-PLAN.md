# EMIT-CHAIN PLAN — durable work state (survives model/compaction switch)

Repo: `/Users/apple/Documents/DEV-WORK/Web Factory` (`demetre19/web-factory`, main).
This file is the load-bearing plan + progress. Read it FIRST on resume.

## The operating rule (operator, this session — non-negotiable)

- **ONE truth, ONE rule, ONE machinery.** SOPs/rules produce artifacts;
  `gate.py` is the judge — and ONLY the judge. NEVER ad-hoc: no hand
  markup, no bespoke emitters/themes/gates, no `/tmp` demos, no second
  pickers. Mirrors SEO-SOP (`checklist→stage_gate→article_gate→seal`).
- Sections are the primitive; a page is assembled from gated sections.
- ASTRO + Tailwind + ACSS tokens. Components carry no outer
  padding/bg/width — `Section.astro` owns the band (SB.2). No `<style>`,
  no `class:list`, no computed classes, no raw hex, no `[...]` arbitrary
  (SB.3). LIGHT+DARK on every design (C.1 6-role map, C.5).
- Whistle Clean redesign FROZEN until machinery declared complete.

## The canonical chain

```
DESIGN-PLAN.md row
  → sections/<nn>-<sec>.contract.json        (gate.py contracts, SB.1)
  → src/components/sections/<Sec>.astro      (adapt gold exemplar, SB.5)
  → src/components/<comp>.astro              (composition skeleton)
  → assemble.py → src/pages/<slug>.astro     (SB.4, byte-locked)
  → gate.py w6 / w7 / w8                     (judge, LAST)
```

## Pipeline (audit → adv-review → scope → fix → adv-review → headless
## variance → ready-to-try). Status [x]=done:

- [x] CUT ad-hoc path — `section_emit.py`, `preview_sections.py`,
  `theme_vibes.py` + `preview/` deleted + `retrieval.py` comments fixed.
  Commit `ba8b94f9`. (Uncommitted scratch `design_gate.py`/`acss_base.py`/
  `vibe_emit.py` also removed — never existed in git.)
- [x] AGENTS.md (repo root) rewritten — one-machinery contract.
- [x] FULL AUDIT — `research/EMIT-CHAIN-AUDIT.md` (425 ln, file:line).
  Emit-to-.astro NEVER implemented; deleted files were un-gated preview
  HTML, not components.
- [x] ADVERSARIAL REVIEW — `research/EMIT-CHAIN-AUDIT-REVIEW.md` (353 ln).
  Confirmed core thesis; corrected overclaims; found 3 MISSED gaps
  (page-shell, fine/candidates producers, scaffold self-violation) +
  re-ranked. 13 confirmed gaps total.
- [x] SCOPE — `research/EMIT-CHAIN-SCOPE.md`. Ranked change set:
  S0 scaffold self-violation → P1-6 deterministic producers → B1-3
  builder + topo map → J4/SKL byte-lock.
- [~] FIX — in progress via `EmitChainFix` agent:
  `pipeline_emit.py` (new) + `gate.py`/`gen_fixtures.py` edits
  (assemble_page emits BaseLayout shell + head/toggle/meta +
  data-recipe/data-seam/data-skeleton; Section.astro matching props;
  gen_fixtures constants updated in lockstep since check_assembly
  byte-locks). Reuses gen_fixtures proven shapes, not re-encoded.
- [ ] ADVERSARIAL REVIEW of the fix diff.
- [ ] HEADLESS VARIANCE RUN — emit several sections/pages across
  different DNAs, mechanically diff composition/topology,
  `--section-space`, gaps, radius, fonts → per-variant diff table
  proving structural+token diversity (not palette swaps).
- [ ] READY TO TRY — gate-clean proof + exact operator commands.

## The gap set (from review, ranked)

**S0 scaffold** — `templates/astro` starter self-violates (P.2/P.5):
`<style>`+`rgb()`/`px` literals in Footer/Header/MobileCTA/SocialLinks/
404/BaseLayout; global.css lacks the five TK layers; tailwind.config
lacks `darkMode`+hexes; stale `dist/` ships. → supersede by emitting the
correct scaffold (don't fix the old lane).
- [x] FIX — done, 4 commits (EmitChainFix):
  `38511cbc` J4 contract+_section_tag+assemble_page BaseLayout+
  _style_profiles; `9322f002` emit_global.py (tokens_json/
  tailwind_config/global_css+ACSS tail) + Section.astro props +
  templates/layouts/BaseLayout.astro; `8a2b71ca` gen_fixtures
  consume emit_global + regenerated; `d5f192fb` pipeline_emit.py +
  intent/vocab + exemplar fixes. selftest PASS (267/134);
  pipeline_emit --build exit 0 → real astro build; w7 fails only on
  wave-ancestry/operator gating (zero emit defects).
- [x] B3 topo map (done in parallel) — `patterns/data/topo-map.json`
  (bank topology_id → catalog composition, 19 ids, nav-sidebar null);
  `retrieval.py` `_topo_map()` + `retrieve_section` returns
  `composition`. Verified: hero → hero-media-bg → full-bleed (99.7ms).
- [x] BRICKSMAVEN — new richer ACSS-JSON source (61edcb59):
  `harvest_bricksmaven.py` (wp-login → data-value payload inline;
  no ajax) + `classify_bricksmaven.py` (.topo sidecars:
  tree/spacing/gaps/layout/typo/colour/behaviour per class) →
  `templates/skeletons/bricksmaven/` — 881 payloads classified,
  grid-3col 59, hero-media-right 49, form-split 49, nav 21…
- [x] FIX-REVIEW — `EMIT-CHAIN-FIX-REVIEW.md` (483L, BLOCK verdict,
  F1–F10) → fixes shipped (9e237829): BaseLayout+system import
  global.css (F3, was zero CSS shipped); stub-inventory cta →
  contract content → hero CTA renders (F1/R.10); plan rows carry
  recipe → data-recipe real on assemble output (F2/J.4);
  fluid/stack utilities defined in @layer (F5); fs/radius/gutter/
  fonts bind primitive→knobs — DNA-driven (F6); tailwind config
  comma fix (was invalid JS — hidden until css import added);
  collections → .grid-auto auto-fit on --grid-min (G.5);
  _strip_media gate fix (media-gated repeat(2) splits legit);
  P.13 min-width media-query false-positive fixed. 3 emit+builds
  green; w7 remainder = wave-order + P.9 operator checklist only.
  F4 DONE (bacba6e2): fixture components/instances/dist now real
  producer output — _comp_copy exemplars + _instance + real astro
  build; ~45 MUT anchors re-targeted at emitted markup + hashed
  _astro assets via new REPLGLOB/DELGLOB ops; check fixes: O.1
  serializer norm, SB.2 doc-comment FP, I.10 ornament-svg exempt.
  Redteam 31/31 caught. F8-F10 DONE (02844def).
  F7 DONE: assemble --fine = three ±1-step stylistic-knob nudges of
  the w4 pick via the SAME assemble_variants emitter (no parallel
  HTML); pairwise ≥3-knob diff patterns verified at emit; fixture
  fine.html now producer-emitted (was regex-mangled variants — a
  fixture cheat) with w4 pick seeded in approvals; ASSEMBLED.md +
  root SPEC.md receipts written by assemble.py (w7 ARTIFACTS).
  candidates CLI still unwired.
**B1-3 builder** — `pipeline_emit`/`build_section`: contract.composition
→ copy `templates/sections/<comp>/<Comp>.astro` →
`src/components/<comp>.astro`; write section instance = frontmatter
(dna_hash [mandatory], structure_hash, exemplar) + `import CamelComp` +
`<CamelComp/>`. `COMPONENTS.md` map. topology_id→composition map
(`patterns/data/topo-map.json`) for retrieve_section.

**J4/SKL byte-lock** — `data-recipe`/`data-seam`/`data-skeleton` only
emittable inside assemble_page/Section.astro (check_assembly byte-lock).

## Key facts (audit-verified)

- `gate.py` ~11,850 lines; `Ctx(pipeline-dir)` → `ctx.site`=
  `<pipeline>/site`. Wave checksets at gate.py:11745-11840.
- Contracts: `build_contracts` gate.py:6122; `contracts_dir`=`<dir>/
  sections`; `section_slug`=`{index:02d}-{name}`; `camel()`=PascalCase.
- Section files gate reads: `site/src/components/sections/*.astro`
  (`_section_files` 6230); components at `site/src/components/<comp>`.
- `fixtures/_base` = complete passing pipeline (contracts, gates,
  sections, comp components, assembled page, system tile, dist) —
  generated by gen_fixtures, the only end-to-end proof.
- `gen_fixtures.py` constants: TOKENS(310) TAILWIND_CFG(270)
  GLOBAL_CSS_TAIL(217) _global_css(1028) SECTION_ASTRO(905)
  SECTIONS(376+461) COMPONENTS(441) SYSTEM_ASTRO(362) PLAN(65) STUB(162)
  SPEC(204) PAGE_HTML(318). `main()` (1497) writes them.
- Bank: 12,175 rows; `topo.topology_id` on only 1,979 (19 ids);
  `style_tags.composition` on 12,152 (19-id different vocab); bank
  `composition` field null. `retrieve_section` was caller-less before
  deletion.
- `_modes` falls back to DNA.json.modes (dna_tokens.dna_json already
  makes it) — TOKENS.json needed only for hex-walk + knob audit.
- `structure_hash:` frontmatter optional (checked-if-present 6973-76);
  `dna_hash:` mandatory (6966-72).

## Working files

| File | Role |
|---|---|
| `AGENTS.md` | one-machinery operating contract |
| `research/EMIT-CHAIN-AUDIT.md` | audit (425 ln) |
| `research/EMIT-CHAIN-AUDIT-REVIEW.md` | adversarial review (353 ln) |
| `research/EMIT-CHAIN-SCOPE.md` | ranked change set |
| `tools/design-gate/pipeline_emit.py` | NEW — the producers (in progress) |
| `tools/design-gate/gen_fixtures.py` | proven shape source; edit w/ assemble_page |
| `tools/design-gate/gate.py` | assemble_page/Section.astro props edits |
| `tools/design-gate/{emit_tokens,dna_tokens,adapt,retrieval}.py` | existing producers to reuse |

## Verify / commands

- Selftest: `python3 tools/design-gate/gate.py selftest` — must exit 0
  after every gate.py/gen_fixtures edit (fixtures byte-lock).
- End-to-end: `pipeline_emit.py <pipeline-dir>` → `gate.py w7 <dir>` →
  exit 0 = the page is machinery-produced + gate-clean.
- Agents running: `EmitChainFix` (the fix). `write agent://EmitChainFix`
  to steer; `history://EmitChainFix` transcript.

## Frozen / parked

- Whistle Clean redesign — FROZEN until machinery declared complete.
- gemini reclassify of ~11k section-bank rows — held until design
  output accepted.
- Brixies MCP harvester (200/day, ~7 days) + SiteScanner siteinspire —
  background, unchanged.
