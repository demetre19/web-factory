import { type FormEvent, useState } from 'react';
import { ArrowRight, Check, Menu, X } from 'lucide-react';

/**
 * Hero9 — Hero with Email Capture Form (Style: Warm Editorial)
 * Brand: Fieldwork Dispatch (Weekly Essays on Cities, Craft & Material Culture)
 */
export function Hero9() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [subscribedEmail, setSubscribedEmail] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      setError('Please enter your email address to subscribe.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError(null);
    setSubscribedEmail(trimmed);
  };

  return (
    <div className="bg-[#FBF9F5] text-stone-900 font-sans border-b border-stone-200">
      <header className="mx-auto max-w-5xl px-6 py-5 flex items-center justify-between gap-8 border-b border-stone-200">
        <a
          href="#fieldwork-top"
          className="font-serif text-xl font-semibold tracking-tight text-stone-950 whitespace-nowrap shrink-0"
        >
          Fieldwork Dispatch
        </a>

        <nav aria-label="Fieldwork primary" className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600">
          <a href="#essays" className="hover:text-stone-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            Essays
          </a>
          <a href="#archive" className="hover:text-stone-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            Print Archive
          </a>
          <a href="#contributors" className="hover:text-stone-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            Contributors
          </a>
          <a href="#about" className="hover:text-stone-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            Colophon
          </a>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <a
            href="#fieldwork-form"
            className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-medium text-stone-50 bg-stone-900 rounded-md hover:bg-stone-800 transition-colors whitespace-nowrap shrink-0"
          >
            Subscribe
          </a>
          <button
            type="button"
            aria-expanded={mobileOpen}
            aria-label="Toggle Fieldwork navigation"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-md border border-stone-300 text-stone-800"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {mobileOpen && (
        <nav aria-label="Fieldwork mobile" className="md:hidden px-6 py-4 bg-stone-100 border-b border-stone-200 flex flex-col gap-3 text-sm font-medium text-stone-700">
          <a href="#essays" onClick={() => setMobileOpen(false)} className="py-1.5">Essays</a>
          <a href="#archive" onClick={() => setMobileOpen(false)} className="py-1.5">Print Archive</a>
          <a href="#contributors" onClick={() => setMobileOpen(false)} className="py-1.5">Contributors</a>
          <a href="#about" onClick={() => setMobileOpen(false)} className="py-1.5">Colophon</a>
        </nav>
      )}

      <section className="mx-auto max-w-3xl px-6 py-24 md:py-28 text-center">
        <p className="text-xs font-medium tracking-widest uppercase text-amber-900/80 mb-5">
          Sunday Mornings · 44,000 Architects, Editors &amp; Makers
        </p>

        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight text-stone-950 leading-[1.1] [text-wrap:balance]">
          Long-form notes on quiet cities, workshops, and durable craft
        </h1>

        <p className="mt-6 mx-auto max-w-xl text-base sm:text-lg text-stone-600 leading-relaxed">
          One reported essay every Sunday morning—visiting timber joiners, civic libraries, and independent type foundries without sponsored noise.
        </p>

        <form id="fieldwork-form" onSubmit={handleSubmit} noValidate className="mt-10 mx-auto max-w-lg">
          <div className="flex flex-col sm:flex-row gap-3">
            <label htmlFor="fieldwork-email" className="sr-only">
              Email address
            </label>
            <input
              id="fieldwork-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              placeholder="reader@domain.com"
              className="flex-1 min-w-0 px-4 py-3 text-sm text-stone-900 bg-white border border-stone-300 rounded-md placeholder:text-stone-400 focus:outline-none focus:border-stone-900"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-stone-50 bg-stone-900 rounded-md hover:bg-stone-800 transition-colors whitespace-nowrap shrink-0"
            >
              <span>Join Dispatch</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {error && (
            <p role="alert" className="mt-3 text-xs font-medium text-red-700 text-left">
              {error}
            </p>
          )}

          {subscribedEmail && !error && (
            <p role="status" className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-emerald-900">
              <Check className="w-4 h-4 text-emerald-700" />
              <span>Subscribed {subscribedEmail} — Issue No. 142 arrives Sunday at 07:00.</span>
            </p>
          )}
        </form>

        <p className="mt-6 text-xs text-stone-500">
          Read Issue 141: Timber Bridges of Vorarlberg · 11 min read · Free forever
        </p>
      </section>
    </div>
  );
}
