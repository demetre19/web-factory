import { useState } from "react";

// Shopping cart · luxury-editorial · centered single column, serif, gift options, empty state
const INITIAL = [
  { id: 1, name: "Eau de Parfum — Figuier Noir", detail: "100 ml · Flacon in smoked glass", price: 285, qty: 1, grad: "from-stone-800 via-stone-600 to-amber-900", mono: "F" },
  { id: 2, name: "Bougie Parfumée — Ambre", detail: "220 g · Hand-poured", price: 95, qty: 2, grad: "from-amber-100 via-amber-300 to-orange-400", mono: "B" },
  { id: 3, name: "Savon de Marseille", detail: "Set of three · Olive & laurel", price: 48, qty: 1, grad: "from-lime-100 via-stone-200 to-stone-400", mono: "S" },
];
const fmt = (n) => "£" + n.toLocaleString("en-GB", { minimumFractionDigits: 2 });

export default function Checkout10() {
  const [items, setItems] = useState(INITIAL);
  const [wrap, setWrap] = useState("signature");
  const [note, setNote] = useState("");
  const [showPromo, setShowPromo] = useState(false);
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState(false);

  const setQty = (id, d) => setItems(items.map((i) => (i.id === id ? { ...i, qty: Math.max(1, Math.min(5, i.qty + d)) } : i)));
  const sub = items.reduce((s, i) => s + i.price * i.qty, 0);
  const wrapCost = wrap === "lacquer" ? 25 : 0;
  const disc = applied ? sub * 0.1 : 0;
  const total = sub + wrapCost - disc;

  return (
    <div className="min-h-screen bg-[#fbfaf7] text-stone-900">
      <header className="border-b border-stone-200 py-10 text-center">
        <p className="font-serif text-xs tracking-[0.5em] text-stone-500">PARIS — LONDON — KYOTO</p>
        <p className="mt-2 font-serif text-4xl italic">Officine Laurier</p>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-14">
        <h1 className="text-center font-serif text-5xl font-light">Your Bag</h1>

        {items.length === 0 ? (
          <section className="mt-16 text-center" aria-labelledby="c10-empty">
            <div className="mx-auto h-px w-16 bg-stone-400" />
            <h2 id="c10-empty" className="mt-10 font-serif text-2xl italic">Your bag awaits.</h2>
            <p className="mx-auto mt-4 max-w-sm leading-relaxed text-stone-600">Discover our fragrances, composed in Grasse and presented in hand-finished glass.</p>
            <div className="mt-10 flex flex-col items-center gap-4">
              <a href="#collections" className="border border-stone-900 px-12 py-4 text-[11px] uppercase tracking-[0.3em] hover:bg-stone-900 hover:text-white">Explore the collection</a>
              <button type="button" onClick={() => setItems(INITIAL)} className="text-[11px] uppercase tracking-[0.25em] text-stone-500 underline underline-offset-4">Restore previous selection</button>
            </div>
          </section>
        ) : (
          <>
            <p className="mt-3 text-center text-sm text-stone-500">{items.length} pieces, reserved for 60 minutes</p>
            <ul className="mt-14 divide-y divide-stone-200 border-y border-stone-200">
              {items.map((i) => (
                <li key={i.id} className="grid grid-cols-[96px_1fr] gap-6 py-8 sm:grid-cols-[120px_1fr]">
                  <div className={`flex aspect-[3/4] items-center justify-center bg-gradient-to-b ${i.grad} font-serif text-4xl italic text-white/80`}>{i.mono}</div>
                  <div className="flex flex-col">
                    <div className="flex justify-between gap-4">
                      <div>
                        <h2 className="font-serif text-xl leading-snug">{i.name}</h2>
                        <p className="mt-1 text-sm text-stone-500">{i.detail}</p>
                      </div>
                      <p className="font-serif text-lg">{fmt(i.price * i.qty)}</p>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-6">
                      <div className="flex items-center gap-4 text-sm" role="group" aria-label={`Quantity of ${i.name}`}>
                        <span className="text-[11px] uppercase tracking-[0.2em] text-stone-500">Qty</span>
                        <button type="button" aria-label="Decrease" onClick={() => setQty(i.id, -1)} disabled={i.qty === 1} className="h-7 w-7 rounded-full border border-stone-300 leading-none disabled:opacity-30">−</button>
                        <span aria-live="polite" className="w-4 text-center font-serif text-lg">{i.qty}</span>
                        <button type="button" aria-label="Increase" onClick={() => setQty(i.id, 1)} disabled={i.qty === 5} className="h-7 w-7 rounded-full border border-stone-300 leading-none disabled:opacity-30">+</button>
                      </div>
                      <div className="flex gap-5 text-[11px] uppercase tracking-[0.2em] text-stone-500">
                        <button type="button" className="hover:text-stone-900">Save for later</button>
                        <button type="button" onClick={() => setItems(items.filter((x) => x.id !== i.id))} className="hover:text-stone-900">Remove</button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <section aria-labelledby="c10-gift" className="mt-14">
              <h2 id="c10-gift" className="text-center text-[11px] uppercase tracking-[0.3em] text-stone-500">Presentation</h2>
              <fieldset className="mt-6 grid grid-cols-3 gap-3">
                <legend className="sr-only">Gift wrapping</legend>
                {[["none", "Standard", "Recyclable carton", 0], ["signature", "Signature", "Ivory box & ribbon", 0], ["lacquer", "Lacquered", "Keepsake coffret", 25]].map(([v, t, d, p]) => (
                  <label key={v} className={`cursor-pointer border p-4 text-center transition ${wrap === v ? "border-stone-900 bg-white" : "border-stone-200"}`}>
                    <input type="radio" name="c10-wrap" value={v} checked={wrap === v} onChange={() => setWrap(v)} className="sr-only" />
                    <span className="block font-serif text-lg">{t}</span>
                    <span className="mt-1 block text-xs text-stone-500">{d}</span>
                    <span className="mt-2 block text-xs">{p ? fmt(p) : "Complimentary"}</span>
                  </label>
                ))}
              </fieldset>
              <div className="mt-6">
                <label htmlFor="c10-note" className="block text-[11px] uppercase tracking-[0.2em] text-stone-500">Handwritten card message</label>
                <textarea id="c10-note" rows={3} maxLength={180} value={note} onChange={(e) => setNote(e.target.value)} aria-describedby="c10-note-count"
                  className="mt-2 w-full resize-none border border-stone-200 bg-white p-3 font-serif text-lg italic focus:border-stone-900 focus:outline-none" />
                <p id="c10-note-count" className="text-right text-xs text-stone-400">{note.length} / 180</p>
              </div>
            </section>

            <section aria-labelledby="c10-total" className="mt-12 border-t border-stone-900 pt-8">
              <h2 id="c10-total" className="sr-only">Order total</h2>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between"><dt>Subtotal</dt><dd>{fmt(sub)}</dd></div>
                {wrapCost > 0 && <div className="flex justify-between"><dt>Lacquered coffret</dt><dd>{fmt(wrapCost)}</dd></div>}
                {applied && <div className="flex justify-between text-stone-500"><dt>Privilege code</dt><dd>−{fmt(disc)}</dd></div>}
                <div className="flex justify-between"><dt>Delivery</dt><dd>Complimentary</dd></div>
                <div className="flex justify-between pt-4 font-serif text-3xl"><dt>Total</dt><dd>{fmt(total)}</dd></div>
              </dl>
              <div className="mt-6">
                <button type="button" aria-expanded={showPromo} onClick={() => setShowPromo(!showPromo)} className="text-[11px] uppercase tracking-[0.2em] text-stone-500 underline underline-offset-4">Have a privilege code?</button>
                {showPromo && (
                  <form onSubmit={(e) => { e.preventDefault(); setApplied(code.trim().toUpperCase() === "LAURIER"); }} className="mt-4 flex items-end gap-4">
                    <div className="flex-1">
                      <label htmlFor="c10-code" className="block text-[11px] uppercase tracking-[0.2em] text-stone-500">Code</label>
                      <input id="c10-code" value={code} onChange={(e) => setCode(e.target.value)} className="mt-1 w-full border-0 border-b border-stone-300 bg-transparent px-0 py-1 font-serif text-lg uppercase focus:border-stone-900 focus:outline-none focus:ring-0" />
                    </div>
                    <button type="submit" className="pb-1 text-[11px] uppercase tracking-[0.25em]">Apply</button>
                  </form>
                )}
              </div>
              <button type="button" className="mt-10 w-full bg-stone-900 py-5 text-[12px] uppercase tracking-[0.35em] text-white hover:bg-stone-800">Proceed to checkout</button>
              <p className="mt-4 text-center text-xs text-stone-500">Complimentary samples selected by our perfumers accompany every order.</p>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
