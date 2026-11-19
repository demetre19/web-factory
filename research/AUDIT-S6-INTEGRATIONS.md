# AUDIT-S6-INTEGRATIONS — adversarial audit of stage S6 (static site → wired business asset)

Lane: `AuditIntegrations` · 2026-11-02 · class: `web-factory-module-audit`.
Sister document to `research/ADVERSARIAL-REVIEW.md` and `AUDIT-S1-SITEMAP.md`;
same posture — self-review sections read but not trusted, every claim
line-cited or marked `[INFERENCE]`. This module has the highest
host-contact surface in the factory; the audit's bias is toward defects
that only appear after bytes reach a real server.

Live verification this audit ran (2026-11-02, tinyfish fetches):

- Resend requires domain verification before send — "You must add and
  verify at least one domain to send emails with Resend" —
  `resend.com/docs/dashboard/domains/introduction`.
- Netlify static-form contract is markup-side (`data-netlify="true"` +
  build-time `form-name` hidden-input injection + per-form `name`), and
  submission→email notification is a Netlify-UI setting, not repo
  config — `docs.netlify.com/manage/forms/setup/`.
- Astro only *processes* attribute-less `<script>` tags; `is:inline`
  (or any attribute) ships verbatim into HTML —
  `docs.astro.build/en/guides/client-side-scripts/`.
- GSC verification is DNS-TXT/CNAME or a tag/file the site serves —
  `support.google.com/webmasters/answer/9008080`.

## 1. Scope audited

| File | Role |
|---|---|
| `research/WEB-FACTORY-S6-INTEGRATIONS.md` (396 lines) | Stage spec under audit |
| `skills/s6-integrations/SKILL.md` (94 lines) | Lane-facing contract — mostly a faithful compression |
| `research/WEB-FACTORY-S7-GATE-DEPLOY.md` | The boundary partner — rsync step :158-165, smoke :166-172, gate table :207-221 |
| `research/WEB-FACTORY-S5-DESIGN-DNA.md` :38, :261-285 | Producer contract for the dead-CTA form S6 claims to consume |
| `templates/astro/` (`_headers`, `Header.astro`, `Footer.astro`, `site.ts`, `astro.config.mjs`) | The vendored starter S6's emits ride into |
| `docs/machinery/WEB-FACTORY.md` :102-141 | Deploy contract + failure matrix |
| `research/WEB-FACTORY-LOCATION-PAGES.md` :218-222, :326, :329-331 | NAP/`depot_address` dependency + S7 deltas |
| `research/WEB-FACTORY-SITEMAP-SOP.md` :222, :239-241, :292-296, :428-433 | "S6 convention" env usage by an upstream stage |
| `skills/s0-discovery/SKILL.md` :44-52, `skills/s1-sitemap/SKILL.md` :30-42 | Intake field list; upstream env tiers |

Module boundary: intake of S5's built `sites/<slug>/` + `site-brief.md`
→ capability resolution → `integrations.json`, `form.php`, header
config, `.env.sample`, `INTEGRATIONS.md` → hand to S7's build/gate/rsync.
Everything inside `dist/` (build, SEO gate, smoke, seal) is S7's; the
audit only draws the line (§8) where S6's spec blurs it.

## 2. Current contract

| Direction | Artifact | Shape today |
|---|---|---|
| In | `sites/<slug>/` (S5) | Astro static project; contact route renders `<form action="/form.php" method="POST">` w/ honeypot + `ts` (S6 :33-40 — see F9: producer spec never declares this) |
| In | `site/site-brief.md` | `contact_email`, `contact_phone`, `notify_phone`, `host` `type: apache\|nginx\|static-only` (S6 :37-38 — `host.type` collected by nobody, F5) |
| In | `site/sitemap.md` | locates contact/quote route (S6 :82) |
| In | `site/integrations.json` | optional operator pre-seed, pins transports (S6 :83) |
| In | "Operator environment" | shell env at wiring time, presence-only (S6 :84 — wrong environment, F10) |
| Out | `site/integrations.json` | 4-capability registry: `form_delivery`, `sms_notify`, `ssl`, `security_headers` (:101-135) |
| Out | `public/form.php` | POST-only endpoint; honeypot `hp`, timestamp `ts`, Resend→SMTP→refuse chain (:164-211) |
| Out | `sites/<slug>/.htaccess` **or** nginx snippet + `public/_headers` | header/redirect config (:249-252, :306-308 — deployability defect, F1) |
| Out | `sites/<slug>/.env.sample` | key names + unlock comments (:271-275) |
| Out | `site/INTEGRATIONS.md` | per-capability verdicts + env table + waivers (:147-162) |
| Out | contact-page flip | mailto/`tel:` degrade branch when `form_delivery` degraded (:311-314) |

## 3. Discovery-question expansion

S6 is the intake-to-host seam; its question bank is mostly **operator's
deploy-adjacent demands** (theme 8) plus a small slice of themes 1 and 3
(integration-surface census). "Surface" = where the answer lands today.

### Theme 8 — the deploy checklist, decomposed

| Question | Surface today |
|---|---|
| Which form → which email/endpoint? | `FORM_TO` defaults to `contact_email` (:141); **single form, single destination assumed — GAP F12** |
| Email routing inbound (mailbox exists? MX?) | **GAP** — `FORM_TO` is trusted, never verified; mailbox reachability unowned — F12 |
| Email routing outbound (From domain verified? SPF/DKIM/DMARC?) | Resend "DKIM managed by Resend" claimed (:180) but verification not a spec step — **GAP F6** (fetched: domain verify is a hard precondition) |
| Hosting security hardening (server, not headers)? | Header table only (:255-262) — no `Options -Indexes`, `ServerSignature`, `display_errors`, `TRACE` — **GAP F12** |
| Secrets handling (where do values live? who types them? do they reach the PHP SAPI?) | "export in the deploy user's profile or panel env UI" (:274-276) — **mechanically wrong for common PHP runtimes; delivery mechanism unowned — F4** |
| Jump-server access? | S7's step-2 probe (`WEB-FACTORY-S7-GATE-DEPLOY.md:139-142`). S6 needs host facts *earlier* (host.type probe — F5); jump access is reusable but the contract is S7's |
| SSL ordering? | Well-specced: acme-passthrough → redirect-behind-flag → HSTS armed post-cert (:236-245). ✓ the one genuinely hard thing S6 got right |

### Theme 1 — source & authenticity (integration facts)

| Question | Surface today |
|---|---|
| Where do destinations come from? | `site-brief.md` verbatim; missing field = flag not refuse (:37-40). ✓ |
| Is the canonical NAP record owned? | **GAP** — `site.ts` (S5 copies brief) vs `depot_address` (location M3/M10, LOCATION-PAGES :235) vs brief — three readers, no parity lint — F14 |
| Can `FORM_TO` be fabricated/typo'd? | No existence check on the mailbox; probe submit (S7-side, unowned — F11) is the only catch. |
| Phone/CTA surfaces real? | `tel:`/`mailto:` degrade reads brief fields verbatim (:188-191). ✓ |

### Theme 3 — integration-surface census (what do winners ship?)

| Question | Surface today |
|---|---|
| What lead-capture surfaces do SERP winners run? | Location-doc evidence: closing CTA = quote/booking + phone on every exemplar (M8 :137); **no Maps `<iframe>` observed anywhere** (:338) → S6's "link out, don't embed" alignment is evidence-backed. ✓ |
| Do winners use booking widgets / live chat / SMS? | **GAP** — never surveyed. If the niche's winners run booking embeds, our CSP (`script-src 'self'`) bans them by default; unrecorded either way — F2/F14 |
| Do winners track calls/leads? | Call-tracking numbers / GA4 unowned — **GAP F11** |

### Theme 4 — SERP stats analogue: does our integration posture match the call?

| Question | Surface today |
|---|---|
| Is a bare form+honeypot competitive? | Honeypot + `ts` floor is specced (:197-204) — **but `ts` is unimplementable on a static site — F3** |
| Do winners run CSRF-grade protection / visible reCAPTCHA? | Never surveyed; our anti-bot floor is weaker than specced — F3/F14 |

## 4. Gap findings

Ordered by severity. Blockers are things that cannot work as written
regardless of lane diligence.

### F1 — blocker — the Apache artifact is emitted where deploy can't see it; S7's own contract contradicts itself on scope

- `WEB-FACTORY-S6-INTEGRATIONS.md:249-250` — "written to
  `sites/<slug>/.htaccess`" (project root).
- `WEB-FACTORY-S7-GATE-DEPLOY.md:158-163` — rsync moves **`dist/`** and
  nothing else; the symlink flip serves `current`.
- Yet `WEB-FACTORY-S6-INTEGRATIONS.md:41-43` — "deploys `dist/` plus
  the S6 artifacts" — the spec's own downstream contract names a scope
  S7's step list never implements.
- Astro's `astro build` copies only `public/` into `dist/` — the
  starter puts `robots.txt` and `_headers` in `public/` for exactly
  this reason (`templates/astro/public/`). `.htaccess` and the nginx
  snippet at project root are dead files at deploy time.

Consequence: on the flagship apache host the *entire*
`security_headers` capability reports `EMITTED` while nothing rides
any response — the registry lies green and nothing in the system can
detect it (S7's header probe `curl -sI` is the only catch, and S6
declares it "report table: verification command S7 will run" — :264
— for a file that never reached the server).

Fix: emit into `public/` — `public/.htaccess` for apache (Apache
honors docroot `.htaccess`; it travels inside `dist/`), nginx snippet
to `site/host-config/<site>.conf` as an operator-installed artifact
with `install_to` + reload command recorded in `INTEGRATIONS.md`
(root-required — see F11), and keep `public/_headers` always.

### F2 — blocker — the CSP table breaks Astro's own output (`style-src 'self'` vs inlined component styles) and leaves the script-side contract unspecified

- `:257` — `style-src 'self'` in the emitted CSP.
- `templates/astro/src/components/Header.astro:75-103`,
  `Footer.astro:35-49` — component `<style>` blocks. Astro's default
  build behavior inlines component styles into served HTML
  (`build.inlineStylesheets` defaults to auto; the starter's
  `astro.config.mjs:8-19` does not override it). `style-src 'self'`
  blocks them → the shipped site renders unstyled under its own
  security policy. [Verification: Astro docs state processed
  scripts/styles are bundled; inline `<style>` element content is
  inline content under CSP — `docs.astro.build` fetched 2026-11-02.
  The inlining default is Astro's documented `auto` behavior —
  `[INFERENCE]` to the extent the shipped bundle splits above the
  ~4KB threshold, which only *randomizes* whether the site breaks.]
- Script side: `script-src 'self'` is *coincidentally* safe today —
  `Header.astro:105` is an attribute-less `<script>` so Astro bundles
  it to `/assets/` (docs fetched: attribute-less scripts are
  processed/bundled; any attribute or `is:inline` ships verbatim).
  The contract is absent, so the next lane that writes
  `<script is:inline>` (e.g. for the `?sent=1` reader — F8) silently
  defeats the policy or silently breaks.

Fix: policy+build co-contract — `build.inlineStylesheets: 'never'` in
`astro.config.mjs` (S5 patch) **or** `style-src 'self' 'unsafe-inline'`
(recorded as a deliberate weakening in `INTEGRATIONS.md`, not a silent
one); plus a named rule "scripts are attribute-less Astro `<script>`
only — no `is:inline`, no inline JS" enforced by the S7 gate as a
grep check against `dist/`.

### F3 — blocker — the `ts` anti-bot floor cannot run on a static site, and "one submission per `ts` per session" has no state

- `:198-203` — "`ts` (form-render timestamp — submissions under 3
  seconds are bots…)"; "`the static form sets `ts` at render`".
- On `output: 'static'` (`astro.config.mjs:10`), "render" is **build
  time** — the timestamp bakes into dist months before a visitor
  loads the page. Every legitimate human submission arrives with a
  `ts` hundreds of hours stale → either the 3-second floor fails 100%
  of real users, or the lane ships `ts` as a client-side
  `Date.now()` stamp a bot can mint freely (same field, zero signal).
  [INFERENCE on which half the lane picks — the spec picks neither.]
- "One submission per `ts` per session" presumes server-side session
  state. Nothing specced (PHP `session_start()`? cookie? file
  store?). The only real flood control is the honeypot.

Fix: restate the anti-bot layer honestly — honeypot (works),
time-floor via a hidden `ts` stamped by a tiny bundled JS at
*page-load* (documented as the same signal, weaker), plus a
file-backed per-IP hourly cap inside `form.php` (php-writable temp
dir, documented requirement). Or name reCAPTCHA-class as an optional
capability row — the CSP would need `script-src`/`frame-src`
exceptions the current table refuses to model.

### F4 — major — `getenv()` visibility is assumed, and secrets delivery is a shrug

- `:274-276` — "Real values live in the host's environment (`export`
  in the deploy user's profile or the panel's env UI); `form.php`
  reads `getenv()` only."
- `export` in a shell profile does **not** reach Apache children,
  PHP-FPM pools, or CGI shells — the env the deploy user sees over
  SSH and the env the web SAPI sees are different processes. Panel
  env UIs are panel-dependent and unnameable. This is the classic
  "form.php reads nothing" failure: `RESEND_API_KEY` absent at
  runtime → the endpoint degrades to refuse-to-send at *request
  time*, days after `INTEGRATIONS.md` recorded `LIVE`.
- There is no delivery artifact: no `site/SECRETS.md` runbook, no
  `SetEnv`/`.env`-file convention, no permission rule, and the
  secret-scan (:317-318) only proves secrets are absent from *repo*
  files — it can't prove they are present on the *host*.

Fix: a `secrets_delivery` mechanism per host type, emitted as a
runbook + scaffold: apache+mod_php → `SetEnv` in the site's Apache
vhost or docroot `.htaccess` (values typed by operator post-deploy —
`.htaccess` inside docroot, 640, excluded from rsync `--delete`… a
real deploy-config problem S7 must own); PHP-FPM/CGI → docroot-adjacent
`site.env` (`form.php` `parse_ini_file`s it — one documented code
line), mode 600, outside `releases/` so the flip never deletes it.
Registry gains `secrets_visible: probe-pending|ok` — the host-side
`getenv` probe (`tools/host_probe.py`, §6) is the only honest check.

### F5 — major — `host.type` is required by S6 and collected by nobody

- `:37-38` — brief must carry `host` (`type: apache|nginx|
  static-only`, SSH alias).
- `docs/machinery/WEB-FACTORY.md:105-112`, `PRD-Web-Factory-2026-10-
  30.md:80,:119`, `skills/s0-discovery/SKILL.md:50-52` — `## Deploy`
  is exactly `{host_alias, user, docroot, url}`; no type field exists
  in any intake schema.
- S6's mint precondition 2 (:87-90) checks only that *a contact
  destination* exists — not `host.type`; so the lane mints, finds
  the field absent, and either guesses (refuses "never discovered"
  posture the deploy contract explicitly takes:
  `WEB-FACTORY.md:104-105`) or degrades `security_headers`/`form.php`
  on a guess that decides which header file is "real".

Fix: add `host.type` (+ `dns_provider`, `php_runtime` if knowable) to
`## Deploy` at S0; plus a `host_probe` SSH step inside the S6 lane —
via `ProxyJump jump` as `user`, run `apachectl -v||nginx -v`, `php
-v`, `php -r 'print getenv()' `— probe-derived `host.type` beats a
brief declaration where they conflict and is recorded in
`INTEGRATIONS.md`.

### F6 — major — Resend-as-live is unreachable without DNS access; SPF/DKIM/verification is a capability S6 doesn't have

- `:178-180` — Resend preferred transport; "DKIM managed by Resend".
- Fetched 2026-11-02 (resend.com/docs/dashboard/domains/introduction):
  "You must add and **verify** at least one domain to send emails"
  — DNS records on the sender domain, *before* the API key will
  mail from `FORM_FROM` at that domain. An `api.resend.com` call for
  `FORM_FROM` on an unverified domain fails at send-time — i.e., the
  failure lands post-deploy, exactly where "credential present but
  wrong" (:362-365) already parks it. Registry says `live`, the
  mailbox stays empty.
- Same class inbound: `FORM_TO`'s mailbox existence, MX record —
  unowned.

Fix: `dns` capability row — `dns_provider` from brief, emitted
`site/DNS-RECORDS.md` (Resend DKIM/SPF + any Google TXT verify +
receiving-end expectations) as an operator-actionable artifact;
S6 emits, operator applies, S7 verifies (`dig +short TXT
send.<domain>`) before the registry flips `form_delivery` live.
`FORM_FROM` should spec the Resend shared/onboarding domain as an
explicit degrade when DNS access is unavailable.

### F7 — major — the `static-only` fallback is a stub: markup contract unstated, notification path is a UI todo, `_headers` is wrong-scoped

- `:170-173, :358-361` — host brief `static-only` → "swaps the
  endpoint for a `_forms`/`_redirects` platform form and marks the
  registry transport accordingly"; `sms_notify` → `none` "unless the
  platform hook exists".
- What is emitted is unspecified. Fetched contract
  (docs.netlify.com/manage/forms/setup/): `data-netlify="true"`
  attribute + a `name` attribute; the build injects the hidden
  `form-name` input; submissions land in a **Netlify dashboard**;
  email/webhook notification is a Forms→notifications UI setting.
  None of that is a file S6 emits — no markup patch contract, no
  hidden-input rule, no `action=` success-page contract (Netlify's
  own docs name `action="/pages/success"` as the redirect
  mechanism). The S5 contract `<form action="/form.php">` is
  *contradictory* here — on Netlify the action becomes the success
  page, not the endpoint.
- `_headers` "Netlify-class syntax" is Netlify-only; Cloudflare
  Pages' filename is `_headers` too but a plain static host or S3
  reads nothing — the registry's `degrade_to: netlify-style _headers
  file` (:131) names a file as its own fallback for every non-Apache
  host, including ones that ignore it.
- Bonus defect: `forms` row degrade on static-only also needs
  `form.php` *removed or noindexed* — a deployed PHP file on a
  static host is served as source text; the spec emits it
  unconditionally ("the endpoint file is still emitted" :189-190).

Fix: `platform_form` capability row with an emitted markup patch
contract (`data-netlify="true"`, `name="<slug>-contact"`, hidden
`form-name` input, `action="/thank-you/"` page S5 must supply), a
notifications checklist item in `INTEGRATIONS.md` ("operator enables
submission→email in platform UI" — external, named, waived-able),
and a per-platform `headers_file` choice. `form.php` excluded from
`public/` when `host.type == static-only`.

### F8 — major — "S5 emits both branches" is asserted of a spec that doesn't, and the `?sent` mechanism is undefined

- `:311-314` — "`sent` query-flag copy must already exist either way
  — S5 emits both branches; S6 only flips which renders."
- `grep form|sent|thank` over `WEB-FACTORY-S5-DESIGN-DNA.md` → S5's
  contract says only "S6 wires forms/email/SMS" (:38) and its
  self-lint (:274-285) has no contact-page clause. The starter has
  **no contact page, no form markup** (`templates/astro/src/pages/`
  = `index.astro` only). The consumer names a producer artifact that
  exists in no spec — ADVERSARIAL-REVIEW F1/F4's own defect class,
  one stage down.
- Mechanism also undefined: how does a static page "render thank-you
  or fallback copy from the query flag" (:208-210)? Client-side JS
  reading `location.search` (inline → F2's CSP collision) or a
  dedicated `/thank-you/` route (the Netlify-docs-native answer:
  `action="/pages/success"`).

Fix: dedicated `/thank-you/` + `/form-error/` ancillary routes in the
S1 ancillary matrix; `form.php` 303s there; the `?sent` convention
dies. This also unblocks F7 (Netlify's action contract is the same
page) and deletes the need for any inline flag-reader JS.

### F9 — major — the env registry is per-site and S6-scoped; the run's env needs are scattered, and probes run on the wrong machine

- S6's `integrations.json` covers exactly `RESEND_*`, `SMTP_*`,
  `TWILIO_*`, `ACME_EMAIL`, `FORM_*`, `NOTIFY_PHONE` (:108-133).
- Already alive upstream: `DATAFORSEO_LOGIN`/`PASSWORD`
  (SITEMAP-SOP :222,:428-433 — which literally cites "S6
  convention"), `GSC_CREDENTIALS` (SOP :296, s1 SKILL :35),
  `OPENAI_API_KEY` (SOP :378, s1 SKILL :38), `GSC_*`. Host keys:
  `SSH` aliases in brief. Every stage probing its own keys is the
  "three credentials checked in three places" defect S6's one-
  registry architecture (:69-73) was invented to kill — killed
  inside S6, alive at run scope.
- Probe environment: `Operator environment — shell env at wiring
  time` (:83). The wiring lane runs on the orchestrator's shell;
  `form.php` reads the *host's* env. Presence on the wiring machine
  proves nothing about the host — the registry can record `live`
  for a key that will never exist where `getenv()` runs (F4's
  runtime side of the same bug).

Fix: `site/env-manifest.json` — run-scope registry, one row per
`{key, scope: run|host, consumer: s1|s6|…, required_for, source_hint}`.
S1's DATAFORSEO/GSC/OPENAI rows + S6's host rows share one file; each
lane presence-checks `scope: run` rows at mint (cheap), S6 owns
`scope: host` rows (probe-verified, F4/F5). `integrations.json`
`needs_env` arrays then *reference* manifest keys rather than
re-declaring them.

### F10 — major — analytics / GSC-verification / GBP surfaces are unowned and collide with both the CSP and S7's self-containment check

- GSC verification (fetched): DNS TXT/CNAME or a meta tag/file the
  site serves. S6 owns none of it — no `verification` row, no
  `site.google-site-verification` field in `site.ts`, no
  `SEOHead` slot (`templates/astro/src/components/SEOHead.astro:35-49`
  has no verification/analytics markup).
- GA4/GTM: requires a remote `googletagmanager.com` script —
  banned by `script-src 'self'` (:257) **and** by S7 gate check 10
  "no `src`/`href` fetches remote assets" (`S7:218`), which would
  fail the gate on a `gtag.js` include. S6's only gesture is "a
  header that needs a value the CSP forbids is a flag" (:265-267) —
  flag-to-whom, with what resolution path, is unstated (same dead-
  flag shape as ADVERSARIAL-REVIEW F8's collision).
- GBP link-out only: location-doc evidence supports outbound Maps
  links over iframes (:326, :338) — consistent, but "GBP verification
  tag" as a concept is absent; `depot_address`→schema NAP parity
  unowned (F14).

Fix: `verification` capability row (GSC meta tag → `SEOHead` slot or
DNS TXT under the F6 `dns` row; Bing webmaster same shape);
`analytics` row — default `none` (matches self-containment) with
`gtag` as an opt-in that *declares* its CSP exceptions
(`script-src`/`connect-src`/`img-src`) in the registry, so the CSP
emitter composes them instead of the lane hand-editing policy. S7
gate check 10 gets a named exception list read from the registry —
"remote assets allowed iff declared in `integrations.json`" keeps
the check honest instead of blanket-failing or blanket-ignoring.

### F11 — major — privilege contradiction: the emitted artifacts need root the deploy contract forbids, and S7's smoke can't see the capability S6 says it verifies

- S6 emits "the nginx `server` snippet" (:250, :306) — installing a
  server block needs root + reload. `## Deploy` says `user` is
  "never root, never sudo-to-root" (`WEB-FACTORY.md:108-109`;
  S7:80). Same for `certbot`/`acme.sh` on some setups and for any
  host-level header file on shared Apache (mod_headers in user
  `.htaccess` is fine; a `VirtualHost` edit is not). Emitted
  artifacts with no installer: the lane's write set ends at the
  project tree.
- `:363-365` — S6 names "S7's post-deploy probe (a real submission
  to the staging URL, then the live one)" as the catch for bad
  credentials. S7's smoke check is GET-only (`S7:166-172`: fetch
  `/`, one money route, sitemap expecting 200 + title text). No
  POST probe exists; nothing ever exercises `form.php` end-to-end.
  A `LIVE` registry row for `form_delivery` is unverifiable by the
  machinery that supposedly verifies it.

Fix: `install_owner` per artifact in `INTEGRATIONS.md`
(`lane|operator-root|panel`) — nginx snippet + ACME are
`operator-root` checklist items emitted as `site/HOST-TODO.md`; and a
POST `submit_probe` contract: `form.php` honors
`X-WF-Probe: <SECRET>` (env `WF_PROBE_TOKEN`) → logs send, returns
`?sent=probe`, no operator email — S7 runs it as smoke check #14.

### F12 — minor — form-destination and server-hardening matrices are thinner than the operator ask

- One form, one `FORM_TO` (:108-110): real sites carry contact +
  quote + newsletter/brochure-request forms; ancillary matrix
  mints `/get-a-quote`-class routes (SITEMAP-SOP :194). No
  `forms[]` map exists — per-route destination (`quote`→`sales@`,
  `contact`→`hello@`), per-form `form-name`, per-form success page.
  Registry schema has no slot for it.
- Submit-side mail: no autoresponder/ack to the visitor — common on
  every exemplar niche, absent here. Minor, but it's a row in the
  email-routing question bank.
- Hardening beyond headers — absent: `Options -Indexes`,
  `ServerSignature Off`, `display_errors Off` for the PHP endpoint,
  `TraceEnable off` (server-scope), `Cache-Control: no-store` on
  `/form.php` (PHP must emit it — otherwise intermediaries can
  cache the 303 or the endpoint's body), `AddDefaultCharset UTF-8`,
  ETag/Cache policy beyond the starter's `/assets/*` rule
  (`_headers:3-4`). `X-XSS-Protection` correctly absent (deprecated);
  `COOP`/`COEP`/`Cross-Origin-Resource-Policy` absent — defensible,
  worth one line of rationale.
- `.htaccess` needs `<IfModule mod_headers.c>` guards — a shared
  host without mod_headers 500s the whole site on the very file
  meant to harden it.

### F13 — minor — `public/_headers` collides with the starter's own file

- Starter ships `templates/astro/public/_headers` (`Cache-Control`
  for `/assets/*`, `nosniff`, `Referrer-Policy` — :1-7). S6 step 5
  says `_headers` "always" mirrored (:308) — overwrite or merge
  unstated. An overwrite drops the immutable-assets rule; a merge
  needs a section convention. One line fixes it (merge, S6-managed
  block delimited by comment markers), but today the file has two
  writers with no protocol — the F6-site/-convention defect in
  miniature.

### F14 — minor — NAP canonical source ambiguous; GBP/NAP parity lint unowned; phone-format contract absent

- `site.ts:21-33` is the emitted NAP source-of-truth for the site
  build (filled from `site-brief.md` — header comment :1-2);
  `depot_address` (LOCATION-PAGES :235) is a *separate* brief field
  the M3/M10 modules render as the facility NAP. Business NAP +
  depot NAP can diverge legitimately, but nothing defines which is
  canonical for LocalBusiness schema, and no lint compares footer
  NAP ↔ `depot_address` ↔ GBP-collected address.
- Phone formats: `Footer.astro:25` normalizes `tel:` by stripping
  non-digits — `form.php`'s `contact` field accepts "email *or*
  phone" (:196) with no shared phone-shape rule; `NOTIFY_PHONE`
  needs E.164 for Twilio (:216-218), brief collects
  `notify_phone` free-text.

Fix: declare `site-brief.md` the canonical NAP record
(name/address/phone/email + optional `depot_*` block), `site.ts`
its build projection, `nap_lint` a gate check (footer text + schema
props == brief values verbatim — closes the fabrication question
for theme 1 at the artifact level).

## 5. Split / sub-module proposal

S6 stays one lane (the capability resolution must happen in one pass —
that *is* the architecture) but the spec's internal seams harden into
named sub-artifacts:

1. **`host_probe` sub-pass** (new, before registry resolution —
   closes F4/F5): SSH probe via the S7 contract's own jump rules →
   `host-facts.json` `{server: apache|nginx|static, php_version,
   getenv_visibility, has_mod_headers, writable_docroot}`. Registry
   resolution reads facts, not guesses.
2. **`forms` capability re-shape** (F7/F12): `form_delivery` becomes a
   `forms[]` array keyed by route — each row `{route, form_name,
   destination_env, transport, success_route}`. The single-endpoint
   file stays (PHP `switch` on `form_name`), but destinations,
   success pages, and Netlify `name`s are per-route.
3. **`dns` + `secrets_delivery` capability rows** (F4/F6): emitted
   artifacts `site/DNS-RECORDS.md`, `site/HOST-TODO.md`,
   `site/SECRETS.md` — the operator-actionable arm the current spec
   lacks; verdicts ride `INTEGRATIONS.md` like everything else.
4. **`verification` + `analytics` capability rows** (F10): tag/meta
   emission through an `SEOHead` slot (S5 patch) + CSP-declared
   exceptions; the `static-only` host gets the platform forms row
   (F7) instead of `form.php`.
5. **`env-manifest.json` as run-scope sibling** (F9): S6 *owns* the
   host-scope rows; the manifest itself is minted at S0/intake and
   appended by any stage that gains an env need — the registry's
   `needs_env` arrays become pointers into it.
6. **Submit-probe contract** (F11): `WF_PROBE_TOKEN` env + smoke #14
   — S6 emits the probe handler, S7 fires it; the registry row
   `probe: {emitted, post_deploy_result}` is the only honest `live`
   for `form_delivery`.

## 6. Automation surface

Every mechanical check, proposed contract, exit 0/1/2.

### `tools/host_probe.py` (new — F4/F5)
- **In:** `site-brief.md` `## Deploy` (alias, user, docroot).
- **Out:** `site/host-facts.json` + exit 2 on unreachable host.
- Runs `ProxyJump jump` probe: web-server identification (response
  `Server:` header + `apachectl -v`/`nginx -v` best-effort),
  `php -v`, a dropped `wf-probe.php` that prints `php_sapi_name()` +
  `getenv('PATH')` to prove the SAPI env channel, `test -w docroot`.
  The probe file is deleted in the same session.

### `tools/integrations_emit.py` (new — the deterministic half of the lane)
- **In:** `integrations.json` + `host-facts.json` + `site-brief.md`.
- **Out:** `public/form.php` (rendered template — the endpoint is a
  *generated* file, not authored prose), `public/.htaccess` /
  `site/host-config/<site>.conf`, merged `public/_headers`,
  `.env.sample`, `site/DNS-RECORDS.md`, `site/HOST-TODO.md`.
- All security rules (8KB cap, CRLF-strip, honeypot, file-IP cap,
  `IfModule` guards, `Cache-Control: no-store` header) live in the
  template — never re-derived per lane.

### `tools/env_check.py` (new — F9)
- **In:** `site/env-manifest.json` + `scope` arg.
- **Out:** per-row `present|absent` table; exit 1 on
  `required_for:live` absences; writes the env table block of
  `INTEGRATIONS.md`. Every stage lane calls this at mint instead of
  ad-hoc `printenv` greps — one convention, one recorder.

### `tools/header_lint.py` (new — F1/F2/F13)
- **In:** emitted `.htaccess`/`_headers`/nginx snippet + `dist/` HTML.
- **Contract:** every spec'd header present with exact value in the
  right file; `_headers` merge integrity (starter `Cache-Control`
  block intact); CSP parse — *simulate* policy against built pages:
  any inline `<style>`/`<script>` or `is:inline` in `dist/` under a
  `style-src`/`script-src` that forbids it → fail (this is the check
  that catches F2's Astro-inlining trap mechanically); ACME
  passthrough regex precedes the redirect block; HSTS commented until
  `armed:true` flag.

### `tools/dns_check.py` (new — F6)
- **In:** `site/DNS-RECORDS.md` expected records.
- **Out:** `dig +short` verdicts per record → `dns` row status.
  Runs pre-seal in S7; S6 can run it in `report-only` mode.

### `tools/nap_lint.py` (new — F14)
- **In:** `site-brief.md` NAP block + `src/site.ts` + built footer
  markup (or `dist/` at S7).
- **Contract:** name/phone/email/address verbatim-equal (modulo
  whitespace); `depot_*` fields validated where present; phone
  `tel:` href is digits/E.164. Exit 1 on drift — closes the
  NAP-authenticity question at the artifact.

### `tools/secret_scan.py` (spec'd in prose :317-318 → formalize)
- Value-shaped-string grep over the write set (`SK…`,
  `-----BEGIN`, `re_[A-Za-z0-9]{30,}`, 40+ char tokens); the S6 done
  gate invokes it, exit 1 refuses `prd_step done`.

Lane judgment stays for: transport choice on partial pins, degrade
copy on the contact page, waiver wording in `INTEGRATIONS.md`, and
the CSP-vs-analytics trade-off conversation (F10).

## 7. SOP skeleton — `web-integrations-<site>` lane steps (revised)

1. **Intake.** Parse `site-brief.md` (`contact_email/phone`,
   `notify_phone`, `## Deploy` incl. **`host.type`** — F5),
   `site/sitemap.md` (contact/quote + any `forms[]` routes — F12),
   existing `integrations.json` pins, `env-manifest.json` host rows.
2. **Host probe.** `tools/host_probe.py` → `host-facts.json`;
   unreachable → `prd_step ask`; `host.type` conflict → probe wins,
   recorded.
3. **Registry draft.** `forms[]` per route, `sms_notify`, `ssl`,
   `security_headers`, `dns`, `secrets_delivery`, `verification`,
   `analytics`, `platform_form` (static-only) — honor pins.
4. **Env resolution.** `env_check.py --scope run` on the wiring
   shell; `host` rows resolved *by probe fact + delivery plan*, not
   by local `printenv` (F4/F9).
5. **Emit.** `integrations_emit.py` renders `public/form.php` (or the
   platform-form markup patch — F7), `public/.htaccess`/nginx
   snippet to `site/host-config/`, merged `_headers` (F13),
   `.env.sample`, `DNS-RECORDS.md`, `HOST-TODO.md`, `SECRETS.md`.
   `form.php` is *omitted* when `host.type == static-only`.
6. **Degrade wiring.** `form_delivery` degraded → flip the contact
   route to mailto/`tel:` (S5 must emit both branches — F8 patch);
   `/thank-you/` `/form-error/` routes exist as ancillary rows.
7. **Verification tags.** `SEOHead` slot emits
   `google-site-verification` + declared analytics (F10); CSP
   exceptions composed from the registry, not hand-edited.
8. **Lints.** `header_lint.py` (incl. the `dist/` inline-content CSP
   simulation — F2), `nap_lint.py`, `secret_scan.py` — any fail
   stops the lane.
9. **Report.** `site/INTEGRATIONS.md` — verdict per row, env table,
   degrade actions, `install_owner` checklist, operator waivers
   (`form_delivery` degraded, DNS pending, platform-notification
   enabled-by-operator).
10. **Commit seams.** `site: integrations registry`, `site: form
    endpoint + headers`, `site: integrations report`.
11. **Done.** `prd_step done` names the verdict combination +
    `HOST-TODO`/`DNS` pending items S7 must verify post-deploy.

## 8. Cross-module contracts — S6 owns, S7 owns, neither owns today

The deploy-adjacent demands, decomposed — **the line**:

| Concern | S6 (declare/emit) | S7 (execute/verify) | Owner today |
|---|---|---|---|
| Form→email mapping | `forms[]` registry rows + emitted endpoint | POST `submit_probe` result in deploy-report | partially S6, probe unowned — F11 |
| Email routing (outbound DKIM/domain) | `DNS-RECORDS.md` + `dns` row | `dns_check.py` pre-seal | **nobody — F6** |
| Email routing (inbound MX/mailbox) | named expectation in `INTEGRATIONS.md` | probe submit is the only real test | **nobody — F12** |
| Header/server hardening | emit `public/.htaccess` + snippet + `_headers` | rsync (F1 path fix) + `curl -sI` verify + root-install items | emits S6 ✓, install owner **gap — F1/F11** |
| Secrets | `.env.sample` + `SECRETS.md` + `env-manifest.json` host rows | operator applies; `host_probe` verifies visibility | mechanism **nobody — F4** |
| SSL | ordering-safe emitted config + `ACME_EMAIL` | ACME run + redirect flag + HSTS arm | clean split ✓ — except privilege (F11) |
| Analytics/verification tags | `verification`/`analytics` rows + SEOHead emission | gate exception list read from registry | **nobody — F10** |
| NAP/schema | `nap_lint` input + `site.ts` contract | `nap_lint` run at gate | canonical source **ambiguous — F14** |
| Jump access | reuse of S7's probe contract for `host_probe` | probe is S7's step 2 | contract S7 ✓, S6 consumer **new** |
| `dist/`+artifacts rsync scope | emits to `public/` so artifacts ride `dist/`; `site/host-config/` explicit-rsync or operator-copied | rsync step fix naming S6 paths | **contradictory — F1** |

**S5 owes S6** (none specced today): the contact-route markup with
form + mailto branches + honeypot/`ts` fields (F8); `/thank-you/` +
`/form-error/` routes in the ancillary matrix; an `SEOHead` slot for
verification/analytics tags (F10); `build.inlineStylesheets`
decision (F2); **no `is:inline` scripts rule** (F2).
**S0 owes S6**: `host.type` + `dns_provider` + `service_area`
completeness for NAP; `forms[]` route→destination intents (F5/F12).
**S1 owes S6**: `env-manifest.json` mint + its own DATAFORSEO/GSC/
OPENAI rows (F9).

## 9. Verdict

S6's architecture is the best-thought-through of the two landable
stage specs — one registry, one resolution pass, degrade-don't-block —
and the SSL ordering treatment (:236-245) is genuinely hard-won. But
the spec was written as if the deploy happens *to the repo*: F1 means
the flagship header artifact never leaves `sites/<slug>/`, F2 means
the emitted CSP breaks the vendored starter's own output, and F3
means the anti-bot contract can't execute on the output type the
factory declared. F4+F5 mean the credential plumbing has no transport
to the host at all. These are not polish items — they are defects the
first real run will hit in the first hour.

**Must exist before this module's PRD:**
1. F1's deployable-path fix (emit to `public/`; S7 rsync scope named)
   — else `security_headers` is theater.
2. F2's CSP↔Astro co-contract (`inlineStylesheets` decision + the
   `is:inline` ban + gate check) — else the policy either breaks the
   site or gets weakened silently.
3. F8's producer patch to S5 (both branches, success routes, SEOHead
   slot) — S6 cannot mint against a contract no one emits.
4. F5's intake fields (`host.type`, `dns_provider`) + `host_probe` —
   else the first lane step guesses.
5. F4/F9's env-manifest + secrets-delivery mechanism — else `live`
   verdicts are asserted against the wrong environment.
6. F6/F7's `dns` and `platform_form` rows — else Resend-as-live and
   static-only are both false advertising.
7. F11's `install_owner` split + submit-probe — else half the write
   set needs privileges the contract forbids and `LIVE` is
   unverifiable.

Cheapest wins: F13 (one merge-convention line), F14 (declare
`site-brief.md` the NAP authority + one lint), F12 hardening rows
(extends an existing table), F3's honest restatement (one paragraph
+ a file-backed IP cap in the emitted endpoint).
