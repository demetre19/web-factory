# Design Technology — External Research

Purpose: find the *mechanism* behind good page design that can be encoded into an automated Astro+Tailwind pipeline for a weak model — not taste advice. This file covers the Google/patent evidence: how a search engine decomposes a rendered page into visual blocks, and what that decomposition implies for how each section of a generated site must be structured.

Every claim carries a source URL. Patents describe systems Google has invented; none is a confirmed ranking factor — treat them as evidence of *what machines look for*, which is exactly the contract our generator must satisfy.

---

## Google & patents: visual-block evaluation

### The chain, in one paragraph

Google does not read a page as a text file. It pseudo-renders or fully renders the HTML, segments the page into spatially bounded blocks, classifies each block's role (header / nav / main / sidebar / footer / ad / card), picks ONE "centerpiece" block as the page's primary content, weights boilerplate lower, and only then lets expensive language models score the text. Pages that are expensive to segment get read worse or truncated earlier. Each stage below is documented.

| Stage | Mechanism | Primary source |
|---|---|---|
| 1. Segment page into regions | Pseudo-render DOM, annotate nodes with geometry, merge into "semantically distinct regions" | US7,913,163 / US9,069,855 (Zunger) |
| 2. Encode each block + block order | Two-level transformer: block-level encoder (text+image+position+type+font attributes) → document-level encoder trained to detect out-of-order blocks | US12,393,768 + LAMPreT arXiv:2104.08405 |
| 3. Identify the primary block | "Centerpiece annotation": HTML structure + language processing picks the main content; ~400-char extraction window shown in DOJ exhibits | Splitt video + DOJ exhibits via Search Engine Land |
| 4. Parse card-like components | Structured information cards: label terms → values, template + grammar matching | US10,824,630 |
| 5. Classify page/site type cheaply | Website representation vectors; categorize results by type | WO2020033805A1; US8,498,984 |
| 6. Gate expensive scoring | Cost-of-retrieval economics: cheap signals first, expensive models only on shortlisted candidates | DOJ/Nayak testimony via SEL; Koray framework |

---

### Source 1 — US7,913,163 / US9,069,855: "Determining semantically distinct regions of a document" (Zunger, filed 2004, granted 2011; continuation US9,069,855 granted 2015)

- Patent: https://patents.google.com/patent/US9069855B2/en (analysis: https://www.seobythesea.com/2011/03/googles-page-segmentation-patent-granted/)
- Mechanism:
  - Translates HTML into a "quasi-DOM" tree, then **pseudo-renders** it — a cheap one-pass render that computes approximate position and size of every element without a real browser.
  - Annotates each node with geometric parameters (x/y, width, height) and merges nodes with "nearby positions and/or compatible attributes" into a **chunk tree** where each chunk = a semantically distinct region (header, LHS sidebar, main content, RHS sidebar, footer).
  - Region identity is inferred from *position*: the patent states main content sits "at or near the center" and footers carry boilerplate "located at the bottom."
  - Downstream uses named in the patent: weighting links by region (footer links < main-content links), weighting text by region, captioning images from adjacent text, constructing snippets.
  - Explicitly designed to run "with minimal computational resources at the possible expense of accuracy" — the segmentation pass is meant to be cheap.
- Design implication: **a page must segment cleanly under geometry alone.** Concretely: the main content must occupy a contiguous, central, visually bounded region; page furniture must cluster into separable header/sidebar/footer regions; nothing decorative may interleave with content blocks. A template where every section is a clean rectangular block with a distinct role is not an aesthetic choice — it is the input format the segmenter expects. Mixed grids, absolutely-positioned overlays, and content split across non-adjacent DOM regions defeat it.

### Source 2 — Microsoft VIPS (Vision-based Page Segmentation), TR-2003-79 — the ancestor algorithm

- Paper: https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/tr-2003-79.pdf (cited by Koray: https://searchengineland.com/visual-semantics-topical-authority-482254)
- Mechanism:
  - Segments a page top-down using **visual separators** (whitespace gaps, lines, background changes, font changes) into a block tree with a "Degree of Coherence" per node.
  - Blocks are extracted from DOM *plus* rendered visual cues — neither alone is sufficient.
  - Established the field's core idea: a page is a tree of visually coherent blocks, not a bag of elements.
- Design implication: **whitespace and visual rhythm are machine-readable separators.** Consistent section padding, visible gaps between blocks, and background alternation between sections are the cuts a segmenter uses. Uniform spacing between unrelated blocks and decorative elements inside content blur block boundaries. Encode: fixed vertical-rhythm tokens per section type; never let a separator vary arbitrarily.

### Source 3 — US12,393,768: "Layout-aware multimodal pretraining for multimodal document understanding" (Bendersky, Najork, Zhang, Li, Chen, Hombaiah, Wu; filed 2020, granted Aug 2025) + LAMPreT paper

- Patent: https://patents.google.com/patent/US12393768B2/en — Paper: https://arxiv.org/abs/2104.08405 — Analysis: https://usmanishaq.com/blog/visual-semantics-seo
- Mechanism:
  - Partitions a document (explicitly: a webpage) into blocks using HTML tags + spatial layout data; each block gets a **type** from a fixed set (header, paragraph, image, list, table, caption, padding… — ~14 types per secondary analyses).
  - **Block-level encoder**: multimodal transformer encodes each block from its text, bounding-box position (normalized to page), block type, text attributes (font size, bold, italic, underline, color), and image content encoded by a CNN *from pixels*, not alt text.
  - **Document-level encoder**: a second transformer aggregates block representations + inter-block relations into one document embedding used for classification, retrieval, summarization.
  - Pretraining objectives are the tell: **block-ordering prediction** (swap two blocks, model must detect the disorder), **masked-block prediction** (predict a missing text block from candidates), and **image fitting** (pick the correct image for a masked image slot). Secondary analysis reports removing block-ordering drops image-suggestion recall from ~100% to ~70%.
  - Layout data is encoded in attention maps; relative position between blocks is an explicit input.
- Design implication: **block order is a learned convention the model checks.** The expected sequence — headline → standfirst → primary content/tool → supporting blocks → supplementary (FAQ, related) → footer — is what the encoder was trained to see; departures read as "disordered," not "creative." Encode as a rule: (a) DOM order === visual order, never reorder content via CSS; (b) canonical block sequences per page type, centerpieced block first; (c) typography carries the importance signal — H1 largest, monotonically descending heading scale, bold/underline used semantically not decoratively, because font size/weight/underline are literal model inputs; (d) captions directly adjacent to their images (adjacency = relationship); (e) images must depict the adjacent entity — the encoder reads pixels and scores image-text fit, so decorative stock actively hurts; (f) empty containers become typed "padding" blocks — purge spacer divs.

### Source 4 — US10,824,630: "Search and retrieval of structured information cards" (Najork, Ravi, Bendersky, Young, Sohn, Zhang, Nelson, Wang; filed 2016, granted 2020)

- Patent: https://patents.google.com/patent/US10824630B2/en — Context: https://searchengineland.com/visual-semantics-topical-authority-482254
- Mechanism:
  - Presents structured information as **cards**: templates that bind *label terms* to *values* (product card, hotel card, real-estate card, trip card, credit-card card).
  - Parses candidate label terms against a grammar, associates them with entities, and expands trigger-terms so cards can be retrieved for more queries.
  - Google engineers associated with Gemini/AI Mode are among the inventors — card understanding is an active line, per Koray's analysis.
- Design implication: **repeated information must be packaged as structurally uniform cards.** Every card in a grid gets the same internal anatomy: name/label term in the same position, value in the same position, image same slot. A "card" that is a differently-shaped div each time cannot be parsed as a labeled unit; one that is a fixed `<label>:<value>` anatomy can be extracted as structured data. Encode: component library where card types are rigid (e.g., ServiceCard = name + price + 1 attribute row + CTA), and every card carries a visible textual label — never icon-only values.

### Source 5 — Centerpiece annotation: how Google picks the main content block

- Primary: Martin Splitt (Google) video, 2021 — https://www.youtube.com/watch?v=BG56C6XI0YM&t=1730s — Reporting + DOJ exhibit analysis: https://searchengineland.com/visual-semantics-topical-authority-482254 and https://digitalvikingz.com/knowledge/centerpiece-annotation and https://usmanishaq.com/blog/visual-semantics-seo
  - (Attribution note: it is **Martin Splitt**, Google's Search Relations developer advocate — the SEO discourse shorthand "Martin Kuettler" is a garbling; verify against the video URL.)
- Mechanism:
  - Google's rendering pipeline reads the HTML content structure, runs language processing, marks ONE block as the "centerpiece annotation" = primary content, and weights boilerplate/supplementary blocks lower.
  - DOJ antitrust exhibits show centerpiece extraction used to classify news documents, with an extracted window of **~400 characters** starting after the H1.
  - Extraction follows **DOM order, not rendered order**: exhibits show share-button labels ("Facebook", "Twitter", "email") captured as the opening of the centerpiece because the share bar sat inside the primary block in source; a second exhibit shows a clean page where extraction runs standfirst → first paragraph.
  - A 400-char window must carry the central entity, the main predicate, and what the page does — "a stranger reading only those characters knows the offer."
- Design implication: **the first block after the H1 is the single most valuable pixels on the page.** Encode: (a) exactly one centerpiece per page, chosen per page type (tool → the tool; service page → offer + proof; comparison → the table); (b) H1 → standfirst/extractive summary (2–3 declarative sentences, entity as subject) → centerpiece block, contiguous, first in DOM *and* top of the rendered primary column; (c) page furniture (share bars, breadcrumbs, dates, author cards, newsletter boxes, ad slots) goes above the H1 or below the centerpiece block — never between; (d) hero carousels/autoplay video before the centerpiece are forbidden — they push the centerpiece down and add contextless nodes; (e) centerpiece must be server-rendered — JS-injected main content is absent from the cheap pass.

### Source 6 — WO2020033805A1: "Website representation vector to generate search results and classify website" (filed 2019)

- Patent: https://patents.google.com/patent/WO2020033805A1/en — Context: https://searchengineland.com/visual-semantics-topical-authority-482254
- Mechanism:
  - Builds a **feature vector per website** via a neural net over site content (text, images, links); averages vectors of already-classified sites into composite representations per class.
  - Example classes named verbatim: websites authored by **experts** (doctors), **apprentices** (medical students), **laypersons** — per knowledge domain.
  - New sites are classified by distance to the composite vectors; the search system may then "search the second websites and skip searching the first" — classification decides whether a site is even searched, saving compute.
- Design implication: **a site's visual/component fingerprint is itself a classification input.** Sites that *look like* the expert cluster (consistent professional templates, functional components, real data) are classified before their text is deeply scored. A generated site whose layout resembles thin template spam inherits that cluster. Encode: per-vertical templates should approximate the component vocabulary of the authoritative sites in that vertical (real comparison tables, working calculators, real pricing blocks), not a generic brochure skeleton.

### Source 7 — US8,498,984: "Categorization of search results" (granted 2013)

- Patent: https://patents.google.com/patent/US8498984B1/en — Context: https://searchengineland.com/visual-semantics-topical-authority-482254
- Mechanism:
  - Groups ranked results into **categories** (site, news, web, blog, video…), scores categories by historical selection rate per position, and assembles SERPs with category-aware selection.
  - Google composes SERPs from page *types*; a query can demand a mix (listicle + category page + video + tool).
- Design implication: **a page must be visibly one type.** Layout is how the page declares its type: a listicle looks like a ranked list, a tool page puts the tool first, a directory page leads with a filterable list. A hybrid/brochure page that signals no clear type competes in no category. Encode: page-type registry — each content type maps to exactly one canonical layout archetype; the page's function must be legible from the block sequence alone.

### Source 8 — Koray Tuğberk Gübür: cost of retrieval & predictive IR framing

- Sources: https://searchengineland.com/visual-semantics-topical-authority-482254 — https://searchengineland.com/query-templates-topical-authority-484676 — formula: Topical Authority = (Topical Coverage × Historical Data) / Cost of Retrieval, later extended "× right visual annotations" (https://x.com/KorayGubur/status/2122817760438722898)
- Mechanism:
  - Core axiom: "**the cost of ranking a site can't exceed the cost of not ranking a site.**" Google is "designed to save costs rather than to serve the best"; if a page costs more to crawl/render/segment/evaluate than its quality justifies, it loses to a cheaper alternative.
  - DOJ testimony (Pandu Nayak): expensive rankers (RankBrain-class) run only on a shortlist (~top 20–30); cheap signals — topicality, PageRank, localization — do the first cut; many documents have no click data at all, so new pages live or die on the cheap structural pass. (Via https://usmanishaq.com/blog/visual-semantics-seo and the SEL article.)
  - Content Warehouse API leak shows Google truncates documents and predicts quality on initial signals — the first blocks decide whether the rest gets read (https://google-api-content-warehouse.hexdocs.pm/0.2.0/GoogleApi.ContentWarehouse.V1.Model.GoodocSemanticLabel.html, via SEL).
  - Predictive IR: Google pre-computes answers from authoritative subsets and uses query-pattern patents (e.g., US8,868,548 "Determining user intent from query patterns", https://patents.google.com/patent/US8868548B2/en) so one well-structured page can satisfy thousands of template variations — "query templates need answer templates," and documents matching the expected answer format are classified "template-efficient" and kept; others are eliminated faster (Koray, SEL Aug 2026, citing US10,031,953 "Generating Query Answers", https://patents.google.com/patent/US10031953B2/en).
  - Case evidence: moving a calculator from page-bottom to top-of-page (making it the centerpiece) across ~100k programmatic pages → +30.5% clicks, +98.6% impressions; identical content moved from an affiliate frame to an ecommerce frame ranked better — same words, different *functional environment*.
- Design implication: **layout is the cheapest quality signal a page emits, and it is evaluated first.** For a generated site this is the strongest lever: (a) keep DOM size small and HTML clean (Google's HTML limit ≈2 MB; every wrapper div is a node in the cost); (b) front-load meaning — the entity, claim, and function must be extractable from the first screen *and* the first 400 chars of DOM text; (c) one page = one function that actually works (Google's spam policy names "misleading functionality" — a compare button that doesn't compare is a violation, via SEL); (d) design pages to match the *answer template* of the query type — a "how much does X cost" query wants a price-range block near the top, not a 600-word preamble; (e) macro/micro split: above the fold declares the central entity + intent with low link density (a wall of links up top reads as navigation); below the fold expands attributes and carries internal links (https://usmanishaq.com/blog/visual-semantics-seo).

---

## Synthesis: encodable design rules for a weak model

What the patent chain teaches is that "good design" for machine readers = a page whose **block decomposition is unambiguous, conventionally ordered, role-typed, and front-loaded**. These compile directly into generator constraints:

1. **Block-first architecture**: every page is a flat sequence of role-typed blocks (`hero/answer`, `proof`, `detail`, `compare`, `action`, `supplementary`, `footer`), never nested decoration. (Sources 1, 2, 3)
2. **Canonical block order per page type**: centerpiece first; supplementary (FAQ/testimonial/CTA-repeat) never before it. The encoder is literally trained to flag swapped blocks. (Sources 3, 5)
3. **One centerpiece, decided before layout**: brief line "this page lets a user [verb] [entity] by [component]" — the component is the centerpiece and leads the DOM. (Source 5)
4. **First-400-char discipline**: H1 + standfirst answers entity/predicate/function; furniture banished from the window. (Source 5)
5. **Typography = importance encoding**: strict descending heading scale; bold = declarative opener only; these are model inputs, not styling. (Source 3)
6. **Uniform card anatomy**: repeated entities as rigid label→value cards with visible text labels. (Source 4)
7. **Images earn their slot**: adjacent to the entity they depict, captioned directly below; off-topic stock < no image. (Source 3)
8. **Working function over description**: prefer real tools/tables/filters; never fake controls. (Sources 7, 8)
9. **Cost hygiene**: small DOM, server-rendered centerpiece, no spacer divs, DOM order = visual order. (Sources 1, 3, 8)
10. **Vertical-cluster conformity**: match the component vocabulary of authoritative sites in the niche — classification precedes deep scoring. (Source 6)
