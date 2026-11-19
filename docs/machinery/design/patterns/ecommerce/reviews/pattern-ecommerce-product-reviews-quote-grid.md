---
id: pattern-ecommerce-product-reviews-quote-grid
type: pattern
site_types: [ecommerce]
page_types: [product]
section_type: reviews
speech_acts: [proof]
composition: quote-grid
prevalence: 0.607
n: 28
evidence:
  - https://mobbin.com/sites/sections/1dd8e784-a73f-4ab7-b723-401cfe5d62d2?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/3daf0778-1ea2-4c9f-b29e-cd17b895a5f0?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/87e75ad4-aa7a-4e06-90fe-745e63ed1631?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/e909e101-172d-4129-b006-77af4e712c99?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/cd91f921-bd4d-4055-af4b-5a5e3b4cdbc1?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/9912097d-5d6a-4046-8c0d-6ac555885561?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/9fcce615-4ee7-482b-843b-08cc54a58eb0?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/8c1988f8-54d6-44b4-9466-16d23c49590f?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/3abb0205-62db-438a-905b-8d097dd1aad8?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/32e27c57-1beb-458c-8409-dc03af32f610?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
implies_rules: [G.3, L.1, L.10, L.5, L.7, V.1, V.3]
enforced_by: [check_rhythm, check_section_enums, check_segment_media, check_spacing_scale, check_wireframe_lock]
consumes: [gene-layout-archetype, gene-image-led-ratio, gene-density-tier]
used_in: [w4, w5]
genotype:
  layout-archetype: card-grid-3
  density-tier: spacious
  image-led-ratio: text-led
links:
  index: patterns-index
  composition: section-catalog#quote-grid
  used_in: [w4, w5]
---

# pattern-ecommerce-product-reviews-quote-grid

Lay the content as three equal cards in one row. On ecommerce reviews sections built for shoppers deciding whether this product is right, hold imagery at `text-led`, `spacious` vertical rhythm. This signature appears in 61% of 28 annotated screens (layout-archetype, image-led-ratio, density-tier), so it is the default, not a variation: select it unless the brief gives a named reason to deviate, and log that reason (P.8).

## Key measurements

| Measure | Median |
|---|---|
| `median_whitespace_share` | 0.807 |
| `median_media_ratio` | 0.0 |
| `median_columns` | 3.0 |

## Evidence

28 annotated screens; 10 Mobbin citations in the frontmatter.
