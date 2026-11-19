---
id: pattern-ecommerce-product-gallery-media-gallery
type: pattern
site_types: [ecommerce]
page_types: [product]
section_type: gallery
speech_acts: [detail]
composition: media-gallery
prevalence: 0.6
n: 20
evidence:
  - https://mobbin.com/sites/sections/710c23c3-efd9-4a9b-a1f3-cbdc9543c6a1?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/abe97d09-83af-4e81-aefd-7b3a45449219?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/9f8a47e9-de3c-4469-9fff-09b24b009d1e?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/b0d60573-ce54-4ba1-afc2-2a6e144d290f?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/1d522211-7b62-4dc3-bf52-dcd9a78faef8?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/30a4d56f-6505-49fc-bb49-8d9ecdb7b3c8?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/ccb238a7-2d59-4b67-8225-5db269bcbd0b?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/a231fad4-ee91-4d37-9c46-0eda4e67f8a3?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/16393456-af1e-48d1-80f4-2202b25075df?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/1e3eb0ac-d897-4da4-8009-669f0ad339e9?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
implies_rules: [L.1, L.10, L.5, W.2, W.3, W.5]
enforced_by: [check_emphasis, check_section_enums, check_speech_acts, check_wireframe_lock, check_wireframe_tags]
consumes: [gene-layout-archetype, gene-cta-restraint, gene-proof-type]
used_in: [w4, w5]
genotype:
  layout-archetype: carousel-track
  cta-restraint: single-primary
  proof-type: none
links:
  index: patterns-index
  composition: section-catalog#media-gallery
  used_in: [w4, w5]
---

# pattern-ecommerce-product-gallery-media-gallery

Page the items on a horizontal track with visible peek and controls. On ecommerce gallery sections built for shoppers deciding whether this product is right, hold CTA restraint `single-primary`. This signature appears in 60% of 20 annotated screens (layout-archetype, cta-restraint, proof-type), so it is the default, not a variation: select it unless the brief gives a named reason to deviate, and log that reason (P.8).

## Key measurements

| Measure | Median |
|---|---|
| `median_whitespace_share` | 0.593 |
| `median_media_ratio` | 0.354 |
| `median_columns` | 2.5 |

## Evidence

20 annotated screens; 10 Mobbin citations in the frontmatter.
