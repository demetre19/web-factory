# Adversarial review — design machinery ORDER LOGIC + SMOOTHNESS

Reviewer: second, independent pass. Scope: `docs/machinery/design/`
(INDEX, DNA-MAP, SECTION-BUILD, rules/*, stage-w0…w8 CARD+CHECKLIST,
enforcement.json, knobs.json), `tools/design-gate/{gate,run,assemble}.py`,
`skills/s5-design-dna/SKILL.md`, `docs/machinery/{DESIGN-PLAN,DESIGN-INTAKE,SECTION-CATALOG}.md`.
Read-only on source. Line numbers are at the HEAD reviewed (`efdf76d` + the concurrent
commit `e5d0b79`).

## 0. Gate baseline

| Command | Result |
|---|---|
| `gate.py selftest` | 1st run **FAIL** — `check_section_shell/fail fixture NOT caught`; re-run **PASS** (140 runs / 70 checks). The flip coincides with commit `e5d0b79` (check_section_shell rewritten) landing mid-review — transient, not a standing defect. |
| `gate.py coverage` | PASS — 140 rule ids (script 96, reviewer 43, operator 1) |
| `gate.py consistency` | PASS |
| `gate.py graph` | PASS — 478 nodes, 3479 edges |

All four meta-gates are green, yet every P0/P1 below survives them: `consistency` checks
numbers/IDs/refs, not wave ordering, schema agreement between files, or whether a gate's
precondition is produceable at that wave. **The meta-gates cannot see ordering defects.**

## 1. Headline

The machinery currently encodes **two incompatible wave models at once**:

- **New model** (INDEX.md:60-67, DNA-MAP.md:19-30, `check_variants` @ w2, knobs.json):
  W2 = look variants as knob vectors with light+dark system sheets; W5 = structure
  from content.
- **Old model** (stage-w2-look/CARD.md:21-44, DESIGN-INTAKE.md:102-159,
  DESIGN-PLAN.md:56-57/123-129, stage-w5-wireframe/CARD.md:20-26): W2 = three greyscale
  **full-page structure wireframe cards** (`data-sec/data-comp/...`) picked by the operator;
  W5 merely copies the W2-picked card into plan rows.

Under the old model, page structure is picked at W2 — before the system (W3) and before
the content inventory (W4). Under the new model, no wave produces the wireframe card
that W5's gate (`--wireframe cards/index.html`) requires. Either way, an agent following
the CARDs cannot satisfy the gates in order.

Second structural defect: the **DNA hash covers fields that later waves are required to
add** (`variants` @W2, `version` bump @W3, `rhythm` @W5, variant deltas @W8). Each
legitimate addition changes the hash. Then `check_dna_fresh` and `run.py` DM.6 void
**every** earlier gate and operator approval and restart from W1, so the pipeline loops.

## 2. Wave dependency table

| Wave | Required input | Produced by | Status |
|---|---|---|---|
| W0 | `templates/astro/` | repo | OK |
| W0 | (check_dna skipped @w0, gate.py:2304) | — | OK |
| W1 | operator likes/dislikes, comparison + example sites | W1 CARD has no step that collects them; only DESIGN-INTAKE.md:70-84 Phase 0, which runs only in redesign modes | **PROBLEM** (F14) |
| W1 | STUB heading vector (`--stub`, E.1 audit) | upstream S3/S4 `content-final` (SKILL.md:35) — exists before W0 | OK, but conflicts with the "W4 content in" label (F22) |
| W1 | `MOBBIN-REFS.md` ≥1 row **per composition** (W1 CARD:23-25) | compositions are chosen at W5 | **PROBLEM** (F12) |
| W1 | pattern library median/IQR, `score-vectors.json` | repo | OK |
| W1 | DNA `modes.light/dark` with every C.5 role (gate.py:2387-2395, not wave-scoped) | colour work happens at W2/W3 | **PROBLEM** (F06) |
| W1 | `disclosure` density pick (W1 CARD:40-41) | needs content inventory (W4) to be meaningful | PROBLEM-minor (F21) |
| W2 | DNA v0 | W1 | OK |
| W2 | DNA **v1** (gate.py:2348-2352 fails any wave ≥w2 with v<1) | W3 lock | **PROBLEM P0** (F02) |
| W2 | `variants.astro` with `data-pane="page"` per variant (gate.py:2725-2728) | page needs W5 contracts + W6 section components (gate.py:2788-2800, 2840-2846) | **PROBLEM** (F04) |
| W2 | sheet classes `btn-primary`, `rounded-card`, `swatch-*` (gate.py:2829-2832) | W3/W6 layer | **PROBLEM** (F04) |
| W2 | greyscale tiles with `data-sec/data-comp/data-ratio/data-disclosure` (W2 CARD:28-32, 43-44) | needs section list + content (W4/W5) | **PROBLEM** (F01) |
| W3 | baseline knob vector | W2 pick | OK |
| W3 | `system.copy.cta_person`, reading level (W3 CARD:48-49) | W4 CARD:32-34 "Record the copy fields the system binds at W3" | **PROBLEM — circular** (F09) |
| W3 | component catalogue on `system.astro` | composition components are built at W6 | **PROBLEM** (F10) |
| W3 | DNA lock v0→v1 | no command, no CARD step (W3 CARD has no DNA mention) | **PROBLEM** (F03) |
| W4 | STUB | upstream | OK |
| W4 | locked map v1 | W3 | OK, but no legal move when content needs an off-map value (F17) |
| W5 | wireframe card file `--wireframe cards/index.html` + `--design` | old model: W2; new model: nobody. File lives outside the pipeline (`design-proposals/…`, DESIGN-INTAKE.md:117) | **PROBLEM P0** (F01) |
| W5 | content inventory (zone, heading_class, body blocks) | W4, but the W4 gate checks only that the STUB exists (gate.py:715-726) | **PROBLEM** (F15) |
| W5 | tokens / grid | W3 | OK |
| W5 | writes `rhythm` INTO a locked map | itself; that is an edit of a locked map, so DNA-MAP.md:42-44 requires a version bump and hash change | **PROBLEM P0** (F05) |
| W5 | contracts `allowed.classes` = current layer (gate.py:1797) | W6 adds the component-layer classes later | PROBLEM-minor (F24) |
| W6 | contracts | W5 | OK |
| W6 | composition components (the section instance must render `<Comp/>`, gate.py:1928-1945) | same wave, but CARD:21-32 orders sections **before** components | **PROBLEM** (F11) |
| W6 | edits `system.astro` (a W3 input) | — | W3's approval goes stale silently (F08) |
| W7 | plan rows + section components | W5/W6 | OK |
| W7 | multi-page assembly | `page_path` takes the first page only (gate.py:2011-2013); the wireframe lock compares rows from all pages to one card (gate.py:1086-1097) | **PROBLEM** (F16) |
| W7 | Lighthouse numbers (CHECKLIST:18) | no producer; CARD:62-66 says "never a gate" | **PROBLEM** (F18) |
| W7 | `PAGES/<slug>/SPEC.md` == plan rows verbatim | hand-copied; not generated | PROBLEM-minor (F27) |
| W8 | dist + shots 1280/768/360 | W7 | OK |
| W8 | `REVIEW.json.modes.{light,dark}` + light/dark shots (gate.py:1680-1693) | CARD:20-31 contract and checklist name neither | **PROBLEM** (F19) |
| W8 | final variants = baseline + deltas written to `DNA.variants` | itself; the hash change voids W1–W7 plus every contract/section `dna_hash` | **PROBLEM P0** (F05) |

## 3. Findings

| ID | Sev | Location | Issue | Fix |
|---|---|---|---|---|
| F01 | P0 | stage-w2-look/CARD.md:21-44; DESIGN-INTAKE.md:102-159; stage-w5-wireframe/CARD.md:20-26, 79; INDEX.md:61,64 | Two W2 models coexist. The CARD/INTAKE make W2 = greyscale structure cards with `data-sec/comp`, picked before system and content. INDEX/DNA-MAP make W2 = knob-vector look + sheets. W5 only *copies* "the operator-picked card", and no wave in the new model produces `cards/index.html`. | Rewrite the W2 CARD/CHECKLIST/INTAKE Phase B as **look variants only** (knob vectors, sheet-first, light/dark, no `data-sec`). Move wireframe-card generation into **W5 Job step 1**: generate 2–3 greyscale 1:1 wireframes from the W4 inventory on the W3 grid via `templates/wireframe-cards/` into `<pipeline>/cards/index.html`, operator picks, then lock. |
| F02 | P0 | gate.py:2348-2352 | `check_dna` fails every wave not in (w0,w1) when `version < 1`. W2 runs on v0 by design (DNA-MAP.md:24), so **W2 can never pass**, and W3 must lock before its own gate runs. | Change the condition to `_wave_ge(ctx,'w4')`. Better: make lock = `gate.py w3 --approve` (F03). |
| F03 | P1 | stage-w3-system/CARD.md (whole); INDEX.md:24-27, 62 | INDEX says "W3 locks to v1 and issues a hash", but no CARD step, command or checklist row performs the lock. The intended order (sheet approved → lock) cannot be expressed, because F02 forces lock before the W3 gate. | Add W3 Job step "lock": `gate.py w3 <dir> --approve` sets `version:1`, writes `hash`, re-renders DNA.md. Add a W3 CHECKLIST row DM.1 "v1 locked at approval". |
| F04 | P0 | gate.py:4462-4464 (`check_variants` in W2), 2704-2731, 2785-2864; rules/VG.md:22-31, 42-44 | At W2, `check_variants` requires `variants.astro` with a page pane per variant ("same page", "same plan rows"). No plan rows or sections exist yet, so the page pane renders empty and the check passes on string presence only. The sheet uses `btn-primary`/`rounded-card`/`swatch-*` classes that are not defined until W3/W6. | Scope it: at W2 require `data-pane="system"` only, plus a fixed **specimen** pane (DNA invariants + exemplar hero/card/form from `templates/sections`). Require `data-pane="page"` only at W8. Define the sheet classes in `templates/astro` global.css at W0. |
| F05 | P0 | gate.py:2200-2206 (hash = whole map minus `hash`), 2484-2494, 3164; run.py:55-76; DNA-MAP.md:42-44; rules/DM.md:101-105 | The hash covers `variants`, `version`, `rhythm`. Required additions at W2 (variants + pick), W3 (v1), W5 (rhythm) and W8 (deltas) each change it. `check_dna_fresh` then fails on W1's recorded hash, and `run.py` resets GATES from **w1**, voiding all operator approvals. At W8 the deltas also stale every contract and section `dna_hash`, which forces a full W5–W7 rebuild. The pipeline loops and cannot converge. | Split the hash: `core_hash` = invariants + genotype + knobs + modes (frozen at W3 lock). Rhythm and variants are each stored as a hash of their own section. Each wave records only the sub-hash it consumed (W1/W2: none or v0 core; W3+: core; W5+: core + rhythm). Variants never feed section/contract hashes. DM.6 restarts from the earliest wave **that consumed the changed sub-hash**, not from the earliest recorded wave. |
| F06 | P1 | gate.py:2387-2395 | `modes.light/dark` with every MODE_ROLE is required from W1. DNA v0 has only extracted invariants (accent). Filling the rest is a guess, which DM.1 forbids ("A guessed number at W1 exit is a FAIL", W1 CARD:59-61). | Require modes from w2 (`_wave_ge(ctx,'w2')`). At W1, require `invariants.accent` (+ fonts if extracted) only. |
| F07 | P1 | gate.py:2310-2311; stage-w1-dna/CHECKLIST.md:28 | `invariants` and `constraints` (likes/dislikes) are not required fields in `check_dna`, so "invariants fixed across all options" (DNA-MAP.md:24) is unverifiable at W2. | Add `invariants` (and `constraints` when the design_mode has a live site) to the required fields at ≥w1. In `check_variants`, assert no delta touches an invariant-tier knob or role. |
| F08 | P1 | gate.py:3170-3175; run.py:25-54; INDEX.md:48-52 | Approval is not bound to input hashes. On re-gate, `approved` persists if the gate passes. Stale-input detection is one hop: run N checks only N-1's inputs. W6 edits `system.astro` (a W3 input) and W5 edits `DESIGN-PLAN.md` (W1–W3 input), and the W3 approval survives untouched. | Store `approved_inputs_sha256` at `--approve` and treat approval as void when the current inputs differ. In `run.py`, check **all** earlier waves' inputs (cheap: a few files). |
| F09 | P1 | stage-w3-system/CARD.md:48-49; stage-w4-content/CARD.md:32-34; DESIGN-PLAN.md:257-258 | Circular: W3 binds `cta_person`/reading level, while W4 "records the copy fields the system binds at W3". | These fields come from STUB/brief (upstream). Move them to W1 (from the STUB, `provenance: extracted`). W3 consumes them; W4 verifies the STUB complies. |
| F10 | P1 | stage-w3-system/CARD.md:20-24; stage-w6-components/CARD.md:27-30 (P.6 "tile is the catalogue"); INDEX.md:62,65 | The W3 sheet that the operator approves (the "component catalogue" in the intended order) cannot contain composition components, because they are built at W6 after structure. W6 then mutates the approved sheet. | Define two tiers: the **W3 sheet = tokens + atoms** (buttons, fields, card shell, type ranks, surfaces × densities, both modes), approved and locked. **W6 appends** compositions to `system.astro` under a "Compositions" region and gets its own operator approval (already listed). Make `check_tile_is_system` @w3 check atoms and @w6 check compositions. |
| F11 | P1 | stage-w6-components/CARD.md:21-32; SECTION-BUILD.md:30-36 | Inside W6 the order is inverted. The CARD builds section instances first and then "the reusable components the sections compose from". `check_section_shell` (gate.py:1928-1945) requires each instance to render `<Composition/>`. The SECTION-BUILD chain also lists `gate.py section` before the component it gates. | Reorder the CARD: (1) composition components + layer classes + tile registration; (2) per-section instances from contracts; (3) `gate.py section` per section. Apply the same order to the SECTION-BUILD §2 chain. |
| F12 | P1 | stage-w1-dna/CARD.md:21-25; CHECKLIST w1:17; stage-w2-look/CARD.md:33-34 | Mobbin "≥1 row per composition the site will use" is required at W1/W2, but compositions are decided at W5. The gate enforces it at w5 only (gate.py:705-712), so the docs ask for the impossible. | W1: refs per **site class / page type** (the discovery set). W5: refs per composition (the gate already does this). Fix the W1 CARD/CHECKLIST and W2 CARD:33-34 wording. |
| F13 | P1 | stage-w2-look/CARD.md:21-27; gate.py:67-75 (AXES), 4462-4464; DESIGN-PLAN.md:56-57 | W2 demands three parallel encodings of "the look": `direction:` axes, genotype `options:` and knob `variants`, with no mapping between them. DESIGN-PLAN.md:56 says W1 decides the six direction axes; the W2 CARD says W2 does. | Make knob vectors the only W2 artifact and derive `direction:` mechanically from knobs (`motion.level`→M.1, `radius.personality`→S.1, `space.density_scale`→density…). Drop genotype `options:` at W2: genotype is W1 (D.3 distinctness moves to knob distinctness). |
| F14 | P1 | stage-w1-dna/CARD.md:21-61; DESIGN-INTAKE.md:70-84 | The intended W1 inputs (likes/dislikes, comparison and example sites) have no job step or checklist row. The preference ask exists only in DESIGN-INTAKE Phase 0 (redesign modes). New-build runs have no source for `constraints`. | Add W1 Job step 1b "discovery batch": likes, dislikes, comparison sites, example sites (one structured batch, all modes), written to `DNA.constraints`. Add a CHECKLIST row and a `check_dna` field requirement. |
| F15 | P1 | gate.py:715-726, 4471, 4503; stage-w4-content/CARD.md:24-36 | The W4 gate checks only that the STUB has a heading vector. The inventory (body blocks, zone, heading_class, media subject, proof elements), placeholder scan and copy fields are unchecked, yet W5 depends on them and the operator approves on them. | Implement `check_content_inventory` against an `inventory:` block (or `INVENTORY.json`): 1 row per STUB heading, zone ∈ enum, heading_class ∈ enum, no lorem/TODO, R.4 caps pre-checked (F20). Add the inventory to `WAVE_INPUTS['w4']`. |
| F16 | P1 | gate.py:2011-2013, 1086-1097; assemble.py:4 | Single-page assumption. `assemble_page` writes only the first page's file but imports contracts from **all** pages' rows. `check_wireframe_lock` compares all pages' rows to one card. Any multi-page site fails W5/W7. | Key contracts, cards and assembly per `slug`: `assemble.py` loops over pages, and `--wireframe` maps per page (`cards/<slug>.html`). |
| F17 | P1 | DNA-MAP.md:26; stage-w5-wireframe/CARD.md:44-46 (D.4 "re-picks the row, never the genotype") | Content arrives after lock. If the inventory needs a composition, ratio or density outside the locked map, the only legal move is a map edit, which today means a restart from W1 (F05). That breaks "content dictates layout" (DESIGN-INTAKE.md:191). | Keep **page-level** genes (`layout-archetype`, `page-macro-structure`, `density-tier`, `image-led-ratio`) **out of the W3 lock**. They are W5 decisions, recorded under `rhythm`/structure. The W3 lock covers site-level look only. With F05 split hashes, a W5 structure change re-runs W5+ only. |
| F18 | P1 | stage-w7-page/CHECKLIST.md:18 vs stage-w7-page/CARD.md:62-66; enforcement.json P.12 | The checklist demands "perf ≥ 90 / LCP ≤ 2.5 s / CLS ≤ 0.1 (paste numbers)". The CARD says Lighthouse is never a gate. A blank cell fails P.9, so the agent must run an unowned tool. | Replace the row with the `check_speed_budget` items (JS KB, img dims, lazy/fetchpriority, font swap). Keep Lighthouse as an operator post-build note outside the checklist. |
| F19 | P1 | stage-w8-review/CARD.md:20-31, CHECKLIST w8:18; gate.py:1680-1693; INDEX.md:67 | W8 runs `check_review_modes` (needs `REVIEW.json.modes.light/dark` + light/dark shots), but the CARD's REVIEW.json contract and screenshot spec name no modes. INDEX promises "both modes" and "variants all-pass", yet the W8 CARD has no variants job, and `check_style_review`/`check_novelty` run without being in `enforced_by`. | Add `"modes": {"light": {...}, "dark": {...}}` to the contract and `shots/<page>-<w>-<mode>.png` naming. Add W8 Job "final variants: `assemble.py --variants`, VG.1–VG.6". Sync `enforced_by` with WAVE_CHECKS['w8']. |
| F20 | P2 | gate.py:3044-3066 (R.4 @w7); stage-w4-content/CARD.md:20-36; rules/R.md:81-106 | R.4 paragraph caps (240/500 chars) are first enforced on built HTML at W7. Body copy is upstream and cannot be rewritten at design time (W4:20-23), so the failure appears 3 waves late with no design-side remedy. Interplay with heavy disclosure (DESIGN-INTAKE.md:77-79) and R.4 `money` 150–250 words/viewport is unreconciled. No ≥700-word/≥7-H2 SEO floor exists in this machinery; the depth target lives upstream (`skills/s3-writing` `word_target`), so nothing checks that disclosure tier × budget can hold the STUB's word count. | Pre-check R.4 on the W4 inventory and route violations upstream (S3) at W4. Add a W5 arithmetic check: open-zone words ÷ R.4 page-class budget ≤ planned viewports, and folded words count toward disclosure only. |
| F21 | P2 | stage-w1-dna/CARD.md:40-41; DESIGN-INTAKE.md:77-84; W4 CARD:29-31 | The operator's disclosure pick (light/medium/heavy) is asked at W1, before the inventory shows what would fold. | Ask at W5 alongside the wireframe pick (each wireframe card shows its fold tier), or confirm the W1 pick at W5. |
| F22 | P2 | INDEX.md:63; DESIGN-PLAN.md:59; SKILL.md:35 | "W4 content in" mislabels the wave: the STUB/content-final exist before W0 (W1 already gates `--stub`). W4 is really *inventory + bind*. | Rename W4 to "content inventory (bind)". State that the STUB is a W1 input. |
| F23 | P1 | INDEX.md:69-72; run.py:25-38; gate.py:4515 | Approval points disagree. INDEX lists W0,W2–W8 (no W1). `run.py` requires approval of **every** previous wave including W0, W1 and W4. `APPROVABLE={'w2','w3','w5','w6','w7','w8'}` is dead code. INDEX:71-72 bans any preview before `SCORECARD.json` exists, which also forbids the W2/W3/W5 picks. Result: too many pick points (9) with an impossible preview rule. | Operator gates: **W1** (discovery+invariants), **W2** (look pick), **W3** (sheet → lock), **W5** (wireframe pick → lock), **W8** (final + variant). W0/W4/W6/W7 auto-advance on green. Use `APPROVABLE` in `run.py`. Scope the SCORECARD rule to the *final page* preview. |
| F24 | P2 | gate.py:1797, 1837-1843 | Contracts snapshot `allowed.classes` at W5, before W6 adds component-layer classes. The builder's closed vocabulary is stale/short (`check_section_contracts` ignores `allowed`, so it never trips, and the contract misleads). | Regenerate contracts at W6 start (`gate.py contracts`), or carry layer classes by reference ("global.css @layer components at build time"). |
| F25 | P1 | rules/DM.md:29-44 vs DNA-MAP.md:48-71 vs gate.py:2310-2315, 1802 | Three DNA schemas. DM.1 has `schema`, `profile`, `tokens`, rhythm-as-object (`surfaces/densities/contrast_moment`), `burst`, `wildcard`. DNA-MAP and the gate use `version`, `vertical_profile`, rhythm-as-list, `invariants`, `variants`. A DM.1-shaped rhythm object fails `check_dna` ("rhythm names section 'surfaces'"). Contracts read `dmap.get('profile')`, which is always None. DNA-MAP's example `vertical_profile: "services/local-service"` ≠ plan `profile-services` (DM.3 mismatch @≥w5, gate.py:2422-2427). | Make one schema, the gate's. Rewrite the DM.1 block. Make the contract read `vertical_profile`. Fix the DNA-MAP example to `profile-services`. |
| F26 | P1 | DNA-MAP.md:67 vs gate.py:2344-2347 | Example `vector_targets` use a 0–10 scale (8, 9), but the gate requires 0.0–1.0. | Fix the example to 0.0–1.0. |
| F27 | P2 | stage-w7-page/CARD.md:58-59; gate.py:4507 | `PAGES/<slug>/SPEC.md` must equal plan rows verbatim but is hand-written: duplicate state that can only drift. | Generate SPEC.md in `assemble.py`, or drop it in favour of the plan. |
| F28 | P1 | knobs.json:7 vs rules/T.md:118, enforcement T.6 | `type.base` range [15,20] admits 15 px, but T.6 demands body ≥16 px "no exceptions". A pattern-median seed of 15 passes W1/W2 and fails W3. | Change the range to [16,20]. |
| F29 | P1 | knobs.json:11-12 vs rules/G.md:16, gate.py:33; DNA-MAP.md:58; rules/L.md:151 | `space.section_py` step 4 with spacious up to 176, and `grid.gutter` step 8 (→40), admit values outside the G.1 closed scale {4…128}. The DNA-MAP example (regular 72, spacious 112) is itself off-scale. L.md:151 says the spacious gap is 60–100 px. | Make section_py and gutter `kind: enum` over G.1 members (compact {32,48,64}, regular {48,64,96}, spacious {64,96,128}; gutter {16,24,32,48}). Fix the DNA-MAP example and the L.md checklist. |
| F30 | P1 | gate.py:67-75 (AXES) + W2 CHECKLIST:18-21 vs knobs.json:13,18 vs rules/G.md:30 | Enum drift. Density is `sparse/balanced/dense` (W2 axis) vs `compact/regular/spacious` (G.3, knobs, rows). Shape is `p1-sharp…` vs knob `p1…p4`. Motion is the M.1 four personalities vs knob `motion.level` with an extra `none`. | Use one vocabulary per concept. Map the W2 density axis onto `space.density_scale`. Use `p1…p4` everywhere, labels as display only. Add `none` to M.1, or remove it from the knob. |
| F31 | P1 | SECTION-CATALOG.md:32,37,151; stage-w5-wireframe/CARD.md:54-56; DESIGN-PLAN.md:360; gate.py:1192-1199 | Contrast-moment caps disagree. Catalogue defaults: hero=`inverse`, act=`inverse|brand`, act twice on money pages → 3 inverse, which breaks `inverse ≤2 + footer`. The W5 CARD says "exactly one inverse/brand interior". The gate allows ≥1 and ≤3 including the footer. An agent following defaults fails. | Set one rule, in the gate: interior inverse+brand == 1 (the contrast moment), footer exempt. Change catalogue defaults to hero=`base|media` and act=`brand` once, with the second act on `base`. |
| F32 | P2 | stage-w5-wireframe/CARD.md:57-59 vs gate.py:1207-1213 | The CARD requires a density change at least every 3 rows. The gate only fails fully uniform density. | Implement the 3-row window in the gate, or soften the CARD. |
| F33 | P2 | rules/R.md:107-128 (R.5, reviewer @w8); knobs.json:11 | Above-fold at 360×640 requires 5 elements, including a visual anchor with text-first stack. Spacious hero padding (72–176 px) + H1 + 12–25-word subhead + CTA + 16:9 media ≈ 660–760 px. The fold is not checked until W8 (reviewer), so the failure lands after the build. | Add a 360-fold height arithmetic check at W5 (density py + type ranks + media ratio from tokens) and a per-breakpoint section_py (mobile tier). |
| F34 | P2 | DESIGN-PLAN.md:65-68, 84-89, 123-129; SKILL.md:74-77 | Stale order text. The "Order note" says W5 is verified "before the system spends a pixel" (W3 already did). Fill-order step 6 puts `preview/system.html` **after** ASCII/W5. The "never reaches two waves up" rule is false: W5 reads W1 Mobbin, W2 pick, W3 tokens and W4 inventory. SKILL write-set still says `preview/system.html` (banned by `check_tile_is_system`, gate.py:1042-1044). | Rewrite these to the W0–W8 order. Replace "one upstream artifact" with "DNA map + the immediately previous wave's artifact". |
| F35 | P2 | gate.py:14-17 | The docstring wave map is obsolete ("w4 wireframe-lock · w5 components · w6 page · w7 review", "W0–W7"). It also says "the designer model never runs this", but the W6 CARD:65-66 tells the builder to run `gate.py section` until PASS. Ownership of gate runs is ambiguous. | Fix the docstring. State that the designer MAY run gates (read-only) and only the orchestrator/operator runs `--approve`, writes GATES.json and REVIEW.json. |
| F36 | P2 | SKILL.md:27; INDEX.md:64-66 | SKILL rulebook ID list omits DM and VG. INDEX rule-file columns omit SB for W5–W7 and DNA/VG where CARDs use them. INDEX W6 "Produces" omits the section instances that W6 gates. | Sync the lists from CARD `uses:` (generate them). |
| F37 | P2 | enforcement.json DM.5 (`wave: w7`, check `check_rhythm`) vs gate.py:4472-4477 | `check_rhythm` runs only at W5. The rule's wave says W7, and its render half is `check_rhythm_render`. | Split: DM.5 plan → `check_rhythm` w5, render → `check_rhythm_render` w7. |
| F38 | P2 | rules/VG.md:42-44 vs gate.py:2757-2762; enforcement VG.1/VG.3 thresholds | VG.2 says variants carry a non-empty **`alleles`** diff, but the gate checks **knob `deltas`**. The enforcement threshold text for VG.1 describes VG.2 and VG.3's describes VG.1. VG.1 reads `VARIANT-GATES.json`, but the gate prefers `DNA.variants`. | Align on knob deltas (the DNA-MAP law) and one store (`DNA.variants`). Correct the threshold strings. |
| F39 | P2 | gate.py:2804-2864 | Variant knob deltas are printed as text (`data-knobs`), not applied. No scoped CSS vars are emitted for `data-variant-scope`, so every variant renders identically and the operator picks between labels. | Emit `[data-variant-scope="vN"]{--type-ratio:…; …}` from the deltas (knob → token map in knobs.json) and bind layer classes to those vars. |
| F40 | P2 | SECTION-BUILD.md:95; rules/I.md:15-27; P.11 stroke set | SECTION-BUILD prescribes "Lucide inline SVG". I.1 allows Solid/Duotone/3D styles and the gate allows 5 families. A W3 pick of a filled family conflicts with the section-gate prose. | Say "the W3-declared icon family", not Lucide. Make P.11 stroke checks conditional on the outline style. |
| F41 | P2 | run.py:41-50; gate.py:3095-3102 | The stale check recomputes the previous wave's hashes with the *current* CLI args. Running `w6` without `--wireframe/--stub` drops those files from W5's comparison set, so a changed wireframe or STUB goes undetected. | Persist the resolved input paths in GATES.json and recompute from them. |

## 4. "Look before content" vs "content dictates layout"

The **INDEX/DNA-MAP** framing is coherent: site-level look (W2–W3: knobs, modes, type,
shape, motion) is content-independent; page-level structure (W5) follows the inventory.
The implementation breaks it in three places:

1. W2 CARD/INTAKE still pick page **structure** at W2 (F01).
2. Structural genes (`layout-archetype`, `page-macro-structure`, `density-tier`,
   `image-led-ratio`) are fixed in the W1 genotype and locked at W3. D.4 then forbids
   content from changing them (F17).
3. The DNA hash makes any W5 structure write (rhythm) a full restart (F05).

Fixing F01 + F05 + F17 makes the split real: lock look at W3, lock structure at W5,
and each lock invalidates only its consumers.

## 5. Recommended order (changes in **bold**)

| Wave | Does | Operator | Lock / hash |
|---|---|---|---|
| W0 | scaffold (template carries sheet atom classes) | — auto | — |
| W1 | **discovery batch** (likes, dislikes, comparison/example sites, invariants, STUB read, cta_person/reading level from STUB), audit, Mobbin by page type, DNA v0 (invariants + constraints + seeded knobs + vector targets; **no modes beyond extracted accent**) | approve discovery | v0 (unhashed draft) |
| W2 | 3–5 **knob-vector looks**, each sheet-first light+dark on a **fixed specimen**, no page pane, no `data-sec` | pick baseline | — |
| W3 | system sheet = **tokens + atoms**, both modes | approve → **`--approve` locks core v1** | `core_hash` |
| W4 | inventory bind + **R.4 pre-check**; copy issues routed to S3 | — auto | — |
| W5 | **generate** 2–3 greyscale 1:1 wireframes per page from the inventory on the W3 grid (+ disclosure tier per card), operator picks, rows lock, rhythm + structural genes written | pick → lock | `structure_hash` |
| W6 | **composition components first**, then section instances from contracts, section gates, tile "Compositions" region | approve compositions | consumes core+structure |
| W7 | `assemble.py` per page, build, page gates | — auto | — |
| W8 | independent review (both modes) + score; **then** final variants (deltas never feed section hashes) | final verdict + variant pick | `variants_hash` (W8 only) |

Pick points: 5 (W1, W2, W3, W5, W8), down from 9 enforced by `run.py`. Each lock
invalidates only the waves that consume it.
