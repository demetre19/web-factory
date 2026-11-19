---
id: pattern-ecommerce-checkout-form-form-panel
type: pattern
site_types: [ecommerce]
page_types: [checkout]
section_type: form
speech_acts: [act]
composition: form-panel
prevalence: 0.647
n: 17
evidence:
  - https://mobbin.com/sites/sections/61123492-6bf0-449e-9660-9a0b11b64af5?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/6b8b2d14-cb78-4b4a-a112-c18f0c3d682f?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/34ae7183-8cf1-49c5-9767-f6e84613de0e?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/818d952c-93a7-434c-84cf-d93a37d1f497?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/24cff7ab-4f7b-47b9-b2d2-83b0b78ca536?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/253cb350-294b-4786-b962-6fdecfaa8f9b?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/41ab55e0-abb5-4408-9553-4dcba35b549d?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/0b23f185-68ae-4cbb-accf-235021186e71?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/ea35cd15-5786-4ffb-80ae-19d1204b1b79?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/6bc43721-8ad8-4d11-b8d3-d4e62fb3479f?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
implies_rules: [C.1, C.6, L.1, L.10, L.5, V.1, V.3]
enforced_by: [check_contrast, check_rhythm, check_section_enums, check_segment_media, check_wireframe_lock]
consumes: [gene-layout-archetype, gene-image-led-ratio, gene-surface-rhythm]
used_in: [w4, w5]
genotype:
  layout-archetype: split-form
  image-led-ratio: text-led
  surface-rhythm: one-contrast-moment
links:
  index: patterns-index
  composition: section-catalog#form-panel
  used_in: [w4, w5]
---

# pattern-ecommerce-checkout-form-form-panel

Split the block into a form and its supporting copy, form on the dominant side. On ecommerce form sections built for shoppers deciding whether this product is right, hold imagery at `text-led`. This signature appears in 65% of 17 annotated screens (layout-archetype, image-led-ratio, surface-rhythm), so it is the default, not a variation: select it unless the brief gives a named reason to deviate, and log that reason (P.8).

## Key measurements

| Measure | Median |
|---|---|
| `median_whitespace_share` | 0.705 |
| `median_media_ratio` | 0 |
| `median_columns` | 2 |

## Evidence

17 annotated screens; 10 Mobbin citations in the frontmatter.
