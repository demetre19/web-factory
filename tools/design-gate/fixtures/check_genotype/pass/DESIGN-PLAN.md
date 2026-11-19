# DESIGN-PLAN — fixture site

```yaml
site:
  slug: fixture
  date: 2026-11-19
  design_mode: variants
  vertical: services
  attributes: [reliability, care]
  intent_choices:
    - {choice: imagery, allele: image-led}
    - {choice: image_style, allele: editorial, declared_deviation: {chosen: editorial, expected: ["other:ambiguous", corporate], reason: "brief asks for editorial warmth", copy_cite: "like an editorial feature, not a brochure"}}
  sources:
    - copy-contract: STUB.md
    - wireframe: cards/index.html#d1
  intent: {who: tenants, one_action: book, worst_case: lost bond}
  direction:
    temperature: warm
    density: regular
    finish: flat
    type_contrast: single-family-weight-contrast
    shape: p3
    motion: subtle
    refused: the generic default
  system:
    type:
      fonts: {display: "Inter", body: "Inter"}
      ranks: {body: {step: 0, weight: 400}}
    space:
      unit: 4px
      scale: [4, 8, 12, 16, 24, 32, 48, 64, 96, 128]
      section_densities: {compact: {py: space-4}, regular: {py: space-6}, spacious: {py: space-9}}
      group_gap_vs_section_gap: "≥2×"
    grid:
      measure: 62ch
      content_width: 80rem
      edge_padding: [16, 24, 32, 40, 48]
      breakpoints: [360, 640, 768, 1024, 1280, 1440, 1920]
      stack_order: text-first
    color:
      roles:
        bg: {value: "#FDFCFA"}
        surface: {value: "#F1EFEC"}
        ink: {value: "#221F1B"}
        ink_muted: {value: "#6F665D"}
        accent: {value: "#0055AA"}
        accent_foreground: {value: "#FFFFFF"}
        inverse: {value: "#1D2325"}
    contrast_axes: {heading_vs_body: size}
    icons: {family: lucide, style: outline, stroke_class: regular}
    media: {treatment: natural, authenticity: t1-first-party}
    copy: {cta_person: second, reading_level: "grade-8"}
  motif: {device: hairline-numeral, recurs_at: [steps], break: {where: end-act, how: inverse}}
burst: 2
dna:
  profile: profile-services
  genotype: {layout-archetype: split-media, page-macro-structure: promise-proof-how-act, density-tier: regular, image-led-ratio: balanced, type-contrast: medium, display-face: sans, radius-personality: soft, surface-rhythm: one-contrast-moment, cta-restraint: single-primary, cta-rank: hero, disclosure-tier: open, nav-pattern: bar-cta, motion-tier: subtle, proof-type: logos, media-treatment: photo, columns: "3", heading-form: claim, whitespace-band: medium, gallery-mode: grid, form-presence: inline, mood-energy: calm, mood-register: approachable, image-style: minimal, trend: none}
options:
  - {name: d1, wildcard: false, temperature: warm, shape: p3}
  - {name: d2, wildcard: false, temperature: cool, shape: p2}
  - {name: d3, wildcard: true, temperature: warm, shape: p4, mutates: [radius-personality, motion-tier]}
decisions:
  - {rule_id: L.3, what: hero runs edge-to-edge, why: one memorable fold, where: hero, compensating: inner measure kept at 62ch}
pages:
  home:
    page_class: money
    idea: A fixture page that proves the gates.
    rhetoric: [promise, proof, how, act]
    sections:
      - {name: nav, wf_ref: "cards/index.html#d1:nav", speech_act: [chrome], category: headers, surface: base, density: compact, composition: nav-bar, emphasis: nav, align: center-axis, stack: text-first, collapse: burger, media_ratio: none, disclosure: open, intent: chrome, refs: [mobbin-abc123]}
      - {name: hero, wf_ref: "cards/index.html#d1:hero", speech_act: [promise, act], category: hero, surface: base, density: spacious, composition: split-media, emphasis: headline, align: col-1-edge, stack: text-first, collapse: stacked, media_ratio: "16:9", disclosure: open, intent: hero, refs: [mobbin-abc124, mobbin-abc125]}
      - {name: macro, wf_ref: "cards/index.html#d1:macro", speech_act: [detail], category: content, surface: muted, density: regular, composition: cards-n, emphasis: answer, align: col-1-edge, stack: text-first, collapse: "2-col", media_ratio: none, disclosure: open, intent: definition, refs: [mobbin-def456, mobbin-def457], vector: [{heading: "What is testing?", fs: "Testing is the thing."}]}
      - {name: proof, wf_ref: "cards/index.html#d1:proof", speech_act: [proof], category: logo-sections, surface: base, density: compact, composition: logo-wall, emphasis: headline, align: col-1-edge, stack: text-first, collapse: stacked, media_ratio: none, disclosure: open}
      - {name: answers, wf_ref: "cards/index.html#d1:answers", speech_act: [objection], category: content, surface: base, density: regular, composition: faq, emphasis: headline, align: col-1-edge, stack: text-first, collapse: stacked, media_ratio: none, disclosure: open}
      - {name: how, wf_ref: "cards/index.html#d1:how", speech_act: [how], category: how-it-works, surface: muted, density: regular, composition: sequence, emphasis: headline, align: col-1-edge, stack: text-first, collapse: stacked, media_ratio: none, disclosure: open}
      - {name: objections, wf_ref: "cards/index.html#d1:objections", speech_act: [objection], category: content, surface: base, density: regular, composition: faq, emphasis: headline, align: col-1-edge, stack: text-first, collapse: stacked, media_ratio: none, disclosure: open}
      - {name: end-act, wf_ref: "cards/index.html#d1:end-act", speech_act: [act], category: contact, surface: inverse, density: spacious, composition: form-panel, emphasis: form, align: col-1-edge, stack: text-first, collapse: stacked, media_ratio: none, disclosure: open, intent: cta, refs: [mobbin-abc123]}
      - {name: footer, wf_ref: "cards/index.html#d1:footer", speech_act: [chrome], category: footer, surface: base, density: compact, composition: footer-bar, emphasis: columns, align: center-axis, stack: text-first, collapse: "1-col", media_ratio: none, disclosure: open, intent: chrome, refs: [mobbin-def456]}
```
