import { useState } from 'react';
import { Check, ArrowRight } from 'lucide-react';

/* ============================================================================
   Pricing13 — Single Hero Price + Feature List · Minimal / Professional (Monolith)
   ============================================================================ */
export function Pricing13() {
  const [purchased, setPurchased] = useState(false);

  const deliverables = [
    'Full desktop macOS, Windows, and Linux binaries',
    'Local-first SQLite vault with zero cloud lock-in',
    'End-to-end encrypted Git & S3 sync adapters',
    'All future 2.x point releases included',
    'Unlimited workspaces and offline notebooks',
    'Custom Vim/Emacs keymap presets',
    'Instant Markdown, LaTeX, and PDF export',
    '30-day unconditional refund guarantee',
  ];

  return (
    <section aria-labelledby="p13-heading" className="bg-slate-50 py-16 px-6 sm:px-10 text-slate-900">
      <div className="mx-auto max-w-4xl bg-white border border-slate-200 rounded-2xl p-8 sm:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 lg:pr-8 lg:border-r border-slate-200">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Monolith Notes License
            </p>
            <h2
              id="p13-heading"
              className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 [text-wrap:balance]"
            >
              Pay once, own your tools forever
            </h2>
            <div className="mt-6 flex items-baseline gap-2">
              <span className="text-5xl font-bold tracking-tight tabular-nums">$249</span>
              <span className="text-sm text-slate-500">one-time license</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Valid on up to 3 personal machines · No subscription renewals
            </p>
            <button
              type="button"
              onClick={() => setPurchased(true)}
              className="mt-7 w-full py-3 px-5 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <span>Purchase Perpetual License</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="lg:col-span-7">
            <h3 className="text-sm font-semibold text-slate-900">Included in every license</h3>
            <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-sm text-slate-700">
              {deliverables.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 mt-0.5 shrink-0 text-slate-900" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {purchased && (
          <p role="status" className="mt-8 text-sm text-slate-800 bg-slate-100 rounded-lg px-4 py-2.5">
            License key checkout initialized for Monolith Perpetual ($249).
          </p>
        )}
      </div>
    </section>
  );
}

/* ============================================================================
   Pricing14 — Single Hero Price + Feature List · Dark (Nightwatch Error Monitoring)
   ============================================================================ */
export function Pricing14() {
  const [activated, setActivated] = useState(false);

  const specs = [
    'Unlimited engineering seats & GitHub teams',
    'Up to 1,000,000 error events / month included',
    'Source-map symbolication for Vite, Webpack & Rust',
    '90-day stack trace & breadcrumb retention',
    'Slack, Linear, and PagerDuty alert routing',
    'Session replay breadcrumbs with PII scrubbing',
  ];

  return (
    <section aria-labelledby="p14-heading" className="bg-[#0A0C10] py-16 px-6 sm:px-10 text-slate-100">
      <div className="mx-auto max-w-4xl rounded-2xl bg-[#12161F] border border-slate-800 p-8 sm:p-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-800">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-amber-400">
              Nightwatch Telemetry
            </p>
            <h2
              id="p14-heading"
              className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight text-white [text-wrap:balance]"
            >
              One flat rate for your entire engineering org
            </h2>
          </div>

          <div className="shrink-0">
            <div className="flex items-baseline gap-1.5">
              <span className="text-5xl font-mono font-bold text-white tabular-nums">$49</span>
              <span className="text-sm text-slate-400">/ month</span>
            </div>
            <p className="mt-1 text-xs font-mono text-slate-400">Zero per-seat surcharges</p>
          </div>
        </div>

        <ul className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
          {specs.map((spec) => (
            <li key={spec} className="flex items-start gap-2.5">
              <Check className="w-4 h-4 mt-0.5 shrink-0 text-amber-400" />
              <span>{spec}</span>
            </li>
          ))}
        </ul>

        <div className="mt-9 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-slate-800">
          <p className="text-xs text-slate-400">
            14-day full sandbox trial · Switch or cancel in 1 click
          </p>
          <button
            type="button"
            onClick={() => setActivated(true)}
            className="px-6 py-3 rounded-lg bg-amber-400 text-slate-950 text-sm font-semibold hover:bg-amber-300 transition-colors whitespace-nowrap"
          >
            Start 14-day Org Trial
          </button>
        </div>

        {activated && (
          <p
            role="status"
            className="mt-6 text-sm text-amber-200 bg-amber-950/40 border border-amber-800/60 rounded-lg px-4 py-2.5"
          >
            Nightwatch $49/mo org workspace ready for setup.
          </p>
        )}
      </div>
    </section>
  );
}

/* ============================================================================
   Pricing15 — Single Hero Price + Feature List · Light-Warm (Kinfolk Co-op)
   ============================================================================ */
export function Pricing15() {
  const [joined, setJoined] = useState(false);

  const benefits = [
    'Weekly Sunday long-form dispatch on craft & architecture',
    'Complete 6-year digital essay & photography archive',
    'Quarterly print monograph mailed worldwide',
    'Private reader salons in New York, London & Kyoto',
    'Zero programmatic ads or algorithmic tracking',
    'Direct patronage supporting 18 independent contributors',
  ];

  return (
    <section aria-labelledby="p15-heading" className="bg-[#F8F5F0] py-16 px-6 sm:px-10 text-[#231F1A]">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs uppercase tracking-widest text-[#7A6F62]">Kinfolk Reader Cooperative</p>
        <h2
          id="p15-heading"
          className="mt-3 text-3xl sm:text-5xl font-semibold tracking-tight [font-family:var(--font-serif)] [text-wrap:balance]"
        >
          Reader-funded journalism at a single honest price
        </h2>

        <div className="mt-8 py-8 border-y border-[#DFD8CC]">
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-6xl font-semibold tabular-nums [font-family:var(--font-serif)]">
              $18
            </span>
            <span className="text-base text-[#6A6054]">/ month</span>
          </div>
          <p className="mt-2 text-sm text-[#6A6054]">Or $180 billed once annually</p>
        </div>

        <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3.5 text-left text-sm text-[#3A332B]">
          {benefits.map((b) => (
            <li key={b} className="flex items-start gap-2.5">
              <Check className="w-4 h-4 mt-0.5 shrink-0 text-[#5D5244]" />
              <span>{b}</span>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => setJoined(true)}
          className="mt-10 px-8 py-3.5 rounded-lg bg-[#231F1A] text-[#FAF8F4] text-sm font-medium hover:bg-[#3A332B] transition-colors whitespace-nowrap"
        >
          Become a Patron Member
        </button>

        {joined && (
          <p role="status" className="mt-6 text-sm text-[#231F1A] bg-[#EBE4D8] rounded-lg px-4 py-2.5">
            Thank you — Patron Membership ($18/mo) added to your reading pass.
          </p>
        )}
      </div>
    </section>
  );
}

/* ============================================================================
   Pricing16 — Single Hero Price + Feature List · Bold / Colourful (StickerPress)
   ============================================================================ */
export function Pricing16() {
  const [booked, setBooked] = useState(false);

  const items = [
    'Unlimited custom die-cut & holographic runs',
    '48-hour dispatch from Portland print floor',
    'Weatherproof UV-laminated matte vinyl stock',
    'Dedicated print prepress color-matching check',
    'Free split-shipping to up to 5 event venues',
    'Cancel or pause between launch seasons',
  ];

  return (
    <section aria-labelledby="p16-heading" className="bg-emerald-950 py-16 px-6 sm:px-10 text-white">
      <div className="mx-auto max-w-4xl rounded-2xl bg-lime-200 text-slate-950 p-8 sm:p-12 border-2 border-slate-950">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-lg">
            <p className="text-xs font-extrabold uppercase tracking-widest text-emerald-900">
              StickerPress Unlimited Retainer
            </p>
            <h2
              id="p16-heading"
              className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight [text-wrap:balance]"
            >
              Flat-rate custom merch printing for product launches
            </h2>
          </div>

          <div className="bg-emerald-950 text-lime-200 rounded-xl px-6 py-5 shrink-0">
            <div className="text-4xl font-extrabold tabular-nums">$399</div>
            <div className="text-xs font-medium text-lime-100/80">per month · all-inclusive</div>
          </div>
        </div>

        <ul className="mt-8 pt-8 border-t border-emerald-950/20 grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-sm font-semibold">
          {items.map((item) => (
            <li key={item} className="flex items-start gap-2.5">
              <Check className="w-4 h-4 mt-0.5 shrink-0 text-emerald-900" />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">
            3 studio retainer slots open this month
          </span>
          <button
            type="button"
            onClick={() => setBooked(true)}
            className="px-6 py-3 rounded-lg bg-slate-950 text-white text-sm font-bold hover:bg-emerald-900 transition-colors whitespace-nowrap"
          >
            Reserve Print Retainer
          </button>
        </div>

        {booked && (
          <p role="status" className="mt-6 text-sm font-bold text-emerald-950 bg-white rounded-lg px-4 py-2.5">
            Print floor slot reserved at $399/mo.
          </p>
        )}
      </div>
    </section>
  );
}
