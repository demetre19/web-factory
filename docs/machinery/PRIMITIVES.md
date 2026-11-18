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

---

## C. Colour — rules pending (operator to supply)

Role map is already fixed by token v2: `{bg, surface, ink, ink_muted,
accent, accent_foreground, semantic{ok,warn,err}}` with declared
contrast pairs (ink ≥7:1, muted ≥4.5:1) and accent budget "CTA +
motif only". Awaiting operator's colour SOP to fill the rest.

## L. Layout — rules pending (operator to supply)

Anchors already fixed: 12-col → 2 → 1 collapse; one primary axis;
content width + measure bounds; section compositions ∈
SECTION-CATALOG §2. Awaiting operator's layout SOP.

## G. Gutters — rules pending (operator to supply)

Anchors already fixed: 4px base unit, scale
`{4,8,12,16,24,32,48,64,96,128}`, group-gap ≥ 2× section-gap, density
tiers `compact|regular|spacious`. Awaiting operator's gutter SOP.
