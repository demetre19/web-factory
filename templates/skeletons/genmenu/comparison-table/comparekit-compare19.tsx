import { useState } from 'react';

const RELEASES = [
  { id: 'v24', name: 'Engine v2.4', status: 'Maintenance', winner: false },
  { id: 'v30', name: 'Engine v3.0 LTS', status: 'Production Standard', winner: true },
  { id: 'v32', name: 'Engine v3.2 RC', status: 'Release Candidate', winner: false },
] as const;

const VERSION_ROWS = [
  { label: 'Node / Runtime baseline', breaking: true, values: ['Node 18+', 'Node 20 LTS+', 'Node 22+'] },
  { label: 'HTTP/3 & QUIC transport', breaking: false, values: ['Experimental flag', 'Enabled by default', 'Enabled + 0-RTT'] },
  { label: 'Peak RPS (single core)', breaking: false, values: ['18,400 req/s', '41,200 req/s', '46,800 req/s'] },
  { label: 'Idle RSS memory footprint', breaking: false, values: ['94 MB', '52 MB', '49 MB'] },
  { label: 'Legacy XML config parser', breaking: true, values: ['Supported', 'Removed (JSON/YAML)', 'Removed (JSON/YAML)'] },
  { label: 'Security patch support window', breaking: false, values: ['Ends Dec 2026', 'Through Nov 2029', '6-month rolling'] },
] as const;

export function Compare19() {
  const [breakingOnly, setBreakingOnly] = useState<boolean>(false);

  const visibleRows = breakingOnly ? VERSION_ROWS.filter((r) => r.breaking) : VERSION_ROWS;

  return (
    <section aria-labelledby="compare19-heading" className="w-full bg-white border border-slate-200 rounded-xl p-6 md:p-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-indigo-700 mb-1">Software Version Comparison</p>
          <h3 id="compare19-heading" className="text-2xl font-semibold tracking-tight text-slate-900 font-display">
            Runtime Release Matrix (v2.4 vs. v3.0 LTS vs. v3.2)
          </h3>
        </div>

        <button
          type="button"
          onClick={() => setBreakingOnly((v) => !v)}
          aria-pressed={breakingOnly}
          className={`px-3.5 py-2 text-xs font-medium rounded-lg border transition-colors self-start whitespace-nowrap ${
            breakingOnly
              ? 'bg-indigo-700 text-white border-indigo-700'
              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
          }`}
        >
          {breakingOnly ? 'Showing Breaking Changes' : 'Filter Breaking Changes'}
        </button>
      </div>

      <div className="overflow-x-auto -mx-2 px-2">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200">
              <th scope="col" className="py-4 pr-4 w-[34%] text-xs font-medium text-slate-500">
                Release Attribute
              </th>
              {RELEASES.map((rel) => (
                <th
                  key={rel.id}
                  scope="col"
                  className={`py-4 px-5 w-[22%] ${
                    rel.winner ? 'bg-indigo-50/70 border-t-2 border-x border-t-indigo-600 border-x-indigo-200 rounded-t-lg' : ''
                  }`}
                >
                  <div className="text-xs font-semibold text-indigo-700 min-h-[1rem] mb-0.5">
                    {rel.winner ? 'Recommended Target' : rel.status}
                  </div>
                  <div className="text-base font-semibold text-slate-900 font-display">{rel.name}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visibleRows.map((row) => (
              <tr key={row.label} className="hover:bg-slate-50/60">
                <th scope="row" className="py-3.5 pr-4 text-sm font-medium text-slate-800">
                  <span>{row.label}</span>
                  {row.breaking && (
                    <span className="ml-2 text-xs font-medium text-amber-700"> (Breaking)</span>
                  )}
                </th>
                {row.values.map((val, idx) => (
                  <td
                    key={RELEASES[idx].id}
                    className={`py-3.5 px-5 font-mono text-xs tabular-nums ${
                      RELEASES[idx].winner
                        ? 'bg-indigo-50/40 border-x border-indigo-200 font-semibold text-indigo-950'
                        : 'text-slate-600'
                    }`}
                  >
                    {val}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
