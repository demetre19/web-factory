import { useState } from 'react';
import { ArrowRight, Check, Copy, Menu, X } from 'lucide-react';

/**
 * Hero3 — Full-Bleed Gradient Hero (Style: Dark)
 * Brand: Vespera Cloud (Distributed Inference & Edge Compute)
 */
export function Hero3() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [copiedCli, setCopiedCli] = useState(false);
  const [regionSelected, setRegionSelected] = useState(false);

  const handleCopyCli = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText('npx vespera deploy --regions=global').catch(() => {});
    }
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  };

  return (
    <div className="relative overflow-hidden bg-[#09090B] text-zinc-100 font-sans border-b border-zinc-800">
      {/* Full-bleed measured dark gradient canvas */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_65%_at_50%_-10%,rgba(30,64,175,0.45),rgba(15,23,42,0.28)_45%,transparent_75%),linear-gradient(135deg,#09090B_0%,#0F172A_55%,#09090B_100%)]"
      />

      <header className="relative z-10 mx-auto max-w-6xl px-6 py-5 flex items-center justify-between gap-8 border-b border-white/10">
        <a
          href="#vespera-top"
          className="text-lg font-semibold tracking-tight text-white whitespace-nowrap shrink-0"
        >
          Vespera Cloud
        </a>

        <nav aria-label="Vespera primary" className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-300">
          <a href="#runtime" className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            Edge Runtime
          </a>
          <a href="#routing" className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            Anycast Routing
          </a>
          <a href="#benchmarks" className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            Benchmarks
          </a>
          <a href="#docs" className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            Documentation
          </a>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setRegionSelected((prev) => !prev)}
            className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-medium text-zinc-950 bg-white rounded-md hover:bg-zinc-200 transition-colors whitespace-nowrap shrink-0"
          >
            {regionSelected ? 'Cluster Provisioned' : 'Launch Cluster'}
          </button>
          <button
            type="button"
            aria-expanded={mobileOpen}
            aria-label="Toggle Vespera navigation"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-md border border-white/15 text-zinc-200"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {mobileOpen && (
        <nav aria-label="Vespera mobile" className="relative z-10 md:hidden px-6 py-4 bg-zinc-950/90 border-b border-white/10 flex flex-col gap-3 text-sm font-medium text-zinc-300">
          <a href="#runtime" onClick={() => setMobileOpen(false)} className="py-1.5">Edge Runtime</a>
          <a href="#routing" onClick={() => setMobileOpen(false)} className="py-1.5">Anycast Routing</a>
          <a href="#benchmarks" onClick={() => setMobileOpen(false)} className="py-1.5">Benchmarks</a>
          <a href="#docs" onClick={() => setMobileOpen(false)} className="py-1.5">Documentation</a>
        </nav>
      )}

      <section className="relative z-10 mx-auto max-w-5xl px-6 py-24 md:py-32 text-center">
        <p className="text-xs font-medium tracking-widest uppercase text-blue-300/90 mb-5">
          38 Global Edge Regions · Deterministic Cold Starts
        </p>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-white leading-[1.08] [text-wrap:balance]">
          Deploy stateful workloads within 18 milliseconds of every user
        </h1>

        <p className="mt-6 mx-auto max-w-2xl text-base sm:text-lg text-zinc-300 leading-relaxed">
          Vespera compiles TypeScript and Rust services into isolated micro-VMs with built-in regional replication, zero egress fees, and predictable per-second billing.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => setRegionSelected(true)}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-zinc-950 bg-white rounded-md hover:bg-zinc-200 transition-colors whitespace-nowrap shrink-0"
          >
            <span>{regionSelected ? 'Sandbox Ready in 3 Regions' : 'Start Deploying Free'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleCopyCli}
            aria-label="Copy Vespera deploy CLI command"
            className="inline-flex items-center gap-3 px-4 py-3 text-sm font-mono text-zinc-200 bg-white/5 border border-white/15 rounded-md hover:bg-white/10 transition-colors whitespace-nowrap shrink-0"
          >
            <span className="text-zinc-400">$</span>
            <span>npx vespera deploy --regions=global</span>
            {copiedCli ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4 text-zinc-400" />
            )}
          </button>
        </div>

        <div className="mt-14 pt-8 border-t border-white/10 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs text-zinc-400 tabular-nums">
          <span>14ms Median Cold Boot</span>
          <span aria-hidden="true">·</span>
          <span>99.995% Measured Uptime</span>
          <span aria-hidden="true">·</span>
          <span>WireGuard Mesh Included</span>
        </div>
      </section>
    </div>
  );
}
