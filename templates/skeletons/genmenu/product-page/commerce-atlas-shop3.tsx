import React, { useState } from 'react';
import { ChevronDown, Minus, Plus, ShoppingBag, Star } from 'lucide-react';

const COLORWAYS = [
  { id: 'tangerine', name: 'Solar Tangerine', primary: '#FF4D00', secondary: '#FDE047', bg: '#FFF7ED' },
  { id: 'cobalt', name: 'Hyper Cobalt', primary: '#2563EB', secondary: '#A3E635', bg: '#EFF6FF' },
  { id: 'magenta', name: 'Acid Berry', primary: '#DB2777', secondary: '#38BDF8', bg: '#FDF2F8' },
];

const SIZES = ['US 7', 'US 8', 'US 9', 'US 10', 'US 11', 'US 12'];
const ANGLES = ['Lateral', 'Sole Plate', 'Heel Pod', 'Box Art'];

const FAQS = [
  { id: 'cushion', title: 'Dual-Density Foam Tech', body: 'Nitrogen-infused EVA midsole paired with a forked carbon-composite propulsion plate for crisp rebound.' },
  { id: 'upper', title: 'Ripstop & Knit Upper', body: 'Breathable mono-mesh upper reinforced with welded TPU mudguards and reflective heel tabs.' },
  { id: 'returns', title: '30-Day Pavement Trial', body: 'Run in them outdoors for 30 days. Free prepaid return label if the stride feel is not for you.' },
];

const RELATED = [
  { id: 'vh1', name: 'Tempo Crew Socks', price: 24, mono: 'TC', c1: '#FF4D00', c2: '#FB923C' },
  { id: 'vh2', name: 'Hydration Flask 500', price: 38, mono: 'HF', c1: '#2563EB', c2: '#60A5FA' },
  { id: 'vh3', name: 'Track Shell Cap', price: 46, mono: 'TS', c1: '#84CC16', c2: '#22C55E' },
  { id: 'vh4', name: 'Reflective Waist Pack', price: 68, mono: 'WP', c1: '#EC4899', c2: '#F43F5E' },
];

function SneakerSvg({ angle, cw }: { angle: string; cw: (typeof COLORWAYS)[number] }) {
  return (
    <svg viewBox="0 0 420 340" className="w-full h-full" role="img" aria-label={`Kinetic-01 Runner ${angle} in ${cw.name}`}>
      <defs>
        <linearGradient id={`volt-${angle}-${cw.id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={cw.primary} stopOpacity="0.22" />
          <stop offset="100%" stopColor={cw.secondary} stopOpacity="0.45" />
        </linearGradient>
      </defs>
      <rect width="420" height="340" fill={cw.bg} />
      <rect width="420" height="340" fill={`url(#volt-${angle}-${cw.id})`} />
      {angle === 'Lateral' && (
        <g stroke="#111827" strokeWidth="3.5" strokeLinejoin="round">
          <path d="M55 235 L355 235 L370 210 L290 190 L225 118 L155 135 L125 182 L68 192 Z" fill={cw.primary} />
          <path d="M48 235 L368 235 L358 265 L58 265 Z" fill="#FFFFFF" />
          <path d="M135 202 L265 162 L285 182 L152 218 Z" fill={cw.secondary} />
        </g>
      )}
      {angle === 'Sole Plate' && (
        <g stroke="#111827" strokeWidth="3">
          <rect x="85" y="105" width="250" height="130" rx="60" fill={cw.secondary} />
          <line x1="130" y1="145" x2="290" y2="145" />
          <line x1="130" y1="170" x2="290" y2="170" />
          <line x1="130" y1="195" x2="290" y2="195" />
          <circle cx="155" cy="170" r="24" fill={cw.primary} />
        </g>
      )}
      {angle === 'Heel Pod' && (
        <g stroke="#111827" strokeWidth="3">
          <path d="M130 265 L145 100 L275 100 L290 265 Z" fill={cw.primary} />
          <rect x="175" y="125" width="70" height="110" rx="14" fill={cw.secondary} />
        </g>
      )}
      {angle === 'Box Art' && (
        <g stroke="#111827" strokeWidth="3">
          <rect x="80" y="75" width="260" height="190" fill="#FFFFFF" />
          <rect x="80" y="75" width="260" height="58" fill={cw.primary} />
          <circle cx="290" cy="215" r="32" fill={cw.secondary} />
        </g>
      )}
      <text x="24" y="42" fill="#111827" fontSize="18" fontWeight="800" fontFamily="Bricolage Grotesque, sans-serif">
        VH//01
      </text>
      <text x="396" y="316" textAnchor="end" fill="#111827" fontSize="12" fontWeight="700" fontFamily="Space Mono, monospace">
        {angle.toUpperCase()}
      </text>
    </svg>
  );
}

export function Shop3() {
  const [angle, setAngle] = useState(ANGLES[0]);
  const [colorway, setColorway] = useState(COLORWAYS[0]);
  const [size, setSize] = useState('US 9');
  const [qty, setQty] = useState(1);
  const [cart, setCart] = useState(0);
  const [openFaq, setOpenFaq] = useState('cushion');

  const price = 165;
  const oldPrice = 210;

  return (
    <div className="min-h-screen bg-white text-gray-950 font-jakarta">
      {/* Bold Colourful Header */}
      <header className="border-b-2 border-gray-950 bg-[#FEF08A]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
          <a href="#volt" className="font-bricolage text-2xl font-extrabold tracking-tight whitespace-nowrap shrink-0">
            VOLT &amp; HUE
          </a>
          <nav className="hidden md:flex items-center gap-6 text-sm font-bold" aria-label="Primary">
            <a href="#runners" className="hover:underline whitespace-nowrap shrink-0">Runners</a>
            <a href="#apparel" className="hover:underline whitespace-nowrap shrink-0">Track Kit</a>
            <a href="#packs" className="hover:underline whitespace-nowrap shrink-0">Carry</a>
            <a href="#drops" className="hover:underline whitespace-nowrap shrink-0">Archive</a>
          </nav>
          <button
            type="button"
            className="px-4 py-2 bg-gray-950 text-white text-xs font-bold rounded-md inline-flex items-center gap-2 whitespace-nowrap shrink-0 tabular-nums"
          >
            <ShoppingBag className="w-4 h-4 text-[#D9F99D]" />
            <span>BAG [{cart}]</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Top-Mounted Thumbnail Strip + Main Frame (7 cols) */}
          <section className="lg:col-span-7 space-y-4" aria-label="Product angles">
            <div className="grid grid-cols-4 gap-3">
              {ANGLES.map((a) => {
                const active = a === angle;
                return (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setAngle(a)}
                    aria-pressed={active}
                    className={`border-2 rounded-lg overflow-hidden transition-transform ${
                      active ? 'border-gray-950 -translate-y-0.5 shadow-[4px_4px_0_#111827]' : 'border-gray-300 hover:border-gray-950'
                    }`}
                  >
                    <div className="aspect-[5/4]">
                      <SneakerSvg angle={a} cw={colorway} />
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="border-2 border-gray-950 rounded-xl overflow-hidden shadow-[8px_8px_0_#111827]">
              <div className="aspect-[5/4]">
                <SneakerSvg angle={angle} cw={colorway} />
              </div>
            </div>
          </section>

          {/* Purchase Panel (5 cols) */}
          <section className="lg:col-span-5 border-2 border-gray-950 rounded-xl p-6 bg-white shadow-[8px_8px_0_#FF4D00] space-y-6" aria-label="Configure sneaker">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#FF4D00]">Drop 07 · Road Runner</span>
                <span className="px-2.5 py-0.5 bg-[#D9F99D] border border-gray-950 text-xs font-extrabold rounded-sm">
                  SALE -21%
                </span>
              </div>
              <h1 className="mt-2 font-bricolage text-4xl font-extrabold tracking-tight text-balance">
                Kinetic-01 Runner
              </h1>
              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-3xl font-extrabold tabular-nums">${price}</span>
                <span className="text-lg line-through text-gray-400 tabular-nums">${oldPrice}</span>
              </div>
            </div>

            {/* Colorway Picker */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider mb-2.5">
                Colorway: <span className="text-gray-600">{colorway.name}</span>
              </p>
              <div className="grid grid-cols-3 gap-2.5">
                {COLORWAYS.map((cw) => {
                  const active = cw.id === colorway.id;
                  return (
                    <button
                      key={cw.id}
                      type="button"
                      onClick={() => setColorway(cw)}
                      aria-pressed={active}
                      className={`p-2 rounded-lg border-2 flex items-center gap-2 text-xs font-bold transition-all ${
                        active ? 'border-gray-950 bg-gray-950 text-white' : 'border-gray-300 hover:border-gray-950'
                      }`}
                    >
                      <span className="w-5 h-5 rounded-sm border border-black shrink-0" style={{ backgroundColor: cw.primary }} />
                      <span className="truncate">{cw.name.split(' ')[1]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Size Picker */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider mb-2.5">Select Size</p>
              <div className="grid grid-cols-3 gap-2">
                {SIZES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    aria-pressed={size === s}
                    className={`py-2.5 text-xs font-bold rounded-lg border-2 transition-colors ${
                      size === s ? 'bg-[#FF4D00] text-white border-gray-950' : 'bg-white border-gray-300 hover:border-gray-950'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Stepper + CTA */}
            <div className="flex gap-3">
              <div className="flex items-center border-2 border-gray-950 rounded-lg">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="p-3 hover:bg-gray-100"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-9 text-center font-bold tabular-nums">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((q) => q + 1)}
                  aria-label="Increase quantity"
                  className="p-3 hover:bg-gray-100"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => setCart((c) => c + qty)}
                className="flex-1 py-3.5 px-5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-sm rounded-lg border-2 border-gray-950 shadow-[3px_3px_0_#111827] active:translate-y-0.5 transition-all whitespace-nowrap tabular-nums"
              >
                Add to Bag · ${price * qty}
              </button>
            </div>

            {/* Accordions */}
            <div className="border-t-2 border-gray-950 pt-2 divide-y divide-gray-200">
              {FAQS.map((f) => {
                const open = openFaq === f.id;
                return (
                  <div key={f.id}>
                    <button
                      type="button"
                      onClick={() => setOpenFaq(open ? '' : f.id)}
                      aria-expanded={open}
                      className="w-full py-3 flex items-center justify-between text-sm font-bold"
                    >
                      <span>{f.title}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
                    </button>
                    {open && <p className="pb-3 text-sm text-gray-600">{f.body}</p>}
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Reviews Strip */}
        <section className="mt-14 p-6 border-2 border-gray-950 rounded-xl bg-[#EFF6FF]" aria-label="Runner reviews">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
            <h2 className="font-bricolage text-2xl font-extrabold">Run Club Feedback</h2>
            <div className="flex items-center gap-1.5 font-bold text-sm">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className="w-4 h-4 fill-[#FF4D00] text-[#FF4D00]" />
              ))}
              <span className="ml-1.5 tabular-nums">4.8 (312 Runs Logged)</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { user: 'Tariq B.', pace: '4:05 /km', text: 'Snappy forefoot transition right out of the box—zero heel slip.' },
              { user: 'Maya L.', pace: '4:32 /km', text: 'Solar Tangerine pops in dusk traffic and the mesh drains fast.' },
              { user: 'Jonas P.', pace: '3:52 /km', text: 'Best sub-$200 tempo trainer this season.' },
            ].map((rev) => (
              <article key={rev.user} className="p-4 bg-white border-2 border-gray-950 rounded-lg">
                <p className="text-xs font-bold text-[#2563EB] mb-1">
                  {rev.user} · {rev.pace}
                </p>
                <p className="text-sm text-gray-800">{rev.text}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Related Drop Row */}
        <section className="mt-14" aria-label="Related gear">
          <h2 className="font-bricolage text-2xl font-extrabold mb-5">Pair With Your Kit</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {RELATED.map((item) => (
              <article key={item.id} className="border-2 border-gray-950 rounded-xl overflow-hidden bg-white hover:-translate-y-1 transition-transform">
                <div className="aspect-[4/3]">
                  <svg viewBox="0 0 320 240" className="w-full h-full" role="img" aria-label={item.name}>
                    <defs>
                      <linearGradient id={`vh-${item.id}`} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={item.c1} />
                        <stop offset="100%" stopColor={item.c2} />
                      </linearGradient>
                    </defs>
                    <rect width="320" height="240" fill={`url(#vh-${item.id})`} />
                    <circle cx="160" cy="120" r="48" fill="#FFFFFF" stroke="#111827" strokeWidth="3" />
                    <text x="160" y="130" textAnchor="middle" fill="#111827" fontSize="24" fontWeight="800" fontFamily="Bricolage Grotesque, sans-serif">
                      {item.mono}
                    </text>
                  </svg>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm">{item.name}</h3>
                    <p className="text-xs font-bold text-gray-600 tabular-nums">${item.price}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCart((c) => c + 1)}
                    className="px-3 py-1.5 bg-[#D9F99D] border-2 border-gray-950 text-xs font-extrabold rounded-md hover:bg-[#BEF264]"
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

export default Shop3;
