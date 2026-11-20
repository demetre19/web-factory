# Machinery fix plan: copy-driven, machine-planned, unskippable

Status: PLAN, not yet built. Owner of the run: the pipeline. Owner of the choices: the operator (you).

## 0. User rules this plan must satisfy (become `RULES.md`, read by gates)

| ID | Rule (yours) | Enforced by |
|---|---|---|
| U.1 | Copy is the driver; the design fits the copy. | `plan_from_copy.py` derives the sections from the copy; gates I.2, I.4 |
| U.2 | Plans come from machinery steps, never the agent. The machinery ingests the SEO plan (stub) and copy (article). | `copy_ingest.py`; gates I.1, I.3, X.1 |
| U.3 | Light means light: white canvas `#FFFFFF`, light on first paint, OS dark setting ignored. | BRIEF `theme`, BaseLayout script, gates C.5′, T.1 |
| U.4 | Use the provided article verbatim. No invented headings, quotes, stats, logos or eyebrows. | gates I.2, F.1, F.2 |
| U.5 | Follow the SEO SOP model: stage = tool steps in order, then a gate; BLOCKED stops; every gate input was produced by an earlier tool. | `pipeline.py`, gates X.1–X.4 |
| U.6 | The human picks layouts and looks. The agent never approves. | approval channel §6.4, gate X.3 |
| U.7 | Step one discovers the site type, colour scheme and vibe; the result goes into the design DNA. | `discovery.py`; gate D.1 |
| U.8 | One design folder per website (sibling of BLUEPRINTS). Every agent reads only that folder, and `DESIGN-SYSTEM.md` there is the single design reference. | site root layout §2a; gate X.5 |
| U.9 | Every size is fluid: font sizes, section padding, gaps, gutters and spacing are each ONE `clamp()` made by the clamp calculator from a mobile base+ratio (min @320) and a desktop base+ratio (max @content width). | `clamp.py`; gate FL.1 |
| U.10 | Automatic.css (ACSS) is the guide for ANY CSS decision: token names, scales, fluid math, spacing, section padding, gaps, buttons, radius, colour shades, utilities. Diverge only with a written reason in the DNA provenance. | `docs/machinery/ACSS-FLUID-REFERENCE.md`; gates FL.1, AC.1 |

## 1. What broke (evidence)

| # | Defect | Evidence |
|---|---|---|
| 1 | w0 has no producer. Plan, stub, DNA and Mobbin refs were hand-written by the agent. | `pipeline.py:48` `if wave == 'w0': return []` |
| 2 | Receipts don't cover the inputs, so a hand-written plan passes. | `gate.py:8821` `ARTIFACTS` lists previews/SPEC/SCORECARD only |
| 3 | Verbatim checks compare the page to the agent's STUB, not the article. | `heading_verbatim` / `spec_verbatim` read `ctx.stub_vector` from `STUB.md` |
| 4 | Layout options are fixed: d1 = plan, d2–d5 = composition rotations, scores hardcoded. | `gate.py:2517` `data-score="{0.9 - i * 0.05:.2f}"` |
| 5 | A layout pick never reaches the plan. | `gate.py:8937` `entry['design'] = ctx.design_id()`; nothing reads it back into the plan |
| 6 | **A gate forces OS dark-follow.** | `gate.py:7749` C.5 fails when the head has no `prefers-color-scheme`; `templates/layouts/BaseLayout.astro:44` follows the OS |
| 7 | The background was never white. | the hand plan had `bg: "#FAFCFB"` |
| 8 | The agent self-approved. | `/tmp/approve.py` minted nonces through a pty; `/tmp/chain.sh` hardcoded `--design d1` |
| 9 | The agent bypassed the orchestrator. | `/tmp/chain.sh` called `run.py <wave>` à la carte; `pipeline.py` was used only for w7 |
| 10 | **A gate bans pure white.** | DESIGN-SPEC "pure white banned (C.3)": the off-white `#FAFCFB` was forced by a gate, not chosen |
| 11 | No discovery step. The site type, colours and vibe were the agent's guesses (genotype `proof-type: ratings` with no ratings in the copy). | hand-made `DNA.json` |
| 12 | No per-site design home. DNA, TOKENS and the design write-up lived in `/tmp/cleaning/` (wiped on reboot, invisible to other agents). | `ls /tmp/cleaning` |

## 2a. Per-site design folder (sibling of BLUEPRINTS)

```
/Users/apple/Documents/DEV-WORK/DESIGN-SYSTEMS/whistle-clean-australia/
  BRIEF.yaml            operator-owned: sources, brand, theme (light, #FFFFFF)
  RULES.md              operator rules (§0), hash-pinned
  DISCOVERY.md          discovery.py: site type, buyers, conversion, live-site colours, vibe
  DNA.json              discovery + your look pick; single source of truth
  DESIGN-SYSTEM.md      generated from DNA: colours, typography, spacing, radius, motion,
                        components. The ONE reference every agent reads
  TOKENS.json           derived from DNA
  MOBBIN-REFS.md        research bank (screen ids)
  pages/<slug>/         per-page pipeline dir: COPY.json, DESIGN-PLAN.md, STUB.md, site/, shots/, GATES.json
```

Agents and gates are given this folder only. The blueprint folder is read-only source material.

## 2. Target sequence (SOP model: steps → gate → [human])

Site-level waves run once per site. Page waves run per page in `pages/<slug>/`, which reads the site's DNA and DESIGN-SYSTEM.

**Site wave s0 discovery.** `discovery.py` → `DISCOVERY.md` → `dna_from_discovery.py` → `DNA.json` + `TOKENS.json` + `DESIGN-SYSTEM.md`.

`discovery.py` reads:
- from `blueprint.md`: the business, the source context (site type and buyers), conversion points and central entity;
- the live site's CSS: dominant colours and the logo;
- `BRIEF.yaml`: brand and theme.

It maps the site type to a vertical profile and vibe (mood, energy, register). Gate D.1 fails if a DNA field has no DISCOVERY or BRIEF source line, if the canvas ≠ BRIEF, or if a genotype allele contradicts the copy (e.g. `proof-type: ratings` with no ratings in any page COPY).

| Wave | Producer steps (in order) | Writes | Gate (new checks **bold**) | Human |
|---|---|---|---|---|
| w0 ingest + plan | `copy_ingest.py`, `plan_from_copy.py` (pulls site DNA/DESIGN-SYSTEM by hash), `pipeline_emit.py` (scaffold only) | `COPY.json`, `DESIGN-PLAN.md`, `STUB.md`, `DNA.json` (site copy), `CHECKLIST/`, site scaffold | **I.1 source-bind**, **I.2 coverage**, **I.3 plan provenance**, **I.4 copy-shape fit**, **T.1 light canvas**, **X.4 brief-hash**, **X.5 page DNA == site DNA**, existing scaffold | — |
| w1 intake | `assemble.py --candidates` | candidates picker | existing genotype/intent/mobbin + **D.1** | approve (you) |
| w2 inventory | `assemble.py --layouts` | layouts picker | content_inventory (now against COPY.json) | — |
| w3 layout | `layout_options.py`, `assemble.py --layouts` | `LAYOUT-OPTIONS.json`, picker at 1280/768/360 | **L.1 copy-fit options**, **L.2 computed scores**, layout_distinct | **you pick dN** |
| w3 project | `layout_pick.py` (after approval) | plan rows rewritten to the pick | **L.3 plan == picked option** | — |
| w4 look | `assemble.py --variants`, `--fine` | variants picker | existing + **T.1** | **you pick vN** |
| w5 system | `assemble.py --system` | system sheet | existing + **C.5′ light default** | — |
| w6 build | `pipeline_emit.py --build` | site + dist | existing | — |
| w7 evidence | `assemble.py`, `evidence.py` | SPEC, shots 1280/768/360 light | **F.1 copy fidelity**, **F.2 no unsourced quotes**, **T.2 light first paint**, existing 73 | — |
| w8 ship | `repro.py` | `REPRO.json` | **X.1 reproducibility**, **X.2 gate pin**, **X.3 pick records signed**, existing 14 | sign-review |

The orchestrator is the only entry point. `run.py <wave>` refuses unless `PIPELINE_RUN` (a run token written by `pipeline.py` into `RUN.json` with the gate hash) matches (gate X.2).

## 3. Inputs

### 3.1 `BRIEF.yaml` (you own it; the only hand file)

```yaml
page: {route: /guides/school-cleaning-standards/, title_from: article}
sources:
  blueprint: /Users/apple/Documents/DEV-WORK/BLUEPRINTS/whistle-clean-australia
  stub: CONTENT/guides/school-cleaning-standards.md      # the SEO plan
  article: ARTICLES/guides/school-cleaning-standards.md  # the copy
brand: {name: Whistle Clean, accent: "#166F64", secondary: "#00B488",
        phone: "+61 3 7003 2223", logo: /logo.svg}
theme: {default: light, canvas: "#FFFFFF", follow_os: false, dark_toggle: true}
media: [{src: /media/team.jpg, alt: "Whistle Clean cleaner sanitising a work surface"}]
```

There are no copy fields: the copy comes only from the article.

### 3.2 `RULES.md`

§0 table, copied into the pipeline dir by w0. Gates fail if it's missing or edited (hash pinned in `RUN.json`).

## 4. New producer tools

### 4.1 `copy_ingest.py <pdir>` (w0)

Reads BRIEF → stub + article. Writes `COPY.json`:

```json
{"source": {"stub": {"path": "...", "sha256": "..."}, "article": {"path": "...", "sha256": "..."}},
 "title": "...", "meta": "...", "url": "...", "h1": "School Cleaning Standards",
 "lede": "School cleaning standards decide ... scoping a program.",
 "blocks": [
  {"id": "b01", "h2": "What are school cleaning standards?",
   "answer_type": "what · definition", "zone": "macro",
   "answer": "School cleaning standards are **the hygiene ...** – the duties ...",
   "before": ["In Victoria the frame is practical ...", "The standards a business manager writes down answer three questions:"],
   "items": [{"term": "Hygiene", "text": "which surfaces carry germ risk ..."}],
   "after": ["Classrooms sit at the centre ..."],
   "qa": [], "links": [], "line_span": [15, 27]}],
 "links_out": [{"href": "/guides/", "anchor": "all cleaning guides"}],
 "closing": {"text": "A school ready to book a site walk ...", "cta": {"label": "request a school quote", "href": "/contact/"}, "phone": "+61 3 7003 2223"}}
```

The parsing rules are deterministic, with no LLM:
- The first paragraph after an H2 is the `answer`.
- Paragraphs before the first list go in `before`.
- A `- **Term** – text` list becomes `items`.
- A `- **Q?** A` list becomes `qa`.
- Paragraphs after the list go in `after`.
- Markdown links become `links`.
- The answer type and zone come from the stub's `### H2 …` semantic map and `## Heading vector`.

Each text keeps its inline markdown: only `**bold**` and `[a](href)` are allowed.

### 4.2 `plan_from_copy.py <pdir>` (w1)

COPY.json + BRIEF → `DESIGN-PLAN.md` + `STUB.md`.
- The first line of each file is `<!-- GENERATED by plan_from_copy.py from COPY.json sha256:… — do not edit -->`.
- Section order is fixed: nav, hero (H1 + lede), b01…b11 in article order, end-act (closing), footer. This matches the stub's "Vector check".
- The composition comes from the **copy shape** (table below).
- Recipes come from a fixed composition→recipe table in the tool.
- Mobbin refs are picked from `MOBBIN-REFS.md` by composition.
- Surfaces come from the rhythm rule: base/muted alternation, one brand moment at end-act, canvas `#FFFFFF` from BRIEF.
- Nav items are the H2s chosen by zone `macro`. Their labels are a verbatim H2 or the stub anchor; nothing is invented.
- Footer links come from the stub's `## Internal links OUT` table, using the exact anchors.
- **Forbidden output:** eyebrow, attrib, quotes, logo-wall, stats. These are emitted only when the article or BRIEF contains them, and this article has none.
- DNA rhythm is written through `dna_apply.py`, the sanctioned writer.

The STUB.md it writes reproduces the SEO stub's heading vector verbatim (H1 + 11 H2 + FS), so the existing ~200 checks now verify against the real plan.

#### Copy shape → composition (this article)

| Block | H2 | Answer type (stub) | Copy shape (article) | Composition: default / allowed alternates (w3 options) |
|---|---|---|---|---|
| hero | School Cleaning Standards | — | H1 + 1 lede sentence | stacked-hero / split-media (BRIEF media) |
| b01 | What are school cleaning standards? | definition | answer + 2¶ + 3 term-items + 1¶ | editorial-with-list / split (text + 3 cards) |
| b02 | Where the requirements come from | provenance | answer + 4 term-items + 1¶ | cards-n(4) / text-index |
| b03 | The areas a school clean covers | enumeration | answer + 6 term-items + 3¶ | cards-n(6, 3-col) / text-index |
| b04 | The duties a school cleaner carries | enumeration | answer + 1¶ + 4 term-items + 3¶ | cards-n(4) / editorial-with-list |
| b05 | What are the 6 basic cleaning steps in a school? | enumeration (ordered) | answer + 6 ordered items + 1¶ | sequence(6) / numbered cards-n(6) |
| b06 | Do janitors clean classrooms every day? | boolean | answer + 1¶ | editorial (answer-first) / short-answer pair with b07 |
| b07 | What is a cleaner at a school called? | name | answer + 1¶ | editorial / short-answer pair with b06 |
| b08 | How many hours does a school need per week? | duration | answer + 3¶ | editorial long-form / split-media |
| b09 | How does a school stay clean between visits? | process (gap element) | answer + 4 term-items + 2¶ | cards-n(4), emphasised surface / sequence |
| b10 | Who runs standards-aligned school cleaning in Melbourne? | bridge | answer + 2 link items | split-media (BRIEF media) + link list / link-grid |
| b11 | What questions do business managers ask? | faq | intro + 7 Q&A | faq (all 7, open) / faq two-column |
| end-act | (closing paragraph) | conversion | 1¶ + CTA anchor + phone | form-panel, brand surface |

A short-answer pair keeps both H2s and puts them side by side; no heading is merged or renamed.

### 4.3 Templates: full-copy slots

Each content composition accepts `{heading, answer, before[], items[], after[], qa[], links[]}` and renders `**` as `<strong>` and `[a](h)` as `<a>`. No paragraph of the article is dropped. Gate F.1 checks this in both directions.

Templates changed: editorial, cards-n, sequence, faq, split-media, text-index, link-grid, form-panel. `pipeline_emit._instance` passes the slots through unchanged.

### 4.4 `layout_options.py` (w3) and `layout_pick.py`

- Options d1–d5 are built only from the **allowed alternates** column above. No option may use a composition outside a block's allowed set.
- Options must differ structurally (layout_distinct).
- Score = copy fit, computed per option:
  - item count vs grid columns: no orphan rows;
  - text length vs measure;
  - adjacent-surface monotony;
  - fold content at 1280/360.

  The score formula sits in the tool, and its inputs are written to `LAYOUT-OPTIONS.json`.
- The picker shows each option at 1280 / 768 / 360 (existing skeleton frames).
- `layout_pick.py` reads the approved `design` from the operator record and regenerates the plan rows for that option through `plan_from_copy.py --option dN`. So the pick is projected by the producer, not by hand.

## 5. New and changed gates

| ID | Wave | Fails when |
|---|---|---|
| I.1 source-bind | w0+ | `COPY.json` source hashes ≠ current stub/article sha256; or COPY.json ≠ re-run of `copy_ingest.py` (byte compare) |
| I.2 coverage | w0 | any stub heading-vector H2 is missing from the article or vice versa; any article paragraph/list item/QA is not in some block |
| I.3 plan provenance | w1+ | `DESIGN-PLAN.md` / `STUB.md` ≠ `plan_from_copy.py --option <recorded pick or d1>` output (any hand edit fails); generated stamp hash ≠ COPY.json hash |
| I.4 copy-shape fit | w1, w3 | a block's composition is outside its allowed set; item count ≠ rendered item slots |
| L.1 copy-fit options | w3 | an option uses a disallowed composition, or two options are structurally identical |
| L.2 computed scores | w3 | `data-score` ≠ the score recomputed from `LAYOUT-OPTIONS.json` inputs |
| L.3 pick projected | w3+ | plan rows ≠ the approved option's rows |
| F.1 copy fidelity | w7 | rendered `main` text (headings, p, li, dt/dd, summary) has a sentence not found verbatim (after markdown strip and whitespace normalisation) in the article; **or** an article sentence is absent from the render. Chrome is exempt: nav, footer, form labels and the toggle. |
| F.2 no unsourced quotes | w7 | any `blockquote`, `figure > figcaption`, `cite`, or quote-grid exists and its text isn't in the article |
| T.1 light canvas | w1+ | DNA/TOKENS light `bg` ≠ BRIEF `canvas` (`#FFFFFF`) |
| C.5′ light default | w5+ | the head script reads `prefers-color-scheme` for the initial mode while BRIEF `follow_os: false`, or the initial mode ≠ BRIEF `default` (replaces the old C.5 clause at `gate.py:7749`) |
| T.2 light first paint | w7 | a shot taken with the OS dark emulated and empty storage renders a body bg ≠ `#FFFFFF` |
| X.1 reproducibility | w8 | `repro.py` re-runs every producer in a scratch copy from BRIEF + sources + recorded picks; COPY/PLAN/STUB/DNA/TOKENS/dist html differ byte-for-byte |
| X.2 gate pin | all | `sha256(gate.py, RULES.md, BRIEF.yaml)` ≠ `RUN.json` pin; or the wave was not invoked by `pipeline.py` (run token) |
| X.3 approvals by operator | w3, w4, w8 | the approval record's channel is not `operator-tty` from your terminal, or the nonce was minted by a non-interactive parent (the pty-wrapper pattern) |
| X.4 brief-hash | all | `BRIEF.yaml` changed since w0 without `run.py reset w0` |
| P.17 (extended) | all | `COPY.json`, `DESIGN-PLAN.md`, `STUB.md`, `DNA.json`, `LAYOUT-OPTIONS.json` lack a producer receipt |

`heading_verbatim` and `spec_verbatim` keep running, but now against the generated STUB, which is itself bound to the SEO stub by I.3. So the chain is article → COPY → STUB → page.

## 6. Anti-bypass design

0. **Real-build previews (Option A).** Every picker the operator sees renders through the same emit machinery as the final page — no mock renderer. `preview_build.py` emits per-option Astro pages (`site/src/pages/preview/lo-<oid>.astro` at w3, `look-<vid>.astro` at w4, `system.astro` at w5), clones the vendored toolchain, runs ONE `astro build`, then writes a thin shell (`preview/layouts.html` / `variants.html` / `fine.html` / `system.html`: caption + tabs + pick buttons + viewport bar) that embeds each built page in an `<iframe>` (viewport toggle = iframe width 1280/768/375; the real page's media queries make it respond). `approve_service.py` rewrites the iframe `src` to `/built/<pipeline-path>` on serve. The gates read the built pages' `data-sec`/`data-comp`/`data-ratio`/`data-disclosure` (Section.astro emits them) — parsers read real rendered markup, components are never touched. `_section_mock` and the `mock-*` CSS are deleted; a fake or hand-built preview cannot pass because the picker bytes hash the built pages.
1. **Reproducibility (X.1)** catches any file the agent made or edited, whatever route it took.
2. **Run token + gate pin (X.2).** `pipeline.py` writes `RUN.json` `{token, gate_sha, rules_sha, brief_sha, started}`. `run.py` refuses without a matching token. Editing `gate.py` mid-run fails every later wave.
3. **Receipts (P.17 extended).** Inputs are now artifacts.
4. **Approvals — picker-page clicks (X.3, user decree).** The human makes exactly TWO choices: the layout (w3) and the look (w4), each by clicking a card in the picker page that `approve_service.py serve` renders. The pipeline runs to the pick wave, prints the picker URL and stops (or polls with `--wait`); when the signed pick record exists, the next run continues. w1/w2/w5–w8 advance automatically on a PASS — no approval record.
   - **Signing model.** The service holds an Ed25519 seed at `~/.config/web-factory/approval-signing.key` (0600, auto-created on first start — no keygen step). Its public half is pinned at `tools/design-gate/approval_pubkey.json` (sha pinned per-run in `RUN.json.approval_pubkey_sha256`) and mirrored to `~/.config/web-factory/approval-public.key` so sandboxed environments verify too. `approval_key.verify_approval(rec)` accepts a signature under either public key; Gates' X.3 calls it for every w3/w4 record plus `verify_consumed_nonce`.
   - **Record path.** Only the service's `/approve` handler writes a record. Serving `/picker?pipeline=..&wave=w3|w4[&kind=layouts|variants|fine]` mints one single-use nonce bound to the canonical (realpath) pipeline dir + wave + current input hashes, and injects a script that binds the page's OWN pick control (`button.pick[data-d]` — "Pick this layout" / "Pick this look"). A click POSTs `{wave, pipeline, nonce, design}` with `X-WF-Page-Token`; the design must be an option in the rendered HTML; the record is Ed25519-signed over `{wave, inputs, dna, by='operator-service', design, nonce, run, ts}`. Viewport-size buttons, tabs and card bodies record nothing. `POST /confirm` re-signs the SAME design against the current inputs + this run's token — machinery rebind after projection or a re-run, never a second human choice.
   - **Pipeline order (w3).** The recorded pick is projected through the producer (`layout_pick.py`) *before* the gate — L.3 compares `LAYOUT-OPTIONS.pick` to the approval, so an unprojected pick can never pass. With no pick, the gate runs first (L.3 is neutral while `pick == LAYOUT-OPTIONS.pick`), then the run prints the picker URL and stops. `_pick()` only returns the design of a *verified* record, so a forged record cannot steer projection.
   - `write_approval`/`record_approval` called outside the handler cannot produce a verifiable record: the nonce must be a consumed ledger event, the design must exist in the served page, and `verify_approval` re-checks the signature. The pinned `approval_pubkey.json` is written only when absent, so a service started under another `HOME` never clobbers the production pin.
   - `RUN.json` also pins `tools_sha256` (every `tools/design-gate/*.py`) and `templates_sha256` — a patched producer mid-run fails X.2/check_run_pin. The pipeline starts the pick surface *before* writing `RUN.json`, so first-start key provisioning cannot "appear mid-run".
   - **Honest limits (accepted).** The seed is a same-uid-readable file, so an agent that reads `~/.config/web-factory/approval-signing.key` can mint verifiable records, and any local process can fetch `/page-token` + `/picker` and POST `/approve` — records are tamper-evident, not tamper-proof. **The required enforcement layer is the harness tool fence** (like of-machinery's `lane-fences.js` tool_call hook): deny agents (a) reading the seed/public-key files, (b) POSTing to `127.0.0.1:4173` (`/nonce`, `/approve`, `/confirm`, `/promote`), and (c) writing `approval_pubkey.json` or the approvals registry. Within those limits the bindings stand: single-use ledger-bound nonces, page-token on every mutation, options-bound designs, and per-run signed input+run-token hashes — a forged record always requires breaking the fence, never just calling Python.
5. **Honest limit.** Same-user processes can, in principle, forge anything on one machine (approve_service.py documents this). These gates make shortcuts **detectable and failing**, not impossible. The reproducibility check is the strong one.

## 7. Test strategy

1. **Fixtures for each new rule** in `gen_fixtures.py` (pass + fail pair), redteam style. Each failure case is the exact shortcut it targets:
   - a hand-edited plan row;
   - an invented eyebrow;
   - a fake quote;
   - a missing article paragraph;
   - `#FAFCFB` canvas;
   - an OS-follow script;
   - a hardcoded score;
   - an unprojected pick;
   - a gate edited after pin;
   - a stale COPY.json.
2. **Selftest** `python3 -X pycache_prefix=/tmp/pc tools/design-gate/gate.py selftest` must PASS. Existing fixtures that encode OS-follow are regenerated, not kept.
3. **Loop** (`tools/design-gate/test_loop.sh`): wipe a scratch copy of the site folder except BRIEF/RULES → `pipeline.py` on it → run to the first PAUSE or BLOCK → on BLOCK fix the **producer** → repeat. Max 10 iterations. Each iteration's result is logged to `LOOP-LOG.md`, and the loop is clean when w0–w2 clear twice in a row from scratch.
4. **Mutation pass:** after a clean loop, apply each shortcut from (1) to the real pipeline dir and confirm the right gate fails. Then revert by re-running the producer.

## 8. Adversarial review

A reviewer subagent with no context from this session gets the plan, the diff and the pipeline dir, and is told to make a non-article sentence or a hand edit reach dist with all gates green. Attack list:
- edit the plan / STUB / COPY / DNA directly;
- edit `gate.py`;
- call `run.py` directly;
- mint an approval;
- inject copy via BRIEF media alt or nav labels;
- hide text from F.1 (CSS content, aria-label, `<template>`, SVG text);
- drop article paragraphs;
- reorder sections;
- dark first paint via storage or class.

Each successful bypass becomes a fixture plus a gate fix, and the loop re-runs.

## 9. Acceptance criteria

- [ ] `/Users/apple/Documents/DEV-WORK/DESIGN-SYSTEMS/whistle-clean-australia` contains no file that X.1 cannot reproduce from BRIEF + sources + your recorded picks.
- [ ] The page renders the H1, lede, all 11 H2s in stub vector order, and every article paragraph, list item and Q&A, verbatim. F.1 passes both directions.
- [ ] No quote, stat, logo, eyebrow or tagline that isn't in the article or BRIEF.
- [ ] First paint is light with a `#FFFFFF` body bg, including on a dark-mode OS (T.2 shot). The toggle still offers dark.
- [ ] The layout and look are the ones **you** picked in the picker, and the plan reflects that pick (L.3).
- [ ] Selftest PASS. Loop clean twice from scratch. Adversarial review findings closed.
- [ ] Shots at 1280 / 768 / 360 viewed. DECISIONS.md and RULE-LEDGER updated.

## 10. Build order

1. BRIEF + RULES + `copy_ingest.py` + I.1/I.2.
2. Templates full-copy slots + `plan_from_copy.py` + I.3/I.4/T.1.
3. Theme: BaseLayout script, C.5′, T.2, fixture base regen.
4. `layout_options.py` + `layout_pick.py` + L.1–L.3.
5. F.1/F.2.
6. RUN.json/X.2, P.17 extension, `repro.py`/X.1, X.3.
7. Fixtures + selftest.
8. Test loop.
9. Adversarial review → fixes → loop.
10. Your picks at w1/w3/w4.
11. w5–w8.
12. Report.
