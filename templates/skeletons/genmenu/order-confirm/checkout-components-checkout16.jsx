import { useState } from "react";

// Order confirmation · luxury-editorial (dark) · printed receipt card on a dark page
const ITEMS = [
  { id: 1, name: "Oversized Wool Blazer", ref: "Réf. 24-118 · Charcoal · 38", qty: 1, price: 1890, grad: "from-neutral-500 to-neutral-800", mono: "B" },
  { id: 2, name: "Leather Loafer", ref: "Réf. 24-402 · Noir · 37.5", qty: 1, price: 760, grad: "from-stone-700 to-black", mono: "L" },
  { id: 3, name: "Cashmere Scarf", ref: "Réf. 24-907 · Écru", qty: 1, price: 420, grad: "from-stone-100 to-stone-300", mono: "S" },
];
const fmt = (n) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2 });

const Arrow = (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" aria-hidden="true" {...p}><path d="M4 12h16M14 6l6 6-6 6" /></svg>;

export default function Checkout16() {
  const [tab, setTab] = useState("receipt");
  const sub = ITEMS.reduce((s, i) => s + i.price * i.qty, 0);
  const duty = 0;
  const tax = 272.4;

  return (
    <div className="min-h-screen bg-neutral-950 px-4 py-14 text-neutral-200">
      <div className="mx-auto max-w-2xl">
        <header className="text-center">
          <p className="font-serif text-xs tracking-[0.5em] text-neutral-500">ATELIER</p>
          <p className="mt-1 font-serif text-3xl tracking-[0.25em] text-neutral-100">NOIRÉ</p>
          <h1 className="mt-12 font-serif text-5xl font-light italic text-neutral-100">With gratitude.</h1>
          <p className="mx-auto mt-5 max-w-md leading-relaxed text-neutral-400">Your pieces are being inspected, pressed and wrapped by hand in our New York studio. We'll write again the moment they leave.</p>
        </header>

        <div role="tablist" aria-label="Order details" className="mx-auto mt-12 flex w-max gap-10 border-b border-neutral-800">
          {[["receipt", "Receipt"], ["delivery", "Delivery"]].map(([v, t]) => (
            <button key={v} role="tab" aria-selected={tab === v} aria-controls={`c16-${v}`} onClick={() => setTab(v)}
              className={`-mb-px pb-3 text-[11px] uppercase tracking-[0.3em] ${tab === v ? "border-b border-neutral-100 text-neutral-100" : "text-neutral-500"}`}>{t}</button>
          ))}
        </div>

        <article className="relative mt-10 bg-[#f4f1ea] px-8 py-10 text-neutral-900 shadow-2xl sm:px-12">
          <span aria-hidden="true" className="absolute inset-x-0 -bottom-2 h-4 bg-[radial-gradient(circle_at_8px_0,transparent_8px,#f4f1ea_8.5px)] bg-[length:16px_16px]" />
          <div className="flex items-start justify-between border-b border-neutral-900 pb-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">Order</p>
              <p className="mt-1 font-serif text-3xl">Nº 00418-NY</p>
            </div>
            <div className="text-right text-[11px] uppercase tracking-[0.2em] text-neutral-500">
              <p>22 November 2026</p><p className="mt-1">Client · E. Vasquez</p>
            </div>
          </div>

          {tab === "receipt" ? (
            <section id="c16-receipt" role="tabpanel" aria-label="Receipt">
              <ul className="divide-y divide-neutral-300">
                {ITEMS.map((i, k) => (
                  <li key={i.id} className="grid grid-cols-[24px_56px_1fr_auto] items-center gap-4 py-5">
                    <span className="font-serif text-sm italic text-neutral-400">{String(k + 1).padStart(2, "0")}</span>
                    <span className={`flex aspect-[3/4] items-center justify-center bg-gradient-to-b ${i.grad} font-serif text-xl italic text-white/70`}>{i.mono}</span>
                    <span><span className="block font-serif text-lg leading-tight">{i.name}</span><span className="text-xs tracking-wide text-neutral-500">{i.ref}</span></span>
                    <span className="font-serif">{fmt(i.price)}</span>
                  </li>
                ))}
              </ul>
              <dl className="mt-2 space-y-2 border-t border-neutral-900 pt-6 text-sm">
                <div className="flex justify-between"><dt className="text-neutral-500">Subtotal</dt><dd>{fmt(sub)}</dd></div>
                <div className="flex justify-between"><dt className="text-neutral-500">Courier, insured</dt><dd>Complimentary</dd></div>
                <div className="flex justify-between"><dt className="text-neutral-500">Duties</dt><dd>{duty ? fmt(duty) : "Included"}</dd></div>
                <div className="flex justify-between"><dt className="text-neutral-500">Sales tax</dt><dd>{fmt(tax)}</dd></div>
                <div className="flex items-baseline justify-between pt-4"><dt className="text-[11px] uppercase tracking-[0.3em]">Total</dt><dd className="font-serif text-4xl">{fmt(sub + tax)}</dd></div>
              </dl>
              <p className="mt-6 text-xs text-neutral-500">Settled by American Express ending 1005.</p>
            </section>
          ) : (
            <section id="c16-delivery" role="tabpanel" aria-label="Delivery">
              <div className="grid gap-8 py-6 sm:grid-cols-2">
                <div>
                  <h2 className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">Deliver to</h2>
                  <address className="mt-3 font-serif text-lg not-italic leading-relaxed">Elena Vasquez<br />The Greenwich, Residence 21C<br />105 Greenwich St<br />New York, NY 10006</address>
                </div>
                <div>
                  <h2 className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">Service</h2>
                  <p className="mt-3 font-serif text-lg">Private courier, signature required</p>
                  <p className="mt-1 text-sm text-neutral-500">Estimated Tuesday 24 November, 10 am – 2 pm</p>
                </div>
              </div>
              <ol className="mt-2 space-y-4 border-l border-neutral-900 pl-6">
                {[["Received", "22 Nov · 14:08", true], ["In the atelier", "Pressing & inspection", true], ["Dispatched", "Pending", false], ["Delivered", "Pending", false]].map(([s, d, done]) => (
                  <li key={s} className="relative">
                    <span aria-hidden="true" className={`absolute -left-[29px] top-1.5 h-2.5 w-2.5 rounded-full border border-neutral-900 ${done ? "bg-neutral-900" : "bg-[#f4f1ea]"}`} />
                    <p className={`font-serif text-lg ${done ? "" : "text-neutral-400"}`}>{s}</p>
                    <p className="text-xs text-neutral-500">{d}</p>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </article>

        <div className="mt-16 flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
          <a href="#track" className="group flex items-center gap-4 border border-neutral-200 px-10 py-4 text-[11px] uppercase tracking-[0.3em] text-neutral-100 hover:bg-neutral-100 hover:text-neutral-950">
            Follow your delivery <Arrow className="h-4 w-4 transition group-hover:translate-x-1" />
          </a>
          <a href="#concierge" className="text-[11px] uppercase tracking-[0.3em] text-neutral-500 underline underline-offset-8 hover:text-neutral-200">Speak to a concierge</a>
        </div>
      </div>
    </div>
  );
}
