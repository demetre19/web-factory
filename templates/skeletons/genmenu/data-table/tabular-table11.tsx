import { useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, Inbox, Plus, RotateCcw } from 'lucide-react';
import { formatCurrency, nextSortConfig, SortConfig, sortRecords } from '../../utils/tableLogic';

interface PendingOrder {
  id: string;
  orderId: string;
  buyer: string;
  region: string;
  amount: number;
  status: 'Confirmed' | 'Pending';
  created: string;
}

const SAMPLE_ORDERS: PendingOrder[] = [
  { id: 'eo1', orderId: 'ORD-3011', buyer: 'Copenhagen Roastery', region: 'EU-North', amount: 1420, status: 'Confirmed', created: '2026-11-20' },
  { id: 'eo2', orderId: 'ORD-3012', buyer: 'Highland Goods', region: 'UK', amount: 890, status: 'Pending', created: '2026-11-21' },
  { id: 'eo3', orderId: 'ORD-3013', buyer: 'Pacific Craft Co', region: 'US-West', amount: 2340, status: 'Confirmed', created: '2026-11-21' },
  { id: 'eo4', orderId: 'ORD-3014', buyer: 'Mitte Studio', region: 'EU-Central', amount: 615, status: 'Pending', created: '2026-11-21' },
];

export function Table11() {
  const [orders, setOrders] = useState<PendingOrder[]>([]);
  const [sort, setSort] = useState<SortConfig<keyof PendingOrder & string>>({ key: 'orderId', direction: 'ascending' });

  const sorted = sortRecords(orders, sort);

  const renderSortIcon = (key: keyof PendingOrder & string) => {
    if (sort.key !== key || sort.direction === 'none') return <ArrowUpDown className="h-3.5 w-3.5 text-zinc-400" />;
    return sort.direction === 'ascending' ? <ArrowUp className="h-3.5 w-3.5 text-zinc-900" /> : <ArrowDown className="h-3.5 w-3.5 text-zinc-900" />;
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-zinc-200">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900">Backorder Intake Queue</h3>
          <p className="text-xs text-zinc-500 mt-0.5">Empty state variant · Toggle between empty and populated states</p>
        </div>
        {orders.length > 0 && (
          <button
            type="button"
            onClick={() => setOrders([])}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Clear to Empty
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 text-xs font-medium text-zinc-500">
              <th scope="col" aria-sort={sort.key === 'orderId' ? sort.direction : 'none'} className="px-5 py-3">
                <button type="button" onClick={() => setSort((p) => nextSortConfig(p, 'orderId'))} className="inline-flex items-center gap-1.5 text-zinc-700 hover:text-black cursor-pointer">
                  Order # {renderSortIcon('orderId')}
                </button>
              </th>
              <th scope="col" aria-sort={sort.key === 'buyer' ? sort.direction : 'none'} className="px-4 py-3">
                <button type="button" onClick={() => setSort((p) => nextSortConfig(p, 'buyer'))} className="inline-flex items-center gap-1.5 text-zinc-700 hover:text-black cursor-pointer">
                  Buyer {renderSortIcon('buyer')}
                </button>
              </th>
              <th scope="col" className="px-4 py-3">Region</th>
              <th scope="col" aria-sort={sort.key === 'status' ? sort.direction : 'none'} className="px-4 py-3">
                <button type="button" onClick={() => setSort((p) => nextSortConfig(p, 'status'))} className="inline-flex items-center gap-1.5 text-zinc-700 hover:text-black cursor-pointer">
                  Status {renderSortIcon('status')}
                </button>
              </th>
              <th scope="col" aria-sort={sort.key === 'amount' ? sort.direction : 'none'} className="px-4 py-3 text-right">
                <button type="button" onClick={() => setSort((p) => nextSortConfig(p, 'amount'))} className="inline-flex items-center justify-end gap-1.5 text-zinc-700 hover:text-black cursor-pointer">
                  Amount {renderSortIcon('amount')}
                </button>
              </th>
              <th scope="col" className="px-5 py-3 text-right">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="mx-auto flex max-w-sm flex-col items-center">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-100 text-zinc-500">
                      <Inbox className="h-5 w-5" />
                    </div>
                    <h4 className="mt-3 text-sm font-semibold text-zinc-900">No backorders in queue</h4>
                    <p className="mt-1 text-xs text-zinc-500 leading-relaxed">
                      Incoming wholesale and retail backorders will appear here once synced from your storefront.
                    </p>
                    <button
                      type="button"
                      onClick={() => setOrders(SAMPLE_ORDERS)}
                      className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3.5 py-2 text-xs font-medium text-white hover:bg-zinc-800 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" /> Load Sample Orders
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              sorted.map((order) => (
                <tr key={order.id} className="hover:bg-zinc-50">
                  <td className="px-5 py-3 font-mono text-xs font-semibold text-zinc-900">{order.orderId}</td>
                  <td className="px-4 py-3 font-medium text-zinc-800">{order.buyer}</td>
                  <td className="px-4 py-3 text-xs text-zinc-500">{order.region}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        order.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm font-medium text-zinc-900 tabular-nums">
                    {formatCurrency(order.amount)}
                  </td>
                  <td className="px-5 py-3 text-right font-mono text-xs text-zinc-500 tabular-nums">{order.created}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
