# GENMENU-INDEX — AI-Studio-generated exemplars

280 exemplars generated with Google AI Studio / Claude (operator-supplied
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
| `checkout/` | checkout | 10 | checkout-components |
| `order-confirm/` | order-confirm | 5 | checkout-components |
| `product-page/` | product-page | 2 | checkout-components |
| `commerce-flow/` | commerce-flow | 3 | checkout-components |

Counts are per `tags.json` (280 rows). `nav-bottom-sheet` and `nav-top-sheet`
are NEW topology ids — web Mobbin returned no exemplars for these classes
(iOS-heavy classes). `footer-*`, `pricing-*`, `auth-form`, `empty-state` and
`modal-*` classes are new to this corpus (generator families, distinct from
the mobbin corpus signatures).

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
