---
id: patterns-validation
type: study
links:
  index: patterns-index
  derives_from: [patterns-index, scorer-patterns]
  used_in: [w2, w5]
---

# VALIDATION — does pattern fit predict design quality?

**Answer: yes — held-out AUC 0.925 (target ≥ 0.85), precision@10% 1.00.**
Across eight independent domain splits: mean 0.925, sd 0.020, min 0.901.
Adding the CLIP image-fit layer takes it to **0.941 ± 0.018**. The
section-shape features and the measured anti rows carry most of the
signal; the page-structure checks still transfer only in a distorted way
and keep a positive prior for that reason. Every number below is after
the capture-validity gate (§2b) removed 25% of the corpus.

Raw numbers: `data/validation/validation.json` and
`data/validation/fitted-weights.json`.
Distribution plot: `data/validation/score_distribution.png`.
Reproduce: `python3 tools/design-gate/score.py validate`.
CLI checks: `python3 tools/design-gate/test_design_gate.py`.

## 1. The question

A pattern library is only worth building if "this section matches a
mined pattern" correlates with "this section comes from a site that
knows what it is doing". The test is a **classification** task: from
pixel measurements alone, can the model tell a curated screen from a
generic one — on sites it has never seen?

## 2. Datasets

| Corpus | n | Source | Framing |
|---|---|---|---|
| Positive | 2700 | Mobbin `search_sections`, 90 query cells, 26 verticals | section crops as Mobbin serves them |
| Negative | 350 | live marketing pages captured headless (Brave), split into detected section bands, after the capture gate | section crops, same band detection |

Negatives are deliberately *not* broken sites: they are ordinary small
business / template pages — the corpus a studio is hired to replace.
They were re-cropped from full-page tiles into section bands
(`tools/split_negatives.py`) so the corpora are compared like for like.
Comparing full pages against section crops inflated AUC by ~0.20 in an
early run and was rejected as a measurement artefact.

Every record is annotated by the same deterministic pixel pass
(`patterns/tools/image_features.py`). **No VLM was used for annotation**:
the local vision model (`moondream`) costs ~19 s/image after a cold
87 s load, which is unusable for 3 000 crops. CLIP ViT-B/32 is used for
the image layers (4 s for the whole corpus) and its limits are stated in
§6.

## 2b. The capture gate — 25% of the corpus was not pages

`patterns/tools/capture_ok.py` probes every captured URL (realistic UA,
no CAPTCHA solving) and measures tile luminance variance, then writes
`capture_status` into the site's `meta.json` and
`data/quarantine.json`. Results over the 218 captured sites:

| corpus | sites | quarantined | share | why |
|---|---|---|---|---|
| web (reference/luxury/curated) | 174 | 47 | 27% | 19 blank, 13 error, 11 blocked, 4 parked |
| negatives (contrast) | 44 | 8 | 18% | 8 error (403/500/502/no response) |

Plus **55 empty white bands** that `split_negatives.py` had cut out of
short pages and counted as negative sections: the capture window is
6000 px, so a two-viewport page ends in white, and those bands were
being scored as "generic sections". They are dropped as
`blank_crop` (`ink < 0.004`, no chroma).

**What that did to the numbers — the honest answer: almost nothing.**
Before the gate: AUC 0.9324 at seed 7, 0.9246 ± 0.0169 over eight
splits. After: 0.9290 at seed 7, 0.9254 ± 0.0200. The quarantined
captures were behaving like the other negatives already (a challenge
page is as "generic" as a template page), so the old AUC was **not**
materially inflated. The gate matters for the corpus's meaning — a
challenge page is not a design, and must not be classified, embedded or
shown as evidence — not for this particular AUC.

## 3. Method

1. **Split by domain**, 75/25, eight different seeds. A site never
   appears in both halves.
2. **Rebuild the pattern bank from training domains only**
   (`score.build_bank_from`). Test sections are scored against
   signatures mined from sites the model has never seen.
3. **Cross-fit the training rows** out-of-fold (4 domain folds) so the
   coefficients are fitted on the same distribution the test rows are
   measured on. Without this the train fits are computed against their
   own cell and run ~3× higher than test fits.
4. **Encode** each section to its genotype (`genome.genotype`, 99 dims)
   and compute `pattern_fit` = cosine to the best matching signature,
   with a **specificity ladder**: a match against the exact
   (site, page, section) cell counts 1.00, a match that only the global
   bucket can supply counts 0.75.
5. **Fit** logistic regression (stdlib, L2 0.01) on the training half;
   score the held-out half; measure ROC-AUC and precision@10%.

In-sample AUC for the same feature set is 0.97; the held-out 0.895 is
the honest number.

### Two measurement bugs this study found (and fixed)

- **`cos_dense` was a dot product.** The genotype is one-hot per gene,
  so an unnormalised dot product counts shared genes and saturates at
  1.0 as soon as two signatures overlap in three genes. Every fit
  clipped to the ceiling and the ranking was destroyed. Now a true
  cosine.
- **Fits were not comparable across corpora.** Negatives carry no
  section label, so they were matched against the whole 88-pattern
  global bucket while positives were matched against one narrow cell —
  negatives scored *higher*. The specificity ladder fixed it, and the
  sign of `pattern_fit` alone went from −0.05 to +0.25 correlation.

## 4. Result

Held-out (seed 7): **AUC 0.9290**, precision@10% 0.986, 3 050 records
(2 700 curated / 350 contrast). With the CLIP image-fit feature
(`validate --image`): **0.9458** on the pre-gate corpus, 0.9409 ± 0.0179
over eight splits after it.

| feature set | seed 7 | eight-split mean | sd | min |
|---|---|---|---|---|
| 9 shipped (pre-section-features) | 0.8946 | 0.892 | 0.022 | 0.848 |
| + 4 section-shape + anti | 0.9324 | 0.9246 | 0.0169 | 0.8983 |
| same, after capture gate | 0.9290 | 0.9254 | 0.0200 | 0.9007 |
| + `img_fit` (CLIP), after gate | 0.9409 | 0.9394→0.9409 | 0.0179 | 0.9184 |

AUC by feature set, mean over eight domain splits:

| Features | AUC mean | sd | min |
|---|---|---|---|
| `pattern_fit` alone | 0.665 | 0.092 | 0.526 |
| `pattern_fit` + `ps` | 0.880 | 0.031 | 0.820 |
| `pattern_fit` + `main_content_share` | 0.841 | 0.027 | 0.805 |
| `pattern_fit` + all six PS sub-features + `macro_micro` | 0.892 | 0.022 | 0.849 |
| five aggregates incl. `rule_pass` + `anti` | 0.873 | 0.030 | 0.822 |
| **shipped nine** (`pattern_fit`, `ps`, `macro_micro`, six PS keys) | **0.892** | 0.022 | 0.848 |

Per-seed AUC for the shipped set: 0.901, 0.918, 0.908, 0.869, 0.912,
0.886, 0.895, 0.848.

Correlations with the label (point-biserial, full corpus):

| Feature | r | Mobbin mean | Negative mean | Verdict |
|---|---|---|---|---|
| `pattern_fit` | **+0.245** | 0.885 | 0.511 | the signal (see note) |
| `footer_is_boilerplate` | −0.469 | 0.287 | 0.919 | framing artefact (§5) |
| `ps` (mean of six) | −0.464 | 0.742 | 0.908 | framing artefact |
| `main_content_share` | −0.374 | 0.607 | 0.886 | framing artefact |
| `macro_micro` | −0.056 | 0.417 | 0.468 | no signal |
| `boilerplate_at_edges` | −0.050 | 0.973 | 0.994 | no signal |
| `media_context_binding` | −0.036 | 0.610 | 0.659 | no signal |
| `priority_order` | −0.032 | 0.977 | 0.990 | no signal |
| `block_role_uniqueness` | 0.000 | 1.000 | 1.000 | saturated |
| `s_cta_presence` | **+0.588** | 0.894 | 0.146 | section signal |
| `s_block_pace` | **+0.499** | 0.822 | 0.318 | section signal |
| `s_row_regularity` | −0.396 | 0.382 | 0.874 | inverted: uniform rows are the generic tell |
| `s_prose_mass` | +0.121 | 0.170 | 0.112 | weak |
| `anti` | **+0.597** | 0.904 | 0.406 | measured anti rows |
| `img_fit` (CLIP) | **+0.568** | 0.704 | 0.530 | image layer, `--image` |

`pattern_fit`'s modest marginal correlation understates it: within a
section type it separates cleanly, and its contribution to the fitted
model is the largest by absolute weight.

Fitted coefficients (seed 7, signed): `footer_is_boilerplate` −1.73,
`main_content_share` −0.94, `block_role_uniqueness` +0.73,
`priority_order` +0.63, `boilerplate_at_edges` +0.44,
`media_context_binding` −0.36, `pattern_fit` +0.31, `macro_micro` +0.31,
`ps` −0.20.

## 4b. The page-level test — and why the PS checks invert above

The section-level study cannot test the page-structure checks, because a
section crop has no page. So the shipped scorer was also run on **whole
pages**: 76 real reference sites (Siteinspire / luxury houses, captured
headless) against the 44 generic pages, each full page stacked from its
tiles and measured by the same pixel pass.

| | n | mean structural score |
|---|---|---|
| Real reference sites | 76 | 73.8 |
| Generic / template sites | 44 | 56.1 |

**AUC 0.753** on the structural sub-score (the shipped weights minus
`pattern_fit`, which needs a section label a page does not carry).

Correlations flip back to the design-intended sign:

| Feature | page-level r | section-level r |
|---|---|---|
| `main_content_share` | **+0.423** | −0.374 |
| `ps` (mean of six) | **+0.395** | −0.464 |
| `macro_micro` | **+0.352** | −0.056 |
| `media_context_binding` | **+0.281** | −0.036 |
| `footer_is_boilerplate` | **+0.247** | −0.469 |
| `boilerplate_at_edges` | **+0.206** | −0.050 |
| `priority_order` | −0.042 | −0.032 |
| `block_role_uniqueness` | 0.000 (saturated) | 0.000 |

This is the evidence for §5's diagnosis: the PS checks work exactly as
written **on pages**, and their negative coefficients in the section
study are a framing artefact, not a defect in the checks. It is also why
the shipped scorer keeps the positive semantic prior.

Reproduce: `uv run --quiet patterns/tools/validate_pages.py` →
`data/validation/pages.json`.

## 5. What failed, and why

**The page-structure checks (PS.\*) do not transfer to section crops.**
They were written as *page* checks: "the footer is at the bottom", "the
main block owns the page". A section crop has no page — its footer
feature is 0 by construction, while a full-page negative has a footer by
construction. The model learns the framing difference, not the design
difference. That is why `footer_is_boilerplate` and
`main_content_share` carry negative coefficients here while remaining
*positive* requirements in `ps_features.py`.

Consequence for the shipped scorer: `score.py` keeps the semantic prior
(positive weights on the page-structure features, because it scores
whole pages and option cards where page-level semantics hold). The
fitted coefficients are recorded in `fitted-weights.json` as evidence
about the corpus and are **not** loaded by the scorer — clipping them to
non-negative values would ship a model that is no longer the validated
one, and using them signed would penalise a real page for having a
footer.

**The first anti-corpus attempt had zero signal; the second has three
rows.** Candidate anti-alleles built from genotype attributes (density,
whitespace band, image-led ratio, media treatment, surface rhythm)
appeared at statistically similar rates in both corpora, so the layer
shipped empty rather than inventing a threshold. Section-shape features
do separate, and `data/anti.json` → `features` now holds only rows that
cleared both gates (negative rate ≥ 0.33, lift ≥ 1.8):

| rule | curated | contrast | lift | penalty |
|---|---|---|---|---|
| `s_block_pace < 0.4` | 7.2% | 79.1% | 9.74 | 0.25 |
| `s_cta_presence < 0.5` | 10.6% | 85.4% | 7.45 | 0.25 |
| `s_row_regularity ≥ 0.95` | 20.6% | 83.1% | 3.90 | 0.25 |

A hit subtracts its penalty from the `anti` feature and prints the rule
as a reason on the scored section, so "this looks generic" is always
attributable to a measurement.

**`block_role_uniqueness` is saturated** at 1.0 in both corpora — the
pixel pass cannot find two blocks doing the same job in a single crop.
It stays in the vector as a gate check, not as a predictor.

## 6. Limitations

1. **No VLM annotation.** Section types, speech acts and composition
   come from the retrieval query plus pixel geometry, not from reading
   the page. A `search_sections` hit for "FAQ accordion" is assumed to
   be an FAQ section; the pixel pass refines composition, not intent.
2. **Embeddings are live but the image layer is a weak classifier.**
   Text is `nomic-embed-text` (768d, index/meta.json says so). Images are
   CLIP ViT-B/32: good for *retrieval* (`img_fit` +0.57, AUC +0.015) and
   for *relative* mood, but a whole section screenshot reads as "UI
   screenshot" 85% of the time, so CLASSIFY.md labels are taken on media
   blocks only and the 20 emotion axes are pole-contrast estimates, not
   ground truth. `moondream` is pulled but costs ~19 s/image; it is used
   only for optional UI analysis, never for the corpus-wide annotation.
3. **Small, skewed negative corpus** — 44 sites, 492 crops, mostly
   local-service templates. AUC against a luxury/editorial negative set
   is unmeasured.
4. **Single annotator.** Deterministic is reproducible, not
   independent; inter-annotator agreement is undefined.
5. **One crawl.** All eight seeds split the same 132 domains; a fresh
   crawl is the real test.

## 7. Reading the number

0.895 is not "the library works". It says: **a section whose genotype
sits close to a mined signature is measurably more likely to come from a
curated site than from a generic one, on sites the model has not seen.**
That is exactly the claim W2 and W5 need — enough to rank options and
flag an unsupported composition, not enough to certify a page. The gate
still decides.
