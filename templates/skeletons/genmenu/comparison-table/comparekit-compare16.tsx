import { useState } from 'react';
import { Check, Minus } from 'lucide-react';
import { filterComparisonRows } from '../../utils/comparisonHelpers';

const TIERS = [
  { id: 'free', name: 'Free', winner: false },
  { id: 'starter', name: 'Starter', winner: false },
  { id: 'growth', name: 'Growth', winner: true },
  { id: 'scale', name: 'Scale', winner: false },
] as const;

const MATRIX = [
  { label: 'HTTPS & automatic SSL', detail: 'Zero-config TLS provisioning', values: [true, true, true, true] },
  { label: 'Git push deployments', detail: 'Connected repository triggers', values: [true, true, true, true] },
  { label: 'Background cron jobs', detail: 'Scheduled worker invocations', values: ['2 jobs', '20 jobs', '200 jobs', 'Unlimited'] },
  { label: 'Team role permissions', detail: 'Admin, Editor, Viewer scopes', values: [false, false, true, true] },
  { label: 'Read-replica routing', detail: 'Geo-distributed read pools', values: [false, false, true, true] },
  { label: 'SOC 2 audit log export', detail: 'SIEM streaming webhook', values: [false, false, false, true] },
];

export function Compare16() {
  const [differencesOnly, setDifferencesOnly] = useState<boolean>(false);
  const [detailed, setDetailed] = useState<boolean>(true);

  const visibleRows = filterComparisonRows(MATRIX, { differencesOnly });

  return (
    <section aria-labelledby="compare16-heading" className="w-full bg-white border border-neutral-200 rounded-xl p-6 md:p-8">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-xs text-neutral-500 mb-1">Minimal 4-Column Toggleable Matrix</p>
          <h3 id="compare16-heading" className="text-2xl font-medium tracking-tight text-neutral-950 font-display">
            Platform Capability Diff View
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setDifferencesOnly((v) => !v)}
            aria-pressed={differencesOnly}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap ${
              differencesOnly
                ? 'bg-neutral-950 text-white border-neutral-950'
                : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
            }`}
          >
            {differencesOnly ? 'Showing Differences Only' : 'Show Differences Only'}
          </button>

          <button
            type="button"
            onClick={() => setDetailed((v) => !v)}
            aria-pressed={detailed}
            className="px-3.5 py-2 text-xs font-medium rounded-lg border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 transition-colors whitespace-nowrap"
          >
            {detailed ? 'Compact Rows' : 'Detailed Rows'}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto -mx-2 px-2">
        <table className="w-full min-w-[680px] border-collapse text-left">
          <thead>
            <tr className="border-b border-neutral-200">
              <th scope="col" className="py-3.5 pr-4 w-[36%] text-xs font-medium text-neutral-500">
                Capability ({visibleRows.length} rows)
              </th>
              {TIERS.map((tier) => (
                <th
                  key={tier.id}
                  scope="col"
                  className={`py-3.5 px-4 w-[16%] text-center ${
                    tier.winner ? 'bg-neutral-100 border-t-2 border-x border-t-neutral-900 border-x-neutral-200 rounded-t-lg' : ''
                  }`}
                >
                  <div className="text-[11px] font-medium text-neutral-900 min-h-[1rem]">
                    {tier.winner ? 'Recommended' : ''}
                  </div>
                  <div className="text-sm font-semibold text-neutral-950">{tier.name}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {visibleRows.map((row) => (
              <tr key={row.label}>
                <th scope="row" className={`pr-4 font-normal ${detailed ? 'py-3.5' : 'py-2.5'}`}>
                  <div className="text-sm font-medium text-neutral-900">{row.label}</div>
                  {detailed && <div className="text-xs text-neutral-500 mt-0.5">{row.detail}</div>}
                </th>
                {row.values.map((val, idx) => (
                  <td
                    key={TIERS[idx].id}
                    className={`px-4 text-center ${detailed ? 'py-3.5' : 'py-2.5'} ${
                      TIERS[idx].winner ? 'bg-neutral-50 border-x border-neutral-200 font-medium text-neutral-950' : 'text-neutral-600'
                    }`}
                  >
                    {typeof val === 'boolean' ? (
                      val ? (
                        <Check className="w-4 h-4 text-neutral-900 mx-auto" aria-label="Included" />
                      ) : (
                        <Minus className="w-4 h-4 text-neutral-300 mx-auto" aria-label="Not included" />
                      )
                    ) : (
                      <span className="text-xs font-mono tabular-nums">{val}</span>
                    )}
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
