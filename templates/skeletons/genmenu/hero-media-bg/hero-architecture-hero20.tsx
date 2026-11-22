import { type FormEvent, useState } from 'react';
import { ArrowRight, Check, Menu, X } from 'lucide-react';

/**
 * Hero20 — Editorial Broadsheet Front-Page + Email Dispatch (Style: Warm Editorial)
 * Brand: Halcyon Almanac (Quarterly Journal of Foodways, Craft & Seasonality)
 */
export function Hero20() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [joined, setJoined] = useState<string | null>(null);

  const handleDispatch = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      setError('Enter an email address to receive the almanac.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError(null);
    setJoined(trimmed);
  };

  return (
    <div className="bg-[#FAF8F4] text-stone-900 font-sans border-b border-stone-300">
      <header className="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between gap-8 border-b border-stone-900">
        <a
          href="#halcyon-top"
          className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-stone-950 whitespace-nowrap shrink-0"
        >
          Halcyon Almanac
        </a>

        <nav aria-label="Halcyon primary" className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-700">
          <a href="#table" className="hover:text-stone-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            At Table
          </a>
          <a href="#grain" className="hover:text-stone-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            Field &amp; Grain
          </a>
          <a href="#cellar" className="hover:text-stone-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            Cellar Notes
          </a>
          <a href="#index" className="hover:text-stone-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            Back Issues
          </a>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <a
            href="#almanac-signup"
            className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-medium text-stone-50 bg-stone-950 hover:bg-stone-800 transition-colors whitespace-nowrap shrink-0"
          >
            Subscribe
          </a>
          <button
            type="button"
            aria-expanded={mobileOpen}
            aria-label="Toggle Halcyon navigation"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 border border-stone-400 text-stone-900"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {mobileOpen && (
        <nav aria-label="Halcyon mobile" className="md:hidden px-6 py-4 bg-[#F1ECE2] border-b border-stone-300 flex flex-col gap-3 text-sm font-medium text-stone-800">
          <a href="#table" onClick={() => setMobileOpen(false)} className="py-1.5">At Table</a>
          <a href="#grain" onClick={() => setMobileOpen(false)} className="py-1.5">Field &amp; Grain</a>
          <a href="#cellar" onClick={() => setMobileOpen(false)} className="py-1.5">Cellar Notes</a>
          <a href="#index" onClick={() => setMobileOpen(false)} className="py-1.5">Back Issues</a>
        </nav>
      )}

      <section className="mx-auto max-w-6xl px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Primary Broadsheet Feature */}
          <div className="lg:col-span-8 lg:pr-8 lg:border-r lg:border-stone-300">
            <div className="flex items-center gap-3 text-xs tracking-widest uppercase text-stone-500 mb-4">
              <span>Autumn Folio</span>
              <span aria-hidden="true">·</span>
              <span>Issue 28</span>
              <span aria-hidden="true">·</span>
              <span>November 2026</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl font-semibold tracking-tight text-stone-950 leading-[1.08] [text-wrap:balance]">
              Stone-milled heritage wheats and the bakeries keeping regional ovens warm
            </h1>

            <p className="mt-5 font-serif text-lg text-stone-700 leading-relaxed max-w-2xl">
              Across small valleys in Vermont and Galicia, millers and wood-fired bakers are rebuilding local grain economies one harvest at a time.
            </p>

            <div className="mt-7 grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
              <div className="sm:col-span-7 aspect-[4/3] bg-stone-200 border border-stone-300 overflow-hidden">
                <img
                  src="/src/assets/images/hero_botanical_atelier_1795319285489.jpg"
                  alt="Stoneware vessels, botanical stems, and amber apothecary bottles arranged on travertine stone"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="sm:col-span-5 flex flex-col justify-between h-full">
                <p className="text-sm text-stone-600 leading-relaxed">
                  Also inside this folio: an illustrated guide to wild-fermented vinegars, winter storage cellars, and ceramicist studios along the coast.
                </p>
                <a
                  href="#read-folio"
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-stone-950 underline underline-offset-4 hover:text-amber-900 transition-colors"
                >
                  <span>Read Cover Essay</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Secondary Dispatch Column + Email Form */}
          <aside className="lg:col-span-4 flex flex-col justify-between gap-8">
            <div className="space-y-6">
              <p className="text-xs font-semibold tracking-widest uppercase text-stone-500 pb-3 border-b border-stone-300">
                In This Dispatch
              </p>

              <article className="pb-5 border-b border-stone-200">
                <p className="text-xs text-stone-500 mb-1">Field Notes · 7 min read</p>
                <h2 className="font-serif text-lg font-medium text-stone-950 leading-snug">
                  Notes from a limestone cider press in Normandy
                </h2>
              </article>

              <article className="pb-5 border-b border-stone-200">
                <p className="text-xs text-stone-500 mb-1">Material Study · 5 min read</p>
                <h2 className="font-serif text-lg font-medium text-stone-950 leading-snug">
                  Why unglazed stoneware seasons like cast iron
                </h2>
              </article>
            </div>

            <form
              id="almanac-signup"
              onSubmit={handleDispatch}
              noValidate
              className="p-5 bg-[#F2EDE4] border border-stone-300"
            >
              <p className="font-serif text-base font-semibold text-stone-950">
                Receive the Friday Almanac
              </p>
              <p className="mt-1 text-xs text-stone-600 leading-relaxed">
                Seasonal essays, cellar notes, and print pre-orders delivered weekly.
              </p>

              <label htmlFor="halcyon-email" className="sr-only">
                Email address for Halcyon Almanac
              </label>
              <input
                id="halcyon-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="you@domain.com"
                className="mt-4 w-full px-3.5 py-2.5 text-sm text-stone-900 bg-white border border-stone-300 placeholder:text-stone-400 focus:outline-none focus:border-stone-900"
              />

              <button
                type="submit"
                className="mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-stone-50 bg-stone-950 hover:bg-stone-800 transition-colors"
              >
                <span>Subscribe to Almanac</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {error && (
                <p role="alert" className="mt-2.5 text-xs font-medium text-red-700">
                  {error}
                </p>
              )}

              {joined && !error && (
                <p role="status" className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-900">
                  <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>Confirmed for {joined}.</span>
                </p>
              )}
            </form>
          </aside>
        </div>
      </section>
    </div>
  );
}
