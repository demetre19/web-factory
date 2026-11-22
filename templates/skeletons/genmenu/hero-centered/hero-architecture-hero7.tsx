import { useState } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';

/**
 * Hero7 — Minimal Text-Only Hero (Style: Minimal / Professional)
 * Brand: Alder & Reed LLP (Independent Patent & Technology Counsel)
 */
export function Hero7() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [briefVisible, setBriefVisible] = useState(false);

  return (
    <div className="bg-white text-neutral-950 font-sans border-b border-neutral-200">
      <header className="mx-auto max-w-5xl px-6 py-6 flex items-center justify-between gap-8 border-b border-neutral-900">
        <a
          href="#alder-top"
          className="text-base font-semibold tracking-tight text-neutral-950 whitespace-nowrap shrink-0"
        >
          Alder &amp; Reed
        </a>

        <nav aria-label="Alder and Reed primary" className="hidden md:flex items-center gap-8 text-sm text-neutral-600">
          <a href="#litigation" className="hover:text-neutral-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            IP Litigation
          </a>
          <a href="#licensing" className="hover:text-neutral-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            Cross-Licensing
          </a>
          <a href="#partners" className="hover:text-neutral-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            Partners
          </a>
          <a href="#decisions" className="hover:text-neutral-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            Case Record
          </a>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setBriefVisible((prev) => !prev)}
            className="hidden sm:inline-flex items-center text-sm font-semibold text-neutral-950 underline underline-offset-4 hover:text-neutral-600 transition-colors whitespace-nowrap shrink-0"
          >
            {briefVisible ? 'Hide Chambers Info' : 'Retain Counsel'}
          </button>
          <button
            type="button"
            aria-expanded={mobileOpen}
            aria-label="Toggle Alder and Reed navigation"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 border border-neutral-300 text-neutral-900"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {mobileOpen && (
        <nav aria-label="Alder and Reed mobile" className="md:hidden px-6 py-4 bg-neutral-50 border-b border-neutral-200 flex flex-col gap-3 text-sm text-neutral-700">
          <a href="#litigation" onClick={() => setMobileOpen(false)} className="py-1.5">IP Litigation</a>
          <a href="#licensing" onClick={() => setMobileOpen(false)} className="py-1.5">Cross-Licensing</a>
          <a href="#partners" onClick={() => setMobileOpen(false)} className="py-1.5">Partners</a>
          <a href="#decisions" onClick={() => setMobileOpen(false)} className="py-1.5">Case Record</a>
        </nav>
      )}

      <section className="mx-auto max-w-5xl px-6 py-24 md:py-32">
        <p className="text-xs tracking-widest uppercase text-neutral-500 mb-6">
          Boston · London · Tokyo — Technology &amp; Patent Chambers
        </p>

        <h1 className="max-w-4xl text-4xl sm:text-5xl md:text-[3.5rem] font-medium tracking-tight text-neutral-950 leading-[1.08] [text-wrap:balance]">
          Trial advocacy for semiconductor, systems, and foundation-model disputes.
        </h1>

        <div className="mt-10 pt-8 border-t border-neutral-200 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          <p className="md:col-span-7 text-base sm:text-lg text-neutral-600 leading-relaxed">
            Every partner at Alder &amp; Reed holds an advanced engineering degree and argues directly before appellate benches. We accept twelve mandates per year to guarantee senior-partner attention from first filing through verdict.
          </p>

          <div className="md:col-span-5 md:flex md:flex-col md:items-end justify-between gap-4">
            <button
              type="button"
              onClick={() => setBriefVisible(true)}
              className="inline-flex items-center gap-3 px-6 py-3.5 text-sm font-semibold text-white bg-neutral-950 hover:bg-neutral-800 transition-colors whitespace-nowrap shrink-0"
            >
              <span>Request Conflict Check</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="mt-3 md:mt-0 text-xs text-neutral-500 md:text-right">
              Direct partner desk · Response within 4 business hours
            </p>
          </div>
        </div>

        {briefVisible && (
          <div role="status" className="mt-8 pt-6 border-t border-neutral-200 text-sm text-neutral-700 flex flex-wrap items-center justify-between gap-4">
            <span>Conflict intake desk is open for Q4 ITC and Federal Circuit matters.</span>
            <span className="font-mono text-xs text-neutral-500">chambers@alderreed.example</span>
          </div>
        )}
      </section>
    </div>
  );
}
