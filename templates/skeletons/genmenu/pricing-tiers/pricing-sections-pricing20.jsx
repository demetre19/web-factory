// Pricing20 — horizontal row cards (stacked) + guarantee strip · light-warm / soft

const plans = [
  {
    id: "essentials",
    name: "Essentials",
    storage: "200 GB",
    price: "$2.99",
    features: ["Automatic photo backup", "Share links with passwords", "30-day file recovery"],
    cta: "Choose Essentials",
  },
  {
    id: "plus",
    name: "Plus",
    storage: "2 TB",
    price: "$9.99",
    features: ["Everything in Essentials", "Share with up to 5 family members", "End-to-end encrypted vault", "180-day file recovery"],
    cta: "Choose Plus",
    featured: true,
  },
  {
    id: "max",
    name: "Max",
    storage: "10 TB",
    price: "$29.99",
    features: ["Everything in Plus", "Desktop & NAS backup", "Version history for 1 year", "Priority human support"],
    cta: "Choose Max",
  },
];

export default function Pricing20() {
  return (
    <section aria-labelledby="pricing20-heading" className="bg-[#f7f3ee] px-6 py-24 text-[#2b2420]">
      <div className="mx-auto max-w-5xl">
        <header className="text-center">
          <h2 id="pricing20-heading" className="text-4xl font-semibold tracking-tight sm:text-5xl">
            A safe home for your memories
          </h2>
          <p className="mt-4 text-[#6f625a]">Everyone starts with 5 GB free. Upgrade when you need more room.</p>
        </header>

        <ul role="list" className="mt-14 space-y-4">
          {plans.map((p) => (
            <li key={p.id}>
              <article
                aria-labelledby={`pricing20-${p.id}`}
                className={`relative grid items-center gap-6 rounded-3xl p-6 sm:p-8 md:grid-cols-[180px_1fr_auto] md:gap-10 ${
                  p.featured ? "bg-[#2b2420] text-[#f7f3ee] shadow-xl" : "bg-white shadow-sm ring-1 ring-[#e8dfd5]"
                }`}
              >
                {p.featured && (
                  <p className="absolute -top-3 left-8 rounded-full bg-[#e07a5f] px-3 py-1 text-xs font-semibold text-white">
                    Most families choose this
                  </p>
                )}
                <div>
                  <h3 id={`pricing20-${p.id}`} className={`text-sm font-medium ${p.featured ? "text-[#e8b4a2]" : "text-[#e07a5f]"}`}>
                    {p.name}
                  </h3>
                  <p className="text-4xl font-semibold tracking-tight">{p.storage}</p>
                </div>
                <ul role="list" className={`grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2 ${p.featured ? "text-[#d9cfc6]" : "text-[#6f625a]"}`}>
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <span aria-hidden="true" className="text-[#e07a5f]">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between gap-6 md:flex-col md:items-end md:gap-3">
                  <p className="whitespace-nowrap">
                    <span className="text-3xl font-semibold">{p.price}</span>
                    <span className={`text-sm ${p.featured ? "text-[#d9cfc6]" : "text-[#6f625a]"}`}> /mo</span>
                  </p>
                  <button
                    type="button"
                    className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e07a5f] focus-visible:ring-offset-2 ${
                      p.featured
                        ? "bg-[#e07a5f] text-white hover:bg-[#d06a4f] focus-visible:ring-offset-[#2b2420]"
                        : "bg-[#f7f3ee] text-[#2b2420] ring-1 ring-[#e0d4c7] hover:bg-[#efe7de]"
                    }`}
                  >
                    {p.cta}
                  </button>
                </div>
              </article>
            </li>
          ))}
        </ul>

        <aside
          aria-label="Our guarantees"
          className="mt-12 grid gap-6 rounded-3xl border border-dashed border-[#d8c9b9] p-8 text-sm sm:grid-cols-3"
        >
          {[
            ["30-day money-back", "Not for you? Get a full refund, no forms to fill."],
            ["Your files, always", "If you cancel, download everything for 12 months."],
            ["Private by design", "Zero-knowledge encryption. We can't see your files."],
          ].map(([title, text]) => (
            <div key={title}>
              <p className="font-semibold">{title}</p>
              <p className="mt-1 text-[#6f625a]">{text}</p>
            </div>
          ))}
        </aside>
      </div>
    </section>
  );
}
