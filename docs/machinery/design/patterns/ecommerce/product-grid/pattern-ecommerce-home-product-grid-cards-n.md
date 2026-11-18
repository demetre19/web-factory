---
id: pattern-ecommerce-home-product-grid-cards-n
type: pattern
site_types: [ecommerce]
page_types: [home]
section_type: product-grid
speech_acts: [detail]
composition: cards-n
prevalence: 0.6
n: 30
evidence:
  - https://mobbin.com/sites/sections/27dc50fa-93be-4e72-994f-b692d668ee50?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/e8c6a5dc-1020-4683-8ed9-8e0a9834d881?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/914e9d4b-54bd-487b-9f31-f61e749d7ca4?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/f250562a-e07a-4040-a93a-06ae26fa0d33?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/486dfdf5-8238-40c3-999e-ded6718d4f1a?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/c8a48362-f1de-48dd-97bd-30cd8ab33a4d?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/6232d098-3bba-4294-90bd-2632568b1794?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/ea05a959-780b-4753-a87a-e3e06eb65bf9?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/8fd34aef-0843-48fa-b7ca-dbbb19f66d59?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/82d9ea8c-1ecc-47f0-aed3-5c73ae25b65a?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
implies_rules: [V.1, V.3, W.2, W.3, W.5]
enforced_by: [check_emphasis, check_section_enums, check_segment_media, check_speech_acts, check_wireframe_tags]
used_in: [w4, w5]
genotype:
  image-led-ratio: text-led
  cta-restraint: single-primary
  proof-type: none
links:
  index: patterns-index
  composition: section-catalog#cards-n
  used_in: [w4, w5]
---

# pattern-ecommerce-home-product-grid-cards-n

Set the content as one measure-constrained prose column (≤65ch) — no cards. On ecommerce product-grid sections built for shoppers deciding whether this product is right, hold imagery at `text-led`, CTA restraint `single-primary`. This signature appears in 60% of 30 annotated screens (image-led-ratio, cta-restraint, proof-type), so it is the default, not a variation: select it unless the brief gives a named reason to deviate, and log that reason (P.8).

## Key measurements

| Measure | Median |
|---|---|
| `median_whitespace_share` | 0.636 |
| `median_media_ratio` | 0.082 |
| `median_columns` | 4.0 |

## Evidence

30 annotated screens; 10 Mobbin citations in the frontmatter.
