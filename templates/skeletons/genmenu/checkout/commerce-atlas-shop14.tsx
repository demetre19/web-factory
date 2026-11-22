import React, { useState } from 'react';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';

interface BagPiece {
  id: string;
  name: string;
  detail: string;
  price: number;
  qty: number;
  mono: string;
}

const INITIAL_BAG: BagPiece[] = [
  { id: 'd1', name: '18k Signet Ring', detail: 'Size 6 · Satin Gold', price: 680, qty: 1, mono: 'SR' },
  { id: 'd2', name: 'Box Calf Cardholder', detail: 'Cognac · Blind Embossed', price: 290, qty: 1, mono: 'BC' },
];

const CROSS = [
  { id: 'dc1', name: 'Velvet Travel Roll', price: 110, mono: 'TR' },
  { id: 'dc2', name: 'Polishing Cloth Set', price: 35, mono: 'PC' },
  { id: 'dc3', name: 'Vermeil Ear Cuff', price: 165, mono: 'EC' },
];

export function Shop14() {
  const [items, setItems] = useState<BagPiece[]>(INITIAL_BAG);
  const [code, setCode] = useState('');
  const [discountPct, setDiscountPct] = useState(0);
  const [note, setNote] = useState('');

  const threshold = 1000;
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const discount = Number((subtotal * discountPct).toFixed(2));
  const total = Math.max(0, subtotal - discount);
  const pct = Math.min(100, Math.round((subtotal / threshold) * 100));

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#3B2F2F] font-dm">
      <header className="border-b border-[#E6DFD3]">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
          <a href="#doree" className="font-playfair text-2xl font-semibold whitespace-nowrap shrink-0">
            Maison Dorée
          </a>
          <nav className="hidden md:flex items-center gap-6 text-xs uppercase tracking-[0.2em] text-[#7A6B60]" aria-label="Primary">
            <a href="#jewelry" className="hover:text-[#3B2F2F] whitespace-nowrap shrink-0">Jewelry</a>
            <a href="#leather" className="hover:text-[#3B2F2F] whitespace-nowrap shrink-0">Leather</a>
            <a href="#bespoke" className="hover:text-[#3B2F2F] whitespace-nowrap shrink-0">Bespoke</a>
            <a href="#salons" className="hover:text-[#3B2F2F] whitespace-nowrap shrink-0">Salons</a>
          </nav>
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-widest tabular-nums whitespace-nowrap shrink-0">
            <ShoppingBag className="w-3.5 h-3.5 text-[#B08D57]" />
            <span>Bag ({items.reduce((s, i) => s + i.qty, 0)})</span>
          </span>
        </div>
      </header>

      {/* Single-Column Centered Luxury Bag */}
      <main className="max-w-4xl mx-auto px-6 py-12 space-y-10">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.24em] text-[#B08D57]">Private Client Selection</p>
          <h1 className="font-playfair text-4xl font-semibold mt-2">Your Shopping Bag</h1>
        </div>

        {/* Complimentary Insured Delivery Bar */}
        <section className="p-5 bg-white border border-[#E6DFD3]" aria-label="Complimentary courier status">
          <div className="flex justify-between text-xs uppercase tracking-widest mb-2.5">
            <span>
              {subtotal >= threshold
                ? 'Complimentary Insured Courier Unlocked'
                : `$${(threshold - subtotal).toFixed(0)} remaining for Insured Courier`}
            </span>
            <span className="tabular-nums">{pct}%</span>
          </div>
          <div className="h-1.5 bg-[#EFE9DF] overflow-hidden">
            <div className="h-full bg-[#B08D57] transition-all duration-300" style={{ width: `${pct}%` }} />
          </div>
        </section>

        {/* Line Items */}
        <section className="bg-white border border-[#E6DFD3] divide-y divide-[#EFE9DF]" aria-label="Bag pieces">
          {items.length === 0 ? (
            <div className="p-10 text-center">
              <p className="font-playfair text-xl">Your selection is empty.</p>
              <button
                type="button"
                onClick={() => setItems(INITIAL_BAG)}
                className="mt-4 px-5 py-2.5 bg-[#3B2F2F] text-white text-xs uppercase tracking-widest"
              >
                Restore Pieces
              </button>
            </div>
          ) : (
            items.map((item) => (
              <article key={item.id} className="p-6 flex flex-wrap sm:flex-nowrap items-center gap-6">
                <div className="w-20 h-20 border border-[#E6DFD3] shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full" role="img" aria-label={item.name}>
                    <rect width="100" height="100" fill="#F5EFE6" />
                    <circle cx="50" cy="50" r="30" fill="none" stroke="#B08D57" strokeWidth="1.5" />
                    <text x="50" y="56" textAnchor="middle" fill="#3B2F2F" fontSize="20" fontFamily="Playfair Display, serif">
                      {item.mono}
                    </text>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-playfair text-xl font-semibold">{item.name}</h2>
                  <p className="text-xs text-[#7A6B60] mt-0.5">{item.detail}</p>
                </div>
                <div className="flex items-center border border-[#D8CFC2]">
                  <button
                    type="button"
                    onClick={() =>
                      setItems((p) => p.map((x) => (x.id === item.id ? { ...x, qty: Math.max(1, x.qty - 1) } : x)))
                    }
                    aria-label={`Decrease quantity for ${item.name}`}
                    className="p-2.5 hover:bg-[#FAF7F2]"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-xs tabular-nums">{item.qty}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setItems((p) => p.map((x) => (x.id === item.id ? { ...x, qty: x.qty + 1 } : x)))
                    }
                    aria-label={`Increase quantity for ${item.name}`}
                    className="p-2.5 hover:bg-[#FAF7F2]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="text-right w-24">
                  <p className="text-sm font-medium tabular-nums">${(item.price * item.qty).toLocaleString()}</p>
                  <button
                    type="button"
                    onClick={() => setItems((p) => p.filter((x) => x.id !== item.id))}
                    aria-label={`Remove ${item.name}`}
                    className="mt-1 inline-flex items-center gap-1 text-[11px] uppercase tracking-wider text-[#7A6B60] hover:text-[#3B2F2F]"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remove</span>
                  </button>
                </div>
              </article>
            ))
          )}
        </section>

        {/* Single-Column Order Summary + Promo Below Items */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white border border-[#E6DFD3] p-6" aria-label="Promo and summary">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (code.trim().toUpperCase() === 'ATELIER10') {
                setDiscountPct(0.1);
                setNote('Atelier privilege applied (-10%).');
              } else {
                setDiscountPct(0);
                setNote('Code not valid. Try ATELIER10.');
              }
            }}
            className="space-y-3"
          >
            <label htmlFor="doree-promo" className="block text-xs uppercase tracking-widest text-[#7A6B60]">
              Privilege Code (ATELIER10)
            </label>
            <div className="flex gap-2">
              <input
                id="doree-promo"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="ATELIER10"
                className="flex-1 border border-[#D8CFC2] px-3 py-2 text-xs bg-[#FAF7F2]"
              />
              <button type="submit" className="px-4 py-2 border border-[#3B2F2F] text-xs uppercase tracking-widest hover:bg-[#3B2F2F] hover:text-white transition-colors">
                Apply
              </button>
            </div>
            {note && <p className="text-xs text-[#B08D57]">{note}</p>}
          </form>

          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between">
              <span className="text-[#7A6B60]">Subtotal</span>
              <span className="tabular-nums">${subtotal.toLocaleString()}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-[#B08D57]">
                <span>Privilege (10%)</span>
                <span className="tabular-nums">-${discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between pt-3 border-t border-[#EFE9DF] font-playfair text-xl font-semibold">
              <span>Total</span>
              <span className="tabular-nums">${total.toLocaleString()}</span>
            </div>
            <button
              type="button"
              disabled={items.length === 0}
              className="w-full mt-2 py-3 bg-[#3B2F2F] hover:bg-[#2A2020] disabled:opacity-40 text-white text-xs uppercase tracking-[0.2em]"
            >
              Proceed to Private Checkout
            </button>
          </div>
        </section>

        {/* Cross-Sell Row */}
        <section aria-label="Care and presentation">
          <h2 className="font-playfair text-2xl font-semibold mb-4">Atelier Presentation</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {CROSS.map((c) => (
              <article key={c.id} className="bg-white border border-[#E6DFD3] p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 border border-[#E6DFD3] shrink-0">
                    <svg viewBox="0 0 60 60" className="w-full h-full" role="img" aria-label={c.name}>
                      <rect width="60" height="60" fill="#F5EFE6" />
                      <text x="30" y="36" textAnchor="middle" fill="#3B2F2F" fontSize="14" fontFamily="Playfair Display, serif">
                        {c.mono}
                      </text>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-playfair text-base font-semibold">{c.name}</h3>
                    <p className="text-xs text-[#7A6B60] tabular-nums">${c.price}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setItems((p) => {
                      const ex = p.find((x) => x.id === c.id);
                      if (ex) return p.map((x) => (x.id === c.id ? { ...x, qty: x.qty + 1 } : x));
                      return [...p, { id: c.id, name: c.name, detail: 'Atelier Box', price: c.price, qty: 1, mono: c.mono }];
                    })
                  }
                  className="text-xs uppercase tracking-widest text-[#B08D57] border-b border-[#B08D57]"
                >
                  + Add
                </button>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Shop14;
