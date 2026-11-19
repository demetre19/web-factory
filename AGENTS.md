# AGENTS.md — operating contract for any agent in this workspace

Read this first. It defines what "done" means. There is ONE machinery:
the SOP rules + the vector banks + `gate.py`. Everything else is ad-hoc
and forbidden.

## The single chain — nothing outside it exists

```
DESIGN-PLAN.md row (the SOP output)
   → sections/<nn>-<sec>.contract.json     (gate.py contracts, SB.1)
   → src/components/sections/<Name>.astro  (adapt the contract's gold
                                           exemplar — SB.5 — never
                                           free emission)
   → src/components/<comp>.astro          (composition skeleton)
   → assemble.py → src/pages/<slug>.astro (SB.4 — mechanical glue)
   → gate.py w6 / w7 / w8                 (judge — LAST, never a source)
```

- **SOPs and rules come FIRST.** `ENFORCEMENT.md` (the generated rule
  table), `SECTION-BUILD.md`, `DESIGN-PLAN.md`, `ACSS-BASELINE.md` and
  the DNA-map drive every artifact. You never write markup, spacing,
  colour, radius or a section shape that isn't produced by adapting a
  contract's exemplar or binding a token the SOP names.
- **The vectors pick the structure.** `retrieval.py` +
  `adapt.py` are the retrieval layer — a `topology_id`/`composition`
  comes from the bank (CLAUDE vectors), never invented. You bind DNA
  vars onto retrieved structure; you don't author structure.
- **The gate is the judge — and ONLY the judge.** `gate.py` validates
  artifacts after they're produced. It is never consulted to "see what
  it wants"; you produce the SOP-shaped artifact and let it rule.
- **ASTRO + Tailwind + ACSS tokens.** Structure is ASTRO; styling is
  Tailwind over the token layer (`TOKENS.json` / `global.css @theme` /
  `acss-tokens.json`). Components carry no outer padding/background/
  width — `Section.astro` owns the band (SB.2). No `<style>` blocks, no
  `class:list`, no computed classes, no raw hex, no `[...]` arbitrary
  values (SB.3).
- **LIGHT + DARK on every design (C.5).** Both modes, bound by the
  6-role map (C.1).

## NEVER ad-hoc

- No hand-written HTML/ASTRO pages, no `/tmp` demos, no screenshots of
  markup, no bespoke emitters, no bespoke gates, no bespoke theme
  dicts. If it wasn't produced by the chain above and ruled by
  `gate.py`, it does not exist.
- `assemble.py --variants` is the ONLY legal producer of the picker
  (VG.1). No second picker.

## Always-on duties — run FIRST, every session

1. `tools/design-gate/gate.py enforcement` + the wave gate for the
   claimed work → read real state before anything.
2. Every mechanical FAIL → fix it **this session**, at the deepest
   layer it lives. Report fixes + the gate output that proves them —
   not findings.
3. Re-run the same gate after every fix; its exit code is the only
   evidence.

## The fix loop — sequential, SOP-first

```
FAIL → read the rule it cites (SB.1/SB.2/SB.3/C.1/C.5/G.1…)
     → fix the ARTIFACT so it matches the SOP (never the reverse:
       never edit a check to pass, never silence a warn)
     → re-run gate.py <wave> → exit 0, or BLOCKED + named prerequisite
     → commit → next FAIL
```

## Role boundaries (P.8)

- The designer MAY run gates (read-only) and SHOULD run
  `gate.py section` per section at W6.
- Only `run.py` writes `GATES.json`; only the operator runs
  `run.py approve` (a service-nonce spend); only the reviewer writes
  `REVIEW.json` via `run.py sign-review`.
- Approvals are sequential — a wave runs only when every earlier wave
  passed (`ORDER` in run.py). No skipping.

## Report format — evidence, not narrative

What changed → the `gate.py` output proving it → what's blocked + the
named prerequisite → what's next. Never summaries, plans, or status
without a command that proves it.

## Precedence

`ENFORCEMENT.md` (rule table) > `SECTION-BUILD.md` / `DESIGN-PLAN.md` /
`ACSS-BASELINE.md` > this file > memory. `gate.py` exits are law; the
docs are what the gates enforce.
