import React, { useState } from 'react';
import { Sun, CheckCircle2 } from 'lucide-react';
import {
  calculateCartTotals,
  evaluatePromoCode,
  formatCardNumber,
  formatCurrency,
  validateCardFields,
  validateShippingFields,
  type LineItem,
  type PromoResult,
} from '../../utils/commerce';
import { MonogramArt } from '../MonogramArt';

const PANTRY_ITEMS: LineItem[] = [
  {
    id: 'sp-1',
    name: 'Single-Estate Bergamot Olive Oil',
    variant: '500ml Ceramic Bottle',
    price: 42,
    qty: 2,
    monogram: 'BO',
    gradient: ['#059669', '#047857'],
  },
  {
    id: 'sp-2',
    name: 'Blood Orange Chili Crisp',
    variant: '220g Glass Jar',
    price: 18,
    qty: 1,
    monogram: 'CC',
    gradient: ['#F43F5E', '#E11D48'],
  },
];

export function Shop7() {
  const [slot, setSlot] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const [tip, setTip] = useState<number>(5);
  const [promoInput, setPromoInput] = useState('');
  const [promo, setPromo] = useState<PromoResult | null>(null);
  const [promoFeedback, setPromoFeedback] = useState('');
  const [ordered, setOrdered] = useState(false);
  const [form, setForm] = useState({
    fullName: 'Sora Takahashi',
    email: 'sora@solaris.kitchen',
    address: '1240 Valencia Street',
    city: 'San Francisco',
    postalCode: '94110',
    cardName: 'Sora Takahashi',
    cardNumber: '5200 8282 1190 4421',
    expiry: '12/28',
    cvc: '734',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const baseTotals = calculateCartTotals(PANTRY_ITEMS, 7, promo, 0.085);
  const grandTotal = baseTotals.total + tip;

  const handleApplyPromo = () => {
    const res = evaluatePromoCode(promoInput, baseTotals.subtotal);
    if (!res.valid) {
      setPromo(null);
      setPromoFeedback(res.error || 'Invalid code');
    } else {
      setPromo(res);
      setPromoFeedback(`Applied ${res.code} (${res.label})`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = {
      ...validateShippingFields(form),
      ...validateCardFields(form),
    };
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setOrdered(true);
  };

  return (
    <section className="bg-[#FFFBEB] text-zinc-900 rounded-2xl border-2 border-emerald-900 overflow-hidden">
      <div className="bg-emerald-900 text-[#FFFBEB] px-6 md:px-10 py-4 flex items-center justify-between">
        <span className="inline-flex items-center gap-2 font-display text-lg font-bold">
          <Sun className="w-5 h-5 text-amber-300" />
          Solaris Provisions
        </span>
        <span className="text-xs font-medium text-emerald-100">Same-Day Pantry Dispatch</span>
      </div>

      {ordered ? (
        <div className="p-10 text-center max-w-lg mx-auto space-y-4">
          <CheckCircle2 className="w-10 h-10 text-emerald-700 mx-auto" />
          <h2 className="font-display text-2xl font-bold text-emerald-950">
            Crate scheduled for {slot} delivery
          </h2>
          <p className="text-sm text-zinc-700">
            Order #SP-6103 confirmed for {form.fullName}. Total paid:{' '}
            <span className="font-mono-num font-bold">{formatCurrency(grandTotal)}</span>.
          </p>
          <button
            type="button"
            onClick={() => setOrdered(false)}
            className="px-5 py-2.5 bg-rose-500 text-white font-bold text-sm rounded-lg hover:bg-rose-600"
          >
            Place another pantry order
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-7 p-6 md:p-10 space-y-7">
            <div>
              <h2 className="font-display text-lg font-bold text-emerald-950 mb-3">Delivery window</h2>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'morning', label: '9am–12pm' },
                  { id: 'afternoon', label: '1pm–4pm' },
                  { id: 'evening', label: '5pm–8pm' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSlot(opt.id as 'morning' | 'afternoon' | 'evening')}
                    className={`py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold border-2 transition-colors ${
                      slot === opt.id
                        ? 'bg-emerald-700 border-emerald-900 text-white'
                        : 'bg-white border-emerald-200 text-emerald-950 hover:border-emerald-500'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label htmlFor="s7-name" className="block text-xs font-bold text-emerald-950 mb-1">
                  Recipient name
                </label>
                <input
                  id="s7-name"
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border-2 border-emerald-200 rounded-lg focus:outline-none focus:border-emerald-700"
                />
                {errors.fullName && <p className="text-xs text-rose-600 mt-1">{errors.fullName}</p>}
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="s7-email" className="block text-xs font-bold text-emerald-950 mb-1">
                  Email
                </label>
                <input
                  id="s7-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border-2 border-emerald-200 rounded-lg focus:outline-none focus:border-emerald-700"
                />
                {errors.email && <p className="text-xs text-rose-600 mt-1">{errors.email}</p>}
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="s7-addr" className="block text-xs font-bold text-emerald-950 mb-1">
                  Street address
                </label>
                <input
                  id="s7-addr"
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border-2 border-emerald-200 rounded-lg focus:outline-none focus:border-emerald-700"
                />
                {errors.address && <p className="text-xs text-rose-600 mt-1">{errors.address}</p>}
              </div>
              <div>
                <label htmlFor="s7-city" className="block text-xs font-bold text-emerald-950 mb-1">
                  City
                </label>
                <input
                  id="s7-city"
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border-2 border-emerald-200 rounded-lg focus:outline-none focus:border-emerald-700"
                />
                {errors.city && <p className="text-xs text-rose-600 mt-1">{errors.city}</p>}
              </div>
              <div>
                <label htmlFor="s7-zip" className="block text-xs font-bold text-emerald-950 mb-1">
                  Zip
                </label>
                <input
                  id="s7-zip"
                  type="text"
                  value={form.postalCode}
                  onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm font-mono-num bg-white border-2 border-emerald-200 rounded-lg focus:outline-none focus:border-emerald-700"
                />
                {errors.postalCode && <p className="text-xs text-rose-600 mt-1">{errors.postalCode}</p>}
              </div>
            </div>

            <div className="pt-4 border-t border-emerald-200 space-y-3">
              <h3 className="font-display text-base font-bold text-emerald-950">Payment card</h3>
              <div className="grid grid-cols-2 gap-3.5">
                <div className="col-span-2">
                  <label htmlFor="s7-cnum" className="block text-xs font-bold text-emerald-950 mb-1">
                    Card number
                  </label>
                  <input
                    id="s7-cnum"
                    type="text"
                    value={form.cardNumber}
                    onChange={(e) => setForm({ ...form, cardNumber: formatCardNumber(e.target.value) })}
                    className="w-full px-3.5 py-2.5 text-sm font-mono-num bg-white border-2 border-emerald-200 rounded-lg focus:outline-none focus:border-emerald-700"
                  />
                  {errors.cardNumber && <p className="text-xs text-rose-600 mt-1">{errors.cardNumber}</p>}
                </div>
                <div>
                  <label htmlFor="s7-exp" className="block text-xs font-bold text-emerald-950 mb-1">
                    Expiry
                  </label>
                  <input
                    id="s7-exp"
                    type="text"
                    value={form.expiry}
                    onChange={(e) => setForm({ ...form, expiry: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm font-mono-num bg-white border-2 border-emerald-200 rounded-lg focus:outline-none focus:border-emerald-700"
                  />
                  {errors.expiry && <p className="text-xs text-rose-600 mt-1">{errors.expiry}</p>}
                </div>
                <div>
                  <label htmlFor="s7-cvc" className="block text-xs font-bold text-emerald-950 mb-1">
                    CVC
                  </label>
                  <input
                    id="s7-cvc"
                    type="text"
                    value={form.cvc}
                    onChange={(e) => setForm({ ...form, cvc: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm font-mono-num bg-white border-2 border-emerald-200 rounded-lg focus:outline-none focus:border-emerald-700"
                  />
                  {errors.cvc && <p className="text-xs text-rose-600 mt-1">{errors.cvc}</p>}
                </div>
              </div>
            </div>
          </div>

          <aside className="lg:col-span-5 bg-white border-t-2 lg:border-t-0 lg:border-l-2 border-emerald-900 p-6 md:p-10 flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              <h3 className="font-display text-lg font-bold text-emerald-950">Pantry Basket</h3>
              <ul className="space-y-3.5">
                {PANTRY_ITEMS.map((item) => (
                  <li key={item.id} className="flex items-center gap-3.5">
                    <MonogramArt
                      monogram={item.monogram}
                      gradient={item.gradient}
                      shape="wave"
                      className="w-12 h-12 rounded-xl text-xs"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-zinc-900 truncate">{item.name}</p>
                      <p className="text-xs text-zinc-500">
                        {item.variant} · Qty {item.qty}
                      </p>
                    </div>
                    <span className="font-mono-num text-sm font-semibold">
                      {formatCurrency(item.price * item.qty)}
                    </span>
                  </li>
                ))}
              </ul>

              <div>
                <p className="text-xs font-bold text-emerald-950 mb-2">Courier gratitude tip</p>
                <div className="grid grid-cols-4 gap-2">
                  {[0, 3, 5, 8].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setTip(amt)}
                      className={`py-2 rounded-lg text-xs font-mono-num font-bold border-2 ${
                        tip === amt
                          ? 'bg-rose-500 border-rose-600 text-white'
                          : 'bg-[#FFFBEB] border-emerald-200 text-emerald-950'
                      }`}
                    >
                      ${amt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="s7-promo" className="block text-xs font-bold text-emerald-950 mb-1.5">
                  Promo code (WARM15 / SAVE20)
                </label>
                <div className="flex gap-2">
                  <input
                    id="s7-promo"
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="SAVE20"
                    className="flex-1 px-3 py-2 text-sm font-mono-num border-2 border-emerald-200 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="px-4 py-2 bg-emerald-900 text-white text-xs font-bold rounded-lg hover:bg-emerald-800"
                  >
                    Apply
                  </button>
                </div>
                {promoFeedback && <p className="text-xs font-medium text-emerald-700 mt-1">{promoFeedback}</p>}
              </div>
            </div>

            <div className="pt-5 border-t border-emerald-100 space-y-4">
              <dl className="space-y-1.5 text-sm">
                <div className="flex justify-between text-zinc-600">
                  <dt>Subtotal</dt>
                  <dd className="font-mono-num">{formatCurrency(baseTotals.subtotal)}</dd>
                </div>
                {baseTotals.discount > 0 && (
                  <div className="flex justify-between text-rose-600 font-medium">
                    <dt>Discount</dt>
                    <dd className="font-mono-num">-{formatCurrency(baseTotals.discount)}</dd>
                  </div>
                )}
                <div className="flex justify-between text-zinc-600">
                  <dt>Delivery + Courier Tip</dt>
                  <dd className="font-mono-num">{formatCurrency(baseTotals.shipping + tip)}</dd>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <dt>Tax</dt>
                  <dd className="font-mono-num">{formatCurrency(baseTotals.tax)}</dd>
                </div>
                <div className="flex justify-between pt-2 border-t border-emerald-100 text-base font-bold text-emerald-950">
                  <dt>Total</dt>
                  <dd className="font-mono-num">{formatCurrency(grandTotal)}</dd>
                </div>
              </dl>
              <button
                type="submit"
                className="w-full py-3 bg-rose-500 text-white text-sm font-bold rounded-xl hover:bg-rose-600 transition-colors"
              >
                Place Pantry Order · {formatCurrency(grandTotal)}
              </button>
            </div>
          </aside>
        </form>
      )}
    </section>
  );
}
