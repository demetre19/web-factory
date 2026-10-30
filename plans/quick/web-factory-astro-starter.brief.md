# Brief — web-factory-astro-starter

## Goal

Create `templates/astro/` — the vendored, self-contained Astro starter
that every S5 build lane scaffolds `sites/<slug>/` from (D5, OI-1).
Never `npm create` at lane time; this directory IS the starter.

## Write paths

- `templates/astro/` — full starter tree (package.json, astro.config,
  tsconfig, src/layouts|components|pages|styles, public/)
- `templates/STARTER.md` — what it is, the pinned dep list, how a lane
  copies it, what's safe to edit vs. regenerated

## Required content

- Real, minimal Astro 5 project: `astro.config.mjs` (output static),
  `@astrojs/tailwind` integration, locked `package-lock.json` (deps
  pinned, recorded in STARTER.md).
- A `<SEOHead>` component contract (title, description, canonical,
  OG/Twitter tags, robots meta) — S7's gate greps its output.
- Fluid typography wired in by default: a `--fs-*` clamp() type scale
  (utopia-style) in `src/styles/` + Tailwind `fontSize` theme extend —
  per the S5 spec's fluid-type requirement.
- A functional mobile-menu component (hamburger → focus-trapped
  dismissible panel) and a footer component (site map + NAP/contact
  block) — per the S5 spec.
- One example layout + one example page so `astro build` exits 0 with
  no content (the starter must be provably green on arrival).
- `public/` skeleton (favicon placeholder, robots.txt, _headers passthrough).

## Verification

`cd templates/astro && npm ci && npx astro build` exits 0 and emits
`dist/`. Record the smoke in the lane's done notes.

## Done contract

`templates/astro/` builds clean with deps pinned; `templates/STARTER.md`
documents the pin list + copy instructions for S5 lanes.

elegance: {"rung": 2, "lower_rungs_rejected": {"r0": "S5 lanes cannot scaffold without a starter — no-starter fails the pipeline outright", "r1": "running `npm create astro` inside every S5 lane is nondeterministic (version drift, network dependency at lane time) — vendoring is the existing-primitive fix"}, "trigger": {"supplied_by": "the admit pass reading the repo", "self_triggering": true, "observed_state": "templates/astro/ absent while the PRD is APPROVED and S5's spec requires it"}, "follow": {"obliged_actor": "the boss session in workspace w57", "refusal": "S5 lanes refuse to scaffold (spec: 'never npm create') — the starter is a hard precondition", "bypass": [{"path": "templates/astro/ is the only place S5's spec reads a starter from", "closed_by": "the vendored directory existing"}]}, "census": {"searched": ["templates/", "package.json", "astro.config*"], "candidates_found": 0}}
