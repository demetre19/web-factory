import React, { useState } from 'react';
import { ChevronDown, Minus, Plus, ShoppingBag, Star, Check, ArrowRight } from 'lucide-react';

interface ColorOption {
  id: string;
  name: string;
  hex: string;
  gradientFrom: string;
  gradientTo: string;
}

const COLORS: ColorOption[] = [
  { id: 'slate', name: 'Anodized Slate', hex: '#334155', gradientFrom: '#E2E8F0', gradientTo: '#94A3B8' },
  { id: 'cobalt', name: 'Cobalt Oxide', hex: '#2563EB', gradientFrom: '#DBEAFE', gradientTo: '#60A5FA' },
  { id: 'chalk', name: 'Matte Chalk', hex: '#E5E7EB', gradientFrom: '#F8FAFC', gradientTo: '#CBD5E1' },
  { id: 'graphite', name: 'Deep Graphite', hex: '#0F172A', gradientFrom: '#334155', gradientTo: '#0F172A' },
];

const SIZES = ['Compact 38cm', 'Standard 46cm', 'Studio 56cm'];

const VIEWS = [
  { id: 'profile', label: 'Elevation', code: 'A04-1' },
  { id: 'detail', label: 'Joint Detail', code: 'A04-2' },
  { id: 'overhead', label: 'Diffuser', code: 'A04-3' },
  { id: 'package', label: 'Packaging', code: 'A04-4' },
];

const ACCORDIONS = [
  {
    id: 'materials',
    title: 'Materials & Machining',
    body: 'CNC-milled 6061 aerospace aluminum arm with brass friction hinge, weighted cast-iron base, and optical-grade polycarbonate diffuser.',
  },
  {
    id: 'optics',
    title: 'Optical Output & Dimming',
    body: '97 CRI full-spectrum LED array (2700K–4500K stepless rotary dimmer), 920 lumens peak output, flicker-free constant current driver.',
  },
  {
    id: 'shipping',
    title: 'Dispatch & 5-Year Warranty',
    body: 'Ships within 24 hours from Copenhagen or Portland. Covered by a 5-year mechanical and driver warranty with 30-day home trial.',
  },
];

const REVIEWS = [
  { author: 'Henrik M.', role: 'Industrial Architect', rating: 5, text: 'Zero glare across dual monitors. The brass hinge holds every angle effortlessly.' },
  { author: 'Nadia T.', role: 'Studio Director', rating: 5, text: 'Weighted base takes minimal desk footprint and the 2700K setting feels warm at night.' },
  { author: 'Devon R.', role: 'Product Designer', rating: 4, text: 'Solid machined finish. Braided USB-C power cord is a thoughtful detail.' },
];

const RELATED = [
  { id: 'r1', name: 'Kanso Tray 02', category: 'Desk Storage', price: 85, monogram: 'KT', from: '#E2E8F0', to: '#CBD5E1' },
  { id: 'r2', name: 'Brushed Steel Rule', category: 'Drafting', price: 42, monogram: 'SR', from: '#DBEAFE', to: '#93C5FD' },
  { id: 'r3', name: 'Monolith Pen Rest', category: 'Brassware', price: 64, monogram: 'MP', from: '#F1F5F9', to: '#94A3B8' },
  { id: 'r4', name: 'Diffuser Desk Pad', category: 'Merino Felt', price: 110, monogram: 'DP', from: '#E0E7FF', to: '#A5B4FC' },
];

function ProductArtwork({
  viewId,
  color,
  size = 'lg',
}: {
  viewId: string;
  color: ColorOption;
  size?: 'sm' | 'lg';
}) {
  const isDark = color.id === 'graphite';
  const strokeColor = isDark ? '#F8FAFC' : '#0F172A';
  const accentFill = color.hex;

  return (
    <svg
      viewBox="0 0 400 400"
      className="w-full h-full"
      role="img"
      aria-label={`Arc-04 Task Lamp ${viewId} in ${color.name}`}
    >
      <defs>
        <linearGradient id={`kanso-bg-${viewId}-${color.id}-${size}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={color.gradientFrom} />
          <stop offset="100%" stopColor={color.gradientTo} />
        </linearGradient>
      </defs>
      <rect width="400" height="400" fill={`url(#kanso-bg-${viewId}-${color.id}-${size})`} />
      <rect x="24" y="24" width="352" height="352" fill="none" stroke={strokeColor} strokeOpacity="0.12" strokeWidth="1" />
      {viewId === 'profile' && (
        <g stroke={strokeColor} strokeWidth="3" fill="none" strokeLinecap="round">
          <ellipse cx="200" cy="316" rx="74" ry="14" fill={accentFill} fillOpacity="0.85" />
          <line x1="175" y1="312" x2="145" y2="155" />
          <circle cx="145" cy="155" r="9" fill="#FFFFFF" />
          <line x1="145" y1="155" x2="262" y2="112" />
          <path d="M238 96 L296 124 L276 146 L232 120 Z" fill={accentFill} />
          <line x1="252" y1="138" x2="262" y2="205" strokeOpacity="0.25" strokeDasharray="4 6" />
        </g>
      )}
      {viewId === 'detail' && (
        <g stroke={strokeColor} strokeWidth="2.5" fill="none">
          <circle cx="200" cy="200" r="88" fill={accentFill} fillOpacity="0.18" />
          <circle cx="200" cy="200" r="46" fill={accentFill} />
          <circle cx="200" cy="200" r="14" fill="#FFFFFF" />
          <line x1="112" y1="200" x2="288" y2="200" strokeOpacity="0.35" />
          <line x1="200" y1="112" x2="200" y2="288" strokeOpacity="0.35" />
        </g>
      )}
      {viewId === 'overhead' && (
        <g>
          <circle cx="200" cy="200" r="105" fill={accentFill} fillOpacity="0.9" stroke={strokeColor} strokeWidth="2" />
          <circle cx="200" cy="200" r="64" fill="#FFFFFF" fillOpacity="0.85" />
          <circle cx="200" cy="200" r="24" fill={strokeColor} fillOpacity="0.12" />
        </g>
      )}
      {viewId === 'package' && (
        <g stroke={strokeColor} strokeWidth="2" fill="none">
          <rect x="95" y="105" width="210" height="190" fill="#FFFFFF" fillOpacity="0.55" />
          <line x1="95" y1="155" x2="305" y2="155" />
          <rect x="135" y="185" width="130" height="70" fill={accentFill} fillOpacity="0.25" />
        </g>
      )}
      <text
        x="42"
        y="58"
        fill={strokeColor}
        fillOpacity="0.65"
        fontSize="14"
        fontFamily="IBM Plex Mono, monospace"
        fontWeight="600"
        letterSpacing="2"
      >
        KO—04
      </text>
      <text
        x="358"
        y="364"
        textAnchor="end"
        fill={strokeColor}
        fillOpacity="0.5"
        fontSize="12"
        fontFamily="IBM Plex Mono, monospace"
      >
        {viewId.toUpperCase()}
      </text>
    </svg>
  );
}

export function Shop1() {
  const [activeView, setActiveView] = useState(VIEWS[0].id);
  const [selectedColor, setSelectedColor] = useState(COLORS[1]);
  const [selectedSize, setSelectedSize] = useState(SIZES[1]);
  const [quantity, setQuantity] = useState(1);
  const [cartCount, setCartCount] = useState(2);
  const [addedBanner, setAddedBanner] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string>('materials');

  const unitPrice = 248;
  const comparePrice = 310;

  const handleAdd = () => {
    setCartCount((c) => c + quantity);
    setAddedBanner(true);
    setTimeout(() => setAddedBanner(false), 2200);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 font-jakarta">
      {/* Top Bar */}
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
          <a href="#kanso" className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0">
            Kanso Objects
          </a>
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600" aria-label="Primary">
            <a href="#lighting" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">Lighting</a>
            <a href="#desk" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">Desk Tools</a>
            <a href="#seating" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">Seating</a>
            <a href="#journal" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">Journal</a>
          </nav>
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-md hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 tabular-nums"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Bag ({cartCount})</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 mb-6">
          <span>Lighting</span>
          <span aria-hidden="true">/</span>
          <span>Task Lamps</span>
          <span aria-hidden="true">/</span>
          <span className="text-slate-900 font-medium">Arc-04 Task Lamp</span>
        </nav>

        {/* Split-Pane PDP */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Gallery (7 cols) */}
          <section className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4" aria-label="Product gallery">
            <div className="flex sm:flex-col gap-3 sm:w-20 shrink-0">
              {VIEWS.map((view) => {
                const active = activeView === view.id;
                return (
                  <button
                    key={view.id}
                    type="button"
                    onClick={() => setActiveView(view.id)}
                    aria-label={`View ${view.label}`}
                    aria-pressed={active}
                    className={`aspect-square w-16 sm:w-20 rounded-md overflow-hidden border transition-all ${
                      active ? 'border-blue-600 ring-2 ring-blue-600/20' : 'border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    <ProductArtwork viewId={view.id} color={selectedColor} size="sm" />
                  </button>
                );
              })}
            </div>
            <div className="flex-1 aspect-square rounded-lg overflow-hidden border border-slate-200 bg-white">
              <ProductArtwork viewId={activeView} color={selectedColor} size="lg" />
            </div>
          </section>

          {/* Right Purchase Column (5 cols) */}
          <section className="lg:col-span-5 lg:sticky lg:top-8 space-y-6" aria-label="Purchase configuration">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">Kanso Studio · Series 04</p>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 text-balance">Arc-04 Task Lamp</h1>
              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-2xl font-bold tabular-nums text-slate-900">${unitPrice}.00</span>
                <span className="text-base line-through tabular-nums text-slate-400">${comparePrice}.00</span>
                <span className="px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider bg-blue-600 text-white rounded-xs">
                  Save 20%
                </span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-600">
                Counter-balanced aluminum task lighting engineered for precision studio desks with a stepless warm-to-daylight rotary dial.
              </p>
            </div>

            {/* Colour Variant Picker */}
            <div>
              <div className="flex items-center justify-between text-xs mb-2.5">
                <span className="font-semibold text-slate-800">Finish</span>
                <span className="text-slate-500">{selectedColor.name}</span>
              </div>
              <div className="flex items-center gap-3">
                {COLORS.map((color) => {
                  const active = color.id === selectedColor.id;
                  return (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      aria-label={`Select finish ${color.name}`}
                      aria-pressed={active}
                      className={`w-9 h-9 rounded-md border flex items-center justify-center transition-transform ${
                        active ? 'border-slate-900 ring-2 ring-blue-600 scale-105' : 'border-slate-300 hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.hex }}
                    >
                      {active && <Check className={`w-4 h-4 ${color.id === 'chalk' ? 'text-slate-900' : 'text-white'}`} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Size Variant Picker */}
            <div>
              <div className="flex items-center justify-between text-xs mb-2.5">
                <span className="font-semibold text-slate-800">Arm Reach</span>
                <span className="text-slate-500 font-plex-mono">In stock · Ships today</span>
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {SIZES.map((sz) => {
                  const active = sz === selectedSize;
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSelectedSize(sz)}
                      aria-pressed={active}
                      className={`py-2.5 px-2 text-xs font-medium rounded-md border transition-colors whitespace-nowrap ${
                        active
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Stepper + Add to Cart */}
            <div className="flex items-center gap-3 pt-1">
              <div className="inline-flex items-center border border-slate-300 rounded-md bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="p-3 text-slate-600 hover:text-slate-900 disabled:opacity-40"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center text-sm font-semibold tabular-nums" aria-live="polite">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Increase quantity"
                  className="p-3 text-slate-600 hover:text-slate-900"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button
                type="button"
                onClick={handleAdd}
                className="flex-1 py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-md transition-colors flex items-center justify-center gap-2 whitespace-nowrap tabular-nums"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{addedBanner ? 'Added to Bag' : `Add to Cart — $${unitPrice * quantity}.00`}</span>
              </button>
            </div>

            {/* Accordion Details */}
            <div className="border-t border-slate-200 pt-2 divide-y divide-slate-200">
              {ACCORDIONS.map((item) => {
                const open = openAccordion === item.id;
                return (
                  <div key={item.id}>
                    <button
                      type="button"
                      onClick={() => setOpenAccordion(open ? '' : item.id)}
                      aria-expanded={open}
                      className="w-full py-3.5 flex items-center justify-between text-left text-sm font-semibold text-slate-900 hover:text-blue-600 transition-colors"
                    >
                      <span>{item.title}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
                    </button>
                    {open && <p className="pb-4 text-sm text-slate-600 leading-relaxed">{item.body}</p>}
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Reviews Strip */}
        <section className="mt-16 pt-10 border-t border-slate-200" aria-label="Customer reviews">
          <div className="flex flex-wrap items-baseline justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Verified Studio Reviews</h2>
              <p className="text-xs text-slate-500 mt-1">4.9 out of 5 average · 148 verified owners</p>
            </div>
            <div className="flex items-center gap-1 text-blue-600">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
              <span className="ml-2 text-sm font-semibold text-slate-900 tabular-nums">4.9 / 5.0</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {REVIEWS.map((rev) => (
              <article key={rev.author} className="p-5 bg-white border border-slate-200 rounded-lg">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span className="font-semibold text-slate-900">{rev.author}</span>
                  <span>{rev.role}</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{rev.text}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Related Products Row */}
        <section className="mt-16 pt-10 border-t border-slate-200" aria-label="Related products">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Complete the Workspace</h2>
            <a href="#catalog" className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline">
              <span>View all objects</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {RELATED.map((item) => (
              <article key={item.id} className="group bg-white border border-slate-200 rounded-lg overflow-hidden hover:-translate-y-0.5 transition-transform">
                <div className="aspect-[4/3] overflow-hidden">
                  <svg viewBox="0 0 320 240" className="w-full h-full" role="img" aria-label={item.name}>
                    <defs>
                      <linearGradient id={`rel1-${item.id}`} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={item.from} />
                        <stop offset="100%" stopColor={item.to} />
                      </linearGradient>
                    </defs>
                    <rect width="320" height="240" fill={`url(#rel1-${item.id})`} />
                    <rect x="115" y="75" width="90" height="90" rx="10" fill="#FFFFFF" fillOpacity="0.45" stroke="#0F172A" strokeOpacity="0.2" />
                    <text x="160" y="128" textAnchor="middle" fill="#0F172A" fontSize="22" fontWeight="700" fontFamily="IBM Plex Mono, monospace">
                      {item.monogram}
                    </text>
                  </svg>
                </div>
                <div className="p-4 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-slate-500">{item.category}</p>
                    <h3 className="text-sm font-semibold text-slate-900 mt-0.5">{item.name}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold tabular-nums text-slate-900">${item.price}</p>
                    <button
                      type="button"
                      onClick={() => setCartCount((c) => c + 1)}
                      className="text-[11px] font-semibold text-blue-600 hover:underline mt-0.5"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Shop1;
