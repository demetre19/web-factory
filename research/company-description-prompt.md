# company-description-prompt — canonical template (owner: S2)

This file is the reviewed shape of `site/company-description.md` and
the prompt that produces it — the same contract
`research/content-plan.md` and `research/tone-profile.md` carry for
their artifacts. The S2 lane copies this file's output template,
fills `[SOURCE]` from `site-brief.md`'s `## About source` block, and
emits one company description per site.

`site/company-description.md` is the **single reviewed source for all
concise business copy**: the footer blurb (S5 renders it site-wide),
the `/about/` page body (S3 embeds it verbatim), and the `description`
field of the business entity node in the site's JSON-LD graph (S5
renders it). One artifact, three render targets — a fourth use case
asks the operator for a re-write of this file, never a second
description.

## Generation contract

- **Length:** 100–200 words, one paragraph. The bound is a lint;
  S2's acceptance re-checks it.
- **Facts:** every claim must trace to `site-brief.md` fields or the
  operator-supplied `## About source` text (the business's own home /
  about-page copy). The description fabricates nothing — the same
  entity-facts rule the whole pipeline runs on.
- **Style:** encyclopedic lead-paragraph register — entity, what it
  does, where, for whom, differentiators, credentials. Short
  declarative sentences, no filler, no rhetorical flourishes, no
  first-person marketing voice. Reads like a Wikipedia intro, not an
  ad.
- **No transition crutch-phrases or hype vocabulary** — the banned
  list below is the mechanical half of this; `tone-profile.md`
  `## Banned` applies on top of it.
- **Output shape:** one markdown file, frontmatter-free — the
  description text only, followed by a `## Provenance` section
  naming the source blocks used (audit trail, same posture as
  `cleanup-report.md`).

## The prompt (the lane fills the two slots, then executes it)

```text
Your job is to write a super concise description of a company based on
the [SOURCE] that I am going to give you. Summarise it so a reader
grasps the company's most important aspects immediately — an
introduction covering only salient facts.

Rules: get to the point precisely and accurately. Be succinct and
descriptive, like a Wikipedia introductory paragraph. Correct grammar,
information-dense content only — no filler, no gibberish. 100–200
words. Do not use transition phrases. Do not use any blacklisted word
below, under any circumstances.

[BLACKLISTED WORDS]
"Additionally," "Furthermore," "Moreover," "Likewise," "Similarly,"
"As well as," "Not to mention," "On top of that," "Alongside,"
"Consequently," "Thus," "Therefore," "As a result," "Hence,"
"In turn," "Accordingly," "Subsequently," "Conversely,"
"On the contrary," "In contrast," "Nonetheless," "Nevertheless,"
"However," "Yet," "Still," "Whereas," "Albeit," "While," "Though,"
"Instead," "To clarify," "To elaborate," "In other words,"
"For instance," "For example," "Such as," "To illustrate,"
"In particular," "Specifically," "Namely," "Including," "Above all,"
"Especially," "Firstly," "Secondly," "Thirdly," "Next," "Then,"
"Finally," "Lastly," "In conclusion," "To conclude," "In summary,"
"Overall," "In essence," "The bottom line is," "Significant,"
"Crucial," "Vital," "Essential," "Pivotal," "Critical," "Paramount,"
"Fundamental," "Key," "Indispensable," "Imperative," "Primary,"
"Foremost," "Core," "Chief," "Major," "Noteworthy," "Embark on,"
"Look no further," "Navigating," "Dive into," "Delve into,"
"Deep dive," "Exploring," "Commence," "Venture into," "Initiate,"
"Undertake," "Take the plunge," "Get started," "In a nutshell,"
"In short," "That is to say," "Simply put," "Interestingly,"
"Notably," "Significantly," "It's important to note," "It's worth
mentioning," "Undoubtedly," "Clearly," "Indeed," "Needless to say,"
"It goes without saying," "Unleash," "Unlock," "Unveil," "Top-notch,"
"A breath of fresh air," "Captivating," "Optimal," "Bear in mind"

[SOURCE]
<the site-brief.md entity fields + ## About source block, verbatim>

[TOPIC]
<company name — site-brief.md `brand:`>
```

## `site/company-description.md` output shape

```markdown
<the description paragraph — 100–200 words, nothing else>

## Provenance
- source blocks used: site-brief.md entity fields, ## About source
- word count: <n>
- blacklist scan: clean
```

## Binding rules for consumers

| Consumer | Rule |
|---|---|
| S3 (about row) | embeds the description verbatim in the `/about/` page body; never paraphrases it; the file's `## Provenance` section does not ship |
| S4 cleanup | treats the description as an entity fact — never rewritten; a violation it cannot fix without altering it goes to `## Flags` |
| S5 footer | renders the description paragraph verbatim under a footer heading; one `<p>`, no truncation, no paraphrase |
| S5 JSON-LD | `description` of the business-entity node |
| S7 gate | checks the footer blurb renders on every page (shell check) |

## Contested

- **Why a separate artifact instead of a brief field?** Length and
  review. A 100–200 word generated paragraph deserves its own review
  surface and provenance record; a YAML scalar in `site-brief.md` is
  unlintable and unreviewable, and the brief is *input* — the
  description is *generated copy* with bounds.
- **Why S2 and not S3?** The description is a per-site artifact, not a
  per-row artifact; it also feeds two render targets (footer, JSON-LD)
  that aren't page copy. S2 already owns voice calibration — the
  description's register binds to the same tone profile.
- **Blacklist duplication vs. tone-profile `## Banned`.** The prompt's
  blacklist is frozen inside the prompt text so the prompt is
  self-contained when handed to a model; `## Banned` still applies as
  the output lint. Overlap is intended — two layers, same direction.
