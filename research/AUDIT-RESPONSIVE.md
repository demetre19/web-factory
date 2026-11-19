# AUDIT-RESPONSIVE — MOBILE-RESPONSIVE-TESTING module (new stage proposal)

The module does not exist. This audit is the proposal: where it sits,
what it checks, what it emits, what it automates, and what must land
before its PRD can be written. Live evidence was gathered from the
Dents Direct reference site (`http://100.84.74.100:4340/`, fetched +
DOM-probed 2026-11-02) and the vendored `templates/astro/` starter.

## 1. Scope audited

Files read:

- `docs/machinery/WEB-FACTORY.md` (pipeline map, failure matrix, OI list)
- `PRD-Web-Factory-2026-10-30.md` §3–5 (stage map, gate model, schemas)
- `research/WEB-FACTORY-S5-DESIGN-DNA.md` (S5a/S5b split, tokens, nav mandate)
- `research/WEB-FACTORY-S6-INTEGRATIONS.md` (registry, `public/` write set)
- `research/WEB-FACTORY-S7-GATE-DEPLOY.md` (13-check SEO gate, tweak loop)
- `research/ADVERSARIAL-REVIEW.md` (prior findings — F4 absent-gate class)
- `research/WEB-FACTORY-SITEMAP-SOP.md` (SOP format this audit mirrors)
- `templates/astro/` starter — `src/components/Header.astro`,
  `src/layouts/BaseLayout.astro`, `src/styles/global.css`,
  `tailwind.config.mjs`, `src/components/Footer.astro`
- prd-herdr checkout `research/WEB-FACTORY-S1-SITEMAP.md` (page_class,
  ancillary matrix)
- Live: `http://100.84.74.100:4340/` — HTML fetched, media queries
  enumerated, DOM probed at 360/768/1024px via the `browser` device.

**Module boundary:** verification of rendered responsive behavior of
the built site — mechanical DOM probes + rendered screenshot review at
N viewport widths per route — sitting after the site is complete
(post-S6 wiring) and before S7's gate/deploy. It *verifies*; fixes
route back upstream per §8.

## 2. Current contract — what the corpus specs today

| Obligation | Where specced | Verified by anything? |
|---|---|---|
| Fluid type scale (`clamp()`, no breakpoint-stepped font sizes) | `WEB-FACTORY-S5-DESIGN-DNA.md:231-239` (build-lane mandate); enforced in starter `global.css:11-31`, `tailwind.config.mjs:19-29` | NO — build-lane self-lint (`:274-285`) checks arbitrary values, remote fetches, route parity — never computed font sizes across widths |
| Functional mobile nav (hamburger → focus-trapped dismissible panel) | `WEB-FACTORY-S5-DESIGN-DNA.md:248-250` | NO — spec is a mandate, not a check; S7's 13 checks (`WEB-FACTORY-S7-GATE-DEPLOY.md:207-221`) cover SEO facts only, no viewport is ever set anywhere |
| `<meta name="viewport">` | `templates/astro/src/layouts/BaseLayout.astro:37` — starter-baked | Indirectly — absent meta would surface as a scrollWidth blowout, but no check reads it |
| No x-overflow, tap targets, grids stack, images contained | nothing — **zero spec surface** | NO |
| DoX packets carry `SYSTEM/RESPONSIVE-RULES.md` | `WEB-FACTORY-S5-DESIGN-DNA.md:104` | Consumed nowhere — the file is listed as a packet member and never named in any distill/build step or check |

Responsive verification is entirely absent from the pipeline: the two
S5 mandates are build-time prose; the DoX `RESPONSIVE-RULES.md`
contract member is unbound; S7's "gate" is a no-viewport SEO checklist.
This is the F4 failure class (`ADVERSARIAL-REVIEW.md:112-133`) one
rung down — an unowned verification stage, except here even the
*contract text* is missing rather than just the spec.

## 3. Discovery-question expansion — the bank this stage must answer

### Source / authenticity
- Where do the **viewport widths** come from? Proposed: a canonical set
  in the module spec (see §5), not S0 answers — the operator doesn't
  know. S0 provides *context* (site_type → mobile-traffic prior), not
  numbers.
- Where does the **page-class checklist** come from? `sitemap.md`'s
  `page_class` column (`PRD §5.2:131`; `S1 spec:110`) — already a
  closed set (`money | article | ancillary`). The module binds each
  class to a checklist; a route that fits no checklist refuses at mint.
- DoX sites: does `SYSTEM/RESPONSIVE-RULES.md` (`S5 spec:104`) add
  per-site checks? Proposed contract: the responsive lane merges packet
  rules as *extra* rows on top of the canonical checklist — the packet
  can tighten, never relax.
- No fabricated facts rule applied here: a screenshot/manifest claim
  must name the exact width × route evidence. A "PASS" without a shot
  row is a fabricated pass.

### Classification
- `site_type` (`local | national | ecom`, `site-brief.md`) modulates
  checklists: `local` raises mobile prior (call/tap targets, NAP
  reachability, mobile form completion); `ecom` would add product-grid
  + cart-class checks [INFERENCE — no ecom run exists yet].
- `intent` (S1's closed set) shapes *visual* expectations: `local`/
  `transactional` pages get CTA-reachability eyes; `informational`
  article pages get readability eyes.

### Competition census (what research must feed this module)
- This module needs a *baseline of the call*, not invented pass lines —
  same posture as "aim high" theme: the responsive checklist thresholds
  (tap-target px, max overflow tolerance 0, readable-measure floor)
  should be validated against what SERP winners actually render.
- Cheapest honest version: during the audit/PRD build, run the sweep's
  probe (§6) against 2–3 top competitor sites fetched live — captures
  what `44px`, drawer patterns, stacking look like on winning pages.
  Dents Direct is the in-house proxy (§7).

### SERP stats
- Not applicable directly — this stage consumes no SERP data — but the
  mechanical probe doubles as the tool that *produces* per-site
  baseline evidence for the checklist itself.

**Named gaps:** no breakpoint authority exists anywhere in the corpus
(`TOKENS.json` claims `breakpoints` as a member —
`WEB-FACTORY-S5-DESIGN-DNA.md:128` — but the starter hard-codes `768px`
in `Header.astro:86` and `640px` in `Footer.astro:41`, un-tokenized);
no artifact convention for screenshots exists (every prior artifact is
prose/JSON); `tools/` directory does not exist yet (`PRD §4.2:107`,
runbook `OI-7` — the whole lint-tool posture is prose-until-tooled).

## 4. Gap findings

| # | Severity | Finding |
|---|---|---|
| F1 | **blocker** | No stage verifies rendered responsive behavior. S5 mandates fluid type + focus-trapped menu in prose (`WEB-FACTORY-S5-DESIGN-DNA.md:231-254`); its self-lint (`:274-285`) checks neither. S7's 13 checks (`WEB-FACTORY-S7-GATE-DEPLOY.md:207-221`) never set a viewport — a site that overflows at 360px ships green. |
| F2 | **blocker** | DoX `SYSTEM/RESPONSIVE-RULES.md` is a declared packet member (`:104`) bound by no step — distill lane copies `SYSTEM/*` flat (`:192-196`) but no check ever executes its rules. Packet-responsive invariants die at the copy boundary. |
| F3 | **major** | Breakpoint authority absent. `TOKENS.json` schema lists `breakpoints` (`:128`); the starter hard-codes `768px` (`Header.astro:86`) and `640px` (`Footer.astro:41`); Dents Direct uses a *scattered* set — `520/640/700/820/900/1060px` observed across 22 media rules (fetched 2026-11-02). Three breakpoint vocabularies, zero agreement, no checker to notice. |
| F4 | **major** | No browser runtime is provisioned for the pipeline. Global npm has `npm`, `corepack` only; `playwright`/`puppeteer` are absent from every `package.json`/`devDependency` in repo and eval runtime; `tools/` doesn't exist (`OI-7`). Chromium binaries do exist in `~/Library/Caches/ms-playwright/chromium-1228/` + `chromium_headless_shell-1228/` — capability without a driver contract. |
| F5 | **major** | Dents Direct — the house style — carries defects a responsive stage would flag: 29 tap targets <44×44px at 360px (menu/close/theme buttons at 38×38; `.btn` chips ~35px tall), no `srcset` on any `<img>` (0 occurrences), remote Google Fonts (violates the self-containment rule re-verified at S7 check 10). Live-probed 2026-11-02 at `100.84.74.100:4340`. |
| F6 | **major** | The Dents Direct drawer has no focus trap — Tab at the last drawer link falls through to the page (observed JS: open/close/Escape/backdrop handlers only, no Tab-cycle logic — S5 spec `:249` *requires* focus-trap). aria-expanded absent; `aria-hidden` toggles instead (observed `mdrawer` script). The vendored starter's `Header.astro:109-165` implements the trap correctly — the house style predates it. |
| F7 | **major** | No artifact convention for screenshots/binary evidence: `site/` artifacts to date are markdown/JSON (`seo-gate-report.md`, `deploy-report.md` shapes, `S7 spec:228-244`). A sweep emits N routes × 4 widths of PNGs — commit policy (git-tracked review surface vs `.gitignore`) is undecided anywhere. |
| F8 | **major** | Failure-routing contract absent. The factory's seam model re-checks existence/count at mint; a responsive finding has *three* candidate owners (S5a tokens, S5b components, S3/S4 content) and the runbook failure matrix (`WEB-FACTORY.md:126-141`) has no row for it. An S5b component fix post-S6 also collides with S6's `integrations.json` row-live re-mint refuse (`S6 spec:85-95`). |
| F9 | **minor** | Dev-server vs built-`dist/` ambiguity for the probe target. Dents Direct emits `data-astro-source-file` attrs + dev CSS in its served HTML — testing a dev server validates a different artifact than what deploys. The S7 principle "verification on a stale dist/ is no verification" (`S7 spec:27-33`) applies identically; the module must serve built `dist/` statically, and the sweep needs a `--dev` mode explicitly marked advisory. |
| F10 | **minor** | Operator-visible evidence is a gap in the tweak loop: `APPROVE SITE` shows the live URL + two prose reports (`S7 spec:74-75`). Responsive screenshots are the natural review surface for the operator's eyeball pass and currently have no path to them. |

## 5. Split / sub-module proposal

**Position: a new stage between S6 and S7 — call it S6R
(`web-responsive-<site>`), one lane per site.** Reasoning:

- **Against inside-S7:** S7's identity is file-local verification +
  host mechanics; its gate is explicitly "every check is mechanical and
  file-local" (`WEB-FACTORY-S7-GATE-DEPLOY.md:150-152`). A DOM probe +
  rendered review is a different check class needing a browser runtime
  S7's contract doesn't carry. Folding it in also hides a full check
  battery inside the tweak loop's re-run cost.
- **Against pre-S6:** S6 adds real DOM — `form.php` target, markup
  mutations are minimal but `public/` assets change. Responsive
  verdicts pre-wiring can go stale the same way a pre-build verdict
  would; post-S6 mirrors "re-verify, never trust" (`S7 spec:104-106`).
- **Against own stage between S5b and S6:** same staleness argument —
  and S6's write set doesn't touch layout-critical files, so the
  S6→S6R→S7 order wastes nothing; the build-lane self-lint already
  gives S5b a fast local signal.

**The stage itself splits into three strictly-ordered passes inside one
lane** (mirroring S4's graph→apply pattern, not separate lanes — they
share live DOM context):

```
sites/<slug>/ ──build──> dist/ ──serve──> PASS 1 sweep (mechanical)
                                              │ findings JSON
                                              ▼
                                    PASS 2 visual (per-class checklist
                                    review of screenshots + live tab)
                                              │
                                              ▼
                                    PASS 3 routing + report
                                    (site/responsive-report.md)
```

- **Pass 1 — sweep.** `tools/responsive_sweep.py` drives headless
  Chromium over CDP against a static-served `dist/`; emits
  `site/responsive/sweep.json` + one full-page PNG per route × width.
- **Pass 2 — review.** The lane reads `sweep.json`, opens flagged
  routes in the `browser` device (per-width emulate), and marks each
  per-class checklist row PASS/FAIL/REVIEW on evidence, not the probe
  alone — screenshots are the audit surface a human can re-check.
- **Pass 3 — report + routing.** Findings table row-routed upstream
  (§8); report commits; done-criteria gate S7's mint.

**Canonical probe widths:** `360, 768, 1024, 1440` — covers the
observed house breakpoint family (≤900 = mobile drawer; ≥901 desktop,
matching Dents Direct's own `min-width: 901px` + starter's `768px`) and
the assignment set. A `page-class` never changes the width set — only
the checklist depth.

## 6. Automation surface

### `tools/responsive_sweep.py` (new `tools/` member — OI-7's second tool)

```text
responsive_sweep.py --site sites/<slug> --dist sites/<slug>/dist \
    --routes-from site/design-dna/ROUTE-MANIFEST.json \
    --widths 360,768,1024,1440 [--dev http://localhost:4321] \
    --out site/responsive/
```

Runtime contract: Python 3 stdlib only for orchestration; the browser
driver is Chromium over CDP (`--remote-debugging-port`) with binary
resolution order: `--chromium` flag → `PLAYWRIGHT_BROWSERS_PATH` /
`~/Library/Caches/ms-playwright/chromium*/` → `chromium`/`chrome` on
PATH. Static serve: `http.server` on `dist/` (single-process, no npm).
`--dev` mode points at any URL but stamps `advisory: true` in output.

**Mechanical checks (auto-PASS/FAIL, no judgment):**

| ID | Check | Probe |
|---|---|---|
| R1 | Viewport meta | `document.querySelector('meta[name=viewport]')` non-empty, contains `width=device-width` |
| R2 | X-overflow | `Math.max(documentElement.scrollWidth, body.scrollWidth) <= innerWidth` at every width; offenders enumerated via `getBoundingClientRect()` right>iw/left<0 walk (proven live — the exact probe ran against Dents Direct at 360px) |
| R3 | Tap targets | every visible `a/button/input/select/[role=button]` rect ≥ 24×24 CSS px (WCAG AA floor); <44×44 → REVIEW row (house-standard deficit, not hard fail — see F5) |
| R4 | Nav collapse | at ≤899px the nav trigger button is `display != none` and reachable (top of viewport, clickable); at ≥900px inline nav links visible. Asserts the drawer contract both sides of the breakpoint |
| R5 | Drawer function | click trigger → panel/dialog becomes visible, `aria-expanded=true` (or `open` attr), `document.body.style.overflow` locked; Escape/close restores. Verifies the S5 `:248-250` mandate mechanically |
| R6 | Focus trap | Tab from last focusable inside open drawer wraps to first (or stays inside panel) — the F6 defect detector. Fail = REVIEW (needs a11y judgment) |
| R7 | Breakpoint coverage | computed-style diff of every `src/styles/components/*.css`-classed element across adjacent widths; a class with **zero** computed-change at any width pair is REVIEW ("unresponsive component" candidate) |
| R8 | Image sizing | every rendered `<img>`: `naturalWidth` vs `getBoundingClientRect().width` ratio >2× → REVIEW (no `srcset`/oversized asset — F5's Dents Direct gap); `alt` presence cross-checks S7 check 11 |
| R9 | Form reachability | on routes carrying a `<form>`: at 360px, fields + submit inside viewport after `scrollIntoView`, inputs ≥44px tall or REVIEW, `type=tel/email` present where brief fields exist |
| R10 | Console errors | page `console.error`/`pageerror` during probe → REVIEW (catches drawer JS breaking under emulation) |
| R11 | Sticky/fixed overlap | `position:fixed|sticky` elements' rects vs main CTA/link rects — overlap of interactive areas → REVIEW |

All probes evaluate via `Runtime.evaluate` on the served page —
zero per-site code, route-agnostic. Screenshots via
`Page.captureScreenshot` full-page per route × width →
`site/responsive/shots/<route-slug>@<width>.png` + `manifest.json`.

**Lane judgment (not automatable):** stacked-grid reading order sanity,
text legibility on real imagery, CTA visual prominence, "looks broken"
screenshot class, per-class checklists below, DoX
`RESPONSIVE-RULES.md` specific invariants (read packet, apply by eye).

### Per-page-class checklists (the pass standard — Pass 2 rows)

Every class first passes the shared bar: no x-overflow (R2), nav
collapses + functions (R4–R6), grids stack at ≤899 (R7), type readable
at 360 without pinch-zoom (fluid floor ~16px — starter `global.css:49`),
every CTA/primary link reachable by scroll + tap (R3/R9).

| Class (sitemap `page_class`) | Extra rows the lane walks |
|---|---|
| `money` | Hero CTA above the fold at 360; quote/contact CTA reachable within one scroll past hero; service cards stack single-column without truncation; trust/KPI rows don't overflow; phone `tel:` link tappable ≥44px [INFERENCE — local-mobile prior]; hero image contained (`R8` + no subject crop) |
| `article` | Body measure readable at all widths (no full-bleed 90ch lines at 1440); images/figures contained with captions intact; `## Related`/TOC nav blocks don't break mid-grid; prose links ≥24px hit area; heading rhythm unbroken (visual cross-check of S7 check 13) |
| `ancillary` | `contact`/`quote`: every form field + submit usable at 360 (labels visible, inputs ≥44px tall, sane focus order — R9); index/`service-areas` pages: link grids stack; `privacy`/`terms`: long-text measure same as article |

Each row is a PASS/FAIL/REVIEW line in the per-route verdict — REVIEW
carries the shot filename so the verdict re-audits without re-running.

### Per-route verdict rows (report table shape)

```markdown
| route | class | 360 | 768 | 1024 | 1440 | verdict | findings |
| /     | money | P P P P | P P P P | P P P P | P P P P | PASS | — |
| /x/   | article | P F R P | ... | REVIEW | R7 .card-grid unresponsive |
```

Each cell = mechanical PASS/FAIL/REVIEW compressed; `findings` cites
`shots/<slug>@<width>.png` + the check ID. Report:
`site/responsive-report.md` — shape mirrors `seo-gate-report.md`
(`S7 spec:228-236`): header line `<site> — <iso> — head <sha>`,
table, `## Iterations`, `## Routed` (upstream-owner table), plus a
`## Shots` manifest block listing every PNG. Screenshots commit under
`site/responsive/shots/` — they are the review surface F7 names
(~routes × 4 × ~300KB ≈ tens of MB per run; bounded, and the only
evidence a reviewer can re-audit without a browser).

## 7. Live reference assessment — Dents Direct as baseline

Probed live 2026-11-02 (`browser` device, 360/768/1024 viewports,
DOM probes on served HTML):

**Reusable as the module's house baseline:**
- Nav collapse at `max-width: 900px` with `.menu-btn` appearing
  (verified: visible at 768, hidden at 1024) — matches the starter's
  drawer contract at a different boundary value.
- Full-screen drawer via attribute toggle `[open]` + CSS transitions,
  backdrop + Escape + close + link-click dismiss, body scroll-lock —
  confirmed live (`document.body.style.overflow === 'hidden'` when
  open). This is the animation posture the factory wants: CSS
  transitions + attribute state, zero animation libs (grep: no
  gsap/framer/lenis in served HTML).
- `prefers-reduced-motion: reduce` global kill — correct pattern,
  reusable verbatim.
- Fluid `clamp()` type/spacing in served CSS (15 clamp rules observed).

**Defects the module exists to catch (F5/F6):** 29 sub-44px tap targets,
no focus trap, no `srcset`, remote fonts. **Verdict: the *pattern* is
the baseline (drawer, fluid type, CSS-transition animation); the
*implementation* is what the sweep would flag.** The starter's
`Header.astro` is already the corrected version (focus trap, `hidden`
attr, `aria-expanded`, 768px boundary) — the module's checks validate
starter-descendants, and Dents Direct would land REVIEW rows on R3,
R6, R8 today. Breakpoint discipline (F3) stays a token problem: the
starter's own `640`/`768` split shows the vocab already drifts.

## 8. SOP skeleton — what `web-responsive-<site>` executes

Numbered steps the lane runs (same skeleton as
`WEB-FACTORY-SITEMAP-SOP.md` — inputs/tools/outputs per step once the
spec lands):

1. **Mint preconditions.** `sites/<slug>/` exists, `integrations.json`
   exists (S6 done), `ROUTE-MANIFEST.json` non-empty, `tools/
   responsive_sweep.py` resolvable + Chromium found. Missing tool or
   runtime → refuse `responsive-runtime-absent`, never downgrade to a
   source-read "review" (§Verdict — prose can't execute this class).
2. **Build + serve.** `npm run build` in `sites/<slug>/`; static-serve
   `dist/`; record `git rev-parse HEAD` + build timestamp — the same
   evidence chain S7 reports carry (`S7 spec:122-126`).
3. **Sweep (Pass 1).** Run `responsive_sweep.py` →
   `site/responsive/sweep.json` + `shots/*.png` + `manifest.json`.
   Tool crash on a route → that route is FAIL-unproven, not skipped.
4. **Visual review (Pass 2).** Open flagged + per-class-checklist
   routes in the `browser` device at each probe width; walk the §6
   class checklists; every verdict cites a shot file.
5. **Route findings (Pass 3).** Write `site/responsive-report.md`:
   verdict table, `## Shots` manifest, `## Routed` owner table per §9.
   FAIL findings name their owner; the lane never fixes source itself.
6. **Commit + report.** `site: responsive <pass|fail>`; `prd_step
   done` names PASS/FAIL/REVIEW counts + routed owners. The stage gate
   refuses S7 mint while unresolved FAILs exist — REVIEWs proceed with
   each named in the report (operator sees them at `APPROVE SITE`).

Failure modes worth naming (mirroring stage-spec style):
- *Tool absent/runtime drift* — refuse at step 1; an honest refuse
  beats an unverifiable pass.
- *`dist/` vs dev-server confusion* — sweep always targets built
  `dist/`; `--dev` output is advisory-only and stamped so (F9).
- *Fix-loop explosion* — routed findings re-touch S5a/S5b/S4, then the
  stage re-runs wholesale; no partial sweeps (stale-per-route evidence
  is the defect the wholesale re-run kills).

## 9. Cross-module contracts + failure routing

**Owes (upstream must deliver):**
- S5a: `TOKENS.json` must actually carry `breakpoints` values (the
  schema claims the member — the starter never populates it); DoX
  `RESPONSIVE-RULES.md` flattened into `design-dna/` top level so the
  lane can bind it (F2).
- S5b: nav trigger + drawer component semantics the probes key on —
  the starter's `wf-menu-button`/`wf-menu-panel` ids are the contract;
  the sweep's R4/R5/R6 selectors should key on ARIA (`aria-controls`,
  `role=dialog`) so non-starter navs still probe [INFERENCE — spec
  decision needed at PRD time].
- S1: `page_class` per route (exists, `:131`) — checklist binding.
- S6: `integrations.json` `form_delivery` transport — R9's form checks
  key on it; a degraded mailto surface relaxes the form-field checks
  but never the tap-target checks.

**Expects from siblings:** S7 adds `responsive-report.md` (non-empty,
no unresolved FAIL) to mint preconditions; S7's tweak loop re-runs the
sweep mechanically per iteration (regression check, not full review) —
re-verification parity with its own `dist/` discipline.

**Routing table (the F8 fix — finding → owner → mechanism):**

| Finding class | Owner | Why |
|---|---|---|
| Breakpoint inconsistent across components; default token wrong; fluid scale broken globally | **S5a** (`design-dna` re-distill) | `TOKENS.json` is the single owner |
| Nav/drawer/component overflow; grid fails to stack; tap targets on component chrome; focus trap | **S5b** (`web-build` defect) | component files are the single definition site |
| Inline HTML/`<img>` inside authored markdown overflowing; content-fixed-pixel tables | **S4 cleanup** or S3 re-write | `content-final/` body is their write set |
| Missing route page / build error at one width | **S5b** (hard) | build integrity |
| Operator-visible cosmetic (spacing feel, hierarchy) | **S7 tweak loop** | the ~10% calibration surface already exists |
| Form-specific layout breakage | **S6** | its markup |

Conflict found: an S5b fix post-S6 changes `sites/<slug>/` — S6's
re-mint refuse (`integrations.json` row `live`) means a routed
component defect can't re-mint S6; the routing table must record
"re-touch without re-mint" — the S6 lane's repair-path clause
(`S6 spec:85-95`, "re-wiring is a repair lane") covers this if the
report names it. The module's report *is* the defect artifact each
owning stage consumes.

## 10. Verdict — what must exist before this module's PRD

1. **A stage identity:** S6R slotting between S6 and S7 (pipeline-map
   edit + runbook row + `skills/s6r-responsive/SKILL.md` mint). The
   contracts §5 proposes are derivable; the *slot* is the decision.
2. **`tools/` directory + CDP driver decision** — `tools/responsive_sweep.py`
   with the §6 runtime contract (stdlib + CDP over local Chromium) is
   the honest minimal surface; a pinned `puppeteer-core` in a
   `tools/package.json` is the fallback. Decide now; the probe needs a
   browser no matter what (F4).
3. **Breakpoint authority landing** — `TOKENS.json`'s `breakpoints`
   member populated by S5a (F3 fix): at minimum `{nav-collapse, stack}`.
4. **Screenshot artifact convention** — `site/responsive/shots/` commit
   policy (F7): propose git-tracked, pruned to latest-iteration-per-route.
5. **S5 spec patch** — flatten `RESPONSIVE-RULES.md` in distill (F2);
   name the drawer ARIA contract the probes bind (F6/F8 seam).
6. **S7 spec patch** — mint precondition + tweak-loop re-sweep clause.

Until 2 lands the module is another prose-lint promise — the exact
smell `ADVERSARIAL-REVIEW.md:252-260` already flagged once: "every lint
claim … is only as strong as lane diligence." This module's whole
point is that responsive verification is the first check class that
*cannot* be prose-executed — you cannot self-lint a rendered 360px DOM
by reading source. Land the tool, then the spec.
