import React, { useState } from 'react';
import { Check, ShieldCheck } from 'lucide-react';
import {
  detectCardBrand,
  formatCardNumber,
  formatCurrency,
  validateCardFields,
} from '../../utils/commerce';

const WALLET_OPTIONS = [
  { id: 'apple', label: 'Apple Pay', bg: 'bg-zinc-950 text-white' },
  { id: 'link', label: 'Link One-Click', bg: 'bg-teal-600 text-white' },
  { id: 'gpay', label: 'Google Pay', bg: 'bg-blue-700 text-white' },
];

const CARDS = [
  { id: 'c1', label: 'Visa Signature', last4: '3301', exp: '05/29', accent: 'border-indigo-700 bg-indigo-50' },
  { id: 'c2', label: 'Amex Cobalt', last4: '1004', exp: '10/28', accent: 'border-orange-600 bg-orange-50' },
];

export function Shop12() {
  const [mode, setMode] = useState<'c1' | 'c2' | 'new'>('c1');
  const [card, setCard] = useState({
    cardName: 'Elena Vance',
    cardNumber: '4532 8910 2201 7742',
    expiry: '07/29',
    cvc: '519',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState('');

  const brand = detectCardBrand(card.cardNumber);
  const total = 148;

  const submitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'new') {
      const errs = validateCardFields(card);
      if (Object.keys(errs).length > 0) {
        setErrors(errs);
        return;
      }
      setErrors({});
      setStatus(`Authorized ${formatCurrency(total)} on ${brand} •••• ${card.cardNumber.slice(-4)}`);
    } else {
      const chosen = CARDS.find((c) => c.id === mode)!;
      setStatus(`Authorized ${formatCurrency(total)} on ${chosen.label} •••• ${chosen.last4}`);
    }
  };

  return (
    <section className="bg-white text-zinc-950 rounded-2xl border-2 border-indigo-950 py-10 px-4 sm:px-8">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-orange-600">Chromatic Studio</p>
            <h2 className="font-display text-2xl font-bold text-indigo-950">Complete Payment</h2>
          </div>
          <span className="font-mono-num text-xl font-bold text-indigo-900">{formatCurrency(total)}</span>
        </div>

        <div>
          <p className="text-xs font-bold text-zinc-600 mb-2">Instant Wallets</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {WALLET_OPTIONS.map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={() => setStatus(`Express payment approved via ${w.label} (${formatCurrency(total)})`)}
                className={`py-2.5 px-4 rounded-xl text-sm font-bold transition-transform active:scale-95 ${w.bg}`}
              >
                {w.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={submitForm} noValidate className="space-y-5 pt-4 border-t border-zinc-200">
          <fieldset className="space-y-3">
            <legend className="text-sm font-bold text-indigo-950">Select saved card or enter new</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CARDS.map((c) => (
                <label
                  key={c.id}
                  className={`p-4 rounded-xl border-2 cursor-pointer flex items-start justify-between transition-colors ${
                    mode === c.id ? c.accent : 'border-zinc-200 bg-white hover:border-zinc-400'
                  }`}
                >
                  <span className="flex items-start gap-2.5">
                    <input
                      type="radio"
                      name="s12-card"
                      checked={mode === c.id}
                      onChange={() => setMode(c.id as 'c1' | 'c2')}
                      className="mt-1 accent-indigo-900"
                    />
                    <span>
                      <span className="block text-sm font-bold">{c.label}</span>
                      <span className="block text-xs font-mono-num text-zinc-600">
                        •••• {c.last4} · {c.exp}
                      </span>
                    </span>
                  </span>
                  {mode === c.id && <Check className="w-4 h-4 text-indigo-900" />}
                </label>
              ))}
            </div>

            <label
              className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer ${
                mode === 'new' ? 'border-orange-600 bg-orange-50' : 'border-zinc-200'
              }`}
            >
              <input
                type="radio"
                name="s12-card"
                checked={mode === 'new'}
                onChange={() => setMode('new')}
                className="accent-orange-600"
              />
              <span className="text-sm font-bold">Enter a new payment card</span>
            </label>
          </fieldset>

          {mode === 'new' && (
            <div className="p-4 rounded-xl border-2 border-zinc-200 bg-zinc-50 space-y-3.5">
              <div>
                <label htmlFor="s12-cname" className="block text-xs font-bold text-zinc-700 mb-1">
                  Cardholder name
                </label>
                <input
                  id="s12-cname"
                  type="text"
                  value={card.cardName}
                  onChange={(e) => setCard({ ...card, cardName: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border-2 border-zinc-300 rounded-lg"
                />
                {errors.cardName && <p className="text-xs text-red-600 mt-1">{errors.cardName}</p>}
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <label htmlFor="s12-cnum" className="text-xs font-bold text-zinc-700">
                    Card number
                  </label>
                  <span className="text-xs font-mono-num font-bold text-indigo-700">{brand}</span>
                </div>
                <input
                  id="s12-cnum"
                  type="text"
                  value={card.cardNumber}
                  onChange={(e) => setCard({ ...card, cardNumber: formatCardNumber(e.target.value) })}
                  className="w-full px-3 py-2 text-sm font-mono-num bg-white border-2 border-zinc-300 rounded-lg"
                />
                {errors.cardNumber && <p className="text-xs text-red-600 mt-1">{errors.cardNumber}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="s12-exp" className="block text-xs font-bold text-zinc-700 mb-1">
                    Expiry
                  </label>
                  <input
                    id="s12-exp"
                    type="text"
                    value={card.expiry}
                    onChange={(e) => setCard({ ...card, expiry: e.target.value })}
                    className="w-full px-3 py-2 text-sm font-mono-num bg-white border-2 border-zinc-300 rounded-lg"
                  />
                  {errors.expiry && <p className="text-xs text-red-600 mt-1">{errors.expiry}</p>}
                </div>
                <div>
                  <label htmlFor="s12-cvc" className="block text-xs font-bold text-zinc-700 mb-1">
                    CVC
                  </label>
                  <input
                    id="s12-cvc"
                    type="text"
                    value={card.cvc}
                    onChange={(e) => setCard({ ...card, cvc: e.target.value })}
                    className="w-full px-3 py-2 text-sm font-mono-num bg-white border-2 border-zinc-300 rounded-lg"
                  />
                  {errors.cvc && <p className="text-xs text-red-600 mt-1">{errors.cvc}</p>}
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 bg-orange-600 text-white font-bold text-sm rounded-xl hover:bg-orange-700 transition-colors"
          >
            Authorize {formatCurrency(total)}
          </button>

          {status && (
            <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-300 text-teal-900 text-xs font-semibold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              {status}
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
