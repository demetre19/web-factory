---
id: colour-rules
type: research
links:
  extends: [rules-C, rules-V, BASE.ACSS, LAW.DNA, check_contrast, check_dark_mode, check_neutral_tint, check_accent_surfaces, check_dark_media]
  feeds: [style-space.json]
---
# COLOUR-RULES — colour theory + perceptual rules measurable on rendered sites

Date 2026-11-19. Feeds `docs/machinery/design/patterns/data/style-space.json`
(per-site deviation vectors vs a fixed baseline). Read-only; this file
*extends* the existing colour canon and flags conflicts — it does not
restate `rules/C.md` as new findings.

Row format per brief: **name | the rule | measurable? (yes/how/no) |
baseline value | confidence | source**. Canon law (perceptual science /
normative standard) is separated from folk wisdom (contested conventions)
in two tables; contested rows carry an evidence-quality note.

## 0. What the machinery already owns (inventory — do not re-derive)

| Rule | Where | Status |
|---|---|---|
| 6-role semantic map + contrast floors (ink ≥7:1, ink_muted ≥4.5:1, accent ≥3:1 vs surface, accent_fg ≥4.5:1, surface ≥1.15:1, elevated ≥1.2:1, border 1.5–3:1) | `docs/machinery/design/rules/C.md:17-26` | enforced `check_contrast` (`tools/design-gate/gate.py:1513-1540`) |
| 60-30-10 budget (accent ≤10%, no ghost primary CTA, one CTA hue per section) | `C.md:28-32` | accent share unenforced as a ratio; `check_accent_surfaces` counts bands (`gate.py:3361-3371`) |
| Temperature buckets → hue families + undertones | `C.md:35-56` | `check_direction_axes` (enum only) |
| Neutral tinting — never dead grey/black, S bands per role | `C.md:57-72` | `check_neutral_tint` via RGB channel delta (`gate.py:6545-6573`) |
| Accent harmony by closed formula (+180°, ±150°/210°, ±30–45°, +120°/240°) | `C.md:75-92` | **reviewer-only** (`accent-harmony` rubric) |
| `accent_fg` by luminance (L>60% → dark ink) | `C.md:88-91` | covered by ≥4.5:1 pair check |
| Light+dark invariant, class-switched, toggle on every surface | `C.md:94-131` | `check_dark_mode` (`gate.py:6023-6066`), `check_dark_toggle` |
| Dark ramp: no #000, elevation=+L, accent L+5–10% S−10–20% | `C.md:113-123` | partially (pure-black + bg luminance checks only) |
| Text-on-image floors 7:1/4.5:1 + zone luminance ≤20%/≥85% | `docs/machinery/design/rules/V.md:110-115` | `check_measurable`; already a style-space axis V.4 (`style-space.json`) |
| Dark-mode media dimming | `V.md:225-228`; fixture `global.css:53` (`brightness(.85) contrast(.92)`) | `check_dark_media` (`gate.py:3313-3344`) |
| Colour knobs | `docs/machinery/design/knobs.json:139-179` (`color.surface_contrast` 0.02–0.08, `color.accent_usage` enum, `color.neutral_tint` 0.01–0.08); `DNA-MAP.md:59-63` | gate-readable |
| WCAG 2.x contrast math | `gate.py:560-574` (`_lum` + `contrast`) | sRGB hex only |
| Corpus reality | `docs/machinery/design/patterns/data/operator/*/report.json` sections carry `type` + `geometry` + `sec-NN.png` — **no colour fields** | extraction gap |

**Critical gap:** the operator corpus measures geometry and section type
only. Every colour axis below needs a new extractor — computed styles
(role pairs) + pixel histograms over the existing `sec-NN.png` shots.

## 1. Canon law — perceptual science / normative

| # | Rule | Measurable? | Baseline | Confidence | Source |
|---|---|---|---|---|---|
| C1 | **OKLCH perceptual uniformity** — OKLab L/C/h: equal numeric steps ≈ equal perceived steps; L 0–1, C ≈0–0.4 in sRGB, h 0–360° | yes — convert every sampled colour via `culori`/`color.js`; histogram L/C/h | ACSS generates shade scales in OKLCH, unified L=0.65 (`research/acss/ACSS-DOCS-DIGEST.md:345-353`). Machinery authors neutrals in HSL (`C.md:62-71`) → convert, never compare L across spaces | high — CSS Color 4 normative | csswg CSS Color 4; Ottosson Oklab; evilmartians.com OKLCH writeup; culorijs.org |
| C2 | **WCAG 2.x contrast** — `(L1+0.05)/(L2+0.05)` on linearized sRGB, Y=0.2126R+0.7152G+0.0722B | yes — implemented (`gate.py:560-574`), hex only | Floors per element type (C.1): ink 7:1, body AA 4.5:1, large text 3:1, UI components 3:1 (SC 1.4.3/1.4.6/1.4.11) | high as legal floor; perceptual validity **contested** (see C3) | W3C WCAG 2.x; `gate.py:563` |
| C3 | **APCA vs WCAG** — polarity-aware Lc (−108…+106); dark-on-light positive; font size/weight aware. Lc 45 ≈ 3:1, Lc 60 ≈ 4.5:1, Lc 75 ≈ 7:1; body ≥Lc 75, headlines ≥Lc 45 | yes — npm `apca-w3`; needs computed font size + weight per text node | Deviation axes: min Lc per site, % text pairs ≥Lc 75, signed mean Lc. **Not yet a WCAG norm** — dual-run alongside WCAG 2.x, never replace the gate | high as measurement; medium as floor (WCAG 3 draft) | github.com/Myndex/SAPC-APCA; w3.org Silver wiki APCA model; apcacontrast.com |
| C4 | **Foreground–background luminance ordering** — light: bg>surface>border>ink in lightness; dark: bg<surface<elevated<ink (elevation=+L). Monotone ladder, 5 distinct value steps | yes — order + pairwise ΔL of role values; grayscale audit | `C.md:113-123` dark table; `C.md:139-142` grayscale proof (5 steps); `DARK_MAX_L`=20% gate (`gate.py:5968`) | high — SOP ×4 convergent + Material convention | `C.md`; Material dark theme guidance |
| C5 | **Halation** — bright/high-chroma fg on dark bg blooms; mitigate with off-white ink (L 92–95%) and desaturated accents | yes — dark-mode accent C and ink L vs light mode | accent dark = L +5–10%, S −10–20% (`C.md:123`); ink L 92–95%, never #FFF glare | high (real phenomenon; APCA's asymmetry is built on it) | `C.md:123`; APCA docs; Material dark guidance |
| C6 | **Vibration / chromostereopsis** — saturated hues of ~equal luminance shimmer; red/blue worst; saturated blue text on dark flagged for readability | yes — per adjacent pair: \|ΔY\| low AND both high C AND Δh ≈150–210° → risk score | proposed: 0 pairs with ΔY<0.1 ∧ C>0.15 ∧ Δh>150°. Threshold is OUR proposal — flag contested | medium — phenomenon established (chromostereopsis), numeric threshold anecdotal | en.wikipedia.org/wiki/Chromostereopsis; Ramasubramanian 2026 (bioj-online: saturated blue on dark "avoid for fine details/extended reading") |
| C7 | **Simultaneous contrast** — a colour's perceived hue/lightness shifts toward the surround's complement | partial — count distinct surround contexts per accent token; the perceptual shift itself is not directly measurable from pixels | proposed baseline: accent on ≤2 surround families; one accent/inverse band per viewport (`C.md:157-160`) | high as phenomenon (Chevreul 1839; Albers *Interaction of Color*); medium as web-measurable rule | Smithsonian "Color in a New Light"; Oberlin on Chevreul/Albers |
| C8 | **Bezold effect** — changing the dominant field colour changes the perceived relationship of *all* other colours | yes indirectly — same token set at different field shares reads differently; axis = field-share mix | ties to accent-share axis (C.1 ≤10%); no standalone numeric baseline | high as phenomenon (Bezold 1876); its application to page shares is inference | alvalyn.com Bezold explainer; Albers exercises |
| C9 | **Colour as wayfinding semantics** — hue→role mapping must be consistent; colour never the sole carrier (WCAG 1.4.1 redundant cue: icon/underline/label) | yes — semantic hue set size + consistency vs role map; presence of redundant cues | ACSS 4 semantic colours Warning/Info/Success/Danger (`ACSS-DOCS-DIGEST.md:352`); machinery accent=interactive semantic (`C.md:30-32`) | high — 1.4.1 is normative | WCAG SC 1.4.1; ACSS semantic colours |
| C10 | **Metamerism / observer variability** — identical tristimulus differs across illuminants, gamuts (sRGB vs P3), and observers (CVD ≈8% males) | yes via simulation — transform palette through deuter/protan/tritan matrices (Machado), compute ΔE00 per semantic pair | proposed: semantic pairs ΔE00 ≥10 under each CVD sim; P3→sRGB chroma clamp on screenshots | high as physics; thresholds are ours — flag | colour-science (Machado 2009 matrices); leonardocolor.io per-CVD difference |

## 2. Folk wisdom / contested conventions (measurable, weaker evidence)

| # | Rule | Measurable? | Baseline | Confidence / evidence quality | Source |
|---|---|---|---|---|---|
| F1 | **60-30-10** — dominant 60% / secondary 30% / accent ≤10% | yes — pixel-area or DOM-area shares of role colours | `C.md:28-29` (60/30/10); axis = measured shares vs shares | low-medium: interior-design aphorism, no study; but verified convergent across 4 operator SOPs | `C.md:28`; convention |
| F2 | **Colour temperature → hue family** — warm 15–65° red/amber, cool 200–230° navy, neutral charcoal+accent, hybrid cool+warm | yes — chroma-weighted median hue of palette + bg undertone hue/S | `C.md:38-56` buckets; axis = warm/cool index vs declared `direction.temperature` | low as universal law (hue→emotion links are cultural/context-dependent — thin literature); medium as convention | `C.md`; contested |
| F3 | **Harmony schemes** (mono / analogous ±30–45° / complementary +180° / split-comp ±150°/210° / triadic +120°/+240° / tetradic 60–90° pairs) | yes — angular deltas between high-C colours; axis = min distance to scheme geometries | `C.md:75-92` formulas | medium as convention (colour-wheel geometry, centuries of use); low as perceptual law — no physiological basis for "harmony" | `C.md`; Itten-style convention |
| F4 | **Saturation–lightness relationships** — neutrals S 2–6%; warm primaries desaturated to terracotta (H 15–25°, S 65–80%, L 40–50%); ink S 10–15% | yes — C vs L profile per role | `C.md:57-72` light bands; `check_neutral_tint` delta bands 1–8/2–24 (`gate.py:6551-6552`) | medium — SOP consensus; numbers arbitrary-but-workable | `C.md:57-72` |
| F5 | **accent_fg luminance flip** — L(accent)>60% → dark fg | yes — per accent-fill element, fg L vs threshold | `C.md:88-91` | medium-high — anchored in luminance physics, exact 60% cut is heuristic | `C.md` |
| F6 | **Dark bg never pure black** — #121212-class dark grey for elevation/space; saturated colours desaturated on dark | yes — dark bg Y / L and accent C delta | `C.md:113-123`; `DARK_MAX_L` 20% (`gate.py:5968`); Material #121212 | medium-high — industry canon (Material), empirical bits (OLED smear, vibration) but exact value is convention | m2.material.io dark theme |
| F7 | **Shadows → borders/elevation-as-lightness in dark** — dark mode expresses elevation by +L overlays, not cast shadows | yes — shadow presence/strength per mode; surface L ladder | `C.md:117-120` (+L ramp); shadows subtle/high-diffusion (`V.md` V.5) | medium — Material convention + halation rationale | Material dark elevation; `C.md` |
| F8 | **Accent = interactive, decorative use dilutes**; one CTA hue per section; no ghost primary | yes — accent share, count of accent-filled bands, fill-vs-outline on primaries | `C.md:30-32`, `C.md:157-160`; `check_accent_surfaces`, `check_primary_cta` (`gate.py:3201-3216`) | medium — conversion lore, plausible, unverified empirically | `C.md` |

## 3. Proposed style-space axes (extend `style-space.json`)

Each is computable from computed styles + `sec-NN.png` pixels; baseline =
the C.*/V.* canon; deviation = measured − baseline (unit = the axis's own
scale — record in `unit`).

| Axis | Measure | Baseline |
|---|---|---|
| `color.temp_warmth` | chroma-weighted circular-mean hue; sign warm/cool/achromatic | declared bucket (C.2) |
| `color.hue_spread` | circular SD of hue histogram (C>0.05 only) | achromatic ≈0 |
| `color.harmony_fit` | min angular deviation to {180, {150,210}, 30–45, {120,240}, tetradic} | 0° |
| `color.chroma_neutral` | mean C of bg/surface/border | HSL S 2–6% ≈ C ≤0.02 |
| `color.chroma_curve` | C-vs-L profile slope for accents | monotone-ish; flag flat/over |
| `color.ladder_steps` | distinct Y steps across roles | 5 (`C.md:139`) |
| `color.luminance_order` | monotonicity flag + ΔL per adjacent pair | monotone; dark inverted |
| `color.accent_share` | % page area in accent hues | ≤10% |
| `color.contrast_margin` | per-pair ratio − C.1 floor, min + median | ≥0 |
| `color.contrast_lc` | APCA Lc min/%≥75 | Lc 75 body / 45 display |
| `color.dark_deltaC` | accent C_light − C_dark | +10–20% drop (C.5) |
| `color.dark_deltaL` | accent L_dark − L_light | +5–10% (C.5) |
| `color.vibration_risk` | count of ΔY<0.1 ∧ Δh>150° ∧ C>0.15 adjacencies | 0 |
| `color.tint_delta` | neutral RGB channel delta | 1–8 (`gate.py:6551`) |
| `color.scrim_zone` | text-zone luminance over media | ≤20%/≥85% (V.4, already an axis) |
| `color.bg_variance` | brightness variance in text zones | <15% (V.5) |
| `color.cvd_separation` | min ΔE00 of semantic pairs under 3 CVD sims | ≥10 (proposed) |
| `color.field_consistency` | distinct surround families per accent | ≤2 (C7 proposed) |

## 4. Conflicts flagged against existing baselines

1. **Two sRGB linearization constants.** `_lum` uses `0.03928`
   (`gate.py:563`), `_luminance` uses `0.04045` (`gate.py:6018`) — the same
   formula, two breakpoints. Consolidate (WCAG uses 0.03928).
2. **`DARK_MAX_L` metric mismatch.** Gate caps dark bg at WCAG Y≤20%
   (`gate.py:5968,6044-6047`) but C.5 writes the spec in HSL L 7–10%
   (`C.md:113-116`). HSL L 10% ≈ Y ~1.3% — the gate is ~15× more
   permissive than the spec. Pin one metric (recommend OKLCH L).
3. **Tint metric mismatch.** C.3 specifies HSL S% bands (`C.md:57-72`);
   `check_neutral_tint` enforces RGB channel-delta bands
   (`gate.py:6531-6552`). Correlated but not linear; a compliant delta can
   violate the S band and vice versa. Convert to OKLCH C or pin S.
4. **`color.surface_contrast` knob has no stated unit** (0.02–0.08,
   `knobs.json:139-152`) while C.1 specifies ≥1.15:1 ratio (`C.md:20`).
   If the knob is a luminance *difference* fraction, it is incommensurable
   with the ratio floor — document or normalize.
5. **Hex-only contrast gate.** `_rgb` parses `#` hex only
   (`gate.py:550-558`); `check_contrast` silently `continue`s on
   non-hex (`gate.py:1533-1535`). ACSS 4 emits **OKLCH** shade values —
   a palette authored in `oklch()` bypasses the gate entirely.
6. **Accent harmony is reviewer-only** (`C.md` enforcement C.4) though it
   is scriptable: OKLCH hue distance of accent vs brand hues vs the closed
   angle sets.
7. **HSL vs OKLCH unified lightness.** ACSS unifies at OKLCH L=0.65
   (`ACSS-DOCS-DIGEST.md:351`); machinery neutral formulas are HSL L%
   (`C.md:62-71`). Same symbol, different space — convert when porting.
8. **V.4 "luminance ≤20%/≥85%" never names the metric** (`V.md:114`) —
   WCAG Y, HSL L and OKLCH L disagree. Pin the space before the axis is
   meaningful.
9. **No colour data in the corpus** — `report.json` sections carry
   geometry/type + PNG, nothing colour (`operator/*/report.json`). All
   axes in §3 need a new extractor.

## Prior art

Verdict: **close but not quite — assemble a measurement pipeline.**

- **`apca-w3`** (npm, Myndex; github.com/Myndex/SAPC-APCA) — reference
  APCA implementation; exact fit for the Lc axis. APCA™ is a trademark on
  the *name*; verify license terms before vendoring.
- **`culori`** (danburzo/culori, MIT) — sRGB↔OKLCH↔CIELAB conversion,
  interpolation, ΔE — exact fit for the measurement-space work.
- **`colour-science`** (python, BSD) — CIEDE2000 + Machado CVD matrices —
  exact fit for the metamerism/CVD axis.
- **`adobe/leonardo`** (Apache-2.0) — contrast-target *generation* and
  per-CVD difference evaluation. Close, but it generates scales; we need
  site *measurement*. Reuse its contrast/CVD math, not the tool.
- **`color-thief`** (lokeshdhakar, MIT) — dominant palette via median-cut
  — reusable for palette-share axes over section PNGs.
- **iwanthue** — perceptually-distinct palette generator; generation,
  not measurement. Not a fit.
- No prior art computes a *per-site deviation vector vs a fixed canon
  into a clustering space* — that delta is ours to build.

## Alternatives

- **Computed styles only, no pixels** — rejected: imagery + scrims +
  anti-aliased text dominate real appearance; pixel stats required for
  share/vibration/scrim axes. Hybrid retained: computed styles for role
  pairs, pixels for areas.
- **WCAG 2.x only, skip APCA** — rejected for the *deviation* layer
  (APCA's polarity + font sensitivity is exactly the discriminative
  signal); WCAG stays the compliance floor.
- **Measure in HSL** — rejected: hue/lightness steps non-uniform; OKLCH
  is the canonical measurement space (C1).

## Gotchas

- **Hue is undefined at C≈0** — weight all hue histograms by chroma;
  exclude C<0.05.
- **Media pixels contaminate palette stats** — V.2 treatments (duotone,
  cinematic) will skew hue/chroma; mask media rects (DOM image boxes) or
  separate chrome-vs-media histograms.
- **Anti-aliased text halves measured contrast** — take the modal fg/bg
  pair inside glyph boxes, not pixel extrema.
- **Gradients/scrims are multi-valued backgrounds** — sample the text
  zone median (or worst cell of a grid), not one point.
- **Dark mode needs interaction on some sites** —
  `prefers-color-scheme` emulation misses class-toggled sites; click
  `data-theme-toggle` when present (fixture `preview/fine.html:50-53`).
- **`light-dark()` computed values change per `color-scheme`** — query
  computed styles once per emulated scheme.
- **sRGB gamut clamp** — OKLCH C≳0.32 exceeds sRGB; screenshots already
  clamp chroma, so measured C ≤ gamut.
- **Metamerism can't be "true"-measured** — simulate observer metamerism
  via CVD matrices; illuminant metamerism is out of scope for screens.
- **Halation is display-dependent** — the axis is a risk score (C and L
  of dark fg), not a render guarantee.

## Assumptions

| Assumption | Load-bearing | Falsifier / evidence that would change it |
|---|---|---|
| Section PNGs suffice for pixel axes | all share/vibration/scrim axes | ICC/dither in PNGs shifts sampled colours → fall back to computed styles |
| `data-theme-toggle` / `prefers-color-scheme` reaches dark mode | all dark-* axes | crawled sites without either → dark axes = null, not 0 |
| APCA Lc needs font size+weight — obtainable via computed style | `color.contrast_lc` | crawler can't resolve text-node fonts → degrade to polarity-only Lc |
| `color.surface_contrast` knob is a luminance-difference fraction | conflict #4 reconciliation | knobs.json/TOKENS docs show it is a ratio → units merge trivially |
| Hue histogram maps to declared temperature bucket | `color.temp_warmth` | media-dominant hue swamps neutral undertone → mask images first |

## Premortem

- **Space confusion**: axes computed in HSL while baselines are OKLCH
  (or vice versa) → garbage deviations. Fix: one converter, one space.
- **Photo-dominant clustering**: hero imagery makes every site "warm,
  medium chroma" → mask media rects before histogramming.
- **APCA-as-floor confusion**: adopting Lc floors as gates while the
  legal requirement is WCAG 2.x → keep dual metrics, WCAG governs.
- **Phantom harmony**: achromatic palettes have noise-hue → classify
  harmony only when ≥2 colours have C>0.05.
- **Accent-share on pixels vs elements**: the ≤10% rule is about element
  area; pixel share counts photos' accent-coloured regions → compute
  DOM-area share primarily.
- **Silent gate bypass**: oklch()/rgb() tokens skip `check_contrast`
  (conflict #5) → a failing palette could ship green.
