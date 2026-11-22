import React, { useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { validateNumberRange } from '../../utils/validation';

export function Form10() {
  const [query, setQuery] = useState('');
  const [medium, setMedium] = useState('All');
  const [yearFrom, setYearFrom] = useState('1960');
  const [yearTo, setYearTo] = useState('2024');
  const [condition, setCondition] = useState<'all' | 'mint' | 'restored'>('all');
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [yearErrors, setYearErrors] = useState<{ minError?: string; maxError?: string }>({});
  const [resultMsg, setResultMsg] = useState<string>('Showing 48 archival records (1960–2024)');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateNumberRange(yearFrom, yearTo, { minAllowed: 1900, maxAllowed: 2026, label: 'Year' });
    setYearErrors(errs);
    if (!errs.minError && !errs.maxError) {
      const fromNum = Number(yearFrom || 1900);
      const toNum = Number(yearTo || 2026);
      const estimated = Math.max(3, Math.round(((toNum - fromNum + 1) / 127) * (featuredOnly ? 18 : 64)));
      setResultMsg(`Filtered ${estimated} ${medium === 'All' ? 'archival' : medium.toLowerCase()} records (${fromNum}–${toNum})`);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="max-w-3xl bg-stone-50 border border-stone-200 rounded-xl p-6 space-y-5"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-stone-200 pb-3">
        <h3 className="text-base font-semibold text-stone-900">Archive Collection Filter</h3>
        <span className="text-xs font-mono tabular-nums text-stone-600">{resultMsg}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="form10-query" className="block text-sm font-medium text-stone-800">
            Title or Archivist
          </label>
          <input
            id="form10-query"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search lithographs, monographs..."
            className="w-full px-3.5 py-2 text-sm bg-white border border-stone-300 rounded-lg text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-amber-800 focus:ring-2 focus:ring-amber-100"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="form10-medium" className="block text-sm font-medium text-stone-800">
            Medium
          </label>
          <select
            id="form10-medium"
            value={medium}
            onChange={(e) => setMedium(e.target.value)}
            className="w-full px-3.5 py-2 text-sm bg-white border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:border-amber-800 focus:ring-2 focus:ring-amber-100"
          >
            <option value="All">All Media</option>
            <option value="Print & Letterpress">Print &amp; Letterpress</option>
            <option value="Silver Gelatin Photo">Silver Gelatin Photo</option>
            <option value="Architectural Blueprint">Architectural Blueprint</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label htmlFor="form10-yfrom" className="block text-sm font-medium text-stone-800">
              Year From
            </label>
            <input
              id="form10-yfrom"
              type="number"
              min={1900}
              max={2026}
              value={yearFrom}
              onChange={(e) => {
                setYearFrom(e.target.value);
                setYearErrors({});
              }}
              aria-invalid={Boolean(yearErrors.minError)}
              className={`w-full px-3 py-2 text-sm tabular-nums bg-white border rounded-lg focus:outline-none focus:ring-2 ${
                yearErrors.minError ? 'border-red-600 focus:ring-red-200' : 'border-stone-300 focus:border-amber-800 focus:ring-amber-100'
              }`}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="form10-yto" className="block text-sm font-medium text-stone-800">
              Year To
            </label>
            <input
              id="form10-yto"
              type="number"
              min={1900}
              max={2026}
              value={yearTo}
              onChange={(e) => {
                setYearTo(e.target.value);
                setYearErrors({});
              }}
              aria-invalid={Boolean(yearErrors.maxError)}
              className={`w-full px-3 py-2 text-sm tabular-nums bg-white border rounded-lg focus:outline-none focus:ring-2 ${
                yearErrors.maxError ? 'border-red-600 focus:ring-red-200' : 'border-stone-300 focus:border-amber-800 focus:ring-amber-100'
              }`}
            />
          </div>
          {(yearErrors.minError || yearErrors.maxError) && (
            <p role="alert" className="col-span-2 text-xs text-red-700 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              {yearErrors.minError || yearErrors.maxError}
            </p>
          )}
        </div>

        <fieldset className="space-y-1.5">
          <legend className="text-sm font-medium text-stone-800">Preservation Grade</legend>
          <div className="grid grid-cols-3 gap-2 pt-0.5">
            {(['all', 'mint', 'restored'] as const).map((opt) => (
              <label
                key={opt}
                htmlFor={`form10-cond-${opt}`}
                className={`flex items-center justify-center py-2 px-2.5 text-xs font-medium border rounded-lg cursor-pointer transition-colors ${
                  condition === opt
                    ? 'bg-amber-900 text-stone-50 border-amber-900'
                    : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
                }`}
              >
                <input
                  id={`form10-cond-${opt}`}
                  type="radio"
                  name="form10-condition"
                  value={opt}
                  checked={condition === opt}
                  onChange={() => setCondition(opt)}
                  className="sr-only"
                />
                <span className="capitalize">{opt}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-stone-200">
        <div className="flex items-center gap-2">
          <input
            id="form10-featured"
            type="checkbox"
            checked={featuredOnly}
            onChange={(e) => setFeaturedOnly(e.target.checked)}
            className="h-4 w-4 rounded border-stone-300 text-amber-900 focus:ring-amber-800"
          />
          <label htmlFor="form10-featured" className="text-sm text-stone-700">
            Exhibited works only
          </label>
        </div>

        <div className="flex items-center gap-3">
          {!yearErrors.minError && !yearErrors.maxError && (
            <span className="hidden sm:inline-flex items-center gap-1 text-xs text-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
              Range valid
            </span>
          )}
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-stone-50 bg-amber-900 hover:bg-amber-800 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-900"
          >
            Update Archive View
          </button>
        </div>
      </div>
    </form>
  );
}
