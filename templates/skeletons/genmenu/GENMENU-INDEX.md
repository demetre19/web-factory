# GENMENU-INDEX — AI-Studio-generated exemplars

580 exemplars generated with Google AI Studio / Claude (operator-supplied
React + Tailwind sources), SSR-rendered to static open-state fragments and
vectorised by `tools/design-gate/genmenu_bank.py` (deterministic — no paid
calls).

| dir | class | exemplars | packs |
|---|---|---|---|
| `nav-dock-left-drawer/` | nav-dock-left-drawer | 20 | drawernav-pro |
| `nav-top-sheet/` | nav-top-sheet | 9 | menucraft-react |
| `nav-bottom-sheet/` | nav-bottom-sheet | 11 | menucraft-react |
| `nav-dropdown-menu/` | nav-dropdown-menu | 13 | navmenu-architect |
| `nav-mega-panel/` | nav-mega-panel | 7 | navmenu-architect |
| `nav-modal/` | nav-modal | 20 | modalnav-kit |
| `nav-breadcrumb/` | nav-breadcrumb | 9 | navcraft, wayfinding-atlas |
| `nav-command-palette/` | nav-command-palette | 1 | navcraft |
| `nav-menu/` | nav-menu | 4 | navcraft |
| `nav-micro/` | nav-micro | 7 | navcraft |
| `nav-pagination/` | nav-pagination | 2 | navcraft |
| `nav-tabs/` | nav-tabs | 4 | navcraft |
| `nav-tree/` | nav-tree | 1 | navcraft |
| `nav-anchor/` | nav-anchor | 1 | wayfinding-atlas |
| `wayfinding/` | wayfinding | 2 | wayfinding-atlas |
| `footer-mega/` | footer-mega | 33 | footercraft, footers |
| `footer-columns/` | footer-columns | 16 | footercraft, footers |
| `footer-minimal/` | footer-minimal | 11 | footercraft, footers |
| `pricing-tiers/` | pricing-tiers | 48 | pricing-atlas, pricing-sections |
| `pricing-single/` | pricing-single | 5 | pricing-atlas, pricing-sections |
| `pricing-table/` | pricing-table | 7 | pricing-atlas, pricing-sections |
| `auth-form/` | auth-form | 10 | patternfolio |
| `empty-state/` | empty-state | 10 | patternfolio |
| `modal-dialog/` | modal-dialog | 16 | modal-atlas |
| `modal-bottom-sheet/` | modal-bottom-sheet | 3 | modal-atlas |
| `modal-slide-over/` | modal-slide-over | 1 | modal-atlas |
| `ui-element/` | ui-element | 20 | ui-elements |
| `ui-toast/` | ui-toast | 14 | feedback-atlas |
| `ui-skeleton/` | ui-skeleton | 3 | feedback-atlas |
| `ui-consent/` | ui-consent | 2 | feedback-atlas |
| `ui-progress/` | ui-progress | 1 | feedback-atlas |
| `ui-tooltip/` | ui-tooltip | 5 | microcraft |
| `ui-popover/` | ui-popover | — | (sniffed under ui-micro) |
| `ui-menu/` | ui-menu | 6 | microcraft |
| `ui-micro/` | ui-micro | 9 | microcraft |
| `checkout/` | checkout | 21 | checkout-components, commerce-kit-20, commerce-atlas |
| `order-confirm/` | order-confirm | 10 | checkout-components, commerce-kit-20, commerce-atlas |
| `product-page/` | product-page | 9 | checkout-components, commerce-kit-20, commerce-atlas |
| `product-grid/` | product-grid | 3 | commerce-kit-20, commerce-atlas |
| `commerce-cart/` | commerce-cart | 7 | commerce-kit-20, commerce-atlas |
| `commerce-flow/` | commerce-flow | 10 | checkout-components, commerce-kit-20, commerce-atlas |
| `proof-testimonial/` | proof-testimonial | 5 | proofatlas |
| `proof-rating/` | proof-rating | 8 | proofatlas |
| `proof-logo-cloud/` | proof-logo-cloud | 3 | proofatlas |
| `proof-quote/` | proof-quote | 4 | proofatlas |
| `data-display/` | data-display | 11 | meridian-data-components |
| `data-grid/` | data-grid | 3 | meridian-data-components |
| `data-table/` | data-table | 15 | meridian-data-components, tabular |
| `data-table-expandable/` | data-table-expandable | 9 | tabular |
| `data-stepper/` | data-stepper | 11 | meridian-data-components, wayfinding-atlas |
| `hero-centered/` | hero-centered | 6 | hero-architecture |
| `hero-split/` | hero-split | 3 | hero-architecture |
| `hero-media-bg/` | hero-media-bg | 11 | hero-architecture |
| `card-block/` | card-block | 20 | folio-twenty |
| `form-block/` | form-block | 20 | formspecimen |
| `media-figure/` | media-figure | 16 | plate |
| `media-carousel/` | media-carousel | 2 | plate |
| `media-avatars/` | media-avatars | 1 | plate |
| `media-marquee/` | media-marquee | 1 | plate |
| `comparison-table/` | comparison-table | 14 | comparekit |
| `comparison-pros-cons/` | comparison-pros-cons | 3 | comparekit |
| `comparison-before-after/` | comparison-before-after | 2 | comparekit |
| `comparison-cards/` | comparison-cards | 1 | comparekit |
| `ui-control/` | ui-control | 12 | control-foundry |
| `ui-control-link/` | ui-control-link | 3 | control-foundry |
| `ui-control-group/` | ui-control-group | 2 | control-foundry |
| `ui-control-menu/` | ui-control-menu | 2 | control-foundry |
| `ui-control-states/` | ui-control-states | 1 | control-foundry |

Counts are per `tags.json` (580 rows). `nav-bottom-sheet` and `nav-top-sheet`
are NEW topology ids — web Mobbin returned no exemplars for these classes
(iOS-heavy classes). `footer-*`, `pricing-*`, `auth-form`, `empty-state`,
`modal-*`, `comparison-*`, `data-table-expandable`, `ui-*`, `nav-micro`,
`nav-breadcrumb`, `nav-tabs`, `nav-pagination`, `nav-tree`, `nav-menu`,
`nav-command-palette`, `nav-anchor`, `media-*` and `wayfinding` classes are
new to this corpus (generator families, distinct from the mobbin corpus
signatures).

## Per-exemplar files

- `<slug>.tsx` — original component source (provenance). Multi-component
  batch files are banked once per topology dir as `<pack>-src-<file>.tsx`
  and referenced by `component_source`.
- `<slug>.html` — SSR open-state fragment (canonical artifact; Tailwind classes)
- `<slug>.topo.json` — element_sig + semantic tree (same schema as mobbin)
- `<slug>.spec.json` — tags {section_class, topology_class, style[], category[],
  mode, platform}, matched_topo/confidence, is_new_topology

## Provenance

`source: google-ai-studio` in every spec. Operator-generated assets —
reference + emit-licensed by the operator (not scraped reference).

## Gaps

- `featured_image: null` — fragments are the canonical artifact; visual
  thumbnails can be captured later via the preview harness if needed.
- Sheets/dropdowns that animate in (motion/react) are captured in their
  final open state — transform/transition classes are preserved in the
  fragment but the SSR snapshot bakes the open state.
