---
id: pattern-healthcare-service-detail-feature-split-media
type: pattern
site_types: [healthcare]
page_types: [service-detail]
section_type: feature
speech_acts: [how]
composition: split-media
prevalence: 0.833
n: 30
evidence:
  - https://mobbin.com/sites/sections/fb67ceb2-11a3-40b0-b6f9-780f306ccded?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/883db2f4-aced-412d-8c52-de2012b6e6db?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/a68af945-71f2-40b7-bec9-33a5035c0a14?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/20c4600f-d3e9-49b5-afad-b94dcb8fd0e9?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/e1e084d0-98fb-48f3-aacd-afa7c6eebc4b?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/6781387e-a677-4824-b085-6e3ed66d8096?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/6695790f-7142-4e99-86a9-2632963b795d?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/49719c64-fd2a-4b0e-a454-c639b69f1bd7?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/814e0a13-81d8-4d89-95f1-33b72ef0d9d3?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/b4ca3993-218b-41c9-a773-1ac0690d9c50?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
implies_rules: [C.1, C.6, E.2, W.5, W.6]
enforced_by: [check_contrast, check_rhythm, check_section_enums, check_speech_acts]
used_in: [w4, w5]
genotype:
  surface-rhythm: one-contrast-moment
  disclosure-tier: open
  proof-type: none
links:
  index: patterns-index
  composition: section-catalog#split-media
  used_in: [w4, w5]
---

# pattern-healthcare-service-detail-feature-split-media

Set the content as one measure-constrained prose column (≤65ch) — no cards. On healthcare feature sections built for patients checking safety and credentials, hold disclosure `open`. This signature appears in 83% of 30 annotated screens (surface-rhythm, proof-type, disclosure-tier), so it is the default, not a variation: select it unless the brief gives a named reason to deviate, and log that reason (P.8).

## Key measurements

| Measure | Median |
|---|---|
| `median_whitespace_share` | 0.639 |
| `median_media_ratio` | 0.314 |
| `median_columns` | 2.0 |

## Evidence

30 annotated screens; 10 Mobbin citations in the frontmatter.
