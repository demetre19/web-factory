// Pricing9 — minimalist text-only rows · editorial / monospace (type foundry licences)

const licences = [
  {
    id: "personal",
    name: "Personal",
    price: "€40",
    summary: "Non-commercial projects by one person.",
    includes: ["Desktop: 1 user", "Web: 10k pageviews / mo", "Personal portfolio & gifts"],
  },
  {
    id: "studio",
    name: "Studio",
    price: "€220",
    summary: "Small teams making work for clients.",
    includes: ["Desktop: 5 users", "Web: 500k pageviews / mo", "Print & packaging", "Social media"],
  },
  {
    id: "agency",
    name: "Agency",
    price: "€680",
    summary: "Brand identities and campaigns at scale.",
    includes: ["Desktop: 25 users", "Web: 5M pageviews / mo", "Apps: 2 titles", "Logos & trademarks"],
  },
  {
    id: "broadcast",
    name: "Broadcast",
    price: "Ask",
    summary: "Film, TV, games and unlimited use.",
    includes: ["Unlimited users", "Unlimited web & app", "On-screen & motion", "Custom glyphs on request"],
  },
];

export default function Pricing9() {
  return (
    <section aria-labelledby="pricing9-heading" className="bg-[#fafaf7] px-6 py-24 font-mono text-neutral-900">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">Grotesk Nº 7 — Licensing</p>
            <h2 id="pricing9-heading" className="mt-3 text-3xl tracking-tight sm:text-4xl">
              Choose a licence
            </h2>
          </div>
          <p className="max-w-xs text-xs leading-5 text-neutral-500">
            One-time payment. Full family: 14 weights, roman &amp; italic. Prices exclude VAT.
          </p>
        </header>

        <ol role="list" className="mt-14 border-t border-neutral-900">
          {licences.map((l, i) => (
            <li key={l.id} className="border-b border-neutral-300">
              <article
                aria-labelledby={`pricing9-${l.id}`}
                className="grid gap-4 py-8 md:grid-cols-[3rem_1fr_1.4fr_auto] md:items-baseline md:gap-8"
              >
                <span aria-hidden="true" className="text-xs text-neutral-400">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 id={`pricing9-${l.id}`} className="text-xl">
                    {l.name}
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-neutral-500">{l.summary}</p>
                </div>
                <ul role="list" className="space-y-1 text-xs leading-5 text-neutral-700">
                  {l.includes.map((x) => (
                    <li key={x}>— {x}</li>
                  ))}
                </ul>
                <div className="flex items-baseline justify-between gap-8 md:flex-col md:items-end md:gap-2">
                  <p className="text-2xl tabular-nums">{l.price}</p>
                  {l.price === "Ask" ? (
                    <a
                      href="mailto:licensing@example.com"
                      className="text-xs uppercase tracking-widest underline underline-offset-4 hover:no-underline"
                    >
                      Request quote ↗
                    </a>
                  ) : (
                    <button
                      type="button"
                      className="text-xs uppercase tracking-widest underline underline-offset-4 hover:no-underline focus:outline-none focus-visible:bg-neutral-900 focus-visible:text-white"
                    >
                      Add to cart →
                    </button>
                  )}
                </div>
              </article>
            </li>
          ))}
        </ol>

        <p className="mt-8 text-xs text-neutral-500">
          Trial fonts are free for pitches and mock-ups. Need something in between?{" "}
          <a href="mailto:licensing@example.com" className="underline underline-offset-4">
            Write to us.
          </a>
        </p>
      </div>
    </section>
  );
}
