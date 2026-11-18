# Image reverse-engineering prompt (W1 discovery)

Operator-supplied prompt. Run per image found on the client site and on
reference/comparison sites during W1 discovery. Two outputs per image:

1. **Classification** — the closed-vocabulary fields (medium, subject,
   sharpness, blur cause, lighting, palette, composition, camera estimate,
   mood, style/era, intent guess), each with confidence + evidence. Feeds
   DNA v0 (`provenance: inferred`, operator confirms at W1 exit).
2. **Photography Brief** — the operator's format below, used to brief a
   photographer or a permitted generation step for NEW imagery in the same
   style.

## Prompt (verbatim operator format)

```
Describe this image in detail.
Take the above description and make a prompt to recreate the photo, make it
photo realistic and with camera detail. It must be in a format similar to
below:

Photography Brief
Camera Settings
   •   Camera:
   •   Lens:
   •   Aperture:
   •   Shutter Speed:
   •   ISO:
   •   Format: in post
Lighting Setup

Composition

Subject Direction

Post-Processing

Mood

IMPORTANT: To the end of the prompt you must add
"IMPORTANT: Skin must be photorealistic and have real pores. There should be some photographic graininess."
```

## Safety limits (apply to both outputs)

- Never identify real people; never infer sensitive traits (age, ethnicity,
  health, religion). Describe people only by role/action ("cleaner mid-task").
- Describe style, never reproduce a specific copyrighted image 1:1.
- Generated people never stand in for real team members, clients or
  testimonials (rules/V authenticity: T1 first-party for team/proof).
- Results are `inferred` until the operator confirms them at W1 exit.
