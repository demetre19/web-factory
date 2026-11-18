# AUDIT — DESIGN-PLAN machinery (d89517c + b4edacf)

**Verdict: fix-first.** The plan-first idea is sound and the catalog's
closed-set direction is right, but as wired the machinery contains one
branch-blocking contradiction (DOX), one unwritable-section class
(proof card grids), an undefined artifact cardinality (one plan vs N
routes), a stale rule that contradicts its own catalog, and a set of
"hard rules" no gate actually checks. A weak model following these
files literally will either refuse-loop on DOX sites, emit sections the
catalog bans, or self-certify rhythm violations that pass done-criteria.
Nothing here requires rethinking the approach — every finding has a
concrete patch.

Scope reviewed as one system: `docs/machinery/SECTION-CATALOG.md`,
`docs/machinery/DESIGN-PLAN.md`, `docs/machinery/DESIGN-INTAKE.md`
(new section), `research/WEB-FACTORY-S5-DESIGN-DNA.md` (amended),
`skills/s5-design-dna/SKILL.md` (amended). Cross-checked against
`research/DESIGN-FORETHOUGHT.md` §6 (declared schema source),
`research/DESIGN-LIBRARY-TAKEAWAY.md`, the DOX contract
(`Design library/DOX/01-CONTRACTS.md`,
`src/server/components/categories.ts`), `tools/site-intake/`,
`research/CATALOG-VERIFICATION.md`, and the two live packets
(`sites/whistleclean/`, `sites/lavisha/`).

Note: `b4edacf` (post-d89517c) already corrected the adjacency rule and
page sequences inside SECTION-CATALOG after verifying against 5 real
sites — but did not propagate the corrections into DESIGN-PLAN.md,
which still states the superseded rules. Findings below are against the
current working tree.

---

## Findings table

| # | Sev | Finding | Evidence | Fix |
|---|---|---|---|---|
| F1 | **P0** | DOX branch cannot satisfy the new acceptance without violating packet authority | S5 spec:544-548 (SPECs copied verbatim pre-plan), 549-555 ("before PAGES/*/SPEC.md"), 698-703 (every SPEC row must carry new fields); SKILL.md:83-85 (one authority per route) | Scope plan→SPEC verbatim rule + row-copy acceptance to refs-derived SPECs; on DOX branch define DESIGN-PLAN as derivation record over `design-manifest.json` sections[] (which already carry category/surface/density) adding speech_act+composition |
| F2 | P1 | `DESIGN-PLAN.md` hard rule 2 states the superseded adjacency rule — contradicts SECTION-CATALOG §4 | DESIGN-PLAN.md:109-111 (bans shared `(surface,density,composition)` triple) vs SECTION-CATALOG.md:90-95 (bans shared `composition` only; triple rule explicitly corrected in b4edacf) | Copy the current catalog rule into DESIGN-PLAN rule 2 verbatim; add a "rules mirror catalog §4" note so future catalog edits force a plan-doc sync |
| F3 | P1 | Plan cardinality undefined — one `DESIGN-PLAN.md` cannot hold N routes × page_classes | DESIGN-PLAN.md:12-102 (single `idea`, single `rhetoric`, single `sections:` list, no route key); spec:142 + SKILL.md:61 (one file per site); spec:167-172 (sites carry money/article/ancillary routes); acceptance spec:701-702 demands every SPEC copy from it | Declare per-route plans: `pages: {<slug>: {idea, rhetoric, sections[]}}` inside one file, or `PAGES/<slug>/PLAN.md`; site-level `direction`/`system`/`motif` stay shared |
| F4 | P1 | `hero-act-merge` + act-twice is unrepresentable in the schema | CATALOG:69 (`promise`+`act` two acts), :106-107 (act twice on money page) vs CATALOG:27 ("exactly one speech-act"), DESIGN-PLAN.md:91 (single `speech_act:` field), :45 (rhetoric lists `act` once) | Allow `speech_act:` to be a list or add `secondary_act:`; state rhetoric may repeat acts |
| F5 | P1 | `detail`/`chrome` speech_acts can't satisfy hard rule 4 | CATALOG:38-39 defines them; DESIGN-PLAN.md:39-46 rhetoric template has only 6 acts; rule 4 (:114-115) requires every section's act ∈ rhetoric — header/footer/detail sections are unplannable or force category errors | Add `detail`/`chrome` rows to the rhetoric template marked "structural, not argumentative", or exempt `chrome` from the membership check explicitly |
| F6 | P1 | `preview/system.html` is an orphan artifact — required by spec, absent from write set, acceptance, and format contract | spec:144-145 (output tree), :558-561 (produce it); DESIGN-PLAN.md:120-123 (rule 7); SKILL.md:59-63 (write set omits `preview/`), :93-97 (acceptance omits it); DOX flatten list spec:544-545 drops `designs/` so the packet's own `design-system.html` never arrives | Add `preview/` to write set + acceptance; specify content contract (surfaces × densities × ranks × components, token-sourced, self-contained); state DOX-branch behavior (regenerate vs copy packet page — pick one) |
| F7 | P1 | Plan enums dead-end at the build seam — no mapping from `surface`/`density`/`composition` to classes/components | New fields produced in SPEC rows (CATALOG:117-124, spec:566-569) but build lane (spec:643+) and CLASS-SYSTEM contract (SKILL.md:70-72) define no enum→class/component dispatch; builder must improvise — the failure the machinery exists to prevent | Require CLASS-SYSTEM.md rows keyed by surface/density (or COMPONENTS.md composition→component registry); add build self-lint check that emitted sections match plan enums |
| F8 | P1 | Schema transcription dropped the closed sets — weak model samples defaults | DESIGN-PLAN.md:53 `type_contrast` free text (FORETHOUGHT:534 closed enum lost); :61 `ranks` bare names (FORETHOUGHT:543-547 rank tuples lost); :74-75 `color.roles` names only, no hex/why/contrast pair (FORETHOUGHT:319-322 lost); :97 `align` "named edge" — no edge catalog exists; :66 `section_densities` token names undefined; :59-60 `endpoints` lacks base size so clamp() underivable; :62 `fonts` free stacks | Restore FORETHOUGHT §6 field shapes: rank tuples, per-role color values + declared contrast pairs, closed `type_contrast` enum, named-edge list, Utopia min/max with base+ratio per endpoint |
| F9 | P1 | Step order writes §5 "closed system numbers" before the refs evidence that should fill them | spec:549-555 (plan first, "closed system numbers") vs spec:562+ (step 6 "Derive from refs" extracts tokens); on refs-inspiration/audit-remodel/refs-existing the numbers are invented, then TOKENS.json must match or conflict — no reconciliation rule | Reorder: inventory/extract refs evidence before §5, or split plan fill (prose §1-4,7-8 → evidence pass → §5 numbers → §6-7); state which side wins on plan↔refs conflict |
| F10 | P1 | No composition for proof card-grids — existing designed pages become unwritable | CATALOG:58 (`cards-n` → how/detail only), :62-65 (proof → proof-band/logo-wall/stat-band/badge-center only); whistleclean `PAGES/reviews/SPEC.md` §2 (`grid md:grid-cols-3` quote cards) and `PAGES/home/SPEC.md` §4 (3-card grid) match no allowed pair → refuse-by-rule | Add `quote-grid`/`card-grid` composition allowed for `proof`; clarify `cards-n` vs the banned icon-grid note (:72-75) — state whether uniform feature cards are `cards-n` or banned |
| F11 | P2 | `category` source-of-truth ambiguous; catalog uses slugs, plan says "52 labels"; `faq` isn't canonical; ~33/52 categories unmapped | DESIGN-PLAN.md:92 ("∈ 52 category labels"); CATALOG:32-39 (slug values); list lives in Design-library `src/server/components/categories.ts`, not vendored; `faq` (CATALOG:36) has no label in the 52 → fails `isComponentCategorySlug`; unmapped: pricing, newsletter, blog-*, product-*, shop-*, cart, checkout, login, event-*, portfolio-*, etc. → "section that maps to none is a defect" makes them unplannable | Vendor the slug list into `docs/machinery/` (or a pinned pointer); state slug-vs-label form; add speech_act rows for `pricing`/`newsletter` at minimum; fix or drop `faq` |
| F12 | P2 | `speech_act` enum drift: rhetoric key `act` (6 values) vs catalog `speech_act` (8 values) | DESIGN-PLAN.md:40-45 (`act:` ×6) vs CATALOG:32-39 (`speech_act` ×8, adds `detail`,`chrome`); three names for one concept (`act` field, `speech_act` column, "speech-act" prose); rule-4 membership undefined across lists | Rename rhetoric key to `speech_act`; extend template with `detail`/`chrome` rows marked structural |
| F13 | P2 | "Hard rules" are unenforceable — the only gate checks composition membership; everything else is self-certified | DESIGN-PLAN.md:109-119 (rules 2-4,6); spec:698-703 + SKILL.md:93-97 (acceptance checks only non-empty + composition resolves + "complete top-to-bottom" self-judgment); rule 2's stated enforcement is `DESIGN-DNA.md` written by the same lane | Add mechanical acceptance items: adjacency composition-uniqueness, `inverse ≤2`+footer, `brand ≤1`, spacious allotment, speech_act membership, idea ≤25 words, SPEC-row verbatim diff vs plan — as a lint script or explicit coordinator checklist |
| F14 | P2 | Retroactivity unspecified — existing packets (whistleclean ×8 SPECs, lavisha ×1) fail new acceptance; re-run skip rule doesn't cover the new artifact | spec re-run rule ("route checksum equality") doesn't define verification for DESIGN-PLAN; no DESIGN-PLAN.md or new-format SPEC rows in either live packet; `preview/home.html` ≠ `preview/system.html` | State migration rule: re-minted distill lanes on existing sites MUST backfill DESIGN-PLAN + convert SPEC rows, or name old packets grandfathered with a dated exception |
| F15 | P2 | SECTION-CATALOG §1 vs §3 contradict; `page_class` mechanism orphaned; stale step cross-ref | CATALOG:41-44 ("canonical sequence… not a suggestion") vs :80-84 ("reference skeleton, not a required order"); :79 "`page_class` picks the sequence" but per-class sequences deleted (page_class now only feeds template kind, spec:167-172); spec:542-543 still says fallback visual system is "(step 5)" — it's step 6 after renumbering | Reconcile §1 language with §3; delete/repoint the page_class sentence; fix step reference to 6 |
| F16 | P2 | Duplicate intent/design artifacts with no stated authority | DESIGN-PLAN.md:27-36 (§1 who/one_action/worst_case) duplicates `INTENT-BRIEF.md` fields verbatim (exists at sites/whistleclean/site/design-dna/INTENT-BRIEF.md); §4-5 overlap `CHARACTER.md` + `DESIGN.md`; conflict resolution unstated | Declare DESIGN-PLAN the authority; mark INTENT-BRIEF/CHARACTER/DESIGN.md as inputs or derived views |
| F17 | P2 | Composition coverage gaps: location/map, newsletter capture, hero-less pages, multi-CTA utility | No map/finder composition (AUDIT-LOCATION.md is a live factory concern; `link-grid` CATALOG:70 covers lists not maps); `form-panel` "only place a form lives" allowed for `act`(contact) — newsletter forms have no valid pair; 404 SPEC exists (whistleclean) with no page_class/hero so promise-first + fold-boundary rules don't apply; `link-grid` doesn't specify text-index vs card-grid — audit #3 banned the card variant on home | Add compositions/notes for map-finder, newsletter capture, hero-less page sequences; scope `link-grid` to the text-index pattern or name the banned variant |
| F18 | P3 | Minor terminology drift | CATALOG:50 refuse-example names `split-hero` — not a composition value (`split-media` is); measure cited as 62ch example (DESIGN-PLAN.md:69), editorial ≤65ch (CATALOG:57), shell ≤75ch — three numbers, binding scope unstated; `accent_budget "≤10% of pixels"` (:76) has no measurement method; `design_mode` comment (:23) "refs-*" doesn't match intake's `inspo-text`+`variants` combo; DESIGN-INTAKE.md:112-113 missing blank line before `## Design roles` | Fix `split-hero`→`split-media`; state which measure binds `system.grid.measure`; define or drop the pixel-budget claim; enumerate real `design_mode` values; add the blank line |

---

## Detail per finding

### F1 — P0: DOX branch cannot satisfy acceptance without breaking packet authority

Step 4 (`research/WEB-FACTORY-S5-DESIGN-DNA.md:544-548`) flattens the
packet's `PAGES/*` SPECs into `design-dna/` verbatim — "the distill lane
copies the spec and acceptance files, not draft prose." Step 5
(:549-555) then requires `DESIGN-PLAN.md` written "before
`PAGES/*/SPEC.md`" — impossible on this branch, the SPECs already exist
— and DESIGN-PLAN hard rule 6 (:118-119) makes every SPEC's section
rows a verbatim copy of the plan with contradiction = refuse. The
stage acceptance (:698-703) requires *every* `PAGES/*/SPEC.md` section
row to carry `speech_act`/`category`/`surface`/`density`/`composition`
copied from the plan. DOX SPECs are packet members in the packet's own
format; they carry none of the new fields, and the SKILL's both-sources
rule (:83-85) makes the packet the sole authority for its routes —
augmenting the copies with distill-lane inventions is a route-level
blend. Three horns, all bad: (a) leave SPECs verbatim → acceptance
fails → `prd_step done` cannot honestly close → S6 never mints; (b)
rewrite SPECs → provenance/verbatim-copy contract broken; (c) write the
plan after SPECs exist → the "written first" invariant is violated on
every DOX run. The DOX packet's `design-manifest.json` already carries
per-section `category`/`surface`/`density`/`variant`
(01-CONTRACTS.md:287-288), so the plan on this branch is mostly
transcription anyway — which is exactly why it needs an explicit,
different contract rather than the refs-branch rules.

**Fix:** split the contract by branch. On DOX: DESIGN-PLAN is a
*derivation record* — `meta.design_mode: dox`, fields filled from
`design-manifest.json` sections[] + `SYSTEM/*`, recording speech_act +
composition assignments the packet lacks; packet SPECs stay verbatim
and are exempt from the row-copy acceptance (or the acceptance checks
an addendum file `PAGES/<slug>/PLAN-ROWS.md` instead). On refs: keep
the verbatim rule as written.

### F2 — P1: DESIGN-PLAN rule 2 contradicts the catalog it cites

`docs/machinery/DESIGN-PLAN.md:109-111` still states "Adjacent sections
never share the same `(surface, density, composition)` triple." Commit
`b4edacf` corrected `SECTION-CATALOG.md:90-95` to "Adjacent sections
MAY NOT share the same `composition`" after `research/CATALOG-
VERIFICATION.md` showed real pages hold one surface ~80% of the time —
the triple rule was the pre-verification text. The plan doc was not
updated. The two rules are not equivalent: same-composition/different-
surface is legal under the plan's triple rule but refused by the
catalog. A lane following DESIGN-PLAN will emit SPECs the catalog
refuses; a lane following the catalog will "violate" the plan's hard
rule. The plan declares the catalog its rule source (:107) so the
contradiction is internal to the new system.

**Fix:** replace rule 2's text with the catalog §4 rules verbatim (or
reduce it to "adjacency + repetition rules = SECTION-CATALOG §4,
verbatim") and add a sync note: catalog §4 is the single source; the
plan references, never restates.

### F3 — P1: one DESIGN-PLAN.md cannot express a multi-route site

The output tree (spec:133-148) and write set (SKILL.md:59-63) define a
single `site/design-dna/DESIGN-PLAN.md`. The schema
(DESIGN-PLAN.md:19-102) carries one `meta`, one `intent`, one `idea`
("the page argues", :33), one `rhetoric` sequence, and one flat
`sections:` list introduced as "one row per section, in rhetoric order"
(:98) — unambiguously a single page's argument. But S5 sites have many
routes spanning `money | article | ancillary` page_classes
(spec:167-172; whistleclean alone has 8 SPECs). Acceptance
(spec:701-702) requires *every* `PAGES/*/SPEC.md` to copy rows from the
plan. Nothing in the schema provides a route dimension: section rows
have `name:` but no `route:`/`page:` key; `meta` has no page field. A
weak model must either write only the home page's plan (leaving 7
SPECs with nothing to copy → rule-6 refuse) or concatenate all routes
into one `sections:` list (destroying the per-page rhetoric the
artifact exists to protect).

**Fix:** declare cardinality explicitly. Recommended shape — keep one
file, add a `pages:` map:

```yaml
site_system: {direction, system, motif}        # shared, filled once
pages:
  home:      {page_class: money,    intent, idea, tension, rhetoric, sections[]}
  about:     {page_class: ancillary, intent, idea, tension, rhetoric, sections[]}
  …one entry per SPEC…
```

`decisions[]` stays site-level append-only. Acceptance then checks
"every SPEC has a `pages.<slug>` entry" — mechanically checkable.

### F4 — P1: `hero-act-merge` and act-twice are unrepresentable

Post-verification catalog requires `act` twice on money pages — "once
merged into the hero (search/form/CTA), once late-page"
(SECTION-CATALOG.md:106-107) — and provides `hero-act-merge` for
exactly this ("`promise`+`act`", :69). But catalog §1 states "Every
section maps to exactly one speech-act" (:27), DESIGN-PLAN §7 gives each
row a single `speech_act:` field (:91), and the rhetoric template lists
`act` once (:45) with no stated duplication rule. The verified-real
pattern — the hero IS the first action on 5/5 captured sites — cannot
be written in the plan's own schema.

**Fix:** allow `speech_act:` to be a list (`speech_act: [promise, act]`)
or add `secondary_act:`; state in rule 4 that `speech_act` membership is
checked against the rhetoric multiset (acts may repeat; `act` is
required twice on `money`).

### F5 — P1: `detail`/`chrome` speech_acts fail hard rule 4 by construction

Catalog §1 defines 8 speech_acts including `detail` (:38) and `chrome`
(:39 — headers/footer). DESIGN-PLAN's rhetoric template (:40-45)
contains only 6 acts, and hard rule 4 (:114-115) requires *every*
section's `speech_act` to be "∈ the rhetoric sequence." Every real page
has a header and footer; detail sections (galleries, tables, content)
are normal. A literal reading forces the model to either inject
`chrome`/`detail` into "the argument" (a category error — the footer is
not rhetoric) or violate rule 4. Meanwhile catalog §4 budgets footer
surface (`inverse ≤2 + footer`, :96), confirming chrome IS a planned
section whose act the schema can't express.

**Fix:** extend the §3 template with `detail` and `chrome` rows
annotated "structural — exempt from rhetoric ordering," and scope rule
4's membership check to argumentative acts (`promise…act`) while
requiring `detail`/`chrome` rows to exist for the sections they cover.

### F6 — P1: `preview/system.html` is an orphan artifact

The file is required in the output tree (spec:144-145), produced in
step 5 (spec:558-561), and mandated by DESIGN-PLAN hard rule 7
(:120-123). But: the SKILL write set (SKILL.md:59-63) enumerates
distill outputs and does not list `preview/` — a lane following the
skill's authoritative write list will either skip a spec-required
artifact or write outside its declared set; acceptance (SKILL.md:93-97,
spec:698-703) never checks it exists or what it contains; no format is
specified (Tailwind? token source? plain HTML? does it obey the
no-remote-fetch rule?); and "page previews" referenced as the thing
system.html precedes appear nowhere in the tree — who produces them,
when, is unstated. On the DOX branch it's worse: step 4's flatten list
(spec:544-545) copies `SYSTEM/*`, `ROUTE-MANIFEST.json`, `PAGES/*`,
`EVIDENCE/*` — the packet's own `designs/design-system.html` (required
by 01-CONTRACTS.md:269) is dropped, so nothing carries over and the
lane must author `preview/system.html` fresh with no stated source.

**Fix:** add `preview/system.html` to the write set and acceptance;
specify its contract (one row per surface × density, every type rank,
buttons/fields/cards, values bound to TOKENS.json, self-contained);
state DOX-branch behavior — either "regenerate from packet tokens" or
"copy packet `designs/design-system.html` to `preview/system.html`"
(pick one; copying is cheaper and preserves the reviewed artifact).

### F7 — P1: plan enums have no consumer — the build seam is unspecified

The patch produces `speech_act`/`category`/`surface`/`density`/
`composition` rows (CATALOG:117-124) that SPECs copy verbatim
(DESIGN-PLAN.md:118-119). But the build lane's contract never says how
these translate to implementation: build step 5 (spec:643+) maps
layouts per template node; CLASS-SYSTEM.md is "class table: name |
owner | purpose | token refs" (spec:139); the build rules
(SKILL.md:70-72) govern class ownership, not enum dispatch. Nothing
binds `surface: inverse` to a class (`.section--deep`? `bg-inverse`?),
nothing binds `composition: split-media` to a component or layout
recipe. The builder — the exact weak model this machinery targets —
will improvise the mapping per page, reintroducing the freehand-layout
defect one layer down. The plan is authority in name only at the seam
where it matters most.

**Fix:** add a translation contract. Minimal version: CLASS-SYSTEM.md
MUST carry surface/density-keyed rows (e.g., `surface.inverse →
.section--inverse`), COMPONENTS.md MUST name which component each
`composition` value instantiates, and build self-lint (spec:667-690)
adds "every rendered section's class set matches its SPEC row's
enums." That makes the plan→build path checkable end to end.

### F8 — P1: the schema lost its closed sets in transcription

`docs/machinery/DESIGN-PLAN.md` declares itself "Schema source:
`research/DESIGN-FORETHOUGHT.md` §6" (:9) but several fields were
dropped from free-ish text in transit:

- `type_contrast` (:53) is `<named position, e.g. "serif display /
  sans body">` — FORETHOUGHT:534 closed it to
  `serif-display/sans-text | mono-accents | single-family-weight-contrast`.
  Free text → the model samples anything.
- `system.type.ranks` (:61) is a bare name list. FORETHOUGHT:543-547
  requires per-rank tuples `{step, weight, tracking, space_above}` —
  without them the plan locks no type numbers, contradicting the
  section header's own claim "closed set, every value a token" (:56).
- `system.color.roles` (:74-75) lists role *names* only. FORETHOUGHT's
  color study carries hex + why + declared contrast pair per role —
  the actual color decisions escape the plan into TOKENS.json, which
  is written *after* the plan it should govern.
- `align: <named edge>` (:97) — no edge catalog exists anywhere;
  FORETHOUGHT §2.8 describes the concept, not a value set.
- `section_densities` (:66) references `<token>` names that are never
  defined (TOKENS.json uses `3xs…3xl`/named space tokens — which map?).
- `endpoints {min:320, max:1440}` (:59-60) lacks per-endpoint base
  size + ratio, so the clamp() steps the plan claims to produce are
  underivable (FORETHOUGHT's Utopia shape needs base+ratio per end).
- `fonts` (:62) is free `<stack>` text; `refused` (:54) collapsed
  FORETHOUGHT's `rejected_directions[]` list to one string.

Each is a place a weak model fills a plausible default — precisely the
failure mode the artifact exists to kill.

**Fix:** restore the FORETHOUGHT §6 field shapes verbatim (rank tuples,
color role values + contrast pairs, closed `type_contrast` enum,
Utopia endpoints with base+ratio), and either define the named-edge
list + density-token names or mark those fields prose-optional so
"blank = rejected" (:116-117) doesn't reject honest plans.

### F9 — P1: §5 numbers are written before the evidence that should fill them

Distill step order (spec): step 5 writes DESIGN-PLAN including "the
closed system numbers" (:549-555); step 6 "Derive from refs" is where
captures are read and TOKENS.json is written (:562-575). On
refs-inspiration / audit-remodel / refs-existing sites — three of the
four intake scenarios — the plan's system numbers are authored before
the refs are examined. The numbers are therefore invented; then step 6
extracts real tokens from evidence; then nothing says which side wins
when they disagree (plan is "the unit of review" :116-117, but TOKENS
provenance says refs are authority). A weak model resolves this by
letting the plan's guesses stand — the refs machinery becomes
decorative.

**Fix:** reorder or split. Either move a refs-inventory pass before
step 5 ("read captures, list candidate tokens" — not full derivation),
or split the plan contract: prose §1-4 + §7-8 may be written first;
§5 numbers are filled *after* token extraction with an explicit
reconciliation rule (e.g., "refs evidence overrides plan defaults;
every override logged in decisions[]").

### F10 — P1: no composition exists for proof card-grids — live pages become unwritable

Post-verification catalog allows `proof` only `proof-band`,
`logo-wall`, `stat-band`, `badge-center` (CATALOG:62-65);
`cards-n` is restricted to `how`/`detail` (:58). The already-designed
whistleclean packet uses a 3-up quote-card grid on `/reviews`
(`PAGES/reviews/SPEC.md` §2: "`grid md:grid-cols-3 gap-md` (3
`.quote-card`s)") and a 3-card grid on home §4 — under the new catalog
neither has a legal `(speech_act, composition)` pair → refuse-by-rule
on pages the factory already shipped. Related ambiguity: `cards-n` is
"2–4 uniform cards in a grid" while the banned note (:72-75) bans
"icon+heading+text card grids *used as a substitute for a real
composition*" — a uniform feature-card grid is arguably both; the
catalog never says which.

**Fix:** add `quote-grid` (or widen `cards-n` to `proof`) for
testimonial grids; state explicitly whether `cards-n` IS the sanctioned
uniform-card composition (with the ban applying only to icon-grids used
*as decoration*) or a distinct row.

### F11 — P2: `category` vocabulary has no in-repo source of truth and `faq` isn't in it

DESIGN-PLAN.md:92 annotates `category: hero # ∈ 52 category labels` —
but the canonical list lives in the Design-library repo
(`src/server/components/categories.ts` → `COMPONENT_CATEGORY_SLUGS`),
not vendored into Web Factory; nothing here can validate membership.
Worse, the two docs use different forms: the plan says "labels"
(`Call To Action`), the catalog §1 uses slugs (`call-to-action`,
`logo-sections` — CATALOG:32-39). And `faq` (CATALOG:36, mapping
`objection`) has no corresponding label in the 52 — there is no "FAQ"
entry, so `category: faq` fails `isComponentCategorySlug` if ever
checked (the DOX contract's own §6.6 sample lists `faq` but defers to
"the generated list," which lacks it — a latent bug the catalog
inherited). Coverage is also thin: of the 52 canonical categories only
~19 appear in catalog §1's mapping column; `pricing`, `newsletter`,
`blog-*`, `product-*`, `shop-*`, `cart`, `checkout`, `login`,
`event-*`, `portfolio-*`, `career`, `coming-soon`, `megamenu`,
`off-canvas`, `table-of-content`, `thank-you`, `ui-elements` etc. map
to no speech_act — and catalog §1's own rule makes an unmapped section
a defect, so a pricing section on a money page is literally
unplannable.

**Fix:** vendor the slug list (or a pinned copy + source commit) into
`docs/machinery/`; state that SPEC `category` carries the *slug* form;
add speech_act mappings for `pricing` and `newsletter` (both common on
the factory's actual page types); resolve `faq` (add the mapping as
`faq`-the-composition under `objection` with a different category like
`content`, or get `faq` added upstream).

### F12 — P2: speech_act enum drift between plan and catalog

DESIGN-PLAN §3 uses key `act:` with 6 values (:40-45); the catalog's
column is `speech_act` with 8 values (:32-39). Three names circulate
for one concept — `act` (rhetoric field), `speech_act` (section row +
catalog), "speech-act" (prose). Hard rule 4's membership check
(:114-115) doesn't say which list it checks against, so `detail` and
`chrome` sections fail it (see F5).

**Fix:** unify on `speech_act` everywhere; extend the §3 template per
F5.

### F13 — P2: the "hard rules" have no enforcement point — review is self-certified

Rules 2-4 and 6 (adjacency, surface budgets, act membership, SPEC
verbatim) appear only in DESIGN-PLAN.md:109-119. The stage acceptance
(spec:698-703) and skill acceptance (SKILL.md:93-97) check: files
non-empty, plan "complete top-to-bottom" (a judgment the same lane
makes about its own output), and `composition` resolves to the catalog.
Nothing checks adjacency, `inverse ≤2`+footer, `brand ≤1`, spacious
allotment, speech_act membership, idea length, or SPEC↔plan verbatim
copy. Rule 2 names `DESIGN-DNA.md`'s review artifact as enforcement —
but DESIGN-DNA.md is written by the same distill lane being checked
(spec step 7, :582-586). A lane can violate every rhythm rule and
still pass done-criteria; the machinery's core claim — "the plan is
the unit of review" (:116-117) — has no reviewer.

**Fix:** convert the checkable rules into acceptance items. Cheapest
honest version: a `tools/` lint (or a coordinator checklist block in
the spec) that verifies per SPEC: composition ∈ catalog, adjacent
composition-uniqueness, `inverse`/`brand`/`spacious` budgets,
speech_act membership, idea word count, and SPEC-rows == plan-rows
diff. "Complete top-to-bottom" stays judgment but everything else
becomes mechanical.

### F14 — P2: retroactivity for existing packets is unspecified

`sites/whistleclean/site/design-dna/` (8 SPECs) and
`sites/lavisha/site/design-dna/` (1 SPEC) predate the change: no
DESIGN-PLAN.md, old-format SPEC rows (freehand `Layout:` lines,
surface names like `.section--deep` not the new enums), and
`preview/home.html` rather than `preview/system.html`. The spec's
re-run rule ("a re-minted distill lane skips a verified `design-dna/`
unchanged (route checksum equality)") doesn't define what "verified"
means for the new artifact, and nothing says whether existing sites
must backfill. Two failure modes: coordinator re-checks an old packet
against new acceptance → fails; or old packets are silently exempt →
the catalog's closed set applies only to future sites with no stated
boundary.

**Fix:** add a migration clause — e.g., "re-minted distill lanes on
pre-change sites MUST backfill DESIGN-PLAN.md and convert SPEC section
rows; packets not re-minted are grandfathered until their next design
touch" — and name the cutoff.

### F15 — P2: SECTION-CATALOG internal contradictions + orphaned references

Three leftovers from the b4edacf correction:

- §1:41-44 still calls `promise → proof → tension → how → objection →
  act` "the canonical sequence… the order is the argument's skeleton,
  not a suggestion" while §3:80-84 (rewritten) calls sequences "a
  reference skeleton, not a required order" with different invariants
  (promise first, act first-and-last, one contrast moment). Two
  contradictory rule statements in one file.
- §3:79 still says "`page_class` … picks the sequence" but the
  per-class sequences were deleted; page_class now only feeds the
  template-kind mapping (spec:167-172). The mechanism reference is
  orphaned.
- spec:542-543 still points "the fallback visual system" at "(step 5)"
  — after renumbering, refs derivation (which owns fallback) is step 6;
  step 5 is DESIGN-PLAN.

**Fix:** reconcile §1's sequence paragraph with §3's invariants (keep
one statement — recommend §3's verified version and demote §1's to a
pointer); delete or repoint the `page_class` sentence; change "(step
5)" to "(step 6)".

### F16 — P2: intent/design decisions now live in three artifacts with no authority order

DESIGN-PLAN §1 (`who`/`one_action`/`worst_case`, :27-30) duplicates the
ux-intent-discovery Intent Brief fields verbatim — whistleclean already
ships `site/design-dna/INTENT-BRIEF.md` with the identical structure.
§4-5 (`direction`/`system`) overlap `CHARACTER.md` (visual-character
axes) and `DESIGN.md` (design-system contract), both required skill
outputs. When they disagree — and they will, being written at different
steps by possibly different passes — nothing says which wins. This is
the same class of defect the DOX packet's precedence order exists to
prevent.

**Fix:** declare DESIGN-PLAN the authority for intent+direction+system
and mark INTENT-BRIEF/CHARACTER/DESIGN.md as *inputs* the plan
consolidates (or generated views of it). One line in SKILL.md's write
set + one in DESIGN-PLAN.md's header suffices.

### F17 — P2: composition coverage gaps for real page types

The catalog covers brochure marketing sections well but has no answer
for several shapes the factory actually produces or will:

- **Location/map pages** — `AUDIT-LOCATION.md` exists; near-me pages
  were collapsed to `/service-areas` (covered by `link-grid`, :70) but
  map+radius+coverage-finder patterns have no composition.
- **Newsletter/email capture** — `form-panel` is "the only place a form
  lives" allowed for `act`(contact) (:67); a newsletter section has no
  valid `(speech_act, composition)` pair → unplannable → deleted by
  rule 4.
- **Hero-less pages** — 404 (whistleclean ships a 404 SPEC), thin
  utility pages: rules assume a hero ("first interior section after
  the hero", :101-103; promise-first invariant). No sequence exists for
  them and no page_class covers 404 (it's not in the sitemap by design,
  spec:~340).
- **`link-grid` ambiguity** — :70 doesn't distinguish the text-index
  pattern (audit #3's approved service-areas treatment) from the card
  grid the same audit banned on home; a weak model can ship the banned
  variant "legally."
- **Multi-CTA utility pages** — contact pages mixing form + phone +
  map + hours fit `form-panel`+`act` but the secondary-CTA
  composition is unspecified (MobileCTA contract is build-side, not
  plan-side — acceptable, but worth a note).

**Fix:** add rows for `map-finder` (detail), `capture-form`
(newsletter → objection or act variant), a hero-less sequence note,
and scope `link-grid` to "text-index links, never cards."

### F18 — P3: minor terminology drift

- CATALOG:50's refuse-example says a proof section built as
  "`split-hero`" is a defect — `split-hero` is not a composition value
  (`split-media` is, :54); the example teaches a non-existent enum.
- Measure is cited three ways: `62ch` example (DESIGN-PLAN.md:69),
  editorial `≤65ch` (CATALOG:57), shell contract `≤75ch` — each scoped
  differently but the plan's `system.grid.measure` doesn't say which
  bound applies to it.
- `accent_budget: "≤10% of pixels"` (:76) has no measurement method —
  fine as prose, wrong inside a section header claiming "closed set."
- `design_mode` comment (:23) lists `refs-*` which doesn't match the
  intake's actual `inspo-text`+`variants` combo mode
  (DESIGN-INTAKE.md scenario table).
- DESIGN-INTAKE.md:112-113 — missing blank line before `## Design
  roles` (markdown nit).

**Fix:** `split-hero`→`split-media`; state the measure binding;
reword or measure the accent budget; enumerate real `design_mode`
values; add the blank line.

---

## What holds up

For balance: the closed-set direction is right; `b4edacf`'s
verification loop (CATALOG-VERIFICATION.md) is exactly the discipline
the machinery needs and already caught one bad rule; the write-set /
acceptance wiring into SKILL.md is correct in form (just incomplete —
F6, F13); the DOX/refs "one convergence" principle is preserved; and
nothing in the patch touches the S6 form contract, MobileCTA, fold-quad,
or MANIFEST roles — those cross-checks came back clean. The failures
are all *specification* failures: contradictions between the new files,
undefined cardinality, dropped closed sets, and rules with no enforcer.
