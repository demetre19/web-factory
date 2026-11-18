# DESIGN-INTAKE — operator runbook

How a site's design authority enters the Web Factory. S5 consumes exactly
two kinds of input — a DOX packet (`site/design/*.zip`) or captured refs
(`site/design/refs/`) — and this document is the front end for the refs
branch: four intake scenarios, one decision tree, one convergence point.
Stage mechanics live in `research/WEB-FACTORY-S5-DESIGN-DNA.md`; this file
chooses what feeds the distill, never how the build runs.

## Constants (non-negotiable, every path)

- **GOLDEN RULE: ASTRO is the goal; TAILWIND is non-negotiable.** Every
  artifact from W6 on is an Astro page/component in one project; every
  preview before W6 is self-contained HTML under `preview/` (P.1).
- **One unit, one gate** — a page is assembled from sections; each
  section has a contract, a builder and its own gate (SB.1–SB.4,
  `design/SECTION-BUILD.md`).
- **No emoji, ever** — icons are inline SVG (currentColor,
  token-sized, aria-hidden). Stars, checks, arrows ship as paths;
  emoji/symbol glyphs are a design ban (P.10).

- **Astro** — the only build target; `target: react`/`html` refuses.
- **Tailwind** — `@layer components` classes, one owner per class (P.2).
- **Lucide-only icons** — inline SVG, `currentColor`, sizes ∈
  {16,20,24,32,48}, stroke ∈ {1.5,2,2.5,3} (P.11).
- **Speed budget** — JS ≤ ~50 KB, mobile perf ≥ 90, LCP ≤ 2.5 s,
  CLS ≤ 0.1 (P.12).
- **Mobile budget** — 360 render, no horizontal scroll, targets ≥44 px
  (P.13).
- **Mobbin refs** — every composition cites a real captured reference
  (P.14).
- **SPEC verbatim** — the STUB's headings and `fs` render verbatim;
  design never rewrites copy (P.15).
- **Burst is declared** — `burst: 0–3` in the plan, one wildcard
  option max, invariant rules never broken (B.1–B.5).
- **Fluid everything** — utopia-style `clamp()` scales for type *and*
  space, viewport-anchored to the 320–1440px responsive floor. Fluidity
  ships as tokens in `TOKENS.json` fluid pairs, never per-element
  improvisation.

- **Previews open themselves** — every HTML artifact offered to the
  operator (direction cards, `preview/system.html`, page previews)
  is opened in the operator's default browser automatically the
  moment it exists. Never handed over as a link or a path to click.

## The guided direction loop — analyze, propose, ratify

How the operator conversation runs on any path that ends in
`site-intake variants` *or* a redesign request ("redesign
<url>'s home page"). Analysis first; questions only for gaps;
the operator never configures settings — they pick a direction.

## Redesign path — Phase 0 diagnosis before any card

When the request is "redesign <existing page>", the loop gains a
Phase 0 *before* direction cards. The existing page is evidence,
not a blank brief — the agent must diagnose it, not just reuse it.

**Step 1 — defect table.** The live page is audited against (a) the
STUB's heading vector (missing macro answers, wrong H1 form, vector
drift) and (b) `design/rules/` mechanical rules (density rhythm,
contrast moment, disclosure, banned patterns). Output: a table of
named defects with evidence — never vibes.

**Step 2 — keep-list.** Real assets extracted: photos, logos,
accreditation marks, accent colour, copy that already works. These
are T1 — cards reuse them verbatim, never replace with placeholders
or stock.

**Step 3 — preference ask (structured, one batch).** Before cards,
the operator answers three questions:

1. *Likes* — what survives? (multi-select from the page's real
   blocks + "rebuild entirely")
2. *Dislikes* — what defects matter? (multi-select from the defect
   table + anything the audit missed)
3. *Density* — the disclosure pick: light (FAQ collapses, scope
   stays open) / medium (FAQ + micro-zone fold) / heavy (everything
   compressible folds; page ≈5–6 quiet blocks).

The density answer binds `disclosure:` per plan row — macro stays
`open` (the article must read), micro folds per the pick. "Less
cluttered" is a selection from {open, collapsed, tabbed}, never a
redesigner's hunch.

**Only then Phase B** — three cards that *fix the named defects*,
carry the keep-list verbatim, and apply the chosen disclosure tier.
A card that ignores a named defect fails Phase B review.
Phase 0's ask is a `disclosure` decision, so it's exempt from the
"zero questions" rule — but it still ships in one structured batch,
never a conversation.


**Phase A — analyze (zero questions).** From the site and/or brief,
extraction pass (DESIGN-PLAN §Guideline prefill) fills:
who / one_action / worst_case from the copy; the `rhetoric` sequence
from the page's argument; `extracted` tokens (fonts, hexes) where
computable; `inferred` direction axes and asset inventory
(first-party photos/logos = T1 keep-list). Nothing is asked before
this is on the table.

**Phase B — direction cards (the only choice).** The agent presents
**three cards**, never settings. Each card is a coherent bundle:
a one-line name, all six `direction` axes, the `refused` it
replaces, and an ASCII sketch — the **full money-page skeleton**,
every planned section as a labeled box, ~40–80 lines, annotated
`surface`/`density`/`composition`, contrast moment and S-M-L rhythm
visible, same canvas width across all three cards so they're
comparable at a glance. (Type/colour can't show in ASCII — that's
what the axis row is for; layout, density, and rhythm can, and
that's what the operator is choosing between.) Cards
must differ on ≥3 axes — same direction in different wrappers is
fraudulent variety. The operator picks one or remixes
("A's axes, B's hero") — that single answer fills `direction:`.

The three cards ship as ONE file:
`design-proposals/<site>/<page>/cards/index.html` — greyscale
WIREFRAMES (Balsamiq idiom), one level above ASCII, never a styled
mock. A sticky segmented switch
(`Design 1 · Design 2 · Design 3`, labelled with the card names)
sits fixed at the top of the page; pressing it swaps the rendered
wireframe instantly — same page, no navigation, no scrolling back.
Each design is a complete wireframe of the full money page: media as
outlined boxes with a diagonal X, body copy as rounded grey bars,
buttons as outlined rects with real short labels, disclosure folds as
outlined `▸` rows kept closed, logos and cert marks as outlined
slots. Logo/cert strips distribute evenly across the content width
(space-between or equal grid cells), landscape slots of one size —
a left-clustered logo row is a defect. Primitives available: X-box
media, video, copy bars, real headings, outlined CTA, folds, logo
strip, stat blocks, inverse panel, form (fields, select, radio,
checkbox), ghost secondary CTA. Section tags annotate collapse
behavior per breakpoint. Video = an X-box at its
declared aspect ratio, same sizing rules as images. **Media sizing
invariant:** every media primitive (image X-box, video) renders at
its declared V.3 aspect ratio — height = width ÷ ratio at every
viewport; a media block with zero/collapsed height, or chrome (play
button, chip) outside its box, is a defect. Nav collapses to a burger
below tablet — one row always. Headings are real text —
the **per-direction type
scale is the only real design value on a card**: correct ranks
(`clamp()` in `cqi` units), the H1 query-small on a detail page, the
claim at display rank, macro H2s readable, fold labels smaller still.
Everything else is deliberately undecided: no brand colour, no real
fonts beyond a neutral sans, no icons, no decorative detail — fonts,
colour roles, radius and spacing-as-feel are judged at W5
`preview/system.html`, not here. Wireframes render at true scale: Desktop
frame 1280px, Tablet 768, Mobile 360, each 1:1 (stage scrolls; never
zoom/shrink to fit). Real section heights at their density tokens,
real type sizes from the direction's scale, real media aspect ratios.
A thumbnail or miniature wireframe is a defect — it hides the spacing
and hierarchy the operator is judging. Half-styled cards fail twice —
they invite critique of undecided detail and bury the one decision
that matters: structure plus type hierarchy. **This is the
operator-approved fidelity level for Phase B:** ASCII stays inline
for the chat glance only, half-styled HTML is banned at Phase B, and
the wireframe file is the persistent artifact. Template:
`templates/wireframe-cards/` — every card set is instantiated from
it; never hand-rolled.

The same sticky bar carries a second segmented switch — **viewport:
Desktop · Tablet · Mobile** (1280 / 768 / 360). Choosing one shrinks
the render frame to that width and the design re-flows live. Because
the frame isn't the browser viewport, cards use **`@container`
queries** (the frame is `container-type: inline-size`), never
`@media` for the collapse — the 360 render inside the frame is the
real mobile layout, not a zoomed-out desktop. `@media` remains legal
only for features a container can't express (`prefers-reduced-motion`,
`hover:hover`, print).

Cards are built **mobile-first** (R.1 `min-width` only): the default
styles are the 360 layout, `min-width` container queries expand to
desktop — the Mobile 360 frame shows exactly the rules that apply at
360. Every `split-media`/grid section in a card must implement its
R.3 collapse and `stack: text-first` order for real, not describe it.

**Neutral placeholders rule:** every lo-fi artifact (cards,
wireframes, ASCII) renders in neutral grey on a single grey ramp —
image/media placeholders, icon slots, logo blocks, copy bars, and on
cards the entire surface including the CTA. Coloured placeholders are
banned: they lead the eye, imply a treatment that isn't decided, and
compete with an accent that isn't chosen yet. The C.1 role map (bg,
surface, ink, accent, inverse) first appears at W5
`preview/system.html`,
never on a card.

**Real-assets rule:** when the operator supplies a site (redesign)
or content, the *extracted* artifacts bind the cards — the site's
accent colour is a brand constant, not a direction choice (recorded
in the keep-list; it binds the W5 render, not the greyscale card);
extracted headings and CTA labels fill the card's real text, never
invented. Content dictates layout: section selection fits the
extracted content inventory — a direction never demands copy that
doesn't exist, and copy is never rewritten to flatter a layout.

**Phase C — confirm the open fields.** Whatever Phase A left
`inferred`, the cards' pick usually resolves; remaining gaps get
asked in one batch: audience nuance, CTA person, media availability
on unproven pages. Optionally: "any sites whose *feel* you want?" —
feeds the extraction pass to sharpen `snapped`/`inferred` picks;
skipped means they stay inferred, never blocking.

**Rules of the loop:**

- Never ask a question the site or brief can answer. The question
  budget is ~3–5, spent on gaps only.
- Never present axis-by-axis settings ("warm or cool? serif or
  sans?") — that outsources design reasoning to the operator.
  Choices are always *directions*: coherent, named, comparable.
- Cards carry the `refused` — the operator sees what each direction
  is *not*, which is half the information.
- The picked card lands in `DESIGN-PLAN.md` `direction:` + the
  keep-list in `media.assets`; the remix lands in `decisions[]`.

## The decision tree

```text
NEW-WEBSITE
   │
   ├── existing site? ── no ──> inspirations provided?
   │         │                      ├── yes ──> capture inspo URLs ──> refs/ (role: inspiration)
   │         │                      └── no  ──> site-intake variants ──> operator picks 1 ──> refs/ (role: variant)
   │         │
   │         └── yes ──> site-intake crawl (captures → refs/ (role: baseline), facts → site-brief.draft.md)
   │                      │
   │                      └── design authority?
   │                           ├── replace with inspirations ──> refs/ (role: inspiration)   [Scenario 2]
   │                           ├── replace with variants ──────> refs/ (role: variant)       [Scenario 1b]
   │                           └── improve in place ───────────> refs/ baseline + design/audit.md [Scenario 4]
   │
   └── ALL paths ──> site/design/refs/ (+MANIFEST.md) ──> S5 distill ──> design-dna/ ──> build ──> sites/<slug>/
```

## The four scenarios

`design_mode` is one intake field set at S0 alongside `existing_site_url`;
it picks the row below.

| design_mode | Scenario | refs/ content | Facts source | Extra input |
|---|---|---|---|---|
| `variants` | 1 — greenfield, no inspo | generated variant pick (`role: variant`) | full S0 Q&A | — |
| `refs-inspiration` | 2 & 3 — site exists or not, inspo given | inspiration captures (`role: inspiration`); existing-site captures kept as `baseline` evidence | crawl draft when site exists, else full S0 Q&A | inspo URL list |
| `inspo-text` + `variants` | client gives a draft whose copy is right but visual is throwaway | draft capture (`role: inspo-text` — copy/sections only) + generated variant for the real design | crawl draft when site exists, else full S0 Q&A | vercel/Figma/etc draft URL |

| `audit-remodel` | 4 — existing site, UX improvements | existing-site captures (`role: baseline`) + `site/design/audit.md` corrections | crawl draft | ux-auditor pass |
| `refs-existing` | 2-lite — rebuild same look | existing-site captures (`role: baseline`), no audit | crawl draft | — |
| `dox` | operator drops a DOX packet | packet is authority (existing contract) | per S0 | `site/design/*.zip` |

## The three artifacts this document adds

1. **`refs/MANIFEST.md`** — every capture row classified
   `baseline | inspiration | variant`, with `source_url`, `captured_at`,
   `viewport`. Baseline = extract identity. Inspiration = extract
   character. Variant = the picked direction, authored contract-shaped.
2. **`site/design/audit.md`** — `audit-remodel` only. The ux-auditor
   output against the baseline captures; the distill's "correct, don't
   replicate" instruction set.
3. **`site/site-brief.draft.md`** — crawler-prefilled brief. Extracted
   facts carry `extracted:` provenance; gaps carry `TODO:`. The
   operator edits one file instead of answering a long Q&A; nothing
   inferred ships unflagged (the never-fabricated rule applies to the
   intake exactly as it does downstream).

## site-intake tool

`tools/site-intake/site-intake.mjs` — zero-dep Node ≥18 script, run
before the run mints (out-of-band: it feeds the two existing gates, it
is not a third).

```bash
# Scenario 4 / 2 / rebuild: capture an existing site
node site-intake.mjs crawl https://oldsite.com --out site/design \
    --brief site/site-brief.draft.md
#   writes refs/<NN>-<slug>.html (same-origin pages, sitemap.xml first,
#   <a> fallback, cap 20), refs/MANIFEST.md, tokens-raw.json,
#   site-brief.draft.md

# Add inspiration captures (Scenario 2/3)
node site-intake.mjs capture https://inspo.example.com --out site/design \
    --role inspiration

# Scenario 1: generate contract-shaped directions (flags: --roles
#   designer[,designer-alt]  --char <chars>  --accent <hex>  --air <n>)
node site-intake.mjs variants --out site/design/refs \
    --brief site/site-brief.md
#   writes variant-<id>-<char>.html per role (Tailwind-classed, clamp()
#   token block embedded as <script id="tokens">), operator picks →
#   MANIFEST marks it role: variant
```

The distill lane treats a `variant` row exactly like a reviewed capture:
its embedded token block is contract-shaped `clamp()` pairs, so
extraction is verbatim, not derived.

## The plan before the preview

`site-intake variants` produces *token skeletons* only — it is a preview
of the system, never the design. The real design decision lands in the
distill lane as `DESIGN-PLAN.md` (`docs/machinery/DESIGN-PLAN.md`):
idea, rhetoric sequence, forced direction, closed system numbers, motif,
and per-section `speech_act`/`category`/`surface`/`density`/`composition`
selected from `docs/machinery/SECTION-CATALOG.md`. A variant pick is the
*direction input* to that plan; the plan is still written fresh every
run so no two sites ship the same surface music.

## Design roles

`pi/designer` is the default — it owns the design lanes (distill
`design-dna-<site>`, build `web-build-<site>`); never a model literal
in the spec, the role binds in `~/.omp/agent/config.yml` modelRoles.
`pi/designer-alt` is opt-in per run for more variety: pass
`--roles designer,designer-alt` to `site-intake variants` for a
second variant set (same brief, different mind — a real A/B pick),
or assign it the ux-auditor counter-review in `audit-remodel`.

## Invariants

- One convergence: every path lands in `design-dna/`. No second build
  path per scenario — same principle as the DOX/refs split.
- Two gates only (D3): variant picking happens in the tool's own
  out-of-band preview, never a typed pipeline gate.
- Never fabricated: crawler facts are `extracted:`-flagged evidence;
  the operator's edit pass is the ratification.
- Scenario 4 sub-case: a factory-emitted `sites/<slug>/` never re-runs
  the pipeline for UX tweaks — that's `/ux-audit` + `/restyle` inside
  the S7 operator loop.
