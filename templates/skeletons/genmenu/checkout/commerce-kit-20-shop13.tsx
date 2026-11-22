import React, { useState } from 'react';
import { Lock, CheckCircle2 } from 'lucide-react';
import {
  detectCardBrand,
  formatCardNumber,
  formatCurrency,
  validateCardFields,
} from '../../utils/commerce';

const VAULT_CARDS = [
  { id: 'v1', brand: 'Visa Corporate', last4: '8820', exp: '09/28', holder: 'A. Mercer' },
  { id: 'v2', brand: 'Mastercard World', last4: '4419', exp: '02/27', holder: 'A. Mercer' },
];

export function Shop13() {
  const [activeCard, setActiveCard] = useState<'v1' | 'v2' | 'custom'>('custom');
  const [custom, setCustom] = useState({
    cardName: 'Alex Mercer',
    cardNumber: '4242 8192 3304 5510',
    expiry: '10/29',
    cvc: '812',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [authorized, setAuthorized] = useState('');

  const previewCard =
    activeCard === 'custom'
      ? {
          holder: custom.cardName || 'CARDHOLDER',
          digits: custom.cardNumber || '•••• •••• •••• ••••',
          exp: custom.expiry || 'MM/YY',
          brand: detectCardBrand(custom.cardNumber),
        }
      : (() => {
          const found = VAULT_CARDS.find((c) => c.id === activeCard)!;
          return {
            holder: found.holder,
            digits: `•••• •••• •••• ${found.last4}`,
            exp: found.exp,
            brand: found.brand,
          };
        })();

  const handleAuthorize = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeCard === 'custom') {
      const errs = validateCardFields(custom);
      if (Object.keys(errs).length > 0) {
        setErrors(errs);
        return;
      }
      setErrors({});
    }
    setAuthorized(`Settled ${formatCurrency(420)} using ${previewCard.brand} (${previewCard.digits.slice(-4)})`);
  };

  return (
    <section className="bg-[#0F172A] text-slate-100 rounded-xl border border-slate-800 overflow-hidden">
      <div className="px-6 md:px-10 py-5 border-b border-slate-800 flex items-center justify-between">
        <span className="font-display font-semibold text-base text-white">Nocturne Vault Pay</span>
        <span className="text-xs text-emerald-400">Protected Checkout</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-5 bg-[#162033] p-6 md:p-10 flex flex-col justify-between space-y-6 border-b lg:border-b-0 lg:border-r border-slate-800">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-wider text-slate-400">Live card preview</p>
            <div className="rounded-xl p-6 bg-gradient-to-br from-slate-800 via-slate-900 to-emerald-950 border border-slate-700 space-y-6">
              <div className="flex items-center justify-between">
                <svg viewBox="0 0 36 26" className="w-9 h-6" fill="none" aria-hidden="true">
                  <rect x="1" y="1" width="34" height="24" rx="4" stroke="#94A3B8" strokeWidth="1.5" />
                  <line x1="12" y1="1" x2="12" y2="25" stroke="#64748B" strokeWidth="1" />
                  <line x1="24" y1="1" x2="24" y2="25" stroke="#64748B" strokeWidth="1" />
                  <line x1="1" y1="13" x2="35" y2="13" stroke="#64748B" strokeWidth="1" />
                </svg>
                <span className="text-xs font-mono-num text-emerald-400">{previewCard.brand}</span>
              </div>
              <p className="font-mono-num text-lg tracking-wider text-white">{previewCard.digits}</p>
              <div className="flex justify-between text-xs text-slate-300">
                <span className="uppercase">{previewCard.holder}</span>
                <span className="font-mono-num">{previewCard.exp}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-2 text-sm">
            <div className="flex justify-between text-slate-400">
              <span>Pro Workspace Annual License</span>
              <span className="font-mono-num text-slate-200">$388.89</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Tax</span>
              <span className="font-mono-num text-slate-200">$31.11</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-800 font-semibold text-white">
              <span>Total due</span>
              <span className="font-mono-num text-emerald-400">$420.00</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 p-6 md:p-10 space-y-6">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setAuthorized('Instant Wallet Pay approved ($420.00)')}
              className="py-2.5 px-4 bg-white text-slate-950 font-semibold text-sm rounded-lg hover:bg-slate-100"
            >
              Apple Pay
            </button>
            <button
              type="button"
              onClick={() => setAuthorized('Passkey Vault Wallet approved ($420.00)')}
              className="py-2.5 px-4 bg-slate-800 text-white font-semibold text-sm rounded-lg border border-slate-700 hover:bg-slate-700"
            >
              Passkey Pay
            </button>
          </div>

          <form onSubmit={handleAuthorize} noValidate className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-400">Vaulted & new cards</p>
              {VAULT_CARDS.map((vc) => (
                <label
                  key={vc.id}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer ${
                    activeCard === vc.id
                      ? 'border-emerald-400 bg-slate-800/80'
                      : 'border-slate-800 bg-slate-900/60'
                  }`}
                >
                  <span className="flex items-center gap-2.5 text-sm">
                    <input
                      type="radio"
                      name="s13-card"
                      checked={activeCard === vc.id}
                      onChange={() => setActiveCard(vc.id as 'v1' | 'v2')}
                      className="accent-emerald-400"
                    />
                    {vc.brand} •••• {vc.last4}
                  </span>
                  <span className="font-mono-num text-xs text-slate-400">{vc.exp}</span>
                </label>
              ))}
              <label
                className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer text-sm ${
                  activeCard === 'custom'
                    ? 'border-emerald-400 bg-slate-800/80'
                    : 'border-slate-800 bg-slate-900/60'
                }`}
              >
                <input
                  type="radio"
                  name="s13-card"
                  checked={activeCard === 'custom'}
                  onChange={() => setActiveCard('custom')}
                  className="accent-emerald-400"
                />
                Use another card
              </label>
            </div>

            {activeCard === 'custom' && (
              <div className="space-y-3 pt-2">
                <div>
                  <label htmlFor="s13-name" className="block text-xs text-slate-400 mb-1">
                    Cardholder name
                  </label>
                  <input
                    id="s13-name"
                    type="text"
                    value={custom.cardName}
                    onChange={(e) => setCustom({ ...custom, cardName: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-400"
                  />
                  {errors.cardName && <p className="text-xs text-rose-400 mt-1">{errors.cardName}</p>}
                </div>
                <div>
                  <label htmlFor="s13-num" className="block text-xs text-slate-400 mb-1">
                    Card number
                  </label>
                  <input
                    id="s13-num"
                    type="text"
                    value={custom.cardNumber}
                    onChange={(e) => setCustom({ ...custom, cardNumber: formatCardNumber(e.target.value) })}
                    className="w-full px-3.5 py-2 text-sm font-mono-num bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-400"
                  />
                  {errors.cardNumber && <p className="text-xs text-rose-400 mt-1">{errors.cardNumber}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="s13-exp" className="block text-xs text-slate-400 mb-1">
                      Expiry
                    </label>
                    <input
                      id="s13-exp"
                      type="text"
                      value={custom.expiry}
                      onChange={(e) => setCustom({ ...custom, expiry: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm font-mono-num bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-400"
                    />
                    {errors.expiry && <p className="text-xs text-rose-400 mt-1">{errors.expiry}</p>}
                  </div>
                  <div>
                    <label htmlFor="s13-cvc" className="block text-xs text-slate-400 mb-1">
                      CVC
                    </label>
                    <input
                      id="s13-cvc"
                      type="text"
                      value={custom.cvc}
                      onChange={(e) => setCustom({ ...custom, cvc: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm font-mono-num bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-400"
                    />
                    {errors.cvc && <p className="text-xs text-rose-400 mt-1">{errors.cvc}</p>}
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-emerald-400 text-slate-950 text-sm font-semibold rounded-lg hover:bg-emerald-300 transition-colors inline-flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              Authorize $420.00
            </button>

            {authorized && (
              <p className="text-xs text-emerald-300 bg-emerald-950/60 border border-emerald-800 rounded-lg p-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                {authorized}
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
