import React, { useState } from 'react';
import { Check, Package, ExternalLink } from 'lucide-react';
import { formatCurrency } from '../../utils/commerce';
import { MonogramArt } from '../MonogramArt';

const ORDER_ITEMS = [
  {
    id: 'nd-1',
    name: 'Modular Walnut Monitor Stand',
    variant: '110cm · Matte Oil Finish',
    price: 195,
    qty: 1,
    monogram: 'MW',
    gradient: ['#334155', '#1E293B'] as [string, string],
  },
  {
    id: 'nd-2',
    name: 'Wool Felt Desk Mat',
    variant: 'Charcoal · 90×40cm',
    price: 55,
    qty: 1,
    monogram: 'WF',
    gradient: ['#475569', '#334155'] as [string, string],
  },
];

export function Shop15() {
  const [carrierDetails, setCarrierDetails] = useState(false);

  return (
    <section className="bg-white text-slate-900 rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="px-6 md:px-10 py-5 border-b border-slate-200 flex items-center justify-between">
        <span className="font-display font-semibold text-base">Nordic Dispatch</span>
        <span className="font-mono-num text-xs text-slate-500">ORDER #KR-30194</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-7 p-6 md:p-10 space-y-6">
          <div className="flex items-start gap-3">
            <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Check className="w-4 h-4" />
            </span>
            <div>
              <h2 className="font-display text-2xl font-semibold text-slate-900">
                Order #KR-30194 confirmed
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                We have emailed your dispatch confirmation to <span className="font-medium text-slate-900">lars@bergman.io</span>.
              </p>
            </div>
          </div>

          <div className="border border-slate-200 rounded-lg p-5 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Fulfillment progress
            </h3>
            <ol className="space-y-3 text-sm">
              <li className="flex items-center justify-between">
                <span className="flex items-center gap-2.5 font-medium text-slate-900">
                  <Check className="w-4 h-4 text-emerald-600" />
                  Order recorded
                </span>
                <span className="font-mono-num text-xs text-slate-500">19:42</span>
              </li>
              <li className="flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-2.5">
                  <Package className="w-4 h-4 text-slate-500" />
                  Warehouse quality inspection
                </span>
                <span className="font-mono-num text-xs text-slate-500">In progress</span>
              </li>
              <li className="flex items-center justify-between text-slate-400">
                <span className="pl-6">Scheduled arrival · Nov 25</span>
              </li>
            </ol>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setCarrierDetails(!carrierDetails)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
            >
              {carrierDetails ? 'Hide tracking feed' : 'Track package'}
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs text-slate-500 font-mono-num">UPS Ground · 1Z999AA101234</span>
          </div>

          {carrierDetails && (
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1.5 font-mono-num">
              <p>ORIGIN: Portland Consolidation Hub, OR</p>
              <p>DESTINATION: 618 Pine St, Seattle, WA 98101</p>
              <p>WEIGHT: 6.4 kg · SIGNATURE NOT REQUIRED</p>
            </div>
          )}
        </div>

        <aside className="lg:col-span-5 bg-slate-50 border-t lg:border-t-0 lg:border-l border-slate-200 p-6 md:p-10 space-y-6">
          <h3 className="text-sm font-semibold text-slate-900">Receipt summary</h3>
          <ul className="space-y-4">
            {ORDER_ITEMS.map((item) => (
              <li key={item.id} className="flex items-center gap-3.5">
                <MonogramArt
                  monogram={item.monogram}
                  gradient={item.gradient}
                  shape="grid"
                  className="w-12 h-12 rounded-lg text-xs"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{item.name}</p>
                  <p className="text-xs text-slate-500">{item.variant}</p>
                </div>
                <span className="font-mono-num text-sm">{formatCurrency(item.price)}</span>
              </li>
            ))}
          </ul>
          <dl className="pt-4 border-t border-slate-200 space-y-2 text-sm">
            <div className="flex justify-between text-slate-600">
              <dt>Subtotal</dt>
              <dd className="font-mono-num">$250.00</dd>
            </div>
            <div className="flex justify-between text-slate-600">
              <dt>Shipping</dt>
              <dd className="font-mono-num">Free</dd>
            </div>
            <div className="flex justify-between text-slate-600">
              <dt>Tax</dt>
              <dd className="font-mono-num">$20.00</dd>
            </div>
            <div className="flex justify-between pt-3 border-t border-slate-200 font-semibold text-slate-900">
              <dt>Total paid</dt>
              <dd className="font-mono-num">$270.00</dd>
            </div>
          </dl>
        </aside>
      </div>
    </section>
  );
}
