import { useState } from "react";

// Multi-step checkout · luxury-editorial · centered single column, roman-numeral stepper
const ITEMS = [
  { id: 1, name: "The Atelier Coat", detail: "Double-faced cashmere, Camel, IT 40", price: 2450, grad: "from-amber-200 via-orange-200 to-stone-300", mono: "A" },
  { id: 2, name: "Silk Carré", detail: "Twill, Ivory & Ink, 90 cm", price: 395, grad: "from-stone-100 via-stone-200 to-neutral-400", mono: "S" },
];
const STEPS = ["Delivery", "Payment", "Review"];
const ROMAN = ["I", "II", "III"];
const fmt = (n) => "€" + n.toLocaleString("en-IE", { minimumFractionDigits: 2 });

function Field({ id, label, className = "", ...rest }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-[11px] uppercase tracking-[0.2em] text-stone-500">{label}</label>
      <input id={id} name={id} {...rest} className="mt-2 w-full border-0 border-b border-stone-300 bg-transparent px-0 pb-2 font-serif text-lg text-stone-900 focus:border-stone-900 focus:outline-none focus:ring-0" />
    </div>
  );
}

export default function Checkout4() {
  const [step, setStep] = useState(0);
  const [service, setService] = useState("courier");
  const [gift, setGift] = useState(true);
  const [showBag, setShowBag] = useState(false);
  const subtotal = ITEMS.reduce((s, i) => s + i.price, 0);
  const delivery = service === "appointment" ? 45 : 0;

  return (
    <div className="min-h-screen bg-[#f7f4ef] text-stone-900">
      <header className="border-b border-stone-200 py-8 text-center">
        <p className="font-serif text-3xl tracking-[0.35em]">MAISON VERNE</p>
      </header>

      <div className="mx-auto max-w-xl px-6 py-12">
        <nav aria-label="Checkout progress">
          <ol className="flex items-baseline justify-center gap-6 sm:gap-10">
            {STEPS.map((s, i) => (
              <li key={s} className="flex items-baseline gap-6 sm:gap-10">
                <button type="button" onClick={() => i < step && setStep(i)} aria-current={i === step ? "step" : undefined}
                  className={`text-center transition ${i === step ? "text-stone-900" : i < step ? "text-stone-500 hover:text-stone-900" : "text-stone-300"}`}>
                  <span className="block font-serif text-2xl italic">{ROMAN[i]}</span>
                  <span className={`mt-1 block text-[11px] uppercase tracking-[0.25em] ${i === step ? "border-b border-stone-900 pb-1" : ""}`}>{s}</span>
                </button>
                {i < 2 && <span aria-hidden="true" className="h-px w-8 bg-stone-300 sm:w-14" />}
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-10 border-y border-stone-200">
          <button type="button" aria-expanded={showBag} onClick={() => setShowBag(!showBag)} className="flex w-full items-center justify-between py-4 text-[11px] uppercase tracking-[0.2em]">
            <span>{showBag ? "Hide" : "Show"} your selection ({ITEMS.length})</span>
            <span className="font-serif text-base normal-case tracking-normal">{fmt(subtotal + delivery)}</span>
          </button>
          {showBag && (
            <ul className="space-y-5 pb-6">
              {ITEMS.map((i) => (
                <li key={i.id} className="flex gap-5">
                  <div className={`flex h-24 w-20 items-center justify-center bg-gradient-to-b ${i.grad} font-serif text-3xl italic text-white/90`}>{i.mono}</div>
                  <div className="flex-1">
                    <p className="font-serif text-lg">{i.name}</p>
                    <p className="text-sm text-stone-500">{i.detail}</p>
                  </div>
                  <p className="font-serif">{fmt(i.price)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); setStep(Math.min(step + 1, 3)); }} className="mt-12">
          {step === 0 && (
            <>
              <fieldset className="grid grid-cols-2 gap-x-6 gap-y-8">
                <legend className="mb-8 font-serif text-3xl">Delivery details</legend>
                <Field id="c4-first" label="First name" autoComplete="given-name" defaultValue="Céline" />
                <Field id="c4-last" label="Surname" autoComplete="family-name" defaultValue="Arnaud" />
                <Field id="c4-addr" label="Address" autoComplete="street-address" defaultValue="14 Rue du Bac" className="col-span-2" />
                <Field id="c4-city" label="City" autoComplete="address-level2" defaultValue="Paris" />
                <Field id="c4-post" label="Postcode" autoComplete="postal-code" defaultValue="75007" />
                <Field id="c4-tel" label="Telephone" type="tel" autoComplete="tel" defaultValue="+33 6 12 34 56 78" className="col-span-2" />
              </fieldset>
              <fieldset className="mt-12">
                <legend className="text-[11px] uppercase tracking-[0.2em] text-stone-500">Service</legend>
                <div className="mt-4 divide-y divide-stone-200 border-y border-stone-200">
                  {[["courier", "Signature courier", "Complimentary · 2–3 working days", 0], ["appointment", "White-glove appointment", "Delivered at a time of your choosing", 45]].map(([v, t, d, p]) => (
                    <label key={v} className="flex cursor-pointer items-center gap-4 py-5">
                      <input type="radio" name="c4-service" value={v} checked={service === v} onChange={() => setService(v)} className="h-4 w-4 accent-stone-900" />
                      <span className="flex-1"><span className="block font-serif text-lg">{t}</span><span className="text-sm text-stone-500">{d}</span></span>
                      <span className="font-serif">{p ? fmt(p) : "—"}</span>
                    </label>
                  ))}
                </div>
                <label className="mt-6 flex items-center gap-3 text-sm">
                  <input type="checkbox" checked={gift} onChange={(e) => setGift(e.target.checked)} className="h-4 w-4 accent-stone-900" />
                  Present in signature box with handwritten card
                </label>
              </fieldset>
            </>
          )}
          {step === 1 && (
            <fieldset className="grid grid-cols-2 gap-x-6 gap-y-8">
              <legend className="mb-8 font-serif text-3xl">Payment</legend>
              <Field id="c4-holder" label="Cardholder" autoComplete="cc-name" defaultValue="Céline Arnaud" className="col-span-2" />
              <Field id="c4-num" label="Card number" inputMode="numeric" autoComplete="cc-number" defaultValue="3782 822463 10005" className="col-span-2" />
              <Field id="c4-exp" label="Expiry" autoComplete="cc-exp" defaultValue="02 / 29" />
              <Field id="c4-cvc" label="Security code" inputMode="numeric" autoComplete="cc-csc" defaultValue="1234" />
            </fieldset>
          )}
          {step === 2 && (
            <section aria-labelledby="c4-rev">
              <h2 id="c4-rev" className="font-serif text-3xl">Review</h2>
              <dl className="mt-8 space-y-6">
                {[["Deliver to", "Céline Arnaud, 14 Rue du Bac, 75007 Paris", 0], ["Service", (service === "courier" ? "Signature courier" : "White-glove appointment") + (gift ? ", gift presentation" : ""), 0], ["Payment", "American Express ending 0005", 1]].map(([k, v, s]) => (
                  <div key={k} className="grid grid-cols-[120px_1fr_auto] items-baseline gap-4 border-b border-stone-200 pb-6">
                    <dt className="text-[11px] uppercase tracking-[0.2em] text-stone-500">{k}</dt>
                    <dd className="font-serif text-lg">{v}</dd>
                    <button type="button" onClick={() => setStep(s)} className="text-[11px] uppercase tracking-[0.2em] underline underline-offset-4">Edit</button>
                  </div>
                ))}
              </dl>
              <dl className="mt-8 space-y-2 text-sm">
                <div className="flex justify-between"><dt>Subtotal</dt><dd>{fmt(subtotal)}</dd></div>
                <div className="flex justify-between"><dt>Delivery</dt><dd>{delivery ? fmt(delivery) : "Complimentary"}</dd></div>
                <div className="flex justify-between pt-3 font-serif text-2xl"><dt>Total</dt><dd>{fmt(subtotal + delivery)}</dd></div>
              </dl>
            </section>
          )}
          {step === 3 && (
            <section className="py-8 text-center" aria-live="polite">
              <p className="font-serif text-4xl italic">Merci, Céline.</p>
              <p className="mt-4 text-sm text-stone-600">Your order MV-0093 is being prepared in our atelier.</p>
            </section>
          )}
          {step < 3 && (
            <div className="mt-14 flex flex-col items-center gap-5">
              <button type="submit" className="w-full bg-stone-900 py-4 text-[12px] uppercase tracking-[0.3em] text-[#f7f4ef] hover:bg-stone-700">
                {step === 0 ? "Proceed to payment" : step === 1 ? "Review order" : "Confirm purchase"}
              </button>
              {step > 0 && <button type="button" onClick={() => setStep(step - 1)} className="text-[11px] uppercase tracking-[0.2em] text-stone-500 hover:text-stone-900">Return to {STEPS[step - 1]}</button>}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
