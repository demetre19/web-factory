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
- Footer carries a site map + schema.org NAP block — not placeholders.
