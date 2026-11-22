import { useState } from "react";

// Multi-step checkout · bold/colourful neo-brutalist · split-pane, summary on the LEFT
const ITEMS = [
  { id: 1, name: "Riot Hoodie", variant: "Hot Pink · L", price: 78, qty: 1, mono: "RH", bg: "bg-pink-400" },
  { id: 2, name: "Sticker Bomb Pack", variant: "40 pcs", price: 12, qty: 3, mono: "SB", bg: "bg-cyan-300" },
  { id: 3, name: "Canvas Tote", variant: "Lemon", price: 22, qty: 1, mono: "CT", bg: "bg-lime-300" },
];
const STEPS = ["Ship", "Pay", "Review"];
const box = "border-[3px] border-black shadow-[4px_4px_0_0_#000]";

const Arrow = (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
const Star = (p) => <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}><path d="M12 2l2.6 6.9L22 9.3l-5.6 4.9 1.7 7.3L12 17.8 5.9 21.5l1.7-7.3L2 9.3l7.4-.4z" /></svg>;

function Field({ id, label, className = "", ...rest }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-sm font-black uppercase">{label}</label>
      <input id={id} name={id} {...rest} className={`w-full bg-white px-3 py-2.5 font-semibold ${box} focus:bg-yellow-100 focus:outline-none`} />
    </div>
  );
}

export default function Checkout3() {
  const [step, setStep] = useState(0);
  const [speed, setSpeed] = useState("normal");
  const [method, setMethod] = useState("card");
  const sub = ITEMS.reduce((s, i) => s + i.price * i.qty, 0);
  const ship = speed === "rocket" ? 15 : 5;
  const total = sub + ship;

  return (
    <div className="min-h-screen bg-yellow-300 font-sans text-black lg:grid lg:grid-cols-[minmax(0,420px)_1fr]">
      <aside aria-labelledby="c3-bag" className="relative overflow-hidden bg-violet-600 p-8 text-white lg:min-h-screen">
        <Star className="absolute -right-10 -top-10 h-48 w-48 text-violet-500" />
        <p className="relative text-3xl font-black italic tracking-tight">LOUD&nbsp;GOODS</p>
        <h2 id="c3-bag" className="relative mt-10 text-sm font-black uppercase tracking-widest text-yellow-300">Your haul</h2>
        <ul className="relative mt-4 space-y-4">
          {ITEMS.map((i) => (
            <li key={i.id} className={`flex items-center gap-4 bg-white p-3 text-black ${box}`}>
              <span className={`flex h-14 w-14 shrink-0 items-center justify-center border-[3px] border-black text-lg font-black ${i.bg}`}>{i.mono}</span>
              <span className="flex-1"><span className="block font-black">{i.name}</span><span className="text-sm font-semibold text-black/60">{i.variant} · ×{i.qty}</span></span>
              <span className="font-black">${i.price * i.qty}</span>
            </li>
          ))}
        </ul>
        <dl className="relative mt-8 space-y-2 font-bold">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>${sub.toFixed(2)}</dd></div>
          <div className="flex justify-between"><dt>Shipping</dt><dd>${ship.toFixed(2)}</dd></div>
          <div className="flex justify-between border-t-[3px] border-dashed border-white/60 pt-3 text-3xl font-black"><dt>Total</dt><dd className="text-yellow-300">${total.toFixed(2)}</dd></div>
        </dl>
      </aside>

      <main className="p-6 sm:p-10 lg:p-14">
        <nav aria-label="Checkout steps">
          <ol className="flex flex-wrap gap-3">
            {STEPS.map((s, i) => (
              <li key={s}>
                <button type="button" onClick={() => i <= step && setStep(i)} aria-current={i === step ? "step" : undefined}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black uppercase ${box}
                    ${i === step ? "bg-pink-500 text-white" : i < step ? "bg-lime-300" : "bg-white text-black/40"}`}>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-current text-xs">{i < step ? "✓" : i + 1}</span>{s}
                </button>
              </li>
            ))}
          </ol>
        </nav>

        <form onSubmit={(e) => { e.preventDefault(); setStep(Math.min(step + 1, 3)); }} className={`mt-8 max-w-2xl bg-white p-6 sm:p-8 ${box}`}>
          {step === 0 && (
            <fieldset className="grid gap-5 sm:grid-cols-2">
              <legend className="mb-5 text-4xl font-black uppercase leading-none">Where to?</legend>
              <Field id="c3-name" label="Name" autoComplete="name" defaultValue="Kai Okafor" className="sm:col-span-2" />
              <Field id="c3-street" label="Street" autoComplete="street-address" defaultValue="12 Electric Ave" className="sm:col-span-2" />
              <Field id="c3-city" label="City" autoComplete="address-level2" defaultValue="Austin" />
              <Field id="c3-zip" label="Zip" autoComplete="postal-code" defaultValue="78701" />
              <div className="sm:col-span-2">
                <p className="mb-2 text-sm font-black uppercase" id="c3-speed">Speed</p>
                <div role="radiogroup" aria-labelledby="c3-speed" className="grid grid-cols-2 gap-4">
                  {[["normal", "Normal", "$5 · 5 days"], ["rocket", "Rocket", "$15 · tomorrow"]].map(([v, t, d]) => (
                    <label key={v} className={`cursor-pointer p-4 ${box} ${speed === v ? "bg-cyan-300" : "bg-white"}`}>
                      <input type="radio" name="c3-speed" value={v} checked={speed === v} onChange={() => setSpeed(v)} className="sr-only" />
                      <span className="block text-xl font-black">{t}</span><span className="text-sm font-bold">{d}</span>
                    </label>
                  ))}
                </div>
              </div>
            </fieldset>
          )}
          {step === 1 && (
            <fieldset className="space-y-5">
              <legend className="mb-5 text-4xl font-black uppercase leading-none">Pay up</legend>
              <div className="flex gap-3">
                {[["card", "Card"], ["paypal", "PayPal"], ["klarna", "Pay in 4"]].map(([v, t]) => (
                  <label key={v} className={`flex-1 cursor-pointer px-3 py-3 text-center text-sm font-black uppercase ${box} ${method === v ? "bg-pink-500 text-white" : "bg-white"}`}>
                    <input type="radio" name="c3-method" value={v} checked={method === v} onChange={() => setMethod(v)} className="sr-only" />{t}
                  </label>
                ))}
              </div>
              {method === "card" ? (
                <div className="grid grid-cols-2 gap-5">
                  <Field id="c3-num" label="Card number" inputMode="numeric" autoComplete="cc-number" defaultValue="4000 1234 5678 9010" className="col-span-2" />
                  <Field id="c3-exp" label="Exp" autoComplete="cc-exp" defaultValue="04/29" />
                  <Field id="c3-cvc" label="CVC" autoComplete="cc-csc" inputMode="numeric" defaultValue="321" />
                </div>
              ) : (
                <p className={`bg-cyan-300 p-4 font-bold ${box}`}>You'll be redirected to {method === "paypal" ? "PayPal" : "our pay-in-4 partner"} after reviewing your order.</p>
              )}
            </fieldset>
          )}
          {step === 2 && (
            <section aria-labelledby="c3-review">
              <h2 id="c3-review" className="text-4xl font-black uppercase leading-none">Look good?</h2>
              <ul className="mt-6 space-y-3 font-bold">
                <li className={`flex justify-between bg-lime-300 p-4 ${box}`}><span>Kai Okafor · 12 Electric Ave, Austin 78701</span><button type="button" onClick={() => setStep(0)} className="underline">Edit</button></li>
                <li className={`flex justify-between bg-cyan-300 p-4 ${box}`}><span>{speed === "rocket" ? "Rocket — arrives tomorrow" : "Normal — 5 days"}</span><button type="button" onClick={() => setStep(0)} className="underline">Edit</button></li>
                <li className={`flex justify-between bg-pink-300 p-4 ${box}`}><span>{method === "card" ? "Card •••• 9010" : method === "paypal" ? "PayPal" : "Pay in 4"}</span><button type="button" onClick={() => setStep(1)} className="underline">Edit</button></li>
              </ul>
            </section>
          )}
          {step === 3 && (
            <section className="py-6 text-center" aria-live="polite">
              <p className="text-6xl font-black uppercase italic">Boom.</p>
              <p className="mt-3 text-lg font-bold">Order #LG-7781 is on its way to the mail truck.</p>
            </section>
          )}
          {step < 3 && (
            <div className="mt-8 flex items-center justify-between">
              {step > 0 ? <button type="button" onClick={() => setStep(step - 1)} className="font-black uppercase underline decoration-4 underline-offset-4">Back</button> : <span />}
              <button type="submit" className={`flex items-center gap-2 bg-black px-6 py-3 font-black uppercase text-yellow-300 active:translate-x-1 active:translate-y-1 active:shadow-none ${box}`}>
                {step === 2 ? `Pay $${total.toFixed(2)}` : "Next"} <Arrow className="h-5 w-5" />
              </button>
            </div>
          )}
        </form>
      </main>
    </div>
  );
}
