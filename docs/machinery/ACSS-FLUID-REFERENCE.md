# How Automatic.css makes every size fluid (reference for clamp.py)

Sources: ACSS 3.0.0-beta-2.2 source (`/Users/apple/Documents/UNCLUTTER NEW/automatic.css-3.0.0-beta-2.2.zip` → `assets/scss/helpers/_functions.scss`, `modules/text/_text-vars.scss`, `dashboard/_spacing-vars.scss`), live output `https://whistlecleanaustralia.com.au/wp-content/uploads/automatic-css/automatic.css` and `https://maxi.devsite.biz/...` (fetched 2026-11-20), docs https://docs.automaticcss.com/typography/fluid-text and /spacing/standard-spacing-setup.

## 1. One function: `fluidClamp(min, max)`
```scss
$slope: ($max - $min) / ($vp-max - $vp-min);          // in rem per rem
$intercept: ($min - $slope * $vp-min) * 1rem;
@return clamp(#{$min}rem, calc(#{$slope * 100}vw + #{$intercept}), #{$max}rem);
```
- `min` = exact value at the minimum site width (mobile), `max` = exact value at content width (desktop) and beyond.
- Viewport range on both live sites: 32rem → 128rem at 62.5% root = **320px → 1280px** (gutter `calc(2.4rem + (0.6 * ((100vw - 32rem) / 96)))`).
- Small sizes use `fluidClampStop(stop, min, max)` = `max(stop, clamp(...))` so XS/S never fall below a floor.

## 2. Two scales: desktop ratio and mobile ratio
Each size is computed TWICE from the same base: desktop value with the desktop ratio, mobile value with the (tighter) mobile ratio; then one clamp joins them.
```
text-m   : min = base-mob            max = base-desk
text-l   : min = base-mob * mob^1    max = base-desk * desk^1
text-xl  : min = base-mob * mob^2    max = base-desk * desk^2
text-xxl : min = base-mob * mob^3    max = base-desk * desk^3
text-s   : min = base-mob / mob      max = base-desk / desk     (floor: text-s-stop)
text-xs  : min = base-mob / mob^2    max = base-desk / desk^2   (floor: text-xs-stop)
h4 = heading base; h3, h2, h1 = base * scale^1..3; h5, h6 = base / scale^1..2 (with stops)
```
Defaults: base-text-desk 18px, base-text-mob 16px, text-scale 1.333, mob-text-scale 1.2, heading scale = text scale unless set.

## 3. Spacing uses the same two-ratio math
```
space-m  : min = base-space-min (24px)   max = base-space (30px)
space-l/xl/xxl : min *= mob-space-scale (1.3) each step;  max *= space-scale (1.5) each step
space-s/xs     : min /= space-scale;  max /= space-scale
section-space-N: min = space-N-min * mob-section-adjust (3);  max = space-N-max * section-adjust (4)
gutter (section-padding-x): fluidClamp(24px, 30px)
grid-gap / content-gap / container-gap = var(--space-m / --space-m / --space-xl)   (aliases, so also fluid)
btn padding: 0.75em / 1.5em (em, so it follows the fluid font size)
```

## 4. Whistle Clean's own live ACSS settings (discovered, = operator's existing choice)
| token | min @320 | max @1280 | implied setting |
|---|---|---|---|
| text-m | 16px | 18px | base mob 16 / desk 18 |
| text-l | 19.2 | 23.99 | text ratio mob 1.2 / desk 1.333 |
| h4 | 16 | 18 | heading base = text base |
| h3 | 19.2 | 27 | heading ratio mob 1.2 / desk **1.5** |
| h2 | 23.04 | 40.5 | |
| h1 | 27.65 | 60.75 | |
| h5 / h6 | 12 / 11 flat | | stops |
| space-m | 24 | 30 | base space |
| space-l | 31.99 | 45 | space ratio mob 1.333 / desk 1.5 |
| section-space-m | 72 | 120 | section adjust mob 3 / desk 4 |
| gutter | 16 | 80 | custom |
| radius | 10px | | fixed |

## 5. Rules for our machinery
1. `clamp.py` implements exactly `fluidClamp` and `fluidClampStop` (vw units, rem output, configurable root 100%/62.5%, vp-min 320, vp-max = content width).
2. DNA carries `type.base_mob`, `type.base_desk`, `type.ratio_mob`, `type.ratio_desk`, `heading.ratio_mob/desk`, `space.base_mob/desk`, `space.ratio_mob/desk`, `section.adjust_mob/desk`, `vp.min`, `vp.max`, stops. When the live site runs ACSS, discovery EXTRACTS these from its `automatic.css` (provenance `extracted`); otherwise profile defaults (`inferred`).
3. Every font-size, section padding, gap, gutter, content spacing token is a `fluidClamp(min, max)` output; components only use `var(--…)`; button padding in em.
