import React, { useState } from 'react';

export function Footer1() {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6 py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4 space-y-5">
            <a href="#vellum" className="inline-flex items-center gap-3 text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-400">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500 text-slate-950 font-bold text-lg tracking-tight">
                V
              </span>
              <span className="text-lg font-semibold tracking-tight">Vellum Cloud</span>
            </a>
            <p className="text-sm leading-relaxed text-slate-400 max-w-xs">
              Deterministic compute clusters, zero-egress object storage, and private mesh networking for engineering teams.
            </p>
            <p className="text-xs text-slate-500">Frankfurt · Ashburn · Tokyo</p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-8">
            <div>
              <h2 className="text-xs font-semibold tracking-wider text-white uppercase">Platform</h2>
              <ul className="mt-4 space-y-3 text-sm">
                <li><a href="#compute" className="hover:text-white transition-colors">Elastic Compute</a></li>
                <li><a href="#storage" className="hover:text-white transition-colors">Block Storage</a></li>
                <li><a href="#mesh" className="hover:text-white transition-colors">Private Mesh</a></li>
                <li><a href="#registry" className="hover:text-white transition-colors">Container Registry</a></li>
              </ul>
            </div>
            <div>
              <h2 className="text-xs font-semibold tracking-wider text-white uppercase">Solutions</h2>
              <ul className="mt-4 space-y-3 text-sm">
                <li><a href="#inference" className="hover:text-white transition-colors">Batch Inference</a></li>
                <li><a href="#fintech" className="hover:text-white transition-colors">Financial Ledgers</a></li>
                <li><a href="#multi-region" className="hover:text-white transition-colors">Multi-Region Failover</a></li>
                <li><a href="#compliance" className="hover:text-white transition-colors">EU Data Residency</a></li>
              </ul>
            </div>
            <div>
              <h2 className="text-xs font-semibold tracking-wider text-white uppercase">Developers</h2>
              <ul className="mt-4 space-y-3 text-sm">
                <li><a href="#docs" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#cli" className="hover:text-white transition-colors">CLI Reference</a></li>
                <li><a href="#terraform" className="hover:text-white transition-colors">Terraform Provider</a></li>
                <li><a href="#changelog" className="hover:text-white transition-colors">Release Notes</a></li>
              </ul>
            </div>
            <div>
              <h2 className="text-xs font-semibold tracking-wider text-white uppercase">Company</h2>
              <ul className="mt-4 space-y-3 text-sm">
                <li><a href="#about" className="hover:text-white transition-colors">About Vellum</a></li>
                <li><a href="#security" className="hover:text-white transition-colors">Security Whitepaper</a></li>
                <li><a href="#careers" className="hover:text-white transition-colors">Open Roles</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Contact Sales</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-slate-800/80 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-xs text-slate-400">
          <p>© 2026 Vellum Cloud Inc. All rights reserved.</p>
          <ul className="flex flex-wrap items-center gap-6">
            <li><a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
            <li><a href="#terms" className="hover:text-white transition-colors">Terms of Service</a></li>
            <li><a href="#sla" className="hover:text-white transition-colors">SLA Agreement</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

export function Footer2() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'error' | 'success'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed)) {
      setStatus('error');
      setMessage('Enter a valid email address to subscribe.');
      return;
    }
    setStatus('success');
    setMessage(`Confirmed: ${trimmed} added to the Sunday Dispatch.`);
    setEmail('');
  };

  return (
    <footer className="bg-[#FAFAF8] text-zinc-800 border-t border-zinc-200">
      <div className="max-w-7xl mx-auto px-6 py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 pb-14 border-b border-zinc-200">
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center border border-zinc-900 text-zinc-900 font-serif font-bold text-xl">
                K
              </span>
              <span className="font-serif text-xl font-semibold tracking-tight text-zinc-950">Kestrel Press</span>
            </div>
            <h2 className="font-serif text-2xl font-medium tracking-tight text-zinc-950 max-w-md">
              Long-form essays on architecture, urban craft, and material history.
            </h2>
            <p className="text-sm text-zinc-600 max-w-md">
              Delivered every Sunday morning. Zero syndication, zero trackers.
            </p>
            <form onSubmit={handleSubmit} className="pt-2 max-w-md" noValidate>
              <label htmlFor="kestrel-email" className="sr-only">Email address</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  id="kestrel-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status !== 'idle') setStatus('idle');
                  }}
                  placeholder="reader@domain.com"
                  className="flex-1 rounded-md border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Subscribe
                </button>
              </div>
              {status !== 'idle' && (
                <p className={`mt-2 text-xs ${status === 'error' ? 'text-red-700' : 'text-emerald-800'}`} role="status">
                  {message}
                </p>
              )}
            </form>
          </div>

          <div className="lg:col-span-7 grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-5">
            <div>
              <h3 className="text-xs font-semibold tracking-wider text-zinc-950 uppercase">Editions</h3>
              <ul className="mt-4 space-y-2.5 text-sm text-zinc-600">
                <li><a href="#issue-48" className="hover:text-zinc-950 transition-colors">Issue 48</a></li>
                <li><a href="#monographs" className="hover:text-zinc-950 transition-colors">Monographs</a></li>
                <li><a href="#print" className="hover:text-zinc-950 transition-colors">Print Archive</a></li>
                <li><a href="#anthology" className="hover:text-zinc-950 transition-colors">Annual Index</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold tracking-wider text-zinc-950 uppercase">Topics</h3>
              <ul className="mt-4 space-y-2.5 text-sm text-zinc-600">
                <li><a href="#civic" className="hover:text-zinc-950 transition-colors">Civic Space</a></li>
                <li><a href="#timber" className="hover:text-zinc-950 transition-colors">Mass Timber</a></li>
                <li><a href="#transit" className="hover:text-zinc-950 transition-colors">Rail &amp; Transit</a></li>
                <li><a href="#type" className="hover:text-zinc-950 transition-colors">Typography</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold tracking-wider text-zinc-950 uppercase">Readers</h3>
              <ul className="mt-4 space-y-2.5 text-sm text-zinc-600">
                <li><a href="#membership" className="hover:text-zinc-950 transition-colors">Membership</a></li>
                <li><a href="#gift" className="hover:text-zinc-950 transition-colors">Gift Copies</a></li>
                <li><a href="#libraries" className="hover:text-zinc-950 transition-colors">Libraries</a></li>
                <li><a href="#stockists" className="hover:text-zinc-950 transition-colors">Stockists</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold tracking-wider text-zinc-950 uppercase">Editorial</h3>
              <ul className="mt-4 space-y-2.5 text-sm text-zinc-600">
                <li><a href="#mast" className="hover:text-zinc-950 transition-colors">Masthead</a></li>
                <li><a href="#pitch" className="hover:text-zinc-950 transition-colors">Submissions</a></li>
                <li><a href="#corrections" className="hover:text-zinc-950 transition-colors">Corrections</a></li>
                <li><a href="#ethics" className="hover:text-zinc-950 transition-colors">Standards</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold tracking-wider text-zinc-950 uppercase">Feeds</h3>
              <ul className="mt-4 space-y-2.5 text-sm text-zinc-600">
                <li><a href="#rss" className="hover:text-zinc-950 transition-colors">Full RSS</a></li>
                <li><a href="#json-feed" className="hover:text-zinc-950 transition-colors">JSON Feed</a></li>
                <li><a href="#podcast" className="hover:text-zinc-950 transition-colors">Audio Essays</a></li>
                <li><a href="#colophon" className="hover:text-zinc-950 transition-colors">Colophon</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs text-zinc-500">
          <p>© 2026 Kestrel Press Ltd. Published in Edinburgh &amp; Toronto.</p>
          <ul className="flex flex-wrap gap-6">
            <li><a href="#privacy" className="hover:text-zinc-900">Privacy</a></li>
            <li><a href="#terms" className="hover:text-zinc-900">Terms</a></li>
            <li><a href="#issn" className="hover:text-zinc-900">ISSN 2754-8910</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

export function Footer3() {
  return (
    <footer className="bg-white text-zinc-700 border-t border-zinc-200">
      <div className="max-w-7xl mx-auto px-6 py-7 lg:px-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <a href="#monolith" className="inline-flex items-center gap-2.5 text-zinc-950 font-semibold tracking-tight">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded border border-zinc-900 text-xs font-bold">
              M
            </span>
            <span>Monolith Studio</span>
          </a>
          <span className="text-zinc-300" aria-hidden="true">/</span>
          <span className="text-xs text-zinc-500">© 2026</span>
        </div>

        <nav aria-label="Footer navigation">
          <h2 className="sr-only">Site links</h2>
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-zinc-600">
            <li><a href="#work" className="hover:text-zinc-950 transition-colors">Selected Work</a></li>
            <li><a href="#objects" className="hover:text-zinc-950 transition-colors">Objects</a></li>
            <li><a href="#practice" className="hover:text-zinc-950 transition-colors">Practice</a></li>
            <li><a href="#journal" className="hover:text-zinc-950 transition-colors">Journal</a></li>
            <li><a href="#imprint" className="hover:text-zinc-950 transition-colors">Imprint</a></li>
          </ul>
        </nav>

        <ul className="flex items-center gap-3">
          <li>
            <a href="#x" aria-label="Monolith on X" className="inline-flex h-9 w-9 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950 transition-colors">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </li>
          <li>
            <a href="#github" aria-label="Monolith on GitHub" className="inline-flex h-9 w-9 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950 transition-colors">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}

export function Footer4() {
  const [copiedCmd, setCopiedCmd] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText('npx gridline-cli init').catch(() => {});
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 1800);
  };

  return (
    <footer className="bg-zinc-950 text-zinc-300 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-6 py-14 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-10 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded border border-emerald-500/40 bg-emerald-950/50 font-mono text-xs font-semibold text-emerald-400">
              GS
            </span>
            <div>
              <p className="text-sm font-semibold text-white">Gridline Systems</p>
              <p className="text-xs text-zinc-400">Root sitemap directory</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-3 rounded-md border border-zinc-800 bg-zinc-900 px-3.5 py-2 font-mono text-xs text-zinc-200 hover:border-zinc-700 transition-colors cursor-pointer self-start md:self-auto"
          >
            <span className="text-emerald-400">$</span>
            <span>npx gridline-cli init</span>
            <span className="text-zinc-400">{copiedCmd ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h2 className="font-mono text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              /products
            </h2>
            <ul className="mt-4 border-l border-zinc-800 pl-4 space-y-2.5 text-sm">
              <li className="relative before:content-[''] before:absolute before:-left-4 before:top-2.5 before:w-2.5 before:h-px before:bg-zinc-700">
                <a href="#telemetry" className="hover:text-white transition-colors">Telemetry Core</a>
              </li>
              <li className="relative before:content-[''] before:absolute before:-left-4 before:top-2.5 before:w-2.5 before:h-px before:bg-zinc-700">
                <a href="#tracing" className="hover:text-white transition-colors">Distributed Tracing</a>
              </li>
              <li className="relative before:content-[''] before:absolute before:-left-4 before:top-2.5 before:w-2.5 before:h-px before:bg-zinc-700">
                <a href="#logs" className="hover:text-white transition-colors">Structured Log Vault</a>
              </li>
              <li className="relative before:content-[''] before:absolute before:-left-4 before:top-2.5 before:w-2.5 before:h-px before:bg-zinc-700">
                <a href="#alerts" className="hover:text-white transition-colors">Incident Routing</a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-mono text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              /documentation
            </h2>
            <ul className="mt-4 border-l border-zinc-800 pl-4 space-y-2.5 text-sm">
              <li className="relative before:content-[''] before:absolute before:-left-4 before:top-2.5 before:w-2.5 before:h-px before:bg-zinc-700">
                <a href="#quickstart" className="hover:text-white transition-colors">Quickstart Guide</a>
              </li>
              <li className="relative before:content-[''] before:absolute before:-left-4 before:top-2.5 before:w-2.5 before:h-px before:bg-zinc-700">
                <a href="#sdk-ts" className="hover:text-white transition-colors">TypeScript SDK</a>
              </li>
              <li className="relative before:content-[''] before:absolute before:-left-4 before:top-2.5 before:w-2.5 before:h-px before:bg-zinc-700">
                <a href="#sdk-go" className="hover:text-white transition-colors">Go &amp; Rust Agents</a>
              </li>
              <li className="relative before:content-[''] before:absolute before:-left-4 before:top-2.5 before:w-2.5 before:h-px before:bg-zinc-700">
                <a href="#webhooks" className="hover:text-white transition-colors">Webhook Schemas</a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-mono text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              /resources
            </h2>
            <ul className="mt-4 border-l border-zinc-800 pl-4 space-y-2.5 text-sm">
              <li className="relative before:content-[''] before:absolute before:-left-4 before:top-2.5 before:w-2.5 before:h-px before:bg-zinc-700">
                <a href="#benchmarks" className="hover:text-white transition-colors">Ingestion Benchmarks</a>
              </li>
              <li className="relative before:content-[''] before:absolute before:-left-4 before:top-2.5 before:w-2.5 before:h-px before:bg-zinc-700">
                <a href="#architecture" className="hover:text-white transition-colors">Storage Internals</a>
              </li>
              <li className="relative before:content-[''] before:absolute before:-left-4 before:top-2.5 before:w-2.5 before:h-px before:bg-zinc-700">
                <a href="#community" className="hover:text-white transition-colors">Engineering Blog</a>
              </li>
              <li className="relative before:content-[''] before:absolute before:-left-4 before:top-2.5 before:w-2.5 before:h-px before:bg-zinc-700">
                <a href="#open-source" className="hover:text-white transition-colors">Open Source</a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-mono text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              /governance
            </h2>
            <ul className="mt-4 border-l border-zinc-800 pl-4 space-y-2.5 text-sm">
              <li className="relative before:content-[''] before:absolute before:-left-4 before:top-2.5 before:w-2.5 before:h-px before:bg-zinc-700">
                <a href="#security" className="hover:text-white transition-colors">Security Policy</a>
              </li>
              <li className="relative before:content-[''] before:absolute before:-left-4 before:top-2.5 before:w-2.5 before:h-px before:bg-zinc-700">
                <a href="#subprocessors" className="hover:text-white transition-colors">Subprocessors</a>
              </li>
              <li className="relative before:content-[''] before:absolute before:-left-4 before:top-2.5 before:w-2.5 before:h-px before:bg-zinc-700">
                <a href="#dpa" className="hover:text-white transition-colors">Data Processing Addendum</a>
              </li>
              <li className="relative before:content-[''] before:absolute before:-left-4 before:top-2.5 before:w-2.5 before:h-px before:bg-zinc-700">
                <a href="#privacy" className="hover:text-white transition-colors">Privacy Notice</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-zinc-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-zinc-500">
          <p>© 2026 Gridline Systems Inc.</p>
          <p className="font-mono">San Francisco · Zurich</p>
        </div>
      </div>
    </footer>
  );
}

export function Footer5() {
  return (
    <footer className="bg-indigo-950 text-indigo-100">
      <div className="max-w-7xl mx-auto px-6 py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4 space-y-6">
            <a href="#tempo" className="inline-flex items-center gap-3 text-white">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 text-white font-bold text-lg">
                T
              </span>
              <span className="text-xl font-semibold tracking-tight">Tempo Health</span>
            </a>
            <p className="text-sm text-indigo-200/80 leading-relaxed max-w-xs">
              Daily metabolic tracking, recovery scores, and clinician-reviewed biomarker reports in your pocket.
            </p>

            <div className="space-y-2.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-300">Get the mobile app</p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="#ios-app"
                  className="inline-flex items-center gap-2.5 rounded-lg border border-indigo-700/80 bg-indigo-900/70 px-3.5 py-2 text-white hover:bg-indigo-800 transition-colors"
                >
                  <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.33c.64-.78 1.08-1.86.96-2.94-.93.04-2.06.62-2.72 1.4-.58.68-1.1 1.78-.96 2.84 1.04.08 2.08-.52 2.72-1.3" />
                  </svg>
                  <span className="text-left leading-tight">
                    <span className="block text-[10px] text-indigo-200">Download on the</span>
                    <span className="block text-xs font-semibold">App Store</span>
                  </span>
                </a>
                <a
                  href="#android-app"
                  className="inline-flex items-center gap-2.5 rounded-lg border border-indigo-700/80 bg-indigo-900/70 px-3.5 py-2 text-white hover:bg-indigo-800 transition-colors"
                >
                  <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M3.61 1.814L13.793 12 3.61 22.186a1.47 1.47 0 01-.36-.98V2.794c0-.373.133-.72.36-.98zm11.24 11.242l2.634 2.634-9.847 5.603 7.213-8.237zm3.671-2.09l2.464 1.402c.68.387.68 1.277 0 1.664l-2.464 1.402-2.834-2.234 2.834-2.234zM7.637 2.707l9.847 5.603-2.634 2.634-7.213-8.237z" />
                  </svg>
                  <span className="text-left leading-tight">
                    <span className="block text-[10px] text-indigo-200">Get it on</span>
                    <span className="block text-xs font-semibold">Google Play</span>
                  </span>
                </a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-indigo-300">Membership</h2>
              <ul className="mt-4 space-y-3 text-sm">
                <li><a href="#plans" className="hover:text-white transition-colors">Individual Plans</a></li>
                <li><a href="#clinicians" className="hover:text-white transition-colors">For Clinicians</a></li>
                <li><a href="#wearables" className="hover:text-white transition-colors">Wearable Sync</a></li>
                <li><a href="#labs" className="hover:text-white transition-colors">Lab Integrations</a></li>
              </ul>
            </div>
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-indigo-300">Science</h2>
              <ul className="mt-4 space-y-3 text-sm">
                <li><a href="#validation" className="hover:text-white transition-colors">Clinical Trials</a></li>
                <li><a href="#board" className="hover:text-white transition-colors">Medical Board</a></li>
                <li><a href="#research" className="hover:text-white transition-colors">Published Papers</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">Methodology FAQ</a></li>
              </ul>
            </div>
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-indigo-300">Support</h2>
              <ul className="mt-4 space-y-3 text-sm">
                <li><a href="#help" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#privacy" className="hover:text-white transition-colors">HIPAA &amp; Privacy</a></li>
                <li><a href="#accessibility" className="hover:text-white transition-colors">Accessibility</a></li>
                <li><a href="#press" className="hover:text-white transition-colors">Press Inquiries</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-indigo-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-xs text-indigo-300">© 2026 Tempo Health Labs Inc.</p>
          <ul className="flex items-center gap-4">
            <li>
              <a href="#instagram" aria-label="Tempo Health on Instagram" className="text-indigo-300 hover:text-white transition-colors">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
              </a>
            </li>
            <li>
              <a href="#linkedin" aria-label="Tempo Health on LinkedIn" className="text-indigo-300 hover:text-white transition-colors">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                </svg>
              </a>
            </li>
            <li>
              <a href="#youtube" aria-label="Tempo Health on YouTube" className="text-indigo-300 hover:text-white transition-colors">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

export function Footer6() {
  return (
    <footer className="bg-slate-50 text-slate-700 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-6 py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5 text-slate-950">
              <span className="inline-flex h-8 w-8 items-center justify-center bg-slate-900 text-white font-serif text-sm font-semibold">
                HR
              </span>
              <span className="font-serif text-lg font-semibold">Harbor &amp; Reed LLP</span>
            </div>
            <p className="mt-4 text-sm text-slate-600 leading-relaxed">
              Cross-border corporate counsel, regulatory advisory, and intellectual property litigation.
            </p>
            <h2 className="mt-6 text-xs font-semibold uppercase tracking-wider text-slate-900">Practices</h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li><a href="#ma" className="hover:text-slate-950 transition-colors">Mergers &amp; Acquisitions</a></li>
              <li><a href="#antitrust" className="hover:text-slate-950 transition-colors">Competition &amp; Antitrust</a></li>
              <li><a href="#ip" className="hover:text-slate-950 transition-colors">Patent Litigation</a></li>
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-900">The Firm</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><a href="#partners" className="hover:text-slate-950 transition-colors">Partners &amp; Counsel</a></li>
              <li><a href="#probono" className="hover:text-slate-950 transition-colors">Pro Bono Charter</a></li>
              <li><a href="#associates" className="hover:text-slate-950 transition-colors">Associate Careers</a></li>
              <li><a href="#alumni" className="hover:text-slate-950 transition-colors">Alumni Network</a></li>
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-900">Insights</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><a href="#briefings" className="hover:text-slate-950 transition-colors">Regulatory Briefings</a></li>
              <li><a href="#alerts" className="hover:text-slate-950 transition-colors">Client Alerts</a></li>
              <li><a href="#events" className="hover:text-slate-950 transition-colors">Seminars &amp; Webinars</a></li>
              <li><a href="#publications" className="hover:text-slate-950 transition-colors">Annual Review 2026</a></li>
            </ul>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-900">Direct Contact</h2>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <span className="block text-xs font-medium text-slate-500">New York Office</span>
                <span>450 Lexington Ave, Suite 2100</span>
              </li>
              <li>
                <span className="block text-xs font-medium text-slate-500">Zurich Office</span>
                <span>Bahnhofstrasse 71, 8001 Zurich</span>
              </li>
              <li>
                <span className="block text-xs font-medium text-slate-500">Telephone &amp; Desk</span>
                <a href="#tel" className="text-slate-950 font-medium hover:underline">+1 (212) 555-0194</a>
              </li>
              <li>
                <span className="block text-xs font-medium text-slate-500">General Inquiries</span>
                <a href="#email" className="text-blue-700 hover:underline">counsel@harborreed.example</a>
              </li>
              <li className="text-xs text-slate-500 pt-1">Mon–Fri, 08:30–19:00 EST / CET</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 Harbor &amp; Reed LLP. Attorney Advertising.</p>
          <ul className="flex flex-wrap gap-6">
            <li><a href="#legal-notices" className="hover:text-slate-900">Legal Notices</a></li>
            <li><a href="#regulatory" className="hover:text-slate-900">Bar Admissions</a></li>
            <li><a href="#privacy" className="hover:text-slate-900">Client Privacy</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

export function Footer7() {
  const [booked, setBooked] = useState(false);

  return (
    <footer className="bg-zinc-900 text-zinc-300">
      <div className="max-w-7xl mx-auto px-6 py-16 lg:px-8">
        <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-8 sm:p-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
              Ready to automate your assembly cell?
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              Walk through cycle-time telemetry and floor layouts with an Arcway robotics applications engineer.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setBooked(true)}
              className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-500 transition-colors whitespace-nowrap cursor-pointer"
            >
              {booked ? 'Demo Request Logged' : 'Schedule Cell Demo'}
            </button>
            <a
              href="#specs"
              className="rounded-lg border border-zinc-700 px-5 py-3 text-sm font-medium text-zinc-200 hover:border-zinc-500 hover:text-white transition-colors whitespace-nowrap"
            >
              View Spec Sheets
            </a>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white">Hardware</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><a href="#arms" className="hover:text-white transition-colors">6-Axis Actuators</a></li>
              <li><a href="#vision" className="hover:text-white transition-colors">Stereo Vision</a></li>
              <li><a href="#grippers" className="hover:text-white transition-colors">Servo Grippers</a></li>
              <li><a href="#controllers" className="hover:text-white transition-colors">Safety PLC</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white">Software</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><a href="#planner" className="hover:text-white transition-colors">Path Planner</a></li>
              <li><a href="#twin" className="hover:text-white transition-colors">Digital Twin</a></li>
              <li><a href="#fleet" className="hover:text-white transition-colors">Fleet Diagnostics</a></li>
              <li><a href="#ros" className="hover:text-white transition-colors">ROS 2 Bridge</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white">Industries</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><a href="#automotive" className="hover:text-white transition-colors">EV Battery Assembly</a></li>
              <li><a href="#medtech" className="hover:text-white transition-colors">Cleanroom MedTech</a></li>
              <li><a href="#electronics" className="hover:text-white transition-colors">PCB Inspection</a></li>
              <li><a href="#logistics" className="hover:text-white transition-colors">Palletizing</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white">Company</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><a href="#factory" className="hover:text-white transition-colors">Detroit Facility</a></li>
              <li><a href="#iso" className="hover:text-white transition-colors">ISO 10218 Safety</a></li>
              <li><a href="#partners" className="hover:text-white transition-colors">Integrators</a></li>
              <li><a href="#careers" className="hover:text-white transition-colors">Careers</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs text-zinc-400">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-blue-600 text-white font-bold text-xs">A</span>
            <span>© 2026 Arcway Robotics Corp.</span>
          </div>
          <ul className="flex flex-wrap gap-6">
            <li><a href="#compliance" className="hover:text-white">CE &amp; UL Compliance</a></li>
            <li><a href="#privacy" className="hover:text-white">Privacy</a></li>
            <li><a href="#terms" className="hover:text-white">Terms</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

export function Footer8() {
  return (
    <footer className="bg-white text-stone-700 border-t border-stone-200">
      <div className="max-w-7xl mx-auto px-6 py-16 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:justify-between gap-12">
          <div className="max-w-sm space-y-4">
            <a href="#oslo" className="inline-flex items-center gap-3 text-stone-950">
              <span className="inline-flex h-11 w-11 items-center justify-center border-2 border-stone-900 font-semibold text-sm tracking-widest">
                OC
              </span>
              <span className="text-lg font-medium tracking-tight">Oslo Ceramics</span>
            </a>
            <p className="text-sm leading-relaxed text-stone-600">
              Wheel-thrown stoneware and reduction-fired tableware shaped in small seasonal batches in Grünerløkka.
            </p>
            <p className="text-xs text-stone-500">Showroom open Wed–Sat, 11:00–17:00</p>
          </div>

          <div className="grid grid-cols-1 gap-10 sm:grid-cols-3 lg:gap-16">
            <div>
              <h2 className="text-sm font-semibold text-stone-950">Collections</h2>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li><a href="#tableware" className="hover:text-stone-950 transition-colors">Daily Tableware</a></li>
                <li><a href="#vessels" className="hover:text-stone-950 transition-colors">Architectural Vessels</a></li>
                <li><a href="#tea" className="hover:text-stone-950 transition-colors">Tea &amp; Pour-Over</a></li>
                <li><a href="#seconds" className="hover:text-stone-950 transition-colors">Kiln Seconds</a></li>
              </ul>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-stone-950">Atelier</h2>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li><a href="#kiln" className="hover:text-stone-950 transition-colors">Clay &amp; Glazes</a></li>
                <li><a href="#workshops" className="hover:text-stone-950 transition-colors">Wheel Workshops</a></li>
                <li><a href="#hospitality" className="hover:text-stone-950 transition-colors">Restaurant Trade</a></li>
                <li><a href="#visit" className="hover:text-stone-950 transition-colors">Visit Studio</a></li>
              </ul>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-stone-950">Care &amp; Orders</h2>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li><a href="#care" className="hover:text-stone-950 transition-colors">Stoneware Care</a></li>
                <li><a href="#shipping" className="hover:text-stone-950 transition-colors">Crating &amp; Shipping</a></li>
                <li><a href="#returns" className="hover:text-stone-950 transition-colors">Returns Policy</a></li>
                <li><a href="#contact" className="hover:text-stone-950 transition-colors">Customer Desk</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-14 pt-6 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs text-stone-500">
          <p>© 2026 Oslo Ceramics AS. Thorvald Meyers gate 42.</p>
          <ul className="flex gap-6">
            <li><a href="#privacy" className="hover:text-stone-900">Privacy</a></li>
            <li><a href="#terms" className="hover:text-stone-900">Terms</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

export function Footer9() {
  const [language, setLanguage] = useState('en-US');
  const [currency, setCurrency] = useState('USD');

  const localeLabels: Record<string, string> = {
    'en-US': 'English (United States)',
    de: 'Deutsch (DACH)',
    fr: 'Français (EU)',
    ja: '日本語 (Japan)',
  };

  return (
    <footer className="bg-slate-100 text-slate-700 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-6 py-16 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 pb-12 border-b border-slate-200">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-950">Treasury</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><a href="#accounts" className="hover:text-slate-950 transition-colors">Operating Accounts</a></li>
              <li><a href="#fx" className="hover:text-slate-950 transition-colors">Multi-Currency FX</a></li>
              <li><a href="#sweep" className="hover:text-slate-950 transition-colors">Automated Sweeps</a></li>
              <li><a href="#cards" className="hover:text-slate-950 transition-colors">Corporate Cards</a></li>
            </ul>
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-950">Integrations</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><a href="#netsuite" className="hover:text-slate-950 transition-colors">NetSuite Sync</a></li>
              <li><a href="#xero" className="hover:text-slate-950 transition-colors">Xero &amp; QuickBooks</a></li>
              <li><a href="#api" className="hover:text-slate-950 transition-colors">ISO 20022 API</a></li>
              <li><a href="#webhooks" className="hover:text-slate-950 transition-colors">Reconciliation Hooks</a></li>
            </ul>
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-950">Governance</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><a href="#audit" className="hover:text-slate-950 transition-colors">SOC 2 Type II</a></li>
              <li><a href="#fdic" className="hover:text-slate-950 transition-colors">Custody Disclosures</a></li>
              <li><a href="#aml" className="hover:text-slate-950 transition-colors">AML Compliance</a></li>
              <li><a href="#security" className="hover:text-slate-950 transition-colors">Security Portal</a></li>
            </ul>
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-950">Company</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><a href="#about" className="hover:text-slate-950 transition-colors">About Ledgerflow</a></li>
              <li><a href="#customers" className="hover:text-slate-950 transition-colors">Case Studies</a></li>
              <li><a href="#careers" className="hover:text-slate-950 transition-colors">Careers</a></li>
              <li><a href="#support" className="hover:text-slate-950 transition-colors">Treasury Desk</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded bg-slate-900 text-white font-bold text-xs">
              LF
            </span>
            <span className="text-sm font-semibold text-slate-950">Ledgerflow Financial</span>
            <span className="text-xs text-slate-500">
              · Active locale: {localeLabels[language]} / {currency}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label htmlFor="lf-lang" className="text-xs font-medium text-slate-600">Language</label>
              <select
                id="lf-lang"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-900 focus:border-blue-600 focus:outline-none"
              >
                <option value="en-US">English (US)</option>
                <option value="de">Deutsch</option>
                <option value="fr">Français</option>
                <option value="ja">日本語</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="lf-curr" className="text-xs font-medium text-slate-600">Currency</label>
              <select
                id="lf-curr"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-900 focus:border-blue-600 focus:outline-none"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
            </div>
          </div>
        </div>

        <p className="mt-6 text-xs text-slate-500 leading-relaxed">
          © 2026 Ledgerflow Technologies Inc. Banking services provided by partner institutions, Members FDIC.
        </p>
      </div>
    </footer>
  );
}

export function Footer10() {
  const [email, setEmail] = useState('');
  const [joined, setJoined] = useState(false);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim().includes('@')) return;
    setJoined(true);
    setEmail('');
  };

  return (
    <footer className="bg-[#FFF1EB] text-[#4A1D12] border-t border-[#F7D6C8]">
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#D94E28] text-white font-serif text-2xl font-bold">
          S
        </div>
        <h2 className="mt-4 font-serif text-2xl font-semibold tracking-tight text-[#331109]">
          Sunnydale Roasters
        </h2>
        <p className="mt-2 text-sm text-[#7C3A29]">
          Small-lot single origins roasted every Tuesday in Portland.
        </p>

        <nav aria-label="Primary footer links" className="mt-8">
          <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm font-medium">
            <li><a href="#beans" className="hover:text-[#D94E28] transition-colors">Single Origins</a></li>
            <li><a href="#subscriptions" className="hover:text-[#D94E28] transition-colors">Coffee Club</a></li>
            <li><a href="#brew-guides" className="hover:text-[#D94E28] transition-colors">Brew Guides</a></li>
            <li><a href="#cafes" className="hover:text-[#D94E28] transition-colors">Our Cafes</a></li>
            <li><a href="#wholesale" className="hover:text-[#D94E28] transition-colors">Wholesale</a></li>
          </ul>
        </nav>

        <form onSubmit={handleJoin} className="mt-8 mx-auto max-w-sm">
          <label htmlFor="sunny-email" className="sr-only">Coffee club email</label>
          <div className="flex gap-2">
            <input
              id="sunny-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setJoined(false);
              }}
              placeholder="you@morningbrew.com"
              className="flex-1 rounded-lg border border-[#E7BFB0] bg-white px-3.5 py-2 text-sm text-[#331109] placeholder:text-[#A36A5A] focus:border-[#D94E28] focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-lg bg-[#D94E28] px-4 py-2 text-sm font-semibold text-white hover:bg-[#BF3F1D] transition-colors whitespace-nowrap cursor-pointer"
            >
              {joined ? 'Joined!' : 'Get Roast Drops'}
            </button>
          </div>
        </form>

        <ul className="mt-8 flex items-center justify-center gap-5">
          <li>
            <a href="#ig" aria-label="Instagram" className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#4A1D12] hover:bg-[#D94E28] hover:text-white transition-colors">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="4" />
              </svg>
            </a>
          </li>
          <li>
            <a href="#yt" aria-label="YouTube" className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#4A1D12] hover:bg-[#D94E28] hover:text-white transition-colors">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M21.8 8s-.2-1.4-.8-2c-.8-.8-1.6-.8-2-.9C16.2 4.9 12 4.9 12 4.9h0s-4.2 0-7 .2c-.4 0-1.2.1-2 .9-.6.6-.8 2-.8 2S2 9.6 2 11.2v1.5c0 1.6.2 3.2.2 3.2s.2 1.4.8 2c.8.8 1.8.8 2.2.9 1.6.2 6.8.2 6.8.2s4.2 0 7-.2c.4 0 1.2-.1 2-.9.6-.6.8-2 .8-2s.2-1.6.2-3.2v-1.5c0-1.6-.2-3.2-.2-3.2zM10 14.5v-5l5 2.5-5 2.5z" />
              </svg>
            </a>
          </li>
        </ul>

        <p className="mt-8 text-xs text-[#7C3A29]">
          © 2026 Sunnydale Roasters Co. · Roasted with 100% solar power
        </p>
      </div>
    </footer>
  );
}
