// Pricing8 — pricing cards + FAQ strip below · minimal (monochrome)

const plans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    features: ["Up to 50 documents", "Markdown & rich text", "Sync across 2 devices", "Export to PDF"],
    cta: "Get started",
  },
  {
    id: "writer",
    name: "Writer",
    price: "$6",
    features: [
      "Unlimited documents",
      "Unlimited devices",
      "Focus mode & typewriter scrolling",
      "Publish to Ghost, WordPress & Medium",
      "Full revision history",
    ],
    cta: "Upgrade to Writer",
    featured: true,
  },
  {
    id: "studio",
    name: "Studio",
    price: "$14",
    features: [
      "Everything in Writer",
      "Shared folders for up to 10 people",
      "Inline comments & suggestions",
      "Style guide enforcement",
    ],
    cta: "Try Studio",
  },
];

const faqs = [
  {
    q: "Can I switch plans later?",
    a: "Yes. Upgrades take effect immediately and are prorated; downgrades apply at the end of your billing period.",
  },
  {
    q: "What happens to my documents if I cancel?",
    a: "Nothing is deleted. You keep read and export access forever, and the Free plan limits apply to new documents.",
  },
  {
    q: "Do you offer discounts for students?",
    a: "Students and teachers get Writer free for as long as they're enrolled. Verify with a school email in Settings.",
  },
  {
    q: "Is my writing private?",
    a: "Documents are encrypted at rest and in transit. We never train models on your writing or sell your data.",
  },
  {
    q: "Which payment methods do you accept?",
    a: "All major cards, Apple Pay, Google Pay and PayPal. Annual Studio plans can also be paid by invoice.",
  },
  {
    q: "Do you offer refunds?",
    a: "If you're not happy within 30 days of paying, email us and we'll refund you in full — no questions asked.",
  },
];

export default function Pricing8() {
  return (
    <section aria-labelledby="pricing8-heading" className="bg-white px-6 py-24 text-neutral-900">
      <div className="mx-auto max-w-5xl">
        <header>
          <h2 id="pricing8-heading" className="text-4xl font-medium tracking-tight">
            Pricing
          </h2>
          <p className="mt-2 text-neutral-500">Billed monthly. Prices in USD.</p>
        </header>

        <div className="mt-12 grid border border-neutral-900 md:grid-cols-3">
          {plans.map((p, i) => (
            <article
              key={p.id}
              aria-labelledby={`pricing8-${p.id}`}
              className={`flex flex-col p-8 ${i > 0 ? "border-t border-neutral-900 md:border-l md:border-t-0" : ""} ${
                p.featured ? "bg-neutral-900 text-white" : ""
              }`}
            >
              <h3 id={`pricing8-${p.id}`} className="text-sm font-medium uppercase tracking-widest">
                {p.name}
              </h3>
              <p className="mt-6 text-5xl font-light tracking-tight">
                {p.price}
                <span className={`text-base ${p.featured ? "text-neutral-400" : "text-neutral-500"}`}> /mo</span>
              </p>
              <ul role="list" className={`mt-8 flex-1 space-y-2 text-sm ${p.featured ? "text-neutral-300" : "text-neutral-600"}`}>
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span aria-hidden="true">+</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className={`mt-10 border px-4 py-2.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                  p.featured
                    ? "border-white bg-white text-neutral-900 hover:bg-neutral-200 focus-visible:ring-white focus-visible:ring-offset-neutral-900"
                    : "border-neutral-900 hover:bg-neutral-900 hover:text-white focus-visible:ring-neutral-900"
                }`}
              >
                {p.cta}
              </button>
            </article>
          ))}
        </div>

        <section aria-labelledby="pricing8-faq" className="mt-20 border-t border-neutral-200 pt-12">
          <div className="grid gap-10 md:grid-cols-[1fr_2fr]">
            <div>
              <h3 id="pricing8-faq" className="text-2xl font-medium tracking-tight">
                Questions
              </h3>
              <p className="mt-2 text-sm text-neutral-500">
                Something else? <a href="mailto:hello@example.com" className="underline underline-offset-2 hover:text-neutral-900">Email us</a>.
              </p>
            </div>
            <div className="divide-y divide-neutral-200 border-y border-neutral-200">
              {faqs.map((f) => (
                <details key={f.q} className="group py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between font-medium marker:hidden [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <span aria-hidden="true" className="ml-4 text-xl font-light transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 pr-8 text-sm leading-6 text-neutral-600">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
