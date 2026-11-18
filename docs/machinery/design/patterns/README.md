# PATTERNS — the mined composition library

A searchable library of proven section designs, learned from 2,700
curated Mobbin sections across 26 site types, encoded in a closed
20-gene vocabulary, and scored against a 492-section contrast corpus of
generic pages. It exists so that a design decision can cite evidence
instead of taste.

```
TAXONOMY.md    the cell grid: site_type × page_type × section_type, and
               the annotation schema every record must satisfy
INDEX.md       the 88 pattern rows (generated table, lookup surface)
VALIDATION.md  does pattern fit predict quality? AUC 0.895 section-level,
               AUC 0.753 page-level, and what fails
scorer.md      the graph node for tools/design-gate/score.py
<site>/<section>/pattern-<site>-<page>-<section>-<composition>.md
```

## Use it

```bash
# what patterns exist for this job?
python3 tools/design-gate/patterns.py search "saas pricing page" --k 5
python3 tools/design-gate/patterns.py search "commercial cleaning hero" \
    --site-type services --page-type service-detail
python3 tools/design-gate/patterns.py lookup --section faq
python3 tools/design-gate/patterns.py show pattern-services-service-detail-hero-stacked-hero

# genome space: rank patterns by genotype distance
python3 tools/design-gate/patterns.py search \
    '{"layout-archetype":"split-media","density-tier":"regular"}' --genotype

# score a proposal before building it
python3 tools/design-gate/score.py score path/to/cards/index.html \
    --site-type services --page-type service-detail

# checks
python3 tools/design-gate/test_design_gate.py
```

Search is hybrid over two independent descriptions of a pattern:
**what it says** (nomic text embedding, 768d) and **what it looks like**
(CLIP ViT-B/32, 512d, mean of the pattern's evidence crops). Weights are
`W_TEXT = 0.55`, `W_IMAGE = 0.30`; they renormalise over whichever
layers exist, so a machine without the vision model degrades to
text-only rather than to noise. On top sits **intent boosting** — a
query naming a section adds 0.35 to patterns in that section, naming a
site type adds 0.25. `--weights text=0.8,image=0.2` overrides; the
numbers live at the top of `patterns.py` so a surprising rank is
explainable.

```bash
python3 tools/design-gate/patterns.py search "gold jewellery on black velvet"          # text
python3 tools/design-gate/patterns.py search "gold jewellery on black velvet" --vision # + CLIP
```

## Build it

```bash
# 1. mine Mobbin (resumable, paced, token refreshed per run)
cd docs/machinery/design/patterns/tools && python3 mine.py fetch
# 2. capture the contrast corpus (headless Brave) and split it into bands
uv run --quiet capture_negatives.py && uv run --quiet split_negatives.py
# 3. annotate both corpora deterministically
uv run --quiet annotate_det.py mobbin && uv run --quiet annotate_det.py negatives
# 4. cells → signatures → pattern files + INDEX table
python3 build_patterns.py
# 5. genome + vertical profiles
python3 tools/design-gate/genome.py build
python3 tools/design-gate/genome.py profiles
# 6. search index
python3 tools/design-gate/patterns.py index
```

`data/` holds ~630 MB of captures and is gitignored; the derived
artefacts (`pattern-index.json`, `genome.json`, `genotypes.jsonl`,
`anti.json`, `validation/`) are committed.

## What a pattern is

A cell (site type × page type × section type) becomes a pattern only
when it has **n ≥ 10** annotated screens and a gene subset that reaches
**≥ 60% prevalence**. The signature is the *largest* such subset —
size 3, then 2, then 1 — so a pattern never claims more structure than
the data supports. No pattern, no row: the library has no placeholders.

Frontmatter is the graph contract:

```yaml
id: pattern-services-service-detail-hero-stacked-hero
type: pattern
site_types: [services]
page_types: [service-detail]
section_type: hero
speech_acts: [promise]
composition: stacked-hero            # SECTION-CATALOG §2, closed set
prevalence: 0.7
n: 30
evidence: [https://mobbin.com/sites/sections/…, …]   # ≥1, up to 10
implies_rules: [C.1, W.2]
enforced_by: [check_emphasis, check_section_enums, …]
used_in: [w1, w5]
links:
  index: patterns-index
  composition: section-catalog#stacked-hero
```

## Genome

`docs/machinery/design/dna/GENOME.md` defines 20 orthogonal genes with
closed allele sets (99 one-hot dims). Every page is a genotype; the
genotype **is** the embedding for genome-space search, so no model is
needed to compare two designs.

```bash
python3 tools/design-gate/genome.py profiles            # 26 vertical DNA profiles
python3 tools/design-gate/genome.py mutate --profile services --burst 2 --seed 7
python3 tools/design-gate/genome.py novelty --profile services \
    --genotype '{"layout-archetype":"split-media", …}'
```

`mutate` explores within the vertical's alleles and reports novelty
against the corpus median; a burst that exceeds the bound is refused, so
"different" never silently becomes "unproven". Vertical profiles live in
`docs/machinery/design/dna/<vertical>.{md,json}`.

## Capture validity — the gate before everything

A screenshot of a Cloudflare challenge, a 404, a parked domain or a
blank render is not a design. Counted as evidence it corrupts every
number downstream, so `patterns/tools/capture_ok.py` decides, from
evidence, whether a capture is a page at all:

```bash
cd docs/machinery/design/patterns/tools
uv run --quiet capture_ok.py probe     # HTTP evidence -> meta.probe
uv run --quiet capture_ok.py verdict   # -> capture_status + quarantine.json
uv run --quiet capture_ok.py report    # counts by status/source
```

| status | evidence |
|---|---|
| `blocked` | challenge/WAF text in the page ("Just a moment", "Performing security verification", "Checking your browser", access denied, vendor markers) |
| `error` | HTTP ≥ 400, no response, 404/500/error page text |
| `parked` | domain-for-sale / parking service / placeholder text |
| `blank` | every tile flat (luminance std < 2), or a flat first tile with content below |
| `ok` | none of the above |

Two measurement decisions worth stating, because both were wrong first
time: the blank test is **luminance variance, not ink** (a black-on-black
luxury page has no "ink" but plenty of variance), and **trailing flat
tiles are a short page, not a failure** — the capture window is 6000 px
tall, so a 2-viewport page ends in white. `content_tiles` records the
real extent.

The gate is wired as a hard step in `capture_web.py` and
`capture_negatives.py` (a capture is recorded with its verdict before
anyone can use it), `split_negatives.py` and `annotate_det.py` skip
non-ok sites, and `tools/design-gate/corpus_filter.py` is the single
reader every consumer uses — patterns, genome statistics, embeddings,
search index, scorer training and VALIDATION all drop the same rows.
`data/quarantine.json` lists the excluded sites with their reasons.

**Corpus effect: 55 of 218 captures (25%) were not pages** — 47 of 174
web (27%) and 8 of 44 negatives (18%), plus 55 empty white bands that
`split_negatives.py` had cut out of short pages and counted as negative
sections. See VALIDATION.md §2 for what that did to the numbers.

## Embedding backends — what is live

| Layer | Model | Dim | Where | Committed artefact |
|---|---|---|---|---|
| text | `nomic-embed-text` (ollama, `localhost:11434`) | 768 | `index/vectors.json` | yes |
| image | `open_clip` ViT-B/32 `laion2b_s34b_b79k` | 512 | `data/image_vectors/` | vectors yes, crops no |
| genome | 20 genes, one-hot | 99 | `data/genome.json` | yes |

`index/meta.json` records `"backend": "nomic:nomic-embed-text"` — the
field is read by `search` and never guessed. Both embedders **fail
loudly**: if the ollama daemon is down, `index --backend nomic` and
`search` exit with the reason instead of silently ranking by something
else, because a silent fallback makes the `backend` field a lie.

Text embedding batches 16 inputs per `/api/embed` call (ollama truncates
larger batches without saying so), asks the daemon to `keep_alive` for
2 h, retries three times with exponential backoff and gives up after
300 s. Rebuild: `python3 tools/design-gate/patterns.py index --backend nomic`
(88 patterns, ~50 s).

Image vectors cover all 3 888 crops (2 700 Mobbin screens, 492 contrast
bands, 696 reference-site tiles) in 4.0 MB of float16 — the crops
themselves stay gitignored. Rebuild:

```bash
cd docs/machinery/design/patterns/tools
uv run --quiet embed_images.py build    # 106 s on MPS
uv run --quiet embed_images.py means    # 88 pattern means
```

ViT-B/32 is 151 M params / ~600 MB, small enough to install without
asking. Anything larger is an operator decision.

## Intent layer — what a site is trying to be, measured

`patterns/tools/intent.py` reads each valid capture's copy and pictures
and records what they claim and what they do:

```bash
python3 intent.py text     # visible copy -> meta.page_text (threaded)
python3 intent.py extract  # attributes/audience/CTAs -> meta.intent + choices
python3 intent.py model    # P(choice | vertical, attribute, audience)
python3 intent.py graph    # knowledge-graph nodes -> patterns/intent/
```

17 brand attributes and 13 audiences are found by a **closed cue
lexicon** — every hit keeps the matched sentence as evidence, so an
attribute is a quotation, not an impression. Choices are the measured
alleles (surface, accent, page length, imagery, medium, image style,
energy, register). The conditional model labels each choice
conventional / deliberate deviation against its vertical.

53 knowledge-graph nodes under `patterns/intent/` (17
`intent-attribute-*`, 36 `intent-choice-*`, reachable via
`patterns-index -> intent-index`) carry the P(choice | vertical) and
P(choice | attribute) tables, so W1/W2 can cite a node and get the
numbers.

**What it is not: a quality predictor.** On the 124 valid captures
(80 reference vs 44 template), intent features alone score AUC 0.535 —
no better than chance — and add nothing over structural (0.616 vs
0.618). See `data/validation/intent.json`. The layer is a contract for
W1/W2 ("the brief claims luxury; the variant picked everyday") — the
quality scoring stays structural + image, as validated. Mobbin screens
carry no copy, so Mobbin-vs-negatives intent validation is not
measurable; that is stated, not hidden.

`patterns/tools/annotate_web.py` fills the rest of the capture meta:
`images[]` per media block (CLIP zero-shot over CLASSIFY.md closed sets;
values below a 0.02 margin floor are emitted `other:ambiguous` with the
margin as evidence — CLIP cannot label arbitrary crops reliably and the
record says so), `ui_analysis` (provenance: extracted — palette from the
page border, grid and sections from the pixel pass), `set_summary`.

## Honest limits

- Section types come from the retrieval query plus pixel geometry, not
  from a vision model — intent is assumed, composition is measured.
- The contrast corpus is small (44 sites) and skewed to local-service
  templates.
- The anti-pattern layer holds three measured rows, not a taxonomy: a
  section with <0.4 block pace, no call to action, or near-perfect row
  regularity is 3.9-9.7x more common in the contrast corpus. Anything
  weaker was left out rather than invented.
- `pattern_fit` is a structural distance, not a quality judgement. It
  says "this looks like work from the curated corpus", nothing about
  whether the copy is any good.

Full numbers and the failure analysis: `VALIDATION.md`. Two studies, two
questions: section-level (does a section match a mined pattern?) and
page-level (does a whole page look like a real reference site?) —
`uv run --quiet patterns/tools/validate_pages.py`.
