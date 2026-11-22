// Pricing19 — per-seat with team-size slider + annual toggle · dark gradient

import { useState } from "react";

const FREE_SEAT_LIMIT = 3;

const plans = [
  {
    id: "starter",
    name: "Starter",
    monthly: 0,
    annual: 0,
    desc: "Try AI meeting notes with a small team.",
    features: ["Up to 3 seats", "20 recorded meetings / month", "Summaries & action items", "Zoom, Meet & Teams"],
  },
  {
    id: "pro",
    name: "Pro",
    monthly: 14,
    annual: 11,
    desc: "Unlimited notes for growing teams.",
    features: [
      "Unlimited meetings",
      "Custom summary templates",
      "Search across all meetings",
      "Push notes to Notion, HubSpot & Slack",
      "40+ languages",
    ],
    featured: true,
  },
  {
    id: "business",
    name: "Business",
    monthly: 26,
    annual: 21,
    desc: "Control, compliance and coaching insights.",
    features: [
      "Everything in Pro",
      "Talk-time & sentiment analytics",
      "Admin controls & SSO",
      "Custom data retention",
      "HIPAA-ready (BAA available)",
    ],
  },
];

export default function Pricing19() {
  const [seats, setSeats] = useState(8);
  const [annual, setAnnual] = useState(true);

  return (
    <section
      aria-labelledby="pricing19-heading"
      className="bg-gradient-to-b from-[#140a2e] via-[#1d0f3f] to-[#0d0720] px-6 py-24 text-violet-50"
    >
      <div className="mx-auto max-w-6xl">
        <header className="text-center">
          <h2 id="pricing19-heading" className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Never take meeting notes again
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-violet-200/70">Priced per seat. Pay only for people who record meetings.</p>
        </header>

        <div className="mx-auto mt-12 grid max-w-3xl items-center gap-8 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur sm:grid-cols-[1fr_auto] sm:p-8">
          <div>
            <div className="flex items-baseline justify-between">
              <label htmlFor="p19-seats" className="text-sm font-medium text-violet-100">
                Team size
              </label>
              <output htmlFor="p19-seats" className="text-lg font-semibold tabular-nums text-white">
                {seats} {seats === 1 ? "seat" : "seats"}
              </output>
            </div>
            <input
              id="p19-seats"
              type="range"
              min={1}
              max={200}
              value={seats}
              onChange={(e) => setSeats(Number(e.target.value))}
              aria-valuetext={`${seats} seats`}
              className="mt-3 w-full accent-fuchsia-400"
            />
          </div>
          <div className="flex items-center gap-3 text-sm">
            <button
              type="button"
              role="switch"
              aria-checked={annual}
              onClick={() => setAnnual((a) => !a)}
              className={`relative inline-flex h-6 w-11 flex-none items-center rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400 ${
                annual ? "bg-fuchsia-500" : "bg-white/20"
              }`}
            >
              <span className="sr-only">Bill annually</span>
              <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${annual ? "translate-x-6" : "translate-x-1"}`} />
            </button>
            <span aria-hidden="true">
              Annual <span className="text-fuchsia-300">(save ~20%)</span>
            </span>
          </div>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {plans.map((p) => {
            const perSeat = annual ? p.annual : p.monthly;
            const unavailable = p.monthly === 0 && seats > FREE_SEAT_LIMIT;
            const total = perSeat * seats;
            return (
              <article
                key={p.id}
                aria-labelledby={`pricing19-${p.id}`}
                className={`flex flex-col rounded-2xl p-8 ${
                  p.featured
                    ? "bg-gradient-to-b from-fuchsia-500/20 to-violet-500/5 ring-1 ring-fuchsia-400/60"
                    : "bg-white/[0.03] ring-1 ring-white/10"
                } ${unavailable ? "opacity-60" : ""}`}
              >
                <h3 id={`pricing19-${p.id}`} className="text-lg font-semibold text-white">
                  {p.name}
                </h3>
                <p className="mt-1 text-sm text-violet-200/70">{p.desc}</p>
                <p className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-semibold text-white">${perSeat}</span>
                  <span className="text-sm text-violet-200/60">/ seat / mo</span>
                </p>
                <p className="mt-3 rounded-lg bg-black/20 px-3 py-2 text-sm" aria-live="polite">
                  {unavailable ? (
                    <span className="text-violet-200/70">Limited to {FREE_SEAT_LIMIT} seats</span>
                  ) : (
                    <>
                      <span className="font-semibold tabular-nums text-white">${total.toLocaleString("en-US")}</span>
                      <span className="text-violet-200/70">
                        {" "}
                        / month for {seats} {seats === 1 ? "seat" : "seats"}
                        {annual && total > 0 ? ` · $${(total * 12).toLocaleString("en-US")} / yr` : ""}
                      </span>
                    </>
                  )}
                </p>
                <ul role="list" className="mt-6 flex-1 space-y-2.5 text-sm text-violet-100/90">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2.5">
                      <span aria-hidden="true" className="text-fuchsia-300">◆</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  disabled={unavailable}
                  className={`mt-8 rounded-xl px-4 py-3 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400 disabled:cursor-not-allowed ${
                    p.featured
                      ? "bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white hover:brightness-110"
                      : "bg-white/10 text-white hover:bg-white/15"
                  }`}
                >
                  {unavailable ? "Upgrade for more seats" : p.monthly === 0 ? "Start free" : `Get ${p.name}`}
                </button>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
