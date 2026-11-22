// Pricing5 — single hero price + feature list split · editorial

const included = [
  "Every long-form essay, the day it's published",
  "The full archive — 14 years, 2,300+ pieces",
  "The Sunday Letter from the editors",
  "Members-only audio editions, read by the authors",
  "Annotated reading lists each season",
  "Comment on and discuss every article",
  "Two gift articles to share each month",
  "An invitation to the annual members' salon",
];

export default function Pricing5() {
  return (
    <section aria-labelledby="pricing5-heading" className="bg-[#f5efe4] px-6 py-24 text-stone-900">
      <div className="mx-auto grid max-w-6xl gap-16 border-y-2 border-stone-900 py-16 lg:grid-cols-[1fr_1.2fr]">
        <div className="flex flex-col">
          <p className="font-serif text-sm uppercase tracking-[0.3em] text-red-800">Membership</p>
          <h2 id="pricing5-heading" className="mt-6 font-serif text-5xl leading-[1.05] tracking-tight sm:text-6xl">
            One subscription.
            <br />
            <em className="font-normal">Everything we write.</em>
          </h2>

          <div className="mt-12">
            <p className="flex items-start gap-2 font-serif">
              <span className="mt-3 text-3xl">$</span>
              <span className="text-[7rem] leading-none tracking-tighter">8</span>
              <span className="mt-auto pb-4 text-lg italic text-stone-600">a month</span>
            </p>
            <p className="mt-4 max-w-sm text-sm leading-6 text-stone-600">
              Or $80 a year — two months on us. Students and educators pay half; just use your institutional
              email.
            </p>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-6">
            <button
              type="button"
              className="bg-stone-900 px-8 py-4 font-serif text-lg text-[#f5efe4] transition hover:bg-red-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-800 focus-visible:ring-offset-4 focus-visible:ring-offset-[#f5efe4]"
            >
              Become a member
            </button>
            <a href="#gift" className="font-serif text-lg underline decoration-1 underline-offset-4 hover:text-red-800">
              Give it as a gift
            </a>
          </div>
        </div>

        <div className="lg:border-l lg:border-stone-900/20 lg:pl-16">
          <h3 className="font-serif text-2xl italic">What membership includes</h3>
          <ul role="list" className="mt-8 divide-y divide-stone-900/15 border-t border-stone-900/15">
            {included.map((item, i) => (
              <li key={item} className="flex gap-6 py-4">
                <span aria-hidden="true" className="w-6 flex-none font-serif text-sm tabular-nums text-red-800">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-serif text-lg leading-snug">{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-8 font-serif text-sm italic text-stone-600">
            Reader-funded since 2012. No advertising, ever. Cancel in two clicks.
          </p>
        </div>
      </div>
    </section>
  );
}
