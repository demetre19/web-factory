---
id: pattern-nonprofit-home-call-to-action-full-bleed
type: pattern
site_types: [nonprofit]
page_types: [home]
section_type: call-to-action
speech_acts: [act]
composition: full-bleed
prevalence: 0.9
n: 30
evidence:
  - https://mobbin.com/sites/sections/9d4c1894-63c8-40ee-a561-8cc8a3c391cc?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/097c659b-3631-42e7-bb6f-69ded6f0de85?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/3773b1bf-7f00-4f82-b6a5-e6eb96d82b09?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/bcc84717-e826-422f-8f17-55594587dcb2?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/a0f95752-ad08-4351-b9b3-26eabe51b4e2?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/62d7f323-f710-4daa-9c09-845c3ae2ec2f?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/396f8efa-7394-4949-8f7d-27755156fb83?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/3dddcc59-dc4f-49c6-b1ad-052633c5e79c?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/8c05dfcd-4af6-4c33-87ec-888ab089632e?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/74941c96-6f81-43e4-aafd-cbfd6fd0a647?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
implies_rules: [C.1, C.6, L.1, L.10, L.5, W.2, W.3]
enforced_by: [check_contrast, check_emphasis, check_rhythm, check_section_enums, check_wireframe_lock, check_wireframe_tags]
used_in: [w4, w5]
genotype:
  layout-archetype: full-bleed-media
  surface-rhythm: one-contrast-moment
  cta-restraint: single-primary
links:
  index: patterns-index
  composition: section-catalog#full-bleed
  used_in: [w4, w5]
---

# pattern-nonprofit-home-call-to-action-full-bleed

Run one edge-to-edge media plane with a single centred statement over it. On nonprofit call-to-action sections built for donors checking impact, hold CTA restraint `single-primary`. This signature appears in 90% of 30 annotated screens (layout-archetype, surface-rhythm, cta-restraint), so it is the default, not a variation: select it unless the brief gives a named reason to deviate, and log that reason (P.8).

## Key measurements

| Measure | Median |
|---|---|
| `median_whitespace_share` | 0.576 |
| `median_media_ratio` | 0.124 |
| `median_columns` | 2.0 |

## Evidence

30 annotated screens; 10 Mobbin citations in the frontmatter.
