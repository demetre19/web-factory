---
name: s6-integrations
description: Web Factory stage S6 — one wiring lane per site. Emits site/integrations.json (capability registry, env key names never values), public/form.php (Resend → SMTP → mailto degrade chain, honeypot + timestamp), host header config + public/_headers, .env.sample, and site/INTEGRATIONS.md audit artifact. Every capability degrades rather than blocks except SSL. Spec authority: research/WEB-FACTORY-S6-INTEGRATIONS.md.
---

# Stage S6 — Integrations + security hardening

## Role

One wiring lane `web-integrations-<site>` per site. You turn the static
site into a working business asset: the contact form reaches a real
mailbox, the operator gets an SMS ping per lead, security headers ride
every response, TLS is enforced at launch.

## Spec authority

`research/WEB-FACTORY-S6-INTEGRATIONS.md` — the capability registry
schema, the transport degrade chain, header/redirect config, the
env-manifest rules.

## Upstream contract consumed verbatim

- `sites/<slug>/` — S5 output; the contact/quote route already renders
  `<form action="/form.php" method="POST">` with honeypot + timestamp
  fields and the mailto/`sent` fallback branch.
- `site/site-brief.md` — `contact_email`, `contact_phone`,
  `notify_phone`, `host` (`type: apache|nginx|static-only`, SSH
  alias). A missing destination field is a flag, not a refuse — except
  a brief with neither email nor phone, which cannot degrade to
  anything.
- `site/sitemap.md` — locates the contact/quote route.
- `site/integrations.json` — may be operator-pre-seeded to pin
  transports; honor the pins.
- Operator environment — probe env-key **presence only**; values are
  typed by the operator on the host, never through a lane prompt or a
  committed file.

Mint preconditions (coordinator's gate): `sites/<slug>/` exists with a
prior `astro build` exit 0; brief parses with ≥1 contact destination;
**no `integrations.json` row already `live`** — a re-mint on a wired
site is a refuse; re-wiring is a repair lane keyed on the registry.

## Write set

- `site/integrations.json` — the registry: `form_delivery`,
  `sms_notify`, `ssl`, `security_headers` rows with transport,
  `needs_env` key names, `degrade_to` fallback, `status`.
- `public/form.php` — the single endpoint: field contract, honeypot
  (`hp` non-empty → 200 no send), timestamp (stale → reject),
  transport chain Resend → SMTP → degrade.
- Header config — `.htaccess` (apache) or nginx snippet (nginx) +
  `public/_headers` always; ACME passthrough first, redirect-behind-
  flag second, header table third.
- `.env.sample` — one line per registry env key + unlock comment.
- `site/INTEGRATIONS.md` — per-capability verdicts, env present/absent
  table, degrade actions taken, operator waivers S7 needs.
- Degrade-path page edit — when `form_delivery` degrades, flip the
  contact route to the mailto/`tel:` CTA branch (never both rendered).

## Degrade rules

Every capability degrades rather than blocks — a missing credential
produces a flagged, working fallback, never a broken page or dead
build. Exception: **`ssl` is the only non-degradable capability** — a
site that can never get TLS is a refuse at intake. `mail()` is never a
transport (unauthenticated, spam-lands, no failure signal); `mailto:`
is a better degrade.

## Acceptance / done criteria

- `integrations.json` parses, carries all four rows, contains no
  value-looking string.
- `INTEGRATIONS.md` non-empty: verdict per capability + env table.
- `public/form.php` exists with field contract, honeypot, timestamp.
- Header config for the declared host type + `public/_headers`.
- `ssl` row is not `none`.
- Secret-scan self-check: grep emitted files for value-shaped strings;
  refuse to proceed on a hit.
- `done` closing names the verdict combination (e.g. `live resend,
  degraded sms, host-managed ssl`) + any operator waivers.

## Named failure modes

- **Partial env** — `RESEND_API_KEY` without `FORM_TO` degrades the
  whole row to the next transport; completeness is per-key-set.
- **Static-only host** — `form.php` cannot run; transport becomes the
  platform form mechanism, `sms_notify` → `none` unless a platform
  hook exists; the report says which.
- **Credential present but wrong** — resolution cannot detect a bad
  key; S7's post-deploy probe is the catch. Emit the endpoint so the
  probe has a target.
- **Redirect-before-cert** — arming `http→https` 301s or HSTS before
  the cert exists bricks the site; ordering is explicit in the emitted
  config comments.
