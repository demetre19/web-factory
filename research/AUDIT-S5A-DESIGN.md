# AUDIT-S5A-DESIGN — adversarial audit of the S5 **design lane** (`design-dna-<site>`)

The operator mandates S5 split into a **design-system lane** (S5a:
research, ingest, classify designs per page type; semantic tokens;
semantic markup + a11y; type scale/accent/font pairing per niche;
image+icon inventory) and a **build lane** (S5b: sequential
header→footer→sections). This audit covers the S5a half — today the
`design-dna-<site>` distill lane (`WEB-FACTORY-S5-DESIGN-DNA.md`).
Every claim cites a repo file:line or a fetched URL; the rest is
`[INFERENCE]`. Audit date: 2026-11-02.

Peer seam: `research/AUDIT-S5B-BUILD.md` audits the consumer lane —
findings here stop at the `site/design-dna/` contract surface; build-side
assembly defects (content→component mapping, asset pipeline, JSON-LD)
are S5b's.

---

## 1. Scope audited

| File | Role |
|---|---|
| `research/WEB-FACTORY-S5-DESIGN-DNA.md` | Stage spec — both lanes; lines 3-213 audited for the design half |
| `skills/s5-design-dna/SKILL.md` | Lane skill — the distill lane's spawn contract |
| `templates/astro/` (full tree) | Vendored starter: `global.css`, `tailwind.config.mjs`, `BaseLayout.astro`, `Header.astro`, `Footer.astro`, `SEOHead.astro`, `site.ts` — the design system's *expression target* |
| `templates/STARTER.md` | Starter contract: what is regenerated vs kept vs never committed |
| `docs/machinery/WEB-FACTORY.md` | Runbook — S5 row at `:27`; OI list `:144-151` |
| `PRD-Web-Factory-2026-10-30.md` | D5 (starter), D8 (RATIONALE), §5.2 (`route` grammar) |
| `research/WEB-FACTORY-LOCATION-PAGES.md` | The one existing per-page-type module matrix (location leaf, M1–M10, `:122-143`) — the model this lane must generalize |
| External (cited inline) | Design-library DOX schema (`~/Documents/UNCLUTTER-NEW/CLAUDE-DEV/Design library/src/server/dox/schema.ts`), DOX sandbox astro template (`Design library/sandbox/astro-template/`), Apiary Astro rebuild (`Apiary/site/`), `dentsdirect.com.au` (fetched 2026-11-02) |

**Module boundary:** everything between "a design source lands in
`site/design/`" and "`site/design-dna/` is complete and reviewable."
The lane's only output is the distilled packet; it writes no Astro code.

---

## 2. Current contract — as specced today

| Direction | Artifact | Source | Contract |
|---|---|---|---|
| IN | `site/design/*.zip` | operator drop, Design-library DOX export | `formatVersion: website-build-dox@1`, `target: astro`, per-file sha256 all recompute (spec `:80-85`, `:182-185`) |
| IN | `site/design/refs/` | operator-captured HTML + screenshots | observation-only; markup/CSS/scripts never executed, imported, or fetched (`:38-39`, `:112-117`) |
| IN | `site/sitemap.md` | S1 | route-list authority; `path == route` (`:186-187`) |
| IN | `site/site-brief.md` | S0 | "entity facts, CTA destinations" (`:71`) |
| OUT | `site/design-dna/TOKENS.json` | DOX copy or refs-derive | "schemaVersion 1: colors, type scale, spacing, radii, shadows, breakpoints" (`:129`) — **no schema body specified** |
| OUT | `CLASS-SYSTEM.md` | distill | "class table: name \| owner \| purpose \| token refs" (`:130`) |
| OUT | `COMPONENTS.md` | distill | "shared component list with prop shapes" (`:131`) |
| OUT | `ROUTE-MANIFEST.json` | DOX verbatim or sitemap-derived | `page_class` → template kind: `service-detail`-class / `article` / `utility` (`:144-152`) |
| OUT | `PAGES/<slug>/SPEC.md` | DOX copy or refs-derive | "per-route section skeleton + layout spec" (`:133`) |
| OUT | `DESIGN-DNA.md` | distill | review artifact: sources, per-token provenance, held-out/fallback routes, defaulted tokens (`:134`, `:205-208`, `:304-305`) |
| OUT | `dox/` | DOX flatten | verified packet members staged for audit; absent refs-only (`:135`, `:138-140`) |

Mint preconditions (`:76-86`): content-final parity, ≥1 design source,
DOX manifest parses + target check, starter pin present. **Nothing else
is gated.** Not specified anywhere: a TOKENS.json grammar, a per-page-type
template matrix, semantic-element mapping, an a11y contract, icon/font/
image inventories, brand-asset intake, competitor visual research, or a
motion/animation vocabulary.

---

## 3. Discovery-question expansion — the question bank S5a must answer

Grouped by operator theme. **Gap tag** = the lane cannot answer today.

### 3.1 Source & authenticity (discovery questions first)

| # | Question | Today |
|---|---|---|
| Q1 | Which design sources exist for this run — DOX packet, refs, both, none? | Partially — spec assumes ≥1 exists (`:80-83`); the **zero-source case has no lane behavior** (fallback vs refuse) → **F1** |
| Q2 | Who captured `site/design/refs/` — where, which viewport, when? | Unanswerable — captures arrive with no provenance manifest → **F2** |
| Q3 | Is the DOX packet's `routePlanChecksum` actually verifiable against *our* sitemap? | **No** — the checksum is computed by the Design-library exporter over *its* route plan; the factory's `sitemap.md` grammar can't reproduce it. Spec calls it "the drift detector" (`:332-334`) but nothing can recompute it → **F3** |
| Q4 | What brand assets does the operator have — logo files, brand colors, licensed fonts, photography, a style guide? | Unanswerable — `site-brief.md` schema (PRD §5.1, `:119`) has no brand-asset fields; nothing in the design source set carries them → **F6** |
| Q5 | For refs-derived tokens: ≥2 independent captures per claim? Single-source token risk? | Unspecified — provenance is required per token (`:144`) but no minimum-source rule; one operator screenshot becomes the site's whole visual system with no diversity check → **F2** |
| Q6 | Design authenticity: how do we prove the output is *ours*, not the reference's? | Posture-only — "originality" is a named precedence constraint (`:119`) with zero measurable criteria (no captured-CSS diff, no min-distance rule) → **F2** |

### 3.2 Classification (page-type taxonomy)

| # | Question | Today |
|---|---|---|
| Q7 | What page types exist? Beyond `money/article/ancillary` — homepage `/`, contact/quote, location leaf, location index? | Partially — three template kinds (`:147-150`) + the SKILL's contact-form line (`SKILL.md:67-69`). **Homepage and contact have no classification row; location leaf is undistinguished from a money page despite being a proven 10-module archetype** (LOCATION-PAGES `:122-138`) → **F4** |
| Q8 | Per page type: canonical section vocabulary + order? | Unanswerable — no template matrix exists for *any* type except location leaf (research, not distill output) → **F4** |
| Q9 | Section categories: what names a hero / reviews / FAQ / service-area block canonically? | Unanswerable refs-branch — DOX constrains section `category` to the component-library canon (`categories.ts`), the refs branch has no canon at all; two lanes could name the same module `hero` vs `page-header` → **F4** |
| Q10 | Query intent → visual posture: does `commercial`/`local` intent change the hero (CTA weight, NAP prominence, review density)? | Unanswerable — the distill packet never consumes `intent`; the sitemap carries it (`PRD §5.2 :130`) → **F4** |
| Q11 | DOX covers N of M routes: which matrix does a fallback route take? | Rule exists ("refs cover the rest", `:321`) but the fallback is "the refs' visual system," not "the page type's matrix" — a fallback *contact page* gets a generic spec, not a contact contract → **F4** |

### 3.3 Competition census → visual sizing (aim high, not minimum)

| # | Question | Today |
|---|---|---|
| Q12 | What do the top-3 SERP competitors' pages look like — module count, hero pattern, section order? | **Unanswerable by construction** — the design lane's evidence surface is DOX+refs only. S1 mines competitor *route taxonomies* (`S1 spec Step 3, :63-68`) and LOCATION-PAGES mined competitor *module outlines* (`:29-58`) — but no lane feeds competitor **visual/section patterns** into `design-dna/` → **F5** |
| Q13 | Winner's homepage has 11 modules — ours has 6: do we match the call? | Unanswerable — nothing measures winner module density; the copy-side analog (word counts from SERP winners) has no design-side twin → **F5** |
| Q14 | Interactive modules in the niche (before/after sliders, carousels, live review embeds, maps): adopted, rejected, or static-fallback? | Unanswerable — no module-interactivity contract; dentsdirect runs a before/after slider + ken-burns hero (fetched 2026-11-02); the packet has no way to name those modules → **F5** |

### 3.4 Brand & visual system per niche

| # | Question | Today |
|---|---|---|
| Q15 | Type scale: min/max viewport endpoints + ratio per niche (utopia params)? | Partially — starter hardcodes 320→1240, ratio 1.2→1.25 (`global.css:6-8`); DOX carries full fluid triples (`schema.ts:82-97`); **refs-derive has no required fields for endpoint/ratio** → **F8** |
| Q16 | Accent color: derive from brand/logo or invent? Contrast floor on `--c-paper`? | Unanswerable — no brand input (F6) and **no contrast check exists anywhere in the pipeline** → **F8** |
| Q17 | Font pairing: display vs body per niche? Self-hosted OTFs (Apiary pattern) vs system stacks? Licensing? | Unanswerable — starter ships one system stack (`global.css:42-44`); self-contained rule bans remote fonts (`:284`) but **no font inventory, no woff2 policy, no licensing field** → **F7** |
| Q18 | Token vocabulary: shallow `--c-ink/accent/muted` or shadcn-style semantic scales (`--background-50..950`, `--primary-*`)? | **Undecided** — starter is shallow (4 colors); dentsdirect ships the full scale (fetched CSS: `--background-50..950`, `--primary-*`, `--accent-*`, `--font-heading/body/label`, `--radius`); DOX sandbox is shadcn-canonical (`sandbox global.css:8-54`). Three conventions, no declared winner → **F10** |
| Q19 | Dark mode in scope? | Undecided — DOX tokens carry `.dark` variants (`sandbox global.css:56-88`); nothing says emit-or-drop → **F8** |
| Q20 | Iconography: animated SVG icon set — which icons, stroke style, animation type? | Unanswerable — no icon artifact exists; only the hamburger SVG (`Header.astro:34-38`, static, `aria-hidden`) → **F7** |

### 3.5 Semantic markup, SEO surface & a11y (design-side)

| # | Question | Today |
|---|---|---|
| Q21 | Heading skeleton → semantic element map: which H2 becomes `<section>`, what carries `<article>`, `<aside>`, `<figure>`? | Unanswerable — the plan's `heading_skeleton` (S3 `:92-95`) has no element mapping; BaseLayout emits `<main>` + `<slot>` only (`BaseLayout.astro:50-52`) — every section would land in bare divs → **F9** |
| Q22 | FAQ = `<details>`? testimonials = `<figure>/<blockquote>`? NAP = `<address itemscope>`? | Partially — footer NAP is `itemscope` (`Footer.astro:21`); everything else unmapped → **F9** |
| Q23 | Landmark uniqueness: `nav aria-label` per nav instance? | Partially — starter does it (`Header.astro:16`, `Footer.astro:12`); nothing *requires* it → **F9** |
| Q24 | Skip link? | **Absent from starter and spec** → **F9** |
| Q25 | `prefers-reduced-motion` budget in tokens? | Absent — motion tokens exist in DOX (`schema.ts:107`) with no factory rule; Apiary's port uses unconditional keyframes (`Apiary/site global.css:83-97`, no media guard) → **F7** |
| Q26 | Icon-only controls labelled; decorative SVG `aria-hidden`; `alt` strategy per image slot? | Unspecified → **F9** |
| Q27 | Footer site map = every route, or nav subset? | Starter renders `site.nav` only — 4 items (`site.ts:27-31`) — while the spec demands "a complete site map" (`:250-251`). On a 40-page site the footer ships 10% of routes → **F11** |
| Q28 | Heading-vector hygiene: do header/footer headings pollute the page's H-sequence? | Starter uses `<h2>Site map</h2>` / `<h2>Contact</h2>` (`Footer.astro:13,22`) — two phantom H2s on every page; S3's "H2s follow `heading_skeleton`" contract (`S3 :92-95`) is violated by the shell → **F11** |

---

## 4. Gap findings

Ordered by blast radius. Severity: **blocker** = design-dna PRD cannot be
written until resolved; **major** = lane produces defective or
unreviewable output; **minor** = real defect, cheap fix.

### F1 — BLOCKER. The distilled packet has no schema-of-record; five contract files are prose

`design-dna/` emits `TOKENS.json` ("schemaVersion 1" — the string is
asserted, the schema is not), `CLASS-SYSTEM.md`, `COMPONENTS.md`,
`ROUTE-MANIFEST.json`, `PAGES/<slug>/SPEC.md` (`:127-134`). Not one has a
declared grammar: TOKENS' required keys, SPEC.md's section format,
ROUTE-MANIFEST's field set are each written by lane judgment. The
producer *already has* a rigorous schema — the Design-library's
`doxTokenSchema` is a zod discriminated union over `color | typography |
spacing | size | radius | shadow | z_index | motion` with fluid
`minimum/preferred/maximum/fluidFormula` triples (`Design
library/src/server/dox/schema.ts:75-109`), and `ROUTE-MANIFEST.json` is
machine-readable upstream (`:103-104`). The factory throws that away at
the distill seam: a DOX packet with a *valid* upstream schema lands in a
grammar-less folder, and the refs branch hand-writes files nothing can
validate. This is F1-of-the-cross-stage-review one level down —
`design-dna/` is "the reviewed design authority" (`:125`) whose own
authority is unverifiable. Nothing downstream (S5b, animations lane,
responsive lane, S7) can consume it mechanically.

**Fix:** declare `design-dna` packet v1 — a schema file per member
(zod or JSON-schema), DOX-token-schema-compatible where categories
overlap, validated by a mint-gate tool (§6).

### F2 — BLOCKER. Design authenticity is unverifiable: refs carry no provenance, no capture manifest, no originality criteria

The refs contract is "operator-supplied HTML/page references" (`:37-39`)
with a provenance *field* per token (`:144`) but no **provenance
registry**: which domain, which URL, which viewport, which date, which
license status. A lane cannot answer "where did this hero come from."
Worse: the spec bans *copying* captured markup (`:204`, `:358-361`) but
defines no check for *convergent* replication — a refs set that is three
screenshots of one competitor produces tokens that are that competitor's
design by extraction. The DOX packet solves this for itself with
`EVIDENCE/<id>/` + `SOURCE-MANIFEST.json` + evidence IDs bound per route
(`:107-108`); the factory's refs branch re-implements none of it.

**Fix:** `design-dna/SOURCES.md` — capture ledger (id | URL | captured
at | viewport | license/consent note | routes influenced); ≥2 distinct
origins per token category or flagged in `DESIGN-DNA.md`.

### F3 — BLOCKER. `routePlanChecksum` is uncomputable, and DOX route grammar conflicts with the sitemap's `path`

Two defects, one row of the manifest:

1. `manifest.json` carries `routePlanChecksum` and the spec names it "the
   drift detector the distill lane logs" (`:98`, `:332-334`). But the
   checksum is minted by the Design-library over *its* plan; nothing in
   the factory can recompute it over `sitemap.md` — different producer,
   different table grammar, undisclosed digest recipe. "Logs it" is the
   only honest reading; "detects drift" is not deliverable.
2. `doxRouteSchema`'s `safeRoute` **refuses a trailing slash on every
   route except `/`** (`schema.ts:49-53` — `value.endsWith("/") → false`
   when `value !== "/"`). The PRD's `route` column requires
   leading+trailing slash (`PRD §5.2 :127`; observed
   `/boiler-repair/`). Every DOX route is grammatically a different
   string than the sitemap row it must match (`:186-187` — "must match
   a `sitemap.md` `route`"). Read literally, every DOX route fails the
   cross-check and gets held out — DOX authority can never fire.

**Fix:** route-shape normalization declared at the seam (compare on
`path` canonical form, not raw string); checksum→**logged advisory**, with
the real drift detector = route *set* diff (sitemap rows ∉ manifest ∪
manifest ∉ sitemap — already the step-3 check `:186-192`, keep it, drop
the checksum pretense).

### F4 — BLOCKER. No per-page-type template matrix: three template kinds cover five page archetypes, and section vocabulary has no canon on the refs branch

The mapping is `page_class` → `service-detail | article | utility`
(`:147-150`) — three kinds. The operator's page-type set is five-plus:
**homepage** (`/`), **money/landing**, **article**, **location leaf**,
**contact**, plus ancillary. Gaps:

- Homepage `/` is a `unique_page` in DOX terms (`:102`) — but on the refs
  branch it is just another sitemap row with `page_class` mapped to a
  kind; nothing gives it the winner-shaped section stack (hero → trust →
  services grid → proof/gallery → reviews → service area → FAQ → CTA —
  the exact sequence dentsdirect's homepage runs, fetched 2026-11-02).
- Location leaves: LOCATION-PAGES proved a 10-module canonical template
  with required/optional gating (`:127-138`, M1–M10, copy floor ≥300
  suburb-unique words) — an evidence-built matrix that exists **for one
  page type, in a research doc the design lane has no contract to
  consume**.
- Contact/quote: the only contract lives in the **skill**, not the spec
  (`SKILL.md:67-69` — `/form.php` + honeypot + sent fallback). A
  spec-bound lane builds a contact page with no named structure.
- Section canon: DOX constrains `outlineSectionSchema.category` to the
  component-library slugs (`schema.ts:132`; `categories.ts:3-51` —
  51 labels incl. `hero`, `testimonials`, `pricing`, `faq` [as
  `FAQSection` exists in Apiary], `contact`, `gallery`) — but that canon
  is (a) ecom-tilted (`cart`, `checkout`, `empty-cart`, `my-account`),
  missing local-trade staples (`reviews`, `before-after`,
  `service-area`, `nap`, `guarantee`), and (b) only binds the DOX
  branch. Refs-derive writes free-text skeletons (`:202-204`).

**Fix:** `design-dna/PAGE-TYPES.md` — the matrix artifact: per page
type, ordered section outline (`{id, title, purpose, category, required,
content binding}`), category canon = DOX list + local-trade extension;
`PAGES/<slug>/SPEC.md` becomes matrix instance + overrides. Location's
M1–M10 lands as the `location` row — the research already wrote it.

### F5 — MAJOR. Zero competitor visual evidence: the design lane is the only research lane that doesn't research

Every content-side lane fetches SERP competitors: S1 mines route
taxonomies (`S1 spec :63-68`), LOCATION-PAGES extracted full module
outlines from gobox/cleanpursuit (`:29-58`), S3 sizes copy to winners.
The design lane's evidence surface is exactly two operator-supplied
sources (`:33-39`). If the operator drops nothing, the site gets starter
defaults with flags — the visual system is invented in the dark with no
niche calibration: a local-trade money page and a luxury-accommodation
page get the same un-researched shape. The operator's own direction
("competitor census… researched LIVE," "measure SERP winners' page
word counts/module counts to size our pages") requires a fetch step the
spec never mints.

**Fix:** a `competitor-design` research step at lane start (or an S1-side
design module feeding `site/design/competitors/`): top-3 SERP winners
per site_type fetch → module outline + hero pattern + section count per
page type → `design-dna/COMPETITORS.md`. The method is already proven —
LOCATION-PAGES §1.1 is exactly this extraction.

### F6 — MAJOR. Brand-asset intake does not exist: no field, no folder, no authenticity path for logos/fonts/photos

`site-brief.md` carries entity facts + CTA destinations (PRD §5.1
`:118-119`); the inputs table binds `site/design/` ZIPs and
`site/design/refs/` captures (`:72-73`). Nowhere can the operator supply
a logo, brand color, licensed font, or photo library. Per-niche font
pairing (mandate: "type scale + accent + font pairing per niche") then
either (a) invents fonts — a licensing and identity risk — or (b) uses
system stacks and calls it a day. Apiary shows the asset-driven path:
self-hosted OTF brand faces in `public/fonts/` + `@font-face` in global
(`Apiary/site/src/styles/global.css:3-31`).

**Fix:** `site/design/brand/` (operator drop: logo.svg/png, brand.txt
colors, fonts/, photos/) + `site-brief.md` brand fields (logo present,
preferred palette, licensed fonts, asset licensing note) — S0 question
bank + brief schema extension (S0 lane's contract, our input).

### F7 — MAJOR. No icon, image, font, or motion artifacts: the inventories the operator mandates have no home

- **Icons:** "animated SVG icons preferred" — no `ICONS.md`, no sprite
  contract, no per-icon animation hook. Starter has exactly one static
  inline SVG (`Header.astro:34-38`).
- **Images:** the distill packet has no image inventory; S5b's audit
  already found the build-side hole (its F2, "no asset pipeline"). The
  design half is upstream of that hole: it never declares *which* image
  slots exist per module (hero art, gallery, before/after pairs, review
  avatars).
- **Fonts:** no `FONT` field set — family pairing, weights, self-host
  paths, fallbacks, licensing.
- **Motion:** DOX's token union already has a `motion` category
  (`schema.ts:107`) — the plumbing exists upstream and is dropped in
  distill. The animations lane (peer AUDIT-ANIMATIONS) applies classes
  last; S5a owes it the semantic hook vocabulary (`anim-*`/`rv-*` class
  slots per component row) or the two lanes collide on class ownership.
  Apiary's port demonstrates the shape: `anim-fade-up` +
  `anim-delay-N` keyframe classes (`Apiary/site global.css:83-97`) —
  load-time only, no IntersectionObserver, no reduced-motion guard. The
  class-system table needs an `animation hook` column so the hook is
  declared at design time, applied at animation time.
- **JS budget:** no contract for interactive modules (slider, carousel,
  menu already pinned); "no heavy JS" is posture, not a check. (S5b F4
  covers build-side enforcement; the *allowance* is S5a's call.)

### F8 — MAJOR. The niche-visual envelope has no required fields: type-scale params, accent-contrast floor, dark-mode stance all optional-by-omission

`TOKENS.json`'s description names categories (`:129`) but no required
set. Nothing forces: fluid endpoints (utopia min/max viewport + ratio —
starter hardcodes 320→1240 @1.2→1.25, `global.css:6-8`; DOX carries real
triples `schema.ts:82-97`); a measured accent (vs default `#1f5eff`
`global.css:36`); contrast of `--c-accent` on `--c-paper` (the only
color the whole site's CTAs and focus rings use — an unchecked accent
fails WCAG sitewide, and `:focus-visible` depends on it
`global.css:72-75`); dark-mode emit-or-drop (DOX sandbox ships `.dark`
variants `sandbox global.css:56-88`).

### F9 — MAJOR. Semantic-markup and a11y contracts are absent: the mandate's two pillars exist only as scattered starter habits

"Full semantic markup (nav/header/footer/main/section/article), a11y
baked in" is the operator mandate; the spec has no semantic-element
contract and no a11y section. Concrete holes:

- BaseLayout renders `<main><slot/></main>` — content H2s would land in
  undifferentiated flow; no `<section>`/`article`/`aside`/`figure`
  mapping exists (`BaseLayout.astro:50-52`).
- No skip link anywhere in starter or spec.
- `prefers-reduced-motion`: absent (F7).
- FAQ→`<details>`, reviews→`<figure><blockquote>`, NAP→`<address>`:
  only NAP is specced (and that in the starter, not the spec —
  `Footer.astro:21-27`).
- Landmark labelling, `aria-current`, focus trap: starter implements
  (`Header.astro:16,21,30-32,46-48`) — but as habits, not gates; a
  regenerated component can drop every one and nothing lints.
- A11y is currently *unowned*: S7's 13-check SEO gate doesn't cover it
  (`WEB-FACTORY.md :29` lists title/canonical/OG/links/heading checks).

### F10 — MAJOR. Three token conventions coexist with no declared winner: shallow `wf` tokens vs shadcn scales vs DOX `design-*`

- Starter: `--c-ink/--c-paper/--c-accent/--c-muted` + `--fs-*`/`--lh-*`/
  `--sp-fluid-*`/`--r-*`/`--sh-*` (`global.css:11-44`), Tailwind v3
  `theme.extend` accessors (`tailwind.config.mjs:11-42`).
- Design-library sandbox (the DOX `target: astro` baseline): shadcn
  semantic scales, oklch, `--design-*` prefix, Tailwind v4 `@import
  "tailwindcss"` (`sandbox global.css:1-54`).
- Dentsdirect (operator exemplar, fetched CSS): shadcn scales
  `--background-50..950`/`--primary-*`/`--accent-*` + `--font-heading/
  body/label` + `--radius`.

Plus a **Tailwind-version drift**: starter pins v3.4.19 +
`@astrojs/tailwind` + `tailwind.config.mjs` (`STARTER.md:15-16`); the
DOX target and Apiary both write v4 idioms (`@import "tailwindcss"` — no
config file). The operator's "Tailwind-class semantic utility tokens"
reads as the hybrid already vendored — decision + recommendation in §5.

### F11 — MINOR. Footer "complete site map" is unbuildable as specced; footer H2s pollute every page's heading vector

Spec: "the footer a complete site map + NAP/contact block" (`:250-251`).
Starter: footer renders `site.nav` — a hand-shortened list of ~4 nav
labels (`site.ts:27-31`, `Footer.astro:14-19`). Two contracts:
- *Complete* needs the full `ROUTE-MANIFEST.json` grouped by parent
  (the topical map exists — `parent` column, PRD §5.2 `:131`) — a
  design-time decision the packet must carry, not a build-time guess.
- Footer `<h2>Site map</h2>`/`<h2>Contact</h2>` (`Footer.astro:13,22`)
  inject two phantom H2s into every route's heading sequence — against
  S3's skeleton discipline; the design packet must either demote them to
  styled `<p>`/`<span>` or declare footer headings exempt.

### F12 — MINOR. Zero-design-source runs have no lane behavior; "at least one design source required" is a refusal with no recovery path

Mint precondition 2 requires ≥1 source (`:80-83`). But every factory
site needs a design — refusing just moves the hole to the operator's
desk. There is no "house system" path: starter defaults are only a
*per-token* fallback for token-empty packets (`:228-230`,
`:334-336` — an explicit no-invent rule inside a valid packet). The
right shape: a declared **house design system** (the starter defaults
promoted to a named baseline + niche-parameterized accents) as an
explicit third source branch, flagged in DESIGN-DNA.md — or keep the
refuse and make S0 collect design evidence as a gate requirement.

---

## 5. Split / sub-module proposal — design lane anatomy

**Proposal: S5a is one lane with three phases, plus one new artifact
set.** A separate research lane is *not* needed — S1's competitor pass
and this lane's start-of-lane fetch cover evidence. Three phases:

| Phase | Name | Does | Emits |
|---|---|---|---|
| 5a.1 | **Evidence & intake** | Register sources (existing step 1); verify DOX; normalize DOX route grammar; write `SOURCES.md` capture ledger for refs; fetch top-3 competitor module outlines per site_type (new — F5); ingest `site/design/brand/` (new — F6) | `dox/`, `SOURCES.md`, `COMPETITORS.md`, brand record in `DESIGN-DNA.md` |
| 5a.2 | **System derivation** | Extract/derive `TOKENS.json` (schema-conformant, provenance per token, accent-contrast measured); class system + component inventory + **animation-hook column**; icon + font + image inventories (F7) | `TOKENS.json`, `CLASS-SYSTEM.md`, `COMPONENTS.md`, `ICONS.md`, `FONTS` + `ASSETS` rows inside `ASSETS.md`, `MOTION.md` hook map |
| 5a.3 | **Matrix authoring** | Author `PAGE-TYPES.md` (the per-type matrix — F4); materialize `PAGES/<slug>/SPEC.md` per route (matrix instance + DOX/unique overrides); responsive rules; write `DESIGN-DNA.md` | `PAGE-TYPES.md`, `PAGES/*/SPEC.md`, `ROUTE-MANIFEST.json`, `RESPONSIVE-RULES.md`, `DESIGN-DNA.md` |

**The Tailwind decision (F10) — named, not dodged:**

| Option | Tradeoffs |
|---|---|
| A. Bespoke CSS (pure custom classes, no Tailwind) | Closest to Dents-`global.css`-style hand CSS and Apiary's class layer; zero build config; but loses Tailwind's spacing/variant ergonomics the spec already relies on (`@layer components` ergonomics argued at `:351-356`) and makes "Tailwind-class" mandate literal-false |
| B. Full shadcn-scale tokens + Tailwind (DOX/dentsdirect convention) | Richest semantic vocabulary (50–950 scales, `-foreground` pairs); matches the DOX producer and operator exemplar; heavier token surface (80+ vars), and starter rewrite |
| C. **Hybrid (RECOMMENDED): semantic utility tokens + `@layer components` classes, on Tailwind v4** | What the starter already is in spirit: custom props as the token layer (`--fs-*`/`--c-*`/`--sp-*`), Tailwind utilities as *accessors* (`fluid-3` → `var(--fs-3)`), one `@layer components` owner per class row (spec `:169-173`, `:351-356`). Recommendation: **adopt the shadcn-style naming scale for colors only** (`--background`, `--foreground`, `--primary{,-foreground}`, `--accent{,-foreground}`, `--muted{,-foreground}`, `--border`) — it is the DOX producer's canon (`sandbox global.css:8-54`) and the exemplar's shipped convention — while keeping the `wf` prefix for factory-owned structural tokens (`--fs-*`, `--sp-fluid-*`). Move to Tailwind v4 (`@import "tailwindcss"`, CSS-first `@theme`) to match the DOX `target: astro` baseline — the v3 config file becomes a lane-known drag otherwise. Bespoke-only (A) rejected: it forfeits the accessor ergonomics and the DOX token pipeline's fluid machinery. |

Net `design-dna/` layout after expansion (11 members):

```
site/design-dna/
  TOKENS.json            # schema'd (F1): color roles+scales, fluid type triples,
                         #   spacing/size, radius/shadow/z_index/motion, provenance
  CLASS-SYSTEM.md        # name|owner|purpose|token refs|semantic element|anim hook
  COMPONENTS.md          # component inventory + prop shapes + a11y contract per row
  PAGE-TYPES.md          # NEW (F4): per-page-type section matrix + category canon
  ROUTE-MANIFEST.json    # normalized routes, template kind, page-type tag
  PAGES/<slug>/SPEC.md   # matrix instance + per-route overrides + section outline
  ICONS.md               # NEW (F7): icon inventory — id|metaphor|stroke|animation
  ASSETS.md              # NEW (F7): image slots + font inventory/licensing per module
  MOTION.md              # NEW (F7): anim hook classes, keyframe budget, reduced-motion rule
  RESPONSIVE-RULES.md    # NEW: breakpoint set + mobile-first stack rules (peer: RESPONSIVE)
  SOURCES.md             # NEW (F2): capture ledger for refs provenance
  COMPETITORS.md         # NEW (F5): per-type module outlines from top-3 SERP winners
  DESIGN-DNA.md          # review artifact (unchanged role, wider coverage)
  dox/                   # verified DOX members (unchanged)
```

---

## 6. Automation surface — mechanical vs judgment

**Mechanical (candidate `tools/`):**

| Tool | Check |
|---|---|
| `tools/design_dna_lint.py` | Packet-member existence + schema validity (F1); `ROUTE-MANIFEST` ↔ `sitemap` ↔ `content-final` three-way parity; `PAGE-TYPES` category ∈ canon; every SPEC section category resolves |
| `tools/dox_verify.py` | manifest `sha256` recompute, `formatVersion`/`target` check, route-shape normalization (F3) — replaces spec step 2 (`:182-185`) |
| `tools/token_gen.py` | `TOKENS.json` → `:root` custom-property block + Tailwind `@theme` emit (deterministic; today it's lane handwork `:225-228`) |
| `tools/token_lint.py` | zero arbitrary values in authored src (extends the prose lint `:281-283`); every class row names ≥1 existing token; accent-on-paper contrast ≥4.5:1 (F8) |
| `tools/semantic_lint.py` | landmark singletons (`header/nav/main/footer` present, `nav` labelled); skip link; `<section>`/`article` mapping per SPEC; no footer/page-heading pollution (F9/F11); icon SVGs `aria-hidden` or labelled |
| `tools/a11y_lint.py` | `aria-expanded`/`controls` pairs, focus-trap hooks present, `prefers-reduced-motion` guard on every `@keyframes`/`anim-*` rule (F7/F9) |
| `tools/icon_lint.py` | every `ICONS.md` id has an SVG asset + declared animation hook; no icon referenced that isn't inventoried |
| `tools/font_lint.py` | no remote font/stylesheet (extends `:284`); every `@font-face` family named in ASSETS.md with a license field |

**Lane judgment (stays human/agent):** refs→token derivation under
ambiguity; accent/font-pairing selection within the niche; module
ordering overrides; provenance-ledger honesty; ORIGINALITY call —
convergent-vs-copied judgment (F2); which competitor patterns to adopt
vs reject (`COMPETITORS.md` is evidence, adoption is the lane's).

---

## 7. SOP skeleton — `design-dna-<site>` lane, numbered procedure

Format per `WEB-FACTORY-SITEMAP-SOP.md` (inputs/tools/outputs per step).

**Phase 5a.1 — evidence & intake**

1. **Register sources.** List `site/design/*.zip`, `site/design/refs/*`,
   `site/design/brand/*`. Declare the branch: DOX / refs / mixed /
   brand-only / house-default (F12). *Outputs: branch note.*
2. **Verify DOX** (when present): extract, recompute sha256 table,
   `formatVersion == website-build-dox@1`, `target == astro`
   (mechanical — `tools/dox_verify.py`).
3. **Normalize routes.** Convert DOX route grammar to sitemap `path`
   form (F3); set-diff vs `sitemap.md`; held-out routes + fallback
   routes recorded.
4. **Ledger the refs.** Every capture → `SOURCES.md` row (id, URL,
   date, viewport, license note). Under-covered token categories
   flagged.
5. **Competitor design pass.** Top-3 SERP winners for the niche's money
   query (S1 already fetched the SERP set — reuse `competitors/<slug>/`
   scratch or refetch live): module outline + hero pattern + section
   count per page type → `COMPETITORS.md` (LOCATION-PAGES §1.1 method).
6. **Brand ingest.** `site/design/brand/` → logo/color/font/photo
   record in `DESIGN-DNA.md`; absent → house-default flag.

**Phase 5a.2 — system derivation**

7. **Tokens.** DOX copy (verified) or derive: color scales + roles
   (shadcn naming, §5-C), fluid type triples (min/max/px+vw/clamp),
   spacing/size, radii/shadows/z/motion. Every token carries
   `provenance` (`capture id + viewport + element` or `dox:<member>` or
   `brand:` or `house:`). Accent contrast measured ≥4.5:1 on `--c-paper`
   or flagged+adjusted. Write `TOKENS.json`.
8. **Class system.** `CLASS-SYSTEM.md` rows: name | owner | purpose |
   token refs | **semantic element** | **anim hook**. Shared regions
   (header/nav/footer/CTA/reviews/FAQ) get rows first.
9. **Component inventory.** `COMPONENTS.md`: component | props |
   semantic elements | a11y contract (labels, keyboard, landmark) |
   module category.
10. **Icon + asset inventories.** `ICONS.md` (icon|metaphor|stroke|
    anim) — animated-SVG-first per mandate; `ASSETS.md` image slots +
    font inventory (family|weights|self-host path|license) per module.
11. **Motion budget.** `MOTION.md`: hook classes (`anim-*`/`rv-*`),
    keyframe list, `prefers-reduced-motion` rule, IntersectionObserver
    reveal contract handed to the animations lane.

**Phase 5a.3 — matrix & manifest**

12. **Page-type matrix.** `PAGE-TYPES.md`: one row-set per page type
    (homepage, money, article, location, contact, ancillary):
    ordered `{id,title,purpose,category,required,content binding}` +
    required-vs-optional gating. Location's row = LOCATION-PAGES
    M1–M10 verbatim.
13. **Route materialization.** One `PAGES/<slug>/SPEC.md` per sitemap
    row: matrix instance + route overrides + DOX authority sections +
    heading-vector map (which markdown H2 → which section/element).
14. **Responsive rules.** `RESPONSIVE-RULES.md`: breakpoint set +
    stack orders + fluid ranges consumed by the responsive lane.
15. **Write `DESIGN-DNA.md`.** Branch, sources, per-token provenance
    summary, held-out/fallback routes, defaulted tokens, competitor
    adoption notes, deviation flags.
16. **Self-lint.** `tools/design_dna_lint.py` green: schemas valid,
    three-way parity, canon conformance, ≥1 matrix row-set per emitted
    template kind, no unledgered capture.
17. **Commit.** `site: design-dna` — one reviewable unit.
18. **Done.** `prd_step done` naming branch, routes covered/held out,
    defaulted tokens, competitor sources used.

---

## 8. Cross-module contracts — owed and expected

| Party | Owes / expects | Conflict found |
|---|---|---|
| **S0 discovery** (audit: AUDIT-S0) | Needs brief fields + drop folder: `site/design/brand/`, brief `brand` section (logo/colors/fonts/licensing), `design refs` collection step | brief schema (PRD §5.1) has zero design fields — **S0 extension required** (F6) |
| **S1 sitemap** (AUDIT-S1) | Expects: `page_class` set stays `money/article/ancillary`; needs: a `page_type` hint finer than page_class (homepage/contact/location-leaf distinguishable) — derivable today via `route=='/'`, contact-by-H1, leaf-by-parent — but derivation rules are unwritten | DOX `safeRoute` vs `route` trailing-slash grammar — **hard schema conflict** (F3); `intent` column exists but is never consumed by design (F4/Q10) |
| **S2/S3/S4 content chain** | Expects: heading skeleton + `## Related`/CTA page-tail shape lands inside named sections; needs: `PAGE-TYPES` content-binding column keyed on `heading_skeleton` roles + frontmatter fields | Footer `<h2>` pollution violates S3 heading discipline (F11); featured-snippet mini-H sections (~200-word clusters) have no section-class slot (F9) |
| **S5b build lane** (AUDIT-S5B) | Owes: schema'd packet (F1), `PAGE-TYPES` matrix, `ASSETS.md` image/font inventory (its F2 wants exactly this), `MOTION.md` hooks (its F4 lean-stack allowance), semantic-element map (its F1 content→component contract) | Seam agreement: build reads `design-dna/` only — new members must be declared in the S5 spec's fixed layout or S5b's mint precondition misses them |
| **Animations lane** (AUDIT-ANIMATIONS) | Owes: `anim-*`/`rv-*` hook column in CLASS-SYSTEM + `MOTION.md` budget; expects: hooks applied last, GSAP/lib ban | Apiary port is load-time keyframes + delays — **not** IntersectionObserver reveals (`Apiary/site global.css:83-97`); the mandate's IO contract must be written here or the animations lane invents its own |
| **Responsive lane** (AUDIT-RESPONSIVE) | Owes: `RESPONSIVE-RULES.md` + fluid endpoints in TOKENS | DOX ships `RESPONSIVE-RULES.md` upstream (`:104`) but the distill layout drops it — copied into `dox/`, never lifted to top level |
| **S6 integrations** | Expects: contact SPEC declares the `/form.php` contract (SKILL `:67-69` — spec-side gap per S5b F5) | none new |
| **S7 gate+deploy** | Expects: seo-gate checks (landmarks? a11y?) — today S7's 13 checks are title/canonical/link-class only | self-containment: dentsdirect (operator exemplar) ships `@import fonts.googleapis` + cdnjs icon CSS + a JS bundle — **all three fail S5's own lint** (`:281-285`); the exemplar violates the gate it models — treat as cautionary, not authority |

---

## 9. Verdict — what must exist before this module's PRD

The distill lane is well-shaped for what it was designed to do —
*normalize a DOX packet* — and badly underspecified for what the
operator now mandates: *author a design system per niche from mixed
evidence*. The packet producer already solved most of the mechanics
(zod token schema, category canon, evidence ledger, route manifest);
the factory's design half drops them at the seam and replaces them with
prose.

**Before the S5a PRD can be written:**

1. **`design-dna` packet v1 schema** — member-by-member grammars (F1);
   token vocabulary decision = hybrid semantic scale on Tailwind v4
   (§5-C); `doxTokenSchema` as the overlap canon.
2. **`PAGE-TYPES.md` matrix** — the per-type section contract (F4);
   the location row already exists (LOCATION-PAGES M1–M10) — the
   homepage/money/article/contact rows must be authored the same way,
   from competitor evidence (F5's fetch step).
3. **Evidence intake grammar** — `SOURCES.md` ledger, brand folder,
   competitor-design pass, house-default branch (F2/F5/F6/F12).
4. **DOX seam normalization** — route grammar + checksum demoted to
   advisory (F3).
5. **Semantic + a11y contract** — element mapping, landmark/heading
   rules, reduced-motion, contrast floor — owned in `COMPONENTS.md` +
   lints (F8/F9/F11).
6. **Inventory artifacts** — `ICONS.md`, `ASSETS.md`, `MOTION.md`,
   `RESPONSIVE-RULES.md` declared in the spec's fixed layout so S5b's
   mint precondition can gate them (F7).

**Dispatch order:** (a) schema+lint tools first (they constrain every
other artifact), (b) matrix + inventories (the lane's real output),
(c) evidence pass + brand intake (upstream data), (d) S0/S1 spec
extensions (brand fields, page-type hints) as cross-lane patches.

**Evidence appendix (fetched 2026-11-02):**

- `dentsdirect.com.au/` — homepage module order observed: hero H1+CTA →
  trust-badges/why-us → stats band → live Google reviews (duplicated
  block) → services grid → before/after gallery → second testimonial
  wall → service-area suburb chips → FAQ (7 questions) → closing CTA.
  Shipped CSS (`/assets/index-*.css`): `@import fonts.googleapis.com`
  (Inter + Playfair Display), shadcn-style oklch scales
  (`--background-50..950`, `--foreground-*`, `--primary-*`,
  `--accent-*`), `--font-heading/body/label`, `--radius`,
  `@keyframes heroKenBurns` + `.hero-ken-burns` 25s loop; external
  `cdnjs` icon stylesheets; JS module bundle. Tailwind utility output.
- `Design library/src/server/dox/schema.ts:49-53` — `safeRoute`
  trailing-slash refusal; `:75-109` `doxTokenSchema` union;
  `:132` section category canon constraint.
- `Design library/src/server/components/categories.ts:3-51` — 51
  category labels (canon to extend).
- `Design library/sandbox/astro-template/src/styles/global.css:1-54` —
  shadcn-scale token baseline for `target: astro`.
- `Apiary/site/src/styles/global.css:3-31` — self-hosted `@font-face`
  brand faces; `:83-97` ported `anim-*` keyframe classes (load-time,
  no IO, no reduced-motion guard).
