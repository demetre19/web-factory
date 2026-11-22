import React, { useState } from 'react';

/* -------------------------------------------------------------------------- */
/* Proof19: Editorial Broadsheet Press & Masthead Strip                       */
/* -------------------------------------------------------------------------- */
export function Proof19() {
  const publications = [
    {
      id: 'ledger',
      name: 'The Ledger Review',
      date: 'October 2026',
      excerpt:
        '“Quietly becoming the default verification layer for mid-market treasuries tired of reconciling mismatched batch exports every Friday.”',
      masthead: (
        <svg viewBox="0 0 154 28" className="h-6 w-auto" role="img" aria-label="The Ledger Review">
          <text x="0" y="21" fill="currentColor" fontSize="17" fontWeight="700" fontFamily="Fraunces, serif">
            The Ledger Review
          </text>
        </svg>
      ),
    },
    {
      id: 'meridian-tech',
      name: 'Meridian Tech',
      date: 'September 2026',
      excerpt:
        '“An unusually disciplined engineering product—zero sprawling dashboards, sub-50ms query guarantees, and documentation written like a textbook.”',
      masthead: (
        <svg viewBox="0 0 142 28" className="h-6 w-auto" role="img" aria-label="Meridian Tech">
          <rect x="0" y="7" width="10" height="14" fill="currentColor" />
          <text x="17" y="20" fill="currentColor" fontSize="15" fontWeight="700" fontFamily="Plus Jakarta Sans, sans-serif" letterSpacing="-0.02em">
            MERIDIAN TECH
          </text>
        </svg>
      ),
    },
    {
      id: 'financial-wire',
      name: 'Financial Wire',
      date: 'August 2026',
      excerpt:
        '“Across 40 interviewed CFOs, onboarding speed and deterministic audit logs ranked ahead of every legacy enterprise suite.”',
      masthead: (
        <svg viewBox="0 0 144 28" className="h-6 w-auto" role="img" aria-label="Financial Wire">
          <text x="0" y="20" fill="currentColor" fontSize="16" fontWeight="600" fontStyle="italic" fontFamily="Fraunces, serif">
            Financial Wire
          </text>
        </svg>
      ),
    },
    {
      id: 'european-dispatch',
      name: 'European Dispatch',
      date: 'July 2026',
      excerpt:
        '“Built with European data-residency primitives from day one rather than bolted on as an enterprise tier add-on.”',
      masthead: (
        <svg viewBox="0 0 166 28" className="h-6 w-auto" role="img" aria-label="European Dispatch">
          <circle cx="7" cy="14" r="5" stroke="currentColor" strokeWidth="1.8" fill="none" />
          <text x="18" y="20" fill="currentColor" fontSize="14.5" fontWeight="700" fontFamily="Plus Jakarta Sans, sans-serif">
            European Dispatch
          </text>
        </svg>
      ),
    },
  ] as const;

  const [selectedId, setSelectedId] = useState<string>(publications[0].id);
  const activePub = publications.find((p) => p.id === selectedId) ?? publications[0];

  return (
    <section aria-labelledby="proof19-heading" className="bg-[#FAF8F4] px-6 py-16 text-stone-900 sm:px-10">
      <div className="mx-auto max-w-5xl border-y border-stone-300 py-12">
        <div className="text-center">
          <h2 id="proof19-heading" className="text-xs font-semibold tracking-widest text-stone-500 uppercase">
            In the Press · Select a publication
          </h2>
          <blockquote className="mx-auto mt-6 max-w-3xl font-serif text-2xl leading-relaxed text-stone-900 sm:text-3xl text-balance">
            {activePub.excerpt}
          </blockquote>
          <p className="mt-4 text-xs font-medium text-stone-500">
            {activePub.name} · {activePub.date}
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 border-t border-stone-200 pt-8 sm:grid-cols-4">
          {publications.map((pub) => {
            const isSelected = pub.id === activePub.id;
            return (
              <button
                key={pub.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelectedId(pub.id)}
                className={`flex items-center justify-center rounded-lg border px-4 py-3 transition-colors ${
                  isSelected
                    ? 'border-stone-900 bg-white text-stone-950'
                    : 'border-transparent text-stone-400 hover:border-stone-300 hover:text-stone-700'
                }`}
              >
                {pub.masthead}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Proof20: Dark Monochrome Featured-In Press Strip                           */
/* -------------------------------------------------------------------------- */
export function Proof20() {
  const pressItems = [
    {
      name: 'Systems Quarterly',
      headline: '“Sets a crisp benchmark for deterministic infrastructure tooling.”',
      logo: (
        <svg viewBox="0 0 156 26" className="h-5 w-auto" role="img" aria-label="Systems Quarterly">
          <rect x="0" y="5" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" />
          <line x1="4" y1="12" x2="10" y2="12" stroke="currentColor" strokeWidth="2" />
          <text x="22" y="17" fill="currentColor" fontSize="13.5" fontWeight="700" fontFamily="Plus Jakarta Sans, sans-serif">
            Systems Quarterly
          </text>
        </svg>
      ),
    },
    {
      name: 'Cloud Chronicle',
      headline: '“Zero-downtime cluster migrations that actually hold under peak traffic.”',
      logo: (
        <svg viewBox="0 0 144 26" className="h-5 w-auto" role="img" aria-label="Cloud Chronicle">
          <path d="M5 17A5 5 0 0 1 8 8A6 6 0 0 1 19 11A4 4 0 0 1 18 19H6Z" fill="currentColor" />
          <text x="26" y="17" fill="currentColor" fontSize="13.5" fontWeight="600" fontFamily="Plus Jakarta Sans, sans-serif">
            Cloud Chronicle
          </text>
        </svg>
      ),
    },
    {
      name: 'Capital Post',
      headline: '“Why regulated fintechs are replacing custom reconciliation pipelines.”',
      logo: (
        <svg viewBox="0 0 128 26" className="h-5 w-auto" role="img" aria-label="Capital Post">
          <text x="0" y="18" fill="currentColor" fontSize="15.5" fontWeight="700" fontFamily="Fraunces, serif">
            Capital Post
          </text>
        </svg>
      ),
    },
    {
      name: 'Nordic Tech',
      headline: '“Adopted by 60% of Stockholm’s fastest-growing B2B SaaS engineering orgs.”',
      logo: (
        <svg viewBox="0 0 128 26" className="h-5 w-auto" role="img" aria-label="Nordic Tech">
          <polygon points="8,4 16,18 0,18" fill="currentColor" />
          <text x="23" y="17" fill="currentColor" fontSize="13.5" fontWeight="700" fontFamily="Plus Jakarta Sans, sans-serif" letterSpacing="0.02em">
            NORDIC TECH
          </text>
        </svg>
      ),
    },
  ];

  return (
    <section aria-labelledby="proof20-heading" className="bg-[#0A0C10] px-6 py-16 text-neutral-100 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <h2 id="proof20-heading" className="text-xs font-semibold tracking-widest text-neutral-400 uppercase">
            Featured In
          </h2>
          <p className="text-xs text-neutral-500">Independent technology & business coverage</p>
        </div>

        <ul className="grid grid-cols-1 divide-y divide-neutral-800 border-y border-neutral-800 sm:grid-cols-2 sm:divide-x lg:grid-cols-4 lg:divide-y-0">
          {pressItems.map((item) => (
            <li key={item.name} className="flex flex-col justify-between gap-4 px-5 py-7">
              <div className="text-neutral-200">{item.logo}</div>
              <p className="text-xs leading-relaxed text-neutral-400">{item.headline}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
