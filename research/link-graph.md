# link-graph.md — canonical template (copy to site/link-graph.md; fill per site)

This is the template the Web Factory S4 graph lane
(`web-link-graph-<site>`) fills and commits as `site/link-graph.md`
before any page file is injected. Spec:
`research/WEB-FACTORY-S4-INTERLINK.md` §Output 1. Column names are the
parse contract — the apply lane (`web-interlink-<site>`) consumes them
verbatim; do not rename, reorder, or add columns mid-table.

One row per edge:

| source_slug | target_slug | anchor | kind | placement |
|---|---|---|---|---|
| boiler-repair-cost | boiler-repair | our repair service | seed | body |
| boiler-repair-cost | prices | boiler repair prices | added | related |

- `source_slug`, `target_slug` — `content-plan.md` slugs; the target
  resolves to its row's `path` at injection time (slugs, never URLs).
- `anchor` — exact anchor text to inject; `link_seed` anchors verbatim
  for `seed` rows.
- `kind` — `seed` (plan-obligated) or `added` (graph lane computed —
  orphan fix, balance).
- `placement` — `body` (wrap first natural occurrence) or `related`
  (closing `## Related` block row). S3-flagged weak seeds are always
  `related`.

`## Notes` under the table: orphans found, one-line reason per `added`
edge, demoted seeds, balance skews, dropped edges.
