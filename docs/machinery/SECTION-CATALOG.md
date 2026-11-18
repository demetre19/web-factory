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

| `speech_act` | Question it answers | Maps to category (slug) | Canonical default (surface / density) |
|---|---|---|---|
| `promise` | "what do I get / why this" | `hero` | `inverse` · `spacious` |
| `proof` | "why believe you" | `testimonials` · `logo-sections` · `counter` | `base` · `compact` |
| `tension` | "what's wrong now" | `content` · `feature` | `muted` · `regular` |
| `how` | "how does it work" | `how-it-works` · `feature` · `timeline` · `teams` | `base` or `muted` · `regular` |
| `objection` | "but what about X" | `comparison` · `banner` · `pricing` · `content` (FAQ) | `base` · `regular` |
| `act` | "what do I do now" | `call-to-action` · `contact` · `newsletter` | `inverse` or `brand` · `spacious` |
| `detail` | "show me more" | `gallery` · `grids-and-cards` · `table` · `content` · `blog-*` · `portfolio-*` | `base` or `muted` · `regular` |
| `chrome` | site structure | `headers` · `footer` · `megamenu` · `404-error` · `thank-you-page` | `base` · `compact` |

A section may carry up to **two** speech-acts when it genuinely does
both jobs — `speech_act: [promise, act]` for a `hero-act-merge` hero
(the hero IS the first action on service sites; verified 5/5). More
than two means the section has no job.

The **canonical sequence** for a money page is
`promise → proof → tension → how → objection → act` — a *reference
skeleton*, not a required order (verified real pages reorder the
middle freely; see §3). Hard invariants: promise first, act
first-and-last, exactly one contrast moment. Reordering is allowed
only by editing `DESIGN-PLAN.md` and logging why.

### Category vocabulary — vendored, canonical

`category` carries the **slug** form (e.g. `call-to-action`, not
`Call To Action`). The closed list below is vendored verbatim from
`Design library/src/server/components/categories.ts`
(`COMPONENT_CATEGORY_SLUGS`, 52 entries — pinned copy, 2026-11-18).
That file is the source of truth; update this list only by re-vendoring.

```
404-error author-page banner blog-archive blog-section blog-single-page
call-to-action career cart category-section checkout coming-soon
comparison contact content counter empty-cart event-section
event-single-page feature footer gallery grids-and-cards
header-page-sections headers hero how-it-works linktree login
logo-sections megamenu my-account-page newsletter off-canvas
order-receipt pay portfolio-section portfolio-single-page pricing
product-archive product-section product-single shop-footers
shop-headers shop-hero table table-of-content teams testimonials
thank-you-page timeline ui-elements
```

Unmapped categories: `pricing` → `objection` (it argues "is it worth
it"); `newsletter` → `act` (a capture form); `blog-*` / `content` /
`table` / `table-of-content` → `detail`; `portfolio-*` → `detail`;
`career` → `detail`; `shop-*` / `product-*` / `cart` / `checkout` /
`pay` / `login` / `my-account-page` / `order-receipt` / `thank-you-page`
/ `empty-cart` / `linktree` / `megamenu` / `off-canvas` / `ui-elements`
/ `coming-soon` / `header-page-sections` / `404-error` → `chrome` or
`detail` per page context (non-marketing chrome). An unmapped section
is still a defect — but only if *none* of the 8 acts fit, not if the
category table is sparse.

Note: `faq` is a **composition** (§2), not a category slug — the
category for an FAQ section is `content` or `feature` with
`composition: faq`.

Hero-less pages (404, thin utility): no `promise` required — start at
`detail` or `chrome`, skip the fold-boundary rule, one `act` only.

## 2. Compositions — the closed set

`composition` is one of these. A section's `speech_act` steers which
compositions are legitimate; the catalog refuses a mismatch (a proof
section built as a `split-media` is a defect).

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
| `quote-grid` | 2–3 col grid of testimonial/quote cards | `proof` | A grid of *real quotes* — distinct from `proof-band` (one band) and from banned icon-cards. |
| `map-finder` | map + radius/coverage list or address finder | `detail` | For `/service-areas`-style location proof; pairs with `link-grid`. |
| `capture-form` | single-field email/phone capture + supporting line | `act` | Newsletter/lead capture; the non-contact form (contact stays `form-panel`). |
| `text-index` | plain linked index of items (cities, services, topics) | `detail` | The service-areas pattern; never cards (card version was banned on whistleclean home). |
| `app-band` | text + phone mockup | `detail` | Real sites: 3/5 carry one. |
| `hero-act-merge` | promise + embedded search/form/zip input | `promise`+`act` | Service sites: the hero IS the first action. |
| `link-grid` | city/area/category link grid — **text-index links only, never cards** | `detail` | Service-area pages + marketplaces (hipages, taskrabbit). See `text-index` for the canonical shape; `link-grid` names the page-level pattern. |

**Banned as composition rows:** icon+heading+text card grids *used as
a substitute for a real composition*; "eyebrow + h2 + 3-col card"
repeated on consecutive sections; any layout that is just
`max-w-prose mx-auto text-center` without a declared job.

## 3. Page-type canonical sequences

`page_class` (from `sitemap.md` / content `type`) names the page's
kind — it feeds the template mapping (S5 spec §"page classes"), not
the section order directly. The money-page sequence above is the
reference skeleton for `money` routes; `article` routes default to
`promise → detail* → act`; `ancillary` routes to
`promise → detail* → act`. Verified real pages interleave
`detail`/`proof`/`objection` differently
(`research/CATALOG-VERIFICATION.md`) — hard invariants only: promise
first, act first-and-last, exactly one contrast moment. Reordering is
allowed only by editing `DESIGN-PLAN.md` and logging why.

## 4. Adjacency and repetition rules (the rhythm rule)

Verified against 5 real service-business pages
(`research/CATALOG-VERIFICATION.md`); corrected once already.

- Adjacent sections MAY NOT share the same `composition`. Surface
  alternation is the *recommendation*, not a hard rule — real good
  pages often hold one light surface for most of the page (Urban
  Company runs ~80% on one base) and spend ONE contrast moment, not a
  checkerboard. The checkable rule is composition variety + the
  contrast moment + the fold boundary, not forced alternation.
- `inverse` surfaces ≤ 2 per page + footer; `brand` ≤ 1 per page —
  verified: every observed page has exactly one contrast moment.
- `spacious` density is spent at `promise` and `act` — the two rests —
  plus at most one interior section. Uniform `regular` everywhere is the
  "undecided rhythm" defect.
- The first interior section after the hero is always a different
  surface than the hero (contrast at the fold boundary) — verified
  across all 5 captures.
- `media` surface only under a real image overlay (background image or
  video); never as a tint.
- `act` appears TWICE on a money page: once merged into the hero
  (search/form/CTA), once late-page. Verified across all 5 captures.
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
