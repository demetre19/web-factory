// Pricing14 — billing period + currency toggles (segmented radio group), 4 tiers · light / pastel colourful

import { useState } from "react";

const CURRENCIES = ["USD", "EUR", "GBP"];

const tiers = [
  {
    id: "free",
    name: "Free",
    monthly: { USD: 0, EUR: 0, GBP: 0 },
    tint: "bg-white",
    accent: "text-slate-500",
    features: ["Edit up to 50 photos / month", "Basic presets", "Export up to 2K"],
    cta: "Get started",
  },
  {
    id: "plus",
    name: "Plus",
    monthly: { USD: 6, EUR: 6, GBP: 5 },
    tint: "bg-sky-50",
    accent: "text-sky-600",
    features: ["Unlimited edits", "200+ presets", "AI sky & object removal", "Export up to 4K"],
    cta: "Get Plus",
  },
  {
    id: "pro",
    name: "Pro",
    monthly: { USD: 15, EUR: 14, GBP: 12 },
    tint: "bg-violet-50",
    accent: "text-violet-600",
    features: ["Everything in Plus", "RAW processing", "Batch editing", "100 GB cloud library", "Export up to 8K"],
    cta: "Get Pro",
    featured: true,
  },
  {
    id: "studio",
    name: "Studio",
    monthly: { USD: 32, EUR: 30, GBP: 26 },
    tint: "bg-rose-50",
    accent: "text-rose-600",
    features: ["Everything in Pro", "Client proofing galleries", "1 TB cloud library", "3 team members"],
    cta: "Get Studio",
  },
];

export default function Pricing14() {
  const [period, setPeriod] = useState("annual");
  const [currency, setCurrency] = useState("USD");

  const fmt = (n) =>
    new Intl.NumberFormat("en", { style: "currency", currency, maximumFractionDigits: n % 1 ? 2 : 0 }).format(n);
  // Annual = 10 months for the price of 12, shown as a monthly equivalent.
  const priceFor = (t) => {
    const m = t.monthly[currency];
    return period === "annual" ? Math.round(((m * 10) / 12) * 100) / 100 : m;
  };

  return (
    <section aria-labelledby="pricing14-heading" className="bg-gradient-to-b from-indigo-50 via-white to-pink-50 px-6 py-24 text-slate-900">
      <div className="mx-auto max-w-7xl">
        <header className="text-center">
          <h2 id="pricing14-heading" className="text-4xl font-bold tracking-tight sm:text-5xl">
            Edit like a pro, from{" "}
            <span className="bg-gradient-to-r from-sky-500 via-violet-500 to-rose-500 bg-clip-text text-transparent">
              any device
            </span>
          </h2>
          <p className="mt-4 text-slate-600">Pay yearly and get 2 months free.</p>
        </header>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <fieldset className="rounded-full bg-white p-1 shadow-sm ring-1 ring-slate-200">
            <legend className="sr-only">Billing period</legend>
            <div className="flex">
              {[
                ["monthly", "Monthly"],
                ["annual", "Yearly · 2 months free"],
              ].map(([value, label]) => (
                <label
                  key={value}
                  className={`cursor-pointer rounded-full px-5 py-2 text-sm font-semibold transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-violet-500 ${
                    period === value ? "bg-violet-600 text-white" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <input
                    type="radio"
                    name="p14-period"
                    value={value}
                    checked={period === value}
                    onChange={() => setPeriod(value)}
                    className="sr-only"
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="rounded-full bg-white p-1 shadow-sm ring-1 ring-slate-200">
            <legend className="sr-only">Currency</legend>
            <div className="flex">
              {CURRENCIES.map((c) => (
                <label
                  key={c}
                  className={`cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-violet-500 ${
                    currency === c ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <input
                    type="radio"
                    name="p14-currency"
                    value={c}
                    checked={currency === c}
                    onChange={() => setCurrency(c)}
                    className="sr-only"
                  />
                  {c}
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {tiers.map((t) => {
            const price = priceFor(t);
            return (
              <article
                key={t.id}
                aria-labelledby={`pricing14-${t.id}`}
                className={`flex flex-col rounded-3xl p-7 ${t.tint} ${
                  t.featured ? "shadow-xl shadow-violet-200 ring-2 ring-violet-500" : "ring-1 ring-slate-200"
                }`}
              >
                <h3 id={`pricing14-${t.id}`} className={`text-sm font-bold uppercase tracking-wider ${t.accent}`}>
                  {t.name}
                </h3>
                <p className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight tabular-nums">{fmt(price)}</span>
                  <span className="text-sm text-slate-500">/mo</span>
                </p>
                <p className="mt-1 h-4 text-xs text-slate-500">
                  {price === 0 ? "Free forever" : period === "annual" ? `${fmt(t.monthly[currency] * 10)} billed yearly` : "Billed monthly"}
                </p>
                <ul role="list" className="mt-6 flex-1 space-y-2 text-sm text-slate-700">
                  {t.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <span aria-hidden="true" className={t.accent}>●</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className={`mt-8 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 ${
                    t.featured ? "bg-violet-600 text-white hover:bg-violet-700" : "bg-white text-slate-900 ring-1 ring-slate-300 hover:ring-slate-400"
                  }`}
                >
                  {t.cta}
                </button>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
