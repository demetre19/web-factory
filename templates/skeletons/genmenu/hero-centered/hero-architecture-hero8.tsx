import { useState } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';

/**
 * Hero8 — Announcement-Bar + Hero Combo (Style: Bold)
 * Brand: Foundry Grid (Design Engineering & Interface Systems)
 */
export function Hero8() {
  const [bannerVisible, setBannerVisible] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [starterSelected, setStarterSelected] = useState(false);

  return (
    <div className="bg-zinc-950 text-white font-sans border-b border-zinc-800">
      {/* Announcement Bar */}
      {bannerVisible && (
        <div
          role="region"
          aria-label="Release announcement"
          className="bg-blue-700 text-white px-6 py-2.5 text-xs sm:text-sm flex items-center justify-between gap-4"
        >
          <div className="mx-auto flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center">
            <span className="font-semibold tracking-wide uppercase">New Release</span>
            <span aria-hidden="true">·</span>
            <span>Foundry Grid Token Compiler now exports W3C CSS variables and Swift styles in one build step.</span>
            <a
              href="#release-notes"
              className="font-semibold underline underline-offset-4 hover:text-blue-100 whitespace-nowrap"
            >
              Read Release Notes
            </a>
          </div>
          <button
            type="button"
            onClick={() => setBannerVisible(false)}
            aria-label="Dismiss announcement bar"
            className="p-1 text-white/80 hover:text-white shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <header className="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between gap-8 border-b border-zinc-800">
        <a
          href="#foundry-top"
          className="font-display text-2xl font-bold tracking-tight uppercase text-white whitespace-nowrap shrink-0"
        >
          Foundry Grid
        </a>

        <nav aria-label="Foundry primary" className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-300">
          <a href="#primitives" className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            Primitives
          </a>
          <a href="#tokens" className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            Design Tokens
          </a>
          <a href="#a11y" className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            Accessibility
          </a>
          <a href="#changelog" className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            Changelog
          </a>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setStarterSelected((prev) => !prev)}
            className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-semibold text-zinc-950 bg-white rounded hover:bg-zinc-200 transition-colors whitespace-nowrap shrink-0"
          >
            {starterSelected ? 'Kit Cloned' : 'Get Starter Kit'}
          </button>
          <button
            type="button"
            aria-expanded={mobileOpen}
            aria-label="Toggle Foundry navigation"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded border border-zinc-700 text-zinc-200"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {mobileOpen && (
        <nav aria-label="Foundry mobile" className="md:hidden px-6 py-4 bg-zinc-900 border-b border-zinc-800 flex flex-col gap-3 text-sm font-medium text-zinc-300">
          <a href="#primitives" onClick={() => setMobileOpen(false)} className="py-1.5">Primitives</a>
          <a href="#tokens" onClick={() => setMobileOpen(false)} className="py-1.5">Design Tokens</a>
          <a href="#a11y" onClick={() => setMobileOpen(false)} className="py-1.5">Accessibility</a>
          <a href="#changelog" onClick={() => setMobileOpen(false)} className="py-1.5">Changelog</a>
        </nav>
      )}

      <section className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-8">
            <p className="text-xs font-semibold tracking-widest uppercase text-blue-400 mb-4">
              Zero-Runtime CSS · Keyboard-First Components
            </p>

            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold uppercase tracking-tight text-white leading-[0.96] [text-wrap:balance]">
              Ship interface systems built to outlast trends
            </h1>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <p className="text-base text-zinc-300 leading-relaxed">
              Accessible dialogs, data tables, and responsive grid primitives compiled directly into clean Tailwind utilities with zero lock-in.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setStarterSelected(true)}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-blue-600 rounded hover:bg-blue-500 transition-colors whitespace-nowrap shrink-0"
              >
                <span>{starterSelected ? 'Starter Ready' : 'Install Component Kit'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              {!bannerVisible && (
                <button
                  type="button"
                  onClick={() => setBannerVisible(true)}
                  className="px-4 py-3 text-xs font-medium text-zinc-400 hover:text-white underline underline-offset-4 whitespace-nowrap"
                >
                  Show Release Note
                </button>
              )}
            </div>

            {starterSelected && (
              <p role="status" className="text-xs font-mono text-blue-300">
                Ready: npm create foundry-grid@latest
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
