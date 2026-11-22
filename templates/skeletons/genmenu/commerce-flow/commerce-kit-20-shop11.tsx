import React, { useState } from 'react';
import { CreditCard, Lock, CheckCircle2 } from 'lucide-react';
import {
  detectCardBrand,
  formatCardNumber,
  formatCurrency,
  validateCardFields,
} from '../../utils/commerce';
import { MonogramArt } from '../MonogramArt';

const SAVED_CARDS = [
  { id: 'card-1', brand: 'Visa', last4: '4812', exp: '08/28', holder: 'Hannah Kim' },
  { id: 'card-2', brand: 'Mastercard', last4: '9014', exp: '11/27', holder: 'Hannah Kim' },
];

export function Shop11() {
  const [selectedSource, setSelectedSource] = useState<'card-1' | 'card-2' | 'new'>('card-1');
  const [walletNotice, setWalletNotice] = useState('');
  const [paidMethod, setPaidMethod] = useState('');
  const [newCard, setNewCard] = useState({
    cardName: 'Hannah Kim',
    cardNumber: '',
    expiry: '',
    cvc: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const orderTotal = 264.6;

  const handleWallet = (wallet: string) => {
    setWalletNotice(`${wallet} biometric authorization sheet triggered for ${formatCurrency(orderTotal)}.`);
    setPaidMethod(`${wallet} Express`);
  };

  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSource === 'new') {
      const errs = validateCardFields(newCard);
      if (Object.keys(errs).length > 0) {
        setErrors(errs);
        return;
      }
      setErrors({});
      setPaidMethod(`${detectCardBrand(newCard.cardNumber)} ending in ${newCard.cardNumber.slice(-4)}`);
    } else {
      const found = SAVED_CARDS.find((c) => c.id === selectedSource)!;
      setPaidMethod(`${found.brand} ending in ${found.last4}`);
    }
  };

  return (
    <section className="bg-white text-slate-900 rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="px-6 md:px-10 py-5 border-b border-slate-200 flex items-center justify-between">
        <span className="font-display font-semibold text-base">Strata Optics</span>
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
          <Lock className="w-3.5 h-3.5" />
          256-bit Payment Vault
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-7 p-6 md:p-10 space-y-7">
          {paidMethod ? (
            <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 font-medium text-sm">
                <CheckCircle2 className="w-5 h-5" />
                Payment authorized via {paidMethod}
              </div>
              <p className="text-sm text-emerald-900 font-mono-num">
                Amount settled: {formatCurrency(orderTotal)} · Reference #SO-7721
              </p>
              <button
                type="button"
                onClick={() => {
                  setPaidMethod('');
                  setWalletNotice('');
                }}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-medium rounded-lg"
              >
                Choose another payment method
              </button>
            </div>
          ) : (
            <>
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                  Express wallets
                </h2>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => handleWallet('Apple Pay')}
                    className="py-2.5 px-3 bg-slate-950 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
                      <path d="M16.4 12.6c0-2.1 1.7-3.1 1.8-3.2-1-1.4-2.5-1.6-3-1.7-1.3-.1-2.5.8-3.2.8-.7 0-1.7-.8-2.8-.7-1.4 0-2.7.8-3.4 2.1-1.5 2.6-.4 6.4 1 8.4.7 1 1.5 2.1 2.6 2.1 1 0 1.4-.7 2.7-.7s1.6.7 2.7.7c1.1 0 1.9-1 2.6-2 .8-1.2 1.1-2.3 1.2-2.4-.1 0-2.2-.9-2.2-3.5z" />
                    </svg>
                    Pay
                  </button>
                  <button
                    type="button"
                    onClick={() => handleWallet('Shop Pay')}
                    className="py-2.5 px-3 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Shop Pay
                  </button>
                  <button
                    type="button"
                    onClick={() => handleWallet('Google Pay')}
                    className="py-2.5 px-3 bg-white border border-slate-300 text-slate-900 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    G Pay
                  </button>
                </div>
                {walletNotice && <p className="text-xs text-slate-600 mt-2">{walletNotice}</p>}
              </div>

              <div className="relative flex items-center py-1">
                <div className="flex-grow border-t border-slate-200" />
                <span className="px-3 text-xs text-slate-400">or pay by card</span>
                <div className="flex-grow border-t border-slate-200" />
              </div>

              <form onSubmit={handlePaySubmit} noValidate className="space-y-4">
                <fieldset className="space-y-2.5">
                  <legend className="text-sm font-semibold text-slate-900 mb-2">Saved cards</legend>
                  {SAVED_CARDS.map((card) => (
                    <label
                      key={card.id}
                      className={`flex items-center justify-between p-3.5 rounded-lg border cursor-pointer ${
                        selectedSource === card.id
                          ? 'border-slate-900 bg-slate-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="s11-source"
                          checked={selectedSource === card.id}
                          onChange={() => setSelectedSource(card.id as 'card-1' | 'card-2')}
                          className="accent-slate-900"
                        />
                        <CreditCard className="w-4 h-4 text-slate-600" />
                        <span className="text-sm font-medium text-slate-900">
                          {card.brand} •••• {card.last4}
                        </span>
                      </span>
                      <span className="text-xs font-mono-num text-slate-500">Exp {card.exp}</span>
                    </label>
                  ))}

                  <label
                    className={`flex items-center gap-3 p-3.5 rounded-lg border cursor-pointer ${
                      selectedSource === 'new'
                        ? 'border-slate-900 bg-slate-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="s11-source"
                      checked={selectedSource === 'new'}
                      onChange={() => setSelectedSource('new')}
                      className="accent-slate-900"
                    />
                    <span className="text-sm font-medium text-slate-900">Add a new credit or debit card</span>
                  </label>
                </fieldset>

                {selectedSource === 'new' && (
                  <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/70 space-y-3.5">
                    <div>
                      <label htmlFor="s11-cname" className="block text-xs font-medium text-slate-700 mb-1">
                        Name on card
                      </label>
                      <input
                        id="s11-cname"
                        type="text"
                        value={newCard.cardName}
                        onChange={(e) => setNewCard({ ...newCard, cardName: e.target.value })}
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg"
                      />
                      {errors.cardName && <p className="text-xs text-red-600 mt-1">{errors.cardName}</p>}
                    </div>
                    <div>
                      <label htmlFor="s11-cnum" className="block text-xs font-medium text-slate-700 mb-1">
                        Card number
                      </label>
                      <input
                        id="s11-cnum"
                        type="text"
                        placeholder="4242 4242 4242 4242"
                        value={newCard.cardNumber}
                        onChange={(e) =>
                          setNewCard({ ...newCard, cardNumber: formatCardNumber(e.target.value) })
                        }
                        className="w-full px-3 py-2 text-sm font-mono-num bg-white border border-slate-300 rounded-lg"
                      />
                      {errors.cardNumber && <p className="text-xs text-red-600 mt-1">{errors.cardNumber}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="s11-exp" className="block text-xs font-medium text-slate-700 mb-1">
                          Expiry (MM/YY)
                        </label>
                        <input
                          id="s11-exp"
                          type="text"
                          placeholder="08/28"
                          value={newCard.expiry}
                          onChange={(e) => setNewCard({ ...newCard, expiry: e.target.value })}
                          className="w-full px-3 py-2 text-sm font-mono-num bg-white border border-slate-300 rounded-lg"
                        />
                        {errors.expiry && <p className="text-xs text-red-600 mt-1">{errors.expiry}</p>}
                      </div>
                      <div>
                        <label htmlFor="s11-cvc" className="block text-xs font-medium text-slate-700 mb-1">
                          CVC
                        </label>
                        <input
                          id="s11-cvc"
                          type="text"
                          placeholder="842"
                          value={newCard.cvc}
                          onChange={(e) => setNewCard({ ...newCard, cvc: e.target.value })}
                          className="w-full px-3 py-2 text-sm font-mono-num bg-white border border-slate-300 rounded-lg"
                        />
                        {errors.cvc && <p className="text-xs text-red-600 mt-1">{errors.cvc}</p>}
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Pay {formatCurrency(orderTotal)}
                </button>
              </form>
            </>
          )}
        </div>

        <aside className="lg:col-span-5 bg-slate-50 border-t lg:border-t-0 lg:border-l border-slate-200 p-6 md:p-10 space-y-6">
          <h3 className="text-sm font-semibold text-slate-900">Order breakdown</h3>
          <div className="flex items-center gap-4">
            <MonogramArt
              monogram="SO"
              gradient={['#0F172A', '#334155']}
              shape="circle"
              className="w-14 h-14 rounded-lg text-sm"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900">Strata Frame 02 — Titanium</p>
              <p className="text-xs text-slate-500">Prescription Blue-Filter · Qty 1</p>
            </div>
            <span className="font-mono-num text-sm font-medium">$245.00</span>
          </div>
          <dl className="pt-5 border-t border-slate-200 space-y-2 text-sm">
            <div className="flex justify-between text-slate-600">
              <dt>Subtotal</dt>
              <dd className="font-mono-num">$245.00</dd>
            </div>
            <div className="flex justify-between text-slate-600">
              <dt>Insured Courier</dt>
              <dd className="font-mono-num">Free</dd>
            </div>
            <div className="flex justify-between text-slate-600">
              <dt>Tax (8%)</dt>
              <dd className="font-mono-num">$19.60</dd>
            </div>
            <div className="flex justify-between pt-3 border-t border-slate-200 text-base font-semibold text-slate-900">
              <dt>Total due</dt>
              <dd className="font-mono-num">{formatCurrency(orderTotal)}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </section>
  );
}
