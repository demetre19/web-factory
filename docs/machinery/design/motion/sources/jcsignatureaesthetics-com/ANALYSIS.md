# Source study — jcsignatureaesthetics.com (2026-11-19)

**WordPress + Bricks** — same build as drvaesthetics.com (Bricks theme,
AutomaticCSS, CleanTalk, Perfmatters, Splide). Not Astro; no `*-vine`
component, no SMIL, no bespoke animated SVG.

## Motion inventory

- **Bricks `data-interactions` entrance system**, identical mechanism
  to drvaesthetics (`enterView → startAnimation → brx-animate-*`):
  observed `animationType`s `fadeInUp`, `fadeInLeft`, `fadeInRight`,
  plus `contentLoaded/show`, `click/javascript`, `click/hide` (popups).
- animate.css keyframe library vendored (~90 names incl. elastic set —
  unused).
- **`floatingEstimator-*` / `calculator-*` keyframes**: a third-party
  booking/estimator widget with expand/collapse/slide-up sequences
  (`expandFromBottomLeft`, `slideUpFromBottom`, `fadeInBackground`…) —
  the liveliest motion on the site, and it's a chat-style widget, not
  section choreography.
- `splide-loading` — Splide carousel loader.
- 0 continuously-running design animations at audit time; entrances are
  one-shot.

## Taxonomy read

`trigger: in-view` + `click`, `technique: css-keyframes` (+widget
keyframes), `purpose: entrance` + `feedback` (estimator), `loop_type:
none`, `js_dependency: library` (Bricks runtime), `personality:
professional` (fades/slides only; the elastic library is loaded but
never invoked — the restraint is editorial, the capability is
accidental).
