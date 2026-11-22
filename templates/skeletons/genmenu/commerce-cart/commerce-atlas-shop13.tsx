import React, { useState } from 'react';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

interface KitItem {
  id: string;
  name: string;
  spec: string;
  price: number;
  qty: number;
  mono: string;
  c1: string;
  c2: string;
}

const START_KIT: KitItem[] = [
  { id: 'v1', name: 'Aero Thermal Jersey', spec: 'Cobalt · Size M', price: 145, qty: 1, mono: 'AJ', c1: '#4F46E5', c2: '#818CF8' },
  { id: 'v2', name: 'Pro Cargo Bib Shorts', spec: 'Midnight · Size M', price: 195, qty: 1, mono: 'CB', c1: '#FB7185', c2: '#F43F5E' },
];

const ADDONS = [
  { id: 'va1', name: 'Aero Bidon 750ml', price: 22, mono: 'AB', c1: '#A3E635', c2: '#4ADE80' },
  { id: 'va2', name: 'Merino Ride Socks', price: 26, mono: 'RS', c1: '#38BDF8', c2: '#3B82F6' },
  { id: 'va3', name: 'Bar Tape Neon', price: 34, mono: 'BT', c1: '#FACC15', c2: '#FB923C' },
  { id: 'va4', name: 'Saddle Tool Roll', price: 58, mono: 'TR', c1: '#C084FC', c2: '#6366F1' },
];

export function Shop13() {
  const [items, setItems] = useState<KitItem[]>(START_KIT);
  const [promo, setPromo] = useState('');
  const [rate, setRate] = useState(0);
  const [status, setStatus] = useState('');

  const threshold = 400;
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const discount = Number((subtotal * rate).toFixed(2));
  const shipping = subtotal === 0 || subtotal >= threshold ? 0 : 18;
  const total = Math.max(0, subtotal - discount + shipping);
  const pct = Math.min(100, Math.round((subtotal / threshold) * 100));

  const changeQty = (id: string, d: number) => {
    setItems((p) => p.map((i) => (i.id === id ? { ...i, qty: Math.max(1, i.qty + d) } : i)));
  };

  const remove = (id: string) => setItems((p) => p.filter((i) => i.id !== id));

  const addAddon = (a: (typeof ADDONS)[number]) => {
    setItems((p) => {
      const hit = p.find((x) => x.id === a.id);
      if (hit) return p.map((x) => (x.id === a.id ? { ...x, qty: x.qty + 1 } : x));
      return [...p, { id: a.id, name: a.name, spec: 'One Size', price: a.price, qty: 1, mono: a.mono, c1: a.c1, c2: a.c2 }];
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-950 font-jakarta">
      <header className="border-b-2 border-slate-950 bg-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
          <a href="#veloce" className="font-bricolage text-2xl font-extrabold tracking-tight whitespace-nowrap shrink-0">
            VELOCE CLUB
          </a>
          <nav className="hidden md:flex items-center gap-6 text-xs font-bold uppercase tracking-wider" aria-label="Primary">
            <a href="#jerseys" className="hover:underline whitespace-nowrap shrink-0">Jerseys</a>
            <a href="#bibs" className="hover:underline whitespace-nowrap shrink-0">Bibs</a>
            <a href="#packs" className="hover:underline whitespace-nowrap shrink-0">Packs</a>
            <a href="#club" className="hover:underline whitespace-nowrap shrink-0">Ride Club</a>
          </nav>
          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-lime-300 text-slate-950 rounded-md text-xs font-extrabold whitespace-nowrap shrink-0 tabular-nums">
            <ShoppingBag className="w-4 h-4" />
            <span>{items.reduce((s, i) => s + i.qty, 0)} KIT</span>
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        {/* Bold Free-Shipping Banner */}
        <section className="p-5 bg-white border-2 border-slate-950 rounded-xl shadow-[5px_5px_0_#4F46E5]" aria-label="Shipping progress">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
            <h1 className="font-bricolage text-2xl font-extrabold">Your Race Bag</h1>
            <p className="text-xs font-bold tabular-nums">
              {subtotal >= threshold
                ? 'Free Priority Courier Unlocked!'
                : `$${(threshold - subtotal).toFixed(0)} away from Free Priority Courier`}
            </p>
          </div>
          <div className="h-3.5 bg-slate-200 border border-slate-950 rounded-full overflow-hidden">
            <div className="h-full bg-lime-400 transition-all duration-300" style={{ width: `${pct}%` }} />
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left 7 Cols */}
          <section className="lg:col-span-7 space-y-4" aria-label="Bag items">
            {items.length === 0 ? (
              <div className="p-8 bg-white border-2 border-slate-950 rounded-xl text-center">
                <p className="font-bold">Nothing in your race bag yet.</p>
                <button
                  type="button"
                  onClick={() => setItems(START_KIT)}
                  className="mt-3 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg"
                >
                  Reload Race Kit
                </button>
              </div>
            ) : (
              items.map((item) => (
                <article
                  key={item.id}
                  className="p-4 bg-white border-2 border-slate-950 rounded-xl flex flex-wrap sm:flex-nowrap items-center gap-4"
                >
                  <div className="w-20 h-20 rounded-lg border-2 border-slate-950 overflow-hidden shrink-0">
                    <svg viewBox="0 0 100 100" className="w-full h-full" role="img" aria-label={item.name}>
                      <defs>
                        <linearGradient id={`vel-${item.id}`} x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor={item.c1} />
                          <stop offset="100%" stopColor={item.c2} />
                        </linearGradient>
                      </defs>
                      <rect width="100" height="100" fill={`url(#vel-${item.id})`} />
                      <text x="50" y="58" textAnchor="middle" fill="#FFFFFF" fontSize="24" fontWeight="800">
                        {item.mono}
                      </text>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-base truncate">{item.name}</h2>
                    <p className="text-xs text-slate-600">{item.spec}</p>
                    <p className="text-sm font-extrabold text-indigo-600 mt-1 tabular-nums">${item.price}</p>
                  </div>
                  <div className="flex items-center border-2 border-slate-950 rounded-lg">
                    <button
                      type="button"
                      onClick={() => changeQty(item.id, -1)}
                      aria-label={`Decrease quantity for ${item.name}`}
                      className="p-2 hover:bg-slate-100"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-extrabold tabular-nums">{item.qty}</span>
                    <button
                      type="button"
                      onClick={() => changeQty(item.id, 1)}
                      aria-label={`Increase quantity for ${item.name}`}
                      className="p-2 hover:bg-slate-100"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(item.id)}
                    aria-label={`Remove ${item.name}`}
                    className="p-2 text-slate-500 hover:text-rose-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </article>
              ))
            )}
          </section>

          {/* Right 5 Cols Summary */}
          <aside className="lg:col-span-5 bg-white border-2 border-slate-950 rounded-xl p-6 shadow-[5px_5px_0_#111827] space-y-5" aria-label="Order summary">
            <h2 className="font-bricolage text-xl font-extrabold">Order Summary</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (promo.trim().toUpperCase() === 'VELO15') {
                  setRate(0.15);
                  setStatus('15% club discount active.');
                } else {
                  setRate(0);
                  setStatus('Invalid code. Try VELO15.');
                }
              }}
              className="space-y-2"
            >
              <label htmlFor="velo-promo" className="text-xs font-bold block">
                Club Promo Code (try VELO15)
              </label>
              <div className="flex gap-2">
                <input
                  id="velo-promo"
                  type="text"
                  value={promo}
                  onChange={(e) => setPromo(e.target.value)}
                  placeholder="VELO15"
                  className="flex-1 border-2 border-slate-950 rounded-lg px-3 py-2 text-xs font-semibold"
                />
                <button type="submit" className="px-4 py-2 bg-lime-300 border-2 border-slate-950 rounded-lg text-xs font-extrabold">
                  Apply
                </button>
              </div>
              {status && <p className="text-xs font-semibold text-indigo-700">{status}</p>}
            </form>

            <div className="space-y-2 pt-3 border-t-2 border-slate-950 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold tabular-nums">${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-rose-600 font-bold">
                  <span>Club Discount</span>
                  <span className="tabular-nums">-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Courier</span>
                <span className="font-bold tabular-nums">{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-slate-200 text-lg font-extrabold">
                <span>Total</span>
                <span className="tabular-nums">${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="button"
              disabled={items.length === 0}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-extrabold text-sm rounded-lg border-2 border-slate-950 inline-flex items-center justify-center gap-2"
            >
              <span>Checkout Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </aside>
        </div>

        {/* Cross-Sell Strip */}
        <section className="pt-4" aria-label="Last-mile ride essentials">
          <h2 className="font-bricolage text-xl font-extrabold mb-4">Add Last-Mile Essentials</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {ADDONS.map((a) => (
              <article key={a.id} className="bg-white border-2 border-slate-950 rounded-xl overflow-hidden">
                <div className="aspect-[16/10]">
                  <svg viewBox="0 0 200 125" className="w-full h-full" role="img" aria-label={a.name}>
                    <defs>
                      <linearGradient id={`va-${a.id}`} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={a.c1} />
                        <stop offset="100%" stopColor={a.c2} />
                      </linearGradient>
                    </defs>
                    <rect width="200" height="125" fill={`url(#va-${a.id})`} />
                    <text x="100" y="72" textAnchor="middle" fill="#FFFFFF" fontSize="24" fontWeight="800">
                      {a.mono}
                    </text>
                  </svg>
                </div>
                <div className="p-3.5 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-extrabold">{a.name}</h3>
                    <p className="text-xs text-slate-600 tabular-nums">${a.price}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => addAddon(a)}
                    className="px-2.5 py-1 bg-lime-300 border-2 border-slate-950 rounded text-xs font-extrabold"
                  >
                    + Add
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Shop13;
