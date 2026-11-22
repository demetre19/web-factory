import { useState } from 'react';
import { ArrowRight, Check, Menu, X } from 'lucide-react';

/**
 * Hero1 — Centered Headline + CTA (Style: Minimal / Professional)
 * Brand: Meridian Ledger (Corporate Treasury & Cashflow Infrastructure)
 */
export function Hero1() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [demoRequested, setDemoRequested] = useState(false);

  return (
    <div className="relative overflow-hidden bg-white text-slate-950 font-sans border-b border-slate-200">
      {/* Subtle architectural grid backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:64px_64px] opacity-35 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_20%,#000_55%,transparent_100%)]"
      />

      <header className="relative z-10 mx-auto max-w-6xl px-6 py-5 flex items-center justify-between gap-8 border-b border-slate-200/80">
        <a
          href="#meridian-top"
          className="text-lg font-semibold tracking-tight text-slate-950 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slate-900"
        >
          Meridian Ledger
        </a>

        <nav aria-label="Meridian primary" className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <a href="#cash-visibility" className="hover:text-slate-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            Cash Visibility
          </a>
          <a href="#liquidity" className="hover:text-slate-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            Liquidity Rules
          </a>
          <a href="#controls" className="hover:text-slate-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            Audit Controls
          </a>
          <a href="#pricing" className="hover:text-slate-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            Pricing
          </a>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setDemoRequested((prev) => !prev)}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-950 rounded-md hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950"
          >
            {demoRequested ? 'Briefing Scheduled' : 'Request Briefing'}
          </button>
          <button
            type="button"
            aria-expanded={mobileOpen}
            aria-label="Toggle Meridian navigation"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {mobileOpen && (
        <nav aria-label="Meridian mobile" className="relative z-10 md:hidden px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-col gap-3 text-sm font-medium text-slate-700">
          <a href="#cash-visibility" onClick={() => setMobileOpen(false)} className="py-1.5">Cash Visibility</a>
          <a href="#liquidity" onClick={() => setMobileOpen(false)} className="py-1.5">Liquidity Rules</a>
          <a href="#controls" onClick={() => setMobileOpen(false)} className="py-1.5">Audit Controls</a>
          <a href="#pricing" onClick={() => setMobileOpen(false)} className="py-1.5">Pricing</a>
        </nav>
      )}

      <section className="relative z-10 mx-auto max-w-4xl px-6 py-24 md:py-32 text-center">
        <p className="text-xs font-medium tracking-wider uppercase text-slate-500 mb-5">
          Corporate Treasury Infrastructure · Multi-Bank Reconciliation
        </p>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-slate-950 leading-[1.08] [text-wrap:balance]">
          Real-time cash positioning across every entity and currency
        </h1>

        <p className="mt-6 mx-auto max-w-2xl text-base sm:text-lg text-slate-600 leading-relaxed">
          Meridian connects directly to 140+ commercial banks, normalizes intraday statement feeds, and produces audit-ready liquidity forecasts before markets open.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => setDemoRequested(true)}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-slate-950 rounded-md hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950"
          >
            {demoRequested ? (
              <>
                <Check className="w-4 h-4" />
                <span>Briefing Request Confirmed</span>
              </>
            ) : (
              <>
                <span>Schedule Treasury Briefing</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <a
            href="#architecture"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-slate-900 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
          >
            Read Architecture Note
          </a>
        </div>

        {demoRequested && (
          <p role="status" className="mt-5 text-sm text-slate-700 font-medium">
            Our treasury engineering team has logged your briefing request for the next available session.
          </p>
        )}

        <div className="mt-14 pt-8 border-t border-slate-200 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500">
          <span>SOC 2 Type II Audited</span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">$48B Annual Volume Reconciled</span>
          <span aria-hidden="true">·</span>
          <span>ISO 20022 Native</span>
        </div>
      </section>
    </div>
  );
}
