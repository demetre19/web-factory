# audit.md — Whistle Clean Australia (audit-remodel, S5 distill input)

- Evidence: captured HTML in `refs/` (01-index, 02-cleaning-services, 06-reviews, 07-contact, 08-office-cleaning-melbourne). Text evidence only; captures not executed.
- Operator direction: clean, professional, corporate — commercial cleaning only (offices & events, NOT domestic); Zen and clear, lots of room to breathe; keep deep-teal accent `#186F64` (client-corrected — replaces the golds `#ffc10a`/`#ffd64f` found on the current site).
- Every issue is framed as **correct, don't replicate** for the distill lane.

## Inferred intent
- Primary user: facilities manager / office admin / executive assistant at a Melbourne business, vetting a commercial cleaning vendor on reliability and communication. Decidedly B2B — not a homeowner.
- Primary action: qualify fit in <30s, then "Request a Quote" / "Book A Consultation" (a 3-step funnel: contact form → 10-min discovery call → on-site appointment).
- Worst case being designed against: the buyer reads "Cleaners Melbourne," sees domestic/DIY cues and CTA churn, classifies the company as a residential cleaner, and bounces to a corporate-positioned competitor.

## Issues

| # | Severity | Issue | Why it matters | Fix |
|---|----------|-------|----------------|-----|
| 1 | P0 | Homepage `<h1>` is "Cleaners Melbourne"; `<title>` is keyword stuffing: "Cleaners Melbourne \| Whistle Clean Australia \| Office Cleaning Melbourne \| Commercial Cleaning Melbourne \| (03) 7003 2223 \| … \| House Cleaners Melbourne \| Residential Cleaners Melbourne \| …" | The single highest-weight element announces a generic/domestic cleaner. Corporate buyer can't confirm "commercial-only" in 3 seconds; title also mixes Domestic/House/Residential keywords against positioning | H1 becomes a positioning statement, e.g. "Commercial cleaning Melbourne trusts" or "Immaculate workplaces, quietly maintained" (as in `variant-d-zen-corporate.html`). Title: "Commercial & Office Cleaning Melbourne — Whistle Clean Australia". Remove all Domestic/House/Residential terms from titles, H1s, and `knowsAbout`/JSON-LD keyword arrays (they currently list "Residential Cleaning", "House Cleaning" service types) |
| 2 | P0 | CTA vocabulary churns across pages: header "Book A Consultation" (href `/?p=571?utm_source=header…` — ugly permalink), hero "Request a Quote", cards "Book Your Office Clean", footer "Contact Us", mobile buttons "Call" and "Review". Three phone numbers coexist: `tel:0380073133`, `tel:0893152060`, display "(03) 7003 2223" | Buyer can't tell whether quote, consult, or call is THE action; wrong/old numbers erode the exact trust the copy sells ("reliability") | One verb, everywhere: "Request a quote" → `/contact`. Secondary: "Call (03) XXXX XXXX" with a single canonical number in header/footer/`tel:` links. "Review" is not a prospect CTA — move it to footer or post-service touchpoints. Point the header CTA at a clean URL |
| 3 | P0 | Density contradicts "room to breathe": homepage carries 59 headings including a 20-suburb "Office Cleaning Locations" card grid, 6 service cards, a 14-item "Natural Cleaning Guides" section, and a 5-column footer. Suburb grids repeat on services and service-detail pages | SEO scaffolding dominates the visual page; nothing breathes; hierarchy collapses under sheer count. This is the anti-Zen pattern | Collapse suburb coverage to one line ("Servicing greater Melbourne") or a single linked "Service areas" page — never 20 cards. Drop guides from the homepage entirely. Target ≤6 H2s per page; generous `space.xl/2xl` section padding per the zen-corporate tokens |
| 4 | P1 | Domestic/consumer surface signals: "Natural Cleaning Guides" block lists "The Complete Guide to Castile Soap for Home Cleaning", "…Sal Suds for Home Cleaning", "Essential Oils for Cleaning: A Complete Guide to Natural Home Care"; tagline "Cleaning with love and integrity"; `knowsAbout` includes Residential/House/Deep cleaning; service cards include End of Lease and Carpet Steam | Consumer DIY content and love-language read as a home-cleaning brand; each domestic item is a bounce trigger for a corporate evaluator | Distill lane: remove guides section (consumer blog), cut or quarantine domestic-flavored services (End of Lease is bond-cleaning = residential adjacency; Carpet/Window can stay only as commercial services under a facilities framing). Replace tagline with corporate register, e.g. "Reliable, sustainable, customised for your workplace" (already exists in hero sub — promote it) |
| 5 | P1 | "What's the Definition of Cleaners?" section on homepage answers with wellness copy: "Cleaners bring light, oxygen, clarity and harmony into each space…" | A definition section exists to rank for a keyword, not to help a buyer; the answer is off-register for corporate procurement | Delete the section. If the spiritual language is genuine brand voice, confine it to Our Values — never the homepage decision path |
| 6 | P1 | Gold accent is unstable: brand primary `--bricks-color-primary:#ffd64f`, tokens reference `#ffc10a`, review-widget stars render `#f7b80c`/`#ffb542`, WP preset amber `#fcb900` also loaded; `--bricks-color-secondary:#fc5778` is hot pink | Four+ near-golds and a pink secondary = muddy accent, no single "brand accent". Under the new system (#FFC10A accent) this is off-system drift | Lock one accent token `--accent:#186F64` (teal, client-corrected) (text-safe variant on light bg as needed); use it ONLY for primary CTA, focus rings, and rating stars. Remove the pink secondary from the palette |
| 7 | P1 | Reviews page: near the top, "Write a Review" button (links to Google write-review) sits beside "Read all Reviews"; stars are widget-yellow not brand gold | Page's loudest CTA serves existing customers, not the prospect the page is for | Prospect CTA first ("See why businesses rely on us" → testimonials → "Request a quote"). Demote "Write a Review" to a small text link at page end. Recolor stars to the single teal accent |
| 8 | P2 | Contact form requires 8 fields: Company Name*, Street address*, Suburb*, First Name*, Last Name*, Email*, Phone/Mobile*, service dropdown, Your Message* — placeholders double as labels ("Company Name*") and submit reads "Send ›" | Every required field is abandonment friction at the conversion point; street address before a discovery call is premature; "Send" is a non-verb | Reduce to 4: Name (single field), Work email, Phone, Service (dropdown kept — it's good qualification), Message optional. Move address capture to the discovery call. Labels above fields, `autocomplete` hints, submit: "Request my quote →" |
| 9 | P2 | Process block has two `<h2>Step 3</h2>` headings: Step 1 form → Step 2 discovery call → Step 3 on-site appointment → **Step 3** "Quote in 24 hours" (duplicated on index and office page) | Visible QA defect; breaks the 4-step sequence the copy intends | Renumber to 4 steps, or fold "Quote in 24 hours" into the Step-3 card as an outcome badge. Either way: one label per step |
| 10 | P2 | Top nav is "Cleaning Services · Careers · Our Team · Our Values · Reviews" — Contact absent; inward-facing items (Careers, Team, Values) occupy prime slots | Corporate buyer's next step (Contact) isn't in the nav; recruiting links compete with conversion links | Nav: Services · Reviews · About (rollup of Team/Values) · Contact. Contact as the right-most item styled as the accent CTA button. Careers → footer |

## Top 3 to fix first

### 1. Reposition the H1/title and purge domestic vocabulary (P0)

The current `<h1>Cleaners Melbourne</h1>` + keyword-stuffed `<title>` (containing "House Cleaners Melbourne", "Residential Cleaners Melbourne", "Domestic Cleaners Melbourne") directly contradicts the commercial-only direction. In the distill:

```html
<!-- Before -->
<title>Cleaners Melbourne | Whistle Clean Australia | … | House Cleaners Melbourne | Residential Cleaners Melbourne | …</title>
<h1>Cleaners Melbourne</h1>

<!-- After -->
<title>Commercial & Office Cleaning Melbourne — Whistle Clean Australia</title>
<h1>Immaculate workplaces, quietly maintained</h1>
<p>The team that shows up, does it right, and backs it with a real guarantee.</p>
```

Audit checklist for distill output: no "domestic", "house", "residential", "home cleaning", "bond" anywhere in titles, H1–H2, service names, nav, or JSON-LD `knowsAbout`/service lists. Corporate register throughout — "workplace", "facility", "tenancy", "clinic".

### 2. Single CTA verb + single phone number (P0)

Correct, don't replicate: today the site asks the buyer to choose between "Book A Consultation", "Request a Quote", "Book Your Office Clean", "Contact Us", "Call", "Review", and dials three different numbers depending on where they click.

```html
<!-- Every page, one pattern -->
<nav>… <a class="btn" href="/contact">Request a quote</a></nav>
<!-- Hero -->
<a class="btn" href="/contact">Request a quote</a>
<a class="btn ghost" href="tel:03XXXXXXXX">Call (03) XXXX XXXX</a>
```

Rules: primary CTA label identical on every page; one canonical `tel:` target used in header, footer, contact page, and JSON-LD `telephone`; the header CTA points at `/contact` not `/?p=571?utm…`; "Review" and other customer-side actions are demoted out of prospect paths.

### 3. Cut density: remove suburb card-grids and the guides block (P0)

The 20-card "Office Cleaning Locations" grid (repeated on 3+ pages) and the 14-item "Natural Cleaning Guides" section are SEO scaffolding rendered as page furniture — they consume the whitespace the redesign is for.

- Locations → one quiet strip: "Servicing offices across greater Melbourne — Abbotsford to Yarraville." Link the phrase to `/service-areas` (keep the near-me pages for SEO, but never as 20 homepage cards).
- Natural Cleaning Guides → removed from the homepage (and ideally the distill entirely — it's consumer DIY content).
- Section budget: hero → trust strip → 3–6 service cards → process (renumbered) → reviews → single closing CTA. That's ~6 H2s versus the current 59 headings.

## What's working
- The 3-step qualification funnel (form → 10-min discovery call → on-site → quote in 24h) is genuinely good B2B copy — keep the steps, fix the numbering.
- Service-card CTAs use action verbs per service ("Book Your Office Clean", "Protect Your Childcare Centre") — the verb-forward pattern is right; unify under one primary label but keep the flavor in card copy.
- Eco differentiation is real and corporate-relevant: 90% eucalyptus-oil biodegradable products, one tree planted per client, Brownee eco certification — keep as a differentiator card.
- Named human contact ("liaise with Ivan and know that everything is being looked after") is a strong trust asset for a B2B service — keep a named account-manager promise.
- "No lock-in contracts", "police-checked", "fully insured", "90-day check-ins", "dedicated cleaners" — exactly the objections corporate buyers raise; keep in FAQ/proof.
- Footer business-summary paragraph (founded 2014, service list, dedicated cleaners, 90-day check-ins) is solid entity copy — reuse as the basis of About/JSON-LD description.
- Contact-page form already includes a service-qualification dropdown — retain it while cutting other fields.
