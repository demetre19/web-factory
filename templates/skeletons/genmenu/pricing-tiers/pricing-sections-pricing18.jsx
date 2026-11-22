// Pricing18 — brutalist cards · bold (yellow / black, hard shadows)

const plans = [
  {
    id: "hobby",
    name: "Hobby",
    price: "$0",
    pitch: "Deploy side projects. Sleep when idle.",
    features: ["1 app", "512 MB RAM", "Shared Postgres (1 GB)", "*.app subdomain", "Sleeps after 30 min idle"],
    cta: "Deploy free",
  },
  {
    id: "pro",
    name: "Pro",
    price: "$20",
    pitch: "Always-on apps with real databases.",
    features: [
      "10 apps",
      "Up to 8 GB RAM per app",
      "Dedicated Postgres (20 GB)",
      "Custom domains + free TLS",
      "Daily backups, 14-day retention",
      "Zero-downtime deploys",
    ],
    cta: "Go Pro",
    featured: true,
  },
  {
    id: "team",
    name: "Team",
    price: "$99",
    pitch: "Shared projects, roles and preview envs.",
    features: [
      "Unlimited apps",
      "Up to 32 GB RAM per app",
      "Postgres + Redis clusters",
      "Preview environment per PR",
      "Role-based access control",
      "Priority support",
    ],
    cta: "Start Team",
  },
];

export default function Pricing18() {
  return (
    <section aria-labelledby="pricing18-heading" className="bg-yellow-300 px-6 py-24 text-black">
      <div className="mx-auto max-w-6xl">
        <header className="border-4 border-black bg-white p-8 shadow-[10px_10px_0_0_#000]">
          <h2 id="pricing18-heading" className="text-5xl font-black uppercase leading-none tracking-tighter sm:text-7xl">
            Push code.
            <br />
            Get a URL.
          </h2>
          <p className="mt-4 max-w-xl text-lg font-bold">
            Hosting that doesn't need a platform team. Usage over plan limits is billed per second.
          </p>
        </header>

        <div className="mt-14 grid gap-10 lg:grid-cols-3">
          {plans.map((p) => (
            <article
              key={p.id}
              aria-labelledby={`pricing18-${p.id}`}
              className={`flex flex-col border-4 border-black p-7 shadow-[10px_10px_0_0_#000] ${p.featured ? "bg-black text-yellow-300" : "bg-white"}`}
            >
              <div className="flex items-start justify-between">
                <h3 id={`pricing18-${p.id}`} className="text-3xl font-black uppercase">
                  {p.name}
                </h3>
                {p.featured && (
                  <span className="border-2 border-yellow-300 px-2 py-0.5 text-xs font-black uppercase">Popular</span>
                )}
              </div>
              <p className="mt-2 font-bold">{p.pitch}</p>
              <p className="mt-6 text-7xl font-black tracking-tighter">
                {p.price}
                <span className="text-xl tracking-normal">/mo</span>
              </p>
              <ul role="list" className={`mt-6 flex-1 border-t-4 pt-6 font-mono text-sm ${p.featured ? "border-yellow-300" : "border-black"}`}>
                {p.features.map((f) => (
                  <li key={f} className="py-1">
                    [x] {f}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className={`mt-8 border-4 px-4 py-3 text-lg font-black uppercase transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none focus:outline-none focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 ${
                  p.featured
                    ? "border-yellow-300 bg-yellow-300 text-black shadow-[6px_6px_0_0_#fde047] focus-visible:outline-yellow-300"
                    : "border-black bg-yellow-300 shadow-[6px_6px_0_0_#000] focus-visible:outline-black"
                }`}
              >
                {p.cta} →
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
