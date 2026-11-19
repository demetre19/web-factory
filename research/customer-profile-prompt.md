# customer-profile-prompt — canonical template (owner: S2)

This file is the reviewed shape of `site/customer-profile.md` and the
prompt that produces it — the same contract
`research/company-description-prompt.md` carries for its artifact.
The S2 lane copies this file's output template, fills `[SOURCE]` from
`site-brief.md` (entity, `audience:`, `differentiator:`, `services:`,
geography) plus `sitemap.md`'s intent map, and emits one customer
profile per site.

`site/customer-profile.md` is the **single reviewed source for audience
and conversion psychology**: the plan's `pain_point` column references
it by ID (S2), writer lanes bind each page to one persona + one
emotional hook (S3), the trust line renders verbatim into the hero
trust strip (S5), and the four-question above-the-fold contract it
defines is re-verified at the gate (S7).

## Generation contract

- **Personas:** ≥5 distinct target audiences, each a table row —
  name, circumstance, pain points the business resolves, what the
  site must prove to them. Plain text inside tables, no markup.
- **Pain points:** each persona carries ≥7 pain points beyond its
  table row, written with situational specificity — the circumstance
  behind the pain, not a generic restatement. Every pain point gets a
  stable ID (`PP-<n>`) so plan rows can reference it.
- **CRO bank:** 10 one-big-idea headline directions, 10 USP
  painkiller framings, 15 Ogilvy-style subheads, 10 trust
  variations, 3 emotional hooks × 3 variations, 10 differentiator
  sentences — all bound to the personas' pain points, all in the
  voice the tone profile declares (the profile is generated *after*
  `tone-profile.md` so the bank reads in voice).
- **Facts:** the profile fabricates no entity facts — pain points and
  personas are *inference* from the brief's niche/audience fields,
  which is legal; credentials, claims, and numbers in the trust
  block must trace to `site-brief.md` or they are omitted (same rule
  as every stage).
- **Output shape:** frontmatter-free markdown, sections in the order
  below, closing `## Provenance` naming the source blocks used.

## The prompt (the lane fills the slots, then executes it)

```text
You are a conversion copywriter and [TOPIC] market analyst working
from the business brief below. Produce the site's customer profile —
the audience document every page will be written against. Information
only: no intro, no conclusion, no self-reference.

TASK ONE — "TARGET AUDIENCES": create ≥5 distinct target audiences as
a markdown table (plain text cells only). For each: persona name,
their circumstance, the pain points they carry, what this business
must prove for them to act.

TASK TWO — "PERSONA PAIN POINTS": for each persona list ≥7 additional
pain points with deep situational specificity — the moment, cost, and
fear behind each pain. Give every pain point a stable ID (PP-1, PP-2,
…) in discovery order.

TASK THREE — "THE CRO BANK": using the pain points above, produce —
(a) 10 one-big-idea headline directions (one sentence each, the single
enticing idea that would choose this business over competitors);
(b) 10 "what's in it for them" USP sentences framing the offer as a
painkiller, not a vitamin;
(c) 15 Ogilvy-style subheadings that follow logically from the
headlines;
(d) 10 trust variations — one punchy sentence + one short paragraph
each answering "why should the client trust you?", each unique in
tone and lexical structure, emotional hooks inside logical arguments,
no hyperbole;
(e) 3 distinct emotional hooks for the sales spine × 3 sentence
variations each, threaded with [SEED KEYWORDS] and a second closely-
related keyword set you derive from them;
(f) 10 differentiator sentences — what makes the offer unique and why
the customer benefits, consistent in voice with the rest of the bank.

TASK FOUR — "THE FOUR QUESTIONS": restate the site's above-the-fold
contract for this business — the answer every page's hero must give,
in this business's voice:
1. Am I in the right place? (what you do / who it is for)
2. Can you solve my problem? (the pain → offer mapping)
3. Can I trust you? (the proof the brief actually supports)
4. What do I do next? (the single CTA)

Rules: customer-centric throughout; write in third person, warm and
clear, Hemingway style, no filler; never use the phrases "unique
selling proposition", "pain points", "ideal customer", "painkiller",
or the company-size in the bank copy itself; trust claims only what
[SOURCE] supports — no invented reviews, numbers, or credentials.

[TOPIC] = <brand + niche — site-brief.md `brand:` + `niche:`>
[SEED KEYWORDS] = <top head terms across sitemap.md `target_keywords`>
[SOURCE] = <site-brief.md entity fields + audience: + differentiator:
            + services: + geography, verbatim; sitemap.md intent map>
```

## `site/customer-profile.md` output shape

```markdown
## Target audiences
| persona | circumstance | pain points | must prove |
|---|…≥5 rows…|

## Persona pain points
### <persona name>
- PP-1 …
- PP-2 … (≥7 per persona)

## The CRO bank
### One big idea (10)
### What's in it for them (10)
### Subheadings (15)
### Trust variations (10: sentence + paragraph)
### Emotional hooks (3 × 3)
### Differentiators (10)

## The four questions
1–4 restated for this business

## Provenance
- source blocks used: site-brief.md fields, sitemap.md intent map,
  tone-profile.md voice
- persona count: <n>; pain-point count: <n>
```

## Binding rules for consumers

| Consumer | Rule |
|---|---|
| S2 (content plan) | every plan row's `pain_point` cell references one `PP-<n>` ID + the persona — the row's loop-back to the audience document; an ID that does not exist in the profile is a defect |
| S3 (writer lanes) | each page's copy binds to its row's persona: one customer, one idea, one CTA (Rule of One); money pages flow AIDA over the bound pain point; the hero block answers all four questions above the fold; trust sentences may be lifted from the bank verbatim or adapted in voice — never extended with facts the brief lacks |
| S5 (build) | the hero module is a named `COMPONENTS.md` row — H1 + standfirst + primary CTA + trust strip; trust-strip copy comes from the profile's trust block or `site-brief.md`, never invented at build |
| S4 (cleanup) | profile-referenced copy in content files is not slop — persona/PP language is the page's contract; cleanup never strips it, flags contradictions instead |
| S7 (gate) | check 22 — the four-question fold contract on every page |

## Contested

- **Why S2 and not S0 intake?** The profile is *generated copy*, not
  operator input — same split as `company-description.md`. The brief
  supplies the audience fields; the profile is the reviewed expansion
  of them into personas, pain points, and a bank the writers can
  lift from.
- **Why IDs on pain points?** The plan needs a machine-checkable
  reference (`PP-<n>` exists ⇒ lint passes). Freeform cells can't be
  diffed across plan/profile; IDs make "content loops around pain
  points" a verifiable contract instead of a posture.
- **Dropped operator-prompt bits.** The original exploratory prompts'
  decorative requirements — "burstiness/perplexity 80%",
  `[Process Complete]` markers, per-prompt persona theater
  ("world-famous copy writer"), the 1200–2000-word Task FOUR
  introduction — are dropped: the first three have no lintable
  meaning, and page body copy is S3's job per row, not the profile's.
  The *substance* (audiences, pain points, hooks, USP, trust, four
  questions) all survives in the bank.
- **Rule of One + AIDA fixed, not chosen.** The operator picks the
  pairing once — Rule of One narrows each page to one customer/idea/
  CTA; AIDA is the general money-page skeleton. Articles ride the
  informational skeleton they already have; the framework choice is
  a per-site constant, not a per-page option, so writer lanes don't
  drift on it.
