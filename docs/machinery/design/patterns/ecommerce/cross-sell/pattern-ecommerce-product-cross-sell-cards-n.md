---
id: pattern-ecommerce-product-cross-sell-cards-n
type: pattern
site_types: [ecommerce]
page_types: [product]
section_type: cross-sell
speech_acts: [detail]
composition: cards-n
prevalence: 0.611
n: 18
evidence:
  - https://mobbin.com/sites/sections/f0a3c2c4-6fac-4813-b1dd-048ebaf3d30e?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/923bafcf-33a7-4066-bde4-7656f293f9d8?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/42316bd5-0548-4a6b-9f35-bdb66c9b886d?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/bc875c0d-0dae-41f6-866b-32bda5d9cb75?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/a8e1b232-9f17-4215-a5e2-54f215bbf900?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/d6ac29a1-61dc-4593-b43b-1eaddeffd342?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/1aa84170-aa5a-4c58-a8d6-9f09d573791d?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/47899c40-ad6c-4ec0-8f98-e1fea95be48b?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/c4b7a1c5-5c05-4c04-9623-4f80c688a145?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/c409ea6f-1834-4801-8c38-2cc2f0761c69?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
implies_rules: [V.1, V.3, W.2, W.3, W.5]
enforced_by: [check_emphasis, check_section_enums, check_segment_media, check_speech_acts, check_wireframe_tags]
consumes: [gene-image-led-ratio, gene-cta-restraint, gene-proof-type]
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

# pattern-ecommerce-product-cross-sell-cards-n

Set the content as one measure-constrained prose column (≤65ch) — no cards. On ecommerce cross-sell sections built for shoppers deciding whether this product is right, hold imagery at `text-led`, CTA restraint `single-primary`. This signature appears in 61% of 18 annotated screens (image-led-ratio, cta-restraint, proof-type), so it is the default, not a variation: select it unless the brief gives a named reason to deviate, and log that reason (P.8).

## Key measurements

| Measure | Median |
|---|---|
| `median_whitespace_share` | 0.676 |
| `median_media_ratio` | 0.206 |
| `median_columns` | 3.0 |

## Evidence

18 annotated screens; 10 Mobbin citations in the frontmatter.
