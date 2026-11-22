import React, { useState } from 'react';

/* -------------------------------------------------------------------------- */
/* Proof10: Minimal Aggregate Rating Summary Block (Stars + Count + Bars)     */
/* -------------------------------------------------------------------------- */
export function Proof10() {
  const tiers = [
    { stars: 5, count: 2386, percentage: 84 },
    { stars: 4, count: 341, percentage: 12 },
    { stars: 3, count: 71, percentage: 3 },
    { stars: 2, count: 28, percentage: 1 },
    { stars: 1, count: 14, percentage: 0 },
  ];

  return (
    <section aria-labelledby="proof10-heading" className="bg-white px-6 py-16 text-neutral-900 sm:px-10">
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-10 rounded-2xl border border-neutral-200 bg-neutral-50/60 p-8 sm:p-10 md:grid-cols-12 md:items-center">
        <div className="md:col-span-5">
          <h2 id="proof10-heading" className="text-sm font-semibold text-neutral-600">
            Verified Customer Rating
          </h2>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-5xl font-bold tracking-tight text-neutral-950 tabular-nums">
              4.8
            </span>
            <span className="text-base font-medium text-neutral-500 tabular-nums">/ 5.0</span>
          </div>

          <div className="mt-3 flex items-center gap-1" aria-label="4.8 out of 5 stars">
            {[0, 1, 2, 3, 4].map((index) => (
              <svg key={index} viewBox="0 0 20 20" className="h-5 w-5 text-amber-500" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M10 1.5l2.58 5.22 5.76.84-4.17 4.06.98 5.74L10 14.65l-5.15 2.71.98-5.74-4.17-4.06 5.76-.84L10 1.5z"
                />
              </svg>
            ))}
          </div>

          <p className="mt-3 text-sm text-neutral-600 tabular-nums">
            Based on <span className="font-semibold text-neutral-900">2,840</span> audited workspace reviews
          </p>
        </div>

        <div className="space-y-3 md:col-span-7">
          {tiers.map((tier) => (
            <div key={tier.stars} className="grid grid-cols-12 items-center gap-3">
              <span className="col-span-2 text-xs font-medium text-neutral-700 tabular-nums">
                {tier.stars} stars
              </span>
              <div
                className="col-span-7 h-2.5 overflow-hidden rounded-full bg-neutral-200"
                role="progressbar"
                aria-label={`${tier.stars} star rating share`}
                aria-valuenow={tier.percentage}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full rounded-full bg-neutral-900"
                  style={{ width: `${tier.percentage}%` }}
                />
              </div>
              <span className="col-span-3 text-right font-mono text-xs text-neutral-600 tabular-nums">
                {tier.percentage}% ({tier.count.toLocaleString()})
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Proof11: Dark Multi-Axis Rating Scorecard                                  */
/* -------------------------------------------------------------------------- */
export function Proof11() {
  const axes = [
    {
      key: 'overall',
      label: 'Overall',
      score: '4.9',
      reviews: 1920,
      bars: [
        { stars: 5, pct: 88, count: 1690 },
        { stars: 4, pct: 9, count: 173 },
        { stars: 3, pct: 2, count: 38 },
        { stars: 2, pct: 1, count: 13 },
        { stars: 1, pct: 0, count: 6 },
      ],
    },
    {
      key: 'reliability',
      label: 'Reliability',
      score: '4.9',
      reviews: 1410,
      bars: [
        { stars: 5, pct: 91, count: 1283 },
        { stars: 4, pct: 7, count: 99 },
        { stars: 3, pct: 1, count: 14 },
        { stars: 2, pct: 1, count: 10 },
        { stars: 1, pct: 0, count: 4 },
      ],
    },
    {
      key: 'support',
      label: 'Support',
      score: '4.8',
      reviews: 980,
      bars: [
        { stars: 5, pct: 84, count: 823 },
        { stars: 4, pct: 12, count: 118 },
        { stars: 3, pct: 3, count: 29 },
        { stars: 2, pct: 1, count: 7 },
        { stars: 1, pct: 0, count: 3 },
      ],
    },
  ] as const;

  const [activeKey, setActiveKey] = useState<'overall' | 'reliability' | 'support'>('overall');
  const current = axes.find((a) => a.key === activeKey) ?? axes[0];

  return (
    <section aria-labelledby="proof11-heading" className="bg-[#0F1115] px-6 py-16 text-neutral-100 sm:px-10">
      <div className="mx-auto max-w-5xl rounded-2xl border border-neutral-800 bg-[#151921] p-8 sm:p-10">
        <div className="flex flex-col justify-between gap-4 border-b border-neutral-800 pb-6 sm:flex-row sm:items-center">
          <div>
            <h2 id="proof11-heading" className="text-xl font-semibold tracking-tight text-white">
              Customer Satisfaction Breakdown
            </h2>
            <p className="mt-1 text-xs text-neutral-400">
              Filter verified ratings by evaluation dimension
            </p>
          </div>
          <div className="inline-flex rounded-lg bg-neutral-900 p-1" role="tablist" aria-label="Rating dimensions">
            {axes.map((axis) => (
              <button
                key={axis.key}
                type="button"
                role="tab"
                aria-selected={activeKey === axis.key}
                onClick={() => setActiveKey(axis.key)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  activeKey === axis.key
                    ? 'bg-neutral-100 text-neutral-950'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {axis.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-12 md:items-center">
          <div className="md:col-span-4">
            <div className="font-mono text-5xl font-bold text-white tabular-nums">{current.score}</div>
            <div className="mt-3 flex items-center gap-1" aria-label={`${current.score} out of 5 stars`}>
              {[0, 1, 2, 3, 4].map((idx) => (
                <svg key={idx} viewBox="0 0 20 20" className="h-4 w-4 text-emerald-400" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M10 1.5l2.58 5.22 5.76.84-4.17 4.06.98 5.74L10 14.65l-5.15 2.71.98-5.74-4.17-4.06 5.76-.84L10 1.5z"
                  />
                </svg>
              ))}
            </div>
            <p className="mt-2 text-xs text-neutral-400 tabular-nums">
              {current.reviews.toLocaleString()} verified {current.label.toLowerCase()} ratings
            </p>
          </div>

          <div className="space-y-3 md:col-span-8">
            {current.bars.map((bar) => (
              <div key={bar.stars} className="grid grid-cols-12 items-center gap-3">
                <span className="col-span-2 font-mono text-xs text-neutral-300 tabular-nums">
                  {bar.stars} ★
                </span>
                <div
                  className="col-span-8 h-2 overflow-hidden rounded-full bg-neutral-800"
                  role="progressbar"
                  aria-label={`${bar.stars} stars`}
                  aria-valuenow={bar.pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="h-full rounded-full bg-emerald-400 transition-all duration-200"
                    style={{ width: `${bar.pct}%` }}
                  />
                </div>
                <span className="col-span-2 text-right font-mono text-xs text-neutral-400 tabular-nums">
                  {bar.pct}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Proof12: Minimal Review Cards with Source Badges                           */
/* -------------------------------------------------------------------------- */
export function Proof12() {
  const reviews = [
    {
      sourceName: 'G2 Crowd',
      sourceDate: 'Oct 14, 2026',
      rating: 5,
      quote:
        'Migrating from legacy ETL scripts took two afternoons. Schema validation errors now surface before deployment.',
      reviewer: 'Jonas Lindner',
      title: 'Data Platform Lead',
      sourceIcon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <circle cx="12" cy="12" r="11" fill="#FF492C" />
          <text x="12" y="15.5" textAnchor="middle" fill="#FFFFFF" fontSize="9.5" fontWeight="700" fontFamily="Plus Jakarta Sans, sans-serif">
            G2
          </text>
        </svg>
      ),
      avatar: (
        <svg viewBox="0 0 36 36" className="h-9 w-9 shrink-0 rounded-full" aria-hidden="true">
          <rect width="36" height="36" fill="#E5E7EB" />
          <path d="M8 36C8 27 12.5 23 18 23C23.5 23 28 27 28 36Z" fill="#374151" />
          <circle cx="18" cy="14" r="6" fill="#F1C7A8" />
          <path d="M12 13C12 8.5 15 6 18 6C21 6 24 8.5 24 13C22 10.5 14 10.5 12 13Z" fill="#1F2937" />
        </svg>
      ),
    },
    {
      sourceName: 'Trustpilot',
      sourceDate: 'Oct 02, 2026',
      rating: 5,
      quote:
        'Support engineers answered our BGP routing question in twelve minutes with an exact Terraform diff.',
      reviewer: 'Rachelle Moreau',
      title: 'VP Engineering',
      sourceIcon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <rect width="24" height="24" rx="4" fill="#00B67A" />
          <path
            fill="#FFFFFF"
            d="M12 4.5l2.1 4.6 5 .6-3.7 3.5.9 5L12 15.8l-4.3 2.4.9-5-3.7-3.5 5-.6L12 4.5z"
          />
        </svg>
      ),
      avatar: (
        <svg viewBox="0 0 36 36" className="h-9 w-9 shrink-0 rounded-full" aria-hidden="true">
          <rect width="36" height="36" fill="#E5E7EB" />
          <path d="M8 36C8 27 12.5 23 18 23C23.5 23 28 27 28 36Z" fill="#0F766E" />
          <circle cx="18" cy="14" r="6" fill="#EBBF9E" />
          <path d="M11 16C11 9 14 6 18 6C22 6 25 9 25 16L23 20H13Z" fill="#78350F" />
        </svg>
      ),
    },
    {
      sourceName: 'Capterra',
      sourceDate: 'Sep 24, 2026',
      rating: 5,
      quote:
        'Forecast accuracy jumped from 74% to 94% once finance and ops shared the exact same live event stream.',
      reviewer: 'Kenji Takahashi',
      title: 'Head of Revenue Ops',
      sourceIcon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <polygon points="4,4 20,10 11,14" fill="#FF9D28" />
          <polygon points="11,14 20,10 15,21" fill="#044D80" />
          <polygon points="4,4 11,14 7,19" fill="#68C5ED" />
        </svg>
      ),
      avatar: (
        <svg viewBox="0 0 36 36" className="h-9 w-9 shrink-0 rounded-full" aria-hidden="true">
          <rect width="36" height="36" fill="#E5E7EB" />
          <path d="M8 36C8 27 12.5 23 18 23C23.5 23 28 27 28 36Z" fill="#1E3A8A" />
          <circle cx="18" cy="14" r="6" fill="#F2CEB0" />
          <path d="M12 13C12 8.5 14.5 6 18 6C21.5 6 24 8.5 24 13C21 10 15 10 12 13Z" fill="#111827" />
        </svg>
      ),
    },
  ];

  return (
    <section aria-labelledby="proof12-heading" className="bg-white px-6 py-16 text-neutral-900 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <h2 id="proof12-heading" className="text-2xl font-semibold tracking-tight text-neutral-950">
            Independent reviews across software directories
          </h2>
          <p className="text-xs text-neutral-500">Unedited third-party buyer verification</p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {reviews.map((rev) => (
            <article
              key={rev.reviewer}
              className="flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-6"
            >
              <div>
                <div className="flex items-center justify-between gap-2 border-b border-neutral-100 pb-4">
                  <div className="flex items-center gap-2">
                    {rev.sourceIcon}
                    <span className="text-xs font-semibold text-neutral-900">{rev.sourceName}</span>
                  </div>
                  <span className="text-xs text-neutral-500 tabular-nums">{rev.sourceDate}</span>
                </div>

                <div className="mt-4 flex items-center gap-1" aria-label={`${rev.rating} out of 5 stars`}>
                  {[0, 1, 2, 3, 4].map((s) => (
                    <svg key={s} viewBox="0 0 16 16" className="h-4 w-4 text-amber-500" aria-hidden="true">
                      <path
                        fill="currentColor"
                        d="M8 1.3l2.06 4.17 4.6.67-3.33 3.25.79 4.58L8 11.8l-4.12 2.17.79-4.58L1.34 6.14l4.6-.67L8 1.3z"
                      />
                    </svg>
                  ))}
                </div>

                <p className="mt-3 text-sm leading-relaxed text-neutral-700">“{rev.quote}”</p>
              </div>

              <footer className="mt-6 flex items-center gap-3 pt-2">
                {rev.avatar}
                <div>
                  <div className="text-sm font-semibold text-neutral-900">{rev.reviewer}</div>
                  <div className="text-xs text-neutral-500">{rev.title}</div>
                </div>
              </footer>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Proof13: Colourful Vivid Social & App Store Reviews                        */
/* -------------------------------------------------------------------------- */
export function Proof13() {
  const reviews = [
    {
      platform: 'Product Hunt',
      handle: 'Maker review · #1 Product of the Day',
      accent: 'border-orange-200 bg-orange-50/70',
      badge: (
        <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
          <circle cx="12" cy="12" r="11" fill="#DA552F" />
          <path d="M9 7h4.2a3.3 3.3 0 0 1 0 6.6H11V17H9V7zm2 2v2.6h2.2a1.3 1.3 0 0 0 0-2.6H11z" fill="#FFFFFF" />
        </svg>
      ),
      quote:
        'Cleanest keyboard-first workflow I have seen this year. Command palette handles 90% of triage without touching a mouse.',
      author: 'Lucas Ferreira',
      role: 'Founder, Studio Vesper',
      avatarBg: '#FED7AA',
      shirt: '#C2410C',
      skin: '#E0AA83',
      hair: '#1C1917',
    },
    {
      platform: 'App Store',
      handle: '5.0 ★ · Verified Pro subscriber',
      accent: 'border-sky-200 bg-sky-50/70',
      badge: (
        <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
          <rect width="24" height="24" rx="6" fill="#0284C7" />
          <path d="M12 5L7 17M12 5l5 12M8.5 14h7" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
      quote:
        'Offline sync on flights actually works cleanly. I annotate quarterly briefs on my iPad and changes merge instantly at landing.',
      author: 'Maya Kapoor',
      role: 'Partner, Horizon Ventures',
      avatarBg: '#BAE6FD',
      shirt: '#0369A1',
      skin: '#AD724C',
      hair: '#111827',
    },
    {
      platform: 'Trustpilot',
      handle: '4.9 ★ · Verified team plan',
      accent: 'border-emerald-200 bg-emerald-50/70',
      badge: (
        <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
          <rect width="24" height="24" rx="6" fill="#059669" />
          <path
            fill="#FFFFFF"
            d="M12 4.8l1.9 4.2 4.6.6-3.4 3.2.8 4.6-3.9-2.2-3.9 2.2.8-4.6-3.4-3.2 4.6-.6L12 4.8z"
          />
        </svg>
      ),
      quote:
        'Billing transparency is refreshing—no surprise per-seat overages when contractors join for a two-week sprint.',
      author: 'Toby Gallagher',
      role: 'Operations Director, Driftwood',
      avatarBg: '#A7F3D0',
      shirt: '#047857',
      skin: '#F3D1B6',
      hair: '#92400E',
    },
  ];

  return (
    <section aria-labelledby="proof13-heading" className="bg-[#F5F3FF] px-6 py-16 text-slate-900 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 max-w-2xl">
          <h2 id="proof13-heading" className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Community & store reviews in the wild
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Real buyer sentiment across launch platforms, mobile stores, and verified review portals.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {reviews.map((item) => (
            <article
              key={item.author}
              className={`flex flex-col justify-between rounded-2xl border p-6 ${item.accent}`}
            >
              <div>
                <div className="flex items-center gap-3">
                  {item.badge}
                  <div>
                    <div className="text-sm font-bold text-slate-950">{item.platform}</div>
                    <div className="text-xs text-slate-600 tabular-nums">{item.handle}</div>
                  </div>
                </div>

                <p className="mt-5 text-sm leading-relaxed text-slate-800">“{item.quote}”</p>
              </div>

              <footer className="mt-6 flex items-center gap-3 border-t border-slate-900/10 pt-4">
                <svg viewBox="0 0 38 38" className="h-9 w-9 shrink-0 rounded-full" aria-hidden="true">
                  <rect width="38" height="38" fill={item.avatarBg} />
                  <path d="M8 38C8 29 13 25 19 25C25 25 30 29 30 38Z" fill={item.shirt} />
                  <circle cx="19" cy="15" r="6.5" fill={item.skin} />
                  <path d="M12.5 14C12.5 9 15.5 6.5 19 6.5C22.5 6.5 25.5 9 25.5 14C23 11 15 11 12.5 14Z" fill={item.hair} />
                </svg>
                <div>
                  <div className="text-sm font-semibold text-slate-950">{item.author}</div>
                  <div className="text-xs text-slate-600">{item.role}</div>
                </div>
              </footer>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Proof14: Dark Developer & Enterprise Review Feed                           */
/* -------------------------------------------------------------------------- */
export function Proof14() {
  const reviews = [
    {
      source: 'GitHub Sponsors',
      meta: 'Verified Org · 2026-10-18',
      author: 'Soren Lindqvist',
      role: 'Staff Systems Engineer · Oxide Works',
      quote:
        'Zero runtime reflection, clean tree-shaking, and deterministic build hashes. Cut our CI bundle check by 44 seconds per PR.',
      sourceSvg: (
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" aria-hidden="true">
          <path
            fill="currentColor"
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 2C6.48 2 2 6.59 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.09.68-.22.68-.49 0-.24-.01-.88-.01-1.73-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.55-1.14-4.55-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.3 9.3 0 0 1 12 6.96c.85 0 1.71.12 2.51.35 1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.48-.01 2.81 0 .27.18.59.69.49A10.27 10.27 0 0 0 22 12.25C22 6.59 17.52 2 12 2z"
          />
        </svg>
      ),
      avatarColor: '#38BDF8',
    },
    {
      source: 'G2 Enterprise',
      meta: '5.0 ★ · 2026-09-29',
      author: 'Fatima Zahra',
      role: 'Director of Cloud Security · FinBridge',
      quote:
        'SOC 2 Type II audit logs stream straight to our SIEM with immutable sequence numbers. Security sign-off took three days.',
      sourceSvg: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <circle cx="12" cy="12" r="10.5" fill="#FF492C" />
          <text x="12" y="15.5" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="700" fontFamily="Plus Jakarta Sans, sans-serif">
            G2
          </text>
        </svg>
      ),
      avatarColor: '#34D399',
    },
    {
      source: 'PeerSpot',
      meta: 'Verified Architect · 2026-09-11',
      author: 'Daniel Park',
      role: 'Principal Infrastructure Architect · CoreRail',
      quote:
        'Multi-region active-active failover worked out of the box during our chaos engineering week without manual DNS flips.',
      sourceSvg: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <rect x="2" y="2" width="20" height="20" rx="5" fill="#6366F1" />
          <circle cx="9" cy="12" r="2.5" fill="#FFFFFF" />
          <circle cx="15.5" cy="9" r="2" fill="#C7D2FE" />
          <circle cx="15.5" cy="15" r="2" fill="#C7D2FE" />
        </svg>
      ),
      avatarColor: '#A78BFA',
    },
  ];

  return (
    <section aria-labelledby="proof14-heading" className="bg-[#0D1017] px-6 py-16 text-slate-100 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <h2 id="proof14-heading" className="text-2xl font-semibold tracking-tight text-white">
            Verified technical reviews
          </h2>
          <p className="font-mono text-xs text-slate-400 tabular-nums">
            3 independent engineering portals
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {reviews.map((rev) => (
            <article
              key={rev.author}
              className="flex flex-col justify-between rounded-xl border border-slate-800 bg-[#141923] p-6"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    {rev.sourceSvg}
                    <span className="text-xs font-semibold text-white">{rev.source}</span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-400 tabular-nums">
                    {rev.meta}
                  </span>
                </div>

                <p className="mt-5 text-sm leading-relaxed text-slate-300">“{rev.quote}”</p>
              </div>

              <footer className="mt-6 flex items-center gap-3 border-t border-slate-800 pt-4">
                <svg viewBox="0 0 36 36" className="h-9 w-9 shrink-0 rounded-full" aria-hidden="true">
                  <rect width="36" height="36" fill="#1E293B" />
                  <path d="M8 36C8 27 12.5 23 18 23C23.5 23 28 27 28 36Z" fill={rev.avatarColor} />
                  <circle cx="18" cy="14" r="5.8" fill="#E6C2A5" />
                  <path d="M12.2 13C12.2 8.5 15 6 18 6C21 6 23.8 8.5 23.8 13C21 10.5 15 10.5 12.2 13Z" fill="#0F172A" />
                </svg>
                <div>
                  <div className="text-sm font-semibold text-white">{rev.author}</div>
                  <div className="text-xs text-slate-400">{rev.role}</div>
                </div>
              </footer>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
