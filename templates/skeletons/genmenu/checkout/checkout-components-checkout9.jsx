import { useState } from "react";

// Shopping cart · bold/colourful · slide-over drawer with free-shipping progress + empty state
const INITIAL = [
  { id: 1, name: "Mango Chili Gummies", size: "200 g bag", price: 8.5, qty: 2, mono: "MC", bg: "bg-orange-400", fg: "text-orange-950" },
  { id: 2, name: "Yuzu Sparkling Soda", size: "6-pack", price: 14, qty: 1, mono: "YS", bg: "bg-lime-400", fg: "text-lime-950" },
  { id: 3, name: "Ube Crunch Bar", size: "Box of 12", price: 21, qty: 1, mono: "UB", bg: "bg-purple-400", fg: "text-purple-950" },
];
const FREE_AT = 60;

const Close = (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true" {...p}><path d="M6 6l12 12M18 6L6 18" /></svg>;
const Cart = (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}><circle cx="9" cy="20" r="1.5" /><circle cx="18" cy="20" r="1.5" /><path d="M2 3h3l2.7 12.4a2 2 0 002 1.6h8.6a2 2 0 002-1.5L22 8H6" /></svg>;
const Truck = (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}><path d="M2 6h12v10H2zM14 10h4l4 4v2h-8" /><circle cx="6" cy="18" r="2" /><circle cx="18" cy="18" r="2" /></svg>;
const Sad = (p) => <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" {...p}><circle cx="32" cy="32" r="28" fill="#fde047" stroke="#1c1917" strokeWidth="3" /><circle cx="23" cy="27" r="3" fill="#1c1917" /><circle cx="41" cy="27" r="3" fill="#1c1917" /><path d="M22 45c5-6 15-6 20 0" stroke="#1c1917" strokeWidth="3" strokeLinecap="round" /></svg>;

export default function Checkout9() {
  const [open, setOpen] = useState(true);
  const [items, setItems] = useState(INITIAL);
  const [gift, setGift] = useState(false);
  const [code, setCode] = useState("");
  const [promoMsg, setPromoMsg] = useState(null);
  const [promoOn, setPromoOn] = useState(false);

  const change = (id, d) => setItems(items.flatMap((i) => (i.id !== id ? [i] : i.qty + d <= 0 ? [] : [{ ...i, qty: i.qty + d }])));
  const sub = items.reduce((s, i) => s + i.price * i.qty, 0);
  const off = promoOn ? 5 : 0;
  const pct = Math.min(100, (sub / FREE_AT) * 100);
  const count = items.reduce((s, i) => s + i.qty, 0);
  const total = sub - off + (gift ? 3 : 0);

  return (
    <div className="relative min-h-screen overflow-hidden bg-pink-100 font-sans">
      {/* background storefront */}
      <header className="flex items-center justify-between bg-pink-500 px-6 py-4 text-white">
        <span className="text-2xl font-black tracking-tight">SNACKBOX!</span>
        <button type="button" onClick={() => setOpen(true)} aria-label={`Open cart, ${count} items`} className="relative rounded-full bg-white p-2.5 text-pink-600">
          <Cart className="h-6 w-6" />
          {count > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-yellow-300 px-1 text-xs font-black text-stone-900">{count}</span>}
        </button>
      </header>
      <div className="grid grid-cols-2 gap-6 p-6 sm:grid-cols-4" aria-hidden="true">
        {["bg-orange-300", "bg-lime-300", "bg-purple-300", "bg-cyan-300", "bg-yellow-300", "bg-rose-300", "bg-teal-300", "bg-amber-300"].map((c, k) => (
          <div key={k} className={`aspect-square rounded-3xl ${c}`} />
        ))}
      </div>

      {open && <div className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm" onClick={() => setOpen(false)} aria-hidden="true" />}

      <aside role="dialog" aria-modal="true" aria-labelledby="c9-title"
        className={`absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-center justify-between bg-yellow-300 px-6 py-5">
          <h2 id="c9-title" className="text-2xl font-black text-stone-900">Your cart <span className="ml-1 rounded-full bg-stone-900 px-2.5 py-0.5 text-sm text-yellow-300">{count}</span></h2>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close cart" className="rounded-full bg-white p-2 text-stone-900 hover:rotate-90 transition"><Close className="h-5 w-5" /></button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <Sad className="h-24 w-24" />
            <p className="mt-6 text-2xl font-black text-stone-900">Nothing to munch on</p>
            <p className="mt-2 text-stone-600">Your cart is empty. Fill it with something wild.</p>
            <button type="button" onClick={() => setItems(INITIAL)} className="mt-8 rounded-full bg-pink-500 px-8 py-3 font-black text-white shadow-[0_6px_0_0_#9d174d] active:translate-y-1 active:shadow-[0_2px_0_0_#9d174d]">Shop snacks</button>
          </div>
        ) : (
          <>
            <div className="border-b-2 border-dashed border-stone-200 px-6 py-4">
              <p className="flex items-center gap-2 text-sm font-bold text-stone-800">
                <Truck className="h-5 w-5 text-teal-600" />
                {sub >= FREE_AT ? "Woohoo! You've unlocked free shipping." : <>You're <span className="text-pink-600">${(FREE_AT - sub).toFixed(2)}</span> away from free shipping</>}
              </p>
              <div role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label="Progress to free shipping" className="mt-3 h-3 overflow-hidden rounded-full bg-stone-100">
                <div className="h-full rounded-full bg-gradient-to-r from-teal-400 via-lime-400 to-yellow-300 transition-all" style={{ width: `${pct}%` }} />
              </div>
            </div>

            <ul className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
              {items.map((i) => (
                <li key={i.id} className="flex gap-4 rounded-2xl bg-stone-50 p-3">
                  <span className={`flex h-20 w-20 shrink-0 -rotate-3 items-center justify-center rounded-2xl text-xl font-black ${i.bg} ${i.fg}`}>{i.mono}</span>
                  <div className="flex flex-1 flex-col">
                    <p className="font-black leading-tight text-stone-900">{i.name}</p>
                    <p className="text-sm text-stone-500">{i.size}</p>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center gap-1 rounded-full bg-white p-1 shadow-sm">
                        <button type="button" aria-label={i.qty === 1 ? `Remove ${i.name}` : `Decrease ${i.name}`} onClick={() => change(i.id, -1)} className="flex h-7 w-7 items-center justify-center rounded-full bg-stone-900 font-black text-white">{i.qty === 1 ? "×" : "−"}</button>
                        <output aria-live="polite" className="w-6 text-center font-black">{i.qty}</output>
                        <button type="button" aria-label={`Increase ${i.name}`} onClick={() => change(i.id, 1)} className="flex h-7 w-7 items-center justify-center rounded-full bg-pink-500 font-black text-white">+</button>
                      </div>
                      <span className="font-black text-stone-900">${(i.price * i.qty).toFixed(2)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="space-y-4 border-t-4 border-stone-900 bg-white px-6 py-5">
              <form onSubmit={(e) => { e.preventDefault(); const ok = code.trim().toUpperCase() === "CRUNCH5"; setPromoOn(ok); setPromoMsg(ok ? "CRUNCH5: $5 off!" : "Nope — try CRUNCH5"); }} className="flex gap-2">
                <label htmlFor="c9-code" className="sr-only">Promo code</label>
                <input id="c9-code" value={code} onChange={(e) => setCode(e.target.value)} aria-describedby="c9-msg" className="min-w-0 flex-1 rounded-full border-2 border-stone-900 px-4 py-2 text-sm font-bold uppercase focus:outline-none focus:ring-4 focus:ring-yellow-300" />
                <button type="submit" className="rounded-full bg-stone-900 px-5 text-sm font-black text-white">Apply code</button>
              </form>
              {promoMsg && <p id="c9-msg" className={`text-sm font-bold ${promoOn ? "text-teal-600" : "text-pink-600"}`}>{promoMsg}</p>}
              <label className="flex items-center gap-2 text-sm font-bold text-stone-700">
                <input type="checkbox" checked={gift} onChange={(e) => setGift(e.target.checked)} className="h-5 w-5 accent-pink-500" />Add confetti gift wrap (+$3)
              </label>
              <dl className="space-y-1 text-sm font-bold text-stone-600">
                <div className="flex justify-between"><dt>Subtotal</dt><dd>${sub.toFixed(2)}</dd></div>
                {promoOn && <div className="flex justify-between text-teal-600"><dt>Promo</dt><dd>−$5.00</dd></div>}
                <div className="flex justify-between text-xl font-black text-stone-900"><dt>Total</dt><dd>${total.toFixed(2)}</dd></div>
              </dl>
              <button type="button" className="w-full rounded-full bg-pink-500 py-4 text-lg font-black text-white shadow-[0_6px_0_0_#9d174d] active:translate-y-1 active:shadow-[0_2px_0_0_#9d174d]">Checkout →</button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
