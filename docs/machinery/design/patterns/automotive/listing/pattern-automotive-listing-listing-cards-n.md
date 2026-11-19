---
id: pattern-automotive-listing-listing-cards-n
type: pattern
site_types: [automotive]
page_types: [listing]
section_type: listing
speech_acts: [detail]
composition: cards-n
prevalence: 0.741
n: 27
evidence:
  - https://mobbin.com/sites/sections/fa0ef483-41dd-4128-b800-f21b45dcfa61?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/a59ca241-cbdc-446a-9886-e333b836c67c?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/c39270b0-f69d-4ab5-9991-b3669ee6ded0?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/d392aca5-101e-47c1-b92c-ba26646c4c7c?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/33d8d60d-8c8d-4907-8294-4692622909f4?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/164e0efa-206c-491f-911d-04e0a683c662?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/9001f871-6994-4cbe-af80-148520958ef7?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/c04a8d17-3379-4338-8fa2-2398faedf636?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/545d2af9-aff4-45de-af3f-1f5930f51ff0?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
  - https://mobbin.com/sites/sections/5623ef57-0aee-4706-807a-fdc78a1b4244?utm_source=other&utm_medium=ai-assistant&utm_source_platform=mcp
implies_rules: [V.1, V.3, W.2, W.3, W.5]
enforced_by: [check_emphasis, check_section_enums, check_segment_media, check_speech_acts, check_wireframe_tags]
consumes: [gene-image-led-ratio, gene-cta-restraint, gene-proof-type]
used_in: [w4, w5]
genotype:
  image-led-ratio: text-led
  cta-restraint: single-primary
  proof-type: none
links:
  index: patterns-index
  composition: section-catalog#cards-n
  used_in: [w4, w5]
---

# pattern-automotive-listing-listing-cards-n

Set the content as one measure-constrained prose column (≤65ch) — no cards. On automotive listing sections built for buyers comparing specification, hold imagery at `text-led`, CTA restraint `single-primary`. This signature appears in 74% of 27 annotated screens (image-led-ratio, cta-restraint, proof-type), so it is the default, not a variation: select it unless the brief gives a named reason to deviate, and log that reason (P.8).

## Key measurements

| Measure | Median |
|---|---|
| `median_whitespace_share` | 0.778 |
| `median_media_ratio` | 0 |
| `median_columns` | 3 |

## Evidence

27 annotated screens; 10 Mobbin citations in the frontmatter.
