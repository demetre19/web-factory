# GENMENU-INDEX — AI-Studio-generated navigation exemplars

80 navigation exemplars generated with Google AI Studio (operator-supplied
React + Tailwind sources), SSR-rendered to static open-state fragments and
vectorised by `tools/design-gate/genmenu_bank.py` (deterministic — no paid
calls).

| dir | class | exemplars | packs |
|---|---|---|---|
| `nav-dock-left-drawer/` | nav-dock-left-drawer | 20 | drawernav-pro |
| `nav-top-sheet/` | nav-top-sheet | ~15 | menucraft-react |
| `nav-bottom-sheet/` | nav-bottom-sheet | ~5 | menucraft-react |
| `nav-dropdown-menu/` | nav-dropdown-menu | ~14 | navmenu-architect |
| `nav-mega-panel/` | nav-mega-panel | ~6 | navmenu-architect |
| `nav-modal/` | nav-modal | 20 | modalnav-kit |

Counts are per `tags.json` (80 rows). `nav-bottom-sheet` and `nav-top-sheet`
are NEW topology ids — web Mobbin returned no exemplars for these classes
(iOS-heavy classes).

## Per-exemplar files

- `<slug>.tsx` — original component source (provenance)
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
