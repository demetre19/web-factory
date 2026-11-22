import { useState } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';

/**
 * Hero11 — Centered Headline + Elevated Vector Telemetry Frame (Style: Dark)
 * Brand: Chronicle Telemetry (Industrial & Grid Sensor Observability)
 */
export function Hero11() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [regionTab, setRegionTab] = useState<'eu-west' | 'us-east' | 'ap-south'>('eu-west');
  const [sandboxReady, setSandboxReady] = useState(false);

  const metricsByRegion = {
    'eu-west': { ingest: '1.42M/s', latency: '4.1 ms', retention: '365 days', nodes: '4,820' },
    'us-east': { ingest: '2.18M/s', latency: '3.6 ms', retention: '365 days', nodes: '7,140' },
    'ap-south': { ingest: '940K/s', latency: '5.2 ms', retention: '365 days', nodes: '3,090' },
  };

  const active = metricsByRegion[regionTab];

  return (
    <div className="bg-[#0B0F17] text-slate-100 font-sans border-b border-slate-800">
      <header className="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between gap-8 border-b border-slate-800/80">
        <a
          href="#chronicle-top"
          className="text-lg font-semibold tracking-tight text-white whitespace-nowrap shrink-0"
        >
          Chronicle Telemetry
        </a>

        <nav aria-label="Chronicle primary" className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-400">
          <a href="#ingestion" className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            Time-Series Engine
          </a>
          <a href="#alerts" className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            Threshold Rules
          </a>
          <a href="#protocols" className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            MQTT &amp; OTel
          </a>
          <a href="#security" className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
            Compliance
          </a>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setSandboxReady((prev) => !prev)}
            className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-medium text-slate-950 bg-slate-100 rounded-md hover:bg-white transition-colors whitespace-nowrap shrink-0"
          >
            {sandboxReady ? 'Stream Active' : 'Open Live Console'}
          </button>
          <button
            type="button"
            aria-expanded={mobileOpen}
            aria-label="Toggle Chronicle navigation"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-md border border-slate-700 text-slate-200"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {mobileOpen && (
        <nav aria-label="Chronicle mobile" className="md:hidden px-6 py-4 bg-slate-900 border-b border-slate-800 flex flex-col gap-3 text-sm font-medium text-slate-300">
          <a href="#ingestion" onClick={() => setMobileOpen(false)} className="py-1.5">Time-Series Engine</a>
          <a href="#alerts" onClick={() => setMobileOpen(false)} className="py-1.5">Threshold Rules</a>
          <a href="#protocols" onClick={() => setMobileOpen(false)} className="py-1.5">MQTT &amp; OTel</a>
          <a href="#security" onClick={() => setMobileOpen(false)} className="py-1.5">Compliance</a>
        </nav>
      )}

      <section className="mx-auto max-w-6xl px-6 pt-20 pb-16">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-medium tracking-widest uppercase text-sky-400 mb-4">
            Sub-Millisecond Time-Series Storage · Edge-to-Cloud Sync
          </p>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-white leading-[1.08] [text-wrap:balance]">
            Query ten years of fleet telemetry in a single SQL pass
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Chronicle ingests high-frequency sensor frames over MQTT and OpenTelemetry, compresses them 18:1 on disk, and surfaces anomalies before hardware degrades.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setSandboxReady(true)}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-slate-950 bg-sky-400 rounded-md hover:bg-sky-300 transition-colors whitespace-nowrap shrink-0"
            >
              <span>{sandboxReady ? 'Sample Cluster Connected' : 'Launch Sample Cluster'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#benchmarks"
              className="inline-flex items-center px-6 py-3 text-sm font-semibold text-slate-200 border border-slate-700 rounded-md hover:border-slate-500 transition-colors whitespace-nowrap shrink-0"
            >
              Read Storage Whitepaper
            </a>
          </div>
        </div>

        {/* Structured Telemetry Preview Frame */}
        <div className="mt-14 rounded-lg border border-slate-800 bg-[#111827] p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-800">
            <p className="text-sm font-medium text-slate-200">
              Regional Ingestion Overview
            </p>

            <div className="flex items-center gap-1 p-1 rounded-md bg-slate-900 border border-slate-800">
              {(['eu-west', 'us-east', 'ap-south'] as const).map((region) => (
                <button
                  key={region}
                  type="button"
                  onClick={() => setRegionTab(region)}
                  className={`px-3 py-1 text-xs font-mono rounded transition-colors whitespace-nowrap ${
                    regionTab === region
                      ? 'bg-slate-800 text-white font-medium'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-xs text-slate-400">Frame Ingest Rate</p>
              <p className="mt-1 text-2xl font-mono font-semibold text-white tabular-nums">{active.ingest}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">p99 Query Latency</p>
              <p className="mt-1 text-2xl font-mono font-semibold text-white tabular-nums">{active.latency}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Hot Retention</p>
              <p className="mt-1 text-2xl font-mono font-semibold text-white tabular-nums">{active.retention}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Reporting Gateways</p>
              <p className="mt-1 text-2xl font-mono font-semibold text-white tabular-nums">{active.nodes}</p>
            </div>
          </div>

          {/* Crisp SVG Telemetry Curve */}
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <svg viewBox="0 0 800 110" className="w-full h-24 text-sky-400" role="img" aria-label="24-hour ingestion throughput line chart">
              <line x1="0" y1="28" x2="800" y2="28" stroke="#1E293B" strokeWidth="1" />
              <line x1="0" y1="68" x2="800" y2="68" stroke="#1E293B" strokeWidth="1" />
              <path
                d={
                  regionTab === 'eu-west'
                    ? 'M0 82 L80 74 L160 64 L240 69 L320 45 L400 50 L480 34 L560 40 L640 26 L720 31 L800 22'
                    : regionTab === 'us-east'
                    ? 'M0 78 L80 62 L160 58 L240 41 L320 36 L400 44 L480 24 L560 28 L640 18 L720 22 L800 16'
                    : 'M0 88 L80 80 L160 76 L240 72 L320 60 L400 63 L480 52 L560 48 L640 42 L720 45 L800 36'
                }
                fill="none"
                stroke="currentColor"
                strokeWidth="2.25"
              />
            </svg>
          </div>
        </div>
      </section>
    </div>
  );
}
