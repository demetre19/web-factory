# Gerstner style proof — extraction & diff report

Single-theme proof that we captured Gerstner's *style*, not just its layout.

- Source: https://lexingtonthemes.com/viewports/gerstner → `https://gerstner.lexdemos.com/` (public demo, no paywall touched)
- Proof page: `index.html` (self-contained: embedded CSS + Switzer woff2 + generated grayscale imagery)
- Spec: `gerstner-style-spec.json` (every extracted value with its source)
- Side-by-sides: `screenshots/sbs_{hero,band,list}.png` — real on top, ours below; `real_index.png` vs `mine_full.png` for the full pages.

## Method & honesty note

The live demo iframe is behind Cloudflare WAF: headless Playwright and the
session browser both get `Your request was blocked`. The site itself is plain
static Astro output, so the real HTML, the compiled Tailwind-v4 stylesheet
(`BaseLayout.Bc0D0Wvq.css`), the fonts and the images were fetched directly
and **rendered locally under Playwright** — all "computed" values below are
measured on the real markup with the real CSS and real fonts, not guessed.
Pages crawled: `/`, `about`, `admissions`, `apply`, `blog(+post)`, `campus-life`,
`contact`, `events(+detail)`, `faculties(+detail)`, `programmes(+detail)`,
`research(+detail)`, `team`, `visit`, `sign-in`, `system/overview`.
(`system/colors|typography|buttons|links|forms|shaders` 404 on the live demo —
the system surface is a single `/system/overview` page.)

## Extracted spec → match status

| Spec item | Gerstner value | Proof page | Match |
|---|---|---|---|
| Font family | Switzer (self-hosted woff2, weights 300/400/500/700) | same files, same weights | ✅ |
| Display H1 | 128px / 1.0, w700, −0.05em, UPPERCASE, `text-box: trim-both cap alphabetic` (measured −6.4px tracking, 87px cap-height box) | identical computed values | ✅ |
| Section wordmarks | text-9xl, cropped/overflowing below fold, `trim-caps` | `.display`, `.giant` same treatment | ✅ |
| Pull quote | ~60px w700 UPPERCASE −0.05em, trim-caps | `.quote` identical treatment | ✅ |
| (PARENTHESIZED) labels | 12px/500 UPPERCASE, `(NN) NAME` / `(LABEL)` convention | `.label` + `(01) Bachelor` indexing | ✅ |
| Meta pairs | 12px UPPERCASE, muted key + foreground value | `.meta` + `.v` identical | ✅ |
| Nav links | 12px/500 UPPERCASE, hover → opacity-70 | identical | ✅ |
| Body text | 14px/400, muted-foreground, `text-wrap:pretty` | identical | ✅ |
| Programme card title | 20px/300 (light) UPPERCASE −0.025em | identical | ✅ |
| Palette | pure monochrome: bg #FFF, fg/primary oklch(20.5%)≈#1B1B1B, muted #F4F4F3, muted-fg #757575, border #DFDFDF | same hex set | ✅ |
| Primary button | pill 9999px, h-9 (36px), px-6, 14px/500, #1B1B1B bg / #FFF text, hover bg-primary/90 | identical computed | ✅ |
| Secondary button | same geometry, bg #F4F4F3, hover #DFDFDF | identical | ✅ |
| Filter tabs | h-8 text-xs pill, `aria-pressed` flips to primary | identical | ✅ |
| Focus | outline-2 offset-4 ring | identical | ✅ |
| Header | sticky, h-16, bg-background | identical | ✅ |
| Grid | 12-col, gap-x-4 (16px), container max 1600px, gutters px-4/sm-6/lg-8 | identical | ✅ |
| Section rhythm | alternating white / near-black full-bleed bands, min-h-svh hero & quote | identical | ✅ |
| Imagery | `filter: grayscale(1)` on every photo | identical | ✅ |
| Block-collage | offset image blocks with a page-colour square knocked out of a corner | reproduced (3 cells, varied knockout corners + aspects) | ✅* |
| Dark quote band | plain #1B1B1B, grayscale portrait left, stats + trimmed quote right | identical layout | ✅ |
| Shader band | WebGL grain gradient canvas, e.g. `#020a3a→#0038ff→#00c8ff→#b8f0ff` | approximated with layered CSS radial gradients + noise in the same palette | ⚠ approximation — no WebGL, not animated |
| Scroll/motion | Lenis smooth scroll, colour-reveal on images, shader fades in | static page — no motion | ⚠ not reproduced (out of scope for style proof) |
| Search overlay | borderless dialog, underline input at text-7xl uppercase | not reproduced | n/a |

\* collage geometry is hand-tuned; exact per-cell offsets vary on the real page.

## What did *not* carry over

- **WebGL shader**: ours is a static CSS approximation of the 4-colour grain gradient — same palette and placement, none of the animated grain.
- **Lenis smooth scroll / motion choreography**: deliberately left out; the proof is a static page.
- **Wordmark sizing**: the real footer wordmark is text-9xl (128px); we cap `.giant` at the same 128px rather than a viewport-scaled size.
