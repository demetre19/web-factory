---
id: acss-docs-digest
type: research
links:
  used_by: [rules-T, rules-L, rules-G, rules-S, rules-C, rules-R, rules-I, rules-M, BASE.ACSS]
---
# ACSS documentation digest — rules, tokens, rationale, sources

Source: `docs.automaticcss.com` (version 4.0.0+ unless marked "3.x"), read
2026-11-19. Format per topic: **rule** → **tokens/values** → **rationale** →
source URL. Complements `docs/machinery/design/ACSS-BASELINE.md` (live-install
values) with the *documented rules* the values implement.

## 0. Version note

ACSS 4.x is **variable-first**: most utility classes from 3.x were removed
(grid classes, margin/padding classes, auto-grid classes, clickable-parent /
focus-parent / focus classes, divider classes, width classes mostly gone).
What remains: recipes (`?auto-grid`, `?variable-grid`, `?clickable-parent`,
`?flex-grid`, `?columns`, `?divider-*`), SCSS mixins, and CSS custom
properties. ACSS 4 is also **breakpoint-free**: no XL/L/M/S presets; fluid
between Minimum Width and Content Width; media/container queries on demand.
- Source: https://docs.automaticcss.com/setup/website-width-breakpoints ,
  https://docs.automaticcss.com/grids/grid-classes-standard

## 1. Card framework

### 1.1 Philosophy — shared tokens, not per-card styles
- **Rule**: All cards reference a shared token set (`--card-*`) instead of
  each card type defining its own padding/gap/radius. One dashboard panel is
  the single source of truth for "how cards look on this site."
- **Why**: kills duplication, inconsistency drift, and find-and-replace
  maintenance; cards inherit the global spacing/type/radius system.
- Source: https://docs.automaticcss.com/cards/card-framework-philosophy

### 1.2 Card token surface
- `--card-padding`, `--card-gap`, `--card-radius`, `--card-min-radius`,
  `--card-border-width/style/color`, `--card-background`,
  `--card-heading-size`, `--card-heading-color`, `--card-text-size`,
  `--card-text-color`, `--card-link-color`, `--card-link-color-hover`,
  `--card-button-font-size`, `--card-icon-size`, `--card-icon-color`,
  `--card-avatar-size`, `--card-avatar-radius`, `--card-media-radius`,
  `--card-media-aspect-ratio`, `--card-shadow`.
- Defaults: `display: flex; flex-direction: column` (opt-in grid); position
  relative + clipped overflow (3.x default styling).
- Source: https://docs.automaticcss.com/cards/card-styling ,
  https://docs.automaticcss.com/3.0/cards/card-framework

### 1.3 Card anatomy / targeting conventions
- **Rule**: Target the card *wrapper* only; children are recognized by BEM
  names: `__media` (featured media), `__avatar`, `__heading`, `[data-icon]`
  (icons — data attribute required in 4.x), plain h1–h6 elements. Classes
  containing `wrapper`/`group`/`__` are excluded from card styling.
- **Rule**: Consistent naming `.<thing>-card`; add every new card selector
  to the targeting list immediately; never hand-style a card "for now."
- Source: https://docs.automaticcss.com/cards/card-targeting ,
  https://docs.automaticcss.com/3.0/cards/card-framework

### 1.4 Concentric radius for cards
- Options: **Off** | **Standard** (outer radius = `--radius + --card-padding`,
  so inner elements at global `--radius` look proportional) | **Reverse**
  (outer stays `--radius`, inner = `--radius − --card-padding`, clamped to
  `--card-min-radius`, default floor 4px).
- **Why**: nested rounding is arithmetic, not eyeballing — corners stay
  visually proportional whether card radius swallows padding or not.
- Source: https://docs.automaticcss.com/cards/card-styling

### 1.5 Card light/dark via color-scheme
- Default scheme: Inherit | Light | Dark; per-card override via `--light` /
  `--dark` modifier in the class name; 3.x also had `--alt` (flip whatever
  the default is). Implemented with the CSS `color-scheme` property +
  `light-dark()` palette, not separate color classes.
- Source: https://docs.automaticcss.com/cards/card-color-scheme

### 1.6 Card workflow rules
- Enable framework before building cards; configure defaults on the first
  card; override per-card by **redefining tokens** (`--card-padding:
  var(--space-l)`), never hard values; reserve manual CSS for truly unique
  properties.
- Source: https://docs.automaticcss.com/cards/card-workflow

## 2. Spacing

### 2.1 Standard spacing — fluid scale
- **Tokens**: `var(--space-{xs|s|m|l|xl|xxl})` — "spacing is spacing":
  pure values, property-agnostic (same token for margin, padding, gap).
- **Inputs**: Base Spacing value (maps to `m`; desktop value at content
  width, mobile value at minimum width, fluid between) + Base Scale ratio
  (independent desktop/mobile ratios; >1 required for hierarchy).
- **Rule**: adjust spacing globally via base + scale; `calc()` on a token
  for tweener sizes — keep adjustments inside half a scale step (scale 1.5
  → adjust ≤×1.25/÷1.25, else switch to the next size).
- Source: https://docs.automaticcss.com/spacing/standard-spacing-setup ,
  https://docs.automaticcss.com/spacing/spacing-variables

### 2.2 Bridge variables
- `var(--space-{big}-to-{small})`, `var(--section-space-{big}-to-{small})`,
  `var(--text-{big}-to-{small})`, `var(--h{big}-to-h{small})` — desktop max
  of the bigger tier → mobile min of the smaller tier; wider fluid range
  than one tier gives (e.g. hero `padding-block: var(--section-space-xl-to-s)`).
- Source: https://docs.automaticcss.com/spacing/spacing-variables ,
  https://docs.automaticcss.com/typography/fluid-headings ,
  https://docs.automaticcss.com/typography/fluid-text

### 2.3 Section spacing
- **Rule**: top-level `<section>` gets `padding-block` at the "M" section
  size by default + `padding-inline: var(--gutter)`; sizes
  `--section-space-{xs..xxl}` derive from the standard scale × a
  mobile/desktop **Base Spacing Multiplier** (fluid, no breakpoints).
- **Classes**: `.section--{size}` adjust block padding only — never touch
  the inline gutter. Custom sizes via `calc()`/`fluid()`, e.g.
  `calc(var(--section-space-l) * 1.1)`.
- **Section anatomy** (advocated standard): `section` + inner `div` at
  `--content-width`, auto-centered, no extra inline padding; more white
  space → more block padding, never `min-height`.
- Source: https://docs.automaticcss.com/spacing/section-spacing ,
  https://docs.automaticcss.com/spacing/section-padding-classes

### 2.4 Gutter
- `var(--gutter)` — fluid responsive inline padding protecting content from
  screen edges; grows with viewport; **one value referenced site-wide** — "a
  gutter that changes from section to section is a clear sign of amateur
  web design."
- Source: https://docs.automaticcss.com/dimension/content-width-safe

### 2.5 Contextual spacing — the three gaps
- `--container-gap` (between containers inside a section; default
  `var(--space-xl)`), `--content-gap` (between content elements; default
  `var(--space-m)`), `--grid-gap` (between grid items; default
  `var(--space-m)`).
- **Rule**: use the contextual token for its context even when it isn't
  perfect — `calc(var(--grid-gap) * 2)` rather than a random value, so the
  instance stays hooked to the system.
- Source: https://docs.automaticcss.com/spacing/contextual-spacing

### 2.6 Automatic spacing (zero-specificity defaults)
- When enabled, ACSS applies at zero specificity: section → direct-child
  divs get `--container-gap`; section's direct-child containers get
  `--content-gap`; grids get `--grid-gap`. Overridable by anything.
- Source: https://docs.automaticcss.com/spacing/automatic-spacing

### 2.7 Smart spacing (the owl rule)
- **Rule**: default margins are stripped from headings, paragraphs, lists,
  list items; spacing is re-applied only to *adjacent siblings* (`* + *`)
  inside rich-text/post-content/`.smart-spacing`/targeted containers —
  never above a first child or below a last child. `gap` then spaces boxes
  evenly without margin interference.
- **Tokens**: `--paragraph-spacing`, `--heading-spacing`, `--h{2..6}-spacing`,
  `--list-spacing`, `--list-item-spacing`, `--list-indent-spacing`,
  `--nested-list-*`, `--flow-spacing` (catch-all for unidentified elements),
  `--figure-spacing`, `--figcaption-spacing`, `--blockquote-spacing`.
- **Duplicate-margin removal**: elements with block spacing (figure,
  blockquote, list) get collapsing margins removed via an editable selector
  list. `.smart-spacing--off` disables per subtree (then `gap` must do the
  work). Direct-children only — extra wrappers break targeting.
- Source: https://docs.automaticcss.com/spacing/smart-spacing

### 2.8 Overlap technique
- Overlapping an element into the section above: `margin-block-start:
  calc((var(--section-space-m) + var(--space-l)) * -1)` and compensate the
  overlapped section `padding-block-end: calc(var(--section-space-m) +
  var(--space-l))` — token-derived, no magic numbers.
- Source: https://docs.automaticcss.com/spacing/spacing-variables

### 2.9 Header padding
- `.header--{size}` — adjusts block padding only, keeps the gutter; uses the
  *standard* spacing scale (headers need less than sections).
- Source: https://docs.automaticcss.com/spacing/header-padding-classes

## 3. Dimensions & layout

### 3.1 Content width
- `var(--content-width)` (live default 128rem @62.5% = 1280px; prose measure
  60ch) + `.content-width` (`max-inline-size`); reference the token in the
  builder's container width so both stay in sync. Fractions via
  `calc(var(--content-width) * 0.75)` — stays 100% on mobile vs. fragile
  percentage widths.
- Source: https://docs.automaticcss.com/dimension/content-width

### 3.2 Content width safe
- `var(--content-width-safe)` = `min(var(--content-width), calc(100% −
  var(--gutter) * 2))`; `.content-width--safe` adds `margin-inline: auto`.
  Use inside parents that have no physical gutter; **never double-gutter**
  (don't use inside a section that already pads).
- Source: https://docs.automaticcss.com/dimension/content-width-safe

### 3.3 Width utilities
- `.width--{10..90}` = `inline-size:100%; max-inline-size: calc(content-width
  × n/100)` — fractions of *content width*, not viewport %. Special:
  `.width--full|auto|max-content|min-content|fit-content`.
- Source: https://docs.automaticcss.com/dimension/width-utilities

### 3.4 Boxed layout
- Body = fixed-width "canvas box" on a device-background field; keeps
  content width + gutter inside the box. Settings: body width, top margin,
  border, radius, body shadow.
- Source: https://docs.automaticcss.com/dimension/boxed-layout

### 3.5 Auto object-fit
- Optional global: `img { object-fit: var(--object-fit, cover);
  object-position: var(--object-position, 50% 50%) }` — locally overridable
  per subtree.
- Source: https://docs.automaticcss.com/dimension/auto-object-fit

## 4. Grids

### 4.1 Auto grids (4.x: variables/mixin/recipe, no classes)
- `var(--grid-auto-2..12)` as `grid-template-columns`; items wrap to new
  rows when they hit a computed minimum (derived from `--grid-gap`) — no
  breakpoints. Globals: flow `auto-fit` (default; stretch items to fill
  row) vs `auto-fill`; aggressiveness 0–1 (default `.7`, higher stacks
  sooner). Recipe `?auto-grid` exposes `--column-count` (default 4),
  `--auto-grid-aggressiveness`, or a fixed `--min` (e.g. `280px`).
  Optional "even stacking" block keeps even column counts even (4→2→1).
- **Rule**: pair with `gap: var(--grid-gap)`; spans are impractical in
  auto grids — use a traditional grid when you need them.
- Source: https://docs.automaticcss.com/grids/auto-grids

### 4.2 Grid variables (fixed + ratio)
- `var(--grid-1..12)` even columns; uneven ratio sets `var(--grid-1-2),
  --grid-2-1, --grid-1-3, --grid-3-1, --grid-2-3, --grid-3-2)`. Responsiveness
  is manual: media/container query swaps `grid-template-columns` to
  `var(--grid-1)`.
- Source: https://docs.automaticcss.com/grids/grid-variables

### 4.3 Variable grid (`--min`)
- `?variable-grid` / `@include` — grid fills the row with as many items as
  fit ≥ `--min` (default 350px in recipe). Responsive by item width, not
  viewport (container-query-like without queries). Fix orphan rows by
  re-setting `--min` at a breakpoint or inline (`style="--min:320px"`).
- Source: https://docs.automaticcss.com/grids/variable-grid

### 4.4 Alternating grids
- `.grid-alternate--{bp}` (3.x): two-column rows alternate media/text sides
  at a chosen min-width breakpoint and up — never alternate on mobile.
- Source: https://docs.automaticcss.com/grids/auto-alternating-grids

### 4.5 Content grid — named zones
- `.content-grid` establishes zones: `content` (`--content-width`),
  `feature` (content ± `--feature-width` per side), `feature-max`
  (`--feature-max-width`), `full` (edge-to-edge), `full-safe` (full +
  `padding-inline: var(--gutter)`). Items land in `content` by default;
  assign via `.content--feature` classes or `grid-column: feature`.
  On sections it replaces the gutter. Auto-responsive.
- 50/50 split formula: `grid-template-columns: calc((min(50vw −
  var(--gutter), var(--content-width)/2)) − (var(--grid-gap)/2)) minmax(0,1fr)`.
- Source: https://docs.automaticcss.com/grids/content-grid

### 4.6 Flex grid (centered remainders)
- `?flex-grid` — flexbox grid for when unbalanced trailing items must
  center/stretch (grid can't). Local vars `--gap` (`var(--grid-gap)`),
  `--columns`, `--stretch`; responsive via edited media queries.
- Source: https://docs.automaticcss.com/flexbox/flex-grids

### 4.7 CSS columns
- `?columns` recipe: `--col-count`, `--col-min-width`, `--col-rule-*`
  (ruled dividers between columns), `--col-gap`, `--row-gap` (margin shim —
  columns have no row-gap). For long text, lists, masonry.
- Source: https://docs.automaticcss.com/columns/css-columns

## 5. Typography

### 5.1 Fluid scales
- Root font size set in % (default 100%; 62.5% optional). Base text = "M"
  size; S/XS scale down, L–XXL scale up by the type-scale ratio;
  independent desktop/mobile scales (>1 required; tighter on mobile).
  Headings: base sets H4 desktop size; `--h1..h6` fluid clamps. Per-size
  min/max overrides remove that size from the scale. H5/H6 ship with fixed
  minimums for accessibility.
- Source: https://docs.automaticcss.com/typography/fluid-text ,
  https://docs.automaticcss.com/typography/fluid-headings

### 5.2 Text-wrap — the orphan rule
- **Rule**: `--text-text-wrap` default **`pretty`** — "automatically
  prevents typography orphans"; `--heading-text-wrap` also exposes
  text-wrap (live install = `balance`). `balance` is "a little
  heavy-handed" and ignored beyond ~4 lines; `wrap` disables.
- Source: https://docs.automaticcss.com/typography/default-typography-styling ,
  https://docs.automaticcss.com/typography/typography-variables

### 5.3 Smart line-height
- Default line-height is a formula `calc(<leading> + 2ex)` — leading +
  double x-height — so it scales correctly across typefaces/sizes instead
  of a flat 1.1/1.5. Tune by decimal increments on the `ex` term.
- Source: https://docs.automaticcss.com/typography/default-typography-styling

### 5.4 Line length caps
- `ch` max-widths per text size and per heading (`--text-{size}-max-width`,
  `--h{n}-max-width`, `--text-max-width`). Optimal body measure **50–60ch**
  at 16–20px; layouts can cap naturally (left-column hero) else cap in CSS.
- Source: https://docs.automaticcss.com/typography/text-heading-line-length

### 5.5 Semantic-vs-visual size decoupling
- Use `font-size: var(--h4)` on an `h2` when semantics demand a level but
  design demands smaller — heading class ≠ visual size.
- Source: https://docs.automaticcss.com/typography/typography-variables

### 5.6 Text classes
- `.text--{size}` xs–xxl (works on elements *or* containers), `.text--{color}`,
  weight 100–900, style, decoration, transform, alignment.
- Source: https://docs.automaticcss.com/typography/text-classes

## 6. Buttons & links

### 6.1 Button defaults
- Padding in **em** (scales with button text size): `--btn-padding-block`,
  `--btn-padding-inline`; `--btn-min-width` (warn: too high → mobile
  overflow); text `line-height: 1`; radius inherits global `--radius` —
  do **not** set radius on individual buttons (loses global control);
  transition inherits global `--transition`.
- Source: https://docs.automaticcss.com/buttons/button-styling

### 6.2 Button classes & sizes
- `.btn--{color}` (primary/secondary/tertiary/accent/base/neutral),
  `.btn--{color}-light|dark` variants (standalone, not combined with base),
  `.btn--outline` modifier (needs the color class too), `.btn--{size}`
  t-shirt sizes xs–xxl.
- **Outline parity**: outline and solid share `--btn-border-width` so
  heights match side-by-side.
- Auto-styling applies to any class starting `.btn--` (exclusion list
  available); `.unrelate` opts a button out of contextual color
  relationships.
- Source: https://docs.automaticcss.com/buttons/button-classes ,
  https://docs.automaticcss.com/buttons/outline-buttons ,
  https://docs.automaticcss.com/buttons/auto-button-styling-exclusions

### 6.3 Button token overrides
- All button styles are locally scoped `--btn-*` vars; override per-element,
  per-section, or per-page (body class) without forking the system.
- Source: https://docs.automaticcss.com/buttons/button-variables

### 6.4 Links
- Global link defaults: color (variable), weight `inherit`, decoration,
  decoration color/thickness, underline offset, global transition. Exclusion
  rules via quoted selectors (`"header a", "footer a"`).
- **External links**: visual + auditory indication when opening new tabs;
  indicator (entity, position, gap, size, color); SR cue text default
  "Link to external site"; auto-excludes links wrapping
  `img/figure/picture/svg` via `:has(> …)`; external-only (never internal).
- Source: https://docs.automaticcss.com/links/link-styling ,
  https://docs.automaticcss.com/links/external-link-indication

## 7. Color system

### 7.1 Palette — named roles + OKLCH shades
- Six named colors: Primary (brand/action), Secondary, Tertiary, Accent
  (rare emphasis), Base (backgrounds/body text), Neutral (greys — borders,
  disabled). Enable only what's needed. Each expands to a shade scale:
  `ultra-light, light, semi-light, semi-dark, dark, ultra-dark, hover` —
  generated in **OKLCH** (perceptually even steps), each overridable.
- **Unified Lightness**: force all base swatches to one OKLCH L (default
  0.65) so brand colors share perceived brightness; semantic colors
  (Warning/Info/Success/Danger) optionally unified too.
- Source: https://docs.automaticcss.com/colors/palette-intro ,
  https://docs.automaticcss.com/colors/main-colors ,
  https://docs.automaticcss.com/colors/unified-lightness ,
  https://docs.automaticcss.com/colors/semantic-colors

### 7.2 Contextual assignments
- Abstract roles instead of colors: `.bg--light|ultra-light|dark|ultra-dark`,
  `--text-light|dark|light-muted|dark-muted`, `--body-bg-color`. Default
  body bg + main text color are *assignments* (`var(--text-dark)` is a
  context token, not a color).
- Source: https://docs.automaticcss.com/color-assignments/background-text-assignments ,
  https://docs.automaticcss.com/backgrounds/contextual-background-colors

### 7.3 Automatic color relationships
- `.bg--{context}` flips foreground automatically: heading/text/link/hover
  colors, button style, icon color, focus color per relationship
  (ultra-light/light/dark/ultra-dark). **Only classes trigger it** —
  `background: var(--bg-dark)` does not (variables carry values, not
  behavior). `.unrelate` opts out per element; surfaces can carry a
  relationship too.
- Source: https://docs.automaticcss.com/color-assignments/automatic-color-relationships ,
  https://docs.automaticcss.com/backgrounds/contextual-background-colors

### 7.4 Color scheme (light/dark)
- Enabling converts every palette var to `light-dark(light, dark)` and sets
  `color-scheme` on `:root`. Shades auto-invert (ultra-light ↔ ultra-dark);
  main + hover colors keep their value unless overridden per color.
- Website Scheme: `light` | `dark` | `light dark` | `normal`. Force scheme
  per subtree: `.scheme--light` / `.scheme--dark` or dashboard selectors.
- Manual `light-dark(a, b)` works anywhere for non-palette values.
- **Gotcha**: manually flipped subtrees need explicit bg + fg set —
  inherited body colors don't invert.
- Source: https://docs.automaticcss.com/color-scheme/color-scheme-setup ,
  https://docs.automaticcss.com/color-scheme/implementing-color-scheme

### 7.5 Transparencies (4.x: no tokens)
- Removed pre-built `--*-trans-*` tokens; create on demand:
  `color-mix(in oklch, var(--primary) 20%, transparent)` or relative color
  syntax `oklch(from var(--primary) l c h / 0.5)`.
- Source: https://docs.automaticcss.com/colors/transparencies

## 8. Borders, dividers, radius, shadows

### 8.1 Global border system
- `var(--radius)` = the one global radius (sites rarely need more than one
  radius value — the exception being concentric math); `var(--border)` =
  `--border-size --border-style --border-color-{light|dark}` composite;
  granular `--border-width/style/color-*` overridable locally. Auto-radius
  targeting adds `--radius` to selectors (default `img`, `figure`).
- Source: https://docs.automaticcss.com/borders-dividers/global-border-system

### 8.2 Divider system
- `var(--divider)` composite (size + style + light/dark color) for
  `border-*` use; `--divider-gap` for the spacing around it; recipes
  `?divider-top|bottom|all` (`?divider-all` spaces direct children with
  margins — set container `gap: 0` when used).
- Source: https://docs.automaticcss.com/borders-dividers/global-divider-system

### 8.3 Inverted radius framework
- `data-inverted-radius-{1|2}-{position|slice}` attributes; positions are 16
  named placements (top/bottom × left/right × inside/outside combos),
  slices are 4 corners; `--bg` token must be defined at the parent; max 2
  corners (pseudo-element technique); works with solid colors, not
  gradients/textures (masking technique needed for those).
- Source: https://docs.automaticcss.com/borders-dividers/inverted-radius-framework

### 8.4 Box shadows
- 5 named slots `var(--box-shadow-1..5)`; slots 1–3 ship layered shadows
  (subtle 3-layer, medium 4-layer, heavy 6-layer); custom names
  (`--box-shadow-subtle`); compound shadows encouraged.
- Source: https://docs.automaticcss.com/shadow-filters/box-shadows

## 9. Accessibility

### 9.1 Clickable parent
- **Rule**: never wrap a content group in `<a>` (invalid nesting + SR
  announces garbage). Put the link on the *heading* and extend its hit area
  to the whole card via an absolutely positioned pseudo-element:
  `?clickable-parent` recipe / `@include clickable-parent` on the `a`;
  parent gets `position: relative`. Avoid when the card has multiple links.
- Source: https://docs.automaticcss.com/accessibility/clickable-parent

### 9.2 Focus parent
- `?focus-parent` / `@include focus-parent(shadow|outline)` — child link
  keeps `:focus` for SR/keyboard, visual indication moves to the parent
  (`:focus-within`) so the whole card shows the focus ring.
- Source: https://docs.automaticcss.com/accessibility/focus-parent

### 9.3 Global focus styling
- Style: `outline` (offsettable) or `shadow` (follows corner curves);
  `--focus-color` (default primary), width (rem recommended), offset.
  Override locally by setting `--focus-color` on any subtree (e.g. dark
  section → `--focus-color: var(--white)`).
- Source: https://docs.automaticcss.com/accessibility/focus-styling

### 9.4 Hidden-accessible text
- `.hidden-accessible` — visually hidden, announced by AT (preferred over
  `aria-label` when markup access is limited or translation needed).
  Builder shows an indicator icon so hidden text isn't forgotten.
- Source: https://docs.automaticcss.com/accessibility/hidden-accessible-class

### 9.5 Reduced motion
- `prefers-reduced-motion` support ON by default and should never be off:
  kills scroll/entrance animations, On-Visible transitions, hover
  transitions and transform-based hover effects.
- Source: https://docs.automaticcss.com/accessibility/reduce-motion

### 9.6 Skip link
- Docs navigation exposes a "Skip to main content" affordance
  (Docusaurus-level); ACSS itself doesn't ship a dedicated skip-link page
  in the 4.x sitemap — pattern exists in accessibility recipes.

## 10. Icons

- `data-icon` attribute opts an inline SVG into the Icon Framework (icon
  styles, sizes, boxed/plain). Themes Light/Dark named by **icon color**,
  not box style — converting boxed↔plain must never change icon color.
- Sizes: `.icon--{s|m|l}` default three t-shirt sizes (expandable); style
  `.icon--boxed|plain` or `data-icon-style`; theme `.icon--light|dark` or
  `data-icon-theme`; boxed = padding + border + background + optional
  shadow. Icon lists via `data-icon-list` / `.icon-list` with list gap +
  offsets. Every property is a `--icon-*` variable; `icon()` mixin exists.
- Source: https://docs.automaticcss.com/icons/icon-framework

## 11. Forms

- Unified config: one set of structural/spacing values for all forms;
  colors auto-adapt via `light-dark()` + `color-scheme` (no separate
  light/dark definitions). `.form--light|dark` explicit overrides.
  Floating-label background token for "inside" label position (default
  `--white` — must match the surface behind the field).
- Source: https://docs.automaticcss.com/forms/form-styling-basics

## 12. Workflow philosophy

### 12.1 T-shirt sizes
- One sizing convention everywhere: `xs s m l xl xxl` for spacing, text,
  buttons, sections, icons. Fewer options → more consistency; memorizing
  one scale covers the whole framework.
- Source: https://docs.automaticcss.com/3.0/fundamentals/t-shirt-sizes-for-enhanced-simplicity

### 12.2 Variables are king; utilities sparingly
- Recommended workflow: custom **BEM classes + variables** do most of the
  work; utility classes used sparingly. Variables can be `calc()`-tuned and
  stay hooked to the system.
- Source: https://docs.automaticcss.com/spacing/spacing-variables

### 12.3 BEM conventions
- `.<block>`, `.<block>__<element>`, `.<block>--<modifier>`; modifiers are
  always applied alongside the block class (`article-card
  article-card--dark`), never alone. Auto-BEM (3.x builder feature)
  generates block+children classes; `()`/`[]` text in labels ignored.
- Source: https://docs.automaticcss.com/3.0/cards/card-framework ,
  https://docs.automaticcss.com/3.0/workflow-enhancements/auto-bem

### 12.4 Global transition
- `var(--transition)` = duration + timing + delay composite
  (`--transition-duration/timing/delay` granular); applied to buttons and
  links by default; local overrides must use the granular vars.
- Source: https://docs.automaticcss.com/effects/transition

### 12.5 Surfaces & overlays
- `.surface-{name}` (up to 5 custom): reusable backgrounds bundling color,
  image/gradient/pattern, size/position/attachment/repeat, optional overlay
  (color + opacity), optional animation, and a **color relationship**
  (light/dark/ultra-*) so foreground auto-adjusts.
- Source: https://docs.automaticcss.com/backgrounds/surfaces ,
  https://docs.automaticcss.com/overlays/overlay-classes
