---
id: design-genome
type: genome
links:
  index: design-index
  derives_from: [patterns-index]
  used_in: [w1, w2, w5]
---

# GENOME — the closed set of design genes and alleles

Every website is a **genotype**: one allele per gene. The gene set is
finite and small on purpose (20 genes). A gene is a *dimension of
design decision*; an allele is a *value in its closed set*. Freehand
values are refused exactly as freehand hex or spacing values are (P.8).

A **section** has a genotype (genes 1, 3, 4, 5, 7, 9–12, 14–16, 18–20);
a **page** has one too (genes 2, 8, and the aggregates of the rest); a
**site/vertical** has a **profile** — a distribution over alleles per
gene (`dna/<vertical>.md`).

Machine-readable contract: each gene heading is `## gene: <slug>`, and
the line `alleles: [a, b, c]` is the closed set `check_genotype` reads.
`rules:` names the SOP rule IDs that govern the gene.

Source: annotations in `patterns/data/annotations.jsonl` (Mobbin,
`source=mobbin`) and `annotations_negatives.jsonl` (contrast corpus,
`source=negative`) + `web_supplement_urls` captures. Cluster →
`tools/design-gate/genome.py build`; profiles → `genome.py profiles`.

---

## gene: layout-archetype

alleles: [split-media, stacked-center, full-bleed-media, card-grid-2, card-grid-3, card-grid-4, editorial-single, sequence-steps, accordion-list, table-matrix, horizontal-band, immersive-media, asymmetric-offset, masonry-grid, split-form, carousel-track]
rules: L.1, L.5, L.10
The section's physical skeleton — what the boxes are and how they
relate. Derived from the annotation's `composition` + `columns` +
`media_ratio`: a `split-media` with columns=2 is `split-media`;
`cards-n` at 3-up is `card-grid-3`; `full-bleed`/`media-gallery` with
`cinematic` is `immersive-media`. This is the gene W5 selects
compositions from.

## gene: page-macro-structure

alleles: [promise-proof-how-act, promise-detail-act, editorial-longform, catalog-first, conversion-short, immersive-narrative, index-grid-first]
rules: SECTION-CATALOG §3, E.1, L.7
The page's argument order, read off the section sequence. `catalog-first`
= product/PLP grids dominate before any narrative; `immersive-narrative`
= alternating full-bleed media and text; `conversion-short` = hero +
proof + act only.

## gene: density-tier

alleles: [compact, regular, spacious]
rules: G.3, L.7
Vertical rhythm per section. From annotation `density`. Uniform
`regular` everywhere is the "undecided rhythm" defect; good pages
spend `spacious` at promise/act.

## gene: image-led-ratio

alleles: [text-led, balanced, image-led, media-first]
rules: V.1, V.3
Bands over `media_ratio`: text-led <0.25 · balanced 0.25–0.55 ·
image-led 0.55–0.80 · media-first >0.80. Luxury/fashion/architecture
profiles cluster at image-led+; SaaS/docs at text-led.

## gene: type-contrast

alleles: [low, medium, high, extreme]
rules: T.1, T.4
Bands over `heading_body_ratio`: low <2 · medium 2–3.5 · high 3.5–6 ·
extreme >6. T.1's 3×–6× primary tier lands in `high`.

## gene: display-face

alleles: [serif, sans, mono, mixed]
rules: T.2, T.6
The display typeface class (`serif_display` + section context). Serif
display is the luxury/editorial signature; mono is the dev-tool
signature.

## gene: radius-personality

alleles: [sharp, soft, pill, mixed]
rules: S.1, S.3
Corner treatment personality: sharp ≤2px, soft 4–12px, pill ≥16px or
fully round, mixed when the page deliberately contrasts.

## gene: surface-rhythm

alleles: [single-surface, alternating, one-contrast-moment, dark-dominant, media-interleaved]
rules: C.1, C.6, SECTION-CATALOG §4
How surfaces alternate down the page. Verified good pages run one base
surface with exactly ONE contrast moment; checkerboarding is the
defect.

## gene: cta-restraint

alleles: [single-primary, dual, multi, none]
rules: W.2, W.3, L.2
Count of competing CTAs per section: 1 primary only, 2 (primary +
secondary/ghost), 3+ (multi — usually a defect on luxury), none.

## gene: cta-rank

alleles: [hero, section, none]
rules: W.2, L.2
Where the visually strongest CTA sits in the section: merged into the
hero block, at the section's end, or absent.

## gene: disclosure-tier

alleles: [open, folded, tabbed, carousel]
rules: E.2, W.6
How secondary content is revealed: inline open, accordion/fold,
tabs, or carousel paging.

## gene: nav-pattern

alleles: [bar, bar-cta, mega, hamburger-only, side]
rules: L.9, R.5
The site header's shape. `bar-cta` (nav + persistent primary CTA) is
the services/SaaS default.

## gene: motion-tier

alleles: [static, subtle, expressive, cinematic]
rules: M.1, M.3, M.6
Motion ambition. Proxy from annotation: `cinematic` full-bleed media
canvas + section count; static = no media motion cues, subtle =
hover/reveal only, expressive = scroll choreography, cinematic =
video/full-bleed canvas as the page's spine.

## gene: proof-type

alleles: [none, logos, ratings, testimonials, certs, stats, case-study, mixed]
rules: SECTION-CATALOG §2, W.5
The evidence class a proof section carries. `certs` (accreditation
marks) is the local-service signature; `logos` the SaaS one.

## gene: media-treatment

alleles: [none, photo, screenshot, illustration, 3d-render, video]
rules: V.1, V.4
What the media *is*. `screenshot` is the dev-tool/SaaS signature;
`photo` the services/hospitality/luxury one.

## gene: columns

alleles: [1, 2, 3, 4]
rules: L.1, T.7
Main content column count. 1 = editorial measure; 2 = split; 3–4 =
grid.

## gene: heading-form

alleles: [claim, query, label]
rules: E.2, W.4
The heading's grammatical job: a claim ("Hand your tenancy back
inspection-ready"), a question ("What is vacate cleaning?"), or a
label ("Services").

## gene: whitespace-band

alleles: [tight, medium, airy]
rules: L.4, G.2
Bands over `whitespace_share`: tight <0.25 · medium 0.25–0.45 ·
airy >0.45. Luxury jewellery/architecture sit `airy`.

## gene: gallery-mode

alleles: [single-hero, grid, lightbox, carousel, before-after]
rules: V.5, L.10
How imagery is presented when a section is a gallery: one hero image,
a grid, a lightbox/detail viewer, a carousel, or a paired
before/after.

## gene: form-presence

alleles: [none, inline, panel]
rules: W.7, SECTION-CATALOG §2
Whether the section carries an input form: none, an inline
single-field capture, or a full `form-panel` (the only place a form
lives on a money page).

---

## Genotype vector

A genotype is the ordered tuple of alleles in the order above (20
values). `tools/design-gate/genome.py` encodes it as a one-hot vector
(Σ allele cardinalities = **99 dims**) for cosine/Hamming search; the
same vector is written into each pattern file's `genotype:` block and
each `dna/<vertical>.json` profile.

The space is finite by construction: 20 genes, 99 alleles, so at most
99 distinct dimensions and 2^99 label sets — but only 99·20 one-hot
positions can ever be set. No design can be expressed outside it, which
is the point: a freehand value is refused, not extrapolated.

## Saturation

A cell (`site_type × page_type × section_type`) is **saturated** when
the new-cluster discovery curve flattens: the last 20% of screens
sampled add <5% new layout-archetype clusters.
`python3 tools/design-gate/genome.py saturate` writes the per-cell
curves and verdict into `patterns/data/genome.json`; unsaturated cells
stay on the mining queue and produce no pattern.

**Current state (2,700 screens, 88 cells): 86/88 saturated.** The two
open cells are `technology/home/hero` and
`luxury-goods/product/add-to-cart` — both keep adding archetypes in
their last 20%, so their patterns are reported at n=30 but flagged
unsaturated rather than claimed as settled. Re-run the miner for those
two cells before treating their patterns as canonical.
