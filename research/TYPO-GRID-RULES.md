---
id: research-typo-grid-rules
type: research
topic: measurable typography + layout rules → style-space deviation axes
date: 2026-11-19
dest: research/TYPO-GRID-RULES.md
---

# TYPO-GRID-RULES — measurable typography/layout rules for the style space

Feed to `patterns/data/style-space.json`: which classic + modern
typography/layout rules can be *measured on a rendered site* and bent into a
deviation axis vs a fixed baseline. The brief's baselines already set are NOT
restated as findings; they appear only where a rule extends, sharpens or
conflicts with them.

## Existing machinery (the substrate — reuse, don't rebuild)

| Mechanism | Anchor |
|---|---|
| DOM computed-style probe (`getComputedStyle` per representative element: font-family/size/weight, line-height, letter-spacing, text-align, text-transform, grid-template-columns, gap/row-gap/column-gap, padding, border-radius, width, max-width, ~25 more props) | `tools/design-gate/ingest_good.py:64-88`; harvest into `meta.json` `representative_styles` at `:415` |
| Pixel whitespace + ink measurements on section crops (PIL luminance/chroma, `L<128` ink mask, median ink-row width → measure-ch proxy, `whitespace_share`) | `docs/machinery/design/patterns/tools/sop_adherence.py:73-115` |
| Padding-ratio canon per component type measured from crops (needs `CANON-PADDING.json` — **currently missing, check fails open**; F-18) | `tools/design-gate/gate.py:3159-3190`; `research/ADV-REVIEW-BATCH3.md:238-244` |
| Whitespace share in gate.py is `1 − textchars/HTMLchars` — markup verbosity, NOT rendered whitespace (known defect F-18) | `tools/design-gate/gate.py:3611-3618` |
| Deviation-vector + k-means clustering machinery + cluster namer (the shape style-space.json already uses) | `docs/machinery/design/patterns/tools/sop_adherence.py:184-235`; `patterns/data/style-space.json` (6 rule rows, clusters with centroids) |
| Rule knobs: `type.ratio` [1.125,1.5] step .0125 · `type.base` [16,20] · `type.tracking_display` [−0.04,0] · `grid.gutter` enum · `space.section_py` map | `docs/machinery/design/knobs.json:9-24` |
| Baselines: G.1 4px-unit scale {4,8,12,16,24,32,48,64,96,128} | `docs/machinery/design/rules/G.md:15-17` |
| ACSS fluid defaults: 1rem=10px, clamp()-fluid spacing+type (non-integer spacing is legal in the baseline!) | `docs/machinery/design/ACSS-BASELINE.md` |

**Implication:** the DOM probe already reads every scalar needed for font-size,
line-height, tracking, gap and radius axes. The gap is *text-level* signals
(line boxes, baselines, punctuation, OpenType features) — none captured today.

## Measurement primitives available

| Primitive | How | Status |
|---|---|---|
| Computed CSS per element | `getComputedStyle` (probe already does 25 props; add `font-variant-*`, `text-wrap`, `hanging-punctuation`, `hyphens`, `column-*`) | live |
| Element boxes | `getBoundingClientRect()` — columns, gaps, insets, containment | live (layout-ruler proves it) |
| **Line boxes** (per rendered line: x0/x1/y) | `Range.getClientRects()` over each text node's content — gives every wrapped line's rect → measure in *characters*, rag edges, last-line runts, inter-line baseline deltas | **new code; standard DOM API** |
| **Baseline y** | zero-height inline-block probe sits on the baseline — its `top` is the baseline's y (layout-ruler's probe.js uses exactly this) | proven technique, not in our probe |
| Glyph ink edges / x-height / cap-height | not in DOM; needs Canvas `measureText` bounding boxes or parsing the WOFF OS/2 table (`sxHeight`, `sCapHeight`, `usUnitsPerEm`) | heavy; treat as offline font-table step, not per-site |
| Punctuation/typographic characters | `textContent` regex on rendered copy (straight vs curly quotes, `--`, double spaces, `-` used as em dash) | trivial extension of probe |
| Whitespace share (rendered) | PIL luminance/chroma occupancy (sop_adherence.py already does ink mass) | live on crops |

## Canon law — measurable rules (fixed baselines)

| # | Rule | The rule | Measurable? (how) | Baseline | Conf | Source |
|---|---|---|---|---|---|---|
| C1 | Modular scale / musical ratios | Type sizes form one geometric progression `base · rⁿ` over named ratios: minor 2nd 15:16=1.067 · major 2nd 8:9=1.125 · minor 3rd 5:6=1.2 · major 3rd 4:5=1.25 · perfect 4th 3:4=1.333 · aug-4th 1:√2=1.414 · perfect 5th 2:3=1.5 · golden 1:1.618 · octave 1:2 | yes — collect all computed `font-size`s, sort, fit nearest named ratio (min Σ\|log(sizeᵢ/base)/log r − nᵢ\|); report fitted ratio + off-scale share | machinery knob `type.ratio` 1.125–1.5 (`knobs.json:9-18`); corpus "perfect fourth" 1.333 is the web convention | high — convention, not evidence of superiority | modularscale.com; Tim Brown 24ways 2011; `knobs.json` |
| C2 | Vertical rhythm / baseline grid | Every text baseline snaps to a fixed unit (typically body `line-height`; box tops/bottoms land on the grid or its half) | yes but heavy — per-line baseline y via Range rects + inline-block probe; test baseline-y mod gcd(line-heights) across sibling columns; also `margin-bottom`/`padding` ∈ multiples of lh | body lh (~24–28px at 16–18px); strictness is the contested part | medium — universally taught, rarely held on fluid web (see Gotchas) | alistapart.com/article/settingtypeontheweb; Matej Latin (prototypr.io); built-to-adapt 8-pt series |
| C3 | 8pt grid | All dimensions/padding/margins ∈ multiples of 8 (4px "soft grid" variant) | yes — histogram computed gap/padding/height values; report GCD + % off 8 and off 4 | G.1 scale is 4px-unit closed *set* (not multiples-of-8) — `G.md:15-17`; ACSS clamps produce non-integers → our baseline is "on G.1 set" not "on 8pt" | high as convention; our baseline diverges deliberately (fluid) | spec.fm/specifics/8-pt-grid; Bryn Jackson medium.com/built-to-adapt |
| C4 | Measure | 45–75ch single column; ~66 ideal; multi-column 40–50 | yes — longest line's glyph count via Range rects (or `max-width` ch vs font metrics); our T.6 band 52–65ch prose / 75ch shell | machinery: 52–65ch (`T.md:116`); ACSS prose 60ch; **conflict: R.4 says 45–75ch (`R.md:93`)** | high (Bringhurst §2.1.2) | webtypography.net/2.1.2; caretypography.com |
| C5 | Leading | line-height suits face+measure: ~1.2 display, 1.4–1.6 body; WCAG 1.4.12 floor: must permit 1.5× without clipping | yes — computed `line-height/font-size` per text role | machinery: ≥1.5 body large-x-height, ~1.3 small-x-height serif, headings 1.2 (`T.md:117`, `ACSS-BASELINE.md:60`) | high | Bringhurst §2.2.1; WCAG 1.4.12 |
| C6 | Body floor | body text ≥16px | yes — computed font-size of `p`/`li` | ≥16px (`T.md:118`, `knobs.json` type.base 16–20) | high | `T.md`; Lighthouse legible-font-size audit |
| C7 | Type contrast tiers | 3-tier read order: primary 3–6× body, secondary 1.5–2×, tertiary 1× | yes — max font-size / body font-size (already in `sop_adherence.py:168-175` as `heading_body_ratio`; adherence measured 52%) | 3–6× (`T.md:21-26`); gene bands low<2 · medium 2–3.5 · high 3.5–6 · extreme>6 (`GENOME.md:73-76`) | high internally; canon bends it half the time — ideal deviation axis | `T.1`, `sop-adherence.json` |
| C8 | Tracking convention | display slightly negative (−0.02…−0.04em), body 0, caps/labels +0.05…0.12em | yes — computed `letter-spacing/font-size` by role | machinery: −0.02…−0.04em display (`knobs.json` knob −0.04..0), +0.08em caps (`T.md:119`) | high (Bringhurst: "letterspace all caps… like a sheepdog") | `T.md:119`; Bringhurst §2.2.5 |
| C9 | Flush-left / rag-right | `text-align:left` body; no justify (rivers); centered only single-line | yes — computed `text-align` per block | never justify (`T.md:36,123`) | high | `T.2#1`; Bringhurst |
| C10 | Widows / orphans / **runts** | no stranded word/short last line (web "runt" = last line); widows/orphans in the page-break sense apply to `multi-col`/print only | yes — Range rects: last-line glyph count or last-line width ÷ measure < ~0.3 → runt; also `text-wrap` computed value | machinery: `text-wrap:pretty` body / `balance` headings (`T.md:120`); common typesetting bound: last line ≥ ~4–5 chars or ≥40% measure | medium — terminology contested (see F5) | developer.chrome.com/blog/css-text-wrap-pretty; wikipedia widows_and_orphans; graphicdesign.stackexchange 108615 |
| C11 | Rag quality | right edge "evenly uneven" — no stairsteps, no deep cuts, no 3+ lines ending at identical x | yes — per-block line-end x-coords from Range rects: variance of line lengths, max step between adjacent line ends, stairstep runs | "evenly uneven" (`T.md:109-110`); no canon numeric bound → propose: adjacent-line-end delta ≤ ~25% of measure, CV of line lengths in a mid band | medium — rule canon, numeric bound ours | `T.md:109` |
| C12 | Smart punctuation | curly quotes/apostrophes only; em dash or spaced en dash — never bare hyphen-as-dash, never double space, single space after terminal punctuation | yes — `textContent` regex: `'` `"` `--`, ` - ` with em-dash intent, `  ` | machinery: smart quotes only, single space (`T.md:121`) | high for quotes; **dash style contested** (F4) | `T.md:121`; stylemanual.gov.au dashes |
| C13 | Hanging punctuation | opening quote/bullet hangs outside the text edge | partial — `hanging-punctuation: first/last` computed value readable, but Safari-only; fallback needs glyph-ink offsets (text-indent −1ch trick etc.) | machinery: hang "where the platform allows" (`T.md:122`) — platform currently = Safari | medium | developer.mozilla.org hanging-punctuation; caniuse.com; interop#1043 |
| C14 | Gestalt proximity | related pairs closer than unrelated pairs; group gap < between-group gap | yes — sibling bottom→next-top gap deltas in px from rects; label↔input vs field↔field; heading binds to following block (bottom margin < top margin) | machinery: group-vs-section ≥2× (`G.md:25`), heading binds forward (`L.md` L.6 table), proximity scale 5–10/15–25/60–100px | high | nngroup.com/articles/gestalt-proximity; `G.2`, `L.6` |
| C15 | Common region / figure-ground | figure distinct from ground: contrast floor, containers bind groups when proximity insufficient | yes — WCAG contrast computed (bg role colors) + border/shadow presence; whitespace trapped inside edges flagged by pixel analysis | machinery: 4.5:1/7:1 floors (C rules), hairline 1–2px rules (`G.4`), container inset ≥10–15% (`G.md:40`) | high | Gestalt lit.; `G.4`, `L.4` |
| C16 | Whitespace share | negative space is assigned, generous, escapes to an edge | yes — pixel occupancy on crops (ink share, dominant-bg share); gate.py's current proxy is broken (F-18) — use `sop_adherence.py` method | machinery: ≥ canon P25 per type (`L.17`, measured P25≈0.35 in `sop_adherence.py:54-55`); adherence 98% | high internally | `L.4/L.17`; sop-adherence.json |
| C17 | 12-col grid | page subdivides into 12 columns (12 divides 2,3,4,6); desktop 12 → tablet 2 → mobile 1 | yes — cluster sibling left/right edge x-positions; count distinct column edges; gutter regularity; `grid-template-columns` read directly | machinery: 12-col (`T.md:134`, `R.md`), container ≤1440px (`R.2`), 960 containment (`L.11`) | high | Müller-Brockmann Grid Systems; 960.gs lineage; `L.md` |
| C18 | One axis / alignment | all blocks anchor one vertical line per section; second axis only as declared counter-axis | yes — edge-x clustering of section children; % of block left edges on the modal edge | machinery: one primary axis (`L.1`, `align:` field) | high internally | `L.md` L.1; layout-ruler `columns` rule implements the same idea |
| C19 | S-M-L scale variation | sections vary in mass: large anchor, medium blocks, small accents — flat uniformity is a defect | yes — section/block height+ink-mass histogram: require ≥1 density step, no >2 identical comps adjacent | machinery: `check_rhythm` L.7 | medium-high internally | `L.7` |
| C20 | Sup/sub sizing | superscript/subscript ~58–75% of surrounding size, baseline-shifted ~20–33%, must not inflate the line box | yes — computed font-size of `sup`/`sub` ÷ parent, `vertical-align` value, line-box height delta | convention ~0.7em/75% (browser default 0.8em/sub, ~−25% shift); true OpenType `sups`/`subs` glyphs preferred | medium | electricbookworks.com sup/sub; MDN vertical-align |
| C21 | Numeral styles | `tnum` (tabular) in tables/data rows; `lnum` lining w/ caps; `onum` oldstyle w/ lowercase running text | yes — computed `font-variant-numeric`/`font-feature-settings` on numeric contexts | machinery: silent (new axis); convention: tabular in tables | high for tnum-in-tables; medium otherwise | MDN font-feature-settings; typotheque OpenType-features |
| C22 | Ligatures | `liga`/`clig` on for serif body, `dlig` discretionary decorative only; never forced off without reason | yes — computed `font-variant-ligatures` | default = on (browser); machinery silent | high | MDN; Typotheque |
| C23 | Small caps | real `smcp`/`font-variant-caps:small-caps`, never synthesized; letterspaced +0.05–0.12em | yes — computed `font-variant-caps` + `letter-spacing` | machinery: labels +0.08em (`T.md:119`); smallcaps convention +5–10% | medium-high | MDN; Bringhurst §3.2 |
| C24 | Hyphenation discipline | `hyphens:auto` only with `lang` set + narrow measure; never on display text | yes — computed `hyphens`, presence of `&shy;` | machinery silent; convention: off unless justified measure | medium | MDN hyphens |

## Folk wisdom — contested rules (flag, don't enforce as canon)

| # | Rule | Claim | Measurable? | Evidence quality | Baseline suggestion |
|---|---|---|---|---|---|
| F1 | **Golden ratio** φ=1.618 | proportions at φ are maximally pleasing | measurable as axis (detect split/media ratios, section heights, image crops near 0.618) | **weak** — rectangle-preference studies find no φ preference (McManus et al., J. Cognitive Psychology 2010; Naini 2024 "no convincing evidence"); classic-design myth | treat as *axis only*: `phi_proximity` deviation, never a gate | sources: pmc.ncbi.nlm.nih.gov/PMC10792139; ux-strategy.ch/en/effects/golden-ratio-skepticism |
| F2 | Fibonacci sequence | sizes/gaps follow 1,1,2,3,5,8,13,21… | measurable (fit gaps to Fib multiples) | weak — decorative label for "exponential-ish spacing"; no empirical UX evidence | axis only: `fibonacci_adherence` share | same skepticism cluster as F1 |
| F3 | Rule of thirds | focal content on ⅓/⅔ gridlines | partial — needs "focal point" inference (largest display type / media centroid) vs thirds x/y | weak — borrowed from photography composition; no controlled UX evidence for page layout; machinery already prefers declared axis + counter-axis (`L.1`) | axis only: thirds-offset of focal element | contested |
| F4 | Em dash spacing | US: closed em dash "—like this"; AP/news + AUS gov: spaced em or spaced en "– like this" | measurable (regex around dashes) | canon split by style guide — no web standard | axis: `dash_style ∈ {closed_em, spaced_em, spaced_en}`; machinery's T.6 smart-quote rule is canon, dash spacing is folk | stylemanual.gov.au; merriam-webster.com |
| F5 | Widow vs orphan terminology | sources *swap the definitions* (Adobe: widow=end-line pushed to next page; others reverse); "runt" = last-line single word is the only stable web term | measurable as runt-rate regardless of name | high for "runts are bad", low for labels | enforce `last_line_coverage ≥ 0.3` + `text-wrap: pretty`; never cite widow/orphan without defining | wikipedia; Adobe; graphicdesign.stackexchange 108615 |
| F6 | 8pt grid on web | "everything multiple of 8" | measurable | contested for fluid ACSS baseline — clamps intentionally emit non-8 values; spec.fm itself offers soft-4pt variant | axis: `grid_unit_gcd` + `on8_share`; G.1 closed set stays canon | spec.fm; uxdesign.cc "goodbye 8-pt grid" |
| F7 | Baseline grid strictness | all baselines snap one unit | measurable | contested on responsive/fluid web — clamp() type scales make baselines drift with viewport; print-transplant | axis: `baseline_mod_coherence` (share of baselines ≡ 0 mod gcd) | alistapart vs modern fluid practice |
| F8 | Justified text | banned outright | measurable | canon internally (T.2#1/T.11); Bringhurst permits justified when hyphenation+measure right — absolute ban is our-house rule | keep ban; axis `justified_share` | T.2; Bringhurst §2.4.8 |
| F9 | 45–75ch vs 52–65ch | Bringhurst 45–75; machinery tightens to 52–65 for prose | measurable | both canon-citable — internal contradiction (R.4 keeps Bringhurst band while T.6 narrows it) | flag conflict: use T.6 52–65 as baseline, R.4 45–75 as hard shell | `T.md:116` vs `R.md:93` |
| F10 | "Skip a weight" | 400↔500 pairing invisible | measurable (font-weight delta between tiers) | folk — commonly taught, no controlled evidence; practical heuristic | keep as axis `weight_step_ratio` | `T.2#3` |
| F11 | Sup/sub exact % | 58%, 65%, 75%, 0.8em — sources disagree | measurable | folk — convention band only | 0.6–0.8× baseline | EBW/MDN disagreement |

## Conflicts inside the machinery (flagged for the plan)

| Conflict | A | B | Recommendation |
|---|---|---|---|
| Measure band | T.6: 52–65ch (`T.md:116`) | R.4: 45–75ch (`R.md:93`) | T.6 is the baseline; R.4's wider band = hard limit |
| Type-contrast band | T.1 primary 3–6× (`T.md:24`) | gene `type-contrast` high = 3.5–6 (`GENOME.md:73-76`) | 3.0–3.5 sites fail T.1 but sit "high" — unify or treat band edges as fuzzed |
| 8pt vs G.1 | folk 8pt | G.1 closed 4px-unit set + ACSS clamps | measure on-G.1-set share, not on-8 share |
| Baseline grid | canon rhythm | fluid clamp() breaks integer rhythm by design | measure coherence as an axis, don't enforce |
| Whitespace share | L.17 uses markup char ratio (broken, F-18) | sop_adherence pixel method correct | use pixel occupancy for the axis |

## Prior art

Verdict: **Close but not quite — adopt the measurement techniques, not the tools.**

| Project | What it does | Delta for us |
|---|---|---|
| `eliferres/layout-ruler` (MIT, Python+CDP, stdlib only) | Rendered-box QA: column-edge clustering, gap-equality, gap-on-scale (mult. of 4), equal-size siblings, **baseline detection via zero-height inline-block**, viewport overflow. No spec file needed. | Covers our C14/C17/C18 primitives and the baseline trick; does NOT do text-level typography (measure-in-ch, runts, rag, punctuation, OpenType). Copy the technique (probe.js → our meta.json probe), not the tool — ours must feed deviation vectors, not pass/fail rows. |
| `gridproof/gridproof` (MIT, MCP+Playwright) | Computed-geometry spacing audit: spacing-scale (4px base), arbitrary-value, gap-consistency, canonical-size/tap-targets. Calibrated on ~60 sites. | Same DOM-computed-geometry technique we already run (`ingest_good.py:64-88`); Tailwind-centric, warn-only, no typography. Close on method, thin on scope. |
| `Galen Framework` (JVM/Selenium spec DSL) | The spec vocabulary layout-ruler borrows ("aligned left", "below with distance") | Requires hand-written specs per page — wrong substrate for mining 500+ unspecced sites. |
| `MukundaKatta/DesignLint` (npm) | HTML/CSS lint: contrast, spacing, a11y on source files | Source-scanning not rendered measurement; subset of our gate checks. |
| `LOsioChico/layout-lint-mcp` (MCP) | DOM analysis: overflow, spacing, typography, touch targets | Agent-loop lint, no deviation-vector/clustering output; overlapping primitives only. |
| Lighthouse `legible-font-size` | font-size <12px / 60%-coverage audit | One rule only (C6 adjacent). |
| `modularscale.com`, fluid-type-scale-calculator, Type Scale Generator | Authoring-side ratio calculators | Generate scales, don't measure them — nothing reads a rendered site back into a ratio. |
| typogrify/SmartyPants-class tools | Smart quotes/dashes at *authoring* | Write-side fixes; our axis needs read-side detection (regex on textContent). |
| 960.gs / Bootstrap grid | The 12-col convention itself | N/A — convention, not software. |

**No prior art found** that computes per-site deviation vectors over
typographic rules and clusters them into style families. Searched:
`typography linter website audit`, `measure type scale rendered page`,
`baseline grid checker`, `8pt grid audit`, `design deviation clustering`,
`style clustering websites`. The style-space itself is novel; the
measurement primitives are borrowable.

## Alternatives

- **Screenshot-only measurement (no DOM).** Rejected: pixel ink analysis can't
  read `font-variant`, `text-wrap`, measure-in-ch, or quote characters; the DOM
  probe already exists and is cheaper. Pixels stay for whitespace share +
  figure-ground.
- **Font-file parsing (WOFF/OS/2 tables) for x-height/cap-height/overshoot.**
  Deferred: needed only for the optical-alignment axes (overshoot,
  optical inset). Doable offline on the ~26 directory faces; per-site DOM can't
  see glyph geometry. Mark `optical_*` axes as needing the font-table pass.
- **Reusing layout-ruler as a dependency.** Rejected for production use:
  it's a pass/fail QA tool; we need continuous deviation values. But its
  `probe.js` baseline trick and set-finding heuristics are directly copyable
  (MIT).
- **Enforcing folk rules (φ, thirds, Fibonacci) as gates.** Rejected: evidence
  too weak; they become axes only.

## Gotchas / failure modes

1. **Fluid type blurs ratio fits.** `clamp()` font sizes change with viewport —
   measure at the closed breakpoints (R.1 stops), fit a ratio *per* stop, report
   ratio drift as its own axis (`ratio_drift_360_vs_1280`).
2. **Baseline grids are destroyed by design.** Any `clamp()` line-height or
   fluid spacing means baseline coherence is *impossible* on a responsive page;
   measure it as an axis, never a FAIL.
3. **`ch` ≠ "characters"** — `ch` = advance width of `0`; per-font. Count glyphs
   via Range rects for real measure, don't trust `max-width: 65ch` arithmetic
   against a guessed char width (`sop_adherence.py` uses a 0.022·W proxy —
   replace with glyph counts).
4. **Range rects include collapsed whitespace** and inline-element splits —
   filter rects narrower than ~0.5×x-height, union rects on the same baseline.
5. **`text-wrap: pretty` only suppresses *single-word* last lines** (Chrome 117+);
   a 40%-coverage last line can still look broken — measure the runt, don't just
   read the property.
6. **CSS `orphans`/`widows` properties don't apply to single-column block flow** —
   paged/multi-col only. Web "widow" detection = last-line analysis.
7. **`hanging-punctuation` is Safari-only** (caniuse; interop#1043 pending).
   Chrome/Firefox need `text-indent:-1ch`-style hacks; computed property reads
   as unsupported → treat as "declared intent" not achieved effect.
8. **Synthesized small-caps** — `font-variant-caps:small-caps` on a face without
   `smcp` renders fake shrunk caps; detect via feature presence in font table,
   not the property alone.
9. **sub/sup inflate the line box** — a sup in a paragraph widens its line's
   height vs neighbors; measure line-height irregularity caused by them.
10. **Whitespace share ≠ markup ratio.** `gate.py:3611-3618` computes
    `1 − text/HTML chars`; use `sop_adherence.py` pixel occupancy instead (F-18).
11. **Subpixel/rounding tolerance ~1px** (layout-ruler ships 1px; gridproof
    calibrated tolerances on ~60 sites) — don't flag ±1px as off-grid.
12. **Dark mode / lazy images / JS-injected content change measurements** —
    measure post-settle (layout-ruler waits for fonts+animations+lazy scroll).
13. **Terminology is contested** — never emit "widow"/"orphan" in reports
    without defining; use "runt"/"last-line coverage" (F5).
14. **Weight axis lies on variable fonts** — `font-weight` computes to a number
    even when the face renders interpolated; pair with `font-variation-settings`.

## Assumptions

| Assumption | Load-bearing? | Falsifier / evidence that changes it |
|---|---|---|
| `getComputedStyle` + `Range.getClientRects()` expose every axis except glyph geometry | yes — drives which rules are "yes" vs "partial" | a rule needing glyph ink (overshoot, hanging-quote ink edge) → needs font-table pass, not DOM |
| 26-family directory faces have parseable OS/2 tables for sxHeight/sCapHeight | only for optical axes | variable/hosted fonts lacking tables → drop optical axes to "unmeasurable" |
| Deviation-vs-fixed-baseline clustering produces meaningful style families | yes — core premise | clusters collapse to noise → revisit axis selection/weighting (fitted-weights.json exists as the refit path) |
| The 6-row style-space.json schema (id/baseline/unit) generalises to new rules | yes | new axes need richer metadata (bands, direction) → schema bump required |
| Canon sites bend T.1 ~48% of the time — deviation is signal, not defect | axis semantics | if bends are mostly capture noise, axes won't cluster cleanly — the 52% adherence n=175 already suggests real bending |
| `CANON-PADDING.json` will exist | only for G.6/L.17 axes | missing → keep pixel-occupancy fallback (sop_adherence P25=0.35) |

## Premortem

- **Rag/runt measurement breaks on justified or centered text** — must branch
  on computed `text-align` before interpreting line-end variance.
- **"Deviation" vs "defect" confusion** — a site *bending* a rule (the axis)
  and a site *breaking* it (the gate) share machinery; keep axis reporting
  neutral (signed delta), let the plan decide which axes are also gates.
- **Ratio fit degenerates on tiny samples** — a page with 3 font sizes can't
  determine a ratio; require ≥5 distinct sizes before reporting `type_ratio`.
- **Clustering on mixed units** — deviation units are heterogeneous (px, ×, %,
  share); the cluster step in `sop_adherence.py:184` normalises via `unit`
  scaling — new axes must supply sane `unit` values or dominate the centroid.
- **Baseline-grid axis may be ~0 on nearly every site** (fluid) — a degenerate
  axis adds noise; consider reporting `baseline_coherence` only when it clears
  a floor.
- **Folk axes (φ, thirds, Fib) will look like signal** — they're correlated
  with each other (φ-adjacent); mark them `evidence: weak` in the JSON so the
  namer never builds "golden" cluster labels on folklore.
