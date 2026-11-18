# UI screenshot reverse-engineering prompt (W1 discovery + pattern annotation)

Operator-supplied prompt, ADAPTED to Web Factory golden rules. Use on the
client's current site, comparison/reference sites and Mobbin screens. Output
feeds DNA v0 (invariants: hex palette, grid, spacing) and the pattern-library
annotation schema — it never produces build code directly (code is produced
only at W6/W7 from the DNA map and section contracts).

## Adaptations vs the original (and why)

| Original | Web Factory | Reason |
|---|---|---|
| Next.js, `'use client'`, `layout.tsx`, `next.config.js` | Astro + Tailwind (`.astro` components, `@layer components`) | Golden rule: Astro is the goal, Tailwind non-negotiable |
| Lucide React | Lucide inline SVG (currentColor, sizes 16/20/24/32/48) | Icon rule; zero client JS by default |
| picsum.photos stock | Real client assets (T1) or briefed imagery via `PROMPT.md` | Imagery authenticity rules; no random stock |
| STEP 3 implementation | Dropped here — analysis only | Building happens in W6/W7 under gates |

## Prompt

```
STEP 1: ANALYZE THE IMAGE
Examine the screenshot thoroughly and identify: all visible UI components and
their relationships; navigation structure and hierarchy; layout patterns and
grid systems; data/proof elements (stats, logos, testimonials, tables); colour
scheme and design language; interactive elements and controls; imagery
(medium, mood, treatment).

STEP 2: ORGANIZE YOUR RESPONSE — use these exact sections:

<summary_title>
[Concise description of the page purpose and site type/vertical]
</summary_title>

<image_analysis>
1. Navigation Elements: [all nav components, positions, relationships; mobile nav pattern if visible]
2. Layout Components: [main containers with approximate px dimensions; max content width]
3. Content Sections: [each section in order: purpose (speech act), composition, density, surface]
4. Interactive Controls: [all CTAs/links/forms/disclosures with apparent function and rank]
5. Colors: [full palette with hex codes, mapped to roles: bg, surface, ink, ink-muted, accent, accent-fg, border]
6. Grid/Layout Structure: [column grid, gutters, section padding, in-section gaps — px values]
7. Typography: [families (or closest match), sizes per rank in px, weights, line-height, tracking, display:body ratio]
8. Imagery & Icons: [medium, treatment, aspect ratios, mood; icon style + size]
</image_analysis>

<design_extraction>
1. Invariants to carry (accent, logo, brand fonts, signature imagery)
2. Patterns observed (closest catalog compositions per section)
3. Strengths worth keeping / defects to fix (cite rule families T C L G S I V M R W E PS)
4. Responsive behaviour visible or implied (360 / 768 / 1280)
</design_extraction>

STEP 4: BE THOROUGH AND PRECISE
Exact pixel measurements where visible; every interactive element and state;
complete hex palette; accurate information architecture; desktop and mobile.

STEP 5: ENSURE COMPLETENESS
Cover ALL visible elements without omission.
```

All extracted values are `provenance: extracted` (measured) or `inferred`
(estimated), snapped to closed sets before entering DNA v0.
