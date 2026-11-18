# SOP — UX Writing & Microcopy (source)

Interface copy is functional, not decorative. NN/g scanning
research: badly formatted → F-pattern; clear headings + bullets →
layer-cake scanning. Three tiers: microcopy (buttons, labels,
errors, tooltips, placeholders, empty states), short-form (2–3
paragraph blocks), long-form (docs/policy/guides only).

1. Voice vs tone: voice constant; tone shifts by context along
4 NN/g axes (funny↔serious, formal↔casual, respectful↔irreverent,
enthusiastic↔matter-of-fact). Context matrix:
hero → serious/mild, casual, respectful, enthusiastic;
onboarding → mildly funny, casual, respectful, enthusiastic–m.o.f.;
forms/labels → serious, casual, respectful, matter-of-fact;
errors/failures → strictly serious, casual–formal, highly
respectful, matter-of-fact;
success → mildly funny, casual, respectful, moderate enthusiasm;
legal → strictly serious, formal, respectful, matter-of-fact.
Vocabulary mapping: casual = contractions + plain words; formal =
no contractions + precise (use not utilize); matter-of-fact =
declaratives only, no exclamation points, no subjective adjectives;
respectful-failure = never blame user ("Passwords must be ≥8
characters" not "You entered an invalid password").

2. CTA formula: Actionable Verb + Clear Expectation +
Communicated Value. Rules: verb-first always; 2–4 words (1-word
only for system actions like Save/Close); consistent person within
a flow (first-person "Get my quote" converts in personal
transactional, second-person "Manage your account" for account
mgmt); outcome not process ("Book a clean" not "Submit
application"). Hierarchy: primary = explicit outcome; secondary =
process-neutral; tertiary = link, front-loaded keywords.
BANNED CTAs (mandatory replacements): Submit → verb+object;
Click Here → verb+destination; Learn More → verb+subject;
Get Started → verb+immediate step; Read More → verb+title;
"Book"-that-isn't → transparent next action. 4 S's:
Specific, Sincere, Substantial, Succinct.

3. Headings: claim headings (marketing, complete thought, benefit
first) vs label headings (app/nav, noun/task). ALL sentence-case —
title case banned. Stand-alone survival test: meaningful in
isolation ("Quarterly Revenue Breakdown" not "Overview").
Field labels: noun-first short phrases; NO colons; top-aligned;
eyebrow tags ≤3 words.

4. Placeholders: BANNED for instructions/constraints — they
vanish on input, strain memory, look pre-filled. Format examples
only (e.g., name@example.com). Persistent rules → static helper
text below/above field.
Tooltips: never for task-critical info; ≤1 sentence ≤15 words;
primarily for unlabeled icons (but direct static labels preferred).
Progressive disclosure: T1 visible essentials → T2 accordions/
tabs/more → T3 advanced via modal. "Prevents the question" rule:
sensitive/unexpected fields carry inline why-we-ask helper BEFORE
the user hesitates.

5. Errors: formula = What happened (neutral) + How to fix
(explicit remediation). BANNED phrases → replacements:
"Invalid input" → requirement + example format;
"Error/Failure" → what failed + resolution;
"Something went wrong" → specific issue + recovery path;
"You entered a wrong password" → neutral requirement + reset link;
"Field required" → name the missing data.
Tone: calm/matter-of-fact — no humor, no sarcasm, no over-apology,
no blame. Placement: inline below field (high-contrast red +
icon); summary banner at top only for multi-step hidden errors,
each item links to field.

6. Empty states: triad = Context (what this is) + Value (why it
matters) + Action (CTA to populate). Confirmations: two-part =
What happened + What next (timeframe/expectation); success pages
give secondary utility (receipt, dashboard, settings).

7. Links/navigation: 4 S's. BANNED: "Click here", "More info",
bare "Link"/URL, poetic vagueness → verb+destination/topic.
Front-load keywords; link label mirrors destination H1;
breadcrumbs = exact page titles, noun phrases.

8. Concision: 6th–8th grade reading level (specialists too);
50% reduction vs print; sentences ≤15–20 words; active voice only;
digits not words (3 not three).
Bullets — 4 rules: 3+ items → list; uniform line lengths; parallel
grammar (same part of speech, all sentences OR all fragments);
unique initial words per item.
Vocabulary: utilize→use, in order to→to, assistance→help,
formulate→create, pertaining to→about, terminate→end/stop.
Jargon banned (internal buzzwords, obscure acronyms); domain
technical terms OK when persona-appropriate.

9. Localization-ready: no string concatenation (full parameterized
strings "Select {count} items"); 30–50% text-expansion buffer;
NO text-in-graphics; culturally neutral (no idioms/sports
metaphors "ballpark"/"touch base"); dates unambiguous (Mar 4, 2026
or YYYY-MM-DD, never 03/04/2026); currency symbol+code (USD $50);
phone with country code.

10. Mechanical QA (14): CTA verb-first; CTA 2–4 words; zero banned
CTAs; sentence-case headings; stand-alone headings; field labels
noun/top-aligned/no-colon; placeholders example-only; tooltip
≤15w non-critical; error = neutral fact + remediation; zero banned
error terms/no blame; empty-state triad; links 4 S's front-loaded;
reading level ≤grade 8; active voice + digits + no concatenation.
