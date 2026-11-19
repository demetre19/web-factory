---
id: BASE.ACSS
type: baseline
links:
  used_in: [w1, w3, w4, w5, w6, w7]
  depends_on: [knobs, dna-map]
---
# Automatic CSS (ACSS) fluid defaults — the DNA starting point

Operator rule: ACSS's fluid defaults are the SAFE BASELINE for spacing and
type in every DNA v0 (section padding, component gaps, gutters, text and
heading scale). Variants move knobs AWAY from this baseline; nothing starts
from hand-picked px values. Source: live ACSS install (opaldiamondfactory,
`wp-content/uploads/automatic-css/*.css`), extracted verbatim.

Units: ACSS sets `--root-font-size: 62.5%` → **1rem = 10px**. When used on a
page with a 100% root (1rem = 16px), divide every rem by 1.6 or set
`html{font-size:62.5%}` and body text via `--text-m`.

## Section spacing (top/bottom padding of sections)

| Token | Value |
|---|---|
| `--section-space-xs` | clamp(4.052rem, 1.3347vw + 3.6249rem, 5.333rem) |
| `--section-space-s` | clamp(5.4014rem, 2.7069vw + 4.5351rem, 8rem) |
| `--section-space-m` (default `--section-padding-block`) | clamp(7.2rem, 5vw + 5.6rem, 12rem) |
| `--section-space-l` | clamp(9.5976rem, 8.7525vw + 6.7968rem, 18rem) |
| `--section-space-xl` | clamp(12.7936rem, 14.7983vw + 8.0581rem, 27rem) |
| `--section-space-xxl` | clamp(17.0539rem, 24.4231vw + 9.2385rem, 40.5rem) |

## Component spacing

| Token | Value |
|---|---|
| `--space-xs` | clamp(1.3333rem, -0.018vw + 1.3565rem, 1.3507rem) |
| `--space-s` | clamp(1.8005rem, 0.2079vw + 1.7339rem, 2rem) |
| `--space-m` | clamp(2.4rem, 0.625vw + 2.2rem, 3rem) |
| `--space-l` | clamp(3.1992rem, 1.355vw + 2.7656rem, 4.5rem) |
| `--space-xl` | clamp(4.2645rem, 2.589vw + 3.436rem, 6.75rem) |
| `--space-xxl` | clamp(5.6846rem, 4.6254vw + 4.2045rem, 10.125rem) |
| `--content-gap` | var(--space-m) |
| `--grid-gap` | var(--space-m) |
| `--container-gap` | var(--space-xl) |
| `--gutter` (side padding) | clamp(1.6rem, 6.6667vw − 0.5333rem, 8rem) |
| `--content-width` | 128rem (prose: 60ch) |
| `--content-width-safe` | min(var(--content-width), calc(100% − var(--gutter) * 2)) |

## Type scale

| Token | Value |
|---|---|
| `--h1` | clamp(2.9197rem, 4.9008vw + 1.3514rem, 7.6244rem) |
| `--h2` | clamp(2.3893rem, 2.4198vw + 1.6149rem, 4.7123rem) |
| `--h3` | clamp(1.9552rem, 0.9971vw + 1.6361rem, 2.9124rem) |
| `--h4` | clamp(1.6rem, 0.2083vw + 1.5333rem, 1.8rem) |
| `--h5` | 1.2rem · `--h6` 1.1rem |
| `--text-l` | clamp(1.92rem, 1.0338vw + 1.5892rem, 2.9124rem) · lh 1.5 |
| `--text-m` (body) | clamp(1.6rem, 0.2083vw + 1.5333rem, 1.8rem) |
| `--text-s` | 1.2rem · lh 1.5 |
| headings | line-height 1.2, `text-wrap: balance`, `--heading-spacing: 0.7em` |

## Radius

`--radius-xs` 0.444rem · `--radius-s` 0.667rem · `--radius-m` 1rem · `--radius-l` 1.5rem ·
`--radius-xl` 2.25rem · `--radius-xxl` 3.375rem · `--radius-circle` 50vw.

## How the machinery uses it

- DNA v0 `knobs` default to these tokens (spacing tiers map `compact→section-space-s`,
  `regular→section-space-m`, `spacious→section-space-l`; component gaps → `space-*`).
- Variants change knobs by stepping tiers (e.g. regular→l) — never by inventing px.
- Pickers and final Astro build emit these as CSS custom properties.
