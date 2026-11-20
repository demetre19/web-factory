# RULES — operator rules for every page of this site

Operator-owned. Gates pin this file's sha256 in each page's `RUN.json` (X.2); editing it mid-run fails every later wave.

| ID | Rule | Enforced by |
|---|---|---|
| U.1 | Copy is the driver; the design fits the copy. | `plan_from_copy.py`; gates I.2, I.4 |
| U.2 | Plans come from machinery steps, never the agent. The machinery ingests the SEO plan (stub) and the copy (article). | `copy_ingest.py`, `plan_from_copy.py`; gates I.1, I.3, X.1 |
| U.3 | Light means light: white canvas `#FFFFFF`, light on first paint, OS dark setting ignored. | BRIEF `theme`; gates T.1, C.5′, T.2 |
| U.4 | The article is used verbatim. No invented headings, quotes, stats, logos or eyebrows. | gates I.2, F.1, F.2 |
| U.5 | SOP model: stage = tool steps in order, then a gate; BLOCKED stops; every gate input was produced by an earlier tool. | `pipeline.py`; gates X.1–X.4, P.17 |
| U.6 | The operator picks layouts and looks. The agent never approves. | `run.py approve` (operator terminal); gate X.3 |
| U.7 | Step one discovers the site type, colour scheme and vibe; the result goes into the design DNA. | `discovery.py`, `dna_from_discovery.py`; gate D.1 |
| U.8 | One design folder per website. Every agent reads only this folder; `DESIGN-SYSTEM.md` is the single design reference. | `site_folder.py`; gate X.5 |
| U.9 | Every size is fluid: font sizes, section padding, gaps, gutters and spacing are each ONE `clamp()` from the clamp calculator (mobile base+ratio → desktop base+ratio). | `clamp.py`; gate FL.1 |
| U.10 | Automatic.css (ACSS) is the guide for ANY CSS decision. Diverge only with a written reason in the DNA provenance. | `ACSS-FLUID-REFERENCE.md`; gates FL.1, AC.1 |
