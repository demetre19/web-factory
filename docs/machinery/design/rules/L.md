---
id: rules-L
type: rules
links:
  used_in: [w0, w3, w5, w8]
---

## L. Layout — how the screen divides into boxes

Source: operator SOP §1–2 (layout/alignment + negative space),
compounded with §T.2 rules 1/5/8 and §T.7 grid.

### L.1 Alignment — the axis is the law

- **Flush-left, rag-right** on all body/multi-line text (same as T.2
  rule 1 — stated here because it's a *layout* rule, not just a text
  rule). Never `text-align: justify`; centered only for single-line
  display or legal fine print.
- **One primary axis per section.** All text blocks anchor to a shared
  vertical grid line; horizontal elements snap to a shared
  cap-height or baseline. The `align:` field in DESIGN-PLAN's section
  rows names it (`col-1-edge` | `center-axis` | `measure-start`).
- A second axis is allowed only as the *counter-axis* — the edge the
  eye returns to after the contrast moment (e.g. hero text on the
  left rail, media bleeding to the right edge). Two competing primary
  axes is the "scattered layout" defect.

### L.2 Gutter boundaries — stop or break, never graze

When a box crosses a central fold/gutter, either **stop cleanly before
it** or **break decisively past it**. Timid alignment sitting *on* a
gutter boundary is a defect — it reads as an accident, not a decision.
The web form: a `split-media` section's text column and media column
either respect the grid line or the media bleeds past it full-bleed —
never a media column that ends 20px short.

### L.3 Edges and corners — never jam

Content insets ≥10–15% from the viewport edge. Text never touches a
section edge without a padding token. The only legal edge contact is a
*deliberate* bleed (full-bleed image, full-bleed surface) — the rule
that makes `inverse`/`brand` surfaces legal.

### L.4 Negative space — assigned, not leftover

- Generous whitespace is the signal; it's `density: spacious` spent
  deliberately, not "empty room where content ran out."
- **Trapped whitespace is a defect** — a dead pocket locked inside a
  rule, a card border, or between mismatched box edges. If whitespace
  can't escape to an edge, it wasn't designed, it got stuck.

### L.5 The responsive collapse

12-col desktop → 2-col tablet → 1-col mobile. A box that can't
describe its mobile stack order isn't a layout, it's a desktop
screenshot. `split-media` stacks media-under-text unless the plan
declares otherwise; `cards-n` collapses n→2→1 on the same grid.

### L.6 Gestalt grouping — proximity as semantics

Source: operator proximity SOP §2–4. Space is meaning — elements
close together read as a group; wide gaps read as unrelated.

| Pair | Rule |
|---|---|
| Label ↔ input | label sits significantly closer to its input than to adjacent fields |
| Heading ↔ body | heading's bottom margin < its top margin (binds to the paragraph it introduces, not the previous section) |
| Image ↔ text | paired in a tight block — closure makes them one concept, never a paragraph floating apart from its image |
| Grouped atoms | 5–10px inside a pair; 15–25px inside a card; 60–100px between major sections (proximity scale) |

**Containerization:** when proximity alone can't segregate, use a
container — card (15–25px internal padding, border/shadow), section
divider (60–100px or hairline), or nested sub-panel. This is what
`surface: muted` containers and `cards-n` compositions are *for*.

### L.7 Small-Medium-Large — the scale rhythm

Every section uses deliberate scale variation — Large anchor, Medium
blocks, Small accents. Uniform boxes in a rigid grid = "flat
clustering" defect (the generic look). On a money page: hero is the
Large, cards/feature blocks are Medium, badges/metadata are Small.
This is the layout-layer equivalent of T.1's 3-tier read order.

### L.8 Breaking the frame — deliberate depth

Flat 2-D grids read as templated. Introduce depth deliberately:
- **Break the frame** — a focal graphic (price card, product shot,
  badge) overlaps its container edge or extends past the grid bound.
  Verified: Care.com's zip card, Airtasker's `$500` card both do this.
- **Soft shadows** — curved drop shadows under cards/panels for
  physical lift. Subtle, never hard-edge.
- This is the *sanctioned violation* — the motif's `break:` field
  names where the frame breaks. Random overlap is a defect; one
  declared break is design.

### L.9 Asymmetry desktop, symmetry mobile

Desktop composes asymmetrically — open whitespace on one side,
dense content on the other (editorial). Mobile is centered symmetry —
narrow viewport can't carry asymmetry. This is why `split-media`
stacks media-under-text on mobile but is off-axis on desktop.

### L.10 Atomic architecture — the file structure

Source: operator layout SOP §2 (Brad Frost). Components are built
bottom-up from atoms:

- **Atoms** — color tokens, type ranks, buttons, labels, inputs
  (rules/T.md, rules/C.md, rules/G.md outputs).
- **Molecules** — functional units: search bar, form field pair,
  card, testimonial (COMPONENTS.md entries).
- **Organisms** — sections: header, hero, footer, a composed block
  (SECTION-CATALOG §2 compositions).
- **Templates** — page skeletons: `pages.<slug>` in DESIGN-PLAN.
- **Pages** — the SPEC + rendered route.

Workflow is non-linear: explore compositions first, then standardize
the recurring molecules into the component library. A token change
cascades because molecules reference tokens, never literals.

### L.11 The 960 containment rule

Critical content (headline, body, CTA, nav) lives inside a **960px
container** (or `system.grid.content_width` equivalent). Backgrounds,
hero media, surfaces bleed full-viewport. On 1920px+ displays content
never scatters to the edges — the surface bleeds, the content holds.

### L.12 Sequential anatomy — the page's tiers

The reference order (verified CATALOG-VERIFICATION §1):

1. **Hero** — headline + subhead + CTA + visual anchor (the 50ms
   first impression).
2. **Proof** — logo quilt / stat band directly below.
3. **Detail** — feature grid / curated work (S-M-L scale).
4. **Objection** — case-study/editorial blocks (de-monolith copy).
5. **Conversion** — high-contrast act section.
6. **Footer** — secondary nav + contact + capture form.

This maps to `promise → proof → tension/how → objection → act` in
the catalog — the rhetoric *is* the anatomy.

### L.13 Layout & proximity QA — mechanical checklist

From operator proximity SOP §6 + layout SOP §5. Checked at plan and
build self-lint:

- [ ] Form labels sit closer to their input than to adjacent fields
- [ ] Heading bottom margin < its top margin (binds forward)
- [ ] Card internal padding 15–25px; consistent border/shadow
- [ ] Section gaps 60–100px (spacious tier) between major organisms
- [ ] S-M-L scale variation present (no flat clustering)
- [ ] Icons paired with text labels (system icons exempt)
- [ ] Touch targets ≥44px on mobile
- [ ] Primary CTA + value prop visible above the fold (50ms check)
- [ ] Content inside 960px container; only surfaces/media bleed
- [ ] One declared frame-break max (motif.break); no random overlap

## Enforcement

| Rule | Mode | Check / rubric | Threshold that FAILs | Wave |
|---|---|---|---|---|
| L.1 | script | `check_schema_fields` | align = named edge per row | w5 |
| L.2 | script | `check_rhythm` | adjacent sections stop or break, never graze (adjacency) | w5 |
| L.3 | reviewer | `edge-insets` | content never jams viewport edge | w8 |
| L.4 | reviewer | `negative-space-gestalt` | space assigned, not leftover | w8 |
| L.5 | reviewer | `collapse-integrity` | collapse renders per R.3 | w8 |
| L.6 | reviewer | `negative-space-gestalt` | proximity groups read as semantics | w8 |
| L.7 | script | `check_rhythm` | ≥1 density step; no >2 same comp; adjacent comp+density differ | w5 |
| L.8 | script | `check_motif` | exactly one motif.break section | w5 |
| L.9 | reviewer | `asymmetry-desktop` | asym desktop / sym mobile | w8 |
| L.10 | script | `check_scaffold` | atomic file structure: tokens→layer→components→pages | w0 |
| L.11 | script | `check_content_width` | content_width ≤1440px | w3 |
| L.12 | script | `check_rhythm` | promise first, act first-and-last | w5 |
| L.13 | script | `check_rhythm` | S-M-L present; 960/1440 containment; ≤1 frame-break | w5 |

## Links

- L.7 → G.3, C.1 (S-M-L ↔ density tiers ↔ surfaces)
- L.11 → T.6, R.2 (containment ↔ measure ↔ edge ramp)
- L.12 → E.1 (page tiers ↔ heading vector)
