# SOP — Iconography & Graphic Systems (source)

1.1 Five closed styles: Outline/Stroke, Solid/Filled, Duotone,
Hand-Drawn, 3D/Illustrated. Selection by brand attribute:
technical/minimal→outline; bold/playful/consumer→solid;
premium/editorial→duotone; artisan/creative→hand-drawn;
3D only for large hero/feature callouts ≥32px, banned in
transactional UI.
1.3 Single icon family per site — 100% one library (mixing
Feather+Material etc. forbidden).
1.4 Outline+solid never side-by-side EXCEPT active-state toggle
(outline rest → solid selected).

2.1 Stroke = icon size × 0.0833 (24px→2px). Classes: light 1.5px
(pairs 300–400 fonts), regular 2px default (400–500), bold
2.5–3px (600–700 or 16px micro).
2.2 Icon corner radius matches site personality: rounded systems →
linecap/linejoin round + 1.5–2px inner radius; sharp systems →
square/miter + 0px.
2.3 24×24 master grid, 20×20 live area, 2px outer margin; pixel/
half-pixel anchoring; keyline shapes (circle 20Ø, square 18, v-rect
16×20, h-rect 20×16).

3.1 Closed sizes {12,16,20,24,32,48}: 12 micro-dots, 16 dense/table,
20 default UI, 24 nav/buttons, 32 section headers, 48 hero/empty.
3.2 Icon size = text line-height (caption16→icon16, body16/lh24→
icon20–24, h24/lh32→icon32, h32/lh40→icon48).
3.3 Optical centering for asymmetric glyphs (play +1–2px toward
point, chevron +1px, ▼ +1px down).

4.1 Labels mandatory in info-dense/transactional UI; icon-only only
with universal glyphs + aria-label.
4.2 Horizontal icon-left = primary/nav/entity; icon-right =
directional/external/disclosure; icon-above only mobile bottom-nav,
collapsed sidebars, marketing cards.
4.3 Gap scale: 16px icon→4px; 20px→8px; 24px→8–12px; 32px→12–16px.
4.4 flex + align-items:center standard.

5.1 Approved libraries: Lucide (primary, 2px/24px), Heroicons
(Tailwind, 20/24 outline+solid), Phosphor (weight variants incl.
duotone), Feather (legacy minimal), custom SVG (proprietary only).
5.2 Custom only for proprietary domains/trademarks; must match
library grid/stroke/radius.
5.3 Coverage audit before adoption — missing glyphs authored custom,
never a second library.

6.1 Eight universal standalone glyphs: search, cart, hamburger,
close, notifications, profile, settings, help — still need
aria-label.
6.2 All others need labels or tooltips.
6.3 Literal function only — trash=delete, pencil=edit; metaphor
glyphs (rocket=submit) banned in transactional UI.
6.4 No decorative icons — every icon earns a functional role.
6.5 Raw unicode emoji banned in UI (renders inconsistently, breaks
stroke rules, screen-reader noise).

7.1 currentColor default.
7.2 Semantic tokens: icon-default/muted/action/action-hover/
on-action/disabled/success/warning/error/info.
7.3 States: hover color+bg shift; active scale(.95) 0.1s; focus 2px
ring +2px offset; disabled opacity .4.

8.1 QA gate (10): single family; style matches brand; no mixed
variants; size ∈ closed set; uniform stroke; gap ∈ {4,8,12,16};
labels where required; zero emoji; semantic color tokens; a11y
labels/hidden.
