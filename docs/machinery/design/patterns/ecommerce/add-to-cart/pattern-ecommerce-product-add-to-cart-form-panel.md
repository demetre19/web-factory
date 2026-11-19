---
id: pattern-ecommerce-product-add-to-cart-form-panel
type: pattern
site_types: [ecommerce]
page_types: [product]
section_type: add-to-cart
speech_acts: [act]
composition: form-panel
prevalence: 0.6
n: 10
evidence:
  - https://mobbin.com/sites/sections/152dd779-b896-4cca-9992-79b6b6400f06?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/ef57d6d9-24d2-49f4-b140-e07ad349c98c?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/a285bae6-a618-4c98-a95a-d27272eec13b?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/0ac05517-9aa4-4f82-8e96-f2cce86a6f12?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/5f8f8641-9834-40bc-8d42-cc64ec31c599?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/35232830-bc0e-4d5e-9a1a-c2bd87a64ce3?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/89ed61e7-de0b-49f4-ab94-b5a54d43cc7a?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/75c223c4-33e3-465f-bda0-c899a7c1592e?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/624afda0-0098-4e2e-9c95-a12e635a83eb?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/ed0fc4a0-b230-47cd-9e75-2c53223b481c?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
implies_rules: [C.1, C.6, L.1, L.10, L.5, W.2, W.3]
enforced_by: [check_contrast, check_emphasis, check_rhythm, check_section_enums, check_wireframe_lock, check_wireframe_tags]
consumes: [gene-layout-archetype, gene-surface-rhythm, gene-cta-restraint]
used_in: [w4, w5]
genotype:
  layout-archetype: stacked-center
  surface-rhythm: one-contrast-moment
  cta-restraint: single-primary
links:
  index: patterns-index
  composition: section-catalog#form-panel
  used_in: [w4, w5]
---

# pattern-ecommerce-product-add-to-cart-form-panel

Stack the promise as centred text with no media column — reserve this for pages without a strong hero image. On ecommerce add-to-cart sections built for shoppers deciding whether this product is right, hold CTA restraint `single-primary`. This signature appears in 60% of 10 annotated screens (layout-archetype, surface-rhythm, cta-restraint), so it is the default, not a variation: select it unless the brief gives a named reason to deviate, and log that reason (P.8).

## Key measurements

| Measure | Median |
|---|---|
| `median_whitespace_share` | 0.491 |
| `median_media_ratio` | 0.565 |
| `median_columns` | 2.0 |

## Evidence

10 annotated screens; 10 Mobbin citations in the frontmatter.
