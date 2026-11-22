import { useState } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';

/**
 * Hero4 — Hero with Stats Row (Style: Minimal / Professional)
 * Brand: Harborline Logistics (Global Cold-Chain Maritime & Air Freight)
 */
export function Hero4() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [quoteMode, setQuoteMode] = useState(false);

  const stats = [
    { value: '99.4%', label: 'On-time port clearance across 42 terminals' },
    { value: '±0.2°C', label: 'Continuous thermal corridor tolerance' },
    { value: '1.8M', label: 'Metric tons of biologics & perishables shipped' },
    { value: '14 min', label: 'Average customs manifest pre-verification' },
  ];

  return (
    <div className="bg-slate-50 text-slate-900 font-sans border-b border-slate-200">
      <header className="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between gap-8 border-b border-slate-200">
        <a
          href="#harborline-top"
          className="text-lg font-semibold tracking-tight text-slate-950 whitespace-nowrap shrink-0"
        >
          Harborline Logistics
        </a>

        <nav aria-label="Harborline primary" className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <a href="#corridors" className="hover:text-slate-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            Trade Corridors
          </a>
          <a href="#telemetry" className="hover:text-slate-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            Thermal Telemetry
          </a>
          <a href="#customs" className="hover:text-slate-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            Customs Desk
          </a>
          <a href="#compliance" className="hover:text-slate-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            GDP Compliance
          </a>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setQuoteMode((prev) => !prev)}
            className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-sky-700 rounded-md hover:bg-sky-800 transition-colors whitespace-nowrap shrink-0"
          >
            {quoteMode ? 'Lane Inquiry Opened' : 'Book Freight Lane'}
          </button>
          <button
            type="button"
            aria-expanded={mobileOpen}
            aria-label="Toggle Harborline navigation"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-md border border-slate-300 text-slate-800"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {mobileOpen && (
        <nav aria-label="Harborline mobile" className="md:hidden px-6 py-4 bg-white border-b border-slate-200 flex flex-col gap-3 text-sm font-medium text-slate-700">
          <a href="#corridors" onClick={() => setMobileOpen(false)} className="py-1.5">Trade Corridors</a>
          <a href="#telemetry" onClick={() => setMobileOpen(false)} className="py-1.5">Thermal Telemetry</a>
          <a href="#customs" onClick={() => setMobileOpen(false)} className="py-1.5">Customs Desk</a>
          <a href="#compliance" onClick={() => setMobileOpen(false)} className="py-1.5">GDP Compliance</a>
        </nav>
      )}

      <section className="mx-auto max-w-6xl px-6 pt-20 pb-16">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold tracking-wider uppercase text-sky-700 mb-4">
            Controlled-Temperature Freight · Rotterdam to Singapore
          </p>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-slate-950 leading-[1.08] [text-wrap:balance]">
            Unbroken cold-chain custody from factory gate to pharmacy dock
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
            Harborline operates dedicated refrigerated containers, airport tarmac coolers, and live satellite telemetry so sensitive cargo never crosses an unmonitored handoff.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => setQuoteMode(true)}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-sky-700 rounded-md hover:bg-sky-800 transition-colors whitespace-nowrap shrink-0"
            >
              <span>Calculate Route &amp; Tariff</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#sla"
              className="inline-flex items-center px-5 py-3 text-sm font-semibold text-slate-800 bg-white border border-slate-300 rounded-md hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0"
            >
              Inspect 2026 SLA Report
            </a>
          </div>

          {quoteMode && (
            <p role="status" className="mt-4 text-sm text-sky-800 font-medium">
              Route estimator initialized: standard Rotterdam–Newark reefer transit is currently 8 days, 4 hours.
            </p>
          )}
        </div>

        <div className="mt-16 pt-10 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="space-y-1.5">
              <p className="text-3xl font-semibold tracking-tight text-slate-950 tabular-nums">
                {stat.value}
              </p>
              <p className="text-sm text-slate-600 leading-snug">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
