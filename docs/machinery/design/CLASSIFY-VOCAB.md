# CLASSIFY-VOCAB — site & section taxonomy (canonical)

Closed vocabularies for the classification layer. Every tag emitted by
any classifier (Gemini, local VLM, deterministic annotator) MUST use
these exact strings. Extend only here; never ad-hoc labels.
Rows may carry MULTIPLE values where marked `[multi]`.

---

## SITE level — `meta['vibe']` + `meta['structure']` + `meta['site_type_v2']`

### site_type_v2 (existing, keep)
saas, agency-portfolio, med-spa, nonprofit, hospitality, technology,
docs, ecommerce, portfolio, automotive, other

### vibe.style [multi]
minimal, editorial, luxury, playful, technical, brutalist, retro,
corporate, artisanal, futuristic, organic, geometric, swiss,
magazine, neo-brutalist, bento, glassmorphism, skeuomorphic,
maximalist, avant-garde, traditional, japanese, scandinavian,
memphis, y2k, grunge, deco, colonial, botanical, cosmic, western,
industrial, rustic, gothic, cyber, vaporwave

### vibe.mood [multi]
calm, warm, moody, energetic, solemn, confident, playful, dramatic,
serene, bold, clinical, cozy, edgy, mysterious, joyful, luxurious,
aggressive, contemplative, rebellious, reassuring

### vibe.tone
light, dark, mixed, high-contrast, inverted-sections

### vibe.palette_family [multi]
warm, cool, neutral, monochrome, pastel, earth, neon, jewel, muted,
duotone, grayscale, sepia, vivid-multi, accent-on-neutral

### vibe.whitespace_band
tight, balanced, airy, extreme-airy, extreme-tight

### vibe.type_personality
serif-led, sans-led, display-heavy, mono-touch, humanist-sans,
geometric-sans, neo-grotesque, slab-serif, script-accent,
mixed-serif-sans, condensed-headline, variable-font, stencil

### vibe.formality
playful, casual, professional, strict, luxurious, ceremonial,
academic, streetwear

### vibe.ornament_density
bare, subtle, moderate, heavy, layered-maximal

### vibe.ornament_kind [multi]
grain, noise, gradient-mesh, lines, grid-pattern, dots, duotone-media,
borders, shadows-hard, shadows-soft, glow, blur-glass, texture-photo,
illustration-overlays, stickers, badges, 3d-elements, chrome-effects

### vibe.imagery_type [multi]
photograph, photograph-people, photograph-product, illustration,
3d-render, vector-icon, typography-only, video-frames, ai-generated,
map, data-viz, mockup-device, collage, screenshot

### vibe.grid_discipline
strict-baseline, strict-column, asymmetric, broken-grid, overlap-layered,
single-column, modular

### vibe.motion_feel (judged from static: animation hints, transform props)
static, subtle-hover, animated-accents, kinetic, scroll-driven,
parallax-feel

### vibe.layout_rhythm
regular, alternating-splits, hero-heavy, dense-scroll, z-pattern,
modular-blocks, editorial-flow

### vibe.nav_style
fixed-thin, fixed-solid, centered-logo, left-logo-heavy, minimal,
mega-menu, sidebar, none-single-page

### vibe.cta_voice
command, soft-invite, consultative, urgent, luxury-understated

### vibe.confidence (0-1)

### structure
Ordered array of section_type strings in page order, derived from
tagged sections (mechanical — never model-guessed).
structure_hash = sha256 of the joined sequence (site-shape lookup).

### vibe.relations (derived, free)
structure_signature = e.g. "hero > logo-bar > features > testimonials
> pricing > faq > footer"; position counts per section_type.

---

## SECTION level — `row['style_tags']` on section-bank + component rows

### section_type (pick ONE most-specific)
hero, hero-split, hero-split-reverse, hero-centered, hero-video,
hero-fullbleed, hero-minimal, nav, megamenu, sidebar-nav,
logo-bar, logo-marquee, announcement-bar, banner,
feature-grid, feature-list, feature-split, feature-showcase,
feature-accordion, stats, counters, numbers-banner,
testimonials, testimonial-single, quote, review-cards, ratings-row,
pricing, pricing-comparison, pricing-cards, faq, faq-accordion,
faq-grid, cta, cta-banner, cta-split, cta-minimal, cta-form,
footer, footer-slim, footer-mega, footer-cta,
gallery, work-grid, portfolio-grid, masonry-grid, team, team-grid,
about, about-founder, about-story, values,
blog-cards, blog-featured, blog-list, blog-sidebar, editorial-article,
product-grid, product-feature, product-comparison, product-detail,
steps, process, timeline, how-it-works,
contact, contact-split, form, form-multi, map, newsletter,
subscribe-minimal, comparison-table, table, spec-table,
video, video-embed, carousel, slider, horizontal-scroll,
marquee, divider, divider-cta, spacer-ornament,
error-404, coming-soon, auth, login, signup, dashboard,
docs, docs-nav, sidebar, breadcrumbs, comments, related-posts,
partners, awards, press-logos, certifications,
app-store-cta, download, changelog, newsletter-archive,
community, forum-preview, integrations, api-docs,
location-grid, hours-info, menu-items, booking-widget,
donation-banner, mission-statement, impact-stats, volunteer-cta,
legal-disclaimer, cookie-notice, other

### composition
centered, split-left-media, split-right-media, asymmetric,
grid-uniform, grid-masonry, grid-bento, stacked, overlapping,
horizontal-scroll, offset-columns, column-2, column-3, column-4+,
z-layout, full-bleed

### media_role
none, hero-image, product-shot, avatar-group, logo-field, icon-row,
video-thumb, map, device-mockup, illustration, photo-collage,
background-photo, background-video, texture-only, chart

### text_role
headline-only, headline-subhead, headline-subhead-cta,
eyebrow-headline-body-cta, dense-copy, quote-led, list-led,
form-led, data-led

### tone / style / mood / formality / ornament_density / palette_family /
### type_personality / imagery_type
Same vocab as site level (reused verbatim).

### height_band
short-under-300, standard-300-700, tall-700-1400, full-viewport,
extra-tall-1400+

### content_weight
sparse, light, medium, dense, maximal

### interaction
static, hover-reveals, accordion-expands, carousel-arrows,
scroll-animated, marquee-loop, form-active, filterable

### conversion_role
awareness, interest, consideration, decision, action, support

### confidence (0-1)

---

## SUB-SECTION primitives — `row['elements']` (deterministic scan + tags)

heading, eyebrow, subhead, body-copy, list, button, link,
card, input, select, textarea, checkbox, radio, toggle,
avatar, avatar-stack, icon, icon-badge, image, video-embed,
badge, tag, chip, divider, spacer, stat-number, stat-label,
star-rating, progress-bar, tooltip, dropdown, tabs, accordion,
modal-trigger, breadcrumb, pagination, search-bar, price-figure,
price-breakdown, testimonial-card, quote-mark, logo, logo-grid-cell,
map-embed, calendar-widget, countdown, timer, chart, graph,
code-block, doc-list, link-card, cta-banner-inline, notice,
alert, banner-text, avatar-name-role, social-links, nav-link-group,
brand-wordmark, step-number, check-icon-list, image-caption,
video-caption, app-badge, qr-code, signature, legal-fine-print

---

## RELATIONS — derived per section row

- position: index in page order (0 = first)
- role_in_page: opener, context, proof, convert, close
- prev_type / next_type: neighbour section_types
- site_type_v2 + vibe_* copied onto row (site-level joins)
- structure_hash of parent site

## VECTOR rows per section

- vec_clip: CLIP ViT-B/32 image vector (existing)
- vec_topo: 512d topology signature (existing pass)
- vec_text: nomic-embed-text over section copy/labels (ollama, local)
- vec_tags: one-hot over closed-vocab fields (metadata filtering)
- query joins: cosine(vec_clip) OR filter(vec_tags) OR hybrid

## SITE prompt rule (for the vibe pass)
Same SITE_PROMPT contract as vlm_site_type.py — JSON out, closed vocab
only, evidence field = comma-separated visual cues that justify the
labels. Unknown → "other" with low confidence, NEVER invent a label.
