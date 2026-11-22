import React, { useState } from 'react';
import { ChevronDown, Minus, Plus, ShoppingBag, Star } from 'lucide-react';

const GLAZES = [
  { id: 'sumi', name: 'Charcoal Sumi', hex: '#27272A', c1: '#2A2927', c2: '#141413' },
  { id: 'terracotta', name: 'Fired Clay', hex: '#C26D4B', c1: '#4A2B1F', c2: '#1E1512' },
  { id: 'ash', name: 'Kiln Ash', hex: '#A8A29E', c1: '#3D3B38', c2: '#1C1B19' },
];

const EDITIONS = ['350ml Solo', '600ml Carafe', '850ml Studio'];
const VIEWS = ['Dripper', 'Carafe', 'Kiln Stamp', 'Tea Box'];

const ACCORDIONS = [
  { id: 'clay', title: 'Shigaraki Stoneware & Firing', body: 'Hand-thrown in Shiga Prefecture using iron-rich stoneware fired for 72 hours at 1,280°C for thermal retention.' },
  { id: 'ribs', title: 'Spiral Extraction Geometry', body: '24 interior spiral ribs lift paper filters away from the ceramic wall for clean, even percolation.' },
  { id: 'care', title: 'Care & Box Contents', body: 'Includes ceramic V-dripper, matching range server, 40 unbleached cotton-pulp filters, and paulownia storage box.' },
];

const RELATED = [
  { id: 'ak1', name: 'Hinoki Tasting Cup', price: 48, mono: 'HT' },
  { id: 'ak2', name: 'Brass Coffee Scoop', price: 54, mono: 'BS' },
  { id: 'ak3', name: 'Linen Filter Wallet', price: 36, mono: 'FW' },
  { id: 'ak4', name: 'Stoneware Kettle', price: 195, mono: 'SK' },
];

function CeramicSvg({ view, glaze }: { view: string; glaze: (typeof GLAZES)[number] }) {
  return (
    <svg viewBox="0 0 460 440" className="w-full h-full" role="img" aria-label={`Sumi Dripper ${view} in ${glaze.name}`}>
      <defs>
        <linearGradient id={`kuro-${view}-${glaze.id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={glaze.c1} />
          <stop offset="100%" stopColor={glaze.c2} />
        </linearGradient>
      </defs>
      <rect width="460" height="440" fill={`url(#kuro-${view}-${glaze.id})`} />
      <rect x="20" y="20" width="420" height="400" fill="none" stroke="#EAE6DF" strokeOpacity="0.14" />
      {view === 'Dripper' && (
        <g stroke="#EAE6DF" strokeWidth="2">
          <path d="M135 120 L325 120 L270 250 L190 250 Z" fill={glaze.hex} />
          <rect x="165" y="250" width="130" height="16" rx="4" fill="#EAE6DF" fillOpacity="0.2" />
          <path d="M165 266 L295 266 L315 350 L145 350 Z" fill="#0F0F0E" fillOpacity="0.65" />
        </g>
      )}
      {view === 'Carafe' && (
        <g stroke="#EAE6DF" strokeWidth="2">
          <path d="M175 110 L285 110 L325 320 L135 320 Z" fill={glaze.hex} fillOpacity="0.8" />
          <path d="M295 160 C350 160, 350 260, 305 270" fill="none" strokeWidth="6" />
        </g>
      )}
      {view === 'Kiln Stamp' && (
        <g>
          <circle cx="230" cy="220" r="95" fill={glaze.hex} fillOpacity="0.4" stroke="#EAE6DF" strokeWidth="1.5" />
          <rect x="188" y="178" width="84" height="84" fill="none" stroke="#C26D4B" strokeWidth="2.5" />
          <text x="230" y="232" textAnchor="middle" fill="#EAE6DF" fontSize="34" fontFamily="Playfair Display, serif">
            黒
          </text>
        </g>
      )}
      {view === 'Tea Box' && (
        <g stroke="#EAE6DF" strokeWidth="1.5">
          <rect x="105" y="115" width="250" height="210" fill="#2A2622" />
          <line x1="230" y1="115" x2="230" y2="325" stroke="#C26D4B" strokeWidth="4" />
        </g>
      )}
      <text x="38" y="54" fill="#EAE6DF" fillOpacity="0.55" fontSize="11" letterSpacing="3" fontFamily="DM Sans, sans-serif">
        ATELIER KURO
      </text>
    </svg>
  );
}

export function Shop6() {
  const [view, setView] = useState(VIEWS[0]);
  const [glaze, setGlaze] = useState(GLAZES[1]);
  const [edition, setEdition] = useState(EDITIONS[1]);
  const [qty, setQty] = useState(1);
  const [bag, setBag] = useState(1);
  const [openAcc, setOpenAcc] = useState('clay');

  const salePrice = 142;
  const comparePrice = 175;

  return (
    <div className="min-h-screen bg-[#141413] text-[#EAE6DF] font-dm">
      <header className="border-b border-[#2B2926]">
        <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between gap-8">
          <a href="#kuro" className="font-playfair text-xl font-semibold tracking-wide whitespace-nowrap shrink-0">
            Atelier Kuro
          </a>
          <nav className="hidden md:flex items-center gap-7 text-xs uppercase tracking-[0.2em] text-[#A8A29E]" aria-label="Primary">
            <a href="#vessels" className="hover:text-[#EAE6DF] whitespace-nowrap shrink-0">Vessels</a>
            <a href="#brewing" className="hover:text-[#EAE6DF] whitespace-nowrap shrink-0">Pour-Over</a>
            <a href="#incense" className="hover:text-[#EAE6DF] whitespace-nowrap shrink-0">Incense</a>
            <a href="#kilns" className="hover:text-[#EAE6DF] whitespace-nowrap shrink-0">Kilns</a>
          </nav>
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 border border-[#3F3B36] hover:border-[#C26D4B] text-xs uppercase tracking-widest whitespace-nowrap shrink-0 tabular-nums"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#C26D4B]" />
            <span>Bag ({bag})</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Gallery with Right-Aligned Vertical Thumbnails (7 cols) */}
          <section className="lg:col-span-7 flex flex-col sm:flex-row gap-4" aria-label="Ceramic gallery">
            <div className="flex-1 aspect-square border border-[#2B2926] overflow-hidden">
              <CeramicSvg view={view} glaze={glaze} />
            </div>
            <div className="flex sm:flex-col gap-3 sm:w-24 shrink-0">
              {VIEWS.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  aria-label={`View ${v}`}
                  aria-pressed={view === v}
                  className={`aspect-square w-16 sm:w-24 border transition-colors overflow-hidden ${
                    view === v ? 'border-[#C26D4B]' : 'border-[#2B2926] opacity-70 hover:opacity-100'
                  }`}
                >
                  <CeramicSvg view={v} glaze={glaze} />
                </button>
              ))}
            </div>
          </section>

          {/* Luxury Dark Editorial Buy Panel (5 cols) */}
          <section className="lg:col-span-5 space-y-6" aria-label="Object purchase panel">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[#C26D4B]">Shigaraki Kiln · Small Batch</p>
              <h1 className="mt-2 font-playfair text-4xl font-semibold text-balance">Sumi Dripper &amp; Carafe</h1>
              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-2xl font-medium tabular-nums">${salePrice}.00</span>
                <span className="text-sm line-through text-[#78716C] tabular-nums">${comparePrice}.00</span>
                <span className="px-2 py-0.5 text-[11px] uppercase tracking-widest bg-[#C26D4B] text-white">
                  Kiln Sale
                </span>
              </div>
              <p className="mt-4 text-sm text-[#A8A29E] leading-relaxed">
                Wheel-thrown stoneware coffee ritual pairing unglazed mineral warmth with a satin ash interior glaze.
              </p>
            </div>

            {/* Glaze Picker */}
            <div>
              <div className="flex justify-between text-xs uppercase tracking-widest mb-3">
                <span className="text-[#A8A29E]">Glaze</span>
                <span>{glaze.name}</span>
              </div>
              <div className="flex gap-3">
                {GLAZES.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGlaze(g)}
                    aria-label={`Glaze ${g.name}`}
                    aria-pressed={glaze.id === g.id}
                    className={`w-10 h-10 rounded-full border-2 ${
                      glaze.id === g.id ? 'border-[#EAE6DF] scale-105' : 'border-[#3F3B36]'
                    }`}
                    style={{ backgroundColor: g.hex }}
                  />
                ))}
              </div>
            </div>

            {/* Capacity / Size */}
            <div>
              <p className="text-xs uppercase tracking-widest text-[#A8A29E] mb-3">Carafe Capacity</p>
              <div className="grid grid-cols-3 gap-2.5">
                {EDITIONS.map((ed) => (
                  <button
                    key={ed}
                    type="button"
                    onClick={() => setEdition(ed)}
                    aria-pressed={edition === ed}
                    className={`py-2.5 text-xs border transition-colors ${
                      edition === ed
                        ? 'bg-[#EAE6DF] text-[#141413] border-[#EAE6DF] font-semibold'
                        : 'border-[#2B2926] text-[#A8A29E] hover:border-[#78716C]'
                    }`}
                  >
                    {ed}
                  </button>
                ))}
              </div>
            </div>

            {/* Stepper + CTA */}
            <div className="flex gap-3">
              <div className="flex items-center border border-[#2B2926]">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="p-3 text-[#A8A29E] hover:text-white"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-9 text-center text-sm tabular-nums">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((q) => q + 1)}
                  aria-label="Increase quantity"
                  className="p-3 text-[#A8A29E] hover:text-white"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => setBag((b) => b + qty)}
                className="flex-1 py-3.5 px-6 bg-[#C26D4B] hover:bg-[#B05E3E] text-white text-xs uppercase tracking-[0.2em] font-semibold transition-colors tabular-nums"
              >
                Add to Bag · ${salePrice * qty}
              </button>
            </div>

            {/* Accordions */}
            <div className="border-t border-[#2B2926] divide-y divide-[#2B2926]">
              {ACCORDIONS.map((a) => {
                const open = openAcc === a.id;
                return (
                  <div key={a.id}>
                    <button
                      type="button"
                      onClick={() => setOpenAcc(open ? '' : a.id)}
                      aria-expanded={open}
                      className="w-full py-3.5 flex items-center justify-between text-xs uppercase tracking-widest"
                    >
                      <span>{a.title}</span>
                      <ChevronDown className={`w-4 h-4 text-[#C26D4B] transition-transform ${open ? 'rotate-180' : ''}`} />
                    </button>
                    {open && <p className="pb-4 text-sm text-[#A8A29E] leading-relaxed">{a.body}</p>}
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Reviews Strip */}
        <section className="mt-16 pt-10 border-t border-[#2B2926]" aria-label="Collector reviews">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h2 className="font-playfair text-2xl font-semibold">Collector Notes</h2>
            <div className="flex items-center gap-1.5 text-[#C26D4B] text-xs">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
              <span className="ml-2 text-[#EAE6DF] tabular-nums">5.0 · 47 Editions</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Ren T.', loc: 'Kyoto', text: 'Pre-warming the stoneware keeps pour-over temperature remarkably steady.' },
              { name: 'Claire B.', loc: 'Melbourne', text: 'Fired Clay glaze has subtle mineral speckles that catch morning light.' },
              { name: 'Owen H.', loc: 'Seattle', text: 'Paulownia box makes this an unforgettable studio gift.' },
            ].map((rev) => (
              <article key={rev.name} className="p-5 bg-[#1B1A18] border border-[#2B2926]">
                <p className="text-xs uppercase tracking-widest text-[#C26D4B] mb-2">
                  {rev.name} · {rev.loc}
                </p>
                <p className="text-sm text-[#D6D3D1] leading-relaxed">{rev.text}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Related Ceramic Row */}
        <section className="mt-16 pt-10 border-t border-[#2B2926]" aria-label="Related vessels">
          <h2 className="font-playfair text-2xl font-semibold mb-6">From the Same Kiln</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {RELATED.map((r) => (
              <article key={r.id} className="bg-[#1B1A18] border border-[#2B2926] overflow-hidden">
                <div className="aspect-[4/3]">
                  <svg viewBox="0 0 300 225" className="w-full h-full" role="img" aria-label={r.name}>
                    <rect width="300" height="225" fill="#23211E" />
                    <circle cx="150" cy="112" r="42" fill="#2F2B27" stroke="#C26D4B" strokeOpacity="0.6" />
                    <text x="150" y="121" textAnchor="middle" fill="#EAE6DF" fontSize="22" fontFamily="Playfair Display, serif">
                      {r.mono}
                    </text>
                  </svg>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-playfair text-base">{r.name}</h3>
                    <p className="text-xs text-[#A8A29E] tabular-nums">${r.price}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBag((b) => b + 1)}
                    className="text-xs uppercase tracking-widest text-[#C26D4B] hover:underline"
                  >
                    + Add
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Shop6;
