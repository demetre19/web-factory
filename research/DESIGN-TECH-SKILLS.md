# DESIGN-TECH-SKILLS — Design skills for LLM agents

External research on the *mechanism* behind "agent design skills" — installable SKILL.md packs that make coding agents produce non-generic UI. Focus: what is actually in the files, and which parts are encodable for a weak model in an automated Astro+Tailwind pipeline.

Researched 2026-11-18. Repos inspected by cloning, not just READMEs.

---

## 1. TL;DR — the convergent mechanism

Every serious anti-slop skill converges on the same five mechanisms, in roughly this order:

| Mechanism | What it does | Where seen |
|---|---|---|
| **Force a decision before code** | The model must write a direction (palette, type, layout, signature moment) as *text* before touching markup. Deciding in prose forces divergence; deciding inside code converges to defaults. | Anthropic frontend-design ("two passes"), impeccable (direction contract + concept-seed), Hallmark (Picks block + draw) |
| **Dealt randomness / catalog** | A script, not the model, picks from a catalog of "worlds"/themes/structures, breaking the model's convergent sampling. Left alone the model always picks the same direction; a die roll doesn't. | impeccable `concept-seed`, Hallmark `theme.mjs deal`/`draw`, taste-skill `moments.mjs`/`start.mjs` dealers |
| **Banned-pattern lists ("tells")** | Explicit named tells with rule IDs: eyebrow labels, one italic word, purple→blue gradient, card-in-card, `→` on links, mono-for-cosplay, middle-dot meta strings. Works because negation is cheap for LLMs. | impeccable craft-floor + 62-rule detector, Hallmark Floor/Reflex gates, Anthropic's "calibration cluster" list |
| **Deterministic linter** | A script (Rust binary or Node) scans the output HTML/CSS/JSX for the tells — no LLM needed, so it runs on every edit via hooks. Model never has to remember the bans. | impeccable `detect` (62 rules, CLI+hooks), Hallmark `sloplint.mjs` (~90 numbered gates incl. rendered-page checks) |
| **Critique in fresh context** | A separate agent/context reviews screenshots against a rubric (Nielsen heuristics, cognitive-load checklist, P0–P3 severities) and returns a one-word disposition: `ship / fix / rebuild / recapture`. | impeccable finish-reviewer, Hallmark finish review + gates.md §6, taste-skill `gate.mjs` |

Plus two recurring cross-cutting ideas:
- **Design-as-file persistence**: `DESIGN.md` (a real format, google-labs-code/design.md spec) + `PRODUCT.md` are durable artifacts an agent reads *before* designing; a "surface brief" + "direction contract" are per-page strategy docs. Memory across builds, not just one-shot prompts.
- **"The brief wins"**: every skill says an explicit user brief overrides all bans — the bans exist to fill a *silent* brief, not to impose one taste.

The single most extractable lesson for a weak model: **don't ask it to have taste. Give it (a) a menu it must pick from, (b) a written contract it must fill in, (c) a linter that checks the contract after.**

---

## 2. The "impeccable" skill — what it actually is

**Repo**: https://github.com/pbakaus/impeccable (Paul Bakaus; README: "started from Anthropic's frontend-design skill"). Site: https://impeccable.style/. Ships as plugins for Claude Code, Codex, Cursor, Copilot, Grok; the skill's scripts launcher runs **a self-contained Rust binary** (`impeccable` CLI + engine), downloaded once to `~/.impeccable/bin/` — not just a prompt file.

It is *not* one prompt. It's a small operating system for design work:

### Anatomy (from `.cursor/skills/impeccable/`)

- `SKILL.md` (87 lines) — router/persona. Loads `impeccable context` (the binary reports project state, product context, staleness), then a per-command "playbook" reference file, then `craft-floor.md` immediately before any UI edit.
- `reference/*.md` — ~30 playbooks, one per verb: `shape`, `init`, `document`, `extract`, `critique`, `audit`, `polish`, `bolder`, `quieter`, `distill`, `harden`, `onboard`, `animate`, `colorize`, `typeset`, `layout`, `delight`, `overdrive`, `clarify`, `adapt`, `optimize`, `live`, `generate`. Loaded only when that verb is invoked (progressive disclosure).
- `scripts/impeccable` — the binary: `context`, `concept-seed`, `detect`, `hooks`, `surface-brief`, `world`, `build-phase`, `doctor`, `embed-prompt`, plus `data/font-index.json` (a font catalog).
- A **62-rule deterministic detector** (`impeccable detect`, README line: "62 deterministic rules flag the tells... No LLM, no API key"), runnable as CLI, as a post-edit hook (`.tsx/.jsx/.html/.vue/.svelte/.astro/.css` etc.), or a deep pass on Stop. Two tiers: immediate mechanical findings per edit; taste-level findings once at session end. Rule-level ignores via `ignore-value`/`ignore-file` in `.impeccable/config.json` or `<!-- impeccable-disable rule-id -->` comments.
- Shipped sub-agents (`.cursor/agents/`): `impeccable-finish-reviewer`, `impeccable-documenter`, `impeccable-motion-reviewer`, `impeccable-asset-producer` — fresh-context reviewers invoked at the end of a build.
- `ui/component-review/` — a local web UI for comparing variants; `live`/`generate` commands drive a real browser for picking elements and iterating.

### The core flow for new work (`reference/new-work.md` + `new-work-world.md`)

1. **Visual authority check** — read `DESIGN.md`, code, tokens. Decide: redesign (old look is *anti-reference*), established world (inherit; document it), seeded world (DESIGN.md frontmatter names a catalog `world:`), or none (create with user).
2. **Mode assignment** — every surface is one of **Persuade** (landing/marketing), **Operate** (dashboards/tools), **Read** (docs/articles), **Experience** (portfolios). Mode sets the ambition budget and the rules ("a tool's landing page is still Persuade").
3. **Seven candidate worlds** — for a new/replacement world: name the product's unique mechanism + audience's cultural home; note "the page this category always ships and its predictable opposite — both are the rut, kept out of the list"; then list **seven concrete visual systems, artifacts, places or rituals the audience knows by heart** (their graphic traditions, publications, identity programs — not their tools). Each becomes a full direction.
4. **`concept-seed` roll** — the binary *deals* which three structures/directions reach the user; "the dice pick which three reach the user, breaking the ranking rut." Writing code before `concept-seed` has run is "a contract violation." Catalog worlds can also be seeded via `impeccable world <id>`.
5. **Direction contract** — before code, write ~150 words in six blocks into a surface brief: `THESIS` (the one idea + the category-default it refuses), `OWN-WORLD` (palette + component language recognizable with content removed), `STORY`, `FIRST VIEWPORT` (exact composition), `FORM`, plus seed reference. Banned from ever being copied into shipped code/comments/DOM.
6. **Commit hard** — "Build the assigned direction, not a safer interpretation of it." Color is picked via a strategy (Restrained / Committed / Full palette / Drenched); dark-vs-light decided by "one sentence of physical scene." A named list of 16 overused typefaces (Fraunces, Playfair, Space Grotesk, Space Mono, Inter-as-display, DM Sans/Serif, Instrument Sans…) requires "a reason no other face could satisfy" — and "a subject association is never that reason."
7. **Calibration cluster warning** — new-work explicitly lists the four AI-look clusters (cream+serif+terracotta; near-black+neon accent; broadsheet hairlines+italic serif+tracked mono; neobrutal ink+offset shadows) and says landing in one unprompted "means the self-check failed."
8. **Verify + review** — batched screenshots at real sizes; `impeccable detect --json` on changed files; then spawn the `impeccable-finish-reviewer` subagent with the request, screenshots, direction contract, hook findings; it returns exactly one of `recapture / rebuild / fix / ship`. Patching inline and self-certifying "is how a rejected page ships twice."
9. **Document** — a documenter subagent writes/regenerates `DESIGN.md` (following the google-labs-code `design.md` spec: YAML token frontmatter + ≤8 ordered prose sections) *from the built world* — "a rulebook written before the build gets defended against reality instead of describing it." Sidecar `.impeccable/design.json` feeds a live panel.

### `craft-floor.md` — the bans (loaded before *every* UI edit)

- **Verify** (numeric, checkable): contrast ≥4.5:1 / 3:1 large; body measure 65–75ch; display max 6rem; tracking floor −0.04em; "more space above a heading than below"; one authored motion moment ("exponential ease-out from an already-visible default"); all states (hover/disabled/loading/error/empty); **browser surfaces** (selection color, caret, scrollbars, focus rings, underline offset, tabular numerals — "the cheapest signal that a page was built rather than assembled, and the one models skip most reliably").
- **Refuse** (category defaults, overridable only by an explicit brief — except one *hard ban*): icon+heading+text same-size card grids ("cards are the lazy container; nested cards are always wrong"); the hero-metric template (big number + small label); section numbers 01/02/03 unless the content is a sequence; decorative modals; **gradient text**; decorative glass/blur; colored `border-left` >1px on cards; hard offset shadows outside a real neobrutalist world; sparklines/progress-rings as content-substitutes; **monospace as "technical" costume**; system display faces (Impact/Arial Black) as display voice; Unicode/emoji as icons; geometric masks standing in for photo cutouts; light/dark "picked by category." The one absolute ban: **the eyebrow/kicker above a heading** — "no brief earns it back."

### Why it works (mechanism analysis)

- It treats generic output as a *sampling problem* and a *checking problem*, not a taste problem: the roll + 7-candidate workshop widen the sampling space; the detector + fresh-context reviewer catch what the model can't self-police.
- Rules carry IDs and live in config → deterministic enforcement survives model swaps. A weak model only has to follow a numbered gate list and fix named findings, not exercise judgment.
- The "modes" and "one idea per surface" rules constrain scope so the model's limited budget goes into one committed direction instead of diffuse decoration.

Sources: https://github.com/pbakaus/impeccable (README + `.cursor/skills/impeccable/` tree, v4.9.2); https://impeccable.style/; https://open-design.ai/skills/impeccable/; https://collectivebrain.de/en/skills/impeccable/ (notes "24 commands... local detector with 62 rules").

---

## 3. Other high-signal design skills

### 3a. Anthropic `frontend-design` — the ancestor

- Single `SKILL.md` (~70 lines) in https://github.com/anthropics/skills — persona ("design lead at a studio; client already rejected cliché proposals"), subject-grounding instruction ("the subject's industry, materials and vernacular are where distinctive choices come from"), then a compact principles list.
- **Two-pass process**: first write a design *plan* — token system (4–6 named hex colors), type roles, layout concept described in prose + ASCII wireframes, principles — then **review the plan against the brief**: "if any part reads like the generic default you would produce for any similar page... revise it, say what you changed and why." Then build.
- Contains an explicit **"calibration" list of current AI-look clusters** (5 items: cream+#D97757 terracotta — notes it's Anthropic's own accent and "reads as a tell"; near-black+acid accent; broadsheet hairline layout; SaaS-card kit `rgba(0,0,0,.1)` shadows; template chrome — ALL-CAPS eyebrow, `A · B · C` middle-dot meta, `WORD — fragment` labels, `#0B0B0B` tinted blacks, mono labels, `→` on links). "Where the brief pins a direction, follow it; where it leaves an axis free, don't spend that freedom on a default."
- Typography specifics: one family or two clearly distinct; line length <80ch (serif slightly longer); banned treatments — one italic/colored word in a headline, all-caps labels, eyebrow labels; numbered markers only if content is a real sequence.
- "Spend your boldness in one place... Chanel's advice: remove one accessory."
- **Community evidence it works but is beatable**: a Reddit user rewrote it, built a 50-prompt A/B eval, reports the rewrite won **75% of head-to-heads** — evidence that the *contents* of the skill (not the skill mechanism) drive results, and that eval-driven skill writing is a thing people do. https://www.reddit.com/r/ClaudeAI/comments/1q7rnpk/ Also note: a separate Reddit thread complains vanilla frontend-design "always outputs the same structure" — text-only skill, no randomness, converges. https://www.reddit.com/r/ClaudeAI/comments/1t3ht2g/

### 3b. Hallmark (Nutlope/Together AI) — themes-as-materials + slop lint

- https://github.com/nutlope/hallmark — v2.0.0, "Powered by Together AI." Claude Code/Codex/Cursor/OpenCode. Self-contained HTML/CSS output; each page's CSS is stamped (first line = decision record, then critique line, then waivers).
- **The Floor**: 16 non-waivable rules inline in SKILL.md, each citing gate IDs — e.g. every color/font through a `:root` token (48); never `transition: all`, never animate width/height/top/left (10a); never one italic word in a roman head (38i); `overflow-x: clip` on html+body (34); every animation has reduced-motion fallback + no-JS-visible content (27,62); never invented metrics/testimonials/logo walls (46a); **never an eyebrow or tracked-capitals label** (54,67); never middle-dot metas/`→` links/status dots (63); never purple→blue gradient, card-in-card, emoji icons, drawn fake browser windows (2a,4,30a,47a); hero's headline+sentence+CTA visible at 1280×800 (44b); ~80 words per screen (58); capped centered container (44d); run `sloplint.mjs --render` before hand-back (16).
- **Tiered gates** in `sloplint.mjs` (~4,400 lines, ~90 numbered/sub-numbered rules): `floor` (never ships), `reflex` (a default the model falls into — waivable *on the record* with a reason), `finish` (craft detail, never blocks), `ledger`. `--render` checks the page at 8 widths in a real browser; `--stage hero` reviews the hero alone first.
- **The deal**: `theme.mjs deal --genre <g> --prompt "<p>"` picks three of **50 themes** (`references/themes/*.md` + `.jpg` image each — the model *looks at a picture of a finished page in that material*). A theme is "a material, not a plan": palette balance, type voices, surfaces, texture, a "Range" of sections it can render without photography — never layout. Then `theme.mjs draw --material photo|product|words --job <job>` deals page-shape decisions: the macrostructure, hero posture, nav, footer, first section, action position, *two compositions to leave out*. A `.hallmark/log.json` fingerprint prevents consecutive builds converging; "one prompt in one theme, built twice, makes two pages."
- **Mirror test**: "would a neighbouring prompt in the same category get this exact combination? If yes, change one decision."
- **Ask-once input spec**: one message asking Material (real photos/numbers — "I never invent a number, a quote or a logo"), Audience, Use (the one action), Tone ("pick an extreme; 'clean and modern' is not a tone"). Skipped = inferred+stamped; facts are never inferred.
- **Anatomy-by-job**: `references/anatomy.md` tells where real sites in a category put the action — "the page is built from that anatomy, never a default run of figures, steps and an email band."
- **21 macrostructures** (`references/macrostructures/`): named page shapes — bento grid, marquee hero, conversational FAQ, manifesto, quote-led, specimen, index-first, letter, narrative-workflow, split-studio, type-specimen, portfolio-grid, ecosystem-index… Model picks one file to load.
- Fresh-context finish review (`gates.md` §6): a subagent reads a reviewer prompt, returns `recapture/rebuild/fix/ship`; "a fabricated pass is itself slop."
- Also: 755-photo licensed library (`photos.json` + credits), `capture.mjs` screenshots the *real product* from a URL/dev server for hero material, redesign/audit verbs, fast mode.
- Sources: https://github.com/nutlope/hallmark (SKILL.md, scripts, themes dir); https://www.usehallmark.com; https://www.reddit.com/r/BestGitHubRepos/comments/1xiddve/

### 3c. taste-skill (Leonxlnx) — classify-the-business → dealt moments + browser gate

- https://github.com/leonxlnx/taste-skill (~118k stars per GitHub API; site tasteskill.dev). `design-taste-frontend` skill v2.5.1; needs Node 22+ and a real Chromium. Ships `system.css/system.js` starter assets, `references/` (~25 files), and Node dealer/checker scripts.
- **Business-kind classifier first**: every brief is bucketed — software / gaming / tech-hardware / product / service / place (cafe, hotel, shop). Declared on `<html data-type>` + metas. *The kind gates everything else*: shader effects/WebGL scenes only allowed on tech/software/gaming; "a local cafe gets photographs," never effects.
- **9 "house rules"** that beat everything: no captions under images; every visual renders at 4 widths; **one section per screen** (hero alone on screen 1); equal left/right content edges; a fixed hover-microanimation vocabulary (cards lift 2px, photos zoom 1.02, buttons step/press, underlines draw — "never strip or override"); more real photographs; real product icons never drawn ones; award-level moments allowed but dealt, not everywhere.
- **Dealers, not judgment**: `start.mjs`, `moments.mjs`, `consistency.mjs`, `photos.mjs` — every page deals "one or two moments" (a signature effect/scene/photo-type moment); palettes dealt by trade; photo counts specified per kind (place: 12–20 photos); word counts per screen (60–80 for tech).
- **Real photographs pipeline**: bundled Wikimedia Commons photos work offline; `photos.mjs search` finds stand-ins of "the same kind of thing," credited in one footer line; never stock-URL, never drawings for a product that exists.
- **Enforcement hooks**: a `Stop` hook runs `gate.mjs` automatically when the agent tries to finish — the gate, not the model, decides completeness. Checker + finish gate verify in a real browser.
- Source: https://github.com/leonxlnx/taste-skill (skills/taste-skill/SKILL.md + README).

### 3d. `last30days` — X/Reddit research skill (existence + mechanism only)

- https://github.com/mvanhorn/last30days-skill — GitHub Trending #1 (per its README badges); install via `npx skills add mvanhorn/last30days-skill` or Claude plugin marketplace.
- Mechanism: a `/last30days <topic>` command that runs **parallel searches across walled-garden platforms** — Reddit (upvotes), X (likes), YouTube (transcripts), TikTok, HN, Polymarket, GitHub, plus patents/careers for companies — each scored by *real engagement* (upvotes/likes/odds), then an agent judge synthesizes one brief. Reddit/HN/Polymarket/GitHub work zero-config; X/YouTube/TikTok/arXiv unlock via a 30-second setup wizard (BYO keys/sessions). Positioning: "Google aggregates editors; last30days searches people."
- Relevance to us: it's the canonical skill for the "search X/Reddit discourse" step of this kind of research — worth noting as a reusable research input, not a design mechanism.

### 3e. Related infrastructure worth knowing

- **`design.md` format spec** (google-labs-code/design.md) — the file impeccable's `document` command writes: YAML frontmatter with machine-readable design tokens + ≤8 ordered markdown sections ("tokens are normative; prose provides context"). Referenced at https://raw.githubusercontent.com/google-labs-code/design.md/main/docs/spec.md via impeccable's document.md. A candidate *output format* for our pipeline's design contract.
- **`npx skills`** (vercel-labs/agent-skills) — the de-facto installer these skills all target; skill format = folder with `SKILL.md` + progressive-disclosure `references/` + `scripts/` + optional `hooks`. Our pipeline can reuse the packaging convention (load only the reference file for the current decision).

---

## 4. The discourse: why LLM sites look the same, and what people found that works

### Why (consensus mechanism)

- **Training-data median**: LLMs regress to the most common scraped patterns. Canonical example: Tailwind UI shipped every demo button as `bg-indigo-500`; Adam Wathan's Aug-2025 joke-apology tweet (>1M views) pinned "AI purple" on that single default. Inter/Roboto, three-icon feature grids, centered-hero+CTA, `rgba(0,0,0,.1)` shadows are the same phenomenon on other axes. Source: https://prg.sh/ramblings/Why-Your-AI-Keeps-Building-the-Same-Purple-Gradient-Website (Oct 2025).
- **Ambiguity is filled with averages**: "build a landing page" carries no constraints, so the model samples the mode of its distribution — which is templates. Same source.
- **Newer cluster tells**: even "sophisticated" AI output clusters — cream+serif+terracotta (partially *caused* by Claude's own accent color leaking into training), near-black+neon, broadsheet hairlines, neobrutalist costume. Documented inside Anthropic's own frontend-design skill and impeccable's calibration warning (sources above).
- **Functional slop is worse than visual slop**: LLMs generate form markup without validation/error/required states because they trained on static code, not user flows (prg.sh article).

### What works — techniques with reported evidence

| Technique | Mechanism | Evidence of working |
|---|---|---|
| **Explicit banned-pattern lists in the prompt** | Negation lowers the weight of the tells; cheap to encode, cheap for weak models | Anthropic cookbook `frontend_aesthetics` system prompt — before/after artifact pairs show visibly different outputs (same prompt ± constraints): https://github.com/anthropics/claude-cookbooks/blob/main/coding/prompting_for_frontend_aesthetics.ipynb; discussed at https://prg.sh/ramblings/... |
| **Isolated-dimension prompts** | Fix ONE axis per pass (typography, then color, then motion) instead of asking for "better design" — multi-pass critique | Same cookbook; the `<use_interesting_fonts>` example lists banned fonts + named alternatives per register |
| **Token-first spec before code** | Forces concrete named hex/type/layout decisions in prose, where divergence is easy; then the contract constrains code | Anthropic frontend-design's two-pass process; impeccable direction contract; Hallmark Picks block; 75% A/B eval win for a rewritten skill that tightened this (Reddit source above) |
| **Dealt randomness (dice, not taste)** | A script picks theme/direction/moments from a catalog → same model, different runs, genuinely different outputs; kills convergence that pure prompting can't | impeccable `concept-seed` (mandatory before code, "contract violation" to skip); Hallmark deal+draw+log fingerprint ("one prompt in one theme, built twice, makes two pages"); taste-skill dealt moments. Community complaint that text-only skills "always output the same structure" (https://www.reddit.com/r/ClaudeAI/comments/1t3ht2g/) is the counter-evidence |
| **Deterministic linter over output** | The bans stop being model-memory and become a CI check; findings come back as fix-lists — exactly what a weak model is good at | impeccable 62-rule detector + hooks; Hallmark `sloplint` ~90 gates at 8 rendered widths; taste-skill `gate.mjs` Stop hook |
| **Reference/image-driven workflows** | "Steal taste": describe 3–5 reference designs (or feed screenshots) so the model translates taste rather than inventing it | prg.sh calls it "the most reliable technique"; Hallmark deals themes *with a picture of a finished page* the model looks at; uxplanet recommends Claude analyze a reference image first: https://uxplanet.org/5-tips-to-prevent-generic-web-design-in-claude-code-7cc044760453; medium workflow uses captured full-page screenshots of real sites: https://medium.com/@amitXD/how-to-build-beautiful-websites-with-claude-code-5-practical-techniques-that-make-a-real-30d8dbded7fa |
| **Named archetype/aesthetic instead of adjectives** | "1970s ski lodge," "Japanese print design," "solarpunk" interpolate a coherent corner of training data; "clean and modern" does not | Anthropic cookbook + prg.sh; Hallmark tone ask ("pick an extreme; 'clean and modern' is not a tone") |
| **Multiple directions, one committed** | Ask for N directions, pick one, build it fully — explores solution space instead of first local max | prg.sh ("request three design directions"); impeccable 7-candidate world workshop + roll; dev.to user reports best results running impeccable directions on separate git branches then comparing: https://dev.to/erikch/2-agent-skills-every-frontend-developer-should-try-16pl |
| **Fresh-context review with a rubric** | A separate context reviews screenshots against a checklist (heuristics, word counts, fold checks) — can't rationalize its own choices | impeccable finish-reviewer (4 dispositions); Hallmark gates.md §6 + "a fabricated pass is itself slop"; taste-skill gate.mjs |
| **Real material over invented chrome** | Ban invented metrics/testimonials/stock filler; real screenshots/photos beat decorative gradients — slop is often content-shaped | Hallmark Floor (46a) + 755-photo library + capture.mjs; taste-skill photo pipeline; impeccable "author the assets; never substitute chrome"; prg.sh functional-gap note |

### Community signal that these skills land

- Hallmark hit GitHub Trending / Reddit coverage with "48→50 themes" as the headline feature — the *theme catalog* is what people latch onto. https://www.reddit.com/r/BestGitHubRepos/comments/1xiddve/
- Medium critique of Hallmark raises the open question — a fixed 50-theme catalog may become its own monoculture ("the useful idea and a hard question"): https://medium.com/@mehulpratapsingh/the-ai-design-skill-climbing-github-trending-has-a-useful-idea-and-a-hard-question-55b3385a20a6. Mitigation patterns seen: impeccable's *audience-derived* candidate worlds (generated per brief, not fixed) and Hallmark's deal-log dedup.
- taste-skill at ~118k GitHub stars; last30days at #1 trending — the "skills" ecosystem is currently the main delivery vehicle for this kind of mechanism.

---

## 5. What to steal for an Astro+Tailwind pipeline with a weak model

Ordered by leverage per unit of implementation:

1. **A banned-pattern linter on the built site (deterministic, zero LLM).** Reimplement the highest-signal rules as a Node script over emitted HTML/CSS: eyebrow/tracked-caps labels, one-italic-word heads, purple→blue gradients, `→` in link text, middle-dot metas, mono-for-style, card-in-card, emoji-as-icon, same-size icon+heading+text card grids, hero>1280×800, missing states. Checkable on build output; findings returned to the model as a fix list. (Hallmark's `sloplint.mjs` and impeccable's detector prove this is the workhorse; both are inspectable: 4.4k-line JS file and a Rust binary with `detect --list-rules`.)
2. **A dealt direction, not a generated one.** Maintain a catalog of N "materials"/worlds (each = palette+type+surface rules+one rendered reference image). A script deals 2–3 per brief; the weak model picks *one* and must name why. Prevents every run converging on the same safe output — the failure mode our pipeline has.
3. **A written direction contract before code.** ~100-word template the model fills: thesis, palette (4–6 hex), type roles, first-viewport composition, the one signature moment, what it's refusing. Feed it back with the build prompt; check the build against it.
4. **A short craft floor in the system prompt.** Numeric only: measure 65–75ch, contrast 4.5:1, one motion moment, all states present, browser chrome themed (selection/focus/scrollbar — "the tell models skip most reliably").
5. **Mode/kind classifier first.** Even a weak model can bucket a brief (persuade/read/operate; or place/product/software) — and the bucket gates which layouts, imagery, and effects are even allowed, replacing judgment with a lookup table.
6. **Anatomy-by-job section ordering.** A lookup ("booking site → action in hero + beside price; docs → index-first") beats asking the model to invent page structure.
7. **Fresh-context pass-2 critique with a fixed rubric.** Cheap even for weak models when the rubric is a checklist, not open-ended taste.
8. **Output the system as `DESIGN.md`** (google-labs-code spec: YAML tokens + ordered prose) so subsequent pages inherit instead of re-inventing — cohesion across a multi-page Astro site comes free.

What to avoid copying: relying on *more prompt prose* alone (text-only skills still converge — see the frontend-design complaint thread); fixed catalogs with no dedup mechanism (the monoculture critique); and any step that requires the model to judge "does this look good" without a rubric.

---

## Sources index

- https://github.com/pbakaus/impeccable — impeccable repo (SKILL.md, reference/, detector, hooks; v4.9.2)
- https://impeccable.style/ — impeccable site/docs
- https://github.com/Nutlope/hallmark — Hallmark repo (SKILL.md, sloplint.mjs, theme.mjs, 50 themes; v2.0.0)
- https://www.usehallmark.com — Hallmark site/theme gallery
- https://github.com/anthropics/skills — Anthropic skills repo (skills/frontend-design/SKILL.md)
- https://claude.com/marketplace/plugins/frontend-design — Anthropic frontend-design listing
- https://github.com/Leonxlnx/taste-skill — taste-skill repo (SKILL.md v2.5.1, dealers, gate.mjs)
- https://github.com/mvanhorn/last30days-skill — last30days research skill
- https://github.com/anthropics/claude-cookbooks/blob/main/coding/prompting_for_frontend_aesthetics.ipynb — Anthropic's frontend aesthetics cookbook (before/after evidence)
- https://prg.sh/ramblings/Why-Your-AI-Keeps-Building-the-Same-Purple-Gradient-Website — mechanism explainer (Oct 2025)
- https://x.com/adamwathan/status/1953510802159219096 — the "indigo apology" tweet
- https://www.reddit.com/r/ClaudeAI/comments/1q7rnpk/ — frontend-design rewrite + 75% A/B eval
- https://www.reddit.com/r/ClaudeAI/comments/1t3ht2g/ — "always outputs the same structure" complaint (convergence evidence)
- https://www.reddit.com/r/BestGitHubRepos/comments/1xiddve/ — Hallmark v2 coverage
- https://medium.com/@mehulpratapsingh/the-ai-design-skill-climbing-github-trending-has-a-useful-idea-and-a-hard-question-55b3385a20a6 — catalog-monoculture critique
- https://uxplanet.org/5-tips-to-prevent-generic-web-design-in-claude-code-7cc044760453 — image-reference + constraint tips
- https://medium.com/@amitXD/how-to-build-beautiful-websites-with-claude-code-5-practical-techniques-that-make-a-real-30d8dbded7fa — screenshot-reference workflow
- https://rottoways.com/blog/ai-generated-website-looks-generic — "8 tells and the fix" listicle (secondary)
- https://dev.to/erikch/2-agent-skills-every-frontend-developer-should-try-16pl — impeccable/branch-compare usage report
- https://raw.githubusercontent.com/google-labs-code/design.md/main/docs/spec.md — DESIGN.md format spec (via impeccable document.md)
- https://open-design.ai/skills/impeccable/ , https://collectivebrain.de/en/skills/impeccable/ , https://www.mdskills.ai/plugins/impeccable — third-party skill summaries (command counts, detector-rule counts)
