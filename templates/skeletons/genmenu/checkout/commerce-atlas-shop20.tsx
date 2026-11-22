import React, { useState } from 'react';
import { Minus, Plus, Trash2, ShoppingBag, X } from 'lucide-react';

interface MonographLine {
  id: string;
  title: string;
  edition: string;
  price: number;
  qty: number;
  mono: string;
}

const BOOKS = [
  { id: 'le1', title: 'Brutalist Concrete Studies', edition: 'Hardcover · Signed', price: 115, mono: 'BC' },
  { id: 'le2', title: 'Kyoto Timber Joinery', edition: 'Linen Slipcase', price: 145, mono: 'KT' },
  { id: 'le3', title: 'Typographic Grids 1968', edition: 'Second Printing', price: 88, mono: 'TG' },
  { id: 'le4', title: 'Brass Folio Weight', edition: 'Atelier Object', price: 72, mono: 'FW' },
];

export function Shop20() {
  const [open, setOpen] = useState(true);
  const [giftWrap, setGiftWrap] = useState(true);
  const [items, setItems] = useState<MonographLine[]>([
    { ...BOOKS[0], qty: 1 },
    { ...BOOKS[1], qty: 1 },
  ]);

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const wrapFee = giftWrap && items.length > 0 ? 12 : 0;
  const total = subtotal + wrapFee;

  const addBook = (b: (typeof BOOKS)[number]) => {
    setItems((prev) => {
      const hit = prev.find((x) => x.id === b.id);
      if (hit) return prev.map((x) => (x.id === b.id ? { ...x, qty: x.qty + 1 } : x));
      return [...prev, { ...b, qty: 1 }];
    });
    setOpen(true);
  };

  return (
    <div className="relative min-h-[calc(100vh-52px)] bg-[#F5F2EB] text-[#1A1918] font-dm overflow-hidden">
      <header className="border-b border-[#DFD8CA] bg-[#FAF8F3]">
        <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between gap-8">
          <a href="#edition" className="font-cormorant text-2xl font-semibold whitespace-nowrap shrink-0">
            L’Édition Rare
          </a>
          <nav className="hidden md:flex items-center gap-7 text-xs uppercase tracking-[0.2em] text-[#6E675E]" aria-label="Primary">
            <a href="#monographs" className="hover:text-[#1A1918] whitespace-nowrap shrink-0">Monographs</a>
            <a href="#prints" className="hover:text-[#1A1918] whitespace-nowrap shrink-0">Prints</a>
            <a href="#objects" className="hover:text-[#1A1918] whitespace-nowrap shrink-0">Objects</a>
            <a href="#archive" className="hover:text-[#1A1918] whitespace-nowrap shrink-0">Archive</a>
          </nav>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-[#1A1918] text-xs uppercase tracking-widest whitespace-nowrap shrink-0 tabular-nums"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#881337]" />
            <span>Folio ({items.reduce((s, i) => s + i.qty, 0)})</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12">
        <h1 className="font-cormorant text-3xl font-semibold mb-6">Collector Monographs</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {BOOKS.map((b) => (
            <article key={b.id} className="bg-white border border-[#DFD8CA]">
              <div className="aspect-[3/4] bg-[#EFEAE0] flex items-center justify-center border-b border-[#DFD8CA]">
                <span className="font-cormorant text-4xl italic text-[#1A1918]">{b.mono}</span>
              </div>
              <div className="p-4 flex items-end justify-between gap-2">
                <div>
                  <h2 className="font-cormorant text-lg font-semibold leading-tight">{b.title}</h2>
                  <p className="text-xs text-[#6E675E] tabular-nums mt-1">${b.price}</p>
                </div>
                <button
                  type="button"
                  onClick={() => addBook(b)}
                  className="text-xs uppercase tracking-widest text-[#881337] border-b border-[#881337]"
                >
                  Acquire
                </button>
              </div>
            </article>
          ))}
        </div>
      </main>

      {/* Wide Editorial Right Drawer */}
      {open && (
        <div className="absolute inset-0 z-30 flex justify-end">
          <button
            type="button"
            aria-label="Close folio backdrop"
            onClick={() => setOpen(false)}
            className="flex-1 bg-[#1A1918]/45"
          />
          <aside
            className="w-full max-w-[520px] bg-[#FAF8F3] border-l border-[#DFD8CA] flex flex-col justify-between h-full shadow-2xl"
            aria-label="Luxury editorial folio drawer"
          >
            <div className="px-7 py-5 border-b border-[#DFD8CA] flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#881337]">Curated Folio</p>
                <h2 className="font-cormorant text-2xl font-semibold">Acquisition Bag</h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close folio drawer"
                className="p-2 text-[#6E675E] hover:text-[#1A1918]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-7 py-6 space-y-5">
              {items.length === 0 ? (
                <p className="font-cormorant text-xl text-center py-12 text-[#6E675E]">Your folio is empty.</p>
              ) : (
                items.map((item) => (
                  <article key={item.id} className="flex items-center gap-4 pb-5 border-b border-[#E7E0D3]">
                    <div className="w-16 h-20 bg-[#EFEAE0] border border-[#DFD8CA] flex items-center justify-center font-cormorant text-xl italic shrink-0">
                      {item.mono}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-cormorant text-lg font-semibold truncate">{item.title}</h3>
                      <p className="text-xs text-[#6E675E]">{item.edition}</p>
                      <div className="mt-2 flex items-center gap-3">
                        <div className="inline-flex items-center border border-[#D4CCC0]">
                          <button
                            type="button"
                            onClick={() =>
                              setItems((p) => p.map((x) => (x.id === item.id ? { ...x, qty: Math.max(1, x.qty - 1) } : x)))
                            }
                            aria-label={`Decrease quantity for ${item.title}`}
                            className="p-1.5 hover:bg-[#EFEAE0]"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-7 text-center text-xs tabular-nums">{item.qty}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setItems((p) => p.map((x) => (x.id === item.id ? { ...x, qty: x.qty + 1 } : x)))
                            }
                            aria-label={`Increase quantity for ${item.title}`}
                            className="p-1.5 hover:bg-[#EFEAE0]"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => setItems((p) => p.filter((x) => x.id !== item.id))}
                          aria-label={`Remove ${item.title}`}
                          className="text-xs text-[#6E675E] hover:text-[#881337]"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm font-medium tabular-nums">${item.price * item.qty}</p>
                  </article>
                ))
              )}

              {/* Gift Wrap Toggle */}
              <label className="flex items-center justify-between p-4 bg-white border border-[#DFD8CA] cursor-pointer">
                <div>
                  <span className="block text-xs uppercase tracking-widest font-semibold">Archival Linen Wrapping</span>
                  <span className="block text-xs text-[#6E675E] mt-0.5">Hand-stamped wax seal &amp; cotton ribbon</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs tabular-nums">$12</span>
                  <input
                    type="checkbox"
                    checked={giftWrap}
                    onChange={(e) => setGiftWrap(e.target.checked)}
                    className="accent-[#881337] w-4 h-4"
                  />
                </div>
              </label>
            </div>

            <div className="px-7 py-6 border-t border-[#DFD8CA] bg-white space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-[#6E675E]">Total (incl. presentation)</span>
                <span className="font-cormorant text-2xl font-semibold tabular-nums">${total}</span>
              </div>
              <button
                type="button"
                disabled={items.length === 0}
                className="w-full py-3.5 bg-[#881337] hover:bg-[#70102D] disabled:opacity-40 text-white text-xs uppercase tracking-[0.2em] font-medium transition-colors"
              >
                Proceed to Checkout
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

export default Shop20;
