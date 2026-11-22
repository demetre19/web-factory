import { useState } from "react";

// Product detail page · minimal/professional light · gallery thumbnails, variants, qty, accordion
const COLORS = [
  { id: "sand", name: "Sand", swatch: "bg-[#d8c7a8]", shots: ["from-[#efe4cf] to-[#cdb892]", "from-[#e6d8bd] to-[#bfa77e]", "from-[#f3ebdc] to-[#d8c7a8]", "from-[#d8c7a8] to-[#a89170]"] },
  { id: "slate", name: "Slate", swatch: "bg-[#5b6573]", shots: ["from-[#8a94a3] to-[#4a5361]", "from-[#a0a9b6] to-[#5b6573]", "from-[#7c8696] to-[#3d4450]", "from-[#b4bcc7] to-[#6b7584]"] },
  { id: "moss", name: "Moss", swatch: "bg-[#6f7d55]", shots: ["from-[#a3ae84] to-[#5d6a45]", "from-[#b5bf98] to-[#6f7d55]", "from-[#93a073] to-[#4f5b39]", "from-[#c6ceb0] to-[#7d8b62]"] },
];
const SIZES = [["XS", true], ["S", true], ["M", true], ["L", true], ["XL", false], ["XXL", true]];
const DETAILS = [
  ["Description", "A boxy overshirt cut from brushed organic cotton twill. Wear it buttoned as a shirt or open as a light layer. Two chest pockets, corozo buttons, and a straight hem."],
  ["Materials & care", "100% organic cotton, 310 gsm. Machine wash cold, inside out. Tumble dry low or line dry. Warm iron if needed."],
  ["Fit", "Relaxed fit — true to size. Model is 6'1\" and wears size M. For a closer fit, size down."],
  ["Shipping & returns", "Free standard shipping over $100. Free returns within 30 days of delivery, no questions asked."],
];

const Star = ({ filled }) => <svg viewBox="0 0 20 20" className={`h-4 w-4 ${filled ? "text-gray-900" : "text-gray-300"}`} fill="currentColor" aria-hidden="true"><path d="M10 1.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8L10 14.9l-5.3 2.7 1-5.8L1.5 7.7l5.9-.9z" /></svg>;
const Heart = ({ filled, ...p }) => <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" aria-hidden="true" {...p}><path d="M12 20s-7-4.4-9.3-9A5 5 0 0112 6a5 5 0 019.3 5c-2.3 4.6-9.3 9-9.3 9z" /></svg>;
const Plus = (p) => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true" {...p}><path d="M10 4v12M4 10h12" /></svg>;

export default function Checkout17() {
  const [color, setColor] = useState(COLORS[0]);
  const [shot, setShot] = useState(0);
  const [size, setSize] = useState(null);
  const [qty, setQty] = useState(1);
  const [open, setOpen] = useState(0);
  const [fav, setFav] = useState(false);
  const [added, setAdded] = useState(false);
  const [sizeErr, setSizeErr] = useState(false);

  const add = (e) => {
    e.preventDefault();
    if (!size) { setSizeErr(true); return; }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <nav aria-label="Breadcrumb" className="mx-auto max-w-6xl px-6 pt-8">
        <ol className="flex gap-2 text-sm text-gray-500">
          <li><a href="#men" className="hover:text-gray-900">Men</a></li><li aria-hidden="true">/</li>
          <li><a href="#shirts" className="hover:text-gray-900">Shirts</a></li><li aria-hidden="true">/</li>
          <li aria-current="page" className="text-gray-900">Twill Overshirt</li>
        </ol>
      </nav>

      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-8 lg:grid-cols-2 lg:gap-16">
        <section aria-label="Product images">
          <div className={`relative aspect-[4/5] overflow-hidden rounded-xl bg-gradient-to-br ${color.shots[shot]}`}>
            <span className="absolute inset-0 flex items-center justify-center font-serif text-[9rem] font-light text-white/30" aria-hidden="true">TO</span>
            <span className="sr-only">Twill Overshirt in {color.name}, view {shot + 1} of 4</span>
            <span className="absolute bottom-4 left-4 rounded-full bg-white/80 px-3 py-1 text-xs backdrop-blur">{shot + 1} / 4</span>
          </div>
          <ul className="mt-4 grid grid-cols-4 gap-3">
            {color.shots.map((g, i) => (
              <li key={i}>
                <button type="button" onClick={() => setShot(i)} aria-label={`View image ${i + 1}`} aria-pressed={shot === i}
                  className={`aspect-square w-full rounded-lg bg-gradient-to-br ${g} ring-offset-2 transition ${shot === i ? "ring-2 ring-gray-900" : "opacity-70 hover:opacity-100"}`} />
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="c17-title">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 id="c17-title" className="text-3xl font-semibold tracking-tight">Twill Overshirt</h1>
              <p className="mt-2 text-2xl">$118.00</p>
            </div>
            <button type="button" onClick={() => setFav(!fav)} aria-pressed={fav} aria-label={fav ? "Remove from wishlist" : "Add to wishlist"} className="rounded-full border border-gray-200 p-2.5 hover:bg-gray-50">
              <Heart filled={fav} className={`h-5 w-5 ${fav ? "text-rose-500" : ""}`} />
            </button>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex" role="img" aria-label="Rated 4 out of 5">{[1, 2, 3, 4, 5].map((n) => <Star key={n} filled={n <= 4} />)}</div>
            <a href="#reviews" className="text-sm text-gray-500 underline underline-offset-2">212 reviews</a>
          </div>

          <form onSubmit={add} className="mt-8 space-y-7">
            <fieldset>
              <legend className="text-sm"><span className="font-medium">Color:</span> <span className="text-gray-600">{color.name}</span></legend>
              <div className="mt-3 flex gap-3">
                {COLORS.map((c) => (
                  <label key={c.id} className={`cursor-pointer rounded-full p-0.5 ring-offset-2 ${color.id === c.id ? "ring-2 ring-gray-900" : ""}`}>
                    <input type="radio" name="c17-color" value={c.id} checked={color.id === c.id} onChange={() => { setColor(c); setShot(0); }} className="sr-only" />
                    <span className={`block h-8 w-8 rounded-full border border-black/10 ${c.swatch}`} /><span className="sr-only">{c.name}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset aria-describedby={sizeErr ? "c17-size-err" : undefined}>
              <div className="flex items-center justify-between">
                <legend className="text-sm font-medium">Size</legend>
                <a href="#size-guide" className="text-sm text-gray-500 underline underline-offset-2">Size guide</a>
              </div>
              <div className="mt-3 grid grid-cols-6 gap-2">
                {SIZES.map(([s, avail]) => (
                  <label key={s} className={`relative flex h-11 items-center justify-center rounded-md border text-sm font-medium
                    ${!avail ? "cursor-not-allowed border-gray-200 text-gray-300" : size === s ? "cursor-pointer border-gray-900 bg-gray-900 text-white" : "cursor-pointer border-gray-300 hover:border-gray-900"}`}>
                    <input type="radio" name="c17-size" value={s} disabled={!avail} checked={size === s} onChange={() => { setSize(s); setSizeErr(false); }} className="sr-only" />
                    {s}{!avail && <span aria-hidden="true" className="absolute inset-0 m-auto h-px w-3/4 -rotate-[20deg] bg-gray-300" />}
                    {!avail && <span className="sr-only">(sold out)</span>}
                  </label>
                ))}
              </div>
              {sizeErr && <p id="c17-size-err" role="alert" className="mt-2 text-sm text-red-600">Please select a size.</p>}
            </fieldset>

            <div className="flex gap-3">
              <div className="flex items-center rounded-md border border-gray-300">
                <button type="button" aria-label="Decrease quantity" onClick={() => setQty(Math.max(1, qty - 1))} className="h-12 w-10 text-lg text-gray-600">−</button>
                <label htmlFor="c17-qty" className="sr-only">Quantity</label>
                <input id="c17-qty" type="number" min="1" max="10" value={qty} onChange={(e) => setQty(Math.max(1, Math.min(10, +e.target.value || 1)))} className="h-12 w-10 border-0 p-0 text-center [appearance:textfield] focus:outline-none focus:ring-0 [&::-webkit-inner-spin-button]:appearance-none" />
                <button type="button" aria-label="Increase quantity" onClick={() => setQty(Math.min(10, qty + 1))} className="h-12 w-10 text-lg text-gray-600">+</button>
              </div>
              <button type="submit" className="h-12 flex-1 rounded-md bg-gray-900 text-sm font-semibold text-white transition hover:bg-gray-700">
                {added ? `Added ${qty} to cart ✓` : `Add to cart — $${(118 * qty).toFixed(2)}`}
              </button>
            </div>
            <p className="text-sm text-gray-500">Free shipping over $100 · Ships in 1–2 business days</p>
          </form>

          <div className="mt-10 divide-y divide-gray-200 border-y border-gray-200">
            {DETAILS.map(([title, body], i) => (
              <div key={title}>
                <h2>
                  <button type="button" id={`c17-acc-${i}`} aria-expanded={open === i} aria-controls={`c17-panel-${i}`} onClick={() => setOpen(open === i ? -1 : i)} className="flex w-full items-center justify-between py-4 text-left text-sm font-medium">
                    {title}<Plus className={`h-4 w-4 transition ${open === i ? "rotate-45" : ""}`} />
                  </button>
                </h2>
                {open === i && <div id={`c17-panel-${i}`} role="region" aria-labelledby={`c17-acc-${i}`} className="pb-5 text-sm leading-relaxed text-gray-600">{body}</div>}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
