import { Fragment, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronDown, ChevronRight } from 'lucide-react';
import { formatCurrency, nextSortConfig, SortConfig, sortRecords, sumBy } from '../../utils/tableLogic';

interface SubTask {
  id: string;
  task: string;
  assignee: string;
  hours: number;
  cost: number;
  status: 'Done' | 'In Progress' | 'Blocked';
}

interface WorkOrder {
  id: string;
  woNumber: string;
  title: string;
  lead: string;
  totalHours: number;
  totalCost: number;
  status: 'Active' | 'Completed';
  subtasks: SubTask[];
}

const WORK_ORDERS: WorkOrder[] = [
  {
    id: 'wo1',
    woNumber: 'WO-801',
    title: 'Edge Telemetry Collector v2',
    lead: 'Sora Takahashi',
    totalHours: 46,
    totalCost: 6900,
    status: 'Active',
    subtasks: [
      { id: 'st1', task: 'Rust gRPC ingestion buffer', assignee: 'Sora T.', hours: 22, cost: 3300, status: 'Done' },
      { id: 'st2', task: 'ClickHouse batch writer', assignee: 'Devon B.', hours: 16, cost: 2400, status: 'In Progress' },
      { id: 'st3', task: 'Failover soak testing', assignee: 'Nadia A.', hours: 8, cost: 1200, status: 'Blocked' },
    ],
  },
  {
    id: 'wo2',
    woNumber: 'WO-804',
    title: 'Checkout Tax Engine Migration',
    lead: 'Marcus Vance',
    totalHours: 30,
    totalCost: 4500,
    status: 'Completed',
    subtasks: [
      { id: 'st4', task: 'EU VAT reverse-charge rules', assignee: 'Marcus V.', hours: 18, cost: 2700, status: 'Done' },
      { id: 'st5', task: 'Invoice PDF line breakdown', assignee: 'Ava M.', hours: 12, cost: 1800, status: 'Done' },
    ],
  },
  {
    id: 'wo3',
    woNumber: 'WO-809',
    title: 'Warehouse Barcode Scanner Firmware',
    lead: 'Liam Gallagher',
    totalHours: 24,
    totalCost: 3600,
    status: 'Active',
    subtasks: [
      { id: 'st6', task: 'Offline queue persistence', assignee: 'Liam G.', hours: 14, cost: 2100, status: 'Done' },
      { id: 'st7', task: 'BLE reconnect watchdog', assignee: 'Liam G.', hours: 10, cost: 1500, status: 'In Progress' },
    ],
  },
];

export function Table14() {
  const [sort, setSort] = useState<SortConfig<'woNumber' | 'title' | 'totalHours' | 'totalCost'>>({ key: 'woNumber', direction: 'ascending' });
  const [expanded, setExpanded] = useState<string[]>(['wo1']);

  const sorted = sortRecords(WORK_ORDERS, sort);

  const toggleRow = (id: string) => {
    setExpanded((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const renderSortIcon = (key: 'woNumber' | 'title' | 'totalHours' | 'totalCost') => {
    if (sort.key !== key || sort.direction === 'none') return <ArrowUpDown className="h-3.5 w-3.5 text-zinc-500" />;
    return sort.direction === 'ascending' ? <ArrowUp className="h-3.5 w-3.5 text-indigo-400" /> : <ArrowDown className="h-3.5 w-3.5 text-indigo-400" />;
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-100 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-zinc-800">
        <div>
          <h3 className="text-sm font-semibold text-white">Engineering Work Orders</h3>
          <p className="text-xs text-zinc-400 mt-0.5">Dark nested sub-rows · Parent rollups & milestone subtasks</p>
        </div>
        <span className="font-mono text-xs text-zinc-400 tabular-nums">
          {sumBy(WORK_ORDERS, (w) => w.totalHours)}h logged · {formatCurrency(sumBy(WORK_ORDERS, (w) => w.totalCost))}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-950/60 text-xs font-medium text-zinc-400">
              <th scope="col" aria-sort={sort.key === 'woNumber' ? sort.direction : 'none'} className="px-4 py-3">
                <button type="button" onClick={() => setSort((p) => nextSortConfig(p, 'woNumber'))} className="inline-flex items-center gap-1.5 text-zinc-300 hover:text-white cursor-pointer">
                  Order # {renderSortIcon('woNumber')}
                </button>
              </th>
              <th scope="col" aria-sort={sort.key === 'title' ? sort.direction : 'none'} className="px-4 py-3">
                <button type="button" onClick={() => setSort((p) => nextSortConfig(p, 'title'))} className="inline-flex items-center gap-1.5 text-zinc-300 hover:text-white cursor-pointer">
                  Workstream / Sub-task {renderSortIcon('title')}
                </button>
              </th>
              <th scope="col" className="px-4 py-3">Assignee</th>
              <th scope="col" aria-sort={sort.key === 'totalHours' ? sort.direction : 'none'} className="px-4 py-3 text-right">
                <button type="button" onClick={() => setSort((p) => nextSortConfig(p, 'totalHours'))} className="inline-flex items-center justify-end gap-1.5 text-zinc-300 hover:text-white cursor-pointer">
                  Hours {renderSortIcon('totalHours')}
                </button>
              </th>
              <th scope="col" aria-sort={sort.key === 'totalCost' ? sort.direction : 'none'} className="px-4 py-3 text-right">
                <button type="button" onClick={() => setSort((p) => nextSortConfig(p, 'totalCost'))} className="inline-flex items-center justify-end gap-1.5 text-zinc-300 hover:text-white cursor-pointer">
                  Cost {renderSortIcon('totalCost')}
                </button>
              </th>
              <th scope="col" className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/80">
            {sorted.map((wo) => {
              const isOpen = expanded.includes(wo.id);
              return (
                <Fragment key={wo.id}>
                  <tr className="bg-zinc-900 hover:bg-zinc-800/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          aria-expanded={isOpen}
                          aria-label={`Toggle subtasks for ${wo.woNumber}`}
                          onClick={() => toggleRow(wo.id)}
                          className="inline-flex h-6 w-6 items-center justify-center rounded text-zinc-400 hover:bg-zinc-800 hover:text-white cursor-pointer"
                        >
                          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </button>
                        <span className="font-mono text-xs font-semibold text-indigo-300">{wo.woNumber}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-white">{wo.title}</td>
                    <td className="px-4 py-3 text-xs text-zinc-300">{wo.lead}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-zinc-200 tabular-nums">{wo.totalHours}h</td>
                    <td className="px-4 py-3 text-right font-mono text-xs font-semibold text-white tabular-nums">{formatCurrency(wo.totalCost)}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          wo.status === 'Completed' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-indigo-500/20 text-indigo-300'
                        }`}
                      >
                        {wo.status}
                      </span>
                    </td>
                  </tr>
                  {isOpen &&
                    wo.subtasks.map((sub) => (
                      <tr key={sub.id} className="bg-zinc-950/50 hover:bg-zinc-800/30">
                        <td className="px-4 py-2.5 font-mono text-[11px] text-zinc-500 pl-12">└</td>
                        <td className="px-4 py-2.5 text-xs text-zinc-300 pl-6">{sub.task}</td>
                        <td className="px-4 py-2.5 text-xs text-zinc-400">{sub.assignee}</td>
                        <td className="px-4 py-2.5 text-right font-mono text-xs text-zinc-400 tabular-nums">{sub.hours}h</td>
                        <td className="px-4 py-2.5 text-right font-mono text-xs text-zinc-400 tabular-nums">{formatCurrency(sub.cost)}</td>
                        <td className="px-5 py-2.5">
                          <span
                            className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] font-medium ${
                              sub.status === 'Done'
                                ? 'bg-emerald-500/10 text-emerald-300'
                                : sub.status === 'In Progress'
                                ? 'bg-sky-500/10 text-sky-300'
                                : 'bg-rose-500/10 text-rose-300'
                            }`}
                          >
                            {sub.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
