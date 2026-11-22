// Pricing17 — graduated volume pricing table + calculator · light / minimal

import { useState } from "react";

const brackets = [
  { from: 0, to: 10_000, rate: 0.0079 },
  { from: 10_000, to: 100_000, rate: 0.0065 },
  { from: 100_000, to: 1_000_000, rate: 0.0049 },
  { from: 1_000_000, to: Infinity, rate: 0.0035 },
];

const features = [
  "Two-way SMS & MMS in 180 countries",
  "Free local number with every account",
  "Delivery receipts & webhooks",
  "Automatic opt-out handling",
  "No monthly minimums or contracts",
];

const num = (n) => n.toLocaleString("en-US");
const usd = (n, d = 2) => n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: d, maximumFractionDigits: d });

function graduated(messages) {
  return brackets.map((b) => {
    const qty = Math.max(0, Math.min(messages, b.to) - b.from);
    return { ...b, qty, cost: qty * b.rate };
  });
}

export default function Pricing17() {
  const [messages, setMessages] = useState(250_000);
  const lines = graduated(messages);
  const total = lines.reduce((s, l) => s + l.cost, 0);

  return (
    <section aria-labelledby="pricing17-heading" className="bg-white px-6 py-24 text-gray-900">
      <div className="mx-auto max-w-5xl">
        <header className="max-w-2xl">
          <h2 id="pricing17-heading" className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Pay per message. The more you send, the less each one costs.
          </h2>
          <p className="mt-3 text-gray-500">
            Graduated pricing: each bracket's rate applies only to messages within that bracket.
          </p>
        </header>

        <div className="mt-12 grid gap-12 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Price per outbound SMS by monthly volume</caption>
              <thead>
                <tr className="border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                  <th scope="col" className="py-3 font-medium">Monthly volume</th>
                  <th scope="col" className="py-3 text-right font-medium">Per message</th>
                  <th scope="col" className="py-3 text-right font-medium">Your usage</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((l) => (
                  <tr key={l.from} className={`border-b border-gray-100 transition-colors ${l.qty > 0 ? "text-gray-900" : "text-gray-400"}`}>
                    <th scope="row" className="py-4 font-normal">
                      {l.to === Infinity ? `${num(l.from + 1)}+` : `${num(l.from === 0 ? 1 : l.from + 1)} – ${num(l.to)}`}
                    </th>
                    <td className="py-4 text-right tabular-nums">${l.rate.toFixed(4)}</td>
                    <td className="py-4 text-right tabular-nums">
                      {l.qty > 0 ? (
                        <span className="inline-flex items-center gap-2">
                          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          {usd(l.cost)}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <form className="mt-10" onSubmit={(e) => e.preventDefault()}>
              <label htmlFor="p17-volume" className="text-sm font-medium text-gray-700">
                Messages per month
              </label>
              <div className="mt-3 flex items-center gap-4">
                <input
                  type="range"
                  min={0}
                  max={2_000_000}
                  step={5_000}
                  value={messages}
                  onChange={(e) => setMessages(Number(e.target.value))}
                  aria-label="Messages per month slider"
                  aria-valuetext={`${num(messages)} messages`}
                  className="flex-1 accent-emerald-600"
                />
                <input
                  id="p17-volume"
                  type="number"
                  min={0}
                  step={1000}
                  value={messages}
                  onChange={(e) => setMessages(Math.max(0, Math.floor(Number(e.target.value) || 0)))}
                  className="w-32 rounded-md border border-gray-300 px-3 py-2 text-right tabular-nums focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                />
              </div>
            </form>
          </div>

          <article aria-labelledby="pricing17-total" className="flex flex-col rounded-xl border border-gray-200 p-8">
            <h3 id="pricing17-total" className="text-sm font-medium text-gray-500">
              Estimated monthly total
            </h3>
            <p className="mt-2 text-5xl font-semibold tracking-tight tabular-nums" aria-live="polite">
              {usd(total)}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Average {messages > 0 ? `$${(total / messages).toFixed(4)}` : "—"} per message
            </p>
            <ul role="list" className="mt-8 flex-1 space-y-2.5 border-t border-gray-100 pt-8 text-sm text-gray-700">
              {features.map((f) => (
                <li key={f} className="flex gap-2.5">
                  <span aria-hidden="true" className="text-emerald-600">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="mt-8 rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
            >
              Get $10 free credit
            </button>
          </article>
        </div>
      </div>
    </section>
  );
}
