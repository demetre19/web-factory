# DESIGN-INTAKE — operator runbook

How a site's design authority enters the Web Factory. S5 consumes exactly
two kinds of input — a DOX packet (`site/design/*.zip`) or captured refs
(`site/design/refs/`) — and this document is the front end for the refs
branch: four intake scenarios, one decision tree, one convergence point.
Stage mechanics live in `research/WEB-FACTORY-S5-DESIGN-DNA.md`; this file
chooses what feeds the distill, never how the build runs.

## Constants (non-negotiable, every path)

- **No emoji, ever** — icons are inline SVG (currentColor,
  token-sized, aria-hidden). Stars, checks, arrows ship as paths;
  emoji/symbol glyphs are a design ban (S5 anti-pattern lint).

- **Astro** — the only build target; `target: react`/`html` refuses.
- **Tailwind** — `@layer components` classes, one owner per class.
- **Fluid everything** — utopia-style `clamp()` scales for type *and*
  space, viewport-anchored to the 320–1440px responsive floor. Fluidity
  ships as tokens in `TOKENS.json` fluid pairs, never per-element
  improvisation.

## The decision tree

```text
NEW-WEBSITE
   │
   ├── existing site? ── no ──> inspirations provided?
   │         │                      ├── yes ──> capture inspo URLs ──> refs/ (role: inspiration)
   │         │                      └── no  ──> site-intake variants ──> operator picks 1 ──> refs/ (role: variant)
   │         │
   │         └── yes ──> site-intake crawl (captures → refs/ (role: baseline), facts → site-brief.draft.md)
   │                      │
   │                      └── design authority?
   │                           ├── replace with inspirations ──> refs/ (role: inspiration)   [Scenario 2]
   │                           ├── replace with variants ──────> refs/ (role: variant)       [Scenario 1b]
   │                           └── improve in place ───────────> refs/ baseline + design/audit.md [Scenario 4]
   │
   └── ALL paths ──> site/design/refs/ (+MANIFEST.md) ──> S5 distill ──> design-dna/ ──> build ──> sites/<slug>/
```

## The four scenarios

`design_mode` is one intake field set at S0 alongside `existing_site_url`;
it picks the row below.

| design_mode | Scenario | refs/ content | Facts source | Extra input |
|---|---|---|---|---|
| `variants` | 1 — greenfield, no inspo | generated variant pick (`role: variant`) | full S0 Q&A | — |
| `refs-inspiration` | 2 & 3 — site exists or not, inspo given | inspiration captures (`role: inspiration`); existing-site captures kept as `baseline` evidence | crawl draft when site exists, else full S0 Q&A | inspo URL list |
| `inspo-text` + `variants` | client gives a draft whose copy is right but visual is throwaway | draft capture (`role: inspo-text` — copy/sections only) + generated variant for the real design | crawl draft when site exists, else full S0 Q&A | vercel/Figma/etc draft URL |

| `audit-remodel` | 4 — existing site, UX improvements | existing-site captures (`role: baseline`) + `site/design/audit.md` corrections | crawl draft | ux-auditor pass |
| `refs-existing` | 2-lite — rebuild same look | existing-site captures (`role: baseline`), no audit | crawl draft | — |
| `dox` | operator drops a DOX packet | packet is authority (existing contract) | per S0 | `site/design/*.zip` |

## The three artifacts this document adds

1. **`refs/MANIFEST.md`** — every capture row classified
   `baseline | inspiration | variant`, with `source_url`, `captured_at`,
   `viewport`. Baseline = extract identity. Inspiration = extract
   character. Variant = the picked direction, authored contract-shaped.
2. **`site/design/audit.md`** — `audit-remodel` only. The ux-auditor
   output against the baseline captures; the distill's "correct, don't
   replicate" instruction set.
3. **`site/site-brief.draft.md`** — crawler-prefilled brief. Extracted
   facts carry `extracted:` provenance; gaps carry `TODO:`. The
   operator edits one file instead of answering a long Q&A; nothing
   inferred ships unflagged (the never-fabricated rule applies to the
   intake exactly as it does downstream).

## site-intake tool

`tools/site-intake/site-intake.mjs` — zero-dep Node ≥18 script, run
before the run mints (out-of-band: it feeds the two existing gates, it
is not a third).

```bash
# Scenario 4 / 2 / rebuild: capture an existing site
node site-intake.mjs crawl https://oldsite.com --out site/design \
    --brief site/site-brief.draft.md
#   writes refs/<NN>-<slug>.html (same-origin pages, sitemap.xml first,
#   <a> fallback, cap 20), refs/MANIFEST.md, tokens-raw.json,
#   site-brief.draft.md

# Add inspiration captures (Scenario 2/3)
node site-intake.mjs capture https://inspo.example.com --out site/design \
    --role inspiration

# Scenario 1: generate contract-shaped directions (flags: --roles
#   designer[,designer-alt]  --char <chars>  --accent <hex>  --air <n>)
node site-intake.mjs variants --out site/design/refs \
    --brief site/site-brief.md
#   writes variant-<id>-<char>.html per role (Tailwind-classed, clamp()
#   token block embedded as <script id="tokens">), operator picks →
#   MANIFEST marks it role: variant
```

The distill lane treats a `variant` row exactly like a reviewed capture:
its embedded token block is contract-shaped `clamp()` pairs, so
extraction is verbatim, not derived.

## Design roles

`pi/designer` is the default — it owns the design lanes (distill
`design-dna-<site>`, build `web-build-<site>`); never a model literal
in the spec, the role binds in `~/.omp/agent/config.yml` modelRoles.
`pi/designer-alt` is opt-in per run for more variety: pass
`--roles designer,designer-alt` to `site-intake variants` for a
second variant set (same brief, different mind — a real A/B pick),
or assign it the ux-auditor counter-review in `audit-remodel`.

## Invariants

- One convergence: every path lands in `design-dna/`. No second build
  path per scenario — same principle as the DOX/refs split.
- Two gates only (D3): variant picking happens in the tool's own
  out-of-band preview, never a typed pipeline gate.
- Never fabricated: crawler facts are `extracted:`-flagged evidence;
  the operator's edit pass is the ratification.
- Scenario 4 sub-case: a factory-emitted `sites/<slug>/` never re-runs
  the pipeline for UX tweaks — that's `/ux-audit` + `/restyle` inside
  the S7 operator loop.
