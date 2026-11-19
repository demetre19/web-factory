---
id: rules-M
type: rules
links:
  used_in: [w2, w7, w8]
---

## M. Motion — functional animation rules

Source: operator motion SOP
(`research/sop-sources/SOP-MOTION.md`).

Motion is functional, never decoration. Every animation answers to one
of four types; anything that answers to none is a defect:

| Type | Job |
|---|---|
| **Conversational** | dialogue flow (prototypes — rarely ships to static builds) |
| **Functional** | task feedback — confirms the click, the load, the state change |
| **Structural** | spatial hierarchy — shows where an element came from / went to |
| **Emotional** | brand/state moments — the one licensed flourish |

Motion is spent like accent colour (C.1 isolation): one focal moment
per viewport, everything else inert. A page that animates everything
animates nothing.

### M.1 The personalities — closed set

The brief's `motion_personality` field picks exactly one; it serializes
to `direction.motion` in DESIGN-PLAN. Static brochure sites default to
**Subtle** or **Professional** — Playful requires an explicit brief
attribute (consumer/youth/celebration), Elegant requires a
luxury/editorial one.

| Token | Behaviour | Brand attributes |
|---|---|---|
| `none` | no motion; static content only | sites where motion adds no value |
| `subtle` | near-instant, **<4px offset** | utilitarian, data-dense |
| `elegant` | flowing transitions, **no scale distortion** | luxury, editorial |
| `professional` | axis growth (Y/X expand), **no overshoot** | B2B, corporate |
| `playful` | elastic overshoot, scale pop | consumer, youth, celebration |

### M.2 Duration & easing tokens

Durations are a closed token set — an animation whose duration is not
a member is a defect:

| Token | Range | Use |
|---|---|---|
| `micro` | **100–300ms** | hovers, moves <10px |
| `standard` | **300–400ms** | modals, expands — **exits faster than entrances** |
| `structural` | **500–700ms** | containers, staggered drawers |
| `idle_nudge` | **1s delay → 3s pulse loop** | attention pull on a resting CTA |
| `milestone` | **1500ms** | rare success moment only |

Easing rules:

| Situation | Curve |
|---|---|
| Entering the viewport | ease-out — `cubic-bezier(0,0,.2,1)` |
| Exiting the viewport | ease-in — `cubic-bezier(.4,0,1,1)` |
| Moving while on-screen | ease-both — `cubic-bezier(.4,0,.2,1)` |
| pop / reverse-pop | `playful` personality only |
| bounce / elastic | success states only (M.6) |

**Linear is BANNED for spatial moves** — it reads as machinery, not
interface. (Linear survives only on opacity-only fades.)

### M.3 Element-class rules

| Element | Rule |
|---|---|
| CTA hover | subtle Y-shift or bar expand, **300ms** |
| Modal enter | slide-up / scale, **300–400ms** ease-out |
| Modal exit | **300ms** ease-in — always faster than its enter |
| Accordion | stagger **200ms per category** + icon rotate **135°** |
| Skeleton / progressive data | **500ms delay**, then 0%→100% fill |
| Frequent page transitions | **300ms** opacity fade + **<80px** slide |

**NEVER animate:**

- body text
- top-nav links — color/underline state change only
- error / security banners
- continuous distracting loops (the `idle_nudge` token is the only
  licensed loop)

### M.4 One focal animation — property parenting

**One focal animation per viewport.** Two competing simultaneous
animations is a defect — the motion-layer equivalent of C.1's "no
third accent surface."

Multiple elements animate as **one coordinated sequence**, never in
parallel:

1. Primary element moves; children follow at a **100ms parent-child
   offset**.
2. Secondary elements move at **~50% of the primary's displacement**.
3. **Decouple the curves**: opacity and position run on separate
   easing, so a fade can finish while a slide still settles.

### M.5 Parallax — licensed on marketing pages only

- **LEGAL** on marketing/landing pages (`page_class: money`).
- **BANNED** in utility/dashboard/transactional surfaces
  (`page_class: utility`).
- Layer velocity ordered by perceived distance: **foreground fastest,
  background slowest**. An inverted layer order is a defect.
- **No scroll-jacking** — parallax binds to scroll position; scroll
  hijack / snap-steal binds only to declared drag/swipe boundaries.

### M.6 Emotional states & reduced motion

| State | Rule |
|---|---|
| Success | celebratory licensed — pop/bounce OK (`milestone` 1500ms is the cap) |
| Failure / error | clean efficient only — **bounce banned** |

**Reduced motion is mandatory**: `prefers-reduced-motion` disables ALL
spatial movement — every translate, scale, rotate falls back to a
**150ms opacity crossfade**. No strobing, no rotation under the
fallback.

### M.7 Performance — the compositor budget

- Animate `transform` + `opacity` **ONLY** — the GPU-composited pair.
- Layout properties are banned from animation: `width`, `height`,
  `margin`, `top`/`left`. A layout-property animation is a defect, not
  an optimisation target.
- Max translation **80px**, paired with an opacity fade (matches the
  M.3 page-transition bound).
- **60fps budget** — if a sequence can't hold 60, cut displacement
  before cutting duration.
- View transitions use **matching layer names** between the outgoing
  and incoming tree — mismatched names break the morph.

### M.9 Recipe membership — every animation is registered

Every `@keyframes`/`animation-name` in the built CSS maps to a recipe id
in `templates/motion/*/recipe.md`, or is recorded as a declared
`motion_deviation` (name + reason) on the plan. Unregistered motion is a
defect — never improvised.

### M.10 No dead keyframes

Every `animation-name` resolves to a defined `@keyframes`. A dead name
(the tamdoma `drift` class) is a defect, not a harmless leftover.

### M.11 Property budget — compositor only, licensed risk

Animated properties ⊆ {transform, opacity, stroke-dasharray,
stroke-dashoffset, fill-opacity, color}. `filter`, `clip-path`, and
layout properties animate only inside a recipe carrying
`budget: layout-risk` (e.g. `recipe-blur-reveal`) or a declared
deviation.

### M.12 Loop licensing

Continuous loops ⊆ the licensed loop set: ambient backdrops, status
pulses, iconography loops, word cyclers (recipes with
`loop_type: infinite|phased|palindrome`). Everything else is one-shot.

### M.13 Reduced-motion parity

Built CSS ships a `prefers-reduced-motion` block whenever motion ships —
150ms crossfade, spatial movement disabled (extends M.6 to the built
artifact).

### M.14 Animation JS budget

Animation-related JS ≤4KB — IntersectionObserver toggles and scroll
progress only. Animation libraries (gsap, anime, lottie, framer-motion)
are defects unless the DESIGN-PLAN licenses them.

### M.8 Motion QA — mechanical checklist

Checked at DESIGN-PLAN review and build self-lint:

- [ ] Every animation classified to a type (conversational /
  functional / structural / emotional)
- [ ] Every duration ∈ M.2 token set; exits faster than entrances
- [ ] No linear easing on spatial moves
- [ ] One focal animation per viewport; multi-element = one 100ms-offset
  sequence
- [ ] All translations ≤80px and paired with opacity fade
- [ ] Frequent transitions ≤300ms
- [ ] Error/failure states bounce-free
- [ ] `prefers-reduced-motion` fallback present: 150ms crossfade, all
  spatial movement disabled

### M.15 JS cost order — tamdoma-first, libraries as licences

Every recipe in the bank carries `js_cost`:
`css-only | minimal-js | library-required`. Selection order when
building a section:

1. **Pure CSS/SVG** — clip-path seams, transitions,
   `:checked`/`:target`, scroll-snap, `<details>`/`<dialog>`,
   native inputs. Always preferred.
2. **Native HTML** — `<video>`, `<dialog>`, `<details>`,
   `input[type=range|checkbox|date]` — interactivity at zero JS.
3. **Minimal JS** — the 30 motion recipes, tab switchers,
   counters — only when CSS can't express it.
4. **Library** — only when the content type demands what nothing
   else provides (interactive map → Leaflet; custom video controls
   → Vidstack; interactive charts → Recharts) AND the plan carries
   `licensed_libraries: [{name, justification}]` — the same
   impossibility text M.14 demands for motion. Charts/maps prefer
   static SVG/image whenever interactivity isn't essential (speed
   budgets).

A library in a render without a plan licence = FAIL. Receipt
blocks carry `js_cost` (and `library` when the recipe is
library-required) — the trace names what the page paid for. M.14
still owns animation libraries; this rule owns the interactive
class.

---

## Enforcement

Generated from `enforcement.json` (`gate.py enforcement`) — edit the JSON, never this table.

| Rule | Tier | Mode | Check / rubric | FAILs when | Wave |
|---|---|---|---|---|---|
| M.1 | stylistic | script | `check_direction_axes` | motion ∈ {none,subtle,elegant,professional,playful} | w4 |
| M.2 | stylistic | script | `check_measurable` | durations/easing token-bound | w7 |
| M.3 | stylistic | reviewer | `motion-element-class` | per-class motion rules | w8 |
| M.4 | stylistic | reviewer | `motion-personality` | one focal animation | w8 |
| M.5 | stylistic | reviewer | `parallax-license` | parallax on marketing pages only | w8 |
| M.6 | structural | script | `check_reduced_motion` | prefers-reduced-motion block present | w5 |
| M.7 | stylistic | script | `check_speed_budget` | compositor budget — transform/opacity only | w7 |
| M.8 | stylistic | script | `check_measurable` | QA: no linear spatial, ≤80px+fade | w7 |
| M.9 | structural | script | `check_motion_recipes` | keyframes maps to recipe or declared deviation | w7 |
| M.10 | structural | script | `check_motion_recipes` | animation-name resolves to defined @keyframes | w7 |
| M.11 | stylistic | script | `check_motion_recipes` | animated props in compositor set (or layout-risk license) | w7 |
| M.12 | stylistic | script | `check_motion_recipes` | loops ⊆ licensed loop recipes | w7 |
| M.13 | structural | script | `check_motion_recipes` | prefers-reduced-motion ships with motion | w7 |
| M.14 | structural | script | `check_motion_js_budget` | animation JS ≤4KB, no unlicensed library | w7 |
