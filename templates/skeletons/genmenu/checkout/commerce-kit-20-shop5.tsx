import React, { useState } from 'react';
import { Gift, Shield } from 'lucide-react';
import {
  calculateCartTotals,
  formatCardNumber,
  formatCurrency,
  validateCardFields,
  validateShippingFields,
  type LineItem,
} from '../../utils/commerce';
import { MonogramArt } from '../MonogramArt';

const COUTURE_ITEMS: LineItem[] = [
  {
    id: 'mv-1',
    name: 'Silk Twill Carré 90',
    variant: 'Ivory & Terracotta · Hand-Rolled Edge',
    price: 390,
    qty: 1,
    monogram: 'MV',
    gradient: ['#7F1D1D', '#B91C1C'],
  },
  {
    id: 'mv-2',
    name: 'Calfskin Card Holder',
    variant: 'Espresso Noir · Blind Deboss',
    price: 260,
    qty: 1,
    monogram: 'CH',
    gradient: ['#292524', '#57534E'],
  },
];

export function Shop5() {
  const [courier, setCourier] = useState<'atelier' | 'whiteglove'>('atelier');
  const [giftWrap, setGiftWrap] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [fields, setFields] = useState({
    fullName: 'Camille Laurent',
    email: 'camille@maisonlaurent.fr',
    address: '712 Madison Avenue, Suite 9A',
    city: 'New York',
    postalCode: '10065',
    cardName: 'Camille Laurent',
    cardNumber: '4916 3302 1844 7721',
    expiry: '08/29',
    cvc: '319',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const totals = calculateCartTotals(
    COUTURE_ITEMS,
    courier === 'whiteglove' ? 35 : 0,
    null,
    0.08875
  );

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = {
      ...validateShippingFields(fields),
      ...validateCardFields(fields),
    };
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setCompleted(true);
  };

  return (
    <section className="bg-[#FBF9F5] text-[#1C1917] rounded-xl border border-[#DFD8CC] overflow-hidden">
      <div className="px-6 md:px-12 py-6 border-b border-[#DFD8CC] flex items-center justify-between">
        <span className="font-editorial text-2xl tracking-tight font-semibold">Maison Valmont</span>
        <span className="text-xs uppercase tracking-widest text-[#78716C]">Single-Page Private Checkout</span>
      </div>

      {completed ? (
        <div className="p-12 text-center max-w-xl mx-auto space-y-4">
          <p className="text-xs uppercase tracking-widest text-[#7F1D1D]">Atelier Confirmation #MV-9104</p>
          <h2 className="font-editorial text-3xl font-medium">Merci, {fields.fullName}.</h2>
          <p className="text-sm text-[#57534E]">
            Your pieces are being prepared in our archival presentation box{' '}
            {giftWrap ? 'with hand-tied grosgrain ribbon.' : 'in standard protective packaging.'}
          </p>
          <button
            type="button"
            onClick={() => setCompleted(false)}
            className="mt-4 px-6 py-3 bg-[#1C1917] text-[#FBF9F5] text-xs uppercase tracking-widest hover:bg-stone-800 transition-colors"
          >
            Return to checkout
          </button>
        </div>
      ) : (
        <form onSubmit={handlePlaceOrder} noValidate className="grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-7 p-6 md:p-12 space-y-8">
            <div>
              <h2 className="font-editorial text-xl font-medium mb-4">I. Client & Delivery</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label htmlFor="s5-name" className="block text-xs uppercase tracking-wider text-[#57534E] mb-1.5">
                    Full Name
                  </label>
                  <input
                    id="s5-name"
                    type="text"
                    value={fields.fullName}
                    onChange={(e) => setFields({ ...fields, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D6CFC2] focus:outline-none focus:border-[#1C1917]"
                  />
                  {errors.fullName && <p className="text-xs text-[#991B1B] mt-1">{errors.fullName}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="s5-email" className="block text-xs uppercase tracking-wider text-[#57534E] mb-1.5">
                    Email
                  </label>
                  <input
                    id="s5-email"
                    type="email"
                    value={fields.email}
                    onChange={(e) => setFields({ ...fields, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D6CFC2] focus:outline-none focus:border-[#1C1917]"
                  />
                  {errors.email && <p className="text-xs text-[#991B1B] mt-1">{errors.email}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="s5-addr" className="block text-xs uppercase tracking-wider text-[#57534E] mb-1.5">
                    Street Address
                  </label>
                  <input
                    id="s5-addr"
                    type="text"
                    value={fields.address}
                    onChange={(e) => setFields({ ...fields, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D6CFC2] focus:outline-none focus:border-[#1C1917]"
                  />
                  {errors.address && <p className="text-xs text-[#991B1B] mt-1">{errors.address}</p>}
                </div>
                <div>
                  <label htmlFor="s5-city" className="block text-xs uppercase tracking-wider text-[#57534E] mb-1.5">
                    City
                  </label>
                  <input
                    id="s5-city"
                    type="text"
                    value={fields.city}
                    onChange={(e) => setFields({ ...fields, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D6CFC2] focus:outline-none focus:border-[#1C1917]"
                  />
                  {errors.city && <p className="text-xs text-[#991B1B] mt-1">{errors.city}</p>}
                </div>
                <div>
                  <label htmlFor="s5-zip" className="block text-xs uppercase tracking-wider text-[#57534E] mb-1.5">
                    Postal Code
                  </label>
                  <input
                    id="s5-zip"
                    type="text"
                    value={fields.postalCode}
                    onChange={(e) => setFields({ ...fields, postalCode: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm font-mono-num bg-white border border-[#D6CFC2] focus:outline-none focus:border-[#1C1917]"
                  />
                  {errors.postalCode && <p className="text-xs text-[#991B1B] mt-1">{errors.postalCode}</p>}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[#DFD8CC]">
              <h2 className="font-editorial text-xl font-medium mb-4">II. Courier & Presentation</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <label
                  className={`p-4 border cursor-pointer flex justify-between items-start ${
                    courier === 'atelier' ? 'border-[#1C1917] bg-white' : 'border-[#DFD8CC]'
                  }`}
                >
                  <span className="flex items-start gap-2.5">
                    <input
                      type="radio"
                      name="s5-courier"
                      checked={courier === 'atelier'}
                      onChange={() => setCourier('atelier')}
                      className="mt-1 accent-[#1C1917]"
                    />
                    <span>
                      <span className="block text-sm font-medium">Atelier Courier</span>
                      <span className="block text-xs text-[#78716C]">Insured 3–5 days</span>
                    </span>
                  </span>
                  <span className="text-sm font-mono-num">Complimentary</span>
                </label>
                <label
                  className={`p-4 border cursor-pointer flex justify-between items-start ${
                    courier === 'whiteglove' ? 'border-[#1C1917] bg-white' : 'border-[#DFD8CC]'
                  }`}
                >
                  <span className="flex items-start gap-2.5">
                    <input
                      type="radio"
                      name="s5-courier"
                      checked={courier === 'whiteglove'}
                      onChange={() => setCourier('whiteglove')}
                      className="mt-1 accent-[#1C1917]"
                    />
                    <span>
                      <span className="block text-sm font-medium">Same-Day White Glove</span>
                      <span className="block text-xs text-[#78716C]">Manhattan & Tri-State</span>
                    </span>
                  </span>
                  <span className="text-sm font-mono-num">$35.00</span>
                </label>
              </div>
              <label className="flex items-center gap-3 text-sm text-[#44403C] cursor-pointer">
                <input
                  type="checkbox"
                  checked={giftWrap}
                  onChange={(e) => setGiftWrap(e.target.checked)}
                  className="accent-[#1C1917] w-4 h-4"
                />
                <Gift className="w-4 h-4 text-[#7F1D1D]" />
                Include complimentary archival ribbon box & wax-sealed card
              </label>
            </div>

            <div className="pt-6 border-t border-[#DFD8CC]">
              <h2 className="font-editorial text-xl font-medium mb-4">III. Settlement</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label htmlFor="s5-cname" className="block text-xs uppercase tracking-wider text-[#57534E] mb-1.5">
                    Cardholder Name
                  </label>
                  <input
                    id="s5-cname"
                    type="text"
                    value={fields.cardName}
                    onChange={(e) => setFields({ ...fields, cardName: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D6CFC2] focus:outline-none focus:border-[#1C1917]"
                  />
                  {errors.cardName && <p className="text-xs text-[#991B1B] mt-1">{errors.cardName}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="s5-cnum" className="block text-xs uppercase tracking-wider text-[#57534E] mb-1.5">
                    Card Number
                  </label>
                  <input
                    id="s5-cnum"
                    type="text"
                    value={fields.cardNumber}
                    onChange={(e) => setFields({ ...fields, cardNumber: formatCardNumber(e.target.value) })}
                    className="w-full px-3.5 py-2.5 text-sm font-mono-num bg-white border border-[#D6CFC2] focus:outline-none focus:border-[#1C1917]"
                  />
                  {errors.cardNumber && <p className="text-xs text-[#991B1B] mt-1">{errors.cardNumber}</p>}
                </div>
                <div>
                  <label htmlFor="s5-exp" className="block text-xs uppercase tracking-wider text-[#57534E] mb-1.5">
                    Expiry
                  </label>
                  <input
                    id="s5-exp"
                    type="text"
                    value={fields.expiry}
                    onChange={(e) => setFields({ ...fields, expiry: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm font-mono-num bg-white border border-[#D6CFC2] focus:outline-none focus:border-[#1C1917]"
                  />
                  {errors.expiry && <p className="text-xs text-[#991B1B] mt-1">{errors.expiry}</p>}
                </div>
                <div>
                  <label htmlFor="s5-cvc" className="block text-xs uppercase tracking-wider text-[#57534E] mb-1.5">
                    Security Code
                  </label>
                  <input
                    id="s5-cvc"
                    type="text"
                    value={fields.cvc}
                    onChange={(e) => setFields({ ...fields, cvc: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm font-mono-num bg-white border border-[#D6CFC2] focus:outline-none focus:border-[#1C1917]"
                  />
                  {errors.cvc && <p className="text-xs text-[#991B1B] mt-1">{errors.cvc}</p>}
                </div>
              </div>
            </div>
          </div>

          <aside className="lg:col-span-5 bg-[#F4EFE6] border-t lg:border-t-0 lg:border-l border-[#DFD8CC] p-6 md:p-12 flex flex-col justify-between">
            <div>
              <h3 className="font-editorial text-lg font-medium mb-6">Your Atelier Bag</h3>
              <ul className="space-y-5">
                {COUTURE_ITEMS.map((item) => (
                  <li key={item.id} className="flex items-center gap-4">
                    <MonogramArt
                      monogram={item.monogram}
                      gradient={item.gradient}
                      shape="ring"
                      editorial
                      className="w-16 h-16 text-base"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-editorial text-base font-medium text-[#1C1917]">{item.name}</p>
                      <p className="text-xs text-[#78716C] mt-0.5">{item.variant}</p>
                    </div>
                    <span className="font-mono-num text-sm">{formatCurrency(item.price)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-10 pt-6 border-t border-[#DFD8CC] space-y-4">
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between text-[#57534E]">
                  <dt>Subtotal</dt>
                  <dd className="font-mono-num">{formatCurrency(totals.subtotal)}</dd>
                </div>
                <div className="flex justify-between text-[#57534E]">
                  <dt>Delivery</dt>
                  <dd className="font-mono-num">
                    {totals.shipping === 0 ? 'Complimentary' : formatCurrency(totals.shipping)}
                  </dd>
                </div>
                <div className="flex justify-between text-[#57534E]">
                  <dt>Duties & Tax</dt>
                  <dd className="font-mono-num">{formatCurrency(totals.tax)}</dd>
                </div>
                <div className="flex justify-between pt-3 border-t border-[#DFD8CC] text-base font-semibold text-[#1C1917]">
                  <dt className="font-editorial text-lg">Total</dt>
                  <dd className="font-mono-num">{formatCurrency(totals.total)}</dd>
                </div>
              </dl>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#1C1917] text-[#FBF9F5] text-xs uppercase tracking-widest font-medium hover:bg-stone-800 transition-colors"
              >
                Complete Purchase · {formatCurrency(totals.total)}
              </button>
              <p className="flex items-center justify-center gap-1.5 text-xs text-[#78716C]">
                <Shield className="w-3.5 h-3.5" />
                Authenticity guarantee & 30-day private returns
              </p>
            </div>
          </aside>
        </form>
      )}
    </section>
  );
}
