import { useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';

/**
 * Hero2 — Split Hero: Copy Left, Visual Block Right (Style: Minimal / Professional)
 * Brand: Kestrel Studio (Architectural Acoustics & Timber Engineering)
 */
export function Hero2() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [consultOpen, setConsultOpen] = useState(false);

  return (
    <div className="bg-neutral-50 text-neutral-900 font-sans border-b border-neutral-200">
      <header className="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between gap-8 border-b border-neutral-200">
        <a
          href="#kestrel-top"
          className="text-lg font-semibold tracking-tight text-neutral-950 whitespace-nowrap shrink-0"
        >
          Kestrel Studio
        </a>

        <nav aria-label="Kestrel primary" className="hidden md:flex items-center gap-7 text-sm font-medium text-neutral-600">
          <a href="#acoustics" className="hover:text-neutral-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            Acoustic Systems
          </a>
          <a href="#projects" className="hover:text-neutral-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            Selected Works
          </a>
          <a href="#materials" className="hover:text-neutral-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            Timber Lab
          </a>
          <a href="#practice" className="hover:text-neutral-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            Practice
          </a>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setConsultOpen((prev) => !prev)}
            className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-medium text-neutral-950 border border-neutral-300 bg-white rounded-md hover:border-neutral-900 transition-colors whitespace-nowrap shrink-0"
          >
            {consultOpen ? 'Close Spec Sheet' : 'Request Spec Book'}
          </button>
          <button
            type="button"
            aria-expanded={mobileOpen}
            aria-label="Toggle Kestrel navigation"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-md border border-neutral-300 text-neutral-800"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {mobileOpen && (
        <nav aria-label="Kestrel mobile" className="md:hidden px-6 py-4 bg-white border-b border-neutral-200 flex flex-col gap-3 text-sm font-medium text-neutral-700">
          <a href="#acoustics" onClick={() => setMobileOpen(false)} className="py-1.5">Acoustic Systems</a>
          <a href="#projects" onClick={() => setMobileOpen(false)} className="py-1.5">Selected Works</a>
          <a href="#materials" onClick={() => setMobileOpen(false)} className="py-1.5">Timber Lab</a>
          <a href="#practice" onClick={() => setMobileOpen(false)} className="py-1.5">Practice</a>
        </nav>
      )}

      <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-between py-2">
            <div>
              <p className="text-xs font-medium tracking-wider uppercase text-neutral-500 mb-4">
                Zurich &amp; Portland · Architectural Acoustics
              </p>

              <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-neutral-950 leading-[1.1] [text-wrap:balance]">
                Quiet rooms engineered in sculpted oak and raw concrete
              </h1>

              <p className="mt-6 text-base sm:text-lg text-neutral-600 leading-relaxed max-w-xl">
                We partner with civic architects and studio founders to design precision timber baffles, micro-perforated wall panels, and daylight-balanced workspaces with verified reverberation control.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => setConsultOpen(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-neutral-950 rounded-md hover:bg-neutral-800 transition-colors whitespace-nowrap shrink-0"
                >
                  <span>Book Acoustic Consultation</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>

                <a
                  href="#works"
                  className="inline-flex items-center px-5 py-3 text-sm font-medium text-neutral-800 hover:text-neutral-950 underline underline-offset-4 whitespace-nowrap shrink-0"
                >
                  View 2026 Monograph
                </a>
              </div>

              {consultOpen && (
                <div role="status" className="mt-6 p-4 rounded-md bg-white border border-neutral-200 text-sm text-neutral-700">
                  Digital CAD baffle profiles and NRC test data sheets are ready for download upon studio inquiry.
                </div>
              )}
            </div>

            <div className="mt-12 pt-6 border-t border-neutral-200 grid grid-cols-3 gap-6">
              <div>
                <p className="text-xl font-semibold text-neutral-950 tabular-nums">0.42s</p>
                <p className="mt-1 text-xs text-neutral-500">Target RT60 Decay</p>
              </div>
              <div>
                <p className="text-xl font-semibold text-neutral-950 tabular-nums">0.90</p>
                <p className="mt-1 text-xs text-neutral-500">ASTM NRC Rating</p>
              </div>
              <div>
                <p className="text-xl font-semibold text-neutral-950 tabular-nums">38</p>
                <p className="mt-1 text-xs text-neutral-500">Civic Installations</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 flex flex-col">
            <div className="relative flex-1 min-h-[340px] lg:min-h-[460px] rounded-lg overflow-hidden border border-neutral-200 bg-neutral-200">
              <img
                src="/src/assets/images/hero_architecture_studio_1795319285206.jpg"
                alt="Timber acoustic ceiling baffles above an oak studio worktable with floor-to-ceiling glazing"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="mt-3 text-xs text-neutral-500 flex items-center justify-between gap-4">
              <span>Pavilion North — Custom white oak wave baffle array</span>
              <span className="tabular-nums">2,400 sq ft</span>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
