import { useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';

/**
 * Hero10 — Editorial Magazine Hero (Style: Warm Editorial)
 * Brand: The Quarto Review (Quarterly Journal of Architecture & Space)
 */
export function Hero10() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [savedIssue, setSavedIssue] = useState(false);

  return (
    <div className="bg-[#F7F4EE] text-stone-900 font-sans border-b border-stone-300">
      {/* Masthead Header */}
      <header className="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between gap-8 border-b border-stone-900/20">
        <a
          href="#quarto-top"
          className="font-serif text-xl sm:text-2xl font-semibold tracking-tight text-stone-950 whitespace-nowrap shrink-0"
        >
          The Quarto Review
        </a>

        <nav aria-label="Quarto primary" className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-700">
          <a href="#monographs" className="hover:text-stone-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            Monographs
          </a>
          <a href="#criticism" className="hover:text-stone-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            Criticism
          </a>
          <a href="#exhibitions" className="hover:text-stone-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            Exhibitions
          </a>
          <a href="#editions" className="hover:text-stone-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            Print Editions
          </a>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setSavedIssue((prev) => !prev)}
            className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-medium text-stone-950 border border-stone-900 rounded-none hover:bg-stone-900 hover:text-stone-50 transition-colors whitespace-nowrap shrink-0"
          >
            {savedIssue ? 'Issue Saved' : 'Order Print Issue'}
          </button>
          <button
            type="button"
            aria-expanded={mobileOpen}
            aria-label="Toggle Quarto navigation"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 border border-stone-400 text-stone-900"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {mobileOpen && (
        <nav aria-label="Quarto mobile" className="md:hidden px-6 py-4 bg-[#EFEAE0] border-b border-stone-300 flex flex-col gap-3 text-sm font-medium text-stone-800">
          <a href="#monographs" onClick={() => setMobileOpen(false)} className="py-1.5">Monographs</a>
          <a href="#criticism" onClick={() => setMobileOpen(false)} className="py-1.5">Criticism</a>
          <a href="#exhibitions" onClick={() => setMobileOpen(false)} className="py-1.5">Exhibitions</a>
          <a href="#editions" onClick={() => setMobileOpen(false)} className="py-1.5">Print Editions</a>
        </nav>
      )}

      <section className="mx-auto max-w-6xl px-6 py-14 md:py-20">
        {/* Editorial Vol/Issue strip */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-10 border-b border-stone-900/15 text-xs tracking-widest uppercase text-stone-600">
          <span>Vol. XIV · Issue 04 · Autumn 2026</span>
          <span>Featured Monograph — Light &amp; Limestone</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <p className="text-xs font-medium tracking-widest uppercase text-amber-900 mb-4">
                Cover Essay · By Claire Lindqvist
              </p>

              <h1 className="font-serif text-4xl sm:text-5xl font-medium tracking-tight text-stone-950 leading-[1.08] [text-wrap:balance]">
                The Architecture of Measured Shadow
              </h1>

              <p className="mt-6 font-serif text-lg text-stone-700 leading-relaxed">
                How northern European museum courtyards use deep limestone reveals and unglazed colonnades to choreograph daylight across changing seasons.
              </p>

              <p className="mt-4 text-sm text-stone-600 leading-relaxed">
                Featuring measured elevation drawings, archival photography from Basel and Aarhus, and notes from the conservation team.
              </p>
            </div>

            <div className="mt-10 pt-6 border-t border-stone-900/15 flex flex-wrap items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setSavedIssue(true)}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-stone-50 bg-stone-950 hover:bg-stone-800 transition-colors whitespace-nowrap shrink-0"
              >
                <span>Read Lead Feature</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>

              <span className="text-xs text-stone-500">18 min read · Pages 14–31</span>
            </div>

            {savedIssue && (
              <p role="status" className="mt-4 text-xs font-medium text-amber-900">
                Vol. XIV Issue 04 added to your reading folio.
              </p>
            )}
          </div>

          <div className="lg:col-span-7 flex flex-col">
            <div className="flex-1 min-h-[320px] lg:min-h-[440px] bg-stone-200 border border-stone-300 overflow-hidden">
              <img
                src="/src/assets/images/hero_editorial_pavilion_1795319293951.jpg"
                alt="Limestone museum colonnade with warm afternoon shadows cast across stone pavers"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="mt-2.5 text-xs font-serif italic text-stone-600">
              Fig. 1 — East colonnade at 16:40 solar azimuth, photographed on medium-format film.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
