import React, { useState } from 'react';
import { Minus, Plus, Trash2, ShoppingBag, ShieldCheck } from 'lucide-react';

interface SynthLine {
  id: string;
  name: string;
  format: string;
  price: number;
  qty: number;
  code: string;
}

const INIT_SYNTH: SynthLine[] = [
  { id: 'ms1', name: 'Dual VCO Oscillator 14HP', format: 'Eurorack · Anodized Black', price: 320, qty: 1, code: 'VCO' },
  { id: 'ms2', name: 'Quad Stereo VCA', format: 'Eurorack · 8HP', price: 210, qty: 1, code: 'VCA' },
];

const PATCH_ADDONS = [
  { id: 'pa1', name: 'Braided Patch Pack (6x)', price: 34, code: 'PP' },
  { id: 'pa2', name: '4HP Blank Aluminum Panel', price: 18, code: 'BP' },
  { id: 'pa3', name: 'MIDI-to-CV Bridge', price: 115, code: 'CV' },
  { id: 'pa4', name: 'Knurled Knob Kit (12x)', price: 24, code: 'KK' },
];

export function Shop15() {
  const [lines, setLines] = useState<SynthLine[]>(INIT_SYNTH);
  const [promo, setPromo] = useState('');
  const [rate, setRate] = useState(0);
  const [msg, setMsg] = useState('');

  const threshold = 600;
  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const discount = Number((subtotal * rate).toFixed(2));
  const shipping = subtotal === 0 || subtotal >= threshold ? 0 : 22;
  const total = Math.max(0, subtotal - discount + shipping);
  const pct = Math.min(100, Math.round((subtotal / threshold) * 100));

  return (
    <div className="min-h-screen bg-[#0E1116] text-slate-100 font-manrope">
      <header className="border-b border-slate-800 bg-[#161B22]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
          <a href="#monolith" className="font-space-mono text-base font-bold tracking-wider uppercase whitespace-nowrap shrink-0">
            Monolith Gear
          </a>
          <nav className="hidden md:flex items-center gap-7 text-xs font-space-mono uppercase text-slate-400" aria-label="Primary">
            <a href="#modules" className="hover:text-white whitespace-nowrap shrink-0">Modules</a>
            <a href="#cases" className="hover:text-white whitespace-nowrap shrink-0">Cases</a>
            <a href="#cables" className="hover:text-white whitespace-nowrap shrink-0">Patching</a>
            <a href="#manuals" className="hover:text-white whitespace-nowrap shrink-0">Docs</a>
          </nav>
          <span className="inline-flex items-center gap-2 font-space-mono text-xs text-emerald-400 whitespace-nowrap shrink-0 tabular-nums">
            <ShoppingBag className="w-4 h-4" />
            <span>RACK [{lines.reduce((s, l) => s + l.qty, 0)}]</span>
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="font-archivo text-3xl font-bold mb-8">Studio Rack Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left 8 Cols */}
          <section className="lg:col-span-8 space-y-6" aria-label="Cart hardware">
            <div className="p-4 bg-[#161B22] border border-slate-800 rounded-lg">
              <div className="flex justify-between font-space-mono text-xs mb-2">
                <span className="text-emerald-400">
                  {subtotal >= threshold
                    ? 'FREE INSURED AIR FREIGHT UNLOCKED'
                    : `ADD $${(threshold - subtotal).toFixed(0)} FOR FREE AIR FREIGHT`}
                </span>
                <span className="tabular-nums text-slate-400">{pct}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
              </div>
            </div>

            <div className="space-y-3">
              {lines.length === 0 ? (
                <div className="p-10 bg-[#161B22] border border-dashed border-slate-700 rounded-lg text-center">
                  <p className="font-space-mono text-sm">Rack cart is empty.</p>
                  <button
                    type="button"
                    onClick={() => setLines(INIT_SYNTH)}
                    className="mt-3 px-4 py-2 bg-emerald-500 text-black font-space-mono text-xs font-bold rounded"
                  >
                    RESTORE MODULES
                  </button>
                </div>
              ) : (
                lines.map((line) => (
                  <article key={line.id} className="p-4 bg-[#161B22] border border-slate-800 rounded-lg flex flex-wrap sm:flex-nowrap items-center gap-4">
                    <div className="w-20 h-20 rounded border border-slate-700 overflow-hidden shrink-0">
                      <svg viewBox="0 0 100 100" className="w-full h-full" role="img" aria-label={line.name}>
                        <rect width="100" height="100" fill="#0E1116" />
                        <rect x="14" y="14" width="72" height="72" fill="none" stroke="#10B981" strokeOpacity="0.45" />
                        <text x="50" y="57" textAnchor="middle" fill="#F8FAFC" fontSize="20" fontFamily="Space Mono, monospace">
                          {line.code}
                        </text>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-sm font-bold text-white truncate">{line.name}</h2>
                      <p className="font-space-mono text-xs text-slate-400 mt-0.5">{line.format}</p>
                      <p className="font-space-mono text-xs text-emerald-400 mt-1 tabular-nums">${line.price}</p>
                    </div>
                    <div className="flex items-center border border-slate-700 bg-[#0E1116] rounded">
                      <button
                        type="button"
                        onClick={() =>
                          setLines((p) => p.map((x) => (x.id === line.id ? { ...x, qty: Math.max(1, x.qty - 1) } : x)))
                        }
                        aria-label={`Decrease quantity for ${line.name}`}
                        className="p-2 text-slate-400 hover:text-white"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center font-space-mono text-xs tabular-nums">{line.qty}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setLines((p) => p.map((x) => (x.id === line.id ? { ...x, qty: x.qty + 1 } : x)))
                        }
                        aria-label={`Increase quantity for ${line.name}`}
                        className="p-2 text-slate-400 hover:text-white"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="w-20 text-right">
                      <p className="font-space-mono text-sm font-bold tabular-nums">${line.price * line.qty}</p>
                      <button
                        type="button"
                        onClick={() => setLines((p) => p.filter((x) => x.id !== line.id))}
                        aria-label={`Remove ${line.name}`}
                        className="mt-1 inline-flex items-center gap-1 font-space-mono text-[11px] text-slate-400 hover:text-rose-400"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>DEL</span>
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>

            {/* Cross-Sell Row */}
            <div className="pt-4">
              <h2 className="font-archivo text-lg font-bold mb-4">Patch &amp; Utility Add-Ons</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {PATCH_ADDONS.map((pa) => (
                  <article key={pa.id} className="bg-[#161B22] border border-slate-800 rounded-lg p-3.5">
                    <div className="aspect-[16/10] rounded bg-[#0E1116] border border-slate-800 mb-3">
                      <svg viewBox="0 0 160 100" className="w-full h-full" role="img" aria-label={pa.name}>
                        <text x="80" y="57" textAnchor="middle" fill="#10B981" fontSize="22" fontFamily="Space Mono, monospace">
                          {pa.code}
                        </text>
                      </svg>
                    </div>
                    <h3 className="text-xs font-semibold truncate">{pa.name}</h3>
                    <div className="mt-1.5 flex items-center justify-between">
                      <span className="font-space-mono text-xs text-slate-400 tabular-nums">${pa.price}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setLines((p) => {
                            const ex = p.find((x) => x.id === pa.id);
                            if (ex) return p.map((x) => (x.id === pa.id ? { ...x, qty: x.qty + 1 } : x));
                            return [...p, { id: pa.id, name: pa.name, format: 'Studio Utility', price: pa.price, qty: 1, code: pa.code }];
                          })
                        }
                        className="font-space-mono text-xs text-emerald-400 hover:underline"
                      >
                        + ADD
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Right 4 Cols Summary Sidebar */}
          <aside className="lg:col-span-4 bg-[#161B22] border border-slate-800 rounded-lg p-6 space-y-5" aria-label="Order summary">
            <h2 className="font-archivo text-lg font-bold">Checkout Summary</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (promo.trim().toUpperCase() === 'MOD20') {
                  setRate(0.2);
                  setMsg('MOD20 applied (-20%).');
                } else {
                  setRate(0);
                  setMsg('Unknown code. Try MOD20.');
                }
              }}
              className="space-y-2"
            >
              <label htmlFor="mod-promo" className="font-space-mono text-xs text-slate-400 block">
                PROMO CODE (MOD20)
              </label>
              <div className="flex gap-2">
                <input
                  id="mod-promo"
                  type="text"
                  value={promo}
                  onChange={(e) => setPromo(e.target.value)}
                  placeholder="MOD20"
                  className="flex-1 bg-[#0E1116] border border-slate-700 rounded px-3 py-2 font-space-mono text-xs text-white"
                />
                <button type="submit" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 font-space-mono text-xs rounded">
                  APPLY
                </button>
              </div>
              {msg && <p className="font-space-mono text-xs text-emerald-400">{msg}</p>}
            </form>

            <div className="space-y-2.5 pt-3 border-t border-slate-800 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Subtotal</span>
                <span className="font-space-mono tabular-nums">${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Discount (20%)</span>
                  <span className="font-space-mono tabular-nums">-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400">Freight</span>
                <span className="font-space-mono tabular-nums">{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-slate-800 text-base font-bold">
                <span>Total</span>
                <span className="font-space-mono text-emerald-400 tabular-nums">${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="button"
              disabled={lines.length === 0}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-black font-space-mono text-xs font-bold rounded inline-flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>PROCEED TO CHECKOUT</span>
            </button>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default Shop15;
