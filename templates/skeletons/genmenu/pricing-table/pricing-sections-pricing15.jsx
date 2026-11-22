// Pricing15 — dark comparison table with billing toggle and highlighted column

import { useState } from "react";

const plans = [
  { id: "free", name: "Free", monthly: 0, annual: 0, cta: "Start building" },
  { id: "team", name: "Team", monthly: 30, annual: 25, unit: "per user", cta: "Start Team trial", featured: true },
  { id: "enterprise", name: "Enterprise", custom: true, cta: "Contact sales" },
];

const rows = [
  { section: "Pipelines" },
  { label: "Build minutes / month", values: ["2,000", "50,000", "Unlimited"] },
  { label: "Concurrent jobs", values: ["1", "20", "Custom"] },
  { label: "Linux, macOS & Windows runners", values: [true, true, true] },
  { label: "GPU runners", values: [false, true, true] },
  { label: "Self-hosted runners", values: [false, true, true] },
  { section: "Delivery" },
  { label: "Preview environments", values: [false, true, true] },
  { label: "Deployment approvals", values: [false, true, true] },
  { label: "Progressive & canary rollouts", values: [false, false, true] },
  { section: "Security & support" },
  { label: "Secrets manager", values: [true, true, true] },
  { label: "SAML SSO & SCIM", values: [false, false, true] },
  { label: "Audit log retention", values: ["—", "90 days", "7 years"] },
  { label: "Support", values: ["Community", "Email, 1 business day", "24/7, 1-hour response"] },
];

function Value({ v }) {
  if (v === true)
    return (
      <>
        <span aria-hidden="true" className="text-lime-400">✓</span>
        <span className="sr-only">Included</span>
      </>
    );
  if (v === false)
    return (
      <>
        <span aria-hidden="true" className="text-zinc-600">×</span>
        <span className="sr-only">Not included</span>
      </>
    );
  return <span className="text-zinc-300">{v}</span>;
}

export default function Pricing15() {
  const [billing, setBilling] = useState("annual");

  return (
    <section aria-labelledby="pricing15-heading" className="bg-zinc-950 px-6 py-24 text-zinc-100">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 id="pricing15-heading" className="text-4xl font-semibold tracking-tight text-white">
              Ship faster on every plan
            </h2>
            <p className="mt-3 max-w-lg text-zinc-400">Compare everything side by side. Team is free for 14 days.</p>
          </div>
          <div role="radiogroup" aria-label="Billing period" className="inline-flex self-start rounded-lg border border-zinc-800 bg-zinc-900 p-1 text-sm">
            {[
              ["monthly", "Monthly"],
              ["annual", "Annual −17%"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={billing === value}
                onClick={() => setBilling(value)}
                className={`rounded-md px-4 py-1.5 font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400 ${
                  billing === value ? "bg-lime-400 text-zinc-950" : "text-zinc-400 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </header>

        <div className="relative mt-12 overflow-x-auto">
          <table className="w-full min-w-[720px] border-separate border-spacing-0 text-left text-sm">
            <caption className="sr-only">Plan comparison for Free, Team and Enterprise</caption>
            <thead>
              <tr>
                <td className="w-[34%]" />
                {plans.map((p) => (
                  <th
                    key={p.id}
                    scope="col"
                    className={`p-6 align-top font-normal ${p.featured ? "rounded-t-2xl bg-zinc-900 ring-1 ring-lime-400/40" : ""}`}
                  >
                    <span className="block text-base font-semibold text-white">{p.name}</span>
                    <span className="mt-3 block text-3xl font-semibold tracking-tight text-white">
                      {p.custom ? "Custom" : `$${billing === "annual" ? p.annual : p.monthly}`}
                    </span>
                    <span className="block h-5 text-xs text-zinc-500">
                      {p.custom ? "Annual contract" : p.unit ? `${p.unit} / month` : "Forever"}
                    </span>
                    {p.custom ? (
                      <a
                        href="mailto:sales@example.com"
                        className="mt-4 block rounded-lg border border-zinc-700 px-3 py-2 text-center font-medium text-white hover:bg-zinc-800"
                      >
                        {p.cta}
                      </a>
                    ) : (
                      <button
                        type="button"
                        className={`mt-4 w-full rounded-lg px-3 py-2 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400 ${
                          p.featured ? "bg-lime-400 text-zinc-950 hover:bg-lime-300" : "border border-zinc-700 text-white hover:bg-zinc-800"
                        }`}
                      >
                        {p.cta}
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) =>
                r.section ? (
                  <tr key={r.section}>
                    <th scope="colgroup" colSpan={4} className="px-4 pb-3 pt-10 text-xs font-semibold uppercase tracking-widest text-lime-400">
                      {r.section}
                    </th>
                  </tr>
                ) : (
                  <tr key={r.label}>
                    <th scope="row" className="border-t border-zinc-800/80 px-4 py-3.5 font-normal text-zinc-400">
                      {r.label}
                    </th>
                    {r.values.map((v, j) => (
                      <td
                        key={plans[j].id}
                        className={`border-t border-zinc-800/80 px-6 py-3.5 ${
                          plans[j].featured ? `bg-zinc-900 ${i === rows.length - 1 ? "rounded-b-2xl" : ""}` : ""
                        }`}
                      >
                        <Value v={v} />
                      </td>
                    ))}
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
