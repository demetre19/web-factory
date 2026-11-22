import { useState } from 'react';
import { Check, Minus } from 'lucide-react';
import { calculateTierPrice } from '../../utils/comparisonHelpers';

const SEAT_OPTIONS = [5, 25, 100] as const;

const PLANS = [
  { id: 'team', name: 'Team', perSeat: 14, included: 0, recommended: false, summary: 'For focused project groups' },
  { id: 'business', name: 'Business', perSeat: 26, included: 0, recommended: true, summary: 'For cross-functional orgs' },
  { id: 'enterprise', name: 'Enterprise', perSeat: 42, included: 0, recommended: false, summary: 'For regulated enterprises' },
] as const;

const FEATURES = [
  { name: 'Unlimited shared canvases', values: [true, true, true] },
  { name: 'Granular folder permissions', values: [false, true, true] },
  { name: 'Approval & sign-off workflows', values: [false, true, true] },
  { name: 'SCIM directory provisioning', values: [false, true, true] },
  { name: 'Dedicated data residency (EU / US)', values: [false, false, true] },
  { name: '24/7 phone & Slack response SLA', values: ['Email (24h)', 'Priority (4h)', 'Dedicated (30m)'] },
] as const;

export function Compare11() {
  const [seats, setSeats] = useState<number>(25);
  const [billing, setBilling] = useState<'monthly' | 'annual'>('annual');

  return (
    <section aria-labelledby="compare11-heading" className="w-full bg-white border border-slate-200 rounded-xl p-6 md:p-8">
      <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-blue-700 mb-1">Side-by-Side Pricing + Seat Calculator</p>
          <h3 id="compare11-heading" className="text-2xl font-semibold tracking-tight text-slate-900 font-display">
            Estimated Monthly Investment
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg" role="group" aria-label="Team size">
            {SEAT_OPTIONS.map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => setSeats(count)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap tabular-nums ${
                  seats === count ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {count} seats
              </button>
            ))}
          </div>

          <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg" role="group" aria-label="Billing cycle">
            <button
              type="button"
              onClick={() => setBilling('monthly')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                billing === 'monthly' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBilling('annual')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                billing === 'annual' ? 'bg-blue-700 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Annual (-20%)
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto -mx-2 px-2">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200">
              <th scope="col" className="py-4 pr-4 w-[34%] align-bottom text-xs font-medium text-slate-500">
                Calculated for {seats} seats ({billing})
              </th>
              {PLANS.map((plan) => {
                const total = calculateTierPrice(plan.perSeat, seats, billing, 0.2, plan.included);
                return (
                  <th
                    key={plan.id}
                    scope="col"
                    className={`py-4 px-5 w-[22%] align-top text-center ${
                      plan.recommended ? 'bg-blue-50/70 border-t-2 border-x border-t-blue-700 border-x-blue-200 rounded-t-lg' : ''
                    }`}
                  >
                    <div className="text-xs font-semibold text-blue-700 min-h-[1rem] mb-0.5">
                      {plan.recommended ? 'Recommended' : ''}
                    </div>
                    <div className="text-base font-semibold text-slate-900 font-display">{plan.name}</div>
                    <div className="text-xs font-normal text-slate-500 mt-0.5">{plan.summary}</div>
                    <div className="mt-3 tabular-nums">
                      <span className="text-2xl font-bold text-slate-900">${total.toLocaleString()}</span>
                      <span className="text-xs font-normal text-slate-500">/mo</span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {FEATURES.map((feat) => (
              <tr key={feat.name} className="hover:bg-slate-50/60">
                <th scope="row" className="py-3.5 pr-4 text-sm font-medium text-slate-800">
                  {feat.name}
                </th>
                {feat.values.map((val, idx) => {
                  const plan = PLANS[idx];
                  return (
                    <td
                      key={plan.id}
                      className={`py-3.5 px-5 text-center ${
                        plan.recommended ? 'bg-blue-50/40 border-x border-blue-200' : ''
                      }`}
                    >
                      {typeof val === 'boolean' ? (
                        val ? (
                          <Check className="w-4 h-4 text-emerald-700 mx-auto" aria-label="Included" />
                        ) : (
                          <Minus className="w-4 h-4 text-slate-300 mx-auto" aria-label="Not included" />
                        )
                      ) : (
                        <span className="text-xs font-medium text-slate-700 tabular-nums">{val}</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
