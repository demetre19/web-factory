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

## C. Colour — the deterministic palette system

Source: operator colour SOPs (4 variants — Futur/Core attribute
mapping, programmatic LM spec, role-map spec, Greg Gun arc method).
They converge on one system; this is it. A site never "picks a colour"
— it derives one from the brief through the formula below.

### C.1 The 6-role semantic map (closed set)

| Token | Role | Contrast floor |
|---|---|---|
| `bg` | canvas | root |
| `surface` | cards, containers | ≥1.15:1 vs bg |
| `surface_elevated` | modals, popovers | ≥1.2:1 vs surface |
| `ink` | primary text | **≥7:1** vs bg/surface (AAA) |
| `ink_muted` | captions, labels, borders | ≥4.5:1 vs bg/surface |
| `accent` | CTAs, active states, badges | ≥3:1 vs surface |
| `accent_fg` | text inside accent | ≥4.5:1 vs accent |
| `border` | dividers, input outlines | ≥1.5–3:1 vs surface |

**60-30-10 spatial budget** — verified across all four SOPs:
`bg`+`surface` ≈ 60%, `ink`+structural ≈ 30%, `accent` ≈ ≤10%.
Accent isolation is the conversion rule: accent means "interactive";
decorative use dilutes it. **No ghost buttons for primary CTAs**
(solid accent fill only). One CTA hue per section — no competing
accent-coloured elements in the same viewport block.

### C.2 Temperature — from brief to hue

Brand attributes map to a temperature bucket; the bucket sets the
canvas + hue family. `direction.temperature` in DESIGN-PLAN is this
decision made explicit.

| Bucket | Brand keywords | Hue family | `bg` undertone |
|---|---|---|---|
| **Warm** | artisanal, culinary, community, energetic, human | red/orange/amber 15–65°, warm neutrals | warm off-white/cream (H 30–45°, S 4–12%) — never stark blue-white |
| **Cool** | corporate, clinical, technical, finance, security | navy/sapphire 200–230°, teal 170–190° | cool off-white (H 200–220°, S 2–8%) |
| **Neutral/achromatic** | luxury, editorial, minimalist, premium | charcoal/white + one selective accent | pure white or deep charcoal |
| **Hybrid** | disruptive, playful, youth, high-conversion | cool base + warm accent | cool base, accent does the contrast |

Tie-break (SOP rule): cool canvas + warm accent.

**Psychological attribute map** (brief word → hue family):
health/trust→blue 190–220°; energy/sun→amber 45–55°;
warmth/passion→red/terracotta 0–25°; luxury→black+gold 40–50°+dark;
security→slate/ochre; visionary→cool grey+white; youth→spliced
high-sat. **Palette splicing:** primary attribute supplies `bg`/
`surface` family; secondary supplies the `accent` family.

### C.3 Neutral construction — chromatic tinting

Never dead greys (`#888888`) or pure black (`#000000`). All neutrals
are tinted with the primary hue `H_brand`:

| Token | HSL formula (light) |
|---|---|
| `bg` | `hsl(H_brand, 2–4%, 98–99%)` |
| `surface` | `hsl(H_brand, 3–6%, 94–96%)` |
| `surface_elevated` | `hsl(H_brand, 6%, 90–93%)` |
| `border` | `hsl(H_brand, 4–8%, 80–88%)` |
| `ink_muted` | `hsl(H_brand, 8–12%, 35–45%)` |
| `ink` | `hsl(H_brand, 10–15%, 10–15%)` — never `#000000` |

Saturation ceiling for surfaces: 2–6% (high-end). Over-saturated
warm primaries (`#FF0000` + white + yellow) = "fast-food language" —
desaturate to terracotta/rust/ochre (H 15–25°, S 65–80%, L 40–50%).

### C.4 Accent — geometric harmony, never guessed

`H_accent` is derived from `H_brand` by one closed formula:

| Harmony | Formula | Use when |
|---|---|---|
| **Complementary** | `H_acc = (H_brand + 180°) mod 360` | max contrast, conversion-first CTAs |
| **Split-complementary** | `±150°/210°` | dual accents (primary + badge) without harsh clash |
| **Analogous** | `±30–45°` | serene/editorial; CTA contrast then comes from scale+fill, not hue |
| **Triadic** | `+120°/+240°` | multi-module SaaS needing distinct functional codes |

**`accent_fg` luminance rule** (the white-on-yellow bug): if
`L(accent) > 60%` → `accent_fg = dark ink`; if `L(accent) ≤ 45%` →
`accent_fg = near-white`. Never default to white.

**Interactive states** — accent is never static:
`accent_hover` = light −10% (dark +12%); `accent_active` = L ±15%,
S +5%.

### C.5 Dark surfaces — lightness inversion, never pure black

Dark `bg` ≠ `#000000`. Invert the lightness ramp, keep the tint:

| Token | Dark formula |
|---|---|
| `bg` | `hsl(H_brand, 8–14%, 7–10%)` — deep chromatic charcoal |
| `surface` | `hsl(H_brand, 8–12%, 11–18%)` — *lighter* than bg (elevation = +L) |
| `surface_elevated` | `hsl(H_brand, 8%, 20–24%)` |
| `ink` | `hsl(H_brand, 4%, 92–95%)` — off-white, no glare |
| `ink_muted` | `hsl(H_brand, 6%, 65–70%)` |
| `accent` | same hue, L +5–10%, S −10–20% (dark-mode halation) |

### C.6 The derivation workflow (fill order for `system.color`)

1. Parse brief attributes → temperature bucket (C.2) → `H_brand`.
2. Tint neutrals N1–N5 at 2–6% S (C.3).
3. Derive `H_accent` by harmony formula (C.4) + `accent_fg` by
   luminance rule.
4. If dark surfaces needed → inversion ramp (C.5).
5. Grayscale value audit: convert to greyscale; `bg`/`surface`/`ink`/
   `ink_muted`/`accent` must read as 5 distinct value steps.
6. WCAG lint every pair against the C.1 floors.

### C.7 Colour QA — mechanical checklist

- [ ] Every element bound to a role token; no literal hex outside
  TOKENS.json
- [ ] `bg`/`surface` chromatic-tinted (S 2–6%), never `#FFF`/dead grey
- [ ] `ink` ≥7:1 vs `bg` and `surface`; `ink_muted` ≥4.5:1
- [ ] `accent` derived by harmony formula (not guessed); ≥3:1 vs surface
- [ ] `accent_fg` set by luminance rule (dark ink if L>60%)
- [ ] Accent ≤10% viewport area; CTA + motif only; no ghost buttons
- [ ] Dark surfaces: no `#000000`; elevation = progressive +L
- [ ] One hue per CTA class; hover/active states derived
- [ ] Grayscale proof: 5 distinct value steps visible



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

---

## S. Shape — radius, borders & separation

Source: operator shape SOP
(`research/sop-sources/SOP-RADIUS-SHAPE.md`).

Corners are a declared decision, not a browser default. A site picks
exactly one shape personality, one radius-token column, and one
separation strategy per layout block — anything outside the closed
sets below is a defect.

### S.1 The four personalities — closed set

| ID | Personality | Radius range | Brand attributes |
|---|---|---|---|
| P1 | Sharp / Geometric | **0–2px** | technical, dense, editorial, luxury |
| P2 | Subtle / Professional | **4–8px** | corporate, SaaS — the enterprise baseline |
| P3 | Friendly / Soft | **12–16px** | warm, human, B2C |
| P4 | Playful / Pill | **≥20px** + full-round | youthful, social |

**Single Radius System:** the brief's brand attributes pick exactly
ONE personality; mixing personalities on one site is banned. The pick
serializes to `direction.shape` in DESIGN-PLAN (`p1 | p2 | p3 | p4`) —
a forced direction axis alongside `temperature`/`density`/`finish`/
`type_contrast`. P2 is the default absent a signal (the enterprise
baseline); P4 requires an explicit youthful/social brief attribute —
the same gate `direction.motion: playful` passes in M.1.

### S.2 The radius token scale — closed set

Six tokens; the pixel value of each is fixed by the chosen
personality column:

| Token | P1 | P2 | P3 | P4 |
|---|---|---|---|---|
| `radius-none` | 0 | 0 | 0 | 0 |
| `radius-sm` | 0 | 2 | 4 | 6 |
| `radius-md` | 1 | 4 | 8 | 12 |
| `radius-lg` | 2 | 8 | 12 | 16 |
| `radius-xl` | 2 | 12 | 16 | 24 |
| `radius-full` | 9999px | 9999px | 9999px | 9999px |

A hardcoded px radius is a refuse — same contract as a literal hex
outside TOKENS.json (C.1). The chosen column lands in TOKENS.json;
markup names tokens, never numbers.

### S.3 Component → token assignment

| Component class | Token |
|---|---|
| badges, tags | `radius-sm` |
| buttons, inputs, selects | `radius-md` |
| cards, dropdowns, popovers | `radius-lg` |
| modals, drawers | `radius-xl` |
| avatars, dots, pills | `radius-full` |

**Radius hierarchy:** `R(control) ≤ R(container) ≤ R(overlay)` — a
button inside a card inside a modal steps up, never down. An inner
radius never exceeds its parent's; the sole exception is a declared
`radius-full` (the avatar stays circular inside the square P1 card).

### S.4 Concentric nesting — the formula

`R_inner = R_outer − P_padding` — nested rounding is arithmetic, not
eyeballing.

- **Zero-collapse:** if `P_padding ≥ R_outer` → `R_inner = 0`. A
  child that can't keep the curve goes square; radius never goes
  negative and is never clamped to a "close enough" value.
- **Shared-edge collapse:** in merged control groups (button groups,
  segmented controls, input+addon) the shared edges collapse to 0 —
  two radii meeting on a merged edge is a double-seam defect.
- **Flush-media inheritance:** edge-to-edge media inside a container
  (the card-top image, the `media` composition's panel) inherits the
  parent's outer radius on the edges it shares with the container, 0
  on the interior edge.
- **No mixed-radius sections:** a grid never combines sharp and soft
  cards — the S.1 ban applied at block level; one token per repeated
  component, everywhere it recurs.

### S.5 Border widths & separation

**Border widths — closed set `{0, 1px, 2px}`:**

- `1px` = baseline: controls, cards, dividers (the G.4 hairline rule).
- `2px` = focus/active only — never a resting width.
- `0` = flush — a separation strategy, below.
- Sub-pixel / fractional borders banned.

**Border colour:** neutral tokens at rest (`border` default/subtle —
C.1's `border` role, ≥1.5–3:1 vs surface). Accent colour (the C.4
harmony hue) appears on borders only for focus / selected / error /
success states; a resting accent border spends the ≤10% accent budget
(C.1) on chrome.

**Separation strategies — pick exactly ONE per layout block** (one
`pages.<slug>.sections` row):

| Strategy | Means | Legal when |
|---|---|---|
| `border-only` | 1px neutral border | low-contrast canvas (surface ≈ bg) |
| `shadow-only` | elevation shadow, no border | uniform canvas |
| `hybrid` | 1px border + `shadow-xs` | universal default |
| `flush` / tinted | no border or shadow — tinted surface | contrasting canvas (`surface` ≠ `bg`; the `inverse`/`brand`/`media` surfaces carry it) |

No arbitrary mixing of strategies on one page. The strategy is
declared on the section row beside `surface:`/`density:`; which ones
are legal follows the C.1 surface-vs-bg contrast — on a near-equal
canvas `flush` cannot separate, so a border or shadow is required.

### S.6 Secondary shape permissions — by personality

| Shape | P1 | P2 | P3 | P4 |
|---|---|---|---|---|
| Circular avatars | ✓ | ✓ | ✓ | ✓ |
| Square avatars | ✓ | ✓ | banned | banned |
| Pill badges / tags | — | — | permitted | required |
| Pill buttons | — | — | banned | ✓ |
| Decorative arches, organic blobs | banned | banned | banned | ✓ |

P3's pills live on tags/badges only — P3 buttons stay `radius-md`.

### S.7 Elevation ↔ radius coupling

Shadow blur scales with corner radius — soft geometry gets soft
elevation, sharp geometry gets none:

| Level | Shadow token | Blur | Paired radius |
|---|---|---|---|
| L0 | `shadow-none` | 0 | any |
| L1 | `shadow-xs` | 2–4px | `radius-md` |
| L2 | `shadow-md` | 8–12px | `radius-lg` |
| L3 | `shadow-lg` | 16–24px | `radius-xl` |
| L4 | `shadow-xl` | 32–48px | `radius-xl` / `radius-full` |

A deep shadow on a sharp corner is a defect — the same rule as L.8's
"soft shadows, subtle never hard-edge," stated from the shape side.

### S.8 Shape QA — mechanical checklist

Checked at DESIGN-PLAN review and build self-lint:

- [ ] One personality site-wide — `direction.shape` set; no second
  personality's token values present
- [ ] Every radius a member of the S.2 column — zero hardcoded px
- [ ] Concentric math holds: `R_inner = R_outer − P_padding`;
  zero-collapse and shared-edge collapse applied
- [ ] Border widths ∈ {0, 1, 2}px — no sub-pixel widths
- [ ] Resting borders neutral (C.1 `border`); accent borders only on
  focus/selected/error/success
- [ ] One separation strategy per layout block; no strategy mixing on
  a page
- [ ] Hierarchy holds: `R(control) ≤ R(container) ≤ R(overlay)`;
  only `radius-full` exceeds its parent
- [ ] Secondary shapes within S.6 permissions — arches/blobs absent
  unless `direction.shape: p4`
- [ ] Shadow level paired per S.7 — no deep shadow on a sharp corner
- [ ] No emoji glyphs; no rogue controls — every control built from
  the S.3 token classes

---

## I. Icons — the graphic marker system

Source: operator SOP `research/sop-sources/SOP-ICONS.md`. Icons are
atoms (L.10) — closed style, closed size set, one library per site,
semantic color tokens only. An icon outside the sets below is a
defect, same contract as type and colour.

### I.1 Style selection — five closed styles, one family

The closed style set:

| Style | Character | Brand attribute → pick |
|---|---|---|
| **Outline/Stroke** | single-weight strokes on the grid | technical, minimal |
| **Solid/Filled** | filled silhouettes | bold, playful, consumer |
| **Duotone** | two-tone fills (base + accent layer) | premium, editorial |
| **Hand-Drawn** | irregular strokes, human wobble | artisan, creative |
| **3D/Illustrated** | rendered dimensional scenes | hero/feature callouts **≥32px only** — banned in transactional UI |

**Single Icon Family rule:** one library renders 100% of a site's
icons. Mixing libraries (Feather + Material, Lucide + Heroicons) is
forbidden — two stroke philosophies on one page is a defect.

**Outline/solid isolation:** outline and solid variants never sit
side-by-side. One exception — the *active-state toggle*: outline at
rest → solid when selected (nav items, tab bars). Any other
outline+solid adjacency is a mixed-variant defect.

The pick serializes in DESIGN-PLAN as
`system.icons: {family, style, stroke_class}` — closed-set values,
never free text.

### I.2 Stroke math, corner geometry, the grid

**Stroke weight = icon size × 0.0833** (24px icon → 2px stroke).
Three named classes bound to the paired type rank's weight
(`system.type.ranks[].weight`):

| Stroke class | Weight | Pairs with font weights |
|---|---|---|
| light | 1.5px | 300–400 |
| regular (default) | 2px | 400–500 |
| bold | 2.5–3px | 600–700 — also required for 16px micro icons |

**Corner geometry matches the site radius personality (§S.1, the
`direction.shape` pick):** rounded personalities →
`stroke-linecap: round` + `stroke-linejoin: round` + 1.5–2px inner
corner radius; sharp personalities → square caps + miter joins + 0px
inner radius. An icon whose caps contradict the site's declared
personality is a defect.

| Keyline | Bounds |
|---|---|
| Circle | 20px Ø |
| Square | 18×18 |
| Vertical rectangle | 16×20 |
| Horizontal rectangle | 20×16 |

### I.3 Size — the closed set and the line-height rule

Closed size set **{12, 16, 20, 24, 32, 48}** — no others:

| Size | Role |
|---|---|
| 12 | micro-dots, inline status marks |
| 16 | dense UI, table rows |
| 20 | default UI |
| 24 | nav, buttons |
| 32 | section headers |
| 48 | hero, empty states |

**Icon size = the paired text's line-height** — the icon shares the
text's optical band, never a guessed size:

| Text | Line-height | Icon |
|---|---|---|
| caption 16 | 16 | 16 |
| body 16 | 24 | 20–24 |
| heading 24 | 32 | 32 |
| heading 32 | 40 | 48 |

**Optical centering:** asymmetric glyphs nudge inside their box to
read centered — play triangle +1–2px toward its point, chevron +1px
toward its direction, ▼ +1px down. Geometric center ≠ optical
center; ship the optical one.

### I.4 Icon + text pairing

- **Labels are mandatory** in info-dense and transactional UI.
  Icon-only is legal only for the eight universal glyphs (I.6) and
  still requires `aria-label`.
- **Position carries semantics:** icon-left = primary action /
  navigation / entity marker; icon-right = directional / external
  link / disclosure affordance. Icon-above only for mobile
  bottom-nav, collapsed sidebars, and marketing cards — never in
  dense UI.
- **Gap scale** (all members of the G.1 space scale):

  | Icon | Gap |
  |---|---|
  | 16px | 4px |
  | 20px | 8px |
  | 24px | 8–12px |
  | 32px | 12–16px |

- **Alignment:** `display: flex` + `align-items: center` is the
  standard icon+text row. Baseline hacks are a defect.

### I.5 Library governance

Approved libraries (closed set):

| Library | Position |
|---|---|
| **Lucide** | primary — 2px stroke on 24px grid (matches I.2 regular class) |
| **Heroicons** | Tailwind-native; 20/24 in outline + solid |
| **Phosphor** | weight variants incl. duotone — the duotone-style pick |
| **Feather** | legacy minimal |
| **Custom SVG** | proprietary domains / trademarks only |

Rules:

1. **Coverage audit before adoption** — enumerate the site's needed
   glyphs, verify the chosen library covers them.
2. Gaps are filled by **custom glyphs authored to match** the
   library's grid, stroke, and radius (I.2, I.3) — never by adopting
   a second library (I.1 single-family rule).
3. Custom SVG inherits the same lint gates: 24×24 grid, stroke
   class, corner geometry, keylines.

### I.6 Standalone glyphs, literal function, bans

**Eight universal standalone glyphs** — the only icons legal without
a visible label:

`search` `cart` `hamburger` `close` `notifications` `profile`
`settings` `help`

Standalone still requires `aria-label`. Every other icon needs a
visible label or tooltip — icon-only outside the eight is a defect.

- **Literal-function rule:** the glyph depicts its function —
  trash = delete, pencil = edit. Metaphor glyphs (rocket = submit)
  are banned in transactional UI.
- **Decorative-icon ban:** every icon earns a functional role. An
  icon that only decorates is removed, not tolerated. (This is also
  why SECTION-CATALOG bans icon+heading+text card grids as a
  substitute composition.)
- **Emoji ban:** raw unicode emoji is banned in UI — already a
  factory constant (DESIGN-INTAKE "No emoji, ever"; S5 anti-pattern
  lint; tone-profile `emoji: false` on the copy side). This section
  codifies *why*: emoji renders inconsistently across platforms,
  breaks the stroke/radius rules (I.2), and injects screen-reader
  noise. Scope: all icon slots — stars, checks, arrows ship as
  inline SVG paths.

### I.7 Color and interactive states

- **`currentColor` is the default** — the icon inherits its text
  context; hardcoded fills are a defect.
- **Semantic tokens** (closed set): `icon-default`, `icon-muted`,
  `icon-action`, `icon-action-hover`, `icon-on-action`,
  `icon-disabled`, `icon-success`, `icon-warning`, `icon-error`,
  `icon-info`. These bind to the C.1 role tokens — `icon-action`
  resolves to `accent`, `icon-on-action` to `accent_fg` (C.4
  luminance rule), never to raw hex.
- **Interactive states:**

  | State | Rule |
  |---|---|
  | hover | color + background shift (token pair) |
  | active | `scale(.95)`, 0.1s |
  | focus | 2px ring + 2px offset |
  | disabled | opacity .4 |

### I.8 Icon QA — mechanical checklist

Source gate, all ten items mechanically checkable at plan and
build self-lint:

- [ ] Single icon family — 100% one library, no mixed imports (I.1)
- [ ] Style matches brand attribute per the I.1 matrix
- [ ] No mixed variants — outline+solid adjacent only as an
  active-state toggle (I.1)
- [ ] Every icon size ∈ {12, 16, 20, 24, 32, 48} (I.3)
- [ ] Uniform stroke — one stroke class per context, = size × 0.0833
  (I.2)
- [ ] Icon↔text gap ∈ {4, 8, 12, 16} (I.4)
- [ ] Labels present where required — non-universal glyphs carry a
  visible label or tooltip (I.4, I.6)
- [ ] Zero emoji — no raw unicode pictograms anywhere in UI (I.6)
- [ ] Semantic color tokens only — `currentColor` or `icon-*`
  tokens, no literal hex (I.7)
- [ ] A11y — standalone glyphs carry `aria-label`; decorative-free
  markup means labelled or `aria-hidden` (I.6)

---

## V. Visual media — the art-direction rules

Source: operator imagery SOP (2 docs merged),
`research/sop-sources/SOP-IMAGERY.md`. Media is selected and
art-directed, never decorated — every image earns its pixels against
the closed sets below. A gray box or a filler stock frame in any
composition is a defect.

### V.0 Positive Selection Architecture — words before pixels

The rule is positive, not negative: not "never generic stock" but
**choose imagery that places a human protagonist inside an active
moment.** Stories sell; features don't. Words are decided before
pixels — the image dramatizes the copy's argument, it does not
fill the layout's empty half.

Selection workflow, in order:

1. Words-first story diagnosis — the section's `speech_act` and its
   one-sentence claim (`pages.<slug>.idea`).
2. Graphic universe refs — the visual world the direction implies
   (`direction.temperature`, `direction.finish`).
3. Visual metaphors — what the image *says*, mapped to the claim.
4. Grid + % modulation — aspect ratio (V.3) and canvas share (V.5)
   assigned per section.
5. Production verify — V.8 checklist before any asset ships.

### V.1 Media-by-section decision matrix

Media type is a function of `speech_act` × archetype — picked from
this table, never freehand:

| Section / `speech_act` | Archetype | Media type |
|---|---|---|
| Hero (`promise`) | luxury / craft | first-party real photo or cinematic video |
| Hero (`promise`) | SaaS | product UI walkthrough |
| Hero (`promise`) | conceptual | custom AI narrative scene (V.6 T3 rules) |
| Proof | any | first-party real facility/team only — stock here is a trust defect |
| Detail | physical | macro real photo |
| Detail | abstract / service | vector illustration or 3D |
| Background | any | atmospheric loop or low-frequency texture (V.5 budget) |

Classification rules:

- **Real photo REQUIRED** for high-ticket physical goods, real
  services, team verification.
- **Illustration** for abstract / software / playful — with **100%
  style unity**: never mix flat vector + 3D clay + hand-drawn on one
  site. One taxonomy per site.
- **3D only as brand metaphor.** Chrome spheres, glassmorphism
  ribbons = trend clutter, a defect.
- **Icons = scannable utility markers, never decorative** (utility
  rules §I; corner personality follows §S.1).

### V.2 The four treatments — pick ONE per site

One treatment covers **≥80% of imagery** on the site. A site does
not grade photo-by-photo; `direction.temperature` (§C.2) and
`direction.finish` select the treatment, the treatment is a system.

| Treatment | Fits | Numeric bounds |
|---|---|---|
| **Natural / Documentary** | warm/natural palettes | skin tones true; saturation −5..+10; no crushed shadows; natural light only |
| **High-contrast B&W** | luxury / minimalist | crushed blacks, bright highlights, +10% midtone; pairs with extreme type contrast (T.1) |
| **Duotone / brand-tinted** | corporate / athletic | dark brand color → shadows, light → highlights; tint hue = `H_accent`/`H_brand` (§C.4); ≥4.5:1 in all text zones |
| **Cinematic grade** | editorial / high-end | saturation −15..−25; shadows cool 210–230°; highlights warm 35–45°; contrast 1.15–1.30× |

A one-off treatment is legal only as **declared focal emphasis** —
the `motif.break` mechanism (§L.8). Undeclared style drift between
images is a defect.

### V.3 Aspect ratios — closed set + safe-crop rules

| Use | Ratios |
|---|---|
| Hero | 21:9 or 16:9 (mobile alt 9:16) |
| Narrative split (`split-media`) | 4:3 or 3:2 |
| Square card | 1:1 |
| Portrait | 3:4 or 4:5 |
| Macro detail | 1:2 or 3:4 |

A ratio outside the set is a defect. Safe-crop rules apply to every
crop, every breakpoint:

1. **Rule-of-thirds focal lock** — the subject locks to a third,
   never dead-center unless the composition declares it.
2. **Action vector points INWARD** toward the text; a subject facing
   off-canvas bleeds attention out of the section.
3. **15% outer margin safe zone** — no critical content in the outer
   15% (the same ≥10–15% edge law as T.2 rule 8 / L.3).
4. **Aligned horizon lines** across adjacent media.

`object-fit` decision:

| Media | Fit |
|---|---|
| Backgrounds, heroes | `cover` |
| UI screenshots, logos, product catalog | `contain` — container background matches `surface` token |

`contain` on a photograph is a defect; `cover` on a UI screenshot
crops the evidence — also a defect.

### V.4 Text-on-image — contrast floors + scrim formulas

Contrast floors under overlaid text: **7:1 display / 4.5:1 body**
(the C.1 floors applied to the image region, not the canvas). Local
background luminance under text: **≤20% under white text, ≥85%
under dark** — the same luminance gate as `accent_fg` (§C.4).

Approved scrims (the V.4 refinement of the T.7 40–60% tint rule —
one of these three, not a guess):

| Scrim | Formula |
|---|---|
| Linear to-top | `linear-gradient(rgba(0,0,0,.88) → .65 → .20 → 0)` |
| Radial centered | `radial-gradient(rgba(0,0,0,.75) → .45 → .10 → 0)` |
| Solid brand tint | `rgba(dark, .65)` multiply (dark = §C.5 charcoal) |

Complexity decision:

- **High spatial complexity under the text zone → text moves to a
  `surface` beside the image** — the `split-media` composition
  (catalog §2). This is what the `media` surface is *for*: only under
  a real image overlay, never as a tint (catalog §4).
- **Low complexity + scrim → text-on-image permitted.**

Overlay typography follows T.6: display rank skips weights (never
weight-400 over imagery), tracking tightens on large display,
tracking increases slightly on micro-copy over dark.

### V.5 Background density budget + canvas modulation

Background media (atmospheric loops, textures behind content) holds
a density budget:

- **No sharp micro-details** in any region under content.
- Busy images: **blur ≥16px** or `backdrop-filter: blur(12px)`.
- **Brightness variance <15%** inside text zones.
- The `media` surface requires a real image or video — a tint
  labeled as media is a defect (catalog §4).

Inset media (photos inside cards, `split-media` columns):
- Corner radius ∈ the site's shape-personality radius tokens (§S.2
  scale; component map §S.3) — rounded and sharp never mixed on one
  page.
- Shadows subtle, high-diffusion: `0 20px 40px -15px
  rgba(0,0,0,.07)`. Hard offset shadows only under a neo-brutalist
  `direction.finish`.

**Modulated canvas %** — media share of the page is rhythm, not
accumulation:

1. **100% full-bleed hero** →
2. **80/10 editorial** (media-dominant block) →
3. **60/40 split** (`split-media`, text ≈0.45–0.6 per catalog §2) →
4. **Solid type-only breaks** — the cognitive rest between media
   sections (the layout-layer `spacious` spend, G.3).

Split-media seam rules: image focal point off-center; clean negative
space **at the seam** where image meets text column; horizons
aligned across adjacent splits (V.3 rule 4). `split-media` stacks
media-under-text on mobile unless the plan declares otherwise (L.5).

### V.6 Authenticity hierarchy — T1→T4 + the banned list

Every image is assigned a tier; higher tiers are preferred wherever
the subject is real:

| Tier | Source | Rule |
|---|---|---|
| **T1** | First-party (real team / facility / product) | **mandatory** on About, Team, Case studies |
| **T2** | Editorial stock | unstaged only, graded to the site's one treatment (V.2) |
| **T3** | Prompt-engineered AI | only for a specific narrative impossible to stock; prompt must specify lens (e.g. 85mm f/1.4), lighting, grain, palette — **never fake team, testimonials, or inventory** |
| **T4** | Stylized vector / 3D kits | abstract utility only |

**Banned list — zero tolerance:**

- Staged corporate stock: handshakes, blank-whiteboard pointers,
  headset reps.
- Fake AI headshots (any invented human presented as real).
- Watermarked or visibly compressed assets.
- Corporate-Memphis flat clip-art.

### V.7 Responsive art direction

Art direction survives the breakpoint, it doesn't just shrink:

1. **`<picture>` with art-directed crops per breakpoint** — mobile
   4:5/9:16 vs desktop 16:9 (ratios ∈ V.3 set), not one crop scaled.
2. **Formats:** AVIF primary + WebP + legacy fallback, in that order.
3. **Densities:** `@1x`/`@2x` everywhere, `+@3x` on mobile.
4. **Hero master ≥3840px** wide.
5. **Loading:** hero `loading="eager"` + `fetchpriority="high"`
   (the LCP asset); all below-fold media `lazy` + async decode.

### V.8 Media QA — mechanical checklist

Checked at DESIGN-PLAN review and build self-lint:

- [ ] Positive selection met: every image is human-in-environment or
  narrative, not filler
- [ ] Brand metaphor grounded; 3D = metaphor only, no trend clutter
- [ ] Taxonomy unmixed: no flat-vector + 3D-clay + hand-drawn blend
- [ ] Single treatment ≥80% of imagery; any one-off is declared
  (`motif.break`)
- [ ] Every aspect ratio ∈ V.3 closed set
- [ ] Focal point in safe zone; action vector points inward
- [ ] Text-on-image floors met: 7:1 display / 4.5:1 body; approved
  scrim used; luminance ≤20%/≥85% in text zone
- [ ] Background density under budget: no micro-detail, blur ≥16px,
  variance <15%
- [ ] Every asset assigned T1–T4; zero banned-list hits
- [ ] `<picture>` art-directed per breakpoint; AVIF/WebP/fallback;
  @1x–@3x; hero eager+`fetchpriority="high"`, below-fold lazy

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

### M.1 The four personalities — closed set

The brief's `motion_personality` field picks exactly one; it serializes
to `direction.motion` in DESIGN-PLAN. Static brochure sites default to
**Subtle** or **Professional** — Playful requires an explicit brief
attribute (consumer/youth/celebration), Elegant requires a
luxury/editorial one.

| Token | Behaviour | Brand attributes |
|---|---|---|
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

## W. Writing — interface copy as a closed system

Source: operator UX-writing SOP (`research/sop-sources/
SOP-UX-WRITING.md`). Copy is functional — every word is load-bearing
interaction, never decoration. Badly structured copy traps readers in
F-pattern scanning; clear headings + bullets enable layer-cake
scanning. Three tiers: **microcopy** (buttons, labels, errors,
tooltips, placeholders, empty states — the rules below govern this
tier hardest), **short-form** (2–3-paragraph blocks), **long-form**
(docs/policy/guides only — a brochure page is never long-form).

### W.1 Voice is constant; tone is a context selection

Brand voice stays fixed; tone is picked per interface context along
four NN/g axes: funny↔serious, formal↔casual,
respectful↔irreverent, enthusiastic↔matter-of-fact.

| Context | Humor | Formality | Deference | Energy |
|---|---|---|---|---|
| hero / landing | serious–mild | casual | respectful | enthusiastic |
| onboarding / tour | mildly funny | casual | respectful | enthusiastic–matter-of-fact |
| form labels / inputs | serious | casual | respectful | matter-of-fact |
| errors / failures | **strictly serious** | casual–formal | **highly respectful** | matter-of-fact |
| success / confirm | mildly funny | casual | respectful | moderate enthusiasm |
| legal / privacy | **strictly serious** | formal | respectful | matter-of-fact |

Tone → vocabulary mapping:

- **Casual** = contractions + plain words + simple sentences.
- **Formal** = zero contractions, precise terms — but still plain
  (`use`, never `utilize`).
- **Matter-of-fact** = declaratives only; no exclamation points, no
  subjective adjectives (`amazing`, `incredible`), no promo filler.
- **Respectful-failure** = never blame the user. `Passwords must be
  at least 8 characters`, never `You entered an invalid password`.

### W.2 CTAs — the verb-first formula

`CTA = Actionable Verb + Clear Expectation + Communicated Value`.

- **Verb-first, always** — no label opens with a noun or filler word.
- **2–4 words**; 1-word only for system actions (`Save`, `Close`).
- **Outcome, not process**: `Book a clean` not `Submit application`;
  `Create free account` not `Process registration`.
- **Person is a pick**: first-person (`Get my quote`) converts better
  in personal transactional flows; second-person (`Manage your
  account`) for account contexts. Pick one per flow — never mix.
- Hierarchy: **primary** CTA names the explicit outcome; **secondary**
  uses process-neutral copy; **tertiary** = a link under W.7.

Banned CTAs — lint-refused, replaced by pattern:

| Banned | Replacement pattern | Example |
|---|---|---|
| Submit | verb + object | `Send message`, `Save changes` |
| Click Here | verb + destination | `Download pricing guide` |
| Learn More | verb + subject | `Explore service plans` |
| Get Started | verb + immediate step | `Create free account` |
| Read More | verb + title | `Read the full case study` |
| pseudo-"Book" | transparent next action | `Request a quote` (if it's a contact form) |

Every CTA and link passes the **4 S's**: Specific, Sincere,
Substantial (survives out of context), Succinct.

### W.3 Headings & field labels

- **Claim headings** (marketing/landing): a complete thought, benefit
  first — `Reduce onboarding time by 50%`.
- **Label headings** (nav/forms/utility): short noun or task phrase —
  `Account settings`, `Payment method`.
- **Sentence case everywhere** — headings, subheads, labels. Title
  case is a refuse.
- **Stand-alone survival test**: every heading is meaningful read in
  isolation. `Overview` / `Important information` are defects;
  `Quarterly revenue breakdown` passes.
- **Field labels**: noun-first short phrases; **no colons**;
  **top-aligned** above the input; never rely on placeholders (W.4).
- **Eyebrow tags**: ≤3 words, unambiguous category (R.4's cap agrees).

### W.4 Placeholders, tooltips & progressive disclosure

- **Placeholders are format examples only** — `e.g.,
  name@example.com`. Instructions, constraints, or required format
  rules inside a placeholder = defect (they vanish on input and look
  pre-filled). Persistent rules live in **helper text** above/below
  the field.
- **Tooltips**: never carry task-critical information; ≤1 sentence,
  ≤15 words; primarily for unlabeled icons — but a static text label
  is always preferred over a tooltip.
- **Progressive disclosure**: T1 essentials visible → T2 behind
  accordions/tabs/"More" → T3 advanced via secondary dialog.
- **"Prevents the question"**: any sensitive or unexpected field
  (phone, ID) carries inline why-we-ask helper copy *before* the user
  hesitates — `We use your number only to send booking confirmations`.

### W.5 Errors — neutral fact + remediation

`Error = What happened (neutral) + How to fix it (explicit step)`.

Banned phrases — lint-refused:

| Banned | Replacement pattern | Example |
|---|---|---|
| Invalid input | requirement + format example | `Enter a valid email, e.g. name@domain.com` |
| Error / Failure | what failed + resolution | `Unable to save changes. Check your connection and try again.` |
| Something went wrong | specific issue + recovery | `Payment failed. Verify card details or try another method.` |
| You entered a wrong… | neutral requirement + recovery | `Incorrect password. Try again or reset it.` |
| Field required | name the missing data | `Enter your billing address to continue.` |

- **Tone under failure**: calm, matter-of-fact; no humor, no sarcasm,
  no over-apology, no blame (W.1 matrix).
- **Placement**: inline below the field, high-contrast `err` color +
  error icon (C.1 `semantic.err`); a summary banner at top only for
  multi-step forms with hidden errors, each item linked to its field.

### W.6 Empty states & confirmations — the triads

- **Empty state triad** (all three required): Context (why it's
  empty) + Value (why the feature matters) + Action (CTA to
  populate).
- **Confirmation two-part**: What happened (`Your booking is
  confirmed`) + What next (`We emailed details to name@example.com`).
  Success screens give secondary utility (receipt, manage settings,
  return path) — never a dead end.

### W.7 Links & navigation — information scent

Front-load the keyword; the label mirrors the destination H1;
breadcrumbs = exact page titles as noun phrases. Banned: `Click
here`, `More info`, bare URLs/`<Link>`, poetic vagueness (`Restoring
vision and hope` → `Read about our eye-care initiative`). Nav labels
are shortened labels — the URL=H1 lock binds the route, not the label
(factory build rule).

### W.8 Concision — the numeric bounds

- **Reading level ≤ grade 8** — specialists included; plain language
  reduces cognitive load even for experts.
- **50% web reduction**: copy adapted from print is halved before
  shipping.
- **Sentences ≤15–20 words**; split longer ones.
- **Active voice only** — `We sent a code to your email`, never
  passive.
- **Digits, not words** — `3`, `15`, `100`; digits attract fixations.
- **Bullets, 4 rules**: ≥3 related items → list; uniform line
  lengths; parallel grammar (same part of speech, all sentences or
  all fragments); unique initial word per item.
- **Vocabulary floor**: `use` not `utilize`; `to` not `in order to`;
  `help` not `assistance`; `create` not `formulate`; `about` not
  `pertaining to`; `end` not `terminate`.
- **Jargon banned** — internal buzzwords and obscure acronyms.
  Domain technical terms are legal when the persona owns them.

### W.9 Localization-ready copy

- **No string concatenation** — full parameterized strings only
  (`Select {count} items`), never code-joined fragments.
- **30–50% expansion buffer** — translated strings run longer;
  layouts absorb it without wrapping the CTA.
- **No text in graphics** — all copy is inspectable text via CSS.
- **Culturally neutral** — no idioms or sports metaphors (`ballpark`,
  `touch base`).
- **Formats**: dates unambiguous (`Mar 4, 2026` / `YYYY-MM-DD`,
  never `03/04/2026`); currency symbol + code (`USD $50`); phone
  with country code (`+1 (555) 019-2834`).

### W.10 Writing QA — mechanical checklist

- [ ] Every CTA verb-first, 2–4 words, names an outcome; zero banned
  CTAs (`Submit`, `Click Here`, `Learn More`, `Get Started`,
  `Read More`)
- [ ] Headings sentence-case; every heading passes the stand-alone
  test; field labels noun-first, top-aligned, no colons
- [ ] Placeholders carry format examples only; tooltips ≤15 words and
  no critical info; sensitive fields have why-we-ask helper
- [ ] Every error = neutral fact + explicit remediation; zero banned
  phrases, zero user-blame
- [ ] Empty states carry context + value + action; confirmations =
  happened + next
- [ ] Links front-loaded, mirror destination H1, pass the 4 S's
- [ ] Copy ≤ grade 8; sentences ≤20 words; active voice; digits for
  numbers; bullets obey the 4 rules
- [ ] No string concatenation, no text-in-graphics, no idioms; dates/
  currency/phone in unambiguous formats

---

## E. SEO headings — the copy contract

Source: `SEO SOPs/SEMANTIC-SITE-BLUEPRINT-SOP` (Koray framework) +
the STUB contract files (`CONTENT/**/*.md`). A ranking page's
heading vector is **upstream authority** — the design molds around
it; it is never reshaped for the layout.

### E.1 The heading vector is the section list

A STUB's `## Heading vector` table *is* the page's `sections[]`
input — one vector row → one plan row, order preserved. The vector
check (definition → scope → audience → process → pricing →
duration → compliance → coverage → siblings → FAQ) is the rhetoric;
a plan row that invents a section the vector lacks, or drops one,
is a refuse.

Every plan row on a copy-contract page carries:

```yaml
heading: "What is vacate cleaning?"   # exact vector heading — never rewritten
fs: "Vacate cleaning is the full-building reset…"  # mandated first sentence
zone: macro | micro | end             # from the vector's zone column
heading_class: query | claim          # how it renders (E.2)
```

### E.2 Two heading classes — conversion vs. crawl

Headings do two different jobs and render two different ways:

| Class | Job | Visual weight | Renders as |
|---|---|---|---|
| `claim` | convert the reader | full rank scale (display/h1/h2), statement or benefit | the page's visual rhythm — the "designed" headings |
| `query` | answer the crawler | **minimised** — one rank down, muted ink, tighter spacing | question-form H2s; small label headings; QA blocks; accordion rows |

Rules:

- **The H1 is always `query`** on service-detail pages — it's a
  canonical-entity label (`End of Lease Cleaning Melbourne`), not a
  claim. It renders *small* — the WC pattern: the H1 sits at body-adjacent
  size over a hero whose visual weight comes from the promise copy
  around it. A giant H1 on a service page is a defect; the claim
  lives in the subhead/lead, which is `claim`.
- **Macro-zone H2s** (`what/who/how/how much/how long` on this page's
  entity) = `query` but *readable* — real section blocks, just quiet:
  smaller rank, muted, measure-bound. They ARE the article.
- **Micro-zone H2s** (bridges, coverage, siblings, FAQ) = `query`
  *minimised* — accordion rows, footnote-density blocks, or a
  `query` cluster at ≤small rank. SEO needs them present; conversion
  doesn't need them loud.
- **`claim` headings** come only from *marketing* copy (home hero,
  section leads) — never invented on a vector page.

### E.3 SEO invariants (lint)

- Title & H1 share the canonical entity — the STUB's `**H1**` field
  is verbatim; never rewritten for design.
- First sentence after every heading is **declarative** — the `fs`
  field is the copy contract; it renders, it isn't paraphrased.
- `≤1` contextual link per heading section; cross-cluster links only
  in the last heading's paragraphs; link slots land where the vector
  says (`→ /path`).
- 80/20 macro/micro allocation — the page's word share stays ≥80% on
  its own entity; micro sections interlink, they don't expand.
- The vector's ordering is a hard invariant — `detail`-style
  reordering is *not* free on a vector page the way it is on a
  pure-marketing page.

### E.4 SEO QA — mechanical checklist

- [ ] Every `sections[]` row maps 1:1 to a heading-vector row, order preserved
- [ ] `heading` fields match the vector verbatim; `fs` fields present
- [ ] H1 renders `query` class (small, label-weight) on service-detail pages
- [ ] Macro H2s `query`-readable; micro H2s `query`-minimised
- [ ] No `claim`-class heading invented on a vector page
- [ ] ≤1 contextual link per section; cross-cluster only in last section
- [ ] Title & H1 share the canonical entity
