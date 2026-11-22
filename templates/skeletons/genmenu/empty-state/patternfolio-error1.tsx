import React, { useState } from 'react';
import { ArrowLeft, Home } from 'lucide-react';

export function Error1() {
  const [navNotice, setNavNotice] = useState<string | null>(null);

  return (
    <main className="min-h-[560px] lg:min-h-[680px] w-full bg-[#FAF9F6] text-neutral-950 flex items-center justify-center px-6 py-10 sm:py-16">
      <section aria-label="Page not found" className="w-full max-w-3xl">
        <div className="border-b border-neutral-300 pb-4 sm:pb-6 flex items-baseline justify-between gap-4">
          <span className="text-xs font-medium tracking-wider text-neutral-600">
            Error 404
          </span>
          <span className="text-xs font-mono tabular-nums text-neutral-500">/missing-route</span>
        </div>

        <div className="py-7 sm:py-10 grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-end">
          <div className="md:col-span-5">
            <h1 className="font-serif text-[5.25rem] sm:text-[8.5rem] leading-[0.88] font-normal tracking-tight text-neutral-950 select-none">
              404
            </h1>
          </div>

          <div className="md:col-span-7 space-y-5">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-950 leading-snug">
              This page has moved or no longer exists.
            </h2>
            <p className="text-base text-neutral-600 leading-relaxed">
              The URL you requested may have been archived during our latest reorganization, or the address contains a typo.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setNavNotice('Navigated to Home overview.')}
                className="inline-flex items-center gap-2 bg-neutral-950 text-white px-5 py-2.5 text-sm font-medium hover:bg-neutral-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2"
              >
                <Home className="w-4 h-4" aria-hidden="true" />
                <span>Return home</span>
              </button>
              <button
                type="button"
                onClick={() => setNavNotice('Returned to previous page.')}
                className="inline-flex items-center gap-2 border border-neutral-300 bg-transparent text-neutral-800 px-5 py-2.5 text-sm font-medium hover:bg-neutral-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                <span>Go back</span>
              </button>
            </div>
          </div>
        </div>

        <nav aria-label="Suggested destinations" className="border-t border-neutral-300 pt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { label: 'Documentation', desc: 'Guides, API references, and SDK notes' },
            { label: 'Release Archive', desc: 'Monthly product updates and changelogs' },
            { label: 'Support Desk', desc: 'Report a broken link or request help' },
          ].map((dest) => (
            <button
              key={dest.label}
              type="button"
              onClick={() => setNavNotice(`Opened ${dest.label}.`)}
              className="text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 rounded-md p-1 -m-1"
            >
              <div className="text-sm font-semibold text-neutral-950 group-hover:underline underline-offset-4">
                {dest.label}
              </div>
              <div className="mt-1 text-xs text-neutral-600">{dest.desc}</div>
            </button>
          ))}
        </nav>

        {navNotice && (
          <p role="status" className="mt-6 text-xs font-medium text-neutral-700 bg-neutral-200/70 inline-block px-3 py-1.5 rounded">
            {navNotice}
          </p>
        )}
      </section>
    </main>
  );
}
