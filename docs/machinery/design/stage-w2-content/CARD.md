---
id: card-w2
type: card
wave: w2
links:
  uses: [rules-E, rules-W, rules-R, rules-P]
  enforced_by: [check_content_inventory, check_checklist, check_dna, check_dna_fresh]
---

# W2 — Content in (STUB → inventory → copy contract)

**GOLDEN RULE: ASTRO is the goal; TAILWIND is non-negotiable** — W2
adds no markup; it fixes the words every later Astro section renders
verbatim. (P.1)

**Read DNA map. Every decision traces to it.** The map (`DNA.json` + `DNA.md`) is the single source of coherence: every value used here must be traceable to it (`gate.py dna`).

## Job

1. Read the copy contract (`STUB.md`) — `## Heading vector` table
   (zone | heading | first sentence) is the authoritative list of
   headings and their mandated first sentences. Never rewrite,
   re-order, merge or drop a row (E.1).
2. Build the **content inventory**: for every heading row, the body
   blocks the section needs (paragraph count, list items, proof
   elements, CTA label, media subject). Inventory rows are the only
   legal content in later rows.
3. Bind each row to a zone (`macro | micro | end`) and a
   `heading_class` (`query` = small/muted label; `claim` = full rank,
   E.2). Macro rows stay `open`; micro rows fold per the operator's
   `disclosure` pick.
4. Record the copy fields the system binds at W5: `cta_person`
   (first|second, one per flow, W.2), reading level ≤ grade 8 (W.8),
   tone picks (W.1).
5. CTA labels, empty states, error strings and link text are real
   copy from the STUB — never lorem, never placeholder (W.6, W.7).

## Rules that apply

- **E.1** heading vector is the section list; verbatim, no invention.
- **E.2** heading classes — query vs claim; macro = open only.
- **W.2** CTA person; **W.6** empty states; **W.7** link scent;
  **W.8** reading level; **W.10** writing QA.
- **P.4** the vector must be covered exactly once by plan rows at W3.

## Exit gate

```bash
python3 tools/design-gate/run.py w2 <pipeline-dir> --stub <stub.md>
```

Checks: STUB parses; every heading row has an inventory entry with
body blocks; zone + heading_class bound; copy fields present; no
placeholder strings. Then `--approve`.

## Done when

`GATES.json.w2.pass` for current input hashes and
`CHECKLIST/w2.md` has no blank evidence (P.9).
