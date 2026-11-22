import React, { useState } from 'react';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

interface LinenItem {
  id: string;
  name: string;
  detail: string;
  price: number;
  qty: number;
  mono: string;
  c1: string;
  c2: string;
}

const CROSS_SELL_LINEN = [
  { id: 'al1', name: 'Belgian Flax Duvet', detail: 'Natural Oat · Queen', price: 240, mono: 'FD', c1: '#F5EFE6', c2: '#DFD3C3' },
  { id: 'al2', name: 'Stonewashed Pillow Shams', detail: 'Warm Clay · Pair', price: 78, mono: 'PS', c1: '#EFE3DC', c2: '#D4B5A5' },
  { id: 'al3', name: 'Waffle Bath Sheet', detail: 'Charcoal · Organic Cotton', price: 62, mono: 'WB', c1: '#E5E7EB', c2: '#9CA3AF' },
  { id: 'al4', name: 'Linen Table Runner', detail: 'Raw Flax · 240cm', price: 54, mono: 'TR', c1: '#F3F1EC', c2: '#CBC4B8' },
];

export function Shop16() {
  // Starts empty by default to showcase the empty-cart state
  const [items, setItems] = useState<LinenItem[]>([]);
  const [promo, setPromo] = useState('');
  const [discountRate, setDiscountRate] = useState(0);
  const [promoNote, setPromoNote] = useState('');

  const threshold = 150;
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const discount = Number((subtotal * discountRate).toFixed(2));
  const total = Math.max(0, subtotal - discount);
  const pct = Math.min(100, Math.round((subtotal / threshold) * 100));

  const addItem = (prod: (typeof CROSS_SELL_LINEN)[number]) => {
    setItems((prev) => {
      const hit = prev.find((i) => i.id === prod.id);
      if (hit) return prev.map((i) => (i.id === prod.id ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { ...prod, qty: 1 }];
    });
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-slate-900 font-jakarta">
      <header className="border-b border-stone-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
          <a href="#aura" className="text-lg font-bold tracking-tight whitespace-nowrap shrink-0">
            Aura Linen
          </a>
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600" aria-label="Primary">
            <a href="#bedding" className="hover:text-stone-900 whitespace-nowrap shrink-0">Bedding</a>
            <a href="#bath" className="hover:text-stone-900 whitespace-nowrap shrink-0">Bath</a>
            <a href="#table" className="hover:text-stone-900 whitespace-nowrap shrink-0">Table</a>
            <a href="#swatches" className="hover:text-stone-900 whitespace-nowrap shrink-0">Swatches</a>
          </nav>
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-stone-700 whitespace-nowrap shrink-0 tabular-nums">
            <ShoppingBag className="w-4 h-4" />
            <span>Bag ({items.reduce((s, i) => s + i.qty, 0)})</span>
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Shopping Bag</h1>
          {items.length > 0 && (
            <button
              type="button"
              onClick={() => setItems([])}
              className="text-xs font-semibold text-stone-500 hover:text-stone-900 underline"
            >
              Empty bag
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left 8 Columns */}
          <section className="lg:col-span-8 space-y-8" aria-label="Bag contents">
            {/* Free Shipping Progress Bar */}
            <div className="p-4 bg-white border border-stone-200 rounded-lg">
              <div className="flex justify-between text-xs font-medium mb-2">
                <span>
                  {subtotal >= threshold
                    ? 'Complimentary carbon-neutral shipping unlocked.'
                    : `Add $${(threshold - subtotal).toFixed(2)} more to unlock free shipping.`}
                </span>
                <span className="tabular-nums text-stone-500">{pct}%</span>
              </div>
              <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                <div className="h-full bg-amber-700 transition-all duration-300" style={{ width: `${pct}%` }} />
              </div>
            </div>

            {/* Empty Cart State OR Line Items */}
            {items.length === 0 ? (
              <div className="bg-white border border-stone-200 rounded-xl p-12 text-center">
                <div className="w-24 h-24 mx-auto mb-5">
                  <svg viewBox="0 0 120 120" className="w-full h-full" role="img" aria-label="Empty shopping bag">
                    <rect width="120" height="120" rx="60" fill="#F5EFE6" />
                    <path d="M38 46 H82 L88 92 H32 Z" fill="none" stroke="#B45309" strokeWidth="2.5" strokeLinejoin="round" />
                    <path d="M48 46 C48 32, 72 32, 72 46" fill="none" stroke="#B45309" strokeWidth="2.5" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-slate-900">Your linen bag is empty</h2>
                <p className="text-sm text-stone-600 max-w-md mx-auto mt-2">
                  Explore stonewashed Belgian flax bedding and organic waffle bath sheets below, or restore a sample bundle.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => addItem(CROSS_SELL_LINEN[0])}
                    className="px-5 py-2.5 bg-slate-900 text-white text-xs font-semibold rounded-md hover:bg-slate-800 inline-flex items-center gap-2"
                  >
                    <span>Explore Bestsellers</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-stone-200 rounded-xl divide-y divide-stone-200">
                {items.map((item) => (
                  <article key={item.id} className="p-5 flex items-center gap-4">
                    <div className="w-16 h-16 rounded border border-stone-200 overflow-hidden shrink-0">
                      <svg viewBox="0 0 80 80" className="w-full h-full" role="img" aria-label={item.name}>
                        <rect width="80" height="80" fill={item.c1} />
                        <text x="40" y="46" textAnchor="middle" fill="#1E293B" fontSize="18" fontWeight="700">
                          {item.mono}
                        </text>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-sm font-semibold truncate">{item.name}</h2>
                      <p className="text-xs text-stone-500">{item.detail}</p>
                    </div>
                    <div className="flex items-center border border-stone-300 rounded-md">
                      <button
                        type="button"
                        onClick={() =>
                          setItems((p) => p.map((x) => (x.id === item.id ? { ...x, qty: Math.max(1, x.qty - 1) } : x)))
                        }
                        aria-label={`Decrease quantity for ${item.name}`}
                        className="p-2 hover:bg-stone-100"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-semibold tabular-nums">{item.qty}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setItems((p) => p.map((x) => (x.id === item.id ? { ...x, qty: x.qty + 1 } : x)))
                        }
                        aria-label={`Increase quantity for ${item.name}`}
                        className="p-2 hover:bg-stone-100"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="w-20 text-right">
                      <p className="text-sm font-semibold tabular-nums">${(item.price * item.qty).toFixed(2)}</p>
                      <button
                        type="button"
                        onClick={() => setItems((p) => p.filter((x) => x.id !== item.id))}
                        aria-label={`Remove ${item.name}`}
                        className="mt-1 inline-flex items-center gap-1 text-xs text-stone-500 hover:text-rose-600"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* Cross-Sell Row */}
            <div>
              <h2 className="text-base font-bold mb-4">Recommended for Your Home</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {CROSS_SELL_LINEN.map((prod) => (
                  <article key={prod.id} className="bg-white border border-stone-200 rounded-lg overflow-hidden">
                    <div className="aspect-[4/3]">
                      <svg viewBox="0 0 160 120" className="w-full h-full" role="img" aria-label={prod.name}>
                        <defs>
                          <linearGradient id={`al-${prod.id}`} x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor={prod.c1} />
                            <stop offset="100%" stopColor={prod.c2} />
                          </linearGradient>
                        </defs>
                        <rect width="160" height="120" fill={`url(#al-${prod.id})`} />
                        <text x="80" y="68" textAnchor="middle" fill="#1E293B" fontSize="22" fontWeight="700">
                          {prod.mono}
                        </text>
                      </svg>
                    </div>
                    <div className="p-3">
                      <h3 className="text-xs font-semibold truncate">{prod.name}</h3>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-xs text-stone-600 tabular-nums">${prod.price}</span>
                        <button
                          type="button"
                          onClick={() => addItem(prod)}
                          className="text-xs font-semibold text-amber-800 hover:underline"
                        >
                          + Add to Bag
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Right 4 Columns Order Summary Sidebar */}
          <aside className="lg:col-span-4 bg-white border border-stone-200 rounded-xl p-6 space-y-5" aria-label="Order summary">
            <h2 className="text-lg font-bold">Order Summary</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (promo.trim().toUpperCase() === 'WELCOME15') {
                  setDiscountRate(0.15);
                  setPromoNote('WELCOME15 saved (15% off applied).');
                } else {
                  setDiscountRate(0);
                  setPromoNote('Try WELCOME15 for 15% off.');
                }
              }}
              className="space-y-2"
            >
              <label htmlFor="aura-promo" className="block text-xs font-semibold text-stone-700">
                Promo Code (WELCOME15)
              </label>
              <div className="flex gap-2">
                <input
                  id="aura-promo"
                  type="text"
                  value={promo}
                  onChange={(e) => setPromo(e.target.value)}
                  placeholder="WELCOME15"
                  className="flex-1 border border-stone-300 rounded-md px-3 py-2 text-xs"
                />
                <button type="submit" className="px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-md">
                  Apply
                </button>
              </div>
              {promoNote && <p className="text-xs text-amber-800">{promoNote}</p>}
            </form>

            <div className="space-y-2.5 pt-3 border-t border-stone-200 text-sm">
              <div className="flex justify-between">
                <span className="text-stone-600">Subtotal</span>
                <span className="tabular-nums">${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-amber-800">
                  <span>Discount (15%)</span>
                  <span className="tabular-nums">-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between pt-3 border-t border-stone-200 font-bold text-base">
                <span>Estimated Total</span>
                <span className="tabular-nums">${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="button"
              disabled={items.length === 0}
              className="w-full py-3 bg-slate-900 text-white text-sm font-semibold rounded-md disabled:opacity-40"
            >
              {items.length === 0 ? 'Add Items to Checkout' : 'Continue to Checkout'}
            </button>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default Shop16;
