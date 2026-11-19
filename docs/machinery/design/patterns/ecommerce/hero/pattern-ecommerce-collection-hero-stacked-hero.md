---
id: pattern-ecommerce-collection-hero-stacked-hero
type: pattern
site_types: [ecommerce]
page_types: [collection]
section_type: hero
speech_acts: [promise]
composition: stacked-hero
prevalence: 0.7
n: 20
evidence:
  - https://mobbin.com/sites/sections/4c1cb8de-a9fa-4ad1-a30f-0e417f3dcc38?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/cdceb275-27a4-49a2-99e5-c573aba8cf8e?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/095d014e-3d91-4684-b137-1c26ac79b120?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/96dd9e15-89fe-4908-aca7-b01ad25b62e9?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/6029f51e-68fd-47ca-9ca9-f1560b2e988a?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/06ace72d-6feb-4f02-be09-5fd9ca6bb689?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/f328342e-5d23-4b5a-91e9-1d91a60013ec?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/e3fceb01-d16f-402f-b8e2-1dce7724d46f?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/3cf259c8-a1fa-4c01-893d-8cf109248e16?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/139768ad-33db-4511-a8e9-fc1fae98462c?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
implies_rules: [E.2, G.3, L.7, W.5, W.6]
enforced_by: [check_rhythm, check_section_enums, check_spacing_scale, check_speech_acts]
consumes: [gene-density-tier, gene-proof-type, gene-disclosure-tier]
used_in: [w4, w5]
genotype:
  density-tier: compact
  disclosure-tier: open
  proof-type: none
links:
  index: patterns-index
  composition: section-catalog#stacked-hero
  used_in: [w4, w5]
---

# pattern-ecommerce-collection-hero-stacked-hero

Set the content as one measure-constrained prose column (≤65ch) — no cards. On ecommerce hero sections built for shoppers deciding whether this product is right, hold `compact` vertical rhythm, disclosure `open`. This signature appears in 70% of 20 annotated screens (density-tier, proof-type, disclosure-tier), so it is the default, not a variation: select it unless the brief gives a named reason to deviate, and log that reason (P.8).

## Key measurements

| Measure | Median |
|---|---|
| `median_whitespace_share` | 0.526 |
| `median_media_ratio` | 0.355 |
| `median_columns` | 2.0 |

## Evidence

20 annotated screens; 10 Mobbin citations in the frontmatter.
