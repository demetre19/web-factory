import { useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, Truck } from 'lucide-react';
import { formatCurrency, nextSortConfig, SortConfig, sortRecords, toggleAllSelection, toggleSelection } from '../../utils/tableLogic';

interface LogisticsOrder {
  id: string;
  orderNo: string;
  merchant: string;
  region: string;
  items: number;
  total: number;
  stage: 'Processing' | 'Packed' | 'In Transit' | 'Delivered' | 'On Hold';
  priority: 'Express' | 'Standard';
}

const INITIAL_ORDERS: LogisticsOrder[] = [
  { id: 'lo1', orderNo: 'SHP-5501', merchant: 'Vanguard Optics', region: 'North America', items: 4, total: 1840, stage: 'Processing', priority: 'Express' },
  { id: 'lo2', orderNo: 'SHP-5502', merchant: 'Harbor Ceramics', region: 'Europe', items: 12, total: 960, stage: 'Packed', priority: 'Standard' },
  { id: 'lo3', orderNo: 'SHP-5503', merchant: 'Kumo Robotics', region: 'APAC', items: 2, total: 6420, stage: 'In Transit', priority: 'Express' },
  { id: 'lo4', orderNo: 'SHP-5504', merchant: 'Loom Textiles', region: 'Europe', items: 7, total: 1120, stage: 'Delivered', priority: 'Standard' },
  { id: 'lo5', orderNo: 'SHP-5505', merchant: 'Solstice Audio', region: 'North America', items: 3, total: 2790, stage: 'On Hold', priority: 'Express' },
];

const STAGE_STYLE: Record<LogisticsOrder['stage'], string> = {
  Processing: 'bg-sky-600 text-white',
  Packed: 'bg-violet-600 text-white',
  'In Transit': 'bg-amber-500 text-amber-950',
  Delivered: 'bg-emerald-600 text-white',
  'On Hold': 'bg-rose-600 text-white',
};

export function Table16() {
  const [orders, setOrders] = useState<LogisticsOrder[]>(INITIAL_ORDERS);
  const [sort, setSort] = useState<SortConfig<keyof LogisticsOrder & string>>({ key: 'orderNo', direction: 'ascending' });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const sorted = sortRecords(orders, sort);
  const allChecked = sorted.length > 0 && sorted.every((o) => selectedIds.includes(o.id));

  const renderSortIcon = (key: keyof LogisticsOrder & string) => {
    if (sort.key !== key || sort.direction === 'none') return <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />;
    return sort.direction === 'ascending' ? <ArrowUp className="h-3.5 w-3.5 text-sky-700" /> : <ArrowDown className="h-3.5 w-3.5 text-sky-700" />;
  };

  const bulkSetStage = (stage: LogisticsOrder['stage']) => {
    setOrders((prev) => prev.map((o) => (selectedIds.includes(o.id) ? { ...o, stage } : o)));
    setSelectedIds([]);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-200">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Logistics Fulfillment Pipeline</h3>
          <p className="text-xs text-slate-500 mt-0.5">Colourful stage coding · Bulk stage transition actions</p>
        </div>
        {selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 rounded-lg bg-sky-950 px-3 py-1.5 text-xs text-white">
            <span className="font-medium tabular-nums">{selectedIds.length} selected</span>
            <button
              type="button"
              onClick={() => bulkSetStage('In Transit')}
              className="inline-flex items-center gap-1 rounded bg-amber-400 px-2 py-0.5 font-semibold text-amber-950 hover:bg-amber-300 cursor-pointer"
            >
              <Truck className="h-3 w-3" /> Mark In Transit
            </button>
            <button
              type="button"
              onClick={() => bulkSetStage('Delivered')}
              className="rounded bg-emerald-500 px-2 py-0.5 font-semibold text-white hover:bg-emerald-400 cursor-pointer"
            >
              Mark Delivered
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
                  aria-label="Select all shipments"
                  checked={allChecked}
                  onChange={() => setSelectedIds((p) => toggleAllSelection(p, sorted.map((o) => o.id)))}
                  className="h-4 w-4 rounded border-slate-300 text-sky-600 cursor-pointer"
                />
              </th>
              <th scope="col" aria-sort={sort.key === 'orderNo' ? sort.direction : 'none'} className="px-4 py-3">
                <button type="button" onClick={() => setSort((p) => nextSortConfig(p, 'orderNo'))} className="inline-flex items-center gap-1.5 hover:text-sky-800 cursor-pointer">
                  Shipment {renderSortIcon('orderNo')}
                </button>
              </th>
              <th scope="col" aria-sort={sort.key === 'merchant' ? sort.direction : 'none'} className="px-4 py-3">
                <button type="button" onClick={() => setSort((p) => nextSortConfig(p, 'merchant'))} className="inline-flex items-center gap-1.5 hover:text-sky-800 cursor-pointer">
                  Merchant {renderSortIcon('merchant')}
                </button>
              </th>
              <th scope="col" className="px-4 py-3">Region</th>
              <th scope="col" className="px-4 py-3">Priority</th>
              <th scope="col" aria-sort={sort.key === 'stage' ? sort.direction : 'none'} className="px-4 py-3">
                <button type="button" onClick={() => setSort((p) => nextSortConfig(p, 'stage'))} className="inline-flex items-center gap-1.5 hover:text-sky-800 cursor-pointer">
                  Stage {renderSortIcon('stage')}
                </button>
              </th>
              <th scope="col" aria-sort={sort.key === 'total' ? sort.direction : 'none'} className="px-5 py-3 text-right">
                <button type="button" onClick={() => setSort((p) => nextSortConfig(p, 'total'))} className="inline-flex items-center justify-end gap-1.5 hover:text-sky-800 cursor-pointer">
                  Value {renderSortIcon('total')}
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sorted.map((order) => {
              const checked = selectedIds.includes(order.id);
              return (
                <tr key={order.id} className={checked ? 'bg-sky-50/50' : 'hover:bg-slate-50'}>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      aria-label={`Select ${order.orderNo}`}
                      checked={checked}
                      onChange={() => setSelectedIds((p) => toggleSelection(p, order.id))}
                      className="h-4 w-4 rounded border-slate-300 text-sky-600 cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-900">{order.orderNo}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{order.merchant}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{order.region}</td>
                  <td className="px-4 py-3 text-xs font-medium text-slate-700">{order.priority}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STAGE_STYLE[order.stage]}`}>
                      {order.stage}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right font-mono text-sm font-semibold text-slate-900 tabular-nums">
                    {formatCurrency(order.total)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
