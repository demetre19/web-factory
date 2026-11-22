import { useState } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';

/**
 * Hero19 — Bold Full-Bleed Gradient + 4-Column Stats Hero (Style: Bold)
 * Brand: Apex Athletics Lab (Biomechanics & Endurance Performance Testing)
 */
export function Hero19() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sessionBooked, setSessionBooked] = useState(false);

  const metrics = [
    { number: '1,000 Hz', caption: 'Dual force-plate ground reaction sampling' },
    { number: '14 Days', caption: 'Lactate threshold & VO2 adaptation block' },
    { number: '312', caption: 'Olympic & WorldTour athletes profiled' },
    { number: '4.8%', caption: 'Mean marathon economy improvement' },
  ];

  return (
    <div className="relative overflow-hidden bg-[#0A1128] text-white font-sans border-b border-blue-950">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(125deg,#0A1128_0%,#172554_48%,#1E3A8A_100%)]"
      />

      <header className="relative z-10 mx-auto max-w-6xl px-6 py-5 flex items-center justify-between gap-8 border-b border-white/15">
        <a
          href="#apex-top"
          className="font-display text-2xl font-bold uppercase tracking-tight text-white whitespace-nowrap shrink-0"
        >
          Apex Lab
        </a>

        <nav aria-label="Apex Lab primary" className="hidden md:flex items-center gap-7 text-sm font-semibold text-blue-100/85">
          <a href="#vo2" className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            Metabolic Testing
          </a>
          <a href="#kinematics" className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            3D Kinematics
          </a>
          <a href="#altitude" className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            Altitude Chamber
          </a>
          <a href="#coaches" className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            Sports Science
          </a>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setSessionBooked((prev) => !prev)}
            className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-bold text-slate-950 bg-amber-400 rounded hover:bg-amber-300 transition-colors whitespace-nowrap shrink-0"
          >
            {sessionBooked ? 'Lab Slot Reserved' : 'Book Lab Intake'}
          </button>
          <button
            type="button"
            aria-expanded={mobileOpen}
            aria-label="Toggle Apex Lab navigation"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded border border-white/25 text-white"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {mobileOpen && (
        <nav aria-label="Apex Lab mobile" className="relative z-10 md:hidden px-6 py-4 bg-blue-950/95 border-b border-white/15 flex flex-col gap-3 text-sm font-semibold text-blue-100">
          <a href="#vo2" onClick={() => setMobileOpen(false)} className="py-1.5">Metabolic Testing</a>
          <a href="#kinematics" onClick={() => setMobileOpen(false)} className="py-1.5">3D Kinematics</a>
          <a href="#altitude" onClick={() => setMobileOpen(false)} className="py-1.5">Altitude Chamber</a>
          <a href="#coaches" onClick={() => setMobileOpen(false)} className="py-1.5">Sports Science</a>
        </nav>
      )}

      <section className="relative z-10 mx-auto max-w-6xl px-6 pt-20 pb-16 md:pt-28 md:pb-20">
        <div className="max-w-4xl">
          <p className="text-xs font-bold tracking-widest uppercase text-amber-300 mb-4">
            Boulder, Colorado · Human Performance &amp; Telemetry
          </p>

          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold uppercase tracking-tight text-white leading-[0.96] [text-wrap:balance]">
            Turn physiological limits into measurable race speed
          </h1>

          <p className="mt-6 max-w-2xl text-base sm:text-lg text-blue-100/90 leading-relaxed">
            Motion-capture gait analysis, breath-by-breath calorimetry, and sweat electrolyte profiling combined into an actionable six-week training block.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => setSessionBooked(true)}
              className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-bold text-slate-950 bg-amber-400 rounded hover:bg-amber-300 transition-colors whitespace-nowrap shrink-0"
            >
              <span>{sessionBooked ? 'Assessment Confirmed' : 'Schedule Performance Assessment'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#protocols"
              className="inline-flex items-center px-6 py-3.5 text-sm font-semibold text-white border border-white/30 rounded hover:bg-white/10 transition-colors whitespace-nowrap shrink-0"
            >
              View Testing Protocols
            </a>
          </div>

          {sessionBooked && (
            <p role="status" className="mt-4 text-sm font-medium text-amber-300">
              Intake dossier queued — physiological pre-screening forms sent for Boulder Lab.
            </p>
          )}
        </div>

        <div className="mt-16 pt-10 border-t border-white/15 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {metrics.map((m) => (
            <div key={m.number}>
              <p className="font-display text-3xl sm:text-4xl font-bold text-white tabular-nums">{m.number}</p>
              <p className="mt-1.5 text-sm text-blue-100/80 leading-snug">{m.caption}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
