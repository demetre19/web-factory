---
id: pattern-ecommerce-product-add-to-cart-form-panel
type: pattern
site_types: [ecommerce]
page_types: [product]
section_type: add-to-cart
speech_acts: [act]
composition: form-panel
prevalence: 0.767
n: 30
evidence:
  - https://mobbin.com/sites/sections/152dd779-b896-4cca-9992-79b6b6400f06?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/199ad6b7-94e1-4b9d-9021-4080a5167dd6?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/710c23c3-efd9-4a9b-a1f3-cbdc9543c6a1?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/427c09c6-7619-4f27-849c-9a309bdaeced?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/ef57d6d9-24d2-49f4-b140-e07ad349c98c?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/a285bae6-a618-4c98-a95a-d27272eec13b?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/146941b6-b7d2-45f4-85e7-abda384930a1?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/e5b646a5-adaa-4445-b06f-fc1f3064be4d?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/0ac05517-9aa4-4f82-8e96-f2cce86a6f12?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/79b05c64-d4a6-41f6-bab7-b1b2d78b190e?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
implies_rules: [C.1, C.6, L.1, L.10, L.5, W.2, W.3]
enforced_by: [check_contrast, check_emphasis, check_rhythm, check_section_enums, check_wireframe_lock, check_wireframe_tags]
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

Stack the promise as centred text with no media column — reserve this for pages without a strong hero image. On ecommerce add-to-cart sections built for shoppers deciding whether this product is right, hold CTA restraint `single-primary`. This signature appears in 77% of 30 annotated screens (layout-archetype, surface-rhythm, cta-restraint), so it is the default, not a variation: select it unless the brief gives a named reason to deviate, and log that reason (P.8).

## Key measurements

| Measure | Median |
|---|---|
| `median_whitespace_share` | 0.664 |
| `median_media_ratio` | 0.47 |
| `median_columns` | 2.0 |

## Evidence

30 annotated screens; 10 Mobbin citations in the frontmatter.
