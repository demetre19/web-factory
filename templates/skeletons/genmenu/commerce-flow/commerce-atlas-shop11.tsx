import React, { useState, useMemo } from 'react';
import { ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';

interface CarryItem {
  id: string;
  name: string;
  group: 'Watches' | 'Bags' | 'Tools';
  price: number;
  badge?: 'New' | 'Sale';
  mono: string;
  c1: string;
  c2: string;
}

const CARRY: CarryItem[] = [
  { id: 'm1', name: 'Field Automatic 38mm', group: 'Watches', price: 480, badge: 'New', mono: 'FA', c1: '#E7E5E4', c2: '#A8A29E' },
  { id: 'm2', name: 'Waxed Canvas Weekender', group: 'Bags', price: 265, mono: 'WC', c1: '#D6D3D1', c2: '#78716C' },
  { id: 'm3', name: 'Titanium Pocket Pry', group: 'Tools', price: 68, badge: 'Sale', mono: 'TP', c1: '#ECFDF5', c2: '#A7F3D0' },
  { id: 'm4', name: 'Chronograph GMT', group: 'Watches', price: 620, mono: 'CG', c1: '#F5F5F4', c2: '#A8A29E' },
  { id: 'm5', name: 'Ballistic Commuter Pack', group: 'Bags', price: 225, badge: 'New', mono: 'BC', c1: '#E7E5E4', c2: '#D6D3D1' },
  { id: 'm6', name: 'Brass Mechanical Pen', group: 'Tools', price: 92, mono: 'BP', c1: '#FEF3C7', c2: '#FDE68A' },
  { id: 'm7', name: 'Dive Quartz 200M', group: 'Watches', price: 340, badge: 'Sale', mono: 'DQ', c1: '#E2E8F0', c2: '#94A3B8' },
  { id: 'm8', name: 'Leather Tech Pouch', group: 'Bags', price: 118, mono: 'LP', c1: '#F3EFEA', c2: '#C7B8A5' },
];

export function Shop11() {
  const [group, setGroup] = useState('All');
  const [onlyNew, setOnlyNew] = useState(false);
  const [sort, setSort] = useState<'curated' | 'low' | 'high'>('curated');
  const [page, setPage] = useState(1);
  const [bag, setBag] = useState(1);

  const filtered = useMemo(() => {
    let list = CARRY.filter((c) => {
      const gOk = group === 'All' || c.group === group;
      const nOk = !onlyNew || c.badge === 'New';
      return gOk && nOk;
    });
    if (sort === 'low') list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'high') list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [group, onlyNew, sort]);

  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const curPage = Math.min(page, totalPages);
  const visible = filtered.slice((curPage - 1) * pageSize, curPage * pageSize);

  return (
    <div className="min-h-screen bg-[#F5F5F4] text-stone-900 font-jakarta">
      <header className="border-b border-stone-300 bg-white">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
          <a href="#meridian" className="text-lg font-bold tracking-tight text-green-950 whitespace-nowrap shrink-0">
            Meridian Supply
          </a>
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600" aria-label="Primary">
            <a href="#watches" className="hover:text-stone-950 whitespace-nowrap shrink-0">Watches</a>
            <a href="#bags" className="hover:text-stone-950 whitespace-nowrap shrink-0">Carry</a>
            <a href="#tools" className="hover:text-stone-950 whitespace-nowrap shrink-0">Tools</a>
            <a href="#repair" className="hover:text-stone-950 whitespace-nowrap shrink-0">Workshop</a>
          </nav>
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-900 text-white text-xs font-semibold rounded-md whitespace-nowrap shrink-0 tabular-nums"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Kit ({bag})</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-green-900 font-semibold">Field Ready</p>
            <h1 className="text-3xl font-bold tracking-tight mt-1">Everyday Carry Archive</h1>
          </div>
          <div className="flex items-center gap-3">
            <label htmlFor="meridian-sort" className="text-xs font-semibold text-stone-600">
              Sort
            </label>
            <select
              id="meridian-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as 'curated' | 'low' | 'high')}
              className="border border-stone-300 rounded-md px-3 py-2 text-xs font-medium bg-white"
            >
              <option value="curated">Recommended</option>
              <option value="low">Price: Low to High</option>
              <option value="high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Flipped Split-Pane: Grid Left (9 cols), Filter Sidebar Right (3 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <section className="lg:col-span-9 order-2 lg:order-1" aria-label="Product grid">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {visible.map((item) => (
                <article key={item.id} className="group bg-white border border-stone-200 rounded-lg overflow-hidden hover:border-green-900 transition-colors">
                  <div className="relative aspect-[4/3]">
                    <svg viewBox="0 0 320 240" className="w-full h-full" role="img" aria-label={item.name}>
                      <defs>
                        <linearGradient id={`mer-${item.id}`} x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor={item.c1} />
                          <stop offset="100%" stopColor={item.c2} />
                        </linearGradient>
                      </defs>
                      <rect width="320" height="240" fill={`url(#mer-${item.id})`} />
                      <circle cx="160" cy="120" r="42" fill="#FFFFFF" fillOpacity="0.6" stroke="#1C1917" strokeOpacity="0.25" />
                      <text x="160" y="128" textAnchor="middle" fill="#1C1917" fontSize="20" fontWeight="700" fontFamily="IBM Plex Mono, monospace">
                        {item.mono}
                      </text>
                    </svg>
                    {item.badge && (
                      <span
                        className={`absolute top-3 left-3 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider rounded-xs ${
                          item.badge === 'Sale' ? 'bg-amber-700 text-white' : 'bg-green-900 text-white'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setBag((b) => b + 1)}
                      className="absolute bottom-3 right-3 px-3 py-1.5 bg-white/95 border border-stone-300 text-xs font-semibold rounded hover:bg-green-900 hover:text-white hover:border-green-900 transition-colors"
                    >
                      + Quick Add
                    </button>
                  </div>
                  <div className="p-4 flex items-baseline justify-between gap-2">
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-stone-500">{item.group}</p>
                      <h2 className="text-sm font-semibold mt-0.5">{item.name}</h2>
                    </div>
                    <span className="text-sm font-semibold tabular-nums">${item.price}</span>
                  </div>
                </article>
              ))}
            </div>

            <nav aria-label="Pagination" className="mt-8 pt-5 border-t border-stone-300 flex items-center justify-between">
              <button
                type="button"
                disabled={curPage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-stone-300 rounded text-xs font-semibold disabled:opacity-40"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>
              <span className="text-xs font-medium text-stone-600 tabular-nums">
                Page {curPage} of {totalPages}
              </span>
              <button
                type="button"
                disabled={curPage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-stone-300 rounded text-xs font-semibold disabled:opacity-40"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </nav>
          </section>

          {/* Right Filter Sidebar (3 cols) */}
          <aside className="lg:col-span-3 order-1 lg:order-2 bg-white border border-stone-200 rounded-lg p-5 space-y-6" aria-label="Right filter sidebar">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900 mb-3">Collection</h2>
              <div className="space-y-1.5">
                {['All', 'Watches', 'Bags', 'Tools'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => {
                      setGroup(g);
                      setPage(1);
                    }}
                    className={`w-full text-left px-3 py-2 rounded text-xs font-semibold transition-colors ${
                      group === g ? 'bg-green-900 text-white' : 'text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-stone-200">
              <label className="flex items-center gap-2.5 text-xs font-medium text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyNew}
                  onChange={(e) => {
                    setOnlyNew(e.target.checked);
                    setPage(1);
                  }}
                  className="accent-green-900 w-4 h-4"
                />
                <span>New arrivals only</span>
              </label>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default Shop11;
