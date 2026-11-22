import React, { useState } from 'react';

export function Footer31() {
  const [email, setEmail] = useState('');
  const [saved, setSaved] = useState(false);

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim().includes('@')) return;
    setSaved(true);
    setEmail('');
  };

  return (
    <footer className="border-t border-zinc-200">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="bg-[#FAF8F5] text-zinc-800 px-6 py-14 lg:px-14">
          <div className="max-w-md space-y-5">
            <div className="flex items-center gap-3 text-zinc-950">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-900 font-serif font-bold text-base">
                P
              </span>
              <span className="font-serif text-xl font-semibold">Polaris Travel</span>
            </div>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Rail-first itineraries, alpine refuges, and small-ship coastal journeys planned by regional specialists.
            </p>
            <div className="text-xs text-zinc-600 space-y-1">
              <p className="font-semibold text-zinc-900">Concierge Desk (Zurich &amp; Kyoto)</p>
              <p>+41 44 555 0139 · journeys@polaristravel.example</p>
            </div>
            <form onSubmit={handleDispatch} className="pt-1 flex gap-2">
              <label htmlFor="polaris-email" className="sr-only">Travel letter email</label>
              <input
                id="polaris-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setSaved(false);
                }}
                placeholder="Receive seasonal route notes"
                className="flex-1 rounded border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none"
              />
              <button
                type="submit"
                className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 transition-colors cursor-pointer whitespace-nowrap"
              >
                {saved ? 'Saved' : 'Sign Up'}
              </button>
            </form>
          </div>
        </div>

        <div className="bg-slate-900 text-slate-300 px-6 py-14 lg:px-14 flex flex-col justify-between gap-10">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-white">Regions</h2>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li><a href="#alps" className="hover:text-white">Swiss &amp; Italian Alps</a></li>
                <li><a href="#kyushu" className="hover:text-white">Kyushu &amp; Hokkaido</a></li>
                <li><a href="#lofoten" className="hover:text-white">Norwegian Fjords</a></li>
                <li><a href="#patagonia" className="hover:text-white">Southern Andes</a></li>
              </ul>
            </div>
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-white">Journeys</h2>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li><a href="#rail" className="hover:text-white">Sleeper Trains</a></li>
                <li><a href="#hiking" className="hover:text-white">Hut-to-Hut Treks</a></li>
                <li><a href="#custom" className="hover:text-white">Private Commissions</a></li>
                <li><a href="#dates" className="hover:text-white">2027 Departures</a></li>
              </ul>
            </div>
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-white">Traveler Info</h2>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li><a href="#insurance" className="hover:text-white">ATOL &amp; Bonding</a></li>
                <li><a href="#packing" className="hover:text-white">Gear Lists</a></li>
                <li><a href="#carbon" className="hover:text-white">Low-Carbon Pledge</a></li>
                <li><a href="#faq" className="hover:text-white">Booking Terms</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-slate-400">
            <p>© 2026 Polaris Expeditions AG.</p>
            <ul className="flex gap-5">
              <li><a href="#privacy" className="hover:text-white">Privacy</a></li>
              <li><a href="#terms" className="hover:text-white">Terms</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function Footer32() {
  const [consultRequested, setConsultRequested] = useState(false);

  return (
    <footer className="bg-[#F5F2EB] text-stone-800 border-t border-stone-300">
      <div className="max-w-7xl mx-auto px-6 py-16 lg:px-8">
        <div className="pb-12 border-b border-stone-300 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-stone-950">
              Commission a bespoke dining table or architectural millwork.
            </h2>
            <p className="mt-1.5 text-sm text-stone-600">
              Kiln-dried European oak and American black walnut crafted to order.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setConsultRequested(!consultRequested)}
            className="rounded-md bg-stone-900 px-5 py-3 text-sm font-medium text-[#F5F2EB] hover:bg-stone-800 transition-colors cursor-pointer whitespace-nowrap self-start md:self-auto"
          >
            {consultRequested ? 'Consultation Scheduled' : 'Book Workshop Consultation'}
          </button>
        </div>

        <div className="mt-12 flex flex-col lg:flex-row lg:justify-between gap-12">
          <div className="max-w-xs space-y-3">
            <div className="flex items-center gap-3 text-stone-950">
              <span className="inline-flex h-9 w-9 items-center justify-center border border-stone-900 font-serif font-bold text-base">
                AT
              </span>
              <span className="font-serif text-lg font-semibold">Atelier Timber</span>
            </div>
            <p className="text-xs leading-relaxed text-stone-600">
              740 Riverfront Mill, Portland, Oregon. FSC-certified hardwoods only.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-10 lg:gap-16">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-950">Furniture</h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li><a href="#tables" className="hover:text-stone-950">Dining Tables</a></li>
                <li><a href="#credenzas" className="hover:text-stone-950">Credenzas</a></li>
                <li><a href="#desks" className="hover:text-stone-950">Studio Desks</a></li>
                <li><a href="#benches" className="hover:text-stone-950">Joinery Benches</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-950">Materials</h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li><a href="#samples" className="hover:text-stone-950">Timber Sample Box</a></li>
                <li><a href="#finishes" className="hover:text-stone-950">Hardwax Oil Care</a></li>
                <li><a href="#forestry" className="hover:text-stone-950">Timber Provenance</a></li>
                <li><a href="#cad" className="hover:text-stone-950">3D CAD Files</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-950">Studio</h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li><a href="#visit" className="hover:text-stone-950">Showroom Hours</a></li>
                <li><a href="#delivery" className="hover:text-stone-950">Blanket-Wrap Freight</a></li>
                <li><a href="#trade" className="hover:text-stone-950">Architects &amp; Trade</a></li>
                <li><a href="#warranty" className="hover:text-stone-950">Lifetime Joinery</a></li>
              </ul>
            </div>
          </div>
        </div>

        <p className="mt-12 pt-6 border-t border-stone-300 text-xs text-stone-500">
          © 2026 Atelier Timber Woodworks LLC.
        </p>
      </div>
    </footer>
  );
}

export function Footer33() {
  const [scrolledTop, setScrolledTop] = useState(false);

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setScrolledTop(true);
    setTimeout(() => setScrolledTop(false), 1500);
  };

  return (
    <footer className="bg-white text-zinc-700 border-t border-zinc-200">
      <div className="max-w-7xl mx-auto px-6 py-14 lg:px-8">
        <div className="flex items-center justify-between pb-10 border-b border-zinc-200">
          <div className="flex items-center gap-3 text-zinc-950">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded border border-zinc-900 font-serif font-bold text-sm">
              CA
            </span>
            <span className="font-semibold tracking-tight">Chronicle Archive</span>
          </div>

          <button
            type="button"
            onClick={handleBackToTop}
            className="inline-flex items-center gap-2 rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <span>{scrolledTop ? 'At Top' : 'Back to top'}</span>
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </button>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-950">Collections</h2>
            <ul className="mt-4 border-l border-zinc-200 pl-3.5 space-y-2 text-sm">
              <li><a href="#periodicals" className="hover:text-zinc-950">Historic Periodicals</a></li>
              <li><a href="#maps" className="hover:text-zinc-950">Cartography Plates</a></li>
              <li><a href="#manuscripts" className="hover:text-zinc-950">Scanned Manuscripts</a></li>
              <li><a href="#oral-history" className="hover:text-zinc-950">Oral History Tapes</a></li>
            </ul>
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-950">Preservation</h2>
            <ul className="mt-4 border-l border-zinc-200 pl-3.5 space-y-2 text-sm">
              <li><a href="#checksums" className="hover:text-zinc-950">Checksum Auditing</a></li>
              <li><a href="#iiif" className="hover:text-zinc-950">IIIF Image API</a></li>
              <li><a href="#ocr" className="hover:text-zinc-950">OCR Transcription</a></li>
              <li><a href="#mirrors" className="hover:text-zinc-950">University Mirrors</a></li>
            </ul>
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-950">Researchers</h2>
            <ul className="mt-4 border-l border-zinc-200 pl-3.5 space-y-2 text-sm">
              <li><a href="#reading-room" className="hover:text-zinc-950">Reading Room Pass</a></li>
              <li><a href="#citations" className="hover:text-zinc-950">BibTeX Citations</a></li>
              <li><a href="#bulk-data" className="hover:text-zinc-950">Public Domain Dumps</a></li>
              <li><a href="#grants" className="hover:text-zinc-950">Digitization Grants</a></li>
            </ul>
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-950">Trust</h2>
            <ul className="mt-4 border-l border-zinc-200 pl-3.5 space-y-2 text-sm">
              <li><a href="#endowment" className="hover:text-zinc-950">Endowment Report</a></li>
              <li><a href="#rights" className="hover:text-zinc-950">Rights Statements</a></li>
              <li><a href="#takedown" className="hover:text-zinc-950">Takedown Policy</a></li>
              <li><a href="#privacy" className="hover:text-zinc-950">Reader Privacy</a></li>
            </ul>
          </div>
        </div>

        <p className="mt-12 text-xs text-zinc-500">
          © 2026 Chronicle Preservation Foundation · Registered 501(c)(3) Nonprofit
        </p>
      </div>
    </footer>
  );
}

export function Footer34() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim().includes('@')) {
      setStatus('Valid email required.');
      return;
    }
    setStatus('Added to research dispatches.');
    setEmail('');
  };

  return (
    <footer className="bg-[#0A0A0B] text-zinc-400 border-t border-zinc-800">
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-zinc-700 text-white font-semibold text-base">
          O
        </div>
        <h2 className="mt-4 text-lg font-medium tracking-tight text-white">
          Obsidian Labs
        </h2>
        <p className="mt-1 text-xs text-zinc-500">
          Formal verification &amp; compiler research
        </p>

        <form onSubmit={handleSubmit} className="mt-8 mx-auto max-w-sm">
          <label htmlFor="obsidian-email" className="sr-only">Research dispatch email</label>
          <div className="flex items-center border-b border-zinc-700 focus-within:border-white transition-colors pb-1">
            <input
              id="obsidian-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="researcher@university.edu"
              className="flex-1 bg-transparent py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none"
            />
            <button
              type="submit"
              className="text-xs font-medium text-white hover:text-zinc-300 px-2 py-1.5 cursor-pointer whitespace-nowrap"
            >
              Subscribe →
            </button>
          </div>
          {status && <p className="mt-2 text-xs text-zinc-300" role="status">{status}</p>}
        </form>

        <nav aria-label="Obsidian Labs links" className="mt-10">
          <h3 className="sr-only">Research links</h3>
          <ul className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-xs text-zinc-400">
            <li><a href="#papers" className="hover:text-white transition-colors">Papers</a></li>
            <li><a href="#prover" className="hover:text-white transition-colors">Theorem Prover</a></li>
            <li><a href="#benchmarks" className="hover:text-white transition-colors">Benchmarks</a></li>
            <li><a href="#fellows" className="hover:text-white transition-colors">Fellowships</a></li>
            <li><a href="#imprint" className="hover:text-white transition-colors">Imprint</a></li>
          </ul>
        </nav>

        <p className="mt-10 text-[11px] text-zinc-600">
          © 2026 Obsidian Research Labs Ltd.
        </p>
      </div>
    </footer>
  );
}

export function Footer35() {
  return (
    <footer className="bg-[#FEF3C7] text-[#451A03] border-t border-[#FDE68A]">
      <div className="max-w-7xl mx-auto px-6 py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#92400E] text-white font-bold text-sm">
                BG
              </span>
              <span className="text-lg font-bold tracking-tight">BistroGo Delivery</span>
            </div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#92400E] pt-1">Courier &amp; Order Desk</h2>
            <ul className="space-y-1.5 text-sm text-[#78350F]">
              <li>Live Order Hotline: +1 (503) 555-0177</li>
              <li>Partner Kitchens: kitchens@bistrogo.example</li>
              <li>Open daily 07:00 – 23:30 local time</li>
            </ul>
          </div>

          <div className="lg:col-span-4 grid grid-cols-2 gap-8">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#92400E]">Order</h2>
              <ul className="mt-4 space-y-2.5 text-sm font-medium">
                <li><a href="#neighborhoods" className="hover:underline">Neighborhoods</a></li>
                <li><a href="#group-orders" className="hover:underline">Office Lunches</a></li>
                <li><a href="#gift-cards" className="hover:underline">Gift Credit</a></li>
                <li><a href="#zero-plastic" className="hover:underline">Reusable Tiffins</a></li>
              </ul>
            </div>
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#92400E]">Partners</h2>
              <ul className="mt-4 space-y-2.5 text-sm font-medium">
                <li><a href="#restaurants" className="hover:underline">Local Restaurants</a></li>
                <li><a href="#riders" className="hover:underline">E-Bike Couriers</a></li>
                <li><a href="#fair-fees" className="hover:underline">Flat-Fee Pledge</a></li>
                <li><a href="#support" className="hover:underline">Help Center</a></li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#92400E]">Download BistroGo</h2>
            <p className="text-sm text-[#78350F]">
              Track e-bike arrivals in real time with zero surge markups.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="#ios" className="inline-flex items-center gap-2 rounded-lg bg-[#451A03] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#78350F] transition-colors">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.33c.64-.78 1.08-1.86.96-2.94-.93.04-2.06.62-2.72 1.4-.58.68-1.1 1.78-.96 2.84 1.04.08 2.08-.52 2.72-1.3" />
                </svg>
                <span>App Store</span>
              </a>
              <a href="#android" className="inline-flex items-center gap-2 rounded-lg border border-[#92400E] bg-white/70 px-4 py-2.5 text-xs font-semibold text-[#451A03] hover:bg-white transition-colors">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M3.61 1.814L13.793 12 3.61 22.186a1.47 1.47 0 01-.36-.98V2.794c0-.373.133-.72.36-.98zm11.24 11.242l2.634 2.634-9.847 5.603 7.213-8.237zm3.671-2.09l2.464 1.402c.68.387.68 1.277 0 1.664l-2.464 1.402-2.834-2.234 2.834-2.234zM7.637 2.707l9.847 5.603-2.634 2.634-7.213-8.237z" />
                </svg>
                <span>Google Play</span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[#F59E0B]/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs text-[#78350F]">
          <p>© 2026 BistroGo Cooperative Inc.</p>
          <ul className="flex gap-6">
            <li><a href="#privacy" className="hover:underline">Privacy</a></li>
            <li><a href="#terms" className="hover:underline">Terms</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

export function Footer36() {
  return (
    <footer className="bg-white text-zinc-700 border-t border-zinc-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-zinc-200">
          <div className="py-12 md:pr-8 flex flex-col justify-between gap-6">
            <div className="space-y-3">
              <span className="inline-flex h-9 w-9 items-center justify-center border border-zinc-950 text-zinc-950 font-semibold text-sm">
                L
              </span>
              <p className="text-base font-semibold text-zinc-950">Linearis Architecture</p>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Civic libraries, passive-house schools, and adaptive reuse studios.
              </p>
            </div>
            <p className="font-mono text-[11px] text-zinc-500">47.3769° N, 8.5417° E</p>
          </div>

          <div className="py-12 md:px-8">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-950">Practice</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><a href="#civic" className="hover:text-zinc-950">Civic &amp; Cultural</a></li>
              <li><a href="#housing" className="hover:text-zinc-950">Timber Housing</a></li>
              <li><a href="#adaptive" className="hover:text-zinc-950">Adaptive Reuse</a></li>
              <li><a href="#masterplans" className="hover:text-zinc-950">Urban Masterplans</a></li>
            </ul>
          </div>

          <div className="py-12 md:px-8">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-950">Studio</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><a href="#partners" className="hover:text-zinc-950">Principals</a></li>
              <li><a href="#competitions" className="hover:text-zinc-950">Competitions</a></li>
              <li><a href="#monographs" className="hover:text-zinc-950">Monographs</a></li>
              <li><a href="#careers" className="hover:text-zinc-950">Open Positions</a></li>
            </ul>
          </div>

          <div className="py-12 md:pl-8">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-950">Connect</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><a href="#zurich" className="hover:text-zinc-950">Zurich Atelier</a></li>
              <li><a href="#basel" className="hover:text-zinc-950">Basel Annex</a></li>
              <li><a href="#press" className="hover:text-zinc-950">Press Archive</a></li>
              <li><a href="#instagram" className="hover:text-zinc-950">Instagram</a></li>
            </ul>
          </div>
        </div>

        <div className="py-6 border-t border-zinc-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs text-zinc-500">
          <p>© 2026 Linearis SIA / BSA.</p>
          <ul className="flex gap-6">
            <li><a href="#imprint" className="hover:text-zinc-900">Imprint</a></li>
            <li><a href="#privacy" className="hover:text-zinc-900">Privacy</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

export function Footer37() {
  const [email, setEmail] = useState('');
  const [joined, setJoined] = useState(false);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim().includes('@')) return;
    setJoined(true);
    setEmail('');
  };

  return (
    <footer className="bg-[#ECFCCB] text-zinc-950 border-t-2 border-zinc-950">
      <div className="max-w-7xl mx-auto px-6 py-14 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5 space-y-5">
            <div className="inline-flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center border-2 border-zinc-950 bg-[#BEF264] font-bold text-lg shadow-[3px_3px_0px_#09090b]">
                BS
              </span>
              <span className="text-2xl font-bold tracking-tight">Bounce Studio</span>
            </div>
            <p className="text-sm font-medium text-zinc-800 max-w-sm">
              Kinetic identities, playful product launches, and tactile web motion for ambitious teams.
            </p>
            <form onSubmit={handleJoin} className="max-w-sm">
              <label htmlFor="bounce-email" className="block text-xs font-bold uppercase tracking-wider mb-2">
                Monthly Reel &amp; Type Drops
              </label>
              <div className="flex gap-2">
                <input
                  id="bounce-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setJoined(false);
                  }}
                  placeholder="hello@brand.co"
                  className="flex-1 border-2 border-zinc-950 bg-white px-3 py-2 text-sm text-zinc-950 placeholder:text-zinc-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="border-2 border-zinc-950 bg-zinc-950 px-4 py-2 text-sm font-bold text-[#ECFCCB] hover:bg-zinc-800 transition-colors cursor-pointer whitespace-nowrap"
                >
                  {joined ? 'In!' : 'Sign Up'}
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider border-b-2 border-zinc-950 pb-2">Services</h2>
              <ul className="mt-4 space-y-2.5 text-sm font-medium">
                <li><a href="#branding" className="hover:underline">Brand Systems</a></li>
                <li><a href="#motion" className="hover:underline">3D &amp; Kinetic Type</a></li>
                <li><a href="#web" className="hover:underline">Interactive Sites</a></li>
                <li><a href="#packaging" className="hover:underline">Packaging</a></li>
              </ul>
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider border-b-2 border-zinc-950 pb-2">Archive</h2>
              <ul className="mt-4 space-y-2.5 text-sm font-medium">
                <li><a href="#case-studies" className="hover:underline">Case Studies</a></li>
                <li><a href="#experiments" className="hover:underline">Playgrounds</a></li>
                <li><a href="#typefaces" className="hover:underline">Custom Fonts</a></li>
                <li><a href="#merch" className="hover:underline">Studio Prints</a></li>
              </ul>
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider border-b-2 border-zinc-950 pb-2">Say Hi</h2>
              <ul className="mt-4 space-y-2.5 text-sm font-medium">
                <li><a href="#new-biz" className="hover:underline">New Projects</a></li>
                <li><a href="#internships" className="hover:underline">Internships</a></li>
                <li><a href="#instagram" className="hover:underline">Instagram</a></li>
                <li><a href="#are-na" className="hover:underline">Are.na</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t-2 border-zinc-950 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs font-semibold">
          <p>© 2026 Bounce Studio LLC · Brooklyn &amp; Lisbon</p>
          <ul className="flex gap-6">
            <li><a href="#privacy" className="hover:underline">Privacy</a></li>
            <li><a href="#terms" className="hover:underline">Terms</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

export function Footer38() {
  const [lang, setLang] = useState('English');
  const [curr, setCurr] = useState('USD');

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6 py-16 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 pb-12 border-b border-slate-800">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-white">Asset Management</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><a href="#equities" className="hover:text-white">Global Equities</a></li>
              <li><a href="#fixed-income" className="hover:text-white">Fixed Income</a></li>
              <li><a href="#infrastructure" className="hover:text-white">Real Infrastructure</a></li>
              <li><a href="#alternatives" className="hover:text-white">Private Credit</a></li>
            </ul>
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-white">Advisory</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><a href="#institutional" className="hover:text-white">Endowments &amp; Pensions</a></li>
              <li><a href="#sovereign" className="hover:text-white">Sovereign Funds</a></li>
              <li><a href="#insurance" className="hover:text-white">Insurance Portfolios</a></li>
              <li><a href="#esg" className="hover:text-white">Stewardship Reports</a></li>
            </ul>
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-white">Research</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><a href="#macro" className="hover:text-white">Macro Quarterly</a></li>
              <li><a href="#rates" className="hover:text-white">Central Bank Notes</a></li>
              <li><a href="#quant" className="hover:text-white">Factor Papers</a></li>
              <li><a href="#briefings" className="hover:text-white">Investor Webcasts</a></li>
            </ul>
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-white">Shareholders</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><a href="#filings" className="hover:text-white">Regulatory Filings</a></li>
              <li><a href="#governance" className="hover:text-white">Board Charter</a></li>
              <li><a href="#annual" className="hover:text-white">Annual Report</a></li>
              <li><a href="#ir" className="hover:text-white">Investor Relations</a></li>
            </ul>
          </div>
        </div>

        <div className="py-6 border-b border-slate-900 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <span className="font-semibold text-white">Group Entities:</span>
            <ul className="flex flex-wrap gap-x-5 gap-y-1">
              <li><a href="#vanguard-am" className="hover:text-white">Vanguard Capital</a></li>
              <li><a href="#vanguard-re" className="hover:text-white">Vanguard Real Assets</a></li>
              <li><a href="#vanguard-uk" className="hover:text-white">Vanguard Europe Ltd</a></li>
            </ul>
          </div>

          <div className="flex items-center gap-3">
            <label htmlFor="vh-lang" className="sr-only">Language</label>
            <select
              id="vh-lang"
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="rounded border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white focus:border-sky-400 focus:outline-none"
            >
              <option value="English">English</option>
              <option value="Deutsch">Deutsch</option>
              <option value="中文">中文</option>
            </select>
            <label htmlFor="vh-curr" className="sr-only">Reporting Currency</label>
            <select
              id="vh-curr"
              value={curr}
              onChange={(e) => setCurr(e.target.value)}
              className="rounded border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white focus:border-sky-400 focus:outline-none"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="CHF">CHF</option>
            </select>
          </div>
        </div>

        <p className="pt-6 text-xs text-slate-500">
          © 2026 Vanguard Holdings Group. View in {lang} ({curr}). For institutional and qualified investors only.
        </p>
      </div>
    </footer>
  );
}

export function Footer39() {
  return (
    <footer className="bg-[#F8FAFC] text-slate-700 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-6 py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-950">Care Services</h2>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li><a href="#primary" className="hover:text-teal-800">Primary Care</a></li>
                <li><a href="#pediatrics" className="hover:text-teal-800">Pediatrics</a></li>
                <li><a href="#behavioral" className="hover:text-teal-800">Behavioral Health</a></li>
                <li><a href="#pharmacy" className="hover:text-teal-800">Mail Pharmacy</a></li>
              </ul>
            </div>
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-950">Patients</h2>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li><a href="#portal" className="hover:text-teal-800">Patient Portal</a></li>
                <li><a href="#insurance" className="hover:text-teal-800">Accepted Plans</a></li>
                <li><a href="#records" className="hover:text-teal-800">Medical Records</a></li>
                <li><a href="#billing" className="hover:text-teal-800">Billing Estimates</a></li>
              </ul>
            </div>
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-950">Clinicians</h2>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li><a href="#referrals" className="hover:text-teal-800">Physician Referrals</a></li>
                <li><a href="#protocols" className="hover:text-teal-800">Care Protocols</a></li>
                <li><a href="#residencies" className="hover:text-teal-800">Fellowships</a></li>
                <li><a href="#careers" className="hover:text-teal-800">Join Our Practice</a></li>
              </ul>
            </div>
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-950">Compliance</h2>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li><a href="#hipaa" className="hover:text-teal-800">HIPAA Notice</a></li>
                <li><a href="#nondiscrimination" className="hover:text-teal-800">Patient Rights</a></li>
                <li><a href="#languages" className="hover:text-teal-800">Language Access</a></li>
                <li><a href="#quality" className="hover:text-teal-800">Clinical Outcomes</a></li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-4 rounded-xl border border-teal-200 bg-teal-50/60 p-6">
            <div className="flex items-center gap-2.5 text-teal-950">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-teal-700 text-white font-bold text-sm">
                CP
              </span>
              <span className="font-semibold">Clearpath Care Support</span>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              <li>
                <span className="font-medium text-slate-950">24/7 Nurse Triage: </span>
                <a href="#nurse" className="text-teal-800 hover:underline font-medium">1-800-555-0199</a>
              </li>
              <li>
                <span className="font-medium text-slate-950">Accessibility Desk: </span>
                <a href="#access" className="text-teal-800 hover:underline">access@clearpathcare.example</a>
              </li>
              <li className="text-xs text-slate-600 pt-1">
                TTY / Relay 711 supported · Interpreting available in 40+ languages
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 Clearpath Care Medical Group.</p>
          <p>For medical emergencies, dial 911 immediately.</p>
        </div>
      </div>
    </footer>
  );
}

export function Footer40() {
  const [expanded, setExpanded] = useState(false);

  return (
    <footer className="bg-zinc-950 text-zinc-300 border-t border-zinc-800">
      {expanded && (
        <div className="border-b border-zinc-800 bg-zinc-900/50">
          <div className="max-w-7xl mx-auto px-6 py-10 lg:px-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-white">Foundations</h2>
              <ul className="mt-3 space-y-2 text-sm text-zinc-400">
                <li><a href="#tokens" className="hover:text-white">Design Tokens</a></li>
                <li><a href="#typography" className="hover:text-white">Type Scales</a></li>
                <li><a href="#color" className="hover:text-white">Color Contrast</a></li>
              </ul>
            </div>
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-white">Components</h2>
              <ul className="mt-3 space-y-2 text-sm text-zinc-400">
                <li><a href="#primitives" className="hover:text-white">Accessible Primitives</a></li>
                <li><a href="#tables" className="hover:text-white">Data Tables</a></li>
                <li><a href="#forms" className="hover:text-white">Form Controls</a></li>
              </ul>
            </div>
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-white">Tooling</h2>
              <ul className="mt-3 space-y-2 text-sm text-zinc-400">
                <li><a href="#figma" className="hover:text-white">Figma Kit</a></li>
                <li><a href="#cli" className="hover:text-white">Token Compiler</a></li>
                <li><a href="#lint" className="hover:text-white">A11y Linter</a></li>
              </ul>
            </div>
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-white">Governance</h2>
              <ul className="mt-3 space-y-2 text-sm text-zinc-400">
                <li><a href="#rfc" className="hover:text-white">RFC Process</a></li>
                <li><a href="#releases" className="hover:text-white">Release Schedule</a></li>
                <li><a href="#license" className="hover:text-white">MIT License</a></li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-6 lg:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded bg-white text-zinc-950 font-bold text-xs">
            NF
          </span>
          <span className="text-sm font-semibold text-white">Novaframe Design</span>
          <span className="text-xs text-zinc-500">© 2026</span>
        </div>

        <nav aria-label="Compact footer links">
          <h2 className="sr-only">Primary footer links</h2>
          <ul className="flex flex-wrap items-center gap-6 text-xs text-zinc-400">
            <li><a href="#docs" className="hover:text-white">Docs</a></li>
            <li><a href="#changelog" className="hover:text-white">Changelog</a></li>
            <li><a href="#github" className="hover:text-white">GitHub</a></li>
            <li><a href="#privacy" className="hover:text-white">Privacy</a></li>
          </ul>
        </nav>

        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded(!expanded)}
          className="inline-flex items-center gap-2 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:border-zinc-500 hover:text-white transition-colors cursor-pointer self-start sm:self-auto"
        >
          <span>{expanded ? 'Hide Sitemap' : 'Expand Sitemap'}</span>
          <svg
            className={`h-3.5 w-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M6 15l6-6 6 6" />
          </svg>
        </button>
      </div>
    </footer>
  );
}
