import { useState } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';

/**
 * Hero13 — Full-Bleed Atmospheric Photo + Measured Scrim Hero (Style: Dark)
 * Brand: Korsan Pavilion (Automotive Architecture & Private Collection Spaces)
 */
export function Hero13() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [tourBooked, setTourBooked] = useState(false);

  return (
    <div className="relative overflow-hidden bg-zinc-950 text-white font-sans border-b border-zinc-800">
      {/* Full-bleed background photography with measured scrim */}
      <img
        src="/src/assets/images/hero_electric_mobility_1795319285456.jpg"
        alt="Twilight concrete architectural pavilion housing a dark electric grand tourer"
        referrerPolicy="no-referrer"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-zinc-950/45"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-950/55 to-transparent"
      />

      <header className="relative z-10 mx-auto max-w-6xl px-6 py-5 flex items-center justify-between gap-8 border-b border-white/15">
        <a
          href="#korsan-top"
          className="text-lg font-semibold tracking-tight text-white whitespace-nowrap shrink-0"
        >
          Korsan Pavilion
        </a>

        <nav aria-label="Korsan primary" className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-200">
          <a href="#pavilions" className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            Pavilions
          </a>
          <a href="#concrete" className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            Materiality
          </a>
          <a href="#lighting" className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            Daylight Studies
          </a>
          <a href="#commissions" className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            Commissions
          </a>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setTourBooked((prev) => !prev)}
            className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-semibold text-zinc-950 bg-white rounded-md hover:bg-zinc-200 transition-colors whitespace-nowrap shrink-0"
          >
            {tourBooked ? 'Visit Requested' : 'Private Viewing'}
          </button>
          <button
            type="button"
            aria-expanded={mobileOpen}
            aria-label="Toggle Korsan navigation"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-md border border-white/25 text-white"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {mobileOpen && (
        <nav aria-label="Korsan mobile" className="relative z-10 md:hidden px-6 py-4 bg-zinc-950/95 border-b border-white/15 flex flex-col gap-3 text-sm font-medium text-zinc-200">
          <a href="#pavilions" onClick={() => setMobileOpen(false)} className="py-1.5">Pavilions</a>
          <a href="#concrete" onClick={() => setMobileOpen(false)} className="py-1.5">Materiality</a>
          <a href="#lighting" onClick={() => setMobileOpen(false)} className="py-1.5">Daylight Studies</a>
          <a href="#commissions" onClick={() => setMobileOpen(false)} className="py-1.5">Commissions</a>
        </nav>
      )}

      <section className="relative z-10 mx-auto max-w-6xl px-6 pt-28 pb-20 md:pt-40 md:pb-24">
        <div className="max-w-2xl">
          <p className="text-xs font-medium tracking-widest uppercase text-zinc-300 mb-4">
            Lake Geneva · Board-Formed Concrete &amp; Structural Glass
          </p>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-white leading-[1.08] [text-wrap:balance]">
            Monolithic gallery shelters crafted for twilight and form
          </h1>

          <p className="mt-6 text-base sm:text-lg text-zinc-200 leading-relaxed">
            Korsan designs climate-stabilized private collection pavilions using cast-in-place architectural concrete, coffered acoustic ceilings, and museum-grade lighting.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => setTourBooked(true)}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-zinc-950 bg-white rounded-md hover:bg-zinc-200 transition-colors whitespace-nowrap shrink-0"
            >
              <span>{tourBooked ? 'Portfolio Request Sent' : 'Request Private Portfolio'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="#specifications"
              className="inline-flex items-center px-6 py-3 text-sm font-semibold text-white border border-white/30 bg-black/30 rounded-md hover:bg-black/50 transition-colors whitespace-nowrap shrink-0"
            >
              Explore Built Pavilions
            </a>
          </div>

          {tourBooked && (
            <p role="status" className="mt-4 text-sm text-zinc-200">
              Our Geneva studio will share the private architectural dossier within 24 hours.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
