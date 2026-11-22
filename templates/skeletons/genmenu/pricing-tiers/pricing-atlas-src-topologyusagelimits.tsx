import { useState } from 'react';
import { Check } from 'lucide-react';

/* ============================================================================
   Pricing21 — Tier Cards with Usage Limits · Minimal / Professional (VectorIndex)
   ============================================================================ */
export function Pricing21() {
  const [selected, setSelected] = useState<string | null>(null);

  const tiers = [
    {
      name: 'Sandbox',
      price: '$0',
      cadence: 'forever free',
      limits: [
        { label: 'Vectors stored', value: '250,000', pct: 25 },
        { label: 'Monthly queries', value: '500k / mo', pct: 20 },
        { label: 'P99 Latency SLA', value: '< 45 ms', pct: 55 },
      ],
      overage: 'Hard cap · No card required',
      cta: 'Start Sandbox',
    },
    {
      name: 'Production',
      price: '$79',
      cadence: '/ month',
      limits: [
        { label: 'Vectors stored', value: '5,000,000', pct: 65 },
        { label: 'Monthly queries', value: '25M / mo', pct: 60 },
        { label: 'P99 Latency SLA', value: '< 18 ms', pct: 85 },
      ],
      overage: '$2.50 per additional 1M queries',
      cta: 'Launch Production',
    },
    {
      name: 'Dedicated Shard',
      price: '$390',
      cadence: '/ month',
      limits: [
        { label: 'Vectors stored', value: '50,000,000', pct: 100 },
        { label: 'Monthly queries', value: '200M / mo', pct: 100 },
        { label: 'P99 Latency SLA', value: '< 8 ms', pct: 100 },
      ],
      overage: '$1.40 per additional 1M queries',
      cta: 'Provision Shard',
    },
  ];

  return (
    <section aria-labelledby="p21-heading" className="bg-white py-16 px-6 sm:px-10 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            VectorIndex Search API
          </p>
          <h2 id="p21-heading" className="mt-2 text-3xl font-semibold tracking-tight [text-wrap:balance]">
            Transparent index quotas and overage rates
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className="flex flex-col justify-between rounded-xl border border-slate-200 p-7 bg-slate-50/40"
            >
              <div>
                <h3 className="text-lg font-semibold">{tier.name}</h3>
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="text-4xl font-bold tabular-nums">{tier.price}</span>
                  <span className="text-xs text-slate-500">{tier.cadence}</span>
                </div>

                <div className="mt-6 space-y-4">
                  {tier.limits.map((lim) => (
                    <div key={lim.label}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-slate-600">{lim.label}</span>
                        <span className="font-mono font-semibold text-slate-900 tabular-nums">
                          {lim.value}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 rounded-sm overflow-hidden">
                        <div className="h-full bg-slate-900" style={{ width: `${lim.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                <p className="mt-6 text-xs font-mono text-slate-600 pt-4 border-t border-slate-200">
                  Overage: {tier.overage}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelected(`${tier.name} (${tier.price})`)}
                className="mt-6 w-full py-2.5 px-4 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors whitespace-nowrap"
              >
                {tier.cta}
              </button>
            </div>
          ))}
        </div>

        {selected && (
          <p role="status" className="mt-6 text-sm text-slate-700 bg-slate-100 rounded-lg px-4 py-2.5">
            Index tier selected: <strong className="font-semibold">{selected}</strong>
          </p>
        )}
      </div>
    </section>
  );
}

/* ============================================================================
   Pricing22 — Tier Cards with Usage Limits · Dark (TraceStream Observability)
   ============================================================================ */
export function Pricing22() {
  const [selected, setSelected] = useState<string | null>(null);

  const tiers = [
    {
      name: 'Ingest 50',
      price: '$45',
      quotas: [
        ['Log ingestion', '50 GB / mo'],
        ['Custom metrics', '10,000 series'],
        ['Trace retention', '14 days'],
        ['Team seats', '5 seats'],
      ],
      overage: '$0.85 / extra GB',
      cta: 'Select Ingest 50',
    },
    {
      name: 'Ingest 250',
      price: '$175',
      quotas: [
        ['Log ingestion', '250 GB / mo'],
        ['Custom metrics', '75,000 series'],
        ['Trace retention', '30 days'],
        ['Team seats', '25 seats'],
      ],
      overage: '$0.65 / extra GB',
      cta: 'Select Ingest 250',
    },
    {
      name: 'Ingest 1TB',
      price: '$580',
      quotas: [
        ['Log ingestion', '1,000 GB / mo'],
        ['Custom metrics', '350,000 series'],
        ['Trace retention', '90 days'],
        ['Team seats', 'Unlimited'],
      ],
      overage: '$0.48 / extra GB',
      cta: 'Select Ingest 1TB',
    },
  ];

  return (
    <section aria-labelledby="p22-heading" className="bg-[#0B0F17] py-16 px-6 sm:px-10 text-slate-100">
      <div className="mx-auto max-w-6xl">
        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-teal-400">
            TraceStream Telemetry
          </p>
          <h2 id="p22-heading" className="mt-2 text-3xl font-semibold tracking-tight text-white">
            Pay for ingestion volume, never per host
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {tiers.map((t) => (
            <div
              key={t.name}
              className="flex flex-col justify-between rounded-xl bg-[#121824] border border-slate-800 p-7"
            >
              <div>
                <div className="flex items-baseline justify-between">
                  <h3 className="text-lg font-semibold text-white">{t.name}</h3>
                  <span className="text-2xl font-mono font-bold text-teal-300 tabular-nums">
                    {t.price}
                    <span className="text-xs font-normal text-slate-400">/mo</span>
                  </span>
                </div>

                <dl className="mt-6 divide-y divide-slate-800 text-sm">
                  {t.quotas.map(([k, v]) => (
                    <div key={k} className="py-2.5 flex justify-between gap-2">
                      <dt className="text-slate-400">{k}</dt>
                      <dd className="font-mono text-slate-100 tabular-nums">{v}</dd>
                    </div>
                  ))}
                </dl>

                <p className="mt-4 text-xs font-mono text-slate-400">Overages: {t.overage}</p>
              </div>

              <button
                type="button"
                onClick={() => setSelected(`${t.name} (${t.price}/mo)`)}
                className="mt-6 w-full py-2.5 px-4 rounded-lg bg-teal-400 text-slate-950 text-sm font-semibold hover:bg-teal-300 transition-colors whitespace-nowrap"
              >
                {t.cta}
              </button>
            </div>
          ))}
        </div>

        {selected && (
          <p role="status" className="mt-6 text-sm font-mono text-teal-200 bg-teal-950/50 border border-teal-800 rounded-lg px-4 py-2.5">
            Pipeline configured for {selected}
          </p>
        )}
      </div>
    </section>
  );
}

/* ============================================================================
   Pricing23 — Tier Cards with Usage Limits · Light-Warm (CellarCraft Inventory)
   ============================================================================ */
export function Pricing23() {
  const [selected, setSelected] = useState<string | null>(null);

  const plans = [
    {
      name: 'Tasting Room',
      price: '$65',
      skus: 'Up to 1,500 SKUs',
      warehouses: '1 storage cellar',
      sync: 'Hourly POS inventory sync',
      overage: '$12 per extra 500 SKUs',
      cta: 'Choose Tasting Room',
    },
    {
      name: 'Regional Distributor',
      price: '$190',
      skus: 'Up to 15,000 SKUs',
      warehouses: '5 bonded warehouses',
      sync: 'Real-time 60s webhook sync',
      overage: '$9 per extra 1,000 SKUs',
      cta: 'Choose Distributor',
    },
    {
      name: 'National Cellar',
      price: '$440',
      skus: 'Up to 100,000 SKUs',
      warehouses: '20 fulfillment hubs',
      sync: 'Sub-second EDI & ERP sync',
      overage: 'Custom volume discount',
      cta: 'Choose National',
    },
  ];

  return (
    <section aria-labelledby="p23-heading" className="bg-[#F7F3EB] py-16 px-6 sm:px-10 text-[#28221A]">
      <div className="mx-auto max-w-6xl">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#7A6549]">
            CellarCraft Supply Chain
          </p>
          <h2
            id="p23-heading"
            className="mt-2 text-3xl font-semibold [font-family:var(--font-serif)] [text-wrap:balance]"
          >
            Quota-based inventory tiers for beverage & pantry makers
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {plans.map((p) => (
            <div
              key={p.name}
              className="flex flex-col justify-between rounded-xl bg-[#FCFBF7] border border-[#DFD6C7] p-7"
            >
              <div>
                <h3 className="text-xl font-semibold [font-family:var(--font-serif)]">{p.name}</h3>
                <div className="mt-3 text-3xl font-semibold tabular-nums [font-family:var(--font-serif)]">
                  {p.price}
                  <span className="text-sm font-sans font-normal text-[#6C6051]"> / mo</span>
                </div>

                <ul className="mt-6 space-y-3 text-sm text-[#433A2E] border-t border-[#E6DFD2] pt-5">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 mt-0.5 shrink-0 text-[#7A6549]" />
                    <span className="tabular-nums">{p.skus}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 mt-0.5 shrink-0 text-[#7A6549]" />
                    <span>{p.warehouses}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 mt-0.5 shrink-0 text-[#7A6549]" />
                    <span>{p.sync}</span>
                  </li>
                </ul>

                <p className="mt-5 text-xs text-[#6C6051] bg-[#F3ECE0] rounded-md px-3 py-2">
                  Overage rate: {p.overage}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelected(`${p.name} (${p.price}/mo)`)}
                className="mt-6 w-full py-2.5 px-4 rounded-lg bg-[#28221A] text-[#FCFBF7] text-sm font-medium hover:bg-[#3E3529] transition-colors whitespace-nowrap"
              >
                {p.cta}
              </button>
            </div>
          ))}
        </div>

        {selected && (
          <p role="status" className="mt-6 text-sm text-[#28221A] bg-[#ECE4D6] rounded-lg px-4 py-2.5">
            Selected CellarCraft plan: <strong className="font-semibold">{selected}</strong>
          </p>
        )}
      </div>
    </section>
  );
}

/* ============================================================================
   Pricing24 — Tier Cards with Usage Limits · Bold / Colourful (MediaForge)
   ============================================================================ */
export function Pricing24() {
  const [selected, setSelected] = useState<string | null>(null);

  const cards = [
    {
      name: 'Creator',
      price: '$29',
      accent: 'bg-blue-600',
      mins: '1,200 4K mins / mo',
      storage: '500 GB hot CDN',
      jobs: '4 concurrent encodes',
      cta: 'Start Creator',
    },
    {
      name: 'Studio',
      price: '$99',
      accent: 'bg-orange-600',
      mins: '8,000 4K mins / mo',
      storage: '3 TB hot CDN',
      jobs: '16 concurrent encodes',
      cta: 'Start Studio',
    },
    {
      name: 'Broadcast',
      price: '$299',
      accent: 'bg-emerald-700',
      mins: '35,000 4K mins / mo',
      storage: '15 TB hot CDN',
      jobs: '64 concurrent encodes',
      cta: 'Start Broadcast',
    },
  ];

  return (
    <section aria-labelledby="p24-heading" className="bg-blue-50 py-16 px-6 sm:px-10 text-slate-950">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-xl">
          <p className="text-xs font-extrabold uppercase tracking-widest text-blue-700">
            MediaForge Video Pipeline
          </p>
          <h2 id="p24-heading" className="mt-2 text-3xl font-extrabold tracking-tight [text-wrap:balance]">
            Hard-capped transcode quotas with instant bursts
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {cards.map((c) => (
            <div
              key={c.name}
              className="flex flex-col justify-between rounded-xl bg-white border-2 border-slate-950 overflow-hidden"
            >
              <div>
                <div className={`${c.accent} text-white px-7 py-5 flex items-baseline justify-between`}>
                  <h3 className="text-xl font-extrabold">{c.name}</h3>
                  <span className="text-2xl font-extrabold tabular-nums">{c.price}/mo</span>
                </div>

                <div className="p-7 space-y-3 text-sm font-semibold">
                  <div className="flex justify-between py-2 border-b border-slate-200">
                    <span className="text-slate-600 font-medium">Encoding quota</span>
                    <span className="tabular-nums">{c.mins}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-200">
                    <span className="text-slate-600 font-medium">Edge storage</span>
                    <span className="tabular-nums">{c.storage}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-600 font-medium">Concurrency</span>
                    <span className="tabular-nums">{c.jobs}</span>
                  </div>
                </div>
              </div>

              <div className="px-7 pb-7">
                <button
                  type="button"
                  onClick={() => setSelected(`${c.name} (${c.price}/mo)`)}
                  className="w-full py-2.5 px-4 rounded-lg bg-slate-950 text-white text-sm font-bold hover:bg-slate-800 transition-colors whitespace-nowrap"
                >
                  {c.cta}
                </button>
              </div>
            </div>
          ))}
        </div>

        {selected && (
          <p role="status" className="mt-6 text-sm font-bold text-slate-950 bg-white border-2 border-slate-950 rounded-lg px-4 py-2.5">
            Pipeline selected: {selected}
          </p>
        )}
      </div>
    </section>
  );
}
