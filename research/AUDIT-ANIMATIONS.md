# AUDIT-ANIMATIONS — micro-animations/interactions module (proposed stage S5d)

Module audited: **micro-animations/interactions** — the class-layer pass
the operator wants run LAST on a built site ("animation ideas derived
from page content"). The module does not exist: `grep -i
anim|motion|reveal|transition|observer|intersection` returns zero hits in
`research/WEB-FACTORY-S5-DESIGN-DNA.md`, `docs/machinery/WEB-FACTORY.md`,
and `research/WEB-FACTORY-S6-INTEGRATIONS.md`. There is no spec to
adversarially review, so this document is the proposal the PRD writes
against — vocabulary, class system, placement rules, gate, and lane —
each grounded in the two reference codebases.

## 1. Scope audited

| Source | What was extracted |
|---|---|
| Dents Direct `site/src/styles/global.css` (489 lines, mac-mini `100.84.74.100`, read verbatim) | the whole house animation vocabulary: `.rv`/`.in`, `.js` gate, divider wipes, `icondraw`/`iconbeat`, `nodepop`/`nodepulse`/`draw`, `.ba` before/after slider, `.rdeck` drag deck, `.mdrawer` stagger, hover lifts, `prefers-reduced-motion` kill-switch |
| Dents Direct `site/src/layouts/Base.astro` | the `<head>` `.js` boot (line 37) + one shared `IntersectionObserver` at `threshold: 0.15` observing `.rv, #stage, main > section, .ba, .photo` (lines 73–83) |
| Dents Direct `site/src/components/BaDeck.astro` | the comparison-slider pointer pipeline + keyboard arrows + `.live` hand-off (lines 80–194, ~114 lines) |
| Dents Direct `site/src/pages/index.astro` | `[data-deck]` mouse drag-to-scroll (~19 lines, lines 218–237); `.rv` used 26 times on the homepage |
| Apiary project (`…/the-apiary-—-ultra-luxury-residences-adelaide/`) | motion **vocabulary** only — see F1; uses `motion/react` (framer-motion) `useScroll`/`useTransform` parallax, `AnimatePresence` crossfades, spring props — none of which is portable to an Astro+no-libs build |
| `research/WEB-FACTORY-S5-DESIGN-DNA.md`, `…-S6-INTEGRATIONS.md`, `…-S7-GATE-DEPLOY.md`, `docs/machinery/WEB-FACTORY.md` | the seam this lane inserts into; CSP conflict (F3) |
| `http://localhost:4321/` | dead (connection refused, 2026-11-02) — could not compare a live render |

## 2. Current contract

None. The module is absent; the table below is the contract this audit
proposes.

| Direction | Artifact / rule |
|---|---|
| Reads | `sites/<slug>/` Astro source (built by S5b, responsive-verified by the proposed S5c lane), `site/design-dna/TOKENS.json` (`--ease`, accent color, motion durations if present), `site/sitemap.md` `type` column (animation budget per page class) |
| Writes | `sites/<slug>/src/styles/motion.css` (one new file), one `<script>` wiring block in the base layout, **classes only** on existing elements, `site/motion-report.md` (the review artifact) |
| Forbids | DOM restructuring, new elements except `::before`/`::after` pseudo-elements, animation libraries, layout-animating properties (`width`/`top`/`left`/`height`/`margin`), JS above the §8 budget |

## 3. The animation taxonomy (observed patterns → named classes)

Every entry is a real pattern in the Dents Direct build; the Apiary
column names the equivalent high-end vocabulary item whose *idea* is
portable even though its mechanism is not.

| Class | What it does | Trigger | CSS mechanism | JS required | reduced-motion |
|---|---|---|---|---|---|
| `rv` (reveal-fade-up) | block fades in + rises 16px | IO, `.in` added once, unobserved | `opacity`/`transform` transition, `opacity:0` pre-state gated on `.js` | shared IO only | hidden state never applies — whole `.js` tree is killed |
| `rv` + grid cascade | children of `.grid .steps .adv .chips .kpis .stats .rdeck .stack` inside a `.rv` each rise 14px | same `.in` on the parent | per-child `opacity`/`transform` transition; `nth-child` delays .1/.2/.3/.38/.46s (global.css:350–356) | shared IO only | same |
| divider-wipe | hairline under every `main > section` draws L→R | IO on the `section` itself | `::after` `scaleX(0→1)`, `transform-origin:left`, 1.1s ease + .1s delay (`:135–136`) | shared IO only | static border shown instead (`:132`) |
| shead-underline | 2px accent underline draws under `h1`/`h2` in `.shead` | IO on `.shead` | `::after` `scaleX(0→1)` .9s ease + .45s delay (`:139–140`) | shared IO only | static underline |
| photo-settle | hero/photo img starts `scale(1.05)`, settles to 1 | IO on `.photo` | `transform` transition 1.2s (`:357–358`) — the Ken-Burns-in-reverse | shared IO only | instant |
| icon-draw | SVG icon strokes draw themselves (handwriting feel) | IO on tile parent | `stroke-dasharray:300; stroke-dashoffset:300→0` keyframe 2.6s, per-tile `--id` stagger var (`:243`) | shared IO only | `stroke-dashoffset:0` static (`:361`) |
| icon-beat | the accent path (`.a`) then pulses forever | follows icon-draw | `iconbeat` keyframe 4.5s infinite, offset `.5s + 4s` after draw (`:244`) | none (chained keyframe) | killed with all animations |
| node-pop | diagram nodes scale 0→1 in sequence | IO on `.svc-stage` | `nodepop` keyframe .45s + `nodepulse` 2.4s infinite; per-node `animation-delay` pairs (`:211–216`) | shared IO only | `opacity:1; transform:none` static (`:361`) |
| svg-line-draw | car-outline / leader lines draw via dash | IO on `.svc-stage` | `stroke-dasharray:1; dashoffset:1→0` `draw` keyframe 2s (`:219–222`) | shared IO only | `dashoffset:0` |
| ba-slider | before/after comparison — after-image clips to `--x` line; intro sweeps in then `.live` tightens response to .12s linear | IO starts intro; pointer/click/keyboard thereafter | `clip-path: inset(0 0 0 calc(var(--x)*1%))` transition + `.ba-handle` `left` transition (`:300, :310, :317–321`) | per-component script (~114 lines, BaDeck.astro:80–194): pointer pipeline, thumb tracking via scroll+rAF, `aria-valuenow`, ←/→ keys | intro sweep killed; slider still works (transitions instant) |
| rdeck-drag | reviews deck: mouse drag-to-scroll over native `scroll-snap` + `overflow-x` | pointer | `scroll-snap-type: x mandatory`, `.drag` class kills snap mid-drag + `cursor:grabbing` (`:277–279`) | per-component script (~19 lines, index.astro:218–237) | unaffected |
| mdrawer-stagger | mobile nav links cascade in 14px translate + fade | `[open]` attribute | `opacity`/`transform` transitions with `nth-child` delays .08→.38s (`:88–95`) | the drawer's own open/close JS | killed |
| hover-lift | linked card lifts −3px on hover | `:hover` | `translateY(-3px)` transition (`:360`) | none | killed |
| btn-arrow | `.btn svg` arrows nudge `translateX(3px)` on hover | `:hover` | `transform` transition (`:51–52`) | none | killed |
| img-zoom | card images `scale-105` on `group-hover` | `:hover` | `transform` transition (Apiary concierge:175 — `transition-transform duration-700`) | none | killed |
| dot-pulse / blink | status dot breathes (`dotpulse` 2.6s, `blink` 1.6s `steps(2)`) | none — ambient | `@keyframes` `opacity` only (`:43–44, :125–126`) | none | killed |
| animate-ping | presence dot ring expands (Apiary FloatingConcierge:358, map:248) | none — ambient | `scale`+`opacity` keyframe | none | killed |

**Apiary-only vocabulary** (mechanism is `motion/react` — vocabulary to
borrow, not code): scroll-progress parallax (hero image `scale 1→1.18`
+ `y 0→8%`, overlay fade-out — FrostedHero.tsx:79–94), lightbox
`AnimatePresence` scale-in `0.98→1`, carousel crossfade `opacity 0→1`
(SuiteCarousel:182–205), spring entrance `type:'spring', damping:26`
(FloatingConcierge:390), typing dots `animate-bounce` with
`animation-delay` stagger (:518–526). Of these, crossfade and
typing/ambient dots port trivially to keyframes; parallax needs a
scroll-progress input (§5, F5); spring easing approximates to
`cubic-bezier(0.175, 0.885, 0.32, 1.15)` [INFERENCE — visual match,
not computed].

## 4. The `.rv`/`.in` convention — formalized class-system spec

The house system has exactly four moving parts; the spec formalizes
them so every generated site ships the same grammar:

1. **`<html class="js">` boot.** First inline script in `<head>` adds
   `.js` to `documentElement` (Dents Direct Base.astro:37). Every
   hidden/animated pre-state selector is `.js`-prefixed — no-JS and
   JS-disabled renders are the *static* page, never a page of
   `opacity:0` ghosts. This is the single no-JS gate; it must be an
   `is:inline` head script (module scripts are deferred — too late,
   the page paints first).
2. **`.rv` marks an opt-in reveal target.** The build/motion lane adds
   it to elements; `.rv` alone does nothing until observed.
3. **`.in` is the armed state** the one shared observer adds
   (`threshold: 0.15`, `unobserve` after fire — fire-once by default).
   All choreography keys off `.in`: `.rv.in`, `section.in::after`,
   `.in .frame svg`, `.ba.in`, `.photo.in`.
4. **One observer.** `document.querySelectorAll('.rv, .svc-stage, main
   > section, .ba, .photo').forEach(el => io.observe(el))` — the
   selector list is the site-wide animation registry. Adding a new
   pattern = add its root selector here, never a second observer.

**Stagger mechanism — two named idioms, both specced:**

- *Cascade*: `nth-child` transition-delays on `.in` (`.1/.2/.3/.38/.46`
  s, saturation at `n+6`) — the `.rv` grid cascade idiom
  (global.css:352–356). Spec: children 1–5 delayed 80ms steps, `n+6`
  flat; matches house timing exactly.
- *Custom-property delay*: per-tile `--id` delay vars set in
  `nth-child` rules (icon-draw `:247–252`) — for when the stagger must
  feed *keyframes* (`animation-delay` chains) not transitions.

**Opt-in rule:** `.rv` goes on the *section or container*, never on
every element — the cascade selector reaches into named grid classes.
Heroes and the first `<section>` of each page get `rv` (they're
above-the-fold and the reveal still plays — IO fires immediately
since they intersect on load). A page class opts *out* per-element by
omission; the whole site opts out by not shipping `motion.css`.

## 5. Gap findings

| # | Severity | Finding |
|---|---|---|
| F1 | **blocker** | The operator cites "the Apiary pattern" as the mechanism target, but Apiary's mechanism is `motion/react` (framer-motion): `useScroll`/`useTransform`/`AnimatePresence`/spring props (FrostedHero.tsx:6,79–94; FloatingConcierge.tsx:389–390; package.json `lucide-react` + motion dep) — a *banned* library. The auditable, CSS-native mechanism is Dents Direct's (`.js` gate + one IO + transitions/keyframes). Spec must say explicitly: **Apiary supplies the motion vocabulary (parallax, crossfade, spring feel, stagger); Dents Direct supplies the mechanism.** A lane that reads "the Apiary pattern" literally reaches for a JS animation lib and violates the no-heavy-JS rule. |
| F2 | **blocker** | Animation is absent from every contract: S5's self-lint (S5 spec :274–285) checks routes/tokens/self-containment but nothing motion-related; `CLASS-SYSTEM.md`/`COMPONENTS.md` have no animation class rows specced; the S7 SEO gate (S7 spec :209–221) is 13 checks, none motion. Without this module the factory ships static pages regardless of reference quality. |
| F3 | **blocker** | CSP conflict: S6 emits `script-src 'self'` (S6 spec :257) — which **blocks every `<script is:inline>`** the house pattern is built on (`.js` boot, IO wiring, `.ba` script, `[data-deck]` script). If animations ship as inline scripts they die under S6's own header. Resolution (spec must pick one): (a) ship the wiring as `public/js/motion.js` + `<script src>` — same-origin, CSP-clean, cacheable, and the budget becomes a file-size check; or (b) weaken CSP to `script-src 'self' 'unsafe-inline'` — contradicts S6's own "anything else is injection" rationale. **Recommend (a)** — one file, one request, auditably ≤ budget; the `.js` boot stays a 1-line inline script (also needs `script-src` exemption → fold it into motion.js loaded with `defer`? No — `.js` must apply before first paint. Keep boot inline → CSP needs a per-hash exemption `'sha256-<hash>'` or a `nonce`. Cheapest: boot script becomes `motion.js` itself loaded **without** `defer` in `<head>` — a ~6KB same-origin file parses before first paint and sets `.js` early enough.) |
| F4 | **major** | "Applied LAST as a class layer" is underspecified: `.rv` is classes-only and composable with it, but `.ba`/`.rdeck`/drawer/car-diagram are *components* — they own markup (`<div class="ba"><div class="ba-a">…<div class="ba-handle">`) and per-component JS. A post-build pass can add `.rv` to a section but **cannot** mint a `.ba` slider without restructuring. Spec must split the vocabulary: *reveal-layer classes* (applied post-build, classes-only) vs *interactive components* (built by S5b from `COMPONENTS.md`, inert until the motion pass arms them). The motion lane never adds markup; if content needs a `.ba` the lane flags "comparison content, no component" instead of inventing one. |
| F5 | **major** | Parallax (the signature Apiary feel — hero image scale/translate on scroll progress) has no house-mechanism equivalent. Options: (a) `animation-timeline: scroll()` — pure CSS, baseline in Chrome/Edge; Safari support lands 2025–2026 era [INFERENCE — verify against caniuse at spec time], progressive enhancement under `@supports`; (b) rAF `scroll` listener updating a `--p` custom property — works everywhere, ~15 lines, but a scroll handler is the classic jank source; (c) drop parallax, keep `photo-settle`. Recommend (a) with a static fallback — `@supports (animation-timeline: scroll())` gates it; unsupported browsers get the still image, which is the correct reduced-feature story. |
| F6 | **major** | `prefers-reduced-motion` exists in the house CSS (global.css:361 — universal `animation:none !important; transition:none !important` + explicit end-state overrides) but nothing *verifies* it. A lane that writes new motion CSS can forget the kill-switch and the gate has no check. Add a mechanical check (§7): `motion.css` must contain `@media (prefers-reduced-motion: reduce)` covering every declared `@keyframes` name and every `.js`-gated pre-state. |
| F7 | **minor** | Stagger saturation: the cascade caps delays at `n+6` (global.css:356) and `--id` at `n+6` (:252) — a 12-card grid gets 7 identical-delayed cards. Correct but invisible in spec; name the cap (`max-delay = index-1 step, flat after nth`) so generated sites don't write per-card delay arithmetic. |
| F8 | **minor** | `.ba`/`.rdeck` keyboard handling exists (BaDeck.astro:183–190 — ←/→ nudges `--x`, `aria-valuenow` updates) but is convention, not contract. The a11y bar (S5 responsive/a11y requirement) must name it: every interactive pattern ships `tabindex`, arrow-key handlers where spatial, `aria-valuenow`/`aria-label`, `focus-visible` styling. The house `.ba` already models this; spec adopts it verbatim. |
| F9 | **minor** | `transition-delay` on nth-child cascades means a `.rv` grid *below* the fold fires fine, but a `.rv` grid *above* the fold still staggers on load — correct behavior (IO fires on intersect), but worth speccing so lanes don't "fix" it with a load-only class. |
| F10 | **minor** | `main { overflow-x: clip }` (global.css:28) is load-bearing for `translateY`/`scale` reveals — transforms don't overflow, but the clip prevents accidental horizontal scrollbars during stagger. Spec copies it and notes why (it is not decorative). |

## 6. Discovery-question expansion — what the stage must answer

The module's questions are different in kind from upstream stages: it
doesn't research keywords or copy, it researches *where motion earns
its place*. Every answer must cite an element or a content row — never
"felt like it needed animation."

| Theme | Questions the lane must answer |
|---|---|
| Input source | Where does the animation inventory come from? (Design-dna `PAGES/<slug>/SPEC.md` section list → which sections exist; `content-final` module types → which *content shapes* exist.) Where do *new* ideas come from? (Section-content semantics — a stat row earns a count/settle; a comparison earns `.ba`-intent flag.) |
| Authenticity | No fabricated interactions: `.ba` only where `content-final` actually carries before/after media pairs; count-up only on real stats the brief verified; icon-draw only where the build shipped an SVG icon set. An animation implying a feature the site lacks is fabrication — same class as invented copy. |
| Classification | What is each page's motion *budget*? Money pages = full vocabulary (hero settle, cascades, icon-draw, `.ba`); article pages = minimal (reveals + dividers only — motion shouldn't compete with reading); ancillary (contact/FAQ) = reveals + drawer stagger. The `type` column in sitemap.md/content-plan.md drives it — closed set already exists. |
| Competition census | SERP winners' motion surface — the same competitor set S1 mined. Question: *do the top-3 money pages use motion at all?* A niche where winners are static (plumber #1 is a plain page) sets a conservative bar — match the call, don't overshoot into flashy. Where winners do animate (luxury trade, design-led niches), the bar is higher. Record per-competitor: reveal-on-scroll present? sliders? animated icons? measured by fetching the winner's CSS/JS like the S5 refs path already captures HTML. |
| SERP stats | Word/module counts from the audit-siblings' pass are the input — a 2000-word article with 8 sections earns more dividers than a 400-word page; a money page with a KPI grid earns icon-draw. Motion density scales with content volume from S3, exactly like design sizing. |
| Interaction census | Which interactive components did S5b ship? The lane reads `COMPONENTS.md` + the built `src/components/` — `.ba`-ready slides, decks, accordions — and arms them. Missing component + matching content = flag to `motion-report.md`, never built ad hoc. |
| Reduced-motion | Which effects are *information-bearing* vs decorative? `.ba` reveal position is functional — it survives reduced-motion as an instant jump (`.live` semantics), while parallax/reveals are decorative and vanish. The classification per class is in the taxonomy table. |
| No-JS | Is every interactive element reachable without JS? `.ba` without its script = static split at `--x:50` (acceptable — the after image is half-visible, both layers readable); drag decks without JS = native scroll (touch works, mouse scroll-wheel works); drawer without JS = links unreachable → the drawer must ship a `<noscript>`/no-js fallback nav or the menu links must exist in the footer. Mechanical check (§7). |

## 7. Split / sub-module proposal — lane anatomy

One lane, three artifacts, matching the factory's one-decision shape:

```
S5b build ──> [S5c responsive test+fix ──>] S5d motion ──> S6 integrations ──> S7
                  │                          │
                  │                          ├──> sites/<slug>/src/styles/motion.css
                  │                          ├──> sites/<slug>/public/js/motion.js  (shared IO + component wiring)
                  │                          ├──> class additions in src/ components/pages
                  │                          └──> site/motion-report.md
```

**Why its own lane (S5d), not folded into build:** the operator's rule
is *classes applied last* — the build lane is already the largest lane
in the factory (scaffold→tokens→components→routes, S5 spec :213–291)
and its self-lint is structural, not choreographic. Motion is a
separate review surface: a `site/motion-report.md` showing per-page
class additions is auditable alone, and a motion defect never forces
a rebuild revert — classes come off without touching structure.
Ordering inside S5 keeps S6/S7 untouched; the responsive lane (separate
audit) slots as S5c before it because responsive fixes can change grid
structure the cascade selectors key on — motion after layout settles.

**Ordering proposal (final):** S5a distill → S5b build → **S5c
responsive-verify/fix** (sibling audit owns the spec) → **S5d motion
class-layer** → S6 → S7. S5d mints on `astro build` exit 0 *and* the
responsive lane's done; it is the last lane allowed to touch
`src/pages/`/`src/components/` markup (S6 adds `public/` assets and
endpoints, never component markup — S6 spec's write set is
`integrations.json`/`form.php`/`.htaccess`/`_headers`, disjoint).

## 8. Automation surface — mechanical vs judgment

| Check | Mechanical? | Tool |
|---|---|---|
| `<html>` gets `.js` class in `<head>` before first paint | YES — grep the layout for `documentElement.classList.add('js')` inside the head script | `tools/motion_lint.py` |
| `.rv` count per page vs `sitemap.md` type (money ≥ reveals; article ≤ N) | YES — AST/grep per route | `tools/motion_lint.py` |
| One `IntersectionObserver` in the whole bundle (no per-component observers) | YES — `grep -c "new IntersectionObserver"` == 1 | `tools/motion_lint.py` |
| No banned libs: `framer-motion|gsap|anime|aos|locomotive` absent from `package.json` + imports | YES — package.json + import scan | `tools/motion_lint.py` |
| Added-JS budget: `motion.js` ≤ **8 KB raw / ~3 KB gzip** (house wiring ≈5 KB total: Base IO ~20 lines + BaDeck ~114 + deck ~19; budget = 1.5× the reference) | YES — `wc -c`/`gzip -c` | `tools/motion_lint.py` |
| `prefers-reduced-motion` block exists and names every `@keyframes` | YES — keyframe-name set ⊂ media-query coverage set | `tools/motion_lint.py` |
| Only compositor-safe properties animated: allowlist `opacity|transform|clip-path|stroke-dashoffset|stroke-dasharray|filter` — no `width|height|top|left|margin|padding` in transition/animation declarations | YES — CSS parse + property allowlist | `tools/motion_lint.py` |
| No-JS render: every `.rv`/`.in`-gated element visible without JS (all hidden-states `.js`-prefixed) | YES — selector-prefix check: every `opacity:0|visibility:hidden` rule in motion.css is `.js`-scoped | `tools/motion_lint.py` |
| Interactive widgets keyboard-reachable (`.ba` has tabindex + keydown) | HALF — presence checkable, correctness is a Playwright/DOM walk | `tools/motion_lint.py` flags; lane verifies |
| Which sections get `.rv`, which grids cascade, whether icon-draw vs node-pop fits a tile set | NO — judgment from content semantics; the mapping table (§9) is the guide, the lane reports choices in `motion-report.md` | lane |
| Parallax opt-in per niche (F5) | NO — competition-census judgment | lane |
| `motion-report.md` emitted: per route, classes added, components armed, flagged mismatches | YES — format check | `tools/motion_lint.py` |

The `tools/motion_lint.py` stub (pattern: `tools/competitor_sitemap.py`,
`tools/kw_volume.py` stubs in the SOP §10.4 — same convention): inputs
`sites/<slug>/` + `site/sitemap.md`; exits non-zero on any failed
mechanical row; called by the motion lane's self-lint AND re-run inside
S7's gate (the SEO gate gains a motion section or `seo-gate-report.md`
gets a `motion` column — sibling audit coordination needed: the
AuditGateDeploy lane owns the 13-check table).

## 9. Content-driven placement — module-type → animation-class mapping

The lane's core decision, made *mechanical-by-table* so two lanes map
the same content identically:

| Content module type (from `content-final` + `PAGES/*/SPEC.md`) | Classes/components | Rationale |
|---|---|---|
| Hero (any page) | `.photo`-style settle on hero img; `.rv` on headline block; `shead-underline` on H1 | every page's first impression; Apiary's slow-zoom is `photo-settle` reversed — pick one per niche, never both |
| Section headers / `.shead` | divider-wipe + `shead-underline` | the house signature; zero JS beyond shared IO |
| Card grids (services, advantages, features) | `.rv` cascade on the grid | reads as "stamped," not slab-drop |
| KPI/stat blocks | `.rv` cascade + *optional* count-up (rAF on `.in`, ~20 lines, only where brief-verified numbers) | stats are the strongest count-up candidate; decorative count-up on invented numbers is banned (F-auth) |
| Icon tiles w/ SVG icon set | `icon-draw` + `icon-beat` on the accent path | needs the icon SVG shipped by build; absent set → flag, skip |
| Diagram/process graphics | `node-pop` + `svg-line-draw` | the car-diagram pattern; requires SVG in markup |
| Before/after gallery | `.ba` + `.ba-thumbs` | requires real media pairs; else flag |
| Reviews/testimonials list | `.rdeck` (drag) + `.rv` cascade on slides | house deck; works without the drag script |
| FAQ / accordion | none (native `<details>`) or `.rv` on the block | `<details>` is the a11y-correct primitive; don't animate the disclosure itself |
| Comparison sections (product-vs-service, vs-competitor) | `.ba` if visual, else `.rv` + hover-lift on cards | mapping from intent-classified rows |
| CTA buttons | `btn-arrow` hover | ambient, free |
| Linked cards / nav lists | `hover-lift` + `img-zoom` on thumbs | Apiary's `group-hover:scale-105` idiom, pure CSS |
| Location/suburb chip lists | `.rv` cascade on `.chips`/`.towns` | matches house towns pattern |
| Contact/quote forms | `.rv` only — never animate form internals | motion around a form is noise; Apiary's `animate-in fade-in` on the submit-confirm is acceptable (`fade-in` class, CSS-only) |
| Footer/nav | none | chrome stays static (drawer stagger is the one exception — mobile only) |
| Article body prose | `.rv` on the article container only — never per-paragraph stagger | reading flow; a paragraph-by-paragraph reveal is the kind of "delight" that kills readability |
| Drawer (mobile nav) | `mdrawer-stagger` | the one ambient-everywhere pattern |

**Budget per `type`:** `money` = full table; `article` = reveals +
dividers + divider-wipe only (no icon-draw/nodes unless the article is
a process page); `utility`/`ancillary` = reveals + drawer + hovers.
This rides the existing closed `type` set — no new classification
needed.

## 10. SOP skeleton — `web-animate-<site>` lane steps

(modeled on `WEB-FACTORY-SITEMAP-SOP.md` step format)

1. **Mint check.** `sites/<slug>/` builds (S5b done), S5c responsive
   lane closed; `site/sitemap.md` row count == `ROUTE-MANIFEST.json`
   count re-checked (the same parity every stage mints on). Refuse on
   missing `design-dna/TOKENS.json` — `--ease` and accent color come
   from it.
2. **Inventory.** Walk `ROUTE-MANIFEST.json` + `content-final/` front-
   matter `type` + built `src/components/`; emit per-route the content
   module list (hero, grids, icons, comparisons, stats, faq…). This is
   the lane's input table — cite it in `motion-report.md`.
3. **Competition bar.** Re-read the S1 competitor set / S5 refs for
   motion presence (reveal-on-scroll, sliders, animated icons) — sets
   the per-site ambition ceiling. Record in report; if S5 already
   captured it under `design-dna/`, reuse, never re-fetch.
4. **Ship `motion.css`** — `.js`-gated selectors, taxonomy classes,
   `prefers-reduced-motion` block, `overflow-x: clip` on `main`. All
   keyframes/transitions on the compositor-safe allowlist only.
5. **Ship `motion.js`** (public/, same-origin, ≤8KB raw): the `.js`
   boot + the one shared IO (`.rv, .svc-stage, main > section, .ba,
   .photo` selector list) + per-component wiring (`.ba` pointer/keys,
   `[data-deck]` drag, count-up where flagged). Linked `<script
   src="/js/motion.js">` in `<head>` — satisfies S6's `script-src
   'self'` CSP (F3).
6. **Class pass.** Add `.rv`/`.in`-targets and component arming classes
   per §9 — **classes and attributes only**; a needed-but-missing
   component is a report flag, never built here.
7. **Self-lint.** `tools/motion_lint.py` (or the manual rows until it
   lands): one observer, banned-lib scan, property allowlist, `.js`-
   prefix on every hidden state, reduced-motion coverage, JS budget,
   `.rv` count vs page type.
8. **Commit seams.** `site: motion-css`, `site: motion-js`, `site:
   motion-classes` — the three artifacts reviewable apart (mirrors the
   inject-then-cleanup commit discipline S4 uses).
9. **Report.** `site/motion-report.md`: per route — classes added,
   components armed, flagged content-without-component, per-competitor
   motion bar, reduced-motion/JS-off story.
10. **Done.** `prd_step done` — closing names pages animated, patterns
    used, budget consumed (`motion.js` bytes), flags.

## 11. Cross-module contracts

| Owes to | What | Status |
|---|---|---|
| S5a distill | `design-dna/TOKENS.json` carrying `--ease` + accent; `COMPONENTS.md` listing `.ba`/`rdeck`-class interactive components *as components* (today COMPONENTS.md is specced as "shared component list with prop shapes" — must name the interactive set or F4 bites) | needs S5a spec line |
| S5b build | ships the component markup (`.ba`, `.rdeck`, drawer, `.svc-stage`-class diagrams) **inert** — wired but un-armed; imports `motion.css` path in the layout | needs S5b spec line |
| S5c responsive (proposed sibling lane) | finishes layout before `.rv` selectors cascade — motion after layout settles | coordinate w/ AuditResponsive |
| S6 integrations | `script-src 'self'` CSP satisfied by `public/js/motion.js` (F3) — S6 never needs to weaken for motion; if an operator-supplied inline script lands, it rides the same CSP-exemption path S6 already flags | compatible, needs naming |
| S7 gate | `seo-gate-report.md` gains motion rows or a `motion:` column: banned-lib scan, budget, `.js`-prefix, reduced-motion coverage — all mechanical re-runs of `motion_lint.py` | coordinate w/ AuditGateDeploy |

**Conflicts found:** F3 (CSP vs inline scripts) is the only hard one —
resolved by shipping `motion.js` as a file. Softer: the "animation
lane adds classes to `src/pages/`" write surface overlaps S5b's
`write_paths` — the stage ordering (S5d mints only after S5b closes)
makes them sequential, never concurrent, so `write_paths` disjointness
holds.

## 12. Verdict — what must exist before this module's PRD

1. **Named mechanism base:** the spec declares Dents Direct's `.js`-
   gate + shared-IO + transition/keyframes pattern the house mechanism
   and Apiary the vocabulary donor (F1). One paragraph kills the
   "which codebase" ambiguity.
2. **`motion.css`/`motion.js` artifact shapes** with the JS budget
   (≤8KB raw) and the compositor-safe property allowlist (§8).
3. **The §9 mapping table** adopted into the spec verbatim — it's the
   content→animation contract that makes two lanes produce identical
   output.
4. **CSP resolution** (F3, option a) — `public/js/motion.js`, head-
   loaded, no `defer` — coordinated with the integrations spec.
5. **Stage slot** S5d + mint precondition (S5c responsive closed) —
   the runbook's pipeline table gains one row; S6/S7 unchanged.
6. **`tools/motion_lint.py`** stub named in the spec's automation
   section (factory convention: stubs named in SOPs land later —
   `tools/competitor_sitemap.py`, `tools/kw_volume.py` precedent).
7. **`site/motion-report.md`** named as the review artifact — the
   same role `cleanup-report.md`/`DESIGN-DNA.md` play.

Without (1) and (4) the lane can't start; (2)–(7) are one spec's worth
of work, all sketched above.
