---
id: pattern-real-estate-home-hero-stacked-hero
type: pattern
site_types: [real-estate]
page_types: [home]
section_type: hero
speech_acts: [promise]
composition: stacked-hero
prevalence: 0.6
n: 30
evidence:
  - https://mobbin.com/sites/sections/04ec26fb-062e-4210-815d-08ef23fa0888?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/e4547810-67d9-46bc-b103-77bb719fe9a6?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/ba7d9306-7103-4f8d-bc9e-6b3048f5121e?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/0726ec3c-1c6a-4fb0-b434-88c3ec536a8f?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/a2c13590-47b4-4acf-a88d-aa93b76f850a?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/e37bd28d-e9df-4c81-9cf2-1a76f94a8993?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/5b286882-9109-486a-ad42-2855160c43b5?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/d07ad815-77af-4cab-a6ff-c35761c7b2a6?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/81368750-7daf-4615-8a68-2006b9361221?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/b3833d9a-eddc-4e65-93fd-39045dcd837d?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
implies_rules: [L.1, L.10, L.5, W.2, W.3, W.5]
enforced_by: [check_emphasis, check_section_enums, check_speech_acts, check_wireframe_lock, check_wireframe_tags]
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

# pattern-real-estate-home-hero-stacked-hero

Stack the promise as centred text with no media column — reserve this for pages without a strong hero image. On real-estate hero sections built for buyers scanning inventory, hold CTA restraint `single-primary`. This signature appears in 60% of 30 annotated screens (layout-archetype, cta-restraint, proof-type), so it is the default, not a variation: select it unless the brief gives a named reason to deviate, and log that reason (P.8).

## Key measurements

| Measure | Median |
|---|---|
| `median_whitespace_share` | 0.612 |
| `median_media_ratio` | 0.0 |
| `median_columns` | 1.0 |

## Evidence

30 annotated screens; 10 Mobbin citations in the frontmatter.
