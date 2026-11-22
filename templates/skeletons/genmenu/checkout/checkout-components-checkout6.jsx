import { useState } from "react";

// Single-page checkout · minimal/professional · centered single column with express pay
const ITEMS = [
  { id: 1, name: "Desk Lamp No. 3", variant: "Matte white", price: 129, qty: 1, grad: "from-sky-100 to-indigo-200" },
  { id: 2, name: "Warm LED Bulb", variant: "2700K", price: 9, qty: 2, grad: "from-yellow-100 to-amber-200" },
];

const Apple = (p) => <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}><path d="M16.4 12.6c0-2.4 2-3.6 2.1-3.6-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.8-1.6 0-3.1 1-4 2.4-1.7 3-.4 7.3 1.2 9.7.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.2-.8s1.9.8 3.2.8c1.3 0 2.2-1.2 3-2.4.9-1.4 1.3-2.7 1.3-2.8 0 0-2.6-1-2.6-3.9zM14 5.5c.7-.8 1.1-1.9 1-3-1 0-2.1.7-2.8 1.5-.6.7-1.2 1.8-1 2.9 1.1.1 2.1-.6 2.8-1.4z" /></svg>;
const G = (p) => <svg viewBox="0 0 24 24" aria-hidden="true" {...p}><path fill="#4285F4" d="M22 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.6a4.8 4.8 0 01-2 3.2v2.6h3.3c1.9-1.8 3.1-4.4 3.1-7.6z" /><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.3-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3v2.6A10 10 0 0012 22z" /><path fill="#FBBC05" d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3a10 10 0 000 9.2L6.4 14z" /><path fill="#EA4335" d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 003 7.4L6.4 10c.8-2.3 3-4.1 5.6-4.1z" /></svg>;
const Info = (p) => <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" {...p}><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 11-2 0 1 1 0 012 0zm-1 2a1 1 0 00-1 1v4a1 1 0 102 0v-4a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;

function Field({ id, label, hint, className = "", ...rest }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm text-gray-600">{label}</label>
      <input id={id} name={id} aria-describedby={hint ? `${id}-hint` : undefined} {...rest}
        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-[15px] focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20" />
      {hint && <p id={`${id}-hint`} className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

export default function Checkout6() {
  const [showItems, setShowItems] = useState(false);
  const [saveInfo, setSaveInfo] = useState(true);
  const [billingSame, setBillingSame] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const sub = ITEMS.reduce((s, i) => s + i.price * i.qty, 0);
  const tax = +(sub * 0.0725).toFixed(2);
  const total = sub + tax;

  return (
    <div className="min-h-screen bg-gray-50 py-10 font-sans text-gray-900">
      <div className="mx-auto max-w-lg px-5">
        <p className="text-center text-lg font-semibold tracking-tight">lumen<span className="text-indigo-600">.</span></p>

        <div className="mt-6 rounded-xl border border-gray-200 bg-white">
          <button type="button" aria-expanded={showItems} aria-controls="c6-items" onClick={() => setShowItems(!showItems)} className="flex w-full items-center justify-between px-4 py-3 text-sm">
            <span className="text-indigo-600">{showItems ? "Hide" : "Show"} order summary · {ITEMS.reduce((s, i) => s + i.qty, 0)} items</span>
            <span className="font-semibold">${total.toFixed(2)}</span>
          </button>
          {showItems && (
            <div id="c6-items" className="border-t border-gray-100 px-4 py-4">
              <ul className="space-y-3">
                {ITEMS.map((i) => (
                  <li key={i.id} className="flex items-center gap-3 text-sm">
                    <span className={`h-12 w-12 rounded-lg bg-gradient-to-br ${i.grad}`} aria-hidden="true" />
                    <span className="flex-1"><span className="block font-medium">{i.name}</span><span className="text-gray-500">{i.variant} · Qty {i.qty}</span></span>
                    <span>${(i.price * i.qty).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              <dl className="mt-4 space-y-1 border-t border-gray-100 pt-3 text-sm">
                <div className="flex justify-between text-gray-600"><dt>Subtotal</dt><dd>${sub.toFixed(2)}</dd></div>
                <div className="flex justify-between text-gray-600"><dt>Shipping</dt><dd>Free</dd></div>
                <div className="flex justify-between text-gray-600"><dt>Sales tax</dt><dd>${tax.toFixed(2)}</dd></div>
              </dl>
            </div>
          )}
        </div>

        <section aria-labelledby="c6-express" className="mt-8">
          <h2 id="c6-express" className="text-center text-xs font-medium uppercase tracking-wider text-gray-500">Express checkout</h2>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <button type="button" className="flex h-11 items-center justify-center gap-1 rounded-lg bg-black text-[15px] font-medium text-white"><Apple className="h-5 w-5" />Pay</button>
            <button type="button" className="flex h-11 items-center justify-center gap-1.5 rounded-lg border border-gray-300 bg-white text-[15px] font-medium"><G className="h-5 w-5" />Pay</button>
          </div>
          <div className="my-8 flex items-center gap-3 text-xs text-gray-400"><span className="h-px flex-1 bg-gray-200" />OR<span className="h-px flex-1 bg-gray-200" /></div>
        </section>

        {submitted ? (
          <div role="status" className="rounded-xl border border-indigo-200 bg-indigo-50 p-6 text-center">
            <p className="font-semibold text-indigo-900">Order LM-30017 confirmed</p>
            <p className="mt-1 text-sm text-indigo-800">Shipping to 40 Valencia St, San Francisco.</p>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-8">
            <fieldset className="space-y-3">
              <legend className="mb-3 text-lg font-semibold">Contact</legend>
              <Field id="c6-email" label="Email" type="email" autoComplete="email" defaultValue="sam.okoro@example.com" required />
              <label className="flex items-center gap-2 text-sm text-gray-600"><input type="checkbox" defaultChecked className="h-4 w-4 rounded accent-indigo-600" />Email me about new arrivals</label>
            </fieldset>

            <fieldset className="grid grid-cols-2 gap-3">
              <legend className="mb-3 text-lg font-semibold">Shipping</legend>
              <div className="col-span-2">
                <label htmlFor="c6-country" className="block text-sm text-gray-600">Country / region</label>
                <select id="c6-country" defaultValue="US" className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-[15px] focus:border-indigo-600 focus:outline-none"><option value="US">United States</option><option value="CA">Canada</option></select>
              </div>
              <Field id="c6-first" label="First name" autoComplete="given-name" defaultValue="Sam" />
              <Field id="c6-last" label="Last name" autoComplete="family-name" defaultValue="Okoro" />
              <Field id="c6-addr" label="Address" autoComplete="street-address" defaultValue="40 Valencia St" className="col-span-2" />
              <Field id="c6-city" label="City" autoComplete="address-level2" defaultValue="San Francisco" />
              <Field id="c6-zip" label="ZIP code" autoComplete="postal-code" defaultValue="94103" />
              <div className="col-span-2 flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2.5 text-sm text-gray-700">
                <Info className="h-4 w-4 text-indigo-600" />Free standard shipping · arrives Tue, Dec 1
              </div>
            </fieldset>

            <fieldset className="space-y-3">
              <legend className="mb-1 text-lg font-semibold">Payment</legend>
              <p className="text-sm text-gray-500">All transactions are secure and encrypted.</p>
              <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
                <Field id="c6-card" label="Card number" inputMode="numeric" autoComplete="cc-number" defaultValue="4242 4242 4242 4242" />
                <div className="grid grid-cols-2 gap-3">
                  <Field id="c6-exp" label="Expiration date" autoComplete="cc-exp" defaultValue="12/28" hint="MM / YY" />
                  <Field id="c6-cvc" label="Security code" inputMode="numeric" autoComplete="cc-csc" defaultValue="555" hint="3–4 digits" />
                </div>
                <Field id="c6-cname" label="Name on card" autoComplete="cc-name" defaultValue="Sam Okoro" />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-600"><input type="checkbox" checked={billingSame} onChange={(e) => setBillingSame(e.target.checked)} className="h-4 w-4 accent-indigo-600" />Use shipping address as billing address</label>
              {!billingSame && (
                <div className="grid grid-cols-2 gap-3 rounded-xl bg-gray-100 p-4">
                  <Field id="c6-baddr" label="Billing address" autoComplete="billing street-address" className="col-span-2" />
                  <Field id="c6-bcity" label="City" autoComplete="billing address-level2" />
                  <Field id="c6-bzip" label="ZIP code" autoComplete="billing postal-code" />
                </div>
              )}
              <label className="flex items-center gap-2 text-sm text-gray-600"><input type="checkbox" checked={saveInfo} onChange={(e) => setSaveInfo(e.target.checked)} className="h-4 w-4 accent-indigo-600" />Save my information for faster checkout</label>
            </fieldset>

            <button type="submit" className="w-full rounded-lg bg-indigo-600 py-3.5 text-[15px] font-semibold text-white hover:bg-indigo-700">Pay ${total.toFixed(2)}</button>
            <p className="text-center text-xs text-gray-500">By placing your order you agree to our Terms and Privacy Policy.</p>
          </form>
        )}
      </div>
    </div>
  );
}
