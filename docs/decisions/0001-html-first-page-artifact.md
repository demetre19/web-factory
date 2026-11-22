# 0001 — HTML-first page artifact; astro demoted to a terminal step

- **Status:** accepted
- **Lane:** HTML-first iteration (operator directive 2026-11-22)
- **Date:** 2026-11-22
- **Report:** `tools/design-gate/pipeline_emit.py::_html_artifacts`

## Context

Operator directive: astro is the slowest part of the build and is
"basically HTML wrapped in astro components" — the iteration path must
run on fast HTML, and astro is emitted only at the END, by an LLM, once
the look is certain. A second directive: the artifact handed downstream
is the whole page saved as ONE .html (not a screenshot), with full
styling embedded — Tailwind via CDN in the head plus the page's
design-token CSS inlined; media may stay relatively referenced.

## Decision

Make the pipeline's page artifact a standalone `.html` file at
`site/html/<slug>.html`, derived from the emit's internal build: the
Tailwind CDN script + token `tailwind.config` + the compiled stylesheet
inlined into `<head>`, and dist asset URLs rewritten relative
(`../dist/...`) so the file renders served or from disk. `pipeline_emit
--html` replaces `--build` at w6; `--astro --build` stays as the
opt-in terminal packaging step for the downstream LLM.
`check_astro_build` is skipped in HTML mode (astro is no longer a wave
gate). `evidence.py`/`measure.py` serve the site root and shoot the
HTML artifact; `template_export.py` reads `site/html/<slug>.html`
first; `repro.py` replays `--html` and byte-compares `site/html/`
alongside `site/dist/`.

## Consequences

- The canonical artifact is a single self-contained file the downstream
  LLM consumes directly — no screenshot re-interpretation.
- Astro build still runs once inside the emit (sanctioned first
  increment); a direct astro→static renderer that removes the last
  build is a follow-up.
- dist remains the internal intermediate — every dist-reading gate
  check (P.*, DS.*, T.2, J.*, `_dist_sha`, REVIEW re-sign) is
  untouched.

## Evidence

- `tools/design-gate/pipeline_emit.py::_html_artifacts`
- `tools/design-gate/evidence.py::shots`, `tools/design-gate/measure.py::_pw`
- `tools/design-gate/template_export.py`, `tools/design-gate/repro.py`
- `gate.py::check_astro_build` (HTML-mode skip)
- Verified run: `pipeline.py INPUTS/whistle-clean-navy/.../strata-cleaning-melbourne --wait`
  — w0–w7 CLEAR, w8 fail is the known J.12 image-coverage 0.0461
  (unchanged); `repro.py` byte-identical; `gate.py selftest` PASS.
