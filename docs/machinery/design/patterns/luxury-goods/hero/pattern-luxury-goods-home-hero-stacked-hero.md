---
id: pattern-luxury-goods-home-hero-stacked-hero
type: pattern
site_types: [luxury-goods]
page_types: [home]
section_type: hero
speech_acts: [promise]
composition: stacked-hero
prevalence: 0.6
n: 30
evidence:
  - https://mobbin.com/sites/sections/6731d69b-85cd-4694-9fcf-26ba9dc80e43?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/6a6fe0b5-88df-4114-b06a-7647bc81a445?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/7f12bf1b-35f6-473b-bec7-19c4e2a4a1c9?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/ba7d9306-7103-4f8d-bc9e-6b3048f5121e?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/33daf6d2-3e0d-446f-b211-89d540f896cf?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/cac5c6fe-01b5-4769-8972-a2d70c190673?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/af17ed24-6080-40d0-8320-b404bc9025bb?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/46d8adde-562e-44c7-a1f5-fb987d21e5ba?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/e6488b74-dfd0-4c19-af82-c277245ff6a2?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/d07ad815-77af-4cab-a6ff-c35761c7b2a6?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
implies_rules: [L.1, L.10, L.5, W.2, W.3, W.5]
enforced_by: [check_emphasis, check_section_enums, check_speech_acts, check_wireframe_lock, check_wireframe_tags]
consumes: [gene-layout-archetype, gene-cta-restraint, gene-proof-type]
used_in: [w4, w5]
genotype:
  layout-archetype: stacked-center
  cta-restraint: single-primary
  proof-type: none
links:
  index: patterns-index
  composition: section-catalog#stacked-hero
  used_in: [w4, w5]
---

# pattern-luxury-goods-home-hero-stacked-hero

Stack the promise as centred text with no media column — reserve this for pages without a strong hero image. On luxury-goods hero sections built for buyers reading restraint and heritage, hold CTA restraint `single-primary`. This signature appears in 60% of 30 annotated screens (layout-archetype, cta-restraint, proof-type), so it is the default, not a variation: select it unless the brief gives a named reason to deviate, and log that reason (P.8).

## Key measurements

| Measure | Median |
|---|---|
| `median_whitespace_share` | 0.625 |
| `median_media_ratio` | 0.161 |
| `median_columns` | 1.0 |

## Evidence

30 annotated screens; 10 Mobbin citations in the frontmatter.
