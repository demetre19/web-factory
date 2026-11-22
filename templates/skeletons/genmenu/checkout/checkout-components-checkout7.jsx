import { useState } from "react";

// Single-page checkout · dark neon · card-on-page with in-card two-column layout
const ITEMS = [
  { id: 1, name: "Synthwave Sample Pack", type: "Digital download · 2.4 GB", price: 39, mono: "SW", grad: "from-fuchsia-500 to-violet-600" },
  { id: 2, name: "Analog Drum Kit Vol. 2", type: "Digital download · 860 MB", price: 24, mono: "AD", grad: "from-cyan-400 to-blue-600" },
  { id: 3, name: "Preset Bank: Neon Pads", type: "License · 1 seat", price: 18, mono: "NP", grad: "from-rose-500 to-orange-400" },
];

const Bolt = (p) => <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}><path d="M13 2L4 14h7l-1 8 9-12h-7z" /></svg>;
const Shield = (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" /><path d="M9 12l2 2 4-4" /></svg>;
const X = (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" {...p}><path d="M6 6l12 12M18 6L6 18" /></svg>;

const inp = "mt-1.5 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-fuchsia-400 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/30";
function Field({ id, label, className = "", ...rest }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="text-xs font-medium text-violet-200/70">{label}</label>
      <input id={id} name={id} className={inp} {...rest} />
    </div>
  );
}

export default function Checkout7() {
  const [items, setItems] = useState(ITEMS);
  const [license, setLicense] = useState("personal");
  const [tip, setTip] = useState(0);
  const [agree, setAgree] = useState(false);
  const mult = license === "commercial" ? 2 : 1;
  const sub = items.reduce((s, i) => s + i.price * mult, 0);
  const vat = +(sub * 0.2).toFixed(2);
  const total = sub + vat + tip;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0b0614] px-4 py-12 font-sans text-white">
      <div aria-hidden="true" className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-fuchsia-600/30 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />

      <div className="relative mx-auto max-w-5xl rounded-3xl bg-gradient-to-br from-fuchsia-500/50 via-violet-500/20 to-cyan-400/40 p-px">
        <div className="grid rounded-3xl bg-[#120a20]/95 backdrop-blur lg:grid-cols-[1.2fr_1fr]">
          <form onSubmit={(e) => e.preventDefault()} id="c7-form" className="space-y-8 p-6 sm:p-10">
            <div className="flex items-center gap-2"><Bolt className="h-5 w-5 text-fuchsia-400" /><span className="font-mono text-sm tracking-widest text-violet-200">VOIDSOUND / CHECKOUT</span></div>

            <fieldset className="space-y-4">
              <legend className="mb-4 text-lg font-semibold">Account</legend>
              <Field id="c7-email" label="Email — download links are sent here" type="email" autoComplete="email" defaultValue="nova.beats@example.com" required />
            </fieldset>

            <fieldset>
              <legend className="mb-4 text-lg font-semibold">License</legend>
              <div className="grid grid-cols-2 gap-3">
                {[["personal", "Personal", "Non-commercial projects"], ["commercial", "Commercial", "Releases, sync & client work · 2×"]].map(([v, t, d]) => (
                  <label key={v} className={`cursor-pointer rounded-xl border p-4 text-sm transition ${license === v ? "border-fuchsia-400 bg-fuchsia-500/10 shadow-[0_0_24px_-6px] shadow-fuchsia-500" : "border-white/10 bg-white/5"}`}>
                    <input type="radio" name="c7-license" value={v} checked={license === v} onChange={() => setLicense(v)} className="sr-only" />
                    <span className="block font-semibold">{t}</span><span className="text-violet-200/60">{d}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="grid grid-cols-2 gap-4">
              <legend className="mb-4 text-lg font-semibold">Billing</legend>
              <Field id="c7-name" label="Cardholder name" autoComplete="cc-name" defaultValue="Nova Lindqvist" className="col-span-2" />
              <Field id="c7-num" label="Card number" inputMode="numeric" autoComplete="cc-number" defaultValue="5200 8282 8282 8210" className="col-span-2" />
              <Field id="c7-exp" label="Expires" autoComplete="cc-exp" defaultValue="06/28" />
              <Field id="c7-cvc" label="CVC" inputMode="numeric" autoComplete="cc-csc" defaultValue="019" />
              <div>
                <label htmlFor="c7-country" className="text-xs font-medium text-violet-200/70">Country (for VAT)</label>
                <select id="c7-country" defaultValue="SE" className={inp}><option value="SE" className="bg-[#120a20]">Sweden</option><option value="DE" className="bg-[#120a20]">Germany</option><option value="GB" className="bg-[#120a20]">United Kingdom</option></select>
              </div>
              <Field id="c7-vat" label="VAT ID (optional)" autoComplete="off" />
            </fieldset>

            <fieldset>
              <legend className="mb-3 text-lg font-semibold">Tip the producers</legend>
              <div className="flex gap-2">
                {[0, 3, 5, 10].map((t) => (
                  <label key={t} className={`flex-1 cursor-pointer rounded-lg border py-2 text-center text-sm font-medium ${tip === t ? "border-cyan-400 bg-cyan-400/10 text-cyan-300" : "border-white/10 text-violet-200/70"}`}>
                    <input type="radio" name="c7-tip" checked={tip === t} onChange={() => setTip(t)} className="sr-only" />{t ? `$${t}` : "None"}
                  </label>
                ))}
              </div>
            </fieldset>
          </form>

          <aside aria-labelledby="c7-sum" className="flex flex-col border-t border-white/10 bg-white/[0.03] p-6 sm:p-10 lg:rounded-r-3xl lg:border-l lg:border-t-0">
            <h2 id="c7-sum" className="text-lg font-semibold">Cart <span className="text-violet-300/60">({items.length})</span></h2>
            {items.length === 0 ? (
              <p className="mt-6 rounded-xl border border-dashed border-white/15 p-6 text-center text-sm text-violet-200/60">Your cart is empty. <button type="button" onClick={() => setItems(ITEMS)} className="text-fuchsia-300 underline">Restore items</button></p>
            ) : (
              <ul className="mt-6 space-y-4">
                {items.map((i) => (
                  <li key={i.id} className="group flex items-center gap-3">
                    <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${i.grad} font-mono text-xs font-bold`}>{i.mono}</span>
                    <span className="min-w-0 flex-1 text-sm"><span className="block truncate font-medium">{i.name}</span><span className="text-xs text-violet-200/50">{i.type}</span></span>
                    <span className="font-mono text-sm">${(i.price * mult).toFixed(2)}</span>
                    <button type="button" aria-label={`Remove ${i.name}`} onClick={() => setItems(items.filter((x) => x.id !== i.id))} className="rounded p-1 text-violet-200/40 hover:bg-white/10 hover:text-white"><X className="h-4 w-4" /></button>
                  </li>
                ))}
              </ul>
            )}
            <dl className="mt-8 space-y-2 border-t border-white/10 pt-6 font-mono text-sm">
              <div className="flex justify-between text-violet-200/70"><dt>Subtotal</dt><dd>${sub.toFixed(2)}</dd></div>
              <div className="flex justify-between text-violet-200/70"><dt>VAT 20%</dt><dd>${vat.toFixed(2)}</dd></div>
              {tip > 0 && <div className="flex justify-between text-cyan-300"><dt>Tip</dt><dd>${tip.toFixed(2)}</dd></div>}
              <div className="flex justify-between pt-3 text-2xl font-bold text-white"><dt>Total</dt><dd>${total.toFixed(2)}</dd></div>
            </dl>
            <label className="mt-6 flex items-start gap-2 text-xs text-violet-200/70">
              <input type="checkbox" form="c7-form" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 accent-fuchsia-500" />
              I agree to the {license} license terms and understand downloads are non-refundable.
            </label>
            <button type="submit" form="c7-form" disabled={!agree || items.length === 0}
              className="mt-4 rounded-xl bg-gradient-to-r from-fuchsia-500 to-violet-600 py-3.5 font-semibold shadow-lg shadow-fuchsia-600/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40">
              Complete purchase
            </button>
            <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-violet-200/50"><Shield className="h-4 w-4" />Instant delivery after payment</p>
          </aside>
        </div>
      </div>
    </div>
  );
}
