# DESIGN-PLAN — fixture site

```yaml
site:
  slug: fixture
  date: 2026-11-19
  design_mode: variants
  sources:
    - copy-contract: STUB.md
    - wireframe: cards/index.html#d1
  intent: {who: tenants, one_action: book, worst_case: lost bond}
  direction:
    temperature: warm
    density: balanced
    finish: flat
    type_contrast: single-family-weight-contrast
    shape: p3-friendly
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
      content_width: 72rem
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
  genotype: {layout-archetype: split-media, page-macro-structure: promise-proof-how-act, density-tier: regular, image-led-ratio: balanced, type-contrast: medium, display-face: sans, radius-personality: soft, surface-rhythm: one-contrast-moment, cta-restraint: single-primary, cta-rank: hero, disclosure-tier: open, nav-pattern: bar-cta, motion-tier: subtle, proof-type: logos, media-treatment: photo, columns: "3", heading-form: claim, whitespace-band: medium, gallery-mode: grid, form-presence: inline, mood-energy: calm, mood-register: approachable, image-style: minimal}
options:
  - {name: d1, wildcard: false, temperature: warm, shape: p3-friendly}
  - {name: d2, wildcard: false, temperature: cool, shape: p2-subtle}
  - {name: d3, wildcard: true, temperature: warm, shape: p4-playful, mutates: [radius-personality, motion-tier]}
decisions:
  - {rule_id: L.3, what: hero runs edge-to-edge, why: one memorable fold, where: hero, compensating: inner measure kept at 62ch}
pages:
  home:
    page_class: money
    idea: A fixture page that proves the gates.
    rhetoric: [promise, proof, how, act]
    sections:
      - {name: nav, wf_ref: "cards/index.html#d1:nav", speech_act: [chrome], category: headers, surface: base, density: compact, composition: nav-bar, emphasis: nav, align: center-axis, stack: text-first, collapse: burger, media_ratio: none, disclosure: open}
      - {name: hero-x, wf_ref: "cards/index.html#d9:nope", speech_act: [promise, act], category: hero, surface: base, density: spacious, composition: split-media, emphasis: headline, align: col-1-edge, stack: text-first, collapse: stacked, media_ratio: "16:9", disclosure: open}
      - {name: macro, wf_ref: "cards/index.html#d1:macro", speech_act: [detail], category: content, surface: muted, density: regular, composition: cards-n, emphasis: answer, align: col-1-edge, stack: text-first, collapse: "2-col", media_ratio: none, disclosure: open, vector: [{heading: "What is testing?", fs: "Testing is the thing."}]}
      - {name: end-act, wf_ref: "cards/index.html#d1:end-act", speech_act: [act], category: contact, surface: inverse, density: spacious, composition: form-panel, emphasis: form, align: col-1-edge, stack: text-first, collapse: stacked, media_ratio: none, disclosure: open}
      - {name: footer, wf_ref: "cards/index.html#d1:footer", speech_act: [chrome], category: footer, surface: base, density: compact, composition: footer-bar, emphasis: columns, align: center-axis, stack: text-first, collapse: "1-col", media_ratio: none, disclosure: open}
```
