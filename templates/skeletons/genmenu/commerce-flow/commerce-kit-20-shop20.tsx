import React, { useState } from 'react';
import { ShoppingBag, Check } from 'lucide-react';
import {
  filterAndSortProducts,
  formatCurrency,
  type CatalogProduct,
} from '../../utils/commerce';
import { MonogramArt } from '../MonogramArt';

const EDITORIAL_CATALOG: CatalogProduct[] = [
  { id: 'mv-a1', name: 'Verrier Fluted Carafe', category: 'Glassware', material: 'Crystal', price: 165, monogram: 'VF', gradient: ['#7F1D1D', '#450A0A'], inStock: true, rating: 4.9 },
  { id: 'mv-a2', name: 'Solstice Brass Candlestick', category: 'Tableware', material: 'Brass', price: 120, monogram: 'SB', gradient: ['#78350F', '#451A03'], inStock: true, rating: 4.8 },
  { id: 'mv-a3', name: 'Atelier Jacquard Throw', category: 'Textiles', material: 'Wool', price: 280, monogram: 'AJ', gradient: ['#14532D', '#052E16'], inStock: true, rating: 4.9 },
  { id: 'mv-a4', name: 'Vesper Smoked Coupe Pair', category: 'Glassware', material: 'Crystal', price: 95, monogram: 'VS', gradient: ['#292524', '#1C1917'], inStock: true, rating: 4.7 },
  { id: 'mv-a5', name: 'Travertine Serving Plinth', category: 'Tableware', material: 'Stone', price: 210, monogram: 'TP', gradient: ['#78716C', '#44403C'], inStock: false, rating: 4.6 },
  { id: 'mv-a6', name: 'Merino Bouclé Cushion', category: 'Textiles', material: 'Wool', price: 140, monogram: 'MB', gradient: ['#991B1B', '#7F1D1D'], inStock: true, rating: 4.8 },
];

export function Shop20() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [materialFilter, setMaterialFilter] = useState<string[]>([]);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');
  const [addedIds, setAddedIds] = useState<string[]>([]);
  const [bagTotal, setBagTotal] = useState(0);

  const toggleMat = (m: string) => {
    setMaterialFilter((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
  };

  const products = filterAndSortProducts(EDITORIAL_CATALOG, {
    categories: selectedCategory === 'All' ? [] : [selectedCategory],
    materials: materialFilter,
    maxPrice: 500,
    inStockOnly: onlyAvailable,
    sortBy,
  });

  const handleAdd = (p: CatalogProduct) => {
    setBagTotal((n) => n + 1);
    setAddedIds((prev) => [...prev, p.id]);
    setTimeout(() => {
      setAddedIds((prev) => prev.filter((id) => id !== p.id));
    }, 1500);
  };

  return (
    <section className="bg-[#F6F3EC] text-[#1C1917] rounded-xl border border-[#DFD8C8] overflow-hidden">
      <div className="px-6 md:px-10 py-6 border-b border-[#DFD8C8] flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-[#7F1D1D]">Collection 09</p>
          <h2 className="font-editorial text-2xl font-semibold">Maison Verrier Catalogue</h2>
        </div>
        <div className="flex items-center gap-4">
          <label htmlFor="s20-sort" className="sr-only">
            Sort collection
          </label>
          <select
            id="s20-sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-3 py-2 text-xs bg-white border border-[#D6CFC2]"
          >
            <option value="featured">Curated Order</option>
            <option value="price-asc">Price: Ascending</option>
            <option value="price-desc">Price: Descending</option>
          </select>
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-mono-num">
            <ShoppingBag className="w-4 h-4 text-[#7F1D1D]" />
            Bag ({bagTotal})
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12">
        <aside className="lg:col-span-3 bg-[#EFECE3] border-b lg:border-b-0 lg:border-r border-[#DFD8C8] p-6 space-y-6">
          <div>
            <h3 className="text-xs uppercase tracking-widest text-[#78716C] mb-3">Department</h3>
            <div className="space-y-1.5">
              {['All', 'Glassware', 'Tableware', 'Textiles'].map((dept) => (
                <button
                  key={dept}
                  type="button"
                  onClick={() => setSelectedCategory(dept)}
                  className={`block w-full text-left px-3 py-2 text-sm transition-colors ${
                    selectedCategory === dept
                      ? 'bg-[#1C1917] text-[#F6F3EC] font-medium'
                      : 'text-[#44403C] hover:bg-[#E5E0D3]'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs uppercase tracking-widest text-[#78716C] mb-3">Materiality</h3>
            <div className="space-y-2">
              {['Crystal', 'Brass', 'Wool', 'Stone'].map((mat) => (
                <label key={mat} className="flex items-center gap-2.5 text-sm text-[#44403C] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={materialFilter.includes(mat)}
                    onChange={() => toggleMat(mat)}
                    className="accent-[#7F1D1D]"
                  />
                  {mat}
                </label>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2.5 text-sm text-[#44403C] cursor-pointer pt-4 border-t border-[#DFD8C8]">
            <input
              type="checkbox"
              checked={onlyAvailable}
              onChange={(e) => setOnlyAvailable(e.target.checked)}
              className="accent-[#7F1D1D]"
            />
            Ready to ship
          </label>
        </aside>

        <div className="lg:col-span-9 p-6 md:p-8">
          {products.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <p className="font-editorial text-xl">No editions match your selection.</p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('All');
                  setMaterialFilter([]);
                  setOnlyAvailable(false);
                }}
                className="px-5 py-2.5 bg-[#1C1917] text-[#F6F3EC] text-xs uppercase tracking-widest"
              >
                Show all editions
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((item) => {
                const isAdded = addedIds.includes(item.id);
                return (
                  <article
                    key={item.id}
                    className="bg-white border border-[#DFD8C8] flex flex-col justify-between hover:-translate-y-0.5 transition-transform"
                  >
                    <div>
                      <MonogramArt
                        monogram={item.monogram}
                        gradient={item.gradient}
                        shape="ring"
                        editorial
                        className="w-full aspect-[4/3] text-3xl"
                      />
                      <div className="p-4">
                        <p className="text-xs uppercase tracking-wider text-[#78716C]">
                          {item.category} · {item.material}
                        </p>
                        <h3 className="font-editorial text-lg font-medium text-[#1C1917] mt-1">
                          {item.name}
                        </h3>
                      </div>
                    </div>
                    <div className="px-4 pb-4 flex items-center justify-between">
                      <span className="font-mono-num text-sm font-medium">
                        {formatCurrency(item.price)}
                      </span>
                      <button
                        type="button"
                        disabled={!item.inStock}
                        onClick={() => handleAdd(item)}
                        className={`px-3.5 py-2 text-xs uppercase tracking-wider font-medium transition-colors inline-flex items-center gap-1.5 ${
                          !item.inStock
                            ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                            : isAdded
                              ? 'bg-[#14532D] text-white'
                              : 'bg-[#1C1917] text-[#F6F3EC] hover:bg-[#7F1D1D]'
                        }`}
                      >
                        {!item.inStock ? (
                          'Waitlist'
                        ) : isAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5" /> Added
                          </>
                        ) : (
                          'Acquire'
                        )}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
