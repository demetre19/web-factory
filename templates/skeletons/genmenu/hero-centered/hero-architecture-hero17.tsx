import { useState } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';

/**
 * Hero17 — Minimal Text-Only Editorial Manifesto (Style: Warm Editorial)
 * Brand: Commonplace Books (Archival Monographs & Sewn-Binding Editions)
 */
export function Hero17() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedEdition, setSelectedEdition] = useState<'hardcover' | 'archival'>('hardcover');
  const [catalogRequested, setCatalogRequested] = useState(false);

  return (
    <div className="bg-[#F6F2EA] text-stone-900 font-sans border-b border-stone-300">
      <header className="mx-auto max-w-5xl px-6 py-6 flex items-center justify-between gap-8 border-b border-stone-300">
        <a
          href="#commonplace-top"
          className="font-serif text-xl font-semibold tracking-tight text-stone-950 whitespace-nowrap shrink-0"
        >
          Commonplace Books
        </a>

        <nav aria-label="Commonplace primary" className="hidden md:flex items-center gap-7 text-sm text-stone-600">
          <a href="#catalog" className="hover:text-stone-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            Complete List
          </a>
          <a href="#bindery" className="hover:text-stone-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            Smyth-Sewn Bindery
          </a>
          <a href="#translations" className="hover:text-stone-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            Translations
          </a>
          <a href="#bookshops" className="hover:text-stone-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            Stockists
          </a>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setCatalogRequested((prev) => !prev)}
            className="hidden sm:inline-flex items-center text-sm font-medium text-stone-950 underline underline-offset-4 hover:text-amber-900 transition-colors whitespace-nowrap shrink-0"
          >
            {catalogRequested ? 'Catalogue Queued' : 'Request Print Catalogue'}
          </button>
          <button
            type="button"
            aria-expanded={mobileOpen}
            aria-label="Toggle Commonplace navigation"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 border border-stone-400 text-stone-900"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {mobileOpen && (
        <nav aria-label="Commonplace mobile" className="md:hidden px-6 py-4 bg-[#EFE9DD] border-b border-stone-300 flex flex-col gap-3 text-sm text-stone-800">
          <a href="#catalog" onClick={() => setMobileOpen(false)} className="py-1.5">Complete List</a>
          <a href="#bindery" onClick={() => setMobileOpen(false)} className="py-1.5">Smyth-Sewn Bindery</a>
          <a href="#translations" onClick={() => setMobileOpen(false)} className="py-1.5">Translations</a>
          <a href="#bookshops" onClick={() => setMobileOpen(false)} className="py-1.5">Stockists</a>
        </nav>
      )}

      <section className="mx-auto max-w-5xl px-6 py-20 md:py-28">
        <p className="text-xs tracking-widest uppercase text-stone-500 mb-6">
          Independent Imprint · Printed on Uncoated Munken Lynx Paper
        </p>

        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight text-stone-950 leading-[1.09] max-w-4xl [text-wrap:balance]">
          Books bound to stay open flat on a draftsman&rsquo;s desk for{' '}
          <span className="italic font-normal text-amber-950">a hundred years.</span>
        </h1>

        <div className="mt-12 pt-10 border-t border-stone-300 grid grid-cols-1 md:grid-cols-12 gap-10">
          <p className="md:col-span-6 font-serif text-base sm:text-lg text-stone-700 leading-relaxed">
            Commonplace publishes overlooked architectural essays, botanical field notebooks, and primary source translations in small runs of two thousand numbered copies.
          </p>

          <div className="md:col-span-6 flex flex-col justify-between gap-6">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
              <span className="text-stone-500 mr-1">Format:</span>
              <button
                type="button"
                onClick={() => setSelectedEdition('hardcover')}
                className={`px-3 py-1.5 border transition-colors ${
                  selectedEdition === 'hardcover'
                    ? 'bg-stone-900 text-stone-50 border-stone-900'
                    : 'bg-transparent text-stone-700 border-stone-400 hover:border-stone-900'
                }`}
              >
                Linen Hardcover ($42)
              </button>
              <button
                type="button"
                onClick={() => setSelectedEdition('archival')}
                className={`px-3 py-1.5 border transition-colors ${
                  selectedEdition === 'archival'
                    ? 'bg-stone-900 text-stone-50 border-stone-900'
                    : 'bg-transparent text-stone-700 border-stone-400 hover:border-stone-900'
                }`}
              >
                Slipcase Archive ($95)
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <button
                type="button"
                onClick={() => setCatalogRequested(true)}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-stone-50 bg-stone-950 hover:bg-stone-800 transition-colors whitespace-nowrap shrink-0"
              >
                <span>
                  {selectedEdition === 'hardcover' ? 'Reserve Autumn List (Linen)' : 'Reserve Slipcase Edition'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {catalogRequested && (
              <p role="status" className="text-xs font-medium text-amber-900">
                Autumn 2026 imprint prospectus reserved in {selectedEdition} format.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
