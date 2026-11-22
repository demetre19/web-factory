import { useState } from 'react';
import { Check, Minus } from 'lucide-react';

const STACKED_PLANS = [
  {
    id: 'core',
    name: 'Core',
    price: '$18',
    tagline: 'Single creator workflow',
    winner: false,
    items: [
      { label: 'Active client portals', value: '3 portals', included: true },
      { label: 'Storage capacity', value: '50 GB', included: true },
      { label: 'Custom branding', value: 'Footer link', included: false },
      { label: 'Automated reminders', value: 'Weekly', included: true },
    ],
  },
  {
    id: 'studio-pro',
    name: 'Studio Pro',
    price: '$44',
    tagline: 'Growing design & dev studios',
    winner: true,
    items: [
      { label: 'Active client portals', value: 'Unlimited', included: true },
      { label: 'Storage capacity', value: '1 TB', included: true },
      { label: 'Custom branding', value: 'Full white-label', included: true },
      { label: 'Automated reminders', value: 'Real-time webhooks', included: true },
    ],
  },
  {
    id: 'collective',
    name: 'Collective',
    price: '$89',
    tagline: 'Multi-partner consultancies',
    winner: false,
    items: [
      { label: 'Active client portals', value: 'Unlimited', included: true },
      { label: 'Storage capacity', value: '5 TB', included: true },
      { label: 'Custom branding', value: 'Multi-brand domains', included: true },
      { label: 'Automated reminders', value: 'Custom SLA rules', included: true },
    ],
  },
] as const;

export function Compare13() {
  const [mobileFocus, setMobileFocus] = useState<string>('studio-pro');

  return (
    <section aria-labelledby="compare13-heading" className="w-full bg-white border border-neutral-200 rounded-xl p-6 md:p-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs text-neutral-500 mb-1">Minimal Mobile-Stacked Comparison Cards</p>
          <h3 id="compare13-heading" className="text-2xl font-medium tracking-tight text-neutral-950 font-display">
            Client Portal Tiers
          </h3>
        </div>

        {/* Mobile quick-focus tab strip */}
        <div className="flex md:hidden items-center gap-1 p-1 bg-neutral-100 rounded-lg self-start">
          {STACKED_PLANS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setMobileFocus(p.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                mobileFocus === p.id ? 'bg-white text-neutral-950 shadow-xs' : 'text-neutral-600'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {STACKED_PLANS.map((plan) => {
          const isMobileActive = mobileFocus === plan.id;
          return (
            <article
              key={plan.id}
              className={`rounded-lg p-6 flex flex-col justify-between transition-colors ${
                isMobileActive ? 'block' : 'hidden md:flex'
              } ${
                plan.winner
                  ? 'bg-neutral-950 text-white border border-neutral-950'
                  : 'bg-neutral-50 text-neutral-900 border border-neutral-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`text-xs font-medium ${plan.winner ? 'text-neutral-300' : 'text-neutral-500'}`}>
                    {plan.tagline}
                  </span>
                  {plan.winner && (
                    <span className="text-xs font-semibold text-amber-300 whitespace-nowrap">Recommended</span>
                  )}
                </div>

                <div className="flex items-baseline justify-between border-b pb-4 mb-4 border-current/15">
                  <h4 className="text-lg font-semibold font-display">{plan.name}</h4>
                  <div className="tabular-nums">
                    <span className="text-2xl font-bold">{plan.price}</span>
                    <span className={`text-xs ${plan.winner ? 'text-neutral-400' : 'text-neutral-500'}`}>/mo</span>
                  </div>
                </div>

                <dl className="space-y-3">
                  {plan.items.map((item) => (
                    <div key={item.label} className="flex items-start justify-between gap-4 text-sm">
                      <dt className={plan.winner ? 'text-neutral-300' : 'text-neutral-600'}>{item.label}</dt>
                      <dd className="inline-flex items-start gap-1.5 font-medium tabular-nums text-right shrink-0">
                        {item.included ? (
                          <Check
                            className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${plan.winner ? 'text-emerald-400' : 'text-neutral-900'}`}
                            aria-hidden="true"
                          />
                        ) : (
                          <Minus className="w-3.5 h-3.5 shrink-0 mt-0.5 text-neutral-400" aria-hidden="true" />
                        )}
                        <span className="whitespace-nowrap">{item.value}</span>
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
