import React, { useState } from 'react';
import { Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import {
  calculateCartTotals,
  evaluatePromoCode,
  formatCurrency,
  type LineItem,
  type PromoResult,
} from '../../utils/commerce';
import { MonogramArt } from '../MonogramArt';

const CARRY_ITEMS: LineItem[] = [
  {
    id: 'oc-1',
    name: '28L Ripstop Transit Pack',
    variant: 'Ballistic Carbon · Cordura 1000D',
    price: 225,
    qty: 1,
    monogram: 'TP',
    gradient: ['#18181B', '#3F3F46'],
  },
  {
    id: 'oc-2',
    name: 'Modular Tech Pouch',
    variant: 'Weatherproof Zip · Graphite',
    price: 45,
    qty: 1,
    monogram: 'MP',
    gradient: ['#27272A', '#52525B'],
  },
];

const FREE_SHIPPING_THRESHOLD = 250;

export function Shop9() {
  const [items, setItems] = useState<LineItem[]>(CARRY_ITEMS);
  const [code, setCode] = useState('');
  const [promo, setPromo] = useState<PromoResult | null>(null);
  const [msg, setMsg] = useState('');
  const [checkedOut, setCheckedOut] = useState(false);

  const rawSubtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const baseShipping = rawSubtotal >= FREE_SHIPPING_THRESHOLD || rawSubtotal === 0 ? 0 : 15;
  const totals = calculateCartTotals(items, baseShipping, promo, 0.08);
  const progressPct = Math.min(100, Math.round((rawSubtotal / FREE_SHIPPING_THRESHOLD) * 100));

  const adjustQty = (id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, qty: item.qty + delta } : item))
        .filter((item) => item.qty > 0)
    );
    setCheckedOut(false);
  };

  const applyCode = (e: React.FormEvent) => {
    e.preventDefault();
    const res = evaluatePromoCode(code, rawSubtotal);
    if (!res.valid) {
      setPromo(null);
      setMsg(res.error || 'Invalid promo code');
    } else {
      setPromo(res);
      setMsg(`Promo ${res.code} active (${res.label})`);
    }
  };

  return (
    <section className="bg-[#111214] text-zinc-100 rounded-xl border border-zinc-800 py-10 px-4 sm:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold text-white">Obsidian Carry Bag</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              {rawSubtotal >= FREE_SHIPPING_THRESHOLD
                ? 'Complimentary express shipping unlocked'
                : `Add ${formatCurrency(FREE_SHIPPING_THRESHOLD - rawSubtotal)} more for free express shipping`}
            </p>
          </div>
          <span className="font-mono-num text-sm text-emerald-400">{progressPct}%</span>
        </div>

        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-400 transition-all duration-200"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {items.length === 0 ? (
          <div className="bg-[#181A1F] border border-zinc-800 rounded-xl p-10 text-center space-y-3">
            <p className="text-base font-medium text-white">Your carry kit is empty.</p>
            <button
              type="button"
              onClick={() => setItems(CARRY_ITEMS)}
              className="px-4 py-2 bg-emerald-400 text-zinc-950 text-sm font-semibold rounded-lg"
            >
              Restore carry items
            </button>
          </div>
        ) : (
          <div className="bg-[#181A1F] border border-zinc-800 rounded-xl divide-y divide-zinc-800">
            {items.map((item) => (
              <div key={item.id} className="p-5 flex items-center gap-4">
                <MonogramArt
                  monogram={item.monogram}
                  gradient={item.gradient}
                  shape="prism"
                  className="w-16 h-16 rounded-lg border border-zinc-700 text-sm"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-white truncate">{item.name}</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">{item.variant}</p>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="inline-flex items-center bg-[#111214] border border-zinc-700 rounded-md">
                      <button
                        type="button"
                        aria-label={`Decrease quantity of ${item.name}`}
                        onClick={() => adjustQty(item.id, -1)}
                        className="p-1.5 text-zinc-400 hover:text-white"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-2.5 text-xs font-mono-num">{item.qty}</span>
                      <button
                        type="button"
                        aria-label={`Increase quantity of ${item.name}`}
                        onClick={() => adjustQty(item.id, 1)}
                        className="p-1.5 text-zinc-400 hover:text-white"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <button
                      type="button"
                      aria-label={`Remove ${item.name}`}
                      onClick={() => adjustQty(item.id, -item.qty)}
                      className="text-xs text-zinc-500 hover:text-rose-400 inline-flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  </div>
                </div>
                <span className="font-mono-num text-sm font-semibold text-white">
                  {formatCurrency(item.price * item.qty)}
                </span>
              </div>
            ))}

            <form onSubmit={applyCode} className="p-5 flex flex-col sm:flex-row gap-2.5">
              <label htmlFor="s9-promo" className="sr-only">
                Promo code
              </label>
              <input
                id="s9-promo"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Promo code (e.g. SAVE20)"
                className="flex-1 px-3.5 py-2 text-sm font-mono-num bg-[#111214] border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-emerald-400"
              />
              <button
                type="submit"
                className="px-5 py-2 bg-zinc-800 text-zinc-100 text-sm font-medium rounded-lg hover:bg-zinc-700"
              >
                Apply code
              </button>
            </form>
            {msg && <p className="px-5 py-2.5 text-xs text-emerald-400">{msg}</p>}

            <div className="p-5 space-y-2 text-sm">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal</span>
                <span className="font-mono-num text-zinc-200">{formatCurrency(totals.subtotal)}</span>
              </div>
              {totals.discount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Promo discount</span>
                  <span className="font-mono-num">-{formatCurrency(totals.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-zinc-400">
                <span>Shipping</span>
                <span className="font-mono-num text-zinc-200">
                  {totals.shipping === 0 ? 'Free' : formatCurrency(totals.shipping)}
                </span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Estimated tax</span>
                <span className="font-mono-num text-zinc-200">{formatCurrency(totals.tax)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-zinc-800 text-base font-semibold text-white">
                <span>Total</span>
                <span className="font-mono-num text-emerald-400">{formatCurrency(totals.total)}</span>
              </div>

              <button
                type="button"
                onClick={() => setCheckedOut(true)}
                className="mt-4 w-full py-3 bg-emerald-400 text-zinc-950 text-sm font-semibold rounded-lg hover:bg-emerald-300 transition-colors inline-flex items-center justify-center gap-2"
              >
                {checkedOut ? 'Checkout Session Ready' : 'Continue to Checkout'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
