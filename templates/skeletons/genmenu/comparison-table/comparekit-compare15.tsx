import { useState } from 'react';
import { Check, Minus, LayoutGrid, Table2 } from 'lucide-react';
import { filterComparisonRows } from '../../utils/comparisonHelpers';

const COLUMNS = [
  { id: 'free', name: 'Standard', price: '$0', recommended: false },
  { id: 'plus', name: 'Plus', price: '$22/mo', recommended: true },
  { id: 'org', name: 'Organization', price: '$65/mo', recommended: false },
] as const;

const ROWS = [
  { label: 'Two-factor authentication (TOTP/WebAuthn)', category: 'Security', values: [true, true, true] },
  { label: 'Hardware security key enforcement', category: 'Security', values: [false, true, true] },
  { label: 'Session IP pinning & geo-fencing', category: 'Security', values: [false, false, true] },
  { label: 'Real-time multiplayer cursors', category: 'Collaboration', values: [true, true, true] },
  { label: 'Inline version diff comments', category: 'Collaboration', values: [false, true, true] },
  { label: 'External guest review links', category: 'Collaboration', values: ['1 link', 'Unlimited', 'Expiring + NDA'] },
];

export function Compare15() {
  const [view, setView] = useState<'table' | 'cards'>('table');
  const [category, setCategory] = useState<'All' | 'Security' | 'Collaboration'>('All');

  const filteredRows = filterComparisonRows(ROWS, { category });

  return (
    <section aria-labelledby="compare15-heading" className="w-full bg-white border border-slate-200 rounded-xl p-6 md:p-8">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-blue-700 mb-1">Toggleable Comparison View</p>
          <h3 id="compare15-heading" className="text-2xl font-semibold tracking-tight text-slate-900 font-display">
            Table or Focus-Card Inspector
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {(['All', 'Security', 'Collaboration'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  category === cat ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => setView('table')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                view === 'table' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Table2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Table Matrix</span>
            </button>
            <button
              type="button"
              onClick={() => setView('cards')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                view === 'cards' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Focus Cards</span>
            </button>
          </div>
        </div>
      </div>

      {view === 'table' ? (
        <div className="overflow-x-auto -mx-2 px-2">
          <table className="w-full min-w-[600px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200">
                <th scope="col" className="py-3.5 pr-4 w-[40%] text-xs font-medium text-slate-500">
                  Feature ({filteredRows.length} shown)
                </th>
                {COLUMNS.map((col) => (
                  <th
                    key={col.id}
                    scope="col"
                    className={`py-3.5 px-4 w-[20%] text-center ${
                      col.recommended ? 'bg-blue-50/70 border-t-2 border-x border-t-blue-600 border-x-blue-200 rounded-t-lg' : ''
                    }`}
                  >
                    <div className="text-xs font-medium text-blue-700 min-h-[1rem]">
                      {col.recommended ? 'Recommended' : ''}
                    </div>
                    <div className="text-sm font-semibold text-slate-900">{col.name}</div>
                    <div className="text-xs font-normal text-slate-500 tabular-nums">{col.price}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRows.map((row) => (
                <tr key={row.label}>
                  <th scope="row" className="py-3.5 pr-4 text-sm font-medium text-slate-800">
                    {row.label}
                  </th>
                  {row.values.map((val, idx) => (
                    <td
                      key={COLUMNS[idx].id}
                      className={`py-3.5 px-4 text-center text-sm ${
                        COLUMNS[idx].recommended ? 'bg-blue-50/40 border-x border-blue-200 font-medium text-slate-900' : 'text-slate-600'
                      }`}
                    >
                      {typeof val === 'boolean' ? (
                        val ? (
                          <Check className="w-4 h-4 text-emerald-700 mx-auto" aria-label="Included" />
                        ) : (
                          <Minus className="w-4 h-4 text-slate-300 mx-auto" aria-label="Not included" />
                        )
                      ) : (
                        val
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {COLUMNS.map((col, colIdx) => (
            <article
              key={col.id}
              className={`rounded-lg p-5 border ${
                col.recommended ? 'bg-blue-50/50 border-blue-300' : 'bg-slate-50/60 border-slate-200'
              }`}
            >
              <div className="flex items-baseline justify-between pb-3 mb-4 border-b border-slate-200">
                <div>
                  <div className="text-xs font-semibold text-blue-700 min-h-[1rem]">
                    {col.recommended ? 'Recommended' : ''}
                  </div>
                  <h4 className="text-base font-semibold text-slate-900">{col.name}</h4>
                </div>
                <span className="text-base font-bold text-slate-900 tabular-nums">{col.price}</span>
              </div>
              <ul className="space-y-2.5 text-sm">
                {filteredRows.map((row) => {
                  const val = row.values[colIdx];
                  return (
                    <li key={row.label} className="flex items-start justify-between gap-2">
                      <span className="text-slate-700">{row.label}</span>
                      <span className="shrink-0 font-medium text-slate-900">
                        {typeof val === 'boolean' ? (
                          val ? (
                            <Check className="w-4 h-4 text-emerald-700" aria-label="Included" />
                          ) : (
                            <Minus className="w-4 h-4 text-slate-300" aria-label="Not included" />
                          )
                        ) : (
                          val
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
