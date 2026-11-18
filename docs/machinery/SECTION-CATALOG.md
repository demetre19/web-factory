# SECTION-CATALOG — the closed set a section is *selected* from

This is the machinery behind "the section has a job, the job picks the
layout." A distill lane never invents a composition; it selects a row
here. Freehand `grid lg:grid-cols-2` is a refuse — same class of defect
as a freehand hex value.

A section has **three planned axes** (the "surface music") and **one
job**:

- `speech_act` — what it argues (the rhetorical role)
- `surface` — the plane it sits on (`base | muted | inverse | brand | media`)
- `density` — vertical rhythm (`compact | regular | spacious`)
- `composition` — its physical structure, picked from this catalog

Evidence: `research/DESIGN-TECH-EXTERNAL.md` (Google reads pages as
role-typed blocks), `research/DESIGN-TECH-METHODS.md` (Relume's library,
Sketch2Code), `research/DESIGN-FORETHOUGHT.md` (page as argument),
`~/Documents/UNCLUTTER-NEW/CLAUDE-DEV/Design library/DOX/01-CONTRACTS.md`
(surface/density vocabulary already shipped).

---

## 1. Speech-acts — the argument the page makes

A marketing page is an argument, not a stack of blocks. Every section
maps to exactly one speech-act; a section that maps to none is a defect
(the "what is this doing here" test).

| `speech_act` | Question it answers | Maps to category (noun) | Canonical default (surface / density) |
|---|---|---|---|
| `promise` | "what do I get / why this" | `hero` | `inverse` · `spacious` |
| `proof` | "why believe you" | `testimonials` · `logo-sections` · `counter` | `base` · `compact` |
| `tension` | "what's wrong now" | `content` · `feature` | `muted` · `regular` |
| `how` | "how does it work" | `how-it-works` · `feature` · `timeline` · `teams` | `base` or `muted` · `regular` |
| `objection` | "but what about X" | `faq` · `comparison` · `banner` | `base` · `regular` |
| `act` | "what do I do now" | `call-to-action` · `contact` | `inverse` or `brand` · `spacious` |
| `detail` | "show me more" | `gallery` · `grids-and-cards` · `table` · `content` | `base` or `muted` · `regular` |
| `chrome` | site structure | `headers` · `footer` | `base` · `compact` |

The **canonical sequence** for a money page is
`promise → proof → tension → how → objection → act`. Reordering is
allowed only by editing `DESIGN-PLAN.md` and logging why — the order is
the argument's skeleton, not a suggestion.

## 2. Compositions — the closed set

`composition` is one of these. A section's `speech_act` steers which
compositions are legitimate; the catalog refuses a mismatch (a proof
section built as a `split-hero` is a defect).

| `composition` | Structure | Allowed for `speech_act` | Notes |
|---|---|---|---|
| `split-media` | text + media, asymmetric split (text ≈ 0.45–0.6) | `promise`, `how`, `detail` | Hero's default. Media is real, never gray-box. |
| `stacked-hero` | centered text stack, no media column | `promise` (secondary pages) | Use when the page has no strong hero image. |
| `proof-band` | rating + quote + link in one horizontal band | `proof` | Directly after hero. Tight, not a section. |
| `editorial` | measure-constrained prose (≤65ch), one column | `tension`, `detail` | For paragraphs, not features. |
| `cards-n` | 2–4 uniform cards in a grid | `how`, `detail` | Max 2 per page; no adjacent card sections. |
| `sequence` | ordered steps / numbered rows / timeline | `how` | For processes; the numerals carry the motif. |
| `faq` | accordion / `details` | `objection` | Real questions only. |
| `comparison` | 2-column contrast / table | `objection`, `detail` | For "us vs them" or before/after. |
| `logo-wall` | row of client marks | `proof` | Only with real marks; never invented logos. |
| `stat-band` | 3–4 large metrics | `proof` | Real numbers only. |
| `full-bleed` | single centered CTA, edge-to-edge surface | `act` | The motif-break lives here. |
| `badge-center` | single centered badge/statement | `proof`, `objection` | Guarantees, certifications. |
| `media-gallery` | grid of images, no text blocks | `detail` | For before/after, portfolio. |
| `form-panel` | form + supporting copy, two zones | `act` (contact) | The only place a form lives. |

**Banned as composition rows:** icon+heading+text card grids *used as
a substitute for a real composition*; "eyebrow + h2 + 3-col card"
repeated on consecutive sections; any layout that is just
`max-w-prose mx-auto text-center` without a declared job.

## 3. Page-type canonical sequences

`page_class` (from `sitemap.md` / content `type`) picks the sequence.
A sequence is a checklist, not a cage — a section may be omitted, but
never invented outside the catalog.

### `money` (service / product / quote)
`promise → proof → tension → how → detail* → objection → act`
- hero = `promise`; proof-band immediate; at least one `how` and one
  `objection`; ends on `act` (full-bleed) or `form-panel` on contact.

### `article` (blog / guide)
`promise → tension → detail* → objection? → act`
- editorial-first; proof optional; act may be a soft CTA, not the
  full-bleed money CTA.

### `ancillary` (about / areas / utility)
`promise → detail* → act`
- shorter; proof optional; act is the contact route.

## 4. Adjacency and repetition rules (the rhythm rule)

- Adjacent sections MAY NOT share the same `(surface, density,
  composition)` triple.
- No more than 2 `cards-n` sections per page; never adjacent.
- `inverse` surfaces ≤ 2 per page + footer; `brand` ≤ 1 per page.
- `spacious` density is spent at `promise` and `act` — the two rests —
  plus at most one interior section. Uniform `regular` everywhere is the
  "undecided rhythm" defect.
- The first interior section after the hero is always a different
  surface than the hero (contrast at the fold boundary).
- `media` surface only under a real image overlay (background image or
  video); never as a tint.

## 5. What the distill lane writes instead of a grid

Old (freehand):
```md
- Layout: `grid lg:grid-cols-2 gap-xl items-center`
```

New (selected):
```md
- speech_act: promise
- category: hero
- surface: inverse
- density: spacious
- composition: split-media
- emphasis: headline            # the ONE focus
- align: col-1-edge
- motif_echo: step-numerals    # where the motif recurs, if anywhere
```

`DESIGN-PLAN.md` (see `docs/machinery/DESIGN-PLAN.md`) carries the same
table for the whole page first; the SPEC rows copy from it verbatim.
