import { useState } from "react";

// Payment screen · dark · saved-cards picker with add-new-card form + summary sidebar
const INITIAL = [
  { id: "c1", brand: "Visa", last4: "4242", exp: "08/27", holder: "Riley Chen", grad: "from-sky-500 to-indigo-700", isDefault: true },
  { id: "c2", brand: "Mastercard", last4: "8210", exp: "03/26", holder: "Riley Chen", grad: "from-orange-500 to-rose-700" },
  { id: "c3", brand: "Amex", last4: "0005", exp: "11/28", holder: "R. Chen — Business", grad: "from-teal-400 to-emerald-700" },
];

const Mark = ({ brand }) =>
  brand === "Mastercard" ? (
    <svg viewBox="0 0 32 20" className="h-5 w-8" aria-hidden="true"><circle cx="12" cy="10" r="7" fill="#eb001b" /><circle cx="20" cy="10" r="7" fill="#f79e1b" fillOpacity=".9" /></svg>
  ) : (
    <svg viewBox="0 0 40 20" className="h-5 w-10" aria-hidden="true"><text x="20" y="15" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="900" fontStyle={brand === "Visa" ? "italic" : "normal"} fontSize={brand === "Visa" ? 13 : 10} fill="#fff">{brand.toUpperCase()}</text></svg>
  );
const Check = (p) => <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" {...p}><path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-8 8a1 1 0 01-1.4 0l-4-4a1 1 0 111.4-1.4L8 12.6l7.3-7.3a1 1 0 011.4 0z" clipRule="evenodd" /></svg>;
const Plus = (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" {...p}><path d="M12 5v14M5 12h14" /></svg>;
const Warn = (p) => <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" {...p}><path fillRule="evenodd" d="M8.3 2.9a2 2 0 013.4 0l6.4 11.1A2 2 0 0116.4 17H3.6a2 2 0 01-1.7-3L8.3 2.9zM10 7a1 1 0 00-1 1v3a1 1 0 102 0V8a1 1 0 00-1-1zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>;

const inp = "mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/30";

export default function Checkout12() {
  const [cards, setCards] = useState(INITIAL);
  const [selected, setSelected] = useState("c1");
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ number: "", exp: "", cvc: "", holder: "" });
  const isExpired = (exp) => { const [m, y] = exp.split("/").map(Number); return new Date(2000 + y, m) < new Date(2026, 10, 22); };

  const addCard = (e) => {
    e.preventDefault();
    const d = draft.number.replace(/\D/g, "");
    if (d.length < 12) return;
    const id = "c" + Date.now();
    setCards([...cards, { id, brand: d[0] === "4" ? "Visa" : d[0] === "5" ? "Mastercard" : "Amex", last4: d.slice(-4), exp: draft.exp || "01/30", holder: draft.holder || "Riley Chen", grad: "from-violet-500 to-fuchsia-700" }]);
    setSelected(id);
    setAdding(false);
    setDraft({ number: "", exp: "", cvc: "", holder: "" });
  };
  const makeDefault = (id) => setCards(cards.map((c) => ({ ...c, isDefault: c.id === id })));
  const remove = (id) => { const rest = cards.filter((c) => c.id !== id); setCards(rest); if (selected === id) setSelected(rest[0]?.id); };
  const sel = cards.find((c) => c.id === selected);

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100">
      <div className="mx-auto grid max-w-5xl gap-8 px-6 py-12 lg:grid-cols-[1fr_320px]">
        <main>
          <p className="text-sm text-sky-400">Step 2 of 3</p>
          <h1 className="mt-1 text-2xl font-semibold">Choose a payment method</h1>

          <form onSubmit={(e) => e.preventDefault()} id="c12-pay" className="mt-8">
            <fieldset>
              <legend className="mb-3 text-sm font-medium text-slate-400">Saved cards</legend>
              <div className="space-y-3">
                {cards.map((c) => {
                  const expired = isExpired(c.exp);
                  return (
                    <label key={c.id} className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition
                      ${expired ? "cursor-not-allowed border-slate-800 opacity-60" : selected === c.id ? "border-sky-400 bg-sky-400/5 ring-1 ring-sky-400" : "border-slate-800 bg-slate-900 hover:border-slate-600"}`}>
                      <input type="radio" name="c12-card" value={c.id} checked={selected === c.id} disabled={expired} onChange={() => setSelected(c.id)} className="sr-only" />
                      <span className={`flex h-12 w-20 shrink-0 items-end justify-end rounded-lg bg-gradient-to-br p-1.5 ${c.grad}`}><Mark brand={c.brand} /></span>
                      <span className="flex-1 text-sm">
                        <span className="flex items-center gap-2 font-medium">{c.brand} •••• {c.last4}
                          {c.isDefault && <span className="rounded bg-slate-700 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-slate-300">Default</span>}
                        </span>
                        <span className={`flex items-center gap-1 ${expired ? "text-amber-400" : "text-slate-400"}`}>
                          {expired && <Warn className="h-3.5 w-3.5" />}{expired ? `Expired ${c.exp}` : `${c.holder} · Exp ${c.exp}`}
                        </span>
                      </span>
                      <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${selected === c.id ? "border-sky-400 bg-sky-400 text-slate-950" : "border-slate-600"}`}>
                        {selected === c.id && <Check className="h-3 w-3" />}
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
            {sel && (
              <div className="mt-3 flex gap-4 text-xs text-slate-400">
                {!sel.isDefault && <button type="button" onClick={() => makeDefault(sel.id)} className="hover:text-sky-300">Set {sel.brand} •••• {sel.last4} as default</button>}
                <button type="button" onClick={() => remove(sel.id)} className="hover:text-rose-300">Remove this card</button>
              </div>
            )}
          </form>

          <div className="mt-6 rounded-xl border border-dashed border-slate-700">
            <button type="button" aria-expanded={adding} aria-controls="c12-new" onClick={() => setAdding(!adding)} className="flex w-full items-center gap-3 p-4 text-sm font-medium text-sky-300">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-400/10"><Plus className={`h-4 w-4 transition ${adding ? "rotate-45" : ""}`} /></span>
              {adding ? "Cancel" : "Add a new card"}
            </button>
            {adding && (
              <form id="c12-new" onSubmit={addCard} className="grid grid-cols-2 gap-4 border-t border-slate-800 p-4">
                <div className="col-span-2">
                  <label htmlFor="c12-num" className="text-xs text-slate-400">Card number</label>
                  <input id="c12-num" inputMode="numeric" autoComplete="cc-number" required value={draft.number} onChange={(e) => setDraft({ ...draft, number: e.target.value })} className={inp} />
                </div>
                <div className="col-span-2">
                  <label htmlFor="c12-holder" className="text-xs text-slate-400">Cardholder name</label>
                  <input id="c12-holder" autoComplete="cc-name" value={draft.holder} onChange={(e) => setDraft({ ...draft, holder: e.target.value })} className={inp} />
                </div>
                <div>
                  <label htmlFor="c12-exp" className="text-xs text-slate-400">Expiry (MM/YY)</label>
                  <input id="c12-exp" autoComplete="cc-exp" value={draft.exp} onChange={(e) => setDraft({ ...draft, exp: e.target.value })} className={inp} />
                </div>
                <div>
                  <label htmlFor="c12-cvc" className="text-xs text-slate-400">CVC</label>
                  <input id="c12-cvc" inputMode="numeric" autoComplete="cc-csc" value={draft.cvc} onChange={(e) => setDraft({ ...draft, cvc: e.target.value })} className={inp} />
                </div>
                <button type="submit" className="col-span-2 rounded-lg bg-slate-100 py-2.5 text-sm font-semibold text-slate-900 hover:bg-white">Save card</button>
              </form>
            )}
          </div>
        </main>

        <aside aria-labelledby="c12-sum" className="self-start rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 id="c12-sum" className="font-semibold">Summary</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-slate-600 to-slate-800 text-xs font-bold">KB</span><span className="flex-1">Mechanical Keyboard<span className="block text-xs text-slate-400">Tactile · 75%</span></span><span>$189.00</span></li>
            <li className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-sky-700 to-slate-800 text-xs font-bold">DM</span><span className="flex-1">Desk Mat<span className="block text-xs text-slate-400">Navy · XL</span></span><span>$32.00</span></li>
          </ul>
          <dl className="mt-5 space-y-2 border-t border-slate-800 pt-4 text-sm">
            <div className="flex justify-between text-slate-400"><dt>Subtotal</dt><dd>$221.00</dd></div>
            <div className="flex justify-between text-slate-400"><dt>Shipping</dt><dd>$6.00</dd></div>
            <div className="flex justify-between text-slate-400"><dt>Tax</dt><dd>$18.16</dd></div>
            <div className="flex justify-between pt-2 text-lg font-semibold"><dt>Total</dt><dd>$245.16</dd></div>
          </dl>
          <button type="submit" form="c12-pay" disabled={!sel} className="mt-6 w-full rounded-lg bg-sky-400 py-3 text-sm font-semibold text-slate-950 hover:bg-sky-300 disabled:opacity-40">
            {sel ? `Pay with •••• ${sel.last4}` : "Select a card"}
          </button>
        </aside>
      </div>
    </div>
  );
}
