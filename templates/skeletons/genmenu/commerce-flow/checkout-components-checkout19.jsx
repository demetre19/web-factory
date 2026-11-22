import { useMemo, useState } from "react";

// Product grid + filter sidebar · light-warm · working filters, sort, active chips, quick-add
const PRODUCTS = [
  { id: 1, name: "Terracotta Planter", cat: "Planters", color: "Terracotta", price: 42, rating: 4.8, grad: "from-orange-300 to-orange-500", badge: "Bestseller" },
  { id: 2, name: "Linen Throw", cat: "Textiles", color: "Oat", price: 89, rating: 4.6, grad: "from-stone-200 to-amber-200" },
  { id: 3, name: "Glazed Bud Vase", cat: "Vases", color: "Sage", price: 28, rating: 4.9, grad: "from-lime-200 to-emerald-300", badge: "New" },
  { id: 4, name: "Woven Seagrass Basket", cat: "Storage", color: "Oat", price: 55, rating: 4.4, grad: "from-amber-200 to-yellow-600" },
  { id: 5, name: "Hanging Planter", cat: "Planters", color: "Sage", price: 36, rating: 4.5, grad: "from-emerald-200 to-teal-400" },
  { id: 6, name: "Cotton Cushion Cover", cat: "Textiles", color: "Terracotta", price: 34, rating: 4.7, grad: "from-rose-300 to-orange-400" },
  { id: 7, name: "Stoneware Vase, Tall", cat: "Vases", color: "Charcoal", price: 68, rating: 4.3, grad: "from-stone-500 to-stone-800" },
  { id: 8, name: "Lidded Storage Jar", cat: "Storage", color: "Charcoal", price: 24, rating: 4.6, grad: "from-stone-400 to-neutral-600", badge: "Low stock" },
  { id: 9, name: "Jute Plant Stand", cat: "Planters", color: "Oat", price: 74, rating: 4.2, grad: "from-yellow-200 to-amber-400" },
];
const CATS = ["Planters", "Vases", "Textiles", "Storage"];
const COLORS = [["Terracotta", "bg-orange-500"], ["Oat", "bg-amber-200"], ["Sage", "bg-emerald-300"], ["Charcoal", "bg-stone-700"]];
const PRICES = [["any", "Any price", 0, Infinity], ["u40", "Under $40", 0, 40], ["40-70", "$40 – $70", 40, 70], ["70+", "$70 and over", 70, Infinity]];

const Star = (p) => <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" {...p}><path d="M10 1.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8L10 14.9l-5.3 2.7 1-5.8L1.5 7.7l5.9-.9z" /></svg>;
const Filter = (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true" {...p}><path d="M4 6h16M7 12h10M10 18h4" /></svg>;
const X = (p) => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" {...p}><path d="M5 5l10 10M15 5L5 15" /></svg>;

export default function Checkout19() {
  const [cats, setCats] = useState([]);
  const [colors, setColors] = useState([]);
  const [price, setPrice] = useState("any");
  const [sort, setSort] = useState("featured");
  const [showFilters, setShowFilters] = useState(false);
  const [cart, setCart] = useState({});

  const toggle = (list, set, v) => set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  const results = useMemo(() => {
    const [, , lo, hi] = PRICES.find((p) => p[0] === price);
    const r = PRODUCTS.filter((p) => (!cats.length || cats.includes(p.cat)) && (!colors.length || colors.includes(p.color)) && p.price >= lo && p.price < hi);
    if (sort === "low") r.sort((a, b) => a.price - b.price);
    if (sort === "high") r.sort((a, b) => b.price - a.price);
    if (sort === "rated") r.sort((a, b) => b.rating - a.rating);
    return r;
  }, [cats, colors, price, sort]);
  const chips = [...cats.map((c) => ["cat", c]), ...colors.map((c) => ["color", c]), ...(price !== "any" ? [["price", PRICES.find((p) => p[0] === price)[1]]] : [])];
  const clear = () => { setCats([]); setColors([]); setPrice("any"); };
  const cartCount = Object.values(cart).reduce((s, n) => s + n, 0);

  return (
    <div className="min-h-screen bg-[#fbf7f1] font-sans text-stone-800">
      <header className="border-b border-stone-200 bg-[#fbf7f1]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <span className="font-serif text-2xl text-stone-900">Fern &amp; Kiln</span>
          <span className="text-sm">Basket ({cartCount})</span>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-stone-200 pb-6">
          <div>
            <h1 className="font-serif text-4xl text-stone-900">Home &amp; Garden</h1>
            <p className="mt-1 text-sm text-stone-500">Handmade by small studios. {results.length} of {PRODUCTS.length} products</p>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setShowFilters(!showFilters)} aria-expanded={showFilters} aria-controls="c19-filters" className="flex items-center gap-2 rounded-full border border-stone-300 px-4 py-2 text-sm lg:hidden"><Filter className="h-4 w-4" />Filters</button>
            <label htmlFor="c19-sort" className="text-sm text-stone-500">Sort by</label>
            <select id="c19-sort" value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm focus:border-amber-700 focus:outline-none">
              <option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option><option value="rated">Top rated</option>
            </select>
          </div>
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-[240px_1fr]">
          <form id="c19-filters" aria-label="Product filters" onSubmit={(e) => e.preventDefault()} className={`${showFilters ? "block" : "hidden"} space-y-8 lg:block`}>
            <fieldset>
              <legend className="font-serif text-lg text-stone-900">Category</legend>
              <div className="mt-3 space-y-2.5">
                {CATS.map((c) => (
                  <label key={c} className="flex items-center gap-3 text-sm">
                    <input type="checkbox" checked={cats.includes(c)} onChange={() => toggle(cats, setCats, c)} className="h-4 w-4 rounded accent-amber-700" />
                    <span className="flex-1">{c}</span><span className="text-xs text-stone-400">{PRODUCTS.filter((p) => p.cat === c).length}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="font-serif text-lg text-stone-900">Price</legend>
              <div className="mt-3 space-y-2.5">
                {PRICES.map(([v, t]) => (
                  <label key={v} className="flex items-center gap-3 text-sm">
                    <input type="radio" name="c19-price" checked={price === v} onChange={() => setPrice(v)} className="h-4 w-4 accent-amber-700" />{t}
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="font-serif text-lg text-stone-900">Colour</legend>
              <div className="mt-3 flex flex-wrap gap-3">
                {COLORS.map(([c, bg]) => (
                  <label key={c} className="cursor-pointer text-center">
                    <input type="checkbox" checked={colors.includes(c)} onChange={() => toggle(colors, setColors, c)} className="peer sr-only" />
                    <span className={`block h-9 w-9 rounded-full border-2 border-white ${bg} ring-1 ring-stone-300 peer-checked:ring-2 peer-checked:ring-amber-700 peer-focus-visible:ring-2 peer-focus-visible:ring-amber-500`} />
                    <span className="mt-1 block text-[11px] text-stone-500">{c}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            {chips.length > 0 && <button type="button" onClick={clear} className="text-sm text-amber-800 underline underline-offset-4">Clear all filters</button>}
          </form>

          <section aria-label="Products">
            {chips.length > 0 && (
              <ul className="mb-6 flex flex-wrap gap-2" aria-label="Active filters">
                {chips.map(([type, v]) => (
                  <li key={type + v}>
                    <button type="button" onClick={() => (type === "cat" ? toggle(cats, setCats, v) : type === "color" ? toggle(colors, setColors, v) : setPrice("any"))}
                      className="flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-900 hover:bg-amber-200">
                      {v}<X className="h-3.5 w-3.5" /><span className="sr-only">Remove filter</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {results.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-stone-300 py-20 text-center">
                <p className="font-serif text-2xl">Nothing matches just yet</p>
                <p className="mt-2 text-sm text-stone-500">Try removing a filter or two.</p>
                <button type="button" onClick={clear} className="mt-6 rounded-full bg-stone-900 px-6 py-2.5 text-sm text-white">Clear filters</button>
              </div>
            ) : (
              <ul className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3">
                {results.map((p) => (
                  <li key={p.id}>
                    <article className="group">
                      <div className={`relative aspect-[4/5] overflow-hidden rounded-2xl bg-gradient-to-br ${p.grad}`}>
                        <span className="absolute inset-0 flex items-center justify-center font-serif text-6xl text-white/40 transition group-hover:scale-110" aria-hidden="true">{p.name[0]}</span>
                        {p.badge && <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-medium">{p.badge}</span>}
                        <button type="button" onClick={() => setCart({ ...cart, [p.id]: (cart[p.id] || 0) + 1 })}
                          className="absolute inset-x-3 bottom-3 translate-y-2 rounded-full bg-stone-900 py-2.5 text-sm font-medium text-white opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100 focus:translate-y-0 focus:opacity-100">
                          {cart[p.id] ? `In basket (${cart[p.id]}) · Add another` : "Quick add"}
                        </button>
                      </div>
                      <div className="mt-3 flex items-start justify-between gap-2">
                        <div>
                          <h2 className="text-sm font-medium"><a href={`#p${p.id}`} className="hover:underline">{p.name}</a></h2>
                          <p className="text-xs text-stone-500">{p.color} · {p.cat}</p>
                        </div>
                        <p className="text-sm font-semibold">${p.price}</p>
                      </div>
                      <p className="mt-1 flex items-center gap-1 text-xs text-stone-500"><Star className="h-3.5 w-3.5 text-amber-600" />{p.rating}</p>
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
