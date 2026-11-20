# Web Factory — cloud-agent handoff

Repo: `git@github.com:demetre19/web-factory.git` (commit 469ee751+).
Everything the pipeline needs is in this repo EXCEPT:
- `INPUTS/` = the operator inputs you would otherwise fetch from
  `~/Documents/DEV-WORK/{BLUEPRINTS,DESIGN-SYSTEMS}`. For a clone,
  set `BRIEF.yaml`'s `site.blueprint` to the repo path
  `INPUTS/whistle-clean-australia/BLUEPRINTS` (or copy INPUTS to
  `~/Documents/DEV-WORK/` under the real names and keep BRIEF as-is).
- `templates/astro/node_modules` is gitignored — run
  `npm ci` inside `templates/astro/` once (pinned lockfile), or the
  pipeline's `--with-toolchain` clone will fail.
- The Ed25519 signing key lives OUTSIDE the repo
  (`~/.config/web-factory/approval-signing.key`) and is auto-created
  on first `approve_service.py serve` — no setup step needed.

## What the project is

A **machinery-first** design pipeline. An agent never writes a plan,
a copy line, a CSS value or an approval — tools produce every artefact
and a gate checks every wave. The SEO SOP (BLUEPRINTS → article +
stub) drives everything; Automatic.css (ACSS) is the guide for every
size; Mobbin is the visual reference corpus.

Read `docs/machinery/MACHINERY-FIX-PLAN.md` §0 for the U-rules and
`tools/design-gate/test_loop.sh` for the green-from-scratch contract.

## The run

```bash
cd Web Factory
python3 -X pycache_prefix=/tmp/pc \
  tools/design-gate/pipeline.py \
  INPUTS/whistle-clean-australia/DESIGN-SYSTEM/pages/strata-cleaning-melbourne
```

- Runs s0 (discovery) → w8 (repro) headlessly.
- **Two operator picks only**: w3 = page layout, w4 = look. Each opens
  `http://127.0.0.1:4173/picker?pipeline=…` — the picker serves REAL
  Astro-built pages, not mocks. Click a card; the run resumes.
- Everything else auto-advances on gate PASS; any BLOCKED stops the
  run and says exactly which producer/check failed.
- `test_loop.sh` = the "2 consecutive clean" acceptance.

## The quality bar (user decree)

The built page must be **demonstrably better than
https://whistlecleanaustralia.com.au/** — real imagery, icon chips,
testimonial/proof treatment, brand surfaces, ACSS fluid type. Not
plain text on white. Compare against `INPUTS/.../live-site.png`
(the baseline screenshot).

## What's verified green now

- `gate.py selftest`: 309 fixture runs / 155 checks PASS
- `repro.py`: every generated file byte-identical on rebuild
- `test_loop.sh`: 2 consecutive clean s0→w2 iterations
- w3 pick → projected re-gate → w4 picker stop (e2e on scratch)
- Adversarial review: forged approvals, edited copy, hand-written
  plans, fixed-px CSS, dark-mode defaults, invented text — all caught

## What still needs doing

1. Finish the w4→w8 end-to-end on the real page (ORDER re-gate after
   layout projection is the last verified blocker area).
2. `MOBBIN-REFS.md` needs `service`-type rows for the strata page
   (P.14) — Mobbin searches + append; the agent must read the images.
3. Visual sign-off: screenshots at 1280/768/360 of the final built
   page vs `/tmp/live-site.png`.
