import { useState } from "react";

// Multi-step checkout · dark · card-on-page with vertical stepper rail
const ITEMS = [
  { id: 1, name: "Orbit Wireless Earbuds", variant: "Graphite", price: 149, qty: 1, mono: "OE", grad: "from-zinc-600 to-zinc-800" },
  { id: 2, name: "Charging Case Sleeve", variant: "Moss", price: 24, qty: 1, mono: "CS", grad: "from-emerald-700 to-emerald-900" },
];
const STEPS = [
  { name: "Shipping", desc: "Where should we send it?" },
  { name: "Payment", desc: "How would you like to pay?" },
  { name: "Review", desc: "Confirm and place order" },
];

const Icon = {
  check: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}><path d="M5 12l5 5L20 7" /></svg>,
  chevron: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" {...p}><path d="M6 9l6 6 6-6" /></svg>,
  truck: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}><path d="M3 6h11v9H3zM14 9h4l3 3v3h-7" /><circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" /></svg>,
};

const inputCls = "mt-1.5 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/30";
function Field({ id, label, className = "", ...rest }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="text-xs font-medium uppercase tracking-wider text-zinc-400">{label}</label>
      <input id={id} name={id} className={inputCls} {...rest} />
    </div>
  );
}

export default function Checkout2() {
  const [step, setStep] = useState(0);
  const [qty, setQty] = useState({ 1: 1, 2: 1 });
  const [openSummary, setOpenSummary] = useState(false);
  const [form, setForm] = useState({ name: "Jordan Reyes", address: "88 Harbor Lane, Apt 4", city: "Portland", zip: "97209", card: "5555 4444 3333 1111", exp: "11/27", cvc: "" });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const subtotal = ITEMS.reduce((s, i) => s + i.price * qty[i.id], 0);
  const total = subtotal + 9.5;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4 font-sans text-zinc-100 sm:p-10">
      <div className="w-full max-w-4xl overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 shadow-2xl shadow-black/50 md:grid md:grid-cols-[240px_1fr]">
        <nav aria-label="Checkout steps" className="border-b border-zinc-800 bg-zinc-900 p-6 md:border-b-0 md:border-r">
          <p className="text-sm font-semibold text-emerald-400">pulse/audio</p>
          <ol className="mt-8 space-y-0">
            {STEPS.map((s, i) => {
              const done = i < step, cur = i === step;
              return (
                <li key={s.name} className="relative flex gap-3 pb-8 last:pb-0">
                  {i < STEPS.length - 1 && <span aria-hidden="true" className={`absolute left-[13px] top-8 h-[calc(100%-2rem)] w-0.5 ${done ? "bg-emerald-400" : "bg-zinc-700"}`} />}
                  <span className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold
                    ${done ? "bg-emerald-400 text-zinc-950" : cur ? "border-2 border-emerald-400 text-emerald-400" : "border-2 border-zinc-700 text-zinc-500"}`}>
                    {done ? <Icon.check className="h-4 w-4" /> : i + 1}
                  </span>
                  <button type="button" disabled={!done} onClick={() => setStep(i)} aria-current={cur ? "step" : undefined} className="text-left disabled:cursor-default">
                    <span className={`block text-sm font-semibold ${cur || done ? "text-zinc-100" : "text-zinc-500"}`}>{s.name}</span>
                    <span className="block text-xs text-zinc-500">{s.desc}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="p-6 sm:p-8">
          <form onSubmit={(e) => { e.preventDefault(); setStep(Math.min(step + 1, 3)); }}>
            {step === 0 && (
              <fieldset className="space-y-4">
                <legend className="mb-4 text-xl font-semibold">Shipping address</legend>
                <Field id="c2-name" label="Full name" autoComplete="name" value={form.name} onChange={set("name")} required />
                <Field id="c2-addr" label="Address" autoComplete="street-address" value={form.address} onChange={set("address")} required />
                <div className="grid grid-cols-2 gap-4">
                  <Field id="c2-city" label="City" autoComplete="address-level2" value={form.city} onChange={set("city")} required />
                  <Field id="c2-zip" label="Postal code" autoComplete="postal-code" value={form.zip} onChange={set("zip")} required />
                </div>
                <div>
                  <label htmlFor="c2-country" className="text-xs font-medium uppercase tracking-wider text-zinc-400">Country</label>
                  <select id="c2-country" className={inputCls} defaultValue="US"><option value="US">United States</option><option value="CA">Canada</option><option value="MX">Mexico</option></select>
                </div>
              </fieldset>
            )}
            {step === 1 && (
              <fieldset className="space-y-4">
                <legend className="mb-4 text-xl font-semibold">Payment</legend>
                <Field id="c2-card" label="Card number" inputMode="numeric" autoComplete="cc-number" value={form.card} onChange={set("card")} required />
                <div className="grid grid-cols-2 gap-4">
                  <Field id="c2-exp" label="Expiry" autoComplete="cc-exp" value={form.exp} onChange={set("exp")} required />
                  <Field id="c2-cvc" label="Security code" inputMode="numeric" autoComplete="cc-csc" value={form.cvc} onChange={set("cvc")} aria-describedby="c2-cvc-hint" />
                </div>
                <p id="c2-cvc-hint" className="text-xs text-zinc-500">3 digits on the back of your card.</p>
              </fieldset>
            )}
            {step === 2 && (
              <section aria-labelledby="c2-rev" className="space-y-4">
                <h2 id="c2-rev" className="text-xl font-semibold">Review</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4 text-sm">
                    <p className="flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-500"><Icon.truck className="h-4 w-4" />Ship to</p>
                    <address className="mt-2 not-italic leading-relaxed">{form.name}<br />{form.address}<br />{form.city} {form.zip}</address>
                  </div>
                  <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4 text-sm">
                    <p className="text-xs uppercase tracking-wider text-zinc-500">Pay with</p>
                    <p className="mt-2">Card ending {form.card.replace(/\s/g, "").slice(-4)}</p>
                    <p className="text-zinc-500">Expires {form.exp}</p>
                  </div>
                </div>
              </section>
            )}
            {step === 3 && (
              <section className="py-10 text-center" aria-live="polite">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-400"><Icon.check className="h-7 w-7" /></span>
                <h2 className="mt-4 text-xl font-semibold">You're all set</h2>
                <p className="mt-1 text-sm text-zinc-400">Order #PA-55102 · ${total.toFixed(2)}</p>
              </section>
            )}

            <div className="mt-6 rounded-xl border border-zinc-800">
              <button type="button" aria-expanded={openSummary} aria-controls="c2-sum" onClick={() => setOpenSummary(!openSummary)} className="flex w-full items-center justify-between px-4 py-3 text-sm">
                <span className="flex items-center gap-2 text-zinc-300">Order summary <Icon.chevron className={`h-4 w-4 transition ${openSummary ? "rotate-180" : ""}`} /></span>
                <span className="font-semibold text-emerald-400">${total.toFixed(2)}</span>
              </button>
              {openSummary && (
                <div id="c2-sum" className="border-t border-zinc-800 px-4 py-4">
                  <ul className="space-y-3">
                    {ITEMS.map((i) => (
                      <li key={i.id} className="flex items-center gap-3 text-sm">
                        <span className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${i.grad} text-xs font-bold text-white/80`}>{i.mono}</span>
                        <span className="flex-1"><span className="block">{i.name}</span><span className="text-xs text-zinc-500">{i.variant}</span></span>
                        <span className="flex items-center rounded-md border border-zinc-700">
                          <button type="button" aria-label={`Decrease ${i.name}`} onClick={() => setQty({ ...qty, [i.id]: Math.max(1, qty[i.id] - 1) })} className="px-2 py-0.5 text-zinc-400 hover:text-white">−</button>
                          <output className="w-5 text-center text-xs">{qty[i.id]}</output>
                          <button type="button" aria-label={`Increase ${i.name}`} onClick={() => setQty({ ...qty, [i.id]: qty[i.id] + 1 })} className="px-2 py-0.5 text-zinc-400 hover:text-white">+</button>
                        </span>
                        <span className="w-16 text-right">${(i.price * qty[i.id]).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                  <dl className="mt-4 space-y-1.5 border-t border-zinc-800 pt-3 text-sm text-zinc-400">
                    <div className="flex justify-between"><dt>Subtotal</dt><dd>${subtotal.toFixed(2)}</dd></div>
                    <div className="flex justify-between"><dt>Shipping</dt><dd>$9.50</dd></div>
                  </dl>
                </div>
              )}
            </div>

            {step < 3 && (
              <div className="mt-6 flex gap-3">
                {step > 0 && <button type="button" onClick={() => setStep(step - 1)} className="rounded-lg border border-zinc-700 px-5 py-3 text-sm font-medium text-zinc-300 hover:bg-zinc-800">Back</button>}
                <button type="submit" className="flex-1 rounded-lg bg-emerald-400 px-5 py-3 text-sm font-semibold text-zinc-950 hover:bg-emerald-300">
                  {step === 2 ? "Place order" : "Continue"}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
