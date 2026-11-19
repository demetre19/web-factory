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

## Colour shade scales (`--<colour>-*`)

Each colour family carries an 8-rung shade ladder —
`ultra-light, light, semi-light, semi-dark, dark, ultra-dark, hover`
— authored in **oklch()** (the gate parses oklch tokens; see
`patterns/data/acss-tokens.json` for all 74 verbatim values):

| Family | Rung examples |
|---|---|
| `--primary-*` | `oklch(0.615 0.091 27.9)` → hover `oklch(0.708 …)` → ultra-dark `oklch(0.264 …)` |
| `--secondary-*`, `--neutral-*`, `--base-*` | same 8 rungs (neutral shades tint the brand hue) |
| `--tertiary-*`, `--success-*`, `--warning-*`, `--danger-*`, `--info-*` | same 8 rungs, semantic |
| surface aliases | `--bg-{light,dark,ultra-light,ultra-dark}`, `--text-{light,dark,*-muted}`, `--border-{dark,light}`, `--divider-{dark,light}`, `--white/--black-trans-20` |

## Buttons (`--btn-*`)

`--btn-padding-block: 0.75em` · `--btn-padding-inline: 1.5em` (**padding
ratio 2:1 — the deviation axis**) · `--btn-border-radius: 0.5rem` ·
`--btn-border-width: 0.25rem` · `--btn-min-width: 14rem` ·
`--btn-line-height: 1` · `--btn-font-weight: 400` ·
`--btn-width: max-content` · `--btn-letter-spacing: 0` ·
`--btn-text-{align:center,transform:none,decoration:none}`.
Size classes: `.btn--{xs,s,m,l,xl,xxl}` rebind
`--btn-font-size: var(--text-{xs,s,m,l,xl,xxl})`.

## Cards (`--card-*`)

`--card-padding: var(--space-m)` · `--card-gap: calc(var(--content-gap)/2)` ·
`--card-radius: var(--radius)` (min 4px) · `--card-text-size: --text-s` ·
`--card-heading-size: --h3` · `--card-background: --neutral-ultra-light` ·
`--card-media-aspect-ratio: 1.333` (object-fit cover) ·
`--card-avatar-{size:140px,aspect-ratio:1}` · icon/link/hover aliases —
34 tokens, verbatim in `acss-tokens.json`.

## Elevation ladder (`--box-shadow-*`, `--drop-shadow-*`, `--text-shadow-*`)

Three-rung ladder — DNA `elevation.level` maps 1:1:

| Rung | Token | Value |
|---|---|---|
| 0 | none | flat |
| 1 | `--box-shadow-1` | `0 1px 2px color-mix(in srgb, black 20%, transparent)` |
| 2 | `--box-shadow-2` | 4-stop ambient+key (0.04→0.10 alpha, −5px spread) |
| 3 | `--box-shadow-3` | 6-stop ambient+key (0.02→0.105 alpha, −5px spread) |

`--drop-shadow-1/2/3` mirror the rungs as filter shadows (15/20/25% alpha);
`--text-shadow-1/2/3` for type (20/30/40%).

## Inner-block width ladder (`--width-*`)

Fractions of `--content-width` — the breakout/breakout-inset rungs:

`--width-10 … --width-90` = `calc(var(--content-width) * 0.1 … 0.9)` ·
`--width-full` = `calc(var(--content-width) * 100%)` · utility classes
`.width--{10…90,full,auto,fit,max,min}`. A block inside a section lands on a
RUNG — arbitrary `max-width` literals between rungs are the deviation.

## Grid helpers (`--grid-*`, `--col-*`)

`--grid-{1..12}` (equal `minmax(0,1fr)` tracks) · `--grid-{1-2,1-3,2-1,2-3,3-1,3-2}` asymmetric ·
`--grid-auto-{2..12}` = `repeat(auto-fit, minmax(min(100%, max(0.7×col, (100%−gaps)/n)),1fr))`
— the canonical auto-fit pattern; `--grid-gap: --space-m` ·
`--auto-grid-aggressiveness: 0.7` · `--col-width-{s,m,l}` 13/25/38rem ·
`--col-rule-width-{s,m,l}` 0.1/0.3/0.5em.

## Chrome (`--header-*`, `--scroll-*`, `--admin-bar-*`, `--sticky-*`)

`--header-height` · `--scroll-margin` ·
`--admin-bar-height: var(--wp-admin--admin-bar--height, 0px)` ·
`--sticky-offset: var(--header-height, var(--sticky-offset-custom,0))` (default 60px) ·
`--offset: calc(var(--scroll-margin) + var(--header-height))`.

## Other vendored families

`--focus-{color:var(--action),width:0.2rem,offset:0.25em}` ·
`--transition{,-duration,-timing,-delay}` = `0.3s ease-in-out 0s` ·
`--icon-{size,padding}-*{xs…xl}` (16–128px ladder) ·
`--divider-*`, `--border-{size,style,width,color-*}` ·
`--blockquote-*` (33 tokens) · `--list-*`/`--nested-list-*` spacing ·
`--{h1..h6}-line-height` + `*-to-*` fluid step-down pairs.

**Not present in this install**: `--input-*` form tokens (fields inherit
global styles + `.btn--*` sizes), standalone aspect-ratio and grid-flow
utilities (aspect is `--card-{media,avatar}-aspect-ratio` only).
Machine-readable full ladder: `patterns/data/acss-tokens.json` (430 tokens).

## How the machinery uses it

- DNA v0 `knobs` default to these tokens (spacing tiers map `compact→section-space-s`,
  `regular→section-space-m`, `spacious→section-space-l`; component gaps → `space-*`).
- `btn.padding_ratio` deviations measure against the 0.75em/1.5em (2:1) baseline.
- `elevation.level` 0–3 selects the `--box-shadow` rung (S.7 couples radius).
- `width.inner_rung` selects the `--width-*` rung; off-rung literal max-widths FAIL.
- Variants change knobs by stepping tiers (e.g. regular→l) — never by inventing px.
- Pickers and final Astro build emit these as CSS custom properties.
