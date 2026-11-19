---
id: pattern-ecommerce-product-trust-badges-badge-center
type: pattern
site_types: [ecommerce]
page_types: [product]
section_type: trust-badges
speech_acts: [proof]
composition: badge-center
prevalence: 0.708
n: 24
evidence:
  - https://mobbin.com/sites/sections/8f1b9225-9ca2-422d-8d81-18c824da5ad7?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/45f1e4d1-c686-4b34-bd62-07cba90dd057?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/1dcec600-bc14-4b26-8e7a-47220d9d7a7d?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/95b62733-437f-41e6-8455-9c91a4800117?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/fb0f207b-df5c-4f47-aff9-76bbdf9784c2?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/eaa84760-9e4c-47bd-affb-cb99e587c799?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/9368f2c5-363d-4174-baa1-90a21c390d34?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/5464f0de-48ee-44a0-b77e-8b49a1eb7780?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/d914c515-30b4-477b-85c4-92cb037d7875?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/ab1bb0e3-0492-4e3c-ba45-4691d7e1bf03?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
implies_rules: [C.1, C.6, L.1, L.10, L.5, V.1, V.3]
enforced_by: [check_contrast, check_rhythm, check_section_enums, check_segment_media, check_wireframe_lock]
consumes: [gene-layout-archetype, gene-image-led-ratio, gene-surface-rhythm]
used_in: [w4, w5]
genotype:
  layout-archetype: horizontal-band
  image-led-ratio: text-led
  surface-rhythm: one-contrast-moment
links:
  index: patterns-index
  composition: section-catalog#badge-center
  used_in: [w4, w5]
---

# pattern-ecommerce-product-trust-badges-badge-center

Compress the proof into one tight horizontal band, not a full section. On ecommerce trust-badges sections built for shoppers deciding whether this product is right, hold imagery at `text-led`. This signature appears in 71% of 24 annotated screens (layout-archetype, image-led-ratio, surface-rhythm), so it is the default, not a variation: select it unless the brief gives a named reason to deviate, and log that reason (P.8).

## Key measurements

| Measure | Median |
|---|---|
| `median_whitespace_share` | 0.772 |
| `median_media_ratio` | 0.0 |
| `median_columns` | 3.5 |

## Evidence

24 annotated screens; 10 Mobbin citations in the frontmatter.
