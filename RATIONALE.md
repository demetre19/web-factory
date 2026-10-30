

## 2026-10-30 — web-factory-s2-tone-plan plan.json

Full step-by-step breakdown of **Stage S2 — Tone fingerprint + content plan** for the Web Factory (prd-herdr-driven Astro site factory). Two outputs designed here: `tone-profile.md` and `content-plan.md`. Deliverable: research/WEB-FACTORY-S2-TONE-PLAN.md elegance: {"rung": 2, "lower_rungs_rejected": {"r1": "writing the spec inline in the PRD draft buries it — the stage spec is a reviewed artifact"}, "trigger_kind": {"kind": "event", "predicate": "no S2 spec exists for NEW-WEBSITE runs to mint tone lanes", "acted_by": "the stage-spec lane"}}


## 2026-10-30 — web-factory-s3-writing plan.json

Full step-by-step breakdown of **Stage S3 — Content writing** for the Web Factory: parallel pi/WRITER-bound lanes produce `content/<page>.md` per content-plan row — money pages vs article pages, SEO-first heading discipline. Deliverable: research/WEB-FACTORY-S3-WRITING.md elegance: {"rung": 2, "lower_rungs_rejected": {"r1": "inline spec in the PRD draft buries it"}, "trigger_kind": {"kind": "event", "predicate": "no S3 spec exists", "acted_by": "the stage-spec lane"}}


## 2026-10-30 — web-factory-s4-interlink plan.json

Full step-by-step breakdown of **Stage S4 — Interlinking + AI-artifact cleanup** for the Web Factory: `link-graph.md` as a reviewable artifact, then injection into `content/*.md`, then the watermark/AI-tell removal pass producing `content-final/`. Deliverable: research/WEB-FACTORY-S4-INTERLINK.md elegance: {"rung": 2, "lower_rungs_rejected": {"r1": "inline spec in the PRD draft buries it"}, "trigger_kind": {"kind": "event", "predicate": "no S4 spec exists", "acted_by": "the stage-spec lane"}}


## 2026-10-30 — web-factory-s5-design-dna plan.json

Full step-by-step breakdown of **Stage S5 — Design DNA → Astro build** for the Web Factory: how operator-supplied HTML/page refs and/or a Design-library Website Build DOX packet become a Tailwind-classed Astro site under `sites/<slug>/` built on the vendored `templates/astro/` starter. Deliverable: research/WEB-FACTORY-S5-DESIGN-DNA.md elegance: {"rung": 2, "lower_rungs_rejected": {"r1": "inline spec in the PRD draft buries it"}, "trigger_kind": {"kind": "event", "predicate": "no S5 spec exists", "acted_by": "the stage-spec lane"}}


## 2026-10-30 — web-factory-s6-integrations plan.json

Full step-by-step breakdown of **Stage S6 — Integrations + security hardening** for the Web Factory: forms/email (Resend or SMTP/Google Workspace), SMS notify (Twilio-class), SSL, security headers, env/key manifest handling — degrade-not-block per missing credential. Deliverable: research/WEB-FACTORY-S6-INTEGRATIONS.md elegance: {"rung": 2, "lower_rungs_rejected": {"r1": "inline spec in the PRD draft buries it"}, "trigger_kind": {"kind": "event", "predicate": "no S6 spec exists", "acted_by": "the stage-spec lane"}}


## 2026-10-30 — web-factory-s7-gate-deploy plan.json

Full step-by-step breakdown of **Stage S7 — Build gate + launch** for the Web Factory: `astro build` + SEO verification gate + rsync deploy to the site declared SSH host, ending in the operator ~10% tweak loop and seal. Deliverable: research/WEB-FACTORY-S7-GATE-DEPLOY.md elegance: {"rung": 2, "lower_rungs_rejected": {"r1": "inline spec in the PRD draft buries it"}, "trigger_kind": {"kind": "event", "predicate": "no S7 spec exists", "acted_by": "the stage-spec lane"}}


## 2026-10-30 — web-factory-adversarial-review plan.json

Independent adversarial review of the Web Factory stage architecture as a *system*. Evidence/context: the specs live under research/ in this repo — read them, do not trust their own Contested sections (self-review). Files: DISCOVERY-RESEARCH-web-factory.md, WEB-FACTORY-S1-SITEMAP.md, WEB-FACTORY-S2-TONE-PLAN.md, WEB-FACTORY-S3-WRITING.md, WEB-FACTORY-S4-INTERLINK.md, WEB-FACTORY-S5-DESIGN-DNA.md, WEB-FACTORY-S6-INTEGRATIONS.md, WEB-FACTORY-S7-GATE-DEPLOY.md. Any spec missing at lane time = mark ABSENT and review what exists. Deliverable: research/ADVERSARIAL-REVIEW.md elegance: {"rung": 2, "lower_rungs_rejected": {"r1": "self-review inside each spec is not independent review"}, "trigger_kind": {"kind": "event", "predicate": "7 stage specs exist with no cross-stage review", "acted_by": "the adversarial-review lane"}}


## 2026-10-30 — draft-web-factory-prd plan.json

Author `PRD-Web-Factory-2026-10-30.md` at the Web Factory repo root — the
product-requirements document for the Web Factory: a prd-herdr-driven
stage pipeline that turns a `NEW-WEBSITE` trigger into a launch-ready
Astro static site. This PRD is the Stage-2 deliverable of the NEW-PRD
flow; every stage spec already exists and is landed — your job is the
synthesis, not new stage design.
