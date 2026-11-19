# STYLE-VOCAB — named web styles as measurable deviation signatures

Researched 2026-11-19. Scope: the closed vocabulary of named web styles,
each expressed as a **signed deviation vector** against the factory's
fixed baselines — the answer to "which rules does this style bend, which
direction, and by how much." Feeds `patterns/data/style-space.json`
(`docs/machinery/design/patterns/tools/sop_adherence.py:253-344`) where
per-site deviation vectors already cluster and get named
(`NAMER`, `sop_adherence.py:196-204`: `display-led`, `airy/editorial`,
`dense`, `wide-bleed`, `long-measure`, `freeform-radius`,
`mid-zone-contrast`). This document supplies the *named-style* layer the
current emergent names lack.

Convention: `↑`/`↑↑`/`↓↓`/`↓`/`=` = direction and rough magnitude of
deviation vs baseline (`↑` ≈ +0.25–1.0 normalized units, `↑↑` > +1.0;
units are `TOL` at `sop_adherence.py:253-254`). "Bend" always means the
*style's* signature move, not a license to violate accessibility floors
(contrast 4.5:1/7:1 and V.4 text-zone luminance are floors, not dials).

---

## 1. Axis glossary — what is measurable and where it already lives

Every axis below has an existing measurement substrate in-repo; the
right column names it so the plan reuses rather than rebuilds.

| Axis | Measurable form | Where measured today | Canon baseline |
|---|---|---|---|
| `radius` | px distribution of `border-radius` across `representative_styles` → median value + off-ladder share | `site_measure()` `sop_adherence.py:128-150`; annotation `radius_personality` (`TAXONOMY.md:131`) | ladder {0,2,4,6,8,12,16,24,9999}, single personality P1–P4 (`research/sop-sources/SOP-RADIUS-SHAPE.md` §1.1–1.3; `sop_adherence.py:47-48`) |
| `border` | border-width histogram; hard vs soft separation strategy | DOM styles (not yet a SOP axis) | closed set {0,1,2}px, 1px rest / 2px focus (SOP-RADIUS-SHAPE §4.1) |
| `shadow` | blur radius, offset distance, color alpha; count of `box-shadow`; `backdrop-filter` presence | DOM styles; `frosted-touch` detector `blur_shadow` (`trends.json:37-42`) | soft high-diffusion `0 20px 40px -15px rgba(0,0,0,.07)`; hard offset shadows legal ONLY neo-brutalist (SOP-IMAGERY §5); shadow blur ∝ radius (SOP-RADIUS-SHAPE §6) |
| `palette` | hue count, mean chroma, chroma variance, pastel share; luminance mean | `trend_detect.py` (`chroma_min` 60, `chroma_var_min` 800, `pastel` — `trends.json:15-42`); CLASSIFY §2 `saturation` enum | six named roles (ACSS digest §7.1); natural saturation −5..+10 (SOP-IMAGERY §2) |
| `type` | heading:body ratio, display face class (serif/sans/mono/mixed), weight, tracking | `heading_body_ratio` annotation (`TAXONOMY.md:130`), `display-face` gene (`GENOME.md:78-81`), `fsizes` in `site_measure` (`sop_adherence.py:152-160`) | contrast 3–6× body (`T.1`, REF 4.5, TOL 1.5); measure ≤65ch, body ≥16px (`T.6`) |
| `density` | whitespace share (empty-area fraction); ink coverage | `whitespace_share` annotation (`TAXONOMY.md:131`), `whitespace-band` gene cuts `GENOME.md:167-170` | whitespace ≥0.35 P25 floor (`L.4`, `sop_adherence.py:53-54`); bands tight <0.25 / medium 0.25–0.45 / airy >0.45 |
| `motion` | motion-tier enum; animated-element share; easing class | `motion-tier` gene (`GENOME.md:129-132`); `meta.json.motion` per CLASSIFY-MOTION (`motion_scan.py`) | Subtle/Minimal tier: <4px offsets, transform/opacity only, one focal animation per viewport, ≤80px+fade, 300–400ms (SOP-MOTION §1–4,7) |
| `texture` | gradient count/variance, noise/grain CLIP fields, surface translucency | CLASSIFY §3 `fill`, `grain_noise` (`CLASSIFY.md:38-43`); `gradient` detector flag (`trends.json:22-23`) | flat surfaces; ONE imagery treatment/site ≥80% (SOP-IMAGERY §2) |
| `symmetry` | left/right ink-mass ratio; layout archetype (asymmetric-offset vs stacked-center) | `layout-archetype` gene (`genome.json:2-19`); block centroids in `blocks[]` | grid-snapped; asymmetry legal inside 12-col (SOP-RESPONSIVE §3) |
| `width` | median element `max-width` vs band | `site_measure` `sop_adherence.py:142-148` | R.1 band 1200–1440, REF 1320, TOL 240 |
| `surface` | surface sequence enum per section | `surface` annotation + `surface-rhythm` gene (`GENOME.md:93-95`) | alternating/one-contrast-moment (DESIGN-LIBRARY-TAKEAWAY §3) |
| `media` | media_ratio, medium, style label, treatment | `media_ratio`/`media_type` (`TAXONOMY.md:132`); CLASSIFY §7 `style` 30-value vocab (`CLASSIFY.md:104-115`) → `STYLE_FAMILY` six families (`tools/design-gate/genome.py:172-187`) | closed aspect ratios; one treatment; authenticity T1–T4 (SOP-IMAGERY §2–3,6) |

**Corpus adherence stats** (which axes actually discriminate style):
`research/SOP-ADHERENCE.md` — S.2 radius 97% (n=175), T.1 type contrast
**52%** (n=175), T.6 measure 100% (n=529), R.1 width **11%** (n=80),
L.4 whitespace 98% (n=529), V.4 luminance 86% (n=229). Interpretation:
T.1 (type contrast) and R.1 (width) are where canon sites bend — i.e.,
where style lives. L.4/S.2/T.6 near-saturation means those axes carry
discipline signal, not style signal; bending them reads as defects, not
a look.

---

## 2. The signature table — 18 styles as deviation vectors

Magnitudes cite repo thresholds where they exist; `[INFERENCE]` marks
researcher synthesis from external description without numeric repo
grounding.

| Style | radius | border | shadow | palette | type | density | motion | texture | Confidence |
|---|---|---|---|---|---|---|---|---|---|
| **minimal** | small, single value (0–8) [INFERENCE] | 0–1px [INFERENCE] | none/subtle [INFERENCE] | ↓↓ chroma ≤25, narrow hue set (`resonant-stark`: `chroma_max 25`, `trends.json:30`) | ↓ contrast, thin display (`resonant-stark` ultra-thin) | ↑↑ whitespace ≥0.7, ink ≤0.15 (`trends.json:28-32`) | static/subtle [INFERENCE] | none/soft gradient | high (detector-grounded) |
| **brutalist** (classic) | 0 everywhere [INFERENCE] | 1–2px visible, asymmetric [INFERENCE] | none | high-contrast flat, often default colors | system/mono faces, extreme or absent scale hierarchy [INFERENCE] | ↓ dense, whitespace <0.25 [INFERENCE] | static, abrupt [INFERENCE] | none | medium — canonical traits (NN/g "raw, unrefined, intentionally unfinished" [1]) but no numeric thresholds anywhere |
| **neo-brutalist** | 0 square [INFERENCE] | ↑↑ **2–4px+ black** — exceeds canon {0,1,2} (conflict §4.1) [2][3][5] | ↑↑ hard offset, **zero blur, full-color** (usually black) [2][3] | ↑↑ flat saturated primaries [4][5] | ↑↑ oversized display, T.1 +1..+4 dev [5][INFERENCE] | ↓/= compact-medium [INFERENCE] | subtle/abrupt [INFERENCE] | none | high |
| **maximalist** | mixed [INFERENCE] | mixed [INFERENCE] | layered | ↑↑ palette_size 8+ (CLASSIFY §3), chroma variance ↑ | ↑ many sizes, mixed faces [INFERENCE] | ↓↓ tight <0.25 | expressive/cinematic [INFERENCE] | ↑ collage/texture | medium — CLIP label `maximal` exists (`CLASSIFY.md:104`) but signature is descriptive [6] |
| **editorial / Swiss / International** | = small/0 [INFERENCE] | hairline rules [INFERENCE] | none/subtle | ↓ near-monochrome + one accent [INFERENCE] | ↑↑ **flush-left ragged-right, asymmetric grid, T.1 high/extreme** (canon `display-led` cluster +4.3 dev; luxury-goods `type-contrast high` 92%) | ↑ airy [INFERENCE] | subtle | none | high (ITS hallmarks: asymmetry + grid + sans + flush-left [7]; corpus `editorial-single` dominant) |
| **glassmorphism** | ↑ 12–24 soft-large [8][INFERENCE] | thin light border (`border: 1px rgba(255,255,255,.2)`) [4][8] | ↑ **diffused + `backdrop-filter: blur()`** — detector `blur_shadow ∧ translucent ∧ pastel` (`trends.json:37-42`; trend name `frosted-touch`) | pastel [9] | = baseline | =/↓ medium [INFERENCE] | subtle | ↑ blur/translucency | high |
| **neumorphism** | ↑ large soft [INFERENCE] | 0 — elements merge into surface [10] | ↑↑ **paired light+dark soft shadows** (dual extrusion) [10] | ↓↓ monochrome same-surface; **element-vs-bg luminance delta <~0.1** [INFERENCE] | = | = | subtle | embossed | medium-high — BUT signature trait (low contrast) collides with the 4.5:1 floor [11][12] |
| **claymorphism** | ↑↑ ≥16–24, pill (P4 ≥20px, SOP-RADIUS-SHAPE §1.1) [INFERENCE] | 0 [INFERENCE] | ↑↑ multiple: outer soft + inner light (inflated look) [10] | pastel [10] | rounded chunky faces [INFERENCE] | = medium | playful overshoot [INFERENCE] | soft-3D | medium — CLIP `claymorphism/3D soft` label exists (`CLASSIFY.md:104`); no numeric thresholds |
| **skeuomorphic** | = small [INFERENCE] | bevel/inset edges [INFERENCE] | ↑ realistic drop+inset, gradients | textured material mimicry [13] | = | = | = | ↑↑ texture/noise (`grain_noise` field) | medium — `light-skeuomorphism` trend detector: embossed ∧ soft gradient ∧ mid chroma ∧ rounded (`trends.json:44-52`) |
| **flat** | = 0–4 [INFERENCE] | = [INFERENCE] | ↓↓ **zero** (shadow count ≈0) [14] | solid saturated blocks | = | = | static/subtle | ↓↓ zero gradient | high — flat = "removes 3D elements: textures, shadows, gradients" [14]; negatives are directly countable in DOM |
| **corporate / Memphis** | = soft P2/P3 (4–16) [INFERENCE] | = | subtle | ↑ bright unworldly palette [15][16] | = sans medium contrast | = regular/spacious | = subtle | ↑ flat vector illustration medium (CLIP `corporate-Memphis`/`Memphis` → playful, `genome.py:179-180`) | medium-high — note SOP-IMAGERY §6 **bans** "corporate-Memphis flat clip-art" as generic-stock tier; style is canon-flagged negative |
| **bento** | ↑ consistent soft-large radius [17] | subtle [INFERENCE] | soft uniform [17] | one accent tile per grid [17] | = clean, label+copy per tile | ↓ high density inside tiles, gaps tight-uniform [INFERENCE] | subtle [INFERENCE] | = | medium — archetype measurable via `layout-archetype` + mixed grid-cell spans; mixed-size rounded rect cards on shared grid [17] |
| **retro / Y2K** | = mixed, often beveled [INFERENCE] | ↑ visible multi-borders [INFERENCE] | metallic/bevel [INFERENCE] | ↑↑ candy multi-color gradients, chroma_var ≥800 (`dial-up-delight` detector `trends.json:18-26`) | ↑ gothic/condensed/mono display | ↓ compact detector flag | expressive | ↑ gradient+metallic | high (detector-grounded; `dated` anti-trend = same markers + old-web era evidence, TRENDS.md) |
| **luxury / premium** | =/↓ soft small, single personality (luxury-goods `radius soft` 100%) | hairline [INFERENCE] | subtle/none | ↓↓ dark or neutral field, one accent; mood-register `luxury`/`ultra` (68% `luxury` in profile) | ↑↑ **serif display 100%, type-contrast high 92%** (`dna/luxury-goods.md`) | ↑↑ airy >0.45 (`whitespace-band airy` 80%) | **subtle 100%, Elegant easing** (SOP-MOTION §1) | cinematic grade or B&W treatment | high (n=600 corpus profile) |
| **playful** | ↑↑ pill ≥20 + 9999 (P4; blobs/arches P4-only SOP-RADIUS-SHAPE §5) | playful colors [INFERENCE] | soft saturated [INFERENCE] | ↑↑ saturated multi-hue | rounded display, T.1 ↑ | = medium | ↑↑ Playful personality: elastic overshoot, scale pop (SOP-MOTION §1) | cartoon medium (`STYLE_FAMILY` cartoon/children's-book → playful) | medium-high |
| **techy / developer** | ↓ sharp P1 (0–2) [INFERENCE] | 1px hairlines [INFERENCE] | subtle glow [INFERENCE] | dark field + neon single accent, `cyberpunk/neon` CLIP label | ↑ **mono display-face** (gene allele `mono`, `GENOME.md:78-81`); code-block media `screenshot` = dev-tool signature (`GENOME.md:151-155`) | ↓ compact [INFERENCE] | subtle; code/terminal motifs | = | medium-high |
| **organic / natural** | ↑ organic blobs (P4 shape vocabulary) [INFERENCE] | 0 [INFERENCE] | soft [INFERENCE] | earthy low-chroma warm; `nature/landscape` subject_class | serif/humanist [INFERENCE] | =/↑ medium-airy | gentle ease-both | ↑ grain/texture | medium-low — weakest canon grounding; derived from CLASSIFY subject/medium vocab + wabi-sabi label |
| **dark-noir** | = small [INFERENCE] | hairline [INFERENCE] | subtle glow [INFERENCE] | ↓↓ mean luminance <0.2 field; `surface-rhythm dark-dominant` allele (`GENOME.md:93-95`) | thin display + bright accent [INFERENCE] | ↑ airy-dark [INFERENCE] | subtle/cinematic | cinematic/B&W treatment (SOP-IMAGERY §2 High-contrast B&W = luxury/minimalist) | medium |

**Cluster mapping to machinery:** current `style-profiles.json` clusters
map onto this vocab as: `display-led+R.1-*` → editorial/Swiss;
`T.1-1.0+freeform-radius` (T.1 −1.0, S.2 +0.3) → minimal-corporate;
`R.1-2.8+freeform-radius` (R.1 −2.75) → narrow-column/prose-led sites —
a proxy artifact (see Gotchas G3), likely editorial/blog rather than a
named style.

---

## 3. Art-direction rules — canon law vs folk wisdom

| Rule | Statement | Measurable? | Baseline value | Confidence | Source |
|---|---|---|---|---|---|
| Visual weight | Darker, larger, more complex, higher-contrast elements weigh more; balance is by weight, not area | yes — ink×area×contrast centroid vs geometric center of section | centroid within ±~10% of center for "balanced" [INFERENCE] | medium | Smashing "Design Principles: Visual Weight and Direction" [18] |
| Symmetry types | Symmetrical = stable/formal; asymmetrical = dynamic, needs counterweight; radial = focus to center | yes — left/right ink-mass ratio; radial: angular centroid spread | ratio ≈1.0 ±0.1 symmetric; >1.5 asymmetric | medium | same Smashing series; Gestalt symmetry principle [19] |
| Figure/ground | Reader must parse which element is figure; ambiguous figure-ground = defect | yes — boundary contrast, containment ratio | stable figure-ground: foreground/background ΔL ≥ 0.2 [INFERENCE] | high (Gestalt canon) | Smashing Gestalt principles [19]; DESIGN-FORETHOUGHT §2.5 |
| Scale hierarchy | One dominant element per viewport; the rest de-emphasized | yes — largest ink block vs second ratio | ≥2× area or the T.1 3–6× type contrast | medium-high | Refactoring UI "emphasize by de-emphasizing" (DESIGN-FORETHOUGHT §1.1); Williams C.R.A.P. |
| Contrast-of-scale | Elements that differ should differ *really* — adjacent rank gap = one scale step minimum | yes — adjacent-rank size ratio vs type scale | ≥1 scale step (ratio ∈ {1.125..2.0}) | medium-high | Williams "really different"; Bringhurst scale (DESIGN-FORETHOUGHT) |
| Rule of thirds | Focal elements at third intersections | partial — focal centroid distance to third-lines | ~33%/67% lines | **contested — folk wisdom**: weak empirical support vs center-bias; widely taught, rarely validated | common lore; flag contested |
| Golden ratio | Proportions at φ≈1.618 | yes — ratio check | φ | **contested — folk wisdom**: no evidence users prefer φ grids; modular scales preferred | common lore; flag contested |
| Gutenberg "reading gravity" | Eye sweeps top-left→bottom-right; terminal area holds CTA | partial — CTA position vs bottom-right quadrant | CTA in terminal quadrant for text-heavy layouts | **contested** — print-derived model, applies to homogeneous text layouts; NN/g's eyetracking work supersedes it | vanseodesign Gutenberg diagram [20]; ux-guidelines [21] |

## 4. Scanning patterns, serial position, information scent, content-first

| Rule | Statement | Measurable? | Baseline value | Confidence | Source |
|---|---|---|---|---|---|
| F-pattern | On text-heavy left-aligned pages users scan horizontal top bar → second shorter bar → left vertical stem; first 2 lines and first 2 words of each line carry the information load | yes — proxy: layout signature (uniform left-aligned text rows, few standouts) predicts F; heading first-words should carry the point | front-load keywords in headings/list items | high — NN/g eyetracking | NN/g "F-Shaped Pattern" [22]; "Text Scanning Patterns" [23] |
| Z-pattern | On sparse layouts (few elements, weak center) eye traces Z: top-left→top-right→bottom-left→bottom-right | yes — proxy: sparse page + corner-placed elements | corner placement for logo/nav/CTA | medium — NN/g describes Z for simple pages; design-blog amplification | NN/g [23]; vanseodesign [20] |
| Layer-cake | Fixations land on headings/subheadings only when headings look like headings and *preview the section* | yes — heading vs body contrast (T.1) + heading_form `claim` vs `label` (gene `GENOME.md:163-165`) | descriptive headings, each self-sufficient | high | NN/g "Layer-Cake Pattern" [24] |
| Spotted | Eyes jump to standout words differing in shape — bold, links, numbers | yes — styled-span share inside paragraphs | deliberate emphasis words | high | NN/g [22][23] |
| Marking | Eyes trail mouse cursor or text highlight | partial — interaction signal, not a still | n/a | medium | NN/g [22] |
| Bypassing | Users skip items in lists that look identical; varied first words resist skipping | yes — first-word entropy of list items | varied lead words | high | NN/g [22] |
| Serial position (primacy/recency) | First and last items in a sequence are recalled best; put highest-value items at sequence endpoints | yes — primary CTA/nav item ordinal position | strongest content at position 1 or n | high | IxDF serial position [25]; Laws of UX [26] |
| Information scent | Users navigate by foraging: a link's label must predict its destination; weak scent = abandonment | partial — lexical overlap between link text and destination heading; needs NLP, not pixel measurement | link text ≠ vague ("click here") | high | NN/g "Information Scent" (info-foraging theory) [27] |
| Content-first | Form is a relationship with content decided before styling; content exists before layout | partial — every section maps to a `speech_act` in {promise,proof,tension,how,objection,act,detail,chrome} (`TAXONOMY.md:96-98`); unmapped section = defect | 100% sections mapped | high | Rand form–content relationship; DESIGN-FORETHOUGHT §1.1–2.2 |

---

## 5. Prior art

**Verdict: Not close — build new, reusing the in-repo measurement
substrate.** Search terms: `website style classifier machine learning
visual design clustering design tokens extraction`, `cssstats design
token extraction`, `predicting website aesthetics style from screenshot
deep learning`, `bento glassmorphism CSS signature`.

- **CSS Stats / Project Wallace** (cssstats.com, projectwallace.com) —
  extracts full CSS value histograms from a URL: every color, font-size,
  spacing value, specificity, z-index. This is the *measurement
  substrate* for style axes (their color/font-size sets = our palette/
  type axes). It emits no style labels or baselines — no deviation
  vector, no clusters. **Close for measurement, absent for
  classification.** [28][29]
- **Reinecke, Yeh et al., CHI'13** — quantifies *perceived visual
  complexity and colorfulness* from DOM+screenshot features and predicts
  aesthetic first-impression scores. Validates that pixel/DOM statistics
  predict aesthetic judgement — but the output is a rating, not a named
  style signature. [30]
- **Webthetics (Dou, Zheng et al.)** — CNN on webpage screenshots
  predicting aesthetic ratings. Same gap: scores, not vocab. [31]
- **In-repo closest-fit: `trend_detect.py` + `STYLE_FAMILY` +
  `sop_adherence.py` clustering.** The 8-label trend vocab has
  detector thresholds (the only numeric style signatures anywhere), but
  it is year-stamped fad detection, not the perennial style taxonomy —
  `ai-personalisation` is already marked `insufficient`/unmeasurable
  (`trends.json:32-35`). The deviation-vector clustering machinery
  exists and works; what's missing is the named-style signature table
  (this document §2) and the border/shadow/texture axes not yet in SOP.
- **No prior art** does "style = signed deviation from a fixed canon
  baseline, clustered into named styles" — the signature-table concept
  is the factory's own invention (the "music theory" frame).

## 6. Alternatives

- **VLM one-shot "what style is this site" label** — rejected:
  `patterns/VALIDATION.md:266-270` documents that whole-section crops
  read as "UI screenshot" ~85% of the time under CLIP, and labels below
  the 0.02 margin floor are emitted `other:ambiguous`. Style labels are
  trustworthy on *media blocks* (CLASSIFY.md is media-scoped), not
  whole-page screenshots. Use geometric/DOM axes as primary, media-block
  CLIP labels as corroborating votes.
- **Adopt the trend vocab as the style space** — rejected: 8 labels are
  2026 fads; a style space must classify minimal/brutalist/luxury sites
  that carry `trend: none`.
- **Keep emergent cluster naming only** — rejected as sole mechanism:
  `NAMER` produces `R.1-2.8+freeform-radius` strings that name the bend,
  not the style; a named-style layer is what the plan needs. Keep
  emergent naming as fallback for vectors matching no signature.
- **Extend SOP with new baseline axes first** — alternative, not
  rejected: border width, shadow personality, gradient presence,
  mono-display-face are measurable axes with no SOP id. If the plan adds
  SOP ids for them, the signature vectors vectorize for free.

## 7. Gotchas / failure modes found

1. **S.2 measures discipline, not personality.** `site_measure` counts
   the *share off the ladder* (`sop_adherence.py:140-144`) — a site at
   radius 0 everywhere (brutalist) and a site at 9999 everywhere
   (playful) can both score `on_rule`. Style detection needs the px
   median + histogram, not ladder membership. P1 sharp vs P4 pill is a
   *median-radius* read (P1 0–2 / P2 4–8 / P3 12–16 / P4 ≥20,
   SOP-RADIUS-SHAPE §1.1).
2. **T.1 direction is asymmetric.** Baseline 3–6×; `dev()` centers on
   REF 4.5 — a 2.5× site (low-contrast minimal) and a 10× site
   (display-led editorial) bend *opposite* directions; both must be
   legal signatures. The corpus `display-led` cluster centroid sits at
   T.1 +4.3 and +18.5 dev (style-profiles.json) — editorial/extreme.
3. **R.1's measured value is a proxy.** It is the median of *element*
   `max-width` in representative_styles (`sop_adherence.py:142-148`),
   not the site canvas width — the −2.75 centroid ≈ median element
   width ~660px, i.e., prose columns, not narrow sites. Re-anchor if
   the plan wants canvas width.
4. **Canon lint can prevent expressing a style.** Neubrutalism's 2–4px
   borders exceed canon `{0,1,2}` (SOP-RADIUS-SHAPE §4.1) and its zero
   corners violate nothing — but `check_border_widths` (S.5) would flag
   it. Neumorphism's defining low contrast violates the 4.5:1 floor and
   SOP-IMAGERY §5 bans hard offset shadows outside neo-brutalism.
   Corporate-Memphis illustration is *banned* as generic stock
   (SOP-IMAGERY §6). Rule: **measure style before linting**; style
   classification runs on the measured site, never as a target the gate
   enforces — and two styles (neumorphism, corporate-Memphis) should be
   flagged "expressible only by waiving canon."
5. **Motion is invisible in stills.** Motion-tier needs
   `meta.json.motion` (CLASSIFY-MOTION / `motion_scan.py`), not section
   crops. Sites captured without motion scan have no signal — treat as
   missing, not `static`.
6. **F/Z/Gutenberg are priors, not measurements.** They predict where
   users look given layout geometry; the layout signature is what's
   measurable. Never label a site "F-pattern" from a screenshot — label
   it "F-pattern-inducing layout."
7. **Whitespace band thresholds exist but are per-section** —
   `whitespace-band` cuts (<0.25/0.25–0.45/>0.45, `GENOME.md:167-170`)
   vs L.4's per-type P25 floor. A luxury site can hit `airy` on imagery
   sections and `medium` on text; signature = band *distribution*, not a
   single cut.
8. **Era collision.** `dial-up-delight` (Y2K revival) and `dated` share
   pixel markers, separated only by era evidence (TRENDS.md anti-trend
   note). Same risk: skeuomorphic vs `light-skeuomorphism` — the 2026
   variant is restrained (embossed soft surfaces, not leather texture).
   Style signature must include era/degree, not just marker presence.
9. **Styles are multi-label and compositional.** dark-noir ∧ luxury ∧
   editorial co-occur; the signature table is a fuzzy basis set — the
   machinery's cosine-to-centroid `coherence` score
   (`sop_adherence.py:225-236`) already handles "consistent direction =
   intentional style, isolated bend = sloppy."
10. **`ai-personalisation`-type styles are unmeasurable from pixels** —
    already marked `insufficient` in `trends.json`; keep that precedent
    for any behavioral style.

## 8. Assumptions

| Assumption | Load-bearing? | Falsifier / evidence that would change it |
|---|---|---|
| Named styles = consistent *direction* of deviation, not magnitude alone | Yes — the whole clustering thesis | k-means clusters uncorrelated with VLM/CLIP style labels on media blocks; coherence score flat across corpus |
| `representative_styles` in operator meta.json covers enough DOM to detect radius/width/type signatures | Yes | sites lacking `representative_styles` return `{}` from `site_measure` → silent signal loss; audit coverage of meta.json fields |
| Whitespace share is stable across viewport widths | Medium | high variance between 360/1280 shots of same section → band flips |
| Page-level style correlates with media-block CLIP style labels | Medium — corroborating axis only | editorial layout + playful media (common hybrid) splits the signal; that's real, not noise — needs two-tier signature (layout axes vs media axes) |
| The 18-style vocab is closed enough | Yes | vertical DNA profiles showing dominant genes no signature explains → add a style row |

## 9. Premortem

- **Signature collapse**: minimal / resonant-stark / editorial all read
  "high whitespace + low chroma." The discriminators are type contrast
  (minimal ↓ vs editorial ↑↑) and display-face (serif = luxury/
  editorial, mono = brutalist/tech). If the plan weights whitespace too
  heavily these three collapse into one cluster.
- **Corpus bias**: canon skews agency-portfolio/SaaS → editorial +
  display-led overrepresented; brutalist/clay/neumorphic styles are
  nearly absent from canon (they're mostly *not* canon-tier). Signature
  vectors for absent styles rest on external description (marked
  [INFERENCE] + medium confidence) — the style space will under-sample
  exactly the styles it needs to name.
- **Trend rot**: the trend layer is year-stamped by design; perennial
  styles don't rot. If style signatures are merged with trend labels
  without separation, "dated" detection bleeds into legitimate
  retro/Y2K classification.
- **False style assignment on defect vectors**: a sloppy site bending
  rules incoherently must score *low coherence*, not "maximalist" — the
  coherence field exists for exactly this; a style assignment without a
  coherence floor will rename messes as styles.

---

## Sources

[1] NN/g, "Neobrutalism: Definition and Best Practices" — https://www.nngroup.com/articles/neobrutalism/
[2] LogRocket, "Neubrutalism in web design" — https://blog.logrocket.com/ux-design/neubrutalism-web-design/
[3] madegooddesigns, "Neobrutalism: The Anti-Design Trend Explained" — https://madegooddesigns.com/neobrutalism-web-design/
[4] neubrutalism.com, "The Definitive Guide" — https://neubrutalism.com/
[5] Gleam Studio, "Neo Brutalism Web Design: CSS Recipe" — https://www.gleamstudio.design/blog-post/neo-brutalism
[6] Envato, "What is the maximalism graphic design trend?" — https://elements.envato.com/learn/maximalism-graphic-design-trend
[7] Wikipedia, "International Typographic Style" — https://en.wikipedia.org/wiki/International_Typographic_Style
[8] superdesign.dev, "Glassmorphism: CSS Recipe" — https://superdesign.dev/styles/glassmorphism
[9] refracttools, "Neumorphism vs Glassmorphism vs Claymorphism" — https://refracttools.com/blog/ui-design/neumorphism-vs-glassmorphism-vs-claymorphism/
[10] design-bootcamp, "Glassmorphism vs. Neumorphism vs. Claymorphism" — https://medium.com/design-bootcamp/glassmorphism-vs-neumorphism-vs-claymorphism-what-to-use-in-2025-480ff14370bf
[11] NN/g, "Low-Contrast Text Is Not the Answer" — https://www.nngroup.com/articles/low-contrast/
[12] Axess Lab, "Neumorphism – the accessible and inclusive way" — https://axesslab.com/neumorphism/
[13] Daylight Studio, "Skeuomorphic Design: What It Is" — https://thedaylightstudio.com/skeumorphic-web-design-trend-shifting-out-of-favor/
[14] LogRocket, "Flat design and its relevance" — https://blog.logrocket.com/ux-design/flat-design/
[15] Webflow, "Corporate Memphis" — https://webflow.com/blog/corporate-memphis
[16] Aesthetics Wiki, "Corporate Memphis" — https://aesthetics.fandom.com/wiki/Corporate_Memphis
[17] uistyleguide, "Bento Grids" — https://www.uistyleguide.com/style/bento-grids
[18] Smashing, "Visual Weight and Direction" — https://www.smashingmagazine.com/2014/12/design-principles-visual-weight-direction/
[19] Smashing, "Gestalt Principles" — https://www.smashingmagazine.com/2014/03/design-principles-visual-perception-and-the-principles-of-gestalt/
[20] vanseodesign, "Gutenberg Diagram, Z-Pattern, F-Pattern" — https://vanseodesign.com/web-design/3-design-layouts/
[21] ux-guidelines, "Gutenberg Principle" — https://www.ux-guidelines.com/gutenberg-principle.html
[22] NN/g, "F-Shaped Pattern of Reading" — https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/
[23] NN/g, "Text Scanning Patterns: Eyetracking Evidence" — https://www.nngroup.com/articles/text-scanning-patterns-eyetracking/
[24] NN/g, "Layer-Cake Pattern" — https://www.nngroup.com/articles/layer-cake-pattern-scanning/
[25] IxDF, "Serial Position Effect" — https://ixdf.org/literature/topics/serial-position-effect
[26] Laws of UX, "Serial Position Effect" — https://lawsofux.com/serial-position-effect/
[27] NN/g, "Information Scent" — https://www.nngroup.com/articles/information-scent/
[28] Project Wallace — https://www.projectwallace.com/about + https://www.projectwallace.com/blog/extracting-css-from-webpage
[29] CSS Stats — https://cssstats.com/
[30] Reinecke, Yeh, Miratrix, Mardiko, Zhao, Liu, Gajos, "Predicting users' first impressions of website aesthetics" CHI'13 — https://kgajos.seas.harvard.edu/papers/reinecke13aesthetics.pdf
[31] Dou, Zheng et al., "Webthetics: Quantifying Webpage Aesthetics with Deep Learning" — https://www.semanticscholar.org/paper/af510c7bb1e599ebfa7ab23790ff7b8fd4b27865

Repo anchors: `docs/machinery/design/patterns/tools/sop_adherence.py`
(SOP:46-57, TOL/REF:253-256, dev:259-278, NAMER:196-204);
`docs/machinery/design/patterns/data/style-profiles.json`;
`research/SOP-ADHERENCE.md`;
`docs/machinery/design/patterns/TRENDS.md` + `data/trends.json`;
`docs/machinery/design/dna/GENOME.md` (genes);
`docs/machinery/design/dna/luxury-goods.md`, `saas.md`;
`tools/design-gate/genome.py:172-187` (STYLE_FAMILY);
`templates/image-brief/CLASSIFY.md` §7 (`CLASSIFY.md:104-115`);
`docs/machinery/design/patterns/TAXONOMY.md` (annotation schema);
`research/sop-sources/SOP-{RADIUS-SHAPE,MOTION,IMAGERY,RESPONSIVE}.md`;
`research/acss/ACSS-DOCS-DIGEST.md`.
