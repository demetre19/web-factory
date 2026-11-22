import React, { useState } from 'react';
import { Minus, Plus, Trash2, ShoppingBag, X, ArrowRight } from 'lucide-react';

interface DrawerItem {
  id: string;
  name: string;
  variant: string;
  price: number;
  qty: number;
  mono: string;
}

const STORE_ITEMS = [
  { id: 'sk1', name: 'Ergo Split Keyboard', variant: 'Silver · Tactile', price: 220, mono: 'KB', c1: '#E2E8F0', c2: '#94A3B8' },
  { id: 'sk2', name: 'Aluminum Monitor Riser', variant: 'Anodized Gray', price: 145, mono: 'MR', c1: '#F1F5F9', c2: '#CBD5E1' },
  { id: 'sk3', name: 'Vertical Precision Mouse', variant: 'Matte Graphite', price: 98, mono: 'VM', c1: '#DBEAFE', c2: '#93C5FD' },
  { id: 'sk4', name: 'Wool Acoustic Desk Mat', variant: 'Slate 90x40cm', price: 65, mono: 'DM', c1: '#E0E7FF', c2: '#A5B4FC' },
];

export function Shop17() {
  const [open, setOpen] = useState(true);
  const [items, setItems] = useState<DrawerItem[]>([
    { id: 'sk1', name: 'Ergo Split Keyboard', variant: 'Silver · Tactile', price: 220, qty: 1, mono: 'KB' },
    { id: 'sk3', name: 'Vertical Precision Mouse', variant: 'Matte Graphite', price: 98, qty: 1, mono: 'VM' },
  ]);
  const [checkoutDone, setCheckoutDone] = useState(false);

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const threshold = 350;
  const pct = Math.min(100, Math.round((subtotal / threshold) * 100));

  const addProduct = (prod: (typeof STORE_ITEMS)[number]) => {
    setItems((prev) => {
      const ex = prev.find((i) => i.id === prod.id);
      if (ex) return prev.map((i) => (i.id === prod.id ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { id: prod.id, name: prod.name, variant: prod.variant, price: prod.price, qty: 1, mono: prod.mono }];
    });
    setOpen(true);
  };

  return (
    <div className="relative min-h-[calc(100vh-52px)] bg-slate-50 text-slate-900 font-jakarta overflow-hidden">
      {/* Background Storefront */}
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
          <a href="#kinetix" className="text-lg font-bold tracking-tight whitespace-nowrap shrink-0">
            Studio Kinetix
          </a>
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600" aria-label="Primary">
            <a href="#keyboards" className="hover:text-slate-900 whitespace-nowrap shrink-0">Keyboards</a>
            <a href="#stands" className="hover:text-slate-900 whitespace-nowrap shrink-0">Stands</a>
            <a href="#mice" className="hover:text-slate-900 whitespace-nowrap shrink-0">Input</a>
            <a href="#mats" className="hover:text-slate-900 whitespace-nowrap shrink-0">Surface</a>
          </nav>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-md whitespace-nowrap shrink-0 tabular-nums"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Cart ({items.reduce((s, i) => s + i.qty, 0)})</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-6">Ergonomic Hardware</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STORE_ITEMS.map((prod) => (
            <article key={prod.id} className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <div className="aspect-[4/3]">
                <svg viewBox="0 0 240 180" className="w-full h-full" role="img" aria-label={prod.name}>
                  <defs>
                    <linearGradient id={`sk-${prod.id}`} x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor={prod.c1} />
                      <stop offset="100%" stopColor={prod.c2} />
                    </linearGradient>
                  </defs>
                  <rect width="240" height="180" fill={`url(#sk-${prod.id})`} />
                  <text x="120" y="98" textAnchor="middle" fill="#0F172A" fontSize="28" fontWeight="700">
                    {prod.mono}
                  </text>
                </svg>
              </div>
              <div className="p-4 flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-semibold">{prod.name}</h2>
                  <p className="text-xs text-slate-500 tabular-nums">${prod.price}</p>
                </div>
                <button
                  type="button"
                  onClick={() => addProduct(prod)}
                  className="px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded"
                >
                  Add
                </button>
              </div>
            </article>
          ))}
        </div>
      </main>

      {/* Right Slide-Over Mini-Cart Drawer */}
      {open && (
        <div className="absolute inset-0 z-30 flex justify-end">
          <button
            type="button"
            aria-label="Close mini-cart backdrop"
            onClick={() => setOpen(false)}
            className="flex-1 bg-slate-950/40 backdrop-blur-[1px]"
          />
          <aside
            className="w-full max-w-[420px] bg-white border-l border-slate-200 shadow-2xl flex flex-col justify-between h-full"
            aria-label="Slide-over mini-cart drawer"
          >
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold">Your Mini-Cart</h2>
                <p className="text-xs text-slate-500 tabular-nums">{items.reduce((s, i) => s + i.qty, 0)} items selected</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close drawer"
                className="p-2 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-b border-slate-200">
              <div className="flex justify-between text-xs font-medium mb-1.5">
                <span>
                  {subtotal >= threshold
                    ? 'Free courier shipping unlocked'
                    : `Add $${threshold - subtotal} for free shipping`}
                </span>
                <span className="tabular-nums">{pct}%</span>
              </div>
              <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 transition-all" style={{ width: `${pct}%` }} />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-12">Your mini-cart is empty.</p>
              ) : (
                items.map((item) => (
                  <article key={item.id} className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
                    <div className="w-16 h-16 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 font-bold text-slate-700">
                      {item.mono}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold truncate">{item.name}</h3>
                      <p className="text-xs text-slate-500">{item.variant}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="inline-flex items-center border border-slate-300 rounded">
                          <button
                            type="button"
                            onClick={() =>
                              setItems((p) => p.map((x) => (x.id === item.id ? { ...x, qty: Math.max(1, x.qty - 1) } : x)))
                            }
                            aria-label={`Decrease quantity for ${item.name}`}
                            className="p-1.5 hover:bg-slate-100"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-7 text-center text-xs font-semibold tabular-nums">{item.qty}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setItems((p) => p.map((x) => (x.id === item.id ? { ...x, qty: x.qty + 1 } : x)))
                            }
                            aria-label={`Increase quantity for ${item.name}`}
                            className="p-1.5 hover:bg-slate-100"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => setItems((p) => p.filter((x) => x.id !== item.id))}
                          aria-label={`Remove ${item.name}`}
                          className="p-1.5 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm font-semibold tabular-nums">${item.price * item.qty}</p>
                  </article>
                ))
              )}
            </div>

            <div className="p-6 border-t border-slate-200 bg-slate-50 space-y-4">
              <div className="flex justify-between text-sm font-bold">
                <span>Subtotal</span>
                <span className="tabular-nums">${subtotal.toFixed(2)}</span>
              </div>
              <button
                type="button"
                disabled={items.length === 0}
                onClick={() => setCheckoutDone(true)}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-semibold rounded-md inline-flex items-center justify-center gap-2"
              >
                <span>{checkoutDone ? 'Checkout Started' : 'Checkout Now'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

export default Shop17;
