---
id: pattern-healthcare-home-hero-stacked-hero
type: pattern
site_types: [healthcare]
page_types: [home]
section_type: hero
speech_acts: [promise]
composition: stacked-hero
prevalence: 0.6
n: 15
evidence:
  - https://mobbin.com/sites/sections/482dc765-0fbb-4212-8b79-83bdd1930a2b?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/49719c64-fd2a-4b0e-a454-c639b69f1bd7?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/42d21ff1-4f1a-4364-8e41-0dd159f5a1c5?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/76f06a79-1c36-4ef1-a3b7-a4c02c16618e?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/86d46d01-a43a-46e5-a886-ed5cdfda6911?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/c879fcc6-d21c-4fdb-a16d-5d1c26123885?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/7c1e2d1c-3200-4d81-b4ef-b00ae9bfb5fb?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/6cd2f843-9d25-4b0c-9dca-9af2d522f24c?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/d5bfaded-43dd-44a2-b5cc-e57416104f08?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/dcd77131-0901-4971-929e-00773c34a5f3?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
implies_rules: [L.1, L.10, L.5, V.1, V.3, W.2, W.3]
enforced_by: [check_emphasis, check_section_enums, check_segment_media, check_wireframe_lock, check_wireframe_tags]
consumes: [gene-layout-archetype, gene-image-led-ratio, gene-cta-restraint]
used_in: [w4, w5]
genotype:
  layout-archetype: stacked-center
  image-led-ratio: text-led
  cta-restraint: single-primary
links:
  index: patterns-index
  composition: section-catalog#stacked-hero
  used_in: [w4, w5]
---

# pattern-healthcare-home-hero-stacked-hero

Stack the promise as centred text with no media column — reserve this for pages without a strong hero image. On healthcare hero sections built for patients checking safety and credentials, hold imagery at `text-led`, CTA restraint `single-primary`. This signature appears in 60% of 15 annotated screens (layout-archetype, image-led-ratio, cta-restraint), so it is the default, not a variation: select it unless the brief gives a named reason to deviate, and log that reason (P.8).

## Key measurements

| Measure | Median |
|---|---|
| `median_whitespace_share` | 0.682 |
| `median_media_ratio` | 0 |
| `median_columns` | 2 |

## Evidence

15 annotated screens; 10 Mobbin citations in the frontmatter.
