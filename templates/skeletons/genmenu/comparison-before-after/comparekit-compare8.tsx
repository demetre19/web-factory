import { useState } from 'react';
import { computeDeltaPercentage } from '../../utils/comparisonHelpers';

const BENCHMARKS = [
  { metric: 'p95 Page Load (ms)', before: 1480, after: 310, unit: 'ms' },
  { metric: 'Cold Bundle Size (KB)', before: 640, after: 165, unit: 'KB' },
  { metric: 'Weekly Deploy Frequency', before: 4, after: 19, unit: 'deploys' },
  { metric: 'Monthly Compute Cost ($)', before: 4200, after: 1680, unit: 'USD' },
] as const;

export function Compare8() {
  const [splitPercent, setSplitPercent] = useState<number>(62);

  return (
    <section
      aria-labelledby="compare8-heading"
      className="w-full bg-[#FAF8F5] text-stone-900 border border-stone-200 rounded-xl p-6 md:p-10"
    >
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div className="max-w-xl">
          <p className="text-xs uppercase tracking-widest text-stone-500 mb-2">
            Editorial Before / After Case Study
          </p>
          <h3 id="compare8-heading" className="text-3xl font-serif font-medium tracking-tight text-stone-900">
            Q1 Legacy Monolith vs. Q4 Edge Rebuild
          </h3>
        </div>
        <div className="w-full md:w-64">
          <label htmlFor="compare8-slider" className="flex justify-between text-xs text-stone-600 mb-1.5">
            <span>Inspect Before / After Balance</span>
            <span className="font-mono tabular-nums">{splitPercent}%</span>
          </label>
          <input
            id="compare8-slider"
            type="range"
            min={15}
            max={85}
            value={splitPercent}
            onChange={(e) => setSplitPercent(Number(e.target.value))}
            className="w-full accent-stone-900 cursor-pointer"
          />
        </div>
      </div>

      {/* Visual Split Bar */}
      <div className="mb-8 border border-stone-300 rounded-lg overflow-hidden grid grid-cols-1 md:grid-cols-2">
        <div
          className="p-5 bg-stone-200/70 border-b md:border-b-0 md:border-r border-stone-300 transition-opacity"
          style={{ opacity: Math.max(0.45, (100 - splitPercent) / 70) }}
        >
          <div className="text-xs uppercase tracking-widest text-stone-500 mb-1">Before · Q1 Baseline</div>
          <div className="font-serif text-xl text-stone-800 mb-2">Monolithic Server Render</div>
          <p className="text-sm text-stone-600 leading-relaxed">
            Blocking database waterfalls on every request, 640 KB synchronous JavaScript payload, and manual weekly release trains.
          </p>
        </div>
        <div
          className="p-5 bg-[#EFEAE0] transition-opacity"
          style={{ opacity: Math.max(0.55, splitPercent / 70) }}
        >
          <div className="text-xs uppercase tracking-widest text-amber-900 font-semibold mb-1">
            After · Q4 Restructured (Winner)
          </div>
          <div className="font-serif text-xl text-stone-950 mb-2">Streaming Edge Architecture</div>
          <p className="text-sm text-stone-700 leading-relaxed">
            Sub-second edge caching with partial hydration, 74% lighter client bundle, and automated canary deployments.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto -mx-2 px-2">
        <table className="w-full min-w-[560px] border-collapse text-left">
          <thead>
            <tr className="border-y border-stone-300">
              <th scope="col" className="py-3.5 pr-4 w-[38%] text-xs uppercase tracking-wider text-stone-500 font-medium">
                Performance Indicator
              </th>
              <th scope="col" className="py-3.5 px-4 w-[20%] text-xs uppercase tracking-wider text-stone-500 font-medium">
                Q1 Before
              </th>
              <th scope="col" className="py-3.5 px-4 w-[22%] text-xs uppercase tracking-wider text-amber-900 font-semibold bg-[#F2ECE1]">
                Q4 After (Winner)
              </th>
              <th scope="col" className="py-3.5 pl-4 w-[20%] text-right text-xs uppercase tracking-wider text-stone-500 font-medium">
                Measured Change
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            {BENCHMARKS.map((row) => (
              <tr key={row.metric}>
                <th scope="row" className="py-3.5 pr-4 text-sm font-normal text-stone-800">
                  {row.metric}
                </th>
                <td className="py-3.5 px-4 font-mono text-sm text-stone-500 tabular-nums">
                  {row.before.toLocaleString()} {row.unit}
                </td>
                <td className="py-3.5 px-4 font-mono text-sm font-semibold text-stone-950 bg-[#F2ECE1]/70 tabular-nums">
                  {row.after.toLocaleString()} {row.unit}
                </td>
                <td className="py-3.5 pl-4 text-right font-mono text-xs font-semibold text-emerald-800 tabular-nums">
                  {computeDeltaPercentage(row.before, row.after)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
