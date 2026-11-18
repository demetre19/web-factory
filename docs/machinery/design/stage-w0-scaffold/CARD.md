---
id: card-w0
type: card
wave: w0
links:
  uses: [rules-P]
  enforced_by: [check_scaffold, check_checklist, check_dna, check_dna_fresh]
---

# W0 — Project scaffold (Astro + Tailwind, once)

**GOLDEN RULE: ASTRO is the goal; TAILWIND is non-negotiable.** Every
artifact from W3 on is a file inside ONE Astro project scaffolded here
from `templates/astro/`. (P.1)

**Read DNA map. Every decision traces to it.** The map (`DNA.json` + `DNA.md`) is the single source of coherence: every value used here must be traceable to it (`gate.py dna`).

## Job

1. `cp -R templates/astro <pipeline-dir>/site/` — never `npm create`,
   never a second project later.
2. `site/package.json` pins astro + `@astrojs/tailwind` + tailwindcss
   (versions from the template; lockfile committed).
3. `astro.config.mjs` sets `site:` to the canonical origin and wires
   `@astrojs/tailwind`.
4. `src/styles/global.css` keeps the `@tailwind` directives and an
   empty `@layer components` block; `tailwind.config.mjs` starts from
   the template's token-derived skeleton (P.5).
5. `src/components/` and `src/pages/` are empty apart from the
   template's index stub — the design system is not invented here.
6. `npx astro build` exits 0 in the fresh project.

## Rules that apply

- **P.1** golden rule — one Astro + Tailwind project, scaffolded from
  the template, never re-created downstream.
- **P.2** shared source — `global.css` layer + config are the only
  style sources; no `<style>` blocks later.
- **P.5** Tailwind theme — config is generated from `TOKENS.json` at
  W3; here it must be a valid, buildable skeleton.

## Exit gate

```bash
python3 tools/design-gate/gate.py w0 <pipeline-dir>
```

Checks: `site/package.json` + `astro.config.mjs` +
`src/styles/global.css` exist with the template's pins; `astro build`
exits 0; Tailwind directive present. Then
`gate.py w0 <pipeline-dir> --approve`.

## Done when

`GATES.json.w0.pass` is true for the current input hashes and
`CHECKLIST/w0.md` has no blank evidence (P.9).
