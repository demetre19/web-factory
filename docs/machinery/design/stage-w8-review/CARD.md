---
id: card-w8
type: card
wave: w8
links:
  uses: [dna-map, rules-DM, rules-VG, rules-T, rules-C, rules-L, rules-S, rules-V, rules-M, rules-R, rules-W, rules-E, rules-P, rules-SB, section-build]
  enforced_by: [check_review_completeness, check_scorecard, check_style_review, check_novelty, check_review_modes, check_variants, check_checklist, check_dna, check_dna_fresh]
---

# W8 — Independent review (screenshots + rubric → REVIEW.json)

**GOLDEN RULE: ASTRO is the goal; TAILWIND is non-negotiable.** The
reviewer reads Astro output; it never re-draws the design. (P.1)

**Read DNA map. Every decision traces to it.** Review scores every
finding against the locked map (`DNA.json` + `DNA.md`); a page that
drifts from it fails regardless of how it looks (`gate.py dna`).

A reviewer model — **different model than the designer** — scores the
built page against the stage CARDs. Evidence: rendered screenshots at
1280, 768, 360 vs the chosen wireframe card and the system tile. The
reviewer writes `REVIEW.json` + `shots/`; the designer NEVER writes
`GATES.json` or `REVIEW.json` — QA is never self-graded (P.8).

## REVIEW.json contract

```json
{"reviewer_model": "…", "designer_model": "…",
 "items": [{"rule": "T.1", "rubric": "three-tier-read-order",
            "pass": true, "evidence": "shots/home-1280.png",
            "note": "…"}]}
```

Every rubric item scored; `evidence` names a real screenshot; a fail
blocks like a script fail (P.8). `T.5/T.10`-style combined rows score
each named rule in `items` (one row per rule).

## Rubric items (rule → judged as)

- `T.0` type-restraint — restraint over excess reads on screen
- `T.1` three-tier-read-order — focal hierarchy at a glance
- `T.5` composition-inset — blocks anchor to one axis; `T.7`
  section-type-application; `T.9` reading-path; `T.10`
  composition-inset; `T.11` type-refusals
- `L.3` edge-insets — nothing jams the viewport edge
- `L.4`/`L.6` negative-space-gestalt — space assigned, grouping reads
- `L.5` collapse-integrity — collapse renders per plan
- `L.9` asymmetry-desktop — asym desktop / sym mobile
- `C.3` neutral-tint — neutrals chromatic, not grey-on-grey
- `C.4` accent-harmony — accent reads intentional
- `C.6` derivation-order — provenance tags honoured on screen
- `C.7` surfaces-match-tile — same tokens, same feel as W3
- `G.2` proximity-law — group/section gap ratio visible
- `G.4` gutter-devices — rules/containers act as gutters
- `S.3` component-radius; `S.4` concentric-radius; `S.5`
  border-widths; `S.6` shape-permissions; `S.7` elevation-radius;
  `S.8` one-personality
- `I.4` icon-text-pairing; `I.6` icon-literal; `I.7` icon-states
- `V.0` media-words-first; `V.1` media-matrix; `V.4` scrim-contrast;
  `V.5` bg-density; `V.6` authenticity; `V.7` art-direction; `V.8`
  media-qa
- `M.2` motion-tokens; `M.3` motion-element-class; `M.4`/`M.8`
  motion-personality; `M.5` parallax-license; `M.6` reduced-motion
- `R.4` copy-density; `R.5` above-fold-360; `R.7` sizing-modes
- `W.1`/`W.5` tone-errors; `W.3` heading-labels; `W.6` empty-states;
  `W.7` link-scent; `W.9` i18n-copy; `W.10` writing-qa
- `E.2` query-vs-claim; `E.3` seo-lint
- `P.4` page-vs-wireframe — same sections/order/ratios at 1280
- `P.6` page-vs-tile — same radius/disclosure/icons/buttons

## Exit gate

```bash
python3 tools/design-gate/gate.py w8 <pipeline-dir>
python3 tools/design-gate/gate.py score <pipeline-dir>
```
REVIEW.json parses; every rubric item scored; reviewer ≠ designer;
evidence files exist under `shots/`; 1280/768/360 renders +
wireframe/tile side-by-sides present; zero fails. `score` writes
`SCORECARD.json`/`SCORECARD.md`: every SOP section (T C L G S I V M R W
E P PS D) ≥ 90 and `check_scorecard` blocks otherwise. Operator gives
the final approval — preview is NEVER shown to the operator unless all
gates are green.

## Done when

`GATES.json.w8.approved` is true, `SCORECARD.json` has no section
below 90, and `CHECKLIST/w8.md` has no blank evidence (P.9).
