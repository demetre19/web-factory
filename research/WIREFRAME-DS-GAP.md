# WIREFRAME-DS-GAP — sample "Wireframes Design System" PDF vs Web Factory wireframe machinery

Source: `~/Documents/Wireframes Design System.pdf` (8 pages, viewed as
rasterised pages — text layer is incomplete).
Compared against: `templates/wireframe-cards/index.html` + `README.md`,
`docs/machinery/SECTION-CATALOG.md`, `docs/machinery/DESIGN-INTAKE.md`
(Phase B wireframe rules).

**Framing caveat:** despite the filename, the PDF is **not a wireframe
component library**. It is a *design-system documentation starter
template* — eight section skeletons an author fills in (principles,
foundations, color, type, spacing, icons, buttons & forms). It has no
X-boxes, no copy bars, no grid overlays, no annotation callouts, no
section-level page compositions. The comparison below is therefore
between "what a DS doc template covers" and "what our Phase B wireframe
cards cover" — most gaps are category differences, not missing
primitives. This matters: importing DS-documentation concerns into the
wireframe card would violate its core rule (everything undecided except
structure + type hierarchy).

## 1. Inventory of the PDF

| Page | Section | Contents |
|---|---|---|
| 1 | Overview | Purpose; what the system covers; why it matters; who should use it; how to use it (foundations → components → screens); platforms (mobile/tablet/web); design approach; Version 1.0; Last updated (March 2026); Ownership |
| 2 | Design Principles | 4 named principles with descriptive blurbs; 4 annotation cards at bottom: "Do" example · "Don't" example · "When to use" · "When not to use" |
| 3 | Brand Foundations | One-page spec-sheet listing: Fonts & Typography (typefaces, scale ratios, weights); Colors (neutrals, accent scales, tint steps); Shadows & Elevation (e1–e5 token list); Icons (sizes, stroke, corner style); Spacing & Layout (scale stops, grid columns); Breakpoints & Responsive |
| 4 | Color System | Roles: Primary / Secondary / Accent (swatch circle + name + hex); Neutrals (10-step ramp); Text colors (primary/secondary/tertiary/inverse) |
| 5 | Typography | Primary typeface card (family/weights/use) + Secondary typeface card; Type scale table: Name · Size · Weight · Line height · Usage, rows Display → Caption |
| 6 | Spacing & Layout | 4px base grid; spacing scale 4→96; grid: 4-col mobile / 8-col tablet / 12-col desktop; layout guidance cards: spacing consistency · content width · visual hierarchy · responsive spacing |
| 7 | Icons & Imagery | 4 icon slots with names; guidance cards: icon principles (simple/clear/consistent/recognizable) · style · usage · sizes · alignment · color usage |
| 8 | Buttons & Forms | Primary + Secondary buttons across 5 state columns (Default/Hover/Active/Focus/Disabled) + spec list (font/size/height/radius/padding); Input field; Dropdown; Checkbox; Switch; Radio — each with a spec list |

**Conventions the PDF models:** per-component *spec lists* (the
Font-Family/Font-Weight/… property stubs); *state matrices* (one
component × N states in a row); *role-grouped color swatches* with hex;
*guidance cards* (Do / Don't / When to use / When not); a *type-scale
table* with usage column; versioning + ownership metadata on the cover;
explicit platform coverage statement.

**What it does NOT contain** (expected wireframe items, absent):
annotations/callouts on layouts, grid overlay rendering, page-level
section compositions, nav patterns, disclosure/fold conventions,
media-placeholder idiom, interactive states of a *frame* (viewport
switch), multi-direction comparison.

## 2. Gap table — PDF item vs our machinery

| PDF item | We have? | Where | Worth adding? | Why |
|---|---|---|---|---|
| Doc cover: purpose/version/ownership | Partial | README + header comment carry purpose & rules; no version/owner fields | No | Template is vendored-by-copy; version churn would rot. Rules already documented. |
| Design principles section | Partial — different home | Rules 1–5 in `index.html` header; DESIGN-INTAKE Phase B prose | No | Our principles live where they're enforced (file header), better than a separate page. |
| Foundations spec-sheet (fonts/colors/shadows/spacing/breakpoints on one page) | Partial | G.1 stops + grey ramp vars + 1280/768/360 frames exist, but scattered | Maybe (docs) | A one-line "foundations" recap already exists in header; shadows/elevation are banned by rule 1 anyway. Low value. |
| Color role swatches (primary/secondary/accent + neutral ramp + text colors) | No — deliberate | Grey ramp only (rule 1); C.1 role map deferred to L3 `system.html` | **No** | Colour on a card is a banned defect (neutral-placeholders rule). Belongs at L3, not Phase B. |
| Type-scale table (name/size/weight/lh/usage) | Yes — as mechanism | `--claim/--h2/--fold` per `#dN`; type ranks documented in header | Partial | We carry the scale *as variables* per direction — better than a static table. Could add 1-line usage note (done in header). |
| Spacing scale + base grid | Yes | G.1 stops 4–96 enforced by rule 5; `--py/--pyh` per direction | No | Already canonical. |
| Grid columns per breakpoint (4/8/12) | Partial | Viewport frames at 360/768/1280 via `@container`; no explicit column-count annotation | Maybe | A `.tag` annotation stating grid columns per breakpoint could help operator read the layout. Cheap, optional. |
| Button state matrix (Default/Hover/Active/Focus/Disabled) | No | `.btn`/`.btn.sm` single static state | **No** | States are undecided treatment at Phase B; a state row belongs at L3 `system.html`. Wireframe must not imply decided behavior detail. |
| Primary vs Secondary button | Partial | `.btn` (outline) + `.btn.sm` (nav CTA); no secondary/text-button variant | **Yes — small** | A `.btn.ghost` (borderless or lighter-weight secondary CTA) is a real structural choice cards must show ("which CTAs exist and at what rank"). Cheap: one class. |
| Form fields beyond text input: dropdown/select, checkbox, radio, switch | **No** | `.wform`/`.fld` covers text + textarea only | **Yes** | Service-site quote forms genuinely need select (service type), checkbox (consent, add-ons), radio (property size). Highest-value primitive gap. Add `.fld.sel` (chevron box), `.opt` (radio/checkbox row). Switch = no (app idiom, not marketing site). |
| Icon slots + icon-size guidance | Partial | `.xicon` 28px X-box icon slot in steps only | Partial | `.xicon` exists but is only used in `.steps`. Worth documenting it as the generic "icon slot" primitive (already is — header lists it). Icon size variants (small/standard/large) could be one modifier. Low priority. |
| Per-component spec list (Font-Family/…/Padding stubs) | No | Per-design vars (`--r`, `--py`, `--claim`, `--h2`, `--fold`) | No | Our vars *are* the spec list, executable rather than prose. |
| Do/Don't guidance cards | No | Refuse/defect language in README + header rules | No | Same content, better placement. |
| States beyond buttons: disclosure open/closed, nav drawer open | Yes — better | `.fold` closed ▸; `.drawer.on` toggle works live; burger behavior real | n/a | We actually model interactive state (drawer toggles); PDF only draws static states. |
| Platforms statement (mobile/tablet/web) | Yes — better | Live viewport switch renders real 1280/768/360, `@container` collapse | n/a | We demonstrate, they describe. |
| Annotations | Yes | `.tag` per section ("Hero — split-media 3:4", "Macro Q&A — 3-up cards") | Could strengthen | The PDF's "When to use / when not" guidance cards suggest adding *composition-selection guidance* — which is SECTION-CATALOG's job (already does it via `Allowed for speech_act` column). |
| Section/page compositions | **No — category mismatch** | SECTION-CATALOG §2 is our equivalent (21 compositions) | n/a | PDF has none; nothing to import. |
| Elevation/shadow tokens (e1–e5) | No — deliberate | Banned by rule 1 | No | Decoration, not structure. |

## 3. Ranked additions worth making

Only three changes survive the "structure + type rank is all a card
carries" filter:

1. **Form-control primitives** (template `index.html` — biggest real
   gap). Add to `.wform`: `.fld.sel` — outlined 44px field with a `▾`
   chevron (select/dropdown); `.opt` — radio/checkbox row: small
   outlined square/circle + real noun label, `.opt.ck` square vs round;
   `.opt.on` filled pip (checked state, one row suffices to show
   "checked exists"). These are structural — a quote form with "service
   type" select and "add-ons" checkboxes *looks* different from a pure
   text form, which is exactly the decision Phase B asks. Cost ~20
   lines CSS. (Skip `.switch` — app idiom, not service-site marketing.)
2. **Secondary CTA rank** (`.btn.ghost` — borderless/muted-weight
   variant). Cards currently express "CTA or no CTA" but not "two CTAs
   at different ranks" — a real composition choice (e.g. "Request a
   quote" + "See scope"). One class; pairs naturally in hero/endact.
3. **Grid/breakpoint annotation on `.tag`** (cheapest: extend existing
   `.tag` text to name the collapse, e.g. "Process — cards · 4-up ≥900"
   — the PDF's 4/8/12 grid statement made legible as an annotation
   convention). Zero new primitives; a convention note in the header
   comment + DESIGN-INTAKE mention. This makes the viewport switch
   legible to an operator comparing collapse behavior.

Explicitly **rejected** (violates Phase B fidelity or is already
covered elsewhere): color/elevation/icon-style tokens (L3's job, rule
1), button state matrices and focus rings (decided behavior, L3),
version/ownership boilerplate, Do/Don't pages (README + refuse
language already), spec-list prose (executable vars instead).

## 4. Where each addition lands

| Addition | File | Mechanism |
|---|---|---|
| `.fld.sel`, `.opt`/`.opt.ck`/`.opt.on` | `templates/wireframe-cards/index.html` (style block + header primitive list + README) | New CSS ~20 lines; one `.fld.sel` + two `.opt` rows added to the d3 end-form as the worked example |
| `.btn.ghost` | same | One class; optionally shown beside `.btn` in one hero to demonstrate CTA rank |
| Collapse annotation convention | header comment of `index.html` + `README.md` + DESIGN-INTAKE Phase B paragraph | Text convention only |
| Nothing in SECTION-CATALOG §2 | — | The PDF contributes no new compositions; the closed set stands |

No SECTION-CATALOG changes recommended: the PDF is a component-doc
template, not a composition library — importing anything into §2 would
dilute the closed set.
