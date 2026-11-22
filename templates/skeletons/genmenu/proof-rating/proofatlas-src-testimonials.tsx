import React from 'react';

/* -------------------------------------------------------------------------- */
/* Proof4: Editorial 2-Column Broadsheet Testimonial Grid                     */
/* -------------------------------------------------------------------------- */
export function Proof4() {
  const testimonials = [
    {
      quote:
        'Before migrating our settlement ledger, monthly reconciliation took four analysts nearly five full days. Today our finance close completes before noon on the first business day, with every exception traced to its source event.',
      name: 'Clara Lindholm',
      role: 'Chief Financial Officer',
      company: 'Kestrel Freight Group',
      outcome: 'Close cycle reduced from 5 days to 4 hours',
      avatar: (
        <svg viewBox="0 0 48 48" className="h-12 w-12 shrink-0 rounded-full" aria-hidden="true">
          <rect width="48" height="48" fill="#E7E2D8" />
          <path d="M12 48C12 37 17 32 24 32C31 32 36 37 36 48Z" fill="#292524" />
          <circle cx="24" cy="20" r="9" fill="#F2D0B6" />
          <path d="M14 21C14 13 18 9 24 9C30 9 34 13 34 21C32 16 28 14 24 14C20 14 16 16 14 21Z" fill="#44403C" />
          <circle cx="21" cy="20" r="1.1" fill="#1C1917" />
          <circle cx="27" cy="20" r="1.1" fill="#1C1917" />
          <path d="M22 24C23 25 25 25 26 24" stroke="#9A3412" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      quote:
        'Our clinical data engineers needed strict schema auditability without slowing down model releases. Adopting this workflow cut staging regressions by 68% in the first quarter while giving compliance reviewers a clear paper trail.',
      name: 'Tariq Al-Mansoor',
      role: 'VP of Platform Engineering',
      company: 'Meridian Health Systems',
      outcome: '68% fewer staging regressions in Q1',
      avatar: (
        <svg viewBox="0 0 48 48" className="h-12 w-12 shrink-0 rounded-full" aria-hidden="true">
          <rect width="48" height="48" fill="#DFDDD5" />
          <path d="M11 48C11 36.5 16.5 31 24 31C31.5 31 37 36.5 37 48Z" fill="#1E3A8A" />
          <circle cx="24" cy="20" r="9" fill="#C68B59" />
          <path d="M15 18C15 11.5 19 8 24 8C29 8 33 11.5 33 18C30 14 18 14 15 18Z" fill="#1C1917" />
          <rect x="18" y="18" width="5" height="3.5" rx="1" stroke="#1C1917" strokeWidth="1.2" fill="none" />
          <rect x="25" y="18" width="5" height="3.5" rx="1" stroke="#1C1917" strokeWidth="1.2" fill="none" />
          <line x1="23" y1="19.5" x2="25" y2="19.5" stroke="#1C1917" strokeWidth="1.2" />
        </svg>
      ),
    },
  ];

  return (
    <section aria-labelledby="proof4-heading" className="bg-[#FAF8F4] px-6 py-16 text-stone-900 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="border-b border-stone-300 pb-6">
          <p className="text-xs font-medium tracking-widest text-stone-500 uppercase">
            Customer Perspectives
          </p>
          <h2
            id="proof4-heading"
            className="mt-2 font-serif text-3xl font-normal tracking-tight text-stone-900 sm:text-4xl text-balance"
          >
            Measured operational calm across finance and engineering
          </h2>
        </div>

        <div className="grid grid-cols-1 divide-y divide-stone-300 md:grid-cols-2 md:divide-x md:divide-y-0">
          {testimonials.map((item) => (
            <figure key={item.name} className="flex flex-col justify-between py-8 md:px-8 first:md:pl-0 last:md:pr-0">
              <div>
                <p className="text-xs font-medium text-stone-500">{item.outcome}</p>
                <blockquote className="mt-4 font-serif text-xl leading-relaxed text-stone-800">
                  “{item.quote}”
                </blockquote>
              </div>
              <figcaption className="mt-8 flex items-center gap-4 border-t border-stone-200 pt-5">
                {item.avatar}
                <div>
                  <div className="text-sm font-semibold text-stone-900">{item.name}</div>
                  <div className="text-xs text-stone-600">
                    {item.role} · {item.company}
                  </div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Proof5: Dark 3-Column Bento Testimonial Grid                               */
/* -------------------------------------------------------------------------- */
export function Proof5() {
  const items = [
    {
      name: 'Mei-Ling Zhou',
      role: 'Principal Architect, Northstar Cloud',
      metric: '41% lower egress cost',
      quote:
        'Routing telemetry through edge aggregators cut our cross-region bandwidth bill by 41% within six weeks without dropping a single span.',
      avatar: (
        <svg viewBox="0 0 44 44" className="h-11 w-11 shrink-0 rounded-full" aria-hidden="true">
          <rect width="44" height="44" fill="#1E293B" />
          <path d="M10 44C10 34 15 29 22 29C29 29 34 34 34 44Z" fill="#0EA5E9" />
          <circle cx="22" cy="18" r="8" fill="#F1C7A8" />
          <path d="M13 20C13 11 17 8 22 8C27 8 31 11 31 20L29 25H27L26 16C24 14 20 14 18 16L17 25H15Z" fill="#0F172A" />
          <circle cx="19.5" cy="18.5" r="1" fill="#0F172A" />
          <circle cx="24.5" cy="18.5" r="1" fill="#0F172A" />
        </svg>
      ),
    },
    {
      name: 'Henrik Solberg',
      role: 'VP Operations, Timberline Bio',
      metric: '3.2x faster audit prep',
      quote:
        'Quarterly compliance evidence used to live across twelve spreadsheets. Now every access change is signed, searchable, and exportable in seconds.',
      avatar: (
        <svg viewBox="0 0 44 44" className="h-11 w-11 shrink-0 rounded-full" aria-hidden="true">
          <rect width="44" height="44" fill="#1E293B" />
          <path d="M10 44C10 34 15 29 22 29C29 29 34 34 34 44Z" fill="#334155" />
          <circle cx="22" cy="18" r="8" fill="#F5D3BA" />
          <path d="M14 16C14 10 18 8 22 8C26 8 30 10 30 16C28 13 16 13 14 16Z" fill="#D97706" />
          <path d="M16 21C17 25 27 25 28 21" stroke="#B45309" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      name: 'Nadia Okafor',
      role: 'Director of Product, Clearview Ledger',
      metric: '99.98% uptime SLA',
      quote:
        'Switching our billing webhooks to this queue eliminated silent retry storms during peak payroll runs across eighteen regional banks.',
      avatar: (
        <svg viewBox="0 0 44 44" className="h-11 w-11 shrink-0 rounded-full" aria-hidden="true">
          <rect width="44" height="44" fill="#1E293B" />
          <path d="M10 44C10 34 15 29 22 29C29 29 34 34 34 44Z" fill="#10B981" />
          <circle cx="22" cy="18" r="8" fill="#7C4A2D" />
          <circle cx="22" cy="10" r="5" fill="#111827" />
          <path d="M14 17C14 11 18 8 22 8C26 8 30 11 30 17C27 13 17 13 14 17Z" fill="#111827" />
          <circle cx="19.5" cy="18.5" r="1" fill="#111827" />
          <circle cx="24.5" cy="18.5" r="1" fill="#111827" />
        </svg>
      ),
    },
  ];

  return (
    <section aria-labelledby="proof5-heading" className="bg-[#111318] px-6 py-16 text-neutral-100 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="proof5-heading" className="text-2xl font-semibold tracking-tight text-white">
              Teams that ship with confidence
            </h2>
            <p className="mt-1 text-sm text-neutral-400">
              Three engineering leaders on measurable production impact
            </p>
          </div>
          <p className="text-xs font-medium text-emerald-400 tabular-nums">
            4.9 / 5.0 average verified score
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {items.map((item) => (
            <article
              key={item.name}
              className="flex flex-col justify-between rounded-xl border border-neutral-800 bg-[#171A21] p-6"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1" aria-label="Rated 5 out of 5 stars">
                    {[0, 1, 2, 3, 4].map((star) => (
                      <svg key={star} viewBox="0 0 16 16" className="h-4 w-4 text-amber-400" aria-hidden="true">
                        <path
                          fill="currentColor"
                          d="M8 1.3l2.06 4.17 4.6.67-3.33 3.25.79 4.58L8 11.8l-4.12 2.17.79-4.58L1.34 6.14l4.6-.67L8 1.3z"
                        />
                      </svg>
                    ))}
                  </div>
                  <span className="text-xs font-medium text-neutral-300 tabular-nums">{item.metric}</span>
                </div>

                <blockquote className="mt-5 text-sm leading-relaxed text-neutral-200">
                  “{item.quote}”
                </blockquote>
              </div>

              <footer className="mt-6 flex items-center gap-3 border-t border-neutral-800 pt-4">
                {item.avatar}
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-white">{item.name}</div>
                  <div className="truncate text-xs text-neutral-400">{item.role}</div>
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
/* Proof6: Colourful Masonry-Feel Staggered Testimonial Grid                  */
/* -------------------------------------------------------------------------- */
export function Proof6() {
  const cards = [
    {
      name: 'Sofia Alvarez',
      role: 'Head of Design Systems · Halcyon',
      bg: 'bg-amber-50 border-amber-200',
      quote:
        'Token drift between Figma and production components dropped to zero in two sprints. Our product designers finally trust the live storybook as the single source of truth.',
      avatarBg: '#FDE68A',
      shirt: '#B45309',
      skin: '#E0AC8B',
      hair: '#1F2937',
    },
    {
      name: 'David Kowalski',
      role: 'CTO · Bedrock Systems',
      bg: 'bg-sky-50 border-sky-200',
      quote:
        'Setup took twenty minutes. We replaced three brittle cron scripts with one deterministic pipeline.',
      avatarBg: '#BAE6FD',
      shirt: '#0369A1',
      skin: '#F3D2B8',
      hair: '#4B5563',
    },
    {
      name: 'Priya Sundaram',
      role: 'VP Platform · Meridian',
      bg: 'bg-emerald-50 border-emerald-200',
      quote:
        'What convinced our security board was not a slide deck—it was running a live failover drill in staging and watching zero in-flight customer transactions drop while an entire availability zone drained cleanly.',
      avatarBg: '#A7F3D0',
      shirt: '#047857',
      skin: '#9C6242',
      hair: '#111827',
    },
    {
      name: 'Owen MacLeod',
      role: 'CRO · Latticeworks',
      bg: 'bg-rose-50 border-rose-200',
      quote:
        'Enterprise procurement cycles shrank by 3 weeks once SOC 2 evidence packets generated automatically per deal room.',
      avatarBg: '#FECDD3',
      shirt: '#BE123C',
      skin: '#F1CCB0',
      hair: '#78350F',
    },
    {
      name: 'Hannah Lindqvist',
      role: 'Staff SRE · Harborline',
      bg: 'bg-violet-50 border-violet-200',
      quote:
        'Our on-call pager volume fell from 42 alerts a week to 6 actionable notifications. Every engineer gets real sleep now.',
      avatarBg: '#DDD6FE',
      shirt: '#6D28D9',
      skin: '#F6DAC4',
      hair: '#92400E',
    },
    {
      name: 'Mateo Bellini',
      role: 'Lead Engineer · Foundry',
      bg: 'bg-lime-50 border-lime-200',
      quote:
        'The TypeScript SDK feels authored by engineers who actually maintain production monorepos—predictable types, zero hidden globals, and instant local mocks.',
      avatarBg: '#D9F99D',
      shirt: '#3F6212',
      skin: '#DDA882',
      hair: '#1C1917',
    },
  ];

  return (
    <section aria-labelledby="proof6-heading" className="bg-white px-6 py-16 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 max-w-2xl">
          <h2
            id="proof6-heading"
            className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl text-balance"
          >
            Notes from builders, designers, and operators
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Unedited feedback collected from active customer teams across Europe and North America.
          </p>
        </div>

        <div className="columns-1 gap-5 space-y-5 md:columns-2 lg:columns-3">
          {cards.map((card) => (
            <figure
              key={card.name}
              className={`break-inside-avoid rounded-2xl border p-6 ${card.bg}`}
            >
              <blockquote className="text-sm leading-relaxed text-slate-800">
                “{card.quote}”
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <svg viewBox="0 0 40 40" className="h-10 w-10 shrink-0 rounded-full" aria-hidden="true">
                  <rect width="40" height="40" fill={card.avatarBg} />
                  <path d="M9 40C9 31 14 27 20 27C26 27 31 31 31 40Z" fill={card.shirt} />
                  <circle cx="20" cy="17" r="7" fill={card.skin} />
                  <path d="M13 15C13 9.5 16.5 7 20 7C23.5 7 27 9.5 27 15C24.5 12 15.5 12 13 15Z" fill={card.hair} />
                </svg>
                <div>
                  <div className="text-sm font-semibold text-slate-950">{card.name}</div>
                  <div className="text-xs text-slate-600">{card.role}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
