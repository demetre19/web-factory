# Brief — web-factory-spec-conformance

## Goal

Apply the OI-3 conformance patch across `research/WEB-FACTORY-S2-*.md`
through `research/WEB-FACTORY-S5-*.md` — reconcile every spec to the
schema-of-record declared in `PRD-Web-Factory-2026-10-30.md` §4.1/§5.

## Write paths

- `research/WEB-FACTORY-S2-TONE-PLAN.md`
- `research/WEB-FACTORY-S3-WRITING.md`
- `research/WEB-FACTORY-S4-INTERLINK.md`
- `research/WEB-FACTORY-S5-DESIGN-DNA.md`

## Patch list (verbatim from PRD §6 dispositions)

1. **Naming**: `type` → `page_class` terminology; `utility` → `ancillary`
   in the closed set `money | article | ancillary`; `slug`/`path`
   semantics as D10 defines (`slug` = last path segment of `route`,
   `path` = `route` verbatim).
2. **F5 precedence wording** (S3): "the pitch ends on the CTA; a
   `## Related` navigation block may follow it" — replaces the flat
   "every page ends on its `cta`".
3. **F9 graph-notes line** (S4): rewritten anchors land in
   `cleanup-report.md` AND `link-graph.md`'s `## Notes`.
4. **`## Related` row cap** (S4): cap related rows per page (pick a
   defensible number, state it, e.g. 6).
5. **F10 plan digest hooks** (S2 emit, S3 record, S4 compare):
   `plan_digest` field in `content-plan.md` front-matter; each
   `content/<slug>.md` records the digest it was written against;
   S4's mint gate refuses on digest mismatch. Wording only — the
   machinery implementation is OI-5's lane, not this one.
6. **F7 separator grammar** (S2): cells may not contain `|`, `;`,
   `->`, `,` except as documented separators — declared in the spec.

## Done contract

Each spec's edited lines match the PRD's dispositions; no spec
contradicts §4.1/§5's schema or the F5/F8/F9/F10 decisions; the
canonical templates (`content-plan.md`, `link-graph.md`) stay
consistent with their specs.

elegance: {"rung": 1, "lower_rungs_rejected": {"r0": "the specs as written contradict the approved PRD's schema-of-record — lanes would mint against two authorities"}, "trigger": {"supplied_by": "the admit pass reading the repo", "self_triggering": true, "observed_state": "PRD-Web-Factory-2026-10-30.md APPROVED while the S2–S5 specs carry the pre-conformance vocabulary"}, "follow": {"obliged_actor": "the boss session in workspace w57", "refusal": "stage lanes bind the spec verbatim — a contradicting spec produces lanes that fail each other's mint gates", "bypass": [{"path": "research/WEB-FACTORY-S2..S5 are the only files carrying the stale vocabulary", "closed_by": "the conformance patch landing"}]}, "trigger_kind": {"kind": "event", "predicate": "specs contradict the approved PRD schema-of-record", "acted_by": "this lane"}, "census": {"searched": ["research/WEB-FACTORY-S*.md", "PRD-Web-Factory-2026-10-30.md"], "candidates_found": 0}}

## Scope census

class: spec-conformance-patch — edits to four existing spec documents
callsites: research/WEB-FACTORY-S2-TONE-PLAN.md, research/WEB-FACTORY-S3-WRITING.md, research/WEB-FACTORY-S4-INTERLINK.md, research/WEB-FACTORY-S5-DESIGN-DNA.md
bypass_paths: none — the specs are the authority lanes bind
siblings: plans/quick/web-factory-astro-starter.brief.md, plans/quick/web-factory-runbook-skills.brief.md
