import React, { useState } from 'react';
import { Minus, Plus, Trash2, RotateCcw } from 'lucide-react';
import {
  calculateCartTotals,
  evaluatePromoCode,
  formatCurrency,
  type LineItem,
  type PromoResult,
} from '../../utils/commerce';
import { MonogramArt } from '../MonogramArt';

const INITIAL_CART: LineItem[] = [
  {
    id: 'kc-1',
    name: 'Wheel-Thrown Matcha Bowl',
    variant: 'Speckled Stoneware · 420ml',
    price: 58,
    qty: 1,
    monogram: 'MB',
    gradient: ['#A88B6E', '#7C6248'],
  },
  {
    id: 'kc-2',
    name: 'Ribbed Carafe & Tumbler Set',
    variant: 'Warm Chalk Glaze · 850ml',
    price: 94,
    qty: 2,
    monogram: 'RC',
    gradient: ['#9A7B56', '#6D5236'],
  },
  {
    id: 'kc-3',
    name: 'Raw Linen Table Runner',
    variant: 'Oatmeal · 220cm',
    price: 46,
    qty: 1,
    monogram: 'LR',
    gradient: ['#B8A088', '#8B735B'],
  },
];

export function Shop8() {
  const [items, setItems] = useState<LineItem[]>(INITIAL_CART);
  const [promoCode, setPromoCode] = useState('');
  const [promo, setPromo] = useState<PromoResult | null>(null);
  const [promoError, setPromoError] = useState('');
  const [checkoutNotice, setCheckoutNotice] = useState('');

  const totals = calculateCartTotals(items, items.length > 0 ? 12 : 0, promo, 0.08);

  const updateQty = (id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, qty: item.qty + delta } : item))
        .filter((item) => item.qty > 0)
    );
    setCheckoutNotice('');
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setCheckoutNotice('');
  };

  const handlePromoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = evaluatePromoCode(promoCode, totals.subtotal);
    if (!res.valid) {
      setPromo(null);
      setPromoError(res.error || 'Code not valid.');
    } else {
      setPromo(res);
      setPromoError('');
    }
  };

  return (
    <section className="bg-[#FAF6F0] text-[#2C2520] rounded-2xl border border-[#E5DDD0] overflow-hidden">
      <div className="px-6 md:px-10 py-5 border-b border-[#E5DDD0] flex items-center justify-between">
        <span className="font-editorial text-2xl font-semibold text-[#2C2520]">Kiln & Clay</span>
        <span className="text-xs text-[#786B5E] font-mono-num">
          {items.reduce((sum, i) => sum + i.qty, 0)} ITEMS IN BAG
        </span>
      </div>

      {items.length === 0 ? (
        <div className="p-12 text-center space-y-4">
          <p className="font-editorial text-2xl text-[#2C2520]">Your ceramic bag is empty</p>
          <p className="text-sm text-[#786B5E]">Restore the studio sample items to test quantity steppers and promo codes.</p>
          <button
            type="button"
            onClick={() => {
              setItems(INITIAL_CART);
              setPromo(null);
              setPromoCode('');
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#7C4A2D] text-white text-sm font-medium rounded-lg hover:bg-[#663C24]"
          >
            <RotateCcw className="w-4 h-4" />
            Restore studio pieces
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-7 p-6 md:p-10 divide-y divide-[#E5DDD0]">
            {items.map((item) => (
              <div key={item.id} className="py-5 first:pt-0 last:pb-0 flex items-center gap-4">
                <MonogramArt
                  monogram={item.monogram}
                  gradient={item.gradient}
                  shape="circle"
                  className="w-20 h-20 rounded-xl text-base"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-[#2C2520] truncate">{item.name}</h3>
                  <p className="text-xs text-[#786B5E] mt-0.5">{item.variant}</p>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="inline-flex items-center border border-[#D8CEBE] rounded-lg bg-white">
                      <button
                        type="button"
                        aria-label={`Decrease quantity of ${item.name}`}
                        onClick={() => updateQty(item.id, -1)}
                        className="p-2 text-[#5C5147] hover:text-[#2C2520]"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-sm font-mono-num">{item.qty}</span>
                      <button
                        type="button"
                        aria-label={`Increase quantity of ${item.name}`}
                        onClick={() => updateQty(item.id, 1)}
                        className="p-2 text-[#5C5147] hover:text-[#2C2520]"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <button
                      type="button"
                      aria-label={`Remove ${item.name}`}
                      onClick={() => removeItem(item.id)}
                      className="inline-flex items-center gap-1 text-xs text-[#8C7E70] hover:text-red-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  </div>
                </div>
                <span className="font-mono-num font-semibold text-[#2C2520]">
                  {formatCurrency(item.price * item.qty)}
                </span>
              </div>
            ))}
          </div>

          <aside className="lg:col-span-5 bg-[#F3ECE1] border-t lg:border-t-0 lg:border-l border-[#E5DDD0] p-6 md:p-10 space-y-6">
            <h3 className="font-editorial text-xl font-medium">Order Summary</h3>
            <form onSubmit={handlePromoSubmit} className="space-y-2">
              <label htmlFor="s8-promo" className="block text-xs font-medium text-[#5C5147]">
                Promo code (try WARM15 or SHIPFREE)
              </label>
              <div className="flex gap-2">
                <input
                  id="s8-promo"
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="WARM15"
                  className="flex-1 px-3 py-2 text-sm font-mono-num bg-white border border-[#D8CEBE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C4A2D]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2C2520] text-white text-xs font-medium rounded-lg hover:bg-stone-800"
                >
                  Apply
                </button>
              </div>
              {promoError && <p className="text-xs text-red-700">{promoError}</p>}
              {promo?.valid && (
                <p className="text-xs font-medium text-emerald-800">
                  Applied {promo.code}: {promo.label}
                </p>
              )}
            </form>

            <dl className="pt-4 border-t border-[#E5DDD0] space-y-2.5 text-sm">
              <div className="flex justify-between text-[#5C5147]">
                <dt>Subtotal</dt>
                <dd className="font-mono-num text-[#2C2520]">{formatCurrency(totals.subtotal)}</dd>
              </div>
              {totals.discount > 0 && (
                <div className="flex justify-between text-emerald-800">
                  <dt>Discount</dt>
                  <dd className="font-mono-num">-{formatCurrency(totals.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between text-[#5C5147]">
                <dt>Protective Studio Packing</dt>
                <dd className="font-mono-num text-[#2C2520]">
                  {totals.shipping === 0 ? 'Free' : formatCurrency(totals.shipping)}
                </dd>
              </div>
              <div className="flex justify-between text-[#5C5147]">
                <dt>Estimated tax</dt>
                <dd className="font-mono-num text-[#2C2520]">{formatCurrency(totals.tax)}</dd>
              </div>
              <div className="flex justify-between pt-3 border-t border-[#E5DDD0] text-base font-semibold text-[#2C2520]">
                <dt>Total</dt>
                <dd className="font-mono-num">{formatCurrency(totals.total)}</dd>
              </div>
            </dl>

            <button
              type="button"
              onClick={() =>
                setCheckoutNotice(`Proceeding to checkout with ${items.length} ceramic line items (${formatCurrency(totals.total)}).`)
              }
              className="w-full py-3 bg-[#7C4A2D] text-white text-sm font-medium rounded-lg hover:bg-[#663C24] transition-colors"
            >
              Proceed to Checkout
            </button>
            {checkoutNotice && (
              <p className="text-xs text-[#5C5147] bg-white p-3 rounded-lg border border-[#E5DDD0]">
                {checkoutNotice}
              </p>
            )}
          </aside>
        </div>
      )}
    </section>
  );
}
