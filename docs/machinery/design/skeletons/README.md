---
id: skeletons-index
type: index
links:
  index: design-index
  see_also: [section-catalog, rules-SKL]
  contains: [skeleton-hyperui, skeleton-shadcn]
---

# SKELETONS — structure-only markup sources

Harvested component markup that builders may **adapt for structure** —
semantic elements, a11y attributes, responsive grid/flex patterns,
interaction scaffolding — and nothing else.

Current sources:

- **HyperUI** (`templates/skeletons/hyperui/`), harvested 2026-11-19
  from `github.com/markmead/hyperui` @ `main` (https://hyperui.dev).
  License: **MIT**, © Mark Mead.
- **shadcn/ui** (`templates/skeletons/shadcn/`), harvested 2026-11-19
  from `github.com/shadcn-ui/ui` @ `main`, `new-york-v4` registry
  (Radix base; https://ui.shadcn.com). License: **MIT**, © shadcn.
  **Two tiers in one source:** the markup is a structure-only skeleton
  like everything else here, but shadcn's *component-level* visual
  system is **operator-endorsed** as a component-tier reference —
  see §"shadcn component tier" below. Section/page canon is unchanged.

Attribution is retained as a comment header inside every skeleton file
and in each `.json`/`spec.json` metadata file; full license texts are
vendored next to each source root. Do not strip them.

- **Structure-only.** Keep: element choice (`details`/`summary`,
  `nav`/`ul`, `dl`, `table`, `form`/`fieldset`), heading levels, ARIA
  attributes, `sr-only` labels, `aria-hidden` on decorative SVGs, focus
  order, and the *shape* of the responsive pattern (mobile-first,
  single-column → grid at `md`/`lg`).
- **Every visual value is replaced.** Colour, spacing, typography,
  radius, shadow, border weights — every Tailwind utility that carries
  a visual value must be swapped for the DNA/ACSS token or the
  component-profile value. Raw `bg-indigo-600`, `p-4`, `rounded-lg`,
  `shadow-md`, `text-gray-900` in shipped markup = a defect of the same
  class as a freehand hex.
- **Never a canon reference.** Skeletons may not be cited as canon for
  any visual choice. Canon = operator-supplied sites > endorsed refs >
  Mobbin (LAW.REF). A skeleton supports a *structural* decision only
  ("an FAQ is `details`/`summary` rows", "a logo wall is a wrap row of
  marks"), never a look decision.
- **Composition still comes from the catalog.** A skeleton never
  invents or overrides `composition`; the section's composition is
  selected from `docs/machinery/SECTION-CATALOG.md` first, then a
  skeleton may supply its markup shape. A `cards-n` section built from
  the `pricing` skeleton family is still `composition: cards-n`.

## How a builder uses one

1. Section plan (`DESIGN-PLAN.md`) fixes `speech_act` + `composition` +
   `category`. Look up the family in the index below whose
   `wf_composition` / `wf_profile_type` matches.
2. Copy the skeleton markup. Keep the structure verbatim unless the
   profile (`docs/machinery/design/components/<profile>.md`) says
   otherwise.
3. Strip every visual utility; substitute ACSS classes / DNA tokens /
   profile values. Structural utilities that carry no visual value
   (grid tracks, order, `sr-only`, `group` hooks) may survive, but the
   review check treats any colour/spacing/type/radius/shadow utility
   that bypasses tokens as a violation.
4. Dark mode: where `dark_mode.supported` is true, the `.dark.html`
   file shows which attributes the original swaps — use it as a map of
   which surfaces need a dark-token pairing (never copy the values).
5. `templates/` families are whole pages; harvest them per-section
   (`header`, hero, stats, `footer` blocks) rather than as one block.

## Layout

```
templates/skeletons/hyperui/<collection>/<family>/<NN>-<variant-slug>.html
templates/skeletons/hyperui/<collection>/<family>/<NN>-<variant-slug>.dark.html   # when supported
templates/skeletons/hyperui/<collection>/<family>/<NN>-<variant-slug>.json       # metadata
templates/skeletons/hyperui/_harvest-stats.json                                  # counts
```

Collections: `marketing` (site sections), `application` (UI primitives),
`neobrutalism` (application equivalents under a distinct visual
treatment — harvest structure only), `templates` (full pages).

```
templates/skeletons/shadcn/components/<name>/<name>.tsx        # verbatim registry source (React/Radix)
templates/skeletons/shadcn/components/<name>/skeleton.html     # Astro/HTML-portable structure
templates/skeletons/shadcn/components/<name>/spec.json         # metadata + visual spec + a11y contract
templates/skeletons/shadcn/blocks/<name>/src/**                # full-page block source (React)
templates/skeletons/shadcn/blocks/<name>/spec.json
templates/skeletons/shadcn/tokens/{theme-light,theme-dark,theme-map}.css, tokens.json
templates/skeletons/shadcn/lib/behaviors.js                    # vanilla-JS Radix-contract behaviours
templates/skeletons/shadcn/_harvest-stats.json
```

### shadcn component tier (operator-endorsed)

shadcn skeleton files keep the registry's own class strings — which
are themselves **CSS-variable tokens** (`bg-primary`, `ring/50`,
`text-muted-foreground`, `h-9`, `rounded-md` → `--radius` ladder).
The operator endorses shadcn's component visuals, so:

- **`spec.json` is the endorsed component-tier reference** for that
  component type — cva variant tables, part classes, heights/paddings/
  font sizes, the `focus-visible:ring-[3px] ring-ring/50` focus spec,
  `aria-invalid` treatment. When a DNA component profile leaves a
  component-level value open, the shadcn spec is a legitimate source;
  DNA/profile values still win where they exist.
- **Tokens** (`tokens/tokens.json`, `theme-light.css`, `theme-dark.css`,
  `theme-map.css`): the `--background/--foreground/--primary/…` role
  model + radius ladder + utility→var mapping, as machine-readable
  reference for mapping DNA vars 1:1 (ours is a superset surface).
- **Not section/page canon.** A shadcn block is React source kept for
  structure/composition reference only (`blocks/<name>/src/`); its
  layout rhythm is not endorsed at page level. Section canon stays
  operator > endorsed sites > Mobbin.
- **Interaction**: interactive components list a WAI-ARIA APG/Radix
  keyboard contract in `spec.json.behavior.contract`; the matching
  vanilla JS ships in `lib/behaviors.js` (drop-in, `data-slot` keyed).
  Astro ports: use `skeleton.html` markup + the one script include.

### Metadata fields (per variant `.json`)

### Metadata fields (per shadcn `spec.json`)

`id`, `name`, `collection`, `source_url`, `source_repo_path`,
`license{spdx,copyright,url}`, `tier{structure,visual}` (skeleton +
component-endorsed), `wf_category`, `wf_composition`,
`wf_profile_type`, `component_type`, `exports`, `parts` (data-slot
names), `radix_primitives`, `imports`, `requires_js`,
`behavior{implemented_in,contract,radix_docs}` (APG pattern, key map,
ARIA notes), `variants` (cva tables verbatim), `tokens_used` (CSS-var
utility classes), `dark_mode{supported,mechanism}`,
`a11y{semantic_elements,aria_in_skeleton,keyboard_contract,
sr_only_labels,focus_ring_spec}`. Blocks add `ui_components_used` +
`files`.

`id`, `family`, `variant{index,title}`, `collection`, `source_url`,
`source_repo_path`, `license{spdx,copyright,url}`, `wf_category`
(vendored category slug), `wf_composition` (SECTION-CATALOG row or
`null` for primitives), `wf_profile_type` (component profile doc or
`null`), `dark_mode{supported,file,dark_analysis}`,
`responsive{breakpoint_classes,container_queries,mobile_first,
preview_widths_checked_on_site}` (site previews Mobile 340px / SM 640px
/ MD 768px / LG 1024px / Full 100% — all components are checkable at
all five widths and ship with an LTR↔RTL direction toggle),
`a11y{semantic_elements,aria_attributes,roles,img_alt_present,
focus_visible_styles,native_keyboard_controls,sr_only_labels,
inline_script,rtl_toggle_available_on_site,axe_tested_upstream}` —
upstream runs axe-core 4.14 via Playwright (`pnpm test:a11y`); the
site itself shows no per-component WCAG badge, so these fields are the
audit. `img_alt_present: null` = no `<img>` in the variant.

## Index — skeleton family → composition → profile type

`n` = light variants harvested (`.dark.html` twins not counted).

### marketing — `templates/skeletons/hyperui/marketing/`

| family | n | wf_category | wf_composition | wf_profile_type |
|---|---|---|---|---|
| announcements | 6 | banner | — | — |
| banners | 3 | banner | full-bleed | full-bleed |
| blog-cards | 7 | blog-section | cards-n | cards-n |
| buttons | 5 | ui-elements | — | — |
| cards | 9 | grids-and-cards | cards-n | cards-n |
| carts | 3 | cart | — | — |
| contact-forms | 5 | contact | form-panel | form-panel |
| ctas | 4 | call-to-action | full-bleed | full-bleed |
| empty-content | 5 | ui-elements | — | — |
| faqs | 3 | content | faq | faq |
| feature-grids | 4 | feature | cards-n | cards-n |
| footers | 12 | footer | — | footer-bar |
| headers | 4 | headers | — | nav-bar |
| logo-clouds | 4 | logo-sections | logo-wall | logo-wall |
| newsletter-signup | 2 | newsletter | capture-form | capture-form |
| polls | 3 | ui-elements | — | — |
| pricing | 4 | pricing | comparison | comparison |
| product-cards | 8 | product-archive | cards-n | cards-n |
| product-collections | 4 | product-archive | media-gallery | media-gallery |
| sections | 4 | content | split-media | split-media |
| team-sections | 3 | teams | cards-n | cards-n |
| testimonials | 3 | testimonials | quote-grid | quote-grid |

### application — `templates/skeletons/hyperui/application/`

| family | n | wf_category | wf_composition | wf_profile_type |
|---|---|---|---|---|
| accordions | 5 | ui-elements | faq | faq |
| avatars | 4 | ui-elements | — | — |
| badges | 5 | ui-elements | — | — |
| breadcrumbs | 5 | ui-elements | — | — |
| button-groups | 5 | ui-elements | — | — |
| charts | 11 | ui-elements | — | — |
| checkboxes | 3 | ui-elements | form-panel | form-panel |
| code-blocks | 3 | ui-elements | — | — |
| details-list | 4 | ui-elements | editorial | editorial |
| dividers | 6 | ui-elements | — | — |
| dropdown | 3 | ui-elements | — | — |
| empty-states | 5 | ui-elements | badge-center | badge-center |
| file-uploaders | 2 | ui-elements | form-panel | form-panel |
| filters | 2 | ui-elements | — | — |
| grids | 10 | grids-and-cards | cards-n | cards-n |
| inputs | 4 | ui-elements | form-panel | form-panel |
| loaders | 7 | ui-elements | — | — |
| media | 8 | ui-elements | media-gallery | media-gallery |
| modals | 6 | ui-elements | — | — |
| pagination | 3 | ui-elements | — | — |
| progress-bars | 4 | ui-elements | — | — |
| quantity-inputs | 4 | ui-elements | form-panel | form-panel |
| radio-groups | 3 | ui-elements | form-panel | form-panel |
| range-inputs | 5 | ui-elements | form-panel | form-panel |
| selects | 3 | ui-elements | form-panel | form-panel |
| side-menu | 2 | ui-elements | — | nav-bar |
| skip-links | 3 | ui-elements | — | — |
| stats | 6 | counter | stat-band | stat-band |
| steps | 5 | how-it-works | sequence | sequence |
| tables | 5 | table | comparison | comparison |
| tabs | 5 | ui-elements | — | — |
| textareas | 3 | ui-elements | form-panel | form-panel |
| timelines | 3 | timeline | sequence | sequence |
| toasts | 6 | ui-elements | — | — |
| toggles | 4 | ui-elements | — | — |
| vertical-menu | 8 | ui-elements | — | nav-bar |

### neobrutalism — `templates/skeletons/hyperui/neobrutalism/`

Same structure as `application/` equivalents under a neobrutalist
treatment; the treatment is a visual value and must be dropped.

| family | n | wf_category | wf_composition | wf_profile_type |
|---|---|---|---|---|
| accordions | 3 | ui-elements | faq | faq |
| alerts | 3 | ui-elements | — | — |
| badges | 3 | ui-elements | — | — |
| buttons | 5 | ui-elements | — | — |
| cards | 4 | grids-and-cards | cards-n | cards-n |
| checkboxes | 3 | ui-elements | form-panel | form-panel |
| inputs | 3 | ui-elements | form-panel | form-panel |
| progress-bars | 3 | ui-elements | — | — |
| selects | 3 | ui-elements | form-panel | form-panel |
| tabs | 4 | ui-elements | — | — |
| textareas | 3 | ui-elements | form-panel | form-panel |

### templates — `templates/skeletons/hyperui/templates/`

Whole pages; `wf_category` marks the dominant region. Harvest
per-section, not whole-page.

| family | n | wf_category | wf_composition | wf_profile_type |
|---|---|---|---|---|
| analytics-dashboard | 5 | ui-elements | — | — |
| developer-tool | 1 | hero | — | — |
| portfolio | 2 | portfolio-section | — | — |
| pricing-page | 1 | pricing | — | — |
| saas-landing-page | 1 | hero | — | — |
| storefront | 2 | product-archive | — | — |
| support-inbox | 2 | ui-elements | — | — |

### shadcn components — `templates/skeletons/shadcn/components/`

`js` = `requires_js` (APG contract in spec; vanilla impl in
`lib/behaviors.js`). All 61 are component-tier endorsed visual
references in addition to structure skeletons.

| component | wf_category | wf_composition | wf_profile_type | js |
|---|---|---|---|---|
| accordion | ui-elements | faq | faq | js |
| alert-dialog | ui-elements | — | — | js |
| alert | ui-elements | — | — | — |
| aspect-ratio | ui-elements | — | — | — |
| attachment | ui-elements | — | — | — |
| avatar | ui-elements | — | — | — |
| badge | ui-elements | badge-center | badge-center | — |
| breadcrumb | ui-elements | — | — | — |
| bubble | ui-elements | — | — | — |
| button-group | ui-elements | — | — | — |
| button | ui-elements | — | — | — |
| calendar | ui-elements | — | — | js |
| card | ui-elements | cards-n | cards-n | — |
| carousel | ui-elements | — | — | js |
| chart | ui-elements | — | — | js |
| checkbox | ui-elements | form-panel | form-panel | js |
| collapsible | ui-elements | faq | faq | js |
| combobox | ui-elements | form-panel | form-panel | js |
| command | ui-elements | — | — | js |
| context-menu | ui-elements | — | — | js |
| dialog | ui-elements | — | — | js |
| direction | ui-elements | — | — | js |
| drawer | ui-elements | — | — | js |
| dropdown-menu | ui-elements | — | — | js |
| empty | ui-elements | badge-center | badge-center | — |
| field | ui-elements | form-panel | form-panel | — |
| form | ui-elements | form-panel | form-panel | js |
| hover-card | ui-elements | — | — | js |
| input-group | ui-elements | form-panel | form-panel | — |
| input-otp | ui-elements | form-panel | form-panel | js |
| input | ui-elements | form-panel | form-panel | — |
| item | ui-elements | — | — | — |
| kbd | ui-elements | — | — | — |
| label | ui-elements | form-panel | form-panel | — |
| marker | ui-elements | — | — | — |
| menubar | ui-elements | — | nav-bar | js |
| message-scroller | ui-elements | — | — | js |
| message | ui-elements | — | — | — |
| native-select | ui-elements | form-panel | form-panel | — |
| navigation-menu | ui-elements | — | nav-bar | js |
| pagination | ui-elements | — | — | — |
| popover | ui-elements | — | — | js |
| progress | ui-elements | — | — | js |
| radio-group | ui-elements | form-panel | form-panel | js |
| resizable | ui-elements | — | — | js |
| scroll-area | ui-elements | — | — | js |
| select | ui-elements | form-panel | form-panel | js |
| separator | ui-elements | — | — | — |
| sheet | ui-elements | — | — | js |
| sidebar | ui-elements | — | nav-bar | js |
| skeleton | ui-elements | — | — | — |
| slider | ui-elements | form-panel | form-panel | js |
| sonner | ui-elements | — | — | js |
| spinner | ui-elements | — | — | — |
| switch | ui-elements | form-panel | form-panel | js |
| table | table | comparison | comparison | — |
| tabs | ui-elements | — | — | js |
| textarea | ui-elements | form-panel | form-panel | — |
| toggle-group | ui-elements | — | — | js |
| toggle | ui-elements | — | — | js |
| tooltip | ui-elements | — | — | js |

### shadcn blocks — `templates/skeletons/shadcn/blocks/`

Full-page React sources under `blocks/<name>/src/`; component-tier
endorsement applies to their component parts only, not page layout.

| block | files | wf_category | wf_profile_type |
|---|---|---|---|
| dashboard-01 | 11 | ui-elements | — |
| login-01..05 | 2 ea | login | — |
| signup-01..05 | 2 ea | login | — |
| sidebar-01..16 | 2–11 ea | ui-elements | nav-bar |

