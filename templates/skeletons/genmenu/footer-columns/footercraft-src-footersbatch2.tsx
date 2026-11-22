import React, { useState } from 'react';

export function Footer11() {
  return (
    <footer className="bg-[#064E3B] text-emerald-100">
      <div className="max-w-7xl mx-auto px-6 py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5 text-white">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-emerald-400 text-[#05382B] font-bold text-sm">
                C
              </span>
              <span className="text-lg font-semibold tracking-tight">Canopy Climate</span>
            </div>
            <p className="text-xs leading-relaxed text-emerald-200/80">
              Satellite verification for regenerative forestry and watershed restoration projects worldwide.
            </p>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-emerald-300">Measurement</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><a href="#lidar" className="hover:text-white transition-colors">LiDAR Canopy Scans</a></li>
              <li><a href="#biomass" className="hover:text-white transition-colors">Biomass Baselines</a></li>
              <li><a href="#soil" className="hover:text-white transition-colors">Soil Carbon Models</a></li>
              <li><a href="#biodiversity" className="hover:text-white transition-colors">Acoustic Sensors</a></li>
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-emerald-300">Registries</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><a href="#verra" className="hover:text-white transition-colors">Methodology Library</a></li>
              <li><a href="#auditors" className="hover:text-white transition-colors">Independent Audits</a></li>
              <li><a href="#vintage" className="hover:text-white transition-colors">Vintage Ledger</a></li>
              <li><a href="#retirement" className="hover:text-white transition-colors">Public Retirements</a></li>
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-emerald-300">Partners</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><a href="#developers" className="hover:text-white transition-colors">Project Developers</a></li>
              <li><a href="#buyers" className="hover:text-white transition-colors">Enterprise Buyers</a></li>
              <li><a href="#ngos" className="hover:text-white transition-colors">Indigenous Stewards</a></li>
              <li><a href="#universities" className="hover:text-white transition-colors">Research Grants</a></li>
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-emerald-300">Organization</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><a href="#mission" className="hover:text-white transition-colors">2030 Charter</a></li>
              <li><a href="#impact" className="hover:text-white transition-colors">Annual Impact Report</a></li>
              <li><a href="#team" className="hover:text-white transition-colors">Science Team</a></li>
              <li><a href="#contact" className="hover:text-white transition-colors">Contact Desk</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-6 border-t border-emerald-800/70 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs text-emerald-200/80">
          <p>© 2026 Canopy Climate Inc. Public Benefit Corporation.</p>
          <p>100% renewable compute · Methodology v4.2</p>
        </div>
      </div>
    </footer>
  );
}

export function Footer12() {
  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState('');

  const submitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim().includes('@')) {
      setFeedback('Please enter a valid work email.');
      return;
    }
    setFeedback('Subscribed to studio release notes.');
    setEmail('');
  };

  return (
    <footer className="bg-[#0B0B0E] text-zinc-300 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-6 py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5 text-white">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded bg-rose-600 text-white font-bold text-sm">
                FC
              </span>
              <span className="text-lg font-semibold tracking-tight">Framecraft Video</span>
            </div>
            <p className="text-sm text-zinc-400">
              Color-accurate cloud dailies, frame-exact review timelines, and lossless ProRes delivery.
            </p>
            <form onSubmit={submitForm} className="pt-2 space-y-2" noValidate>
              <label htmlFor="fc-newsletter" className="block text-xs font-medium text-zinc-300">
                Monthly release digest
              </label>
              <div className="flex gap-2">
                <input
                  id="fc-newsletter"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="editor@studio.tv"
                  className="flex-1 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-rose-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-500 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Join
                </button>
              </div>
              {feedback && <p className="text-xs text-rose-300" role="status">{feedback}</p>}
            </form>
          </div>

          <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-white">Suite</h2>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li><a href="#dailies" className="hover:text-white">Cloud Dailies</a></li>
                <li><a href="#lut" className="hover:text-white">ACES Color Pipeline</a></li>
                <li><a href="#review" className="hover:text-white">Live Review Rooms</a></li>
                <li><a href="#transcode" className="hover:text-white">GPU Transcoding</a></li>
              </ul>
            </div>
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-white">Plugins</h2>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li><a href="#resolve" className="hover:text-white">DaVinci Resolve</a></li>
                <li><a href="#premiere" className="hover:text-white">Premiere Pro</a></li>
                <li><a href="#avid" className="hover:text-white">Avid Media Composer</a></li>
                <li><a href="#nuke" className="hover:text-white">Foundry Nuke</a></li>
              </ul>
            </div>
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-white">Security</h2>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li><a href="#tpn" className="hover:text-white">MPA TPN Gold</a></li>
                <li><a href="#watermark" className="hover:text-white">Forensic Watermark</a></li>
                <li><a href="#sso" className="hover:text-white">Okta &amp; SAML</a></li>
                <li><a href="#drm" className="hover:text-white">Hardware DRM</a></li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-3 rounded-lg border border-zinc-800 bg-zinc-900/60 p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-white">Recent Releases</h2>
            <ul className="mt-4 space-y-3 text-xs">
              <li>
                <a href="#rel-412" className="block hover:text-white">
                  <span className="font-medium text-zinc-200">HDR10+ Live Scrubbing</span>
                  <span className="block text-zinc-500 mt-0.5">Nov 2026 · Desktop App</span>
                </a>
              </li>
              <li>
                <a href="#rel-411" className="block hover:text-white">
                  <span className="font-medium text-zinc-200">RED R3D Direct Ingest</span>
                  <span className="block text-zinc-500 mt-0.5">Oct 2026 · Camera-to-Cloud</span>
                </a>
              </li>
              <li>
                <a href="#rel-410" className="block hover:text-white">
                  <span className="font-medium text-zinc-200">Spatial Audio Stems</span>
                  <span className="block text-zinc-500 mt-0.5">Sep 2026 · Review Player</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs text-zinc-500">
          <p>© 2026 Framecraft Media Inc.</p>
          <ul className="flex gap-6">
            <li><a href="#privacy" className="hover:text-zinc-300">Privacy</a></li>
            <li><a href="#terms" className="hover:text-zinc-300">Terms</a></li>
            <li><a href="#cookies" className="hover:text-zinc-300">Cookies</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

export function Footer13() {
  const [region, setRegion] = useState<'us-east' | 'eu-central'>('us-east');

  return (
    <footer className="bg-[#09090B] text-zinc-400 border-t border-zinc-800 font-mono">
      <div className="max-w-7xl mx-auto px-6 py-6 lg:px-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between text-xs">
        <div className="flex items-center gap-3 text-zinc-100">
          <span className="px-1.5 py-0.5 border border-zinc-700 text-zinc-100 font-semibold">[H]</span>
          <span>Hexa Compute</span>
          <span className="text-zinc-600" aria-hidden="true">|</span>
          <span className="text-zinc-500">© 2026</span>
        </div>

        <nav aria-label="Footer terminal links">
          <h2 className="sr-only">Compute directory</h2>
          <ul className="flex flex-wrap items-center gap-6">
            <li><a href="#nodes" className="hover:text-white transition-colors">Nodes</a></li>
            <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
            <li><a href="#api" className="hover:text-white transition-colors">API</a></li>
            <li><a href="#sla" className="hover:text-white transition-colors">SLA</a></li>
            <li><a href="#legal" className="hover:text-white transition-colors">Legal</a></li>
          </ul>
        </nav>

        <button
          type="button"
          onClick={() => setRegion(region === 'us-east' ? 'eu-central' : 'us-east')}
          className="inline-flex items-center gap-2 rounded border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-zinc-200 hover:border-zinc-700 transition-colors cursor-pointer self-start md:self-auto"
        >
          <span>Region:</span>
          <span className="text-white">{region}</span>
        </button>
      </div>
    </footer>
  );
}

export function Footer14() {
  const [trialStarted, setTrialStarted] = useState(false);

  return (
    <footer className="bg-slate-950 text-slate-300">
      <div className="bg-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-10 lg:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Hire across 140 countries without local entities.
            </h2>
            <p className="mt-1.5 text-sm text-blue-100">
              Compliant contracts, automated tax withholding, and same-day contractor payouts.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setTrialStarted(!trialStarted)}
              className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-blue-800 hover:bg-blue-50 transition-colors cursor-pointer whitespace-nowrap"
            >
              {trialStarted ? 'Workspace Created' : 'Start Free Trial'}
            </button>
            <a
              href="#calculator"
              className="rounded-lg border border-blue-400 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-600 transition-colors whitespace-nowrap"
            >
              Cost Calculator
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-14 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white">Hiring</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><a href="#eor" className="hover:text-white">Employer of Record</a></li>
              <li><a href="#contractors" className="hover:text-white">Global Contractors</a></li>
              <li><a href="#payroll" className="hover:text-white">Multi-Country Payroll</a></li>
              <li><a href="#visas" className="hover:text-white">Visa Sponsorship</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white">Benefits</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><a href="#health" className="hover:text-white">Local Health Plans</a></li>
              <li><a href="#equity" className="hover:text-white">Global Equity Grants</a></li>
              <li><a href="#equipment" className="hover:text-white">Laptop Provisioning</a></li>
              <li><a href="#stipends" className="hover:text-white">Workspace Stipends</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white">Guides</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><a href="#country-guides" className="hover:text-white">Country Hiring Guides</a></li>
              <li><a href="#misclassification" className="hover:text-white">Classification Checker</a></li>
              <li><a href="#labor-laws" className="hover:text-white">Statutory Leave Matrix</a></li>
              <li><a href="#tax-treaties" className="hover:text-white">Tax Treaties</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white">Pulsework</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><a href="#about" className="hover:text-white">About Us</a></li>
              <li><a href="#security" className="hover:text-white">SOC 2 &amp; GDPR</a></li>
              <li><a href="#partners" className="hover:text-white">Accounting Partners</a></li>
              <li><a href="#contact" className="hover:text-white">Talk to Counsel</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2.5 text-white">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-blue-600 text-xs font-bold">P</span>
            <span>Pulsework Global Inc. © 2026</span>
          </div>
          <ul className="flex gap-6">
            <li><a href="#privacy" className="hover:text-white">Privacy</a></li>
            <li><a href="#terms" className="hover:text-white">Master Services Agreement</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

export function Footer15() {
  return (
    <footer className="bg-[#FDFBF7] text-stone-700 border-t border-stone-200">
      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center border border-stone-400 rounded-full font-serif text-lg tracking-widest text-stone-900">
          MV
        </div>
        <h2 className="mt-4 font-serif text-2xl font-normal tracking-wide text-stone-950">
          Maison Verve
        </h2>
        <p className="mt-1 text-xs uppercase tracking-[0.22em] text-stone-500">
          Botanical Perfumery · Grasse &amp; Paris
        </p>

        <div className="my-8 flex items-center justify-center gap-4" aria-hidden="true">
          <span className="h-px w-16 bg-stone-300" />
          <svg className="h-4 w-4 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 3v18M3 12h18M6.5 6.5l11 11M17.5 6.5l-11 11" />
          </svg>
          <span className="h-px w-16 bg-stone-300" />
        </div>

        <nav aria-label="Maison navigation">
          <h3 className="sr-only">Collections and client care</h3>
          <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm font-serif text-stone-700">
            <li><a href="#extrait" className="hover:text-stone-950 transition-colors">Extraits de Parfum</a></li>
            <li><a href="#discovery" className="hover:text-stone-950 transition-colors">Discovery Coffret</a></li>
            <li><a href="#refills" className="hover:text-stone-950 transition-colors">Flacon Refills</a></li>
            <li><a href="#boutiques" className="hover:text-stone-950 transition-colors">Salons</a></li>
            <li><a href="#client-care" className="hover:text-stone-950 transition-colors">Client Care</a></li>
          </ul>
        </nav>

        <p className="mt-10 text-xs text-stone-500">
          © 2026 Maison Verve Parfums. 14 Rue Saint-Roch, 75001 Paris.
        </p>
      </div>
    </footer>
  );
}

export function Footer16() {
  return (
    <footer className="bg-[#0F172A] text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6 py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-white">Freight</h2>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li><a href="#ocean" className="hover:text-white">Ocean FCL / LCL</a></li>
                <li><a href="#air" className="hover:text-white">Priority Air Charter</a></li>
                <li><a href="#rail" className="hover:text-white">Intermodal Rail</a></li>
                <li><a href="#cold" className="hover:text-white">Cold Chain</a></li>
              </ul>
            </div>
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-white">Customs</h2>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li><a href="#brokerage" className="hover:text-white">Port Clearance</a></li>
                <li><a href="#hs-codes" className="hover:text-white">HS Classification</a></li>
                <li><a href="#bonded" className="hover:text-white">Bonded Warehousing</a></li>
                <li><a href="#insurance" className="hover:text-white">Cargo Insurance</a></li>
              </ul>
            </div>
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-white">Platform</h2>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li><a href="#tracking" className="hover:text-white">Vessel AIS Tracking</a></li>
                <li><a href="#edi" className="hover:text-white">EDI / API Feeds</a></li>
                <li><a href="#emissions" className="hover:text-white">GLEC Emissions</a></li>
                <li><a href="#invoices" className="hover:text-white">Freight Audit</a></li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
              <h2 className="text-sm font-semibold text-white">Rotterdam Port Hub</h2>
              <ul className="mt-3 space-y-1.5 text-xs text-slate-400">
                <li>Wilhelminakade 179, 3072 AP Rotterdam</li>
                <li>Dispatch: +31 10 555 0148</li>
                <li><a href="#nl-desk" className="text-sky-400 hover:underline">eu-ops@northstarfreight.example</a></li>
              </ul>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
              <h2 className="text-sm font-semibold text-white">Singapore Terminal Desk</h2>
              <ul className="mt-3 space-y-1.5 text-xs text-slate-400">
                <li>460 Alexandra Rd, #18-02 Singapore</li>
                <li>Dispatch: +65 6555 0192</li>
                <li><a href="#sg-desk" className="text-sky-400 hover:underline">apac-ops@northstarfreight.example</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2.5 text-white">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded bg-sky-500 text-slate-950 font-bold text-xs">N</span>
            <span>Northstar Logistics B.V. © 2026</span>
          </div>
          <ul className="flex gap-6">
            <li><a href="#bill-of-lading" className="hover:text-white">Standard Trading Terms</a></li>
            <li><a href="#privacy" className="hover:text-white">Privacy</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

export function Footer17() {
  const [contact, setContact] = useState('');
  const [sent, setSent] = useState(false);

  const sendLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact.trim()) return;
    setSent(true);
    setContact('');
  };

  return (
    <footer className="bg-white text-zinc-700 border-t border-zinc-200">
      <div className="max-w-7xl mx-auto px-6 py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5 space-y-5">
            <div className="flex items-center gap-3 text-zinc-950">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-950 text-white font-bold text-sm">
                MP
              </span>
              <span className="text-lg font-semibold tracking-tight">MetroPay Wallet</span>
            </div>
            <p className="text-sm text-zinc-600 max-w-sm">
              Tap-to-pay transit passes, split bills, and instant peer transfers across 32 countries.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="#ios" className="inline-flex items-center gap-2 rounded-lg bg-zinc-950 px-3.5 py-2 text-white hover:bg-zinc-800 transition-colors">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.33c.64-.78 1.08-1.86.96-2.94-.93.04-2.06.62-2.72 1.4-.58.68-1.1 1.78-.96 2.84 1.04.08 2.08-.52 2.72-1.3" />
                </svg>
                <span className="text-xs font-medium">iOS App Store</span>
              </a>
              <a href="#android" className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3.5 py-2 text-zinc-900 hover:bg-zinc-50 transition-colors">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M3.61 1.814L13.793 12 3.61 22.186a1.47 1.47 0 01-.36-.98V2.794c0-.373.133-.72.36-.98zm11.24 11.242l2.634 2.634-9.847 5.603 7.213-8.237zm3.671-2.09l2.464 1.402c.68.387.68 1.277 0 1.664l-2.464 1.402-2.834-2.234 2.834-2.234zM7.637 2.707l9.847 5.603-2.634 2.634-7.213-8.237z" />
                </svg>
                <span className="text-xs font-medium">Google Play</span>
              </a>
            </div>
            <form onSubmit={sendLink} className="max-w-sm">
              <label htmlFor="mp-sms" className="block text-xs font-medium text-zinc-600 mb-1.5">
                Text or email me the download link
              </label>
              <div className="flex gap-2">
                <input
                  id="mp-sms"
                  type="text"
                  value={contact}
                  onChange={(e) => {
                    setContact(e.target.value);
                    setSent(false);
                  }}
                  placeholder="+1 555-0140 or email"
                  className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-950 focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-md bg-zinc-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-zinc-800 transition-colors cursor-pointer whitespace-nowrap"
                >
                  {sent ? 'Link Sent' : 'Send Link'}
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-950">Wallet</h2>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li><a href="#transit" className="hover:text-zinc-950">Transit Cards</a></li>
                <li><a href="#virtual" className="hover:text-zinc-950">Virtual Debit</a></li>
                <li><a href="#savings" className="hover:text-zinc-950">Vaults</a></li>
                <li><a href="#fx" className="hover:text-zinc-950">Travel Rates</a></li>
              </ul>
            </div>
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-950">Merchants</h2>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li><a href="#qr" className="hover:text-zinc-950">QR Checkout</a></li>
                <li><a href="#pos" className="hover:text-zinc-950">NFC Terminals</a></li>
                <li><a href="#payouts" className="hover:text-zinc-950">Instant Settlement</a></li>
                <li><a href="#fees" className="hover:text-zinc-950">Fee Schedule</a></li>
              </ul>
            </div>
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-950">Trust</h2>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li><a href="#biometrics" className="hover:text-zinc-950">Passkey Security</a></li>
                <li><a href="#disputes" className="hover:text-zinc-950">Card Disputes</a></li>
                <li><a href="#licenses" className="hover:text-zinc-950">State Licenses</a></li>
                <li><a href="#help" className="hover:text-zinc-950">24/7 Support</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-zinc-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs text-zinc-500">
          <p>© 2026 MetroPay Financial Inc.</p>
          <ul className="flex items-center gap-4">
            <li><a href="#x" aria-label="MetroPay on X" className="hover:text-zinc-950">X / Twitter</a></li>
            <li><a href="#linkedin" aria-label="MetroPay on LinkedIn" className="hover:text-zinc-950">LinkedIn</a></li>
            <li><a href="#privacy" className="hover:text-zinc-950">Privacy</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

export function Footer18() {
  return (
    <footer className="bg-[#FEF08A] text-[#422006] rounded-t-3xl border-t-2 border-[#713F12]/20">
      <div className="max-w-7xl mx-auto px-6 py-16 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:justify-between gap-12">
          <div className="max-w-xs space-y-4">
            <a href="#zest" className="inline-flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#C2410C] text-white font-bold text-lg shadow-sm">
                ZK
              </span>
              <span className="text-xl font-bold tracking-tight text-[#431407]">Zest Kitchen</span>
            </a>
            <p className="text-sm leading-relaxed text-[#713F12]">
              Bright enamel cookware, citrus presses, and weeknight recipe cards made for joyful home cooking.
            </p>
            <ul className="flex items-center gap-3 pt-1">
              <li>
                <a href="#insta" aria-label="Zest Kitchen on Instagram" className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/80 text-[#9A3412] hover:bg-[#C2410C] hover:text-white transition-colors">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <rect x="2" y="2" width="20" height="20" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                  </svg>
                </a>
              </li>
              <li>
                <a href="#tiktok" aria-label="Zest Kitchen on TikTok" className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/80 text-[#9A3412] hover:bg-[#C2410C] hover:text-white transition-colors">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.81a8.23 8.23 0 0 0 4.76 1.5v-3.4a4.85 4.85 0 0 1-1-.22z" />
                  </svg>
                </a>
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-10 lg:gap-16">
            <div>
              <h2 className="text-sm font-bold text-[#431407]">Cookware</h2>
              <ul className="mt-4 space-y-2.5 text-sm font-medium text-[#7C2D12]">
                <li><a href="#dutch-ovens" className="hover:underline">Enamel Dutch Ovens</a></li>
                <li><a href="#skillets" className="hover:underline">Carbon Skillets</a></li>
                <li><a href="#knives" className="hover:underline">Prep Knives</a></li>
                <li><a href="#bundles" className="hover:underline">Starter Sets</a></li>
              </ul>
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#431407]">Recipes</h2>
              <ul className="mt-4 space-y-2.5 text-sm font-medium text-[#7C2D12]">
                <li><a href="#weeknight" className="hover:underline">20-Minute Dinners</a></li>
                <li><a href="#baking" className="hover:underline">Citrus Baking</a></li>
                <li><a href="#pantry" className="hover:underline">Pantry Index</a></li>
                <li><a href="#print-cards" className="hover:underline">Printable Cards</a></li>
              </ul>
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#431407]">Help</h2>
              <ul className="mt-4 space-y-2.5 text-sm font-medium text-[#7C2D12]">
                <li><a href="#warranty" className="hover:underline">Lifetime Warranty</a></li>
                <li><a href="#seasoning" className="hover:underline">Pan Care Guide</a></li>
                <li><a href="#returns" className="hover:underline">Easy Returns</a></li>
                <li><a href="#stores" className="hover:underline">Find a Shop</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[#713F12]/15 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs font-medium text-[#7C2D12]">
          <p>© 2026 Zest Kitchen Goods. Made with joy in Austin, TX.</p>
          <ul className="flex gap-5">
            <li><a href="#privacy" className="hover:underline">Privacy</a></li>
            <li><a href="#terms" className="hover:underline">Terms</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

export function Footer19() {
  return (
    <footer className="bg-zinc-50 text-zinc-700 border-t border-zinc-200">
      <div className="max-w-7xl mx-auto px-6 py-16 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-10 border-b border-zinc-200">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded border border-zinc-900 bg-white font-mono text-xs font-bold text-zinc-950">
              DB
            </span>
            <span className="text-base font-semibold text-zinc-950">Draftboard CAD — Site Architecture</span>
          </div>
          <a href="#full-sitemap" className="text-xs font-mono text-blue-700 hover:underline">
            sitemap.xml
          </a>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-3">
          <div>
            <h2 className="text-sm font-semibold text-zinc-950">1. Workspace</h2>
            <ul className="mt-3 space-y-3 text-sm">
              <li>
                <a href="#parametric" className="font-medium text-zinc-900 hover:text-blue-700">Parametric Modeling</a>
                <ul className="mt-1.5 ml-3 border-l border-zinc-300 pl-3 space-y-1 text-xs text-zinc-600">
                  <li><a href="#sketcher" className="hover:text-zinc-950">Constraint Sketcher</a></li>
                  <li><a href="#assemblies" className="hover:text-zinc-950">Mating Assemblies</a></li>
                  <li><a href="#sheet-metal" className="hover:text-zinc-950">Sheet Metal Bends</a></li>
                </ul>
              </li>
              <li>
                <a href="#drafting" className="font-medium text-zinc-900 hover:text-blue-700">2D Drawings &amp; GD&amp;T</a>
                <ul className="mt-1.5 ml-3 border-l border-zinc-300 pl-3 space-y-1 text-xs text-zinc-600">
                  <li><a href="#bom" className="hover:text-zinc-950">Automated BOM</a></li>
                  <li><a href="#step" className="hover:text-zinc-950">STEP / IGES Export</a></li>
                </ul>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-zinc-950">2. Engineering</h2>
            <ul className="mt-3 space-y-3 text-sm">
              <li>
                <a href="#simulation" className="font-medium text-zinc-900 hover:text-blue-700">Finite Element Analysis</a>
                <ul className="mt-1.5 ml-3 border-l border-zinc-300 pl-3 space-y-1 text-xs text-zinc-600">
                  <li><a href="#thermal" className="hover:text-zinc-950">Thermal Loads</a></li>
                  <li><a href="#modal" className="hover:text-zinc-950">Modal Vibration</a></li>
                  <li><a href="#fatigue" className="hover:text-zinc-950">Cycle Fatigue</a></li>
                </ul>
              </li>
              <li>
                <a href="#pdm" className="font-medium text-zinc-900 hover:text-blue-700">Revision Control (PDM)</a>
                <ul className="mt-1.5 ml-3 border-l border-zinc-300 pl-3 space-y-1 text-xs text-zinc-600">
                  <li><a href="#branching" className="hover:text-zinc-950">Design Branching</a></li>
                  <li><a href="#eco" className="hover:text-zinc-950">ECO Approvals</a></li>
                </ul>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-zinc-950">3. Governance</h2>
            <ul className="mt-3 space-y-3 text-sm">
              <li>
                <a href="#compliance" className="font-medium text-zinc-900 hover:text-blue-700">Security &amp; ITAR</a>
                <ul className="mt-1.5 ml-3 border-l border-zinc-300 pl-3 space-y-1 text-xs text-zinc-600">
                  <li><a href="#fedramp" className="hover:text-zinc-950">GovCloud Isolation</a></li>
                  <li><a href="#sso" className="hover:text-zinc-950">SAML Single Sign-On</a></li>
                  <li><a href="#audit-logs" className="hover:text-zinc-950">Immutable Audit Logs</a></li>
                </ul>
              </li>
              <li>
                <a href="#licensing" className="font-medium text-zinc-900 hover:text-blue-700">Licensing &amp; Legal</a>
                <ul className="mt-1.5 ml-3 border-l border-zinc-300 pl-3 space-y-1 text-xs text-zinc-600">
                  <li><a href="#academic" className="hover:text-zinc-950">Academic Seats</a></li>
                  <li><a href="#eula" className="hover:text-zinc-950">Enterprise EULA</a></li>
                </ul>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-zinc-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs text-zinc-500">
          <p>© 2026 Draftboard CAD Inc.</p>
          <p>ISO 10303 Compliant Exports</p>
        </div>
      </div>
    </footer>
  );
}

export function Footer20() {
  const [country, setCountry] = useState('United States');
  const [currency, setCurrency] = useState('USD $');

  return (
    <footer className="bg-neutral-950 text-neutral-300 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-6 py-16 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-white">Objects</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><a href="#lighting" className="hover:text-white transition-colors">Desk Lighting</a></li>
              <li><a href="#seating" className="hover:text-white transition-colors">Modular Seating</a></li>
              <li><a href="#glassware" className="hover:text-white transition-colors">Borosilicate Glass</a></li>
              <li><a href="#textiles" className="hover:text-white transition-colors">Woven Throws</a></li>
            </ul>
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-white">Designers</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><a href="#roster" className="hover:text-white transition-colors">Studio Roster</a></li>
              <li><a href="#editions" className="hover:text-white transition-colors">Numbered Editions</a></li>
              <li><a href="#exhibitions" className="hover:text-white transition-colors">Milan Exhibition</a></li>
              <li><a href="#archives" className="hover:text-white transition-colors">Past Catalogs</a></li>
            </ul>
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-white">Client Services</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><a href="#shipping" className="hover:text-white transition-colors">White-Glove Delivery</a></li>
              <li><a href="#trade" className="hover:text-white transition-colors">Architect Trade Program</a></li>
              <li><a href="#warranty" className="hover:text-white transition-colors">5-Year Guarantee</a></li>
              <li><a href="#returns" className="hover:text-white transition-colors">Returns &amp; Exchanges</a></li>
            </ul>
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-white">Showrooms</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><a href="#cph" className="hover:text-white transition-colors">Copenhagen</a></li>
              <li><a href="#nyc" className="hover:text-white transition-colors">New York SoHo</a></li>
              <li><a href="#tokyo" className="hover:text-white transition-colors">Tokyo Aoyama</a></li>
              <li><a href="#london" className="hover:text-white transition-colors">London Shoreditch</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-neutral-800 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label htmlFor="fo-country" className="text-xs text-neutral-400">Ship to</label>
              <select
                id="fo-country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="rounded border border-neutral-700 bg-neutral-900 px-2.5 py-1.5 text-xs text-white focus:border-white focus:outline-none"
              >
                <option value="United States">United States</option>
                <option value="Denmark">Denmark</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Japan">Japan</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="fo-currency" className="text-xs text-neutral-400">Currency</label>
              <select
                id="fo-currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="rounded border border-neutral-700 bg-neutral-900 px-2.5 py-1.5 text-xs text-white focus:border-white focus:outline-none"
              >
                <option value="USD $">USD $</option>
                <option value="DKK kr">DKK kr</option>
                <option value="GBP £">GBP £</option>
                <option value="JPY ¥">JPY ¥</option>
              </select>
            </div>
            <span className="text-xs text-neutral-500">
              Duties calculated for {country} ({currency})
            </span>
          </div>

          <div className="flex items-center gap-3" aria-label="Accepted payment methods">
            <svg className="h-6 w-10 text-neutral-300" viewBox="0 0 40 24" fill="none" aria-label="Visa">
              <rect x="0.5" y="0.5" width="39" height="23" rx="3.5" stroke="currentColor" strokeOpacity="0.3" />
              <text x="20" y="15" textAnchor="middle" fill="currentColor" fontSize="8" fontWeight="700" fontFamily="sans-serif">VISA</text>
            </svg>
            <svg className="h-6 w-10 text-neutral-300" viewBox="0 0 40 24" fill="none" aria-label="Mastercard">
              <rect x="0.5" y="0.5" width="39" height="23" rx="3.5" stroke="currentColor" strokeOpacity="0.3" />
              <circle cx="16" cy="12" r="5" fill="#EB001B" fillOpacity="0.85" />
              <circle cx="24" cy="12" r="5" fill="#F79E1B" fillOpacity="0.85" />
            </svg>
            <svg className="h-6 w-10 text-neutral-300" viewBox="0 0 40 24" fill="none" aria-label="Apple Pay">
              <rect x="0.5" y="0.5" width="39" height="23" rx="3.5" stroke="currentColor" strokeOpacity="0.3" />
              <text x="20" y="15" textAnchor="middle" fill="currentColor" fontSize="7" fontWeight="600" fontFamily="sans-serif">Pay</text>
            </svg>
          </div>
        </div>

        <p className="mt-6 text-xs text-neutral-500">© 2026 Forma Objects ApS. All rights reserved.</p>
      </div>
    </footer>
  );
}
