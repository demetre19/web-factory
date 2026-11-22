// Pricing13 — per-seat pricing with seat stepper · professional (light)

import { useState } from "react";

const MIN = 1;
const MAX = 500;

const plans = [
  {
    id: "team",
    name: "Team",
    perSeat: 10,
    desc: "Plan, track and ship projects together.",
    features: ["Unlimited projects & tasks", "Boards, lists & timelines", "Guests (free, unlimited)", "100+ integrations"],
    cta: "Buy Team",
  },
  {
    id: "business",
    name: "Business",
    perSeat: 18,
    desc: "Portfolio visibility across departments.",
    features: [
      "Everything in Team",
      "Portfolios & workload view",
      "Custom fields & forms",
      "Time tracking",
      "Admin console & SAML SSO",
    ],
    cta: "Buy Business",
    featured: true,
  },
];

const usd = (n) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default function Pricing13() {
  const [draft, setDraft] = useState("12"); // raw input text, so the field can be cleared while typing
  const clamp = (n) => Math.min(MAX, Math.max(MIN, Number.isFinite(n) ? Math.round(n) : MIN));
  const seats = clamp(parseInt(draft, 10));
  const setSeats = (fn) => setDraft(String(fn(seats)));
  const discount = seats >= 50 ? 0.1 : 0;

  return (
    <section aria-labelledby="pricing13-heading" className="bg-gray-50 px-6 py-24 text-gray-900">
      <div className="mx-auto max-w-5xl">
        <header className="text-center">
          <h2 id="pricing13-heading" className="text-4xl font-bold tracking-tight sm:text-5xl">
            Pay per seat. Only for people who edit.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-gray-600">
            Viewers and guests are always free. Teams of 50+ get 10% off automatically.
          </p>
        </header>

        <div className="mx-auto mt-10 flex max-w-md flex-col items-center gap-3 rounded-2xl border border-gray-200 bg-white p-6">
          <label htmlFor="p13-seats" className="text-sm font-medium text-gray-700">
            How many people on your team?
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Remove a seat"
              onClick={() => setSeats((s) => clamp(s - 1))}
              disabled={seats <= MIN}
              className="grid h-11 w-11 place-items-center rounded-lg border border-gray-300 text-xl text-gray-700 hover:bg-gray-50 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              −
            </button>
            <input
              id="p13-seats"
              type="number"
              inputMode="numeric"
              min={MIN}
              max={MAX}
              value={draft}
              onChange={(e) => setDraft(e.target.value.replace(/[^0-9]/g, "").slice(0, 3))}
              onBlur={() => setDraft(String(seats))}
              className="h-11 w-24 rounded-lg border border-gray-300 text-center text-lg font-semibold tabular-nums focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
            />
            <button
              type="button"
              aria-label="Add a seat"
              onClick={() => setSeats((s) => clamp(s + 1))}
              disabled={seats >= MAX}
              className="grid h-11 w-11 place-items-center rounded-lg border border-gray-300 text-xl text-gray-700 hover:bg-gray-50 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              +
            </button>
          </div>
          <p className="h-5 text-xs font-medium text-green-700" aria-live="polite">
            {discount ? "Volume discount applied: 10% off" : ""}
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {plans.map((p) => {
            const total = seats * p.perSeat * (1 - discount);
            return (
              <article
                key={p.id}
                aria-labelledby={`pricing13-${p.id}`}
                className={`flex flex-col rounded-2xl bg-white p-8 ${p.featured ? "border-2 border-blue-600 shadow-lg" : "border border-gray-200"}`}
              >
                <div className="flex items-center justify-between">
                  <h3 id={`pricing13-${p.id}`} className="text-xl font-semibold">
                    {p.name}
                  </h3>
                  {p.featured && (
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">Most chosen</span>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-600">{p.desc}</p>
                <p className="mt-6">
                  <span className="text-4xl font-bold tracking-tight">${p.perSeat}</span>
                  <span className="text-gray-500"> per seat / month</span>
                </p>
                <p className="mt-2 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700" aria-live="polite">
                  {seats} {seats === 1 ? "seat" : "seats"} ={" "}
                  <strong className="tabular-nums text-gray-900">{usd(total)}</strong> / month
                </p>
                <ul role="list" className="mt-6 flex-1 space-y-2.5 text-sm text-gray-700">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2.5">
                      <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 flex-none text-blue-600">
                        <path
                          fillRule="evenodd"
                          d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L8 12.6l7.3-7.3a1 1 0 0 1 1.4 0Z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className={`mt-8 rounded-lg px-4 py-3 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
                    p.featured ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-900 text-white hover:bg-gray-800"
                  }`}
                >
                  {p.cta} for {seats} {seats === 1 ? "seat" : "seats"}
                </button>
              </article>
            );
          })}
        </div>

        <p className="mt-8 text-center text-sm text-gray-600">
          More than 500 seats?{" "}
          <a href="mailto:sales@example.com" className="font-semibold text-blue-700 hover:underline">
            Contact sales for Enterprise
          </a>
        </p>
      </div>
    </section>
  );
}
