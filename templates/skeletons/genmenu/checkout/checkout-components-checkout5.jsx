import { useState } from "react";

// Single-page checkout · light-warm · split-pane with sticky order summary + promo
const ITEMS = [
  { id: 1, name: "Stoneware Pour-Over Set", variant: "Speckled Oat", price: 64, mono: "P", grad: "from-amber-100 to-orange-200" },
  { id: 2, name: "Single-Origin Beans", variant: "Huila, Colombia · 340 g", price: 19, mono: "B", grad: "from-amber-700 to-stone-800" },
  { id: 3, name: "Linen Tea Towel", variant: "Terracotta", price: 16, mono: "L", grad: "from-orange-300 to-rose-300" },
];

const Tag = (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}><path d="M20.6 13.4l-7.2 7.2a2 2 0 01-2.8 0L3 13V3h10l7.6 7.6a2 2 0 010 2.8z" /><circle cx="7.5" cy="7.5" r="1.5" /></svg>;
const Leaf = (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}><path d="M5 21c0-9 6-15 15-16-1 9-7 15-15 16zM5 21l7-7" /></svg>;

const inp = "mt-1 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-stone-900 focus:border-amber-600 focus:outline-none focus:ring-4 focus:ring-amber-600/15";
function Field({ id, label, className = "", ...rest }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="text-sm font-medium text-stone-700">{label}</label>
      <input id={id} name={id} className={inp} {...rest} />
    </div>
  );
}
function Section({ n, title, children }) {
  return (
    <section aria-labelledby={`c5-s${n}`} className="rounded-2xl border border-stone-200 bg-white/70 p-6">
      <h2 id={`c5-s${n}`} className="flex items-center gap-3 text-lg font-semibold text-stone-900">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-600 text-sm text-white">{n}</span>{title}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default function Checkout5() {
  const [qty, setQty] = useState({ 1: 1, 2: 2, 3: 2 });
  const [delivery, setDelivery] = useState("ground");
  const [code, setCode] = useState("");
  const [promo, setPromo] = useState(null);
  const [promoError, setPromoError] = useState("");
  const [pay, setPay] = useState("card");
  const sub = ITEMS.reduce((s, i) => s + i.price * qty[i.id], 0);
  const discount = promo ? Math.round(sub * 0.15 * 100) / 100 : 0;
  const ship = delivery === "ground" ? (sub >= 100 ? 0 : 7) : 14;
  const total = sub - discount + ship;

  const apply = (e) => {
    e.preventDefault();
    if (code.trim().toUpperCase() === "HEARTH15") { setPromo("HEARTH15"); setPromoError(""); }
    else { setPromoError("That code isn't valid. Try HEARTH15."); }
  };

  return (
    <div className="min-h-screen bg-[#faf6f0] font-sans text-stone-800">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="text-xl font-bold tracking-tight text-amber-800">hearth&amp;co.</span>
        <a href="#cart" className="text-sm text-stone-500 underline-offset-4 hover:underline">Return to cart</a>
      </header>
      <div className="mx-auto grid max-w-6xl gap-8 px-6 pb-16 lg:grid-cols-[1fr_380px]">
        <form id="c5-form" onSubmit={(e) => e.preventDefault()} className="space-y-6">
          <Section n={1} title="Contact">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="c5-email" label="Email" type="email" autoComplete="email" defaultValue="maya.patel@example.com" />
              <Field id="c5-phone" label="Phone (for delivery updates)" type="tel" autoComplete="tel" defaultValue="(503) 555-0142" />
            </div>
          </Section>
          <Section n={2} title="Delivery address">
            <div className="grid gap-4 sm:grid-cols-6">
              <Field id="c5-name" label="Full name" autoComplete="name" defaultValue="Maya Patel" className="sm:col-span-6" />
              <Field id="c5-addr1" label="Address line 1" autoComplete="address-line1" defaultValue="2716 SE Clinton St" className="sm:col-span-4" />
              <Field id="c5-addr2" label="Apt, suite (optional)" autoComplete="address-line2" className="sm:col-span-2" />
              <Field id="c5-city" label="City" autoComplete="address-level2" defaultValue="Portland" className="sm:col-span-3" />
              <Field id="c5-state" label="State" autoComplete="address-level1" defaultValue="OR" className="sm:col-span-1" />
              <Field id="c5-zip" label="ZIP code" autoComplete="postal-code" defaultValue="97202" className="sm:col-span-2" />
            </div>
          </Section>
          <Section n={3} title="Delivery speed">
            <fieldset className="grid gap-3 sm:grid-cols-2">
              <legend className="sr-only">Choose delivery speed</legend>
              {[["ground", "Ground", sub >= 100 ? "Free over $100" : "$7.00", "Thu, Dec 3 – Mon, Dec 7"], ["two", "2-Day", "$14.00", "Wed, Nov 25"]].map(([v, t, p, d]) => (
                <label key={v} className={`flex cursor-pointer gap-3 rounded-xl border-2 p-4 ${delivery === v ? "border-amber-600 bg-amber-50" : "border-stone-200 bg-white"}`}>
                  <input type="radio" name="c5-delivery" value={v} checked={delivery === v} onChange={() => setDelivery(v)} className="mt-1 accent-amber-600" />
                  <span className="flex-1 text-sm"><span className="flex justify-between font-semibold"><span>{t}</span><span>{p}</span></span><span className="text-stone-500">{d}</span></span>
                </label>
              ))}
            </fieldset>
          </Section>
          <Section n={4} title="Payment">
            <fieldset>
              <legend className="sr-only">Payment method</legend>
              <div className="flex gap-2 rounded-xl bg-stone-100 p-1 text-sm font-medium">
                {[["card", "Card"], ["bank", "Bank transfer"]].map(([v, t]) => (
                  <label key={v} className={`flex-1 cursor-pointer rounded-lg py-2 text-center ${pay === v ? "bg-white shadow-sm" : "text-stone-500"}`}>
                    <input type="radio" name="c5-pay" value={v} checked={pay === v} onChange={() => setPay(v)} className="sr-only" />{t}
                  </label>
                ))}
              </div>
              {pay === "card" ? (
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <Field id="c5-cc" label="Card number" inputMode="numeric" autoComplete="cc-number" defaultValue="4111 1111 1111 1111" className="col-span-2" />
                  <Field id="c5-exp" label="Expiry date" autoComplete="cc-exp" defaultValue="09/27" />
                  <Field id="c5-cvc" label="CVC" inputMode="numeric" autoComplete="cc-csc" defaultValue="874" />
                </div>
              ) : (
                <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">We'll email bank details after you place the order. Items are reserved for 3 days.</p>
              )}
            </fieldset>
          </Section>
        </form>

        <aside aria-labelledby="c5-sum" className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-2xl bg-stone-900 p-6 text-stone-100">
            <h2 id="c5-sum" className="text-lg font-semibold">Your order</h2>
            <ul className="mt-5 space-y-4">
              {ITEMS.map((i) => (
                <li key={i.id} className="flex items-center gap-3">
                  <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${i.grad} text-lg font-bold text-stone-900/60`}>{i.mono}</span>
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="truncate font-medium">{i.name}</p>
                    <p className="truncate text-stone-400">{i.variant}</p>
                    <div className="mt-1 inline-flex items-center rounded-full bg-stone-800 text-xs">
                      <button type="button" aria-label={`Decrease quantity of ${i.name}`} onClick={() => setQty({ ...qty, [i.id]: Math.max(1, qty[i.id] - 1) })} className="px-2 py-0.5">−</button>
                      <span aria-live="polite" className="w-4 text-center">{qty[i.id]}</span>
                      <button type="button" aria-label={`Increase quantity of ${i.name}`} onClick={() => setQty({ ...qty, [i.id]: qty[i.id] + 1 })} className="px-2 py-0.5">+</button>
                    </div>
                  </div>
                  <span className="text-sm font-medium">${(i.price * qty[i.id]).toFixed(2)}</span>
                </li>
              ))}
            </ul>

            <form onSubmit={apply} className="mt-6">
              <label htmlFor="c5-promo" className="flex items-center gap-1.5 text-sm text-stone-300"><Tag className="h-4 w-4" />Promo code</label>
              <div className="mt-1.5 flex gap-2">
                <input id="c5-promo" value={code} onChange={(e) => setCode(e.target.value)} aria-invalid={!!promoError} aria-describedby="c5-promo-msg" className="min-w-0 flex-1 rounded-xl border border-stone-700 bg-stone-800 px-3 py-2 text-sm uppercase focus:border-amber-500 focus:outline-none" />
                <button type="submit" className="rounded-xl bg-stone-700 px-4 text-sm font-medium hover:bg-stone-600">Apply</button>
              </div>
              <p id="c5-promo-msg" className={`mt-1.5 text-xs ${promoError ? "text-rose-300" : "text-emerald-300"}`}>{promoError || (promo && `${promo} applied — 15% off`)}</p>
            </form>

            <dl className="mt-4 space-y-2 border-t border-stone-700 pt-4 text-sm">
              <div className="flex justify-between"><dt className="text-stone-400">Subtotal</dt><dd>${sub.toFixed(2)}</dd></div>
              {promo && <div className="flex justify-between text-emerald-300"><dt>Discount ({promo})</dt><dd>−${discount.toFixed(2)}</dd></div>}
              <div className="flex justify-between"><dt className="text-stone-400">Delivery</dt><dd>{ship ? `$${ship.toFixed(2)}` : "Free"}</dd></div>
              <div className="flex justify-between pt-2 text-xl font-semibold"><dt>Total</dt><dd>${total.toFixed(2)}</dd></div>
            </dl>
            <button type="submit" form="c5-form" className="mt-6 w-full rounded-xl bg-amber-500 py-3.5 font-semibold text-stone-900 hover:bg-amber-400">Place order</button>
            <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-stone-400"><Leaf className="h-3.5 w-3.5" />Plastic-free packaging, carbon-neutral shipping</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
