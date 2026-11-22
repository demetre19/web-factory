import React, { useState } from 'react';
import { Minus, Plus, Trash2, ShoppingBag, X } from 'lucide-react';

interface ZestLine {
  id: string;
  name: string;
  pack: string;
  price: number;
  qty: number;
  mono: string;
  c1: string;
  c2: string;
}

const PANTRY = [
  { id: 'z1', name: 'Yuzu Spritz 12-Pack', pack: '330ml Cans', price: 36, mono: 'YZ', c1: '#FACC15', c2: '#FDE047' },
  { id: 'z2', name: 'Blood Orange Aperitif', pack: '750ml Bottle', price: 42, mono: 'BO', c1: '#EF4444', c2: '#FB7185' },
  { id: 'z3', name: 'Bergamot Cold Brew', pack: '6-Pack', price: 28, mono: 'CB', c1: '#2563EB', c2: '#60A5FA' },
  { id: 'z4', name: 'Chili Crisp Reserve', pack: '220g Jar', price: 19, mono: 'CC', c1: '#F97316', c2: '#FDBA74' },
];

export function Shop19() {
  const [open, setOpen] = useState(true);
  const [items, setItems] = useState<ZestLine[]>([
    { ...PANTRY[0], qty: 2 },
    { ...PANTRY[1], qty: 1 },
  ]);

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const threshold = 100;
  const pct = Math.min(100, Math.round((subtotal / threshold) * 100));

  const addItem = (p: (typeof PANTRY)[number]) => {
    setItems((prev) => {
      const hit = prev.find((x) => x.id === p.id);
      if (hit) return prev.map((x) => (x.id === p.id ? { ...x, qty: x.qty + 1 } : x));
      return [...prev, { ...p, qty: 1 }];
    });
    setOpen(true);
  };

  return (
    <div className="relative min-h-[calc(100vh-52px)] bg-[#FEF9C3] text-gray-950 font-jakarta overflow-hidden">
      <header className="border-b-2 border-gray-950 bg-white">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
          <a href="#zest" className="font-bricolage text-2xl font-extrabold text-blue-600 whitespace-nowrap shrink-0">
            ZEST &amp; CO.
          </a>
          <nav className="hidden md:flex items-center gap-6 text-sm font-bold" aria-label="Primary">
            <a href="#spritz" className="hover:text-blue-600 whitespace-nowrap shrink-0">Spritz</a>
            <a href="#aperitifs" className="hover:text-blue-600 whitespace-nowrap shrink-0">Aperitifs</a>
            <a href="#pantry" className="hover:text-blue-600 whitespace-nowrap shrink-0">Pantry</a>
            <a href="#bundles" className="hover:text-blue-600 whitespace-nowrap shrink-0">Bundles</a>
          </nav>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white border-2 border-gray-950 rounded-lg text-xs font-extrabold whitespace-nowrap shrink-0 tabular-nums"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>CRATE ({items.reduce((s, i) => s + i.qty, 0)})</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="font-bricolage text-3xl font-extrabold mb-6">Pantry &amp; Botanical Drinks</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PANTRY.map((p) => (
            <article key={p.id} className="bg-white border-2 border-gray-950 rounded-xl overflow-hidden shadow-[4px_4px_0_#111827]">
              <div className="aspect-[4/3]">
                <svg viewBox="0 0 240 180" className="w-full h-full" role="img" aria-label={p.name}>
                  <defs>
                    <linearGradient id={`zest-${p.id}`} x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor={p.c1} />
                      <stop offset="100%" stopColor={p.c2} />
                    </linearGradient>
                  </defs>
                  <rect width="240" height="180" fill={`url(#zest-${p.id})`} />
                  <circle cx="120" cy="90" r="38" fill="#FFFFFF" stroke="#111827" strokeWidth="3" />
                  <text x="120" y="99" textAnchor="middle" fill="#111827" fontSize="22" fontWeight="800">
                    {p.mono}
                  </text>
                </svg>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-extrabold">{p.name}</h2>
                  <p className="text-xs font-bold text-gray-600 tabular-nums">${p.price}</p>
                </div>
                <button
                  type="button"
                  onClick={() => addItem(p)}
                  className="px-3 py-1.5 bg-[#FEF08A] border-2 border-gray-950 rounded-md text-xs font-extrabold"
                >
                  + Crate
                </button>
              </div>
            </article>
          ))}
        </div>
      </main>

      {/* LEFT Slide-Over Drawer (Bold/Colourful Topology) */}
      {open && (
        <div className="absolute inset-0 z-30 flex justify-start">
          <aside
            className="w-full max-w-[440px] bg-white border-r-2 border-gray-950 flex flex-col justify-between h-full shadow-2xl"
            aria-label="Left slide-over mini-cart drawer"
          >
            <div className="p-5 bg-blue-600 text-white border-b-2 border-gray-950 flex items-center justify-between">
              <h2 className="font-bricolage text-xl font-extrabold">Your Drinks Crate</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close left drawer"
                className="p-1.5 bg-white text-gray-950 rounded-md border-2 border-gray-950"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-[#FEF9C3] border-b-2 border-gray-950">
              <div className="flex justify-between text-xs font-extrabold mb-1.5">
                <span>
                  {subtotal >= threshold ? 'Free Chilled Delivery Unlocked!' : `$${threshold - subtotal} to Free Chilled Delivery`}
                </span>
                <span className="tabular-nums">{pct}%</span>
              </div>
              <div className="h-3 bg-white border border-gray-950 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 transition-all" style={{ width: `${pct}%` }} />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {items.length === 0 ? (
                <p className="text-center text-sm font-bold text-gray-500 py-10">Crate is empty.</p>
              ) : (
                items.map((item) => (
                  <article key={item.id} className="p-3 border-2 border-gray-950 rounded-xl flex items-center gap-3">
                    <div
                      className="w-14 h-14 rounded-lg border-2 border-gray-950 flex items-center justify-center font-extrabold text-sm shrink-0"
                      style={{ backgroundColor: item.c1 }}
                    >
                      {item.mono}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-extrabold truncate">{item.name}</h3>
                      <p className="text-xs text-gray-600">{item.pack}</p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="inline-flex items-center border-2 border-gray-950 rounded-md">
                          <button
                            type="button"
                            onClick={() =>
                              setItems((p) => p.map((x) => (x.id === item.id ? { ...x, qty: Math.max(1, x.qty - 1) } : x)))
                            }
                            aria-label={`Decrease quantity for ${item.name}`}
                            className="p-1 hover:bg-gray-100"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-extrabold tabular-nums">{item.qty}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setItems((p) => p.map((x) => (x.id === item.id ? { ...x, qty: x.qty + 1 } : x)))
                            }
                            aria-label={`Increase quantity for ${item.name}`}
                            className="p-1 hover:bg-gray-100"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => setItems((p) => p.filter((x) => x.id !== item.id))}
                          aria-label={`Remove ${item.name}`}
                          className="p-1 text-gray-500 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm font-extrabold tabular-nums">${item.price * item.qty}</p>
                  </article>
                ))
              )}
            </div>

            <div className="p-5 border-t-2 border-gray-950 bg-white space-y-3">
              <div className="flex justify-between text-base font-extrabold">
                <span>Crate Subtotal</span>
                <span className="tabular-nums">${subtotal}</span>
              </div>
              <button
                type="button"
                disabled={items.length === 0}
                className="w-full py-3.5 bg-rose-500 hover:bg-rose-600 disabled:opacity-40 text-white font-extrabold text-sm rounded-lg border-2 border-gray-950 shadow-[3px_3px_0_#111827]"
              >
                Checkout Crate →
              </button>
            </div>
          </aside>
          <button
            type="button"
            aria-label="Close crate backdrop"
            onClick={() => setOpen(false)}
            className="flex-1 bg-black/35"
          />
        </div>
      )}
    </div>
  );
}

export default Shop19;
