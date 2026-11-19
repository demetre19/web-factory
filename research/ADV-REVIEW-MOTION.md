# ADV-REVIEW — MotionLib `51649e3` (tamdoma.ai study · taxonomy · classifier · 20 recipes)

Date 2026-11-19. Read-only on source. Scope: `docs/machinery/design/motion/**` (TAXONOMY.md, taxonomy.json,
CLASSIFY-MOTION.md, sources/tamdoma-ai/**) and `templates/motion/**` (20 recipes + `index.html` catalogue + README).

**Method.** Throwaway harness in `/tmp/motion-audit/` (not committed). Playwright Chromium (`chromium-1255`), file:// URLs.

- `audit.py`: one run per recipe with `reduced_motion='no-preference'` and one with `'reduce'`. The harness asserts
  `matchMedia('(prefers-reduced-motion: reduce)')` per run. It exercises the trigger (click for menu-cascade, wheel for
  scroll-draw). Then it collects `document.getAnimations()` with the properties from `effect.getKeyframes()`, takes
  screenshots at t, t+1.2 s and t+2.4 s (% of pixels changed), and reads the CDP `Performance.getMetrics`
  `LayoutCount` delta over 2.4 s. It also measures WCAG contrast of text and SVG paint against the body background
  for OS light, OS dark, and OS dark plus one click on the theme toggle.
- `iso*.py`: plays one animation at a time (or one subset), pauses the rest, and measures LayoutCount per second.
- `static.py`: checks recipe.md frontmatter against `taxonomy.json` axes, counts JS bytes per recipe (inline
  `<script>` + `on*=` attributes) and scans for emoji code points.
- `live.py`, `smil.py`, `blur.py`: run against `https://tamdoma.ai/` with both reduced-motion settings.
- `gate.py graph|consistency|coverage`: run in a detached worktree pinned at `51649e3` and at `51649e3~1`.

## 0. Gates

| Command | `51649e3~1` | `51649e3` |
|---|---|---|
| `gate.py graph` | PASS 559 nodes / 3759 edges | **FAIL** 564 nodes: 5 unreachable + 3 orphan motion nodes (MOT-01) |
| `gate.py consistency` | PASS | PASS |
| `gate.py coverage` | FAIL `check_trend_vocab unreferenced` | same. This failure exists before this commit, so it is not counted here. |

The current working tree (uncommitted edits to `GRAPH.json` and other files, made by another session) crashes
`gate.py graph` with `AttributeError: 'list' object has no attribute 'get'` at `build_graph` → `v.get('wf_composition')`
(gate.py:7991). The crash is not in this commit. Whoever owns that WIP must fix it before committing.

## 1. Verification matrix (Chromium, measured)

`diff` = % of pixels changed between frames (t→t+1.2 s / t+1.2→t+2.4 s). `L/2.4s` = LayoutCount delta over the
same 2.4 s window. Reduce = the same metrics with `prefers-reduced-motion: reduce`.

| Recipe | no-pref diff | anims | L/2.4s | reduce diff | reduce anims | JS bytes | Verdict |
|---|---|---|---|---|---|---|---|
| axis-grow | .029 / .229 | 3 | 6 | 0 / 0 | 0 | 101 (toggle) | OK |
| backdrop-loops | .691 / .702 | 8 | **151** | 0 / 0 | 0 | 101 | MOT-09 |
| blur-reveal | .049 / 0 | 1 (transform only) | 0 | 0 / 0 | 0 | 396 | **MOT-04** |
| clip-conveyor | .124 / .123 | 4 | **149** | 0 / 0 | 0 | 101 | MOT-09 |
| dash-ticker | .113 / .112 | 1 | 0 | 0 / 0 | 0 | 101 | OK |
| draw-icon | .089 / 0 | 5 | 1 | 0 / 0 | 0 | 629 | **MOT-05** |
| draw-icon-loop | .004 / .311 | 4 | 0 | 0 / 0 | 0 | 101 | OK (animates `stroke` colour, MOT-14) |
| line-mask-entrance | 1.895 / 0 | 2 | 2 | 0 / 0 | 0 | 445 | OK |
| menu-cascade | .619 / 0 | 13 | 1 | 0 / 0 | 4 (border-color 200 ms) | 232 | MOT-14 |
| module-stack | .485 / .134 | 4 | 16 | 0 / 0 | 0 | 101 | OK |
| pop-scan | .026 / .312 | 2 | 7 | 0 / 0 | 0 | 101 | OK |
| progress-rig | .179 / .171 | 3 | **149** | 0 / 0 | 0 | 325 | **MOT-06**, MOT-13 |
| radar-pulse | .070 / .067 | 6 | 12 | 0 / 0 | 0 | 101 | OK |
| reveal-fade | .526 / 0 | 2 | 1 | 0 / 0 | 0 | 574 | OK |
| scan-sweep | .091 / .093 | 3 | 4 | 0 / 0 | 0 | 101 | OK |
| scroll-draw | 1.138 / 0 | 5 | 2 | 0 / 0 | 0 | 1123 | **MOT-07** |
| snap-arrange | 1.539 / .212 | 5 | 4 | 0 / 0 | 0 | 101 | OK |
| stamp-check | .017 / .606 | 3 | 50 | 0 / 0 | 0 | 101 | MOT-09 |
| word-cycler | 0 / 0 (2.4 s window) | 5 | 0 | 0 / 0 | 0 | 101 | animates. Per-second sampling over 12 s gave phrase index `[-1,0,0,0,-1,1,1,1,-1,2,2,2]`: blank every 4 s (MOT-16) |
| write-lines | .131 / .026 | 6 | 13 | 0 / 0 | 0 | 101 | OK |

- **Animates:** 20/20 recipes produce running animations under `no-preference`. Two recipes animate less than they
  claim: blur-reveal (the filter does not interpolate) and draw-icon (the ring never draws).
- **Reduced-motion:** 20/20 recipes reach zero frame diff and zero running keyframe animations. scroll-draw still
  keeps a spatial offset (MOT-07). progress-rig freezes on an inconsistent frame (MOT-13).
- **JS:** every recipe is at most 1123 B, well under the 4 KB limit.
- **Text contrast:** every recipe has text contrast ≥ 4.57 in light and ≥ 6.72 in dark.
- **Taxonomy tags:** `static.py` found 1 hard invalid value. MOT-11/12 list the semantic mis-tags.

## 2. tamdoma.ai spot-checks (live, 2026-11-19)

| # | ANALYSIS.md claim | Live result | Verdict |
|---|---|---|---|
| S1 | "**Zero SMIL** … in the shipped DOM" (l.10) | `no-preference`: **86** SMIL nodes (71 `<animate>` + 15 `<animateMotion>`) in 5 SVGs (`circle-svg` 9, `chain-svg` 21 + 23, `mult-svg` 32, `circle-bg` 1). `reduce`: 0, because the site's JS removes them. The commit's own `page.html` contains the same 86 nodes (`grep -o '<animate '` → 71). | **FALSE** → MOT-02 |
| S2 | "13 animated SVGs of 56; 26 defined keyframes" (l.142) | 56 SVGs  OK. 13 SVGs have CSS animation  OK. Counting SMIL too, **17** SVGs animate. **27** keyframes defined. The commit's own `css-keyframes.json` lists 27 names. | **PARTLY FALSE** → MOT-03 |
| S3 | `drift` used but never defined (l.90) | `used_undefined: ["drift"]`. 9 elements compute `drift 14s`. |  OK reproducible |
| S4 | `.focus-reveal` filter transition 1.6 s (l.39) | The filter **snaps** at t=150 ms (`saturate(0.3) blur(14px)` → `saturate(0.82) contrast(1.02)`). Only the `transform` transition exists in `getAnimations()`. | **FALSE as a transition** → MOT-04 |
| S5 | IO `threshold:.08`, `rootMargin 0 0 -10%`; scripts ~2.1 KB; no libs; tokens | `threshold:.08`  OK. `rootMargin:\`0px 0px -10% 0px\``  OK. Scripts 1651 + 466 = 2117 B  OK. gsap/lottie/anime/rive all false  OK. `--ease-out`, `--ease-soft`, `--sage-500` match  OK. `@property --p`  OK. |  OK |

## 3. Findings

### P0

**MOT-01 — `51649e3` breaks `gate.py graph` (P0)**
- Evidence: at `51649e3`, `graph FAIL (564 nodes, 3766 edges)`. Unreachable: `motion/sources/tamdoma-ai/ANALYSIS`,
  `motion-classifier`, `motion-sources-tamdoma-ai-css-keyframes`, `motion-taxonomy`, `motion-sources-tamdoma-ai-svgs`.
  Orphans: ANALYSIS, css-keyframes, svgs. At `51649e3~1`: PASS.
- Cause: the frontmatter links point only outward (`used_in`/`feeds`/`uses`). No existing reachable node links *to*
  the motion docs. The JSON/MD sources have no frontmatter. The 20 `recipe-*` ids are not graph nodes at this commit.
- Fix: add an inbound edge from a reachable node, for example `INDEX.md` or the M-rule doc `consumes: [motion-taxonomy]`.
  Add frontmatter (`id`, `links.evidence_for: [motion-taxonomy]`) to ANALYSIS.md. Register the sidecar JSONs via
  ANALYSIS. Regenerate GRAPH.json, then re-run `gate.py graph` until it passes.

**MOT-02 — the source study missed a whole technique family: 86 SMIL nodes, some animating layout attributes (P0)**
- Evidence: S1. The SMIL `attributeName` histogram in `page.html` is `opacity` 35, `cx` 16, **`width` 14**,
  `fill-opacity` 4, `stroke-dashoffset` 2. The four diagram SVGs (`circle-svg`, `chain-svg`×2, `mult-svg`) do not
  appear in the inventory, the frames, or the recipes. `animateMotion` (path-following) has no recipe and no taxonomy
  property.
- Impact: TAXONOMY.md's "tamdoma reads professional / expressive" rollup and the claim "everything animates
  transform, opacity, stroke-dashoffset, fill-opacity" (l.156) rest on an incomplete inventory. SMIL `width`
  animation is a layout-attribute animation, which the study says does not exist.
- Root cause: the inventory came from computed CSS animation (Step C pattern). SMIL never appears in
  `getComputedStyle` or `getAnimations()`, so the pipeline counts it (Step A `counts.smil`) but never records it.
- Fix: (1) Correct ANALYSIS §header, §Aggregate and the commit-claimed counts. Add a §9 SMIL inventory (5 SVGs,
  per-attribute table, `animateMotion` paths, `begin` offsets). (2) In CLASSIFY-MOTION Step C, emit one record per
  SMIL `<animate*>` group (`technique: smil`, `property` from `attributeName`, `iterations` from `repeatCount`).
  Gate on Step A `counts.smil > 0 ⇒ records with technique smil ≥ 1`. (3) Add taxonomy `property` values for SVG
  geometry attributes (`geometry-attr` covering `cx/cy/r/width/height/x/y`) and `motion-path` (`animateMotion` /
  `offset-path`). Map `geometry-attr` → `budget: layout-risk`. (4) Consider an `animateMotion` path-follow recipe.

### P1

**MOT-03 — ANALYSIS counts contradict the commit's own data (P1)**
- Evidence: ANALYSIS l.142 and the commit message say "26 keyframes". `css-keyframes.json` has 27 names (live: 27):
  `sys-in, bd-turn, bd-flow, belt, blip, scan, pick, stack, b1, b2, b3, wave, snap, write, stamp, st-house, st-draw,
  st-pop, st-lens, st-bar, st-tint, io-need, io-result, rig-p, track-fade, token-fade, spin`. The "13 animated SVGs"
  count excludes the 4 SMIL-only SVGs (total 17). CLASSIFY-MOTION §3's example `"keyframes_defined": 26` repeats
  the error.
- Fix: derive the counts from the JSON sidecars with a script and put the command in ANALYSIS, so the numbers can
  be checked again later.

**MOT-04 — blur-reveal's "focus pull" does not animate: the filter snaps (P1)**
- Evidence: in the recipe, from t=0 after `.in`, the computed filter is already `saturate(0.85) contrast(1.02)` and
  `getAnimations()` returns `['transform']` only. Live tamdoma shows the same (S4). The cause is the function lists:
  `saturate() blur()` → `saturate() contrast()` do not match, so CSS Filter Effects interpolation falls back to
  discrete, and a discrete property gets no transition without `transition-behavior: allow-discrete`.
- Impact: the recipe's headline effect (and the "WARNING layout-risk" justification) never plays. Only the scale moves.
- Fix: use identical function lists on both ends: from `saturate(.3) blur(14px) contrast(1)` to
  `saturate(.85) blur(0) contrast(1.02)`. Re-run `blur.py`. `transitionProperty` must then include `filter` and
  intermediate blur values must appear. Correct ANALYSIS l.39 ("filter … transition") to say the source site has
  the same defect.

**MOT-05 — draw-icon: the ring renders as a solid disc and never draws (P1)**
- Evidence: `.di path{fill:none;stroke:…}` targets `path` only. `<circle class="draw">` therefore keeps the default
  `fill:#000` and `stroke:none`. The `black.py` probe reports `circle.draw[fill]` = black. In the screenshots, light
  mode shows a black disc that hides the ink-coloured check; dark mode shows a black disc on #141412 (contrast
  1.14). The ring's dashoffset transition runs on a stroke that does not exist.
- Fix: change the selector to `.di :is(path,circle)` (or `.di .draw`) so the circle gets `fill:none` and the stroke
  rules. Re-check the light and dark screenshots.

**MOT-06 — progress-rig animates layout every frame (`left`), contradicting its `compositor-safe` tag and README rule 1 (P1)**
- Evidence: `.token{left:calc(var(--p)*100%)}` with `--p` animated by `rig-p` produces **60 layouts/s**. In
  `iso.py`, the rig-p animation alone gives 60/s and the other two give 0/s. The fallback `@keyframes rig-tokfb{0%{left:0}…{left:100%}}`
  animates `left` directly. `taxonomy.json.banned.layout_properties_animated` lists `left`. recipe.md says
  `budget: compositor-safe`. README says "animate transform, opacity, stroke-dash*, fill-opacity only … single
  flagged exception: blur-reveal".
- Fix: put the token in a full-width wrapper and use `transform:translateX(calc(var(--p)*100%))` on the wrapper (or
  `translate: calc(var(--p) * <track-width>)`). Change the fallback keyframes to translateX. Re-measure LayoutCount
  until it is ≈0.

**MOT-07 — scroll-draw reduced-motion fallback leaks ±36 px offsets (P1)**
- Evidence: under `reduce`, the computed cell transforms are `['step is-active none', 'step is-next matrix(1,0,0,1,0,36)',
  'step is-next matrix(1,0,0,1,0,36)']`. The reduce override `.step .cell{transform:none}` has specificity (0,2,0).
  It loses to `.step.is-next .cell` / `.step.is-prev .cell` at (0,3,0). The JS also keeps toggling the classes and
  writing `strokeDashoffset` under reduce.
- Fix: in the reduce block use `.step .cell, .step.is-prev .cell, .step.is-next .cell{transform:none}`, or scope
  the offsets with `@media (prefers-reduced-motion:no-preference)`. Return early from the JS when
  `matchMedia('(prefers-reduced-motion: reduce)').matches`.

**MOT-08 — the CLASSIFY-MOTION `meta.json.motion` block is not part of `meta.schema.json` and nothing validates it (P1)**
- Evidence: `meta.schema.json` has `additionalProperties: true` and no `motion` property. The test took the canon
  meta `https-graff-com/meta.json` and injected `motion.records[0] = {trigger:'undetermined', technique:'jquery',
  budget:'whatever'}` plus `reduced_motion_emulated: true` (the guard that "must be false"). jsonschema Draft7 error
  count stayed **1 → 1**. The single baseline error is unrelated and existed before: `source: 'luxury'` is not in
  the enum.
- Field-level inconsistencies with the schema conventions and with taxonomy.json:
  - Closed-set classifications in meta.schema use `definitions/valued` `{value, confidence, evidence}`. Motion
    records have bare strings and no confidence. TAXONOMY.md l.13 still asks for `other:<reason>` "low-confidence"
    values, and the schema has nowhere to store that confidence.
  - Values the spec emits but taxonomy.json does not define: `trigger:"undetermined"` (§1 D), `detail:"opaque"`
    (§5), `partial:true` (§5), and `libs` values (no closed set; probe key `anime` vs technique `anime-js`).
  - The provenance timestamp is named `scanned_at`, but meta.schema uses `classified_at`.
  - meta.schema says "a non-ok capture may never be … classified". CLASSIFY-MOTION never gates on `capture_status`.
- Fix: add `"motion": {"$ref": "#/definitions/motion"}` to meta.schema.json. Generate the record enums from
  `taxonomy.json` (single source). Make `reduced_motion_emulated` `{"const": false}`. Add `trigger: undetermined`,
  `detail`, `partial` to the taxonomy or drop them. Add a `confidence` field. Require `capture_status == ok` before
  Step A. Add one valid and one invalid motion fixture to the gate selftest.

### P2

**MOT-09 — SVG transform + stroke-dashoffset loops running together cause one layout per frame (P2)**
- Evidence: with all animations running, backdrop-loops and clip-conveyor measure 60 layouts/s. Each animation
  alone measures 0/s. Bisection (`iso3.py`): `turn+1dash` → 61/s; `dash-only` → 0; `items-only` → 0;
  `tick+1item` → 61/s. stamp-check measures 50 per 2.4 s (its windows overlap partly). The cost is SVG-subtree
  layout, not forced synchronous reflow from JS, so it is not thrash. But it contradicts the `stroke-cheap` claim
  that combining these properties is free.
- Fix: in TAXONOMY `budget`, note that main-thread properties (`stroke-dash*`, `fill-opacity`, colour) co-running
  with SVG transforms force per-frame SVG layout in Chromium. In CLASSIFY Step E, record `layout_per_s` from CDP
  `LayoutCount` so the budget comes from measurement, not from the declared properties.

**MOT-10 — taxonomy.json and TAXONOMY.md disagree, and the bans are not wired (P2)**
- `easing_family`: the doc says `custom:<cubic-bezier>`, the JSON says `custom`. The doc's `other:<reason>` escape
  has no slot in the JSON.
- `banned.linear_on_spatial: true`, yet 3 recipes (clip-conveyor translate, backdrop-loops rotate, progress-rig
  track/token) and the CLASSIFY §3 example record (belt, linear translate) ship linear spatial motion with no
  exemption field and no violation output.
- `timing_class` ranges overlap (slow 0.7–1.6 s vs loop-short from 1.5 s; micro/standard share 300 ms) and leave
  <100 ms undefined.
- `js_dependency.light` is "≤ ~2 KB", but nothing enforces it.
- Fix: put the exact grammar in the JSON (`easing_family` pattern `^custom:cubic-bezier\(` and `other:` prefix
  policy). Add `ambient_exempt` (loop_type infinite + purpose ambient) for linear. Make the ranges half-open and
  contiguous. Give the classifier a `violations[]` output per record.

**MOT-11 — invalid or mis-tagged recipe easing (P2)**
- `scroll-draw/recipe.md` `easing_family: ease-soft` is not in the taxonomy (the only hard-invalid tag, from
  `static.py`).
- scan-sweep, snap-arrange, word-cycler and write-lines are tagged `ease-both`, but they use
  `cubic-bezier(.33,1,.68,1)` (easeOutCubic) and, for write-lines' stamp, `cubic-bezier(.19,1,.22,1)`. Both curves
  are ease-out.
- Fix: retag as `ease-out`. Add a frontmatter validator (the `static.py` logic) to the gate.

**MOT-12 — recipe metadata drift: README, catalogue and recipe.md disagree (P2)**
- progress-rig: recipe.md says `js_dependency: light` (it has a `<script>`). The README table and catalogue tag say
  `js:none`.
- menu-cascade: `js_dependency: none`, but the trigger is an inline `onclick` handler (131 B).
- Catalogue tags use non-taxonomy tokens (`transform`, `fill-box`, `clipPath`, `waypoints`, `mask+translate`).
  line-mask-entrance uses `overflow:hidden`, not `mask`.
- `index.html` contains the dead expression `${desc.split('·').map(t=>'').join('')}`.
- Fix: generate the README table and the catalogue `RECIPES` array from the recipe.md frontmatter.

**MOT-13 — progress-rig reduced-motion freezes on an inconsistent frame (P2)**
- Evidence: in the reduce screenshot the fill is at `scaleX(1)` and the token sits at `left:0`. `--p` keeps its
  initial value of 0. README rule: "loops freeze on a representative frame".
- Fix: set `.rig{--p:1}` in the reduce block.

**MOT-14 — non-budget properties animated with no budget flag (P2)**
- menu-cascade transitions `border-color`/`background` (still 200 ms under reduce). draw-icon-loop animates `stroke`
  colour. scroll-draw transitions `visibility`. README rule 1 says only transform/opacity/stroke-dash/fill-opacity
  are animated. The tags for menu-cascade omit `color/background`.
- Fix: list these properties in `property`. Either allow colour transitions ≤ 200 ms explicitly in README rule 1 or
  remove them.

**MOT-15 — the theme toggle does nothing on first click under OS dark; the catalogue toggle does not reach the iframes (P2)**
- Evidence: all 21 pages use `dataset.theme = theme==='dark' ? 'light' : 'dark'`. With OS dark, the first click sets
  `dark` and the page stays dark (`dark+1click` bg `rgb(20,20,18)`). In the catalogue, after the toggle, the parent
  bg is `rgb(20,20,18)` while iframe 1 stays `rgb(244,241,230)`. The draw-icon `.theme` button has no
  colour/border rules (UA default in dark).
- Fix: toggle on the *effective* scheme (`matchMedia('(prefers-color-scheme: dark)')` when `data-theme` is unset).
  The catalogue should postMessage the theme to its iframes or append `?theme=` to their `src`.

**MOT-16 — word-cycler is blank ~0.7 s of every 4 s, and the reduced-motion fallback hides 4/5 phrases from assistive tech (P2)**
- Evidence: each phrase is visible 2–18.6 % of `5×--pass`. The 19.6 % → next 2 % gap is ≈0.7 s with no text
  (sampled `-1` at t=0, 4, 8 s). Under reduce, `.cycle p~p{display:none}` removes the other phrases from the
  accessibility tree. With motion on, screen readers read all 5 phrases stacked.
- Fix: overlap the windows (exit 19.6 % → next phrase enters at 18.6 %). Under reduce, use a visually-hidden class
  instead of `display:none`, or give the cycler `aria-hidden` plus one static sr-only sentence.

**MOT-17 — emoji glyph U+26A0 (WARNING SIGN) in shipped docs and UI (P2)**
- Evidence: `templates/motion/README.md:47`, `templates/motion/blur-reveal/recipe.md:36`,
  `templates/motion/index.html:60` (the catalogue tag text), `docs/machinery/design/motion/CLASSIFY-MOTION.md:26`.
- Fix: replace it with the word `WARNING`/`flag`. The catalogue already shows warnings with the `.tag.warn` class.

## 4. Checks with no finding

- Every recipe animates under `no-preference` (§1).
- Every recipe reaches 0 % frame diff and 0 running keyframe animations under `reduce`.
- No JS read/write interleave was found. scroll-draw reads `getBoundingClientRect` once per rAF, then writes. The
  replay buttons do one deliberate forced reflow per click.
- JS per recipe is 101–1123 B (≤ 4 KB).
- Text contrast is ≥ 4.57:1 (light) and ≥ 6.72:1 (dark) on every recipe.
- Other taxonomy frontmatter keys and values are valid. All 12 axes are present in all 20 recipe.md files.
- Live spot-checks S3 and S5 reproduce.

## 5. Fix order

1. MOT-01: restore graph PASS.
2. MOT-02/03: correct the study, then add SMIL recording to CLASSIFY and to the taxonomy.
3. MOT-04/05/06/07: recipe defects. Re-run `audit.py`/`iso.py`/`blur.py`. Pass criteria: filter interpolates,
   ring strokes, LayoutCount ≈0 for progress-rig, no reduce transforms.
4. MOT-08: add the motion `$ref` to meta.schema.json, generated from taxonomy.json, plus selftest fixtures.
5. P2 items, preferably by generating the README/catalogue from frontmatter and adding a frontmatter validator to
   the gate.
