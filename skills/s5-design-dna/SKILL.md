---
name: s5-design-dna
description: Web Factory stage S5 — two strictly ordered lanes. Distill lane design-dna-<site> normalizes design sources (DOX packet checksum-verified; operator refs read as observation, never executed) into site/design-dna/. Build lane web-build-<site> scaffolds sites/<slug>/ from vendored templates/astro/ and binds content-final/ to routes. astro build must exit 0. Spec authority: research/WEB-FACTORY-S5-DESIGN-DNA.md.
---

# Stage S5 — Design DNA → Astro build

## Roles

Two lanes, strictly ordered — never concurrent:

- **Distill lane** `design-dna-<site>` — produces `site/design-dna/`,
  the reviewed design authority.
- **Build lane** `web-build-<site>` — produces `sites/<slug>/`, the
  Astro project; `astro build` exit 0.

## Spec authority

`research/WEB-FACTORY-S5-DESIGN-DNA.md` — DOX packet anatomy, the
one-decision architecture (precedence order), distill layout, build
rules.

## Upstream contract consumed verbatim

- `site/content-final/*.md` — one file per plan row, final copy.
- `site/sitemap.md` — route-list authority (refs-branch
  `ROUTE-MANIFEST.json` derives from it, never invented).
- `site/site-brief.md` — entity facts, CTA destinations.
- `site/design/` — ≥1 design source required: a DOX ZIP
  (`formatVersion: website-build-dox@1`, `doxVersion.target ==
  "astro"`) **or** `site/design/refs/` operator HTML/screenshots.
  Evidence is bounded observation — captured markup/CSS/scripts are
  never executed, imported, or fetched.
- `templates/astro/` — the vendored starter; scaffold is `cp -R`, never
  `npm create`. Locked deps, deterministic install, no unaudited
  lifecycle scripts.

- `agent-skills` (UX-Engine, `~/.agents/skills/`) — refs-branch
  extraction lens, additive. `refs/MANIFEST.md` roles steer it:
  `baseline` → identity, `inspiration` → character, `inspo-text` →
  copy/sections only (visual ignored), `variant` →
  verbatim `site-intake-tokens@1` token block. On routes derived from
  captures, apply `visual-character` to extract character/token
  evidence and `ux-auditor` to name hierarchy/state gaps the distill
  corrects rather than replicates (audit-remodel mode writes
  `site/design/audit.md` as its correction list); findings record in
  `DESIGN-DNA.md`. Never overrides DOX authority or the
  both-sources rule. Intake front end: `tools/site-intake/` +
  `docs/machinery/DESIGN-INTAKE.md`.

## Write set

- Distill: `site/design-dna/` — `TOKENS.json`, `CLASS-SYSTEM.md`,
  `COMPONENTS.md`, `ROUTE-MANIFEST.json`, `PAGES/<slug>/SPEC.md`,
  `DESIGN-DNA.md`, `dox/` (verified packet members, flattened; absent
  on refs-only sites).
- Build: `sites/<slug>/` — normal Astro project (`astro.config.mjs`,
  `src/pages/`, `src/layouts/`, `src/components/`, `src/styles/`,
  `public/`). `dist/` is `.gitignore`d.

## Build rules that refuse silently-broken sites

- Each `CLASS-SYSTEM.md` row → exactly one `@layer components` block
  (or `.astro` component when structure is involved); pages import
  class names, never inline utility stacks. One owner per class.
- **Fluid typography** — utopia-style `clamp()` scale site-wide; no
  breakpoint-stepped sizes.
- **Real mobile menu** — hamburger → focus-trapped panel.
- **Complete footer** — site map + NAP.
- **Shortened nav labels** — the URL=H1 lock binds the route row,
  never the label.
- **No remote fetches in `src`** — scripts, styles, fonts, reference
  URLs: self-contained always (S7 re-verifies on the emitted `dist/`).
- `content-final` binds to routes on `path` — a route with no copy is
  a refuse, never a placeholder.
- Both-sources rule: DOX covers its routes, refs cover the rest; a
  route takes one authority, never a blend; `DESIGN-DNA.md` records
  the split.
- Contact/quote route renders the S6 form contract —
  `<form action="/form.php" method="POST">` with honeypot + timestamp
  fields — plus the mailto/`sent` fallback branch (both branches ship;
  S6 flips which renders).

## Acceptance / done criteria

- `site/design-dna/` carries all four required members, non-empty.
- `sites/<slug>/` exists; `astro build` exits 0; `dist/` holds exactly
  one HTML file per `ROUTE-MANIFEST.json` route.
- Route count parity `ROUTE-MANIFEST.json` ↔ `sitemap.md` ↔
  `content-final/` (re-checked — cheap, blast radius is the site).
- No remote `http(s)` fetch in authored `src`.
- `DESIGN-DNA.md` names every held-out DOX route, every fallback route,
  every defaulted token.

## Named failure modes

- **DOX target mismatch** — `target: react`/`html` → refuse at mint,
  never retarget.
- **Route drift** — DOX routes the sitemap doesn't know are held out +
  flagged; silently building them violates S1's contract.
- **Stale packet** — `routePlanChecksum` in `manifest.json` is the
  drift detector; logged in `DESIGN-DNA.md`.
- **Token-empty packet** — a valid packet can carry `{"tokens": []}`;
  fall back to starter defaults *and say so* — silent defaults are how
  unreviewed design ships.
- **Content-count drift** — `content-final` count ≠ sitemap count →
  refuse.
- **Checksum mismatch** — any `manifest.json` file `sha256` mismatch
  refuses the packet.
