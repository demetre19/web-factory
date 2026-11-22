import { Check, X } from 'lucide-react';

const CRITERIA = [
  {
    feature: 'Cold-start query latency (p95)',
    us: '180 ms',
    compA: '4.2 s',
    compB: '2.9 s',
  },
  {
    feature: 'Zero-copy branch cloning',
    us: true,
    compA: false,
    compB: 'Paid add-on',
  },
  {
    feature: 'Automatic warehouse suspension',
    us: 'Instant (1s idle)',
    compA: '15 min minimum',
    compB: '5 min minimum',
  },
  {
    feature: 'Row-level column masking',
    us: true,
    compA: 'Enterprise only',
    compB: false,
  },
  {
    feature: 'Cross-region read replicas',
    us: true,
    compA: true,
    compB: false,
  },
  {
    feature: 'Predictable flat-rate compute cap',
    us: true,
    compA: false,
    compB: false,
  },
] as const;

export function Compare5() {
  return (
    <section aria-labelledby="compare5-heading" className="w-full bg-white border border-slate-200 rounded-xl p-6 md:p-8">
      <div className="mb-6">
        <p className="text-xs font-medium text-emerald-700 mb-1">Competitor vs Us · 3-Column Benchmark</p>
        <h3 id="compare5-heading" className="text-2xl font-semibold tracking-tight text-slate-900 font-display">
          Vanguard DB vs. Legacy Warehouses
        </h3>
      </div>

      <div className="overflow-x-auto -mx-2 px-2">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200">
              <th scope="col" className="py-4 pr-4 w-[34%] text-xs font-medium text-slate-500">
                Architecture Criterion
              </th>
              <th
                scope="col"
                className="py-4 px-5 w-[22%] text-center bg-emerald-50/80 border-t-2 border-x border-t-emerald-600 border-x-emerald-200 rounded-t-lg"
              >
                <div className="text-xs font-semibold text-emerald-800 mb-0.5">Winner · Our Platform</div>
                <div className="text-base font-bold text-slate-900 font-display">Vanguard DB</div>
              </th>
              <th scope="col" className="py-4 px-5 w-[22%] text-center">
                <div className="text-xs text-slate-400 mb-0.5">Competitor</div>
                <div className="text-base font-medium text-slate-700">LegacyWare</div>
              </th>
              <th scope="col" className="py-4 px-5 w-[22%] text-center">
                <div className="text-xs text-slate-400 mb-0.5">Competitor</div>
                <div className="text-base font-medium text-slate-700">CloudGrid</div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {CRITERIA.map((row) => (
              <tr key={row.feature} className="hover:bg-slate-50/60 transition-colors">
                <th scope="row" className="py-3.5 pr-4 text-sm font-medium text-slate-800">
                  {row.feature}
                </th>
                <td className="py-3.5 px-5 text-center bg-emerald-50/40 border-x border-emerald-200">
                  {typeof row.us === 'boolean' ? (
                    row.us ? (
                      <Check className="w-4 h-4 text-emerald-700 mx-auto stroke-[2.5]" aria-label="Supported" />
                    ) : (
                      <X className="w-4 h-4 text-slate-400 mx-auto" aria-label="Not supported" />
                    )
                  ) : (
                    <span className="text-sm font-semibold text-emerald-900 tabular-nums">{row.us}</span>
                  )}
                </td>
                {[row.compA, row.compB].map((val, i) => (
                  <td key={i} className="py-3.5 px-5 text-center text-sm text-slate-600 tabular-nums">
                    {typeof val === 'boolean' ? (
                      val ? (
                        <Check className="w-4 h-4 text-slate-500 mx-auto" aria-label="Supported" />
                      ) : (
                        <X className="w-4 h-4 text-rose-400 mx-auto" aria-label="Not supported" />
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
    </section>
  );
}
