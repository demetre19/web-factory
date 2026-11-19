---
id: recipe-reveal-fade
type: motion-recipe
taxonomy:
  trigger: in-view
  technique: css-transition
  property: [opacity, transform-translate]
  budget: compositor-safe
  m_type: structural
  purpose: [entrance]
  timing_class: slow
  easing_family: ease-out
  loop_type: none
  complexity: atomic
  js_dependency: light
  personality_fit: [subtle, professional, elegant]
source: tamdoma.ai — .reveal → .in (IO threshold .08, rootMargin -10%)
---

# reveal-fade — in-view fade + rise

The workhorse entrance: `opacity:0 + translateY(28px)` → rest, once,
when the element crosses into view. IntersectionObserver
(`threshold:.08`, `rootMargin:0 0 -10%`) adds `.in`, unobserves. `--d`
staggers siblings so a group reads as one sequence (M.4).

## Parameters

| Token | Default | Notes |
|---|---|---|
| duration | 1 s `--ease-out` | tamdoma uses 1s; M.2 `slow` budget |
| rise | 28px | keep <80px (M.7), pair with fade (M.7) |
| `--d` | 0/80/160ms | parent-child offset ≈100ms (M.4) |
| IO | threshold .08, rootMargin -10% | fires just before fully visible |

## When to use

Default for sections, cards, figures on `money` pages. On dense
`utility` pages prefer `subtle` variant: 4px rise, 300ms.

## Rules

- transition (not keyframes) — one-shot, cheap, interruptible
- never re-trigger on scroll-away (unobserve) — re-appearing content
  reads as a bug
- reduced-motion: content present immediately, at most a 150ms crossfade
