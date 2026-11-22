import React, { useState } from 'react';

type BillingCycle = 'monthly' | 'annual';
type PlanId = 'starter' | 'scale' | 'enterprise';

interface PlanSpec {
  id: PlanId;
  name: string;
  audience: string;
  monthlyPrice: number;
  annualPrice: number;
}

const PLANS: PlanSpec[] = [
  { id: 'starter', name: 'Starter', audience: 'For early-stage teams', monthlyPrice: 49, annualPrice: 39 },
  { id: 'scale', name: 'Scale', audience: 'For scaling operations', monthlyPrice: 189, annualPrice: 149 },
  { id: 'enterprise', name: 'Enterprise', audience: 'For regulated orgs', monthlyPrice: 540, annualPrice: 440 },
];

const MATRIX_ROWS: Array<{
  feature: string;
  starter: string;
  scale: string;
  enterprise: string;
}> = [
  { feature: 'Included team seats', starter: '5 seats', scale: '25 seats', enterprise: 'Unlimited seats' },
  { feature: 'Monthly ingested events', starter: '10M rows', scale: '250M rows', enterprise: '5B+ custom' },
  { feature: 'Query concurrency limit', starter: '4 parallel', scale: '24 parallel', enterprise: '120 dedicated' },
  { feature: 'Audit log retention', starter: '14 days', scale: '180 days', enterprise: '7 years immutable' },
  { feature: 'SSO & SAML enforcement', starter: 'Google OAuth', scale: 'SAML 2.0 + SCIM', enterprise: 'Hardware WebAuthn' },
  { feature: 'Support SLA response', starter: '24 business hrs', scale: '4 business hrs', enterprise: '15 min 24/7' },
];

export function Data18() {
  const [cycle, setCycle] = useState<BillingCycle>('annual');
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('scale');

  return (
    <section
      aria-label="Compute tier comparison table"
      className="rounded-xl border border-slate-200 bg-white overflow-hidden"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-6 py-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Infrastructure Plan Comparison</h3>
          <p className="text-xs text-slate-500">Click any tier header to highlight its quotas</p>
        </div>

        <div role="group" aria-label="Billing cadence" className="inline-flex rounded-lg bg-slate-100 p-1">
          <button
            type="button"
            aria-pressed={cycle === 'monthly'}
            onClick={() => setCycle('monthly')}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              cycle === 'monthly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            aria-pressed={cycle === 'annual'}
            onClick={() => setCycle('annual')}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              cycle === 'annual' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Annual (Save 20%)
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th scope="col" className="w-56 px-6 py-5 align-bottom text-xs font-medium text-slate-500">
                Capacity &amp; Governance
              </th>
              {PLANS.map((plan) => {
                const isSelected = selectedPlan === plan.id;
                const price = cycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;
                return (
                  <th
                    key={plan.id}
                    scope="col"
                    className={`px-5 py-5 align-top transition-colors ${
                      isSelected ? 'bg-indigo-50/70' : 'bg-white'
                    }`}
                  >
                    <button
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => setSelectedPlan(plan.id)}
                      className="w-full text-left focus-visible:outline-2 focus-visible:outline-indigo-600 rounded"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-slate-900">{plan.name}</span>
                        {isSelected && (
                          <span className="text-[11px] font-semibold text-indigo-700">Selected</span>
                        )}
                      </div>
                      <div className="mt-0.5 text-xs font-normal text-slate-500">{plan.audience}</div>
                      <div className="mt-3 flex items-baseline gap-1 font-display">
                        <span className="text-2xl font-bold text-slate-900 tabular-nums">${price}</span>
                        <span className="text-xs font-normal text-slate-500">/mo</span>
                      </div>
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {MATRIX_ROWS.map((row) => (
              <tr key={row.feature} className="hover:bg-slate-50/50">
                <th scope="row" className="px-6 py-3.5 font-medium text-slate-700">
                  {row.feature}
                </th>
                {(['starter', 'scale', 'enterprise'] as PlanId[]).map((col) => {
                  const isSelected = selectedPlan === col;
                  return (
                    <td
                      key={col}
                      className={`px-5 py-3.5 font-mono tabular-nums ${
                        isSelected
                          ? 'bg-indigo-50/50 font-semibold text-slate-900'
                          : 'text-slate-600'
                      }`}
                    >
                      {row[col]}
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
