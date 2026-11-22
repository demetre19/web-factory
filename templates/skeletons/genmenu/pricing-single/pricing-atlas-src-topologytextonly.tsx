import { useState } from 'react';
import { ArrowRight } from 'lucide-react';

/* ============================================================================
   Pricing29 — Minimalist Text-Only Pricing · Minimal / Professional (TypoFoundry)
   ============================================================================ */
export function Pricing29() {
  const [selected, setSelected] = useState<string | null>(null);

  const licenses = [
    {
      name: 'Desktop 1–5 Workstations',
      scope: 'Print, packaging, static PDFs, and studio mockups across 5 Macs or PCs.',
      price: '$140',
      unit: 'one-time',
      cta: 'License Desktop',
    },
    {
      name: 'Webfont up to 100k Pageviews',
      scope: 'WOFF2 variable font bundle self-hosted on a single domain with unlimited subdomains.',
      price: '$190',
      unit: 'one-time',
      cta: 'License Webfont',
    },
    {
      name: 'Mobile App Embedding',
      scope: 'iOS and Android binary bundling for 1 published title up to 250k active installs.',
      price: '$480',
      unit: 'one-time',
      cta: 'License App',
    },
  ];

  return (
    <section aria-labelledby="p29-heading" className="bg-white py-16 px-6 sm:px-10 text-slate-900">
      <div className="mx-auto max-w-4xl">
        <div className="pb-6 border-b border-slate-900">
          <p className="text-xs font-medium uppercase tracking-widest text-slate-500">
            TypoFoundry Typeface Licensing
          </p>
          <h2 id="p29-heading" className="mt-2 text-3xl font-semibold tracking-tight">
            Perpetual font family schedules
          </h2>
        </div>

        <div className="divide-y divide-slate-200">
          {licenses.map((lic) => (
            <div
              key={lic.name}
              className="py-7 flex flex-col sm:flex-row sm:items-center justify-between gap-6"
            >
              <div className="max-w-lg">
                <h3 className="text-lg font-semibold text-slate-900">{lic.name}</h3>
                <p className="mt-1 text-sm text-slate-600">{lic.scope}</p>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0">
                <div className="text-left sm:text-right">
                  <div className="text-2xl font-semibold tabular-nums">{lic.price}</div>
                  <div className="text-xs text-slate-500">{lic.unit}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelected(`${lic.name} (${lic.price})`)}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900 underline underline-offset-4 hover:text-slate-600 transition-colors whitespace-nowrap"
                >
                  <span>{lic.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {selected && (
          <p role="status" className="mt-4 text-sm text-slate-700 border-t border-slate-200 pt-4">
            Selected typeface license: <strong className="font-semibold">{selected}</strong>
          </p>
        )}
      </div>
    </section>
  );
}

/* ============================================================================
   Pricing30 — Minimalist Text-Only Pricing · Dark (Nocturne Mastering Studio)
   ============================================================================ */
export function Pricing30() {
  const [selected, setSelected] = useState<string | null>(null);

  const rates = [
    {
      service: 'Single Track Mastering',
      detail: 'Stereo analog chain + DDP, 24-bit WAV, Apple Digital Masters, 2 revisions.',
      rate: '$95',
      cta: 'Book Single',
    },
    {
      service: 'EP Bundle (up to 5 Tracks)',
      detail: 'Cohesive loudness & tonal matching, vinyl pre-master option, 3 revisions.',
      rate: '$410',
      cta: 'Book EP',
    },
    {
      service: 'Full LP Album (up to 12 Tracks)',
      detail: 'Dedicated 3-day studio block, stem mastering included, priority turnaround.',
      rate: '$890',
      cta: 'Book LP',
    },
  ];

  return (
    <section aria-labelledby="p30-heading" className="bg-[#121212] py-16 px-6 sm:px-10 text-neutral-100">
      <div className="mx-auto max-w-4xl">
        <div className="pb-6 border-b border-neutral-800">
          <p className="text-xs font-mono uppercase tracking-widest text-neutral-400">
            Nocturne Mastering Berlin
          </p>
          <h2 id="p30-heading" className="mt-2 text-3xl font-semibold tracking-tight text-white">
            2026 Studio Rate Sheet
          </h2>
        </div>

        <div className="divide-y divide-neutral-800">
          {rates.map((r) => (
            <div
              key={r.service}
              className="py-7 flex flex-col md:flex-row md:items-baseline justify-between gap-4"
            >
              <div className="max-w-lg">
                <h3 className="text-lg font-medium text-white">{r.service}</h3>
                <p className="mt-1 text-sm text-neutral-400">{r.detail}</p>
              </div>
              <div className="flex items-baseline gap-6 shrink-0">
                <span className="text-2xl font-mono font-semibold text-white tabular-nums">
                  {r.rate}
                </span>
                <button
                  type="button"
                  onClick={() => setSelected(`${r.service} — ${r.rate}`)}
                  className="text-sm font-medium text-neutral-200 border-b border-neutral-500 pb-0.5 hover:text-white hover:border-white transition-colors whitespace-nowrap"
                >
                  {r.cta}
                </button>
              </div>
            </div>
          ))}
        </div>

        {selected && (
          <p role="status" className="mt-5 text-sm font-mono text-neutral-300">
            Session request noted: {selected}
          </p>
        )}
      </div>
    </section>
  );
}

/* ============================================================================
   Pricing31 — Minimalist Text-Only Pricing · Light-Warm (Atelier Architecture)
   ============================================================================ */
export function Pricing31() {
  const [selected, setSelected] = useState<string | null>(null);

  const engagements = [
    {
      title: 'Feasibility & Site Audit',
      note: 'Zoning envelope review, solar orientation study, and preliminary budget range (2 weeks).',
      fee: '$3,200',
      cta: 'Request Audit',
    },
    {
      title: 'Schematic Design Package',
      note: 'Measured floor plans, 3D massing study, material board, and contractor bid set (6 weeks).',
      fee: '$9,800',
      cta: 'Request Schematic',
    },
    {
      title: 'Full Construction Administration',
      note: 'Permit drawings, bi-weekly site inspections, millwork details, and handover sign-off.',
      fee: '11% of build',
      cta: 'Inquire Full Scope',
    },
  ];

  return (
    <section aria-labelledby="p31-heading" className="bg-[#F5F2EB] py-16 px-6 sm:px-10 text-[#221F1B]">
      <div className="mx-auto max-w-4xl">
        <div className="pb-6 border-b border-[#221F1B]">
          <p className="text-xs uppercase tracking-widest text-[#70675B]">
            Kestrel Architectural Practice
          </p>
          <h2
            id="p31-heading"
            className="mt-2 text-3xl font-semibold [font-family:var(--font-serif)]"
          >
            Advisory & Residential Fee Schedule
          </h2>
        </div>

        <div className="divide-y divide-[#DDD6C8]">
          {engagements.map((item) => (
            <div
              key={item.title}
              className="py-7 flex flex-col sm:flex-row sm:items-center justify-between gap-6"
            >
              <div className="max-w-lg">
                <h3 className="text-xl font-semibold [font-family:var(--font-serif)]">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-sm text-[#5E564B]">{item.note}</p>
              </div>
              <div className="flex items-center gap-6 shrink-0">
                <span className="text-2xl font-semibold tabular-nums [font-family:var(--font-serif)]">
                  {item.fee}
                </span>
                <button
                  type="button"
                  onClick={() => setSelected(`${item.title} (${item.fee})`)}
                  className="text-sm font-medium text-[#221F1B] underline underline-offset-4 hover:text-[#6B5D4A] whitespace-nowrap"
                >
                  {item.cta}
                </button>
              </div>
            </div>
          ))}
        </div>

        {selected && (
          <p role="status" className="mt-5 text-sm text-[#221F1B] italic">
            Consultation requested for {selected}.
          </p>
        )}
      </div>
    </section>
  );
}

/* ============================================================================
   Pricing32 — Minimalist Text-Only Pricing · Bold / Colourful (PosterHaus Print)
   ============================================================================ */
export function Pricing32() {
  const [selected, setSelected] = useState<string | null>(null);

  const runs = [
    {
      name: 'Risograph Zine Run (100 copies)',
      spec: '24 pages, 2 soy inks on 120gsm Munken Lynx, saddle-stitched.',
      price: '$420',
      cta: 'Book Zine Run',
    },
    {
      name: 'A2 Exhibition Poster (250 copies)',
      spec: '4-color offset on 170gsm archival matte stock, trimmed full bleed.',
      price: '$680',
      cta: 'Book Poster Run',
    },
    {
      name: 'Foil & Emboss Monograph (500 copies)',
      spec: 'Smyth-sewn hardcover, cloth spine, custom brass die stamp.',
      price: '$3,900',
      cta: 'Book Monograph',
    },
  ];

  return (
    <section aria-labelledby="p32-heading" className="bg-blue-900 py-16 px-6 sm:px-10 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="pb-6 border-b border-blue-700">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-300">
            PosterHaus Press
          </p>
          <h2 id="p32-heading" className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight">
            Standard Edition Press Rates
          </h2>
        </div>

        <div className="divide-y divide-blue-700/80">
          {runs.map((run) => (
            <div
              key={run.name}
              className="py-7 flex flex-col sm:flex-row sm:items-center justify-between gap-6"
            >
              <div className="max-w-lg">
                <h3 className="text-lg font-bold text-white">{run.name}</h3>
                <p className="mt-1 text-sm text-blue-200">{run.spec}</p>
              </div>
              <div className="flex items-center gap-6 shrink-0">
                <span className="text-3xl font-extrabold text-amber-300 tabular-nums">
                  {run.price}
                </span>
                <button
                  type="button"
                  onClick={() => setSelected(`${run.name} — ${run.price}`)}
                  className="text-sm font-bold text-white border-b-2 border-amber-300 pb-0.5 hover:text-amber-200 transition-colors whitespace-nowrap"
                >
                  {run.cta}
                </button>
              </div>
            </div>
          ))}
        </div>

        {selected && (
          <p role="status" className="mt-5 text-sm font-semibold text-amber-200">
            Press estimate queued: {selected}
          </p>
        )}
      </div>
    </section>
  );
}
