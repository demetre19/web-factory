# AUDIT-S7-GATE-DEPLOY — adversarial audit: build gate + launch module

Lane: `AuditGateDeploy` · 2026-11-02
Sibling audits: S0–S6 + new-stage lanes (responsive, animations) audited in
parallel; this file covers S7 only — the module where every upstream
contract is cashed out or exposed as unpayable.

**Verdict up front:** the 13-check gate is a sound *metadata* battery but
verifies neither the content contract (headings, words, snippets, thin
leaves) nor the graph contract (orphans, leaf→pillar flow), and the deploy
sequence deploys **only `dist/`** — meaning the S6 hardening artifacts
(`.htaccess`, nginx snippet, ACME cert, env secrets, security headers)
currently have no path to the host at all. S7 as specced ships a site that
passes its own gate while serving no security headers, no TLS, and a form
that has never been submitted. The module needs (a) three new gate inputs
(`content-plan.md`, `link-graph.md`, `integrations.json`), (b) a ~26-check
gate, (c) a decomposed deploy procedure (preflight → deploy → host-config →
post-deploy verify), and (d) two artifact seams for the responsive and
animation lanes. Findings F1–F18, ordered by blast radius.

## 1. Scope audited

Files read, in full unless noted:

| File | Role |
|---|---|
| `research/WEB-FACTORY-S7-GATE-DEPLOY.md` (all 331 lines) | The audited spec |
| `skills/s7-gate-deploy/SKILL.md` | Lane skill — faithful condensation of the spec, inherits every gap |
| `docs/machinery/WEB-FACTORY.md` | Runbook — deploy contract §102-122, failure table, OI-7 |
| `PRD-Web-Factory-2026-10-30.md` | D6 (deploy = rsync + symlink flip), §4 gate model, OI-7 (`seo-gate` tool) |
| `research/WEB-FACTORY-S6-INTEGRATIONS.md` | The upstream contract S7 must consume — registry, ACME, headers, form endpoint |
| `research/WEB-FACTORY-S4-INTERLINK.md` | Graph rules the gate should re-verify (orphans, caps, `present`) |
| `research/WEB-FACTORY-S3-WRITING.md` | Heading discipline, word targets, answer-first rule |
| `research/WEB-FACTORY-S2-TONE-PLAN.md` | `content-plan.md` schema (`word_target`, `heading_skeleton`, `intent`) |
| `research/WEB-FACTORY-S5-DESIGN-DNA.md` | `ROUTE-MANIFEST.json` producer, self-containment rule |
| `research/WEB-FACTORY-LOCATION-PAGES.md` | §Step 13 explicitly assigns S7 two new checks (cluster lint + thin-leaf); D6 folder semantics |
| `research/WEB-FACTORY-SITEMAP-SOP.md` | Tool-stub list (§10.4), taxonomy classification table |
| `/Users/apple/Developer/prd-herdr/research/WEB-FACTORY-S1-SITEMAP.md` | The lock S1 promises S7 verifies (:116), ancillary-matrix check promise (:223), redirect rows (Step 1) |
| `templates/astro/` | Starter reality: `@astrojs/sitemap` emits `sitemap-index.xml`; `SEOHead.astro` emits canonical/OG; `robots.txt` and `_headers` ship `example.com` placeholders |
| `~/.ssh/config` | `Host jump` exists at :26; `ProxyJump` hop is real |

`tools/` **does not exist in the repo** — every `tools/*.py` referenced by
the corpus (`sitemap_lint.py`, `competitor_sitemap.py`, `kw_volume.py`,
`seo-gate`) is an unlanded stub (OI-7/OI-8, SITEMAP-SOP §10.4).

**Module boundary:** S7 owns everything after `sites/<slug/` is S6-wired:
build → artifact verification → transport → host state → post-deploy
verification → operator loop → seal. It owns *verification* of upstream
contracts, not their production.

## 2. Current contract

| Surface | As specced today |
|---|---|
| Inputs | `sites/<slug>/`, `site/sitemap.md`, `site-brief.md` `## Deploy` (4 keys: `host_alias`, `user`, `docroot`, `url`), `site/design-dna/ROUTE-MANIFEST.json` — spec :66-72 |
| Mint preconditions | build-exited-0 re-verify, sitemap↔manifest row parity, `## Deploy` complete, `content-final/` count — spec :102-112 |
| Sequence | probe → clean build → 13-check gate → commit report → rsync+symlink flip → 3-fetch smoke → operator loop → seal — spec :133-198 |
| Gate | 13 checks vs `dist/`: route parity, title, meta desc, canonical, H1 count, OG, sitemap.xml, robots.txt, internal links, self-containment, img alt, form action resolves, heading levels — spec :200-221 |
| Deploy | `rsync -az --delete --delay-updates` → `releases/<ts>/`, `ln -sfn` flip, prune to 5 — spec :158-165 |
| Smoke | `/` 200+title, one money route, sitemap file 200; fail → `ln -sfn` back — spec :166-172 |
| Human gate | `APPROVE SITE` — operator sees live `<url>` + both reports — spec :173-178, runbook :75 |
| Outputs | `site/seo-gate-report.md`, `site/deploy-report.md` + `## Seal` — spec :227-249 |

## 3. Discovery-question expansion — what this stage must be able to answer

S7 is the stage where intake declarations meet a live host. Question bank,
grouped by the operator's expansion themes; **(GAP)** marks questions the
current contract cannot answer.

### Source & authenticity of the deploy target

- Where does `host_alias` come from and who proved it works? — declared at
  S0 (runbook :48-49), probed at S7 step 2 (spec :138-142). Probing is the
  *first* verification, one step before build — acceptable, but the probe
  only tests `docroot` writability. **(GAP)** Nothing verifies DNS: does
  `url`'s A/AAAA record point at the host *before* deploy, or is the
  ordering deploy-then-DNS? ACME (F3) makes this load-bearing.
- **`host` type is consumed but never declared.** S6 mint requires
  `site-brief.md` `host` (`type: apache|nginx|static-only`, SSH alias) —
  S6 spec :37-38. The `## Deploy` YAML schema (S7 :78-83, runbook :107-112)
  has no `type` key. **(GAP)** — one intake field, two schemas.
- Is `jump` a fixed global alias? `~/.ssh/config:26` shows `Host jump`
  exists; the lane reads aliases only, never embeds hosts (spec :86-88).
  Bound holds; the probe covers reachability implicitly.
- Where do env *values* live on the host? S6 says "the host's environment
  (`export` in the deploy user's profile or the panel's env UI)" (S6
  :273-275). **(GAP)** `## Deploy` carries no `secrets_path`/mechanism;
  S7 has no step that lands or verifies secrets (F8).

### Classification → artifact checks

- Can the gate verify intent→shape? `sitemap.md` rows carry `intent` and
  `page_class`; `content-plan.md` carries `word_target`,
  `heading_skeleton`, `intent` — **none are gate inputs** (F5). Today the
  answer is no.
- Query intent on the page: S3 shapes H2s by intent (`informational` →
  question-form, :103-107). A dist-level check (money page ends on CTA,
  article carries ≥1 question-H2) is mechanical once the plan is an input.

### Competition census → sizing

- "Match the call, not a floor": `word_target` today is a *type-default
  band* (S2 :128-129 — money 800-1200, article 1200-1800), not a
  SERP-winner measurement. **(GAP)** No upstream artifact records
  competitor page sizes per route; the SOP's Step-5 competitor extraction
  captures taxonomy and title formulas, not word counts. S7 can lint
  `word_target ±15%` the day the plan records it, but cannot lint
  "matched to winners" until S1/S2 emit the evidence (F18).

### Deployment truth

- Does the form actually deliver? Check 12 proves `action` resolves —
  nothing proves a POST lands in `contact_email`. S6 *expects* S7 to run
  "a real submission to the staging URL, then the live one" (S6 :364-365).
  **(GAP)** — and email *receipt* is mechanically unverifiable; needs an
  operator-confirm ask.
- Existing-site redirects: S1 Step 1 classifies routes `keep|redirect|
  drop` and records 301 targets (S1 spec :48-51). **(GAP)** No artifact
  carries that map to the host; nothing deploys 301s (F17).

## 4. Gap findings

### F1 — BLOCKER: the S6→S7 hand-off contract is unimplemented — S7's spec never mentions integrations

S6's downstream contract, verbatim: "S7 runs `astro build`, deploys
`dist/` **plus the S6 artifacts**, applies the header config on the
declared host, and refuses to seal while `site/INTEGRATIONS.md` reports a
degraded `form_delivery` capability the operator has not waived" (S6 spec
:41-46); "S7 flips `ssl` and `security_headers` to `live` only when its
post-deploy probes pass" (S6 :138-141).

S7's spec contains **zero** of this: `integrations.json` and
`INTEGRATIONS.md` are absent from the Inputs table (:66-72), absent from
mint preconditions, absent from the 13 checks (check 12 verifies a
`<form action>` resolves — never that `form.php` exists or that the
registry declares `form_delivery`), absent from deploy steps, absent from
smoke. A green S7 run on a site where S6 marked `form_delivery` degraded
seals without a waiver — the exact outcome S6's contract forbids. The
waiver path itself is undeclared (where does the operator record it?).

### F2 — BLOCKER: `rsync dist/` cannot deploy the hardening layer — `.htaccess` lives outside `dist/`, the nginx snippet has no destination

- S6 emits `.htaccess` to `sites/<slug>/.htaccess` (S6 :249-250) — a
  project-root file. `astro build` only carries `public/` into `dist/`.
  S7 rsyncs `dist/` exclusively (:160-162). **On Apache, the security
  headers, ACME passthrough, and redirect stanzas never reach the host.**
- S6 emits "the nginx `server` snippet" (S6 :250, :306-308) for `nginx`
  hosts. S7 declares no nginx conf path, no reload step, no `nginx -t`.
  **(GAP)** `## Deploy` needs `nginx_conf_path` (or the panel mechanism);
  the deploy step needs a conf-install + test + reload sub-step.
- Only `public/_headers` survives into `dist/` — correct for
  Netlify-class `static-only` hosts, which are also the only hosts where
  `form.php` cannot run (S6 :359-361). The rsync contract silently
  assumes the Apache/PHP shape S6 merely *prefers*.

### F3 — BLOCKER: SSL/ACME is assigned to S7 by S6 and absent from S7's spec

"S7 runs ACME at deploy" (S6 :230); the ordering rule — ACME challenge
passthrough live → cert → arm `http→https` 301 → arm HSTS — is explicit
in S6 (:236-245, :366-368). S7's spec has no cert step, no ordering, no
`curl -sI https://` verification, no HSTS arm. As specced the site
deploys with `Strict-Transport-Security` dormant forever and no
`http→https` redirect — or, worse, someone arms it manually with no
record. The `ssl` registry row stays `pending` at seal because nothing
flips it (F1's contract break compounded).

### F4 — MAJOR: promised gate checks exist upstream and were never adopted into the 13

- **URL=H1=title-tag lock re-derivation.** S1 :116: "S7's gate battery
  re-derives all three from the row and greps the built HTML —
  disagreement is a red gate." The landed table has title-length and
  H1-*count* checks but no triad comparison against `sitemap.md` rows.
- **Ancillary-matrix presence.** S1 :223: the static matrix exists so
  "S7 checks every `required` ancillary route exists in the built site."
  Check 1 (route parity vs `ROUTE-MANIFEST.json`) approximates it but
  cannot catch a manifest that itself dropped `/privacy-policy/` — the
  check needs the matrix, not the manifest.
- **Location cluster lint + thin-leaf check.** LOCATION-PAGES §Step 13
  (:312-316) names them verbatim as "Gate checks (S7 additions)": ≤25
  leaves, index exists, every leaf index-linked, no leaf outside
  `service_area`, folder slug `service-areas` (D6); ≥300 suburb-unique
  words, FAQ-answer uniqueness across leaves, suburb token in H1 + ≥2
  modules. §7 (:327) lists "S7 | Two new checks." The S7 spec table
  carries neither — landed S7 predates/ignores the location research.

### F5 — MAJOR: the gate has no content or graph inputs — heading skeletons, word targets, intent shape, interlink invariants are all uncheckable

The Inputs table (:66-72) lacks `content-plan.md`, `link-graph.md`,
`content-final/` bodies, `site-brief.md` `service_area`, and
`integrations.json`. Consequences:

- `heading_skeleton` order/presence — S3's contract (:93-96) — has no
  artifact-side re-verify.
- `word_target ±15%` — S3's lint (:178-179) — has no artifact-side
  re-verify; nor does the operator's SERP-winner sizing (F18).
- Featured-snippet shape — S3's answer-first rule (:103-105) — is
  lintable at dist (question-H2 → first paragraph bound) with a declared
  bound; not present.
- **Interlink invariants:** check 9 proves every `href="/…"` *resolves*.
  It does not prove the graph S4 computed survived: no-orphan rule (S4
  :122-126 — nav-linked utility exemption), leaf→pillar `seed` up-link
  (LOCATION §Step 11, :298-300), leaf→index edge, ≤8-sibling cap (D3),
  ≤3 body / ≤4 `## Related` caps (S4 :127-129, :141-145). A build that
  renders only half the injected links passes today's gate.
- `service_area` — needed for the thin-leaf/out-of-area checks (F4).

### F6 — MAJOR: forms are verified statically only — no live POST probe, no email-receipt confirmation

S6 names the exact verification S7 owes: "a real submission to the
staging URL, then the live one" catches the "credential present but
wrong" class S6 cannot (S6 :362-365). S7 has no POST step. Mechanical
floor exists — `POST` honeypot-empty submission → expect `303
?sent=1`; `GET` → `405` (S6 :195-196, :208-210) — but mail *delivery* is
not mechanically verifiable: the probe must end in a `prd_step ask`
("did the test lead arrive at `contact_email`?") or the `form_delivery`
row stays `pending`. Undeclared either way.

### F7 — MAJOR: smoke = three fetches; no crawl, no canonical check, no legacy-path check, no headers check

Spec :166-172: `/` 200+title, one money route, sitemap file 200. Missing
per operator expansion: full route crawl (every manifest route 200 —
sitemap.xml *is* the crawl list), canonical tag = `url`+route on sampled
pages, zero-200 on refused legacy paths (`/areas/*`-class — the
`dentsdirect /areas/ballina` migration the location spec names :275),
`?sent=1` thank-you render, `404` returns 404 (soft-404 check),
trailing-slash canonicalization 301s, live security headers via S6's own
recorded `curl -sI` commands (S6 :264-266), http→https + HSTS post-cert.

### F8 — MAJOR: secrets-on-host is a missing step, not a missing detail

`form.php` reads `getenv()` (S6 :275). Nothing lands the env file,
verifies the keys exist on the host, or records where they live. A
deploy can pass every check and the form still cannot send — the exact
"works on my machine" class the probe step exists to kill. Needed: an
`## Deploy`-adjacent `secrets` mechanism (e.g. `~<user>/.env.<slug>`
sourced by PHP-FPM/`SetEnv`, or panel env) declared in the brief, plus a
preflight probe (`ssh <alias> 'test -f <env> && grep -c <KEY>'` —
name-presence, never values, S6 convention :278-281).

### F9 — MAJOR: `APPROVE SITE` evidence set is too thin for the expanded audit posture

Operator sees live `<url>` + `seo-gate-report.md` + `deploy-report.md`
(:173-178, runbook :75). With the expanded gate that is four more
verdict-bearing artifacts (integrations, responsive, animations, link
graph) the operator must open separately — and the *questions the
operator must answer* (waiver for degraded form_delivery? mail receipt?
DNS cutover?) have no single surface. Needed: a `site/launch-bundle.md`
(or the `prd_step ask` body carrying it) — one screen: live URL, release
ts+sha, gate table (all rows, not just fails), integration verdicts,
responsive + animation verdicts, pending waivers/asks, rollback command.
The seal stays in `deploy-report.md`; the bundle is the review surface.

### F10 — MAJOR: no pre-deploy artifact for redirect/301 handling (existing-site runs)

S1 Step 1 emits `redirect` classifications with 301 targets (:48-51) and
`dropped-routes` for the acceptance gate. Neither spec nor runbook names
the artifact that carries those rows to the host — they die in
`sitemap.md`'s gate summary. An existing-site relaunch without 301s
torches the exact equity Step 1 exists to preserve ("preserving
equity" :51). Needed: `site/redirects.md` (or rows in the brief)
→ emitted as `.htaccess`/nginx rewrite lines in the S6 header config →
deployed per F2 → smoke-verified per F7.

### F11 — MINOR: first-deploy smoke-fail has no rollback target

Step 7: "fail → `ln -sfn` back to the previous release" (:171-172,
:287-289). On the first deploy there is no previous release — `current`
either dangles (nginx 404/500) or the flip never happened and
`releases/<ts>/` sits orphaned. The spec does not distinguish. One
clause — "no previous release → remove `current` and refuse" — closes it.

### F12 — MINOR: `robots.txt` sitemap reference accepts the placeholder origin

Check 8: "references the sitemap" (:216). The starter ships
`Sitemap: https://example.com/sitemap-index.xml`
(`templates/astro/public/robots.txt:5`) — which *references the sitemap*
and passes. Check 4's canonical-vs-`url` rule does not extend to
robots.txt or to `og:url` strings baked at build time from
`astro.config.mjs` `site: 'https://example.com'` (astro.config.mjs:9) —
if the build lane forgets to set `site`, canonicals fail check 4 but the
defect class ("placeholder origin anywhere in dist") deserves one grep:
`example.com` must appear zero times in `dist/`.

### F13 — MINOR: sitemap.xml membership semantics undeclared (404 + noindex)

S1's ancillary matrix includes the `404` row (:124-131); the starter's
`@astrojs/sitemap` excludes non-2xx-style routes by design. If `404`
counts in `ROUTE-MANIFEST.json` (check 1 parity) but is absent from
`sitemap.xml` (check 7 "every route exactly once"), the two checks
contradict unless "every route" means "every indexable route." One
sentence — sitemap.xml lists every indexable route exactly once;
`noindex`/`404` routes are excluded and `robots` meta agrees — closes it.

### F14 — MINOR: check 9's link grammar is unspecified

"every `href="/…"` resolves" (:217) — fragment targets (`#faq`),
query strings, `tel:`/`mailto:` (S6's degrade path *is* a mailto),
anchors to `id`s inside pages are all unhandled. And resolution should
mean "resolves to a built route's canonical path" — a `href="/contact"`
(no trailing slash) that the host 301s is a link-check pass today and an
extra hop shipped. Declare: internal hrefs must match a manifest `route`
byte-for-byte after fragment/query strip.

### F15 — MINOR: host config is unversioned — rollback covers content only

Releases version `dist/`; the `.htaccess`/nginx conf, env file, and
redirect map mutate outside `releases/`. A header-config regression in
tweak iteration N rolls back content but leaves the bad config — the
rollback story halves. Fix: version the config artifacts the same way
(release dir carries `conf/` beside the docroot payload, or the
config is itself symlinked), or accept-and-record (deploy-report rows
each config change).

### F16 — MINOR: DNS/origin resolution unprobed pre-deploy

Step 2 probes SSH+docroot (:138-142); nothing resolves `url`'s DNS.
Deploy-then-discover-DNS wastes a build+gate and — once F3 lands —
*blocks ACME*, which needs the domain answering before issuance. Cheap
preflight row: `dig +short <host>` non-empty; `http://<url>/` reachable
or recorded-as-pending (first-launch case).

### F17 — MINOR: tweak loop re-verification scope undefined for the two new stages

Every iteration re-runs build→gate→deploy→smoke (:186-189). Once
responsive/animation stages exist (§5), a tweak that breaks mobile must
re-fail — but re-running a headless-viewport lane per tweak batch costs
real time. Undeclared: whether the new artifacts re-run per iteration
(correct, expensive) or at operator request (cheap, porous). Recommend
per-iteration for animation statics (grep-class, free) and per-iteration
for responsive (it's the operator's own tweak surface that breaks it).

### F18 — OBSERVATION: "aim high" sizing has no evidence carrier end-to-end

Operator theme 3 (match SERP winners' sizes) needs per-route
`competitor_words`/`module_count` recorded at S1/S2 research time —
SITEMAP-SOP Step 5 already fetches the competitor pages the measurement
needs (:201-206 fetches 2-4 pages per family). The extraction exists;
the *recording* does not. S7's word-count check then reads the plan's
evidence-backed target instead of the type-default band. Owed by S1/S2,
enforced by S7 — one line each side.

## 5. Split / sub-module proposal

S7 stays **one lane** (`web-deploy-<site>`) — the tweak loop's shared
context argument (:322-326) still holds — but decomposes into **five
named phases** inside it, each with its own report section. The two new
operator stages plug in *upstream* as artifact producers; S7 consumes
verdicts exactly as it consumes S6's registry:

```
S6 integrations ──> sites/<slug>/ wired
S6b web-responsive-<site> ──> site/responsive-report.md   (headless viewports;
S6c web-animations-<site> ──> site/animations-report.md    dist/ or preview URL;
                            + site/ANIMATION-MANIFEST.md   CSS-only, IO reveals,
                                                         banned-lib scan)
        │
        ▼
S7 web-deploy-<site>
  Phase A  PREFLIGHT    ssh/docroot probe · DNS · secrets presence · PHP
                        presence (apache+form_delivery) · previous-release read
  Phase B  BUILD+GATE   clean build → expanded gate (§6 table) → commit reports
  Phase C  DEPLOY       rsync release → install host config (.htaccess|nginx
                        snippet + _headers + redirect map) → flip current
  Phase D  POST-DEPLOY  ACME issue → arm redirect+HSTS → header verify →
                        form POST probe → smoke crawl → registry flips →
                        INTEGRATIONS.md append
  Phase E  OPERATOR     launch-bundle ask → tweak loop (re-B..D per iter;
                        responsive+animation artifacts re-run per iter) → seal
```

**Seam contract for the two new lanes** (so their outputs are
S7-checkable, not just operator-readable):

| Lane | Emits | S7 gate row |
|---|---|---|
| `web-responsive-<site>` | `site/responsive-report.md`: per-route × {360, 768, 1280} viewport table — horizontal-overflow, tap-target, nav-open, CLS-flagged rows; verdict per route | "responsive-report exists, zero non-PASS rows" |
| `web-animations-<site>` | `site/animations-report.md` + `site/ANIMATION-MANIFEST.md`: per-route list of animation classes applied + their trigger (CSS transition/keyframes/IO); banned-lib scan result; JS byte total | "manifest parses, banned-lib scan zero, JS budget ≤ N, every `data-reveal` has a CSS rule" — the mechanical half; the content-fit half stays lane judgment, reported |

This mirrors the S6 pattern S7 already half-follows: S7 reads verdict
artifacts, never re-derives capability state. Animation check needs a
JS budget number — propose ≤8 KB compressed site-wide `[INFERENCE —
starter ships only the menu script; IO reveals add ~1 KB]`, set at the
stage's PRD.

## 6. Automation surface

`tools/` is empty — every tool below is a stub to land (OI-7). The
expanded gate is *designed* for `tools/seo_gate.py`: every check is
file-local over `dist/` + four small parsed inputs (`sitemap.md`,
`content-plan.md`, `link-graph.md`, `integrations.json`).

### Proposed expanded gate — 26 checks

Existing-13 status marked **K** (keep), **K+** (keep, sharpen), or **NEW**.

| # | Check | Status | Mechanical? | Needs |
|---|---|---|---|---|
| 1 | Route parity — one dist HTML per manifest route | K | today | manifest |
| 2 | Ancillary matrix satisfied | NEW (S1 :223 promised) | today | sitemap + matrix |
| 3 | URL=H1=title lock — `slugify(<h1>) == route`; `<title>` matches `title_tag` modulo brand suffix | NEW (S1 :116 promised) | today | sitemap rows |
| 4 | Title ≤60, unique | K | today | — |
| 5 | Meta description 140–160, unique | K | today | — |
| 6 | Canonical = `url`+route | K | today | brief |
| 7 | OG tags present (`og:title/description/url/type`) | K | today | — |
| 8 | sitemap.xml lists every *indexable* route once, canonical-prefixed | K+ (F13) | today | manifest + robots meta |
| 9 | robots.txt present, sitemap URL = `url` origin, zero `example.com` anywhere in dist | K+ (F12) | today | brief |
| 10 | Internal hrefs resolve to manifest routes byte-for-byte (fragment/query stripped; `tel:`/`mailto:` exempt) | K+ (F14) | today | manifest |
| 11 | Self-containment — no remote src/href/**srcset**/**`url()`/`@import`/preconnect outside `url` origin | K+ | today | brief |
| 12 | `<img>` non-empty `alt`; `width`/`height` present (CLS) | K+ | today | — |
| 13 | Exactly one `<h1>`; H1 carries `primary_keyword` verbatim or ≤2 filler words | K+ | today | content-plan |
| 14 | No skipped heading levels | K | today | — |
| 15 | Skeleton H2s present, in order (vs `heading_skeleton`) | NEW | today | content-plan |
| 16 | Word count within `word_target` ±15% (target SERP-evidenced when upstream records it — F18) | NEW | today | content-plan |
| 17 | Featured-snippet shape — each question-form H2's first paragraph ≤ 60 words | NEW | today (bound declared) | content-plan `intent` |
| 18 | Intent shape — `commercial`/`transactional` pages carry ≥1 CTA block + form/CTA endpoint; `informational` carry ≥1 question-H2 | NEW | today | sitemap `intent` |
| 19 | Location cluster lint — ≤25 leaves; index exists; every leaf index-linked; no leaf outside `service_area`; folder slug `service-areas` (D6; no `/areas/`/`/locations/`/`/suburbs/` generic folders anywhere) | NEW (LOCATION Step 13 + D6) | today | sitemap `parent`/`page_class` + brief `service_area` |
| 20 | Thin-leaf check — each location leaf ≥300 suburb-unique words; FAQ answers unique across leaves; suburb token in H1 + ≥2 modules | NEW (LOCATION Step 13) | today (n-gram diff across leaf bodies) | sitemap |
| 21 | Graph invariants — zero orphan pages (nav-linked utility exempt); every location leaf → pillar up-link + index link; source ≤3 body links; `## Related` ≤4 | NEW | today | link-graph + sitemap |
| 22 | Form wiring — every `<form action>` resolves (K13-old-12) **and** `dist/form.php` exists when registry `form_delivery`≠`mailto` **and** honeypot/`ts` fields present | K+ | today | integrations.json |
| 23 | Header artifacts — `dist/_headers` non-placeholder; `.htaccess` or nginx snippet staged for deploy (registry `security_headers`) | NEW | today | integrations.json |
| 24 | Secret scan — zero value-shaped strings in dist (40+ char tokens, `SK…`, `-----BEGIN`) | NEW (S6 self-check :317-318 extended) | today | — |
| 25 | Responsive verdict — `site/responsive-report.md` exists, zero non-PASS rows | NEW (seam) | artifact-read | sibling lane |
| 26 | Animation statics — `ANIMATION-MANIFEST.md` parses; banned-lib grep zero; JS ≤ budget; every `data-reveal`/IO hook has a CSS rule | NEW (seam, mechanical half) | today | sibling manifest |

Mechanical **today** (pure dist/ + parse): all except 25 and the
content-fit half of 26, which read sibling verdict artifacts — the same
posture as `integrations.json`. Nothing in the list needs a browser
except the *production* of the responsive report.

**Other tools:**

- `tools/smoke_crawl.py` — post-deploy: fetch sitemap-index → every URL
  200 + canonical match + no legacy-path 200s + `?sent=1` render +
  `GET /form.php`→405 + POST probe→303 + header assertions + 404-page
  status. Emits `deploy-report.md` rows.
- `tools/deploy_host.sh` — probe, rsync, config install, flip, prune,
  rollback — the Phase C/D shell the spec already half-specifies as prose.
- `sitemap_lint.py` (OI-7) — gains the D6 folder-slug lint + leaf-cap
  warning rows so checks 19-20 share one parser.

## 7. SOP skeleton — `web-deploy-<site>` lane

SITEMAP-SOP-shaped; inputs/tools/outputs per phase.

**Phase A — Preflight (fail fast, before build)**
1. Verify mint preconditions (spec's four) **plus**: `integrations.json`
   parses (4 rows), `INTEGRATIONS.md` non-empty, waiver row present for
   any `degraded` `form_delivery`; `responsive-report.md` +
   `ANIMATION-MANIFEST.md` present when those lanes ran.
2. SSH probe: docroot exists+writable, `releases/` mkdir, previous
   `current` target recorded (for F11's no-previous case).
3. DNS probe: `dig +short <url-host>`; record A/AAAA vs host; if
   `ssl.transport` is acme-class, DNS must already resolve — refuse
   early otherwise.
4. Host-capability probe: `php -v` when `form_delivery`≠mailto on
   apache; `nginx -t -c <path>` reachable when nginx; env-file presence
   (`grep -c` each `needs_env` key — names only).

**Phase B — Build + gate**
5. Clean `dist/`, `npm ci`-respecting `npm run build`. Non-zero →
   refuse upstream.
6. Run the 26-check gate (`tools/seo_gate.py` or prose); row every
   result into `seo-gate-report.md`; record head sha + ts.
7. One FAIL → commit report, refuse (no deploy). Overrides need
   operator writing in the report.

**Phase C — Deploy**
8. `rsync -az --delete --delay-updates dist/ → releases/<ts>/`.
9. Install host config: `.htaccess` → docroot level; nginx snippet →
   declared conf path + `nginx -t` + reload; `public/_headers` rides
   dist on static-only; `site/redirects.md` → redirect stanzas.
10. `ln -sfn releases/<ts> current`; prune to 5.

**Phase D — Post-deploy verify**
11. ACME: issue/renew cert (acme.sh|certbot per registry); then arm
    `http→https` 301; then arm HSTS — strict order, never early.
12. `curl -sI https://<url>/` — assert the S6 header table live; flip
    registry `ssl`/`security_headers` → `live` and append to
    `INTEGRATIONS.md`.
13. Form probe: `GET /form.php`→405; honeypot POST →303 `?sent=1`;
    then a real submission → `prd_step ask` "test lead received?"
    (flips `form_delivery` confidence; S6 :364).
14. `tools/smoke_crawl.py`: every sitemap URL 200+canonical; legacy
    paths 404/301; `?sent=1` renders; 404-page status; slash 301s.
    Fail → rollback flip (or `current` removal on first deploy), row
    the failing check, refuse.
15. Write `deploy-report.md` iteration row (release ts, sha, rsync
    summary, host-config ops, smoke matrix).

**Phase E — Operator loop + seal**
16. Emit `site/launch-bundle.md` (one screen: URL, sha, gate matrix,
    integration verdicts, responsive/animation verdicts, waivers,
    rollback cmd) and `prd_step ask` for tweaks.
17. Per batch: edits per tweak bounds → re-run Phases B–D
    unconditionally → re-run responsive+animation lanes (F17) →
    reports append.
18. Structural tweak (routes/copy replan) → escalate upstream, never
    absorb.
19. `APPROVE SITE` → `## Seal` in `deploy-report.md` → `prd_step done`.

## 8. Cross-module contracts

| Party | Owes S7 | S7 owes them | Status |
|---|---|---|---|
| S6 | `integrations.json` (4 rows), `INTEGRATIONS.md`, `form.php`, `.htaccess`/snippet, `_headers`, `.env.sample`, declared `host` type | deploy config, run ACME, flip `ssl`/`security_headers`, run form probe, honor waivers | **BROKEN — F1/F2/F3**; also `host` vs `## Deploy` key mismatch (§3) |
| S1 | `sitemap.md` rows (route, H1, title_tag, page_class, parent, intent, service_area via brief), ancillary matrix, redirect rows | lock re-derivation (check 3), matrix check (2), cluster lint (19), redirect deploy (Phase C9) | promises made at S1 :116/:223 unadopted — F4; redirect artifact missing — F10 |
| S2 | `content-plan.md` with `word_target` (+ SERP-evidenced sizing — F18), `heading_skeleton`, `intent` | checks 15-18 | input missing — F5 |
| S4 | `link-graph.md` final edge set (+ `## Notes` rewrites) | invariant re-verify (check 21) | input missing — F5 |
| LOCATION spec | cluster rules D1-D6, Step-13 checks | checks 19-20 | named assignment never landed — F4 |
| S5b build | `sites/<slug>/`, manifest, `astro.config.mjs` `site:` set | placeholder-origin grep (check 9) | gap F12 |
| Responsive lane (new) | `site/responsive-report.md` all-PASS | check 25 consumes; re-run per iteration | seam designed §5 — needs the lane's own stage spec |
| Animation lane (new) | `site/animations-report.md` + `ANIMATION-MANIFEST.md` | check 26 consumes; banned-lib scan | seam designed §5 — needs budget number |
| S0 intake | `## Deploy` + `host` type + `secrets` mechanism + DNS owner + `service_area`/`depot_address` | refuse on absent sections (`prd_step ask`) | `host.type`/`secrets`/`service_area` undeclared in `## Deploy` — F1/F5/F8 |

**Conflicts found:** `host` brief field (S6 :37) vs `## Deploy` four
keys (S7 :78-83) — two schemas for one fact; `404` row membership vs
sitemap.xml exclusion (F13); LOCATION §7 assigns S7 checks the S7 spec
doesn't carry (F4 — spec likely predates the research; either way the
corpus disagrees with itself).

## 9. Verdict — what must exist before this module's PRD

1. **The S6 contract folded in** (F1-F3): `integrations.json` as an
   input; deploy steps that carry `.htaccess`/nginx conf + redirect map;
   ACME + arming order; post-deploy header verify + registry flips;
   form POST probe + receipt ask; waiver mechanics. Without this the
   factory's only *business* feature — the lead form — is verified by
   nothing.
2. **Three new gate inputs** (`content-plan.md`, `link-graph.md`,
   `integrations.json` — and `service_area` from the brief) so checks
   13-21 are evaluable (F5).
3. **The 26-check table adopted** (§6) — folding in the upstream
   promises (S1 :116, :223; LOCATION Step 13) the landed spec dropped
   (F4).
4. **Deploy decomposition** (§7): Phase A preflight (DNS, secrets, PHP),
   Phase C host-config transport, Phase D ordered TLS → headers → form →
   crawl. The current "rsync+smoke" covers roughly a third of what a
   launch actually is.
5. **New-stage seams** (§5): `responsive-report.md` and
   `ANIMATION-MANIFEST.md` artifacts + two consuming gate rows; their
   stage specs are sibling-lane outputs — S7's PRD needs only the
   artifact contract, not their internals.
6. **`APPROVE SITE` bundle** (F9): `site/launch-bundle.md` as the
   one-screen evidence surface — four+ reports is too many surfaces for
   a typed gate.
7. **Intake additions** (§3): `host.type`, `secrets` mechanism, DNS
   owner, existing-site redirect artifact — all `## Deploy`-adjacent
   fields S0/S1 must stamp or S7 refuses.
8. **`tools/seo_gate.py` + `tools/smoke_crawl.py` stubs landed** —
   every check above is mechanical today; the prose-lint posture (PRD
   OI-7) is the only reason the gate stayed at 13.

Ship-blocking for the PRD: 1, 2, 3, 4. The rest are bounded amendments.
