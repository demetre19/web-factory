// Pricing4 — horizontal comparison table with checkmarks · light / professional

const plans = [
  { id: "solo", name: "Solo", price: "$15", note: "1 user", cta: "Choose Solo" },
  { id: "business", name: "Business", price: "$45", note: "Up to 5 users", cta: "Choose Business", featured: true },
  { id: "firm", name: "Firm", price: "$110", note: "Unlimited users", cta: "Choose Firm" },
];

// value: true = included, false = not included, string = limit
const groups = [
  {
    name: "Bookkeeping",
    rows: [
      { feature: "Bank connections", values: ["2", "10", "Unlimited"] },
      { feature: "Automatic categorisation", values: [true, true, true] },
      { feature: "Receipt capture", values: ["50 / mo", "Unlimited", "Unlimited"] },
      { feature: "Multi-currency", values: [false, true, true] },
    ],
  },
  {
    name: "Invoicing & payments",
    rows: [
      { feature: "Custom invoices", values: [true, true, true] },
      { feature: "Recurring invoices", values: [false, true, true] },
      { feature: "Card & ACH payments", values: [true, true, true] },
      { feature: "Automatic late reminders", values: [false, true, true] },
    ],
  },
  {
    name: "Reporting & control",
    rows: [
      { feature: "P&L and balance sheet", values: [true, true, true] },
      { feature: "Budget vs. actuals", values: [false, true, true] },
      { feature: "Approval workflows", values: [false, false, true] },
      { feature: "Accountant access", values: [false, "1 seat", "Unlimited"] },
    ],
  },
];

function Cell({ value }) {
  if (value === true)
    return (
      <>
        <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="mx-auto h-5 w-5 text-teal-600">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.86-9.8a.75.75 0 0 0-1.22-.88l-3.24 4.5-1.6-1.6a.75.75 0 1 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.09l3.73-5.24Z"
            clipRule="evenodd"
          />
        </svg>
        <span className="sr-only">Included</span>
      </>
    );
  if (value === false)
    return (
      <>
        <span aria-hidden="true" className="text-slate-300">
          —
        </span>
        <span className="sr-only">Not included</span>
      </>
    );
  return <span className="text-sm font-medium text-slate-700">{value}</span>;
}

export default function Pricing4() {
  return (
    <section aria-labelledby="pricing4-heading" className="bg-white px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <header className="max-w-2xl">
          <h2 id="pricing4-heading" className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Compare plans
          </h2>
          <p className="mt-3 text-slate-600">
            Accounting software for small businesses. All prices per month, billed monthly, excluding tax.
          </p>
        </header>

        <div className="relative mt-12 overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <caption className="sr-only">Feature comparison across Solo, Business and Firm plans</caption>
            <thead>
              <tr className="border-b border-slate-200">
                <td className="w-2/5 p-6 align-bottom text-sm text-slate-500">Prices in USD</td>
                {plans.map((p) => (
                  <th
                    key={p.id}
                    scope="col"
                    className={`p-6 text-center align-top ${p.featured ? "bg-teal-50" : ""}`}
                  >
                    <span className="block text-sm font-semibold text-slate-900">{p.name}</span>
                    {p.featured && (
                      <span className="mt-1 inline-block rounded bg-teal-600 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                        Recommended
                      </span>
                    )}
                    <span className="mt-3 block text-3xl font-semibold tracking-tight text-slate-900">
                      {p.price}
                      <span className="text-sm font-normal text-slate-500">/mo</span>
                    </span>
                    <span className="block text-xs font-normal text-slate-500">{p.note}</span>
                    <button
                      type="button"
                      className={`mt-4 w-full rounded-md px-3 py-2 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
                        p.featured
                          ? "bg-teal-600 text-white hover:bg-teal-700"
                          : "border border-slate-300 text-slate-800 hover:bg-slate-50"
                      }`}
                    >
                      {p.cta}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            {groups.map((g) => (
              <tbody key={g.name}>
                <tr className="bg-slate-50">
                  <th
                    scope="colgroup"
                    colSpan={4}
                    className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500"
                  >
                    {g.name}
                  </th>
                </tr>
                {g.rows.map((row) => (
                  <tr key={row.feature} className="border-t border-slate-100">
                    <th scope="row" className="px-6 py-4 text-sm font-normal text-slate-700">
                      {row.feature}
                    </th>
                    {row.values.map((v, i) => (
                      <td key={plans[i].id} className={`px-6 py-4 text-center ${plans[i].featured ? "bg-teal-50/60" : ""}`}>
                        <Cell value={v} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </div>

        <ul role="list" className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
          <li>✓ 30-day free trial on every plan</li>
          <li>✓ Free migration from QuickBooks & Xero</li>
          <li>✓ Cancel any time</li>
        </ul>
      </div>
    </section>
  );
}
