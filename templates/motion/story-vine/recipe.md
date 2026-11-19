---
id: recipe-story-vine
type: motion-recipe
taxonomy:
  trigger: loop
  technique: css-keyframes
  property: [stroke-dashoffset, transform-translate, transform-scale, opacity]
  budget: stroke-cheap
  m_type: emotional
  purpose: [ambient, explanation]
  timing_class: loop-short
  easing_family: linear
  loop_type: phased
  complexity: choreographed
  js_dependency: none
  personality_fit: [professional, elegant]
source: mdconsultingny.com — *-vine SVGs (sgr-/afe-/sel-/scp-/lsr-),
  {p}-flow 4s, {p}-floatA/B 6–7s, {p}-ripple 3s phased, {p}-pulse 3s,
  SMIL cy bobbing
---

# story-vine — zigzag process illustration

A 280×380 zigzag SVG that sits in a sticky column beside per-service
copy (mdconsultingny's "deep-dive" pattern — one vine per service,
namespaced `sgr-`/`afe-`/`sel-`/`scp-`/`lsr-`). Four loop idioms run
simultaneously — the motion IS the illustration, there is no entrance:

- **flow**: `stroke-dasharray 5 9` marches −56px (4×dash period = seamless)
- **bob**: nodes `translateY(4px)` on 6–9s alternating loops, `-d` phased
- **ripple**: 3 rings expanding `.5→1.9` fading `.55→0`, 1s apart
- **pulse**: accent fill opacity breathing on a 3s cycle

## Parameters

| Token | Default | Notes |
|---|---|---|
| viewBox | 280×380 | sticky column width; scales with the sticky panel |
| flow | 4s linear | keep dasharray |offset| = k×period for seamless wrap |
| bob | 6–9s alternate, ±4px | per-node `--dur`/`--d` = the phasing |
| ripple | 3s ease-out, 3 rings | `--d` 0/1/2s on identical keyframes |

## When to use

Process/services sections where each offering gets one visual beat.
Pair with `position:sticky` on the SVG wrapper and one text block per
zigzag beat (mdconsultingny hides it ≤1280px where the column collapses).

## Rules

- prefix classes per instance (`sgr-`, `afe-`, …) — each service's vine
  has its own colour story and keyframe names in the source; reusing
  names across SVGs on one page collides
- all loops ambient-linear — do not add entrance animations to the vine;
  it exists as soon as it's visible
- reduced-motion: kill all animations AND hide ripple/bloom rings —
  a frozen mid-ripple reads as drawing debris
- CSS `transform` on SVG nodes replaces the source's SMIL `cy`
  animation — same visual, compositor-cheap, and it survives the DOM
  (SMIL gets stripped by reduced-motion JS on the source site)
