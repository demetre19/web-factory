import React, { useState } from 'react';
import { Check, Lock, ArrowLeft, ShieldCheck } from 'lucide-react';
import {
  calculateCartTotals,
  formatCardNumber,
  formatCurrency,
  validateCardFields,
  validateShippingFields,
  type LineItem,
} from '../../utils/commerce';
import { MonogramArt } from '../MonogramArt';

const INITIAL_ITEMS: LineItem[] = [
  {
    id: 'kr-1',
    name: 'Nordic Task Lamp 04',
    variant: 'Matte Chalk · 2700K Warm LED',
    price: 210,
    qty: 1,
    monogram: 'NL',
    gradient: ['#1E293B', '#475569'],
  },
  {
    id: 'kr-2',
    name: 'Weighted Brass Pen Tray',
    variant: 'Brushed Steel · 240mm',
    price: 68,
    qty: 1,
    monogram: 'BT',
    gradient: ['#334155', '#64748B'],
  },
];

const STEPS = ['Shipping', 'Payment', 'Review'] as const;

export function Shop1() {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [placed, setPlaced] = useState(false);
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  const [shipping, setShipping] = useState({
    fullName: 'Clara Lindqvist',
    email: 'clara@lindqvist.se',
    address: '428 Mercer Street, Apt 4B',
    city: 'Seattle',
    postalCode: '98109',
  });
  const [payment, setPayment] = useState({
    cardName: 'Clara Lindqvist',
    cardNumber: '4242 4242 4242 4242',
    expiry: '09/28',
    cvc: '842',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const shippingCost = shippingMethod === 'express' ? 18 : 0;
  const totals = calculateCartTotals(INITIAL_ITEMS, shippingCost, null, 0.08);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 0) {
      const nextErrors = validateShippingFields(shipping);
      if (Object.keys(nextErrors).length > 0) {
        setErrors(nextErrors);
        return;
      }
      setErrors({});
      setStep(1);
    } else if (step === 1) {
      const nextErrors = validateCardFields(payment);
      if (Object.keys(nextErrors).length > 0) {
        setErrors(nextErrors);
        return;
      }
      setErrors({});
      setStep(2);
    } else {
      setPlaced(true);
    }
  };

  if (placed) {
    return (
      <section className="bg-white text-slate-900 rounded-xl border border-slate-200 p-8 md:p-12 max-w-3xl mx-auto shadow-sm">
        <div className="flex items-center gap-3 text-emerald-700 mb-4">
          <ShieldCheck className="w-6 h-6 shrink-0" />
          <span className="text-sm font-medium">Order confirmed</span>
        </div>
        <h2 className="font-display text-2xl font-semibold tracking-tight text-slate-900">
          Thank you, {shipping.fullName}. Order #KR-48219 is scheduled.
        </h2>
        <p className="text-slate-600 text-sm mt-2">
          Confirmation dispatched to <span className="font-medium text-slate-900">{shipping.email}</span>.
          Total charged <span className="font-mono-num font-semibold text-slate-900">{formatCurrency(totals.total)}</span>.
        </p>
        <button
          type="button"
          onClick={() => {
            setPlaced(false);
            setStep(0);
          }}
          className="mt-6 px-5 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
        >
          Start another checkout
        </button>
      </section>
    );
  }

  return (
    <section className="bg-white text-slate-900 rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="border-b border-slate-200 px-6 md:px-10 py-5 flex flex-wrap items-center justify-between gap-4">
        <span className="font-display text-base font-semibold tracking-tight text-slate-900">
          Kronos Atelier
        </span>
        <nav aria-label="Checkout progress">
          <ol className="flex items-center gap-6 text-sm">
            {STEPS.map((label, idx) => {
              const active = idx === step;
              const done = idx < step;
              return (
                <li key={label} className="flex items-center gap-2">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono-num font-medium border ${
                      done
                        ? 'bg-slate-900 border-slate-900 text-white'
                        : active
                          ? 'border-slate-900 text-slate-900 font-semibold'
                          : 'border-slate-300 text-slate-400'
                    }`}
                  >
                    {done ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                  </span>
                  <span className={active || done ? 'font-medium text-slate-900' : 'text-slate-400'}>
                    {label}
                  </span>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12">
        <form onSubmit={handleNext} noValidate className="lg:col-span-7 p-6 md:p-10 space-y-6">
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-xl font-semibold text-slate-900">Shipping details</h2>
                <p className="text-sm text-slate-500 mt-1">Enter where your fixtures should be delivered.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label htmlFor="s1-name" className="block text-xs font-medium text-slate-700 mb-1.5">
                    Full name
                  </label>
                  <input
                    id="s1-name"
                    type="text"
                    value={shipping.fullName}
                    onChange={(e) => setShipping({ ...shipping, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  {errors.fullName && <p className="text-xs text-red-600 mt-1">{errors.fullName}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="s1-email" className="block text-xs font-medium text-slate-700 mb-1.5">
                    Email address
                  </label>
                  <input
                    id="s1-email"
                    type="email"
                    value={shipping.email}
                    onChange={(e) => setShipping({ ...shipping, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="s1-addr" className="block text-xs font-medium text-slate-700 mb-1.5">
                    Street address
                  </label>
                  <input
                    id="s1-addr"
                    type="text"
                    value={shipping.address}
                    onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  {errors.address && <p className="text-xs text-red-600 mt-1">{errors.address}</p>}
                </div>
                <div>
                  <label htmlFor="s1-city" className="block text-xs font-medium text-slate-700 mb-1.5">
                    City
                  </label>
                  <input
                    id="s1-city"
                    type="text"
                    value={shipping.city}
                    onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  {errors.city && <p className="text-xs text-red-600 mt-1">{errors.city}</p>}
                </div>
                <div>
                  <label htmlFor="s1-zip" className="block text-xs font-medium text-slate-700 mb-1.5">
                    Postal code
                  </label>
                  <input
                    id="s1-zip"
                    type="text"
                    value={shipping.postalCode}
                    onChange={(e) => setShipping({ ...shipping, postalCode: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm font-mono-num border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  {errors.postalCode && <p className="text-xs text-red-600 mt-1">{errors.postalCode}</p>}
                </div>
              </div>

              <fieldset className="pt-2">
                <legend className="text-xs font-medium text-slate-700 mb-2.5">Delivery method</legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    className={`flex items-start justify-between p-3.5 rounded-lg border cursor-pointer transition-colors ${
                      shippingMethod === 'standard'
                        ? 'border-slate-900 bg-slate-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="flex items-start gap-2.5">
                      <input
                        type="radio"
                        name="s1-ship"
                        checked={shippingMethod === 'standard'}
                        onChange={() => setShippingMethod('standard')}
                        className="mt-1 accent-slate-900"
                      />
                      <span>
                        <span className="block text-sm font-medium text-slate-900">Standard Ground</span>
                        <span className="block text-xs text-slate-500">4–6 business days</span>
                      </span>
                    </span>
                    <span className="text-sm font-mono-num font-medium text-slate-900">Free</span>
                  </label>
                  <label
                    className={`flex items-start justify-between p-3.5 rounded-lg border cursor-pointer transition-colors ${
                      shippingMethod === 'express'
                        ? 'border-slate-900 bg-slate-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="flex items-start gap-2.5">
                      <input
                        type="radio"
                        name="s1-ship"
                        checked={shippingMethod === 'express'}
                        onChange={() => setShippingMethod('express')}
                        className="mt-1 accent-slate-900"
                      />
                      <span>
                        <span className="block text-sm font-medium text-slate-900">Express Courier</span>
                        <span className="block text-xs text-slate-500">1–2 business days</span>
                      </span>
                    </span>
                    <span className="text-sm font-mono-num font-medium text-slate-900">$18.00</span>
                  </label>
                </div>
              </fieldset>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-xl font-semibold text-slate-900">Payment method</h2>
                <p className="text-sm text-slate-500 mt-1">All transactions are encrypted and tokenized.</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label htmlFor="s1-cname" className="block text-xs font-medium text-slate-700 mb-1.5">
                    Name on card
                  </label>
                  <input
                    id="s1-cname"
                    type="text"
                    value={payment.cardName}
                    onChange={(e) => setPayment({ ...payment, cardName: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  {errors.cardName && <p className="text-xs text-red-600 mt-1">{errors.cardName}</p>}
                </div>
                <div>
                  <label htmlFor="s1-cnum" className="block text-xs font-medium text-slate-700 mb-1.5">
                    Card number
                  </label>
                  <input
                    id="s1-cnum"
                    type="text"
                    inputMode="numeric"
                    value={payment.cardNumber}
                    onChange={(e) =>
                      setPayment({ ...payment, cardNumber: formatCardNumber(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 text-sm font-mono-num border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  {errors.cardNumber && <p className="text-xs text-red-600 mt-1">{errors.cardNumber}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="s1-exp" className="block text-xs font-medium text-slate-700 mb-1.5">
                      Expiry (MM/YY)
                    </label>
                    <input
                      id="s1-exp"
                      type="text"
                      value={payment.expiry}
                      onChange={(e) => setPayment({ ...payment, expiry: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm font-mono-num border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                    {errors.expiry && <p className="text-xs text-red-600 mt-1">{errors.expiry}</p>}
                  </div>
                  <div>
                    <label htmlFor="s1-cvc" className="block text-xs font-medium text-slate-700 mb-1.5">
                      Security code
                    </label>
                    <input
                      id="s1-cvc"
                      type="text"
                      inputMode="numeric"
                      value={payment.cvc}
                      onChange={(e) => setPayment({ ...payment, cvc: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm font-mono-num border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                    {errors.cvc && <p className="text-xs text-red-600 mt-1">{errors.cvc}</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-xl font-semibold text-slate-900">Review & confirm</h2>
                <p className="text-sm text-slate-500 mt-1">Verify your destination and payment details before placing order.</p>
              </div>
              <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg">
                <div className="p-4 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs text-slate-500">Ship to</p>
                    <p className="text-sm font-medium text-slate-900 mt-0.5">{shipping.fullName}</p>
                    <p className="text-sm text-slate-600">
                      {shipping.address}, {shipping.city} {shipping.postalCode}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(0)}
                    className="text-xs font-medium text-slate-900 underline underline-offset-4 hover:text-slate-600"
                  >
                    Edit
                  </button>
                </div>
                <div className="p-4 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs text-slate-500">Method</p>
                    <p className="text-sm font-medium text-slate-900 mt-0.5">
                      {shippingMethod === 'express' ? 'Express Courier (1–2 days)' : 'Standard Ground (4–6 days)'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(0)}
                    className="text-xs font-medium text-slate-900 underline underline-offset-4 hover:text-slate-600"
                  >
                    Edit
                  </button>
                </div>
                <div className="p-4 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs text-slate-500">Payment</p>
                    <p className="text-sm font-medium text-slate-900 font-mono-num mt-0.5">
                      Card ending in {payment.cardNumber.slice(-4)} · Exp {payment.expiry}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs font-medium text-slate-900 underline underline-offset-4 hover:text-slate-600"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-4">
            {step > 0 ? (
              <button
                type="button"
                onClick={() => setStep((step - 1) as 0 | 1)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-slate-700 hover:text-slate-900"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                <Lock className="w-3.5 h-3.5" />
                TLS encrypted checkout
              </span>
            )}
            <button
              type="submit"
              className="px-6 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
            >
              {step === 0 ? 'Continue to payment' : step === 1 ? 'Review order' : `Place order · ${formatCurrency(totals.total)}`}
            </button>
          </div>
        </form>

        <aside className="lg:col-span-5 bg-slate-50 border-t lg:border-t-0 lg:border-l border-slate-200 p-6 md:p-10 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-5">Order summary</h3>
            <ul className="space-y-4">
              {INITIAL_ITEMS.map((item) => (
                <li key={item.id} className="flex items-center gap-4">
                  <MonogramArt
                    monogram={item.monogram}
                    gradient={item.gradient}
                    shape="arch"
                    className="w-14 h-14 rounded-lg text-sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 truncate">{item.name}</p>
                    <p className="text-xs text-slate-500 truncate">
                      {item.variant} · Qty {item.qty}
                    </p>
                  </div>
                  <span className="text-sm font-mono-num font-medium text-slate-900">
                    {formatCurrency(item.price * item.qty)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <dl className="mt-8 pt-6 border-t border-slate-200 space-y-2.5 text-sm">
            <div className="flex justify-between text-slate-600">
              <dt>Subtotal</dt>
              <dd className="font-mono-num text-slate-900">{formatCurrency(totals.subtotal)}</dd>
            </div>
            <div className="flex justify-between text-slate-600">
              <dt>Shipping</dt>
              <dd className="font-mono-num text-slate-900">
                {totals.shipping === 0 ? 'Complimentary' : formatCurrency(totals.shipping)}
              </dd>
            </div>
            <div className="flex justify-between text-slate-600">
              <dt>Estimated tax (8%)</dt>
              <dd className="font-mono-num text-slate-900">{formatCurrency(totals.tax)}</dd>
            </div>
            <div className="flex justify-between pt-3 border-t border-slate-200 text-base font-semibold text-slate-900">
              <dt>Total</dt>
              <dd className="font-mono-num">{formatCurrency(totals.total)}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </section>
  );
}
