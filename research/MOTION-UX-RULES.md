# MOTION-UX-RULES — measurable motion & interaction rules for the style space

Date: 2026-11-19. Read-only research. Scope: every motion / interaction rule
that can be *measured* on a rendered site and expressed as a deviation axis in
`patterns/data/style-space.json`, plus the psychology/UX laws that set the
baselines.

`style-space.json` rows carry `{id, baseline, unit}` where the site value is
expressed in *units of deviation* (e.g. `R.1` unit `240.0` px —
`docs/machinery/design/patterns/data/style-space.json:1-83`). The "Baseline
value" column below names the canon value the deviation is computed against;
"unit" suggestions appear where the natural deviation unit is non-obvious.

## Existing machinery — what already exists (reuse, don't rebuild)

| Piece | Path | What it already fixes |
|---|---|---|
| Canon motion rules | `docs/machinery/design/rules/M.md` (M.1–M.14) | personalities, duration/easing tokens, element-class rules, one-focal-animation, parallax license, reduced-motion, compositor budget, 4 KB JS budget, recipe registration, dead-keyframe ban |
| Closed classification vocab | `docs/machinery/design/motion/TAXONOMY.md` + `taxonomy.json` | 14 axes: trigger, technique, property, budget, m_type, purpose, timing_class, easing_family, loop_type, complexity, js_dependency, status, personality_fit, motion_tier |
| Measurement pipeline | `docs/machinery/design/motion/CLASSIFY-MOTION.md` | Chromium scan → `meta.json.motion` with `records[]`, `layout_per_s` (CDP LayoutCount), frame-diff liveness, dead-keyframe sweep, SMIL pass |
| Recipe library | `templates/motion/**` (25 recipes + README) | per-recipe taxonomy frontmatter, reduced-motion fallback, ≤~1.1 KB JS each |
| Source studies | `docs/machinery/design/motion/sources/{tamdoma-ai,lexdemos-astromaxsp}/ANALYSIS.md` | real-world measured motion profiles (tamdoma 27 keyframes + 86 SMIL nodes; astromaxsp GSAP/Lenis vocabulary) |
| Verified defects | `research/ADV-REVIEW-MOTION.md` | Playwright-measured truth: SMIL invisibility, SVG transform+dash per-frame layout (MOT-09), discrete filter snap (MOT-04), `left`-animation 60 layouts/s (MOT-06) |
| Genome gene | `patterns/data/genome.json:90-93` | `motion-tier` ∈ {static, subtle, expressive, cinematic} already harvested per site |
| Touch/hover baselines | `docs/machinery/design/rules/R.md:135-141` | targets ≥44×44 touch / ≥32×32 pointer, 8–16px gaps, `@media (hover:hover) and (pointer:fine)` hover guard |

Key implication for style-space: **every measurable row below is producible
from `meta.json.motion.records[]` + computed styles** — the classifier already
emits duration, easing, trigger, property, budget, and `layout_per_s` per
animation.

---

## CANON LAW — universal rules (mechanical, measurable, uncontested)

### Duration & timing

| Rule | The rule | Measurable? | Baseline value | Confidence | Source |
|---|---|---|---|---|---|
| Duration bounds | Most UI animations live 100–500ms; >400ms reads as slow, >500ms as drag; "far more common to be too long than too short" | yes — `duration_ms` per record vs closed timing classes | timing_class axis already closed: `instant [0,100)`, `micro [100,300)`, `standard [300,400)`, `structural [400,700)`, `slow [700,1600)`, loops ≥1.6s (taxonomy.json, TAXONOMY.md) | high | NN/g Laubheimer 2020 (`nngroup.com/articles/animation-duration`); M.2 (M.md:50-54); taxonomy |
| Instant-feedback floor | Simple feedback (toggle, checkbox) ≈ 100ms total — the lower bound of perceivable motion; <100ms reads as a state flip, not motion | yes — `duration_ms`; <100ms records land `timing_class:instant` | 100ms floor for feedback; [0,100) = instant | high | NN/g (same); taxonomy `instant` class; M.2 `micro` starts at 100ms |
| Exits faster than entrances | Disappearing elements run shorter than appearing ones (NN/g: popup 300ms in / 200–250ms out; Material: leaving 195ms vs entering 225ms mobile) | yes — pair enter/exit records on same element; ratio `dur_exit/dur_enter < 1` | exit ≈ 75–85% of enter (NN/g example: 200/300≈0.67–0.83; Material 195/225≈0.87) | high | NN/g; Material M1 duration spec; M.2/M.3 (M.md:51, 73-75) |
| Response-time cliff | 0.1s feels direct-manipulation; 1.0s keeps flow of thought; 10s max before attention lost | partially — measurable as `interaction_latency` (event→first visual change) only with scripting; per-animation duration is the static proxy | feedback ≤100ms feels instantaneous; transitions must complete well under 1s | high | Nielsen response-time limits (`nngroup.com/articles/response-times-3-important-limits`) |
| Doherty threshold | Interactive loop pace <400ms keeps user/system from waiting on each other | yes — aggregate `duration_ms` distribution of feedback-triggered records | ≤400ms for the dominant feedback loop | medium-high (industry folklore grounded in IBM 1982 study) | lawsofux.com (Fitts/Hick related items); widely cited |
| Skeleton/progressive delay | Content placeholder shows only after ~500ms of wait (don't flash skeletons on fast loads) | yes — time-to-skeleton vs time-to-content from trace | 500ms gate before skeleton appears; M.3 fixes `500ms delay then 0→100%` | medium | M.3 (M.md:76); NN/g "avoid unnecessary spinners on fast ops" convention |
| Milestone cap | Celebratory/success animation ≤1500ms | yes — max `duration_ms` on `purpose:feedback`/`milestone` records | ≤1500ms (M.2 `milestone`) | high | M.2 (M.md:54); taxonomy `slow` [700,1600) |
| Loop period floor | Ambient loops ≥ ~6s period; tamdoma backdrops run 14–360s; word-cyclers share one period (6s) | yes — `iterations:infinite` + `duration_ms` | ambient `loop-ambient` ≥10s preferred; `loop-short` [1.6,10)s tolerated for icon loops; 3s pulse for licensed idle nudge | high | ANALYSIS §4/§5 (`backdrop-loops` 14–360s, `--pass:6s`); M.2 `idle_nudge` 3s |
| WCAG 2.2.2 pause/stop | Auto-starting moving/blinking/scrolling content lasting >5s needs a pause/stop/hide mechanism (Level A) | yes — `loop_type:infinite` + auto-start + no control = violation | >5s auto-motion ⇒ mechanism required | high (normative) | WCAG 2.2 Understanding SC 2.2.2 |
| Flash ceiling | ≤3 flashes per second (general & red flash thresholds) — hard seizure safety line | yes — luminance-pair transitions per second over sampled frames | ≤3 flashes/s; ≥10% luminance swing pairs count | high (normative) | WCAG 2.2 2.3.1 + 2.2.2 Understanding text |

### Easing

| Rule | The rule | Measurable? | Baseline value | Confidence | Source |
|---|---|---|---|---|---|
| Eased over linear | Constant-velocity spatial motion reads as machinery; accelerate/decelerate like physical objects | yes — `timing-function`/`easing_family` per record; `linear` on spatial = `violations[]` | non-linear on every spatial move; `linear` only on opacity fades + ambient loops (`ambient_exempt`) | high | NN/g; M.2 "linear BANNED for spatial moves" (M.md:57-60); taxonomy `easing_family`; CLASSIFY violations |
| Named-curve taxonomy | 4 canonical families: standard/ease-in-out, deceleration/ease-out (entry), acceleration/ease-in (exit), sharp (exit-and-return) | yes — map `cubic-bezier` values to `easing_family` closed set | Material values = our M.2 values exactly: standard `cubic-bezier(.4,0,.2,1)`, deceleration `cubic-bezier(0,0,.2,1)`, acceleration `cubic-bezier(.4,0,1,1)`, sharp `cubic-bezier(.4,0,.6,1)` | high | m1.material.io/motion/duration-easing; M.2 (M.md:56-63) |
| Direction-matched easing | Entering screen → ease-out (decelerate into rest); exiting → ease-in (accelerate away); moving within screen → ease-in-out | yes — entrance records (`trigger:in-view`/`purpose:entrance`) vs `easing_family` | entrance=ease-out, exit=ease-in, in-place=ease-both | high | NN/g; M.2 table; Material |
| Overshoot licensing | elastic/bounce/overshoot curves only on playful personality or success/milestone states | yes — `easing_family∈{overshoot,elastic,bounce}` gated by `personality_fit`/`purpose` | 0 overshoot on professional/subtle/elegant; legal on playful + milestone | high | M.2 + M.6; taxonomy easing_family values |
| Penner / easings.net vocabulary | The full public vocabulary: sine/quad/cubic/quart/quint/expo/circ/back/elastic/bounce × in/out/in-out (+ `steps()`) | yes — any `cubic-bezier` decomposes to nearest named curve (cluster bezier points) | deviation axis = distance of measured curve from canonical family members | medium | easings.net; Penner's easing functions; motion.dev easing docs |

### Choreography & staging

| Rule | The rule | Measurable? | Baseline value | Confidence | Source |
|---|---|---|---|---|---|
| One focal animation per viewport | Competing simultaneous animations = defect; motion spent like accent colour | yes — count concurrent live animations per viewport region (frame-diff crops already exist per record) | ≤1 focal animation per viewport; ambient loops don't count as focal (scroll-scrub recipe: scrubs are scroll-progress, not focal) | high | M.4 (M.md:88-92); recipe-scroll-scrub rules |
| Stagger = coordinated sequence | Multi-element entrances stagger, not parallel; parent→child ~100ms; secondary ≈50% of primary displacement | yes — `delay` deltas between sibling records (`--d`, `--i`, `--k`, `--o` vars) | offset ≈100ms parent-child (M.4); measured vocabulary 20–160ms: tamdoma `--d` 0–160ms, menu-cascade `--i*60+60ms`, astromaxsp `--i*40ms`, Carbon recommends 20ms stagger ≤500ms total | high | M.4; recipe-menu-cascade (`--i*60ms+60ms`); astromaxsp ANALYSIS §1; Carbon choreography (`carbondesignsystem.com/building-blocks/foundations/motion/choreography`) |
| Stagger total cap | Aggregate stagger + last-item duration must stay inside the transition budget — don't serialise 20 cards × 100ms | yes — `max(delay)+duration` vs timing_class | total staggered entrance ≤ ~500–700ms (Carbon: total ≤500ms; M.2 structural 500–700ms) | high | Carbon choreography; M.2 `structural` |
| Sequence order | Static shell → body content → dynamic content → primary action last (attention lands on the CTA) | yes — order of in-view records by purpose | Carbon order: shell → content → results → primary action → animated charts | medium-high | Carbon choreography seq 1–5 |
| Exit collapse | Panel/menu close collapses faster than open; `visibility` delayed transition closes hit area after motion ends | yes — open vs close duration on `[data-open]`/`aria-expanded` toggles | close ≤ open duration (menu-cascade .25s vs .35s) | high | recipe-menu-cascade; M.2 |
| Decoupled property curves | Opacity and position run on separate curves — fade can finish while slide settles | yes — per-record property×easing pairs | opacity duration ≤ translate duration on entrances | medium | M.4 item 3 (M.md:96-98) |
| Displacement ceiling | Max translation 80px, paired with opacity fade | yes — keyframe `translate*` extremes | ≤80px + fade (M.7; taxonomy `max_translation_px:80`) | high | M.3/M.7 (M.md:78, 130-132); taxonomy.json banned table |

### Performance & rendering budget

| Rule | The rule | Measurable? | Baseline value | Confidence | Source |
|---|---|---|---|---|---|
| Compositor-only properties | Animate `transform` + `opacity` (+ licensed `stroke-dash*`/`fill-opacity`); layout properties (`width/height/top/left/margin/padding`) banned | yes — `property` axis + `budget` axis; cross-check `layout_per_s` (CDP LayoutCount) | `budget:compositor-safe` = 0 layouts/s while animating; ~60/s = per-frame layout defect | high | M.7/M.11; taxonomy budget set; web.dev animations-guide ("animate at composite stage"); motion.dev tier list |
| 60fps budget | Hold ~60fps (16.7ms/frame); drop displacement before duration | yes — `layout_per_s` + frame-diff regularity | 0 dropped-frame jank measurable via CDP metrics; layout_per_s≈0 for compositor-safe | high | M.7 (M.md:133); web.dev 60fps target |
| Layout thrash ban | Interleaved DOM read/write per frame = defect | yes — `layout_per_s`≈60 on any record | 0 | high | CLASSIFY Step E; MOT-06/MOT-09 measured evidence |
| SVG co-animation cost | `stroke-dash*` co-running with SVG transforms forces per-frame SVG-subtree layout in Chromium — "stroke-cheap" is not free in combination | yes — measured 60 layouts/s when combined, 0 each alone | combined SVG dash+transform ⇒ flag `layout-risk` | high | ADV-REVIEW-MOTION MOT-09; taxonomy `stroke-cheap` NOTE |
| SMIL geometry = layout | SMIL/CSS animating `cx/cy/r/width/height` is layout-bound | yes — `attributeName`/`geometry-attr` records | 0 `geometry-attr` animations; modern port = transform scaleX/translateX | high | ANALYSIS §9; taxonomy `geometry-attr → layout-risk` |
| JS budget | Animation JS ≤4KB total; no animation libraries unless licensed | yes — byte count of animation scripts + lib probe (`gsap/lottie/anime/rive` globals) | ≤4096B; libs=none default (P.12 zero-JS-by-default, 50KB total ceiling) | high | M.14; taxonomy `js_dependency`; P.12; CLASSIFY Step A lib probes |
| Dead keyframes | `animation-name` with no `@keyframes` definition = defect | yes — count `status:dead` records | 0 | high | M.10; CLASSIFY Step F; tamdoma `drift` as canonical example |
| Off-screen culling | Animations should pause/skip when not visible (IO-gated or `content-visibility`) | yes — records running on elements outside viewport | in-view/observer gating present on entrance loops | medium | CLASSIFY §5 (computed styles can lie — verify via frame-diff); MOT review harness pattern |
| `will-change` restraint | Blanket `will-change`/persistent layers waste GPU memory; MotionScore penalises overlap-promoted + persistent will-change | yes — count `will-change` declarations & GPU layer count | will-change scoped to active animations only | medium-high | web.dev compositor article; MotionScore GPU-pressure category |

### Reduced motion & accessibility

| Rule | The rule | Measurable? | Baseline value | Confidence | Source |
|---|---|---|---|---|---|
| Reduced-motion fallback mandatory | `prefers-reduced-motion: reduce` ⇒ all spatial movement → ≤150ms opacity crossfade; no strobing/rotation; loops freeze on a representative frame | yes — emulate `reduce`, diff frames + count running animations (recipe harness did exactly this: 20/20 → 0 diff, 0 running) | 0 spatial transforms under reduce; ≤150ms crossfade; loops frozen | high | M.6/M.13; templates/motion README rules; WCAG C39 |
| Reduce honored by construction | Prefer `@media (prefers-reduced-motion:no-preference)` gating (motion only exists when allowed) or GSAP-style `matchMedia` scoping — not overrides that leak (scroll-draw's ±36px leak under reduce, MOT-07) | yes — reduce-mode computed transforms must be `none` | no residual transform/offset under reduce | high | MOT-07; astromaxsp "reduced motion gets zero animation by construction"; WebKit scroll-driven guide (`@media not (prefers-reduced-motion)`) |
| WCAG 2.3.3 interaction animation | Motion triggered by interaction must be disableable (AAA; industry AA-expected practice via media query) | yes — reduced-motion emulation covers it | `prefers-reduced-motion` honored = sufficient technique C39 | high (normative AAA) | WCAG 2.2 Understanding SC 2.3.3 |
| Parallax license | Parallax legal only on marketing/landing (`page_class:money`); banned on utility/transactional; foreground faster than background | yes — scroll-linked records + layer velocity ordering + page class | utility pages: 0 parallax/scroll-linked records | high | M.5 (M.md:103-111); WCAG 2.3.3 names parallax as vestibular risk |
| No scrolljacking | Scroll position must remain user-controlled; snap-steal only at declared drag/swipe boundaries | yes — detect wheel/scroll event interception, `scroll-behavior` overrides, Lenis/GSAP smooth-scroll runtimes | scroll delta = user input delta; no `scroll()` fighting native scroll | high | M.5; NN/g Scrolljacking 101 (altered scroll rate + text = worst usability); SC 2.3.3 |
| Scroll-linked ≠ scroll-jacked | `animation-timeline:scroll()`/rAF-scrubbed effects bind animation *progress* to scroll without altering scroll itself — legal | yes — `technique:css-scroll-timeline`/`rAF-loop` w/ scroll trigger; verify page still scrolls normally | scrub effects legal; hijack illegal | high | scroll-scrub recipe; css-animation.com scroll-jacking note; Chrome modern-web motion guidance |
| Reduced-motion under SMIL/JS | JS must also remove/replace SMIL and skip drivers (tamdoma deletes SMIL nodes; scroll-scrub skips the rAF driver entirely) | yes — reduce-mode DOM diff + script early-return | SMIL removed or frozen; driver skipped | high | ANALYSIS §8; MOT-07 fix guidance |

### Interaction laws (measurable proxies)

| Rule | The rule | Measurable? | Baseline value | Confidence | Source |
|---|---|---|---|---|---|
| Fitts's law | Acquisition time ∝ log2(1 + D/W) — bigger & closer targets faster/safer | yes — measure interactive target bounding boxes: min dimension, inter-target gap; derive deviation = shortfall vs floors | touch ≥44×44px (+8px buffer), pointer ≥32×32px; WCAG 2.5.8 AA floor 24×24px; R.6 canon 44px / min-h-tap token | high | NN/g Fitts's Law article; R.6 (R.md:135-141); WCAG 2.5.8; P.5 min-h-tap |
| Fitts distance term | Related/frequent targets close together — submit near last field; menus near handle | partially — measure centroid distance between sequential controls (form field → submit) | primary action adjacent to last input | medium | NN/g Fitts applications |
| Hick's law | Decision time grows with number & complexity of choices | yes — count simultaneous interactive choices per viewport / nav items / CTA count | canon supports indirectly: one accent CTA per section (C.1/C.8), one focal animation (M.4) | medium | lawsofux.com/hicks-law; Hick & Hyman 1952 |
| Jakob's law | Users prefer sites working like sites they know — conventions over novelty | partially — measurable as convention conformance (logo top-left, nav top/right, CTA verb patterns); hard as a single number | deviation = structural distance from canon composition set (SECTION-CATALOG) | medium | lawsofux.com/jakobs-law; NN/g end-of-web-design |
| Peak-end rule | Judgment of experience dominated by peak intensity + ending | partially — measurable proxy: presence/absence of `milestone`/success-state animation at journey end | milestone animation licensed on success; 1500ms cap | medium | lawsofux.com/peak-end-rule; Kahneman et al. 1993; M.6 |
| Aesthetic-usability effect | Attractive interfaces perceived as more usable; masks real defects in testing | not directly — a bias caveat for *evaluating* sites, not a measurable axis | n/a — flag: beauty inflates perceived quality | high (Kurosu & Kashimura 1995; NN/g) | lawsofux.com/aesthetic-usability-effect |
| Von Restorff isolation | The item differing from similar peers is remembered/attended | yes — exactly C.1/C.8: one accent surface per viewport; count of accent-coloured elements per viewport | 1 isolated focal element per viewport; >1 competing accents = dilution defect | high | lawsofux.com/von-restorff-effect; C.1/C.8/M.4 |

### Focus & attention mechanics

| Rule | The rule | Measurable? | Baseline value | Confidence | Source |
|---|---|---|---|---|---|
| Focus ring = token | Every interactive element has hover/focus-visible/active states; focus rings from tokens (2px ring + 2px offset), never default outline | yes — computed styles on `:focus-visible` | 2px + 2px offset (I.7); S.5 2px border = focus/active only | high | I.7/I.9 (I.md:177-209); S.4 (S.md:92) |
| Hover media guard | Every `:hover` rule wrapped in `@media (hover:hover) and (pointer:fine)` — the sticky-touch bug guard | yes — stylesheet rule inspection | 100% of hover rules gated | high | R.6 (R.md:138-140) |
| States never resting | accent is never static: hover −10%L / active ±15%L+5%S | yes — computed color deltas on :hover/:active | C.4 deltas | high | C.4 (C.md:91-92) |
| Attention sequencing | Reveal order ends on the primary action; one CTA hue per section | yes — stagger order + accent count | CTA last in choreography; 1 accent per section | medium-high | Carbon choreography seq; C.8 |
| IO threshold convention | In-view triggers fire just before fully visible: tamdoma `threshold:.08, rootMargin:0 0 -10%`; astromaxsp `top 85%` | yes — observer params / trigger scroll position | fire at ~8–15% visibility | high | ANALYSIS §1; reveal-fade params; astromaxsp §1 |

---

## FOLK WISDOM — contested or context-dependent (flagged)

| Rule | Claim | Measurable? | Baseline value | Confidence / evidence quality | Source |
|---|---|---|---|---|---|
| Disney's 12 principles → UI | squash/stretch→scale+elastic overshoot; anticipation→pre-move counter-motion; staging→one focal element; follow-through→settle overshoot; slow-in/out→easing; arcs→curved paths; secondary action→decoupled opacity; timing→duration tokens; exaggeration→pop personality; appeal→personality tier | partially — several map to measurable axes (easing, scale-overshoot ratio, path curvature), several are qualitative (staging, appeal) | see rows above: scale-overshoot % on entrances, arc-vs-straight path ratio, secondary-displacement ≈50% | medium — widely translated to UI (IxDF, Marvel, UX Collective) but adaptation is interpretive, not empirical per-principle | ixdf.org Disney→UI article; M.1 personalities as the machinery's compression of "appeal/exaggeration" |
| Squash & stretch | Elastic scale on enter/exit adds life; preserve volume | yes — max scale deviation during transition; `transform-scale` in property axis | playful only (M.1); elegant bans scale distortion entirely — personality-dependent baseline | medium | IxDF; M.1 |
| Anticipation | Small reverse motion before main move signals the action | yes — sign-reversed pre-segment in keyframes | rare in canon; ~5–10% of duration pre-phase when present | low-medium | Disney principles; NN/g gesture-confirmation examples |
| Follow-through / overlapping | Elements don't stop dead; children trail the parent | yes — parent-child delay (≈100ms) + secondary displacement ≈50% | M.4 values | medium-high | M.4; Disney |
| Arcs | Natural motion follows curved paths, not straight diagonals | yes — keyframe path curvature / `offset-path`/`motion-path` records vs straight-line interpolation | arcs preferred for on-screen travel; tamdoma uses `animateMotion` paths | medium | NN/g (arc in Seamless example — and warns long arcs annoy); ANALYSIS §9 motion-path |
| Secondary action | Subordinate motion supports the primary without competing | yes — secondary elements at ≈50% displacement | ~50% of primary | medium | M.4; Disney |
| Exaggeration / appeal | Personality expressed through overshoot, pop, expressive loops | yes — overshoot magnitude, loop density, `motion_tier` | tamdoma measured `professional`: zero overshoot, loops ≥6s; playful sites expected overshoot+pop | medium | TAXONOMY personality signatures; M.1 |
| Skeleton > spinner | Skeletons reduce *perceived* wait vs spinners — but contested: some studies find skeletons score higher on perceived speed, others find spinners-with-progress better for long waits | yes — presence of skeleton placeholders + 500ms delay + shimmer animation properties | skeleton after ~500ms (M.3); skeletons for content-shaped loads, spinner+progress for indeterminate long ops | medium (single small study: skeleton pages score higher perceived speed; counter-findings exist) | Luke Wroblewski 2013 (coined); ResearchGate skeleton study; timkadlec.com caveat |
| Optimistic UI | Confirming before server response raises perceived speed but risks lying on failure | partially — detectable via instant DOM mutation on click (needs interaction trace) | n/a static-measurable; flag as behavioral | low-medium | industry practice (Instagram/Meta) |
| Progress indicator types | Active waiting perceived shorter than passive; determinate > indeterminate on >3s waits | yes — presence/type of progress affordance on slow ops | determinate progress for known-duration tasks | medium | time-perception research via timkadlec; NN/g |
| Miller 7±2 | "Magic number" for menu/item count | partially — count nav items (real corpus: 5–9) | folk cap ~7±2; canon R.5 fixes "five elements above fold" | low — Miller's law is about working memory, not menu length (known misapplication) | lawsofux; NN/g critiques |
| Platform duration scaling | "Desktop faster than mobile" (Material: desktop 150–200ms vs mobile ~300ms; tablet +30%, wearable −30%) | yes — per-breakpoint duration deltas | platform multiplier mobile 1.0 / tablet 1.3 / wearable 0.7 / desktop ~0.6 | medium — Material-internal; not universal practice | m1.material.io duration-easing |
| Hover delay before preview | Delay hover-triggered reveals slightly to avoid flicker when scanning across | yes — `transition-delay` on hover rules | NN/g qualitative "slightly delayed"; ~50–200ms convention | low-medium | NN/g animation-duration article |
| Idle nudge loop | 1s delay → 3s pulse loop on resting CTA is the *only* licensed attention loop | yes — loop records on CTA elements | M.2 idle_nudge spec | high internally; externally contested (auto-attention loops border 2.2.2) | M.2/M.3 "continuous distracting loops" ban |
| Re-trigger on scroll-away | Reveals should be once-only (`unobserve`) — re-appearing content reads as bug | yes — observer `once:true` vs re-triggering | unobserve after `.in`; astromaxsp `ScrollTrigger once:true` + paused-play-state | high | reveal-fade rules; astromaxsp §1 |

---

## Style-space axis candidates (new `rules[]` entries these rows imply)

The JSON needs `{id, baseline, unit}` — deviation = measured ÷ unit. Suggested
motion axes producible from `meta.json.motion`:

| Candidate id | Baseline | Unit (1σ ≈) | Notes |
|---|---|---|---|
| M-anim-density | ≤1 focal animation/viewport; ≤1 loop/page for `subtle` | 1 anim | deviation = count − baseline |
| M-median-duration | `standard` 300–400ms for entrances | 100ms | sites skew `slow` (tamdoma 1s reveals) — expressive axis |
| M-easing-mix | 100% non-linear on spatial; entrance=ease-out | 0.25 share | share of records violating direction-matched easing |
| M-displacement | ≤80px translate + opacity fade | 20px | maximal keyframe displacement |
| M-layout-per-s | 0 layouts/s while animating | 15/s | MOT-06/09 evidence — real measured axis |
| M-loop-share | loops ⊆ licensed set; ambient ≥6s period | 1 loop | count of non-exempt infinite loops |
| M-js-bytes | animation JS ≤4096B, no libs | 2KB | library detection → `library` bucket = large deviation |
| M-reduce-parity | 0 spatial motion + ≤150ms crossfade under reduce | boolean/leak-px | scroll-draw leak = 36px deviation |
| M-tier | `motion-tier` ∈ {static…cinematic} vs declared personality | 1 tier | genome gene already exists — wire to style-space |
| M-stagger-offset | parent-child ≈100ms, sibling 20–160ms | 40ms | measured from `--d/--i/--k` vars |

---

## Prior art

**Verdict: Close but not quite.** The measurement layer exists inside this repo
(CLASSIFY-MOTION + taxonomy + recipes); external tools exist for performance
auditing but none emit *deviation vectors against a style baseline*.

| Tool | What it does | Delta vs our need |
|---|---|---|
| **MotionScore** (motion.dev, `score.motion.dev`) | Audits live URL: per-animation tier S–F (compositor→thrash), scroll animations, GPU pressure, CI guard | Measures *performance grades*, not style deviation; no easing/duration/choreography profile vs baseline. Reuse its tier taxonomy as evidence for `layout_per_s` axis — our classifier already emits the equivalent |
| **motionlint** (`github.com/bobaba99/motionlint`) | `npx motionlint audit` — deterministic motion audit + vision-LLM review | Audit-style pass/fail, not a vector space; no baseline |
| **mcp-animation-inspector** (`github.com/Ak0096/mcp-animation-inspector`) | MCP server: Playwright capture + pluggable detectors + frames | Detection infra similar to CLASSIFY Steps A–E; no classification vocabulary |
| **component-census / design-mirror-ai / design-auditor** | Extract colors/fonts/spacing/radii per site | Cover *static* style DNA — the colour/type siblings of this work; none handle motion |
| **easings.net / Penner** | Named easing catalog | Reference vocabulary only — used for `easing_family` decomposition |
| **DevTools Animations panel / Edge Animations tool** | Inspect/replay CSS animations | Manual inspection; not a corpus scan |
| **GSAP / Motion / Lottie / Rive** | Authoring runtimes | The things we *detect*, not measurement tools |

Delta to build (already specced, not yet a style-space feed): per-site motion
**vector** = {density, median duration class, easing mix, displacement,
loop share, layout_per_s, JS bytes, reduce parity, tier} → clustered into
style families (subtle/professional/expressive/cinematic — M.1 personality +
motion_tier rollups already define the cluster names).

Search terms used: "tool measure website animations automatically audit",
"website design style vector clustering measurable design rules deviation
baseline", "animation performance audit CSS JS". Absence verifiable: no public
project returns a *style-space deviation vector* for motion; all prior art
grades performance or extracts tokens.

---

## Alternatives

- **Grade per animation (MotionScore-style tiers) instead of deviation axes** — rejected: tiers lose the directional signature needed for clustering (a slow cinematic site and a snappy corporate site can both be S-tier). Deviation vectors preserve *how* a site bends the rule, which is the style signal.
- **Reuse WCAG pass/fail as the axis** — rejected: binary conformance can't cluster styles; keep WCAG rows as gates (invariants), not axes.
- **Classify motion from static CSS only** — rejected: proven to undercount (86 invisible SMIL nodes, MOT-02; computed-style lies about liveness, CLASSIFY §5). Requires browser pass — already the CLASSIFY design.
- **Let `easing_raw` stay free text** — rejected: taxonomy `easing_family` closed set exists; raw bezier → nearest family is the measurable step.

## Gotchas

- **Reduced-motion emulation masks everything**: headless Chromium defaults can make every duration read `1e-05s` — always assert `matchMedia('(prefers-reduced-motion:reduce)')===false` before scanning (CLASSIFY §1; tamdoma proved it).
- **Computed style ≠ live animation**: paused/off-screen-culled animations still show `animation-name`; confirm via frame-diff or `getAnimations().playState` (CLASSIFY §5).
- **SMIL is invisible to CSS audits** (MOT-02): query `animate,animateMotion,animateTransform,set` explicitly; its `width`/`cx` animation is layout-bound.
- **Discrete property snap**: mismatched `filter` function lists fall back to discrete interpolation — animation exists in CSS but never plays (MOT-04 blur-reveal). Verify interpolation, not just the rule.
- **`view()` self-subject freeze**: element animated by `transform` whose timeline is its own `view()` freezes in Chromium — timeline on static wrapper, animation on child (scroll-scrub recipe).
- **Negative-delay phasing**: `animation-delay: calc(var(--k) * -2.5s)` spreads phases inside one period — duration alone won't reveal the choreography; record `delay` + `loop_type:phased`.
- **Timing-class boundary care**: M.2's prose ranges overlap at 300ms but taxonomy `timing_class` is half-open — measure to the JSON boundaries.
- **Specificity leaks under reduce**: a lower-specificity reduce override loses to state classes — MOT-07's ±36px residual transform. Check reduce-mode *computed* values.
- **`linear` isn't always a violation**: ambient infinite loops are exempt (`ambient_exempt`); scrubs are linear-by-design because easing lives in window bounds (scroll-scrub).
- **Loops freeze frame choice matters**: progress-rig froze at `--p:0` showing full bar + token at 0 — inconsistent end state (MOT-13). Reduce-mode correctness = a *representative* frame.
- **Interaction-gated records need replay**: `[data-open]`/hover animations don't appear until the state is toggled during scan (CLASSIFY §5).
- **Cross-origin stylesheets** throw on `cssRules` — fetch `ss.href` or flag `partial:true` (CLASSIFY §5).

## Assumptions

| Assumption | Load-bearing? | Falsifier / evidence that would change it |
|---|---|---|
| Style-space axes accept motion rows as `{id, baseline, unit}` | yes — shapes the deliverable schema | style-space.json:2-8 shows numeric `unit` per rule; non-numeric baselines (personality) would need categorical handling |
| `meta.json.motion` records are producible for the corpus sites | yes — axis feasibility | CLASSIFY-MOTION is spec'd but scanning sites through it isn't verified at corpus scale; falsifier = meta.json files lacking `motion` blocks (operator meta.json files exist but motion block unverified on bulk) |
| Deviation = measured ÷ unit (linear) | yes | existing rules rows use linear units (240px, 15ch); a log-scale law like Fitts's would need transformed units |
| M.2 timing classes are the duration baseline | yes | taxonomy.json + M.md agree; falsifier = corpus median sitting far outside classes (then baseline = corpus median, not canon) |
| Personality/tier closed sets suffice for clusters | medium | genome motion-tier has exactly 4 values; falsifier = corpus bimodal inside one tier |
| Disney→UI mappings are axes, not gates | medium | several principles (staging, appeal) have no direct measurable; falsifier = cluster can't separate personalities without them |

## Premortem

- **The corpus may be motion-poor**: genome motion-tier rollup shows `subtle` dominant (237+ sites in largest bucket); motion axes could be near-zero variance → clusters driven entirely by other rule families. Mitigation: `motion_tier` + easing-mix + loop-share still discriminate (static vs subtle vs expressive).
- **Measurement pipeline gap**: CLASSIFY-MOTION is a spec; if SiteScanner hasn't run Steps A–F on the corpus, every axis above is aspirational. Flag: verify `motion` block exists in `patterns/data/operator/**/meta.json` before the plan relies on the feed.
- **Direction-matched easing violations may be noise**: real sites mix curves per property (opacity ease-out + transform ease-both) — a naive "wrong easing" flag would over-trigger; measure per (property, purpose) pair.
- **Library detection penalizes the wrong thing**: a GSAP site may be smoother than a hand-rolled rAF site; `js_dependency:library` is a *dependency* axis, not a quality axis — don't conflate in clustering.
- **Reduce-mode checks need a second pass**: doubling scan cost; corpus size × 2 emulations is the price of the `M-reduce-parity` axis.
- **Personality is a judgement**: `personality_fit` derivation from timing/easing signatures is heuristic (taxonomy mapping); VLM/reviewer agreement on tamdoma worked, but edge cases (elegant vs subtle at low density) may collapse.
