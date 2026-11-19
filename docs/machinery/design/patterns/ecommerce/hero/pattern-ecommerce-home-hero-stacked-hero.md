---
id: pattern-ecommerce-home-hero-stacked-hero
type: pattern
site_types: [ecommerce]
page_types: [home]
section_type: hero
speech_acts: [promise]
composition: stacked-hero
prevalence: 0.625
n: 16
evidence:
  - https://mobbin.com/sites/sections/284b648b-23fb-48a9-82af-4de13e13d7ad?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/ab501ef4-763a-44ff-84d0-666fea058bb5?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/5c8db76d-079d-468c-9621-be7705ab1b7f?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/44461834-151b-4648-878b-1dc96a2d0a10?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/e7aca27c-5d2f-4fe4-942c-5c9e6d148485?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/392cfc85-f159-4d9b-a162-d46d6a0e6102?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/c26f1905-9dc4-476d-9627-c036a2399324?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/11c092be-1fe5-4324-92c6-552368fcc6a8?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/2f1c22cc-9959-4bbf-83ef-7f892258a79d?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/92dee059-75e8-4435-a2cd-9e5c39a97ac4?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
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
  composition: section-catalog#stacked-hero
  used_in: [w4, w5]
---

# pattern-ecommerce-home-hero-stacked-hero

Stack the promise as centred text with no media column — reserve this for pages without a strong hero image. On ecommerce hero sections built for shoppers deciding whether this product is right, hold CTA restraint `single-primary`. This signature appears in 62% of 16 annotated screens (layout-archetype, surface-rhythm, cta-restraint), so it is the default, not a variation: select it unless the brief gives a named reason to deviate, and log that reason (P.8).

## Key measurements

| Measure | Median |
|---|---|
| `median_whitespace_share` | 0.528 |
| `median_media_ratio` | 0.204 |
| `median_columns` | 2.0 |

## Evidence

16 annotated screens; 10 Mobbin citations in the frontmatter.
