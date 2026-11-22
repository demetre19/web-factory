import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Search, X } from 'lucide-react';
import { filterSuggestions, SuggestionItem } from '../../utils/validation';

const SUGGESTION_ITEMS: SuggestionItem[] = [
  { id: 's1', title: 'Accessible Modal Dialog', category: 'Components', description: 'Focus trap and Escape handling' },
  { id: 's2', title: 'Color Contrast Tokens', category: 'Tokens', description: 'WCAG AA semantic color pairs' },
  { id: 's3', title: 'Form Validation Architecture', category: 'Guides', description: 'Field-level aria-invalid patterns' },
  { id: 's4', title: 'Date Range Input', category: 'Components', description: 'Start and end timestamp checks' },
  { id: 's5', title: 'Typography Scale', category: 'Tokens', description: 'Fluid clamp display and body rules' },
  { id: 's6', title: 'Keyboard Navigation Checklist', category: 'Guides', description: 'Roving tabindex and arrow keys' },
];

export function Form7() {
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState('All');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<string | null>(null);

  const matches = filterSuggestions(SUGGESTION_ITEMS, query, scope);

  const commitSearch = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) {
      setError('Enter a search term or pick a suggestion.');
      setSelectedResult(null);
      return;
    }
    setError(null);
    setOpen(false);
    setSelectedResult(`Showing results for "${trimmed}" in ${scope}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setOpen(true);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1 < matches.length ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : matches.length - 1));
    } else if (e.key === 'Enter' && open && activeIndex >= 0 && matches[activeIndex]) {
      e.preventDefault();
      const picked = matches[activeIndex];
      setQuery(picked.title);
      commitSearch(picked.title);
    } else if (e.key === 'Escape') {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        commitSearch(query);
      }}
      noValidate
      className="max-w-2xl bg-white border border-neutral-200 rounded-xl p-4 sm:p-5 space-y-3"
    >
      <div className="flex flex-col sm:flex-row sm:items-end gap-2.5">
        <div className="sm:w-40 space-y-1">
          <label htmlFor="form7-scope" className="block text-xs font-medium text-neutral-700">
            Scope
          </label>
          <select
            id="form7-scope"
            value={scope}
            onChange={(e) => {
              setScope(e.target.value);
              setActiveIndex(-1);
            }}
            className="w-full px-3 py-2 text-sm bg-white border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-200"
          >
            <option value="All">All Docs</option>
            <option value="Components">Components</option>
            <option value="Tokens">Tokens</option>
            <option value="Guides">Guides</option>
          </select>
        </div>

        <div className="flex-1 relative space-y-1">
          <label htmlFor="form7-search" className="block text-xs font-medium text-neutral-700">
            Search Documentation
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
            <input
              id="form7-search"
              type="search"
              value={query}
              onFocus={() => setOpen(true)}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
                setActiveIndex(-1);
                if (error) setError(null);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search components, tokens, or guides..."
              role="combobox"
              aria-expanded={open}
              aria-controls="form7-suggestions"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'form7-search-err' : undefined}
              className={`w-full pl-9 pr-9 py-2 text-sm bg-white border rounded-lg text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 ${
                error ? 'border-red-500 focus:ring-red-200' : 'border-neutral-300 focus:border-neutral-900 focus:ring-neutral-200'
              }`}
            />
            {query && (
              <button
                type="button"
                aria-label="Clear search query"
                onClick={() => {
                  setQuery('');
                  setSelectedResult(null);
                  setActiveIndex(-1);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-700 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            )}
          </div>

          {open && (
            <ul
              id="form7-suggestions"
              role="listbox"
              aria-label="Search suggestions"
              className="mt-1.5 bg-white border border-neutral-200 rounded-lg divide-y divide-neutral-100 max-h-56 overflow-y-auto shadow-sm"
            >
              {matches.length === 0 ? (
                <li className="px-3.5 py-2.5 text-xs text-neutral-500">No matching suggestions in {scope}.</li>
              ) : (
                matches.map((item, idx) => (
                  <li key={item.id} role="option" aria-selected={idx === activeIndex}>
                    <button
                      type="button"
                      onClick={() => {
                        setQuery(item.title);
                        commitSearch(item.title);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between gap-3 transition-colors ${
                        idx === activeIndex ? 'bg-neutral-100' : 'hover:bg-neutral-50'
                      }`}
                    >
                      <span className="text-sm font-medium text-neutral-900">{item.title}</span>
                      <span className="text-xs text-neutral-500 shrink-0">{item.category}</span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>

        <button
          type="submit"
          className="px-5 py-2 text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors whitespace-nowrap shrink-0 h-[38px] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-neutral-900"
        >
          Search
        </button>
      </div>

      {error && (
        <p id="form7-search-err" role="alert" className="flex items-center gap-1.5 text-xs text-red-700">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}
      {selectedResult && !error && (
        <p className="flex items-center gap-1.5 text-xs text-emerald-700">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{selectedResult}</span>
        </p>
      )}
    </form>
  );
}
