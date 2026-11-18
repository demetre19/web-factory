# DNA map — the single source of coherence

`hash: dc49abea952efdff` · version `1` · site `fixture` · vertical `profile-services`

Every wave, section, variant and review reads this file first. Nothing defines a design value that is not traceable here (LAW.DNA).

## Genotype

- `columns` = `3`
- `cta-rank` = `hero`
- `cta-restraint` = `single-primary`
- `density-tier` = `regular`
- `disclosure-tier` = `open`
- `display-face` = `sans`
- `form-presence` = `inline`
- `gallery-mode` = `grid`
- `heading-form` = `claim`
- `image-led-ratio` = `balanced`
- `layout-archetype` = `split-media`
- `media-treatment` = `photo`
- `motion-tier` = `subtle`
- `nav-pattern` = `bar-cta`
- `page-macro-structure` = `promise-proof-how-act`
- `proof-type` = `logos`
- `radius-personality` = `soft`
- `surface-rhythm` = `one-contrast-moment`
- `type-contrast` = `medium`
- `whitespace-band` = `medium`

## System knobs

| Knob | Value | Token | Tier | Provenance |
|---|---|---|---|---|
| `color.accent_usage` | cta+motif | `color.accent_usage` | structural | {'tag': 'chosen', 'reason': 'fixture baseline'} |
| `color.neutral_tint` | 0.03 | `color.neutral_tint` | stylistic | {'tag': 'chosen', 'reason': 'fixture baseline'} |
| `color.surface_contrast` | 0.05 | `color.surface_contrast` | stylistic | {'tag': 'chosen', 'reason': 'fixture baseline'} |
| `elevation.level` | 1 | `elevation.level` | stylistic | {'tag': 'chosen', 'reason': 'fixture baseline'} |
| `grid.gutter` | 24 | `grid.gutter_px` | structural | {'tag': 'snapped', 'patterns': ['pattern-nav-bar'], 'n': 21} |
| `image.treatment` | natural | `image.treatment` | stylistic | {'tag': 'chosen', 'reason': 'fixture baseline'} |
| `motion.level` | subtle | `motion.level` | stylistic | {'tag': 'chosen', 'reason': 'fixture baseline'} |
| `radius.personality` | p3 | `radius.personality` | stylistic | {'tag': 'chosen', 'reason': 'fixture baseline'} |
| `space.density_scale` | 1.0 | `space.density_scale` | stylistic | {'tag': 'chosen', 'reason': 'fixture baseline'} |
| `space.section_py` | {"compact": 48, "regular": 72, "spacious": 112} | `space.section_py` | structural | {'tag': 'snapped', 'patterns': ['pattern-cards-n'], 'n': 18} |
| `type.base` | 16 | `type.base_px` | stylistic | {'tag': 'snapped', 'patterns': ['pattern-hero-split'], 'n': 24} |
| `type.display_weight` | 700 | `type.display_weight` | stylistic | {'tag': 'chosen', 'reason': 'fixture baseline'} |
| `type.ratio` | 1.25 | `type.ratio` | stylistic | {'tag': 'snapped', 'patterns': ['pattern-hero-split'], 'n': 24} |
| `type.tracking_display` | -0.02 | `type.tracking_display` | stylistic | {'tag': 'chosen', 'reason': 'fixture baseline'} |

## Rhythm plan

| Section | Surface | Density |
|---|---|---|
| `nav` | base | compact |
| `hero` | base | spacious |
| `macro` | muted | regular |
| `end-act` | inverse | spacious |
| `footer` | base | compact |

## Modes (both ship — C.5)

| Role | Light | Dark |
|---|---|---|
| `accent` | `#0055AA` | `#4C93D6` |
| `accent_foreground` | `#FFFFFF` | `#0E1416` |
| `bg` | `#FDFCFA` | `#14181A` |
| `border` | `#D8D3CC` | `#2C3437` |
| `ink` | `#221F1B` | `#EDEBE7` |
| `ink_muted` | `#6F665D` | `#A8A49D` |
| `inverse` | `#1D2325` | `#F4F2EE` |
| `surface` | `#F1EFEC` | `#1C2224` |
| `surface_elevated` | `#EBE7E1` | `#232A2C` |

## Variants (baseline + deltas)

- `v1` · best-predicted · baseline · sheet {'light': True, 'dark': True} · score 84
- `v2` · typography-led · type.display_weight 700→800, type.ratio 1.25→1.3625 · sheet {'light': True, 'dark': True} · score 81
- `v3` · wildcard · motion.level subtle→playful, radius.personality p3→p4 · sheet {'light': True, 'dark': True} · score 78
