---
id: pattern-real-estate-listing-listing-cards-n
type: pattern
site_types: [real-estate]
page_types: [listing]
section_type: listing
speech_acts: [detail]
composition: cards-n
prevalence: 0.6
n: 30
evidence:
  - https://mobbin.com/sites/sections/5d57fbff-5355-4f3d-91b4-eff403615a2d?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/f3b6d424-a803-425b-bae6-5322ad4a904e?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/d31d7e35-2766-407a-89f4-523caaafb626?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/9257f097-b062-488a-8339-a3d76f9b6734?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/146941b6-b7d2-45f4-85e7-abda384930a1?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/6dfbfd40-07f4-43fb-861f-6fa0cdc072c4?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/2e9d36fe-e1dd-4bab-ba8e-3d4605c17e3f?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/6d629440-6e9b-431c-b202-7c5202c7af9e?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/d07ad815-77af-4cab-a6ff-c35761c7b2a6?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/4226456d-e845-483a-ad1b-305a93fe7d36?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
implies_rules: [L.1, L.10, L.5, W.2, W.3, W.5]
enforced_by: [check_emphasis, check_section_enums, check_speech_acts, check_wireframe_lock, check_wireframe_tags]
consumes: [gene-layout-archetype, gene-cta-restraint, gene-proof-type]
used_in: [w4, w5]
genotype:
  layout-archetype: card-grid-3
  cta-restraint: single-primary
  proof-type: none
links:
  index: patterns-index
  composition: section-catalog#cards-n
  used_in: [w4, w5]
---

# pattern-real-estate-listing-listing-cards-n

Lay the content as three equal cards in one row. On real-estate listing sections built for buyers scanning inventory, hold CTA restraint `single-primary`. This signature appears in 60% of 30 annotated screens (layout-archetype, cta-restraint, proof-type), so it is the default, not a variation: select it unless the brief gives a named reason to deviate, and log that reason (P.8).

## Key measurements

| Measure | Median |
|---|---|
| `median_whitespace_share` | 0.691 |
| `median_media_ratio` | 0.0 |
| `median_columns` | 2.0 |

## Evidence

30 annotated screens; 10 Mobbin citations in the frontmatter.
