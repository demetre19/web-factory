---
id: recipe-rise-words
type: motion-recipe
taxonomy:
  trigger: in-view
  technique: css-keyframes
  property: [transform-translate]
  budget: compositor-safe
  m_type: structural
  purpose: [entrance]
  timing_class: standard
  easing_family: ease-out
  loop_type: none
  complexity: composite
  js_dependency: light
  personality_fit: [professional, elegant]
source: astromaxsp.lexdemos.com — Rise component
  (/_astro/Rise.DgCFXQTh.css + BaseLayout is-in release)
---

# rise-words — per-word masked rise

Lexington's `Rise` headline component: each word sits in a clipped
inline-block window; its inner span rises `translateY(130%) → 0` on a
`.9s cubic-bezier(.2,.8,.2,1)` arc, staggered by a build-time `--i`
index (`--i*40ms + 100ms`). The text is split by the template, not by
JS — the markup ships `<span class="rise-word"><span style="--i:N">`.

## Parameters

| Token | Default | Notes |
|---|---|---|
| `--i` | per-word index | delay = `--i*40ms + 100ms` |
| rise | .9 s | from 130% below the clip line |
| easing | `cubic-bezier(.2,.8,.2,1)` | strong ease-out with a soft entry |
| clip | `overflow:clip` + `overflow-clip-margin:.2em` | descender/j tail room |

## The scroll-gate trick

`[data-rise-scroll]:not(.is-in) .rise-word>span` sets
`animation-play-state:paused`. Words are pre-rendered *inside their
masks* — no opacity flash, no replay race — and the trigger just adds
`.is-in` once (IO `rootMargin:0 0 -15%` ≈ ScrollTrigger `top 85%`).

## When to use

Hero/display headlines — the signature Lexington entrance. Keep to one
h1 per page; below-fold headlines read as noise.

## Rules

- split at build time (Astro component / template partial) — runtime
  splitting needs a library and fights hydration; don't
- keep `overflow-clip-margin` ≥ .2em or j/g/p descenders clip
- `animation-fill-mode:both` + the paused pre-state means the keyframe
  needs only a `0%` frame — never a loop
- reduced-motion: `animation:none` (words sit at natural position —
  the paused mask never engages because `.is-in` is moot)
- `aria-label` the full phrase on the h1 — screen readers read
  `.rise-word` spans word-by-word cleanly already, but the label is
  belt-and-braces for split markup
