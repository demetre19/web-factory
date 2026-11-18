---
id: rules-W
type: rules
links:
  used_in: [w3, w5, w8]
---

## W. Writing — interface copy as a closed system

Source: operator UX-writing SOP (`research/sop-sources/
SOP-UX-WRITING.md`). Copy is functional — every word is load-bearing
interaction, never decoration. Badly structured copy traps readers in
F-pattern scanning; clear headings + bullets enable layer-cake
scanning. Three tiers: **microcopy** (buttons, labels, errors,
tooltips, placeholders, empty states — the rules below govern this
tier hardest), **short-form** (2–3-paragraph blocks), **long-form**
(docs/policy/guides only — a brochure page is never long-form).

### W.1 Voice is constant; tone is a context selection

Brand voice stays fixed; tone is picked per interface context along
four NN/g axes: funny↔serious, formal↔casual,
respectful↔irreverent, enthusiastic↔matter-of-fact.

| Context | Humor | Formality | Deference | Energy |
|---|---|---|---|---|
| hero / landing | serious–mild | casual | respectful | enthusiastic |
| onboarding / tour | mildly funny | casual | respectful | enthusiastic–matter-of-fact |
| form labels / inputs | serious | casual | respectful | matter-of-fact |
| errors / failures | **strictly serious** | casual–formal | **highly respectful** | matter-of-fact |
| success / confirm | mildly funny | casual | respectful | moderate enthusiasm |
| legal / privacy | **strictly serious** | formal | respectful | matter-of-fact |

Tone → vocabulary mapping:

- **Casual** = contractions + plain words + simple sentences.
- **Formal** = zero contractions, precise terms — but still plain
  (`use`, never `utilize`).
- **Matter-of-fact** = declaratives only; no exclamation points, no
  subjective adjectives (`amazing`, `incredible`), no promo filler.
- **Respectful-failure** = never blame the user. `Passwords must be
  at least 8 characters`, never `You entered an invalid password`.

### W.2 CTAs — the verb-first formula

`CTA = Actionable Verb + Clear Expectation + Communicated Value`.

- **Verb-first, always** — no label opens with a noun or filler word.
- **2–4 words**; 1-word only for system actions (`Save`, `Close`).
- **Outcome, not process**: `Book a clean` not `Submit application`;
  `Create free account` not `Process registration`.
- **Person is a pick**: first-person (`Get my quote`) converts better
  in personal transactional flows; second-person (`Manage your
  account`) for account contexts. Pick one per flow — never mix.
- Hierarchy: **primary** CTA names the explicit outcome; **secondary**
  uses process-neutral copy; **tertiary** = a link under W.7.

Banned CTAs — lint-refused, replaced by pattern:

| Banned | Replacement pattern | Example |
|---|---|---|
| Submit | verb + object | `Send message`, `Save changes` |
| Click Here | verb + destination | `Download pricing guide` |
| Learn More | verb + subject | `Explore service plans` |
| Get Started | verb + immediate step | `Create free account` |
| Read More | verb + title | `Read the full case study` |
| pseudo-"Book" | transparent next action | `Request a quote` (if it's a contact form) |

Every CTA and link passes the **4 S's**: Specific, Sincere,
Substantial (survives out of context), Succinct.

### W.3 Headings & field labels

- **Claim headings** (marketing/landing): a complete thought, benefit
  first — `Reduce onboarding time by 50%`.
- **Label headings** (nav/forms/utility): short noun or task phrase —
  `Account settings`, `Payment method`.
- **Sentence case everywhere** — headings, subheads, labels. Title
  case is a refuse.
- **Stand-alone survival test**: every heading is meaningful read in
  isolation. `Overview` / `Important information` are defects;
  `Quarterly revenue breakdown` passes.
- **Field labels**: noun-first short phrases; **no colons**;
  **top-aligned** above the input; never rely on placeholders (W.4).
- **Eyebrow tags**: ≤3 words, unambiguous category (R.4's cap agrees).

### W.4 Placeholders, tooltips & progressive disclosure

- **Placeholders are format examples only** — `e.g.,
  name@example.com`. Instructions, constraints, or required format
  rules inside a placeholder = defect (they vanish on input and look
  pre-filled). Persistent rules live in **helper text** above/below
  the field.
- **Tooltips**: never carry task-critical information; ≤1 sentence,
  ≤15 words; primarily for unlabeled icons — but a static text label
  is always preferred over a tooltip.
- **Progressive disclosure**: T1 essentials visible → T2 behind
  accordions/tabs/"More" → T3 advanced via secondary dialog.
- **"Prevents the question"**: any sensitive or unexpected field
  (phone, ID) carries inline why-we-ask helper copy *before* the user
  hesitates — `We use your number only to send booking confirmations`.

### W.5 Errors — neutral fact + remediation

`Error = What happened (neutral) + How to fix it (explicit step)`.

Banned phrases — lint-refused:

| Banned | Replacement pattern | Example |
|---|---|---|
| Invalid input | requirement + format example | `Enter a valid email, e.g. name@domain.com` |
| Error / Failure | what failed + resolution | `Unable to save changes. Check your connection and try again.` |
| Something went wrong | specific issue + recovery | `Payment failed. Verify card details or try another method.` |
| You entered a wrong… | neutral requirement + recovery | `Incorrect password. Try again or reset it.` |
| Field required | name the missing data | `Enter your billing address to continue.` |

- **Tone under failure**: calm, matter-of-fact; no humor, no sarcasm,
  no over-apology, no blame (W.1 matrix).
- **Placement**: inline below the field, high-contrast `err` color +
  error icon (C.1 `semantic.err`); a summary banner at top only for
  multi-step forms with hidden errors, each item linked to its field.

### W.6 Empty states & confirmations — the triads

- **Empty state triad** (all three required): Context (why it's
  empty) + Value (why the feature matters) + Action (CTA to
  populate).
- **Confirmation two-part**: What happened (`Your booking is
  confirmed`) + What next (`We emailed details to name@example.com`).
  Success screens give secondary utility (receipt, manage settings,
  return path) — never a dead end.

### W.7 Links & navigation — information scent

Front-load the keyword; the label mirrors the destination H1;
breadcrumbs = exact page titles as noun phrases. Banned: `Click
here`, `More info`, bare URLs/`<Link>`, poetic vagueness (`Restoring
vision and hope` → `Read about our eye-care initiative`). Nav labels
are shortened labels — the URL=H1 lock binds the route, not the label
(factory build rule).

### W.8 Concision — the numeric bounds

- **Reading level ≤ grade 8** — specialists included; plain language
  reduces cognitive load even for experts.
- **50% web reduction**: copy adapted from print is halved before
  shipping.
- **Sentences ≤15–20 words**; split longer ones.
- **Active voice only** — `We sent a code to your email`, never
  passive.
- **Digits, not words** — `3`, `15`, `100`; digits attract fixations.
- **Bullets, 4 rules**: ≥3 related items → list; uniform line
  lengths; parallel grammar (same part of speech, all sentences or
  all fragments); unique initial word per item.
- **Vocabulary floor**: `use` not `utilize`; `to` not `in order to`;
  `help` not `assistance`; `create` not `formulate`; `about` not
  `pertaining to`; `end` not `terminate`.
- **Jargon banned** — internal buzzwords and obscure acronyms.
  Domain technical terms are legal when the persona owns them.

### W.9 Localization-ready copy

- **No string concatenation** — full parameterized strings only
  (`Select {count} items`), never code-joined fragments.
- **30–50% expansion buffer** — translated strings run longer;
  layouts absorb it without wrapping the CTA.
- **No text in graphics** — all copy is inspectable text via CSS.
- **Culturally neutral** — no idioms or sports metaphors (`ballpark`,
  `touch base`).
- **Formats**: dates unambiguous (`Mar 4, 2026` / `YYYY-MM-DD`,
  never `03/04/2026`); currency symbol + code (`USD $50`); phone
  with country code (`+1 (555) 019-2834`).

### W.10 Writing QA — mechanical checklist

- [ ] Every CTA verb-first, 2–4 words, names an outcome; zero banned
  CTAs (`Submit`, `Click Here`, `Learn More`, `Get Started`,
  `Read More`)
- [ ] Headings sentence-case; every heading passes the stand-alone
  test; field labels noun-first, top-aligned, no colons
- [ ] Placeholders carry format examples only; tooltips ≤15 words and
  no critical info; sensitive fields have why-we-ask helper
- [ ] Every error = neutral fact + explicit remediation; zero banned
  phrases, zero user-blame
- [ ] Empty states carry context + value + action; confirmations =
  happened + next
- [ ] Links front-loaded, mirror destination H1, pass the 4 S's
- [ ] Copy ≤ grade 8; sentences ≤20 words; active voice; digits for
  numbers; bullets obey the 4 rules
- [ ] No string concatenation, no text-in-graphics, no idioms; dates/
  currency/phone in unambiguous formats

---

## Enforcement

| Rule | Mode | Check / rubric | Threshold that FAILs | Wave |
|---|---|---|---|---|
| W.1 | reviewer | `tone-errors` | voice constant, tone contextual | w8 |
| W.2 | script | `check_system_enums` | cta_person ∈ {first,second}, verb-first 2–4w | w3 |
| W.3 | reviewer | `heading-labels` | sentence-case standalone headings | w8 |
| W.4 | script | `check_section_enums` | disclosure ∈ {open,collapsed,tabbed} | w5 |
| W.5 | reviewer | `tone-errors` | errors neutral + remediation | w8 |
| W.6 | reviewer | `empty-states` | empty-state triad | w8 |
| W.7 | reviewer | `link-scent` | links front-loaded, scent preserved | w8 |
| W.8 | script | `check_system_enums` | reading_level ≤grade-8 | w3 |
| W.9 | reviewer | `i18n-copy` | no concat, no idioms | w8 |
| W.10 | reviewer | `writing-qa` | W QA sweep | w8 |

## Links

- W.2 → E.2 (CTA copy ↔ heading classes)
- W.4 → P.3 (disclosure ↔ data-disclosure)
