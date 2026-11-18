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
  `type`, `primary_keyword`, `pain_point` frontmatter + body), with
  the final link graph injected. `site/sitemap.md`,
  `site/tone-profile.md`, `site/site-brief.md`, and
  `site/customer-profile.md` still ride the run folder. Design
  sources are one or both of:
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
| `site/design/refs/` | operator-captured HTML + screenshots, site-intake variants, inspiration captures | ≥1 design source required |
| `site/design/refs/MANIFEST.md` | site-intake / operator | OPTIONAL — capture roles: `baseline` (extract identity), `inspiration` (extract character), `inspo-text` (extract copy/sections only — visual ignored), `variant` (picked direction, token block verbatim) |
| `site/design/audit.md` | ux-auditor pass on baseline captures | audit-remodel mode only — "correct, don't replicate" instruction set |
| `templates/astro/` | vendored starter, factory repo | YES — every site scaffolds from it |
| `site/company-description.md` | S2 stage output | YES when an `/about/` route exists — footer blurb + about body + JSON-LD `description` all render it |
| `site/customer-profile.md` | S2 stage output | YES — the hero module's trust strip reads from its trust bank; the fold quad is a COMPONENTS row |



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

## The shell contract — SEO surface, media, JS, a11y

This is the normative contract every `sites/<slug>/` build satisfies
regardless of design source. It answers the audit findings the early
specs left unowned (AUDIT-S5A F9 a11y, AUDIT-S5B F7 JSON-LD,
AUDIT-RESPONSIVE F5/F6): these are build-lane requirements the S7
gate re-verifies on `dist/`.

### Structured data — one entity graph per site

Every page emits a single `<script type="application/ld+json">` block
whose `@graph` is rooted at the business entity — "interlinked
schema": page nodes reference the business node, never parallel
island JSON-LD. A `JsonLd.astro` component builds the graph;
`SEOHead.astro` accepts an optional `jsonLd` prop and renders the
block — one emit point, one authority.

| Node | When | Built from |
|---|---|---|
| `LocalBusiness` / `Organization` | every page | `site.ts` facts (name, url, telephone, address, `sameAs` from `site-brief.md` social profiles, `description` from `company-description.md`, `image`/`logo` from brand asset) |
| `WebSite` | every page | origin + name + search action absent (brochure sites) |
| `BreadcrumbList` | every non-root page | sitemap `parent` chain — generated, never hand-written |
| `Service` | `money` pages | page H1/description + provider = business `@id` |
| `Article` | `article` pages | frontmatter title/description/path; `author` = business `@id` |
| `FAQPage` | `faq: yes` rows only | generated from the rendered `<details>` Q/A markup — never hand-written, or it drifts from the copy (AUDIT-S5B F7) |
| `AggregateRating` + `Review` | only when `site-brief.md` `review_source` carries real review data | GBP URL or pasted testimonials — fabricated ratings are a correctness + policy violation, never emitted |

`@id` discipline: `origin` for the business node, `origin#website`
for WebSite, `origin<route>#breadcrumb` etc. — every reference is a
dereferencable fragment on the canonical origin.

### Open Graph + social surface

`SEOHead.astro` emits the full set per page: `og:title`,
`og:description`, `og:url`, `og:type` (`website`/`article`),
`og:image` (+`og:image:width`/`height`), `og:site_name`, `og:locale`,
`article:published_time`/`article:modified_time` on `article` pages,
plus `twitter:card`, `twitter:title`, `twitter:description`,
`twitter:image`, and `twitter:site` when the brief's social profiles
name an X handle.

**Default OG image.** Every site ships
`public/og-image.png` — 1200×630, generated by the build lane: brand
wordmark + `gbp_primary_category` + service area on brand tokens, via
the starter's `src/og/og-image.svg` template rasterized at build
time. A row's `og_image` overrides it for that route only. An
absolute-URL `og:image` on every page is a gate item — sharing a page
with no card is the dead-OG defect.

### Social links — one data source, two render sites

`site-brief.md` `social_profiles` lands in `site.ts`'s `social` array;
`SocialLinks.astro` renders it in the footer on every page and inside
the `/about/` page body — two render targets, one source. Empty array
→ the component renders nothing and the about page carries no social
section (a silent absence, never a dead icon or `#` href).

### The hero module — the fold quad component

Every page template renders a hero block that carries the
four-question contract as markup: the H1 (right place — what/who),
the standfirst paragraph (solve — the page's bound `pain_point`
mapped to the offer), the primary CTA (next step), and the trust
strip (trust — one line from the profile's trust bank or a
`site-brief.md` credential, never invented at build). This is a
named `COMPONENTS.md` row — the same four parts on every template,
styled per `design-dna`. Ancillary templates may drop the trust
strip where no credential applies; the other three parts never drop.
The content files own the copy (S3); the component owns the four-
part structure and the trust strip's slot.

### Footer — the closing surface + HTML sitemap

The footer component carries four regions: (1) **company
description** — `company-description.md`'s paragraph verbatim, one
`<p>` under the brand heading; (2) **social links** — `SocialLinks`
output; (3) **the HTML sitemap** — every route in `sitemap.md`,
grouped by pillar → cluster using `parent` ordering, ancillary
pages flat; the footer's site-map region IS the site's HTML sitemap —
every `href` resolves to a built route, so a dropped route is a
broken-sitemap defect, not a nav choice (on 60+ route sites each
cluster group may collapse into `<details>` — links stay in the DOM);
(4) **NAP block** — the `itemscope` LocalBusiness microdata the
starter already carries. Footer labels are plain text spans, never
heading elements — shell headings pollute the page's H2 sequence
(AUDIT-S5A F11). Decorative shell SVGs are `aria-hidden`; every
icon-only control carries an `aria-label`.

### Mobile action bar (`MobileCTA.astro`)

Every page carries a mobile-only bottom action bar — the full-width
two-button strip pinned to the viewport bottom (the pattern the
operator's mobile CTAs specify), replacing the floating button:

- **Actions:** `tel:` bound to `contact_phone` + the page-class CTA —
  `Get a quote` → contact route on money/utility pages, `Call` on
  articles, `sms:` link when `sms_notify` is live. Two actions, split
  even, never stacked — three or more means the second CTA goes to
  the in-page slot instead.
- **Visibility:** rendered at `<768px` only; `display:none` ≥768px
  (desktop CTAs live in the header/footer) and suppressed on the
  contact/quote route — a contact bar on the contact page is
  redundant.
- **Geometry:** ≥48px row height, icon + short label per button,
  `aria-label`s, `env(safe-area-inset-bottom)` padding, `z-index`
  below the menu overlay, and `<main>` gets bottom padding equal to
  the bar height at mobile so content never hides under it — a bar
  that covers the footer legal line or the last card is a defect.

### Heading surface — semantic rank vs. visual size

Visual size and semantic rank are decoupled. A `.seo-h{1,2,3}` class
set renders any heading at a *smaller* fluid step than its rank's
default — a page can carry a visually modest SEO H1 with a larger
marketing display line under it (styled as a heading, marked up as
`<p class="display">`, never as a heading element). The heading
vector's *order* stays the SEO contract (H1 once, H2s = skeleton,
outline-coherent sub-headings); the class set only changes what the
vector *looks* like. `CLASS-SYSTEM.md` owns the mapping; a section
heading that needs visual prominence above its parent gets the
parent's *visual* size via the class, never a level swap.

### Icons-first interactive surface

Where a semantic icon exists, controls are icon-first: phone =
telephone glyph, quote = form/chat glyph, gallery = grid glyph. Text
labels survive only when no unambiguous icon exists or where the
action's meaning is not standard (a "Full gallery" action keeps its
label — a glyph alone can't carry that intent). Every icon-only
control carries `aria-label`; decorative icons `aria-hidden`. On
mobile this is the default; desktop may add visible text beside the
icon where the layout affords it.

### Ancillary surface — terms, privacy, 404

The sitemap's ancillary matrix already owns `/terms/` and `/privacy/`
routes; the build adds `src/pages/404.astro` — a designed 404, not a
server default: brand header/footer, the site's H1 ("Page not found"
in voice), the company description line, and an onward section — the
pillar links + call CTA that lead a lost visitor back into the
sitemap (the page "adds to the experience": the grid/type spacing
tokens apply to it identically — mathematically designed like every
other page, not a one-off). No 404 link appears in the sitemap or
nav; `robots` noindex.

### Component cards + CTA stacking

Every `COMPONENTS.md` card row names its mobile variant — the
desktop card and the mobile card are explicitly different layouts
from one class owner, not the same box squashed: mobile cards drop
to full-width single column, image-first or text-first per the row's
declared order, CTA links inside a card always sit at the card's
bottom edge (aligned across a card row — the `01/02/03` service-card
pattern where every card's meta line sits on one baseline).
Section-level CTAs on mobile stack vertically with a declared gap —
two buttons side-by-side at 360px is a defect; overlapping,
absolutely-positioned CTAs that bump into content are the same
defect. Action controls *inside* a media module (a "Full gallery"
button, a slider's controls) live inside the module's flow — under
the images, never floating over them and never overflowing the
module edge.

### Copy surface — no directional text

UI copy never instructs the reader how to operate the interface:
no "click here", "scroll down", "use the menu", "tap to call"
strings in any component — chrome is self-evident; copy carries
information, not directions. This is the shell-side twin of the
S3/S4 banned-anchor rule (rule 11): directional text is banned as
*link text* in content and as *label text* in components.

### Images — `astro:assets`, WebP/AVIF, intrinsic sizes

Page images live in `src/assets/` and render through `astro:assets`
(`<Image>`) — Astro 5 bundles sharp, no new deps: srcset at 2–3
widths, WebP and AVIF emitted with the original as final fallback,
explicit `width`/`height` on every `<img>` (CLS floor), `loading`
`eager` on the hero slot and `lazy` below the fold, `alt` from the
content file's `images:` map (decorative slots get `alt=""`).
`public/` keeps assets whose URLs must stay stable: `favicon.svg`,
`og-image.png`, `robots.txt`, and other non-fingerprinted files —
this split is what makes the S6 cache policy correct (fingerprinted
→ immutable; stable URL → revalidate). SVG illustrations may be
inlined; SVG logos/icons keep `currentColor` so they inherit theme
color and never break under caching or inversion.

### JavaScript — islands, not runtimes

The factory baseline ships **zero framework hydration**: no `client:*`
directive, no React/Vue/Svelte dependency in `package.json`, no
`is:inline`, no `define:vars`, no `<script src>`, no `@import url(`.
Component-scoped vanilla `<script>` in `.astro` components (the menu
script's pattern) is the JS channel — Astro bundles it
fingerprinted under `/_astro/`. A design source that *requires* a
hydrated widget (booking calendar, before/after slider) ships it as
a declared island — `client:visible`, named in `DESIGN-DNA.md` as a
documented exception with its bundle cost — and the dependency is
pinned in `package.json`. Anything else JS-flavoured is a refuse at
self-lint. And motion never gates content: reveal animations enhance
an already-visible default — a section whose visibility waits on a
class-triggered transition ships blank to hidden tabs, headless
renderers, and reduced-motion users; that is a refuse.

### Design bans — anti-pattern lint (the impeccable list)

The emitted site is a *designed* surface, not a generated one; the
following are refuse-at-self-lint CSS/copy classes (AUDIT-S5A F9's
"the exemplar violates the gate it models" lesson applied to the
slop catalog):

- **Gradient text** (`background-clip: text` + gradient fill).
- **Glassmorphism-by-default** — decorative `backdrop-filter` blur
  cards; allowed only where the design names the purpose.
- **Side-stripe borders** — `border-left/right` >1px as a color
  accent on cards/callouts.
- **Ghost-cards** — `border: 1px` + `box-shadow` blur ≥16px on the
  same element; pick one.
- **Over-rounding** — `border-radius` >16px on cards/sections/inputs
  (full-pill on buttons/tags is fine).
- **Stripe/noise decoration** — `repeating-linear-gradient`
  backgrounds, `feTurbulence`/`feDisplacementMap` sketch filters,
  hand-drawn SVG illustration classes (`*-sketch`, `doodle`, `wavy`).
- **Bounce/elastic easing** — motion eases out (quart/quint/expo);
  never bounce, never elastic, never layout-property animation.
- **Eyebrow/numbered scaffolding** — tiny uppercase tracked kickers
  or `01·02·03` markers above *every* section; one deliberate
  instance is voice, a repeating reflex is the AI tell.
- **Hero-metric template** — big-number + small-label + stats-row
  heroes; identical icon+heading+text card grids on every section.
- **Muted gray on tinted backgrounds** and placeholder text below
  4.5:1 — gray text on color reads washed-out; use a darker shade of
  the background's hue.
- **Arbitrary z-index** — `999`/`9999` values; the z-scale is a
  semantic token ladder (content → sticky → drawer-backdrop →
  drawer → action bar → skip link) declared in `CLASS-SYSTEM.md`.

A `TOKENS.json`/`COMPONENTS.md` row that *requires* one of these
for a deliberate brand system names the exception in `DESIGN-DNA.md`
— the exception is reviewed, the reflex is not.

### Responsive — fluid, stacked, no overflow

Fluid type and spacing scales are already REQUIRED (§Build lane step
3); the layout itself is fluid too — fluid `clamp()` grids and
`min()`/`max()` column math, not breakpoint-stepped containers. The
mechanical floors:

- **Grid stacking discipline.** Multi-column sections collapse on a
  declared staircase: 4-up → 2-up → 1-up as width falls, never a
  squeezed 4-across at 360px and never an orphan column. A
  `COMPONENTS.md` row that renders N columns names its staircase in
  `design-dna`; the build lane emits exactly those steps.
- **Zero horizontal overflow** at every viewport 320–1440px — any
  `overflow-x` on `html`/`body` is a defect; `main { overflow-x:
  clip }` rides the shell (the animations audit's F10 fix,
  load-bearing for transform reveals); tables/cards wrap or scroll
  *inside* themselves, never the page.
- **Tap targets ≥44×44 CSS px** at all widths — nav links, buttons,
  form fields, icon-only controls, the action bar.
- **The menu is usable, not just present:** focus-trapped drawer,
  links ≥44px, real labels (the shortened forms), Escape/overlay
  dismiss, body scroll-lock while open, bottom padding ≥
  `safe-area-inset-bottom` so the home bar never covers the last
  link — the starter's pattern is the reference implementation
  (AUDIT-RESPONSIVE F6).
- **No zoom-kill, no input zoom.** `<meta name="viewport">` never
  carries `user-scalable`/`maximum-scale` (WCAG 1.4.4); every
  `<input>`/`select`/`textarea` computes ≥16px `font-size` — below
  that iOS Safari zooms on focus and the layout shifts under the
  user's thumb.
- **`dvh`/`svh` for mobile viewport units.** `100vh`/`100dvh`-naive
  heights break behind mobile browser chrome; full-viewport blocks
  use `100dvh` (or `svh` where stability matters), `vh` alone is a
  defect.
- **Touch is primary.** Nothing the page *requires* hides behind
  `:hover` — menus, tooltips, and reveals must be reachable by tap/
  keyboard (`@media (hover: hover)` wraps hover-only polish).
- **Anchors clear chrome.** `scroll-padding-top` on `html` ≥ sticky
  header height so `#fragment` links don't land under the header.
- **Popovers escape clipping.** Dropdowns/panels never
  `position: absolute` inside an `overflow: hidden/auto/clip`
  ancestor (our own `overflow-x: clip` makes this live) — use
  `position: fixed`, the native `<dialog>`/`popover` API, or a
  portal-like mount.
- **Overflow is a symptom, not a fix.** `overflow-x: clip` contains
  transform reveals; it must not mask a *text* defect — headings/
  long words that overflow at 320–390px get a smaller clamp or
  rewritten copy, not a clip (impeccable: the viewport is part of
  the design).
- **Type usability floors.** Body measure ≤75ch; `text-wrap: pretty`
  on long prose; display letter-spacing ≥ -0.04em; display size caps
  ≤6rem (`fs` scale already obeys); light-on-dark text gets +0.05–0.1
  line-height.
- **Editable at scale.** Every shared visual decision is a token or
  a `@layer components` class — one edit site per concern, which is
  what makes the S7 ~10% tweak loop cheap (the single-owner rule
  already enforces this; the floor is stated here because
  breakpoint-scattered overrides are its classic violation).

### Weight budget

"Light as possible" is a number, not a posture. Per page, emitted
`dist/` bytes (uncompressed): ≤150 KB HTML, ≤500 KB total first-load
transfer (HTML + CSS + JS + fonts + eager images), ≤100 KB JS, ≤60 KB
CSS, hero image ≤150 KB post-`astro:assets`. Self-hosted fonts are
WOFF2 only, `font-display: swap`, ≤2 families / ≤4 files. A lane
that blows the budget names which asset broke it — the report rows
the overage, never a silent pass. Images for mobile are optimized by
the `astro:assets` contract above — the srcset widths are what serve
the small files to small screens.

### A11y baseline (WCAG 2.2 AA floors)

Semantic landmarks — one `<header>`, one `<main id="main">`, one
`<footer>`, labelled `<nav>`s (`aria-label` distinguishing Primary
from Site map), `<address>` for NAP, `<article>` for article
routes, `<details>` for FAQ. A skip link to `#main` is the body's
first element. `:focus-visible` styles on every interactive element.
Accent-on-paper contrast ≥4.5:1 (token lint's job — a failing token
pair is named in `DESIGN-DNA.md`, never shipped). `prefers-reduced-
motion` guards every keyframe/animation. Interactive patterns carry
the keyboard contract the menu models: `aria-expanded`/`aria-controls`
pairs, Escape-dismiss, focus return. These are gates, not habits.

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
   section skeletons. `refs/MANIFEST.md` roles steer extraction:
   `baseline` rows yield identity (logo, NAP, palette, layout regions);
   `inspiration` rows yield character only (never the business facts);
   `inspo-text` rows yield copy/sections only — text extracted as
   evidence, the captured visual never informs tokens or layout;
   a `variant` row carries an embedded `<script id="tokens">` block
   already shaped as `site-intake-tokens@1` clamp() pairs — extract it
   verbatim into `TOKENS.json` instead of deriving. When
   `site/design/audit.md` exists, its ranked issues are the correction
   list: replicate what passes, fix what it flags, and record both in
   `DESIGN-DNA.md`. The captured markup is never copied into the
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
   (hamburger → focus-trapped drawer, ≥44px links, Escape/overlay
   dismiss, scroll-lock), the `MobileCTA.astro` mobile action bar
   ships per §Mobile action bar, and the footer is the complete
   closing surface per §The shell contract — company description,
   social links, the grouped HTML sitemap, NAP microdata — not
   placeholders. Nav link LABELS are shortened forms of the route's
   long category H1 (e.g. H1 `Auto Dent Removal Service` → label
   `Dent Removal`); the lock binds URL/H1/title, never the label —
   labels must fit the mobile bar. `SocialLinks.astro` renders
   `site.ts`'s `social` array in the footer and on the `/about/`
   page; `JsonLd.astro` owns the entity graph every page emits.

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
   `description`, canonical, `og_image`, `faq`) and `<JsonLd>`
   (entity type per page class); the body feeds the layout's section
   slots, `images:` slots bind to `astro:assets` `<Image>` renders,
   and `faq: yes` bodies render as `<details>` with generated
   FAQPage JSON-LD. Frontmatter fields are *copied*, never
   rewritten — the copy is S3/S4's reviewed output. The `/about/`
   route's body embeds `company-description.md` verbatim (S3 already
   placed it) and renders `SocialLinks` — the second of the two
   social render sites.
7. **Assets.** Page imagery goes to `src/assets/` (the
   `astro:assets` pipeline — WebP/AVIF + srcset + intrinsic sizes per
   §The shell contract); DOX `EVIDENCE/` images the specs actually
   use copy there too — screenshots captured purely as *reference*
   stay out of the shipped site. `public/` keeps stable-URL assets
   only: `favicon.svg`, the generated `og-image.png`, `robots.txt`,
   `form.php` targets. The lane generates `public/og-image.png`
   (1200×630) from the starter's `src/og/og-image.svg` template —
   brand wordmark, `gbp_primary_category`, service area on brand
   tokens.
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
   - no `client:*` directive, `is:inline`, `define:vars`, or
     framework dependency outside a `DESIGN-DNA.md`-declared island —
     the vanilla-script baseline is the lint;
   - every `<img>` render carries intrinsic `width`/`height` and a
     non-empty `alt` (or `alt=""` for `decorative` slots);
   - every `social_profiles` URL the brief carries renders in the
     footer markup — a dropped profile is a missing-entity defect;
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
- The §The shell contract holds at source level: `SocialLinks`,
  `JsonLd`, the skip link, and `og-image.png` all exist in the
  scaffold; `public/` carries only stable-URL assets.
- `DESIGN-DNA.md` names every held-out DOX route, every fallback
  route, every defaulted token, and every declared hydrated island.

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
