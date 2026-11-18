# PRIMITIVES — the closed sets a site is *built* from

All web design is boxes. This file is the rulebook under the catalog:
`SECTION-CATALOG.md` composes sections; this file defines the
*primitive rules* sections are built from — typography, colour,
layout, gutters. A site picks from the closed palettes below; it
never invents a value outside them. Same contract as the catalog:
freehand = refuse.

Source: operator SOP (Chris Do / The Futur typography curriculum,
adapted for web), `research/DESIGN-FORETHOUGHT.md`, Design-library
`01-CONTRACTS.md` token v2.

---

## T. Typography

### T.0 Philosophy

Type is an object — a graphic shape with mass, tone, and position,
not a text string. If the designer doesn't control the type, the type
controls the layout. Restraint over excess: weight and scale jumps
inside ≤2 families beat novelty fonts, always.

### T.1 Universal rule of contrast — the 3-tier read order

Every section enforces a strict three-tier read order. Ambiguous
hierarchy is a defect.

| Tier | Role | Scale vs body | Weight | Value |
|---|---|---|---|---|
| Primary (1st read) | focal point — headline, hero numeral | **3×–6× body** | Bold/Heavy/Black | highest contrast (darkest / accent) |
| Secondary (2nd read) | subheads, banners, nav | **1.5×–2× body** | Medium/Semibold | intermediate |
| Tertiary (3rd read) | body, captions, fine print | **1× (≥16px web)** | Light/Regular | softened (~85% ink) |

Extreme contrast first: scale headlines 3–4×, pair Ultra Light with
Extra Bold — then dial back if needed. A 12→14pt bump reads as an
accident, not a decision.

### T.2 The 10 canonical rules — web form

| # | Rule | Web enforcement |
|---|---|---|
| 1 | Flush-left, rag right | `text-align: left` on all body/multi-line; centered only for single-line badges/logotypes. Never `text-align: justify`. |
| 2 | One font family | `fonts` in DESIGN-PLAN ≤2 stacks; default is one family, all hierarchy by weight/scale. |
| 3 | Skip a weight | Pair Light(300)↔Bold(700) or Medium(500)↔Black(900); never adjacent weights (400↔500) for hierarchy. |
| 4 | Double or quadruple point size | Scale jumps are ratio-derived (§T.1: 3–6× primary, 1.5–2× secondary); in-between jumps refused. |
| 5 | One primary axis | All text blocks anchor to a single vertical grid line per section (`align:` field in plan). |
| 6 | Approved typefaces only | Fonts ∈ T.4 directory (classics or their web substitutes). Novelty fonts = refuse. |
| 7 | Group with rules or containers | Related blocks bound by a hairline rule or a `surface` container — the motif device lives here. |
| 8 | Avoid edges/corners | Content insets ≥10–15% from viewport edge; text never touches section edge without a padding token. |
| 9 | Mind the gap | No justify (no rivers); `text-wrap: pretty` (widow/orphan mitigation); single space after punctuation; rag smooth. |
| 10 | Bold or italic, never regular | Display/hero type is Bold/Heavy/Black or italic — never weight-400 display. |

### T.3 Classification isolation — pairing rules

Two families max. Never pair same-classification:

- **Refused:** sans+sans (Helvetica+Arial), serif+serif
  (Bodoni+Caslon), slab+slab, script+script.
- **Approved:** sans display + serif body (Futura/Garamond);
  serif display + sans body (Bodoni/Avenir); mono accent + sans body
  (OCR-B badges + Helvetica body).

This is what `direction.type_contrast` encodes in DESIGN-PLAN:
`serif-display/sans-text` | `mono-accents` |
`single-family-weight-contrast`.

### T.4 Master typeface directory — classics → web substitutes

26 canonical families (operator SOP §4). Web builds use the listed
substitute (all Google Fonts / system stacks — self-hosted, no remote
fetch per S5 rule).

| Classic | Class | Web substitute |
|---|---|---|
| Akzidenz Grotesk | grotesque sans | Inter, Archivo |
| Avenir | geometric sans | Nunito Sans, Mulish |
| Avant Garde | geometric sans | Poppins |
| Bell Gothic | informational sans | Barlow |
| Bembo | old-style serif | Crimson Pro |
| Bodoni | didone serif | Playfair Display |
| Caslon | transitional serif | Libre Caslon Text |
| Clarendon | slab serif | Zilla Slab |
| Courier | monospace | Courier Prime, system `monospace` |
| DIN Mittelschrift | industrial sans | Barlow Condensed, Archivo Narrow |
| Franklin Gothic | realist sans | Libre Franklin |
| Frutiger | humanist sans | Source Sans 3 |
| Futura | geometric sans | Jost |
| Garamond | old-style serif | EB Garamond |
| Gill Sans | humanist sans | Cabin |
| Gotham | geometric sans | Montserrat |
| Helvetica | grotesque sans | Inter, system `-apple-system`/`Helvetica Neue` |
| Letter Gothic | monospace | Space Mono |
| Memphis | slab serif | Zilla Slab |
| Meta | humanist sans | Fira Sans |
| OCR-B | monospace | JetBrains Mono (accent use only) |
| Rockwell | geometric slab | Roboto Slab |
| Sabon | old-style serif | Cormorant Garamond |
| Trade Gothic | gothic sans | Oswald, Archivo Narrow |
| Trajan | classical serif | Cinzel |
| Univers | neo-grotesque | Inter |

**Anti-stretching directive (mandatory):** never `font-stretch`,
`transform: scaleX`, or any horizontal/vertical distortion. Need
narrow → pick the condensed cut; need wide → the extended cut.

### T.5 Composition & spatial rules

- **Centered type:** prohibited for body/multi-line. Single-line
  logotypes, badges, hero kicker only.
- **Proximity:** section gap ≥ 2–3× paragraph gap (matches
  `space.group_gap_vs_section_gap: ≥2×` in DESIGN-PLAN).
- **Rules:** 1–2px hairline rules bind related blocks (headline+subhead)
  or separate disparate ones — the motif's `device` field.
- **Containers:** card/panel surfaces inset content ≥10–15% from edge.
- **Rag:** right edge "evenly uneven" — no deep cuts or stairsteps.
  `text-wrap: pretty` + measure bounds do the work.

### T.6 Micro-typography — the numeric bounds

| Rule | Bound |
|---|---|
| Measure (line length) | **52–65ch** for prose (≤65ch catalog); large x-height faces cap at 52ch; hard limit 75ch shell |
| Leading | `line-height` ≥ 1.5 for body on large x-height faces (Inter/Helvetica); tighter (~1.3) allowed on small-x-height serifs (Garamond) |
| Body size | **≥16px mobile**, no exceptions |
| Tracking | display/headline: **negative** (`-0.02` … `-0.04em`); body: default 0; small caps/labels: `+0.08em` |
| Widows/orphans | `text-wrap: pretty` on body; `text-wrap: balance` on headings |
| Punctuation | smart quotes `""`/`''` only — straight `"`/`'` is a defect; single space after punctuation |
| Hanging punctuation | quotes/bullets outside the left edge where the platform allows |
| Justify | never — no rivers |

### T.7 Web section application

- **Hero:** one primary read (bold headline) + subhead at
  **50–60% of headline size** + one CTA. (The `hero-act-merge`
  composition carries this.)
- **Logo quilt:** uniform grayscale/muted value — the `logo-wall`
  composition's surface rule.
- **De-monolith:** no wall-of-text sections — subheads, captions,
  lists, blockquotes. Editorial composition carries measure bounds.
- **Grid:** 12-col desktop → 2-col tablet → 1-col mobile.
- **Image overlays:** text over imagery gets a **40–60% opacity dark
  tint** behind it (the `media` surface rule) — no exceptions.

### T.8 Typography QA — mechanical checklist

Checked at DESIGN-PLAN §5 (plan time) and build self-lint:

- [ ] Primary ≥ 2× secondary scale (plan `type.ranks` step gap)
- [ ] Fonts ∈ T.4 directory/substitutes; ≤2 families
- [ ] No same-classification pairing (T.3)
- [ ] `font-stretch`/`scaleX` absent (anti-stretching)
- [ ] Body `text-align: left`; no `justify` anywhere
- [ ] Measure 52–65ch on prose blocks
- [ ] Body ≥16px at 320px viewport
- [ ] Display tracking negative; body tracking 0
- [ ] `text-wrap: pretty`/`balance` present on body/headings
- [ ] Smart quotes in authored copy; no straight primes
- [ ] Hero subhead = 50–60% of headline size
- [ ] Text-over-image has 40–60% tint buffer
- [ ] No severing full-bleed *content* bars (surfaces may bleed; boxes inset ≥10–15%)
- [ ] Editorial chunking — no monolithic paragraph blocks; subheads/lists/quotes present

### T.9 Reading paths — directional flow

Hierarchy isn't just size — it's *where the eye goes next*. Western
readers scan top-left → right → down. Arrange blocks so the primary
read lands upper-left (or the declared axis), the secondary read sits
in the scan path, and the tertiary read fills the detail zone. This is
why `split-media` puts text left/media right by default: the headline
hits first, the image rewards the scan.

### T.10 Inset containers vs. severing bars

**Full-bleed *content boxes* that stretch edge-to-edge and sever the
page are a defect** — they trap whitespace and chop the canvas into
dead blocks. Inset cards/panels so negative space flows *around*
them.

This is **not** the same rule as the `inverse`/`brand` surface: a
*surface* may bleed (it's the contrast moment, G.3/L.3); a *content
box* inside it must still inset ≥10–15%. The distinction: surface =
the field, box = the container on the field.

### T.11 DOs / DONTs matrix — the refusal table

| Area | DO | DON'T |
|---|---|---|
| Alignment | flush-left/rag-right; one axis; hanging punctuation | centered body; justify; random axes |
| Contrast | 2×/4×/6× scale; skip a weight; 3 read tiers | minor size bumps; adjacent weights; uniform weight |
| Typefaces | ≤2 families; contrasting classifications; T.4 list | same-class pairings; fad/display fonts; >2 families |
| Letterforms | native proportions; optical kerning; tight display tracking | stretch/compress; straight primes; over-tracked body |
| Spacing | evenly-uneven rag; no widows/orphans; single space | deep rags; stranded words; double spaces |
| Web composition | inset containers; de-monolith chunks; edge breathing room | severing full-bleed bars; monolithic paragraphs; corner-jam |

---

## C. Colour — rules pending (operator to supply)

Role map is already fixed by token v2: `{bg, surface, ink, ink_muted,
accent, accent_foreground, semantic{ok,warn,err}}` with declared
contrast pairs (ink ≥7:1, muted ≥4.5:1) and accent budget "CTA +
motif only". Awaiting operator's colour SOP to fill the rest.


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
  (PRIMITIVES §T/§C/§G outputs).
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

## G. Gutters — the spacing primitives

Source: operator SOP §2 (gutters/margins/negative space) + §4
(proximity/rules/containers) + existing token v2 density tiers.

### G.1 The closed set

One unit: **4px**. One scale:
`{4, 8, 12, 16, 24, 32, 48, 64, 96, 128}`. Every padding, gap, and
inset is a member — never `13px`, never `space-between` without a
declared step. This is what `system.space.scale` in DESIGN-PLAN
serializes.

### G.2 The proximity law

Between-group gap ≥ **2×** within-group gap — Gestalt as arithmetic.
Related blocks sit close; new sections are separated by expanding the
gap, not by adding borders. `system.space.group_gap_vs_section_gap:
"≥2×"` is the plan-time commitment.

### G.3 Density is a named tier

`compact | regular | spacious` — three named py-tokens per surface,
not a vibe. `spacious` is *spent* at promise + act + ≤1 interior
section (the two rests); `regular` is the default; `compact` is for
proof bands and chrome. Uniform `regular` everywhere is the
"undecided rhythm" defect.

### G.4 Rules and containers as gutter devices

- **Hairline rule** (1–2px): binds related blocks (headline+subhead)
  or separates disparate ones — the motif device.
- **Container inset**: card/panel content sits ≥10–15% in from the
  panel edge; a card with edge-to-edge text is a defect.
- **Section gap**: the largest gap on the page is always *between*
  sections; a gap inside a section that exceeds the section gap is
  trapped whitespace (L.4).
