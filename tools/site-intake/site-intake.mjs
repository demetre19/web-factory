#!/usr/bin/env node
/**
 * site-intake — Web Factory design-intake front end (docs/machinery/DESIGN-INTAKE.md).
 * Zero dependencies, Node >= 18.
 *
 *   crawl   <url>   Capture same-origin pages into refs/ + extract facts into a draft brief.
 *   capture <url>   Capture one URL (inspiration etc.) into refs/.
 *   variants        Generate 3 contract-shaped homepage variants for operator pick.
 *
 * Flags: --out <dir> (site/design, default ./design) --role <baseline|inspiration|variant>
 *        --brief <path> --max <n> --pick <variant-file>
 */
import { writeFileSync, mkdirSync, readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = dirname(fileURLToPath(import.meta.url));
const UA = 'web-factory-site-intake/1.0';
const MAX_PAGES_DEFAULT = 20;

/* ---------- helpers ---------- */

function parseArgs(argv) {
  const [, , cmd, ...rest] = argv;
  const flags = {};
  const pos = [];
  for (let i = 0; i < rest.length; i++) {
    if (rest[i].startsWith('--')) flags[rest[i].slice(2)] = rest[++i] ?? true;
    else pos.push(rest[i]);
  }
  return { cmd, pos, flags };
}

async function fetchText(url, ms = 15000) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms);
  try {
    const r = await fetch(url, { signal: ctl.signal, headers: { 'user-agent': UA } });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.text();
  } finally { clearTimeout(t); }
}

function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
const slugify = (s) => s.toLowerCase().replace(/^\/+|\/+$/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'index';
const stripTags = (s) => s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

/* ---------- capture ---------- */

function saveCapture(html, outDir, role, url, seq) {
  const { pathname } = new URL(url);
  const file = `${String(seq).padStart(2, '0')}-${slugify(pathname)}.html`;
  writeFileSync(join(outDir, 'refs', file), html);
  return { file, role, source_url: url, captured_at: new Date().toISOString() };
}

function writeManifest(outDir, rows) {
  const p = join(outDir, 'refs', 'MANIFEST.md');
  const existing = existsSync(p) ? readFileSync(p, 'utf8').split('\n').slice(0, 2) :
    ['# refs/MANIFEST.md', '', '| file | role | source_url | captured_at |', '|---|---|---|---|'];
  const lines = Array.isArray(existing) ? existing.slice(4).filter(l => l.startsWith('|')) : [];
  for (const r of rows) lines.push(`| ${r.file} | ${r.role} | ${r.source_url} | ${r.captured_at} |`);
  writeFileSync(p, [existing[0], '', '| file | role | source_url | captured_at |', '|---|---|---|---|', ...lines, ''].join('\n'));
}

/* ---------- crawl ---------- */

async function discoverUrls(base, max) {
  const urls = new Set([base]);
  try {
    const sm = await fetchText(new URL('/sitemap.xml', base).href, 8000);
    for (const m of sm.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      try { const u = new URL(m[1]); if (u.origin === new URL(base).origin && !u.pathname.match(/\.(xml|jpg|png|pdf)$/i)) urls.add(u.href); } catch {}
      if (urls.size >= max) break;
    }
  } catch {}
  if (urls.size < 3) { // link fallback from home page
    try {
      const html = await fetchText(base);
      for (const m of html.matchAll(/href="([^"#]+)"/g)) {
        try {
          const u = new URL(m[1], base);
          if (u.origin === new URL(base).origin && !u.pathname.match(/\.(jpg|png|pdf|xml|css|js|ico|svg|webp)$/i)) urls.add(u.href);
        } catch {}
        if (urls.size >= max) break;
      }
    } catch {}
  }
  return [...urls].slice(0, max);
}

/* ---------- fact extraction ---------- */

function extractFacts(pages) {
  const f = { phones: new Set(), emails: new Set(), socials: new Set(), titles: [], h1: {}, jsonld: [], cssVars: {} };
  for (const { url, html } of pages) {
    f.titles.push({ url, title: html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() ?? '' });
    const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    if (h1) f.h1[url] = stripTags(h1[1]);
    for (const m of html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
      try { f.jsonld.push(JSON.parse(m[1].trim())); } catch {}
    }
    for (const m of html.matchAll(/href="tel:([^"]+)"/g)) f.phones.add(decodeURIComponent(m[1]));
    for (const m of html.matchAll(/href="mailto:([^"?]+)/g)) f.emails.add(m[1]);
    for (const m of html.matchAll(/href="(https?:\/\/(www\.)?(facebook|instagram|twitter|x|linkedin|youtube|tiktok)\.com[^"]*)"/gi)) f.socials.add(m[1]);
  }
  return f;
}

async function extractCssVars(base, html) {
  const vars = {};
  const links = [...html.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["']/gi)].map(m => m[1]).slice(0, 3);
  const inline = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map(m => m[1]);
  const css = [...inline];
  for (const l of links) { try { css.push(await fetchText(new URL(l, base).href, 8000)); } catch {} }
  for (const sheet of css)
    for (const m of sheet.matchAll(/(--[a-zA-Z0-9-]+)\s*:\s*([^;{}]+)/g)) vars[m[1]] = m[2].trim();
  return vars;
}

function draftBrief(facts, cssVars, base) {
  const ld = facts.jsonld.flatMap(j => j['@graph'] ?? [j]);
  const biz = ld.find(n => /Business|Organization/i.test(String(n?.['@type'] ?? '')));
  const hexes = Object.entries(cssVars).filter(([, v]) => /^#|rgb/.test(v));
  const host = new URL(base).hostname;
  return `# site-brief — DRAFT (site-intake, ${new Date().toISOString().slice(0, 10)})
# Provenance: facts marked [extracted] came from crawling ${host}.
# Gaps marked TODO: cannot be observed on a website — fill before S1 mints.

## Site class
site_class: TODO: local | national | ecom

## Entity facts
- url: ${base}  [extracted]
- name: ${biz?.name ?? `TODO: business name (h1 guess: "${Object.values(facts.h1)[0] ?? ''}") [extracted-guess]`}
- description: ${biz?.description ? biz.description + '  [extracted]' : 'TODO: one-line what the business does'}
- gbp_primary_category: TODO:  (Maps method — see WEB-FACTORY.md §S0)
- gbp_secondary_category: TODO:
- social_profiles: ${facts.socials.size ? [...facts.socials].map(s => `\n  - ${s}  [extracted]`).join('') : '\n  - TODO: none found'}
- review_source: TODO: GBP URL or paste testimonials (gates Review JSON-LD)

## About source
${facts.titles[0] ? `> ${facts.titles[0].title}` : 'TODO: paste the business\'s own home/about copy'}  [extracted — expand or replace with verbatim copy]

## Contact destinations
- contact_email: ${[...facts.emails][0] ?? 'TODO:'}${facts.emails.size ? '  [extracted]' : ''}
- contact_phone: ${[...facts.phones][0] ?? 'TODO:'}${facts.phones.size ? '  [extracted]' : ''}
- notify_phone: TODO: SMS notification target

## Design intake
- design_mode: TODO: variants | refs-inspiration | refs-existing | audit-remodel | dox  (see docs/machinery/DESIGN-INTAKE.md)
- existing_site_url: ${base}
- extracted_tokens: refs/tokens-raw.json (${Object.keys(cssVars).length} CSS vars, ${hexes.length} colour-bearing)
- inspiration_urls:
  - TODO: (refs-inspiration mode only)

## Deploy
- host_alias: TODO:
- user: TODO:
- docroot: TODO:
- url: TODO: https:// (production URL — canonical authority)
`;
}

/* ---------- variants ---------- */

// Utopia-style fluid scale, viewport 320→1440 (matches the responsive floor).
function clamp(minPx, maxPx, minVw = 320, maxVw = 1440) {
  const slope = (maxPx - minPx) / (maxVw - minVw);
  const yInt = minPx - slope * minVw;
  return `clamp(${(minPx / 16).toFixed(4)}rem, ${(yInt / 16).toFixed(4)}rem + ${(slope * 100).toFixed(3)}vw, ${(maxPx / 16).toFixed(4)}rem)`;
}

function tokenBlock(char, palette, family, radius) {
  const step = (a, b) => clamp(a, b);
  return {
    formatVersion: 'site-intake-tokens@1',
    character: char,
    viewportRange: '320-1440',
    color: palette,
    font: { family },
    radius: { md: radius },
    type: { 'step--1': step(14, 15), 'step-0': step(16, 18), 'step-1': step(19, 23), 'step-2': step(23, 29), 'step-3': step(27, 36), 'step-4': step(33, 45), 'step-5': step(40, 56) },
    space: { '3xs': step(4, 6), '2xs': step(8, 12), xs: step(12, 18), s: step(16, 24), m: step(24, 36), l: step(32, 48), xl: step(48, 72), '2xl': step(64, 96), '3xl': step(96, 144) },
  };
}

function variantPage(name, char, tok, hero, accent) {
  const t = tok;
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(name)} — variant ${char}</title>
<script type="application/json" id="tokens">${JSON.stringify(t, null, 2)}</script>
<style>
:root{
 --bg:${t.color.bg};--surface:${t.color.surface};--text:${t.color.text};--muted:${t.color.muted};--accent:${t.color.accent};
 --step--1:${t.type['step--1']};--step-0:${t.type['step-0']};--step-1:${t.type['step-1']};--step-2:${t.type['step-2']};--step-3:${t.type['step-3']};--step-4:${t.type['step-4']};--step-5:${t.type['step-5']};
 --s3xs:${t.space['3xs']};--s2xs:${t.space['2xs']};--sxs:${t.space.xs};--ss:${t.space.s};--sm:${t.space.m};--sl:${t.space.l};--sxl:${t.space.xl};--s2xl:${t.space['2xl']};
 --r:${t.radius.md};
}
*{margin:0;box-sizing:border-box}body{background:var(--bg);color:var(--text);font-family:${t.font.family};font-size:var(--step-0);line-height:1.55}
.wrap{max-width:72rem;margin-inline:auto;padding-inline:var(--ss)}
.hdr{display:flex;align-items:center;justify-content:space-between;padding-block:var(--ss)}
.logo{font-weight:700;font-size:var(--step-1)}
.nav{display:flex;gap:var(--sm);font-size:var(--step--1)}.nav a{color:var(--muted);text-decoration:none}.nav a:hover{color:var(--text)}
.hero{padding-block:var(--s2xl);background:${accent};display:grid;gap:var(--sm)}
.hero h1{font-size:var(--step-5);line-height:1.08;max-width:16ch}
.hero p{font-size:var(--step-1);color:var(--muted);max-width:52ch}
.btn{display:inline-block;padding:var(--s2xs) var(--sm);border-radius:var(--r);background:var(--accent);color:var(--bg);font-weight:600;font-size:var(--step-0);text-decoration:none;width:max-content}
.btn.ghost{background:transparent;color:var(--accent);border:1px solid var(--accent)}
.cards{display:grid;gap:var(--sm);grid-template-columns:repeat(auto-fit,minmax(min(100%,16rem),1fr));padding-block:var(--sxl)}
.card{background:var(--surface);border-radius:var(--r);padding:var(--sm);display:grid;gap:var(--sxs)}
.card h3{font-size:var(--step-2)}.card p{color:var(--muted);font-size:var(--step--1)}
.strip{padding-block:var(--sl);font-size:var(--step--1);color:var(--muted);border-block:1px solid color-mix(in srgb,var(--muted) 25%,transparent)}
.ftr{padding-block:var(--sl);font-size:var(--step--1);color:var(--muted);display:grid;gap:var(--sxs)}
</style></head><body>
<header class="wrap hdr"><div class="logo">${esc(name)}</div><nav class="nav" aria-label="main"><a href="#">Services</a><a href="#">About</a><a href="#">Reviews</a><a href="#">Contact</a></nav></header>
<section class="wrap hero"><h1>${esc(hero)}</h1><p>The team that shows up, does it right, and backs it with a real guarantee.</p><div style="display:flex;gap:var(--sxs)"><a class="btn" href="#">Get a free quote</a><a class="btn ghost" href="#">Call now</a></div></section>
<div class="wrap strip">★★★★★ Trusted locally · Licensed & insured · Same-week scheduling</div>
<main class="wrap"><section class="cards">
<div class="card"><h3>Core service</h3><p>The thing you're known for — described in the customer's words, not trade jargon.</p></div>
<div class="card"><h3>Repairs & fixes</h3><p>The urgent reason most visitors arrive. Fast answer, clear next step.</p></div>
<div class="card"><h3>Maintenance</h3><p>The recurring-revenue offer that turns one job into a relationship.</p></div>
</section></main>
<footer class="wrap ftr"><div>${esc(name)} · Your City · (${'555) 010-0100'}</div><div>© 2026 · Terms · Privacy</div></footer>
</body></html>`;
}

const VARIANTS = [
  { id: 'a', char: 'trusted-local', palette: { bg: '#F7F5F0', surface: '#FFFFFF', text: '#1F2933', muted: '#52606D', accent: '#1D6F5C' }, family: 'ui-sans-serif, system-ui, sans-serif', radius: '0.5rem', accent_bg: 'linear-gradient(180deg,#F7F5F0,#ECE7DC)', hero: 'Straight answers, tidy work, done when we said' },
  { id: 'b', char: 'bold-direct-response', palette: { bg: '#0F1720', surface: '#1A2530', text: '#F3F6F8', muted: '#9BAAB8', accent: '#F59E0B' }, family: 'ui-sans-serif, system-ui, sans-serif', radius: '0.25rem', accent_bg: 'linear-gradient(135deg,#0F1720 60%,#1A2530)', hero: 'Get it fixed this week — or the callout is free' },
  { id: 'c', char: 'editorial-premium', palette: { bg: '#FBFAF7', surface: '#FFFFFF', text: '#171512', muted: '#6E6A61', accent: '#8C6A3F' }, family: 'Georgia, "Times New Roman", serif', radius: '0', accent_bg: '#FBFAF7', hero: 'Craft done properly, for people who notice' },
];

async function cmdVariants(outDir, briefPath) {
  let name = 'Business Name';
  if (briefPath && existsSync(briefPath)) {
    const m = readFileSync(briefPath, 'utf8').match(/name:\s*([^\n#]+)/);
    if (m) name = m[1].replace(/\[.*?\]/g, '').replace(/TODO:.*/,'').trim() || name;
  }
  const rows = [];
  for (const v of VARIANTS) {
    const tok = tokenBlock(v.char, v.palette, v.family, v.radius);
    const file = `variant-${v.id}-${v.char}.html`;
    writeFileSync(join(outDir, file), variantPage(name, v.char, tok, v.hero, v.accent_bg));
    rows.push({ file, role: 'variant-candidate', source_url: `generated:${v.char}`, captured_at: new Date().toISOString() });
    console.log(`  ${file}  (${v.char})`);
  }
  writeManifest(dirname(outDir) === outDir ? outDir : join(outDir, '..'), rows);
  console.log(`\n3 variants in ${outDir} — open each, pick one, then mark it: re-run capture --pick <file> or edit refs/MANIFEST.md role to 'variant'.`);
}

/* ---------- main ---------- */

const { cmd, pos, flags } = parseArgs(process.argv);
const outDir = flags.out ?? './design';
mkdirSync(join(outDir, 'refs'), { recursive: true });

if (cmd === 'crawl' || cmd === 'capture') {
  const url = pos[0];
  if (!url) { console.error(`usage: site-intake ${cmd} <url> --out <dir> [--role r] [--brief p] [--max n]`); process.exit(1); }
  const role = flags.role ?? 'baseline';
  const rows = [];
  if (cmd === 'crawl') {
    const urls = await discoverUrls(url, Number(flags.max ?? MAX_PAGES_DEFAULT));
    console.log(`crawling ${urls.length} page(s) from ${url}`);
    const pages = [];
    for (const [i, u] of urls.entries()) {
      try {
        const html = await fetchText(u);
        rows.push(saveCapture(html, outDir, role, u, i + 1));
        pages.push({ url: u, html });
        console.log(`  ✓ ${u}`);
      } catch (e) { console.log(`  ✗ ${u} — ${e.message}`); }
    }
    const facts = extractFacts(pages);
    const cssVars = pages[0] ? await extractCssVars(url, pages[0].html) : {};
    writeFileSync(join(outDir, 'refs', 'tokens-raw.json'), JSON.stringify(cssVars, null, 2));
    const briefPath = flags.brief ?? join(outDir, '..', 'site-brief.draft.md');
    writeFileSync(briefPath, draftBrief(facts, cssVars, url));
    console.log(`\nrefs/: ${rows.length} captures + MANIFEST.md + tokens-raw.json (${Object.keys(cssVars).length} vars)`);
    console.log(`brief draft: ${briefPath}`);
  } else {
    const html = await fetchText(url);
    rows.push(saveCapture(html, outDir, role, url, 90));
    writeManifest(outDir, rows);
    console.log(`captured ${url} → refs/ (role: ${role})`);
  }
  if (cmd === 'crawl') writeManifest(outDir, rows);
} else if (cmd === 'variants') {
  await cmdVariants(join(outDir, 'refs'), flags.brief);
} else {
  console.log(`site-intake — commands: crawl | capture | variants   (see docs/machinery/DESIGN-INTAKE.md)`);
}
