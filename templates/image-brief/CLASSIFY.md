# Universal image classifier (W1 discovery, any image type)

Classifies ANY image: photographs, illustrations, hand drawings, 3D, flat
colour / graphic design, patterns, type-only graphics, UI screenshots,
collage. One vision call per image returns the JSON below. Every field
carries `confidence` (0–1) and short `evidence`. Closed vocabularies only
(pick from the lists; `other:<word>` allowed only with evidence). Results are
`provenance: inferred` until the operator confirms at W1 exit; they feed
DNA v0 imagery + mood targets. Safety limits from `PROMPT.md` apply.

## 1. What it is

| Field | Values |
|---|---|
| `medium` | photograph · illustration · hand-drawn sketch · painting (watercolour/oil/gouache) · vector graphic · flat colour design · 3D render · isometric · pixel art · collage · pattern/texture · typography-only · UI screenshot · infographic/chart · mixed media · AI-generated (likely) |
| `subject` | free text, role-level only (no identities) |
| `subject_class` | people · product · place/architecture · interior · vehicle · food · nature/landscape · animal · abstract · object still-life · document/screen · text/lettering |
| `role_on_page` | hero · supporting · proof · decoration · background texture · icon/spot illustration · logo/brand mark |

## 2. Technical (photo and render)

| Field | Values |
|---|---|
| `sharpness` | crisp · sharp · soft · blurred · heavily blurred |
| `blur_cause` | none · motion (subject moving) · panning (background streak) · shallow depth of field (bokeh) · atmospheric (fog/haze) · intentional dreamy · camera shake · low quality / upscaled |
| `grain_noise` | clean · fine grain · heavy grain · digital noise |
| `exposure` | low-key (dark) · balanced · high-key (bright) · over/under-exposed |
| `contrast` | low · medium · high · crushed blacks |
| `saturation` | monochrome · desaturated · natural · vivid · neon |
| `colour_temperature` | cool · neutral · warm · mixed |
| `lighting` | natural daylight · golden hour · blue hour · overcast · studio softbox · hard flash · window light · neon/practical · backlit/rim · low-key dramatic |
| `camera_estimate` | ultra-wide · wide · normal · short telephoto · telephoto · macro · aerial/drone · fisheye |
| `quality` | professional · prosumer · amateur · stock-generic |

## 3. Technical (drawn / graphic / flat)

| Field | Values |
|---|---|
| `line` | none · hairline · uniform · variable/brush · sketchy · bold outline |
| `fill` | flat solid · gradient · halftone · textured/grain · hatched · painterly |
| `shading` | none · cel/flat shadow · soft gradient · realistic · stippled |
| `shapes` | geometric · organic · mixed · hand-cut |
| `palette_size` | 1–2 · 3–4 · 5–7 · 8+ |
| `perspective` | flat 2D · isometric · one-point · three-point · none |
| `detail_level` | minimal · moderate · intricate |

## 4. Composition

| Field | Values |
|---|---|
| `framing` | extreme close-up · close-up · medium · full · wide · establishing |
| `layout` | centred · rule of thirds · symmetrical · diagonal · leading lines · frame-within-frame · pattern/repeat · scattered |
| `negative_space` | none · some · generous · dominant |
| `depth` | flat · layered · deep |
| `motion_vector` | none · left→right · right→left · upward · downward · toward viewer · away |
| `text_safe_area` | none · left · right · top · bottom · centre (where copy can sit) |
| `aspect_ratio` | measured, snapped to closed set (21:9 16:9 4:3 3:2 1:1 4:5 3:4 9:16 2:1) |

## 5. Emotional dimensions (bipolar scales, −2 … +2)

Score each axis; 0 = neutral.

| Axis (−2 ↔ +2) |
|---|
| sad ↔ happy |
| calm ↔ energetic |
| slow ↔ fast |
| still ↔ dynamic |
| cold ↔ warm |
| serious ↔ playful |
| tense ↔ relaxed |
| somber ↔ hopeful |
| subtle ↔ bold |
| accessible ↔ luxurious |
| distant ↔ intimate |
| aloof ↔ inviting |
| chaotic ↔ ordered |
| organic ↔ synthetic |
| nostalgic ↔ modern / futuristic |
| raw ↔ polished |
| quiet ↔ loud |
| safe/trustworthy ↔ edgy/provocative |
| feminine ↔ masculine coded (descriptive of styling only) |
| childlike ↔ grown-up |

## 6. Emotion tags (pick 1–3)

joy · excitement · calm · serenity · awe · trust · confidence · pride ·
warmth/belonging · romance · nostalgia · curiosity · humour · surprise ·
determination · urgency · tension · melancholy · loneliness · mystery ·
fear · anger · disgust (flag) · relief · freedom · care

## 7. Style

| Field | Values |
|---|---|
| `style` | minimal · maximal · editorial · documentary · lifestyle · corporate · luxury/fashion · street · brutalist · Swiss/international · retro (50s–90s) · Y2K · art deco · Bauhaus · Memphis · flat design · corporate-Memphis · line art · isometric tech · claymorphism/3D soft · glassmorphism · cyberpunk/neon · grunge · vintage print · Scandinavian · Japanese/wabi-sabi · cartoon · anime/manga · children's book · scientific/technical |
| `era_feel` | timeless · contemporary · retro · futuristic |
| `brand_register` | budget · mainstream · premium · luxury |
| `authenticity_tier` | T1 first-party · T2 editorial stock · T3 AI · T4 illustrated kit (rules/V) |

## 8. Intent (why it was made this way)

| Field | Content |
|---|---|
| `intended_audience` | inferred audience (role/age-band only, e.g. "families with young children") |
| `brand_attributes_served` | 1–3 (e.g. speed, reliability, fun, craft, care, exclusivity) |
| `choice→reason` | 1–3 pairs, e.g. `{choice: "motion blur", reason: "conveys speed of the car"}`, `{choice: "saturated primaries", reason: "toy brand, child audience"}` |
| `convention_vs_deliberate` | conventional for the vertical · deliberate deviation · likely accidental (low quality) |

## Output JSON (per image)

```json
{
  "image": "<url or path>",
  "medium": {"value": "photograph", "confidence": 0.97, "evidence": "lens bokeh, natural skin texture"},
  "subject": {"value": "cleaner wiping a glass partition", "confidence": 0.9},
  "technical": {"sharpness": "...", "blur_cause": "...", "lighting": "...", "...": "..."},
  "graphic": {"line": "...", "fill": "...", "...": "..."},
  "composition": {"framing": "...", "layout": "...", "text_safe_area": "left", "aspect_ratio": "3:2"},
  "emotion_axes": {"sad_happy": 1, "calm_energetic": 0, "slow_fast": -1, "...": 0},
  "emotion_tags": ["trust", "care"],
  "style": {"style": "documentary", "era_feel": "contemporary", "brand_register": "mainstream", "authenticity_tier": "T1"},
  "intent": {"intended_audience": "...", "brand_attributes_served": ["reliability"], "choice_reason": [{"choice": "...", "reason": "..."}], "convention_vs_deliberate": "conventional"}
}
```

Set-level summary (for DNA v0): dominant medium, mean emotion axes,
top emotion tags, dominant style, consistency score (how uniform the set is),
outliers.
