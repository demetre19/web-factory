import React, { useState } from 'react';
import { Truck, Check, Copy } from 'lucide-react';
import { formatCurrency } from '../../utils/commerce';
import { MonogramArt } from '../MonogramArt';

const RECEIPT_ITEMS = [
  {
    id: 'ml-1',
    name: 'Ambre Fumée Eau de Parfum',
    variant: '100ml Flacon · Engraved Cap',
    price: 235,
    qty: 1,
    monogram: 'AF',
    gradient: ['#78350F', '#451A03'] as [string, string],
  },
  {
    id: 'ml-2',
    name: 'Cedarwood Travel Atomizer',
    variant: '15ml Brushed Brass',
    price: 78,
    qty: 1,
    monogram: 'CA',
    gradient: ['#92400E', '#78350F'] as [string, string],
  },
];

export function Shop14() {
  const [trackingOpen, setTrackingOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyOrder = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="bg-[#FDFBF7] text-[#1C1917] rounded-xl border border-[#E5DEC9] py-10 px-4 sm:px-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-2 pb-6 border-b border-[#E5DEC9]">
          <p className="text-xs uppercase tracking-widest text-[#78716C]">Maison Lumière</p>
          <h2 className="font-editorial text-3xl font-medium">Order Confirmed</h2>
          <div className="inline-flex items-center gap-2 text-sm font-mono-num text-[#57534E]">
            <span>Order #MV-84920</span>
            <button
              type="button"
              onClick={copyOrder}
              className="inline-flex items-center gap-1 text-xs underline underline-offset-4 hover:text-[#1C1917]"
            >
              <Copy className="w-3 h-3" />
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs uppercase tracking-widest text-[#78716C]">Items in shipment</h3>
          <ul className="divide-y divide-[#E5DEC9] border-t border-b border-[#E5DEC9]">
            {RECEIPT_ITEMS.map((item) => (
              <li key={item.id} className="py-4 flex items-center gap-4">
                <MonogramArt
                  monogram={item.monogram}
                  gradient={item.gradient}
                  shape="arch"
                  editorial
                  className="w-14 h-14 text-sm"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-editorial text-base font-medium">{item.name}</p>
                  <p className="text-xs text-[#78716C]">
                    {item.variant} · Qty {item.qty}
                  </p>
                </div>
                <span className="font-mono-num text-sm">{formatCurrency(item.price)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm bg-[#F7F3EA] p-5 border border-[#E5DEC9]">
          <div>
            <p className="text-xs uppercase tracking-wider text-[#78716C] mb-1">Shipping Destination</p>
            <p className="font-medium">Celeste Moreau</p>
            <p className="text-[#57534E]">24 Rue du Faubourg, Paris 75008</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-[#78716C] mb-1">Settlement</p>
            <p className="font-mono-num">Visa •••• 4912</p>
            <p className="font-mono-num font-semibold mt-0.5">Total paid: $338.04</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setTrackingOpen(!trackingOpen)}
            aria-expanded={trackingOpen}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1C1917] text-[#FDFBF7] text-xs uppercase tracking-widest hover:bg-stone-800 transition-colors"
          >
            <Truck className="w-4 h-4" />
            {trackingOpen ? 'Hide Shipment Timeline' : 'Track Shipment'}
          </button>
          <span className="text-xs text-[#78716C]">Estimated arrival: Thu, Nov 26</span>
        </div>

        {trackingOpen && (
          <div className="p-5 bg-white border border-[#E5DEC9]">
            <p className="text-xs font-mono-num text-[#57534E] mb-4">CARRIER WAYBILL: DHL-992018442</p>
            <ol className="space-y-3 text-sm">
              <li className="flex items-center gap-3 text-[#1C1917] font-medium">
                <span className="w-5 h-5 rounded-full bg-[#1C1917] text-white flex items-center justify-center">
                  <Check className="w-3 h-3" />
                </span>
                Order verified & fragrance bottled — Nov 21, 18:10
              </li>
              <li className="flex items-center gap-3 text-[#57534E]">
                <span className="w-5 h-5 rounded-full border border-[#1C1917] text-xs flex items-center justify-center font-mono-num">
                  2
                </span>
                Preparing archival parcel for courier handoff
              </li>
              <li className="flex items-center gap-3 text-[#A8A29E]">
                <span className="w-5 h-5 rounded-full border border-[#D6CFC2] text-xs flex items-center justify-center font-mono-num">
                  3
                </span>
                In transit to Paris 75008
              </li>
            </ol>
          </div>
        )}
      </div>
    </section>
  );
}
