import React, { useState } from 'react';
import { Check, MapPin, Bell } from 'lucide-react';
import { formatCurrency } from '../../utils/commerce';
import { MonogramArt } from '../MonogramArt';

const DROP_RECEIPT_ITEMS = [
  {
    id: 'vc-r1',
    name: 'Volt Court Low 88',
    variant: 'US 10 · Cobalt / Lime',
    price: 165,
    qty: 1,
    monogram: 'VC',
    gradient: ['#2563EB', '#1D4ED8'] as [string, string],
  },
  {
    id: 'vc-r2',
    name: 'Ribbed Crew Athletic Socks',
    variant: '3-Pack · Chalk White',
    price: 32,
    qty: 1,
    monogram: 'RC',
    gradient: ['#65A30D', '#4D7C0F'] as [string, string],
  },
];

export function Shop16() {
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [showMapStep, setShowMapStep] = useState(false);

  return (
    <section className="bg-white text-zinc-950 rounded-2xl border-2 border-zinc-950 py-10 px-4 sm:px-8 shadow-[6px_6px_0px_#2563EB]">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-[#2563EB] text-white rounded-xl border-2 border-zinc-950 p-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-mono-num uppercase tracking-wider text-blue-100">
              Order #VC-99210 Confirmed
            </p>
            <h2 className="font-display text-2xl font-bold mt-1">Packaged & Ready for Airbox</h2>
          </div>
          <span className="px-3.5 py-1.5 bg-[#84CC16] text-zinc-950 font-mono-num text-sm font-bold rounded-lg border-2 border-zinc-950">
            PAID · $212.76
          </span>
        </div>

        <ol className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-bold">
          <li className="p-3.5 rounded-xl bg-[#ECFCCB] border-2 border-zinc-950 flex items-center gap-2">
            <Check className="w-4 h-4 text-lime-700 shrink-0" />
            1. Order Confirmed
          </li>
          <li className="p-3.5 rounded-xl bg-[#DBEAFE] border-2 border-zinc-950 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-700 shrink-0" />
            2. Label Printed
          </li>
          <li className="p-3.5 rounded-xl bg-zinc-50 border-2 border-zinc-300 text-zinc-500 flex items-center gap-2">
            3. Courier Delivery
          </li>
        </ol>

        <div className="border-2 border-zinc-950 rounded-xl divide-y divide-zinc-200 overflow-hidden">
          {DROP_RECEIPT_ITEMS.map((item) => (
            <div key={item.id} className="p-4 flex items-center gap-4 bg-white">
              <MonogramArt
                monogram={item.monogram}
                gradient={item.gradient}
                shape="prism"
                className="w-14 h-14 rounded-lg border-2 border-zinc-950 text-sm"
              />
              <div className="flex-1 min-w-0">
                <p className="font-display font-bold text-sm truncate">{item.name}</p>
                <p className="text-xs text-zinc-600">
                  {item.variant} · Qty {item.qty}
                </p>
              </div>
              <span className="font-mono-num font-bold text-sm">{formatCurrency(item.price)}</span>
            </div>
          ))}
          <div className="p-4 bg-zinc-50 flex flex-wrap justify-between gap-2 text-sm">
            <span className="text-zinc-600">Subtotal $197.00 · Tax $15.76 · Airbox Free</span>
            <span className="font-mono-num font-bold text-zinc-950">Total $212.76</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setShowMapStep(!showMapStep)}
            aria-expanded={showMapStep}
            className="px-5 py-2.5 bg-zinc-950 text-white text-sm font-bold rounded-lg hover:bg-zinc-800 transition-colors"
          >
            {showMapStep ? 'Hide tracking details' : 'View live carrier tracking'}
          </button>

          <button
            type="button"
            onClick={() => setSmsAlerts(!smsAlerts)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-lg border-2 border-zinc-950 transition-colors ${
              smsAlerts ? 'bg-[#84CC16] text-zinc-950' : 'bg-white text-zinc-950 hover:bg-zinc-100'
            }`}
          >
            <Bell className="w-4 h-4" />
            {smsAlerts ? 'SMS Alerts Enabled' : 'Enable SMS Drop Updates'}
          </button>
        </div>

        {showMapStep && (
          <div className="p-4 rounded-xl bg-[#EFF6FF] border-2 border-[#2563EB] text-xs font-mono-num text-blue-950 space-y-1">
            <p>TRACKING ID: VC-AIR-8849201</p>
            <p>HUB: Newark Air Sortation · ETA Tue Nov 24 before 18:00</p>
          </div>
        )}
      </div>
    </section>
  );
}
