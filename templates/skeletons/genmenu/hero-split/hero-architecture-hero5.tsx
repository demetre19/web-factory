import { useState } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';

/**
 * Hero5 — Hero with Logo-Cloud Under (Style: Minimal / Professional)
 * Brand: Sable Procurement (Enterprise Vendor Governance & Spend Control)
 */
export function Hero5() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [tourActive, setTourActive] = useState(false);

  const partners = [
    { name: 'Nordic Rail', mark: 'NORDIC RAIL' },
    { name: 'Helios Bio', mark: 'HELIOS BIO' },
    { name: 'Calder Steel', mark: 'CALDER' },
    { name: 'Mercator Bank', mark: 'MERCATOR' },
    { name: 'Strata Energy', mark: 'STRATA' },
  ];

  return (
    <div className="bg-white text-neutral-900 font-sans border-b border-neutral-200">
      <header className="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between gap-8 border-b border-neutral-200">
        <a
          href="#sable-top"
          className="text-lg font-semibold tracking-tight text-neutral-950 whitespace-nowrap shrink-0"
        >
          Sable Procurement
        </a>

        <nav aria-label="Sable primary" className="hidden md:flex items-center gap-7 text-sm font-medium text-neutral-600">
          <a href="#intake" className="hover:text-neutral-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            Vendor Intake
          </a>
          <a href="#approvals" className="hover:text-neutral-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            Policy Routing
          </a>
          <a href="#renewals" className="hover:text-neutral-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            Renewal Ledger
          </a>
          <a href="#security" className="hover:text-neutral-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            Security
          </a>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setTourActive((prev) => !prev)}
            className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-neutral-900 rounded-md hover:bg-neutral-800 transition-colors whitespace-nowrap shrink-0"
          >
            {tourActive ? 'Walkthrough Active' : 'Book Product Tour'}
          </button>
          <button
            type="button"
            aria-expanded={mobileOpen}
            aria-label="Toggle Sable navigation"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-md border border-neutral-300 text-neutral-800"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {mobileOpen && (
        <nav aria-label="Sable mobile" className="md:hidden px-6 py-4 bg-neutral-50 border-b border-neutral-200 flex flex-col gap-3 text-sm font-medium text-neutral-700">
          <a href="#intake" onClick={() => setMobileOpen(false)} className="py-1.5">Vendor Intake</a>
          <a href="#approvals" onClick={() => setMobileOpen(false)} className="py-1.5">Policy Routing</a>
          <a href="#renewals" onClick={() => setMobileOpen(false)} className="py-1.5">Renewal Ledger</a>
          <a href="#security" onClick={() => setMobileOpen(false)} className="py-1.5">Security</a>
        </nav>
      )}

      <section className="mx-auto max-w-6xl px-6 pt-20 pb-16">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-medium tracking-wider uppercase text-neutral-500 mb-4">
            Enterprise Spend Governance · Contract &amp; Security Intake
          </p>

          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-neutral-950 leading-[1.1] [text-wrap:balance]">
            Approve every software contract without chasing five departments
          </h1>

          <p className="mt-6 text-base sm:text-lg text-neutral-600 leading-relaxed max-w-2xl mx-auto">
            Sable unifies legal redlines, infosec questionnaires, and finance budget sign-offs into one auditable intake workflow built for multi-subsidiary procurement teams.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setTourActive(true)}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-neutral-900 rounded-md hover:bg-neutral-800 transition-colors whitespace-nowrap shrink-0"
            >
              <span>Start Guided Walkthrough</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#benchmark"
              className="inline-flex items-center px-6 py-3 text-sm font-semibold text-neutral-900 border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors whitespace-nowrap shrink-0"
            >
              Download Procurement Guide
            </a>
          </div>

          {tourActive && (
            <p role="status" className="mt-4 text-sm text-neutral-700 font-medium">
              Interactive approval workflow preview prepared — average cycle time drops from 19 days to 3.4 days.
            </p>
          )}
        </div>

        {/* Logo cloud strip */}
        <div className="mt-20 pt-10 border-t border-neutral-200">
          <p className="text-center text-xs font-medium tracking-wider uppercase text-neutral-500 mb-8">
            Standardized across procurement teams at 320+ regulated enterprises
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 items-center justify-items-center">
            {partners.map((partner) => (
              <div
                key={partner.name}
                className="flex items-center gap-2.5 text-neutral-500 hover:text-neutral-900 transition-colors select-none"
                aria-label={partner.name}
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="3" y="3" width="8" height="8" stroke="currentColor" strokeWidth="1.75" />
                  <rect x="13" y="13" width="8" height="8" fill="currentColor" />
                  <path d="M13 7H21M3 17H11" stroke="currentColor" strokeWidth="1.75" />
                </svg>
                <span className="text-sm font-semibold tracking-widest uppercase whitespace-nowrap">
                  {partner.mark}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
