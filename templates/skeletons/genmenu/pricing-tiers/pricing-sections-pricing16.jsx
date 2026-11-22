// Pricing16 — magazine-style three columns with rules and numerals · editorial (print subscription)

const tiers = [
  {
    id: "digital",
    numeral: "I.",
    name: "Digital",
    price: "$48",
    term: "per year",
    lede: "The whole magazine on every screen, the morning it goes to press.",
    features: [
      "Four quarterly issues on web & app",
      "Complete archive back to issue one",
      "Audio editions of the long reads",
      "Weekly dispatch newsletter",
    ],
    cta: "Subscribe digitally",
  },
  {
    id: "print",
    numeral: "II.",
    name: "Print & Digital",
    price: "$96",
    term: "per year, shipping included",
    lede: "Heavy matte paper, 220 pages, delivered to your door each season.",
    features: [
      "Everything in Digital",
      "Four printed issues a year",
      "Free worldwide shipping",
      "Subscriber-only cover edition",
      "10% off back issues & prints",
    ],
    cta: "Subscribe in print",
    featured: true,
  },
  {
    id: "patron",
    numeral: "III.",
    name: "Patron",
    price: "$250",
    term: "per year",
    lede: "Keep independent publishing independent — and get thanked in print.",
    features: [
      "Everything in Print & Digital",
      "A second subscription to gift",
      "Your name in the masthead",
      "Invitations to launch evenings",
    ],
    cta: "Become a patron",
  },
];

export default function Pricing16() {
  return (
    <section aria-labelledby="pricing16-heading" className="bg-white px-6 py-24 text-black">
      <div className="mx-auto max-w-6xl">
        <header className="border-b-4 border-double border-black pb-8 text-center">
          <p className="font-serif text-xs uppercase tracking-[0.4em]">Subscriptions · Vol. XII</p>
          <h2 id="pricing16-heading" className="mt-4 font-serif text-5xl italic tracking-tight sm:text-7xl">
            Read slowly.
          </h2>
          <p className="mx-auto mt-4 max-w-lg font-serif text-lg text-neutral-600">
            A quarterly of ideas, design and culture — made by a staff of eleven and funded entirely by readers.
          </p>
        </header>

        <div className="grid md:grid-cols-3 md:divide-x md:divide-black">
          {tiers.map((t) => (
            <article
              key={t.id}
              aria-labelledby={`pricing16-${t.id}`}
              className={`flex flex-col border-b border-black px-0 py-10 md:border-b-0 md:px-8 ${t.featured ? "md:bg-red-50/60" : ""}`}
            >
              <p aria-hidden="true" className="font-serif text-6xl text-red-700">
                {t.numeral}
              </p>
              <h3 id={`pricing16-${t.id}`} className="mt-4 font-serif text-3xl">
                {t.name}
              </h3>
              {t.featured && (
                <p className="mt-1 font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-red-700">Editors' pick</p>
              )}
              <p className="mt-4 font-serif text-lg italic leading-snug text-neutral-700">{t.lede}</p>
              <p className="mt-8 border-y border-black py-4 font-serif">
                <span className="text-4xl">{t.price}</span>
                <span className="ml-2 text-sm text-neutral-600">{t.term}</span>
              </p>
              <ul role="list" className="mt-6 flex-1 space-y-2 font-serif text-[15px] leading-6">
                {t.features.map((f) => (
                  <li key={f} className="pl-5 -indent-5">
                    <span aria-hidden="true" className="mr-2 text-red-700">
                      ¶
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className={`mt-10 px-5 py-3 font-sans text-xs font-bold uppercase tracking-[0.2em] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:ring-offset-2 ${
                  t.featured ? "bg-red-700 text-white hover:bg-red-800" : "border border-black hover:bg-black hover:text-white"
                }`}
              >
                {t.cta}
              </button>
            </article>
          ))}
        </div>

        <p className="border-t-4 border-double border-black pt-6 text-center font-serif text-sm italic text-neutral-600">
          Subscriptions renew annually and can be paused or cancelled at any time.
        </p>
      </div>
    </section>
  );
}
