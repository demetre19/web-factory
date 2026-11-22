import React, { useState } from 'react';
import { ChevronDown, Minus, Plus, ShoppingBag, Star } from 'lucide-react';

const FINISHES = [
  { id: 'obsidian', name: 'Bead-Blasted Obsidian', ring: '#F59E0B', c1: '#1E2430', c2: '#0B0D10' },
  { id: 'titanium', name: 'Raw Titanium', ring: '#94A3B8', c1: '#334155', c2: '#151921' },
  { id: 'bronze', name: 'Studio Bronze', ring: '#D97706', c1: '#452A1A', c2: '#120E0C' },
];

const IMPEDANCE = ['32 Ohm (Mobile)', '120 Ohm (Studio)', '300 Ohm (Reference)'];
const ANGLES = ['Acoustic Cup', 'Driver Array', 'Headband Yoke', 'Flight Case'];

const SPECS_ACCORDION = [
  { id: 'transducer', title: '104mm Planar Transducer', body: 'Ultra-thin 1.8-micron diaphragm suspended between dual neodymium N52 flux arrays for sub-0.1% THD at 100dB.' },
  { id: 'cable', title: 'Balanced Interconnects', body: 'Includes detachable 2.0m braided OFC copper cable with 4.4mm Pentaconn balanced plug and 6.35mm studio adapter.' },
  { id: 'warranty', title: 'Calibrated Unit Certificate', body: 'Every pair ships with an individualized frequency response plot and a 3-year laboratory driver warranty.' },
];

const RELATED_GEAR = [
  { id: 'na1', name: 'Class-A Desktop Amp', price: 640, code: 'A1' },
  { id: 'na2', name: '4.4mm Silver Cable', price: 145, code: 'SC' },
  { id: 'na3', name: 'Perforated Lamb Pads', price: 88, code: 'LP' },
  { id: 'na4', name: 'Machined Desk Stand', price: 115, code: 'DS' },
];

function HeadphoneSvg({ angle, finish }: { angle: string; finish: (typeof FINISHES)[number] }) {
  return (
    <svg viewBox="0 0 400 320" className="w-full h-full" role="img" aria-label={`Reference M90 ${angle} in ${finish.name}`}>
      <defs>
        <linearGradient id={`noc-${angle}-${finish.id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={finish.c1} />
          <stop offset="100%" stopColor={finish.c2} />
        </linearGradient>
      </defs>
      <rect width="400" height="320" fill={`url(#noc-${angle}-${finish.id})`} />
      <rect x="16" y="16" width="368" height="288" fill="none" stroke="#FFFFFF" strokeOpacity="0.08" />
      {angle === 'Acoustic Cup' && (
        <g>
          <path d="M115 170 C115 80, 285 80, 285 170" fill="none" stroke="#94A3B8" strokeWidth="10" strokeLinecap="round" />
          <ellipse cx="115" cy="195" rx="34" ry="52" fill="#0F172A" stroke={finish.ring} strokeWidth="2.5" />
          <ellipse cx="285" cy="195" rx="34" ry="52" fill="#0F172A" stroke={finish.ring} strokeWidth="2.5" />
        </g>
      )}
      {angle === 'Driver Array' && (
        <g>
          <circle cx="200" cy="160" r="88" fill="#0B0D10" stroke={finish.ring} strokeWidth="2" />
          {[140, 160, 180, 200, 220, 240, 260].map((x) => (
            <line key={x} x1={x} y1="90" x2={x} y2="230" stroke={finish.ring} strokeOpacity="0.55" strokeWidth="2" />
          ))}
        </g>
      )}
      {angle === 'Headband Yoke' && (
        <g fill="none" stroke={finish.ring} strokeWidth="3">
          <path d="M90 220 Q200 60 310 220" />
          <rect x="150" y="96" width="100" height="22" rx="6" fill="#1E293B" />
        </g>
      )}
      {angle === 'Flight Case' && (
        <g>
          <rect x="90" y="80" width="220" height="160" rx="14" fill="#151921" stroke={finish.ring} strokeWidth="2" />
          <line x1="90" y1="145" x2="310" y2="145" stroke="#475569" strokeWidth="2" />
          <rect x="175" y="135" width="50" height="20" rx="4" fill={finish.ring} />
        </g>
      )}
      <text x="28" y="42" fill="#F8FAFC" fillOpacity="0.6" fontSize="11" fontFamily="Space Mono, monospace">
        NA//M90
      </text>
      <text x="372" y="292" textAnchor="end" fill={finish.ring} fontSize="11" fontFamily="Space Mono, monospace">
        {angle.toUpperCase()}
      </text>
    </svg>
  );
}

export function Shop4() {
  const [activeAngle, setActiveAngle] = useState(ANGLES[0]);
  const [finish, setFinish] = useState(FINISHES[0]);
  const [ohm, setOhm] = useState(IMPEDANCE[1]);
  const [qty, setQty] = useState(1);
  const [bag, setBag] = useState(1);
  const [openAcc, setOpenAcc] = useState('transducer');

  const salePrice = 890;
  const retailPrice = 1090;

  return (
    <div className="min-h-screen bg-[#0B0D10] text-slate-100 font-manrope">
      <header className="border-b border-[#262C38] bg-[#0F1218]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
          <a href="#nocturne" className="font-archivo text-lg font-bold tracking-wider uppercase whitespace-nowrap shrink-0">
            Nocturne Acoustics
          </a>
          <nav className="hidden md:flex items-center gap-7 text-xs font-medium tracking-wider uppercase text-slate-400" aria-label="Primary">
            <a href="#monitors" className="hover:text-white whitespace-nowrap shrink-0">Headphones</a>
            <a href="#amps" className="hover:text-white whitespace-nowrap shrink-0">Amplification</a>
            <a href="#cables" className="hover:text-white whitespace-nowrap shrink-0">Cables</a>
            <a href="#labs" className="hover:text-white whitespace-nowrap shrink-0">Acoustics Lab</a>
          </nav>
          <button
            type="button"
            className="px-4 py-2 bg-[#151921] border border-[#262C38] hover:border-amber-500 text-xs font-space-mono rounded inline-flex items-center gap-2 whitespace-nowrap shrink-0 tabular-nums"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
            <span>CART ({bag})</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Dark 2x2 Grid Gallery + Primary Stage (7 cols) */}
          <section className="lg:col-span-7 space-y-4" aria-label="Hardware gallery">
            <div className="rounded-lg overflow-hidden border border-[#262C38] aspect-[5/4]">
              <HeadphoneSvg angle={activeAngle} finish={finish} />
            </div>
            <div className="grid grid-cols-4 gap-3">
              {ANGLES.map((ang) => {
                const selected = ang === activeAngle;
                return (
                  <button
                    key={ang}
                    type="button"
                    onClick={() => setActiveAngle(ang)}
                    aria-pressed={selected}
                    className={`rounded-md overflow-hidden border transition-all ${
                      selected ? 'border-amber-500 ring-1 ring-amber-500' : 'border-[#262C38] hover:border-slate-500'
                    }`}
                  >
                    <div className="aspect-[5/4]">
                      <HeadphoneSvg angle={ang} finish={finish} />
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Dark Technical Purchase Console (5 cols) */}
          <section className="lg:col-span-5 bg-[#151921] border border-[#262C38] rounded-lg p-6 space-y-6" aria-label="Purchase console">
            <div>
              <p className="font-space-mono text-xs text-amber-400 tracking-wider">OPEN-BACK PLANAR · FLAGSHIP</p>
              <h1 className="mt-2 font-archivo text-3xl font-bold tracking-tight text-white">Reference M90</h1>
              <div className="mt-3 flex items-baseline gap-3">
                <span className="font-space-mono text-2xl font-bold text-white tabular-nums">${salePrice}</span>
                <span className="font-space-mono text-sm line-through text-slate-500 tabular-nums">${retailPrice}</span>
                <span className="px-2 py-0.5 text-[11px] font-space-mono bg-amber-500 text-black font-bold rounded-xs">
                  STUDIO SALE
                </span>
              </div>
              <p className="mt-4 text-sm text-slate-300 leading-relaxed">
                Mastering-grade planar magnetic monitor delivering ruler-flat sub-bass extension down to 10Hz and effortless transient speed.
              </p>
            </div>

            {/* Finish Swatch Picker */}
            <div>
              <div className="flex justify-between text-xs mb-2.5">
                <span className="text-slate-300 font-semibold">Chassis Finish</span>
                <span className="font-space-mono text-slate-400">{finish.name}</span>
              </div>
              <div className="flex gap-3">
                {FINISHES.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFinish(f)}
                    aria-label={`Chassis ${f.name}`}
                    aria-pressed={finish.id === f.id}
                    className={`w-10 h-10 rounded border flex items-center justify-center ${
                      finish.id === f.id ? 'border-amber-400 ring-2 ring-amber-400/30' : 'border-[#262C38]'
                    }`}
                    style={{ backgroundColor: f.c1 }}
                  >
                    <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: f.ring }} />
                  </button>
                ))}
              </div>
            </div>

            {/* Impedance Variant */}
            <div>
              <p className="text-xs font-semibold text-slate-300 mb-2.5">Driver Impedance</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {IMPEDANCE.map((imp) => (
                  <button
                    key={imp}
                    type="button"
                    onClick={() => setOhm(imp)}
                    aria-pressed={ohm === imp}
                    className={`py-2.5 px-2 text-xs font-space-mono rounded border transition-colors ${
                      ohm === imp
                        ? 'bg-amber-500 text-black font-bold border-amber-500'
                        : 'bg-[#0B0D10] text-slate-300 border-[#262C38] hover:border-slate-500'
                    }`}
                  >
                    {imp}
                  </button>
                ))}
              </div>
            </div>

            {/* Stepper + CTA */}
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-[#262C38] bg-[#0B0D10] rounded">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="p-3 text-slate-400 hover:text-white"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-9 text-center font-space-mono text-sm tabular-nums">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((q) => q + 1)}
                  aria-label="Increase quantity"
                  className="p-3 text-slate-400 hover:text-white"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => setBag((b) => b + qty)}
                className="flex-1 py-3 px-5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm rounded transition-colors whitespace-nowrap tabular-nums"
              >
                Add to Cart · ${salePrice * qty}
              </button>
            </div>

            {/* Accordions */}
            <div className="border-t border-[#262C38] divide-y divide-[#262C38]">
              {SPECS_ACCORDION.map((acc) => {
                const open = openAcc === acc.id;
                return (
                  <div key={acc.id}>
                    <button
                      type="button"
                      onClick={() => setOpenAcc(open ? '' : acc.id)}
                      aria-expanded={open}
                      className="w-full py-3.5 flex items-center justify-between text-xs font-space-mono uppercase tracking-wider text-slate-200"
                    >
                      <span>{acc.title}</span>
                      <ChevronDown className={`w-4 h-4 text-amber-400 transition-transform ${open ? 'rotate-180' : ''}`} />
                    </button>
                    {open && <p className="pb-4 text-sm text-slate-400 leading-relaxed">{acc.body}</p>}
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Acoustic Reviews Strip */}
        <section className="mt-14 pt-10 border-t border-[#262C38]" aria-label="Engineer reviews">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h2 className="font-archivo text-xl font-bold">Mastering Engineer Reports</h2>
            <div className="flex items-center gap-1.5 text-amber-400 font-space-mono text-xs">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
              <span className="ml-2 text-slate-200 tabular-nums">4.9 / 5.0 · 92 Units</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { who: 'E. Lindqvist', studio: 'Nordic Mastering', note: 'Translated low-end reverb tails to club PA systems with uncanny accuracy.' },
              { who: 'K. Watanabe', studio: 'Koto Sound Lab', note: 'Zero ear fatigue after 7-hour mixing blocks thanks to lambskin suspension.' },
              { who: 'R. Vance', studio: 'Signal Post', note: '300-ohm pairing with tube OTL amps opens up extraordinary depth.' },
            ].map((item) => (
              <article key={item.who} className="p-5 bg-[#151921] border border-[#262C38] rounded-lg">
                <p className="font-space-mono text-xs text-amber-400 mb-2">
                  {item.who} · {item.studio}
                </p>
                <p className="text-sm text-slate-300 leading-relaxed">{item.note}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Related Studio Gear */}
        <section className="mt-14 pt-10 border-t border-[#262C38]" aria-label="Related studio gear">
          <h2 className="font-archivo text-xl font-bold mb-6">Signal Chain Pairings</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {RELATED_GEAR.map((g) => (
              <article key={g.id} className="bg-[#151921] border border-[#262C38] rounded-lg overflow-hidden hover:border-amber-500/60 transition-colors">
                <div className="aspect-[4/3]">
                  <svg viewBox="0 0 320 240" className="w-full h-full" role="img" aria-label={g.name}>
                    <rect width="320" height="240" fill="#0F1218" />
                    <circle cx="160" cy="120" r="46" fill="#151921" stroke="#F59E0B" strokeOpacity="0.6" strokeWidth="2" />
                    <text x="160" y="128" textAnchor="middle" fill="#F8FAFC" fontSize="22" fontFamily="Space Mono, monospace">
                      {g.code}
                    </text>
                  </svg>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white">{g.name}</h3>
                    <p className="font-space-mono text-xs text-slate-400 tabular-nums mt-0.5">${g.price}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBag((b) => b + 1)}
                    className="px-2.5 py-1 text-xs font-space-mono border border-amber-500/50 text-amber-400 hover:bg-amber-500 hover:text-black rounded"
                  >
                    + ADD
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

export default Shop4;
