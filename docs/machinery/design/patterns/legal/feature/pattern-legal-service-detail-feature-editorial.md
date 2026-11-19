---
id: pattern-legal-service-detail-feature-editorial
type: pattern
site_types: [legal]
page_types: [service-detail]
section_type: feature
speech_acts: [how]
composition: editorial
prevalence: 0.609
n: 23
evidence:
  - https://mobbin.com/sites/sections/7063e124-d7b5-4fe4-9797-b318a5be20d1?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/bc636344-6e5b-4b98-9baa-809b622456fb?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/895fdc20-9ed5-4a49-915d-5828a42d80b1?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/a3c3f82e-5230-4d24-85c2-15afdcce31cc?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/ebe595a8-a2f4-4590-8d3c-6cbc49d84fab?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/d33c835f-2d6e-4ce1-b827-23703ef3a607?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/ae8501ca-6a77-41ac-b650-e8dd0d26ed31?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/8c277be7-05d1-472f-942d-b4196b7dda64?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/1364de07-7eec-4543-baad-14ffb8243319?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/2be028e5-2668-4aeb-9242-5c98075d8bb3?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
implies_rules: [L.1, L.10, L.5, V.1, V.3, W.2, W.3]
enforced_by: [check_emphasis, check_section_enums, check_segment_media, check_wireframe_lock, check_wireframe_tags]
consumes: [gene-layout-archetype, gene-image-led-ratio, gene-cta-restraint]
used_in: [w4, w5]
genotype:
  layout-archetype: editorial-single
  image-led-ratio: text-led
  cta-restraint: single-primary
links:
  index: patterns-index
  composition: section-catalog#editorial
  used_in: [w4, w5]
---

# pattern-legal-service-detail-feature-editorial

Set the content as one measure-constrained prose column (≤65ch) — no cards. On legal feature sections built for clients checking authority, hold imagery at `text-led`, CTA restraint `single-primary`. This signature appears in 61% of 23 annotated screens (layout-archetype, image-led-ratio, cta-restraint), so it is the default, not a variation: select it unless the brief gives a named reason to deviate, and log that reason (P.8).

## Key measurements

| Measure | Median |
|---|---|
| `median_whitespace_share` | 0.795 |
| `median_media_ratio` | 0 |
| `median_columns` | 2 |

## Evidence

23 annotated screens; 10 Mobbin citations in the frontmatter.
