import { useState } from 'react';
import { ArrowRight, Menu, Pause, Play, X } from 'lucide-react';

/**
 * Hero16 — Split Video-Style Reel Hero (Style: Minimal / Professional)
 * Brand: Nordik Spatial (Modular Timber Workspaces & Studio Architecture)
 */
export function Hero16() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [reelPlaying, setReelPlaying] = useState(false);
  const [brochureSent, setBrochureSent] = useState(false);

  return (
    <div className="bg-white text-slate-900 font-sans border-b border-slate-200">
      <header className="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between gap-8 border-b border-slate-200">
        <a
          href="#nordik-top"
          className="text-lg font-semibold tracking-tight text-slate-950 whitespace-nowrap shrink-0"
        >
          Nordik Spatial
        </a>

        <nav aria-label="Nordik primary" className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <a href="#systems" className="hover:text-slate-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            Timber Systems
          </a>
          <a href="#daylight" className="hover:text-slate-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            Daylight Modeling
          </a>
          <a href="#case-studies" className="hover:text-slate-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            Studios Built
          </a>
          <a href="#spec-sheets" className="hover:text-slate-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            CAD Library
          </a>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setBrochureSent((prev) => !prev)}
            className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
          >
            {brochureSent ? 'Packet Ready' : 'Order Timber Sample'}
          </button>
          <button
            type="button"
            aria-expanded={mobileOpen}
            aria-label="Toggle Nordik navigation"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-md border border-slate-300 text-slate-800"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {mobileOpen && (
        <nav aria-label="Nordik mobile" className="md:hidden px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-col gap-3 text-sm font-medium text-slate-700">
          <a href="#systems" onClick={() => setMobileOpen(false)} className="py-1.5">Timber Systems</a>
          <a href="#daylight" onClick={() => setMobileOpen(false)} className="py-1.5">Daylight Modeling</a>
          <a href="#case-studies" onClick={() => setMobileOpen(false)} className="py-1.5">Studios Built</a>
          <a href="#spec-sheets" onClick={() => setMobileOpen(false)} className="py-1.5">CAD Library</a>
        </nav>
      )}

      <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5">
            <p className="text-xs font-medium tracking-wider uppercase text-slate-500 mb-4">
              Prefabricated Cross-Laminated Timber · 6-Week On-Site Assembly
            </p>

            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-slate-950 leading-[1.08] [text-wrap:balance]">
              Daylit workrooms assembled without wet concrete delays
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-600 leading-relaxed">
              Every structural portal, acoustic ceiling rib, and triple-glazed window wall arrives CNC-milled to millimeter tolerances for rapid dry assembly.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => setBrochureSent(true)}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
              >
                <span>Plan Your Studio Footprint</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setReelPlaying((prev) => !prev)}
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-slate-900 border border-slate-300 rounded-md hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
              >
                {reelPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{reelPlaying ? 'Pause Site Reel' : 'Play 2m Walkthrough'}</span>
              </button>
            </div>

            {brochureSent && (
              <p role="status" className="mt-4 text-sm text-slate-700 font-medium">
                White-oak acoustic sample kit &amp; structural span chart selected.
              </p>
            )}
          </div>

          <div className="lg:col-span-7">
            <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
              <img
                src="/src/assets/images/hero_architecture_studio_1795319285206.jpg"
                alt="Architects gathered around a white oak table inside a prefabricated timber and glass studio"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/15 to-transparent"
              />

              <button
                type="button"
                onClick={() => setReelPlaying((prev) => !prev)}
                aria-label={reelPlaying ? 'Pause site walkthrough video' : 'Play site walkthrough video'}
                className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-white text-slate-950 shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
              >
                {reelPlaying ? (
                  <Pause className="w-6 h-6 fill-current" />
                ) : (
                  <Play className="w-6 h-6 fill-current translate-x-0.5" />
                )}
              </button>

              <div className="absolute inset-x-0 bottom-0 p-5 flex items-center justify-between text-xs text-white/95">
                <span className="font-medium">
                  {reelPlaying ? 'Playing: Aarhus Timber Pavilion Time-Lapse' : 'Watch: 6-Week Timber Erection Film'}
                </span>
                <span className="font-mono tabular-nums">02:14</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
