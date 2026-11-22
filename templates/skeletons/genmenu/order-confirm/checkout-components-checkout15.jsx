import { useState } from "react";

// Order confirmation · bold/colourful · split-pane: celebratory panel + receipt column
const ITEMS = [
  { id: 1, name: "Cloudrunner Sneaker", variant: "Tangerine · US 9", qty: 1, price: 140, mono: "CR", bg: "bg-orange-400" },
  { id: 2, name: "Performance Sock", variant: "3-pack · Mixed", qty: 1, price: 24, mono: "PS", bg: "bg-sky-400" },
  { id: 3, name: "Reflective Cap", variant: "Volt", qty: 1, price: 32, mono: "RC", bg: "bg-lime-400" },
];

const Confetti = (p) => (
  <svg viewBox="0 0 400 400" aria-hidden="true" {...p}>
    <circle cx="40" cy="60" r="10" fill="#fde047" /><rect x="320" y="40" width="22" height="22" rx="4" fill="#22d3ee" transform="rotate(20 331 51)" />
    <path d="M90 330l16-30 16 30z" fill="#a3e635" /><circle cx="350" cy="300" r="14" fill="#f472b6" />
    <rect x="200" y="20" width="10" height="34" rx="5" fill="#fde047" transform="rotate(-30 205 37)" /><circle cx="260" cy="370" r="7" fill="#22d3ee" />
    <rect x="20" y="200" width="10" height="30" rx="5" fill="#f472b6" transform="rotate(40 25 215)" /><path d="M370 160l12 22-24 0z" fill="#fde047" />
  </svg>
);
const Truck = (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}><path d="M2 6h12v10H2zM14 10h4l4 4v2h-8" /><circle cx="6" cy="18" r="2" /><circle cx="18" cy="18" r="2" /></svg>;
const Chevron = (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true" {...p}><path d="M6 9l6 6 6-6" /></svg>;

export default function Checkout15() {
  const [showItems, setShowItems] = useState(true);
  const [rating, setRating] = useState(null);
  const [sms, setSms] = useState(false);
  const sub = ITEMS.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <div className="min-h-screen font-sans lg:grid lg:grid-cols-2">
      <section aria-labelledby="c15-hero" className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-violet-600 via-fuchsia-600 to-orange-500 p-8 text-white sm:p-12 lg:min-h-screen">
        <Confetti className="absolute inset-0 h-full w-full opacity-90" />
        <p className="relative text-xl font-black tracking-tight">STRIDE</p>
        <div className="relative my-12">
          <p className="inline-block rounded-full bg-white/20 px-4 py-1 text-sm font-bold backdrop-blur">Order confirmed</p>
          <h1 id="c15-hero" className="mt-6 text-5xl font-black leading-[0.95] sm:text-7xl">You're<br />off and<br />running!</h1>
          <p className="mt-6 text-lg font-medium text-white/85">Order <span className="rounded-md bg-black/25 px-2 py-0.5 font-mono font-bold text-white">#ST-90217</span> is confirmed and heading to the warehouse.</p>
        </div>
        <div className="relative rounded-3xl bg-white p-5 text-stone-900 shadow-2xl">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lime-300"><Truck className="h-6 w-6" /></span>
            <div className="flex-1"><p className="text-sm font-bold text-stone-500">Arriving</p><p className="text-lg font-black">Wed, Nov 25 – Thu, Nov 26</p></div>
          </div>
          <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-stone-100" role="progressbar" aria-label="Shipping progress" aria-valuenow={15} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full w-[15%] rounded-full bg-gradient-to-r from-fuchsia-500 to-orange-400" />
          </div>
          <div className="mt-1.5 flex justify-between text-xs font-bold text-stone-400"><span className="text-fuchsia-600">Confirmed</span><span>Shipped</span><span>Out for delivery</span><span>Delivered</span></div>
          <a href="#track" className="mt-5 flex items-center justify-center gap-2 rounded-2xl bg-stone-900 py-3.5 font-black text-white hover:bg-fuchsia-700">Track package →</a>
          <label className="mt-3 flex items-center justify-center gap-2 text-sm font-semibold text-stone-600">
            <input type="checkbox" checked={sms} onChange={(e) => setSms(e.target.checked)} className="h-4 w-4 accent-fuchsia-600" />Text me delivery updates
          </label>
        </div>
      </section>

      <main className="bg-white p-8 text-stone-900 sm:p-12">
        <h2 className="text-2xl font-black">Receipt</h2>
        <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div><dt className="font-bold text-stone-400">Date</dt><dd className="font-semibold">Nov 22, 2026</dd></div>
          <div><dt className="font-bold text-stone-400">Payment</dt><dd className="font-semibold">Mastercard •••• 8210</dd></div>
        </dl>

        <div className="mt-8 rounded-3xl border-2 border-stone-100">
          <button type="button" aria-expanded={showItems} aria-controls="c15-items" onClick={() => setShowItems(!showItems)} className="flex w-full items-center justify-between p-5 font-black">
            {ITEMS.length} items <Chevron className={`h-5 w-5 transition ${showItems ? "rotate-180" : ""}`} />
          </button>
          {showItems && (
            <ul id="c15-items" className="space-y-4 px-5 pb-5">
              {ITEMS.map((i) => (
                <li key={i.id} className="flex items-center gap-4">
                  <span className={`flex h-14 w-14 items-center justify-center rounded-2xl text-sm font-black text-stone-900 ${i.bg}`}>{i.mono}</span>
                  <span className="flex-1 text-sm"><span className="block font-black">{i.name}</span><span className="font-semibold text-stone-500">{i.variant} · ×{i.qty}</span></span>
                  <span className="font-black">${i.price.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <dl className="mt-6 space-y-2 text-sm font-semibold">
          <div className="flex justify-between text-stone-500"><dt>Subtotal</dt><dd>${sub.toFixed(2)}</dd></div>
          <div className="flex justify-between text-stone-500"><dt>Express shipping</dt><dd>$12.00</dd></div>
          <div className="flex justify-between text-stone-500"><dt>Tax</dt><dd>$16.64</dd></div>
          <div className="flex justify-between border-t-2 border-dashed border-stone-200 pt-3 text-2xl font-black"><dt>Total</dt><dd>${(sub + 12 + 16.64).toFixed(2)}</dd></div>
        </dl>

        <section aria-labelledby="c15-ship" className="mt-8 rounded-3xl bg-sky-50 p-5">
          <h3 id="c15-ship" className="font-black">Shipping to</h3>
          <address className="mt-1 text-sm font-medium not-italic leading-relaxed text-stone-600">Diego Morales · 4417 Ocean View Blvd, San Diego, CA 92113</address>
          <p className="mt-1 text-sm font-semibold text-sky-700">Express · FedEx 2Day</p>
        </section>

        <fieldset className="mt-8">
          <legend className="font-black">How was checkout?</legend>
          <div className="mt-3 flex gap-2">
            {[["Rough", "bg-rose-200"], ["Okay", "bg-yellow-200"], ["Smooth", "bg-lime-200"], ["Amazing", "bg-fuchsia-200"]].map(([r, c]) => (
              <label key={r} className={`flex-1 cursor-pointer rounded-2xl py-2.5 text-center text-sm font-black transition ${rating === r ? `${c} ring-2 ring-stone-900` : "bg-stone-100 text-stone-500"}`}>
                <input type="radio" name="c15-rate" value={r} checked={rating === r} onChange={() => setRating(r)} className="sr-only" />{r}
              </label>
            ))}
          </div>
          {rating && <p role="status" className="mt-2 text-sm font-semibold text-stone-500">Thanks for the feedback!</p>}
        </fieldset>
      </main>
    </div>
  );
}
