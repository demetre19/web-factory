import { useMemo, useState } from "react";

// Product grid + filter sidebar · dark luxury · collapsible filter groups, price slider, grid/list toggle, wishlist
const PRODUCTS = [
  { id: 1, name: "Meridian 38", line: "Automatic", metal: "Gold", strap: "Leather", price: 8400, grad: "from-amber-300 via-yellow-600 to-amber-900" },
  { id: 2, name: "Nocturne Chronograph", line: "Chronograph", metal: "Steel", strap: "Bracelet", price: 6200, grad: "from-zinc-300 via-zinc-500 to-zinc-800" },
  { id: 3, name: "Aurelia 34", line: "Automatic", metal: "Rose gold", strap: "Leather", price: 9900, grad: "from-rose-200 via-rose-400 to-amber-800" },
  { id: 4, name: "Abyss Diver 42", line: "Diver", metal: "Steel", strap: "Rubber", price: 4800, grad: "from-sky-700 via-slate-800 to-black" },
  { id: 5, name: "Celeste Moonphase", line: "Complication", metal: "Gold", strap: "Leather", price: 18500, grad: "from-indigo-900 via-amber-700 to-yellow-500" },
  { id: 6, name: "Monolith Titanium", line: "Automatic", metal: "Titanium", strap: "Bracelet", price: 7100, grad: "from-neutral-400 via-neutral-600 to-neutral-900" },
  { id: 7, name: "Regatta GMT", line: "Complication", metal: "Steel", strap: "Bracelet", price: 11200, grad: "from-red-800 via-zinc-700 to-blue-900" },
  { id: 8, name: "Petite Seconde", line: "Manual", metal: "Rose gold", strap: "Leather", price: 5600, grad: "from-orange-200 via-rose-300 to-stone-600" },
];
const GROUPS = [
  ["line", "Collection", ["Automatic", "Chronograph", "Complication", "Diver", "Manual"]],
  ["metal", "Case material", ["Gold", "Rose gold", "Steel", "Titanium"]],
  ["strap", "Strap", ["Leather", "Bracelet", "Rubber"]],
];
const fmt = (n) => "$" + n.toLocaleString("en-US");

const Heart = ({ on, ...p }) => <svg viewBox="0 0 24 24" fill={on ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.4" aria-hidden="true" {...p}><path d="M12 20s-7-4.4-9.3-9A5 5 0 0112 6a5 5 0 019.3 5c-2.3 4.6-9.3 9-9.3 9z" /></svg>;
const Grid = (p) => <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" {...p}><rect x="2" y="2" width="7" height="7" /><rect x="11" y="2" width="7" height="7" /><rect x="2" y="11" width="7" height="7" /><rect x="11" y="11" width="7" height="7" /></svg>;
const List = (p) => <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" {...p}><rect x="2" y="3" width="16" height="3" /><rect x="2" y="8.5" width="16" height="3" /><rect x="2" y="14" width="16" height="3" /></svg>;
const Chevron = (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true" {...p}><path d="M6 9l6 6 6-6" /></svg>;
const Dial = ({ className }) => <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" aria-hidden="true"><circle cx="50" cy="50" r="34" strokeWidth="2" />{Array.from({ length: 12 }).map((_, i) => <line key={i} x1="50" y1="20" x2="50" y2="25" strokeWidth="2" transform={`rotate(${i * 30} 50 50)`} />)}<path d="M50 50V30M50 50l12 8" strokeWidth="2.5" strokeLinecap="round" /></svg>;

export default function Checkout20() {
  const [sel, setSel] = useState({ line: [], metal: [], strap: [] });
  const [open, setOpen] = useState({ line: true, metal: true, strap: false });
  const [max, setMax] = useState(20000);
  const [view, setView] = useState("grid");
  const [wish, setWish] = useState([3]);
  const [showFilters, setShowFilters] = useState(false);

  const toggle = (g, v) => setSel({ ...sel, [g]: sel[g].includes(v) ? sel[g].filter((x) => x !== v) : [...sel[g], v] });
  const results = useMemo(() => PRODUCTS.filter((p) => p.price <= max && GROUPS.every(([g]) => !sel[g].length || sel[g].includes(p[g]))), [sel, max]);
  const activeCount = Object.values(sel).flat().length + (max < 20000 ? 1 : 0);

  return (
    <div className="min-h-screen bg-black font-sans text-neutral-300">
      <header className="border-b border-neutral-900 py-8 text-center">
        <p className="font-serif text-3xl tracking-[0.4em] text-[#d4b47a]">VALCOURT</p>
        <p className="mt-1 text-[10px] uppercase tracking-[0.5em] text-neutral-500">Genève · Depuis 1891</p>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-[#d4b47a]">Timepieces</p>
            <h1 className="mt-2 font-serif text-5xl font-light text-neutral-100">The Collection</h1>
          </div>
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => setShowFilters(!showFilters)} aria-expanded={showFilters} aria-controls="c20-filters" className="border border-neutral-700 px-4 py-2 text-[11px] uppercase tracking-[0.2em] lg:hidden">Refine{activeCount ? ` (${activeCount})` : ""}</button>
            <span className="text-sm text-neutral-500" aria-live="polite">{results.length} references</span>
            <div className="flex border border-neutral-800" role="group" aria-label="Layout">
              {[["grid", Grid], ["list", List]].map(([v, I]) => (
                <button key={v} type="button" onClick={() => setView(v)} aria-pressed={view === v} aria-label={`${v} view`} className={`p-2.5 ${view === v ? "bg-neutral-800 text-[#d4b47a]" : "text-neutral-600 hover:text-neutral-300"}`}><I className="h-4 w-4" /></button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-12 lg:grid-cols-[250px_1fr]">
          <form id="c20-filters" aria-label="Refine collection" onSubmit={(e) => e.preventDefault()} className={`${showFilters ? "block" : "hidden"} lg:block`}>
            <div className="flex items-baseline justify-between border-b border-neutral-800 pb-4">
              <h2 className="text-[11px] uppercase tracking-[0.3em] text-neutral-100">Refine</h2>
              {activeCount > 0 && <button type="button" onClick={() => { setSel({ line: [], metal: [], strap: [] }); setMax(20000); }} className="text-xs text-[#d4b47a] underline underline-offset-4">Reset</button>}
            </div>
            {GROUPS.map(([g, label, opts]) => (
              <fieldset key={g} className="border-b border-neutral-800">
                <legend className="w-full">
                  <button type="button" aria-expanded={open[g]} aria-controls={`c20-${g}`} onClick={() => setOpen({ ...open, [g]: !open[g] })} className="flex w-full items-center justify-between py-4 text-sm text-neutral-200">
                    <span>{label}{sel[g].length > 0 && <span className="ml-2 text-[#d4b47a]">· {sel[g].length}</span>}</span>
                    <Chevron className={`h-4 w-4 transition ${open[g] ? "rotate-180" : ""}`} />
                  </button>
                </legend>
                {open[g] && (
                  <div id={`c20-${g}`} className="flex flex-wrap gap-2 pb-5">
                    {opts.map((o) => (
                      <label key={o} className="cursor-pointer">
                        <input type="checkbox" checked={sel[g].includes(o)} onChange={() => toggle(g, o)} className="peer sr-only" />
                        <span className="block border border-neutral-700 px-3 py-1.5 text-xs transition peer-checked:border-[#d4b47a] peer-checked:bg-[#d4b47a] peer-checked:text-black peer-focus-visible:ring-1 peer-focus-visible:ring-[#d4b47a] hover:border-neutral-500">{o}</span>
                      </label>
                    ))}
                  </div>
                )}
              </fieldset>
            ))}
            <div className="border-b border-neutral-800 py-5">
              <label htmlFor="c20-max" className="flex justify-between text-sm text-neutral-200"><span>Maximum price</span><span className="font-serif text-[#d4b47a]">{max >= 20000 ? "Any" : fmt(max)}</span></label>
              <input id="c20-max" type="range" min="4000" max="20000" step="500" value={max} onChange={(e) => setMax(+e.target.value)} className="mt-4 w-full accent-[#d4b47a]" />
              <div className="mt-1 flex justify-between text-[10px] text-neutral-600"><span>$4,000</span><span>$20,000+</span></div>
            </div>
            <p className="mt-6 text-xs leading-relaxed text-neutral-500">Wishlist: {wish.length} {wish.length === 1 ? "piece" : "pieces"}. Book a private viewing in any of our salons.</p>
          </form>

          <section aria-label="Results">
            {results.length === 0 ? (
              <div className="border border-neutral-800 py-24 text-center">
                <p className="font-serif text-2xl text-neutral-100">No references match your selection.</p>
                <button type="button" onClick={() => { setSel({ line: [], metal: [], strap: [] }); setMax(20000); }} className="mt-6 text-[11px] uppercase tracking-[0.3em] text-[#d4b47a] underline underline-offset-8">View the full collection</button>
              </div>
            ) : (
              <ul className={view === "grid" ? "grid grid-cols-1 gap-px bg-neutral-900 sm:grid-cols-2 xl:grid-cols-3" : "divide-y divide-neutral-900 border-y border-neutral-900"}>
                {results.map((p) => (
                  <li key={p.id} className="bg-black">
                    <article className={`group relative ${view === "grid" ? "p-6" : "flex items-center gap-6 py-5"}`}>
                      <div className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br ${p.grad} ${view === "grid" ? "aspect-square" : "h-28 w-28 shrink-0"}`}>
                        <Dial className={`text-white/50 transition duration-700 group-hover:rotate-12 ${view === "grid" ? "h-1/2 w-1/2" : "h-16 w-16"}`} />
                      </div>
                      <button type="button" onClick={() => setWish(wish.includes(p.id) ? wish.filter((x) => x !== p.id) : [...wish, p.id])} aria-pressed={wish.includes(p.id)} aria-label={`${wish.includes(p.id) ? "Remove" : "Add"} ${p.name} ${wish.includes(p.id) ? "from" : "to"} wishlist`}
                        className={`absolute z-10 ${view === "grid" ? "right-9 top-9" : "right-0 top-5"} text-neutral-100 hover:text-[#d4b47a]`}>
                        <Heart on={wish.includes(p.id)} className={`h-5 w-5 ${wish.includes(p.id) ? "text-[#d4b47a]" : ""}`} />
                      </button>
                      <div className={view === "grid" ? "mt-5 text-center" : "flex-1"}>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">{p.line} · {p.metal}</p>
                        <h3 className="mt-1.5 font-serif text-xl text-neutral-100"><a href={`#ref-${p.id}`} className="after:absolute after:inset-0">{p.name}</a></h3>
                        {view === "list" && <p className="mt-1 text-sm text-neutral-500">{p.strap} strap · Sapphire crystal · 100 m</p>}
                        <p className="mt-2 font-serif text-[#d4b47a]">{fmt(p.price)}</p>
                      </div>
                    </article>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
