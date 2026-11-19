---
id: pattern-ecommerce-search-results-product-grid-cards-n
type: pattern
site_types: [ecommerce]
page_types: [search-results]
section_type: product-grid
speech_acts: [detail]
composition: cards-n
prevalence: 0.833
n: 12
evidence:
  - https://mobbin.com/sites/sections/18f7bbce-63f4-449c-9fd3-d3bcc1693a8f?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/0bc7c20d-aec0-43b0-8104-20c3ba2cc371?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/8708a2c6-be9c-4413-89da-014259be404e?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/07cd4f69-a389-4ad5-b64c-ff53f8193212?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/9c4d05e3-7ce2-4f2f-b5ac-bf417bcc2e7e?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/601e9bbf-c47f-4fee-8384-28ad5a58bc88?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/c1787a46-d962-4580-a4de-34a98c883798?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/1a506d10-b4df-4b86-aea4-ccfd45d58161?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/90446f87-9a89-4df0-ba46-354c31852c3d?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/adf70ee0-5902-4cfe-a34e-134082d083b1?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
implies_rules: [C.1, C.6, W.2, W.3, W.5]
enforced_by: [check_contrast, check_emphasis, check_rhythm, check_speech_acts, check_wireframe_tags]
consumes: [gene-surface-rhythm, gene-cta-restraint, gene-proof-type]
used_in: [w4, w5]
genotype:
  surface-rhythm: one-contrast-moment
  cta-restraint: single-primary
  proof-type: none
links:
  index: patterns-index
  composition: section-catalog#cards-n
  used_in: [w4, w5]
---

# pattern-ecommerce-search-results-product-grid-cards-n

Set the content as one measure-constrained prose column (≤65ch) — no cards. On ecommerce product-grid sections built for shoppers deciding whether this product is right, hold CTA restraint `single-primary`. This signature appears in 83% of 12 annotated screens (surface-rhythm, cta-restraint, proof-type), so it is the default, not a variation: select it unless the brief gives a named reason to deviate, and log that reason (P.8).

## Key measurements

| Measure | Median |
|---|---|
| `median_whitespace_share` | 0.65 |
| `median_media_ratio` | 0.23 |
| `median_columns` | 3.0 |

## Evidence

12 annotated screens; 10 Mobbin citations in the frontmatter.
