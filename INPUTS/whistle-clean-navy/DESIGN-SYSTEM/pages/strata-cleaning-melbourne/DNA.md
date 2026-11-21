# DNA map — the single source of coherence

`look: e9fdbe44338edd4c` · `structure: 00cdde7335dd5335` · `variants: d6c8023d92cad27e` · version `1` · site `whistle-clean-australia` · vertical `profile-services`

Every wave, section, variant and review reads this file first. Nothing defines a design value that is not traceable here (LAW.DNA).

## Genotype

- `columns` = `2`
- `cta-rank` = `none`
- `cta-restraint` = `single-primary`
- `density-tier` = `regular`
- `disclosure-tier` = `open`
- `display-face` = `sans`
- `form-presence` = `none`
- `gallery-mode` = `single-hero`
- `heading-form` = `claim`
- `image-led-ratio` = `text-led`
- `image-style` = `editorial`
- `layout-archetype` = `stacked-center`
- `media-treatment` = `none`
- `mood-energy` = `calm`
- `mood-register` = `approachable`
- `motion-tier` = `subtle`
- `nav-pattern` = `bar`
- `ornament` = `none`
- `page-macro-structure` = `promise-detail-act`
- `proof-type` = `none`
- `radius-personality` = `soft`
- `seam-shape` = `flat`
- `surface-rhythm` = `one-contrast-moment`
- `trend` = `none`
- `type-contrast` = `medium`
- `whitespace-band` = `airy`

## System knobs

| Knob | Value | Token | Tier | Provenance |
|---|---|---|---|---|
| `btn.padding_ratio` | 2.0 | `btn.padding_ratio` | stylistic | {'tag': 'inferred', 'patterns': ['profile-services'], 'n': 5136} |
| `btn.size` | m | `btn.size` | stylistic | {'tag': 'inferred', 'patterns': ['profile-services'], 'n': 5136} |
| `color.accent_usage` | cta-only | `color.accent_usage` | structural | {'tag': 'inferred', 'patterns': ['profile-services'], 'n': 5136} |
| `color.neutral_tint` | 0.05 | `color.neutral_tint` | stylistic | {'tag': 'inferred', 'patterns': ['profile-services'], 'n': 5136} |
| `color.surface_contrast` | 0.08 | `color.surface_contrast` | stylistic | {'tag': 'inferred', 'patterns': ['profile-services'], 'n': 5136} |
| `elevation.level` | 1 | `elevation.level` | stylistic | {'tag': 'inferred', 'patterns': ['profile-services'], 'n': 5136} |
| `grid.gutter` | space-l | `grid.gutter` | structural | {'tag': 'inferred', 'patterns': ['profile-services'], 'n': 5136} |
| `image.treatment` | editorial-crop | `image.treatment` | stylistic | {'tag': 'inferred', 'patterns': ['profile-services'], 'n': 5136} |
| `motion.engine` | css | `motion.engine` | structural | {'tag': 'inferred', 'patterns': ['profile-services'], 'n': 5136} |
| `motion.level` | subtle | `motion.level` | stylistic | {'tag': 'inferred', 'patterns': ['profile-services'], 'n': 5136} |
| `radius.personality` | 10px | `radius.personality` | stylistic | {'tag': 'extracted', 'live_px': 10.0, 'source': 'DISCOVERY live.acss --radius 1rem @ root 62.5% = 10px; kept exact — U.10 never snaps a live radius to the p1–p4 vocabulary'} |
| `space.density_scale` | space-m | `space.density_step` | stylistic | {'tag': 'inferred', 'patterns': ['profile-services'], 'n': 5136} |
| `space.section_py` | {"compact": "section-space-s", "regular": "section-space-m", "spacious": "section-space-l"} | `space.section_py` | structural | {'tag': 'inferred', 'patterns': ['profile-services'], 'n': 5136} |
| `type.base` | 17 | `type.base_px` | stylistic | {'tag': 'inferred', 'patterns': ['profile-services'], 'n': 5136} |
| `type.display_weight` | 700 | `type.display_weight` | stylistic | {'tag': 'chosen', 'source': 'profile 600 snapped to 700: Satoshi ships [300, 400, 500, 700, 900]'} |
| `type.ratio` | 1.25 | `type.ratio` | stylistic | {'tag': 'inferred', 'patterns': ['profile-services'], 'n': 5136} |
| `type.tracking_display` | -0.005 | `type.tracking_display` | stylistic | {'tag': 'inferred', 'patterns': ['profile-services'], 'n': 5136} |
| `width.inner_rung` | 60 | `width.inner_rung` | structural | {'tag': 'inferred', 'patterns': ['profile-services'], 'n': 5136} |

## Rhythm plan

| Section | Surface | Density |
|---|---|---|
| `nav` | base | compact |
| `hero` | base | regular |
| `definition` | muted | regular |
| `scope` | base | regular |
| `process` | muted | regular |
| `reporting` | base | regular |
| `pricing` | muted | compact |
| `frequency` | base | regular |
| `siblings` | muted | regular |
| `coverage` | base | regular |
| `faq-no-link-before-its-concept-defined` | muted | regular |
| `end-act` | brand | spacious |
| `footer` | base | compact |

## Modes (both ship — C.5)

| Role | Light | Dark |
|---|---|---|
| `accent` | `#166F64` | `#00B488` |
| `accent_foreground` | `#FFFFFF` | `#14181A` |
| `bg` | `#FFFFFF` | `#14181A` |
| `border` | `#D6D9DB` | `#2C3437` |
| `ink` | `#273B37` | `#EDEBE7` |
| `ink_muted` | `#556E6A` | `#A8A49D` |
| `inverse` | `#1F2E2C` | `#F4F2EE` |
| `surface` | `#F0F3F6` | `#1C2224` |
| `surface_elevated` | `#E9EBEE` | `#232A2C` |

## Variants (baseline + deltas)

- `v1` · best-predicted · baseline · sheet {'light': True, 'dark': True} · score 90
- `v2` · typography-led · type.display_weight 700→800, type.ratio 1.25→1.3125, type.tracking_display -0.005→-0.015 · sheet {'light': True, 'dark': True} · score 81
- `v3` · rhythm-led · color.neutral_tint 0.05→0.08, elevation.level 1→2, space.density_scale space-m→space-l · sheet {'light': True, 'dark': True} · score 81
