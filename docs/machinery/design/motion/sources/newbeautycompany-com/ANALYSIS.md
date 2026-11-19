# Source study — newbeautycompany.com (2026-11-19)

**Astro** (`/_astro/` assets, `BaseLayout.astro_…js`) — med-spa clinic
site. No `*-vine` component, no SMIL. Motion is minimal and mostly
third-party.

## Motion inventory

| What | Finding |
|---|---|
| running animations | 2 — `openChat` on the Mangomint chat iframe (widget-provided), `fadeIn` on an embedded form (`animate-fade-in` class, form embed) |
| keyframes | `openChat`, `closeChat`, `pswp-clockwise` (PhotoSwipe lightbox), `autofill` — all vendor |
| transitions | hover/focus polish only: `background/color/border .3s`, `opacity/transform .2s`, `visibility` gating on dropdowns, `transform .4s` on cards |
| svg | 61 icons, none animated |
| marquee/ticker | none live (selector matched nothing animated) |
| js animation | none — scripts are FB Pixel, GTM/CallRail, Mangomint booking, BotPoison |

## Read

Same editorial posture as facemedstore but a clinic brochure instead of
a shop: **entrances aren't animated at all** — sections just render.
The only loops on the page belong to vendor widgets. For the family
study this is the second datapoint that the "designed" feel in this
portfolio comes from typography/spacing/photography — and that
mdconsultingny's vine system is a deliberate *upgrade*, not a
fleet-wide baseline.

## Taxonomy read

`motion_tier: subtle`; `trigger: load` (vendor widgets);
`js_dependency: library` (Mangomint); `personality: subtle`.
