---
id: pattern-ecommerce-category-filters-sort-text-index
type: pattern
site_types: [ecommerce]
page_types: [category]
section_type: filters-sort
speech_acts: [detail]
composition: text-index
prevalence: 0.609
n: 23
evidence:
  - https://mobbin.com/sites/sections/a4f80396-d25b-470b-a707-f6a0e25283e5?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/1d57be74-4b3e-4a62-982a-c5ff18ada45e?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/57934ff2-ce19-430d-911f-d6c7fb1c8ae0?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/f86d7f5d-fd2c-4cc5-b199-0e86d955d470?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/791c6c1a-758c-4c97-aaa0-b90bfdaa1eb0?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/27ee1dcb-f664-4684-b418-289075e6057b?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/810d4b42-8df6-419f-a30d-247605be4e93?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/7e5fd686-022d-487f-b0fd-8b4da2cd61ac?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/4e9604f9-9ccc-468c-b90b-521759baa2db?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/2dfb06ef-9ac2-4153-abbf-1313548fb371?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
implies_rules: [G.3, L.1, L.10, L.5, L.7, W.2, W.3]
enforced_by: [check_emphasis, check_rhythm, check_section_enums, check_spacing_scale, check_wireframe_lock, check_wireframe_tags]
consumes: [gene-layout-archetype, gene-density-tier, gene-cta-restraint]
used_in: [w4, w5]
genotype:
  layout-archetype: stacked-center
  density-tier: compact
  cta-restraint: single-primary
links:
  index: patterns-index
  composition: section-catalog#text-index
  used_in: [w4, w5]
---

# pattern-ecommerce-category-filters-sort-text-index

Stack the promise as centred text with no media column — reserve this for pages without a strong hero image. On ecommerce filters-sort sections built for shoppers deciding whether this product is right, hold `compact` vertical rhythm, CTA restraint `single-primary`. This signature appears in 61% of 23 annotated screens (layout-archetype, density-tier, cta-restraint), so it is the default, not a variation: select it unless the brief gives a named reason to deviate, and log that reason (P.8).

## Key measurements

| Measure | Median |
|---|---|
| `median_whitespace_share` | 0.627 |
| `median_media_ratio` | 0.28 |
| `median_columns` | 4 |

## Evidence

23 annotated screens; 10 Mobbin citations in the frontmatter.
