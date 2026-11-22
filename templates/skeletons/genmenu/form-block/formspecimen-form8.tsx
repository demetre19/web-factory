import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Search } from 'lucide-react';
import { filterSuggestions, SuggestionItem } from '../../utils/validation';

const COMMANDS: SuggestionItem[] = [
  { id: 'c1', title: 'Deploy Production Cluster', category: 'Actions', description: 'Run rolling deploy across us-west' },
  { id: 'c2', title: 'Rotate API Signing Secret', category: 'Security', description: 'Generate 256-bit key pair' },
  { id: 'c3', title: 'Inspect Postgres Slow Queries', category: 'Database', description: 'Latency > 250ms over last 24h' },
  { id: 'c4', title: 'Export Audit Trail CSV', category: 'Security', description: 'Download compliance log archive' },
  { id: 'c5', title: 'Restart Edge Cache Workers', category: 'Actions', description: 'Flush regional CDN nodes' },
];

export function Form8() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [showList, setShowList] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [executed, setExecuted] = useState<string | null>(null);

  const suggestions = filterSuggestions(COMMANDS, query, category);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length < 2) {
      setError('Enter at least 2 characters to run a library search.');
      setExecuted(null);
      return;
    }
    setError(null);
    setShowList(false);
    setExecuted(`Executed query "${query.trim()}" (${suggestions.length} match${suggestions.length === 1 ? '' : 'es'})`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="max-w-2xl bg-zinc-950 border border-zinc-800 rounded-xl p-4 sm:p-5 text-zinc-100 space-y-3 tracking-[0.01em]"
    >
      <div className="flex flex-col sm:flex-row sm:items-end gap-2.5">
        <div className="flex-1 space-y-1">
          <label htmlFor="form8-query" className="block text-xs font-medium text-zinc-300">
            Command &amp; Resource Lookup
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
            <input
              id="form8-query"
              type="text"
              value={query}
              onFocus={() => setShowList(true)}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowList(true);
                if (error) setError(null);
              }}
              placeholder="Type a command (e.g. Deploy, Rotate, Postgres)..."
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'form8-err' : undefined}
              className={`w-full pl-9 pr-3.5 py-2 text-sm bg-zinc-900 border rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 ${
                error ? 'border-red-500 focus:ring-red-500/30' : 'border-zinc-700 focus:border-emerald-400 focus:ring-emerald-400/25'
              }`}
            />
          </div>
        </div>

        <div className="sm:w-36 space-y-1">
          <label htmlFor="form8-cat" className="block text-xs font-medium text-zinc-300">
            Category
          </label>
          <select
            id="form8-cat"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setShowList(true);
            }}
            className="w-full px-3 py-2 text-sm bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/25"
          >
            <option value="All">All</option>
            <option value="Actions">Actions</option>
            <option value="Security">Security</option>
            <option value="Database">Database</option>
          </select>
        </div>

        <button
          type="submit"
          className="px-4 py-2 text-sm font-semibold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors whitespace-nowrap shrink-0 h-[38px] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          Run Lookup
        </button>
      </div>

      {showList && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg divide-y divide-zinc-800 max-h-48 overflow-y-auto">
          {suggestions.length === 0 ? (
            <p className="px-3.5 py-2.5 text-xs text-zinc-400">No commands match &quot;{query}&quot;.</p>
          ) : (
            suggestions.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setQuery(item.title);
                  setShowList(false);
                  setError(null);
                  setExecuted(`Selected command: ${item.title} (${item.category})`);
                }}
                className="w-full text-left px-3.5 py-2.5 flex items-center justify-between gap-4 hover:bg-zinc-800/80 transition-colors"
              >
                <div>
                  <div className="text-sm font-medium text-zinc-100">{item.title}</div>
                  <div className="text-xs text-zinc-400">{item.description}</div>
                </div>
                <span className="text-xs font-mono text-zinc-400 shrink-0">{item.category}</span>
              </button>
            ))
          )}
        </div>
      )}

      {error && (
        <p id="form8-err" role="alert" className="text-xs text-red-400 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
      {executed && !error && (
        <p className="text-xs text-emerald-400 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          {executed}
        </p>
      )}
    </form>
  );
}
