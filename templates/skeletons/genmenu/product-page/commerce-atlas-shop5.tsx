import React, { useState } from 'react';
import { ChevronDown, Minus, Plus, ShoppingBag, Star } from 'lucide-react';

const BOTANICAL_TONES = [
  { id: 'neroli', name: 'Neroli & Moss', hex: '#4D7C5F', c1: '#ECFDF5', c2: '#A7F3D0' },
  { id: 'hinoki', name: 'Hinoki Cedar', hex: '#854D0E', c1: '#FEF3C7', c2: '#FDE68A' },
  { id: 'unscented', name: 'Pure Unscented', hex: '#64748B', c1: '#F1F5F9', c2: '#CBD5E1' },
];

const VOLUMES = ['30 ml', '50 ml', '100 ml'];
const STAGES = ['Bottle', 'Dropper', 'Texture', 'Refill Pouch'];

const ACCORDIONS = [
  { id: 'actives', title: 'Active Botanicals & Ceramides', body: 'Bio-identical Ceramide NP (2.5%), cold-pressed sea buckthorn, squalane, and wild-harvested alpine moss extract.' },
  { id: 'ritual', title: 'Daily Application Ritual', body: 'Warm 3 drops between palms and press onto damp skin morning and evening before mineral SPF or night balm.' },
  { id: 'refill', title: 'Closed-Loop Refill Program', body: 'Every glass apothecary bottle accepts our home-compostable cellulose refill pods with 20% recurring savings.' },
];

const COMPLEMENTARY = [
  { id: 'sb1', name: 'Oat Milk Cleanser', price: 38, mono: 'OM', c1: '#F0FDF4', c2: '#BBF7D0' },
  { id: 'sb2', name: 'Mineral Mist 100ml', price: 44, mono: 'MM', c1: '#ECFDF5', c2: '#6EE7B7' },
  { id: 'sb3', name: 'Overnight Balm', price: 62, mono: 'OB', c1: '#F7FEE7', c2: '#BEF264' },
  { id: 'sb4', name: 'Stone Gua Sha', price: 48, mono: 'GS', c1: '#F1F5F9', c2: '#CBD5E1' },
];

function ElixirSvg({ stage, tone }: { stage: string; tone: (typeof BOTANICAL_TONES)[number] }) {
  return (
    <svg viewBox="0 0 640 360" className="w-full h-full" role="img" aria-label={`Ceramide Complex ${stage} ${tone.name}`}>
      <defs>
        <linearGradient id={`solis-${stage}-${tone.id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={tone.c1} />
          <stop offset="100%" stopColor={tone.c2} />
        </linearGradient>
      </defs>
      <rect width="640" height="360" fill={`url(#solis-${stage}-${tone.id})`} />
      {stage === 'Bottle' && (
        <g stroke="#1E3A2F" strokeWidth="2.5">
          <rect x="275" y="130" width="90" height="165" rx="14" fill={tone.hex} fillOpacity="0.88" />
          <rect x="295" y="90" width="50" height="40" fill="#1E3A2F" />
          <rect x="308" y="62" width="24" height="28" rx="10" fill="#1E3A2F" />
          <rect x="285" y="175" width="70" height="82" fill="#FFFFFF" fillOpacity="0.88" />
          <text x="320" y="220" textAnchor="middle" fill="#1E3A2F" fontSize="14" fontWeight="700" fontFamily="Plus Jakarta Sans, sans-serif">
            SOLIS
          </text>
        </g>
      )}
      {stage === 'Dropper' && (
        <g stroke="#1E3A2F" strokeWidth="2.5" fill="none">
          <line x1="320" y1="70" x2="320" y2="215" strokeWidth="6" />
          <circle cx="320" cy="258" r="24" fill={tone.hex} fillOpacity="0.7" />
        </g>
      )}
      {stage === 'Texture' && (
        <g>
          <circle cx="285" cy="180" r="68" fill={tone.hex} fillOpacity="0.3" />
          <circle cx="355" cy="180" r="54" fill="#FFFFFF" fillOpacity="0.75" stroke="#1E3A2F" strokeWidth="2" />
        </g>
      )}
      {stage === 'Refill Pouch' && (
        <g stroke="#1E3A2F" strokeWidth="2.5">
          <path d="M250 95 L390 95 L410 280 L230 280 Z" fill="#FFFFFF" fillOpacity="0.85" />
          <circle cx="320" cy="190" r="34" fill={tone.hex} fillOpacity="0.85" />
        </g>
      )}
      <text x="28" y="38" fill="#1E3A2F" fontSize="12" fontWeight="600" letterSpacing="2">
        SOLIS APOTHECARY · {stage.toUpperCase()}
      </text>
    </svg>
  );
}

export function Shop5() {
  const [stage, setStage] = useState(STAGES[0]);
  const [tone, setTone] = useState(BOTANICAL_TONES[0]);
  const [vol, setVol] = useState('50 ml');
  const [qty, setQty] = useState(1);
  const [bagCount, setBagCount] = useState(1);
  const [openId, setOpenId] = useState('actives');

  const volumeMultiplier = vol === '30 ml' ? 54 : vol === '50 ml' ? 76 : 118;
  const origPrice = Math.round(volumeMultiplier * 1.25);

  return (
    <div className="min-h-screen bg-[#F4F6F5] text-[#1E3A2F] font-jakarta">
      <header className="border-b border-emerald-950/10 bg-white">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
          <a href="#solis" className="text-lg font-bold tracking-tight whitespace-nowrap shrink-0">
            Solis Botanicals
          </a>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-emerald-900/70" aria-label="Primary">
            <a href="#serums" className="hover:text-emerald-950 whitespace-nowrap shrink-0">Elixirs</a>
            <a href="#cleansers" className="hover:text-emerald-950 whitespace-nowrap shrink-0">Cleansers</a>
            <a href="#refills" className="hover:text-emerald-950 whitespace-nowrap shrink-0">Refills</a>
            <a href="#formulary" className="hover:text-emerald-950 whitespace-nowrap shrink-0">Formulary</a>
          </nav>
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1E3A2F] text-white text-xs font-semibold rounded-md whitespace-nowrap shrink-0 tabular-nums"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Bag ({bagCount})</span>
          </button>
        </div>
      </header>

      {/* Single-Column Centered Topology */}
      <main className="max-w-4xl mx-auto px-6 py-10 space-y-12">
        {/* Centered Gallery Stage */}
        <section className="space-y-4" aria-label="Product gallery">
          <div className="aspect-[16/9] rounded-xl overflow-hidden border border-emerald-950/15 bg-white">
            <ElixirSvg stage={stage} tone={tone} />
          </div>
          <div className="grid grid-cols-4 gap-3">
            {STAGES.map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStage(st)}
                aria-pressed={stage === st}
                className={`rounded-lg overflow-hidden border transition-all ${
                  stage === st ? 'border-[#1E3A2F] ring-2 ring-[#4D7C5F]/30' : 'border-emerald-950/15 bg-white'
                }`}
              >
                <div className="aspect-[16/9]">
                  <ElixirSvg stage={st} tone={tone} />
                </div>
                <span className="block py-1.5 text-xs font-medium text-center">{st}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Centered Single-Column Purchase Module */}
        <section className="bg-white border border-emerald-950/15 rounded-xl p-6 sm:p-8 space-y-6" aria-label="Product configuration">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-emerald-950/10 pb-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#4D7C5F] font-semibold">Barrier Care · Cold-Pressed</p>
              <h1 className="text-3xl font-bold mt-1 text-balance">Ceramide Complex Elixir</h1>
              <p className="text-sm text-emerald-900/70 mt-2 max-w-xl">
                Concentrated lipid serum that restores compromised moisture barriers without silicones or essential oil sensitizers.
              </p>
            </div>
            <div className="sm:text-right shrink-0">
              <div className="flex sm:justify-end items-baseline gap-2.5">
                <span className="text-2xl font-bold tabular-nums">${volumeMultiplier}.00</span>
                <span className="text-sm line-through text-emerald-900/40 tabular-nums">${origPrice}.00</span>
              </div>
              <span className="inline-block mt-1 px-2 py-0.5 text-[11px] font-semibold bg-[#4D7C5F] text-white rounded-xs">
                Seasonal Offer
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Botanical Note / Colour */}
            <div>
              <p className="text-xs font-semibold mb-2.5">Botanical Blend · {tone.name}</p>
              <div className="flex gap-3">
                {BOTANICAL_TONES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTone(t)}
                    aria-label={`Select blend ${t.name}`}
                    aria-pressed={tone.id === t.id}
                    className={`px-3 py-2 rounded-md border text-xs font-medium flex items-center gap-2 ${
                      tone.id === t.id ? 'border-[#1E3A2F] bg-[#F4F6F5] font-semibold' : 'border-emerald-950/15'
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: t.hex }} />
                    <span>{t.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Volume / Size */}
            <div>
              <p className="text-xs font-semibold mb-2.5">Bottle Volume</p>
              <div className="grid grid-cols-3 gap-2">
                {VOLUMES.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setVol(v)}
                    aria-pressed={vol === v}
                    className={`py-2 text-xs font-semibold rounded-md border ${
                      vol === v ? 'bg-[#1E3A2F] text-white border-[#1E3A2F]' : 'border-emerald-950/15 hover:border-[#1E3A2F]'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Stepper + CTA */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <div className="inline-flex items-center justify-between sm:justify-start border border-emerald-950/20 rounded-md">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="p-3 hover:bg-emerald-50"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-10 text-center text-sm font-semibold tabular-nums">{qty}</span>
              <button
                type="button"
                onClick={() => setQty((q) => q + 1)}
                aria-label="Increase quantity"
                className="p-3 hover:bg-emerald-50"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => setBagCount((b) => b + qty)}
              className="flex-1 py-3 px-6 bg-[#1E3A2F] hover:bg-[#162C23] text-white text-sm font-semibold rounded-md transition-colors tabular-nums"
            >
              Add to Bag — ${(volumeMultiplier * qty).toFixed(2)}
            </button>
          </div>

          {/* Accordions */}
          <div className="border-t border-emerald-950/10 pt-2 divide-y divide-emerald-950/10">
            {ACCORDIONS.map((acc) => {
              const open = openId === acc.id;
              return (
                <div key={acc.id}>
                  <button
                    type="button"
                    onClick={() => setOpenId(open ? '' : acc.id)}
                    aria-expanded={open}
                    className="w-full py-3.5 flex items-center justify-between text-sm font-semibold text-left"
                  >
                    <span>{acc.title}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
                  </button>
                  {open && <p className="pb-4 text-sm text-emerald-900/75 leading-relaxed">{acc.body}</p>}
                </div>
              );
            })}
          </div>
        </section>

        {/* Reviews Strip */}
        <section aria-label="Customer reviews">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Skin Barrier Reviews</h2>
            <div className="flex items-center gap-1 text-[#4D7C5F] text-xs font-semibold">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-current" />
              ))}
              <span className="ml-1.5 text-[#1E3A2F] tabular-nums">4.9 · 214 reviews</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: 'Hannah G.', type: 'Dry / Sensitive', text: 'Calmed winter flaking within four nights without feeling heavy under sunscreen.' },
              { name: 'Priya S.', type: 'Combination', text: 'Unscented 50ml lasted three months with daily use.' },
              { name: 'Lucas V.', type: 'Post-Retinoid', text: 'Zero sting on compromised skin; love the glass dropper.' },
            ].map((rev) => (
              <article key={rev.name} className="p-4 bg-white border border-emerald-950/10 rounded-lg">
                <p className="text-xs font-semibold text-[#4D7C5F] mb-1">
                  {rev.name} · {rev.type}
                </p>
                <p className="text-sm text-emerald-950/80">{rev.text}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Related Row */}
        <section aria-label="Related apothecary items">
          <h2 className="text-lg font-bold mb-4">Pair With</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {COMPLEMENTARY.map((item) => (
              <article key={item.id} className="bg-white border border-emerald-950/10 rounded-lg overflow-hidden">
                <div className="aspect-[4/3]">
                  <svg viewBox="0 0 280 210" className="w-full h-full" role="img" aria-label={item.name}>
                    <defs>
                      <linearGradient id={`sol-${item.id}`} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={item.c1} />
                        <stop offset="100%" stopColor={item.c2} />
                      </linearGradient>
                    </defs>
                    <rect width="280" height="210" fill={`url(#sol-${item.id})`} />
                    <circle cx="140" cy="105" r="38" fill="#FFFFFF" fillOpacity="0.7" />
                    <text x="140" y="113" textAnchor="middle" fill="#1E3A2F" fontSize="18" fontWeight="700">
                      {item.mono}
                    </text>
                  </svg>
                </div>
                <div className="p-3.5 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-semibold">{item.name}</h3>
                    <p className="text-xs text-emerald-900/60 tabular-nums">${item.price}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBagCount((b) => b + 1)}
                    className="text-xs font-semibold text-[#4D7C5F] hover:underline"
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

export default Shop5;
