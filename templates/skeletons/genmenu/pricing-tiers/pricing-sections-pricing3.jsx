// Pricing3 — monthly / annual toggle (interactive switch) · dark

import { useState } from "react";

const plans = [
  {
    id: "hobby",
    name: "Hobby",
    monthly: 0,
    annual: 0,
    desc: "Send transactional email from side projects.",
    features: ["3,000 emails / month", "1 sending domain", "Shared IP pool", "3-day log retention"],
    cta: "Start for free",
  },
  {
    id: "pro",
    name: "Pro",
    monthly: 20,
    annual: 16,
    desc: "For production apps with real users.",
    features: [
      "50,000 emails / month",
      "10 sending domains",
      "Inbound parsing & webhooks",
      "30-day log retention",
      "Email support",
    ],
    cta: "Get Pro",
    featured: true,
  },
  {
    id: "scale",
    name: "Scale",
    monthly: 90,
    annual: 72,
    desc: "High volume with dedicated infrastructure.",
    features: [
      "200,000 emails / month",
      "Unlimited domains",
      "Dedicated IP address",
      "90-day log retention",
      "SAML SSO",
      "Shared Slack channel",
    ],
    cta: "Get Scale",
  },
];

export default function Pricing3() {
  const [annual, setAnnual] = useState(true);

  return (
    <section aria-labelledby="pricing3-heading" className="bg-zinc-950 px-6 py-24 text-zinc-100">
      <div className="mx-auto max-w-6xl">
        <header className="text-center">
          <h2 id="pricing3-heading" className="text-4xl font-bold tracking-tight sm:text-5xl">
            Email infrastructure, <span className="text-emerald-400">priced for builders</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-zinc-400">
            Start free, then pay only as you grow. Overage is $0.40 per 1,000 emails on any paid plan.
          </p>

          <div className="mt-10 inline-flex items-center gap-4 text-sm font-medium">
            <span className={annual ? "text-zinc-500" : "text-white"} aria-hidden="true">
              Monthly
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={annual}
              aria-label="Bill annually"
              onClick={() => setAnnual((a) => !a)}
              className={`relative inline-flex h-7 w-12 flex-none items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 ${
                annual ? "bg-emerald-500" : "bg-zinc-700"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  annual ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span className={annual ? "text-white" : "text-zinc-500"} aria-hidden="true">
              Annually{" "}
              <span className="ml-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-300">Save 20%</span>
            </span>
          </div>
        </header>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {plans.map((p) => {
            const price = annual ? p.annual : p.monthly;
            return (
              <article
                key={p.id}
                aria-labelledby={`pricing3-${p.id}`}
                className={`flex flex-col rounded-2xl border p-8 ${
                  p.featured
                    ? "border-emerald-500/60 bg-gradient-to-b from-emerald-500/10 to-transparent"
                    : "border-zinc-800 bg-zinc-900/50"
                }`}
              >
                <h3 id={`pricing3-${p.id}`} className="font-mono text-sm uppercase tracking-widest text-emerald-400">
                  {p.name}
                </h3>
                <p className="mt-6 flex items-baseline gap-1">
                  <span className="text-5xl font-bold tracking-tight text-white">${price}</span>
                  <span className="text-zinc-500">/mo</span>
                </p>
                <p className="mt-1 h-5 text-xs text-zinc-500" aria-live="polite">
                  {price === 0 ? "Free forever" : annual ? `$${price * 12} billed yearly` : "Billed monthly"}
                </p>
                <p className="mt-4 text-sm text-zinc-400">{p.desc}</p>
                <ul role="list" className="mt-8 flex-1 space-y-3 border-t border-zinc-800 pt-8 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-3 text-zinc-300">
                      <span aria-hidden="true" className="font-mono text-emerald-400">
                        →
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className={`mt-8 rounded-lg px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                    p.featured
                      ? "bg-emerald-500 text-zinc-950 hover:bg-emerald-400"
                      : "bg-zinc-800 text-white hover:bg-zinc-700"
                  }`}
                >
                  {p.cta}
                </button>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
