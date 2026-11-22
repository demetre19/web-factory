import { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

/* ============================================================================
   Pricing25 — Pricing with FAQ Strip · Minimal / Professional (DocuSignet)
   ============================================================================ */
export function Pricing25() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [selected, setSelected] = useState<string | null>(null);

  const faqs = [
    {
      q: 'Are e-signatures legally binding under ESIGN and eIDAS?',
      a: 'Yes. Every completed agreement includes a tamper-evident SHA-256 certificate of completion with IP, timestamp, and signer audit logs.',
    },
    {
      q: 'Can we transfer unused templates or seats when staff changes?',
      a: 'Yes. Reassign seats anytime from your organization console at zero extra fee; signed contracts remain archived permanently.',
    },
    {
      q: 'What happens if we exceed our monthly envelope limit?',
      a: 'You can keep sending without interruption at $1.25 per extra envelope, or upgrade mid-cycle with prorated credit.',
    },
  ];

  return (
    <section aria-labelledby="p25-heading" className="bg-slate-50 py-16 px-6 sm:px-10 text-slate-900">
      <div className="mx-auto max-w-5xl">
        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            DocuSignet Agreements
          </p>
          <h2 id="p25-heading" className="mt-2 text-3xl font-semibold tracking-tight [text-wrap:balance]">
            Simple contract workflows with clear billing answers
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              name: 'Standard',
              price: '$28',
              desc: 'Consultancies and independent legal teams',
              cta: 'Start Standard',
              items: [
                '50 signature envelopes / month',
                '10 reusable contract templates',
                'Automated 7-day signer reminders',
              ],
            },
            {
              name: 'Business Pro',
              price: '$64',
              desc: 'Sales & HR departments with bulk sends',
              cta: 'Start Business Pro',
              items: [
                'Unlimited signature envelopes',
                'Bulk CSV mail-merge & payment collection',
                'HubSpot, Salesforce & Google Drive sync',
              ],
            },
          ].map((tier) => (
            <div
              key={tier.name}
              className="bg-white border border-slate-200 rounded-xl p-8 flex flex-col justify-between"
            >
              <div>
                <h3 className="text-xl font-semibold">{tier.name}</h3>
                <p className="mt-1 text-sm text-slate-600">{tier.desc}</p>
                <div className="mt-5 text-4xl font-bold tabular-nums">
                  {tier.price}
                  <span className="text-sm font-normal text-slate-500"> / mo</span>
                </div>
                <ul className="mt-6 space-y-2.5 text-sm text-slate-700">
                  {tier.items.map((it) => (
                    <li key={it} className="flex items-start gap-2">
                      <Check className="w-4 h-4 mt-0.5 shrink-0 text-slate-900" />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                type="button"
                onClick={() => setSelected(`${tier.name} (${tier.price}/mo)`)}
                className="mt-7 w-full py-2.5 px-4 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors whitespace-nowrap"
              >
                {tier.cta}
              </button>
            </div>
          ))}
        </div>

        {selected && (
          <p role="status" className="mt-5 text-sm text-slate-700 bg-white border border-slate-200 rounded-lg px-4 py-2.5">
            Selected plan: <strong className="font-semibold">{selected}</strong>
          </p>
        )}

        <div className="mt-10 pt-8 border-t border-slate-200">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Billing & Compliance FAQ
          </h3>
          <div className="mt-4 divide-y divide-slate-200 bg-white border border-slate-200 rounded-xl">
            {faqs.map((faq, i) => {
              const isOpen = openIdx === i;
              return (
                <div key={faq.q}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenIdx(isOpen ? null : i)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 text-sm font-semibold text-slate-900 hover:bg-slate-50 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 shrink-0 text-slate-500 transition-transform ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && <p className="px-6 pb-4 text-sm text-slate-600">{faq.a}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
   Pricing26 — Pricing with FAQ Strip · Dark (ZeroTrust VPN)
   ============================================================================ */
export function Pricing26() {
  const [openFaq, setOpenFaq] = useState<number>(0);
  const [selected, setSelected] = useState<string | null>(null);

  const plans = [
    { name: 'Solo Tunnel', price: '$9', devices: '5 WireGuard devices', cta: 'Get Solo' },
    { name: 'Team Mesh', price: '$16', devices: '25 devices + split DNS', cta: 'Get Team Mesh' },
    { name: 'Org Gateway', price: '$32', devices: 'Unlimited + dedicated IPs', cta: 'Get Org Gateway' },
  ];

  const faqs = [
    {
      q: 'Do you log DNS queries or traffic metadata?',
      a: 'Never. All relay nodes operate in RAM-only diskless mode with annual third-party no-logs audits.',
    },
    {
      q: 'Can we switch between monthly and annual invoicing?',
      a: 'Yes, invoice cadence and seat counts can be adjusted at any renewal boundary.',
    },
    {
      q: 'What throughput speeds are supported?',
      a: 'Every WireGuard gateway runs on 10 Gbps unmetered ports with multi-hop support.',
    },
    {
      q: 'Do you accept wire transfer or POs?',
      a: 'Annual Org Gateway contracts over $1,500 support net-30 ACH, wire, and purchase orders.',
    },
  ];

  return (
    <section aria-labelledby="p26-heading" className="bg-[#0D1117] py-16 px-6 sm:px-10 text-slate-100">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-xl">
          <p className="text-xs font-mono uppercase tracking-widest text-sky-400">
            ZeroTrust WireGuard Mesh
          </p>
          <h2 id="p26-heading" className="mt-2 text-3xl font-semibold text-white">
            Private network pricing & technical FAQ
          </h2>
        </div>

        <div className="mt-9 grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((p, idx) => (
            <div
              key={p.name}
              className={`rounded-xl p-7 border ${
                idx === 1 ? 'bg-[#161E2B] border-sky-500/60' : 'bg-[#131822] border-slate-800'
              }`}
            >
              <h3 className="text-lg font-semibold text-white">{p.name}</h3>
              <div className="mt-3 text-3xl font-mono font-bold text-white tabular-nums">
                {p.price}
                <span className="text-xs font-normal text-slate-400"> / mo</span>
              </div>
              <p className="mt-2 text-sm text-slate-400">{p.devices}</p>
              <button
                type="button"
                onClick={() => setSelected(`${p.name} (${p.price}/mo)`)}
                className={`mt-6 w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${
                  idx === 1
                    ? 'bg-sky-500 text-slate-950 hover:bg-sky-400'
                    : 'bg-slate-800 text-white hover:bg-slate-700'
                }`}
              >
                {p.cta}
              </button>
            </div>
          ))}
        </div>

        {selected && (
          <p role="status" className="mt-5 text-sm font-mono text-sky-200 bg-sky-950/50 border border-sky-800 rounded-lg px-4 py-2.5">
            Mesh subscription selected: {selected}
          </p>
        )}

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4 pt-8 border-t border-slate-800">
          {faqs.map((f, idx) => (
            <button
              key={f.q}
              type="button"
              aria-expanded={openFaq === idx}
              onClick={() => setOpenFaq(idx)}
              className="text-left rounded-xl bg-[#131822] border border-slate-800 p-5 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between gap-2 text-sm font-semibold text-white">
                <span>{f.q}</span>
                <ChevronDown
                  className={`w-4 h-4 shrink-0 text-slate-400 transition-transform ${
                    openFaq === idx ? 'rotate-180' : ''
                  }`}
                />
              </div>
              {openFaq === idx && <p className="mt-2.5 text-sm text-slate-400">{f.a}</p>}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
   Pricing27 — Pricing with FAQ Strip · Light-Warm (Botanica CSA Box)
   ============================================================================ */
export function Pricing27() {
  const [open, setOpen] = useState<number | null>(0);
  const [selected, setSelected] = useState<string | null>(null);

  const questions = [
    {
      q: 'Can I pause a harvest box while traveling?',
      a: 'Pause any upcoming Tuesday or Friday harvest box up to 48 hours before packing with zero penalty.',
    },
    {
      q: 'How do swaps for allergies or dislikes work?',
      a: 'Every Sunday morning we publish the harvest list; you can swap up to 3 items per box from our cellar pantry.',
    },
  ];

  return (
    <section aria-labelledby="p27-heading" className="bg-[#FAF7F2] py-16 px-6 sm:px-10 text-[#26221B]">
      <div className="mx-auto max-w-5xl">
        <div className="text-center max-w-xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-[#566B44] font-semibold">
            Botanica Farm Share
          </p>
          <h2
            id="p27-heading"
            className="mt-2 text-3xl font-semibold [font-family:var(--font-serif)] [text-wrap:balance]"
          >
            Seasonal organic crates delivered from local growers
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              name: 'Small Household Crate',
              price: '$34',
              unit: 'per delivery',
              cta: 'Order Small Crate',
              items: ['7–9 seasonal vegetables & herbs', 'Sourdough loaf add-on eligible', 'Free neighborhood drop-off'],
            },
            {
              name: 'Family Harvest Crate',
              price: '$56',
              unit: 'per delivery',
              cta: 'Order Family Crate',
              items: ['13–16 seasonal vegetables & orchard fruit', 'Pasture-raised eggs (1 dozen) included', 'Priority Saturday farm pickup'],
            },
          ].map((box) => (
            <div
              key={box.name}
              className="rounded-xl bg-[#FFFDF9] border border-[#E2DACB] p-8 flex flex-col justify-between"
            >
              <div>
                <h3 className="text-xl font-semibold [font-family:var(--font-serif)]">{box.name}</h3>
                <div className="mt-3 text-3xl font-semibold tabular-nums [font-family:var(--font-serif)]">
                  {box.price}{' '}
                  <span className="text-sm font-sans font-normal text-[#6B6153]">{box.unit}</span>
                </div>
                <ul className="mt-5 space-y-2.5 text-sm text-[#433C31]">
                  {box.items.map((it) => (
                    <li key={it} className="flex items-start gap-2">
                      <Check className="w-4 h-4 mt-0.5 shrink-0 text-[#566B44]" />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                type="button"
                onClick={() => setSelected(`${box.name} (${box.price})`)}
                className="mt-7 w-full py-2.5 px-4 rounded-lg bg-[#566B44] text-white text-sm font-medium hover:bg-[#465837] transition-colors whitespace-nowrap"
              >
                {box.cta}
              </button>
            </div>
          ))}
        </div>

        {selected && (
          <p role="status" className="mt-5 text-sm text-[#26221B] bg-[#ECE5D7] rounded-lg px-4 py-2.5">
            Farm share reserved: <strong className="font-semibold">{selected}</strong>
          </p>
        )}

        <div className="mt-10 pt-8 border-t border-[#E2DACB] space-y-3">
          <h3 className="text-sm font-semibold text-[#566B44]">Common Harvest Questions</h3>
          {questions.map((q, idx) => (
            <div key={q.q} className="rounded-xl bg-[#FFFDF9] border border-[#E2DACB]">
              <button
                type="button"
                aria-expanded={open === idx}
                onClick={() => setOpen(open === idx ? null : idx)}
                className="w-full px-5 py-4 text-left flex items-center justify-between text-sm font-semibold"
              >
                <span>{q.q}</span>
                <ChevronDown
                  className={`w-4 h-4 shrink-0 transition-transform ${open === idx ? 'rotate-180' : ''}`}
                />
              </button>
              {open === idx && <p className="px-5 pb-4 text-sm text-[#5C5346]">{q.a}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
   Pricing28 — Pricing with FAQ Strip · Bold / Colourful (LaunchPad Cohort)
   ============================================================================ */
export function Pricing28() {
  const [activeFaq, setActiveFaq] = useState<number>(0);
  const [selected, setSelected] = useState<string | null>(null);

  const faqs = [
    {
      q: 'What if I miss live critique sessions?',
      a: 'All workshops are recorded in 4K with searchable transcripts and async Loom feedback within 24 hours.',
    },
    {
      q: 'Does my employer pay via Learning & Development invoice?',
      a: 'Yes, both tiers generate an instant itemized PDF receipt and L&D reimbursement letter.',
    },
  ];

  return (
    <section aria-labelledby="p28-heading" className="bg-rose-600 py-16 px-6 sm:px-10 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="max-w-xl">
          <p className="text-xs font-extrabold uppercase tracking-widest text-amber-200">
            LaunchPad Product Cohort
          </p>
          <h2 id="p28-heading" className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight">
            6-week live sprint pricing & cohort details
          </h2>
        </div>

        <div className="mt-9 grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              name: 'Self-Paced Seat',
              price: '$480',
              btn: 'Enroll Self-Paced',
              items: ['6 weekly live lecture streams', 'Full Figma & React case templates', '12-month community Slack'],
            },
            {
              name: 'Critique & Mentorship',
              price: '$1,150',
              btn: 'Enroll with Mentorship',
              items: ['Everything in Self-Paced', 'Weekly 1-on-1 portfolio teardown', 'Direct intro review with hiring leads'],
            },
          ].map((tier) => (
            <div
              key={tier.name}
              className="rounded-xl bg-white text-slate-950 border-2 border-slate-950 p-8 flex flex-col justify-between"
            >
              <div>
                <h3 className="text-xl font-extrabold">{tier.name}</h3>
                <div className="mt-3 text-4xl font-extrabold text-rose-600 tabular-nums">{tier.price}</div>
                <ul className="mt-6 space-y-2.5 text-sm font-medium text-slate-700">
                  {tier.items.map((it) => (
                    <li key={it} className="flex items-start gap-2">
                      <Check className="w-4 h-4 mt-0.5 shrink-0 text-rose-600" />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                type="button"
                onClick={() => setSelected(`${tier.name} (${tier.price})`)}
                className="mt-7 w-full py-3 px-4 rounded-lg bg-slate-950 text-white text-sm font-bold hover:bg-slate-800 transition-colors whitespace-nowrap"
              >
                {tier.btn}
              </button>
            </div>
          ))}
        </div>

        {selected && (
          <p role="status" className="mt-5 text-sm font-bold text-slate-950 bg-amber-300 rounded-lg px-4 py-2.5">
            Cohort seat held: {selected}
          </p>
        )}

        <div className="mt-10 rounded-xl bg-rose-950/50 border border-rose-400/40 p-6 space-y-3">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-amber-200">
            Cohort FAQ
          </h3>
          {faqs.map((f, i) => (
            <div key={f.q} className="border-t border-rose-400/30 pt-3">
              <button
                type="button"
                aria-expanded={activeFaq === i}
                onClick={() => setActiveFaq(i)}
                className="w-full text-left flex items-center justify-between text-sm font-bold text-white"
              >
                <span>{f.q}</span>
                <ChevronDown
                  className={`w-4 h-4 shrink-0 transition-transform ${activeFaq === i ? 'rotate-180' : ''}`}
                />
              </button>
              {activeFaq === i && <p className="mt-2 text-sm text-rose-100">{f.a}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
