import { useState } from 'react';
import { Check, ArrowRight } from 'lucide-react';

/* ============================================================================
   Pricing1 — 3-Tier Featured Middle · Minimal / Professional (MetricFlow)
   ============================================================================ */
export function Pricing1() {
  const [annual, setAnnual] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  const plans = [
    {
      name: 'Starter',
      audience: 'For early-stage product teams',
      monthly: 29,
      annual: 24,
      cta: 'Start Starter trial',
      featured: false,
      features: [
        'Up to 100,000 tracked events / mo',
        '3 team member seats included',
        '90-day funnel & retention history',
        'CSV export and Slack weekly digest',
      ],
    },
    {
      name: 'Growth',
      audience: 'For scaling SaaS & commerce squads',
      monthly: 89,
      annual: 72,
      cta: 'Choose Growth plan',
      featured: true,
      features: [
        'Up to 2,500,000 tracked events / mo',
        '15 team seats with role permissions',
        '24-month cohort & LTV analysis',
        'Warehouse sync to BigQuery & Snowflake',
        'Priority email & live chat support',
      ],
    },
    {
      name: 'Scale',
      audience: 'For multi-product organizations',
      monthly: 249,
      annual: 199,
      cta: 'Contact sales team',
      featured: false,
      features: [
        '25,000,000+ tracked events / mo',
        'Unlimited seats & SSO (SAML 2.0)',
        'Unlimited retention & raw event stream',
        'Dedicated solutions architect & 99.95% SLA',
      ],
    },
  ];

  return (
    <section aria-labelledby="p1-heading" className="bg-white py-16 px-6 sm:px-10 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-slate-200">
          <div className="max-w-xl">
            <p className="text-xs font-semibold tracking-wider uppercase text-slate-500">
              MetricFlow Analytics
            </p>
            <h2
              id="p1-heading"
              className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 [text-wrap:balance]"
            >
              Predictable event pricing as your product grows
            </h2>
          </div>

          <div className="inline-flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200 self-start">
            <button
              type="button"
              onClick={() => setAnnual(false)}
              className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                !annual ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly billing
            </button>
            <button
              type="button"
              onClick={() => setAnnual(true)}
              className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                annual ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Annual (save 19%)
            </button>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan) => {
            const price = annual ? plan.annual : plan.monthly;
            return (
              <div
                key={plan.name}
                className={`flex flex-col justify-between rounded-xl p-8 transition-colors ${
                  plan.featured
                    ? 'bg-slate-900 text-white border border-slate-900 lg:-my-3 lg:py-11'
                    : 'bg-white text-slate-900 border border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                    {plan.featured && (
                      <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 bg-slate-700 text-slate-100 rounded-sm">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p
                    className={`mt-1 text-sm ${
                      plan.featured ? 'text-slate-300' : 'text-slate-600'
                    }`}
                  >
                    {plan.audience}
                  </p>

                  <div className="mt-6 flex items-baseline gap-1.5">
                    <span className="text-4xl font-bold tracking-tight tabular-nums">${price}</span>
                    <span
                      className={`text-sm ${plan.featured ? 'text-slate-300' : 'text-slate-500'}`}
                    >
                      / month
                    </span>
                  </div>
                  <p
                    className={`mt-1 text-xs tabular-nums ${
                      plan.featured ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    {annual
                      ? `Billed $${(price * 12).toLocaleString('en-US')} annually`
                      : 'Billed monthly, cancel anytime'}
                  </p>

                  <ul className="mt-8 space-y-3 text-sm">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2.5">
                        <Check
                          className={`w-4 h-4 mt-0.5 shrink-0 ${
                            plan.featured ? 'text-sky-400' : 'text-slate-700'
                          }`}
                        />
                        <span className={plan.featured ? 'text-slate-100' : 'text-slate-700'}>
                          {feat}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => setSelected(`${plan.name} ($${price}/mo)`)}
                  className={`mt-8 w-full py-2.5 px-4 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    plan.featured
                      ? 'bg-white text-slate-900 hover:bg-slate-100'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            );
          })}
        </div>

        {selected && (
          <p
            role="status"
            className="mt-6 text-sm text-slate-700 bg-slate-100 border border-slate-200 rounded-lg px-4 py-2.5"
          >
            Selected MetricFlow plan: <strong className="font-semibold">{selected}</strong>
          </p>
        )}
      </div>
    </section>
  );
}

/* ============================================================================
   Pricing2 — 3-Tier Featured Middle · Dark (Obsidian Cloud Compute)
   ============================================================================ */
export function Pricing2() {
  const [selected, setSelected] = useState<string | null>(null);

  const tiers = [
    {
      name: 'Node Basic',
      spec: '2 vCPU · 4 GB RAM · 80 GB NVMe',
      price: 18,
      featured: false,
      cta: 'Deploy Basic',
      items: [
        '2 TB outbound bandwidth included',
        'Automated daily snapshots (7 days)',
        'Private VPC networking',
        'IPv4 & IPv6 dual-stack address',
      ],
    },
    {
      name: 'Cluster Pro',
      spec: '8 vCPU · 32 GB RAM · 320 GB NVMe',
      price: 76,
      featured: true,
      cta: 'Deploy Cluster Pro',
      items: [
        '10 TB outbound bandwidth included',
        'Hourly snapshots with 30-day point recovery',
        'Managed zero-downtime load balancer',
        'Cross-AZ automated failover',
        '24/7 engineering escalation channel',
      ],
    },
    {
      name: 'Dedicated Metal',
      spec: '32 vCPU · 128 GB RAM · 1.6 TB NVMe',
      price: 290,
      featured: false,
      cta: 'Reserve Bare Metal',
      items: [
        '25 TB outbound bandwidth included',
        'Single-tenant physical isolation',
        'Custom kernel & BGP anycast routing',
        '99.99% hardware replacement SLA',
      ],
    },
  ];

  return (
    <section aria-labelledby="p2-heading" className="bg-[#0B0F17] py-16 px-6 sm:px-10 text-slate-100">
      <div className="mx-auto max-w-6xl">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs font-mono uppercase tracking-widest text-sky-400">
            Obsidian Cloud Infrastructure
          </p>
          <h2
            id="p2-heading"
            className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight text-white [text-wrap:balance]"
          >
            Dedicated compute without egress surprises
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-400">
            Provision NVMe nodes in 14 global regions with predictable flat monthly rates.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`flex flex-col justify-between rounded-xl p-7 ${
                tier.featured
                  ? 'bg-[#131B2B] border-2 border-sky-500 shadow-lg shadow-sky-950/30'
                  : 'bg-[#101623] border border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold text-white">{tier.name}</h3>
                  {tier.featured && (
                    <span className="text-[11px] font-mono uppercase px-2 py-0.5 bg-sky-500/20 text-sky-300 border border-sky-500/40 rounded-sm">
                      Production Pick
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-xs font-mono text-slate-400 tabular-nums">{tier.spec}</p>

                <div className="mt-6 pb-6 border-b border-slate-800 flex items-baseline gap-1.5">
                  <span className="text-4xl font-bold text-white tabular-nums">${tier.price}</span>
                  <span className="text-sm text-slate-400">/ month</span>
                </div>

                <ul className="mt-6 space-y-3 text-sm text-slate-300">
                  {tier.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 mt-0.5 shrink-0 text-sky-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => setSelected(`${tier.name} — $${tier.price}/mo`)}
                className={`mt-8 w-full py-2.5 px-4 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  tier.featured
                    ? 'bg-sky-500 text-slate-950 hover:bg-sky-400'
                    : 'bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700'
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
            className="mt-6 text-sm text-sky-200 bg-sky-950/50 border border-sky-800 rounded-lg px-4 py-2.5"
          >
            Provisioning queued for <strong className="font-semibold text-white">{selected}</strong>
          </p>
        )}
      </div>
    </section>
  );
}

/* ============================================================================
   Pricing3 — 3-Tier Featured Middle · Light-Warm (Atelier Editorial Studio)
   ============================================================================ */
export function Pricing3() {
  const [selected, setSelected] = useState<string | null>(null);

  const memberships = [
    {
      name: 'Reader Folio',
      subtitle: 'Independent writers & personal archives',
      price: 14,
      featured: false,
      cta: 'Begin Reader Folio',
      features: [
        '1 custom domain with SSL',
        'Up to 2,500 subscriber emails / mo',
        'Clean serif reading room templates',
        'Full Markdown & RSS syndication',
      ],
    },
    {
      name: 'Publication',
      subtitle: 'Member-supported magazines & collectives',
      price: 42,
      featured: true,
      cta: 'Launch Publication',
      features: [
        '3 custom domains & multi-author bylines',
        'Up to 25,000 subscriber emails / mo',
        'Zero platform cut on paid memberships',
        'Print-ready PDF issue generator',
        'Scheduled edition drops & paywall rules',
      ],
    },
    {
      name: 'Imprint',
      subtitle: 'Established journals & cultural houses',
      price: 118,
      featured: false,
      cta: 'Inquire for Imprint',
      features: [
        'Unlimited domains & editorial desks',
        '150,000 subscriber emails / mo',
        'Dedicated IP reputation management',
        'Concierge archive migration',
      ],
    },
  ];

  return (
    <section aria-labelledby="p3-heading" className="bg-[#F7F4EF] py-16 px-6 sm:px-10 text-[#26211B]">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-xs font-medium tracking-widest uppercase text-[#756A5D]">
            Atelier Publishing Suite
          </p>
          <h2
            id="p3-heading"
            className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight text-[#1E1A15] [font-family:var(--font-serif)] [text-wrap:balance]"
          >
            Quiet tools for enduring independent publications
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {memberships.map((item) => (
            <div
              key={item.name}
              className={`flex flex-col justify-between rounded-xl p-8 ${
                item.featured
                  ? 'bg-[#EAE3D5] border border-[#C6B9A3] lg:-translate-y-2'
                  : 'bg-[#FCFBF8] border border-[#E5DDD0]'
              }`}
            >
              <div>
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="text-xl font-semibold [font-family:var(--font-serif)]">
                    {item.name}
                  </h3>
                  {item.featured && (
                    <span className="text-[11px] font-medium uppercase tracking-wider text-[#5C4930] bg-[#DED3BE] px-2 py-0.5 rounded-sm">
                      Editors&apos; Choice
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-sm text-[#645B50]">{item.subtitle}</p>

                <div className="mt-6 pb-5 border-b border-[#DCD3C4] flex items-baseline gap-1.5">
                  <span className="text-4xl font-semibold tabular-nums [font-family:var(--font-serif)]">
                    ${item.price}
                  </span>
                  <span className="text-sm text-[#645B50]">/ month</span>
                </div>

                <ul className="mt-6 space-y-3 text-sm text-[#3A332B]">
                  {item.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 mt-0.5 shrink-0 text-[#5C4930]" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => setSelected(`${item.name} ($${item.price}/mo)`)}
                className={`mt-8 w-full py-2.5 px-4 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  item.featured
                    ? 'bg-[#26211B] text-[#FAF8F4] hover:bg-[#3A3229]'
                    : 'bg-transparent border border-[#26211B] text-[#26211B] hover:bg-[#26211B] hover:text-[#FAF8F4]'
                }`}
              >
                {item.cta}
              </button>
            </div>
          ))}
        </div>

        {selected && (
          <p
            role="status"
            className="mt-6 text-sm text-[#26211B] bg-[#EAE3D5] border border-[#C6B9A3] rounded-lg px-4 py-2.5"
          >
            Membership selected: <strong className="font-semibold">{selected}</strong>
          </p>
        )}
      </div>
    </section>
  );
}

/* ============================================================================
   Pricing4 — 3-Tier Featured Middle · Bold / Colourful (PulseKit Design System)
   ============================================================================ */
export function Pricing4() {
  const [selected, setSelected] = useState<string | null>(null);

  const plans = [
    {
      name: 'Solo Maker',
      desc: 'Single designer shipping client sites',
      price: 39,
      accentBg: 'bg-amber-50',
      borderCls: 'border-2 border-slate-950',
      btnCls: 'bg-slate-950 text-white hover:bg-slate-800',
      featured: false,
      cta: 'Get Solo License',
      features: [
        '420 Figma & React UI primitives',
        '1 commercial web project',
        'Lifetime access to v3.x updates',
        'Tailwind v4 design tokens',
      ],
    },
    {
      name: 'Studio Team',
      desc: 'Product squads building multi-brand apps',
      price: 129,
      accentBg: 'bg-blue-700 text-white',
      borderCls: 'border-2 border-slate-950 shadow-[6px_6px_0px_0px_#020617]',
      btnCls: 'bg-amber-400 text-slate-950 hover:bg-amber-300',
      featured: true,
      cta: 'Get Studio Team',
      features: [
        'Up to 10 designers & engineers',
        'Unlimited commercial projects',
        'Automated Figma-to-GitHub token sync',
        'Accessible Radix & React 19 patterns',
        'Private Discord channel with maintainers',
      ],
    },
    {
      name: 'Enterprise Org',
      desc: 'Global organizations & design ops',
      price: 349,
      accentBg: 'bg-emerald-50',
      borderCls: 'border-2 border-slate-950',
      btnCls: 'bg-emerald-700 text-white hover:bg-emerald-800',
      featured: false,
      cta: 'License Enterprise',
      features: [
        'Unlimited seats across subsidiaries',
        'Custom white-label theme kit',
        'Vendor security questionnaire & MSA',
        'Quarterly architecture review workshop',
      ],
    },
  ];

  return (
    <section aria-labelledby="p4-heading" className="bg-amber-300/20 py-16 px-6 sm:px-10 text-slate-950">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-700">
              PulseKit UI Architecture
            </p>
            <h2
              id="p4-heading"
              className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950 [text-wrap:balance]"
            >
              Ship faster with crisp component licenses
            </h2>
          </div>
          <p className="text-sm font-medium text-slate-700">One-time seat fee · No hidden royalties</p>
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`flex flex-col justify-between rounded-xl p-8 ${plan.accentBg} ${plan.borderCls}`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  {plan.featured && (
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 bg-amber-400 text-slate-950 rounded-sm">
                      Most Teams
                    </span>
                  )}
                </div>
                <p
                  className={`mt-1.5 text-sm ${
                    plan.featured ? 'text-blue-100' : 'text-slate-700'
                  }`}
                >
                  {plan.desc}
                </p>

                <div className="mt-6 flex items-baseline gap-1.5">
                  <span className="text-4xl font-extrabold tabular-nums">${plan.price}</span>
                  <span className={`text-sm ${plan.featured ? 'text-blue-200' : 'text-slate-600'}`}>
                    / quarter
                  </span>
                </div>

                <ul className="mt-7 space-y-3 text-sm font-medium">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5">
                      <Check
                        className={`w-4 h-4 mt-0.5 shrink-0 ${
                          plan.featured ? 'text-amber-300' : 'text-blue-700'
                        }`}
                      />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => setSelected(`${plan.name} ($${plan.price}/quarter)`)}
                className={`mt-8 w-full py-3 px-4 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2 whitespace-nowrap ${plan.btnCls}`}
              >
                <span>{plan.cta}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {selected && (
          <p
            role="status"
            className="mt-6 text-sm font-semibold text-slate-950 bg-white border-2 border-slate-950 rounded-lg px-4 py-2.5"
          >
            License added to checkout: {selected}
          </p>
        )}
      </div>
    </section>
  );
}
