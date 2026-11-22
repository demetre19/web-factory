import React, { useState } from 'react';
import { Check, Cpu } from 'lucide-react';
import {
  calculateCartTotals,
  formatCardNumber,
  formatCurrency,
  validateCardFields,
  validateShippingFields,
  type LineItem,
} from '../../utils/commerce';
import { MonogramArt } from '../MonogramArt';

const HARDWARE_ITEMS: LineItem[] = [
  {
    id: 'ka-1',
    name: 'Reference DAC-02 Preamp',
    variant: 'Anodized Slate · Balanced XLR',
    price: 540,
    qty: 1,
    monogram: 'D2',
    gradient: ['#18181B', '#3F3F46'],
  },
  {
    id: 'ka-2',
    name: 'Coiled Braided Interconnect',
    variant: '1.5m · Gold-Plated',
    price: 75,
    qty: 1,
    monogram: 'CI',
    gradient: ['#27272A', '#52525B'],
  },
];

export function Shop3() {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [done, setDone] = useState(false);
  const [insureParcel, setInsureParcel] = useState(true);
  const [shipping, setShipping] = useState({
    fullName: 'Marcus Chen',
    email: 'm.chen@acoustics.io',
    address: '910 Harrison St, Suite 300',
    city: 'San Francisco',
    postalCode: '94107',
  });
  const [card, setCard] = useState({
    cardName: 'Marcus Chen',
    cardNumber: '3782 8224 6310 005',
    expiry: '06/29',
    cvc: '9041',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const totals = calculateCartTotals(HARDWARE_ITEMS, insureParcel ? 14 : 0, null, 0.085);

  const onSubmit = (e: React.FormEvent) => {
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
      const err = validateCardFields(card);
      if (Object.keys(err).length) {
        setErrors(err);
        return;
      }
      setErrors({});
      setStep(2);
    } else {
      setDone(true);
    }
  };

  return (
    <section className="bg-[#0B0D10] text-zinc-100 rounded-xl border border-zinc-800 overflow-hidden">
      <div className="px-6 md:px-10 py-5 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-4">
        <span className="inline-flex items-center gap-2 font-display text-base font-semibold tracking-tight text-white">
          <Cpu className="w-4 h-4 text-amber-400" />
          Kinetic Audio Lab
        </span>
        <nav aria-label="Studio checkout steps">
          <ol className="flex items-center gap-3 sm:gap-5 text-xs sm:text-sm">
            {['Dispatch', 'Settlement', 'Verify'].map((name, idx) => {
              const active = idx === step && !done;
              const complete = idx < step || done;
              return (
                <li key={name} className="flex items-center gap-2">
                  <span
                    className={`w-6 h-6 rounded flex items-center justify-center font-mono-num text-xs font-semibold ${
                      complete
                        ? 'bg-amber-400 text-zinc-950'
                        : active
                          ? 'border border-amber-400 text-amber-400'
                          : 'border border-zinc-700 text-zinc-500'
                    }`}
                  >
                    {complete ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                  </span>
                  <span className={active || complete ? 'text-zinc-100 font-medium' : 'text-zinc-500'}>
                    {name}
                  </span>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-7 p-6 md:p-10">
          {done ? (
            <div className="bg-[#14171D] border border-zinc-800 rounded-xl p-8 space-y-4">
              <p className="text-xs font-mono-num text-amber-400">DISPATCH QUEUED · #KA-77104</p>
              <h2 className="font-display text-2xl font-semibold text-white">
                Unit reservation confirmed for {shipping.fullName}
              </h2>
              <p className="text-sm text-zinc-400">
                Serial calibration certificate and tracking manifest sent to {shipping.email}.
              </p>
              <button
                type="button"
                onClick={() => {
                  setDone(false);
                  setStep(0);
                }}
                className="px-5 py-2.5 bg-amber-400 text-zinc-950 text-sm font-semibold rounded-lg hover:bg-amber-300 transition-colors"
              >
                New hardware order
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="space-y-6">
              {step === 0 && (
                <div className="space-y-4">
                  <h2 className="font-display text-xl font-semibold text-white">01. Dispatch coordinates</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label htmlFor="s3-name" className="block text-xs font-medium text-zinc-400 mb-1.5">
                        Recipient full name
                      </label>
                      <input
                        id="s3-name"
                        type="text"
                        value={shipping.fullName}
                        onChange={(e) => setShipping({ ...shipping, fullName: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-sm bg-[#14171D] border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                      />
                      {errors.fullName && <p className="text-xs text-rose-400 mt-1">{errors.fullName}</p>}
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="s3-email" className="block text-xs font-medium text-zinc-400 mb-1.5">
                        Technical contact email
                      </label>
                      <input
                        id="s3-email"
                        type="email"
                        value={shipping.email}
                        onChange={(e) => setShipping({ ...shipping, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-sm bg-[#14171D] border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                      />
                      {errors.email && <p className="text-xs text-rose-400 mt-1">{errors.email}</p>}
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="s3-addr" className="block text-xs font-medium text-zinc-400 mb-1.5">
                        Street address
                      </label>
                      <input
                        id="s3-addr"
                        type="text"
                        value={shipping.address}
                        onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-sm bg-[#14171D] border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                      />
                      {errors.address && <p className="text-xs text-rose-400 mt-1">{errors.address}</p>}
                    </div>
                    <div>
                      <label htmlFor="s3-city" className="block text-xs font-medium text-zinc-400 mb-1.5">
                        City
                      </label>
                      <input
                        id="s3-city"
                        type="text"
                        value={shipping.city}
                        onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-sm bg-[#14171D] border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                      />
                      {errors.city && <p className="text-xs text-rose-400 mt-1">{errors.city}</p>}
                    </div>
                    <div>
                      <label htmlFor="s3-zip" className="block text-xs font-medium text-zinc-400 mb-1.5">
                        Postal code
                      </label>
                      <input
                        id="s3-zip"
                        type="text"
                        value={shipping.postalCode}
                        onChange={(e) => setShipping({ ...shipping, postalCode: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-sm font-mono-num bg-[#14171D] border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                      />
                      {errors.postalCode && <p className="text-xs text-rose-400 mt-1">{errors.postalCode}</p>}
                    </div>
                  </div>
                  <label className="flex items-center justify-between p-4 rounded-lg bg-[#14171D] border border-zinc-800 cursor-pointer">
                    <span className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={insureParcel}
                        onChange={(e) => setInsureParcel(e.target.checked)}
                        className="accent-amber-400 w-4 h-4"
                      />
                      <span>
                        <span className="block text-sm font-medium text-white">Signature + Shock-sensor Transit Coverage</span>
                        <span className="block text-xs text-zinc-400">Priority air freight with replacement guarantee</span>
                      </span>
                    </span>
                    <span className="font-mono-num text-sm text-amber-400">+$14.00</span>
                  </label>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <h2 className="font-display text-xl font-semibold text-white">02. Card authorization</h2>
                  <div>
                    <label htmlFor="s3-cname" className="block text-xs font-medium text-zinc-400 mb-1.5">
                      Name on card
                    </label>
                    <input
                      id="s3-cname"
                      type="text"
                      value={card.cardName}
                      onChange={(e) => setCard({ ...card, cardName: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm bg-[#14171D] border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                    />
                    {errors.cardName && <p className="text-xs text-rose-400 mt-1">{errors.cardName}</p>}
                  </div>
                  <div>
                    <label htmlFor="s3-cnum" className="block text-xs font-medium text-zinc-400 mb-1.5">
                      Card number
                    </label>
                    <input
                      id="s3-cnum"
                      type="text"
                      value={card.cardNumber}
                      onChange={(e) => setCard({ ...card, cardNumber: formatCardNumber(e.target.value) })}
                      className="w-full px-3.5 py-2.5 text-sm font-mono-num bg-[#14171D] border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                    />
                    {errors.cardNumber && <p className="text-xs text-rose-400 mt-1">{errors.cardNumber}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="s3-exp" className="block text-xs font-medium text-zinc-400 mb-1.5">
                        Expiry
                      </label>
                      <input
                        id="s3-exp"
                        type="text"
                        value={card.expiry}
                        onChange={(e) => setCard({ ...card, expiry: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-sm font-mono-num bg-[#14171D] border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                      />
                      {errors.expiry && <p className="text-xs text-rose-400 mt-1">{errors.expiry}</p>}
                    </div>
                    <div>
                      <label htmlFor="s3-cvc" className="block text-xs font-medium text-zinc-400 mb-1.5">
                        Security code
                      </label>
                      <input
                        id="s3-cvc"
                        type="text"
                        value={card.cvc}
                        onChange={(e) => setCard({ ...card, cvc: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-sm font-mono-num bg-[#14171D] border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                      />
                      {errors.cvc && <p className="text-xs text-rose-400 mt-1">{errors.cvc}</p>}
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <h2 className="font-display text-xl font-semibold text-white">03. Verify build manifest</h2>
                  <div className="bg-[#14171D] border border-zinc-800 rounded-lg divide-y divide-zinc-800">
                    <div className="p-4 flex justify-between items-center">
                      <div>
                        <p className="text-xs text-zinc-400">Ship destination</p>
                        <p className="text-sm text-white mt-0.5">
                          {shipping.fullName} · {shipping.address}, {shipping.city}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setStep(0)}
                        className="text-xs text-amber-400 hover:underline"
                      >
                        Change
                      </button>
                    </div>
                    <div className="p-4 flex justify-between items-center">
                      <div>
                        <p className="text-xs text-zinc-400">Authorization</p>
                        <p className="text-sm font-mono-num text-white mt-0.5">
                          •••• {card.cardNumber.slice(-4)} · Exp {card.expiry}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="text-xs text-amber-400 hover:underline"
                      >
                        Change
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
                {step > 0 ? (
                  <button
                    type="button"
                    onClick={() => setStep((step - 1) as 0 | 1)}
                    className="px-4 py-2 text-sm text-zinc-400 hover:text-white"
                  >
                    Back
                  </button>
                ) : (
                  <span className="text-xs text-zinc-500">5-year studio hardware warranty</span>
                )}
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-400 text-zinc-950 text-sm font-semibold rounded-lg hover:bg-amber-300 transition-colors"
                >
                  {step === 0 ? 'Continue to payment' : step === 1 ? 'Review manifest' : `Authorize ${formatCurrency(totals.total)}`}
                </button>
              </div>
            </form>
          )}
        </div>

        <aside className="lg:col-span-5 bg-[#14171D] border-t lg:border-t-0 lg:border-l border-zinc-800 p-6 md:p-10 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-zinc-200 mb-5">Hardware allocation</h3>
            <ul className="space-y-4">
              {HARDWARE_ITEMS.map((item) => (
                <li key={item.id} className="flex items-center gap-4">
                  <MonogramArt
                    monogram={item.monogram}
                    gradient={item.gradient}
                    shape="grid"
                    className="w-14 h-14 rounded-lg border border-zinc-700 text-sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white truncate">{item.name}</p>
                    <p className="text-xs text-zinc-400 truncate">{item.variant}</p>
                  </div>
                  <span className="font-mono-num text-sm text-zinc-100">{formatCurrency(item.price)}</span>
                </li>
              ))}
            </ul>
          </div>

          <dl className="mt-8 pt-6 border-t border-zinc-800 space-y-2.5 text-sm">
            <div className="flex justify-between text-zinc-400">
              <dt>Equipment subtotal</dt>
              <dd className="font-mono-num text-zinc-200">{formatCurrency(totals.subtotal)}</dd>
            </div>
            <div className="flex justify-between text-zinc-400">
              <dt>Transit coverage</dt>
              <dd className="font-mono-num text-zinc-200">
                {totals.shipping === 0 ? 'Standard $0.00' : formatCurrency(totals.shipping)}
              </dd>
            </div>
            <div className="flex justify-between text-zinc-400">
              <dt>Tax (8.5%)</dt>
              <dd className="font-mono-num text-zinc-200">{formatCurrency(totals.tax)}</dd>
            </div>
            <div className="flex justify-between pt-3 border-t border-zinc-800 text-base font-semibold text-white">
              <dt>Total due</dt>
              <dd className="font-mono-num text-amber-400">{formatCurrency(totals.total)}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </section>
  );
}
