---
id: pattern-ecommerce-search-results-product-grid-cards-n
type: pattern
site_types: [ecommerce]
page_types: [search-results]
section_type: product-grid
speech_acts: [detail]
composition: cards-n
prevalence: 0.6
n: 30
evidence:
  - https://mobbin.com/sites/sections/663b377d-7e4e-4515-ba06-2cc80fe557cc?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/21c4afa1-221a-4626-ad57-4f4f756fed6c?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/2c42876f-e42f-49dc-ba18-b6acc4bdf204?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/727cda9d-155d-4d38-aedd-e330633e95f7?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/791c6c1a-758c-4c97-aaa0-b90bfdaa1eb0?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/07cd4f69-a389-4ad5-b64c-ff53f8193212?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/c39270b0-f69d-4ab5-9991-b3669ee6ded0?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/da619de2-60ed-4251-b81e-1914a5f2c7c0?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/151e0888-a1ff-4e13-8901-294af81fa94b?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/ca08c563-e78d-4eec-9b62-faf7dc7c952e?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
implies_rules: [C.1, C.6, L.1, L.10, L.5, W.2, W.3]
enforced_by: [check_contrast, check_emphasis, check_rhythm, check_section_enums, check_wireframe_lock, check_wireframe_tags]
consumes: [gene-layout-archetype, gene-surface-rhythm, gene-cta-restraint]
used_in: [w4, w5]
genotype:
  layout-archetype: card-grid-4
  surface-rhythm: one-contrast-moment
  cta-restraint: single-primary
links:
  index: patterns-index
  composition: section-catalog#cards-n
  used_in: [w4, w5]
---

# pattern-ecommerce-search-results-product-grid-cards-n

Lay the content as a four-up card row. On ecommerce product-grid sections built for shoppers deciding whether this product is right, hold CTA restraint `single-primary`. This signature appears in 60% of 30 annotated screens (layout-archetype, surface-rhythm, cta-restraint), so it is the default, not a variation: select it unless the brief gives a named reason to deviate, and log that reason (P.8).

## Key measurements

| Measure | Median |
|---|---|
| `median_whitespace_share` | 0.662 |
| `median_media_ratio` | 0.288 |
| `median_columns` | 4.0 |

## Evidence

30 annotated screens; 10 Mobbin citations in the frontmatter.
