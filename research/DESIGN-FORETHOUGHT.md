# DESIGN-FORETHOUGHT — what great designers decide before the first pixel

Researched 2026-11-18. Scope: the *generative* procedure — what a strong
designer decides, in what order, and what artifact records each decision —
so a weak model can execute a plan it did not invent. This is the upstream
document; critique/lint (C.R.A.P. audits, squint checks) is downstream
machinery and is only referenced where it doubles as an acceptance test.

Every claim carries a URL or a named book/paper. Items marked
`[INFERENCE]` are the researcher's synthesis, not cited fact.

---

## 1. The procedure — what happens before anything is drawn

Every canonical design process puts the same load-bearing wall in the same
place: **the problem, the audience, and the constraint system are decided
before form is attempted.** The frameworks differ in vocabulary, not in
order.

### 1.1 The canonical sequences

**Double Diamond (Design Council, 2004/2005).** Four phases:
Discover → Define → Develop → Deliver. The first diamond *diverges*
(open the problem) then *converges* (name the real problem); only then
does the second diamond diverge on solutions. The lesson for a build
pipeline: **Define is a separate deliverable from Develop** — the named
problem is itself an artifact.
<https://www.designcouncil.org.uk/resources/the-double-diamond/> ·
<https://en.wikipedia.org/wiki/Double_Diamond_(design_process_model)>

**IDEO / Stanford d.school five modes.** Empathize → Define → Ideate →
Prototype → Test. The d.school's *Design Thinking Bootleg* states the
Define mode is where you "unpack and synthesize … and scope a specific and
meaningful challenge." Again: ideation is gated on a scoped statement.
<https://dschool.stanford.edu/tools/design-thinking-bootleg> ·
<https://hpi.de/fileadmin/user_upload/fachgebiete/d-school/documents/01_GDTW-Files/bootcampbootleg2010.pdf>

**Dieter Rams, ten principles of good design** (as published by Vitsœ).
The operative ones for *order*: (vi) honest — "does not make a product
more innovative, powerful or valuable than it really is"; (viii) thorough
down to the last detail — "nothing must be arbitrary or left to chance";
(x) **as little design as possible** — "concentrates on the essential
aspects." Rams' order is subtraction-first: decide what the thing *is*,
then remove everything that isn't that.
<https://www.vitsoe.com/gb/about/good-design> ·
<https://en.wikipedia.org/wiki/Dieter_Rams>

**Paul Rand: "Design is relationships."** From *Paul Rand: Conversations
with Students* (Princeton Architectural Press, 2008): "Design is
relationships. Design is a relationship between form and content." Rand
draws on *A Designer's Art* (Yale, 1985). The implication is sequential:
content exists first; form is the *relationship you choose to assert*
between content elements. A designer who starts with form has no
relationship to assert.
<https://attachments.are.na/34752383/56c702af55b99dce83166c082ca74a35.pdf> ·
<https://books.google.com/books/about/Paul_Rand.html?id=XzXfPFUka-8C>

**Josef Müller-Brockmann, *Grid Systems in Graphic Design*** (Niggli,
1981): "The grid system is an aid, not a guarantee." The grid is chosen
*after* the content and format are known and *before* a single element is
placed — its anatomy (columns, gutters, modules, margins, spatial zones,
flowlines) is the fixed armature everything else plugs into. The grid is
the first *visual* decision and the last *free* one; after it, placement
is constraint-solving, not invention.
Book (no open canonical URL): Müller-Brockmann, *Grid Systems in Graphic
Design*, Verlag Niggli, 1981.

**Robert Bringhurst, *The Elements of Typographic Style*** (4th ed.,
Hartley & Marks, 2012). The typographer's first decisions are not fonts:
1. **The measure** — "Anything from 45 to 75 characters is widely
   regarded as a satisfactory length of line for a single-column page
   set in a serifed text face… the 66-character line (counting both
   letters and spaces) is widely regarded as ideal." (§2.1.2)
2. **The scale** — choose a rational ratio; his §8 scales reproduce the
   Renaissance/Baroque musical intervals, and the scale must be rooted in
   the text itself. (§8)
3. **Vertical rhythm** — the basic unit of vertical space is the leading
   (line-height); headings, extracts, and figures must return to the
   baseline rhythm, i.e., block spacing is *a multiple of the line
   height*, not an ad-hoc number. (§2.4)
Public condensed version: <https://webtypography.net/> — see §2.1.2
(measure) and the vertical-motion rules.

**Ellen Lupton, *Thinking with Type*** (3rd ed., Princeton Architectural
Press, 2024; companion <https://thinkingwithtype.com/>). Lupton's
repeated move: type is chosen for *what it must do* — "designers provide
ways into—and out of—the flood of words" — so hierarchy, scale, and
spacing are decided from the text's job, and fonts come last. Her
*Design is Storytelling* (Cooper Hewitt, 2017) recasts a designed
sequence as narrative arc: act one/two/three, tension, release — the
direct ancestor of "page as argument" in §5 below.
<https://designisstorytelling.com/> (companion) · book: Cooper
Hewitt/Smithsonian, ISBN 978-1942303190.

**Adam Wathan & Steve Schoger, *Refactoring UI*** (2018,
<https://www.refactoringui.com/>). The practitioner encoding of the same
order, stated for developers:
- Start with the feature's real content, grayscale first; color and
  polish last.
- "Hierarchy is everything": before styling, assign every element a
  rank; "emphasize by de-emphasizing" — you create a primary element by
  deliberately muting the others, not by decorating the primary.
- Define the constraint system up front: pick a *finite set* of font
  sizes, font weights, spacing values, and colors *before* designing,
  then never reach outside it — otherwise you re-litigate the decision
  at every element.
- Whitespace is budgeted first: "start with too much white space."
These are the same invariants as Bringhurst/Vignelli, restated as
pre-committed token sets.

**Michael Bierut / Pentagram.** Bierut's Design Observer essays —
including "Warning: May Contain Non-Design Content" (2007) — and his
anthology *How to use graphic design to sell things, explain things,
make things look better, make people laugh, make people cry, and (every
once in a while) change the world* (Harper Design, 2015) make the same
point from the studio side: the idea — the content of the argument —
precedes and outlives the styling. Pentagram's published case studies
consistently present the strategy paragraph first, identity second.
<https://designobserver.com/> · book: ISBN 978-0062413901.

**Massimo Vignelli, *The Vignelli Canon*** (free PDF via RIT Vignelli
Center). Vignelli reduces the discipline to a small fixed toolkit:
**semantics** (understand the meaning before the form), **syntactics**
(grids, typographic structure), **pragmatics** (clarity of
communication). His famous economics: a handful of typefaces suffices —
he names Garamond, Bodoni, Century Expanded, Futura, Times Roman,
Helvetica — because constraint, not variety, produces consistency. On
color he prescribes appropriateness and restraint; on grids, a single
consistent armature per artifact.
<https://www.rit.edu/vignellicenter/sites/rit.edu.vignellicenter/files/documents/The%20Vignelli%20Canon.pdf>

### 1.2 The order of decisions — the cross-source consensus

Reading the eight sources as one procedure, the order is:

| # | Decision | Sources | Ever revisable? |
|---|---|---|---|
| 1 | Who it is for; what they must *do* or feel after | Double Diamond Discover/Define; d.school Empathize/Define; Ogilvy (the reader decides in the headline) | Never mid-build |
| 2 | The one thing being said — the idea/tension | Rand (form↔content relationship); Bierut (content before style); Duarte (one big idea) | Never mid-build |
| 3 | The argument's *sequence* — which claim, in which order | Double Diamond Define deliverable; Duarte sparkline; Lupton narrative arc | Rarely |
| 4 | The constraint system: grid/measure, type scale, spacing unit, color roles | Müller-Brockmann; Bringhurst §2.1.2/§8; Vignelli; Refactoring UI token sets | Never mid-build — consistency *is* the artifact |
| 5 | Direction: temperature, density, finish — one of a few named options | NN/g moodboards; Warren style tiles | Once, by choosing a different board |
| 6 | Per-section composition matching each step of the argument | Lupton; Ogilvy; layout catalogues | During drafting only |
| 7 | Fonts, hex values, decorative detail | Everyone — last | Freely, inside the system |

**What is NEVER left to later** (the invariant across all sources):
the audience, the single idea, the argument order, the grid/measure, the
type ratio, the spacing unit, and the color role map. Refactoring UI
states it operationally — every un-decided number becomes a decision the
maker re-litigates at every element, which is exactly what produces
"slop" output from a weak executor. Bringhurst states it formally: if
the scale and rhythm aren't fixed, every space is arbitrary, and
arbitrary spacing is visible instantly.

---

## 2. The common DNA — invariants that survive across styles

These hold identically in Swiss International Style, Japanese editorial,
brutalist posters, luxury packaging, and vernacular shop signage. Styles
differ; the decision *shape* is constant. Encoding per the contract:
**name → what it decides → how a designer records it → how a machine
records it.**

### 2.1 Constraint first — a system of limited choices

- **What it decides:** the total option space. A design is a walk through
  a *pre-closed* set: N font sizes, M spacing values, K colors.
- **Who named it:** Müller-Brockmann (the grid *is* the option set);
  Vignelli ("a few typefaces"); Rams (x: as little design as possible);
  Refactoring UI (define systems in advance — choose from a finite set).
- **Measurable form:** a closed enumeration — e.g. spacing ∈
  {4,8,12,16,24,32,48,64,96,128}, type ∈ the modular scale's 7 steps.
- **Designer records it as:** the spec sheet / style-guide front page.
- **Machine records it as:** a token map; the build rule "no literal
  values outside this set" is enforceable by grep/lint.
  <https://utopia.fyi/> · <https://www.refactoringui.com/>

### 2.2 One idea / one tension

- **What it decides:** the single sentence the artifact argues; every
  element either serves it or is deleted.
- **Who named it:** Rand (the form–content relationship is *the* design);
  Bierut (content before style); Duarte — *Resonate* (Wiley, 2010)
  prescribes one "big idea" per presentation; Ogilvy — *Ogilvy on
  Advertising* (1983): the headline carries the whole promise.
- **Measurable form:** the idea fits in one ≤25-word sentence and every
  section can be mapped to a role in that argument (see §5).
- **Designer records it as:** the brief's single-line proposition.
- **Machine records it as:** `idea:` field + per-section `role:` mapping;
  a section that maps to no role is a build error.
  <https://www.duarte.com/blog/ultimate-guide-to-contrast/>

### 2.3 Hierarchy as a finite set of ranks

- **What it decides:** not "sizes" but *ranks* — typically 3–5:
  display / heading / body / caption(/label). Each rank is a fixed
  (size, weight, tracking, space-above) tuple.
- **Who named it:** Bringhurst (scale steps are roles, §8); Lupton
  (hierarchy, *Thinking with Type*); Refactoring UI ("not too many" —
  a heading/body/caption system beats arbitrary sizes; jump in *weight*,
  not just size).
- **Measurable form:** the rank table itself; e.g.
  `display: scale^4/700/-2%/0 above`, `heading: scale^2/600/0/6 above`,
  `body: scale^0/400/0/4 above`, `meta: scale^-1/500/+1%/2 above`.
- **Designer records it as:** the type-specimen sheet.
- **Machine records it as:** named roles in the type-scale table;
  the acceptance test is the squint test (§4.6).

### 2.4 Rhythm as a ratio, not a vibe

- **What it decides:** every vertical space and every type size is a
  member of one numeric family — a modular scale for type sizes
  (ratio^n) and a grid unit for spacing (base × n).
- **Who named it:** Bringhurst §8 (scales as musical intervals); Tim
  Brown, "More Meaningful Typography" / modularscale.com (a ratio
  applied to a base size); Dahl, "8-Point Grid: Vertical Rhythm" (all
  box heights and margins as multiples of 8, or half-units of 4).
- **Measurable form:** `base=16px, ratio=1.25` or `unit=8px`; any emitted
  value outside the family is a defect by arithmetic.
- **Designer records it as:** the scale card / grid overlay.
- **Machine records it as:** `scale: {base: 16, ratio: 1.25}`,
  `space_unit: 8` — a generator (modularscale.com, utopia.fyi) emits
  the derived numbers.
  <https://www.modularscale.com/> ·
  <https://medium.com/built-to-adapt/8-point-grid-vertical-rhythm-90d05ad95032>

### 2.5 Contrast as the only way anything is seen

- **What it decides:** *which single axis* separates two elements —
  size **or** weight **or** color **or** space. Robin Williams, *The
  Non-Designer's Design Book* (4th ed., Peachpit, 2014): "If two items
  are not exactly the same, then make them different. Really different."
- **Who named it:** Williams (Contrast, first of C.R.A.P.); Gestalt
  figure-ground precedes it; Refactoring UI operationalizes it (don't
  rely on color alone; emphasize by de-emphasizing).
- **Measurable form:** a declared contrast axis per relationship:
  `heading vs body: size ONLY (scale^2 vs scale^0) — same family, same
  ink`. Stacking all four axes is the signature of decoration.
- **Designer records it as:** style-sheet conventions ("heads differ by
  size, not by a second accent color").
- **Machine records it as:** `contrast_axes:` per rank pair; linter =
  "differs on exactly the declared axes."

### 2.6 Negative space as a designed element

- **What it decides:** how much emptiness each region owns and where the
  eye rests. Space is *assigned*, not left over.
- **Who named it:** Japanese *ma* (間) is the classic name; Williams'
  Proximity makes it mechanical (related things close, unrelated apart);
  Refactoring UI: "start with too much white space"; Müller-Brockmann:
  margins and spatial zones are the largest reserves of the grid.
- **Measurable form:** margin/gutter sizes on the grid + the grouping
  gaps (§4.4); a "rest" column or band is drawn, not implied.
- **Designer records it as:** the margin block on the thumbnail; generous
  outer padding in the spec.
- **Machine records it as:** margin/gutter fields in the grid spec +
  `rest:` spacing values in section plans.

### 2.7 Repetition + variation — a motif that recurs, then breaks once

- **What it decides:** which device (a rule, a shape, an overline, a
  numeral style, a corner treatment) repeats to establish the visual
  language — and the *single* sanctioned break that makes it memorable.
- **Who named it:** Williams (Repetition — repeat visual elements
  throughout); music's theme-and-variation; editorial design's folio/
  running-head conventions; brutalism's one rule violated deliberately.
- **Measurable form:** `motif: {device, recurs_at[], break{where,how}}`.
- **Designer records it as:** the device in the style tile + a note on
  the anomaly.
- **Machine records it as:** the motif field in §6 — recurrence is a
  list, the break is singular by schema.

### 2.8 Alignment as a return-edge for the eye

- **What it decides:** every element's edge snaps to a grid line or to
  another element's edge — the reader's eye gets a rail to ride.
- **Who named it:** Müller-Brockmann (columns/flowlines exist to be
  returned to); Williams (Alignment — "nothing should be placed on the
  page arbitrarily"); Bringhurst (flush-left, indent conventions).
- **Measurable form:** the column grid + an edge-usage note ("all text
  returns to the col-1 edge; images may break to the col-12 edge only").
- **Designer records it as:** the drawn grid itself.
- **Machine records it as:** `grid:` spec + per-section `align:` reference
  to a named edge.

### 2.9 Material honesty — the medium's constraints become the look

- **What it decides:** which properties of the medium are *features*:
  the web's fluidity (hence `clamp()`, not fixed comps), the screen's
  RGB light (saturated accents read hotter than print), variable
  viewports (hence measure in `ch`, not cm).
- **Who named it:** Rams (vi: honesty); Vignelli (appropriateness);
  *Every Layout* (Heydon Pickering & Andy Bell) — the modern
  codification: algorithmic layout primitives that let the browser do
  the layout instead of simulating print.
- **Measurable form:** fluid type endpoints instead of breakpoint tables;
  `ch` measure; space tokens, not pixel comps.
- **Designer records it as:** "designed in the browser" / fluid specs.
- **Machine records it as:** the Utopia-style min/max pairs (§4.2).
  <https://every-layout.dev/> · <https://utopia.fyi/>

---

## 3. Tools of the trade — the artifacts each produces

Each artifact **locks a decision class**. The file form is what a weak
model can write instead of a picture.

| Artifact | What it locks | File form a model can write |
|---|---|---|
| **Moodboard / direction board** | *Which* aesthetic family — chosen from **several** candidates, not styled ad hoc. NN/g: boards communicate direction and are compared and discussed; the deliverable is the *selection + why*, not the collage. <https://www.nngroup.com/articles/mood-boards/> | `direction.md`: 2–3 candidate boards, each = {named references (URLs), adjective set, temperature, density, why-it-fits-the-idea} + `chosen:` + `rejected_why:` |
| **Grid overlay** | Columns, gutter, margins, baseline unit, measure — Müller-Brockmann anatomy. | `grid.md`: `{cols: 12, gutter: 24px, margin: clamp(24px,6vw,96px), measure: 62ch, vunit: 4px}` |
| **Type specimen + scale** | Not a font pick — the *scale with roles*: scale steps × the rank table (§2.3); fonts last. Bringhurst §8; thinkingwithtype.com specimens. | `type.md`: ratio, base, step table with role/weight/tracking/space-above per rank, font stack + fallback metric notes |
| **Color study / role map** | 60-30-10 proportions + temperature + contrast pairs — **roles**, not a palette. Interior-design rule adapted to UI: ~60% dominant neutral (bg), ~30% secondary (surfaces), ~10% accent. <https://saralynnbrennan.com/the-60-30-10-design-rule/> ; role-based color formalized in Material Design 3: <https://m3.material.io/styles/color/roles> | `color.md`: `{bg, surface, ink, ink_muted, accent, semantic{ok,warn,err}}`, each with hex + one-line *why* + declared contrast pair + ratio target |
| **Thumbnail sketches / 6-up** | Composition *alternatives* before commitment — the Double Diamond's second diverge. d.school Ideate prescribes quantity; Google Ventures *Sprint* (Jake Knapp, 2016) institutionalizes Crazy-8s: 8 variants fast. | `compositions.md`: per section, 3 thumbnail rows, each = {layout name from catalogue, ASCII/bullet geometry, where the eye lands first} + a pick-one record |
| **Content outline / inventory** | What exists to be designed — content-first. Stephen Hay, *Responsive Design Workflow* (Peachpit, 2013): derive layout from structured content; Mark Boulton, "Content-out Layout," A List Apart. <https://alistapart.com/article/content-out-layout/> | `content-outline.md`: ordered real copy blocks per section (headline ≤X words, proof items, CTA text) — a layout may not invent content |
| **Style tile / element collage** | The missing middle between moodboard and mockup: color + type + texture samples *without* layout. Samantha Warren, "Style Tiles and How They Work," A List Apart (2012); Dan Mall's element collages extend it. <https://alistapart.com/article/style-tiles-and-how-they-work/> · <https://v3.danmall.com/articles/rif-element-collages/> | `style-tile.md`: swatch chips (hex+role), 2 sample headlines in the chosen scale, button/link treatment words, texture/finish adjectives — deliberately no geometry |
| **Design rationale / decision log** | *Why*, so downstream never re-derives it. ADR practice: Michael Nygard, "Documenting Architecture Decisions" (2011). <https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions> | `decisions.md`: numbered entries `{decision, chose, over, because}` appended through the run |

**Sequencing rule across all artifacts:** each row's artifact exists
*before* the rows below it are attempted — the moodboard before the grid,
the content outline before compositions. This is the Double Diamond's
diamond shape applied to files: diverge cheaply on paper (boards,
thumbnails), converge by *selecting and recording*.

---

## 4. Rhythm, spacing, type, color, hierarchy — as numbers

### 4.1 Modular type scale — choosing the ratio from the content

A modular scale is `size(n) = base × ratio^n`. The **ratio is chosen from
content density**, not taste:

| Ratio | Interval (Bringhurst's musical names) | Use when |
|---|---|---|
| 1.125 | major second | very dense products, tools, dashboards — gentle steps |
| 1.2 | minor third | text-heavy editorial, documentation |
| 1.25 | major third | **default for marketing sites** — clear hierarchy, still compact |
| 1.333 | perfect fourth | display-forward pages, luxury, sparse copy |
| 1.5 | perfect fifth | poster-like pages, very large display vs small body |
| 1.618 | golden ratio | extreme display contrast; risky — jumps get crude |

Sources: Tim Brown, <https://www.modularscale.com/> and
<https://alistapart.com/article/more-meaningful-typography/> (the scale
is an *instrument*, chosen once); Bringhurst §8 for the interval names.
`[INFERENCE]` for the density mapping column — derived from Utopia's
default presets (1.2/1.25 typical) and common modularscale practice.

**Rule:** pick the ratio *once*, hold it for the whole artifact. A second
ratio mid-page is the numerical equivalent of a second accent color.

### 4.2 Fluid type — the plan is the min/max pair, not breakpoints

Utopia (James Gilyead & Trys Mudford) replaces breakpoint tables with
one interpolated scale: declare `(min_viewport, min_base, min_ratio)`
and `(max_viewport, max_base, max_ratio)` — conventionally
320px → ~1440–1500px — and emit `clamp()` steps.

- **The plan *is* the endpoints:** e.g.
  `type: {min: {vw:320, base:16, ratio:1.2}, max: {vw:1440, base:19, ratio:1.333}}`
  — note the ratio itself may widen toward display sizes on big screens.
- Everything between is arithmetic (`clamp(min, preferred vw, max)`),
  so "responsive" stops being a design phase.
<https://utopia.fyi/> · <https://utopia.fyi/type/calculator/> ·
<https://www.smashingmagazine.com/2021/04/designing-developing-fluid-type-space-scales/>

### 4.3 Baseline grid / vertical rhythm

Bringhurst: the line-height is the vertical unit; every inter-block space
is a whole multiple so text "returns to" the rhythm. Dahl's 8-pt-grid
articles implement the same for UI: base unit 8px, text line-heights
multiples of 4 (or 8), paddings and margins multiples of 8.

- Machine form: `vunit: 4px` (half-line) or `8px`; **rule: every emitted
  margin/padding/gap ≡ 0 mod vunit.** Line-height itself is a grid
  quantum (`body lh = 6×4 = 24px` on a 16px base).
<https://medium.com/built-to-adapt/8-point-grid-vertical-rhythm-90d05ad95032>

### 4.4 The 8pt/4pt scale — Gestalt proximity as a number

The spacing scale is a closed set: `{4, 8, 12, 16, 24, 32, 48, 64, 96,
128}` (Utopia's space scale ships a t-shirt-named subset `3xs…3xl`).
Gestalt **proximity** (Jon Yablonski, *Laws of UX*; NN/g) becomes
arithmetic: **the gap inside a group must be visibly smaller than the gap
between groups** — e.g. intra-group 8–16, inter-group 48–96. The ratio
between them (≥2×, commonly much more) is the signal the eye groups by.
<https://medium.com/built-to-adapt/intro-to-the-8-point-grid-system-d2573cde8632> ·
<https://lawsofux.com/law-of-proximity/> ·
<https://www.nngroup.com/articles/gestalt-proximity/>

### 4.5 Color — a role map + temperature, not a palette

- **Decide temperature first:** warm / cool / neutral for the whole
  surface family — one word that locks hue direction before any hex.
- **Then a role map, ~7 entries:** `bg, surface, ink, ink_muted, accent,
  semantic{ok, warn, err}`. Material Design 3 formalized role-based
  color exactly this way <https://m3.material.io/styles/color/roles>;
  Refactoring UI teaches the same mechanics: pick the darkest value
  first, work toward light, and tint neutrals toward the hue (saturation
  on greys) rather than using pure gray.
- **60-30-10:** dominant neutral ≈60% of pixels (bg), secondary ≈30%
  (surfaces/bands), accent ≈10% — **and the accent's scarcity is its
  function**: if more than ~10% of a screen is accent, nothing is
  accented. <https://saralynnbrennan.com/the-60-30-10-design-rule/>
- **Contrast pairs declared first:** `ink on bg ≥ 7:1` (AAA body),
  `ink_muted on bg ≥ 4.5:1`, `accent on bg ≥ 4.5:1` — WCAG 2.2,
  <https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html> —
  recorded *with* the hex values, not checked after.

### 4.6 Hierarchy — 3–5 ranks, each a full tuple; squint test is acceptance

- A rank is `(size step, weight, tracking, space-above)` — see §2.3.
  Refactoring UI's practical set: display, a collapsed heading family,
  body, small/meta; weights limited (e.g. 400/500/700).
- **Acceptance:** the *squint test* — blur or squint the page; the rank
  order must still read. If two ranks are indistinguishable at squint,
  they are one rank — merge them. That is the invariant Williams'
  Contrast demands, turned into a check.
- Also lock **one focal point per viewport**: Refactoring UI's "focus on
  the primary action"; NN/g scanning research (F/Z patterns). A viewport
  with two equal-emphasis elements has zero.

### 4.7 Column math — the grid serves the measure

Bringhurst's measure (45–75ch, ~66 ideal) is the *real* constraint;
the 12-column grid is scaffolding that must produce that measure, not
the other way around. Consequences:

- Declare `measure: 60–66ch` first; then a column count that yields it
  (12 is conventional because it divides into halves/thirds/fourths for
  proof bands and feature lists).
- Body text never spans all 12 — it spans ~7–8 of 12 at desktop so the
  measure lands inside 75ch. Full-bleed is reserved for figures and the
  CTA (§5).
- Sources: <https://webtypography.net/2.1.2> ; Müller-Brockmann (grid
  chosen to fit content); Every Layout's `ch`-sized primitives.

---

## 5. Planning a landing page — composition follows rhetoric

**The page is an argument read top-to-bottom; order is the argument.**
Three sources converge:

- **Ellen Lupton, *Design is Storytelling*** (Cooper Hewitt, 2017):
  designed sequences have narrative structure — set-up, tension,
  release. <https://designisstorytelling.com/>
- **Nancy Duarte, *Resonate*** (Wiley, 2010) and the Presentation
  Sparkline: persuasion alternates **what is** (the reader's current
  pain) with **what could be** (the promised state), building to a final
  "new bliss" + call to action.
  <https://www.duarte.com/blog/ultimate-guide-to-contrast/> ·
  <https://www.ted.com/talks/nancy_duarte_the_secret_structure_of_great_talks>
- **David Ogilvy, *Ogilvy on Advertising*** (1983): the headline is "the
  ticket on the meat" — on average five times as many people read the
  headline as the body; the opening *is* the ad. The AIDA lineage
  (Attention–Interest–Desire–Action, attributed to E. St. Elmo Lewis)
  is the same sequence.

**Section-as-argument:** each section answers exactly one question in a
fixed persuasion order, and its composition is *selected from a
catalogue to match the speech-act* — never decorated into shape.

| Speech-act (order) | Question answered | Composition from catalogue | Why it fits |
|---|---|---|---|
| **Promise** | "What do I get?" | **Split-hero** or centered hero: headline + one subline + one CTA + one image | Ogilvy: the headline carries the ad; one focal point |
| **Proof** | "Why should I believe you?" | **Band**: logo row / stat row / testimonial strip — low height, high credibility | Proof reads as evidence *density*, so it's a horizontal strip, not a story |
| **How** | "How does it work?" | **Sequence**: numbered steps, alternating rows, or timeline | A process is ordered — the layout literally enacts the order (Lupton's narrative) |
| **Objection** | "But what about…?" | **FAQ/accordion** or paired objection→answer list | Questions are discrete; disclosure matches the reader's skepticism pacing |
| **Act** | "What now?" | **Full-bleed CTA** — the *one* place the accent floods the surface | The break in the motif (§2.7): accent scarcity makes it land; Duarte's "new bliss" |

Supporting catalogue sources: Every Layout primitives (stack, cluster,
switcher, cover — layout as *algorithms* matching intent)
<https://every-layout.dev/>; component-catalogue practice (Tailwind UI;
Refactoring UI's pattern inventory).

`[INFERENCE]` — the speech-act→composition table is this document's
synthesis; the cells individually cite the sources above. The claimed
invariant: **a section whose composition doesn't match its speech-act
reads as decoration** — putting proof in a hero-shaped block wastes the
hero's one-focal-point power on content that wants density.

---

## 6. Proposed artifact — `DESIGN-PLAN.md` (exists before any section is drawn)

Fill **every field in order**; no drawing, no component choice, no hex
lookup until the field above it is complete. Proposed location in the
factory: `site/design-dna/DESIGN-PLAN.md` — the S5a lane's contract
surface, so the build lane reads this file only.

```yaml
# DESIGN-PLAN.md — all fields REQUIRED. Fill top-to-bottom.
# Hard rules (checked before build):
#  - one focus element per section; one accent color page-wide
#  - every spacing ∈ space scale; every type size ∈ type scale
#  - every section.speech_act ∈ rhetoric order below; no orphans

meta:
  site: <slug>
  date: <YYYY-MM-DD>
  sources: [direction.md?, content-outline.md]    # provenance

# ---- 1. Intent (Double Diamond Define / d.school Define) ----
intent:
  who: <one noun phrase — the reader, not "users">
  one_action: <the single verb this page exists to cause>
  worst_case: <what failure looks like — defines what the plan must defend against>

# ---- 2. One idea / tension (Rand, Bierut, Duarte) ----
idea: <one sentence ≤25 words the page argues>
tension:
  what_is: <reader's current pain>
  what_could_be: <promised state>
# Duarte: the page alternates between these two poles.

# ---- 3. Rhetoric sequence (Lupton / Duarte / Ogilvy; §5 order) ----
rhetoric:
  - {act: promise,   question: "what do I get"}
  - {act: proof,     question: "why believe you"}
  - {act: how,       question: "how does it work"}
  - {act: objection, question: "what about X"}
  - {act: act,       question: "what now"}
# MAY reorder/duplicate only by editing this block + logging why.

# ---- 4. Direction — the 4 axes, each a named position ----
direction:
  temperature:   warm | cool | neutral          # locks hue family
  density:       sparse | balanced | dense      # drives ratio + gaps
  finish:        flat | textured | glossy | raw # surface treatment
  type_contrast: serif-display/sans-text | mono-accents | single-family-weight-contrast
  rejected_directions: [{axes: …, why: …}]      # the other moodboards, killed on record

# ---- 5. System numbers — the constraint set, closed ----
system:
  type:
    min: {viewport: 320,  base: 16, ratio: 1.2}
    max: {viewport: 1440, base: 19, ratio: 1.333}
    # emit clamp() steps; ratio chosen per §4.1 density table
    ranks:                                      # 3–5 max, each a tuple
      display: {step: 4,  weight: 700, tracking: -0.02, space_above: 0}
      heading: {step: 2,  weight: 600, tracking: 0,     space_above: 6}   # ×vunit
      body:    {step: 0,  weight: 400, tracking: 0,     space_above: 4}
      meta:    {step: -1, weight: 500, tracking: 0.01,  space_above: 2}
    fonts: {display: <stack>, text: <stack>}    # ≤2 families (Vignelli)
  space:
    vunit: 4px                                  # all values ≡ 0 mod vunit
    scale: [4, 8, 12, 16, 24, 32, 48, 64, 96, 128]
    group_gap: 8                                # inside a group (proximity)
    section_gap: 96                             # between groups — ≥2× group_gap, here 12×
  grid:
    columns: 12
    gutter: 24px
    margin: clamp(24px, 6vw, 96px)
    measure: 62ch                               # Bringhurst 45–75ch
    body_span: 7                                # of 12 cols at desktop
  color:
    temperature: <matches direction.temperature>
    roles:
      bg:        {hex: "#…", why: "…", pair: "ink ≥ 7:1"}
      surface:   {hex: "#…", why: "…", pair: "ink ≥ 7:1"}
      ink:       {hex: "#…", why: "…"}
      ink_muted: {hex: "#…", why: "…", pair: "bg ≥ 4.5:1"}
      accent:    {hex: "#…", why: "…", budget: "≤10% of pixels", pair: "bg ≥ 4.5:1"}
      semantic:  {ok: "#…", warn: "#…", err: "#…"}
    proportions: {dominant: 60, secondary: 30, accent: 10}
  contrast_axes:                                # §2.5 — one axis per relationship
    heading_vs_body: size                       # not size+color+weight stacked
    accent_usage: cta_and_motif_only

# ---- 6. Motif — recurrence + the single break (§2.7) ----
motif:
  device: <e.g. "thin rule + overline kicker above each heading">
  recurs_at: [section_heads, card_titles, footer_mark]
  break: {where: act_section, how: "accent floods background — only place"}

# ---- 7. Per-section plan — composition follows rhetoric ----
sections:
  - name: hero
    speech_act: promise
    composition: split-hero                     # from §5 catalogue
    content_slots: [headline ≤10w, subline ≤20w, cta_label, hero_image]
    emphasis: headline                          # the ONE focus
    align: col-1-edge
  - name: proof-band
    speech_act: proof
    composition: band
    content_slots: [logo_row | stat_row | quote]
    emphasis: density
    align: full-measure
  - name: steps
    speech_act: how
    composition: sequence                       # numbered or alternating
    content_slots: [3×{step_title, step_body}]
    emphasis: numerals                          # motif echoes here
    align: col-1-edge
  - name: faq
    speech_act: objection
    composition: accordion
    content_slots: [4–6×{q, a ≤40w}]
    emphasis: questions
    align: measure
  - name: cta
    speech_act: act
    composition: full-bleed
    content_slots: [closing_line, cta_label]
    emphasis: cta_label                         # the motif break lives here
    align: centered                             # sanctioned exception, logged

# ---- 8. Decision log (append-only) ----
decisions:
  - {n: 1, chose: "ratio 1.2→1.333 fluid", over: "1.25 flat", because: "dense copy, sparse display"}
```

**Execution contract for a weak model:**
1. Sections 1–4 are *prose decisions* — no numbers. Section 5 is *only*
   numbers. Section 7 maps each rhetoric row to one catalogue
   composition — the §5 table is the allowed set.
2. Any blank field, or any literal value outside `system.*` scales =
   plan rejected, back to §1. The plan is the unit of review, not the
   screenshot.
3. Build lanes consume `DESIGN-PLAN.md` exactly as the S5 contract
   already demands for `site/design-dna/`: the file is the authority;
   ad-hoc choices during build are defects, not improvisation.

---

## Sources

- Design Council, "The Double Diamond" — https://www.designcouncil.org.uk/resources/the-double-diamond/
- Stanford d.school, "Design Thinking Bootleg" — https://dschool.stanford.edu/tools/design-thinking-bootleg ; 2010 Bootcamp Bootleg PDF — https://hpi.de/fileadmin/user_upload/fachgebiete/d-school/documents/01_GDTW-Files/bootcampbootleg2010.pdf
- Vitsœ, "Good design" (Rams' ten principles) — https://www.vitsoe.com/gb/about/good-design
- Paul Rand, *Conversations with Students* (Princeton Architectural Press, 2008) — https://books.google.com/books/about/Paul_Rand.html?id=XzXfPFUka-8C ; *A Designer's Art* (Yale, 1985)
- Josef Müller-Brockmann, *Grid Systems in Graphic Design* (Niggli, 1981)
- Robert Bringhurst, *The Elements of Typographic Style*, 4th ed. (Hartley & Marks, 2012); web companion https://webtypography.net/ (§2.1.2 measure, §8 scales)
- Ellen Lupton, *Thinking with Type*, 3rd ed. (Princeton Architectural Press, 2024) — https://thinkingwithtype.com/ ; *Design is Storytelling* (Cooper Hewitt, 2017) — https://designisstorytelling.com/
- Adam Wathan & Steve Schoger, *Refactoring UI* (2018) — https://www.refactoringui.com/
- Michael Bierut, *How to use graphic design to sell things…* (Harper Design, 2015); Design Observer essays — https://designobserver.com/
- Massimo Vignelli, *The Vignelli Canon* (RIT Vignelli Center, PDF) — https://www.rit.edu/vignellicenter/sites/rit.edu.vignellicenter/files/documents/The%20Vignelli%20Canon.pdf
- NN/g, "Mood Boards in UX" — https://www.nngroup.com/articles/mood-boards/ ; Gestalt proximity — https://www.nngroup.com/articles/gestalt-proximity/
- Samantha Warren, "Style Tiles and How They Work," A List Apart (2012) — https://alistapart.com/article/style-tiles-and-how-they-work/ ; Dan Mall, "Element Collages" — https://v3.danmall.com/articles/rif-element-collages/
- Robin Williams, *The Non-Designer's Design Book*, 4th ed. (Peachpit, 2014) — C.R.A.P.
- Tim Brown, "More Meaningful Typography," A List Apart — https://alistapart.com/article/more-meaningful-typography/ ; https://www.modularscale.com/
- James Gilyead & Trys Mudford, Utopia — https://utopia.fyi/ , https://utopia.fyi/type/calculator/ ; Smashing Magazine (2021) — https://www.smashingmagazine.com/2021/04/designing-developing-fluid-type-space-scales/
- Elliot Dahl, 8-Point Grid series, Built to Adapt — https://medium.com/built-to-adapt/intro-to-the-8-point-grid-system-d2573cde8632 , https://medium.com/built-to-adapt/8-point-grid-vertical-rhythm-90d05ad95032
- Jon Yablonski, Laws of UX — https://lawsofux.com/law-of-proximity/
- Material Design 3 color roles — https://m3.material.io/styles/color/roles
- 60-30-10 rule — https://saralynnbrennan.com/the-60-30-10-design-rule/
- WCAG 2.2, contrast minimum — https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
- Nancy Duarte, *Resonate* (Wiley, 2010); sparkline — https://www.duarte.com/blog/ultimate-guide-to-contrast/ ; TED — https://www.ted.com/talks/nancy_duarte_the_secret_structure_of_great_talks
- David Ogilvy, *Ogilvy on Advertising* (1983); AIDA (E. St. Elmo Lewis lineage)
- Stephen Hay, *Responsive Design Workflow* (Peachpit, 2013); Mark Boulton, "Content-out Layout," A List Apart — https://alistapart.com/article/content-out-layout/
- Heydon Pickering & Andy Bell, *Every Layout* — https://every-layout.dev/
- Michael Nygard, "Documenting Architecture Decisions" (2011) — https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions
- Jake Knapp, *Sprint* (Simon & Schuster, 2016) — Crazy 8s
