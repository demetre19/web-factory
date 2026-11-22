import { useState } from "react";

// Product detail page · dark · vertical thumbnail rail, finish + edition pickers, specs accordion
const FINISHES = [
  { id: "obsidian", name: "Obsidian", swatch: "from-neutral-700 to-black", hero: "from-neutral-800 via-neutral-900 to-black" },
  { id: "titanium", name: "Titanium", swatch: "from-zinc-300 to-zinc-500", hero: "from-zinc-500 via-zinc-700 to-zinc-900" },
  { id: "ember", name: "Ember", swatch: "from-orange-500 to-red-700", hero: "from-orange-600 via-red-800 to-neutral-950" },
];
const EDITIONS = [
  { id: "std", name: "Standard", desc: "Wired + Bluetooth 5.4", price: 349 },
  { id: "pro", name: "Pro", desc: "Adds lossless dongle & hard case", price: 429 },
  { id: "studio", name: "Studio", desc: "Pro + balanced cable & velour pads", price: 499 },
];
const VIEWS = ["Front", "Side", "Folded", "Case"];
const SPECS = [
  ["Overview", <p key="o">Planar-magnetic drivers tuned in-house, adaptive noise cancelling with 8 microphones, and a 60-hour battery. Machined aluminium yokes, memory-foam pads, and a fold-flat hinge.</p>],
  ["Tech specs", <dl key="t" className="grid grid-cols-2 gap-y-2"><dt className="text-neutral-500">Driver</dt><dd>50 mm planar</dd><dt className="text-neutral-500">Frequency</dt><dd>5 Hz – 40 kHz</dd><dt className="text-neutral-500">Battery</dt><dd>60 h (ANC off)</dd><dt className="text-neutral-500">Weight</dt><dd>312 g</dd><dt className="text-neutral-500">Codecs</dt><dd>LDAC, aptX Adaptive, AAC</dd></dl>],
  ["In the box", <ul key="b" className="list-inside list-disc space-y-1"><li>Headphones</li><li>USB-C cable (1.2 m)</li><li>3.5 mm cable</li><li>Travel pouch</li></ul>],
  ["Warranty", <p key="w">2-year limited warranty. Extend to 4 years with Care+ at checkout.</p>],
];

const Chevron = (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" {...p}><path d="M6 9l6 6 6-6" /></svg>;
const Head = (p) => <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" aria-hidden="true" {...p}><path d="M22 72V60a38 38 0 0176 0v12" /><rect x="14" y="66" width="20" height="34" rx="8" /><rect x="86" y="66" width="20" height="34" rx="8" /></svg>;
const Bolt = (p) => <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}><path d="M13 2L4 14h7l-1 8 9-12h-7z" /></svg>;

export default function Checkout18() {
  const [finish, setFinish] = useState(FINISHES[0]);
  const [edition, setEdition] = useState(EDITIONS[1]);
  const [view, setView] = useState(0);
  const [care, setCare] = useState(false);
  const [qty, setQty] = useState(1);
  const [open, setOpen] = useState([0]);
  const [inCart, setInCart] = useState(0);
  const price = (edition.price + (care ? 49 : 0)) * qty;
  const toggle = (i) => setOpen(open.includes(i) ? open.filter((x) => x !== i) : [...open, i]);

  return (
    <div className="min-h-screen bg-neutral-950 pb-24 font-sans text-neutral-100 lg:pb-0">
      <header className="flex items-center justify-between border-b border-neutral-900 px-6 py-4">
        <span className="font-mono text-sm tracking-[0.3em]">HALCYON AUDIO</span>
        <span className="rounded-full bg-neutral-900 px-3 py-1 text-xs">Cart · {inCart}</span>
      </header>

      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-10 lg:grid-cols-[88px_1fr_420px]">
        <ul className="order-2 flex gap-3 lg:order-none lg:flex-col" aria-label="Product views">
          {VIEWS.map((v, i) => (
            <li key={v}>
              <button type="button" onClick={() => setView(i)} aria-pressed={view === i} aria-label={`${v} view`}
                className={`flex h-20 w-20 items-center justify-center rounded-xl bg-gradient-to-br ${finish.hero} transition ${view === i ? "ring-2 ring-amber-400" : "opacity-50 hover:opacity-100"}`}>
                <Head className="h-10 w-10 text-white/40" style={{ transform: `rotate(${i * 25}deg)` }} />
              </button>
            </li>
          ))}
        </ul>

        <section aria-label="Product gallery" className="order-1 lg:order-none">
          <div className={`relative flex aspect-square items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br ${finish.hero}`}>
            <div className="absolute h-2/3 w-2/3 rounded-full bg-amber-400/10 blur-3xl" aria-hidden="true" />
            <Head className="relative h-1/2 w-1/2 text-white/80 transition-transform duration-500" style={{ transform: `rotate(${view * 25}deg) scale(${view === 2 ? 0.8 : 1})` }} />
            <span className="absolute left-5 top-5 rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-neutral-950">NEW</span>
            <span className="absolute bottom-5 right-5 text-xs text-white/50">{VIEWS[view]} · {finish.name}</span>
          </div>
        </section>

        <section aria-labelledby="c18-title" className="order-3 lg:sticky lg:top-6 lg:self-start">
          <p className="text-sm text-amber-400">Over-ear · Noise cancelling</p>
          <h1 id="c18-title" className="mt-1 text-4xl font-bold tracking-tight">Halcyon H1</h1>
          <p className="mt-3 flex items-baseline gap-3"><span className="text-3xl font-semibold">${edition.price}</span><span className="text-sm text-neutral-500">or ${(edition.price / 12).toFixed(2)}/mo for 12 mo.</span></p>

          <form onSubmit={(e) => { e.preventDefault(); setInCart(inCart + qty); }} className="mt-8 space-y-7">
            <fieldset>
              <legend className="text-sm text-neutral-400">Finish — <span className="text-neutral-100">{finish.name}</span></legend>
              <div className="mt-3 flex gap-3">
                {FINISHES.map((f) => (
                  <label key={f.id} className={`cursor-pointer rounded-full p-1 ${finish.id === f.id ? "ring-2 ring-amber-400" : "ring-1 ring-neutral-800"}`}>
                    <input type="radio" name="c18-finish" checked={finish.id === f.id} onChange={() => setFinish(f)} className="sr-only" />
                    <span className={`block h-9 w-9 rounded-full bg-gradient-to-br ${f.swatch}`} /><span className="sr-only">{f.name}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-sm text-neutral-400">Edition</legend>
              <div className="mt-3 space-y-2">
                {EDITIONS.map((ed) => (
                  <label key={ed.id} className={`flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition ${edition.id === ed.id ? "border-amber-400 bg-amber-400/5" : "border-neutral-800 hover:border-neutral-600"}`}>
                    <input type="radio" name="c18-edition" checked={edition.id === ed.id} onChange={() => setEdition(ed)} className="sr-only" />
                    <span><span className="block font-semibold">{ed.name}</span><span className="text-sm text-neutral-500">{ed.desc}</span></span>
                    <span className="font-mono text-sm">${ed.price}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="flex cursor-pointer items-center gap-3 rounded-2xl bg-neutral-900 p-4 text-sm">
              <input type="checkbox" checked={care} onChange={(e) => setCare(e.target.checked)} className="h-4 w-4 accent-amber-400" />
              <span className="flex-1">Add Care+ — 4-year coverage incl. accidental damage</span><span className="font-mono">+$49</span>
            </label>

            <div className="flex gap-3">
              <div className="flex items-center rounded-full border border-neutral-700" role="group" aria-label="Quantity">
                <button type="button" aria-label="Decrease quantity" onClick={() => setQty(Math.max(1, qty - 1))} className="h-12 w-11 text-lg">−</button>
                <output aria-live="polite" className="w-6 text-center">{qty}</output>
                <button type="button" aria-label="Increase quantity" onClick={() => setQty(Math.min(4, qty + 1))} className="h-12 w-11 text-lg">+</button>
              </div>
              <button type="submit" className="hidden h-12 flex-1 items-center justify-center gap-2 rounded-full bg-amber-400 font-semibold text-neutral-950 hover:bg-amber-300 lg:flex">
                <Bolt className="h-4 w-4" />Add to cart · ${price.toFixed(0)}
              </button>
            </div>
            {inCart > 0 && <p role="status" className="text-sm text-amber-300">{inCart} in your cart.</p>}

            {/* mobile sticky buy bar */}
            <div className="fixed inset-x-0 bottom-0 z-10 flex items-center gap-4 border-t border-neutral-800 bg-neutral-950/95 px-6 py-4 backdrop-blur lg:hidden">
              <span className="font-mono">${price.toFixed(0)}</span>
              <button type="submit" className="h-12 flex-1 rounded-full bg-amber-400 font-semibold text-neutral-950">Add to cart</button>
            </div>
          </form>

          <div className="mt-10 border-t border-neutral-800">
            {SPECS.map(([t, body], i) => (
              <div key={t} className="border-b border-neutral-800">
                <h2>
                  <button type="button" aria-expanded={open.includes(i)} aria-controls={`c18-p${i}`} onClick={() => toggle(i)} className="flex w-full items-center justify-between py-4 text-left font-medium">
                    {t}<Chevron className={`h-5 w-5 text-neutral-500 transition ${open.includes(i) ? "rotate-180" : ""}`} />
                  </button>
                </h2>
                {open.includes(i) && <div id={`c18-p${i}`} className="pb-5 text-sm leading-relaxed text-neutral-300">{body}</div>}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
