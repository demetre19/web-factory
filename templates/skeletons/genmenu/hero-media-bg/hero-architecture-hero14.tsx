import { useState } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';

/**
 * Hero14 — Warm-Editorial Split Hero with Provenance Stats Strip (Style: Warm Editorial)
 * Brand: Atelier Verve (Botanical Apothecary & Cold-Pressed Formulations)
 */
export function Hero14() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sampleOrdered, setSampleOrdered] = useState(false);

  const provenance = [
    { metric: '100%', detail: 'Single-origin harvest traceability from Grasse & Kyoto' },
    { metric: '42°C', detail: 'Maximum cold-maceration extraction threshold' },
    { metric: '0.0%', detail: 'Synthetic stabilizers, silicones, or volatile fillers' },
  ];

  return (
    <div className="bg-[#FAF7F2] text-stone-900 font-sans border-b border-stone-200">
      <header className="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between gap-8 border-b border-stone-200">
        <a
          href="#verve-top"
          className="font-serif text-xl font-semibold tracking-tight text-stone-950 whitespace-nowrap shrink-0"
        >
          Atelier Verve
        </a>

        <nav aria-label="Atelier Verve primary" className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600">
          <a href="#formulations" className="hover:text-stone-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            Formulations
          </a>
          <a href="#botanicals" className="hover:text-stone-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            Botanical Library
          </a>
          <a href="#vessels" className="hover:text-stone-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            Amber Vessels
          </a>
          <a href="#journal" className="hover:text-stone-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            Field Notes
          </a>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setSampleOrdered((prev) => !prev)}
            className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-medium text-stone-50 bg-stone-900 rounded-md hover:bg-stone-800 transition-colors whitespace-nowrap shrink-0"
          >
            {sampleOrdered ? 'Discovery Set Added' : 'Order Discovery Set'}
          </button>
          <button
            type="button"
            aria-expanded={mobileOpen}
            aria-label="Toggle Atelier Verve navigation"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-md border border-stone-300 text-stone-800"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {mobileOpen && (
        <nav aria-label="Atelier Verve mobile" className="md:hidden px-6 py-4 bg-stone-100 border-b border-stone-200 flex flex-col gap-3 text-sm font-medium text-stone-700">
          <a href="#formulations" onClick={() => setMobileOpen(false)} className="py-1.5">Formulations</a>
          <a href="#botanicals" onClick={() => setMobileOpen(false)} className="py-1.5">Botanical Library</a>
          <a href="#vessels" onClick={() => setMobileOpen(false)} className="py-1.5">Amber Vessels</a>
          <a href="#journal" onClick={() => setMobileOpen(false)} className="py-1.5">Field Notes</a>
        </nav>
      )}

      <section className="mx-auto max-w-6xl px-6 py-16 md:py-22">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-between py-2">
            <div>
              <p className="text-xs font-medium tracking-widest uppercase text-amber-900/80 mb-4">
                Batch No. 03 · Small-Lot Botanical Extraction
              </p>

              <h1 className="font-serif text-4xl sm:text-5xl font-medium tracking-tight text-stone-950 leading-[1.1] [text-wrap:balance]">
                Small-batch apothecary blends steeped in stillness
              </h1>

              <p className="mt-6 text-base sm:text-lg text-stone-600 leading-relaxed max-w-xl">
                Every amber vessel is compounded by hand from wild-harvested eucalyptus, hinoki bark, and cold-pressed seed oils—bottled quarterly in numbered apothecary runs.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => setSampleOrdered(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-stone-50 bg-stone-900 rounded-md hover:bg-stone-800 transition-colors whitespace-nowrap shrink-0"
                >
                  <span>Explore Autumn Harvest</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <a
                  href="#apothecary-process"
                  className="inline-flex items-center px-5 py-3 text-sm font-medium text-stone-800 underline underline-offset-4 hover:text-stone-950 whitespace-nowrap shrink-0"
                >
                  Read Extraction Ledger
                </a>
              </div>

              {sampleOrdered && (
                <p role="status" className="mt-4 text-sm text-amber-900 font-medium">
                  Three 10 ml amber apothecary vials reserved in your seasonal tasting kit.
                </p>
              )}
            </div>

            <div className="mt-12 pt-8 border-t border-stone-200 grid grid-cols-1 sm:grid-cols-3 gap-6">
              {provenance.map((item) => (
                <div key={item.metric}>
                  <p className="font-serif text-2xl font-semibold text-stone-950 tabular-nums">{item.metric}</p>
                  <p className="mt-1 text-xs text-stone-600 leading-snug">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6 flex flex-col">
            <div className="flex-1 min-h-[340px] lg:min-h-[450px] rounded-lg overflow-hidden border border-stone-200 bg-stone-200">
              <img
                src="/src/assets/images/hero_botanical_atelier_1795319285489.jpg"
                alt="Amber apothecary bottles, stoneware pitchers, and eucalyptus stems on a travertine table"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
