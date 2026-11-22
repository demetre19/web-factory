import { useState } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';

/**
 * Hero15 — Bold Typographic Poster Hero with Announcement Bar (Style: Bold)
 * Brand: Kinetic Press (Independent Type Foundry & Risograph Specimen Lab)
 */
export function Hero15() {
  const [announcementOpen, setAnnouncementOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [specimenWeight, setSpecimenWeight] = useState<'600' | '700'>('700');
  const [trialDownloaded, setTrialDownloaded] = useState(false);

  return (
    <div className="bg-[#FAF8F5] text-stone-950 font-sans border-b border-stone-300">
      {announcementOpen && (
        <div
          role="region"
          aria-label="Foundry exhibition notice"
          className="bg-[#C2410C] text-white px-6 py-2.5 text-xs sm:text-sm flex items-center justify-between gap-4"
        >
          <div className="mx-auto flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center">
            <span className="font-semibold uppercase tracking-wider">Specimen Release</span>
            <span aria-hidden="true">·</span>
            <span>Kinetic Sans Variable 2.0 ships with Cyrillic, Greek &amp; optical tabular figures.</span>
            <a href="#trial-fonts" className="font-semibold underline underline-offset-4 whitespace-nowrap">
              Download Trial Pack
            </a>
          </div>
          <button
            type="button"
            onClick={() => setAnnouncementOpen(false)}
            aria-label="Dismiss announcement"
            className="p-1 text-white/80 hover:text-white shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <header className="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between gap-8 border-b-2 border-stone-950">
        <a
          href="#kinetic-top"
          className="font-display text-2xl font-bold uppercase tracking-tight text-stone-950 whitespace-nowrap shrink-0"
        >
          Kinetic Press
        </a>

        <nav aria-label="Kinetic Press primary" className="hidden md:flex items-center gap-7 text-sm font-semibold text-stone-700">
          <a href="#typefaces" className="hover:text-stone-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            Typefaces
          </a>
          <a href="#specimens" className="hover:text-stone-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            Print Specimens
          </a>
          <a href="#licensing" className="hover:text-stone-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            Licensing
          </a>
          <a href="#custom" className="hover:text-stone-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            Custom Cuts
          </a>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setTrialDownloaded((prev) => !prev)}
            className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-stone-950 hover:bg-[#C2410C] transition-colors whitespace-nowrap shrink-0"
          >
            {trialDownloaded ? 'Trials Queued' : 'Get Font Trials'}
          </button>
          <button
            type="button"
            aria-expanded={mobileOpen}
            aria-label="Toggle Kinetic Press navigation"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 border border-stone-900 text-stone-950"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {mobileOpen && (
        <nav aria-label="Kinetic Press mobile" className="md:hidden px-6 py-4 bg-white border-b border-stone-300 flex flex-col gap-3 text-sm font-semibold text-stone-800">
          <a href="#typefaces" onClick={() => setMobileOpen(false)} className="py-1.5">Typefaces</a>
          <a href="#specimens" onClick={() => setMobileOpen(false)} className="py-1.5">Print Specimens</a>
          <a href="#licensing" onClick={() => setMobileOpen(false)} className="py-1.5">Licensing</a>
          <a href="#custom" onClick={() => setMobileOpen(false)} className="py-1.5">Custom Cuts</a>
        </nav>
      )}

      <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <p className="text-xs font-bold tracking-widest uppercase text-[#C2410C]">
            Zurich Type Foundry · 1,240 Glyphs Per Weight
          </p>

          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="text-stone-500">Preview Weight:</span>
            <button
              type="button"
              onClick={() => setSpecimenWeight('600')}
              className={`px-2.5 py-1 border transition-colors ${
                specimenWeight === '600'
                  ? 'bg-stone-950 text-white border-stone-950'
                  : 'bg-white text-stone-700 border-stone-300'
              }`}
            >
              600 SemiBold
            </button>
            <button
              type="button"
              onClick={() => setSpecimenWeight('700')}
              className={`px-2.5 py-1 border transition-colors ${
                specimenWeight === '700'
                  ? 'bg-stone-950 text-white border-stone-950'
                  : 'bg-white text-stone-700 border-stone-300'
              }`}
            >
              700 Bold
            </button>
          </div>
        </div>

        <h1
          className={`font-display text-5xl sm:text-7xl md:text-8xl uppercase tracking-tight text-stone-950 leading-[0.94] [text-wrap:balance] ${
            specimenWeight === '700' ? 'font-bold' : 'font-semibold'
          }`}
        >
          Letterforms engineered for high-velocity editorial headlines
        </h1>

        <div className="mt-10 pt-8 border-t-2 border-stone-950 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <p className="md:col-span-7 text-base sm:text-lg text-stone-700 leading-relaxed">
            Built with tight ink-traps, tall x-heights, and crisp vertical stems so posters, broadsheets, and digital interfaces read cleanly from six feet away.
          </p>

          <div className="md:col-span-5 flex flex-wrap md:justify-end items-center gap-4">
            <button
              type="button"
              onClick={() => setTrialDownloaded(true)}
              className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-[#C2410C] hover:bg-[#9A3412] transition-colors whitespace-nowrap shrink-0"
            >
              <span>{trialDownloaded ? 'OTF & WOFF2 Ready' : 'Download Trial Specimen'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            {!announcementOpen && (
              <button
                type="button"
                onClick={() => setAnnouncementOpen(true)}
                className="text-xs font-semibold underline underline-offset-4 text-stone-700"
              >
                Show Notice
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
