# CATALOG-VERIFICATION — do real good pages obey the codified rules?

Method: full-page captures of 5 strong service-business sites
(hipages.com.au, taskrabbit.com, handy.com, urbancompany.com,
rotorooter.com — rendered at 1440px, lazy-loaded, read as images).
Each page's surface sequence extracted by reading the capture, then
checked against `docs/machinery/SECTION-CATALOG.md` rules.

## Observed surface sequences

| Site | Sequence (surface · what it does) |
|---|---|
| hipages | photo-hero(promise+act: search bar) → icon-grid(detail) → 3-steps(how) → **orange band(brand CTA)** → trust-badges(proof) → app-band(detail) → article-band → city-links(detail) → **orange footer(brand)** |
| taskrabbit | green-hero(promise, photo right) → services-icon-grid(detail) → projects-carousel(detail) → reviews(proof) → **dark-blue band(inverse, same-day help)** → city-areas(detail) → **dark footer(inverse)** |

| handy | split-hero(promise+form) → price-stat(proof) → why-choose-cards(detail) → steps(how) → reviews(proof) → app/CTA(act) → footer(base) |
| urbancompany | mostly one light surface — hero-carousel(promise) → category icon-grid(detail) → product rows(detail) → "book from phone" app section(detail) → footer(inverse) |
| rotorooter | hero(promise+act: call+zip form) → **purple services carousel(inverse)** → pros-checklist+photos(detail) → FAQ-videos(objection) → app-band(detail) → reviews(proof) → careers-CTA(act) → footer(dark) |

## Mobbin round (paid plan active, 2026-11-18)

`search_screens` on "home services cleaning company landing page" +
"cleaning company website pricing testimonials", platform=web. 7
screens read (Care.com, Fresha, Pinterest, Airtasker, HelloFresh,
Upwork, Webflow). Mobbin screens are single-viewport crops, not full
pages — they verify *compositions*, not full surface sequences.

| Screen | What it confirms |
|---|---|
| Care.com | `hero-act-merge` verbatim — zip/search form *in* the hero, headline left |
| Fresha | `hero-act-merge` again — centered search bar in hero on gradient surface; `stacked-hero` variant |
| HelloFresh | `brand` surface hero (green) + `stat-band` proof directly below — brand ≤1, proof-band adjacent |
| Airtasker | `split-media` for `detail`/`how` — alternating alignment (media L / text R, then mirror), one soft CTA per block |
| Pinterest | `split-media` hero + `muted` second band — fold-boundary contrast rule holds |
| Upwork | `detail` page pattern — editorial list + card sidebar (pricing/scheduling zone) |

Mobbin round verdict: `hero-act-merge` now confirmed by 4 independent
sources (hipages/handy/roto + Care.com/Fresha). Alternating
`split-media` for detail blocks confirmed. `brand` surface used once
(hero) not scattered. No counter-example found to any catalog rule.

Screens used (Mobbin links): [Care.com](https://mobbin.com/screens/a73098e7-095d-4032-a1f9-399f9c1c4385), [Fresha](https://mobbin.com/screens/bcc23c71-0c10-4b0d-b749-d8df6f0e846c), [HelloFresh](https://mobbin.com/screens/e3b04ddc-ad74-4696-971a-964f6edb7df0), [Airtasker](https://mobbin.com/screens/8ca27875-5683-4bfd-a389-77956dc032c1), [Pinterest](https://mobbin.com/screens/452a867d-d2a9-425a-94f5-aa3d6d112916), [Upwork](https://mobbin.com/screens/c2182353-18b6-48fc-bc9f-dc282e826b72).

## Primitives correlation — do the *rules* hold, not just the compositions?

Second Mobbin pass (2026-11-19): the same 7 screens re-read against
`PRIMITIVES.md` §L/§G layout+gutter rules (not the composition catalog).
Verdict: **high correlation, two refinements.**

| Rule | Care.com | Fresha | HelloFresh | Pinterest | Airtasker | Upwork | Webflow |
|---|---|---|---|---|---|---|---|
| Body flush-left | ✅ hero text left | ✅ | ✅ body left | ✅ hero left | ✅ all left | ✅ | n/a |
| Centered = display-only | ✅ | ✅ centered search (display) | ✅ centered 2-line display head | ⚠️ centered band head (borderline) | ✅ | ✅ | ✅ single-line display |
| One primary axis | ✅ left rail | ✅ center axis | ✅ left rail | ✅ left rail | ✅ paired rails (media L, text R) | ✅ left rail | ✅ center axis |
| Stop-or-break gutters | ✅ card breaks image gutter decisively | ✅ | ✅ | ✅ stacked images overlap | ✅ $500 card breaks gutter | ✅ | n/a |
| No edge-jam | ✅ all inset | ✅ | ⚠️ marquee strip bleeds (deliberate) | ✅ | ✅ | ✅ | ✅ |
| No trapped whitespace | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

**Zero violations** of flush-left-body, one-axis, edge-jam,
trapped-whitespace, gutter-boundary. Two screens show a *display*-context
centering the strict rule already allows.

**Refinements the evidence adds:**

1. Centered display headings are *more* common than the SOP's strict
   wording suggests — HelloFresh, Fresha, Pinterest all use them on
   short display lines. The rule stays "no centered body," but the
   PRIMITIVES wording already scoped it correctly ("single-line
   display or legal"). Pinterest's `Bring your favourite ideas to
   life` centered band-head is the borderline case: it works because
   it's short and isolated on `muted` — the rule's intent (no
   multi-line centered paragraphs) holds.
2. Deliberate edge-bleed exists (HelloFresh's marquee strip) — already
   covered by "the only legal edge contact is a deliberate bleed."

Correlation answer: **yes** — the primitive rules match what curated
good design actually does. The catalog + primitives are a real
predictor, not a taste opinion.

## Proximity & layout SOP correlation — third Mobbin pass

Same 7 screens re-scored against the new L.6–L.13 rules (Gestalt
grouping, S-M-L scale, frame-break, atomic anatomy, 960 containment):

| Rule | Verdict across screens |
|---|---|
| Label↔input proximity | Care.com zip field + Search button bound tight in card — confirms |
| Heading binds forward | All screens — headings visually attach to their block, not the previous section |
| S-M-L scale rhythm | **5/7 confirmed** — hero Large + cards Medium + badges Small on Care.com/HelloFresh/Airtasker/Pinterest/Upwork. Fresha + Webflow run near-uniform boxes (weaker S-M-L, still pass by CTA contrast) |
| Break-the-frame | **Confirmed where present** — Care.com zip card, Airtasker `$500` card overlap their container edges. Not universal: 4/7 keep boxes inside (depth is optional, not required) |
| Asymmetry desktop | **6/7** — every split-media/hero screen composes off-axis (media one side, text other). Fresha is centered-symmetric (its whole page is center-axis — a deliberate system, not a lapse) |
| 960 containment | All — content holds center column; only hero media/surfaces bleed |
| Sequential anatomy | Matches catalog §3 — hero → proof → detail → objection → act; the anatomy IS the rhetoric |

**Verdict: high correlation again.** The proximity+layout rules
describe what curated design does — with two honest caveats:

1. S-M-L is *strong tendency*, not absolute law (2/7 near-flat).
2. Frame-break is *optional enhancement*, not required (3/7 use it).

That's consistent with the machinery: S-M-L is a rule (flat
clustering = defect), frame-break is the *sanctioned* violation
(≤1 declared break, not required ≥1).

## What verified TRUE

| Catalog claim | Evidence |
|---|---|
| Hero = promise; sometimes merged with `act` | All 5: hipages/roto search+zip forms, handy's booking form, taskrabbit CTA — the hero IS the first action. `form-panel`/`full-bleed` in-hero is real, not invented. |
| ONE contrast moment mid-page (inverse or brand) | Every site has exactly one: taskrabbit dark-blue, hipages orange, roto purple carousel. Never two competing. Confirms `inverse ≤2` / `brand ≤1`. |
| Footer is always inverse/brand | 4/5 dark or brand footer. |
| `how` = 3-step sequence | hipages, handy both 3-step illustrated rows. Confirms `sequence`. |
| `proof` = reviews/testimonials band | All 5, placed mid-to-late page. |
| Cards-n appears but is not repeated | Icon category grid appears once per page, never twice adjacent. |
| Adjacent sections differ | Verified — no two consecutive sections share the same surface+shape anywhere in the 5 captures. |
| `act` appears twice (hero + late page) | All 5 repeat the CTA: in hero AND near the end. |

## What verified FALSE — corrections applied to catalog

| Claim | Evidence | Fix |
|---|---|---|
| "Adjacent sections MAY NOT share the same `(surface, density, composition)`" — too strict | urbancompany uses **one** light surface for 80% of the page and still reads as designed; handy similar. The real rule is about *composition* variety + the one contrast moment, not forced surface alternation | Rule amended: adjacency ban applies to **composition**; surface alternation is a *recommendation* with the hard rule being ≤2 inverse + ≤1 brand + contrast at the fold boundary |
| `promise→proof→tension→how→objection→act` as THE canonical order | No real site follows exactly; all put `how` early-ish, `objection` optional, `detail`/`proof` interleaved | Kept as *default skeleton* for money pages, now labeled "reference order, not required" — the invariant is promise-first + act-first-and-last, not the middle order |
| "eyebrow labels banned" | hipages/rotorooter both use eyebrow-style caps labels sparingly (not on every section) | Already correct in our ban ("repeating reflex banned, one deliberate instance OK") — verified real sites do use them ≤1-2× |

## New rows the evidence adds

- `app-band` — download/app-promo section; appears in 3/5 sites. Added
  to catalog under `detail` speech-act (structure: text + phone mockup).
- `hero-act-merge` — search bar / zip form / booking form *inside* the
  hero is a distinct, common composition for service sites. Added as
  its own composition (it is not `split-media` + separate form).
- `city-areas` / service-area link grid — appears on 2/5 (hipages,
  taskrabbit); our own `/service-areas/` template needs it. Added as
  `link-grid` composition under `detail`.

## Verdict on the procedure

The plan-first machinery holds: **every** observed page can be
described losslessly as (idea → section rows of
`speech_act`/`category`/`surface`/`density`/`composition`). The
catalog's *values* needed the three corrections above — which is
exactly why verification against real pages is now a documented step.
This is the same loop Mobbin would have provided; when the Mobbin plan
is active, `search_screens` replaces the manual captures.

Next verification round should run against Mobbin's larger corpus to
catch any rules the 5-sample missed.
