---
id: rules-I
type: rules
links:
  used_in: [w3, w6, w8]
---

## I. Icons — the graphic marker system

Source: operator SOP `research/sop-sources/SOP-ICONS.md`. Icons are
atoms (L.10) — closed style, closed size set, one library per site,
semantic color tokens only. An icon outside the sets below is a
defect, same contract as type and colour.

### I.1 Style selection — five closed styles, one family

The closed style set:

| Style | Character | Brand attribute → pick |
|---|---|---|
| **Outline/Stroke** | single-weight strokes on the grid | technical, minimal |
| **Solid/Filled** | filled silhouettes | bold, playful, consumer |
| **Duotone** | two-tone fills (base + accent layer) | premium, editorial |
| **Hand-Drawn** | irregular strokes, human wobble | artisan, creative |
| **3D/Illustrated** | rendered dimensional scenes | hero/feature callouts **≥32px only** — banned in transactional UI |

**Single Icon Family rule:** one library renders 100% of a site's
icons. Mixing libraries (Feather + Material, Lucide + Heroicons) is
forbidden — two stroke philosophies on one page is a defect.

**Outline/solid isolation:** outline and solid variants never sit
side-by-side. One exception — the *active-state toggle*: outline at
rest → solid when selected (nav items, tab bars). Any other
outline+solid adjacency is a mixed-variant defect.

The pick serializes in DESIGN-PLAN as
`system.icons: {family, style, stroke_class}` — closed-set values,
never free text.

### I.2 Stroke math, corner geometry, the grid

**Stroke weight = icon size × 0.0833** (24px icon → 2px stroke).
Three named classes bound to the paired type rank's weight
(`system.type.ranks[].weight`):

| Stroke class | Weight | Pairs with font weights |
|---|---|---|
| light | 1.5px | 300–400 |
| regular (default) | 2px | 400–500 |
| bold | 2.5–3px | 600–700 — also required for 16px micro icons |

**Corner geometry matches the site radius personality (§S.1, the
`direction.shape` pick):** rounded personalities →
`stroke-linecap: round` + `stroke-linejoin: round` + 1.5–2px inner
corner radius; sharp personalities → square caps + miter joins + 0px
inner radius. An icon whose caps contradict the site's declared
personality is a defect.

| Keyline | Bounds |
|---|---|
| Circle | 20px Ø |
| Square | 18×18 |
| Vertical rectangle | 16×20 |
| Horizontal rectangle | 20×16 |

### I.3 Size — the closed set and the line-height rule

Closed size set **{16, 20, 24, 32, 48}** — no others:

| Size | Role |
|---|---|
| 16 | dense UI, table rows |
| 20 | default UI |
| 24 | nav, buttons |
| 32 | section headers |
| 48 | hero, empty states |

**Icon size = the paired text's line-height** — the icon shares the
text's optical band, never a guessed size:

| Text | Line-height | Icon |
|---|---|---|
| caption 16 | 16 | 16 |
| body 16 | 24 | 20–24 |
| heading 24 | 32 | 32 |
| heading 32 | 40 | 48 |

**Optical centering:** asymmetric glyphs nudge inside their box to
read centered — play triangle +1–2px toward its point, chevron +1px
toward its direction, ▼ +1px down. Geometric center ≠ optical
center; ship the optical one.

### I.4 Icon + text pairing

- **Labels are mandatory** in info-dense and transactional UI.
  Icon-only is legal only for the eight universal glyphs (I.6) and
  still requires `aria-label`.
- **Position carries semantics:** icon-left = primary action /
  navigation / entity marker; icon-right = directional / external
  link / disclosure affordance. Icon-above only for mobile
  bottom-nav, collapsed sidebars, and marketing cards — never in
  dense UI.
- **Gap scale** (all members of the G.1 space scale):

  | Icon | Gap |
  |---|---|
  | 16px | 4px |
  | 20px | 8px |
  | 24px | 8–12px |
  | 32px | 12–16px |

- **Alignment:** `display: flex` + `align-items: center` is the
  standard icon+text row. Baseline hacks are a defect.

### I.5 Library governance

Approved libraries (closed set):

| Library | Position |
|---|---|
| **Lucide** | primary — 2px stroke on 24px grid (matches I.2 regular class) |
| **Heroicons** | Tailwind-native; 20/24 in outline + solid |
| **Phosphor** | weight variants incl. duotone — the duotone-style pick |
| **Feather** | legacy minimal |
| **Custom SVG** | proprietary domains / trademarks only |

Rules:

1. **Coverage audit before adoption** — enumerate the site's needed
   glyphs, verify the chosen library covers them.
2. Gaps are filled by **custom glyphs authored to match** the
   library's grid, stroke, and radius (I.2, I.3) — never by adopting
   a second library (I.1 single-family rule).
3. Custom SVG inherits the same lint gates: 24×24 grid, stroke
   class, corner geometry, keylines.

### I.6 Standalone glyphs, literal function, bans

**Eight universal standalone glyphs** — the only icons legal without
a visible label:

`search` `cart` `hamburger` `close` `notifications` `profile`
`settings` `help`

Standalone still requires `aria-label`. Every other icon needs a
visible label or tooltip — icon-only outside the eight is a defect.

- **Literal-function rule:** the glyph depicts its function —
  trash = delete, pencil = edit. Metaphor glyphs (rocket = submit)
  are banned in transactional UI.
- **Decorative-icon ban:** every icon earns a functional role. An
  icon that only decorates is removed, not tolerated. (This is also
  why SECTION-CATALOG bans icon+heading+text card grids as a
  substitute composition.)
- **Emoji ban:** raw unicode emoji is banned in UI — already a
  factory constant (DESIGN-INTAKE "No emoji, ever"; S5 anti-pattern
  lint; tone-profile `emoji: false` on the copy side). This section
  codifies *why*: emoji renders inconsistently across platforms,
  breaks the stroke/radius rules (I.2), and injects screen-reader
  noise. Scope: all icon slots — stars, checks, arrows ship as
  inline SVG paths.

### I.7 Color and interactive states

- **`currentColor` is the default** — the icon inherits its text
  context; hardcoded fills are a defect.
- **Semantic tokens** (closed set): `icon-default`, `icon-muted`,
  `icon-action`, `icon-action-hover`, `icon-on-action`,
  `icon-disabled`, `icon-success`, `icon-warning`, `icon-error`,
  `icon-info`. These bind to the C.1 role tokens — `icon-action`
  resolves to `accent`, `icon-on-action` to `accent_fg` (C.4
  luminance rule), never to raw hex.
- **Interactive states:**

  | State | Rule |
  |---|---|
  | hover | color + background shift (token pair) |
  | active | `scale(.95)`, 0.1s |
  | focus | 2px ring + 2px offset |
  | disabled | opacity .4 |

### I.8 Icon QA — mechanical checklist

Source gate, all ten items mechanically checkable at plan and
build self-lint:

- [ ] Single icon family — 100% one library, no mixed imports (I.1)
- [ ] Style matches brand attribute per the I.1 matrix
- [ ] No mixed variants — outline+solid adjacent only as an
  active-state toggle (I.1)
- [ ] Every icon size ∈ {16, 20, 24, 32, 48} (I.3)
- [ ] Uniform stroke — one stroke class per context, = size × 0.0833
  (I.2)
- [ ] Icon↔text gap ∈ {4, 8, 12, 16} (I.4)
- [ ] Labels present where required — non-universal glyphs carry a
  visible label or tooltip (I.4, I.6)
- [ ] Zero emoji — no raw unicode pictograms anywhere in UI (I.6)
- [ ] Semantic color tokens only — `currentColor` or `icon-*`
  tokens, no literal hex (I.7)
- [ ] A11y — standalone glyphs carry `aria-label`; decorative-free
  markup means labelled or `aria-hidden` (I.6)

---

## Enforcement

| Rule | Mode | Check / rubric | Threshold that FAILs | Wave |
|---|---|---|---|---|
| I.1 | script | `check_system_enums` | family+style ∈ closed set; one family | w3 |
| I.2 | script | `check_icon_discipline` | stroke ∈ {1.5,2,2.5,3}px uniform | w6 |
| I.3 | script | `check_icon_discipline` | sizes ∈ {16,20,24,32,48} | w6 |
| I.4 | reviewer | `icon-text-pairing` | icon+text baseline/leading correct | w8 |
| I.5 | script | `check_icon_discipline` | one library, inline SVG — no icon fonts/img | w6 |
| I.6 | reviewer | `icon-literal` | literal function, bans honoured | w8 |
| I.7 | reviewer | `icon-states` | currentColor, interactive states | w8 |
| I.8 | script | `check_icon_discipline` | labelled where required, zero emoji | w6 |

## Links

- I.3 → R.6 (icon sizes ↔ touch targets)
- I.1 → P.11 (family set ↔ absolute icon rule)
