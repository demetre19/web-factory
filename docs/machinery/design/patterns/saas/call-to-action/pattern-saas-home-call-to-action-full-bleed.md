---
id: pattern-saas-home-call-to-action-full-bleed
type: pattern
site_types: [saas]
page_types: [home]
section_type: call-to-action
speech_acts: [act]
composition: full-bleed
prevalence: 0.6
n: 30
evidence:
  - https://mobbin.com/sites/sections/3ad59aee-0e6a-47e2-a84a-f6bda99a6702?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/66f6354b-428e-435a-9878-c46e38c9c249?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/43e1da3a-16d7-4e1d-81ca-2895817ba805?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/b7526783-b3c7-4cfa-a126-688d9beecf25?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/5b3eb845-1c92-484e-8df3-5284ded6fd44?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/f0e38c54-5f72-4579-9265-fd254ee6f17d?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/493b8bd1-015a-4b77-aeb8-0f7360fb7ef3?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/b8c8a83a-34c5-48e4-8509-e3b028aac152?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/7a6a69f0-1f80-42ce-b91b-5ab062f72cce?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/6fc28a7a-fec9-4e60-8b9f-2b6268f23f85?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
implies_rules: [L.1, L.10, L.5, V.1, V.3, W.2, W.3]
enforced_by: [check_emphasis, check_section_enums, check_segment_media, check_wireframe_lock, check_wireframe_tags]
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

# pattern-saas-home-call-to-action-full-bleed

Run one edge-to-edge media plane with a single centred statement over it. On saas call-to-action sections built for evaluators checking fit before a trial, hold imagery at `text-led`, CTA restraint `single-primary`. This signature appears in 60% of 30 annotated screens (layout-archetype, image-led-ratio, cta-restraint), so it is the default, not a variation: select it unless the brief gives a named reason to deviate, and log that reason (P.8).

## Key measurements

| Measure | Median |
|---|---|
| `median_whitespace_share` | 0.684 |
| `median_media_ratio` | 0.09 |
| `median_columns` | 3.0 |

## Evidence

30 annotated screens; 10 Mobbin citations in the frontmatter.
