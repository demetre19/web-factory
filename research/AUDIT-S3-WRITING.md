# AUDIT-S3-WRITING — adversarial gap analysis + expansion spec

Lane: `AuditWriting` · 2026-11-02. Module: **S3 Writing** — the stage that
turns `content-plan.md` rows into `site/content/<slug>.md`. Read against the
operator's eight expansion themes; findings numbered F<n>, severity
blocker/major/minor, every claim line-cited. `[INFERENCE]` marks unverifiables.

---

## 1. Scope audited

| File | What it is to S3 |
|---|---|
| `research/WEB-FACTORY-S3-WRITING.md` | The stage spec (253 lines) |
| `skills/s3-writing/SKILL.md` | Lane skill — condensed contract (82 lines) |
| `research/WEB-FACTORY-LOCATION-PAGES.md` §Phase D (steps 9–10), §2 (M1–M10), §5, §7 | Location-leaf writer requirements — the only page-class with a module contract |
| `research/WEB-FACTORY-S2-TONE-PLAN.md` §Output 2 + `research/content-plan.md` | Producer: row schema, `heading_skeleton`, `word_target` defaults |
| `research/WEB-FACTORY-S4-INTERLINK.md` | Consumer: injection + cleanup; owns corpus-level dedupe |
| `research/WEB-FACTORY-S5-DESIGN-DNA.md` :266-270, :271-273 | Consumer: binds `content-final/` to routes, copies frontmatter verbatim, `public/assets/` asset source |
| `research/WEB-FACTORY-S7-GATE-DEPLOY.md` :207-221 | The 13-check gate — what S3 output is finally verified against |
| `research/WEB-FACTORY-S1-SITEMAP.md` (prd-herdr checkout) :312-316, Step 5 | S3's *declared* inputs upstream: "cluster data", entities |
| `SW/src/cli.py:764-1015` (Semantic Writer) + `SW/output/headings/*.md` | The keyword→section distribution machinery S1 delegates to S3 |
| `research/ADVERSARIAL-REVIEW.md`, `PRD-Web-Factory-2026-10-30.md`, `docs/machinery/WEB-FACTORY.md` | Corpus conventions, resolved findings |

**Module boundary:** S3 owns `site/content/<slug>.md` only — one writer lane
per `## Writer batches` entry, ≤6 rows, one commit per page
(`WEB-FACTORY-S3-WRITING.md:207-219`). It never post-processes after stamp
(`:38`); S4 owns the graph and cleanup; S5 owns layout; S7 owns the artifact
gate.

## 2. Current contract

| Direction | Artifact / rule | Source |
|---|---|---|
| In | `content-plan.md` rows: `slug, path, type, primary_keyword, secondary_keywords, intent, word_target, heading_skeleton, link_seed, cta` | S3 `:30-33`; plan template `research/content-plan.md:9-12` |
| In | `tone-profile.md` (frontmatter bounds, lexical table, `## Banned`, CTA palette, trust vocabulary, before/after) | S3 `:150-155` |
| In | `site-brief.md` — entity facts, verbatim, never fabricated | S3 `:47,157-160` |
| In | `sitemap.md` — row-count precondition only | S3 `:46,59` |
| Out | `site/content/<slug>.md` — frontmatter `title ≤60, description 140–160, slug, path, type, primary_keyword` + body | S3 `:70-83` |
| Rules | H1 once w/ primary kw; skeleton H2s in order, wording editable; no skipped levels; intent-shaped H2 patterns; money/article posture table; `word_target` ±15%; link seeds as `[anchor](<row.path>)`; self-lint then per-page commit | S3 `:88-146,176-184` |
| Gate | Every plan row has non-empty file; no banned tokens/`TBD`; frontmatter matches row; every `link_seed` linked | S3 `:195-199` |

What the contract does **not** carry: any SERP-derived evidence, any entity
list, any per-section keyword map, any structured-data block, any visual/asset
declaration, any fact source beyond `site-brief.md`. The writer's only inputs
are *declarations* (what to write) — no *evidence* (what wins, what is true).

## 3. Discovery-question expansion

The question bank a PRD for this stage must answer, grouped by the operator's
themes. **Status column: ✓ = spec answers today, ✗ = named gap (F#).**

### Source & authenticity
| Question | Status |
|---|---|
| Where do entity facts come from? | ✓ `site-brief.md`, verbatim-bound (S3 `:157-160`) |
| Where do *suburb-level* facts come from (distance, depot fee, landmarks, venues)? | ✗ — nothing supplies them (F1) |
| Who verifies a "fact" the writer didn't find in the brief? | ✗ — "omitted or flagged" (S3 `:160`) with no flag artifact, no reader, no gate (F2) |
| Where do reviews come from (M6 module)? | ✗ — brief carries no review data; live review fetch is unassigned (F1/F3) |
| Are writer claims auditable after the fact? | ✗ — no per-file claim/source ledger (F2) |

### Classification & competition
| Question | Status |
|---|---|
| Does the writer know the row's intent? | ✓ `intent` column (closed set, S2 `:124-125`) |
| Does the writer see *why* the row exists (kw_group, sibling rows, parent)? | ✗ — plan row carries no `kw_group`, no cluster context, no sibling list; S1 promised "cluster data" to S3 (S1 `:315`) that never materializes in any schema (F4) |
| Does the writer see SERP evidence for the row (who ranks, what they cover)? | ✗ — zero SERP data downstream of S1 (F4) |
| What word count should the page carry? | ✗ — fixed defaults `money 800–1200 / article 1200–1800 / utility ≤400` (S2 `:128-129`, S3 `:117`) — a floor-shaped guess, not the SERP-matched call (F5) |
| What modules should the page carry? | ✗ — only `heading_skeleton` H2 strings; no per-class module list, no module counts from winners (F6) |
| What entities/LSI must the copy cover? | ✗ — S1 Step 5 mints entities as "cluster modifiers and FAQ fodder" (S1 `:88-89`) but no artifact carries them to a writer (F4) |

### Structure & markup
| Question | Status |
|---|---|
| Where do FAQs go — prose or structured data? | ✗ — no FAQ contract at all outside the location module (F7) |
| Where do writers declare visuals a section needs? | ✗ — nothing; S5b's asset plan has no input contract (F8) |
| What is mechanically checkable post-write? | ~ — self-lint exists (S3 `:176-182`) but is prose-only and under-scoped (F9) |
| Who owns corpus-wide dedupe (FAQ answers, boilerplate)? | ✗ — implicitly S4 class-6 (S4 `:208-214`), but the location module's FAQ-uniqueness requirement is a *minting* constraint detected too late (F10) |

## 4. Gap findings

### F1 — BLOCKER: location leaves cannot be written — no suburb-fact supply chain

Phase D Step 9 requires M2 "2-3 paragraphs of real local copy — landmarks,
routes, local context" and M3 "distance from depot, fee/zone … outbound Maps
link" (`WEB-FACTORY-LOCATION-PAGES.md:130-133,286-290`), gated by a ≥300-word
suburb-unique floor (`:140-143,292-294`) and the leaf's existence itself
predicated on "≥2 suburb-specific facts available" (`:207-208,261-263`).

**The spec never says who produces those facts.** The writer's only fact
source is `site-brief.md` (S3 `:47,157-160`); the brief carries
`service_area`, `depot_address`, `delivery_zone_km` — *not* per-suburb
distance, landmarks, or venue data (`LOCATION-PAGES:234-237` lists the
required brief fields; suburb facts are not among them). The S3 spec's own
rule — "a fact the brief does not carry is omitted or flagged — never
fabricated" (`:157-160`) — means a compliant writer **omits the M2/M3 facts
the leaf's existence requires**, producing a guaranteed doorway-pattern page
(the exact `smartbox` anti-pattern the research names: "demographic filler",
`:67,136`). Today the only honest outcomes are refuse-every-leaf or
fabricate. The missing artifact: a per-leaf `fact-card` (suburb name,
postcode, distance/drive-time from depot, delivery fee/zone, 2+ landmarks or
routes, venue address where applicable, nearby-suburb list for M5) minted
upstream — S1's Step 5 fact-test already asserts ≥2 facts *exist* but writes
them nowhere (the check produces a boolean, not a record — `:261-263`).
Fix owner: S1/location module emits `site/facts/<suburb>.md` (or a `## Fact
cards` section); S3 binds it like the brief.

### F2 — BLOCKER: the anti-fabrication contract has a flag with no receiver

"Omitted or flagged" (S3 `:159-160`) names two legal moves and defines
neither: no `## Flags` artifact in the write set (`:37-38` names only
`content/<slug>.md`), no consumer reads flags, no gate counts them, and the
skill's done-criteria mention flags only for weak link seeds
(`skills/s3-writing/SKILL.md:78-80`). A writer that hits an unbriefed fact
must choose between silently omitting (starving the page) and a flag written
to a place nobody reads. Parallel finding: S4's cleanup "flags a sentence it
cannot de-tell" into `cleanup-report.md` (S4 `:230`) — the flag *artifact*
pattern exists one stage later, but S3's flags have no schema, no destination,
no blocking semantics (PRD F8 makes flags "review-blocking" at S4; nothing
equivalent exists at S3). Fix: `site/content/<slug>.md` gets a `## Flags`
trailer block or a per-lane `flags` log in the done notes that the stage gate
aggregates; unresolved flags block S4 mint the way S4's flags block S5.

### F3 — MAJOR: reviews/trust modules have no data source at all

Every location exemplar carries a reviews module (M6, "live/verified,
metro-scoped" — `LOCATION-PAGES:135`); money pages mandate "trust vocabulary
… review cites per tone-profile" (S3 `:119`). But `site-brief.md`'s schema
(PRD §5.1, `WEB-FACTORY.md:46-50`) collects no review corpus, no GBP rating,
no testimonial list. A writer told to cite reviews with no review data will
invent them — the highest-risk fabrication class (fake social proof) — or
omit the module the evidence says winners carry. Needs a S0/discovery
question ("review source: GBP profile URL / pasted testimonials / none") and
an S5/S6 rendering decision (static cited reviews vs. live widget); S3's job
is bounded to *citing supplied reviews*, never generating them.

### F4 — MAJOR: S3 never receives the query-network evidence its copy is supposed to encode

S1's downstream bindings promise S3 "route table + cluster data … sibling
rows for context" (`WEB-FACTORY-S1-SITEMAP.md:315`) and Step 5 produces
entities explicitly "as cluster modifiers and FAQ fodder" (`:88-89`). Neither
reaches the writer: the plan row schema has no `kw_group`, no entity list, no
sibling list, no SERP-winner summary (S2 `:111`; plan template
`research/content-plan.md:9`). Semantic Writer's own machinery — per-section
keyword distribution via `cluster_keywords`/`get_semantic_score`
(`SW/src/cli.py:911,971-1015`), which S1 explicitly defers to S3 ("NOT S1 —
that is S3's per-page distribution", `S1:172`) — has no input to run on.
Result: "semantic/query-network-aware copy" is a posture claim, not a
contract. The skeleton is a flat H2 list; there is no keyword→section map,
no entity-coverage requirement, no heading *vector* (the ordered
{primary→secondary→entity} assignment per heading). Fix: extend the plan row
(or a sidecar `site/page-specs/<slug>.md`) with `kw_group`, `target_keywords`
tail, `entities[]`, `serp_winners[]` (url + word count + module count), and a
`section_keywords` map skeleton H2 → assigned terms — the mechanical seed of
the heading-vector check.

### F5 — MAJOR: `word_target` is a floor-shaped default, not a SERP-matched call

S2 defaults money 800–1200 / article 1200–1800 / utility ≤400 (`S2:128-129`);
S3 self-lints ±15% (`:179`). Nothing in either stage measures what actually
ranks. The operator's rule — "measure SERP winners' page word counts / module
counts; match the call, not a floor" — is exactly what S1's competitor
extraction already fetches (body text + headings per competitor page,
`S1:63-67`) and then discards: no `winner_word_count` / `winner_module_count`
field exists in `sitemap.md` or `content-plan.md`. Evidence in-corpus that
the defaults are wrong at both ends: criminaldefencelawyers ranks #1 on a
~3,000-word money page (`LOCATION-PAGES:75`) — over double the money ceiling;
gobox leaves win on ~350 words of unique prose *plus* structured modules
(`:143`) — under the money floor but module-dense. A fixed band fails both
directions. Fix: `word_target` derives from top-3 winner median ±15%, with
the per-page band recorded in the row; S3's lint bounds stay mechanical but
consume evidence, not defaults.

### F6 — MAJOR: no per-page-class skeleton set — only `heading_skeleton` strings

The spec encodes *discipline* (skeleton H2s in order, wording editable —
S3 `:91-99`) but no *content* of the skeleton per class. The location module
proves the missing shape: M1–M10 is a real module contract
(`LOCATION-PAGES:127-139`) — named modules, required/optional, evidence-cited
— and its S3 delta is one thin line: "Location-page skeleton (M1-M10) as a
`page_class`-conditional writer requirement" (`:324`). Every other class has
nothing equivalent: money pages get posture adjectives ("benefit / process /
proof / service-detail H2s", S3 `:105-107`), articles get "question-format
H2s … answer-first" (`:103-104`), ancillary gets a word cap (`:123-125`).
There is also no **featured-snippet section shape** anywhere — the
mini-heading + ~200-word answer cluster the operator requires — only the
"answer-first paragraphs" phrase (`:104`) for informational intent.

**Proposed canonical module skeleton set** (per `page_class`; R = required,
O = optional/conditional, — = absent). Each module is a named contract like
the location M-set; `heading_skeleton` is *generated from* the module list —
one grammar, not two:

| Module | money | article | ancillary | location |
|---|---|---|---|---|
| M-hero: H1 + one-line prop + trust bullets + primary CTA | R | R (no trust block) | R | R (=M1) |
| M-answer: direct-answer lead ≤40 words (snippet target) | — | R | O | — |
| M-local-copy: 2–3 paras suburb-grounded copy | — | — | — | R (=M2) |
| M-local-facts: distance/depot/zone + Maps out-link | — | — | — | R when depot (=M3) |
| M-service-detail: service×context options/variants (H3 grid) | R | — | — | R (=M4) |
| M-cost: price framing + quote bridge | R | R on cost-intent rows | — | O |
| M-process: numbered how-it-works (H3 steps) | R | R on how-to rows | O | R |
| M-proof: reviews/guarantee/credentials cite | R | O | — | R (=M6) |
| M-suburbs-served: nearby-suburb block | — | — | R on `/service-areas/` index | R (=M5) |
| M-vs: comparison table vs. alternative | O | R on `comparison` intent | — | O |
| M-entity: local/niche entity context section | O | R | — | O |
| M-faq: 4–10 q/a pairs, structured `faq:` frontmatter | R | O | O | R (=M7) |
| M-cta: closing CTA paragraph (pitch ends here) | R | R (low-pressure) | R | R (=M8) |
| M-related: `## Related` nav block (S4-extensible) | O | O | O | O |
| M-nap: facility/office NAP block | O (depot-backed) | — | R on `/contact/` | O (=M10) |

Module counts size against winners the same way `word_target` does (F5):
`serp_winners[].modules` is the evidence column — a page whose winner median
is 9 modules does not ship 4. Each module maps to ≥1 skeleton H2, so the
skeleton-order lint (`:92-95`) and skipped-level lint (`:100`) keep working
on generated headings.

### F7 — MAJOR: FAQ ownership and format are unspecified; JSON-LD decision needed

Three unresolved sub-questions:

- **Format.** Every exemplar FAQ is a page module (gobox 10 H3s
  `LOCATION-PAGES:41-42`, cleanpursuit 10 `<details>` `:51-53`, gotocourt
  `:90-93`). S3's file schema has nowhere to declare FAQ pairs except prose
  headings — and prose FAQ answers are *unlintable* for the cross-leaf
  uniqueness the module demands (`:294`). Emitting `faq:` frontmatter
  (structured q/a pairs) makes FAQ machine-checkable, dedupe-able
  corpus-wide, and renderable into whichever component S5 chooses
  (`<details>` per evidence, `LOCATION-PAGES:51`) — but it conflicts with
  S4's "frontmatter copied byte-for-byte" (`S4:221-222`), which is fine
  (copy ≠ ignorance) yet must be *declared* so S5 binds the field.
  **Recommendation: yes — `faq:` structured frontmatter, prose rendering
  deferred to S5.** It converts a prose obligation into data every
  downstream stage can verify.
- **Schema value.** Google restricted FAQ rich results to government/health
  sites Aug 2023 (developers.google.com/search/blog/2023/08/howto-faq-changes)
  and deprecated FAQ rich results entirely May 2026 (serp feature gone for
  all sites). FAQPage JSON-LD therefore earns **zero rich-result value** for
  this product class; its residual worth is semantic/extractability for AI
  answer surfaces (PRD R2, `PRD:19`). Emitting `faq:` frontmatter is still
  right — but the justification is AEO + lintability, not SERP decoration,
  and FAQPage JSON-LD emission is an *optional* S5 flag, not a requirement.
- **No other structured data contract exists.** LocalBusiness/Service/
  BreadcrumbList/Article JSON-LD is owned by nobody: S3 doesn't emit it, S5's
  `<SEOHead>` mentions title/description/canonical only (`S5:266-268`), S7's
  13-check gate never checks `ld+json` (`S7:207-221`). BreadcrumbList is
  required by the location module's D4 (`LOCATION-PAGES:184,308`) — an
  example of a spec'd requirement with no producing stage. Site-wide schema
  is a per-class concern that belongs beside this audit's F6 skeleton set.

### F8 — MAJOR: writers cannot feed S5b's asset plan — no visual-callout contract

The build lane copies DOX `EVIDENCE/` images to `public/assets/`
(`S5:271-273`) and S7 requires non-empty `alt` on every `<img>`
(`S7:219`) — but no stage decides *which* images/icons a section needs.
For sites built from refs-only or niche-fresh designs, S5b must invent the
asset inventory with zero guidance from the people who wrote the sections.
The writer is the only actor who knows that M3 needs a service-area map
graphic, M4 needs per-use-case icons, the process module needs 3 step
illustrations. Operator theme 4 wants the design lane to consume an
"image/icon inventory … per page type". Fix: extend the file schema with a
`## Visual brief` block per page (or frontmatter `visuals:`) —
`{section, asset_type (hero|icon|photo|illustration|map), subject, alt_seed,
animation_hint?}` — written by the writer, consumed by S5a's asset plan,
linted for presence on modules that demand it. Alt *text* drafts ride it
(alt is copy; a11y starts at the writer's desk, not S7's grep).

### F9 — MAJOR: the "mechanical" lint set is under-scoped and unmechanized

S3's self-lint (`:176-182`) checks presence-level facts only. The checkable
surface per the operator's rules should also include, per file:

- heading vector conformance — every `section_keywords` entry for an H2
  appears in that H2's wording or its section's first 60 words;
- `secondary_keywords` coverage — each appears ≥1× (currently "may carry",
  S3 `:99` — unverifiable intent);
- entity coverage — ≥N of the row's `entities[]` present (F4's list);
- snippet-shape conformance — informational/FAQ sections carry an answer
  sentence ≤40 words immediately under the heading;
- per-section word bands — each module within its assigned share
  (Semantic Writer's §-word sanity math, `SW/src/cli.py:781-820`);
- `faq:` frontmatter parses, 4–10 items, ≥2 carry the geo/suburb token
  (location class);
- unique-prose floor — ≥300 suburb-unique words across M2+M3 (location);
- banned-token scan — exists today but is a *prose* lint; every item above
  is a `tools/*.py` line, none exists (OI-7 posture, PRD `:182`).

S3 vs S4 ownership: **anything verifiable within one file belongs to S3
self-lint + the stage gate; anything requiring cross-file comparison belongs
to S4.** S4's self-lint already re-checks word count, heading levels, banned
tokens (`S4:302-315`) — the seam is correct; the S3 side of it is what's
missing.

### F10 — MAJOR: cross-leaf FAQ/prose uniqueness is a minting constraint checked one stage too late

The location module requires "FAQ answers unique per leaf"
(`LOCATION-PAGES:135,294`) and names duplicated answers as a doorway signal
(`:219-220`). But parallel writer lanes can't see each other's uncommitted
work (visibility = mint preconditions, `WEB-FACTORY.md:84-88`) — two lanes
writing `storage-<suburbA>` and `storage-<suburbB>` FAQs in parallel will
converge on identical answers with no mechanism to notice. S4 class-6
("identical ≥8-word sentences in ≥2 files", `S4:208-212`) detects the
*symptom* after the fact — at cleanup, where fixing means re-writing whole
FAQ sets. Contract: **detection is S4-class-6's job (corpus-wide, correctly
placed); prevention is S3's.** Two cheap preventives: (a) all location leaves
of one cluster go to *one* lane (batch by `parent`, not just type — S2's
batching rule `:145-149` already batches by type; extending to "same parent
⇒ same batch" costs nothing and 25-leaf cap ÷ ≤6 rows ≈ 4 lanes, still fine);
or (b) a designated question-bank artifact — the cluster's FAQ *questions*
are minted once (S2 or the location lane) so lanes only author answers, and
the dedupe surface shrinks to answers. Either way the FAQ-answer dedupe
*check* joins S4 class-6 as a named sub-check ("identical FAQ answers across
same-`parent` leaves"), not a new stage.

### F11 — MINOR: `## Related` block convention is under-specified at write time

S3 allows the writer to drop unplaceable seeds into a closing `## Related`
block (`:140-144`); S4 caps it at ≤4 rows (`S4:141-145`, F-carry P3). The
writer can create a `## Related` block the graph lane later extends — but
nothing says the block's *rows* are lint-checked as real links (anchor +
resolvable path), nor whether writer-minted `## Related` rows count against
S4's cap. Minor drift surface; one line each side closes it.

### F12 — MINOR: no anti-keyword-stuffing bound

`primary_keyword` must appear in title/H1; `secondary_keywords` "may" appear
— but no ceiling exists on keyword repetition (density, max occurrences,
suburb-token frequency in location copy). Winners' copy reads clean because
it isn't stuffed; a writer optimizing for "primary kw in first half of title"
can stuff the body unchecked. A max-occurrence lint (e.g. primary kw ≤1× per
150 words) is mechanically trivial and belongs in the S3 lint set. [INFERENCE
— threshold needs SERP-winner measurement, same data as F5.]

### F13 — MINOR: title_tag/H1 lock is not propagated to S3's frontmatter

S1 mints `H1` and `title_tag` per row (`S1:111-112,116`); the plan row
carries neither — S3 re-derives `title` ("≤60 chars, primary keyword in
first half", `:72`) and the H1 (`:80`) fresh. Two authorities can now
disagree: the locked `title_tag` the S7 gate greps (`S1:116,318`) vs. the
frontmatter `title` the writer invented. Cheapest fix: plan row carries
`title_tag` and `H1` verbatim from the sitemap row; S3 *copies* them into
frontmatter/H1 rather than re-deriving. (Resolves the F1-adjacent drift class
the PRD's OI-3 conformance pass already opened.)

## 5. Split/sub-module proposal

S3 stays one stage with **three sub-artifacts added to its input contract**
and **one optional writer sub-lane type**:

```
content-plan.md ──┐
tone-profile.md ──┤
site-brief.md ────┼──> S3 writer lanes ──> site/content/<slug>.md
facts/<suburb>.md ┤        (batch ≤6, same-parent co-batching)
page-specs/*.md ──┘             │
                                ▼
                   per-file mechanical lint (tools/content_lint.py)
                                │
                                ▼
                        S3 stage gate (row coverage + flags resolved)
```

1. **`site/facts/` — upstream fact cards** (owner: S1/location module, not
   S3). Per location leaf: verified suburb facts. Hard-binding input, same
   posture as `site-brief.md`. (F1)
2. **`site/page-specs/<slug>.md` or plan-row extension — the semantic
   contract** (owner: S2). Per row: `kw_group`, `target_keywords` tail,
   `entities[]`, `serp_winners[{url, words, modules}]`, `section_keywords`
   map, `word_band` (SERP-derived). This is where query-network awareness
   physically enters the writer's context. (F4, F5)
3. **Structured output additions to the file schema:** `faq:` frontmatter
   block + `## Visual brief` section + `## Flags` trailer. All three are
   lint-able data, all three feed named downstream consumers (S5 components,
   S5a asset plan, stage gate). (F2, F7, F8)
4. **Optional `web-writer-<site>-loc` lane class** — location leaves batch
   by `parent` into dedicated lanes; the lane runs the M1–M10 module
   skeleton + fact-card binding + unique-prose floor as its specialized
   contract. Not a new stage — a lane specialization the `## Writer batches`
   section already permits. (F6, F10)

No further split is warranted: writing is already correctly parallelized;
the defects are input-schema, not orchestration.

## 6. Automation surface

Everything below is a mechanical check → `tools/` stubs. The corpus posture
is prose-lints-until-tooled (PRD OI-7, `:182`); these name what the S3 tool
must eventually run so the PRD spec can be written lint-first.

| Check | Tool | Owner stage |
|---|---|---|
| Frontmatter parses; `title` ≤60; `description` 140–160; `slug`/`path` == row | `tools/content_lint.py` | S3 lint + gate |
| Single H1; carries primary kw (≤2 filler words) | `content_lint.py` | S3 |
| Skeleton H2s present, in order; no skipped levels | `content_lint.py` | S3 (re-checked S4 `:315`, S7 check 13) |
| Heading-vector: `section_keywords` coverage per section | `content_lint.py` | S3 (new — F9) |
| `secondary_keywords` ≥1 occurrence each | `content_lint.py` | S3 (new) |
| Entity coverage ≥N of `entities[]` | `content_lint.py` | S3 (new — needs F4 input) |
| Word count vs SERP-derived band; per-section word bands | `content_lint.py` | S3 (re-checked S4 `:312-314`) |
| Snippet shape: answer sentence ≤40 words under informational/FAQ headings | `content_lint.py` | S3 (new) |
| `faq:` block parses; 4–10 items; ≥2 geo-token questions (location) | `content_lint.py` | S3 (new — F7) |
| Unique-prose floor ≥300 suburb-unique words M2+M3 (location) | `content_lint.py` | S3 (new — F1/Phase D) |
| `## Visual brief` present where required modules need assets | `content_lint.py` | S3 (new — F8) |
| Banned tokens (literal, word-bounded, case-insensitive per F8-PRD); `TBD`/`TODO`/`FIXME`/`XXX`; invisible chars (pre-S4) | `content_lint.py` | S3 (exists as prose today) |
| Every `link_seed` slug linked; linked slugs resolve to plan `path`; `## Related` ≤4 rows | `content_lint.py` | S3 lint + gate (re-checked S4 `:309-310`) |
| Keyword-density ceiling (anti-stuffing) | `content_lint.py` | S3 (new — F12) |
| **Cross-file:** identical ≥8-word sentences; identical FAQ answers across same-`parent` leaves; repeated sentence openers ≥3 files | `tools/corpus_lint.py` | **S4** class-6 extension (F10) — correctly stays corpus-side |
| Flags unresolved | gate check | S3 stage gate blocks S4 mint (F2) |

Judgment (never a tool): natural anchor placement, tone register, module
copy, FAQ answer authorship, visual-brief creative, flag adjudication.

## 7. SOP skeleton — `web-writer-<site>-b<N>` lane

Format follows `WEB-FACTORY-SITEMAP-SOP.md`: ordered steps, inputs/tools/
outputs, refuse conditions.

1. **Mint-gate verify (lane start).** Re-read `content-plan.md` from
   `site/` (never a cached copy — S3 `:226-229`); confirm batch rows,
   `plan_digest` (OI-5 when landed); read `tone-profile.md`,
   `site-brief.md`, `sitemap.md`; read `site/page-specs/<slug>.md` +
   `site/facts/<suburb>.md` for each owned row (new inputs — F1/F4).
   Missing fact-card on a `page_class: location` row → refuse
   `fact-card-missing`, same posture as `brief-intake-empty`.
2. **Claim the row set.** Rows = the batch's rows minus any with non-empty
   `site/content/<slug>.md` (re-run skip, `:166-168`).
3. **Per row — assemble the module skeleton.** Select the class module set
   (money/article/ancillary/location M1–M10); map `section_keywords` onto
   module headings (heading vector); emit `heading_skeleton` conformance:
   skeleton H2s in order, wording rewritten to carry assigned terms.
4. **Draft.** Modules in order; snippet-shape answer clusters under
   informational/FAQ headings; money posture per the posture table;
   `word_target` band from the row's SERP-derived `word_band`;
   `faq:` frontmatter authored where the module set requires; `## Visual
   brief` per module needing assets; facts verbatim from fact-card/brief —
   a needed fact absent from both → `## Flags` entry, never invented.
5. **Place link seeds.** `[anchor](<row.path>)` canon form; unplaceable →
   `## Related` block + flag.
6. **Self-lint** (the F9 checklist, via `content_lint.py` when it lands —
   prose until then).
7. **Commit per page.** `site: content <slug>`.
8. **Done.** `prd_step done` naming rows written, flags raised (unresolved
   flags block the stage gate), weak seeds for S4.

## 8. Cross-module contracts

| This stage owes | To | Contract |
|---|---|---|
| `content/<slug>.md` per row, non-empty, lint-clean | S4 | file schema `:70-83`; canon link notation; `## Related` conventions (F11) |
| `faq:` structured pairs | S5 (render) + S4 (dedupe) | new — needs S5 component contract + S4 class-6 extension (F7/F10) |
| `## Visual brief` per page | S5a asset plan | new — needs S5a to declare consumption (F8) |
| `## Flags` / done-note flags | stage gate / operator | new — blocking semantics needed (F2) |
| `title`/`description` fields | S5 `<SEOHead>`, S7 checks 2–3 | exists; F13 argues `title` should *be* `title_tag`, not re-derived |
| **This stage expects** | From | Contract |
| `word_band`, `section_keywords`, `entities[]`, `serp_winners[]` | S2 (via S1 data) | new — S1 already collects the evidence, discards it (F4/F5) |
| `site/facts/<suburb>.md` per location leaf | S1/location module | new — fact-test boolean becomes a fact-card artifact (F1) |
| `title_tag`, `H1` verbatim | S2 plan row (from sitemap) | new columns — kills double authority (F13) |
| Review corpus or "none" | S0 `site-brief.md` | new brief field (F3) |
| Same-`parent` co-batching in `## Writer batches` | S2 | batching rule extension (F10) |

**Conflicts found:**
- `heading_skeleton` (S2-owned H2 list) vs. M1–M10 module skeleton (location
  Phase D) — two skeleton grammars for the same row; needs the module set to
  *generate* the skeleton, not coexist with it (F6).
- S4 "frontmatter copied byte-for-byte" (`S4:221-222`) vs. new `faq:` /
  `visuals:` frontmatter — compatible but must be declared so S5 binds them
  (F7/F8).
- S1 promises S3 "cluster data" (`S1:315`); S2's row schema drops it — a
  producer/consumer contract break already in the corpus (F4).
- Location spec assigns thin-leaf checks to S7 (`LOCATION-PAGES:315-316,327`)
  while F1/F9 put the same checks at S3 lint — duplicated intent, should be
  stated once (S3 lints, S7 re-verifies, same defense-in-depth pattern as
  row-count parity).

## 9. Verdict

**Not PRD-ready.** S3 as specced can produce disciplined markdown — correct
frontmatter, ordered skeletons, placed seeds — but it cannot produce the copy
the operator's rules demand, because its input schema carries *instructions
without evidence*. Three blockers:

- **F1** — location leaves are unwritable: the fact-test that mints them
  produces no facts; anti-fabrication then guarantees thin pages.
- **F2** — the anti-fabrication flag has no artifact, reader, or gate.
- **F4/F5** — no query-network or SERP-winner data reaches the writer:
  semantic copy and SERP-matched sizing are postures, not contracts.

Before this module's PRD can be written the following must exist as
decisions (not code): the `facts/` artifact and its producer; the plan-row
or `page-specs` extension carrying `kw_group`/`entities`/`serp_winners`/
`section_keywords`/`word_band`; the four-class module skeleton set
(money/article/ancillary/location) that *generates* `heading_skeleton`;
the `faq:`-frontmatter + `## Visual brief` + `## Flags` schema additions;
the S3-vs-S4 lint split table (§6); and the co-batching rule for
same-`parent` leaves. Every item is a schema/contract decision in existing
files — no new machinery class is needed.
