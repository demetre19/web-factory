import React, { useState } from 'react';

/* -------------------------------------------------------------------------- */
/* Proof1: Minimal 2-Row Architectural Logo Cloud                             */
/* -------------------------------------------------------------------------- */
export function Proof1() {
  const rowOne = [
    {
      name: 'Northstar',
      mark: (
        <svg viewBox="0 0 132 32" className="h-7 w-auto" role="img" aria-label="Northstar">
          <path d="M14 4L17 13L26 16L17 19L14 28L11 19L2 16L11 13Z" fill="currentColor" />
          <text x="34" y="21" fill="currentColor" fontSize="15" fontWeight="700" fontFamily="Plus Jakarta Sans, sans-serif" letterSpacing="-0.02em">
            Northstar
          </text>
        </svg>
      ),
    },
    {
      name: 'Kestrel',
      mark: (
        <svg viewBox="0 0 120 32" className="h-7 w-auto" role="img" aria-label="Kestrel">
          <path d="M4 24L12 7H22L14 16L23 24H14L9 19L4 24Z" fill="currentColor" />
          <text x="32" y="21" fill="currentColor" fontSize="15" fontWeight="600" fontFamily="Plus Jakarta Sans, sans-serif" letterSpacing="0.01em">
            Kestrel
          </text>
        </svg>
      ),
    },
    {
      name: 'Foundry',
      mark: (
        <svg viewBox="0 0 124 32" className="h-7 w-auto" role="img" aria-label="Foundry">
          <rect x="4" y="6" width="18" height="4" fill="currentColor" />
          <rect x="4" y="14" width="13" height="4" fill="currentColor" />
          <rect x="4" y="22" width="7" height="4" fill="currentColor" />
          <text x="30" y="21" fill="currentColor" fontSize="15" fontWeight="700" fontFamily="Plus Jakarta Sans, sans-serif" letterSpacing="-0.02em">
            Foundry
          </text>
        </svg>
      ),
    },
    {
      name: 'Meridian',
      mark: (
        <svg viewBox="0 0 130 32" className="h-7 w-auto" role="img" aria-label="Meridian">
          <circle cx="14" cy="16" r="9.5" stroke="currentColor" strokeWidth="2.2" fill="none" />
          <path d="M4.5 16H23.5M14 6.5C17 10 17 22 14 25.5" stroke="currentColor" strokeWidth="1.8" fill="none" />
          <text x="32" y="21" fill="currentColor" fontSize="15" fontWeight="600" fontFamily="Plus Jakarta Sans, sans-serif">
            Meridian
          </text>
        </svg>
      ),
    },
    {
      name: 'Halcyon',
      mark: (
        <svg viewBox="0 0 124 32" className="h-7 w-auto" role="img" aria-label="Halcyon">
          <path d="M5 9V23M19 9V23M5 16H19" stroke="currentColor" strokeWidth="2.8" strokeLinecap="square" />
          <circle cx="12" cy="16" r="2.2" fill="currentColor" />
          <text x="29" y="21" fill="currentColor" fontSize="15" fontWeight="600" fontFamily="Plus Jakarta Sans, sans-serif">
            Halcyon
          </text>
        </svg>
      ),
    },
  ];

  const rowTwo = [
    {
      name: 'Clearview',
      mark: (
        <svg viewBox="0 0 132 32" className="h-7 w-auto" role="img" aria-label="Clearview">
          <polygon points="14,5 25,16 14,27 3,16" stroke="currentColor" strokeWidth="2.2" fill="none" />
          <circle cx="14" cy="16" r="3.5" fill="currentColor" />
          <text x="33" y="21" fill="currentColor" fontSize="15" fontWeight="600" fontFamily="Plus Jakarta Sans, sans-serif">
            Clearview
          </text>
        </svg>
      ),
    },
    {
      name: 'Harborline',
      mark: (
        <svg viewBox="0 0 138 32" className="h-7 w-auto" role="img" aria-label="Harborline">
          <path d="M4 21C8 14 14 14 18 21C20 17 23 16 25 18" stroke="currentColor" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <path d="M4 11H24" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          <text x="33" y="21" fill="currentColor" fontSize="15" fontWeight="700" fontFamily="Plus Jakarta Sans, sans-serif" letterSpacing="-0.02em">
            Harborline
          </text>
        </svg>
      ),
    },
    {
      name: 'Bedrock',
      mark: (
        <svg viewBox="0 0 124 32" className="h-7 w-auto" role="img" aria-label="Bedrock">
          <path d="M4 24L10 9L16 18L20 13L26 24H4Z" fill="currentColor" />
          <text x="33" y="21" fill="currentColor" fontSize="15" fontWeight="700" fontFamily="Plus Jakarta Sans, sans-serif">
            Bedrock
          </text>
        </svg>
      ),
    },
    {
      name: 'Lattice',
      mark: (
        <svg viewBox="0 0 118 32" className="h-7 w-auto" role="img" aria-label="Lattice">
          <path d="M5 7H14V16H5ZM14 16H23V25H14Z" fill="currentColor" />
          <rect x="14" y="7" width="9" height="9" stroke="currentColor" strokeWidth="1.8" fill="none" />
          <text x="31" y="21" fill="currentColor" fontSize="15" fontWeight="600" fontFamily="Plus Jakarta Sans, sans-serif">
            Lattice
          </text>
        </svg>
      ),
    },
    {
      name: 'Timberline',
      mark: (
        <svg viewBox="0 0 138 32" className="h-7 w-auto" role="img" aria-label="Timberline">
          <path d="M14 5L23 19H5L14 5Z" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M14 12V27" stroke="currentColor" strokeWidth="2.2" />
          <text x="31" y="21" fill="currentColor" fontSize="15" fontWeight="600" fontFamily="Plus Jakarta Sans, sans-serif">
            Timberline
          </text>
        </svg>
      ),
    },
  ];

  return (
    <section aria-labelledby="proof1-heading" className="bg-white px-6 py-16 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <h2
            id="proof1-heading"
            className="text-lg font-semibold tracking-tight text-neutral-900 text-balance"
          >
            Trusted by engineering and finance teams across 1,400+ companies
          </h2>
          <p className="text-xs font-medium text-neutral-500 tabular-nums">
            Verified enterprise deployments · Q3 2026
          </p>
        </div>

        <div className="border-y border-neutral-200">
          <ul className="grid grid-cols-2 divide-y divide-neutral-200 sm:grid-cols-5 sm:divide-x sm:divide-y-0">
            {rowOne.map((brand) => (
              <li
                key={brand.name}
                className="flex items-center justify-center px-4 py-7 text-neutral-500 transition-colors duration-200 hover:text-neutral-950"
              >
                {brand.mark}
              </li>
            ))}
          </ul>
          <ul className="grid grid-cols-2 divide-y divide-neutral-200 border-t border-neutral-200 sm:grid-cols-5 sm:divide-x sm:divide-y-0">
            {rowTwo.map((brand) => (
              <li
                key={brand.name}
                className="flex items-center justify-center px-4 py-7 text-neutral-500 transition-colors duration-200 hover:text-neutral-950"
              >
                {brand.mark}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Proof2: Dark Marquee-Style Continuous Dual Logo Strip                      */
/* -------------------------------------------------------------------------- */
export function Proof2() {
  const [paused, setPaused] = useState(false);

  const trackLogos = [
    {
      id: 'arcadia',
      label: 'Arcadia',
      svg: (
        <svg viewBox="0 0 132 32" className="h-7 w-auto" role="img" aria-label="Arcadia">
          <path d="M14 5L24 25H19L14 14L9 25H4L14 5Z" fill="currentColor" />
          <text x="32" y="21" fill="currentColor" fontSize="15" fontWeight="600" fontFamily="Plus Jakarta Sans, sans-serif">
            Arcadia
          </text>
        </svg>
      ),
    },
    {
      id: 'signal',
      label: 'SignalGrid',
      svg: (
        <svg viewBox="0 0 144 32" className="h-7 w-auto" role="img" aria-label="SignalGrid">
          <rect x="4" y="18" width="4" height="7" fill="currentColor" />
          <rect x="11" y="12" width="4" height="13" fill="currentColor" />
          <rect x="18" y="6" width="4" height="19" fill="currentColor" />
          <text x="30" y="21" fill="currentColor" fontSize="15" fontWeight="700" fontFamily="Plus Jakarta Sans, sans-serif">
            SignalGrid
          </text>
        </svg>
      ),
    },
    {
      id: 'vergepoint',
      label: 'Vergepoint',
      svg: (
        <svg viewBox="0 0 146 32" className="h-7 w-auto" role="img" aria-label="Vergepoint">
          <circle cx="13" cy="16" r="8" stroke="currentColor" strokeWidth="2.2" fill="none" />
          <circle cx="18" cy="16" r="3" fill="currentColor" />
          <text x="30" y="21" fill="currentColor" fontSize="15" fontWeight="600" fontFamily="Plus Jakarta Sans, sans-serif">
            Vergepoint
          </text>
        </svg>
      ),
    },
    {
      id: 'oakridge',
      label: 'Oakridge',
      svg: (
        <svg viewBox="0 0 136 32" className="h-7 w-auto" role="img" aria-label="Oakridge">
          <path d="M4 22L11 8L18 22M11 16L17 8L24 22" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinejoin="round" />
          <text x="32" y="21" fill="currentColor" fontSize="15" fontWeight="600" fontFamily="Plus Jakarta Sans, sans-serif">
            Oakridge
          </text>
        </svg>
      ),
    },
    {
      id: 'monolith',
      label: 'Monolith',
      svg: (
        <svg viewBox="0 0 138 32" className="h-7 w-auto" role="img" aria-label="Monolith">
          <rect x="5" y="6" width="7" height="20" fill="currentColor" />
          <rect x="15" y="10" width="7" height="16" fill="currentColor" opacity="0.55" />
          <text x="31" y="21" fill="currentColor" fontSize="15" fontWeight="700" fontFamily="Plus Jakarta Sans, sans-serif">
            Monolith
          </text>
        </svg>
      ),
    },
    {
      id: 'stratum',
      label: 'Stratum',
      svg: (
        <svg viewBox="0 0 132 32" className="h-7 w-auto" role="img" aria-label="Stratum">
          <path d="M4 10H22L18 14H4V10ZM8 18H24L20 22H8V18Z" fill="currentColor" />
          <text x="32" y="21" fill="currentColor" fontSize="15" fontWeight="600" fontFamily="Plus Jakarta Sans, sans-serif">
            Stratum
          </text>
        </svg>
      ),
    },
  ];

  return (
    <section
      aria-labelledby="proof2-heading"
      className={`relative overflow-hidden bg-[#0B0D11] py-16 text-neutral-100 ${paused ? 'marquee-paused' : ''}`}
    >
      <div className="mx-auto mb-10 flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 sm:px-10">
        <div>
          <h2 id="proof2-heading" className="text-xl font-semibold tracking-tight text-white">
            Powering production pipelines worldwide
          </h2>
          <p className="mt-1 text-sm text-neutral-400">
            Selected infrastructure teams running on zero-downtime clusters
          </p>
        </div>
        <button
          type="button"
          onClick={() => setPaused((prev) => !prev)}
          aria-pressed={paused}
          className="rounded-lg border border-neutral-700 bg-neutral-900 px-3.5 py-2 text-xs font-medium text-neutral-200 transition-colors hover:border-neutral-500 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white whitespace-nowrap shrink-0"
        >
          {paused ? 'Resume marquee' : 'Pause marquee'}
        </button>
      </div>

      <div className="relative space-y-5">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-[#0B0D11] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-[#0B0D11] to-transparent" />

        <div className="flex overflow-hidden hover:[&>*]:[animation-play-state:paused]">
          <ul className="animate-proof-marquee-left flex shrink-0 items-center gap-6 pr-6">
            {[...trackLogos, ...trackLogos].map((item, idx) => (
              <li
                key={`r1-${item.id}-${idx}`}
                className="flex h-16 min-w-[200px] items-center justify-center rounded-lg border border-neutral-800/90 bg-neutral-900/60 px-6 text-neutral-300 transition-colors hover:border-neutral-600 hover:text-white"
              >
                {item.svg}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex overflow-hidden hover:[&>*]:[animation-play-state:paused]">
          <ul className="animate-proof-marquee-right flex shrink-0 items-center gap-6 pr-6">
            {[...trackLogos.slice().reverse(), ...trackLogos.slice().reverse()].map((item, idx) => (
              <li
                key={`r2-${item.id}-${idx}`}
                className="flex h-16 min-w-[200px] items-center justify-center rounded-lg border border-neutral-800/90 bg-neutral-900/60 px-6 text-neutral-400 transition-colors hover:border-neutral-600 hover:text-white"
              >
                {item.svg}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Proof3: Colourful Asymmetric 4x2 Partner & Scale Grid                      */
/* -------------------------------------------------------------------------- */
export function Proof3() {
  const partners = [
    {
      name: 'Cobalt Labs',
      detail: '420 seats · London',
      accentBg: 'bg-blue-600',
      svg: (
        <svg viewBox="0 0 132 32" className="h-7 w-auto" role="img" aria-label="Cobalt Labs">
          <polygon points="14,5 23,10 23,22 14,27 5,22 5,10" fill="#2563EB" />
          <circle cx="14" cy="16" r="3.5" fill="#FFFFFF" />
          <text x="31" y="21" fill="#0F172A" fontSize="14.5" fontWeight="700" fontFamily="Plus Jakarta Sans, sans-serif">
            Cobalt Labs
          </text>
        </svg>
      ),
    },
    {
      name: 'Sunstone',
      detail: '190 seats · Austin',
      accentBg: 'bg-amber-500',
      svg: (
        <svg viewBox="0 0 128 32" className="h-7 w-auto" role="img" aria-label="Sunstone">
          <circle cx="14" cy="16" r="8" fill="#F59E0B" />
          <circle cx="14" cy="16" r="3" fill="#FFFBEB" />
          <text x="30" y="21" fill="#0F172A" fontSize="14.5" fontWeight="700" fontFamily="Plus Jakarta Sans, sans-serif">
            Sunstone
          </text>
        </svg>
      ),
    },
    {
      name: 'Fernwood',
      detail: '310 seats · Toronto',
      accentBg: 'bg-emerald-600',
      svg: (
        <svg viewBox="0 0 130 32" className="h-7 w-auto" role="img" aria-label="Fernwood">
          <path d="M5 24C5 14 12 7 22 7C22 17 15 24 5 24Z" fill="#059669" />
          <text x="30" y="21" fill="#0F172A" fontSize="14.5" fontWeight="700" fontFamily="Plus Jakarta Sans, sans-serif">
            Fernwood
          </text>
        </svg>
      ),
    },
    {
      name: 'CoralPay',
      detail: '640 seats · Berlin',
      accentBg: 'bg-rose-600',
      svg: (
        <svg viewBox="0 0 126 32" className="h-7 w-auto" role="img" aria-label="CoralPay">
          <rect x="4" y="7" width="18" height="18" rx="5" fill="#E11D48" />
          <path d="M9 16H17M13 12V20" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
          <text x="30" y="21" fill="#0F172A" fontSize="14.5" fontWeight="700" fontFamily="Plus Jakarta Sans, sans-serif">
            CoralPay
          </text>
        </svg>
      ),
    },
    {
      name: 'Verve Bio',
      detail: '280 seats · Zurich',
      accentBg: 'bg-violet-600',
      svg: (
        <svg viewBox="0 0 126 32" className="h-7 w-auto" role="img" aria-label="Verve Bio">
          <path d="M5 8L13 24L21 8" stroke="#7C3AED" strokeWidth="3.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <text x="29" y="21" fill="#0F172A" fontSize="14.5" fontWeight="700" fontFamily="Plus Jakarta Sans, sans-serif">
            Verve Bio
          </text>
        </svg>
      ),
    },
    {
      name: 'Cyanic',
      detail: '510 seats · Tokyo',
      accentBg: 'bg-cyan-600',
      svg: (
        <svg viewBox="0 0 116 32" className="h-7 w-auto" role="img" aria-label="Cyanic">
          <path d="M21 10A8 8 0 1 0 21 22" stroke="#0891B2" strokeWidth="3.2" fill="none" strokeLinecap="round" />
          <text x="29" y="21" fill="#0F172A" fontSize="14.5" fontWeight="700" fontFamily="Plus Jakarta Sans, sans-serif">
            Cyanic
          </text>
        </svg>
      ),
    },
    {
      name: 'Ochre',
      detail: '150 seats · Oslo',
      accentBg: 'bg-orange-600',
      svg: (
        <svg viewBox="0 0 116 32" className="h-7 w-auto" role="img" aria-label="Ochre">
          <rect x="5" y="7" width="16" height="16" rx="2" transform="rotate(12 13 15)" fill="#EA580C" />
          <text x="30" y="21" fill="#0F172A" fontSize="14.5" fontWeight="700" fontFamily="Plus Jakarta Sans, sans-serif">
            Ochre
          </text>
        </svg>
      ),
    },
    {
      name: 'Indigo Rail',
      detail: '890 seats · Chicago',
      accentBg: 'bg-indigo-700',
      svg: (
        <svg viewBox="0 0 136 32" className="h-7 w-auto" role="img" aria-label="Indigo Rail">
          <path d="M4 11H22M4 21H22" stroke="#4338CA" strokeWidth="3" strokeLinecap="round" />
          <circle cx="13" cy="16" r="2.5" fill="#4338CA" />
          <text x="30" y="21" fill="#0F172A" fontSize="14.5" fontWeight="700" fontFamily="Plus Jakarta Sans, sans-serif">
            Indigo Rail
          </text>
        </svg>
      ),
    },
  ];

  return (
    <section aria-labelledby="proof3-heading" className="bg-[#EEF2FF] px-6 py-16 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 max-w-2xl">
          <h2
            id="proof3-heading"
            className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl text-balance"
          >
            Built with product organizations across four continents
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Active team deployments verified through annual enterprise seat audits.
          </p>
        </div>

        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {partners.map((partner) => (
            <li
              key={partner.name}
              className="group flex flex-col justify-between rounded-xl border border-indigo-200/80 bg-white p-5 transition-transform duration-200 hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between gap-3">
                {partner.svg}
                <span className={`mt-1 h-2 w-2 rounded-sm ${partner.accentBg}`} aria-hidden="true" />
              </div>
              <p className="mt-6 text-xs font-medium text-slate-500 tabular-nums">{partner.detail}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
