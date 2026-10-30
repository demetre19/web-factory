# WEB-FACTORY-S7-GATE-DEPLOY — Stage S7: Build gate + launch

Stage S7 takes `sites/<slug>/` — the Astro project S5 built and S6
wired integrations into — through its launch pass: `astro build`, the
SEO verification gate against the emitted `dist/`, an atomic rsync
deploy to the SSH host `site-brief.md` declares, an HTTP smoke check,
then the operator ~10% tweak loop and seal.

This document is the stage spec. A NEW-WEBSITE run mints one S7 lane
per site (`web-deploy-<site>`); the lane runs gate → deploy → smoke,
then iterates the operator's tweak list until sign-off seals the run.
S7 is the last stage — its seal is the factory's done.

## Position in the factory

```
S5b build ──> sites/<slug>/ ──> S6 integrations ──> S7
                                                        │
                          astro build ──> dist/ ──> SEO gate
                                                        │
                                              rsync deploy (atomic)
                                                        │
                                              HTTP smoke ──> operator
                                              ~10% tweak loop ──> seal
```

- **Upstream contract:** S5's done-criteria already guarantee
  `sites/<slug>/` exists and `astro build` exits 0 there
  (`WEB-FACTORY-S5-DESIGN-DNA.md` §Acceptance); S6 wires forms,
  mail and CTA endpoints into the same project. S7 reads
  `sites/<slug>/` as a normal Astro project and re-verifies — the
  gate re-runs the build because verification on a stale `dist/` is
  no verification at all.
- **Downstream contract:** none — S7's output is the deployed site
  plus the run's closing records: `site/seo-gate-report.md`,
  `site/deploy-report.md`, and the seal entry. `dist/` never
  commits; it is rebuilt on demand (§`dist/` discipline).

## The one-decision architecture

Three gates, one loop, strictly ordered. S7's only architectural move
is that **verification and deploy are separate refusals**: the SEO
gate checks the built artifact before any bytes leave the machine,
the smoke check verifies the deployed artifact after they land, and
neither substitutes for the other — a gate pass proves nothing about
the host, a smoke pass proves nothing about SEO contract. The
operator tweak loop repeats the whole sequence, never a shortcut
through it:

```
sites/<slug>/ ──> astro build ──> dist/ ──> SEO gate ──> rsync ──> smoke
      ▲                                                            │
      └────────────── operator ~10% tweaks ◀───────────────────────┘
                              │ sign-off
                              ▼
                             seal
```

`dist/` is ephemeral at every step. The durable artifacts are the two
reports and the deployed release on the host — a reviewer audits the
launch from `seo-gate-report.md` + `deploy-report.md` without
rebuilding or SSHing.

## Inputs

| Input | Source | Required |
|---|---|---|
| `sites/<slug>/` | S5 stage output, S6-mutated | YES — no S7 lane mints without it |
| `site/sitemap.md` | S1 stage output | YES — route-manifest parity check |
| `site/site-brief.md` `## Deploy` | NEW-WEBSITE intake | YES — the deploy target contract (below) |
| `site/design-dna/ROUTE-MANIFEST.json` | S5a stage output | YES — route list the gate counts against |

### The deploy declaration — `site-brief.md` `## Deploy`

The SSH target is declared, never discovered. `site-brief.md` carries
a `## Deploy` section:

```yaml
host_alias: <saved ssh alias>      # used via `ProxyJump jump`
user: <site user>                  # never root, never sudo-to-root
docroot: <absolute path>           # releases/ + current live here
url: https://<canonical origin>    # canonical base for sitemap/OG/smoke
```

- **`host_alias` is a saved alias** — the SSH/WordPress rule applies:
  connect via `ProxyJump jump`, operate as `user`, never as root.
  The lane reads the alias; it never embeds credentials, keys, or
  host literals in the repo.
- **`user` owns the docroot.** Deployed files land owned by the site
  user — the same "never leave files owned by `root`" bound the
  global SSH rule states. A docroot the `user` cannot write is a
  precondition failure, not a sudo request.
- **`url` is the canonical origin.** Canonical tags, `sitemap.xml`
  URLs and OG `og:url` are checked against it; the smoke check fetches
  from it. A mismatch between `url` and the site's canonical tags is
  a gate fail, not a warning.
- **Absent `## Deploy` → `prd_step ask`.** The site is not deployable
  without a declared target; the lane never guesses a host. This is
  the intake contract S1 should stamp — until S1 lands, S7's mint
  precondition is the check of record (see §Contested).

### Mint preconditions (the S7 gate's job, not the lane's)

1. `sites/<slug>/astro.config.mjs` exists and `astro build` exited 0
   at S5 — re-verified, not trusted.
2. `site/sitemap.md` row count equals `ROUTE-MANIFEST.json` route
   count (the same re-check every stage mints on).
3. `site-brief.md` carries a `## Deploy` section with all four keys —
   no target, no deploy lane.
4. `site/content-final/` still binds one file per manifest route
   (cheap count re-check; drift here means an upstream stage moved).

## `dist/` discipline

`dist/` is a build artifact, never source:

- `sites/<slug>/.gitignore` carries `/dist/` — the vendored
  `templates/astro/` starter already ignores it; the build lane
  never commits a build tree into a review diff.
- S7 rebuilds unconditionally: `astro build` in `sites/<slug>/`
  from a clean `dist/` (delete then build — incremental state is a
  stale-artifact channel).
- The reports name the build they verify: `seo-gate-report.md` and
  `deploy-report.md` each record `git -C sites/<slug> rev-parse HEAD`
  plus the build timestamp — the audit chain ties deployed bytes to
  committed source.

This answers the unpinned-ownership question directly: `dist/` is
disposable-until-S7, S7 rebuilds it, and the reports carry the
evidence — two builds (S5's self-lint, S7's gate) is intended
re-verification, not waste.

## Step-by-step — the deploy lane (`web-deploy-<site>`)

1. **Verify preconditions.** All four §Mint preconditions. Missing
   `## Deploy` → `prd_step ask` for the section; other failures are
   refusals naming the upstream stage that owns them.
2. **Pre-deploy probe.** Resolve the SSH hop before building:
   `ssh <host_alias> 'test -d <docroot> && test -w <docroot>'` via
   `ProxyJump jump`, as `user`. Creates `docroot/releases/` if the
   docroot is writable. A probe failure stops the lane here — never
   discover an unreachable host after the gate passes.
3. **Build.** In `sites/<slug>/`: clean `dist/`, run
   `npm run build` (the starter's `astro build` script — locked
   deps, no `npx` resolution). Non-zero exit refuses — S7 never
   deploys a partial build and never edits source to make the build
   pass; a red build goes back upstream as a defect, not a
   deploy-lane fix.
4. **SEO verification gate** — the checklist below, executed against
   `dist/` + the route manifest. Every check is mechanical and
   file-local; all findings — pass *and* fail — row into
   `site/seo-gate-report.md`. One fail refuses the deploy; the
   report is what the operator reads, so a fail is a record, not a
   silent abort.
5. **Commit the gate report.** `site: seo-gate <pass|fail>` — the
   report commits before deploy so a crash mid-rsync still leaves
   the verification record.
6. **Deploy.** On the host, per deploy:
   `releases/<UTC timestamp>/` is the new release dir. rsync:
   `rsync -az --delete --delay-updates --rsync-path="mkdir -p <docroot>/releases/<ts> && rsync" dist/ <host_alias>:<docroot>/releases/<ts>/`
   then `ln -sfn releases/<ts> <docroot>/current`. Atomic by symlink
   flip: nginx serves `current`, the flip is one syscall, rollback is
   `ln -sfn` back to the previous release — no restore step, no
   re-upload. `--delay-updates` keeps partial-file exposure inside
   the staging dir; `--delete` keeps releases honest mirrors.
7. **HTTP smoke check.** Fetch `<url>/` expecting HTTP 200 + ≥1 byte
   of HTML containing the homepage `<title>` text; fetch one money
   route and `<url>/sitemap-index.xml` (or `sitemap.xml`) expecting
   200. Findings row into `site/deploy-report.md` beside the release
   timestamp, head sha, rsync summary, and the `current` target. A
   smoke fail triggers the rollback flip *immediately* and refuses —
   the report carries which check failed.
8. **Hand to the operator.** `prd_step done` is *not* called yet —
   the lane posts the deployed `<url>` + both reports and raises
   `prd_step ask` for the tweak list — the ask is the wait
   mechanism, the answer arrives via inbox. This is the factory's
   review surface going live: the operator sees the real site, not
   a diff.
9. **Operator ~10% tweak loop.** Per tweak batch:
   - Operator lists tweaks; the lane applies them inside
     `sites/<slug>/` — tokens/components for visual changes (single
     owner per class keeps one edit site), copy edits only where the
     operator names them (copy is S3/S4's reviewed output; a tweak
     that rewrites copy wholesale is a re-run of upstream stages,
     not a tweak).
   - Re-run steps 3–7 unconditionally: rebuild → re-gate →
     re-deploy → re-smoke. Every iteration appends to both reports —
     the loop's history is auditable, and a tweak that breaks the
     SEO gate fails the same way a first pass would.
   - ~10% is the posture, not a hard cap: cosmetic calibration —
     spacing, colour, wording polish, CTA placement — lives here;
     structural changes (new routes, new sections, re-planned copy)
     refuse back to the owning stage's spec.
10. **Seal.** Operator sign-off flips the lane to done: the seal
    entry in `site/deploy-report.md` records sign-off, final release
    timestamp, head sha, and live `<url>`. `prd_step done` — closing
    names the seal and the iteration count. The seal is the run's
    terminal record; nothing mints after it.

## The SEO verification gate (checklist of record)

Executed against `dist/` per iteration. Each check names what it
verifies; a fail refuses deploy until fixed or explicitly overridden
by the operator in writing (the report records overrides — silence
is not consent).

| # | Check | Pass condition |
|---|---|---|
| 1 | Route parity | `dist/` holds exactly one HTML page per `ROUTE-MANIFEST.json` route — no orphans, no missing |
| 2 | Title | every page `<title>` non-empty, ≤60 chars, unique across routes |
| 3 | Meta description | every page `<meta name="description">` 140–160 chars, unique across routes |
| 4 | Canonical | every page `<link rel="canonical">` = `url` + route path |
| 5 | H1 | exactly one `<h1>` per page |
| 6 | OG tags | every page carries `og:title`, `og:description`, `og:url`, `og:type` |
| 7 | sitemap.xml | emitted, lists every route exactly once, URLs canonical-prefixed |
| 8 | robots.txt | emitted at `dist/robots.txt`, references the sitemap |
| 9 | Internal links | every `href="/…"` resolves to a built route — zero broken targets |
| 10 | Self-containment | no `src`/`href` fetches remote `http(s)://` assets outside `url`'s origin (fonts, scripts, styles) — S5's rule re-verified at the artifact |
| 11 | Image alt | every `<img>` carries a non-empty `alt` |
| 12 | CTA endpoints | every `<form action>` resolves to a same-site route or an endpoint declared in `site-brief.md` or by S6's stage output — a form posting nowhere is the dead-CTA defect shipped |
| 13 | Heading levels | no skipped levels per page (`h2`→`h4` without `h3`) |

Check 12 is the factory's end-to-end proof: it is the only check that
verifies S6 actually ran — a green S7 gate on a site S6 never
touched refuses on dead forms, which is the correct outcome.

## Output — `site/seo-gate-report.md` + `site/deploy-report.md`

```markdown
# seo-gate-report — <site> — <iso timestamp> — head <sha>
| check | result | detail |
| 1 route parity | PASS | 18 routes, 18 pages |
…
## Iterations
| iter | head | result | notes |
```

```markdown
# deploy-report — <site>
| iter | release | head | rsync | smoke | result |
| 0 | 20261030T1402Z | abc123 | 412 files | 200/200/200 | PASS |
## Seal
signed_off: <operator> — <iso timestamp> — release <ts> live at <url>
```

Both reports live in the run's `site/` folder — the artifact of
record, same convention as every cross-stage file. They commit with
the lane's worktree state; the seal section is the last write before
`prd_step done`.

## Acceptance (stage-internal)

The S7 done-criteria — the seal is valid only when all hold:

- `astro build` exited 0 on the final iteration.
- `seo-gate-report.md` exists; the final iteration shows every check
  PASS (or an operator override recorded per failed check).
- `deploy-report.md` exists; the final iteration's smoke checks all
  200; the `## Seal` section is populated.
- `dist/` is not committed anywhere in the diff.
- No remote-asset fetches, no broken internal links in the deployed
  build (checks 9–10, re-stated because they are the ship-blockers).

The spec-existence gate
(`test -s research/WEB-FACTORY-S7-GATE-DEPLOY.md`) proves this
document; the checks above are S7's done-criteria, verified at seal.

## Orchestration

- **One lane per site, sequential with the tweak loop inside it.**
  The tweak loop is not separate lanes — each iteration is small,
  shares context with the first pass, and parallelizing operator
  feedback across lanes re-orders it. `web-deploy-<site>` stays live
  from gate to seal.
- **Per-site independence.** Deploys never share release paths:
  `docroot` is per-site in `site-brief.md`; two sites' S7 lanes can
  run concurrently against different docroots/hosts.
- **Re-run safety.** A re-minted or resumed lane re-runs from step 1
  unconditionally — build+gate+deploy is idempotent (new release dir,
  symlink flip) and the reports append. The seal check is the
  short-circuit: a lane that finds a populated `## Seal` with a live
  `current` symlink matching it stamps done without redeploying.
- **Failure modes worth naming:**
  - *Gate fail at iteration N* — same refusal as iteration 0: the
    report rows it, deploy does not run, the tweak list grows. The
    loop never weakens the gate to converge faster.
  - *Smoke fail post-flip* — `ln -sfn` back to the previous release
    happens in the same step, then refuse; the host never sits on a
    broken `current` waiting for a fix.
  - *Unreachable host discovered late* — step 2's probe exists
    because a build+gate pass is expensive to redo; probe first.
  - *Tweak drift into structure* — a tweak list that grows into new
    routes or replanned copy is escalated back upstream; S7 is a
    calibration loop, not a second writing stage.
  - *Release accumulation* — `releases/` grows one dir per deploy;
    the lane prunes to the last 5 releases on each deploy (keep the
    current target + 4 back), so rollback depth is bounded and the
    docroot never fills.
  - *`dist/` staleness between iterations* — the unconditional
    clean+build in step 3 is the fix; never diff-deploy against a
    prior `dist/`.

## Contested

- **Atomic symlink releases vs. `rsync --delete` straight into
  docroot.** In-place rsync is simpler and leaves the site serving a
  half-updated tree for the rsync's duration — the defect class is a
  torn deploy, and symlink flip deletes it rather than narrowing it.
  One extra dir level buys atomicity + free rollback. Pruning to 5
  bounds the cost.
- **SEO gate at S7 vs. lints at S3/S5.** Both earlier stages lint
  *inputs* (frontmatter bounds, self-containment in `src`); only S7
  can check the *emitted artifact* — whether `<SEOHead>` actually
  rendered, whether the route table matches the plan, whether S6's
  forms land. The checks duplicate deliberately: input lint catches
  early, artifact gate catches what survived.
- **Gate as checklist vs. mechanical tool.** Same posture the whole
  corpus takes: the checks are mechanically evaluable and the lane
  self-executes them; a future `seo-gate` binary plugs into the same
  checklist without changing the contract. Naming each check's pass
  condition in a table is what makes that swap a no-op.
- **Operator loop inside the lane vs. a separate polish stage.**
  The ~10% loop needs the whole context (tokens, components, reports)
  and small turns — a fresh lane per tweak batch pays a cold-start
  per iteration and scatters the report history. One lane, appended
  reports, one seal.
- **`## Deploy` in `site-brief.md` vs. a separate deploy config.**
  The brief already carries every entity fact the factory binds;
  deploy target is the same class of fact — one intake file, one
  review. A separate config file duplicates the authority and can
  drift from the site's own declared `url`.
