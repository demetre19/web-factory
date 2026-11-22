import React, { useState, useMemo } from 'react';
import { ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';

interface GearItem {
  id: string;
  name: string;
  division: 'Shells' | 'Packs' | 'Footwear';
  spec: string;
  price: number;
  tag?: 'New' | 'Sale';
  code: string;
}

const ITEMS: GearItem[] = [
  { id: 'an1', name: 'GTX-3L Storm Anorak', division: 'Shells', spec: '28,000mm', price: 420, tag: 'New', code: 'A1' },
  { id: 'an2', name: 'Cordura 24L Rolltop', division: 'Packs', spec: '1000D', price: 245, code: 'P4' },
  { id: 'an3', name: 'Vibram Approach Low', division: 'Footwear', spec: 'Megagrip', price: 210, tag: 'Sale', code: 'F2' },
  { id: 'an4', name: 'Ripstop Wind Liner', division: 'Shells', spec: '110gsm', price: 185, code: 'A3' },
  { id: 'an5', name: 'Dyneema Sling 6L', division: 'Packs', spec: 'DCF-5', price: 165, tag: 'New', code: 'P8' },
  { id: 'an6', name: 'Merino Baselayer Zip', division: 'Shells', spec: '220gsm', price: 145, tag: 'Sale', code: 'A7' },
  { id: 'an7', name: 'Carbon Trail Boot', division: 'Footwear', spec: 'Gore-Tex', price: 310, code: 'F9' },
  { id: 'an8', name: 'Modular Chest Rig', division: 'Packs', spec: 'X-Pac', price: 130, code: 'P2' },
  { id: 'an9', name: 'Insulated Down Parka', division: 'Shells', spec: '850-Fill', price: 540, tag: 'New', code: 'A9' },
  { id: 'an10', name: 'Recovery Slide V2', division: 'Footwear', spec: 'EVA-Dual', price: 85, tag: 'Sale', code: 'F5' },
];

export function Shop8() {
  const [division, setDivision] = useState<string>('All');
  const [onlyDeals, setOnlyDeals] = useState(false);
  const [sort, setSort] = useState<'default' | 'low' | 'high'>('default');
  const [page, setPage] = useState(1);
  const [bag, setBag] = useState(2);

  const filtered = useMemo(() => {
    let list = ITEMS.filter((it) => {
      const divMatch = division === 'All' || it.division === division;
      const dealMatch = !onlyDeals || Boolean(it.tag);
      return divMatch && dealMatch;
    });
    if (sort === 'low') list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'high') list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [division, onlyDeals, sort]);

  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const curPage = Math.min(page, totalPages);
  const visible = filtered.slice((curPage - 1) * pageSize, curPage * pageSize);

  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100 font-manrope">
      <header className="border-b border-zinc-800 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
          <a href="#noir" className="font-archivo text-lg font-bold tracking-widest uppercase whitespace-nowrap shrink-0">
            Archive Noir
          </a>
          <nav className="hidden md:flex items-center gap-7 text-xs font-plex-mono uppercase tracking-wider text-zinc-400" aria-label="Primary">
            <a href="#shells" className="hover:text-white whitespace-nowrap shrink-0">Shells</a>
            <a href="#packs" className="hover:text-white whitespace-nowrap shrink-0">Carry</a>
            <a href="#footwear" className="hover:text-white whitespace-nowrap shrink-0">Footwear</a>
            <a href="#field" className="hover:text-white whitespace-nowrap shrink-0">Field Lab</a>
          </nav>
          <button
            type="button"
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-zinc-900 border border-zinc-700 hover:border-sky-400 text-xs font-plex-mono rounded whitespace-nowrap shrink-0 tabular-nums"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-sky-400" />
            <span>PACK [{bag}]</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Dark Technical Filter Rail (3 cols) */}
          <aside className="lg:col-span-3 bg-zinc-900/60 border border-zinc-800 rounded-lg p-5 space-y-6" aria-label="Archive filters">
            <div>
              <h2 className="font-plex-mono text-xs uppercase tracking-widest text-zinc-400 mb-3">Division</h2>
              <div className="space-y-1">
                {['All', 'Shells', 'Packs', 'Footwear'].map((div) => (
                  <button
                    key={div}
                    type="button"
                    onClick={() => {
                      setDivision(div);
                      setPage(1);
                    }}
                    className={`w-full text-left px-3 py-2 rounded text-xs font-plex-mono transition-colors ${
                      division === div ? 'bg-sky-400 text-zinc-950 font-bold' : 'text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    {div}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800">
              <label className="flex items-center gap-2.5 text-xs text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyDeals}
                  onChange={(e) => {
                    setOnlyDeals(e.target.checked);
                    setPage(1);
                  }}
                  className="accent-sky-400 w-4 h-4"
                />
                <span>Only New &amp; Sale Releases</span>
              </label>
            </div>
          </aside>

          {/* 4-Column Dense Catalog (9 cols) */}
          <section className="lg:col-span-9" aria-label="Technical catalog">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="font-archivo text-2xl font-bold tracking-tight">System 09 Archive</h1>
                <p className="font-plex-mono text-xs text-zinc-400 mt-1 tabular-nums">{filtered.length} technical units indexed</p>
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="noir-sort" className="font-plex-mono text-xs text-zinc-400">
                  SORT
                </label>
                <select
                  id="noir-sort"
                  value={sort}
                  onChange={(e) => setSort(e.target.value as 'default' | 'low' | 'high')}
                  className="bg-zinc-900 border border-zinc-700 text-xs font-plex-mono px-3 py-2 rounded text-zinc-100"
                >
                  <option value="default">Index Order</option>
                  <option value="low">Price: Asc</option>
                  <option value="high">Price: Desc</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {visible.map((item) => (
                <article
                  key={item.id}
                  className="group bg-zinc-900 border border-zinc-800 hover:border-sky-400/70 rounded-lg overflow-hidden transition-all hover:-translate-y-0.5"
                >
                  <div className="relative aspect-square bg-zinc-950">
                    <svg viewBox="0 0 240 240" className="w-full h-full" role="img" aria-label={item.name}>
                      <defs>
                        <linearGradient id={`noir-${item.id}`} x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#18181B" />
                          <stop offset="100%" stopColor="#09090B" />
                        </linearGradient>
                      </defs>
                      <rect width="240" height="240" fill={`url(#noir-${item.id})`} />
                      <polygon points="120,44 188,82 188,158 120,196 52,158 52,82" fill="none" stroke="#38BDF8" strokeOpacity="0.45" strokeWidth="1.5" />
                      <text x="120" y="128" textAnchor="middle" fill="#F4F4F5" fontSize="24" fontFamily="IBM Plex Mono, monospace" fontWeight="600">
                        {item.code}
                      </text>
                    </svg>
                    {item.tag && (
                      <span
                        className={`absolute top-2.5 left-2.5 px-2 py-0.5 font-plex-mono text-[10px] font-bold uppercase rounded-xs ${
                          item.tag === 'Sale' ? 'bg-amber-400 text-zinc-950' : 'bg-sky-400 text-zinc-950'
                        }`}
                      >
                        {item.tag}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setBag((b) => b + 1)}
                      className="absolute inset-x-2.5 bottom-2.5 py-2 bg-sky-400 text-zinc-950 font-plex-mono text-[11px] font-bold rounded opacity-90 group-hover:opacity-100 hover:bg-sky-300 transition-all"
                    >
                      + ADD TO PACK
                    </button>
                  </div>
                  <div className="p-3.5">
                    <p className="font-plex-mono text-[11px] text-zinc-400">
                      {item.division} · {item.spec}
                    </p>
                    <div className="mt-1 flex items-baseline justify-between gap-2">
                      <h3 className="text-sm font-semibold text-zinc-100 truncate">{item.name}</h3>
                      <span className="font-plex-mono text-xs text-sky-400 tabular-nums">${item.price}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination */}
            <nav aria-label="Pagination" className="mt-8 pt-5 border-t border-zinc-800 flex items-center justify-between">
              <button
                type="button"
                disabled={curPage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="inline-flex items-center gap-1 px-3 py-1.5 border border-zinc-800 rounded font-plex-mono text-xs disabled:opacity-40 hover:border-zinc-500"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>PREV</span>
              </button>
              <div className="flex gap-1.5">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPage(n)}
                    aria-current={n === curPage ? 'page' : undefined}
                    className={`w-8 h-8 rounded font-plex-mono text-xs tabular-nums ${
                      n === curPage ? 'bg-sky-400 text-zinc-950 font-bold' : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <button
                type="button"
                disabled={curPage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="inline-flex items-center gap-1 px-3 py-1.5 border border-zinc-800 rounded font-plex-mono text-xs disabled:opacity-40 hover:border-zinc-500"
              >
                <span>NEXT</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </nav>
          </section>
        </div>
      </main>
    </div>
  );
}

export default Shop8;
