import React, { useState } from 'react';

/* -------------------------------------------------------------------------- */
/* Proof15: Minimal 3-Column Case-Study Teaser Cards                          */
/* -------------------------------------------------------------------------- */
export function Proof15() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const studies = [
    {
      id: 'kestrel',
      company: 'Kestrel Logistics',
      industry: 'Freight Routing · 620 Staff',
      metric: '+142% Dispatch Velocity',
      summary:
        'Consolidated 14 regional dispatch queues into a unified live event ledger across 19 European hubs.',
      detail:
        'Before migration, regional dispatchers reconciled carrier manifests manually every afternoon. Within 90 days of rollout, automated exception routing cut idle yard dwell time by 37% and saved 410 analyst hours monthly.',
      logo: (
        <svg viewBox="0 0 120 26" className="h-5 w-auto text-neutral-900" role="img" aria-label="Kestrel Logistics">
          <path d="M2 20L9 5H17L10 13L18 20H11L7 16L2 20Z" fill="currentColor" />
          <text x="24" y="17" fill="currentColor" fontSize="13.5" fontWeight="700" fontFamily="Plus Jakarta Sans, sans-serif">
            Kestrel
          </text>
        </svg>
      ),
      chart: (
        <svg viewBox="0 0 280 96" className="h-24 w-full" aria-hidden="true">
          <rect width="280" height="96" rx="8" fill="#F5F5F4" />
          <path d="M20 74L75 64L130 56L185 34L248 20" stroke="#171717" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <circle cx="185" cy="34" r="4" fill="#171717" />
          <circle cx="248" cy="20" r="4" fill="#059669" />
          <line x1="20" y1="74" x2="260" y2="74" stroke="#D6D3D1" strokeWidth="1" />
        </svg>
      ),
    },
    {
      id: 'northstar',
      company: 'Northstar Cloud',
      industry: 'Cloud Infrastructure · 1,100 Staff',
      metric: '54% Lower Cold-Start Latency',
      summary:
        'Rebuilt regional worker provisioning with deterministic snapshot warming across 12 edge zones.',
      detail:
        'Container cold starts previously spiked past 820ms during North American morning traffic. Snapshot pre-hydration stabilized P99 launch time at 375ms across all production tenants.',
      logo: (
        <svg viewBox="0 0 128 26" className="h-5 w-auto text-neutral-900" role="img" aria-label="Northstar Cloud">
          <path d="M11 3L13.5 10.5L21 13L13.5 15.5L11 23L8.5 15.5L1 13L8.5 10.5Z" fill="currentColor" />
          <text x="27" y="17" fill="currentColor" fontSize="13.5" fontWeight="700" fontFamily="Plus Jakarta Sans, sans-serif">
            Northstar
          </text>
        </svg>
      ),
      chart: (
        <svg viewBox="0 0 280 96" className="h-24 w-full" aria-hidden="true">
          <rect width="280" height="96" rx="8" fill="#F5F5F4" />
          <rect x="34" y="24" width="32" height="50" rx="4" fill="#D6D3D1" />
          <rect x="82" y="34" width="32" height="40" rx="4" fill="#A8A29E" />
          <rect x="130" y="46" width="32" height="28" rx="4" fill="#57534E" />
          <rect x="178" y="54" width="32" height="20" rx="4" fill="#171717" />
          <rect x="226" y="58" width="32" height="16" rx="4" fill="#0284C7" />
        </svg>
      ),
    },
    {
      id: 'clearview',
      company: 'Clearview Ledger',
      industry: 'Fintech Compliance · 340 Staff',
      metric: '3.4x Faster Audit Sign-Off',
      summary:
        'Automated cryptographic change trails across treasury approvals and quarterly external audits.',
      detail:
        'External auditors previously sampled spreadsheets over three weeks each quarter. Signed immutable policy logs reduced fieldwork to four business days with zero findings.',
      logo: (
        <svg viewBox="0 0 130 26" className="h-5 w-auto text-neutral-900" role="img" aria-label="Clearview Ledger">
          <polygon points="11,4 19,13 11,22 3,13" stroke="currentColor" strokeWidth="2" fill="none" />
          <circle cx="11" cy="13" r="2.8" fill="currentColor" />
          <text x="26" y="17" fill="currentColor" fontSize="13.5" fontWeight="700" fontFamily="Plus Jakarta Sans, sans-serif">
            Clearview
          </text>
        </svg>
      ),
      chart: (
        <svg viewBox="0 0 280 96" className="h-24 w-full" aria-hidden="true">
          <rect width="280" height="96" rx="8" fill="#F5F5F4" />
          <circle cx="88" cy="48" r="24" stroke="#D6D3D1" strokeWidth="8" fill="none" />
          <circle cx="88" cy="48" r="24" stroke="#171717" strokeWidth="8" strokeDasharray="112 151" fill="none" transform="rotate(-90 88 48)" />
          <rect x="142" y="34" width="96" height="8" rx="4" fill="#171717" />
          <rect x="142" y="52" width="68" height="8" rx="4" fill="#A8A29E" />
        </svg>
      ),
    },
  ];

  return (
    <section aria-labelledby="proof15-heading" className="bg-white px-6 py-16 text-neutral-900 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="proof15-heading" className="text-2xl font-semibold tracking-tight text-neutral-950">
              Verified Customer Case Studies
            </h2>
            <p className="mt-1 text-sm text-neutral-600">
              Audited before-and-after outcomes across logistics, infrastructure, and finance.
            </p>
          </div>
          <p className="text-xs font-medium text-neutral-500">Select a brief to inspect rollout details</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {studies.map((study) => {
            const isOpen = expandedId === study.id;
            return (
              <article
                key={study.id}
                className="flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-6"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    {study.logo}
                  </div>
                  <p className="mt-2 text-xs text-neutral-500">{study.industry}</p>
                  <div className="mt-4">{study.chart}</div>
                  <h3 className="mt-5 text-lg font-bold tracking-tight text-neutral-950 tabular-nums">
                    {study.metric}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600">{study.summary}</p>
                  {isOpen && (
                    <p className="mt-3 border-t border-neutral-100 pt-3 text-xs leading-relaxed text-neutral-700">
                      {study.detail}
                    </p>
                  )}
                </div>

                <div className="mt-6 border-t border-neutral-100 pt-4">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setExpandedId(isOpen ? null : study.id)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-900 underline-offset-4 hover:underline whitespace-nowrap shrink-0"
                  >
                    {isOpen ? 'Hide rollout brief' : 'Read rollout brief'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Proof16: Editorial Asymmetric Case-Study Folio                             */
/* -------------------------------------------------------------------------- */
export function Proof16() {
  return (
    <section aria-labelledby="proof16-heading" className="bg-[#FAF8F4] px-6 py-16 text-stone-900 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="border-b border-stone-300 pb-6">
          <p className="text-xs font-medium tracking-widest text-stone-500 uppercase">
            Field Monographs · 2026 Edition
          </p>
          <h2 id="proof16-heading" className="mt-2 font-serif text-3xl font-normal tracking-tight text-stone-900 sm:text-4xl">
            How high-compliance teams modernize core workflows
          </h2>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
          <article className="flex flex-col justify-between border border-stone-300 bg-[#FBF9F5] p-8 lg:col-span-7">
            <div>
              <div className="flex items-center justify-between gap-4 border-b border-stone-200 pb-4">
                <svg viewBox="0 0 136 26" className="h-5 w-auto text-stone-900" role="img" aria-label="Albion Maritime">
                  <circle cx="12" cy="13" r="8" stroke="currentColor" strokeWidth="2" fill="none" />
                  <path d="M4 13H20M12 5V21" stroke="currentColor" strokeWidth="1.6" />
                  <text x="27" y="17" fill="currentColor" fontSize="13" fontWeight="600" fontFamily="Fraunces, serif">
                    Albion Maritime
                  </text>
                </svg>
                <span className="text-xs text-stone-500 tabular-nums">Monograph No. 14 · 6 min read</span>
              </div>

              <h3 className="mt-6 font-serif text-2xl leading-snug font-normal text-stone-900 sm:text-3xl text-balance">
                Cutting port customs clearance variance by 61% across 28 container terminals
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-stone-600">
                Albion Maritime replaced batch EDI polling with deterministic event streams, giving port agents and treasury controllers shared real-time visibility into vessel manifests.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4 border-t border-stone-200 pt-6">
              <div>
                <div className="font-serif text-2xl font-semibold text-stone-900 tabular-nums">61%</div>
                <div className="mt-1 text-xs text-stone-500">Less customs delay</div>
              </div>
              <div>
                <div className="font-serif text-2xl font-semibold text-stone-900 tabular-nums">28</div>
                <div className="mt-1 text-xs text-stone-500">Terminals unified</div>
              </div>
              <div>
                <div className="font-serif text-2xl font-semibold text-stone-900 tabular-nums">11 wks</div>
                <div className="mt-1 text-xs text-stone-500">Full rollout time</div>
              </div>
            </div>
          </article>

          <div className="flex flex-col gap-6 lg:col-span-5">
            <article className="flex flex-1 flex-col justify-between border border-stone-300 bg-white p-7">
              <div>
                <p className="text-xs text-stone-500">Timberline Bio · Biotechnology</p>
                <h3 className="mt-2 font-serif text-xl leading-snug text-stone-900">
                  48-hour clinical trial batch reconciliation compressed to 22 minutes
                </h3>
                <p className="mt-3 text-xs leading-relaxed text-stone-600">
                  Automated lineage checks eliminated manual lab-to-ERP transcription across 14 European assay labs.
                </p>
              </div>
              <p className="mt-5 font-mono text-xs font-medium text-stone-800 tabular-nums">
                99.94% validation pass rate · Q2 2026
              </p>
            </article>

            <article className="flex flex-1 flex-col justify-between border border-stone-300 bg-white p-7">
              <div>
                <p className="text-xs text-stone-500">Halcyon Grid · Energy Storage</p>
                <h3 className="mt-2 font-serif text-xl leading-snug text-stone-900">
                  $2.1M annual balancing savings through sub-second telemetry dispatch
                </h3>
                <p className="mt-3 text-xs leading-relaxed text-stone-600">
                  Battery operators respond to grid frequency dips within 180ms across 420 distributed substations.
                </p>
              </div>
              <p className="mt-5 font-mono text-xs font-medium text-stone-800 tabular-nums">
                180ms median dispatch · 420 sites
              </p>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Proof17: Minimal 4-Number Tabular Stats Band                               */
/* -------------------------------------------------------------------------- */
export function Proof17() {
  const stats = [
    {
      value: '99.98%',
      label: 'Multi-region uptime SLA',
      context: 'Measured trailing 24 months',
    },
    {
      value: '42ms',
      label: 'Median global API response',
      context: 'Across 18 edge PoPs',
    },
    {
      value: '1,420+',
      label: 'Active enterprise workspaces',
      context: 'Audited Q3 2026 count',
    },
    {
      value: '$3.2B',
      label: 'Annual volume reconciled',
      context: 'Zero unlogged ledger drift',
    },
  ];

  return (
    <section aria-labelledby="proof17-heading" className="bg-[#F8F8F6] px-6 py-16 text-neutral-900 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
          <h2 id="proof17-heading" className="text-base font-semibold tracking-tight text-neutral-900">
            Production Scale at a Glance
          </h2>
          <p className="text-xs text-neutral-500">Verified platform telemetry · 2024–2026</p>
        </div>

        <dl className="grid grid-cols-1 divide-y divide-neutral-200 border-y border-neutral-200 bg-white sm:grid-cols-2 sm:divide-x lg:grid-cols-4 lg:divide-y-0">
          {stats.map((stat) => (
            <div key={stat.label} className="px-6 py-8">
              <dd className="font-mono text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl tabular-nums">
                {stat.value}
              </dd>
              <dt className="mt-2 text-sm font-medium text-neutral-800">{stat.label}</dt>
              <p className="mt-1 text-xs text-neutral-500">{stat.context}</p>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Proof18: Colourful Royal Cobalt 4-Number Impact Strip                      */
/* -------------------------------------------------------------------------- */
export function Proof18() {
  const metrics = [
    {
      number: '4.9/5',
      title: 'Customer Satisfaction',
      detail: '2,840 verified ratings',
    },
    {
      number: '18 min',
      title: 'Median Onboarding',
      detail: 'From signup to first stream',
    },
    {
      number: '3.6x',
      title: 'Faster Audit Close',
      detail: 'Across Fortune 1000 teams',
    },
    {
      number: '100%',
      title: 'SOC 2 Type II Coverage',
      detail: 'Continuous automated checks',
    },
  ];

  return (
    <section aria-labelledby="proof18-heading" className="bg-[#1E3A8A] px-6 py-16 text-white sm:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <h2 id="proof18-heading" className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Proven numbers from live customer deployments
          </h2>
          <p className="text-xs font-medium text-sky-200">Updated quarterly from production telemetry</p>
        </div>

        <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((m, idx) => (
            <div
              key={m.title}
              className="rounded-xl border border-blue-700/80 bg-blue-900/60 p-6"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-sky-300 tabular-nums">0{idx + 1}</span>
                <svg viewBox="0 0 18 18" className="h-4 w-4 text-sky-300" aria-hidden="true">
                  <rect x="2" y="2" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="1.8" fill="none" />
                  <circle cx="9" cy="9" r="2.5" fill="currentColor" />
                </svg>
              </div>
              <dd className="mt-5 font-mono text-4xl font-bold tracking-tight text-white tabular-nums">
                {m.number}
              </dd>
              <dt className="mt-2 text-sm font-semibold text-sky-100">{m.title}</dt>
              <p className="mt-1 text-xs text-blue-200">{m.detail}</p>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
