---
id: pattern-architecture-home-hero-stacked-hero
type: pattern
site_types: [architecture]
page_types: [home]
section_type: hero
speech_acts: [promise]
composition: stacked-hero
prevalence: 0.633
n: 30
evidence:
  - https://mobbin.com/sites/sections/566781bb-cfb6-4b54-9360-fac8f68d4b6f?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/6a6fe0b5-88df-4114-b06a-7647bc81a445?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/42aaad97-8c45-41d3-be1e-c4b9b9654332?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/a8eabf73-7dfd-4f4e-83bb-416f07de002b?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/af17ed24-6080-40d0-8320-b404bc9025bb?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/bd7c2524-d001-4e59-b5a7-7e4c45f43eab?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/da478a6a-0069-4e5a-86c0-f9ffde610ebc?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/0e035b6e-f0ab-416e-9ade-af96d4542658?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/448a4e6f-c7cf-4dc0-b6de-a2e375ebc761?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/3e24cd34-ebbc-457e-84c6-33f869130747?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
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

# pattern-architecture-home-hero-stacked-hero

Stack the promise as centred text with no media column — reserve this for pages without a strong hero image. On architecture hero sections built for clients reading spatial judgement, hold imagery at `text-led`, CTA restraint `single-primary`. This signature appears in 63% of 30 annotated screens (layout-archetype, image-led-ratio, cta-restraint), so it is the default, not a variation: select it unless the brief gives a named reason to deviate, and log that reason (P.8).

## Key measurements

| Measure | Median |
|---|---|
| `median_whitespace_share` | 0.673 |
| `median_media_ratio` | 0.0 |
| `median_columns` | 1.0 |

## Evidence

30 annotated screens; 10 Mobbin citations in the frontmatter.
