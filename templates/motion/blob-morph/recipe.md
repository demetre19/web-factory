---
id: recipe-blob-morph
type: motion-recipe
taxonomy:
  trigger: loop
  technique: css-keyframes
  property: [border-radius, transform-translate, transform-scale]
  budget: paint-bound
  m_type: emotional
  purpose: [ambient]
  timing_class: loop-ambient
  easing_family: ease-both
  loop_type: palindrome
  complexity: composite
  js_dependency: none
  personality_fit: [elegant, subtle]
source: mdconsultingny.com — .bg-blob-1/2/3 (blobMorph1/2 + blobDrift, 16–20s)
---

# blob-morph — ambient border-radius blobs

Oversized `div`s morph `border-radius` through multi-corner blob shapes
while a slower translate drifts them across the section. mdconsultingny
runs three (`blobMorph1`, `blobMorph2`, `blobDrift`) as an atmospheric
wash behind hero copy.

## Parameters

| Token | Default | Notes |
|---|---|---|
| morph period | 16–20 s alternate | `ease-in-out` both ways (palindrome) |
| drift period | 17–22 s, different prime-ish | desynced from morph = organic |
| size | 30–46 vmin | bigger than it needs to be; edges soften out |
| blur | `filter: blur(60px)` + opacity ≤.16 | softens the repaint cost |
| count | ≤3 | each is a full-element repaint per frame |

## When to use

Ambient section backgrounds where the brand wants "living air" — med-spa
calm, saas premium. `paint-bound` budget: `border-radius` + `filter` are
repaint-cost properties, licensed ONLY as ambient wash behind content.

## Rules

- paint-bound constraints are the licence: big + blurred + low-opacity +
  few + `pointer-events:none` + behind content (`z-index:0`)
- never on cards/buttons/repeated elements — repaint cost scales with
  count and area
- `filter:blur()` on the blob itself is the softener, not a second
  animation layer — don't animate the blur radius
- reduced-motion: freeze (`animation:none`), keep the static wash —
  removing blobs changes the page's colour balance
- counts against M.4 focal budget as ambient, not as the focal animation
