import React, { useState } from 'react';
import { ChevronDown, ShoppingBag, Check } from 'lucide-react';
import { formatCurrency } from '../../utils/commerce';
import { MonogramArt } from '../MonogramArt';

const SYNTH_VIEWS = [
  { id: 'top', label: 'Panel Top', shape: 'grid' as const, monogram: 'M4' },
  { id: 'io', label: 'I/O Rear', shape: 'wave' as const, monogram: 'IO' },
  { id: 'keys', label: 'Tactile Deck', shape: 'prism' as const, monogram: 'TD' },
  { id: 'case', label: 'Flight Case', shape: 'ring' as const, monogram: 'FC' },
];

const CHASSIS = [
  { id: 'obsidian', name: 'Anodized Obsidian', gradient: ['#18181B', '#27272A'] as [string, string] },
  { id: 'cobalt', name: 'Deep Cobalt', gradient: ['#1E3A8A', '#172554'] as [string, string] },
];

const CAPACITIES = [
  { id: '64gb', label: '64GB Core', price: 890 },
  { id: '256gb', label: '256GB Studio Pro', price: 1090 },
];

const SPECS = [
  {
    id: 'engine',
    title: 'Acoustic & DSP Engine',
    body: 'Dual 32-bit floating-point synthesis cores with 16-voice polyphony and analog tape saturation stage.',
  },
  {
    id: 'io',
    title: 'Connectivity & Sync',
    body: 'Balanced stereo TRS out, MIDI In/Out/Thru, USB-C audio interface mode, and 3.5mm CV/Gate clock.',
  },
  {
    id: 'box',
    title: 'Included in the Box',
    body: 'Vectra M4 Synthesizer, braided USB-C studio cable, magnetic overlay guide, and calibration sheet.',
  },
];

export function Shop18() {
  const [viewIdx, setViewIdx] = useState(0);
  const [chassisId, setChassisId] = useState('obsidian');
  const [capId, setCapId] = useState('64gb');
  const [cartCount, setCartCount] = useState(0);
  const [justAdded, setJustAdded] = useState(false);
  const [openSpec, setOpenSpec] = useState('engine');

  const chassis = CHASSIS.find((c) => c.id === chassisId)!;
  const capacity = CAPACITIES.find((c) => c.id === capId)!;
  const view = SYNTH_VIEWS[viewIdx];

  const handleAdd = () => {
    setCartCount((n) => n + 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  return (
    <section className="bg-[#121316] text-zinc-100 rounded-xl border border-zinc-800 overflow-hidden">
      <div className="px-6 md:px-10 py-4 border-b border-zinc-800 flex items-center justify-between">
        <span className="font-display font-semibold text-base text-white">Vectra Labs</span>
        <span className="inline-flex items-center gap-2 text-xs font-mono-num text-amber-400">
          <ShoppingBag className="w-4 h-4" />
          CART ({cartCount})
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 md:p-10">
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-[4/3] w-full rounded-xl overflow-hidden border border-zinc-800">
            <MonogramArt
              monogram={view.monogram}
              gradient={chassis.gradient}
              shape={view.shape}
              label={`Vectra M4 Field Synthesizer — ${chassis.name} ${view.label}`}
              className="w-full h-full text-5xl"
            />
          </div>
          <div className="grid grid-cols-4 gap-3">
            {SYNTH_VIEWS.map((v, idx) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setViewIdx(idx)}
                className={`p-2 rounded-lg border text-left transition-colors ${
                  viewIdx === idx
                    ? 'border-amber-400 bg-zinc-900'
                    : 'border-zinc-800 bg-[#181A1F] hover:border-zinc-700'
                }`}
              >
                <MonogramArt
                  monogram={v.monogram}
                  gradient={chassis.gradient}
                  shape={v.shape}
                  className="w-full h-12 rounded text-xs mb-1.5"
                />
                <span className="block text-xs text-zinc-300 truncate">{v.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <div>
              <p className="text-xs font-mono-num text-amber-400">IN STOCK · SHIPS WITHIN 24H</p>
              <h2 className="font-display text-3xl font-semibold text-white mt-1">
                Field Synthesizer M4
              </h2>
              <p className="font-mono-num text-2xl font-semibold text-white mt-2">
                {formatCurrency(capacity.price)}
              </p>
            </div>

            <div>
              <p className="text-xs text-zinc-400 mb-2">
                Enclosure: <span className="text-white font-medium">{chassis.name}</span>
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {CHASSIS.map((ch) => (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => setChassisId(ch.id)}
                    className={`py-2.5 px-3 rounded-lg border text-xs font-medium text-left ${
                      chassisId === ch.id
                        ? 'border-amber-400 bg-zinc-900 text-white'
                        : 'border-zinc-800 bg-[#181A1F] text-zinc-400'
                    }`}
                  >
                    {ch.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-zinc-400 mb-2">Sample Memory</p>
              <div className="grid grid-cols-2 gap-2.5">
                {CAPACITIES.map((cap) => (
                  <button
                    key={cap.id}
                    type="button"
                    onClick={() => setCapId(cap.id)}
                    className={`py-2.5 px-3 rounded-lg border text-xs text-left ${
                      capId === cap.id
                        ? 'border-amber-400 bg-zinc-900 text-white'
                        : 'border-zinc-800 bg-[#181A1F] text-zinc-400'
                    }`}
                  >
                    <span className="block font-semibold">{cap.label}</span>
                    <span className="block font-mono-num text-zinc-400 mt-0.5">
                      {formatCurrency(cap.price)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleAdd}
              className="w-full py-3.5 bg-amber-400 text-zinc-950 font-semibold text-sm rounded-lg hover:bg-amber-300 transition-colors inline-flex items-center justify-center gap-2"
            >
              {justAdded ? (
                <>
                  <Check className="w-4 h-4" />
                  Added to cart ({cartCount})
                </>
              ) : (
                `Add to cart · ${formatCurrency(capacity.price)}`
              )}
            </button>
          </div>

          <div className="divide-y divide-zinc-800 border-t border-b border-zinc-800">
            {SPECS.map((s) => {
              const open = openSpec === s.id;
              return (
                <div key={s.id}>
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => setOpenSpec(open ? '' : s.id)}
                    className="w-full py-3.5 flex items-center justify-between text-left text-sm font-medium text-zinc-100"
                  >
                    <span>{s.title}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-zinc-400 transition-transform ${open ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {open && <p className="pb-4 text-xs leading-relaxed text-zinc-400">{s.body}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
