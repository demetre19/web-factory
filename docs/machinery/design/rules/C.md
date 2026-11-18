---
id: rules-C
type: rules
links:
  used_in: [w2, w3, w8]
---

## C. Colour — the deterministic palette system

Source: operator colour SOPs (4 variants — Futur/Core attribute
mapping, programmatic LM spec, role-map spec, Greg Gun arc method).
They converge on one system; this is it. A site never "picks a colour"
— it derives one from the brief through the formula below.

### C.1 The 6-role semantic map (closed set)

| Token | Role | Contrast floor |
|---|---|---|
| `bg` | canvas | root |
| `surface` | cards, containers | ≥1.15:1 vs bg |
| `surface_elevated` | modals, popovers | ≥1.2:1 vs surface |
| `ink` | primary text | **≥7:1** vs bg/surface (AAA) |
| `ink_muted` | captions, labels, borders | ≥4.5:1 vs bg/surface |
| `accent` | CTAs, active states, badges | ≥3:1 vs surface |
| `accent_fg` | text inside accent | ≥4.5:1 vs accent |
| `border` | dividers, input outlines | ≥1.5–3:1 vs surface |

**60-30-10 spatial budget** — verified across all four SOPs:
`bg`+`surface` ≈ 60%, `ink`+structural ≈ 30%, `accent` ≈ ≤10%.
Accent isolation is the conversion rule: accent means "interactive";
decorative use dilutes it. **No ghost buttons for primary CTAs**
(solid accent fill only). One CTA hue per section — no competing
accent-coloured elements in the same viewport block.

### C.2 Temperature — from brief to hue

Brand attributes map to a temperature bucket; the bucket sets the
canvas + hue family. `direction.temperature` in DESIGN-PLAN is this
decision made explicit.

| Bucket | Brand keywords | Hue family | `bg` undertone |
|---|---|---|---|
| **Warm** | artisanal, culinary, community, energetic, human | red/orange/amber 15–65°, warm neutrals | warm off-white/cream (H 30–45°, S 4–12%) — never stark blue-white |
| **Cool** | corporate, clinical, technical, finance, security | navy/sapphire 200–230°, teal 170–190° | cool off-white (H 200–220°, S 2–8%) |
| **Neutral/achromatic** | luxury, editorial, minimalist, premium | charcoal/white + one selective accent | pure white or deep charcoal |
| **Hybrid** | disruptive, playful, youth, high-conversion | cool base + warm accent | cool base, accent does the contrast |

Tie-break (SOP rule): cool canvas + warm accent.

**Psychological attribute map** (brief word → hue family):
health/trust→blue 190–220°; energy/sun→amber 45–55°;
warmth/passion→red/terracotta 0–25°; luxury→black+gold 40–50°+dark;
security→slate/ochre; visionary→cool grey+white; youth→spliced
high-sat. **Palette splicing:** primary attribute supplies `bg`/
`surface` family; secondary supplies the `accent` family.

### C.3 Neutral construction — chromatic tinting

Never dead greys (`#888888`) or pure black (`#000000`). All neutrals
are tinted with the primary hue `H_brand`:

| Token | HSL formula (light) |
|---|---|
| `bg` | `hsl(H_brand, 2–4%, 98–99%)` |
| `surface` | `hsl(H_brand, 3–6%, 94–96%)` |
| `surface_elevated` | `hsl(H_brand, 6%, 90–93%)` |
| `border` | `hsl(H_brand, 4–8%, 80–88%)` |
| `ink_muted` | `hsl(H_brand, 8–12%, 35–45%)` |
| `ink` | `hsl(H_brand, 10–15%, 10–15%)` — never `#000000` |

Saturation ceiling for surfaces: 2–6% (high-end). Over-saturated
warm primaries (`#FF0000` + white + yellow) = "fast-food language" —
desaturate to terracotta/rust/ochre (H 15–25°, S 65–80%, L 40–50%).

### C.4 Accent — geometric harmony, never guessed

`H_accent` is derived from `H_brand` by one closed formula:

| Harmony | Formula | Use when |
|---|---|---|
| **Complementary** | `H_acc = (H_brand + 180°) mod 360` | max contrast, conversion-first CTAs |
| **Split-complementary** | `±150°/210°` | dual accents (primary + badge) without harsh clash |
| **Analogous** | `±30–45°` | serene/editorial; CTA contrast then comes from scale+fill, not hue |
| **Triadic** | `+120°/+240°` | multi-module SaaS needing distinct functional codes |

**`accent_fg` luminance rule** (the white-on-yellow bug): if
`L(accent) > 60%` → `accent_fg = dark ink`; if `L(accent) ≤ 45%` →
`accent_fg = near-white`. Never default to white.

**Interactive states** — accent is never static:
`accent_hover` = light −10% (dark +12%); `accent_active` = L ±15%,
S +5%.

### C.5 Dark surfaces — lightness inversion, never pure black

Dark `bg` ≠ `#000000`. Invert the lightness ramp, keep the tint:

| Token | Dark formula |
|---|---|
| `bg` | `hsl(H_brand, 8–14%, 7–10%)` — deep chromatic charcoal |
| `surface` | `hsl(H_brand, 8–12%, 11–18%)` — *lighter* than bg (elevation = +L) |
| `surface_elevated` | `hsl(H_brand, 8%, 20–24%)` |
| `ink` | `hsl(H_brand, 4%, 92–95%)` — off-white, no glare |
| `ink_muted` | `hsl(H_brand, 6%, 65–70%)` |
| `accent` | same hue, L +5–10%, S −10–20% (dark-mode halation) |

### C.6 The derivation workflow (fill order for `system.color`)

1. Parse brief attributes → temperature bucket (C.2) → `H_brand`.
2. Tint neutrals N1–N5 at 2–6% S (C.3).
3. Derive `H_accent` by harmony formula (C.4) + `accent_fg` by
   luminance rule.
4. If dark surfaces needed → inversion ramp (C.5).
5. Grayscale value audit: convert to greyscale; `bg`/`surface`/`ink`/
   `ink_muted`/`accent` must read as 5 distinct value steps.
6. WCAG lint every pair against the C.1 floors.

### C.7 Colour QA — mechanical checklist

- [ ] Every element bound to a role token; no literal hex outside
  TOKENS.json
- [ ] `bg`/`surface` chromatic-tinted (S 2–6%), never `#FFF`/dead grey
- [ ] `ink` ≥7:1 vs `bg` and `surface`; `ink_muted` ≥4.5:1
- [ ] `accent` derived by harmony formula (not guessed); ≥3:1 vs surface
- [ ] `accent_fg` set by luminance rule (dark ink if L>60%)
- [ ] Accent ≤10% viewport area; CTA + motif only; no ghost buttons
- [ ] Dark surfaces: no `#000000`; elevation = progressive +L
- [ ] One hue per CTA class; hover/active states derived
- [ ] Grayscale proof: 5 distinct value steps visible

## Enforcement

| Rule | Mode | Check / rubric | Threshold that FAILs | Wave |
|---|---|---|---|---|
| C.1 | script | `check_contrast` | 6-role map bound; ink≥7:1 bg/surface | w3 |
| C.2 | script | `check_direction_axes` | temperature ∈ {warm,cool,neutral} | w2 |
| C.3 | reviewer | `neutral-tint` | neutrals chromatic 2–6% S | w8 |
| C.4 | reviewer | `accent-harmony` | accent by harmony or extracted, logged | w8 |
| C.5 | script | `check_contrast` | inverse/dark ≠ #000 — tinted charcoal | w3 |
| C.6 | reviewer | `derivation-order` | fill order followed, provenance tags | w8 |
| C.7 | script | `check_contrast` | ink≥7:1, accent_fg≥4.5:1, ink_muted≥4.5:1, accent ≤10% | w3 |

## Links

- C.1 → S.7, V.4 (roles ↔ elevation ↔ scrims)
- C.7 → R.6 (contrast floors ↔ touch targets)
