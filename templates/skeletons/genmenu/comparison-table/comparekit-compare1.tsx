import { useState } from 'react';
import { Check, Minus } from 'lucide-react';

interface FeatureRow {
  category: string;
  label: string;
  note?: string;
  values: [string | boolean, string | boolean, string | boolean];
}

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    audience: 'For early-stage teams',
    price: '$19',
    cadence: '/month',
    cta: 'Choose Starter',
    recommended: false,
  },
  {
    id: 'growth',
    name: 'Growth',
    audience: 'For scaling operations',
    price: '$49',
    cadence: '/month',
    cta: 'Choose Growth',
    recommended: true,
  },
  {
    id: 'scale',
    name: 'Scale',
    audience: 'For multi-org governance',
    price: '$129',
    cadence: '/month',
    cta: 'Choose Scale',
    recommended: false,
  },
] as const;

const ROWS: FeatureRow[] = [
  { category: 'Workspace', label: 'Included team seats', values: ['5 seats', '25 seats', 'Unlimited'] },
  { category: 'Workspace', label: 'Shared project spaces', values: ['3 spaces', 'Unlimited', 'Unlimited'] },
  { category: 'Workspace', label: 'Custom domain routing', values: [false, true, true] },
  { category: 'Automation', label: 'Monthly workflow runs', values: ['2,500', '50,000', '500,000'] },
  { category: 'Automation', label: 'Scheduled webhook retries', values: [false, true, true] },
  { category: 'Automation', label: 'Dedicated worker concurrency', values: [false, '4 workers', '24 workers'] },
  { category: 'Security', label: 'SAML single sign-on', values: [false, true, true] },
  { category: 'Security', label: 'Audit log retention', values: ['7 days', '90 days', '7 years'] },
];

export function Compare1() {
  const [selectedPlan, setSelectedPlan] = useState<string>('growth');

  const renderCell = (value: string | boolean, isRecommended: boolean) => {
    if (typeof value === 'boolean') {
      return value ? (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-50 text-emerald-700" aria-label="Included">
          <Check className="w-4 h-4 stroke-[2.25]" aria-hidden="true" />
        </span>
      ) : (
        <span className="inline-flex items-center justify-center w-6 h-6 text-slate-300" aria-label="Not included">
          <Minus className="w-4 h-4" aria-hidden="true" />
        </span>
      );
    }
    return (
      <span className={`text-sm tabular-nums ${isRecommended ? 'font-semibold text-slate-900' : 'text-slate-700'}`}>
        {value}
      </span>
    );
  };

  return (
    <section aria-labelledby="compare1-heading" className="w-full bg-white border border-slate-200 rounded-xl p-6 md:p-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-blue-700 mb-1">Feature Comparison Table</p>
          <h3 id="compare1-heading" className="text-2xl font-semibold tracking-tight text-slate-900 font-display">
            Workspace & Automation Plans
          </h3>
        </div>
        <p className="text-sm text-slate-500">
          Selected tier: <span className="font-semibold text-slate-900 capitalize">{selectedPlan}</span>
        </p>
      </div>

      <div className="overflow-x-auto -mx-2 px-2">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200">
              <th scope="col" className="py-4 pr-4 align-bottom w-[34%]">
                <span className="text-xs font-medium text-slate-500">Capabilities by plan</span>
              </th>
              {PLANS.map((plan) => (
                <th
                  key={plan.id}
                  scope="col"
                  className={`py-4 px-4 align-top text-center w-[22%] rounded-t-lg ${
                    plan.recommended ? 'bg-blue-50/70 border-t-2 border-x border-t-blue-600 border-x-blue-200' : ''
                  }`}
                >
                  <div className="text-xs font-medium text-blue-700 min-h-[1rem] mb-1">
                    {plan.recommended ? 'Recommended' : ''}
                  </div>
                  <div className="text-base font-semibold text-slate-900 font-display">{plan.name}</div>
                  <div className="text-xs font-normal text-slate-500 mt-0.5">{plan.audience}</div>
                  <div className="mt-3 flex items-baseline justify-center gap-1">
                    <span className="text-2xl font-bold text-slate-900 tabular-nums">{plan.price}</span>
                    <span className="text-xs font-normal text-slate-500">{plan.cadence}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {ROWS.map((row) => (
              <tr key={row.label} className="hover:bg-slate-50/60 transition-colors">
                <th scope="row" className="py-3.5 pr-4 font-normal text-sm text-slate-800">
                  <span className="text-xs text-slate-400">{row.category}</span>
                  <span className="text-slate-300 mx-1.5" aria-hidden="true">·</span>
                  <span className="font-medium text-slate-800">{row.label}</span>
                </th>
                {row.values.map((val, idx) => {
                  const plan = PLANS[idx];
                  return (
                    <td
                      key={plan.id}
                      className={`py-3.5 px-4 text-center ${
                        plan.recommended ? 'bg-blue-50/40 border-x border-blue-200/80' : ''
                      }`}
                    >
                      {renderCell(val, plan.recommended)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-200">
              <td className="py-4 pr-4 text-xs text-slate-500">All plans include TLS 1.3 encryption and daily backups.</td>
              {PLANS.map((plan) => {
                const isSelected = selectedPlan === plan.id;
                return (
                  <td
                    key={plan.id}
                    className={`py-4 px-4 text-center rounded-b-lg ${
                      plan.recommended ? 'bg-blue-50/70 border-b border-x border-blue-200' : ''
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                        plan.recommended
                          ? 'bg-blue-700 text-white hover:bg-blue-800'
                          : isSelected
                          ? 'bg-slate-900 text-white'
                          : 'bg-white text-slate-800 border border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {isSelected ? 'Selected' : plan.cta}
                    </button>
                  </td>
                );
              })}
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}
