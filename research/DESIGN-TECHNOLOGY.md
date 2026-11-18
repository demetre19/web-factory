# DESIGN-TECHNOLOGY — what actually produces "design"

Synthesis of three evidence docs, 2026-11-18:

- `research/DESIGN-TECH-EXTERNAL.md` — Google patents: pages are read as
  **role-typed visual blocks**, ordered, before text is scored.
- `research/DESIGN-TECH-METHODS.md` — working idea→design pipelines
  (Relume, PrototypeFlow, Design2Code, Refactoring-UI).
- `research/DESIGN-TECH-SKILLS.md` — agent design skills (impeccable,
  Hallmark, taste-skill, Anthropic frontend-design).

## The answer in one paragraph

"Good design" from a machine is not taste and not prompting. It is a
**commitment pipeline**: classify the surface → deal/generate candidate
directions → pick ONE and write it as a contract → map the contract to
tokens → choose each section's *role + composition* from a catalog →
assemble from owned components → verify with a deterministic linter and
a fresh-context rubric review. Every working system — human agency,
Relume, Hallmark, impeccable — is this same chain wearing different
clothes. Generic output is what the chain produces when steps are
skipped: the model samples the training-data median (indigo buttons,
Inter, icon+heading+text card grids) wherever a decision was never
committed upstream.

## The seven mechanisms, mapped to the factory

| # | Mechanism | Evidence | Our pipeline today | Gap |
|---|---|---|---|---|
| 1 | **Classify first** — every surface gets a mode/kind (Persuade/Operate/Read/Experience; place/product/software) that gates what's allowed | impeccable modes, taste-skill business-kind classifier | `page_class` (money/article/ancillary) exists — SEO-side only | Not wired to design: no "this page type allows/forbids these compositions" lookup |
| 2 | **Dealt direction** — a script, not the model, picks which candidate directions get considered; catalog + dice kill convergence | impeccable concept-seed, Hallmark deal/draw + log dedup, taste-skill dealers; counter-evidence: text-only skills "always output the same structure" | MANIFEST roles pick *sources*, not directions; one direction per run, model-generated | No catalog, no dealing. Every run converges on the model's safe answer |
| 3 | **Direction contract before code** — ~150 words: thesis, palette+type, first-viewport composition, ONE signature moment, **what it refuses** | impeccable direction contract (6 blocks); Anthropic two-pass (plan→self-review→build, 75% A/B win); Hallmark Picks stamp | DESIGN.md/CHARACTER.md capture decisions+whys — but after the fact, as description not commitment | Contract is descriptive, not generative: no "refused default", no signature moment, no first-viewport spec |
| 4 | **Tokens = decisions as data** — semantic names carrying role+rationale, one global artifact every downstream file reads | DTCG spec, Material 3, design-system skill's DESIGN.md contract | TOKENS.json + provenance — DONE correctly | None |
| 5 | **Section = selected composition, not generated layout** — role-typed block + catalog composition + emphasis pick, per-section row | Patents (block roles, block-ordering objective, uniform card anatomy, centerpiece); Relume 1,000-component library; Hallmark 21 macrostructures + anatomy-by-job | PAGES SPEC has per-section rows but composition is *written freehand* each time — the model still invents `grid lg:grid-cols-2` per section | THE core gap: no section-archetype catalog, no role taxonomy, no repetition rule |
| 6 | **Assembly = owned components** — one class owner, retrieval+composition not free generation | Relume selection, PrototypeFlow RAG, our own one-class-one-owner | CLASS-SYSTEM.md + COMPONENTS.md — DONE correctly | None |
| 7 | **Verification = linter + fresh-context rubric** — deterministic rule scan of output + separate agent returning ship/fix/rebuild | impeccable 62-rule detector, Hallmark ~90-gate sloplint at 8 widths, Design2Code/Sketch2Code proof weak models can't self-critique but CAN run binary rubrics | Banned-pattern list exists **as prose the model self-checks** — the weakest possible form | No linter script; no fresh-context design review agent; self-lint is honor-system |

## What the Google patents add (design-side, not SEO-side)

The patent chain (`DESIGN-TECH-EXTERNAL.md`) converges on the same
answer from the reader's side: a page is evaluated as a sequence of
role-typed blocks — segmentation, block-type classification, order
checks ("was this block swapped?"), one centerpiece, label→value card
anatomy. Design rules that fall out:

- **Every section needs a declared role** (`hero/answer`, `proof`,
  `detail`, `compare`, `action`, `supplementary`) — role-typing is what
  makes block order auditable and repetition detectable.
- **Canonical order per page type**: centerpiece first; supplementary
  never before it. Layout IS the page declaring its type.
- **DOM order = visual order**, first ~400 chars after H1 carry
  entity+predicate+function, page furniture never sits inside that
  window. (Partially covered by the fold-quad contract; the 400-char
  discipline is new.)
- **Uniform card anatomy** — repeated entities as rigid label→value
  structures, visible text labels, same slots.
- **Cost hygiene** — small DOM, no spacer divs, server-rendered
  centerpiece. Already aligned (zero-hydration baseline).

## Why our current output is still generic

We built steps 4 and 6 well, and step 7 as prose. The generic look is
step-5 failure: **section composition is the only decision left to the
model's default**, so every page converges on
`heading + 3-icon-card grid → 2-col text/media → cards → CTA`. The
skills (visual-character) govern the skin — type/color/space/finish —
which is why our pages are *styled* consistently but *shaped*
identically. Shape was never catalogued or dealt.

## Proposed mechanism for the pipeline (proposal, not committed)

### A. Section archetype catalog — `research/` or `skills/` asset

A finite registry of section compositions a distill lane *selects*
from, never invents. Each row:

```
id           role        composition                    constraints
split-media  answer      text | media, 45/55, CTA left   hero or once per page
proof-band   proof       rating + quote + link, 3-zone   directly after hero
cards-N      detail      N≤4 uniform cards, label slots  max 2 card sections/page;
                                                         adjacent card sections banned
list-rows    detail      numbered/timeline rows         not for non-sequences (ban check)
full-bleed   action      deep surface, centered CTA      ≤2/page
compare      compare     table or 2-col contrast         money pages only
editorial    detail      measure 65ch, pull-quote slot   article/ancillary
```

Plus page-type → canonical role sequences (money page:
`answer→proof→detail→detail→action→supplementary→action`). This turns
layout into **selection from an enumerated set** — the exact move that
makes weak models reliable (Relume, Sketch2Code findings).

### B. Direction deal — small script + catalog

`tools/site-intake/` already deals *captures*; add a direction deal:
catalog of N "materials" (each = palette + type voices + finish +
signature-moment type + one rendered reference), script deals 2–3 per
run, the designer picks ONE and writes the direction contract into
`DESIGN-DNA.md` (thesis / palette / type / first viewport / signature /
refused). Hallmark's deal-log pattern (fingerprint prevents consecutive
runs converging) is a 20-line addition.

### C. Deterministic linter — `tools/design-lint/`

Node script over emitted `dist/` HTML + compiled CSS: the banned list
already in the spec (emoji, gradient text, eyebrow reflex, side-stripe
borders, ghost-cards, bounce easing, hero-metric reflex, >2 deep
sections, repeated section composition, accent over-use) as executable
rules with IDs. Zero LLM; runs in S7 gate; findings return as a fix
list. This is the single highest-leverage piece — it converts the
existing prose bans from honor-system to gate.

### D. Fresh-context rubric review — designer-alt lane or reviewer agent

After build, a separate agent reviews rendered screenshots at 3
viewports against a binary checklist (squint test, lineup test, fold
quad, one-primary-per-viewport, composition-variety) and returns
`ship | fix | rebuild` with named findings. Weak models can execute
binary rubrics; they cannot self-critique — so the reviewer is a
different context.

## What to steal verbatim

1. impeccable's **"writing code before the deal is a contract
   violation"** — the deal must be a mint precondition, not a prompt.
2. impeccable's hard ban list + Hallmark's ~90 gates → our linter rules
   (both are inspectable sources).
3. impeccable's direction contract format (THESIS / OWN-WORLD / STORY /
   FIRST VIEWPORT / FORM / refused).
4. Hallmark's **anatomy-by-job**: a lookup table of where real sites in
   a category put the action — ours is `gbp_primary_category`-keyed.
5. Anthropic's two-pass: plan in prose → "if any part reads like the
   generic default… revise, say what changed" — cheap, already half-done.
6. `google-labs-code/design.md` spec (YAML token frontmatter + ≤8
   prose sections) as candidate format for DESIGN.md — machine+human
   readable in one file.

## What NOT to steal

- More prompt prose alone (text-only skills still converge).
- Fixed theme catalog with no dedup (monoculture critique of Hallmark).
- Any step asking the model "does this look good" without a rubric.
- Asking the weak model clarifying questions (Sketch2Code: empirically
  fails — pre-supply artifacts instead).

## Immediate actionable deltas to the S5 spec

1. `PAGES/<slug>/SPEC.md` gains a **required `role` + `composition id`
   per section** — compositions come from the archetype catalog;
   freehand grids are refuse.
2. `DESIGN-DNA.md` gains a **Direction Contract block** (thesis /
   signature moment / refused default / first-viewport composition).
3. Distill lane gains a **direction-deal step** before spec writing
   (catalog + deal + pick + contract).
4. New `tools/design-lint` — banned list becomes executable S7 gate.
5. New rubric-review artifact (`design-dna/REVIEW.md` or S7 output):
   fresh-context agent, binary checklist, ship/fix/rebuild.

None of this is committed — it's the proposal set for the next spec
amendment round.
