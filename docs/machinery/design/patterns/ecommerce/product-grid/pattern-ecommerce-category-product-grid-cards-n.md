---
id: pattern-ecommerce-category-product-grid-cards-n
type: pattern
site_types: [ecommerce]
page_types: [category]
section_type: product-grid
speech_acts: [detail]
composition: cards-n
prevalence: 0.6
n: 30
evidence:
  - https://mobbin.com/sites/sections/663b377d-7e4e-4515-ba06-2cc80fe557cc?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/2d955e1e-8a41-420f-9443-b873ae395af2?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/b0e33659-5f64-4881-9517-8a063993ee80?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/2c42876f-e42f-49dc-ba18-b6acc4bdf204?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/d65f6410-6acb-4b56-b1d5-6178382f9fa9?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/355f80cd-92e6-4c1e-aa25-c934999233de?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/791c6c1a-758c-4c97-aaa0-b90bfdaa1eb0?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/e16d6504-7ee9-448c-a243-fb3f24238cfc?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/c39270b0-f69d-4ab5-9991-b3669ee6ded0?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/0259257f-53a8-4c39-8a4f-0aa3de494929?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
implies_rules: [L.1, L.10, L.5, W.2, W.3, W.5]
enforced_by: [check_emphasis, check_section_enums, check_speech_acts, check_wireframe_lock, check_wireframe_tags]
used_in: [w4, w5]
genotype:
  layout-archetype: card-grid-4
  cta-restraint: single-primary
  proof-type: none
links:
  index: patterns-index
  composition: section-catalog#cards-n
  used_in: [w4, w5]
---

# pattern-ecommerce-category-product-grid-cards-n

Lay the content as a four-up card row. On ecommerce product-grid sections built for shoppers deciding whether this product is right, hold CTA restraint `single-primary`. This signature appears in 60% of 30 annotated screens (layout-archetype, cta-restraint, proof-type), so it is the default, not a variation: select it unless the brief gives a named reason to deviate, and log that reason (P.8).

## Key measurements

| Measure | Median |
|---|---|
| `median_whitespace_share` | 0.662 |
| `median_media_ratio` | 0.328 |
| `median_columns` | 4.0 |

## Evidence

30 annotated screens; 10 Mobbin citations in the frontmatter.
