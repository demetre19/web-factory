# 0002 — the signed w4 look pick projects into the shipped artifact

## Context

The w4 look round emits three variant pages (preview/look-v*.html) and
the operator signs one — but the shipped artifact measured identically
under pick v1/v2/v3: TOKENS.json re-derives from DNA.json at every emit
(P1), and nothing bound the pick's knob deltas into the emitted css.
The deltas lived only in the preview frame's `data-variant-scope`
wrapper, so the pick was recorded but never projected downstream.

## Decision

The pick binds as an **emitted `:root` override layer** — one
`<style data-look="…">` appended at the end of `<head>` in
`site/html/<slug>.html`, so it wins the cascade over the inlined
layers. TOKENS.json and `global.css` stay DNA-pure (DM.3 requires
TOKENS knobs == the DNA map; DS.2 compares emitted css decls to
TOKENS verbatim), so the override lives only in the self-contained
artifact — the file the downstream LLM consumes — never in src or
dist, where P.2's shared-layer scan rules it out.

The knob→css projection is one shared function,
`emit_global.look_scope(rec, deltas)`: emit the TOKENS record with the
deltas merged (fluid settings re-derived the way each delta moves
them, scaled onto the record's pinned values), diff every
`--name: value` declaration vs the record's own emit. Preview variant
scopes and the shipped layer both bind this map — there is no
parallel knob→css table.

## Consequences

- `pipeline_emit` resolves the signed pick from the w4 approval
  record, fails loudly when the design is not a declared variant, and
  injects the layer during `--html` artifact derivation. Scaffold
  emits and the baseline variant (empty deltas) produce no layer.
- Deterministic: the layer is a pure function of DNA.json + the
  signed pick + VARIANT-GATES.json — `repro.py` replays
  byte-identical given the same signed pick.
- Evidence/measure serve `site/` and shoot `/html/<slug>.html` in
  HTML mode, so the judge measures the picked look.
- The preview scope path (`preview_build._semantic_scope`) delegates
  to `look_scope` — identical output, one implementation.
