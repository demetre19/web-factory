# DESIGN-TECH-METHODS — How idea → design actually works (evidence)

Researched 2026-11-18. Question: what *mechanism* turns an idea into concrete,
non-generic design decisions — and which parts can be encoded as artifacts a
weak model can execute? Companion to the S5 distill/build spec
(`WEB-FACTORY-S5-DESIGN-DNA.md`).

## 0. Thesis

- Generic AI output is not a taste failure; it is a **missing-commitment
  failure**. Left unconstrained, models sample the median of their training
  data — hence "purple-to-cyan gradient, glassmorphism, Inter everywhere,
  three-card grid, icon + heading + two lines of text." The fix reported by
  practitioners is not better prompting but **pre-decided inputs**: structure
  first, styling second, constraints as data.
  Sources: https://mohitphogat.medium.com/ai-design-slop-why-every-ai-built-interface-looks-the-same-and-how-to-fix-it-bf874e0b470c ,
  https://www.figma.com/blog/designer-framework-for-better-ai-prompts/
- Every observed working pipeline — human or machine — interposes the same
  intermediate artifacts between *idea* and *code*: **brief → sitemap/route
  list → section wireframes → style decision (tokens) → assemble → critique
  loop**. Relume ships this as literal product tabs: "Brief, Sitemap,
  Wireframe, Style Guide, Design, then Share/Export."
  Source: https://uichemy.com/blog/relume-figma-kit/
- Figma's own prompting guidance reframes design work as "collapsing
  uncertainty into structure": LLMs are stochastic, design is "precise,
  repeatable, intentional" — the artifact's job is to remove the model's
  freedom to guess.
  Source: https://www.figma.com/blog/designer-framework-for-better-ai-prompts/

## 1. How design systems encode taste — mechanical vs judgment

### 1a. What's mechanical (encodable as checklist/rubric/JSON)

| Domain | Mechanical rule | Source |
|---|---|---|
| Spacing | 8dp base grid; all spacing/sizing multiples of 8; "decreases the number of decisions to be made" | https://medium.com/design-bootcamp/designing-in-the-8pt-grid-system-f3c1183ea6e8 |
| Touch targets | ≥8dp separation between targets promotes "balanced information density and usability" | https://m2.material.io/design/usability/accessibility.html |
| Contrast | WCAG minimums: 4.5:1 body text, 3:1 large text (18px+) | https://github.com/wondelai/skills/blob/main/refactoring-ui/SKILL.md |
| Type scale | Modular scale ~1.2× per step: 12/14/16/18/20/24/30/36px; headings line-height 1.0–1.25, body 1.5–1.75; ≤2 font families | https://github.com/wondelai/skills/blob/main/refactoring-ui/SKILL.md |
| Spacing scale | Fixed set 4/8/16/24/32/48/64px; space between groups > space within groups (Gestalt proximity as numeric rule) | https://github.com/wondelai/skills/blob/main/refactoring-ui/SKILL.md , https://www.nngroup.com/articles/gestalt-proximity/ |
| Line length | Constrain text to 45–75 chars (`max-w-prose`); forms 300–500px; "full-width is almost never right" | https://github.com/wondelai/skills/blob/main/refactoring-ui/SKILL.md |
| Color | 5–9 shades per color (50–900); darkest ≠ pure black (`#111827`); tint grays with hue; HSL shade derivation rules | https://github.com/wondelai/skills/blob/main/refactoring-ui/SKILL.md |
| Depth | Shadow scale = elevation semantics: `shadow-sm` buttons, `shadow-lg` dropdowns, `shadow-xl` modals; two-part shadows | https://github.com/wondelai/skills/blob/main/refactoring-ui/SKILL.md |
| Alignment | Left-align by default; center only heroes/short headlines/single-CTA; "consistent left edge gives the eye a fixed return point" | https://github.com/wondelai/skills/blob/main/refactoring-ui/SKILL.md |
| Gestalt | Proximity (spacing>grouping), similarity, figure-ground are stated as if/then rules usable as audit checks | https://www.nngroup.com/articles/gestalt-proximity/ , https://www.figma.com/resource-library/gestalt-principles/ |
| Scan patterns | F-pattern for dense content, Z-pattern for simple → dictates CTA/heading placement; rule-like | https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/ , https://www.nngroup.com/articles/visual-hierarchy-ux-definition/ |
| Tokens-as-data | Design tokens = "expressing design decisions in a platform-agnostic way" — name/value/type/description, aliases, composite tokens; stable W3C DTCG Format spec (Oct 2025) | https://www.designtokens.org/tr/2025.10/format/ |
| Token semantics | Material 3: "each token is named for how or where it's used" — naming is itself a decision-encoding mechanism (`color-text-primary` not `blue-500`) | https://m3.material.io/foundations/design-tokens |

**Refactoring UI as proof of encodability:** its 8-row yes/no "Quick
Diagnostic" (hierarchy reads when squinted? works in grayscale? spacing on
scale? labels de-emphasized? width constrained? contrast OK? shadows match
elevation?) plus a scoring function `score = round(satisfied/8 × 10)` is a
complete design audit a weak model can execute mechanically — it is already
packaged as an agent skill.
Source: https://github.com/wondelai/skills/blob/main/refactoring-ui/SKILL.md

### 1b. What remains judgment (needs an upstream committed choice, not a rule)

- Which **mood/direction** the design has. HIG/Material express principles,
  not which direction to pick; NN/g says moodboards exist precisely because
  adjectives ("motivational, energetic") don't disambiguate visual choices.
  Source: https://www.nngroup.com/articles/mood-boards/
- Which of several valid layouts fits *this* content hierarchy — depends on
  the content's priority order, not a rule. Atomic design's "template" stage
  exists to articulate content structure before content.
  Source: https://atomicdesign.bradfrost.com/chapter-2/
- Whether a deviation is a deliberate accent or an error — needs a stated
  design intent to compare against. (This is why design rationale matters:
  without the recorded decision, a reviewer can't distinguish choice from
  noise.)
- Emphasis distribution inside a section (which single element gets "all
  three" of size/weight/color levers). The rules cap the palette; the *pick*
  per section is judgment — but it can be **delegated upstream** into a
  per-section spec row.
  Source: https://github.com/wondelai/skills/blob/main/refactoring-ui/SKILL.md

**Encoding consequence:** judgment doesn't disappear — it gets *moved*. Each
judgment call becomes a row in an artifact (moodboard choice, per-section
spec, token value) made once at a stage where the model has full context,
rather than re-made implicitly per component where it drifts to the default.

## 2. LLM design-generation pipelines that actually work

| Tool/system | Pipeline mechanism | Evidence |
|---|---|---|
| **Relume** | Literal artifact chain as product tabs: Brief → Sitemap → Wireframe → Style Guide → Design → Export. Brief yields full sitemap; wireframes assembled from a 1,000+ component library (structure is *selected*, not generated); style guide applied after structure is fixed. "Structure first, styling second." | https://uichemy.com/blog/relume-figma-kit/ , https://www.relume.ai/ |
| **Figma Make** | Structured context beats prose: TC-EBC prompt format (Task, Context, Elements, Behavior, Constraints); Figma *frames* supplied as structured design data outperform screenshots ("already written in a language it understands"); libraries + guidelines + MCP connectors as constraint layers; model choice per task. | https://www.figma.com/blog/designer-framework-for-better-ai-prompts/ , https://www.figma.com/blog/8-ways-to-build-with-figma-make/ |
| **PrototypeFlow** (academic, UIST'24) | Multi-module, top-down: a central **Theme Design module** first produces a global theme description + component-level specs (a natural-language DSL), then orchestrates sub-modules (text, image, icon) with a RAG knowledge base of 22k real UIs. "Editable checkpoints" at every stage; theme is a global parameter — change it and everything downstream regenerates. Key designer demands: prompt enhancement to clarify intent, and thematic consistency enforced by a single controller, not left to per-component generation. | https://arxiv.org/html/2412.20071v3 |
| **v0 / screenshot-to-code class** | Direct prompt → code; quality is driven by the fixed design system underneath (shadcn/Tailwind defaults). No intermediate artifacts — quality ceiling is the system's, not the prompt's. | https://vercel.com/academy/ai-sdk/ui-with-v0 , https://www.mindstudio.ai/blog/what-is-vercel-v0 |
| **Design2Code** (Stanford benchmark) | Screenshot → HTML directly fails mostly on *layout* and *element recall*, not text. Two encodable fixes worked: (a) **text-augmented prompting** — extract the text first so the model only does layout; (b) **self-revision loop** — render own output, screenshot, compare to reference, revise. Weak models *can't* self-revise (open-source models got worse), but frontier models gain steadily; GPT-4o improves on HARD set via revision. Humans judge on high-level features (layout/color/blocks) not text detail — so visual diff ≈ human judgment proxy. | https://arxiv.org/html/2403.03163v3 |
| **Sketch2Code** (SALT-NLP, NAACL'25) | Sketch → code benchmark; interactive loop where agent gets feedback or asks questions. All models improved with feedback-following (up to +7.1% visual similarity in 5 rounds); question-asking barely worked — models are bad at knowing what to ask. Implication: supply the clarification artifact (brief/spec) *before* generation rather than relying on the model to elicit it. | https://salt-nlp.github.io/Sketch2Code-Project-Page/ , https://arxiv.org/html/2410.16232v1 |

**Convergent mechanism across all of them:**
1. **Intent clarification is a separate stage** (Relume brief, TC-EBC,
   PrototypeFlow prompt enhancement) — the model writes its own spec first.
2. **Structure precedes style** — wireframe/sitemap artifacts freeze layout
   and route decisions before any tokens are picked.
3. **A single theme/style artifact is global state** — one controller writes
   it, every downstream component reads it. PrototypeFlow's central theme
   module and Relume's Style Guide are the same artifact.
4. **Assembly is retrieval+composition, not free generation** — Relume's
   1,000-component library, PrototypeFlow's RAG knowledge base, v0's shadcn
   system. The model *selects and arranges* vetted structures.
5. **Critique is a render-compare loop** — Design2Code's self-revision and
   Sketch2Code's feedback-following both need a *reference artifact* to diff
   against. Weak models need an external checklist instead (Refactoring-UI
   style rubric), since they fail at open-ended self-critique.

## 3. Techniques for forcing commitment instead of defaults

| Technique | Mechanism | Evidence |
|---|---|---|
| **Design tokens as recorded decisions** | The DTCG spec's own definition: tokens are "a methodology for expressing design decisions." Each token = decision + name + provenance ($description field exists to carry rationale). Semantic naming (`text-primary` vs `blue-500`) forces role-vs-appearance commitment. | https://www.designtokens.org/tr/2025.10/format/ , https://m3.material.io/foundations/design-tokens |
| **Structured brief format (forced fields)** | TC-EBC: Task/Context/Elements/Behavior/Constraints. Empty-field discipline forces the intent to be explicit before generation; Figma shows the same prompt rewritten yields visibly better output. Works because models can't ask good clarifying questions (Sketch2Code finding). | https://www.figma.com/blog/designer-framework-for-better-ai-prompts/ , https://salt-nlp.github.io/Sketch2Code-Project-Page/ |
| **Forced-choice between committed directions** | NN/g: make *several* moodboards, then pick one — the artifact is the choice among alternatives, not the board itself. One board per distinct direction ("if you have several distinct visual concepts, make separate boards instead of squeezing them"). | https://www.nngroup.com/articles/mood-boards/ |
| **Moodboard → token mapping** | Moodboard fixes the unencodable (feeling/direction); the mapping step converts it into encodable rows: 4–5 mood words → palette + type + texture tokens. NN/g notes moodboards' actual output is "the product's primary UI colors and visual design identity" and "can be used later to inspire a visual style guide." | https://www.nngroup.com/articles/mood-boards/ |
| **Reference deconstruction (copy structure, not skin)** | Extract a reference site's *decision set* — colors by role, type scale per heading, spacing scale, shadow ladder, component specs — as structured JSON; then re-skin with your tokens. Automation makes this mechanical: computed-style extraction dedupes colors, infers the spacing scale (4/8px base), and emits a tokens-shaped styleguide. | https://www.context.dev/blog/how-to-reverse-engineer-any-websites-design-system |
| **Banned-defaults / negative constraints** | The anti-AI-slop pattern is a denylist: purple-cyan gradients, glassmorphism+neon, Inter, uniform 3-card icon grids, gratuitous bounce animations. Encodable verbatim as a lint/checklist gate. Figma's revision-prompt guidance confirms the *Constraints* field is where "what the tool should NOT be adjusting" lives. | https://mohitphogat.medium.com/ai-design-slop-why-every-ai-built-interface-looks-the-same-and-how-to-fix-it-bf874e0b470c , https://www.figma.com/blog/designer-framework-for-better-ai-prompts/ |
| **Global theme as single source of truth** | One artifact (theme description / TOKENS.json) written once, read by every component generator; change propagates downstream. Prevents per-component drift — the "green component in a blue theme" failure designers flagged. | https://arxiv.org/html/2412.20071v3 |
| **Selection over generation** | Assembling wireframes from a fixed component library (Relume: 1,000+ sections) makes layout a classification problem — pick rows from a known set — which weak models do far better than inventing structure. | https://www.relume.ai/ , https://uichemy.com/blog/relume-figma-kit/ |
| **Checklist scoring rubric for critique** | Refactoring-UI's 8 yes/no diagnostics → numeric score. Weak models can't self-critique (Sketch2Code/Design2Code findings), but they can answer 8 binary questions against a rendered page or spec — that's the critique stage encoded. | https://github.com/wondelai/skills/blob/main/refactoring-ui/SKILL.md , https://arxiv.org/html/2403.03163v3 |

## 4. Human designer process → which steps a weak model can run

Observed non-generic human/agency process (NN/g, Clio, practitioner docs):
**brief → concept/moodboard → grid + type scale → section wireframes →
art-direction pass → critique.**

| Human step | What it decides | Artifact that captures it | Weak-model feasibility |
|---|---|---|---|
| Brief | Goal, audience, CTA, constraints | TC-EBC-structured brief (factory already has `site-brief.md`) | Easy — fill fixed fields from intake; verified input beats elicitation |
| Concept / moodboard | Visual direction: mood words → palette/type/texture direction | Picked-direction card: 4–5 mood words + token-relevant refs (MANIFEST roles: `baseline`/`inspiration`/`variant` already encode this) | Feasible *if* forced-choice format: emit N direction cards, human/rubric picks one. NN/g: boards exist because adjectives don't disambiguate |
| Grid + type scale | The mechanical system | `TOKENS.json` (spacing scale, type scale, color ladder, shadow ladder, radii) — DTCG format | Fully mechanical: scales are finite enumerated sets; rules in §1a are all checkable |
| Section wireframes | Per-section structure + content skeleton + emphasis | `PAGES/<slug>/SPEC.md` rows: component chosen from library + slot list + hierarchy note (which element gets size+weight+color) | Feasible as **selection**: pick from component-library rows; the "template" stage of atomic design is exactly a content-skeleton spec |
| Art-direction pass | Per-section exceptions, imagery treatment, rhythm variation | Override rows in SPEC.md ("break the grid here deliberately; hero image bleeds left") + banned-defaults list | Partially — needs forced-choice per section ("vary treatment; feature some items, minimize others" is a rule, but *which* item is judgment) |
| Critique | Does it violate any rule? Does it look generic? | 8-row binary rubric (Refactoring UI diagnostic) + render-compare vs reference screenshot | Encoded checklist = feasible; open-ended self-critique = proven to fail on weak models (Design2Code/Sketch2Code) |

Two pipeline design consequences:

- **Never let layout be free-generated at component level.** Weak-model wins
  come from (a) picking from enumerated options (component library, direction
  cards, finite scales) and (b) executing rubrics — both are classification,
  not creation. Free generation is where the generic-median collapse happens.
- **Every judgment call becomes a pre-committed row.** The distill packet's
  `TOKENS.json` + per-route `SPEC.md` + `DESIGN-DNA.md` provenance already
  implement the working shape; the missing pieces per this research are the
  **direction card** (forced choice upstream) and the **banned-defaults +
  rubric gate** (critique downstream).

### Bottom line for the factory

The working mechanism across all sources is **commitment artifacts +
selection + rubric critique**, never "model has taste":

1. Brief artifact with forced fields (already exists).
2. **Direction card** — forced choice among 2–4 committed visual directions
   (the artifact the pipeline currently lacks; closest to moodboard→token).
3. `TOKENS.json` — mechanical system, DTCG-shaped.
4. Per-route `SPEC.md` — section structure chosen from a component library,
   emphasis flagged, overrides written as rows.
5. Class-system components — assembly, not free generation.
6. Rubric + banned-defaults gate — binary checks, because weak models can't
   do open-ended self-critique (Design2Code, Sketch2Code both confirm).

## 5. Comparison table — technique → mechanism → encodable as artifact?

| Technique | Mechanism | Encodable as artifact? | Source |
|---|---|---|---|
| 8dp spacing grid / constrained spacing scale | Reduces decision space to a finite set; rules out arbitrary values | YES — token table + lint rule (non-multiple = defect) | https://medium.com/design-bootcamp/designing-in-the-8pt-grid-system-f3c1183ea6e8 |
| WCAG contrast minimums | Numeric threshold per text size | YES — computed check on rendered DOM | https://github.com/wondelai/skills/blob/main/refactoring-ui/SKILL.md |
| Modular type scale (~1.2×) | Enumerated size set + context line-height rules | YES — `TOKENS.json` + audit check | https://github.com/wondelai/skills/blob/main/refactoring-ui/SKILL.md |
| Gestalt proximity as spacing rule | between-group > within-group spacing | YES — measurable on computed styles | https://www.nngroup.com/articles/gestalt-proximity/ |
| Shadow ladder = elevation semantics | Fixed map: element role → shadow step | YES — class-system row + audit | https://github.com/wondelai/skills/blob/main/refactoring-ui/SKILL.md |
| Design tokens (DTCG format) | Decisions as named, typed, referenceable JSON values | YES — the artifact *is* the mechanism | https://www.designtokens.org/tr/2025.10/format/ |
| Semantic token naming | Role-vs-appearance commitment in names | YES — naming lint in class system | https://m3.material.io/foundations/design-tokens |
| Atomic design hierarchy | Components composed atoms→organisms; templates = content skeleton, pages = real content | YES — COMPONENTS.md / SPEC.md structure mirrors it | https://atomicdesign.bradfrost.com/chapter-2/ |
| Brief → sitemap → wireframe → style → design (Relume) | Ordered artifact chain; structure frozen before style | YES — stage sequence + per-stage file contracts | https://uichemy.com/blog/relume-figma-kit/ |
| Central theme controller (PrototypeFlow) | One module writes global theme spec; sub-modules read it; editable checkpoints | YES — DESIGN-DNA.md as theme artifact + per-stage files | https://arxiv.org/html/2412.20071v3 |
| Prompt enhancement / intent clarification | Model expands vague brief into explicit fields before generating | YES — TC-EBC-shaped brief artifact | https://arxiv.org/html/2412.20071v3 , https://www.figma.com/blog/designer-framework-for-better-ai-prompts/ |
| Text-augmented generation (Design2Code) | Supply extracted text so model only does layout | YES — content files already exist upstream in pipeline | https://arxiv.org/html/2403.03163v3 |
| Self-revision render-compare loop | Render output, diff vs reference, regenerate | PARTIAL — works on frontier models, fails on weak models; weak-model substitute is checklist rubric | https://arxiv.org/html/2403.03163v3 |
| Feedback-following (Sketch2Code) | Multi-round instruction → regenerate, steady gains | YES — critique file as structured edits, not open chat | https://salt-nlp.github.io/Sketch2Code-Project-Page/ |
| Question-asking for clarification | Model asks what it needs | NO — empirically ineffective; pre-supply the artifact instead | https://arxiv.org/html/2410.16232v1 |
| Moodboard / direction card | Commits unencodable "feeling" into pickable directions | PARTIAL — the *choice* is judgment; the *comparison* is a forced-choice matrix a weak model can present | https://www.nngroup.com/articles/mood-boards/ |
| Reference deconstruction → token JSON | Copy structure (roles, scales, ladders) not skin | YES — computed-style extraction is fully mechanical | https://www.context.dev/blog/how-to-reverse-engineer-any-websites-design-system |
| Banned-defaults denylist | Named anti-patterns rejected at gate | YES — checklist/lint rows | https://mohitphogat.medium.com/ai-design-slop-why-every-ai-built-interface-looks-the-same-and-how-to-fix-it-bf874e0b470c |
| Selection from component library | Layout choice = pick from enumerated vetted structures | YES — COMPONENTS.md row IDs per SPEC.md section | https://www.relume.ai/ , https://uichemy.com/blog/relume-figma-kit/ |
| 8-question design rubric with scoring | Binary diagnostics → numeric gate | YES — audit checklist exactly as the skill encodes it | https://github.com/wondelai/skills/blob/main/refactoring-ui/SKILL.md |
| Per-section emphasis pick | Which element gets all three hierarchy levers | PARTIAL — rule-bounded judgment: encode as a forced-choice row in SPEC.md so the decision is committed upstream, not sampled per component | https://github.com/wondelai/skills/blob/main/refactoring-ui/SKILL.md |
| Structured data context over screenshots (Figma) | Frames/JSON context outperforms image context | YES — distill packet is already structured data; prefer token/spec context over screenshots downstream | https://www.figma.com/blog/designer-framework-for-better-ai-prompts/ |

