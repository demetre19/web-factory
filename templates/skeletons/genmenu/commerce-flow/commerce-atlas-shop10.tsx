import React, { useState, useMemo } from 'react';
import { ShoppingBag, ChevronDown } from 'lucide-react';

interface FragranceItem {
  id: string;
  name: string;
  family: 'Woody' | 'Floral' | 'Citrus';
  notes: string;
  price: number;
  badge?: 'New' | 'Sale';
  mono: string;
  c1: string;
  c2: string;
}

const FRAGRANCES: FragranceItem[] = [
  { id: 'gv1', name: 'Iris & Vetiver Eau de Parfum', family: 'Woody', notes: 'Orris Root · Smoked Cedar', price: 215, badge: 'New', mono: 'IV', c1: '#F2E9E4', c2: '#C9ADA7' },
  { id: 'gv2', name: 'Néroli Blanc Decanter', family: 'Citrus', notes: 'Bitter Orange · Sea Salt', price: 180, badge: 'Sale', mono: 'NB', c1: '#F7EFE5', c2: '#E2C6A6' },
  { id: 'gv3', name: 'Rose de Mai Extrait', family: 'Floral', notes: 'Centifolia · Pink Pepper', price: 260, mono: 'RM', c1: '#F5E6E8', c2: '#D5B0B6' },
  { id: 'gv4', name: 'Figue & Santal 100ml', family: 'Woody', notes: 'Green Fig · Mysore Sandalwood', price: 230, mono: 'FS', c1: '#EFECE6', c2: '#C2B9A7' },
  { id: 'gv5', name: 'Bergamote Amère', family: 'Citrus', notes: 'Calabrian Bergamot · Moss', price: 190, badge: 'New', mono: 'BA', c1: '#F4F1EA', c2: '#CFC7B4' },
  { id: 'gv6', name: 'Tubéreuse Nocturne', family: 'Floral', notes: 'Night Jasmine · Ambergris', price: 245, badge: 'Sale', mono: 'TN', c1: '#EDE4E8', c2: '#BA9AA8' },
];

export function Shop10() {
  const [family, setFamily] = useState('All');
  const [filterOpen, setFilterOpen] = useState(true);
  const [sort, setSort] = useState<'curated' | 'asc' | 'desc'>('curated');
  const [page, setPage] = useState(1);
  const [bag, setBag] = useState(0);

  const filtered = useMemo(() => {
    let list = FRAGRANCES.filter((f) => family === 'All' || f.family === family);
    if (sort === 'asc') list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'desc') list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [family, sort]);

  const pageSize = 4;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const curPage = Math.min(page, totalPages);
  const visible = filtered.slice((curPage - 1) * pageSize, curPage * pageSize);

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#1F1D1B] font-dm">
      <header className="border-b border-[#E7E0D5]">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
          <a href="#verre" className="font-cormorant text-2xl font-semibold tracking-wide whitespace-nowrap shrink-0">
            Galerie Verre
          </a>
          <nav className="hidden md:flex items-center gap-7 text-xs uppercase tracking-[0.2em] text-[#6E675F]" aria-label="Primary">
            <a href="#parfums" className="text-[#1F1D1B] whitespace-nowrap shrink-0">Parfums</a>
            <a href="#candles" className="hover:text-[#1F1D1B] whitespace-nowrap shrink-0">Candles</a>
            <a href="#flacons" className="hover:text-[#1F1D1B] whitespace-nowrap shrink-0">Flacons</a>
            <a href="#salon" className="hover:text-[#1F1D1B] whitespace-nowrap shrink-0">Salon</a>
          </nav>
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 border border-[#1F1D1B] text-xs uppercase tracking-widest whitespace-nowrap shrink-0 tabular-nums"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Bag ({bag})</span>
          </button>
        </div>
      </header>

      {/* Single-Column Editorial Archive */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center max-w-xl mx-auto mb-10">
          <p className="text-xs uppercase tracking-[0.24em] text-[#6B1D2F]">Grasse Extraction Archive</p>
          <h1 className="font-cormorant text-4xl sm:text-5xl font-semibold mt-2 text-balance">Fine Fragrance &amp; Glass</h1>
        </div>

        {/* Collapsible Horizontal Filter Bar + Sort */}
        <section className="border-y border-[#E7E0D5] py-4 mb-10" aria-label="Filter and sort controls">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setFilterOpen((o) => !o)}
              aria-expanded={filterOpen}
              className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-medium"
            >
              <span>Olfactory Family ({family})</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className="flex items-center gap-2">
              <label htmlFor="verre-sort" className="text-xs uppercase tracking-widest text-[#6E675F]">
                Order
              </label>
              <select
                id="verre-sort"
                value={sort}
                onChange={(e) => setSort(e.target.value as 'curated' | 'asc' | 'desc')}
                className="bg-transparent border border-[#D8CFC2] px-3 py-1.5 text-xs"
              >
                <option value="curated">Curated</option>
                <option value="asc">Price: Low to High</option>
                <option value="desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {filterOpen && (
            <div className="flex flex-wrap gap-3 pt-4 mt-4 border-t border-[#EFE9DF]">
              {['All', 'Woody', 'Floral', 'Citrus'].map((fam) => (
                <button
                  key={fam}
                  type="button"
                  onClick={() => {
                    setFamily(fam);
                    setPage(1);
                  }}
                  className={`px-4 py-1.5 text-xs uppercase tracking-widest border transition-colors ${
                    family === fam
                      ? 'bg-[#6B1D2F] text-white border-[#6B1D2F]'
                      : 'border-[#D8CFC2] text-[#4A453F] hover:border-[#1F1D1B]'
                  }`}
                >
                  {fam}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* 2-Column Editorial Lookbook Archive */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {visible.map((item) => (
            <article key={item.id} className="group border border-[#E7E0D5] bg-white hover:-translate-y-0.5 transition-transform">
              <div className="relative aspect-[5/4] overflow-hidden">
                <svg viewBox="0 0 400 320" className="w-full h-full" role="img" aria-label={item.name}>
                  <defs>
                    <linearGradient id={`verre-${item.id}`} x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor={item.c1} />
                      <stop offset="100%" stopColor={item.c2} />
                    </linearGradient>
                  </defs>
                  <rect width="400" height="320" fill={`url(#verre-${item.id})`} />
                  <rect x="155" y="90" width="90" height="145" fill="#FFFFFF" fillOpacity="0.6" stroke="#1F1D1B" strokeOpacity="0.35" />
                  <rect x="182" y="62" width="36" height="28" fill="#1F1D1B" fillOpacity="0.75" />
                  <text x="200" y="170" textAnchor="middle" fill="#1F1D1B" fontSize="24" fontFamily="Cormorant Garamond, serif">
                    {item.mono}
                  </text>
                </svg>
                {item.badge && (
                  <span
                    className={`absolute top-4 left-4 px-2.5 py-0.5 text-[11px] uppercase tracking-widest ${
                      item.badge === 'Sale' ? 'bg-[#6B1D2F] text-white' : 'bg-[#1F1D1B] text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
              <div className="p-6 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-[#6E675F]">
                    {item.family} · {item.notes}
                  </p>
                  <h2 className="font-cormorant text-2xl font-semibold mt-1">{item.name}</h2>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-base font-medium tabular-nums">${item.price}</p>
                  <button
                    type="button"
                    onClick={() => setBag((b) => b + 1)}
                    className="mt-1 text-xs uppercase tracking-widest text-[#6B1D2F] border-b border-[#6B1D2F]"
                  >
                    Add
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Editorial Pagination */}
        <nav aria-label="Pagination" className="mt-12 pt-6 border-t border-[#E7E0D5] flex items-center justify-center gap-4">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setPage(n)}
              aria-current={n === curPage ? 'page' : undefined}
              className={`px-4 py-2 text-xs uppercase tracking-widest border tabular-nums ${
                n === curPage ? 'bg-[#1F1D1B] text-white border-[#1F1D1B]' : 'border-[#D8CFC2] hover:border-[#1F1D1B]'
              }`}
            >
              0{n}
            </button>
          ))}
        </nav>
      </main>
    </div>
  );
}

export default Shop10;
