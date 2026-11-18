---
id: checklist-w0
type: checklist
wave: w0
links:
  index: design-index
  card: card-w0
---

# W0 checklist — scaffold evidence

Copy into `<pipeline-dir>/CHECKLIST/w0.md`. Blank cell = fail (P.9).
Evidence is a location (`file:line`, command output line), never an
assertion.

| Rule | Evidence |
|---|---|
| P.1 `site/` copied from `templates/astro/` (no `npm create`) | |
| P.1 `site/package.json` pins astro + @astrojs/tailwind + tailwindcss | |
| P.1 `astro.config.mjs` sets `site:` origin + tailwind integration | |
| P.2 `src/styles/global.css` has `@tailwind` + empty `@layer components` | |
| P.5 `tailwind.config.mjs` present, valid skeleton | |
| P.1 `npx astro build` exits 0 (paste exit line) | |
| P.1 `src/components/` and `src/pages/` hold no design work yet | |
