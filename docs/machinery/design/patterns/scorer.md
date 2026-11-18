---
id: scorer-patterns
type: scorer
links:
  index: design-index
  used_in: [w3, w8]
  consumes: [patterns-index, gate-checks]
  derives_from: [patterns-index]
---

# SCORER — predicted quality from pattern fit

`tools/design-gate/score.py` scores a page or a set of section options
**before** it is built, so W2 can rank options and W5 can catch a
composition choice that the mined corpus does not support. It is a
predictor, not a gate: it never fails a build, and it always prints the
reasons behind a number.

## Commands

```bash
python3 tools/design-gate/score.py score <file> \
    --site-type services --page-type service-detail [--json] [--weights f.json]
python3 tools/design-gate/score.py label --option d2 --score 81 \
    --features '{"...": 1}' [--chosen 0]     # record a human judgement
python3 tools/design-gate/score.py fit               # refit from >=20 labels
python3 tools/design-gate/score.py novelty --profile services \
    --genotype '{"layout-archetype": "split-media", ...}'
python3 tools/design-gate/score.py validate [--seed 7] [--holdout 0.25]     [--seeds 8] [--image]
python3 tools/design-gate/test_design_gate.py        # CLI end-to-end checks
```

`score` on a cards file (options marked `class="card" id="dN"`) prints
one ranked row per option with each section's composition, its best
pattern match, and the reasons behind the number. `validate` rebuilds
the pattern bank from the training domains only, cross-fits the training
rows out-of-fold, scores the held-out domains, and writes
`patterns/data/validation/validation.json`,
`fitted-weights.json` and a score-distribution PNG. `--seeds 8` repeats
it over eight independent domain splits and writes `seeds.json`
(`seeds_image.json` with `--image`) with mean/sd/min, because one split
is a coin flip.

`label` + `fit` are the human-in-the-loop path: a designer records
"option d2 was the one we shipped, at score 81"; after 20 labels, `fit`
refits the weights from real preference rather than from the corpus.

## What a score is

Each section is annotated with the same pixel pass the corpus used
(`patterns/tools/image_features.py`), encoded to a genotype
(`tools/design-gate/genome.py`), and compared with the pattern bank.

| Component | Weight | What it measures |
|---|---|---|
| `pattern_fit` | 0.34 | cosine similarity of the section genotype to the best-matching pattern signature in the bank |
| `ps` | 0.12 | mean of the six page-structure checks (roles, boilerplate edges, main-content share, media binding, footer, priority order) |
| `block_role_uniqueness` | 0.09 | no two blocks doing the same job |
| `boilerplate_at_edges` | 0.09 | chrome stays at the edges, not inside the content run |
| `main_content_share` | 0.10 | the main block owns the page |
| `media_context_binding` | 0.08 | media sits with the text it explains |
| `footer_is_boilerplate` | 0.06 | the footer reads as chrome |
| `priority_order` | 0.06 | the first block is the page's promise |
| `macro_micro` | 0.06 | page density against the band the corpus prefers |
| `s_block_pace` | 0.10 | how many blocks the crop stacks (curated 0.82 vs generic 0.32) |
| `s_cta_presence` | 0.10 | one block is an action (curated 0.89 vs generic 0.15) |
| `s_row_regularity` | 0.06 | even block sizing — *high* is the generic tell (0.87 vs 0.38) |
| `s_prose_mass` | 0.04 | prose weight in the crop |
| `anti` | 0.08 | 1.0 minus the measured anti-pattern penalties (`data/anti.json` → `features`) |

The last five exist because the six `PS.*` checks are *page* checks and
do not transfer to a section crop (VALIDATION.md §5). They are measured
on the crop itself from its block list.

These are the shipped weights. `validate` records the *fitted*
coefficients in `patterns/data/validation/fitted-weights.json` as
evidence about the corpus — several are negative because the contrast
corpus is framed differently, and clipping them would ship a model that
is no longer the validated one. `score` therefore runs on the prior
above; `--weights <file>` accepts an alternative whose key set matches
exactly, and refuses anything else with a message instead of a
`KeyError`.

## How good is it

Held-out AUC **0.932** (target 0.85), precision@10% **1.00**; mean over
eight domain splits **0.925 ± 0.017**. Adding the CLIP image-fit layer
takes the same split to **0.946** and the eight-seed mean to
**0.939 ± 0.016** (`validate --image`). Numbers, the failing features
and the limitations are in `patterns/VALIDATION.md`. The short version:
the section-shape features and the measured anti layer carry most of
the model; `pattern_fit` adds a smaller, independent contribution; the
page-structure checks still transfer only in a distorted way across the
two corpora and keep their positive prior for that reason.

## Boundaries

- It scores **structure**, not copy. It cannot tell a good headline from
  a bad one; `check_heading_verbatim` and the speech-act checks do that.
- It needs a site type and page type to pick a bank slice; without them
  it falls back to the cross-vertical bank and says so.
- It is not a substitute for the gate. A page can score 90 and still fail
  `check_contrast`.
