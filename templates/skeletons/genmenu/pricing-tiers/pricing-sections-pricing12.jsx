// Pricing12 — free-trial emphasis · light-warm

const steps = [
  { day: "Today", text: "Get full access to every feature. No card required." },
  { day: "Day 25", text: "We'll email you a reminder before your trial ends." },
  { day: "Day 30", text: "Pick a plan — or do nothing and drop to Free." },
];

const plans = [
  {
    id: "solo",
    name: "Solo",
    price: 12,
    who: "For independent practitioners",
    features: ["1 calendar", "Unlimited bookings", "Stripe & PayPal payments", "SMS reminders (100 / mo)"],
  },
  {
    id: "practice",
    name: "Practice",
    price: 29,
    who: "For clinics and studios up to 10 staff",
    features: [
      "Up to 10 calendars",
      "Group classes & packages",
      "Intake forms & waivers",
      "SMS reminders (1,000 / mo)",
      "Remove our branding",
    ],
    featured: true,
  },
  {
    id: "multisite",
    name: "Multi-site",
    price: 79,
    who: "For businesses with several locations",
    features: ["Unlimited calendars", "Location-level reporting", "Staff payroll export", "Priority phone support"],
  },
];

export default function Pricing12() {
  return (
    <section aria-labelledby="pricing12-heading" className="bg-orange-50 px-6 py-24 text-stone-800">
      <div className="mx-auto max-w-6xl">
        <div className="overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-orange-500 to-rose-500 p-10 text-white sm:p-14">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <header>
              <p className="inline-block rounded-full bg-white/20 px-3 py-1 text-sm font-semibold">No credit card needed</p>
              <h2 id="pricing12-heading" className="mt-5 text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
                Try everything free for 30 days.
              </h2>
              <p className="mt-5 max-w-md text-lg text-orange-50">
                Online booking that fills your calendar while you work. Most businesses get their first booking on
                day one.
              </p>
              <button
                type="button"
                className="mt-8 rounded-full bg-white px-8 py-4 text-lg font-bold text-rose-600 shadow-lg shadow-rose-900/20 hover:bg-orange-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/60"
              >
                Start your free trial
              </button>
            </header>
            <ol role="list" className="space-y-4">
              {steps.map((s, i) => (
                <li key={s.day} className="flex gap-4 rounded-2xl bg-white/15 p-5 backdrop-blur">
                  <span className="grid h-10 w-10 flex-none place-items-center rounded-full bg-white font-bold text-rose-600">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-bold">{s.day}</p>
                    <p className="text-sm text-orange-50">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <h3 className="mt-20 text-center text-2xl font-bold text-stone-900">After your trial, choose the plan that fits</h3>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {plans.map((p) => (
            <article
              key={p.id}
              aria-labelledby={`pricing12-${p.id}`}
              className={`flex flex-col rounded-3xl bg-white p-8 ${p.featured ? "ring-2 ring-rose-500" : "ring-1 ring-orange-100"}`}
            >
              <h4 id={`pricing12-${p.id}`} className="text-lg font-bold text-stone-900">
                {p.name}
              </h4>
              <p className="text-sm text-stone-500">{p.who}</p>
              <p className="mt-5">
                <span className="text-4xl font-extrabold text-stone-900">${p.price}</span>
                <span className="text-stone-500"> /month after trial</span>
              </p>
              <ul role="list" className="mt-6 flex-1 space-y-2 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span aria-hidden="true" className="text-rose-500">✔</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className={`mt-8 rounded-full px-5 py-3 text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 ${
                  p.featured ? "bg-rose-500 text-white hover:bg-rose-600" : "bg-orange-100 text-rose-700 hover:bg-orange-200"
                }`}
              >
                Try {p.name} free
              </button>
            </article>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-stone-500">
          Every plan includes a free 30-day trial of all Multi-site features.
        </p>
      </div>
    </section>
  );
}
