import React, { useState } from 'react';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import {
  calculateCartTotals,
  evaluatePromoCode,
  formatCurrency,
  type LineItem,
  type PromoResult,
} from '../../utils/commerce';
import { MonogramArt } from '../MonogramArt';

const CURATED_ADDONS: Omit<LineItem, 'qty'>[] = [
  {
    id: 'av-1',
    name: 'Travertine Plinth Vessel',
    variant: 'Honed Cream Stone · 26cm',
    price: 185,
    monogram: 'TP',
    gradient: ['#78716C', '#44403C'],
  },
  {
    id: 'av-2',
    name: 'Hand-Dipped Beeswax Taper Pair',
    variant: 'Unscented Raw Amber · 30cm',
    price: 38,
    monogram: 'BT',
    gradient: ['#A16207', '#713F12'],
  },
];

export function Shop10() {
  const [items, setItems] = useState<LineItem[]>([]);
  const [promoCode, setPromoCode] = useState('');
  const [promo, setPromo] = useState<PromoResult | null>(null);
  const [promoStatus, setPromoStatus] = useState('');

  const totals = calculateCartTotals(items, items.length > 0 ? 15 : 0, promo, 0.08);

  const addCurated = (addon: Omit<LineItem, 'qty'>) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === addon.id);
      if (existing) {
        return prev.map((i) => (i.id === addon.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { ...addon, qty: 1 }];
    });
  };

  const adjust = (id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0)
    );
  };

  const handlePromo = (e: React.FormEvent) => {
    e.preventDefault();
    const res = evaluatePromoCode(promoCode, totals.subtotal);
    if (!res.valid) {
      setPromo(null);
      setPromoStatus(res.error || 'Invalid promo code');
    } else {
      setPromo(res);
      setPromoStatus(`Applied ${res.code} — ${res.label}`);
    }
  };

  return (
    <section className="bg-[#FCFAF6] text-[#1C1917] rounded-xl border border-[#E5DEC9] py-10 px-4 sm:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between pb-6 border-b border-[#E5DEC9]">
          <span className="font-editorial text-2xl font-semibold">Atelier Véra</span>
          <span className="text-xs uppercase tracking-widest text-[#78716C]">
            Bag ({items.reduce((s, i) => s + i.qty, 0)})
          </span>
        </div>

        {items.length === 0 ? (
          <div className="py-10 text-center space-y-6">
            <div className="mx-auto w-20 h-20 rounded-full bg-[#F3EDE0] border border-[#E5DEC9] flex items-center justify-center">
              <svg viewBox="0 0 48 48" className="w-9 h-9 text-[#57534E]" fill="none">
                <path
                  d="M12 18h24l-2 22H14L12 18Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <path
                  d="M18 18v-3a6 6 0 0 1 12 0v3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="space-y-1.5">
              <h2 className="font-editorial text-2xl font-medium text-[#1C1917]">
                Your shopping bag is currently empty
              </h2>
              <p className="text-sm text-[#78716C] max-w-md mx-auto">
                Explore seasonal archival objects below or add a piece to preview live bag calculations and promo entry.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left pt-4">
              {CURATED_ADDONS.map((addon) => (
                <div
                  key={addon.id}
                  className="bg-white border border-[#E5DEC9] p-4 flex items-center gap-3.5"
                >
                  <MonogramArt
                    monogram={addon.monogram}
                    gradient={addon.gradient}
                    shape="arch"
                    editorial
                    className="w-14 h-14 text-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-editorial text-sm font-medium truncate">{addon.name}</p>
                    <p className="font-mono-num text-xs text-[#78716C] mt-0.5">
                      {formatCurrency(addon.price)}
                    </p>
                    <button
                      type="button"
                      onClick={() => addCurated(addon)}
                      className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[#1C1917] underline underline-offset-4 hover:text-[#78716C]"
                    >
                      <ShoppingBag className="w-3 h-3" />
                      Add to bag
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="pt-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-editorial text-xl font-medium">Selected Objects</h2>
              <button
                type="button"
                onClick={() => {
                  setItems([]);
                  setPromo(null);
                  setPromoStatus('');
                }}
                className="text-xs text-[#78716C] underline underline-offset-4 hover:text-[#1C1917]"
              >
                Clear bag
              </button>
            </div>

            <div className="divide-y divide-[#E5DEC9] border-t border-b border-[#E5DEC9]">
              {items.map((item) => (
                <div key={item.id} className="py-4 flex items-center gap-4">
                  <MonogramArt
                    monogram={item.monogram}
                    gradient={item.gradient}
                    shape="arch"
                    editorial
                    className="w-16 h-16 text-base"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-editorial text-base font-medium">{item.name}</p>
                    <p className="text-xs text-[#78716C]">{item.variant}</p>
                    <div className="mt-2.5 flex items-center gap-3">
                      <div className="inline-flex items-center border border-[#D6CEBC] bg-white">
                        <button
                          type="button"
                          aria-label={`Decrease quantity of ${item.name}`}
                          onClick={() => adjust(item.id, -1)}
                          className="p-1.5 text-[#57534E] hover:text-[#1C1917]"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-3 text-xs font-mono-num">{item.qty}</span>
                        <button
                          type="button"
                          aria-label={`Increase quantity of ${item.name}`}
                          onClick={() => adjust(item.id, 1)}
                          className="p-1.5 text-[#57534E] hover:text-[#1C1917]"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        type="button"
                        aria-label={`Remove ${item.name}`}
                        onClick={() => adjust(item.id, -item.qty)}
                        className="text-xs text-[#78716C] hover:text-red-800 inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove
                      </button>
                    </div>
                  </div>
                  <span className="font-mono-num text-sm">{formatCurrency(item.price * item.qty)}</span>
                </div>
              ))}
            </div>

            <form onSubmit={handlePromo} className="flex gap-2">
              <label htmlFor="s10-promo" className="sr-only">
                Atelier promo code
              </label>
              <input
                id="s10-promo"
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Privilege code (WARM15)"
                className="flex-1 px-3.5 py-2 text-sm font-mono-num bg-white border border-[#D6CEBC]"
              />
              <button
                type="submit"
                className="px-5 py-2 bg-[#1C1917] text-[#FCFAF6] text-xs uppercase tracking-widest"
              >
                Apply
              </button>
            </form>
            {promoStatus && <p className="text-xs text-[#57534E]">{promoStatus}</p>}

            <dl className="space-y-2 text-sm pt-2">
              <div className="flex justify-between text-[#57534E]">
                <dt>Subtotal</dt>
                <dd className="font-mono-num">{formatCurrency(totals.subtotal)}</dd>
              </div>
              {totals.discount > 0 && (
                <div className="flex justify-between text-emerald-800">
                  <dt>Privilege Discount</dt>
                  <dd className="font-mono-num">-{formatCurrency(totals.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between text-[#57534E]">
                <dt>Courier</dt>
                <dd className="font-mono-num">
                  {totals.shipping === 0 ? 'Complimentary' : formatCurrency(totals.shipping)}
                </dd>
              </div>
              <div className="flex justify-between text-[#57534E]">
                <dt>Tax</dt>
                <dd className="font-mono-num">{formatCurrency(totals.tax)}</dd>
              </div>
              <div className="flex justify-between pt-3 border-t border-[#E5DEC9] font-editorial text-lg font-medium">
                <dt>Total</dt>
                <dd className="font-mono-num">{formatCurrency(totals.total)}</dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </section>
  );
}
