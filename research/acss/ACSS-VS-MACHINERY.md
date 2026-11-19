---
id: acss-vs-machinery
type: research
links:
  used_by: [rules-T, rules-L, rules-G, rules-S, rules-C, rules-R, rules-I, rules-M, BASE.ACSS, design-index]
---
# ACSS vs design machinery — gap analysis

Companion to `ACSS-DOCS-DIGEST.md` (all rules cited there). Status
legend: **MATCH** = machinery already enforces; **DIFFERS** = both have a
rule and they conflict — verdict states which is better and why;
**MISSING** = ACSS rule with no machinery counterpart; **N/A** = ACSS
feature not applicable to an Astro/Tailwind pipeline.

Priority items flagged with ★ are called out in the assignment.

## A. Global topics

| # | ACSS rule | Machinery rule | Status | Proposed rule + measurable check |
|---|---|---|---|---|
| A1 | Root font % + fluid `clamp()` scales for text, headings, spacing — min at `--min-width`, max at `--content-width` | BASE.ACSS adopts ACSS clamps as DNA v0; knobs.json `type.ratio`, `type.base` | MATCH | — |
| A2 | `--text-text-wrap: pretty` on body text — "prevents typography orphans" | T.6: `text-wrap: pretty` on body; T.8 checklist asserts it | MATCH | — |
| A3 | `--heading-text-wrap` exposed; default `balance` on headings (live install) | T.6/T.8: `text-wrap: balance` on headings | MATCH | — |
| A4 | text-wrap applied as **token** (`--text-text-wrap`, `--heading-text-wrap`), overridable per subtree | T.6 names the values but not the token plumbing | MISSING (minor) | Rule: emit `--text-wrap-body: pretty`, `--text-wrap-heading: balance` in TOKENS.json; markup binds tokens. Check: computed `text-wrap` on `p`/`h1–h6` resolves via the tokens; a literal `text-wrap:` outside token defs = FAIL. |
| A5 | Smart Line Height — `calc(leading + 2ex)` default; scales across typefaces/sizes | T.6: static bounds (≥1.5 body, ~1.3 small-x-height) | DIFFERS — ACSS better for fluid systems (one formula vs two hardcoded numbers); ours is simpler to gate. **Adopt formula as default, keep ≥1.5 floor.** | Rule: body `line-height: calc(0.5ex + 1ex)`-family formula permitted as token `--leading-body`, floor ≥1.5 remains the FAIL bound. Check: `line-height` computed ≥1.5 × font-size on `p`. |
| A6 | `ch` max-width per text size AND per heading (`--h{n}-max-width`); optimal 50–60ch | T.6: 52–65ch prose, 75ch shell | MATCH (ours stricter; ACSS heading caps worth noting) | Optional extension: heading max-width token; check `max-width` ends in `ch` on prose containers. |
| A7 | Section spacing = `padding-block: --section-space-*` on `<section>` + `padding-inline: var(--gutter)`; M default; `.section--{size}` adjusts block only, never gutter | L.14 (sections pad ≥ `--section-space-s`), L.17 (≥ `--section-space-m`), R.2 edge-padding ramp (static px), knobs `space.section_py` (px ranges w/ acss tier map), SB.2 shell owns padding | MATCH (shell architecture is superior to a class) | — |
| A8 | Gutter is ONE fluid token `var(--gutter)` referenced site-wide; inconsistent gutters = amateur | R.2 static ramp 16→24→32→40→48 per breakpoint; L.3 inset ≥10–15% | DIFFERS — ours is a stepped ramp, ACSS fluid clamp. Both enforce "one declared gutter"; fluid is more ACSS-canonical, ramp fits our closed-breakpoint model. **Keep ramp; optionally bind each stop to `clamp()` tiers later.** | Rule stays R.2; document ACSS `--gutter` equivalence in BASE.ACSS (done). No new check needed. |
| A9 | `--content-width` + `--content-width-safe` = `min(cw, 100% − 2·gutter)` | L.11 960/1440 containment, R.2 ceiling 1440 | DIFFERS — our ceiling 1440px vs ACSS 1280px default; ours deliberate (canon). **Keep ours** (LAW.REF > ACSS). | Add `--content-width-safe` analog: Rule: elements needing content width inside a non-guttered parent use `min(var(--content-width), 100% − 2·edge-padding)`, never double-gutter. Check: no nested gutter: an element with `padding-inline` matching edge ramp must not contain another that does. |
| A10 | Contextual gaps: `--container-gap` (`space-xl`), `--content-gap` (`space-m`), `--grid-gap` (`space-m`) — context named, `calc()` to tune, never stray values | L.17: header→body ≥ `--space-l`/`--container-gap`; card grids `gap ≥ --space-m`; G.2 proximity ≥2× | MATCH (L.17 already names `--container-gap`; G.2 gives the semantic the contextual vars encode) | Encode tokens explicitly: emit `--container-gap`, `--content-gap`, `--grid-gap` in global.css bound to space tiers. Check: grid/gap declarations reference a named token, not raw px. |
| A11 | Smart spacing: strip default margins on h/p/ul/li; re-space only adjacent siblings (`* + *`), never first/last child; `--flow-spacing` catch-all | L.6 heading-binds-forward (bottom margin < top); nothing stripping margins or owl-spacing | ★ MISSING | Rule: global.css resets `h1–h6,p,ul,ol,li,figure,blockquote` margins to 0; vertical rhythm lives in flex/grid `gap` + a `.flow` (prose) owl rule `> * + * { margin-block-start: var(--flow-spacing) }`; first/last child never get outer margin. Check: CSS contains a margin reset + sibling-selector flow rule; rendered DOM has no element-margin above a section's first child or below its last child. |
| A12 | Automatic spacing at **zero specificity** — defaults always overridable | SB.2 shell owns spacing (stronger guarantee) | MATCH (ours stricter) | — |
| A13 | Spacing adjustments stay ≤ half a scale step; beyond → move a tier (`calc(var(--space-m)*1.5)` is banned — it's `space-l`) | G.1 closed px set (no tweeners at all) | DIFFERS — ours stricter (closed set) and better for gating. **Keep ours.** | — |
| A14 | Overlap = token math: `margin-block-start: −(section-space + space-l)` + equal `padding-block-end` compensation | L.8 frame-break (one declared break); no numeric formula | MISSING (minor) | Rule: declared overlaps compute from spacing tokens (`calc((section-py + overlap-step) * -1)`) with equal compensation on the overlapped section — no magic px. Check: negative margins on bleed elements resolve to token-derived calc; compensation padding present. |
| A15 | Bridge variables `--space-{big}-to-{small}` for wider fluid ranges | Not present (G.1 closed set, no fluid spacing) | MISSING (optional) | If fluid spacing adopted: allow `space-{a}-to-{b}` named bridges only, never raw clamps. Check: clamp() spacing values only inside named bridge tokens. |
| A16 | T-shirt sizes `xs–xxl` as the one sizing convention | G.3 `compact|regular|spacious` + S.2 six radius tokens + G.1 px set — analogous closed sets, different names | MATCH (ours is finer-grained) | — |
| A17 | Variables are king: custom BEM classes + tokens; utilities sparingly | P.1/SB: every composition a component, classes ⊆ `@layer components`, no stray styles | MATCH | — |
| A18 | BEM: block`__`element`--`modifier; modifier never alone | Not codified (components are `.astro` files; class naming unenforced) | MISSING | Rule: component classes follow `block__element--modifier`; `--modifier` classes never appear without their block class in markup. Check: class-name lint in `check_class_subset` — modifier class without matching block = FAIL. |
| A19 | `color-scheme` + `light-dark()` for light/dark; shades auto-invert | C.5: `darkMode:'class'`, `.dark` re-binds roles, toggle persisted + prefers-color-scheme init | DIFFERS — mechanism differs (class toggle vs color-scheme); ours gives operator-visible toggle + persistence, ACSS's is more standard-CSS. **Keep ours** (canon: toggle is a W5 gate). | — |
| A20 | Automatic color relationships: bg context flips heading/text/link/button/icon/focus | C.1 role map + S.5 separation; relationships are manual (designer picks ink per surface) | MISSING | Rule: contextual bg classes (`bg--dark` etc.) carry a declared foreground mapping (ink, muted, link, accent, focus) — a surface with dark bg must use the dark-fg token set; mixing light-ink on dark surface or vice-versa = FAIL. Check: computed text/heading/link/focus colors inside each bg context come from the paired token set; contrast check runs per context (already `check_contrast` — extend to link/focus). |
| A21 | Palette: 6 named colors + OKLCH shade scale (ultra-light…ultra-dark + hover); unified lightness 0.65 optional | C.1 6-role semantic map + C.3 tinted neutrals + C.4 harmony accent | DIFFERS — different role vocabularies (ours bg/surface/ink/accent roles are functional; ACSS brand names). Ours is better for gating (contrast floors per role). **Keep ours; borrow OKLCH.** | Rule: shade/hover steps derived in OKLCH (perceptually uniform), `color-mix(in oklch, …)` for transparencies — already implicit? Make explicit: hover = `color-mix` or `light-dark()` values, never a second hand-picked hex. Check: no literal hex for hover/transparent variants in TOKENS.json. |
| A22 | Transparencies on demand: `color-mix` / relative color syntax, no token library | Not specified | MISSING | Rule: alpha colors via `color-mix(in oklch, var(--role) X%, transparent)` only. Check: no `rgba(`/`hsla(` literals with hardcoded channels outside tokens. |
| A23 | `prefers-reduced-motion`: all animation off, ON by default | M.6: mandatory, 150ms crossfade fallback | MATCH | — |
| A24 | Global `--transition` (duration/timing/delay) shared by buttons+links | M.2 duration/easing tokens | MATCH | — |
| A25 | `.hidden-accessible` visually-hidden text for icon links; prefer over aria-label when needed | I.6: standalone glyphs require `aria-label`; no sr-only rule | MISSING | Rule: icon-only links/buttons carry `aria-label` OR a `.sr-only` text node; decorative images/icons get `aria-hidden`. Check: interactive element with no accessible name = FAIL (a11y lint). |
| A26 | Global focus: `--focus-color` token, outline or shadow style, rem width, local override per subtree | I.7: 2px ring + 2px offset; I.9 focus-visible required | MATCH (ACSS's `--focus-color` local override worth adopting) | Rule: focus ring color exposed as `--focus-color` token, overridable per dark context. Check: `--focus-color` defined; dark surfaces remap it. |
| A27 | External links: visual + SR indication; `:has(> img,figure,svg)` excluded; external only | W.7 link scent; no external-link rule | MISSING | Rule: links with `target="_blank"` carry visible indicator + `rel="noopener"` + SR cue; image-wrapped links excluded via `:has()`; internal links never open new tabs. Check: `target="_blank"` without indicator/rel = FAIL; `target="_blank"` on same-origin = FAIL. |
| A28 | `scroll-margin`/`scroll-padding` pairs with sticky headers | R.11 | MATCH | — |
| A29 | `object-fit` global default `cover` + `--object-fit`/`--object-position` subtree override | V.* media rules (treatment knob); no object-fit default | MISSING (minor) | Rule: `img { object-fit: var(--object-fit, cover); object-position: var(--object-position, 50% 50%) }` in base layer. Check: images with fixed aspect boxes never distort. |
| A30 | Breakpoints: ACSS4 is breakpoint-free (fluid + min-width/content-width + ad-hoc queries) | R.1 closed 7-stop set, min-width only | DIFFERS — deliberate: closed stops are more gateable; fluid baseline already covered by clamps. **Keep ours.** | — |
| A31 | Skip link + landmarks | not found in our rules (check_landmarks exists in enforcement checks) | PARTIAL | Verify check_landmarks covers skip link; else add: page has skip-to-content link as first focusable. |

## B. Cards

| # | ACSS rule | Machinery rule | Status | Proposed rule + measurable check |
|---|---|---|---|---|
| B1 | One `--card-*` token surface for all card types: padding, gap, radius, heading size/color, text size/color, link colors, media radius/ratio/fit, avatar, icon, shadow | L.13 card padding 15–25px; S.3 cards→`radius-lg`; G.6 canon padding bands; G.7 equal-height; no unified card token contract | ★ MISSING | Rule: every card component binds a `--card-*` token set: `--card-padding` (space tier or canon band), `--card-gap`, `--card-radius`, `--card-heading-rank`, `--card-media-ratio`. Per-type overrides redefine tokens, never literals. Check: card shells contain no literal padding/gap/radius px outside tokens; all card types resolve the same token names. |
| B2 | Card defaults: `display:flex; flex-direction:column`; padding+gap on the *content* (may move to inner wrapper — `padding:0;gap:0` + `__content-wrapper` re-application pattern is sanctioned) | Not codified | ★ MISSING | Rule: cards are column-flex stacks with `gap: var(--card-gap)`; media may sit edge-to-edge while `__content` carries padding — the wrapper-rebind pattern is legal, padding on the shell AND content is not (double padding). Check: no element has both card-padding and a padded direct child (sum > 1 token). |
| B3 | Card children targeted by anatomy names: `__media`, `__avatar`, `__heading`, `[data-icon]`, h1–h6 | Not codified (anatomy is freeform per component) | ★ MISSING | Rule: card anatomy uses `__media|__avatar|__heading|__content` element classes and `data-icon` on icons; a card with media not under `__media` = FAIL. Check: class presence per anatomy part in component markup. |
| B4 | Concentric radius: Standard (`outer = radius + padding`) or Reverse (`inner = radius − padding`, floor `--card-min-radius` 4px) | S.4: `R_inner = R_outer − P_padding`, zero-collapse, flush-media inherits outer edges | MATCH (ours = ACSS "Reverse" + collapse rules; S.4 is strictly more complete) | — |
| B5 | Card light/dark via `color-scheme` + `--light`/`--dark`/`--alt` modifiers | C.5 both modes site-wide | MATCH | — |
| B6 | Card heading size = `--card-heading-size` (dashboard default; decouple visual rank from semantic level — see A/typography h2→h4 trick) | E.2 `query`/`claim` classes; T.1 ranks | PARTIAL | Rule: card heading renders at a declared rank token (`--card-heading-rank`), semantic level per E vector; visual ≠ semantic allowed. Check: card h-tag size resolves to rank token. |
| B7 | Cards: override by redefining tokens (`--card-padding: var(--space-l)`), never hard values | SB.3 contract `allowed` classes only | MATCH | — |
| B8 | Clickable card = heading link + pseudo-element hit area (clickable-parent), never `<a>` wrapping the card; focus ring on the parent (focus-parent) | Nothing — no clickable-card rule | ★ MISSING | Rule: a fully-clickable card puts `<a>` on its heading/CTA only; `a::after` (or pseudo) `position:absolute; inset:0` extends the hit area; card is `position:relative`; focus-visible styles the card via `:focus-within`; never wrap the whole card in `<a>`; multiple links → no pseudo expansion. Check: no `<a>` containing h*/figure/multiple siblings; clickable card has `:focus-within` style. |
| B9 | Card shadow = `--card-shadow` slot (layered shadow vars 1–3) | S.5 separation strategy incl. shadow-only/hybrid; S.7 elevation↔radius | MATCH | — |

## C. Buttons & links

| # | ACSS rule | Machinery rule | Status | Proposed rule + measurable check |
|---|---|---|---|---|
| C1 | Button padding in **em** (scales with text size); `line-height:1`; `--btn-min-width`; radius inherits global `--radius` | R.6 target ≥44px; R.9 mobile full-width ≥48px; S.3 buttons→`radius-md` | ★ DIFFERS — em padding is the better primitive (size classes scale padding automatically); our radius-md vs ACSS global radius reconciles via S.2 columns. | Rule: `--btn-padding-block`/`--btn-padding-inline` in em; button size tiers scale font-size, padding follows; min-block-size ≥48px enforced at computed level. Check: button padding declared in em; computed height ≥44/48px; radius = radius-md token. |
| C2 | `.btn--outline` shares `--btn-border-width` with solid → identical heights side-by-side | S.5 border widths {0,1,2} | MISSING | Rule: outline and solid variants of one button class share border-width so heights match; outline = transparent bg + colored border. Check: side-by-side solid+outline render equal height. |
| C3 | `.btn--{color}` + size tiers xs–xxl; light/dark variants standalone (never combined with base class) | C.1 accent CTA (no ghost primary); sizes unenforced | PARTIAL | Rule: button sizes come from a closed tier set {s,m,l} mapped to text tiers; variant class never mixes two color classes. Check: button class list ⊆ closed set. |
| C4 | All button styles are `--btn-*` scoped vars; overrides per element/section/page via token redefinition | SB contract allowed-classes | MATCH | — |
| C5 | Button text-decoration, transform, family, weight all token-driven; transition = global | M/W rules | MATCH | — |
| C6 | Link defaults: color var, weight inherit, decoration controls (thickness, offset); exclusion contexts (header/footer/nav) | W.7 scent; no link-style rule | MISSING | Rule: global link style token set (color, decoration, thickness, offset); chrome contexts (nav, footer, breadcrumbs) excluded via declared contexts, not ad-hoc overrides. Check: links in excluded contexts use context tokens; body links use link tokens. |
| C7 | `.unrelate` — opt a button out of contextual color relationships | — (A20 covers relationships) | covered by A20 | — |

## D. Grids & layout

| # | ACSS rule | Machinery rule | Status | Proposed rule + measurable check |
|---|---|---|---|---|
| D1 | Auto grids: `var(--grid-auto-N)`, items wrap at computed min, `auto-fit` default, aggressiveness .7 | G.5: `repeat(auto-fit, minmax(min(var(--grid-min,28rem),100%),1fr))` — same mechanism, ours parameterizes `--grid-min` directly | ★ MATCH (ours is equivalent and simpler to gate) | — |
| D2 | `auto-fill` keeps empty cells vs `auto-fit` stretches | G.5 fixes `auto-fit` | MATCH (deliberate pick) | — |
| D3 | Even-stacking option: even column counts stay even when wrapping (4→2→1) | Not specified | MISSING (minor) | Rule: card collections of even count prefer even collapse steps (4→2→1) where the grid supports it. Check: collapse step sequence declared per composition (already R.3 for named compositions). |
| D4 | Ratio grids `var(--grid-1-2)` etc. via variables; collapse by query | R.3 `split-media` declared collapse | MATCH | — |
| D5 | Variable grid `--min` — items ≥ min width decide columns | G.5 `--grid-min` | MATCH | — |
| D6 | Content grid zones: content / feature / feature-max / full / full-safe | L.11 containment + bleed surfaces; T.10 inset vs bleed | PARTIAL — ours binary (contained vs bleed), ACSS has intermediate "feature" zones | MISSING (optional) | Rule: editorial/article sections MAY use a `feature` zone (content-width + declared offset per side) for pull-quotes/figures wider than measure but narrower than bleed. Check: zone membership ∈ {content, feature, full}; figure widths resolve to a zone. |
| D7 | Alternating media/text rows alternate at chosen breakpoint, never on mobile | Not codified (patterns may alternate) | MISSING | Rule: `feature-split` rows alternate media side on ≥lg only; mobile order is always text-first (R.3). Check: DOM order text-first; alternation applied via direction/order only above the declared stop. |
| D8 | Flex grid for centered trailing items | Not covered | MISSING (optional) | Rule: when trailing partial rows must center, use flex-wrap with computed flex-basis, not grid + hacks. Check: low priority. |
| D9 | `.section--{size}` adjusts block padding only, never gutter | SB.2 shell owns both; density field picks the tier | MATCH (ours stronger) | — |
| D10 | Section = `section` + inner `div` at content width, auto-centered, no inline padding on inner | SB.2 `sec-band` > `sec-inner` | MATCH | — |
| D11 | More whitespace → more block padding, never `min-height` | Not codified | MISSING | Rule: section vertical presence comes from `--section-space-*` only; `min-height` on sections banned except declared hero/full-viewport compositions. Check: `min-height` outside declared comps = FAIL. |
| D12 | Header/footer: same section rules; header block padding uses *standard* scale (less than sections) | Nothing header-specific | MISSING (minor) | Rule: site header/footer use space-* (not section-space-*) block padding. Check: header `padding-block` ≤ `--space-l` unless declared hero-header. |

## E. Typography (component-level)

| # | ACSS rule | Machinery rule | Status | Proposed rule + measurable check |
|---|---|---|---|---|
| E1 | Semantic level ≠ visual size (`h2` + `var(--h4)`) | E.2 `query` minimized rank | MATCH | — |
| E2 | H5/H6 fixed minimums — scale never drops a heading below readable | No explicit floor | MISSING | Rule: rendered heading sizes never below body text size; `--h6` ≥ `--text-m`. Check: computed heading font-size ≥ body size. |
| E3 | Bridge sizes `h{a}-to-h{b}`, `text-{a}-to-{b}` for aggressive shrink | knobs steps | MISSING (optional) | As A15. |
| E4 | `.text--{size}` classes apply to containers *or* elements | T ranks via tokens | MATCH | — |
| E5 | text-wrap `balance` ignored >4 lines — headings only, never body | T.6 body=pretty, headings=balance | MATCH | — |

## F. Forms

| # | ACSS rule | Machinery rule | Status | Proposed rule + measurable check |
|---|---|---|---|---|
| F1 | One shared structural/spacing config for all forms site-wide | S.9 form states (label/required/helper/error) | PARTIAL | Rule: all inputs share `--input-*` tokens (padding, radius, border, bg); no per-form bespoke field styling. Check: input padding/radius resolve to tokens. |
| F2 | Form colors follow `color-scheme`/`light-dark()` automatically; `.form--light|dark` overrides | C.5 | MATCH | — |
| F3 | Floating-label background must match the surface behind the field | Not covered | MISSING (minor) | Rule: floating labels carry the surface color behind them — label bg = field's parent surface. Check: floated label has explicit bg matching surface token. |

## G. Icons

| # | ACSS rule | Machinery rule | Status | Proposed rule + measurable check |
|---|---|---|---|---|
| G1 | `data-icon` opts an SVG into the icon system | I.* inline SVG from one library | PARTIAL | Adopt `data-icon` as the marker our card/anatomy checks look for (B3). |
| G2 | Boxed vs plain: icon *color* must not change when switching box style | Not covered | MISSING | Rule: boxed icon styling wraps color-neutral chrome; toggling boxed/plain never changes the glyph color token. Check: icon color token identical across variants. |
| G3 | Icon sizes t-shirt {s,m,l} expandable; `.icon--{size}` on icon or parent | I.3 closed {16,20,24,32,48} | DIFFERS — our fixed set is more gateable; ACSS size names equivalent. **Keep ours.** | — |
| G4 | Icon lists via `data-icon-list` with list gap + optical offsets | I.4 gap scale {4,8,12,16} | MATCH | — |
| G5 | Theme Light/Dark named by icon color | I.7 tokens + C.5 | MATCH | — |

## H. Surfaces, borders, shadows

| # | ACSS rule | Machinery rule | Status | Proposed rule + measurable check |
|---|---|---|---|---|
| H1 | `var(--border)` = one global border shorthand (size/style/light-or-dark color) | S.5 widths {0,1,2px}, neutral at rest | MATCH | — |
| H2 | One global `--radius` (plus concentric math) | S.2 six-token scale per personality | DIFFERS — ours richer (6 tokens) but same "no literals" contract. **Keep ours.** | — |
| H3 | `--divider` composite + `--divider-gap`; `?divider-all` spaces children with margins | G.4 hairline rule | PARTIAL | Rule: divider = `--divider-*` tokens (width, color, gap); a divider between siblings uses margin spacing matching the gap token. Check: divider borders + spacing come from tokens. |
| H4 | 5 shadow slots, layered compound shadows; `--card-shadow` binds a slot | S.7 E0–E4 scale + coupling | MATCH | — |
| H5 | Surfaces = reusable bg bundles (color/image/gradient/overlay/color-relationship) | `surface` field in section rows + V.* media | MATCH (ours declarative; ACSS implementation) | Rule: a surface may carry overlay (color + opacity token) — already T.7's 40–60% tint. |
| H6 | Inverted radius (data attributes, `--bg` token, ≤2 corners, solid colors only) | Not covered | MISSING (niche) | Optional: only implement when a canon ref uses it; rule text: inverted corners via the data-attr/​pseudo-element technique, `--bg` defined at parent, never more than 2 corners per box. |

## I. Accessibility

| # | ACSS rule | Machinery rule | Status | Proposed rule + measurable check |
|---|---|---|---|---|
| I1 | Clickable parent (pseudo hit area) + focus parent (`:focus-within` ring on card) | — | ★ MISSING | See B8 (card-scoped rule). Global check: interactive groups have exactly one real focusable; parent ring via `:focus-within`. |
| I2 | Global focus style tokenized (`--focus-color`, style, width, offset); local override per context | I.7 2px ring + offset | PARTIAL | See A26 — add `--focus-color` + context remap check. |
| I3 | `.hidden-accessible` / sr-only text; builder shows indicator | — | MISSING | See A25. |
| I4 | Reduced motion default-on | M.6 | MATCH | — |
| I5 | External link SR cue + visual indicator | — | MISSING | See A27. |
| I6 | Container queries: card wrappers get `container-type: inline-size` for component-level responsiveness | R.1 viewport breakpoints only | MISSING (optional) | Rule: card/grid components MAY declare `container-type: inline-size` on their wrapper and respond to container width, not viewport. Check: none — capability only. |

## J. Conventions

| # | ACSS rule | Machinery rule | Status | Proposed rule + measurable check |
|---|---|---|---|---|
| J1 | BEM block`__`elem`--`mod everywhere; framework recognizes `__media/__avatar/__heading` | — | ★ MISSING | See A18 + B3. |
| J2 | "Variables are king": custom classes + tokens; utilities sparingly | P./SB components layer | MATCH | — |
| J3 | T-shirt sizes single convention | G.1/G.3/S.2 closed sets | MATCH | — |
| J4 | One gutter value site-wide (reference token) | R.2 ramp (one ramp, values vary by bp — consistent with intent) | MATCH | — |
| J5 | Zero-specificity automatic defaults, overridable | SB.2 shell owns; contracts whitelist | MATCH | — |

## Verdict summary

**Adopt (★ MISSING/DIFFERS, high value):**
1. B8/I1 clickable-parent + focus-parent pattern for cards (accessibility bug
   our machinery doesn't catch).
2. B1–B3 unified `--card-*` token surface + `__media/__avatar/__heading`/
   `data-icon` anatomy names.
3. A11 smart spacing: margin reset + owl-selector flow rule; gap for boxes.
4. A4 text-wrap as tokens (values already match: pretty body / balance
   headings).
5. A20 automatic color relationships: bg context → foreground token set.
6. C1 button em-padding + C2 outline/solid height parity.
7. A27 external-link indication; A25 sr-only/a11y-name lint; I3.
8. D7 alternating splits only ≥ desktop; D11 no `min-height` sections;
   E2 heading floor ≥ body size.
9. A22 transparency via `color-mix`/relative color only; F3 floating-label
   surface match; G2 boxed-icon color neutrality; A29 object-fit defaults.

**Deliberate differences (keep ours):** closed G.1 px scale vs fluid
spacing (gating beats tweeners; ACSS clamps live in BASE.ACSS tiers),
7-stop closed breakpoints vs breakpoint-free, class-based dark mode vs
`light-dark()`, 1440 vs 1280 content width, six-token radius scale vs
single `--radius`, 6-role color map vs brand-name palette.

**Ours is strictly better (keep, note to operator):** S.4 concentric
radius incl. collapse cases, SB.2 shell-owns-spacing vs zero-specificity
classes, contract-allowed classes vs utility philosophy, canon padding
bands G.6/G.7.
