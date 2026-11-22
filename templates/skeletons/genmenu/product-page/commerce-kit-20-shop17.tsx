import React, { useState } from 'react';
import { ChevronDown, Minus, Plus, ShoppingBag, Check } from 'lucide-react';
import { formatCurrency } from '../../utils/commerce';
import { MonogramArt } from '../MonogramArt';

const GALLERY_VIEWS = [
  { id: 'front', label: 'Front Dial', shape: 'circle' as const, monogram: 'S1' },
  { id: 'profile', label: 'Side Profile', shape: 'arch' as const, monogram: 'S2' },
  { id: 'back', label: 'Crown Detail', shape: 'ring' as const, monogram: 'S3' },
  { id: 'scale', label: 'Desk Scale', shape: 'grid' as const, monogram: 'S4' },
];

const FINISHES = [
  { id: 'brass', name: 'Brushed Brass', gradient: ['#B45309', '#78350F'] as [string, string], swatch: '#B45309' },
  { id: 'bone', name: 'Travertine Bone', gradient: ['#D6CFC2', '#A89F91'] as [string, string], swatch: '#D6CFC2' },
  { id: 'bronze', name: 'Oxidized Bronze', gradient: ['#44403C', '#292524'] as [string, string], swatch: '#44403C' },
];

const EDITIONS = [
  { id: 'quartz', label: 'Silent Sweep Quartz', price: 290 },
  { id: 'alarm', label: 'Chime Alarm Edition', price: 340 },
];

const ACCORDIONS = [
  {
    id: 'materials',
    title: 'Materials & Craftsmanship',
    body: 'CNC-milled solid C36000 brass case paired with anti-reflective mineral crystal and a weighted felt base.',
  },
  {
    id: 'dimensions',
    title: 'Dimensions & Weight',
    body: '112mm diameter × 48mm depth · 640g net weight · Powered by a single AA cell (included).',
  },
  {
    id: 'shipping',
    title: 'Shipping & 30-Day Returns',
    body: 'Complimentary insured courier on all timepiece orders. Unopened returns accepted within 30 days.',
  },
];

export function Shop17() {
  const [activeView, setActiveView] = useState(0);
  const [finishId, setFinishId] = useState('brass');
  const [editionId, setEditionId] = useState('quartz');
  const [qty, setQty] = useState(1);
  const [bagCount, setBagCount] = useState(0);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string>('materials');

  const finish = FINISHES.find((f) => f.id === finishId)!;
  const edition = EDITIONS.find((e) => e.id === editionId)!;
  const view = GALLERY_VIEWS[activeView];

  const handleAddToBag = () => {
    setBagCount((c) => c + qty);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2200);
  };

  return (
    <section className="bg-[#FAF7F2] text-[#292524] rounded-2xl border border-[#E6DFD3] overflow-hidden">
      <div className="px-6 md:px-10 py-4 border-b border-[#E6DFD3] flex items-center justify-between">
        <span className="font-editorial text-xl font-semibold">Sorel Objects</span>
        <span className="inline-flex items-center gap-2 text-xs font-mono-num text-[#57534E]">
          <ShoppingBag className="w-4 h-4" />
          BAG ({bagCount})
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 md:p-10">
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-[4/3] w-full rounded-xl overflow-hidden border border-[#E6DFD3] bg-[#F3EDE3] flex items-center justify-center">
            <MonogramArt
              monogram={view.monogram}
              gradient={finish.gradient}
              shape={view.shape}
              darkText={finish.id === 'bone'}
              label={`Sorel Monolith Desk Clock — ${finish.name}, ${view.label}`}
              className="w-full h-full text-5xl"
            />
          </div>
          <div className="grid grid-cols-4 gap-3">
            {GALLERY_VIEWS.map((v, idx) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setActiveView(idx)}
                className={`p-2 rounded-lg border text-left transition-colors ${
                  activeView === idx
                    ? 'border-[#292524] bg-white'
                    : 'border-[#E6DFD3] bg-[#F5EFE6] hover:border-[#A89F91]'
                }`}
              >
                <MonogramArt
                  monogram={v.monogram}
                  gradient={finish.gradient}
                  shape={v.shape}
                  darkText={finish.id === 'bone'}
                  className="w-full h-14 rounded text-xs mb-1.5"
                />
                <span className="block text-xs font-medium truncate">{v.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#78716C]">Horology · Series 02</p>
              <h2 className="font-editorial text-3xl font-semibold text-[#1C1917] mt-1">
                Monolith Desk Clock
              </h2>
              <p className="font-mono-num text-xl font-semibold text-[#1C1917] mt-2">
                {formatCurrency(edition.price)}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-[#57534E] mb-2">
                Finish: <span className="text-[#1C1917] font-semibold">{finish.name}</span>
              </p>
              <div className="flex items-center gap-3">
                {FINISHES.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    aria-label={`Select ${f.name} finish`}
                    onClick={() => setFinishId(f.id)}
                    className={`w-9 h-9 rounded-full border-2 transition-transform ${
                      finishId === f.id ? 'border-[#1C1917] scale-110' : 'border-[#D6CFC2]'
                    }`}
                    style={{ backgroundColor: f.swatch }}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-[#57534E] mb-2">Movement</p>
              <div className="grid grid-cols-2 gap-2.5">
                {EDITIONS.map((ed) => (
                  <button
                    key={ed.id}
                    type="button"
                    onClick={() => setEditionId(ed.id)}
                    className={`p-3 rounded-lg border text-left text-xs font-medium transition-colors ${
                      editionId === ed.id
                        ? 'border-[#1C1917] bg-white text-[#1C1917]'
                        : 'border-[#E6DFD3] bg-[#F5EFE6] text-[#57534E]'
                    }`}
                  >
                    <span className="block font-semibold">{ed.label}</span>
                    <span className="block font-mono-num text-[#78716C] mt-0.5">
                      {formatCurrency(ed.price)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <div className="inline-flex items-center border border-[#D6CFC2] rounded-lg bg-white">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="p-2.5 text-[#57534E] hover:text-[#1C1917]"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-3 text-sm font-mono-num">{qty}</span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => setQty((q) => q + 1)}
                  className="p-2.5 text-[#57534E] hover:text-[#1C1917]"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button
                type="button"
                onClick={handleAddToBag}
                className="flex-1 py-3 px-5 bg-[#1C1917] text-[#FAF7F2] text-sm font-medium rounded-lg hover:bg-stone-800 transition-colors inline-flex items-center justify-center gap-2"
              >
                {addedFeedback ? (
                  <>
                    <Check className="w-4 h-4" />
                    Added to bag
                  </>
                ) : (
                  `Add to bag · ${formatCurrency(edition.price * qty)}`
                )}
              </button>
            </div>
          </div>

          <div className="divide-y divide-[#E6DFD3] border-t border-b border-[#E6DFD3]">
            {ACCORDIONS.map((acc) => {
              const isOpen = openAccordion === acc.id;
              return (
                <div key={acc.id}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenAccordion(isOpen ? '' : acc.id)}
                    className="w-full py-3.5 flex items-center justify-between text-left text-sm font-medium text-[#1C1917]"
                  >
                    <span>{acc.title}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#78716C] transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {isOpen && <p className="pb-4 text-xs leading-relaxed text-[#57534E]">{acc.body}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
