import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';
import {
  calculateCartTotals,
  formatCardNumber,
  formatCurrency,
  validateCardFields,
  validateShippingFields,
  type LineItem,
} from '../../utils/commerce';
import { MonogramArt } from '../MonogramArt';

const ITEMS: LineItem[] = [
  {
    id: 'tb-1',
    name: 'Hinoki & Cedar Oil Cleanser',
    variant: '200ml Amber Glass',
    price: 54,
    qty: 1,
    monogram: 'HC',
    gradient: ['#657C58', '#3F5336'],
  },
  {
    id: 'tb-2',
    name: 'Oat Barrier Recovery Balm',
    variant: '75ml Ceramic Jar',
    price: 68,
    qty: 2,
    monogram: 'OB',
    gradient: ['#A67C52', '#7C5836'],
  },
];

export function Shop2() {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [form, setForm] = useState({
    fullName: 'Nadia Alvarez',
    email: 'nadia@alvarezstudio.co',
    address: '814 Oakridge Lane',
    city: 'Portland',
    postalCode: '97205',
    giftNote: 'Wrapped in unbleached linen.',
    cardName: 'Nadia Alvarez',
    cardNumber: '5412 8820 3412 9011',
    expiry: '11/29',
    cvc: '415',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const totals = calculateCartTotals(ITEMS, 8, null, 0.08);

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 0) {
      const nextErr = validateShippingFields(form);
      if (Object.keys(nextErr).length > 0) {
        setErrors(nextErr);
        return;
      }
      setErrors({});
      setStep(1);
    } else if (step === 1) {
      const nextErr = validateCardFields(form);
      if (Object.keys(nextErr).length > 0) {
        setErrors(nextErr);
        return;
      }
      setErrors({});
      setStep(2);
    } else {
      setConfirmed(true);
    }
  };

  return (
    <section className="bg-[#FAF7F2] text-[#292524] rounded-2xl border border-[#E6DFD3] py-10 px-4 sm:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-xs font-medium tracking-widest uppercase text-[#6B6257]">Terra Botanica</p>
          <h2 className="font-editorial text-3xl font-semibold text-[#1C1917] mt-1">
            Apothecary Checkout
          </h2>
        </div>

        <div className="mb-6 bg-[#F3EDE3] rounded-xl border border-[#E6DFD3] overflow-hidden">
          <button
            type="button"
            aria-expanded={summaryOpen}
            onClick={() => setSummaryOpen(!summaryOpen)}
            className="w-full px-5 py-3.5 flex items-center justify-between text-sm font-medium text-[#292524]"
          >
            <span className="flex items-center gap-2">
              {summaryOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {summaryOpen ? 'Hide bag summary' : 'Show bag summary (3 items)'}
            </span>
            <span className="font-mono-num font-semibold">{formatCurrency(totals.total)}</span>
          </button>
          {summaryOpen && (
            <div className="px-5 pb-4 pt-2 border-t border-[#E6DFD3] space-y-3">
              {ITEMS.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <MonogramArt
                      monogram={item.monogram}
                      gradient={item.gradient}
                      shape="circle"
                      className="w-11 h-11 rounded-lg text-xs"
                    />
                    <div>
                      <p className="text-sm font-medium text-[#1C1917]">{item.name}</p>
                      <p className="text-xs text-[#6B6257]">
                        {item.variant} · Qty {item.qty}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-mono-num">{formatCurrency(item.price * item.qty)}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-[#E6DFD3] flex justify-between text-xs text-[#6B6257]">
                <span>Shipping $8.00 · Tax {formatCurrency(totals.tax)}</span>
                <span className="font-mono-num font-semibold text-[#1C1917]">
                  Total {formatCurrency(totals.total)}
                </span>
              </div>
            </div>
          )}
        </div>

        <nav aria-label="Apothecary checkout steps" className="mb-8">
          <ol className="grid grid-cols-3 gap-3">
            {['1. Shipping', '2. Payment', '3. Review'].map((label, idx) => {
              const active = step === idx && !confirmed;
              const done = idx < step || confirmed;
              return (
                <li
                  key={label}
                  className={`py-2.5 px-3 rounded-lg border text-center text-xs font-medium transition-colors ${
                    done
                      ? 'bg-[#14532D] border-[#14532D] text-white'
                      : active
                        ? 'bg-white border-[#14532D] text-[#14532D] font-semibold'
                        : 'bg-[#F5F0E8] border-[#E6DFD3] text-[#78716C]'
                  }`}
                >
                  {done ? (
                    <span className="inline-flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> {label}
                    </span>
                  ) : (
                    label
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        {confirmed ? (
          <div className="bg-white rounded-xl border border-[#E6DFD3] p-8 text-center space-y-3">
            <h3 className="font-editorial text-2xl font-semibold text-[#14532D]">
              Order #TB-20419 Received
            </h3>
            <p className="text-sm text-[#57534E]">
              Your botanical formulations are being hand-packed for {form.fullName} at {form.address}.
            </p>
            <button
              type="button"
              onClick={() => {
                setConfirmed(false);
                setStep(0);
              }}
              className="mt-4 px-5 py-2.5 bg-[#14532D] text-white text-sm font-medium rounded-lg hover:bg-[#166534] transition-colors"
            >
              Reset sample flow
            </button>
          </div>
        ) : (
          <form onSubmit={handleContinue} noValidate className="bg-white rounded-xl border border-[#E6DFD3] p-6 sm:p-8 space-y-5">
            {step === 0 && (
              <div className="space-y-4">
                <h3 className="font-editorial text-xl font-semibold text-[#1C1917]">Delivery destination</h3>
                <div>
                  <label htmlFor="s2-name" className="block text-xs font-medium text-[#57534E] mb-1">
                    Recipient name
                  </label>
                  <input
                    id="s2-name"
                    type="text"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#DDD5C7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14532D]"
                  />
                  {errors.fullName && <p className="text-xs text-red-700 mt-1">{errors.fullName}</p>}
                </div>
                <div>
                  <label htmlFor="s2-email" className="block text-xs font-medium text-[#57534E] mb-1">
                    Email
                  </label>
                  <input
                    id="s2-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#DDD5C7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14532D]"
                  />
                  {errors.email && <p className="text-xs text-red-700 mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label htmlFor="s2-addr" className="block text-xs font-medium text-[#57534E] mb-1">
                    Address
                  </label>
                  <input
                    id="s2-addr"
                    type="text"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#DDD5C7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14532D]"
                  />
                  {errors.address && <p className="text-xs text-red-700 mt-1">{errors.address}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="s2-city" className="block text-xs font-medium text-[#57534E] mb-1">
                      City
                    </label>
                    <input
                      id="s2-city"
                      type="text"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#DDD5C7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14532D]"
                    />
                    {errors.city && <p className="text-xs text-red-700 mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <label htmlFor="s2-zip" className="block text-xs font-medium text-[#57534E] mb-1">
                      Postal code
                    </label>
                    <input
                      id="s2-zip"
                      type="text"
                      value={form.postalCode}
                      onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm font-mono-num bg-[#FAF7F2] border border-[#DDD5C7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14532D]"
                    />
                    {errors.postalCode && <p className="text-xs text-red-700 mt-1">{errors.postalCode}</p>}
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <h3 className="font-editorial text-xl font-semibold text-[#1C1917]">Card details</h3>
                <div>
                  <label htmlFor="s2-cname" className="block text-xs font-medium text-[#57534E] mb-1">
                    Cardholder name
                  </label>
                  <input
                    id="s2-cname"
                    type="text"
                    value={form.cardName}
                    onChange={(e) => setForm({ ...form, cardName: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#DDD5C7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14532D]"
                  />
                  {errors.cardName && <p className="text-xs text-red-700 mt-1">{errors.cardName}</p>}
                </div>
                <div>
                  <label htmlFor="s2-cnum" className="block text-xs font-medium text-[#57534E] mb-1">
                    Card number
                  </label>
                  <input
                    id="s2-cnum"
                    type="text"
                    value={form.cardNumber}
                    onChange={(e) =>
                      setForm({ ...form, cardNumber: formatCardNumber(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 text-sm font-mono-num bg-[#FAF7F2] border border-[#DDD5C7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14532D]"
                  />
                  {errors.cardNumber && <p className="text-xs text-red-700 mt-1">{errors.cardNumber}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="s2-exp" className="block text-xs font-medium text-[#57534E] mb-1">
                      Expiry
                    </label>
                    <input
                      id="s2-exp"
                      type="text"
                      value={form.expiry}
                      onChange={(e) => setForm({ ...form, expiry: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm font-mono-num bg-[#FAF7F2] border border-[#DDD5C7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14532D]"
                    />
                    {errors.expiry && <p className="text-xs text-red-700 mt-1">{errors.expiry}</p>}
                  </div>
                  <div>
                    <label htmlFor="s2-cvc" className="block text-xs font-medium text-[#57534E] mb-1">
                      CVC
                    </label>
                    <input
                      id="s2-cvc"
                      type="text"
                      value={form.cvc}
                      onChange={(e) => setForm({ ...form, cvc: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm font-mono-num bg-[#FAF7F2] border border-[#DDD5C7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14532D]"
                    />
                    {errors.cvc && <p className="text-xs text-red-700 mt-1">{errors.cvc}</p>}
                  </div>
                </div>
                <div>
                  <label htmlFor="s2-note" className="block text-xs font-medium text-[#57534E] mb-1">
                    Gift enclosure note (optional)
                  </label>
                  <input
                    id="s2-note"
                    type="text"
                    value={form.giftNote}
                    onChange={(e) => setForm({ ...form, giftNote: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#DDD5C7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14532D]"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h3 className="font-editorial text-xl font-semibold text-[#1C1917]">Final review</h3>
                <div className="p-4 rounded-lg bg-[#FAF7F2] border border-[#E6DFD3] space-y-2 text-sm">
                  <p>
                    <span className="text-[#78716C]">Deliver to:</span>{' '}
                    <span className="font-medium">{form.fullName}</span> — {form.address}, {form.city}
                  </p>
                  <p>
                    <span className="text-[#78716C]">Card:</span>{' '}
                    <span className="font-mono-num">•••• {form.cardNumber.slice(-4)}</span>
                  </p>
                  {form.giftNote && (
                    <p>
                      <span className="text-[#78716C]">Note:</span> {form.giftNote}
                    </p>
                  )}
                </div>
                <div className="flex justify-between text-base font-semibold pt-2">
                  <span>Order total</span>
                  <span className="font-mono-num text-[#14532D]">{formatCurrency(totals.total)}</span>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-[#EFECE6] flex items-center justify-between gap-4">
              {step > 0 ? (
                <button
                  type="button"
                  onClick={() => setStep((step - 1) as 0 | 1)}
                  className="px-4 py-2 text-sm font-medium text-[#57534E] hover:text-[#1C1917]"
                >
                  Previous step
                </button>
              ) : (
                <span className="text-xs text-[#78716C]">Carbon-neutral parcel</span>
              )}
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#14532D] text-white text-sm font-medium rounded-lg hover:bg-[#166534] transition-colors"
              >
                {step === 0 ? 'Continue to payment' : step === 1 ? 'Review order' : 'Complete purchase'}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
