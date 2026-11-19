# Source study — mdconsultingny.com (2026-11-19)

Astro v5 site (`data-astro-*`, `/_assets/`, ClientRouter view
transitions, `astro:before-preparation` hooks). Med-spa marketing
agency — **the only site of the five carrying the "process vine"
component family**. No animation libraries; all CSS keyframes + SMIL.

## The shared component: `*-vine` animated process illustration

Found in every `service-deep-dive` section — a 280×380 SVG in the
sticky right column (`lg:col-span-5 lg:sticky lg:top-24`) of a
`grid-cols-12` content split. Each service gets a **namespaced variant**
— identical skeleton + animation vocabulary, unique inner iconography:

| Prefix | Section | Inner icon |
|---|---|---|
| `sgr-*` | "SEO That Puts Your Practice on the Map" | compass/radar + ripples |
| `afe-*` | "Paid Advertising …2.4x ROI" | ad-funnel motif |
| `sel-*` | "Social Media That Generates Leads" | social nodes |
| `scp-*` | "Your Website Is Your Digital Storefront" | storefront/scope |
| `lsr-*` | `/services/med-spa-seo/` page | same template, fifth skin |

Captures: `comp-{sgr,afe,sel,scp,lsr}.html` (full SVG markup),
`component-css*.json`, `frames-sgr-*.webp`.

### Anatomy (per variant)

```
<svg viewBox="0 0 280 380" aria-hidden>
  <path {p}-vine-bg>        ← faint static vine, zigzag down the column
  <path {p}-vine-pulse>     ← accent dash overlay, animated
  leaf sprigs (static, opacity .1)
  <g transform="translate(140,45)">
    <g {p}-float-a>
      3× <circle {p}-ripple-N>  ← concentric rings around top node
      organic blob border + inner icon (per-service)
    </g>
    <text> node label (VISIBILITY / …)
  <g {p}-float-a|b> ×2      ← middle nodes with SMIL bob
  <g {p}-bloom>             ← bottom node, opacity pulse
```

### Animation vocabulary (identical per prefix, namespaced keyframes)

| Class | Keyframes | Params | Taxonomy |
|---|---|---|---|
| `{p}-vine-pulse` | `{p}-flow` `dashoffset 76→0`, opacity .3→.8→.3 | 4s `linear` infinite; `dasharray:16 60` | dash-flow loop |
| `{p}-float-a` | `{p}-floatA` `translate(0)→(-3,-5)→(0)` | 6s `ease-in-out` | bob loop |
| `{p}-float-b` | `{p}-floatB` `translate(0)→(3,-4)→(0)` | 7s `ease-in-out` | bob loop |
| `{p}-ripple-1/2/3` | `{p}-ripple` `scale(.85→1.15)` opacity .2→0 | 3s `ease-out`, delays 0/1/2s | phased ripple |
| `{p}-bloom` | `{p}-pulse` `opacity .9→1` | 3s `ease-in-out` | breathing pulse |
| SMIL `<animate attributeName="cy" values="120;113;120">` | node bobbing | 7–9s `indefinite` | svg-attr loop |

Trigger: **load + loop**, no IO gating (runs continuously once
rendered; sticky column keeps it on screen while the user reads the
service text — that's the point). `js_dependency: none` — the only JS
on the page is Astro ClientRouter + booking modal + analytics.

### Why it works (the "designed" read)

- **Editorial anchor**: sticky column means the illustration is the
  constant visual while text scrolls — the loop keeps it alive without
  competing (all strokes, low opacity).
- **One metaphor per service**: same grammar (vine + nodes + ripple),
  different icon — reads as a coherent system, not clipart.
- **Calm timing**: 3–9s periods, ease-in-out, low-contrast `#5E9FA3`
  accent on `#0A1F30`/`#DAE5E3` neutrals; nothing exceeds a 5px drift.
- **Layered life**: 5 simultaneous micro-loops (flow/ripples/2 floats/
  bloom + SMIL bob) inside ONE framed object — richness within a single
  focal element, so M.4 is satisfied even though many things move.

## Ambient decorations (page-level, every section)

| Class | Animation | Params |
|---|---|---|
| `.bg-blob-1/2/3` | `blobMorph1/2` `border-radius` morph + `blobDrift` translate(±40px,±30px)/scale(.94–1.06) | 16–20s `ease-in-out` infinite, some `reverse`; tinted `#5da4ac17`/`#b2a0951c`, `z-index:-1`, `pointer-events:none` |
| `.botanical-leaf` | `leafSway` rotate ±2° + translateY −3..−6 | 20s `ease-in-out`; `--leaf-opacity` (≈.02) per instance; `<use href="#leaf-1">` sprite |

Note `border-radius` morphing is **paint-bound, not composited** —
licensed ambient exception (blobs are huge translucent washes, repaint
cost is low but real).

## Other animation surfaces

- `astroFadeIn/Out`, `astroSlide*` — Astro ClientRouter **view
  transitions** (page morphs on nav).
- `ct-encoded-form-loader-spin`, botpoison/turnstile — third-party form
  plumbing, not design motion.
- Decorative static vine divider SVG (400×40) — same visual language,
  unanimated.

## Reduced motion (shipped)

Global `*` `animation/transition-duration:.01ms !important` +
`iteration-count:1` under `(prefers-reduced-motion:reduce)`; blobs stay
visible (they're backgrounds), mobile-nav/modal transitions nulled,
view-transitions disabled via `::view-transition-*{animation:none}`.

## Classification vs taxonomy

`trigger: loop`, `technique: css-keyframes` (+ `smil`, `view-transition`),
`loop_type: phased` (ripple delays) + `infinite`, `timing_class:
loop-short` (3–9s) + `loop-ambient` (16–20s blobs), `complexity:
choreographed` (vine) / `composite` (blobs), `easing: ease-both`-ish
(ease-in-out), `purpose: ambient/explanation`, `personality: elegant`
(organic, slow, no overshoot — a different flavour than tamdoma's
professional).
