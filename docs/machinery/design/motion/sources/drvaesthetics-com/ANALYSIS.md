# Source study — drvaesthetics.com (2026-11-19)

**WordPress + Bricks** (`bricks.min.js`, AutomaticCSS, Perfmatters,
CleanTalk, Splide) — NOT Astro. No `*-vine` component, no SMIL, no
bespoke animated SVGs. The site "feels designed" through the
**Bricks interactions system** — declarative `data-interactions` JSON
driving animate.css keyframes on scroll-entry.

## The entrance system (shared with jcsignatureaesthetics)

```html
<div class="brxe-heading … brx-animated"
     data-animation="slideInLeft"
     data-interactions='[{"id":"…","trigger":"enterView",
        "action":"startAnimation","animationType":"slideInLeft",
        "runOnce":"1"}]'>
```

- **Trigger**: `enterView` (IO under the hood, `runOnce:"1"`)
- **Action**: `startAnimation` → adds `brx-animate-{type}` class →
  animate.css keyframe (`fadeIn`, `fadeInUp`, `fadeInLeft/Right`,
  `slideInLeft/Right/Up` observed)
- **Keyframes**: vendored animate.css set (~90 kf names in stylesheets,
  duplicated — Breeze/asset merge ships it twice)
- Also `contentLoaded/show`, `click/show|hide|javascript` triggers for
  popups (templateId targets).
- Elements carry `entered`/`exited` classes (IO state tracking) —
  scroll-past-out then scroll-back replays only if `runOnce` unset.

## Inventory

| What | Finding |
|---|---|
| svg | present (icons), none animated; 0 SMIL |
| canvas | 0 |
| libs | no gsap/lottie/aos runtime; animate.css = keyframe lib only; Splide present for sliders (`splide-loading` kf) |
| live loops at audit time | none — entrance system is one-shot; page is static once revealed |
| third-party | `floatingEstimator`/`calculator` expand/collapse keyframes (booking widget), CleanTalk loader spins |

## Taxonomy read

`trigger: in-view` (enterView), `technique: css-keyframes` + class
toggle, `loop_type: none`, `timing: standard/slow` (animate.css
defaults ≈1s), `easing: ease-out` family, `purpose: entrance`,
`js_dependency: library` (Bricks runtime, but the *mechanism* maps to
our `reveal-fade`-class recipes), `personality: professional` (slides,
no bounce used — despite the full elastic set being available).

Contrast with mdconsultingny: same *job* (make sections feel authored)
via a heavier stack — a builder plugin + a 90-keyframe library to
achieve what the vine component does with ~40 lines of CSS.
