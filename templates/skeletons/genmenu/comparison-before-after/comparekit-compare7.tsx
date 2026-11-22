import { useState } from 'react';
import { ArrowRight } from 'lucide-react';

type ViewMode = 'operations' | 'engineering';

const DATA: Record<
  ViewMode,
  {
    rowLabel: string;
    before: string;
    after: string;
    improvement: string;
  }[]
> = {
  operations: [
    {
      rowLabel: 'Month-end close cycle',
      before: '11 business days',
      after: '2 business days',
      improvement: '-82% duration',
    },
    {
      rowLabel: 'Invoice exception rate',
      before: '14.2% manual review',
      after: '0.8% flagged',
      improvement: '-94% exceptions',
    },
    {
      rowLabel: 'Multi-currency FX reconciliation',
      before: 'Batch CSV upload',
      after: 'Continuous live feed',
      improvement: 'Real-time',
    },
    {
      rowLabel: 'Audit evidence retrieval',
      before: '4.5 hours per request',
      after: '12 seconds',
      improvement: '-99% search time',
    },
  ],
  engineering: [
    {
      rowLabel: 'ERP webhook maintenance',
      before: '18 hrs / week',
      after: '1 hr / week',
      improvement: '-94% toil',
    },
    {
      rowLabel: 'Schema migration regressions',
      before: '3 incidents / quarter',
      after: '0 incidents',
      improvement: 'Zero downtime',
    },
    {
      rowLabel: 'Ledger replay throughput',
      before: '1,200 rows / sec',
      after: '48,000 rows / sec',
      improvement: '40x faster',
    },
    {
      rowLabel: 'Idempotency coverage',
      before: 'Partial (checkout only)',
      after: '100% end-to-end',
      improvement: 'Full guarantee',
    },
  ],
};

export function Compare7() {
  const [mode, setMode] = useState<ViewMode>('operations');
  const rows = DATA[mode];

  return (
    <section aria-labelledby="compare7-heading" className="w-full bg-white border border-slate-200 rounded-xl p-6 md:p-8">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-indigo-700 mb-1">Before / After Comparison</p>
          <h3 id="compare7-heading" className="text-2xl font-semibold tracking-tight text-slate-900 font-display">
            Automated Ledger Migration Impact
          </h3>
        </div>

        <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start">
          <button
            type="button"
            onClick={() => setMode('operations')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              mode === 'operations' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Operational Metrics
          </button>
          <button
            type="button"
            onClick={() => setMode('engineering')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              mode === 'engineering' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Engineering Overhead
          </button>
        </div>
      </div>

      <div className="overflow-x-auto -mx-2 px-2">
        <table className="w-full min-w-[620px] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200">
              <th scope="col" className="py-3.5 pr-4 w-[32%] text-xs font-medium text-slate-500">
                Measured Metric
              </th>
              <th scope="col" className="py-3.5 px-4 w-[24%] text-xs font-semibold text-slate-500 bg-slate-50">
                Before · Manual Process
              </th>
              <th
                scope="col"
                className="py-3.5 px-4 w-[26%] text-xs font-semibold text-indigo-900 bg-indigo-50/70 border-t-2 border-x border-t-indigo-600 border-x-indigo-200 rounded-t-lg"
              >
                After · Automated State
              </th>
              <th scope="col" className="py-3.5 pl-4 w-[18%] text-right text-xs font-medium text-slate-500">
                Net Delta
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.rowLabel} className="hover:bg-slate-50/50">
                <th scope="row" className="py-4 pr-4 text-sm font-medium text-slate-800">
                  {row.rowLabel}
                </th>
                <td className="py-4 px-4 text-sm text-slate-500 bg-slate-50/50 tabular-nums line-through decoration-slate-300">
                  {row.before}
                </td>
                <td className="py-4 px-4 text-sm font-semibold text-indigo-950 bg-indigo-50/40 border-x border-indigo-200 tabular-nums">
                  <span className="inline-flex items-center gap-1.5">
                    <ArrowRight className="w-3.5 h-3.5 text-indigo-600 shrink-0" aria-hidden="true" />
                    <span>{row.after}</span>
                  </span>
                </td>
                <td className="py-4 pl-4 text-right text-xs font-mono font-semibold text-emerald-700 tabular-nums">
                  {row.improvement}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
