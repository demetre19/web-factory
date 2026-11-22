import React, { useState } from 'react';
import { ChevronDown, Minus, Plus, ShoppingBag, Star } from 'lucide-react';

const PALETTES = [
  { id: 'camel', name: 'Warm Camel', swatch: '#B68D5B', bg1: '#EFE6D8', bg2: '#D7C1A3', ink: '#29221B' },
  { id: 'espresso', name: 'Espresso Wool', swatch: '#3B2820', bg1: '#4A342A', bg2: '#231712', ink: '#F7F3EC' },
  { id: 'ivory', name: 'Raw Ecru', swatch: '#EAE3D5', bg1: '#FAF7F0', bg2: '#E3D9C6', ink: '#1C1917' },
];

const SIZES = ['FR 34', 'FR 36', 'FR 38', 'FR 40', 'FR 42'];

const THUMBS = [
  { id: 'silhouette', label: 'Silhouette' },
  { id: 'lapel', label: 'Lapel Weave' },
  { id: 'belt', label: 'Waist Tie' },
  { id: 'monogram', label: 'Atelier Label' },
];

const DETAILS = [
  {
    id: 'fabric',
    title: 'Fabrication & Provenance',
    text: '100% double-faced Inner Mongolian cashmere (540gsm), hand-finished by master tailors in Lyon with horn buttons.',
  },
  {
    id: 'fit',
    title: 'Cut & Drape',
    text: 'Relaxed architectural raglan shoulder with an elongated calf-grazing hem. Take your true French size.',
  },
  {
    id: 'care',
    title: 'Preservation & Alterations',
    text: 'Complimentary first-year steaming and sleeve tailoring at any Maison Vespera salon. Specialist dry clean only.',
  },
];

const REVIEWS = [
  { name: 'Claire D.', city: 'Paris', quote: 'The weight of the double-faced cashmere falls cleanly without lining bulk.' },
  { name: 'Sloane K.', city: 'New York', quote: 'Warm Camel reads like sunlit travertine. Worth every penny at the archive price.' },
  { name: 'Yuki A.', city: 'Tokyo', quote: 'Horn buttons and hand-pick stitching feel genuinely heirloom grade.' },
];

const PAIRINGS = [
  { id: 'p1', name: 'Silk Foulard No. 9', price: 240, code: 'SF', c1: '#F3EAE0', c2: '#D9C2AD' },
  { id: 'p2', name: 'Calfskin Belt 28mm', price: 310, code: 'CB', c1: '#E5DDD3', c2: '#B5A28E' },
  { id: 'p3', name: 'Suede Opera Glove', price: 280, code: 'OG', c1: '#ECE5DC', c2: '#C7B6A2' },
];

function EditorialGarmentSvg({
  view,
  palette,
}: {
  view: string;
  palette: (typeof PALETTES)[number];
}) {
  return (
    <svg viewBox="0 0 480 560" className="w-full h-full" role="img" aria-label={`Le Manteau Solenne ${view} in ${palette.name}`}>
      <defs>
        <linearGradient id={`vesp-${view}-${palette.id}`} x1="0" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor={palette.bg1} />
          <stop offset="100%" stopColor={palette.bg2} />
        </linearGradient>
      </defs>
      <rect width="480" height="560" fill={`url(#vesp-${view}-${palette.id})`} />
      <rect x="28" y="28" width="424" height="504" fill="none" stroke={palette.ink} strokeOpacity="0.18" strokeWidth="1" />
      {view === 'silhouette' && (
        <g stroke={palette.ink} strokeWidth="1.75" fill="none">
          <path d="M185 110 L240 135 L295 110 L355 165 L335 450 L145 450 L125 165 Z" fill={palette.swatch} fillOpacity="0.22" />
          <line x1="240" y1="135" x2="240" y2="450" />
          <path d="M185 110 L225 185 L240 135 L255 185 L295 110" />
          <line x1="158" y1="275" x2="322" y2="275" strokeWidth="3" />
        </g>
      )}
      {view === 'lapel' && (
        <g stroke={palette.ink} strokeWidth="1.5" fill="none">
          <path d="M120 90 L240 310 L360 90" fill={palette.swatch} fillOpacity="0.2" />
          <path d="M160 90 L240 245 L320 90" />
          <circle cx="240" cy="340" r="14" fill={palette.ink} fillOpacity="0.7" />
          <circle cx="240" cy="400" r="14" fill={palette.ink} fillOpacity="0.7" />
        </g>
      )}
      {view === 'belt' && (
        <g stroke={palette.ink} strokeWidth="1.5" fill="none">
          <rect x="90" y="235" width="300" height="44" fill={palette.swatch} fillOpacity="0.35" />
          <path d="M210 235 L180 390 L225 390 L240 279 L255 390 L300 390 L270 235" fill={palette.swatch} fillOpacity="0.25" />
        </g>
      )}
      {view === 'monogram' && (
        <g>
          <rect x="130" y="190" width="220" height="160" fill="#FAF7F0" fillOpacity="0.65" stroke={palette.ink} strokeWidth="1" />
          <text x="240" y="268" textAnchor="middle" fill={palette.ink} fontSize="42" fontFamily="Cormorant Garamond, serif" fontStyle="italic">
            M·V
          </text>
          <text x="240" y="305" textAnchor="middle" fill={palette.ink} fillOpacity="0.7" fontSize="11" letterSpacing="4" fontFamily="DM Sans, sans-serif">
            LYON ATELIER
          </text>
        </g>
      )}
      <text x="48" y="64" fill={palette.ink} fillOpacity="0.65" fontSize="13" fontFamily="Cormorant Garamond, serif" letterSpacing="3">
        MAISON VESPERA
      </text>
      <text x="432" y="510" textAnchor="end" fill={palette.ink} fillOpacity="0.55" fontSize="11" fontFamily="DM Sans, sans-serif" letterSpacing="2">
        {view.toUpperCase()}
      </text>
    </svg>
  );
}

export function Shop2() {
  const [view, setView] = useState(THUMBS[0].id);
  const [palette, setPalette] = useState(PALETTES[0]);
  const [size, setSize] = useState('FR 36');
  const [qty, setQty] = useState(1);
  const [bag, setBag] = useState(1);
  const [added, setAdded] = useState(false);
  const [openSection, setOpenSection] = useState('fabric');

  const salePrice = 1480;
  const origPrice = 1850;

  return (
    <div className="min-h-screen bg-[#F7F4EF] text-[#1C1917] font-dm">
      {/* Luxury Editorial Header */}
      <header className="border-b border-[#E5DEC9]">
        <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between gap-8">
          <a href="#vespera" className="font-cormorant text-2xl font-semibold tracking-wide whitespace-nowrap shrink-0">
            Maison Vespera
          </a>
          <nav className="hidden md:flex items-center gap-8 text-xs uppercase tracking-[0.2em] text-[#57534E]" aria-label="Primary">
            <a href="#coats" className="hover:text-[#1C1917] whitespace-nowrap shrink-0">Outerwear</a>
            <a href="#knitwear" className="hover:text-[#1C1917] whitespace-nowrap shrink-0">Cashmere</a>
            <a href="#leather" className="hover:text-[#1C1917] whitespace-nowrap shrink-0">Leather</a>
            <a href="#atelier" className="hover:text-[#1C1917] whitespace-nowrap shrink-0">Atelier</a>
          </nav>
          <button
            type="button"
            className="text-xs uppercase tracking-[0.18em] font-medium inline-flex items-center gap-2 border border-[#1C1917] px-4 py-2 hover:bg-[#1C1917] hover:text-[#F7F4EF] transition-colors whitespace-nowrap shrink-0 tabular-nums"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Selection ({bag})</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Editorial Lookbook Media (7 cols) */}
          <section className="lg:col-span-7 space-y-4" aria-label="Lookbook gallery">
            <div className="aspect-[6/7] max-h-[620px] w-full overflow-hidden border border-[#E5DEC9]">
              <EditorialGarmentSvg view={view} palette={palette} />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {THUMBS.map((t) => {
                const active = view === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setView(t.id)}
                    aria-pressed={active}
                    className={`text-left border transition-colors ${
                      active ? 'border-[#1C1917]' : 'border-[#E5DEC9] hover:border-[#A8A29E]'
                    }`}
                  >
                    <div className="aspect-square overflow-hidden">
                      <EditorialGarmentSvg view={t.id} palette={palette} />
                    </div>
                    <span className="block px-2.5 py-2 text-[11px] uppercase tracking-widest text-[#57534E]">
                      {t.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Editorial Purchase Details (5 cols) */}
          <section className="lg:col-span-5 lg:sticky lg:top-8 space-y-7" aria-label="Product specification">
            <div className="border-b border-[#E5DEC9] pb-6">
              <p className="text-xs uppercase tracking-[0.22em] text-[#9A7B4F] mb-2">Autumn Archive · Edition 12</p>
              <h1 className="font-cormorant text-4xl font-semibold tracking-tight text-balance">
                Le Manteau Solenne
              </h1>
              <div className="mt-4 flex items-baseline gap-4">
                <span className="text-2xl font-medium tabular-nums">${salePrice.toLocaleString()}</span>
                <span className="text-base line-through text-[#A8A29E] tabular-nums">${origPrice.toLocaleString()}</span>
                <span className="text-[11px] uppercase tracking-[0.18em] px-2 py-0.5 bg-[#9A7B4F] text-white">
                  Archive Sale
                </span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-[#57534E]">
                Unlined double-faced cashmere trench cut with generous storm lapels and hand-rolled hems for effortless winter drape.
              </p>
            </div>

            {/* Colour Picker */}
            <div>
              <div className="flex justify-between text-xs uppercase tracking-widest mb-3">
                <span>Tone</span>
                <span className="text-[#57534E]">{palette.name}</span>
              </div>
              <div className="flex gap-3">
                {PALETTES.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPalette(p)}
                    aria-label={`Tone ${p.name}`}
                    aria-pressed={palette.id === p.id}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                      palette.id === p.id ? 'border-[#1C1917] scale-105 ring-2 ring-[#9A7B4F]/40' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: p.swatch }}
                  />
                ))}
              </div>
            </div>

            {/* Size Picker */}
            <div>
              <div className="flex justify-between text-xs uppercase tracking-widest mb-3">
                <span>French Sizing</span>
                <span className="text-[#57534E]">True to size</span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {SIZES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    aria-pressed={size === s}
                    className={`py-2.5 text-xs tracking-wider border transition-colors ${
                      size === s
                        ? 'bg-[#1C1917] text-[#F7F4EF] border-[#1C1917]'
                        : 'bg-transparent border-[#D6CFC2] text-[#44403C] hover:border-[#1C1917]'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Qty + Add CTA */}
            <div className="flex gap-3 pt-1">
              <div className="flex items-center border border-[#D6CFC2] bg-[#FAF8F4]">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="px-3 py-3 text-[#57534E] hover:text-[#1C1917]"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-9 text-center text-sm tabular-nums">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((q) => q + 1)}
                  aria-label="Increase quantity"
                  className="px-3 py-3 text-[#57534E] hover:text-[#1C1917]"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  setBag((b) => b + qty);
                  setAdded(true);
                  setTimeout(() => setAdded(false), 2000);
                }}
                className="flex-1 py-3.5 px-6 bg-[#1C1917] text-[#F7F4EF] text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#292524] transition-colors whitespace-nowrap"
              >
                {added ? 'Added to Selection' : `Acquire — $${(salePrice * qty).toLocaleString()}`}
              </button>
            </div>

            {/* Atelier Accordions */}
            <div className="border-t border-[#E5DEC9] divide-y divide-[#E5DEC9]">
              {DETAILS.map((d) => {
                const open = openSection === d.id;
                return (
                  <div key={d.id}>
                    <button
                      type="button"
                      onClick={() => setOpenSection(open ? '' : d.id)}
                      aria-expanded={open}
                      className="w-full py-4 flex items-center justify-between text-xs uppercase tracking-[0.18em] font-medium"
                    >
                      <span>{d.title}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
                    </button>
                    {open && <p className="pb-4 text-sm text-[#57534E] leading-relaxed">{d.text}</p>}
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Patron Reviews Strip */}
        <section className="mt-20 pt-12 border-t border-[#E5DEC9]" aria-label="Patron impressions">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <h2 className="font-cormorant text-3xl font-semibold">Patron Notes</h2>
            <div className="flex items-center gap-1.5 text-[#9A7B4F]">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
              <span className="ml-2 text-xs uppercase tracking-widest text-[#1C1917] tabular-nums">4.9 · 64 Clients</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {REVIEWS.map((r) => (
              <blockquote key={r.name} className="border-t border-[#D6CFC2] pt-4">
                <p className="font-cormorant text-xl italic text-[#1C1917] leading-snug">“{r.quote}”</p>
                <footer className="mt-3 text-xs uppercase tracking-widest text-[#78716C]">
                  {r.name} · {r.city}
                </footer>
              </blockquote>
            ))}
          </div>
        </section>

        {/* Curated Pairings Row */}
        <section className="mt-20 pt-12 border-t border-[#E5DEC9]" aria-label="Curated pairings">
          <h2 className="font-cormorant text-3xl font-semibold mb-8">Complementary Pieces</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PAIRINGS.map((p) => (
              <article key={p.id} className="group border border-[#E5DEC9] bg-[#FAF8F4] hover:-translate-y-0.5 transition-transform">
                <div className="aspect-[4/3] overflow-hidden">
                  <svg viewBox="0 0 360 270" className="w-full h-full" role="img" aria-label={p.name}>
                    <defs>
                      <linearGradient id={`pair-${p.id}`} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={p.c1} />
                        <stop offset="100%" stopColor={p.c2} />
                      </linearGradient>
                    </defs>
                    <rect width="360" height="270" fill={`url(#pair-${p.id})`} />
                    <circle cx="180" cy="135" r="52" fill="none" stroke="#1C1917" strokeOpacity="0.28" />
                    <text x="180" y="146" textAnchor="middle" fill="#1C1917" fontSize="28" fontFamily="Cormorant Garamond, serif">
                      {p.code}
                    </text>
                  </svg>
                </div>
                <div className="p-5 flex items-center justify-between">
                  <div>
                    <h3 className="font-cormorant text-xl font-semibold">{p.name}</h3>
                    <p className="text-xs text-[#78716C] tabular-nums mt-0.5">${p.price}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBag((b) => b + 1)}
                    className="text-xs uppercase tracking-widest border-b border-[#1C1917] pb-0.5 hover:text-[#9A7B4F] hover:border-[#9A7B4F]"
                  >
                    Add
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

export default Shop2;
