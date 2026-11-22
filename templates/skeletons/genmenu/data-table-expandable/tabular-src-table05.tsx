import { Fragment, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronDown, ChevronRight, Package, Truck } from 'lucide-react';
import { formatCurrency, nextSortConfig, SortConfig, sortRecords } from '../../utils/tableLogic';

interface OrderLineItem {
  sku: string;
  product: string;
  qty: number;
  unitPrice: number;
}

interface OrderRecord {
  id: string;
  orderNumber: string;
  customer: string;
  itemCount: number;
  total: number;
  status: 'Shipped' | 'Packing' | 'Delivered';
  placedAt: string;
  carrier: string;
  tracking: string;
  destination: string;
  items: OrderLineItem[];
}

const ORDERS: OrderRecord[] = [
  {
    id: 'o1',
    orderNumber: 'ORD-7741',
    customer: 'Atelier Nord',
    itemCount: 3,
    total: 1284,
    status: 'Shipped',
    placedAt: '2026-11-19',
    carrier: 'DHL Express',
    tracking: 'DHL-99281740',
    destination: 'Zurich, CH',
    items: [
      { sku: 'AN-LAMP-04', product: 'Brushed Brass Task Lamp', qty: 2, unitPrice: 440 },
      { sku: 'AN-TRAY-12', product: 'Travertine Desk Valet', qty: 1, unitPrice: 404 },
    ],
  },
  {
    id: 'o2',
    orderNumber: 'ORD-7742',
    customer: 'Studio Meridian',
    itemCount: 5,
    total: 2490,
    status: 'Packing',
    placedAt: '2026-11-20',
    carrier: 'FedEx Priority',
    tracking: 'FDX-44102938',
    destination: 'Austin, US',
    items: [
      { sku: 'SM-CHR-01', product: 'Ergonomic Task Chair', qty: 2, unitPrice: 895 },
      { sku: 'SM-MAT-09', product: 'Wool Felt Desk Mat', qty: 3, unitPrice: 233.33 },
    ],
  },
  {
    id: 'o3',
    orderNumber: 'ORD-7738',
    customer: 'Kanso Hospitality',
    itemCount: 2,
    total: 860,
    status: 'Delivered',
    placedAt: '2026-11-15',
    carrier: 'UPS Freight',
    tracking: '1Z-88392011',
    destination: 'Kyoto, JP',
    items: [
      { sku: 'KH-POT-07', product: 'Cast Iron Kettle Set', qty: 2, unitPrice: 430 },
    ],
  },
  {
    id: 'o4',
    orderNumber: 'ORD-7745',
    customer: 'Oslo Roasters',
    itemCount: 4,
    total: 1620,
    status: 'Shipped',
    placedAt: '2026-11-21',
    carrier: 'PostNord',
    tracking: 'PN-77120049',
    destination: 'Oslo, NO',
    items: [
      { sku: 'OR-GRN-02', product: 'Precision Burr Grinder', qty: 4, unitPrice: 405 },
    ],
  },
];

const ORDER_STATUS: Record<OrderRecord['status'], string> = {
  Shipped: 'bg-sky-50 text-sky-700 border border-sky-200',
  Packing: 'bg-amber-50 text-amber-800 border border-amber-200',
  Delivered: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
};

export function Table5() {
  const [sort, setSort] = useState<SortConfig<keyof OrderRecord & string>>({ key: 'orderNumber', direction: 'descending' });
  const [expandedIds, setExpandedIds] = useState<string[]>(['o1']);

  const sorted = sortRecords(ORDERS, sort);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const renderSortIcon = (key: keyof OrderRecord & string) => {
    if (sort.key !== key || sort.direction === 'none') return <ArrowUpDown className="h-3.5 w-3.5 text-stone-400" />;
    return sort.direction === 'ascending' ? <ArrowUp className="h-3.5 w-3.5 text-stone-900" /> : <ArrowDown className="h-3.5 w-3.5 text-stone-900" />;
  };

  return (
    <div className="rounded-xl border border-stone-200 bg-white overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 bg-stone-50/70">
        <div>
          <h3 className="text-sm font-semibold text-stone-900">Order Fulfillment Queue</h3>
          <p className="text-xs text-stone-500 mt-0.5">Expandable rows · Line-item breakdown & carrier tracking</p>
        </div>
        <button
          type="button"
          onClick={() => setExpandedIds(expandedIds.length === ORDERS.length ? [] : ORDERS.map((o) => o.id))}
          className="text-xs font-medium text-stone-700 hover:text-stone-950 border border-stone-300 bg-white rounded-md px-2.5 py-1 cursor-pointer"
        >
          {expandedIds.length === ORDERS.length ? 'Collapse All' : 'Expand All'}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-stone-200 text-xs font-semibold text-stone-500">
              <th scope="col" className="w-10 px-3 py-3">
                <span className="sr-only">Expand</span>
              </th>
              <th scope="col" aria-sort={sort.key === 'orderNumber' ? sort.direction : 'none'} className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => setSort((p) => nextSortConfig(p, 'orderNumber'))}
                  className="inline-flex items-center gap-1.5 text-stone-700 hover:text-stone-950 cursor-pointer"
                >
                  Order # {renderSortIcon('orderNumber')}
                </button>
              </th>
              <th scope="col" aria-sort={sort.key === 'customer' ? sort.direction : 'none'} className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => setSort((p) => nextSortConfig(p, 'customer'))}
                  className="inline-flex items-center gap-1.5 text-stone-700 hover:text-stone-950 cursor-pointer"
                >
                  Customer {renderSortIcon('customer')}
                </button>
              </th>
              <th scope="col" className="px-4 py-3 text-right">Items</th>
              <th scope="col" aria-sort={sort.key === 'status' ? sort.direction : 'none'} className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => setSort((p) => nextSortConfig(p, 'status'))}
                  className="inline-flex items-center gap-1.5 text-stone-700 hover:text-stone-950 cursor-pointer"
                >
                  Fulfillment {renderSortIcon('status')}
                </button>
              </th>
              <th scope="col" aria-sort={sort.key === 'total' ? sort.direction : 'none'} className="px-4 py-3 text-right">
                <button
                  type="button"
                  onClick={() => setSort((p) => nextSortConfig(p, 'total'))}
                  className="inline-flex items-center justify-end gap-1.5 text-stone-700 hover:text-stone-950 cursor-pointer"
                >
                  Order Total {renderSortIcon('total')}
                </button>
              </th>
              <th scope="col" className="px-5 py-3 text-right">Placed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {sorted.map((order) => {
              const isOpen = expandedIds.includes(order.id);
              return (
                <Fragment key={order.id}>
                  <tr className={`transition-colors ${isOpen ? 'bg-stone-50/90' : 'hover:bg-stone-50/50'}`}>
                    <td className="px-3 py-3">
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        aria-label={`Toggle details for ${order.orderNumber}`}
                        onClick={() => toggleExpand(order.id)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-stone-500 hover:bg-stone-200/70 hover:text-stone-900 cursor-pointer"
                      >
                        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </button>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-stone-900">{order.orderNumber}</td>
                    <td className="px-4 py-3 font-medium text-stone-800">{order.customer}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-stone-600 tabular-nums">{order.itemCount}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${ORDER_STATUS[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-sm font-semibold text-stone-900 tabular-nums">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-xs text-stone-500 tabular-nums">{order.placedAt}</td>
                  </tr>
                  {isOpen && (
                    <tr className="bg-stone-50/60">
                      <td colSpan={7} className="px-10 py-3.5 border-t border-stone-200/70">
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-stone-200/70 text-xs text-stone-600">
                          <span className="inline-flex items-center gap-1.5 font-medium text-stone-800">
                            <Truck className="h-3.5 w-3.5 text-stone-500" />
                            {order.carrier} · <span className="font-mono">{order.tracking}</span>
                          </span>
                          <span>Destination: {order.destination}</span>
                        </div>
                        <div className="space-y-1.5">
                          {order.items.map((item) => (
                            <div key={item.sku} className="flex items-center justify-between text-xs">
                              <span className="inline-flex items-center gap-2 text-stone-700">
                                <Package className="h-3.5 w-3.5 text-stone-400" />
                                <span className="font-mono text-stone-500">{item.sku}</span>
                                <span className="font-medium text-stone-800">{item.product}</span>
                              </span>
                              <span className="font-mono text-stone-600 tabular-nums">
                                {item.qty} × {formatCurrency(item.unitPrice)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
