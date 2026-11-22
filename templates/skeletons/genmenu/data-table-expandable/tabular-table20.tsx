import { Fragment, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, CheckCircle2, ChevronDown, ChevronRight, MoreHorizontal, RotateCcw } from 'lucide-react';
import { formatCurrency, nextSortConfig, SortConfig, sortRecords, sumBy, toggleAllSelection, toggleSelection } from '../../utils/tableLogic';

interface ReconEntry {
  id: string;
  refNo: string;
  account: string;
  kind: 'Invoice' | 'Order' | 'Credit';
  date: string;
  gross: number;
  fee: number;
  status: 'Reconciled' | 'Pending' | 'Exception';
  gateway: string;
  notes: string;
}

const INITIAL_RECON: ReconEntry[] = [
  { id: 'rc1', refNo: 'REC-1041', account: 'Alpenhaus Retail GmbH', kind: 'Invoice', date: '2026-11-18', gross: 8400, fee: 210, status: 'Reconciled', gateway: 'SEPA Direct', notes: 'Settled in batch #412 with zero discrepancy.' },
  { id: 'rc2', refNo: 'REC-1042', account: 'Meridian Labs Inc', kind: 'Order', date: '2026-11-19', gross: 3250, fee: 98, status: 'Pending', gateway: 'Stripe ACH', notes: 'Awaiting T+2 clearing confirmation.' },
  { id: 'rc3', refNo: 'REC-1043', account: 'Fjord Apparel AS', kind: 'Invoice', date: '2026-11-20', gross: 5900, fee: 147.5, status: 'Exception', gateway: 'Wire Swift', notes: 'Short-paid by $45 intermediary bank charge.' },
  { id: 'rc4', refNo: 'REC-1044', account: 'Cascade Hardware', kind: 'Order', date: '2026-11-20', gross: 2180, fee: 65.4, status: 'Reconciled', gateway: 'Corporate Card', notes: 'Matched to shipment SHP-8812.' },
  { id: 'rc5', refNo: 'REC-1045', account: 'Solis Energy Partners', kind: 'Credit', date: '2026-11-21', gross: 1450, fee: 0, status: 'Reconciled', gateway: 'Internal Ledger', notes: 'Volume rebate credit applied to Q4 balance.' },
];

export function Table20() {
  const [entries, setEntries] = useState<ReconEntry[]>(INITIAL_RECON);
  const [sort, setSort] = useState<SortConfig<keyof ReconEntry & string>>({ key: 'refNo', direction: 'ascending' });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [expandedIds, setExpandedIds] = useState<string[]>(['rc3']);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [compact, setCompact] = useState(false);

  const sorted = sortRecords(entries, sort);
  const allChecked = sorted.length > 0 && sorted.every((e) => selectedIds.includes(e.id));

  const totalGross = sumBy(sorted, (e) => e.gross);
  const totalFee = sumBy(sorted, (e) => e.fee);
  const totalNet = totalGross - totalFee;

  const renderSortIcon = (key: keyof ReconEntry & string) => {
    if (sort.key !== key || sort.direction === 'none') return <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />;
    return sort.direction === 'ascending' ? <ArrowUp className="h-3.5 w-3.5 text-emerald-600" /> : <ArrowDown className="h-3.5 w-3.5 text-emerald-600" />;
  };

  const reconcileSelected = () => {
    setEntries((prev) => prev.map((e) => (selectedIds.includes(e.id) ? { ...e, status: 'Reconciled' } : e)));
    setSelectedIds([]);
  };

  const pad = compact ? 'py-2 px-3.5' : 'py-3.5 px-4';

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-visible">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-800 bg-slate-900 text-white rounded-t-xl">
        <div>
          <h3 className="text-sm font-semibold">Enterprise Reconciliation Ledger</h3>
          <p className="text-xs text-slate-300 mt-0.5">All-in-one · Sticky header, density toggle, bulk action, expand, menu & totals</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={reconcileSelected}
              className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500 px-2.5 py-1 text-xs font-semibold text-slate-950 hover:bg-emerald-400 cursor-pointer"
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Reconcile {selectedIds.length}
            </button>
          )}
          <button
            type="button"
            onClick={() => setCompact((c) => !c)}
            className="rounded-md border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-200 hover:bg-slate-700 cursor-pointer"
          >
            {compact ? 'Roomy Rows' : 'Compact Rows'}
          </button>
        </div>
      </div>

      <div className="max-h-80 overflow-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="sticky top-0 z-10 bg-slate-100 border-b border-slate-200 text-xs font-semibold text-slate-600">
            <tr>
              <th scope="col" className="w-10 px-3 py-3">
                <span className="sr-only">Expand</span>
              </th>
              <th scope="col" className="w-10 px-3 py-3">
                <input
                  type="checkbox"
                  aria-label="Select all reconciliation entries"
                  checked={allChecked}
                  onChange={() => setSelectedIds((p) => toggleAllSelection(p, sorted.map((e) => e.id)))}
                  className="h-4 w-4 rounded border-slate-300 text-slate-900 cursor-pointer"
                />
              </th>
              <th scope="col" aria-sort={sort.key === 'refNo' ? sort.direction : 'none'} className="px-4 py-3">
                <button type="button" onClick={() => setSort((p) => nextSortConfig(p, 'refNo'))} className="inline-flex items-center gap-1.5 hover:text-black cursor-pointer">
                  Ref # {renderSortIcon('refNo')}
                </button>
              </th>
              <th scope="col" aria-sort={sort.key === 'account' ? sort.direction : 'none'} className="px-4 py-3">
                <button type="button" onClick={() => setSort((p) => nextSortConfig(p, 'account'))} className="inline-flex items-center gap-1.5 hover:text-black cursor-pointer">
                  Counterparty {renderSortIcon('account')}
                </button>
              </th>
              <th scope="col" className="px-4 py-3">Type</th>
              <th scope="col" aria-sort={sort.key === 'status' ? sort.direction : 'none'} className="px-4 py-3">
                <button type="button" onClick={() => setSort((p) => nextSortConfig(p, 'status'))} className="inline-flex items-center gap-1.5 hover:text-black cursor-pointer">
                  Status {renderSortIcon('status')}
                </button>
              </th>
              <th scope="col" aria-sort={sort.key === 'gross' ? sort.direction : 'none'} className="px-4 py-3 text-right">
                <button type="button" onClick={() => setSort((p) => nextSortConfig(p, 'gross'))} className="inline-flex items-center justify-end gap-1.5 hover:text-black cursor-pointer">
                  Gross {renderSortIcon('gross')}
                </button>
              </th>
              <th scope="col" className="px-4 py-3 text-right">Net</th>
              <th scope="col" className="w-12 px-3 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sorted.map((entry) => {
              const checked = selectedIds.includes(entry.id);
              const isOpen = expandedIds.includes(entry.id);
              return (
                <Fragment key={entry.id}>
                  <tr className={checked ? 'bg-emerald-50/40' : 'hover:bg-slate-50/80'}>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        aria-label={`Inspect ${entry.refNo}`}
                        onClick={() => setExpandedIds((p) => (p.includes(entry.id) ? p.filter((x) => x !== entry.id) : [...p, entry.id]))}
                        className="inline-flex h-7 w-7 items-center justify-center rounded text-slate-500 hover:bg-slate-200/60 cursor-pointer"
                      >
                        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </button>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        aria-label={`Select ${entry.refNo}`}
                        checked={checked}
                        onChange={() => setSelectedIds((p) => toggleSelection(p, entry.id))}
                        className="h-4 w-4 rounded border-slate-300 text-slate-900 cursor-pointer"
                      />
                    </td>
                    <td className={`${pad} font-mono text-xs font-semibold text-slate-900`}>{entry.refNo}</td>
                    <td className={`${pad} font-medium text-slate-800`}>{entry.account}</td>
                    <td className={`${pad} text-xs text-slate-500`}>{entry.kind}</td>
                    <td className={pad}>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          entry.status === 'Reconciled'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : entry.status === 'Pending'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {entry.status}
                      </span>
                    </td>
                    <td className={`${pad} text-right font-mono text-xs text-slate-600 tabular-nums`}>{formatCurrency(entry.gross)}</td>
                    <td className={`${pad} text-right font-mono text-sm font-semibold text-slate-900 tabular-nums`}>
                      {formatCurrency(entry.gross - entry.fee)}
                    </td>
                    <td className="px-3 py-2 text-right relative">
                      <button
                        type="button"
                        aria-label={`Actions for ${entry.refNo}`}
                        aria-expanded={menuId === entry.id}
                        onClick={() => setMenuId((p) => (p === entry.id ? null : entry.id))}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 cursor-pointer"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                      {menuId === entry.id && (
                        <div role="menu" className="absolute right-3 top-10 z-20 w-44 rounded-lg border border-slate-200 bg-white py-1 shadow-lg text-left text-xs">
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => {
                              setEntries((prev) => prev.map((r) => (r.id === entry.id ? { ...r, status: 'Reconciled' } : r)));
                              setMenuId(null);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-emerald-700 hover:bg-emerald-50 cursor-pointer"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Mark Reconciled
                          </button>
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => {
                              setEntries((prev) => prev.map((r) => (r.id === entry.id ? { ...r, status: 'Exception' } : r)));
                              setMenuId(null);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-rose-700 hover:bg-rose-50 cursor-pointer"
                          >
                            <RotateCcw className="h-3.5 w-3.5" /> Flag Exception
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                  {isOpen && (
                    <tr className="bg-slate-50/70">
                      <td colSpan={9} className="px-12 py-3 text-xs text-slate-600 border-t border-slate-100">
                        <span className="font-semibold text-slate-800">{entry.gateway}</span> · {entry.date} · Fee: {formatCurrency(entry.fee)} — {entry.notes}
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-200 bg-slate-50 font-semibold text-slate-900">
              <td colSpan={6} className="px-4 py-3 text-xs text-slate-500">
                Summary Totals ({sorted.length} entries)
              </td>
              <td className="px-4 py-3 text-right font-mono text-xs text-slate-700 tabular-nums">{formatCurrency(totalGross)}</td>
              <td className="px-4 py-3 text-right font-mono text-sm font-bold text-slate-950 tabular-nums">{formatCurrency(totalNet)}</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
