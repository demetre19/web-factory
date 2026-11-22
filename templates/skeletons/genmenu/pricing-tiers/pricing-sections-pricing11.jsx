// Pricing11 — enterprise split: self-serve vs contact sales · dark

const selfServe = [
  "Infrastructure & APM for up to 500 hosts",
  "15-month metric retention",
  "Unlimited dashboards and alerts",
  "PagerDuty, Slack & Opsgenie integrations",
  "Google & GitHub sign-in",
  "Community + email support",
];

const enterprise = [
  "Unlimited hosts with committed-use discounts",
  "SAML SSO, SCIM provisioning & audit trail",
  "Data residency in EU, US or APAC",
  "Custom retention up to 5 years",
  "99.99% SLA with financial credits",
  "Named technical account manager",
  "Security review & custom DPA",
];

function Check({ className }) {
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

export default function Pricing11() {
  return (
    <section aria-labelledby="pricing11-heading" className="bg-neutral-950 px-6 py-24 text-neutral-100">
      <div className="mx-auto max-w-6xl">
        <header className="max-w-2xl">
          <h2 id="pricing11-heading" className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Observability for every scale
          </h2>
          <p className="mt-4 text-neutral-400">
            Get started in minutes with a credit card, or work with our team on a plan built around your
            architecture.
          </p>
        </header>

        <div className="mt-14 grid overflow-hidden rounded-3xl border border-neutral-800 lg:grid-cols-2">
          <article aria-labelledby="pricing11-team" className="flex flex-col bg-neutral-900 p-8 sm:p-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">Self-serve</p>
            <h3 id="pricing11-team" className="mt-3 text-2xl font-semibold text-white">
              Team
            </h3>
            <p className="mt-6 flex items-baseline gap-2">
              <span className="text-5xl font-semibold tracking-tight text-white">$25</span>
              <span className="text-neutral-400">per host / month</span>
            </p>
            <p className="mt-2 text-sm text-neutral-500">Billed monthly on usage. First 5 hosts free.</p>
            <ul role="list" className="mt-10 flex-1 space-y-3 text-sm text-neutral-300">
              {selfServe.map((f) => (
                <li key={f} className="flex gap-3">
                  <Check className="h-5 w-5 flex-none text-cyan-400" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-wrap gap-3">
              <button
                type="button"
                className="rounded-lg bg-cyan-400 px-5 py-3 text-sm font-semibold text-neutral-950 hover:bg-cyan-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900"
              >
                Start free
              </button>
              <a href="#docs" className="rounded-lg px-5 py-3 text-sm font-semibold text-neutral-300 hover:text-white">
                Read the docs →
              </a>
            </div>
          </article>

          <article
            aria-labelledby="pricing11-enterprise"
            className="relative flex flex-col bg-[radial-gradient(ellipse_at_top_right,_rgba(168,85,247,0.25),_transparent_60%)] p-8 sm:p-12 lg:border-l lg:border-neutral-800"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-purple-400">Contact sales</p>
            <h3 id="pricing11-enterprise" className="mt-3 text-2xl font-semibold text-white">
              Enterprise
            </h3>
            <p className="mt-6 text-5xl font-semibold tracking-tight text-white">Custom</p>
            <p className="mt-2 text-sm text-neutral-500">Annual contracts with volume pricing.</p>
            <ul role="list" className="mt-10 flex-1 space-y-3 text-sm text-neutral-300">
              {enterprise.map((f) => (
                <li key={f} className="flex gap-3">
                  <Check className="h-5 w-5 flex-none text-purple-400" />
                  {f}
                </li>
              ))}
            </ul>
            <figure className="mt-10 border-l-2 border-purple-500/60 pl-4">
              <blockquote className="text-sm italic text-neutral-300">
                "We consolidated four monitoring tools and cut our incident response time in half."
              </blockquote>
              <figcaption className="mt-2 text-xs text-neutral-500">— VP Engineering, fintech company</figcaption>
            </figure>
            <div className="mt-8">
              <a
                href="mailto:sales@example.com"
                className="inline-block rounded-lg border border-purple-400/60 px-5 py-3 text-sm font-semibold text-white hover:bg-purple-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
              >
                Talk to sales
              </a>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
