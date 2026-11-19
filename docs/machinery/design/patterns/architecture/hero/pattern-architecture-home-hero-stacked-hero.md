---
id: pattern-architecture-home-hero-stacked-hero
type: pattern
site_types: [architecture]
page_types: [home]
section_type: hero
speech_acts: [promise]
composition: stacked-hero
prevalence: 0.769
n: 13
evidence:
  - https://mobbin.com/sites/sections/a8eabf73-7dfd-4f4e-83bb-416f07de002b?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/bd7c2524-d001-4e59-b5a7-7e4c45f43eab?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/da478a6a-0069-4e5a-86c0-f9ffde610ebc?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/448a4e6f-c7cf-4dc0-b6de-a2e375ebc761?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/e86e51b0-f2ae-4002-9879-d811026b5b04?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/64611226-7921-4e34-9001-83c7e91bd803?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/74ad329a-ce15-4d30-8c8b-811b3f370db1?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/a89d4adb-7da0-49a9-bbd6-3afdd2242aa2?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/a5a4a029-bdd6-454b-a4b5-5026f306999e?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/92a778c8-1b79-443f-b2fa-33db3b871121?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
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

Stack the promise as centred text with no media column — reserve this for pages without a strong hero image. On architecture hero sections built for clients reading spatial judgement, hold imagery at `text-led`, CTA restraint `single-primary`. This signature appears in 77% of 13 annotated screens (layout-archetype, image-led-ratio, cta-restraint), so it is the default, not a variation: select it unless the brief gives a named reason to deviate, and log that reason (P.8).

## Key measurements

| Measure | Median |
|---|---|
| `median_whitespace_share` | 0.719 |
| `median_media_ratio` | 0 |
| `median_columns` | 2 |

## Evidence

13 annotated screens; 10 Mobbin citations in the frontmatter.
