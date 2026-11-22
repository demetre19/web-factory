// Pricing1 — 3-tier cards, featured middle column · minimal / professional (light)

const tiers = [
  {
    id: "starter",
    name: "Starter",
    price: 19,
    blurb: "For solo builders validating an idea.",
    features: ["1 workspace", "10,000 events per month", "30-day data retention", "Community support"],
    cta: "Start with Starter",
  },
  {
    id: "growth",
    name: "Growth",
    price: 59,
    blurb: "For product teams shipping every week.",
    features: [
      "5 workspaces",
      "500,000 events per month",
      "1-year data retention",
      "Funnels & retention reports",
      "Priority email support",
    ],
    cta: "Start 14-day trial",
    featured: true,
  },
  {
    id: "scale",
    name: "Scale",
    price: 149,
    blurb: "For companies with serious data needs.",
    features: [
      "Unlimited workspaces",
      "5M events per month",
      "Unlimited retention",
      "Warehouse sync",
      "SSO & audit logs",
    ],
    cta: "Start with Scale",
  },
];

function CheckIcon({ className }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path
        fillRule="evenodd"
        d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L8 12.6l7.3-7.3a1 1 0 0 1 1.4 0Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default function Pricing1() {
  return (
    <section aria-labelledby="pricing1-heading" className="bg-slate-50 px-6 py-24 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <header className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">Pricing</p>
          <h2 id="pricing1-heading" className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Simple plans for every stage
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            Every plan includes unlimited dashboards, unlimited viewers and a 99.9% uptime SLA.
          </p>
        </header>

        <div className="mx-auto mt-16 grid max-w-md gap-8 lg:max-w-none lg:grid-cols-3 lg:items-center">
          {tiers.map((tier) => {
            const f = tier.featured;
            return (
              <article
                key={tier.id}
                aria-labelledby={`pricing1-${tier.id}`}
                className={
                  f
                    ? "relative rounded-3xl bg-slate-900 p-8 shadow-2xl ring-1 ring-slate-900 lg:px-10 lg:py-14"
                    : "rounded-3xl bg-white p-8 ring-1 ring-slate-200"
                }
              >
                {f && (
                  <p className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-500 px-3 py-1 text-xs font-semibold text-white">
                    Most popular
                  </p>
                )}
                <h3 id={`pricing1-${tier.id}`} className={`text-lg font-semibold ${f ? "text-white" : "text-slate-900"}`}>
                  {tier.name}
                </h3>
                <p className={`mt-2 text-sm leading-6 ${f ? "text-slate-300" : "text-slate-600"}`}>{tier.blurb}</p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className={`text-5xl font-semibold tracking-tight ${f ? "text-white" : "text-slate-900"}`}>
                    ${tier.price}
                  </span>
                  <span className={`text-sm ${f ? "text-slate-400" : "text-slate-500"}`}>/month</span>
                </p>
                <button
                  type="button"
                  className={`mt-8 w-full rounded-lg px-4 py-2.5 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
                    f
                      ? "bg-indigo-500 text-white hover:bg-indigo-400 focus-visible:ring-offset-slate-900"
                      : "bg-white text-indigo-600 ring-1 ring-inset ring-indigo-200 hover:ring-indigo-300"
                  }`}
                >
                  {tier.cta}
                </button>
                <ul role="list" className={`mt-8 space-y-3 text-sm leading-6 ${f ? "text-slate-300" : "text-slate-600"}`}>
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <CheckIcon className={`h-6 w-5 flex-none ${f ? "text-indigo-400" : "text-indigo-600"}`} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
