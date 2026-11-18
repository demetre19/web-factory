# DESIGN-PLAN.md — the artifact that exists before any page is drawn

Required distill output at `site/design-dna/DESIGN-PLAN.md`. On the
refs branch it is written **before** `PAGES/*/SPEC.md`, before
`TOKENS.json` is finalized, before any preview HTML. If it isn't in
the plan, it does not exist — same contract the Design-library uses
for its Package A ("the designer has no conversation history; the
plan has to live in files").

Two layers under this file: `docs/machinery/PRIMITIVES.md` (the closed
sets — typography rules, typeface directory, measure/leading bounds,
anti-stretch, hero/subhead ratios) and `docs/machinery/SECTION-CATALOG.md`
(the section compositions the primitives assemble into). The plan
picks *from* them; it never invents values outside them.

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

## The cascade — top-down, gated at every level

Design is produced in six levels. Each level *consumes the level
above as a closed set* — a level may select, it may never invent.
Each level has a gate: the gate's mechanical checklist must pass
before the next level starts. A level that reaches past its inputs
(a page inventing a color, a component setting its own spacing) is
the design-DNA loss this file exists to prevent.

| Level | Artifact | What it decides | Gate that opens the next level |
|---|---|---|---|
| **L0** | `DESIGN-PLAN.md` `site:` + `direction:` | The overall aesthetic — intent, the six direction axes, `refused` | Every axis filled + `refused` named |
| **L1** | `DESIGN-PLAN.md` `system:` | Every number bound — type scale/ranks/fonts, space scale, color roles, icons, media, copy, grid — *all fluid, all tokenized* | Every `system.*` field non-empty; every value ∈ `PRIMITIVES.md` |
| **L2** | `pages.<slug>` rows + ASCII sketch | The page's argument as *boxes*: `rhetoric` order → `sections[]` (act / category / surface / density / composition / emphasis / align) | Rhetoric complete; compositions ∈ catalog §2; ASCII critique passes |
| **L3** | `preview/system.html` | The system rendered: every surface × density × rank × buttons/fields/cards — feel verified before page pixels | Renders; every element binds a `system.*` token, zero hardcoded px/hex |
| **L4** | `PAGES/<slug>/SPEC.md` | The built section map — plan rows verbatim, components named | SPEC `sections[]` == plan rows (verbatim diff) |
| **L5** | `COMPONENTS.md` + build | Micro-interactions + element rules — applied uniformly from `direction.motion`, never selected per-page | §Enforcement checklist, all sections |

**Order note:** L2 (boxes) precedes L3 (tile) deliberately — the
argument is verified cheaply *before* the system spends a pixel.
`pages:` rows are authored at L2, but their surface/density values
only become *real* at L3, when the tile renders them.

**The gates are mechanical, not review.** L0–L1 pass when fields are
filled with closed-set values; L2 is the ASCII critique; L3 is the
render check; L4 is the verbatim diff; L5 runs §Enforcement. L3 is
the only render gate — it exists so typography/colour/radius/spacing
get verified on a *system tile* before any page is drawn, not on a
finished mockup where fixing them is expensive.

**All-fluid rule** (the "automatic CSS" level): `system.type` is a
`clamp()` scale (Utopia), `system.space` is the G.1 set applied
everywhere, `system.color` is the C.1 6-role map, `system.grid`
`edge_padding`/`breakpoints`/`stack_order` is R.2's closed ramp.
Nothing downstream of L1 chooses a number — it binds a token. A
literal `px`/`hex`/`rem` in page or component code that isn't a
token reference is a refuse, same class as a literal hex outside
TOKENS.

**The index** (where each agent reads): L0 `direction` → L1
`system.*` → L2 `sections[].surface/.density/.composition` → L5
rules. An agent at any level has *exactly one* upstream artifact to
consult; it never reaches two levels up, never sideways. If a field
it needs isn't filled above, the correct move is `prd_step` back,
not a default.

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
   This is the L2 gate — the page argument is verified as *boxes*
   before a single pixel is spent.
6. `preview/system.html` next — every surface × every density × every
   type rank × buttons/fields/cards — then page previews (F6).
   DOX branch: copy packet `designs/design-system.html` to
   `preview/system.html` rather than regenerating. This is the L3
   gate — the *system* is verified on a tile before any page exists.
7. L4+ downstream — `PAGES/<slug>/SPEC.md` copies its section rows
   verbatim from `pages.<slug>.sections`; `COMPONENTS.md` names the
   component each `composition` instantiates; build self-lints every
   rendered section's classes against its SPEC row's enums (F7).

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
plan with an unconfirmed `inferred` axis is incomplete at L0.

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
    shape:         p1-sharp | p2-subtle | p3-friendly | p4-playful    # PRIMITIVES §S.1
    motion:        subtle | elegant | professional | playful          # PRIMITIVES §M.1
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

    icons:                                        # PRIMITIVES §I — closed selections
      family: lucide | heroicons | phosphor | feather | custom
      style: outline | solid | duotone | hand-drawn | 3d-hero-only
      stroke_class: light | regular | bold        # 1.5 | 2.0 | 2.5–3.0px
    media:                                        # PRIMITIVES §V
      treatment: natural | bw | duotone | cinematic       # ≥80% of imagery
      authenticity: t1-first-party | t2-editorial | t3-ai | t4-illustrated
    copy:                                         # PRIMITIVES §W — closed selections
      cta_person: first | second                  # first = "Get my quote"; second = "Manage your account" — one per flow
      reading_level: ≤grade-8                     # fixed; listed to forbid drifting

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
      - {…one row per section, in rhetoric order…}
  # …one entry per route/SPEC…

# ---- decision log — append-only ----
decisions:
  - {chose: <x>, over: <y>, because: <one line>}
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
- [ ] typography QA ∈ `PRIMITIVES.md` §T.8 (fonts ∈ directory, ≤2
  families, no same-class pairing, measure 52–65ch, body ≥16px,
  display tracking negative, `text-wrap` set, hero subhead 50–60%,
  image-overlay tint 40–60%)
- [ ] layout & proximity QA ∈ `PRIMITIVES.md` §L.13 (heading binds
  forward, card padding 15–25px, section gaps 60–100px, S-M-L scale
  present, icons labelled, touch ≥44px, 960 containment, ≤1 frame-break)
- [ ] colour QA ∈ `PRIMITIVES.md` §C.7 (role-token binding, chromatic
  neutrals 2–6%S, ink ≥7:1, accent derived by harmony formula,
  accent_fg by luminance, ≤10% accent area, dark surfaces tinted
  charcoal not black)
- [ ] shape QA ∈ `PRIMITIVES.md` §S.8 (one personality, token radii
  only, concentric nesting, borders {0,1,2}, elevation↔radius paired)
- [ ] icon QA ∈ `PRIMITIVES.md` §I.8 (single family, closed sizes,
  uniform stroke, labelled where required, zero emoji)
- [ ] media QA ∈ `PRIMITIVES.md` §V.8 (one treatment ≥80%, closed
  aspect ratios, scrim/contrast floors, authenticity tier, <picture>)
- [ ] motion QA ∈ `PRIMITIVES.md` §M.8 (token durations, no linear
  spatial, one focal animation, ≤80px+fade, reduced-motion fallback)
- [ ] responsive QA ∈ `PRIMITIVES.md` §R.8 (closed breakpoints,
  min-width only, 1440 ceiling, collapse steps exact, copy budgets,
  ≥44px targets +8px buffer, hover gated by pointer media query)
- [ ] writing QA ∈ `PRIMITIVES.md` §W.10 (verb-first 2–4-word CTAs,
  zero banned CTA/error phrases, sentence-case stand-alone headings,
  placeholder example-only, tooltip ≤15w, empty-state triad, links
  front-loaded, ≤grade-8, active voice, digits, no string
  concatenation / text-in-graphics / idioms)

"Complete top-to-bottom" stays judgment; the list above is mechanical.
If a `tools/` lint exists it runs these; otherwise the coordinator
walks this checklist before `prd_step done`.

## Migration (F14)

Pre-change packets (whistleclean 8 SPECs, lavisha 1 SPEC) predate the
plan. Rule: a re-minted distill lane on a pre-change site MUST backfill
`DESIGN-PLAN.md` and convert SPEC section rows to the enum format;
packets not re-minted are grandfathered until their next design touch.
Cutoff: any `design-dna/` touched after 2026-11-18 is new-format.
