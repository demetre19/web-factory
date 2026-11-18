---
id: rules-E
type: rules
links:
  used_in: [w5, w7, w8]
---

## E. SEO headings — the copy contract

Source: `SEO SOPs/SEMANTIC-SITE-BLUEPRINT-SOP` (Koray framework) +
the STUB contract files (`CONTENT/**/*.md`). A ranking page's
heading vector is **upstream authority** — the design molds around
it; it is never reshaped for the layout.

### E.1 The heading vector is the section list

A STUB's `## Heading vector` table *is* the page's `sections[]`
input — one vector row → one plan row, order preserved. The vector
check (definition → scope → audience → process → pricing →
duration → compliance → coverage → siblings → FAQ) is the rhetoric;
a plan row that invents a section the vector lacks, or drops one,
is a refuse.

Every plan row on a copy-contract page carries:

```yaml
heading: "What is vacate cleaning?"   # exact vector heading — never rewritten
fs: "Vacate cleaning is the full-building reset…"  # mandated first sentence
zone: macro | micro | end             # from the vector's zone column
heading_class: query | claim          # how it renders (E.2)
```

### E.2 Two heading classes — conversion vs. crawl

Headings do two different jobs and render two different ways:

| Class | Job | Visual weight | Renders as |
|---|---|---|---|
| `claim` | convert the reader | full rank scale (display/h1/h2), statement or benefit | the page's visual rhythm — the "designed" headings |
| `query` | answer the crawler | **minimised** — one rank down, muted ink, tighter spacing | question-form H2s; small label headings; QA blocks; accordion rows |

Rules:

- **The H1 is always `query`** on service-detail pages — it's a
  canonical-entity label (`End of Lease Cleaning Melbourne`), not a
  claim. It renders *small* — the WC pattern: the H1 sits at body-adjacent
  size over a hero whose visual weight comes from the promise copy
  around it. A giant H1 on a service page is a defect; the claim
  lives in the subhead/lead, which is `claim`.
- **Macro-zone H2s** (`what/who/how/how much/how long` on this page's
  entity) = `query` but *readable* — real section blocks, just quiet:
  smaller rank, muted, measure-bound. They ARE the article.
- **Micro-zone H2s** (bridges, coverage, siblings, FAQ) = `query`
  *minimised* — accordion rows, footnote-density blocks, or a
  `query` cluster at ≤small rank. SEO needs them present; conversion
  doesn't need them loud.
- **`claim` headings** come only from *marketing* copy (home hero,
  section leads) — never invented on a vector page.

### E.3 SEO invariants (lint)

- Title & H1 share the canonical entity — the STUB's `**H1**` field
  is verbatim; never rewritten for design.
- First sentence after every heading is **declarative** — the `fs`
  field is the copy contract; it renders, it isn't paraphrased.
- `≤1` contextual link per heading section; cross-cluster links only
  in the last heading's paragraphs; link slots land where the vector
  says (`→ /path`).
- 80/20 macro/micro allocation — the page's word share stays ≥80% on
  its own entity; micro sections interlink, they don't expand.
- The vector's ordering is a hard invariant — `detail`-style
  reordering is *not* free on a vector page the way it is on a
  pure-marketing page.

### E.4 SEO QA — mechanical checklist

- [ ] Every `sections[]` row maps 1:1 to a heading-vector row, order preserved
- [ ] `heading` fields match the vector verbatim; `fs` fields present
- [ ] H1 renders `query` class (small, label-weight) on service-detail pages
- [ ] Macro H2s `query`-readable; micro H2s `query`-minimised
- [ ] No `claim`-class heading invented on a vector page
- [ ] ≤1 contextual link per section; cross-cluster only in last section
- [ ] Title & H1 share the canonical entity

## Enforcement

Generated from `enforcement.json` (`gate.py enforcement`) — edit the JSON, never this table.

| Rule | Tier | Mode | Check / rubric | FAILs when | Wave |
|---|---|---|---|---|---|
| E.1 | invariant | script | `check_vector_map` | STUB heading missing, re-ordered or reworded in plan rows | w3 |
| E.2 | structural | script | `check_section_enums` | heading_class query|claim; macro open | w3 |
| E.3 | structural | script | `check_seo_lint` | one h1; no skipped heading ranks | w7 |
| E.4 | stylistic | script | `check_heading_verbatim` | rendered headings/fs verbatim vs STUB | w7 |
