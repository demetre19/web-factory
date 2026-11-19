# AUDIT-S4-INTERLINK — adversarial audit of the Interlink+Cleanup stage

Audit of `research/WEB-FACTORY-S4-INTERLINK.md` (the spec),
`skills/s4-interlink/SKILL.md`, `research/link-graph.md` (template),
and the location module's edge contract
(`research/WEB-FACTORY-LOCATION-PAGES.md` §4, §6 Phase E, §7).
Cross-read: `PRD-Web-Factory-2026-10-30.md` §5.4–5.5 + finding table,
`research/WEB-FACTORY-S3-WRITING.md` (producer), `WEB-FACTORY-S7-GATE-DEPLOY.md`
(gate consumer), `docs/machinery/WEB-FACTORY.md` (runbook row + open
items). Live evidence fetched 2026-11-02 (cited inline). Findings
ordered by blast radius; `[INFERENCE]` where unverifiable.

## 1. Scope audited

| File | Role |
|---|---|
| `research/WEB-FACTORY-S4-INTERLINK.md` | Stage spec — the audited contract (412 lines) |
| `skills/s4-interlink/SKILL.md` | Lane-facing condensation — confirmed faithful to spec, incl. `placement ∈ {body, related}` (:41) and "flags block S5 mint" (:69) |
| `research/link-graph.md` | Edge-table template — parse contract the apply lane consumes |
| `research/WEB-FACTORY-LOCATION-PAGES.md` §4 :167-189, §6 :296-303, §7 :320-327 | Cluster edge conventions + the marked `[INFERENCE — S4 spec amendment needed]` |
| `PRD-Web-Factory-2026-10-30.md` :129-137, :151-153, :170-182 | `parent` as "the interlink skeleton", closed sets, F8/F9/F10 decisions |
| `research/WEB-FACTORY-S7-GATE-DEPLOY.md` :200-221 | Which S4 guarantees are (not) re-verified downstream |

Module boundary: everything from "corpus exists" to
"`content-final/` exists" — graph computation, edge injection,
de-slop cleanup, the two review artifacts. Out of scope: what S3
writes (producer), what S5 renders (consumer) — except where the
boundary itself is the defect (F1, F2, F9).

## 2. Current contract

| Input | From | Used for |
|---|---|---|
| `site/content-plan.md` | S2 | node list, `link_seed` obligations, `type`/`path` (spec :66-68) |
| `site/content/<slug>.md` | S3 | corpus; existing-link detection for `present` (:151-154) |
| `site/tone-profile.md` `## Banned` | S2 | cleanup class 4 seed list (:197-201) |
| `site/site-brief.md` | S0 | entity facts cleanup must preserve (:71, :228-230) |
| `site/sitemap.md` | S1 | **row-count parity only** (:72) — topology columns never read |

| Output | Consumer |
|---|---|
| `site/link-graph.md` — `source_slug \| target_slug \| anchor \| kind \| placement`; `kind ∈ {seed,added}`; `placement ∈ {body,related}` (:94-110) | apply lane executes; operator reviews |
| `site/content/*.md` mutated (injection) | intermediate only |
| `site/content-final/<slug>.md` + `site/cleanup-report.md` | S5 binds verbatim; report is the review surface |

Enforcement today: 7 graph rules (obligation parity, no-orphan, ≤3
body cap, dedup, balance-*report*, targets-exist, ≤4 related cap,
:116-145) + 7 cleanup removal classes (:186-217) + a never-touch
list (:219-235). All checks are lane-executed prose lints — the
factory's stated posture (ADVERSARIAL-REVIEW P3; OI-7,
`docs/machinery/WEB-FACTORY.md` :150).

## 3. Discovery-question expansion — what S4 must be able to answer

Grouped by operator theme; ◐ = partially answerable today, ✗ = named gap.

**Source & authenticity of edges**
- Where does each edge come from? Seed (plan) vs added (lane) — the
  `kind` audit trail covers this. ✓
- What authority says two pages are topically related? ◐ — rule 2's
  "topically related page" (:123-124) has no defined metric. The
  computable signals exist upstream (`primary_keyword`,
  `secondary_keywords`, sitemap `kw_group`, `parent`) but the spec
  names none. **Gap → F7.**
- Can the stage fabricate a target? No — rule 6 refuses (:138-140). ✓

**Intent classification feeding edge direction**
- Does the plan's `intent` column (`commercial|informational|…`,
  `research/content-plan.md` :9) steer edges? ✗ — no graph rule
  reads `intent`; directionality is `type`-only (article→money,
  :133-135). A `navigational` (contact) or `local` row gets no
  differentiated treatment. **Gap → F1/F5.**
- Product-vs-service, local-vs-national? ✗ — `local` semantics
  arrive only via the location module's *proposed* amendments; the
  spec's closed `type` set has no `location` node class (F1/F2).

**Competition census / SERP-derived sizing**
- How many edges do SERP winners carry per page class? ✗ — the ≤3
  body / ≤4 related caps cite "S2's 1–3 seed budget is the scale"
  (:127-128) — an internal budget, never SERP-measured. The location
  research already disproves it for cluster pages: gobox leaf links
  ~51 siblings, taxibox ~11, cleanpursuit 23
  (`WEB-FACTORY-LOCATION-PAGES.md` :108-114). Ahrefs' practitioner
  floor is 3–5 contextual links per *standard* post, with dense
  pillars justified higher (digitalapplied.com guide, fetched
  2026-11-02). **Gap → F3.**
- Per-cluster fan-out evidence? The query-network work lives in S1's
  SERP tier; nothing flows into `research-inputs` for S4 — no
  link-density histogram reaches the graph lane. **Gap → F3.**

**Topology questions the graph should prove**
- Does every leaf reach its pillar? Is every pillar↔cluster link
  bi-directional? Is any money page ≤3 clicks from home? ✗ all —
  uncomputable without the sitemap `parent` column the spec never
  reads. **Gap → F1/F5.**

## 4. Gap findings

### F1 — blocker: the graph never reads `parent`; hub/spoke topology is uncomputable

The PRD declares sitemap `parent` as "the interlink skeleton"
(`PRD-Web-Factory-2026-10-30.md` :130) and the location module
mints `parent /service-areas/` per leaf (:271). S4 consumes the
sitemap for **row-count parity only** (spec :72; step 1 :264-265).
Consequences:

- No rule can verify leaf→parent or parent→leaf — the graph's only
  topology signal is the closed `type` set (rule 5's article→money
  posture, :133-137), a coarse proxy that cannot express
  cluster↔pillar direction.
- "Juice-flow verification — all leaves → pillar proven" (operator
  requirement) is impossible by construction today: proven requires
  a declared parent per node.
- `content-plan.md` drops `parent` too (template :9 — ten columns,
  no parent), so even a diligent lane has no machine-readable
  topology to enforce.

Fix direction: sitemap `parent`/`page_class` become graph-lane
inputs; topology conformance becomes a *rule* (see F5), not a note.

### F2 — blocker: `grid`/`cluster` placements don't exist; the location contract can't be expressed

Location §6 Step 11 (:298-303) requires `added` leaf→≤8 siblings in
the M5 block and index→leaf as "`grid` placement or an explicit
≤3-body-cap exemption `[INFERENCE — S4 spec amendment needed]`".
The amendment is needed because the enum is `placement ∈ {body,
related}` everywhere — spec :107-110, skill :41, template :23-25,
PRD :153. Three distinct impossibilities:

1. **Index→leaf has no injection target.** The index's leaf list is
   a grid *component* S5 renders (location :308-309 "index grid =
   crawlable links"), not a sentence in `content/service-areas.md`
   to wrap. `body`/`related` mechanics can't produce it.
2. **`cluster` siblings can't be aimed.** `body` placement wraps
   "the first natural occurrence" anywhere in the file (:157-160) —
   a suburb name in M2 prose wins over the M5 list the edge was
   meant for. Placement has no module locator. (See F6.)
3. **The caps forbid the evidence.** 8 sibling links inside M5
   violates the ≤3 body cap outright; gobox's observed ~51 violates
   it 17× over. The caps need per-placement-kind exemptions, not
   prose carve-outs. (See F3.)

Fix direction (proposed schema, §5): `kind ∈ {seed, added,
structural}`; `placement ∈ {body, body:<module>, related, cluster,
grid}`. `grid`/`nav` edges are *structural* — recorded in the graph
as verification rows S5 renders from `parent`, injected by nobody;
`cluster` edges are injected into the named module block with their
own cap.

### F3 — major: the caps are asserted, not measured — "aim high" unmet

Rule 3 scales from "S2's 1–3 seed budget" (:127-128); rule 7 caps
`## Related` at 4 (:141-145). Neither cites evidence. Against it:

- Location §1.4: gobox leaf→~51 siblings, taxibox→~11,
  cleanpursuit→23 via nav (:108-114); mobistorage runs a
  *two-layer* model — LGA leaf links hub, names 10 suburbs as plain
  text (:114) — i.e. winners deliberately mix linked and unlinked
  enumeration, a nuance a flat cap can't express.
- digitalapplied.com (fetched 2026-11-02): Ahrefs' 3–5 contextual
  links is the floor for a *standard* post; dense pillar pages
  "carrying many more contextual links" are the justified exception;
  Semrush flags *100+* outbound as the dilution threshold. The
  factory's ≤3 is below the practitioner floor for content pages.

The right contract: per-placement budgets (body ≤3 *non-cluster*,
cluster ≤8 per D3 :179-182, related ≤4, grid unbounded-but-curated)
*plus* a research input — the S1 SERP tier already samples winner
pages; it should record a per-page-class inlink/outlink histogram
in `research-inputs` so future cap claims cite measurements, not
budgets. [INFERENCE] on whether S1 can emit this today — the tier
fetches competitor pages already (sitemap SOP Step 5).

### F4 — major: zero anchor-text semantics — no diversity, no generic ban, no chaining rule

Graph rules constrain edge *existence and count*; nothing constrains
anchor *quality*. Google's own doc (fetched 2026-11-02) names the
rules the spec is missing:

- Descriptive, concise, relevant anchors; "click here"/"read more"/
  bare "website" are the named-bad generics — the spec has no
  generic-anchor ban, and `added` anchors are only required to come
  "from the target's `primary_keyword` family" (:405-407).
- "Resist the urge to cram every keyword" — keyword-stuffed anchors
  are a spam-policy violation. The spec has no keyword-density rule
  for anchors *or* body (F8).
- "Don't chain up links next to each other" — an adjacency lint.
  Injection's first-occurrence wrap can mint exactly this pattern
  when two anchors co-occur; nothing checks it.
- Zyppy's 23M-link analysis (cited in the same fetch): *distinct*
  anchor variations per target correlate with ~5× traffic
  (correlation, flagged by the authors) — the spec's "verbatim
  seed anchors + primary-keyword-family added anchors" can mint a
  sitewide exact-match echo to a money target, the stuffing pattern
  in slow motion.

Missing checks (all computable): generic-anchor banlist; per-target
anchor diversity (≥2 distinct where inbound ≥3 — [INFERENCE] on the
bound); exact-match ratio cap; adjacent-link lint; anchor length
bound. Upstream fix also needed — S2 mints seed anchors with no
semantic rule either; S4 is the enforcement surface regardless.

### F5 — major: flow is report-only; no path-based invariants exist

Rule 2 fixes *zero-inbound* nodes (:122-126); rule 5 reports
*skew* — "a report, not a refusal" (:135-137). What the operator
asked for is proof, not posture: every leaf → pillar, every cluster
bi-directional, priority pages shallow. The computable invariants:

- **I1 — no orphans** (exists, keep): every node ≥1 inbound.
- **I2 — topology conformance**: every node's edge set satisfies its
  sitemap `parent` — leaf has ≥1 edge to parent; parent (as index)
  reaches every child via `grid`/body. Needs F1's input + F2's
  placements.
- **I3 — depth ≤3**: homepage→any money/location node within 3
  directed hops (the industry's "three-click rule" — digitalapplied
  fetched; Semrush grades >3 a warning).
- **I4 — no money sink**: every money/leaf node has ≥1 outbound path
  to a money or utility page (rule 5's intent, made directional).
- **I5 — Related is not the only route**: no node whose *sole*
  inbound edge is `related`/`grid` placement when a `body`/`cluster`
  edge is possible — overflow valve ≠ life support. [INFERENCE] on
  strictness; may deserve warning-not-fail.

These belong in S4's self-lint *and* S7's gate: S7 check 9 verifies
broken hrefs (:217) but nothing verifies the graph survived to the
built site — no orphan check, no depth check, no topology check.
Proposed S7 additions: check 14 orphan-free crawl, 15
topology-conformance vs sitemap `parent`, 16 depth ≤3, 17 anchor
hygiene. All are `dist/`-crawl mechanicals — same shape as the
existing 13.

### F6 — major: `body` placement has no locator — first-occurrence can't aim

Injection wraps "the first natural occurrence" of the anchor text
(:157-163). That is a whole-file search; it cannot express "inside
M5", "in the FAQ", "above the CTA" — and it *will* misfire on any
anchor string that legitimately occurs earlier (suburb names recur
in M2; service names recur everywhere). For `cluster` edges the
module is the semantics, not a nicety. Proposed grammar:
`placement` cell carries `body` (current behavior), or a scoped
form `body:<module-id>` / `cluster:<module-id>` where the module id
is the heading text S3's skeleton already declares (location M-ids,
:127-138). Injection wraps first occurrence *within the scoped
section*; unscoped falls back to whole-file with a `## Notes`
entry. Keeps the column count; the grammar is one regex.

### F7 — major: the graph lane is ~80% mechanical and the spec has no tool boundary

Walk the rules: seed→edge parity, target resolution, dedup, cap
arithmetic, orphan *detection*, depth/flow computation — all
deterministic over plan+sitemap+corpus. The lane-judgment residue
is small: choosing *which* related source fixes an orphan, writing
`added` anchors under F4's rules, adjudicating demotion waves.
Same for apply: strip→present→wrap→related is string mechanics;
classes 1–4 cleanup are mechanical (chars, whitespace, residue
phrases, banned tokens); only classes 5–7 (structural tells, rhythm,
hedging rewrites) are judgment.

Named tools (new `tools/` — the pattern OI-7 already established for
`tools/sitemap_lint.py`, runbook :150):

| Tool | Does | Replaces |
|---|---|---|
| `tools/link_graph.py` | plan+sitemap+corpus → edge table: seed parity, structural edges from `parent`, orphan detection + ranked candidate sources (shared kw tokens), cap overflow routing, flow invariants I1–I4, anchor lints → `link-graph.md` + `## Flags` | graph-lane steps 1–5 (:262-278) |
| `tools/link_apply.py` | strip classes 1–2 → `present` → wrap `body`/`cluster` → extend `related`; emits demotion list | apply steps 2–4 (:288-296) |
| `tools/content_cleanup.py` | classes 1–4 + mechanical whitespace; emits per-file char counts | class 1–4 portion of step 5 |
| `tools/flow_check.py` | crawls `dist/` or graph file → orphan/depth/topology/anchor rows | S4 self-lint; reused by S7 checks 14–17 |

Lane keeps: tool-proposed orphan-source selection, `added`-anchor
drafting, class 5–7 rewrites, flag adjudication. The "interlinking
as its own pass" ask survives — the pass's *graph* becomes a
deterministic projection (re-runnable, diffable) with lane judgment
on top, exactly the design-dna/lane split S5 uses.

### F8 — major: the 7 cleanup classes are de-slop only; semantic-writing checks absent

Classes 1–7 (:186-217) cover watermarks→hedging — a solid de-slop
list, but the operator's "SEO baked into everything" asks for checks
the classes never run:

- **Keyword-stuffing lint (new class 8).** No primary-keyword
  density bound exists anywhere — S3 bounds *titles* (:90-91) but
  not body frequency. Google names keyword stuffing a spam-policy
  violation (fetched). Mechanical: `primary_keyword` + variant count
  per 100 words → flag over threshold. [INFERENCE] on the bound —
  propose corpus report first, threshold after data.
- **Anchor hygiene (new class 9).** Generic anchors, exact-match
  echo to one target corpus-wide (class 6 catches identical
  *sentences* ≥8 words :207-214 — identical *anchors* to the same
  target is a different tell), adjacent links. Corpus-level, same
  reason rhythm is.
- **Heading-vector lint (new class 10, flag-only).** Self-lint
  re-checks skeleton *presence* and level-skip (:315) but not
  *coverage* — whether H2s carry the row's secondary keywords /
  intent shape S3's discipline intended (:96-101). Flag-only: a
  rewrite belongs to S3, a finding belongs to the report.
- **Featured-snippet shape** — out of S4's scope (it's a writing
  decision, S3/S2); named so nobody lands it here by default.

Also missing from the never-touch list's counterpart: nothing
*adds* semantic value — no check that `primary_keyword` appears in
the opening paragraph, no entity-mention verification. Both are
lint-report candidates, not rewrites.

### F9 — minor: `## Related` is an H2 the never-touch clause forbids adding; tail-shape stacking

Cleanup's never-touch: "No H2 added, dropped, or reordered"
(:231-232) — while injection *appends* a `## Related` H2
(:164-169). The clause needs an explicit exemption ("`## Related`
is the one H2 the apply lane may append"). Tail-shape: F5
precedence resolved CTA→Related (:168, S3 :118), but a location
leaf's tail is now M8 CTA → M9 up-link → `## Related` — three
terminal blocks; fine, but the precedence sentence should name M9
explicitly or leaves will argue order. And note: `## Related` is a
weak heading vector — acceptable for a nav block, worth one line in
the spec so nobody "fixes" it later.

### F10 — minor: the weak-seed flag channel is prose, not data

"S3's done notes flag rows where a seed had no natural placement"
(:37-38; S3 :140-144) — done notes are lane-closing prose;
`tools/link_graph.py` (or the graph lane) cannot reliably consume
them. Propose S3 emits `site/writer-report.md` rows
(`slug | seed | placed|demoted`) — one small table, machine-parseable,
and `demoted` seeds are the ones the spec already forces to
`related` placement (:110-111). Handoff becomes a contract.

### F11 — minor: F10 plan-digest decided but not wired into S4

PRD :179 decided `plan_digest` stamping (S2 emits, S3 records, S4
compares — OI-5 open, runbook :132 names the refusal). The spec's
stale-plan mitigation is still "re-read at lane start" (:361-364)
with no digest compare in the mint preconditions (:76-85). One
precondition line closes it when OI-5 lands.

### F12 — minor: `intent` column unused; no versioned graph schema

Plan rows carry `intent` (template :9); no graph rule reads it —
transactional vs informational directionality is `type`-proxied
(F1). And `link-graph.md`'s parse contract forbids column changes
(template :6-8) with no schema version — fine while the enum only
grows (F2's placements slot in), but a `grid`/`cluster` migration
should bump a declared version (`link-graph/v2`) so `link_apply`
refuses stale graphs instead of silently misreading `kind`.

### F13 — minor: `## Related` is a magic string shared across two specs

S3 writes "a closing `## Related` block (the same block name S4
appends to)" (S3 :141-142); S4 appends "a closing `## Related`
block" (:165). The contract is one literal English string in two
prose documents — a renamed heading (`## More from us`) silently
forks the pipeline (S4 mints a second block; the ≤4 cap now counts
per-block). Declare the block name a schema constant once (graph
template or PRD §5.5) and cite it from both.

## 5. Split/sub-module proposal

The two-lane shape survives; what changes is *where the seams sit*:

```
content-plan.md + sitemap.md (parent, page_class) + content/*.md
        │
        ▼  tools/link_graph.py  (mechanical: seeds, structural, caps, flow, anchor lints)
  site/link-graph.md  ──►  graph lane judges: orphan sources, added anchors, flags
        │
        ▼  tools/link_apply.py  (strip → present → wrap body/cluster → extend related)
  site/content/*.md injected
        │
        ▼  tools/content_cleanup.py (classes 1–4) + lane (classes 5–10 judgment/lints)
  site/content-final/*.md + site/cleanup-report.md
```

- **S4a graph** becomes tool-run → lane-adjudicate (two commits:
  tool graph, then lane's `## Notes`/anchor decisions — or one lane
  running the tool then editing; keep the current one-commit graph
  if the file stays single-writer).
- **S4b apply** becomes tool-inject → lane-cleanup, same ordering
  guarantees (strip→inject is now *code*, not discipline).
- **Edge schema v2** (the F2/F6 formalization):

| Field | v2 |
|---|---|
| `kind` | `seed` (plan-obligated) · `added` (lane-computed: orphan, balance) · `structural` (derived from sitemap `parent`: grid, cluster, nav) |
| `placement` | `body` · `body:<module>` · `cluster:<module>` (≤8, D3 cap, exempt from body cap) · `related` (≤4) · `grid` (index→leaves, S5-rendered, exempt) · `nav` (index only, S5-rendered) |
| caps | per-placement: body ≤3 outbound/page (non-cluster pages), cluster ≤8, related ≤4, grid unbounded-curated, nav ≤1 target |
| `## Notes` / `## Flags` | unchanged; gains flow-invariant violations + anchor-lint rows |

`grid`/`nav` rows are **verification edges**: nobody injects them —
S5 renders them from `parent` (location :308-309 assigns the index
grid to S5 already), S7 crawl-checks they materialized (F5's check
15). This is the clean split of authority: S4 owns the *assertion*,
S5 owns the *rendering*, S7 owns the *proof* — and it removes any
double-render risk between an injected block and a component grid.

## 6. Automation surface

| Automatable (tool) | Judgment (lane) |
|---|---|
| plan/sitemap/corpus parse + frontmatter validation | — |
| seed→edge parity; `present` detection post-strip | — |
| structural edge derivation from `parent`/`page_class` | — |
| orphan detection + ranked source candidates | **picking** the source among candidates |
| cap arithmetic + overflow routing to `related` | — |
| flow invariants I1–I4 (paths, depth) | adjudicating violations that aren't bugs |
| anchor lints: generic ban, diversity, exact-match, adjacency | **writing** `added` anchors that pass them |
| injection: wrap, related-append, demotion list | — |
| cleanup classes 1–4 (chars, whitespace, residue, banned) | classes 5–7 rewrites; class 8–10 lints → flags |
| frontmatter parity, word-delta, link-count invariants | entity-fact collision adjudication (F8 flags) |

Everything in the left column is deterministic and belongs in
`tools/`; the factory already concedes lints are prose-until-tooled
(OI-7). S4 is the stage with the *most* to gain — its rules are the
most arithmetic in the pipeline.

## 7. SOP skeleton (eventual `web-link-graph` / `web-interlink` lanes)

**S4a `web-link-graph-<site>`:**

1. Preconditions: plan parses, row parity vs sitemap, `plan_digest`
   compare (F11/OI-5), corpus non-empty, `## Banned` non-empty.
2. Run `tools/link_graph.py`: seed edges (+`present` detection),
   `structural` edges from `parent` (grid index→leaf, cluster
   sibling sets ≤8 same-`parent`), orphan detection, cap routing,
   flow invariants, anchor lints → draft `link-graph.md` + `Flags`.
3. Consume `site/writer-report.md` (F10): `demoted` seeds forced to
   `related`.
4. Lane pass: pick orphan sources from tool candidates; write
   `added` anchors under F4 rules (descriptive, varied, scoped);
   adjudicate flags; record every decision in `## Notes`.
5. Self-lint: every seed edged, every target resolves, no
   self/duplicate edges, caps per placement kind, I1–I4 green or
   flagged-with-reason.
6. Commit `site: link-graph`; done note names counts, orphans,
   flow violations, flags for apply lane.

**S4b `web-interlink-<site>`:**

1. Verify graph parses + version; every source/target file exists.
2. `tools/content_cleanup.py --strip` (classes 1–2) into `content/`.
3. `tools/link_apply.py`: `present` → `body`/`body:<m>`/`cluster:<m>`
   wraps → `related` extension; demotions listed.
4. Commit `site: inject links`.
5. `tools/content_cleanup.py` classes 1–4 → `content-final/`;
   lane applies classes 5–7; class 8–10 lints → report/flags.
6. `site/cleanup-report.md` (+ anchor-rewrite lines into graph
   `## Notes`, F9 pattern).
7. Self-lint per spec :302-315 + new classes; commit
   `site: content-final`; done names injected-vs-present, rewrites
   by class, flags.

## 8. Cross-module contracts

| Owes → | Expects ← |
|---|---|
| **→ S5:** `content-final/` where `body`/`cluster`/`related` links exist in markdown; `grid`/`nav` edges asserted in `link-graph.md` for S5 to render from `parent`; `## Related` block name constant (F13) | **← S1:** `parent` + `page_class` populated (incl. `location`); SERP link-density histogram in `research-inputs` (F3); `kw_group` for candidate ranking |
| **→ S7:** invariants I1–I5 as crawlable checks (proposed checks 14–17); graph file as the topology assertion to verify against | **← S2:** seed anchors that pass F4's semantic rules (currently unenforced — S4 becomes the trap); `plan_digest` (OI-5) |
| **→ operator:** `link-graph.md` + `cleanup-report.md` as the two review surfaces | **← S3:** canon `[anchor](<row.path>)` links (F2 fixed on main, PRD :171); stable module/heading names for `cluster:<module>` scoping; `writer-report.md` (F10) |

**Conflicts found:**
- S4 ≤3 body cap vs location ≤8 siblings + observed 11–51 (F2/F3) —
  resolved by per-placement caps.
- `## Related` ≤4 cap vs index→every-leaf — *not* a real conflict
  once `grid` exists (grid is exempt by kind); today it is one,
  since index enumeration could only land in `related`.
- Cleanup never-touch "no H2 added" vs injection appending
  `## Related` (F9) — needs the exemption clause.
- Location "location leaves = money-class in balance/orphan rules"
  (:301-302) vs closed `type ∈ {money,article,utility}` — works only
  via the `utility=ancillary` alias logic; `location` must either
  join the closed set (S1 delta :322 does exactly this for
  `page_class`) or map to `money` at plan time. Undecided today.
- Nav links: spec exempts "the nav-linked utility page" from orphan
  fixing (:124-125) but `nav` isn't a placement — nav edges are
  invisible to the graph entirely. `nav` as a structural placement
  (F5) makes the exemption checkable instead of assumed.

## 9. Verdict

S4's architecture is sound — graph-before-diff, two ordered lanes,
injection/cleanup separable — and the F2/F3/F5/F9 fixes from the
adversarial review landed. What it specifies today is a *seed
accountant*, not an interlinking pass: the graph enforces counts
and existence on a two-placement schema, while the topology the
factory actually wants (hub/spoke from `parent`, cluster grids,
flow proof) has no schema, no input, and no check.

**Must exist before an S4 PRD (or spec v2) can be written:**

1. **Edge schema v2** — `kind +structural`, `placement +{body:<m>,
   cluster:<m>, grid, nav}` (F2/F6); per-placement caps replacing
   the global ≤3/≤4 (F3); a `link-graph/v2` version token (F12).
2. **Topology input contract** — sitemap `parent`/`page_class` as
   graph-lane inputs; `location` page-class resolution (F1, §8
   conflicts).
3. **Flow invariants I1–I5 written as checks**, split S4-self-lint /
   S7-gate (F5); anchor semantic rules written as checks (F4).
4. **Tool/lane boundary decided** — `tools/link_graph.py`,
   `link_apply.py`, `content_cleanup.py`, `flow_check.py` as the
   mechanical floor; lane scope shrunk to the judgment residue (F7).
5. **Cleanup classes 8–10** drafted (keyword-density, anchor
   hygiene, heading-vector lint — the first two mechanical, the
   third flag-only) (F8).
6. **Small contract patches** — `## Related` H2 exemption (F9),
   `writer-report.md` channel (F10), plan-digest precondition
   (F11), block-name constant (F13).

Non-blockers carried forward: related-cap starvation under
multi-orphan plans (bounded, flagged); `intent`-driven edge
direction (worth a rule, not a blocker); exact anchor-diversity
thresholds (emit the report first, then set the bound — [INFERENCE]).

---

### Evidence appendix

- Google Search Central, "Link best practices" — fetched
  2026-11-02: crawlable `<a href>`; anchor text descriptive/concise/
  relevant; named-bad generics ("click here", "read more");
  keyword-cramming called a spam-policy violation; "don't chain up
  links next to each other"; "every page you care about should have
  a link from at least one other page."
- digitalapplied.com, "Internal Linking Strategy 2026" — fetched
  2026-11-02: pillar-cluster bi-directional topology "the 2026
  standard"; priority pages ≤3 clicks; Ahrefs 3–5 contextual links
  per standard post, pillars justified higher; per-link equity
  dilution; Zyppy 23M-link anchor-diversity correlation (~5×, flagged
  correlation-not-causation); Semrush 100+ outbound dilution flag.
- `research/WEB-FACTORY-LOCATION-PAGES.md` §1.4 (:108-114) — fetched
  cluster interlink data: gobox 51 sibling links, taxibox ~11,
  cleanpursuit 23, mobistorage two-layer.
