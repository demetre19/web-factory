# templates/astro/ — the vendored Astro starter

This directory IS the starter (D5, OI-1). Every S5 build lane
(`web-build-<site>`) scaffolds `sites/<slug>/` by copying this tree.
Lanes never run `npm create` — the vendored baseline is the reviewed
skeleton: Tailwind wiring, SEO head contract, fluid type scale, mobile
menu, footer.

## Pinned dependencies (package-lock.json, lockfile v3)

| Package | Version | Role |
|---|---|---|
| astro | 5.18.2 | framework — `output: "static"` |
| @astrojs/tailwind | 6.0.2 | Tailwind v3 integration (`applyBaseStyles: false`) |
| tailwindcss | 3.4.19 | utility layer, `@layer components` class system |
| @astrojs/sitemap | 3.6.0 | emits `sitemap-index.xml` for the S7 gate |

Exact versions only — no ranges. `npm ci` reproduces this tree
byte-for-byte from `package-lock.json`.

## How a build lane uses it

```
cp -R templates/astro sites/<slug>
cd sites/<slug> && npm ci && npx astro build   # the S5 lane's proof argv
```

Then, in order (per `research/WEB-FACTORY-S5-DESIGN-DNA.md`):

1. Set `site` in `astro.config.mjs` to the site's canonical origin.
2. Fill `src/site.ts` from `site/site-brief.md` — NAP, nav labels
   (shortened H1 forms).
3. Regenerate `:root` tokens in `src/styles/global.css` and the
   `theme.extend` block in `tailwind.config.mjs` from
   `design-dna/TOKENS.json`. A token-empty packet keeps these starter
   defaults — and every defaulted token is named in DESIGN-DNA.md.
4. One `@layer components` class per CLASS-SYSTEM.md row
   (`src/styles/global.css` or `src/styles/components/*.css`); one
   `.astro` component per COMPONENTS.md row.
5. One page file per ROUTE-MANIFEST.json route; bind
   `content-final/<slug>.md` on `path` — frontmatter copied verbatim
   into `<SEOHead>`.

## What's safe to edit vs. regenerated

- **Regenerated per site:** `tailwind.config.mjs` theme, the `:root`
  token block in `global.css`, `src/site.ts`, `src/pages/`,
  `astro.config.mjs` `site` field, `public/robots.txt` sitemap URL.
- **Kept as vendored:** `SEOHead.astro` output contract (S7 greps
  canonical/OG/robots), the `MobileMenu` focus-trap script in
  `Header.astro`, footer NAP structure, `.gitignore`, the pin list.
- **Never committed from a site copy:** `dist/`, `node_modules/`.

## Invariants the starter bakes in

- Fluid typography only: `--fs-*` are `clamp()` values; Tailwind
  `fluid-*` fontSize utilities read them. No breakpoint-stepped sizes.
- Fully self-contained output: no remote fonts, stylesheets, or script
  fetches anywhere in `src/`.
- Real mobile menu: hamburger → focus-trapped, Escape-dismissible panel
  (vanilla inline script, no framework runtime).
- `MobileCTA.astro` — mobile-only bottom action bar (<768px,
  suppressed on the contact route, safe-area padded, z-index below
  the menu overlay): two 48px buttons — Call (`tel:`) + Get a quote.
  `main` carries matching bottom padding in `global.css`.
- `src/pages/404.astro` — designed 404: brand shell, H1, company
  description, nav links + call CTA, `robots` noindex.
- Heading surface — `.seo-h1/.seo-h2/.seo-h3` render a heading at a
  smaller fluid step than its rank; `.display` is the oversized
  non-heading marketing line. Semantic rank never follows visual size.
- Hero module — `index.astro` models the fold quad: H1 (what/who) +
  standfirst (pain → offer) + primary CTA + `wf-trust-strip`. Every
  built page template renders the same four parts (S5 spec).
- Mobile-usability floors — `input/select/textarea` ≥16px (no iOS
  input zoom), `scroll-padding-top` clears the sticky header, drawer
  bottom padding covers `safe-area-inset-bottom`, body prose caps at
  75ch with `text-wrap: pretty`.
- Design bans — the impeccable anti-pattern list is a S5 self-lint
  + S7 check 23 refuse: gradient text, decorative glassmorphism,
  side-stripes, ghost-cards, >16px card radii, stripe backgrounds,
  sketch filters, bounce easing, eyebrow/numbered scaffolding,
  hero-metric template, `z-index` ≥999.
- SEO surface: `SEOHead.astro` emits the full OG + twitter card set
  (default `og:image` = `/og-image.png`, generated from
  `src/og/og-image.svg`); `JsonLd.astro` emits the @graph entity JSON-LD
  (business node + WebSite + breadcrumbs + Service/Article/FAQPage).
- Footer carries four regions: company description (verbatim from
  `site.description`), `SocialLinks`, the grouped HTML sitemap
  (`site.sitemap`), and the `itemscope` NAP block — labels are spans,
  never headings.
- A11y floors: skip link to `#main` in `BaseLayout`, landmark labels,
  `:focus-visible` outlines, `prefers-reduced-motion` guard and
  `overflow-x: clip` in `global.css`.
- `_headers` cache matrix: `/_astro/` + `/assets/` immutable,
  stable-URL `public/` assets `must-revalidate`, HTML `max-age=0`.
