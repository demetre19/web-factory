---
id: rules-J
type: rulebook
links:
  index: design-index
  see_also: [rules-P, rules-VG, rules-B]
  used_in: [w4, w7, w8]
---

# J — Judgment gates (quality, order, pre-build, block trace)

Compliance (rules/canon/tokens) is necessary but not sufficient: a
compliant-but-bad design used to reach the picker. The J family is
the judgment chain — every option is validated on the plan, judged
after build, and re-checked before it may present. Nothing reaches
the operator's eye un-enforced and un-judged.

The canonical stage order:

  RULES (pre-build + compliance intent on the plan)
    → BUILD
    → JUDGE (quality)
    → RECHECK (rules re-verified on the post-judgment artifact)
    → present

Any state change to a render re-enters the rules gate. The loop
runs until rules AND judgment pass on the SAME artifact version.

### J.1 Every option clears the quality floor

Each option in every picker carries a quality row in REVIEW.json,
judged by the configured cheap `reviewer_model` on full-page renders
at 1280 and 375:

- `hero_clarity` — business type readable from the hero in <3s
- `layout_craft` — rhythm / tension / hierarchy
- `media_fit` — media presence appropriate to business type
- `mobile` — 375 render quality
- `distinctness` = 0.5·`visual_diff` + 0.5·`topology_dist`
  (topology distance between plan/topology vectors vs siblings —
  structural difference, weighted with the VLM's perceived-visual
  difference; the VLM never scores distinctness raw)
- `composite` = (2·hero_clarity + 2·layout_craft + media_fit +
  mobile + distinctness) / 7

Floors: every dimension ≥ 50 AND composite ≥ 60. `judged_by` must
equal the configured `reviewer_model` — judgment runs on the
sanctioned cheap model only (Opus never). A below-floor option gets
`fix_instructions` and exactly one `quality_retry`; retry > 1 means
drop/replace, never present.

**Enforcement** — script `check_quality_floor` (w7/w8): an option in
a picker with no quality row, a dimension < 50, composite < 60, a
`judged_by` that isn't the configured model, or a retry count > 1
FAILs.

### J.2 PRESENT-ORDER — receipts and version equality

An option may enter a picker only when BOTH receipts exist:

1. the compliance receipt (rules pass on that artifact version), and
2. the quality receipt (judgment pass on that artifact version).

`REVIEW.json` records `rules_pass_hash` and `judgment_pass_hash`.
They MUST be equal — the artifact judgment passed is the artifact
rules last cleared. When judgment forces fixes (or any post-judgment
build change), the changed artifact re-traverses the rules gate;
hash mismatch means the later gate re-ran and its result hasn't been
verified.

**Enforcement** — script `check_present_order` (w7/w8): a picker
option without a quality row, or mismatched pass hashes, FAILs.
Assembling or serving a picker containing an unreceipted option is
itself a gate violation — the picker cannot be built around missing
evidence.

### J.3 PRE-BUILD VALIDATION — judge the plan before the build

A plan that will produce a bad design is REJECTED before build, not
after render. `PREBUILD.json` records, per option:

- `recipe_id` resolving to a topology-bank entry (harvest id), or an
  explicit `recipe_exception` with `justification`
- `plan_fit` — the recipe's semantic labels / media requirements fit
  the section's business-type purpose (a bare text accordion is not
  a service-area coverage section)
- `refs_resolve` — planned canon refs resolve
- `tokens_resolve` — planned tokens/knobs resolve to the ACSS
  baseline
- `plan_vector_dist` — topology distance to sibling options on the
  PLAN (≥ 0.3); sibling options are distinct before render, not
  discovered identical after

**Enforcement** — script `check_prebuild_receipt` (w4): pickers
exist without PREBUILD.json = FAIL; unresolvable recipe,
unjustified exception, missing field, or `plan_vector_dist` < 0.3
= FAIL. Fix instructions return to the designer; the option is
rebuilt from a corrected plan.

### J.4 BLOCK-TRACE — every rendered block traces the chain

Finer than section-level: every rendered block carries
`data-recipe` (resolving to the topology bank) AND a receipt row in
`REVIEW.json blocks[]`:

  {block_id, dna_knobs_used, plan_slot, recipe_id,
   vector_deviation}

A block without a trace came from outside the design — ad-libbed,
even inside a "sourced" section. The receipt recipe must equal the
rendered recipe (the receipt names what actually shipped).

**Enforcement** — script `check_block_trace` (w7): missing
`data-recipe`, unresolvable recipe, missing receipt row, empty
field, or receipt/render recipe mismatch FAILs.

### J.5 CONTENT-MAP — sections come from content

The W2 importer emits a typed content inventory — every block
(heading-vector row, FS answer, body block, inventory item) carries
a stable `content_id` and a semantic type (definition / scope-list /
steps / reporting / pricing / schedule / related-links / coverage /
faq / cta). Sections are content, grouped semantically:

- every inventoried `content_id` maps to exactly one `sections[]`
  row — no dropped content;
- every non-chrome `sections[]` row names the `content_ids` it
  serves — an unserved section is ad-libbed;
- the render carries `data-content` through: every inventoried id
  rendered, no rendered block without one.

The semantic type drives recipe selection (list→grid, steps→
sequence, locations→map, questions→faq, links→link-grid) — recipe
choice comes from content shape + business type, never builder
choice.

**Enforcement** — script `check_content_map` (w3 + w7): unmapped
content, unserved/invented/orphan rows, missing `data-content`, or
an un-inventoried rendered id FAILs. Receipts record
`content_coverage` per wave.

### J.6 PAGE-FAMILY — page type names a vocabulary, not a skeleton

The W2 importer classifies `page_type` from front matter + heading
vector + block composition: `service-page` (conversion),
`guide/blog` (editorial), `product-profile` (entity),
`near-me` (local-service), `hub/index` (service-grid),
`gallery`/`before-after` (comparison grid, filterable),
`tool`/`interactive` (a shell around one interactive unit),
`support/utility` (form-led / profile / accordion / confirmation).

The type selects the LAYOUT FAMILY — a vocabulary constraint on the
recipe pool, NOT a page skeleton. A page is a container: sections
are glued in whatever order the content demands. Coverage may
precede pricing; a gallery may sit mid-page. There is no canonical
sequence to validate against.

What IS enforced, per section, independent of position:

- each section's content_ids, recipe, knobs and seam are validated
  on their own (J.3–J.5);
- recipe choice is per-section from THAT section's content type — a
  page mixes any combination in any arrangement;
- assembly composes neighbours by **seam compatibility** (each
  recipe's topology vector carries `seam` + `direction`); glue
  checks verify seam continuity between adjacent sections in
  whatever order they sit, never position against a template;
- a recipe whose bank family ≠ the page's declared family is a
  cross-family FAIL.

Tail rhythm is a **per-vertical** warn-level prior only (cleaning
ends related→coverage→faq→cta; insurance-work ends insurance→
worth-it→faq): unusual order warns, never fails.

**Enforcement** — `page_type` + `layout_family` recorded in
DESIGN-PLAN; `check_page_family` (w3/w4) FAILs a missing type,
an unknown type, a declared family ≠ the type's family, or a
PREBUILD recipe family outside the page's families; seam continuity
rides the glue/block-trace checks; the tail prior rides the
advisory channel.

### J.7 ELEMENT-VARIANT — topology names the structure, the variant
names what fills it, knobs restyle it

The selection chain is three levels, and the middle one is where
"every card has a number" used to hide: **topology** (structure —
grid-3col-uniform) → **element-variant** (what fills each cell:
image-led, numbered, icon-led, avatar-led, text-only) → **style
knobs** (DNA vector). Recipes sharing a `topology_id` but differing
in `elements[]` are DIFFERENT variants; the variant must be chosen
before knobs apply, and restyling one variant is never a substitute
for choosing another.

Media expectation is **canon, not corpus**: the endorsed/Mobbin
reference set per vertical defines expected media treatment
(fashion/luxury = photo-driven, finance = sparse/numbered,
healthcare = icon/avatar-led). The sampled `image-led-ratio` gene
distribution is biased text-led in every vertical — it is a weight
inside canon-compliant choices, never the selector. When corpus and
canon conflict, canon wins outright: a text-only card grid under an
image-led vertical is a selection defect regardless of what the
sampled majority says.

Pre-build rules, per option (`PREBUILD.json` row):

- `element_variant` — the declared media signature of the recipe
  (`text`, or `+`-joined classes: `image`, `icon`, `number`,
  `avatar`, `logo`, `video`, `chart`); MUST equal the signature the
  bank derives from the recipe's `elements[]`.
- CANON (`VERTICAL_MEDIA_CANON` in gate.py): the variant's classes
  must all be accepted for the plan's `dna.profile` vertical, and a
  media-led vertical (`text_ok = false`) rejects text-only variants.
- GENOTYPE TIGHTENING: a declared `image-led`/`media-first`
  `image-led-ratio` allele rejects text-only variants even where
  canon tolerates them — the declared genotype binds element
  selection (genes tighten canon, never loosen it).

**Enforcement** — script `check_prebuild_receipt` (w4): missing
`element_variant`, declared ≠ bank signature, class outside the
vertical canon, text-only under a media-led canon, or text-only
under a declared image-led genotype FAILs.

### J.8 SEAM-SHAPE — the edge's shape is a declared personality

Seam STYLE (hairline/tonal/whitespace, J.4 glue) governs colour;
seam SHAPE is a second, independent vector — the geometry of the
boundary: `flat`, `diagonal`, `angled-clip`, `curve`, `wave`,
`zigzag`, `skewed-block`, `torn-edge`, `slant-into-media`. Joins are
pure clip-path/SVG-mask/skew per the motion policy — no library, no
raster.

- The `seam-shape` DNA gene declares the page's edge personality;
  `flat` is the default and most verticals stay flat — shaped seams
  are a canon-plausibility call per vertical (playful/bold DNAs may
  declare them), never a free choice: a diagonal in a finance site
  is a coherence defect, not flair.
- Bank recipes carry `topology.seam_shape_top` /
  `seam_shape_bottom` (entry/exit edge shapes); the rendered block
  echoes them as `data-seam-shape-top`/`data-seam-shape-bottom`.
- Adjacent edges compose: A.bottom meets B.top — the pair is
  compatible when the shapes match or either is flat (a shaped edge
  may dissolve into a flat face; two unlike shapes meeting is a
  glue defect).

**Enforcement** — script `check_block_trace` (w7): a rendered
`data-seam-shape-*` that contradicts the recipe's declared edge,
a non-flat edge while the genotype declares `flat`, or two unlike
non-flat shapes meeting at a boundary FAILs.


### J.9 SECTION-PROGRAM — the page's shape comes from its type

A page type is a promise about sections. `service-page` that ships a
hero, a card grid and a button is a landing page wearing a service
page's name: the reader never learns how the work runs, never sees a
previous customer, and never gets an answer to the question that stops
them booking.

The program is declared in `gate.SECTION_PROGRAM`:

| page_type | acts the page must argue | categories it must carry |
|---|---|---|
| service-page | promise, proof, how, act | headers 1, hero 1, content 3, contact 1, footer 1 |
| near-me | promise, proof, how, objection, act | headers 1, hero 1, content 3, contact 1, footer 1 |
| guide | promise, how, detail | headers 1, hero 1, content 2, footer 1 |
| hub | promise, detail | headers 1, hero 1, content 2, footer 1 |

Two consequences are gated: every act the page's `rhetoric` declares
must have at least one section carrying it (an argument with no
section is an argument the page never makes), and every non-chrome row
must bind content (`content_ids`, `vector` or `items`) so a section
cannot exist as an empty frame.

**Enforcement** — script `check_section_program` (w3, w7): a rhetoric
act with no section, a missing required category, or a content row with
no content binding FAILs.

### J.10 HERO-COMPOSITION — the archetype bounds the fold

The genotype declares a `layout-archetype`. That gene is not a label:
it names the shape the fold takes. A `split-media` genotype whose hero
renders as a card grid is a different page than the one the DNA
described, and every downstream rhythm decision (media ratio, proof
placement, fold height) was made against the wrong shape.

`gate.HERO_COMP` binds archetype → allowed compositions. Only the row
carrying the `promise` act is judged; content sections may use any
composition their act allows.

**Enforcement** — script `check_hero_composition` (w3, w7): a
promise-carrying row whose composition is outside its archetype's set
FAILs.

### J.11 MEASURED-EVIDENCE — the page is measured, not declared

Typed review scores are a claim, not a fact: a page with one image
and no proof surface used to pass w7/w8 on a declared 81. The
measurement stage (`tools/design-gate/measure.py`, w7, after the
evidence shots) reads the BUILT page instead — dist markup served
over http, rendered by Playwright at every `SHOT_WIDTHS` viewport in
light + dark — and writes `MEASURE.json`: rendered image coverage
(px of img/svg/canvas/video ÷ viewport × page height), section
count, minimum WCAG contrast ratio, minimum tap target px, CTA
count, proof/testimonial surfaces, the largest dead-space vertical
run (px, viewports, share of page — DOM union plus a pixel decode of
the evidence shots), and heading-hierarchy skips (a block's first
heading below h2, or a level jumped under it).

`MEASURE.json` binds the build it measured (`dist_sha256`) and the
shots it verified (`shots_sha256`) — a rebuilt dist or re-shot
evidence invalidates the measurement.

**Enforcement** — script `check_measured_evidence` (w8): the file
must exist, parse, bind the current dist + shots, and carry a
viewport record per plan page.

### J.12 JUDGED-VERDICT — pass/fail comes from the metrics

`tools/design-gate/judge.py` (w8) turns `MEASURE.json` into
`JUDGE.json`: each metric against the threshold its vertical
documents below, emit `fail` or `warn` findings, `verdict: fail`
when any fail finding exists. The w8 gate consumes the verdict — the
page is judged on EVIDENCE, never on declared scores.

Two severities per metric: `warn` is the canon value a healthy page
reaches (recorded for the reviewer); `fail` is the degenerate floor
that blocks the wave.

| metric | base fail | base warn | services fail | services warn |
|---|---|---|---|---|
| image_coverage | <0.03 | <0.06 | <0.06 | <0.10 |
| section_count | <4 | <6 | <4 | <8 |
| contrast_min_ratio | <3.0 | <4.5 | <3.0 | <4.5 |
| tap_target_min_px | <12 | <24 | <12 | <24 |
| cta_count | <1 | <2 | <1 | <2 |
| proof_surfaces | not required | <1 | <1 | <2 |
| dead_space_vps | >1.5 | >1.0 | >1.5 | >1.0 |
| dead_space_ratio | >0.40 | >0.30 | >0.40 | >0.30 |
| hierarchy_violations | >0 | >0 | >0 | >0 |

Services canon comes from the audited reference set (image coverage
≥ ~0.10 — the live reference site measures 0.129 — plus ≥1 proof
surface and no dead-space run over ~1.5 viewports). Other verticals
inherit base floors until the corpus carries per-vertical data. The
vertical resolves from `DNA.json`'s `vertical_profile`.

**Enforcement** — script `check_judged_verdict` (w8): JUDGE.json
must exist, bind this dist + the on-disk MEASURE.json, and reach
`verdict: pass`; every fail finding is a gate failure.


## Enforcement

Generated from `enforcement.json` (`gate.py enforcement`) — edit the JSON, never this table.

| Rule | Tier | Mode | Check / rubric | FAILs when | Wave |
|---|---|---|---|---|---|
| J.1 | invariant | script | `check_quality_floor` | option unjudged, dim <50, composite <60, wrong judged_by, retry >1 | w7 |
| J.2 | invariant | script | `check_present_order` | option lacks quality receipt, or pass hashes differ | w7 |
| J.3 | invariant | script | `check_prebuild_receipt` | pickers without PREBUILD.json; unresolvable recipe; missing field; plan dist <0.3 | w4 |
| J.4 | invariant | script | `check_block_trace` | rendered block without data-recipe/bank recipe/receipt row/fields | w7 |
