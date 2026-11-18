---
id: card-w3
type: card
wave: w3
links:
  uses: [rules-L, rules-R, rules-E, rules-V, rules-W, rules-P, rules-DNA, rules-PS, rules-SB, section-build]
  enforced_by: [check_wireframe_tags, check_mobbin_refs, check_wireframe_lock, check_section_enums, check_speech_acts, check_emphasis, check_motif, check_rhythm, check_vector_map, check_schema_fields, check_genotype, check_burst, check_declared_breaks, check_wildcard, check_section_contracts, check_layout_distinct, check_checklist, check_dna, check_dna_fresh]
---

# W3 — Page structure (chosen card → plan rows + ASCII)

**GOLDEN RULE: ASTRO is the goal; TAILWIND is non-negotiable** — the
locked rows are the contract the Astro page must render; the wireframe
card itself stays plain HTML (P.1, P.3).

**Read DNA map. Every decision traces to it.** The map (`DNA.json` + `DNA.md`) is the single source of coherence: every value used here must be traceable to it (`gate.py dna`).

## Job

Copy the operator-picked card's sections into
`pages.<slug>.sections[]` **1:1** — order, composition, media ratio,
disclosure, stack (P.4). Every row carries `wf_ref` =
`<cards-file>#<design-id>:<data-sec>`. Deviation requires a logged
`decisions[]` entry naming the replaced wireframe section. Then the
ASCII critique: full skeleton on 1440 + 360 canvases, contrast moment
and S-M-L marked; fixes land in `decisions[]`.

## Row schema (per section)

`name` · `wf_ref` · `speech_act` ∈ §1 (≤2; `detail`/`chrome`
structural) · `category` ∈ vendored slugs · `surface`
base|muted|inverse|brand|media · `density` compact|regular|spacious ·
`composition` ∈ §2 · `emphasis` (the ONE focus — every section names
it) · `align` (named edge, L.1) · `stack` text-first default (R.3) ·
`collapse` per R.3 table · `media_ratio` ∈ V.3 · `disclosure`
open|collapsed|tabbed (E.2) · `vector:` heading+fs pairs from the STUB
(verbatim; every STUB heading exactly once — E.1) · `heading_class`
query|claim · `zone` macro|micro|end|chrome.

## Design gates (mechanical — all REQUIRED)

- **Wireframe lock (P.4):** rows match chosen card's `data-*` sections
  1:1 in order; every row `wf_ref`ed.
- **Genotype (D.4):** every row `composition` is an allele of the
  `layout-archetype` gene; the chosen card renders that genotype — a
  card/genotype conflict re-picks the row, never the genotype.
- **Mobbin (P.14):** each composition cites its `MOBBIN-REFS.md` row.
- **Pattern evidence (P.3/P.4):** every row's composition is selected by
  searching the mined library — `python3 tools/design-gate/patterns.py
  search "<site type> <page type> <section job>"` — and each chosen row
  cites ≥1 `pattern-…` id whose `section_type` matches the row. A
  composition with no pattern row has no evidence and cannot be chosen;
  choosing one anyway is a logged decision with a reason, never silence.
- **≥1 contrast moment per page:** exactly one `inverse`/`brand`
  interior surface (§4: inverse ≤2 + footer, brand ≤1); motif.break
  usually lives here.
- **S-M-L step:** adjacent sections show a visible density step — no
  two adjacent rows may share `density` AND `composition` both; at
  least one density change every 3 rows (L.7).
- **≤2 consecutive same composition:** never 3+ adjacent rows sharing
  `composition` (§4 adjacency hardened — a merged organism declares
  itself via `organism:` + logged decision).
- **Motif placed + broken once:** `site.motif.device` + `recurs_at`
  non-empty; exactly one `break` section; recurs/break reference real
  section names.
- **Emphasis:** every row's `emphasis` non-empty.
- §4: first interior surface ≠ hero surface (fold boundary); `media`
  only under real overlay; `act` twice on money pages; `spacious` at
  promise/act + ≤1 interior; `cards-n` ≤2/page; no adjacent card
  sections.
- E.1: every STUB heading appears exactly once across rows, vector
  order preserved; `heading`/`fs` verbatim, never rewritten.
- W: CTA labels ∈ system.copy (W.2); fold labels are real questions
  (W.4).

## Exit gate

```bash
python3 tools/design-gate/gate.py w5 <pipeline-dir> --wireframe <cards/index.html> --design <id> --stub <stub.md>
```
Checks: `data-*` 1:1 + order + wf_ref; all gates above; enums;
`CHECKLIST/w5.md` no blank evidence. Operator approves locked rows.

## Done when

`GATES.json.w5.approved` is true with `design` naming the locked card
and every `check_*` in `enforced_by` green.
