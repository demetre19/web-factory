# DESIGN-PLAN.md — the artifact that exists before any page is drawn

Required distill output at `site/design-dna/DESIGN-PLAN.md`. On the
refs branch it is written **before** `PAGES/*/SPEC.md`, before
`TOKENS.json` is finalized, before any preview HTML. If it isn't in
the plan, it does not exist — same contract the Design-library uses
for its Package A ("the designer has no conversation history; the
plan has to live in files").

Two layers under this file: `docs/machinery/design/rules/` (the closed
sets — typography rules, typeface directory, measure/leading bounds,
anti-stretch, hero/subhead ratios) and `docs/machinery/SECTION-CATALOG.md`
(the section compositions the primitives assemble into). The plan
picks *from* them; it never invents values outside them.

Every rule ID is gated: `docs/machinery/design/enforcement.json` maps
it to a script, a reviewer rubric item or an operator approval, and
`gate.py coverage` fails if any ID is unenforced. Section mechanics:
`docs/machinery/design/SECTION-BUILD.md`.

Schema source: `research/DESIGN-FORETHOUGHT.md` §6 + the
surface/density vocabulary the Design-library already ships
(`01-CONTRACTS.md` §1.2) + `SECTION-CATALOG.md` (vendored here, not
re-derived).

**Authority order** (F16): this file is the single authority for
intent, direction, system numbers, and per-section plan rows.
`INTENT-BRIEF.md`, `CHARACTER.md`, `DESIGN.md` are *inputs* the plan
consolidates (or views generated from it) — on conflict, the plan
wins and the stale doc is updated, not argued with.

**Cardinality** (F3): one file per site. `site:` block is shared;
`pages:` is a map — one entry per route/SPEC. A page entry holds its
own `intent`/`idea`/`rhetoric`/`sections`.

**DOX branch** (F1): on `design_mode: dox` the packet's SPECs are
authority — they are copied verbatim and are *exempt* from the
row-copy acceptance. DESIGN-PLAN on this branch is a *derivation
record*: `site:` + `direction`/`system` filled from the packet's
`SYSTEM/*` + `design-manifest.json` sections[] (which already carry
category/surface/density), with `pages.<slug>.sections[]` rows adding
the `speech_act`/`composition` assignment the packet lacks. Written
after flatten, not before SPECs.

## The cascade — nine waves, gated at every step

Design is produced in the waves the machinery gates (`design/INDEX.md`,
`gate.py w0..w8`). Each wave *consumes the wave above as a closed set*
— a wave may select, it may never invent. A wave that reaches past its
inputs (a page inventing a colour, a component setting its own spacing)
is the design-DNA loss this file exists to prevent.

| Wave | Artifact | What it decides | Gate that opens the next wave |
|---|---|---|---|
| **W0** scaffold | `site/` from `templates/astro/` | The one Astro + Tailwind project | `gate.py w0` — scaffold, pins, build exits 0 |
| **W1** DNA + audit | this file's `site:`; `audit.md`; `MOBBIN-REFS.md`; **`DNA.json` v0 at exit** | Intent, the six direction axes, the map (profile + genotype + seeded knobs + vector targets) | `gate.py w1` + `gate.py dna` — Mobbin, intent, audit, genotype total, map complete and provenance-tagged |
| **W2** content | STUB → content inventory | Copy contract: heading vector + `fs` + body blocks | `gate.py w2` — inventory complete, verbatim headings |
| **W3** layout round | `options:` — ≥5 layout cards on real copy; `pages.<slug>.sections[]` 1:1 from the picked card (`wf_ref`) + `sections/*.contract.json` | The argument as boxes; the layout lock | `gate.py w3` — ≥5 options, ≥30% pairwise distance, data-* 1:1, rhythm/motif, vector, genotype, contracts |
| **W4** look round | `options:` — 3 visual directions as distinct genotype vectors on the picked layout | The aesthetic, chosen by the operator | `gate.py w4` — axes ∈ enums, ≥2 distinct genotypes, burst declared |
| **W5** system | `system:` → `TOKENS.json` → `tailwind.config` + `global.css` + `preview/system.html` | Every number bound, rendered on the tile | `gate.py w5` — enums, spacing, breakpoints, contrast, config derived |
| **W6** components | `src/components/sections/<Sec>.astro` per section + `src/components/*.astro` + tile | Each section built and gated alone | `gate.py w6` — shell, allowed classes, section gates, exemplars, build 0 |
| **W7** page | `assemble.py` → `src/pages/<slug>.astro`; `dist/` | The page, assembled mechanically from plan order | `gate.py w7` — assembly, data-* 1:1, verbatim headings, speed, mobile, PS.1–PS.6 |
| **W8** review | independent `REVIEW.json` + screenshots 1280/768/360; `SCORECARD.json` | The verdict, by a different model | `gate.py w8` — review complete, every section ≥ 90, style rubric |

**Order note:** W3 (boxes) precedes W4–W7 deliberately — the argument
is verified cheaply *before* the system spends a pixel, and each
section is built and gated in isolation (`SECTION-BUILD.md`). The page
file is generated (`assemble.py`), never written by a model.

**The gates are mechanical, not review.** W0 is the build; W1–W5 are
field/enum/arithmetic checks; W6 is the per-section gate; W7 is the
assembly + rendered-page checks; W8 is the independent rubric. The
designer model never writes `GATES.json` or `REVIEW.json` — QA is
never self-graded.

**All-fluid rule** (the "automatic CSS" level): `system.type` is a
`clamp()` scale (Utopia), `system.space` is the G.1 set applied
everywhere, `system.color` is the C.1 6-role map, `system.grid`
`edge_padding`/`breakpoints`/`stack_order` is R.2's closed ramp.
Nothing downstream of W5 chooses a number — it binds a token. A
literal `px`/`hex`/`rem` in page or component code that isn't a token
reference is a refuse, same class as a literal hex outside TOKENS.

**The index** (where each agent reads): W1 `direction` + `dna` → W3
`sections[].surface/.density/.composition` + the section's
`contract.json` → W5 `system.*` → W6 the rules its CARD names. An agent at
any wave has *exactly one* upstream artifact to consult; it never
reaches two waves up, never sideways. If a field it needs isn't filled
above, the correct move is `prd_step` back, not a default.

## Fill order

1. `site:` prose decisions (§1–4) — written first, from brief + audit.
2. Refs/guideline extraction pass — read captures/manifest/guideline
   site; list candidate tokens with provenance tags (§Guideline
   prefill). Design guideline → `system:` fields; content guideline →
   `rhetoric`/`copy` fields only.
3. `system:` numbers (§5) — filled *after* the extraction pass (F9).
   `extracted`/`snapped` values override plan defaults; `inferred`
   fields stay open until operator-confirmed; every override is
   logged in `decisions[]`.
4. `pages:` map — per route, its own intent/idea/rhetoric/sections.
5. **ASCII draft + critique** — render the money page's `sections[]`
   as ASCII boxes — the **full page skeleton on two canvases**,
   ~40–80 lines each: 1440px *and* 360px side by side, one labeled
   box per row, annotated with
   `speech_act`/`surface`/`density`/`composition`/`stack`, contrast
   moment and S-M-L rhythm marked. The 360 canvas verifies the
   mobile skeleton: every `split-media`/grid row collapsed per
   R.3, `stack: text-first` order actually rendered (headline
   before media), above-fold five elements present at 360×640 — then
   run the
   the cheap draft surface the critique loop works on: adjacency
   violations, flat clustering, a missing contrast moment, a wrong
   composition pick all get caught and fixed in the `sections[]` rows
   before any HTML exists. It answers "are the boxes right" — it
   cannot answer typography, colour, or feel (that's
   `preview/system.html`). Not a committed artifact; the sketch lives
   in the lane's working notes, the fixes land in `decisions[]`.
   This is the W3 gate — the page argument is verified as *boxes*
   before a single pixel is spent; the rows then become the section
   contracts (`gate.py contracts`).
6. `preview/system.html` next — every surface × every density × every
   type rank × buttons/fields/cards — then page previews (F6).
   DOX branch: copy packet `designs/design-system.html` to
   `preview/system.html` rather than regenerating. Template/exemplar:
   `templates/system-tile/` — the colour system section is mandatory:
   every agent downstream reads roles from it. This is the W5
   gate — the *system* is verified on a tile before any page exists.
7. W6/W7 downstream — one builder per section returns
   `src/components/sections/<Sec>.astro` (contract + card + exemplar
   only); `COMPONENTS.md` names the component each `composition`
   instantiates; `assemble.py` writes `src/pages/<slug>.astro` from
   plan order (SB.4). No model writes the page or its glue.

## Guideline prefill — extraction with a confidence model

When the operator supplies a guideline site (URL or capture — for
design *or* content), the refs pass (step 2) is not a read-through;
it is an extraction pass that pre-fills this file. Rule: **prefill
everything that is certain, flag everything that is inferred, never
guess silently.**

**Provenance tags** — every `system:`/`direction:` field records how
its value arrived:

| Tag | Meaning | Certainty |
|---|---|---|
| `extracted` | Computed CSS value read verbatim (font stack, hex, px measure) | high — binds directly |
| `snapped` | Measured value mapped to the nearest closed-set member | high — the delta is logged in `decisions[]` (`because: guideline measured X, snapped to Y`) |
| `inferred` | Judgment call from visual evidence (direction axes, treatment, personality) | medium — listed for operator ratification, never silent |
| `chosen` | No evidence — a free selection from the closed set | the plan's default state |

**Design-guideline extraction map** (observed → field):

| Observe on the guideline | Lands in | Snap rule |
|---|---|---|
| computed `font-family` stacks | `system.type.fonts` | member of T.4 directory, else nearest approved substitute — logged |
| computed font-size ramp (h1…body) | `system.type` ratio/ranks | infer the modular ratio; snap to `clamp()` endpoints |
| dominant hexes (bg, text, CTA) | `system.color.roles` | snap to C.1 role map; accent verified against C.4 harmony |
| computed `border-radius` on cards/buttons | `direction.shape` → `system` radius tokens | snap to S.2 token row; the personality is `inferred` |
| measured spacing rhythm | `system.space` usage | snap to G.1 members; a non-member rhythm is a `decisions[]` entry |
| animation timing/easing (computed `transition`) | `direction.motion` | `inferred` — pick the M.1 personality it resembles |
| imagery treatment (desat, duotone, B&W) | `system.media.treatment` | `inferred` pick from V.2 |
| icon set identity | `system.icons.family` | extracted if identifiable (Lucide/Feather glyphs), else `chosen` |

**Content-guideline extraction map** (copy → field): the guideline
page's argument maps section-by-section onto `rhetoric[]`
speech-acts; its CTA labels pre-fill `system.copy.cta_person`; its
tone pre-fills the W.1 context picks. Content guidelines never
touch `direction` or `system` numbers.

**Gate:** fields tagged `extracted`/`snapped` are ratified when the
plan is reviewed — the tag is the audit trail. `inferred` fields are
listed in `decisions[]` as *open* until the operator confirms; a
plan with an unconfirmed `inferred` axis is incomplete at W1 exit.

```yaml
# Every system value carries a provenance tag: extracted | snapped | inferred | chosen.
# Extracted/snapped = ratified by review; inferred = listed in decisions[] until confirmed.
site:
  slug: <slug>
  date: <YYYY-MM-DD>
  design_mode: <intake scenario>   # variants | inspo-text | refs-* | audit-remodel | dox
  sources: [site-brief.md, refs/MANIFEST.md, design/audit.md?]

  # ---- shared intent (site-level defaults; pages may sharpen) ----
  intent:
    who: <one noun phrase — the reader, not "users">
    one_action: <the single verb this site exists to cause>
    worst_case: <what failure looks like>

  # ---- direction — forced pick per axis ----
  direction:
    temperature:   warm | cool | neutral
    density:       sparse | balanced | dense
    finish:        flat | textured | glossy | raw
    type_contrast: serif-display/sans-text | mono-accents | single-family-weight-contrast
    shape:         p1-sharp | p2-subtle | p3-friendly | p4-playful    # rules/S.md §S.1
    motion:        subtle | elegant | professional | playful          # rules/M.md §M.1
    refused:       <the generic default this direction replaces, named>

  # ---- system numbers — closed set, every value a token ----
  system:
    type:
      ratio_min: <e.g. 1.2>   ratio_max: <e.g. 1.333>
      endpoints: {min: {px: 320, base: 16, ratio: 1.2},
                  max: {px: 1440, base: 20, ratio: 1.333}}  # Utopia → clamp() steps
      ranks:
        display: {step: +5, weight: 700, tracking: -0.02, space_above: 0}
        h1:      {step: +4, weight: 700, tracking: -0.02, space_above: <token>}
        h2:      {step: +3, weight: 600, tracking: -0.01, space_above: <token>}
        lead:    {step: +1, weight: 400, tracking: 0,      space_above: <token>}
        body:    {step: 0,  weight: 400, tracking: 0,      space_above: <token>}
        small:   {step: -1, weight: 400, tracking: 0.01,   space_above: <token>}
        caption: {step: -2, weight: 500, tracking: 0.08,   space_above: 0}
        # subset allowed; tuple per rank — not a name list
      fonts: {display: <stack>, body: <stack>}               # ≤2 families
    space:
      unit: 4px
      scale: [4, 8, 12, 16, 24, 32, 48, 64, 96, 128]
      section_densities:
        compact:  {py: <space token, e.g. space-4>}
        regular:  {py: <space token, e.g. space-6>}
        spacious: {py: <space token, e.g. space-9>}
      group_gap_vs_section_gap: "≥2×"        # proximity as arithmetic
    grid:
      measure: <e.g. 62ch>                  # binds prose rank (≤65ch); shells may run ≤75ch
      content_width: <e.g. 72rem>
      gutter: <token>
      edge_padding: [16, 24, 32, 40, 48]         # closed ramp (R.2 — own scale, not G.1)
      breakpoints: [360, 640, 768, 1024, 1280, 1440, 1920]   # closed set (R.1)
      stack_order: text-first | visual-first     # text-first = default; visual needs declared hook (R.3)
    color:
      temperature: <matches §direction>
      roles:
        bg:                {value: <token>, why: <one line>, contrasts_with: [ink ≥7:1]}
        surface:           {value: <token>, why: <one line>, contrasts_with: [ink ≥7:1]}
        ink:               {value: <token>, why: <one line>, contrasts_with: [bg ≥7:1, surface ≥7:1]}
        ink_muted:         {value: <token>, why: <one line>, contrasts_with: [bg ≥4.5:1]}
        accent:            {value: <token>, why: <one line>, contrasts_with: [accent_fg ≥4.5:1]}
        accent_foreground: {value: <token>, why: <one line>}
        semantic:          {ok: <token>, warn: <token>, err: <token>}
      accent_budget: "primary CTA + motif only — checked at review as 'no third accent surface'"
      proportions: {dominant: 60, secondary: 30, accent: 10}
    contrast_axes:                            # ONE axis per pair
      heading_vs_body: size
      accent_usage: cta_and_motif_only

    icons:                                        # rules/I.md — closed selections
      family: lucide                     # closed set {lucide} — one library
      style: outline | solid | duotone | hand-drawn | 3d-hero-only
      stroke_class: light | regular | bold        # 1.5 | 2.0 | 2.5–3.0px
    media:                                        # rules/V.md
      treatment: natural | bw | duotone | cinematic       # ≥80% of imagery
      authenticity: t1-first-party | t2-editorial | t3-ai | t4-illustrated
    copy:                                         # rules/W.md — closed selections
      cta_person: first | second                  # first = "Get my quote"; second = "Manage your account" — one per flow
      reading_level: ≤grade-8                     # fixed; listed to forbid drifting

  # ---- DNA — the map owns this; the plan mirrors it (D.1–D.4, DM.1) ----
  # The single source of coherence is <pipeline>/DNA.json (+ rendered
  # DNA.md, `gate.py dna`), created at W1 EXIT. This block is a mirror
  # for reading the plan alone; on disagreement the map wins and the
  # gate fails (DM.3).
  dna:
    map: DNA.json                          # LAW.DNA — hash carried by every artifact
    version: 0                             # 0 at W1 exit, 1 locked at W5 exit
    profile: profile-<vertical>            # dna/<vertical>.md (genome statistics)
    genotype:                              # one allele per gene, closed sets only
      layout-archetype: <allele>           # genes: dna/GENOME.md (20 genes)
      page-macro-structure: <allele>
      density-tier: <allele>
      # … every gene filled; a blank gene = refuse (D.1)
    wildcard: [<gene>, <gene>]             # ≤1 wildcard option (B.3), stylistic genes only
    novelty: 0.00                          # NOVELTY.json distance, ≤ bound (B.6)
    knobs:                                 # knobs.json — the closed set variants move
      type.ratio: 0.00                     # seeded at W1 exit as the median of the
      # … every knob, inside its declared range; each seeded value's
      # provenance records the source pattern ids + n (DM.1)
    vector_targets: {}                     # 13 quality targets from rating gaps + vertical norms

  # ---- variants — knob vectors, never new sections (VG.1–VG.6) ----
  variants:                                # rendered as src/pages/variants.astro
    count: 3                               # 3 default, 5 max
    sheet_first: true                      # every variant renders its own system sheet before its page
    burst_wildcard: 1                      # ≥1 wildcard variant whenever burst > 0 (VG.5)

  # ---- burstiness — how far this direction may bend the rules (B.1–B.5) ----
  burst: 0                                 # 0 | 1 | 2 | 3 — declared, never discovered
  # 1 = mutate 1–2 stylistic genes to allowed tail alleles
  # 2 = +1 declared structural break
  # 3 = +up to 2 declared breaks; invariant genes never break

  # ---- motif — recurrence + exactly one break ----
  motif:
    device: <e.g. "hairline rule + step numerals">
    recurs_at: […]
    break: {where: <section>, how: <what's different>}

# ---- per-route plans — one entry per PAGES/<slug>/SPEC.md ----
pages:
  home:
    page_class: money                      # money | article | ancillary | utility(hero-less)
    intent: {who: <if it differs from site>, one_action: <page's verb>}
    idea: <one sentence ≤25 words the page argues>
    tension: {what_is: <pain>, what_could_be: <promised state>}
    rhetoric:
      - {speech_act: promise,   question: "what do I get"}       # argumentative
      - {speech_act: proof,     question: "why believe you"}
      - {speech_act: tension,   question: "what's wrong now"}
      - {speech_act: how,       question: "how does it work"}
      - {speech_act: objection, question: "but what about X"}
      - {speech_act: act,       question: "what do I do now"}    # appears twice on money pages
      - {speech_act: detail,    question: "show me more"}        # structural, exempt from ordering
      - {speech_act: chrome,    question: "site structure"}      # structural, exempt from ordering
    sections:
      - name: hero
        speech_act: [promise, act]        # list allowed (hero-act-merge); ≤2
        category: hero                    # ∈ vendored slug list, SECTION-CATALOG §1
        surface: inverse                  # base|muted|inverse|brand|media
        density: spacious                 # compact|regular|spacious
        composition: split-media          # ∈ SECTION-CATALOG §2 ONLY
        emphasis: headline                # the ONE focus
        align: <named edge>               # e.g. col-1-edge | center-axis | measure-start
        stack: text-first                   # mobile order: text-first default; visual-first needs declared product-UI hook (R.3)
        collapse: 2-col≥1024 | stacked      # per-composition collapse step, must match R.3 table
        wf_ref: "<cards/index.html#d1:hero>"   # the picked card's block — 1:1, P.4
        # ---- vector pages only (copy-contract STUB) — rules/E.md ----
        heading: <exact vector heading — verbatim, never rewritten>
        fs: <mandated first sentence — the copy contract, renders verbatim>
        zone: macro | micro | end
        heading_class: query | claim    # E.2: query=small/muted/label; claim=full rank
        disclosure: open | collapsed | tabbed   # E.2: macro=open only; micro may collapse per operator density pick
      - {…one row per section, in rhetoric order…}
  # …one entry per route/SPEC…

# ---- W4 look options — each a distinct genotype vector (D.3) ----
options:
  - {name: d1, wildcard: false, temperature: warm, shape: p3-friendly}
  - {name: d2, wildcard: false, temperature: cool, shape: p2-subtle}
  - {name: d3, wildcard: true,  temperature: warm, shape: p4-playful,
     mutates: [radius-personality, motion-tier]}      # the one wildcard

# ---- decision log — append-only ----
decisions:
  - {chose: <x>, over: <y>, because: <one line>}
  # declared rule break (B.4) — only when burst ≥ 2:
  - {rule_id: G.1, what: <the break>, why: <intent>, where: <section>,
     compensating: <the move that keeps the page coherent>}
```

## Hard rules

1. `composition` ∈ `SECTION-CATALOG.md` §2 only. Anything else is a
   refuse, same as a literal hex outside TOKENS.
2. Rhythm rules = `SECTION-CATALOG.md` §4, verbatim — this file
   references them, never restates them (F2: they live there so a
   correction can't fork the two docs).
3. `inverse` ≤ 2/page + footer; `brand` ≤ 1/page; `spacious` spent at
   `promise` + `act` + ≤1 interior.
4. `idea` ≤ 25 words; every section's `speech_act` ∈ the 8-act enum
   (argumentative acts must also appear in `rhetoric`; `detail` and
   `chrome` are structural and exempt from ordering but still typed).
   A section with no act is deleted, not "kept for balance".
5. A blank field = plan rejected. The plan is the unit of review —
   not the screenshot.
6. `PAGES/*/SPEC.md` copies its section rows from `pages.<slug>.sections`
   verbatim on the refs branch; a SPEC that contradicts the plan is a
   refuse, not an improvisation. DOX branch exempt — see header.
7. `preview/system.html` is produced after this file — every surface ×
   every density × every type rank × buttons/fields/cards, values bound
   to TOKENS.json, self-contained — and only then page previews.
   (Style tile before mockup — Samantha Warren / the Design-library's
   `design-system.html` rule.)
8. Build seam: `CLASS-SYSTEM.md` MUST carry rows keyed by
   surface/density (`surface.inverse → <class>`, `density.spacious →
   <class>`); `COMPONENTS.md` MUST name which component each
   `composition` instantiates. Build self-lint checks every rendered
   section's classes match its SPEC row's enums (F7).
9. Section unit: every `sections[]` row becomes one
   `sections/<nn>-<sec>.contract.json` (`gate.py contracts`), is built
   by one builder and passes `gate.py section --sec <name>` before the
   page exists. `src/pages/<slug>.astro` is written by
   `assemble.py` — a hand-edited page fails W7 (SB.1–SB.4).
10. Burst is declared, never discovered: `burst:` in the plan, a break
   only inside `decisions[]` with all five fields, invariant genes
   never broken, everything not declared at 100% (B.1–B.5).

## Enforcement (F13)

The checkable rules above are mechanical acceptance items, not prose
the coordinator hopes was honored:

- [ ] every `PAGES/*/SPEC.md` exists as a `pages.<slug>` entry
- [ ] every `composition` ∈ catalog §2; every `category` ∈ vendored slugs
- [ ] adjacent `sections[].composition` never equal, per page
- [ ] `inverse` count ≤2 + footer; `brand` ≤1; `spacious` ≤3 per page
- [ ] every argumentative `speech_act` ∈ the page's `rhetoric`
- [ ] `idea` ≤ 25 words per page entry
- [ ] SPEC `sections[]` == `pages.<slug>.sections[]` (verbatim diff, refs branch)
- [ ] `preview/system.html` exists
- [ ] typography QA ∈ `rules/T.md` §T.8 (fonts ∈ directory, ≤2
  families, no same-class pairing, measure 52–65ch, body ≥16px,
  display tracking negative, `text-wrap` set, hero subhead 50–60%,
  image-overlay tint 40–60%)
- [ ] layout & proximity QA ∈ `rules/L.md` §L.13 (heading binds
  forward, card padding 15–25px, section gaps 60–100px, S-M-L scale
  present, icons labelled, touch ≥44px, 960 containment, ≤1 frame-break)
- [ ] colour QA ∈ `rules/C.md` §C.7 (role-token binding, chromatic
  neutrals 2–6%S, ink ≥7:1, accent derived by harmony formula,
  accent_fg by luminance, ≤10% accent area, dark surfaces tinted
  charcoal not black)
- [ ] shape QA ∈ `rules/S.md` §S.8 (one personality, token radii
  only, concentric nesting, borders {0,1,2}, elevation↔radius paired)
- [ ] icon QA ∈ `rules/I.md` §I.8 (single family, closed sizes,
  uniform stroke, labelled where required, zero emoji)
- [ ] media QA ∈ `rules/V.md` §V.8 (one treatment ≥80%, closed
  aspect ratios, scrim/contrast floors, authenticity tier, <picture>)
- [ ] motion QA ∈ `rules/M.md` §M.8 (token durations, no linear
  spatial, one focal animation, ≤80px+fade, reduced-motion fallback)
- [ ] responsive QA ∈ `rules/R.md` §R.8 (closed breakpoints,
  min-width only, 1440 ceiling, collapse steps exact, copy budgets,
  ≥44px targets +8px buffer, hover gated by pointer media query)
- [ ] writing QA ∈ `rules/W.md` §W.10 (verb-first 2–4-word CTAs,
  zero banned CTA/error phrases, sentence-case stand-alone headings,
  placeholder example-only, tooltip ≤15w, empty-state triad, links
  front-loaded, ≤grade-8, active voice, digits, no string
  concatenation / text-in-graphics / idioms)
- [ ] vector pages: every `sections[]` row maps 1:1 to the STUB's
  heading-vector, order preserved; `heading`/`fs`/`zone`/`heading_class`
  present; no invented section, none dropped (rules/E.md §E.1)
- [ ] SEO QA ∈ `rules/E.md` §E.4 (H1 `query` small on detail
  pages, macro readable/micro minimised, no invented `claim`,
  ≤1 link/section, title≡H1 entity)

"Complete top-to-bottom" stays judgment; the list above is mechanical.
If a `tools/` lint exists it runs these; otherwise the coordinator
walks this checklist before `prd_step done`.

## Migration (F14)

Pre-change packets (whistleclean 8 SPECs, lavisha 1 SPEC) predate the
plan. Rule: a re-minted distill lane on a pre-change site MUST backfill
`DESIGN-PLAN.md` and convert SPEC section rows to the enum format;
packets not re-minted are grandfathered until their next design touch.
Cutoff: any `design-dna/` touched after 2026-11-18 is new-format.
