---
id: comp-flyout-nav
type: component-profile
links:
  index: design-index
  see_also: [section-catalog, BASE.ACSS, rules-REF, comp-nav-bar]
  used_in: [w3, w5, w6, w7]
---

# flyout-nav — component profile (ACSS baseline)

| Field | Value |
|---|---|
| heading | logo text, no rank |
| body | — |
| padding | block 12–16px |
| gaps | --space-s bar row; --space-xs inside `.nav-group` |
| radius | — |
| media | logo ≤48px |
| CTA | 1 secondary max (`.nav-cta`; docks into the open panel foot) |
| width | full-bleed |
| states | burger, scroll-shrink, flyout open (scrim) |
| mobile | `.nav-desk` row collapses to burger → `.nav-links.nav-flyout` sheet: fixed panel, scrim, `.nav-close`, `.nav-group` link sections |
| intent | chrome |

The mobile menu is ALWAYS the flyout surface (N.flyout, P.13) —
never a dropdown list. Canon-cited where n≥10 (MOBBIN-REFS);
guideline-derived otherwise. Overrides happen by redefining
`--card-*`/`--section-*` tokens — never by literals (A.2).
