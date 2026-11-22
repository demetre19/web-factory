import { useState } from 'react';
import { Check } from 'lucide-react';
import { calculateAnnualSavings } from '../../utils/pricingHelpers';

/* ============================================================================
   Pricing5 — 2-Tier Toggle Monthly / Annual · Minimal / Professional (LedgerBooks)
   ============================================================================ */
export function Pricing5() {
  const [cadence, setCadence] = useState<'monthly' | 'annual'>('annual');
  const [selected, setSelected] = useState<string | null>(null);

  const soloSavings = calculateAnnualSavings(24, 19);
  const practiceSavings = calculateAnnualSavings(68, 54);

  const plans = [
    {
      name: 'Solo Practice',
      desc: 'Freelancers, consultants, and sole proprietors',
      price: cadence === 'annual' ? 19 : 24,
      savings: soloSavings,
      cta: 'Start Solo free for 14 days',
      features: [
        'Unlimited client invoices & recurring bills',
        'Automated bank feed reconciliation (2 accounts)',
        'Quarterly tax estimate worksheet',
        'Receipt OCR scanning up to 150 / mo',
      ],
    },
    {
      name: 'Accounting Team',
      desc: 'Small firms and multi-entity finance teams',
      price: cadence === 'annual' ? 54 : 68,
      savings: practiceSavings,
      cta: 'Start Team free for 14 days',
      features: [
        'Everything in Solo plus multi-currency ledgers',
        'Up to 12 bank & credit card connections',
        'Approval workflows for bills & reimbursements',
        'Dedicated accountant portal & audit trail',
      ],
    },
  ];

  return (
    <section aria-labelledby="p5-heading" className="bg-slate-50 py-16 px-6 sm:px-10 text-slate-900">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            LedgerBooks Cloud Accounting
          </p>
          <h2
            id="p5-heading"
            className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 [text-wrap:balance]"
          >
            Two straightforward plans for clean books
          </h2>

          <div className="mt-6 inline-flex items-center p-1 bg-slate-200/70 rounded-lg">
            <button
              type="button"
              onClick={() => setCadence('monthly')}
              aria-pressed={cadence === 'monthly'}
              className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                cadence === 'monthly'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pay Monthly
            </button>
            <button
              type="button"
              onClick={() => setCadence('annual')}
              aria-pressed={cadence === 'annual'}
              className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                cadence === 'annual'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pay Annually · Save up to 21%
            </button>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="flex flex-col justify-between bg-white border border-slate-200 rounded-xl p-8"
            >
              <div>
                <h3 className="text-xl font-semibold text-slate-900">{plan.name}</h3>
                <p className="mt-1 text-sm text-slate-600">{plan.desc}</p>

                <div className="mt-6 pb-6 border-b border-slate-100">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-bold tracking-tight tabular-nums">
                      ${plan.price}
                    </span>
                    <span className="text-sm text-slate-500">/ month</span>
                  </div>
                  <p className="mt-1.5 text-xs font-medium text-emerald-700 tabular-nums">
                    {cadence === 'annual'
                      ? `Billed $${plan.savings.annualTotal}/yr — saves $${plan.savings.savingsDollars}/yr`
                      : 'Switch to annual anytime to save 21%'}
                  </p>
                </div>

                <ul className="mt-6 space-y-3 text-sm text-slate-700">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 mt-0.5 shrink-0 text-slate-900" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => setSelected(`${plan.name} (${cadence}, $${plan.price}/mo)`)}
                className="mt-8 w-full py-2.5 px-4 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors whitespace-nowrap"
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {selected && (
          <p
            role="status"
            className="mt-6 text-sm text-slate-700 bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-center"
          >
            Trial initialized for <strong className="font-semibold">{selected}</strong>
          </p>
        )}
      </div>
    </section>
  );
}

/* ============================================================================
   Pricing6 — 2-Tier Toggle Monthly / Annual · Dark (VaultGuard Security)
   ============================================================================ */
export function Pricing6() {
  const [annual, setAnnual] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  const tiers = [
    {
      name: 'Team Vault',
      price: annual ? 12 : 16,
      unit: 'per seat / month',
      summary: 'Hardware-backed secrets & passkey management for engineering groups.',
      cta: 'Activate Team Vault',
      highlight: false,
      features: [
        'Unlimited encrypted credential vaults',
        'FIDO2 / WebAuthn hardware key enforcement',
        'CLI secrets injection for local & CI builds',
        '180-day immutable access logs',
      ],
    },
    {
      name: 'Compliance Core',
      price: annual ? 28 : 35,
      unit: 'per seat / month',
      summary: 'Zero-trust device posture and automated SOC 2 evidence collection.',
      cta: 'Activate Compliance Core',
      highlight: true,
      features: [
        'Everything in Team Vault plus SAML SSO',
        'SCIM directory provisioning (Okta, Entra)',
        'SIEM log streaming to Splunk & Datadog',
        'Automated quarterly access review exports',
      ],
    },
  ];

  return (
    <section aria-labelledby="p6-heading" className="bg-[#111318] py-16 px-6 sm:px-10 text-zinc-100">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-emerald-400">
              VaultGuard Zero-Trust
            </p>
            <h2
              id="p6-heading"
              className="mt-2 text-3xl font-semibold tracking-tight text-white [text-wrap:balance]"
            >
              Per-seat security that scales cleanly
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-xs font-medium ${!annual ? 'text-white' : 'text-zinc-400'}`}>
              Monthly
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={annual}
              aria-label="Toggle annual billing"
              onClick={() => setAnnual((v) => !v)}
              className={`relative inline-flex h-7 w-13 items-center rounded-md transition-colors p-1 ${
                annual ? 'bg-emerald-500' : 'bg-zinc-700'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 rounded-sm bg-zinc-950 transition-transform ${
                  annual ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-xs font-medium ${annual ? 'text-white' : 'text-zinc-400'}`}>
              Annual (-20%)
            </span>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`flex flex-col justify-between rounded-xl p-8 ${
                tier.highlight
                  ? 'bg-[#171B22] border border-emerald-500/60'
                  : 'bg-[#15181E] border border-zinc-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white">{tier.name}</h3>
                  {tier.highlight && (
                    <span className="text-[11px] font-mono uppercase px-2 py-0.5 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-sm">
                      SOC 2 Ready
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm text-zinc-400">{tier.summary}</p>

                <div className="mt-6 flex items-baseline gap-2">
                  <span className="text-4xl font-bold font-mono text-white tabular-nums">
                    ${tier.price}
                  </span>
                  <span className="text-xs text-zinc-400">{tier.unit}</span>
                </div>

                <ul className="mt-7 space-y-3 text-sm text-zinc-300">
                  {tier.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 mt-0.5 shrink-0 text-emerald-400" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => setSelected(`${tier.name} at $${tier.price}/seat/mo`)}
                className={`mt-8 w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${
                  tier.highlight
                    ? 'bg-emerald-500 text-zinc-950 hover:bg-emerald-400'
                    : 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700'
                }`}
              >
                {tier.cta}
              </button>
            </div>
          ))}
        </div>

        {selected && (
          <p
            role="status"
            className="mt-6 text-sm text-emerald-200 bg-emerald-950/50 border border-emerald-800 rounded-lg px-4 py-2.5"
          >
            VaultGuard workspace prepared: <strong className="text-white">{selected}</strong>
          </p>
        )}
      </div>
    </section>
  );
}

/* ============================================================================
   Pricing7 — 2-Tier Toggle Monthly / Annual · Light-Warm (Hearth Bakery POS)
   ============================================================================ */
export function Pricing7() {
  const [yearly, setYearly] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const plans = [
    {
      name: 'Single Counter',
      desc: 'Independent cafes, bakeries, and tasting rooms',
      price: yearly ? 49 : 59,
      cta: 'Choose Single Counter',
      features: [
        '1 countertop iPad register + offline mode',
        'Pre-order pickup windows & SMS alerts',
        'Ingredient batch costing & waste log',
        '2.5% + 10¢ flat card-present processing',
      ],
    },
    {
      name: 'Multi-Shop Kitchen',
      desc: 'Central commissaries supplying 2–10 storefronts',
      price: yearly ? 119 : 145,
      cta: 'Choose Multi-Shop',
      features: [
        'Up to 6 registers across storefronts',
        'Morning bake sheet sync from POS orders',
        'Unified loyalty cards & gift balances',
        'Custom wholesale B2B invoicing module',
      ],
    },
  ];

  return (
    <section aria-labelledby="p7-heading" className="bg-[#FAF6F0] py-16 px-6 sm:px-10 text-[#2B2118]">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-8 border-b border-[#E6DDD0]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#8C5828]">
              Hearth Point of Sale
            </p>
            <h2
              id="p7-heading"
              className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight [font-family:var(--font-serif)] [text-wrap:balance]"
            >
              Hardware-friendly POS without long contracts
            </h2>
          </div>

          <div className="inline-flex rounded-lg bg-[#EFE7DB] p-1 border border-[#DDD1BF] self-start">
            <button
              type="button"
              onClick={() => setYearly(false)}
              className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                !yearly ? 'bg-[#FCFBF8] text-[#2B2118] shadow-xs' : 'text-[#6D5D4E]'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setYearly(true)}
              className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                yearly ? 'bg-[#FCFBF8] text-[#2B2118] shadow-xs' : 'text-[#6D5D4E]'
              }`}
            >
              Yearly (2 months free)
            </button>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
          {plans.map((plan, idx) => (
            <div
              key={plan.name}
              className={`flex flex-col justify-between rounded-xl p-8 ${
                idx === 1
                  ? 'bg-[#F3ECE0] border border-[#CBB99F]'
                  : 'bg-[#FFFDF9] border border-[#E6DDD0]'
              }`}
            >
              <div>
                <h3 className="text-xl font-semibold [font-family:var(--font-serif)]">
                  {plan.name}
                </h3>
                <p className="mt-1.5 text-sm text-[#6B5D50]">{plan.desc}</p>

                <div className="mt-6 flex items-baseline gap-1.5">
                  <span className="text-4xl font-semibold tabular-nums [font-family:var(--font-serif)]">
                    ${plan.price}
                  </span>
                  <span className="text-sm text-[#6B5D50]">/ location / mo</span>
                </div>

                <ul className="mt-7 space-y-3 text-sm text-[#3F342A]">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 mt-0.5 shrink-0 text-[#8C5828]" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelected(`${plan.name} (${yearly ? 'Yearly' : 'Monthly'} — $${plan.price}/mo)`)
                }
                className={`mt-8 w-full py-2.5 px-4 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  idx === 1
                    ? 'bg-[#8C5828] text-white hover:bg-[#75481F]'
                    : 'bg-[#2B2118] text-white hover:bg-[#413326]'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {selected && (
          <p
            role="status"
            className="mt-6 text-sm text-[#2B2118] bg-[#EFE7DB] border border-[#D4C4AE] rounded-lg px-4 py-2.5"
          >
            Selected Hearth plan: <strong className="font-semibold">{selected}</strong>
          </p>
        )}
      </div>
    </section>
  );
}

/* ============================================================================
   Pricing8 — 2-Tier Toggle Monthly / Annual · Bold / Colourful (WaveCast)
   ============================================================================ */
export function Pricing8() {
  const [annual, setAnnual] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  const tiers = [
    {
      name: 'Creator Show',
      price: annual ? 19 : 25,
      cta: 'Launch Your Show',
      cardCls: 'bg-white text-slate-950',
      btnCls: 'bg-violet-900 text-white hover:bg-violet-800',
      features: [
        'Unlimited lossless audio episodes',
        'Dynamic intro & sponsor slot insertion',
        'Apple, Spotify & YouTube auto-distribution',
        '50,000 monthly downloads included',
      ],
    },
    {
      name: 'Podcast Network',
      price: annual ? 69 : 89,
      cta: 'Launch Network Plan',
      cardCls: 'bg-amber-300 text-slate-950',
      btnCls: 'bg-slate-950 text-white hover:bg-slate-800',
      features: [
        'Up to 10 distinct shows under 1 brand',
        'Private member-only RSS feeds',
        'Automated multi-speaker transcript & chapters',
        '500,000 monthly downloads included',
      ],
    },
  ];

  return (
    <section aria-labelledby="p8-heading" className="bg-violet-900 py-16 px-6 sm:px-10 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-300">
            WaveCast Studio Hosting
          </p>
          <h2
            id="p8-heading"
            className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-white [text-wrap:balance]"
          >
            Broadcast studio hosting built for shows that stick
          </h2>

          <div className="mt-7 inline-flex items-center p-1 bg-violet-950/70 rounded-lg border border-violet-700">
            <button
              type="button"
              onClick={() => setAnnual(false)}
              className={`px-4 py-2 text-xs font-bold rounded-md transition-colors whitespace-nowrap ${
                !annual ? 'bg-amber-300 text-slate-950' : 'text-violet-200 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setAnnual(true)}
              className={`px-4 py-2 text-xs font-bold rounded-md transition-colors whitespace-nowrap ${
                annual ? 'bg-amber-300 text-slate-950' : 'text-violet-200 hover:text-white'
              }`}
            >
              Annual (Save 24%)
            </button>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`flex flex-col justify-between rounded-xl p-8 border-2 border-slate-950 ${tier.cardCls}`}
            >
              <div>
                <h3 className="text-2xl font-extrabold">{tier.name}</h3>
                <div className="mt-4 flex items-baseline gap-1.5">
                  <span className="text-5xl font-extrabold tabular-nums">${tier.price}</span>
                  <span className="text-sm font-semibold text-slate-700">/ month</span>
                </div>

                <ul className="mt-7 space-y-3 text-sm font-medium">
                  {tier.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 mt-0.5 shrink-0 text-violet-800" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => setSelected(`${tier.name} ($${tier.price}/mo)`)}
                className={`mt-8 w-full py-3 px-4 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${tier.btnCls}`}
              >
                {tier.cta}
              </button>
            </div>
          ))}
        </div>

        {selected && (
          <p
            role="status"
            className="mt-6 text-sm font-semibold text-slate-950 bg-amber-200 rounded-lg px-4 py-2.5 text-center"
          >
            WaveCast plan ready: {selected}
          </p>
        )}
      </div>
    </section>
  );
}
