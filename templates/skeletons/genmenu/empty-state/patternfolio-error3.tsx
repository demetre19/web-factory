import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

const SUGGESTIONS = ['Invoice history', 'Team permissions', 'API keys'];

export function Error3() {
  const [query, setQuery] = useState('quantum ledger v3');
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);

  return (
    <main className="min-h-[680px] w-full bg-white text-slate-900 flex items-center justify-center p-6">
      <section aria-label="Empty search results" className="w-full max-w-lg text-center space-y-6">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center">
          <Search className="w-6 h-6" aria-hidden="true" />
        </div>

        <div className="max-w-md mx-auto">
          <label htmlFor="error3-search" className="sr-only">
            Search workspace records
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              id="error3-search"
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedSuggestion(null);
              }}
              placeholder="Search records..."
              className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-9 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-900"
            />
            {query && (
              <button
                type="button"
                aria-label="Clear search query"
                onClick={() => {
                  setQuery('');
                  setSelectedSuggestion(null);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {selectedSuggestion ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-left space-y-2" role="status">
            <p className="text-sm font-semibold text-slate-900">
              Showing 4 results for &ldquo;{selectedSuggestion}&rdquo;
            </p>
            <p className="text-xs text-slate-600">
              Search filter updated. Click clear below to return to the zero-results empty state.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery('quantum ledger v3');
                setSelectedSuggestion(null);
              }}
              className="mt-1 text-xs font-medium text-slate-900 underline underline-offset-4 focus:outline-none"
            >
              Reset to empty state
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <h1 className="text-xl font-semibold tracking-tight text-slate-900">
                {query ? `No results for "${query}"` : 'Enter a search term'}
              </h1>
              <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                Check your spelling, broaden your date range, or try one of the common queries below.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              {SUGGESTIONS.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => {
                    setQuery(term);
                    setSelectedSuggestion(term);
                  }}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
                >
                  {term}
                </button>
              ))}
            </div>

            <div>
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setSelectedSuggestion(null);
                }}
                className="text-xs font-medium text-slate-500 hover:text-slate-900 underline underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
              >
                Clear search and filters
              </button>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
