// Pricing10 — cards with badges (Popular / Best Value) · bold / colourful

const plans = [
  {
    id: "monthly",
    name: "Monthly",
    price: "$12.99",
    per: "per month",
    detail: "Billed every month",
    features: ["All 40+ languages", "Offline lessons", "Speaking practice with AI tutor", "Cancel anytime"],
    cta: "Start monthly",
    card: "bg-sky-200",
    button: "bg-sky-900 text-white",
  },
  {
    id: "quarterly",
    name: "Quarterly",
    price: "$9.99",
    per: "per month",
    detail: "$29.97 billed every 3 months",
    features: ["Everything in Monthly", "Personal study plan", "Progress reports", "Streak freeze × 3"],
    cta: "Start quarterly",
    badge: { label: "Popular", style: "bg-pink-500 text-white" },
    card: "bg-lime-300",
    button: "bg-lime-950 text-lime-50",
  },
  {
    id: "annual",
    name: "Annual",
    price: "$6.67",
    per: "per month",
    detail: "$79.99 billed yearly — save 48%",
    features: ["Everything in Quarterly", "Live group classes", "Certificates of completion", "Unlimited streak freezes"],
    cta: "Start annual",
    badge: { label: "Best value", style: "bg-black text-yellow-300" },
    card: "bg-yellow-300",
    button: "bg-black text-yellow-300",
  },
  {
    id: "family",
    name: "Family",
    price: "$3.33",
    per: "per person / month",
    detail: "$199.99 a year for up to 5 people",
    features: ["Everything in Annual", "Up to 5 learner profiles", "Shared family leaderboard", "Parental controls"],
    cta: "Start family plan",
    card: "bg-pink-200",
    button: "bg-pink-900 text-white",
  },
];

export default function Pricing10() {
  return (
    <section aria-labelledby="pricing10-heading" className="bg-violet-700 px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <header className="text-center">
          <h2 id="pricing10-heading" className="text-5xl font-black tracking-tight text-white sm:text-6xl">
            Learn faster. <span className="text-yellow-300">Pay less.</span>
          </h2>
          <p className="mt-4 text-lg font-semibold text-violet-100">Every plan starts with a free 7-day trial.</p>
        </header>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {plans.map((p) => (
            <article
              key={p.id}
              aria-labelledby={`pricing10-${p.id}`}
              className={`relative flex flex-col rounded-3xl border-4 border-black p-7 shadow-[8px_8px_0_0_#000] ${p.card}`}
            >
              {p.badge && (
                <p
                  className={`absolute -top-4 right-6 -rotate-3 rounded-full border-2 border-black px-4 py-1 text-sm font-black uppercase tracking-wide ${p.badge.style}`}
                >
                  {p.badge.label}
                </p>
              )}
              <h3 id={`pricing10-${p.id}`} className="text-2xl font-black text-black">
                {p.name}
              </h3>
              <p className="mt-4 text-black">
                <span className="text-5xl font-black tracking-tight">{p.price}</span>
                <span className="mt-1 block text-sm font-bold">{p.per}</span>
              </p>
              <p className="mt-2 text-sm font-medium text-black/70">{p.detail}</p>
              <ul role="list" className="mt-6 flex-1 space-y-2 border-t-2 border-black/20 pt-6 text-sm font-semibold text-black">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span aria-hidden="true">★</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className={`mt-8 rounded-2xl border-2 border-black px-4 py-3 font-black transition hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus-visible:ring-4 focus-visible:ring-white ${p.button}`}
              >
                {p.cta}
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
