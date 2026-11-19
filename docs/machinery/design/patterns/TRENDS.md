---
id: trends-taxonomy
type: taxonomy
year: 2026
links:
  index: patterns-index
  derives_from: [patterns-index]
  used_in: [w1, w3, w4, w8]
---

# Web design trends 2026 — classification vocabulary

Source: <https://www.vistaprint.com.au/hub/web-design-trends>
(fetched 2026-11-19). Classification source only — these eight labels
form a **closed multi-label vocab** stamped `year: 2026`; trends age, so
a `trend` allele always carries its year and confidence + evidence.

Measurable markers the detector (`tools/trend_detect.py`) checks, in
priority order; each hit contributes its weight, `confidence` = the
winning label's score share:

| trend | markers (measurable) |
|---|---|
| `cute-alism` | kawaii/brutalist contrast: blocky mono/utility type + saturated pastel or neon accents + rounded sticker shapes. Measured: mono display face ∧ high-chroma accent ∧ radius pill ∧ high ink. |
| `dial-up-delight` | late-90s/Y2K: gothic or condensed display, candy gradients, metallic sheen, stacked busy frames. Measured: multi-colour gradient ∧ gothic/mono face ∧ high chroma variance ∧ dense layout. |
| `resonant-stark` | stripped minimal + warm detail: thin display type, soft gradient, generous whitespace, sparse ink. Measured: whitespace ≥ 0.7 ∧ thin weight heading ∧ low chroma ∧ gradient. |
| `frosted-touch` | glassmorphism: translucent panels, diffused shadows, backdrop blur, soft pastel fields. Measured: semi-transparent surface ∧ blur shadow ∧ pastel palette ∧ border. |
| `light-skeuomorphism` | subtle real-material mimicry: soft embossed edges, delicate gradients, light shadows, soft surfaces. Measured: embossed/3d shadow ∧ soft gradient ∧ mid chroma ∧ rounded radius. |
| `ai-personalisation` | adaptive layout blocks (behavioural, not measurable from a still) → `insufficient` — marker is the personalisation pattern (recommendation rows, "for you" labels). |
| `snug-simple` | cosy minimal: soft neutral bg + pastel blocks, rounded edges, chunky friendly type, light texture. Measured: pastel bg ∧ pill radius ∧ low contrast ink ∧ rounded type. |
| `human-scribble` | hand-drawn overlays: doodles, sketch lines, scribble marks over clean UI. Measured: hand-drawn illustration medium (CLIP `illustration`/`hand-drawn`) + irregular edges. |

Anti-trend detection (dated look): a section scoring high on
`dial-up-delight` *and* older-era markers (bevelled edges, dense
bordered tables, marquee patterns) is flagged `dated`, not trendy —
same pixels, different verdict by era evidence.

## Use

- (a) canon sections carry `trend` labels (multi, with confidence) in
  annotations + meta.
- (b) `genome.py mutate --trend <label>` biases the wildcard toward the
  trend's marker genes (radius pill, mono display, pastel surface…) as a
  menu of trend moves, still bounded by novelty.
- (c) scorer flags `dated` when the era evidence says old-web, not
  Y2K-revival.
