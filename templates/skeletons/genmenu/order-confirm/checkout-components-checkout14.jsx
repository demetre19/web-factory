import { useState } from "react";

// Order confirmation · minimal/professional · centered single column receipt with status timeline
const ITEMS = [
  { id: 1, name: "Everyday Backpack", variant: "Black · 22 L", qty: 1, price: 128, grad: "from-zinc-700 to-zinc-900" },
  { id: 2, name: "Packing Cubes", variant: "Set of 3 · Sage", qty: 1, price: 36, grad: "from-emerald-200 to-emerald-400" },
  { id: 3, name: "Bottle Holder", variant: "Black", qty: 2, price: 14, grad: "from-zinc-300 to-zinc-500" },
];
const STAGES = [["Confirmed", "Nov 22, 10:41 AM"], ["Packed", "Expected Nov 23"], ["Shipped", "Expected Nov 24"], ["Delivered", "By Fri, Nov 27"]];

const CheckCircle = (p) => <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...p}><circle cx="12" cy="12" r="11" fill="currentColor" /><path d="M7 12.5l3.2 3L17 9" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const Copy = (p) => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" {...p}><rect x="7" y="7" width="10" height="10" rx="2" /><path d="M13 7V5a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2" /></svg>;
const Pin = (p) => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true" {...p}><path d="M10 18s6-5.3 6-10a6 6 0 10-12 0c0 4.7 6 10 6 10z" /><circle cx="10" cy="8" r="2" /></svg>;
const CardI = (p) => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" {...p}><rect x="2" y="4" width="16" height="12" rx="2" /><path d="M2 8h16" /></svg>;

export default function Checkout14() {
  const [copied, setCopied] = useState(false);
  const stage = 0;
  const sub = ITEMS.reduce((s, i) => s + i.price * i.qty, 0);
  const tax = 15.05;

  const copy = () => {
    navigator.clipboard?.writeText("TR-884213").catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="min-h-screen bg-white px-6 py-16 font-sans text-zinc-900">
      <main className="mx-auto max-w-xl">
        <div className="text-center">
          <CheckCircle className="mx-auto h-14 w-14 text-zinc-900" />
          <h1 className="mt-5 text-2xl font-semibold tracking-tight">Thanks for your order, Priya</h1>
          <p className="mt-2 text-zinc-500">We've sent a receipt to priya.n@example.com</p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-zinc-200 py-1.5 pl-4 pr-1.5 text-sm">
            <span className="text-zinc-500">Order</span>
            <span className="font-mono font-medium">TR-884213</span>
            <button type="button" onClick={copy} className="flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-xs hover:bg-zinc-200">
              <Copy className="h-3.5 w-3.5" />{copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>

        <section aria-labelledby="c14-status" className="mt-12">
          <h2 id="c14-status" className="sr-only">Order status</h2>
          <ol className="grid grid-cols-4">
            {STAGES.map(([label, when], i) => (
              <li key={label} className="relative flex flex-col items-center text-center" aria-current={i === stage ? "step" : undefined}>
                {i > 0 && <span aria-hidden="true" className={`absolute right-1/2 top-[7px] h-0.5 w-full ${i <= stage ? "bg-zinc-900" : "bg-zinc-200"}`} />}
                <span className={`relative h-4 w-4 rounded-full border-2 ${i <= stage ? "border-zinc-900 bg-zinc-900" : "border-zinc-300 bg-white"}`} />
                <span className={`mt-2 text-xs font-medium ${i <= stage ? "" : "text-zinc-400"}`}>{label}</span>
                <span className="text-[11px] text-zinc-400">{when}</span>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="c14-items" className="mt-12 border-t border-zinc-200 pt-8">
          <h2 id="c14-items" className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Items</h2>
          <ul className="mt-4 divide-y divide-zinc-100">
            {ITEMS.map((i) => (
              <li key={i.id} className="flex items-center gap-4 py-4">
                <span className={`h-16 w-16 shrink-0 rounded-lg bg-gradient-to-br ${i.grad}`} aria-hidden="true" />
                <span className="flex-1 text-sm"><span className="block font-medium">{i.name}</span><span className="text-zinc-500">{i.variant} · Qty {i.qty}</span></span>
                <span className="text-sm font-medium">${(i.price * i.qty).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-2 space-y-2 border-t border-zinc-200 pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-zinc-500">Subtotal</dt><dd>${sub.toFixed(2)}</dd></div>
            <div className="flex justify-between"><dt className="text-zinc-500">Shipping</dt><dd>Free</dd></div>
            <div className="flex justify-between"><dt className="text-zinc-500">Tax</dt><dd>${tax.toFixed(2)}</dd></div>
            <div className="flex justify-between pt-2 text-base font-semibold"><dt>Total paid</dt><dd>${(sub + tax).toFixed(2)}</dd></div>
          </dl>
        </section>

        <section aria-label="Shipping and payment" className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-zinc-50 p-5 text-sm">
            <h2 className="flex items-center gap-2 font-semibold"><Pin className="h-4 w-4" />Shipping to</h2>
            <address className="mt-2 not-italic leading-relaxed text-zinc-600">Priya Nair<br />1180 Lake Shore Dr, Unit 9B<br />Chicago, IL 60610</address>
            <p className="mt-2 text-zinc-500">Standard · UPS Ground</p>
          </div>
          <div className="rounded-xl bg-zinc-50 p-5 text-sm">
            <h2 className="flex items-center gap-2 font-semibold"><CardI className="h-4 w-4" />Payment</h2>
            <p className="mt-2 text-zinc-600">Visa ending 4242</p>
            <p className="text-zinc-500">Billing same as shipping</p>
          </div>
        </section>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <a href="#track" className="flex-1 rounded-lg bg-zinc-900 py-3 text-center text-sm font-semibold text-white hover:bg-zinc-700">Track your order</a>
          <a href="#shop" className="flex-1 rounded-lg border border-zinc-300 py-3 text-center text-sm font-semibold hover:bg-zinc-50">Continue shopping</a>
        </div>
        <p className="mt-6 text-center text-xs text-zinc-500">Need to change something? You can edit or cancel within 1 hour of ordering.</p>
      </main>
    </div>
  );
}
