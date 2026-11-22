import React, { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  Eye,
  Archive,
} from 'lucide-react';

interface InvoiceRow {
  id: string;
  client: string;
  project: string;
  issued: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
}

type SortKey = 'id' | 'client' | 'issued' | 'amount' | 'status';

const INITIAL_INVOICES: InvoiceRow[] = [
  { id: 'INV-4092', client: 'Northwind Logistics', project: 'Freight Telemetry Sync', issued: '2026-11-04', amount: 14800, status: 'Paid' },
  { id: 'INV-4093', client: 'Kestrel Robotics', project: 'Actuator Calibration Q4', issued: '2026-11-09', amount: 28450, status: 'Pending' },
  { id: 'INV-4094', client: 'Halcyon BioLabs', project: 'Cold-Chain Audit Portal', issued: '2026-10-21', amount: 9600, status: 'Overdue' },
  { id: 'INV-4095', client: 'Verve Transit Co.', project: 'Depot Dispatch Grid', issued: '2026-11-14', amount: 19200, status: 'Paid' },
  { id: 'INV-4096', client: 'Boreal Energy', project: 'Substation Load Ledger', issued: '2026-11-18', amount: 34100, status: 'Pending' },
];

export function Data1() {
  const [rows, setRows] = useState<InvoiceRow[]>(INITIAL_INVOICES);
  const [sortKey, setSortKey] = useState<SortKey>('issued');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selectedIds, setSelectedIds] = useState<string[]>(['INV-4093']);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'amount' || key === 'issued' ? 'desc' : 'asc');
    }
  };

  const sortedRows = [...rows].sort((a, b) => {
    const mult = sortDir === 'asc' ? 1 : -1;
    if (sortKey === 'amount') return (a.amount - b.amount) * mult;
    return a[sortKey].localeCompare(b[sortKey]) * mult;
  });

  const allSelected = sortedRows.length > 0 && selectedIds.length === sortedRows.length;

  const toggleAll = () => {
    setSelectedIds(allSelected ? [] : sortedRows.map((r) => r.id));
  };

  const toggleOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleArchive = (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
    setSelectedIds((prev) => prev.filter((item) => item !== id));
    setLastAction(`Archived ${id}`);
  };

  const renderSortIcon = (key: SortKey) => {
    if (sortKey !== key) return <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />;
    return sortDir === 'asc' ? (
      <ArrowUp className="h-3.5 w-3.5 text-slate-900" aria-hidden="true" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 text-slate-900" aria-hidden="true" />
    );
  };

  const statusPill = (status: InvoiceRow['status']) => {
    if (status === 'Paid') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 whitespace-nowrap">
          <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
          Paid
        </span>
      );
    }
    if (status === 'Pending') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800 ring-1 ring-inset ring-amber-600/20 whitespace-nowrap">
          <Clock className="h-3 w-3" aria-hidden="true" />
          Pending
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20 whitespace-nowrap">
        <AlertCircle className="h-3 w-3" aria-hidden="true" />
        Overdue
      </span>
    );
  };

  return (
    <section
      aria-label="Accounts receivable invoice ledger"
      className="rounded-xl border border-slate-200 bg-white overflow-hidden"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
        <div className="flex items-center gap-3 text-sm">
          <h3 className="font-semibold text-slate-900">Accounts Receivable</h3>
          <span className="text-slate-300" aria-hidden="true">·</span>
          <span className="text-xs text-slate-500 tabular-nums">{rows.length} invoices</span>
          {selectedIds.length > 0 && (
            <>
              <span className="text-slate-300" aria-hidden="true">·</span>
              <span className="text-xs font-medium text-indigo-700 tabular-nums">
                {selectedIds.length} selected
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {lastAction && (
            <span className="text-xs text-slate-500">{lastAction}</span>
          )}
          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-indigo-600 whitespace-nowrap shrink-0"
            >
              Clear selection
            </button>
          )}
          {rows.length < INITIAL_INVOICES.length && (
            <button
              type="button"
              onClick={() => {
                setRows(INITIAL_INVOICES);
                setLastAction('Restored ledger');
              }}
              className="rounded-md bg-slate-900 px-2.5 py-1 text-xs font-medium text-white hover:bg-slate-800 whitespace-nowrap shrink-0"
            >
              Restore
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600">
              <th scope="col" className="w-10 px-4 py-2.5">
                <input
                  type="checkbox"
                  aria-label="Select all invoices"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                />
              </th>
              {(
                [
                  ['id', 'Invoice'],
                  ['client', 'Client'],
                  ['issued', 'Issued'],
                  ['status', 'Status'],
                  ['amount', 'Amount'],
                ] as Array<[SortKey, string]>
              ).map(([key, label]) => (
                <th
                  key={key}
                  scope="col"
                  aria-sort={
                    sortKey === key
                      ? sortDir === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : 'none'
                  }
                  className={`px-3 py-2.5 font-medium ${key === 'amount' ? 'text-right' : ''}`}
                >
                  <button
                    type="button"
                    onClick={() => handleSort(key)}
                    className={`inline-flex items-center gap-1.5 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-indigo-600 rounded whitespace-nowrap ${
                      key === 'amount' ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <span>{label}</span>
                    {renderSortIcon(key)}
                  </button>
                </th>
              ))}
              <th scope="col" className="px-4 py-2.5 text-right font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedRows.map((row) => {
              const isSelected = selectedIds.includes(row.id);
              return (
                <tr
                  key={row.id}
                  aria-selected={isSelected}
                  className={`transition-colors ${
                    isSelected ? 'bg-indigo-50/60' : 'hover:bg-slate-50/80'
                  }`}
                >
                  <td className="px-4 py-2.5">
                    <input
                      type="checkbox"
                      aria-label={`Select invoice ${row.id}`}
                      checked={isSelected}
                      onChange={() => toggleOne(row.id)}
                      className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                    />
                  </td>
                  <td className="px-3 py-2.5 font-mono font-medium text-slate-900 whitespace-nowrap">
                    {row.id}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="font-medium text-slate-900">{row.client}</div>
                    <div className="text-[11px] text-slate-500">{row.project}</div>
                  </td>
                  <td className="px-3 py-2.5 font-mono text-slate-600 tabular-nums whitespace-nowrap">
                    <time dateTime={row.issued}>{row.issued}</time>
                  </td>
                  <td className="px-3 py-2.5">{statusPill(row.status)}</td>
                  <td className="px-3 py-2.5 text-right font-mono font-medium text-slate-900 tabular-nums whitespace-nowrap">
                    ${row.amount.toLocaleString('en-US')}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="inline-flex items-center justify-end gap-1">
                      <button
                        type="button"
                        aria-label={`Inspect ${row.id}`}
                        onClick={() => setLastAction(`Inspecting ${row.id}`)}
                        className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-indigo-600"
                      >
                        <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Download ${row.id} PDF`}
                        onClick={() => setLastAction(`Downloaded ${row.id}.pdf`)}
                        className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-indigo-600"
                      >
                        <Download className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Archive ${row.id}`}
                        onClick={() => handleArchive(row.id)}
                        className="rounded p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-indigo-600"
                      >
                        <Archive className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
