import React, { useState } from 'react';

export function Footer21() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const onSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim().includes('@')) return;
    setSubscribed(true);
    setEmail('');
  };

  return (
    <footer className="bg-[#F4F1EA] text-stone-800 border-t border-stone-300">
      <div className="max-w-7xl mx-auto px-6 py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6 space-y-6">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-8 w-8 items-center justify-center bg-stone-900 text-[#F4F1EA] font-serif font-bold text-base">
                B
              </span>
              <span className="font-serif text-lg font-semibold text-stone-950">Broadsheet Quarterly</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-stone-950 leading-tight max-w-lg">
              Independent journalism for curious builders.
            </h2>
            <form onSubmit={onSubscribe} className="max-w-md">
              <label htmlFor="bq-email" className="block text-xs font-medium text-stone-600 mb-2">
                Receive the Friday morning index
              </label>
              <div className="flex gap-2">
                <input
                  id="bq-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setSubscribed(false);
                  }}
                  placeholder="name@publication.org"
                  className="flex-1 border border-stone-400 bg-white px-3.5 py-2.5 text-sm text-stone-950 placeholder:text-stone-400 focus:border-stone-950 focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-stone-950 px-5 py-2.5 text-sm font-medium text-[#F4F1EA] hover:bg-stone-800 transition-colors cursor-pointer whitespace-nowrap"
                >
                  {subscribed ? 'Confirmed' : 'Join Index'}
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-3 gap-8 lg:pl-8">
            <div>
              <h3 className="font-serif text-sm font-semibold text-stone-950">Sections</h3>
              <ul className="mt-4 space-y-2.5 text-sm text-stone-700">
                <li><a href="#dispatches" className="hover:text-stone-950 hover:underline">Field Dispatches</a></li>
                <li><a href="#interviews" className="hover:text-stone-950 hover:underline">Long Interviews</a></li>
                <li><a href="#reviews" className="hover:text-stone-950 hover:underline">Book Reviews</a></li>
                <li><a href="#letters" className="hover:text-stone-950 hover:underline">Letters to Editors</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-serif text-sm font-semibold text-stone-950">Subscriptions</h3>
              <ul className="mt-4 space-y-2.5 text-sm text-stone-700">
                <li><a href="#print" className="hover:text-stone-950 hover:underline">Print + Digital</a></li>
                <li><a href="#campus" className="hover:text-stone-950 hover:underline">University Access</a></li>
                <li><a href="#gifts" className="hover:text-stone-950 hover:underline">Gift Subscriptions</a></li>
                <li><a href="#back-issues" className="hover:text-stone-950 hover:underline">Back Issues</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-serif text-sm font-semibold text-stone-950">Masthead</h3>
              <ul className="mt-4 space-y-2.5 text-sm text-stone-700">
                <li><a href="#editors" className="hover:text-stone-950 hover:underline">Editorial Board</a></li>
                <li><a href="#fellowships" className="hover:text-stone-950 hover:underline">Fellowships</a></li>
                <li><a href="#advertising" className="hover:text-stone-950 hover:underline">Underwriting</a></li>
                <li><a href="#contact" className="hover:text-stone-950 hover:underline">Newsroom Desk</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-14 pt-6 border-t border-stone-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs text-stone-600">
          <p>© 2026 Broadsheet Quarterly Media Trust.</p>
          <ul className="flex gap-6">
            <li><a href="#ethics" className="hover:text-stone-950">Editorial Independence</a></li>
            <li><a href="#privacy" className="hover:text-stone-950">Privacy</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

export function Footer22() {
  const [bookedRoom, setBookedRoom] = useState(false);

  return (
    <footer className="bg-zinc-950 text-zinc-300 border-t border-zinc-800 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-8 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 pb-12 border-b border-zinc-800">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-amber-400">Acoustic Showrooms</p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-white">
              Audition studio monitors in person.
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setBookedRoom(!bookedRoom)}
            className="rounded-md bg-amber-400 px-5 py-3 text-sm font-semibold text-zinc-950 hover:bg-amber-300 transition-colors cursor-pointer whitespace-nowrap self-start md:self-auto"
          >
            {bookedRoom ? 'Session Requested' : 'Book a Listening Room'}
          </button>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white">Monitors</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><a href="#k1" className="hover:text-white">K1 Nearfield</a></li>
              <li><a href="#k3" className="hover:text-white">K3 Mastering Tower</a></li>
              <li><a href="#sub" className="hover:text-white">Dual-12 Sub</a></li>
              <li><a href="#dsp" className="hover:text-white">Room EQ Module</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white">Amplification</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><a href="#class-a" className="hover:text-white">Class-A Monoblocks</a></li>
              <li><a href="#dac" className="hover:text-white">Balanced R2R DAC</a></li>
              <li><a href="#cables" className="hover:text-white">Star-Quad Cabling</a></li>
              <li><a href="#stands" className="hover:text-white">Isolation Stands</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white">Support</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><a href="#acoustics" className="hover:text-white">Room Calibration</a></li>
              <li><a href="#manuals" className="hover:text-white">Schematics &amp; Manuals</a></li>
              <li><a href="#warranty" className="hover:text-white">10-Year Driver Care</a></li>
              <li><a href="#dealers" className="hover:text-white">Authorized Studios</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white">Company</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><a href="#factory" className="hover:text-white">Berlin Anechoic Lab</a></li>
              <li><a href="#press" className="hover:text-white">Reviews &amp; Press</a></li>
              <li><a href="#careers" className="hover:text-white">Acoustic Engineers</a></li>
              <li><a href="#legal" className="hover:text-white">Legal &amp; Warranty</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-6 border-t border-zinc-900">
          <p className="text-[clamp(2.5rem,9vw,6.5rem)] font-bold tracking-tighter leading-none text-zinc-800 select-none" aria-hidden="true">
            KINETIX AUDIO
          </p>
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-zinc-500">
            <span>© 2026 Kinetix Acoustic GmbH.</span>
            <span>Hand-calibrated in Berlin.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function Footer23() {
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');

  const handleParentJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim().includes('@')) {
      setNote('Please enter a parent email address.');
      return;
    }
    setNote('Welcome! Weekly printable activity pack sent.');
    setEmail('');
  };

  return (
    <footer className="bg-[#E0F2FE] text-[#0C4A6E]">
      <svg className="w-full h-6 text-[#E0F2FE] bg-white block" viewBox="0 0 1200 40" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0,20 C150,45 350,-5 600,20 C850,45 1050,-5 1200,20 L1200,40 L0,40 Z" fill="currentColor" />
      </svg>

      <div className="max-w-4xl mx-auto px-6 py-14 text-center">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-[#0284C7] text-white">
          <svg className="h-8 w-8" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <circle cx="11" cy="13" r="2.2" fill="currentColor" />
            <circle cx="21" cy="13" r="2.2" fill="currentColor" />
            <path d="M10 19.5c1.8 2.2 4 3 6 3s4.2-.8 6-3" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
        </div>

        <h2 className="mt-4 text-2xl font-bold tracking-tight text-[#082F49]">
          Bibble Kids Learning
        </h2>
        <p className="mt-1.5 text-sm text-[#075985]">
          Ad-free phonics games, math puzzles, and bedtime stories for ages 4 to 9.
        </p>

        <nav aria-label="Bibble sections" className="mt-8">
          <ul className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm font-semibold">
            <li><a href="#reading" className="hover:text-[#0284C7] transition-colors">Phonics Lab</a></li>
            <li><a href="#numbers" className="hover:text-[#0284C7] transition-colors">Number Garden</a></li>
            <li><a href="#teachers" className="hover:text-[#0284C7] transition-colors">For Classrooms</a></li>
            <li><a href="#parents" className="hover:text-[#0284C7] transition-colors">Parent Guide</a></li>
            <li><a href="#safety" className="hover:text-[#0284C7] transition-colors">COPPA Safety</a></li>
          </ul>
        </nav>

        <form onSubmit={handleParentJoin} className="mt-8 mx-auto max-w-md">
          <label htmlFor="bibble-email" className="block text-xs font-semibold text-[#075985] mb-2">
            Free printable Sunday activity sheets
          </label>
          <div className="flex gap-2">
            <input
              id="bibble-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="parent@family.org"
              className="flex-1 rounded-xl border-2 border-[#7DD3FC] bg-white px-4 py-2 text-sm text-[#082F49] focus:border-[#0284C7] focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-xl bg-[#0284C7] px-5 py-2 text-sm font-bold text-white hover:bg-[#0369A1] transition-colors cursor-pointer whitespace-nowrap"
            >
              Send Pack
            </button>
          </div>
          {note && <p className="mt-2 text-xs font-medium text-[#082F49]" role="status">{note}</p>}
        </form>

        <p className="mt-10 text-xs text-[#0369A1]">
          © 2026 Bibble Education Inc. · Safe for kids, zero third-party ads.
        </p>
      </div>
    </footer>
  );
}

export function Footer24() {
  const [filterText, setFilterText] = useState('');

  const columns = [
    {
      heading: 'Guides',
      links: ['Getting Started', 'Authentication', 'Webhooks', 'Rate Limits'],
    },
    {
      heading: 'SDKs',
      links: ['TypeScript', 'Python', 'Go Module', 'Ruby Gem'],
    },
    {
      heading: 'API Reference',
      links: ['REST Endpoints', 'GraphQL Schema', 'Pagination', 'Error Codes'],
    },
    {
      heading: 'Community',
      links: ['Discord Server', 'Changelog', 'OpenAPI Spec', 'Support Desk'],
    },
  ];

  const query = filterText.trim().toLowerCase();

  return (
    <footer className="bg-white text-slate-700 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-6 py-16 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-10 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-white font-bold text-sm">
              B
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-950">Beacon Docs</p>
              <p className="text-xs text-slate-500">Quick-filter documentation footer</p>
            </div>
          </div>

          <div className="w-full sm:w-64">
            <label htmlFor="beacon-filter" className="sr-only">Filter footer links</label>
            <input
              id="beacon-filter"
              type="search"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Filter footer links..."
              className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-8 sm:grid-cols-4">
          {columns.map((col) => {
            const visibleLinks = col.links.filter(
              (label) => !query || label.toLowerCase().includes(query)
            );
            return (
              <div key={col.heading}>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-950">
                  {col.heading}
                </h2>
                <ul className="mt-4 space-y-2.5 text-sm">
                  {visibleLinks.length > 0 ? (
                    visibleLinks.map((label) => (
                      <li key={label}>
                        <a href={`#${label.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-blue-700 transition-colors">
                          {label}
                        </a>
                      </li>
                    ))
                  ) : (
                    <li className="text-xs text-slate-400">No matches</li>
                  )}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="mt-12 pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 Beacon Developer Platforms Inc.</p>
          <ul className="flex gap-6">
            <li><a href="#privacy" className="hover:text-slate-900">Privacy</a></li>
            <li><a href="#terms" className="hover:text-slate-900">Terms</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

export function Footer25() {
  return (
    <footer className="bg-white text-stone-600 border-t border-stone-200">
      <div className="max-w-7xl mx-auto px-6 py-10 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-8 border-b border-stone-100">
          <a href="#quietude" className="inline-flex items-center gap-2.5 text-stone-950">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-stone-900 text-xs font-semibold">
              Q
            </span>
            <span className="text-base font-medium tracking-tight">Quietude Wellness</span>
          </a>

          <nav aria-label="Primary links">
            <h2 className="sr-only">Quietude links</h2>
            <ul className="flex flex-wrap items-center gap-x-7 gap-y-2 text-sm">
              <li><a href="#sessions" className="hover:text-stone-950 transition-colors">Audio Sessions</a></li>
              <li><a href="#sleep" className="hover:text-stone-950 transition-colors">Sleep Library</a></li>
              <li><a href="#breathe" className="hover:text-stone-950 transition-colors">Breathwork</a></li>
              <li><a href="#clinicians" className="hover:text-stone-950 transition-colors">Clinical Advisory</a></li>
              <li><a href="#membership" className="hover:text-stone-950 transition-colors">Membership</a></li>
            </ul>
          </nav>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs text-stone-500">
          <p>© 2026 Quietude Health Ltd. Designed for calm focus.</p>
          <ul className="flex flex-wrap items-center gap-6">
            <li><a href="#privacy" className="hover:text-stone-900">Privacy</a></li>
            <li><a href="#terms" className="hover:text-stone-900">Terms</a></li>
            <li><a href="#accessibility" className="hover:text-stone-900">Accessibility</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

export function Footer26() {
  const [partEmail, setPartEmail] = useState('');
  const [requested, setRequested] = useState(false);

  const handleSpecRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partEmail.trim().includes('@')) return;
    setRequested(true);
    setPartEmail('');
  };

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-700">
      <div className="max-w-7xl mx-auto px-6 py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5 text-white">
              <span className="inline-flex h-8 w-8 items-center justify-center bg-amber-500 text-slate-950 font-mono font-bold text-sm">
                FG
              </span>
              <span className="text-lg font-semibold tracking-tight">Forgecraft CNC</span>
            </div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 pt-2">Plant &amp; Engineering Desk</h2>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>1820 Industrial Pkwy, Milwaukee, WI 53204</li>
              <li>ISO 9001:2015 &amp; AS9100D Certified</li>
              <li>
                <a href="#phone" className="text-amber-400 hover:underline font-mono">+1 (414) 555-0182</a>
              </li>
              <li>
                <a href="#rfq-mail" className="hover:text-white">rfq@forgecraftcnc.example</a>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-4 grid grid-cols-2 gap-8">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-white">Capabilities</h2>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li><a href="#5-axis" className="hover:text-white">5-Axis Milling</a></li>
                <li><a href="#swiss" className="hover:text-white">Swiss Turning</a></li>
                <li><a href="#edm" className="hover:text-white">Wire EDM</a></li>
                <li><a href="#anodize" className="hover:text-white">Type III Anodize</a></li>
              </ul>
            </div>
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-white">Quality</h2>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li><a href="#cmm" className="hover:text-white">CMM Inspection</a></li>
                <li><a href="#certs" className="hover:text-white">Material Certs</a></li>
                <li><a href="#itar" className="hover:text-white">ITAR Registration</a></li>
                <li><a href="#tolerances" className="hover:text-white">Tolerance Guide</a></li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-4 rounded-lg border border-slate-800 bg-slate-950/60 p-6">
            <h2 className="text-sm font-semibold text-white">Download Tolerance &amp; Alloy Spec Sheet</h2>
            <p className="mt-1.5 text-xs text-slate-400">
              Receive our PDF machining tolerances handbook for 6061-T6, 7075, and 17-4PH stainless.
            </p>
            <form onSubmit={handleSpecRequest} className="mt-4 space-y-2.5">
              <label htmlFor="fg-spec-email" className="sr-only">Engineering email</label>
              <input
                id="fg-spec-email"
                type="email"
                value={partEmail}
                onChange={(e) => {
                  setPartEmail(e.target.value);
                  setRequested(false);
                }}
                placeholder="engineer@oem-corp.com"
                className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
              />
              <button
                type="submit"
                className="w-full rounded bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400 transition-colors cursor-pointer"
              >
                {requested ? 'Spec Sheet Sent' : 'Request Spec Sheet'}
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 Forgecraft Precision Machining LLC.</p>
          <p>Lead times from 5 business days.</p>
        </div>
      </div>
    </footer>
  );
}

export function Footer27() {
  return (
    <footer className="bg-[#2E1065] text-purple-100">
      <div className="max-w-7xl mx-auto px-6 py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-3 text-white">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-fuchsia-500 text-white font-bold text-lg">
                W
              </span>
              <span className="text-xl font-semibold tracking-tight">Wavelength Media</span>
            </div>
            <p className="text-sm text-purple-200/85 max-w-sm leading-relaxed">
              Independent documentary podcasts, investigative audio series, and live tour recordings.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="#apple-podcasts" className="inline-flex items-center gap-2 rounded-lg bg-purple-900/90 border border-purple-700 px-3.5 py-2 text-xs font-semibold text-white hover:bg-purple-800 transition-colors">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 14.5a1.5 1.5 0 1 1 1.5-1.5 1.5 1.5 0 0 1-1.5 1.5zm3.35-4.15a.75.75 0 0 1-1.06 0 3.24 3.24 0 0 0-4.58 0 .75.75 0 1 1-1.06-1.06 4.74 4.74 0 0 1 6.7 0 .75.75 0 0 1 0 1.06z" />
                </svg>
                <span>Apple Podcasts</span>
              </a>
              <a href="#android-app" className="inline-flex items-center gap-2 rounded-lg bg-purple-900/90 border border-purple-700 px-3.5 py-2 text-xs font-semibold text-white hover:bg-purple-800 transition-colors">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M4 11a9 9 0 0 1 9 9" />
                  <path d="M4 4a16 16 0 0 1 16 16" />
                  <circle cx="5" cy="19" r="1.5" fill="currentColor" />
                </svg>
                <span>Subscriber RSS</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-purple-300">Shows</h2>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li><a href="#signal" className="hover:text-white">Signal &amp; Noise</a></li>
                <li><a href="#archive" className="hover:text-white">Tape Archive</a></li>
                <li><a href="#field-notes" className="hover:text-white">Field Notes</a></li>
                <li><a href="#live" className="hover:text-white">Live Events</a></li>
              </ul>
            </div>
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-purple-300">Listeners</h2>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li><a href="#club" className="hover:text-white">Ad-Free Feed</a></li>
                <li><a href="#transcripts" className="hover:text-white">Full Transcripts</a></li>
                <li><a href="#merch" className="hover:text-white">Print Zines</a></li>
                <li><a href="#gift" className="hover:text-white">Gift Membership</a></li>
              </ul>
            </div>
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-purple-300">Network</h2>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li><a href="#producers" className="hover:text-white">Producers</a></li>
                <li><a href="#pitch" className="hover:text-white">Pitch a Series</a></li>
                <li><a href="#sponsors" className="hover:text-white">Sponsorships</a></li>
                <li><a href="#press" className="hover:text-white">Press Kit</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-purple-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs text-purple-300">
          <p>© 2026 Wavelength Audio Network.</p>
          <ul className="flex gap-5">
            <li><a href="#spotify" aria-label="Spotify" className="hover:text-white">Spotify</a></li>
            <li><a href="#youtube" aria-label="YouTube" className="hover:text-white">YouTube</a></li>
            <li><a href="#privacy" className="hover:text-white">Privacy</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

export function Footer28() {
  const [region, setRegion] = useState('US-East (Virginia)');
  const [lang, setLang] = useState('English');

  return (
    <footer className="bg-slate-50 text-slate-700 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-6 py-16 lg:px-8">
        <div className="pb-10 border-b border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3 text-slate-950">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded bg-slate-950 text-white font-bold text-xs">
              VS
            </span>
            <span className="text-base font-semibold">Vaultshield Security</span>
          </div>
          <p className="text-xs font-medium text-slate-600">
            SOC 2 Type II · ISO/IEC 27001 · FedRAMP Moderate · GDPR Art. 28
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-950">Zero Trust</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><a href="#iam" className="hover:text-slate-950">Identity Proxy</a></li>
              <li><a href="#pam" className="hover:text-slate-950">Ephemeral Access</a></li>
              <li><a href="#ssh" className="hover:text-slate-950">SSH Certificate CA</a></li>
              <li><a href="#k8s" className="hover:text-slate-950">Kubernetes RBAC</a></li>
            </ul>
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-950">Posture</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><a href="#cspm" className="hover:text-slate-950">Cloud Drift Audit</a></li>
              <li><a href="#secrets" className="hover:text-slate-950">Secret Scanning</a></li>
              <li><a href="#sbom" className="hover:text-slate-950">SBOM Registry</a></li>
              <li><a href="#siem" className="hover:text-slate-950">SIEM Connectors</a></li>
            </ul>
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-950">Trust Center</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><a href="#pentest" className="hover:text-slate-950">Pen-Test Reports</a></li>
              <li><a href="#bug-bounty" className="hover:text-slate-950">Vulnerability Disclosure</a></li>
              <li><a href="#pgp" className="hover:text-slate-950">Security PGP Key</a></li>
              <li><a href="#subprocessors" className="hover:text-slate-950">Subprocessors</a></li>
            </ul>
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-950">Organization</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><a href="#leadership" className="hover:text-slate-950">Leadership</a></li>
              <li><a href="#advisories" className="hover:text-slate-950">Security Advisories</a></li>
              <li><a href="#partners" className="hover:text-slate-950">MSSP Partners</a></li>
              <li><a href="#contact" className="hover:text-slate-950">Incident Response</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-xs text-slate-500">
            © 2026 Vaultshield Inc. · Data residency: {region} ({lang})
          </p>
          <div className="flex flex-wrap gap-3">
            <label htmlFor="vs-region" className="sr-only">Data residency region</label>
            <select
              id="vs-region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-blue-600 focus:outline-none"
            >
              <option value="US-East (Virginia)">US-East (Virginia)</option>
              <option value="EU-Central (Frankfurt)">EU-Central (Frankfurt)</option>
              <option value="AP-Northeast (Tokyo)">AP-Northeast (Tokyo)</option>
            </select>
            <label htmlFor="vs-lang" className="sr-only">Interface language</label>
            <select
              id="vs-lang"
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-blue-600 focus:outline-none"
            >
              <option value="English">English</option>
              <option value="Deutsch">Deutsch</option>
              <option value="Français">Français</option>
            </select>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function Footer29() {
  return (
    <footer className="bg-[#ECFDF5] text-[#064E3B] border-t border-[#A7F3D0]">
      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#059669] text-white font-mono font-bold text-lg">
          PG
        </div>
        <h2 className="mt-4 text-xl font-bold tracking-tight text-[#022C22]">
          Pixelgarden Studio
        </h2>
        <p className="mt-1.5 text-sm text-[#047857]">
          Vector sprite editors, isometric tile builders, and cozy indie tooling.
        </p>

        <nav aria-label="Studio links" className="mt-8 space-y-4">
          <ul className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm font-semibold">
            <li><a href="#sprite-pad" className="hover:text-[#059669] transition-colors">SpritePad</a></li>
            <li><a href="#tile-forge" className="hover:text-[#059669] transition-colors">TileForge</a></li>
            <li><a href="#palettes" className="hover:text-[#059669] transition-colors">Palette Archive</a></li>
            <li><a href="#showcase" className="hover:text-[#059669] transition-colors">Game Jam Showcase</a></li>
          </ul>
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-[#047857]">
            <li><a href="#docs" className="hover:underline">Lua Scripting Docs</a></li>
            <li><a href="#discord" className="hover:underline">Community Forum</a></li>
            <li><a href="#changelog" className="hover:underline">Release Notes</a></li>
            <li><a href="#educators" className="hover:underline">Classroom Licenses</a></li>
          </ul>
        </nav>

        <p className="mt-10 text-xs text-[#047857]">
          © 2026 Pixelgarden Cooperative · Crafted in Vancouver
        </p>
      </div>
    </footer>
  );
}

export function Footer30() {
  return (
    <footer className="bg-white text-zinc-700 border-t border-zinc-200">
      <div className="max-w-7xl mx-auto px-6 py-16 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-950">Categories</h2>
            <ul className="mt-4 space-y-2 text-xs">
              <li><a href="#audio" className="hover:text-zinc-950">Audio &amp; Hi-Fi</a></li>
              <li><a href="#cameras" className="hover:text-zinc-950">Analog Cameras</a></li>
              <li><a href="#furniture" className="hover:text-zinc-950">Modernist Chairs</a></li>
              <li><a href="#prints" className="hover:text-zinc-950">Archival Prints</a></li>
            </ul>
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-950">Sellers</h2>
            <ul className="mt-4 space-y-2 text-xs">
              <li><a href="#open-shop" className="hover:text-zinc-950">Open a Storefront</a></li>
              <li><a href="#fees" className="hover:text-zinc-950">Commission Rates</a></li>
              <li><a href="#payouts" className="hover:text-zinc-950">Seller Payouts</a></li>
              <li><a href="#handbook" className="hover:text-zinc-950">Shipping Labels</a></li>
            </ul>
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-950">Buyers</h2>
            <ul className="mt-4 space-y-2 text-xs">
              <li><a href="#protection" className="hover:text-zinc-950">Buyer Protection</a></li>
              <li><a href="#authentication" className="hover:text-zinc-950">Authentication</a></li>
              <li><a href="#tracking" className="hover:text-zinc-950">Track Order</a></li>
              <li><a href="#returns" className="hover:text-zinc-950">Dispute Center</a></li>
            </ul>
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-950">Trust</h2>
            <ul className="mt-4 space-y-2 text-xs">
              <li><a href="#escrow" className="hover:text-zinc-950">Escrow Safety</a></li>
              <li><a href="#reviews" className="hover:text-zinc-950">Verified Reviews</a></li>
              <li><a href="#counterfeit" className="hover:text-zinc-950">IP Takedowns</a></li>
              <li><a href="#safety" className="hover:text-zinc-950">Trust Report</a></li>
            </ul>
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-950">Developers</h2>
            <ul className="mt-4 space-y-2 text-xs">
              <li><a href="#catalog-api" className="hover:text-zinc-950">Inventory API</a></li>
              <li><a href="#webhooks" className="hover:text-zinc-950">Order Webhooks</a></li>
              <li><a href="#csv" className="hover:text-zinc-950">Bulk CSV Importer</a></li>
              <li><a href="#sandbox" className="hover:text-zinc-950">Sandbox Keys</a></li>
            </ul>
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-950">Company</h2>
            <ul className="mt-4 space-y-2 text-xs">
              <li><a href="#about" className="hover:text-zinc-950">About Atlas</a></li>
              <li><a href="#press" className="hover:text-zinc-950">Newsroom</a></li>
              <li><a href="#careers" className="hover:text-zinc-950">Careers</a></li>
              <li><a href="#contact" className="hover:text-zinc-950">Help Desk</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-zinc-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-2.5 text-zinc-950 font-semibold">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-zinc-950 text-white text-[11px]">A</span>
            <span>Atlas Marketplace Inc.</span>
          </div>
          <ul className="flex flex-wrap gap-6">
            <li><a href="#privacy" className="hover:text-zinc-900">Privacy</a></li>
            <li><a href="#terms" className="hover:text-zinc-900">Marketplace Terms</a></li>
            <li><a href="#accessibility" className="hover:text-zinc-900">Accessibility</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
