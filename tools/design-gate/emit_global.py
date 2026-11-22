#!/usr/bin/env python3
"""emit_global.py — deterministic emit producers for a pipeline's
global artifacts. ONE machinery: these are the canonical writers;
gen_fixtures imports the same recipes so fixture output and pipeline
output can never drift.

  tokens_json(dna)      → the gate's TOKENS.json shape
                          {knobs, color:{modes:{light,dark}.roles}}
  tokens_from_dna(dna)  → DNA.json → TOKENS record (derives knobs/modes
                          via dna_tokens when the map lacks them)
  tailwind_config(tok)  → site/tailwind.config.js text: darkMode +
                          colors/fontSize/borderRadius/spacing + every
                          TOKENS hex inlined
  global_css(tok, fonts) → site/src/styles/global.css text: @tailwind
                          headers + DNA @font-face + emit_tokens five
                          layers (light :root default, dark only under
                          [data-theme=dark]) + GLOBAL_CSS_TAIL (@layer
                          components, .sec-band, [data-surface] scope
                          hooks, reduced-motion, text-wrap, --input-*)
  site_assets(page_dir, site) → copies the site folder's assets/fonts,
                          assets/media, assets/logo.svg into site/public/

pipeline_emit.py is the only caller for real pipelines; gen_fixtures
calls global_css() verbatim (the recipe moved here from its
module-private _global_css).
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

import emit_tokens  # noqa: E402
import clamp  # noqa: E402

# The component layer appended below the emit_tokens five TK layers.
# Historically gen_fixtures.GLOBAL_CSS_TAIL — moved here so it is real
# machinery, not fixture scaffolding. Every class a gold exemplar or
# the Section shell binds that Tailwind does not generate lives here.
GLOBAL_CSS_TAIL = '''
h1, h2, h3, h4, h5, h6, p, ul, ol, li, figure, blockquote { margin: 0; }

:root {
  --text-wrap-heading: balance;
  --text-wrap-body: pretty;
  /* prose rhythm: consecutive paragraphs breathe at a small rung —
     binding content-gap makes every paragraph read as its own block */
  --flow-spacing: var(--space-xs);
  /* ACSS list vocab (U.10): markers' indent and item rhythm bind the
     spacing scale — no list-* tokens are emitted by clamp */
  --list-indent-spacing: var(--space-l);
  --list-spacing: var(--list-item-spacing);

  /* ACSS names only (U.10). The ACSS size family (--text-*, --h1..6,
     --space-*, --section-space-*, --gutter, --grid-gap, --content-gap,
     --container-gap, --btn-padding-*, --radius) is emitted by
     emit_tokens from clamp.py on the DNA fluid settings; this block
     only binds the component utility layer to it — never copies.
     --fs-N is a pure alias (clamp.FS_MAP), not a second scale. */
@@FS_ALIASES@@
  --lh--1: 1.5;
  --lh-0: 1.6;
  --lh-1: 1.5;
  --lh-2: 1.35;
  --lh-3: 1.25;
  --lh-4: 1.2;
  --lh-5: 1.15;
  --grid-min: var(--primitive-grid-min);
  --content-width: 80rem;
  --content-width-safe: min(var(--content-width),
                            calc(100% - var(--gutter) * 2));
  /* --measure is emitted by emit_tokens (clamp.aliases — it tracks
     type.base so families differ on line length too) */
  --r-card: var(--primitive-radius);
  --tap: 3rem;
  --font-display: var(--primitive-font-display);
  --font-body: var(--primitive-font-body);
  --input-border: var(--border-default);
  --input-py: 0.5em;
  --input-px: 0.75em;
  --input-radius: var(--r-card);
  /* legacy aliases — components bind semantic names only (TK.3) */
  --c-ink: var(--text-primary);
  --c-paper: var(--bg-canvas);
  --c-line: var(--border-default);
}
h1, h2 { text-wrap: var(--text-wrap-heading); }
p { text-wrap: var(--text-wrap-body); }
img { object-fit: cover; }
input { border: 1px solid var(--input-border); padding: var(--input-py) var(--input-px); border-radius: var(--input-radius); }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 150ms !important;
    transition: opacity 150ms linear !important;
    transform: none !important;
  }
}

[data-theme=dark] {
  --c-ink: var(--text-primary);
  --c-paper: var(--bg-canvas);
  --c-line: var(--border-default);
}

@layer components {
  /* fluid utilities — the exemplars' spacing/type vocabulary; the
     names match TAIL_UTIL, the VALUES come from the rungs, so P.2
     must find real rules here, not rely on the prefix regex. */
  .text-fluid--1 { font-size: var(--fs--1); }
  .text-fluid-0 { font-size: var(--fs-0); }
  .text-fluid-1 { font-size: var(--fs-1); }
  .text-fluid-2 { font-size: var(--fs-2); }
  .text-fluid-3 { font-size: var(--fs-3); }
  .text-fluid-4 { font-size: var(--fs-4); }
  .mt-stack { margin-block-start: var(--content-gap); }
  /* prose paragraphs ride the small flow rung — mt-stack's
     content-gap turns every paragraph into a separate block */
  .mt-flow { margin-block-start: var(--flow-spacing); }
  .flow > * + * { margin-block-start: var(--flow-spacing); }
  /* a content container that directly follows a prose block (the
     intro column or a paragraph) separates at the content rung —
     without it the lead-in line sits flush against the first card
     row ('text touching divs'). Elements that already carry their
     own stack/flow margin keep it. */
  :is(.intro, p) + :not(p, .mt-stack, .mt-flow) {
      margin-block-start: var(--content-gap); }
  .mt-fluid-s { margin-block-start: var(--space-s); }
  .mt-fluid-m { margin-block-start: var(--space-m); }
  .mt-fluid-l { margin-block-start: var(--space-l); }
  .pt-fluid-m { padding-block-start: var(--space-m); }
  .pb-fluid-s { padding-block-end: var(--space-s); }
  .p-fluid-s { padding: var(--space-s); }
  .p-fluid-m { padding: var(--space-m); }
  .gap-stack { gap: var(--grid-gap); }
  .gap-fluid-s { gap: var(--space-s); }
  .gap-fluid-m { gap: var(--space-m); }
  .gap-fluid-l { gap: var(--space-l); }
  .sec-band { padding-block: var(--sec-pad, var(--section-space-m));
              background: var(--sec-bg, var(--bg-canvas));
              color: var(--sec-fg, var(--text-primary)); }
  /* the measure box owns the page gutter: without it a 390px phone
     renders text flush to the bezel */
  .sec-inner { max-width: var(--content-width); margin-inline: auto;
               padding-inline: var(--gutter); }
  /* a bank skeleton that ships its own measure box must not double
     the gutter inside the shell's .sec-inner — the shell owns it
     (SB.2). One measure, one gutter, every section. */
  .sec-inner .sec-inner { max-width: none; margin-inline: 0;
                          padding-inline: 0; }
  /* L.15 — a media-split grid whose media never bound collapses to
     one column. The lone child keeps the measure's col-1 edge (the
     plan's align allele): centring it would be a bespoke axis no
     contract declares. */
  [class*="container"]:has(> :only-child) { grid-template-columns: 1fr; }
  /* G.floor — vertical container rhythm is machinery law, not
     per-skeleton accident. Two inert-gap defect classes in the bank:
     a *-container whose skeleton declares row-gap but leaves display
     unset renders children touching (row-gap is inert on block), and
     a display:flex row container that gained injected prose squeezes
     it between head and collection columns. A bare *-container is a
     vertical flow (grid activates the authored row-gap; any skeleton
     display:flex/grid declaration still wins on specificity), and a
     flex container holding a .flow child stacks vertically. */
  [class*="container"] { display: grid; }
  [class*="container"][class*="container"]:has(> .flow) {
      flex-direction: column; }
  /* chrome is a bar: nav/footer get rhythm, never a section's padding */
  .sec-bar { padding-block: var(--space-xs);
             background: var(--sec-bg, var(--bg-canvas));
             color: var(--sec-fg, var(--text-primary)); }
  /* a footer bar holds columns + a legal rule: it needs air above the
     last band and below the legal line, not the nav's slim strip */
  footer.sec-bar { padding-block: var(--space-xl) var(--space-l); }
  /* G.5 canon — every collection grid is auto-fit on the rung-bound
     card floor, never a fixed repeat(N). G.8 — a declared columns
     allele (data-cols=N) is a CAP: the track floor rises to an N-th
     of the row, so wide rows hold exactly N and narrow rows still
     collapse on the readable floor. */
  .grid-auto { display: grid; grid-auto-rows: 1fr;
      gap: var(--grid-gap);
      --grid-floor: var(--grid-min); --grid-cap: 99;
      grid-template-columns: repeat(auto-fit, minmax(min(max(
        var(--grid-floor),
        calc((100% - (var(--grid-cap) - 1) * var(--grid-gap))
             / var(--grid-cap))), 100%), 1fr)); }
  [data-cols] .grid-auto { --grid-floor: 15rem; }
  [data-cols="2"] .grid-auto { --grid-cap: 2; }
  [data-cols="3"] .grid-auto { --grid-cap: 3; }
  [data-cols="4"] .grid-auto { --grid-cap: 4; }
  /* G.8 on bank collections: a section's declared columns cap rides
     the same floor/cap locals the .grid-auto canon uses — a bank
     -grid-ul / -list grid tightens to exactly N tracks instead of
     spilling a lone orphan onto a partial row */
  [data-cols] [class*="-grid-ul"], [data-cols] [class*="-list"],
  [data-cols] ul[class*="grid"] { --grid-floor: 15rem; }
  [data-cols="2"] [class*="-grid-ul"], [data-cols="2"] [class*="-list"],
  [data-cols="2"] ul[class*="grid"] { --grid-cap: 2; }
  [data-cols="3"] [class*="-grid-ul"], [data-cols="3"] [class*="-list"],
  [data-cols="3"] ul[class*="grid"] { --grid-cap: 3; }
  [data-cols="4"] [class*="-grid-ul"], [data-cols="4"] [class*="-list"],
  [data-cols="4"] ul[class*="grid"] { --grid-cap: 4; }
  /* grid gaps are GLOBAL: any bank grid list inherits the token's
     --grid-gap as the floor. A bank rule that names its own gap still
     wins (same layer, later source) until the translator stops
     emitting spacing — the floor only catches silence, which today
     renders as cards touching. */
  [class*="-grid-ul"], [class*="-grid"], ul[class*="grid"] {
      gap: var(--grid-gap); }
  /* wrapped-sibling floor (smart spacing): a container of wrapped
     elements — cards/panels/tiles/collection items — always resolves
     a nonzero --elements-gap. Prose is exempt by selector scope:
     .flow paragraphs and .list-items text runs bind --flow-spacing
     margins only, never a sibling gap. */
  [class*="-cards"], [class*="-tiles"], [class*="-panels"],
  .card-grid, ul.list-plain,
  [class*="-items"]:not(.list-items) { gap: var(--elements-gap); }
  /* logo-wall: a row of marks at one optical height — client artwork
     keeps its colours, the row sets scale and rhythm */
  .logo-row { display: flex; flex-wrap: wrap; align-items: center;
              justify-content: flex-start; gap: var(--space-l); }
  /* client artwork is drawn for a light ground: each mark sits on a
     plate — elevated paper in light, the light ink tone in dark — so
     a navy or red mark never sinks into a dark band */
  .logo-row .brand-logo { --logo-h: 2.5rem;
      padding: var(--space-xs) var(--space-s);
      border-radius: var(--r-card); background: var(--bg-elevated);
      border: 1px solid var(--border-default); }
  [data-theme=dark] .logo-row .brand-logo { background: var(--text-primary); }
  @media (min-width: 48rem) {
    .split > .logo-row { justify-content: flex-end; } }
  /* layout primitives — ACSS's row/stack/card vocabulary, bound to
     the rungs so every composition spaces from the same scale */
  .row { display: flex; flex-wrap: wrap; align-items: center;
         gap: var(--space-m); }
  .between { justify-content: space-between; }
  .stack { display: flex; flex-direction: column; gap: var(--space-s); }
  .card { background: var(--bg-surface);
          border: 1px solid var(--border-default);
          border-radius: var(--r-card); padding: var(--space-m);
          box-shadow: var(--shadow-card); }
  /* brand mark — the inlined SVG scales to the bar height via the
     token layer, never an arbitrary-value utility on the element.
     ACSS has no logo token (U.10): the height binds --space-l, the
     spacing scale's matching rung. */
  .brand-logo { display: inline-flex; align-items: center; }
  .brand-logo > svg, .brand-logo > img { height: var(--logo-h,
      var(--space-l)); width: auto; display: block; }
  .ratio-portrait { aspect-ratio: 3 / 4; }
  .ratio-16-9 { aspect-ratio: 16 / 9; }
  .ratio-21-9 { aspect-ratio: 21 / 9; }
  .ratio-4-3 { aspect-ratio: 4 / 3; }
  .ratio-1-1 { aspect-ratio: 1 / 1; }
  /* declared media ratios bind via data-ratio on the media wrapper —
     the attr is contract data, not a computed class */
  .media-round[data-ratio="16:9"] { aspect-ratio: 16 / 9; }
  .media-round[data-ratio="21:9"] { aspect-ratio: 21 / 9; }
  .media-round[data-ratio="4:3"] { aspect-ratio: 4 / 3; }
  .media-round[data-ratio="1:1"] { aspect-ratio: 1 / 1; }
  .media-round[data-ratio="3:4"] { aspect-ratio: 3 / 4; }
  .media-round[data-ratio="3:2"] { aspect-ratio: 3 / 2; }
  .media-round[data-ratio="2:3"] { aspect-ratio: 2 / 3; }
  .media-round[data-ratio="9:16"] { aspect-ratio: 9 / 16; }
  .media-round > img, .media-round > picture img {
    width: 100%; height: 100%; object-fit: cover; }
  /* media-backed band — a skeleton's background figure (.media-bg)
     covers its whole section band edge-to-edge behind the content,
     the authored full-bleed treatment. The band gains the stacking
     context; the figure sits at z -1 so every in-flow sibling paints
     above it; a token-bound scrim keeps copy contrast honest in
     both modes. */
  .sec-band:has(.media-bg) { position: relative;
      overflow: hidden; }
  .media-bg { position: absolute; inset: 0; z-index: -1;
      overflow: hidden; }
  .media-bg > img { width: 100%; height: 100%; object-fit: cover;
      object-position: center; display: block; }
  .media-bg::after { content: ""; position: absolute; inset: 0;
      background: color-mix(in srgb, var(--bg-canvas) 76%,
      transparent); }
  /* a plan image may name its subject edge (image.focus) — the cover
     crop keeps that edge instead of the centre */
  .media-round[data-focus="left"] > img { object-position: 0% 50%; }
  .media-round[data-focus="right"] > img { object-position: 100% 50%; }
  .media-round[data-focus="top"] > img { object-position: 50% 0%; }
  .media-round[data-focus="bottom"] > img { object-position: 50% 100%; }
  /* a technical panel stands in for media the build has no photograph
     for: the declared ornament, drawn from tokens, in both modes */
  .media-panel { aspect-ratio: 4 / 5; border-radius: var(--r-card);
      border: 1px solid var(--border-default);
      background-color: color-mix(in srgb, var(--action-primary) 5%,
                                  var(--bg-surface));
      background-image:
        linear-gradient(to right,
          color-mix(in srgb, var(--action-primary) 14%, transparent) 1px,
          transparent 1px),
        linear-gradient(to bottom,
          color-mix(in srgb, var(--action-primary) 14%, transparent) 1px,
          transparent 1px);
      background-size: 48px 48px;
      position: relative; overflow: hidden; }
  .media-panel { max-height: 22rem; }
  @media (min-width: 48rem) { .media-panel { max-height: none; } }
  .media-panel::after { content: ""; position: absolute;
      inset: 12%; border: 1px solid
        color-mix(in srgb, var(--action-primary) 22%, transparent);
      border-radius: calc(var(--r-card) / 2); }
  /* a ratio box owns its media subtree, not only a direct <img>:
     bank figures wrap media-round, so the declared size must reach
     through to the raster */
  .ratio-portrait > *, .ratio-phone > * { width: 100%; height: 100%; }
  .ratio-portrait img, .ratio-phone img { width: 100%; height: 100%;
                                          object-fit: cover; }
  /* the contract's declared data-ratio on the media wrapper owns the
     shape — a heuristic ratio on the bank figure must never fight it
     (a 3/4 box around a 4/3 image leaves dead space below the media) */
  .ratio-portrait:has(> [data-ratio]),
  .ratio-phone:has(> [data-ratio]),
  .ratio-16-9:has(> [data-ratio]),
  .ratio-21-9:has(> [data-ratio]),
  .ratio-4-3:has(> [data-ratio]),
  .ratio-1-1:has(> [data-ratio]),
  .ratio-3-2:has(> [data-ratio]),
  .ratio-2-3:has(> [data-ratio]),
  .ratio-9-16:has(> [data-ratio]) { aspect-ratio: auto; }
  .ratio-phone { aspect-ratio: 9 / 19; }
  .variant-stage { container-type: inline-size; }
  .variant-switcher { position: sticky; top: 0; }
  .btn-primary { min-height: var(--tap); }
  .inverse { background: var(--c-ink); color: var(--c-paper); }
  .fold-row { border-top: 1px solid var(--c-line); }
  .card-grid { display: grid; gap: var(--grid-gap); }
  .btn-primary:hover { filter: brightness(1.08); }
  .btn-primary:focus-visible { outline: 2px solid var(--c-ink); outline-offset: 2px; }
  .btn-primary:disabled { opacity: .5; }
  .skip-link { position: absolute; left: -9999px; }
  .skip-link:focus { left: var(--space-xs); }
  .logo { font-weight: 700; }
  .helper { font-size: var(--text-s); }
  .wf-cta-button { display: inline-flex;
                   align-items: center; justify-content: center;
                   text-align: center;
                   padding: var(--btn-padding-block) var(--btn-padding-inline);
                   border-radius: var(--r-card);
                   background: var(--action-primary);
                   color: var(--action-primary-ink);
                   font-weight: 600; text-decoration: none;
                   white-space: nowrap;
                   min-height: var(--tap); }
  /* burger IS the mobile nav trigger: an icon button top-right,
     visible below the nav breakpoint, hidden where .nav-links flows
     inline (R.1 mobile-first). It is a quiet icon — never a second
     primary CTA in the bar. */
  .burger { display: inline-flex; min-height: var(--tap);
            min-width: var(--tap); align-items: center;
            justify-content: center;
            background: var(--bg-surface); color: var(--text-primary);
            border: 1px solid var(--border-default);
            border-radius: var(--r-card); font-size: var(--fs-1);
            font-weight: 600; cursor: pointer; }
  .row.between { position: relative; }
  /* the open mobile menu is a flyout sheet, not a dropdown: a
     right-side panel over a scrim, a close control, vertical links,
     and the header CTA docked at the panel's foot (N.flyout) */
  .nav-links.open { display: flex; flex-direction: column;
            gap: var(--space-l);
            position: fixed; inset-block: 0; inset-inline-end: 0;
            width: min(20rem, 85vw);
            z-index: calc(var(--primitive-z-sticky) + 1);
            background: var(--bg-canvas); padding: var(--space-m);
            padding-block-start: var(--space-xs);
            border-inline-start: 1px solid var(--border-default);
            box-shadow: var(--shadow-pop); overflow-y: auto; }
  .nav-links.open ul { flex-direction: column; flex-wrap: nowrap;
            align-items: flex-start; gap: var(--space-xs); }
  .nav-links.open .nav-link { font-size: var(--fs-1);
            white-space: normal; }
  .nav-close { display: none; }
  .nav-links.open .nav-close { display: inline-flex;
            align-self: flex-end; min-height: var(--tap);
            min-width: var(--tap); align-items: center;
            justify-content: center; background: none; border: 0;
            color: var(--text-secondary); font-size: var(--fs-2);
            line-height: 1; cursor: pointer; }
  body:has(.nav-links.open)::after { content: ""; position: fixed;
            inset: 0; background: color-mix(in oklch,
                var(--text-primary) 45%, transparent);
            z-index: var(--primitive-z-sticky); }
  body:has(.nav-links.open) .nav-cta { display: block;
            position: fixed; inset-inline-end: 0; inset-block-end: 0;
            width: min(20rem, 85vw); margin: 0;
            z-index: calc(var(--primitive-z-sticky) + 1);
            padding: var(--space-m); background: var(--bg-canvas);
            border-inline-start: 1px solid var(--border-default); }
  body:has(.nav-links.open) .nav-cta .wf-cta-button,
  body:has(.nav-links.open) .nav-cta { display: block; }
  body:has(.nav-links.open) .nav-cta > .wf-cta-button {
            display: flex; justify-content: center; }
  /* header CTA: below the nav breakpoint it rides inside the flyout;
     burger, links and CTA share one breakpoint (60rem — the
     .nav-links one below) or a dead zone opens where the header
     shows brand alone */
  .nav-cta { display: none; }
  @media (min-width: 60rem) {
    .burger { display: none; }
    .nav-cta { display: inline-block; }
  }
  /* ---- composition vocabulary ------------------------------- */
  .flow-list { list-style: none; padding: 0; }
  .num-prom { font-size: var(--fs-1); }
  /* the section head: eyebrow, claim, lede - one measure, one gap */
  .sec-head { display: flex; flex-direction: column;
              gap: var(--space-s); max-width: 46rem; }
  .sec-head.center { align-items: center; text-align: center;
                     margin-inline: auto; }
  .eyebrow { font-size: var(--fs--1); font-weight: 600;
             letter-spacing: .1em; text-transform: uppercase;
             color: var(--action-primary); }
  .lede { font-size: var(--fs-1); line-height: 1.5;
          color: var(--text-secondary); max-width: var(--measure); }
  .card { display: flex; flex-direction: column;
          gap: var(--space-s); }
  /* the chip opens a card — a bank DOM that lists it last still
     renders icon-above-title, the global card order */
  .card > .icon-chip { order: -1; }
  /* text lists keep markers — Tailwind preflight strips ul/ol
     styling; indent + item rhythm bind the ACSS list tokens */
  ul.list-items { list-style: disc; }
  ol.list-items { list-style: decimal; }
  .list-items { padding-inline-start: var(--list-indent-spacing); }
  .list-items > li + li { margin-block-start: var(--list-spacing); }
  /* copy links: inline() emits classless <a>; preflight strips the
     underline, so bind the accent treatment here (classed anchors —
     nav/cta/buttons — keep their own look) */
  main a:not([class]) { color: var(--action-primary);
      text-decoration: underline;
      text-underline-offset: 0.15em; }
  :is([data-surface="brand"], [data-surface="inverse"])
      main a:not([class]),
  :is([data-surface="brand"], [data-surface="inverse"])
      a:not([class]) { color: var(--sec-fg); }
  .surface-muted .card { background: var(--bg-canvas); }
  .surface-inverse .card { background: color-mix(in srgb,
      var(--bg-inverse) 80%, var(--text-inverse)); }
  /* image-top card media: the figure bleeds to the card edge and
     crops on the rung ratio; icon chips sit above the title in the
     same surface ink the card uses */
  .card-media { margin: calc(var(--space-m) * -1)
                  calc(var(--space-m) * -1) var(--space-s);
      border-radius: var(--r-card) var(--r-card) 0 0; overflow: hidden;
      aspect-ratio: 3 / 2; }
  .card-media > img, .card-media > picture img {
      width: 100%; height: 100%; object-fit: cover; }
  .icon-chip { display: inline-grid; place-items: center;
      width: var(--tap); height: var(--tap);
      border-radius: 999px;
      background: color-mix(in srgb, var(--action-primary) 10%,
                            var(--bg-canvas));
      color: var(--action-primary); }
  .icon-chip > svg { width: 50%; height: 50%; }
  [data-surface="brand"] .icon-chip {
      background: color-mix(in srgb, var(--sec-fg) 16%, transparent);
      color: var(--sec-fg); }
  /* ratings + attributions: a star row binds the accent, the name row
     carries a small avatar and a source line */
  .stars { display: inline-flex; gap: calc(var(--space-xs) / 8);
      color: var(--action-primary); }
  .stars svg { width: 1em; height: 1em; }
  .star-off { opacity: 0.35; }
  .quote-foot { display: flex; gap: var(--space-s); align-items: center;
      margin-block-start: var(--space-s); }
  .avatar { width: var(--tap); height: var(--tap); border-radius: 999px;
      object-fit: cover; }
  .num { font-size: var(--fs--1); font-weight: 600;
              letter-spacing: .14em; font-variant-numeric: tabular-nums;
              color: var(--action-primary); }
  .sub-h { font-size: var(--h4); font-weight: 600;
                line-height: 1.25; letter-spacing: -.01em; }
  .sub-p { font-size: var(--fs-0); line-height: 1.55;
               color: var(--text-secondary); }
  /* R.9 — below tablet every in-flow CTA goes full-width stacked
     (the .call-bar does the same for the phone action). The 767px
     media value is the check's own breakpoint vocabulary — a px
     bound, not a sizing declaration. */
  @media (max-width: 767px) {
    .cta-row .wf-cta-button, .stack .wf-cta-button,
    .split .wf-cta-button, form .wf-cta-button,
    .max-w-prose .wf-cta-button {
      display: flex; justify-content: center; align-items: center;
      width: 100%; min-height: var(--tap); }
  }
  .quote { font-size: var(--fs-1); line-height: 1.45;
                letter-spacing: -.01em; }
  .attrib { font-size: var(--fs--1); color: var(--text-secondary);
              letter-spacing: .02em; }
  .rule { height: 1px; background: var(--border-default);
          border: 0; margin: 0; }
  .flow-list { display: flex; flex-direction: column;
               gap: var(--space-xs); }
  .flow-row { display: grid; grid-template-columns: 4rem 1fr;
              gap: var(--space-m); padding-block: var(--space-m);
              border-top: 1px solid var(--border-default);
              align-items: start; }
  .flow-row > dt, .flow-row > dd { grid-column: 2; }
  .flow-row:not(:has(> .icon-chip)) > dt,
  .flow-row:not(:has(> .icon-chip)) > dd { grid-column: 1 / -1; }
  .flow-row:last-child { border-bottom: 1px solid
                         var(--border-default); }
  .split { display: grid; gap: var(--space-l);
           grid-template-columns: 1fr; align-items: center; }
  @media (min-width: 48rem) {
    .split { grid-template-columns: 1.05fr 1fr; }
    .split.media-first { grid-template-columns: 1fr 1.05fr; }
  }
  .cta-row { display: flex; flex-wrap: wrap; gap: var(--space-s);
             align-items: center; }
  .link-quiet { color: var(--text-secondary); text-decoration: none;
                font-size: var(--fs-0); }
  .link-quiet:hover { color: var(--text-primary); }
  .nav-links { display: none; gap: var(--space-s);
               align-items: center; flex: 0 1 auto; min-width: 0; }
  .nav-links ul { flex-wrap: nowrap; gap: var(--space-s); }
  /* the desktop bar shows the group's links inline — the wrapper
     only materialises as a titled stack inside the open drawer */
  .nav-links .nav-group { display: contents; }
  /* the brand mark and the primary links hold one line — a nav that
     wraps reads as two bars (L.1 axis); links shrink to --fs--1 so a
     long label list still fits between brand and CTA. The whole bar
     stays one row at every width: brand ellipsises under pressure,
     the burger pins to its lane's far end, nothing wraps (H.1) */
  .bm-header-1__brand, .brand-mark, .logo { white-space: nowrap;
              overflow: hidden; text-overflow: ellipsis; }
  .row.between:has(.nav-links), .row.between:has(.burger),
  .row.between:has(.nav-desk) { flex-wrap: nowrap; }
  .row.between:has(.burger) > * { min-width: 0; }
  div:has(> .burger), div:has(> .nav-links + .burger),
  div:has(> .nav-desk + .burger) { display: flex;
              align-items: center; }
  .burger { flex: 0 0 auto; margin-inline-start: auto; }
  .nav-links, .nav-desk { flex-shrink: 1; min-width: 0;
              overflow: hidden; }
  /* 4 full-length labels can't fit under ~60rem — the burger takes
     over below that instead of overflowing the page */
  @media (min-width: 60rem) { .nav-links { display: flex; } }
  /* a flyout nav splits the two .nav-links roles: .nav-desk is the
     desktop link row (hidden under the burger breakpoint); the
     .nav-flyout panel is the ONLY nav-links — hidden at every width
     until .open, so it never doubles as a second desktop row
     (N.flyout) */
  .nav-desk { display: none; gap: var(--space-s);
              align-items: center; flex: 0 1 auto; min-width: 0; }
  .nav-desk ul { flex-wrap: nowrap; gap: var(--space-s); }
  .nav-links.nav-flyout { display: none; }
  .nav-links.open.nav-flyout { display: flex; }
  @media (min-width: 60rem) { .nav-desk { display: flex; } }
  /* grouped link sections inside the open panel: a titled stack of
     rows separated by hairlines, reading as sections not a bare
     list (N.flyout) */
  .nav-links.open .nav-group { display: flex; flex-direction: column;
              align-items: stretch; gap: var(--space-xs);
              width: 100%; }
  .nav-links.open .nav-group ul { width: 100%; }
  .nav-links.open .nav-group + .nav-group,
  .nav-links.open .nav-group + * { padding-block-start: var(--space-s);
              border-block-start: 1px solid var(--border-default); }
  .nav-links.open .nav-group a { font-size: var(--fs-1);
              white-space: normal; color: var(--text-primary);
              text-decoration: none; display: inline-flex;
              align-items: center; gap: var(--space-s); }
  /* drawer furniture — search, group heads, row numerals — exists
     only inside the open flyout; the desktop bar stays brand + links
     + CTA (N.flyout) */
  .nav-search, .nav-group-head, .nav-num { display: none; }
  .nav-links.open .nav-search { display: block; }
  .nav-links.open .nav-search-input { width: 100%;
              padding: var(--space-xs) var(--space-s);
              font: inherit; color: var(--text-primary);
              background: var(--bg-elevated);
              border: 1px solid var(--border-default);
              border-radius: var(--r-card); }
  .nav-links.open .nav-group-head { display: block;
              font-size: var(--fs--1); letter-spacing: .08em;
              text-transform: uppercase;
              color: var(--text-secondary); margin: 0 0 var(--space-xs); }
  .nav-links.open .nav-num { display: inline;
              margin-inline-start: auto;
              font-size: var(--fs--1);
              color: var(--text-secondary); font-variant-numeric:
              tabular-nums; }
  .nav-links.open .nav-link { display: flex; width: 100%;
              align-items: center; gap: var(--space-s);
              padding-block: var(--space-xs);
              border-block-end: 1px solid var(--border-default); }
  /* nav selection (N.select): >6 links switch to the hybrid —
     .nav-priority keeps the first four inline on desktop, the full
     set opens behind a quiet "More" trigger as a wider .nav-mega
     panel whose links group into columns. Below the bar breakpoint
     the burger still owns the drawer (the panel just widens). */
  .nav-links .nav-mega-cols { display: contents; }
  .nav-links.open .nav-mega-cols { display: grid;
              grid-template-columns: repeat(auto-fit,
                  minmax(13rem, 1fr));
              gap: var(--space-m) var(--space-l); width: 100%; }
  .nav-links.open.nav-mega { width: min(46rem, 94vw); }
  .nav-priority { display: none; }
  .nav-more { display: none; align-items: center;
              min-height: var(--tap); background: none; border: 0;
              padding: 0; font: inherit;
              color: var(--text-secondary); cursor: pointer; }
  .nav-more:hover { color: var(--text-primary); }
  @media (min-width: 60rem) {
    .nav-priority { display: flex; gap: var(--space-s);
              align-items: center; flex: 0 1 auto; min-width: 0; }
    .nav-priority ul { flex-wrap: nowrap; gap: var(--space-s); }
    .nav-more { display: inline-flex; }
    /* a mega nav never unrolls inline — the priority row + More own
       the desktop bar; the panel still opens as a flyout */
    .nav-links.nav-mega { display: none; }
    .nav-links.nav-mega.open { display: flex; }
  }
  /* the generic overlay family — modals, popups, form dialogs
     (N.flyout): a centred .flyout panel over the same scrim, a
     .flyout-open trigger in flow, a .flyout-close affordance */
  .flyout { display: none; }
  .flyout.open { display: flex; flex-direction: column;
              gap: var(--space-m); position: fixed;
              inset-block-start: 50%; inset-inline-start: 50%;
              transform: translate(-50%, -50%);
              width: min(28rem, calc(100vw - 2 * var(--gutter)));
              max-height: 85vh; overflow-y: auto;
              z-index: calc(var(--primitive-z-sticky) + 1);
              background: var(--bg-canvas); color: var(--text-primary);
              padding: var(--space-m);
              border: 1px solid var(--border-default);
              border-radius: var(--r-card);
              box-shadow: var(--shadow-pop); }
  .flyout-open { display: inline-flex; min-height: var(--tap);
              min-width: var(--tap); align-items: center;
              justify-content: center;
              background: var(--bg-surface); color: var(--text-primary);
              border: 1px solid var(--border-default);
              border-radius: var(--r-card); font-size: var(--fs-1);
              font-weight: 600; cursor: pointer; }
  .flyout-open.wf-cta-button { border: 0;
              background: var(--action-primary);
              color: var(--action-primary-ink); }
  .flyout-close { display: inline-flex; align-self: flex-end;
              min-height: var(--tap); min-width: var(--tap);
              align-items: center; justify-content: center;
              background: none; border: 0;
              color: var(--text-secondary); font-size: var(--fs-2);
              line-height: 1; cursor: pointer; }
  body:has(.flyout.open)::after { content: ""; position: fixed;
              inset: 0; background: color-mix(in oklch,
                  var(--text-primary) 45%, transparent);
              z-index: var(--primitive-z-sticky); }
  .wf-cta-button { font-size: var(--fs--1); }
  /* the mobile call action is a compact floating button, not a bar
     that slices across mid-scroll content: a brand pill bottom-right
     with the elevation pop (R.fab) */
  .call-bar { display: flex; gap: var(--space-s); align-items: center;
      justify-content: center;
      position: fixed; inset-block-end: var(--space-s);
      inset-inline: auto var(--space-s);
      z-index: var(--primitive-z-sticky);
      border-radius: 999px; min-height: var(--tap);
      padding: var(--space-xs) var(--space-m);
      background: var(--action-primary); color: var(--action-primary-ink);
      font-weight: 600; text-decoration: none;
      box-shadow: var(--shadow-pop); }
  /* the floating button reserves bottom room so it never sits on
     content — the theme toggle lives in the nav bar, never floating */
  body { padding-block-end: calc(var(--tap) + var(--space-m)); }
  @media (min-width: 48rem) {
    .wf-cta-button { font-size: inherit; }
    .call-bar { display: none; }
    body { padding-block-end: 0; } }
  .nav-link { color: var(--text-secondary); text-decoration: none;
              font-size: var(--fs--1); font-weight: 500;
              /* one line per link — a link that wraps reads as two
                 nav bars even when the ul itself cannot wrap */
              white-space: nowrap; }
  .nav-link:hover { color: var(--text-primary); }
  .brand-mark { font-weight: 650; letter-spacing: -.02em;
                font-size: var(--fs-1); color: var(--text-primary);
                text-decoration: none; }
  .faq-item { border-top: 1px solid var(--border-default); }
  .faq-item:last-child { border-bottom: 1px solid
                         var(--border-default); }
  .faq-q { display: flex; justify-content: space-between;
           align-items: center; gap: var(--space-m);
           padding-block: var(--space-m); cursor: pointer;
           font-size: var(--fs-1); font-weight: 600;
           list-style: none; }
  .faq-q::-webkit-details-marker { display: none; }
  .faq-q::after { content: "+"; font-size: var(--fs-2);
                  font-weight: 400; color: var(--text-secondary);
                  line-height: 1; }
  .faq-item[open] .faq-q::after { content: "-"; }
  .faq-a { padding-block-end: var(--space-m); max-width: var(--measure);
           color: var(--text-secondary); font-size: var(--fs-0);
           line-height: 1.6; }
  /* footer items left-align on mobile — centred link columns read
     unanchored below the fold (R.11). The container distributes
     groups; items inside them hug the start edge. */
  @media (max-width: 44rem) {
    .footer-column-mid, .footer-menu, .footer-column-right {
        align-items: flex-start; }
    .footer-menu { justify-content: flex-start; }
    .wf-footer-1 .footer-1-container { justify-items: start; }
  }
  .form-grid { display: grid; gap: var(--space-s);
               grid-template-columns: 1fr; }
  @media (min-width: 30rem) { .form-grid { grid-template-columns:
                                           1fr 1fr; } }
  .field { display: flex; flex-direction: column; gap: var(--space-xs); }
  .field > span { font-size: var(--fs--1); font-weight: 600;
                  letter-spacing: .06em; text-transform: uppercase;
                  color: var(--text-secondary); }
  .field input, .field select { font: inherit; font-size: var(--fs-0);
      padding: var(--input-py) var(--input-px); border-radius: var(--r-card);
      border: 1px solid var(--border-default);
      background: var(--bg-canvas); color: var(--text-primary);
      min-height: var(--tap); }
  .field input:focus, .field select:focus {
      outline: 2px solid var(--action-primary);
      outline-offset: 1px; border-color: transparent; }
  .foot-cols { display: grid; gap: var(--space-l);
               grid-template-columns: 1fr; }
  @media (min-width: 48rem) { .foot-cols {
      grid-template-columns: 2fr 1fr 1fr; } }
  .foot-col { display: flex; flex-direction: column;
              gap: var(--space-s); }
  .foot-head { font-size: var(--fs--1); font-weight: 600;
               letter-spacing: .1em; text-transform: uppercase;
               color: var(--text-secondary); }
  .legal { font-size: var(--fs--1); color: var(--text-secondary);
           display: flex; flex-wrap: wrap; gap: var(--space-m);
           justify-content: space-between;
           padding-block-start: var(--space-m);
           border-top: 1px solid var(--border-default); }
  /* ---- zero-margin type: component text never inherits the UA
     margin; rhythm comes from gap and stack tokens only */
  .t0 { margin: 0; }
  .h-display { line-height: 1.02; letter-spacing: -0.025em; }
  .h-section { line-height: 1.1; letter-spacing: -0.02em; }
  .list-plain { list-style: none; padding: 0; }
  .mt-sec { margin-block-start: var(--space-l); }
  .mt-act { margin-block-start: var(--space-s); }
  .gap-form { gap: var(--space-m); }
  /* a stack stretches its children; the large CTA keeps its own width */
  .cta-large { font-size: var(--fs-1);
               padding: var(--btn-padding-block) var(--btn-padding-inline);
               align-self: start; }
  .btn-block { width: 100%; border: 0; cursor: pointer; }
  .bar-min { min-height: 2.5rem; }
  .media-round { border-radius: var(--r-card); overflow: hidden; }
  .media-hero { aspect-ratio: 1 / 1; max-width: 30rem;
                justify-self: end; width: 100%; }
  .sub-flow { margin: var(--space-xs) 0 0; }
  .measure-28 { max-width: 28ch; }
  /* G cutout-media: a background-removed object floats on the
     section surface — contain, no frame, no radius, the shadow is
     a drop-shadow (follows the alpha edge) bound to the elevation
     rung so it composites in light + dark alike. The placeholder
     holds the same slot until the cutout stage delivers a PNG. */
  .cutout-slot { display: flex; align-items: center;
                 justify-content: center; min-width: 0; }
  .cutout { object-fit: contain; max-height: 100%;
            width: auto; height: auto; max-width: 100%;
            filter: drop-shadow(0 var(--space-xs) var(--space-s)
                    color-mix(in oklch, var(--text-primary) 28%,
                              transparent)); }
  .cta-band .cutout { max-height: 18rem; }
  .cutout-ph { aspect-ratio: 1 / 1; width: 100%; max-width: 24rem;
               display: grid; place-items: center;
               border: 1px dashed var(--border-default);
               border-radius: var(--r-card);
               background: var(--bg-elevated);
               color: var(--text-secondary);
               font-size: var(--fs--1); }
  .cutout-card .cutout-ph { max-width: 100%; }
  /* surface/density classes are the shell's rhythm signature — the
     L.14/L.7 gate reads them off the built <section> tag. */
  .surface-base { --sec-bg: var(--bg-canvas); --sec-fg: var(--text-primary); }
  .surface-muted { --sec-bg: var(--bg-surface); --sec-fg: var(--text-primary); }
  .surface-inverse { --sec-bg: var(--bg-inverse); --sec-fg: var(--text-inverse); }
  .surface-brand { --sec-bg: var(--action-primary); --sec-fg: var(--action-primary-ink); }
  .surface-media { --sec-bg: transparent; }
  /* DENSITY-RUNGS */
  /* attribute scopes — same contract as the classes; Section.astro
     emits both so source and built page stay consistent. */
  [data-surface="muted"] { --sec-bg: var(--bg-surface); }
  [data-surface="inverse"] { --sec-bg: var(--bg-inverse);
                             --sec-fg: var(--text-inverse); }
  [data-surface="brand"] { --sec-bg: var(--action-primary);
                           --sec-fg: var(--action-primary-ink); }
  [data-surface="media"] { --sec-bg: transparent; }
  /* a coloured band owns its ink: secondary copy derives from --sec-fg
     (never the page's --text-secondary, which is tuned for the canvas)
     and the band CTA inverts to an ink plate — a brand-on-brand button
     has no edge. A card inside the band re-grounds on the elevated
     surface with the page inks and the standard primary action. */
  :is([data-surface="brand"], [data-surface="inverse"])
      :is(.lede, .attrib, .helper, .eyebrow, .sub-p, .nav-link,
          .foot-head, .legal, .brand-mark, .quote, .stars,
          .link-quiet) {
    color: color-mix(in srgb, var(--sec-fg) 85%, transparent); }
  [data-surface="brand"] .wf-cta-button {
    background: var(--sec-fg); color: var(--sec-bg); }
  :is([data-surface="brand"], [data-surface="inverse"]) .card {
    color: var(--text-primary); }
  :is([data-surface="brand"], [data-surface="inverse"]) .card
      :is(.lede, .attrib, .helper) { color: var(--text-secondary); }
  [data-surface="brand"] .card .wf-cta-button {
    background: var(--action-primary);
    color: var(--action-primary-ink); }
  /* a quiet control in the nav row: same border/surface vocabulary as
     the buttons, sized on the tap rung */
  .theme-toggle { display: inline-grid; place-items: center;
      width: var(--tap); height: var(--tap); flex: none;
      border-radius: 999px;
      border: 1px solid var(--border-default);
      background: var(--bg-elevated); color: var(--text-secondary);
      cursor: pointer; }
  .theme-toggle:hover { color: var(--text-primary); }
  .theme-toggle .icon-sun { display: none; }
  [data-theme=dark] .theme-toggle .icon-sun { display: block; }
  [data-theme=dark] .theme-toggle .icon-moon { display: none; }
  .sr-only { position: absolute; width: 1px; height: 1px;
      padding: 0; margin: -1px; overflow: hidden;
      clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
@@DS_SPECS@@
}
[data-theme=dark] img { filter: brightness(.85) contrast(.92); }
'''
GLOBAL_CSS_TAIL = GLOBAL_CSS_TAIL.replace('@@FS_ALIASES@@\n', ''.join(
    f'  --fs-{n}: var(--{acss});\n' for n, acss in clamp.FS_MAP.items()))


def _ds_specs(tokens):
    """The /design-system sheet's specimen bindings, emitted inside
    @layer components like every other shared class (DS.2: the page
    binds vars, never literals — the same rung a component consumes).
    Every ACSS size token gets one class: .ds-tx-* binds font-size for
    the type rungs, .ds-sp-* binds block-size for the space/section/
    gutter rungs."""
    fl = emit_tokens.fluid_of(tokens)
    out = [
        '  /* design-system sheet — one class per rung, each a var() '
        'binding on the shared token layer */',
        '  .ds-spec { display: flex; flex-direction: column;',
        '      gap: var(--space-xs); }',
        '  .ds-swatch { display: block; block-size: var(--space-xl);',
        '      border-radius: var(--r-card);',
        '      border: 1px solid var(--border-default); }',
        '  .ds-bar { display: block; inline-size: 100%;',
        '      background: var(--action-primary);',
        '      border-radius: var(--r-card); }',
        '  .ds-radius { display: block; block-size: var(--space-l);',
        '      inline-size: var(--space-l);',
        '      background: var(--bg-elevated);',
        '      border: 1px solid var(--border-default);',
        '      border-radius: var(--r-card); }',
        '  .ds-shadow-card { box-shadow: var(--shadow-card); }',
        '  .ds-shadow-pop { box-shadow: var(--shadow-pop); }',
        '  .ds-label { font-size: var(--fs--1);',
        '      color: var(--text-secondary); }',
        '  .ds-value { font-size: var(--fs--1);',
        '      color: var(--text-muted); }']
    for name in sorted(clamp.sizes(fl)):
        if name.startswith(('text-', 'h')):
            out.append(f'  .ds-tx-{name} {{ font-size: var(--{name}); }}')
        else:
            out.append(f'  .ds-sp-{name} {{ block-size: '
                       f'var(--{name}); }}')
    return '\n'.join(out)

# light-mode role → tailwind colour key (dark roles prefix `dark`)
ROLE_KEY = {
    'bg': 'paper', 'surface': 'surface', 'surface_elevated': 'elev',
    'border': 'border', 'ink': 'ink', 'ink_muted': 'muted',
    'accent': 'accent', 'accent_foreground': 'accentfg',
    'inverse': 'inverse',
}


def tokens_json(dna):
    """DNA map → the gate's TOKENS.json record. knobs ⊆ the map's
    knobs; roles from the map's modes (dna_tokens derive when absent)."""
    knobs = dict(dna.get('knobs') or {})
    modes = dna.get('modes') or {}
    if not modes.get('light') or not modes.get('dark'):
        rec = _derive_tokens(dna)
        modes = rec.get('modes') or modes
    if not knobs:
        rec = _derive_tokens(dna)
        knobs = dict(rec.get('knobs') or {})
    def _roles(mode):
        m = modes.get(mode) or {}
        return dict(m.get('roles') or m)  # tolerate {light:{roles}} shape
    fluid = emit_tokens.fluid_of(
        {'invariants': dna.get('invariants') or {}, 'knobs': knobs})
    return {
        'knobs': knobs,
        # the ACSS fluid settings (DNA invariants.fluid) and every size
        # token they produce, clamp + px at vp_min/768/vp_max — the
        # FL.1 gate recomputes these through clamp.py
        'fluid': fluid,
        'sizes': {name: {'clamp': css, 'px': {
                      f"{fluid['vp_min']:g}": a, '768': b,
                      f"{fluid['vp_max']:g}": c}}
                  for name, css, a, b, c in clamp.table(fluid)},
        # the genotype travels with the record: emit_tokens derives the
        # display/body stacks from display-face (DM.1 keeps type.font_*
        # out of the knob vocabulary)
        'genotype': dict(dna.get('genotype') or {}),
        'color': {
            'modes': {
                'light': {'roles': _roles('light')},
                'dark': {'roles': _roles('dark')},
            },
            'roles': _roles('light'),
        },
    }


def _derive_tokens(dna):
    """genotype + declared accent → knobs + modes via dna_tokens —
    the genotype→tokens mapper is the ONLY derivation (P1)."""
    import dna_tokens
    geno = dna.get('genotype') or {}
    accent = (dna.get('invariants') or {}).get('accent')
    vertical = str(dna.get('vertical_profile') or '').replace(
        'profile-', '').split('/')[0] or 'services'
    if not geno:
        return {'knobs': {}, 'modes': {}}
    if not accent:
        raise SystemExit(
            'emit_global.tokens_json: invariants.accent missing — '
            'the token layer never invents a hex (F10)')
    return dna_tokens.from_genotype(
        geno, vertical, {'accent': accent})


def look_record(rec, deltas):
    """TOKENS record + a look variant's knob deltas → the record the
    picked look emits from: knobs merged, then the pinned `fluid`
    block re-derived the way the delta moves it — TOKENS pins resolved
    settings, so a raw knob delta alone leaves the clamps unchanged.
    Each fluid field the delta moves scales the record's own resolved
    value by the fluid_settings ratio; enum aliases map absolute.
    Pure in (rec, deltas): the same signed pick projects the same
    record (X.1)."""
    import dna_tokens as _dt
    knobs0 = dict((rec or {}).get('knobs') or {})
    knobs1 = dict(knobs0)
    knobs1.update(deltas or {})
    tv = json.loads(json.dumps(rec or {}))
    tv['knobs'] = knobs1
    if knobs1 == knobs0:
        return tv
    fs0 = _dt.fluid_settings(knobs0)
    fs1 = _dt.fluid_settings(knobs1)
    res = dict(emit_tokens.fluid_of(tv))
    for k, v1 in fs1.items():
        v0 = fs0.get(k)
        if v0 == v1:
            continue
        r = res.get(k)
        if (isinstance(r, (int, float)) and
                isinstance(v0, (int, float)) and
                isinstance(v1, (int, float)) and v0):
            res[k] = r * (v1 / v0)   # scale the record's value
        else:
            res[k] = v1              # enum aliases map absolute
    tv['fluid'] = res
    return tv


def look_scope(rec, deltas):
    """Knob deltas → the ``--var`` override map the real emit moves:
    emit the token record merged with the deltas and diff every
    ``--name: value`` declaration vs the record's own emit. The ONE
    knob→css projection — preview variant scopes and the shipped
    look layer both bind this, never a parallel table. Pure in
    (rec, deltas): same pick → same vars (X.1)."""
    import re as _re
    def decls(css):
        return dict(_re.findall(r'(--[\w-]+)\s*:\s*([^;{}]+);', css))

    def emit_of(tv):
        return emit_tokens.emit(tv) + _base_css(tv)
    b = decls(emit_of(look_record(rec, {})))
    v = decls(emit_of(look_record(rec, deltas)))
    return {k: x.strip() for k, x in v.items() if b.get(k) != x}


def tailwind_config(tokens):
    """TOKENS record → tailwind.config.js text. Every hex in
    color.modes lands verbatim (check_tailwind_derivation); theme
    keys colors/fontSize/borderRadius/spacing always present."""
    color = tokens.get('color') or {}
    modes = color.get('modes') or {}
    light = (modes.get('light') or {}).get('roles') \
        or color.get('roles') or {}
    dark = (modes.get('dark') or {}).get('roles') or {}
    pairs = []
    for role, hexv in light.items():
        pairs.append((ROLE_KEY.get(role) or role, str(hexv)))
    for role, hexv in dark.items():
        base = ROLE_KEY.get(role) or role
        pairs.append(('dark' + base, str(hexv)))
    colour_lines = ''
    for i in range(0, len(pairs), 6):
        chunk = pairs[i:i + 6]
        colour_lines += '\n      ' + ', '.join(
            f"{k}: '{v.lower()}'" for k, v in chunk) + ','
    # every pair line ends with a comma — the last is legal JS
    # (trailing comma) and keeps sucrase from reading the next
    # key as an expression continuation.
    colour_lines = colour_lines.rstrip() + '\n   '
    return f'''/** generated from TOKENS.json — emit_global.tailwind_config */
export default {{
  darkMode: 'class',
  content: ['./src/**/*.{{astro,html}}'],
  theme: {{ extend: {{
    colors: {{{colour_lines}}},
    fontSize: {{
      'fluid--1': 'var(--fs--1)', 'fluid-0': 'var(--fs-0)',
      'fluid-1': 'var(--fs-1)', 'fluid-2': 'var(--fs-2)',
      'fluid-3': 'var(--fs-3)', 'fluid-4': 'var(--fs-4)',
      'fluid-5': 'var(--fs-5)',
    }},
    borderRadius: {{ card: 'var(--r-card)' }},
    spacing: {{ tap: 'var(--tap)' }},
  }} }},
}}
'''


def _density_css(tokens):
    """knobs.space.section_py names the rung each density uses — emit
    that, else the s/m/l default the fixtures encode."""
    py = ((tokens.get('knobs') or {})
          .get('space.section_py')) or {}
    rung = lambda d, f: str(py.get(d) or f'section-space-{f}')
    rows = (('compact', rung('compact', 's')),
            ('regular', rung('regular', 'm')),
            ('spacious', rung('spacious', 'l')))
    out = []
    for name, var in rows:
        out.append(f'  .density-{name} '
                   f'{{ --sec-pad: var(--{var}); }}')
    for name, var in rows:
        out.append(f'  [data-density="{name}"] '
                   f'{{ --sec-pad: var(--{var}); }}')
    return '\n'.join(out)


def _base_css(tokens):
    """The good-defaults floor: raw h1–h6/p/a/img/button bound to the
    type scale. Without it every element renders in browser defaults —
    bank markup and hand-authored markup alike. Layered `base` so any
    unlayered component rule wins."""
    k = tokens.get('knobs') or {}
    try:
        dw = int(float(k.get('type.display_weight') or 700))
    except (TypeError, ValueError):
        dw = 700
    try:
        tr = f"{float(k.get('type.tracking_display')):.3f}em"
    except (TypeError, ValueError):
        tr = '-0.020em'
    return '\n'.join([
        '@layer base {',
        '  :root {',
        f'    --display-weight: {dw};',
        f'    --tracking-display: {tr};',
        '  }',
        '  *, *::before, *::after { box-sizing: border-box; }',
        '  html { -webkit-text-size-adjust: 100%; }',
        '  body {',
        '    margin: 0;',
        '    font-family: var(--font-body);',
        '    font-size: var(--text-m);',
        '    line-height: var(--lh-0);',
        '    color: var(--text-primary);',
        '    background-color: var(--bg-canvas);',
        '    -webkit-font-smoothing: antialiased;',
        '    -moz-osx-font-smoothing: grayscale;',
        '  }',
        '  h1, h2, h3, h4, h5 {',
        '    font-family: var(--font-display);',
        '    font-weight: var(--display-weight);',
        '    letter-spacing: var(--tracking-display);',
        '  }',
        # ACSS heading scale verbatim: h1..h6 bind --h1..--h6
        '  h1 { font-size: var(--h1); line-height: var(--lh-5); }',
        '  h2 { font-size: var(--h2); line-height: var(--lh-4); }',
        '  h3 { font-size: var(--h3); line-height: var(--lh-3); }',
        '  h4 { font-size: var(--h4); line-height: var(--lh-2); }',
        '  h5 { font-size: var(--h5); line-height: var(--lh-1); }',
        '  h6 {',
        '    font-size: var(--h6); line-height: var(--lh-1);',
        '    font-weight: 600; text-transform: uppercase;',
        '    letter-spacing: 0.08em;',
        '  }',
        '  p { line-height: var(--lh-0); max-width: var(--measure); }',
        '  p + p { margin-top: var(--flow-spacing); }',
        '  a {',
        '    color: inherit;',
        '    text-decoration-color: color-mix(in oklch,',
        '      currentColor 35%, transparent);',
        '    text-underline-offset: 0.18em;',
        '  }',
        '  a:hover { text-decoration-color: currentColor; }',
        '  img, svg, video, canvas { display: block; max-width: 100%; }',
        '  img { height: auto; }',
        '  figure { margin: 0; }',
        '  ul, ol { padding-inline-start: 1.15em; }',
        # prose rhythm only: layout lists carry a class and space
        # with gap — a sibling margin there staggers grid tracks
        '  :where(ul:not([class]), ol:not([class])) > li + li {',
        '    margin-top: var(--space-xs); }',
        '  button {',
        '    font: inherit; color: inherit; background: none;',
        '    border: 0; cursor: pointer;',
        '  }',
        '  strong, b { font-weight: 600; }',
        '  ::selection {',
        '    background: var(--action-primary);',
        '    color: var(--action-primary-ink);',
        '  }',
        '  :focus-visible {',
        '    outline: 2px solid var(--border-focus);',
        '    outline-offset: 3px;',
        '  }',
        '}',
    ])


MAX_FACES = 4   # P.12 — two families x two weights max


def font_faces_css(fonts):
    """DNA invariants.fonts → @font-face blocks (font-display: swap).
    Each face names its file under public/ (`/fonts/<f>.woff2`); the
    family is the face's own `family`, else the DNA display family.
    More than MAX_FACES is a DNA error, never silently truncated."""
    fonts = fonts or {}
    faces = fonts.get('faces') or []
    if len(faces) > MAX_FACES:
        raise SystemExit(f'emit_global: {len(faces)} font faces > '
                         f'{MAX_FACES} (P.12) — fix DNA invariants.fonts')
    out = []
    for fc in faces:
        fam = str(fc.get('family') or fonts.get('display') or '').strip()
        src = str(fc.get('file') or '').strip()
        if not fam or not src:
            raise SystemExit('emit_global: font face without family/file '
                             f'— {fc}')
        fmt = src.rsplit('.', 1)[-1].lower()
        fmt = {'woff2': 'woff2', 'woff': 'woff', 'ttf': 'truetype',
               'otf': 'opentype'}.get(fmt, fmt)
        out.append('@font-face {\n'
                   f'  font-family: "{fam}";\n'
                   f"  src: url('{src}') format('{fmt}');\n"
                   f'  font-weight: {int(fc.get("weight") or 400)};\n'
                   f'  font-style: {fc.get("style") or "normal"};\n'
                   '  font-display: swap;\n'
                   '}')
    return '\n'.join(out) + ('\n' if out else '')


def _with_font_stack(tokens, fonts):
    """The DNA font stack rides knobs.type.font_display/font_body into
    emit_tokens (its documented carrier) for this emission only — the
    TOKENS record on disk is untouched."""
    stack = str((fonts or {}).get('stack') or '').strip()
    if not stack:
        return tokens
    t = dict(tokens)
    t['knobs'] = dict(tokens.get('knobs') or {},
                      **{'type.font_display': stack,
                         'type.font_body': stack})
    return t


def global_css(tokens, fonts=None):
    """@tailwind headers + DNA @font-face + emit_tokens' five TK layers
    + the component tail (density rungs derived from
    knobs.space.section_py). `fonts` is DNA invariants.fonts."""
    head = ('@tailwind base;\n@tailwind components;\n'
            '@tailwind utilities;\n')
    emit_lines = emit_tokens.emit(_with_font_stack(tokens, fonts)) \
        .split('\n')
    body = '\n'.join(emit_lines[5:])
    tail = GLOBAL_CSS_TAIL.lstrip('\n').replace(
        '  /* DENSITY-RUNGS */', _density_css(tokens)).replace(
        '@@DS_SPECS@@\n', _ds_specs(tokens) + '\n')
    return (head + '\n' + font_faces_css(fonts) + body + '\n'
            + _base_css(tokens) + '\n' + tail)


RATIO_SET = ('21:9', '16:9', '3:2', '4:3', '1:1', '3:4', '2:3', '9:16')


def _img_dims(path):
    """(w, h) of a jpg/png/webp raster, or None — no PIL needed."""
    import struct
    try:
        d = open(path, 'rb').read(65536)
    except OSError:
        return None
    if d[:8] == b'\x89PNG\r\n\x1a\n' and len(d) >= 24:
        return struct.unpack('>II', d[16:24])
    if d[:2] == b'\xff\xd8':
        i = 2
        while i + 9 < len(d):
            if d[i] != 0xFF:
                i += 1
                continue
            m = d[i + 1]
            if m in (0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC9, 0xCA,
                     0xCD, 0xCE):
                h, w = struct.unpack('>HH', d[i + 5:i + 9])
                return w, h
            i += 2 + struct.unpack('>H', d[i + 2:i + 4])[0]
        return None
    if d[:4] == b'RIFF' and d[8:12] == b'WEBP':
        kind = d[12:16]
        if kind == b'VP8X' and len(d) >= 30:
            w = 1 + int.from_bytes(d[24:27], 'little')
            h = 1 + int.from_bytes(d[27:30], 'little')
            return w, h
        if kind == b'VP8 ' and len(d) >= 30:
            w, h = struct.unpack('<HH', d[26:30])
            return w & 0x3FFF, h & 0x3FFF
        if kind == b'VP8L' and len(d) >= 25:
            b = int.from_bytes(d[21:25], 'little')
            return (b & 0x3FFF) + 1, ((b >> 14) & 0x3FFF) + 1
    return None


def media_ratio_for(path, fallback=None):
    """The raster's own aspect ratio snapped to the contract's ratio
    vocabulary — data-ratio describes the asset, never the plan's
    declared intent (a 4:3 box around a 3:2 photo crops wrong)."""
    dims = _img_dims(path)
    if not dims or not dims[1]:
        return fallback
    r = dims[0] / dims[1]
    return min(RATIO_SET,
               key=lambda t: abs(r - int(t.split(':')[0])
                               / int(t.split(':')[1])))


def site_assets(page_dir, site):
    """Copy the site design folder's assets into site/public/:
    assets/fonts/* → public/fonts/, assets/media/* → public/media/,
    assets/logo.svg → public/logo.svg. The site folder resolves from
    the page dir (site_folder.site_of); a page dir outside a site
    folder copies nothing. Returns the copied public-relative paths."""
    import shutil
    import site_folder
    sdir, _ = site_folder.site_of(page_dir)
    if not sdir:
        return []
    src_root = os.path.join(sdir, 'assets')
    pub = os.path.join(site, 'public')
    done = []
    for sub in ('fonts', 'media'):
        d = os.path.join(src_root, sub)
        if not os.path.isdir(d):
            continue
        os.makedirs(os.path.join(pub, sub), exist_ok=True)
        for fn in sorted(os.listdir(d)):
            p = os.path.join(d, fn)
            if os.path.isfile(p) and not fn.startswith('.'):
                shutil.copyfile(p, os.path.join(pub, sub, fn))
                done.append(f'{sub}/{fn}')
    logo = os.path.join(src_root, 'logo.svg')
    if os.path.isfile(logo):
        os.makedirs(pub, exist_ok=True)
        shutil.copyfile(logo, os.path.join(pub, 'logo.svg'))
        done.append('logo.svg')
    return done


TAILWIND_CDN = '<script src="https://cdn.tailwindcss.com"></script>'


def tailwind_cdn_config(tokens):
    """Inline ``tailwind.config`` for the browser CDN build — the same
    theme tailwind_config() emits for the node build, so a preview
    resolves every custom utility (bg-accent, text-fluid-N,
    rounded-card) identically to ``astro build``."""
    color = tokens.get('color') or {}
    modes = color.get('modes') or {}
    light = (modes.get('light') or {}).get('roles') \
        or color.get('roles') or {}
    dark = (modes.get('dark') or {}).get('roles') or {}
    pairs = {}
    for role, hexv in light.items():
        pairs[ROLE_KEY.get(role) or role] = str(hexv).lower()
    for role, hexv in dark.items():
        pairs['dark' + (ROLE_KEY.get(role) or role)] = \
            str(hexv).lower()
    colours = ', '.join(f"{k}: '{v}'" for k, v in
                        sorted(pairs.items()))
    return ('<script>tailwind.config = { darkMode: "class", theme: {'
            ' extend: { colors: { ' + colours + ' }, fontSize: {'
            ' "fluid--1": "var(--fs--1)", "fluid-0": "var(--fs-0)",'
            ' "fluid-1": "var(--fs-1)", "fluid-2": "var(--fs-2)",'
            ' "fluid-3": "var(--fs-3)", "fluid-4": "var(--fs-4)",'
            ' "fluid-5": "var(--fs-5)" },'
            ' borderRadius: { card: "var(--r-card)" } } } }'
            '</script>')


def preview_css(tokens, fonts=None):
    """The site stylesheet minus the compile-time @tailwind directives:
    DNA @font-face + emit_tokens' TK layers + the base floor + the
    component tail. Previews pair this <style> block with the Tailwind
    CDN + the same tailwind.config the node build uses — utilities
    come from Tailwind, component classes from TOKENS, never hand-CSS."""
    emit_lines = emit_tokens.emit(_with_font_stack(tokens, fonts)) \
        .split('\n')
    body = '\n'.join(emit_lines[5:])
    tail = GLOBAL_CSS_TAIL.lstrip('\n').replace(
        '  /* DENSITY-RUNGS */', _density_css(tokens)).replace(
        '@@DS_SPECS@@\n', _ds_specs(tokens) + '\n')
    return (font_faces_css(fonts) + body + '\n' + _base_css(tokens)
            + '\n' + tail)
