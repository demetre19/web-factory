import React from 'react';

/* -------------------------------------------------------------------------- */
/* Proof7: Editorial Monumental Single Big-Quote with Avatar                  */
/* -------------------------------------------------------------------------- */
export function Proof7() {
  return (
    <section aria-labelledby="proof7-heading" className="bg-[#F6F3EC] px-6 py-20 text-stone-900 sm:px-10">
      <div className="mx-auto max-w-4xl border-y border-stone-300 py-14 text-center">
        <h2 id="proof7-heading" className="sr-only">
          Featured Editorial Customer Quote
        </h2>
        <svg
          viewBox="0 0 40 32"
          className="mx-auto mb-6 h-7 w-9 text-stone-400"
          aria-hidden="true"
        >
          <path
            fill="currentColor"
            d="M17.2 4.8C11.4 7.3 8 11.7 8 17.5V28h9.2V18.4H12c.4-3.7 2.8-6.7 7-8.8L17.2 4.8zm18 0C29.4 7.3 26 11.7 26 17.5V28h9.2V18.4H30c.4-3.7 2.8-6.7 7-8.8l-1.8-4.8z"
          />
        </svg>

        <figure>
          <blockquote className="font-serif text-2xl leading-snug font-normal tracking-tight text-stone-900 sm:text-4xl text-balance">
            “Replacing four fragmented reporting tools with a single verifiable ledger turned our Monday executive review from a three-hour debate into a fifteen-minute decision meeting.”
          </blockquote>

          <figcaption className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <svg viewBox="0 0 56 56" className="h-14 w-14 rounded-full border border-stone-300" aria-hidden="true">
              <rect width="56" height="56" fill="#E8E1D3" />
              <path d="M13 56C13 43 19 37 28 37C37 37 43 43 43 56Z" fill="#292524" />
              <circle cx="28" cy="23" r="10" fill="#EBBF9E" />
              <path d="M17 24C17 14 22 10 28 10C34 10 39 14 39 24C36 18 32 16 28 16C24 16 20 18 17 24Z" fill="#57534E" />
              <circle cx="24.5" cy="23" r="1.2" fill="#1C1917" />
              <circle cx="31.5" cy="23" r="1.2" fill="#1C1917" />
              <path d="M25.5 27.5C27 28.5 29 28.5 30.5 27.5" stroke="#78350F" strokeWidth="1.4" fill="none" strokeLinecap="round" />
            </svg>
            <div className="text-center sm:text-left">
              <div className="text-sm font-semibold text-stone-900">Eleanor Vance-Mercer</div>
              <div className="text-xs text-stone-600">
                Chief Operating Officer · Albion Maritime Holdings
              </div>
            </div>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Proof8: Dark Asymmetric Split-Screen Executive Big-Quote                   */
/* -------------------------------------------------------------------------- */
export function Proof8() {
  return (
    <section aria-labelledby="proof8-heading" className="bg-[#090E1A] px-6 py-16 text-slate-100 sm:px-10">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 rounded-2xl border border-slate-800 bg-[#0F1629] p-8 sm:p-12 lg:grid-cols-12">
        <div className="flex flex-col items-start gap-6 lg:col-span-4">
          <div className="flex items-center gap-4">
            <svg viewBox="0 0 88 88" className="h-20 w-20 shrink-0 rounded-2xl border border-slate-700" aria-hidden="true">
              <rect width="88" height="88" fill="#1E293B" />
              <path d="M18 88C18 67 29 56 44 56C59 56 70 67 70 88Z" fill="#3B82F6" />
              <circle cx="44" cy="36" r="16" fill="#C98E63" />
              <path d="M28 33C28 21 35 15 44 15C53 15 60 21 60 33C55 26 33 26 28 33Z" fill="#0F172A" />
              <rect x="34" y="33" width="8" height="5.5" rx="1.5" stroke="#0F172A" strokeWidth="1.8" fill="none" />
              <rect x="46" y="33" width="8" height="5.5" rx="1.5" stroke="#0F172A" strokeWidth="1.8" fill="none" />
              <line x1="42" y1="35.5" x2="46" y2="35.5" stroke="#0F172A" strokeWidth="1.8" />
            </svg>
            <div>
              <h2 id="proof8-heading" className="text-base font-semibold text-white">
                Marcus Chen-Albrecht
              </h2>
              <p className="text-xs text-slate-400">SVP Infrastructure, VectorGrid</p>
              <div className="mt-3 flex items-center gap-2 text-slate-300">
                <svg viewBox="0 0 96 22" className="h-4 w-auto" role="img" aria-label="VectorGrid">
                  <polygon points="8,2 15,11 8,20 1,11" fill="#60A5FA" />
                  <text x="22" y="15" fill="currentColor" fontSize="12" fontWeight="700" fontFamily="Plus Jakarta Sans, sans-serif">
                    VectorGrid
                  </text>
                </svg>
              </div>
            </div>
          </div>

          <dl className="grid w-full grid-cols-2 gap-4 border-t border-slate-800 pt-5">
            <div>
              <dt className="text-xs text-slate-400">P99 Query Latency</dt>
              <dd className="mt-1 font-mono text-xl font-semibold text-sky-400 tabular-nums">18ms</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">Annual Savings</dt>
              <dd className="mt-1 font-mono text-xl font-semibold text-white tabular-nums">$1.4M</dd>
            </div>
          </dl>
        </div>

        <figure className="lg:col-span-8 lg:border-l lg:border-slate-800 lg:pl-10">
          <blockquote className="text-xl leading-relaxed font-medium text-slate-100 sm:text-2xl text-balance">
            “We evaluated six telemetry warehouses under real Black Friday load. Only one sustained 1.8 million events per second without a single shard rebalance or cold-cache spike—and cut our storage footprint in half.”
          </blockquote>
          <figcaption className="mt-6 text-xs text-slate-400">
            Verified enterprise case benchmark · 14-month production deployment
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Proof9: Colourful Emerald & Lime Studio Quote Block                        */
/* -------------------------------------------------------------------------- */
export function Proof9() {
  return (
    <section aria-labelledby="proof9-heading" className="bg-[#064E3B] px-6 py-16 text-white sm:px-10">
      <div className="mx-auto max-w-5xl rounded-2xl border border-emerald-700/80 bg-[#053E2F] p-8 sm:p-14">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3">
              <svg viewBox="0 0 28 22" className="h-6 w-7 text-lime-300" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M11.6 1.5C6.8 3.6 4 7.4 4 12.4V21h7.6v-8.1H7.5c.3-3.1 2.3-5.6 5.6-7.3L11.6 1.5zm13.4 0c-4.8 2.1-7.6 5.9-7.6 10.9V21H25v-8.1h-4.1c.3-3.1 2.3-5.6 5.6-7.3l-1.5-4.1z"
                />
              </svg>
              <h2 id="proof9-heading" className="text-xs font-semibold tracking-wider text-lime-300 uppercase">
                Customer Spotlight
              </h2>
            </div>

            <blockquote className="mt-5 text-2xl leading-snug font-semibold tracking-tight text-white sm:text-3xl text-balance">
              “Onboarding new partner clinics used to stall for two weeks in manual CSV cleanup. Now our intake workflow validates and maps every record in under ten minutes.”
            </blockquote>
          </div>

          <figure className="flex shrink-0 flex-row items-center gap-4 border-t border-emerald-800 pt-6 md:flex-col md:items-end md:border-t-0 md:pt-0 md:text-right">
            <svg viewBox="0 0 64 64" className="h-16 w-16 rounded-2xl border-2 border-lime-300" aria-hidden="true">
              <rect width="64" height="64" fill="#065F46" />
              <path d="M14 64C14 48 22 41 32 41C42 41 50 48 50 64Z" fill="#BEF264" />
              <circle cx="32" cy="26" r="11" fill="#8D5524" />
              <path d="M20 26C20 16 25 11 32 11C39 11 44 16 44 26C41 20 23 20 20 26Z" fill="#18181B" />
              <circle cx="28" cy="26" r="1.4" fill="#18181B" />
              <circle cx="36" cy="26" r="1.4" fill="#18181B" />
              <path d="M28.5 31C30.5 32.5 33.5 32.5 35.5 31" stroke="#451A03" strokeWidth="1.6" fill="none" strokeLinecap="round" />
            </svg>
            <figcaption>
              <div className="text-sm font-semibold text-white">Dr. Amara Mensah</div>
              <div className="text-xs text-emerald-200">Head of Clinical Ops · Fernwood Care</div>
              <div className="mt-1 text-xs font-medium text-lime-300 tabular-nums">
                96% faster clinic onboarding
              </div>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
