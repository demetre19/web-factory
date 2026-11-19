# ADV-REVIEW — re-verification after the GatedMachinery fix session

Date 2026-11-19. Read-only on source. Reviewed **committed HEAD `6b9002c`** (clean snapshot via
`git archive` → `/tmp/wf-head`); the repo working tree had uncommitted edits from a concurrent
session (gate.py, run.py, gen_fixtures.py, ~8k fixture/pattern files) and was not used as evidence
except where noted (N-18). All mutations ran in temp copies of `tools/design-gate/fixtures/_base`
with `HOME=<tmp>` (gate writes `~/.web-factory`, reads `~/.mobbin-oauth`). Line numbers = HEAD.

Inputs: `research/ADV-REVIEW-ORDER-SMOOTHNESS.md` (A: F01–F41) and
`research/ADV-REVIEW-DESIGN-MACHINERY.md` (B: F-01–F-43). Every P0/P1 from both is verified below.
Wave names in old findings are mapped to the resequenced order: w0 scaffold · w1 brief+discovery ·
w2 content · w3 layout round · w4 look round (DNA v1 lock) · w5 system · w6 components · w7 page · w8 review.

## 0. Meta-gates

| Command | Repo working tree (`HOME=/Users/apple`) | Clean HEAD snapshot, clean `HOME` |
|---|---|---|
| `gate.py selftest` | PASS — 153 runs / 77 checks | **FAIL** — `check_scorecard/pass fixture failed: ['scorecard section P = 88.8 < 90']` (N-12) |
| `gate.py coverage` | PASS — 140 ids, script 109 / reviewer 30 / operator 1 | PASS (same) |
| `gate.py consistency` | PASS | PASS |
| `gate.py graph` | PASS — 528 nodes, 3902 edges | PASS (same) |

Selftest passes in the repo only because `gen_fixtures.py:1192` minted signed approvals (key
`fixture-key`) into the real `~/.web-factory/approvals/` (78 files, mtime 12:14 today). Proof:
`HOME=$H python3 gen_fixtures.py && HOME=$H gate.py selftest` → PASS; fresh `HOME` → FAIL.

## 1. Headline

- 62 P0/P1 items: **33 FIXED · 25 PARTIAL · 3 NOT FIXED · 1 OBSOLETE**. Per-check work is
  real (lock vs card, tile↔page parity, computed variant pass, PNG shots, knob scales).
- **The trust boundary and the pick funnel are still broken.** A non-TTY agent can forge every
  approval. The real operator command crashes. The W4 lock voids W1/W3 and resets GATES from w0.
  The W3 picker the operator chooses from is five blank boxes, and 4 of 5 options cannot pass
  the W3 lock.
- The meta-gates stay green through all of this. No end-to-end W0→W8 golden fixture exists (B §4.7).

## 2. Verification — ORDER-SMOOTHNESS (A), P0 + P1

| ID | Sev | Verdict | Evidence (HEAD file:line · mutation → observed) |
|---|---|---|---|
| F01 | P0 | PARTIAL | Gate has one model: `assemble_layouts` → `preview/layouts.html` (gate.py:1457); W4 CARD is look-only. Docs still teach the old greyscale Phase-B cards: DESIGN-INTAKE.md:102-159, SKILL.md:66, INDEX.md:117,126, rules/P.md:54, W3 CARD:91 `--wireframe <cards/index.html>`, DESIGN-PLAN.md:328 `wf_ref: cards/index.html#…`. |
| F02 | P0 | FIXED | v1 required only `_wave_ge('w5')` (gate.py:3098-3101). A v0 pipeline ran `run.py` w0→w4 to PASS. |
| F03 | P1 | FIXED (docs residual) | `run.py approve w4` → `lock_dna` (run.py:21-34, 72). Docs name three lock waves (N-09). |
| F04 | P0 | FIXED | Premise moved: the page pane is legitimate at w4. Removing `data-pane="page"` → `VG.1 no data-pane="page"`. Stale docstring gate.py:3486-3488. |
| F05 | P0 | **NOT FIXED** | Slices exist (gate.py:2910), but `CORE_FIELDS` includes `version` (gate.py:2900). Approvals bind both slices for every wave (gate.py:4116, 4127). run.py:143 maps waves <w5 to `core`, although structure locks at W3. Observed on a v0 pipeline: approve w4 → core `0bdc99dd`→`11f1b43b` → `run.py w5` REFUSED `P.8 w1 approval stale`, `P.8 w3 approval stale`. After re-approving both: `DNA map changed since w0 was gated … GATES.json reset from w0 on`, so w0–w4 all became `pass:false`. Writing `rhythm` during W3 → `run.py w3` REFUSED `P.8 w1 approval stale` before W3 could gate. |
| F06 | P1 | **NOT FIXED** | The field list was wave-scoped (gate.py:3052), but the C.5 modes loop gate.py:3136-3144 runs at every wave. Deleting `modes` at w1 → `C.5 modes.light missing`. |
| F07 | P1 | PARTIAL | `invariants` required ≥w1 (gate.py:3050). `constraints` is exempt for `new-build` (gate.py:3056-3058), although the W1 CARD:24-25 discovery batch applies to all modes. No knob carries `tier: invariant`, so the invariant-delta ban has nothing to act on. |
| F08 | P1 | FIXED | Signed approvals bind inputs+DNA. `ancestry_fails` checks every predecessor (gate.py:4170-4193). STUB edit → `ORDER: w2 inputs changed`. Side effect: approval churn (N-19). |
| F09 | P1 | FIXED | `check_content_inventory` @w2 requires plan `copy.cta_person`/`reading_level` (gate.py:936-942). Blank → `W2: plan copy.cta_person missing`. |
| F10 | P1 | OBSOLETE | w5 is not approvable. Compositions register on the W6 `system.astro`. Related defect: N-11. |
| F11 | P1 | FIXED (doc residual) | W6 CARD order is components → instances → gate. SECTION-BUILD.md:30-40 chain still lists `gate.py section` first. |
| F12 | P1 | PARTIAL | Gate fixed: w1 ≥3 refs per page type, w3 ≥3 per composition (gate.py:880-898). Stripping refs → `P.14 W1: 1 … page type "home"`. W1 CHECKLIST:17 still demands "≥1 row per composition", which is the impossible ask F12 flagged. |
| F13 | P1 | PARTIAL | Knob vectors are the W4 artefact, but `check_direction_axes` validates enums only (gate.py:1102-1113). `direction.density: spacious` + knob density 0 → w4 PASS, so "derived from knobs" is unenforced. DESIGN-PLAN.md:59 still says "genotype vectors"; DESIGN-PLAN.md:56 puts the axes at W1. |
| F14 | P1 | PARTIAL | W1 CARD:24-25 adds the discovery batch, but there is no CHECKLIST row and `constraints` is ungated for new-build (see F07). |
| F15 | P1 | PARTIAL | w2 inventory checks zone enum, first sentence, R.4 500-char cap and placeholders (gate.py:902-943). The `heading_class` and body blocks promised by the W2 CARD:24-31 are never parsed. |
| F16 | P1 | PARTIAL | Per-slug assembly + SPEC exist (assemble.py:46-56). `check_wireframe_lock` still compares all pages' rows to one card (gate.py:1545-1556): adding `pages.about` → `P.4 row order … != wireframe`. `assemble_spec` filters on `r.get('page')`, which rows never carry (gate.py:2680). |
| F17 | P1 | PARTIAL | Structure genes are now a separate slice, but they are still set in the W1 genotype inside `DESIGN-PLAN.md`, a W1 input. An off-allele composition forces an edit → `ORDER: w1 inputs changed`. |
| F18 | P1 | FIXED | W7 CHECKLIST:16 = static budget. `check_speed_budget` in w7. |
| F19 | P1 | FIXED | W8 CARD has modes, shot naming, sign-review and a variants job. `enforced_by` == WAVE_CHECKS['w8']. |
| F23 | P1 | PARTIAL | `APPROVABLE={w1,w3,w4,w8}` is live (run.py:41). `run.py approve w2` → "not an approval point". Still wrong in docs: INDEX.md:72-73 bans any preview until `SCORECARD.json` (a W8 artefact) exists, which forbids the W3/W4 picks. INDEX.md:53, rules/P.md:121, W0 CARD:51 and W2 CARD:54 teach `gate.py --approve`, which now exits 2 (gate.py:4814). W5 CARD:65, W6 CARD:86 and W7 CARD:89 say "Operator approves". gate.py:5940-5943 comment claims five points incl. "approve the system sheet (locks DNA v1)". |
| F25 | P1 | PARTIAL | Contracts read `vertical_profile` (gate.py:2441). The DM.1 block (rules/DM.md:28-50) still shows non-gate fields and rhythm-as-object (a DM.1-shaped map fails `rhythm names section "surfaces"`). DNA-MAP.md:53 `profile-services/local-service` still ≠ `profile-services`. |
| F26 | P1 | FIXED | Gate and docs both use 0–10. `vector_targets.clarity=11` → `expected 0-10`. |
| F28 | P1 | FIXED | knobs.json `type.base` [16,20]. 15 → `outside [16, 20]`. |
| F29 | P1 | FIXED | `section_py` closed per-tier sets; gutter enum ⊆ G.1. `spacious:112` → `not on the closed scale [96, 128]`. |
| F30 | P1 | PARTIAL | Gate vocabulary is unified (gate.py:70-79). Docs drift: W4 CHECKLIST:19-20 `sparse|balanced|dense`, `p1-sharp…`; M.md M.1 table and DESIGN-PLAN.md:200 lack `none`; DESIGN-PLAN.md:341-342 uses `p2-subtle`. |
| F31 | P1 | PARTIAL | Gate fixed: exactly one interior inverse/brand, density step ≤2 rows (gate.py:1651-1674). A second inverse → FAIL. Docs not fixed: SECTION-CATALOG.md:32,37,158 defaults (promise=inverse, act inverse|brand, act twice) guarantee a fail; SECTION-CATALOG:151 says `inverse ≤ 2`; W3 CARD:66-67 contradicts itself in one bullet; W3 CARD:70 still says "every 3 rows". |

## 3. Verification — DESIGN-MACHINERY (B), P0 + P1

| ID | Sev | Verdict | Evidence |
|---|---|---|---|
| F-01 | P0 | **NOT FIXED** | The only barrier is `isatty()` in run.py:46. (a) `gate.write_approval(ctx,'w1')` (gate.py:4122) has no TTY or pass check: from `python3 -c` it minted a record and `run.py w2` → PASS. A w3 approval was forged before w3 had passed. (b) `script -q /dev/null python3 run.py approve w1 .` cleared the TTY check (the run reached run.py:52). (c) `op_key()` trusts env `DESIGN_GATE_OPERATOR_KEY` (gate.py:4041), and the repo ships the value `fixture-key` (gen_fixtures.py:1154, gate.py:4561). (d) `operator.key` is 0600 but owned by the agent's uid. (e) Fixtures write signed approvals into the real `~/.web-factory`. |
| F-02 | P0 | FIXED | `check_wildcard` is wave-scoped (gate.py:5270-5272). At w3 a pipeline with no w5 artefacts gets no W5 demands. |
| F-03 | P0 | FIXED | `run_wave` → `ancestry_fails` (gate.py:4197). `gate.py w7` on an empty GATES → `ORDER: w0..w6 has not passed`. Residual: the DM.6 reset cascade lives only in run.py, while W7/W8 CARDs teach `gate.py wN`. |
| F-04 | P0 | PARTIAL | P.3/P.4/P.7/P.14/SB.3/VG.3 re-tiered to invariant (selftest asserts this). SB.1, VG.4, DM.4, DM.5 and R.1 are still `structural`, so they are breakable by declaration. |
| F-05 | P0 | FIXED | `check_page_data_attrs` (gate.py:1935-1979) compares all 4 attrs to the locked card. Drop `data-comp` → `P.7 … missing`; ratio change → `!= locked card`; section swap → FAIL. |
| F-06 | P0 | FIXED (residual) | `check_tile_page_parity` @w7 (gate.py:1982). A stray section class → `P.12 … never defined on the system sheet`. The same-stylesheet assertion is dead code (gate.py:2024-2029). |
| F-07 | P0 | PARTIAL | Shots enforced: 6 per page, PNG width = viewport, ≥2000 B (gate.py:2345-2360). Truncation → `not a PNG`. Still forgeable: a non-TTY process signed a REVIEW.json using `op_key(create=True)` → PASS. The HMAC body `nonce|dist|core|reviewer_model` (gate.py:2292-2304) excludes `items`/`modes`, so verdicts can be rewritten after signing and still PASS. |
| F-08 | P0 | FIXED | Pass is computed (gate.py:3602-3643). An out-of-range delta + `pass:true` → `VG.3 … fails a gate`. A deleted Hero.astro with `gate.json pass:true` → `SB.3 Hero.astro missing`. |
| F-09 | P1 | PARTIAL | Exemptions are only `check_astro_build`/`check_mobbin_auth` (gate.py:4627). The exempt count is not printed. Selftest is non-hermetic and FAILS on a clean HOME (N-12). |
| F-10 | P1 | PARTIAL | All rule prefixes and banned tokens are scanned (gate.py:5781-5873), but only `docs/machinery`. No knob↔rule-bound compare. Survivors: "L3" in templates/system-tile/README.md:1,5,9; `gate.py --approve` in 5 docs (F23). |
| F-11 | P1 | PARTIAL | viewBox enforced (gate.py:699). `check_system_enums` still accepts `heroicons|phosphor|feather|custom` (gate.py:1172-1174): `family: heroicons` → PASS. `fill="none"` and linecap are never required. |
| F-12 | P1 | FIXED | I.md:68,191 = `{16,20,24,32,48}` = `ICON_SIZES`. |
| F-13 | P1 | FIXED | `type.base` [16,20]. 15 → FAIL. |
| F-14 | P1 | FIXED | rules/P.md wave refs W3/W6/W7. |
| F-15 | P1 | FIXED | INDEX:15-21 golden rule; DESIGN-INTAKE:320 `site-intake variants` = reference captures only. |
| F-16 | P1 | PARTIAL | system-tile README "L3", decisions.md:5 "pre-L15"; outside the consistency scan. |
| F-17 | P1 | FIXED | DESIGN-INTAKE.md:318-321 rewritten to gated pick. |
| F-18 | P1 | PARTIAL | B.md and the W3 CARD agree (≥5 / 3). The count still varies: rules/VG.md:27,33,105 `[3,5]`, DESIGN-PLAN.md:285 `count: 3 # 5 max`, INDEX.md:65 "≥2 distinct vectors", against gate.py:3497 `!= 3` (N-10). |
| F-19 | P1 | PARTIAL | Code has one approvable set; the docs still disagree (see A F23). |
| F-20 | P1 | FIXED | `check_mobbin_refs` @w1 with table schema, ≥3 per page type. 1 row → FAIL. |
| F-22 | P1 | PARTIAL | Placeholders, first sentence, zone and copy fields are enforced. Body blocks, proof items, FAQ count and the media inventory with ratios are not (see A F15). |
| F-23 | P1 | FIXED | `check_heading_verbatim`: missing vector = FAIL; text, level, order. A mutated H1 → `E.1 … not rendered verbatim`. The H1 size step is not asserted. |
| F-24 | P1 | FIXED | dist `<style>` → `P.2 … 1 <style> block(s)`. |
| F-25 | P1 | FIXED | `class:list` banned; anchored `OUTER_SPACING`; all elements scanned (gate.py:2551-2578). |
| F-26 | P1 | FIXED | dist CSS scanned. `width:400px` → P.13; `min-height:30px` → R.6. |
| F-27 | P1 | PARTIAL | Checklists are clean. DESIGN-INTAKE.md:26 keeps `perf ≥ 90, LCP ≤ 2.5 s`. No CSS-KB or font-count budget. |
| F-28 | P1 | PARTIAL | All 12 rules are now `mode: script`, but `check_measurable` (gate.py:946-1006) implements only T.1, T.11, M.2, M.8 and W.3. T.7, S.3, S.4, V.4, V.8, L.3 and R.5@w7 pass silently, which is false confidence. |
| F-29 | P1 | FIXED | `check_dark_toggle` in w5+w7. Stripping the toggle → `C.5 … no Light/Dark toggle`. |
| F-30 | P1 | FIXED | Breaks are scoped `(rule, where)` (gate.py:5157-5183). |
| F-31 | P1 | PARTIAL | Wildcard structural deltas → `VG.5`. Non-wildcard variants may still change `space.section_py`/`grid.gutter` (`_variant_fails` → []), so the look round can move the locked layout. |
| F-32 | P1 | FIXED* | Operator rows are scored per wave via `approval_state` (gate.py:5372). *The trust root is forgeable (F-01). |
| F-33 | P1 | FIXED | `assemble.py --variants|--layouts`. |
| F-34 | P1 | PARTIAL | ≥5 options + ≥30% are enforced. No greyscale check, no toggle/viewport check on layouts.html, and the generated options are empty (N-02). |
| F-35 | P1 | FIXED | rules/*.md tables are generated from enforcement.json; spot-checked C.3/C.5/G.2/S.5/M.6/R.4. |
| F-41 | P1 | FIXED | `regular:72` → `not on the closed scale [64, 96]`. |
| F-42 | P1 | FIXED | `grid.gutter=40` → `not in [16, 24, 32, 48, 64]`. `density_scale` → `density_step` enum. |

## 4. New findings introduced or exposed by the fixes

| ID | Sev | Evidence | Issue | Fix |
|---|---|---|---|---|
| N-01 | **P0** | run.py:51-52 → gate.py:4174; observed `AttributeError: 'Ctx' object has no attribute 'wave'` (TTY and pty both) | `run.py approve <wave>` crashes for every wave ≠ w0. The only legitimate operator path is dead, so w2+ is reachable only by forging (F-01). No test calls `approve`. | Set `ctx.wave = wave` before `ancestry_fails`. Add an approve e2e fixture. |
| N-02 | **P0** | `assemble_layouts` gate.py:1457-1504; W3 CARD:23-28; INDEX:64 | The "≥5 real responsive page layouts on the real copy" are empty `<section data-*></section>` tags under `<h2>Layout dN</h2>`. They have no copy, no CSS vars, no toggle and no viewport switch. `run.py w3` PASSES on this output, so the operator picks between blank boxes. | Render each option from the W2 inventory + composition exemplars. W3 runs the rendered battery (N-04). |
| N-03 | **P0** | gate.py:1468-1483 pool rotation; observed options | 4 of 5 generated options are unlockable. d2 hero=`quote-grid`, d3 hero=`text-index`. Copying d2 into rows → `run.py w3 --design d2` FAIL: `hero: composition quote-grid not allowed for acts ['act','promise']` + `P.14 0 Mobbin reference(s) for "quote-grid"/"media-gallery"`. The rotation ignores speech acts, D.4 alleles and Mobbin coverage. nav, end-act and footer are identical in all 5 options (2/5 slots differ), so they are not "completely different designs". Only d1, the designer's existing rows, can pass. | Draw options from compositions allowed by speech_act ∩ genotype alleles ∩ Mobbin-cited. Vary order and macro structure. |
| N-04 | P1 | `check_round` gate.py:4642 is in no `WAVE_CHECKS` (gate.py:5879-5919); no CARD/INDEX mentions `gate.py round` | The round gate is orphaned: only selftest runs it on `_base`. The canonical W4 picker from `assemble.py --variants` FAILS `gate.py round … --round 2/3`: `0 knob(s)` pairwise, `R.9 mobile … CTAs`, `P.10 emoji → in picker`. `run.py w4` PASSES on the same file, so two distinctness implementations disagree. | Wire round 1 into w3 and round 2 into w4. Use one distinctness function. Fix the generator (arrow glyph, CTA block). |
| N-05 | P1 | gate.py:4671, 4766; mutation `same.html` | Round-1 distinctness runs only when `data-sec` is present: 5 identical designs → `round1 PASS`. H1/vector checks run only with `--stub`. | Missing `data-sec` = FAIL; make the stub mandatory. |
| N-06 | P1 | gate.py:4686-4706; mutation: v1-scoped head CSS with 4 font families + 4 literal radii → no COHESION line | The per-design cohesion gate only scans inline text inside each block. Generated pickers keep all per-variant CSS in `<head>` `[data-variant-scope]` rules, so cohesion never sees it. | Resolve scoped head rules per design id before counting. |
| N-07 | P1 | W3 CARD:29; gate.py:3764 `data-more-like="knob-nudge"` | "Fine round = 3 knob nudges" after the layout pick changes the look before the W4 look round. Nothing produces nudges, nothing gates them, and the button is inert. | Put fine nudges after the W4 pick (`assemble.py --nudge` + round-3 check in w4), or delete the claim. |
| N-08 | P1 | `assemble_layouts` uses `build_contracts(ctx)` from current rows (gate.py:1463) vs W3 CARD:31-34 | Order loop: options are generated FROM the plan rows, but the rows are defined as a copy OF the pick. After copying d2, re-running `--layouts` produced a different d2 (hero `comparison`) and `VG.4 layouts d1/d2 differ in 1/5`, so the picker drifts under its own lock. | Generate from the W2 inventory. Bind the picker hash in the W3 approval. |
| N-09 | P1 | INDEX.md:26 "W3 locks v1"; INDEX.md:66 + DNA-MAP.md:27 + rules/DM.md:64,71-72 "W5"; run.py:13,22 "w3"; code run.py:72 = w4 | The v1 lock wave is stated as W3, W4 and W5. | Use W4 everywhere. |
| N-10 | P1 | W4 CARD:48 "≥1 knob"; INDEX:65 / DESIGN-PLAN:59 "≥2"; gate.py:3583 "≥3"; VG.md `[3,5]` vs gate.py:3497 `!= 3` | The look-round count and distinctness are stated four ways. | Exactly 3, ≥3 differing knobs; regenerate the docs. |
| N-11 | P1 | gate.py:1359-1365; `check_dark_toggle` returns [] with no preview (gate.py:3450) | "Preview HTML only before W6" is unenforced: w5 checks pass with only `system.astro` and no `preview/system.html` (probe: 0 fails). At w6+ the check prefers the stale preview, so a primitives-only preview → `P.6 component cards-n has no specimen` even when `system.astro` renders it. | w5: require `preview/system.html`. w6+: check `system.astro` only. |
| N-12 | P1 | §0 | Selftest is non-hermetic and red on a clean checkout (scorecard P = 88.8). It depends on approvals minted into the operator's real trust store. | Temp `OPERATOR_HOME` + key inside selftest/gen_fixtures; never write `~`. |
| N-13 | P1 | stage-w4-look/CHECKLIST.md:16-27 | The W4 checklist describes the deleted model: genotype `options:`, `sparse|balanced|dense`, `p1-sharp`, `site/src/pages/look-<n>.astro`, `data-sec` tiles. Honest evidence is impossible, so P.9 blocks w4. | Regenerate from CARD `enforced_by`. |
| N-14 | P1 | rules/DM.md:86-89 vs gate.py:2996-3020, 3621-3627 | Structural-knob deltas are banned only for the wildcard variant, so an ordinary look variant can shift the W3-locked layout. | Apply the tier guard to every vector. |
| N-15 | P1 | enforcement.json T.7/S.3/S.4/V.4/V.8/L.3/R.5 → `check_measurable`; gate.py:946-1006 | Declared script rules have no code, and `coverage` counts them as enforced. | Implement them, or return them to reviewer mode. |
| N-16 | P1 | REVIEW sig body gate.py:2292-2304 | The review signature does not cover `items`/`modes`/`style`; post-signing edits still PASS. | HMAC the whole record minus `sig`. |
| N-17 | P1 | WAVE_INPUTS w1/w3/w4 all hash `DESIGN-PLAN.md` (gate.py:5924-5927); W3/W4/W5 CARDs edit it | Every plan edit stales earlier signed approvals (`P.8 w1 approval stale` on the first W3 edit). The operator must re-approve upstream at every wave. | Hash wave-owned plan subsets or wave-owned files. |
| N-18 | info | uncommitted working tree: `run.py approve --evidence "<text>"`, `approval_state` `no-evidence`/`operator-tty` | The in-flight change adds a non-TTY approval path driven by free text, which widens F-01. Its new selftest block runs `run.py approve` with the real HOME. | Do not ship. Bind approval to something the agent cannot produce (separate uid / OS keychain prompt / operator-held key). |
| N-19 | P2 | gate.py:3774 f-string `{{h}}` | The variants picker marker is the literal `{h}`, so hand-edits cannot be detected. | Interpolate the marker and verify it. |
| N-20 | P2 | gate.py:4737-4738 dead loop; 4745 | Round contrast is checked only if mode blocks are found (7:1 floor); both modes are never required. | Require light+dark; use C.5 floors. |
| N-21 | P2 | gate.py:3244-3247 | Section `structure_hash:` is optional. The docstring's "picker binds VARIANTS hash" is not implemented. | Require it at ≥w6; bind the picker. |
| N-22 | P2 | gate.py:634-644 | P.14 auth accepts any `~/.mobbin-oauth/refresh.sh` that exits 0; an `exit 0` stub passed W1. | Verify an MCP initialize response. |
| N-23 | P2 | gate.py:3054-3055 vs DNA-MAP.md:25 | `rhythm` is written at W3 but required/checked only from w5. | `_wave_ge('w3')`. |
| N-24 | P2 | gate.py:5272 | Standalone `gate.py wildcard` sweeps `('w3','w5')` and skips w4 look violations. | Sweep all waves. |
| N-25 | P2 | gate.py:5342 `compute_scorecard` default `('w3','w5','w6','w7')` | The scorecard never scores w2/w4 rules. | Use the new map. |
| N-26 | P2 | gate.py:1429-1431 "≥50%" vs 0.3; 3422 "W2 options"; 3486-3488 "At W2 … page pane joins at W8"; rules/L.md:151 "60–100px"; DM.md "12 hex" vs 16 | Docstrings and docs went stale in the resequence. | Update them. |

## 5. Answers to the focus questions

- **Pick funnel.** The gate counts are enforced (w3 ≥5 + ≥30%, w4 == 3 + ≥3 knobs). The funnel content is not: the W3 options are blank and mostly unlockable (N-02, N-03); the `round` gate is orphaned, and the generator fails it (N-04); fine nudges come before the look round and have no producer (N-07); and the options are generated from the rows they are meant to produce (N-08).
- **Approvals {w1,w3,w4,w8} + HMAC.** A non-TTY agent can forge approvals four ways (F-01 a–d). The honest path crashes (N-01). The W4 lock and every plan edit void earlier approvals (F05, N-17).
- **Preview HTML before W6 vs Astro final.** Docs agree (INDEX:15-21, rules/P.md:24-28). The gate does not enforce it at w5, and it checks the wrong artefact at w6 (N-11).
- **DNA hash split.** The slices exist, but `version` ∈ core, approvals bind both slices at every wave, and run.py's wave→slice map predates the resequence. The W4 lock therefore forces a w0 restart (F05).
- **Per-design cohesion gate.** It exists only inside the orphaned `check_round`, and it is vacuous for generated pickers (N-06).
- **`gate.py round`.** It runs standalone. It passes 5 identical designs (N-05), fails the official W4 generator output, and no wave calls it (N-04).

## 6. Fix order

1. N-01, F-01 (trust root: the operator approves from a process the agent cannot drive), then F05/N-17
   (`version` out of core; approvals bind only the slice their wave consumed; run.py slice map
   w3→structure).
2. N-02, N-03, N-08, N-04 (a real funnel: rendered, lockable, gated options).
3. N-12 (hermetic selftest) + an end-to-end golden pipeline w0→w8 via `run.py`, with mutants for the
   P0s above, so the meta-gates can see this class of defect.
4. Remaining PARTIALs (mostly doc sweeps: lock wave, `--approve`, W4 checklist, catalogue defaults).
