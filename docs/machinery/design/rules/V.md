---
id: rules-V
type: rules
links:
  used_in: [w3, w5, w8]
---

## V. Visual media — the art-direction rules

Source: operator imagery SOP (2 docs merged),
`research/sop-sources/SOP-IMAGERY.md`. Media is selected and
art-directed, never decorated — every image earns its pixels against
the closed sets below. A gray box or a filler stock frame in any
composition is a defect.

### V.0 Positive Selection Architecture — words before pixels

The rule is positive, not negative: not "never generic stock" but
**choose imagery that places a human protagonist inside an active
moment.** Stories sell; features don't. Words are decided before
pixels — the image dramatizes the copy's argument, it does not
fill the layout's empty half.

Selection workflow, in order:

1. Words-first story diagnosis — the section's `speech_act` and its
   one-sentence claim (`pages.<slug>.idea`).
2. Graphic universe refs — the visual world the direction implies
   (`direction.temperature`, `direction.finish`).
3. Visual metaphors — what the image *says*, mapped to the claim.
4. Grid + % modulation — aspect ratio (V.3) and canvas share (V.5)
   assigned per section.
5. Production verify — V.8 checklist before any asset ships.

### V.1 Media-by-section decision matrix

Media type is a function of `speech_act` × archetype — picked from
this table, never freehand:

| Section / `speech_act` | Archetype | Media type |
|---|---|---|
| Hero (`promise`) | luxury / craft | first-party real photo or cinematic video |
| Hero (`promise`) | SaaS | product UI walkthrough |
| Hero (`promise`) | conceptual | custom AI narrative scene (V.6 T3 rules) |
| Proof | any | first-party real facility/team only — stock here is a trust defect |
| Detail | physical | macro real photo |
| Detail | abstract / service | vector illustration or 3D |
| Background | any | atmospheric loop or low-frequency texture (V.5 budget) |

Classification rules:

- **Real photo REQUIRED** for high-ticket physical goods, real
  services, team verification.
- **Illustration** for abstract / software / playful — with **100%
  style unity**: never mix flat vector + 3D clay + hand-drawn on one
  site. One taxonomy per site.
- **3D only as brand metaphor.** Chrome spheres, glassmorphism
  ribbons = trend clutter, a defect.
- **Icons = scannable utility markers, never decorative** (utility
  rules §I; corner personality follows §S.1).

### V.2 The four treatments — pick ONE per site

One treatment covers **≥80% of imagery** on the site. A site does
not grade photo-by-photo; `direction.temperature` (§C.2) and
`direction.finish` select the treatment, the treatment is a system.

| Treatment | Fits | Numeric bounds |
|---|---|---|
| **Natural / Documentary** | warm/natural palettes | skin tones true; saturation −5..+10; no crushed shadows; natural light only |
| **High-contrast B&W** | luxury / minimalist | crushed blacks, bright highlights, +10% midtone; pairs with extreme type contrast (T.1) |
| **Duotone / brand-tinted** | corporate / athletic | dark brand color → shadows, light → highlights; tint hue = `H_accent`/`H_brand` (§C.4); ≥4.5:1 in all text zones |
| **Cinematic grade** | editorial / high-end | saturation −15..−25; shadows cool 210–230°; highlights warm 35–45°; contrast 1.15–1.30× |

A one-off treatment is legal only as **declared focal emphasis** —
the `motif.break` mechanism (§L.8). Undeclared style drift between
images is a defect.

### V.3 Aspect ratios — closed set + safe-crop rules

| Use | Ratios |
|---|---|
| Hero | 21:9 or 16:9 (mobile alt 9:16) |
| Narrative split (`split-media`) | 4:3 or 3:2 |
| Square card | 1:1 |
| Portrait | 3:4 or 4:5 |
| Macro detail | 1:2 or 3:4 |

A ratio outside the set is a defect. Safe-crop rules apply to every
crop, every breakpoint:

1. **Rule-of-thirds focal lock** — the subject locks to a third,
   never dead-center unless the composition declares it.
2. **Action vector points INWARD** toward the text; a subject facing
   off-canvas bleeds attention out of the section.
3. **15% outer margin safe zone** — no critical content in the outer
   15% (the same ≥10–15% edge law as T.2 rule 8 / L.3).
4. **Aligned horizon lines** across adjacent media.

`object-fit` decision:

| Media | Fit |
|---|---|
| Backgrounds, heroes | `cover` |
| UI screenshots, logos, product catalog | `contain` — container background matches `surface` token |

`contain` on a photograph is a defect; `cover` on a UI screenshot
crops the evidence — also a defect.

### V.4 Text-on-image — contrast floors + scrim formulas

Contrast floors under overlaid text: **7:1 display / 4.5:1 body**
(the C.1 floors applied to the image region, not the canvas). Local
background luminance under text: **≤20% under white text, ≥85%
under dark** — the same luminance gate as `accent_fg` (§C.4).

Approved scrims (the V.4 refinement of the T.7 40–60% tint rule —
one of these three, not a guess):

| Scrim | Formula |
|---|---|
| Linear to-top | `linear-gradient(rgba(0,0,0,.88) → .65 → .20 → 0)` |
| Radial centered | `radial-gradient(rgba(0,0,0,.75) → .45 → .10 → 0)` |
| Solid brand tint | `rgba(dark, .65)` multiply (dark = §C.5 charcoal) |

Complexity decision:

- **High spatial complexity under the text zone → text moves to a
  `surface` beside the image** — the `split-media` composition
  (catalog §2). This is what the `media` surface is *for*: only under
  a real image overlay, never as a tint (catalog §4).
- **Low complexity + scrim → text-on-image permitted.**

Overlay typography follows T.6: display rank skips weights (never
weight-400 over imagery), tracking tightens on large display,
tracking increases slightly on micro-copy over dark.

### V.5 Background density budget + canvas modulation

Background media (atmospheric loops, textures behind content) holds
a density budget:

- **No sharp micro-details** in any region under content.
- Busy images: **blur ≥16px** or `backdrop-filter: blur(12px)`.
- **Brightness variance <15%** inside text zones.
- The `media` surface requires a real image or video — a tint
  labeled as media is a defect (catalog §4).

Inset media (photos inside cards, `split-media` columns):
- Corner radius ∈ the site's shape-personality radius tokens (§S.2
  scale; component map §S.3) — rounded and sharp never mixed on one
  page.
- Shadows subtle, high-diffusion: `0 20px 40px -15px
  rgba(0,0,0,.07)`. Hard offset shadows only under a neo-brutalist
  `direction.finish`.

**Modulated canvas %** — media share of the page is rhythm, not
accumulation:

1. **100% full-bleed hero** →
2. **80/10 editorial** (media-dominant block) →
3. **60/40 split** (`split-media`, text ≈0.45–0.6 per catalog §2) →
4. **Solid type-only breaks** — the cognitive rest between media
   sections (the layout-layer `spacious` spend, G.3).

Split-media seam rules: image focal point off-center; clean negative
space **at the seam** where image meets text column; horizons
aligned across adjacent splits (V.3 rule 4). `split-media` stacks
media-under-text on mobile unless the plan declares otherwise (L.5).

### V.6 Authenticity hierarchy — T1→T4 + the banned list

Every image is assigned a tier; higher tiers are preferred wherever
the subject is real:

| Tier | Source | Rule |
|---|---|---|
| **T1** | First-party (real team / facility / product) | **mandatory** on About, Team, Case studies |
| **T2** | Editorial stock | unstaged only, graded to the site's one treatment (V.2) |
| **T3** | Prompt-engineered AI | only for a specific narrative impossible to stock; prompt must specify lens (e.g. 85mm f/1.4), lighting, grain, palette — **never fake team, testimonials, or inventory** |
| **T4** | Stylized vector / 3D kits | abstract utility only |

**Banned list — zero tolerance:**

- Staged corporate stock: handshakes, blank-whiteboard pointers,
  headset reps.
- Fake AI headshots (any invented human presented as real).
- Watermarked or visibly compressed assets.
- Corporate-Memphis flat clip-art.

### V.7 Responsive art direction

Art direction survives the breakpoint, it doesn't just shrink:

1. **`<picture>` with art-directed crops per breakpoint** — mobile
   4:5/9:16 vs desktop 16:9 (ratios ∈ V.3 set), not one crop scaled.
2. **Formats:** AVIF primary + WebP + legacy fallback, in that order.
3. **Densities:** `@1x`/`@2x` everywhere, `+@3x` on mobile.
4. **Hero master ≥3840px** wide.
5. **Loading:** hero `loading="eager"` + `fetchpriority="high"`
   (the LCP asset); all below-fold media `lazy` + async decode.

### V.8 Media QA — mechanical checklist

Checked at DESIGN-PLAN review and build self-lint:

- [ ] Positive selection met: every image is human-in-environment or
  narrative, not filler
- [ ] Brand metaphor grounded; 3D = metaphor only, no trend clutter
- [ ] Taxonomy unmixed: no flat-vector + 3D-clay + hand-drawn blend
- [ ] Single treatment ≥80% of imagery; any one-off is declared
  (`motif.break`)
- [ ] Every aspect ratio ∈ V.3 closed set
- [ ] Focal point in safe zone; action vector points inward
- [ ] Text-on-image floors met: 7:1 display / 4.5:1 body; approved
  scrim used; luminance ≤20%/≥85% in text zone
- [ ] Background density under budget: no micro-detail, blur ≥16px,
  variance <15%
- [ ] Every asset assigned T1–T4; zero banned-list hits
- [ ] `<picture>` art-directed per breakpoint; AVIF/WebP/fallback;
  @1x–@3x; hero eager+`fetchpriority="high"`, below-fold lazy

---

## Enforcement

Generated from `enforcement.json` (`gate.py enforcement`) — edit the JSON, never this table.

| Rule | Tier | Mode | Check / rubric | FAILs when | Wave |
|---|---|---|---|---|---|
| V.0 | stylistic | reviewer | `media-words-first` | positive selection: words before pixels | w8 |
| V.1 | stylistic | reviewer | `media-matrix` | media-by-section matrix followed | w8 |
| V.2 | stylistic | script | `check_system_enums` | one treatment ∈ {natural,bw,duotone,cinematic} | w5 |
| V.3 | structural | script | `check_section_enums` | media_ratio ∈ closed set | w3 |
| V.4 | stylistic | script | `check_measurable` | text-on-image floors + scrim | w7 |
| V.5 | stylistic | reviewer | `bg-density` | canvas modulation budget | w8 |
| V.6 | stylistic | script | `check_system_enums` | authenticity tier declared; T1 keep-list | w5 |
| V.7 | stylistic | reviewer | `art-direction` | responsive crops per ratio | w8 |
| V.8 | stylistic | script | `check_measurable` | <picture>, ratios, scrims, tiers | w7 |
