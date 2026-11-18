---
id: rules-P
type: rules
links:
  used_in: [w0, w3, w5, w6, w7]
---

## P. Pipeline fabrication — how a design is *built*, not just chosen

The eleven primitive rulebooks (T C L G S I V M R W E) say what a good
design *is*. This section says how the factory *proves* it: the shared
source every artifact is built from, the contract tags that make the
wireframe mechanically comparable to the page, and the gate mechanics
that make a stage real. Every rule here is checkable — the
`tools/design-gate/` scripts enforce them.

### P.1 Golden rule — Astro + Tailwind, from scaffold to ship

ASTRO is the goal; TAILWIND is non-negotiable. Every design artifact
from W3 on lives inside ONE Astro + Tailwind project per
site/proposal, instantiated from `templates/astro/` at W0 —
`tailwind.config` generated from `TOKENS.json`, `src/styles/global.css`
with `@tailwind` + `@layer components`, components as `.astro` files in
`src/components/` (one per composition), the system tile as
`src/pages/system.astro`, each page as `src/pages/<slug>.astro`
assembled ONLY from those components. Previews are `astro build`
output (`dist/`) opened in the browser — never standalone hand-rolled
HTML. The only plain-HTML artifact in the pipeline is the W2 wireframe
card set, which predates the system by design.

### P.2 Shared source — one stylesheet, never two

Tile and page MUST NOT carry separately hand-written stylesheets (the
swe-2 defect: the tile showed card radius-lg, plus/x disclosure rows,
Lucide 2px icons; the page showed none of it). There is exactly one
source of style truth:

- `tailwind.config` — generated from `TOKENS.json` (colors, spacing,
  fontSize clamp() ramp, borderRadius, breakpoints).
- `src/styles/global.css` — `@tailwind` directives + `@layer
  components` holding every component class.
- `src/components/*.astro` — markup bound to config tokens and layer
  classes only.

Both `src/pages/system.astro` (W3 tile) and `src/pages/<slug>.astro`
(W6 page) consume these files. A `<style>` block inside a page or
component beyond the shared layer is a defect; a class on the page
that is neither a layer-defined component class nor a config-derived
Tailwind utility is a defect.

### P.3 Wireframe contract tags — `data-*` on every section

Every `<section>` in a wireframe card (`templates/wireframe-cards/`)
carries four contract attributes:

- `data-sec` — the section slug (`hero`, `macro-qa`, `proof`,
  `scope-fold`, `process`, `micro-qa`, `end-act`, `nav`, `footer`)
- `data-comp` — the composition it draws (∈ SECTION-CATALOG §2, or a
  declared `nav-bar`/`footer-bar` chrome row)
- `data-ratio` — the media ratio it commits to (`none`, `21:9`, `16:9`,
  `4:3`, `3:4`, `1:1` — ∈ V.3)
- `data-disclosure` — `open | collapsed | tabbed`

The same four attributes are REQUIRED on every section of every built
page. They are the contract the gates diff: wireframe `data-*` = plan
row = page `data-*`. Untagged sections cannot be gated — and an
ungated section is how the swe-2 run shipped a page that ignored its
own wireframe.

### P.4 Wireframe lock — the chosen card is the section authority

Once the operator picks a wireframe card (W2 approval), its sections
copy into `pages.<slug>.sections[]` **1:1** — order, composition,
media ratio, disclosure, stack. Every plan row carries `wf_ref`
(`<cards-file>#<design-id>:<data-sec>`). A plan row with no matching
wireframe section is an invention; a wireframe section with no plan
row is a drop. Deviation is legal only as a logged `decisions[]`
entry that names the wireframe section it replaces. The W4 gate is the
mechanical diff; "the model decided a different layout" is exactly the
failure this rule exists to make impossible.

Where the STUB heading vector must share a wireframe section (six
macro Q&A rows drawn as one 3-up card block), the plan row carries a
`vector:` list of heading+fs pairs — every STUB heading appears
exactly once across rows, in wireframe-section order. Vector rows
never invent or drop headings (E.1).

### P.5 Tailwind theme — tokens compile, never improvise

`TOKENS.json` compiles into the Tailwind theme: `colors` from the C.1
role map, `spacing` from the G.1 scale, `fontSize` from the fluid
clamp() ramp, `borderRadius` from the S.2 personality row,
`screens` from the R.1 closed set. A hex or px literal outside the
config / `global.css` `:root` token block is a refuse — same class as
a literal hex outside TOKENS. Touch targets (R.6 ≥44px) bind a named
token (`min-h-tap`), never `min-h-[44px]` sprinkled inline.

### P.6 Component catalogue — the tile is the inventory

Every distinct composition in the locked wireframe is built once as
`src/components/<name>.astro` (W5). `src/pages/system.astro` MUST
instantiate every component — the tile is the catalogue the page
orders from. A page using a component absent from the tile, or a tile
missing a component the page uses, fails W6.

### P.7 Page assembly — order from the catalogue only

`src/pages/<slug>.astro` assembles W5 components in plan-row order.
No new styles, no inline utility invention, no structural markup the
components don't already own. Chrome (nav/footer) is components too.
Every rendered `<section>` carries the plan row's `data-*` values.

### P.8 Gate mechanics — evidence or it didn't happen

Every wave ends in `python3 tools/design-gate/gate.py <wave>
<pipeline-dir>` writing `<pipeline-dir>/GATES.json` `{wave, pass,
failures[], sha256 of inputs}`. `run.py` refuses to run wave N unless
GATES.json shows wave N-1 `pass` for the CURRENT input hashes AND
`approved: true`. Approval is the operator's recorded act
(`gate.py <wave> <dir> --approve` after reviewing the artifact);
unapproved artifacts block the next wave. The designer model NEVER
runs its own gates or writes `GATES.json`/`REVIEW.json` — self-graded
QA is the defect this machinery replaces. Reviewer output is
structured: `REVIEW.json` = rule ID → pass/fail + evidence screenshot
path + note; a reviewer fail blocks exactly like a script fail.

### P.9 Checklist evidence — blank is a fail

Each wave's `CHECKLIST/<wave>.md` inside the pipeline dir carries the
CARD's rule-ID → where-applied evidence table, filled by the agent
before the gate runs. Any blank cell (or `—`/`TBD`/`?`) fails the
wave. Evidence is a location (`file:line`, section slug, token name),
never an assertion.

### P.10 No emoji — icons are inline SVG, never glyphs

No emoji or pictograph glyphs anywhere in `src/` or emitted pages —
stars, checks, arrows ship as inline SVG paths (`currentColor`,
token-sized, `aria-hidden`). Script-checked: any emoji-range codepoint
in sources or emitted HTML fails the wave.

### P.11 Icon discipline — one library, inline, closed sizes

One icon library per site (Lucide default), inline SVG only: no
`<img>` icons, no icon fonts, no mixed sets. Sizes ∈ {16, 20, 24, 32,
48} (I.3); stroke-width ∈ {1.5, 2, 2.5, 3}px uniform per site (I.2).

### P.12 Speed budget — measured on built output

`astro build` output is gated: mobile perf ≥90 (lighthouse CLI when
available, else static budgets), LCP ≤2.5s, CLS ≤0.1, total JS ≤50KB
(zero JS by default — islands only when needed), CSS purged by
Tailwind, images via `<Image>`/`<Picture>` AVIF/WebP with width/height
set + lazy below fold + hero `fetchpriority=high`, fonts self-hosted +
`font-display: swap` + preload, no render-blocking third-party
scripts.

### P.13 Mobile budget — the 360 render is the product

Mobile-first always: 360 above-fold mandate (R.5), touch targets
≥44px (R.6), no horizontal scroll at 360 (no fixed width >360px
outside `min-width` queries), burger nav collapse, body text ≥16px.

### P.14 Mobbin evidence — real layouts before invention

Before direction cards or page structure, consult Mobbin
(`search_screens`/`search_sections` via `~/.mobbin-oauth/refresh.sh`
token rotator — tokens expire hourly, refresh first) for approved
real-world layouts per section type. Record screen IDs/URLs + why in
`MOBBIN-REFS.md`; every composition used in the plan cites ≥1 Mobbin
reference. Unavailable tool blocks the wave — never a silent skip.

### P.15 SPEC verbatim — L4 is a diff, not a rewrite

`PAGES/<slug>/SPEC.md` `sections[]` copy `pages.<slug>.sections[]`
verbatim; the gate is the verbatim diff. A SPEC that contradicts the
plan is a refuse, not an improvisation.

## Enforcement

| Rule | Mode | Check / rubric | Threshold that FAILs | Wave |
|---|---|---|---|---|
| P.1 | script | `check_scaffold` | Astro+Tailwind project, astro build 0 | w0 |
| P.2 | script | `check_no_stray_styles` | one shared layer; no <style>/style=""/stray classes | w6 |
| P.3 | script | `check_wireframe_tags` | every card section carries 4 data-* attrs | w5 |
| P.4 | script | `check_wireframe_lock` | rows match card data-* 1:1 in order, wf_ref | w5 |
| P.5 | script | `check_tailwind_derivation` | config generated from TOKENS.json | w3 |
| P.6 | script | `check_components_exist` | composition→component; tile instantiates all | w6 |
| P.7 | script | `check_page_data_attrs` | page sections data-* == plan rows | w7 |
| P.8 | operator | `approve` | gate pass + recorded approval per wave | w* |
| P.9 | script | `check_checklist` | no blank evidence in CHECKLIST/<wave>.md | w* |

## Links

- P.1 → L.10 (golden rule ↔ atomic file structure)
- P.3 → P.4, V.3 (contract tags ↔ lock ↔ ratios)
- P.5 → S.2, G.1, C.1 (config ↔ radius/space/colour tokens)
- P.11 → I.1 (absolute icons ↔ family set)
- P.12 → M.7 (speed ↔ compositor budget)
