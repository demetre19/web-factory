import { useState } from 'react';
import { ArrowRight, Menu, ShieldCheck, X } from 'lucide-react';

/**
 * Hero18 — Dark Split Hero with Logo Cloud Under (Style: Dark)
 * Brand: Bastion Custody (Institutional Key Sharding & Multi-Party Vaults)
 */
export function Hero18() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [auditRequested, setAuditRequested] = useState(false);

  const institutions = ['NORDIC BANK', 'VERITAS TRUST', 'HELVETIA CLEARING', 'APEX TREASURY', 'BOREALIS RE'];

  return (
    <div className="bg-[#0D1117] text-slate-100 font-sans border-b border-slate-800">
      <header className="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between gap-8 border-b border-slate-800">
        <a
          href="#bastion-top"
          className="text-lg font-semibold tracking-tight text-white whitespace-nowrap shrink-0"
        >
          Bastion Custody
        </a>

        <nav aria-label="Bastion primary" className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-400">
          <a href="#mpc" className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            Threshold MPC
          </a>
          <a href="#hsm" className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            Hardware Quorum
          </a>
          <a href="#policies" className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            Policy Engine
          </a>
          <a href="#attestations" className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            Attestations
          </a>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setAuditRequested((prev) => !prev)}
            className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-semibold text-slate-950 bg-emerald-400 rounded-md hover:bg-emerald-300 transition-colors whitespace-nowrap shrink-0"
          >
            {auditRequested ? 'SOC Report Shared' : 'Inspect Security Brief'}
          </button>
          <button
            type="button"
            aria-expanded={mobileOpen}
            aria-label="Toggle Bastion navigation"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-md border border-slate-700 text-slate-200"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {mobileOpen && (
        <nav aria-label="Bastion mobile" className="md:hidden px-6 py-4 bg-slate-900 border-b border-slate-800 flex flex-col gap-3 text-sm font-medium text-slate-300">
          <a href="#mpc" onClick={() => setMobileOpen(false)} className="py-1.5">Threshold MPC</a>
          <a href="#hsm" onClick={() => setMobileOpen(false)} className="py-1.5">Hardware Quorum</a>
          <a href="#policies" onClick={() => setMobileOpen(false)} className="py-1.5">Policy Engine</a>
          <a href="#attestations" onClick={() => setMobileOpen(false)} className="py-1.5">Attestations</a>
        </nav>
      )}

      <section className="mx-auto max-w-6xl px-6 pt-16 pb-14 md:pt-24 md:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6">
            <p className="text-xs font-medium tracking-widest uppercase text-emerald-400 mb-4">
              FIPS 140-3 Level 4 Enclaves · Geographic Quorum Signing
            </p>

            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white leading-[1.08] [text-wrap:balance]">
              Institutional key custody with zero single-operator risk
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed">
              Bastion distributes signing authority across air-gapped hardware modules in Zurich, Frankfurt, and Toronto—enforcing programmable spend policies before a signature ever forms.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => setAuditRequested(true)}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-slate-950 bg-emerald-400 rounded-md hover:bg-emerald-300 transition-colors whitespace-nowrap shrink-0"
              >
                <span>Request Architecture Review</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href="#cryptography"
                className="inline-flex items-center px-5 py-3 text-sm font-semibold text-slate-200 border border-slate-700 rounded-md hover:border-slate-500 transition-colors whitespace-nowrap shrink-0"
              >
                Verify Proof Specifications
              </a>
            </div>

            {auditRequested && (
              <p role="status" className="mt-4 text-sm text-emerald-300 font-medium">
                Cryptographic attestation packet and penetration test summary unlocked.
              </p>
            )}
          </div>

          {/* Geometric Hardware Quorum Diagram Block */}
          <div className="lg:col-span-6">
            <div className="rounded-lg border border-slate-800 bg-[#131922] p-6 sm:p-8">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2 text-sm font-medium text-white">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>3-of-5 Regional Enclave Quorum</span>
                </div>
                <span className="text-xs font-mono text-slate-400 tabular-nums">ED25519 / ECDSA</span>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-4">
                {[
                  { city: 'Zurich HSM', state: 'Verified' },
                  { city: 'Frankfurt HSM', state: 'Verified' },
                  { city: 'Toronto HSM', state: 'Standby' },
                ].map((node) => (
                  <div key={node.city} className="p-4 rounded border border-slate-800 bg-slate-950/60">
                    <p className="text-xs font-medium text-slate-300">{node.city}</p>
                    <p className="mt-2 text-xs font-mono text-emerald-400">{node.state}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Deterministic Policy Verification</span>
                <span className="font-mono tabular-nums text-slate-200">0.84 ms overhead</span>
              </div>
            </div>
          </div>
        </div>

        {/* Institutional Logo Cloud Under */}
        <div className="mt-16 pt-8 border-t border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <p className="text-xs font-medium tracking-wider uppercase text-slate-400 whitespace-nowrap">
            Trusted by settlement desks
          </p>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
            {institutions.map((org) => (
              <span
                key={org}
                className="text-xs sm:text-sm font-semibold tracking-widest text-slate-400 hover:text-white transition-colors whitespace-nowrap"
              >
                {org}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
