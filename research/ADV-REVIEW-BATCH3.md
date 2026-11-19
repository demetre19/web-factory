# ADV-REVIEW — GatedMachinery batch 3 (approval nonce · hash split · pick funnel · operator rules · ACSS)

Date 2026-11-19. Read-only on source. Batches: `12e5ce0` approval nonce service · `548bcb1` hash split + migration ·
`7bed8ae` pick funnel (round wired w3/w4, fine round, W5 rejects Astro) · `bbde086` + `c94fee3` operator rule batches
(B.7, G.5, G.6, L.14, L.15, R.10, PS.11, L.17, P.17) · `e672e11` + `7ccfd0d` ACSS A.1–A.3, 21 profiles, 1280 width.

**Evidence base.** A concurrent session committed 6 more commits during this review (`306ec1b` … `69fd482`) and
regenerated `fixtures/_base` mid-run (one run hit `FileNotFoundError: fixtures/_base`). To get stable evidence, every
mutation was re-run in a detached worktree pinned at **`69fd482`** (`git worktree add --detach /tmp/wf-adv 69fd482`).
None of the 6 later commits touches the checks under review (diff hunks: canon refs, `check_wireframe_lock`,
`check_genotype*`, `assemble_*`, the refs part of `check_round`). Line numbers below are `69fd482`.
Repro script (throwaway, not committed): `/tmp/adv_batch3.py` — copies `fixtures/_base` into a temp dir,
applies one mutation, and reports only the failures that are NEW vs the unmutated baseline. It runs every
check in `WAVE_CHECKS[wave]` (the whole wave, not one check).
Approvals ran in temp operator homes (`WEB_FACTORY_OPERATOR_HOME=<tmp>`).

## 0. Meta-gates (`69fd482`, worktree)

| Command | Result |
|---|---|
| `gate.py selftest` | PASS: 211 fixture runs across 106 checks (rc 0; also PASS with `HOME=<fresh tmp>`) |
| `gate.py coverage` | PASS: 168 rule ids, script=137 reviewer=30 operator=1 |
| `gate.py consistency` | PASS |
| `gate.py graph` | PASS: 604 nodes, 4134 edges, all reachable, no dangling |

All four pass. They miss every finding below: no fixture or mutation exercises these bypasses, and
`consistency` does not compare `enforcement.json` thresholds with the code.

## 1. Verification table (requested mutations + controls)

"Expect" means what the rule text requires. "Got" means NEW failures from the whole wave.

| ID | Mutation | Wave | Expect | Got | Evidence (first new failure) |
|---|---|---|---|---|---|
| M1 | Definition + process + cost + duration merged into ONE section (one h2 + three h3s) | w7 | FAIL | **PASS** | none |
| M2 | Plan row `macro` carries 3 vector H2s (definition/process/cost), `intent: definition`, stub has all 3 | w3 | FAIL | **PASS** | none (PS.11 is an invariant) |
| — | Same merge with 2+ `<h2>` in one block | w7 | FAIL | FAIL | `PS.1 … carries 3 h1/h2` (PS.1, not PS.11) |
| M3 | split-media: img + literal `<div></div>` (control) | w7 | FAIL | FAIL | `L.15 … media sits beside 1 empty column(s)` |
| M4 | Same, with the empty column holding only `<!-- -->` | w7 | FAIL | **PASS** | none |
| M5 | `grid grid-cols-2` with media as the ONLY child (implicit dead half) | w7 | FAIL | **PASS** | none |
| M6 | Hero CTA moved below a 1600×2400 image | w7 | FAIL | **PASS** | none (R.10 is an invariant) |
| M7 | Hero `min-h-screen` | w7 | FAIL | **PASS** | none (A.1 + R.10) |
| M8 | `dist/x.css .sec-band{padding-block-start:60vh}` | w7 | FAIL | **PASS** | none |
| M9 | Desktop rail: `overflow-x-auto` class on the card section | w7 | FAIL | **PASS** | none (G.5) |
| M10 | `overflow:auto hidden` shorthand + `grid-template-columns:1fr 1fr 1fr 1fr` | w7 | FAIL | **PASS** | none |
| M11 | `.rail{overflow-x:auto}` in dist CSS (control) | w7 | FAIL | FAIL | `G.5 r.css: ".rail" scrolls horizontally` |
| M12 | Hero + macro both plain white, adjacent (plan says macro `surface: muted`) | w7 | FAIL | **PASS** | none (L.14) |
| M13 | `class="card-grid py-24"` placed BEFORE `data-sec` (legal markup) | w7 | PASS | **FAIL** | `L.17 … block padding < section-space-m` (false FAIL) |
| M14 | Rendered `<main class="max-w-xs">` (320 px content) | w7 | FAIL | **PASS** | none |
| M15 | Rendered `<main class="max-w-screen-2xl">` (1536 px) | w7 | FAIL | **PASS** | none (1280 ceiling not checked on the build) |
| M16 | `CANON-PADDING.json` deleted (no real pipeline has one) | w7 | FAIL | **PASS** | none (G.6 + L.17 whitespace fail open) |
| CW1 | `grid.content_width: 20rem` | w5 | FAIL | **PASS** | none |
| CW2 | `grid.content_width: 128rem` (ACSS-BASELINE.md literal, 10 px rem) | w5 | PASS | **FAIL** | `content_width 128rem > ACSS 1280px/80rem ceiling` |
| CW3 | `grid.content_width: min(80rem, 100%)` (ACSS `--content-width-safe` shape) | w5 | PASS | **FAIL** | `grid.content_width missing/unparseable` |
| R1 | Round 1: 5 identical section lists (control) | round | FAIL | FAIL | `ROUND1 designs d1/d2 identical section list` |
| R2 | R1 with `data-comp` written before `data-sec` | round | FAIL | **PASS** | none |
| R3 | R1 with comp names suffixed `-v0…-v4` | round | FAIL | **PASS** | none |
| R4 | Same 5 sections, only the order rotated per option | round | FAIL | **PASS** | none |
| R5 | Round 2: 3 identical knob vectors (control) | round | FAIL | FAIL | `ROUND2 designs v1/v2 differ in 1 knob(s)` |
| R6 | Round 2: identical looks + 3 dummy props `--zz-a/b/c` each | round | FAIL | **PASS** | none |
| R7 | Round 3 (fine) = verbatim copy of the round-2 picker | round | FAIL | **PASS** | none (the golden fixture IS this case) |
| W1 | Wildcard `genes=[image.treatment]` twice in a row (control) | w4 | FAIL | FAIL | `B.7 … image.treatment is the sole wildcard change twice in a row` |
| W2 | W1 with `WILDCARD-HISTORY.json` deleted | w4 | FAIL | **PASS** | none |
| W3 | Declared genes `{type.ratio,image.treatment}`, but deltas never touch `type.ratio` | w4 | FAIL | **PASS** | none |
| W4 | Designer adds a fake intermediate round to the history | w4 | FAIL | **PASS** | none |
| W5 | `wildcard_seed: 0` (the `genome.py mutate` default) | w4 | FAIL | **PASS** | none |
| P1 | `variants.html` receipt removed (control) | w7 | FAIL | FAIL | `P.17 preview/variants.html exists without a gate receipt` |
| P2 | `variants.html` edited + designer rewrites its sha in `GATES.json.artifacts` | w7 | FAIL | **PASS** | none |
| P3 | Receipt bound to w4 while `GATES.w4.pass=false` | w7 | FAIL | **PASS** | none (the CLI `gate.py receipt` checks this; the wave check does not) |
| P4 | Unlisted `preview/variants-v2.html` on disk | w7 | FAIL | **PASS** | none (CLI `gate.py receipt` → FAIL rc 1) |
| A1 | `run.py approve w1`, no TTY, no nonce | — | REFUSED | REFUSED | `no interactive terminal and no --nonce` |
| A2 | Non-TTY designer process runs `run.py nonce w1 <dir>` | — | REFUSED | **ACCEPTED** | 32-hex nonce printed |
| A3 | Designer runs `run.py approve w1 <dir> --nonce <own nonce>` | — | REFUSED | **ACCEPTED** | `approved w1 …`, `approval_state=ok` |
| A4 | Replay the same nonce | — | REFUSED | REFUSED | `nonce already used` |
| A5 | Replay after setting `used:false` in `nonces/<n>.json` | — | REFUSED | **ACCEPTED** | `approved w1 …` |
| A6 | w1 nonce spent on w4 | — | REFUSED | REFUSED | `nonce bound to a different wave/pipeline` |
| A7 | `gate.write_approval(ctx,'w1',nonce='not-a-real-nonce')`, then `run.py w2` | — | REFUSED | **ACCEPTED** | `state=ok; run.py w2 rc=0: w2 PASS` |
| A8 | Designer sets `WEB_FACTORY_OPERATOR_HOME=<own dir>`, self-approves, runs `run.py w2` | — | REFUSED | **ACCEPTED** | `w2 PASS` |
| A9 | TTY confirm typed by a program through `pty.fork()` | — | REFUSED | **ACCEPTED** | `state=ok by=operator-tty` |
| A10 | HTTP `/nonce` + `/approve`, `Content-Type: text/plain`, `Origin: https://evil.example` | — | REFUSED | **ACCEPTED** | `{"ok": true, "message": "approved w1 …"}` |
| A11 | w4 approved through the nonce path (picker / chat channel); DNA `version` afterwards | — | v1 | **v0** | `lock_dna` runs only on the TTY branch |
| H1 | 548bcb1: the W4 lock writes `version:1`; w1/w3 approvals stay `ok` | — | ok | ok | `approval_state` w1/w3 = ok after the version flip |

Summary: of 47 rows, 9 are controls that pass as intended (M3, M11, R1, R5, W1, P1, A1, A4, A6), plus H1
and the PS.1 row. The rest are bypasses or false FAILs.

## 2. Findings

### P0

**F-01 · Anyone can mint and spend an approval nonce. P.8 is not enforced.**
Evidence: A2/A3/A10. `run.py:140` (`nonce`) and `approve_service.py:43 issue_nonce` have no caller
authentication. The only gate is `wave ∈ APPROVABLE` + `pipeline is a dir`. The HTTP service has no Origin,
token, or content-type check. A non-TTY agent process runs `run.py nonce w3 <dir> && run.py approve w3 <dir> --nonce N`
and gets a record that `approval_state` scores `ok`. The repo's own selftest (`gate.py:5690–5700`) runs exactly this
sequence as the "happy path". The docs instruct the orchestrator — the same agent the rule distrusts — to mint
nonces (`INDEX.md:71`, `rules/P.md:121`, `stage-w4-look/CARD.md:59`). Real-world signal: `~/.web-factory/nonces/`
holds two w1 nonces for `design-proposals/whistleclean/end-of-lease/pipeline`, minted 44 s apart (12:41:38, 12:42:22),
both used. Nothing in the record can show whether a human approved. [INFERENCE: minted by an agent session.]
Fix: split the minting secret from the agent. The picker "Approve" button must POST a nonce the service issued
**into the rendered picker page only**, bound to the receipt sha of that page. `run.py nonce` must be removed, or
gated by a secret that only the operator's terminal holds (for example, a passphrase prompt read through
`getpass` from `/dev/tty`, with the HMAC key derived from it — never stored in plain text in the agent's HOME).
The HTTP service must require the per-render token and reject cross-origin requests.

**F-02 · The `approval_state` provenance test checks only that a nonce field exists.**
Evidence: A7. `gate.py:5299`: `if rec.get('by') != 'operator-tty' and not rec.get('nonce')`. Any truthy string passes.
The key is readable by the same user (`op_key`, `gate.py:5227`), so `write_approval(..., nonce='x')` produces a
valid record. The selftest itself does this (`gate.py:5865`, `nonce='selftest-nonce'`).
Fix: at check time, require `nonces/<nonce>.json` to exist with `used:true` and with `wave/pipeline/inputs` equal
to the record. Sign the nonce file with the key too. Make the selftest prove that a fake nonce gives `no-provenance`.

**F-03 · `WEB_FACTORY_OPERATOR_HOME` is an env-var bypass, which 12e5ce0 claimed to have removed.**
Evidence: A8. `gate.py:5223` reads the env var. A designer sets it to its own directory, gets a fresh key
(`op_key(create=True)`), self-approves, and every `run.py`/`gate.py` call under that env sees `ok`. The commit text
claims "DESIGN_GATE_OPERATOR_KEY env bypass … removed". The same bypass survives under another name.
Fix: honour the override only inside `cmd_selftest` (pass it in explicitly, not through the environment), or pin
the operator home to `~/.web-factory` and refuse to start when the env var is set outside selftest.

**F-04 · PS.11 (invariant) fails open at W3. A merged process+cost section passes the layout wave.**
Evidence: M2. In `check_intent_sections` (`gate.py:2387–2390`), `units` counts every row, including `nav`/`footer`
chrome. The test is `h2_units > len(units)`, so 3 vector H2s in one row of a 5-row page pass (3 ≤ 5). Nothing derives
an intent per heading. `intent` is one designer-declared value per row and is never compared with the headings'
answer types. At W7 only PS.1 catches the merge, and only if both headings stay `<h2>` (M1 passes with h3s).
Fix: count `units` over non-chrome rows only. Require `len(vector) ≤ 1` per row unless `group` is declared, and require
every grouped row's headings to classify to the row's intent (keyword or answer-type classifier over the heading
text, closed `SECTION_INTENTS`). At W7, count `<h3>` children that carry vector headings from a different row.

### P1

**F-05 · The nonce (picker / chat) approval of w4 never locks DNA v1, so W5 then fails DM.1.** Evidence: A11.
`run.py:93` calls `lock_dna` only on the TTY branch. `approve_service.record_approval` never calls it. The documented
channel (`CARD.md:59`, "`--nonce N` (locks DNA v1)") leaves `version:0`, and `gate.py:4274` then fails W5 with
"DNA map still v0". Because `version` is outside the core hash (548bcb1), a designer "fixes" this by editing
`DNA.json` by hand, and no approval goes stale. The lock is therefore unenforced.
Fix: move `lock_dna` into `record_approval` (both channels). Record the locked version in the w4 approval
record and check it at W5.

**F-06 · Lock-point contradiction across 6 places.** "W3 locks it to v1" (`INDEX.md:43`, `run.py:25` docstring
"W3 approval is the look lock"). "Approving w3/w4 locks DNA v1" (`run.py:16`). W4 (code, `CARD.md:59`, DM.1 message).
"W5 issues map v1" (`rules/DM.md:70`). "**map locked to v1**" at W5 (`INDEX.md:86`). "approve the system sheet (locks
DNA v1) … five operator decision points" while `APPROVABLE` has four waves and no w5 (`gate.py:7376–7380`).
The `run.py` DM.6 comment says "structure from w5", but `WAVE_DNA_KIND['w3']='structure'`.
Fix: one sentence everywhere — "W3 approval locks the structure slice, W4 approval locks the core and writes v1" —
plus a consistency check that greps for these lock phrases.

**F-07 · The TTY channel is satisfiable by any program.** Evidence: A9. `run.py:57` only checks `isatty()`. A pty
(`pty.fork`, `script`, or any agent harness's pty mode) gives a record with `by=operator-tty`.
Fix: same as F-01. The secret must come from the operator, not from the presence of a terminal.

**F-08 · Nonce single-use is tamper-evident only and has no expiry.** Evidence: A5. `consume_nonce` reads, then
writes `used:true` to a user-writable JSON file (`approve_service.py:63`), with no lock (TOCTOU) and no TTL. Flipping
`used` back to `false` replays the nonce.
Fix: delete the nonce file on consume (`os.replace` to a `.used` name under an O_EXCL lock), HMAC the nonce
record, and expire nonces after N minutes.

**F-09 · Round distinctness is defeated by attribute order, renaming, or reordering (P.18 invariant).**
Evidence: R2/R3/R4. `check_round` (`gate.py:5992`) extracts sections with a regex that requires `data-sec` before
`data-comp`. If the regex finds nothing, both the identical and the 30%-distance tests are skipped. Distance is
positional string equality, so suffixing comp names or rotating the order gives 100% "different".
Fix: parse attributes order-independently (reuse `parse_html`). Fail an option with no parsed sections. Compare
the sets and sequence of comp **families** (strip suffixes against `catalog_compositions()`), using an edit distance
over families.

**F-10 · Look and fine rounds accept identical looks.** Evidence: R6/R7. Knob distance counts ANY `--custom-prop`
in the scope (`gate.py:6062`), so 3 dummy props satisfy "≥3 knobs". `check_fine_round` only re-runs round-3 rules on
`preview/fine.html`. It never checks that fine ≠ look, that its options are nudges of the PICKED variant, or that
they differ from each other in knob space. The golden fixture's `fine.html` is `variants.html` with renamed
attributes (`gen_fixtures.py:1258`), so selftest certifies the defect.
Fix: limit knob distance to `knobs.json` token names. Fine round: every option = `pick ± 1 step` on ≥1 knob,
pick id read from the w4 approval record, and option set ≠ the look round's set. Regenerate the fixture from a
real nudge.

**F-11 · `_design_blocks` counts `id` and `data-layout` as two designs (false FAIL on real pickers).** Evidence:
real pipeline `whistleclean/end-of-lease/preview/layouts.html` (`id="d1" data-layout="ledger"`) parses as 8 designs
`['d1','ledger','d2','checklist',…]`, and `gate.py round` reports "d1/ledger identical section list". `assemble_layouts`
emits exactly this shape (`id="d{i+1}" data-layout="{lid}"`) whenever plan options are named. The generator and the
checker disagree.
Fix: one design per `<article>`. Key it by `data-layout|data-design|data-variant`, with `id` as a fallback only.

**F-12 · B.7 trusts designer-written declarations.** Evidence: W2–W5. `check_wildcard_random` (`gate.py:1882`)
uses `wildcard_genes` when present, not the actual `deltas` (W3). A missing history file means "no previous
round" (W2). History is designer-written and nothing in the toolchain produces it (grep: no writer outside
`gen_fixtures.py`) (W4). Any seed passes, including `genome.py`'s default `0` (`genome.py:659`), and the gate never
replays the seed (W5). `genome.py mutate` does not read history ("weighted to unused" is not implemented) and uses
GENOME gene names, not the knob ids that B.7 compares.
Fix: compute genes from `deltas`. Have `gate.py w4` (on pass) append to `WILDCARD-HISTORY.json` and include it in
the w4 receipt. Fail when the history is absent after round 1. Replay `genome.py mutate --seed S` and require
equality. Reject seed 0 or require ≠ the previous seed.

**F-13 · Dead-column, fold, rail and surface checks are string matchers that miss the common forms.** Evidence:
M4/M5 (L.15 needs a comp containing `split` and a literally empty div), M6–M8 (R.10 never measures; the docstring
claims 1280×720/1440×800/375×667, but the code only checks for a CTA's presence, the `py-N` class, and text lengths),
M9/M10 (G.5 reads CSS only, not utility classes in HTML or `overflow` shorthand, and never `1fr 1fr …` or `grid-cols-N`),
M12 (L.14 exempts `default` surfaces, so white-white-white adjacency never fails, and rendered surfaces are never
compared to plan `surface`).
Fix: the screenshot pipeline already renders at 1280/375 (REVIEW shots). Add a Playwright measurement pass
(`capture_pw.py` exists) for R.10 (CTA bbox bottom < viewport height at all 3 sizes), L.15 (grid track with no
painted children), G.5 (`scrollWidth > clientWidth` on non-bleed elements at ≥1024) and L.14 (computed
background of adjacent sections). Keep the regexes as fast pre-checks.

**F-14 · L.17 and L.14 key on Tailwind `py-N` only. They false-FAIL ACSS-native markup and are bypassable.**
Evidence: M13 (`class` before `data-sec` → regex captures attributes after `data-sec` only → "padding < section-space-m"
on a py-24 section). The ACSS token class `section-space-m` → L.17 FAIL (plus P.2/P.12). `\bpy-\d+` matches `py-0`
for L.14. Threshold "~96px" is a fixed px value, while ACSS `--section-space-m` = clamp(72px…120px) at a 10px rem.
Fix: read the computed `padding-block` (render pass, F-13) and compare it with the resolved `--section-space-m` at
that viewport. Parse attributes order-independently.

**F-15 · The ACSS baseline is not the default anywhere it executes.** Evidence:
- `templates/astro/src/styles/global.css` has 0 `--section-space-*` / `--space-*` / `--content-width` tokens. It ships
  `--sp-fluid-s/m/l` (max 4rem), `max-width: 72rem` (lines 116, 134) and `p, li { max-width: 75ch }` (line 66) vs ACSS 60ch.
- `knobs.json` `space.section_py` values stay px (`compact [32,48,64]`, `regular [64,96]`), with the ACSS names only as
  an `acss` annotation. The pickers emit `--space-section_py-regular:64` (fixture variants.html). A DNA with
  `regular: 64` is legal per knobs.json and fails L.17 (≥96) on every content section, so the two sources contradict.
- `check_content_width` is only a ceiling (CW1: 20rem passes) and is checked against the plan string, never the
  build (M14/M15).
- `ACSS-BASELINE.md:45` says `--content-width: 128rem` (10 px rem, 1280 px). The gate multiplies rem by 16, so the
  literal ACSS value fails (CW2), and ACSS's own `min(…)` form is "unparseable" (CW3). The starter has no
  `html{font-size:62.5%}`, so copying ACSS tokens verbatim inflates spacing 1.6×.
- `text-wrap: pretty/balance` exists in the template only. T.8 (`enforcement.json`) claims `check_type_system` enforces
  `text-wrap`, but the function has no `wrap` token (verified via `inspect.getsource`).
Fix: emit the ACSS token block (converted to 16 px rem) into `global.css` and the picker CSS. Make the
`space.section_py` values the tier names. Check `content_width` within [72rem, 80rem] and accept `min()`/`ch` forms.
Check the built container max-width. Add the text-wrap assertion to `check_type_system`, or drop the claim from T.8.

**F-16 · `enforcement.json` thresholds still say 1440.** `L.11 check_content_width "content_width ≤1440px"`, `R.8 "1440
ceiling"`, `L.13 "960/1440 containment"`. The code enforces 1280. `consistency` PASSes because it never compares
thresholds. Fix: update the three rows, and have `consistency` diff numeric thresholds against check constants.

**F-17 · A.3 (invariant) rejects two catalog-legal compositions, and profile values are never enforced.**
`catalog_compositions() − components/*.md = ['editorial','proof-band']`. Any page using them FAILs A.3, even though
D.4/SECTION-CATALOG allow them. A.3's rule text says "values outside the profile FAIL per the type's own thresholds",
but `check_component_profile` (`gate.py:2612`) checks only that the file exists. The fixture's `cards-n` carries
`data-intent="definition"` while `components/cards-n.md` says `intent proof/detail` → passes.
Fix: add the 2 profiles. Give the profiles a machine-readable block (YAML) and check heading rank, CTA count, intent
and padding tier against it.

**F-18 · G.6 and L.17's whitespace clause are dead on real pipelines.** `CANON-PADDING.json` exists only in fixtures
(fd: no other copy; no producer — "PatternMiner" does not exist in the tree). `check_canon_padding` returns `[]`
when the file is missing (M16). Even with the file, its regex needs `style="padding:Npx Mpx"` on `<section>`, which
P.2 bans, so it can never fire on a compliant page. The L.17 "whitespace share" is `1 − text chars / HTML chars`
— a markup-verbosity ratio, not whitespace.
Fix: produce CANON-PADDING.json from the bank (`patterns/tools`) and fail when it is missing at w7. Measure padding
ratios from computed styles (render pass). Compute whitespace share from screenshot pixel occupancy.

**F-19 · P.17 receipts are unsigned designer-writable JSON. The in-wave check is weaker than the CLI.** Evidence:
P2/P3/P4. `GATES.json.artifacts` is in the designer's directory (the same reason approvals were moved out in
B F-01). `check_receipts` (`gate.py:2491`) skips the bound-wave-passed test that `check_receipt` performs, only
covers `ARTIFACTS` paths (P4: `variants-v2.html` invisible), and runs only at w7. The W3/W4 pickers are shown
to the operator long before that. Real pipeline: `whistleclean/end-of-lease` is at w2 with `layouts.html` and
`round1.html` unreceipted (`gate.py receipt` → FAIL for both) and nothing in-wave flagged them.
Fix: HMAC each receipt with the operator key (written by the gate, verified on read). Wire `check_receipts` into
w3/w4 too. Check every `preview/*.html`, not a fixed list. Reuse `check_receipt` logic.

### P2

- **F-20** PS.11 message bug: `f'{len(re.findall(r"<h2\\b", body))} h2s'` (`gate.py:2418`) double-escapes and always
  prints "0 h2s". Seen in the M1a run: `sec macro: 0 h2s (intents ['definition']) share one section`.
- **F-21** In-wave `check_round_gated*` call `check_round` without `stub`, so the E.1 verbatim-heading check in the
  round battery never runs inside a wave (only via the CLI `--stub`).
- **F-22** Dead code `for mode, blk in (('light','dark'),): pass` (`gate.py:6134`).
- **F-23** `stage-w4-look/CARD.md:63` has a duplicated heading `## Done when## Done when`. Its done criterion
  "`GATES.json.w4.approved` is true" is a designer-writable flag. It must be `approval_state(w4)=='ok'`.
- **F-24** A.1 regexes: `rgb(0 0 0 / 50%)` and 8-digit hex bypass the "no rgba()" rule (the starter itself uses
  `rgb(0 0 0 / 0.06)` in `--sh-lift`). `min-height:100svh|dvh|calc()` and `min-h-screen` bypass the min-height ban.
  `enforcement.json` wave for A.1 is w7, but the code wires it at w6.
- **F-25** `check_tile_is_system`: a `preview/system.html` that lists `data-comp="X"` attributes without rendering
  anything satisfies "every component has a specimen". When both the HTML and `system.astro` exist, HTML wins silently.
- **F-26** `approval_state` writes files (the F-05 migration re-signs and rewrites approvals on read). A read-only
  probe mutates operator state. Move the migration to an explicit `run.py migrate-approvals`.
- **F-27** Approval records do not bind the picked design to the rendered picker: `design` is free text
  (`str(design)[:40]`), and the nonce is not bound to the picker's receipt sha. The chosen variant is never folded
  into the DNA core, so the "look lock" hash does not include the pick.
- **F-28** Residue: `~/.web-factory/approvals/*.json` holds 408 legacy `by=operator` records without nonces (now
  `no-provenance`, so harmless but noisy), and `nonces/` is never pruned.

## 3. What a generic, cramped, single-block page can get through

- **One block carrying several ideas**: passes the W3 plan (F-04) and W7 when sub-ideas use `<h3>` (M1).
- **Cramped**: content width 20rem (CW1) or a 320 px rendered container (M14) passes. Section padding passes as soon as
  any `py-24+` class appears first (`py-24 md:py-2` is stopped only by P.12's "class not on system sheet", not by L.17).
  A grid gap without a `gap-N` class is never checked.
- **Generic**: identical round options pass by reordering or renaming (R2–R4). Identical looks pass with dummy props
  (R6). The fine round can be a copy (R7). The wildcard can repeat a default once history is absent (W2).
- **What does hold**: P.7 (page = locked card section count/comps) blocks a literal hero-only page (C7 in the
  exploration run: `P.7 3 page sections vs 5 locked card sections`). PS.1 blocks 2+ `<h2>` per block. P.2 blocks
  inline `style=`. P.12 blocks utility classes not on the system sheet.

## 4. Fix order

1. F-01/F-02/F-03/F-07/F-08: one approval-authority redesign (operator secret, verified nonce file, no env override).
2. F-05/F-06: lock in `record_approval`, plus a single lock sentence in all docs.
3. F-04, F-09/F-10/F-11, F-12: pick-funnel integrity (intent units, order-free round parsing, fine = nudges, B.7 from deltas + gate-written history).
4. F-13/F-14/F-18: one Playwright measurement pass shared by R.10/L.15/G.5/L.14/L.17/G.6.
5. F-15/F-16/F-17: make ACSS the emitted default, fix units, add the 2 missing profiles, sync enforcement.json.
6. Then add each mutation in §1 as a `gen_fixtures.py` fail fixture so selftest stops certifying these paths.
