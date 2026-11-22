// Pricing7 — tier cards with per-feature limits · light-warm

const tiers = [
  {
    id: "gathering",
    name: "Gathering",
    price: 0,
    tagline: "For a book club, a running crew, a supper club.",
    limits: [
      ["Members", "50"],
      ["Events per month", "4"],
      ["Admins", "1"],
      ["File storage", "1 GB"],
      ["Ticket fees", "5% + 30¢"],
    ],
    features: ["Event pages & RSVPs", "Group chat", "Email reminders"],
    cta: "Start a community",
  },
  {
    id: "neighbourhood",
    name: "Neighbourhood",
    price: 24,
    tagline: "For growing groups with regular programming.",
    limits: [
      ["Members", "1,000"],
      ["Events per month", "Unlimited"],
      ["Admins", "5"],
      ["File storage", "25 GB"],
      ["Ticket fees", "2% + 30¢"],
    ],
    features: ["Everything in Gathering", "Paid memberships", "Custom domain", "Attendance insights"],
    cta: "Choose Neighbourhood",
    featured: true,
  },
  {
    id: "town",
    name: "Town",
    price: 79,
    tagline: "For organisations running many chapters.",
    limits: [
      ["Members", "Unlimited"],
      ["Events per month", "Unlimited"],
      ["Admins", "Unlimited"],
      ["File storage", "250 GB"],
      ["Ticket fees", "0% + 30¢"],
    ],
    features: ["Everything in Neighbourhood", "Multiple chapters", "Remove our branding", "Phone support"],
    cta: "Choose Town",
  },
];

export default function Pricing7() {
  return (
    <section aria-labelledby="pricing7-heading" className="bg-[#fbf6ee] px-6 py-24 text-stone-800">
      <div className="mx-auto max-w-6xl">
        <header className="mx-auto max-w-2xl text-center">
          <h2 id="pricing7-heading" className="text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl">
            Bring your people together
          </h2>
          <p className="mt-4 text-lg text-stone-600">
            Clear limits, no hidden fees. Outgrow a plan? We'll never cut anyone off mid-event.
          </p>
        </header>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {tiers.map((t) => (
            <article
              key={t.id}
              aria-labelledby={`pricing7-${t.id}`}
              className={`flex flex-col rounded-3xl p-8 ${
                t.featured ? "bg-amber-400 text-stone-900 shadow-lg shadow-amber-600/20" : "bg-white ring-1 ring-stone-200"
              }`}
            >
              <h3 id={`pricing7-${t.id}`} className="text-xl font-bold">
                {t.name}
              </h3>
              <p className={`mt-1 text-sm ${t.featured ? "text-stone-800" : "text-stone-500"}`}>{t.tagline}</p>
              <p className="mt-6">
                <span className="text-5xl font-bold tracking-tight">{t.price === 0 ? "Free" : `$${t.price}`}</span>
                {t.price > 0 && <span className="ml-1 text-stone-600">/ month</span>}
              </p>

              <dl className={`mt-8 divide-y rounded-2xl text-sm ${t.featured ? "divide-amber-500 bg-amber-300/60" : "divide-stone-100 bg-stone-50"}`}>
                {t.limits.map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between px-4 py-3">
                    <dt className={t.featured ? "text-stone-700" : "text-stone-500"}>{label}</dt>
                    <dd className="font-semibold tabular-nums">{value}</dd>
                  </div>
                ))}
              </dl>

              <ul role="list" className="mt-6 flex-1 space-y-2 text-sm">
                {t.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <svg aria-hidden="true" viewBox="0 0 16 16" className={`h-4 w-4 flex-none ${t.featured ? "text-stone-900" : "text-amber-500"}`} fill="currentColor">
                      <circle cx="8" cy="8" r="3" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                className={`mt-8 rounded-full px-5 py-3 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2 ${
                  t.featured ? "bg-stone-900 text-amber-50 hover:bg-stone-700" : "bg-amber-100 text-stone-900 hover:bg-amber-200"
                }`}
              >
                {t.cta}
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
