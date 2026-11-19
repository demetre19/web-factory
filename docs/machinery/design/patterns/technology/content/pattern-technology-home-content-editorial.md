---
id: pattern-technology-home-content-editorial
type: pattern
site_types: [technology]
page_types: [home]
section_type: content
speech_acts: [detail]
composition: editorial
prevalence: 0.72
n: 25
evidence:
  - https://mobbin.com/sites/sections/a89e05aa-c41c-4cf8-b196-9af59035b98d?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/707d8046-c06a-419b-a7e9-b5ee229dee46?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/5c31781f-7c9d-4504-8339-ad676efd0dfb?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/fba01441-aa0c-4641-8b29-4e6e8a2f0bfb?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/bc31e448-f56a-4b11-939d-55d0b472ebec?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/d81325dc-13fe-4211-9ba6-a26c6842835a?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/d1548e95-435b-4607-b779-9530c6e2dd95?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/d0cbe981-946b-4ca8-96c6-abd8d8a85c17?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/1143697c-abc1-45f6-81bb-158770b63be4?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/848358e0-f42c-4880-84ae-e972247e8583?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
implies_rules: [C.1, C.6, L.1, L.10, L.5, V.1, V.3]
enforced_by: [check_contrast, check_rhythm, check_section_enums, check_segment_media, check_wireframe_lock]
consumes: [gene-layout-archetype, gene-image-led-ratio, gene-surface-rhythm]
used_in: [w4, w5]
genotype:
  layout-archetype: editorial-single
  image-led-ratio: text-led
  surface-rhythm: one-contrast-moment
links:
  index: patterns-index
  composition: section-catalog#editorial
  used_in: [w4, w5]
---

# pattern-technology-home-content-editorial

Set the content as one measure-constrained prose column (≤65ch) — no cards. On technology content sections built for developers checking the API surface, hold imagery at `text-led`. This signature appears in 72% of 25 annotated screens (layout-archetype, image-led-ratio, surface-rhythm), so it is the default, not a variation: select it unless the brief gives a named reason to deviate, and log that reason (P.8).

## Key measurements

| Measure | Median |
|---|---|
| `median_whitespace_share` | 0.81 |
| `median_media_ratio` | 0 |
| `median_columns` | 3 |

## Evidence

25 annotated screens; 10 Mobbin citations in the frontmatter.
