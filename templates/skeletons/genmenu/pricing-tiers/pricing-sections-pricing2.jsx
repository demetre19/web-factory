// Pricing2 — 2-tier cards · bold / colourful

const plans = [
  {
    id: "personal",
    name: "Personal",
    price: "$0",
    period: "forever",
    pitch: "Everything you need to make beautiful things on your own.",
    features: [
      "Unlimited canvases",
      "3 active projects",
      "1,000+ templates",
      "Export to PNG & SVG",
      "Version history (7 days)",
    ],
    cta: "Start designing free",
  },
  {
    id: "pro",
    name: "Pro",
    price: "$12",
    period: "per month",
    pitch: "For creators who ship work for clients every single week.",
    features: [
      "Unlimited projects",
      "Brand kits with fonts & colours",
      "Export to PDF, MP4 & Lottie",
      "Background remover & AI fill",
      "Unlimited version history",
      "Commercial licence for all assets",
    ],
    cta: "Go Pro",
    highlight: true,
  },
];

function Tick({ className }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m5 12 5 5L20 7" />
    </svg>
  );
}

export default function Pricing2() {
  return (
    <section
      aria-labelledby="pricing2-heading"
      className="relative overflow-hidden bg-gradient-to-br from-fuchsia-600 via-rose-500 to-orange-400 px-6 py-24"
    >
      <div aria-hidden="true" className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-yellow-300/40 blur-3xl" />
      <div aria-hidden="true" className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-violet-700/40 blur-3xl" />

      <div className="relative mx-auto max-w-5xl">
        <header className="text-center text-white">
          <h2 id="pricing2-heading" className="text-5xl font-black tracking-tight sm:text-6xl">
            Make it. <span className="text-yellow-200">Ship it.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg font-medium text-white/90">
            Two plans. No surprises. Upgrade or downgrade whenever you like.
          </p>
        </header>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {plans.map((plan) => (
            <article
              key={plan.id}
              aria-labelledby={`pricing2-${plan.id}`}
              className={`flex flex-col rounded-[2rem] p-8 sm:p-10 ${
                plan.highlight
                  ? "bg-gray-950 text-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]"
                  : "bg-white text-gray-900 shadow-xl"
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 id={`pricing2-${plan.id}`} className="text-2xl font-extrabold">
                  {plan.name}
                </h3>
                {plan.highlight && (
                  <span className="rounded-full bg-gradient-to-r from-yellow-300 to-orange-400 px-3 py-1 text-xs font-bold uppercase tracking-wide text-gray-950">
                    For pros
                  </span>
                )}
              </div>
              <p className={`mt-3 ${plan.highlight ? "text-gray-300" : "text-gray-600"}`}>{plan.pitch}</p>
              <p className="mt-8">
                <span className="text-6xl font-black tracking-tight">{plan.price}</span>
                <span className={`ml-2 font-semibold ${plan.highlight ? "text-gray-400" : "text-gray-500"}`}>
                  {plan.period}
                </span>
              </p>
              <ul role="list" className="mt-8 flex-1 space-y-4">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 font-medium">
                    <span
                      className={`mt-0.5 grid h-6 w-6 flex-none place-items-center rounded-full ${
                        plan.highlight ? "bg-gradient-to-br from-fuchsia-500 to-orange-400" : "bg-rose-100 text-rose-600"
                      }`}
                    >
                      <Tick className="h-3.5 w-3.5" />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className={`mt-10 rounded-full px-6 py-4 text-lg font-extrabold transition hover:-translate-y-0.5 focus:outline-none focus-visible:ring-4 ${
                  plan.highlight
                    ? "bg-gradient-to-r from-fuchsia-500 via-rose-500 to-orange-400 text-white focus-visible:ring-rose-300"
                    : "bg-gray-950 text-white focus-visible:ring-gray-400"
                }`}
              >
                {plan.cta}
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
