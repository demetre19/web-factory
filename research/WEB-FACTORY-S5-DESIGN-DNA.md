# WEB-FACTORY-S5-DESIGN-DNA — Stage S5: Design DNA → Astro build

Stage S5 turns `site/content-final/` plus a design source — a
Design-library Website Build DOX packet, operator-supplied HTML/page
references, or both — into a Tailwind-classed Astro site at
`sites/<slug>/`, built on the vendored `templates/astro/` starter.

This document is the stage spec. A NEW-WEBSITE run mints two S5 lanes
from it: the **distill lane** (`design-dna-<site>`) produces the
distilled packet `site/design-dna/`; the **build lane**
(`web-build-<site>`) consumes it and produces the site. S6 must not
mint until `sites/<slug>/` exists and `astro build` exits 0.

## Position in the factory

```
S3 writer lanes ──> S4 link-graph + cleanup ──> site/content-final/*.md
                                                        │
 design sources ──> S5a distill ──> site/design-dna/ ──> S5b build
                                                        │
                                                        ▼
                                       sites/<slug>/  (astro build → dist/)
                                                        │
                                          S6 integrations → S7 gate+deploy
```

- **Upstream contract:** S4 emits `site/content-final/*.md` — same
  file schema as S3 output (`title`, `description`, `slug`, `path`,
  `type`, `primary_keyword` frontmatter + body), with the final link
  graph injected. `site/sitemap.md`, `site/tone-profile.md`, and
  `site/site-brief.md` still ride the run folder. Design sources are
  one or both of:
  - a **Website Build DOX export** — a ZIP from the Design-library app
    (`formatVersion: website-build-dox@1`) dropped into the run's
    `site/design/` folder by the operator;
  - **operator-supplied HTML/page refs** — captured HTML files and/or
    screenshots under `site/design/refs/`.
- **Downstream contract:** S6 wires forms/email/SMS into
  `sites/<slug>/`; S7 runs `astro build` + the SEO gate + rsync deploy.
  Both read `sites/<slug>/` as a normal Astro project — the build lane
  hands off a repo, not a report.

## The one-decision architecture

Two input branches, one representation. S5's only architectural move
is that **both design sources normalize into the same distilled
packet, `site/design-dna/`**, before any Astro code is written. The
build lane reads `site/design-dna/` — never the DOX ZIP, never the
raw HTML. That keeps one build path, one lint surface, and one review
artifact regardless of where the design came from.

```
DOX export.zip ──verify──┐
                         ├──> site/design-dna/ ──> web-build lane ──> sites/<slug>/
operator refs/*.html ────┘   (distilled packet)
```

The DOX path is extraction: the packet already *is* the reviewed
design authority — the distill lane verifies it, flattens it, and
cross-checks it against the sitemap. The refs path is derivation: the
distill lane produces the same files from captured evidence. Same
output shape either way, so §Step-by-step (build lane) below has no
source-dependent branches.

## Inputs

| Input | Source | Required |
|---|---|---|
| `site/content-final/*.md` | S4 stage output | YES — no build lane mints without it |
| `site/sitemap.md` | S1 stage output | YES — route manifest cross-check |
| `site/site-brief.md` | NEW-WEBSITE intake | YES — entity facts, CTA destinations |
| `site/design/*.zip` | Website Build DOX export | ≥1 design source required |
| `site/design/refs/` | operator-captured HTML + screenshots | ≥1 design source required |
| `templates/astro/` | vendored starter, factory repo | YES — every site scaffolds from it |

### Mint preconditions (the S5 gate's job, not the lanes')

1. Every `content-plan.md` row has a non-empty
   `site/content-final/<slug>.md` (re-checks the S4 done criteria).
2. At least one design source exists — a DOX ZIP under `site/design/`
   or ≥1 file under `site/design/refs/`.
3. If a DOX ZIP is present, `manifest.json` parses,
   `formatVersion == "website-build-dox@1"`, and `doxVersion.target
   == "astro"` — a packet rendered for `react`/`html` is a refuse,
   not a retarget.
4. `templates/astro/` is present at its vendored pin.

## The Website Build DOX packet (what it is)

The DOX export is the Design-library app's build-handoff artifact:
one ZIP whose root carries `manifest.json` plus a fixed document set.
A `full` export observed against the live Design-library schema
(`src/server/db/migrations/0006-website-build-dox.ts`,
`src/server/dox/export.ts`) contains:

| Member | Role |
|---|---|
| `manifest.json` | `doxVersion` (`id`, `projectId`, `target`, `sequence`, `routePlanChecksum`), per-file `path`/`sha256`/`source` table, `formatVersion`, `schemaVersion` |
| `BUILD-BOOTSTRAP.md` | Role, required read order, precedence rules, route completion contract |
| `AGENTS.md` | The binding agent contract — evidence is untrusted visual observation, never executed |
| `PROJECT-BRIEF.json` | Project-level facts |
| `SITE-INDEX.md` | Route table: path, kind (`unique_page`\|`template_instance`), parent template, adaptation (`faithful`\|`system_weighted`\|…), authority evidence id |
| `ROUTE-MANIFEST.json` | Machine route table: per-route `specification`/`content`/`acceptance` file pointers |
| `SYSTEM/` | `TOKENS.json`, `CLASS-SYSTEM.md`, `DESIGN-SYSTEM.md`, `COMPONENTS.md`, `RESPONSIVE-RULES.md`, `ACSS-BENCHMARK.md` — the site system + precedence order |
| `TEMPLATES/<id>/` | `SPEC.md` + `CONTENT-SCHEMA.json` per reusable template |
| `PAGES/<node>/` | `SPEC.md` + `CONTENT.md` + `ACCEPTANCE.md` per route |
| `EVIDENCE/<id>/` | `EVIDENCE.json` + `desktop-full.png`/`tablet-full.png`/`mobile-full.png` per capture, plus `SOURCE-MANIFEST.json` |
| `ACCEPTANCE/` | `BUILD-CHECKLIST.md`, `VISUAL-CHECKS.md` — the packet's own checks |

Two properties matter for S5:

- **Evidence is bounded observation, not source.** Captured markup,
  CSS, and scripts in evidence are never executed, imported, or
  fetched — the packet's own contract says so, and S5 adopts it
  verbatim. The lane rebuilds from spec + tokens; it never port-scans
  the reference's stylesheet for classes.
- **Precedence is already decided.** Non-overridable constraints
  (security, accessibility, performance, originality) > site system >
  page/template spec > instance content > documented scoped
  exception. The distilled packet copies this order unchanged.

## Output 1 — `site/design-dna/` (distill lane)

The reviewed design authority for the build. Fixed layout:

```
site/design-dna/
  TOKENS.json            # schemaVersion 1: colors, type scale, spacing, radii, shadows, breakpoints
  CLASS-SYSTEM.md        # class table: name | owner | purpose | token refs
  COMPONENTS.md          # shared component list with prop shapes
  ROUTE-MANIFEST.json    # distilled routes — DOX's verbatim, or refs-derived
  PAGES/<slug>/SPEC.md   # per-route section skeleton + layout spec
  DESIGN-DNA.md          # the distillation report: sources used, per-token provenance, flagged gaps
  dox/                   # verified DOX packet members, flattened (absent on refs-only sites)
```

- `dox/` is the *input authority* staged for audit; everything a build
  decision needs lives at the top level. A refs-only site has no
  `dox/` — that is the only visible difference between branches.
- `TOKENS.json` is the single implementation-token source. On the
  DOX branch it is the packet's `SYSTEM/TOKENS.json` copied after
  checksum verification; on the refs branch the distill lane writes
  it with `provenance` per token (`capture id + viewport + element`).
- `ROUTE-MANIFEST.json` on the refs branch is *derived from
  `sitemap.md`*, not invented — every sitemap row becomes a route,
  `page_class` (`money | article | ancillary` — surfaced as the
  content-file `type`, where `ancillary` reads `utility`, PRD D10)
  maps to template kind
  (`service-detail`-class for money, `article` for article,
  `utility` for ancillary). The refs provide the visual system; the
  sitemap owns the route list.

## Output 2 — `sites/<slug>/` (build lane)

A normal Astro project: `astro.config.mjs`, `src/pages/` filesystem
routes, `src/layouts/`, `src/components/`, `src/styles/` (Tailwind),
`public/` assets, `dist/` from `astro build`.

- `<slug>` is the site key from `site-brief.md` (the same slug the
  content files and writer lanes use).
- **Scaffold rule:** the build lane copies `templates/astro/` first —
  `cp -R templates/astro sites/<slug>` — then installs the *locked*
  dependencies the starter pins (npm-security rule: deterministic
  install, no unaudited lifecycle scripts, no exotic sources). It
  never `npm create`s a fresh skeleton: the vendored starter is the
  reviewed baseline (Tailwind integration, SEO head component, font
  strategy).
- **Component classes are the mechanism, not inline dumps.** Each
  `CLASS-SYSTEM.md` row becomes exactly one `src/styles/components/*.css`
  `@layer components` block composed of Tailwind utilities (or a
  `.astro` component when structure is involved). Pages import class
  names; they do not inline the utility stack per element. One owner
  per class survives from the DOX class system.

## Step-by-step — distill lane (`design-dna-<site>`)

1. **Register sources.** List `site/design/*.zip` and
   `site/design/refs/*`. DOX present → DOX is the authority for every
   route it covers; refs cover only routes DOX does not. Note the mix
   in `DESIGN-DNA.md`.
2. **Verify the DOX packet** (when present): extract; recompute every
   `manifest.json` file `sha256` — one mismatch refuses the packet
   (partial packets are not advisory). Confirm `formatVersion`,
   `target: astro`, and that `ROUTE-MANIFEST.json` parses.
3. **Cross-check routes.** Every `ROUTE-MANIFEST.json` path must match
   a `sitemap.md` `route` (the plan's `path` column carries the same
   value — `path == route` per D10). A DOX route with no sitemap row is *not*
   silently added — flag it in `DESIGN-DNA.md` and hold that route
   out of the build (route count is S1's authority). A sitemap row
   with no design source gets flagged for the fallback visual system
   (step 5) — never skipped.
4. **Flatten DOX authority.** Copy the packet's `SYSTEM/*`,
   `ROUTE-MANIFEST.json`, `PAGES/*` and `EVIDENCE/*` into
   `design-dna/` as above. `PAGES/<node>/CONTENT.md` is DOX-internal
   draft content — the real copy is `content-final/`; the distill
   lane copies the spec and acceptance files, not draft prose.
5. **Derive from refs** (routes without DOX coverage, or the whole
   site on refs-only): read captured HTML as *text evidence* —
   extract tokens (computed colors, type scale, spacing rhythm,
   radii, shadows), the shared layout regions (header/nav/footer),
   and the section vocabulary. Write `TOKENS.json` with provenance,
   `CLASS-SYSTEM.md`, `COMPONENTS.md`, and `PAGES/<slug>/SPEC.md`
   section skeletons. The captured markup is never copied into the
   output — only the observations are.
6. **Write `DESIGN-DNA.md`.** Sources used, per-token provenance,
   routes held out, routes on fallback, every deviation flagged. This
   file is the review artifact — a reviewer should audit the
   distillation without opening the DOX ZIP or the captures.
7. **Commit.** `site: design-dna` — one commit; the packet is
   reviewable as a unit.
8. **Done.** `prd_step done` — closing names the source mix and flags.

## Step-by-step — build lane (`web-build-<site>`)

1. **Read order (packet contract, verbatim):** `design-dna/` →
   `BUILD-BOOTSTRAP` equivalents (this spec), `TOKENS.json`,
   `CLASS-SYSTEM.md`, `COMPONENTS.md`, `ROUTE-MANIFEST.json`,
   `PAGES/*/SPEC.md`, then `content-final/*`. Evidence PNGs are
   consulted only to resolve ambiguity a spec does not answer — as
   visual observation, never as markup.
2. **Scaffold.** `cp -R templates/astro sites/<slug>`; deterministic
   install of the starter's locked deps. Record the starter's pin in
   the commit.
3. **Tokens → Tailwind.** Generate the theme layer from
   `TOKENS.json`: Tailwind `theme.extend` entries + CSS custom
   properties on `:root` (`--c-*`, `--sp-*`, `--r-*`, `--font-*`).
   An empty `TOKENS.json` (observed in smoke packets) is not license
   to invent — the lane falls back to the starter's token defaults
   and names every defaulted token in `DESIGN-DNA.md`'s deviation
   list.
   Fluid typography is REQUIRED, not optional: the type scale is a
   fluid scale (per-step `clamp(min, vw-based, max)` values — the
   `utopia.fyi`/type-scale approach), expressed as Tailwind
   `fontSize` tokens or `--fs-*` custom properties. Sizes interpolate
   continuously between the mobile and desktop endpoints; NO
   breakpoint-stepped font sizes (media-query `text-sm`→`text-xl`
   jumps) — the scale is fluid all the way up and down. Headings,
   body, and nav/footer type all ride the same scale. The same rule
   applies to spacing rhythm tokens where the DOX packet supplies a
   fluid pair.

4. **Components → `src/components/`.** One `.astro` component per
   `COMPONENTS.md` row plus one `@layer components` class per
   `CLASS-SYSTEM.md` row. Shared regions (header/nav/footer/CTA
   block) become components once and import everywhere — the class's
   single owner rule maps to the component file being the single
   definition site.
   The nav/header component MUST be a real functional menu on mobile
   (hamburger → full-screen or drawer panel, focus-trapped, dismissible)
   and the footer a complete site map + NAP/contact block — not
   placeholders. Nav link LABELS are shortened forms of the route's
   long category H1 (e.g. H1 `Auto Dent Removal Service` → label
   `Dent Removal`); the lock binds URL/H1/title, never the label —
   labels must fit the mobile bar.

5. **Templates → `src/layouts/`.** One layout per template node
   (`service-detail`-class, `article`, `utility`) and one per unique
   page that carries its own structure. Template-instance routes
   share the layout; unique pages (`/`) get their own section order
   from `PAGES/<slug>/SPEC.md`.
6. **Routes → `src/pages/`.** One page file per
   `ROUTE-MANIFEST.json` route: `path → src/pages/<path>/index.astro`
   (dynamic template folders like `services/[slug].astro` only when
   the route manifest declares the parametrization — otherwise one
   file per accepted route, per the DOX route-completion contract).
   The page's content binding is `content-final/<slug>.md` matched
   on `path` — frontmatter feeds `<SEOHead>` (`title`,
   `description`, canonical); the body feeds the layout's section
   slots. Frontmatter fields are *copied*, never rewritten — the
   copy is S3/S4's reviewed output.
7. **Assets → `public/`.** DOX `EVIDENCE/` images the specs actually
   use (hero art, gallery) copy to `public/assets/` — screenshots
   captured purely as *reference* stay out of the shipped site.
8. **Self-lint before commit:**
   - every `ROUTE-MANIFEST.json` path has a page file and every page
     file maps to a manifest route (no orphans either way);
   - every manifest route resolves to a `content-final` file via
     `path` ↔ `path` — a route with no copy is a refuse, never a
     `lorem`/placeholder page;
   - zero arbitrary values in authored files (`w-[…]`/`text-[…]`
     outside the token layer) — arbitrary dimensions are the exact
     anti-pattern `TOKENS.json` exists to kill;
   - no `<script src="http…">`, no remote font/stylesheet imports,
     no fetched reference URL — output is fully self-contained;
   - `astro build` exits 0 and emits one `dist/` HTML file per route.
9. **Commit per seam.** `site: scaffold`, `site: tokens+components`,
   `site: routes` — a crash loses at most the in-flight seam.
10. **Done.** `prd_step done` — closing names routes built, checks
    run (per DOX's required-response contract: files created, checks
    executed, deviations, unresolved evidence).

## Acceptance (stage-internal)

The S5 done-criteria the coordinator checks before minting S6:

- `site/design-dna/` carries `TOKENS.json`, `CLASS-SYSTEM.md`,
  `ROUTE-MANIFEST.json`, `DESIGN-DNA.md` — all non-empty.
- `sites/<slug>/` exists, `astro build` exits 0, and `dist/` holds
  exactly one HTML file per `ROUTE-MANIFEST.json` route.
- Every `content-final` file is bound to exactly one route (count
  parity with the sitemap re-checked here).
- No authored file contains a remote `http(s)` fetch in `src` —
  scripts, stylesheets, fonts, or reference URLs.
- `DESIGN-DNA.md` names every held-out DOX route, every fallback
  route, and every defaulted token.

The spec-existence gate (`test -s research/WEB-FACTORY-S5-DESIGN-DNA.md`)
proves this document; the checks above are S5's done-criteria.

## Orchestration

- **Two lanes, strictly ordered.** Distill then build — the build
  lane's mint precondition is a non-empty `site/design-dna/`. They
  never run concurrently: `ROUTE-MANIFEST.json` is the seam between
  them and it must exist in final form before the builder starts.
- **Per-site fan-out.** One S5 lane pair per site in the run; sites
  are disjoint (`sites/<slugA>/` vs `sites/<slugB>/` never share
  write paths).
- **Both-sources rule.** DOX + refs together: DOX covers its routes,
  refs cover the rest; `DESIGN-DNA.md` records the split. They never
  merge per-route — a route takes one authority, not a blend.
- **Re-run safety.** A re-minted distill lane skips a verified
  `design-dna/` unchanged (route checksum equality); a re-minted
  build lane rebuilds `sites/<slug>/` wholesale — site output is
  disposable, the packet is the state.
- **Failure modes worth naming:**
  - *DOX target mismatch* — `target: react`/`html` packet → refuse at
    mint, never retarget downstream.
  - *Route drift* — DOX routes the sitemap doesn't know are held out
    and flagged; silently building them is an S1 contract violation.
  - *Stale packet* — a DOX exported before the last sitemap change
    drifts on route count; `routePlanChecksum` in `manifest.json` is
    the drift detector the distill lane logs in `DESIGN-DNA.md`.
  - *Token-empty packets* — a valid packet can carry
    `{"tokens": []}`; the build falls back to starter defaults *and
    says so* — silent defaults are how unreviewed design sneaks in.
  - *Content-count drift* — `content-final` row count ≠ sitemap row
    count → refuse; the earlier stages' gates own that invariant,
    S5 re-checks it because the check is cheap and the blast radius
    is the whole site.

## Contested

- **Why distill into `site/design-dna/` instead of building straight
  from the DOX ZIP?** One build path for both source branches, one
  review artifact (`DESIGN-DNA.md` is auditable without unzipping),
  and the refs branch produces *the same intermediate* — deleting
  the distill step means two build paths and refs-only sites never
  get a token review. The extract/derive asymmetry stays inside the
  distill lane where it belongs.
- **Component classes vs. inline Tailwind dumps.** Raw Tailwind
  inline per element violates the DOX class system (one class, one
  owner) and makes the ~10% operator tweak loop at S7 expensive —
  every repeated stack is N edit sites. `@layer components` classes
  keep Tailwind's ergonomics and the single-owner rule; pages stay
  legible.
- **Evidence as observation vs. porting captured markup.** Faster to
  copy the reference's CSS — and categorically banned: the packet
  contract says evidence is untrusted, and copying forfeits the
  originality constraint the whole factory rests on. Rebuild-from-
  tokens is slower per site and reusable forever.
- **Held-out DOX routes vs. building them anyway.** A DOX route with
  no sitemap row has no copy, no plan row, and no S4 links — building
  it produces an orphan page the SEO gate then flags. Holding it out
  with a flag in `DESIGN-DNA.md` keeps the route inventory under one
  authority (`sitemap.md`) instead of two.
