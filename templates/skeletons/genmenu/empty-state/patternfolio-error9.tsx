import React, { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';

export function Error9() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter a valid email address for early access.');
      return;
    }
    setError(null);
    setJoined(true);
  };

  return (
    <main className="min-h-[680px] w-full bg-[#111315] text-stone-100 flex items-center justify-center px-6 py-16">
      <section aria-label="Coming soon preview" className="w-full max-w-3xl">
        <div className="flex items-center justify-between border-b border-stone-800 pb-5 text-xs text-stone-400">
          <span className="font-medium tracking-wider uppercase text-stone-200">Atelier Archive</span>
          <span className="font-mono tabular-nums">Releasing Autumn 2026</span>
        </div>

        <div className="py-12">
          <h1 className="font-serif text-4xl sm:text-6xl font-normal tracking-tight text-white leading-[1.08]">
            Something deliberate is taking shape.
          </h1>
          <p className="mt-6 text-base sm:text-lg text-stone-300 leading-relaxed max-w-xl">
            We are crafting an offline-first archival catalog for independent type foundries, printmakers, and design libraries.
          </p>

          {joined ? (
            <div className="mt-9 inline-flex items-center gap-2.5 rounded-lg bg-stone-800/80 border border-stone-700 px-4 py-3 text-sm text-stone-100" role="status">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
              <span>Added {email.trim()} to the Autumn preview list.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="mt-9 max-w-md">
              <label htmlFor="error9-waitlist" className="block text-xs font-medium text-stone-300">
                Request an early invitation
              </label>
              <div className="mt-2 flex flex-col sm:flex-row gap-2.5">
                <input
                  id="error9-waitlist"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="curator@studio.org"
                  className="flex-1 rounded-lg border border-stone-700 bg-stone-900/90 px-4 py-2.5 text-sm text-white placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-300/30 focus:border-stone-300"
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-stone-100 px-5 py-2.5 text-sm font-semibold text-stone-950 hover:bg-white transition-colors whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#111315]"
                >
                  <span>Join waitlist</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
              {error && (
                <p role="alert" className="mt-2 text-xs font-medium text-rose-400">
                  {error}
                </p>
              )}
            </form>
          )}
        </div>

        <div className="border-t border-stone-800 pt-7 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
          <div>
            <div className="font-semibold text-stone-100">01. Local-first indexing</div>
            <p className="mt-1 text-stone-400 leading-relaxed">Browse full specimen sheets with zero network latency.</p>
          </div>
          <div>
            <div className="font-semibold text-stone-100">02. Open metadata</div>
            <p className="mt-1 text-stone-400 leading-relaxed">Export structured bibliographies in JSON and BibTeX.</p>
          </div>
          <div>
            <div className="font-semibold text-stone-100">03. Curated editions</div>
            <p className="mt-1 text-stone-400 leading-relaxed">Direct foundry licensing without intermediary fees.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
