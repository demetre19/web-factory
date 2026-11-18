# SOP — Responsive Breakpoints, Container Geometry & Content Density (source)

Note: two docs merged — a Framer-style mechanics doc (desktop-first,
sizing modes) and SOP-DES-005 (numeric spec). Where they conflict,
SOP-DES-005 wins for our factory: it has closed numbers; mobile-first
CSS authoring is our rule (Tailwind convention).

1. Breakpoints (closed set of 7): xs 360 (small mobile), sm 640
(large mobile), md 768 (tablet), lg 1024 (small laptop), xl 1280
(desktop), 2xl 1440 (max content), 3xl 1920 (ultra-wide canvas).
Arbitrary px queries banned. Mobile-first min-width authoring;
max-width degradation banned.

2. Per-breakpoint behavior: <640 single-col+drawer+bottom-sheets;
640–767 2-col micro-grids, margin 16→24; 768–1023 2-col splits,
centered modals 560px; 1024–1279 horizontal nav, 3-col grids,
persistent sidebars; 1280–1439 4-col grids, full type scale;
1440+ content clamps at 1440px, margins auto; 1920+ canvas bleeds,
container fixed.

3. Container geometry: max_width 1440px ceiling; edge padding
16(xs)→24(sm/md)→32(lg)→40(xl)→48(2xl+); grid gap
16(xs/sm)→24(md/lg)→32(xl+); columns 4(xs)→8(sm/md)→12(lg+).

4. Collapse rules: cards-4 → 4(xl+)→3(lg)→2(md)→1(<768);
cards-3 → 3(lg+)→2(md)→1(<768); split-media 2-col ≥1024,
stacked <1024.
Stack order: TEXT FIRST on mobile by default (headline before
media); visual-first ONLY for product-UI-hook sections, declared
explicitly.

5. Copy density budgets (hard caps):
Hero: H1 4–8 words/≤60ch; subhead 12–25w/≤160ch; CTA 2–4w/≤25ch
nowrap.
Feature card: title 2–5w/≤35ch; desc 15–30w/≤200ch ≤4 lines.
Section: eyebrow 1–3w/≤20ch; H2 3–7w/≤50ch; para 15–35w/≤240ch.
Prose: 40–80w/≤500ch, 45–75ch measure.
Lists: 5–15w/≤100ch, 3–7 items.
Page classes: money 150–250 words/viewport (cards, not prose);
article 400–600 + subhead/quote/card every 250–300 words;
utility labels 1–3w, tooltips ≤15w, tables paginate 8–12 rows.
Scannability: never >250 words uninterrupted — must break with
H2/H3, card grid, callout, image, or hr.

6. Above-fold mandate (360×640 mobile / 1440×900 desktop): nav,
H1, subhead, CTA, visual anchor — all visible without scroll.
CTA cadence: ≤2 viewports between CTAs; every money page ends
with terminal CTA.
Attention decay: fold1 <50 words; folds2–3 peak density (grids,
proof); folds4–5 accordions/comparisons/case; fold6+ offload —
content >300 words moves to subpage via summary card (15–30w +
"Read more →"). Max ~6 viewports/page.

7. Touch: 44×44 iOS / 48×48 Android minimum, 8px insulation buffer
between targets; desktop pointer ≥32×32 (40 preferred).
Hover: all :hover wrapped in @media(hover:hover) and
(pointer:fine) — sticky-touch bug guard; touch gap 12–16px vs
pointer 8px.

Framer-mechanics concepts worth keeping (sizing modes): Fixed px
only icons/avatars/logos; Fill width + Fit-content height for
section containers; Relative inside stacks; Absolute only badges/
decoration; Fixed viewport-anchored nav/CTA; sticky for section
headers. (Our CSS equivalent: position/flex/grid — keep the
assignment rules.)

8. QA (10): breakpoints ∈ closed set; min-width only; 1440 ceiling;
edge padding per scale; collapse steps exact; text-first stack
declared; copy budgets met; >250w subdivided; targets ≥44/48 +8px;
hover gated by media query.
