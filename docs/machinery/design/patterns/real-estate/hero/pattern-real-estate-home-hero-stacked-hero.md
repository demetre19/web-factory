---
id: pattern-real-estate-home-hero-stacked-hero
type: pattern
site_types: [real-estate]
page_types: [home]
section_type: hero
speech_acts: [promise]
composition: stacked-hero
prevalence: 0.667
n: 12
evidence:
  - https://mobbin.com/sites/sections/04ec26fb-062e-4210-815d-08ef23fa0888?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/e1856408-e373-433e-9526-d30a58bc1f0e?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/0726ec3c-1c6a-4fb0-b434-88c3ec536a8f?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/cf6d2220-e176-4cdd-8fc7-69e50637802a?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/c669bc22-a34c-41d5-b505-a53db3911eba?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/e7f852d9-844a-4d5c-a92a-ca35a33a8459?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/acd5dcfc-c4b8-48af-bbe0-69d41446e1b7?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/bfdd6f6e-3296-4d9c-9041-413c0a935926?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/73866c07-0b02-47c5-9f8e-b680c9162da2?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/53edfd60-6dbf-435b-b50d-465e56622e72?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
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
  composition: section-catalog#stacked-hero
  used_in: [w4, w5]
---

# pattern-real-estate-home-hero-stacked-hero

Set the content as one measure-constrained prose column (≤65ch) — no cards. On real-estate hero sections built for buyers scanning inventory, hold disclosure `open`. This signature appears in 67% of 12 annotated screens (surface-rhythm, proof-type, disclosure-tier), so it is the default, not a variation: select it unless the brief gives a named reason to deviate, and log that reason (P.8).

## Key measurements

| Measure | Median |
|---|---|
| `median_whitespace_share` | 0.577 |
| `median_media_ratio` | 0.525 |
| `median_columns` | 2.0 |

## Evidence

12 annotated screens; 10 Mobbin citations in the frontmatter.
