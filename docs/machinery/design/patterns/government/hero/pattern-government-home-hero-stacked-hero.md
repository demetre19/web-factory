---
id: pattern-government-home-hero-stacked-hero
type: pattern
site_types: [government]
page_types: [home]
section_type: hero
speech_acts: [promise]
composition: stacked-hero
prevalence: 0.7
n: 20
evidence:
  - https://mobbin.com/sites/sections/6941f82c-99a5-4db2-a7ef-bffc093b359a?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/58fbbe8b-cdea-4eae-bff4-715ac163b4f9?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/2bef8644-bae2-42b6-b4ef-9910040250f6?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/de95347b-9ba8-4e22-b279-fded1f6c31d0?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/d6b4e853-443b-4754-b6a3-626b51a82d0c?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/9409f7e7-ec92-477e-9db5-dc4efa0ecdc0?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/38d3c862-d84c-4840-9fd0-94002eaf5571?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/9ccbe70e-d346-4a29-b9ca-72824600d969?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/88fd0706-6777-4faa-9f09-0b75d2cc8f2d?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/5f566da6-7d84-4e60-b4e5-a2f5a275d45f?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
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

# pattern-government-home-hero-stacked-hero

Stack the promise as centred text with no media column — reserve this for pages without a strong hero image. On government hero sections built for citizens finding a service, hold CTA restraint `single-primary`. This signature appears in 70% of 20 annotated screens (layout-archetype, cta-restraint, proof-type), so it is the default, not a variation: select it unless the brief gives a named reason to deviate, and log that reason (P.8).

## Key measurements

| Measure | Median |
|---|---|
| `median_whitespace_share` | 0.687 |
| `median_media_ratio` | 0.135 |
| `median_columns` | 2.0 |

## Evidence

20 annotated screens; 10 Mobbin citations in the frontmatter.
