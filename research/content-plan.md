# content-plan.md — canonical template (one row per sitemap row; copy to site/content-plan.md)

This is the template the Web Factory S2 lane copies into a run's
`site/` folder and fills one row per `sitemap.md` row. Spec:
`research/WEB-FACTORY-S2-TONE-PLAN.md` §Output 2. Column names are the
parse contract — S3 writer lanes and S4 link seeds consume them
verbatim; do not rename, reorder, or add columns mid-table.
`pain_point` IDs reference `site/customer-profile.md` (`PP-<n>`).

| slug | path | type | primary_keyword | secondary_keywords | intent | word_target | heading_skeleton | link_seed | cta | media | faq | og_image | pain_point |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| boiler-repair | /boiler-repair/ | money | boiler repair <town> | emergency boiler repair <town>, boiler engineer near me | commercial | 1000 | H1: Boiler Repair in <town> — Fast, Fixed-Price; H2: Common boiler faults we fix; H2: How our repair visit works; H2: What it costs; H2: Why choose us; H2: Get your boiler fixed today | fixed pricing -> prices, book a visit -> contact | Get a free quote | hero -> engineer repairing boiler in <town> kitchen; mid -> before/after repair close-up | no | default | PP-3 (the homeowner with no heating) |
| boiler-repair-cost | /blog/boiler-repair-cost/ | article | how much does boiler repair cost | boiler repair prices, boiler callout fee | informational | 1400 | H1: How Much Does Boiler Repair Cost?; H2: Typical repair price ranges; H2: What affects the price; H2: Repair vs replace; H2: How to get an accurate quote | our repair service -> boiler-repair | Get a free quote | none | no | default | PP-11 (the bill-anxious researcher) |

## Writer batches

- `web-writer-<site>-b1` (money): boiler-repair, [other money slugs]
- `web-writer-<site>-b2` (article): boiler-repair-cost, [other article slugs]

Rules (from the S2 spec): batch size ≤ 6; money and article pages batch
separately; money batch mints first; every row appears in exactly one
batch.
