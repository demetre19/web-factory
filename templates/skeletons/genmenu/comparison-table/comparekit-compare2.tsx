import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { calculateTierPrice } from '../../utils/comparisonHelpers';

const TIERS = [
  { id: 'hobby', name: 'Hobby', monthlyPrice: 0, seats: 1, recommended: false, note: 'Personal experiments' },
  { id: 'pro', name: 'Pro', monthlyPrice: 29, seats: 1, recommended: true, note: 'Production workloads' },
  { id: 'team', name: 'Team', monthlyPrice: 99, seats: 1, recommended: false, note: 'Collaborative squads' },
  { id: 'enterprise', name: 'Enterprise', monthlyPrice: 349, seats: 1, recommended: false, note: 'Dedicated clusters' },
] as const;

const MATRIX_ROWS: { label: string; values: [string | boolean, string | boolean, string | boolean, string | boolean] }[] = [
  { label: 'Edge bandwidth / mo', values: ['100 GB', '1 TB', '5 TB', 'Custom'] },
  { label: 'Serverless function invocations', values: ['250k', '5M', '25M', 'Unlimited'] },
  { label: 'Concurrent build pipelines', values: ['1', '4', '12', '40+'] },
  { label: 'Zero-downtime instant rollbacks', values: [false, true, true, true] },
  { label: 'Preview branches per PR', values: [true, true, true, true] },
  { label: 'Private VPC peering', values: [false, false, true, true] },
  { label: '99.99% uptime SLA', values: [false, true, true, true] },
];

export function Compare2() {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('annual');
  const [activeTier, setActiveTier] = useState<string>('pro');

  return (
    <section
      aria-labelledby="compare2-heading"
      className="w-full bg-slate-950 text-slate-100 border border-slate-800 rounded-xl p-6 md:p-8"
    >
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-sky-400 mb-1">Dark 4-Column Pricing & Feature Matrix</p>
          <h3 id="compare2-heading" className="text-2xl font-semibold tracking-tight text-white font-display">
            Compute Runtime Tiers
          </h3>
        </div>

        <div className="inline-flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg self-start">
          <button
            type="button"
            onClick={() => setBilling('monthly')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              billing === 'monthly' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setBilling('annual')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              billing === 'annual' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Annual (Save 20%)
          </button>
        </div>
      </div>

      <div className="overflow-x-auto -mx-2 px-2">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-800">
              <th scope="col" className="py-4 pr-4 align-bottom w-[28%] text-xs font-medium text-slate-400">
                Quota &amp; Capability
              </th>
              {TIERS.map((tier) => {
                const price =
                  tier.monthlyPrice === 0 ? 0 : calculateTierPrice(tier.monthlyPrice, 1, billing, 0.2);
                return (
                  <th
                    key={tier.id}
                    scope="col"
                    className={`py-4 px-4 text-center align-top w-[18%] ${
                      tier.recommended ? 'bg-slate-900 border-t-2 border-x border-t-sky-500 border-x-slate-700 rounded-t-lg' : ''
                    }`}
                  >
                    <div className="text-xs font-medium text-sky-400 min-h-[1rem] mb-1">
                      {tier.recommended ? 'Most Popular' : ''}
                    </div>
                    <div className="text-base font-semibold text-white font-display">{tier.name}</div>
                    <div className="text-xs font-normal text-slate-400 mt-0.5">{tier.note}</div>
                    <div className="mt-3 font-mono tabular-nums">
                      <span className="text-2xl font-bold text-white">${price}</span>
                      <span className="text-xs font-normal text-slate-400">/mo</span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {MATRIX_ROWS.map((row) => (
              <tr key={row.label} className="hover:bg-slate-900/50 transition-colors">
                <th scope="row" className="py-3.5 pr-4 text-sm font-medium text-slate-200">
                  {row.label}
                </th>
                {row.values.map((val, idx) => {
                  const tier = TIERS[idx];
                  return (
                    <td
                      key={tier.id}
                      className={`py-3.5 px-4 text-center ${
                        tier.recommended ? 'bg-slate-900/90 border-x border-slate-700' : ''
                      }`}
                    >
                      {typeof val === 'boolean' ? (
                        val ? (
                          <Check className="w-4 h-4 text-emerald-400 mx-auto" aria-label="Included" />
                        ) : (
                          <X className="w-4 h-4 text-slate-600 mx-auto" aria-label="Not included" />
                        )
                      ) : (
                        <span
                          className={`font-mono text-xs tabular-nums ${
                            tier.recommended ? 'text-sky-300 font-semibold' : 'text-slate-300'
                          }`}
                        >
                          {val}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-800">
              <td className="py-4 pr-4 text-xs text-slate-400">
                Active selection: <span className="text-slate-200 font-medium capitalize">{activeTier}</span>
              </td>
              {TIERS.map((tier) => (
                <td
                  key={tier.id}
                  className={`py-4 px-3 text-center ${
                    tier.recommended ? 'bg-slate-900 border-b border-x border-slate-700 rounded-b-lg' : ''
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setActiveTier(tier.id)}
                    className={`w-full py-2 px-3 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                      tier.recommended
                        ? 'bg-sky-500 text-slate-950 hover:bg-sky-400 font-semibold'
                        : activeTier === tier.id
                        ? 'bg-slate-700 text-white'
                        : 'bg-slate-900 text-slate-200 border border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    {activeTier === tier.id ? 'Selected' : `Select ${tier.name}`}
                  </button>
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}
