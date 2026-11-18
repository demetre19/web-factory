---
id: patterns-taxonomy
type: taxonomy
links:
  index: patterns-index
  defines: [section-catalog, primitives, design-genome]
---

# PATTERNS TAXONOMY — the closed sets that tag every annotation + pattern

Every screen in `data/annotations.jsonl` / `annotations_negatives.jsonl`
and every pattern file is tagged on three axes. A design request narrows
the library by filtering on these; `patterns.py search` treats them as
exact filters. Gene/allele vocabulary lives in `dna/GENOME.md`.

## 1. `site_type` — what kind of business the site serves

| `site_type` | Covers |
|---|---|
| `services` | local/professional services: cleaning, trades, home services, accounting, consulting |
| `ecommerce` | DTC/catalog retail: product, category, cart, checkout |
| `fashion` | luxury houses, contemporary/DTC, streetwear, editorial lookbook |
| `luxury-goods` | watches, leather goods, fragrance, furniture/interiors, yachts |
| `jewellery` | fine jewellery, bridal/engagement, artisan/independent |
| `architecture` | architecture firms, interior design studios, landscape architects |
| `homes` | home builders/developers, luxury residences, off-plan, renovation |
| `portfolio` | individual creatives: designer, photographer, architect, developer, artist, musician, writer |
| `agency-portfolio` | studios/agencies showcasing client work |
| `marketplace` | two-sided marketplaces, directories, listings |
| `saas` | B2B/B2C software subscription products |
| `technology` | developer tools, APIs, infrastructure, open source |
| `finance` | fintech, banking, insurance |
| `healthcare` | clinics, telehealth, medical, wellness |
| `education` | courses, e-learning, schools |
| `hospitality` | hotels, restaurants, venues, travel |
| `real-estate` | brokerages, property portals, listings |
| `automotive` | manufacturers, dealerships, configurators, EV |
| `legal` | law firms, legal services |
| `recruitment` | job boards, recruitment agencies, careers |
| `community` | forums, social platforms, membership communities |
| `personal-brand` | coaches, creators, consultants |
| `government` | government/civic services |
| `nonprofit` | charities, NGOs, advocacy |
| `media` | publishing, news, newsletters, blogs |
| `events` | conferences, festivals, ticketed events |
| `other` | annotator fallback |

**Priority order for mining:** services → ecommerce → portfolio →
luxury (fashion/luxury-goods/jewellery) → architecture/homes → saas →
technology → the rest.

## 2. `page_type` — what job the page does

`home` · `service-detail` · `pricing` · `about` · `contact` ·
`landing` · `blog` · `product` · `category` · `collection` · `cart` ·
`checkout` · `search-results` · `work-index` · `case-study` ·
`listing` · `schedule` · `article` · `configurator` · `lookbook` ·
`store-locator` · `appointment` · `brand-story` · `project-index` ·
`project-case-study` · `floor-plans` · `enquiry` · `other`

## 3. `section_type` — the section's catalog category

Closed set = SECTION-CATALOG §1 category vocabulary + the section roles
that Mobbin returns directly (product/PLP/checkout/portfolio vocab).

Core: `hero` · `proof-band` · `testimonials` · `logo-sections` ·
`counter` · `feature` · `how-it-works` · `timeline` · `teams` ·
`comparison` · `pricing` · `faq` · `call-to-action` · `contact` ·
`form` · `newsletter` · `gallery` · `grids-and-cards` · `content` ·
`table` · `banner` · `headers` · `footer`

Commerce: `product-grid` · `product-card` · `add-to-cart` ·
`price-variant` · `reviews` · `trust-badges` · `shipping-returns` ·
`cross-sell` · `filters-sort` · `mini-cart` · `listing` · `search-bar`

Editorial/creative: `work-grid` · `case-study` · `project-grid` ·
`lightbox-gallery` · `lookbook-spread` · `floor-plan` · `awards` ·
`schedule` · `donate` · `booking` · `store-locator` ·
`configurator-panel`

`speech_act` ∈ SECTION-CATALOG §1:
`promise | proof | tension | how | objection | act | detail | chrome`.

## 4. Cell naming

A **cell** = `site_type × page_type × section_type`, written
`services/home/hero`. Patterns live at
`patterns/<site_type>/<section_type>/<pattern-id>.md`; a pattern that
generalises lists all site types in `site_types:` and is filed under
its strongest cell.

## 5. Pattern roles

| Role | Rule | Storage |
|---|---|---|
| `PATTERN` | combo present in ≥60% of a cell's annotated screens AND n≥10 | pattern `.md`, positive imperative |
| `SIGNATURE` | distinctive move on `quality_tier: A` screens, <60% prevalence | `role: signature` in frontmatter |
| `ANTI` | attribute common on negatives, absent/rare on Mobbin A/B | `data/anti.json` (data only) |

## 6. Annotation schema (per screen)

| Field | Type | Meaning |
|---|---|---|
| `site_type`, `page_type`, `section_type`, `speech_act` | enum | §1–3 |
| `composition` | enum | SECTION-CATALOG §2 + `carousel`, `table-matrix`, `immersive-media`, `other` |
| `columns` | int | main content columns |
| `cta_count`, `cta_rank_primary` | int / enum | CTA count; strongest CTA position |
| `heading_body_ratio` | float | heading ÷ body size |
| `whitespace_share` | float 0–1 | empty-area share |
| `media_ratio`, `media_type` | float / enum | media share; photo\|screenshot\|illustration\|3d-render\|video-still\|none |
| `serif_display` | bool | display face is a serif |
| `radius_personality` | enum | sharp\|soft\|pill\|mixed |
| `cinematic` | bool | full-bleed photo/video canvas |
| `above_fold` | bool | plausibly above fold |
| `proof_type` | enum | none\|logos\|ratings\|testimonials\|certs\|stats\|case-study\|mixed |
| `disclosure` | enum | open\|folded\|tabbed\|carousel |
| `nav_pattern` | enum | bar\|bar-cta\|mega\|hamburger-only\|side\|none |
| `density` | enum | compact\|regular\|spacious |
| `surface` | enum | base\|muted\|inverse\|brand\|media |
| `heading_form` | enum | claim\|query\|label\|none |
| `mobile_evidence` | bool | mobile viewport screenshot |
| `notable`, `signature_move` | str | distinctive move |
| `quality_tier` | A\|B\|C\|null | craft judgement (VLM/reviewer) |
| `blocks[]` | list | PS segmentation regions |
| `ps` | dict | PS.* feature values (vision-side) |
| `mobbin_id`, `mobbin_url`, `image` | str | evidence |
| `annotator` | str | `pixel-v1` (deterministic) or `vlm-<model>` |

`blocks[]` vocabulary is shared with `tools/design-gate/ps_features.py`;
vision-side values and DOM-side values use identical feature names
(`block_role_uniqueness`, `boilerplate_at_edges`, `main_content_share`,
`media_context_binding`, `footer_is_boilerplate`, `priority_order`).
