import React, { useState } from 'react';
import { Check, Zap } from 'lucide-react';
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

const DROP_ITEMS: LineItem[] = [
  {
    id: 'vc-1',
    name: 'Volt Court Low 88',
    variant: 'US 10.5 · Cobalt / Marigold',
    price: 165,
    qty: 1,
    monogram: 'VC',
    gradient: ['#1D4ED8', '#2563EB'],
  },
];

export function Shop4() {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [ordered, setOrdered] = useState(false);
  const [express, setExpress] = useState(true);
  const [promoCode, setPromoCode] = useState('WARM15');
  const [appliedPromo, setAppliedPromo] = useState<PromoResult | null>(null);
  const [promoMsg, setPromoMsg] = useState('');
  const [shipping, setShipping] = useState({
    fullName: 'Devon Brooks',
    email: 'devon@voltcourt.club',
    address: '219 Broadway Ave',
    city: 'Brooklyn',
    postalCode: '11211',
  });
  const [payment, setPayment] = useState({
    cardName: 'Devon Brooks',
    cardNumber: '4532 1094 8821 3309',
    expiry: '03/28',
    cvc: '612',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const totals = calculateCartTotals(DROP_ITEMS, express ? 15 : 0, appliedPromo, 0.08);

  const applyPromo = () => {
    const res = evaluatePromoCode(promoCode, 165);
    if (!res.valid) {
      setPromoMsg(res.error || 'Invalid code');
      setAppliedPromo(null);
    } else {
      setAppliedPromo(res);
      setPromoMsg(`Applied: ${res.label}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 0) {
      const err = validateShippingFields(shipping);
      if (Object.keys(err).length) {
        setErrors(err);
        return;
      }
      setErrors({});
      setStep(1);
    } else if (step === 1) {
      const err = validateCardFields(payment);
      if (Object.keys(err).length) {
        setErrors(err);
        return;
      }
      setErrors({});
      setStep(2);
    } else {
      setOrdered(true);
    }
  };

  return (
    <section className="bg-[#FFFDF7] text-zinc-950 rounded-2xl border-2 border-zinc-950 p-6 sm:p-10 shadow-[6px_6px_0px_#18181B]">
      <div className="max-w-2xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b-2 border-zinc-950">
          <span className="inline-flex items-center gap-2 font-display text-xl font-bold tracking-tight">
            <span className="w-7 h-7 rounded bg-[#FACC15] border-2 border-zinc-950 flex items-center justify-center">
              <Zap className="w-4 h-4 text-zinc-950" />
            </span>
            Volt Court Drop
          </span>
          <span className="font-mono-num text-sm font-semibold text-[#1D4ED8]">
            Pair total: {formatCurrency(totals.total)}
          </span>
        </div>

        <nav aria-label="Drop checkout progress" className="my-6">
          <ol className="grid grid-cols-3 gap-3">
            {['Shipping', 'Payment', 'Confirm'].map((label, idx) => {
              const active = idx === step && !ordered;
              const done = idx < step || ordered;
              return (
                <li
                  key={label}
                  className={`py-2.5 px-3 rounded-lg border-2 border-zinc-950 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 ${
                    done
                      ? 'bg-[#1D4ED8] text-white'
                      : active
                        ? 'bg-[#FACC15] text-zinc-950'
                        : 'bg-white text-zinc-400 border-zinc-300'
                  }`}
                >
                  {done && <Check className="w-4 h-4" />}
                  {idx + 1}. {label}
                </li>
              );
            })}
          </ol>
        </nav>

        {ordered ? (
          <div className="bg-[#1D4ED8] text-white border-2 border-zinc-950 rounded-xl p-8 space-y-3">
            <h3 className="font-display text-2xl font-bold">Drop Secured — #VC-88412</h3>
            <p className="text-blue-100 text-sm">
              Volt Court Low 88 reserved for {shipping.fullName}. Shipping to {shipping.city}.
            </p>
            <button
              type="button"
              onClick={() => {
                setOrdered(false);
                setStep(0);
              }}
              className="mt-2 px-5 py-2.5 bg-[#FACC15] text-zinc-950 font-bold text-sm rounded-lg border-2 border-zinc-950 hover:bg-yellow-300 transition-colors"
            >
              Restart drop checkout
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            <div className="bg-white border-2 border-zinc-950 rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <MonogramArt
                  monogram={DROP_ITEMS[0].monogram}
                  gradient={DROP_ITEMS[0].gradient}
                  shape="prism"
                  className="w-14 h-14 rounded-lg border-2 border-zinc-950 text-base"
                />
                <div>
                  <p className="font-display font-bold text-zinc-950">{DROP_ITEMS[0].name}</p>
                  <p className="text-xs text-zinc-600">{DROP_ITEMS[0].variant}</p>
                </div>
              </div>
              <span className="font-mono-num font-bold text-zinc-950">$165.00</span>
            </div>

            {step === 0 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label htmlFor="s4-name" className="block text-xs font-bold text-zinc-900 mb-1">
                      Full name
                    </label>
                    <input
                      id="s4-name"
                      type="text"
                      value={shipping.fullName}
                      onChange={(e) => setShipping({ ...shipping, fullName: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border-2 border-zinc-950 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                    />
                    {errors.fullName && <p className="text-xs font-semibold text-red-600 mt-1">{errors.fullName}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="s4-email" className="block text-xs font-bold text-zinc-900 mb-1">
                      Email
                    </label>
                    <input
                      id="s4-email"
                      type="email"
                      value={shipping.email}
                      onChange={(e) => setShipping({ ...shipping, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border-2 border-zinc-950 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                    />
                    {errors.email && <p className="text-xs font-semibold text-red-600 mt-1">{errors.email}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="s4-addr" className="block text-xs font-bold text-zinc-900 mb-1">
                      Street address
                    </label>
                    <input
                      id="s4-addr"
                      type="text"
                      value={shipping.address}
                      onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border-2 border-zinc-950 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                    />
                    {errors.address && <p className="text-xs font-semibold text-red-600 mt-1">{errors.address}</p>}
                  </div>
                  <div>
                    <label htmlFor="s4-city" className="block text-xs font-bold text-zinc-900 mb-1">
                      City
                    </label>
                    <input
                      id="s4-city"
                      type="text"
                      value={shipping.city}
                      onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border-2 border-zinc-950 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                    />
                    {errors.city && <p className="text-xs font-semibold text-red-600 mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <label htmlFor="s4-zip" className="block text-xs font-bold text-zinc-900 mb-1">
                      Zip code
                    </label>
                    <input
                      id="s4-zip"
                      type="text"
                      value={shipping.postalCode}
                      onChange={(e) => setShipping({ ...shipping, postalCode: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm font-mono-num bg-white border-2 border-zinc-950 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                    />
                    {errors.postalCode && <p className="text-xs font-semibold text-red-600 mt-1">{errors.postalCode}</p>}
                  </div>
                </div>
                <label className="flex items-center justify-between p-3.5 bg-[#EFF6FF] border-2 border-[#1D4ED8] rounded-lg cursor-pointer">
                  <span className="flex items-center gap-2.5 text-sm font-bold text-[#1E3A8A]">
                    <input
                      type="checkbox"
                      checked={express}
                      onChange={(e) => setExpress(e.target.checked)}
                      className="w-4 h-4 accent-[#1D4ED8]"
                    />
                    Next-Day Sneaker Airbox
                  </span>
                  <span className="font-mono-num text-sm font-bold text-[#1D4ED8]">$15.00</span>
                </label>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="s4-promo" className="block text-xs font-bold text-zinc-900 mb-1">
                    Member promo code (try WARM15 or SHIPFREE)
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="s4-promo"
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-1 px-3.5 py-2 text-sm font-mono-num bg-white border-2 border-zinc-950 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={applyPromo}
                      className="px-4 py-2 bg-[#FACC15] text-zinc-950 font-bold text-sm rounded-lg border-2 border-zinc-950 hover:bg-yellow-300"
                    >
                      Apply
                    </button>
                  </div>
                  {promoMsg && <p className="text-xs font-semibold text-[#1D4ED8] mt-1">{promoMsg}</p>}
                </div>

                <div>
                  <label htmlFor="s4-cname" className="block text-xs font-bold text-zinc-900 mb-1">
                    Name on card
                  </label>
                  <input
                    id="s4-cname"
                    type="text"
                    value={payment.cardName}
                    onChange={(e) => setPayment({ ...payment, cardName: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border-2 border-zinc-950 rounded-lg"
                  />
                  {errors.cardName && <p className="text-xs font-semibold text-red-600 mt-1">{errors.cardName}</p>}
                </div>
                <div>
                  <label htmlFor="s4-cnum" className="block text-xs font-bold text-zinc-900 mb-1">
                    Card number
                  </label>
                  <input
                    id="s4-cnum"
                    type="text"
                    value={payment.cardNumber}
                    onChange={(e) => setPayment({ ...payment, cardNumber: formatCardNumber(e.target.value) })}
                    className="w-full px-3.5 py-2.5 text-sm font-mono-num bg-white border-2 border-zinc-950 rounded-lg"
                  />
                  {errors.cardNumber && <p className="text-xs font-semibold text-red-600 mt-1">{errors.cardNumber}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="s4-exp" className="block text-xs font-bold text-zinc-900 mb-1">
                      Expiry
                    </label>
                    <input
                      id="s4-exp"
                      type="text"
                      value={payment.expiry}
                      onChange={(e) => setPayment({ ...payment, expiry: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm font-mono-num bg-white border-2 border-zinc-950 rounded-lg"
                    />
                    {errors.expiry && <p className="text-xs font-semibold text-red-600 mt-1">{errors.expiry}</p>}
                  </div>
                  <div>
                    <label htmlFor="s4-cvc" className="block text-xs font-bold text-zinc-900 mb-1">
                      CVC
                    </label>
                    <input
                      id="s4-cvc"
                      type="text"
                      value={payment.cvc}
                      onChange={(e) => setPayment({ ...payment, cvc: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm font-mono-num bg-white border-2 border-zinc-950 rounded-lg"
                    />
                    {errors.cvc && <p className="text-xs font-semibold text-red-600 mt-1">{errors.cvc}</p>}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="bg-white border-2 border-zinc-950 rounded-xl p-5 space-y-3 text-sm">
                <p className="font-bold text-zinc-950">Ready to lock pair</p>
                <p className="text-zinc-700">
                  Shipping to <span className="font-semibold">{shipping.fullName}</span> ({shipping.address},{' '}
                  {shipping.city})
                </p>
                <p className="text-zinc-700 font-mono-num">
                  Card •••• {payment.cardNumber.slice(-4)} · Discount -{formatCurrency(totals.discount)}
                </p>
                <p className="text-base font-bold font-mono-num text-[#1D4ED8] pt-2 border-t border-zinc-200">
                  Final Charge: {formatCurrency(totals.total)}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              {step > 0 ? (
                <button
                  type="button"
                  onClick={() => setStep((step - 1) as 0 | 1)}
                  className="px-4 py-2.5 text-sm font-bold border-2 border-zinc-950 rounded-lg bg-white hover:bg-zinc-100"
                >
                  Back
                </button>
              ) : (
                <span />
              )}
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#1D4ED8] text-white text-sm font-bold rounded-lg border-2 border-zinc-950 shadow-[3px_3px_0px_#18181B] hover:bg-blue-700 transition-colors"
              >
                {step === 0 ? 'Next: Payment' : step === 1 ? 'Next: Confirm' : 'Place Drop Order'}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
