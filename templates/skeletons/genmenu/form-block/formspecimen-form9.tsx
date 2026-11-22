import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, RotateCcw } from 'lucide-react';
import { validateNumberRange } from '../../utils/validation';

interface FilterState {
  keyword: string;
  category: string;
  minPrice: string;
  maxPrice: string;
  availability: string[];
  sortBy: string;
}

const DEFAULT_FILTERS: FilterState = {
  keyword: '',
  category: 'all',
  minPrice: '50',
  maxPrice: '600',
  availability: ['In Stock'],
  sortBy: 'relevance',
};

export function Form9() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [priceErrors, setPriceErrors] = useState<{ minError?: string; maxError?: string }>({});
  const [appliedSummary, setAppliedSummary] = useState<string | null>(null);

  const toggleAvailability = (status: string) => {
    setFilters((prev) => ({
      ...prev,
      availability: prev.availability.includes(status)
        ? prev.availability.filter((s) => s !== status)
        : [...prev.availability, status],
    }));
  };

  const activeCount =
    (filters.keyword.trim() ? 1 : 0) +
    (filters.category !== 'all' ? 1 : 0) +
    (filters.minPrice !== '' || filters.maxPrice !== '' ? 1 : 0) +
    filters.availability.length;

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateNumberRange(filters.minPrice, filters.maxPrice, {
      minAllowed: 0,
      maxAllowed: 100000,
      label: 'Price',
    });
    setPriceErrors(errs);
    if (!errs.minError && !errs.maxError) {
      setAppliedSummary(
        `Applied ${activeCount} active filter(s): ${filters.category} · $${filters.minPrice || '0'}–$${filters.maxPrice || '∞'} · Sort: ${filters.sortBy}`
      );
    } else {
      setAppliedSummary(null);
    }
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
    setPriceErrors({});
    setAppliedSummary(null);
  };

  return (
    <form onSubmit={handleApply} noValidate className="max-w-3xl bg-white border border-slate-200 rounded-xl divide-y divide-slate-200">
      <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-2 bg-slate-50 rounded-t-xl">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Inventory Filter Panel</h3>
          <p className="text-xs text-slate-600">Carded sections with cross-field price range checks.</p>
        </div>
        <span className="text-xs font-mono tabular-nums text-slate-600">{activeCount} active criteria</span>
      </div>

      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="form9-keyword" className="block text-sm font-medium text-slate-700">
            SKU or Keyword
          </label>
          <input
            id="form9-keyword"
            type="text"
            value={filters.keyword}
            onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
            placeholder="e.g. anodized aluminum"
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="form9-cat" className="block text-sm font-medium text-slate-700">
            Department
          </label>
          <select
            id="form9-cat"
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
          >
            <option value="all">All Departments</option>
            <option value="Hardware">Hardware</option>
            <option value="Enclosures">Enclosures</option>
            <option value="Optics">Optics</option>
            <option value="Cables">Cables &amp; Connectors</option>
          </select>
        </div>
      </div>

      <div className="p-6 space-y-3">
        <span className="block text-sm font-medium text-slate-700">Unit Price Range (USD)</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="form9-min" className="block text-xs text-slate-500">
              Minimum ($)
            </label>
            <input
              id="form9-min"
              type="number"
              value={filters.minPrice}
              onChange={(e) => {
                setFilters({ ...filters, minPrice: e.target.value });
                if (priceErrors.minError || priceErrors.maxError) setPriceErrors({});
              }}
              aria-invalid={Boolean(priceErrors.minError)}
              aria-describedby={priceErrors.minError ? 'form9-min-err' : undefined}
              className={`w-full px-3 py-2 text-sm tabular-nums border rounded-md focus:outline-none focus:ring-2 ${
                priceErrors.minError ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-100'
              }`}
            />
            {priceErrors.minError && (
              <p id="form9-min-err" role="alert" className="text-xs text-red-700 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                {priceErrors.minError}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="form9-max" className="block text-xs text-slate-500">
              Maximum ($)
            </label>
            <input
              id="form9-max"
              type="number"
              value={filters.maxPrice}
              onChange={(e) => {
                setFilters({ ...filters, maxPrice: e.target.value });
                if (priceErrors.minError || priceErrors.maxError) setPriceErrors({});
              }}
              aria-invalid={Boolean(priceErrors.maxError)}
              aria-describedby={priceErrors.maxError ? 'form9-max-err' : undefined}
              className={`w-full px-3 py-2 text-sm tabular-nums border rounded-md focus:outline-none focus:ring-2 ${
                priceErrors.maxError ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-100'
              }`}
            />
            {priceErrors.maxError && (
              <p id="form9-max-err" role="alert" className="text-xs text-red-700 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                {priceErrors.maxError}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-slate-700">Stock Availability</legend>
          <div className="flex flex-wrap gap-4 pt-1">
            {['In Stock', 'Pre-order', 'Backorder'].map((status) => {
              const id = `form9-avail-${status.toLowerCase().replace(/\s+/g, '-')}`;
              return (
                <label key={status} htmlFor={id} className="inline-flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input
                    id={id}
                    type="checkbox"
                    checked={filters.availability.includes(status)}
                    onChange={() => toggleAvailability(status)}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                  />
                  <span>{status}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="space-y-1.5">
          <label htmlFor="form9-sort" className="block text-sm font-medium text-slate-700">
            Sort Order
          </label>
          <select
            id="form9-sort"
            value={filters.sortBy}
            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
          >
            <option value="relevance">Relevance</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="newest">Newest Arrivals</option>
          </select>
        </div>
      </div>

      <div className="px-6 py-4 bg-slate-50 rounded-b-xl flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs">
          {appliedSummary ? (
            <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
              {appliedSummary}
            </span>
          ) : (
            <span className="text-slate-500">Adjust criteria and click Apply Filters.</span>
          )}
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            Reset
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-600"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </form>
  );
}
