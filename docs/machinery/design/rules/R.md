---
id: rules-R
type: rules
links:
  used_in: [w3, w5, w7, w8]
---

## R. Responsive — breakpoints, geometry & density

Source: `research/sop-sources/SOP-RESPONSIVE.md` (SOP-DES-005 numeric
spec merged with a Framer mechanics doc; where they conflict, DES-005
wins — closed numbers, mobile-first authoring). These rules bind
`composition` collapse, `density`, and `pages.<slug>.page_class` in
DESIGN-PLAN.

### R.1 The closed breakpoint set — 7 stops, `min-width` only

| Token | px | Class |
|---|---|---|
| `xs` | 360 | small mobile |
| `sm` | 640 | large mobile |
| `md` | 768 | tablet |
| `lg` | 1024 | small laptop |
| `xl` | 1280 | desktop |
| `2xl` | 1440 | max content |
| `3xl` | 1920 | ultra-wide canvas |

- Arbitrary px media queries banned — every query stops on a member of
  the set.
- Mobile-first `min-width` authoring only; `max-width` degradation
  banned.

Per-breakpoint behavior:

| Range | Behavior |
|---|---|
| <640 | single column; drawer nav; bottom sheets |
| 640–767 | 2-col micro-grids; edge margin 16→24 |
| 768–1023 | 2-col splits; centered modals 560px |
| 1024–1279 | horizontal nav; 3-col grids; persistent sidebars |
| 1280–1439 | 4-col grids; full type scale |
| 1440+ | content clamps at 1440px; margins auto |
| 1920+ | canvas bleeds; container fixed |

### R.2 Container geometry — the closed ramp

`max_width` ceiling: **1440px**. Content never exceeds it; canvas and
`surface`s may bleed past (L.11 — only surfaces/media bleed, content
holds).

| Token | Edge padding | Grid gap | Columns |
|---|---|---|---|
| `xs` | 16 | 16 | 4 |
| `sm` | 24 | 16 | 8 |
| `md` | 24 | 24 | 8 |
| `lg` | 32 | 24 | 12 |
| `xl` | 40 | 32 | 12 |
| `2xl` / `3xl` | 48 | 32 | 12 |

Ramps: edge padding `16→24→32→40→48`; grid gap `16→24→32`; columns
`4→8→12`. Edge padding is its own closed ramp — `40` is legal here
though it is *not* a G.1 member; grid gaps and every other spacing
value stay strictly on G.1.

### R.3 Collapse rules — per composition

| `composition` | `xl`+ | `lg` | `md` | <768 |
|---|---|---|---|---|
| `cards-4` | 4 | 3 | 2 | 1 |
| `cards-3` | 3 | 3 | 2 | 1 |
| `split-media` | 2-col | 2-col | stacked | stacked |

`split-media`: 2-column ≥1024, stacked <1024 — the L.5 collapse made
exact.

**Stack order: TEXT FIRST on mobile by default** — headline before
media (L.5 media-under-text; L.9 mobile symmetry). Visual-first ONLY
for product-UI-hook sections, and only when the plan declares it. An
undeclared visual-first stack is a defect.

### R.4 Copy density budgets — hard caps

| Slot | Words | Chars | Extra |
|---|---|---|---|
| Hero H1 | 4–8 | ≤60ch | — |
| Hero subhead | 12–25 | ≤160ch | — |
| CTA label | 2–4 | ≤25ch | `nowrap` |
| Card title | 2–5 | ≤35ch | — |
| Card desc | 15–30 | ≤200ch | ≤4 lines |
| Eyebrow | 1–3 | ≤20ch | — |
| H2 | 3–7 | ≤50ch | — |
| Section para | 15–35 | ≤240ch | — |
| Prose | 40–80 | ≤500ch | measure 45–75ch; body prose holds T.6's 52–65ch |
| List item | 5–15 | ≤100ch | 3–7 items per list |

Page-class budgets — keyed to `pages.<slug>.page_class` in DESIGN-PLAN:

| `page_class` | Budget |
|---|---|
| `money` | 150–250 words per viewport; cards, not prose |
| `article` | 400–600 words per viewport + a breaker every 250–300 words (subhead, quote, card, image, `hr`) |
| `utility` | labels 1–3w; tooltips ≤15w; tables paginate 8–12 rows |

**Scannability:** never >250 words uninterrupted — a defect unless
broken by H2/H3, card grid, callout, image, or `hr`.

### R.5 Above-fold mandate & attention decay

Fold = 360×640 mobile / 1440×900 desktop. Five elements visible without
scroll:

1. nav
2. H1
3. subhead
4. CTA
5. visual anchor

**CTA cadence:** ≤2 viewports between CTAs; every `money`-class page
ends with a terminal CTA (the `act` speech_act).

Attention-decay budgets per fold:

| Fold | Budget |
|---|---|
| fold 1 | <50 words |
| folds 2–3 | peak density — grids, proof |
| folds 4–5 | accordions, comparisons, case blocks |
| fold 6+ | offload |

**Offload rule:** content >300 words moves to a subpage via summary
card (15–30w + "Read more →"). Max ~6 viewports per page.

### R.6 Touch & pointer targets

- Touch: ≥44×44 (iOS) / ≥48×48 (Android), 8px insulation buffer
  between targets — the L.13 ≥44px item made exact.
- Pointer: ≥32×32, 40 preferred.
- Hover: every `:hover` wrapped in
  `@media (hover: hover) and (pointer: fine)` — the sticky-touch bug
  guard.
- Gap between targets: touch 12–16px vs pointer 8px.

### R.7 Sizing modes — Framer mechanics in our CSS

Assignment rules; the CSS mechanism is `position`/flex/grid, the
*assignment* is the rule.

| Mode | Legal use only |
|---|---|
| Fixed px | icons, avatars, logos (radius/size per S.3 component map) |
| Fill width + fit-content height | section containers |
| Relative | inside stacks/flows |
| Absolute | badges, decoration — never layout structure |
| Fixed (viewport-anchored) | nav, persistent CTA |
| Sticky | section headers |

### R.8 Responsive QA — mechanical checklist

- [ ] Every breakpoint ∈ {360, 640, 768, 1024, 1280, 1440, 1920}; no
  arbitrary px queries
- [ ] `min-width` authoring only; zero `max-width` queries
- [ ] Container clamps at 1440px; margins auto past it
- [ ] Edge padding follows the 16/24/32/40/48 ramp
- [ ] Collapse steps exact: `cards-4` 4→3→2→1, `cards-3` 3→2→1,
  `split-media` stacked <1024
- [ ] Mobile stack is text-first; visual-first only where the plan
  declares a product-UI hook
- [ ] Copy budgets met per slot (R.4); prose measure 45–75ch (T.6)
- [ ] No >250w uninterrupted run; `article` pages break every 250–300w
- [ ] Touch targets ≥44×44/48×48 with 8px buffer; pointer ≥32×32
- [ ] All `:hover` gated in `@media (hover: hover) and (pointer: fine)`

---

## Enforcement

Generated from `enforcement.json` (`gate.py enforcement`) — edit the JSON, never this table.

| Rule | Tier | Mode | Check / rubric | FAILs when | Wave |
|---|---|---|---|---|---|
| R.1 | structural | script | `check_breakpoints` | breakpoint ∉ {360,640,768,1024,1280,1440,1920} or max-width only | w5 |
| R.2 | stylistic | script | `check_spacing_scale` | edge_padding ∈ {16,24,32,40,48} | w5 |
| R.3 | structural | script | `check_schema_fields` | stack text-first; collapse declared per row | w3 |
| R.4 | structural | script | `check_copy_density` | section paragraph ≤240 chars; prose ≤500 | w7 |
| R.5 | structural | script | `check_measurable` | five elements at 360×640 | w7 |
| R.6 | invariant | script | `check_tap_size` | targets ≥44px +8px buffer | w7 |
| R.7 | stylistic | reviewer | `sizing-modes` | fill/fixed/relative correct | w8 |
| R.8 | stylistic | script | `check_breakpoints` | closed breakpoints, min-width, 1440 ceiling | w5 |
