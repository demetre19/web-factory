import React, { useState } from 'react';
import { Minus, Plus, Trash2, Lock, Truck, ShoppingBag } from 'lucide-react';

interface CartLine {
  id: string;
  name: string;
  variant: string;
  price: number;
  qty: number;
  mono: string;
  c1: string;
  c2: string;
}

const INITIAL_LINES: CartLine[] = [
  { id: 'f1', name: 'Monolith Desk Tray', variant: 'Brushed Steel · Large', price: 88, qty: 1, mono: 'MT', c1: '#E4E4E7', c2: '#A1A1AA' },
  { id: 'f2', name: 'Arc Bookends (Pair)', variant: 'Matte Chalk', price: 64, qty: 2, mono: 'AB', c1: '#F4F4F5', c2: '#D4D4D8' },
];

const CROSS_SELL = [
  { id: 'cs1', name: 'Weighted Pen Cup', price: 42, mono: 'PC', c1: '#E2E8F0', c2: '#94A3B8' },
  { id: 'cs2', name: 'Cork Coaster Set', price: 28, mono: 'CC', c1: '#F3EFEA', c2: '#D6C7B2' },
  { id: 'cs3', name: 'Brass Paperweight', price: 54, mono: 'BP', c1: '#FEF3C7', c2: '#FDE68A' },
  { id: 'cs4', name: 'Grid Memo Pad', price: 18, mono: 'MP', c1: '#EFF6FF', c2: '#BFDBFE' },
];

export function Shop12() {
  const [items, setItems] = useState<CartLine[]>(INITIAL_LINES);
  const [promoInput, setPromoInput] = useState('');
  const [discountRate, setDiscountRate] = useState(0);
  const [promoMsg, setPromoMsg] = useState('');
  const [checkedOut, setCheckedOut] = useState(false);

  const freeThreshold = 200;
  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const discount = Number((subtotal * discountRate).toFixed(2));
  const shipping = subtotal === 0 || subtotal >= freeThreshold ? 0 : 14;
  const total = Math.max(0, subtotal - discount + shipping);
  const progressPct = Math.min(100, Math.round((subtotal / freeThreshold) * 100));
  const remaining = Math.max(0, freeThreshold - subtotal);

  const updateQty = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item))
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const addCrossSell = (cs: (typeof CROSS_SELL)[number]) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === cs.id);
      if (existing) {
        return prev.map((i) => (i.id === cs.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { id: cs.id, name: cs.name, variant: 'Standard Edition', price: cs.price, qty: 1, mono: cs.mono, c1: cs.c1, c2: cs.c2 }];
    });
  };

  const applyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoInput.trim().toUpperCase();
    if (code === 'SAVE10' || code === 'FORMA10') {
      setDiscountRate(0.1);
      setPromoMsg('10% discount applied (SAVE10).');
    } else if (!code) {
      setPromoMsg('Enter a promo code such as SAVE10.');
    } else {
      setDiscountRate(0);
      setPromoMsg('Code not recognized. Try SAVE10.');
    }
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-jakarta">
      <header className="border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
          <a href="#forma" className="text-lg font-bold tracking-tight whitespace-nowrap shrink-0">
            Forma Objects
          </a>
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-600" aria-label="Primary">
            <a href="#desk" className="hover:text-zinc-900 whitespace-nowrap shrink-0">Desk</a>
            <a href="#storage" className="hover:text-zinc-900 whitespace-nowrap shrink-0">Storage</a>
            <a href="#lighting" className="hover:text-zinc-900 whitespace-nowrap shrink-0">Lighting</a>
            <a href="#studio" className="hover:text-zinc-900 whitespace-nowrap shrink-0">Studio</a>
          </nav>
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-700 whitespace-nowrap shrink-0 tabular-nums">
            <ShoppingBag className="w-4 h-4" />
            <span>{items.reduce((s, i) => s + i.qty, 0)} items</span>
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Shopping Bag</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left 8 Columns: Progress + Line Items + Cross-Sell */}
          <section className="lg:col-span-8 space-y-8" aria-label="Cart items">
            {/* Free Shipping Progress Bar */}
            <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg">
              <div className="flex items-center justify-between text-xs font-medium mb-2">
                <span className="inline-flex items-center gap-2 text-zinc-800">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  {remaining === 0
                    ? 'Complimentary express shipping unlocked.'
                    : `Add $${remaining.toFixed(2)} more for free express shipping.`}
                </span>
                <span className="tabular-nums text-zinc-500">{progressPct}%</span>
              </div>
              <div className="h-2 w-full bg-zinc-200 rounded-full overflow-hidden" role="progressbar" aria-valuenow={progressPct} aria-valuemin={0} aria-valuemax={100}>
                <div className="h-full bg-emerald-600 transition-all duration-300" style={{ width: `${progressPct}%` }} />
              </div>
            </div>

            {/* Line Items */}
            {items.length === 0 ? (
              <div className="p-10 border border-dashed border-zinc-300 rounded-lg text-center">
                <p className="text-sm font-semibold">Your bag is currently empty.</p>
                <button
                  type="button"
                  onClick={() => setItems(INITIAL_LINES)}
                  className="mt-3 px-4 py-2 bg-zinc-900 text-white text-xs font-semibold rounded-md"
                >
                  Restore Sample Items
                </button>
              </div>
            ) : (
              <div className="divide-y divide-zinc-200 border-y border-zinc-200">
                {items.map((item) => (
                  <article key={item.id} className="py-5 flex items-center gap-5">
                    <div className="w-20 h-20 rounded-md overflow-hidden border border-zinc-200 shrink-0">
                      <svg viewBox="0 0 100 100" className="w-full h-full" role="img" aria-label={item.name}>
                        <defs>
                          <linearGradient id={`f12-${item.id}`} x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor={item.c1} />
                            <stop offset="100%" stopColor={item.c2} />
                          </linearGradient>
                        </defs>
                        <rect width="100" height="100" fill={`url(#f12-${item.id})`} />
                        <text x="50" y="57" textAnchor="middle" fill="#18181B" fontSize="22" fontWeight="700">
                          {item.mono}
                        </text>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-sm font-semibold text-zinc-900 truncate">{item.name}</h2>
                      <p className="text-xs text-zinc-500 mt-0.5">{item.variant}</p>
                      <p className="text-xs font-medium text-zinc-700 mt-1 tabular-nums">${item.price.toFixed(2)} each</p>
                    </div>
                    <div className="flex items-center border border-zinc-300 rounded-md">
                      <button
                        type="button"
                        onClick={() => updateQty(item.id, -1)}
                        aria-label={`Decrease quantity for ${item.name}`}
                        className="p-2 text-zinc-600 hover:text-zinc-900"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-semibold tabular-nums">{item.qty}</span>
                      <button
                        type="button"
                        onClick={() => updateQty(item.id, 1)}
                        aria-label={`Increase quantity for ${item.name}`}
                        className="p-2 text-zinc-600 hover:text-zinc-900"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="w-20 text-right">
                      <p className="text-sm font-semibold tabular-nums">${(item.price * item.qty).toFixed(2)}</p>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        aria-label={`Remove ${item.name}`}
                        className="mt-1 inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* Cross-Sell Row */}
            <div>
              <h2 className="text-base font-bold mb-4">Frequently Paired</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {CROSS_SELL.map((cs) => (
                  <article key={cs.id} className="border border-zinc-200 rounded-lg overflow-hidden bg-white">
                    <div className="aspect-[4/3]">
                      <svg viewBox="0 0 160 120" className="w-full h-full" role="img" aria-label={cs.name}>
                        <defs>
                          <linearGradient id={`cs12-${cs.id}`} x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor={cs.c1} />
                            <stop offset="100%" stopColor={cs.c2} />
                          </linearGradient>
                        </defs>
                        <rect width="160" height="120" fill={`url(#cs12-${cs.id})`} />
                        <text x="80" y="68" textAnchor="middle" fill="#18181B" fontSize="22" fontWeight="700">
                          {cs.mono}
                        </text>
                      </svg>
                    </div>
                    <div className="p-3">
                      <h3 className="text-xs font-semibold truncate">{cs.name}</h3>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-xs text-zinc-600 tabular-nums">${cs.price}</span>
                        <button
                          type="button"
                          onClick={() => addCrossSell(cs)}
                          className="text-xs font-semibold text-zinc-900 hover:underline"
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Right 4 Columns: Order Summary Sidebar */}
          <aside className="lg:col-span-4 bg-zinc-50 border border-zinc-200 rounded-lg p-6 space-y-5 lg:sticky lg:top-8" aria-label="Order summary">
            <h2 className="text-lg font-bold">Order Summary</h2>

            <form onSubmit={applyPromo} className="space-y-2">
              <label htmlFor="forma-promo" className="block text-xs font-semibold text-zinc-700">
                Promo Code (try SAVE10)
              </label>
              <div className="flex gap-2">
                <input
                  id="forma-promo"
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  placeholder="SAVE10"
                  className="flex-1 border border-zinc-300 rounded-md px-3 py-2 text-xs bg-white"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-zinc-900 text-white text-xs font-semibold rounded-md hover:bg-zinc-800"
                >
                  Apply
                </button>
              </div>
              {promoMsg && <p className="text-xs text-emerald-700">{promoMsg}</p>}
            </form>

            <div className="space-y-2.5 pt-3 border-t border-zinc-200 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-600">Subtotal</span>
                <span className="font-medium tabular-nums">${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount (10%)</span>
                  <span className="tabular-nums">-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-zinc-600">Shipping</span>
                <span className="tabular-nums">{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-zinc-200 text-base font-bold">
                <span>Estimated Total</span>
                <span className="tabular-nums">${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="button"
              disabled={items.length === 0}
              onClick={() => setCheckedOut(true)}
              className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-white text-sm font-semibold rounded-md inline-flex items-center justify-center gap-2 transition-colors"
            >
              <Lock className="w-4 h-4" />
              <span>{checkedOut ? 'Checkout Initiated' : 'Proceed to Checkout'}</span>
            </button>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default Shop12;
