# Source study — tamdoma.ai (2026-11-19)

Captured live in headless Chromium (1440×900), `prefers-reduced-motion:
no-preference` forced via CDP emulation — the site otherwise ships a
correct reduced-motion fallback and headless defaults masked every
animation (`animation-duration: 1e-05s`).

- Site: Astro one-pager. **Zero animation JS libraries** — no GSAP,
  ScrollTrigger, Lottie, anime.js, Rive, canvas, video, or `<lottie-player>`.
- **Zero SMIL** (`animate`/`animateTransform`/`animateMotion`) in the
  shipped DOM — yet the inline script still removes SMIL nodes under
  reduced-motion, i.e. templates are allowed to contain it.
- All motion = CSS keyframes + CSS transitions, two `<script
  type="module">` snippets (~2.1 KB total, unminified-equivalent).
- Theme: page is dark-on-parchment; tokens: `--sage-500:#90a985`,
  `--ease-out:cubic-bezier(.19,1,.22,1)`, `--ease-soft:cubic-bezier(.33,1,.68,1)`.

## Raw captures in this folder

| File | Contents |
|---|---|
| `page.html` | full DOM as served |
| `Layout.css` `Backdrop.css` `OnePager.css` | the 3 stylesheet bundles (all animation code) |
| `css-keyframes.json` | every `@keyframes` + every rule that applies an animation, incl. `@media`/`@supports` context |
| `svgs.json` | all 56 `<svg>` elements, flagged `animated`, with per-element computed animation |
| `frames-*.webp` | 3-frame sequences per animated region (≈1.2 s apart) |

## Inventory — every animation found

### 1. Reveal system (IntersectionObserver → class, CSS transition)

Inline script: `IntersectionObserver` (`threshold:.08`, `rootMargin:0 0
-10%`) adds `.in` to `.reveal, .focus-reveal, .bd`, then unobserves.
Under reduced-motion it adds `.in` to everything immediately.

| Pattern | Mechanism | Params | Purpose |
|---|---|---|---|
| `.reveal` → `.in` | `opacity` + `translateY(28px)` transition | 1 s `--ease-out`, stagger `transition-delay:var(--d)` (0–160 ms) | in-view entrance, structural |
| `.focus-reveal.in img` | `filter:saturate(.3) blur(14px)` → `saturate(.82) contrast(1.02)`, `scale(1.08)` → none | 1.6 s `--ease-out`, `--d` delay | founder-photo "focus" moment, emotional. **Note: animates `filter` — outside the M.7 transform/opacity budget** |
| `#h1.lines-in .line-mask>span` | line-mask headline: `translateY(115%)` → none | 1.1 s `--ease-out`, `--d:120ms` per line | load-time hero entrance |
| `.bd .draw` → `.bd.in .draw` | `stroke-dashoffset:1 → 0` transition, `pathLength="1"`, `stroke-dasharray:1` | 2.6 s `--ease-out`, `--late` stagger 0–0.6 s | backdrop paths "draw themselves" once when section enters |
| `.pair.is-active > .bd-split .draw` | same draw transition, gated by active scroll-step | 2.2 s, delay .6 s | per-pair divider drawing during split scroll |

### 2. `.st` step icons — 4 choreographed SVG loops (the "how it works" machine)

112×112 icons inside a shared `--pass:6s` timeline. Every descendant
animates with
`animation-duration:var(--pass); infinite; fill-mode:both;
var(--ease-out); delay:calc(var(--arrive) + var(--o,0)*.16s)` where
`--arrive` is computed per-step from a 4-step cycle. Keyframes use
percentage windows so each icon is a looping mini-story (~44% act, ~56%
reset):

| Icon | Elements | Technique |
|---|---|---|
| `st` #9 brief | `st-house` stroke tint + 3× `st-draw` lines | `stroke` color pulse; line-draw loop (`dasharray:1`, `dashoffset:1px→0→1px`) with `--o` stagger |
| `st` #10 scan | `st-pop` centre dot, `st-lens` magnifier group | `scale(0→1)` pop; `translate(-18,-14)→none` lens glide |
| `st` #11 bars | 3× `st-bar` rects | `scaleX(0→1)` with `--o` stagger — axis growth, professional |
| `st` #12 done | `st-box` tint + `st-draw` check | `fill-opacity 0→1` + line-drawn checkmark |

Trigger: loop, always running. `--pass` token shares one timeline across
all four icons.

### 3. `.sico` service icons — 6 looping SVG scenes (120×120)

All use the same idiom: `pathLength`, `--k` per-element offsets inside
one keyframe timeline, `transform-box:fill-box` for correct origins.

| Icon | Keyframes | Mechanism | Loop |
|---|---|---|---|
| automation | `belt`, `blip` | boxes `translate(-6px→72px)` inside `<clipPath>` in/out windows, delay `calc(var(--k)*-2.5s)` (negative-delay phase spread); ECG path dashes `dashoffset 48→0` | 7.5 s / 2.5 s |
| strategy | `scan`, `pick` | scanner dot slides along a path polyline (translate keyframes 0–90%), `pick` text opacity window | 9 s |
| development | `stack` | 4 module rects fade-drop in with `--k*.5s` stagger | 8 s |
| marketing | `b1–b3`, `wave` | buyer dots converge `translate(48px,±y)`; sonar ring `scale(1→2.6)` + fade | 1.5–6 s |
| design | `snap` | rects "snap" from scattered `--sx/--sy/--sr` to grid and back | 8 s `--ease-soft` |
| content | `write`, `stamp` | 5 text lines draw via `dashoffset 32→0` staggered .3 s; check stamp `scale(0→1)` | 7 s |

### 4. `.bd` ambient backdrops — full-bleed decorative SVG loops

1600×900 `preserveAspectRatio="slice"` SVGs behind sections; all
`linear`, very long periods (decoration — the site's licensed
"continuous loop" tier):

| Backdrop | Keyframes | Params |
|---|---|---|
| `bd-promise` `.years` `.cycles` | `bd-turn` rotate 360° | 360 s linear infinite / 60 s reverse — concentric tick dials |
| `bd-multiplier .lanes path` | `bd-flow` `dashoffset → -160px` | 24 s linear — marching dashes along fan-out lanes |
| `bd-book .hand`, `bd-thanks .next` | `bd-turn` | 240 s / 180 s, `transform-box:view-box` + explicit `transform-origin` |
| `circle-bg .pieces` | `spin` | 180 s linear — dashed arc pieces rotate as one group |
| `circle-bg .pieces path`, `.stray path` | `drift` | 14 s — **dead animation: `@keyframes drift` is never defined** (harmless no-op; would have been per-piece drift) |

All `.bd` also participate in the `.in` reveal: hidden → drawn on entry.

### 5. `.io` word cycler + `.rig` progress rig ("input → output" demo)

- 5 `p.io-t` phrases stacked in one grid cell; `io-need` (left col) /
  `io-result` (right col) keyframes = translateY(±10px)+opacity windows,
  `calc(var(--pass)*5)` period, `delay:var(--pass)*var(--k)` →
  phrases hand off every `--pass` (6 s).
- `.rig` animates `@property --p` (registered `<number>`) 0→1 over the
  same `--pass`; `.track-fill` reads `transform:scaleX(var(--p))`,
  `.token` positions `left:calc(var(--p)*100%)` — a progress bar driven
  by custom-property interpolation. `track-fade`/`token-fade` fade the
  bar/token out at cycle end. **Modern trick, requires
  `@property`; degrades to frozen bar where unsupported.**

### 6. Scroll-linked divider + split steps (the only scroll-binding JS)

`.split` is `--n * 40vh + 100vh` tall with a sticky `.split-stage`.
rAF-throttled scroll handler:

- `#divider-path` (`<svg viewBox="0 0 2 1000">`, `stroke-dasharray:1000`):
  `strokeDashoffset = 1000 − progress·1000` → a vertical line draws down
  with scroll.
- progress quantised → `.pair` gets `.is-active/.is-prev/.is-next`
  (CSS: `.pair` opacity transition .55 s `--ease-soft`; prev/next cells
  `translateY(∓36px)`); `.sdot` pills track active step and
  click-to-scroll `behavior:"smooth"`.
- `@media (max-width:840px)` disables the whole sticky rig
  (`height:auto`, static pairs, no transition).

### 7. Micro-interactions (transitions only)

| Element | Transition |
|---|---|
| `.sys-btn` | `border-color, background` .2 s `--ease-soft` |
| `.sys-menu` open | `opacity, transform, visibility`, items `sys-in` keyframes stagger `--i*60ms+60ms` (fade + translate −10px) |
| `.sys-chev`, `.sys-hub-arr` | `transform` — `--ease-out` hover shift |
| `.sys-hub`, `.sys-item` | `border-color`/`background` .2 s |

### 8. Reduced-motion handling (shipped, two layers)

1. JS branch: removes all SMIL elements, adds `.in` to every
   reveal/backdrop, applies `lines-in` to h1.
2. CSS: `* { transition-duration:.01ms !important; animation-duration:
   .01ms !important; animation-iteration-count:1 !important }` plus
   scoped `animation:none` overrides per component (`.sico`, `.st`,
   `.bd`, `.io-t`, `.rig`, `.track-fill`, `.token`, `.circle-bg`).

## Aggregate read

- **13 animated SVGs** of 56; **26 defined keyframes** (`drift` used but
  undefined — a shipped dead animation).
- Techniques in use: CSS keyframes on SVG internals (dominant), CSS
  transitions triggered by IO class-toggles, `pathLength`-normalized
  stroke drawing (loops + once), `stroke-dashoffset` marching dashes,
  clipPath-windowed translate loops, `transform-box:fill-box` scaling,
  `@property` number interpolation, rAF scroll progress → dashoffset +
  class quantisation.
- Trigger mix: `load` (h1), `in-view` (reveals, backdrops), `loop`
  (icons, backdrops, cycler, rig), `scroll-linked` (divider/pairs),
  `hover/click` (nav).
- Personality read: **professional** (axis growth, no overshoot
  anywhere, `--ease-out/--ease-soft` only, zero elastic/bounce) with
  ambient-decoration loops kept to 1–2 per viewport and periods ≥6 s.
- Performance: everything animates `transform`, `opacity`,
  `stroke-dashoffset`, `fill-opacity` — all cheap except
  `.focus-reveal`'s `filter:blur(14px)` transition (paint cost, flagged).
