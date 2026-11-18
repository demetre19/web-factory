# DESIGN-PLAN.md — the artifact that exists before any page is drawn

Required distill output at `site/design-dna/DESIGN-PLAN.md`. Written
**before** `PAGES/*/SPEC.md`, before `TOKENS.json` is finalized, before
any preview HTML. If it isn't in the plan, it does not exist — same
contract the Design-library uses for its Package A ("the designer has
no conversation history; the plan has to live in files").

Schema source: `research/DESIGN-FORETHOUGHT.md` §6 (the designer-process
research) + the surface/density vocabulary the Design-library already
ships (`01-CONTRACTS.md` §1.2).

## Fill order

Top to bottom. Prose decisions first (§1–4), numbers second (§5),
composition third (§6–7). A model that fills §7 before §4 is doing it
backwards — that is the exact "starting at step 6–7" failure.

```yaml
meta:
  site: <slug>
  date: <YYYY-MM-DD>
  design_mode: <intake scenario>          # variants | refs-* | audit-remodel | dox
  sources: [site-brief.md, refs/MANIFEST.md, design/audit.md?]

# ---- 1. Intent ----
intent:
  who: <one noun phrase — the reader, not "users">
  one_action: <the single verb this page exists to cause>
  worst_case: <what failure looks like>

# ---- 2. One idea ----
idea: <one sentence ≤25 words the page argues>
tension:
  what_is: <reader's current pain>
  what_could_be: <promised state>

# ---- 3. Rhetoric sequence ----
rhetoric:
  - {act: promise,   question: "what do I get"}
  - {act: proof,     question: "why believe you"}
  - {act: tension,   question: "what's wrong now"}
  - {act: how,       question: "how does it work"}
  - {act: objection, question: "but what about X"}
  - {act: act,       question: "what do I do now"}
# Order MAY change only by editing this block + a decisions[] row why.

# ---- 4. Direction — forced pick per axis ----
direction:
  temperature:   warm | cool | neutral
  density:       sparse | balanced | dense
  finish:        flat | textured | glossy | raw
  type_contrast: <named position, e.g. "serif display / sans body">
  refused:       <the generic default this direction replaces, named>

# ---- 5. System numbers — closed set, every value a token ----
system:
  type:
    ratio_min: <e.g. 1.2>   ratio_max: <e.g. 1.333>
    endpoints: {min: 320, max: 1440}      # → clamp() steps
    ranks: [display, h1, h2, lead, body, small, caption]   # subset allowed
    fonts: {display: <stack>, body: <stack>}                # ≤2 families
  space:
    unit: 4px
    scale: [4, 8, 12, 16, 24, 32, 48, 64, 96, 128]
    section_densities: {compact: <token>, regular: <token>, spacious: <token>}
    group_gap_vs_section_gap: "≥2×"        # proximity as arithmetic
  grid:
    measure: <e.g. 62ch>                   # Bringhurst 45–75ch first
    content_width: <e.g. 72rem>
    gutter: <token>
  color:
    temperature: <matches §4>
    roles: {bg, surface, ink, ink_muted, accent, accent_foreground,
            semantic: {ok, warn, err}}
    accent_budget: "≤10% of pixels; primary CTA + motif only"
    proportions: {dominant: 60, secondary: 30, accent: 10}
  contrast_axes:                            # ONE axis per pair
    heading_vs_body: size
    accent_usage: cta_and_motif_only

# ---- 6. Motif — recurrence + exactly one break ----
motif:
  device: <e.g. "hairline rule + step numerals">
  recurs_at: […]
  break: {where: <section>, how: <what's different>}

# ---- 7. Surface music — per section, THE plan ----
sections:
  - name: hero
    speech_act: promise                   # ∈ catalog §1
    category: hero                        # ∈ 52 category labels
    surface: inverse                      # base|muted|inverse|brand|media
    density: spacious                     # compact|regular|spacious
    composition: split-media              # ∈ catalog §2 ONLY
    emphasis: headline                    # the ONE focus
    align: <named edge>
  - {…one row per section, in rhetoric order…}

# ---- 8. Decision log — append-only ----
decisions:
  - {chose: <x>, over: <y>, because: <one line>}
```

## Hard rules

1. `composition` ∈ `SECTION-CATALOG.md` §2 only. Anything else is a
   refuse, same as a literal hex outside TOKENS.
2. Adjacent sections never share the same `(surface, density,
   composition)` triple — that's the rhythm rule, enforced in
   `DESIGN-DNA.md`'s review artifact.
3. `inverse` ≤ 2/page + footer; `brand` ≤ 1/page; `spacious` spent at
   `promise` + `act` + ≤1 interior.
4. `idea` ≤ 25 words; every section's `speech_act` ∈ the rhetoric
   sequence; a section with no act is deleted, not "kept for balance".
5. A blank field = plan rejected. The plan is the unit of review —
   not the screenshot.
6. `PAGES/*/SPEC.md` copies its section rows from this file verbatim;
   a SPEC that contradicts the plan is a refuse, not an improvisation.
7. `preview/system.html` is produced next — every surface × every
   density × every type rank × buttons/fields/cards — and only then
   page previews. (Style tile before mockup — Samantha Warren / the
   Design-library's `design-system.html` rule.)
