---
id: rules-S
type: rules
links:
  used_in: [w2, w3, w8]
---

## S. Shape — radius, borders & separation

Source: operator shape SOP
(`research/sop-sources/SOP-RADIUS-SHAPE.md`).

Corners are a declared decision, not a browser default. A site picks
exactly one shape personality, one radius-token column, and one
separation strategy per layout block — anything outside the closed
sets below is a defect.

### S.1 The four personalities — closed set

| ID | Personality | Radius range | Brand attributes |
|---|---|---|---|
| P1 | Sharp / Geometric | **0–2px** | technical, dense, editorial, luxury |
| P2 | Subtle / Professional | **4–8px** | corporate, SaaS — the enterprise baseline |
| P3 | Friendly / Soft | **12–16px** | warm, human, B2C |
| P4 | Playful / Pill | **≥20px** + full-round | youthful, social |

**Single Radius System:** the brief's brand attributes pick exactly
ONE personality; mixing personalities on one site is banned. The pick
serializes to `direction.shape` in DESIGN-PLAN (`p1 | p2 | p3 | p4`) —
a forced direction axis alongside `temperature`/`density`/`finish`/
`type_contrast`. P2 is the default absent a signal (the enterprise
baseline); P4 requires an explicit youthful/social brief attribute —
the same gate `direction.motion: playful` passes in M.1.

### S.2 The radius token scale — closed set

Six tokens; the pixel value of each is fixed by the chosen
personality column:

| Token | P1 | P2 | P3 | P4 |
|---|---|---|---|---|
| `radius-none` | 0 | 0 | 0 | 0 |
| `radius-sm` | 0 | 2 | 4 | 6 |
| `radius-md` | 1 | 4 | 8 | 12 |
| `radius-lg` | 2 | 8 | 12 | 16 |
| `radius-xl` | 2 | 12 | 16 | 24 |
| `radius-full` | 9999px | 9999px | 9999px | 9999px |

A hardcoded px radius is a refuse — same contract as a literal hex
outside TOKENS.json (C.1). The chosen column lands in TOKENS.json;
markup names tokens, never numbers.

### S.3 Component → token assignment

| Component class | Token |
|---|---|
| badges, tags | `radius-sm` |
| buttons, inputs, selects | `radius-md` |
| cards, dropdowns, popovers | `radius-lg` |
| modals, drawers | `radius-xl` |
| avatars, dots, pills | `radius-full` |

**Radius hierarchy:** `R(control) ≤ R(container) ≤ R(overlay)` — a
button inside a card inside a modal steps up, never down. An inner
radius never exceeds its parent's; the sole exception is a declared
`radius-full` (the avatar stays circular inside the square P1 card).

### S.4 Concentric nesting — the formula

`R_inner = R_outer − P_padding` — nested rounding is arithmetic, not
eyeballing.

- **Zero-collapse:** if `P_padding ≥ R_outer` → `R_inner = 0`. A
  child that can't keep the curve goes square; radius never goes
  negative and is never clamped to a "close enough" value.
- **Shared-edge collapse:** in merged control groups (button groups,
  segmented controls, input+addon) the shared edges collapse to 0 —
  two radii meeting on a merged edge is a double-seam defect.
- **Flush-media inheritance:** edge-to-edge media inside a container
  (the card-top image, the `media` composition's panel) inherits the
  parent's outer radius on the edges it shares with the container, 0
  on the interior edge.
- **No mixed-radius sections:** a grid never combines sharp and soft
  cards — the S.1 ban applied at block level; one token per repeated
  component, everywhere it recurs.

### S.5 Border widths & separation

**Border widths — closed set `{0, 1px, 2px}`:**

- `1px` = baseline: controls, cards, dividers (the G.4 hairline rule).
- `2px` = focus/active only — never a resting width.
- `0` = flush — a separation strategy, below.
- Sub-pixel / fractional borders banned.

**Border colour:** neutral tokens at rest (`border` default/subtle —
C.1's `border` role, ≥1.5–3:1 vs surface). Accent colour (the C.4
harmony hue) appears on borders only for focus / selected / error /
success states; a resting accent border spends the ≤10% accent budget
(C.1) on chrome.

**Separation strategies — pick exactly ONE per layout block** (one
`pages.<slug>.sections` row):

| Strategy | Means | Legal when |
|---|---|---|
| `border-only` | 1px neutral border | low-contrast canvas (surface ≈ bg) |
| `shadow-only` | elevation shadow, no border | uniform canvas |
| `hybrid` | 1px border + `shadow-xs` | universal default |
| `flush` / tinted | no border or shadow — tinted surface | contrasting canvas (`surface` ≠ `bg`; the `inverse`/`brand`/`media` surfaces carry it) |

No arbitrary mixing of strategies on one page. The strategy is
declared on the section row beside `surface:`/`density:`; which ones
are legal follows the C.1 surface-vs-bg contrast — on a near-equal
canvas `flush` cannot separate, so a border or shadow is required.

### S.6 Secondary shape permissions — by personality

| Shape | P1 | P2 | P3 | P4 |
|---|---|---|---|---|
| Circular avatars | ✓ | ✓ | ✓ | ✓ |
| Square avatars | ✓ | ✓ | banned | banned |
| Pill badges / tags | — | — | permitted | required |
| Pill buttons | — | — | banned | ✓ |
| Decorative arches, organic blobs | banned | banned | banned | ✓ |

P3's pills live on tags/badges only — P3 buttons stay `radius-md`.

### S.7 Elevation ↔ radius coupling

Shadow blur scales with corner radius — soft geometry gets soft
elevation, sharp geometry gets none:

| Level | Shadow token | Blur | Paired radius |
|---|---|---|---|
| E0 | `shadow-none` | 0 | any |
| E1 | `shadow-xs` | 2–4px | `radius-md` |
| E2 | `shadow-md` | 8–12px | `radius-lg` |
| E3 | `shadow-lg` | 16–24px | `radius-xl` |
| E4 | `shadow-xl` | 32–48px | `radius-xl` / `radius-full` |

A deep shadow on a sharp corner is a defect — the same rule as L.8's
"soft shadows, subtle never hard-edge," stated from the shape side.

### S.8 Shape QA — mechanical checklist

Checked at DESIGN-PLAN review and build self-lint:

- [ ] One personality site-wide — `direction.shape` set; no second
  personality's token values present
- [ ] Every radius a member of the S.2 column — zero hardcoded px
- [ ] Concentric math holds: `R_inner = R_outer − P_padding`;
  zero-collapse and shared-edge collapse applied
- [ ] Border widths ∈ {0, 1, 2}px — no sub-pixel widths
- [ ] Resting borders neutral (C.1 `border`); accent borders only on
  focus/selected/error/success
- [ ] One separation strategy per layout block; no strategy mixing on
  a page
- [ ] Hierarchy holds: `R(control) ≤ R(container) ≤ R(overlay)`;
  only `radius-full` exceeds its parent
- [ ] Secondary shapes within S.6 permissions — arches/blobs absent
  unless `direction.shape: p4`
- [ ] Shadow level paired per S.7 — no deep shadow on a sharp corner
- [ ] No emoji glyphs; no rogue controls — every control built from
  the S.3 token classes

---

### S.9 Form states

Every field has a label, a required marker when required, and
helper/error/success state containers — a bare input + button is not
a form.

## Enforcement

Generated from `enforcement.json` (`gate.py enforcement`) — edit the JSON, never this table.

| Rule | Tier | Mode | Check / rubric | FAILs when | Wave |
|---|---|---|---|---|---|
| S.1 | stylistic | script | `check_direction_axes` | shape ∈ p1..p4 | w4 |
| S.2 | stylistic | script | `check_tailwind_derivation` | radius tokens ∈ personality row, compiled to config | w5 |
| S.3 | stylistic | script | `check_measurable` | component→token assignment consistent | w7 |
| S.4 | structural | script | `check_measurable` | child = parent − padding step | w7 |
| S.5 | structural | script | `check_border_widths` | border widths ∈ {0,1px,2px} | w5 |
| S.6 | stylistic | reviewer | `shape-permissions` | secondary shapes per personality | w8 |
| S.7 | stylistic | reviewer | `elevation-radius` | elevation↔radius coupled | w8 |
| S.8 | stylistic | reviewer | `one-personality` | one personality throughout | w8 |
