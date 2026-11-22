import { useState } from 'react';
import { Check } from 'lucide-react';

/* ============================================================================
   Pricing33 — Cards with Badges (Popular / Best Value) · Minimal (FormPilot)
   ============================================================================ */
export function Pricing33() {
  const [selected, setSelected] = useState<string | null>(null);

  const tiers = [
    {
      name: 'Basic Forms',
      badge: null,
      price: '$19',
      desc: 'Simple intake forms for solo practitioners',
      cta: 'Choose Basic',
      features: ['1,000 submissions / mo', 'Conditional logic branching', 'Email & Webhook alerts'],
    },
    {
      name: 'Pro Survey',
      badge: 'Popular',
      price: '$45',
      desc: 'Custom domains & payment-enabled flows',
      cta: 'Choose Pro Survey',
      features: ['25,000 submissions / mo', 'Stripe checkout inside forms', 'Remove FormPilot branding'],
    },
    {
      name: 'Annual Growth Pack',
      badge: 'Best Value',
      price: '$79',
      desc: 'Team workspaces billed yearly (save 32%)',
      cta: 'Choose Annual Pack',
      features: ['150,000 submissions / mo', '10 team seats & audit logs', 'HIPAA BAA & partial saves'],
    },
  ];

  return (
    <section aria-labelledby="p33-heading" className="bg-white py-16 px-6 sm:px-10 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            FormPilot Intake Engine
          </p>
          <h2 id="p33-heading" className="mt-2 text-3xl font-semibold tracking-tight [text-wrap:balance]">
            High-completion forms for product & ops teams
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`relative flex flex-col justify-between rounded-xl p-7 border ${
                t.badge === 'Popular'
                  ? 'border-slate-900 bg-slate-50/70'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 min-h-[26px]">
                  <h3 className="text-lg font-semibold">{t.name}</h3>
                  {t.badge && (
                    <span
                      className={`text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-sm ${
                        t.badge === 'Popular'
                          ? 'bg-slate-900 text-white'
                          : 'bg-emerald-700 text-white'
                      }`}
                    >
                      {t.badge}
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-sm text-slate-600">{t.desc}</p>
                <div className="mt-6 text-4xl font-bold tabular-nums">
                  {t.price}
                  <span className="text-sm font-normal text-slate-500"> / mo</span>
                </div>
                <ul className="mt-6 space-y-2.5 text-sm text-slate-700">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="w-4 h-4 mt-0.5 shrink-0 text-slate-900" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => setSelected(`${t.name} (${t.price}/mo)`)}
                className={`mt-8 w-full py-2.5 px-4 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  t.badge === 'Popular'
                    ? 'bg-slate-900 text-white hover:bg-slate-800'
                    : 'bg-white border border-slate-300 text-slate-900 hover:bg-slate-100'
                }`}
              >
                {t.cta}
              </button>
            </div>
          ))}
        </div>

        {selected && (
          <p role="status" className="mt-6 text-sm text-slate-700 bg-slate-100 rounded-lg px-4 py-2.5">
            Selected FormPilot plan: <strong className="font-semibold">{selected}</strong>
          </p>
        )}
      </div>
    </section>
  );
}

/* ============================================================================
   Pricing34 — Cards with Badges (Popular / Best Value) · Dark (SynthLab Cloud)
   ============================================================================ */
export function Pricing34() {
  const [selected, setSelected] = useState<string | null>(null);

  const plans = [
    {
      name: 'Bedroom Producer',
      badge: null,
      price: '$12',
      cta: 'Start Producer',
      features: ['50 GB lossless stem cloud', '24-bit WAV mastering presets', '2 collaborator shares'],
    },
    {
      name: 'Mixing Suite',
      badge: 'Most Popular',
      price: '$29',
      cta: 'Start Mixing Suite',
      features: ['500 GB stem vault', 'Low-latency remote DAW monitor', '15 collaborator seats'],
    },
    {
      name: 'Label Annual',
      badge: 'Best Value',
      price: '$54',
      cta: 'Start Label Annual',
      features: ['4 TB archival catalog vault', 'ISRC & split-sheet automation', 'Unlimited label artists'],
    },
  ];

  return (
    <section aria-labelledby="p34-heading" className="bg-[#0B0D12] py-16 px-6 sm:px-10 text-zinc-100">
      <div className="mx-auto max-w-6xl">
        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-amber-400">
            SynthLab Audio Cloud
          </p>
          <h2 id="p34-heading" className="mt-2 text-3xl font-semibold text-white">
            Cloud stem storage & remote mixing rooms
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`flex flex-col justify-between rounded-xl p-7 border ${
                p.badge === 'Most Popular'
                  ? 'bg-[#151A24] border-sky-400'
                  : p.badge === 'Best Value'
                    ? 'bg-[#171510] border-amber-400/70'
                    : 'bg-[#12151C] border-zinc-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 min-h-[26px]">
                  <h3 className="text-lg font-semibold text-white">{p.name}</h3>
                  {p.badge && (
                    <span
                      className={`text-[11px] font-mono uppercase px-2 py-0.5 rounded-sm font-semibold ${
                        p.badge === 'Most Popular'
                          ? 'bg-sky-400 text-slate-950'
                          : 'bg-amber-400 text-slate-950'
                      }`}
                    >
                      {p.badge}
                    </span>
                  )}
                </div>

                <div className="mt-5 text-4xl font-mono font-bold text-white tabular-nums">
                  {p.price}
                  <span className="text-xs font-normal text-zinc-400"> / mo</span>
                </div>

                <ul className="mt-6 space-y-2.5 text-sm text-zinc-300">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="w-4 h-4 mt-0.5 shrink-0 text-amber-400" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => setSelected(`${p.name} (${p.price}/mo)`)}
                className="mt-8 w-full py-2.5 px-4 rounded-lg bg-white text-zinc-950 text-sm font-semibold hover:bg-zinc-200 transition-colors whitespace-nowrap"
              >
                {p.cta}
              </button>
            </div>
          ))}
        </div>

        {selected && (
          <p role="status" className="mt-6 text-sm font-mono text-amber-200 bg-amber-950/40 border border-amber-800 rounded-lg px-4 py-2.5">
            Audio workspace created: {selected}
          </p>
        )}
      </div>
    </section>
  );
}

/* ============================================================================
   Pricing35 — Cards with Badges · Light-Warm (Oakwood Coworking)
   ============================================================================ */
export function Pricing35() {
  const [selected, setSelected] = useState<string | null>(null);

  const passes = [
    {
      name: 'Open Lounge Pass',
      badge: null,
      price: '$180',
      cta: 'Reserve Lounge Pass',
      perks: ['10 day visits per month', '1 Gbps fiber Wi-Fi & espresso bar', '2 hrs conference room credit'],
    },
    {
      name: 'Dedicated Desk',
      badge: 'Most Popular',
      price: '$410',
      cta: 'Claim Dedicated Desk',
      perks: ['24/7 keycard access + locker', 'Ergonomic Steelcase workstation', '10 hrs conference room credit'],
    },
    {
      name: '4-Person Studio',
      badge: 'Best Value',
      price: '$1,280',
      cta: 'Tour Private Studio',
      perks: ['Lockable glass-front suite', 'Mail handling & registered address', '25 hrs boardroom credit'],
    },
  ];

  return (
    <section aria-labelledby="p35-heading" className="bg-[#F8F5EE] py-16 px-6 sm:px-10 text-[#26211A]">
      <div className="mx-auto max-w-6xl">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#6E604C]">
            Oakwood House Coworking
          </p>
          <h2
            id="p35-heading"
            className="mt-2 text-3xl font-semibold [font-family:var(--font-serif)]"
          >
            Quiet daylight studios & flexible memberships
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {passes.map((pass) => (
            <div
              key={pass.name}
              className="flex flex-col justify-between rounded-xl bg-[#FFFDF9] border border-[#DDD4C4] overflow-hidden"
            >
              <div>
                {pass.badge ? (
                  <div
                    className={`px-6 py-2 text-xs font-semibold uppercase tracking-wider ${
                      pass.badge === 'Most Popular'
                        ? 'bg-[#6E4E2E] text-white'
                        : 'bg-[#3D5A40] text-white'
                    }`}
                  >
                    {pass.badge}
                  </div>
                ) : (
                  <div className="px-6 py-2 text-xs font-semibold uppercase tracking-wider bg-[#EFE8DA] text-[#6E604C]">
                    Flexible Entry
                  </div>
                )}

                <div className="p-7">
                  <h3 className="text-xl font-semibold [font-family:var(--font-serif)]">{pass.name}</h3>
                  <div className="mt-3 text-3xl font-semibold tabular-nums [font-family:var(--font-serif)]">
                    {pass.price}
                    <span className="text-sm font-sans font-normal text-[#6B5F4E]"> / mo</span>
                  </div>
                  <ul className="mt-6 space-y-2.5 text-sm text-[#423A2E]">
                    {pass.perks.map((perk) => (
                      <li key={perk} className="flex items-start gap-2">
                        <Check className="w-4 h-4 mt-0.5 shrink-0 text-[#6E4E2E]" />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="px-7 pb-7">
                <button
                  type="button"
                  onClick={() => setSelected(`${pass.name} (${pass.price}/mo)`)}
                  className="w-full py-2.5 px-4 rounded-lg bg-[#26211A] text-white text-sm font-medium hover:bg-[#3B3328] transition-colors whitespace-nowrap"
                >
                  {pass.cta}
                </button>
              </div>
            </div>
          ))}
        </div>

        {selected && (
          <p role="status" className="mt-6 text-sm text-[#26211A] bg-[#EAE2D3] rounded-lg px-4 py-2.5">
            Tour request logged for <strong className="font-semibold">{selected}</strong>
          </p>
        )}
      </div>
    </section>
  );
}

/* ============================================================================
   Pricing36 — Cards with Badges · Bold / Colourful (PixelSprint Creative)
   ============================================================================ */
export function Pricing36() {
  const [selected, setSelected] = useState<string | null>(null);

  const retainers = [
    {
      name: 'Landing Refresh',
      badge: null,
      price: '$1,800',
      bg: 'bg-white',
      cta: 'Book Refresh',
      items: ['1 high-converting product page', 'Figma + Tailwind React handoff', '5-business-day delivery'],
    },
    {
      name: 'Monthly Design Sprint',
      badge: 'Popular',
      price: '$3,900',
      bg: 'bg-amber-200',
      cta: 'Start Design Sprint',
      items: ['1 active request at a time', '48-hour design & code turnaround', 'Unlimited brand revisions'],
    },
    {
      name: 'Quarterly Product Partner',
      badge: 'Best Value',
      price: '$9,600',
      bg: 'bg-cyan-200',
      cta: 'Lock Quarterly Rate',
      items: ['2 parallel design & frontend streams', 'Weekly Slack & Loom roadmap sync', 'Saves $2,100 vs monthly'],
    },
  ];

  return (
    <section aria-labelledby="p36-heading" className="bg-slate-950 py-16 px-6 sm:px-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-xl">
          <p className="text-xs font-extrabold uppercase tracking-widest text-amber-300">
            PixelSprint Product Studio
          </p>
          <h2 id="p36-heading" className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight">
            Fixed-scope design & frontend retainers
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {retainers.map((r) => (
            <div
              key={r.name}
              className={`flex flex-col justify-between rounded-xl p-8 text-slate-950 border-2 border-slate-950 ${r.bg}`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 min-h-[28px]">
                  <h3 className="text-xl font-extrabold">{r.name}</h3>
                  {r.badge && (
                    <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 bg-slate-950 text-white rounded-sm">
                      {r.badge}
                    </span>
                  )}
                </div>
                <div className="mt-4 text-4xl font-extrabold tabular-nums">{r.price}</div>
                <ul className="mt-6 space-y-2.5 text-sm font-semibold">
                  {r.items.map((it) => (
                    <li key={it} className="flex items-start gap-2">
                      <Check className="w-4 h-4 mt-0.5 shrink-0 text-slate-950" />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => setSelected(`${r.name} (${r.price})`)}
                className="mt-8 w-full py-3 px-4 rounded-lg bg-slate-950 text-white text-sm font-bold hover:bg-slate-800 transition-colors whitespace-nowrap"
              >
                {r.cta}
              </button>
            </div>
          ))}
        </div>

        {selected && (
          <p role="status" className="mt-6 text-sm font-bold text-slate-950 bg-amber-300 rounded-lg px-4 py-2.5">
            Retainer inquiry opened: {selected}
          </p>
        )}
      </div>
    </section>
  );
}
