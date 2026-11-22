import { useState } from "react";

// Shopping cart · minimal/professional · full page with line-item table + summary sidebar
const INITIAL = [
  { id: 1, sku: "TS-104", name: "Pima Cotton Tee", variant: "White · L", price: 38, qty: 2, stock: 8, grad: "from-gray-100 to-gray-300" },
  { id: 2, sku: "CH-221", name: "Relaxed Chino", variant: "Stone · 32×30", price: 98, qty: 1, stock: 3, grad: "from-stone-200 to-amber-200" },
  { id: 3, sku: "OX-017", name: "Oxford Button-Down", variant: "Light blue · M", price: 84, qty: 1, stock: 12, grad: "from-sky-100 to-sky-300" },
];
const CODES = { WELCOME10: 0.1, SAVE20: 0.2 };

const Trash = (p) => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}><path d="M4 6h12M8 6V4h4v2M6 6l1 10h6l1-10" /></svg>;
const Bag = (p) => <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}><path d="M10 16h28l-2 26H12zM18 16v-4a6 6 0 0112 0v4" /></svg>;
const Minus = (p) => <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" {...p}><rect x="4" y="9" width="12" height="2" rx="1" /></svg>;
const Plus = (p) => <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" {...p}><rect x="4" y="9" width="12" height="2" rx="1" /><rect x="9" y="4" width="2" height="12" rx="1" /></svg>;

export default function Checkout8() {
  const [items, setItems] = useState(INITIAL);
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState(null);
  const [error, setError] = useState("");

  const setQty = (id, q) => setItems(items.map((i) => (i.id === id ? { ...i, qty: Math.min(i.stock, Math.max(1, q)) } : i)));
  const remove = (id) => setItems(items.filter((i) => i.id !== id));
  const sub = items.reduce((s, i) => s + i.price * i.qty, 0);
  const discount = applied ? +(sub * CODES[applied]).toFixed(2) : 0;
  const ship = sub - discount >= 150 || sub === 0 ? 0 : 8;
  const tax = +((sub - discount) * 0.0875).toFixed(2);
  const total = sub - discount + ship + tax;
  const count = items.reduce((s, i) => s + i.qty, 0);

  const applyCode = (e) => {
    e.preventDefault();
    const c = code.trim().toUpperCase();
    if (CODES[c]) { setApplied(c); setError(""); setCode(""); } else setError("Enter a valid promo code (try WELCOME10).");
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex items-baseline justify-between border-b border-gray-200 pb-6">
          <h1 className="text-3xl font-semibold tracking-tight">Shopping cart</h1>
          <p className="text-sm text-gray-500">{count} {count === 1 ? "item" : "items"}</p>
        </div>

        {items.length === 0 ? (
          <section aria-labelledby="c8-empty" className="flex flex-col items-center py-24 text-center">
            <Bag className="h-16 w-16 text-gray-300" />
            <h2 id="c8-empty" className="mt-6 text-xl font-semibold">Your cart is empty</h2>
            <p className="mt-2 max-w-sm text-sm text-gray-500">Items you add to your cart will appear here. Free shipping on orders over $150.</p>
            <div className="mt-8 flex gap-3">
              <a href="#shop" className="rounded-md bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-700">Continue shopping</a>
              <button type="button" onClick={() => setItems(INITIAL)} className="rounded-md border border-gray-300 px-5 py-2.5 text-sm font-medium hover:bg-gray-50">Restore demo items</button>
            </div>
          </section>
        ) : (
          <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_360px]">
            <section aria-labelledby="c8-items">
              <h2 id="c8-items" className="sr-only">Items in your cart</h2>
              <table className="w-full text-sm">
                <thead className="hidden border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500 sm:table-header-group">
                  <tr><th scope="col" className="pb-3 font-medium">Product</th><th scope="col" className="pb-3 font-medium">Quantity</th><th scope="col" className="pb-3 text-right font-medium">Total</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {items.map((i) => (
                    <tr key={i.id} className="align-top">
                      <td className="py-6 pr-4">
                        <div className="flex gap-4">
                          <div className={`h-24 w-20 shrink-0 rounded bg-gradient-to-br ${i.grad}`} aria-hidden="true" />
                          <div>
                            <p className="font-medium">{i.name}</p>
                            <p className="mt-0.5 text-gray-500">{i.variant}</p>
                            <p className="mt-0.5 text-xs text-gray-400">SKU {i.sku} · ${i.price.toFixed(2)} each</p>
                            {i.stock <= 3 && <p className="mt-2 text-xs font-medium text-amber-700">Only {i.stock} left</p>}
                          </div>
                        </div>
                      </td>
                      <td className="py-6 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="inline-flex items-center rounded-md border border-gray-300">
                            <button type="button" aria-label={`Decrease quantity of ${i.name}`} disabled={i.qty <= 1} onClick={() => setQty(i.id, i.qty - 1)} className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-30"><Minus className="h-4 w-4" /></button>
                            <label htmlFor={`c8-q${i.id}`} className="sr-only">Quantity for {i.name}</label>
                            <input id={`c8-q${i.id}`} type="number" min="1" max={i.stock} value={i.qty} onChange={(e) => setQty(i.id, +e.target.value || 1)} className="w-10 border-0 p-0 text-center text-sm [appearance:textfield] focus:outline-none focus:ring-0 [&::-webkit-inner-spin-button]:appearance-none" />
                            <button type="button" aria-label={`Increase quantity of ${i.name}`} disabled={i.qty >= i.stock} onClick={() => setQty(i.id, i.qty + 1)} className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-30"><Plus className="h-4 w-4" /></button>
                          </div>
                          <button type="button" onClick={() => remove(i.id)} aria-label={`Remove ${i.name}`} className="text-gray-400 hover:text-red-600"><Trash className="h-5 w-5" /></button>
                        </div>
                      </td>
                      <td className="py-6 text-right font-medium">${(i.price * i.qty).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <a href="#shop" className="mt-6 inline-block text-sm font-medium text-gray-600 hover:text-gray-900">← Continue shopping</a>
            </section>

            <aside aria-labelledby="c8-summary" className="self-start rounded-lg border border-gray-200 bg-gray-50 p-6">
              <h2 id="c8-summary" className="text-lg font-semibold">Order summary</h2>
              <form onSubmit={applyCode} className="mt-5">
                <label htmlFor="c8-code" className="block text-sm text-gray-600">Promo code</label>
                <div className="mt-1.5 flex gap-2">
                  <input id="c8-code" value={code} onChange={(e) => setCode(e.target.value)} aria-invalid={!!error} aria-describedby={error ? "c8-code-err" : undefined}
                    className="min-w-0 flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm uppercase focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900" />
                  <button type="submit" className="rounded-md border border-gray-900 px-4 text-sm font-medium hover:bg-gray-900 hover:text-white">Apply</button>
                </div>
                {error && <p id="c8-code-err" role="alert" className="mt-1.5 text-xs text-red-600">{error}</p>}
                {applied && (
                  <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-gray-900 px-3 py-1 text-xs text-white">
                    {applied} · {CODES[applied] * 100}% off
                    <button type="button" aria-label="Remove promo code" onClick={() => setApplied(null)} className="text-gray-300 hover:text-white">×</button>
                  </p>
                )}
              </form>
              <dl className="mt-6 space-y-3 border-t border-gray-200 pt-6 text-sm">
                <div className="flex justify-between"><dt className="text-gray-600">Subtotal</dt><dd>${sub.toFixed(2)}</dd></div>
                {discount > 0 && <div className="flex justify-between text-green-700"><dt>Discount</dt><dd>−${discount.toFixed(2)}</dd></div>}
                <div className="flex justify-between"><dt className="text-gray-600">Shipping</dt><dd>{ship ? `$${ship.toFixed(2)}` : "Free"}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-600">Tax (est.)</dt><dd>${tax.toFixed(2)}</dd></div>
                <div className="flex justify-between border-t border-gray-200 pt-3 text-base font-semibold"><dt>Total</dt><dd>${total.toFixed(2)}</dd></div>
              </dl>
              <button type="button" className="mt-6 w-full rounded-md bg-gray-900 py-3 text-sm font-semibold text-white hover:bg-gray-700">Checkout</button>
              {ship > 0 && <p className="mt-3 text-center text-xs text-gray-500">Add ${(150 - (sub - discount)).toFixed(2)} more for free shipping</p>}
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
