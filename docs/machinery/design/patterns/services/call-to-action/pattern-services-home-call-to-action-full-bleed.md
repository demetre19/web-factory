---
id: pattern-services-home-call-to-action-full-bleed
type: pattern
site_types: [services]
page_types: [home]
section_type: call-to-action
speech_acts: [act]
composition: full-bleed
prevalence: 0.75
n: 20
evidence:
  - https://mobbin.com/sites/sections/7ab58ecd-a823-4995-8ef4-f7e9bc06a48f?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/58686d82-1872-4803-8f0f-a328b5a38602?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/90306b1f-37c9-4e93-b76f-ec7588ec1741?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/a3bbde0f-b285-40e2-b819-6ed626190280?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/e2039614-8a3c-4c08-a0c5-046cc421615c?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/84d39e78-5213-4f53-91e4-d9c6b22e1442?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/c754d011-4f43-4cae-9764-0c25de00a5fe?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/4d6c6c50-ebc6-4765-8847-faf418e7690c?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/f64ee160-3d04-4b22-a825-5f85fb0a8fcc?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/a44e0193-8ee6-49b2-96e5-aea85ac78d98?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
implies_rules: [C.1, C.6, L.1, L.10, L.5, W.2, W.3]
enforced_by: [check_contrast, check_emphasis, check_rhythm, check_section_enums, check_wireframe_lock, check_wireframe_tags]
consumes: [gene-layout-archetype, gene-surface-rhythm, gene-cta-restraint]
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

# pattern-services-home-call-to-action-full-bleed

Run one edge-to-edge media plane with a single centred statement over it. On services call-to-action sections built for service buyers scanning for competence and a quote, hold CTA restraint `single-primary`. This signature appears in 75% of 20 annotated screens (layout-archetype, surface-rhythm, cta-restraint), so it is the default, not a variation: select it unless the brief gives a named reason to deviate, and log that reason (P.8).

## Key measurements

| Measure | Median |
|---|---|
| `median_whitespace_share` | 0.653 |
| `median_media_ratio` | 0.19 |
| `median_columns` | 1.0 |

## Evidence

20 annotated screens; 10 Mobbin citations in the frontmatter.
