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

Search is hybrid: text cosine over the pattern body plus **intent
boosting** — a query naming a section adds 0.35 to patterns in that
section, naming a site type adds 0.25. Weights are stated in
`patterns.py` and are deliberately simple so a surprising rank is
explainable.

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

## Embedding backend — status

The operator-facing embedder is `nomic-embed-text` at
`http://localhost:11434/api/embed` with `search_document:` /
`search_query:` prefixes, and it is wired:
`patterns.py index --backend ollama` and `patterns.py search` both use
it when the daemon answers. **It is not the active backend today**: the
local daemon took ~69 s for two texts and timed out at 120 s during
indexing under multi-agent load, so the index on disk is TF-IDF
(`index/meta.json` → `"backend": "tfidf"`). Switching is one command
when the daemon is healthy; no code change.

There is **no image embedder installed**. For visual similarity the
proposal is `nomic-embed-vision` (same daemon) or `open_clip` ViT-B/32
(~350 MB, CPU-friendly); neither is installed, because installing a
model is the operator's call, not the pipeline's.

## Honest limits

- Section types come from the retrieval query plus pixel geometry, not
  from a vision model — intent is assumed, composition is measured.
- The contrast corpus is small (44 sites) and skewed to local-service
  templates.
- The anti-pattern layer ships empty: no pixel feature separated the two
  corpora. The gate's structural checks carry that load instead.
- `pattern_fit` is a structural distance, not a quality judgement. It
  says "this looks like work from the curated corpus", nothing about
  whether the copy is any good.

Full numbers and the failure analysis: `VALIDATION.md`. Two studies, two
questions: section-level (does a section match a mined pattern?) and
page-level (does a whole page look like a real reference site?) —
`uv run --quiet patterns/tools/validate_pages.py`.
