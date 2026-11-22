import { useState } from "react";

// Multi-step checkout · minimal/professional · split-pane with order summary sidebar
const ITEMS = [
  { id: 1, name: "Field Jacket", variant: "Olive / M", price: 168, qty: 1, grad: "from-emerald-200 to-teal-400" },
  { id: 2, name: "Merino Crew Sock", variant: "Charcoal / 3-pack", price: 32, qty: 2, grad: "from-slate-200 to-slate-400" },
];
const STEPS = ["Shipping", "Payment", "Review"];

const Check = (p) => (
  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" {...p}>
    <path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-8 8a1 1 0 01-1.4 0l-4-4a1 1 0 111.4-1.4L8 12.6l7.3-7.3a1 1 0 011.4 0z" clipRule="evenodd" />
  </svg>
);
const Lock = (p) => (
  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" {...p}>
    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
  </svg>
);

function Field({ id, label, type = "text", autoComplete, className = "", ...rest }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">{label}</label>
      <input id={id} name={id} type={type} autoComplete={autoComplete} {...rest}
        className="mt-1.5 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900" />
    </div>
  );
}

export default function Checkout1() {
  const [step, setStep] = useState(0);
  const [shipping, setShipping] = useState("standard");
  const [placed, setPlaced] = useState(false);
  const subtotal = ITEMS.reduce((s, i) => s + i.price * i.qty, 0);
  const ship = shipping === "express" ? 18 : 0;
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const total = subtotal + ship + tax;

  const next = (e) => { e.preventDefault(); step < 2 ? setStep(step + 1) : setPlaced(true); };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <header className="border-b border-slate-200">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-lg font-semibold tracking-tight">Northfold</span>
          <span className="flex items-center gap-1.5 text-xs text-slate-500"><Lock className="h-3.5 w-3.5" />Secure checkout</span>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl lg:grid-cols-[1fr_400px]">
        <main className="px-6 py-10 lg:pr-12">
          <nav aria-label="Checkout progress">
            <ol className="flex items-center">
              {STEPS.map((s, i) => (
                <li key={s} className={`flex items-center ${i < STEPS.length - 1 ? "flex-1" : ""}`}>
                  <button type="button" onClick={() => i < step && setStep(i)} disabled={i > step}
                    aria-current={i === step ? "step" : undefined}
                    className="flex items-center gap-2 text-sm disabled:cursor-default">
                    <span className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold
                      ${i < step ? "border-slate-900 bg-slate-900 text-white" : i === step ? "border-slate-900 text-slate-900" : "border-slate-300 text-slate-400"}`}>
                      {i < step ? <Check className="h-4 w-4" /> : i + 1}
                    </span>
                    <span className={i <= step ? "font-medium" : "text-slate-400"}>{s}</span>
                  </button>
                  {i < STEPS.length - 1 && <span className={`mx-4 h-px flex-1 ${i < step ? "bg-slate-900" : "bg-slate-200"}`} />}
                </li>
              ))}
            </ol>
          </nav>

          {placed ? (
            <section className="mt-12 rounded-lg border border-slate-200 p-8 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-white"><Check className="h-6 w-6" /></span>
              <h1 className="mt-4 text-xl font-semibold">Order NF-20481 placed</h1>
              <p className="mt-2 text-sm text-slate-600">A confirmation has been sent to your inbox.</p>
              <button type="button" onClick={() => { setPlaced(false); setStep(0); }} className="mt-6 text-sm font-medium underline underline-offset-4">Start over</button>
            </section>
          ) : (
            <form onSubmit={next} className="mt-10 space-y-8">
              {step === 0 && (
                <>
                  <fieldset>
                    <legend className="text-base font-semibold">Contact</legend>
                    <Field id="c1-email" label="Email address" type="email" autoComplete="email" className="mt-4" defaultValue="avery.lin@example.com" />
                  </fieldset>
                  <fieldset>
                    <legend className="text-base font-semibold">Shipping address</legend>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <Field id="c1-first" label="First name" autoComplete="given-name" defaultValue="Avery" />
                      <Field id="c1-last" label="Last name" autoComplete="family-name" defaultValue="Lin" />
                      <Field id="c1-addr" label="Street address" autoComplete="street-address" className="col-span-2" defaultValue="221 Mercer Street" />
                      <Field id="c1-city" label="City" autoComplete="address-level2" defaultValue="New York" />
                      <div className="grid grid-cols-2 gap-4">
                        <Field id="c1-state" label="State" autoComplete="address-level1" defaultValue="NY" />
                        <Field id="c1-zip" label="ZIP" autoComplete="postal-code" inputMode="numeric" defaultValue="10012" />
                      </div>
                    </div>
                  </fieldset>
                  <fieldset>
                    <legend className="text-base font-semibold">Delivery method</legend>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {[["standard", "Standard", "4–6 business days", "Free"], ["express", "Express", "1–2 business days", "$18.00"]].map(([v, t, d, p]) => (
                        <label key={v} className={`flex cursor-pointer justify-between rounded-md border p-4 text-sm ${shipping === v ? "border-slate-900 ring-1 ring-slate-900" : "border-slate-300"}`}>
                          <span className="flex gap-3">
                            <input type="radio" name="c1-ship" value={v} checked={shipping === v} onChange={() => setShipping(v)} className="mt-0.5 accent-slate-900" />
                            <span><span className="block font-medium">{t}</span><span className="text-slate-500">{d}</span></span>
                          </span>
                          <span className="font-medium">{p}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </>
              )}

              {step === 1 && (
                <fieldset>
                  <legend className="text-base font-semibold">Payment details</legend>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <Field id="c1-name" label="Name on card" autoComplete="cc-name" className="col-span-2" defaultValue="Avery Lin" />
                    <Field id="c1-card" label="Card number" autoComplete="cc-number" inputMode="numeric" className="col-span-2" defaultValue="4242 4242 4242 4242" />
                    <Field id="c1-exp" label="Expiration (MM/YY)" autoComplete="cc-exp" defaultValue="08/28" />
                    <Field id="c1-cvc" label="CVC" autoComplete="cc-csc" inputMode="numeric" defaultValue="123" />
                  </div>
                  <label className="mt-5 flex items-center gap-2 text-sm text-slate-700">
                    <input type="checkbox" defaultChecked className="h-4 w-4 accent-slate-900" />Billing address same as shipping
                  </label>
                </fieldset>
              )}

              {step === 2 && (
                <section aria-labelledby="c1-review">
                  <h2 id="c1-review" className="text-base font-semibold">Review your order</h2>
                  <dl className="mt-4 divide-y divide-slate-200 rounded-md border border-slate-200 text-sm">
                    {[["Contact", "avery.lin@example.com", 0], ["Ship to", "221 Mercer Street, New York, NY 10012", 0], ["Method", shipping === "express" ? "Express · 1–2 days" : "Standard · 4–6 days", 0], ["Payment", "Visa ending 4242", 1]].map(([k, v, s]) => (
                      <div key={k} className="flex items-start gap-4 px-4 py-3">
                        <dt className="w-20 shrink-0 text-slate-500">{k}</dt>
                        <dd className="flex-1">{v}</dd>
                        <button type="button" onClick={() => setStep(s)} className="font-medium text-slate-900 underline underline-offset-2">Change</button>
                      </div>
                    ))}
                  </dl>
                </section>
              )}

              <div className="flex items-center justify-between border-t border-slate-200 pt-6">
                {step > 0 ? (
                  <button type="button" onClick={() => setStep(step - 1)} className="text-sm font-medium text-slate-600 hover:text-slate-900">← Back</button>
                ) : <span />}
                <button type="submit" className="rounded-md bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-700">
                  {step === 0 ? "Continue to payment" : step === 1 ? "Review order" : `Place order · $${total.toFixed(2)}`}
                </button>
              </div>
            </form>
          )}
        </main>

        <aside aria-labelledby="c1-summary" className="border-t border-slate-200 bg-slate-50 px-6 py-10 lg:border-l lg:border-t-0">
          <h2 id="c1-summary" className="text-base font-semibold">Order summary</h2>
          <ul className="mt-6 space-y-5">
            {ITEMS.map((i) => (
              <li key={i.id} className="flex gap-4">
                <div className={`relative h-16 w-16 shrink-0 rounded-md bg-gradient-to-br ${i.grad}`}>
                  <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-slate-700 text-[11px] font-semibold text-white">{i.qty}</span>
                </div>
                <div className="flex-1 text-sm">
                  <p className="font-medium">{i.name}</p>
                  <p className="text-slate-500">{i.variant}</p>
                </div>
                <p className="text-sm font-medium">${(i.price * i.qty).toFixed(2)}</p>
              </li>
            ))}
          </ul>
          <dl className="mt-8 space-y-3 border-t border-slate-200 pt-6 text-sm">
            <div className="flex justify-between"><dt className="text-slate-600">Subtotal</dt><dd>${subtotal.toFixed(2)}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-600">Shipping</dt><dd>{ship ? `$${ship.toFixed(2)}` : "Free"}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-600">Estimated tax</dt><dd>${tax.toFixed(2)}</dd></div>
            <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-semibold"><dt>Total</dt><dd>${total.toFixed(2)}</dd></div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
