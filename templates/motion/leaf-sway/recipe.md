---
id: recipe-leaf-sway
type: motion-recipe
taxonomy:
  trigger: loop
  technique: css-keyframes
  property: [transform-rotate]
  budget: compositor-safe
  m_type: emotional
  purpose: [ambient]
  timing_class: loop-ambient
  easing_family: ease-both
  loop_type: palindrome
  complexity: composite
  js_dependency: none
  personality_fit: [elegant, subtle]
source: mdconsultingny.com — .botanical-leaf (leafSway 20s, --leaf-opacity)
---

# leaf-sway — ambient botanical sway

A decorative leaf cluster rotates a few degrees around its stem on a
16–24 s alternating loop, offset behind section copy at low opacity.
mdconsultingny's signature ambient: transform-only → compositor-cheap,
and it's the med-spa "alive but calm" tell.

## Parameters

| Token | Default | Notes |
|---|---|---|
| period | 16–24 s alternate | stagger per leaf group (phased) |
| arc | −6°…+7° | small; reads as breath, not wind |
| origin | stem (`transform-box:fill-box`, bottom-left) | leaves hinge, not orbit |
| `--leaf-opacity` | .5 light / .35 dark | theme token — flourish never fights copy |

## When to use

Behind hero/section copy on organic brands (med-spa, wellness,
botanical). Exactly one per page — it's a flourish, not a system.

## Rules

- `transform-box:fill-box` + explicit origin is required or the leaf
  orbits the viewBox centre
- rotate only — adding translate/scale reads as machinery
- `--leaf-opacity` follows the theme tokens; a leaf that can't dim in
  dark mode is a bug
- reduced-motion: freeze at rest pose (`animation:none`), keep the
  static leaf — it's also a decoration, not only motion
