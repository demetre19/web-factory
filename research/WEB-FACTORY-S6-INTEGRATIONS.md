# WEB-FACTORY-S6-INTEGRATIONS — Stage S6: Integrations + security hardening

Stage S6 turns `sites/<slug>/` from a static brochure into a working
business asset: the quote/contact form reaches a real mailbox, the
operator gets an SMS ping per lead, security headers ride every
response, and TLS is enforced at launch. Every integration degrades
rather than blocks — a missing credential produces a flagged, working
fallback, never a broken page or a dead build.

This document is the stage spec. A NEW-WEBSITE run mints one S6 lane
from it — the **wiring lane** (`web-integrations-<site>`) — which emits
`site/integrations.json` (the capability registry), the form endpoint,
header/redirect config, and `site/INTEGRATIONS.md` (the audit artifact
naming every live and degraded capability). S7 must not mint until
`site/integrations.json` exists and `site/INTEGRATIONS.md` is
non-empty.

## Position in the factory

```
S5 build ──> sites/<slug>/ (static Astro project, dead CTA form)
                    │
 site-brief.md ─────┤
 operator env ──────┼──> S6 wiring lane
                    │        ├──> site/integrations.json  (registry)
                    │        ├──> public/form.php + .env.sample
                    │        ├──> .htaccess / nginx snippet + _headers
                    │        └──> site/INTEGRATIONS.md    (audit report)
                    ▼
            S7 gate+deploy (astro build, SEO gate, rsync, seal)
```

- **Upstream contract:** S5 emits a normal Astro project at
  `sites/<slug>/` whose contact/quote route renders a `<form
  action="/form.php" method="POST">` pointing at the endpoint this
  stage supplies. `site/site-brief.md` carries the destinations:
  `contact_email`, `contact_phone`, `notify_phone`, `host`
  (`type: apache|nginx|static-only`, SSH alias). A missing destination
  field is a flag, not a refuse — the integration degrades to the
  contact surface the brief does carry.
- **Downstream contract:** S7 runs `astro build`, deploys
  `dist/` plus the S6 artifacts, applies the header config on the
  declared host, and refuses to seal while
  `site/INTEGRATIONS.md` reports a degraded `form_delivery`
  capability the operator has not waived. S7 reads the registry; it
  never re-derives capability state itself.

## The one-decision architecture

One registry, no scattered checks. S6's only architectural move is
that **every integration is a row in one file** —
`site/integrations.json` — and that file is the single authority for
"what works on this site." Each row names the capability, the
transport, the env keys it needs, its `degrade_to` fallback, and its
`security` notes. The wiring lane resolves every row once, against
the operator's environment, and writes the verdict into
`site/INTEGRATIONS.md`:

```
site-brief destinations ──┐
env keys (RESEND_*,      ──┼──> resolve site/integrations.json ──> site/INTEGRATIONS.md
 SMTP_*, TWILIO_*, ...)  ──┘            (one pass, one verdict)
                                        │
                          ┌─────────────┼──────────────┐
                          ▼             ▼              ▼
                     form.php     header config    .env.sample
```

The alternative — each integration probing the environment at its own
touch-point — is the defect class this kills: three credentials
checked in three places means three degrade logics, and "form works"
becomes unanswerable by inspection. One registry row per capability,
one resolution pass, one report.

## Inputs

| Input | Source | Required |
|---|---|---|
| `sites/<slug>/` | S5 build output | YES — the wiring target |
| `site/site-brief.md` | NEW-WEBSITE intake | YES — `contact_email`, `contact_phone`, `notify_phone`, `host` |
| `site/sitemap.md` | S1 stage output | YES — locates the contact/quote route the form lives on |
| `site/integrations.json` | operator or this lane | NO — operator pre-seeds it to pin choices (e.g. SMTP over Resend); the lane creates it when absent |
| Operator environment | shell env at wiring time | NO — absent keys degrade per-row, never abort |

### Mint preconditions (the S6 gate's job, not the lane's)

1. `sites/<slug>/` exists and `astro build` has previously exited 0
   (the S5 done criteria — S6 does not re-run the build).
2. `site/site-brief.md` parses and names at least one contact
   destination (`contact_email` or `contact_phone`) — a site with
   neither cannot degrade to anything.
3. No row of `site/integrations.json` already declares `live` — a
   re-mint on a wired site is a refuse, not a re-wire (re-wiring is
   the repair lane's job, keyed on this same registry).

## Output — `site/integrations.json` (the registry)

The capability manifest. Committed, secret-free — it names env var
*names*, never values:

```json
{
  "schema": "web-factory-integrations/v1",
  "site": "<slug>",
  "capabilities": {
    "form_delivery": {
      "status": "pending | live | degraded",
      "transport": "resend | smtp | mailto",
      "needs_env": ["RESEND_API_KEY", "FORM_FROM", "FORM_TO"],
      "degrade_to": "mailto link + phone CTA on contact route",
      "security": ["no secret in markup", "honeypot + timestamp field"]
    },
    "sms_notify": {
      "status": "pending | live | degraded",
      "transport": "twilio | none",
      "needs_env": ["TWILIO_SID", "TWILIO_TOKEN", "TWILIO_FROM", "NOTIFY_PHONE"],
      "degrade_to": "email-only notification",
      "security": ["SMS is notice-only; form body never rides SMS"]
    },
    "ssl": {
      "status": "pending | live",
      "transport": "acme.sh | certbot | host-managed",
      "needs_env": ["ACME_EMAIL"],
      "degrade_to": "none — launch-blocking, S7 refuses seal",
      "security": ["HSTS only after HTTPS verified live"]
    },
    "security_headers": {
      "status": "pending | live",
      "transport": "apache .htaccess | nginx conf | _headers",
      "needs_env": [],
      "degrade_to": "netlify-style _headers file in public/",
      "security": ["see §Security headers"]
    },
    "cache_policy": {
      "status": "pending | live",
      "transport": "apache .htaccess | nginx conf | _headers",
      "needs_env": [],
      "degrade_to": "netlify-style _headers file in public/",
      "security": ["see §Cache policy"]
    }
}
```

`status` is the verdict the resolution pass writes: `pending` at
emit time, `live`/`degraded` after env resolution (S7 flips `ssl`
and `security_headers` to `live` only when its post-deploy probes
pass). `FORM_TO` defaults to `contact_email` from the brief;
`NOTIFY_PHONE` defaults to `notify_phone`. The operator may pin any
`transport` — the lane resolves the pinned value first and degrades
only when its env keys are absent.


## Output — `site/INTEGRATIONS.md` (the audit artifact)

One section per capability, each ending in a verdict line:

```
## form_delivery — LIVE (resend)     | DEGRADED (mailto — RESEND_API_KEY absent)
## sms_notify    — LIVE (twilio)     | DEGRADED (email-only — TWILIO_* absent)
## ssl           — PENDING-DEPLOY    | (verified only after S7 deploys)
## security_headers — EMITTED (.htaccess + _headers)
```

Plus: the env-key table (name, source, present/absent at resolve
time — never values), the degrade actions taken, and the operator
waivers a degraded `form_delivery` needs before S7 seals. This file
is the review artifact: a reviewer audits the wiring without
re-running env probes.

## Capability 1 — Form → email (`form_delivery`)

One endpoint, one file: `sites/<slug>/public/form.php` — plain PHP,
no dependencies, runs on any Apache/nginx+PHP SSH host the S7
contract targets. The choice is the host, not preference: the
vendored starter emits `output: "static"`, and PHP is the one
runtime nearly every SSH host already carries. A host brief that
declares `static-only` (Netlify-class) swaps the endpoint for a
`_forms`/`_redirects` platform form and marks the registry transport
accordingly — the report names which.

Transport chain, resolved top-down; first with complete env wins:

1. **Resend** — `RESEND_API_KEY` + `FORM_FROM` + `FORM_TO` → POST to
   `api.resend.com/emails` over TLS. Preferred: no SMTP relay setup,
   per-send API key, DKIM managed by Resend.
2. **SMTP / Google Workspace** — `SMTP_HOST` + `SMTP_USER` +
   `SMTP_PASS` + `SMTP_PORT` + `FORM_FROM` + `FORM_TO` → socket
   transport with STARTTLS on 587 (smtps on 465 accepted). Chosen
   when the operator's mail lives on the Google Workspace domain and
   an app password exists. Auth uses the env vars verbatim; PHP's
   `mail()` is never a transport — it is unauthenticated, unsigned,
   and lands in spam.
3. **mailto degrade** — none of the above → the contact/quote route
   renders a `mailto:<contact_email>` link and the `tel:` CTA instead
   of the form, the endpoint file is still emitted (a host that later
   gains credentials only needs env), and the report says exactly
   which env keys were absent.

The endpoint itself, regardless of transport:

- Accepts `POST` only; `GET` returns 405.
- Field contract: `name`, `contact` (email *or* phone), `message`,
  `site`, `hp` (honeypot — non-empty → 200 with no send, bots fail
  silently), `ts` (form-render timestamp — submissions under 3
  seconds are bots, same silent 200).
- Hard-capped: 8 KB body, 2000-char message, UTF-8 validated,
  CRLF-stripped on header fields (header-injection class).
- Rate shape: one submission per `ts` per session; the static form
  sets `ts` at render, so replays with stale timestamps fail the
  floor check.
- Reply goes to `FORM_TO` with `Reply-To` set to the submitter's
  email *only after* it parses as an address — a malformed
  `contact` field never reaches a header.
- On send success: `303` to `/<contact-path>/?sent=1`; on failure:
  `303` to `/<contact-path>/?sent=0` — the page renders thank-you
  or fallback copy from the query flag, never a bare error screen.

## Capability 2 — SMS notify (`sms_notify`)

Notice-only, always optional. A Twilio-class REST call
(`TWILIO_SID`, `TWILIO_TOKEN` →
`api.twilio.com/2010-04-01/Accounts/<sid>/Messages.json`) fires
inside `form.php` after a successful email send — *after*, so an
SMS outage can never block a lead email. Body is minimal:
`New lead on <site>: <name>, <contact>` — the message text never
rides SMS (PII minimization and SMS length both demand it).

Degrade: any missing `TWILIO_*` key → `transport: "none"`, the
email still sends, the report marks `DEGRADED (email-only)`.
SMS is never a reason a lead is lost.

## Capability 3 — SSL (`ssl`)

TLS is the one non-degradable capability: a launch without it is a
launch refused. S6's part is *readiness*, not certificate issuance
(S7 runs ACME at deploy):

- `ACME_EMAIL` present → registry `transport: acme.sh` (the host's
  lightest ACME client; `certbot` where acme.sh is absent);
  absent → `transport: host-managed` — the operator's panel handles
  it and S7 verifies the result the same way.
- The header config ships an `.htaccess`/nginx stanza that serves
  `/.well-known/acme-challenge/*` unredirected (the challenge path
  never 301s to HTTPS) and 301s everything else `http→https`
  **only behind a deploy flag** — S7 flips the redirect on after
  HTTPS answers, so a pre-cert deploy never serves a self-inflicted
  redirect loop.
- `Strict-Transport-Security` is emitted commented/disabled until
  the HTTPS check passes; flipping it before TLS is live locks
  visitors out — an unrecoverable degrade, the only capability
  where ordering is load-bearing.

## Capability 4 — Security headers (`security_headers`)

One emitted header set, written to `sites/<slug>/.htaccess`
(Apache) or the nginx `server` snippet, **and** mirrored into
`public/_headers` (Netlify-class syntax) so the same policy
survives a `static-only` host that never reads `.htaccess`. The
policy:

| Header | Value | Why |
|---|---|---|
| `Content-Security-Policy` | `default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; font-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'` | the site ships zero remote assets (S5 bans them); anything else is injection |
| `X-Content-Type-Options` | `nosniff` | MIME sniffing off |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | form paths don't leak to referrers |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | a brochure site needs none |
| `X-Frame-Options` | `DENY` | clickjacking (belt with `frame-ancestors`) |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | emitted dormant, armed post-cert (§SSL) |

Report table: header, value, file it was emitted to, verification
command S7 will run (`curl -sI https://<domain>/`). A header that
needs a value the CSP forbids (e.g. an operator-supplied analytics
script) is a flag in the report, never a silent policy weakening.

## Cache policy (`cache_policy`)

One `Cache-Control` matrix, emitted alongside the security headers in
the same config files (`.htaccess`/`nginx` + mirrored into
`public/_headers`):

| Path | Header | Why |
|---|---|---|
| `/_astro/*` | `public, max-age=31536000, immutable` | Astro fingerprinted bundles (hashed CSS/JS/processed images) — forever-cacheable, filename changes on content change |
| `/assets/*` and any `src/assets/`-emitted path | `public, max-age=31536000, immutable` | `astro:assets` output is fingerprinted the same way |
| `/*.png`, `/*.svg`, `/*.ico`, `/favicon*`, `/og-image.png` — `public/` stable URLs | `public, max-age=86400, must-revalidate` | referenced by URL from outside (OG scrapers, favicon caches, social crawlers) — they must stay fetchable at the same path after every deploy, so they can never ride the immutable policy |
| HTML (everything else) | `public, max-age=0, must-revalidate` | the symlink-flip deploy model serves new HTML instantly; stale HTML defeats atomic releases |

The audit-flagged defect this kills: `public/*` assets under the
immutable policy — an `og-image.png` regenerated on re-brand would
serve the stale card to every scraper for a year. Stable URL =
revalidate, fingerprinted = immutable; the rule is mechanical, the
report table rows it.

## Env/key manifest handling

`.env.sample` lands at `sites/<slug>/.env.sample` — every key the
registry names, one line each, commented with the capability it
unlocks and where the value comes from. Real values live in the
host's environment (`export` in the deploy user's profile or the
panel's env UI); `form.php` reads `getenv()` only. Rules:

- **No secret is ever committed** — the registry and `.env.sample`
  carry key *names*; the lane refuses (`prd_step done` gate on the
  report) if a value-looking string (40+ char token, `SK…`,
  `-----BEGIN`) appears in any emitted file.
- **Resolution is once, at wiring** — env keys are probed once and
  recorded as present/absent in `INTEGRATIONS.md`; nothing probes
  the env at page-request time beyond the endpoint's own
  `getenv()` read.
- **Per-key degrade** — each `needs_env` row degrades on its own;
  a site can ship `LIVE resend + DEGRADED sms + host-managed ssl`
  and the report says exactly that combination.

## Step-by-step — wiring lane (`web-integrations-<site>`)

1. **Read order:** `site/site-brief.md` (destinations, host type),
   `site/sitemap.md` (contact/quote path), existing
   `site/integrations.json` if the operator pre-seeded one, then
   the S5 output's contact page markup (confirm the `<form>`
   contract above — action, fields, honeypot).
2. **Create/complete the registry.** Write
   `site/integrations.json` with the five capability rows; honor
   operator-pinned transports, default the rest as above.
3. **Resolve env.** Probe every `needs_env` key once; record
   present/absent (never values) per capability.
4. **Emit `form.php`.** The single endpoint: field contract,
   honeypot + timestamp, transport chain (Resend → SMTP → refuse
   to send when `form_delivery` degraded — the page won't show the
   form anyway, but the file still validates input and 303s to the
   fallback flag).
5. **Emit header config.** `.htaccess` for `apache`, the nginx
   snippet for `nginx`, `public/_headers` always; ACME passthrough
   first, then redirect-behind-flag, then the header table.
6. **Emit `.env.sample`.** One line per registry env key with its
   unlock comment.
7. **Wire the degrade path.** `form_delivery` degraded → edit the
   contact route's page to render `mailto:`/`tel:` CTAs in place of
   the form (`sent` query-flag copy must already exist either way
   — S5 emits both branches; S6 only flips which renders).
8. **Write `site/INTEGRATIONS.md`.** Per-capability verdicts, the
   env table, degrade actions, waivers needed.
9. **Secret-scan self-check.** Grep emitted files for value-shaped
   strings; refuse to proceed on a hit.
10. **Commit per seam.** `site: integrations registry`,
    `site: form endpoint + headers`, `site: integrations report`.
11. **Done.** `prd_step done` — closing names the verdict
    combination (`live resend, degraded sms, host-managed ssl`)
    and any operator waiver S7 will need.

## Acceptance (stage-internal)

The S6 done-criteria the coordinator checks before minting S7:

- `site/integrations.json` parses, carries all five capability
  rows, and contains no value-looking string.
- `site/INTEGRATIONS.md` is non-empty with a verdict per
  capability and the present/absent env table.
- `public/form.php` exists with the field contract, honeypot, and
  timestamp checks (the page-level degrade either shipped the form
  or the mailto fallback — never both rendered).
- Header config emitted for the declared host type **and**
  `public/_headers`.
- `ssl` row is not `none` — a site that can never get TLS is a
  refuse at intake, not a degrade.

The spec-existence gate (`test -s research/WEB-FACTORY-S6-INTEGRATIONS.md`)
proves this document; the checks above are S6's done-criteria.

## Orchestration

- **One lane per site.** The registry is per-site; two sites in a
  run mint two disjoint `web-integrations-<site>` lanes.
- **No env in the lane.** The lane probes and records presence —
  real values are typed by the operator into the host at deploy,
  never through a lane prompt, a committed file, or a pane.
- **Re-run safety.** A re-minted lane refuses a `live` registry
  (mint precondition 3); re-wiring is a repair lane keyed on the
  same registry, so the capability map stays single-authority.
- **Failure modes worth naming:**
  - *Partial env* — `RESEND_API_KEY` without `FORM_TO` degrades
    the whole row to the next transport, it does not half-send;
    completeness is per-key-set, not per-key.
  - *Static-only host* — `form.php` can't run; the registry
    transport is the platform form mechanism, and `sms_notify`
    degrades to `none` unless the platform hook exists — the
    report says which.
  - *Credential present but wrong* — resolution can't detect a
    bad key; S7's post-deploy probe (a real submission to the
    staging URL, then the live one) is the verification that
    catches it. S6 emits the endpoint so that probe has a target.
  - *Redirect-before-cert* — arming `http→https` 301s or HSTS
    before the cert exists bricks the site; ordering is explicit
    in the emitted config comments and the report.

## Contested

- **PHP endpoint vs. an SSR adapter or external form service.**
  An Astro SSR output needs a Node host the S7 contract doesn't
  declare; an external service (Formspree-class) adds a third-party
  PII hop and a per-site account. PHP is the one runtime the SSH-
  host deploy contract already implies, carries zero dependencies,
  and keeps the entire transport chain inside one reviewable file.
  The `static-only` escape exists for hosts where even PHP is
  absent — it costs a registry row, not a second architecture.
- **One registry vs. per-integration env probes.** Probing inside
  each touch-point re-derives "what works" in three places — the
  exact class the adversarial review flagged for href grammar
  (F3). One file, one resolution pass, one report row per
  capability; consumers read verdicts, they never re-probe.
- **Degrade vs. block.** The only non-degradable capability is
  SSL — launching a lead-capture site over plain HTTP is a
  correctness failure, not a missing feature. Everything else has
  a real business fallback (mailto + phone is how the site worked
  before the form existed); blocking on a missing `TWILIO_TOKEN`
  would stop a launch over a notification nicety.
- **`mail()` never a transport.** PHP's built-in is tempting as a
  zero-config fallback — it sends unauthenticated mail that lands
  in spam and offers no failure signal. `mailto:` is a *better*
  degrade: the visitor's own client sends it, the address is
  verified by the user's mail stack, and deliverability is the
  sender's reputation, not the host's.
