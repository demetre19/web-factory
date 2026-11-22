import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Lock } from 'lucide-react';
import {
  calculateCartTotals,
  formatCardNumber,
  formatCurrency,
  validateCardFields,
  validateShippingFields,
  type LineItem,
} from '../../utils/commerce';
import { MonogramArt } from '../MonogramArt';

const STATIONERY_ITEMS: LineItem[] = [
  {
    id: 'ms-1',
    name: 'Milled Aluminum Fountain Pen',
    variant: 'Fine Nib · Matte Silver',
    price: 118,
    qty: 1,
    monogram: 'MS',
    gradient: ['#2563EB', '#1D4ED8'],
  },
  {
    id: 'ms-2',
    name: 'Tomoe 160gsm Dot Notebook',
    variant: 'A5 Hardcover · Slate Blue',
    price: 34,
    qty: 2,
    monogram: 'TN',
    gradient: ['#334155', '#1E293B'],
  },
];

export function Shop6() {
  const [expanded, setExpanded] = useState(true);
  const [placed, setPlaced] = useState(false);
  const [form, setForm] = useState({
    fullName: 'Julian Park',
    email: 'julian@monograph.supply',
    address: '540 NW Flanders St',
    city: 'Portland',
    postalCode: '97209',
    cardName: 'Julian Park',
    cardNumber: '4242 4242 4242 4242',
    expiry: '04/28',
    cvc: '311',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const totals = calculateCartTotals(STATIONERY_ITEMS, 6, null, 0.08);

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
    setPlaced(true);
  };

  return (
    <section className="bg-slate-50 text-slate-900 rounded-xl border border-slate-200 py-10 px-4 sm:px-8">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <span className="font-display text-lg font-semibold tracking-tight text-slate-900">
            Monograph Supply
          </span>
          <span className="text-xs text-slate-500">Single-Page Checkout</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <button
            type="button"
            aria-expanded={expanded}
            onClick={() => setExpanded(!expanded)}
            className="w-full px-5 py-4 flex items-center justify-between text-sm font-medium text-slate-900 hover:bg-slate-50"
          >
            <span className="inline-flex items-center gap-2">
              {expanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
              Order summary · 3 items
            </span>
            <span className="font-mono-num font-semibold text-blue-600">{formatCurrency(totals.total)}</span>
          </button>
          {expanded && (
            <div className="px-5 pb-4 pt-2 border-t border-slate-100 space-y-3">
              {STATIONERY_ITEMS.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <MonogramArt
                      monogram={item.monogram}
                      gradient={item.gradient}
                      shape="grid"
                      className="w-11 h-11 rounded-md text-xs"
                    />
                    <div>
                      <p className="text-sm font-medium text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-500">
                        {item.variant} · Qty {item.qty}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono-num text-sm text-slate-900">
                    {formatCurrency(item.price * item.qty)}
                  </span>
                </div>
              ))}
              <div className="pt-2 border-t border-slate-100 flex justify-between text-xs text-slate-500">
                <span>Shipping $6.00 · Tax {formatCurrency(totals.tax)}</span>
                <span className="font-mono-num font-medium text-slate-900">
                  Total {formatCurrency(totals.total)}
                </span>
              </div>
            </div>
          )}
        </div>

        {placed ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-3">
            <p className="text-xs font-mono-num font-semibold text-blue-600">ORDER #MS-55821 CONFIRMED</p>
            <h2 className="font-display text-xl font-semibold text-slate-900">
              Your stationery parcel is queued
            </h2>
            <p className="text-sm text-slate-600">
              Receipt sent to {form.email}. Shipping to {form.address}, {form.city}.
            </p>
            <button
              type="button"
              onClick={() => setPlaced(false)}
              className="mt-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
            >
              Reset form
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-slate-900">1. Contact & Shipping</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <label htmlFor="s6-email" className="block text-xs font-medium text-slate-600 mb-1">
                    Email
                  </label>
                  <input
                    id="s6-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="s6-name" className="block text-xs font-medium text-slate-600 mb-1">
                    Full name
                  </label>
                  <input
                    id="s6-name"
                    type="text"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  {errors.fullName && <p className="text-xs text-red-600 mt-1">{errors.fullName}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="s6-addr" className="block text-xs font-medium text-slate-600 mb-1">
                    Address
                  </label>
                  <input
                    id="s6-addr"
                    type="text"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  {errors.address && <p className="text-xs text-red-600 mt-1">{errors.address}</p>}
                </div>
                <div>
                  <label htmlFor="s6-city" className="block text-xs font-medium text-slate-600 mb-1">
                    City
                  </label>
                  <input
                    id="s6-city"
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  {errors.city && <p className="text-xs text-red-600 mt-1">{errors.city}</p>}
                </div>
                <div>
                  <label htmlFor="s6-zip" className="block text-xs font-medium text-slate-600 mb-1">
                    Postal code
                  </label>
                  <input
                    id="s6-zip"
                    type="text"
                    value={form.postalCode}
                    onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                    className="w-full px-3 py-2 text-sm font-mono-num border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  {errors.postalCode && <p className="text-xs text-red-600 mt-1">{errors.postalCode}</p>}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-4">
              <h2 className="text-sm font-semibold text-slate-900">2. Payment</h2>
              <div className="grid grid-cols-2 gap-3.5">
                <div className="col-span-2">
                  <label htmlFor="s6-cname" className="block text-xs font-medium text-slate-600 mb-1">
                    Name on card
                  </label>
                  <input
                    id="s6-cname"
                    type="text"
                    value={form.cardName}
                    onChange={(e) => setForm({ ...form, cardName: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  {errors.cardName && <p className="text-xs text-red-600 mt-1">{errors.cardName}</p>}
                </div>
                <div className="col-span-2">
                  <label htmlFor="s6-cnum" className="block text-xs font-medium text-slate-600 mb-1">
                    Card number
                  </label>
                  <input
                    id="s6-cnum"
                    type="text"
                    value={form.cardNumber}
                    onChange={(e) => setForm({ ...form, cardNumber: formatCardNumber(e.target.value) })}
                    className="w-full px-3 py-2 text-sm font-mono-num border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  {errors.cardNumber && <p className="text-xs text-red-600 mt-1">{errors.cardNumber}</p>}
                </div>
                <div>
                  <label htmlFor="s6-exp" className="block text-xs font-medium text-slate-600 mb-1">
                    Expiry (MM/YY)
                  </label>
                  <input
                    id="s6-exp"
                    type="text"
                    value={form.expiry}
                    onChange={(e) => setForm({ ...form, expiry: e.target.value })}
                    className="w-full px-3 py-2 text-sm font-mono-num border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  {errors.expiry && <p className="text-xs text-red-600 mt-1">{errors.expiry}</p>}
                </div>
                <div>
                  <label htmlFor="s6-cvc" className="block text-xs font-medium text-slate-600 mb-1">
                    CVC
                  </label>
                  <input
                    id="s6-cvc"
                    type="text"
                    value={form.cvc}
                    onChange={(e) => setForm({ ...form, cvc: e.target.value })}
                    className="w-full px-3 py-2 text-sm font-mono-num border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  {errors.cvc && <p className="text-xs text-red-600 mt-1">{errors.cvc}</p>}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              Pay {formatCurrency(totals.total)} now
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
