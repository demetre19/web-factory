# Mobbin mining gap report

Source: public explore pages (`/explore/web`, `/explore/mobile`) — the
connected Mobbin MCP plan rejects `search_screens` (paid-plan wall), so the
mining script `tools/design-gate/mobbin_mine.py` scrapes the public grid
pages at 1440w. Re-run it per group (`elements-web`, `elements-ios`,
`screens-web`, `screens-ios`); it is idempotent.

## Coverage

| group | taxonomy | mined | exemplars |
|---|---|---|---|
| elements/web | 49 | 49 | 147 |
| elements/ios | 49 | 28 | 84 |
| screens/web | 22 | 20 | 60 |
| screens/ios | 22 | 22 | 63 |

## Honest gaps — mobbin taxonomy does not carry these

- **elements/ios (21 items, 404 on the mobile taxonomy)** — these are
  web/desktop elements with no mobile browse category: accordion-table,
  breadcrumbs, button-animation, checklist-design, combobox, context-menu,
  design-form, drag-and-drop-file-upload, dropdown-button, editable-text,
  file-upload, filter-panel-ui, link, modal-ui, navigation-menu,
  pagination, popover, rating-control, select, upgrade-button, ux-buttons.
  Their ios slots can be filled by vectorising the web exemplar or by the
  MCP search once a paid plan exists.
- **screens/web + screens/ios: `contact`** — no public contact screen
  category on mobbin (contact forms appear inside `design-form` elements).
- **screens/web: `welcome-get-started`** — mobile-only category; ios copy
  banked, web slot empty.

## Remaining work

- The Mobbin-group exemplars above are UNVECTORISED reference
  (spec.complexity = "unscored", topo fields null) — the vectorisation
  pass fills topology_id semantics, nesting_depth, direction_ratio etc.
- Kit spec→topo translation is COMPLETE: all 1,842 html-index exemplars
  across flowbite / preline / reui / shadcn / hyperui now carry
  `.topo.json` + tags rows (matched_topo + confidence vs bank
  signatures) — produced by `vectorise_html.py` in four batches
  (nav/interactive 169, form/feedback 398, data-display/elements 583,
  aggregates 692). `--census` reports zero missing topos.
- Licence: every spec marks `reference-only` — design study, not
  redistributable assets.
