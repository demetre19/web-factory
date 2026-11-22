// Pricing6 — usage slider / cost calculator · dark (indigo)

import { useState } from "react";

const REQUEST_STEPS = [100_000, 250_000, 500_000, 1_000_000, 2_500_000, 5_000_000, 10_000_000, 25_000_000];
const FREE_REQUESTS = 100_000;
const TIER1_LIMIT = 1_000_000; // requests up to 1M are billed at the tier-1 rate
const TIER1_RATE = 0.4; // $ per 1k requests
const TIER2_RATE = 0.25; // $ per 1k requests above 1M
const FREE_GB = 1;
const STORAGE_RATE = 0.25; // $ per GB-month

const usd = (n) => n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });
const compact = (n) => n.toLocaleString("en-US", { notation: "compact", maximumFractionDigits: 1 });

function estimate(requests, storage) {
  const t1 = Math.max(0, Math.min(requests, TIER1_LIMIT) - FREE_REQUESTS);
  const t2 = Math.max(0, requests - TIER1_LIMIT);
  const req1 = (t1 / 1000) * TIER1_RATE;
  const req2 = (t2 / 1000) * TIER2_RATE;
  const store = Math.max(0, storage - FREE_GB) * STORAGE_RATE;
  return { req1, req2, store, total: req1 + req2 + store };
}

const features = [
  "Hybrid vector + keyword search",
  "Metadata filtering on any field",
  "Serverless — scales to zero",
  "Point-in-time backups",
  "99.95% uptime SLA on paid usage",
];

export default function Pricing6() {
  const [step, setStep] = useState(3);
  const [storage, setStorage] = useState(20);
  const requests = REQUEST_STEPS[step];
  const cost = estimate(requests, storage);

  return (
    <section aria-labelledby="pricing6-heading" className="bg-[#0b0b1f] px-6 py-24 text-indigo-50">
      <div className="mx-auto max-w-6xl">
        <header className="max-w-2xl">
          <p className="text-sm font-semibold text-indigo-400">Usage-based pricing</p>
          <h2 id="pricing6-heading" className="mt-2 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Pay for queries, not servers
          </h2>
          <p className="mt-4 text-indigo-200/70">
            The first 100k queries and 1 GB of storage are free every month. Estimate your bill below.
          </p>
        </header>

        <div className="mt-14 grid gap-8 lg:grid-cols-5">
          <form
            className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-8 lg:col-span-3"
            onSubmit={(e) => e.preventDefault()}
            aria-label="Cost estimator"
          >
            <div>
              <div className="flex items-baseline justify-between">
                <label htmlFor="p6-requests" className="text-sm font-medium text-indigo-100">
                  Queries per month
                </label>
                <output htmlFor="p6-requests" className="text-2xl font-semibold tabular-nums text-white">
                  {compact(requests)}
                </output>
              </div>
              <input
                id="p6-requests"
                type="range"
                min={0}
                max={REQUEST_STEPS.length - 1}
                step={1}
                value={step}
                onChange={(e) => setStep(Number(e.target.value))}
                aria-valuetext={`${requests.toLocaleString()} queries`}
                className="mt-4 w-full accent-indigo-400"
              />
              <div aria-hidden="true" className="mt-2 flex justify-between text-xs text-indigo-300/60">
                <span>100K</span>
                <span>25M</span>
              </div>
            </div>

            <div className="mt-10">
              <div className="flex items-baseline justify-between">
                <label htmlFor="p6-storage" className="text-sm font-medium text-indigo-100">
                  Vector storage
                </label>
                <output htmlFor="p6-storage" className="text-2xl font-semibold tabular-nums text-white">
                  {storage} GB
                </output>
              </div>
              <input
                id="p6-storage"
                type="range"
                min={1}
                max={500}
                value={storage}
                onChange={(e) => setStorage(Number(e.target.value))}
                aria-valuetext={`${storage} gigabytes`}
                className="mt-4 w-full accent-indigo-400"
              />
              <div aria-hidden="true" className="mt-2 flex justify-between text-xs text-indigo-300/60">
                <span>1 GB</span>
                <span>500 GB</span>
              </div>
            </div>

            <dl className="mt-10 space-y-2 border-t border-indigo-500/20 pt-6 text-sm">
              <div className="flex justify-between">
                <dt className="text-indigo-200/70">Queries up to 1M · $0.40 / 1k</dt>
                <dd className="tabular-nums">{usd(cost.req1)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-indigo-200/70">Queries above 1M · $0.25 / 1k</dt>
                <dd className="tabular-nums">{usd(cost.req2)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-indigo-200/70">Storage · $0.25 / GB-month</dt>
                <dd className="tabular-nums">{usd(cost.store)}</dd>
              </div>
            </dl>
          </form>

          <article
            aria-labelledby="pricing6-total"
            className="flex flex-col rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 p-8 text-white lg:col-span-2"
          >
            <h3 id="pricing6-total" className="text-sm font-medium text-indigo-100">
              Estimated monthly cost
            </h3>
            <p className="mt-2 text-6xl font-semibold tabular-nums tracking-tight" aria-live="polite">
              {usd(cost.total)}
            </p>
            <p className="mt-2 text-sm text-indigo-100">
              {cost.total === 0 ? "Inside the free tier — no card needed." : "Billed at the end of each month."}
            </p>
            <ul role="list" className="mt-8 flex-1 space-y-3 text-sm">
              {features.map((f) => (
                <li key={f} className="flex gap-3">
                  <span aria-hidden="true">✦</span>
                  {f}
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="mt-8 rounded-lg bg-white px-4 py-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-600"
            >
              Create a free index
            </button>
          </article>
        </div>
      </div>
    </section>
  );
}
