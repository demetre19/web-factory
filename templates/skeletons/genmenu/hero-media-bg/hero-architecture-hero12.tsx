import { type FormEvent, useState } from 'react';
import { ArrowRight, Check, Menu, X } from 'lucide-react';

/**
 * Hero12 — Split Hero with Waitlist Email Form (Style: Bold)
 * Brand: Voltline Mobility (Urban Electric Grand Tourers & Fleet Charging)
 */
export function Hero12() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [reservedEmail, setReservedEmail] = useState<string | null>(null);

  const handleReserve = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      setError('Enter an email address to join the priority allocation list.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed)) {
      setError('Enter a valid email address.');
      return;
    }
    setError(null);
    setReservedEmail(trimmed);
  };

  return (
    <div className="bg-stone-100 text-stone-950 font-sans border-b border-stone-300">
      <header className="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between gap-8 border-b border-stone-300">
        <a
          href="#voltline-top"
          className="font-display text-2xl font-bold uppercase tracking-tight text-stone-950 whitespace-nowrap shrink-0"
        >
          Voltline
        </a>

        <nav aria-label="Voltline primary" className="hidden md:flex items-center gap-7 text-sm font-semibold text-stone-700">
          <a href="#gt-one" className="hover:text-stone-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            Model GT-1
          </a>
          <a href="#powertrain" className="hover:text-stone-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            Powertrain
          </a>
          <a href="#charging" className="hover:text-stone-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            Grid Network
          </a>
          <a href="#showrooms" className="hover:text-stone-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            Showrooms
          </a>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <a
            href="#voltline-waitlist"
            className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-stone-950 rounded hover:bg-stone-800 transition-colors whitespace-nowrap shrink-0"
          >
            Reserve Build
          </a>
          <button
            type="button"
            aria-expanded={mobileOpen}
            aria-label="Toggle Voltline navigation"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded border border-stone-400 text-stone-900"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {mobileOpen && (
        <nav aria-label="Voltline mobile" className="md:hidden px-6 py-4 bg-white border-b border-stone-300 flex flex-col gap-3 text-sm font-semibold text-stone-800">
          <a href="#gt-one" onClick={() => setMobileOpen(false)} className="py-1.5">Model GT-1</a>
          <a href="#powertrain" onClick={() => setMobileOpen(false)} className="py-1.5">Powertrain</a>
          <a href="#charging" onClick={() => setMobileOpen(false)} className="py-1.5">Grid Network</a>
          <a href="#showrooms" onClick={() => setMobileOpen(false)} className="py-1.5">Showrooms</a>
        </nav>
      )}

      <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div>
              <p className="text-xs font-bold tracking-widest uppercase text-amber-800 mb-4">
                2027 Production Series · 640 km WLTP Range
              </p>

              <h1 className="font-display text-5xl sm:text-6xl font-bold uppercase tracking-tight text-stone-950 leading-[0.98] [text-wrap:balance]">
                Silence at speed. Built on solid-state architecture.
              </h1>

              <p className="mt-6 text-base sm:text-lg text-stone-700 leading-relaxed max-w-xl">
                Dual-motor torque vectoring, 900V fast-charge recovery from 10% to 80% in eleven minutes, and a sculpted aluminum monocoque engineered for continental travel.
              </p>

              <form id="voltline-waitlist" onSubmit={handleReserve} noValidate className="mt-9 max-w-md">
                <div className="flex flex-col sm:flex-row gap-3">
                  <label htmlFor="voltline-email" className="sr-only">
                    Email address for allocation updates
                  </label>
                  <input
                    id="voltline-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="driver@domain.com"
                    className="flex-1 min-w-0 px-4 py-3 text-sm text-stone-950 bg-white border border-stone-400 rounded placeholder:text-stone-400 focus:outline-none focus:border-stone-950"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-stone-950 rounded hover:bg-stone-800 transition-colors whitespace-nowrap shrink-0"
                  >
                    <span>Join Waitlist</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {error && (
                  <p role="alert" className="mt-2.5 text-xs font-semibold text-red-700">
                    {error}
                  </p>
                )}

                {reservedEmail && !error && (
                  <p role="status" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-emerald-900">
                    <Check className="w-4 h-4 text-emerald-700" />
                    <span>Priority dossier queued for {reservedEmail}.</span>
                  </p>
                )}
              </form>
            </div>

            <div className="mt-12 pt-6 border-t border-stone-300 grid grid-cols-3 gap-6">
              <div>
                <p className="font-display text-2xl font-bold text-stone-950 tabular-nums">2.6s</p>
                <p className="text-xs text-stone-600">0–100 km/h</p>
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-stone-950 tabular-nums">900V</p>
                <p className="text-xs text-stone-600">Peak Architecture</p>
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-stone-950 tabular-nums">0.19 Cd</p>
                <p className="text-xs text-stone-600">Drag Coefficient</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 flex flex-col">
            <div className="flex-1 min-h-[340px] lg:min-h-[460px] rounded-lg overflow-hidden bg-stone-900 border border-stone-300">
              <img
                src="/src/assets/images/hero_electric_mobility_1795319285456.jpg"
                alt="Dark graphite electric grand tourer parked in a raw concrete pavilion at twilight"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
