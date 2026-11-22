import { useState } from 'react';
import { Menu, Pause, Play, Volume2, X } from 'lucide-react';

/**
 * Hero6 — Video-Style Hero with Play Button Block (Style: Dark)
 * Brand: Monolith Audio (Analog Mastering Consoles & Spatial Acoustics)
 */
export function Hero6() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeChapter, setActiveChapter] = useState(0);

  const chapters = [
    { time: '00:00', title: 'Discrete Class-A Signal Path' },
    { time: '01:18', title: 'Stepped Brass Attenuator Calibration' },
    { time: '02:44', title: 'Master Bus Transformer Harmonic Sweep' },
  ];

  return (
    <div className="bg-[#101012] text-stone-100 font-sans border-b border-stone-800">
      <header className="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between gap-8 border-b border-stone-800/90">
        <a
          href="#monolith-top"
          className="text-lg font-semibold tracking-tight text-white whitespace-nowrap shrink-0"
        >
          Monolith Audio
        </a>

        <nav aria-label="Monolith primary" className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-400">
          <a href="#consoles" className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            Consoles
          </a>
          <a href="#circuitry" className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            Circuitry
          </a>
          <a href="#studios" className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            Partner Studios
          </a>
          <a href="#support" className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            Engineering
          </a>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setIsPlaying(true)}
            className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-medium text-stone-950 bg-amber-300 rounded-md hover:bg-amber-200 transition-colors whitespace-nowrap shrink-0"
          >
            Reserve Build Slot
          </button>
          <button
            type="button"
            aria-expanded={mobileOpen}
            aria-label="Toggle Monolith navigation"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-md border border-stone-700 text-stone-200"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {mobileOpen && (
        <nav aria-label="Monolith mobile" className="md:hidden px-6 py-4 bg-stone-950 border-b border-stone-800 flex flex-col gap-3 text-sm font-medium text-stone-300">
          <a href="#consoles" onClick={() => setMobileOpen(false)} className="py-1.5">Consoles</a>
          <a href="#circuitry" onClick={() => setMobileOpen(false)} className="py-1.5">Circuitry</a>
          <a href="#studios" onClick={() => setMobileOpen(false)} className="py-1.5">Partner Studios</a>
          <a href="#support" onClick={() => setMobileOpen(false)} className="py-1.5">Engineering</a>
        </nav>
      )}

      <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-medium tracking-widest uppercase text-amber-300/90 mb-4">
            Series M4 Reference Console · Hand-Wired in Sheffield
          </p>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-white leading-[1.08] [text-wrap:balance]">
            Tactile headroom for mastering rooms that refuse compromise
          </h1>

          <p className="mt-6 text-base sm:text-lg text-stone-300 leading-relaxed max-w-2xl mx-auto">
            Milled from solid billet aluminum with custom Lundahl output transformers and 41-step detented brass attenuators for exact recall across sessions.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setIsPlaying((prev) => !prev)}
              className="inline-flex items-center gap-2.5 px-6 py-3 text-sm font-semibold text-stone-950 bg-amber-300 rounded-md hover:bg-amber-200 transition-colors whitespace-nowrap shrink-0"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isPlaying ? 'Pause Studio Film' : 'Watch Studio Film (03:42)'}</span>
            </button>
            <a
              href="#specs"
              className="inline-flex items-center px-6 py-3 text-sm font-semibold text-stone-200 border border-stone-700 rounded-md hover:border-stone-500 hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Download Schematic PDF
            </a>
          </div>
        </div>

        {/* Video-style interactive media block */}
        <div className="mt-14 relative rounded-xl overflow-hidden border border-stone-800 bg-stone-950">
          <div className="relative aspect-video w-full bg-stone-900">
            <img
              src="/src/assets/images/hero_audio_hardware_1795319286573.jpg"
              alt="Matte black analog mastering console with brass toggle switches and VU meters"
              referrerPolicy="no-referrer"
              className={`w-full h-full object-cover transition-transform duration-500 ${isPlaying ? 'scale-[1.02]' : 'scale-100'}`}
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/15"
            />

            {/* Centered Play Button Trigger */}
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                type="button"
                onClick={() => setIsPlaying((prev) => !prev)}
                aria-label={isPlaying ? 'Pause studio demonstration film' : 'Play studio demonstration film'}
                className="group inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/95 text-stone-950 shadow-xl hover:scale-105 transition-transform focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300"
              >
                {isPlaying ? (
                  <Pause className="w-7 h-7 fill-current" />
                ) : (
                  <Play className="w-7 h-7 fill-current translate-x-0.5" />
                )}
              </button>
            </div>

            {/* Bottom video controls bar */}
            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-sm text-stone-200">
                <Volume2 className="w-4 h-4 text-amber-300 shrink-0" />
                <span className="font-medium">
                  {isPlaying
                    ? `Playing Chapter ${activeChapter + 1}: ${chapters[activeChapter].title}`
                    : 'Inside Abbey North Mastering — M4 Console Walkthrough'}
                </span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto">
                {chapters.map((chapter, idx) => (
                  <button
                    key={chapter.time}
                    type="button"
                    onClick={() => {
                      setActiveChapter(idx);
                      setIsPlaying(true);
                    }}
                    className={`px-3 py-1.5 text-xs font-mono tabular-nums rounded border transition-colors whitespace-nowrap shrink-0 ${
                      activeChapter === idx && isPlaying
                        ? 'bg-amber-300 text-stone-950 border-amber-300 font-medium'
                        : 'bg-black/60 text-stone-300 border-white/20 hover:border-white/50'
                    }`}
                  >
                    {chapter.time} · Ch. {idx + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
