# ADV-REVIEW — batch 3 re-verification (claimed fixes + new peer gates)

Date 2026-11-19. Source is read-only. Only this file was written.
Input: `research/ADV-REVIEW-BATCH3.md` (F-01…F-28, mutations M/CW/R/W/P/A).
Fix commits under test: `bd73ae0` `1c945a4` `e2d7900` `4c5d5ca` `5d28351` `b9cb315` `f5f8f57` `0601894`, plus new peer gates
`5d28351` (M.9–M.14), `8f99799` (SKL.1/SKL.2), `23c2a86` (trend vocab), `6a0041f` (W2 content inventory).

## Evidence base

- A concurrent session committed during this review (`0601894` → `1fadee8` → `ba2173d`, 12+ commits). One of them,
  `da6d253`, claims more batch-3 fixes (F-11, F-19..F-28). To get stable evidence, I ran every mutation twice, in
  two detached worktrees:
  - **pin A** = `0601894` (the tip of the claimed fix set), `/tmp/wf-rv`
  - **pin B** = `1fadee8`, `/tmp/wf-rv2`. `ba2173d` (the current HEAD) does not touch `gate.py`, `approve_service.py`,
    `run.py` or the fixtures (`git diff --stat 1fadee8 ba2173d -- tools/design-gate/...` is empty), so the pin B
    results are also the HEAD results.
- Harness (throwaway, kept in the eval kernel, not committed). It copies `fixtures/_base` to a temp dir, applies one
  mutation, runs **every** check in `WAVE_CHECKS[wave]`, and reports only the failures that are NEW compared with
  the unmutated baseline. The operator home is a temp dir with a fixture key. Approval tests ran `run.py` /
  `approve_service.py` as subprocesses with `HOME=<tmp>`. The real `~/.web-factory` was not touched.
- Line numbers below are for pin B (HEAD), unless a row says otherwise.

## 0. Meta-gates

| Command | pin A `0601894` | pin B `1fadee8` (= HEAD gate code) |
|---|---|---|
| `gate.py selftest` | PASS rc 0: 219 fixture runs, 110 checks | PASS rc 0: 221 runs, 111 checks |
| `gate.py coverage` | PASS rc 0: 176 rule ids (script 145 / reviewer 30 / operator 1) | PASS rc 0: 179 ids (148/30/1) |
| `gate.py consistency` | PASS rc 0 | PASS rc 0 |
| `gate.py graph` | PASS rc 0: 627 nodes, 3933 edges | PASS rc 0: 652 nodes, 3986 edges |

All four pass at both pins. They still miss every NOT FIXED / PARTIAL row below. `consistency` still does not compare
`enforcement.json` thresholds with the code (see N-6).

## 1. GOOD page (false-positive control)

Fixture: a copy of `fixtures/_base` plus:
- the missing `CHECKLIST/w0,w1,w4,w6,w7,w8.md` (filled evidence),
- a self-contained `preview/system.html` (Light/Dark toggle, head theme script, one specimen per component),
  receipted with `write_receipt`,
- a built `site/dist/home/style.css` that uses the ACSS tokens `--content-width:80rem`, `--text-wrap-heading` and
  `--text-wrap-body`, one registered recipe animation (`ag-bar`, axis-grow), and a
  `prefers-reduced-motion: reduce` block.

| Wave | pin A | pin B |
|---|---|---|
| w0–w4 | PASS (0 failures) | PASS (0 failures) |
| w5 | PASS | **FAIL**, then PASS after a workaround (N-4) |
| w6, w7 | only `P.1 site/node_modules missing` (`check_astro_build`, env-exempt in selftest) | same |
| w8 | **FAIL** `scorecard section A = 88.7`, then PASS after a workaround (N-3) | P = 90.7 → PASS (only P.1 env + P.8 temp-home approval are < 1) |

The minimal good page passes after two workarounds. Each workaround is a false FAIL on legal output (N-3, N-4).

## 2. Batch-3 P0/P1 — re-run of each mutation

FIXED = every listed mutation now FAILs for the right rule. PARTIAL = some mutations FAIL, others still pass.
NOT FIXED = the original mutation still passes, or a false FAIL remains.

| ID | Finding | Mutations re-run (pin A / pin B) | Verdict A | Verdict B (HEAD) |
|---|---|---|---|---|
| F-01 | Anyone mints and spends an approval nonce | A2: a non-TTY `run.py nonce w1` → rc 0, nonce printed. A3: `approve --nonce` → `approved w1`. A10: HTTP `/nonce` + `/approve` with `Content-Type: text/plain` and `Origin: https://evil.example` → `{"ok": true}`. Same at both pins. **A12 (new):** a nonce file forged by the designer, HMAC'd with the same-user-readable `~/.web-factory/operator.key` → `approved w1`. | **NOT FIXED** | **NOT FIXED** |
| F-02 | Provenance test checks only that a nonce field exists | A7: `write_approval(ctx,'w1',nonce='not-a-real-nonce')` → `approval_state=ok`, and then `run.py w2` → `w2 PASS`. `gate.py:6391` is still `not rec.get('nonce')`. | **NOT FIXED** | **NOT FIXED** |
| F-03 | Env-var operator-home bypass | A8: `WF_SELFTEST_OPERATOR_HOME=<own dir>`, self-approve → `ok`, `run.py w2` → `w2 PASS`. Without the env var: `P.8 w1 approval missing`. `gate.py:6315-6316` reads the env var unconditionally at import, so the bypass was renamed, not removed (the f5f8f57 claim "removed outside tests" is false). | **NOT FIXED** | **NOT FIXED** |
| F-04 | PS.11 fails open at W3 | M2: 3 vector H2s (definition/process/cost) in one `macro` row → PASS (3 vectors ≤ 3 non-chrome units). The chrome exclusion works: 4 vectors → FAIL. M1: one section with an h2 + 3 sub-idea `<h3>`s → PASS at W7. Two `<h2>`s in one section → FAIL PS.11 + PS.1 (control). There is still no per-row `len(vector)≤1` rule and no classifier from heading to intent. | **PARTIAL** | **PARTIAL** |
| F-05 | A w4 nonce approval never locks DNA v1 | A11: DNA `version:0` → w1/w3/w4 approved via nonce → `· DNA locked to v1`, `version=1`. A TTY w4 without a nonce → REFUSED. | **FIXED** | **FIXED** |
| F-06 | Lock-point contradiction | Still present: `INDEX.md:46` "W3 locks it to v1"; `INDEX.md:89` W5 "**map locked to v1**"; `rules/DM.md:70` "W5 issues map v1"; `run.py:17` "Approving w3/w4 locks DNA v1"; `gate.py:8620-8621` "five … approve the system sheet (locks DNA v1)" next to `APPROVABLE={w1,w3,w4,w8}`. Only P.md, CARD.md and the code agree on w4. | **NOT FIXED** | **NOT FIXED** |
| F-07 | Any program can satisfy the TTY channel | A9: `pty.fork()` + scripted `APPROVE w1` → `approved w1`, record `by=operator-tty`. | **NOT FIXED** | **NOT FIXED** |
| F-08 | Nonce single-use only tamper-evident; no expiry | Expiry is added (30 min), and the service signature now refuses unsigned edits (control: forged file / backdated `expires` → `nonce not service-issued`). A5: after a consume, setting `used:false` again → **`approved w1` (replay)**. The signature covers the issue-time record (`used:false`), and `consume_nonce` rewrites `used:true` without re-signing, so restoring `false` restores a valid signature. At pin B, `_prune_nonces` deletes used files only at the *next issue*. A5 still replays at HEAD. | **PARTIAL** | **PARTIAL** |
| F-09 | Round distinctness: attribute order / renaming / reordering | R1 control FAIL. R3b: d1 kept, comps of d2–d5 suffixed `-v{i}` → PASS. R4b: d1 kept, d2–d5 rotated → PASS. R2 (`data-comp` before `data-sec`): `check_round` alone returns `[]` (direct call). The wave FAILs only because P.3/VG.4 are also attribute-order dependent and report "0 options / missing attributes". `gate.py:7231` keeps the `data-sec…data-comp` regex and positional `zip_longest` equality. | **NOT FIXED** | **NOT FIXED** |
| F-10 | Look/fine rounds accept identical looks | R6 (3 dead `--zz-*` props) → FAIL P.18 "0 consumed knob(s)". R7 (fine = verbatim look) → FAIL P.18. R6b (the same dummies consumed by a dead `.zz-unused{…var(--zz-a)…}` selector) → P.18 silent; the wave FAILs only on VG.2 DNA↔HTML drift. R7b (fine = look with one knob changed on v1 only; not nudges of the picked variant) → PASS. R7c (fine = look with ids renamed `fv1..fv3`) → PASS: `shared` is empty, so the verbatim test (`gate.py:3448`) is skipped. Nothing reads the pick from the w4 record. | **PARTIAL** | **PARTIAL** |
| F-11 | `_design_blocks` counts `id` + `data-layout` as two designs | `id="dN" data-layout="layN"`: pin A → false FAIL `P.18 ROUND1 designs d1/lay1 identical section list`. Pin B (`da6d253`) → the P.18 false FAIL is gone; only `P.4 design card d1 not in wireframe` remains (the plan `wf_ref #d1` no longer names a block, which is consistent). | **NOT FIXED** | **FIXED** |
| F-12 | B.7 trusts designer declarations | W3 (declared ≠ diff) → FAIL. W3b (zero delta) → FAIL. W5 seed 0 → FAIL. W4b (spliced, not rehashed) → FAIL. **Still pass:** W2 (history deleted, or `[]`). W4 (designer rebuilds a fully re-hashed fake chain: the sha256 has no key). W5b (seed 1, never replayed). W5c (seed = the previous round's seed). Nothing in the toolchain writes `WILDCARD-HISTORY.json` (grep: only `gen_fixtures.py:1007`). | **PARTIAL** | **PARTIAL** |
| F-13 | Dead-column / fold / rail / surface checks are string matchers | **FAIL now:** M7 `min-h-screen`, M12 adjacent `sec-band`/`bg-white`, M9b `flex overflow-x-auto`, M11 control. **Still PASS:** M4 (empty column = `<!-- -->`), M5 (implicit dead half), M6 (CTA below a 1600×2400 image), M7b `h-screen`, M7c `min-h-dvh`, M7d dist CSS `min-height:100svh`, M8 `padding-block-start:60vh`, M9 `overflow-x-auto` without `flex`, M10 `overflow:auto hidden` + `1fr 1fr 1fr 1fr`. There is no measurement pass. | **PARTIAL** | **PARTIAL** |
| F-14 | L.17/L.14 key on Tailwind `py-N` (false FAILs, bypasses) | M13 (`class` before `data-sec`, legal markup) → false FAIL `L.17 … block padding < section-space-m` at both pins. The ACSS class `section-space-m` instead of `py-24` → FAIL P.2 + P.12 + L.17 (SK5b). | **NOT FIXED** | **NOT FIXED** |
| F-15 | ACSS baseline not the default where it executes | **Fixed parts:** starter `global.css` carries `--section-space-*`, `--space-*`, `--content-width(-safe)`, `text-wrap`, 60ch, and no 72rem/75ch. `knobs.json` `space.section_py` = tier names. CW1 20rem → FAIL. CW2 128rem at a 16 px base → FAIL (62.5% detector). **Still broken:** CW3 `min(80rem, 100%)` (the starter's own `--content-width-safe` shape) → "unparseable". The **rendered** content-width branch is dead in-wave: `check_content_width` is wired only at w5 (`gate.py:8563`), and its rendered branch is guarded by `_wave_ge(ctx,'w6')` (`:1460`). M14, M14b (`--content-width:20rem` in dist), and M15 → PASS. A direct call at `wave=w7` FAILs correctly. The **rendered text-wrap** branch is dead too: `check_acss_conventions` is wired only at w6 (`:8571`), and the branch is guarded by `_wave_ge(ctx,'w7')` (`:3543`). Built CSS with no `text-wrap` → PASS at w6 and w7; only the w8 scorecard sees it. | **PARTIAL** | **PARTIAL** |
| F-16 | `enforcement.json` thresholds say 1440 | L.11/L.13/R.8 now say 1280. **The blind replace corrupted R.1:** `enforcement.json:952` `breakpoint ∉ {360,640,768,1024,1280,1280,1920}`, while the code `BREAKPOINTS` and `CANON_BP` contain 1440 (introduced by bd73ae0; diff `-…1280,1440,1920` / `+…1280,1280,1920`). `consistency` still does not diff thresholds. | **PARTIAL** | **PARTIAL** |
| F-17 | A.3 rejects 2 catalog comps; profile values never enforced | `components/editorial.md` and `proof-band.md` exist. `check_component_profile` (`:3662`) still checks only that the file exists. The base fixture's `cards-n` has `data-intent="definition"` against the profile `intent \| proof/detail` (`components/cards-n.md:24`) → PASS. | **PARTIAL** | **PARTIAL** |
| F-18 | G.6 / L.17 whitespace dead on real pipelines | M16 (`CANON-PADDING.json` deleted) → PASS; `check_canon_padding` still `if not cp: return []` (`:2888`). | **NOT FIXED** | **NOT FIXED** |
| F-19 | P.17 receipts unsigned / weaker than the CLI | P1 control FAIL. P2 (edit + rewrite sha) → FAIL "unsigned or badly signed". **Still pass:** P2b (designer re-signs with the same-user-readable `operator.key`). P3 (`GATES.w4.pass=false`, receipt kept) at both pins: B checks the *wave name* only, not pass state. P5/P6 (unreceipted picker at w4 / w3): `check_receipts` is wired only at w7. With no operator key on disk, the signature test is skipped (fail-open). P4 (unlisted `variants-v2.html`): PASS at A, **FAIL at B** (globs `preview/*.html`). | **PARTIAL** | **PARTIAL** |

Tally (P0/P1, 19 rows): pin A FIXED 1 · PARTIAL 9 · NOT FIXED 9. Pin B FIXED 2 · PARTIAL 9 · NOT FIXED 8.

P2 spot checks at pin B (all claimed by `da6d253`):
- F-20 message → FIXED ("2 h2s").
- F-23 `## Done when` duplicated → FIXED (single heading, `CARD.md:63`).
- F-24 `rgb(0 0 0 / 50%)` and `#00000080` → FAIL (FIXED).
- F-28: the nonce registry is pruned at issue, but `~/.web-factory/approvals/` still holds 115 files (listing only).

## 3. New peer gates — mutations

| Gate | Mutation | Expect | Got (both pins) |
|---|---|---|---|
| M.13 | `@keyframes ag-bar` + `animation:` in dist CSS, no reduced-motion | FAIL | **FAIL** `M.13 motion ships without a prefers-reduced-motion block` |
| M.13 | Same, plus a `@media (prefers-reduced-motion:reduce)` block (control) | PASS | PASS |
| M.13 | Same, but the only "reduced motion" is the comment `/* prefers-reduced-motion: later */` | FAIL | **PASS**: substring test (`gate.py:2480`) |
| M.13 / M.6 | Transition-only motion (`transition:transform .6s` + hover `translateY(-8px) scale(1.2)`), no reduced-motion | FAIL | **PASS**: M.13 counts only keyframes/animation; M.6 reads `src/` CSS only |
| M.9 | Unregistered `@keyframes wobble` | FAIL | **FAIL** M.9 |
| M.11 | Registered name animating `width` | FAIL | **FAIL** M.11 |
| M.14 | `gsap` in a 5 KB dist JS | FAIL | **FAIL** M.14 ×2 |
| M.9–M.13 | Animation in an inline `<style>` in dist HTML (no .css file) | FAIL | FAIL, but only via P.2 (stray `<style>`). The motion checks read `.css` files only and return `[]` when there is no dist CSS |
| SKL.1 | Raw colour utility `bg-blue-500` on a `data-skeleton` section | FAIL | **FAIL** SKL.1 |
| SKL.1 | `hover:text-indigo-600` on the section | FAIL | **FAIL** SKL.1 |
| SKL.1 | Raw `bg-indigo-600 text-white rounded-lg p-8` on an **inner div** of a skeleton section (section tag clean) | FAIL | **PASS** in `check_skeleton` (direct call `[]`). Only the `<section>` tag's class is read (`:2647`) |
| SKL.1 | Unknown skeleton id `hyperui/fake/nope` | FAIL | **FAIL** SKL.1 |
| SKL.2 | Skeleton id in plan `refs` | FAIL | **FAIL** SKL.2 (+ LAW.REF) |
| SKL.1 | GOOD skeleton section carrying the repo-required `py-24` | PASS | **FAIL** `SKL.1 raw visual utility ['py-24']` (see N-1) |
| DM trend | `site.trend: glassmorphism-2019` | FAIL | **FAIL** `trend ∉ trends.json` |
| DM trend | `trend: frosted-touch` (control) | PASS | PASS |
| DM trend | Genotype `trend: glassmorphism-2019` | FAIL | **FAIL** (D.1 at w1; DM.3 at w5) |
| DM trend | `trend_year: 2019` | FAIL | **FAIL** |
| DM trend | List form `[{trend: neo-brutal-xx, …}]` | FAIL | **FAIL** |
| W2 inventory | `faq` composition planned, `### FAQ Q&A pairs` table removed | FAIL | **FAIL** `content inventory has no "faq" rows` |
| W2 inventory | `faq` planned, FAQ present (control) | PASS | PASS |
| W2 inventory | FAQ table with header row only, zero data rows | FAIL | **PASS** (N-2) |
| W2 inventory | FAQ row `\| TBD \| TODO \|` | FAIL | **PASS**: no placeholder test on inventory rows |
| W2 inventory | `cards-n` planned, proof table header-only | FAIL | **PASS** (N-2) |
| W2 inventory | Realistic W2 plan (no section rows yet), whole inventory removed | FAIL | **PASS**: the need set comes from W3 compositions, and `check_content_inventory` is wired only at w2 |

## 4. New findings

**P1**

- **N-1 · SKL.1 and L.17 contradict each other: no skeleton-derived content section can pass W7.** SKL.1 bans `py-*`
  (`SKL_RAW_VISUAL`, `gate.py:2495`). L.17 requires `py-N ≥ 24` on every non-hero section. The ACSS alternative
  `section-space-m` FAILs P.2/P.12/L.17 (SK5, SK5b, both pins). Meanwhile, raw colours on inner elements pass SKL.1
  (only the `<section>` tag is read). Net effect: the check blocks the compliant case and admits the abusive one.
  Fix: bind section padding to ACSS tokens in both rules (`section-space-*` on the layer), then scan every
  descendant class of a `data-skeleton` subtree.
- **N-2 · `stub_inventory` returns a table's header row as data.** `rows[1:] if len(rows) > 1 else rows`
  (`gate.py:431`): a header-only table yields `[['Q','A']]`, so every "has rows" test passes on an empty inventory.
  There is no placeholder (TBD/TODO/lorem) filter on inventory cells. The W2 need set comes from `composition`,
  which W3 picks, and the check never re-runs at W3. On a real W2 plan the requirement is empty.
- **N-5 · The candidate tier is designer-controlled (pin B, `475f16e`/`e6abeaf`).**
  - The pipeline-local `CANDIDATES.json` (designer dir) replaces the global registry
    (`_candidate_registry(local) or _candidate_registry()`).
  - `status` is read without verifying `decision_sig` (`_candidate_registry`, `:1839`; no `decision_sig` in its source).
  - `_canon_ref_ok` accepts **any** `http(s)://` URL that is not a known candidate (`:2037`).
  - Measured: an arbitrary URL listed in `MOBBIN-REFS.md` and cited in plan `refs` → no LAW.REF failure at w1/w3
    (CT2). The same URL registered as `pending` → FAIL (CT4). A designer-written `status: approved` → PASS (CT3).
  - The pending-candidate gate therefore stops only honest pipelines.
  - `/promote` shares the HTTP handler that has no Origin/token check (A10).
- **N-7 · The receipt / nonce / approval HMAC key is the same-user-readable `~/.web-factory/operator.key`.**
  b9cb315 and f5f8f57 sign with it, so "service-signed" adds no authority against a same-user agent: P2b and A12
  both pass. `approve_service.py:4-13` says so itself ("tamper-evident, not tamper-proof"). The commit messages
  ("forged files refused") overstate this.

**P2**

- **N-3 · The rendered text-wrap regex false-FAILs minified CSS.** `(?:^|[,{\s])p\s*\{` (`:3553`) does not match `}p{`,
  which is what Vite/Astro emit. The GOOD page FAILed the w8 scorecard (A.1 = 0.66 → section A 88.7) until `}p{` was
  changed to `}\np{`. The branch never runs in-wave (F-15), so the error appears only in the scorecard.
- **N-4 · F-25 specimen regex false-FAILs compact system sheets (pin B, `da6d253`).**
  `<(\w+)[^>]*data-comp="…"[^>]*>(.{0,400})` with `finditer` (`:1626`) consumes the next ≤400 chars, so adjacent
  specimens closer than 400 chars are swallowed and reported as "no specimen". A five-specimen sheet failed P.6 for
  4 of 5 components at w5/w6. It passed once each specimen was padded past 400 chars.
- **N-6 · `enforcement.json:952` R.1 breakpoint set corrupted to `{…,1280,1280,1920}`** by the bd73ae0 1440→1280 replace
  (the code still lists 1440). `consistency` PASSes because it never compares thresholds (the F-16 tail).
- **N-8 · The fine-round verbatim test (`:3448`) runs only when every fine id also exists in the look round.**
  Renaming ids (R7c) or adding a 4th id skips it.
- **N-9 · The rendered content-width and text-wrap checks are dead code inside waves** (wiring wave < guard wave),
  covered under F-15. The pattern is mechanical, so a consistency rule should assert that each check's
  `_wave_ge` floor is ≤ its earliest `WAVE_CHECKS` wave.

## 5. Fix order (suggested)

1. **Approval authority (F-01/02/03/07/08, N-5, N-7):** the key and nonce issuance must come from a secret the agent
   cannot read. Verify the nonce file at `approval_state`. Re-sign or delete on consume. Drop
   `WF_SELFTEST_OPERATOR_HOME` from module import (pass it in from `cmd_selftest`). Verify `decision_sig` and never
   let a pipeline-local `CANDIDATES.json` override the registry.
2. **Dead wiring (F-15, N-9):** wire `check_content_width` at w7 and `check_acss_conventions` at w7, or lower their
   guards. Fix the `}p{` regex (N-3).
3. **Skeleton/padding contradiction (N-1, F-14):** one token-based padding rule; SKL.1 scans the subtree.
4. **W2 inventory (N-2):** drop header rows unconditionally; filter placeholders; re-run the comp-driven need at W3.
5. **Round integrity (F-09/F-10/N-8):** order-free attribute parsing; family edit distance; fine options = pick ± 1 step.
6. **Measurement pass (F-13/F-18).** **Docs (F-06, N-6).**
7. Add every PASS-where-FAIL-expected row above as a `gen_fixtures.py` fail fixture. Today selftest/coverage/
   consistency/graph all PASS while these rows pass.
