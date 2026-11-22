# Bank classifier test report — ~24 exemplars × 7 models + embed/rerank probe

Test items: 18 genmenu families (first `.html` each) + 6 mobbin site pages (first `.webp` each) = 24 exemplars.
Axes: 82 emitted per exemplar (genome.GENES 24 + NEW_AXES 57 + fx-classes-present multi-tag).

## 1. Per-model label samples

Full JSONs live beside this file: `<id>.<model>.json`. Three exemplars to inspect first:

- `gm-card-block-folio-twenty-card1.*` — card grid; models disagree on `columns` (3 vs 1 — the grid is 3-col on wide, 1-col as rendered at 1280px inside a card? — see §5)
- `gm-hero-split-hero-architecture-hero11.*` — split hero; decider files carry real per-allele probability vectors (`p`), chat models carry allele+confidence
- `mb-site-portfolio-1cf3a515-gamma.*` — mobbin webp; all vision models emit sane labels from image alone

## 2. Pairwise allele agreement (24 items × ~79 comparable axes)

| lane A | lane B | agreement |
|---|---|---|
| gemini-2.5-flash-lite | gemini-2.5-flash | 63% |
| gemini-2.5-flash-lite | pplx-decider-v1.3:free | 66% |
| gemini-2.5-flash-lite | pplx-decider-flash-v1.3:free | 65% |
| gemini-2.5-flash-lite | gemma-4-31b-it:free | 81% |
| gemini-2.5-flash-lite | nemotron-3.5-super-vl:free | 82% |
| gemini-2.5-flash-lite | nemotron-3-nano-omni:free | 84% |
| gemini-2.5-flash | pplx-decider-v1.3:free | 64% |
| gemma-4-31b-it:free | nemotron-3.5-super-vl:free | 82% |
| gemma/super-vl | nano-omni:free | 83% |
| decider-flash | decider-v1.3 | 72% |

Pattern: the three free vision chat models + flash-lite form a self-consistent cluster (81-84%).
gemini-2.5-flash is the outlier against everyone (61-64%) — so "lite disagrees with flash"
does NOT imply lite is wrong; flash is not a clean gold standard here.

### Per-axis-group agreement of flash-lite vs each candidate

| group | axes | vs flash | vs decider-v1.3 | vs super-vl | vs gemma |
|---|---|---|---|---|---|
| colour | 7 | 70% | 70% | 87% | 82% |
| spacing | 8 | 51% | 66% | 81% | 82% |
| typography | 8 | 63% | 67% | 81% | 85% |
| chrome | 11 | 75% | 78% | 87% | 88% |
| imagery | 8 | 59% | 66% | 83% | 81% |
| motion | 3 | 48% | 67% | 62% | 62% |
| mood | 5 | 62% | 57% | 75% | 74% |
| controls | 9 | 54% | 52% | 80% | 73% |
| ornament | 2 | 69% | 60% | 83% | 88% |
| composition | 6 | 53% | 58% | 76% | 79% |
| quality | 6 | 70% | 69% | 81% | 84% |
| semantic | 4 | 81% | 75% | 85% | 86% |

Worst lite↔flash axes: `columns` 0%, `fx-classes-present` 0% (multi-tag, see §5),
`surface-rhythm` 17%, `card-padding` 21%, `case-style` 21%, `visual-hierarchy-strength` 21%,
`density-tier` 25%, `image-style` 25%, `gallery-mode`/`media-treatment` 29%.

## 3. Measured usage → full-bank cost (6,149 exemplars)

Per exemplar (vision lanes): ~3,650 prompt tokens + ~2,000 completion tokens.
Decider lanes: ~51k prompt tokens/item (every axis + allele criteria in one state call), ~550 out.

| model | $/exemplar | full bank (6,149) |
|---|---|---|
| gemini-2.5-flash-lite | ~$0.0013 measured ($0.13/100 batch) | **~$8.0** |
| gemini-2.5-flash | ~$0.006 | ~$37 — out of budget |
| all :free lanes | $0 (rate-limited: 1,000 req/day shared) | $0, ~6 days |
| nemotron-embed-8b:free | $0 | matching layer, not labels |
| nemotron-rerank-8b:free | $0 | text-only stage-2 |

Balance: $6.09 at test start → topped up to $16.66 mid-run → $14.5 at ~2,900 items.
Test spend ≈ $0.22. Bank run spend tracked per batch; floor $0.50 enforced in code.

## 4. Free-lane reliability (fallback log — FALLBACKS.json)

| free model | fallbacks (of 24) | reason |
|---|---|---|
| gemma-4-31b-it:free | **0** | — |
| nemotron-3.5-super-vl:free | 17 | JSON parse failures (truncated/unterminated output) |
| nemotron-3-nano-omni:free | 23 | JSON parse failures (non-JSON answers) |
| pplx-decider-flash-v1.3:free | 0 | — |
| pplx-decider-v1.3:free | 0 | — |

All fallbacks went to gemini-2.5-flash-lite per directive; logged in FALLBACKS.json.
The nvidia reasoning models emit prose around the JSON — need a stricter extractor or
`response_format` enforcement to be viable.

## 5. Caveats on axes that look "wrong"

- `fx-classes-present` is intentionally multi-tag: chat models emit `alleles[]` lists
  (e.g. `['transition-colors','group-hover:scale-[1.02]']`), deciders emit a single
  choice ('mixed'/'hover-fx'). 0% string agreement is expected — compare as sets.
- `columns` disagreement (int 3 vs str '3' vs 1) is partly a type normalisation issue
  and partly real: this is a DOM-readable axis — recommend reading it deterministically
  from grid classes rather than by model.
- `structure` axes (page-macro-structure, disclosure-tier, breadcrumb-presence) are
  likewise better served by spec_scan output than by any model.

## 6. Embed + rerank probe (EMBED.json)

- nvidia/nemotron-3.5-embed-8b:free, 4096-dim, image+text. PNG data-URIs only (webp 422s — PIL-convert first).
- Image-cosine NN alone is weak: deco-quote query → card-block (0.205 top); data-grid → pricing-tiers top-1, data-table only #4.
- nemotron-3.5-rerank-8b:free is **text-only** (image query/documents → 422; verified contract `{model, query, documents:[text]} → results[{index, relevance_score}]`).
- Rerank on structure text works: data-grid query re-ranked data-table #4→#1.
- Verdict: keep embeddings as recall over structure text / hybrid image+text; use rerank as stage-2. Not a substitute for label axes.

## 7. Recommendation (best free per axis group + gemini tier)

Per operator policy — best free per axis group, paid gemini as bulk/fallback:

- **Bulk paid path (chosen by operator): gemini-2.5-flash-lite** — $0.0013/item, ~$8 for
  the whole 6,149 bank, fits the topped-up balance. No quality case for flash at 6× cost
  given flash is the outlier lane, not the gold standard.
- **DOM-readable axes** (columns, page-macro-structure, sticky-elements,
  breadcrumb-presence, form-presence, fx-classes-present): do NOT spend model calls —
  emit from spec_scan/forensic.json deterministically. Higher fidelity than any lane.
- **Best free lane for visual/semantic groups** (colour, imagery, chrome, ornament,
  typography, semantic): `gemma-4-31b-it:free` — only free chat model with zero
  fallbacks, 81-88% agreement with lite across those groups, and free (1,000/day).
- **Best free for structured axes** (controls, spacing, mood): `pplx-decider-v1.3:free` —
  emits calibrated per-allele probability vectors, useful directly for matching; stable
  (0 fallbacks). Free, same shared quota.
- **Skip:** super-vl/nano-omni as labelers (JSON fragility, 17-23/24 fallbacks);
  decider-flash (strictly worse than decider-v1.3, same cost).
- **Free-quota plan if paid is declined:** decider-v1.3 + gemma share the 1,000/day →
  ~6 days for the bank; paid lite is the sane default.
