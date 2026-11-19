---
id: pattern-nonprofit-home-call-to-action-full-bleed
type: pattern
site_types: [nonprofit]
page_types: [home]
section_type: call-to-action
speech_acts: [act]
composition: full-bleed
prevalence: 0.667
n: 24
evidence:
  - https://mobbin.com/sites/sections/9d4c1894-63c8-40ee-a561-8cc8a3c391cc?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/3773b1bf-7f00-4f82-b6a5-e6eb96d82b09?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/a0f95752-ad08-4351-b9b3-26eabe51b4e2?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/62d7f323-f710-4daa-9c09-845c3ae2ec2f?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/396f8efa-7394-4949-8f7d-27755156fb83?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/5d694336-90bc-4394-aac8-c194d270d2fc?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/3dddcc59-dc4f-49c6-b1ad-052633c5e79c?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/61978ad1-5237-48b8-8fde-fc543b9b0239?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/2eebcdca-e5b4-41b1-8554-8825b69b44ff?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/0758da30-16e2-47f0-9581-8f67f18ff114?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
implies_rules: [L.1, L.10, L.5, V.1, V.3, W.2, W.3]
enforced_by: [check_emphasis, check_section_enums, check_segment_media, check_wireframe_lock, check_wireframe_tags]
consumes: [gene-layout-archetype, gene-image-led-ratio, gene-cta-restraint]
used_in: [w4, w5]
genotype:
  layout-archetype: full-bleed-media
  image-led-ratio: text-led
  cta-restraint: single-primary
links:
  index: patterns-index
  composition: section-catalog#full-bleed
  used_in: [w4, w5]
---

# pattern-nonprofit-home-call-to-action-full-bleed

Run one edge-to-edge media plane with a single centred statement over it. On nonprofit call-to-action sections built for donors checking impact, hold imagery at `text-led`, CTA restraint `single-primary`. This signature appears in 67% of 24 annotated screens (layout-archetype, image-led-ratio, cta-restraint), so it is the default, not a variation: select it unless the brief gives a named reason to deviate, and log that reason (P.8).

## Key measurements

| Measure | Median |
|---|---|
| `median_whitespace_share` | 0.741 |
| `median_media_ratio` | 0.0 |
| `median_columns` | 3.0 |

## Evidence

24 annotated screens; 10 Mobbin citations in the frontmatter.
