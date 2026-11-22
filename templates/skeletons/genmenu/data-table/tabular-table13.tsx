import { useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { formatCurrency, nextSortConfig, SortConfig, sortRecords, sumBy, toggleAllSelection, toggleSelection } from '../../utils/tableLogic';

interface BudgetRow {
  id: string;
  costCenter: string;
  department: string;
  q1Spend: number;
  q2Spend: number;
  budgetCap: number;
}

const BUDGETS: BudgetRow[] = [
  { id: 'bg1', costCenter: 'CC-401', department: 'Core Infrastructure', q1Spend: 48200, q2Spend: 51900, budgetCap: 105000 },
  { id: 'bg2', costCenter: 'CC-404', department: 'Product Design', q1Spend: 19400, q2Spend: 18100, budgetCap: 40000 },
  { id: 'bg3', costCenter: 'CC-412', department: 'Enterprise Sales', q1Spend: 32500, q2Spend: 38900, budgetCap: 68000 },
  { id: 'bg4', costCenter: 'CC-419', department: 'Security & Compliance', q1Spend: 24100, q2Spend: 23800, budgetCap: 50000 },
  { id: 'bg5', costCenter: 'CC-425', department: 'Customer Success', q1Spend: 15800, q2Spend: 16200, budgetCap: 34000 },
];

export function Table13() {
  const [sort, setSort] = useState<SortConfig<keyof BudgetRow & string>>({ key: 'costCenter', direction: 'ascending' });
  const [selectedIds, setSelectedIds] = useState<string[]>(['bg1', 'bg3']);

  const sorted = sortRecords(BUDGETS, sort);
  const allChecked = sorted.every((r) => selectedIds.includes(r.id));

  const q1Total = sumBy(sorted, (r) => r.q1Spend);
  const q2Total = sumBy(sorted, (r) => r.q2Spend);
  const capTotal = sumBy(sorted, (r) => r.budgetCap);
  const selectedCombined = sumBy(
    sorted.filter((r) => selectedIds.includes(r.id)),
    (r) => r.q1Spend + r.q2Spend
  );

  const renderSortIcon = (key: keyof BudgetRow & string) => {
    if (sort.key !== key || sort.direction === 'none') return <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />;
    return sort.direction === 'ascending' ? <ArrowUp className="h-3.5 w-3.5 text-slate-900" /> : <ArrowDown className="h-3.5 w-3.5 text-slate-900" />;
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-200">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Departmental Cost Center Ledger</h3>
          <p className="text-xs text-slate-500 mt-0.5">Footer totals & variance coding · Check rows to sum subtotal</p>
        </div>
        <span className="font-mono text-xs text-slate-600 tabular-nums">
          Selected H1 Spend: <strong className="text-slate-900">{formatCurrency(selectedCombined)}</strong>
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
              <th scope="col" className="w-11 px-4 py-3">
                <input
                  type="checkbox"
                  aria-label="Select all cost centers"
                  checked={allChecked}
                  onChange={() => setSelectedIds((p) => toggleAllSelection(p, sorted.map((r) => r.id)))}
                  className="h-4 w-4 rounded border-slate-300 text-slate-900 cursor-pointer"
                />
              </th>
              <th scope="col" aria-sort={sort.key === 'costCenter' ? sort.direction : 'none'} className="px-4 py-3">
                <button type="button" onClick={() => setSort((p) => nextSortConfig(p, 'costCenter'))} className="inline-flex items-center gap-1.5 hover:text-black cursor-pointer">
                  Code {renderSortIcon('costCenter')}
                </button>
              </th>
              <th scope="col" aria-sort={sort.key === 'department' ? sort.direction : 'none'} className="px-4 py-3">
                <button type="button" onClick={() => setSort((p) => nextSortConfig(p, 'department'))} className="inline-flex items-center gap-1.5 hover:text-black cursor-pointer">
                  Department {renderSortIcon('department')}
                </button>
              </th>
              <th scope="col" aria-sort={sort.key === 'q1Spend' ? sort.direction : 'none'} className="px-4 py-3 text-right">
                <button type="button" onClick={() => setSort((p) => nextSortConfig(p, 'q1Spend'))} className="inline-flex items-center justify-end gap-1.5 hover:text-black cursor-pointer">
                  Q1 Spend {renderSortIcon('q1Spend')}
                </button>
              </th>
              <th scope="col" aria-sort={sort.key === 'q2Spend' ? sort.direction : 'none'} className="px-4 py-3 text-right">
                <button type="button" onClick={() => setSort((p) => nextSortConfig(p, 'q2Spend'))} className="inline-flex items-center justify-end gap-1.5 hover:text-black cursor-pointer">
                  Q2 Spend {renderSortIcon('q2Spend')}
                </button>
              </th>
              <th scope="col" aria-sort={sort.key === 'budgetCap' ? sort.direction : 'none'} className="px-4 py-3 text-right">
                <button type="button" onClick={() => setSort((p) => nextSortConfig(p, 'budgetCap'))} className="inline-flex items-center justify-end gap-1.5 hover:text-black cursor-pointer">
                  H1 Cap {renderSortIcon('budgetCap')}
                </button>
              </th>
              <th scope="col" className="px-5 py-3 text-right">Variance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sorted.map((row) => {
              const combined = row.q1Spend + row.q2Spend;
              const variance = row.budgetCap - combined;
              const checked = selectedIds.includes(row.id);
              return (
                <tr key={row.id} className={checked ? 'bg-slate-50/90' : 'hover:bg-slate-50/50'}>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      aria-label={`Select ${row.department}`}
                      checked={checked}
                      onChange={() => setSelectedIds((p) => toggleSelection(p, row.id))}
                      className="h-4 w-4 rounded border-slate-300 text-slate-900 cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-3 font-mono text-xs font-medium text-slate-500">{row.costCenter}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{row.department}</td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-slate-700 tabular-nums">{formatCurrency(row.q1Spend)}</td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-slate-700 tabular-nums">{formatCurrency(row.q2Spend)}</td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-slate-500 tabular-nums">{formatCurrency(row.budgetCap)}</td>
                  <td className={`px-5 py-3 text-right font-mono text-xs font-semibold tabular-nums ${variance >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {variance >= 0 ? `+${formatCurrency(variance)}` : formatCurrency(variance)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-200 bg-slate-50 font-semibold text-slate-900">
              <td colSpan={3} className="px-4 py-3 text-xs text-slate-600">
                Total Portfolio ({sorted.length} cost centers)
              </td>
              <td className="px-4 py-3 text-right font-mono text-xs tabular-nums">{formatCurrency(q1Total)}</td>
              <td className="px-4 py-3 text-right font-mono text-xs tabular-nums">{formatCurrency(q2Total)}</td>
              <td className="px-4 py-3 text-right font-mono text-xs tabular-nums">{formatCurrency(capTotal)}</td>
              <td className="px-5 py-3 text-right font-mono text-xs font-bold text-emerald-700 tabular-nums">
                +{formatCurrency(capTotal - (q1Total + q2Total))}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
