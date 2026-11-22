import React, { useState } from 'react';
import { Minus, Plus, Trash2, ShoppingBag, X } from 'lucide-react';

interface DenimLine {
  id: string;
  name: string;
  size: string;
  price: number;
  qty: number;
  code: string;
}

const CATALOG = [
  { id: 'nd1', name: '16oz Japanese Selvedge', size: '32 / 32', price: 245, code: '16Z' },
  { id: 'nd2', name: 'Indigo Work Chore Coat', size: 'Medium', price: 290, code: 'CC' },
  { id: 'nd3', name: 'Loopwheel Heavy Tee', size: 'Medium', price: 75, code: 'LT' },
  { id: 'nd4', name: 'Veg-Tan Garrison Belt', size: '34"', price: 95, code: 'GB' },
];

export function Shop18() {
  const [drawer, setDrawer] = useState(true);
  const [items, setItems] = useState<DenimLine[]>([
    { id: 'nd1', name: '16oz Japanese Selvedge', size: '32 / 32', price: 245, qty: 1, code: '16Z' },
  ]);

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);

  const addQuick = (p: (typeof CATALOG)[number]) => {
    setItems((prev) => {
      const hit = prev.find((x) => x.id === p.id);
      if (hit) return prev.map((x) => (x.id === p.id ? { ...x, qty: x.qty + 1 } : x));
      return [...prev, { ...p, qty: 1 }];
    });
    setDrawer(true);
  };

  return (
    <div className="relative min-h-[calc(100vh-52px)] bg-[#09090B] text-zinc-100 font-manrope overflow-hidden">
      <header className="border-b border-zinc-800 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
          <a href="#nightfall" className="font-archivo text-lg font-bold tracking-wider uppercase whitespace-nowrap shrink-0">
            Nightfall Denim
          </a>
          <nav className="hidden md:flex items-center gap-7 text-xs uppercase tracking-widest text-zinc-400" aria-label="Primary">
            <a href="#selvedge" className="hover:text-white whitespace-nowrap shrink-0">Selvedge</a>
            <a href="#jackets" className="hover:text-white whitespace-nowrap shrink-0">Outerwear</a>
            <a href="#leather" className="hover:text-white whitespace-nowrap shrink-0">Leather</a>
            <a href="#mills" className="hover:text-white whitespace-nowrap shrink-0">Okayama Mills</a>
          </nav>
          <button
            type="button"
            onClick={() => setDrawer(true)}
            className="px-4 py-2 bg-zinc-900 border border-zinc-700 hover:border-amber-500 text-xs font-space-mono rounded inline-flex items-center gap-2 whitespace-nowrap shrink-0 tabular-nums"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-amber-500" />
            <span>BAG ({items.reduce((s, i) => s + i.qty, 0)})</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="font-archivo text-2xl font-bold mb-6">Raw Indigo Editions</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CATALOG.map((p) => (
            <article key={p.id} className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
              <div className="aspect-[4/3] bg-zinc-950 flex items-center justify-center">
                <span className="font-space-mono text-2xl font-bold text-amber-500">{p.code}</span>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold">{p.name}</h2>
                  <p className="font-space-mono text-xs text-zinc-400 tabular-nums">${p.price}</p>
                </div>
                <button
                  type="button"
                  onClick={() => addQuick(p)}
                  className="px-3 py-1.5 bg-amber-600 text-black text-xs font-bold rounded"
                >
                  + Bag
                </button>
              </div>
            </article>
          ))}
        </div>
      </main>

      {/* Dark Right Slide-Over Drawer with Inline Upsells */}
      {drawer && (
        <div className="absolute inset-0 z-30 flex justify-end">
          <button
            type="button"
            aria-label="Close drawer backdrop"
            onClick={() => setDrawer(false)}
            className="flex-1 bg-black/65"
          />
          <aside
            className="w-full max-w-[430px] bg-[#111113] border-l border-zinc-800 flex flex-col justify-between h-full"
            aria-label="Dark mini-cart drawer"
          >
            <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="font-archivo text-base font-bold uppercase tracking-wider">Selvedge Bag</h2>
              <button
                type="button"
                onClick={() => setDrawer(false)}
                aria-label="Close mini-cart"
                className="p-1.5 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {items.length === 0 ? (
                <p className="text-sm text-zinc-500 text-center py-10">No garments in bag.</p>
              ) : (
                items.map((it) => (
                  <article key={it.id} className="flex items-center gap-3.5 pb-4 border-b border-zinc-800">
                    <div className="w-14 h-14 bg-zinc-900 border border-zinc-700 rounded flex items-center justify-center font-space-mono text-sm font-bold text-amber-400 shrink-0">
                      {it.code}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold truncate">{it.name}</h3>
                      <p className="font-space-mono text-xs text-zinc-400">{it.size}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="inline-flex items-center border border-zinc-700 rounded bg-zinc-950">
                          <button
                            type="button"
                            onClick={() =>
                              setItems((p) => p.map((x) => (x.id === it.id ? { ...x, qty: Math.max(1, x.qty - 1) } : x)))
                            }
                            aria-label={`Decrease quantity for ${it.name}`}
                            className="p-1.5 text-zinc-400 hover:text-white"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-7 text-center font-space-mono text-xs tabular-nums">{it.qty}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setItems((p) => p.map((x) => (x.id === it.id ? { ...x, qty: x.qty + 1 } : x)))
                            }
                            aria-label={`Increase quantity for ${it.name}`}
                            className="p-1.5 text-zinc-400 hover:text-white"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => setItems((p) => p.filter((x) => x.id !== it.id))}
                          aria-label={`Remove ${it.name}`}
                          className="p-1.5 text-zinc-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <span className="font-space-mono text-sm tabular-nums">${it.price * it.qty}</span>
                  </article>
                ))
              )}

              {/* Quick Drawer Upsells */}
              <div className="pt-2">
                <p className="font-space-mono text-[11px] uppercase tracking-wider text-zinc-400 mb-2.5">Quick Pairings</p>
                <div className="space-y-2">
                  {CATALOG.slice(2).map((up) => (
                    <div key={up.id} className="p-3 bg-zinc-900 border border-zinc-800 rounded flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold">{up.name}</p>
                        <p className="font-space-mono text-[11px] text-zinc-400 tabular-nums">${up.price}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => addQuick(up)}
                        className="px-2.5 py-1 border border-amber-500/60 text-amber-400 text-xs font-space-mono rounded hover:bg-amber-500 hover:text-black"
                      >
                        + ADD
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-zinc-800 bg-zinc-950 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Subtotal</span>
                <span className="font-space-mono font-bold tabular-nums">${subtotal.toFixed(2)}</span>
              </div>
              <button
                type="button"
                disabled={items.length === 0}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-bold text-xs uppercase tracking-widest rounded"
              >
                Checkout · ${subtotal.toFixed(2)}
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

export default Shop18;
