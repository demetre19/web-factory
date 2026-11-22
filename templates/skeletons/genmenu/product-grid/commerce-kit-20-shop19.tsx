import React, { useState } from 'react';
import { ShoppingBag, RotateCcw } from 'lucide-react';
import {
  filterAndSortProducts,
  formatCurrency,
  type CatalogProduct,
} from '../../utils/commerce';
import { MonogramArt } from '../MonogramArt';

const CATALOG: CatalogProduct[] = [
  { id: 'fm-1', name: 'Arc Desk Sconce', category: 'Lighting', material: 'Steel', price: 240, monogram: 'AD', gradient: ['#334155', '#1E293B'], inStock: true, rating: 4.9 },
  { id: 'fm-2', name: 'Fluted Concrete Tray', category: 'Objects', material: 'Stone', price: 78, monogram: 'FC', gradient: ['#64748B', '#475569'], inStock: true, rating: 4.7 },
  { id: 'fm-3', name: 'Cantilever Bookends', category: 'Objects', material: 'Steel', price: 115, monogram: 'CB', gradient: ['#1E293B', '#0F172A'], inStock: true, rating: 4.8 },
  { id: 'fm-4', name: 'Opal Glass Pendant', category: 'Lighting', material: 'Glass', price: 320, monogram: 'OG', gradient: ['#475569', '#334155'], inStock: false, rating: 4.6 },
  { id: 'fm-5', name: 'Turned Oak Stool', category: 'Furniture', material: 'Oak', price: 290, monogram: 'OS', gradient: ['#78716C', '#57534E'], inStock: true, rating: 4.9 },
  { id: 'fm-6', name: 'Pillar Table Lamp', category: 'Lighting', material: 'Stone', price: 195, monogram: 'PT', gradient: ['#52525B', '#3F3F46'], inStock: true, rating: 4.5 },
];

export function Shop19() {
  const [categories, setCategories] = useState<string[]>([]);
  const [materials, setMaterials] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(350);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [bagCount, setBagCount] = useState(0);

  const toggle = (list: string[], setList: (v: string[]) => void, val: string) => {
    setList(list.includes(val) ? list.filter((x) => x !== val) : [...list, val]);
  };

  const resetFilters = () => {
    setCategories([]);
    setMaterials([]);
    setMaxPrice(350);
    setInStockOnly(false);
    setSortBy('featured');
  };

  const results = filterAndSortProducts(CATALOG, {
    categories,
    materials,
    maxPrice,
    inStockOnly,
    sortBy,
  });

  return (
    <section className="bg-white text-slate-900 rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="px-6 md:px-10 py-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-semibold text-slate-900">Form & Matter Archive</h2>
          <p className="text-xs text-slate-500">{results.length} objects shown</p>
        </div>
        <div className="flex items-center gap-4">
          <label htmlFor="s19-sort" className="sr-only">
            Sort products
          </label>
          <select
            id="s19-sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg"
          >
            <option value="featured">Sort: Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
          <span className="inline-flex items-center gap-1.5 text-xs font-mono-num font-semibold text-slate-900">
            <ShoppingBag className="w-4 h-4" />
            {bagCount}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12">
        <aside className="lg:col-span-3 bg-slate-50 border-b lg:border-b-0 lg:border-r border-slate-200 p-6 space-y-6">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
              Category
            </h3>
            <div className="space-y-2">
              {['Lighting', 'Objects', 'Furniture'].map((cat) => (
                <label key={cat} className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={categories.includes(cat)}
                    onChange={() => toggle(categories, setCategories, cat)}
                    className="accent-slate-900 rounded"
                  />
                  {cat}
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
              Material
            </h3>
            <div className="space-y-2">
              {['Steel', 'Stone', 'Glass', 'Oak'].map((mat) => (
                <label key={mat} className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={materials.includes(mat)}
                    onChange={() => toggle(materials, setMaterials, mat)}
                    className="accent-slate-900 rounded"
                  />
                  {mat}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="s19-price" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Max Price: <span className="font-mono-num text-slate-900">${maxPrice}</span>
            </label>
            <input
              id="s19-price"
              type="range"
              min={75}
              max={350}
              step={25}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-slate-900"
            />
          </div>

          <label className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer pt-2 border-t border-slate-200">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="accent-slate-900"
            />
            In stock only
          </label>

          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset filters
          </button>
        </aside>

        <div className="lg:col-span-9 p-6">
          {results.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <p className="text-base font-medium text-slate-900">No objects match those filters.</p>
              <button
                type="button"
                onClick={resetFilters}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-medium rounded-lg"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {results.map((p) => (
                <article
                  key={p.id}
                  className="border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between hover:-translate-y-0.5 transition-transform"
                >
                  <div>
                    <MonogramArt
                      monogram={p.monogram}
                      gradient={p.gradient}
                      shape="arch"
                      className="w-full aspect-[4/3] text-3xl"
                    />
                    <div className="p-4">
                      <p className="text-xs text-slate-500">
                        {p.category} · {p.material}
                      </p>
                      <h3 className="text-base font-semibold text-slate-900 mt-1">{p.name}</h3>
                    </div>
                  </div>
                  <div className="px-4 pb-4 flex items-center justify-between">
                    <span className="font-mono-num text-sm font-semibold text-slate-900">
                      {formatCurrency(p.price)}
                    </span>
                    <button
                      type="button"
                      disabled={!p.inStock}
                      onClick={() => setBagCount((c) => c + 1)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        p.inStock
                          ? 'bg-slate-900 text-white hover:bg-slate-800'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {p.inStock ? 'Quick add' : 'Sold out'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
