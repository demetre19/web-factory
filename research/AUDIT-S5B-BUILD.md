# AUDIT-S5B-BUILD — adversarial audit of the S5 **build lane** (`web-build-<site>`)

Scope: the sequential-build half of S5. The operator mandates S5 split
into a design-system lane and a build lane; the current spec already
splits distill/build (`WEB-FACTORY-S5-DESIGN-DNA.md:8-12`), so this
audit tests whether the *build* half as specced can assemble a site
whose page shape follows the copy — and what must exist before its PRD.

Audit date: 2026-11-02. Live evidence: gobox + cleanpursuit location
pages fetched (tinyfish `fetch_content`, markdown + image_links +
metadata).

---

## 1. Scope audited

| File | Lines read |
|---|---|
| `research/WEB-FACTORY-S5-DESIGN-DNA.md` | whole spec; build portions :153-173, :213-305, :310-341 |
| `templates/astro/` | every source file: `package.json`, `astro.config.mjs`, `tailwind.config.mjs`, `src/site.ts`, `BaseLayout.astro`, `SEOHead.astro`, `Header.astro`, `Footer.astro`, `index.astro`, `global.css`, `public/_headers`, `public/robots.txt`, `templates/STARTER.md` |
| `research/WEB-FACTORY-S3-WRITING.md` | file schema :63-153 — what `content-final/` can express |
| `research/WEB-FACTORY-S4-INTERLINK.md` | :176-235, :302-335 — `content-final/` schema + never-touch list |
| `research/WEB-FACTORY-S6-INTEGRATIONS.md` | :33-46 upstream contract, :164-211 form.php, :247-267 CSP, :311-314 degrade flip |
| `research/WEB-FACTORY-S7-GATE-DEPLOY.md` | :102-131 preconditions/`dist/` discipline, :200-225 SEO gate |
| `skills/s5-design-dna/SKILL.md` | whole — form contract lives here (:66-69), not in the spec |
| `research/WEB-FACTORY-LOCATION-PAGES.md` | §2 module table :124-143, §6.12 build hooks :305-310, §7 S5 delta :326 |
| `research/WEB-FACTORY-SITEMAP-SOP.md` | Step 5 :168-215 — what competitor mining extracts (taxonomy + title formulas only) |
| `PRD-Web-Factory-2026-10-30.md` | §5.2 `page_class` closed set :131, OI-3 :201 |
| `docs/machinery/WEB-FACTORY.md` | S5 row :27, pipeline parity invariant :60-64 |
| `/Users/apple/Developer/prd-herdr/research/WEB-FACTORY-S1-SITEMAP.md` | row schema :268, S5 consumer row :317, ancillary matrix :131 |

Module boundary: everything after `site/design-dna/` exists —
scaffold → tokens → class system → components → layouts → routes →
assets → `astro build` exit 0 → hand to S6. Distill-lane internals
(DOX verification, refs derivation) are out of scope *except* where
the distill packet's shape starves the build (F1, F2, F6).

## 2. Current contract (as specced today)

| Face | Contract | Cite |
|---|---|---|
| Inputs | `site/content-final/*.md` (S4), `site/sitemap.md`, `site/site-brief.md`, `site/design-dna/` (S5a), `templates/astro/` | S5 spec :65-74 |
| Output | `sites/<slug>/` — normal Astro project, `astro build` exit 0, `dist/` disposable | S5 spec :153-157; S7 :113-131 |
| Step order | read → `cp -R` scaffold → tokens→Tailwind → components → layouts → routes → assets → self-lint | S5 spec :213-282 |
| Content binding | `content-final/<slug>.md` ↔ route on `path`; frontmatter copied verbatim into `<SEOHead>`; body "feeds the layout's section slots" | :262-270 |
| Per-type assembly | `page_class` → template kind: `service-detail`-class (money), `article`, `utility` (ancillary) | :147-149, :256-260 |
| Components | one `.astro` per `COMPONENTS.md` row; one `@layer components` block per `CLASS-SYSTEM.md` row; no inline utility stacks | :168-173, :242-247 |
| Assets | DOX `EVIDENCE/` images "the specs actually use" → `public/assets/`; reference-only screenshots stay out | :271-273 |
| Self-lint | route↔page parity both ways; every route has copy; zero arbitrary Tailwind values; no remote `http(s)` in `src` | :274-282 |
| Done | `astro build` exit 0; `dist/` one HTML per manifest route (skill :72-80) | S5 spec :292-305 |

**What is *not* in the contract:** build sequencing inside a page
(header→footer→sections), a content→component mapping, any asset
*inventory*, dependency leanness enforcement, rendered-DOM
verification, per-page-type assembly procedures beyond the
three-template mapping, breadcrumbs, structured data, forms.

## 3. Discovery-question expansion — the question bank S5b must answer

### 3.1 Source & provenance

- Where does each authored file's **section list** come from —
  `PAGES/<slug>/SPEC.md` (design authority) or the markdown's own
  H2 skeleton (content authority)? Today both exist and neither
  yields (F1).
- Where do **images** come from per section — DOX `EVIDENCE/` is the
  only named source and it is *design capture*, not site imagery
  (hero photos, team shots, service galleries). On a refs-only site
  the asset source is *nothing* (F2).
- Where do **fonts** come from? `site-brief.md` carries no
  brand-asset fields (PRD §5.1 :117-119); the starter ships a system
  stack (`global.css:42-43`). Self-containment bans Google Fonts CDN
  — a brand font needs a self-hosted `woff2` source nobody collects.
- Where does the **contact form contract** come from? Today only
  `skills/s5-design-dna/SKILL.md:66-69` and S6's upstream contract
  (S6 :33-36) — the S5 spec's own steps never mention a form (F5).

### 3.2 Authenticity / no-fabrication

- Frontmatter is copied verbatim — answered (:268-270).
- NAP/footer facts come from `site-brief.md` via `src/site.ts`
  (`site.ts:1-19`) — answered mechanically, but the lane must lint
  that `site.ts` was actually filled (starter ships
  `'Example Site'`/`'(000) 000-0000'` placeholders, `site.ts:22-32`)
  — a missed fill ships a fake NAP, which is worse than none. No
  check exists (F3).
- **Reviews/testimonials:** winner pages embed live Google reviews
  (gobox: 6 reviews + remote `googleusercontent.com` avatars;
  cleanpursuit: 10 Trustindex reviews). Our CSP is
  `img-src 'self'` (S6 :257) — avatars can't hotlink, widgets can't
  embed. If S3 wrote testimonial copy, is it *real* (sourced from the
  brief's `## Reference copy`) or fabricated? The build lane must
  know which it is rendering — unanswered (F8).

### 3.3 Classification

- `page_class` → template kind is answered for
  `money|article|ancillary` (:147-149) — but the location module
  proposes `page_class: location` (location spec §7 :322) which is
  **not in the closed set** (PRD §5.2 :131). S5b can't type-check a
  location leaf today (F6).
- Does `intent` affect module posture? A `transactional` cost page vs
  a `commercial` service page should weight CTA/proof modules
  differently — no spec carries intent into layout choice.
  Unanswered (F1's component map must consume it).
- Index pages (`/service-areas/`, blog hubs): ancillary by class but
  structurally they are *grids of their children* (location spec
  :177, :305-310). The `utility` template can't express a grid —
  unanswered (F6).

### 3.4 Competition census → page sizing (theme: aim high, not minimum)

- The S1/SOP competitor-mining pass extracts **taxonomy histograms +
  title/H1 formulas** (SITEMAP-SOP :186-206) — never per-page module
  counts or word counts. The signal "how big are the winners' pages"
  is never recorded upstream.
- Live measurement (fetched 2026-11-02): gobox location leaf carries
  **11 H2 modules** (hero+CTA, suburb copy, delivery facts, why-us,
  6-item use-case grid, live reviews, comparison table, size guide,
  3-step process, suburbs block + warehouse NAP, 10-question FAQ,
  closing CTA), **~17 `<img>`** incl. 6 review avatars + 2 unit GIFs;
  cleanpursuit leaf carries ~11 modules (hero+rating, 4 benefit H3s,
  4 stats, 10 live reviews, 3-step process, 8 service-card grid, 10
  FAQs), **~29 `<img>`** incl. 8 service-card images + ~20 avatars.
- S3's money-page word target is 800–1200 (S3 :117); a rendered-
  markdown page at that volume is roughly **half a gobox leaf**.
  Sizing is upstream's call — but S5b's component vocabulary must be
  able to *hold* the winner ceiling (F1, F9).
- SERP stats (which modules recur — FAQ accordion, comparison table,
  step grid, stats band): absent from every upstream artifact. The
  distill lane can only derive module vocabulary from DOX/refs, never
  from the SERP winners the content was sized against (F1/F6).

## 4. Gap findings

### F1 — BLOCKER. Page shape cannot follow the writing: no content→component contract exists

Two authorities claim the section list and neither wins:

- **Design side:** `PAGES/<slug>/SPEC.md` carries "per-route section
  skeleton + layout spec" (S5 :132) — a *design* artifact that knows
  nothing about the actual copy.
- **Content side:** `heading_skeleton` in `content-plan.md` names H2
  roles (S2; S3 :93-101 binds writers to it, S4 :231-235 forbids
  reordering). The rendered markdown body is the *content* skeleton.

When SPEC.md says 8 sections and the copy carries 11 H2s, the spec is
silent. Worse: the markdown schema (S3 :70-83) is frontmatter + flat
H2/H3 prose. Nothing in a `content-final` file can say *this H2 is a
card grid, this H2 is a FAQ accordion, insert a CTA block after the
proof section, this module takes 4 images*. "the body feeds the
layout's section slots" (:268-269) names a mechanism that has no
schema: slots are not declared, section boundaries are not marked,
media slots don't exist. The build lane will either (a) render
markdown as one prose column — shipping a site structurally identical
to a Google Doc — or (b) improvise section splitting per page with no
reviewable record. Both are silent-drift defects of the class
ADVERSARIAL-REVIEW F1 named for `sitemap.md`: consumers hardening
around an unwritten producer contract.

**Spec needed:** a module-callout grammar inside `content-final`
files (e.g. a fenced `<!-- @module faq -->` / `<!-- @cta -->` /
`<!-- @media hero src=… alt=… -->` marker set, or a frontmatter
`modules:` list S2 emits from `heading_skeleton`), a defined
markdown→component mapping table (H2→`<Section>`,
`## Related`→`<RelatedNav>` not a styled section, FAQ-shaped
H3-clusters→`<FAQAccordion>`, markdown tables→`<ComparisonTable>`),
and a precedence rule: **content volume wins; SPEC.md supplies
visual treatment per module type, never the section list** — S3's
skeleton is the shape authority the way `sitemap.md` is the route
authority. This is an upstream contract change (S2/S3 emit callouts,
S4 preserves them verbatim) the build lane cannot self-supply.

### F2 — BLOCKER. No asset pipeline: images, icons, fonts have no inventory, no source on the refs branch, no optimization path

- **Source:** `public/assets/` gets DOX `EVIDENCE/` images "the specs
  actually use" (:271-273) — but DOX evidence is *design-reference
  capture*, not the business's photography. A refs-only site has
  **zero** image sources. `site-brief.md` carries no `brand_assets`/
  photo-library field (PRD §5.1). The winner evidence: gobox ships 17
  images/leaf, cleanpursuit 29 — a brochure with none is not
  competitive.
- **Optimization:** the starter never uses `astro:assets`/`<Image>`
  (no import anywhere in `templates/astro/src/`); every image lands
  in `public/` unprocessed — no responsive `srcset`, no intrinsic
  `width`/`height` (CLS), no WebP/AVIF. Astro 5 bundles sharp, so
  `src/assets/` + `<Image>` costs zero new deps.
- **Cache contract bug:** `public/_headers` marks `/assets/*`
  `immutable, max-age=31536000` (templates `_headers:3-4`) but
  `public/assets/` files are **unversioned** — a replaced hero serves
  stale for a year. Either fingerprint names or move to
  `src/assets/` where Astro emits `/_astro/` hashed files.
- **Icons:** no icon set, no `<Icon>` component, no mechanism for the
  animated-SVG-icon requirement (operator theme: animated SVG
  preferred). `Footer`/`Header` ship no icons; the spec names none.
- **Fonts:** `--font-sans` is a system stack (`global.css:42-43`).
  Brand fonts need self-hosted woff2 + `<link rel="preload">` +
  `font-display: swap` — unowned, and any Google-Fonts `<link>` a
  lane adds trips the remote-fetch lint *correctly*, leaving the
  lane no legal way to ship a font at all.

**Spec needed:** `site/design-dna/ASSET-MANIFEST.json` (new
artifact): per-route asset slots `{route, slot, type: image|icon|
font, source: dox|brief|generated, file, alt?, sizes}` — S5a emits
it, S5b binds it, a lint verifies every slot resolves to a file and
every file has a slot (no orphan assets, no unslotted images). S0
gains a `brand_assets` intake folder for photos/logo/fonts.

### F3 — MAJOR. Verification stops at compile: `astro build` exit 0 + prose lints can ship an empty or example-branded site

The self-lint (:274-282) verifies *file existence* and *authored-file
purity* — nothing checks the **rendered output**:

- `astro.config.mjs` ships `site: 'https://example.com'`
  (astro.config.mjs:9); `robots.txt` ships
  `Sitemap: https://example.com/…` (`robots.txt:5`). Both are
  regenerated-per-site fields (STARTER.md :45-48) — a lane that
  forgets produces canonical tags, OG URLs, and sitemap.xml on
  `example.com`, and **every S5 check still passes**. S7's canonical
  check (:212) is the first thing that catches it — two stages late.
- `src/site.ts` placeholder facts (`'Example Site'`,
  `'(000) 000-0000'`) render a fake NAP into every footer — again
  green under today's lints.
- A route file that mounts `BaseLayout` and renders no body passes
  route parity + build; S7 check 5 catches "no `<h1>`" but nothing
  catches "empty `<main>`", "nav has 0 links", or "form missing".
- Per ADVERSARIAL P3 (:252-260), every lint is a prose checklist the
  lane self-executes — the compile-plus-prose posture has no
  mechanical floor at all on this lane.

**Spec needed:** a rendered-DOM check inside S5b's self-lint (tool,
§6): per emitted `dist/**/*.html` — exactly one `<h1>`; `<main>`
non-empty; `<header>`/`<footer>` present with ≥1 nav link each;
frontmatter `title`/`description` == rendered `<title>`/meta;
`grep -r example.com dist/` returns nothing; contact route carries
`action="/form.php"` + `hp` + `ts`. Boundary vs the responsive-
testing module: S5b asserts *structure* in emitted HTML; the
responsive lane owns *viewport matrices and screenshots*. Boundary
vs S7: S7 re-verifies SEO contract on the artifact; S5b proves the
artifact is *renderable at all*. No overlap.

### F4 — MAJOR. Lean-stack is a stated posture with zero enforcement — a `npm install gsap` trips no check

- The banned-mechanism class (GSAP, animation libraries — operator
  mandate; the Apiary reference ships `motion@12` in its
  `package.json`, i.e. even our exemplar uses a JS animation lib the
  factory bans) has no detector. The remote-fetch lint (:302-303)
  checks *authored source URLs* — a vendored `gsap.min.js` or a
  `node_modules` import is invisible to it.
- `package.json` is pinned (STARTER.md :9-19, exact versions,
  lockfile v3) but **no lint diffs the site's `package.json`/
  `package-lock.json` against the starter pin**. The scaffold rule
  bans `npm create`, not `npm install`.
- No bundle budget exists. Tailwind's tree-shaken CSS plus one
  bundled nav script should total ~tens of KB; a silent framework
  runtime (any `client:*` hydrated island, GSAP, slider lib) inflates
  it with no tripwire. `client:load`/`client:visible` directives are
  also unlinted — Astro hydration is a JS-runtime channel orthogonal
  to "remote fetch".
- Inline-script escape hatch: Astro bundles component `<script>`
  tags into external files (CSP-safe), but `is:inline` or
  `define:vars` emits inline JS that **breaks S6's
  `script-src 'self'` CSP** (S6 :257). `Header.astro`'s menu script
  is already a bundled `<script>` — the contract is "bundled only",
  and nothing enforces it.

**Spec needed:** self-lint additions — (a) `package.json` +
lockfile diff vs starter: dep set must be identical, versions pinned;
(b) dist asset budget: `dist/_astro/*.js` total ≤ budget and zero
`.js` outside `/_astro/` emitted from `src` (fonts/images exempt);
(c) ban list on directives/attrs: `client:*`, `is:inline`,
`define:vars`, `<script src=`, `@import url(`; (d) `grep -r
"<script>" dist/` (unattributed inline) fail.

### F5 — MAJOR. The contact-route form contract lives in the SKILL, not the spec — a spec-bound lane ships no form

S6's upstream contract requires S5 to render
`<form action="/form.php" method="POST">` with `name`, `contact`,
`message`, `site`, `hp`, `ts` fields plus both `?sent=` render
branches (S6 :33-40, :195-210, :311-314). `skills/s5-design-dna/
SKILL.md:66-69` repeats it. **The S5 spec itself never says it** —
steps 1-8 (:213-282) bind markdown to routes and stop. A lane running
the spec (skills are loaders, specs are authority per every stage's
own wording) produces a contact page with no form; S7 check 12
(:220) refuses it two stages later as "form posting nowhere". Same
defect class as ADVERSARIAL F4's "contract referenced but unwritten":
the form is the only S5→S6 seam that exists *only* downstream.

Fix: the S5 spec gains a contact/quote route clause — emit the S6
field contract verbatim, both `sent` branches rendered, honeypot
hidden, `ts` set at render — plus a self-lint row grepping the built
contact page for `action`, `name="hp"`, `name="ts"`.

### F6 — MAJOR. Per-page-type assembly is one template-mapping sentence; location leaves, index grids, and parametrized families are unbuildable as specced

- **`location` isn't a type.** The location module needs
  `page_class: location` (§7 :322); the closed set is
  `money|article|ancillary` (PRD §5.2 :131, S1 :110). S5's
  `type`→template mapping (:147-149) has no location branch — a
  25-leaf cluster can't mint until S1/OI-3 lands the set change.
- **Index/grid pages have no component.** Location §6.12 (:305-310)
  demands a crawlable suburb grid + `BreadcrumbList`; `/service-areas/`
  is `ancillary` in the matrix (S1 :131) — the `utility` layout is a
  prose shell, not a grid. Grid data (children of a `parent`) exists
  in `sitemap.md` but the spec never tells S5b to read `parent` for
  assembly — only for route count.
- **Parametrization can't be declared.** `[slug].astro` is allowed
  only "when the route manifest declares the parametrization"
  (:263-265) — but `ROUTE-MANIFEST.json` on the refs branch is
  sitemap-derived (:144-151) and the sitemap schema has no
  `parametrized`/`template_id` field, so the dynamic-route path is
  unreachable outside DOX. 25 identical `.astro` files per location
  family works but is 25 edit sites — the exact anti-pattern the
  spec elsewhere bans (F5's own :351-356 class-owner argument). And
  inside a `[slug]` page, the `content-final/<slug>.md` binding
  mechanics (import glob → match frontmatter `path`) are unwritten.
- **404/ancillary edge routes:** the ancillary matrix includes `/404`
  (S1 :131); `src/pages/<path>/index.astro` mapping (:262) yields
  `404/index.astro` → `/404/` — but static hosts want `404.html`
  from `src/pages/404.astro`. One-line edge rule missing.
- **`## Related` semantics:** the block is navigation, not content
  (S4 :164-169). As flat markdown it renders as an `<h2>` +
  `<ul>` inside prose — and S7 check 13 counts it toward heading
  structure. Whether `## Related` maps to a `<nav>`-semantics
  component is undefined (feeds F1's mapping table).

**Spec needed:** per-type assembly tables (§7 step E): money/service
— hero→benefit/proof/step/CTA module flow; location — the M1–M10
module table (:124-143) as the component contract; index — grid of
`parent`-children cards; article — prose-first, `og:type=article`
prop already exists (`SEOHead.astro:17`); ancillary — prose + NAP;
contact — form contract (F5). Plus `parent` → breadcrumb + grid
derivation, and `template_instance`/`parametrized` fields added to
the refs-branch ROUTE-MANIFEST schema.

### F7 — MAJOR. Structured data is unowned: no JSON-LD anywhere in the spec or starter

Winner leaves carry FAQ structure (gobox's 10-question FAQ reads as
FAQPage-schema-shaped) and the location spec already demands
`BreadcrumbList` keyed to `parent` (:305-310). The starter emits only
`itemscope` NAP microdata in the footer (`Footer.astro:21-27`) —
useful but not the JSON-LD schema blocks Google consumes (FAQPage,
Service, BreadcrumbList, LocalBusiness). S7's gate (:207-221) checks
no structured data at all — the whole channel is unverified end to
end. Where schema is required it must be generated from *content*
(FAQ JSON-LD must mirror the rendered Q&As — generated, never
hand-written, or it drifts). Feeds the same "SEO baked into the
build" theme; this is the build half's share of it (heading vectors
are S3/S7's).

### F8 — MINOR. Live-review modules conflict with self-containment; testimonial authenticity unverified

gobox renders Google reviews server-side with remote avatars;
cleanpursuit uses Trustindex. Both are legal under *their* stack and
illegal under ours: `img-src 'self' data:` and
`script-src 'self'` (S6 :257) ban remote avatars and widget JS. The
build lane needs a review strategy: verbatim review text from
`site-brief.md` `## Reference copy` (authentic, operator-supplied) —
with a rule that S3 may only write testimonials the brief sources
(F8's entity-fact rule already covers this for *facts*; reviews are
a fact subclass worth naming). Unresolved = the lane either invents
reviews (authenticity violation) or drops the module (SERP-winner
module absent).

### F9 — MINOR. CTA/module interleave placement is prose-only — unlintable and under-dimensioned

S3 mandates "at least one mid-page CTA after the first proof section"
(S3 :118). In rendered markdown nothing marks where the proof
section ends — the build lane guesses, and no lint verifies a CTA
exists mid-page at all. Winner pages run ~6 CTA surfaces per leaf
(gobox: hero, post-delivery-facts, size-guide ×2, closing, footer
band). The `cta` plan field is one string; nothing expresses
*multiple* CTA surfaces or their positions. Folds into F1's callout
grammar (`<!-- @cta -->` markers S3 inserts at natural seams), but
named separately: even with callouts, a *count/position* lint needs
a stated rule (e.g. money pages ≥2 CTA surfaces: mid + closing).

### F10 — MINOR. `dist/` and `node_modules/` lifecycles are fine; per-route build order inside the lane is unstated

S7 pinned `dist/` discipline (:113-131) — closed. But within the
lane, route assembly order is unspecified: money pages first (the
S2/S3 "money batch first" posture, S3 :214-215) is the natural rule —
highest-value copy gets the most review attention and earliest
commit seams. Minor because any order *works*; the finding is that
commit seam order and per-route verification granularity
(one commit per page-type phase vs one commit at the end) are
unstated — S5's seams (:265-266) name scaffold/tokens/routes but not
"one route-family per commit", the granularity S3 established as the
review-surface norm (`site: content <slug>`, S3 :182-184).

## 5. Split / sub-module proposal

The operator mandates a *sequential* build lane — keep `web-build-
<site>` as one lane, phased. What the spec should add is not new
lanes but **two artifacts and one gate**:

1. **`site/design-dna/ASSET-MANIFEST.json`** (new, S5a-owned,
   S5b-verified) — per-route asset slots (F2). This is the distill
   lane's half of the asset contract; the build lane cannot invent
   image sources, only bind declared ones.
2. **`site/build-report.md`** (new, S5b-owned) — the build lane's
   review artifact, symmetric with `DESIGN-DNA.md`/`cleanup-report.md`:
   per-route assembly record (module list rendered, callouts
   consumed, assets bound, deviations flagged). Today the build has
   *no* review artifact — `sites/<slug>/` itself is asked to be the
   report (S5 :40-41 "hands off a repo, not a report"), which makes
   section decisions unauditable.
3. **Build lint gate** — the mechanical checks in §6, run on `dist/`
   + `src/` before commit; a row-per-check report appended to
   `build-report.md` (the S7 seo-gate-report shape, :228-236).

Optional fan-out (only if sites grow past ~25 routes/family):
`web-build-<site>-pages-<family>` sub-lanes scoped to
`src/pages/<family>/`, minted *after* the shared shell + design
system commits — disjoint write_paths, same seam discipline as S3's
writer batches. Not required for the current ~20–80-route envelope;
named, not prescribed.

## 6. Automation surface

| Tool (stub) | Mechanical checks | Feeds finding |
|---|---|---|
| `tools/build_lint.py` | route parity (`dist/**/*.html` ↔ ROUTE-MANIFEST ↔ `content-final` paths); `grep -r example.com dist/ src/`; remote `http(s)` refs in `src/` and `dist/`; arbitrary Tailwind values `w-[`, `text-[` outside token layer; `package.json`/lockfile dep-set + pin diff vs starter; banned attrs `client:*`, `is:inline`, `define:vars`, `<script src`, `@import url`; per-page DOM asserts (one `h1`, non-empty `main`, `header`/`footer` nav links present, `title`/meta `description` non-empty and == frontmatter, every `<img>` `alt`); contact-route form fields (`action="/form.php"`, `hp`, `ts`, `sent` branches); JS byte budget on `dist/_astro/`; asset manifest resolution (every slot→file, no orphan files); `404.html` present when sitemap carries `/404` | F2–F6, F9 |
| `tools/tokens_gen.py` | `TOKENS.json` → `tailwind.config.mjs` theme.extend + `:root` `--*` block (mechanical generation the spec describes in prose, S5 :224-240); emit the defaulted-token list for `DESIGN-DNA.md` | — |
| `tools/asset_manifest.py` | emit/validate `ASSET-MANIFEST.json`: scan `PAGES/*/SPEC.md` + content callouts for media slots, reconcile against `public/assets/` + `src/assets/` + brief `brand_assets/`; hash-copy with fingerprinted names | F2 |
| `tools/markdown_modules.py` | content-final parser: frontmatter + H2/H3 tree + callout markers → per-route `sections.json` (module list the page file consumes); validates S3's callout grammar and emits the section↔SPEC reconciliation report | F1 |
| `tools/seo_gate.py` | S7's 13 checks (owned by the gate lane — `AuditGateDeploy`); S5b's lint must not re-implement it, only guarantee build-time prerequisites (canonical origin set, frontmatter verbatim) | F3 |

Lane judgment that must NOT mechanize: section visual treatment
(which module gets a card grid vs prose), callout placement
disputes between SPEC.md and copy, token fallbacks on thin packets
(declared per S5 :336), nav label shortening (H1→label is writing
judgment bound by the URL lock, S5 :251-254).

## 7. SOP skeleton — `web-build-<site>` lane, numbered procedure

Modeled on `WEB-FACTORY-LOCATION-PAGES.md` §6: phases, each step
naming inputs / action / gate. Refuse codes match the stage style.

### Phase A — intake validation

**Step 1 — Read order (packet contract).** `DESIGN-DNA.md` →
`TOKENS.json` → `CLASS-SYSTEM.md` → `COMPONENTS.md` →
`ASSET-MANIFEST.json` → `ROUTE-MANIFEST.json` → `PAGES/*/SPEC.md` →
`content-final/*` → `site-brief.md` → `sitemap.md`. Evidence PNGs
only to resolve spec ambiguity — observation, never markup.
**Gate:** every required member non-empty; route parity
sitemap↔manifest↔content-final (count + `path` set equality); brief
carries `name`, `contact_email`, `contact_phone`, `address` —
missing NAP fields → `prd_step ask`, never placeholder-facts passthrough.

**Step 2 — Module inventory per route.** Run the content parser:
each `content-final` file → section list (H2 tree + callouts).
Reconcile vs `PAGES/<slug>/SPEC.md`: **content section list wins;
SPEC supplies per-module treatment.** A SPEC section with no content
section is dropped + flagged; a content section with no SPEC
treatment gets the type-default module + flag. Record the merged
per-route `sections.json`.

### Phase B — scaffold + system

**Step 3 — Scaffold.** `cp -R templates/astro sites/<slug>`; `npm ci`
(locked, `--ignore-scripts`); record starter pin in commit. Set
`astro.config.mjs` `site` = brief `url`; fill `src/site.ts` from
brief (NAP + nav items from manifest routes); rewrite `robots.txt`
sitemap URL. **Gate:** `grep -r example.com sites/<slug>/src
sites/<slug>/public sites/<slug>/astro.config.mjs` → empty.

**Step 4 — Tokens.** `tokens_gen.py` regenerates `tailwind.config.mjs`
+ `:root` vars from `TOKENS.json`; token-empty packet → starter
defaults, each named in `DESIGN-DNA.md` deviation list (S5 :225-240).

**Step 5 — Class system + components.** One `@layer components`
block per `CLASS-SYSTEM.md` row; one `.astro` per `COMPONENTS.md`
row; add the module primitives the content inventory requires
(section, card grid, step module, comparison table, FAQ accordion,
review block, stats band, suburbs grid, CTA block, breadcrumb).
**Gate:** dep-set + pin diff vs starter = empty (F4).

### Phase C — shared shell

**Step 6 — Header/nav + footer.** Nav labels = shortened H1 forms
per manifest routes (`parent`-ordered); mobile menu contract from
starter (focus-trapped, dismissible). Footer: sitemap links (all
manifest routes) + schema NAP from `site.ts`.

**Step 7 — Layouts per template kind.** `service-detail`, `article`,
`utility` + `location` and `index` variants when the manifest
carries them; breadcrumb component keyed to `parent`; JSON-LD
emission points (BreadcrumbList when `parent ≠ (root)`, FAQPage when
an FAQ module exists, Service on money/location).

### Phase D — page assembly (route by route)

**Step 8 — Money + contact first** (S2/S3 money-first posture). Per
route: bind `content-final/<slug>.md` on `path`; render
`sections.json` order — frontmatter → SEOHead props verbatim;
callouts → components; contact route emits the full S6 form contract
(`action="/form.php"`, `name/contact/message/site/hp/ts`, both
`?sent=` branches). Commit per route: `site: page <slug>`.

**Step 9 — Article + location + index families.** Location leaves
assemble M1–M10 modules (`LocationLayout` or `[slug].astro` when the
manifest declares `parametrized`); index routes render child grids
from `parent`; `/404` → `src/pages/404.astro` (not `404/index`).

**Step 10 — Ancillary.** Utility layout; prose + NAP where the row
is contact-class.

### Phase E — assets + verify

**Step 11 — Bind the asset manifest.** Fingerprinted copies into
`src/assets/` (astro:assets pipeline) or sized `public/assets/` for
non-processable types; self-hosted fonts + preload; icon set inline
SVG. **Gate:** every manifest slot resolves; no orphan files;
immutable `_headers` rule applies only to fingerprinted paths.

**Step 12 — Build + lint.** `npm run build` exit 0 →
`tools/build_lint.py` full suite → `site/build-report.md` (per-route
assembly record + check rows). Any red → fix in-lane or refuse
naming the upstream stage. **Done.** `prd_step done` — closing names
routes built, held-outs honored, defaulted tokens, lint verdicts.

## 8. Cross-module contracts

**S5b owes:**

- **S6** — the contact form contract verbatim (S6 :33-40) and both
  `sent` render branches; *conflict: this contract is written only in
  S6's spec and S5's SKILL, not in S5's spec* (F5).
- **S7** — `astro build` exit 0, `dist/` uncommitted, canonical
  origin set, self-contained markup, frontmatter verbatim into head.
- **The responsive-testing module** (new lane, AuditResponsive) —
  S5b owes it a *green structural build*; the responsive lane owns
  viewport matrices/screenshots. Boundary line: S5b asserts DOM
  structure on emitted HTML; responsive asserts rendering across
  viewports. S5b should not ship screenshot machinery.
- **The animations/micro-interactions module** (AuditAnimations) —
  S5b owes it stable class hooks and must NOT pre-bake animation
  classes into components (animation ideas derive from content,
  applied last). S5b must emit components with enough structure
  (`data-` hooks or semantic classes) for that lane to target.

**S5b expects (gaps to close upstream):**

- **From S2/S3** — module callouts in `content-final` files + the
  `modules:`/marker grammar (F1); CTA placement markers (F9).
  `heading_skeleton` must survive as machine-readable section typing,
  not just H2 text.
- **From S4** — cleanup must preserve callout markers verbatim
  (extend the never-touch list, S4 :219-235).
- **From S5a** — `ASSET-MANIFEST.json`, per-module visual treatment
  (not per-page section lists — content owns shape), `parametrized`
  flag + `template_id` on template-family routes in
  ROUTE-MANIFEST (F6).
- **From S0/brief** — `brand_assets` (logo, photos, fonts, license
  notes) + authentic review/testimonial source text (F2, F8);
  `host.type` already lands via S6.
- **From S1** — `page_class: location` added to the closed set
  (location spec §7, OI-3); index/leaf `parent` rows already exist.
- **From the sitemap SOP** — competitor page-shape capture: Step 5
  already fetches money/location pages for title formulas; extend to
  record module counts + word counts so "match the call" sizing
  reaches S5b as data (§3.4).

**Conflicts found:** (1) SPEC.md vs content skeleton precedence —
undecided (F1); (2) `location` page_class not in closed set (F6);
(3) live-review widgets vs CSP self-containment (F8); (4) form
contract spec/skill divergence (F5); (5) `example.com` starter
defaults pass today's lints (F3); (6) `releases`-style immutable
caching on unversioned `public/assets/` filenames vs deploy
revisions (F2).

## 9. Verdict

The build lane's *ordering* exists and is sound — read → scaffold →
tokens → classes → components → layouts → routes → assets → lint —
but it is **template-driven, not content-driven**: it assembles the
design packet's routes, and the copy is bound afterward as opaque
markdown. On the evidence of the SERP winners (11–12 modules, 17–29
images per location leaf), the gap is not a polish delta — the
factory as specced ships a prose column, not a module-built page.

Before the S5b PRD can be written:

1. **F1's content→component contract** must be decided and written —
   callout grammar, markdown→component map, SPEC-vs-content
   precedence. This is the load-bearing gap; every other module-lane
   assumption (responsive testing, animations) sits on rendered
   structure existing.
2. **F2's `ASSET-MANIFEST.json` + S0 `brand_assets`** — the asset
   pipeline needs a source and an inventory; today it has neither.
3. **F3/F4's mechanical lint floor** — rendered-DOM check +
   dep-diff + bundle budget + `example.com` grep. Cheap tools; the
   whole lane's correctness currently rests on prose self-execution.
4. **F5's form contract moved into the S5 spec** — one paragraph +
   one lint row.
5. **F6's per-type assembly tables + `location` class + `parent`
   consumption** — the template-kind mapping must grow branches for
   location/index/parametrized families.
6. **F7's JSON-LD emission** — at minimum BreadcrumbList + FAQPage +
   Service, generated from content.

Dispatch order: F1+F6 (contract design — feeds S2/S3/S5a spec
patches) → F2 (asset manifest — feeds S0 intake + S5a output) →
F3/F4/F5 (lint + spec patches, mechanical) → F7 (schema emission).
S5b's own lane spec can be written the moment F1 is decided; the
rest are bounded additions to its checklist.
