---
id: motion-classifier
type: spec
links:
  uses: [motion-taxonomy]
  feeds: [patterns-index]
  used_in: [w2, w8]
---

# CLASSIFY-MOTION — detecting & classifying micro-animations on any site

Spec for SiteScanner (capture) and PatternMiner (canon). Output slots
into a capture's `meta.json` as a top-level `motion` object — additive,
no existing field changes.

## 1. Detection pipeline (real browser required)

Static HTML misses computed animation — scan must run in Chromium with
**reduced-motion disabled**:

```js
await page.emulateMediaFeatures([
  { name: 'prefers-reduced-motion', value: 'no-preference' }]);
```

> ⚠ Tamdoma proved the hazard: with `reduce` (some headless defaults),
> every computed duration reads `1e-05s` and animations look absent.
> Always assert `matchMedia('(prefers-reduced-motion: reduce)') === false`
> before scanning.

### Step A — global probes (one `page.evaluate`)

```js
({
  libs: {
    gsap: !!window.gsap, ScrollTrigger: !!window.ScrollTrigger,
    lottie: !!window.lottie || !!document.querySelector('lottie-player,dotlottie-player'),
    anime: !!window.anime, rive: !!window.rive,
    webAnimations: !!Element.prototype.animate,
  },
  counts: {
    svg: document.querySelectorAll('svg').length,
    smil: document.querySelectorAll('animate,animateTransform,animateMotion,set').length,
    canvas: document.querySelectorAll('canvas').length,
  },
  hasProperty: [...document.styleSheets].some(ss => { try {
      return [...ss.cssRules].some(r => r instanceof CSSPropertyRule); } catch(e){ return false } }),
})
```

### Step B — keyframes + applying rules

Walk `document.styleSheets → cssRules` (catch `SecurityError` on
cross-origin sheets; fetch their `href` instead if needed). Collect:

- every `CSSKeyframesRule` → `defined_keyframes` (name → frame text)
- every `CSSStyleRule`/`CSSMediaRule`/`CSSSupportsRule` whose cssText
  matches `/animation(-\w+)?\s*:|animation-timeline|view-timeline/`
  → `animation_rules` (selector + shorthand + media condition —
  record `prefers-reduced-motion` conditions as fallbacks found)

### Step C — per-element computed pass

```js
document.querySelectorAll('*').forEach(el => {
  const cs = getComputedStyle(el);
  if (cs.animationName !== 'none' && parseFloat(cs.animationDuration) > 0)
    /* record animation record, keyframes-technique */;
  if (cs.transitionProperty !== 'none' && parseFloat(cs.transitionDuration) > 0)
    /* record transition candidate */;
});
```

For every element inside an `<svg>` use the same pass — CSS animates SVG
internals directly. Mark each record `in_svg`, capture nearest
`svg[viewBox]` + ancestor section context (`id`/`class`).

### Step D — trigger attribution

| Signal | Trigger |
|---|---|
| `performance.getEntriesByType` / inline script with `IntersectionObserver` + `.reveal`-like class adds | `in-view` — find the observer script's observed selectors (regex `querySelectorAll\('([^']+)'\)` near `new IntersectionObserver`) |
| `addEventListener('scroll'|'wheel')` + rAF or `strokeDashoffset`/`style.transform` writes | `scroll-linked` |
| `:hover`/`:focus` rules containing animation/transition | `hover` / `focus` |
| `animation-timeline: scroll()/view()` in rules | `scroll-linked` / `in-view` |
| `iteration-count: infinite`, no observer on the element | `loop` |
| `el.getAnimations()` returning `CSSTransition`/`Animation` with `playState:'running'` but no stylesheet rule | `waapi` |
| video/canvas with rAF loop | `video-gif` / `rAF-loop` |

If a script can't be attributed statically, mark
`trigger:"undetermined"` with the elements list — humans resolve during
canon review.

### Step E — frame sampling (cheap liveness check)

Screenshot the bounding box of each candidate at `t` and `t+1.2s`;
pixel-diff >1% confirms `status:"live"`. Also catches motion missed by
Step C (canvas, video, animated GIF, transforms via Web Animations with
`fill`).

### Step F — dead animations

`animation-name` set on a rule/element but the name is absent from
`defined_keyframes` → `status:"dead"` (tamdoma `drift`). Report — these
are defects worth canon-negative evidence.

## 2. Classification

Fill every record with taxonomy axes (`TAXONOMY.md`/`taxonomy.json`):

- `technique` from Step A/B evidence; `property` list from keyframe
  bodies + transition properties
- `budget`: compositor-safe | stroke-cheap | layout-risk (any `filter`,
  `clip-path`, or layout property in keyframes/transitions)
- `timing_class` from computed duration; `easing_family` from
  `animation-timing-function` / `transition-timing-function`
- `loop_type`: infinite | n-times | palindrome (`direction:alternate`)
  | phased (same keyframes + varied delay/`--k` vars) | handoff
  (shared period + disjoint opacity windows)
- `complexity`: atomic / composite / choreographed / system
- `purpose` + `m_type`: human-assisted; suggest from context class
  names (`hero`, `cta`, `icon`, `bg`, `loader`, `menu`)
- `personality_fit` + site `motion_tier` per taxonomy rollups

## 3. Output schema — `meta.json.motion`

```jsonc
{
  "motion": {
    "schema_version": "0.1",
    "scanned_at": "ISO-8601",
    "reduced_motion_emulated": false,          // guard: must be false
    "reduced_motion_fallback_present": true,   // any @media reduce or JS branch found
    "libs": ["none" | "gsap" | "lottie" | ...],
    "counts": {"svg": 56, "smil": 0, "canvas": 0,
               "keyframes_defined": 26, "keyframes_dead": ["drift"],
               "animated_elements": 26},
    "records": [
      {
        "selector": "svg.sico-automation .box",
        "context": "section#services .card",   // nearest meaningful ancestor
        "in_svg": true,
        "trigger": "loop",
        "technique": "css-keyframes",
        "property": ["transform-translate"],
        "budget": "compositor-safe",
        "m_type": "emotional",
        "purpose": ["explanation"],
        "timing_class": "loop-short",
        "duration_ms": 7500,
        "easing_family": "linear",
        "easing_raw": "linear",
        "delay": "calc(var(--k) * -2.5s)",
        "iterations": "infinite",
        "loop_type": "phased",
        "complexity": "composite",
        "js_dependency": "none",
        "status": "live",
        "keyframes": "belt",
        "personality_fit": ["professional"],
        "evidence": "computed style + rule .sico-automation .box"
      }
    ],
    "summary": {
      "motion_tier": "expressive",
      "dominant_personality": "professional",
      "focal_per_viewport_ok": true,
      "budget_violations": ["filter on .focus-reveal img"],
      "continuous_loops": 9
    }
  }
}
```

Fields are `taxonomy.json` closed sets; `duration_ms`, `delay`,
`easing_raw`, `keyframes`, `evidence` are free text. `records[]` is one
entry per **animation definition** (keyframes × element-class), not per
DOM node — dedupe on `(keyframes|transition-props, context)`.

## 4. Where it plugs in

- `SiteScanner`: runs Steps A–F during capture, writes `meta.json.motion`
  + frame-diff crops under `<capture>/motion/`.
- `PatternMiner`: consumes `records[]`; feeds `summary.motion_tier` to
  the `motion-tier` genome gene; aggregates `purpose`/`technique`
  distributions for pattern signatures; surfaces `budget_violations`
  and `keyframes_dead` as negative evidence.
- Canon motion patterns get `consumes: [motion-taxonomy]` and tag
  recipes by `recipe-<id>` when a site's animation matches a recipe.

## 5. Confidence & limits

- `status:"live"` needs either computed-style evidence AND a defined
  keyframe, or a positive frame-diff — computed styles alone can lie
  (paused, off-screen culling).
- Animations gated behind interaction states (`[data-open]`, hover)
  require replay: toggle the state during scan and re-run Step C on the
  affected subtree.
- Cross-origin stylesheets: fetch via `ss.href` when `cssRules` throws —
  missing rules = undercount, flag `partial:true`.
- JS-driven motion (GSAP timelines, rAF) can't be fully decompiled;
  record `technique`, trigger evidence, element + bounding box, and
  mark `detail:"opaque"` — classify purpose from visuals.
