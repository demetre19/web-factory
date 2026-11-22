import { useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, CheckCircle2, FileDown } from 'lucide-react';
import { formatCurrency, nextSortConfig, SortConfig, sortRecords, sumBy, toggleAllSelection, toggleSelection } from '../../utils/tableLogic';

interface Invoice {
  id: string;
  number: string;
  client: string;
  subtotal: number;
  tax: number;
  amount: number;
  status: 'Paid' | 'Due' | 'Overdue';
  dueDate: string;
}

const INITIAL_INVOICES: Invoice[] = [
  { id: 'i1', number: 'INV-2026-0412', client: 'Helios Logistics AG', subtotal: 4200, tax: 336, amount: 4536, status: 'Paid', dueDate: '2026-10-15' },
  { id: 'i2', number: 'INV-2026-0418', client: 'Kestrel BioLabs', subtotal: 11800, tax: 944, amount: 12744, status: 'Due', dueDate: '2026-11-28' },
  { id: 'i3', number: 'INV-2026-0419', client: 'Northstar Grid Corp', subtotal: 6450, tax: 516, amount: 6966, status: 'Overdue', dueDate: '2026-11-04' },
  { id: 'i4', number: 'INV-2026-0425', client: 'Veridian Architecture', subtotal: 3100, tax: 248, amount: 3348, status: 'Paid', dueDate: '2026-11-10' },
  { id: 'i5', number: 'INV-2026-0431', client: 'Boreal Maritime Ltd', subtotal: 8900, tax: 712, amount: 9612, status: 'Due', dueDate: '2026-12-05' },
];

const INV_BADGE: Record<Invoice['status'], string> = {
  Paid: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  Due: 'bg-slate-100 text-slate-700 border border-slate-200',
  Overdue: 'bg-rose-50 text-rose-700 border border-rose-200',
};

export function Table3() {
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [sort, setSort] = useState<SortConfig<keyof Invoice & string>>({ key: 'number', direction: 'ascending' });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const sorted = sortRecords(invoices, sort);
  const allChecked = sorted.length > 0 && sorted.every((i) => selectedIds.includes(i.id));

  const totalSubtotal = sumBy(sorted, (i) => i.subtotal);
  const totalTax = sumBy(sorted, (i) => i.tax);
  const totalAmount = sumBy(sorted, (i) => i.amount);
  const selectedTotal = sumBy(
    sorted.filter((i) => selectedIds.includes(i.id)),
    (i) => i.amount
  );

  const renderSortIcon = (key: keyof Invoice & string) => {
    if (sort.key !== key || sort.direction === 'none') return <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />;
    return sort.direction === 'ascending' ? <ArrowUp className="h-3.5 w-3.5 text-blue-700" /> : <ArrowDown className="h-3.5 w-3.5 text-blue-700" />;
  };

  const markSelectedPaid = () => {
    setInvoices((prev) => prev.map((inv) => (selectedIds.includes(inv.id) ? { ...inv, status: 'Paid' } : inv)));
    setSelectedIds([]);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-200 bg-slate-50/50">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Accounts Receivable Ledger</h3>
          <p className="text-xs text-slate-500 mt-0.5">Professional corporate · Footer totals & bulk settlement</p>
        </div>
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 rounded-lg bg-blue-950 px-3 py-1.5 text-xs text-white">
            <span className="font-medium tabular-nums">
              {selectedIds.length} selected ({formatCurrency(selectedTotal)})
            </span>
            <button
              type="button"
              onClick={markSelectedPaid}
              className="inline-flex items-center gap-1 rounded bg-blue-600 px-2 py-0.5 font-medium hover:bg-blue-500 cursor-pointer whitespace-nowrap"
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Mark Paid
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="text-blue-200 hover:text-white cursor-pointer whitespace-nowrap"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
              <th scope="col" className="w-11 px-4 py-3">
                <input
                  type="checkbox"
                  aria-label="Select all invoices"
                  checked={allChecked}
                  onChange={() => setSelectedIds((p) => toggleAllSelection(p, sorted.map((i) => i.id)))}
                  className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-700 cursor-pointer"
                />
              </th>
              <th scope="col" aria-sort={sort.key === 'number' ? sort.direction : 'none'} className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => setSort((p) => nextSortConfig(p, 'number'))}
                  className="inline-flex items-center gap-1.5 hover:text-slate-950 cursor-pointer"
                >
                  Invoice # {renderSortIcon('number')}
                </button>
              </th>
              <th scope="col" aria-sort={sort.key === 'client' ? sort.direction : 'none'} className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => setSort((p) => nextSortConfig(p, 'client'))}
                  className="inline-flex items-center gap-1.5 hover:text-slate-950 cursor-pointer"
                >
                  Client {renderSortIcon('client')}
                </button>
              </th>
              <th scope="col" aria-sort={sort.key === 'status' ? sort.direction : 'none'} className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => setSort((p) => nextSortConfig(p, 'status'))}
                  className="inline-flex items-center gap-1.5 hover:text-slate-950 cursor-pointer"
                >
                  Status {renderSortIcon('status')}
                </button>
              </th>
              <th scope="col" aria-sort={sort.key === 'dueDate' ? sort.direction : 'none'} className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => setSort((p) => nextSortConfig(p, 'dueDate'))}
                  className="inline-flex items-center gap-1.5 hover:text-slate-950 cursor-pointer"
                >
                  Due Date {renderSortIcon('dueDate')}
                </button>
              </th>
              <th scope="col" className="px-4 py-3 text-right">Subtotal</th>
              <th scope="col" className="px-4 py-3 text-right">Tax</th>
              <th scope="col" aria-sort={sort.key === 'amount' ? sort.direction : 'none'} className="px-5 py-3 text-right">
                <button
                  type="button"
                  onClick={() => setSort((p) => nextSortConfig(p, 'amount'))}
                  className="inline-flex items-center justify-end gap-1.5 hover:text-slate-950 cursor-pointer"
                >
                  Total {renderSortIcon('amount')}
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sorted.map((inv) => {
              const checked = selectedIds.includes(inv.id);
              return (
                <tr key={inv.id} className={checked ? 'bg-blue-50/40' : 'hover:bg-slate-50/80'}>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      aria-label={`Select ${inv.number}`}
                      checked={checked}
                      onChange={() => setSelectedIds((p) => toggleSelection(p, inv.id))}
                      className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-700 cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-3 font-mono text-xs font-medium text-blue-900">{inv.number}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{inv.client}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${INV_BADGE[inv.status]}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500 tabular-nums">{inv.dueDate}</td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-slate-600 tabular-nums">{formatCurrency(inv.subtotal)}</td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-slate-500 tabular-nums">{formatCurrency(inv.tax)}</td>
                  <td className="px-5 py-3 text-right font-mono text-sm font-semibold text-slate-900 tabular-nums">
                    {formatCurrency(inv.amount)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-200 bg-slate-50 font-semibold text-slate-900">
              <td colSpan={5} className="px-4 py-3 text-xs uppercase tracking-wider text-slate-500">
                Ledger Totals ({sorted.length} invoices)
              </td>
              <td className="px-4 py-3 text-right font-mono text-xs text-slate-700 tabular-nums">{formatCurrency(totalSubtotal)}</td>
              <td className="px-4 py-3 text-right font-mono text-xs text-slate-700 tabular-nums">{formatCurrency(totalTax)}</td>
              <td className="px-5 py-3 text-right font-mono text-sm font-bold text-blue-950 tabular-nums flex items-center justify-end gap-1.5">
                <FileDown className="h-3.5 w-3.5 text-slate-400" />
                {formatCurrency(totalAmount)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
