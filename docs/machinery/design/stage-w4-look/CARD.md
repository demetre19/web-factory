---
id: card-w4
type: card
wave: w4
links:
  uses: [rules-C, rules-G, rules-S, rules-M, rules-T, rules-R, rules-V, rules-P, rules-DNA, rules-VG]
  enforced_by: [check_direction_axes, check_genotype, check_genotype_distinct, check_burst, check_declared_breaks, check_wildcard, check_dark_mode, check_variants, check_checklist, check_dna, check_dna_fresh]
---

# W4 — Look & feel variants (HTML picker → operator pick)

**GOLDEN RULE: ASTRO is for the final product (W6–W8); previews are
self-contained HTML.** The look picker is `preview/variants.html` —
compiled from TOKENS/DNA knobs, CSS vars per variant, Light/Dark
toggle, viewport switch — never a second style source. (P.1, P.2)

**Read DNA map. Every decision traces to it.** `DNA.json` + `DNA.md`
is the single source of coherence (`gate.py dna`).

## Job

1. Produce **3 variant knob vectors** — baseline + declared knob
   deltas only (VG.2); one `wildcard` vector when `burst > 0`. Record
   them in DNA `variants[]` (VG.1, LAW.DNA); knob diffs vs baseline are
   shown on each tile.
2. Fill `DESIGN-PLAN.md` `direction:` — temperature (C.2), density
   (G.3), finish, type_contrast (T.3), shape (S.1), motion (M.1) —
   plus `refused`, the generic default this direction replaces.
   `direction:` axes are derived from the knob vector, never free text.
3. `assemble.py --variants` writes `preview/variants.html` — the
   **picked layout's page rendered in each look direction**: full
   responsive page mockups with the real copy and every value from the
   DNA knobs (`data-pane="page"`), plus the implicit system sheet
   (`data-pane="system"`, generated and gated but never the choosing
   surface). VG.4 sticky Variant/Viewport/Mode switcher, 1:1 container
   frames, both modes, no horizontal overflow at 375/768/1280.
4. Every variant applies its deltas as `[data-variant-scope]` CSS vars
   — two variants must render different computed values (VG.2).
   Failing variants are removed, never greyed (VG.3).
5. Operator picks one variant; the pick is recorded with
   `--design <variant-id>` and stored in `GATES.json` (decision
   point 2).

## Rules that apply

- **VG.1–VG.6** picker shape, vectors, all-pass-only, switcher.
- **C.5** both modes render in the picker itself.
- **D.3** variants differ in ≥1 knob — duplicates are one variant.
- **P.3/P.4** no wireframe here — structure picked at W3.

## Exit gate

```bash
python3 tools/design-gate/run.py w4 <pipeline-dir> --design <variant>
```

Checks: variants.html present (HTML picker), exactly 3 knob vectors, deltas
applied + within bounds, sheet in both modes, only passing variants
rendered. Then the operator approves in chat or clicks Approve → `run.py nonce w4 <dir>` → `run.py approve w4 <dir> --nonce N` (locks DNA v1).

- LAW.REF (REF.1): every look-knob choice traces to a canon ref; the W4 picker passes `gate.py round` (scores, visual review, refs) before the operator sees it.

## Done when

`approval_state(w4) == 'ok'` — a signed operator record verified
against current inputs (the designer-writable `GATES.json` flag is
never the criterion) — `design` names a rendered picker option, and
`CHECKLIST/w4.md` has no blank evidence (P.9).
