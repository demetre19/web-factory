# DESIGN-LIBRARY-TAKEAWAY — what the library already encoded, and the one thing it didn't

Read 2026-11-18 from `/Users/apple/Documents/UNCLUTTER-NEW/CLAUDE-DEV/Design library/`. Companion to `DESIGN-FORETHOUGHT.md` (the designer-process research) and `DESIGN-TECHNOLOGY.md` (the machine-mechanism research).

This is the insertion point for *greatness at the beginning*, not slop-cleanup at the end.

---

## 1. What the library actually is

Not a folder of pretty templates. It is a **procedure encoded as files**:

| Stage | Artifact | What it locks BEFORE drawing |
|---|---|---|
| 1 Brief | `BRAND_NAME`, `TARGET_AUDIENCE`, `PRIMARY_CTA`, `DESIGN_DIRECTION`, `TONE_OF_VOICE`, `MUST_HAVE`, `MUST_AVOID`, `MOTION_PERSONALITY` | Who, one action, taste in words, exclusions, motion budget |
| 2 Pages & Outlines | per-page ordered `sections[]` with `category`, `purpose`, `contentNotes`, `motionHint`, ≤3 inspiration crops | Rhetoric-as-outline: each section has a job before it has a layout |
| 3 References | site primary + inherited page primaries + scoped supports | One visual authority; supporting refs named by contribution |
| 4 Design Brief (Package A) | `MISSION.md` + `BRIEF.*` + `PAGES/*/PAGE.md` + `THEME/` + `RULES/QUALITY-BAR.md` | Everything a designer needs with **no conversation history** |
| Tokens v2 | type steps, space rhythm, surfaces, densities, highlight | Every visual value is a named decision with provenance |
| DNA schema | `spacing_and_rhythm`, `grid_and_layout`, `hero_composition`, `do_rules`/`dont_rules`, evidence+confidence | Why a reference works, as inspectable claims |

The seed pack is **four Astro blocks** (`pricing-three-tier`, `faq-accordion`, `cta-banner`, `stats-band`). That is not the archetype library. The archetypes are the **52 `COMPONENT_CATEGORY_LABELS`** (`Hero`, `Feature`, `How It Works`, `Testimonials`, `Call To Action`, `Grids and Cards`, `Timeline`, `Comparison`…). Category is the speech-act's *noun*. Composition inside the category is still free — that's the remaining hole.

## 2. The QUALITY-BAR sentence that is the whole game

From `src/server/handoff/package-a/render/rules.ts`:

> **Surfaces tell the story.** Alternate `base`/`muted` deliberately; `inverse` for contrast moments; `brand` sparingly; `media` only under media overlays.
>
> **Rhythm comes from tokens.** Prefer `py-section` / `py-section-compact` / `py-section-spacious` / `gap-stack` / `px-gutter`.
>
> **Density is a dial.** `data-density` shifts spacing, not layout.
>
> **Every section has a job.** Match `data-category` to its purpose in PAGE.md — a hero that doesn't sell the primary CTA is a failed hero.
>
> **Type is the system.** One clear hierarchy per section; do not invent sizes.

This is not a lint list. This is **the plan a great designer writes before they draw**:

1. The page is a *sequence of surfaces* (the music).
2. Spacing is a *named density per section* (compression and release).
3. Type is a *closed rank table*, not sizes.
4. Each section has a *job*, and the job picks the category.

Generic output is what you get when every section is `surface=base density=regular category=content`. That is the factory's current default. No amount of banned-pattern lint after the fact can invent a surface sequence that was never planned.

## 3. The token system as a description language for rhythm

The library already named the axes a designer plans. The factory's `TOKENS.json` has colors and clamps. It does **not** have the *sequencing* vocabulary:

| Axis | Allowed values | What it decides | Great-design use |
|---|---|---|---|
| `data-surface` | `base \| muted \| inverse \| brand \| media` | The *plane* the section sits on | Alternate base/muted as the beat; inverse = the one contrast moment; brand = the motif-break; media = photo-owned |
| `data-density` | `compact \| regular \| spacious` | Vertical padding of the section | Compression inside related groups, release between acts |
| `data-highlight` | `primary \| secondary \| foreground` | Which ink the motif uses | One highlight per page-region |
| type steps | `display h1 h2 h3 h4 lead body small caption` | Rank, not size | Each rank is a (size, leading, tracking, weight) tuple |
| space tokens | `section / section-compact / section-spacious / stack / gutter` | Rhythm unit | Section padding is the largest spend; stack is within-group |
| measure | `--size-prose` 65ch, `--size-content` 72rem | Bringhurst's first decision | Grid serves the measure, not vice versa |

`classifySurface()` is already a pure function over OKLCH (ΔL ≥ 0.35 → inverse; chroma+hue near primary → brand; small ΔL same polarity → muted). So a *planned* surface sequence can be verified against a rendered page. Plan → render → classify → match. That is generative, then checked — not cleaned up.

## 4. What great designers do (from DESIGN-FORETHOUGHT.md) mapped onto the library

The research consensus on **decision order** (never left to later):

| # | Decision | Designer records | Library already has | Factory today |
|---|---|---|---|---|
| 1 | Who + one action + worst case | Brief | Brief keys | `site-brief.md` + Intent Brief (partial) |
| 2 | One idea / tension | One ≤25-word sentence | `CENTRAL_TOPIC` + `DESIGN_DIRECTION` (prose, unforced) | Missing as a gate |
| 3 | Argument sequence | Ordered speech-acts | Page outline (category+purpose) | SPEC section list, no speech-act |
| 4 | Constraint system | Grid, ratio, space unit, color roles | Token v2 | TOKENS.json (colors+clamps) — no ratio, no surface sequence |
| 5 | Direction (4 axes) | Moodboard pick | `DESIGN_DIRECTION` adjectives | CHARACTER.md after the fact |
| 6 | Per-section composition | Thumbnail / style tile | Category only; composition free | Freehand `grid lg:grid-cols-2` |
| 7 | Fonts, hex, polish | Last | Theme compiler | Bound to tokens — this part is fine |

The library got 1, 3 (as outline), 4 (as tokens), 7. It left 2 (one idea as a gate), 5 (forced 4-axis pick), and 6 (composition catalog) as operator/LLM judgment. The factory inherited even less: it distills tokens from captures and then **lets the model invent section shape**.

L09's PROMPT already knows the missing move:

> Produce `designs/design-system.html` **first**: type scale, colors on every surface (base, muted, inverse, brand, media), buttons, links, cards, form fields, section spacing at each density. **Then** one file per route.

That is Samantha Warren's **style tile**, required as a file, before any page. The factory has no equivalent. We jump from tokens to a full home page.

## 5. The common DNA, stated as a plan not a ban

Nine invariants that survive Swiss / Japanese / brutalist / luxury / vernacular (`DESIGN-FORETHOUGHT.md` §2). Each is a **field filled before drawing**:

1. **Constraint first** — closed token set. (Library: tokens + TOKEN_BYPASS. Factory: TOKENS.json, but the model still writes freehand grids.)
2. **One idea** — one sentence; every section maps to it or is deleted.
3. **Finite ranks** — 3–5 type roles, each a tuple. (Library: `TYPE_STEPS`. Factory: fluid scale exists; ranks not bound to jobs.)
4. **Rhythm as ratio** — type = modular scale; space = base×n; section padding = named density.
5. **Single-axis contrast** — heading vs body differs by SIZE, not size+color+weight stacked. Accent used rarely enough to mean something. (Factory CHARACTER.md already says this; SPEC doesn't enforce it per section.)
6. **Negative space assigned** — `spacious` is a decision, not leftover.
7. **Motif + one break** — a device that recurs; exactly one sanctioned violation (usually the final CTA going `brand` or `inverse`).
8. **Alignment edge** — one return-edge for the eye (content column, not "sometimes centered").
9. **Material honesty** — `clamp()`, `ch` measure, tokens not pixel comps. (Both systems already require this.)

**The music of a great marketing page is the surface sequence.** Example, planned before any HTML:

```
hero        inverse   spacious   promise     split-media
proof       base      compact    proof       proof-band
problem     muted     regular    tension     editorial
offer       base      regular    how         cards-3
usp         brand     spacious   idea-restated  split-media
guarantee   base      compact    proof       badge-center
about       muted     regular    how         split-media
process     base      regular    how         sequence
cta         inverse   spacious   act         full-bleed
```

That is not decoration. That is **compression / release / contrast / return** — Bringhurst's vertical rhythm + Duarte's sparkline, encoded as three enums per section. A weak model can fill those enums from a catalog. It cannot invent them from "make it look designed."

The whistleclean SPEC we already wrote is almost this table — but every section is `bg` or one `deep`, density is implicit, composition is freehand Tailwind. The *skin* was decided; the *music* was not.

## 6. Procedure to insert at the START of S5 distill

New required artifact, written **before** `PAGES/*/SPEC.md`, consumed by it:

`site/design-dna/DESIGN-PLAN.md` — schema in `DESIGN-FORETHOUGHT.md` §6, plus the library's surface/density vocabulary:

```
intent        who / one_action / worst_case
idea          ≤25 words
rhetoric      ordered speech-acts (promise → proof → how → objection → act)
direction     temperature / density / finish / type_contrast   (forced pick)
system        type ratio+endpoints, space scale, measure, color role map
motif         device + recurs_at[] + one break
surfaces      the page's music: per-section {speech_act, category, surface, density, composition, emphasis}
```

Hard rules:

- No `PAGES/*/SPEC.md` until DESIGN-PLAN is complete. Same contract L09 uses: "Claude has no conversation history — the package must carry the plan."
- `composition` ∈ a catalog (not freehand grids). Catalog starts as the library's 52 categories × a small set of compositions per category (split, stacked, band, sequence, editorial, full-bleed). Relume's move: **select, don't generate.**
- Adjacent sections MAY NOT share the same `(surface, density, composition)` triple. That's the rhythm rule, generative not forensic.
- `design-system.html` (or `preview/system.html`) is produced next: every surface × every density × every type rank × buttons/fields/cards. Pages come third.
- Lint (banned patterns, `impeccable detect`) stays — as verification that the plan was *kept*, not as the source of quality.

## 7. Mobbin

`https://api.mobbin.com/mcp` is configured in `~/.omp/agent/mcp.json` as an HTTP MCP server. It answers **401 Unauthorized**. Protected resource metadata:

- resource: `https://api.mobbin.com/mcp`
- authorization server: `https://ujasntkfphywizsdaapi.supabase.co/auth/v1`
- grant: authorization_code + PKCE S256
- scopes: `openid`

No token is present in this session. I cannot complete the OAuth dance without you signing in. Once OMP holds a Mobbin bearer, the same procedure applies: pull 8–12 screens in the vertical, extract *surface sequences and compositions* (not skins), feed those as the catalog's evidence — the library's Section Scan + `classifySurface` already do this for a URL. Mobbin would be a second evidence source, not a different mechanism.

## 8. What NOT to do

- Do not grow the banned-pattern list and call it design. Negation is cheap and still converges (text-only skills always output the same structure).
- Do not treat the 4-block seed pack as "the archetypes." Categories are the nouns; compositions are the verbs; **surface sequence is the music.**
- Do not ask the weak model "what should this section look like." Ask it to **pick** `speech_act`, `category`, `surface`, `density`, `composition` from closed enums, then fill slots.

The technology behind good design, restated for the factory:

> Decide the idea, the argument order, the constraint numbers, and the surface music — as files — before anyone is allowed to draw. Drawing is then selection and assembly. Cleanup is how you prove the plan was kept.
