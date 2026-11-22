import { useState } from 'react';

/* ============================================================================
   Pricing9 — Comparison-Table Style · Minimal / Professional (ClearGrid HRIS)
   ============================================================================ */
export function Pricing9() {
  const [selected, setSelected] = useState<string | null>(null);

  const rows = [
    { feature: 'Active employee profiles', values: ['Up to 25', 'Up to 250', 'Unlimited'] },
    { feature: 'Onboarding checklists', values: ['3 templates', 'Unlimited', 'Custom API triggers'] },
    { feature: 'Time-off & PTO tracking', values: ['Included', 'Multi-policy accruals', 'Global holiday packs'] },
    { feature: 'Performance review cycles', values: ['Annual only', 'Quarterly & 360', 'Custom competency matrices'] },
    { feature: 'SSO & SCIM provisioning', values: ['—', 'Google & Okta', 'All SAML 2.0 + Audit API'] },
    { feature: 'Payroll export connectors', values: ['CSV export', 'Gusto, Rippling, Xero', 'NetSuite & SAP custom'] },
    { feature: 'Support SLA', values: ['Email (24h)', 'Priority chat (4h)', 'Dedicated HRIS specialist'] },
  ];

  const cols = [
    { name: 'Core', price: '$6', unit: 'per employee / mo', cta: 'Start Core' },
    { name: 'Growth', price: '$11', unit: 'per employee / mo', cta: 'Start Growth', featured: true },
    { name: 'Enterprise', price: '$18', unit: 'per employee / mo', cta: 'Request Quote' },
  ];

  return (
    <section aria-labelledby="p9-heading" className="bg-white py-16 px-6 sm:px-10 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            ClearGrid People Operations
          </p>
          <h2
            id="p9-heading"
            className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 [text-wrap:balance]"
          >
            Compare every HR capability side by side
          </h2>
        </div>

        <div className="mt-10 overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full min-w-[680px] text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70">
                <th scope="col" className="py-5 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 w-[30%]">
                  Capability
                </th>
                {cols.map((col) => (
                  <th
                    key={col.name}
                    scope="col"
                    className={`py-5 px-6 align-top w-[23.3%] ${
                      col.featured ? 'bg-slate-900 text-white' : 'text-slate-900'
                    }`}
                  >
                    <div className="text-base font-semibold">{col.name}</div>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="text-2xl font-bold tabular-nums">{col.price}</span>
                      <span className={`text-xs font-normal ${col.featured ? 'text-slate-300' : 'text-slate-500'}`}>
                        {col.unit}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {rows.map((row) => (
                <tr key={row.feature} className="hover:bg-slate-50/70 transition-colors">
                  <th scope="row" className="py-3.5 px-6 font-medium text-slate-800">
                    {row.feature}
                  </th>
                  {row.values.map((val, idx) => (
                    <td
                      key={`${row.feature}-${idx}`}
                      className={`py-3.5 px-6 tabular-nums ${
                        idx === 1 ? 'bg-slate-50 font-medium text-slate-900' : 'text-slate-600'
                      }`}
                    >
                      {val}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="bg-slate-50/40">
                <td className="py-5 px-6 text-xs text-slate-500">All plans include 14-day full access</td>
                {cols.map((col) => (
                  <td key={col.name} className="py-5 px-6">
                    <button
                      type="button"
                      onClick={() => setSelected(`${col.name} (${col.price} ${col.unit})`)}
                      className={`w-full py-2 px-3 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                        col.featured
                          ? 'bg-slate-900 text-white hover:bg-slate-800'
                          : 'bg-white border border-slate-300 text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      {col.cta}
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {selected && (
          <p role="status" className="mt-5 text-sm text-slate-700 bg-slate-100 rounded-lg px-4 py-2.5">
            Selected ClearGrid tier: <strong className="font-semibold">{selected}</strong>
          </p>
        )}
      </div>
    </section>
  );
}

/* ============================================================================
   Pricing10 — Comparison-Table Style · Dark (StrataDB Serverless)
   ============================================================================ */
export function Pricing10() {
  const [selected, setSelected] = useState<string | null>(null);

  const specs = [
    { metric: 'Included Storage', cols: ['5 GB', '100 GB', '1 TB', 'Custom NVMe'] },
    { metric: 'Compute Units', cols: ['Shared 0.25 vCPU', 'Up to 4 vCPU', 'Auto-scale 16 vCPU', 'Dedicated cluster'] },
    { metric: 'Read Replicas', cols: ['0', '2 regional', '8 global', 'Unlimited'] },
    { metric: 'Point-in-time Recovery', cols: ['24 hours', '14 days', '35 days', '90 days'] },
    { metric: 'PrivateLink / VPC Peering', cols: ['—', '—', 'Included', 'Multi-region'] },
    { metric: 'Uptime SLA', cols: ['Best effort', '99.9%', '99.95%', '99.995%'] },
  ];

  const plans = [
    { name: 'Hobby', price: '$0', cta: 'Create Free DB' },
    { name: 'Pro', price: '$35', cta: 'Upgrade to Pro', accent: true },
    { name: 'Scale', price: '$240', cta: 'Deploy Scale' },
    { name: 'Dedicated', price: '$890', cta: 'Talk to Infra' },
  ];

  return (
    <section aria-labelledby="p10-heading" className="bg-[#090D16] py-16 px-6 sm:px-10 text-slate-100">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-cyan-400">
              StrataDB Serverless Postgres
            </p>
            <h2
              id="p10-heading"
              className="mt-2 text-3xl font-semibold tracking-tight text-white [text-wrap:balance]"
            >
              Technical specification & throughput matrix
            </h2>
          </div>
          <p className="text-xs font-mono text-slate-400">All rates in USD / month</p>
        </div>

        <div className="mt-8 overflow-x-auto border border-slate-800 rounded-xl bg-[#0E1422]">
          <table className="w-full min-w-[740px] text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800">
                <th scope="col" className="py-5 px-5 text-xs font-mono uppercase tracking-wider text-slate-400">
                  Resource Quota
                </th>
                {plans.map((p) => (
                  <th
                    key={p.name}
                    scope="col"
                    className={`py-5 px-5 ${p.accent ? 'bg-cyan-950/40' : ''}`}
                  >
                    <div className="text-sm font-semibold text-white">{p.name}</div>
                    <div className="mt-1 text-2xl font-mono font-bold text-cyan-300 tabular-nums">
                      {p.price}
                      <span className="text-xs font-normal text-slate-400">/mo</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-sm">
              {specs.map((row) => (
                <tr key={row.metric}>
                  <th scope="row" className="py-3.5 px-5 font-medium text-slate-300">
                    {row.metric}
                  </th>
                  {row.cols.map((cell, idx) => (
                    <td
                      key={`${row.metric}-${idx}`}
                      className={`py-3.5 px-5 font-mono text-xs tabular-nums ${
                        idx === 1 ? 'bg-cyan-950/20 text-white' : 'text-slate-300'
                      }`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <td className="py-5 px-5" />
                {plans.map((p) => (
                  <td key={p.name} className={`py-5 px-5 ${p.accent ? 'bg-cyan-950/20' : ''}`}>
                    <button
                      type="button"
                      onClick={() => setSelected(`${p.name} (${p.price}/mo)`)}
                      className={`w-full py-2 px-3 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                        p.accent
                          ? 'bg-cyan-400 text-slate-950 hover:bg-cyan-300'
                          : 'bg-slate-800 text-slate-100 hover:bg-slate-700'
                      }`}
                    >
                      {p.cta}
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {selected && (
          <p
            role="status"
            className="mt-5 text-sm font-mono text-cyan-200 bg-cyan-950/40 border border-cyan-800 rounded-lg px-4 py-2.5"
          >
            Cluster profile selected: {selected}
          </p>
        )}
      </div>
    </section>
  );
}

/* ============================================================================
   Pricing11 — Comparison-Table Style · Light-Warm (Archival Museum CMS)
   ============================================================================ */
export function Pricing11() {
  const [selected, setSelected] = useState<string | null>(null);

  const items = [
    { label: 'Cataloged artifacts', tiers: ['5,000 objects', '50,000 objects', '500,000+ objects'] },
    { label: 'IIIF high-res zoom tiles', tiers: ['Up to 50 GB', 'Up to 1 TB', 'Multi-TB cold vault'] },
    { label: 'Curatorial seats', tiers: ['3 editors', '15 editors', 'Unlimited departments'] },
    { label: 'Public exhibition microsites', tiers: ['2 live', '12 live', 'Unlimited'] },
    { label: 'Dublin Core & MARC21 export', tiers: ['Included', 'Included + OAI-PMH', 'Custom schema sync'] },
  ];

  const editions = [
    { name: 'Gallery', rate: '$95', cta: 'Select Gallery' },
    { name: 'Museum', rate: '$290', cta: 'Select Museum' },
    { name: 'Institution', rate: '$740', cta: 'Request Endowment Rate' },
  ];

  return (
    <section aria-labelledby="p11-heading" className="bg-[#FBF9F5] py-16 px-6 sm:px-10 text-[#28231D]">
      <div className="mx-auto max-w-5xl">
        <div className="pb-6 border-b border-[#DED7CB]">
          <p className="text-xs uppercase tracking-widest text-[#7E7365]">
            Archival Collection Registry
          </p>
          <h2
            id="p11-heading"
            className="mt-2 text-3xl font-semibold [font-family:var(--font-serif)] [text-wrap:balance]"
          >
            Institutional catalog editions & preservation limits
          </h2>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-[#28231D]">
                <th scope="col" className="py-4 pr-4 text-xs font-semibold uppercase tracking-wider text-[#6D6356]">
                  Archive Specification
                </th>
                {editions.map((ed) => (
                  <th key={ed.name} scope="col" className="py-4 px-4">
                    <div className="text-lg font-semibold [font-family:var(--font-serif)]">{ed.name}</div>
                    <div className="text-sm font-medium text-[#6D6356] tabular-nums">{ed.rate} / month</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4DDD1] text-sm">
              {items.map((row) => (
                <tr key={row.label}>
                  <th scope="row" className="py-4 pr-4 font-medium text-[#28231D]">
                    {row.label}
                  </th>
                  {row.tiers.map((val, i) => (
                    <td key={`${row.label}-${i}`} className="py-4 px-4 text-[#52493E] tabular-nums">
                      {val}
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <td className="py-5 pr-4 text-xs text-[#7E7365]">501(c)(3) non-profits receive 15% grant credit</td>
                {editions.map((ed) => (
                  <td key={ed.name} className="py-5 px-4">
                    <button
                      type="button"
                      onClick={() => setSelected(`${ed.name} (${ed.rate}/mo)`)}
                      className="px-4 py-2 rounded-md border border-[#28231D] text-xs font-semibold hover:bg-[#28231D] hover:text-[#FBF9F5] transition-colors whitespace-nowrap"
                    >
                      {ed.cta}
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {selected && (
          <p role="status" className="mt-5 text-sm text-[#28231D] bg-[#EFE9DF] rounded-lg px-4 py-2.5">
            Inquiry drafted for: <strong className="font-semibold">{selected}</strong>
          </p>
        )}
      </div>
    </section>
  );
}

/* ============================================================================
   Pricing12 — Comparison-Table Style · Bold / Colourful (SprintBoard PM)
   ============================================================================ */
export function Pricing12() {
  const [selected, setSelected] = useState<string | null>(null);

  const matrix = [
    { feature: 'Active roadmaps & sprints', cols: ['2 boards', 'Unlimited', 'Unlimited'] },
    { feature: 'Automations / month', cols: ['250 runs', '10,000 runs', '250,000 runs'] },
    { feature: 'GitHub & Linear two-way sync', cols: ['Read-only', 'Full two-way', 'Multi-org enterprise'] },
    { feature: 'Capacity & velocity charts', cols: ['Basic burndown', 'Full forecasting', 'Portfolio rollups'] },
    { feature: 'Guest client seats', cols: ['3 free', '25 free', 'Unlimited'] },
  ];

  const headers = [
    { name: 'Team', price: '$14', sub: 'per user / mo', btn: 'Try Team', featured: false },
    { name: 'Velocity', price: '$26', sub: 'per user / mo', btn: 'Try Velocity', featured: true },
    { name: 'Portfolio', price: '$45', sub: 'per user / mo', btn: 'Book Demo', featured: false },
  ];

  return (
    <section aria-labelledby="p12-heading" className="bg-sky-50 py-16 px-6 sm:px-10 text-slate-950">
      <div className="mx-auto max-w-5xl">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-700">
            SprintBoard Delivery Suite
          </p>
          <h2
            id="p12-heading"
            className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight [text-wrap:balance]"
          >
            Every workflow limit clearly laid out
          </h2>
        </div>

        <div className="mt-10 overflow-x-auto rounded-xl border-2 border-slate-950 bg-white">
          <table className="w-full min-w-[660px] text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-950">
                <th scope="col" className="p-6 text-sm font-bold text-slate-900 bg-slate-100 w-[34%]">
                  Feature Breakdown
                </th>
                {headers.map((h) => (
                  <th
                    key={h.name}
                    scope="col"
                    className={`p-6 w-[22%] ${
                      h.featured ? 'bg-blue-700 text-white' : 'bg-white text-slate-950'
                    }`}
                  >
                    <div className="text-lg font-extrabold">{h.name}</div>
                    <div className="mt-1 text-2xl font-extrabold tabular-nums">{h.price}</div>
                    <div className={`text-xs ${h.featured ? 'text-blue-100' : 'text-slate-500'}`}>
                      {h.sub}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {matrix.map((row) => (
                <tr key={row.feature}>
                  <th scope="row" className="py-4 px-6 font-semibold text-slate-900">
                    {row.feature}
                  </th>
                  {row.cols.map((cell, idx) => (
                    <td
                      key={`${row.feature}-${idx}`}
                      className={`py-4 px-6 font-medium tabular-nums ${
                        idx === 1 ? 'bg-blue-50/70 text-blue-950 font-semibold' : 'text-slate-700'
                      }`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="bg-slate-50">
                <td className="p-5 text-xs font-medium text-slate-600">Free 21-day pilot · No card</td>
                {headers.map((h) => (
                  <td key={h.name} className={`p-5 ${h.featured ? 'bg-blue-50/70' : ''}`}>
                    <button
                      type="button"
                      onClick={() => setSelected(`${h.name} (${h.price} ${h.sub})`)}
                      className={`w-full py-2.5 px-3 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                        h.featured
                          ? 'bg-blue-700 text-white hover:bg-blue-800'
                          : 'bg-slate-950 text-white hover:bg-slate-800'
                      }`}
                    >
                      {h.btn}
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {selected && (
          <p role="status" className="mt-5 text-sm font-semibold text-blue-950 bg-blue-100 rounded-lg px-4 py-2.5">
            Pilot started for: {selected}
          </p>
        )}
      </div>
    </section>
  );
}
