import { useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, Download, Printer } from 'lucide-react';
import { formatCurrency, nextSortConfig, SortConfig, sortRecords, toggleAllSelection, toggleSelection } from '../../utils/tableLogic';

interface StreamOrder {
  id: string;
  orderNo: string;
  channel: 'Web Store' | 'Wholesale' | 'POS Terminal' | 'Marketplace';
  skuCount: number;
  value: number;
  payment: 'Captured' | 'Authorized' | 'Refunded';
  stage: 'Dispatched' | 'Queued' | 'Cancelled';
}

const STREAM_ORDERS: StreamOrder[] = [
  { id: 'so1', orderNo: '#90412', channel: 'Web Store', skuCount: 2, value: 318, payment: 'Captured', stage: 'Dispatched' },
  { id: 'so2', orderNo: '#90413', channel: 'Wholesale', skuCount: 14, value: 4920, payment: 'Captured', stage: 'Queued' },
  { id: 'so3', orderNo: '#90414', channel: 'Marketplace', skuCount: 1, value: 89, payment: 'Authorized', stage: 'Queued' },
  { id: 'so4', orderNo: '#90415', channel: 'POS Terminal', skuCount: 3, value: 412, payment: 'Captured', stage: 'Dispatched' },
  { id: 'so5', orderNo: '#90416', channel: 'Web Store', skuCount: 1, value: 145, payment: 'Refunded', stage: 'Cancelled' },
  { id: 'so6', orderNo: '#90417', channel: 'Wholesale', skuCount: 8, value: 2150, payment: 'Captured', stage: 'Dispatched' },
  { id: 'so7', orderNo: '#90418', channel: 'Marketplace', skuCount: 4, value: 540, payment: 'Captured', stage: 'Dispatched' },
  { id: 'so8', orderNo: '#90419', channel: 'Web Store', skuCount: 2, value: 276, payment: 'Authorized', stage: 'Queued' },
  { id: 'so9', orderNo: '#90420', channel: 'POS Terminal', skuCount: 5, value: 690, payment: 'Captured', stage: 'Dispatched' },
];

export function Table6() {
  const [orders, setOrders] = useState<StreamOrder[]>(STREAM_ORDERS);
  const [sort, setSort] = useState<SortConfig<keyof StreamOrder & string>>({ key: 'orderNo', direction: 'descending' });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [notice, setNotice] = useState<string | null>(null);

  const sorted = sortRecords(orders, sort);
  const allChecked = sorted.length > 0 && sorted.every((o) => selectedIds.includes(o.id));

  const renderSortIcon = (key: keyof StreamOrder & string) => {
    if (sort.key !== key || sort.direction === 'none') return <ArrowUpDown className="h-3 w-3 text-neutral-500" />;
    return sort.direction === 'ascending' ? <ArrowUp className="h-3 w-3 text-amber-400" /> : <ArrowDown className="h-3 w-3 text-amber-400" />;
  };

  const dispatchSelected = () => {
    setOrders((prev) => prev.map((o) => (selectedIds.includes(o.id) ? { ...o, stage: 'Dispatched', payment: 'Captured' } : o)));
    setNotice(`Queued labels for ${selectedIds.length} orders`);
    setSelectedIds([]);
  };

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-950 text-neutral-100 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-neutral-800">
        <div>
          <h3 className="text-sm font-semibold text-white">Live Order Dispatch Stream</h3>
          <p className="text-xs text-neutral-400">Dark compact density · Sticky header scroll container</p>
        </div>
        <div className="flex items-center gap-2">
          {notice && <span className="text-xs text-emerald-400">{notice}</span>}
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 rounded-md bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 text-xs text-amber-200">
              <span className="tabular-nums font-medium">{selectedIds.length} selected</span>
              <button
                type="button"
                onClick={dispatchSelected}
                className="inline-flex items-center gap-1 font-medium text-amber-300 hover:text-white cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" /> Dispatch & Print
              </button>
              <button
                type="button"
                onClick={() => {
                  setNotice(`Exported ${selectedIds.length} CSV rows`);
                  setSelectedIds([]);
                }}
                className="inline-flex items-center gap-1 text-neutral-300 hover:text-white cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" /> Export
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-h-64 overflow-y-auto overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead className="sticky top-0 z-10 bg-neutral-900/95 backdrop-blur border-b border-neutral-800 text-neutral-400">
            <tr>
              <th scope="col" className="w-10 px-3 py-2.5">
                <input
                  type="checkbox"
                  aria-label="Select all stream orders"
                  checked={allChecked}
                  onChange={() => setSelectedIds((p) => toggleAllSelection(p, sorted.map((o) => o.id)))}
                  className="h-3.5 w-3.5 rounded border-neutral-600 bg-neutral-900 text-amber-500 cursor-pointer"
                />
              </th>
              <th scope="col" aria-sort={sort.key === 'orderNo' ? sort.direction : 'none'} className="px-3 py-2.5">
                <button type="button" onClick={() => setSort((p) => nextSortConfig(p, 'orderNo'))} className="inline-flex items-center gap-1 text-neutral-300 hover:text-white cursor-pointer">
                  Order # {renderSortIcon('orderNo')}
                </button>
              </th>
              <th scope="col" aria-sort={sort.key === 'channel' ? sort.direction : 'none'} className="px-3 py-2.5">
                <button type="button" onClick={() => setSort((p) => nextSortConfig(p, 'channel'))} className="inline-flex items-center gap-1 text-neutral-300 hover:text-white cursor-pointer">
                  Channel {renderSortIcon('channel')}
                </button>
              </th>
              <th scope="col" aria-sort={sort.key === 'skuCount' ? sort.direction : 'none'} className="px-3 py-2.5 text-right">
                <button type="button" onClick={() => setSort((p) => nextSortConfig(p, 'skuCount'))} className="inline-flex items-center justify-end gap-1 text-neutral-300 hover:text-white cursor-pointer">
                  SKUs {renderSortIcon('skuCount')}
                </button>
              </th>
              <th scope="col" aria-sort={sort.key === 'value' ? sort.direction : 'none'} className="px-3 py-2.5 text-right">
                <button type="button" onClick={() => setSort((p) => nextSortConfig(p, 'value'))} className="inline-flex items-center justify-end gap-1 text-neutral-300 hover:text-white cursor-pointer">
                  Value {renderSortIcon('value')}
                </button>
              </th>
              <th scope="col" className="px-3 py-2.5">Payment</th>
              <th scope="col" aria-sort={sort.key === 'stage' ? sort.direction : 'none'} className="px-4 py-2.5">
                <button type="button" onClick={() => setSort((p) => nextSortConfig(p, 'stage'))} className="inline-flex items-center gap-1 text-neutral-300 hover:text-white cursor-pointer">
                  Stage {renderSortIcon('stage')}
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/80">
            {sorted.map((order) => {
              const checked = selectedIds.includes(order.id);
              return (
                <tr key={order.id} className={checked ? 'bg-amber-500/10' : 'hover:bg-neutral-900/70'}>
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      aria-label={`Select order ${order.orderNo}`}
                      checked={checked}
                      onChange={() => setSelectedIds((p) => toggleSelection(p, order.id))}
                      className="h-3.5 w-3.5 rounded border-neutral-600 bg-neutral-900 text-amber-500 cursor-pointer"
                    />
                  </td>
                  <td className="px-3 py-2 font-mono font-semibold text-amber-300">{order.orderNo}</td>
                  <td className="px-3 py-2 text-neutral-200">{order.channel}</td>
                  <td className="px-3 py-2 text-right font-mono text-neutral-400 tabular-nums">{order.skuCount}</td>
                  <td className="px-3 py-2 text-right font-mono font-medium text-neutral-100 tabular-nums">{formatCurrency(order.value)}</td>
                  <td className="px-3 py-2 text-neutral-300">{order.payment}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] font-medium ${
                        order.stage === 'Dispatched'
                          ? 'bg-emerald-500/15 text-emerald-300'
                          : order.stage === 'Queued'
                          ? 'bg-sky-500/15 text-sky-300'
                          : 'bg-rose-500/15 text-rose-300'
                      }`}
                    >
                      {order.stage}
                    </span>
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
