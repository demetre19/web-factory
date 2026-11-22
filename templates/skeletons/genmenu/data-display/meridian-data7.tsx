import React, { useState } from 'react';
import { ArrowDownRight, ArrowUpDown, ArrowUpRight } from 'lucide-react';

interface TreasuryAccount {
  id: string;
  code: string;
  name: string;
  balanceUsd: number;
  deltaPct: number;
  series: number[];
  yieldApy: string;
  custodian: string;
}

const ACCOUNTS: TreasuryAccount[] = [
  { id: 'usd-op', code: 'USD-OPS', name: 'Operating Sweep Account', balanceUsd: 4280500, deltaPct: 3.8, series: [39, 40, 39.5, 41, 41.2, 42.1, 42.8], yieldApy: '4.85% APY', custodian: 'Mercury Treasury' },
  { id: 'tbill', code: 'US-TBILL', name: '90-Day T-Bill Ladder', balanceUsd: 12650000, deltaPct: 1.2, series: [122, 123, 123.8, 124.2, 125, 126, 126.5], yieldApy: '5.12% APY', custodian: 'JPM Custody' },
  { id: 'eur-fx', code: 'EUR-LIQ', name: 'SEPA Settlement Pool', balanceUsd: 1890200, deltaPct: -1.4, series: [19.8, 19.6, 19.3, 19.5, 19.1, 19.0, 18.9], yieldApy: '3.20% APY', custodian: 'Citibank EMEA' },
  { id: 'gbp-fx', code: 'GBP-RES', name: 'UK Payroll Reserve', balanceUsd: 945000, deltaPct: 0.6, series: [9.1, 9.2, 9.15, 9.3, 9.35, 9.4, 9.45], yieldApy: '4.40% APY', custodian: 'HSBC Commercial' },
];

export function Data7() {
  const [sortBy, setSortBy] = useState<'balanceUsd' | 'deltaPct'>('balanceUsd');
  const [expandedId, setExpandedId] = useState<string>('tbill');

  const sorted = [...ACCOUNTS].sort((a, b) => b[sortBy] - a[sortBy]);

  const toPolyline = (vals: number[]) => {
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const span = max - min || 1;
    return vals
      .map((v, i) => {
        const x = 2 + (i / (vals.length - 1)) * 92;
        const y = 2 + 24 - ((v - min) / span) * 24;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  };

  return (
    <section
      aria-label="Dark treasury liquidity sparkline rows"
      className="rounded-xl border border-slate-800 bg-slate-950 text-slate-100 overflow-hidden"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-4 py-3">
        <h3 className="text-xs font-semibold tracking-wide text-slate-100">
          Treasury Liquidity Watchlist
        </h3>
        <button
          type="button"
          onClick={() => setSortBy((prev) => (prev === 'balanceUsd' ? 'deltaPct' : 'balanceUsd'))}
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:text-white whitespace-nowrap shrink-0"
        >
          <ArrowUpDown className="h-3 w-3" aria-hidden="true" />
          Sorted by: {sortBy === 'balanceUsd' ? 'Balance' : '24h Delta'}
        </button>
      </div>

      <ul className="divide-y divide-slate-800/80">
        {sorted.map((acct) => {
          const isExpanded = expandedId === acct.id;
          const isPositive = acct.deltaPct >= 0;
          return (
            <li key={acct.id}>
              <button
                type="button"
                aria-expanded={isExpanded}
                onClick={() => setExpandedId(isExpanded ? '' : acct.id)}
                className={`flex w-full flex-wrap items-center justify-between gap-3 px-4 py-3 text-left transition-colors ${
                  isExpanded ? 'bg-slate-900' : 'hover:bg-slate-900/50'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-sky-400">
                      {acct.code}
                    </span>
                    <span className="truncate text-xs text-slate-200">{acct.name}</span>
                  </div>
                </div>

                <div className="flex items-center gap-5">
                  <span className="font-mono text-base font-semibold text-white tabular-nums whitespace-nowrap">
                    ${(acct.balanceUsd / 1000000).toFixed(2)}M
                  </span>

                  <svg
                    width="96"
                    height="28"
                    viewBox="0 0 96 28"
                    role="img"
                    aria-label={`${acct.code} 7-day trend`}
                  >
                    <polyline
                      fill="none"
                      stroke={isPositive ? '#34D399' : '#FB7185'}
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={toPolyline(acct.series)}
                    />
                  </svg>

                  <span
                    className={`inline-flex w-16 items-center justify-end gap-0.5 font-mono text-xs font-medium tabular-nums whitespace-nowrap ${
                      isPositive ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isPositive ? (
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : (
                      <ArrowDownRight className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                    {isPositive ? '+' : ''}
                    {acct.deltaPct.toFixed(1)}%
                  </span>
                </div>
              </button>

              {isExpanded && (
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/60 bg-slate-900/70 px-4 py-2 text-[11px] text-slate-400">
                  <span>Custodian: <strong className="font-medium text-slate-200">{acct.custodian}</strong></span>
                  <span className="font-mono tabular-nums">
                    Exact Balance: <strong className="text-slate-200">${acct.balanceUsd.toLocaleString('en-US')}</strong> · {acct.yieldApy}
                  </span>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
