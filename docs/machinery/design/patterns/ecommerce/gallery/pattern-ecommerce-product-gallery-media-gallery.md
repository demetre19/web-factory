---
id: pattern-ecommerce-product-gallery-media-gallery
type: pattern
site_types: [ecommerce]
page_types: [product]
section_type: gallery
speech_acts: [detail]
composition: media-gallery
prevalence: 0.6
n: 15
evidence:
  - https://mobbin.com/sites/sections/710c23c3-efd9-4a9b-a1f3-cbdc9543c6a1?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/abe97d09-83af-4e81-aefd-7b3a45449219?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/b0d60573-ce54-4ba1-afc2-2a6e144d290f?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/1d522211-7b62-4dc3-bf52-dcd9a78faef8?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/30a4d56f-6505-49fc-bb49-8d9ecdb7b3c8?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/a231fad4-ee91-4d37-9c46-0eda4e67f8a3?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/16393456-af1e-48d1-80f4-2202b25075df?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/44dd154c-2490-4622-9940-fcbccf9d2cd4?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/3fb47700-6e3e-435f-847b-c1337720d302?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/9f8a47e9-de3c-4469-9fff-09b24b009d1e?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
implies_rules: [C.1, C.6, L.1, L.10, L.5, W.2, W.3]
enforced_by: [check_contrast, check_emphasis, check_rhythm, check_section_enums, check_wireframe_lock, check_wireframe_tags]
consumes: [gene-layout-archetype, gene-surface-rhythm, gene-cta-restraint]
used_in: [w4, w5]
genotype:
  layout-archetype: carousel-track
  surface-rhythm: one-contrast-moment
  cta-restraint: single-primary
links:
  index: patterns-index
  composition: section-catalog#media-gallery
  used_in: [w4, w5]
---

# pattern-ecommerce-product-gallery-media-gallery

Page the items on a horizontal track with visible peek and controls. On ecommerce gallery sections built for shoppers deciding whether this product is right, hold CTA restraint `single-primary`. This signature appears in 60% of 15 annotated screens (layout-archetype, surface-rhythm, cta-restraint), so it is the default, not a variation: select it unless the brief gives a named reason to deviate, and log that reason (P.8).

## Key measurements

| Measure | Median |
|---|---|
| `median_whitespace_share` | 0.65 |
| `median_media_ratio` | 0.322 |
| `median_columns` | 3 |

## Evidence

15 annotated screens; 10 Mobbin citations in the frontmatter.
