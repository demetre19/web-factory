import { useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, RefreshCw } from 'lucide-react';
import { formatCurrency, nextSortConfig, SortConfig, sortRecords } from '../../utils/tableLogic';

interface BillingStatement {
  id: string;
  invoiceNo: string;
  account: string;
  amount: number;
  status: 'Paid' | 'Processing' | 'Scheduled';
  date: string;
}

const STATEMENTS: BillingStatement[] = [
  { id: 'bs1', invoiceNo: 'STMT-9901', account: 'Aether Compute Cluster', amount: 3480, status: 'Paid', date: '2026-11-01' },
  { id: 'bs2', invoiceNo: 'STMT-9902', account: 'Vector Storage Tier', amount: 910, status: 'Processing', date: '2026-11-10' },
  { id: 'bs3', invoiceNo: 'STMT-9903', account: 'Global Edge CDN', amount: 1640, status: 'Paid', date: '2026-11-15' },
  { id: 'bs4', invoiceNo: 'STMT-9904', account: 'Managed Postgres HA', amount: 2290, status: 'Scheduled', date: '2026-11-25' },
  { id: 'bs5', invoiceNo: 'STMT-9905', account: 'SSO Enterprise Seat Pack', amount: 1120, status: 'Paid', date: '2026-11-18' },
];

export function Table12() {
  const [isLoading, setIsLoading] = useState(true);
  const [sort, setSort] = useState<SortConfig<keyof BillingStatement & string>>({ key: 'invoiceNo', direction: 'ascending' });

  const sorted = sortRecords(STATEMENTS, sort);

  const renderSortIcon = (key: keyof BillingStatement & string) => {
    if (sort.key !== key || sort.direction === 'none') return <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />;
    return sort.direction === 'ascending' ? <ArrowUp className="h-3.5 w-3.5 text-slate-900" /> : <ArrowDown className="h-3.5 w-3.5 text-slate-900" />;
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-200">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Monthly Billing Statements</h3>
          <p className="text-xs text-slate-500 mt-0.5">Loading skeleton variant · Exact row-height placeholder geometry</p>
        </div>
        <button
          type="button"
          onClick={() => setIsLoading((prev) => !prev)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          {isLoading ? 'Show Loaded Invoices' : 'Replay Loading Skeleton'}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold text-slate-500">
              <th scope="col" aria-sort={sort.key === 'invoiceNo' ? sort.direction : 'none'} className="px-5 py-3">
                <button type="button" onClick={() => setSort((p) => nextSortConfig(p, 'invoiceNo'))} className="inline-flex items-center gap-1.5 text-slate-700 hover:text-slate-950 cursor-pointer">
                  Statement # {renderSortIcon('invoiceNo')}
                </button>
              </th>
              <th scope="col" aria-sort={sort.key === 'account' ? sort.direction : 'none'} className="px-4 py-3">
                <button type="button" onClick={() => setSort((p) => nextSortConfig(p, 'account'))} className="inline-flex items-center gap-1.5 text-slate-700 hover:text-slate-950 cursor-pointer">
                  Account {renderSortIcon('account')}
                </button>
              </th>
              <th scope="col" aria-sort={sort.key === 'status' ? sort.direction : 'none'} className="px-4 py-3">
                <button type="button" onClick={() => setSort((p) => nextSortConfig(p, 'status'))} className="inline-flex items-center gap-1.5 text-slate-700 hover:text-slate-950 cursor-pointer">
                  Status {renderSortIcon('status')}
                </button>
              </th>
              <th scope="col" aria-sort={sort.key === 'amount' ? sort.direction : 'none'} className="px-4 py-3 text-right">
                <button type="button" onClick={() => setSort((p) => nextSortConfig(p, 'amount'))} className="inline-flex items-center justify-end gap-1.5 text-slate-700 hover:text-slate-950 cursor-pointer">
                  Amount {renderSortIcon('amount')}
                </button>
              </th>
              <th scope="col" aria-sort={sort.key === 'date' ? sort.direction : 'none'} className="px-5 py-3 text-right">
                <button type="button" onClick={() => setSort((p) => nextSortConfig(p, 'date'))} className="inline-flex items-center justify-end gap-1.5 text-slate-700 hover:text-slate-950 cursor-pointer">
                  Billing Date {renderSortIcon('date')}
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100" aria-busy={isLoading}>
            {isLoading
              ? Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={`skeleton-${idx}`}>
                    <td className="px-5 py-3.5">
                      <div className="h-4 w-24 rounded bg-slate-200/80 animate-pulse" />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="h-4 w-44 rounded bg-slate-200/80 animate-pulse" />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="h-5 w-20 rounded-full bg-slate-200/80 animate-pulse" />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="ml-auto h-4 w-16 rounded bg-slate-200/80 animate-pulse" />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="ml-auto h-4 w-20 rounded bg-slate-200/80 animate-pulse" />
                    </td>
                  </tr>
                ))
              : sorted.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-3.5 font-mono text-xs font-semibold text-slate-900">{row.invoiceNo}</td>
                    <td className="px-4 py-3.5 font-medium text-slate-800">{row.account}</td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          row.status === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700'
                            : row.status === 'Processing'
                            ? 'bg-sky-50 text-sky-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-sm font-semibold text-slate-900 tabular-nums">
                      {formatCurrency(row.amount)}
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono text-xs text-slate-500 tabular-nums">{row.date}</td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
