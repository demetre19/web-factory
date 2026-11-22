import React, { useState, useMemo } from 'react';
import { ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductItem {
  id: string;
  name: string;
  category: 'Lighting' | 'Seating' | 'Tables' | 'Objects';
  material: 'Oak' | 'Aluminum' | 'Stoneware';
  price: number;
  badge?: 'New' | 'Sale';
  mono: string;
  c1: string;
  c2: string;
}

const CATALOG: ProductItem[] = [
  { id: 'n1', name: 'Oslo Pendant Lamp', category: 'Lighting', material: 'Aluminum', price: 290, badge: 'New', mono: 'OP', c1: '#E2E8F0', c2: '#CBD5E1' },
  { id: 'n2', name: 'Fjord Lounge Chair', category: 'Seating', material: 'Oak', price: 1180, badge: 'Sale', mono: 'FL', c1: '#F1F5F9', c2: '#94A3B8' },
  { id: 'n3', name: 'Kvadrat Side Table', category: 'Tables', material: 'Oak', price: 460, mono: 'KS', c1: '#E5E7EB', c2: '#D1D5DB' },
  { id: 'n4', name: 'Taper Ceramic Vase', category: 'Objects', material: 'Stoneware', price: 95, badge: 'New', mono: 'TV', c1: '#F3F4F6', c2: '#CBD5E1' },
  { id: 'n5', name: 'Linear Desk Sconce', category: 'Lighting', material: 'Aluminum', price: 215, badge: 'Sale', mono: 'LD', c1: '#DBEAFE', c2: '#93C5FD' },
  { id: 'n6', name: 'Birch Bar Stool', category: 'Seating', material: 'Oak', price: 340, mono: 'BS', c1: '#F8FAFC', c2: '#CBD5E1' },
  { id: 'n7', name: 'Monolith Coffee Table', category: 'Tables', material: 'Stoneware', price: 890, badge: 'New', mono: 'MC', c1: '#E2E8F0', c2: '#94A3B8' },
  { id: 'n8', name: 'Fluted Desk Tray', category: 'Objects', material: 'Aluminum', price: 78, mono: 'FT', c1: '#F1F5F9', c2: '#CBD5E1' },
  { id: 'n9', name: 'Dome Floor Lamp', category: 'Lighting', material: 'Aluminum', price: 520, badge: 'Sale', mono: 'DF', c1: '#E0E7FF', c2: '#A5B4FC' },
];

export function Shop7() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('All');
  const [maxPrice, setMaxPrice] = useState<number>(1200);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');
  const [page, setPage] = useState(1);
  const [bag, setBag] = useState(1);

  const filtered = useMemo(() => {
    let list = CATALOG.filter((item) => {
      const catOk = selectedCategory === 'All' || item.category === selectedCategory;
      const matOk = selectedMaterial === 'All' || item.material === selectedMaterial;
      const priceOk = item.price <= maxPrice;
      return catOk && matOk && priceOk;
    });
    if (sortBy === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [selectedCategory, selectedMaterial, maxPrice, sortBy]);

  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-jakarta">
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
          <a href="#nordik" className="text-lg font-bold tracking-tight whitespace-nowrap shrink-0">
            Nordik Studio
          </a>
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-gray-600" aria-label="Primary">
            <a href="#catalog" className="text-gray-900 whitespace-nowrap shrink-0">Catalog</a>
            <a href="#lighting" className="hover:text-gray-900 whitespace-nowrap shrink-0">Lighting</a>
            <a href="#seating" className="hover:text-gray-900 whitespace-nowrap shrink-0">Seating</a>
            <a href="#trade" className="hover:text-gray-900 whitespace-nowrap shrink-0">Trade</a>
          </nav>
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-xs font-semibold rounded-md whitespace-nowrap shrink-0 tabular-nums"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Bag ({bag})</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-200 pb-6 mb-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-500">2026 Collection</p>
            <h1 className="text-3xl font-bold tracking-tight mt-1">Architectural Objects</h1>
          </div>
          <div className="flex items-center gap-3">
            <label htmlFor="nordik-sort" className="text-xs font-medium text-gray-600">
              Sort by
            </label>
            <select
              id="nordik-sort"
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as 'featured' | 'price-asc' | 'price-desc');
                setPage(1);
              }}
              className="border border-gray-300 rounded-md px-3 py-2 text-xs font-medium bg-white"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Filter Sidebar (3 cols) */}
          <aside className="lg:col-span-3 space-y-7 border-r-0 lg:border-r border-gray-200 lg:pr-6" aria-label="Filter catalog">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-3">Category</h2>
              <div className="space-y-1.5">
                {['All', 'Lighting', 'Seating', 'Tables', 'Objects'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat);
                      setPage(1);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      selectedCategory === cat ? 'bg-gray-900 text-white font-semibold' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-3">Material</h2>
              <div className="space-y-1.5">
                {['All', 'Oak', 'Aluminum', 'Stoneware'].map((mat) => (
                  <button
                    key={mat}
                    type="button"
                    onClick={() => {
                      setSelectedMaterial(mat);
                      setPage(1);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      selectedMaterial === mat ? 'bg-gray-100 text-gray-900 font-bold' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {mat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2">
                <label htmlFor="nordik-price">Max Price</label>
                <span className="tabular-nums text-gray-600">${maxPrice}</span>
              </div>
              <input
                id="nordik-price"
                type="range"
                min={100}
                max={1200}
                step={50}
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(Number(e.target.value));
                  setPage(1);
                }}
                className="w-full accent-gray-900"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedCategory('All');
                setSelectedMaterial('All');
                setMaxPrice(1200);
                setPage(1);
              }}
              className="text-xs font-semibold text-gray-500 hover:text-gray-900 underline"
            >
              Reset all filters
            </button>
          </aside>

          {/* 3-Col Product Grid (9 cols) */}
          <section className="lg:col-span-9" aria-label="Product results">
            <p className="text-xs text-gray-500 mb-4 tabular-nums">
              Showing {visible.length} of {filtered.length} objects
            </p>
            {visible.length === 0 ? (
              <div className="p-12 border border-dashed border-gray-300 rounded-lg text-center">
                <p className="text-sm font-semibold">No objects match those filters.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('All');
                    setSelectedMaterial('All');
                    setMaxPrice(1200);
                  }}
                  className="mt-3 px-4 py-2 bg-gray-900 text-white text-xs font-semibold rounded-md"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {visible.map((item) => (
                  <article
                    key={item.id}
                    className="group border border-gray-200 rounded-lg overflow-hidden bg-white hover:-translate-y-0.5 hover:shadow-md transition-all"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <svg viewBox="0 0 320 240" className="w-full h-full" role="img" aria-label={item.name}>
                        <defs>
                          <linearGradient id={`nord-${item.id}`} x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor={item.c1} />
                            <stop offset="100%" stopColor={item.c2} />
                          </linearGradient>
                        </defs>
                        <rect width="320" height="240" fill={`url(#nord-${item.id})`} />
                        <rect x="115" y="75" width="90" height="90" rx="8" fill="#FFFFFF" fillOpacity="0.65" />
                        <text x="160" y="128" textAnchor="middle" fill="#111827" fontSize="22" fontWeight="700">
                          {item.mono}
                        </text>
                      </svg>
                      {item.badge && (
                        <span
                          className={`absolute top-3 left-3 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider rounded-xs ${
                            item.badge === 'Sale' ? 'bg-rose-600 text-white' : 'bg-gray-900 text-white'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => setBag((b) => b + 1)}
                        className="absolute bottom-3 right-3 px-3 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded opacity-95 group-hover:bg-blue-600 transition-colors"
                      >
                        Quick Add
                      </button>
                    </div>
                    <div className="p-4 flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-gray-500">
                          {item.category} · {item.material}
                        </p>
                        <h3 className="text-sm font-semibold text-gray-900 mt-0.5">{item.name}</h3>
                      </div>
                      <p className="text-sm font-semibold tabular-nums text-gray-900">${item.price}</p>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* Pagination */}
            <nav aria-label="Pagination" className="mt-10 pt-6 border-t border-gray-200 flex items-center justify-between">
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold border border-gray-300 rounded-md disabled:opacity-40 hover:border-gray-900"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>
              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setPage(num)}
                    aria-current={num === safePage ? 'page' : undefined}
                    className={`w-8 h-8 text-xs font-semibold rounded-md tabular-nums ${
                      num === safePage ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold border border-gray-300 rounded-md disabled:opacity-40 hover:border-gray-900"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </nav>
          </section>
        </div>
      </main>
    </div>
  );
}

export default Shop7;
