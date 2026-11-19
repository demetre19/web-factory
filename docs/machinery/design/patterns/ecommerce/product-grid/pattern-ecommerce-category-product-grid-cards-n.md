---
id: pattern-ecommerce-category-product-grid-cards-n
type: pattern
site_types: [ecommerce]
page_types: [category]
section_type: product-grid
speech_acts: [detail]
composition: cards-n
prevalence: 0.6
n: 15
evidence:
  - https://mobbin.com/sites/sections/663b377d-7e4e-4515-ba06-2cc80fe557cc?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/2d955e1e-8a41-420f-9443-b873ae395af2?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/b0e33659-5f64-4881-9517-8a063993ee80?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/d65f6410-6acb-4b56-b1d5-6178382f9fa9?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/e16d6504-7ee9-448c-a243-fb3f24238cfc?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/da619de2-60ed-4251-b81e-1914a5f2c7c0?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/15dd1e4f-b78a-462e-b314-ba3a9fd949a6?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/f30c6ed8-3388-4e8a-8273-bc4b900c018d?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/d910adc7-b01b-4773-96f6-85eba49709b8?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/88215c2f-5096-4f61-975e-cb2ba1cb5f8d?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
implies_rules: [L.1, L.10, L.5, W.2, W.3, W.5]
enforced_by: [check_emphasis, check_section_enums, check_speech_acts, check_wireframe_lock, check_wireframe_tags]
consumes: [gene-layout-archetype, gene-cta-restraint, gene-proof-type]
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

Lay the content as a four-up card row. On ecommerce product-grid sections built for shoppers deciding whether this product is right, hold CTA restraint `single-primary`. This signature appears in 60% of 15 annotated screens (layout-archetype, cta-restraint, proof-type), so it is the default, not a variation: select it unless the brief gives a named reason to deviate, and log that reason (P.8).

## Key measurements

| Measure | Median |
|---|---|
| `median_whitespace_share` | 0.645 |
| `median_media_ratio` | 0.322 |
| `median_columns` | 4 |

## Evidence

15 annotated screens; 10 Mobbin citations in the frontmatter.
