import { useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, Ban, Check, MoreVertical, Send } from 'lucide-react';
import { formatCurrency, nextSortConfig, SortConfig, sortRecords } from '../../utils/tableLogic';

interface VendorBill {
  id: string;
  number: string;
  vendor: string;
  category: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue' | 'Disputed' | 'Draft';
  issued: string;
}

const INITIAL_BILLS: VendorBill[] = [
  { id: 'b1', number: 'BILL-8901', vendor: 'Cloudflare Enterprise', category: 'Infrastructure', amount: 2450, status: 'Paid', issued: '2026-11-01' },
  { id: 'b2', number: 'BILL-8904', vendor: 'Figma Organization', category: 'Design Tooling', amount: 1125, status: 'Pending', issued: '2026-11-12' },
  { id: 'b3', number: 'BILL-8892', vendor: 'Snowflake Computing', category: 'Data Warehouse', amount: 7840, status: 'Overdue', issued: '2026-10-20' },
  { id: 'b4', number: 'BILL-8908', vendor: 'Linear Orbit Inc', category: 'Product Ops', amount: 640, status: 'Draft', issued: '2026-11-18' },
  { id: 'b5', number: 'BILL-8897', vendor: 'Datadog Telemetry', category: 'Observability', amount: 3290, status: 'Disputed', issued: '2026-10-29' },
];

const COLOUR_STATUS: Record<VendorBill['status'], string> = {
  Paid: 'bg-emerald-600 text-white',
  Pending: 'bg-amber-500 text-amber-950',
  Overdue: 'bg-rose-600 text-white',
  Disputed: 'bg-violet-600 text-white',
  Draft: 'bg-indigo-100 text-indigo-800',
};

export function Table4() {
  const [bills, setBills] = useState<VendorBill[]>(INITIAL_BILLS);
  const [sort, setSort] = useState<SortConfig<keyof VendorBill & string>>({ key: 'issued', direction: 'descending' });
  const [activeStatus, setActiveStatus] = useState<'All' | VendorBill['status']>('All');
  const [menuId, setMenuId] = useState<string | null>(null);

  const visible = activeStatus === 'All' ? bills : bills.filter((b) => b.status === activeStatus);
  const sorted = sortRecords(visible, sort);

  const renderSortIcon = (key: keyof VendorBill & string) => {
    if (sort.key !== key || sort.direction === 'none') return <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />;
    return sort.direction === 'ascending' ? <ArrowUp className="h-3.5 w-3.5 text-indigo-600" /> : <ArrowDown className="h-3.5 w-3.5 text-indigo-600" />;
  };

  const setBillStatus = (id: string, status: VendorBill['status']) => {
    setBills((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    setMenuId(null);
  };

  return (
    <div className="rounded-xl border border-indigo-100 bg-white overflow-visible">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-indigo-100 bg-gradient-to-r from-indigo-50/60 via-white to-emerald-50/40">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Vendor Payables & Billing Queue</h3>
          <p className="text-xs text-slate-500 mt-0.5">Colourful status coding · Interactive status filter & actions</p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {(['All', 'Paid', 'Pending', 'Overdue', 'Disputed', 'Draft'] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setActiveStatus(status)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                activeStatus === status
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500">
              <th scope="col" aria-sort={sort.key === 'number' ? sort.direction : 'none'} className="px-5 py-3">
                <button
                  type="button"
                  onClick={() => setSort((p) => nextSortConfig(p, 'number'))}
                  className="inline-flex items-center gap-1.5 text-slate-700 hover:text-indigo-700 cursor-pointer"
                >
                  Bill # {renderSortIcon('number')}
                </button>
              </th>
              <th scope="col" aria-sort={sort.key === 'vendor' ? sort.direction : 'none'} className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => setSort((p) => nextSortConfig(p, 'vendor'))}
                  className="inline-flex items-center gap-1.5 text-slate-700 hover:text-indigo-700 cursor-pointer"
                >
                  Vendor {renderSortIcon('vendor')}
                </button>
              </th>
              <th scope="col" className="px-4 py-3">Category</th>
              <th scope="col" aria-sort={sort.key === 'amount' ? sort.direction : 'none'} className="px-4 py-3 text-right">
                <button
                  type="button"
                  onClick={() => setSort((p) => nextSortConfig(p, 'amount'))}
                  className="inline-flex items-center justify-end gap-1.5 text-slate-700 hover:text-indigo-700 cursor-pointer"
                >
                  Amount {renderSortIcon('amount')}
                </button>
              </th>
              <th scope="col" aria-sort={sort.key === 'status' ? sort.direction : 'none'} className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => setSort((p) => nextSortConfig(p, 'status'))}
                  className="inline-flex items-center gap-1.5 text-slate-700 hover:text-indigo-700 cursor-pointer"
                >
                  Status {renderSortIcon('status')}
                </button>
              </th>
              <th scope="col" aria-sort={sort.key === 'issued' ? sort.direction : 'none'} className="px-4 py-3 text-right">
                <button
                  type="button"
                  onClick={() => setSort((p) => nextSortConfig(p, 'issued'))}
                  className="inline-flex items-center justify-end gap-1.5 text-slate-700 hover:text-indigo-700 cursor-pointer"
                >
                  Issued {renderSortIcon('issued')}
                </button>
              </th>
              <th scope="col" className="w-12 px-4 py-3 text-right">
                <span className="sr-only">Row Menu</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sorted.map((bill) => (
              <tr key={bill.id} className="hover:bg-indigo-50/25 transition-colors">
                <td className="px-5 py-3.5 font-mono text-xs font-semibold text-indigo-700">{bill.number}</td>
                <td className="px-4 py-3.5 font-medium text-slate-900">{bill.vendor}</td>
                <td className="px-4 py-3.5 text-xs text-slate-500">{bill.category}</td>
                <td className="px-4 py-3.5 text-right font-mono text-sm font-semibold text-slate-900 tabular-nums">
                  {formatCurrency(bill.amount)}
                </td>
                <td className="px-4 py-3.5">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${COLOUR_STATUS[bill.status]}`}>
                    {bill.status}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-right font-mono text-xs text-slate-500 tabular-nums">{bill.issued}</td>
                <td className="px-4 py-3.5 text-right relative">
                  <button
                    type="button"
                    aria-label={`Open actions for ${bill.number}`}
                    aria-expanded={menuId === bill.id}
                    onClick={() => setMenuId((p) => (p === bill.id ? null : bill.id))}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                  {menuId === bill.id && (
                    <div
                      role="menu"
                      className="absolute right-4 top-11 z-20 w-44 rounded-lg border border-slate-200 bg-white py-1 shadow-lg text-left text-xs"
                    >
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => setBillStatus(bill.id, 'Paid')}
                        className="flex w-full items-center gap-2 px-3 py-2 text-emerald-700 hover:bg-emerald-50 cursor-pointer"
                      >
                        <Check className="h-3.5 w-3.5" /> Mark as Paid
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => setBillStatus(bill.id, 'Pending')}
                        className="flex w-full items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 cursor-pointer"
                      >
                        <Send className="h-3.5 w-3.5 text-amber-600" /> Send Approval Notice
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => setBillStatus(bill.id, 'Disputed')}
                        className="flex w-full items-center gap-2 px-3 py-2 text-rose-700 hover:bg-rose-50 cursor-pointer"
                      >
                        <Ban className="h-3.5 w-3.5" /> Flag Dispute
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
