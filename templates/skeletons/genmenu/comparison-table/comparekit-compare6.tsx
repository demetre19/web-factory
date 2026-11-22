import { Check, X } from 'lucide-react';

const HEAD_TO_HEAD = [
  {
    criterion: 'Issue triage latency',
    us: 'Real-time keyboard triage (< 2s)',
    them: 'Manual email threads & CSV exports',
  },
  {
    criterion: 'Sprint scope change tracking',
    us: true,
    them: false,
  },
  {
    criterion: 'Automated PR-to-roadmap sync',
    us: true,
    them: false,
  },
  {
    criterion: 'Average weekly status meeting time',
    us: '15 min async digest',
    them: '3.5 hrs live sync calls',
  },
  {
    criterion: 'Cross-team dependency graph',
    us: true,
    them: false,
  },
  {
    criterion: 'SOC 2 Type II audit trail',
    us: true,
    them: false,
  },
] as const;

export function Compare6() {
  return (
    <section
      aria-labelledby="compare6-heading"
      className="w-full bg-zinc-950 text-zinc-100 border border-zinc-800 rounded-xl p-6 md:p-8"
    >
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-amber-400 mb-1">Dark Head-to-Head · Competitor vs Us</p>
          <h3 id="compare6-heading" className="text-2xl font-semibold tracking-tight text-white font-display">
            LinearFlow vs. Traditional Trackers
          </h3>
        </div>
        <span className="text-xs text-zinc-400">Benchmark across 120 engineering teams</span>
      </div>

      <div className="overflow-x-auto -mx-2 px-2">
        <table className="w-full min-w-[580px] border-collapse text-left">
          <thead>
            <tr className="border-b border-zinc-800">
              <th scope="col" className="py-4 pr-4 w-[36%] text-xs font-medium text-zinc-400">
                Workflow Dimension
              </th>
              <th
                scope="col"
                className="py-4 px-5 w-[32%] bg-zinc-900 border-t-2 border-x border-t-amber-400 border-x-zinc-700 rounded-t-lg"
              >
                <div className="text-xs font-medium text-amber-400 mb-0.5">Recommended</div>
                <div className="text-base font-semibold text-white font-display">LinearFlow</div>
              </th>
              <th scope="col" className="py-4 px-5 w-[32%]">
                <div className="text-xs text-zinc-500 mb-0.5">Legacy Stack</div>
                <div className="text-base font-medium text-zinc-300">Spreadsheets &amp; Tickets</div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/80">
            {HEAD_TO_HEAD.map((row) => (
              <tr key={row.criterion}>
                <th scope="row" className="py-4 pr-4 text-sm font-medium text-zinc-200">
                  {row.criterion}
                </th>
                <td className="py-4 px-5 bg-zinc-900/90 border-x border-zinc-700">
                  {typeof row.us === 'boolean' ? (
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-emerald-400">
                      <Check className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>Included natively</span>
                    </span>
                  ) : (
                    <span className="text-sm font-medium text-white tabular-nums">{row.us}</span>
                  )}
                </td>
                <td className="py-4 px-5">
                  {typeof row.them === 'boolean' ? (
                    <span className="inline-flex items-center gap-2 text-sm text-zinc-500">
                      <X className="w-4 h-4 text-rose-400 shrink-0" aria-hidden="true" />
                      <span>Not available</span>
                    </span>
                  ) : (
                    <span className="text-sm text-zinc-400 tabular-nums">{row.them}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
