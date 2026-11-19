---
id: pattern-healthcare-service-detail-feature-split-media
type: pattern
site_types: [healthcare]
page_types: [service-detail]
section_type: feature
speech_acts: [how]
composition: split-media
prevalence: 1.0
n: 17
evidence:
  - https://mobbin.com/sites/sections/fb67ceb2-11a3-40b0-b6f9-780f306ccded?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/a68af945-71f2-40b7-bec9-33a5035c0a14?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/e1e084d0-98fb-48f3-aacd-afa7c6eebc4b?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/6781387e-a677-4824-b085-6e3ed66d8096?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/b4ca3993-218b-41c9-a773-1ac0690d9c50?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/f333d7bc-b54f-40f9-97a3-302020286372?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/644a4131-206f-44af-a0e9-45777d17518a?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/9014405b-dcc4-44ca-bc3a-c725a0dbb86a?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/03bdbbfe-c06f-4832-b0ad-50d9e26d3f35?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/d1277569-a3eb-49b0-b201-7a2f6b59b30b?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
implies_rules: [C.1, C.6, E.2, W.5, W.6]
enforced_by: [check_contrast, check_rhythm, check_section_enums, check_speech_acts]
consumes: [gene-surface-rhythm, gene-proof-type, gene-disclosure-tier]
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

Set the content as one measure-constrained prose column (≤65ch) — no cards. On healthcare feature sections built for patients checking safety and credentials, hold disclosure `open`. This signature appears in 100% of 17 annotated screens (surface-rhythm, proof-type, disclosure-tier), so it is the default, not a variation: select it unless the brief gives a named reason to deviate, and log that reason (P.8).

## Key measurements

| Measure | Median |
|---|---|
| `median_whitespace_share` | 0.657 |
| `median_media_ratio` | 0.315 |
| `median_columns` | 2 |

## Evidence

17 annotated screens; 10 Mobbin citations in the frontmatter.
