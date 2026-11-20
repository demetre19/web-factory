# EMIT-CHAIN FIX SCOPE — smallest change set per confirmed gap

Basis: `EMIT-CHAIN-AUDIT.md` + `EMIT-CHAIN-AUDIT-REVIEW.md` (adversarial).
Principle: SOP produces → `gate.py` judges. Producers are scripts where
the artifact is deterministic (tokens, config, scaffold, system tile);
the W6 `.astro` builder stays agent-driven (W6 CARD) but gets a real
writer so its output is reproducible.

## Rank 0 — scaffold self-violation (must fix first; starter fails
its own gate before a builder writes a line)

| # | Gap | Change | Owner |
|---|---|---|---|
| S1 | `templates/astro` starter ships `<style>` blocks + `rgb(`/`px` literals in Footer/Header/MobileCTA/SocialLinks/404/BaseLayout (P.2/P.5 fail on `cp`) | strip literals → token-bound classes; no `<style>` in components | `templates/astro/src/**` |
| S2 | starter `global.css` has none of the five TK layers | replace with merge of `emit_tokens` layers + `@layer components` conventions (`.sec-band`, `[data-surface]`, `prefers-reduced-motion`, `--text-wrap`, `--input-*`, `.flow`) — recipe already exists inside `gen_fixtures._global_css` (1028-1036+TAIL); extract to real code | new `emit_global.py` (or extend `emit_tokens.py` with `--full`) |
| S3 | starter `tailwind.config` lacks `darkMode`, lacks TOKENS hexes | config generator: theme keys + `darkMode:'class'` + every TOKENS hex inlined | new `emit_config.py` |
| S4 | stale `templates/astro/dist/index.html` ships | delete from scaffold | `templates/astro/` |

## Rank 1 — the emit chain producers (deterministic → script)

| # | Gap | Change | Owner |
|---|---|---|---|
| P1 | `TOKENS.json` writer — `dna_tokens.derive` shape ≠ gate shape; only hex-walk + knob audit truly need it (`_modes` falls back to DNA.json modes) | `build_tokens.py`: dna_json→TOKENS `{knobs, color:{modes:{light,dark}.roles}}`; verify vs `check_tailwind_derivation` (2099-2129) + `check_dna` (6917-6929) | new `emit_tokens_json.py` or `dna_tokens.tokens_json()` |
| P2 | `Section.astro` instantiation — no CARD names it; unconditional import at assemble_page:6405 | copy `templates/sections/Section.astro` → `site/src/components/Section.astro` in scaffold step | `emit_global.py`/scaffold step |
| P3 | system tile — `preview/system.html`/`system.astro` producer; exemplar lacks `data-theme-toggle` (fails even faithful copy) + README points at stale `site/design-dna/` | fix `templates/system-tile` to carry `data-theme-toggle` + correct path; emit into pipeline | `templates/system-tile` + build step |
| P4 | `preview/fine.html` producer — hard P.18 block at w4, no `--fine` flag | add `assemble.py --fine` variant (mock sections, knob-scoped) or `gate.py` subcommand | `assemble.py`/`gate.py` |
| P5 | `preview/candidates.html` unreachable — `assemble_candidates` exists, no CLI path | wire flag/subcommand | `assemble.py`/`gate.py` |
| P6 | `ASSEMBLED.md` dead ARTIFACTS entry | emit trivial receipt at w7 or remove entry | `gate.py` ARTIFACTS |

## Rank 2 — the W6 builder (agent-owned; make the write path real)

| # | Gap | Change | Owner |
|---|---|---|---|
| B1 | `src/components/sections/<Sec>.astro` — no producer; frontmatter needs `dna_hash:` (mandatory) + `exemplar:`; body renders `<Comp/>` | `build_section.py`: contract + exemplar `templates/sections/<comp>/<Camel>.astro` → adapted component (props from contract.content, tokens from TOKENS); section wrapper emits frontmatter + `<Comp/>`. `structure_hash:` optional | new `build_section.py` |
| B2 | `src/components/<comp>.astro` composition + `COMPONENTS.md` map | same builder: copy exemplar skeleton → `src/components/<comp>.astro`, adapt only copy/token props (never outer classes — SB.2) | same |
| B3 | `topology_id→composition` map — bank `topo.topology_id` (19 ids, only 1,979 rows carry it) + `style_tags.composition` (19-id different vocab on 12,152 rows) have no catalog map | `patterns/data/topo-map.json`: bank topo_id + style_tags.composition → catalog `<comp>`; `retrieve_section` consumes it as the structure picker | `retrieval.py` + new map file |

## Rank 3 — byte-locked emit paths (fix inside gate.py, not outside)

| # | Gap | Change | Owner |
|---|---|---|---|
| J4 | `data-recipe`/`data-seam` un-emittable — `check_assembly` byte-locks `assemble_page` output; `Section.astro` has no props | add props + emit inside `assemble_page`/`Section.astro` themselves (the lock means only the producer can write them) | `gate.py` + `templates/sections/Section.astro` |
| SKL | `data-skeleton` same trap | same | same |

## Explicitly out of scope (by design)

- `DESIGN-PLAN.md`, `STUB.md`, `MOBBIN-REFS.md`, `CANDIDATES.json`,
  `SOP-CONSTANTS.json`, `REVIEW.json`, `CHECKLIST/*.md` — SOP/model
  artifacts, operator/agent work (GAP10 confirmed intentional).
- Orchestration interleave (`run.py` only calls `gate.py <wave>`) is
  manual-by-design per SECTION-BUILD §2 — document the producer order
  in the CARDs, don't script a runner (GAP8).
- `retrieve_section` callers — it was dead before ba8b94f9; B3 makes
  it live only when the builder consumes the map.

## Order of execution

S0 scaffold → P1-P6 producers → B1-B3 builder + topo map → J4/SKL
byte-lock → headless variance run → adv-review → ready.
