---
name: s7-gate-deploy
description: Web Factory stage S7 — one deploy lane per site. Clean astro build → 13-check SEO gate against dist/ → atomic rsync deploy (releases/<ts>/ + current symlink flip, ≤5 releases) → HTTP smoke → operator ~10% tweak loop → APPROVE SITE seal in deploy-report.md. dist/ never commits. Spec authority: research/WEB-FACTORY-S7-GATE-DEPLOY.md.
---

# Stage S7 — Build gate + launch

## Role

One lane `web-deploy-<site>` per site, live from gate to seal — the
operator's ~10% tweak loop runs inside this lane, not as separate
lanes. Your seal is the factory's done.

## Spec authority

`research/WEB-FACTORY-S7-GATE-DEPLOY.md` — the deploy declaration
contract, dist/ discipline, the 13-check SEO gate, deploy mechanics,
tweak-loop bounds, seal schema.

## Upstream contract consumed verbatim

- `sites/<slug>/` — S5 output, S6-wired. `astro build` exit 0 at S5 is
  re-verified, not trusted.
- `site/sitemap.md` — row count must equal
  `site/design-dna/ROUTE-MANIFEST.json` route count (re-checked).
- `site/site-brief.md` `## Deploy` — `host_alias` (`ProxyJump jump`),
  `user` (never root), `docroot`, `url` (canonical origin). Absent →
  `prd_step ask`; never guess a host.
- `site/content-final/` — one file per manifest route (cheap count
  re-check; drift means an upstream stage moved).

## The sequence

1. Verify preconditions — all four; failures name the owning upstream
   stage.
2. **Pre-deploy probe** — `ssh <host_alias> 'test -d <docroot> &&
   test -w <docroot>'` as `user` via `ProxyJump jump`; create
   `docroot/releases/`. A probe fail stops here — never discover an
   unreachable host after the gate passes.
3. **Build** — clean `dist/`, `npm run build` in `sites/<slug>/`.
   Non-zero → refuse; a red build is an upstream defect, never a
   deploy-lane source edit.
4. **SEO gate** — the 13-check battery below against `dist/`; every
   finding (pass *and* fail) rows into `site/seo-gate-report.md`. One
   fail refuses deploy — the report is the record.
5. **Commit the gate report** before deploying.
6. **Deploy** — `rsync -az --delete --delay-updates` into
   `releases/<UTC ts>/`, then `ln -sfn releases/<ts>
   <docroot>/current`. Atomic flip; prune to last 5 releases.
7. **Smoke** — fetch `<url>/` (200 + homepage `<title>`), one money
   route, `sitemap.xml`. Fail → `ln -sfn` back to the previous
   release **in the same step**, then refuse — the host never sits on
   a broken `current`.
8. **Hand to operator** — post `<url>` + both reports, `prd_step ask`
   for the tweak list (the ask is the wait mechanism).
9. **~10% tweak loop** — tokens/components for visuals, copy only
   where the operator names it; rebuild → re-gate → re-deploy →
   re-smoke every iteration; reports append.
10. **Seal** — operator sign-off (`APPROVE SITE`) populates
    `deploy-report.md` `## Seal`: signer, timestamp, release, live
    `<url>` — then `prd_step done`.

## The 13-check SEO gate (checklist of record)

Route parity (one HTML per manifest route) · title ≤60 unique · meta
description 140–160 unique · canonical = `url` + path · exactly one
`<h1>` · OG tags present · sitemap.xml lists every route once ·
robots.txt references sitemap · every internal `href` resolves · no
remote-asset fetches outside `url`'s origin · every `<img>` has
non-empty `alt` · every `<form action>` resolves (check 12 — the only
check that proves S6 ran) · no skipped heading levels. An operator
override of a failed check must be recorded in writing — silence is
not consent.

## Write set

- `site/seo-gate-report.md` — check/result/detail table + `## Iterations`.
- `site/deploy-report.md` — iteration table + `## Seal`.
- Host state — `releases/<ts>/` dirs + `current` symlink (last 5 kept).

`dist/` never commits — `.gitignore`d, rebuilt from clean every
iteration; both reports record build HEAD + timestamp.

## Acceptance / done criteria

- `astro build` exit 0 on the final iteration.
- `seo-gate-report.md` exists; final iteration all PASS (or recorded
  operator overrides).
- `deploy-report.md` exists; final smoke all 200; `## Seal` populated.
- `dist/` nowhere in the diff.
- No remote-asset fetches, no broken internal links (checks 9–10 —
  the ship-blockers).

## Named failure modes

- **Gate fail at iteration N** — same refusal as iteration 0; the loop
  never weakens the gate to converge.
- **Smoke fail post-flip** — rollback flip happens in the same step,
  then refuse.
- **Unreachable host discovered late** — step 2's probe exists because
  build+gate is expensive to redo; probe first.
- **Tweak drift into structure** — new routes or replanned copy
  escalate back to the owning stage; S7 is calibration, not a second
  writing stage.
- **Release accumulation** — prune to 5 (current + 4 back).
- **dist/ staleness between iterations** — unconditional clean+build;
  never diff-deploy a prior `dist/`.
- **Re-run short-circuit** — a resumed lane finding a populated
  `## Seal` with matching live `current` stamps done without
  redeploying; otherwise re-run from step 1 unconditionally.
