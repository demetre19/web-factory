# Source study — facemedstore.com (2026-11-19)

**Astro v5.18.2** (`meta generator`, `astro:page-load`/`astro:load`
hooks, `data-astro-exec`) — e-commerce (Shopify checkout handoff,
Klaviyo, upPromote, Mangomint booking, tamdoma lens widget). **No
`*-vine` component, no SMIL, and essentially no motion at all** — the
static counter-example in the family.

## Motion inventory

| What | Finding |
|---|---|
| keyframes | `navBlink`, `spin`, `pulse` only — loader/pulse utility grade |
| running animations | **0** across home, `/shop`, category pages, after full scroll pass |
| transitions | hover states only (buttons, cards, nav) |
| svg | 51 — product/brand marks, none animated |
| JS animation | none — scripts are GTM/consent, Klaviyo stub, announce-bar dismiss, Astro loader, view-transition prep (`astro:before-preparation` delaying loader ~100ms) |

## Why it still reads "designed" (motion-adjacent)

The polish comes from restraint + layout, not motion: consistent card
rhythm, product photography, announce-bar. Where mdconsultingny spends
motion to feel authored, facemedstore spends **nothing** — worth
recording as the `motion-tier: static/subtle` datapoint: the same
agency-grade visual system ships fine without ambient loops on a
utility/shop surface (M.5 spirit: commerce = utility class).

## Taxonomy read

`motion_tier: static`; only `micro`-class hover transitions;
`js_dependency: none`; `personality: none/subtle`.
