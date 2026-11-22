import React, { useState, useMemo } from 'react';
import { SlidersHorizontal, ShoppingBag, X } from 'lucide-react';

interface PopProduct {
  id: string;
  name: string;
  dept: 'Stationery' | 'Tabletop' | 'Lighting';
  price: number;
  badge?: 'New' | 'Sale';
  mono: string;
  c1: string;
  c2: string;
}

const POP_ITEMS: PopProduct[] = [
  { id: 'pp1', name: 'Cobalt Fountain Pen', dept: 'Stationery', price: 48, badge: 'New', mono: 'FP', c1: '#2563EB', c2: '#60A5FA' },
  { id: 'pp2', name: 'Checker Carafe Set', dept: 'Tabletop', price: 76, badge: 'Sale', mono: 'CC', c1: '#F43F5E', c2: '#FB7185' },
  { id: 'pp3', name: 'Squiggle Desk Lamp', dept: 'Lighting', price: 145, mono: 'SL', c1: '#FACC15', c2: '#FDE047' },
  { id: 'pp4', name: 'Grid Sketchbook A4', dept: 'Stationery', price: 24, mono: 'GS', c1: '#10B981', c2: '#6EE7B7' },
  { id: 'pp5', name: 'Enamel Espresso Duo', dept: 'Tabletop', price: 52, badge: 'New', mono: 'EE', c1: '#8B5CF6', c2: '#C4B5FD' },
  { id: 'pp6', name: 'Dome Clip Light', dept: 'Lighting', price: 88, badge: 'Sale', mono: 'DC', c1: '#F97316', c2: '#FDBA74' },
  { id: 'pp7', name: 'Acrylic Tape Cutter', dept: 'Stationery', price: 32, mono: 'TC', c1: '#EC4899', c2: '#F9A8D4' },
  { id: 'pp8', name: 'Terrazzo Serving Tray', dept: 'Tabletop', price: 64, mono: 'TT', c1: '#0EA5E9', c2: '#7DD3FC' },
];

export function Shop9() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dept, setDept] = useState<string>('All');
  const [sort, setSort] = useState<'popular' | 'asc' | 'desc'>('popular');
  const [page, setPage] = useState(1);
  const [bag, setBag] = useState(1);

  const filtered = useMemo(() => {
    let list = POP_ITEMS.filter((i) => dept === 'All' || i.dept === dept);
    if (sort === 'asc') list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'desc') list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [dept, sort]);

  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const curPage = Math.min(page, totalPages);
  const visible = filtered.slice((curPage - 1) * pageSize, curPage * pageSize);

  return (
    <div className="min-h-screen bg-[#FFFBEB] text-gray-950 font-jakarta relative">
      <header className="border-b-2 border-gray-950 bg-white">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
          <a href="#popstand" className="font-bricolage text-2xl font-extrabold tracking-tight text-blue-700 whitespace-nowrap shrink-0">
            POPSTAND
          </a>
          <nav className="hidden md:flex items-center gap-6 text-sm font-bold" aria-label="Primary">
            <a href="#new" className="hover:text-rose-600 whitespace-nowrap shrink-0">New In</a>
            <a href="#stationery" className="hover:text-rose-600 whitespace-nowrap shrink-0">Stationery</a>
            <a href="#tabletop" className="hover:text-rose-600 whitespace-nowrap shrink-0">Tabletop</a>
            <a href="#lighting" className="hover:text-rose-600 whitespace-nowrap shrink-0">Lighting</a>
          </nav>
          <button
            type="button"
            onClick={() => setBag((b) => b + 1)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500 text-white text-xs font-extrabold rounded-md border-2 border-gray-950 whitespace-nowrap shrink-0 tabular-nums"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Tote ({bag})</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Toolbar with Drawer Filter Trigger */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-950 rounded-lg text-xs font-extrabold shadow-[3px_3px_0_#111827] hover:bg-blue-50"
            >
              <SlidersHorizontal className="w-4 h-4 text-blue-700" />
              <span>Filter Drawer ({dept})</span>
            </button>
            <h1 className="font-bricolage text-2xl sm:text-3xl font-extrabold">Colourful Goods</h1>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="pop-sort" className="text-xs font-bold">
              Sort:
            </label>
            <select
              id="pop-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as 'popular' | 'asc' | 'desc')}
              className="border-2 border-gray-950 rounded-lg px-3 py-2 text-xs font-bold bg-white"
            >
              <option value="popular">Bestsellers</option>
              <option value="asc">Price: Low to High</option>
              <option value="desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visible.map((item) => (
            <article
              key={item.id}
              className="group bg-white border-2 border-gray-950 rounded-xl overflow-hidden shadow-[5px_5px_0_#111827] hover:-translate-y-1 transition-transform"
            >
              <div className="relative aspect-[4/3]">
                <svg viewBox="0 0 320 240" className="w-full h-full" role="img" aria-label={item.name}>
                  <defs>
                    <linearGradient id={`pop-${item.id}`} x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor={item.c1} />
                      <stop offset="100%" stopColor={item.c2} />
                    </linearGradient>
                  </defs>
                  <rect width="320" height="240" fill={`url(#pop-${item.id})`} />
                  <rect x="108" y="68" width="104" height="104" rx="22" fill="#FFFFFF" stroke="#111827" strokeWidth="3" />
                  <text x="160" y="130" textAnchor="middle" fill="#111827" fontSize="26" fontWeight="800" fontFamily="Bricolage Grotesque, sans-serif">
                    {item.mono}
                  </text>
                </svg>
                {item.badge && (
                  <span
                    className={`absolute top-3 left-3 px-2.5 py-0.5 border-2 border-gray-950 text-[11px] font-extrabold rounded-sm ${
                      item.badge === 'Sale' ? 'bg-rose-500 text-white' : 'bg-[#FEF08A] text-gray-950'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
              <div className="p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-blue-700">{item.dept}</p>
                  <h2 className="text-base font-extrabold mt-0.5">{item.name}</h2>
                  <p className="text-sm font-bold text-gray-700 tabular-nums mt-0.5">${item.price}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setBag((b) => b + 1)}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-lg border-2 border-gray-950 shrink-0"
                >
                  + Add
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* Pagination */}
        <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPage(p)}
              aria-current={p === curPage ? 'page' : undefined}
              className={`px-4 py-2 border-2 border-gray-950 rounded-lg text-xs font-extrabold tabular-nums ${
                p === curPage ? 'bg-gray-950 text-white' : 'bg-white hover:bg-amber-100'
              }`}
            >
              Page {p}
            </button>
          ))}
        </nav>
      </main>

      {/* Collapsible Filter Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 flex">
          <button
            type="button"
            aria-label="Close filter backdrop"
            onClick={() => setDrawerOpen(false)}
            className="flex-1 bg-black/40"
          />
          <aside
            className="w-80 bg-white border-l-2 border-gray-950 p-6 flex flex-col justify-between"
            aria-label="Filter drawer panel"
          >
            <div>
              <div className="flex items-center justify-between border-b-2 border-gray-950 pb-4 mb-6">
                <h2 className="font-bricolage text-xl font-extrabold">Filter Archive</h2>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close filter drawer"
                  className="p-1.5 rounded-md hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs font-bold uppercase tracking-wider mb-3">Department</p>
              <div className="space-y-2">
                {['All', 'Stationery', 'Tabletop', 'Lighting'].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      setDept(d);
                      setPage(1);
                      setDrawerOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 rounded-lg border-2 text-sm font-bold ${
                      dept === d ? 'bg-blue-600 text-white border-gray-950' : 'border-gray-200 hover:border-gray-950'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="w-full py-3 bg-gray-950 text-white text-xs font-extrabold rounded-lg"
            >
              Apply &amp; View ({filtered.length})
            </button>
          </aside>
        </div>
      )}
    </div>
  );
}

export default Shop9;
