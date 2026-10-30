# ADVERSARIAL-REVIEW — Web Factory stage architecture (cross-stage, independent)

Review of the Web Factory pipeline as a *system*, rung 2: the per-spec
`## Contested` sections are self-review and were read but not trusted.
Every claim below cites the producing spec by file:line. Findings are
ordered by blast radius. Verdict at the end.

## Spec census

| Spec | State |
|---|---|
| `research/DISCOVERY-RESEARCH-web-factory.md` | **ABSENT** |
| `research/WEB-FACTORY-S1-SITEMAP.md` | **ABSENT** |
| `research/WEB-FACTORY-S2-TONE-PLAN.md` | present, reviewed |
| `research/WEB-FACTORY-S3-WRITING.md` | present, reviewed |
| `research/WEB-FACTORY-S4-INTERLINK.md` | present, reviewed |
| `research/WEB-FACTORY-S5-DESIGN-DNA.md` | present, reviewed |
| `research/WEB-FACTORY-S6-INTEGRATIONS.md` | **ABSENT** (plan manifest exists: `plans/quick/web-factory-s6-integrations.plan.json` — lane never landed) |
| `research/WEB-FACTORY-S7-GATE-DEPLOY.md` | **ABSENT** (plan manifest exists: `plans/quick/web-factory-s7-gate-deploy.plan.json` — lane never landed) |

Four of eight chartered specs never landed. The contiguous chain that
exists is S2→S5: intake → sitemap → tone+plan → copy → graph+cleanup →
distill+build. Both ends of the factory are unspecified.

---

## P1 — correctness-blocking defects

### F1. The pipeline's most-referenced contract has no spec: `sitemap.md` and the closed `type` set

Every stage binds on `sitemap.md`'s schema — `slug`, `path`,
`type` (`money|article|utility`), `primary_keyword` — yet no landed spec
defines it. Producers/consumer evidence:

- S2 §Upstream contract, `WEB-FACTORY-S2-TONE-PLAN.md:22-25` — quotes
  the schema verbatim and aborts if absent.
- S2 row schema, `:111` — "copied verbatim from `sitemap.md`".
- S3 mint precondition, `WEB-FACTORY-S3-WRITING.md:59` — row-count parity.
- S4 mint precondition, `WEB-FACTORY-S4-INTERLINK.md:78` — same re-check.
- S5 route authority, `WEB-FACTORY-S5-DESIGN-DNA.md:186` —
  "route count is S1's authority"; `type` → template kind mapping at
  `:147-149`.

Four downstream stages quote the same closed set and column names from
memory of a spec that does not exist in the corpus. There is no schema
owner to evolve: a rename (e.g. `type` → `page_kind`) or a new type
lands as silent drift across four prose documents, each mint-gate still
"re-checking" against a file whose own grammar is unwritten. The
self-checks the specs rely on (each gate re-verifies row-count parity)
verify *presence*, never *shape*.

Fix (primitive-first): land S1; until then, mint `research/sitemap.md`
as a canonical template sibling like `content-plan.md`/`link-graph.md`
already are — the template pattern exists and is the existing primitive
for exactly this class.

### F2. S3 writes links as `/{slug}`; S4 and S5 are `path`-canon — the `present` check can never match

- Producer: `WEB-FACTORY-S3-WRITING.md:132` — "wraps it as a markdown
  link to `/{slug}` (relative root path — S4 retargets anchors it
  reorganises)". `slug` here is the plan-row slug (e.g.
  `boiler-repair`), not the URL `path` (e.g. `/boiler-repair/` or
  `/blog/boiler-repair-cost/`).
- Consumers: `WEB-FACTORY-S4-INTERLINK.md:148` — `present` short-circuit
  matches "a link to the target's `path`"; `:152` injects as
  `[anchor](/<path>/)`; self-lint `:293` — "every linked path resolves
  to a plan row's `path`".
- `WEB-FACTORY-S5-DESIGN-DNA.md:244` — content bound to routes on
  `path`.

S3's `/{slug}` is a *different string* and, for any page whose path
carries a prefix (`/blog/…`) or whose slug ≠ path segment, a *different
route*. Consequences at lane time:

1. `present` misses every seed link S3 placed → apply lane
   double-injects: the wrong-notation `/{slug}` link stays in the body
   and a second `[anchor](/<path>/)` is wrapped — the duplicated-link
   spam pattern the outbound cap exists to kill (`:153-155`), emitted
   by the cap's own mechanism.
2. The surviving `/{slug}` link points at a route that may not exist —
   a broken internal link shipped to production. S4's "every linked
   path resolves" lint (`:293`) was presumably meant to catch this,
   but it can only be evaluated if the linter compares href strings
   against plan `path` — the spec does not say the lint walks *all*
   links in the file vs. only injected ones. If it walks all, it fails
   every page S3 touched; either way the pipeline red-lines or ships
   broken links.
3. The S3-side "S4 retargets anchors it reorganises" rationale is
   wrong on its own terms: S4 never *rewrites* an existing href —
   `present` short-circuits, injection wraps, cleanup keeps targets
   invariant (`:218-219`). No stage ever retargets `/{slug}` to
   `/path/`.

Fix (one line): S3 writes `/<path>/` — same href shape S4 injects and
S5 routes on. That single change deletes S4's demotion machinery for
this defect class and makes `present` real. This is the review's
clearest case of a consumer (S4) hardening around a producer (S3) bug.

### F3. S4's injection href form is itself ambiguous — `/<path>/` + paths that already end `/`

`WEB-FACTORY-S4-INTERLINK.md:152` — "wrap the first natural occurrence
as `[anchor](/<path>/)`". Every observed `path` value already carries a
trailing slash (`research/content-plan.md:11` — `/boiler-repair/`;
`:12` — `/blog/boiler-repair-cost/`). Read literally the injection
emits `/boiler-repair//`; read as "path sans leading slash + `/`" the
`/` prefix is unexplained. Same string-level contract bug class as F2:
href shape is specified in three places (S3 `/{slug}`, S4 `/<path>/`,
S5 `path` routes) and no two agree on the format grammar. One
authority — e.g. "a link is `[anchor](<row.path>)` with `path` always
leading+trailing slash" — closes the class.

### F4. The factory cannot finish: no build gate, SEO gate, or deploy stage exists

S5 produces `sites/<slug>/` and `dist/` (`WEB-FACTORY-S5-DESIGN-DNA.md:23`),
then hands to S6 (integrations) and S7 (gate+deploy) — both ABSENT.
Absent means unspecified, not merely unbuilt:

- No SEO verification gate is defined anywhere. Title ≤60, description
  140–160 are *writer-side lints* (`WEB-FACTORY-S3-WRITING.md:172-173`);
  whether the built HTML actually carries them, a canonical, sitemap.xml,
  robots, OG tags — unowned. S5 mentions `<SEOHead>` (`:245`) as a
  starter component; nothing checks its output.
- No deploy contract: host, rsync target, rollback, seal — S7's whole
  charter exists only as one line in the mint manifest
  (`plans/quick/web-factory-s7-gate-deploy.plan.json` acceptance text).
- No integration contract: form endpoint, mail transport, credentials —
  the CTA copy S3 writes ("Get a free quote") has no downstream that
  makes the quote request *function*. The factory as specified produces
  a built site with dead CTAs.

The review cannot adversarially test absent stages; their absence *is*
the finding — the trigger predicate ("7 stage specs exist") was false.

### F5. `## Related` after the CTA contradicts S3's "ends on the row's `cta`"

- `WEB-FACTORY-S3-WRITING.md:118` — money pages: "Every page ends on
  the row's `cta`".
- `WEB-FACTORY-S4-INTERLINK.md:160-162` — `related` placement appends
  `## Related` "last, after the CTA paragraph — it is navigation, not
  pitch".

Any money page that gains a `related` edge (demoted body seed, or
overflow past the outbound cap, `:129`) ends on a nav block, not its
CTA — or the writer duplicates the CTA. Neither spec acknowledges the
collision. Judgment call either way; the defect is that two stage
contracts assert contradictory page-tail shapes with no precedence
rule. Cheapest reconciliation: `## Related` *before* the closing CTA,
or S3's contract reworded to "the pitch ends on the CTA; a navigation
block may follow".

---

## P2 — contract ambiguities that will produce lane-time defects

### F6. `site/` shared-folder semantics are never defined

All cross-stage I/O is "the run's shared `site/` folder — the run
folder is the artifact of record" (`WEB-FACTORY-S2-TONE-PLAN.md:45-47`,
`WEB-FACTORY-S3-WRITING.md:49-51`, `WEB-FACTORY-S4-INTERLINK.md:32-40`).
Unanswered: is `site/` committed to the lane branches, checked into the
run folder out-of-band, or synced by the coordinator? When do sibling
lanes see a writer lane's commit — on push, on stamp, on lane close?
The specs treat `site/` as a blackboard while every other artifact in
the system is a git-tracked review surface with commit-seam discipline
(`site: content <slug>` per page, S3 `:180-181`; `site: link-graph`,
S4 `:264-265`). If `site/` is git state inside lane worktrees, disjoint
write_paths do not prevent index/branch collisions on shared files
(`link-graph.md`, `cleanup-report.md`); if it is out-of-band, the lane
fence cannot scope-enforce it. One paragraph — location, commit model,
visibility rule — closes it. Currently each lane must guess, and the
guess is load-bearing.

### F7. `content-plan.md` column values contain metacharacters the table grammar can't quote

`WEB-FACTORY-S2-TONE-PLAN.md:122-129` — `heading_skeleton` is a
`;`-separated list, `link_seed` is `anchor text -> slug`,
comma-separated. The plan is a markdown table (`:108`): a `|` inside an
anchor text or an H2 splits the row into phantom columns; a `,` inside
an anchor splits seeds. No quoting/escaping rule exists, and S2's lint
("no cell is empty", `:177`) does not validate the embedded grammars —
a malformed skeleton parses as a non-empty cell and fails at S3's H2
matcher or S4's seed resolver. `;` and `->` inside headings are real
(how-to titles carry `->`-shaped phrases; colon-dash arrows in SEO
titles are common). Minimal fix: either state "cells must not contain
`|`, `;`, `->`, `,` except as separators" (banning, weakest) or move
`heading_skeleton`/`link_seed` to a per-row fenced block (the grammar
the spec already uses for `## Writer batches` — an existing primitive).

### F8. Banned-token class collides with entity-fact preservation; dead-end flags

S4 cleanup must strip banned tokens (`WEB-FACTORY-S4-INTERLINK.md:190-194`)
and must preserve `site-brief.md` verbatim facts (`:221-224`), flagging
what it cannot reconcile. Two gaps:

- **Collision**: a banned token inside an entity string (a business
  literally named "Delve Plumbing", a credential phrased with a banned
  idiom) produces a flag with no resolution path — S5 binds the file,
  S7 doesn't exist to adjudicate. Nothing says the flag blocks the
  stage or who unblocks it.
- **Matching grammar**: tokens are consumed "case-insensitive"
  (`:191`) as "regex seeds" (`research/tone-profile.md:32`). No word
  boundary is specified: `- delve` matches `Delver`, `bedevil`;
  multi-word tokens with regex metachars are silently pattern-y.
  One word — "literal substring, word-bounded" — removes both.

### F9. `seed`-edge anchor verbatim vs. cleanup anchor rewrite — the graph stops being the record

S4 keeps seed anchors verbatim from the plan (`:102-104`, `:387-389`)
and records them in `link-graph.md`'s `anchor` column; cleanup rule 4
(`:193-194`) rewrites a linked anchor containing a banned token. The
deployed anchor then diverges from the graph-of-record with no
update-back. Minor — `## Notes`/report can carry it — but the spec
claims the graph is the authority (`:271-273`) while allowing the
apply phase to emit a page the graph no longer describes. Add
"rewritten anchors land in `cleanup-report.md` and the graph's `##
Notes`" — one line, keeps the audit chain.

### F10. Stale-row blindness on re-runs: coverage check counts files, not row freshness

S3 re-run safety (`WEB-FACTORY-S3-WRITING.md:217-219`) skips rows with
a non-empty `content/<slug>.md`. If S2 is fixed after writer lanes ran
(plan re-points a row — the "stale plan" failure mode the same spec
names at `:222-225`), re-minted lanes see full coverage and write
nothing; the stage gate sees every row covered. Stale copy ships under
a green row count. The DOX packet already names the detector —
`routePlanChecksum` (`WEB-FACTORY-S5-DESIGN-DNA.md:309-311`) — i.e.
the elegant fix exists in the corpus: a plan-content digest recorded
per written file (or a sitemap digest in the plan header) makes
"covered by a current version" checkable instead of assumed.

### F11. `dist/` ownership and commit state unpinned across S5/S7

S5's self-lint runs `astro build` (`WEB-FACTORY-S5-DESIGN-DNA.md:263`)
and S5's acceptance requires it (`:276`); S7's plan manifest re-runs
`astro build` at the gate. Whether `dist/` commits, `.gitignore`s, or
is disposable-until-S7 is nowhere stated — S5's commit seams
(`:265-266`) name scaffold/tokens/routes, not `dist/`. Two builds is
fine (re-verification is cheap); an ambiguous artifact status is not —
a lane will either commit a build tree into the review diff or delete
one S7 expects.

---

## P3 — observations (worth a line, not a fix)

- S2 `:141-142`: "money batch first — it is the S3 gate's first
  consumer" — S4 is the consumer; the phrase is residue.
- Every mint gate re-runs "row count == sitemap count" (S2 `:177`,
  S3 `:59`, S4 `:78`, S5 `:317`). Consistent and cheap; the duplication
  is a smell pointing at F10 — the real invariant is *version* parity,
  not count parity.
- All "lints" in the corpus are prose checklists the producing lane
  self-executes plus a coordinator re-read; the only *mechanical* gates
  in the repo are `test -s` existence checks on the specs themselves.
  Every lint claim above (heading levels, banned tokens, frontmatter
  bounds) is only as strong as lane diligence. That is a stated
  factory posture, not a defect — but it means the specs' "mechanical"
  vocabulary (`lint-able`, "a regex scan can consume it") describes an
  intended tool that does not yet exist. Worth naming so a reader does
  not assume a linter exists.
- S4's `## Related` block is the overflow valve for every graph
  pressure (demoted seeds, capped sources, unplaceable orphans);
  nothing caps `related` rows per page — a pathological plan could
  concentrate the graph tail on one page. Low probability; one-line
  cap closes it.

---

## Verdict

The four landed specs are individually disciplined — consistent
contracts, reviewable seams, named failure modes, honest Contested
sections. As a *system* the corpus has a structural pattern, not a
scatter of bugs:

**Producer specs never landed; consumers hardened anyway.** `sitemap.md`
(F1), `site-brief.md`, S6, S7 (F4) are referenced as authorities by
stages that exist; the link-notation drift (F2/F3) is the same shape
one level down — S4 built demotion machinery to survive a producer bug
instead of the producer emitting the right string. The system's
defense-in-depth (re-checks at every mint) checks *existence and
count*, never *shape and version* — which is exactly the class the
absent producers define.

**Ship-blocking before the factory can run end-to-end:** F2 (links
double-injected or broken), F4 (no gate/deploy means "done" is
undefined), F1 (schema authority missing). **Fix first, cheaply:** F2
is a one-token change to S3's link form; F1 and the `site-brief.md`
schema are template-file landings using the existing
`research/<artifact>.md` template primitive; F4 needs the S6/S7 lanes
actually run.

## Recommended actions (dispatchable)

1. Mint `crew quick` lanes for `web-factory-s1-sitemap`,
   `web-factory-s6-integrations`, `web-factory-s7-gate-deploy`,
   `web-factory-discovery` — the plan manifests for S6/S7 already
   exist; S1 and DISCOVERY need manifests.
2. S3 spec patch: `/{slug}` → `/<path>/` (fixes F2; deletes S4 demotion
   load).
3. S4 spec patch: pin the href grammar — "links are `[anchor](<path>)`,
   `path` verbatim from the plan row" (fixes F3) and `## Related`
   placement vs. CTA precedence (fixes F5).
4. Land canonical `research/sitemap.md` + `research/site-brief.md`
   templates (partial F1/F4 mitigation while spec lanes run).
5. Adopt `routePlanChecksum`-style digest for plan↔content staleness
   (F10).
